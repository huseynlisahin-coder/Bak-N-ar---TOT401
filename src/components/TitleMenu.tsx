import React, { useState } from 'react';
import { Clock, ShieldAlert, Search, Brain, MessageSquare, RotateCcw } from 'lucide-react';
import { CaseDefinition, DetectiveProfile, DetectiveSkills } from '../types/game';
import { GLOBAL_IMAGES } from '../data/cases';

interface TitleMenuProps {
  cases: CaseDefinition[];
  profile: DetectiveProfile;
  onSelectCase: (caseId: string) => void;
  onUpgradeSkill: (skill: keyof DetectiveSkills) => void;
  onResetProfile: () => void;
}

const SKILL_META: {
  key: keyof DetectiveSkills;
  name: string;
  description: string;
  bonus: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: 'logic',
    name: 'Məntiq və Analiz',
    description: 'Hadisə yeri yoxlamalarında vaxt qənaəti və ziddiyyət aşkarlama dəqiqliyi.',
    bonus: 'Səviyyə 3+ olduqda araşdırma vaxtı -3 dəq azalır',
    icon: Search,
  },
  {
    key: 'psychology',
    name: 'Psixologiya',
    description: 'Empatiya zamanı daha yüksək etibar qazanma və dəqiq yalan ipucları.',
    bonus: 'Hər cavabda daha aydın mikro-ifadə analizi açır',
    icon: Brain,
  },
  {
    key: 'pressure',
    name: 'Sərt Təzyiq',
    description: 'İttiham zamanı şübhəlinin müdafiəsini sarsıtma və vəkil tələbi riskini azaltma.',
    bonus: 'Səviyyə 3+ təzyiq altında etibar itkisini yumşaldır',
    icon: ShieldAlert,
  },
];

