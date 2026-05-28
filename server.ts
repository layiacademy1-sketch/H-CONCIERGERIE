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
let isAuthAdminDisabled = false;
function getSupabaseAdmin() {
  const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const roleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
                  process.env.VITE_SUPABASE_ANON_KEY || 
                  process.env.SUPABASE_ANON_KEY;
  if (!rawUrl || !roleKey || roleKey === "") {
    console.warn("No Supabase URL or Key found. Using local mock/direct updates.");
    return null;
  }
  
  // Sanitize the URL exactly as on client side to avoid 404s
  let cleanedUrl = rawUrl.trim();
  cleanedUrl = cleanedUrl.replace(/\/rest\/v1\/?$/, "");
  cleanedUrl = cleanedUrl.replace(/\/auth\/v1\/?$/, "");
  cleanedUrl = cleanedUrl.replace(/\/+$/, "");

  if (!supabaseAdmin) {
    try {
      supabaseAdmin = createClient(cleanedUrl, roleKey, {
        auth: { persistSession: false }
      });
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
      return null;
    }
  }
  return supabaseAdmin;
}

// Helper to extract a column name that caused a database schema error
function extractColumnFromErrorMessage(msg: string): string | null {
  if (!msg) return null;

  // 1. "Could not find the 'column_name' column of 'table' in the schema cache"
  let match = msg.match(/Could not find the '([^']+)' column/i);
  if (match) return match[1];

  // 2. "'column_name' column"
  match = msg.match(/'([^']+)' column/i);
  if (match) return match[1];

  // 3. "column 'column_name'"
  match = msg.match(/column '([^']+)'/i);
  if (match) return match[1];

  // 4. "column "column_name""
  match = msg.match(/column "([^"]+)"/i);
  if (match) return match[1];

  // 5. "has no column named 'column_name'" or "has no column named "column_name""
  match = msg.match(/has no column named ['"]([^'"]+)['"]/i);
  if (match) return match[1];

  // 6. "column_name 'column_name'" or "column_name "column_name""
  match = msg.match(/column_name ['"]([^'"]+)['"]/i);
  if (match) return match[1];

  return null;
}

// Helper to safely write members to 'membrehcon' without throwing Postgres column errors
async function safeUpsertMembrehcon(supabaseClient: any, payload: any, primaryMatchColumn: string = "id") {
  let currentPayload = { ...payload };
  let currentMatchColumn = primaryMatchColumn;
  let attempts = 0;
  while (attempts < 25) {
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

      // Fallback on conflict constraint mismatches
      if (
        msg.toLowerCase().includes("unique or exclusion constraint") ||
        msg.toLowerCase().includes("on conflict") ||
        msg.toLowerCase().includes("conflict target") ||
        msg.toLowerCase().includes("pk") ||
        msg.toLowerCase().includes("primary key")
      ) {
        if (currentMatchColumn === "id") {
          console.log("ON CONFLICT failure with 'id', retrying with 'auth_user_id'...");
          currentMatchColumn = "auth_user_id";
          continue;
        } else if (currentMatchColumn === "auth_user_id") {
          console.log("ON CONFLICT failure with 'auth_user_id', retrying with 'email'...");
          currentMatchColumn = "email";
          continue;
        }
      }

      const columnName = extractColumnFromErrorMessage(msg);
      if (columnName) {
        console.log(`Removing non-existent column '${columnName}' from payload and retrying...`);
        delete currentPayload[columnName];
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
      // Automatically add a row to the 'membrehcon' table with strictly existing columns
      const candidatesPayload: any = {
        id: userId,
        email: memberDetails?.email || "",
        prenom: memberDetails?.prenom || "",
        nom: memberDetails?.nom || "",
        telephone: memberDetails?.telephone || "",
        ville: memberDetails?.ville || "",
        statut: "en_attente",
        created_at: memberDetails?.date_inscription || new Date().toISOString()
      };

      console.log("Attempting to write to 'membrehcon' table with user:", userId);
      const { data, error } = await safeUpsertMembrehcon(adminSb, candidatesPayload, "id");

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
        id: data[0].id || userId,
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

// API Admin - Fetch all members safely bypassing client-side RLS
app.get("/api/admin/members", async (req, res) => {
  try {
    const adminSb = getSupabaseAdmin();
    if (!adminSb) {
      return res.json({ success: true, isSimulated: true, data: [] });
    }

    // Fetch existing rows from the membrehcon table as requested
    const { data: registeredMembers, error } = await adminSb
      .from("membrehcon")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error in GET /api/admin/members fetching membrehcon:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true, data: registeredMembers || [] });
  } catch (error: any) {
    console.error("Exception in GET /api/admin/members:", error);
    res.status(500).json({ error: error.message || "Erreur interne" });
  }
});

// API Admin - Update member status safely bypassing RLS
app.post("/api/admin/update-member", async (req, res) => {
  try {
    const { id, payload } = req.body;
    if (!id) {
      return res.status(400).json({ error: "L'identifiant est requis." });
    }

    const adminSb = getSupabaseAdmin();
    if (!adminSb) {
      return res.json({ success: true, isSimulated: true });
    }

    // Filter payload to contain only existing columns in the table 'membrehcon'
    const cleanPayload: any = {};
    const allowedColumns = ["id", "email", "nom", "prenom", "telephone", "ville", "statut", "created_at"];
    for (const col of allowedColumns) {
      if (payload && payload[col] !== undefined) {
        cleanPayload[col] = payload[col];
      }
    }

    // Try updating by id using safeUpdate logic
    let currentPayload = { ...cleanPayload };
    let attempts = 0;
    while (attempts < 15) {
      attempts++;
      const { data, error } = await adminSb
        .from("membrehcon")
        .update(currentPayload)
        .eq("id", id)
        .select();

      if (!error) {
        return res.json({ success: true, data });
      }

      console.warn(`Admin update attempt ${attempts} failed:`, error.message);
      const msg = error.message || "";
      const columnName = extractColumnFromErrorMessage(msg);

      if (columnName) {
        console.log(`Removing non-existent column '${columnName}' from payload and retrying...`);
        delete currentPayload[columnName];
      } else {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(500).json({ error: "Trop de tentatives de suppression de colonnes non existantes." });
  } catch (error: any) {
    console.error("Exception in POST /api/admin/update-member:", error);
    res.status(500).json({ error: error.message || "Erreur interne" });
  }
});

// API Admin - Delete member safely bypassing RLS
app.post("/api/admin/delete-member", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "L'identifiant est requis." });
    }

    const adminSb = getSupabaseAdmin();
    if (!adminSb) {
      return res.json({ success: true, isSimulated: true });
    }

    const { error } = await adminSb
      .from("membrehcon")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error in delete member:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Exception in POST /api/admin/delete-member:", error);
    res.status(500).json({ error: error.message || "Erreur interne" });
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
          email: memberDetails?.email || "",
          prenom: memberDetails?.prenom || "",
          nom: memberDetails?.nom || "",
          telephone: memberDetails?.telephone || "",
          ville: memberDetails?.ville || "",
          statut: "en_attente",
          created_at: memberDetails?.date_inscription || new Date().toISOString()
        };

        const { data, error } = await safeUpsertMembrehcon(adminSb, membersPaidData, "id");

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
          id: data[0].id || userId,
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
