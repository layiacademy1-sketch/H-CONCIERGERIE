import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

const videos = [
  {
    id: "URi91i7mY6s",
    name: "Alexis",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "dhn2VjPKG0k",
    name: "Julien",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "Ci9qsFuKIfs",
    name: "Carla",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  },
];

export default function VideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextVideo = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const video = videos[currentIndex];

  return (
    <div className="w-full mt-12 flex flex-col items-center gap-8 py-10">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-gold tracking-[0.3em] uppercase text-xs font-bold mb-4 block"
        >
          Témoignages
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-serif mb-6"
        >
          Ils nous font confiance
        </motion.h2>
      </div>

      <div className="relative flex items-center justify-center w-full max-w-4xl">
        {/* Navigation Buttons */}
        <button
          onClick={prevVideo}
          className="absolute left-0 z-20 p-4 bg-luxury-black/50 backdrop-blur-md border border-gold/30 rounded-full text-gold hover:bg-gold hover:text-luxury-black transition-all duration-300 shadow-xl"
        >
          <ChevronLeft size={32} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-[300px] md:w-[360px] glass-card rounded-[2.5rem] border-2 border-gold p-5 flex flex-col gap-5 shadow-2xl shadow-gold/20"
          >
            {/* Vertical Video Player with Cropping and Overlay */}
            <div className="relative pt-[177.77%] rounded-3xl overflow-hidden bg-black group/video shadow-inner">
              {/* Iframe scaled and shifted to hide top/bottom branding - Mute removed for sound */}
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&loop=1&playlist=${video.id}`}
                className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] border-0 pointer-events-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover/video:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={nextVideo}
          className="absolute right-0 z-20 p-4 bg-luxury-black/50 backdrop-blur-md border border-gold/30 rounded-full text-gold hover:bg-gold hover:text-luxury-black transition-all duration-300 shadow-xl"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Mobile Navigation Dots */}
      <div className="flex gap-3">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all duration-500 ${
              currentIndex === i ? "w-8 bg-gold" : "w-2 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
