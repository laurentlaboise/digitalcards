import Link from 'next/link';
import LegalDocument from '@/components/legal/LegalDocument';

export const metadata = {
  title: 'Privacy Policy | TapCard',
  description:
    'How Laboise eworker Laos enterprise handles personal information on TapCard, under Canadian privacy law, from its Southeast Asia headquarters in Vientiane.',
};

export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy Policy">
      <p>
        TapCard is operated by <strong>Laboise eworker Laos enterprise</strong> (Tax ID 275618471000, registration 08/04 – 000001253). This is a Lao company. It serves people in Laos and in other countries.
      </p>
      <p>
        Its <strong>Southeast Asia headquarters</strong> is at 20 Rue Samsenthai, Vientiane, Lao PDR. Its <strong>principal headquarters</strong>, for the direction of TapCard and for disputes, is in <strong>Ontario, Canada</strong>. No separate Canadian street address is published on this page. The company that you contract with is the Lao enterprise named above.
      </p>
      <p>
        Privacy questions go to <a href="mailto:hello@tapcard.asia">hello@tapcard.asia</a> or WhatsApp <a href="https://wa.me/8562055528034">+856 20 555 280 34</a>.
      </p>

      <h2>The laws that apply</h2>
      <p>
        Commercial personal information is handled under Canada’s <strong>Personal Information Protection and Electronic Documents Act</strong> (PIPEDA, S.C. 2000, c. 5). Ontario has no general private-sector privacy statute that replaces PIPEDA, so PIPEDA is the Canadian rule for this service. A breach that creates a real risk of significant harm will be notified to the people affected and, where PIPEDA requires it, to the Office of the Privacy Commissioner of Canada.
      </p>
      <p>
        Because the company is established in Lao PDR, it also follows the <strong>Law on Electronic Data Protection No. 25/NA of 12 May 2017</strong> and the Instruction on its implementation No. 2126/MTC of 8 August 2018, supervised by the Ministry of Technology and Communications.
      </p>
      <p>
        If a person in the European Economic Area or the United Kingdom uses TapCard, they may email us to access, correct, delete, or object to their information. This policy does not claim an EU representative, EU-only hosting, or a certification. We do not sell personal information. We do not claim SOC 2, ISO, or a similar audit.
      </p>

      <h2>Who decides</h2>
      <ul>
        <li>We decide why account data, setup requests sent to TapCard, and site security records exist. We are accountable for those.</li>
        <li>If you publish a card, you choose what the card says. Visitors who leave their details are writing to you. We store those leads so you can read them. You are responsible for how you use them.</li>
        <li>A visitor can ask us, or the card owner, to delete a lead.</li>
      </ul>

      <h2>What we store</h2>
      <p>Only what the product needs:</p>
      <ul>
        <li><strong>Account:</strong> name, email, and a hash of the password. We do not store the password itself.</li>
        <li><strong>Card:</strong> the name, role, company, phone, email, website, address, social links, bio, colours, and pictures the owner adds, plus whether the card is published.</li>
        <li><strong>Lead:</strong> the name, email, phone, company, and note a visitor types on a card, and the time. A hidden field that only robots fill is dropped and not stored.</li>
        <li><strong>Setup request:</strong> the same kind of fields from the form for shops that want TapCard.</li>
        <li><strong>Count:</strong> a card view adds one to a counter. We do not build a location or device profile from that count.</li>
        <li><strong>QR code:</strong> the code on the card is the contact details already on the card, so another phone can offer to save them. Scanning it does not create a new account.</li>
      </ul>
      <p>
        We do not ask for a passport or a national ID. If you subscribe, Stripe stores the payment card. We store only the Stripe customer id, the subscription id, the plan name, and whether the subscription is active. The site does not send email and does not sell rows to anyone.
      </p>

      <h2>Why we use it</h2>
      <ul>
        <li>To show the card and the QR code.</li>
        <li>To give the card owner the leads from that card.</li>
        <li>To run sign-in and the dashboard.</li>
        <li>To answer a request for a TapCard.</li>
        <li>To stop abuse, including the honeypot on the forms.</li>
        <li>To meet a legal duty in Canada or in Lao PDR.</li>
      </ul>
      <p>
        We rely on the consent you give by creating an account, publishing a card, or submitting a form, and on the limited cases where PIPEDA allows a use without a fresh consent. You can withdraw consent by closing the card or writing to us. Withdrawal does not undo a use that already happened.
      </p>

      <h2>Who else sees it</h2>
      <ul>
        <li>The card owner sees the leads from their own card.</li>
        <li>Anyone with the card link can see what the owner published on that card.</li>
        <li>A company that hosts the database may process the rows on our instructions. This copy is not on a public host yet. When a public host is in use, its name will be added here.</li>
        <li>We disclose information if Canadian or Lao law requires it, or to answer a court in Ontario.</li>
      </ul>
      <p>We do not sell, rent, or trade personal information.</p>

      <h2>Where it sits</h2>
      <p>
        TapCard is offered from Laos and from Canada, and people in other countries may open a card. Information may be stored in Canada, in Lao PDR, or in the country of the host we name later. A transfer outside your country is made so the service can run, and we keep the access limited to that purpose.
      </p>

      <h2>How long</h2>
      <p>
        An account and its cards stay while the account is open. Deleting a card deletes the leads on that card. Leads stay until the card is deleted or you ask us to remove them. Setup requests stay until we have dealt with them and no longer need them for a record. We do not keep a copy for marketing, because this service does not send marketing mail.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Email <a href="mailto:hello@tapcard.asia">hello@tapcard.asia</a> to see, correct, or delete the information we hold about you. We will answer within 30 days.</li>
        <li>A card owner can edit or delete a card from the dashboard. Deleting the card removes its leads.</li>
        <li>There is no self-serve button yet to delete a whole account. Write to us and we will close it.</li>
        <li>You may complain to the Office of the Privacy Commissioner of Canada, and, for processing tied to Lao PDR, to the Ministry of Technology and Communications.</li>
      </ul>

      <h2>Security</h2>
      <p>
        Passwords are stored as a hash. Sign-in uses a session cookie described in the <Link href="/cookies">Cookie Policy</Link>. Pages are served over HTTPS when the public site is on. These are ordinary safeguards, not a certification.
      </p>

      <h2>Children</h2>
      <p>TapCard is not for children under 16. We do not knowingly keep an account for a child. Write to us if you believe we have.</p>

      <h2>Changes</h2>
      <p>
        If this policy changes in a way that matters, the date at the top will change. Continued use after that date means you have seen the new text. The <Link href="/terms">Terms of Service</Link> explain the contract, including Ontario as the place of dispute.
      </p>
    </LegalDocument>
  );
}
