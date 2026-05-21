import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Search, Calendar, Users, Euro, MapPin, Navigation, 
  X, Check, ChevronRight, Play, Volume2, VolumeX, Eye, Maximize2, MoveLeft, MoveRight
} from "lucide-react";

// Types
interface HotelOffer {
  id: number;
  name: string;
  hotel: string;
  location: string;
  description: string;
  longDescription: string;
  image: string;
  price: string;
  rating: number;
  services: string[];
  conditions: string[];
}

interface Testimonial {
  id: number;
  clientName: string;
  role: string;
  rating: number;
  comment: string;
  videoUrl: string;
}

// 6 Promotional offers of luxury hotels
const hotelOffers: HotelOffer[] = [
  {
    id: 1,
    name: "Offre Escapade Royale",
    hotel: "Le Bristol Paris",
    location: "Paris, France",
    description: "Une nuit somptueuse dans un joyau de l'hôtellerie française avec accueil VIP et petit-déjeuner michelin.",
    longDescription: "Vivez l'excellence à la parisienne. Le Bristol Paris propose une expérience d'habitation digne des rois, combinant élégance classique, haute gastronomie, et un service d'une attention inégalée en plein cœur du Faubourg Saint-Honoré.",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200",
    price: "À partir de 1 250 €",
    rating: 5,
    services: [
      "Accueil personnalisé avec Champagne de prestige & Macarons artisanaux",
      "Petit-déjeuner gastronomique concocté par notre Chef 3 étoiles michelin",
      "Accès exclusif à la piscine suspendue avec vue panoramique sur les toits de Paris",
      "Surclassement garanti en suite exécutive selon disponibilité",
      "Service de majordome dédié disponible 24h/24"
    ],
    conditions: [
      "Offre valable pour des séjours de 2 nuits minimum",
      "Annulation flexible sans frais jusqu'à 7 jours avant l'arrivée",
      "Sujet à des restrictions de dates spécifiques en haute saison"
    ]
  },
  {
    id: 2,
    name: "Sérénité Tropicale & Spa",
    hotel: "One&Only Reethi Rah",
    location: "Maldives",
    description: "Une villa sur pilotis d'exception avec piscine privée suspendue au-dessus de l'océan Indien.",
    longDescription: "Une retraite insulaire ultime où les eaux turquoise rencontrent le sable blanc le plus pur. Votre villa privée sur pilotis offre une intimité totale, des couchers de soleil incomparables, et les soins holistiques du spa mondialement primé.",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&q=80&w=1200",
    price: "Sur demande",
    rating: 5,
    services: [
      "Villa privée sur pilotis de 150m² avec accès direct à la mer pour baignade privée",
      "Transfert aller-retour en yacht privé de luxe depuis l'aéroport de Malé",
      "Soin signature de 90 minutes en couple au Spa ou espace bien-être",
      "Majordome attitré (hôte de villa) dédié à chaque instant de votre séjour",
      "Équipements de sports nautiques non motorisés en accès libre"
    ],
    conditions: [
      "Tarifs négociés exclusifs H-CONCIERGERIE sur demande écrite",
      "Réservation conseillée au moins 30 jours à l'avance",
      "Séjour minimum conseillé de 5 nuits pour bénéficier des tarifs préférentiels"
    ]
  },
  {
    id: 3,
    name: "Zénitude Urbaine & Panorama",
    hotel: "Aman Tokyo",
    location: "Tokyo, Japon",
    description: "Un temple de tranquillité dominant la skyline tokyoïte avec vue imprenable sur le Mont Fuji.",
    longDescription: "Mélange parfait de tradition japonaise minimaliste et de design contemporain audacieux. Perché au-dessus du quartier de Otemachi, l'Aman Tokyo offre de grands volumes épurés, des bains traditionnels furo, et un calme absolu dominant la mégapole.",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200",
    price: "À partir de 950 €",
    rating: 5,
    services: [
      "Chambre Deluxe King size (70m²) avec baignoire traditionnelle en bois furo",
      "Cérémonie du thé privée menée par un maître de thé japonais de renom",
      "Accès complet au spa urbain de 2 500m² et son bassin de nage chauffé",
      "Cocktail Signature offert au bar avec panorama nocturne spectaculaire",
      "Transfert de départ en limousine privée vers l'aéroport d'Haneda ou Narita"
    ],
    conditions: [
      "Surclassement selon disponibilité au moment de l'enregistrement",
      "Annulation gratuite jusqu'à 72h avant le séjour",
      "Offre exclusive réservée aux membres actifs du club"
    ]
  },
  {
    id: 4,
    name: "Grand Splendeur de la Renaissance",
    hotel: "Villa d'Este",
    location: "Lac de Côme, Italie",
    description: "Résidence historique d'exception nichée au cœur d'un parc botanique privé en bord de lac.",
    longDescription: "Chef-d'œuvre de la Renaissance, la Villa d'Este incarne la quintessence du chic italien. Ses jardins magnifiques, sa célèbre piscine flottante et ses intérieurs richement décorés de soies et d'œuvres d'art vous invitent à la Dolce Vita dans sa forme la plus noble.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1200",
    price: "À partir de 1 100 €",
    rating: 5,
    services: [
      "Séjour en chambre Double Prestige avec terrasse privative offrant vue lac panoramique",
      "Visite guidée privée des somptueux jardins botaniques et historiques du domaine",
      "Excursion d'une heure à bord d'un bateau Riva classique privé sur le lac de Côme",
      "Bouteille Spumante de prestige et assiette de fruits frais dans la chambre à l'arrivée",
      "Accès aux terrains de tennis et au club de remise en forme haut de gamme"
    ],
    conditions: [
      "Séjour minimum de 3 nuits requis pendant les mois de juillet et août",
      "Pétition de réservation requise au moins 14 jours avant",
      "Taxe de séjour historique non comprise dans le prix de l'offre"
    ]
  },
  {
    id: 5,
    name: "Opulence Étoilée & Plage Privée",
    hotel: "Burj Al Arab",
    location: "Dubaï, Émirats Arabes Unis",
    description: "Une expérience ultra-luxe inégalée dans la suite de l'icône architecturale en forme de voile.",
    longDescription: "Seul hôtel au monde souvent qualifié de 7 étoiles, le Burj Al Arab s'élève sur sa propre île artificielle. Sa silhouette emblématique abrite des suites s'étendant sur deux étages, l'utilisation exclusive d'or 24 carats dans les décors, et une île-terrasse privée d'exception.",
    image: "https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&q=80&w=1200",
    price: "Sur demande",
    rating: 5,
    services: [
      "Suite Royale en duplex de 170m² avec escalier en colimaçon en marbre précieux",
      "Dîner dégustation gastronomique privé de 6 plats dans notre restaurant sous-marin",
      "Accès exclusif à la terrasse géante de 10 000m² avec une plage de sable privée et gazebos luxueux",
      "Transfert depuis l'aéroport de Dubaï en Rolls-Royce Phantom avec chauffeur privé",
      "Service de check-in et check-out personnalisé directement en Suite avec majordome"
    ],
    conditions: [
      "Réservations sujettes à validation budgétaire stricte",
      "Dépôt de garantie requis à la confirmation de séjour",
      "Départ tardif garanti jusqu'à 16:00 pour tous les membres de H-CONCIERGERIE"
    ]
  },
  {
    id: 6,
    name: "Retraite Canyons & Grand Ouest",
    hotel: "Amangiri",
    location: "Utah, États-Unis",
    description: "Un domaine architectural d'exception fondu au cœur des paysages sauvages et secrets des canyons.",
    longDescription: "Niché dans le décor grandiose du désert de l'Utah, l'Amangiri s'intègre avec une discrétion magistrale aux formations géologiques millénaires. Ses lignes de béton brut teinté de sable s'organisent autour d'une piscine iconique encadrée par une falaise monumentale.",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1200",
    price: "À partir de 1 800 €",
    rating: 5,
    services: [
      "Suite Désert d'exception avec terrasse extérieure, cheminée au feu de bois et lit de repos aérien",
      "Tous les repas inclus (concept de table ouverte gastronomique locale d'inspiration amérindienne)",
      "Randonnée privatisée de 3 heures menée par un guide naturaliste expert des canyons",
      "Soin de massage corporel signature d'une heure basé sur les thérapies traditionnelles Navajo",
      "Accès illimité aux pavillons flottants en plein air, sauna et installations d'hydrothérapie"
    ],
    conditions: [
      "Offre valable hors vacances scolaires américaines",
      "Pré-paiement total non remboursable à la confirmation de réservation",
      "Accès privilégié aux hébergements en formule villa complète sur demande spéciale"
    ]
  }
];

