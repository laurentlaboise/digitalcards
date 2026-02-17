'use client';

import { CARD_THEMES } from '@/types';

interface ThemePickerProps {
  onSelect: (theme: { primaryColor: string; accentColor: string; backgroundColor: string }) => void;
  currentPrimary: string;
}

export default function ThemePicker({ onSelect, currentPrimary }: ThemePickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CARD_THEMES.map((theme) => (
        <button
          key={theme.name}
          onClick={() =>
            onSelect({
              primaryColor: theme.primaryColor,
              accentColor: theme.accentColor,
              backgroundColor: theme.backgroundColor,
            })
          }
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
            currentPrimary === theme.primaryColor
              ? 'border-white bg-gray-700 text-white'
              : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500'
          }`}
          title={theme.name}
        >
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: theme.primaryColor }}
          />
          {theme.name}
        </button>
      ))}
    </div>
  );
}
