import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, 
  ArrowLeft, Loader2, Sparkles 
} from "lucide-react";

interface SignUpFormProps {
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string;
}

export default function SignUpForm({ onSubmit, onCancel, isLoading, error }: SignUpFormProps) {
  // Profil Information States
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [pseudoName, setPseudoName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Interactive UI States
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validate Profile Fields
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

    try {
      // Trigger parent registration handler (which registers in Auth/Firestore and redirects to Stripe link)
      await onSubmit({
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        phone: phoneNumber.trim(),
        email: emailAddress.trim().toLowerCase(),
        pseudo: pseudoName.trim(),
        password: password,
      });
    } catch (err: any) {
      // Parent handle error
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto bg-slate-900/95 backdrop-blur-md border border-gold/40 rounded-3xl p-6 md:p-10 shadow-[0_0_60px_rgba(212,175,55,0.2)] text-left"
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
          <h3 className="text-xl md:text-2xl font-serif text-white tracking-wide">Formulaire d'Adhésion Privée</h3>
          <p className="text-xs text-slate-400 font-light mt-1">
            Créez votre compte membre sécurisé VIP et procédez à l'accréditation.
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

      <form onSubmit={handleFormSubmit} className="space-y-6">
        
        {/* SECTION PROFILE */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gold font-serif text-xs tracking-widest uppercase border-b border-white/5 pb-2">
            <span className="w-5 h-5 rounded-full bg-gold/10 text-gold flex items-center justify-center text-[10px] font-bold">1</span>
            INFORMATIONS PERSONNELLES
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prénom */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Prénom <span className="text-gold">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><User size={15} /></span>
                <input
                  type="text"
                  required
                  disabled={isLoading}
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
                  disabled={isLoading}
                  placeholder="Ex : Dupont"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-11 pr-4 py-3 text-xs text-white outline-none transition-colors disabled:opacity-50"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Téléphone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Téléphone mobile <span className="text-gold">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Phone size={15} /></span>
                <input
                  type="tel"
                  required
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                disabled={isLoading}
                placeholder="Ex : jean_vip"
                className="w-full bg-slate-950 border border-slate-800 focus:border-gold rounded-xl pl-11 pr-4 py-3 text-xs text-white outline-none transition-colors disabled:opacity-50"
                value={pseudoName}
                onChange={(e) => setPseudoName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mot de passe */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Mot de passe <span className="text-gold">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Lock size={15} /></span>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  disabled={isLoading}
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
                  disabled={isLoading}
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

        {/* SUBMISSION ACTION AND TRUST */}
        <div className="pt-4 space-y-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold hover:bg-gold-light disabled:bg-gold/40 text-slate-950 font-black tracking-widest uppercase text-xs rounded-xl py-4 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Création de votre accès membre unique...
              </>
            ) : (
              "S'inscrire et finaliser le Règlement (1 €)"
            )}
          </button>

          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between text-[10px] text-slate-500 font-medium">
            <div className="flex gap-1.5 items-center">
              <ShieldCheck size={14} className="text-gold" />
              <span>Votre profil est sécurisé et crypté (Norme SSL)</span>
            </div>
            <div className="text-slate-400 uppercase font-bold tracking-widest text-[9px] bg-white/5 border border-white/5 px-2.5 py-1 rounded">
              Lien de paiement Stripe officiel 
            </div>
          </div>
        </div>

      </form>
    </motion.div>
  );
}
