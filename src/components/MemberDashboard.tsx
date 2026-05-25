import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, Zap, Lock, LogOut, Ticket, Star, Calendar, 
  Clock, ShoppingBag, MapPin, ChevronRight, Share2, Sparkles, Award, PlayCircle
} from "lucide-react";

interface MemberDashboardProps {
  onLogout: () => void;
}

export default function MemberDashboard({ onLogout }: MemberDashboardProps) {
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
              <span className="text-sm font-black tracking-widest uppercase text-white">Espace Membre H-Conciergerie</span>
              <span className="bg-gold text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                Actif VIP
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Félicitations pour votre connexion. Profitez de vos privilèges exclusifs.</p>
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
                          -{offer.discount} CLUB
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {privateStoreItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full hover:border-[#D4AF37]/35 transition-all group"
                    >
                      <div className="relative aspect-square overflow-hidden bg-slate-950">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 bg-gold text-slate-950 text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase shadow">
                          {item.badge}
                        </div>
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded">
                          {item.discount}
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1 justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-extrabold uppercase block mb-1">
                            {item.category}
                          </span>
                          <h4 className="font-serif text-sm text-slate-200 leading-snug mb-3 font-semibold group-hover:text-gold transition-colors">
                            {item.name}
                          </h4>
                        </div>

                        <div>
                          <div className="flex justify-between items-baseline mb-3">
                            <span className="text-xs line-through text-slate-500">{item.oldPrice}</span>
                            <span className="text-lg font-black text-white">{item.price}</span>
                          </div>

                          <button
                            onClick={() => handleWhatsAppAction(`Bonjour, je suis membre et je souhaite acquérir l'article de la vente privée : ${item.name} au prix exclusif de ${item.price}`)}
                            className="w-full bg-white/5 hover:bg-gold hover:text-slate-950 text-slate-300 border border-white/10 hover:border-gold font-extrabold tracking-widest uppercase text-[10px] rounded-lg py-2 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            Acheter
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
                className="space-y-8"
              >
                {/* COUNTDOWN BOARD */}
                <div className="bg-gradient-to-r from-gold-dark/30 to-slate-900 border border-gold/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Clock size={150} />
                  </div>
                  
                  <div className="space-y-2 text-center md:text-left relative z-10">
                    <span className="text-[10px] font-black tracking-[0.2em] text-gold uppercase block">• PROCHAIN GALA VIP</span>
                    <h3 className="font-serif text-xl md:text-2xl text-white">Grande Nuit de Gala des Membres</h3>
                    <p className="text-xs text-slate-300 font-light max-w-md">Les invitations d'élite personnalisées par coursier physique sont prêtes à l'envoi.</p>
                  </div>

                  <div className="flex gap-4 relative z-10">
                    <div className="flex flex-col items-center">
                      <div className="bg-slate-950/80 backdrop-blur border border-gold/30 rounded-xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center font-serif text-xl md:text-2xl text-gold font-bold">
                        {String(countdown.days).padStart(2, '0')}
                      </div>
                      <span className="text-[8px] uppercase font-black text-slate-400 mt-1.5">Jours</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="bg-slate-950/80 backdrop-blur border border-gold/30 rounded-xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center font-serif text-xl md:text-2xl text-gold font-bold">
                        {String(countdown.hours).padStart(2, '0')}
                      </div>
                      <span className="text-[8px] uppercase font-black text-slate-400 mt-1.5">Heures</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="bg-slate-950/80 backdrop-blur border border-gold/30 rounded-xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center font-serif text-xl md:text-2xl text-gold font-bold">
                        {String(countdown.minutes).padStart(2, '0')}
                      </div>
                      <span className="text-[8px] uppercase font-black text-slate-400 mt-1.5">Min</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="bg-slate-950/80 backdrop-blur border border-gold/30 rounded-xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center font-serif text-xl md:text-2xl text-gold font-bold">
                        {String(countdown.seconds).padStart(2, '0')}
                      </div>
                      <span className="text-[8px] uppercase font-black text-slate-400 mt-1.5">Sec</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-serif text-white tracking-widest uppercase">Calendrier des Évènements</h2>
                    <p className="text-slate-400 text-xs font-light">Réservez vos places de prestige en avant-première.</p>
                  </div>

                  <div className="space-y-6">
                    {vipEvents.map((evt, idx) => (
                      <div 
                        key={idx} 
                        className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden flex flex-col md:flex-row gap-6 shadow-xl p-4 md:p-5 hover:border-gold/20 transition-all group"
                      >
                        <div className="md:w-48 shrink-0 h-32 md:h-auto rounded-xl overflow-hidden relative">
                          <img 
                            src={evt.image} 
                            alt={evt.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2 left-2 bg-slate-950/90 text-gold text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                            {evt.time}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs text-gold font-black uppercase tracking-widest">{evt.date}</span>
                              <span className="text-[9px] text-slate-400">•</span>
                              <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                <MapPin size={10} className="text-gold" /> {evt.location}
                              </span>
                            </div>
                            <h4 className="font-serif text-base font-semibold text-white mb-2 group-hover:text-gold transition-colors">
                              {evt.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                              {evt.desc}
                            </p>
                          </div>

                          <div className="pt-4 flex items-center justify-end">
                            <button
                              onClick={() => handleWhatsAppAction(`Bonjour H-CONCIERGERIE, je souhaite réserver ma place de VIP Membre pour l'évènement : ${evt.title} prévu le ${evt.date}`)}
                              className="bg-white text-slate-950 hover:bg-gold hover:text-slate-950 cursor-pointer text-[10px] font-extrabold tracking-widest uppercase px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                              Confirmer ma place <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
