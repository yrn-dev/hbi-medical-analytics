/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

// Деректерді қазақ тіліндегі атауларына сәйкестендіру анықтамалығы
export const DOCUMENT_LABELS: Record<DocumentType, { label: string; desc: string; sampleFile: string; isRequired: boolean }> = {
  services_registry: {
    label: "Қызметтер реестрі (МИС выгрузкасы)",
    desc: "Пациенттерге көрсетілген медициналық қызметтер тізімі, тарифтер және МКБ-10 диагноздары",
    sampleFile: "services_registry_2026_q2.xlsx",
    isRequired: true
  },
  outsourcing_spend: {
    label: "Сыртқы шығыстар реестрі",
    desc: "Аутсорсинг келісімшарттары бойынша қосалқы орындаушыларға аударылған қаражат",
    sampleFile: "outsource_ledger_may.csv",
    isRequired: true
  },
  work_acts: {
    label: "Орындалған жұмыс актілері",
    desc: "Қосалқы серіктестермен (ТОО) бекітілген орындалған қызмет актілері мен шот-фактуралары",
    sampleFile: "acts_reconciliation_signed.xlsx",
    isRequired: true
  },
  social_fund_payments: {
    label: "ӘМСҚ төлем/қысқарту/дефект реестрі",
    desc: "Әлеуметтік медициналық сақтандыру қорының дефектілері, штрафтары мен төлем шешімдері",
    sampleFile: "fms_deductions_2026.xlsx",
    isRequired: true
  },
  staffing_table: {
    label: "Штаттық кесте",
    desc: "Ұйымдағы барлық мамандықтар, бөлімшелер және бекітілген штат бірліктері (ставкалар)",
    sampleFile: "shedule_positions_approved.csv",
    isRequired: true
  },
  tariffs_workload: {
    label: "Тарификация / Нақты кадрлық жүктеме",
    desc: "Дәрігерлер мен орта медициналық персоналдың нақты жүктемесі, тариф бірліктері",
    sampleFile: "tarification_employees_final.xlsx",
    isRequired: true
  },
  equipment_registry: {
    label: "Құрал-жабдықтар реестрі",
    desc: "Медициналық және техникалық жабдықтар тізімі, баланстық құны, зауыттық күйі",
    sampleFile: "medical_assets_v2.xlsx",
    isRequired: false
  },
  maintenance_downtime: {
    label: "Жөндеу және downtime журналы",
    desc: "Құрылғылардың ақаулықтары, тоқтап тұру күндері (downtime) және жөндеу шығындары",
    sampleFile: "equipment_repairs_log.xlsx",
    isRequired: false
  },
  slots_schedule: {
    label: "Кезек / Слот кестесі",
    desc: "МИС пациенттердің жазылу жиілігі, бос/уақытылы тіркелмеген слоттар және күту уақыты",
    sampleFile: "slots_queues_may.xlsx",
    isRequired: false
  },
  referrals_registry: {
    label: "Жолдамалар реестрі",
    desc: "Басқа ұйымдарға немесе сыртқы клиникаларға берілген жолдамалар жинағы",
    sampleFile: "referrals_outward.csv",
    isRequired: false
  },
  medicine_inventory: {
    label: "Дәрілік қойма қалдықтары",
    desc: "Аптекалар мен бөлімшелердегі дәрі-дәрмектер мен медициналық бұйымдардың қалдығы",
    sampleFile: "medicines_stock_report.xlsx",
    isRequired: false
  },
  procurement_contracts: {
    label: "Сатып алу және келісімшарттар",
    desc: "Дәрі-дәрмектер, құралдар мен коммуналдық сатып алу келісімшарттарының тізілімі",
    sampleFile: "contracts_goszakup.xlsx",
    isRequired: false
  },
  debts_credits: {
    label: "Кредиторлық/дебиторлық берешек",
    desc: "Поставщиктер мен ӘМСҚ алдындағы қаржылық міндеттемелер мен қарыздар реестрі",
    sampleFile: "debts_balance_sheet.csv",
    isRequired: false
  },
  staff_movement: {
    label: "Кадрлар қозғалысы",
    desc: "Жұмысқа алынғандар, босатылғандар, декрет және зейнетке жақындаған мамандар қозғалысы",
    sampleFile: "staff_hr_movement.xlsx",
    isRequired: false
  },
  quality_audit: {
    label: "Сапа және ішкі аудит құжаттары",
    desc: "Клиникалық-сараптамалық комиссияның қорытындылары, шағымдар мен аудит актілері",
    sampleFile: "internal_audit_checklist.docx",
    isRequired: false
  },
  pdf_archive: {
    label: "PDF/DOCX қосымша құжаттар архиві",
    desc: "Келісімшарттар, хаттар, бұйрықтар мен құжат скан-көшірмелерінің архиві",
    sampleFile: "legal_documents_vols.zip",
    isRequired: false
  }
};

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: "org-1",
    name: "№5 Қалалық емхана (Алматы)",
    code: "POL-005-ALM",
    type: "city_polyclinic",
    region: "Алматы қаласы",
    bedCount: 25,
    patientsCount: 68400
  },
  {
    id: "org-2",
    name: "Жамбыл аудандық көпсалалы ауруханасы",
    code: "HOSP-JAMBYL-DR",
    type: "district_hospital",
    region: "Жамбыл облысы",
    bedCount: 180,
    patientsCount: 42100
  },
  {
    id: "org-3",
    name: "Ана мен Бала денсаулығын қорғау орталығы",
    code: "MC-MCH-NUR",
    type: "specialized_center",
    region: "Астана қаласы",
    bedCount: 150,
    patientsCount: 31200
  }
];

