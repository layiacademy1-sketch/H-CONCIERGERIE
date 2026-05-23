import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Search, Calendar, Users, Euro, MapPin, Navigation, 
  X, Check, ChevronRight, Play, Volume2, VolumeX, Eye, Maximize2, MoveLeft, MoveRight,
  Loader2
} from "lucide-react";

// Types
interface ApiCitySuggestion {
  name: string;
  country: string;
  flag: string;
  state?: string;
  fullName: string;
}
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
  discount: string;
  oldPrice: string;
  nights: string;
  viewers: number;
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
    price: "890 €",
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
    ],
    discount: "-57%",
    oldPrice: "2100 €",
    nights: "3 nuits",
    viewers: 7
  },
  {
    id: 2,
    name: "Sérénité Tropicale & Spa",
    hotel: "One&Only Reethi Rah",
    location: "Maldives",
    description: "Une villa sur pilotis d'exception avec piscine privée suspendue au-dessus de l'océan Indien.",
    longDescription: "Une retraite insulaire ultime où les eaux turquoise rencontrent le sable blanc le plus pur. Votre villa privée sur pilotis offre une intimité totale, des couchers de soleil incomparables, et les soins holistiques du spa mondialement primé.",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&q=80&w=1200",
    price: "1250 €",
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
    ],
    discount: "-68%",
    oldPrice: "3900 €",
    nights: "5 nuits",
    viewers: 11
  },
  {
    id: 4,
    name: "Grand Splendeur de la Renaissance",
    hotel: "Villa d'Este",
    location: "Lac de Côme, Italie",
    description: "Résidence historique d'exception nichée au cœur d'un parc botanique privé en bord de lac.",
    longDescription: "Chef-d'œuvre de la Renaissance, la Villa d'Este incarne la quintessence du chic italien. Ses jardins magnifiques, sa célèbre piscine flottante et ses intérieurs richement décorés de soies et d'œuvres d'art vous invitent à la Dolce Vita dans sa forme la plus noble.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1200",
    price: "620 €",
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
    ],
    discount: "-67%",
    oldPrice: "1900 €",
    nights: "3 nuits",
    viewers: 6
  },
  {
    id: 5,
    name: "Opulence Étoilée & Plage Privée",
    hotel: "Burj Al Arab",
    location: "Dubaï, Émirats Arabes Unis",
    description: "Une expérience ultra-luxe inégalée dans la suite de l'icône architecturale en forme de voile.",
    longDescription: "Seul hôtel au monde souvent qualifié de 7 étoiles, le Burj Al Arab s'élève sur sa propre île artificielle. Sa silhouette emblématique abrite des suites s'étendant sur deux étages, l'utilisation exclusive d'or 24 carats dans les décors, et une île-terrasse privée d'exception.",
    image: "https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&q=80&w=1200",
    price: "1150 €",
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
    ],
    discount: "-72%",
    oldPrice: "4200 €",
    nights: "4 nuits",
    viewers: 9
  },
  {
    id: 6,
    name: "Retraite Canyons & Grand Ouest",
    hotel: "Amangiri",
    location: "Utah, États-Unis",
    description: "Un domaine architectural d'exception fondu au cœur des paysages sauvages et secrets des canyons.",
    longDescription: "Niché dans le décor grandiose du désert de l'Utah, l'Amangiri s'intègre avec une discrétion magistrale aux formations géologiques millénaires. Ses lignes de béton brut teinté de sable s'organisent autour d'une piscine iconique encadrée par une falaise monumentale.",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1200",
    price: "980 €",
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
    ],
    discount: "-71%",
    oldPrice: "3400 €",
    nights: "3 nuits",
    viewers: 5
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

interface GlobalCity {
  name: string;
  country: string;
  flag: string;
}

