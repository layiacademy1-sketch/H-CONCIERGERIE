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
      console.log("Attempting base synchronization for user:", userId);
      
      let errorMembres: any = null;
      let dataMembres: any = null;
      try {
        const result = await adminSb
          .from("membres")
          .upsert(unpaidData, { onConflict: "id" })
          .select();
        errorMembres = result.error;
        dataMembres = result.data;
      } catch (e: any) {
        errorMembres = e;
      }

      // Automatically add a row to the 'members' table with auth_user_id, email, full_name, phone, payment_status="pending" and access_status="pending"
      const membersData = {
        auth_user_id: userId,
        email: memberDetails?.email || "",
        full_name: memberDetails ? `${memberDetails.prenom || ""} ${memberDetails.nom || ""}`.trim() : "",
        phone: memberDetails?.telephone || "",
        payment_status: "pending",
        access_status: "pending"
      };

      console.log("Attempting to write to 'members' table with user:", userId);
      let errorMembers: any = null;
      try {
        const result = await adminSb
          .from("members")
          .upsert(membersData, { onConflict: "auth_user_id" });
        errorMembers = result.error;
      } catch (e: any) {
        errorMembers = e;
      }

      // If BOTH failed to write, then we warn and return simulated mode.
      if (errorMembres && errorMembers) {
        console.error("Critical: Both 'membres' and 'members' table writes failed:", { errorMembres, errorMembers });
        return res.json({
          success: true,
          isSimulated: true,
          warning: "supabase_upsert_failed",
          details: `membres: ${errorMembres.message || errorMembres.code || errorMembres}, members: ${errorMembers?.message || errorMembers?.code || errorMembers}`,
          member: unpaidData
        });
      }

      if (errorMembres) {
        console.warn("Table 'membres' write failed (ignored as 'members' succeeded):", errorMembres.message || errorMembres);
      }
      if (errorMembers) {
        console.warn("Table 'members' write failed (ignored as 'membres' succeeded):", errorMembers.message || errorMembers);
      }
      
      const memberRecord = (dataMembres && dataMembres.length > 0) ? dataMembres[0] : unpaidData;
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
        console.log("Attempting payment update for user:", userId);
        
        let errorMembres: any = null;
        let dataMembres: any = null;
        try {
          const result = await adminSb
            .from("membres")
            .upsert(updatedData, { onConflict: "id" })
            .select();
          errorMembres = result.error;
          dataMembres = result.data;
        } catch (e: any) {
          errorMembres = e;
        }

        // Also update the 'members' table if it exists
        const membersPaidData = {
          auth_user_id: userId,
          email: memberDetails?.email || "",
          full_name: memberDetails ? `${memberDetails.prenom || ""} ${memberDetails.nom || ""}`.trim() : "",
          phone: memberDetails?.telephone || "",
          payment_status: "paid",
          access_status: "active"
        };
        console.log("Updating 'members' table on payment verification with user:", userId);
        let errorMembers: any = null;
        try {
          const result = await adminSb
            .from("members")
            .upsert(membersPaidData, { onConflict: "auth_user_id" });
          errorMembers = result.error;
        } catch (e: any) {
          errorMembers = e;
        }

        // If BOTH failed, then we show/return simulation fallback
        if (errorMembres && errorMembers) {
          console.error("Critical: Both 'membres' and 'members' table updates failed:", { errorMembres, errorMembers });
          
          return res.json({ 
            success: true, 
            isSimulated: true, 
            warning: "supabase_upsert_failed",
            details: `membres: ${errorMembres.message || errorMembres.code || errorMembres}, members: ${errorMembers?.message || errorMembers?.code || errorMembers}`,
            member: updatedData 
          });
        }

        if (errorMembres) {
          console.warn("Table 'membres' update failed (ignored as 'members' succeeded):", errorMembres.message || errorMembres);
        }
        if (errorMembers) {
          console.warn("Table 'members' update failed (ignored as 'membres' succeeded):", errorMembers.message || errorMembers);
        }
        
        const memberRecord = (dataMembres && dataMembres.length > 0) ? dataMembres[0] : updatedData;
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
