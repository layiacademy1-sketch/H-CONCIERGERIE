import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Search, 
  Check, 
  RefreshCw, 
  SlidersHorizontal, 
  ArrowLeft,
  ChevronRight
} from "lucide-react";

interface CarCity {
  name: string;
  country: string;
  flag: string;
}

const globalCities: CarCity[] = [
  { name: "Paris", country: "France", flag: "🇫🇷" },
  { name: "Saint-Tropez", country: "France", flag: "🇫🇷" },
  { name: "Cannes", country: "France", flag: "🇫🇷" },
  { name: "Monaco", country: "Monaco", flag: "🇲🇨" },
  { name: "Nice", country: "France", flag: "🇫🇷" },
  { name: "Marseille", country: "France", flag: "🇫🇷" },
  { name: "Lyon", country: "France", flag: "🇫🇷" },
  { name: "Bordeaux", country: "France", flag: "🇫🇷" },
  { name: "Chamonix", country: "France", flag: "🇫🇷" },
  { name: "Courchevel", country: "France", flag: "🇫🇷" },
  { name: "Megève", country: "France", flag: "🇫🇷" },
  { name: "Saint-Jean-Cap-Ferrat", country: "France", flag: "🇫🇷" },
  { name: "Cap d'Antibes", country: "France", flag: "🇫🇷" },
  { name: "Maldives", country: "Maldives", flag: "🇲🇻" },
  { name: "Dubaï", country: "Émirats Arabes Unis", flag: "🇦🇪" },
  { name: "Bora Bora", country: "Polynésie Française", flag: "🇵🇫" },
  { name: "Bali", country: "Indonésie", flag: "🇮🇩" },
  { name: "Phuket", country: "Thaïlande", flag: "🇹🇭" },
  { name: "Koh Samui", country: "Thaïlande", flag: "🇹🇭" },
  { name: "Bangkok", country: "Thaïlande", flag: "🇹🇭" },
  { name: "Mykonos", country: "Grèce", flag: "🇬🇷" },
  { name: "Santorin", country: "Grèce", flag: "🇬🇷" },
  { name: "Ibiza", country: "Espagne", flag: "🇪🇸" },
  { name: "Majorque", country: "Espagne", flag: "🇪🇸" },
  { name: "Barcelone", country: "Espagne", flag: "🇪🇸" },
  { name: "Madrid", country: "Espagne", flag: "🇪🇸" },
  { name: "Séville", country: "Espagne", flag: "🇪🇸" },
  { name: "Londres", country: "Royaume-Uni", flag: "🇬🇧" },
  { name: "New York", country: "États-Unis", flag: "🇺🇸" },
  { name: "Los Angeles", country: "États-Unis", flag: "🇺🇸" },
  { name: "Miami", country: "États-Unis", flag: "🇺🇸" },
  { name: "Las Vegas", country: "États-Unis", flag: "🇺🇸" },
  { name: "Hawaii", country: "États-Unis", flag: "🇺🇸" },
  { name: "Aspen", country: "États-Unis", flag: "🇺🇸" },
  { name: "Tokyo", country: "Japon", flag: "🇯🇵" },
  { name: "Kyoto", country: "Japon", flag: "🇯🇵" },
  { name: "Rome", country: "Italie", flag: "🇮🇹" },
  { name: "Venise", country: "Italie", flag: "🇮🇹" },
  { name: "Florence", country: "Italie", flag: "🇮🇹" },
  { name: "Milan", country: "Italie", flag: "🇮🇹" },
  { name: "Capri", country: "Italie", flag: "🇮🇹" },
  { name: "Amalfi", country: "Italie", flag: "🇮🇹" },
  { name: "Portofino", country: "Italie", flag: "🇮🇹" },
  { name: "Genève", country: "Suisse", flag: "🇨🇭" },
  { name: "Zurich", country: "Suisse", flag: "🇨🇭" },
  { name: "Gstaad", country: "Suisse", flag: "🇨🇭" },
  { name: "Zermatt", country: "Suisse", flag: "🇨🇭" },
  { name: "Saint-Moritz", country: "Suisse", flag: "🇨🇭" },
  { name: "Bruxelles", country: "Belgique", flag: "🇧🇪" },
  { name: "Amsterdam", country: "Pays-Bas", flag: "🇳🇱" },
  { name: "Lisbonne", country: "Portugal", flag: "🇵🇹" },
  { name: "Porto", country: "Portugal", flag: "🇵🇹" },
  { name: "Marrakech", country: "Maroc", flag: "🇲🇦" },
  { name: "Casablanca", country: "Maroc", flag: "🇲🇦" },
  { name: "Le Caire", country: "Égypte", flag: "🇪🇬" },
  { name: "Seychelles", country: "Seychelles", flag: "🇸🇨" },
  { name: "Île Maurice", country: "Île Maurice", flag: "🇲🇺" },
  { name: "Zanzibar", country: "Tanzanie", flag: "🇹🇿" },
  { name: "Le Cap", country: "Afrique du Sud", flag: "🇿🇦" },
  { name: "Singapour", country: "Singapour", flag: "🇸🇬" },
  { name: "Hong Kong", country: "Hong Kong", flag: "🇭🇰" },
  { name: "Séoul", country: "Corée du Sud", flag: "🇰🇷" },
  { name: "Sydney", country: "Australie", flag: "🇦🇺" },
  { name: "Melbourne", country: "Australie", flag: "🇦🇺" },
  { name: "Auckland", country: "Nouvelle-Zélande", flag: "🇳🇿" },
  { name: "Saint-Barthélemy", country: "Saint-Barth", flag: "🇫🇷" },
  { name: "Nassau", country: "Bahamas", flag: "🇧🇸" },
  { name: "Cancún", country: "Mexique", flag: "🇲🇽" },
  { name: "Tulum", country: "Mexique", flag: "🇲🇽" },
  { name: "Punta Cana", country: "République Dominicaine", flag: "🇩🇴" },
  { name: "Rio de Janeiro", country: "Brésil", flag: "🇧🇷" },
  { name: "Buenos Aires", country: "Argentine", flag: "🇦🇷" },
  { name: "Carthagène", country: "Colombie", flag: "🇨🇴" },
  { name: "Istanbul", country: "Turquie", flag: "🇹🇷" },
  { name: "Vienne", country: "Autriche", flag: "🇦🇹" },
  { name: "Prague", country: "République Tchèque", flag: "🇨🇿" },
  { name: "Munich", country: "Allemagne", flag: "🇩🇪" },
  { name: "Athènes", country: "Grèce", flag: "🇬🇷" },
  { name: "Budapest", country: "Hongrie", flag: "🇭🇺" },
  { name: "Copenhague", country: "Danemark", flag: "🇩🇰" },
  { name: "Oslo", country: "Norvège", flag: "🇳🇴" },
  { name: "Stockholm", country: "Suède", flag: "🇸🇪" },
  { name: "Reykjavik", country: "Islande", flag: "🇮🇸" },
  { name: "Toronto", country: "Canada", flag: "🇨🇦" },
  { name: "Montréal", country: "Canada", flag: "🇨🇦" },
  { name: "Doha", country: "Qatar", flag: "🇶🇦" },
  { name: "Mascate", country: "Oman", flag: "🇴🇲" },
  { name: "Abou Dabi", country: "Émirats Arabes Unis", flag: "🇦🇪" }
];

