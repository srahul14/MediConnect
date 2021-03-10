require("dotenv");

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

const stripe = require("stripe")(stripeSecretKey);

const createPaymentIntent = async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 75,
    currency: "cad",
    payment_method_types: ["card"],
    metadata: { integration_check: "accept_a_payment" },
  });

  res.json({
    intent_id: paymentIntent.id,
    client_secret: paymentIntent.client_secret,
    key: stripePublicKey,
  });
};

module.exports = { createPaymentIntent };
