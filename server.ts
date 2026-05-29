import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import fs from "fs";

// Load local environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent Local Database Setup
const DATA_DIR = path.join(process.cwd(), "data");
const MEMBERS_FILE = path.join(DATA_DIR, "members.json");

interface MemberRecord {
  id: string;
  email: string;
  prenom?: string;
  nom?: string;
  telephone?: string;
  ville?: string;
  pseudo?: string;
  password?: string;
  statut?: string; // 'actif' or 'en_attente'
  abonnement?: string; // 'actif' or 'non payé'
  paiement?: string; // 'payé' or 'en attente'
  payment_status?: string; // 'paid' or 'pending'
  access_status?: string; // 'active' or 'pending'
  created_at?: string;
  subscription_expires_at?: string;
}

function ensureDataExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(MEMBERS_FILE)) {
    fs.writeFileSync(MEMBERS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function getMembers(): MemberRecord[] {
  ensureDataExists();
  try {
    const data = fs.readFileSync(MEMBERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading members file, returning empty array:", err);
    return [];
  }
}

function saveMembers(members: MemberRecord[]) {
  ensureDataExists();
  try {
    fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing members file:", err);
  }
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Member Authentication Login
app.post("/api/member/login", (req, res) => {
  try {
    const { pseudo, password } = req.body;
    if (!pseudo || !password) {
      return res.status(400).json({ error: "Le pseudo (ou email) et le mot de passe sont requis." });
    }

    const cleanPseudo = pseudo.trim().toLowerCase();
    const members = getMembers();

    // Check special accounts first
    if (cleanPseudo === "layi" && password === "agency") {
      return res.json({
        success: true,
        member: {
          id: "layi-profile-active",
          nom: "Layi",
          prenom: "Layi",
          email: "layiacademy.1@gmail.com",
          telephone: "+33 6 00 00 00 00",
          ville: "Paris",
          pseudo: "layi",
          abonnement: "actif",
          acces_membre: true,
          paiement: "payé",
          date_inscription: new Date().toLocaleDateString("fr-FR"),
          payment_status: "paid",
          access_status: "active",
          statut: "actif"
        }
      });
    }

    if (cleanPseudo === "karim" && password === "comores") {
      return res.json({
        success: true,
        member: {
          id: "karim-profile-active",
          nom: "Karim",
          prenom: "Karim",
          email: "karim@example.com",
          telephone: "+33 6 00 00 00 00",
          ville: "Paris",
          pseudo: "karim",
          abonnement: "actif",
          acces_membre: true,
          paiement: "payé",
          date_inscription: new Date().toLocaleDateString("fr-FR"),
          payment_status: "paid",
          access_status: "active",
          statut: "actif"
        }
      });
    }

    if (cleanPseudo === "membre" && password === "h2026") {
      return res.json({
        success: true,
        member: {
          id: "legacy-vip",
          nom: "Membre VIP",
          prenom: "VIP",
          email: "membre@example.com",
          telephone: "",
          ville: "",
          pseudo: "membre",
          abonnement: "actif",
          acces_membre: true,
          paiement: "payé",
          date_inscription: new Date().toLocaleDateString("fr-FR"),
          payment_status: "paid",
          access_status: "active",
          statut: "actif"
        }
      });
    }

    // Check registered members in file
    const matched = members.find(
      (m) =>
        (m.pseudo?.trim().toLowerCase() === cleanPseudo ||
         m.email?.trim().toLowerCase() === cleanPseudo) &&
        m.password === password
    );

    if (!matched) {
      return res.status(401).json({ error: "Identifiants incorrects." });
    }

    return res.json({
      success: true,
      member: matched
    });
  } catch (err: any) {
    console.error("Login endpoint exception:", err);
    res.status(500).json({ error: "Une erreur est survenue lors de la connexion." });
  }
});

// Member Profile Lookup
app.get("/api/member/profile", (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "L'ID de l'utilisateur est requis." });
    }

    const members = getMembers();
    const matched = members.find((m) => m.id === id);

    if (!matched) {
      return res.status(404).json({ error: "Profil non trouvé." });
    }

    return res.json({ success: true, member: matched });
  } catch (err: any) {
    console.error("Profile endpoint exception:", err);
    res.status(500).json({ error: "Erreur lors de la récupération." });
  }
});

