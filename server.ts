import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Load local environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialization of Stripe and Supabase Admin clients to avoid crashes on startup
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "placeholder-key" || key === "") {
    console.warn("STRIPE_SECRET_KEY is not defined. Using payment simulation fallback.");
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, { apiVersion: "2023-10-16" as any });
  }
  return stripeClient;
}

let supabaseAdmin: any = null;
function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const roleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !roleKey || roleKey === "") {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not defined. Using local mock/direct updates.");
    return null;
  }
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(url, roleKey, {
      auth: { persistSession: false }
    });
  }
  return supabaseAdmin;
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API Create Payment Intent
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "L'identifiant utilisateur est requis." });
    }

    const stripe = getStripe();
    if (!stripe) {
      // Return simulated success credentials when key is missing to enable simulation mode in preview
      return res.json({
        clientSecret: "pi_simulated_secret_12345",
        isSimulated: true
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 36500, // 365 € in cents
      currency: "eur",
      description: "Abonnement Club Privé H-Conciergerie (1 an - 365€)",
      metadata: {
        userId,
        email: email || ""
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret, isSimulated: false });
  } catch (error: any) {
    console.error("Exception in create-payment-intent:", error);
    res.status(500).json({ error: error.message || "Erreur lors de la création de la transaction." });
  }
});

// API Verify/Finalize Payment
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { paymentIntentId, userId, isSimulated } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "L'identifiant utilisateur est requis." });
    }

    // Process payment success variables
    let paymentSuccess = false;

    if (isSimulated || !paymentIntentId || paymentIntentId.startsWith("pi_simulated")) {
      paymentSuccess = true;
    } else {
      const stripe = getStripe();
      if (stripe) {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status === "succeeded") {
          paymentSuccess = true;
        }
      } else {
        paymentSuccess = true; // Fallback simulation if no stripe client
      }
    }

    if (paymentSuccess) {
      const adminSb = getSupabaseAdmin();
      const updatedData = {
        abonnement: "payé",
        acces_membre: true,
        paiement: "validé",
        date_paiement: new Date().toISOString()
      };

      if (adminSb) {
        // Securely update the user record with bypassing RLS (via Service Role)
        const { data, error } = await adminSb
          .from("membres")
          .update(updatedData)
          .eq("id", userId)
          .select()
          .single();

        if (error) {
          console.error("Supabase Admin Update Error:", error);
          return res.status(500).json({ error: "Erreur de mise à jour des privilèges dans Supabase.", details: error.message });
        }
        return res.json({ success: true, member: data });
      } else {
        // If Supabase Admin Client is missing, report success and let client update mock localStorage
        return res.json({
          success: true,
          isSimulated: true,
          member: {
            id: userId,
            ...updatedData
          }
        });
      }
    } else {
      return res.status(400).json({ error: "Le paiement Stripe n'a pas pu être validé." });
    }
  } catch (error: any) {
    console.error("Exception in verify-payment:", error);
    res.status(500).json({ error: error.message || "Erreur interne lors de la vérification." });
  }
});

async function run() {
  // Vite setup for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

run();
