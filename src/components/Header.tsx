import { motion } from "motion/react";
import { Menu, X, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header({ view, setView }: { view?: string; setView?: (view: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Accueil", href: "#", action: "home" },
    { name: "Hôtels de luxe", href: "#", action: "hotels" },
    { name: "Location de voiture", href: "#", action: "cars" },
    { name: "Avantages", href: "#avantages", action: "home" },
    { name: "À propos", href: "#propos", action: "home" },
  ];

  const handleLinkClick = (link: { name: string; href: string; action: string }) => {
    setIsOpen(false);
    if (setView) {
      setView(link.action);
      if (link.action !== "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (link.href !== "#") {
        setTimeout(() => {
          const element = document.querySelector(link.href);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? "bg-white/95 backdrop-blur-lg py-4 border-b border-slate-100 shadow-md" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <span 
            onClick={() => {
              setView?.("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-2xl font-serif font-bold tracking-widest text-gold-gradient cursor-pointer select-none"
          >
            H-CONCIERGERIE
          </span>
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <motion.button
              key={link.name}
              onClick={() => handleLinkClick(link)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`text-xs font-bold tracking-widest uppercase transition-colors duration-300 cursor-pointer ${
                view === link.action && link.href === "#"
                  ? "text-gold"
                  : scrolled 
                    ? "text-slate-800 hover:text-gold" 
                    : "text-white/90 hover:text-gold"
              }`}
            >
              {link.name}
            </motion.button>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button 
          className={`xl:hidden transition-colors duration-300 ${
            scrolled ? "text-slate-800" : "text-white"
          }`} 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-white border-t border-slate-100 py-8 px-6 xl:hidden flex flex-col gap-6 shadow-2xl"
        >
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleLinkClick(link)}
              className={`text-lg font-serif tracking-wide text-left transition-colors cursor-pointer py-1 ${
                view === link.action && link.href === "#" ? "text-gold font-bold" : "text-slate-800 hover:text-gold"
              }`}
            >
              {link.name}
            </button>
          ))}
        </motion.div>
      )}
    </header>
  );
}
