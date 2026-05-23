import Header from "./components/Header";
import Hero from "./components/Hero";
import Advantages from "./components/Advantages";
import About from "./components/About";
import FinalCTA from "./components/FinalCTA";
import Preloader from "./components/Preloader";
import LuxuryHotelsPage from "./components/LuxuryHotelsPage";
import CarRentalPage from "./components/CarRentalPage";
import { motion, useScroll, useSpring, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"home" | "hotels" | "cars">("home");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-white selection:bg-gold selection:text-slate-900">
      <AnimatePresence>
        {isLoading && <Preloader />}
      </AnimatePresence>

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gold z-[60] origin-left"
        style={{ scaleX }}
      />

      <Header view={view} setView={setView} />
      
      <main className="overflow-x-hidden">
        <AnimatePresence mode="wait">
          {view === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Hero />
              <Advantages 
                onExploreHotels={() => {
                  setView("hotels");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} 
                onExploreCars={() => {
                  setView("cars");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
              <About />
              <FinalCTA />
            </motion.div>
          ) : view === "hotels" ? (
            <motion.div
              key="hotels"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <LuxuryHotelsPage onBack={() => {
                setView("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} />
            </motion.div>
          ) : (
            <motion.div
              key="cars"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <CarRentalPage onBack={() => {
                setView("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
