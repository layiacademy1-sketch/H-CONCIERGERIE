import { motion } from "motion/react";
import { Menu, X, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header({ 
  view, 
  setView,
  onOpenLogin,
  onOpenAdmin,
  isLoggedIn,
  onLogout
}: { 
  view?: string; 
  setView?: (view: string) => void;
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}) {
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
    { name: "Accès Admin", href: "#", action: "admin" },
  ];

  const handleLinkClick = (link: { name: string; href: string; action: string }) => {
    setIsOpen(false);
    if (link.action === "admin") {
      onOpenAdmin();
      return;
    }
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
        scrolled ? "bg-slate-950/90 backdrop-blur-lg py-4 border-b border-white/5 shadow-md" : "bg-transparent py-5"
      }`}
    >

      <div className="container mx-auto px-6 flex justify-between items-center relative gap-4">
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
            className="text-sm md:text-base font-serif font-bold tracking-[0.25em] text-gold-gradient cursor-pointer select-none whitespace-nowrap"
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
                  : "text-white/90 hover:text-gold"
              }`}
            >
              {link.name}
            </motion.button>
          ))}

          {/* PRIVILEGED PREMIUM MEMBERSHIP BUTTONS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 border-l border-slate-200/25 pl-6"
          >
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView?.("espace-membre")}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                    view === "espace-membre"
                      ? "bg-gold text-slate-950 font-black shadow-lg"
                      : "bg-slate-900 text-white hover:bg-gold hover:text-slate-900 border border-gold/40"
                  }`}
                >
                  🪐 Mon Espace Membre
                </button>
                <button 
                  onClick={onLogout}
                  className="text-slate-400 hover:text-red-500 text-[10px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Quitter
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="bg-slate-950 text-[#D4AF37] border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-slate-950 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                Accès Membre
              </button>
            )}
          </motion.div>
        </nav>

        {/* Mobile Control and Toggle */}
        <div className="flex items-center gap-4 xl:hidden">
          {!isLoggedIn ? (
            <button
              onClick={onOpenLogin}
              className="bg-slate-950 text-[#D4AF37] border border-[#D4AF37] px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest cursor-pointer"
            >
              Accès Membre
            </button>
          ) : (
            <button
              onClick={() => { setView?.("espace-membre"); setIsOpen(false); }}
              className="bg-gold text-slate-950 px-3 py-2 rounded-full text-[9px] font-black uppercase tracking-widest cursor-pointer"
            >
              🪐 Espace
            </button>
          )}

          <button 
            className="text-white transition-colors duration-300" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-lg border-t border-white/10 py-8 px-6 xl:hidden flex flex-col gap-6 shadow-2xl"
        >
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleLinkClick(link)}
              className={`text-lg font-serif tracking-wide text-left transition-colors cursor-pointer py-1 ${
                view === link.action && link.href === "#" ? "text-gold font-bold" : "text-slate-200 hover:text-gold"
              }`}
            >
              {link.name}
            </button>
          ))}

          {isLoggedIn && (
            <button
              onClick={() => {
                setView?.("espace-membre");
                setIsOpen(false);
              }}
              className="text-lg font-serif tracking-wide text-left text-[#D4AF37] font-semibold cursor-pointer py-1 border-t border-white/10 pt-4"
            >
              🪐 Mon Espace Membre (Actif)
            </button>
          )}
        </motion.div>
      )}
    </header>
  );
}
