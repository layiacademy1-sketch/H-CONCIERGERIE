import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Search, ShieldAlert, Award, Calendar, 
  MapPin, Briefcase, Filter, RefreshCw, Star, Trash2, Phone, Mail, CheckCircle2, XCircle, ShieldCheck
} from "lucide-react";

interface Member {
  id: string | number;
  name: string;
  city: string;
  job: string;
  phone?: string;
  email?: string;
  dateJoined: string;
  status: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
  additionalMembers: Array<{ name: string; city: string; job: string; phone?: string; email?: string }>;
}

export default function AdminDashboard({ onLogout, additionalMembers }: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [members, setMembers] = useState<Member[]>([]);

  // Phone Verification States
  const [verifyPhoneInput, setVerifyPhoneInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    found: boolean;
    isAdmin: boolean;
    member?: Member;
  } | null>(null);

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
          city: "Moroni / Paris",
          job: "Administrateur Système",
          phone: "0761771520",
          email: "management@h-conciergerie.com",
          dateJoined: "1 Janvier 2026",
          status: "ADMINISTRATEUR CRITIQUE"
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

  // Default initial members list
  const baseMembers: Member[] = [
    {
      id: 1,
      name: "Jean-Marc Devereaux",
      city: "Paris",
      job: "Chef d'Entreprise (Luxe)",
      phone: "0767890987",
      dateJoined: "12 Avril 2026",
      status: "MEMBRE"
    }
  ];

  useEffect(() => {
    // Combine base with additional newly registered members
    const formattedAdditionals = additionalMembers.map((m, idx) => ({
      id: `new-${idx}`,
      name: m.name,
      city: m.city,
      job: m.job,
      phone: m.phone || "",
      dateJoined: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: "MEMBRE"
    }));

    // Check if there are also locally saved ones in localStorage
    const saved = localStorage.getItem("h_members");
    let parsedSaved: Member[] = [];
    if (saved) {
      try {
        parsedSaved = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    // Merge everything uniquely
    const all = [...parsedSaved, ...formattedAdditionals, ...baseMembers];
    // Remove duplicates based on name & city combination
    const unique = all.filter((value, index, self) =>
      self.findIndex(m => m.name.toLowerCase() === value.name.toLowerCase() && m.city.toLowerCase() === value.city.toLowerCase()) === index
    );

    setMembers(unique);
  }, [additionalMembers]);

  // Extract all unique cities for filtering options
  const cities = ["all", ...Array.from(new Set(members.map(m => m.city)))];

  // Filtering based on search query (name or city) and filter criteria
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      member.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.job.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCity = filterCity === "all" || member.city.toLowerCase() === filterCity.toLowerCase();

    return matchesSearch && matchesCity;
  });

  const handleDeleteMember = (id: string | number) => {
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    // Write back any newly persisted to maintain consistency
    const saved = localStorage.getItem("h_members");
    if (saved) {
      try {
        const parsedSaved: Member[] = JSON.parse(saved);
        const filteredSaved = parsedSaved.filter(m => m.id !== id);
        localStorage.setItem("h_members", JSON.stringify(filteredSaved));
      } catch (e) {
        console.error(e);
      }
    }
  };

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
                              {verificationResult.isAdmin ? 'MEMBRE ADMIN' : verificationResult.member.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-light flex flex-wrap gap-x-4 gap-y-1">
                            <span>📍 Ville : {verificationResult.member.city}</span>
                            <span>💼 Activité : {verificationResult.member.job}</span>
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

        {/* CONTROLS BAR: SEARCH & CITY FILTER */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, ville ou métier..."
              className="w-full bg-slate-950 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs text-white outline-none focus:border-rose-500/50 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
              <select 
                className="bg-slate-950 border border-white/5 rounded-xl pl-10 pr-6 py-3 text-xs text-slate-300 outline-none cursor-pointer focus:border-rose-500/50 transition-colors appearance-none w-full"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
              >
                <option value="all">Toutes les Villes</option>
                {cities.filter(c => c !== "all").map((city, idx) => (
                  <option key={idx} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => { setSearchQuery(""); setFilterCity("all"); }}
              className="px-4 py-3 bg-slate-950 hover:bg-white/5 border border-white/5 text-xs text-slate-400 font-bold rounded-xl transition-colors cursor-pointer"
              title="Réinitialiser les filtres"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* MEMBERS DATABASE TABLE / CARD VIEW */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-serif text-lg tracking-widest uppercase flex items-center gap-2">
              <Users size={18} className="text-rose-500" /> Annuaire des Membres Confiés
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
                    className="p-6 rounded-2xl bg-slate-900 border border-white/5 flex flex-col justify-between hover:border-rose-500/30 transition-all group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-slate-950 border border-white/5 rounded-lg px-2.5 py-1 text-[9px] text-[#D4AF37] font-black tracking-widest uppercase">
                          {member.status}
                        </span>
                        
                        {/* Only allow deleting if it's dynamic or custom-added */}
                        {typeof member.id === 'string' && member.id.startsWith('new-') && (
                          <button 
                            onClick={() => handleDeleteMember(member.id)}
                            className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                            title="Supprimer du registre local"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <h4 className="text-lg font-serif text-white mb-3 tracking-wide group-hover:text-rose-400 transition-colors">
                        {member.name}
                      </h4>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin size={12} className="text-rose-500 shrink-0" />
                          <span className="font-semibold text-white">{member.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Briefcase size={12} className="text-rose-500 shrink-0" />
                          <span className="truncate">{member.job}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-2 text-slate-400 font-mono">
                            <Phone size={12} className="text-[#D4AF37] shrink-0" />
                            <span className="truncate">{member.phone}</span>
                          </div>
                        )}
                        {member.email && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <Mail size={12} className="text-blue-400 shrink-0" />
                            <span className="truncate text-[11px]">{member.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar size={12} className="text-slate-500 shrink-0" />
                          <span className="text-[10px] text-slate-500">Inscrit le {member.dateJoined}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-white/5 pt-4 flex justify-between items-center">
                      <span className="text-[9px] uppercase font-black tracking-widest text-[#D4AF37]">
                        Statut : Certifié VIP
                      </span>
                      <button 
                        onClick={() => window.open(`https://wa.me/33756832263?text=Bonjour,%20en%20tant%20qu'administrateur%20H-Conciergerie%20je%20souhaite%20contacter%20le%20membre%20${encodeURIComponent(member.name)}.`)}
                        className="bg-white/5 hover:bg-white text-slate-300 hover:text-slate-950 text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all"
                      >
                        Contacter
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-white/5">
              <span className="text-slate-400 text-sm font-light block mb-2">Aucun adhérent ne correspond à vos critères de recherche.</span>
              <p className="text-xs text-slate-500">Essayez de saisir un autre nom de ville ou d'adhérent.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