export const INITIAL_IMPORTS: Record<string, DocumentImport[]> = {
  "org-1": [
    {
      id: "imp-101",
      type: "services_registry",
      fileName: "services_registry_2026_q2.xlsx",
      fileSize: "14.2 MB",
      importDate: "2026-06-01 10:15",
      status: "success",
      recordedBy: "А.С. Есенбеков (Экономист)",
      rowCount: 12540,
      mappedFields: {
        "Пациент ЖСН": "Patient_IIN",
        "Қызмет коды": "Service_Code",
        "Қызмет сомасы": "Amount_KZT",
        "Диагноз МКБ-10": "MKB10_Code",
        "Дәрігер аты-жөні": "Doctor_FullName",
        "Көрсетілген күні": "Service_Date"
      }
    },
    {
      id: "imp-102",
      type: "outsourcing_spend",
      fileName: "outsource_ledger_may.csv",
      fileSize: "2.8 MB",
      importDate: "2026-06-01 11:20",
      status: "warning",
      recordedBy: "А.С. Есенбеков (Экономист)",
      rowCount: 450,
      mappedFields: {
        "Мердігер ТОО": "Partner_Name",
        "Сумма": "Total_Paid",
        "Төлем күні": "Payment_Date",
        "Келісімшарт №": "Contract_No"
      },
      errorDetails: "Ескерту: 12 жолда мердігердің ЖСН/БИН нөмірі табылмағандықтан, атауы арқылы сәйкестендірілді."
    },
    {
      id: "imp-103",
      type: "work_acts",
      fileName: "acts_reconciliation_signed.xlsx",
      fileSize: "1.1 MB",
      importDate: "2026-06-02 09:30",
      status: "success",
      recordedBy: "Б.Х. Сапаров (Бухгалтер)",
      rowCount: 180,
      mappedFields: {
        "Акт сомасы": "Act_Amount",
        "Контрагент": "Supplier_BİN",
        "Акт нөмірі": "Act_No",
        "Күні": "Act_Date"
      }
    },
    {
      id: "imp-104",
      type: "social_fund_payments",
      fileName: "fms_deductions_2026.xlsx",
      fileSize: "5.4 MB",
      importDate: "2026-06-02 14:00",
      status: "success",
      recordedBy: "А.С. Есенбеков (Экономист)",
      rowCount: 1205,
      mappedFields: {
        "Дефект сомасы": "Defect_Amount",
        "Дефект коды": "Defect_Code",
        "Жолдама №": "Guidance_No",
        "Айыппұл түрі": "Penalty_Type"
      }
    },
    {
      id: "imp-105",
      type: "staffing_table",
      fileName: "shedule_positions_approved.csv",
      fileSize: "450 KB",
      importDate: "2026-06-03 16:15",
      status: "success",
      recordedBy: "К. Оспанова (HR директор)",
      rowCount: 380,
      mappedFields: {
        "Лауазым": "Position_Name",
        "Бөлімше": "Department_ID",
        "Бекітілген ставка": "Staff_Rate",
        "Негізгі жалақы": "Salary_Base"
      }
    },
    {
      id: "imp-106",
      type: "tariffs_workload",
      fileName: "tarification_employees_final.xlsx",
      fileSize: "820 KB",
      importDate: "2026-06-03 16:45",
      status: "success",
      recordedBy: "К. Оспанова (HR директор)",
      rowCount: 310,
      mappedFields: {
        "Қызметкер ЖСН": "Employee_IIN",
        "Біліктілік санаты": "Qualification_Category",
        "Нақты жүктеме (ставка)": "Actual_Workload_Rate",
        "Үстемақылар": "Allowances"
      }
    },
    {
      id: "imp-107",
      type: "equipment_registry",
      fileName: "medical_assets_v2.xlsx",
      fileSize: "3.2 MB",
      importDate: "2026-06-04 11:00",
      status: "success",
      recordedBy: "Е. Жакипбаев (Инженер)",
      rowCount: 245,
      mappedFields: {
        "Инвентарлық №": "Inventory_No",
        "Жабдық атауы": "Asset_Name",
        "Орнатылған жылы": "Purchase_Year",
        "Баланстық сома": "Cost_Price",
        "Амортизация деңгейі": "Depreciation"
      }
    },
    {
      id: "imp-108",
      type: "maintenance_downtime",
      fileName: "equipment_repairs_log.xlsx",
      fileSize: "410 KB",
      importDate: "2026-06-04 11:30",
      status: "warning",
      recordedBy: "Е. Жакипбаев (Инженер)",
      rowCount: 98,
      mappedFields: {
        "Жабдық ID": "Asset_ID",
        "Тоқтап тұру күндері": "Downtime_Days",
        "Жөндеу шығыны": "Repair_Cost_KZT",
        "Ақау сипаттамасы": "Issue_Description"
      },
      errorDetails: "Ескерту: Жөндеу журналында 4 жолда жабдықтың инвентарлық баламасы жабдық тізілімінен табылмады."
    }
  ],
  "org-2": [
    {
      id: "imp-201",
      type: "services_registry",
      fileName: "jambyl_services_reconciliation.xlsx",
      fileSize: "28.5 MB",
      importDate: "2026-06-02 09:12",
      status: "success",
      recordedBy: "Ж. Келесбай (Бас Дәрігер орынбасары)",
      rowCount: 45100,
      mappedFields: {
        "Пациент ЖСН": "Patient_IIN",
        "Қызмет коды": "Service_Code",
        "Қызмет сомасы": "Amount_KZT",
        "Диагноз МКБ-10": "MKB10_Code",
        "Дәрігер аты-жөні": "Doctor_FullName",
        "Көрсетілген күні": "Service_Date"
      }
    },
    {
      id: "imp-202",
      type: "outsourcing_spend",
      fileName: "outsourcing_spend_v1.xlsx",
      fileSize: "5.6 MB",
      importDate: "2026-06-02 10:45",
      status: "error",
      recordedBy: "Н. Тұрғанбеков (Экономист)",
      rowCount: 0,
      mappedFields: {},
      errorDetails: "Қате: Бағандарды сәйкестендіру қатесі. 'Соисполнитель' бағаны файлдың құрамында табылмады."
    }
  ],
  "org-3": []
};

