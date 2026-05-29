import { motion, useScroll, useTransform } from "motion/react";
import { Star, ChevronDown } from "lucide-react";

export default function Hero({ onDevenirMembre }: { onDevenirMembre: () => void }) {
  const { scrollY } = useScroll();
  
  // Arrow animation based on scroll
  const arrowScale = useTransform(scrollY, [0, 300], [1, 2.5]);
  const arrowOpacity = useTransform(scrollY, [0, 300, 400], [1, 1, 0]);
  const arrowY = useTransform(scrollY, [0, 400], [0, 100]);

  return (
    <section className="relative min-h-screen flex flex-col items-center pt-36 sm:pt-32 pb-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://image.noelshack.com/fichiers/2026/16/2/1776183750-meilleur-hotel.jpg"
          alt="Luxury Hotel"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-luxury-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-luxury-black/40" />
      </div>


      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Excellence + Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-4 mb-4"
          >
            <div className="flex items-center gap-3 sm:gap-4 max-w-full">
              <div className="h-px w-6 sm:w-8 bg-gold shrink-0" />
              <span className="text-gold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[10px] sm:text-xs font-bold font-sans text-center">
                L'Excellence à votre service
              </span>
              <div className="h-px w-6 sm:w-8 bg-gold shrink-0" />
            </div>
            <motion.img 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              src="https://image.noelshack.com/fichiers/2026/16/2/1776179004-taxi-12.png" 
              alt="Logo" 
              className="h-28 sm:h-40 md:h-48 lg:h-64 w-auto object-contain drop-shadow-[0_0_25px_rgba(212,175,55,0.6)]"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* DEVENIR MEMBRE PREMIUM BUTTON */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-14"
          >
            <button 
              onClick={onDevenirMembre}
              className="px-8 py-4 bg-slate-950/80 backdrop-blur-md border border-gold hover:border-white text-gold hover:text-white rounded-xl text-xs font-black tracking-[0.3em] uppercase cursor-pointer transition-all duration-300 hover:scale-[1.05] shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] active:scale-95"
            >
              Devenir Membre
            </button>
          </motion.div>

          {/* Horizontal Text + Scroll Arrow */}
          <div className="relative flex flex-col items-center">
            <motion.div
              style={{ scale: arrowScale, opacity: arrowOpacity, y: arrowY }}
              className="mt-12 flex flex-col items-center gap-4"
            >
              <span className="text-gold font-serif text-[10px] md:text-xs tracking-[0.5em] uppercase opacity-40 select-none">
                H CONCIERGERIE
              </span>
              <ChevronDown className="text-gold w-10 h-10 drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Element */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-10 bottom-20 hidden lg:block"
      >
        <div className="glass-card p-6 rounded-2xl max-w-[240px]">
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="fill-gold text-gold" />
            ))}
          </div>
          <p className="text-sm italic mb-2">"Un service irréprochable qui a transformé ma vision du voyage de luxe."</p>
          <p className="text-[10px] uppercase tracking-widest text-gold font-bold">— Jean-Marc D.</p>
        </div>
      </motion.div>
    </section>
  );
}
