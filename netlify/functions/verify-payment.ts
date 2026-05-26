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
    const { paymentIntentId, userId } = JSON.parse(event.body || "{}");
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

    const updatedData = {
      abonnement: "payé",
      acces_membre: true,
      paiement: "validé",
      date_paiement: new Date().toISOString(),
    };

    // Update members table in Supabase bypass RLS
    const { data, error } = await supabaseAdmin
      .from("membres")
      .update(updatedData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Supabase service error admin:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Erreur de mise à jour dans Supabase", details: error.message }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, member: data }),
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
