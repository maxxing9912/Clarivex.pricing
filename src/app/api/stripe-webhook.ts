import Stripe from "stripe";
import fs from "fs/promises";
import path from "path";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const PREMIUM_DB_PATH = path.resolve("./premiumUsers.json");

async function readPremiumUsers(): Promise<Record<string, boolean>> {
  try {
    const data = await fs.readFile(PREMIUM_DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writePremiumUsers(data: Record<string, boolean>) {
  await fs.writeFile(PREMIUM_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// Buffer reader per Request in Next.js app router
async function getRawBody(req: Request) {
  const arrayBuffer = await req.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const buf = await getRawBody(req);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const discordId = session.metadata?.discordId;

    if (discordId) {
      const premiumUsers = await readPremiumUsers();
      premiumUsers[discordId] = true;
      await writePremiumUsers(premiumUsers);
      console.log(`Premium status saved for Discord ID ${discordId}`);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}