export const MOCK_DATA_QUALITY: Record<string, DataQualityReport> = {
  "org-1": {
    orgId: "org-1",
    completenessRate: 98.6,
    matchingRate: 94.2,
    duplicateRate: 1.84,
    invalidMkb10Count: 42,
    unmappedFieldsCount: 3,
    outlierCount: 15
  },
  "org-2": {
    orgId: "org-2",
    completenessRate: 91.4,
    matchingRate: 88.5,
    duplicateRate: 4.12,
    invalidMkb10Count: 184,
    unmappedFieldsCount: 12,
    outlierCount: 56
  },
  "org-3": {
    orgId: "org-3",
    completenessRate: 100,
    matchingRate: 100,
    duplicateRate: 0,
    invalidMkb10Count: 0,
    unmappedFieldsCount: 0,
    outlierCount: 0
  }
};

export const MOCK_SUBCONTRACTORS: Record<string, SubcontractorAnalytics[]> = {
  "org-1": [
    {
      id: "sub-1",
      name: "ТОО 'Invivo' зертханалар желісі",
      category: "Laboratory",
      totalPaid: 45200000,
      registeredServicesCount: 14500,
      actVsRegistryMismatch: 1250000, // Matching acts error (обналичивание/приписка)
      concentrationIndex: 28.5, // 28.5% of total outsource
      qualityScore: 92.5
    },
    {
      id: "sub-2",
      name: "КДЛ 'Олимп' ТОО",
      category: "Laboratory",
      totalPaid: 32400000,
      registeredServicesCount: 9200,
      actVsRegistryMismatch: 150000,
      concentrationIndex: 20.4,
      qualityScore: 98.1
    },
    {
      id: "sub-3",
      name: "МРТ Орталығы ТОО 'Medical Imaging'",
      category: "Imaging",
      totalPaid: 58900000,
      registeredServicesCount: 1980,
      actVsRegistryMismatch: 4800000, // Жоғары айырмашылық!
      concentrationIndex: 37.1,
      qualityScore: 84.2
    },
    {
      id: "sub-4",
      name: "Кардио-Клиника 'Сердце Сау' ТОО",
      category: "Clinical",
      totalPaid: 15600000,
      registeredServicesCount: 650,
      actVsRegistryMismatch: 0,
      concentrationIndex: 9.8,
      qualityScore: 95.0
    },
    {
      id: "sub-5",
      name: "СТО ЗТ 'Тараз-Стоматология'",
      category: "Consultation",
      totalPaid: 6500000,
      registeredServicesCount: 420,
      actVsRegistryMismatch: 450000,
      concentrationIndex: 4.2,
      qualityScore: 89.0
    }
  ],
  "org-2": [
    {
      id: "sub-201",
      name: "Облыстық Диагностикалық Орталық",
      category: "Imaging",
      totalPaid: 84500000,
      registeredServicesCount: 3800,
      actVsRegistryMismatch: 9600000,
      concentrationIndex: 65.4, // Монополиялық қауіп!
      qualityScore: 88.0
    },
    {
      id: "sub-202",
      name: "Анадолы Мед ЖШС",
      category: "Laboratory",
      totalPaid: 44700000,
      registeredServicesCount: 16500,
      actVsRegistryMismatch: 3100000,
      concentrationIndex: 34.6,
      qualityScore: 78.4
    }
  ]
};

