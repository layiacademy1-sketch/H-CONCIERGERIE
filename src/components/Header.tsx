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
    { name: "Accueil", href: "#" },
    { name: "Avantages", href: "#avantages" },
    { name: "À propos", href: "#propos" },
  ];

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
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.name}
              href={link.href}
              onClick={() => setView?.("home")}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`text-sm font-medium tracking-widest uppercase transition-colors duration-300 ${
                scrolled ? "text-slate-800 hover:text-gold" : "text-white/90 hover:text-gold"
              }`}
            >
              {link.name}
            </motion.a>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button 
          className={`md:hidden transition-colors duration-300 ${
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
          className="absolute top-full left-0 w-full bg-white border-t border-slate-100 py-8 px-6 md:hidden flex flex-col gap-6 shadow-2xl"
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => {
                setView?.("home");
                setIsOpen(false);
              }}
              className="text-lg font-serif tracking-wide text-slate-800 hover:text-gold transition-colors"
            >
              {link.name}
            </a>
          ))}
        </motion.div>
      )}
    </header>
  );
}
