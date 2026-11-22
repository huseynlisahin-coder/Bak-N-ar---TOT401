import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Clock,
  FileText,
  Search,
  Send,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Paperclip,
  X,
  Gavel,
  Sparkles,
  Timer,
} from 'lucide-react';
import {
  CaseDefinition,
  DetectiveProfile,
  DialogueEntry,
  InterrogateApiResponse,
  InterrogationTactic,
  SuspectRuntimeState,
} from '../types/game';
import { GLOBAL_IMAGES } from '../data/cases';
import { SuspectAvatar } from './SuspectAvatar';
import { soundFx } from '../utils/soundFx';

interface InvestigationWorkspaceProps {
  activeCase: CaseDefinition;
  profile: DetectiveProfile;
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  discoveredEvidenceIds: string[];
  onDiscoverEvidence: (evidenceId: string, timeCost: number) => void;
  inspectedNodeIds: string[];
  suspectStates: Record<string, SuspectRuntimeState>;
  setSuspectStates: React.Dispatch<React.SetStateAction<Record<string, SuspectRuntimeState>>>;
  onOpenAccusation: () => void;
}

const TACTICS: {
  id: InterrogationTactic;
  label: string;
  hint: string;
}[] = [
  { id: 'empathy', label: 'Empatiya', hint: 'Etibarı artırır, stresi azaldır' },
  { id: 'pressure', label: 'Sərt Təzyiq', hint: 'Stresi sürətlə qaldırır, etibarı azaldır' },
  { id: 'logic_trap', label: 'Məntiqi Tələ', hint: 'Alibi boşluğunu yoxlayır' },
  { id: 'present_evidence', label: 'Sübut Göstər', hint: 'Dəlillə üzləşdirib ziddiyyət tutur' },
];

function getStressLabel(stress: number): { label: string; colorClass: string; barClass: string } {
  if (stress >= 85) return { label: 'Sındı · Kritik', colorClass: 'text-red-400', barClass: 'bg-red-500' };
  if (stress >= 60) return { label: 'Çatlama Həddi', colorClass: 'text-amber-400', barClass: 'bg-amber-400' };
  if (stress >= 35) return { label: 'Gərgin', colorClass: 'text-amber-300', barClass: 'bg-amber-300' };
  return { label: 'Sakit', colorClass: 'text-slate-300', barClass: 'bg-slate-400' };
}

