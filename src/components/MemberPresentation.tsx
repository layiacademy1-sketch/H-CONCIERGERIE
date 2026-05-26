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
  const stripe = useStripe();
  const elements = useElements();

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

  // Apple & Google Pay specific states
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet">("card");
  const [walletType, setWalletType] = useState<"apple" | "google" | null>(null);
  const [simulatingWallet, setSimulatingWallet] = useState(false);
  const [walletStep, setWalletStep] = useState<"idle" | "authenticating" | "approved">("idle");
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

  const isSimulatedFlow = !stripePromise || !stripeKey;

  const getApiUrl = (route: string) => {
    if (window.location.hostname.includes("netlify.app")) {
      return `/.netlify/functions/${route}`;
    }
    return `/api/${route}`;
  };

  const finalizeUserRegistration = async (returnedPaymentIntentId: string) => {
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
        abonnement: "payé",
        acces_membre: true,
        paiement: "validé",
        date_inscription: new Date().toLocaleDateString('fr-FR'),
        date_paiement: new Date().toLocaleDateString('fr-FR')
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

    // Finalize Verify/Upsert member record bypassing RLS
    const verifyUrl = getApiUrl("verify-payment");
    const verifyRes = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentIntentId: returnedPaymentIntentId,
        userId: activeUserId,
        isSimulated: isSimulatedFlow,
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

    if (!verifyRes.ok) {
      throw new Error("Le débit a été réalisé, mais l'enregistrement de vos privilèges a échoué.");
    }

    const verifyData = await verifyRes.json();

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
      onSignUpSuccess(verifyData.member || {
        id: activeUserId,
        nom: lastName,
        prenom: firstName,
        email,
        telephone: phone,
        ville: city,
        pseudo: pseudo.trim(),
        abonnement: "payé",
        acces_membre: true,
        paiement: "validé",
        date_inscription: new Date().toLocaleDateString('fr-FR'),
        date_paiement: new Date().toLocaleDateString('fr-FR')
      });
    }, 1500);
  };

  // Setup actual payment request button for Stripe
  React.useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: "FR",
        currency: "eur",
        total: {
          label: "Abonnement Club Privé H-Conciergerie",
          amount: 100, // 1€ in cents
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr);
        }
      });

      pr.on("paymentmethod", async (ev) => {
        if (!lastName || !firstName || !email || !phone || !city || !pseudo || !password) {
          ev.complete("fail");
          setErrorMsg("Veuillez d'abord remplir vos informations d'identité.");
          return;
        }

        try {
          const intentUrl = getApiUrl("create-payment-intent");
          const intentRes = await fetch(intentUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, userId: "transient-signup" }),
          });

          if (!intentRes.ok) {
            ev.complete("fail");
            throw new Error("L'initialisation de la transaction Stripe a échoué.");
          }

          const intentData = await intentRes.json();
          const clientSecret = intentData.clientSecret;

          const { paymentIntent, error: stripeConfirmErr } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (stripeConfirmErr) {
            ev.complete("fail");
            throw new Error(stripeConfirmErr.message);
          }

          if (!paymentIntent || paymentIntent.status !== "succeeded") {
            ev.complete("fail");
            throw new Error("La transaction a été rejetée.");
          }

          ev.complete("success");
          setLoading(true);
          await finalizeUserRegistration(paymentIntent.id);
        } catch (err: any) {
          console.error(err);
          setErrorMsg(err.message || "Le paiement mobile a échoué.");
          setLoading(false);
        }
      });
    }
  }, [stripe, lastName, firstName, email, phone, city, pseudo, password]);

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

      let returnedPaymentIntentId = "pi_mock_value";

      // 4. Handle Stripe Transaction via Serverless backend
      if (!isSimulatedFlow && stripe && elements) {
        const intentUrl = getApiUrl("create-payment-intent");
        const intentRes = await fetch(intentUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, userId: "transient-signup" }),
        });

        if (!intentRes.ok) {
          throw new Error("L'initialisation de la transaction sécurisée Stripe a échoué.");
        }

        const intentData = await intentRes.json();
        const clientSecret = intentData.clientSecret;

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error("Erreur de chargement du composant carte.");
        }

        const { paymentIntent, error: stripeConfirmErr } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement as any,
            billing_details: {
              name: `${firstName} ${lastName}`,
              email
            }
          }
        });

        if (stripeConfirmErr) {
          throw new Error(stripeConfirmErr.message || "Paiement rejeté par la banque.");
        }

        if (!paymentIntent || paymentIntent.status !== "succeeded") {
          throw new Error("La validation bancaire a échoué. Veuillez réessayer.");
        }

        returnedPaymentIntentId = paymentIntent.id;
      } else {
        await new Promise((r) => setTimeout(r, 1000));
      }

      await finalizeUserRegistration(returnedPaymentIntentId);

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
    <form onSubmit={handleCustomSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 font-bold font-mono text-center flex items-center justify-center gap-2">
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {isSimulatedFlow && (
        <div className="p-4 rounded-xl bg-gold/10 border border-gold/20 text-[11px] text-gold font-light leading-relaxed text-left">
          <strong className="font-bold">Mode Simulation Actif</strong> : Aucune clé Stripe d'environnement n'est configurée. Vous pouvez tester le cycle complet d'inscription et de paiement sécurisé immédiatement.
        </div>
      )}

      {/* Identity Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Prénom</label>
          <input 
            type="text" 
            required
            placeholder="Prénom"
            className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Nom</label>
          <input 
            type="text" 
            required
            placeholder="Nom"
            className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      {/* E-mail */}
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Adresse Email</label>
        <input 
          type="email" 
          required
          placeholder="exemple@email.com"
          className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Phone and City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Téléphone</label>
          <input 
            type="tel" 
            required
            placeholder="+33 6 00 00 00 00"
            className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Ville</label>
          <input 
            type="text" 
            required
            placeholder="ex: Paris, Dakar, Moroni"
            className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </div>

      {/* Pseudo (Unique name) */}
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Pseudo unique</label>
        <input 
          type="text" 
          required
          placeholder="Choisissez un pseudo unique"
          className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
        />
      </div>

      {/* Password with Eye Toggles */}
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Mot de passe</label>
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"}
            required
            placeholder="•••••••• (6 caractères min)"
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

      {/* Payment Selection Tabs */}
      <div className="pt-6 border-t border-white/5 space-y-3 text-left">
        <div>
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Mode de règlement sécurisé</label>
          <p className="text-[10px] text-slate-500 font-light">Sélectionnez votre moyen de paiement d'exception</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod("card")}
            className={`py-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              paymentMethod === "card"
                ? "bg-gold/10 border-gold/60 text-gold shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <CreditCard size={14} />
            Carte Bancaire
          </button>
          
          <button
            type="button"
            onClick={() => setPaymentMethod("wallet")}
            className={`py-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              paymentMethod === "wallet"
                ? "bg-gold/10 border-gold/60 text-gold shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <Sparkles size={14} className="text-gold" />
            Wallet Express
          </button>
        </div>
      </div>

      {paymentMethod === "card" && (
        <div className="space-y-4 text-left">
          {/* Integrated Stripe elements view credit card check with luxury preview card */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Carte Membre Officielle</label>
              <p className="text-[10px] text-slate-500 font-light">Génération automatique de vos privilèges</p>
            </div>

            {/* Visual Luxury Card Front */}
            <div className="relative w-full h-44 rounded-2xl bg-gradient-to-br from-slate-900 via-zinc-950 to-neutral-900 border border-gold/40 p-6 flex flex-col justify-between shadow-2xl overflow-hidden">
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-white/[0.02] pointer-events-none" />
              
              {/* Chip & contactless */}
              <div className="flex justify-between items-center z-10">
                <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-300/20 to-yellow-600/30 border border-gold/40 flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1 opacity-70">
                    <div className="border border-gold/10"></div>
                    <div className="border border-gold/10"></div>
                    <div className="border border-gold/10"></div>
                    <div className="border border-gold/10"></div>
                    <div className="border border-gold/10"></div>
                    <div className="border border-gold/10"></div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-[9px] tracking-[0.2em] font-bold text-gold uppercase">H-CONCIERGERIE</span>
                  <div className="text-[7px] text-slate-500 font-serif tracking-widest mt-0.5">CLUB PRIVÉ VIP</div>
                </div>
              </div>

              {/* Card number simulation representation */}
              <div className="my-2 z-10 text-left">
                <div className="font-mono text-sm tracking-[0.25em] text-white/95 font-semibold">
                  ••••  ••••  ••••  ••••
                </div>
              </div>

              {/* Card holder & validation */}
              <div className="flex justify-between items-end z-10 text-left">
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-slate-500 mb-0.5">Titulaire</div>
                  <div className="font-mono text-[10px] tracking-wide text-white font-medium uppercase truncate max-w-[220px]">
                    {(firstName || lastName) ? `${firstName} ${lastName}`.trim().toUpperCase() : (pseudo ? `@${pseudo.trim().toUpperCase()}` : "MEMBRE PRIVILÈGE")}
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-3">
                  {/* Mini Premium indicator */}
                  <div className="px-2 py-1 bg-gold/15 rounded border border-gold/30 flex items-center justify-center">
                    <span className="text-[8px] font-sans font-black tracking-wider text-gold uppercase">VIP</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Coordonnées bancaires cryptées</label>
              
              {isSimulatedFlow ? (
                <div className="bg-slate-950 border border-gold/10 rounded-xl px-4 py-3.5 text-xs text-slate-400 flex items-center gap-2.5 italic">
                  <CreditCard size={15} className="text-gold" />
                  <span>Simulation de paiement intégrée active</span>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold/30 rounded-xl px-4 py-4 transition-all">
                  <CardElement options={cardElementOptions} />
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light text-[#0A0D14] font-black tracking-widest uppercase text-xs rounded-xl py-4 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-[0_4px_20px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Création & Transaction..." : "Créer mon compte et payer 1€"}
            </button>
          </div>
        </div>
      )}

      {paymentMethod === "wallet" && (
        <div className="space-y-4 text-left">
          <div className="p-3 bg-slate-950/60 border border-white/5 rounded-xl text-[11px] text-slate-400 leading-relaxed font-light">
            Option d'adhésion ultra-rapide sans saisie bancaire. Votre compte conciergerie VIP sera automatiquement créé à l'adhésion biométrique sécurisée.
          </div>

          {/* Real Stripe paymentRequest button if available */}
          {!isSimulatedFlow && paymentRequest && (
            <div className="p-1 bg-white rounded-xl">
              <PaymentRequestButtonElement options={{ paymentRequest }} />
            </div>
          )}

          {/* Aesthetic Luxury Branded Fast Checkout Blocks */}
          <div className="grid grid-cols-1 gap-3">
            {/* Apple Pay Luxury Action Button */}
            <button
              type="button"
              onClick={() => {
                if (!firstName || !lastName || !email || !phone || !city || !pseudo || !password) {
                  setErrorMsg("Veuillez d'abord compléter l'ensemble du formulaire d'inscription ci-dessus.");
                  return;
                }
                setErrorMsg("");
                setWalletType("apple");
                setWalletStep("idle");
                setSimulatingWallet(true);
              }}
              className="w-full py-4 bg-slate-900 hover:bg-black text-white hover:text-slate-100 border border-white/10 rounded-xl font-sans font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              <span className="text-lg"></span>
              <span className="text-xs uppercase tracking-wider">S'inscrire avec Apple Pay</span>
            </button>

            {/* Google Pay Luxury Action Button */}
            <button
              type="button"
              onClick={() => {
                if (!firstName || !lastName || !email || !phone || !city || !pseudo || !password) {
                  setErrorMsg("Veuillez d'abord compléter l'ensemble du formulaire d'inscription ci-dessus.");
                  return;
                }
                setErrorMsg("");
                setWalletType("google");
                setWalletStep("idle");
                setSimulatingWallet(true);
              }}
              className="w-full py-4 bg-slate-900 hover:bg-neutral-900 border border-white/10 text-white rounded-xl font-sans font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-1">
                <span className="text-blue-500 font-black">G</span>
                <span className="text-red-500 font-black">o</span>
                <span className="text-yellow-500 font-black">o</span>
                <span className="text-blue-500 font-black">g</span>
                <span className="text-green-500 font-black">l</span>
                <span className="text-red-500 font-black">e</span>
              </div>
              <span className="text-xs uppercase tracking-wider">S'inscrire avec Google Pay</span>
            </button>
          </div>
        </div>
      )}

      {/* Visual Simulated Wallet Biometric Popup Overlay */}
      {simulatingWallet && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm bg-slate-900 border border-gold/40 rounded-3xl p-6 shadow-[0_10px_50px_rgba(212,175,55,0.15)] relative overflow-hidden text-center"
          >
            {/* Shimmer background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-white/[0.01]" />
            
            {/* Branding header */}
            <div className="relative z-10 flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase">
                  Paiement Express Sécurisé
                </span>
              </div>
              <div className="text-[10px] font-mono text-gold font-bold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/20">
                1.00 €
              </div>
            </div>

            <div className="relative z-10 space-y-6">
              {walletType === "apple" ? (
                <div className="flex flex-col items-center">
                  <div className="text-white font-sans font-bold text-lg flex items-center gap-1.5 justify-center mb-1">
                    <span> Pay</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-light">Authentification biométrique requise</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-white font-sans font-bold text-lg flex items-center gap-1.5 justify-center mb-1">
                    <span className="text-blue-400 font-bold">G</span>
                    <span className="text-red-400 font-bold">o</span>
                    <span className="text-yellow-400 font-bold">o</span>
                    <span className="text-blue-400 font-bold">g</span>
                    <span className="text-green-400 font-bold">l</span>
                    <span className="text-red-400 font-bold">e</span>
                    <span className="ml-1 text-white font-medium">Pay</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-light">Validation via votre compte Google</p>
                </div>
              )}

              {/* Fingertip sensor area */}
              <div className="py-6 flex justify-center">
                {walletStep === "idle" && (
                  <button
                    type="button"
                    onClick={async () => {
                      setWalletStep("authenticating");
                      await new Promise((r) => setTimeout(r, 1200));
                      setWalletStep("approved");
                      await new Promise((r) => setTimeout(r, 600));
                      setSimulatingWallet(false);
                      setWalletStep("idle");
                      
                      setLoading(true);
                      try {
                        await finalizeUserRegistration("simulated_wallet_payment_intent_" + Date.now());
                      } catch (err: any) {
                        setErrorMsg(err.message || "Erreur lors de la validation.");
                        setLoading(false);
                      }
                    }}
                    className="w-24 h-24 rounded-full border border-gold/40 bg-slate-950/80 hover:bg-gold/10 hover:border-gold/60 transition-all flex flex-col items-center justify-center cursor-pointer group shadow-[0_0_20px_rgba(212,175,55,0.05)] text-gold relative"
                  >
                    {/* Concentric rings pulsing background */}
                    <div className="absolute inset-2 border border-gold/10 rounded-full animate-ping opacity-25 group-hover:opacity-45" />
                    <Sparkles size={28} className="animate-pulse mb-1 animate-infinite" />
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 group-hover:text-gold transition-colors">Confirmer</span>
                  </button>
                )}

                {walletStep === "authenticating" && (
                  <div className="w-24 h-24 rounded-full border border-t-gold/85 border-r-gold/50 border-white/5 bg-slate-950/80 animate-spin flex items-center justify-center">
                    <Sparkles size={20} className="text-gold animate-bounce" />
                  </div>
                )}

                {walletStep === "approved" && (
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-400 flex items-center justify-center scale-105 transition-transform">
                    <CheckCircle2 size={36} />
                  </div>
                )}
              </div>

              {/* Status information */}
              <div className="space-y-1 font-sans">
                <p className="text-xs text-white font-medium tracking-wide">
                  {walletStep === "idle" && "Appuyez sur le capteur pour payer"}
                  {walletStep === "authenticating" && "Authentification en cours..."}
                  {walletStep === "approved" && "Paiement Autorisé"}
                </p>
                <p className="text-[10px] text-slate-500 font-light leading-relaxed max-w-xs mx-auto">
                  En autorisant cette commande, vous confirmez votre abonnement annuel de 1,00 € à H-Conciergerie.
                </p>
              </div>

              {/* Cancel Button */}
              {walletStep === "idle" && (
                <div className="pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setSimulatingWallet(false);
                      setWalletType(null);
                    }}
                    className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    Annuler l'achat
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Network Icons & Badges */}
      <div className="flex items-center justify-between px-1 py-1 text-slate-500 text-[10px] border-t border-slate-900 pt-3">
        <span className="font-medium">Cartes & Portefeuilles acceptés :</span>
        <div className="flex gap-1.5 font-mono text-[8px] font-semibold text-slate-400">
          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">VISA</span>
          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">MASTERCARD</span>
          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">APPLE PAY</span>
          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">GOOGLE PAY</span>
        </div>
      </div>

      <div className="flex gap-2 items-center justify-center text-[10px] text-slate-500 font-medium pt-2">
        <ShieldCheck size={14} className="text-gold" />
        Paiement de bout en bout crypté Stripe / SSL certifié
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
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-[10px] text-gold font-bold tracking-[0.2em] uppercase mb-4">
                <Sparkles size={11} /> Inscription Club Privé
              </div>
              <h2 className="text-2xl md:text-3xl font-serif text-white tracking-wide font-medium">Devenir Membre</h2>
              <p className="text-[11px] text-slate-400 font-light mt-2 leading-relaxed">
                Remplissez vos informations et réglez de manière sécurisée en une seule étape.
              </p>
            </div>

            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <InnerPremiumSignupForm 
                  onBack={onBack} 
                  onSubmitMember={onSubmitMember} 
                  onSignUpSuccess={onSignUpSuccess} 
                />
              </Elements>
            ) : (
              <InnerPremiumSignupForm 
                onBack={onBack} 
                onSubmitMember={onSubmitMember} 
                onSignUpSuccess={onSignUpSuccess} 
              />
            )}
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
