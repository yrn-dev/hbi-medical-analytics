/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { DataQualityReport } from '../types';
import { ICD10_DICTIONARY, SERVICE_CODES_DICTIONARY } from '../mockData';

interface DataQualityDashboardProps {
  report: DataQualityReport;
}

export default function DataQualityDashboard({ report }: DataQualityDashboardProps) {

  const getDqBadge = (rate: number) => {
    if (rate >= 95) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    if (rate >= 85) return 'text-amber-700 bg-amber-50 border-amber-100';
    return 'text-rose-700 bg-rose-50 border-rose-100 animate-pulse';
  };

  return (
    <div className="space-y-6" id="data-quality-root">
      
      {/* SCORES AND METRIC BLOCK GAUGE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="dq-scorecards-grid">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Дерек Тұтастығы (Completeness)</span>
          <div>
            <span className="text-3xl font-mono font-bold text-slate-900 block">{report.completenessRate}%</span>
            <span className={`inline-block text-[9px] px-2 py-0.5 rounded border mt-2 font-semibold ${getDqBadge(report.completenessRate)}`}>
              {report.completenessRate >= 95 ? 'Жоғары Тазалық' : 'Орташа Бөлік'}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Анықтамалық сәйкестік (Match Rate)</span>
          <div>
            <span className="text-3xl font-mono font-bold text-sky-600 block">{report.matchingRate}%</span>
            <span className={`inline-block text-[9px] px-2 py-0.5 rounded border mt-2 font-semibold ${getDqBadge(report.matchingRate)}`}>
              Сөздіктермен байланысуы
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Дубликатты жолдар (Duplicate Rate)</span>
          <div>
            <span className={`text-3xl font-mono font-bold block ${report.duplicateRate > 3 ? 'text-rose-600' : 'text-slate-900'}`}>
              {report.duplicateRate}%
            </span>
            <p className="text-[9px] text-slate-400 mt-2">
              Шектеу: &lt; 2% болуы тиіс
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Қате МКБ-10 кодтары саны</span>
          <div>
            <span className={`text-3xl font-mono font-bold block ${report.invalidMkb10Count > 50 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
              {report.invalidMkb10Count} қате
            </span>
            <p className="text-[9px] text-slate-400 mt-2">
              Табылмаған диагноздар
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dq-dictionaries-and-audit">
        
        {/* ICD-10 AND SERVICES DICTIONARIES PREVIEW (LEFT/MID) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Жүйелік анықтамалықтар (Master Dictionaries)</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">МКБ-10 Халықаралық аурулар тізімі және Мемлекеттік қызметтер тізбесі</p>
            </div>
            <BookOpen className="w-4 h-4 text-slate-600" />
          </div>

          <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 custom-scrollbar">
            {/* ICD-10 LIST */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b pb-1">МКБ-10 анықтамалығы (ICD-10)</span>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 text-xs custom-scrollbar">
                {ICD10_DICTIONARY.map((d) => (
                  <div key={d.code} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col space-y-1">
                    <span className="font-mono text-sky-600 font-bold">{d.code}</span>
                    <p className="text-slate-600 text-[11px] leading-tight font-medium">{d.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SERVICE VALUES CODES */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b pb-1">Медициналық қызметтер кодтары</span>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 text-xs custom-scrollbar">
                {SERVICE_CODES_DICTIONARY.map((s) => (
                  <div key={s.code} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col space-y-1">
                    <span className="font-mono text-purple-600 font-bold">{s.code}</span>
                    <p className="text-slate-600 text-[11px] leading-tight font-medium">{s.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AUDIT QUALITY WARNING SUMMARY */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between" id="dq-warning-summary">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block">Деректер сапасы аудиті</span>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              Автоматты тазарту қорытындысы
            </h4>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-50 space-y-2 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Құбырлық тексеріс параметрлері (Pipeline Logs)</span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>Сәйкестендірілмеген өріс:</span>
                    <span className="font-mono font-semibold text-slate-800">{report.unmappedFieldsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Аутлиерлер (Шектен тыс ауытқу):</span>
                    <span className="font-mono font-semibold text-slate-800">{report.outlierCount} жол</span>
                  </div>
                </div>
              </div>

              {report.duplicateRate > 2 || report.invalidMkb10Count > 10 ? (
                <div className="p-3.5 rounded-xl bg-orange-50 text-orange-800 border border-orange-100 space-y-1 text-[11px]">
                  <span className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Күдікті дерек ауытқулары
                  </span>
                  <p className="leading-normal">
                    Тіркелген жолдардың арасында МКБ-10 кодтарына сәйкес келмейтін немесе бос мәні бар жолдар бар. Осының кесірінен ӘМСҚ аудиттерінде айыппұл салу дефектілері туындауы мүмкін. Келісімшарттарды field mapping арқылы қайта қараңыз.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-start gap-2 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Сәтті Дерек Дәрежесі</span>
                    <p className="leading-relaxed mt-0.5 opacity-95">Дерек деңгейі жоғары комплаенс деңгейіне ие. Тазарту сәтті аяқталды.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3.5 mt-4 text-[10px] text-slate-400 font-medium">
            Жүйе деректерді өңдеу және қазақшаландыруды ӘМСҚ (ФСМС) талаптарына сәйкес жүргізеді.
          </div>
        </div>

      </div>
    </div>
  );
}
