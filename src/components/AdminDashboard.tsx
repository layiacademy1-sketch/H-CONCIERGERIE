import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Search, ShieldAlert, Award, Calendar, 
  MapPin, Briefcase, Filter, RefreshCw, Star, Trash2, Phone, Mail, CheckCircle2, XCircle, ShieldCheck, Clock
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface Member {
  id: string;
  name: string;
  prenom?: string;
  nom?: string;
  phone: string;
  email: string;
  city?: string;
  pseudo?: string;
  abonnement?: string;
  paiement?: string;
  payment_status: string;
  access_status: string;
  subscription_expires_at?: string;
  created_at?: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
  additionalMembers: Array<{ name: string; city: string; job: string; phone?: string; email?: string }>;
}

export default function AdminDashboard({ onLogout, additionalMembers }: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Phone Verification States
  const [verifyPhoneInput, setVerifyPhoneInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    found: boolean;
    isAdmin: boolean;
    member?: Member;
  } | null>(null);

  const fetchMembers = async () => {
    if (!isSupabaseConfigured()) {
      // Offline fallback simulation data
      setMembers([
        {
          id: "sim-1",
          name: "Jean-Marc Devereaux",
          prenom: "Jean-Marc",
          nom: "Devereaux",
          email: "jean.marc@example.com",
          phone: "0767890987",
          city: "Paris",
          pseudo: "JM75",
          abonnement: "actif",
          paiement: "payé",
          payment_status: "paid",
          access_status: "active",
          subscription_expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
          created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: "sim-2",
          name: "Moussa Al-Amir",
          prenom: "Moussa",
          nom: "Al-Amir",
          email: "moussa.alamir@example.com",
          phone: "0612345678",
          city: "Lyon",
          pseudo: "Mouss99",
          abonnement: "non payé",
          paiement: "en attente",
          payment_status: "pending",
          access_status: "pending",
          subscription_expires_at: undefined,
          created_at: new Date().toISOString()
        }
      ]);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching from public.members:", error);
        setErrorMsg(`Erreur : ${error.message}`);
        return;
      }

      if (data) {
        const normalized = data.map((item: any) => {
          const namePart = item.full_name || `${item.prenom || ""} ${item.nom || ""}`.trim() || item.name || "Nom non spécifié";
          return {
            id: item.auth_user_id || item.id,
            name: namePart,
            prenom: item.prenom || item.first_name || "",
            nom: item.nom || item.last_name || "",
            email: item.email || "Email non renseigné",
            phone: item.phone || item.telephone || "Non renseigné",
            city: item.city || item.ville || "",
            pseudo: item.pseudo || "",
            abonnement: item.abonnement || (item.access_status === "active" ? "actif" : "non payé"),
            paiement: item.paiement || (item.payment_status === "paid" ? "payé" : "en attente"),
            payment_status: item.payment_status || "pending",
            access_status: item.access_status || "pending",
            subscription_expires_at: item.subscription_expires_at,
            created_at: item.created_at
          };
        });
        setMembers(normalized);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Erreur d'accès à la table : ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();

    if (isSupabaseConfigured()) {
      console.log("Setting up Supabase real-time subscription for members table...");
      const channel = supabase
        .channel("members-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "members" },
          (payload) => {
            console.log("Real-time change detected inside AdminDashboard.tsx:", payload);
            fetchMembers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [additionalMembers]);

  const handleVerifyPhone = () => {
    const cleanedSearch = verifyPhoneInput.replace(/\s+/g, "").trim();
    if (!cleanedSearch) {
      setVerificationResult(null);
      return;
    }

    // Special verification check for test number
    if (cleanedSearch === "0761771520" || cleanedSearch === "+33761771520" || cleanedSearch.includes("0761771520")) {
      setVerificationResult({
        found: true,
        isAdmin: true,
        member: {
          id: "admin-verified-0761771520",
          name: "Membre Admin",
          phone: "0761771520",
          email: "management@h-conciergerie.com",
          payment_status: "paid",
          access_status: "active",
          created_at: new Date().toISOString()
        }
      });
      return;
    }

    // Search across list of members
    const foundMember = members.find(m => {
      const p = m.phone || "";
      const cleanedP = p.replace(/\s+/g, "");
      return cleanedP.includes(cleanedSearch) || cleanedSearch.includes(cleanedP);
    });

    if (foundMember) {
      setVerificationResult({
        found: true,
        isAdmin: false,
        member: foundMember
      });
    } else {
      setVerificationResult({
        found: false,
        isAdmin: false
      });
    }
  };

  const safeUpdateMember = async (auth_user_id: string, initialPayload: any) => {
    let payload = { ...initialPayload };
    let attempts = 0;
    while (attempts < 15) {
      attempts++;
      try {
        const { error } = await supabase
          .from("members")
          .update(payload)
          .eq("auth_user_id", auth_user_id);

        if (!error) {
          return null;
        }

        console.warn(`Update attempt ${attempts} failed:`, error.message);
        const msg = error.message || "";
        let columnMatch = msg.match(/column "([^"]+)"/i);
        if (!columnMatch) {
          columnMatch = msg.match(/has no column named "([^"]+)"/i);
        }
        if (!columnMatch) {
          columnMatch = msg.match(/column_name "([^"]+)"/i);
        }

        if (columnMatch && columnMatch[1]) {
          const columnName = columnMatch[1];
          console.log(`Removing non-existent column '${columnName}' from update payload and retrying...`);
          delete payload[columnName];
        } else {
          return error;
        }
      } catch (e: any) {
        console.error("Exception in safeUpdateMember:", e);
        return e;
      }
    }
    return new Error("Too many retries stripping column updates");
  };

  const handleChangeMemberStatus = async (auth_user_id: string, targetStatus: "pending" | "active" | "expired") => {
    const isAct = targetStatus === "active";
    const isPending = targetStatus === "pending";
    const isExpired = targetStatus === "expired";

    const expDate = new Date();
    if (isAct) {
      expDate.setFullYear(expDate.getFullYear() + 1);
    } else if (isExpired) {
      expDate.setDate(expDate.getDate() - 2); // Already expired
    }

    const payload: any = {
      access_status: targetStatus,
      payment_status: isAct ? "paid" : (isPending ? "pending" : "paid"),
      subscription_expires_at: isPending ? null : expDate.toISOString(),
      
      // Also write french equivalents to ensure compatibility across client-side column reads
      acces_membre: isAct,
      paiement: isAct ? "payé" : (isPending ? "en attente" : "payé"),
      abonnement: isAct ? "actif" : (isPending ? "non payé" : "expiré")
    };

    if (!isSupabaseConfigured()) {
      // Simulation update
      setMembers(prev => prev.map(m => {
        if (m.id === auth_user_id) {
          return {
            ...m,
            ...payload
          };
        }
        return m;
      }));
      return;
    }

    try {
      const error = await safeUpdateMember(auth_user_id, payload);
      if (error) {
        console.error("Failed to update status in public.members:", error.message);
      }
      await fetchMembers();
    } catch (err) {
      console.error("Failed to update member status", err);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!isSupabaseConfigured()) {
      setMembers(prev => prev.filter(m => m.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("auth_user_id", id);

      if (error) {
        console.error("Error deleting member", error);
      } else {
        await fetchMembers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtering based on search query (by member name or email)
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Non spécifiée";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };
;

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-gold selection:text-slate-950 pt-28 flex flex-col">
      
      {/* HEADER BAR */}
      <div className="bg-slate-900 border-b border-rose-500/20 px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-widest uppercase text-white">Supervision Concierge Admin</span>
              <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                Accès Protégé
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Gestion globale des adhérents, des candidatures et du statut des accréditations.</p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-slate-300 hover:bg-rose-600 hover:text-white hover:border-rose-600 rounded-xl transition-all cursor-pointer"
        >
          Se déconnecter de l'admin
        </button>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        
        {/* WELCOME REPORT & KPI CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Total membres Card */}
          <div className="lg:col-span-4 bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute right-4 bottom-4 text-gold/10">
              <Users size={80} />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase block mb-1">Total membres</span>
              <span className="text-4xl font-serif text-white font-bold">{members.length}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-4 font-light">
              Données de la base VIP globale chiffrées en toute confidentialité.
            </p>
          </div>

          {/* Verification Widget Card */}
          <div className="lg:col-span-8 bg-slate-900 border border-white/5 rounded-2xl p-6 relative flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <h4 className="text-xs font-black tracking-widest uppercase text-slate-200">
                  Vérificateur de Numéro Adhérent (Recherche)
                </h4>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text"
                    placeholder="Saisir ou coller un numéro de téléphone du membre..."
                    className="w-full bg-slate-950 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white outline-none focus:border-gold transition-colors font-mono"
                    value={verifyPhoneInput}
                    onChange={(e) => setVerifyPhoneInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleVerifyPhone();
                    }}
                  />
                </div>
                <button
                  onClick={handleVerifyPhone}
                  className="bg-gold hover:bg-gold-light text-[#0A0D14] px-6 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-colors shrink-0 cursor-pointer"
                >
                  Rechercher statut
                </button>
              </div>

              {/* Dynamic Verification Result View */}
              <AnimatePresence mode="wait">
                {verificationResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 1, y: -10 }}
                    className={`p-4 rounded-xl border ${
                      verificationResult.found 
                        ? (verificationResult.isAdmin ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-gold/10 border-gold/30')
                        : 'bg-red-500/10 border-red-500/20'
                    }`}
                  >
                    {verificationResult.found && verificationResult.member ? (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white font-serif">{verificationResult.member.name}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              verificationResult.isAdmin ? 'bg-emerald-500 text-slate-950' : 'bg-gold text-slate-950'
                            }`}>
                              {verificationResult.isAdmin ? 'MEMBRE ADMIN' : verificationResult.member.access_status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-light flex flex-wrap gap-x-4 gap-y-1">
                            <span>📧 Email : {verificationResult.member.email}</span>
                            {verificationResult.member.phone && <span className="font-mono">📞 Tél : {verificationResult.member.phone}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[10px] tracking-wider shrink-0">
                          <CheckCircle2 size={16} /> Statut Confirmé
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-red-400 font-medium">
                          Membre non enregistré
                        </span>
                        <div className="flex items-center gap-1 text-red-400 font-bold uppercase text-[10px] tracking-wider shrink-0">
                          <XCircle size={16} /> non trouvé
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* CONTROLS BAR: SEARCH */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, email ou numéro..."
              className="w-full bg-slate-950 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37]/50 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="px-4 py-3 bg-slate-950 hover:bg-white/5 border border-white/5 text-xs text-slate-400 font-bold rounded-xl transition-colors cursor-pointer"
              title="Réinitialiser la recherche"
            >
              <RefreshCw size={13} />
            </button>
          )}
        </div>

        {/* error message display */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-sm text-red-400 font-light text-center">
            {errorMsg}
          </div>
        )}

        {/* loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12 gap-2">
            <RefreshCw size={16} className="text-gold animate-spin" />
            <span className="text-xs text-slate-400 tracking-wider">Chargement des membres depuis Supabase public.members...</span>
          </div>
        )}

        {/* MEMBERS DATABASE TABLE / CARD VIEW */}
        {!loading && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-serif text-lg tracking-widest uppercase flex items-center gap-2">
                <Users size={18} className="text-[#D4AF37]" /> Annuaire des Membres
              </h3>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                Résultat : {filteredMembers.length} de {members.length}
              </span>
            </div>

            {filteredMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredMembers.map((member) => (
                    <motion.div 
                      key={member.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 rounded-2xl bg-slate-900 border border-white/5 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-all group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            {member.access_status === "pending" && (
                              <span className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1 text-[10px] text-amber-500 font-extrabold tracking-widest uppercase inline-block animate-pulse">
                                En attente de validation
                              </span>
                            )}
                            {member.access_status === "active" && (
                              <span className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-2.5 py-1 text-[10px] text-emerald-400 font-extrabold tracking-widest uppercase inline-block">
                                Activé
                              </span>
                            )}
                            {member.access_status === "expired" && (
                              <span className="bg-red-500/10 border border-red-500/30 rounded-lg px-2.5 py-1 text-[10px] text-red-500 font-extrabold tracking-widest uppercase inline-block">
                                Expiré
                              </span>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => handleDeleteMember(member.id)}
                            className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                            title="Supprimer du registre"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <h4 className="text-lg font-serif text-white mb-3 tracking-wide group-hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 flex-wrap">
                          <span>{member.prenom || ""} {member.nom || ""}</span>
                          {member.pseudo && <span className="text-xs text-slate-400">({member.pseudo})</span>}
                        </h4>

                        <div className="space-y-2.5 text-xs mb-4">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Mail size={12} className="text-[#D4AF37] shrink-0" />
                            <span className="truncate text-slate-300 font-light" title={member.email}>{member.email}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-slate-300">
                            <Phone size={12} className="text-[#D4AF37] shrink-0" />
                            <span className="font-mono text-slate-300 font-light">{member.phone}</span>
                          </div>

                          {member.city && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <MapPin size={12} className="text-[#D4AF37] shrink-0" />
                              <span className="text-slate-300 font-light">{member.city}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5 space-y-0.5">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Abonnement</span>
                              <span className={`text-[10px] font-black uppercase ${member.abonnement === "actif" ? "text-emerald-400" : "text-amber-500"}`}>
                                {member.abonnement || "Aucun"}
                              </span>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5 space-y-0.5">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Paiement</span>
                              <span className={`text-[10px] font-black uppercase ${member.paiement === "payé" ? "text-emerald-400" : "text-amber-500"}`}>
                                {member.paiement || "Non payé"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-slate-400 pt-1.5">
                            <Calendar size={12} className="text-slate-500 shrink-0" />
                            <span className="text-[10px] text-slate-400 font-light">Inscrit le : <span className="font-mono text-slate-300">{formatDate(member.created_at)}</span></span>
                          </div>

                          {member.subscription_expires_at && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Clock size={12} className="text-slate-500 shrink-0" />
                              <span className="text-[10px] text-slate-400 font-light">Expire le : <span className="font-mono text-slate-300">{formatDate(member.subscription_expires_at)}</span></span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 border-t border-white/5 pt-4 flex flex-col gap-3">
                        <div className="flex flex-col gap-1 w-full">
                          <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Modifier le statut</label>
                          <select
                            value={member.access_status}
                            onChange={(e) => handleChangeMemberStatus(member.id, e.target.value as "pending" | "active" | "expired")}
                            className="bg-slate-950 border border-white/10 text-xs text-white px-3 py-2 rounded-lg outline-none focus:border-[#D4AF37] transition-all"
                          >
                            <option value="pending">En attente (Validation)</option>
                            <option value="active">Activé</option>
                            <option value="expired">Expiré</option>
                          </select>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button 
                            onClick={() => window.open(`https://wa.me/33756832263?text=Bonjour,%20en%20tant%20qu'administrateur%20H-Conciergerie%20je%20souhaite%20contacter%20le%20membre%20${encodeURIComponent(member.prenom || '')}%20${encodeURIComponent(member.nom || '')}.`)}
                            className="bg-white/5 hover:bg-white text-slate-300 hover:text-slate-950 text-[10px] font-extrabold px-3 py-2 rounded-lg transition-all"
                          >
                            Contacter via WhatsApp
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-slate-900 border border-white/5">
                <span className="text-slate-400 text-sm font-light block mb-2">Aucun adhérent ne correspond à vos critères de recherche.</span>
                <p className="text-xs text-slate-600 font-mono">public.members table vide ou aucun enregistrement trouvé</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
