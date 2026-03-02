import { Shield, Lock, KeyRound, ShieldCheck } from 'lucide-react';
import { SECURITY_ITEMS } from '@/data/landing-data';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Lock,
  KeyRound,
  ShieldCheck,
};

export default function SecurityBlock() {
  return (
    <section className="py-section-mobile md:py-section">
      <div className="max-w-container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900 mb-4">
            Enterprise-grade security you can trust
          </h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto">
            Your data is protected by industry-leading security standards and compliance certifications.
          </p>
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {SECURITY_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.iconName];
            return (
              <div
                key={item.id}
                className="rounded-xl border border-stone-200 bg-white p-8"
              >
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-5">
                  {Icon && <Icon className="w-6 h-6 text-stone-700" />}
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
