import React, { useState } from 'react';
import { ArrowLeft, Clock, Users, FileSearch } from 'lucide-react';
import { CaseDefinition, DetectiveProfile } from '../types/game';
import { SuspectAvatar } from './SuspectAvatar';

interface BriefingViewProps {
  activeCase: CaseDefinition;
  profile: DetectiveProfile;
  onStartInvestigation: () => void;
  onBack: () => void;
}

export const BriefingView: React.FC<BriefingViewProps> = ({
  activeCase,
  profile,
  onStartInvestigation,
  onBack,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <main className="max-w-[1440px] mx-auto px-6 py-10 space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>İşlər Siyahısına Qayıt</span>
      </button>

      <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        {/* Left: Scene Image & Case Metadata */}
        <div className="flex flex-col bg-[#141A26] border border-white/10 rounded-xl overflow-hidden">
          <div className="relative aspect-[4/3] lg:flex-1 min-h-[280px] bg-[#0B0F17]">
            {!imgFailed ? (
              <img
                src={activeCase.imageUrl}
                alt={activeCase.title}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1C2434] to-[#0B0F17]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141A26] via-transparent to-black/25" />
          </div>

          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400">
              <span className="font-mono text-amber-400">{activeCase.code}</span>
              <span aria-hidden="true">·</span>
              <span>{activeCase.location}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{activeCase.incidentTime}</span>
            </div>

            <h1 className="font-display text-3xl font-bold text-white [text-wrap:balance]">
              {activeCase.title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {activeCase.briefingText}
            </p>

            <div className="pt-4 border-t border-white/10 space-y-1">
              <p className="text-xs text-slate-400">Zərərçəkmiş</p>
              <p className="text-sm text-slate-200">{activeCase.victimSummary}</p>
            </div>
          </div>
        </div>

        {/* Right: Parameters, Suspects & RPG Skills */}
        <div className="flex flex-col justify-between bg-[#141A26] border border-white/10 rounded-xl p-6 md:p-8 space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">
                İstintaq Parametrləri
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Vaxt məhdudiyyəti daxilində bütün şahid və şübhəliləri müqayisə edin.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-[#0B0F17] border border-white/10 rounded-lg">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>İş Vaxtı</span>
                </div>
                <p className="font-mono text-lg font-semibold text-white mt-1">
                  {activeCase.timeBudgetMinutes} dəq
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Şübhəli</span>
                </div>
                <p className="font-mono text-lg font-semibold text-white mt-1">
                  {activeCase.suspects.length} nəfər
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <FileSearch className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dəlil Nöqtəsi</span>
                </div>
                <p className="font-mono text-lg font-semibold text-white mt-1">
                  {activeCase.crimeSceneNodes.length} zona
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">
                Dindirməyə Çağırılan Şübhəlilər
              </h3>
              <div className="space-y-3">
                {activeCase.suspects.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start gap-3.5 p-3.5 bg-[#0B0F17]/70 border border-white/10 rounded-lg"
                  >
                    <SuspectAvatar
                      suspect={s}
                      stress={s.initialStress}
                      lawyerDemanded={false}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-white">
                        <span>{s.name}</span>
                        <span className="text-xs text-slate-400 font-normal">
                          · {s.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {s.alibiSummary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#0B0F17]/70 border border-white/10 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
              <span>Aktiv RPG Bacarıqlarınız:</span>
              <div className="flex items-center gap-4 font-mono text-amber-400">
                <span>Məntiq {profile.skills.logic}/5</span>
                <span>Psixologiya {profile.skills.psychology}/5</span>
                <span>Təzyiq {profile.skills.pressure}/5</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white border border-white/15 rounded-lg transition-colors cursor-pointer"
            >
              Geri Qayıt
            </button>
            <button
              type="button"
              onClick={onStartInvestigation}
              className="px-6 py-2.5 text-sm font-semibold text-[#0B0F17] bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              Dindirmə Otağına Gir
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
