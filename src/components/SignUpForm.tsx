import React, { useState } from "react";
import { motion } from "motion/react";
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";

interface SignUpFormProps {
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string;
}

export default function SignUpForm({ onSubmit, onCancel, isLoading, error }: SignUpFormProps) {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [pseudoName, setPseudoName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Input Validations
    if (!lastName.trim() || !firstName.trim() || !phoneNumber.trim() || !emailAddress.trim() || !pseudoName.trim() || !password || !confirmPassword) {
      setValidationError("Veuillez remplir tous les champs requis.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
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
      className="w-full max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-md border border-gold/40 rounded-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(212,175,55,0.15)] text-left"
    >
      {/* Header Form */}
      <button
        onClick={onCancel}
        type="button"
        className="flex items-center gap-1 text-[11px] font-bold text-gold hover:text-white uppercase tracking-widest mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Voir l'offre 365 €
      </button>

      <h3 className="text-2xl md:text-3xl font-serif text-white tracking-wide mb-2">Formulaire d'Adhésion</h3>
      <p className="text-xs text-slate-400 font-light mb-8">
        Créez vos identifiants sécurisés et renseignez vos informations personnelles.
      </p>

      {(validationError || error) && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-bold font-mono">
          {validationError || error}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold hover:bg-gold-light disabled:bg-gold/40 text-slate-950 font-black tracking-widest uppercase text-xs rounded-xl py-4 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Création du compte sécurisé...
              </>
            ) : (
              "Valider & Procéder au Paiement (365 €)"
            )}
          </button>
        </div>

        <div className="pt-4 border-t border-white/5 flex gap-2 items-center justify-center text-[10px] text-slate-500 font-medium">
          <ShieldCheck size={14} className="text-gold" />
          Vos informations sont cryptées et stockées de façon sécurisée.
        </div>
      </form>
    </motion.div>
  );
}
