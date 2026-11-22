import React, { useState } from 'react';
import { X, Gavel, Check, Search } from 'lucide-react';
import { CaseDefinition } from '../types/game';

interface AccusationModalProps {
  activeCase: CaseDefinition;
  discoveredEvidenceIds: string[];
  inspectedNodeIds: string[];
  logicSkill: number;
  onInspectNode: (evidenceId: string, timeCost: number) => void;
  onClose: () => void;
  onSubmitVerdict: (culpritId: string, motiveId: string, evidenceIds: string[]) => void;
}

export const AccusationModal: React.FC<AccusationModalProps> = ({
  activeCase,
  discoveredEvidenceIds,
  inspectedNodeIds,
  logicSkill,
  onInspectNode,
  onClose,
  onSubmitVerdict,
}) => {
  const [culpritId, setCulpritId] = useState<string>(activeCase.suspects[0].id);
  const [motiveId, setMotiveId] = useState<string>(activeCase.motives[0].id);
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);

  const discoveredEvidence = activeCase.evidence.filter((e) =>
    discoveredEvidenceIds.includes(e.id)
  );
  const uninspectedNodes = activeCase.crimeSceneNodes.filter(
    (node) => !inspectedNodeIds.includes(node.id)
  );
  const logicTimeReduction = logicSkill >= 3 ? 3 : 0;

  const toggleEvidence = (id: string) => {
    setSelectedEvidence((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const requiredCount = Math.min(2, discoveredEvidence.length);
  const canSubmit = Boolean(
    culpritId && motiveId && selectedEvidence.length >= requiredCount && requiredCount > 0
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#141A26] border border-white/15 rounded-xl max-w-2xl w-full p-6 md:p-8 space-y-6 my-8">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-mono text-amber-400">{activeCase.code} · Yekun Hökm</p>
            <h2 className="font-display text-2xl font-bold text-white mt-1">
              İttiham Aktını Təqdim Et
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Culprit */}
        <div className="space-y-2.5">
          <label className="text-sm font-semibold text-white block">
            1. Əsas Təqsirkar Şübhəli
          </label>
          <div className="grid sm:grid-cols-3 gap-2.5">
            {activeCase.suspects.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCulpritId(s.id)}
                className={`p-3 text-left rounded-lg border transition-colors cursor-pointer ${
                  culpritId === s.id
                    ? 'bg-amber-400/15 border-amber-400 text-white'
                    : 'bg-[#0B0F17] border-white/10 text-slate-300 hover:border-white/25'
                }`}
              >
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.role}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Motive */}
        <div className="space-y-2.5">
          <label className="text-sm font-semibold text-white block">
            2. Cinayətin Əsas Motivi
          </label>
          <div className="space-y-2">
            {activeCase.motives.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMotiveId(m.id)}
                className={`w-full p-3 text-left rounded-lg border transition-colors text-sm cursor-pointer ${
                  motiveId === m.id
                    ? 'bg-amber-400/15 border-amber-400 text-white'
                    : 'bg-[#0B0F17] border-white/10 text-slate-300 hover:border-white/25'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: 2 Key Evidences */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white">
              3. Təqsiri Sübut Edən 2 Əsas Dəlil
            </label>
            <span className="font-mono text-xs text-amber-400">
              {selectedEvidence.length}/{requiredCount} seçilib
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
            {discoveredEvidence.map((ev) => {
              const selected = selectedEvidence.includes(ev.id);
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => toggleEvidence(ev.id)}
                  className={`p-3 text-left rounded-lg border transition-colors flex items-start gap-2.5 cursor-pointer ${
                    selected
                      ? 'bg-emerald-950/40 border-emerald-400 text-white'
                      : 'bg-[#0B0F17] border-white/10 text-slate-300 hover:border-white/25'
                  }`}
                >
                  <span
                    className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 ${
                      selected
                        ? 'bg-emerald-400 border-emerald-400 text-[#0B0F17]'
                        : 'border-white/30'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">{ev.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {ev.summary}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {uninspectedNodes.length > 0 && (
            <div className="p-3 rounded-lg bg-[#0B0F17]/80 border border-white/10 space-y-2">
              <p className="text-xs text-slate-400">
                Yoxlanılmamış hadisə yeri zonaları ({uninspectedNodes.length} ədəd qalıb — birbaşa buradan yoxlaya bilərsiniz):
              </p>
              <div className="flex flex-wrap gap-2">
                {uninspectedNodes.map((node) => {
                  const cost = Math.max(5, node.timeCostMinutes - logicTimeReduction);
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => onInspectNode(node.unlocksEvidenceId, cost)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-white/10 hover:bg-amber-400 hover:text-[#0B0F17] text-slate-200 rounded-md transition-colors cursor-pointer"
                    >
                      <Search className="w-3 h-3" />
                      <span>{node.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-white/15 rounded-lg cursor-pointer"
          >
            Dindirməyə Qayıt
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onSubmitVerdict(culpritId, motiveId, selectedEvidence)}
            className="px-5 py-2 text-sm font-semibold bg-amber-400 hover:bg-amber-300 disabled:bg-white/10 disabled:text-slate-500 text-[#0B0F17] rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Gavel className="w-4 h-4" />
            <span>Hökmü Təsdiqlə</span>
          </button>
        </div>
      </div>
    </div>
  );
};
