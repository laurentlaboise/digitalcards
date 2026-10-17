import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import InquiryForm from '@/components/InquiryForm';

export default function GetCustomersPage() {
  return (
    <div className="min-h-screen bg-cream text-stone-900">
      <Header />
      <main className="mx-auto grid max-w-5xl gap-10 px-6 pb-20 pt-28 lg:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-brand-orange">Getting customers</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Two inboxes. One is yours. One is TapCard’s.</h1>
          <div className="mt-6 space-y-4 text-stone-700">
            <p>
              Your customers are the people who open your card and leave a name.
              They show up under Customers after you sign in. You reply. The site does not message them.
            </p>
            <p>
              TapCard’s customers are shops and studios that want a card of their own.
              The form on this page stores that request. An operator reads it in the inquiry desk.
              Creating an account is separate and free.
            </p>
            <p>
              WhatsApp for a human reply: +856 20 555 280 34. That link does not send anything by itself.
            </p>
          </div>
          <ol className="mt-8 space-y-3 text-sm text-stone-700">
            <li>1. Put the card link where you already talk to people: a stall, a chat, a quote.</li>
            <li>2. Ask them to leave a name if they want a price or a booking.</li>
            <li>3. Each morning, open Customers and answer the rows marked new.</li>
            <li>4. Mark customer only after they actually buy.</li>
          </ol>
        </div>
        <InquiryForm />
      </main>
      <Footer />
    </div>
  );
}