export default function CarRentalPage({ onBack }: { onBack: () => void }) {
  // Search Engine states
  const [pickupInput, setPickupInput] = useState("");
  const [pickupAgency, setPickupAgency] = useState<CarCity | null>(null);
  const [showPickupList, setShowPickupList] = useState(false);

  const [returnSameAgency, setReturnSameAgency] = useState(true);
  const [dropoffInput, setDropoffInput] = useState("");
  const [dropoffAgency, setDropoffAgency] = useState<CarCity | null>(null);
  const [showDropoffList, setShowDropoffList] = useState(false);

  // Vehicle choices states
  const [vehicleType, setVehicleType] = useState<"Berline" | "SUV" | "Break" | "Voiture familiale">("Berline");
  const [transmission, setTransmission] = useState<"Automatique" | "Manuelle">("Automatique");

  const [isFilteringCars, setIsFilteringCars] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Dates
  const today = new Date();
  const formatIso = (d: Date) => d.toISOString().split("T")[0];

  const [pickupDate, setPickupDate] = useState<string>(formatIso(today));
  // Default dropoff is 3 days later
  const threeDaysLater = new Date();
  threeDaysLater.setDate(today.getDate() + 3);
  const [dropoffDate, setDropoffDate] = useState<string>(formatIso(threeDaysLater));

  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropoffTime, setDropoffTime] = useState("17:00");

  // References to handle click-outside close
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

  // Close custom dropdowns on click outside
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

  const handlePickPickupAgency = (city: CarCity) => {
    setPickupAgency(city);
    setPickupInput(`${city.flag} L'Agence de ${city.name} (${city.country})`);
    setShowPickupList(false);
  };

  const handlePickDropoffAgency = (city: CarCity) => {
    setDropoffAgency(city);
    setDropoffInput(`${city.flag} L'Agence de ${city.name} (${city.country})`);
    setShowDropoffList(false);
  };

  // Helper to normalize strings for accent and case insensitive search
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // removes accents
      .replace(/[^a-z0-9]/g, " "); // replaces accents and symbols with space for multi-term query match
  };

  const isMatch = (city: CarCity, rawQuery: string) => {
    const normQuery = normalizeString(rawQuery).trim();
    if (!normQuery) return false;
    
    const normCityName = normalizeString(city.name);
    const normCountry = normalizeString(city.country);
    
    const queryTerms = normQuery.split(/\s+/);
    return queryTerms.every(term => 
      normCityName.includes(term) || 
      normCountry.includes(term)
    );
  };

  // Filter suggestion list based on user autocomplete query
  const filteredPickupCities = pickupInput.trim() === ""
    ? globalCities.slice(0, 15) // default list
    : globalCities.filter(city => isMatch(city, pickupInput)).slice(0, 15);

  const filteredDropoffCities = dropoffInput.trim() === ""
    ? globalCities.slice(0, 15) // default list
    : globalCities.filter(city => isMatch(city, dropoffInput)).slice(0, 15);

  // Send WhatsApp Inquiry
  const handleSendDemand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAgency) {
      alert("Veuillez sélectionner une ville / agence de départ dans la liste.");
      return;
    }
    if (!returnSameAgency && !dropoffAgency) {
      alert("Veuillez sélectionner une ville / agence de retour dans la liste.");
      return;
    }

    setIsFilteringCars(true);

    const cleanPickup = `${pickupAgency.flag} L'Agence de ${pickupAgency.name} (${pickupAgency.country})`;
    const cleanDropoff = returnSameAgency ? cleanPickup : `${dropoffAgency!.flag} L'Agence de ${dropoffAgency!.name} (${dropoffAgency!.country})`;

    const message = `Bonjour H-CONCIERGERIE, je souhaite soumettre une demande de réservation de véhicule :
📌 Type de véhicule : ${vehicleType}
⚙️ Boîte : ${transmission}
📍 Ville de départ : ${cleanPickup}
🏁 Ville de retour : ${cleanDropoff}
📅 Date de départ : ${pickupDate} à ${pickupTime}
📅 Date de retour : ${dropoffDate} à ${dropoffTime}
💎 Prise en charge VIP H-CONCIERGERIE incluse.`;

    const whatsAppUrl = `https://wa.me/33774067388?text=${encodeURIComponent(message)}`;

    setTimeout(() => {
      setIsFilteringCars(false);
      setIsSubmitted(true);
      window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
    }, 1200);
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
          </div>
        </div>
      </div>

      {/* Main Core Search Engine component floating on background */}
      <div className="max-w-6xl mx-auto px-4 -mt-44 relative z-30 mb-20">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div 
              key="booking-form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-950/20 p-6 md:p-10 border border-slate-100/80"
            >
              <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-gold">
                  <Car size={18} />
                </div>
                <div>
                  <h2 className="font-serif font-black text-lg md:text-xl text-slate-950 tracking-wide">
                    Réservez votre véhicule
                  </h2>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Tarifs d'exception & accompagnement H-CONCIERGERIE inclus
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendDemand} className="space-y-6">
                {/* Section 1: Agences */}
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
                        placeholder="Recherchez Paris, Saint-Tropez, Monaco, Nice, Ibiza, Dubaï..."
                        value={pickupInput}
                        onChange={(e) => {
                          setPickupInput(e.target.value);
                          setShowPickupList(true);
                          if (pickupAgency && `${pickupAgency.flag} L'Agence de ${pickupAgency.name} (${pickupAgency.country})` !== e.target.value) {
                            setPickupAgency(null);
                          }
                        }}
                        onFocus={() => setShowPickupList(true)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:bg-white focus:border-red-500 rounded-2xl py-4.5 px-5 font-medium text-sm text-slate-900 focus:outline-none transition-all pr-12"
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
                          {pickupInput.trim().length === 0 ? (
                            <div className="px-5 py-2.5 text-[10px] uppercase font-black tracking-widest text-[#e31c25] border-b border-slate-100 bg-slate-50/50">
                              Agences Populaires
                            </div>
                          ) : null}
                          {filteredPickupCities.length > 0 ? (
                            <div className="py-1">
                              {filteredPickupCities.map((city, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handlePickPickupAgency(city)}
                                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 active:bg-slate-100/50 border-b border-slate-100 last:border-b-0 transition-all text-left cursor-pointer"
                                >
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    <span className="text-xl select-none" role="img" aria-label={city.country}>
                                      {city.flag}
                                    </span>
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-bold text-xs text-slate-900 truncate">
                                        Agence de {city.name}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded shrink-0">
                                    {city.country}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-5 text-center text-xs text-slate-400 font-medium">
                              Aucune agence trouvée
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
                                if (dropoffAgency && `${dropoffAgency.flag} L'Agence de ${dropoffAgency.name} (${dropoffAgency.country})` !== e.target.value) {
                                  setDropoffAgency(null);
                                }
                              }}
                              onFocus={() => setShowDropoffList(true)}
                              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:bg-white focus:border-red-500 rounded-2xl py-4.5 px-5 font-medium text-sm text-slate-900 focus:outline-none transition-all pr-12"
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
                                {dropoffInput.trim().length === 0 ? (
                                  <div className="px-5 py-2.5 text-[10px] uppercase font-black tracking-widest text-[#e31c25] border-b border-slate-100 bg-slate-50/50">
                                    Agences Populaires
                                  </div>
                                ) : null}
                                {filteredDropoffCities.length > 0 ? (
                                  <div className="py-1">
                                    {filteredDropoffCities.map((city, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handlePickDropoffAgency(city)}
                                        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 active:bg-slate-100/50 border-b border-slate-100 last:border-b-0 transition-all text-left cursor-pointer"
                                      >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                          <span className="text-xl select-none" role="img" aria-label={city.country}>
                                            {city.flag}
                                          </span>
                                          <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-xs text-slate-900 truncate">
                                              Agence de {city.name}
                                            </span>
                                          </div>
                                        </div>
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded shrink-0">
                                          {city.country}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-5 text-center text-xs text-slate-400 font-medium">
                                    Aucune agence trouvée
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

                {/* Section 2: Type de véhicule et Transmission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                  {/* Type de véhicule */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal size={13} className="text-[#e31c25]" />
                      Type de véhicule recherché
                    </label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 rounded-2xl py-4.5 px-5 font-bold text-sm text-slate-950 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="Berline">Berline</option>
                      <option value="SUV">SUV</option>
                      <option value="Break">Break</option>
                      <option value="Voiture familiale">Voiture familiale</option>
                    </select>
                  </div>

                  {/* Boîte */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal size={13} className="text-[#e31c25]" />
                      Boîte
                    </label>
                    <div className="grid grid-cols-2 gap-3 h-full">
                      <button
                        type="button"
                        onClick={() => setTransmission("Automatique")}
                        className={`py-4 px-4 rounded-2xl font-bold text-xs uppercase transition-all tracking-wider border cursor-pointer flex items-center justify-center gap-2 ${
                          transmission === "Automatique"
                            ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10"
                            : "bg-slate-50 border-slate-200 hover:border-slate-350 text-slate-700 font-medium"
                        }`}
                      >
                        Automatique
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransmission("Manuelle")}
                        className={`py-4 px-4 rounded-2xl font-bold text-xs uppercase transition-all tracking-wider border cursor-pointer flex items-center justify-center gap-2 ${
                          transmission === "Manuelle"
                            ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10"
                            : "bg-slate-50 border-slate-200 hover:border-slate-350 text-slate-700 font-medium"
                        }`}
                      >
                        Manuelle
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 3: Dates & Times Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-slate-100 pt-6">
                  
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
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 rounded-2xl py-4 px-5 font-bold text-sm text-slate-950 focus:outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Departure Hour */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                      <Clock size={11} className="text-slate-400" />
                      Heure de Départ
                    </label>
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 rounded-2xl py-4.5 px-5 font-bold text-sm text-slate-950 focus:outline-none transition-all cursor-pointer"
                    >
                      {hoursList.map((hr) => (
                        <option key={`pickup-${hr}`} value={hr}>{hr}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dropoff Date */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1 justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-slate-400" />
                        Date de Retour
                      </span>
                      <span className="text-[9px] text-[#e31c25] font-black uppercase tracking-tight">min 3 jours</span>
                    </label>
                    <input
                      type="date"
                      min={getMinReturnDate(pickupDate)}
                      value={dropoffDate}
                      onChange={(e) => setDropoffDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 rounded-2xl py-4 px-5 font-bold text-sm text-slate-950 focus:outline-none transition-all"
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
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 rounded-2xl py-4.5 px-5 font-bold text-sm text-slate-950 focus:outline-none transition-all cursor-pointer"
                    >
                      {hoursList.map((hr) => (
                        <option key={`dropoff-${hr}`} value={hr}>{hr}</option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Quality pledge constraint information */}
                <div className="text-[11px] text-slate-400 font-medium leading-relaxed bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-start gap-2 select-none">
                  <span className="text-[#e31c25] shrink-0">💡</span>
                  <span>
                    <strong>Engagement Qualité H-CONCIERGERIE</strong> : Toutes les mises à disposition de véhicules de prestige sont soumises à une période de location minimale de 3 jours pour garantir une préparation esthétique approfondie et une livraison dans des conditions d'excellence absolue.
                  </span>
                </div>

                {/* Submit action button */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-[#e31c25] hover:bg-[#b8141b] active:scale-95 text-white font-serif font-black text-xs uppercase tracking-widest py-4.5 px-10 rounded-2xl shadow-xl shadow-red-500/15 transition-all text-center flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {isFilteringCars ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Envoi de la demande...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span>Envoyer ma demande</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          ) : (
            <motion.div
              key="booking-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-slate-950 border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl"
            >
              {/* Luxury gold glow effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Check size={40} className="stroke-[3px]" />
              </div>

              <span className="text-gold tracking-[0.3em] uppercase text-xs font-black block mb-4">
                DEMANDE TRANSMISE AVEC SUCCÈS
              </span>

              <h3 className="text-3xl md:text-4xl font-serif font-black mb-6 max-w-xl mx-auto leading-tight">
                Votre demande est prise en compte
              </h3>

              <p className="text-slate-400 font-light text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
                Notre équipe de conciergerie de luxe a bien reçu vos préférences de transport. 
                Une notification instantanée a été générée. Un concierge dédié traitera votre demande de prise en charge et vous recontactera avec les meilleures offres sous 15 minutes.
              </p>

              {/* Booking Recap Details Table */}
              <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-3.5 mb-10 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 uppercase font-bold tracking-wider">Type de véhicule :</span>
                  <span className="text-white font-extrabold">{vehicleType}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 uppercase font-bold tracking-wider">Boîte :</span>
                  <span className="text-white font-extrabold">{transmission}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 uppercase font-bold tracking-wider">Départ :</span>
                  <span className="text-white font-extrabold text-right max-w-[200px] truncate" title={pickupAgency ? `${pickupAgency.flag} Agence de ${pickupAgency.name} (${pickupAgency.country})` : pickupInput}>
                    {pickupAgency ? `${pickupAgency.flag} ${pickupAgency.name}` : pickupInput}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 uppercase font-bold tracking-wider">Prise en charge :</span>
                  <span className="text-white font-extrabold">{pickupDate} à {pickupTime}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 uppercase font-bold tracking-wider">Retour :</span>
                  <span className="text-white font-extrabold text-right max-w-[200px] truncate" title={returnSameAgency ? (pickupAgency ? `${pickupAgency.flag} Agence de ${pickupAgency.name} (${pickupAgency.country})` : pickupInput) : (dropoffAgency ? `${dropoffAgency.flag} Agence de ${dropoffAgency.name} (${dropoffAgency.country})` : dropoffInput)}>
                    {returnSameAgency ? "Même agence" : (dropoffAgency ? `${dropoffAgency.flag} ${dropoffAgency.name}` : dropoffInput)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-bold tracking-wider">Restitution :</span>
                  <span className="text-white font-extrabold">{dropoffDate} à {dropoffTime}</span>
                </div>
              </div>

              {/* Actions Button List */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 text-slate-300 hover:text-white rounded-xl border border-white/10 hover:bg-white/10 transition-all text-xs uppercase tracking-widest font-bold cursor-pointer"
                >
                  Faire une autre demande
                </button>
                <a
                  href={`https://wa.me/33774067388?text=${encodeURIComponent(`Bonjour H-CONCIERGERIE, je viens de soumettre ma demande de réservation de véhicule (${vehicleType} ${transmission}) pour le ${pickupDate}. Merci de me recontacter.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 bg-[#e31c25] hover:bg-[#b8141b] text-white rounded-xl transition-all text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/15"
                >
                  <span>Contacter directement</span>
                  <ChevronRight size={14} className="stroke-[3px]" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
