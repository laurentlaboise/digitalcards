import Link from 'next/link';
import LegalDocument from '@/components/legal/LegalDocument';

export const metadata = {
  title: 'Cookie Policy | TapCard',
  description:
    'Cookies on TapCard. A session cookie signs you in. There is no advertising cookie.',
};

export default function CookiesPage() {
  return (
    <LegalDocument title="Cookie Policy">
      <p>
        This policy says what TapCard stores in your browser. The operator is <strong>Laboise eworker Laos enterprise</strong> (Tax ID 275618471000, registration 08/04 – 000001253). The company and the two headquarters are described in the <Link href="/terms">Terms of Service</Link>. Questions go to <a href="mailto:hello@tapcard.asia">hello@tapcard.asia</a>.
      </p>

      <h2>What we mean</h2>
      <p>
        A cookie is a small file a site asks your browser to keep. TapCard uses cookies only so a signed-in owner can stay signed in. A public card, the QR code, and the lead form do not need an account and do not set an advertising cookie.
      </p>

      <h2>The cookies we set</h2>
      <ul>
        <li>
          <strong>Session cookie.</strong> Name pattern <code>next-auth.session-token</code> (or <code>__Secure-next-auth.session-token</code> on HTTPS). Set when you sign in. Used to know which account is open. Ends when you sign out or when the session ends. Strictly necessary for the dashboard.
        </li>
        <li>
          <strong>Sign-in helpers.</strong> NextAuth may set a short-lived CSRF cookie and a callback cookie while you sign in. They exist only to finish that sign-in safely.
        </li>
      </ul>
      <p>
        We do not set an analytics cookie, an advertising cookie, or a cookie that follows you across other sites. We do not use a consent banner for ads, because those cookies are not here. If a non-essential cookie is added later, this page will change first and we will ask before it is set.
      </p>

      <h2>What is not a cookie</h2>
      <ul>
        <li>The QR code is an image of the contact details. It is not stored as a cookie.</li>
        <li>A lead form stores what you type in our database, not in a cookie. That is covered by the <Link href="/privacy">Privacy Policy</Link>.</li>
        <li>The view counter is a number on the card. It is not a tracking cookie.</li>
      </ul>

      <h2>How to refuse</h2>
      <p>
        You can block cookies in your browser. If you block the session cookie, the public card still opens, and the dashboard sign-in will not stay open. Sign-out also clears the session.
      </p>

      <h2>Law</h2>
      <p>
        Under PIPEDA, a cookie that is required to provide a service you asked for does not need a separate marketing consent. The session cookie is that kind. Canada’s anti-spam law (CASL) covers commercial email, not this cookie. TapCard does not send commercial email.
      </p>
      <p>
        The same company duties under the Law on Electronic Data Protection No. 25/NA (Lao PDR) apply to information that identifies a person. A session cookie identifies the signed-in account and is used only for that session.
      </p>

      <h2>Changes</h2>
      <p>
        The date at the top of this page is the date of the current text. Disputes about this policy are heard in Ontario, Canada, as the Terms say.
      </p>
    </LegalDocument>
  );
}
