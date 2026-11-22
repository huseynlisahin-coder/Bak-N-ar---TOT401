import { useCallback, useMemo, useState } from 'react';
import { CASES } from './data/cases';
import {
  CaseDefinition,
  CaseOutcome,
  DetectiveProfile,
  DetectiveSkills,
  GamePhase,
  SuspectRuntimeState,
} from './types/game';
import {
  applySkillUpgrade,
  computeRank,
  loadProfile,
  resetProfile,
  saveProfile,
} from './utils/profileStorage';
import { soundFx } from './utils/soundFx';
import { TopBar } from './components/TopBar';
import { TitleMenu } from './components/TitleMenu';
import { BriefingView } from './components/BriefingView';
import { InvestigationWorkspace } from './components/InvestigationWorkspace';
import { AccusationModal } from './components/AccusationModal';
import { OutcomeSummary } from './components/OutcomeSummary';

function createInitialSuspectStates(
  activeCase: CaseDefinition
): Record<string, SuspectRuntimeState> {
  const states: Record<string, SuspectRuntimeState> = {};
  for (const s of activeCase.suspects) {
    states[s.id] = {
      stress: s.initialStress,
      trust: s.initialTrust,
      caughtContradictionIds: [],
      lawyerDemanded: false,
      lawyerWarningShown: false,
      suggestedFollowUps: [
        s.tacticalPrompts.empathy,
        s.tacticalPrompts.logic_trap,
      ],
      history: [
        {
          id: `open-${s.id}`,
          sender: 'suspect',
          text: s.openingStatement,
          microExpression: 'Dindirmə otağındakı stulda oturub sizi dinləyir.',
          timestampMinute: activeCase.timeBudgetMinutes,
        },
      ],
    };
  }
  return states;
}

