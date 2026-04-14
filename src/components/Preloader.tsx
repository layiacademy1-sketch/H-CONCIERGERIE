import { motion } from "motion/react";
import { useState, useEffect } from "react";

export default function Preloader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-luxury-black flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <img
          src="https://image.noelshack.com/fichiers/2026/16/2/1776179004-taxi-12.png"
          alt="Logo"
          className="h-32 md:h-48 w-auto object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden relative">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gold"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear" }}
        />
      </div>

      <motion.span
        className="mt-4 text-gold font-serif text-2xl tracking-widest"
      >
        {progress}%
      </motion.span>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-white/40 text-[10px] uppercase tracking-[0.3em]"
      >
        L'Excellence se prépare...
      </motion.p>
    </motion.div>
  );
}
