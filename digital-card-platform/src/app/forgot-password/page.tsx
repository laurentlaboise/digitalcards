import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-brand-charcoal px-6 py-24 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold">Password reset is not turned on</h1>
        <p className="mt-4 text-gray-300">
          This local build does not email a reset link. Create a new account, or sign in with the
          demo account shown on the sign-in page.
        </p>
        <Link href="/login" className="mt-6 inline-block text-brand-orange">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
