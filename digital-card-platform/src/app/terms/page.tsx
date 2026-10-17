import Link from 'next/link';
import LegalDocument from '@/components/legal/LegalDocument';

export const metadata = {
  title: 'Terms of Service | TapCard',
  description:
    'Terms for TapCard, operated by Laboise eworker Laos enterprise. Canadian law governs. Disputes are heard in Ontario. The Southeast Asia headquarters is in Vientiane.',
};

export default function TermsPage() {
  return (
    <LegalDocument title="Terms of Service">
      <p>
        These terms are the contract for TapCard. By creating an account, publishing a card, or sending a form, you agree to them. If you do not agree, do not use the service.
      </p>

      <h2>The company</h2>
      <p>
        The operator is <strong>Laboise eworker Laos enterprise</strong>, a company established in Lao PDR (Tax ID 275618471000, registration 08/04 – 000001253). “We” means that company. “You” means the person or business using TapCard.
      </p>
      <p>
        The company has two seats. The <strong>principal headquarters</strong> is in <strong>Ontario, Canada</strong>. That is where TapCard is directed and where disputes are heard. The <strong>Southeast Asia headquarters</strong> is at 20 Rue Samsenthai, Vientiane, Lao PDR. Laos is the base for service in Southeast Asia. TapCard may be used in other countries as well.
      </p>
      <p>
        No separate Canadian street address is published here. Notices go to <a href="mailto:hello@tapcard.asia">hello@tapcard.asia</a> or to the Vientiane address above. WhatsApp: <a href="https://wa.me/8562055528034">+856 20 555 280 34</a>.
      </p>

      <h2>The service</h2>
      <p>
        TapCard is a digital business card. An owner publishes a page and a QR code. A visitor can call, email, save the contact, or leave their details. The owner reads those details in an inbox. A shop can also ask us for a card.
      </p>
      <p>
        The free card can be used without a payment. Pro and Business are Stripe subscriptions, and a charge happens only on the Stripe page after you confirm. We do not send email from this service. Features described on the marketing pages are only those the product actually has.
      </p>
      <p>
        The sample card at /card/demo uses invented names. It is not a real shop and not a customer.
      </p>

      <h2>Accounts</h2>
      <p>
        You must give a real email and keep the password to yourself. You are responsible for what happens under your account. Tell us if you believe someone else is using it. We may suspend an account that breaks these terms.
      </p>

      <h2>Your card</h2>
      <p>You promise that:</p>
      <ul>
        <li>The details you publish are yours, or you have permission to publish them.</li>
        <li>You will not put another person’s private number, email, or address on a card without their say-so.</li>
        <li>You will not use a card to mislead someone about who you are.</li>
        <li>You are responsible for the leads you receive and for how you contact those people.</li>
      </ul>
      <p>
        The QR code carries the contact details on the card so another phone can offer to save them. You are responsible for those details being accurate.
      </p>

      <h2>Acceptable use</h2>
      <p>You will not:</p>
      <ul>
        <li>Break Canadian law, Lao law, or the law of the country where you use the service.</li>
        <li>Send spam, scrape the service, or try to break into an account that is not yours.</li>
        <li>Upload malware or content that is unlawful.</li>
        <li>Use TapCard to collect personal information you have no right to collect.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        You keep ownership of the text and pictures you put on a card. You give us permission to host, display, and make a QR code from that content so the service can run. That permission ends when you delete the card, except for a backup we still need to delete on the next ordinary cycle.
      </p>
      <p>We own the TapCard name, the software, and the layout of the service.</p>

      <h2>Plans and money</h2>
      <p>
        Free does not charge. Pro is 2.50 US dollars a month for 5 cards. Business is 5 US dollars a month for 25 cards. A subscription starts only when you confirm payment on Stripe Checkout. Stripe stores the card. You can cancel in the billing portal, and access for that plan continues until the period you already paid for ends. We do not add tax on top of these prices. The prices page is where you start a payment.
      </p>

      <h2>Privacy</h2>
      <p>
        The <Link href="/privacy">Privacy Policy</Link> and the <Link href="/cookies">Cookie Policy</Link> are part of these terms. Read them. They describe what is stored and the session cookie used to sign in.
      </p>

      <h2>Availability</h2>
      <p>
        The service is provided as it stands. We may change, pause, or stop a feature. We do not promise that a card will be online every minute, or that a phone will always open the QR code.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent Canadian law allows, we are not liable for lost profits, lost contacts, or other indirect loss. Our total liability arising out of TapCard in a claim is limited to the greater of CAD 100 and the fees you paid us for TapCard in the three months before the claim. If you have paid nothing, the limit is CAD 100.
      </p>
      <p>
        Nothing in these terms limits liability that Canadian law or Lao law does not allow us to limit, including liability for fraud or for death or personal injury caused by negligence.
      </p>

      <h2>Law and disputes</h2>
      <p>
        These terms are governed by the laws of the Province of Ontario and the federal laws of Canada that apply in Ontario, without regard to conflict-of-law rules.
      </p>
      <p>
        The courts of the Province of Ontario, Canada, have exclusive jurisdiction over a dispute about these terms or about TapCard. You and we accept that jurisdiction. The company remains the Lao enterprise named above. This clause is the mandate for every country where the service is offered, including Lao PDR.
      </p>
      <p>
        If you are a consumer and the law of your country of residence gives you a right that cannot be waived, that right still stands. This clause does not take it away.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The date on this page will change. If you keep using TapCard after that date, you are agreeing to the updated terms. If you do not agree, stop using the service and ask us to close the account.
      </p>

      <h2>Contact</h2>
      <p>
        Laboise eworker Laos enterprise<br />
        Southeast Asia headquarters: 20 Rue Samsenthai, Vientiane, Lao PDR<br />
        Principal headquarters and place of dispute: Ontario, Canada<br />
        <a href="mailto:hello@tapcard.asia">hello@tapcard.asia</a>
      </p>
    </LegalDocument>
  );
}
