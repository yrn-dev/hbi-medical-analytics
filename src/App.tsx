/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  FileSpreadsheet,
  Building2,
  AlertTriangle,
  Users,
  Wrench,
  Calculator,
  Settings,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  ArrowRight,
  Sparkles
} from 'lucide-react';

import {
  Organization,
  DocumentType,
  DocumentImport,
  DataQualityReport,
  SubcontractorAnalytics,
  FraudCase,
  StaffAnalytics,
  EquipmentItem,
  RoiPlannerItem,
  DashboardSummary
} from './types';

import {
  MOCK_ORGANIZATIONS,
  INITIAL_IMPORTS,
  MOCK_DATA_QUALITY,
  MOCK_SUBCONTRACTORS,
  MOCK_FRAUD_ALERTS,
  MOCK_STAFF_ANALYTICS,
  MOCK_EQUIPMENT,
  MOCK_ROI_PROJECTS,
  MOCK_DASHBOARD_SUMMARIES,
  DEFAULT_THRESHOLDS,
  AnalysisThresholds
} from './mockData';

// Import our modular subcomponents
import DocumentUploadWizard from './components/DocumentUploadWizard';
import OutsourcingDashboard from './components/OutsourcingDashboard';
import FraudDashboard from './components/FraudDashboard';
import HrDashboard from './components/HrDashboard';
import EquipmentDashboard from './components/EquipmentDashboard';
import DataQualityDashboard from './components/DataQualityDashboard';
import ReportGenerator from './components/ReportGenerator';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  // Multi-tenant active state
  const [selectedOrgId, setSelectedOrgId] = useState<string>("org-1");
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Localized databases (supporting interactive real edits)
  const [imports, setImports] = useState<Record<string, DocumentImport[]>>({ ...INITIAL_IMPORTS });
  const [fraudAlerts, setFraudAlerts] = useState<Record<string, FraudCase[]>>({ ...MOCK_FRAUD_ALERTS });
  const [thresholds, setThresholds] = useState<AnalysisThresholds>({ ...DEFAULT_THRESHOLDS });
  const [roiProjects, setRoiProjects] = useState<Record<string, RoiPlannerItem[]>>({ ...MOCK_ROI_PROJECTS });

  // Load resources based on active tenant/organisation
  const currentOrg = MOCK_ORGANIZATIONS.find(org => org.id === selectedOrgId) || MOCK_ORGANIZATIONS[0];
  const currentImports = imports[selectedOrgId] || [];
  const currentDq = MOCK_DATA_QUALITY[selectedOrgId] || {
    orgId: selectedOrgId, completenessRate: 100, matchingRate: 100, duplicateRate: 0, invalidMkb10Count: 0, unmappedFieldsCount: 0, outlierCount: 0
  };
  const currentSubcontractors = MOCK_SUBCONTRACTORS[selectedOrgId] || [];
  const currentFraudAlerts = fraudAlerts[selectedOrgId] || [];
  const currentStaff = MOCK_STAFF_ANALYTICS[selectedOrgId] || {
    totalPositions: 0, filledPositions: 0, vacanciesCount: 0, maternityLeaveCount: 0, retirementRiskCount: 0, criticalSpecialistsNeeded: [], loadFactor: 0
  };
  const currentEquipment = MOCK_EQUIPMENT[selectedOrgId] || [];
  const currentRoi = roiProjects[selectedOrgId] || [];
  const currentSummary = MOCK_DASHBOARD_SUMMARIES[selectedOrgId] || {
    totalOutsourceSpend: 0, privateSharePercent: 0, hhiIndex: 0, duplicateRate: 0, flaggedFraudTotal: 0, staffCoveragePercent: 100, equipmentDowntimeTotal: 0, projectedAnnualSavings: 0
  };

  // State handlers
  const handleAddImport = (newImport: DocumentImport) => {
    setImports(prev => {
      const orgImps = prev[selectedOrgId] ? [...prev[selectedOrgId]] : [];
      return {
        ...prev,
        [selectedOrgId]: [newImport, ...orgImps]
      };
    });
  };

  const handleDeleteImport = (id: string) => {
    setImports(prev => ({
      ...prev,
      [selectedOrgId]: (prev[selectedOrgId] || []).filter(item => item.id !== id)
    }));
  };

  const handleUpdateFraudCase = (id: string, status: FraudCase['status'], notes?: string) => {
    setFraudAlerts(prev => {
      const cases = prev[selectedOrgId] || [];
      const updated = cases.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status,
            notes: notes || c.notes
          };
        }
        return c;
      });
      return {
        ...prev,
        [selectedOrgId]: updated
      };
    });
  };

  const handleUpdateThresholds = (newTh: AnalysisThresholds) => {
    setThresholds(newTh);
  };

  const handleAddRoiCandidate = (item: RoiPlannerItem) => {
    setRoiProjects(prev => ({
      ...prev,
      [selectedOrgId]: [...(prev[selectedOrgId] || []), item]
    }));
  };

  // Automated Real-Time Alert Engine logic based on updated thresholds!
  const alertEngineWarnings: string[] = [];
  if (currentSummary.privateSharePercent > thresholds.outsourceShareMax) {
    alertEngineWarnings.push(`Хабарлама: Осы емханадағы жекеменшік аутсорсинг үлесі (${currentSummary.privateSharePercent}%) бекітілген максималды шектен (${thresholds.outsourceShareMax}%) асты!`);
  }
  if (currentSummary.hhiIndex > thresholds.hhiConcentrationLimit) {
    alertEngineWarnings.push(`Қауіп: Контрагент ТОО нарығындағы шоғырлану (HHI: ${currentSummary.hhiIndex}) заңсыз монополизация шегінен (${thresholds.hhiConcentrationLimit}) жоғары!`);
  }
  if (currentStaff.loadFactor > thresholds.maxDailyServicesPerDoctor) {
    alertEngineWarnings.push(`Жүктеме: Операциялық слот деңгейі аномальді жоғары (${currentStaff.loadFactor} қабылдау/ауысым, рұқсат етілген шек: ${thresholds.maxDailyServicesPerDoctor}). Дәрігерлердің шаршау қауіпі бар.`);
  }
  const currentOrgDowntime = currentEquipment.reduce((sum, e) => sum + e.downtimeDays, 0);
  if (currentOrgDowntime > thresholds.criticalDowntimeDays) {
    alertEngineWarnings.push(`Жабдық: Жалпы келісімді кідіріс күні (${currentOrgDowntime} күн) рұқсат етілген downtime шегінен (${thresholds.criticalDowntimeDays} күн) асты.`);
  }

  const liveFraudTotal = currentFraudAlerts
    .filter(c => c.status !== 'dismissed')
    .reduce((sum, c) => sum + c.flaggedAmount, 0);

  const formatKzt = (val: number) => {
    return `${val.toLocaleString()} ₸`;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-950" id="hbi-medical-app">
      
      {/* TOP HEADER BRANDING RAIL */}
      <header className="bg-slate-900 text-white shrink-0 shadow-md sticky top-0 z-50 px-6 py-4" id="app-royal-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* PLATFORM TITLE logo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500 text-slate-950 font-bold rounded-xl shadow-inner flex items-center justify-center animate-pulse">
              <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-white text-base font-bold font-sans tracking-tight block">HBI-Medical Analytics</span>
              <p className="text-[10px] text-slate-400 font-medium">Қалалық және аудандық емханалардың комплаенс платформасы</p>
            </div>
          </div>

          {/* TEANANT ORG SWITCHER BUTTONS COMPACTION */}
          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700 w-full sm:w-auto overflow-x-auto">
            {MOCK_ORGANIZATIONS.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  setSelectedOrgId(org.id);
                  // Preserve dashboard or active state
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  selectedOrgId === org.id
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>{org.name.split(' (')[0]}</span>
              </button>
            ))}
          </div>

          {/* USER INFO PROFILE INDICATOR */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/30">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div>
            <span className="text-[11px] font-mono tracking-wider font-semibold text-slate-200">
              {currentOrg.code} | ДӘРІГЕР/АУДИТОР
            </span>
          </div>

        </div>
      </header>

      {/* COMPLIANCE ALERT ENGINE GAUGE BLOCK */}
      {alertEngineWarnings.length > 0 && (
        <div className="bg-rose-50 border-b border-rose-200 shrink-0 text-xs px-6 py-2.5" id="alert-engine-banner">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-0.5">
                <span className="font-bold text-rose-950 block">Комплаенс Дабылдары Белсенді! (Alert Engine)</span>
                <p className="text-[10px] text-rose-800">{alertEngineWarnings[0]}</p>
              </div>
            </div>
            
            {alertEngineWarnings.length > 1 && (
              <span className="text-[9px] bg-rose-600 text-white px-2.5 py-0.5 rounded-full font-mono shrink-0 font-bold self-start md:self-center">
                Тағы {alertEngineWarnings.length - 1} қаупі бар
              </span>
            )}
          </div>
        </div>
      )}

      {/* MAIN LAYOUT SPACE */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 flex flex-col space-y-6" id="app-dynamic-workspace">

        {/* COMPREHENSIVE OVERVIEW (CARD GAUGE AND CLINIC INFO) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0" id="cur-info-header">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{currentOrg.name}</h1>
              <span className="bg-sky-50 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-sky-100">
                {currentOrg.type === 'city_polyclinic' ? 'Қалалық емхана' : currentOrg.type === 'district_hospital' ? 'Аудандық аурухана' : 'Арнайы Мамандандырылған Орталық'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Өңірі: <span className="text-slate-700 font-semibold">{currentOrg.region}</span> | Есепте тұрған халық: <span className="text-slate-700 font-semibold">{currentOrg.patientsCount.toLocaleString()} тұрғын</span></p>
          </div>

          <div className="text-xs text-slate-500 pr-1 flex gap-4">
            <div className="text-left">
              <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">Файлдар</span>
              <span className="font-mono text-slate-950 font-bold text-sm">{currentImports.length} жүктелген</span>
            </div>
            {currentOrg.bedCount && (
              <div className="text-left">
                <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">Койка қоры</span>
                <span className="font-mono text-slate-950 font-bold text-sm">{currentOrg.bedCount} төсек-орын</span>
              </div>
            )}
          </div>
        </div>

        {/* TABS CONTROLLERS BAR */}
        <div className="border-b border-slate-200 pb-px shrink-0 overflow-x-auto custom-scrollbar" id="tab-nav-rack">
          <div className="flex gap-1.5 pb-2 min-w-[700px]">
            {[
              { id: "dashboard", label: "Тәуекел картасы", icon: LayoutDashboard },
              { id: "import", label: "Импорт орталығы", icon: UploadCloud },
              { id: "dq", label: "Деректер сапасы", icon: FileSpreadsheet },
              { id: "outsourcing", label: "Аутсорсинг қосалқы орындау", icon: PieChart },
              { id: "fraud", label: "Тәуекелдерді анықтау (Fraud)", icon: AlertTriangle },
              { id: "hr", label: "Кадрлық талдау", icon: Users },
              { id: "equipment", label: "Құрал-жабдықтар мен ROI", icon: Wrench },
              { id: "reports", label: "Есептер және AI сараптама", icon: Sparkles },
              { id: "settings", label: "Критерийлер баптаулары", icon: Settings }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTRAL MAIN VIEWPORT SWITCHBOARD */}
        <div className="flex-1 min-h-0" id="tab-viewport">
          
          {/* TAB 1: TOTAL DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fade-in" id="dashboard-tab">
              
              {/* PRIMARY KPI CARDS BAR */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="dash-quick-kpi">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Жалпы Аутсорсинг</span>
                    <span className="p-1.5 bg-sky-50 text-sky-600 rounded-lg"><PieChart className="w-4 h-4" /></span>
                  </div>
                  <div>
                    <span className="text-xl font-mono font-bold text-slate-950 block">{formatKzt(currentSummary.totalOutsourceSpend)}</span>
                    <p className="text-[9px] text-slate-400 mt-0.5">Жеке сектор үлесі: {currentSummary.privateSharePercent}%</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Қате дефект сомасы</span>
                    <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><AlertTriangle className="w-4 h-4" /></span>
                  </div>
                  <div>
                    <span className="text-xl font-mono font-bold text-rose-600 block">{formatKzt(liveFraudTotal)}</span>
                    <p className="text-[9px] text-rose-400 mt-0.5">Реестрлік дубликат үлесі: {currentSummary.duplicateRate}%</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Штаттық Кадр қамтуы</span>
                    <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Users className="w-4 h-4" /></span>
                  </div>
                  <div>
                    <span className="text-xl font-mono font-bold text-slate-950 block">{currentSummary.staffCoveragePercent}%</span>
                    <p className="text-[9px] text-indigo-500 mt-0.5">Зейнетке кету қауіпі (1ж): {currentStaff.retirementRiskCount} маман</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Өзін ақтау ROI</span>
                    <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Calculator className="w-4 h-4" /></span>
                  </div>
                  <div>
                    <span className="text-xl font-mono font-bold text-emerald-600 block">+{formatKzt(currentSummary.projectedAnnualSavings)}</span>
                    <p className="text-[9px] text-emerald-500 mt-0.5">Жылдық үнемдеу резерві бар</p>
                  </div>
                </div>

              </div>

              {/* TWO COLUMN SUMMARY INTERSECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-two-cols">
                
                {/* ACTIVE SUMMARY RECOMMENDATIONS CARD */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between h-[360px]" id="recommendations-overview">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block font-medium">Белсенді Қаржылық талдау бұйрықтары</span>
                      <span className="bg-sky-50 text-sky-800 text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono">
                        ӘМСҚ Стандарттары
                      </span>
                    </div>

                    <div className="space-y-3.5 text-xs text-slate-600">
                      
                      {currentSummary.totalOutsourceSpend > 0 ? (
                        <div className="flex items-start gap-2">
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold py-0.5 px-2 rounded mt-0.5">Концентрация</span>
                          <p className="leading-normal">
                             ТОО серіктестеріне сыртқа аударылатын бюджетте бәсекелестік жетіспейді (HHI: {currentSummary.totalOutsourceSpend > 100000000 ? 'Жоғары монополия тәуекелі' : 'Қалыпты'}), бұл бағалардың жоғары болуына әкеледі.
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold py-0.5 px-2 rounded mt-0.5 block">Тұрақты</span>
                          <p className="leading-normal">Қосалқы орындау келісімшарттары балансталған, серіктестер арасында монополиялық қауіп төмен.</p>
                        </div>
                      )}

                      {currentFraudAlerts.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="bg-red-100 text-red-800 text-[9px] font-bold py-0.5 px-2 rounded mt-0.5">Клиникалық фрод</span>
                          <p className="leading-normal">
                            Поликлиникада <b>{currentFraudAlerts.filter(c => c.status === 'new').length} Жаңа сигналдар (приписка)</b> анықталды. Тәулігіне 50-ден асқан қызмет көрсетуші дәрігерлер бойынша тексерісті ішкі аудит бөліміне тапсыру қажет.
                          </p>
                        </div>
                      )}

                      {currentStaff.retirementRiskCount > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="bg-purple-100 text-purple-800 text-[9px] font-bold py-0.5 px-2 rounded mt-0.5">Кадр саңылаулары</span>
                          <p className="leading-normal">
                             Алдағы ресми зейнет жасына шығатын немесе декретке баратын <b>{currentStaff.retirementRiskCount + currentStaff.maternityLeaveCount} маман</b> орнына жас резидент дәрігерлерге тарификациялық конкурстар дайындау керек.
                          </p>
                        </div>
                      )}

                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Толық сараптамалық қортынды үшін AI баяндаманы ашыңыз</span>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="text-sky-600 font-bold hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Ресми AI Есептеме
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ALERTS NOTIFIER AND THRESHOLDS COMPACTION (RIGHT) */}
                <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md p-6 h-[360px] flex flex-col justify-between" id="active-alert-monitoring">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block font-medium">Белсенді Сигналдар</span>
                        <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                          Тәуекел Картасы (Alert Core)
                        </h4>
                      </div>
                      <ShieldAlert className="w-5 h-5 text-sky-400 animate-pulse" />
                    </div>

                    <div className="space-y-3 text-xs">
                      {alertEngineWarnings.length === 0 ? (
                        <div className="text-center p-6 text-slate-400">
                          <CheckCircle2 className="w-10 h-10 mx-auto stroke-1 text-emerald-400 mb-2" />
                          <p className="text-[11px]">Барлық көрсеткіштер қауіпсіз деңгейде!</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1 select-none custom-scrollbar text-[11px]">
                          {alertEngineWarnings.map((warn, i) => (
                            <div key={i} className="flex gap-2 items-start text-sky-200 bg-slate-800/65 p-2.5 rounded-lg border border-slate-700">
                              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0 mt-1.5"></span>
                              <p className="leading-snug opacity-90">{warn}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-medium font-mono pt-3 border-t border-slate-800 flex justify-between">
                    <span>Бақылау стандарты: РК ТМККК</span>
                    <span className="text-sky-400 font-bold hover:underline cursor-pointer" onClick={() => setActiveTab('settings')}>Критериді баптау</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: IMPORT COMPONENT */}
          {activeTab === "import" && (
            <DocumentUploadWizard
              key={selectedOrgId}
              imports={currentImports}
              onAddImport={handleAddImport}
              onDeleteImport={handleDeleteImport}
              selectedOrgId={selectedOrgId}
            />
          )}

          {/* TAB 3: DATA QUALITY METRICS */}
          {activeTab === "dq" && (
            <DataQualityDashboard key={selectedOrgId} report={currentDq} />
          )}

          {/* TAB 4: OUTSOURCING SPEND AUDITING */}
          {activeTab === "outsourcing" && (
            <OutsourcingDashboard key={selectedOrgId} summary={currentSummary} subcontractors={currentSubcontractors} hhiLimit={thresholds.hhiConcentrationLimit} />
          )}

          {/* TAB 5: FRAUD AND AUDIT CHECKS */}
          {activeTab === "fraud" && (
            <FraudDashboard key={selectedOrgId} cases={currentFraudAlerts} onUpdateCaseStatus={handleUpdateFraudCase} thresholds={thresholds} />
          )}

          {/* TAB 6: HUMAN RESOURCE & TARIFICATION */}
          {activeTab === "hr" && (
            <HrDashboard key={selectedOrgId} hrData={currentStaff} thresholds={thresholds} />
          )}

          {/* TAB 7: MAINTENANCE AND EQUIPMENT ROI PLANNER */}
          {activeTab === "equipment" && (
            <EquipmentDashboard key={selectedOrgId} equipment={currentEquipment} roiPlanner={currentRoi} onAddRoiCandidate={handleAddRoiCandidate} />
          )}

          {/* TAB 8: REPORT COMPILER & AI ANALYSIS */}
          {activeTab === "reports" && (
            <ReportGenerator
              selectedOrgName={currentOrg.name}
              metrics={currentSummary}
              alerts={currentFraudAlerts}
              equipment={currentEquipment}
              roiPlanner={currentRoi}
            />
          )}

          {/* TAB 9: SETTINGS/THRESHOLDS ADJUST */}
          {activeTab === "settings" && (
            <SettingsPanel thresholds={thresholds} onUpdateThresholds={handleUpdateThresholds} />
          )}

        </div>

      </main>

      {/* COMPLIANT PLATFORM FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-[10px] tracking-wider shrink-0 py-4 border-t border-slate-800" id="app-royal-footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <span>&copy; 2026 HBI-Medical Analytics. Барлық құқықтар қорғалған.</span>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer select-none">Қолдану шарттары</span>
            <span>|</span>
            <span className="hover:text-white cursor-pointer select-none">Комплаенс Кодексі</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
