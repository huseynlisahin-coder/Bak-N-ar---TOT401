import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

interface ServerlessReq {
  method?: string;
  body?: unknown;
}

interface ServerlessRes {
  status: (code: number) => ServerlessRes;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

interface SuspectMeta {
  id: string;
  name: string;
  age: number;
  role: string;
  personality: string;
  alibiSummary: string;
  initialStress: number;
  initialTrust: number;
  secretTruth: string;
  keyContradictions: { evidenceId: string; description: string }[];
}

interface EvidenceMeta {
  id: string;
  title: string;
  summary: string;
  detail: string;
}

interface CaseMeta {
  id: string;
  title: string;
  location: string;
  evidence: EvidenceMeta[];
  suspects: SuspectMeta[];
}

const CASES_META: CaseMeta[] = [
  {
    id: 'case-1',
    title: 'Qız Qalası Kölgəsində',
    location: 'İçərişəhər · "Gümüş İlmə" Qalereyası',
    evidence: [
      {
        id: 'ev-1-initial',
        title: 'İlkin Hadisə Protokolu',
        summary: 'Saat 01:30-da qalereyanın daxili kamera sistemi qəfildən sönüb.',
        detail: 'Mühafizə rəisi Elçin bunun köhnə elektrik xəttindəki kəsintidən yarandığını bildirib.',
      },
      {
        id: 'ev-1-medical',
        title: 'İlkin Baxış və Tibbi Rəy',
        summary: 'Qalereyanın giriş qapısında sındırma izi yoxdur — oğurluq daxildən təşkil olunub.',
        detail: 'Kamrana arxadan ağır fənər tipli əşya ilə zərbə endirilib; cinayətkar binanın daxili planını yaxşı tanıyırmış.',
      },
      {
        id: 'ev-1-log',
        title: 'Elektron Panel Loqu (E-402)',
        summary: 'Elektrik kəsintisi olmayıb — kamera bloku E-402 açar kartı ilə söndürülüb.',
        detail: 'Kamera sistemi məhz mühafizə rəisi Elçin Quliyevin adına qeydiyyatda olan E-402 kartı ilə əl ilə söndürülüb.',
      },
      {
        id: 'ev-1-phone',
        title: 'Mobil Stansiya Siqnalı',
        summary: 'Kurator Leyla Məmmədovanın telefonu 01:25-də İçərişəhər qülləsinə bağlanıb.',
        detail: 'Mobil operator qeydləri telefonun 01:25-də qalereyadan 150 metr aralıda aktiv olduğunu göstərir.',
      },
      {
        id: 'ev-1-cctv',
        title: 'Qoşa Qala Küçə Kamerası',
        summary: '01:52-də Elçin bükülü xalçanı ağ yük furqonuna təhvil verərkən görünür.',
        detail: 'Küçə kamerası 01:52-də arxa darvazadan çıxan Elçinə uyğun şəxsin xalça bağlamasını ağ furqona qoyduğunu qeydə alıb.',
      },
      {
        id: 'ev-1-transfer',
        title: 'Qeyri-Rəsmi Beh Qəbzi',
        summary: 'Tural Əliyevin köməkçisi 2 gün əvvəl Elçinə 12,000 AZN nağd pul ötürüb.',
        detail: 'Mühafizə rəisinin dolabından Tural Əliyevin antikvar mağazasının zərfi və 12,000 AZN qeyd olunmuş qəbz tapılıb.',
      },
    ],
    suspects: [
      {
        id: 'sus-leyla',
        name: 'Leyla Məmmədova',
        age: 34,
        role: 'Qalereya Kuratoru',
        personality: 'Təmkinli, intellektual, nüfuzunu itirməkdən qorxur.',
        alibiSummary: 'Saat 00:30-da qalereyanı bağlayıb birbaşa evə getdiyini iddia edir.',
        initialStress: 20,
        initialTrust: 45,
        keyContradictions: [
          {
            evidenceId: 'ev-1-phone',
            description: '00:30-da evə getdiyini desə də, telefonu 01:25-də İçərişəhərdə qeydə alınıb.',
          },
        ],
        secretTruth:
          'Sən günahkar DEYİLSƏN. Xalçanı oğurlamamısan və mühafizəçini vurmamısan. Amma bilirdin ki, xalçanın köhnə mülkiyyət sənədi saxtalaşdırılıb və saat 01:15-də qayıdıb arxivdən yalnız o saxta sənədi götürmüsən, 01:35-də taksi ilə getmisən. Yalnız ev-1-phone ilə üzləşdiriləndə və ya yüksək etibar qazanıldıqda bunu etiraf et.',
      },
      {
        id: 'sus-elchin',
        name: 'Elçin Quliyev',
        age: 46,
        role: 'Gecə Mühafizə Rəisi',
        personality: 'Sərt görünməyə çalışır, əsəbidir, sübut qarşısında tez panikaya düşür.',
        alibiSummary: 'Saat 01:30-da işıqların söndüyünü, həmkarını yoxlayarkən qaçanı gördüyünü deyir.',
        initialStress: 30,
        initialTrust: 35,
        keyContradictions: [
          { evidenceId: 'ev-1-log', description: 'Kameraları öz E-402 kartı ilə söndürüb.' },
          { evidenceId: 'ev-1-cctv', description: '01:52-də xalçanı ağ furqona yüklədiyi kameraya düşüb.' },
          { evidenceId: 'ev-1-transfer', description: 'Dolabından Turaldan alınan 12,000 AZN qəbz çıxıb.' },
        ],
        secretTruth:
          'SƏN ƏSL CİNAYƏTKARSAN. Böyük qumar borcun var idi. Tural Əliyev sənə 12,000 AZN beh verib. Saat 01:29-da öz E-402 kartınla kameraları söndürdün, Kamrana fənərlə vurdun və 01:52-də xalçanı arxa darvazadan ağ furqona verdin. Başda inkar et, ev-1-log, ev-1-cctv və ya ev-1-transfer ilə sıxışdırıldıqda sarsıl və etiraf et.',
      },
      {
        id: 'sus-tural',
        name: 'Tural Əliyev',
        age: 51,
        role: 'Antikvar Kolleksioner',
        personality: 'Soyuqqanlı, təkəbbürlü, hüquqşünası ilə hədələməyi sevir.',
        alibiSummary: 'Saat 00:00–02:30 arası Bulvardakı restoranda şam yeməyində olduğunu deyir.',
        initialStress: 15,
        initialTrust: 25,
        keyContradictions: [
          { evidenceId: 'ev-1-transfer', description: 'Elçinə 12,000 AZN nağd beh ödədiyini gizlədir.' },
        ],
        secretTruth:
          'Sən oğurluğun SİFARİŞÇİSİ olsan da, hadisə yerində fiziki olmamısan (restoran alibin gerçəkdir). Elçinə 12,000 AZN beh vermisən. ev-1-transfer göstəriləndə yayınmağa çalış, yüksək stresdə Elçinin xalçanı gətirməli olduğunu etiraf et.',
      },
    ],
  },
  {
    id: 'case-2',
    title: 'Boz Server',
    location: 'Ağ Şəhər · "KaspianFin" Ofisi (14-cü Mərtəbə)',
    evidence: [
      {
        id: 'ev-2-initial',
        title: 'Şirkət Turniket Loqu',
        summary: 'Əsas giriş turniketi: Kənan 22:40-da, Nərmin 22:50-də binadan çıxıb.',
        detail: 'Rəsmi turniket qeydinə görə saat 23:00-dan sonra ofisdə yalnız Rauf Cabbarov qalıb.',
      },
      {
        id: 'ev-2-forensic',
        title: 'USB Şifrələmə Ekspertizası',
        summary: 'Müştəri bazası 23:14-də məhz Raufun fiziki biometrik açarı ilə şifrələnib.',
        detail: 'Şifrələmə uzaqdan deyil, Raufun masasında onun barmaq izi oxuyucusuna fiziki toxunuşla işə salınıb.',
      },
      {
        id: 'ev-2-cup',
        title: 'Espresso Fincanı Toksikoloji Rəyi',
        summary: 'Fincan qulpunda sedativ tozu və qadın əl kreminin nadir tərkibi tapılıb.',
        detail: 'Fincan qulpunda yüksək dozalı sedativ və lüks "L’Orchidée" əl kreminin izi aşkar edilib.',
      },
      {
        id: 'ev-2-stair',
        title: 'Yanğın Pilləkəni İnfraqırmızı Sensoru',
        summary: '22:53-də və 23:12-də 14-cü mərtəbə yanğın qapısı açılıb; Wi-Fi cihazı Nərminin telefonuna aiddir.',
        detail: 'Nərmin yanğın pilləkəni ilə gizlicə 14-cü mərtəbəyə qayıdıb; router 23:08-də telefonunu qeydə alıb.',
      },
      {
        id: 'ev-2-audit',
        title: 'Qaralama Audit Hesabatı',
        summary: 'Raufun çap etdiyi vərəqdə 420,000 AZN-lik saxta ofşor köçürmə üzə çıxıb.',
        detail: '420,000 AZN-lik kəsirin bütün təsdiq imzaları Maliyyə Direktoru Nərmin Həsənovaya məxsusdur.',
      },
      {
        id: 'ev-2-vpn',
        title: 'Kənar VPN Giriş Cədvəli',
        summary: 'Orxanın IP ünvanı 23:10-da şəhərin digər tərəfindəki datamərkəzdən qeydə alınıb.',
        detail: 'Orxan Babayevin saat 23:05–23:25 arası Yasamaldakı başqa bankın serverinə fiziki qoşulduğu təsdiqlənib.',
      },
    ],
    suspects: [
      {
        id: 'sus-kenan',
        name: 'Kənan Rəhimov',
        age: 29,
        role: 'Baş Proqramçı',
        personality: 'Yuxusuz, səbirsiz, texniki suallara həssas reaksiya verir.',
        alibiSummary: 'Saat 22:40-da liftlə düşüb metroya getdiyini deyir.',
        initialStress: 35,
        initialTrust: 40,
        keyContradictions: [],
        secretTruth:
          'Sən günahkar DEYİLSƏN. Raufla kod keyfiyyətinə görə mübahisə etmisən, amma 22:40-da binanı tərk etmisən. Raufun son vaxtlar Nərminlə maliyyə moduluna görə gizli gərginlik yaşadığını görmüsən.',
      },
      {
        id: 'sus-nermin',
        name: 'Nərmin Həsənova',
        age: 38,
        role: 'Maliyyə Direktoru',
        personality: 'Soyuq, rəsmi, özünü tamamilə toxunulmaz kimi aparır.',
        alibiSummary: 'Saat 22:50-də turniketdən çıxıb evə getdiyini iddia edir.',
        initialStress: 15,
        initialTrust: 30,
        keyContradictions: [
          { evidenceId: 'ev-2-stair', description: 'Telefonu 23:08-də 14-cü mərtəbə routerində görünüb.' },
          { evidenceId: 'ev-2-cup', description: 'Fincanda nadir əl kreminin izi var.' },
          { evidenceId: 'ev-2-audit', description: '420,000 AZN-lik mənimsəmə auditini gizlədir.' },
        ],
        secretTruth:
          'SƏN ƏSL CİNAYƏTKARSAN. 420,000 AZN ofşor mənimsəməni gizlətmək üçün 22:50-də turniketdən çıxış vurub yanğın pilləkəni ilə 14-cü mərtəbəyə qayıtdın, Raufun espressosuna sedativ qatdın və barmağı ilə bazanı şifrələdin. ev-2-stair, ev-2-cup və ev-2-audit qarşısında sın və etiraf et.',
      },
      {
        id: 'sus-orxan',
        name: 'Orxan Babayev',
        age: 43,
        role: 'Kənar Kiber-Məsləhətçi',
        personality: 'Ehtiyatlı, rəqib şirkətlə gizli iş görüşməsini gizlətməyə çalışır.',
        alibiSummary: 'Başqa bankın server mərkəzində işlədiyini deyir, amma əsəbi davranır.',
        initialStress: 25,
        initialTrust: 30,
        keyContradictions: [],
        secretTruth:
          'Sən günahkar DEYİLSƏN. Yasamaldakı başqa datamərkəzdə rəqib bankla gizli iş müsahibəsi edirdin. Rauf 21:00-da sənə zəng edib maliyyə bazasında qəribə girişlər soruşmuşdu.',
      },
    ],
  },
  {
    id: 'case-3',
    title: 'Son Bərə',
    location: 'Dənizkənarı Bulvar · Köhnə Yaxta Klubu',
    evidence: [
      {
        id: 'ev-3-initial',
        title: 'Bulvar Parkomat Qəbzi',
        summary: 'Vəkil Aynur Kərimovanın avtomobili saat 01:45-də Bulvar dayanacağından çıxıb.',
        detail: 'Ödəniş terminalı Aynurun 01:45-də ərazini tərk etdiyini təsdiqləyir; Fəridin son zəngi 01:58-də olub.',
      },
      {
        id: 'ev-3-autopsy',
        title: 'Məhkəmə-Tibbi Ekspertiza Rəyi',
        summary: 'Fərid suya düşməzdən əvvəl ürək dərmanı ilə keyidilib və başından zərbə alıb.',
        detail: 'Qurban əvvəlcə güclü dərmanla halsızlaşdırılıb, sonra ağır metal alətlə vurularaq suya itələnib.',
      },
      {
        id: 'ev-3-glass',
        title: 'Büllur Stəkan və Nadir Resept',
        summary: 'Stəkanda nadir beta-blokator dərmanı; köhnə resept Səməd Nəsirovun mərhum qardaşının adına yazılıb.',
        detail: 'Aptek bazası dərmanın 3 il əvvəl bərə qəzasında həlak olmuş Tofiq Nəsirovun adına yazıldığını göstərir.',
      },
      {
        id: 'ev-3-log',
        title: 'Yaxta Mühərrik Jurnalı və Əlcək Lifi',
        summary: 'Saat 02:05-də yaxtanın yanacaq klapanı açılıb; göyərtədə Səmədin yağlı əlcək lifi qalıb.',
        detail: 'Səməd yatdığını desə də, klapan 02:05-də açılıb və sükan dəmirində onun əlcəyinin lifləri tapılıb.',
      },
      {
        id: 'ev-3-radio',
        title: 'Liman Dispetçer Radio Qeydi',
        summary: 'Rəşad Vəliyev saat 01:50–02:20 arası fasiləsiz olaraq yük gəmiləri ilə canlı rabitədə olub.',
        detail: 'Rəşadın qüllədən çıxması qeyri-mümkün idi; səs yazısı bunu tam təsdiqləyir.',
      },
      {
        id: 'ev-3-archive',
        title: '3 İl Əvvəlki Qəza Dosyesi',
        summary: 'Fərid 3 il əvvəlki bərə qəzasında sığorta sənədini saxtalaşdıraraq Səmədin qardaşını günahkar çıxarıb.',
        detail: 'Fərid texniki nasazlığı gizlətmək üçün məsuliyyəti Tofiq Nəsirovun üzərinə atıb.',
      },
    ],
    suspects: [
      {
        id: 'sus-rashad',
        name: 'Rəşad Vəliyev',
        age: 36,
        role: 'Liman Dispetçeri',
        personality: 'Həyəcanlı, qorxmuş, Fəriddən çəkindiyi açıq hiss olunur.',
        alibiSummary: 'Saat 01:00-dan səhərədək dispetçer qülləsində növbədə olduğunu deyir.',
        initialStress: 40,
        initialTrust: 45,
        keyContradictions: [],
        secretTruth:
          'Sən günahkar DEYİLSƏN. Qüllədə növbədə idin. Səməd Nəsirovun axşam yaxta klubunda Fəridi soyuq nifrətlə gözlədiyini görmüsən.',
      },
      {
        id: 'sus-aynur',
        name: 'Aynur Kərimova',
        age: 35,
        role: 'İş Ortağının Vəkili',
        personality: 'Soyuq, hüquqi terminlərlə danışır, təzyiqə dərhal sərt cavab verir.',
        alibiSummary: '01:45-də parkomatdan çıxıb getdiyini deyir, əlavə suallardan yayınır.',
        initialStress: 20,
        initialTrust: 20,
        keyContradictions: [],
        secretTruth:
          'Sən günahkar DEYİLSƏN, 01:45-də çıxmısan. Gedərkən körpüdə kapitan Səmədin Fəridə içki süzüb gətirdiyini uzaqdan görmüsən.',
      },
      {
        id: 'sus-semed',
        name: 'Səməd Nəsirov',
        age: 54,
        role: 'Yaxta Kapitanı',
        personality: 'Ağırbaşlı, sakit dənizçi təmkini, amma qardaşının adı çəkiləndə sarsılır.',
        alibiSummary: 'Saat 01:30-da yaxta kayutuna çəkilib yatdığını, fırtınadan xəbərsiz olduğunu deyir.',
        initialStress: 15,
        initialTrust: 35,
        keyContradictions: [
          { evidenceId: 'ev-3-glass', description: 'Stəkandakı dərman qardaşı Tofiqin reseptinə uyğundur.' },
          { evidenceId: 'ev-3-log', description: '02:05-də klapan açılıb və göyərtədə əlcək lifi var.' },
          { evidenceId: 'ev-3-archive', description: 'Fərid 3 il əvvəl qardaşını böhtanla ləkələyib.' },
        ],
        secretTruth:
          'SƏN ƏSL CİNAYƏTKARSAN. 3 il əvvəl Fərid bərə qəzasında qardaşın Tofiqi günahkar çıxarıb ləkələmişdi. Bu gecə Fəridin içkisinə qardaşının köhnə dərmanını qatdın, sükan aləti ilə vurub dənizə atdın və 02:05-də klapanı açdın. ev-3-glass, ev-3-log və ev-3-archive qarşısında qisas aldığını etiraf et.',
      },
    ],
  },
];

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

export default async function handler(req: ServerlessReq, res: ServerlessRes) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Yalnız POST sorğusu qəbul edilir.' });
      return;
    }

    let body: Record<string, any> = {};
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch {
        res.status(400).json({ error: 'Sorğu gövdəsi etibarlı JSON deyil.' });
        return;
      }
    } else if (req.body && typeof req.body === 'object') {
      body = req.body as Record<string, any>;
    }

    const { caseId, suspectId, tactic, question } = body;
    if (!caseId || !suspectId || !tactic || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({
        error: 'Sorğu parametrləri natamamdır. Zəhmət olmasa sual və taktik seçimi göndərin.',
      });
      return;
    }

    const activeCase = CASES_META.find((c) => c.id === caseId);
    if (!activeCase) {
      res.status(404).json({ error: 'Cinayət işi tapılmadı.' });
      return;
    }

    const suspect = activeCase.suspects.find((s) => s.id === suspectId);
    if (!suspect) {
      res.status(404).json({ error: 'Şübhəli tapılmadı.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(500).json({
        error:
          'GEMINI_API_KEY tapılmadı. Vercel Project Settings > Environment Variables bölməsindən GEMINI_API_KEY əlavə edib Redeploy edin.',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const discoveredIds: string[] = Array.isArray(body.discoveredEvidenceIds)
      ? body.discoveredEvidenceIds
      : [];
    const caughtIds: string[] = Array.isArray(body.caughtContradictionIds)
      ? body.caughtContradictionIds
      : [];

    const attachedEvidence = body.attachedEvidenceId
      ? activeCase.evidence.find(
          (e) => e.id === body.attachedEvidenceId && discoveredIds.includes(e.id)
        )
      : undefined;

    const uncaughtContradictions = suspect.keyContradictions.filter(
      (kc) => !caughtIds.includes(kc.evidenceId)
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
      empathy: 'Detektiv EMPATİYA işlədir: etibar artır (+8..+18), stres azalır (-12..0).',
      pressure: 'Detektiv SƏRT TƏZYİQ işlədir: stres artır (+12..+28), etibar düşür (-18..-5).',
      logic_trap: 'Detektiv MƏNTİQİ TƏLƏ qurur: stres artır (+8..+18), etibar -5..+5.',
      present_evidence:
        'Detektiv SÜBUT TƏQDİM EDİR: uyğun ziddiyyətdə stres kəskin artır (+20..+35) və ziddiyyət ifşa olunur.',
    };

    const historyText = Array.isArray(body.history)
      ? body.history
          .slice(-6)
          .map((h: { sender?: string; text?: string }) =>
            `${h.sender === 'detective' ? 'Detektiv' : suspect.name}: ${h.text || ''}`
          )
          .join('\n')
      : '';

    const systemInstruction = `Sən müasir Bakıda neo-nuar üslubunda detektiv RPG oyununda dindirilən şübhəlisən. Yalnız Azərbaycan dilində cavab ver.

ŞÜBHƏLİ: ${suspect.name} (${suspect.age} yaş), ${suspect.role}
Şəxsiyyət: ${suspect.personality}
Alibi: ${suspect.alibiSummary}
GİZLİ HƏQİQƏT: ${suspect.secretTruth}

VƏZİYYƏT: Stres ${currentStress}/100, Etibar ${currentTrust}/100. Bacarıqlar: Məntiq ${skills.logic}/5, Psixologiya ${skills.psychology}/5, Təzyiq ${skills.pressure}/5.

TUTULMAMIŞ ZİDDİYYƏTLƏR:
${
  uncaughtContradictions.length > 0
    ? uncaughtContradictions
        .map((c) => {
          const ev = activeCase.evidence.find((e) => e.id === c.evidenceId);
          return `- ${c.evidenceId} (${ev?.title || ''}): ${c.description}`;
        })
        .join('\n')
    : '- Yoxdur.'
}

QAYDALAR:
1. "reply": 2-4 cümləlik təbii cavab. Oyun termini işlətmə.
2. "microExpression": Qısa bədən dili müşahidəsi.
3. "lieHint": Qısa psixoloji analiz ipucu.
4. "caughtContradictionId": Tutulmamış ziddiyyət faktı və ya uyğun dəlil təqdim olunubsa dəqiq evidenceId yaz, yoxsa "".
5. "willDemandLawyer": Yalnız etibar kritik həddə (<= 8) düşəndə və təzyiq zamanı true.
6. "suggestedFollowUps": 2 qısa Azərbaycan dilində davam sualı.
7. Qətiyyən "İttiham aktı ver" və ya "dindirmə bitdi" yazma.`;

    const promptContent = `İŞ: ${activeCase.title} (${activeCase.location})
TAKTİKA: ${tacticGuide[tactic] || tactic}
${
  attachedEvidence
    ? `SÜBUT (${attachedEvidence.id}): ${attachedEvidence.title} — ${attachedEvidence.summary} (${attachedEvidence.detail})`
    : 'SÜBUT: Yoxdur'
}
TARİXÇƏ:
${historyText || '(Yeni sessiya)'}
SUAL: "${question.trim()}"`;

    const attempts: {
      model: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';
      thinkingLevel: ThinkingLevel;
      timeoutMs: number;
    }[] = [
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, timeoutMs: 4500 },
      { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL, timeoutMs: 4500 },
    ];

    let response: any = null;
    let lastError: unknown;

    for (let i = 0; i < attempts.length; i++) {
      const { model, thinkingLevel, timeoutMs } = attempts[i];
      try {
        response = await withTimeout(
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
                  reply: { type: Type.STRING },
                  microExpression: { type: Type.STRING },
                  lieHint: { type: Type.STRING },
                  stressDelta: { type: Type.INTEGER },
                  trustDelta: { type: Type.INTEGER },
                  caughtContradictionId: { type: Type.STRING },
                  willDemandLawyer: { type: Type.BOOLEAN },
                  suggestedFollowUps: { type: Type.ARRAY, items: { type: Type.STRING } },
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
          }),
          timeoutMs
        );
        break;
      } catch (err) {
        lastError = err;
        if (i < attempts.length - 1 && isTransientError(err)) {
          continue;
        }
        throw err;
      }
    }

    if (!response?.text) {
      res.status(500).json({
        error: 'AI modelindən boş cavab alındı. Zəhmət olmasa sualı yenidən göndərin.',
      });
      return;
    }

    const parsed = JSON.parse(stripCodeFences(response.text));
    const validContradiction = uncaughtContradictions.some(
      (c) => c.evidenceId === parsed.caughtContradictionId
    )
      ? parsed.caughtContradictionId
      : '';

    res.status(200).json({
      reply: parsed.reply || '...',
      microExpression: parsed.microExpression || 'Sakitcə masaya baxır.',
      lieHint: parsed.lieHint || 'İfadədə qeyri-adi detal sezilmədi.',
      stressDelta: Math.max(-15, Math.min(35, Math.round(Number(parsed.stressDelta) || 0))),
      trustDelta: Math.max(-30, Math.min(25, Math.round(Number(parsed.trustDelta) || 0))),
      caughtContradictionId: validContradiction,
      willDemandLawyer: Boolean(parsed.willDemandLawyer),
      suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps)
        ? parsed.suggestedFollowUps.slice(0, 2)
        : [],
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Vercel interrogate error:', errorMessage);

    if (
      errorMessage.includes('403') ||
      errorMessage.includes('API_KEY_INVALID') ||
      errorMessage.includes('400')
    ) {
      res.status(401).json({
        error:
          'Gemini API açarı etibarsızdır və ya icazə xətası var. Vercel Environment Variables bölməsində GEMINI_API_KEY dəyərini yoxlayın.',
      });
      return;
    }

    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      res.status(429).json({
        error: 'Sorğu limiti dolub (429). Bir neçə saniyə gözləyib yenidən cəhd edin.',
      });
      return;
    }

    res.status(500).json({
      error: `Dindirmə xidməti xətası: ${errorMessage}`,
    });
  }
}
