import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Search, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  User, 
  SlidersHorizontal, 
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  X,
  Map,
  Compass,
  ArrowLeft,
  Heart
} from "lucide-react";

// Types
interface Agency {
  id: string;
  city: string;
  name: string;
  address: string;
  type: "aeroport" | "gare" | "ville";
}

interface Vehicle {
  id: string;
  name: string;
  category: "Berline de prestige" | "Supercar d'exception" | "S.U.V de luxe" | "Électrique sport";
  image: string;
  seats: number;
  gearbox: "Automatique" | "Manuelle";
  propulsion: "Électrique" | "Essence" | "Hybride";
  pricePerDay: number;
  features: string[];
}

// Database of premium locations in France
const agencies: Agency[] = [
  { id: "cdg", city: "Paris", name: "Aéroport Paris-Charles de Gaulle (CDG)", address: "Terminal 2, Roissy-en-France", type: "aeroport" },
  { id: "ory", city: "Paris", name: "Aéroport Paris-Orly (ORY)", address: "Orly 4, Terminal Ouest", type: "aeroport" },
  { id: "gdl", city: "Paris", name: "Paris Gare de Lyon", address: "Place Louis-Armand, 75012 Paris", type: "gare" },
  { id: "gdn", city: "Paris", name: "Paris Gare du Nord", address: "18 Rue de Dunkerque, 75010 Paris", type: "gare" },
  { id: "par-ctr", city: "Paris", name: "Paris Centre Étoile", address: "6 Avenue Foch, 75116 Paris", type: "ville" },
  { id: "nce", city: "Nice", name: "Aéroport Nice Côte d'Azur (NCE)", address: "Terminal 1 & 2, Avenue des Floralies", type: "aeroport" },
  { id: "lys", city: "Lyon", name: "Aéroport Lyon-Saint Exupéry (LYS)", address: "Colombier-Saugnieu", type: "aeroport" },
  { id: "ly-part", city: "Lyon", name: "Lyon Part-Dieu", address: "5 Place Charles Béraudier, 69003 Lyon", type: "gare" },
  { id: "mrs-stc", city: "Marseille", name: "Marseille Saint-Charles", address: "Square Narvik, 13001 Marseille", type: "gare" },
  { id: "bdx-stj", city: "Bordeaux", name: "Bordeaux Saint-Jean", address: "Rue Charles Domercq, 33800 Bordeaux", type: "gare" },
  { id: "nce-prom", city: "Nice", name: "Nice Promenade des Anglais", address: "3 Avenue Gustave V, 06000 Nice", type: "ville" },
  { id: "mco", city: "Monaco", name: "Monaco Larvotto", address: "24 Boulevard Princesse Grace, 98000 Monaco", type: "ville" },
  { id: "can-crois", city: "Cannes", name: "Cannes Croisette", address: "38 Boulevard de la Croisette, 06400 Cannes", type: "ville" }
];

// Rich set of luxury vehicles
const premiumVehicles: Vehicle[] = [
  {
    id: "porsche-911",
    name: "Porsche 911 Carrera S",
    category: "Supercar d'exception",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800",
    seats: 4,
    gearbox: "Automatique",
    propulsion: "Essence",
    pricePerDay: 480,
    features: ["Suspension active", "Échappement sport sport", "Système audio Burmester", "Sièges chauffants ventilés"]
  },
  {
    id: "audi-etron",
    name: "Audi e-tron GT RS",
    category: "Électrique sport",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800",
    seats: 5,
    gearbox: "Automatique",
    propulsion: "Électrique",
    pricePerDay: 290,
    features: ["Quattro roues directrices", "Affichage tête haute", "Toit panoramique", "Charge ultra-rapide"]
  },
  {
    id: "range-rover",
    name: "Range Rover Autobiography",
    category: "S.U.V de luxe",
    image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=800",
    seats: 5,
    gearbox: "Automatique",
    propulsion: "Hybride",
    pricePerDay: 350,
    features: ["Massage pierres chaudes", "Suspension pneumatique", "Console frigo intégrée", "Champagne VIP kit"]
  },
  {
    id: "mercedes-s",
    name: "Mercedes-Benz Classe S",
    category: "Berline de prestige",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800",
    seats: 5,
    gearbox: "Automatique",
    propulsion: "Hybride",
    pricePerDay: 380,
    features: ["Intérieur cuir nappa", "Écrans arrières confort", "Chauffeur privé disponible", "Fermeture assistée soft-close"]
  },
  {
    id: "tesla-s",
    name: "Tesla Model S Plaid",
    category: "Électrique sport",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800",
    seats: 5,
    gearbox: "Automatique",
    propulsion: "Électrique",
    pricePerDay: 260,
    features: ["1020 chevaux", "Pilote automatique", "Console de jeux intégrée", "0 à 100 km/h en 2.1s"]
  },
  {
    id: "ferrari-f8",
    name: "Ferrari F8 Tributo",
    category: "Supercar d'exception",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800",
    seats: 2,
    gearbox: "Automatique",
    propulsion: "Essence",
    pricePerDay: 950,
    features: ["Moteur V8 Bi-turbo", "Châssis carbone ultra-léger", "Mode de conduite Course", "Sensations pures de F1"]
  }
];

