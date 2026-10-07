/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  UserCheck,
  UserX,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { StaffAnalytics } from '../types';
import { AnalysisThresholds } from '../mockData';

interface HrDashboardProps {
  hrData: StaffAnalytics;
  thresholds: AnalysisThresholds;
}

export default function HrDashboard({ hrData, thresholds }: HrDashboardProps) {
  const total = hrData.totalPositions || 1;
  const vacancyPercent = ((hrData.vacanciesCount / total) * 100).toFixed(1);
  const fillRatePercent = ((hrData.filledPositions / total) * 100).toFixed(1);
  // Декретте жүргендер штатта бойлайды, бірақ бөлімшеден уақытша айырылған
  const activeFilled = Math.max(0, hrData.filledPositions - hrData.maternityLeaveCount);
  const activeFillPercent = ((activeFilled / total) * 100).toFixed(1);
  const maternityPercent = ((hrData.maternityLeaveCount / total) * 100).toFixed(1);

  // Load level check
  const getLoadLevel = (load: number) => {
    if (load <= 25) return { label: 'Оңтайлы Слот (Орташа)', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
    if (load <= 35) return { label: 'Қалыпты Жүктеме', color: 'text-sky-700 bg-sky-50 border-sky-100' };
    return { label: 'Өте Көп (Персонал Шаршау Қауіпі)', color: 'text-red-700 bg-red-50 border-red-100 animate-pulse' };
  };

  const loadStatus = getLoadLevel(hrData.loadFactor);

  return (
    <div className="space-y-6" id="hr-dashboard-root">
      
      {/* STATS HIGHLIGHTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="hr-stats-grid">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Ресми Штаттық Бірліктер</span>
            <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-slate-900 block">{hrData.totalPositions.toFixed(1)} ставка</span>
            <p className="text-[10px] text-slate-400 mt-1">Оның ішінде {hrData.filledPositions.toFixed(1)} ставка толық</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Бос орындар (Вакант) үлесі</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-rose-600 block">{vacancyPercent}%</span>
            <p className="text-[10px] text-rose-400 mt-1">Бос лауазымдар саны: {hrData.vacanciesCount} ставка</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Декреттік лауазымдар (Жүктілік)</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-purple-600 block">{hrData.maternityLeaveCount} маман</span>
            <p className="text-[10px] text-slate-400 mt-1">Уақытша бос орындар, ауыстыру шешімі қажет</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Зейнетке шығу тәуекелі (1 жылда)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-amber-600 block">{hrData.retirementRiskCount} маман</span>
            <p className="text-[10px] text-amber-500 mt-1">Шек: Ерлер &gt; {thresholds.retirementAgeMen} ж, Әйелдер &gt; {thresholds.retirementAgeWomen} ж</p>
          </div>
        </div>
      </div>

      {/* DETAILED ANALYTIC VISUALIZERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="hr-detailed-layouts">
        
        {/* CRITICAL SPECIALIST SHORTAGE LIST (LEFT/MID) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="hr-shortage-card">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-900 text-sm">Сыни мамандықтар жетіспеушілігі (Critical Specialists Ranking)</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Келісімшарттық және МИС жазылулары бойынша ең жоғары күту уақыты бар дәрігерлер тізімі</p>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hrData.criticalSpecialistsNeeded.map((spec, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/40 flex items-center justify-between hover:border-slate-300 transition-colors">
                  <div className="space-y-1">
                    <span className="bg-rose-50 text-rose-700 text-[10px] font-semibold px-2 py-0.5 rounded uppercase">тапшылық</span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{spec.specialty}</h4>
                    <p className="text-[10px] text-slate-400">Ұсынылатын ресми тарифтік ставка: 1.5 - 2.0 ставка</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-rose-600">{spec.count}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">қажет бірлік</span>
                  </div>
                </div>
              ))}
            </div>

            {/* DEMOGRAPHICS GAUGE IN KAZAKH */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700">Штаттық деңгейдің толу үлесі (Staff-to-Filled Rate)</span>
                <span className="font-mono text-sky-600 text-sm">{fillRatePercent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                <div className="bg-sky-500 h-full" style={{ width: `${activeFillPercent}%` }}></div>
                <div className="bg-purple-300 h-full" style={{ width: `${maternityPercent}%` }} title="Декрет"></div>
                <div className="bg-red-300 h-full" style={{ width: `${vacancyPercent}%` }} title="Бос ставкалар"></div>
              </div>
              <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5"><b className="w-2.5 h-2.5 rounded-sm bg-sky-500"></b> Белсенді жұмыста: {activeFillPercent}%</span>
                <span className="flex items-center gap-1.5"><b className="w-2.5 h-2.5 rounded-sm bg-purple-300"></b> Декретке кеткен ставка: {maternityPercent}%</span>
                <span className="flex items-center gap-1.5"><b className="w-2.5 h-2.5 rounded-sm bg-red-300"></b> Бос лауазым (Вакант): {vacancyPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* WORKLOAD BALANCING DETAILS (RIGHT) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between" id="hr-workload-card">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block">Операциялық Жүктеме Аудиті</span>
              <h4 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                Пациент-Слот жүктемесі
              </h4>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <span className="text-slate-500 text-[11px] block">Орташа күнделікті қабылдау саны:</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-mono font-bold text-slate-900">{hrData.loadFactor} қабылдау</span>
                  <span className={`text-[10px] px-2.5 py-1 rounded border font-semibold ${loadStatus.color}`}>
                    {loadStatus.label}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Резервтегі кадрлық тәуекелдер:</span>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Зейнеткер зейнет жасы:</span>
                  <span className="font-semibold text-slate-800">Ерлер {thresholds.retirementAgeMen} / Әйелдер {thresholds.retirementAgeWomen} жыл</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Зейнетке кетуші ставка салмағы:</span>
                  <span className="font-mono font-semibold text-rose-600">- {hrData.retirementRiskCount} маман</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Болашақ Жетіспеушілік:</span>
                  <span className="font-semibold text-amber-600">Орташа Жоғары деңгей</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6 bg-slate-50/50 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">HR Комплаенс кеңесі:</span>
            <p className="text-[11px] font-semibold text-slate-700 leading-normal">
              Зейнетке жақындаған {hrData.retirementRiskCount} қызметкерді ауыстыру мақсатында жас резиденттерді 'Резидентура грантымен' тарту бағдарламасын белсендіру қажет. Декреттік ставкаларға уақытша мерзімді келісімшартпен (конкурссыз) мамандар бекіту ұсынылады.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
