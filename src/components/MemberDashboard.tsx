import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, Zap, Lock, LogOut, Ticket, Star, Calendar, 
  Clock, ShoppingBag, MapPin, ChevronRight, Share2, Sparkles, Award, PlayCircle
} from "lucide-react";

interface MemberDashboardProps {
  onLogout: () => void;
  memberData?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    ville: string;
    pseudo?: string;
    abonnement: string;
    acces_membre: boolean;
    paiement: string;
    date_inscription: string;
  } | null;
}

export default function MemberDashboard({ onLogout, memberData }: MemberDashboardProps) {
  const [activeTab, setActiveTab] = useState<"flash" | "ventes" | "events">("flash");
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Calculate countdown to the next event (e.g. 15 November 2026)
  useEffect(() => {
    const targetDate = new Date("November 15, 2026 20:00:00").getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference < 0) {
        clearInterval(interval);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // WhatsApp helper
  const handleWhatsAppAction = (msg: string) => {
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/33756832263?text=${encoded}`, "_blank");
  };

  // Offres Flash dataset
  const flashOffers = [
    {
      id: 6,
      name: "Fairmont Tokyo 5★",
      category: "PROMOTION HÔTEL",
      desc: "Un havre de paix contemporain alliant l'élégance de la marque Fairmont au raffinement japonais, offrant des vues imprenables sur Tokyo.",
      oldPrice: "4792 €",
      newPrice: "1818 €",
      image: "https://image.noelshack.com/fichiers/2026/22/1/1779706653-b6r8-ro-02-p-2048x1536.jpg",
      nights: "7 jours | 2 adultes",
      discount: "-62%",
    },
    {
      id: 7,
      name: "Pullman Dakar Teranga 5★",
      category: "PROMOTION HÔTEL",
      desc: "Une oasis contemporaine d'exception surplombant l'océan Atlantique, au cœur de la capitale sénégalaise.",
      oldPrice: "1654 €",
      newPrice: "547 €",
      image: "https://image.noelshack.com/fichiers/2026/22/1/1779707711-0563-ho-03-p-2048x1536.jpg",
      nights: "7 jours | 2 adultes",
      discount: "-67%",
    },
    {
      id: 8,
      name: "Fairmont Mara Safari Club Kenya 5★",
      category: "PROMOTION VOYAGE",
      desc: "Une expérience de safari de luxe incomparable sous des tentes majestueuses, nichée au cœur de la réserve nationale du Masai Mara.",
      oldPrice: "9677 €",
      newPrice: "2412 €",
      image: "https://image.noelshack.com/fichiers/2026/22/1/1779707999-a5f3-ho-03-p-2048x1536.jpg",
      nights: "7 jours | 2 adultes",
      discount: "-75%",
    },
    {
      id: 9,
      name: "Raffles Doha 5★",
      category: "PROMOTION HÔTEL",
      desc: "Une merveille d'architecture ultra-luxe au design d'un palais moderne, nichée au cœur des sublimes Katara Towers.",
      oldPrice: "2558 €",
      newPrice: "1305 €",
      image: "https://image.noelshack.com/fichiers/2026/22/1/1779710301-b662-ho-00-p-2048x1536.jpg",
      nights: "7 nuits | 2 adultes",
      discount: "-49%",
    },
    {
      id: 10,
      name: "Dhawa Ihuru Maldives 5★",
      category: "PROMOTION VOYAGE",
      desc: "Un atoll paradisiaque d'une beauté préservée, offrant l'une des plus belles barrières de corail des Maldives.",
      oldPrice: "4813 €",
      newPrice: "1490 €",
      image: "https://image.noelshack.com/fichiers/2026/22/1/1779710626-b1w1-ho-00-p-2048x1536.jpg",
      nights: "7 nuits | 2 adultes",
      discount: "-69%",
    },
    {
      id: 11,
      name: "Banyan Tree Vabbinfaru Maldives 5★",
      category: "PROMOTION VOYAGE",
      desc: "Un havre de paix tropical et intimiste d'une beauté naturelle exceptionnelle aux Maldives.",
      oldPrice: "5582 €",
      newPrice: "1826 €",
      image: "https://image.noelshack.com/fichiers/2026/22/1/1779711339-b1w0-ho-05-p-2048x1536.jpg",
      nights: "7 nuits | 2 adultes",
      discount: "-67%",
    },
    {
      id: 12,
      name: "Sofitel Marrakech Palais Impérial & Spa 5★",
      category: "PROMOTION HÔTEL",
      desc: "Un espace de calme et de volupté au milieu d'un somptueux jardin face aux montagnes de l'Atlas.",
      oldPrice: "1886 €",
      newPrice: "953 €",
      image: "https://image.noelshack.com/fichiers/2026/22/1/1779711916-3569-ho-00-p-2048x1536.jpg",
      nights: "7 nuits | 2 adultes",
      discount: "-49%",
    },
    {
      id: 13,
      name: "Fairmont Rio de Janeiro Copacabana 5★",
      category: "PROMOTION HÔTEL",
      desc: "Une icône de prestige offrant une vue panoramique imprenable sur la célèbre plage de Copacabana.",
      oldPrice: "2660 €",
      newPrice: "1463 €",
      image: "https://image.noelshack.com/fichiers/2026/22/1/1779717319-1988-ho-00-p-2048x1536.jpg",
      nights: "7 nuits | 2 adultes",
      discount: "-45%",
    }
  ];

  // Ventes privées dataset
  const privateStoreItems = [
    {
      id: 101,
      name: "Bottines Chelsea en Cuir Italien Botticelli",
      category: "Promotions chaussures",
      price: "420 €",
      oldPrice: "750 €",
      discount: "-44%",
      badge: "Membre VIP",
      image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 104,
      name: "Sneakers Artisanal Limited Gold-Edition",
      category: "Promotions sneakers",
      price: "490 €",
      oldPrice: "900 €",
      discount: "-45%",
      badge: "Membre VIP",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"
    }
  ];

  // VIP Events dataset
  const vipEvents = [
    {
      title: "La Grande Nuit des Membres — Soirée de Gala",
      date: "15 Novembre 2026",
      location: "Château de Chantilly, France",
      desc: "Notre grand rendez-vous annuel.",
      image: "https://image.noelshack.com/fichiers/2026/22/1/1779741956-chatgpt-image-25-mai-2026-22-45-48.jpg",
      time: "20:00 - 03:00"
    },
    {
      title: "Lancement de la marque : MH.VISION",
      date: "15 juin 2026 à paris.",
      location: "Paris, France",
      desc: "DE 10h00 à 17h00 Découvrez les paires de lunettes de marque MH.VISION.",
      image: "https://image.noelshack.com/fichiers/2026/22/1/1779742821-chatgpt-image-25-mai-2026-23-00-16.jpg",
      time: "10:00 - 17:00"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-gold selection:text-slate-950 pt-28 flex flex-col">
      
      {/* HEADER BANNER FOR MEMBER STATUS */}
      <div className="bg-gradient-to-r from-[#B8860B]/20 via-slate-900 to-slate-950 border-b border-gold/10 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold animate-pulse">
            <Award size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-widest uppercase text-white">
                {memberData?.pseudo ? `Bienvenue @${memberData.pseudo}` : memberData ? `Espace Membre : ${memberData.prenom} ${memberData.nom}` : "Espace Membre"}
              </span>
              {memberData && !memberData.acces_membre ? (
                <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                  Attente Activation
                </span>
              ) : (
                <span className="bg-gold text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                  Actif VIP
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {memberData && !memberData.acces_membre 
                ? "Votre adhésion est en cours d'activation. Veuillez finaliser votre cotisation." 
                : "Félicitations pour votre connexion. Profitez de vos privilèges exclusifs."}
            </p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-[#D4AF37] hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl transition-all cursor-pointer"
        >
          <LogOut size={13} /> Se Déconnecter
        </button>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* SIDE BAR LAYOUT FOR MOBILE & DESKTOP */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <div className="bg-slate-900/80 border border-white/5 p-6 rounded-3xl">
            <h3 className="text-white text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Navigation Privée</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab("flash")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-left cursor-pointer ${activeTab === "flash" ? "bg-gold text-slate-950 shadow-lg font-black" : "text-slate-300 hover:bg-white/5"}`}
              >
                <Zap size={14} /> Offres Flash
              </button>

              <button
                onClick={() => setActiveTab("ventes")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-left cursor-pointer ${activeTab === "ventes" ? "bg-gold text-slate-950 shadow-lg font-black" : "text-slate-300 hover:bg-white/5"}`}
              >
                <ShoppingBag size={14} /> Vente Privée
              </button>

              <button
                onClick={() => setActiveTab("events")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-left cursor-pointer ${activeTab === "events" ? "bg-gold text-slate-950 shadow-lg font-black" : "text-slate-300 hover:bg-white/5"}`}
              >
                <Calendar size={14} /> Évènements VIP
              </button>
            </div>
          </div>


        </div>

        {/* CONTAINER WORKSPACE FOR SELECTED MENU WITH ANIME-PRESENCE */}
        <div className="lg:col-span-9">
          {memberData && !memberData.acces_membre ? (
            <div className="bg-slate-900/90 border border-gold/30 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-2xl relative overflow-hidden py-16">
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-transparent pointer-events-none" />
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/20 mx-auto animate-bounce">
                <Lock size={30} />
              </div>
              
              <h3 className="font-serif text-2xl md:text-3xl text-white tracking-wide">
                {memberData?.pseudo ? `Bienvenue @${memberData.pseudo}` : "Activez votre accès membre"}
              </h3>
              
              <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed max-w-md mx-auto">
                Votre compte membre est créé avec succès. Activez votre abonnement annuel pour accéder aux offres privées.
              </p>
              
              <div className="pt-4">
                <a 
                  href="https://buy.stripe.com/bJe5kD6htcmW5fR9GT7ss01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-gold hover:bg-gold-light text-[#0A0D14] font-black tracking-widest uppercase text-xs rounded-xl px-8 py-4 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  Payer l’accès membre 1 an — 365€
                </a>
              </div>
              
              <p className="text-[10px] text-slate-500 font-medium">
                Paiement ultra-sécurisé via Stripe. Activation instantanée de vos privilèges de conciergerie.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
            
            {/* TABS: OFFRES FLASH */}
            {activeTab === "flash" && (
              <motion.div
                key="flash"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-serif text-white tracking-widest uppercase">Offres Flash Membres</h2>
                  <p className="text-slate-400 text-xs font-light">Mises à jour quotidiennes de nos meilleures réductions négociées à l'international.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {flashOffers.map((offer) => (
                    <div 
                      key={offer.id} 
                      className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full group hover:border-gold/30 transition-all"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={offer.image} 
                          alt={offer.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 left-4 bg-[#e31c25] text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase shadow-lg">
                          {offer.discount} CLUB
                        </div>
                        <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] text-slate-300 font-bold uppercase">
                          {offer.nights}
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1 justify-between">
                        <div>
                          <span className="text-[10px] font-black tracking-wider text-gold mb-1 block uppercase">
                            {offer.category}
                          </span>
                          <h4 className="font-serif text-xl text-white mb-2 group-hover:text-gold transition-colors">
                            {offer.name}
                          </h4>
                          <p className="text-xs text-slate-400 font-light leading-relaxed mb-4">
                            {offer.desc}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-3 mb-4">
                            <span className="text-xs line-through text-slate-500 font-medium">
                              {offer.oldPrice}
                            </span>
                            <span className="text-2xl font-black text-gold">
                              {offer.newPrice}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded ml-auto">
                              Prix Membre
                            </span>
                          </div>

                          <button
                            onClick={() => handleWhatsAppAction(`Bonjour, je suis membre et je souhaite profiter de cette offre : ${offer.name} (${offer.newPrice})`)}
                            className="w-full bg-gold hover:bg-gold-light text-slate-950 font-black tracking-widest uppercase text-xs rounded-xl py-3 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01]"
                          >
                            Profiter de l'offre
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TABS: VENTE PRIVÉE */}
            {activeTab === "ventes" && (
              <motion.div
                key="ventes"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-serif text-white tracking-widest uppercase">Boutique & Vente Privée</h2>
                  <p className="text-slate-400 text-xs font-light">Le catalogue Haute Couture et High-Tech premium réservé de façon intemporelle pour nos adhérents.</p>
                </div>

                <div className="flex flex-col items-center justify-center border border-gold/20 bg-slate-900/60 rounded-3xl p-12 text-center space-y-4 max-w-2xl mx-auto py-16 shadow-2xl">
                  <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/30">
                    <ShoppingBag size={28} />
                  </div>
                  <h3 className="font-serif text-3xl text-white tracking-wide">Bientôt disponible</h3>
                  <p className="text-slate-400 text-xs font-light max-w-md leading-relaxed">
                    Notre équipe prépare minutieusement une sélection exclusive d’articles aux meilleurs prix négociés pour nos membres.
                  </p>
                  <div className="pt-2 text-[10px] text-gold uppercase tracking-widest font-bold bg-gold/15 border border-gold/20 px-4 py-1.5 rounded-full">
                    Exclusivité H-Conciergerie
                  </div>
                </div>
              </motion.div>
            )}

            {/* TABS: ÉVÈNEMENTS VIP */}
            {activeTab === "events" && (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-serif text-white tracking-widest uppercase">Évènements VIP</h2>
                  <p className="text-slate-400 text-xs font-light">Réservez vos places de prestige en avant-première mondiale.</p>
                </div>

                <div className="flex flex-col items-center justify-center border border-gold/20 bg-slate-900/60 rounded-3xl p-12 text-center space-y-4 max-w-2xl mx-auto py-16 shadow-2xl">
                  <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/30">
                    <Calendar size={28} />
                  </div>
                  <h3 className="font-serif text-3xl text-white tracking-wide">Bientôt disponible</h3>
                  <div className="pt-2 text-[10px] text-gold uppercase tracking-widest font-bold bg-gold/15 border border-gold/20 px-4 py-1.5 rounded-full">
                    Réservé aux Membres
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}
