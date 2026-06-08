import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeFirestore, terminate, collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";

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

// Firebase Firestore Integration Utility
function getFirestoreInstance() {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      let firebaseApp;
      if (getApps().length === 0) {
        firebaseApp = initializeApp(configData);
      } else {
        firebaseApp = getApp();
      }
      return initializeFirestore(firebaseApp, {
        experimentalForceLongPolling: true,
      }, configData.firestoreDatabaseId);
    }
  } catch (error) {
    console.error("Failed to get Firestore instance:", error);
  }
  return null;
}

// Helper to load raw local members
function getLocalMembers(): MemberRecord[] {
  if (!fs.existsSync(MEMBERS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(MEMBERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper to save raw local members
function saveLocalMembers(members: MemberRecord[]) {
  try {
    fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing members local file:", err);
  }
}

// Synchronize all Firestore records to local cache on initial system startup
async function syncFromFirestore() {
  const db = getFirestoreInstance();
  if (!db) {
    console.log("Firestore configuration not found. Skipping Firestore sync.");
    return;
  }
  try {
    console.log("Syncing members from Google Firestore...");
    const querySnapshot = await getDocs(collection(db, "members"));
    const firestoreMembers: MemberRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      firestoreMembers.push(docSnap.data() as MemberRecord);
    });

    if (firestoreMembers.length > 0) {
      const localMembers = getLocalMembers();
      const localMap = new Map(localMembers.map(m => [m.id, m]));
      firestoreMembers.forEach(fm => {
        localMap.set(fm.id, fm);
      });
      const merged = Array.from(localMap.values());
      saveLocalMembers(merged);
      console.log(`Successfully imported ${firestoreMembers.length} records from Firestore.`);
    } else {
      // First-time seeding Firestore from existing local database
      const localMembers = getLocalMembers();
      for (const lm of localMembers) {
        await setDoc(doc(db, "members", lm.id), lm);
      }
      console.log(`Seeded Firestore with ${localMembers.length} existing members.`);
    }
  } catch (error) {
    console.error("Failed to sync members with Firestore:", error);
  } finally {
    try {
      await terminate(db);
      console.log("Firestore connection terminated cleanly after synchronization.");
    } catch (e) {
      console.error("Error terminating Firestore:", e);
    }
  }
}

function ensureDataExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const defaultMember = {
    id: "karim-profile-active",
    nom: "",
    prenom: "Moeva",
    email: "tymoeva@gmail.com",
    telephone: "0659057528",
    ville: "",
    pseudo: "moeva",
    password: "comores",
    statut: "actif",
    abonnement: "actif",
    paiement: "payé",
    payment_status: "paid",
    access_status: "active",
    created_at: new Date().toISOString()
  };
  if (!fs.existsSync(MEMBERS_FILE)) {
    fs.writeFileSync(MEMBERS_FILE, JSON.stringify([defaultMember], null, 2), "utf-8");
  } else {
    try {
      const data = fs.readFileSync(MEMBERS_FILE, "utf-8");
      const list = JSON.parse(data);
      const hasKarim = list.some((m: any) => m.pseudo === "moeva" || m.pseudo === "karim" || m.id === "karim-profile-active");
      if (!hasKarim) {
        list.push(defaultMember);
        fs.writeFileSync(MEMBERS_FILE, JSON.stringify(list, null, 2), "utf-8");
      } else {
        const updatedList = list.map((m: any) => {
          if (m.pseudo === "karim" || m.pseudo === "moeva" || m.id === "karim-profile-active") {
            return {
              ...m,
              email: "tymoeva@gmail.com",
              telephone: "0659057528",
              nom: "",
              prenom: "Moeva",
              ville: "",
              pseudo: "moeva",
              statut: "actif",
              access_status: "active",
              abonnement: "actif",
              paiement: "payé",
              payment_status: "paid"
            };
          }
          return m;
        });
        fs.writeFileSync(MEMBERS_FILE, JSON.stringify(updatedList, null, 2), "utf-8");
      }
    } catch(e) {
      fs.writeFileSync(MEMBERS_FILE, JSON.stringify([defaultMember], null, 2), "utf-8");
    }
  }
}

function getMembers(): MemberRecord[] {
  ensureDataExists();
  return getLocalMembers();
}

function saveMembers(members: MemberRecord[]) {
  ensureDataExists();
  saveLocalMembers(members);
  
  // Simultaneously write to Google Firestore in background with dynamic connection termination
  const db = getFirestoreInstance();
  if (db) {
    Promise.all(
      members.map((member) => 
        setDoc(doc(db, "members", member.id), member)
      )
    )
      .then(async () => {
        console.log("Synchronized members batch to Google Firestore.");
        try {
          await terminate(db);
        } catch (e) {
          console.error("Error terminating connection in saveMembers:", e);
        }
      })
      .catch(async (err) => {
        console.error("Error uploading members batch to Google Firestore:", err);
        try {
          await terminate(db);
        } catch (e) {}
      });
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

    if ((cleanPseudo === "karim" || cleanPseudo === "moeva") && password === "comores") {
      return res.json({
        success: true,
        member: {
          id: "karim-profile-active",
          nom: "",
          prenom: "Moeva",
          email: "tymoeva@gmail.com",
          telephone: "0659057528",
          ville: "",
          pseudo: "moeva",
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
  // Sync from firestore first if available before starting server endpoints
  await syncFromFirestore();

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
