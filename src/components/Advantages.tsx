import { motion } from "motion/react";
import { Hotel, Car, Plane, ShoppingBag, Headphones } from "lucide-react";

const advantages = [
  {
    icon: <Hotel className="text-gold" size={32} />,
    title: "Hôtels de luxe",
    description: "Accédez à une sélection exclusive d'hôtels 5 étoiles avec des réductions allant jusqu'à -70%.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"
  },
  {
    icon: <Car className="text-gold" size={32} />,
    title: "Location de voiture",
    description: "Profitez de tarifs préférentiels sur les véhicules de prestige et les locations standards jusqu'à -40%.",
    image: "https://image.noelshack.com/fichiers/2026/16/2/1776185538-europcar-bretagne-saint-brieuc-location-voiture-camion-au-meilleur-prix-cd7bd3f0fe46262c4a06e0c1ed028e73.jpg"
  },
  {
    icon: <Plane className="text-gold" size={32} />,
    title: "Vols Privilèges",
    description: "Des tarifs négociés sur les compagnies aériennes majeures et services de jets privés.",
    image: "https://image.noelshack.com/fichiers/2026/16/2/1776185603-avion-800-1.png"
  },
  {
    icon: <ShoppingBag className="text-gold" size={32} />,
    title: "Ventes Privées",
    description: "Des invitations exclusives pour des ventes privées de marques de luxe et d'expériences uniques.",
    image: "https://image.noelshack.com/fichiers/2026/16/2/1776185849-generated-image-april-14-2026-6-57pm.jpg"
  }
];

export default function Advantages() {
  return (
    <section id="avantages" className="py-24 bg-luxury-gray relative overflow-hidden">
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
            className="text-4xl md:text-5xl font-serif mb-6"
          >
            L'Excellence dans chaque détail
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 font-light leading-relaxed"
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
              className="group glass-card rounded-3xl overflow-hidden flex flex-col h-full"
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={adv.image}
                  alt={adv.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-luxury-black/40 group-hover:bg-luxury-black/20 transition-colors" />
                <div className="absolute top-6 left-6 p-3 bg-luxury-black/60 backdrop-blur-md rounded-xl">
                  {adv.icon}
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <h3 className="text-2xl font-serif mb-4 group-hover:text-gold transition-colors">
                  {adv.title}
                </h3>
                <p className="text-white/60 font-light leading-relaxed mb-6">
                  {adv.description}
                </p>
                <div className="mt-auto">
                  <a 
                    href="https://wa.me/33774067388"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gold text-luxury-black text-xs tracking-widest uppercase font-bold rounded-full hover:bg-white transition-all duration-300 group/btn"
                  >
                    En savoir plus
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
