import Link from 'next/link';
import { CreditCard, QrCode, Share2, Palette, BarChart3, Download, Zap, Shield, Smartphone } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: CreditCard,
    title: 'Beautiful NFC Cards',
    description: 'Stunning 3D flip cards that replicate the feel of a real business card with NFC technology.',
  },
  {
    icon: QrCode,
    title: 'QR Code Contact',
    description: 'Auto-generated QR codes encode your vCard — scan to save contact instantly.',
  },
  {
    icon: Share2,
    title: 'Easy Sharing',
    description: 'Share your card via link, QR code, NFC tap, or the Web Share API on mobile.',
  },
  {
    icon: Palette,
    title: 'Custom Themes',
    description: 'Choose from pre-built color themes or create your own custom palette.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track card views, scans, and taps to see how your network grows.',
  },
  {
    icon: Download,
    title: 'Download & Export',
    description: 'Download your card as an image or export contact data as vCard.',
  },
  {
    icon: Zap,
    title: 'Instant Updates',
    description: 'Update your card details anytime and changes reflect immediately.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and secure. Control who sees what.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Perfect experience on any device — desktop, tablet, or smartphone.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-blue-500/10 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Digital<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Cards</span>
          </span>
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
            className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-medium hover:from-blue-700 hover:to-cyan-600 transition shadow-lg shadow-blue-500/25"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center relative">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
            🚀 NFC Business Cards for the Modern Professional
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Your Business Card,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400">
              Reimagined with NFC
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Create stunning digital business cards with QR codes and NFC technology. 
            Let anyone save your contact info with a single scan or tap. No app required.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-lg font-medium hover:from-blue-700 hover:to-cyan-600 transition shadow-xl shadow-blue-500/30"
            >
              Create Your Card Free
            </Link>
            <Link
              href="/card/demo"
              className="rounded-lg border-2 border-blue-500/30 bg-blue-500/5 backdrop-blur-sm px-8 py-4 text-lg font-medium hover:border-blue-400/50 hover:bg-blue-500/10 transition"
            >
              See Demo
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Instant Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" />
              <span>Free to Start</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">stand out</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Powerful features to help you network smarter and grow faster
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-blue-500/10 bg-gradient-to-br from-slate-800/50 to-blue-900/20 backdrop-blur-sm p-6 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Get started in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">3 simple steps</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Your Card</h3>
            <p className="text-gray-400">Sign up and fill in your contact details, social links, and upload your photo.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Customize Design</h3>
            <p className="text-gray-400">Choose a theme, customize colors, and make your card uniquely yours.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Share & Connect</h3>
            <p className="text-gray-400">Share your card via QR code, link, or NFC. Track engagement in real-time.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border-t border-b border-blue-500/20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to go <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">digital</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of professionals who've already made the switch. Create your first card in under a minute.
          </p>
          <Link
            href="/register"
            className="inline-block rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-10 py-4 text-lg font-medium hover:from-blue-700 hover:to-cyan-600 transition shadow-2xl shadow-blue-500/30"
          >
            Get Started Free →
          </Link>
          <p className="mt-6 text-sm text-gray-400">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-500/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">DigitalCards</span>
              </div>
              <p className="text-sm text-gray-400">
                NFC business cards for the modern professional.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="/card/demo" className="hover:text-white transition">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/docs" className="hover:text-white transition">Documentation</Link></li>
                <li><Link href="/support" className="hover:text-white transition">Support</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-500/10 pt-8 text-center text-sm text-gray-500">
            <p>© 2026 DigitalCards. Built with Next.js, Tailwind CSS, and Prisma. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