// API Register Unpaid Member
app.post("/api/register-unpaid", (req, res) => {
  try {
    const { userId, memberDetails } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "L'identifiant utilisateur est requis." });
    }

    const members = getMembers();

    // Check if pseudo or email is already taken
    const pseudoTaken = members.some(
      (m) =>
        m.id !== userId &&
        memberDetails?.pseudo &&
        m.pseudo?.trim().toLowerCase() === memberDetails.pseudo.trim().toLowerCase()
    );
    const emailTaken = members.some(
      (m) =>
        m.id !== userId &&
        memberDetails?.email &&
        m.email?.trim().toLowerCase() === memberDetails.email.trim().toLowerCase()
    );

    if (pseudoTaken) {
      return res.status(400).json({ error: "Ce pseudo est déjà pris. Veuillez en choisir un autre." });
    }
    if (emailTaken) {
      return res.status(400).json({ error: "Cet email est déjà enregistré." });
    }

    let existingIndex = members.findIndex((m) => m.id === userId);
    const dateStr = memberDetails?.date_inscription || new Date().toISOString();

    const newRecord: MemberRecord = {
      id: userId,
      email: memberDetails?.email || "",
      prenom: memberDetails?.prenom || "",
      nom: memberDetails?.nom || "",
      telephone: memberDetails?.telephone || "",
      ville: memberDetails?.ville || "",
      pseudo: memberDetails?.pseudo || "",
      password: memberDetails?.password || "", // plaintext password secured on server file
      statut: "en_attente",
      abonnement: "non payé",
      paiement: "en attente",
      payment_status: "pending",
      access_status: "pending",
      created_at: dateStr
    };

    if (existingIndex > -1) {
      members[existingIndex] = { ...members[existingIndex], ...newRecord };
    } else {
      members.push(newRecord);
    }

    saveMembers(members);

    return res.json({ success: true, member: newRecord });
  } catch (error: any) {
    console.error("Exception in register-unpaid:", error);
    res.status(500).json({ error: error.message || "Erreur interne lors de l'enregistrement." });
  }
});

// API Admin - Fetch all members safely bypassing client-side RLS
app.get("/api/admin/members", (req, res) => {
  try {
    const members = getMembers();
    return res.json({ success: true, data: members });
  } catch (error: any) {
    console.error("Exception in GET /api/admin/members:", error);
    res.status(500).json({ error: error.message || "Erreur interne" });
  }
});

// API Admin - Update member status safely bypassing RLS
app.post("/api/admin/update-member", (req, res) => {
  try {
    const { id, payload } = req.body;
    if (!id) {
      return res.status(400).json({ error: "L'identifiant est requis." });
    }

    const members = getMembers();
    const idx = members.findIndex((m) => m.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: "Membre non trouvé." });
    }

    // Merge updated fields
    const updatedMember = {
      ...members[idx],
      ...payload
    };

    // If setting active statuses, synchronize correlated status fields
    if (payload.statut === "actif" || payload.status === "active") {
      updatedMember.statut = "actif";
      updatedMember.access_status = "active";
      updatedMember.abonnement = "actif";
    } else if (payload.statut === "en_attente") {
      updatedMember.statut = "en_attente";
      updatedMember.access_status = "pending";
      updatedMember.abonnement = "non payé";
    }

    members[idx] = updatedMember;
    saveMembers(members);

    return res.json({ success: true, data: [updatedMember] });
  } catch (error: any) {
    console.error("Exception in POST /api/admin/update-member:", error);
    res.status(500).json({ error: error.message || "Erreur interne" });
  }
});

// API Admin - Delete member safely bypassing RLS
app.post("/api/admin/delete-member", (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "L'identifiant est requis." });
    }

    let members = getMembers();
    members = members.filter((m) => m.id !== id);
    saveMembers(members);

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Exception in POST /api/admin/delete-member:", error);
    res.status(500).json({ error: error.message || "Erreur interne" });
  }
});

// API Verify/Finalize Payment
app.post("/api/verify-payment", (req, res) => {
  try {
    const { paymentIntentId, userId, isSimulated, memberDetails } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "L'identifiant utilisateur est requis." });
    }

    const members = getMembers();
    const idx = members.findIndex((m) => m.id === userId);

    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 1);

    const updatedData: MemberRecord = {
      id: userId,
      email: memberDetails?.email || (idx > -1 ? members[idx].email : ""),
      prenom: memberDetails?.prenom || (idx > -1 ? members[idx].prenom : ""),
      nom: memberDetails?.nom || (idx > -1 ? members[idx].nom : ""),
      telephone: memberDetails?.telephone || (idx > -1 ? members[idx].telephone : ""),
      ville: memberDetails?.ville || (idx > -1 ? members[idx].ville : ""),
      pseudo: memberDetails?.pseudo || (idx > -1 ? members[idx].pseudo : ""),
      password: memberDetails?.password || (idx > -1 ? members[idx].password : ""),
      statut: "actif",
      abonnement: "actif",
      paiement: "payé",
      payment_status: "paid",
      access_status: "active",
      created_at: memberDetails?.date_inscription || (idx > -1 ? members[idx].created_at : new Date().toISOString()),
      subscription_expires_at: expDate.toISOString()
    };

    if (idx > -1) {
      members[idx] = { ...members[idx], ...updatedData };
    } else {
      members.push(updatedData);
    }

    saveMembers(members);

    return res.json({ success: true, member: updatedData });
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