export default function App() {
  const [profile, setProfile] = useState<DetectiveProfile>(() => loadProfile());
  const [phase, setPhase] = useState<GamePhase>('TITLE_MENU');
  const [muted, setMuted] = useState(false);

  const [activeCaseId, setActiveCaseId] = useState<string>(CASES[0].id);
  const [timeRemaining, setTimeRemaining] = useState<number>(CASES[0].timeBudgetMinutes);
  const [discoveredEvidenceIds, setDiscoveredEvidenceIds] = useState<string[]>([]);
  const [inspectedNodeIds, setInspectedNodeIds] = useState<string[]>([]);
  const [suspectStates, setSuspectStates] = useState<Record<string, SuspectRuntimeState>>(() =>
    createInitialSuspectStates(CASES[0])
  );

  const [showAccusationModal, setShowAccusationModal] = useState(false);
  const [outcome, setOutcome] = useState<CaseOutcome | null>(null);

  const activeCase = useMemo(
    () => CASES.find((c) => c.id === activeCaseId) || CASES[0],
    [activeCaseId]
  );

  const activeCaseIndex = useMemo(
    () => CASES.findIndex((c) => c.id === activeCase.id),
    [activeCase.id]
  );

  const handleToggleMute = () => {
    const nextMuted = !muted;
    soundFx.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) soundFx.playClick();
  };

  const prepareCaseSession = useCallback((targetCase: CaseDefinition) => {
    setActiveCaseId(targetCase.id);
    setTimeRemaining(targetCase.timeBudgetMinutes);
    setDiscoveredEvidenceIds(
      targetCase.evidence.filter((e) => e.discoveredByDefault).map((e) => e.id)
    );
    setInspectedNodeIds([]);
    setSuspectStates(createInitialSuspectStates(targetCase));
    setShowAccusationModal(false);
    setOutcome(null);
  }, []);

  const handleSelectCase = (caseId: string) => {
    const found = CASES.find((c) => c.id === caseId);
    if (!found) return;
    soundFx.playClick();
    prepareCaseSession(found);
    setPhase('BRIEFING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartInvestigation = () => {
    soundFx.playClick();
    setPhase('PLAYING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpgradeSkill = (skill: keyof DetectiveSkills) => {
    soundFx.playClueFound();
    setProfile((prev) => applySkillUpgrade(prev, skill));
  };

  const handleResetProfile = () => {
    soundFx.playClick();
    setProfile(resetProfile());
  };

  const handleDiscoverEvidence = useCallback(
    (evidenceId: string, timeCost: number) => {
      const node = activeCase.crimeSceneNodes.find(
        (n) => n.unlocksEvidenceId === evidenceId
      );
      if (node && !inspectedNodeIds.includes(node.id)) {
        setInspectedNodeIds((prev) => [...prev, node.id]);
      }
      setDiscoveredEvidenceIds((prev) =>
        prev.includes(evidenceId) ? prev : [...prev, evidenceId]
      );
      setTimeRemaining((t) => Math.max(0, t - timeCost));
    },
    [activeCase.crimeSceneNodes, inspectedNodeIds]
  );

  const finalizeOutcome = useCallback(
    (
      won: boolean,
      reason: CaseOutcome['reason'],
      culpritId?: string,
      motiveId?: string,
      evidenceIds?: string[]
    ) => {
      const contradictionsFoundCount = Object.values(suspectStates).reduce(
        (sum, st) => sum + st.caughtContradictionIds.length,
        0
      );

      const score = won
        ? 500 + timeRemaining * 4 + contradictionsFoundCount * 80
        : 60 + contradictionsFoundCount * 30;
      const xpEarned = won ? 260 + contradictionsFoundCount * 40 : 60;

      if (won) {
        soundFx.playContradiction();
      } else {
        soundFx.playAlert();
      }

      setProfile((prev) => {
        const alreadySolved = prev.solvedCaseIds.includes(activeCase.id);
        const nextXp = prev.xp + xpEarned;
        const nextSolved = won && !alreadySolved
          ? [...prev.solvedCaseIds, activeCase.id]
          : prev.solvedCaseIds;
        const prevBest = prev.bestScores[activeCase.id] || 0;

        const updated: DetectiveProfile = {
          ...prev,
          xp: nextXp,
          rank: computeRank(nextXp),
          unspentPoints:
            won && !alreadySolved ? prev.unspentPoints + 1 : prev.unspentPoints,
          solvedCaseIds: nextSolved,
          bestScores: {
            ...prev.bestScores,
            [activeCase.id]: won ? Math.max(prevBest, score) : prevBest,
          },
        };
        saveProfile(updated);
        return updated;
      });

      setOutcome({
        won,
        reason,
        selectedCulpritId: culpritId,
        selectedMotiveId: motiveId,
        selectedEvidenceIds: evidenceIds,
        timeRemainingMinutes: timeRemaining,
        contradictionsFoundCount,
        score,
        xpEarned,
      });
      setShowAccusationModal(false);
      setPhase('ROUND_SUMMARY');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [activeCase.id, suspectStates, timeRemaining]
  );

  const handleSubmitVerdict = (
    culpritId: string,
    motiveId: string,
    evidenceIds: string[]
  ) => {
    const culpritMatches = culpritId === activeCase.solution.culpritId;
    const motiveMatches = motiveId === activeCase.solution.motiveId;
    const evidenceMatches = activeCase.solution.requiredEvidenceIds.every((reqId) =>
      evidenceIds.includes(reqId)
    );

    const won = culpritMatches && motiveMatches && evidenceMatches;
    finalizeOutcome(
      won,
      won ? 'solved' : 'wrong_accusation',
      culpritId,
      motiveId,
      evidenceIds
    );
  };

  const handleContinueInvestigation = () => {
    soundFx.playClick();
    setPhase('PLAYING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePrimaryTopBarAction = () => {
    if (phase === 'TITLE_MENU') {
      const next = CASES.find((c) => !profile.solvedCaseIds.includes(c.id)) || CASES[0];
      handleSelectCase(next.id);
    } else if (phase === 'BRIEFING') {
      handleStartInvestigation();
    } else if (phase === 'PLAYING') {
      soundFx.playClick();
      prepareCaseSession(activeCase);
    } else {
      soundFx.playClick();
      setPhase('TITLE_MENU');
    }
  };

  const primaryTopBarLabel =
    phase === 'TITLE_MENU'
      ? 'İstintaqa Başla'
      : phase === 'BRIEFING'
        ? 'Dindirməyə Gir'
        : phase === 'PLAYING'
          ? 'İşi Sıfırla'
          : 'Ana Menyu';

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#E6E9EF] flex flex-col">
      <TopBar
        phase={phase}
        muted={muted}
        onToggleMute={handleToggleMute}
        onNavigateHome={() => {
          soundFx.playClick();
          setShowAccusationModal(false);
          setPhase('TITLE_MENU');
        }}
        onScrollToSection={handleScrollToSection}
        onPrimaryAction={handlePrimaryTopBarAction}
        primaryActionLabel={primaryTopBarLabel}
      />

      <div className="flex-1">
        {phase === 'TITLE_MENU' && (
          <TitleMenu
            cases={CASES}
            profile={profile}
            onSelectCase={handleSelectCase}
            onUpgradeSkill={handleUpgradeSkill}
            onResetProfile={handleResetProfile}
          />
        )}

        {phase === 'BRIEFING' && (
          <BriefingView
            activeCase={activeCase}
            profile={profile}
            onStartInvestigation={handleStartInvestigation}
            onBack={() => setPhase('TITLE_MENU')}
          />
        )}

        {phase === 'PLAYING' && (
          <InvestigationWorkspace
            activeCase={activeCase}
            profile={profile}
            timeRemaining={timeRemaining}
            setTimeRemaining={setTimeRemaining}
            discoveredEvidenceIds={discoveredEvidenceIds}
            onDiscoverEvidence={handleDiscoverEvidence}
            inspectedNodeIds={inspectedNodeIds}
            suspectStates={suspectStates}
            setSuspectStates={setSuspectStates}
            onOpenAccusation={() => {
              soundFx.playClick();
              setShowAccusationModal(true);
            }}
          />
        )}

        {phase === 'ROUND_SUMMARY' && outcome && (
          <OutcomeSummary
            activeCase={activeCase}
            outcome={outcome}
            profile={profile}
            hasNextCase={activeCaseIndex < CASES.length - 1}
            onContinueInvestigation={handleContinueInvestigation}
            onReplay={() => {
              soundFx.playClick();
              prepareCaseSession(activeCase);
              setPhase('PLAYING');
            }}
            onNextCase={() => {
              const nextCase = CASES[activeCaseIndex + 1];
              if (nextCase) {
                handleSelectCase(nextCase.id);
              }
            }}
            onBackToMenu={() => {
              soundFx.playClick();
              setPhase('TITLE_MENU');
            }}
          />
        )}
      </div>

      {showAccusationModal && phase === 'PLAYING' && (
        <AccusationModal
          activeCase={activeCase}
          discoveredEvidenceIds={discoveredEvidenceIds}
          inspectedNodeIds={inspectedNodeIds}
          logicSkill={profile.skills.logic}
          onInspectNode={(evId, cost) => {
            soundFx.playClueFound();
            handleDiscoverEvidence(evId, cost);
          }}
          onClose={() => setShowAccusationModal(false)}
          onSubmitVerdict={handleSubmitVerdict}
        />
      )}
    </div>
  );
}
