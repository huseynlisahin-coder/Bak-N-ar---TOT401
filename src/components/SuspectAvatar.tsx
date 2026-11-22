import React from 'react';
import { SuspectDefinition } from '../types/game';

interface SuspectAvatarProps {
  suspect: SuspectDefinition;
  stress: number;
  lawyerDemanded: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ACCENT_MAP: Record<SuspectDefinition['accentHue'], { ring: string; bg: string; text: string }> = {
  amber: {
    ring: 'border-amber-500/40',
    bg: 'from-amber-950/70 via-[#141A26] to-[#0B0F17]',
    text: 'text-amber-300',
  },
  sky: {
    ring: 'border-sky-400/40',
    bg: 'from-sky-950/70 via-[#141A26] to-[#0B0F17]',
    text: 'text-sky-300',
  },
  rose: {
    ring: 'border-rose-400/40',
    bg: 'from-rose-950/70 via-[#141A26] to-[#0B0F17]',
    text: 'text-rose-300',
  },
  emerald: {
    ring: 'border-emerald-400/40',
    bg: 'from-emerald-950/70 via-[#141A26] to-[#0B0F17]',
    text: 'text-emerald-300',
  },
};

export const SuspectAvatar: React.FC<SuspectAvatarProps> = ({
  suspect,
  stress,
  lawyerDemanded,
  size = 'md',
}) => {
  const palette = ACCENT_MAP[suspect.accentHue];
  const dims =
    size === 'sm'
      ? 'w-10 h-10 text-xs'
      : size === 'lg'
        ? 'w-16 h-16 text-lg'
        : 'w-12 h-12 text-sm';

  const ringClass = lawyerDemanded
    ? 'border-red-500/60'
    : stress >= 75
      ? 'border-amber-400/70'
      : palette.ring;

  return (
    <div
      className={`relative shrink-0 rounded-lg border ${ringClass} bg-gradient-to-br ${palette.bg} flex items-center justify-center overflow-hidden select-none ${dims}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        className="absolute inset-0 w-full h-full opacity-20"
        fill="none"
      >
        <circle cx="32" cy="23" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M14 56 C14 42, 50 42, 50 56"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <span className={`relative font-mono font-semibold tracking-wider ${palette.text}`}>
        {suspect.avatarCode}
      </span>
    </div>
  );
};
