import { motion } from "motion/react";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function About() {
  return (
    <section id="propos" className="py-24 bg-luxury-black overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000"
                alt="Luxury Lifestyle"
                className="w-full h-full object-cover aspect-[4/5]"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -left-10 w-40 h-40 border-t-2 border-l-2 border-gold/30 rounded-tl-3xl -z-0" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-0" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-8 -left-8 glass-card p-8 rounded-2xl z-20 hidden md:block"
            >
              <p className="text-4xl font-serif text-gold mb-1">10k+</p>
              <p className="text-xs uppercase tracking-widest text-white/60">Membres Privilégiés</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2"
          >
            <span className="text-gold tracking-[0.3em] uppercase text-xs font-bold mb-4 block">
              Pourquoi nous choisir
            </span>
            <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">
              L'Art de vivre sans <br />
              <span className="italic text-gold-gradient">aucune concession</span>
            </h2>
            <p className="text-white/70 font-light leading-relaxed mb-8 text-lg">
              H-CONCIERGERIE n'est pas seulement un service, c'est un passeport pour un monde d'exception. Nous avons négocié pour vous les conditions les plus avantageuses auprès des acteurs majeurs du luxe mondial.
            </p>
            
            <div className="space-y-6">
              {[
                "Accès prioritaire aux établissements les plus prisés",
                "Économies substantielles sur vos budgets voyages",
                "Accompagnement personnalisé par des experts",
                "Confidentialité et discrétion absolue"
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <CheckCircle2 className="text-gold" size={24} />
                  <span className="text-white/80 font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-12 flex flex-col items-center"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="mb-4"
            >
              <ChevronRight className="text-gold rotate-90" size={32} />
            </motion.div>
            <a 
              href="https://snapchat.com/t/oOvhoJ45"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-10 py-5 bg-gold text-luxury-black text-sm tracking-widest uppercase font-bold rounded-full hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.4)] group scale-110"
            >
              Nous suivre sur Snapchat
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-white/30 text-[10px] uppercase tracking-widest text-center"
          >
            © 2026 H-CONCIERGERIE. Tous droits réservés.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
