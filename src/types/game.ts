export type GamePhase =
  | 'TITLE_MENU'
  | 'BRIEFING'
  | 'PLAYING'
  | 'ACCUSATION'
  | 'ROUND_SUMMARY';

export type InterrogationTactic =
  | 'empathy'
  | 'pressure'
  | 'logic_trap'
  | 'present_evidence';

export interface DetectiveSkills {
  logic: number; // 1-5: reduces inspection time cost & boosts lie detection
  psychology: number; // 1-5: boosts empathy trust gain & shows micro-expression meaning
  pressure: number; // 1-5: increases stress impact & reduces lawyer backlash
}

export interface DetectiveProfile {
  name: string;
  rank: string;
  xp: number;
  unspentPoints: number;
  skills: DetectiveSkills;
  solvedCaseIds: string[];
  bestScores: Record<string, number>;
}

export interface EvidenceItem {
  id: string;
  title: string;
  category: 'Fiziki Dəlil' | 'Rəqəmsal Qeyd' | 'Ekspertiza' | 'Şahid İfadəsi';
  summary: string;
  detail: string;
  discoveredByDefault: boolean;
  sourceLocation: string;
}

export interface CrimeSceneNode {
  id: string;
  label: string;
  description: string;
  timeCostMinutes: number;
  unlocksEvidenceId: string;
}

export interface SuspectDefinition {
  id: string;
  name: string;
  age: number;
  role: string;
  alibiSummary: string;
  personality: string;
  initialStress: number;
  initialTrust: number;
  avatarCode: string;
  accentHue: 'amber' | 'sky' | 'rose' | 'emerald';
  openingStatement: string;
  tacticalPrompts: {
    empathy: string;
    pressure: string;
    logic_trap: string;
  };
  /** Key contradictions tied to specific evidence IDs that can break this suspect's alibi */
  keyContradictions: {
    evidenceId: string;
    description: string;
  }[];
  /** Server-side ground truth prompt guide */
  secretTruth: string;
  isCulprit: boolean;
}

export interface MotiveOption {
  id: string;
  label: string;
}

export interface CaseDefinition {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  location: string;
  incidentTime: string;
  difficulty: 'Başlanğıc' | 'Orta' | 'Çətin';
  timeBudgetMinutes: number;
  liveTurnSeconds: number;
  imageUrl: string;
  briefingText: string;
  victimSummary: string;
  evidence: EvidenceItem[];
  crimeSceneNodes: CrimeSceneNode[];
  suspects: SuspectDefinition[];
  motives: MotiveOption[];
  solution: {
    culpritId: string;
    motiveId: string;
    requiredEvidenceIds: string[];
    epilogueWin: string;
    epilogueLose: string;
  };
}

export interface DialogueEntry {
  id: string;
  sender: 'detective' | 'suspect' | 'system';
  tactic?: InterrogationTactic;
  attachedEvidenceTitle?: string;
  text: string;
  microExpression?: string;
  lieHint?: string;
  timestampMinute: number;
}

export interface SuspectRuntimeState {
  stress: number;
  trust: number;
  caughtContradictionIds: string[];
  lawyerDemanded: boolean;
  lawyerWarningShown: boolean;
  suggestedFollowUps: string[];
  history: DialogueEntry[];
}

export interface InterrogateApiRequest {
  caseId: string;
  suspectId: string;
  tactic: InterrogationTactic;
  question: string;
  attachedEvidenceId?: string;
  currentStress: number;
  currentTrust: number;
  discoveredEvidenceIds: string[];
  caughtContradictionIds: string[];
  detectiveSkills: DetectiveSkills;
  history: { sender: string; text: string }[];
}

export interface InterrogateApiResponse {
  reply: string;
  microExpression: string;
  lieHint: string;
  stressDelta: number;
  trustDelta: number;
  caughtContradictionId: string;
  willDemandLawyer: boolean;
  suggestedFollowUps: string[];
}

export interface CaseOutcome {
  won: boolean;
  reason: 'solved' | 'wrong_accusation' | 'time_expired' | 'all_lawyers';
  selectedCulpritId?: string;
  selectedMotiveId?: string;
  selectedEvidenceIds?: string[];
  timeRemainingMinutes: number;
  contradictionsFoundCount: number;
  score: number;
  xpEarned: number;
}
