import { Handler } from "@netlify/functions";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

export const handler: Handler = async (event, context) => {
  // CORS Headers
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
    const { userId, email } = JSON.parse(event.body || "{}");
    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "L'identifiant utilisateur est requis." }),
      };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "STRIPE_SECRET_KEY non configurée sur Netlify" }),
      };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // 1 € in cents
      currency: "eur",
      description: "Abonnement Club Privé H-Conciergerie (1 an - 1€)",
      metadata: {
        userId,
        email: email || "",
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret, isSimulated: false }),
    };
  } catch (error: any) {
    console.error("Netlify function stripe error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Erreur lors de la transaction." }),
    };
  }
};