export const MOCK_FRAUD_ALERTS: Record<string, FraudCase[]> = {
  "org-1": [
    {
      id: "fc-101",
      code: "DUP-101",
      ruleId: "duplicate_services",
      title: "Бір күнде қайталанған қымбат қызметтер (Duplicate Services)",
      description: "Пациентке бір күннің ішінде бірдей кодты МРТ/КТ қызметі екі рет көрсетілген.",
      severity: "critical",
      status: "new",
      detectedAt: "2026-06-04 12:30",
      patientId: "980415301412 (Ерматов Т.)",
      doctorName: "Дәрігер: Кадырова Д. А. (Невропатолог)",
      department: "Бөлімше: Консультациялық",
      flaggedAmount: 48000,
      assignedTo: "Мусаев С. (Медициналық эксперт)",
      notes: "Бұл пациенттің МРТ хаттамасын тексеру керек. Тіркелген құжат біреу ғана."
    },
    {
      id: "fc-102",
      code: "OVL-102",
      ruleId: "doctor_overload",
      title: "Шектен тыс дәрігерлік жүктеме (Executor Overload)",
      description: "Орындаушы дәрігердің бір күнде көрсеткен қызметтер саны 50-ден асқан (физикалық шектеу).",
      severity: "high",
      status: "investigating",
      detectedAt: "2026-06-04 14:15",
      patientId: "*Көпсұраныс жиынтығы*",
      doctorName: "Дәрігер: Смаилов Б. К. (Терапевт)",
      department: "Бөлімше: №1 Терапия",
      flaggedAmount: 185000,
      assignedTo: "Сейтжанова А. (Аудитор)",
      notes: "30 мамыр күні 1 терапевт дәрігер 104 қызмет көрсеткен. Бұл приписка немесе ӘМСҚ-қа жалған пакеттік есеп салу болуы мүмкін."
    },
    {
      id: "fc-103",
      code: "PAT-103",
      ruleId: "patient_day_anomaly",
      title: "Пациент-күн аномалиясы (Multi-service per Patient)",
      description: "Бір пациентке бір күнде МСАК деңгейінде 10-нан астам түрлі талдаулар салу.",
      severity: "medium",
      status: "approved",
      detectedAt: "2026-06-03 09:00",
      patientId: "010314401569 (Салимова М.)",
      doctorName: "Дәрігер: Асанова Г. (Педиатр)",
      department: "Бөлімше: №3 Педиатрия",
      flaggedAmount: 24000,
      notes: "Сәйкессіздік расталды. Мейіргердің қателігінен жолдамалар дубльденіп кеткен."
    },
    {
      id: "fc-104",
      code: "HOL-104",
      ruleId: "holiday_anomalies",
      title: "Мерекелік/Демалыс күнгі аномальді белсенділік",
      description: "Ресми демалыс/мереке күндері (Наурыз, Жаңа жыл) МИС-те жазылған жоспарлы қымбат қызметтер.",
      severity: "medium",
      status: "new",
      detectedAt: "2026-06-05 08:30",
      patientId: "Жиынтық (8 пациент)",
      doctorName: "Дәрігер: Талғатов О. О. (Сәулелі диагностика)",
      department: "Бөлімше: Радиология",
      flaggedAmount: 120000
    },
    {
      id: "fc-105",
      code: "UPC-105",
      ruleId: "upcoding_detection",
      title: "Пакеттік Upcoding (Диагнозды жасанды күрделендіру)",
      description: "Жеңіл диагноздармен (мысалы, ЖРВИ) келіп, МИС-ке қымбат диагностикалық қызметтер тіркелуі немесе созылмалы ауыр асқыну пакетін құру.",
      severity: "high",
      status: "new",
      detectedAt: "2026-06-05 10:20",
      patientId: "840912351234 (Жұмабеков А.)",
      doctorName: "Дәрігер: Ысқақова Л. (Инфекционист)",
      department: "Бөлімше: Жұқпалы аурулар",
      flaggedAmount: 340000,
      notes: "Диагнозы: J06 (Жоғарғы тыныс алу жолдарының жеңіл инфекциясы). Көрсетілген қызметтер: Кеуде қуысының КТ-зерттеуі және қымбат ПЦР панелі."
    }
  ],
  "org-2": [
    {
      id: "fc-201",
      code: "DUP-201",
      ruleId: "duplicate_services",
      title: "Дубликатты клиникалық қызметтер (Duplicate Services)",
      description: "Бір пациентке бір минут ішінде Жалпы қан талдауы 3 рет салынған.",
      severity: "medium",
      status: "new",
      detectedAt: "2026-06-03 15:45",
      patientId: "770112401823 (Боранбай С.)",
      doctorName: "Дәрігер: Кенжебаев Д. (Хирург)",
      department: "Бөлімше: Хирургия",
      flaggedAmount: 9000
    },
    {
      id: "fc-202",
      code: "OVL-202",
      ruleId: "doctor_overload",
      title: "Шектен тыс дәрігерлік жүктеме - 340 қызмет",
      description: "Дәрігер ауысымына 340 физиотерапиялық қызмет тіркеген (физикалық тұрғыда мүмкін емес).",
      severity: "critical",
      status: "new",
      detectedAt: "2026-06-04 09:30",
      patientId: "*Жалпы кабинет*",
      doctorName: "Дәрігер: Тулепова П. З. (Физиотерапевт)",
      department: "Бөлімше: Физиотерапия",
      flaggedAmount: 680000,
      notes: "Бағдарламалық автоматизация арқылы топтық пациенттерге қызмет салудың аномалиясы."
    }
  ]
};

