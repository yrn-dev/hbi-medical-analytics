/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { EquipmentItem, RoiPlannerItem } from '../types';

interface EquipmentDashboardProps {
  equipment: EquipmentItem[];
  roiPlanner: RoiPlannerItem[];
  onAddRoiCandidate?: (item: RoiPlannerItem) => void;
}

export default function EquipmentDashboard({
  equipment,
  roiPlanner,
  onAddRoiCandidate
}: EquipmentDashboardProps) {
  // Interactive calc state
  const [calcName, setCalcName] = useState('Маммограф СР-56');
  const [calcOutsourcePrice, setCalcOutsourcePrice] = useState(2500000);
  const [calcPurchasePrice, setCalcPurchasePrice] = useState(22000000);
  const [calcRunCost, setCalcRunCost] = useState(450000);

  const [calcResult, setCalcResult] = useState<{
    payback: number;
    yearlySavings: number;
    recommendation: 'internalize' | 'lease' | 'keep_outsource';
  } | null>(null);
  const [calcSaved, setCalcSaved] = useState(false);

  const formatKzt = (val: number) => {
    return `${val.toLocaleString()} ₸`;
  };

  const getEquipmentStatusTheme = (status: EquipmentItem['status']) => {
    switch (status) {
      case 'usable':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'downtime':
        return 'bg-red-50 text-red-700 border-red-100 font-semibold animate-pulse';
      case 'repair_needed':
        return 'bg-orange-50 text-orange-700 border-orange-100 font-semibold';
      case 'broken':
        return 'bg-red-50 text-red-700 border-red-100 font-semibold animate-pulse';
      case 'decommissioned':
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getEquipmentStatusLabel = (status: EquipmentItem['status']) => {
    switch (status) {
      case 'usable': return 'Жұмыс істеп тұр';
      case 'warning': return 'Техникалық бақылауда';
      case 'downtime': return 'Downtime (Күтілуде)';
      case 'repair_needed': return 'Жөндеу қажет';
      case 'broken': return 'Жұмыс істемейді (Ақаулы)';
      case 'decommissioned': return 'Есептен шығарылған';
    }
  };

  // Run dynamic calculation
  const handleCalculateRoi = (e: React.FormEvent) => {
    e.preventDefault();
    const monthlyNetSaving = calcOutsourcePrice - calcRunCost;
    if (monthlyNetSaving <= 0) {
      setCalcResult({
        payback: 999,
        yearlySavings: 0,
        recommendation: 'keep_outsource'
      });
      setCalcSaved(false);
      return;
    }

    const payback = parseFloat((calcPurchasePrice / monthlyNetSaving).toFixed(1));
    const yearlySavings = monthlyNetSaving * 12;

    let recommendation: 'internalize' | 'lease' | 'keep_outsource' = 'internalize';
    if (payback > 48) {
      recommendation = 'keep_outsource';
    } else if (payback > 18) {
      recommendation = 'lease';
    }

    setCalcResult({
      payback,
      yearlySavings,
      recommendation
    });
    setCalcSaved(false);
  };

  const handleSaveRoiCandidate = () => {
    if (!onAddRoiCandidate || !calcResult || calcSaved) return;
    onAddRoiCandidate({
      id: `roi-custom-${Date.now()}`,
      equipmentName: calcName.trim() || 'Аталмаған құрылғы',
      category: 'Қолмен есептелді',
      monthlyOutsourceCost: calcOutsourcePrice,
      internalPurchasePrice: calcPurchasePrice,
      monthlyInternalRunningCost: calcRunCost,
      projectedMonthlyVolume: 0,
      paybackPeriodMonths: calcResult.payback === 999 ? 0 : calcResult.payback,
      avoidedSpendYearly: calcResult.yearlySavings,
      recommendation: calcResult.recommendation
    });
    setCalcSaved(true);
  };

  return (
    <div className="space-y-6" id="equipment-dashboard-root">
      
      {/* SECTIONS GRID: REGISTER AND CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MEDICAL EQUIPMENT REGISTRY (LEFT/MID) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]" id="equipment-list-card">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center bg-white">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Медициналық және Техникалық Құрал-жабдықтар Реестрі</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Емхананың негізгі активтері мен тозу және жөндеу (Downtime) бақылау балансы</p>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              {equipment.map((eq) => {
                const isCritDowntime = eq.downtimeDays > 30 && (eq.status === 'downtime' || eq.status === 'broken');
                return (
                  <div key={eq.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 border rounded uppercase font-semibold font-mono ${getEquipmentStatusTheme(eq.status)}`}>
                          {getEquipmentStatusLabel(eq.status)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ИНВ №: {eq.inventoryNo}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{eq.name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-medium">
                        <span>Бөлім: <b className="text-slate-700">{eq.department}</b></span>
                        <span>Орнатылған жылы: <b className="text-slate-700">{eq.purchaseYear}</b></span>
                        <span>Тозу деңгейі: <b className={eq.depreciationPercent >= 80 ? 'text-red-500' : 'text-slate-700'}>{eq.depreciationPercent}%</b></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-50 pt-2 sm:pt-0">
                      <div className="text-left sm:text-right text-xs">
                        <span className="text-slate-400 text-[10px] block font-medium">Жөндеу саны</span>
                        <span className="font-mono font-bold text-slate-800">{eq.repairCount || '0'} рет</span>
                      </div>
                      <div className="text-left sm:text-right text-xs">
                        <span className="text-slate-400 text-[10px] block font-medium">Тоқтап тұруы (Downtime)</span>
                        <span className={`font-mono font-bold ${isCritDowntime ? 'text-red-600' : 'text-slate-800'}`}>
                          {eq.downtimeDays ? `${eq.downtimeDays} күн` : 'Тұрақты'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ROI INVESTMENT PLANNER CALCULATOR (RIGHT) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between" id="roi-planner-investor">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block">Инвестициялық жоспарлаушы</span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
                  Outsource vs Buy ROI есептеуіші
                </h4>
              </div>
            </div>

            <form onSubmit={handleCalculateRoi} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 block">Құрылғы / Қызмет атауы:</label>
                <input
                  type="text"
                  value={calcName}
                  onChange={(e) => setCalcName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 block font-medium">Айына қосалқы орындауға кететін шығыс (₸):</label>
                <input
                  type="number"
                  value={calcOutsourcePrice}
                  onChange={(e) => setCalcOutsourcePrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 block font-medium">Құрал-жабдық сатып алу құны (₸):</label>
                <input
                  type="number"
                  value={calcPurchasePrice}
                  onChange={(e) => setCalcPurchasePrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 block font-medium">Айлық ішкі күту және қызметкер шығыны (₸):</label>
                <input
                  type="number"
                  value={calcRunCost}
                  onChange={(e) => setCalcRunCost(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 border hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors mt-2 cursor-pointer text-xs"
              >
                Тиімділікті есептеу
              </button>
            </form>

            {/* INTERACTIVE CALCULATION REPORT */}
            {calcResult && (
              <div className="bg-sky-50/55 rounded-xl p-4 border border-sky-100/50 space-y-3 mt-4 animate-fade-in">
                <span className="text-[10px] font-bold text-sky-900 uppercase tracking-widest block">Шешім жобасы</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs border-b border-sky-100/40 pb-2.5">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Ақталу мерзімі:</span>
                    <span className="font-mono font-bold text-slate-800">{calcResult.payback === 999 ? 'Шексіз' : `${calcResult.payback} ай`}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Жылдық үнемдеуі:</span>
                    <span className="font-mono font-bold text-emerald-600">+{formatKzt(calcResult.yearlySavings)}</span>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-slate-400 text-[10px] block">Ұсынылатын инвестиция типі:</span>
                  <span className="font-bold text-slate-800 block mt-0.5">
                    {calcResult.recommendation === 'internalize' && 'Ішкі сатып алу (Internalize Kandidat)'}
                    {calcResult.recommendation === 'lease' && 'Қаржылық Лизинг (Highly Leaseable)'}
                    {calcResult.recommendation === 'keep_outsource' && 'Аутсорсингте қалдыру тиімді'}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    {calcResult.recommendation === 'internalize' && 'Бұл өріс өте тиімді екенін көрсетеді. Сатып алу арқылы сыртқа кететін ТОО пайдасын емхананың ішкі қорына үнемдей аласыз.'}
                    {calcResult.recommendation === 'lease' && 'Сатып алу құны өте жоғары болса, технологиялық лизинг арқылы айлық үлестік пайызбен сатып алған дұрыс.'}
                    {calcResult.recommendation === 'keep_outsource' && 'Бұл құрылғыны өзімізге қымбат КТ/МРТ сатып алып сақтағанша, сыртқы ТОО соисполнитель арқылы орындатқан әлдеқайда арзан.'}
                  </p>
                </div>

                {onAddRoiCandidate && (
                  <button
                    type="button"
                    onClick={handleSaveRoiCandidate}
                    disabled={calcSaved}
                    className={`w-full py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      calcSaved
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {calcSaved ? 'ROI жоспарына қосылды' : 'ROI жоспарына қосу'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