export const TitleMenu: React.FC<TitleMenuProps> = ({
  cases,
  profile,
  onSelectCase,
  onUpgradeSkill,
  onResetProfile,
}) => {
  const [heroImgError, setHeroImgError] = useState(false);
  const [failedCaseImgs, setFailedCaseImgs] = useState<Record<string, boolean>>({});

  const nextUnsolved = cases.find((c) => !profile.solvedCaseIds.includes(c.id)) || cases[0];

  return (
    <main className="pb-20">
      {/* Hero Section */}
      <section className="relative border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0">
          {!heroImgError ? (
            <img
              src={GLOBAL_IMAGES.bakuBackdrop}
              alt="Yağışlı Bakı gecəsində İçərişəhər və Alov Qüllələri"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgError(true)}
              className="w-full h-full object-cover object-center opacity-45"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#141A26] via-[#0B0F17] to-[#1A1410]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F17] via-[#0B0F17]/85 to-[#0B0F17]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-[#0B0F17]/60" />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-end">
          <div className="space-y-6 max-w-2xl">
            <p className="text-xs font-mono tracking-wider text-amber-400">
              Bakı Xüsusi Təhqiqat Bölməsi · 3 Cinayət İşi
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] [text-wrap:balance]">
              Hər cavab bir izdir. Hər saniyə hökmə aparır.
            </h1>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-xl">
              Müasir Bakının qaranlıq küçələrində vaxt məhdudiyyətli istintaq aparın. Hadisə yerindən dəlillər toplayın, şübhəlilərin psixoloji həddini ölçün və həm taktik seçimlər, həm də sərbəst suallarla yalanları üzə çıxarın.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onSelectCase(nextUnsolved.id)}
                className="px-6 py-3 text-sm font-semibold text-[#0B0F17] bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {nextUnsolved.code}: {nextUnsolved.title} — Başla
              </button>
              <a
                href="#cases"
                className="px-5 py-3 text-sm font-medium text-slate-200 border border-white/15 hover:border-white/35 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Bütün İşlərə Bax
              </a>
            </div>
          </div>

          <div className="bg-[#141A26]/90 border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs text-slate-400">Aktiv Müstəntiq</p>
                <p className="text-lg font-semibold text-white">{profile.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Rütbə</p>
                <p className="text-sm font-medium text-amber-400">{profile.rank}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-1">
              <div>
                <p className="text-xs text-slate-400">Həll Edilən</p>
                <p className="font-mono text-2xl font-semibold text-white mt-0.5">
                  {profile.solvedCaseIds.length}/{cases.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Təcrübə (XP)</p>
                <p className="font-mono text-2xl font-semibold text-amber-400 mt-0.5">
                  {profile.xp}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Boş Xal</p>
                <p className="font-mono text-2xl font-semibold text-emerald-400 mt-0.5">
                  {profile.unspentPoints}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Criminal Cases Section */}
      <section id="cases" className="max-w-[1440px] mx-auto px-6 pt-14 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-white">
              Aktiv Cinayət İşləri
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              İstənilən işdən başlaya bilərsiniz. Hər işin öz vaxt balansı və üç müxtəlif şübhəlisi var.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {cases.map((item) => {
            const isSolved = profile.solvedCaseIds.includes(item.id);
            const bestScore = profile.bestScores[item.id];
            const imgFailed = failedCaseImgs[item.id];

            return (
              <article
                key={item.id}
                className="flex flex-col bg-[#141A26] border border-white/10 rounded-xl overflow-hidden hover:border-amber-400/40 transition-colors"
              >
                <div className="relative aspect-[4/3] bg-[#0B0F17] overflow-hidden">
                  {!imgFailed ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedCaseImgs((prev) => ({ ...prev, [item.id]: true }))
                      }
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1C2434] to-[#0B0F17] flex items-center justify-center p-6 text-center">
                      <span className="font-display text-lg text-slate-400">{item.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141A26] via-transparent to-black/20" />
                </div>

                <div className="flex flex-col flex-1 p-6 space-y-4">
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-slate-400">
                    <span className="font-mono text-amber-400">{item.code}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{item.timeBudgetMinutes} dəq</span>
                    {isSolved && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400 font-medium">
                          Bağlandı ({bestScore ?? 0} xal)
                        </span>
                      </>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{item.location}</p>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed flex-1">
                    {item.subtitle}. {item.suspects.length} şübhəli, {item.evidence.length} potensial dəlil.
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {item.incidentTime}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectCase(item.id)}
                      className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-amber-400 hover:text-[#0B0F17] text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isSolved ? 'Yenidən Bax' : 'İşi Aç'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Detective RPG Skills Section */}
      <section id="skills" className="max-w-[1440px] mx-auto px-6 pt-14 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-white">
              Detektiv Bacarıqları (RPG)
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              İstifadə edilməmiş bacarıq xallarınız: <span className="font-mono text-amber-400 font-semibold">{profile.unspentPoints}</span>. Hər bağlanan iş yeni xal qazandırır.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetProfile}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white border border-white/15 hover:border-white/30 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Profili Sıfırla
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {SKILL_META.map((skill) => {
            const Icon = skill.icon;
            const level = profile.skills[skill.key];
            const canUpgrade = profile.unspentPoints > 0 && level < 5;

            return (
              <div
                key={skill.key}
                className="bg-[#141A26] border border-white/10 rounded-xl p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-5 h-5 text-amber-400 shrink-0" />
                      <h3 className="text-base font-semibold text-white">{skill.name}</h3>
                    </div>
                    <span className="font-mono text-sm text-amber-400 font-semibold">
                      Səv. {level}/5
                    </span>
                  </div>

                  {/* Level Bar */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-sm ${
                          step <= level ? 'bg-amber-400' : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">{skill.description}</p>
                  <p className="text-xs text-slate-400">{skill.bonus}</p>
                </div>

                <button
                  type="button"
                  disabled={!canUpgrade}
                  onClick={() => onUpgradeSkill(skill.key)}
                  className={`w-full py-2 px-4 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    canUpgrade
                      ? 'bg-amber-400/15 text-amber-300 border border-amber-400/40 hover:bg-amber-400 hover:text-[#0B0F17] cursor-pointer'
                      : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  {level >= 5 ? 'Maksimum Səviyyə' : canUpgrade ? 'Gücləndir (+1)' : 'Boş Xal Yoxdur'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rules Section */}
      <section id="rules" className="max-w-[1440px] mx-auto px-6 pt-14">
        <div className="bg-[#141A26] border border-white/10 rounded-xl p-6 md:p-8 space-y-6">
          <h2 className="font-display text-2xl font-semibold text-white">
            İstintaq və Dindirmə Qaydaları
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                <Search className="w-4 h-4" />
                <span>01. Hadisə Yerini Yoxlayın</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Hər işdə məhdud vaxt balansınız var. Sol paneldəki "Hadisə Yeri" nöqtələrini araşdıraraq gizli kamera loqlarını, ekspertiza rəylərini və rəqəmsal izləri açın.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                <MessageSquare className="w-4 h-4" />
                <span>02. Hibrid Dindirmə Aparın</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                4 taktik üsuldan birini seçin (Empatiya, Sərt Təzyiq, Məntiqi Tələ, Sübut Göstər) və ya öz sərbəst sualınızı yazın. Etibar 0-a düşərsə şübhəli vəkil tələb edib susar!
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                <Clock className="w-4 h-4" />
                <span>03. Vaxt Bitmədən Hökm Verin</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Şübhəlilərin stres və ziddiyyətlərini izləyin. Vaxtınız bitməzdən əvvəl "İttiham Aktı" bölməsində əsl təqsirkarı, motivi və onu ifşa edən 2 əsas dəlili seçin.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
