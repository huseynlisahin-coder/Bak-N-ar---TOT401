import React, { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, Eye, MessageSquare } from 'lucide-react';
import { CaseDefinition, CaseOutcome, DetectiveProfile } from '../types/game';

interface OutcomeSummaryProps {
  activeCase: CaseDefinition;
  outcome: CaseOutcome;
  profile: DetectiveProfile;
  hasNextCase: boolean;
  onContinueInvestigation: () => void;
  onReplay: () => void;
  onNextCase: () => void;
  onBackToMenu: () => void;
}

export const OutcomeSummary: React.FC<OutcomeSummaryProps> = ({
  activeCase,
  outcome,
  profile,
  hasNextCase,
  onContinueInvestigation,
  onReplay,
  onNextCase,
  onBackToMenu,
}) => {
  const [revealTruth, setRevealTruth] = useState(outcome.won);

  const trueCulprit = activeCase.suspects.find(
    (s) => s.id === activeCase.solution.culpritId
  );
  const trueMotive = activeCase.motives.find(
    (m) => m.id === activeCase.solution.motiveId
  );

  const reasonHeadline: Record<CaseOutcome['reason'], string> = {
    solved: 'Cinayət İşi Uğurla Bağlandı',
    wrong_accusation: 'İttiham Uyğun Gəlmədi',
    time_expired: 'İstintaq Vaxtı Bitdi',
    all_lawyers: 'Bütün Şübhəlilər Susdu',
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <div className="bg-[#141A26] border border-white/10 rounded-xl p-6 md:p-10 space-y-8">
        <div className="flex items-start gap-4 border-b border-white/10 pb-6">
          {outcome.won ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-400 shrink-0 mt-1" />
          ) : (
            <XCircle className="w-10 h-10 text-amber-400 shrink-0 mt-1" />
          )}
          <div className="space-y-1">
            <p className="text-xs font-mono text-amber-400">
              {activeCase.code} · {activeCase.title}
            </p>
            <h1 className="font-display text-3xl font-bold text-white">
              {reasonHeadline[outcome.reason]}
            </h1>
          </div>
        </div>

        <p className="text-base text-slate-200 leading-relaxed">
          {outcome.won
            ? activeCase.solution.epilogueWin
            : 'Seçdiyiniz təqsirkar, motiv və ya əsas sübut cütlüyü tam üst-üstə düşmədi. Dindirmə otağına qayıdaraq əlavə suallar verə, hadisə yerini daha dərindən yoxlaya və əsl cinayətkarı özünüz tapa bilərsiniz.'}
        </p>

        {/* Score & XP Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#0B0F17] border border-white/10 rounded-lg">
          <div>
            <p className="text-xs text-slate-400">Yekun Xal</p>
            <p className="font-mono text-2xl font-semibold text-white mt-1">
              {outcome.score}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Qazanılan XP</p>
            <p className="font-mono text-2xl font-semibold text-amber-400 mt-1">
              +{outcome.xpEarned}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Qalan Vaxt</p>
            <p className="font-mono text-2xl font-semibold text-white mt-1">
              {outcome.timeRemainingMinutes} dəq
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Ziddiyyət</p>
            <p className="font-mono text-2xl font-semibold text-emerald-400 mt-1">
              {outcome.contradictionsFoundCount}
            </p>
          </div>
        </div>

        {/* Truth Reveal (hidden until won or explicitly revealed) */}
        {revealTruth ? (
          <div className="p-5 bg-[#0B0F17]/70 border border-white/10 rounded-lg space-y-2.5 text-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Rəsmi İstintaq Həqiqəti
            </p>
            <p className="text-slate-200">
              <span className="text-slate-400">Əsl Təqsirkar:</span>{' '}
              <strong className="text-white">{trueCulprit?.name}</strong> ({trueCulprit?.role})
            </p>
            <p className="text-slate-200">
              <span className="text-slate-400">Motiv:</span> {trueMotive?.label}
            </p>
            <p className="text-slate-200">
              <span className="text-slate-400">Əsas Dəlillər:</span>{' '}
              {activeCase.solution.requiredEvidenceIds
                .map((id) => activeCase.evidence.find((e) => e.id === id)?.title)
                .join(' · ')}
            </p>
            {!outcome.won && (
              <p className="text-slate-300 pt-2 border-t border-white/10">
                {activeCase.solution.epilogueLose}
              </p>
            )}
            <p className="text-xs text-amber-300 pt-2 border-t border-white/10">
              Cari Rütbəniz: {profile.rank} · Ümumi XP: {profile.xp}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-[#0B0F17]/70 border border-white/10 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <span>İşi özünüz açmaq üçün təqsirkar adı hələ gizli saxlanılır.</span>
            <button
              type="button"
              onClick={() => setRevealTruth(true)}
              className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Əsl Cavabı Göstər</span>
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onBackToMenu}
            className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white border border-white/15 rounded-lg transition-colors cursor-pointer"
          >
            Ana Menyu
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {!outcome.won && (
              <button
                type="button"
                onClick={onContinueInvestigation}
                className="px-5 py-2.5 text-sm font-semibold text-[#0B0F17] bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Dindirməyə Qayıt</span>
              </button>
            )}

            <button
              type="button"
              onClick={onReplay}
              className="px-4 py-2.5 text-sm font-medium text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Yenidən Başla</span>
            </button>

            {hasNextCase && outcome.won && (
              <button
                type="button"
                onClick={onNextCase}
                className="px-5 py-2.5 text-sm font-semibold text-[#0B0F17] bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Növbəti İş</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
