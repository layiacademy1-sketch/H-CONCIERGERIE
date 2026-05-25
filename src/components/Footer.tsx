import React from "react";

interface FooterProps {
  onOpenAdmin: () => void;
}

export default function Footer({ onOpenAdmin }: FooterProps) {
  return (
    <footer className="bg-slate-950 border-t border-white/5 py-12 text-slate-500">
      <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-xs font-serif font-light tracking-widest text-slate-600">
          © {new Date().getFullYear()} H-CONCIERGERIE. Tous droits réservés.
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={onOpenAdmin}
            className="text-[10px] font-bold tracking-[0.25em] text-slate-600 hover:text-gold transition-colors bg-transparent border-0 cursor-pointer"
          >
            ACCÈS ADMIN
          </button>
        </div>
      </div>
    </footer>
  );
}

