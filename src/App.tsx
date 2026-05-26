import Header from "./components/Header";
import Hero from "./components/Hero";
import Advantages from "./components/Advantages";
import About from "./components/About";
import FinalCTA from "./components/FinalCTA";
import Preloader from "./components/Preloader";
import LuxuryHotelsPage from "./components/LuxuryHotelsPage";
import CarRentalPage from "./components/CarRentalPage";
import MemberPresentation from "./components/MemberPresentation";
import MemberDashboard from "./components/MemberDashboard";
import AdminDashboard from "./components/AdminDashboard";
import WhatsAppButton from "./components/WhatsAppButton";
import { motion, useScroll, useSpring, AnimatePresence } from "motion/react";
import React, { useState, useEffect } from "react";
import { Lock, X, Eye, EyeOff, ShieldCheck, CreditCard, Clock } from "lucide-react";
import { auth, db } from "./firebase";
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"home" | "hotels" | "cars" | "devenir-membre" | "espace-membre" | "admin" | "connexion" | "success" | "cancel">("home");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Firebase states
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [memberData, setMemberData] = useState<any>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [signUpError, setSignUpError] = useState("");
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);

  // Client states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [registeredMembers, setRegisteredMembers] = useState<Array<{ name: string; city: string; job: string }>>([]);

  // Login Form States (pseudo corresponds to email, password to password)
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Admin Login Form States
  const [adminPseudo, setAdminPseudo] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminShowPassword, setAdminShowPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState("");

  // Subscribe to Firebase Authentication state & Firestore user document snapshot
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        const docRef = doc(db, "members", user.uid);
        const unsubDoc = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setMemberData(data);
            setIsLoggedIn(true);
          } else {
            setMemberData(null);
            setIsLoggedIn(false);
          }
          setFirebaseLoading(false);
        }, (err) => {
          console.error("Firestore onSnapshot error:", err);
          setFirebaseLoading(false);
        });
        return () => {
          unsubDoc();
        };
      } else {
        setMemberData(null);
        setIsLoggedIn(false);
        setFirebaseLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Set up Admin session on mount
  useEffect(() => {
    const adminSessionAuth = localStorage.getItem("h_admin_auth");
    if (adminSessionAuth === "true") {
      setIsAdminLoggedIn(true);
    }

    const saved = localStorage.getItem("h_members_custom");
    if (saved) {
      try {
        setRegisteredMembers(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Handle simulated auto-activation on success callback view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSimulated = params.get("simulated") === "true";
    const status_uid = params.get("uid");
    
    if (isSimulated && status_uid && view === "success") {
      const updateStatus = async () => {
        try {
          const docRef = doc(db, "members", status_uid);
          await setDoc(docRef, {
            status: "membre_actif",
            date_paiement: new Date().toLocaleDateString("fr-FR"),
            montant_paye: 365,
            stripe_session_id: params.get("session_id") || "mock_session",
            abonnement: "annuel"
          }, { merge: true });
        } catch (e) {
          console.error("Error setting simulated active status:", e);
        }
      };
      updateStatus();
    }
  }, [view]);

  // Handle initial view resolution from URL ?view= query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialView = params.get("view");
    if (
      initialView === "hotels" || 
      initialView === "cars" || 
      initialView === "devenir-membre" || 
      initialView === "espace-membre" || 
      initialView === "admin" ||
      initialView === "connexion" ||
      initialView === "success" ||
      initialView === "cancel"
    ) {
      setView(initialView as any);
    }
  }, []);

  // Update URL search parameters when view state changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (view === "home") {
      params.delete("view");
    } else {
      params.set("view", view);
    }
    const newRelativePathQuery = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [view]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Form submission callback for new members
  const handleRegisterMember = (newMem: { name: string; city: string; job: string; phone?: string; email?: string }) => {
    const updated = [newMem, ...registeredMembers];
    setRegisteredMembers(updated);
    localStorage.setItem("h_members_custom", JSON.stringify(updated));

    // Also push to global local members storage to keep synced
    const saved = localStorage.getItem("h_members");
    let currentSaved = [];
    if (saved) {
      try { currentSaved = JSON.parse(saved); } catch (e) {}
    }
    const merged = [
      {
        id: `custom-${Date.now()}`,
        name: newMem.name,
        city: newMem.city,
        job: newMem.job,
        phone: newMem.phone || "",
        email: newMem.email || "",
        dateJoined: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        status: "MEMBRE"
      },
      ...currentSaved
    ];
    localStorage.setItem("h_members", JSON.stringify(merged));
  };

  // Firebase sign-in handler
  const handleFirebaseLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      await signInWithEmailAndPassword(auth, pseudo.trim().toLowerCase(), password);
      setView("espace-membre");
      setPseudo("");
      setPassword("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Login error:", err);
      setLoginError("Adresse email ou mot de passe incorrect.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Logout error:", err);
    }
  };

  // Firebase Register / SignUp Submit handler
  const handleSignUpSubmit = async (formData: any) => {
    setSignUpError("");
    setIsSignUpLoading(true);

    try {
      // 1. Create firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2. Save member document in firestore with "en_attente_paiement" status
      const memberDocRef = doc(db, "members", user.uid);
      const memberPayload = {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: formData.lastName, // Write family name to comply with firestore rules schema!
        phone: formData.phone,
        email: formData.email,
        pseudo: formData.pseudo,
        status: "en_attente_paiement",
        date_joined: new Date().toLocaleDateString("fr-FR"),
      };

      // Implement a resilient retry loop to handle any short-term Auth token refresh propagation latency
      let retries = 3;
      let lastError: any = null;
      while (retries > 0) {
        try {
          await setDoc(memberDocRef, memberPayload);
          lastError = null;
          break;
        } catch (err: any) {
          lastError = err;
          console.warn(`Firestore setDoc connection attempt failed, retrying in 150ms... (${retries} retries remaining)`, err);
          await new Promise((resolve) => setTimeout(resolve, 150));
          retries--;
        }
      }

      if (lastError) {
        const { handleFirestoreError, OperationType } = await import("./firebase");
        handleFirestoreError(lastError, OperationType.CREATE, `members/${user.uid}`);
        return;
      }

      // Save locally to keep Admin synced too
      handleRegisterMember({
        name: `${formData.firstName} ${formData.lastName}`,
        city: "En attente",
        job: formData.pseudo,
        phone: formData.phone,
        email: formData.email,
      });

      // 3. Redirect automatically to the direct Stripe payment link
      window.location.href = "https://buy.stripe.com/3cIeVe9P715h9PLc7T7Re09";
    } catch (err: any) {
      console.error("SignUp error:", err);
      let errMsg = "Une erreur est survenue pendant l'inscription.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "Cette adresse email est déjà enregistrée. Veuillez utiliser une autre adresse ou vous connecter dans notre l'Espace Membre.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "L'adresse email saisie n'est pas valide.";
      } else if (err.message && (err.message.includes("permission-denied") || err.message.includes("permissions"))) {
        errMsg = "Erreur d'accréditation sécurisée (Firestore). Nos serveurs n'ont pas pu valider votre identité. Veuillez réessayer d'ici quelques instants.";
      } else {
        errMsg = err.message || errMsg;
      }
      setSignUpError(errMsg);
    } finally {
      setIsSignUpLoading(false);
    }
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPseudo.trim() === "admin" && adminPassword === "comores") {
      setAdminLoginError("");
      try {
        // Authenticate with Firebase first as admin@h-conciergerie.com
        try {
          await signInWithEmailAndPassword(auth, "admin@h-conciergerie.com", "comores");
        } catch (authError: any) {
          // If the admin user doesn't exist yet, seed it automatically
          if (
            authError.code === "auth/user-not-found" || 
            authError.code === "auth/invalid-credential" || 
            authError.message?.includes("INVALID_LOGIN_CREDENTIALS")
          ) {
            try {
              await createUserWithEmailAndPassword(auth, "admin@h-conciergerie.com", "comores");
            } catch (createError: any) {
              console.error("Admin seeding error:", createError);
            }
          } else {
            throw authError;
          }
        }

        setIsAdminLoggedIn(true);
        setAdminPseudo("");
        setAdminPassword("");
        localStorage.setItem("h_admin_auth", "true");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err: any) {
        console.error("Admin Auth Error:", err);
        setAdminLoginError("Erreur d'authentification serveur sécurisée.");
      }
    } else {
      setAdminLoginError("Identifiants incorrects. Pseudo : admin / MDP : comores");
    }
  };

  const handleAdminLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setIsAdminLoggedIn(false);
    localStorage.removeItem("h_admin_auth");
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-white selection:bg-gold selection:text-slate-900">
      <AnimatePresence>
        {isLoading && <Preloader />}
      </AnimatePresence>

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gold z-[60] origin-left"
        style={{ scaleX }}
      />

      <Header 
        view={view} 
        setView={setView} 
        onOpenLogin={() => {
          setView("connexion");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenAdmin={() => {
          setView("admin");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      
      <main className="overflow-x-hidden">
        <AnimatePresence mode="wait">
          {view === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Hero onDevenirMembre={() => {
                setView("devenir-membre");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} />
              <Advantages 
                onExploreHotels={() => {
                  setView("hotels");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} 
                onExploreCars={() => {
                  setView("cars");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
              <About />
              <FinalCTA />
            </motion.div>
          ) : view === "hotels" ? (
            <motion.div
              key="hotels"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <LuxuryHotelsPage onBack={() => {
                setView("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} />
            </motion.div>
          ) : view === "cars" ? (
            <motion.div
              key="cars"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <CarRentalPage onBack={() => {
                setView("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} />
            </motion.div>
          ) : view === "devenir-membre" ? (
            <motion.div
              key="devenir-membre"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MemberPresentation 
                onBack={() => {
                  setView("home");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onSubmitMember={handleRegisterMember}
                onSignUpSubmit={handleSignUpSubmit}
                isLoading={isSignUpLoading}
                signUpError={signUpError}
              />
            </motion.div>
          ) : view === "espace-membre" ? (
            <motion.div
              key="espace-membre"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isLoggedIn ? (
                !memberData ? (
                  <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                      <span className="text-xs uppercase font-bold tracking-widest text-gold text-center">Chargement de votre accréditation...</span>
                    </div>
                  </div>
                ) : memberData?.status === "membre_actif" ? (
                  <MemberDashboard onLogout={handleLogout} memberData={memberData} />
                ) : memberData?.status === "expiré" ? (
                  <div className="min-h-screen bg-slate-950 text-white pt-32 pb-24 flex items-center justify-center p-6">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full filter blur-xl pointer-events-none" />
                      
                      <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto scale-110">
                        <Lock size={28} />
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-2xl font-serif text-white uppercase tracking-wide">Accréditation Expirée</h2>
                        <div className="bg-rose-500/10 border border-rose-500/20 font-black tracking-widest text-[9px] uppercase px-3 py-1 rounded-full text-rose-400 inline-block">
                          Statut : Compte Expiré
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Bonjour <strong>{memberData?.firstName}</strong>. Votre inscription annuelle d'exception à H-Conciergerie a expiré. <br/><br/>
                        Afin de pouvoir ré-activer vos accès privilégiés 24/7, veuillez renouveler votre cotisation de <strong>365 €</strong> via notre lien Stripe sécurisé.
                      </p>

                      <div className="pt-2 space-y-3">
                        <a
                          href="https://buy.stripe.com/3cIeVe9P715h9PLc7T7Re09"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-gold hover:bg-gold-light text-[#0A0D14] font-black uppercase text-xs tracking-widest rounded-xl py-4 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-lg block text-center"
                        >
                          Renouveler mon Adhésion (365 €)
                        </a>
                        <button
                          onClick={() => window.open("https://wa.me/33756832263?text=Bonjour,%20je%20souhaite%20renouveler%20mon%20accréditation%20H-Conciergerie.")}
                          className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-bold uppercase text-xs tracking-widest rounded-xl py-4 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer block text-center"
                        >
                          Contacter la conciergerie
                        </button>
                      </div>

                      <button 
                        onClick={handleLogout}
                        className="text-xs font-bold text-slate-400 hover:text-red-400 uppercase tracking-widest transition-colors cursor-pointer block mx-auto pt-2"
                      >
                        Se Déconnecter
                      </button>
                    </motion.div>
                  </div>
                ) : (
                  // Default block for en_attente_paiement, any other non-active statuses
                  <div className="min-h-screen bg-slate-950 text-white pt-32 pb-24 flex items-center justify-center p-6">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="max-w-md w-full bg-slate-900 border border-gold/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full filter blur-xl pointer-events-none" />
                      
                      <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mx-auto scale-110">
                        <Clock size={28} />
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-2xl font-serif text-white uppercase tracking-wide">Validation Requise</h2>
                        <div className="bg-gold/10 border border-gold/20 font-black tracking-widest text-[9px] uppercase px-3 py-1 rounded-full text-gold inline-block">
                          Statut : En Attente de Validation
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Bonjour <strong>{memberData?.firstName}</strong>. Votre inscription a été enregistrée de façon sécurisée. <br/><br/>
                        Afin de pouvoir accéder aux privilèges exclusifs de notre club privé, veuillez finaliser votre cotisation annuelle de <strong>365 €</strong> (si ce n'est pas déjà fait). <br/><br/>
                        Une fois le règlement effectué, notre équipe procédera à l'accréditation et à l'activation manuelle de votre espace membre VIP sous de brefs délais.
                      </p>

                      <div className="pt-2">
                        <a
                          href="https://buy.stripe.com/3cIeVe9P715h9PLc7T7Re09"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-gold hover:bg-gold-light text-[#0A0D14] font-black uppercase text-xs tracking-widest rounded-xl py-4 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-lg block text-center"
                        >
                          Procéder au Règlement (365 €)
                        </a>
                      </div>

                      <button 
                        onClick={handleLogout}
                        className="text-xs font-bold text-slate-400 hover:text-red-400 uppercase tracking-widest transition-colors cursor-pointer block mx-auto pt-2"
                      >
                        Se Déconnecter
                      </button>
                    </motion.div>
                  </div>
                )
              ) : (
                <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-28 relative overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full filter blur-[100px] pointer-events-none" />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-slate-900 border border-gold/30 rounded-3xl p-8 md:p-10 text-center space-y-6 relative z-10"
                  >
                    <div className="w-14 h-14 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center text-gold mx-auto">
                      <Lock size={22} />
                    </div>
                    <h2 className="text-2xl font-serif text-white tracking-wide">Accès Membre Requis</h2>
                    <p className="text-xs text-slate-400 font-light">
                      Veuillez vous authentifier de manière sécurisée afin de pouvoir accéder à votre espace membre d'exception.
                    </p>
                    <button
                      onClick={() => {
                        setView("connexion");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full bg-gold hover:bg-gold-light text-[#0A0D14] font-black uppercase text-xs tracking-widest rounded-xl py-4 transition-all cursor-pointer shadow-lg"
                    >
                      Se Connecter
                    </button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          ) : view === "admin" ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isAdminLoggedIn ? (
                <AdminDashboard 
                  onLogout={handleAdminLogout} 
                  additionalMembers={registeredMembers}
                />
              ) : (
                <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-28 relative overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full filter blur-[100px] pointer-events-none" />
                  <div className="absolute bottom-1/4 right-1/4 w-[550px] h-[550px] bg-slate-900/40 rounded-full filter blur-[155px] pointer-events-none" />

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full max-w-md bg-slate-900/90 backdrop-blur-md border border-gold/30 rounded-3.5xl p-8 md:p-10 shadow-3xl text-center relative z-10"
                  >
                    <div className="w-14 h-14 bg-red-900/20 border border-gold/40 rounded-full flex items-center justify-center text-gold mx-auto mb-6">
                      <Lock size={22} className="text-gold" />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-serif mb-2 tracking-wide text-white">Espace Administrateur</h2>
                    <p className="text-xs text-slate-400 font-light mb-8">
                      Identification requise pour accéder aux dossiers de H-Conciergerie.
                    </p>

                    {adminLoginError && (
                      <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-100 font-bold font-mono text-left">
                        {adminLoginError}
                      </div>
                    )}

                    <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-left">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Identifiant Administrateur</label>
                        <input 
                          type="text" 
                          required
                          placeholder="ex: admin"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-4 py-3.5 text-xs text-white outline-none transition-colors"
                          value={adminPseudo}
                          onChange={(e) => setAdminPseudo(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Mot de passe secret</label>
                        <div className="relative">
                          <input 
                            type={adminShowPassword ? "text" : "password"}
                            required
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-4 pr-11 py-3.5 text-xs text-white outline-none transition-colors"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setAdminShowPassword(!adminShowPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {adminShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button 
                          type="submit"
                          className="w-full bg-gold hover:bg-gold-light text-slate-950 font-black tracking-widest uppercase text-xs rounded-xl py-4 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-lg"
                        >
                          S'authentifier
                        </button>
                      </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 flex gap-2 items-center justify-center text-[10px] text-slate-500 font-medium">
                      <ShieldCheck size={14} className="text-gold" />
                      Système certifié H-CONCIERGERIE.
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          ) : view === "connexion" ? (
            <motion.div
              key="connexion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-28 relative overflow-hidden"
            >
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full filter blur-[120px] pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-[550px] h-[550px] bg-blue-900/10 rounded-full filter blur-[150px] pointer-events-none" />

              <motion.div 
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-slate-900 border border-gold/30 rounded-3.5xl p-8 md:p-10 shadow-3xl text-center relative z-10"
              >
                <div className="w-14 h-14 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center text-gold mx-auto mb-6">
                  <Lock size={22} />
                </div>

                <h2 className="text-2xl md:text-3xl font-serif mb-2 tracking-wide text-white">Espace Privé Sécurisé</h2>
                <p className="text-xs text-slate-400 font-light mb-8">
                  Veuillez renseigner vos identifiants d'accès membres afin de vous connecter de façon cryptée.
                </p>

                {loginError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-100 font-bold font-mono text-left">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleFirebaseLoginSubmit} className="space-y-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Adresse Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="ex: membre@email.com"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-gold rounded-xl px-4 py-3.5 text-xs text-white outline-none transition-colors"
                      value={pseudo}
                      onChange={(e) => setPseudo(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Mot de passe</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-gold rounded-xl pl-4 pr-11 py-3.5 text-xs text-white outline-none transition-colors"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-gold hover:bg-gold-light text-slate-950 font-black tracking-widest uppercase text-xs rounded-xl py-4 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-lg"
                    >
                      S'authentifier
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-xs text-slate-400 font-light">
                    Pas encore membre ?{" "}
                    <button 
                      onClick={() => {
                        setView("devenir-membre");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-gold font-bold hover:underline cursor-pointer"
                    >
                      Devenir membre
                    </button>
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex gap-2 items-center justify-center text-[10px] text-slate-500 font-medium">
                  <ShieldCheck size={14} className="text-gold" />
                  Session cryptée & certifiée par H-CONCIERGERIE.
                </div>
              </motion.div>
            </motion.div>
          ) : view === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-28 relative overflow-hidden"
            >
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/15 rounded-full filter blur-[120px] pointer-events-none" />
              <div className="w-full max-w-lg bg-slate-900 border border-gold/40 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-2xl relative z-10"
              >
                <div className="w-16 h-16 bg-gold/15 border border-gold/30 rounded-full flex items-center justify-center text-gold mx-auto scale-110">
                  <ShieldCheck size={28} />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-serif text-white uppercase tracking-wide">Félicitations !</h1>
                  <p className="text-[#D4AF37] font-bold text-sm uppercase tracking-widest">
                    Votre Cotisation est Validée
                  </p>
                </div>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  Votre adhésion annuelle VIP de <strong>365 €</strong> au club privé H-Conciergerie a été activée. Vous disposez désormais d'un accès membre actif régularisé.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setView("espace-membre");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full bg-gold hover:bg-gold-light text-[#0A0D14] font-black uppercase text-xs tracking-widest rounded-xl py-4 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-lg"
                  >
                    Accéder à mon Espace Membre
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="cancel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-28 relative overflow-hidden"
            >
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full filter blur-[120px] pointer-events-none" />
              <div className="w-full max-w-lg bg-slate-900 border border-red-500/20 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-2xl relative z-10"
              >
                <div className="w-16 h-16 bg-red-900/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 mx-auto scale-110">
                  <X size={28} />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-serif text-white uppercase tracking-wide">Adhésion Interrompue</h1>
                  <p className="text-red-400 font-bold text-sm uppercase tracking-widest">
                    Transaction Annulée
                  </p>
                </div>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  Le paiement a été interrompu ou n'a pas pu aboutir. Votre compte reste configuré en attente de paiement intermédiaire. Vous pouvez retenter l'opération à tout moment depuis votre espace.
                </p>
                <div className="pt-4 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setView("espace-membre");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full bg-gold hover:bg-gold-light text-[#0A0D14] font-black uppercase text-xs tracking-widest rounded-xl py-4 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-lg"
                  >
                    Aller à mon Compte
                  </button>
                  <button
                    onClick={() => {
                      setView("home");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FLOATING ACTION WHATSAPP KEY */}
      <WhatsAppButton />
    </div>
  );
}