function getTrustLabel(trust: number): { label: string; colorClass: string; barClass: string } {
  if (trust <= 12) return { label: 'Vəkil Həddi', colorClass: 'text-red-400', barClass: 'bg-red-500' };
  if (trust <= 30) return { label: 'Qapalı', colorClass: 'text-amber-300', barClass: 'bg-amber-400' };
  if (trust >= 65) return { label: 'Əməkdaşlıq', colorClass: 'text-emerald-400', barClass: 'bg-emerald-400' };
  return { label: 'Ehtiyatlı', colorClass: 'text-sky-300', barClass: 'bg-sky-400' };
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  activeCase,
  profile,
  timeRemaining,
  setTimeRemaining,
  discoveredEvidenceIds,
  onDiscoverEvidence,
  inspectedNodeIds,
  suspectStates,
  setSuspectStates,
  onOpenAccusation,
}) => {
  const [activeSuspectId, setActiveSuspectId] = useState<string>(activeCase.suspects[0].id);
  const [leftTab, setLeftTab] = useState<'evidence' | 'scene'>('evidence');
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(
    activeCase.evidence[0]?.id ?? null
  );
  const [selectedTactic, setSelectedTactic] = useState<InterrogationTactic>('logic_trap');
  const [attachedEvidenceId, setAttachedEvidenceId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [roomImgError, setRoomImgError] = useState(false);
  const [liveTimerEnabled, setLiveTimerEnabled] = useState(false);
  const [turnSecondsLeft, setTurnSecondsLeft] = useState(activeCase.liveTurnSeconds);
  const [timerPenaltyFlash, setTimerPenaltyFlash] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const activeSuspect = useMemo(
    () => activeCase.suspects.find((s) => s.id === activeSuspectId) || activeCase.suspects[0],
    [activeCase.suspects, activeSuspectId]
  );
  const currentSuspectState = suspectStates[activeSuspect.id];

  const discoveredEvidence = useMemo(
    () => activeCase.evidence.filter((e) => discoveredEvidenceIds.includes(e.id)),
    [activeCase.evidence, discoveredEvidenceIds]
  );

  const totalContradictionsCaught = useMemo(() => {
    return Object.values(suspectStates).reduce(
      (sum, st) => sum + st.caughtContradictionIds.length,
      0
    );
  }, [suspectStates]);

  const logicTimeReduction = profile.skills.logic >= 3 ? 3 : 0;

  // Scroll dialogue feed on update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSuspectState.history.length, activeSuspectId]);

  // Live interrogation turn countdown timer
  useEffect(() => {
    if (
      !liveTimerEnabled ||
      isLoading ||
      Boolean(apiError) ||
      currentSuspectState.lawyerDemanded ||
      timeRemaining <= 0
    ) {
      return;
    }
    const interval = window.setInterval(() => {
      setTurnSecondsLeft((prev) => {
        if (prev <= 1) {
          soundFx.playAlert();
          setTimerPenaltyFlash(true);
          window.setTimeout(() => setTimerPenaltyFlash(false), 1800);
          setTimeRemaining((t) => Math.max(0, t - 5));
          return activeCase.liveTurnSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [
    liveTimerEnabled,
    isLoading,
    apiError,
    currentSuspectState.lawyerDemanded,
    timeRemaining,
    activeCase.liveTurnSeconds,
    setTimeRemaining,
  ]);

  const handleSelectTactic = (tactic: InterrogationTactic) => {
    soundFx.playClick();
    setSelectedTactic(tactic);
    if (tactic !== 'present_evidence') {
      const suggestion = activeSuspect.tacticalPrompts[tactic];
      if (!questionText.trim()) {
        setQuestionText(suggestion);
      }
    }
  };

  const handleAttachEvidence = (evId: string) => {
    soundFx.playClick();
    setAttachedEvidenceId(evId);
    setSelectedTactic('present_evidence');
    const ev = activeCase.evidence.find((e) => e.id === evId);
    if (ev && !questionText.trim()) {
      setQuestionText(`"${ev.title}" barədə nə deyə bilərsiniz? Bu fakt sizin ifadənizlə ziddiyyət təşkil edir.`);
    }
  };

  const handleInspectNode = (nodeId: string) => {
    if (inspectedNodeIds.includes(nodeId)) return;
    const node = activeCase.crimeSceneNodes.find((n) => n.id === nodeId);
    if (!node) return;
    const actualCost = Math.max(5, node.timeCostMinutes - logicTimeReduction);
    setApiError(null);
    soundFx.playClueFound();
    onDiscoverEvidence(node.unlocksEvidenceId, actualCost);
    setExpandedEvidenceId(node.unlocksEvidenceId);
    setLeftTab('evidence');
  };

  const handleResumeAfterLawyer = () => {
    soundFx.playClick();
    setTimeRemaining((t) => Math.max(0, t - 10));
    setSuspectStates((prev) => ({
      ...prev,
      [activeSuspect.id]: {
        ...prev[activeSuspect.id],
        lawyerDemanded: false,
        trust: Math.max(25, prev[activeSuspect.id].trust),
        history: [
          ...prev[activeSuspect.id].history,
          {
            id: `resume-${Date.now()}`,
            sender: 'system',
            text: `Qısa fasilədən sonra ${activeSuspect.name} yenidən dindirməyə qayıtdı. Daha təmkinli və faktlara əsaslanan suallar verin.`,
            timestampMinute: Math.max(0, timeRemaining - 10),
          },
        ],
      },
    }));
  };

  const handleSendQuestion = async (overrideQuestion?: string) => {
    const trimmed = (overrideQuestion ?? questionText).trim();
    if (!trimmed || isLoading || currentSuspectState.lawyerDemanded) return;

    const questionTimeCost = 5;

    setApiError(null);
    setIsLoading(true);
    soundFx.playClick();

    const attachedEv = attachedEvidenceId
      ? activeCase.evidence.find((e) => e.id === attachedEvidenceId)
      : undefined;

    const detectiveEntry: DialogueEntry = {
      id: `det-${Date.now()}`,
      sender: 'detective',
      tactic: selectedTactic,
      attachedEvidenceTitle: attachedEv?.title,
      text: trimmed,
      timestampMinute: timeRemaining,
    };

    try {
      const res = await fetch('/api/interrogate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: activeCase.id,
          suspectId: activeSuspect.id,
          tactic: selectedTactic,
          question: trimmed,
          attachedEvidenceId: attachedEvidenceId || undefined,
          currentStress: currentSuspectState.stress,
          currentTrust: currentSuspectState.trust,
          discoveredEvidenceIds,
          caughtContradictionIds: currentSuspectState.caughtContradictionIds,
          detectiveSkills: profile.skills,
          history: currentSuspectState.history.map((h) => ({
            sender: h.sender,
            text: h.text,
          })),
        }),
      });

      const rawBody = await res.text();
      let data: (Partial<InterrogateApiResponse> & { error?: string }) | null = null;
      try {
        data = rawBody
          ? (JSON.parse(rawBody) as Partial<InterrogateApiResponse> & { error?: string })
          : null;
      } catch {
        data = null;
      }

      if (!res.ok || !data || typeof data.reply !== 'string') {
        const isHtmlResponse = rawBody.trim().toLowerCase().startsWith('<');
        const fallbackMsg = isHtmlResponse
          ? 'Server müvəqqəti yüklənmə və ya şəbəkə fasiləsi ilə qarşılaşdı. Zəhmət olmasa sualı yenidən göndərin.'
          : `Dindirmə sorğusu zamanı server xətası baş verdi (HTTP ${res.status}).`;
        throw new Error(data?.error || fallbackMsg);
      }

      const aiResp = data as InterrogateApiResponse;

      // Apply RPG skill modifiers
      let stressDelta = aiResp.stressDelta;
      let trustDelta = aiResp.trustDelta;

      if (selectedTactic === 'pressure' && profile.skills.pressure >= 3) {
        stressDelta += 4;
        if (trustDelta < 0) trustDelta = Math.min(0, trustDelta + 4);
      }
      if (selectedTactic === 'empathy' && profile.skills.psychology >= 3) {
        trustDelta += 4;
      }

      const nextStress = Math.max(0, Math.min(100, currentSuspectState.stress + stressDelta));
      const nextTrust = Math.max(0, Math.min(100, currentSuspectState.trust + trustDelta));

      const newContradictions = [...currentSuspectState.caughtContradictionIds];
      let systemNote: DialogueEntry | null = null;

      if (
        aiResp.caughtContradictionId &&
        !newContradictions.includes(aiResp.caughtContradictionId)
      ) {
        newContradictions.push(aiResp.caughtContradictionId);
        onDiscoverEvidence(aiResp.caughtContradictionId, 0);
        const ev = activeCase.evidence.find((e) => e.id === aiResp.caughtContradictionId);
        soundFx.playContradiction();
        systemNote = {
          id: `sys-${Date.now()}`,
          sender: 'system',
          text: `ZİDDİYYƏT İFŞA OLUNDU: ${ev?.title || aiResp.caughtContradictionId} — şübhəlinin ifadəsi faktlarla üst-üstə düşmədi!`,
          timestampMinute: Math.max(0, timeRemaining - questionTimeCost),
        };
      }

      const lawyerTriggered = aiResp.willDemandLawyer || nextTrust <= 0;
      if (lawyerTriggered) {
        soundFx.playAlert();
      }

      const suspectEntry: DialogueEntry = {
        id: `sus-${Date.now() + 1}`,
        sender: 'suspect',
        text: aiResp.reply,
        microExpression: aiResp.microExpression,
        lieHint: profile.skills.psychology >= 2 || profile.skills.logic >= 3 ? aiResp.lieHint : undefined,
        timestampMinute: Math.max(0, timeRemaining - questionTimeCost),
      };

      setSuspectStates((prev) => {
        const cur = prev[activeSuspect.id];
        const nextHistory = [...cur.history, detectiveEntry, suspectEntry];
        if (systemNote) nextHistory.push(systemNote);
        if (lawyerTriggered) {
          nextHistory.push({
            id: `law-${Date.now()}`,
            sender: 'system',
            text: `${activeSuspect.name} etibarı tam itirdiyi üçün vəkil tələb etdi və dindirməni dayandırdı.`,
            timestampMinute: Math.max(0, timeRemaining - questionTimeCost),
          });
        }
        return {
          ...prev,
          [activeSuspect.id]: {
            ...cur,
            stress: nextStress,
            trust: nextTrust,
            caughtContradictionIds: newContradictions,
            lawyerDemanded: lawyerTriggered,
            suggestedFollowUps: aiResp.suggestedFollowUps || [],
            history: nextHistory,
          },
        };
      });

      setTimeRemaining((t) => Math.max(0, t - questionTimeCost));
      setTurnSecondsLeft(activeCase.liveTurnSeconds);
      setQuestionText('');
      setAttachedEvidenceId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinməyən xəta baş verdi.';
      soundFx.playAlert();
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const stressMeta = getStressLabel(currentSuspectState.stress);
  const trustMeta = getTrustLabel(currentSuspectState.trust);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-5 space-y-4">
      {/* Compact Workspace HUD */}
      <div className="bg-[#141A26] border border-white/10 rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-mono text-amber-400 font-semibold">{activeCase.code}</span>
          <span className="font-display font-semibold text-white">{activeCase.title}</span>
          <span className="text-slate-500 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-xs text-slate-400 hidden sm:inline">{activeCase.location}</span>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-xs">
          {/* Time Remaining */}
          <div className="flex items-center gap-2">
            <Clock
              className={`w-4 h-4 ${
                timeRemaining <= 15
                  ? 'text-red-400'
                  : timeRemaining <= 35
                    ? 'text-amber-400'
                    : 'text-slate-300'
              }`}
            />
            <span className="text-slate-400">İş Vaxtı:</span>
            <span
              className={`font-mono text-sm font-semibold ${
                timeRemaining <= 15
                  ? 'text-red-400'
                  : timeRemaining <= 35
                    ? 'text-amber-400'
                    : 'text-white'
              }`}
            >
              {timeRemaining} dəq
            </span>
            {timeRemaining <= 15 && (
              <span className="text-red-400 font-medium">· Kritik Vaxt</span>
            )}
          </div>

          {/* Live Turn Countdown */}
          <div className="flex items-center gap-2">
            <Timer className={`w-4 h-4 ${timerPenaltyFlash ? 'text-red-400' : 'text-amber-400'}`} />
            <button
              type="button"
              onClick={() => setLiveTimerEnabled((v) => !v)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              title="Canlı dindirmə taymerini aç/bağla"
            >
              Taymer:{' '}
              <span className={`font-mono font-semibold ${liveTimerEnabled ? 'text-amber-300' : 'text-slate-500'}`}>
                {liveTimerEnabled ? `${turnSecondsLeft}s` : 'Dayandırılıb'}
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 text-slate-300">
            <span>
              Dəlil:{' '}
              <strong className="font-mono text-white">
                {discoveredEvidence.length}/{activeCase.evidence.length}
              </strong>
            </span>
            <span>
              Ziddiyyət:{' '}
              <strong className="font-mono text-emerald-400">
                {totalContradictionsCaught}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAccusation}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0B0F17] bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>İttiham Aktı</span>
          </button>
        </div>
      </div>

      {timeRemaining <= 0 && (
        <div className="bg-amber-950/50 border border-amber-500/40 text-amber-200 px-4 py-2.5 rounded-lg text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Əsas vaxt bonusu (0 dəq) bitib, lakin istintaqa və suallara sərbəst davam edib təqsirkarı tapa bilərsiniz.
            </span>
          </div>
        </div>
      )}

      {timerPenaltyFlash && (
        <div className="bg-red-950/60 border border-red-500/40 text-red-200 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Dindirmə gedişi vaxtı bitdi — fasilə gecikməsinə görə iş balansından 5 dəqiqə çıxıldı.</span>
        </div>
      )}

      {/* 3-Column Investigation Desk */}
      <div className="grid lg:grid-cols-[310px_1fr_290px] gap-5 items-start">
        {/* LEFT PANEL: Evidence & Crime Scene */}
        <aside className="bg-[#141A26] border border-white/10 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#0B0F17] rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setLeftTab('evidence')}
              className={`py-2 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                leftTab === 'evidence'
                  ? 'bg-[#1F293B] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sübutlar ({discoveredEvidence.length})
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('scene')}
              className={`py-2 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                leftTab === 'scene'
                  ? 'bg-[#1F293B] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hadisə Yeri ({activeCase.crimeSceneNodes.length - inspectedNodeIds.length})
            </button>
          </div>

          {leftTab === 'evidence' ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {discoveredEvidence.map((ev) => {
                const isExpanded = expandedEvidenceId === ev.id;
                const isAttached = attachedEvidenceId === ev.id;
                return (
                  <div
                    key={ev.id}
                    className={`border rounded-lg p-3.5 transition-colors ${
                      isAttached
                        ? 'bg-amber-950/30 border-amber-400/50'
                        : 'bg-[#0B0F17]/70 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedEvidenceId(isExpanded ? null : ev.id)}
                      className="w-full text-left space-y-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                        <span>{ev.category} · {ev.sourceLocation}</span>
                      </div>
                      <p className="text-sm font-semibold text-white">{ev.title}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{ev.summary}</p>
                    </button>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                        <p className="text-xs text-slate-300 leading-relaxed">{ev.detail}</p>
                        <button
                          type="button"
                          onClick={() =>
                            isAttached ? setAttachedEvidenceId(null) : handleAttachEvidence(ev.id)
                          }
                          className={`w-full py-1.5 px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                            isAttached
                              ? 'bg-amber-400 text-[#0B0F17]'
                              : 'bg-white/10 hover:bg-amber-400 hover:text-[#0B0F17] text-white'
                          }`}
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{isAttached ? 'Dindirmədən Çıxar' : 'Dindirməyə Əlavə Et'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              <p className="text-xs text-slate-400 leading-relaxed">
                Hadisə yerindəki əlavə zonaları yoxlayaraq yeni dəlillər tapın.
                {logicTimeReduction > 0 && (
                  <span className="text-emerald-400 block mt-1">
                    Məntiq bacarığınız vaxt xərcini -{logicTimeReduction} dəq azaldır.
                  </span>
                )}
              </p>
              {activeCase.crimeSceneNodes.map((node) => {
                const inspected = inspectedNodeIds.includes(node.id);
                const cost = Math.max(5, node.timeCostMinutes - logicTimeReduction);
                return (
                  <div
                    key={node.id}
                    className={`border rounded-lg p-3.5 space-y-2.5 ${
                      inspected
                        ? 'bg-[#0B0F17]/40 border-emerald-500/30 opacity-75'
                        : 'bg-[#0B0F17]/80 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-white">{node.label}</p>
                      <span className="font-mono text-xs text-amber-400 shrink-0">
                        {inspected ? 'Yoxlanılıb' : `-${cost} dəq`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{node.description}</p>
                    {!inspected ? (
                      <button
                        type="button"
                        onClick={() => handleInspectNode(node.id)}
                        className="w-full py-1.5 px-3 text-xs font-medium bg-white/10 hover:bg-amber-400 hover:text-[#0B0F17] text-white rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Yoxla (-{cost} dəq)</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sübut qovluğa əlavə edildi</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* CENTER PANEL: Interrogation Room */}
        <section className="bg-[#141A26] border border-white/10 rounded-xl overflow-hidden flex flex-col min-h-[680px]">
          {/* Suspect Atmospheric Header */}
          <div className="relative border-b border-white/10 p-5">
            {!roomImgError && (
              <img
                src={GLOBAL_IMAGES.interrogationRoom}
                alt="Dindirmə otağı"
                referrerPolicy="no-referrer"
                onError={() => setRoomImgError(true)}
                className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#141A26] via-[#141A26]/90 to-[#141A26]/75 pointer-events-none" />

            <div className="relative space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <SuspectAvatar
                    suspect={activeSuspect}
                    stress={currentSuspectState.stress}
                    lawyerDemanded={currentSuspectState.lawyerDemanded}
                    size="lg"
                  />
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{activeSuspect.role}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{activeSuspect.age} yaş</span>
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-white">
                      {activeSuspect.name}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">{activeSuspect.alibiSummary}</p>
                  </div>
                </div>

                {currentSuspectState.lawyerDemanded && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-950/50 border border-red-500/30 px-3 py-1.5 rounded-lg shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Vəkil Tələb Etdi</span>
                  </div>
                )}
              </div>

              {/* Psychology Meters (Non-Hue-Only: numeric + label + bar) */}
              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Stres Səviyyəsi</span>
                    <span className={`font-mono font-medium ${stressMeta.colorClass}`}>
                      {currentSuspectState.stress}% · {stressMeta.label}
                    </span>
                  </div>
                  <div className="h-2 bg-[#0B0F17] rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full transition-all duration-300 ${stressMeta.barClass}`}
                      style={{ width: `${currentSuspectState.stress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Etibar və Açıqlıq</span>
                    <span className={`font-mono font-medium ${trustMeta.colorClass}`}>
                      {currentSuspectState.trust}% · {trustMeta.label}
                    </span>
                  </div>
                  <div className="h-2 bg-[#0B0F17] rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full transition-all duration-300 ${trustMeta.barClass}`}
                      style={{ width: `${currentSuspectState.trust}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dialogue History */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[380px] bg-[#0B0F17]/50">
            {currentSuspectState.history.map((entry) => {
              if (entry.sender === 'system') {
                return (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg bg-emerald-950/35 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{entry.text}</span>
                  </div>
                );
              }

              const isDetective = entry.sender === 'detective';
              return (
                <div
                  key={entry.id}
                  className={`flex flex-col ${isDetective ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-xl px-4 py-3 space-y-2 border ${
                      isDetective
                        ? 'bg-amber-500/10 border-amber-400/25 text-slate-100'
                        : 'bg-[#141A26] border-white/10 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400">
                      <span className="font-medium">
                        {isDetective ? profile.name : activeSuspect.name}
                        {entry.tactic ? ` · ${TACTICS.find((t) => t.id === entry.tactic)?.label}` : ''}
                      </span>
                      <span className="font-mono">{entry.timestampMinute} dəq</span>
                    </div>

                    {entry.attachedEvidenceTitle && (
                      <div className="text-[11px] text-amber-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Təqdim edilən sübut: {entry.attachedEvidenceTitle}</span>
                      </div>
                    )}

                    <p className="text-sm leading-relaxed">{entry.text}</p>

                    {entry.microExpression && (
                      <p className="text-xs italic text-slate-400 pt-1 border-t border-white/10">
                        Müşahidə: {entry.microExpression}
                      </p>
                    )}

                    {entry.lieHint && (
                      <p className="text-xs text-amber-300/90 flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Analiz: {entry.lieHint}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start">
                <div className="bg-[#141A26] border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-400">
                  {activeSuspect.name} cavab düşünür...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* API Error Display */}
          {apiError && (
            <div className="mx-5 mt-3 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="leading-relaxed">{apiError}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {questionText.trim() && !isLoading && (
                  <button
                    type="button"
                    onClick={() => handleSendQuestion()}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-red-500/20 hover:bg-red-500/35 text-red-100 border border-red-400/40 rounded transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Yenidən Göndər
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setApiError(null)}
                  className="text-red-300 hover:text-white shrink-0 cursor-pointer"
                  aria-label="Xətanı bağla"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Hybrid Interrogation Controls */}
          <div className="p-5 border-t border-white/10 space-y-3 bg-[#141A26]">
            {/* 4 Tactical Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TACTICS.map((tac) => {
                const active = selectedTactic === tac.id;
                return (
                  <button
                    key={tac.id}
                    type="button"
                    disabled={currentSuspectState.lawyerDemanded || isLoading}
                    onClick={() => handleSelectTactic(tac.id)}
                    className={`px-3 py-2 text-left rounded-lg border transition-colors cursor-pointer ${
                      active
                        ? 'bg-amber-400/15 border-amber-400 text-white'
                        : 'bg-[#0B0F17]/70 border-white/10 text-slate-300 hover:border-white/25'
                    }`}
                  >
                    <p className="text-xs font-semibold whitespace-nowrap">{tac.label}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{tac.hint}</p>
                  </button>
                );
              })}
            </div>

            {/* Suggested Follow-up Prompts */}
            {!currentSuspectState.lawyerDemanded &&
              currentSuspectState.suggestedFollowUps.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-400">Təklif olunan suallar:</span>
                  {currentSuspectState.suggestedFollowUps.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuestionText(q)}
                      className="text-xs text-slate-300 hover:text-amber-300 bg-[#0B0F17] border border-white/10 hover:border-amber-400/40 px-2.5 py-1 rounded-md transition-colors text-left cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

            {/* Attached Evidence Indicator */}
            {attachedEvidenceId && (
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-400/40 text-xs text-amber-200">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">
                    Sübut əlavə edildi:{' '}
                    <strong>
                      {activeCase.evidence.find((e) => e.id === attachedEvidenceId)?.title}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedEvidenceId(null)}
                  className="text-amber-300 hover:text-white shrink-0 cursor-pointer"
                  aria-label="Sübutu çıxar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Question Input Form */}
            {currentSuspectState.lawyerDemanded ? (
              <div className="p-3.5 rounded-lg bg-[#0B0F17] border border-red-500/30 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span>
                  {activeSuspect.name} təzyiq altında vəkil tələb edərək dayandı. Fasilə verib yenidən dindirə və ya digər şübhəlilərə keçə bilərsiniz.
                </span>
                <button
                  type="button"
                  onClick={handleResumeAfterLawyer}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-[#0B0F17] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Yenidən Dindir (-10 dəq)
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuestion();
                }}
                className="flex items-stretch gap-2.5"
              >
                <input
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  disabled={isLoading}
                  placeholder="Şübhəliyə sərbəst sualınızı yazın..."
                  className="flex-1 min-w-0 bg-[#0B0F17] border border-white/15 focus:border-amber-400 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || !questionText.trim()}
                  className="px-4 py-2.5 text-sm font-semibold bg-amber-400 hover:bg-amber-300 disabled:bg-white/10 disabled:text-slate-500 text-[#0B0F17] rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>Soruş (-5 dəq)</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* RIGHT PANEL: Suspects Switcher & Contradiction Notebook */}
        <aside className="bg-[#141A26] border border-white/10 rounded-xl p-4 space-y-5">
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Şübhəlilər
            </h3>
            <div className="space-y-2">
              {activeCase.suspects.map((s) => {
                const st = suspectStates[s.id];
                const isSelected = s.id === activeSuspect.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setActiveSuspectId(s.id);
                      setApiError(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#1F293B] border-amber-400/60'
                        : 'bg-[#0B0F17]/60 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <SuspectAvatar
                      suspect={s}
                      stress={st.stress}
                      lawyerDemanded={st.lawyerDemanded}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{s.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{s.role}</p>
                      <div className="flex items-center gap-2 text-[11px] font-mono mt-1">
                        <span className={st.stress >= 70 ? 'text-amber-400' : 'text-slate-400'}>
                          Stres {st.stress}%
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className={st.lawyerDemanded ? 'text-red-400' : 'text-emerald-400'}>
                          {st.lawyerDemanded
                            ? 'Susdu'
                            : `${st.caughtContradictionIds.length} ziddiyyət`}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tutulan Ziddiyyətlər
            </h3>
            {totalContradictionsCaught === 0 ? (
              <p className="text-xs text-slate-500 leading-relaxed">
                Hələ rəsmi ziddiyyət qeydə alınmayıb. Hadisə yerindən tapılan dəlilləri şübhəlilərə göstərib alibilərini dağıdın.
              </p>
            ) : (
              <div className="space-y-2">
                {activeCase.suspects.flatMap((s) =>
                  suspectStates[s.id].caughtContradictionIds.map((evId) => {
                    const ev = activeCase.evidence.find((e) => e.id === evId);
                    const kc = s.keyContradictions.find((k) => k.evidenceId === evId);
                    return (
                      <div
                        key={`${s.id}-${evId}`}
                        className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-1"
                      >
                        <p className="text-xs font-semibold text-emerald-300">
                          {s.name} · {ev?.title}
                        </p>
                        {kc && <p className="text-[11px] text-slate-300 leading-snug">{kc.description}</p>}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