const globalCities: GlobalCity[] = [
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

// Practical live countdown timer precisely matching image styled tags 
function FlashTimer({ id }: { id: number }) {
  // Seed distinct initial timer states based on ID to look diverse & highly authentic
  const initialSeconds = 3600 * 24 * (id % 2 === 0 ? 2 : 1) + 3600 * (id % 12 + 2) + 60 * (id % 45 + 10) + 45;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : initialSeconds));
    }, 1000);
    return () => clearInterval(interval);
  }, [id]);

  const days = Math.floor(secondsLeft / (3600 * 24));
  const hours = Math.floor((secondsLeft % (3600 * 24)) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const pad = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="flex items-center gap-1 shrink-0 font-sans">
      <span className="text-slate-400 text-xs mr-1">🕒</span>
      {days > 0 && (
        <span className="bg-rose-50 border border-rose-100 rounded-md text-[#e31c25] font-extrabold px-1.5 py-0.5 text-[11px] select-none">
          {pad(days)}j
        </span>
      )}
      <span className="bg-rose-50 border border-rose-100 rounded-md text-[#e31c25] font-extrabold px-1.5 py-0.5 text-[11px] select-none">
        {pad(hours)}h
      </span>
      <span className="bg-rose-50 border border-rose-100 rounded-md text-[#e31c25] font-extrabold px-1.5 py-0.5 text-[11px] select-none">
        {pad(minutes)}m
      </span>
      <span className="bg-rose-50 border border-rose-100 rounded-md text-[#e31c25] font-extrabold px-1.5 py-0.5 text-[11px] select-none">
        {pad(seconds)}s
      </span>
    </div>
  );
}

interface LuxuryHotelsPageProps {
  onBack: () => void;
}