// Testimonials with Mixkit high quality loop videos
const clientTestimonials: Testimonial[] = [
  {
    id: 1,
    clientName: "Marc & Valérie A.",
    role: "Membres Privilégiés depuis 3 ans",
    rating: 5,
    comment: "Une organisation divine pour notre séjour aux Maldives. La suite sur pilotis était au-delà de nos attentes, et les avantages tarifaires obtenus par H-CONCIERGERIE dépassaient tout ce que nous aurions pu négocier nous-mêmes.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-wooden-villas-on-water-in-maldives-41481-large.mp4"
  },
  {
    id: 2,
    clientName: "Sébastien L.",
    role: "CEO & Voyageur d'Affaires Frequent",
    rating: 5,
    comment: "Je passe par H-CONCIERGERIE pour tous mes déplacements. Pour l'Aman Tokyo, le surclassement en suite royale et le départ tardif m'ont permis de gérer mes rendez-vous d'affaires sans aucun stress. Recommande vivement !",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-luxury-resort-with-swimming-pool-41484-large.mp4"
  },
  {
    id: 3,
    clientName: "Émilie D.",
    role: "Amoureuse de Beaux Voyages",
    rating: 5,
    comment: "Villa d'Este fut un rêve absolu. Le check-in s'est fait comme si nous étions de la famille royale. Le bateau Riva privé m'attendait devant pour une journée sur l'eau magique. Service irréprochable et discrétion de fer.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-beautiful-swimming-pool-in-a-luxury-hotel-41486-large.mp4"
  }
];