export const MOCK_STAFF_ANALYTICS: Record<string, StaffAnalytics> = {
  "org-1": {
    totalPositions: 382.5,
    filledPositions: 351.0,
    vacanciesCount: 31.5,
    maternityLeaveCount: 14,
    retirementRiskCount: 8, // Бұл мамандар жуырда зейнетке шығады!
    criticalSpecialistsNeeded: [
      { specialty: "Невропатолог", count: 2 },
      { specialty: "Анестезиолог-Реаниматолог", count: 3 },
      { specialty: "Балалар ЛОР дәрігері", count: 1 },
      { specialty: "УДЗ (УЗИ) дәрігері", count: 2 }
    ],
    loadFactor: 38.5 // Дәрігеріне орташа есеппен күніне 38.5 қабылдау (норма 25-30)
  },
  "org-2": {
    totalPositions: 420,
    filledPositions: 345,
    vacanciesCount: 75, // Кадрлық үлкен тапшылық!
    maternityLeaveCount: 22,
    retirementRiskCount: 18,
    criticalSpecialistsNeeded: [
      { specialty: "Терапевт (супер-өткір)", count: 8 },
      { specialty: "Акушер-гинеколог", count: 4 },
      { specialty: "Педиатр", count: 5 },
      { specialty: "Кардиолог", count: 2 }
    ],
    loadFactor: 42.1
  },
  "org-3": {
    totalPositions: 210,
    filledPositions: 202,
    vacanciesCount: 8,
    maternityLeaveCount: 5,
    retirementRiskCount: 2,
    criticalSpecialistsNeeded: [
      { specialty: "Генетик", count: 1 }
    ],
    loadFactor: 24.2
  }
};

