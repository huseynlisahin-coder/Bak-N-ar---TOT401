import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { CASES } from '../data/cases';
import { InterrogateApiRequest, InterrogateApiResponse } from '../types/game';

export interface HandlerResult {
  status: number;
  body: InterrogateApiResponse | { error: string };
}

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
  callModel: (
    model: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite',
    thinkingLevel: ThinkingLevel
  ) => Promise<any>
): Promise<any> {
  const attempts: {
    model: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';
    thinkingLevel: ThinkingLevel;
  }[] = [
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

export async function processInterrogation(
  body: Partial<InterrogateApiRequest>
): Promise<HandlerResult> {
  if (!body.caseId || !body.suspectId || !body.tactic || !body.question?.trim()) {
    return {
      status: 400,
      body: {
        error: 'Sorğu parametrləri natamamdır. Zəhmət olmasa sual və taktik seçimi göndərin.',
      },
    };
  }

  const activeCase = CASES.find((c) => c.id === body.caseId);
  if (!activeCase) {
    return { status: 404, body: { error: 'Cinayət işi tapılmadı.' } };
  }

  const suspect = activeCase.suspects.find((s) => s.id === body.suspectId);
  if (!suspect) {
    return { status: 404, body: { error: 'Şübhəli tapılmadı.' } };
  }

  const ai = getGeminiClient();
  if (!ai) {
    return {
      status: 500,
      body: {
        error:
          'GEMINI_API_KEY tapılmadı. AI Studio-da Settings > Secrets bölməsindən, Vercel-də isə Project Settings > Environment Variables bölməsindən GEMINI_API_KEY əlavə edin.',
      },
    };
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
  const currentStress = Math.max(
    0,
    Math.min(100, Number(body.currentStress ?? suspect.initialStress))
  );
  const currentTrust = Math.max(
    0,
    Math.min(100, Number(body.currentTrust ?? suspect.initialTrust))
  );

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
      return {
        status: 500,
        body: {
          error: 'AI modelindən boş cavab alındı. Zəhmət olmasa sualı yenidən göndərin.',
        },
      };
    }

    const parsed = JSON.parse(stripCodeFences(rawText)) as InterrogateApiResponse;

    const validContradiction = uncaughtContradictions.some(
      (c) => c.evidenceId === parsed.caughtContradictionId
    )
      ? parsed.caughtContradictionId
      : '';

    const boundedStressDelta = Math.max(
      -15,
      Math.min(35, Math.round(Number(parsed.stressDelta) || 0))
    );
    const boundedTrustDelta = Math.max(
      -30,
      Math.min(25, Math.round(Number(parsed.trustDelta) || 0))
    );

    return {
      status: 200,
      body: {
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
      },
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Gemini API interrogation error:', errorMessage);

    if (
      errorMessage.includes('403') ||
      errorMessage.includes('API_KEY_INVALID') ||
      errorMessage.includes('400')
    ) {
      return {
        status: 401,
        body: {
          error:
            'Gemini API açarı etibarsızdır və ya icazə xətası var. Settings > Secrets (və ya Vercel Environment Variables) bölməsində açarı yoxlayın.',
        },
      };
    }

    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return {
        status: 429,
        body: {
          error: 'Sorğu limiti dolub (429). Bir neçə saniyə gözləyib yenidən cəhd edin.',
        },
      };
    }

    if (
      errorMessage.includes('503') ||
      errorMessage.includes('UNAVAILABLE') ||
      errorMessage.includes('high demand') ||
      errorMessage.includes('TIMEOUT')
    ) {
      return {
        status: 500,
        body: {
          error:
            'AI dindirmə xidməti hazırda yüksək yüklənmə altındadır və ya cavab gecikir. Zəhmət olmasa "Yenidən Göndər" düyməsi ilə təkrar cəhd edin.',
        },
      };
    }

    return {
      status: 500,
      body: {
        error: `Dindirmə xidməti xətası: ${errorMessage}`,
      },
    };
  }
}
