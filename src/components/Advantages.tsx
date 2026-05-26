import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Hotel, Car, Plane, ShoppingBag, X, Sparkles } from "lucide-react";

const advantages = [
  {
    icon: <Hotel className="text-gold" size={32} />,
    title: "Réservation d’hôtel",
    description: "Accédez à une sélection exclusive d'hôtels 5 étoiles avec des réductions allant jusqu'à -70%.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"
  },
  {
    icon: <Car className="text-gold" size={32} />,
    title: "Location de voiture",
    description: "Profitez de tarifs préférentiels sur les véhicules de prestige et les locations standards jusqu'à -40%.",
    image: "https://image.noelshack.com/fichiers/2026/22/1/1779734804-chatgpt-image-25-mai-2026-20-46-02.jpg"
  },
  {
    icon: <Plane className="text-gold" size={32} />,
    title: "Vols Privilèges",
    description: "Des tarifs négociés sur les compagnies aériennes majeures et services de jets privés.",
    image: "https://image.noelshack.com/fichiers/2026/16/2/1776186682-photo-1436491865332-7a61a109cc05.jpg"
  },
  {
    icon: <ShoppingBag className="text-gold" size={32} />,
    title: "Ventes Privées",
    description: "Des invitations exclusives pour des ventes privées de marques de luxe et d'expériences uniques.",
    image: "https://image.noelshack.com/fichiers/2026/16/2/1776185849-generated-image-april-14-2026-6-57pm.jpg"
  }
];

export default function Advantages({ onExploreHotels, onExploreCars }: { onExploreHotels?: () => void; onExploreCars?: () => void }) {
  const [comingSoonType, setComingSoonType] = useState<"vols" | "ventes" | null>(null);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (comingSoonType) {
      const timer = setTimeout(() => {
        setComingSoonType(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [comingSoonType]);

  const triggerComingSoon = (type: "vols" | "ventes") => {
    setComingSoonType(type);
  };

  return (
    <section id="avantages" className="py-24 bg-slate-50/70 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold tracking-[0.3em] uppercase text-xs font-bold mb-4 block"
          >
            Vos Privilèges
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif mb-6 text-slate-900"
          >
            L'Excellence dans chaque détail
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 font-light leading-relaxed"
          >
            H-CONCIERGERIE redéfinit les standards du service haut de gamme. En tant que membre, vous bénéficiez d'un accès privilégié à un réseau mondial de partenaires d'exception.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((adv, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group bg-white border border-slate-100/80 rounded-3xl overflow-hidden flex flex-col h-full shadow-[0_15px_45px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:border-gold/30 transition-all duration-300"
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={adv.image}
                  alt={adv.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors" />
                <div className="absolute top-6 left-6 p-3 bg-slate-950/70 backdrop-blur-md rounded-xl">
                  {adv.icon}
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <h3 className="text-2xl font-serif mb-4 text-slate-800 group-hover:text-gold transition-colors">
                  {adv.title}
                </h3>
                <p className="text-slate-600 font-light leading-relaxed mb-6">
                  {adv.description}
                </p>
                 <div className="mt-auto">
                  {adv.title === "Réservation d’hôtel" && onExploreHotels ? (
                    <button 
                      onClick={onExploreHotels}
                      className="inline-flex items-center justify-center px-6 py-3 bg-gold text-slate-950 text-xs tracking-widest uppercase font-bold rounded-full hover:bg-slate-900 hover:text-white transition-all duration-300 cursor-pointer w-full text-center"
                    >
                      En savoir plus
                    </button>
                  ) : adv.title === "Location de voiture" && onExploreCars ? (
                    <button 
                      onClick={onExploreCars}
                      className="inline-flex items-center justify-center px-6 py-3 bg-gold text-slate-950 text-xs tracking-widest uppercase font-bold rounded-full hover:bg-slate-900 hover:text-white transition-all duration-300 cursor-pointer w-full text-center"
                    >
                      En savoir plus
                    </button>
                  ) : adv.title === "Vols Privilèges" ? (
                    <button 
                      onClick={() => triggerComingSoon("vols")}
                      className="inline-flex items-center justify-center px-6 py-3 bg-gold text-slate-950 text-xs tracking-widest uppercase font-bold rounded-full hover:bg-slate-900 hover:text-white transition-all duration-300 cursor-pointer w-full text-center"
                    >
                      En savoir plus
                    </button>
                  ) : (
                    <button 
                      onClick={() => triggerComingSoon("ventes")}
                      className="inline-flex items-center justify-center px-6 py-3 bg-gold text-slate-950 text-xs tracking-widest uppercase font-bold rounded-full hover:bg-slate-900 hover:text-white transition-all duration-300 cursor-pointer w-full text-center"
                    >
                      En savoir plus
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Premium Toast Notification */}
      <AnimatePresence>
        {comingSoonType && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-md bg-slate-950/98 backdrop-blur-md border border-gold/40 shadow-2xl rounded-2xl p-5 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gold/10 rounded-xl text-gold shrink-0">
                <Sparkles size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-serif text-lg text-white mb-1">
                  {comingSoonType === "vols" ? "Vols Privilèges" : "Ventes Privées"}
                </h4>
                <p className="text-slate-300 text-xs font-light leading-relaxed">
                  Notre espace de {comingSoonType === "vols" ? "réservation de Vols Privilèges" : "ventes privées"} sera <span className="text-gold font-medium">Bientôt Disponible</span>.
                </p>
              </div>
              <button
                onClick={() => setComingSoonType(null)}
                className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400">
              <span>H-CONCIERGERIE</span>
              <span className="text-gold">Service d'excellence</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
