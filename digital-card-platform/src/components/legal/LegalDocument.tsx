import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export default function LegalDocument({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream text-stone-900">
      <Header />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-stone-500">
          Effective 15 October 2026. Applies to TapCard at tapcard.asia and to this service wherever it is offered.
        </p>
        <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-stone-800 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-stone-900 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:underline">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
