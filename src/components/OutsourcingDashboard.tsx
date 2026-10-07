/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  Building2,
  PieChart,
  ShieldCheck
} from 'lucide-react';
import { SubcontractorAnalytics, DashboardSummary } from '../types';

interface OutsourcingDashboardProps {
  summary: DashboardSummary;
  subcontractors: SubcontractorAnalytics[];
  hhiLimit: number;
}

export default function OutsourcingDashboard({
  summary,
  subcontractors,
  hhiLimit
}: OutsourcingDashboardProps) {
  const [selectedSub, setSelectedSub] = useState<SubcontractorAnalytics | null>(null);

  // Focus detail or use the first subcontractor as default
  const activeSub = selectedSub || subcontractors[0];

  const formatKzt = (val: number) => {
    return `${val.toLocaleString()} ₸`;
  };

  // HHI index styling (Herfindahl-Hirschman Index)
  const getHhiSeverity = (hhi: number) => {
    if (hhi < hhiLimit * 0.6) return { label: 'Төмен (Бәсекелі Орта)', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', barColor: 'bg-emerald-500' };
    if (hhi < hhiLimit) return { label: 'Орташа деңгей', color: 'text-amber-600 bg-amber-50 border-amber-100', barColor: 'bg-amber-500' };
    return { label: 'Жоғары Концентрация (Монополиялық Тәуекел)', color: 'text-rose-600 bg-rose-50 border-rose-100', barColor: 'bg-rose-500' };
  };

  const hhiStyle = getHhiSeverity(summary.hhiIndex);

  // Outsource total budget
  const totalOutsource = subcontractors.reduce((sum, s) => sum + s.totalPaid, 0);

  // CR3: үш ең ірі контрагенттің үлесі (төлем сомасы бойынша сұрыпталады)
  const cr3Index = (([...subcontractors].sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 3).reduce((sum, s) => sum + s.totalPaid, 0) / (totalOutsource || 1)) * 100).toFixed(1);

  return (
    <div className="space-y-6" id="outsourcing-dashboard-root">
      {/* TOTAL METRICS BANNER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="outsource-metric-grid">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Жалпы аутсорсинг шығыны
            </span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">
              {formatKzt(summary.totalOutsourceSpend)}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">
              Бекітілген сыртқы келісімшарттар бойынша
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Жекеменшік сектор үлесі
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">
                {summary.privateSharePercent}%
              </span>
              <span className="text-xs text-rose-500 font-semibold font-mono flex items-center">
                <TrendingUp className="w-3.5 h-3.5" />
                Жоғары
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Максимум шегі: 30% аспауы тиіс
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              HHI Концентрациясы
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">
              {summary.hhiIndex}
            </span>
            <span className={`inline-block text-[10px] px-2 py-0.5 mt-1.5 rounded-md border font-semibold ${hhiStyle.color}`}>
              {hhiStyle.label}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Дерек & Акт сәйкессіздігі
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-rose-600 block mt-1">
              {formatKzt(subcontractors.reduce((sum, s) => sum + s.actVsRegistryMismatch, 0))}
            </span>
            <p className="text-[10px] text-rose-400 mt-1">
              Акт-реестр аномалиясы тәуекелі
            </p>
          </div>
        </div>
      </div>

      {/* CORE VISUAL CHARTS AND DETAILED ANALYSIS */}
      {subcontractors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400" id="outsource-empty-state">
          <PieChart className="w-10 h-10 mx-auto stroke-1 mb-3" />
          <p className="text-sm">Осы ұйым бойынша соисполнитель (ТОО) деректері әзірге тіркелмеген.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="outsource-core-visual">
        
        {/* CONTRACTORS REVENUE CONCENTRATION (LEFT/MID) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col" id="contractors-list-card">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Қосалқы орындаушы ТОО (Соисполнители) рейтингі</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Келісімшарт сомасының шоғырлануы мен келіспеушілік аудиттері бойынша тізім</p>
            </div>
            <div className="text-xs font-semibold text-slate-500 bg-white border px-3 py-1 rounded-lg shadow-2xs">
              CR3 Индексі: <b className="text-rose-600 font-mono">
                {cr3Index}%
              </b> (Шек: <span className="font-mono">50%</span>)
            </div>
          </div>

          <div className="p-6 flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse" id="outsource-table">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  <th className="pb-3 pl-2">Мердігер ТОО атауы</th>
                  <th className="pb-3">Категория</th>
                  <th className="pb-3 text-right">Төленген қаржы (₸)</th>
                  <th className="pb-3 text-right">Қызметтер саны</th>
                  <th className="pb-3 text-right">Акт-Реестр айырмасы (₸)</th>
                  <th className="pb-3 text-right pr-2">Қаржы тарту %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {subcontractors.map((sub) => {
                  const percentShare = ((sub.totalPaid / (totalOutsource || 1)) * 100).toFixed(1);
                  const isHighRiskDiff = sub.actVsRegistryMismatch > 500000;

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                        activeSub.id === sub.id ? 'bg-sky-50/40 border-l-2 border-sky-500' : ''
                      }`}
                    >
                      <td className="py-4 pl-2 font-medium text-slate-900 flex items-center gap-2">
                        <Building2 className={`w-4 h-4 shrink-0 ${activeSub.id === sub.id ? 'text-sky-500' : 'text-slate-400'}`} />
                        <span>{sub.name}</span>
                      </td>
                      <td className="py-4">
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">
                          {sub.category === 'Laboratory' && 'Лаборатория'}
                          {sub.category === 'Imaging' && 'КТ/МРТ/Рентген'}
                          {sub.category === 'Clinical' && 'Клиникалық емдеу'}
                          {sub.category === 'Consultation' && 'Кеңес беру / Басқа'}
                        </span>
                      </td>
                      <td className="py-4 text-right font-mono font-medium text-slate-800">
                        {formatKzt(sub.totalPaid)}
                      </td>
                      <td className="py-4 text-right font-mono text-slate-500">
                        {sub.registeredServicesCount.toLocaleString()} қызмет
                      </td>
                      <td className="py-4 text-right">
                        <span className={`font-mono font-semibold ${isHighRiskDiff ? 'text-rose-600' : 'text-slate-500'}`}>
                          {sub.actVsRegistryMismatch > 0 ? `+${formatKzt(sub.actVsRegistryMismatch)}` : '0 ₸'}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-mono text-[11px] font-semibold text-slate-700">{percentShare}%</span>
                          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-sky-500 h-full" style={{ width: `${percentShare}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUBCONTRACTOR RISK INSIGHT (RIGHT) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between" id="contractor-insight-panel">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block">Контрагент Аудиті</span>
              <h4 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                {activeSub.name}
              </h4>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Қаржылық Шоғырлану (HHI қосқан үлесі)</span>
                  <span className="font-mono font-semibold text-slate-800">{activeSub.concentrationIndex}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full" style={{ width: `${activeSub.concentrationIndex}%` }}></div>
                </div>
              </div>

              {/* STATS DETAILS */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Ұйым Категориясы</span>
                  <span className="font-semibold text-slate-700">{activeSub.category}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Жылдық Төлемі (KZT)</span>
                  <span className="font-mono font-bold text-slate-800">{formatKzt(activeSub.totalPaid)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Сапа немесе Экспертиза Бағасы</span>
                  <span className="font-semibold font-mono text-slate-700">{activeSub.qualityScore} / 100</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-400">Акт сәйкессіздік тәуекелі</span>
                  <span className={`font-mono font-bold ${activeSub.actVsRegistryMismatch > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {activeSub.actVsRegistryMismatch > 0 ? formatKzt(activeSub.actVsRegistryMismatch) : 'Сәйкессіздік жоқ'}
                  </span>
                </div>
              </div>

              {/* RISK BULLET WARNINGS */}
              {activeSub.actVsRegistryMismatch > 0 ? (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100/60 text-xs text-rose-700 space-y-1">
                  <div className="font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Күдікті Әрекет Сигналдары Анықталды!
                  </div>
                  <p className="text-[11px] leading-normal mt-1 opacity-90">
                    Акт бойынша бекітілген сома МИС-тегі тіркелім баламасынан көп. Бұл мердігер ТОО-ның қызметтерді қолдан көбейту (приписка) немесе жалған шот-фактура жасау тәуекеліне ұшырауы мүмкін екенін білдіреді. Ішкі тексеріс ұсынылады.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Комплаенс Бақылау Сәтті</span>
                    <p className="text-[10px] leading-relaxed mt-0.5 opacity-90">
                      Актілер мен реестрлер арасында ешқандай қаржылық немесе сандық айырмашылық жоқ. Барлық төлемдер МИС-ке тіркелген.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Кеңес беретін ядро бұйрығы:</span>
            <p className="text-[11px] font-semibold text-slate-700 mt-1">
              {activeSub.concentrationIndex > 30 
                ? "Монополияны шектеу үшін нарыққа басқа зертханаларды (мысалы Олимп, Инвиво) шақырып, CR3 көрсеткішін 50% төмен ауыстыру ұсынылады."
                : "Ағымдағы мердігермен серіктестікті шектеусіз жалғастыра беруге болады."}
            </p>
          </div>
        </div>

      </div>
      )}
    </div>
  );
}
