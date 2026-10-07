/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Activity,
  History,
  Trash2,
  Check,
  ChevronRight
} from 'lucide-react';
import { DocumentType, DocumentImport } from '../types';
import { DOCUMENT_LABELS } from '../mockData';

interface DocumentUploadWizardProps {
  imports: DocumentImport[];
  onAddImport: (newImport: DocumentImport) => void;
  onDeleteImport: (id: string) => void;
  selectedOrgId: string;
}

export default function DocumentUploadWizard({
  imports,
  onAddImport,
  onDeleteImport,
  selectedOrgId
}: DocumentUploadWizardProps) {
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [wizardStep, setWizardStep] = useState<'select' | 'upload' | 'mapping' | 'success'>('select');

  // Mapping wizard state
  const [sourceHeaders, setSourceHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [rowCountToImport, setRowCountToImport] = useState<number>(100);
  const [mappingPercent, setMappingPercent] = useState<number>(100);

  const documentTypes = Object.entries(DOCUMENT_LABELS) as [DocumentType, typeof DOCUMENT_LABELS[DocumentType]][];

  // System standard fields for each class of document
  const getStandardFieldsForType = (type: DocumentType): { id: string; name: string; required: boolean }[] => {
    switch (type) {
      case 'services_registry':
        return [
          { id: 'patient_iin', name: 'Пациент ЖСН', required: true },
          { id: 'service_code', name: 'Қызмет коды', required: true },
          { id: 'amount_kzt', name: 'Қызмет сомасы (KZT)', required: true },
          { id: 'mkb10_code', name: 'Диагноз МКБ-10', required: true },
          { id: 'doctor_fullname', name: 'Дәрігердің аты-жөні', required: false },
          { id: 'service_date', name: 'Қызмет көрсетілген күні', required: true }
        ];
      case 'outsourcing_spend':
        return [
          { id: 'contractor_name', name: 'Қосалқы орындаушы ТОО БИН/Атауы', required: true },
          { id: 'amount_kzt', name: 'Шығыс сомасы (KZT)', required: true },
          { id: 'contract_no', name: 'Келісімшарт №', required: false },
          { id: 'payment_date', name: 'Төлем күні', required: true }
        ];
      case 'work_acts':
        return [
          { id: 'act_no', name: 'Акт №', required: true },
          { id: 'act_amount', name: 'Акт сомасы (KZT)', required: true },
          { id: 'contractor_bin', name: 'Орындаушы БИН/ЖСН', required: true },
          { id: 'act_date', name: 'Актіленген күн', required: true }
        ];
      case 'social_fund_payments':
        return [
          { id: 'defect_amount', name: 'Салынған уақытша дефектілер сомасы', required: true },
          { id: 'defect_code', name: 'Платформа дефект коды', required: true },
          { id: 'penalty_detail', name: 'Айыппұл/Түсініктеме детальдары', required: false }
        ];
      default:
        return [
          { id: 'num_field_1', name: 'Бірегей ИД/Код', required: true },
          { id: 'num_field_2', name: 'Қаржылық Мәні (Сомасы)', required: true },
          { id: 'text_field_1', name: 'Сипаттама бағаны', required: false }
        ];
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setUploadedFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    });

    // Extract headers based on file type or mock them
    let detectedHeaders: string[] = [];
    if (selectedDocType === 'services_registry') {
      detectedHeaders = ['ЖСН_Пациент', 'Код_услуги_Код', 'Құны_KZT', 'МКБ_Код', 'Дәрігер_МП', 'Күні_Уақыты', 'Бөлімше_ИД'];
    } else if (selectedDocType === 'outsourcing_spend') {
      detectedHeaders = ['Контрагент_ТОО', 'Төленген_Қаржы', 'Келісімшарт_ИД', 'Аударылған_Күн', 'БИН_Бен'];
    } else {
      detectedHeaders = ['Идентификатор', 'Сома_Теңге', 'Мерзімі', 'Қосымша_Мәлімет'];
    }

    setSourceHeaders(detectedHeaders);

    // Initialize auto mappings based on similarities
    const defaultStandardFields = getStandardFieldsForType(selectedDocType || 'services_registry');
    const autoMappings: Record<string, string> = {};
    defaultStandardFields.forEach(stField => {
      const match = detectedHeaders.find(srcH => {
        const lowerSrc = srcH.toLowerCase();
        const lowerSt = stField.name.toLowerCase();
        return lowerSrc.includes(stField.id.split('_')[0]) || lowerSrc.includes('код') && lowerSt.includes('код') || lowerSrc.includes('жсн') && lowerSt.includes('жсн') || lowerSrc.includes('сома') && lowerSt.includes('сома') || lowerSrc.includes('құны') && lowerSt.includes('сома');
      });
      if (match) {
        autoMappings[stField.id] = match;
      } else {
        autoMappings[stField.id] = detectedHeaders[0] || '';
      }
    });

    setFieldMappings(autoMappings);
    setRowCountToImport(Math.floor(Math.random() * 800) + 120);
    setWizardStep('mapping');
  };

  const executeImport = () => {
    if (!selectedDocType || !uploadedFile) return;

    // Мәлімдема: бағандардың қанша пайызы шынымен сәйкестендірілгенін есептейміз
    const standardFields = getStandardFieldsForType(selectedDocType);
    const missingFields = standardFields.filter(sf => !fieldMappings[sf.id] || fieldMappings[sf.id] === 'unmapped');
    const missingRequired = standardFields.filter(sf => sf.required && (!fieldMappings[sf.id] || fieldMappings[sf.id] === 'unmapped'));
    const percent = Math.round(((standardFields.length - missingFields.length) / (standardFields.length || 1)) * 100);
    setMappingPercent(percent);

    // Convert mapped fields into a user-friendly format for display
    const mappedLabels: Record<string, string> = {};
    standardFields.forEach(sf => {
      mappedLabels[sf.name] = fieldMappings[sf.id] || "Сәйкестендірілмеген";
    });

    const status: DocumentImport['status'] = missingRequired.length > 0 ? 'error' : (missingFields.length > 0 ? 'warning' : 'success');
    const errorDetails = missingFields.length > 0
      ? `${missingRequired.length > 0 ? 'Қате' : 'Ескерту'}: ${missingFields.map(sf => sf.name).join(', ')} бағаны сәйкестендірілмеді.`
      : undefined;

    const newImport: DocumentImport = {
      id: `imp-${Date.now()}`,
      type: selectedDocType,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      importDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status,
      recordedBy: 'Ағымдағы пайдаланушы (Auditor)',
      rowCount: rowCountToImport,
      mappedFields: mappedLabels,
      errorDetails
    };

    onAddImport(newImport);
    setWizardStep('success');
  };

  const resetWizard = () => {
    setSelectedDocType(null);
    setUploadedFile(null);
    setWizardStep('select');
  };

  const currentOrgImports = imports; // In state we already pass matching items

  return (
    <div className="space-y-6" id="import-wizard-container">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm" id="import-header-block">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight font-sans">Импорт Орталығы (Data Import Center)</h2>
          <p className="text-slate-500 text-sm mt-1">
            Кез келген аудандық немесе қалалық емхананың деректерін тікелей жүйеге импорттаңыз. Платформа 16 негізгі түрді қолдайды.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider">
          <Activity className="w-4 h-4 animate-pulse text-emerald-600" />
          Multi-Tenant Белсенді
        </div>
      </div>

      {/* WIZARD PROCESS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="import-workspace">
        
        {/* LEFT & MID: INTERACTIVE IMPORT WIZARD */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/70 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-slate-600" />
              Жүктеу шебері (Wizard Step)
            </h3>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-md">
              {wizardStep === 'select' && "1/4: Файл типін таңдау"}
              {wizardStep === 'upload' && "2/4: Файлды тарту"}
              {wizardStep === 'mapping' && "3/4: Field Mapping баптау"}
              {wizardStep === 'success' && "4/4: Нәтиже дайын"}
            </span>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between">
            {/* STEP 1: SELECT DOCUMENT TYPE */}
            {wizardStep === 'select' && (
              <div className="space-y-4 flex-1 animate-fade-in" id="step-select-type">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  І. Әуелі, импортталатын медициналық немесе қаржылық дерек түрін таңдаңыз:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                  {documentTypes.map(([type, doc]) => {
                    const isMandatory = doc.isRequired;
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedDocType(type);
                          setWizardStep('upload');
                        }}
                        className="group flex items-start gap-4 p-4 text-left rounded-xl border border-slate-200/80 hover:border-sky-500/80 hover:bg-sky-50/30 transition-all cursor-pointer duration-200 hover:shadow-xs"
                      >
                        <div className={`p-2.5 rounded-lg shrink-0 ${isMandatory ? 'bg-sky-50 text-sky-600 group-hover:bg-sky-100' : 'bg-slate-50 text-slate-500 group-hover:bg-slate-100'}`}>
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium text-slate-950 group-hover:text-sky-950 transition-colors">
                              {doc.label}
                            </span>
                            {isMandatory && (
                              <span className="bg-red-50 text-red-600 text-[10px] font-medium px-1.5 py-0.5 rounded-sm">
                                Міндетті
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 leading-normal">
                            {doc.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: UPLOAD FILE SCENE */}
            {wizardStep === 'upload' && selectedDocType && (
              <div className="space-y-6 flex-1 flex flex-col justify-center max-w-xl mx-auto w-full py-8 animate-fade-in" id="step-upload-file">
                <div className="text-center space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Үлгі: {DOCUMENT_LABELS[selectedDocType].label}
                  </h4>
                  <p className="text-xs text-slate-500">
                    XLSX, CSV (кейде PDF, ТXT) файлдары қабылданады. Шаблон ретінде <span className="font-mono text-slate-700 font-semibold bg-slate-100 px-1 rounded">{DOCUMENT_LABELS[selectedDocType].sampleFile}</span> қолдану ұсынылады.
                  </p>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                    dragActive
                      ? 'border-sky-500 bg-sky-50/40 scale-[0.99]'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload-input"
                    className="hidden"
                    accept=".xlsx,.xls,.csv,.pdf,.docx,.txt"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 bg-white rounded-full shadow-xs text-slate-500">
                      <UploadCloud className="w-8 h-8 text-sky-500" />
                    </div>
                    <div>
                      <label htmlFor="file-upload-input" className="text-sm font-semibold text-sky-600 hover:text-sky-700 cursor-pointer underline">
                        Компьютерден файл таңдаңыз
                      </label>
                      <span className="text-slate-500 text-sm"> немесе осында тартып әкеліңіз</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Максималды өлшем: 100 MB. Осыдан кейін бағандарды сәйкестендіру жүреді.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={resetWizard}
                    className="px-4 py-2 rounded-xl text-slate-600 border border-slate-200 text-sm hover:bg-slate-50 cursor-pointer"
                  >
                    Артқа қайту
                  </button>
                  <button
                    onClick={() => {
                      // Simulate a fast import process
                      setUploadedFile({
                        name: DOCUMENT_LABELS[selectedDocType].sampleFile,
                        size: "4.8 MB"
                      });
                      handleFileSelected(new File([""], DOCUMENT_LABELS[selectedDocType].sampleFile));
                    }}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-900 cursor-pointer"
                  >
                    Демо-шаблонмен жалғастыру
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: FIELD MAPPING WIZARD (Сәйкестендіру) */}
            {wizardStep === 'mapping' && selectedDocType && uploadedFile && (
              <div className="space-y-5 flex-1 animate-fade-in" id="step-mapping-fields">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/60 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-semibold text-amber-900">
                      Field Mapping шебері белсенді (Бағандар сәйкестендіруі)
                    </h5>
                    <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                      Әр емхананың дерекқор құрылымы әртүрлі. Төменде жүйенің стандарты сұрайтын өрістер (Сол жақ) мен сіздің файлдағы бағандардың (Оң жақ) сәйкестігін баптаңыз. Бұл қате талдаулардың алдын алады.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Бағандарды сәйкестендіру картасы:
                  </span>
                  <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                    {getStandardFieldsForType(selectedDocType).map((stField) => (
                      <div key={stField.id} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${stField.required ? 'bg-red-500' : 'bg-slate-400'}`}></span>
                          <span className="text-xs font-semibold text-slate-800">
                            {stField.name}
                            {stField.required && <span className="text-red-500 ml-0.5">*</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-slate-400 hidden md:block" />
                          <select
                            value={fieldMappings[stField.id] || "unmapped"}
                            onChange={(e) => {
                              setFieldMappings({
                                ...fieldMappings,
                                [stField.id]: e.target.value
                              });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg text-xs p-1.5 focus:border-sky-500 focus:outline-none"
                          >
                            <option value="unmapped">-- Таңдау жасалмады --</option>
                            {sourceHeaders.map(sh => (
                              <option key={sh} value={sh}>{sh}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Симуляциялық қатарлар саны:</span>
                    <input
                      type="number"
                      value={rowCountToImport}
                      onChange={(e) => setRowCountToImport(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-20 bg-slate-50 border border-slate-200 rounded text-xs px-2 py-1 focus:outline-none font-mono text-center"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWizardStep('upload')}
                      className="px-4 py-2 rounded-xl text-slate-600 border border-slate-200 text-xs hover:bg-slate-50 cursor-pointer"
                    >
                      Кері қайту
                    </button>
                    <button
                      onClick={executeImport}
                      className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Импортты Орындау
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS STATS AND FLOW */}
            {wizardStep === 'success' && selectedDocType && uploadedFile && (
              <div className="space-y-6 flex-1 flex flex-col justify-center items-center py-8 text-center animate-fade-in" id="step-success-info">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-900">
                    Деректер сәтті импортталды!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Файл <span className="font-semibold text-slate-700">{uploadedFile.name}</span> талданды және тазартылды. Сандық өрістер стандартталып, бос мәндер қалпына келтірілді және қауіпті аналитикалық ядроға жіберілді.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 w-full max-w-sm">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Бағандар Сәйкестігі</span>
                    <span className={`text-sm font-semibold font-mono ${mappingPercent === 100 ? 'text-emerald-600' : mappingPercent >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{mappingPercent}% Табылды</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Шығарылған Жолдар саны</span>
                    <span className="text-sm font-semibold font-mono text-emerald-600">{rowCountToImport} жол</span>
                  </div>
                </div>

                <button
                  onClick={resetWizard}
                  className="px-6 py-2 bg-slate-900 text-white font-medium rounded-xl text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Тағы Файл Импорттау
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: IMPORTED DOCUMENTS HISTORY */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]" id="import-history">
          <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/70 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-slate-600" />
              Жүктеу тарихы (Repository)
            </h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full font-mono">
              {currentOrgImports.length} файл
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {currentOrgImports.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 text-slate-400">
                <FileText className="w-10 h-10 mb-2 stroke-1" />
                <p className="text-xs">
                  Бұл ұйымда әлі импортталған құжаттар жоқ. Дерек панелін ашу үшін файлдарды жүктеңіз немесе демо шаблонды қолданыңыз.
                </p>
              </div>
            ) : (
              currentOrgImports.map((imp) => {
                const docLabel = DOCUMENT_LABELS[imp.type]?.label || imp.type;
                const dateOnly = imp.importDate;
                const statusTheme =
                  imp.status === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : imp.status === 'warning'
                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                    : 'bg-red-50 text-red-700 border-red-100';

                return (
                  <div
                    key={imp.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-white hover:shadow-xs space-y-2.5 relative group"
                  >
                    <button
                      onClick={() => onDeleteImport(imp.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 focus:outline-none transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Импортты жою"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="space-y-1 pr-6">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border uppercase font-mono ${statusTheme}`}>
                          {imp.status === 'success' ? 'Сәтті' : imp.status === 'warning' ? 'Ескерту' : 'Қате'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {dateOnly}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                        {docLabel}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono truncate">
                        Файл: {imp.fileName} ({imp.fileSize})
                      </p>
                    </div>

                    <div className="border-t border-slate-50 pt-2 flex justify-between items-center text-[10px] text-slate-500">
                      <span>Жолдар саны: <b className="text-slate-700 font-mono font-medium">{imp.rowCount}</b></span>
                      <span>Тіркеді: <b className="text-slate-700 font-medium">HR/MGR</b></span>
                    </div>

                    {imp.errorDetails && (
                      <div className="text-[9px] bg-red-50/50 text-red-600 p-1.5 rounded border border-red-100/40">
                        {imp.errorDetails}
                      </div>
                    )}

                    {/* Collapsible mapping info strictly verified */}
                    <div className="text-[9px] bg-slate-50 p-2 rounded max-h-[80px] overflow-y-auto space-y-1 custom-scrollbar">
                      <div className="font-semibold text-slate-400 uppercase tracking-widest text-[8px] mb-1">
                        Орындалған Field Mapping:
                      </div>
                      {Object.entries(imp.mappedFields).map(([st, src]) => (
                        <div key={st} className="flex justify-between text-slate-500">
                          <span>{st}:</span>
                          <span className="font-mono text-slate-700 font-semibold">{src}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
