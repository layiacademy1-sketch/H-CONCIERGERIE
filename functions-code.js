/**
 * Firebase Cloud Function for Stripe Webhook Verification and Activation.
 * Copy this code into your Firebase Functions project (usually in functions/index.js).
 */

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.stripeWebhook = onRequest({ cors: true }, async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret && sig) {
      // Validate secure signature
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } else {
      // If endpoint secret is not configured yet, fallback for quick setup
      event = req.body;
    }
  } catch (err) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the specific checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Verify payment is paid
    if (session.payment_status === "paid") {
      const metadata = session.metadata || {};
      const uid = metadata.uid;
      const email = metadata.email;
      const pseudo = metadata.pseudo;

      console.log(`✅ Payment received for UID: ${uid}, Email: ${email}`);

      if (!uid) {
        console.error("❌ No uid specified in Stripe metadata.");
        return res.status(400).send("No uid in metadata");
      }

      try {
        const memberRef = db.collection("members").doc(uid);
        
        // Update member to 'membre_actif' and record subscription details
        await memberRef.set({
          status: "membre_actif",
          date_paiement: new Date().toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
          }),
          montant_paye: 365,
          stripe_session_id: session.id,
          abonnement: "annuel"
        }, { merge: true });

        console.log(`🎉 Member status updated successfully for ${uid}`);
      } catch (error) {
        console.error(`❌ Error updating Firestore member ${uid}:`, error);
        return res.status(500).send(`Database Error: ${error.message}`);
      }
    } else {
      console.log(`⚠️ Payment status is not 'paid': ${session.payment_status}`);
    }
  }

  res.json({ received: true });
});
