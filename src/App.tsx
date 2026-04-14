import Header from "./components/Header";
import Hero from "./components/Hero";
import Advantages from "./components/Advantages";
import About from "./components/About";
import FinalCTA from "./components/FinalCTA";
import VideoCarousel from "./components/VideoCarousel";
import Preloader from "./components/Preloader";
import { motion, useScroll, useSpring, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
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
    <div className="relative min-h-screen bg-luxury-black selection:bg-gold selection:text-luxury-black">
      <AnimatePresence>
        {isLoading && <Preloader />}
      </AnimatePresence>

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gold z-[60] origin-left"
        style={{ scaleX }}
      />

      <Header />
      
      <main>
        <Hero />
        <Advantages />
        <VideoCarousel />
        <About />
        <FinalCTA />
      </main>
    </div>
  );
}