// Showcase photos of places
const showcasePhotos = [
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&q=80&w=1000"
];

// WhatsApp/ChatGPT client feedback screenshots
const clientFeedbackScreenshots = [
  "https://image.noelshack.com/fichiers/2026/21/5/1779401897-chatgpt-image-22-mai-2026-00-16-26.png",
  "https://image.noelshack.com/fichiers/2026/21/5/1779401897-chatgpt-image-22-mai-2026-00-16-07.png",
  "https://image.noelshack.com/fichiers/2026/21/5/1779401897-chatgpt-image-22-mai-2026-00-16-02.png",
  "https://image.noelshack.com/fichiers/2026/21/5/1779401897-chatgpt-image-22-mai-2026-00-15-56.jpg"
];

interface LuxuryHotelsPageProps {
  onBack: () => void;
}

export default function LuxuryHotelsPage({ onBack }: LuxuryHotelsPageProps) {
  // Navigation / views state
  const [selectedOffer, setSelectedOffer] = useState<HotelOffer | null>(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [activeFeedbackLightboxIndex, setActiveFeedbackLightboxIndex] = useState<number | null>(null);

  // Form search states
  const [departureCity, setDepartureCity] = useState("");
  const [destination, setDestination] = useState("");
  const [guests, setGuests] = useState("2");
  const [maxBudget, setMaxBudget] = useState("");
  
  // Date Picker States
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  
  const calendarRef = useRef<HTMLDivElement>(null);

  // Video control states for testimonials
  const [mutedVideos, setMutedVideos] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true
  });

  // Handle clicking outside calendar to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Formatted date string for inputs
  const getFormattedDateString = () => {
    if (!startDate) return "Sélectionner les dates";
    const opt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    if (!endDate) {
      return `À partir du ${startDate.toLocaleDateString('fr-FR', opt)}`;
    }
    return `Du ${startDate.toLocaleDateString('fr-FR', opt)} au ${endDate.toLocaleDateString('fr-FR', opt)}`;
  };

  // Handlers for calendar interaction
  const handleDateClick = (date: Date) => {
    if (date < new Date(new Date().setHours(0,0,0,0))) return; // Prevent past dates

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (date < startDate) {
        setStartDate(date);
      } else {
        setEndDate(date);
        setIsCalendarOpen(false); // Auto close when full range matched
      }
    }
  };

  const clearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStartDate(null);
    setEndDate(null);
  };

  const handleMonthNav = (direction: number) => {
    const next = new Date(currentMonth);
    next.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(next);
  };

  // Calendar rendering helper
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday is 0
    const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Align Monday as index 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    const today = new Date(new Date().setHours(0,0,0,0));

    // Padding for month start offsets
    for (let i = 0; i < adjustedFirstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    // Days grid
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isPast = date < today;
      
      let isSelected = false;
      let isInRange = false;
      let isRangeEdge = false;

      if (startDate) {
        if (startDate.toDateString() === date.toDateString()) {
          isSelected = true;
          isRangeEdge = true;
        }
      }
      if (endDate) {
        if (endDate.toDateString() === date.toDateString()) {
          isSelected = true;
          isRangeEdge = true;
        }
        if (startDate && date > startDate && date < endDate) {
          isInRange = true;
        }
      } else if (startDate && hoverDate && date > startDate && date < hoverDate) {
        isInRange = true;
      }

      days.push(
        <button
          key={`day-${day}`}
          type="button"
          disabled={isPast}
          onClick={() => handleDateClick(date)}
          onMouseEnter={() => !endDate && setHoverDate(date)}
          onMouseLeave={() => setHoverDate(null)}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            isPast 
              ? "text-slate-300 cursor-not-allowed" 
              : isSelected
                ? "bg-gold text-slate-900 font-bold shadow-lg shadow-gold/30 hover:bg-gold-light"
                : isInRange
                  ? "bg-gold/20 text-gold-dark rounded-none"
                  : "text-slate-700 hover:bg-slate-100 hover:text-gold"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // Snapchat / WhatsApp link triggers
  const handleSearchOnWhatsApp = () => {
    const dateStr = getFormattedDateString();
    
    // WhatsApp prefilled template
    const message = `Bonjour, je souhaite une recherche d’hôtel de luxe.
Ville de départ : ${departureCity || "Non spécifié"}
Destination : ${destination || "Non spécifié"}
Nombre de personnes : ${guests || "Non spécifié"}
Budget maximum : ${maxBudget ? maxBudget + "€" : "Non spécifié"}
Dates : ${dateStr}
Merci de me proposer les meilleures offres.`;

    const whatsAppUrl = `https://wa.me/33774067388?text=${encodeURIComponent(message)}`;
    window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
  };

  const handleOfferWhatsApp = (offer: HotelOffer) => {
    const message = `Bonjour, je souhaite plus de détails concernant l'offre "${offer.name}" réservée aux membres privilégiés.
Hôtel : ${offer.hotel}
Destination : ${offer.location}
Tarif indicatif : ${offer.price}
Merci de me recontacter afin de réserver ou de m'envoyer plus de détails sur les disponibilités.`;

    const whatsAppUrl = `https://wa.me/33774067388?text=${encodeURIComponent(message)}`;
    window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
  };

  // Toggle audio on testimonial videos
  const toggleMute = (id: number) => {
    setMutedVideos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Lightbox cyclic controls
  const handleLightboxNav = (direction: number) => {
    if (activeLightboxIndex === null) return;
    const total = showcasePhotos.length;
    let nextIndex = activeLightboxIndex + direction;
    if (nextIndex < 0) nextIndex = total - 1;
    if (nextIndex >= total) nextIndex = 0;
    setActiveLightboxIndex(nextIndex);
  };

  // Feedback Lightbox cyclic controls
  const handleFeedbackLightboxNav = (direction: number) => {
    if (activeFeedbackLightboxIndex === null) return;
    const total = clientFeedbackScreenshots.length;
    let nextIndex = activeFeedbackLightboxIndex + direction;
    if (nextIndex < 0) nextIndex = total - 1;
    if (nextIndex >= total) nextIndex = 0;
    setActiveFeedbackLightboxIndex(nextIndex);
  };

  return (
    <div className="pt-24 pb-16 bg-white text-slate-900 relative z-10 w-full">
      {/* Dynamic continuous animation style injection */}
      <style>{`
        @keyframes scrollLeftContinuous {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .continuous-scroller-left {
          display: flex;
          width: max-content;
          animation: scrollLeftContinuous 50s linear infinite;
        }
        .continuous-scroller-left:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="container mx-auto px-6">
        
        {/* Top bar with beautiful design & Back button */}
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 border border-slate-200/60 hover:border-gold hover:text-gold text-slate-800 transition-all rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer"
          >
            <ArrowLeft size={16} /> Retour à l'accueil
          </button>
        </div>

        {/* Heading Section */}
        <div className="text-center max-w-4xl mx-auto mb-8 px-4">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gold tracking-[0.4em] uppercase text-xs font-bold block"
          >
            Services Réservations de Prestige
          </motion.span>
        </div>

        {/* 1. Large search block inspired by high-end Booking.com style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[2.5rem] p-8 md:p-10 mb-20 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative border border-slate-100 bg-slate-50/80 backdrop-blur-2xl"
        >
          {/* Decorative design accents */}
          <div className="absolute top-0 right-10 transform -translate-y-1/2 p-4 bg-gold rounded-full shadow-lg shadow-gold/20 hidden md:flex items-center justify-center">
            <Search size={22} className="text-white" />
          </div>

          <h3 className="text-2xl font-serif mb-6 text-slate-800 tracking-wide border-b border-slate-200 pb-4">
            Trouver un hôtel d'exception
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            
            {/* Ville de départ */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-amber-700 flex items-center gap-1.5">
                <Navigation size={12} /> Ville de départ
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Paris, Genève, Bruxelles..."
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-gold outline-none px-4 py-3.5 pl-10 rounded-xl text-sm text-slate-900 placeholder-slate-400/90 transition-all"
                />
                <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gold w-4 h-4" />
              </div>
            </div>

            {/* Destination */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-amber-700 flex items-center gap-1.5">
                <MapPin size={12} /> Destination souhaitée
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Maldives, Dubaï, Saint-Tropez..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-gold outline-none px-4 py-3.5 pl-10 rounded-xl text-sm text-slate-900 placeholder-slate-400/90 transition-all"
                />
                <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gold w-4 h-4 animate-pulse" />
              </div>
            </div>

            {/* Dates (Interactive Calendar Trigger) */}
            <div className="flex flex-col gap-2 relative">
              <label className="text-[10px] uppercase font-bold tracking-widest text-amber-700 flex items-center gap-1.5">
                <Calendar size={12} /> Dates de séjour
              </label>
              <div 
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 cursor-pointer rounded-xl px-4 py-3.5 pl-10 text-sm text-slate-900 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2 overflow-hidden truncate">
                  <span className={`${startDate ? "text-slate-900" : "text-slate-400"}`}>
                    {getFormattedDateString()}
                  </span>
                </div>
                {startDate && (
                  <button 
                    onClick={clearDates} 
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
                <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gold w-4 h-4" />
              </div>

              {/* Custom interactive calendars popover */}
              <AnimatePresence>
                {isCalendarOpen && (
                  <motion.div
                    ref={calendarRef}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 5, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 md:right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl w-[320px] md:w-[350px]"
                  >
                    {/* Calendar Month Header Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button 
                        type="button"
                        onClick={() => handleMonthNav(-1)}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <MoveLeft size={16} />
                      </button>
                      <span className="text-sm font-bold uppercase tracking-wider text-amber-700">
                        {currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleMonthNav(1)}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <MoveRight size={16} />
                      </button>
                    </div>

                    {/* Day Name Columns */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 uppercase font-black mb-2">
                      <div>Lu</div>
                      <div>Ma</div>
                      <div>Me</div>
                      <div>Je</div>
                      <div>Ve</div>
                      <div>Sa</div>
                      <div>Di</div>
                    </div>

                    {/* Grid Days */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {renderCalendarDays()}
                    </div>

                    {/* Footer Info inside Popover */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {!startDate 
                          ? "Sélectionnez votre date d'arrivée" 
                          : !endDate 
                            ? "Sélectionnez votre date de départ" 
                            : "Formule week-end ou séjour complet valide"}
                      </div>
                      {startDate && (
                        <button
                          type="button"
                          onClick={() => setIsCalendarOpen(false)}
                          className="w-full text-center py-1.5 bg-gold hover:bg-gold-light text-slate-900 font-bold uppercase text-[10px] tracking-widest rounded-lg transition-colors cursor-pointer"
                        >
                          Valider la période
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Nombre de personnes */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-amber-700 flex items-center gap-1.5">
                <Users size={12} /> Personnes
              </label>
              <div className="relative">
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-gold outline-none px-4 py-3.5 rounded-xl text-sm text-slate-900 appearance-none cursor-pointer transition-all"
                >
                  <option className="bg-white text-slate-900" value="1">1 Personne</option>
                  <option className="bg-white text-slate-900" value="2">2 Personnes (Couple)</option>
                  <option className="bg-white text-slate-900" value="3">3 Personnes</option>
                  <option className="bg-white text-slate-900" value="4">4 Personnes (Famille)</option>
                  <option className="bg-white text-slate-900" value="5">5 Personnes et +</option>
                </select>
                <ChevronRight className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gold w-4 h-4 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* Budget maximum */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-amber-700 flex items-center gap-1.5">
                <Euro size={12} /> Budget max
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Illimité"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-gold outline-none px-4 py-3.5 pr-10 rounded-xl text-sm text-slate-900 placeholder-slate-400 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gold font-bold text-sm">€</span>
              </div>
            </div>

          </div>

          {/* Action button: Rechercher */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSearchOnWhatsApp}
              className="px-12 py-4 bg-gold hover:bg-slate-950 text-white shadow-lg shadow-gold/25 font-bold text-sm tracking-widest uppercase rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Lancer la recherche
            </button>
          </div>
        </motion.div>

        {/* 2. Slow scrolling auto-carousels of luxury hotel promotional offers */}
        <div className="mb-24 relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center mb-10 px-4">
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-slate-800">Offres du moment</h2>
            <p className="text-slate-500 font-light text-sm">
              Une sélection prestigieuse d'escapades avec avantages financiers exclusifs réservés aux membres de notre réseau.
            </p>
          </div>

          <div className="relative w-full overflow-hidden mask-gradient-x">
            {/* The infinite continuous horizontal scrolling viewport */}
            <div className="continuous-scroller-left">
              {/* Duplicate map to achieve clean endless loop seamless scroll */}
              {[...hotelOffers, ...hotelOffers].map((offer, idx) => (
                <div 
                  key={`${offer.id}-${idx}`}
                  className="w-[320px] md:w-[380px] bg-slate-50 border border-slate-200/60 rounded-3xl p-6 mx-4 shrink-0 transition-all select-none flex flex-col h-[520px] hover:border-gold hover:shadow-[0_12px_40px_rgba(212,175,55,0.08)] group"
                >
                  <div className="h-56 overflow-hidden rounded-2xl relative mb-5 shrink-0">
                    <img
                      src={offer.image}
                      alt={offer.hotel}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-[10px] text-gold uppercase tracking-widest font-black">
                      {offer.location}
                    </div>
                  </div>

                  <div className="flex-grow flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-amber-700 tracking-widest mb-1.5 block">
                      {offer.hotel}
                    </span>
                    <h4 className="text-xl font-serif text-slate-800 mb-2 leading-tight">
                      {offer.name}
                    </h4>
                    <p className="text-slate-500 text-xs font-light leading-relaxed mb-6 flex-grow overflow-hidden text-ellipsis line-clamp-3">
                      {offer.description}
                    </p>
                    
                    <div className="mt-auto border-t border-slate-200/60 pt-4 flex items-center justify-between gap-2 shrink-0">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-slate-400 block">Tarif Estimatif</span>
                        <span className="text-sm font-serif text-gold-dark font-bold">{offer.price}</span>
                      </div>
                      <button
                        onClick={() => setSelectedOffer(offer)}
                        className="px-4 py-2 bg-slate-200/60 group-hover:bg-gold hover:!bg-slate-950 text-slate-800 group-hover:text-white font-bold text-[10px] tracking-widest uppercase rounded-full transition-all duration-300 cursor-pointer"
                      >
                        Voir les détails
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Client feedback screenshots continuous conveyor belt */}
        <div className="mb-24 relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center mb-10 px-4">
            <span className="text-gold tracking-[0.4em] uppercase text-xs font-bold mb-3 block">Conversations réelles</span>
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-slate-800">Vos Messages & Retours</h2>
            <p className="text-slate-500 font-light text-sm">
              Quelques retours authentiques partagés fièrement par nos membres privilégiés à la suite de leurs escapades.
            </p>
          </div>

          <div className="relative w-full overflow-hidden mask-gradient-x py-4">
            {/* Horizontal endless loop scrolling conveyor belt */}
            <div className="continuous-scroller-left">
              {[...clientFeedbackScreenshots, ...clientFeedbackScreenshots, ...clientFeedbackScreenshots].map((photo, index) => (
                <div 
                  key={`feedback-photo-${index}`}
                  onClick={() => setActiveFeedbackLightboxIndex(index % clientFeedbackScreenshots.length)}
                  className="w-64 h-[450px] rounded-3xl overflow-hidden shrink-0 mx-4 cursor-pointer relative group border border-slate-200/80 bg-slate-50 shadow-md hover:shadow-xl hover:border-gold/60 transition-all duration-500"
                >
                  <img
                    src={photo}
                    alt="WhatsApp client feedback"
                    className="w-full h-full object-contain p-2 bg-white transition-transform duration-700 group-hover:scale-[1.03]"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle hover overlay hint */}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                    <div className="p-3.5 bg-gold rounded-full text-white transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg shadow-gold/30">
                      <Maximize2 size={20} className="text-slate-900" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. "Retours clients" Testimonial section with mock luxury dynamic video loops */}
        <div className="mb-24 bg-slate-50/80 border border-slate-200/60 rounded-[3rem] p-10 md:p-14 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.03)] relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-gold tracking-[0.4em] uppercase text-xs font-bold mb-4 block">Découvrez Vos Privilèges</span>
            <h2 className="text-3xl md:text-5xl font-serif text-slate-800">Retours & Expériences Clients</h2>
            <p className="text-slate-500 font-light text-sm mt-3">
              Découvrez la vision unique d'un séjour d'exception racontée par nos membres privilégiés.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {(() => {
              const t = clientTestimonials[0];
              return (
                <div 
                  key={t.id}
                  className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200/60 shadow-lg hover:border-gold/50 transition-all duration-300"
                >
                  {/* Looping Ambient video mock with testimonials card */}
                  <div className="h-60 md:h-auto md:w-1/2 relative overflow-hidden bg-black shrink-0 min-h-[300px]">
                    <video 
                      src={t.videoUrl} 
                      className="w-full h-full object-cover opacity-60 absolute inset-0"
                      autoPlay
                      loop
                      playsInline
                      muted={mutedVideos[t.id]}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/70 via-transparent to-transparent" />
                    
                    {/* Floating Video Audio toggle button */}
                    <button 
                      onClick={() => toggleMute(t.id)}
                      className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-gold text-white hover:text-slate-900 rounded-full backdrop-blur-md border border-white/10 transition-colors z-20 cursor-pointer"
                    >
                      {mutedVideos[t.id] ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>

                    <div className="absolute bottom-4 left-4 z-10">
                      <span className="text-xs font-bold text-white px-2.5 py-1 bg-gold rounded-md text-slate-900 shadow-lg">
                        VLOG DU SÉJOUR
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex-grow flex flex-col justify-between bg-white text-slate-850">
                    <div>
                      {/* Client star rating */}
                      <div className="flex gap-1 mb-4 select-none">
                        {[...Array(t.rating)].map((_, index) => (
                          <span key={index} className="text-gold font-bold">★</span>
                        ))}
                      </div>

                      <p className="text-slate-700 italic font-light text-sm md:text-base leading-relaxed mb-6">
                        "{t.comment}"
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <h5 className="text-slate-800 font-bold font-sans text-sm">{t.clientName}</h5>
                      <p className="text-gold text-[10px] uppercase tracking-widest font-black leading-normal mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* A. Elegant Offer Details Modal Dialog (Modal overlay with Framer motion) */}
      <AnimatePresence>
        {selectedOffer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedOffer(null)}
                className="absolute top-6 right-6 z-20 p-2.5 bg-black/60 rounded-full hover:bg-gold text-white hover:text-slate-900 border border-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Large Image Showcase with Gold gradient overlays */}
              <div className="h-80 md:h-[400px] w-full relative">
                <img
                  src={selectedOffer.image}
                  alt={selectedOffer.hotel}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/35" />
                
                <div className="absolute bottom-8 left-8 right-8 text-slate-900">
                  <span className="px-3.5 py-1.5 bg-gold text-slate-900 uppercase tracking-widest text-[9px] font-black rounded-full shadow-lg block w-max mb-3">
                    {selectedOffer.location}
                  </span>
                  <p className="text-amber-800 text-[10px] uppercase font-bold tracking-widest mb-1">{selectedOffer.hotel}</p>
                  <h3 className="text-3xl md:text-5xl font-serif text-slate-900">{selectedOffer.name}</h3>
                </div>
              </div>

              {/* Content Panel */}
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  
                  {/* Left block - Description & Services */}
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h4 className="text-sm uppercase font-bold tracking-widest text-amber-700 mb-3">L'Expérience Proposée</h4>
                      <p className="text-slate-600 font-light leading-relaxed">{selectedOffer.longDescription}</p>
                    </div>

                    <div>
                      <h4 className="text-sm uppercase font-bold tracking-widest text-amber-700 mb-4">Privilèges & Services Inclus</h4>
                      <div className="space-y-3">
                        {selectedOffer.services.map((srv, idx) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <div className="p-1 bg-gold/10 text-gold-dark rounded-md mt-0.5 shrink-0">
                              <Check size={12} className="stroke-[3]" />
                            </div>
                            <span className="text-slate-600 text-xs font-light leading-relaxed">{srv}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Block - Booking options & Tariffs */}
                  <div className="bg-slate-50 border border-slate-200/60 p-6 md:p-8 rounded-3xl h-max flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Budget requis</span>
                      <p className="text-2xl font-serif text-gold-dark font-bold mb-6">{selectedOffer.price}</p>
                      
                      <h5 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-3">Conditions d'application</h5>
                      <ul className="space-y-2 mb-8">
                        {selectedOffer.conditions.map((cnd, index) => (
                          <li key={index} className="text-slate-500 text-[10px] font-light leading-relaxed flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-gold/50 rounded-full shrink-0" />
                            {cnd}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleOfferWhatsApp(selectedOffer)}
                      className="w-full text-center py-4 bg-gold hover:bg-slate-950 text-slate-900 hover:text-white font-bold uppercase text-xs tracking-widest rounded-xl transition-all duration-300 shadow-md shadow-gold/20 cursor-pointer"
                    >
                      Demander cette offre sur WhatsApp
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* B. Full-Screen Photo Gallery & Lightbox Viewer overlay */}
      <AnimatePresence>
        {activeLightboxIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-black/98"
          >
            {/* Top Toolbar */}
            <div className="flex justify-between items-center relative z-10 shrink-0">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Affichage Plein Écran — Photo {activeLightboxIndex + 1} sur {showcasePhotos.length}
              </span>
              <button
                onClick={() => setActiveLightboxIndex(null)}
                className="p-3 bg-white/5 hover:bg-gold hover:text-luxury-black rounded-full border border-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Central Main Image Content Frame */}
            <div className="flex-grow flex items-center justify-between gap-4 py-6 relative">
              {/* Prev controls arrow */}
              <button 
                onClick={() => handleLightboxNav(-1)}
                className="p-4 bg-white/5 hover:bg-gold hover:text-luxury-black border border-white/10 rounded-full transition-colors relative z-20 cursor-pointer shrink-0"
              >
                <MoveLeft size={20} />
              </button>

              <div className="max-w-[85vw] max-h-[75vh] mx-auto overflow-hidden rounded-2xl shadow-2xl relative z-10 flex items-center justify-center">
                <motion.img
                  key={activeLightboxIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  src={showcasePhotos[activeLightboxIndex]}
                  alt="Spotlight Moment"
                  className="w-full h-full max-h-[75vh] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Next controls arrow */}
              <button 
                onClick={() => handleLightboxNav(1)}
                className="p-4 bg-white/5 hover:bg-gold hover:text-luxury-black border border-white/10 rounded-full transition-colors relative z-20 cursor-pointer shrink-0"
              >
                <MoveRight size={20} />
              </button>
            </div>

            {/* Bottom Panel bar with slide indices info */}
            <div className="flex justify-center shrink-0">
              <div className="flex gap-2">
                {showcasePhotos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveLightboxIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === activeLightboxIndex ? "w-8 bg-gold" : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* C. Full-Screen Feedback Screenshots Lightbox Viewer overlay */}
      <AnimatePresence>
        {activeFeedbackLightboxIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-black/98"
          >
            {/* Top Toolbar */}
            <div className="flex justify-between items-center relative z-10 shrink-0">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Retour Client — Capture {activeFeedbackLightboxIndex + 1} sur {clientFeedbackScreenshots.length}
              </span>
              <button
                onClick={() => setActiveFeedbackLightboxIndex(null)}
                className="p-3 bg-white/5 hover:bg-gold hover:text-luxury-black rounded-full border border-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Central Main Image Content Frame */}
            <div className="flex-grow flex items-center justify-between gap-4 py-6 relative">
              {/* Prev controls arrow */}
              <button 
                onClick={() => handleFeedbackLightboxNav(-1)}
                className="p-4 bg-white/5 hover:bg-gold hover:text-luxury-black border border-white/10 rounded-full transition-colors relative z-20 cursor-pointer shrink-0"
              >
                <MoveLeft size={20} />
              </button>

              <div className="max-w-[90vw] max-h-[80vh] mx-auto overflow-hidden rounded-2xl shadow-2xl relative z-10 flex items-center justify-center">
                <motion.img
                  key={activeFeedbackLightboxIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  src={clientFeedbackScreenshots[activeFeedbackLightboxIndex]}
                  alt="Feedback Screenshot"
                  className="max-w-full max-h-[80vh] object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Next controls arrow */}
              <button 
                onClick={() => handleFeedbackLightboxNav(1)}
                className="p-4 bg-white/5 hover:bg-gold hover:text-luxury-black border border-white/10 rounded-full transition-colors relative z-20 cursor-pointer shrink-0"
              >
                <MoveRight size={20} />
              </button>
            </div>

            {/* Bottom Panel bar with slide indices info */}
            <div className="flex justify-center shrink-0">
              <div className="flex gap-2">
                {clientFeedbackScreenshots.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveFeedbackLightboxIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === activeFeedbackLightboxIndex ? "w-8 bg-gold" : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
