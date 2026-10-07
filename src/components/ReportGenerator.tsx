/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Printer,
  Copy,
  AlertTriangle,
  FileText,
  Activity,
  Check
} from 'lucide-react';
import { DashboardSummary, FraudCase, EquipmentItem, RoiPlannerItem } from '../types';

interface ReportGeneratorProps {
  selectedOrgName: string;
  metrics: DashboardSummary;
  alerts: FraudCase[];
  equipment: EquipmentItem[];
  roiPlanner: RoiPlannerItem[];
}

export default function ReportGenerator({
  selectedOrgName,
  metrics,
  alerts,
  equipment,
  roiPlanner
}: ReportGeneratorProps) {
  const [reportType, setReportType] = useState<string>('comprehensive_memo');
  const [userInstructions, setUserInstructions] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportOutput, setReportOutput] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [errorText, setErrorText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const getReportLabel = (val: string) => {
    switch (val) {
      case 'comprehensive_memo': return 'Кешенді Қаржылық комплаенс есебі (Comprehensive Decision Memo)';
      case 'fraud_investigation': return 'Клиникалық Припискалар бойынша Тексеріс Баяндамасы';
      case 'roi_internalization': return 'Аутсорсинг vs Ішкі жабдық ROI шешім жобасы';
      default: return 'Басқарушылық есеп';
    }
  };

  const getQuickPrompt = (val: string) => {
    switch (val) {
      case 'comprehensive_memo':
        return 'Емхананың жалпы аутсорсинг үлесі, HHI монополия қаупі және фродтық припискалар бойынша бас дәрігер есіміне кешенді ресми рапорт дайындаңыз.';
      case 'fraud_investigation':
        return 'Ерекше белсенділік танытқан терапевтер мен дубликатты МРТ/КТ операциялары арқылы ӘМСҚ бюджетінен артық ақша алу (upcoding) қатерлерін терең талдаңыз.';
      case 'roi_internalization':
        return 'Қай соисполнительді қысқартып, оның орнына қай аппараттарды мемлекеттік лизингпен сатып алу керектігі туралы қаржылық-экономикалық негіздеме әзірлеңіз.';
      default:
        return '';
    }
  };

  // Process loading sequence states
  const loadingSteps = [
    "МИС реестрлерін зерделеуде...",
    "Қаржылық монополия (HHI) индексін есептеуде...",
    "Жолдамалар мен ТОО орындау аралығындағы алқаларды талдауда...",
    "Құрылғылардың ақталуы мен алдын-алатын шығыстарды болжауда...",
    "AI баяндамасын қортындылап жатыр..."
  ];

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setReportOutput('');
    setErrorText('');
    setLoadingStep(0);

    // Simulate stepping loader
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 2800);

    // Қорғаныс: AI сұранысы 120 секундтан аспауы керек
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    try {
      const finalInstructions = userInstructions || getQuickPrompt(reportType);

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orgName: selectedOrgName,
          metrics,
          alerts,
          equipmentDowntime: equipment.filter(e => e.status !== 'usable' && e.status !== 'decommissioned'),
          roiPlanner,
          requestDetails: finalInstructions
        }),
        signal: controller.signal
      });

      const data = await response.json();

      if (data.success) {
        setReportOutput(data.explanation);
      } else {
        setErrorText(data.error || "Генерациялық қате пайда болды.");
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setErrorText("Сұраныс уақыты аяқталды (120с). Байланысты немесе AI API-ні қайта тексеріп көріңіз.");
      } else {
        setErrorText(err?.message || "Сервермен байланыс үзілді. AI API кілті мен интернетті тексеріңіз.");
      }
    } finally {
      clearTimeout(timeout);
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  // Қарапайым markdown рендерлеу: тақырыптар, тізімдер, қалың жазу
  const renderInline = (text: string) => {
    const parts: React.ReactNode[] = [];
    const boldRe = /\*\*(.+?)\*\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = boldRe.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      parts.push(<strong key={`b-${m.index}`} className="font-semibold text-slate-900">{m[1]}</strong>);
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  const renderMemoLine = (line: string, key: number) => {
    if (line.startsWith('### ')) return <h5 key={key} className="font-bold text-slate-900 text-[13px] mt-2">{renderInline(line.slice(4))}</h5>;
    if (line.startsWith('## ')) return <h4 key={key} className="font-bold text-slate-900 text-sm mt-3">{renderInline(line.slice(3))}</h4>;
    if (line.startsWith('# ')) return <h3 key={key} className="font-bold text-slate-900 text-base mt-3">{renderInline(line.slice(2))}</h3>;
    if (/^\s*[-*•]\s+/.test(line)) {
      return (
        <p key={key} className="pl-4 flex gap-1.5">
          <span className="text-sky-600 shrink-0">•</span>
          <span>{renderInline(line.replace(/^\s*[-*•]\s+/, ''))}</span>
        </p>
      );
    }
    if (line.trim() === '') return <div key={key} className="h-2" />;
    return <p key={key}>{renderInline(line)}</p>;
  };

  const handleCopyReport = () => {
    if (!reportOutput) return;
    navigator.clipboard.writeText(reportOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="report-generator-workspace">
      
      {/* HEADER CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PARAMS SELECT & USER COMMANDS (LEFT) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5" id="report-ctrl-panel">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Жасанды Интеллект Сараптамасы
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-1">
              Комплаенс Баяндамасын Әзірлеу
            </h4>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-500 block font-medium">Есеп түрі (Report Template):</label>
              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  setUserInstructions('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:border-sky-500 focus:outline-none"
              >
                <option value="comprehensive_memo">1. Кешенді Қаржылық комплаенс есебі (Decision Memo)</option>
                <option value="fraud_investigation">2. Клиникалық Припискалар бойынша сараптама</option>
                <option value="roi_internalization">3. Аутсорсинг vs Ішкі жабдық ROI жобасы</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 block font-medium">Эксперттік бағыттау немесе нақты тапсырма (Таңдаулы):</label>
              <textarea
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
                placeholder={getQuickPrompt(reportType) || "Деректерді талдау кезінде нақты қандай нысандар мен приписка түрлерін тексеру керек екенін жазыңыз..."}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:border-sky-500 focus:outline-none min-h-[140px] leading-relaxed"
              />
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className={`w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2 shadow-xs ${
                isLoading ? 'opacity-50 cursor-not-allowed animate-pulse' : ''
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Зерделеу жүріп жатыр...' : 'Баяндаманы Жинау (AI)'}
            </button>
          </div>
        </div>

        {/* NARRATIVE REPORT OUTPUT CANVAS (MID/RIGHT) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[520px]" id="report-canvas">
          
          {/* CANVAS HEADER */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <h3 className="font-semibold text-slate-800 text-sm">Басшылыққа арналған Қызметтік анықтама (Decision Memo)</h3>
            </div>
            
            {reportOutput && (
              <div className="flex gap-2 text-xs">
                <button
                  onClick={handleCopyReport}
                  className="p-1.5 border border-slate-200 text-slate-600 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                  title="Көшіру"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Көшірілді' : 'Көшіру'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-1.5 border border-slate-200 text-slate-600 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                  title="Баспаға дайындау"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Басып шығару</span>
                </button>
              </div>
            )}
          </div>

          {/* CHANGER AREA */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/20">
            {isLoading ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-4">
                <div className="p-4 bg-sky-50 text-sky-600 rounded-full animate-spin">
                  <Activity className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">Медициналық Деректерді Терең Зерделеу Іске Қосылды</h4>
                  <p className="text-xs text-sky-600 font-mono font-semibold">{loadingSteps[loadingStep]}</p>
                </div>
                <div className="w-full max-w-xs bg-slate-200 h-1 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full transition-all duration-300" style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}></div>
                </div>
              </div>
            ) : errorText ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 text-rose-600 bg-rose-50/10 rounded-xl m-2 border border-dashed border-rose-200">
                <AlertTriangle className="w-10 h-10 mb-2 animate-bounce" />
                <h4 className="font-bold text-sm">Серверлік Байланыс немесе API кілт қатесі</h4>
                <p className="text-xs text-rose-500 max-w-md mt-1 leading-normal">
                  {errorText}
                  <br />
                  <span className="font-mono text-[10px] mt-2 block font-normal text-slate-400">
                    Нақты AI сараптамасы үшін сервердегі `.env` файлінде `AI_API_KEY` мәнін толтырып, серверді қайта іске қосыңыз.
                  </span>
                </p>
              </div>
            ) : reportOutput ? (
              <div className="memo-document text-xs text-slate-800 leading-relaxed space-y-4 font-sans bg-white p-6 rounded-xl border border-slate-100 shadow-xs print:shadow-none pr-3">
                {/* Header elements */}
                <div className="border-b border-slate-200 pb-4 mb-4 text-center space-y-1">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">{selectedOrgName}</h2>
                  <h3 className="text-xs font-semibold text-sky-700 uppercase">БАСҚАРУШЫЛЫҚ МЕДИЦИНАЛЫҚ-ЭКОНОМИКАЛЫҚ БАЯНДАМА</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Шешім датасы: {new Date().toLocaleDateString()} | Құпиялық: Ресми қолданысқа арналған</p>
                </div>

                {/* Display compiled memo with light markdown rendering */}
                <div className="pl-1 font-sans text-slate-700 focus:outline-none space-y-1">
                  {reportOutput.split('\n').map((line, i) => renderMemoLine(line, i))}
                </div>

                <div className="border-t border-slate-200 pt-4 mt-6 flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Талдау бағдарламалары: HBI-Medical AI v1.0</span>
                  <span>Бас Дәрігер комплаенс келісіміне жіберілді</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 text-slate-400">
                <FileText className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
                <h4 className="font-semibold text-slate-800 text-sm">Баяндама Әзірленбеген</h4>
                <p className="text-xs max-w-sm mt-1">
                  Сол жақ баптаулар бойынша есеп түрін таңдап, <span className="font-bold text-sky-600 font-mono">"Баяндаманы Жинау"</span> батырмасын басыңыз. AI модельі барлық импортталған реестрлерді қамтып, шешім жобасын автоматты қазақ тілінде құрастырады.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
