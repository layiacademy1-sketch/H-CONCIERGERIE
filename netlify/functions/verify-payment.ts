import { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

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

    const updatedData: any = {
      id: userId,
      abonnement: "payé",
      acces_membre: true,
      paiement: "validé",
      date_paiement: new Date().toISOString(),
    };

    if (memberDetails) {
      updatedData.pseudo = memberDetails.pseudo;
      updatedData.prenom = memberDetails.prenom;
      updatedData.nom = memberDetails.nom;
      updatedData.email = memberDetails.email;
      updatedData.telephone = memberDetails.telephone;
      updatedData.ville = memberDetails.ville;
      updatedData.date_inscription = memberDetails.date_inscription || new Date().toISOString();
    }

    // Upsert members table in Supabase bypass RLS
    const { data, error } = await supabaseAdmin
      .from("membres")
      .upsert(updatedData, { onConflict: "id" })
      .select();

    // Also update the 'members' table if it exists
    const membersPaidData = {
      auth_user_id: userId,
      email: memberDetails?.email || "",
      full_name: memberDetails ? `${memberDetails.prenom || ""} ${memberDetails.nom || ""}`.trim() : "",
      phone: memberDetails?.telephone || "",
      payment_status: "paid",
      access_status: "active"
    };

    console.log("Updating 'members' table on Netlify verify-payment for user:", userId);
    const { error: membersErr } = await supabaseAdmin
      .from("members")
      .upsert(membersPaidData, { onConflict: "auth_user_id" });

    if (membersErr) {
      console.warn("Could not update 'members' table in Netlify payment validation, continuing:", membersErr.message);
    }

    if (error) {
      console.error("Supabase service error admin, conversion en simulation locale:", error);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          isSimulated: true, 
          warning: "supabase_upsert_failed",
          details: error.message,
          code: error.code,
          member: updatedData 
        }),
      };
    }

    const memberRecord = (data && data.length > 0) ? data[0] : updatedData;

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