export const MOCK_EQUIPMENT: Record<string, EquipmentItem[]> = {
  "org-1": [
    {
      id: "eq-1",
      inventoryNo: "INV-ME-2019-01",
      name: "Компьютерлік Томограф (КТ) Aquilion Prime 160",
      department: "Сәулелі диагностика",
      purchaseYear: 2019,
      purchaseCost: 285000000,
      depreciationPercent: 70, // 70% тозған
      repairCount: 8,
      downtimeDays: 34, // 34 күн бос тұрды
      status: "warning"
    },
    {
      id: "eq-2",
      inventoryNo: "INV-ME-2022-04",
      name: "Магниттік-Резонанстық Томограф (МРТ) Philips Ingenia 1.5T",
      department: "Сәулелі диагностика",
      purchaseYear: 2022,
      purchaseCost: 450000000,
      depreciationPercent: 40,
      repairCount: 3,
      downtimeDays: 12,
      status: "usable"
    },
    {
      id: "eq-3",
      inventoryNo: "INV-ME-2015-08",
      name: "Стационарлық Цифрлық Рентген аппараты Redikom",
      department: "Рентгенология",
      purchaseYear: 2015,
      purchaseCost: 45000000,
      depreciationPercent: 100, // Толық амортизацияланған!
      repairCount: 14,
      downtimeDays: 85, // Бір жылда 85 күн жұмыс істемеген!
      status: "downtime"
    },
    {
      id: "eq-4",
      inventoryNo: "INV-ME-2021-12",
      name: "Ультрадыбыстық диагностика аппараты (УЗИ) Mindray Resona 7",
      department: "Неонатология",
      purchaseYear: 2021,
      purchaseCost: 28000000,
      depreciationPercent: 50,
      repairCount: 2,
      downtimeDays: 4,
      status: "usable"
    },
    {
      id: "eq-5",
      inventoryNo: "INV-ME-2018-09",
      name: "Биохимиялық автоматты анализатор Cobas c311",
      department: "Клиникалық зертхана",
      purchaseYear: 2018,
      purchaseCost: 38000000,
      depreciationPercent: 80,
      repairCount: 9,
      downtimeDays: 42,
      status: "usable"
    }
  ],
  "org-2": [
    {
      id: "eq-201",
      inventoryNo: "INV-JAMB-RT-01",
      name: "Рентген диагностикалық кешені Shimadzu",
      department: "Радиология",
      purchaseYear: 2013,
      purchaseCost: 65000000,
      depreciationPercent: 100,
      repairCount: 19,
      downtimeDays: 142, // Сындарлы деңгей жөндеуде тұр!
      status: "broken"
    },
    {
      id: "eq-202",
      inventoryNo: "INV-JAMB-USG-02",
      name: "Ультрадыбыстық Аппарат Aloka F37",
      department: "Терапия",
      purchaseYear: 2018,
      purchaseCost: 18000000,
      depreciationPercent: 80,
      repairCount: 5,
      downtimeDays: 18,
      status: "usable"
    }
  ]
};

