import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, 
  ArrowLeft, Loader2, CreditCard, Calendar, Hash, Sparkles 
} from "lucide-react";

interface SignUpFormProps {
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string;
}

export default function SignUpForm({ onSubmit, onCancel, isLoading, error }: SignUpFormProps) {
  // Information Profil States
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [pseudoName, setPseudoName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Card Payment States
  const [cardOwner, setCardOwner] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Interactive UI States
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [localPaymentStage, setLocalPaymentStage] = useState<"idle" | "verifying_card" | "processing_stripe" | "approved">("idle");

  // Format credit card number with spaces (xxxx xxxx xxxx xxxx)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // strip non-digits
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted);
  };

  // Format expiry date with slash (MM/AA)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // strip non-digits
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  // Format CVC (max 3 digits)
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCardCvc(value);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // 1. Validate Profile Fields
    if (
      !lastName.trim() || 
      !firstName.trim() || 
      !phoneNumber.trim() || 
      !emailAddress.trim() || 
      !pseudoName.trim() || 
      !password || 
      !confirmPassword
    ) {
      setValidationError("Veuillez remplir tous les champs requis du profil.");
      return;
    }

    if (firstName.trim().length < 2) {
      setValidationError("Le prénom doit contenir au moins 2 caractères.");
      return;
    }

    if (lastName.trim().length < 2) {
      setValidationError("Le nom de famille doit contenir au moins 2 caractères.");
      return;
    }

    if (phoneNumber.trim().length < 5) {
      setValidationError("Le numéro de téléphone doit contenir au moins 5 caractères.");
      return;
    }

    if (phoneNumber.trim().length > 30) {
      setValidationError("Le numéro de téléphone est trop long.");
      return;
    }

    if (pseudoName.trim().length < 2) {
      setValidationError("Le pseudo doit contenir au moins 2 caractères.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Les mots de passe saisis ne correspondent pas.");
      return;
    }

    // 2. Validate Credit Card Fields
    if (!cardOwner.trim()) {
      setValidationError("Veuillez renseigner le nom du titulaire de la carte bancaire.");
      return;
    }

    const cleanCardNum = cardNumber.replace(/\s/g, "");
    if (cleanCardNum.length !== 16) {
      setValidationError("Le numéro de carte doit comporter 16 chiffres.");
      return;
    }

    if (cardExpiry.length !== 5 || !cardExpiry.includes("/")) {
      setValidationError("La date d'expiration de la carte doit être au format MM/AA.");
      return;
    }

    const [expMonthStr, expYearStr] = cardExpiry.split("/");
    const expMonth = parseInt(expMonthStr, 10);
    const expYear = parseInt(expYearStr, 10);
    if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
      setValidationError("Le mois d'expiration est invalide (entre 01 et 12).");
      return;
    }

    if (isNaN(expYear) || expYear < 26) {
      setValidationError("La date d'expiration renseignée est dépassée ou incorrecte.");
      return;
    }

    if (cardCvc.length !== 3) {
      setValidationError("Le code de sécurité CVC est incomplet (3 chiffres requis).");
      return;
    }

    // 3. Luxurious validation simulation stages
    try {
      setLocalPaymentStage("verifying_card");
      await new Promise((resolve) => setTimeout(resolve, 800));

      setLocalPaymentStage("processing_stripe");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLocalPaymentStage("approved");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Trigger parent handler
      await onSubmit({
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        phone: phoneNumber.trim(),
        email: emailAddress.trim().toLowerCase(),
        pseudo: pseudoName.trim(),
        password: password,
      });
      
      setLocalPaymentStage("idle");
    } catch (err: any) {
      setLocalPaymentStage("idle");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-3xl mx-auto bg-slate-900/95 backdrop-blur-md border border-gold/40 rounded-3xl p-6 md:p-10 shadow-[0_0_60px_rgba(212,175,55,0.2)] text-left"
    >
      {/* Back CTA */}
      <button
        onClick={onCancel}
        type="button"
        className="flex items-center gap-1.5 text-[10px] font-black text-gold hover:text-white uppercase tracking-widest mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> Voir l'offre annuelle
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2 pb-4 border-b border-white/5">
        <div>
          <h3 className="text-2xl md:text-3xl font-serif text-white tracking-wide">Formulaire d'Adhésion Privée</h3>
          <p className="text-xs text-slate-400 font-light mt-1">
            Rejoignez H-Conciergerie en remplissant vos accès et votre règlement sécurisé.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-gold/10 border border-gold/20 rounded-lg px-3 py-1.5 text-[10px] font-black text-gold tracking-widest uppercase self-start lg:self-center">
          <Sparkles size={11} /> 1 € / AN
        </div>
      </div>

      {(validationError || error) && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono font-bold">
          {validationError || error}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-8">
        
        {/* SECTION 1: PROFIL & SÉCURITÉ */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-gold font-serif text-sm tracking-widest uppercase border-b border-white/5 pb-2">
            <span className="w-5 h-5 rounded-full bg-gold/10 text-gold flex items-center justify-center text-[10px] font-bold">1</span>
            ACCÈS VIP & PROFIL MEMBRE
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Prénom */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Prénom <span className="text-gold">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><User size={15} /></span>
                <input
                  type="text"
                  required
                  disabled={isLoading || localPaymentStage !== "idle"}
                  placeholder="Ex : Jean"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-11 pr-4 py-3 text-xs text-white outline-none transition-colors disabled:opacity-50"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>

            {/* Nom */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Nom de famille <span className="text-gold">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><User size={15} /></span>
                <input
                  type="text"
                  required
                  disabled={isLoading || localPaymentStage !== "idle"}
                  placeholder="Ex : Dupont"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-11 pr-4 py-3 text-xs text-white outline-none transition-colors disabled:opacity-50"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Téléphone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Téléphone mobile <span className="text-gold">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Phone size={15} /></span>
                <input
                  type="tel"
                  required
                  disabled={isLoading || localPaymentStage !== "idle"}
                  placeholder="Ex : +33 6 12 34 56 78"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-11 pr-4 py-3 text-xs text-white outline-none transition-colors disabled:opacity-50"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Adresse Email <span className="text-gold">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Mail size={15} /></span>
                <input
                  type="email"
                  required
                  disabled={isLoading || localPaymentStage !== "idle"}
                  placeholder="Ex : jean.dupont@email.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-11 pr-4 py-3 text-xs text-white outline-none transition-colors disabled:opacity-50"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pseudo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Nom d'utilisateur (Pseudo unique) <span className="text-gold">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><User size={15} /></span>
              <input
                type="text"
                required
                disabled={isLoading || localPaymentStage !== "idle"}
                placeholder="Ex : jean_vip"
                className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-11 pr-4 py-3 text-xs text-white outline-none transition-colors disabled:opacity-50"
                value={pseudoName}
                onChange={(e) => setPseudoName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Mot de passe */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Mot de passe <span className="text-gold">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Lock size={15} /></span>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  disabled={isLoading || localPaymentStage !== "idle"}
                  placeholder="Min. 6 caractères"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-11 pr-11 py-3 text-xs text-white outline-none transition-colors disabled:opacity-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirmer le Mot de passe */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Confirmer le mot de passe <span className="text-gold">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Lock size={15} /></span>
                <input
                  type={showConfirmPass ? "text" : "password"}
                  required
                  disabled={isLoading || localPaymentStage !== "idle"}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-11 pr-11 py-3 text-xs text-white outline-none transition-colors disabled:opacity-50"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: RÈGLEMENT PAR CARTE SÉCURISÉ */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center gap-2 text-gold font-serif text-sm tracking-widest uppercase border-b border-white/5 pb-2">
            <span className="w-5 h-5 rounded-full bg-gold/10 text-gold flex items-center justify-center text-[10px] font-bold">2</span>
            INFORMATION DE PAIEMENT PAR CARTE (STRIPE/SÉCURISÉ)
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* GORGEOUS GOLD CREDIT CARD PREVIEW DISPLAY */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-72 h-44 rounded-2xl bg-gradient-to-tr from-slate-950 via-[#1d1b15] to-[#2d281c] border border-gold/40 p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden select-none select-none">
                {/* Micro gold ambient glow reflection */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full filter blur-xl pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[8px] text-gold/80 uppercase font-black tracking-[0.2em]">H-Conciergerie</div>
                    <div className="text-[5px] text-slate-400 uppercase font-bold tracking-widest -mt-0.5">MEMBER CLUB PRIVÉ</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                    <Sparkles size={12} className="text-gold" />
                  </div>
                </div>

                {/* Brass Chip layout */}
                <div className="w-8 h-6 bg-gradient-to-br from-gold/40 to-yellow-600/60 rounded-md border border-gold/40 relative overflow-hidden">
                  <div className="absolute inset-x-1.5 inset-y-1 border border-black/10 flex flex-col gap-0.5 justify-between">
                    <div className="h-px bg-black/15 w-full" />
                    <div className="h-px bg-black/15 w-full" />
                  </div>
                </div>

                {/* Card Monospace elements */}
                <div className="space-y-1.5">
                  <div className="font-mono text-sm tracking-widest text-[#D4AF37] text-shadow drop-shadow-md">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                      <div className="text-[5px] text-slate-500 uppercase tracking-widest leading-none">TITULAIRE</div>
                      <div className="font-mono text-[9px] text-slate-300 uppercase tracking-wider truncate max-w-[150px]">
                        {cardOwner || "NOM COMPLET"}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[5px] text-slate-500 uppercase tracking-widest leading-none text-right">EXP</div>
                      <div className="font-mono text-[9px] text-slate-300 text-right leading-none">
                        {cardExpiry || "MM/AA"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENT FORM INPUTS */}
            <div className="lg:col-span-7 space-y-4">
              {/* Titulaire de la carte */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Titulaire de la carte <span className="text-gold">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><User size={15} /></span>
                  <input
                    type="text"
                    required
                    disabled={isLoading || localPaymentStage !== "idle"}
                    placeholder="Ex : JEAN DUPONT"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-11 pr-4 py-2.5 text-xs text-white uppercase outline-none transition-colors"
                    value={cardOwner}
                    onChange={(e) => setCardOwner(e.target.value)}
                  />
                </div>
              </div>

              {/* Numéro de la carte */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Numéro de Carte Bancaire <span className="text-gold">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><CreditCard size={15} /></span>
                  <input
                    type="text"
                    required
                    disabled={isLoading || localPaymentStage !== "idle"}
                    placeholder="4111 2222 3333 4444"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-11 pr-4 py-2.5 text-xs text-white outline-none transition-colors font-mono"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Expiration (MM/AA) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Expiration <span className="text-gold">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Calendar size={15} /></span>
                    <input
                      type="text"
                      required
                      disabled={isLoading || localPaymentStage !== "idle"}
                      placeholder="MM/AA"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-11 pr-4 py-2.5 text-xs text-white outline-none transition-colors font-mono"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                    />
                  </div>
                </div>

                {/* CVV / CVC */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Code CVC <span className="text-gold">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Hash size={15} /></span>
                    <input
                      type="password"
                      required
                      disabled={isLoading || localPaymentStage !== "idle"}
                      placeholder="888"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-11 pr-4 py-2.5 text-xs text-white outline-none transition-colors font-mono"
                      value={cardCvc}
                      onChange={handleCvcChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUBMISSION ACTION AND TRUST */}
        <div className="pt-4 space-y-4">
          <button
            type="submit"
            disabled={isLoading || localPaymentStage !== "idle"}
            className="w-full bg-gold hover:bg-gold-light disabled:bg-gold/40 text-slate-950 font-black tracking-widest uppercase text-xs rounded-xl py-4 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            {localPaymentStage === "verifying_card" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Vérification de la carte...
              </>
            ) : localPaymentStage === "processing_stripe" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Traitement sécurisé Stripe en cours...
              </>
            ) : localPaymentStage === "approved" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Paiement Approved! Accréditation...
              </>
            ) : isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Création de votre accès membre unique...
              </>
            ) : (
              "S'inscrire et Régler 1 €"
            )}
          </button>

          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between text-[10px] text-slate-500 font-medium">
            <div className="flex gap-1.5 items-center">
              <ShieldCheck size={14} className="text-gold" />
              <span>Chiffrement SSL 256 bits (Stripe Payments Certifié)</span>
            </div>
            <div className="text-slate-400 uppercase font-bold tracking-widest text-[9px] bg-white/5 border border-white/5 px-2.5 py-1 rounded">
              Garantie Satisfait ou Remboursé 14j
            </div>
          </div>
        </div>

      </form>
    </motion.div>
  );
}
