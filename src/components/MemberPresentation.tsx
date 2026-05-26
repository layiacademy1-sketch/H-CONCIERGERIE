import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  CheckCircle, ArrowLeft, Star, Heart, Award, 
  MapPin, Notebook as Journal, ShieldCheck, Mail, Send, Sparkles, Zap, Lock, Compass, Calendar, Phone, CreditCard
} from "lucide-react";
import SignUpForm from "./SignUpForm";

interface MemberPresentationProps {
  onBack: () => void;
  onSubmitMember: (member: { name: string; city: string; job: string; phone?: string; email?: string }) => void;
  onSignUpSubmit: (formData: any) => Promise<void>;
  isLoading: boolean;
  signUpError: string;
}

export default function MemberPresentation({ 
  onBack, 
  onSubmitMember, 
  onSignUpSubmit, 
  isLoading, 
  signUpError 
}: MemberPresentationProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [job, setJob] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || !job.trim() || !phone.trim() || !email.trim()) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    // Call callback to store member locally
    onSubmitMember({ 
      name: name.trim(), 
      city: city.trim(), 
      job: job.trim(),
      phone: phone.trim(),
      email: email.trim()
    });

    // Format WhatsApp message
    const formattedMsg = `Bonjour, je souhaite devenir membre.
    
👤 Nom Complet : ${name.trim()}
📞 Téléphone : ${phone.trim()}
✉️ Email : ${email.trim()}
📍 Ville : ${city.trim()}
💼 Métier / Secteur d'activité : ${job.trim()}`;

    const encodedMsg = encodeURIComponent(formattedMsg);
    const whatsappUrl = `https://wa.me/33756832263?text=${encodedMsg}`; // standard contact whatsapp

    // Open WhatsApp
    window.open(whatsappUrl, "_blank");
  };

  const advantagesList = [
    { title: "Accès aux Offres Flash", desc: "Soyez informés en temps réel de nos opportunités de vols privés et d'hôtels prestigieux." },
    { title: "Accédez aux Ventes Privées", desc: "Achetez de la mode de créateur, de la haute technologie et de l'art à prix exclusifs." },
    { title: "Obtenez des Prix Exclusifs", desc: "Des tarifs inaccessibles au grand public garantis par nos ententes mondiales." },
    { title: "Accéder à des Évènements VIP", desc: "Dîners de gala, ventes privées…" },
    { title: "Accès à l'Espace Membre", desc: "Une interface connectée pour piloter vos demandes de conciergerie à distance." },
    { title: "Obtenir des Réductions Fortes", desc: "Jusqu’à -80 % de réduction chez nos hôtels et plein d’autres avantages." },
    { title: "Bons Plans Premium", desc: "Chaque semaine, une curation minutieuse d'adresses secrètes et de services de luxe." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-gold selection:text-slate-950 pt-32 pb-24 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="group mb-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#D4AF37] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </button>

        {showForm ? (
          <SignUpForm
            onSubmit={onSignUpSubmit}
            onCancel={() => setShowForm(false)}
            isLoading={isLoading}
            error={signUpError}
          />
        ) : (
          <>
            {/* TOP HERO PRENTATION */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full text-xs text-gold font-bold tracking-[0.2em] uppercase mb-4 animate-pulse">
                <Sparkles size={12} /> Club Privé H-Conciergerie
              </div>
              <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tight leading-tight mb-6">
                Intégrez l'Inaccessible. <br/>
                <span className="text-gold-gradient font-semibold">Devenez Membre.</span>
              </h1>
              <p className="text-slate-400 font-light text-base md:text-lg leading-relaxed">
                Rejoignez un cercle prestigieux et profitez d'expériences uniques de voyage, de conciergerie haut de gamme et d'avantages financiers sans précédent partout à travers le monde.
              </p>
            </div>

            {/* PREMIUM MEMBERSHIP PRICING PRESENTATION */}
            <div className="relative mb-20 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-gold/30 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between">
                {/* Ambient gold glow decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full filter blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-900/55 rounded-full filter blur-[80px] pointer-events-none" />

                <div className="space-y-6 text-left flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/20 rounded-md text-[10px] text-gold font-black uppercase tracking-widest">
                    <CreditCard size={12} /> TARIF ABONNEMENT UNIQUE
                  </div>
                  <h3 className="text-3xl md:text-4xl font-serif text-white tracking-wide">
                    L'excellence au quotidien
                  </h3>
                  <p className="text-slate-400 font-light text-sm md:text-base leading-relaxed">
                    Bénéficiez d'une accréditation annuelle complète auprès de notre service de conciergerie privée. Un accès direct sans intermédiaire, conçu pour répondre instantanément à vos exigences d'exception.
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-2.5 text-[13px] text-slate-300 leading-relaxed">
                      <span className="text-gold font-black shrink-0 mt-0.5">•</span>
                      <span>Devis sur mesure intégrant l'IA et réponse 24/7</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-[13px] text-slate-300 leading-relaxed">
                      <span className="text-gold font-black shrink-0 mt-0.5">•</span>
                      <span>Offres flash sur une sélection d'hôtels de luxe</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-[13px] text-slate-300 leading-relaxed">
                      <span className="text-gold font-black shrink-0 mt-0.5">•</span>
                      <span>Réservation d'hôtels et locations de voitures à des tarifs négociés sans aucune commission</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-[13px] text-slate-300 leading-relaxed">
                      <span className="text-gold font-black shrink-0 mt-0.5">•</span>
                      <span>Ventes privées d'articles de luxe à des prix imbattables .</span>
                    </div>
                  </div>
                </div>

                {/* Price Badge / Callout Container */}
                <div className="p-8 bg-slate-950 border border-gold/20 rounded-2xl w-full md:w-80 text-center space-y-4 relative shadow-inner shrink-0 z-10">
                  <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Abonnement Annuel</div>
                  
                  <div className="space-y-1">
                    <div className="text-5xl font-serif text-gold-gradient font-bold tracking-tight">
                      365 € <span className="text-lg text-slate-400 font-light">/ an</span>
                    </div>
                    <div className="text-xs text-slate-300 font-semibold tracking-wide bg-gold/10 border border-gold/10 inline-block px-3 py-1 rounded-full">
                      Soit seulement <strong className="text-white">1 € par jour</strong>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      onClick={() => setShowForm(true)}
                      className="w-full bg-gold hover:bg-gold-light text-[#0A0D14] font-black uppercase text-[10px] tracking-widest rounded-xl py-3.5 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.2)] hover:scale-[1.03] active:scale-95 cursor-pointer"
                    >
                      DEVENIR MEMBRE
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* INTERVENTIONS / AVANTAGES DU PROGRAMME */}
            <div className="mb-24">
              
              {/* List of Perks */}
              <div className="space-y-8">
                <h2 className="text-3xl font-serif text-white tracking-widest uppercase text-center mb-4">
                  Pourquoi nous rejoindre ?
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {advantagesList.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ y: -5 }}
                      className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-white/[0.08] transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-4 font-serif font-bold text-xs select-none">
                        0{idx + 1}
                      </div>
                      <h4 className="font-serif text-lg text-white mb-2">{item.title}</h4>
                      <p className="text-slate-400 text-xs font-light leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>

            {/* BOTTOM ACCREDITATION BANNER */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <h3 className="font-serif text-xl mb-1">D'autres questions sur l'adhésion ?</h3>
                <p className="text-slate-400 text-xs font-light">Discutez directement avec un représentant de notre service des relations membres.</p>
              </div>
              <button 
                onClick={() => window.open(`https://wa.me/33756832263?text=Bonjour,%20j'aimerais%20en%20savoir%20plus%20sur%20les%20avantages%20des%20membres%20H-Conciergerie.`, "_blank")}
                className="bg-white text-slate-950 px-6 py-3 rounded-xl text-xs font-extrabold tracking-widest uppercase hover:bg-gold hover:text-slate-950 transition-colors shrink-0 cursor-pointer"
              >
                Contacter un conseiller
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
