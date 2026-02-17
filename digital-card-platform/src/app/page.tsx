import Link from 'next/link';
import { CreditCard, QrCode, Share2, Palette, BarChart3, Download } from 'lucide-react';

const features = [
  {
    icon: CreditCard,
    title: 'Beautiful Cards',
    description: 'Stunning 3D flip cards that replicate the feel of a real business card.',
  },
  {
    icon: QrCode,
    title: 'QR Code Contact',
    description: 'Auto-generated QR codes encode your vCard — scan to save contact instantly.',
  },
  {
    icon: Share2,
    title: 'Easy Sharing',
    description: 'Share your card via link, QR code, or the Web Share API on mobile.',
  },
  {
    icon: Palette,
    title: 'Custom Themes',
    description: 'Choose from pre-built color themes or create your own custom palette.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track card views and scans to see how your network grows.',
  },
  {
    icon: Download,
    title: 'Download & Export',
    description: 'Download your card as an image or export contact data as vCard.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Digital<span className="text-red-500">Card</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-gray-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Your Business Card,
          <br />
          <span className="text-red-500">Reimagined</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Create stunning digital business cards with QR codes that let anyone
          save your contact info with a single scan. No app required.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-red-600 px-8 py-3 text-lg font-medium hover:bg-red-700 transition"
          >
            Create Your Card
          </Link>
          <Link
            href="/card/jesse-couch"
            className="rounded-lg border border-gray-600 px-8 py-3 text-lg font-medium hover:border-gray-400 transition"
          >
            See Demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <h2 className="text-3xl font-bold text-center mb-16">
          Everything you need to stand out
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 hover:border-gray-600 transition"
            >
              <feature.icon className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-600/10 border-t border-b border-red-600/20 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to go digital?
          </h2>
          <p className="text-gray-400 mb-8">
            Create your first card in under a minute. Free to start.
          </p>
          <Link
            href="/register"
            className="inline-block rounded-lg bg-red-600 px-8 py-3 text-lg font-medium hover:bg-red-700 transition"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
        <p>Digital Card Platform. Built with Next.js, Tailwind CSS, and Prisma.</p>
      </footer>
    </div>
  );
}