export const MOCK_ROI_PROJECTS: Record<string, RoiPlannerItem[]> = {
  "org-1": [
    {
      id: "roi-1",
      equipmentName: "Цифрлық Маммография аппараты",
      category: "Сәулелі диагностика",
      monthlyOutsourceCost: 3500000, // Қазір айына соисполнительге кететін қаржы
      internalPurchasePrice: 42000000, // Өзімізге сатып алу құны
      monthlyInternalRunningCost: 800000, // Персонал + Амортизация
      projectedMonthlyVolume: 450, // Болжамды зерттеу саны
      paybackPeriodMonths: 15.5, // 15.5 айда ақталады (Payback Period)
      avoidedSpendYearly: 32400000, // Жылдық тиімділік/үнемдеу (Estimated Savings)
      recommendation: "internalize" // Сатып алу ұсынылады (Outsource vs Buy)
    },
    {
      id: "roi-2",
      equipmentName: "Автоматты КТ-инжектор және ИФА зертхана жинағы",
      category: "Клиникалық зертхана",
      monthlyOutsourceCost: 1800000,
      internalPurchasePrice: 8500000,
      monthlyInternalRunningCost: 450000,
      projectedMonthlyVolume: 1200,
      paybackPeriodMonths: 6.3, // Жылдам ақталу периоды!
      avoidedSpendYearly: 16200000,
      recommendation: "internalize"
    },
    {
      id: "roi-3",
      equipmentName: "ПТР Амплификатор талдау жүйесі (PCR Real-Time)",
      category: "Генетикалық зертхана",
      monthlyOutsourceCost: 2400000,
      internalPurchasePrice: 19000000,
      monthlyInternalRunningCost: 1100000,
      projectedMonthlyVolume: 800,
      paybackPeriodMonths: 14.6,
      avoidedSpendYearly: 15600000,
      recommendation: "lease" // Лизингке алу неғұрлым тиімді
    },
    {
      id: "roi-4",
      equipmentName: "Сәулелі Терапия (Линейный Ускоритель)",
      category: "Онкология",
      monthlyOutsourceCost: 12000000,
      internalPurchasePrice: 950000000, // Өте қымбат!
      monthlyInternalRunningCost: 4500000,
      projectedMonthlyVolume: 150,
      paybackPeriodMonths: 126.7, // Ақталу өте ұзақ
      avoidedSpendYearly: 90000000,
      recommendation: "keep_outsource" // Аутсорингте қалдырған жөн (Keep Outsource)
    }
  ],
  "org-2": [
    {
      id: "roi-201",
      equipmentName: "МРТ Аппараты 1.5 Тесла",
      category: "Радиология",
      monthlyOutsourceCost: 7800000,
      internalPurchasePrice: 380000000,
      monthlyInternalRunningCost: 2200000,
      projectedMonthlyVolume: 350,
      paybackPeriodMonths: 67.8,
      avoidedSpendYearly: 67200000,
      recommendation: "lease"
    }
  ]
};

