/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  User,
  Users,
  Search,
  Check,
  X,
  DollarSign
} from 'lucide-react';
import { FraudCase } from '../types';
import { AnalysisThresholds } from '../mockData';

interface FraudDashboardProps {
  cases: FraudCase[];
  onUpdateCaseStatus: (id: string, status: FraudCase['status'], notes?: string) => void;
  thresholds: AnalysisThresholds;
}

export default function FraudDashboard({
  cases,
  onUpdateCaseStatus,
  thresholds
}: FraudDashboardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'investigating' | 'approved' | 'dismissed'>('all');
  const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);
  const [auditorComments, setAuditorComments] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const formatKzt = (val: number) => {
    return `${val.toLocaleString()} ₸`;
  };

  const getSeverityBadge = (sev: FraudCase['severity']) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200 font-bold';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200 font-semibold';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusBadge = (status: FraudCase['status']) => {
    switch (status) {
      case 'new':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'investigating':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'approved':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'dismissed':
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusTranslation = (status: FraudCase['status']) => {
    switch (status) {
      case 'new': return 'Жаңа сигнал';
      case 'investigating': return 'Тексерілуде';
      case 'approved': return 'Расталды (Фрод)';
      case 'dismissed': return 'Жабылды (Тәуекел жоқ)';
    }
  };

  // Filter cases based on status tabs and search
  const filteredCases = cases.filter(c => {
    const matchesTab = activeTab === 'all' || c.status === activeTab;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const activeCase = selectedCase || filteredCases[0];

  const handleUpdateStatus = (status: FraudCase['status']) => {
    if (!activeCase) return;
    onUpdateCaseStatus(activeCase.id, status, auditorComments || undefined);
    setAuditorComments('');
    // Update local visual selections
    const updated = { ...activeCase, status, notes: auditorComments || activeCase.notes };
    setSelectedCase(updated);
  };

  // Aggregated risk counts
  const pendingFin = cases.filter(c => c.status === 'new').reduce((sum, c) => sum + c.flaggedAmount, 0);
  const totalAnomalies = cases.length;

  return (
    <div className="space-y-6" id="fraud-dashboard-root">
      
      {/* SUMMARIZED ANOMALY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="fraud-anomalies-stats">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Қауіпті аномалиялар саны</span>
            <span className="text-xl font-bold font-mono text-slate-900 block mt-0.5">{totalAnomalies} белгі (Сигнал)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Тіркелген Жалпы Фрод Сомасы</span>
            <span className="text-xl font-bold font-mono text-amber-600 block mt-0.5">
              {formatKzt(cases.reduce((sum, c) => sum + c.flaggedAmount, 0))}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Жаңа тексерудегі резерв сома</span>
            <span className="text-xl font-bold font-mono text-indigo-600 block mt-0.5">{formatKzt(pendingFin)}</span>
          </div>
        </div>
      </div>

      {/* FILTER & CASE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="fraud-workspace">
        
        {/* CASES DIRECTORY (LEFT/MID) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[550px]" id="fraud-directory-card">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Тәуекелдер мен Аномалияларды сараптау тіркелімі</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-sans">МИС және тарифтік реестр сынықтары негізінде есептелген фрод алгоритмі · Дубликат терезесі: {thresholds.duplicateTimeframeMinutes} мин</p>
              </div>

              {/* SEARCH INPUT */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Іздеу (Дәрігер, код, ЖСН)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl text-xs pl-9 pr-4 py-2 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* STATUS FILTER TABS */}
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
              <button
                onClick={() => { setActiveTab('all'); setSelectedCase(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeTab === 'all' ? 'bg-slate-950 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-100'
                }`}
              >
                Барлығы ({cases.length})
              </button>
              <button
                onClick={() => { setActiveTab('new'); setSelectedCase(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeTab === 'new' ? 'bg-red-500 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-100'
                }`}
              >
                Жаңа Сигналдар ({cases.filter(c => c.status === 'new').length})
              </button>
              <button
                onClick={() => { setActiveTab('investigating'); setSelectedCase(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeTab === 'investigating' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-100'
                }`}
              >
                Тексеріліп жатқандар ({cases.filter(c => c.status === 'investigating').length})
              </button>
              <button
                onClick={() => { setActiveTab('approved'); setSelectedCase(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeTab === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-100'
                }`}
              >
                Расталғандар ({cases.filter(c => c.status === 'approved').length})
              </button>
              <button
                onClick={() => { setActiveTab('dismissed'); setSelectedCase(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeTab === 'dismissed' ? 'bg-slate-600 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-100'
                }`}
              >
                Жабылғандар ({cases.filter(c => c.status === 'dismissed').length})
              </button>
            </div>
          </div>

          {/* CASE LIST SPREADSHEET */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {filteredCases.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-8 text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2 stroke-1" />
                <h4 className="font-semibold text-slate-800 text-sm">Таза Жүйе</h4>
                <p className="text-xs max-w-sm mt-1">Осы категория бойынша ешқандай фрод немесе аномальді клиникалық белгілер табылған жоқ.</p>
              </div>
            ) : (
              filteredCases.map((c) => {
                const isSelected = activeCase && activeCase.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-4 hover:bg-slate-50/50 transition-colors cursor-pointer flex justify-between items-start gap-4 ${
                      isSelected ? 'bg-sky-50/40 border-l-3 border-sky-500' : ''
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{c.code}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded border uppercase ${getSeverityBadge(c.severity)}`}>
                          {c.severity === 'critical' ? 'Сыни' : c.severity === 'high' ? 'Жоғары' : c.severity === 'medium' ? 'Орташа' : 'Төмен'}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${getStatusBadge(c.status)}`}>
                          {getStatusTranslation(c.status)}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 leading-snug truncate">
                        {c.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {c.doctorName}
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className="font-mono text-xs font-bold text-slate-950">{formatKzt(c.flaggedAmount)}</span>
                      <span className="text-[9px] text-slate-400 font-mono block">{c.detectedAt.split(' ')[0]}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COMPLIANCE WORKFLOW INVESTIGATOR PANEL (RIGHT) */}
        {activeCase ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between" id="fraud-compliance-card">
            <div className="space-y-5 flex-1">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-mono text-slate-400">КЕЙС ID: {activeCase.id}</span>
                  <span className={`font-semibold px-2 py-0.5 rounded uppercase ${getSeverityBadge(activeCase.severity)}`}>
                    Басымдық: {activeCase.severity}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2 leading-relaxed">
                  {activeCase.title}
                </h4>
              </div>

              {/* DETRACTORS INFO */}
              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Нысаналы Тараптар</span>
                  <div className="space-y-1.5 text-slate-700 leading-normal">
                    <p className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {activeCase.doctorName}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {activeCase.department}
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] font-mono mt-1 pt-1 border-t border-slate-200/50">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      ЖСН / Пациент: {activeCase.patientId}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block pb-0.5">Сипаттамасы мен Ереже мағынасы:</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {activeCase.description}
                  </p>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-xs text-slate-600">
                  <span>Тәуекелде тұрған Мемлекеттік қор сомасы:</span>
                  <b className="font-mono text-slate-900 font-bold">{formatKzt(activeCase.flaggedAmount)}</b>
                </div>

                {activeCase.notes && (
                  <div className="bg-sky-50/50 border border-sky-100/60 p-3 rounded-xl text-[11px] text-sky-900 space-y-1 leading-normal">
                    <span className="font-bold">Аудитордың соңғы комментариі:</span>
                    <p>{activeCase.notes}</p>
                  </div>
                )}
              </div>

              {/* ACTION FORM */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Шешім қабылдау & Акт жазу:</span>
                <textarea
                  placeholder="Тексеріс қорытындысы немесе бұйрық нөмірі мен комментариін жазыңыз..."
                  value={auditorComments}
                  onChange={(e) => setAuditorComments(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:border-sky-500 focus:outline-none min-h-[70px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => handleUpdateStatus('dismissed')}
                className="py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
                Фрод Емес (Жабу)
              </button>
              <button
                onClick={() => handleUpdateStatus('approved')}
                className="py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Фрод Расталды (Айыппұл салу)
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 text-center flex flex-col justify-center items-center h-[550px] text-slate-400">
            <ShieldAlert className="w-10 h-10 stroke-1 mb-2" />
            <p className="text-xs max-w-xs">Тәуекел аудиті мен шешім қабылдау үшін сол жақтағы кейстердің бірін таңдаңыз.</p>
          </div>
        )}

      </div>
    </div>
  );
}