export default function CarRentalPage({ onBack }: { onBack: () => void }) {
  // Navigation states
  const [activeTab, setActiveTab] = useState<"tous" | "berline" | "sport" | "suv">("tous");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Search Engine states
  const [pickupInput, setPickupInput] = useState("");
  const [pickupAgency, setPickupAgency] = useState<Agency | null>(null);
  const [showPickupList, setShowPickupList] = useState(false);

  const [returnSameAgency, setReturnSameAgency] = useState(true);
  const [dropoffInput, setDropoffInput] = useState("");
  const [dropoffAgency, setDropoffAgency] = useState<Agency | null>(null);
  const [showDropoffList, setShowDropoffList] = useState(false);

  // Dates (Using simple date objects for easy validation)
  const today = new Date();
  const formatIso = (d: Date) => d.toISOString().split("T")[0];

  const [pickupDate, setPickupDate] = useState<string>(formatIso(today));
  // Default dropoff is 3 days later
  const threeDaysLater = new Date();
  threeDaysLater.setDate(today.getDate() + 3);
  const [dropoffDate, setDropoffDate] = useState<string>(formatIso(threeDaysLater));

  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropoffTime, setDropoffTime] = useState("17:00");

  const [lastSearchQuery, setLastSearchQuery] = useState<{
    pickup: string;
    dropoff: string;
    pickupDate: string;
    dropoffDate: string;
  } | null>(null);

  // Modal active state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isBookedSuccess, setIsBookedSuccess] = useState(false);

  // References
  const pickupRef = useRef<HTMLDivElement>(null);
  const dropoffRef = useRef<HTMLDivElement>(null);

  // Hours list (08:00 to 20:00)
  const hoursList = Array.from({ length: 13 }, (_, i) => {
    const hr = 8 + i;
    return `${String(hr).padStart(2, "0")}:00`;
  });

  // Calculate return limitations (Return date must be at least 3 days after pickup date)
  const getMinReturnDate = (pickupStr: string) => {
    if (!pickupStr) return formatIso(today);
    const dateObj = new Date(pickupStr);
    dateObj.setDate(dateObj.getDate() + 3);
    return formatIso(dateObj);
  };

  // Sync / validate return date whenever pickup changes
  useEffect(() => {
    const minReturn = getMinReturnDate(pickupDate);
    if (new Date(dropoffDate) < new Date(minReturn)) {
      setDropoffDate(minReturn);
    }
  }, [pickupDate]);

  // Handle clicking outside suggestions to close them
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickupRef.current && !pickupRef.current.contains(e.target as Node)) {
        setShowPickupList(false);
      }
      if (dropoffRef.current && !dropoffRef.current.contains(e.target as Node)) {
        setShowDropoffList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePickPickupAgency = (agency: Agency) => {
    setPickupAgency(agency);
    setPickupInput(`${agency.city} - ${agency.name}`);
    setShowPickupList(false);
  };

  const handlePickDropoffAgency = (agency: Agency) => {
    setDropoffAgency(agency);
    setDropoffInput(`${agency.city} - ${agency.name}`);
    setShowDropoffList(false);
  };

  // Filter suggestion list based on what user compiles
  const filteredPickupAgencies = agencies.filter(agency => 
    agency.name.toLowerCase().includes(pickupInput.toLowerCase()) ||
    agency.city.toLowerCase().includes(pickupInput.toLowerCase())
  );

  const filteredDropoffAgencies = agencies.filter(agency => 
    agency.name.toLowerCase().includes(dropoffInput.toLowerCase()) ||
    agency.city.toLowerCase().includes(dropoffInput.toLowerCase())
  );

  const toggleFavoriteClass = (id: string) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle CTA Search Click
  const [isFilteringCars, setIsFilteringCars] = useState(false);
  const handleSearchVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAgency) {
      alert("Veuillez sélectionner une agence de départ dans la liste.");
      return;
    }
    if (!returnSameAgency && !dropoffAgency) {
      alert("Veuillez sélectionner une agence de retour dans la liste.");
      return;
    }

    setIsFilteringCars(true);
    setLastSearchQuery({
      pickup: pickupAgency.name,
      dropoff: returnSameAgency ? pickupAgency.name : dropoffAgency!.name,
      pickupDate,
      dropoffDate
    });

    setTimeout(() => {
      setIsFilteringCars(false);
      // Smooth scroll to results
      const resultsSection = document.getElementById("search-results-anchor");
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 800);
  };

  // Filter vehicle lists based on simple categories
  const displayedCars = premiumVehicles.filter(car => {
    if (activeTab === "tous") return true;
    if (activeTab === "berline") return car.category === "Berline de prestige";
    if (activeTab === "sport") return car.category === "Supercar d'exception" || car.category === "Électrique sport";
    if (activeTab === "suv") return car.category === "S.U.V de luxe";
    return true;
  });

  // Launch pre-configured premium WhatsApp communication hook
  const handleConfirmReservation = (vehicle: Vehicle) => {
    const cleanPickup = pickupAgency ? `${pickupAgency.city} (${pickupAgency.name})` : "Paris Centre";
    const cleanDropoff = returnSameAgency ? cleanPickup : (dropoffAgency ? `${dropoffAgency.city} (${dropoffAgency.name})` : "Paris Centre");
    
    const message = `Bonjour H-CONCIERGERIE, je souhaite réserver la voiture d'exception suivante :
📌 Véhicule : ${vehicle.name}
📍 Agence de départ : ${cleanPickup}
🏁 Agence de retour : ${cleanDropoff}
📅 Date de départ : ${pickupDate} à ${pickupTime}
📅 Date de retour : ${dropoffDate} à ${dropoffTime}
💎 Avantages VIP demandés : Assistance premium incluse, accueil VIP.`;

    const whatsAppUrl = `https://wa.me/33774067388?text=${encodeURIComponent(message)}`;
    window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
    setIsBookedSuccess(true);
    setTimeout(() => {
      setIsBookedSuccess(false);
      setSelectedVehicle(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 relative font-sans">
      {/* Premium Hero Design Header inspired by luxury mobility */}
      <div className="relative bg-slate-950 text-white pt-28 pb-56 px-6 overflow-hidden">
        {/* Abstract luxury ambient vectors */}
        <div className="absolute inset-0 z-0 opacity-10 blur-3xl pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500 rounded-full mix-blend-screen" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full transition-all text-xs tracking-wider uppercase mb-8 cursor-pointer border border-white/10 backdrop-blur-md"
          >
            <ArrowLeft size={14} />
            <span>Retour à l'accueil</span>
          </button>
          
          <span className="text-gold tracking-[0.4em] uppercase text-xs font-black mb-6 block">
            LOCATION DE PRESTIGE
          </span>
          
          {/* Beautiful and modern widescreen banner */}
          <div className="relative max-w-5xl mx-auto aspect-[21/9] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.5)] group/banner">
            <img 
              src="https://image.noelshack.com/fichiers/2026/21/6/1779532416-chatgpt-image-23-mai-2026-12-33-30.jpg" 
              alt="H-Conciergerie Luxury Fleet"
              className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover/banner:scale-103"
              referrerPolicy="no-referrer"
            />
            {/* Absolute overlay elements for deep aesthetic appeal */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/40 pointer-events-none" />
            
            {/* Elegant glassmorphism VIP metadata badge on bottom-left */}
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 text-left z-15 backdrop-blur-md bg-slate-950/70 py-3.5 px-5 md:py-4 md:px-6 rounded-2xl border border-white/10 max-w-xs md:max-w-md pointer-events-none select-none">
              <span className="text-gold tracking-[0.3em] uppercase text-[9px] font-black block mb-0.5">
                EXCLUSIVITÉ CONCIERGERIE
              </span>
              <h2 className="text-white font-serif font-black text-sm md:text-lg leading-tight">
                La quintessence de la route
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Search Engine component floating on background */}
      <div className="max-w-6xl mx-auto px-4 -mt-44 relative z-30 mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-950/20 p-6 md:p-10 border border-slate-100/80"
        >
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-gold">
              <Car size={18} />
            </div>
            <div>
              <h2 className="font-serif font-black text-lg md:text-xl text-slate-950 tracking-wide">
                Réservez votre véhicule VIP
              </h2>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Tarifs ultra négociés & avantages H-CONCIERGERIE inclus
              </p>
            </div>
          </div>

          <form onSubmit={handleSearchVehicle} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* Departure Input */}
              <div ref={pickupRef} className="relative flex flex-col gap-1.5 lg:col-span-2">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <MapPin size={11} className="text-[#e31c25]" />
                  Agence de Départ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ville, gare, aéroport..."
                    value={pickupInput}
                    onChange={(e) => {
                      setPickupInput(e.target.value);
                      setShowPickupList(true);
                      if (pickupAgency && `${pickupAgency.city} - ${pickupAgency.name}` !== e.target.value) {
                        setPickupAgency(null);
                      }
                    }}
                    onFocus={() => setShowPickupList(true)}
                    className="w-full bg-slate-50 border border-slate-250 hover:border-slate-400 focus:bg-white focus:border-red-500 rounded-2xl py-4.5 px-5 font-medium text-sm text-slate-900 focus:outline-none transition-all pr-12"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    {showPickupList ? "▼" : "◀"}
                  </span>
                </div>

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                  {showPickupList && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 max-h-68 overflow-y-auto"
                    >
                      {filteredPickupAgencies.length > 0 ? (
                        <div className="py-2.5">
                          {filteredPickupAgencies.map((agency) => (
                            <button
                              key={agency.id}
                              type="button"
                              onClick={() => handlePickPickupAgency(agency)}
                              className="w-full flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50 active:bg-slate-100/50 transition-colors text-left"
                            >
                              <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs shrink-0 select-none">
                                {agency.type === "aeroport" ? "✈️" : agency.type === "gare" ? "🚄" : "🏢"}
                              </span>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {agency.city} - {agency.name}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate mt-0.5">
                                  {agency.address}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-5 text-center text-xs text-slate-400 font-medium">
                          Aucun lieu de départ trouvé
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Checkbox "Same return agency" */}
              <div className="flex items-center gap-2.5 h-full self-end lg:col-span-2 pt-1 pb-4 select-none">
                <input
                  id="same-agency"
                  type="checkbox"
                  checked={returnSameAgency}
                  onChange={(e) => setReturnSameAgency(e.target.checked)}
                  className="w-5 h-5 text-red-600 focus:ring-red-500 border-slate-300 rounded-lg cursor-pointer accent-[#e31c25]"
                />
                <label 
                  htmlFor="same-agency" 
                  className="text-xs font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors py-1"
                >
                  Retour dans la même agence
                </label>
              </div>

              {/* Conditional Return Location Input */}
              <AnimatePresence>
                {!returnSameAgency && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative flex flex-col gap-1.5 lg:col-span-4 w-full"
                  >
                    <div ref={dropoffRef} className="relative flex flex-col gap-1.5">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                        <MapPin size={11} className="text-[#e31c25]" />
                        Agence de Retour
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Sélectionnez une agence de retour..."
                          value={dropoffInput}
                          onChange={(e) => {
                            setDropoffInput(e.target.value);
                            setShowDropoffList(true);
                            if (dropoffAgency && `${dropoffAgency.city} - ${dropoffAgency.name}` !== e.target.value) {
                              setDropoffAgency(null);
                            }
                          }}
                          onFocus={() => setShowDropoffList(true)}
                          className="w-full bg-slate-50 border border-slate-250 hover:border-slate-400 focus:bg-white focus:border-red-500 rounded-2xl py-4.5 px-5 font-medium text-sm text-slate-900 focus:outline-none transition-all pr-12"
                          required={!returnSameAgency}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          {showDropoffList ? "▼" : "◀"}
                        </span>
                      </div>

                      {/* Autocomplete Dropdown */}
                      <AnimatePresence>
                        {showDropoffList && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 max-h-68 overflow-y-auto"
                          >
                            {filteredDropoffAgencies.length > 0 ? (
                              <div className="py-2.5">
                                {filteredDropoffAgencies.map((agency) => (
                                  <button
                                    key={agency.id}
                                    type="button"
                                    onClick={() => handlePickDropoffAgency(agency)}
                                    className="w-full flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50 active:bg-slate-100/50 transition-colors text-left"
                                  >
                                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs shrink-0 select-none">
                                      {agency.type === "aeroport" ? "✈️" : agency.type === "gare" ? "🚄" : "🏢"}
                                    </span>
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-bold text-xs text-slate-900 truncate">
                                        {agency.city} - {agency.name}
                                      </span>
                                      <span className="text-[10px] text-slate-400 truncate mt-0.5">
                                        {agency.address}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="p-5 text-center text-xs text-slate-400 font-medium">
                                Aucun lieu de retour trouvé
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dates & Times Grid with Return limit warning */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Pickup Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <Calendar size={11} className="text-slate-400" />
                  Date de Départ
                </label>
                <input
                  type="date"
                  min={formatIso(today)}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:border-red-500 rounded-2xl py-4 px-5 font-bold text-sm text-slate-950 focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Departure Hour */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1 mx-0.5">
                  <Clock size={11} className="text-slate-400" />
                  Heure de Départ
                </label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:border-red-500 rounded-2xl py-4.5 px-5 font-bold text-sm text-slate-950 focus:outline-none transition-all cursor-pointer"
                >
                  {hoursList.map((hr) => (
                    <option key={`pickup-${hr}`} value={hr}>{hr}</option>
                  ))}
                </select>
              </div>

              {/* Dropoff Date (Return limit rule of at least 3 days after departure) */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1 justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} className="text-slate-400" />
                    Date de Retour
                  </span>
                  <span className="text-[9px] text-red-500 font-black uppercase tracking-tight">Vip min 3 jours</span>
                </label>
                <input
                  type="date"
                  min={getMinReturnDate(pickupDate)}
                  value={dropoffDate}
                  onChange={(e) => setDropoffDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:border-red-500 rounded-2xl py-4 px-5 font-bold text-sm text-slate-950 focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Dropoff Hour */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <Clock size={11} className="text-slate-400" />
                  Heure de Retour
                </label>
                <select
                  value={dropoffTime}
                  onChange={(e) => setDropoffTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:border-red-500 rounded-2xl py-4.5 px-5 font-bold text-sm text-slate-950 focus:outline-none transition-all cursor-pointer"
                >
                  {hoursList.map((hr) => (
                    <option key={`dropoff-${hr}`} value={hr}>{hr}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Custom note explaining 3-days VIP constraint to provide real professional layout */}
            <div className="text-[11px] text-slate-400 font-medium leading-relaxed bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-start gap-2 select-none">
              <span className="text-[#e31c25] shrink-0">💡</span>
              <span>
                <strong>Engagement Qualité H-CONCIERGERIE</strong> : Toutes nos réservations sont soumises à une période de location minimale de 3 jours afin de garantir un nettoyage approfondi, une révision technique complète de sécurité de niveau F1, et la livraison à domicile avec accueil VIP personnalisé de votre véhicule.
              </span>
            </div>

            {/* Search Core Buttons */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="w-full md:w-auto bg-[#e31c25] hover:bg-[#b8141b] active:scale-95 text-white font-serif font-black text-sm uppercase tracking-widest py-4.5 px-10 rounded-2xl shadow-xl shadow-red-500/15 transition-all text-center flex items-center justify-center gap-3 cursor-pointer"
              >
                {isFilteringCars ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Recherche en cours...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Rechercher une voiture</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </motion.div>
      </div>

      {/* Anchor for search result focus */}
      <div id="search-results-anchor" className="scroll-mt-28" />

      {/* Reassuring Banner built precisely as requested */}
      <div className="max-w-6xl mx-auto px-4 mb-24">
        <div className="bg-slate-950 rounded-3xl p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-950/80 pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gold shrink-0 border border-white/10">
                <ShieldCheck size={22} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white font-serif text-sm font-bold">Assistance 24h/24</span>
                <span className="text-slate-400 text-xs font-light mt-1">
                  Une conciergerie dédiée à votre service et un numéro unique non surtaxé à votre écoute.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gold shrink-0 border border-white/10">
                <RefreshCw size={22} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white font-serif text-sm font-bold">Annulation flexible</span>
                <span className="text-slate-400 text-xs font-light mt-1">
                  Annulation sans frais jusqu'à 24 heures avant la prise en charge pour les membres.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gold shrink-0 border border-white/10">
                <Sparkles size={22} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white font-serif text-sm font-bold">Véhicules récents</span>
                <span className="text-slate-400 text-xs font-light mt-1">
                  Une flotte moderne de moins de 6 mois avec double nettoyage stérile et lavage bio.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gold shrink-0 border border-white/10">
                <Check size={22} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white font-serif text-sm font-bold">Meilleurs prix</span>
                <span className="text-slate-400 text-xs font-light mt-1">
                  Garantie du tarif le plus bas en formule VIP avec surclassement systématique négocié.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Vehicles Section: Nos véhicules disponibles */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-[#e31c25] tracking-[0.4em] uppercase text-xs font-black mb-3 block">
              FLOTTE D'EXCEPTION
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-slate-950 leading-tight">
              Nos véhicules disponibles
            </h2>
            <p className="text-slate-500 font-light text-sm mt-2">
              Berlines de prestige, S.U.V. luxueux et supercars pour répondre à chacune de vos exigences.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-none shrink-0 border-b border-slate-200/60 md:border-b-0">
            {(["tous", "berline", "suv", "sport"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-5 text-xs uppercase tracking-wider font-extrabold rounded-full transition-all shrink-0 cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#e21b22] text-white shadow-md shadow-red-500/10"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {tab === "tous" ? "Tous" : tab === "berline" ? "Prestige" : tab === "suv" ? "SUVs" : "Sportives / Électriques"}
              </button>
            ))}
          </div>
        </div>

        {/* Display Search recap info if user searched */}
        {lastSearchQuery && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 bg-emerald-50 border border-emerald-100/80 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-emerald-900 select-none animate-bounce"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">✅</span>
              <div className="text-xs font-medium">
                Véhicules disponibles pour votre séjour de <strong>{lastSearchQuery.pickup}</strong> du <strong>{lastSearchQuery.pickupDate}</strong> au <strong>{lastSearchQuery.dropoffDate}</strong>.
              </div>
            </div>
            <button 
              onClick={() => setLastSearchQuery(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs uppercase tracking-wider underline cursor-pointer self-start md:self-auto"
            >
              Réinitialiser la recherche
            </button>
          </motion.div>
        )}

        {/* Cards list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {displayedCars.map((vehicle, idx) => (
              <motion.div
                layout
                key={vehicle.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="bg-white border border-slate-200 rounded-[2.2rem] p-4 flex flex-col h-[520px] shadow-[0_15px_45px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:border-emerald-500/15 group text-slate-950 relative overflow-hidden"
              >
                {/* Image Section */}
                <div className="h-52 overflow-hidden rounded-[1.6rem] relative shrink-0">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/75 backdrop-blur-md text-white font-extrabold text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-[12px] shadow-md select-none">
                    {vehicle.category}
                  </div>

                  {/* Top Heart wishlist badge */}
                  <button
                    onClick={() => toggleFavoriteClass(vehicle.id)}
                    className="absolute top-4 right-4 bg-white/95 hover:bg-slate-100 active:scale-95 transition-all w-9 h-9 rounded-full flex items-center justify-center shadow-md cursor-pointer text-slate-950 z-10"
                  >
                    <Heart 
                      size={15} 
                      fill={favorites[vehicle.id] ? "#e31c25" : "none"}
                      stroke={favorites[vehicle.id] ? "#e31c25" : "currentColor"}
                      strokeWidth={favorites[vehicle.id] ? "0" : "2.5"} 
                      className="transition-colors"
                    />
                  </button>
                </div>

                {/* Content description list */}
                <div className="p-1 flex-grow flex flex-col mt-4">
                  
                  {/* Performance / Fuel features badges row */}
                  <div className="flex gap-1.5 flex-wrap mb-3.5">
                    <span className="bg-slate-50 border border-slate-100 text-slate-500 font-semibold px-2 px-2 py-0.5 rounded-lg text-[10px] uppercase select-none flex items-center gap-1">
                      👤 {vehicle.seats} places
                    </span>
                    <span className="bg-slate-50 border border-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-lg text-[10px] uppercase select-none">
                      ⚙️ {vehicle.gearbox}
                    </span>
                    <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-lg text-[10px] uppercase select-none">
                      🌱 {vehicle.propulsion}
                    </span>
                  </div>

                  {/* Title and location */}
                  <h3 className="text-xl font-serif font-black text-slate-950 leading-tight tracking-wide line-clamp-1 mb-1.5">
                    {vehicle.name}
                  </h3>
                  
                  {/* Subtle technical features bullets list */}
                  <div className="space-y-1 mb-4 flex-grow">
                    {vehicle.features.slice(0, 3).map((f, fIdx) => (
                      <div key={fIdx} className="text-[11px] text-slate-400 font-light flex items-center gap-1.5 select-none truncate">
                        <span className="text-[#e21b22]">✓</span>
                        {f}
                      </div>
                    ))}
                  </div>

                  {/* Price representation */}
                  <div className="border-t border-slate-100 pt-3 pb-3.5 mt-auto">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block select-none">
                      Tarif estimatif membre
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-[#e31c25] font-serif font-extrabold text-3xl">
                        {vehicle.pricePerDay} €
                      </span>
                      <span className="text-slate-400 text-xs font-light select-none">
                        / jour
                      </span>
                    </div>
                  </div>

                  {/* Elegant CTA red button matching the europcar visual */}
                  <button
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="bg-slate-950 hover:bg-[#e31c25] text-white hover:text-white text-xs tracking-wider uppercase font-extrabold py-3.5 px-4 rounded-[1.2rem] flex items-center justify-center gap-2 transition-all duration-300 w-full cursor-pointer group-hover:bg-[#e31c25] active:scale-95"
                  >
                    <span>Voir l'offre</span>
                    <ChevronRight size={14} className="stroke-[3px]" />
                  </button>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Booking Details Modal Popup dialog */}
      <AnimatePresence>
        {selectedVehicle && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative border border-slate-100"
            >
              {/* Top Cover Design */}
              <div className="relative h-64 md:h-80 bg-slate-900 shrink-0">
                <img
                  src={selectedVehicle.image}
                  alt={selectedVehicle.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="absolute top-4 right-4 bg-white hover:bg-slate-150 text-slate-950 w-9 h-9 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent p-6 flex flex-col justify-end text-white">
                  <span className="text-gold uppercase tracking-widest text-[9px] font-bold block mb-1">
                    {selectedVehicle.category}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif font-black">
                    {selectedVehicle.name}
                  </h3>
                </div>
              </div>

              {/* Form specs details */}
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#e31c25] mb-3">
                    Caractéristiques du véhicule
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                      <span className="text-slate-400 text-xs">Sièges</span>
                      <span className="font-bold text-slate-800 text-xs">{selectedVehicle.seats} places</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                      <span className="text-slate-400 text-xs">Transmission</span>
                      <span className="font-bold text-slate-800 text-xs">{selectedVehicle.gearbox}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                      <span className="text-slate-400 text-xs">Propulsion</span>
                      <span className="font-bold text-slate-800 text-xs">{selectedVehicle.propulsion}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#e31c25] mb-3">
                    Inclus de série avec H-CONCIERGERIE
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 font-light text-xs">
                    {selectedVehicle.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-lg">
                        <span className="text-emerald-500 font-bold shrink-0">✓</span>
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-lg">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span>Livraison à votre hôtel/villa</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-lg">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span>Assistance accident pneumatique</span>
                    </div>
                  </div>
                </div>

                {/* Submit action panel */}
                <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                      Tarif réservé membre
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-serif font-black text-[#e31c25]">
                        {selectedVehicle.pricePerDay} €
                      </span>
                      <span className="text-slate-400 text-xs">/ jour</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedVehicle(null)}
                      className="px-5 py-3.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs tracking-wider uppercase font-extrabold rounded-xl transition-all cursor-pointer"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmReservation(selectedVehicle)}
                      className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs tracking-wider uppercase font-extrabold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/15 transition-all cursor-pointer"
                    >
                      {isBookedSuccess ? (
                        <span>Redirection...</span>
                      ) : (
                        <>
                          <span>Confirmer via WhatsApp</span>
                          <ChevronRight size={14} className="stroke-[3px]" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