export const MOCK_DASHBOARD_SUMMARIES: Record<string, DashboardSummary> = {
  "org-1": {
    totalOutsourceSpend: 158000000, // Жалпы қосалқы орындау сомасы
    privateSharePercent: 86.4, // Жекеменшік ТОО үлесі (%)
    hhiIndex: 2845, // Herfindahl concentration index (жасыл/сары < 2000, ауыр > 2500)
    duplicateRate: 1.84, // Деректерді қайталану пайызы
    flaggedFraudTotal: 717000, // Тәуекелге ілінген сома (KZT)
    staffCoveragePercent: 91.7, // Кадрлық қамту үлесі
    equipmentDowntimeTotal: 177, // Жалпы техникалық тоқтап тұру күндері (downtime-days)
    projectedAnnualSavings: 64200000 // ROI / Алдын алуға болатын шығыстар
  },
  "org-2": {
    totalOutsourceSpend: 129200000,
    privateSharePercent: 100.0,
    hhiIndex: 5472, // Қауіпті монополия! Тек 2 контрагент бар
    duplicateRate: 4.12,
    flaggedFraudTotal: 689000,
    staffCoveragePercent: 82.1,
    equipmentDowntimeTotal: 160,
    projectedAnnualSavings: 67200000
  },
  "org-3": {
    totalOutsourceSpend: 0,
    privateSharePercent: 0,
    hhiIndex: 0,
    duplicateRate: 0,
    flaggedFraudTotal: 0,
    staffCoveragePercent: 96.2,
    equipmentDowntimeTotal: 0,
    projectedAnnualSavings: 0
  }
};

// Тәуекелдерді талдау және сүзгі шектері (Settings & Thresholds)
export interface AnalysisThresholds {
  outsourceShareMax: number;        // Аутсорсинг қолайлы шегі %
  hhiConcentrationLimit: number;    // Максималды HHI концентрациясы (мысалы, 2500)
  maxDailyServicesPerDoctor: number;// Дәрігерге рұқсат етілген макс қызмет күніне
  duplicateTimeframeMinutes: number; // Тексеріс уақыты (минут)
  retirementAgeMen: number;
  retirementAgeWomen: number;
  criticalDowntimeDays: number;     // Сындық тұру күні жабдық үшін
}

export const DEFAULT_THRESHOLDS: AnalysisThresholds = {
  outsourceShareMax: 30, // 30% асса ескерту
  hhiConcentrationLimit: 2500, // 2500 асса монополия
  maxDailyServicesPerDoctor: 50, // 50-ден көп қызмет - аномалия
  duplicateTimeframeMinutes: 1440, // 24 сағаттағы бірдей қызметтер
  retirementAgeMen: 63,
  retirementAgeWomen: 58,
  criticalDowntimeDays: 30 // 30 күн асса қызыл белгі
};

// Анықтамалық сөздіктер (Reference Dictionaries)
export const ICD10_DICTIONARY = [
  { code: "J06.9", name: "Жіті жоғарғы тыныс алу жолдарының инфекциясы, анықталмаған (ОКИ, ЖРВИ)" },
  { code: "I10", name: "Эссенциалды [алғашқы] гипертензия (Қан қысымының көтерілуі)" },
  { code: "E11.9", name: "Инсулинге тәуелсіз қант диабеті (Екінші типті)" },
  { code: "Z03.9", name: "Ауру немесе күдікті жағдай бойынша медициналық бақылау мен сараптама" },
  { code: "K29.7", name: "Асқазанның гастриті, анықталмаған" },
  { code: "M54.5", name: "Бел ауруы (Люмбаго)" },
  { code: "J45.0", name: "Аллергия басымдығымен өтетін демікпе (Астма)" },
  { code: "Z01.0", name: "Көз және көру сапасын зерттеу (Офтальмолог қарауы)" }
];

export const SERVICE_CODES_DICTIONARY = [
  { code: "A05.04.001", name: "Үш өлшемді ультрадыбыстық зерттеу (УЗИ 3D/4D)" },
  { code: "A11.08.003", name: "Магниттік-резонанстық томография (МРТ), контрастсыз" },
  { code: "A11.08.005", name: "Компьютерлік томография (КТ), кеуде қуысы немесе ми" },
  { code: "B01.015.001", name: "Қанның жалпы анализы (6 параметрмен)" },
  { code: "C12.001.002", name: "ПТР-әдісі арқылы инфекция қоздырғыштарын анықтау (PCR)" },
  { code: "D04.015.020", name: "Кардиолог дәрігердің амбулаториялық кеңесі және ЭКГ" }
];
