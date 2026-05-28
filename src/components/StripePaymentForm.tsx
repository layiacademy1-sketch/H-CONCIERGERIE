import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CreditCard, ShieldCheck, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

// Get Publishable Key or use dummy for simulator fallback
const getPublishableKey = (): string => {
  const env = (import.meta as any).env || {};
  return env.VITE_STRIPE_PUBLISHABLE_KEY || "";
};

const stripeKey = getPublishableKey();
// Only call loadStripe if key exists, otherwise we'll handle mock gracefully
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface StripePaymentFormProps {
  userId: string;
  email: string;
  onPaymentSuccess: (updatedMemberData: any) => void;
}

// Inner Form component that has access to useStripe and useElements
function BillingForm({ userId, email, onPaymentSuccess }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSimulatedFlow, setIsSimulatedFlow] = useState(false);

  // Determine endpoint based on hosting environment (Express or Netlify serverless)
  const getApiUrl = (route: string) => {
    if (window.location.hostname.includes("netlify.app")) {
      return `/.netlify/functions/${route}`;
    }
    return `/api/${route}`;
  };

  // Fetch Payment Intent clientSecret on mount
  useEffect(() => {
    let active = true;
    const fetchIntent = async () => {
      try {
        const url = getApiUrl("create-payment-intent");
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, email }),
        });

        if (!response.ok) {
          throw new Error("Impossible de joindre le serveur de paiement.");
        }

        const data = await response.json();
        if (active) {
          setClientSecret(data.clientSecret);
          setIsSimulatedFlow(data.isSimulated || !stripeKey);
        }
      } catch (err: any) {
        console.error("Error fetching payment intent:", err);
        if (active) {
          // If server fails or is offline, enable mock simulation gracefully so system doesn't block UI
          setIsSimulatedFlow(true);
        }
      }
    };

    fetchIntent();
    return () => {
      active = false;
    };
  }, [userId, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    // 1. Simulation Handler (if credentials aren't set up yet)
    if (isSimulatedFlow || !stripe || !elements || !clientSecret) {
      console.log("Processing simulated payment...");
      setTimeout(async () => {
        try {
          const url = getApiUrl("verify-payment");
          const verifyRes = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              isSimulated: true,
              paymentIntentId: "pi_simulated_secret_12345"
            }),
          });
          
          if (!verifyRes.ok) {
            throw new Error("La vérification simulée du paiement a échoué.");
          }

          const verifyData = await verifyRes.json();
          setSuccess(true);
          setLoading(false);
          
          // Propagate change
          setTimeout(() => {
            onPaymentSuccess(verifyData.member);
          }, 1500);

        } catch (err: any) {
          setErrorMsg(err.message || "Une erreur s'est produite lors du paiement simulé.");
          setLoading(false);
        }
      }, 1500);
      return;
    }

    // 2. Real Stripe elements payment
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setErrorMsg("Formulaire de carte de crédit invalide.");
        setLoading(false);
        return;
      }

      // Confirm payment with Stripe
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement as any,
          billing_details: {
            email: email || undefined,
          }
        }
      });

      if (error) {
        throw new Error(error.message || "La validation bancaire a échoué.");
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Backend verification and DB clearance
        const url = getApiUrl("verify-payment");
        const verifyResponse = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            userId,
            isSimulated: false
          })
        });

        if (!verifyResponse.ok) {
          throw new Error("Le paiement a été débité, mais la mise à jour de votre compte a échoué. Contactez le support.");
        }

        const verifyData = await verifyResponse.json();
        setSuccess(true);
        setLoading(false);

        // Call success closure after visual transition
        setTimeout(() => {
          onPaymentSuccess(verifyData.member);
        }, 1500);
      } else {
        throw new Error("Le paiement Stripe n'aboutit pas. Statut: " + (paymentIntent?.status || "Inconnu"));
      }

    } catch (err: any) {
      console.error("Payment submission failure:", err);
      setErrorMsg(err.message || "Une erreur est survenue lors du paiement.");
      setLoading(false);
    }
  };

  const cardElementOptions = {
    iconStyle: "solid" as const,
    style: {
      base: {
        color: "#ffffff",
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "14px",
        "::placeholder": {
          color: "#64748b"
        },
        iconColor: "#D4AF37"
      },
      invalid: {
        color: "#ef4444",
        iconColor: "#ef4444"
      }
    }
  };

  if (success) {
    return (
      <div className="text-center p-8 space-y-4 animate-pulse">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 scale-110">
          <CheckCircle2 size={32} />
        </div>
        <h4 className="font-serif text-xl text-white">Félicitations</h4>
        <p className="text-xs text-slate-300 font-light max-w-sm mx-auto">
          Votre transaction de 365,00 € a été validée avec succès. Activation immédiate de vos privilèges de conciergerie privée...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 font-medium">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isSimulatedFlow && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-gold/10 border border-gold/20 text-[11px] text-gold font-medium">
          <Sparkles size={14} className="shrink-0 mt-0.5" />
          <span>
            <strong>Mode Simulation Détecté</strong> : Les clés secrètes Stripe n'ont pas encore été renseignées dans votre dashboard. Vous pouvez tester l'ensemble du cycle de paiement de manière sécurisée en cliquant sur le bouton ci-dessous !
          </span>
        </div>
      )}

      {/* Visual Representation of Luxury Card */}
      <div className="relative w-full h-44 rounded-2xl bg-gradient-to-br from-slate-900 via-zinc-950 to-neutral-900 border border-gold/40 p-6 flex flex-col justify-between shadow-2xl overflow-hidden">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-white/[0.02] pointer-events-none" />
        
        {/* Chip & contactless */}
        <div className="flex justify-between items-center z-10">
          <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-300/20 to-yellow-600/30 border border-gold/40 flex items-center justify-center overflow-hidden">
            <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1 opacity-70">
              <div className="border border-gold/10"></div>
              <div className="border border-gold/10"></div>
              <div className="border border-gold/10"></div>
              <div className="border border-gold/10"></div>
              <div className="border border-gold/10"></div>
              <div className="border border-gold/10"></div>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-[9px] tracking-[0.2em] font-bold text-gold uppercase">H-CONCIERGERIE</span>
            <div className="text-[7px] text-slate-500 font-serif tracking-widest mt-0.5">CLUB PRIVÉ VIP</div>
          </div>
        </div>

        {/* Card number simulation representation */}
        <div className="my-2 z-10 text-left">
          <div className="font-mono text-sm tracking-[0.25em] text-white/95 font-semibold">
            ••••  ••••  ••••  ••••
          </div>
        </div>

        {/* Card holder & validation */}
        <div className="flex justify-between items-end z-10 text-left">
          <div>
            <div className="text-[8px] uppercase tracking-wider text-slate-500 mb-0.5">Titulaire</div>
            <div className="font-mono text-[10px] tracking-wide text-white font-medium uppercase truncate max-w-[220px]">
              {email || "MEMBRE PRIVILÈGE"}
            </div>
          </div>
          
          <div className="text-right flex items-center gap-3">
            {/* Mini Premium indicator */}
            <div className="px-2 py-1 bg-gold/15 rounded border border-gold/30 flex items-center justify-center">
              <span className="text-[8px] font-sans font-black tracking-wider text-gold uppercase">VIP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-left">
        <label className="text-[10px] tracking-wider uppercase font-bold text-slate-400">Titulaire de la carte</label>
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white">
          {email}
        </div>
      </div>

      <div className="space-y-1.5 text-left">
        <label className="text-[10px] tracking-wider uppercase font-bold text-slate-400">Coordonnées bancaires</label>
        
        {isSimulatedFlow ? (
          <div className="bg-slate-950 border border-gold/10 rounded-xl px-4 py-3.5 text-xs text-slate-400 flex items-center gap-2.5 italic">
            <CreditCard size={15} className="text-gold" />
            <span>Simulation de carte active - Prête à valider</span>
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-800 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold/30 rounded-xl px-4 py-4 transition-all">
            <CardElement options={cardElementOptions} />
          </div>
        )}
      </div>

      {/* Network Icons & Badges */}
      <div className="flex items-center justify-between px-1 py-1 text-slate-500 text-[10px] border-t border-slate-900 pt-3">
        <span className="font-medium">Cartes acceptées :</span>
        <div className="flex gap-1.5 font-mono text-[8px] font-semibold text-slate-400">
          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">VISA</span>
          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">MASTERCARD</span>
          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">AMEX</span>
          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">APPLE PAY</span>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || (!isSimulatedFlow && (!stripe || !elements))}
          className="w-full bg-gold hover:bg-gold-light text-[#0A0D14] font-black uppercase text-xs tracking-widest rounded-xl py-4 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            "Traitement sécurisé..."
          ) : (
            `Payer l’accès membre 1 an — 365€`
          )}
        </button>
      </div>

      <div className="flex gap-2 items-center justify-center text-[10px] text-slate-500 font-medium pt-2">
        <ShieldCheck size={14} className="text-gold" />
        Paiement de bout en bout crypté par Stripe
      </div>
    </form>
  );
}

// Outer wrapper responsible for conditional Rendering depending on stripe Promise setup
export default function StripePaymentForm({ userId, email, onPaymentSuccess }: StripePaymentFormProps) {
  if (stripePromise) {
    return (
      <Elements stripe={stripePromise}>
        <BillingForm userId={userId} email={email} onPaymentSuccess={onPaymentSuccess} />
      </Elements>
    );
  }

  // Fallback direct simulator rendering (when user keys are missing)
  return (
    <BillingForm userId={userId} email={email} onPaymentSuccess={onPaymentSuccess} />
  );
}
