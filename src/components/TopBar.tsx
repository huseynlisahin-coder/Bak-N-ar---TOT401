import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { GamePhase } from '../types/game';

interface TopBarProps {
  phase: GamePhase;
  muted: boolean;
  onToggleMute: () => void;
  onNavigateHome: () => void;
  onScrollToSection?: (id: string) => void;
  onPrimaryAction: () => void;
  primaryActionLabel: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  phase,
  muted,
  onToggleMute,
  onNavigateHome,
  onScrollToSection,
  onPrimaryAction,
  primaryActionLabel,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0F17]/95 backdrop-blur-sm">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={onNavigateHome}
          className="font-display text-xl font-semibold tracking-tight text-[#F3F4F6] hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
        >
          Bakı Nuarı
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          {phase === 'TITLE_MENU' ? (
            <>
              <button
                type="button"
                onClick={() => onScrollToSection?.('cases')}
                className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Cinayət İşləri
              </button>
              <button
                type="button"
                onClick={() => onScrollToSection?.('skills')}
                className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Detektiv Profili
              </button>
              <button
                type="button"
                onClick={() => onScrollToSection?.('rules')}
                className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Qaydalar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              İşlər Siyahısına Qayıt
            </button>
          )}
          <button
            type="button"
            onClick={onToggleMute}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            aria-label={muted ? 'Səsi aç' : 'Səsi bağla'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{muted ? 'Səs Bağlıdır' : 'Səs Açıqdır'}</span>
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="px-4 py-2 text-sm font-semibold text-[#0B0F17] bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </header>
  );
};
