import { motion } from "motion/react";
import { MessageCircle, PhoneCall } from "lucide-react";

export default function WhatsAppButton() {
  const handleWhatsAppClick = () => {
    const defaultMsg = "Bonjour H-CONCIERGERIE, je souhaite obtenir des informations complémentaires.";
    window.open(`https://wa.me/33756832263?text=${encodeURIComponent(defaultMsg)}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Pulse rings for luxury aura */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md scale-125 animate-ping opacity-75" />
      <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-lg scale-150 animate-pulse" />

      <motion.button
        onClick={handleWhatsAppClick}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="relative bg-emerald-500 hover:bg-emerald-400 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-3xl cursor-pointer border border-emerald-400/40 group overflow-hidden"
        title="Contacter la conciergerie"
      >
        <span className="absolute inset-0 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* Modern phone or message icon */}
        <MessageCircle size={30} className="relative z-10 fill-white" />
      </motion.button>
    </div>
  );
}
