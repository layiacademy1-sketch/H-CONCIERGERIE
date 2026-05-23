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
import { frenchCities, FrenchCity } from "../data/frenchCities";

export default function CarRentalPage({ onBack }: { onBack: () => void }) {
  // Search Engine states
  const [pickupInput, setPickupInput] = useState("");
  const [pickupAgency, setPickupAgency] = useState<FrenchCity | null>(null);
  const [showPickupList, setShowPickupList] = useState(false);

  const [returnSameAgency, setReturnSameAgency] = useState(true);
  const [dropoffInput, setDropoffInput] = useState("");
  const [dropoffAgency, setDropoffAgency] = useState<FrenchCity | null>(null);
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

  const handlePickPickupAgency = (city: FrenchCity) => {
    setPickupAgency(city);
    setPickupInput(`${city.name} (${city.zipCode}) - ${city.department}`);
    setShowPickupList(false);
  };

  const handlePickDropoffAgency = (city: FrenchCity) => {
    setDropoffAgency(city);
    setDropoffInput(`${city.name} (${city.zipCode}) - ${city.department}`);
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

  const isMatch = (city: FrenchCity, rawQuery: string) => {
    const normQuery = normalizeString(rawQuery).trim();
    if (!normQuery) return false;
    
    const normCityName = normalizeString(city.name);
    const normDept = normalizeString(city.department);
    const zipCode = city.zipCode;
    
    const queryTerms = normQuery.split(/\s+/);
    return queryTerms.every(term => 
      normCityName.includes(term) || 
      normDept.includes(term) || 
      zipCode.includes(term)
    );
  };

  // Filter suggestion list based on user autocomplete query
  const filteredPickupCities = pickupInput.trim() === ""
    ? frenchCities.slice(0, 15) // default list
    : frenchCities.filter(city => isMatch(city, pickupInput)).slice(0, 15);

  const filteredDropoffCities = dropoffInput.trim() === ""
    ? frenchCities.slice(0, 15) // default list
    : frenchCities.filter(city => isMatch(city, dropoffInput)).slice(0, 15);

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

    const cleanPickup = `${pickupAgency.name} (${pickupAgency.zipCode}) - ${pickupAgency.department}`;
    const cleanDropoff = returnSameAgency ? cleanPickup : `${dropoffAgency!.name} (${dropoffAgency!.zipCode}) - ${dropoffAgency!.department}`;

    const message = `Bonjour H-CONCIERGERIE, je souhaite soumettre une demande de réservation de véhicule :
📌 Type de véhicule : ${vehicleType}
⚙️ Transmission : ${transmission}
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
                        placeholder="Recherchez Paris, Nice, Lyon, Le Havre, Parthenay..."
                        value={pickupInput}
                        onChange={(e) => {
                          setPickupInput(e.target.value);
                          setShowPickupList(true);
                          if (pickupAgency && `${pickupAgency.name} (${pickupAgency.zipCode}) - ${pickupAgency.department}` !== e.target.value) {
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
                          {filteredPickupCities.length > 0 ? (
                            <div className="py-2.5">
                              {filteredPickupCities.map((city, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handlePickPickupAgency(city)}
                                  className="w-full flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50 active:bg-slate-100/50 transition-colors text-left"
                                >
                                  <span className="w-8 h-8 rounded-lg bg-slate-105 flex items-center justify-center text-xs shrink-0 select-none">
                                    🏢
                                  </span>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-xs text-slate-900 truncate">
                                      {city.name} ({city.zipCode})
                                    </span>
                                    <span className="text-[10px] text-slate-400 truncate mt-0.5">
                                      {city.department}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-5 text-center text-xs text-slate-400 font-medium">
                              Aucune ville trouvée
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
                                if (dropoffAgency && `${dropoffAgency.name} (${dropoffAgency.zipCode}) - ${dropoffAgency.department}` !== e.target.value) {
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
                                {filteredDropoffCities.length > 0 ? (
                                  <div className="py-2.5">
                                    {filteredDropoffCities.map((city, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handlePickDropoffAgency(city)}
                                        className="w-full flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50 active:bg-slate-100/50 transition-colors text-left"
                                      >
                                        <span className="w-8 h-8 rounded-lg bg-slate-105 flex items-center justify-center text-xs shrink-0 select-none">
                                          🏢
                                        </span>
                                        <div className="flex flex-col min-w-0">
                                          <span className="font-bold text-xs text-slate-900 truncate">
                                            {city.name} ({city.zipCode})
                                          </span>
                                          <span className="text-[10px] text-slate-400 truncate mt-0.5">
                                            {city.department}
                                          </span>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-5 text-center text-xs text-slate-400 font-medium">
                                    Aucune ville trouvée
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

                  {/* Transmission */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal size={13} className="text-[#e31c25]" />
                      Transmission
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
                  <span className="text-slate-400 uppercase font-bold tracking-wider">Transmission :</span>
                  <span className="text-white font-extrabold">{transmission}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 uppercase font-bold tracking-wider">Départ :</span>
                  <span className="text-white font-extrabold text-right max-w-[200px] truncate" title={pickupAgency ? `${pickupAgency.name} (${pickupAgency.zipCode}) - ${pickupAgency.department}` : pickupInput}>
                    {pickupAgency ? `${pickupAgency.name} (${pickupAgency.zipCode}) - ${pickupAgency.department}` : pickupInput}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 uppercase font-bold tracking-wider">Prise en charge :</span>
                  <span className="text-white font-extrabold">{pickupDate} à {pickupTime}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 uppercase font-bold tracking-wider">Retour :</span>
                  <span className="text-white font-extrabold text-right max-w-[200px] truncate" title={returnSameAgency ? (pickupAgency ? `${pickupAgency.name} (${pickupAgency.zipCode}) - ${pickupAgency.department}` : pickupInput) : (dropoffAgency ? `${dropoffAgency.name} (${dropoffAgency.zipCode}) - ${dropoffAgency.department}` : dropoffInput)}>
                    {returnSameAgency ? "Même agence" : (dropoffAgency ? `${dropoffAgency.name} (${dropoffAgency.zipCode}) - ${dropoffAgency.department}` : dropoffInput)}
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
