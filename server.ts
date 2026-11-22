import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { CASES } from './src/data/cases.ts';
import { InterrogateApiRequest, InterrogateApiResponse } from './src/types/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isTransientError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('high demand') ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('TIMEOUT') ||
    msg.includes('fetch failed')
  );
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
  }
  return trimmed;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('TIMEOUT: AI cavab vaxtı bitdi')), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function generateWithFallback(
  callModel: (model: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel) => Promise<any>
): Promise<any> {
  const attempts: { model: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite'; thinkingLevel: ThinkingLevel }[] = [
    { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW },
    { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
  ];

  let lastError: unknown;
  for (let i = 0; i < attempts.length; i++) {
    const { model, thinkingLevel } = attempts[i];
    try {
      return await withTimeout(callModel(model, thinkingLevel), 8500);
    } catch (err) {
      lastError = err;
      if (i < attempts.length - 1 && isTransientError(err)) {
        await sleep(250);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/interrogate', async (req, res) => {
    const body = req.body as Partial<InterrogateApiRequest>;

    if (!body.caseId || !body.suspectId || !body.tactic || !body.question?.trim()) {
      res.status(400).json({
        error: 'Sorğu parametrləri natamamdır. Zəhmət olmasa sual və taktik seçimi göndərin.',
      });
      return;
    }

    const activeCase = CASES.find((c) => c.id === body.caseId);
    if (!activeCase) {
      res.status(404).json({ error: 'Cinayət işi tapılmadı.' });
      return;
    }

    const suspect = activeCase.suspects.find((s) => s.id === body.suspectId);
    if (!suspect) {
      res.status(404).json({ error: 'Şübhəli tapılmadı.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(500).json({
        error:
          'Gemini API açarı (GEMINI_API_KEY) konfiqurasiya edilməyib. Zəhmət olmasa AI Studio Settings > Secrets bölməsində açarı yoxlayın.',
      });
      return;
    }

    const discoveredEvidence = activeCase.evidence.filter((e) =>
      (body.discoveredEvidenceIds || []).includes(e.id)
    );
    const attachedEvidence = body.attachedEvidenceId
      ? discoveredEvidence.find((e) => e.id === body.attachedEvidenceId)
      : undefined;

    const uncaughtContradictions = suspect.keyContradictions.filter(
      (kc) => !(body.caughtContradictionIds || []).includes(kc.evidenceId)
    );

    const skills = body.detectiveSkills || { logic: 1, psychology: 1, pressure: 1 };
    const currentStress = Math.max(0, Math.min(100, Number(body.currentStress ?? suspect.initialStress)));
    const currentTrust = Math.max(0, Math.min(100, Number(body.currentTrust ?? suspect.initialTrust)));

    const tacticGuide: Record<string, string> = {
      empathy:
        'Detektiv EMPATİYA və ETİBAR taktikası işlədir: yumşaq, anlayışlı danışır. Normalda etibar artır (+8..+18), stres bir az azalır (-12..0).',
      pressure:
        'Detektiv SƏRT TƏZYİQ taktikası işlədir: sərt, ittihamedici tərzdə danışır. Stres artır (+12..+28), etibar düşür (-18..-5).',
      logic_trap:
        'Detektiv MƏNTİQİ TƏLƏ qurur: vaxt ziddiyyətini və ya alibi boşluğunu yoxlayır. Stres artır (+8..+18), etibar sabit və ya -5..+5.',
      present_evidence:
        'Detektiv SÜBUT TƏQDİM EDİR: masaya konkret dəlil qoyaraq şübhəlini üzləşdirir. Əgər sübut bu şübhəlinin ziddiyyətlərindən birinə uyğundursa, stres kəskin artır (+20..+35) və həmin ziddiyyət ifşa olunur.',
    };

    const historyText = (body.history || [])
      .slice(-8)
      .map((h) => `${h.sender === 'detective' ? 'Detektiv' : suspect.name}: ${h.text}`)
      .join('\n');

    const systemInstruction = `Sən müasir Bakıda neo-nuar üslubunda "Bakı Nuarı: Dindirmə Otağı" detektiv RPG oyununda dindirilən şübhəlisən.
Yalnız Azərbaycan dilində təbii, dramatik, canlı danışıq və ədəbi üslubda cavab ver.

ŞÜBHƏLİ PROFİLİ:
- Ad: ${suspect.name} (${suspect.age} yaş), Vəzifə: ${suspect.role}
- Şəxsiyyət: ${suspect.personality}
- Rəsmi Alibi: ${suspect.alibiSummary}
- GİZLİ HƏQİQƏT (bunu yalnız təzyiq/dəlil/etibar şərtləri yerinə yetəndə mərhələli aç): ${suspect.secretTruth}

CARİ PSİXOLOJİ VƏZİYYƏT:
- Stres: ${currentStress}/100 (85+ olduqda şübhəli panikaya düşür, səsi titrəyir, etirafa və ya müdafiə səhvinə meyllənir)
- Etibar: ${currentTrust}/100 (10 və ya aşağı düşsə şübhəli vəkil tələb edib susa bilər)
- Detektivin RPG Bacarıqları: Məntiq ${skills.logic}/5, Psixologiya ${skills.psychology}/5, Təzyiq ${skills.pressure}/5.

BU ŞÜBHƏLİNİN HƏLƏ TUTULMAMIŞ ƏSAS ZİDDİYYƏTLƏRİ (evidenceId -> məzmun):
${
  uncaughtContradictions.length > 0
    ? uncaughtContradictions
        .map((c) => {
          const ev = activeCase.evidence.find((e) => e.id === c.evidenceId);
          return `- ${c.evidenceId} (${ev?.title || ''}): ${c.description}`;
        })
        .join('\n')
    : '- Bu şübhəlinin bütün əsas ziddiyyətləri artıq tutulub və ya əsas ziddiyyəti yoxdur.'
}

QAYDALAR:
1. "reply": Şübhəlinin 2-4 cümləlik cavabı. Qətiyyən oyun termini ("NPC", "stres balı" və s.) işlətmə.
2. "microExpression": Detektivin müşahidə etdiyi qısa bədən dili və üz ifadəsi (məs: "Sol əli ilə stəkanı sıxır və göz təmasından yayınır").
3. "lieHint": Detektivin Psixologiya (${skills.psychology}/5) və Məntiq (${skills.logic}/5) bacarığına görə qısa analitik qeyd (məs: "Saatlar barədə danışarkən səsi kəsildi — bu hissədə gizlətdiyi nəsə var" və ya "Səmimi görünür, alibisində təzad hiss olunmur").
4. "caughtContradictionId": Əgər detektiv həqiqətən yuxarıdakı tutulmamış ziddiyyətlərdən birinin əsas faktını sualda vurğulayıbsa və ya uyğun "attachedEvidence" təqdim edibsə, HƏMİN dəqiq evidenceId-ni yaz (məs: "ev-1-log"). Əks halda boş sətir "" qaytar.
5. "willDemandLawyer": Yalnız etibar (${currentTrust} + trustDelta <= 8) kritik həddə düşdükdə və taktika "pressure" olduqda true qaytar (əgər Təzyiq bacarığı >= 4-dürsə daha dözümlü ol).
6. "suggestedFollowUps": Oyunçunun növbəti gedişdə soruşa biləcəyi 2 qısa, kəskin Azərbaycan dilində davam sualı.
7. Qətiyyən "İttiham aktı ver", "dindirmə bitdi" kimi yekun oyun yönləndirmələri yazma; istintaqçı yeni suallar verməyə davam edir.`;

    const promptContent = `İŞ: ${activeCase.title} (${activeCase.location})
TAKTİKA: ${tacticGuide[body.tactic] || body.tactic}
${
  attachedEvidence
    ? `TƏQDİM OLUNAN SÜBUT (${attachedEvidence.id}): ${attachedEvidence.title} — ${attachedEvidence.summary} (${attachedEvidence.detail})`
    : 'TƏQDİM OLUNAN SÜBUT: Yoxdur'
}

SON DİALOQ TARİXÇƏSİ:
${historyText || '(Yeni dindirmə sessiyası)'}

DETEKTİVİN SUALLARI / SÖZLƏRİ:
"${body.question.trim()}"`;

    try {
      const response = await generateWithFallback((model, thinkingLevel) =>
        ai.models.generateContent({
          model,
          contents: promptContent,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description: 'Şübhəlinin Azərbaycan dilində 2-4 cümləlik cavabı.',
                },
                microExpression: {
                  type: Type.STRING,
                  description: 'Şübhəlinin qısa bədən dili və ya üz ifadəsi müşahidəsi.',
                },
                lieHint: {
                  type: Type.STRING,
                  description: 'Detektiv üçün qısa psixoloji analiz ipucu.',
                },
                stressDelta: {
                  type: Type.INTEGER,
                  description: 'Stres dəyişimi (-15 ilə +35 arası tam ədəd).',
                },
                trustDelta: {
                  type: Type.INTEGER,
                  description: 'Etibar dəyişimi (-30 ilə +25 arası tam ədəd).',
                },
                caughtContradictionId: {
                  type: Type.STRING,
                  description: 'İfşa olunan ziddiyyətin dəlil ID-si və ya boş sətir.',
                },
                willDemandLawyer: {
                  type: Type.BOOLEAN,
                  description: 'Şübhəli vəkil tələb edib susursa true.',
                },
                suggestedFollowUps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Oyunçu üçün 2 qısa davam sualı təklifi.',
                },
              },
              required: [
                'reply',
                'microExpression',
                'lieHint',
                'stressDelta',
                'trustDelta',
                'caughtContradictionId',
                'willDemandLawyer',
                'suggestedFollowUps',
              ],
            },
          },
        })
      );

      const rawText = response.text;
      if (!rawText) {
        res.status(500).json({
          error: 'AI modelindən boş cavab alındı. Zəhmət olmasa sualı yenidən göndərin.',
        });
        return;
      }

      const parsed = JSON.parse(stripCodeFences(rawText)) as InterrogateApiResponse;

      // Validate contradiction ID belongs to suspect's uncaught list
      const validContradiction = uncaughtContradictions.some(
        (c) => c.evidenceId === parsed.caughtContradictionId
      )
        ? parsed.caughtContradictionId
        : '';

      const boundedStressDelta = Math.max(-15, Math.min(35, Math.round(Number(parsed.stressDelta) || 0)));
      const boundedTrustDelta = Math.max(-30, Math.min(25, Math.round(Number(parsed.trustDelta) || 0)));

      res.json({
        reply: parsed.reply || '...',
        microExpression: parsed.microExpression || 'Sakitcə masaya baxır.',
        lieHint: parsed.lieHint || 'İfadədə qeyri-adi detal sezilmədi.',
        stressDelta: boundedStressDelta,
        trustDelta: boundedTrustDelta,
        caughtContradictionId: validContradiction,
        willDemandLawyer: Boolean(parsed.willDemandLawyer),
        suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps)
          ? parsed.suggestedFollowUps.slice(0, 2)
          : [],
      } satisfies InterrogateApiResponse);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Gemini API interrogation error:', errorMessage);

      if (errorMessage.includes('403') || errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('400')) {
        res.status(401).json({
          error:
            'Gemini API açarı etibarsızdır və ya icazə xətası var. Settings > Secrets bölməsində açarı yoxlayın.',
        });
        return;
      }

      if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error: 'Sorğu limiti dolub (429). Bir neçə saniyə gözləyib yenidən cəhd edin.',
        });
        return;
      }

      if (
        errorMessage.includes('503') ||
        errorMessage.includes('UNAVAILABLE') ||
        errorMessage.includes('high demand') ||
        errorMessage.includes('TIMEOUT')
      ) {
        res.status(500).json({
          error:
            'AI dindirmə xidməti hazırda yüksək yüklənmə altındadır və ya cavab gecikir. Zəhmət olmasa "Yenidən Göndər" düyməsi ilə təkrar cəhd edin.',
        });
        return;
      }

      res.status(500).json({
        error: `Dindirmə xidməti xətası: ${errorMessage}`,
      });
    }
  });

  // Ensure unknown /api/* routes always return JSON instead of falling through to index.html
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API marşrutu tapılmadı.' });
  });

  // Ensure Express body-parser or unexpected middleware errors always return JSON
  app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api')) {
      const message = err instanceof Error ? err.message : 'Server daxili xətası.';
      res.status(500).json({ error: message });
      return;
    }
    next(err);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bakı Nuarı server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
