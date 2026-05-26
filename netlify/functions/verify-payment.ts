import { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

// Helper to safely write members without throwing Postgres column errors
async function safeUpsertMembrehcon(supabaseClient: any, payload: any, primaryMatchColumn: string = "auth_user_id") {
  let currentPayload = { ...payload };
  let currentMatchColumn = primaryMatchColumn;
  let attempts = 0;
  while (attempts < 20) {
    attempts++;
    try {
      const { data, error } = await supabaseClient
        .from("membrehcon")
        .upsert(currentPayload, { onConflict: currentMatchColumn })
        .select();
      
      if (!error) {
        return { data, error: null };
      }

      console.warn(`Upsert attempt ${attempts} on membrehcon failed on Netlify verify-payment:`, error.message);
      const msg = error.message || "";

      if (msg.includes("column") && msg.includes(currentMatchColumn)) {
        if (currentMatchColumn === "auth_user_id") {
          console.log("Switching conflict column from auth_user_id to id and retrying on Netlify...");
          currentMatchColumn = "id";
          continue;
        }
      }

      let columnMatch = msg.match(/column "([^"]+)"/i);
      if (!columnMatch) {
        columnMatch = msg.match(/has no column named "([^"]+)"/i);
      }
      if (!columnMatch) {
        columnMatch = msg.match(/column_name "([^"]+)"/i);
      }

      if (columnMatch && columnMatch[1]) {
        const columnName = columnMatch[1];
        console.log(`Removing non-existent column '${columnName}' from payload and retrying...`);
        delete currentPayload[columnName];

        if (columnName === currentMatchColumn) {
          currentMatchColumn = currentMatchColumn === "auth_user_id" ? "id" : "auth_user_id";
        }
      } else {
        return { data: null, error };
      }
    } catch (e: any) {
      console.error("Exception in safeUpsertMembrehcon on Netlify:", e);
      return { data: null, error: e };
    }
  }
  return { data: null, error: new Error("Too many retries trying to match table columns on Netlify") };
}

export const handler: Handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Méthode non autorisée" }),
    };
  }

  try {
    const { paymentIntentId, userId, memberDetails } = JSON.parse(event.body || "{}");
    if (!userId || !paymentIntentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "userId et paymentIntentId requis." }),
      };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "STRIPE_SECRET_KEY non configurée" }),
      };
    }

    // Retrieve payment intent to verify state from Stripe side
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Paiement invalide: statut ${paymentIntent.status}` }),
      };
    }

    // Initialize Supabase Admin with Service Role Key
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante sur Netlify." }),
      };
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 1);

    const membersPaidData: any = {
      id: userId,
      auth_user_id: userId,
      email: memberDetails?.email || "",
      full_name: memberDetails ? `${memberDetails.prenom || ""} ${memberDetails.nom || ""}`.trim() : "",
      phone: memberDetails?.telephone || "",
      telephone: memberDetails?.telephone || "",
      prenom: memberDetails?.prenom || "",
      nom: memberDetails?.nom || "",
      first_name: memberDetails?.prenom || "",
      last_name: memberDetails?.nom || "",
      city: memberDetails?.ville || "",
      ville: memberDetails?.ville || "",
      pseudo: memberDetails?.pseudo || "",
      payment_status: "paid",
      // keep pending as requested until admin validates to 'active'
      access_status: "pending", 
      paiement: "payé",
      abonnement: "non payé", // will be 'actif' once admin activates
      acces_membre: false,
      subscription_expires_at: expDate.toISOString(),
      created_at: memberDetails?.date_inscription || new Date().toISOString()
    };

    console.log("Updating 'membrehcon' table on Netlify verify-payment with user:", userId);
    const { data: mData, error: mError } = await safeUpsertMembrehcon(supabaseAdmin, membersPaidData, "auth_user_id");

    if (mError) {
      console.error("Critical: 'membrehcon' table update failed on Netlify verify-payment:", mError);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          isSimulated: true, 
          warning: "supabase_upsert_failed",
          details: `membrehcon: ${mError.message || mError.code || mError}`,
          member: {
            id: userId,
            ...membersPaidData
          } 
        }),
      };
    }
    
    const memberRecord = (mData && mData.length > 0) ? {
      id: mData[0].id || mData[0].auth_user_id || userId,
      nom: mData[0].nom || memberDetails?.nom || "",
      prenom: mData[0].prenom || memberDetails?.prenom || "",
      email: mData[0].email || memberDetails?.email || "",
      telephone: mData[0].telephone || mData[0].phone || memberDetails?.telephone || "",
      ville: mData[0].ville || mData[0].city || memberDetails?.ville || "",
      pseudo: mData[0].pseudo || memberDetails?.pseudo || "",
      abonnement: mData[0].abonnement || "non payé",
      acces_membre: mData[0].acces_membre ?? false,
      paiement: mData[0].paiement || "payé",
      date_inscription: mData[0].created_at || new Date().toLocaleDateString("fr-FR"),
      payment_status: mData[0].payment_status || "paid",
      access_status: mData[0].access_status || "pending",
      subscription_expires_at: mData[0].subscription_expires_at
    } : { id: userId, ...membersPaidData };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, member: memberRecord }),
    };
  } catch (error: any) {
    console.error("Netlify verification error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Erreur lors de la vérification de paiement." }),
    };
  }
};
