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
import { Lock, X, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { supabase, isSupabaseConfigured } from "./lib/supabase";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"home" | "hotels" | "cars" | "devenir-membre" | "espace-membre" | "admin">("home");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Client states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [registeredMembers, setRegisteredMembers] = useState<Array<{ name: string; city: string; job: string }>>([]);
  const [memberData, setMemberData] = useState<any>(null);

  // Login Form States
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Admin Login Form States
  const [adminPseudo, setAdminPseudo] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminShowPassword, setAdminShowPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState("");

  // Load persistence states on init
  useEffect(() => {
    const sessionAuth = localStorage.getItem("h_session_auth");
    if (sessionAuth === "true") {
      setIsLoggedIn(true);
      const savedMock = localStorage.getItem("h_supabase_session_mock");
      if (savedMock) {
        try {
          setMemberData(JSON.parse(savedMock));
        } catch (e) {}
      }
    }

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

    // Load active Supabase session if configured
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsLoggedIn(true);
          refreshMemberData();
        }
      });
    }
  }, []);

  // Synchronise member state to keep data from 'membrehcon' table completely up-to-date
  const refreshMemberData = async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;
      let dbMembers: any = null;
      let membersErr: any = null;

      // 1. Try querying by auth_user_id
      const { data: attempt1, error: err1 } = await supabase
        .from("membrehcon")
        .select("*")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (!err1 && attempt1) {
        dbMembers = attempt1;
      } else {
        // 2. Fallback to querying by id
        const { data: attempt2, error: err2 } = await supabase
          .from("membrehcon")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        
        if (attempt2) {
          dbMembers = attempt2;
        } else {
          membersErr = err1 || err2;
        }
      }

      if (membersErr) {
        console.warn("Table 'membrehcon' not queryable during sync:", membersErr.message);
      }

      const isPaid = 
        dbMembers?.payment_status === "paid" || 
        dbMembers?.paiement === "payé";

      const isAuthorized = 
        dbMembers?.access_status === "active" || 
        dbMembers?.acces_membre === true;

      const merged = {
        id: userId,
        nom: dbMembers?.nom || dbMembers?.last_name || session.user.user_metadata?.nom || "",
        prenom: dbMembers?.prenom || dbMembers?.first_name || session.user.user_metadata?.prenom || "",
        email: dbMembers?.email || session.user.email,
        telephone: dbMembers?.phone || dbMembers?.telephone || session.user.user_metadata?.telephone || "",
        ville: dbMembers?.city || dbMembers?.ville || session.user.user_metadata?.ville || "",
        pseudo: dbMembers?.pseudo || session.user.user_metadata?.pseudo || "",
        abonnement: dbMembers?.abonnement || (isAuthorized ? "actif" : "non payé"),
        acces_membre: isAuthorized,
        paiement: dbMembers?.paiement || (isPaid ? "payé" : "en attente"),
        date_inscription: dbMembers?.created_at || new Date().toLocaleDateString("fr-FR"),
        payment_status: dbMembers?.payment_status || (isPaid ? "paid" : "pending"),
        access_status: dbMembers?.access_status || (isAuthorized ? "active" : "pending")
      };

      setMemberData(merged);
      localStorage.setItem("h_supabase_session_mock", JSON.stringify(merged));
      console.log("Synchronized from Supabase 'membrehcon' table:", merged);
    } catch (err) {
      console.error("Critical error in refreshMemberData:", err);
    }
  };

  // Sync whenever view changes to Espace Membre
  useEffect(() => {
    if (view === "espace-membre" && isLoggedIn) {
      refreshMemberData();
    }
  }, [view, isLoggedIn]);

  // Handle initial view resolution from URL ?view= query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialView = params.get("view");
    if (
      initialView === "hotels" || 
      initialView === "cars" || 
      initialView === "devenir-membre" || 
      initialView === "espace-membre" || 
      initialView === "admin"
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

  // Member Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (pseudo.trim() === "membre" && password === "h2026") {
      setIsLoggedIn(true);
      setMemberData(null); // legacy VIP active login bypasses Supabase rules
      setShowLoginModal(false);
      setPseudo("");
      setPassword("");
      localStorage.setItem("h_session_auth", "true");
      setView("espace-membre");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Try simulated accounts if Supabase is not configured yet
    if (!isSupabaseConfigured()) {
      const savedMock = localStorage.getItem("h_supabase_session_mock");
      if (savedMock) {
        try {
          const parsed = JSON.parse(savedMock);
          if (parsed.email === pseudo.trim()) {
            setMemberData(parsed);
            setIsLoggedIn(true);
            setShowLoginModal(false);
            setPseudo("");
            setPassword("");
            localStorage.setItem("h_session_auth", "true");
            setView("espace-membre");
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
        } catch (err) {}
      }
      setLoginError("Identifiants de démonstration : pseudo 'membre' et mot de passe 'h2026'.");
      return;
    }

    // Try Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: pseudo.trim(),
        password,
      });

      if (error) throw error;

      if (data?.user) {
        // Fetch from table `membrehcon`
        let dbData: any = null;
        
        const { data: attempt1 } = await supabase
          .from("membrehcon")
          .select("*")
          .eq("auth_user_id", data.user.id)
          .maybeSingle();

        if (attempt1) {
          dbData = attempt1;
        } else {
          const { data: attempt2 } = await supabase
            .from("membrehcon")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();
          if (attempt2) {
            dbData = attempt2;
          }
        }

        if (dbData) {
          setMemberData({
            id: dbData.id || dbData.auth_user_id || data.user.id,
            nom: dbData.nom || dbData.last_name || data.user.user_metadata?.nom || "",
            prenom: dbData.prenom || dbData.first_name || data.user.user_metadata?.prenom || "",
            email: dbData.email || data.user.email,
            telephone: dbData.telephone || dbData.phone || data.user.user_metadata?.telephone || "",
            ville: dbData.ville || dbData.city || data.user.user_metadata?.ville || "",
            pseudo: dbData.pseudo || data.user.user_metadata?.pseudo || "",
            abonnement: dbData.abonnement || "non payé",
            acces_membre: dbData.acces_membre ?? false,
            paiement: dbData.paiement || "en attente",
            date_inscription: dbData.created_at || new Date().toLocaleDateString("fr-FR"),
            payment_status: dbData.payment_status || "pending",
            access_status: dbData.access_status || "pending"
          });
        } else {
          setMemberData({
            id: data.user.id,
            nom: data.user.user_metadata?.nom || "",
            prenom: data.user.user_metadata?.prenom || "",
            email: data.user.email,
            telephone: data.user.user_metadata?.telephone || "",
            ville: data.user.user_metadata?.ville || "",
            pseudo: data.user.user_metadata?.pseudo || "",
            abonnement: "non payé",
            acces_membre: false,
            paiement: "en attente",
            date_inscription: new Date().toLocaleDateString("fr-FR"),
            payment_status: "pending",
            access_status: "pending"
          });
        }

        setIsLoggedIn(true);
        setShowLoginModal(false);
        setPseudo("");
        setPassword("");
        localStorage.setItem("h_session_auth", "true");
        setView("espace-membre");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      setLoginError(err.message || "Identifiants incorrects.");
    }
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setMemberData(null);
    localStorage.removeItem("h_session_auth");
    localStorage.removeItem("h_supabase_session_mock");
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {}
    }
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPseudo.trim() === "admin" && adminPassword === "comores") {
      setIsAdminLoggedIn(true);
      setAdminPseudo("");
      setAdminPassword("");
      setAdminLoginError("");
      localStorage.setItem("h_admin_auth", "true");
    } else {
      setAdminLoginError("Identifiants incorrects. Pseudo : admin / MDP : comores");
    }
  };

  const handleAdminLogout = () => {
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
          setView("espace-membre");
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
                onSignUpSuccess={(member) => {
                  setIsLoggedIn(true);
                  setMemberData(member);
                  setView("espace-membre");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
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
                <MemberDashboard 
                  onLogout={handleLogout} 
                  memberData={memberData} 
                  onPaymentSuccess={(updated) => {
                    setMemberData(updated);
                    localStorage.setItem("h_supabase_session_mock", JSON.stringify(updated));
                  }}
                  onRefresh={refreshMemberData}
                />
              ) : (
                <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-28 relative overflow-hidden">
                  {/* Luxuriously styled background decorations */}
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full filter blur-[100px] pointer-events-none" />
                  <div className="absolute bottom-1/4 right-1/4 w-[550px] h-[550px] bg-blue-900/10 rounded-full filter blur-[155px] pointer-events-none" />

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full max-w-md bg-slate-900/90 backdrop-blur-md border border-gold/30 rounded-3.5xl p-8 md:p-10 shadow-3xl text-center relative z-10"
                  >
                    <div className="w-14 h-14 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center text-gold mx-auto mb-6">
                      <Lock size={22} />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-serif mb-2 tracking-wide text-white">Espace Privé Sécurisé</h2>
                    <p className="text-xs text-slate-400 font-light mb-8">
                      Cet espace est exclusivement réservé aux membres H-Conciergerie. Veuillez vous authentifier.
                    </p>

                    {loginError && (
                      <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-bold font-mono">
                        {loginError}
                      </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Pseudo Membre</label>
                        <input 
                          type="text" 
                          required
                          placeholder="ex: membre"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-4 py-3.5 text-xs text-white outline-none transition-colors"
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
                            className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-4 pr-11 py-3.5 text-xs text-white outline-none transition-colors"
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

                    <div className="mt-8 pt-6 border-t border-white/5 flex gap-2 items-center justify-center text-[10px] text-slate-500 font-medium">
                      <ShieldCheck size={14} className="text-gold" />
                      Session cryptée & certifiée par H-CONCIERGERIE.
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          ) : (
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
                  {/* Luxuriously styled background decorations */}
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
                      <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-bold font-mono text-left">
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
          )}
        </AnimatePresence>
      </main>

      {/* FLOATING ACTION WHATSAPP KEY */}
      <WhatsAppButton />

      {/* BEAUTIFUL LUXURIOUS MEMBERSHIP LOGIN MODAL DIALOG */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark glass background with entry transition */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md bg-slate-900 border border-gold/30 rounded-3xl p-8 shadow-2xl text-white overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center text-gold mx-auto mb-4 scale-110">
                  <Lock size={20} />
                </div>
                <h3 className="text-2xl font-serif text-white mb-1">Accès Cercle Privé</h3>
                <p className="text-xs text-slate-400 font-light">Connexion réservée aux membres accrédités.</p>
              </div>

              {loginError && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-400 text-center font-bold font-mono">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Identifiant (Pseudo)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="ex: membre"
                    className="bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors"
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
                      className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-4 pr-11 py-3 text-xs text-white outline-none transition-colors"
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
                    className="w-full bg-gold hover:bg-gold-light text-slate-950 font-black tracking-widest uppercase text-xs rounded-xl py-3.5 shadow-lg cursor-pointer transition-all active:scale-95"
                  >
                    S'authentifier
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-white/5 flex gap-2 items-center justify-center text-[10px] text-slate-400">
                <ShieldCheck size={14} className="text-gold" />
                Session cryptée & certifiée par H-CONCIERGERIE.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
