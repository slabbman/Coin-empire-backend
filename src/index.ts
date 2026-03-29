const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(cors({ origin: "*" }));
app.use("/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

const GEM_PACKS = {
  starter_pack: { priceCents: 299, gemAmount: 500 },
  gems_small: { priceCents: 99, gemAmount: 100 },
  gems_medium: { priceCents: 499, gemAmount: 550 },
  gems_large: { priceCents: 999, gemAmount: 1200 },
};

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { packId } = req.body;
    const pack = GEM_PACKS[packId];
    if (!pack) return res.status(400).json({ error: "Unknown pack" });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: pack.priceCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { packId, gemAmount: pack.gemAmount.toString() },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
