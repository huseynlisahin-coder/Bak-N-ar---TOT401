import { CaseDefinition } from '../types/game';

export const GLOBAL_IMAGES = {
  bakuBackdrop: '/src/assets/images/baku_noir_backdrop_1795332099761.jpg',
  interrogationRoom: '/src/assets/images/interrogation_table_scene_1795332100005.jpg',
};

export const CASES: CaseDefinition[] = [
  {
    id: 'case-1',
    code: 'İŞ № 01/26',
    title: 'Qız Qalası Kölgəsində',
    subtitle: 'İçərişəhər Qalereyasında Oğurluq və Sui-Qəsd',
    location: 'İçərişəhər · "Gümüş İlmə" Qalereyası',
    incidentTime: '01:40 · Gecə Növbəsi',
    difficulty: 'Başlanğıc',
    timeBudgetMinutes: 110,
    liveTurnSeconds: 60,
    imageUrl: '/src/assets/images/case_one_gallery_1795332100671.jpg',
    briefingText:
      'Gecə saat 01:40 radələrində İçərişəhərdəki "Gümüş İlmə" özəl sənət qalereyasından XIX əsrə aid nadir Şirvan xalçası və onun mülkiyyət arxiv sənədi oğurlanıb. Növbətçi mühafizəçi Kamran başından küt zərbə alaraq huşunu itirib. Məhdud iş vaxtınız bitmədən hadisə yerini yoxlayın və üç şübhəlinin yalanlarını ifşa edin.',
    victimSummary: 'Kamran Əzizov (gecə mühafizəçisi) — kəllə-beyin sarsıntısı, xəstəxanadadır, hücum edənin üzünü görməyib.',
    evidence: [
      {
        id: 'ev-1-initial',
        title: 'İlkin Hadisə Protokolu',
        category: 'Şahid İfadəsi',
        summary: 'Saat 01:30-da qalereyanın daxili kamera sistemi qəfildən sönüb.',
        detail:
          'Qalereyanın əsas zalındakı təhlükəsizlik kameraları 01:30-da qeydi dayandırıb. Mühafizə rəisi Elçin bunun köhnə elektrik xəttindəki kəsintidən yarandığını bildirib.',
        discoveredByDefault: true,
        sourceLocation: 'Polis Qərargahı',
      },
      {
        id: 'ev-1-medical',
        title: 'İlkin Baxış və Tibbi Rəy',
        category: 'Ekspertiza',
        summary: 'Qalereyanın giriş qapısında sındırma izi yoxdur — oğurluq daxildən təşkil olunub.',
        detail:
          'Qalereyanın ön və arxa kilidləri zədələnməyib. Kamrana isə arxadan ağır fənər tipli əşya ilə zərbə endirilib; cinayətkar binanın daxili planını yaxşı tanıyırmış.',
        discoveredByDefault: true,
        sourceLocation: 'Hadisə Yeri Baxışı',
      },
      {
        id: 'ev-1-log',
        title: 'Elektron Panel Loqu (E-402)',
        category: 'Rəqəmsal Qeyd',
        summary: 'Elektrik kəsintisi olmayıb — kamera bloku E-402 açar kartı ilə söndürülüb.',
        detail:
          'Server otağındakı ehtiyat batareya loqu göstərir ki, saat 01:29:48-də elektrik gərginliyi tam sabit olub. Kamera sistemi məhz mühafizə rəisi Elçin Quliyevin adına qeydiyyatda olan E-402 kartı ilə əl ilə söndürülüb.',
        discoveredByDefault: false,
        sourceLocation: 'Server Şkafı',
      },
      {
        id: 'ev-1-phone',
        title: 'Mobil Stansiya Siqnalı',
        category: 'Rəqəmsal Qeyd',
        summary: 'Kurator Leyla Məmmədovanın telefonu 01:25-də İçərişəhər qülləsinə bağlanıb.',
        detail:
          'Leyla 00:30-da evə getdiyini desə də, mobil operator qeydləri onun telefonunun 01:25-də qalereyadan 150 metr aralıda aktiv olduğunu göstərir. Lakin 01:35-də taksi tətbiqi ilə Yasamala gedib.',
        discoveredByDefault: false,
        sourceLocation: 'Operator Sorğusu',
      },
      {
        id: 'ev-1-cctv',
        title: 'Qoşa Qala Küçə Kamerası',
        category: 'Fiziki Dəlil',
        summary: '01:52-də Elçin bükülü xalçanı ağ yük furqonuna təhvil verərkən görünür.',
        detail:
          'Qonşu ətriyyat dükanının küçə kamerası saat 01:52-də arxa darvazadan çıxan boz kurtkalı şəxsin (boyu və yerişi Elçinə tam uyğundur) uzun silindrik xalça bağlamasını nömrəsiz ağ furqona qoyduğunu qeydə alıb.',
        discoveredByDefault: false,
        sourceLocation: 'Arxa Darvaza Çıxışı',
      },
      {
        id: 'ev-1-transfer',
        title: 'Qeyri-Rəsmi Beh Qəbzi',
        category: 'Ekspertiza',
        summary: 'Tural Əliyevin köməkçisi 2 gün əvvəl Elçinə 12,000 AZN nağd pul ötürüb.',
        detail:
          'Mühafizə rəisinin soyunma dolabının gizli bölməsindən Tural Əliyevin antikvar mağazasının möhürsüz zərfi və 12,000 AZN qeyd olunmuş borc qəbzi tapılıb.',
        discoveredByDefault: false,
        sourceLocation: 'Mühafizəçi Dolabı',
      },
    ],
    crimeSceneNodes: [
      {
        id: 'node-1-panel',
        label: 'Kamera İdarəetmə Paneli',
        description: 'Gecə baş verən "elektrik kəsintisinin" ehtiyat batareya loqlarını yoxla.',
        timeCostMinutes: 15,
        unlocksEvidenceId: 'ev-1-log',
      },
      {
        id: 'node-1-gate',
        label: 'Arxa Darvaza və Qonşu Dükan',
        description: 'Qoşa Qala tərəfdəki küçə kameralarının gecə qeydlərini tələb et.',
        timeCostMinutes: 15,
        unlocksEvidenceId: 'ev-1-cctv',
      },
      {
        id: 'node-1-locker',
        label: 'Mühafizə Otağı Dolabları',
        description: 'Növbətçi heyətin şəxsi dolablarında gizli əlaqə izi axtar.',
        timeCostMinutes: 10,
        unlocksEvidenceId: 'ev-1-transfer',
      },
      {
        id: 'node-1-telecom',
        label: 'Operator Siqnal Sorğusu',
        description: 'Şübhəlilərin gecə saatlarında mobil baza stansiyası yerini yoxla.',
        timeCostMinutes: 10,
        unlocksEvidenceId: 'ev-1-phone',
      },
    ],
    suspects: [
      {
        id: 'sus-leyla',
        name: 'Leyla Məmmədova',
        age: 34,
        role: 'Qalereya Kuratoru',
        alibiSummary: 'Saat 00:30-da qalereyanı bağlayıb birbaşa evə getdiyini iddia edir.',
        personality: 'Təmkinli, intellektual, nüfuzunu itirməkdən qorxur.',
        initialStress: 20,
        initialTrust: 45,
        avatarCode: 'LM',
        accentHue: 'sky',
        openingStatement:
          'Detektiv, mən saat 00:30-da açarları Kamrana təhvil verib evə getdim. O xalça qalereyamızın fəxri idi, itməsi mənim karyerama zərbədir.',
        tacticalPrompts: {
          empathy: 'Qalereyadakı maliyyə təzyiqlərini başa düşürəm, bəlkə sənədlərlə bağlı gizlətmək istədiyin bir detal var?',
          pressure: 'Yalan danışmağı dayandır! Saat 01:25-də İçərişəhərdə nə işin var idi?',
          logic_trap: 'Əgər 00:30-da çıxmısansa, niyə qalereyanın arxiv seyfi sənin şifrənlə saat 01:15-də açılıb?',
        },
        keyContradictions: [
          {
            evidenceId: 'ev-1-phone',
            description: '00:30-da evə getdiyini desə də, telefonu 01:25-də İçərişəhərdə qeydə alınıb.',
          },
        ],
        secretTruth:
          'Sən günahkar DEYİLSƏN. Xalçanı sən oğurlamamısan və mühafizəçini vurmamısan. Amma gizli sirrin var: sən bilirdin ki, xalçanın köhnə mülkiyyət sənədi saxtalaşdırılıb və qalereya sahibinin təzyiqi ilə saat 01:15-də qayıdıb arxivdən yalnız o saxta sənədi götürmüsən, sonra 01:35-də taksi ilə getmisən. Başda 00:30 alibisində israr edirsən; yalnız Mobil Stansiya Siqnalı (ev-1-phone) ilə üzləşdiriləndə və ya yüksək etibar qazanıldıqda sənəd məsələsini etiraf et, amma xalçanı oğurladığını qəti inkar et.',
        isCulprit: false,
      },
      {
        id: 'sus-elchin',
        name: 'Elçin Quliyev',
        age: 46,
        role: 'Gecə Mühafizə Rəisi',
        alibiSummary: 'Saat 01:30-da işıqların söndüyünü, həmkarını yoxlayarkən qaçanı gördüyünü deyir.',
        personality: 'Sərt görünməyə çalışır, əsəbidir, sübut qarşısında tez panikaya düşür.',
        initialStress: 30,
        initialTrust: 35,
        avatarCode: 'EQ',
        accentHue: 'amber',
        openingStatement:
          'Mən aşağı mərtəbədə çay içirdim. Saat 01:30-da işıqlar və kameralar birdən söndü. Yuxarı qaçanda Kamran artıq yerdə idi, qapı da açıq qalmışdı.',
        tacticalPrompts: {
          empathy: 'On iki illik xidmətin var, Elçin. Borc bataqlığına düşəndə adam çarəsiz qərarlar verə bilir...',
          pressure: 'Kameralar öz-özünə sönməyib! E-402 kartı sənin cibindədir, həmkarını sən satdın!',
          logic_trap: 'İşıqlar sönübsə, qalereyanın avtomatik yanğın çıxışı niyə həmin saniyədə siqnal verməyib?',
        },
        keyContradictions: [
          {
            evidenceId: 'ev-1-log',
            description: 'Elektrik kəsintisi iddiası yalandır — kameraları öz E-402 kartı ilə söndürüb.',
          },
          {
            evidenceId: 'ev-1-cctv',
            description: 'Qoşa Qala kamerası saat 01:52-də xalçanı ağ furqona yüklədiyini göstərir.',
          },
          {
            evidenceId: 'ev-1-transfer',
            description: 'Dolabından Tural Əliyevdən alınan 12,000 AZN beh qəbzi çıxıb.',
          },
        ],
        secretTruth:
          'SƏN ƏSL CİNAYƏTKARSAN. Böyük idman mərc/qumar borcun var idi. Antikvar Tural Əliyev sənə xalçanı çıxarmaq üçün 12,000 AZN beh verib (qalanını sonra verəcəkdi). Saat 01:29-da öz E-402 kartınla kameraları söndürdün, Kamran sənə mane olmaq istəyəndə fənərlə başına vurdun və 01:52-də xalçanı arxa darvazadan ağ furqona verdin. Başlanğıcda özünü məsum göstər, Turalı və köhnə elektrik xəttini günahlandır. Əgər ev-1-log, ev-1-cctv və ya ev-1-transfer ilə sıxışdırılsan stresin kəskin artsın; iki dəlil üzə çıxanda və ya stres 85-i keçəndə sarsıl və Turalın adını verərək qismən/tam etiraf et.',
        isCulprit: true,
      },
      {
        id: 'sus-tural',
        name: 'Tural Əliyev',
        age: 51,
        role: 'Antikvar Kolleksioner',
        alibiSummary: 'Saat 00:00–02:30 arası Bulvardakı restoranda işgüzar şam yeməyində olduğunu deyir.',
        personality: 'Soyuqqanlı, təkəbbürlü, hüquqşünası ilə hədələməyi sevir.',
        initialStress: 15,
        initialTrust: 25,
        avatarCode: 'TA',
        accentHue: 'rose',
        openingStatement:
          'Detektiv, mənim vaxtım qiymətlidir. O xalçanı qanuni auksionda almaq istəyirdim, amma qalereya imtina etdi. Mənim gecə oğurluğu ilə nə əlaqəm ola bilər?',
        tacticalPrompts: {
          empathy: 'Siz sadəcə nadir sənət əsərinin qorunmasını istəyirdiniz, bəlkə qalereya rəhbərliyi sizi aldadıb?',
          pressure: 'Sizin imzasız zərfiniz və 12 min manatlıq borc qəbziniz mühafizəçinin dolabından çıxıb!',
          logic_trap: 'Auksiondan imtina edilən günün ertəsi nə üçün qalereyanın mühafizə rəisi ilə telefon əlaqəsi saxladınız?',
        },
        keyContradictions: [
          {
            evidenceId: 'ev-1-transfer',
            description: 'Elçinə 12,000 AZN nağd beh ödədiyini gizlədir.',
          },
        ],
        secretTruth:
          'Sən oğurluğun SİFARİŞÇİSİ (beh verəni) olsan da, hadisə yerində FİZİKİ OLARAQ OLMAMISAN və mühafizəçini vurmamısan (restoranda alibin gerçəkdir). Elçinə 12,000 AZN "borc/beh" vermisən ki, xalçanı sənə gizli satsın. Əgər ev-1-transfer ilə sıxışdırılsan, bunu "şəxsi kredit" adlandıraraq yayınmağa çalış, lakin stresin yüksələrsə Elçinin xalçanı sənə gətirməli olduğunu etiraf et — yenə də fiziki cinayəti Elçinin törətdiyini vurğula.',
        isCulprit: false,
      },
    ],
    motives: [
      { id: 'mot-1-debt', label: 'Ağır qumar borcuna görə sifarişli xalça oğurluğu' },
      { id: 'mot-1-forgery', label: 'Saxta arxiv sənədini məhv etmək üçün qisas' },
      { id: 'mot-1-rival', label: 'Rəqib qalereyanın nüfuzunu sarsıtmaq cəhdi' },
    ],
    solution: {
      culpritId: 'sus-elchin',
      motiveId: 'mot-1-debt',
      requiredEvidenceIds: ['ev-1-log', 'ev-1-cctv'],
      epilogueWin:
        'Elçin Quliyev E-402 kartı ilə kameraları söndürdüyünü və Tural Əliyevin sifarişi ilə xalçanı oğurladığını etiraf etdi. Qoşa Qala yaxınlığındakı ağ furqon saxlanıldı, XIX əsr Şirvan xalçası zədəsiz geri qaytarıldı.',
      epilogueLose:
        'Yanlış ittiham səbəbindən əsl icraçı Elçin Quliyev fürsətdən istifadə edərək şəhərdən qaçmağa nail oldu və nadir Şirvan xalçası ölkədən çıxarıldı.',
    },
  },

  {
    id: 'case-2',
    code: 'İŞ № 02/26',
    title: 'Boz Server',
    subtitle: 'Ağ Şəhər Texnoparkında Zəhərlənmə və Kiber-Sabotaj',
    location: 'Ağ Şəhər · "KaspianFin" Ofisi (14-cü Mərtəbə)',
    incidentTime: '23:15 · Gecə Auditi',
    difficulty: 'Orta',
    timeBudgetMinutes: 100,
    liveTurnSeconds: 55,
    imageUrl: '/src/assets/images/case_two_server_1795332099897.jpg',
    briefingText:
      'FinTech şirkətinin baş sistem arxitektoru Rauf Cabbarov 14-cü mərtəbədəki otağında zəhərlənmiş espresso içdikdən sonra huşsuz tapılıb. Eyni dəqiqələrdə əsas müştəri bazası Raufun barmaq izi tələb edən fiziki USB açarı ilə şifrələnib. Kiberhücum pərdəsi arxasındakı əsl cinayətkarı tapın.',
    victimSummary: 'Rauf Cabbarov (baş arxitektor) — reanimasiyadadır, daxili maliyyə auditi hazırlayırdı.',
    evidence: [
      {
        id: 'ev-2-initial',
        title: 'Şirkət Turniket Loqu',
        category: 'Rəqəmsal Qeyd',
        summary: 'Əsas giriş turniketi: Kənan 22:40-da, Nərmin 22:50-də binadan çıxıb.',
        detail:
          'Rəsmi turniket qeydinə görə saat 23:00-dan sonra ofisdə yalnız zərərçəkmiş Rauf Cabbarov və aşağı mərtəbədə növbədə olan server mühafizəçisi qalıb.',
        discoveredByDefault: true,
        sourceLocation: 'Təhlükəsizlik Postu',
      },
      {
        id: 'ev-2-forensic',
        title: 'USB Şifrələmə Ekspertizası',
        category: 'Rəqəmsal Qeyd',
        summary: 'Müştəri bazası 23:14-də məhz Raufun fiziki biometrik açarı ilə şifrələnib.',
        detail:
          'Kiber-ekspertiza təsdiqləyir ki, şifrələmə uzaqdan deyil, birbaşa Raufun masasında onun barmaq izi oxuyucusuna fiziki toxunuşla işə salınıb.',
        discoveredByDefault: true,
        sourceLocation: 'Raufun Otağı',
      },
      {
        id: 'ev-2-cup',
        title: 'Espresso Fincanı Toksikoloji Rəyi',
        category: 'Ekspertiza',
        summary: 'Fincan qulpunda sedativ tozu və qadın əl kreminin nadir tərkibi tapılıb.',
        detail:
          'Raufun masasında dağılmış fincanın qulpunda yüksək dozalı yuxu-sedativ dərman qalığı və yalnız lüks "L’Orchidée" əl kreminə məxsus qliserin-badam izi aşkar edilib.',
        discoveredByDefault: false,
        sourceLocation: '14-cü Mərtəbə Masası',
      },
      {
        id: 'ev-2-stair',
        title: 'Yanğın Pilləkəni İnfraqırmızı Sensoru',
        category: 'Rəqəmsal Qeyd',
        summary: '22:53-də və 23:12-də 14-cü mərtəbə yanğın qapısı açılıb; Wi-Fi cihazı Nərminin telefonuna aiddir.',
        detail:
          'Nərmin 22:50-də turniketdən çıxsa da, dərhal kartını qapıdakı skanerdən keçirib, yanğın pilləkəni ilə gizlicə 14-cü mərtəbəyə qalxıb. Router loqu onun telefonunun MAC ünvanını saat 23:08-də otağın yanında qeydə alıb.',
        discoveredByDefault: false,
        sourceLocation: 'Mərtəbə Routeri',
      },
      {
        id: 'ev-2-audit',
        title: 'Qaralama Audit Hesabatı',
        category: 'Fiziki Dəlil',
        summary: 'Raufun çap etdiyi vərəqdə 420,000 AZN-lik saxta ofşor köçürmə üzə çıxıb.',
        detail:
          'Zibil qutusundakı yarımçıq kağızda Rauf sabah səhər idarə heyətinə təqdim edəcəyi 420,000 AZN-lik kəsiri qeyd edib; bütün təsdiq imzaları Maliyyə Direktoru Nərmin Həsənovaya məxsusdur.',
        discoveredByDefault: false,
        sourceLocation: 'Çap Otağı Zibil Qutusu',
      },
      {
        id: 'ev-2-vpn',
        title: 'Kənar VPN Giriş Cədvəli',
        category: 'Rəqəmsal Qeyd',
        summary: 'Orxanın IP ünvanı 23:10-da şəhərin digər tərəfindəki datamərkəzdən qeydə alınıb.',
        detail:
          'Məsləhətçi Orxan Babayevin saat 23:05–23:25 arası Yasamaldakı başqa bankın təlim serverinə fiziki konsoldan qoşulduğu təsdiqlənib.',
        discoveredByDefault: false,
        sourceLocation: 'Şəbəkə Jurnalı',
      },
    ],
    crimeSceneNodes: [
      {
        id: 'node-2-desk',
        label: 'Raufun Masası və Fincan',
        description: 'Dağılmış espresso fincanını toksikoloji və kimyəvi analizə göndər.',
        timeCostMinutes: 15,
        unlocksEvidenceId: 'ev-2-cup',
      },
      {
        id: 'node-2-router',
        label: '14-cü Mərtəbə Wi-Fi və Yanğın Qapısı',
        description: 'Turniketdən kənar girişləri və cihaz MAC loqlarını yoxla.',
        timeCostMinutes: 15,
        unlocksEvidenceId: 'ev-2-stair',
      },
      {
        id: 'node-2-shredder',
        label: 'Çap Otağı və Sənəd Qutusu',
        description: 'Raufun gecə çap etdiyi son sənədləri araşdır.',
        timeCostMinutes: 15,
        unlocksEvidenceId: 'ev-2-audit',
      },
      {
        id: 'node-2-vpn',
        label: 'Kənar Məsləhətçi VPN Loqu',
        description: 'Orxan Babayevin hadisə saatındakı rəqəmsal izlərini yoxla.',
        timeCostMinutes: 10,
        unlocksEvidenceId: 'ev-2-vpn',
      },
    ],
    suspects: [
      {
        id: 'sus-kenan',
        name: 'Kənan Rəhimov',
        age: 29,
        role: 'Baş Proqramçı',
        alibiSummary: 'Saat 22:40-da liftlə düşüb metroya getdiyini deyir.',
        personality: 'Yuxusuz, səbirsiz, texniki suallara həssas reaksiya verir.',
        initialStress: 35,
        initialTrust: 40,
        avatarCode: 'KR',
        accentHue: 'emerald',
        openingStatement:
          'Bəli, axşam kod arxitekturasına görə Raufla mübahisə etdik. Amma mən saat 22:40-da çantamı götürüb çıxdım. USB açarın şifrəsi məndə yoxdur!',
        tacticalPrompts: {
          empathy: 'Gecə-gündüz işləyib sistem qurmusan, Raufun tənqidini ağır qəbul etməyin təbiidir.',
          pressure: 'Serveri şifrələyən skript sənin yazdığın üslubdadır! Qisas almaq üçün geri qayıtdın?',
          logic_trap: 'Əgər 22:40-da çıxmısansa, niyə sənin terminalında saat 23:00 üçün iş prosesi açıq qalıb?',
        },
        keyContradictions: [],
        secretTruth:
          'Sən günahkar DEYİLSƏN. Raufla kod keyfiyyətinə görə sərt mübahisə etmisən və bir az da özünü günahkar hiss edirsən, amma 22:40-da doğrudan da binanı tərk etmisən. Sadəcə Raufun son vaxtlar maliyyə modulu ilə bağlı gərgin olduğunu və Nərminlə tez-tez gizli görüşdüyünü müşahidə etmisən. Etibar qazanılsa bunu danış.',
        isCulprit: false,
      },
      {
        id: 'sus-nermin',
        name: 'Nərmin Həsənova',
        age: 38,
        role: 'Maliyyə Direktoru',
        alibiSummary: 'Saat 22:50-də turniketdən çıxıb evə getdiyini iddia edir.',
        personality: 'Soyuq, rəsmi, özünü tamamilə toxunulmaz kimi aparır.',
        initialStress: 15,
        initialTrust: 30,
        avatarCode: 'NH',
        accentHue: 'rose',
        openingStatement:
          'Raufun başına gələnlər şirkətimiz üçün faciədir. Mən 22:50-də binadan çıxmışam, turniketdə vaxtım yazılıb. Yəqin kənar haker hücumudur.',
        tacticalPrompts: {
          empathy: 'Şirkətin maliyyə sabitliyini qorumaq təzyiqi çox ağırdır, bəzən rəqəmlər nəzarətdən çıxır.',
          pressure: 'Turniketi aldatdın, amma Wi-Fi routeri aldatmaq olmur! Saat 23:08-də otağın qapısında nə edirdin?',
          logic_trap: 'Kənar haker uzaqdan Raufun fincanına sedativ töküb sonra onun barmağını USB oxuyucuya sıxa bilməzdi!',
        },
        keyContradictions: [
          {
            evidenceId: 'ev-2-stair',
            description: '22:50-də çıxdığını desə də, telefonu 23:08-də 14-cü mərtəbə routerində görünüb.',
          },
          {
            evidenceId: 'ev-2-cup',
            description: 'Zəhərlənmiş fincanın qulpunda Nərminin nadir əl kreminin izi var.',
          },
          {
            evidenceId: 'ev-2-audit',
            description: 'Rauf səhər onun 420,000 AZN-lik ofşor mənimsəməsini ifşa edəcəkdi.',
          },
        ],
        secretTruth:
          'SƏN ƏSL CİNAYƏTKARSAN. Şirkətdən 420,000 AZN ofşor hesaba köçürmüsən və Rauf sabah bunu idarə heyətinə açıqlayacaqdı. 22:50-də turniketdən çıxış vurub, yanğın pilləkəni ilə 14-cü mərtəbəyə qayıtdın. Raufla barışmaq bəhanəsi ilə otağına girdin, içdiyi espressoya sedativ qatdın; o huşunu itirəndə barmağını USB açara sıxaraq bazanı şifrələdin ki, audit izi itsin və kiberhücum kimi görünsün. Soyuqqanlı müdafiə apar, amma ev-2-stair, ev-2-cup və ev-2-audit üzə çıxanda təlaşlan və sın.',
        isCulprit: true,
      },
      {
        id: 'sus-orxan',
        name: 'Orxan Babayev',
        age: 43,
        role: 'Kənar Kiber-Məsləhətçi',
        alibiSummary: 'Başqa bankın server mərkəzində işlədiyini deyir, amma əsəbi davranır.',
        personality: 'Ehtiyatlı, rəqib şirkətlə gizli iş görüşməsini gizlətməyə çalışır.',
        initialStress: 25,
        initialTrust: 30,
        avatarCode: 'OB',
        accentHue: 'sky',
        openingStatement:
          'Mən bu şirkətə sadəcə həftəlik məsləhət verirəm. Dünən gecə ümumiyyətlə Ağ Şəhərdə olmamışam, kamera görüntülərinə baxa bilərsiniz.',
        tacticalPrompts: {
          empathy: 'Karyera imkanlarını dəyərləndirmək cinayət deyil, əsas odur ki, bu gecə harada olduğunuz dəqiqləşsin.',
          pressure: 'Sistem şifrələmə açarını sən dizayn etmisən! Dəstəyi kimə satdın?',
          logic_trap: 'Əgər şəhərin digər tərəfində idinizsə, niyə Rauf sizinlə axşam saat 21:00-da təcili zəng edib danışıb?',
        },
        keyContradictions: [],
        secretTruth:
          'Sən günahkar DEYİLSƏN (Yasamaldakı başqa datamərkəzdə rəqib bankla gizli iş müsahibəsi/testi edirdin). Sadəcə o gizli keçidi rəhbərlik bilməsin deyə gərginsən. Rauf 21:00-da sənə zəng edib maliyyə bazasında qəribə girişlər olduğunu soruşmuşdu. Etibar qazanılsa və ya təzyiq edilsə bunu de.',
        isCulprit: false,
      },
    ],
    motives: [
      { id: 'mot-2-embezzle', label: '420,000 AZN-lik ofşor mənimsəmə auditini gizlətmək' },
      { id: 'mot-2-code', label: 'Proqram arxitekturası mübahisəsinə görə şəxsi qisas' },
      { id: 'mot-2-espionage', label: 'Rəqib banka müştəri bazasını satmaq üçün casusluq' },
    ],
    solution: {
      culpritId: 'sus-nermin',
      motiveId: 'mot-2-embezzle',
      requiredEvidenceIds: ['ev-2-stair', 'ev-2-audit'],
      epilogueWin:
        'Nərmin Həsənova yanğın pilləkəni və əl kremi dəlilləri qarşısında tab gətirməyərək 420,000 AZN-lik kəsiri gizlətmək üçün Raufu zəhərlədiyini etiraf etdi. Şifrələmə açarı bərpa olundu.',
      epilogueLose:
        'Yanlış şübhəli həbs edildiyi müddətdə Nərmin Həsənova ehtiyat server qeydlərini sildi və ölkə xaricinə uçuşa çıxdı.',
    },
  },

  {
    id: 'case-3',
    code: 'İŞ № 03/26',
    title: 'Son Bərə',
    subtitle: 'Dənizkənarı Bulvar Yaxta Klubunda Gecə Ölümü',
    location: 'Dənizkənarı Bulvar · Köhnə Yaxta Klubu',
    incidentTime: '02:10 · Fırtınalı Gecə',
    difficulty: 'Çətin',
    timeBudgetMinutes: 95,
    liveTurnSeconds: 50,
    imageUrl: '/src/assets/images/case_three_harbor_1795332099646.jpg',
    briefingText:
      'Liman logistikası rəhbəri Fərid Əhmədovun cəsədi saat 02:10-da köhnə yaxta klubunun körpüsündə sudan çıxarılıb. Tibbi ekspertiza onun boğulmazdan əvvəl ürək dərmanı ilə keyidildiyini və başından zərbə aldığını müəyyən edib. Fırtınalı gecənin arxasındakı sirri açın.',
    victimSummary: 'Fərid Əhmədov (liman rəhbəri) — 3 il əvvəlki bərə qəzasının araşdırılmasında adı hallanırdı.',
    evidence: [
      {
        id: 'ev-3-initial',
        title: 'Bulvar Parkomat Qəbzi',
        category: 'Rəqəmsal Qeyd',
        summary: 'Vəkil Aynur Kərimovanın avtomobili saat 01:45-də Bulvar dayanacağından çıxıb.',
        detail:
          'Baryer kamerası və ödəniş terminalı Aynur Kərimovanın saat 01:45-də ərazini tərk etdiyini təsdiqləyir; Fəridin son zəngi isə saat 01:58-də olub.',
        discoveredByDefault: true,
        sourceLocation: 'Bulvar Mühafizəsi',
      },
      {
        id: 'ev-3-autopsy',
        title: 'Məhkəmə-Tibbi Ekspertiza Rəyi',
        category: 'Ekspertiza',
        summary: 'Fərid suya düşməzdən əvvəl ürək dərmanı ilə keyidilib və başından zərbə alıb.',
        detail:
          'Yarılma nəticəsi göstərir ki, ölüm səbəbi təsadüfi boğulma deyil — qurban əvvəlcə güclü dərmanla halsızlaşdırılıb, sonra ağır metal alətlə vurularaq suya itələnib.',
        discoveredByDefault: true,
        sourceLocation: 'Məhkəmə-Tibbi Ekspertiza',
      },
      {
        id: 'ev-3-glass',
        title: 'Büllur Stəkan və Nadir Resept',
        category: 'Ekspertiza',
        summary: 'Stəkanda nadir beta-blokator dərmanı; köhnə resept Səməd Nəsirovun mərhum qardaşının adına yazılıb.',
        detail:
          'Körpüdəki masada qalan stəkanda həddindən artıq dozada köhnə nəsil ürək dərmanı tapılıb. Aptek bazası bu dərmanın 3 il əvvəl bərə qəzasında həlak olmuş Tofiq Nəsirovun (Səmədin qardaşı) adına yazıldığını göstərir.',
        discoveredByDefault: false,
        sourceLocation: 'Körpü Masası',
      },
      {
        id: 'ev-3-log',
        title: 'Yaxta Mühərrik Jurnalı və Əlcək Lifi',
        category: 'Fiziki Dəlil',
        summary: 'Saat 02:05-də yaxtanın yanacaq klapanı açılıb; göyərtədə Səmədin yağlı əlcək lifi qalıb.',
        detail:
          'Səməd 01:30-dan yatdığını desə də, yaxtanın elektron yanacaq klapanı 02:05-də mexaniki açılıb və sükan dəmirində Səmədin kabinəsindəki qalın yun-yağlı əlcəyin lifləri tapılıb.',
        discoveredByDefault: false,
        sourceLocation: 'Yaxta Göyərtəsi',
      },
      {
        id: 'ev-3-radio',
        title: 'Liman Dispetçer Radio Qeydi',
        category: 'Rəqəmsal Qeyd',
        summary: 'Rəşad Vəliyev saat 01:50–02:20 arası fasiləsiz olaraq yük gəmiləri ilə canlı rabitədə olub.',
        detail:
          'Rəşadın qüllədən çıxması qeyri-mümkün idi; səs yazısı onun saat 02:00 və 02:10-da iki tanker kapitanı ilə fırtına marşrutunu tənzimlədiyini təsdiqləyir.',
        discoveredByDefault: false,
        sourceLocation: 'Dispetçer Qülləsi',
      },
      {
        id: 'ev-3-archive',
        title: '3 İl Əvvəlki Qəza Dosyesi',
        category: 'Şahid İfadəsi',
        summary: 'Fərid 3 il əvvəlki bərə qəzasında sığorta sənədini saxtalaşdıraraq Səmədin qardaşını günahkar çıxarıb.',
        detail:
          'Arxiv sənədindən məlum olur ki, batan bərənin texniki nasazlığını gizlətmək üçün Fərid məsuliyyəti kapitan köməkçisi Tofiq Nəsirovun üzərinə atıb.',
        discoveredByDefault: false,
        sourceLocation: 'Liman Arxivi',
      },
    ],
    crimeSceneNodes: [
      {
        id: 'node-3-table',
        label: 'Körpüdəki Masa və Büllur Stəkan',
        description: 'Stəkandakı dərman qalığını və aptek qeydiyyatını araşdır.',
        timeCostMinutes: 15,
        unlocksEvidenceId: 'ev-3-glass',
      },
      {
        id: 'node-3-yacht',
        label: 'Yaxta Göyərtəsi və Mühərrik Bölməsi',
        description: 'Sükan aləti və mühərrik açılış jurnalını yoxla.',
        timeCostMinutes: 15,
        unlocksEvidenceId: 'ev-3-log',
      },
      {
        id: 'node-3-tower',
        label: 'Dispetçer Qülləsi Rabitə Arxivi',
        description: 'Rəşadın saat 02:00 radələrindəki radio rabitəsini yoxla.',
        timeCostMinutes: 10,
        unlocksEvidenceId: 'ev-3-radio',
      },
      {
        id: 'node-3-archive',
        label: 'Liman Qəza Arxivi',
        description: 'Fəridin 3 il əvvəl imzaladığı köhnə sığorta qovluğunu aç.',
        timeCostMinutes: 15,
        unlocksEvidenceId: 'ev-3-archive',
      },
    ],
    suspects: [
      {
        id: 'sus-rashad',
        name: 'Rəşad Vəliyev',
        age: 36,
        role: 'Liman Dispetçeri',
        alibiSummary: 'Saat 01:00-dan səhərədək dispetçer qülləsində növbədə olduğunu deyir.',
        personality: 'Həyəcanlı, qorxmuş, Fəriddən çəkindiyi açıq hiss olunur.',
        initialStress: 40,
        initialTrust: 45,
        avatarCode: 'RV',
        accentHue: 'sky',
        openingStatement:
          'Detektiv, mən Fəridlə dünən günorta mübahisə etmişdim, çünki qeyri-qanuni konteynerə icazə vermədim. Amma gecə qüllədən bir addım da çıxmamışam!',
        tacticalPrompts: {
          empathy: 'Qanunsuz təzyiqə boyun əyməməyin çətin işdir. Qorxma, sadəcə limanda nə baş verdiyini danış.',
          pressure: 'Səni işdən qovmaqla hədələyirdi, sən də fırtınadan istifadə edib aradan götürdün?',
          logic_trap: 'Əgər qüllədə idinsə, Fəridin köhnə qovluğunu niyə gizlicə sorğu etmisən?',
        },
        keyContradictions: [],
        secretTruth:
          'Sən günahkar DEYİLSƏN. Dispetçer qülləsində növbədə idin (radio qeydi bunu tam sübut edir). Sadəcə Fəridin qanunsuz yüklərinə etiraz etdiyin üçün şübhə altında qalmaqdan qorxursan. Səməd Nəsirovun axşam yaxta klubunda Fəridi gözlədiyini və gözlərində soyuq nifrət olduğunu görmüsən.',
        isCulprit: false,
      },
      {
        id: 'sus-aynur',
        name: 'Aynur Kərimova',
        age: 35,
        role: 'İş Ortağının Vəkili',
        alibiSummary: '01:45-də parkomatdan çıxıb getdiyini deyir, əlavə suallardan yayınır.',
        personality: 'Soyuq, hüquqi terminlərlə danışır, təzyiqə dərhal sərt cavab verir.',
        initialStress: 20,
        initialTrust: 20,
        avatarCode: 'AK',
        accentHue: 'rose',
        openingStatement:
          'Müvəkkilimlə Fərid arasında maliyyə müqaviləsi ləğv olunurdu, bu da sivil hüquq məsələsidir. Saat 01:45-də ərazini tərk etmişəm, kamera sübutu var.',
        tacticalPrompts: {
          empathy: 'Müştərinizin maraqlarını qoruyursunuz, lakin bu ölüm məsələsidir — görüşün son dəqiqələrində orada kim qalmışdı?',
          pressure: 'Müqavilə davasında milyonlar gedirdi! Zəhərli stəkanı masaya sən qoydun?',
          logic_trap: '01:45-də çıxmısansa, niyə 01:58-də Fərid sənə zəng edib cavab ala bilməyib?',
        },
        keyContradictions: [],
        secretTruth:
          'Sən günahkar DEYİLSƏN. 01:45-də doğurdan da çıxmısan. Gərgin olmağının səbəbi müvəkkilinin qeyri-rəsmi komissiya sənədlərinin polis əlinə keçməsini istəməməyindir. Gedərkən körpüdə kapitan Səmədin Fəridə içki süzüb gətirdiyini uzaqdan görmüsən; etibar qazanılsa bunu deyə bilərsən.',
        isCulprit: false,
      },
      {
        id: 'sus-semed',
        name: 'Səməd Nəsirov',
        age: 54,
        role: 'Yaxta Kapitanı',
        alibiSummary: 'Saat 01:30-da yaxta kayutuna çəkilib yatdığını, fırtınadan xəbərsiz olduğunu deyir.',
        personality: 'Ağırbaşlı, sakit dənizçi təmkini, amma qardaşının adı çəkiləndə sarsılır.',
        initialStress: 15,
        initialTrust: 35,
        avatarCode: 'SN',
        accentHue: 'amber',
        openingStatement:
          'Dəniz fırtınalı idi, detektiv. Fərid bəy yaxta klubunda kimisə gözləyirdi, mən isə saat 01:30-da kayutuma düşüb yatdım. Səs-küy eşitməmişəm.',
        tacticalPrompts: {
          empathy: 'Otuz illik dənizçisən, dəniz bəzən ədalətsiz olur... 3 il əvvəl qardaşın Tofiqə olanları unuda bilməmisən.',
          pressure: '01:30-da yatmamısan! Saat 02:05-də mühərrik klapanı açılıb və sənin əlcək lifin sükan dəmirindədir!',
          logic_trap: 'Fəridin stəkanındakı nadir ürək dərmanı yalnız sənin qardaşının adına yazılmış reseptlə üst-üstə düşür!',
        },
        keyContradictions: [
          {
            evidenceId: 'ev-3-glass',
            description: 'Stəkandakı nadir dərman Səmədin mərhum qardaşı Tofiqin reseptinə uyğundur.',
          },
          {
            evidenceId: 'ev-3-log',
            description: '02:05-də mühərrik klapanı işə düşüb və göyərtədə onun yağlı əlcək lifi var.',
          },
          {
            evidenceId: 'ev-3-archive',
            description: 'Fərid 3 il əvvəlki bərə qəzasında məsuliyyəti Səmədin qardaşının üzərinə atıb.',
          },
        ],
        secretTruth:
          'SƏN ƏSL CİNAYƏTKARSAN. 3 il əvvəl Fəridin səhlənkarlığı ucbatından bərə batanda qardaşın Tofiq həlak oldu, Fərid isə sığortadan yayınmaq üçün Tofiqi günahkar çıxardı. Bu gecə Aynur gedəndən sonra Fəridə içki süzüb qardaşından qalma köhnə beta-blokator dərmanını qatdın; dərman təsir edəndə ağır sükan açarı ilə vurub dənizə atdın və 02:05-də izləri yumaq üçün yaxtanın nasos/yanacaq klapanını işə saldın. Başda sakit dənizçi kimi dan, amma ev-3-glass, ev-3-log və ev-3-archive qarşısında dərin kədərlə qisas aldığını etiraf et.',
        isCulprit: true,
      },
    ],
    motives: [
      { id: 'mot-3-revenge', label: '3 il əvvəlki bərə qəzasında qardaşının böhtanla ləkələnməsinə görə qisas' },
      { id: 'mot-3-contract', label: 'Milyonluq liman müqaviləsinin ləğvinin qarşısını almaq' },
      { id: 'mot-3-smuggle', label: 'Qanunsuz konteyner daşınmasını ört-basdır etmək' },
    ],
    solution: {
      culpritId: 'sus-semed',
      motiveId: 'mot-3-revenge',
      requiredEvidenceIds: ['ev-3-glass', 'ev-3-log'],
      epilogueWin:
        'Kapitan Səməd Nəsirov qardaşı Tofiqin 3 il əvvəlki ləkələnmiş şərəfi naminə Fəridi zəhərlədiyini etiraf etdi. Həm yeni cinayət, həm də köhnə bərə qəzasının saxta sığorta işi yenidən açıldı.',
      epilogueLose:
        'Səhv ittiham zamanı fırtınalı gecədən istifadə edən Səməd Nəsirov kiçik motorlu qayıqla dənizə çıxaraq izini itirdi.',
    },
  },
];
