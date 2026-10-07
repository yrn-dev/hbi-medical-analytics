/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Check,
  Info,
  Sliders
} from 'lucide-react';
import { AnalysisThresholds, DEFAULT_THRESHOLDS } from '../mockData';

interface SettingsPanelProps {
  thresholds: AnalysisThresholds;
  onUpdateThresholds: (newThresholds: AnalysisThresholds) => void;
}

export default function SettingsPanel({
  thresholds,
  onUpdateThresholds
}: SettingsPanelProps) {
  const [localThresholds, setLocalThresholds] = useState<AnalysisThresholds>({ ...thresholds });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateThresholds(localThresholds);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-4xl mx-auto space-y-6" id="settings-panel-root">
      
      {/* CARD HEADER */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-800">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Тәуекел критерилері және Сүзгі баптаулары (Compliance Thresholds)</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Сараптамалық алгоритмдерді реттейтін шекті деңгейлер мен заңдылық параметрлері</p>
          </div>
        </div>

        {isSaved && (
          <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5 animate-bounce">
            <Check className="w-3.5 h-3.5" />
            Баптаулар сақталды!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* COMPLIANCE CORE SLIDERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3.5">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-sky-500" />
                Қаржылық және Аутсорсинг Сүзгілері
              </span>

              <div className="space-y-2">
                <div className="flex justify-between font-medium">
                  <label className="text-slate-600">Шекті Аутсорсинг үлесі (%):</label>
                  <span className="font-mono text-slate-900 font-bold">{localThresholds.outsourceShareMax}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={localThresholds.outsourceShareMax}
                  onChange={(e) => setLocalThresholds({ ...localThresholds, outsourceShareMax: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <p className="text-[9px] text-slate-400">Емхананың бюджетіндегі сыртқы соисполнительдердің рұқсат етілген жоғары үлесі.</p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between font-medium">
                  <label className="text-slate-600">Монополиялық HHI шегі:</label>
                  <span className="font-mono text-slate-900 font-bold">{localThresholds.hhiConcentrationLimit} индексі</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="6000"
                  step="100"
                  value={localThresholds.hhiConcentrationLimit}
                  onChange={(e) => setLocalThresholds({ ...localThresholds, hhiConcentrationLimit: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <p className="text-[9px] text-slate-400">Herfindahl-Hirschman индексі. 2500 жоғары көрсеткіш монополия қауіпін білдіреді.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3.5">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Клиникалық Фрод (Приписка) Тексерісі
              </span>

              <div className="space-y-2">
                <div className="flex justify-between font-medium">
                  <label className="text-slate-600">Дәрігердің күнделікті макс қабылдауы:</label>
                  <span className="font-mono text-slate-900 font-bold">{localThresholds.maxDailyServicesPerDoctor} қызмет</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={localThresholds.maxDailyServicesPerDoctor}
                  onChange={(e) => setLocalThresholds({ ...localThresholds, maxDailyServicesPerDoctor: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <p className="text-[9px] text-slate-400">Бір орындаушы дәрігердің тәулігіне тіркей алатын максималды физикалық қызмет шегі.</p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between font-medium">
                  <label className="text-slate-600">Сындық Жабдық Downtime шегі (күн):</label>
                  <span className="font-mono text-slate-900 font-bold">{localThresholds.criticalDowntimeDays} күн</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  value={localThresholds.criticalDowntimeDays}
                  onChange={(e) => setLocalThresholds({ ...localThresholds, criticalDowntimeDays: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <p className="text-[9px] text-slate-400">Жабдықтың жұмысқа жарамсыз болып тұру шегі. Асса автоматты қызыл дабыл береді.</p>
              </div>
            </div>
          </div>

        </div>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3 text-xs text-amber-900">
          <Info className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="leading-relaxed text-[11px]">
            <b>Мән беруіңізді сұраймыз:</b> Шекті деңгейлерді өзгерту жүйедегі барлық аудит картасы мен Тәуекел дашбордының түсіне (жасыл, сары, қызыл) тікелей әсер етеді. Бұл баптаулар тек <b>System Admin</b> және <b>Medical Organization Admin</b> рөлдері үшін қолжетімді.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => setLocalThresholds({ ...DEFAULT_THRESHOLDS })}
            className="px-5 py-2.5 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 text-slate-600 cursor-pointer text-xs"
          >
            Әдепкі (Ресми) деңгейге қайтару
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-950 text-white font-semibold rounded-xl hover:bg-slate-900 cursor-pointer text-xs"
          >
            Өзгерістерді Сақтау
          </button>
        </div>

      </form>
    </div>
  );
}
