import Stripe from 'stripe';

let client: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe is not configured');
  if (!client) {
    client = new Stripe(key, {
      apiVersion: '2026-09-30.endive',
    });
  }
  return client;
}

export function appOrigin(request: Request) {
  const configured = process.env.NEXTAUTH_URL;
  if (configured) return configured.replace(/\/$/, '');
  const host = request.headers.get('host') || 'localhost:3025';
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}
