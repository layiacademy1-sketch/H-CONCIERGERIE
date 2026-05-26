import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, Star, Heart, Award, 
  MapPin, Notebook as Journal, ShieldCheck, Mail, Send, Sparkles, Zap, Lock, Compass, Calendar, Phone, CreditCard,
  Eye, EyeOff, AlertCircle, CheckCircle2
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";

// Retrieve Stripe Publishable Key
const stripeKey = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface MemberPresentationProps {
  onBack: () => void;
  onSubmitMember: (member: { name: string; city: string; job: string; phone?: string; email?: string }) => void;
  onSignUpSuccess: (member: any) => void;
}

// Inner Signup Billing Form
function InnerPremiumSignupForm({ onBack, onSubmitMember, onSignUpSuccess }: MemberPresentationProps) {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const getApiUrl = (route: string) => {
    if (window.location.hostname.includes("netlify.app")) {
      return `/.netlify/functions/${route}`;
    }
    return `/api/${route}`;
  };

  const finalizeUserRegistration = async () => {
    // Unconfigured Supabase Fallback Simulation
    if (!isSupabaseConfigured()) {
      console.warn("Supabase is not configured yet. Running simulated registration.");
      const mockUid = "mock-uuid-" + Date.now();
      const mockMember = {
        id: mockUid,
        nom: lastName,
        prenom: firstName,
        email: email,
        telephone: phone,
        ville: city,
        pseudo: pseudo.trim(),
        abonnement: "non payé",
        acces_membre: false,
        paiement: "en attente",
        date_inscription: new Date().toLocaleDateString('fr-FR')
      };

      localStorage.setItem("h_supabase_session_mock", JSON.stringify(mockMember));
      localStorage.setItem("h_session_auth", "true");

      onSubmitMember({
        name: `${firstName} ${lastName}`,
        city,
        job: "Membre Club VIP",
        phone,
        email
      });

      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        onSignUpSuccess(mockMember);
      }, 1500);
      return;
    }

    // Create Supabase Auth Account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nom: lastName,
          prenom: firstName,
          telephone: phone,
          ville: city,
          pseudo: pseudo.trim()
        }
      }
    });

    if (authError) {
      throw new Error(`Échec d'authentification: ${authError.message}`);
    }

    if (!authData?.user) {
      throw new Error("La création d'utilisateur auth Supabase a échoué.");
    }

    const activeUserId = authData.user.id;

    // Finalize Register Unpaid Record bypassing RLS
    const registerUrl = getApiUrl("register-unpaid");
    const registerRes = await fetch(registerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: activeUserId,
        memberDetails: {
          pseudo: pseudo.trim(),
          prenom: firstName,
          nom: lastName,
          email: email,
          telephone: phone,
          ville: city,
          date_inscription: new Date().toISOString()
        }
      })
    });

    if (!registerRes.ok) {
      throw new Error("L'authentification a réussi, mais l'enregistrement de vos privilèges a échoué.");
    }

    const registerData = await registerRes.json();

    onSubmitMember({
      name: `${firstName} ${lastName}`,
      city,
      job: "Membre Club VIP",
      phone,
      email
    });

    setSuccess(true);
    setLoading(false);
    localStorage.setItem("h_session_auth", "true");

    setTimeout(() => {
      onSignUpSuccess(registerData.member || {
        id: activeUserId,
        nom: lastName,
        prenom: firstName,
        email,
        telephone: phone,
        ville: city,
        pseudo: pseudo.trim(),
        abonnement: "non payé",
        acces_membre: false,
        paiement: "en attente",
        date_inscription: new Date().toLocaleDateString('fr-FR')
      });
    }, 1500);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    // 1. Core Field Validation
    if (!lastName || !firstName || !email || !phone || !city || !pseudo || !password) {
      setErrorMsg("Veuillez remplir tous les champs du formulaire.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    try {
      // Check for pseudo availability in Supabase if configured
      if (isSupabaseConfigured()) {
        const { data: existingPseudo, error: checkError } = await supabase
          .from("membres")
          .select("id")
          .eq("pseudo", pseudo.trim())
          .maybeSingle();

        if (existingPseudo) {
          setErrorMsg("Ce pseudo est déjà pris. Veuillez en choisir un autre.");
          setLoading(false);
          return;
        }
      }

      await finalizeUserRegistration();

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Une erreur s'est produite lors de la validation.");
      setLoading(false);
    }
  };

  const cardElementOptions = {
    iconStyle: "solid" as const,
    style: {
      base: {
        color: "#ffffff",
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "14px",
        "::placeholder": {
          color: "#64748b"
        },
        iconColor: "#D4AF37"
      },
      invalid: {
        color: "#ef4444",
        iconColor: "#ef4444"
      }
    }
  };

  if (success) {
    return (
      <div className="text-center py-16 px-6 space-y-6">
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto scale-110 animate-bounce">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="font-serif text-3xl text-white tracking-wide">Paiement Accepté</h3>
        <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed font-light">
          Votre abonnement annuel a été validé avec succès. Nous préparons votre accès à l'Espace Privé Membres...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleCustomSubmit} className="space-y-3">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 font-bold font-mono text-center flex items-center justify-center gap-2">
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {!isSupabaseConfigured() && (
        <div className="p-3 rounded-xl bg-gold/10 border border-gold/20 text-[10px] text-gold font-light leading-relaxed text-left">
          <strong className="font-bold">Mode Démo Actif</strong> : Base de données locale temporaire (hors-ligne). Votre compte sera conservé dans le navigateur.
        </div>
      )}

      {/* Identity row - side-by-side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 text-left">
          <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Prénom</label>
          <input 
            type="text" 
            required
            placeholder="Prénom"
            className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 text-left">
          <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Nom</label>
          <input 
            type="text" 
            required
            placeholder="Nom"
            className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      {/* E-mail */}
      <div className="flex flex-col gap-1 text-left">
        <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Adresse Email</label>
        <input 
          type="email" 
          required
          placeholder="exemple@email.com"
          className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Phone and City - side-by-side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 text-left">
          <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Téléphone</label>
          <input 
            type="tel" 
            required
            placeholder="+33 6..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 text-left">
          <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Ville</label>
          <input 
            type="text" 
            required
            placeholder="Ville"
            className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </div>

      {/* Pseudo AND Password - side-by-side to optimize viewport height */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 text-left">
          <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Pseudo unique</label>
          <input 
            type="text" 
            required
            placeholder="Pseudo"
            className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 text-left">
          <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Mot de passe</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              required
              placeholder="Min 6 car."
              className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-3 pr-9 py-2 text-xs text-white outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-gold hover:bg-gold-light text-[#0A0D14] font-black tracking-widest uppercase text-xs rounded-xl py-4 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-[0_4px_15px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Création du compte..." : "Créer mon espace membre"}
        </button>
      </div>

      <div className="flex gap-1.5 items-center justify-center text-[9px] text-slate-500 font-medium pt-3 border-t border-slate-900 mt-4">
        <ShieldCheck size={12} className="text-gold" />
        Inscription cryptée 256 bits SSL de bout en bout
      </div>
    </form>
  );
}

// Wrapper component managing Stripe elements load state
export default function MemberPresentation({ onBack, onSubmitMember, onSignUpSuccess }: MemberPresentationProps) {
  const [showForm, setShowForm] = useState(false);

  const advantagesList = [
    { title: "Accès aux Offres Flash", desc: "Soyez informés en temps réel de nos opportunités de vols privés et d'hôtels prestigieux." },
    { title: "Accédez aux Ventes Privées", desc: "Achetez de la mode de créateur, de la haute technologie et de l'art à prix exclusifs." },
    { title: "Obtenez des Prix Exclusifs", desc: "Des tarifs inaccessibles au grand public garantis par nos ententes mondiales." },
    { title: "Accéder à des Évènements VIP", desc: "Dîners de gala, ventes privées…" },
    { title: "Accès à l'Espace Membre", desc: "Une interface connectée pour piloter vos demandes de conciergerie à distance." },
    { title: "Obtenir des Réductions Fortes", desc: "Jusqu’à -80 % de réduction chez nos hôtels et plein d’autres avantages." },
    { title: "Bons Plans Premium", desc: "Chaque semaine, une curation minutieuse d'adresses secrètes et de services de luxe." }
  ];

  if (showForm) {
    return (
      <div className="min-h-screen bg-slate-950 text-white selection:bg-gold selection:text-slate-950 pt-32 pb-24 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/10 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full filter blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-xl relative z-10">
          {/* Back Button */}
          <button 
            onClick={() => setShowForm(false)}
            className="group mb-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#D4AF37] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Retour aux Tarifs
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/90 backdrop-blur-md border border-gold/30 rounded-3xl p-8 md:p-10 shadow-3xl relative"
          >
            <div className="text-center mb-0 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-[10px] text-gold font-bold tracking-[0.2em] uppercase mb-4">
                <Sparkles size={11} /> Inscription Club Privé
              </div>
              <h2 className="text-2xl md:text-3xl font-serif text-white tracking-wide font-medium">Devenir Membre</h2>
              <p className="text-[11px] text-slate-400 font-light mt-2 leading-relaxed">
                Remplissez vos informations pour créer votre compte en quelques instants.
              </p>
            </div>

            <InnerPremiumSignupForm 
              onBack={onBack} 
              onSubmitMember={onSubmitMember} 
              onSignUpSuccess={onSignUpSuccess} 
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-gold selection:text-slate-950 pt-32 pb-24 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="group mb-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#D4AF37] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </button>

        {/* TOP HERO PRESENTATION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full text-xs text-gold font-bold tracking-[0.2em] uppercase mb-4 animate-pulse">
            <Sparkles size={12} /> Club Privé H-Conciergerie
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tight leading-tight mb-6">
            Intégrez l'Inaccessible. <br/>
            <span className="text-gold-gradient font-semibold">Devenez Membre.</span>
          </h1>
          <p className="text-slate-400 font-light text-base md:text-lg leading-relaxed">
            Rejoignez un cercle prestigieux et profitez d'expériences uniques de voyage, de conciergerie haut de gamme et d'avantages financiers sans précédent partout à travers le monde.
          </p>
        </div>

        {/* PREMIUM MEMBERSHIP PRICING PRESENTATION */}
        <div className="relative mb-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-gold/30 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between">
            {/* Ambient gold glow decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full filter blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-900/55 rounded-full filter blur-[80px] pointer-events-none" />

            <div className="space-y-6 text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/20 rounded-md text-[10px] text-gold font-black uppercase tracking-widest">
                <CreditCard size={12} /> TARIF ABONNEMENT UNIQUE
              </div>
              <h3 className="text-3xl md:text-4xl font-serif text-white tracking-wide">
                L'excellence au quotidien
              </h3>
              <p className="text-slate-400 font-light text-sm md:text-base leading-relaxed">
                Bénéficiez d'une accréditation annuelle complète auprès de notre service de conciergerie privée. Un accès direct sans intermédiaire, conçu pour répondre instantanément à vos exigences d'exception.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5 text-[13px] text-slate-300 leading-relaxed">
                  <span className="text-gold font-black shrink-0 mt-0.5">•</span>
                  <span>Devis sur mesure intégrant l'IA et réponse 24/7</span>
                </div>
                <div className="flex items-start gap-2.5 text-[13px] text-slate-300 leading-relaxed">
                  <span className="text-gold font-black shrink-0 mt-0.5">•</span>
                  <span>Offres flash sur une sélection d'hôtels de luxe</span>
                </div>
                <div className="flex items-start gap-2.5 text-[13px] text-slate-300 leading-relaxed">
                  <span className="text-gold font-black shrink-0 mt-0.5">•</span>
                  <span>Réservation d'hôtels et locations de voitures à des tarifs négociés sans aucune commission</span>
                </div>
                <div className="flex items-start gap-2.5 text-[13px] text-slate-300 leading-relaxed">
                  <span className="text-gold font-black shrink-0 mt-0.5">•</span>
                  <span>Ventes privées d'articles de luxe à des prix imbattables.</span>
                </div>
              </div>
            </div>

            {/* Price Badge / Callout Container */}
            <div className="p-8 bg-slate-950 border border-gold/20 rounded-2xl w-full md:w-80 text-center space-y-4 relative shadow-inner shrink-0 z-10">
              <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Abonnement Annuel</div>
              
              <div className="space-y-1">
                <div className="text-5xl font-serif text-gold-gradient font-bold tracking-tight">
                  1 € <span className="text-lg text-slate-400 font-light">/ an</span>
                </div>
                <div className="text-xs text-slate-300 font-semibold tracking-wide bg-gold/10 border border-gold/10 inline-block px-3 py-1 rounded-full">
                  Accès d'exception garanti
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={() => setShowForm(true)}
                  className="w-full bg-gold hover:bg-gold-light text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-xl py-3.5 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.2)] hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  DEVENIR MEMBRE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PERKS / BENEFITS */}
        <div className="mb-24">
          <div className="space-y-8">
            <h2 className="text-3xl font-serif text-white tracking-widest uppercase text-center mb-4 font-normal">
              Pourquoi nous rejoindre ?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advantagesList.map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-white/[0.08] transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-4 font-serif font-bold text-xs select-none">
                    0{idx + 1}
                  </div>
                  <h4 className="font-serif text-lg text-white mb-2 font-medium">{item.title}</h4>
                  <p className="text-slate-400 text-xs font-light leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM CONTACT BANNER */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="font-serif text-xl mb-1 font-medium">D'autres questions sur l'adhésion ?</h3>
            <p className="text-slate-400 text-xs font-light">Discutez directement avec un représentant de notre service des relations membres.</p>
          </div>
          <button 
            onClick={() => window.open(`https://wa.me/33756832263?text=Bonjour,%20j'aimerais%20en%20savoir%20plus%20sur%20les%20avantages%20des%20membres%20H-Conciergerie.`, "_blank")}
            className="bg-white text-slate-950 px-6 py-3 rounded-xl text-xs font-extrabold tracking-widest uppercase hover:bg-gold hover:text-slate-950 transition-colors shrink-0 cursor-pointer"
          >
            Contacter un conseiller
          </button>
        </div>

      </div>
    </div>
  );
}
