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
  const roleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !roleKey || roleKey === "") {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not defined. Using local mock/direct updates.");
    return null;
  }
  if (!supabaseAdmin) {
    try {
      supabaseAdmin = createClient(url, roleKey, {
        auth: { persistSession: false }
      });
    } catch (e) {
      console.error("Failed to initialize Supabase Admin client:", e);
      return null;
    }
  }
  return supabaseAdmin;
}

// Helper to safely write members to 'membrehcon' without throwing Postgres column errors
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

      console.warn(`Upsert attempt ${attempts} on membrehcon failed:`, error.message);
      const msg = error.message || "";

      // Check if the conflict column itself is invalid as a key/constraint
      if (msg.includes("column") && msg.includes(currentMatchColumn)) {
        if (currentMatchColumn === "auth_user_id") {
          console.log("Switching conflict column from auth_user_id to id and retrying...");
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
        
        // If the stripped column was our current conflict column, switch to the other
        if (columnName === currentMatchColumn) {
          currentMatchColumn = currentMatchColumn === "auth_user_id" ? "id" : "auth_user_id";
        }
      } else {
        return { data: null, error };
      }
    } catch (e: any) {
      console.error("Exception in safeUpsertMembrehcon:", e);
      return { data: null, error: e };
    }
  }
  return { data: null, error: new Error("Too many retries trying to match table columns on membrehcon") };
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
      amount: 100, // 1 € in cents
      currency: "eur",
      description: "Abonnement Club Privé H-Conciergerie (1 an - 1€)",
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

// API Register Unpaid Member
app.post("/api/register-unpaid", async (req, res) => {
  try {
    const { userId, memberDetails } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "L'identifiant utilisateur est requis." });
    }

    const adminSb = getSupabaseAdmin();
    const unpaidData: any = {
      id: userId,
      abonnement: "non payé",
      acces_membre: false,
      paiement: "en attente"
    };

    if (memberDetails) {
      unpaidData.pseudo = memberDetails.pseudo;
      unpaidData.prenom = memberDetails.prenom;
      unpaidData.nom = memberDetails.nom;
      unpaidData.email = memberDetails.email;
      unpaidData.telephone = memberDetails.telephone;
      unpaidData.ville = memberDetails.ville;
      unpaidData.date_inscription = memberDetails.date_inscription || new Date().toISOString();
    }

    if (adminSb) {
      // Automatically add a row to the 'membrehcon' table with auth_user_id, id, email, full_name, etc.
      const candidatesPayload: any = {
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
        payment_status: "pending",
        access_status: "pending",
        paiement: "en attente",
        abonnement: "non payé",
        acces_membre: false,
        created_at: memberDetails?.date_inscription || new Date().toISOString()
      };

      console.log("Attempting to write to 'membrehcon' table with user:", userId);
      const { data, error } = await safeUpsertMembrehcon(adminSb, candidatesPayload, "auth_user_id");

      if (error) {
        console.error("Critical: 'membrehcon' table write failed:", error);
        return res.json({
          success: true,
          isSimulated: true,
          warning: "supabase_upsert_failed",
          details: `membrehcon: ${error.message || error.code || error}`,
          member: unpaidData
        });
      }
      
      const memberRecord = (data && data.length > 0) ? {
        id: data[0].id || data[0].auth_user_id || userId,
        nom: data[0].nom || memberDetails?.nom || "",
        prenom: data[0].prenom || memberDetails?.prenom || "",
        email: data[0].email || memberDetails?.email || "",
        telephone: data[0].telephone || data[0].phone || memberDetails?.telephone || "",
        ville: data[0].ville || data[0].city || memberDetails?.ville || "",
        pseudo: data[0].pseudo || memberDetails?.pseudo || "",
        abonnement: data[0].abonnement || "non payé",
        acces_membre: data[0].acces_membre ?? false,
        paiement: data[0].paiement || "en attente",
        date_inscription: data[0].created_at || new Date().toLocaleDateString("fr-FR"),
        payment_status: data[0].payment_status || "pending",
        access_status: data[0].access_status || "pending"
      } : unpaidData;

      return res.json({ success: true, member: memberRecord });
    } else {
      return res.json({
        success: true,
        isSimulated: true,
        member: unpaidData
      });
    }
  } catch (error: any) {
    console.error("Exception in register-unpaid:", error);
    res.status(500).json({ error: error.message || "Erreur interne lors de l'enregistrement." });
  }
});

// API Verify/Finalize Payment
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { paymentIntentId, userId, isSimulated, memberDetails } = req.body;
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
      const updatedData: any = {
        id: userId,
        abonnement: "payé",
        acces_membre: true,
        paiement: "validé",
        date_paiement: new Date().toISOString()
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

      if (adminSb) {
        console.log("Attempting payment update for user on 'membrehcon' table:", userId);

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

        const { data, error } = await safeUpsertMembrehcon(adminSb, membersPaidData, "auth_user_id");

        if (error) {
          console.error("Critical: 'membrehcon' table update failed in verify-payment:", error);
          return res.json({ 
            success: true, 
            isSimulated: true, 
            warning: "supabase_upsert_failed",
            details: `membrehcon: ${error.message || error.code || error}`,
            member: {
              id: userId,
              ...membersPaidData
            } 
          });
        }
        
        const memberRecord = (data && data.length > 0) ? {
          id: data[0].id || data[0].auth_user_id || userId,
          nom: data[0].nom || memberDetails?.nom || "",
          prenom: data[0].prenom || memberDetails?.prenom || "",
          email: data[0].email || memberDetails?.email || "",
          telephone: data[0].telephone || data[0].phone || memberDetails?.telephone || "",
          ville: data[0].ville || data[0].city || memberDetails?.ville || "",
          pseudo: data[0].pseudo || memberDetails?.pseudo || "",
          abonnement: data[0].abonnement || "non payé",
          acces_membre: data[0].acces_membre ?? false,
          paiement: data[0].paiement || "payé",
          date_inscription: data[0].created_at || new Date().toLocaleDateString("fr-FR"),
          payment_status: data[0].payment_status || "paid",
          access_status: data[0].access_status || "pending",
          subscription_expires_at: data[0].subscription_expires_at
        } : { id: userId, ...membersPaidData };

        return res.json({ success: true, member: memberRecord });
      } else {
        // If Supabase Admin Client is missing, report success and let client update mock localStorage
        return res.json({
          success: true,
          isSimulated: true,
          member: {
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