export default function LuxuryHotelsPage({ onBack }: LuxuryHotelsPageProps) {
  // Navigation / views state
  const [selectedOffer, setSelectedOffer] = useState<HotelOffer | null>(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [activeFeedbackLightboxIndex, setActiveFeedbackLightboxIndex] = useState<number | null>(null);
  
  // Slider navigation ref
  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 370 + 32; // card width + margin gap
      if (direction === "left") {
        sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  // Automatic slow scrolling effect for Flash Offers
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Initialize position ref with actual current scroll position
    scrollPosRef.current = slider.scrollLeft;

    let prevTime = performance.now();
    let animationFrameId: number;

    const autoScrollSpeed = 0.11; // pixels per millisecond (~110px per second)

    const animate = (time: number) => {
      const delta = time - prevTime;
      prevTime = time;

      if (!isSliderHovered && slider) {
        // Increment position to the right (translates content left)
        scrollPosRef.current += autoScrollSpeed * delta;

        const oneThird = slider.scrollWidth / 3;
        // Seamless loop wrapping math
        if (oneThird > 0 && scrollPosRef.current >= oneThird * 2) {
          scrollPosRef.current -= oneThird;
        }

        slider.scrollLeft = Math.round(scrollPosRef.current);
      } else if (slider) {
        // Keep our internal position ref synced with manual user scroll/interaction
        scrollPosRef.current = slider.scrollLeft;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isSliderHovered]);

  const handleSliderScroll = () => {
    if (sliderRef.current && isSliderHovered) {
      scrollPosRef.current = sliderRef.current.scrollLeft;
    }
  };
  
  // Wishlist / favorites state
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const toggleFavorite = (id: number) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Form search states
  const [destination, setDestination] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [guests, setGuests] = useState("2");
  const [maxBudget, setMaxBudget] = useState("");
  const [apiSuggestions, setApiSuggestions] = useState<ApiCitySuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Debounced Osm Autocomplete API
  useEffect(() => {
    if (destination.trim().length < 2) {
      setApiSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&addressdetails=1&limit=10&accept-language=fr`,
          {
            headers: {
              "Accept": "application/json"
            }
          }
        );
        if (!response.ok) throw new Error("API response error");
        const data = await response.json();
        
        const parsedSuggestions: ApiCitySuggestion[] = [];
        const seen = new Set<string>();

        for (const item of data) {
          const addr = item.address;
          if (!addr) continue;

          // Prefer town, city, village, etc. fallback to main name or province
          const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.hamlet || addr.suburb || addr.island || addr.state_district || item.name;
          const country = addr.country;
          
          if (!cityName || !country) continue;
          
          const countryCode = addr.country_code ? addr.country_code.toUpperCase() : "";
          
          // Generate emoji flag dynamically from ISO code
          let flag = "📍";
          if (countryCode) {
            const codePoints = countryCode
              .split("")
              .map((char: string) => 127397 + char.charCodeAt(0));
            try {
              flag = String.fromCodePoint(...codePoints);
            } catch (e) {
              flag = "📍";
            }
          }
          
          const state = addr.state || addr.region || addr.county || undefined;
          const formattedState = state && state.toLowerCase() !== cityName.toLowerCase() ? state : undefined;
          
          const uniqueKey = `${cityName.toLowerCase()}-${(formattedState || "").toLowerCase()}-${country.toLowerCase()}`;
          if (seen.has(uniqueKey)) continue;
          seen.add(uniqueKey);

          parsedSuggestions.push({
            name: cityName,
            country: country,
            flag: flag,
            state: formattedState,
            fullName: `${cityName}${formattedState ? `, ${formattedState}` : ""}, ${country}`
          });
        }

        setApiSuggestions(parsedSuggestions);
      } catch (error) {
        console.error("Error fetching city suggestions:", error);
        // Robust fallback using our local luxurious cities catalog
        const term = destination.toLowerCase();
        const localMatches = globalCities
          .filter(c => c.name.toLowerCase().includes(term) || c.country.toLowerCase().includes(term))
          .map(c => ({
            name: c.name,
            country: c.country,
            flag: c.flag,
            fullName: `${c.name}, ${c.country}`
          }));
        setApiSuggestions(localMatches);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [destination]);
  
  // Date Picker States
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside calendar and destination suggestions to close them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
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
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
          className="rounded-[2.5rem] p-8 md:p-10 mb-20 shadow-2xl relative border border-slate-200 bg-white text-slate-900"
        >
          {/* Decorative design accents */}
          <div className="absolute top-0 right-10 transform -translate-y-1/2 p-4 bg-gold rounded-full shadow-lg shadow-gold/20 hidden md:flex items-center justify-center">
            <Search size={22} className="text-white" />
          </div>

          <h3 className="text-2xl font-serif mb-6 text-slate-800 tracking-wide border-b border-slate-200 pb-4">
            Trouver un hôtel d'exception
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Destination with Autocomplete */}
            <div className="flex flex-col gap-2 relative" ref={destinationRef}>
              <label className="text-[10px] uppercase font-bold tracking-widest text-amber-700 flex items-center gap-1.5">
                <MapPin size={12} /> Destination souhaitée
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Maldives, Dubaï, Saint-Tropez..."
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-white border border-slate-200 focus:border-gold outline-none px-4 py-3.5 pl-10 pr-10 rounded-xl text-sm text-slate-900 placeholder-slate-400/90 transition-all"
                />
                <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gold w-4 h-4" />
                {isLoadingSuggestions && (
                  <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gold w-4 h-4 animate-spin" />
                )}
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 5 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-72 overflow-y-auto mt-1 scrollbar-thin"
                  >
                    {destination.trim().length > 0 ? (
                      destination.trim().length < 2 ? (
                        <div className="px-4 py-4 text-center text-slate-400 text-xs">
                          Entrez au moins 2 caractères...
                        </div>
                      ) : apiSuggestions.length > 0 ? (
                        apiSuggestions.map((city, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setDestination(city.fullName);
                              setShowSuggestions(false);
                            }}
                            className="px-4 py-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer border-b border-slate-100 last:border-b-0 transition-all text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl select-none" role="img" aria-label={city.country}>
                                {city.flag}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-slate-950 font-bold text-sm">
                                  {city.name}
                                </span>
                                {city.state && (
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    {city.state}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md shrink-0">
                              {city.country}
                            </span>
                          </div>
                        ))
                      ) : (
                        !isLoadingSuggestions && (
                          <div className="px-4 py-4 text-center text-slate-400 text-xs">
                            Aucune destination trouvée
                          </div>
                        )
                      )
                    ) : (
                      <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50/50">
                        Destinations Populaires
                      </div>
                    )}
                    {destination.trim().length === 0 &&
                      globalCities.slice(0, 7).map((city, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setDestination(`${city.name}, ${city.country}`);
                            setShowSuggestions(false);
                          }}
                          className="px-4 py-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer border-b border-slate-100 last:border-b-0 transition-all text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl select-none" role="img" aria-label={city.country}>
                              {city.flag}
                            </span>
                            <span className="text-slate-950 font-semibold text-sm">{city.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md shrink-0">
                            {city.country}
                          </span>
                        </div>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
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
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-slate-900 font-bold">Offres flash</h2>
            <p className="text-slate-500 font-light text-sm">
              Découvrez nos offres éclair exclusives à durée de validité limitée. Des avantages d'exception négociés directement auprès des plus beaux palais du monde.
            </p>
          </div>
 
          <div 
            className="relative w-full px-4 md:px-14 group/slider"
            onMouseEnter={() => setIsSliderHovered(true)}
            onMouseLeave={() => setIsSliderHovered(false)}
          >
            {/* Arrow Button Left */}
            <button
              onClick={() => scrollSlider("left")}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-[#e31c25] hover:text-white border border-slate-200/80 shadow-lg w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-slate-850 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Défiler à gauche"
            >
              <MoveLeft size={18} className="stroke-[2.5px]" />
            </button>

            {/* Arrow Button Right */}
            <button
              onClick={() => scrollSlider("right")}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-[#e31c25] hover:text-white border border-slate-200/80 shadow-lg w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-slate-850 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Défiler à droite"
            >
              <MoveRight size={18} className="stroke-[2.5px]" />
            </button>

            {/* Interactive horizontal snap slide viewport */}
            <div 
              ref={sliderRef}
              onScroll={handleSliderScroll}
              className="flex overflow-x-auto gap-8 scroll-smooth scrollbar-none py-4 px-2 md:px-6 snap-x snap-mandatory"
            >
              {/* Multiplying the list as [...hotelOffers, ...hotelOffers, ...hotelOffers] to achieve seamless endless looping scrolling */}
              {[...hotelOffers, ...hotelOffers, ...hotelOffers].map((offer, idx) => (
                <div 
                  key={`${offer.id}-${idx}`}
                  className="w-[290px] sm:w-[325px] md:w-[370px] bg-white border border-slate-200 rounded-[2.2rem] p-4 shrink-0 transition-all select-none flex flex-col h-[600px] shadow-[0_15px_45px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:border-red-500/30 group text-slate-900 snap-start"
                >
                  {/* Top image section going edge-to-edge relative to internal padding */}
                  <div className="h-56 overflow-hidden rounded-[1.6rem] relative shrink-0">
                    <img
                      src={offer.image}
                      alt={offer.hotel}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* -81% Discount Badge */}
                    <div className="absolute top-4 left-4 bg-[#e31c25] text-white font-extrabold text-[13px] tracking-tight px-3 py-1.5 rounded-[12px] shadow-md select-none">
                      {offer.discount}
                    </div>

                    {/* ★ 5 Rating Star Badge */}
                    <div className="absolute top-4 right-4 bg-slate-950/75 backdrop-blur-md text-white font-bold text-xs px-2.5 py-1 rounded-[12px] flex items-center gap-1 select-none shadow-md">
                      <span className="text-amber-400">★</span>
                      <span>{offer.rating}</span>
                    </div>

                    {/* Heart Option Toggle Button (Simulating interactive wishlist) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(offer.id);
                      }}
                      className="absolute bottom-4 right-4 bg-white hover:bg-slate-100 active:scale-95 transition-all w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer text-slate-950 z-10"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill={favorites[offer.id] ? "#e31c25" : "none"} 
                        stroke={favorites[offer.id] ? "#e31c25" : "currentColor"} 
                        strokeWidth="2" 
                        className="w-5 h-5 transition-colors"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                    </button>
                  </div>

                  {/* Body Content Info */}
                  <div className="p-1 flex-grow flex flex-col mt-4">
                    
                    {/* Brand Label and Countdown Timer row */}
                    <div className="flex items-center justify-between gap-1 mb-2.5">
                      <span className="text-[11px] uppercase font-black text-[#1a2e5c] tracking-wider select-none">
                        OFFRE ÉCLAIR
                      </span>
                      {/* Live Ticking Countdown */}
                      <FlashTimer id={offer.id} />
                    </div>

                    {/* Urgency indicator: ● 👁 X regardent */}
                    <div className="bg-[#fff8f2] border border-[#fde3cf] text-[#d97706] font-bold flex items-center gap-2 px-3 py-2 rounded-xl text-xs w-full mb-3.5 select-none">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                      </span>
                      <Eye size={12} className="text-orange-500 shrink-0" />
                      <span className="text-[11px] leading-none shrink-0">{offer.viewers} regardent</span>
                    </div>

                    {/* Headline Detail */}
                    <h4 className="text-xl font-serif font-black text-slate-950 leading-tight tracking-wide line-clamp-1">
                      {offer.hotel}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 mb-4 select-none self-start">
                      {offer.location}
                    </p>

                    {/* Price representation */}
                    <div className="mt-auto border-t border-slate-100 pt-3 pb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[#e31c25] font-serif font-black text-3xl shrink-0">
                          {offer.price}
                        </span>
                        <span className="line-through text-slate-400 font-light text-sm">
                          {offer.oldPrice}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 block mt-1 select-none">
                        {offer.nights}
                      </span>
                    </div>

                    {/* Gorgeous Red Button matches the image beautifully */}
                    <button
                      onClick={() => setSelectedOffer(offer)}
                      className="bg-[#e31c25] hover:bg-[#b8141b] active:scale-[0.98] text-white text-xs tracking-wider uppercase font-extrabold py-3.5 px-4 rounded-[1.2rem] flex items-center justify-center gap-2 transition-all duration-300 w-full shadow-lg shadow-red-500/15 cursor-pointer"
                    >
                      <span>Voir les détails</span>
                      <ChevronRight size={14} className="stroke-[3px]" />
                    </button>

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
