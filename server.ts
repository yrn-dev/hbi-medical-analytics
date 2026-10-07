/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const AI_API_URL = process.env.AI_API_URL || 'https://llm.alem.ai/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'gpt-oss';

function getApiKey(): string {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || apiKey === 'MY_AI_API_KEY') {
    throw new Error('AI_API_KEY environment variable is missing. Please set it in the .env file (see .env.example).');
  }
  return apiKey;
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Enforce JSON body parsing
  app.use(express.json({ limit: '10mb' }));

  // API Route for AI Medical Compliance & Risk Analysis
  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const { orgName, metrics, alerts, equipmentDowntime, roiPlanner, requestDetails } = req.body;

      const prompt = `Сіз емханалар мен ауруханалардың басшылығына тәуекелдерді басқару және комплаенс-бақылау бойынша кәсіби кеңес беретін талдаушы AI экспертісіз.
Ұйым атауы: ${orgName || "Дерексіз емхана"}
Ағымдағы көрсеткіштер мен басты KPI деректері:
- Қосалқы орындау (аутсорсинг) шығыстары: ${metrics?.totalOutsourceSpend?.toLocaleString() || "0"} KZT
- Жекеменшік сектордың үлесі: ${metrics?.privateSharePercent || "0"}%
- Концентрацияланған HHI индексі: ${metrics?.hhiIndex || "0"} (серіктес ТОО-лар арасында қаржы шоғырлануы)
- Тіркелген дубликатты қызметтер үлесі: ${metrics?.duplicateRate || "0"}%
- Жабдықтардың жалпы downtime күндері (бір жылда): ${metrics?.equipmentDowntimeTotal || "0"} күн
- Кадрлық штаттың толуы: ${metrics?.staffCoveragePercent || "0"}%
- Болжамды жылдық тиімді үнемдеу мүмкіндігі (кезекті ішкі жабдықты сатып алу арқылы): ${metrics?.projectedAnnualSavings?.toLocaleString() || "0"} KZT

Анықталған қауіпті аномалиялар/сигналдар (Alerts) тізімі:
${alerts && alerts.length > 0 ? alerts.map((a: any, index: number) => `${index + 1}. [${a.severity.toUpperCase()}] ${a.title}: ${a.description} (Қатысушы: ${a.doctorName || "Көрсетілмеген"}, Күдікті Сома: ${a.flaggedAmount?.toLocaleString()} KZT)`).join('\n') : "Күдікті аномалиялар табылған жоқ."}

Жабдықтардың тоқтауы (downtime):
${equipmentDowntime && equipmentDowntime.length > 0 ? equipmentDowntime.map((e: any) => `- ${e.name} (Бөлім: ${e.department}, Тозу деңгейі: ${e.depreciationPercent}%, Ақау саны: ${e.repairCount}, Downtime: ${e.downtimeDays} күн)`).join('\n') : "Деректер жоқ немесе тұрақты."}

ROI Ішкі сатып алу кандидаты (Outsource vs Buy):
${roiPlanner && roiPlanner.length > 0 ? roiPlanner.map((r: any) => `- ${r.equipmentName} (${r.category}): Қазіргі аутсорс айлық шығысы: ${r.monthlyOutsourceCost?.toLocaleString()} KZT, Сатып алу құны: ${r.internalPurchasePrice?.toLocaleString()} KZT, Ақталу мерзімі: ${r.paybackPeriodMonths} ай, Ұсыныс: ${r.recommendation}`).join('\n') : "Деректер жоқ."}

Пайдаланушының нақты сұранысы мен бағыты:
${requestDetails || "Жалпы медициналық комплаенс, аутсорсинг концентрациясы және кадрлық-техникалық тәуекелдер бойынша егжей-тегжейлі қызметтік баяндама (Decision Memo / Analytical narrative) және нақты шешімдер жоспарын қазақ тілінде құрастырыңыз."}

Берілетін құжат келесі құрылымдарды сақтап, жоғары деңгейлі қаржылық және клиникалық терминологиямен, ресми стильде (қазақ тілінде) жазылуы тиіс:
1. **Жалпы Тәуекел Статусы мен Кіріспе** (Емхана немесе аурухананың басқарушылық ахуалын бағалау)
2. **Аутсорсинг пен Мүдделер Конфликтісінің Аналитикасы** (HHI индексіне, жеке серіктестердің үстемдігіне және 'actVsRegistryMismatch' сыртқы шығыс сәйкессіздігіне талдау)
3. **Клиникалық Манипуляция мен Фрод (Приписка) Қатерлері** (Executor Overload, Duplicate, Upcoding секілді анықталған нақты кейстердің клиникалық мағынасын түсіндіру)
4. **Кадрлық және Техникалық Қауіпсіздікті Болжау** (Downtime шектен асуы және зейнетке кету/декрет кезеңіндегі кадрлық саңылауларды жою жолдары)
5. **Инвестициялық және Мемлекеттік ROI Жақсарту Ұсыныстары** (Outsource vs Buy бойынша қай жабдықтарды ішкі сатып алуға жіберу керек және оның қаржылық тиімділігі)
6. **Басшылыққа арналған Қорытынды Бұйрықтар жоспары** (3-4 нақты қадам).`;

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            {
              role: 'system',
              content: 'Сіз емханалар мен ауруханалардың басшылығына тәуекелдерді басқару және комплаенс-бақылау бойынша кәсіби кеңес беретін талдаушы AI экспертісіз. Жауапты ресми стильде, қазақ тілінде, markdown форматында беріңіз.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`AI API қатесі (${response.status}): ${detail.slice(0, 300)}`);
      }

      const data: any = await response.json();
      const explanation = data?.choices?.[0]?.message?.content || "Талдау нәтижесін генерациялау мүмкін болмады.";
      res.json({ success: true, explanation });
    } catch (error: any) {
      console.error("AI analysis error:", error);
      res.status(500).json({ success: false, error: error?.message || "Ішкі серверлік қате" });
    }
  });

  // Serve static files in production or proxy Vite in development
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html for any SPA calls
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HBI Server] Running at http://localhost:${PORT} under NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server startup error:", err);
});
