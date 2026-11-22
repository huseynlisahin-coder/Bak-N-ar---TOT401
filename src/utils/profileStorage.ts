import { DetectiveProfile, DetectiveSkills } from '../types/game';

const STORAGE_KEY = 'baki_nuari_profile_v1';

export const RANK_THRESHOLDS = [
  { minXp: 0, title: 'Kiçik Müstəntiq' },
  { minXp: 250, title: 'Baş Müstəntiq' },
  { minXp: 600, title: 'Xüsusi İşlər Detektivi' },
  { minXp: 1100, title: 'Şöbə Rəisi · Baş Komissar' },
];

export function computeRank(xp: number): string {
  let rank = RANK_THRESHOLDS[0].title;
  for (const tier of RANK_THRESHOLDS) {
    if (xp >= tier.minXp) {
      rank = tier.title;
    }
  }
  return rank;
}

export const DEFAULT_PROFILE: DetectiveProfile = {
  name: 'Detektiv Murad',
  rank: RANK_THRESHOLDS[0].title,
  xp: 0,
  unspentPoints: 2,
  skills: {
    logic: 2,
    psychology: 1,
    pressure: 1,
  },
  solvedCaseIds: [],
  bestScores: {},
};

export function loadProfile(): DetectiveProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<DetectiveProfile>;
    const xp = Number(parsed.xp) || 0;
    return {
      name: parsed.name || DEFAULT_PROFILE.name,
      xp,
      rank: computeRank(xp),
      unspentPoints: typeof parsed.unspentPoints === 'number' ? parsed.unspentPoints : DEFAULT_PROFILE.unspentPoints,
      skills: {
        logic: parsed.skills?.logic ?? DEFAULT_PROFILE.skills.logic,
        psychology: parsed.skills?.psychology ?? DEFAULT_PROFILE.skills.psychology,
        pressure: parsed.skills?.pressure ?? DEFAULT_PROFILE.skills.pressure,
      },
      solvedCaseIds: Array.isArray(parsed.solvedCaseIds) ? parsed.solvedCaseIds : [],
      bestScores: parsed.bestScores || {},
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: DetectiveProfile): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
}

export function resetProfile(): DetectiveProfile {
  saveProfile(DEFAULT_PROFILE);
  return DEFAULT_PROFILE;
}

export function applySkillUpgrade(
  profile: DetectiveProfile,
  skillKey: keyof DetectiveSkills
): DetectiveProfile {
  if (profile.unspentPoints <= 0 || profile.skills[skillKey] >= 5) {
    return profile;
  }
  const updated: DetectiveProfile = {
    ...profile,
    unspentPoints: profile.unspentPoints - 1,
    skills: {
      ...profile.skills,
      [skillKey]: profile.skills[skillKey] + 1,
    },
  };
  saveProfile(updated);
  return updated;
}
