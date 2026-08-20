import TapCardMark from './TapCardMark';

type WordmarkTone = 'light' | 'dark';

export default function TapCardWordmark({
  tone = 'dark',
  markSize = 32,
  className = '',
  showMark = true,
}: {
  tone?: WordmarkTone;
  markSize?: number;
  className?: string;
  showMark?: boolean;
}) {
  const labelClass =
    tone === 'light' ? 'text-white' : 'text-brand-charcoal';

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {showMark && <TapCardMark size={markSize} />}
      <span className={`font-brand font-medium leading-none ${labelClass}`}>
        TapCard
        <span className="text-brand-orange">.</span>
      </span>
    </span>
  );
}
