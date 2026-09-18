/* Uniora — статический демо-датасет. Курировано вручную для хакатона LOCUS 2026.
   Все проценты поступления/совпадения, рейтинги и дедлайны — ориентировочные данные
   прошлого цикла подачи и собственная эвристика команды Uniora, НЕ официальная
   статистика вуза и не гарантия результата. Стоимость обучения и жизни нигде
   не используется как фильтр и не отображается в продукте (решение команды). */
(function (global) {
  "use strict";

  var DATA_NOTE =
    "Демо-данные для хакатона, ориентировочные, по открытым источникам. Дедлайны — прошлый цикл подачи. Проценты совпадения и проходимости — эвристика Uniora, не официальная статистика вуза. Перед подачей документов проверяйте актуальную информацию на официальном сайте вуза.";

  var MAJORS = [
    { id: "it", label: "IT", sub: "CS, Data Science, Software Eng.", icon: "💻" },
    { id: "engineering", label: "Инженерия", sub: "Строительство, механика, энергетика", icon: "⚙️" },
    { id: "medicine", label: "Медицина", sub: "Стоматология, фарм., сестринское дело", icon: "⚕️" },
    { id: "business", label: "Бизнес", sub: "Финансы, менеджмент, маркетинг", icon: "💼" },
    { id: "intl_relations", label: "Международные отношения", sub: "Право, политология, языки", icon: "🌐" },
    { id: "arts", label: "Искусство", sub: "Архитектура, графика, мода", icon: "🎨" }
  ];

  var COUNTRIES = [
    { id: "china", label: "Китай", flag: "🇨🇳" },
    { id: "hungary", label: "Венгрия", flag: "🇭🇺" },
    { id: "south_korea", label: "Южная Корея", flag: "🇰🇷" },
    { id: "usa", label: "США", flag: "🇺🇸" },
    { id: "turkey", label: "Турция", flag: "🇹🇷" },
    { id: "italy", label: "Италия", flag: "🇮🇹" }
  ];

  // ---------------------------------------------------------------------
  // Профильные предметные экзамены по специальности. Шкала 0–100 у всех —
  // это внутренняя шкала Uniora для сравнения с порогом вуза, не единый
  // официальный экзамен уровня ЕГЭ/SAT.
  // ---------------------------------------------------------------------
  var SUBJECT_EXAMS_BY_MAJOR = {
    it: [
      { key: "math", label: "Математика (профильная)" },
      { key: "computerScience", label: "Информатика (профильная)" }
    ],
    engineering: [
      { key: "math", label: "Математика (профильная)" },
      { key: "physics", label: "Физика (профильная)" }
    ],
    medicine: [
      { key: "biology", label: "Биология (профильная)" },
      { key: "chemistry", label: "Химия (профильная)" }
    ],
    business: [
      { key: "math", label: "Математика (профильная)" },
      { key: "economics", label: "Обществознание / экономика (профильная)" }
    ],
    intl_relations: [
      { key: "history", label: "История (профильная)" },
      { key: "secondLanguage", label: "Второй иностранный язык (профильный)" }
    ],
    arts: [
      { key: "artHistory", label: "МХК / история искусств (профильная)" },
      { key: "literature", label: "Литература (профильная)" }
    ]
  };
  var SUBJECT_LABELS = {};
  Object.keys(SUBJECT_EXAMS_BY_MAJOR).forEach(function (m) {
    SUBJECT_EXAMS_BY_MAJOR[m].forEach(function (s) { SUBJECT_LABELS[s.key] = s.label; });
  });

  function subjectsForMajors(majorIds) {
    var seen = {};
    var list = [];
    (majorIds || []).forEach(function (m) {
      (SUBJECT_EXAMS_BY_MAJOR[m] || []).forEach(function (s) {
        if (seen[s.key]) return;
        seen[s.key] = true;
        list.push(s);
      });
    });
    return list;
  }

  // ---------------------------------------------------------------------
  // Университеты. subjects — пороги по профильным предметам (см. выше),
  // указаны только для специальностей, которые вуз реально предлагает.
  // Стоимость обучения/жизни намеренно нигде не хранится и не показывается.
  // ---------------------------------------------------------------------
  var UNIVERSITIES = [
    {
      id: "mit", name: "MIT", fullName: "Massachusetts Institute of Technology",
      country: "usa", city: "Кембридж", majors: ["it"],
      acceptanceRate: 0.073,
      deadlineEarly: null, deadlineMain: "5 января (прошлый цикл, Regular Action)",
      ielts: 7.5, toefl: 100, sat: 1520, subjects: { math: 83, computerScience: 78 },
      essay: true, recommendationLetters: "2 письма от учителей + 1 от куратора",
      scholarship: "Need-based financial aid (need-blind для граждан США, need-aware для большинства международных)",
      dormitory: "Да, кампус",
      rankingCountry: null, rankingWorld: null,
      website: "https://mitadmissions.org/", financialAidWebsite: "https://sfs.mit.edu/undergraduate-students/apply-for-aid/international/",
      comment: "IELTS/TOEFL и дедлайн — из таблицы прошлого цикла, обязательно сверьте на официальном сайте перед подачей."
    },
    {
      id: "upenn", name: "University of Pennsylvania", fullName: "University of Pennsylvania (Wharton)",
      country: "usa", city: "Филадельфия", majors: ["business"],
      acceptanceRate: 0.09,
      deadlineEarly: "1 ноября (прошлый цикл, Early Decision)", deadlineMain: "5 января (прошлый цикл, Regular Decision)",
      ielts: 7.0, toefl: null, sat: "Опционально", subjects: { math: 81, economics: 76 },
      essay: true, recommendationLetters: "2 письма от учителей + школьная характеристика",
      scholarship: "Need-based financial aid (need-aware для международных студентов)",
      dormitory: "Да, кампус",
      rankingCountry: 10, rankingWorld: 13,
      website: "https://admissions.upenn.edu/", financialAidWebsite: "https://srfs.upenn.edu/financial-aid/international",
      comment: null
    },
    {
      id: "washu", name: "Washington University in St. Louis", fullName: "Washington University in St. Louis",
      country: "usa", city: "Сент-Луис", majors: ["intl_relations"],
      acceptanceRate: 0.16,
      deadlineEarly: "1 ноября (прошлый цикл, Early Decision I)", deadlineMain: "4 января (прошлый цикл, Regular Decision)",
      ielts: 6.5, toefl: null, sat: "Опционально", subjects: { history: 74, secondLanguage: 69 },
      essay: true, recommendationLetters: "1 от учителя, 1 от консультанта",
      scholarship: "Need-based financial aid (need-aware для международных студентов)",
      dormitory: "Да, кампус",
      rankingCountry: 28, rankingWorld: 105,
      website: "https://admissions.wustl.edu/", financialAidWebsite: "https://admissions.wustl.edu/cost-aid/scholarships/",
      comment: null
    },
    {
      id: "koc", name: "Koç University", fullName: "Koç Üniversitesi",
      country: "turkey", city: "Стамбул", majors: ["business"],
      acceptanceRate: 0.15,
      deadlineEarly: "7 сентября (прошлый цикл)", deadlineMain: "23 сентября (прошлый цикл, международный приём)",
      ielts: null, toefl: 80, sat: 1180, subjects: { math: 75, economics: 70 },
      essay: true, recommendationLetters: "1 письмо",
      scholarship: "Институциональные стипендии Koç (по конкурсу, покрытие частичное или полное)",
      dormitory: "Да, кампус",
      rankingCountry: 5, rankingWorld: 539,
      website: "https://www.ku.edu.tr/en/", financialAidWebsite: "https://international.ku.edu.tr/undergraduate-programs/tuition-and-scholarships/",
      comment: "SAT для инженерных программ обычно выше (около 1200) — уточните по конкретному направлению."
    },
    {
      id: "itu", name: "Istanbul Technical University", fullName: "İstanbul Teknik Üniversitesi",
      country: "turkey", city: "Стамбул", majors: ["arts"],
      acceptanceRate: 0.32,
      deadlineEarly: "1 июня (прошлый цикл)", deadlineMain: "26 июня (прошлый цикл, приём по YÖS)",
      ielts: null, toefl: 65, sat: 600, subjects: { artHistory: 58, literature: 53 },
      essay: true, recommendationLetters: "Не требуются",
      scholarship: "Türkiye Bursları (для отдельных программ и стран)",
      dormitory: "Да, ограниченно",
      rankingCountry: 6, rankingWorld: 606,
      website: "https://www.itu.edu.tr/en", financialAidWebsite: "https://ins.itu.edu.tr/en/students/scholarship",
      comment: "⚠ В источнике указана как «Искусство», но ITU — технический университет (инженерия/архитектура). Уточните программу перед показом. SAT-балл — минимум по математике (из 800), не общий."
    },
    {
      id: "hacettepe", name: "Hacettepe University", fullName: "Hacettepe Üniversitesi",
      country: "turkey", city: "Анкара", majors: ["medicine"],
      acceptanceRate: 0.95,
      deadlineEarly: "22 сентября (прошлый цикл)", deadlineMain: "25 сентября (прошлый цикл, приём по YÖS)",
      ielts: null, toefl: "Опционально", sat: "1000, опционально", subjects: { biology: 35, chemistry: 35 },
      essay: false, recommendationLetters: "Опционально",
      scholarship: null,
      dormitory: "Да, ограниченно",
      rankingCountry: 8, rankingWorld: 691,
      website: "http://www.hacettepe.edu.tr/english", financialAidWebsite: null,
      comment: "SAT 1000 суммарно, минимум 500 по каждой секции."
    },
    {
      id: "bocconi", name: "Università Bocconi", fullName: "Università commerciale Luigi Bocconi",
      country: "italy", city: "Милан", majors: ["business"],
      acceptanceRate: 0.38,
      deadlineEarly: "1 мая (прошлый цикл, 1-й раунд)", deadlineMain: null,
      ielts: 5.0, toefl: null, sat: 1040, subjects: { math: 52, economics: 47 },
      essay: true, recommendationLetters: "Не менее 2 писем",
      scholarship: "Merit-based гранты Bocconi + региональные гранты DSU (по доходу семьи)",
      dormitory: "Да, ограниченно",
      rankingCountry: 3, rankingWorld: 400,
      website: "https://www.unibocconi.eu/", financialAidWebsite: "https://www.unibocconi.eu/wps/wcm/connect/bocconi/sitopubblico_en/navigation+tree/home/programs/bachelor+of+science/funding",
      comment: "⚠ Строка была сдвинута по колонкам в исходной таблице — данные восстановлены вручную, сверьте с официальным сайтом. Минимальный IELTS по источнику ≥5.0, но реалистичный конкурентный уровень — от 7.0."
    },
    {
      id: "bologna", name: "University of Bologna", fullName: "Alma Mater Studiorum – Università di Bologna",
      country: "italy", city: "Болонья", majors: ["intl_relations"],
      acceptanceRate: 0.55,
      deadlineEarly: "15 марта (прошлый цикл)", deadlineMain: null,
      ielts: 6.5, toefl: null, sat: "Не указано", subjects: { history: 35, secondLanguage: 35 },
      essay: true, recommendationLetters: "Не менее 2 писем",
      scholarship: "Региональные гранты DSU (по доходу семьи)",
      dormitory: "Да, ограниченно",
      rankingCountry: 1, rankingWorld: 167,
      website: "https://www.unibo.it/en", financialAidWebsite: "https://www.unibo.it/en/services-and-opportunities/study-grants-and-subsidies",
      comment: "⚠ Та же проблема со сдвигом колонок, что у Bocconi — восстановлено вручную, сверьте с оригиналом."
    },
    {
      id: "polimi", name: "Politecnico di Milano", fullName: "Politecnico di Milano",
      country: "italy", city: "Милан", majors: ["engineering", "arts"],
      acceptanceRate: 0.5,
      deadlineEarly: "26 марта (прошлый цикл)", deadlineMain: null,
      ielts: 6.0, toefl: null, sat: "Не указано", subjects: { math: 40, physics: 35, artHistory: 40, literature: 35 },
      essay: true, recommendationLetters: "Не менее 2 писем",
      scholarship: "Региональные гранты DSU + стипендии Politecnico по успеваемости",
      dormitory: "Да, ограниченно",
      rankingCountry: 16, rankingWorld: 301,
      website: "https://www.polimi.it/en", financialAidWebsite: "https://www.polimi.it/en/current-students/tuition-fees-scholarships-and-financial-aid/",
      comment: "⚠ Изначально указаны инженерная и дизайн-специальности — это реалистично для Politecnico, но сверьте по конкретной программе."
    },
    {
      id: "bme", name: "BME", fullName: "Budapest University of Technology and Economics",
      country: "hungary", city: "Будапешт", majors: ["engineering"],
      acceptanceRate: 0.27,
      deadlineEarly: "15 июня (прошлый цикл)", deadlineMain: null,
      ielts: 5.5, toefl: null, sat: "Не указано", subjects: { math: 63, physics: 58 },
      essay: false, recommendationLetters: "Требуется рекомендательное письмо",
      scholarship: null,
      dormitory: "Да, кампус",
      rankingCountry: 5, rankingWorld: "801–1000",
      website: "https://xplore.bme.hu/admission/", financialAidWebsite: null,
      comment: null
    },
    {
      id: "elte", name: "ELTE", fullName: "Eötvös Loránd University",
      country: "hungary", city: "Будапешт", majors: ["intl_relations"],
      acceptanceRate: 0.35,
      deadlineEarly: "15 марта (прошлый цикл)", deadlineMain: null,
      ielts: 5.5, toefl: null, sat: "Не указано", subjects: { history: 55, secondLanguage: 50 },
      essay: true, recommendationLetters: "Требуется рекомендательное письмо",
      scholarship: null,
      dormitory: "Да, кампус",
      rankingCountry: 3, rankingWorld: "601–650",
      website: "https://www.elte.hu/en/", financialAidWebsite: null,
      comment: null
    },
    {
      id: "semmelweis", name: "Semmelweis University", fullName: "Semmelweis Egyetem",
      country: "hungary", city: "Будапешт", majors: ["medicine"],
      acceptanceRate: 0.25,
      deadlineEarly: "31 мая (прошлый цикл)", deadlineMain: null,
      ielts: null, toefl: "Не указано", sat: "Не указано", subjects: { biology: 65, chemistry: 60 },
      essay: true, recommendationLetters: "Требуется рекомендательное письмо",
      scholarship: null,
      dormitory: "Да, кампус",
      rankingCountry: null, rankingWorld: null,
      website: "https://semmelweis.hu/english/", financialAidWebsite: null,
      comment: "Экзамены и рейтинг изначально не собраны в источнике — требует доисследования, не заполняйте догадками."
    },
    {
      id: "tsinghua", name: "Tsinghua University", fullName: "清华大学",
      country: "china", city: "Пекин", majors: ["it"],
      acceptanceRate: 0.25,
      deadlineEarly: null, deadlineMain: "25 августа (прошлый цикл, для абитуриентов-иностранцев)",
      ielts: null, toefl: "Требуется", sat: "Да", subjects: { math: 65, computerScience: 60 },
      essay: true, recommendationLetters: "Требуется",
      scholarship: "CSC grant (China Scholarship Council)",
      dormitory: "Да, кампус",
      rankingCountry: 1, rankingWorld: 13,
      website: "https://www.tsinghua.edu.cn/en/", financialAidWebsite: "https://www.tsinghua.edu.cn/en/Admissions/International_Students1/Financial_Aid.htm",
      comment: "Процент поступления указан для иностранных студентов, не общий конкурс."
    },
    {
      id: "peking", name: "Peking University", fullName: "北京大学",
      country: "china", city: "Пекин", majors: ["medicine"],
      acceptanceRate: 0.15,
      deadlineEarly: null, deadlineMain: "30 августа (прошлый цикл)",
      ielts: 6.5, toefl: 75, sat: "Да", subjects: { biology: 75, chemistry: 70 },
      essay: true, recommendationLetters: "Требуются 2 письма",
      scholarship: null,
      dormitory: "Да, ограниченно",
      rankingCountry: 2, rankingWorld: 14,
      website: "https://english.pku.edu.cn", financialAidWebsite: null,
      comment: "Процент поступления — для иностранных студентов."
    },
    {
      id: "zhejiang", name: "Zhejiang University", fullName: "浙江大学",
      country: "china", city: "Ханчжоу", majors: ["engineering"],
      acceptanceRate: 0.3,
      deadlineEarly: null, deadlineMain: "10 марта (прошлый цикл)",
      ielts: null, toefl: "Требуется", sat: "Да", subjects: { math: 60, physics: 55 },
      essay: true, recommendationLetters: "Требуются 2 письма",
      scholarship: null,
      dormitory: "Да, ограниченно",
      rankingCountry: 4, rankingWorld: 42,
      website: "https://www.zju.edu.cn/english/main.htm", financialAidWebsite: null,
      comment: "Процент поступления указан для иностранных студентов."
    },
    {
      id: "kaist", name: "KAIST", fullName: "Korea Advanced Institute of Science and Technology",
      country: "south_korea", city: "Тэджон", majors: ["engineering"],
      acceptanceRate: 0.18,
      deadlineEarly: "21 октября (прошлый цикл)", deadlineMain: "13 января (прошлый цикл, для иностранных абитуриентов)",
      ielts: 6.5, toefl: 83, sat: "Да", subjects: { math: 72, physics: 67 },
      essay: false, recommendationLetters: "Только 1 письмо",
      scholarship: "GKS — Global Korea Scholarship + стипендии KAIST",
      dormitory: "Да, кампус",
      rankingCountry: 1, rankingWorld: 96,
      website: "https://admission.kaist.ac.kr/intl-undergraduate/", financialAidWebsite: "https://admission.kaist.ac.kr/intl-undergraduate/scholarships/",
      comment: "⚠ В источнике дедлайны шли не по порядку (основная подача раньше ранней) — перепроверьте на официальном сайте."
    },
    {
      id: "kyunghee", name: "Kyung Hee University", fullName: "경희대학교",
      country: "south_korea", city: "Сеул", majors: ["arts"],
      acceptanceRate: 0.45,
      deadlineEarly: "19 марта (прошлый цикл)", deadlineMain: null,
      ielts: 5.5, toefl: 80, sat: "Опционально", subjects: { artHistory: 45, literature: 40 },
      essay: true, recommendationLetters: "Не требуются",
      scholarship: null,
      dormitory: "Да, кампус",
      rankingCountry: 8, rankingWorld: "251–300",
      website: "https://www.khu.ac.kr/eng/", financialAidWebsite: null,
      comment: "Официальная страница по стипендиям не найдена с ходу — уточните на khu.ac.kr перед показом."
    },
    {
      id: "jeonbuk", name: "Jeonbuk National University", fullName: "전북대학교",
      country: "south_korea", city: "Чонджу", majors: ["it"],
      acceptanceRate: 0.2,
      deadlineEarly: "1 апреля (прошлый цикл)", deadlineMain: "1 октября (прошлый цикл)",
      ielts: 5.5, toefl: 80, sat: "Опционально", subjects: { math: 70, computerScience: 65 },
      essay: true, recommendationLetters: "Не требуется",
      scholarship: null,
      dormitory: "Да, кампус",
      rankingCountry: 18, rankingWorld: "591–600",
      website: "https://www.jbnu.ac.kr/eng/", financialAidWebsite: null,
      comment: "⚠ Город исправлен на Jeonju (в источнике ошибочно указан Seoul) — перепроверьте."
    }
  ];

  // ---------------------------------------------------------------------
  // Олимпиады / хакатоны — реальные международные площадки.
  // ---------------------------------------------------------------------
  var EVENTS = [
    { id: "ioi", name: "IOI — International Olympiad in Informatics", majors: ["it"], type: "Олимпиада", level: "Международный", format: "Очно", timing: "Обычно июль-август, отбор через национальную сборную заранее", website: "https://ioinformatics.org", whyBoost: "Одна из самых престижных международных олимпиад по программированию — сильный предметный сигнал для технических программ.", limitation: "Участие — через национальный отборочный этап." },
    { id: "nasa_space_apps", name: "NASA International Space Apps Challenge", majors: ["it", "engineering"], type: "Хакатон", level: "Международный", format: "Очно/онлайн", timing: "Обычно октябрь, ежегодно", website: "https://spaceappschallenge.org", whyBoost: "Международный хакатон NASA — показывает проектные и командные навыки в IT и инженерии на практике.", limitation: null },
    { id: "technovation", name: "Technovation Girls", majors: ["it"], type: "Конкурс проектов", level: "Международный", format: "Очно/онлайн", timing: "Регистрация обычно зимой, финал — летом", website: "https://technovationchallenge.org", whyBoost: "Международная программа разработки технологических решений — отдельно ценится для портфолио в IT.", limitation: "Участие ориентировано на девушек и представительниц гендерных меньшинств школьного возраста." },
    { id: "first_global", name: "FIRST Global Challenge", majors: ["engineering"], type: "Соревнование", level: "Международный", format: "Очно", timing: "Обычно сентябрь-октябрь", website: "https://first.global", whyBoost: "Международное соревнование по робототехнике между сборными стран — заметный сигнал для инженерных программ.", limitation: "Отбор в сборную страны обычно идёт через национального партнёра FIRST Global." },
    { id: "genius_olympiad", name: "Genius Olympiad", majors: ["engineering", "it", "business"], type: "Олимпиада проектов", level: "Международный", format: "Очно (США)", timing: "Обычно июнь", website: "https://geniusolympiad.org", whyBoost: "Международная выставка научно-инженерных и экологических проектов — ценится для инженерных и научных направлений.", limitation: "Участие платное, требуется самостоятельная организация поездки." },
    { id: "ibo", name: "IBO — International Biology Olympiad", majors: ["medicine"], type: "Олимпиада", level: "Международный", format: "Очно", timing: "Обычно июль", website: "https://www.ibo-info.org", whyBoost: "Международная олимпиада по биологии — один из самых узнаваемых результатов для медицинских программ.", limitation: "Участие — через национальную сборную." },
    { id: "icho", name: "IChO — International Chemistry Olympiad", majors: ["medicine"], type: "Олимпиада", level: "Международный", format: "Очно", timing: "Обычно июль", website: "https://icho-official.org", whyBoost: "Международная олимпиада по химии — значимый предметный сигнал для медицинских и естественнонаучных программ.", limitation: "Участие — через национальную сборную." },
    { id: "hosa", name: "HOSA — Future Health Professionals", majors: ["medicine"], type: "Соревнование", level: "Международный", format: "Очно (США)", timing: "Обычно июнь", website: "https://hosa.org", whyBoost: "Международные соревнования по медицинским компетенциям — показывают раннюю вовлечённость в профессию.", limitation: "Для иностранных участников — через международный трек HOSA, доступность варьируется по регионам." },
    { id: "deca_icdc", name: "DECA ICDC", majors: ["business"], type: "Соревнование", level: "Международный", format: "Очно (США)", timing: "Обычно апрель-май", website: "https://deca.org", whyBoost: "Международное соревнование по бизнес-кейсам и маркетингу — ценится для программ бизнеса и менеджмента.", limitation: "Для международных участников — через партнёрские отделения DECA." },
    { id: "ieo", name: "IEO — International Economics Olympiad", majors: ["business"], type: "Олимпиада", level: "Международный", format: "Очно", timing: "Обычно август", website: "https://ieo-official.org", whyBoost: "Международная олимпиада по экономике — предметный результат, напрямую релевантный для бизнес-программ.", limitation: "Участие — через национальную сборную." },
    { id: "thimun", name: "THIMUN", majors: ["intl_relations"], type: "Модель ООН", level: "Международный", format: "Очно (Гаага и другие площадки)", timing: "Обычно январь (основная сессия в Гааге)", website: "https://thimun.org", whyBoost: "Одна из крупнейших моделей ООН в мире — стандартный сильный сигнал для программ международных отношений.", limitation: "Требуется делегирование от школы и подготовка позиционных документов." },
    { id: "scholastic_awards", name: "Scholastic Art & Writing Awards", majors: ["arts"], type: "Конкурс работ", level: "Международный", format: "Заочно (подача работ)", timing: "Обычно подача осенью-зимой", website: "https://www.artandwriting.org", whyBoost: "Один из самых узнаваемых конкурсов творческих работ — отмеченные работы заметно усиливают портфолио для творческих направлений.", limitation: "Исторически ориентирован на школы США; международное участие возможно через партнёрские программы, доступность варьируется — уточняйте на сайте." }
  ];

  // ---------------------------------------------------------------------
  // Достижения — свободные категории записей (тема/область + результат).
  // Порядок — по значимости для поступления (обсуждено отдельно от кейса,
  // это внутреннее решение команды, не научный факт).
  // ---------------------------------------------------------------------
  var ACHIEVEMENT_CATEGORIES = [
    { key: "projects", label: "Проектные работы по специальности", placeholderA: "Тема проекта", placeholderB: "Результат / где показано" },
    { key: "hackathons", label: "Хакатоны", placeholderA: "Название хакатона", placeholderB: "Результат (место, номинация)" },
    {
      key: "research", label: "Исследования (научные работы)",
      placeholderA: "Тема исследования", placeholderB: "Результат / где опубликовано",
      note: "Засчитывается исследование, результат которого где-то опубликован или оформлен как отчёт/статья — а не просто личный проект «для себя».",
      tip: {
        title: "Как найти научного руководителя",
        intro: "Это наш совет, а не гарантированный рецепт — но с чего-то стоит начать:",
        items: [
          "Искать преподавателей профильных кафедр местных вузов напрямую по теме, которая интересует.",
          "Использовать LinkedIn: искать по названию кафедры/университета + ключевым словам темы, писать короткое вежливое сообщение с конкретным вопросом или предложением, а не общее «хочу с вами поработать».",
          "Спрашивать школьных учителей профильных предметов — они часто знают преподавателей вузов лично.",
          "Смотреть программы научного менторства для школьников (летние школы, олимпиадные лагеря, локальные научные кружки) как альтернативный вход в тему без прямого поиска научного руководителя."
        ]
      }
    },
    {
      key: "olympiads", label: "Олимпиады", placeholderA: "Название олимпиады", placeholderB: "Результат (место, год)",
      note: "Учитываются только олимпиады республиканского или международного уровня — школьные и городские почти не рассматриваются приёмными комиссиями за рубежом."
    },
    { key: "volunteering", label: "Волонтёрство", placeholderA: "Где и чем занимались", placeholderB: "Часы/период, год" },
    { key: "internships", label: "Стажировки", placeholderA: "Где стажировались", placeholderB: "Чем занимались / результат" },
    {
      key: "sport", label: "Спортивные достижения", placeholderA: "Вид спорта / соревнование", placeholderB: "Результат, уровень, год",
      note: "Наша позиция (не научный факт): спортивные достижения ценятся почти всегда, независимо от специальности и страны."
    }
  ];

  var CUSTOM_ACHIEVEMENT_CATEGORY = {
    key: "custom", label: "Своё достижение",
    placeholderA: "Что это было", placeholderB: "Что сделано / результат",
    note: "Сюда впишите то, что не попадает в другие категории — лидерский опыт, свои проекты вне учёбы, руководство чем-либо. Это пригодится и для портфолио, и позже при написании мотивационного письма."
  };

  // ---------------------------------------------------------------------
  // Документы на подачу — общий чек-лист + условный пункт для творческих
  // специальностей. Статус трёхпозиционный: не начато / в процессе / готово.
  // ---------------------------------------------------------------------
  var DOCUMENT_ITEMS = [
    { key: "motivationLetter", label: "Мотивационное письмо" },
    { key: "essay", label: "Эссе о выборе специальности" },
    { key: "recommendationLetters", label: "Рекомендательные письма" },
    { key: "transcript", label: "Переведённый и заверенный транскрипт" },
    { key: "languageCertificate", label: "Языковой сертификат (IELTS и т.п.)" },
    { key: "portfolio", label: "Портфолио работ", onlyMajor: "arts" }
  ];

  // ---------------------------------------------------------------------
  // Выбор страны — качественная оценка Uniora по практическим факторам
  // (без стоимости обучения/жизни — команда сознательно не использует
  // бюджет как критерий подбора).
  // ---------------------------------------------------------------------
  var COUNTRY_DIMENSION_LABELS = {
    admissionChance: "Шанс поступления",
    scholarships: "Стипендии для иностранцев",
    englishPrograms: "Программы на английском",
    visaBureaucracy: "Виза и бюрократия"
  };

  var COUNTRY_INFO = {
    china: {
      blurb: "Топовые технические и гуманитарные вузы мирового уровня, но конкурс на лучшие программы очень высокий.",
      admissionChance: { level: "low", note: "Ведущие университеты (Tsinghua, Peking) — одни из самых конкурентных в мире даже для иностранцев." },
      scholarships: { level: "high", note: "CSC grant (China Scholarship Council) — одна из самых доступных крупных грантовых программ для иностранных студентов." },
      englishPrograms: { level: "medium", note: "Англоязычные треки есть у топовых вузов, но не на всех программах и не во всех городах." },
      visaBureaucracy: { level: "medium", note: "Студенческая виза X1/X2 — процесс стандартный, но требует приглашения от вуза и медицинских документов." }
    },
    hungary: {
      blurb: "Популярное направление для медицины: доступный конкурс и сильная стипендиальная программа для СНГ.",
      admissionChance: { level: "high", note: "Проходимость выше, чем в Китае, США или Южной Корее — вузы активно набирают международных студентов." },
      scholarships: { level: "high", note: "Stipendium Hungaricum — одна из самых известных программ для студентов из СНГ, покрывает обучение и часто общежитие." },
      englishPrograms: { level: "high", note: "Медицина, IT и бизнес почти полностью доступны на английском языке." },
      visaBureaucracy: { level: "medium", note: "Стандартная студенческая виза ЕС, обычно 4–6 недель обработки." }
    },
    south_korea: {
      blurb: "Сильные технические программы (особенно в KAIST) и растущее число англоязычных треков.",
      admissionChance: { level: "medium", note: "Конкурс средний: топовые технические вузы избирательны, региональные университеты — заметно доступнее." },
      scholarships: { level: "medium", note: "GKS (Global Korea Scholarship) существует, но мест ограниченное количество и конкурс на неё отдельный." },
      englishPrograms: { level: "medium", note: "Треки на английском есть, но во многих вузах соседствуют с обязательными предметами на корейском." },
      visaBureaucracy: { level: "medium", note: "Виза D-2 — процесс стандартный, но список документов длиннее, чем в ЕС." }
    },
    usa: {
      blurb: "Мировые лидеры почти во всех направлениях, но самый высокий конкурс и самый холистический отбор.",
      admissionChance: { level: "low", note: "Топовые университеты принимают единицы процентов заявок — конкурс один из самых высоких в мире." },
      scholarships: { level: "low", note: "Большинство вузов need-aware для иностранных студентов — финансовая помощь ограничена и учитывается при отборе." },
      englishPrograms: { level: "high", note: "Английский — язык обучения по умолчанию во всех программах." },
      visaBureaucracy: { level: "high", note: "Виза F-1 требует очного собеседования в посольстве и обычно самый долгий процесс среди этих 6 стран." }
    },
    turkey: {
      blurb: "Собственные вступительные экзамены (YÖS) и одна из самых доступных по проходимости стран из шести.",
      admissionChance: { level: "high", note: "Приёмная кампания через YÖS ориентирована на массовый набор — проходимость выше, чем в Китае, США и Корее." },
      scholarships: { level: "high", note: "Türkiye Bursları покрывает обучение, проживание и стипендию для большого числа программ и стран." },
      englishPrograms: { level: "medium", note: "Программы на английском есть у ведущих вузов, но не повсеместно." },
      visaBureaucracy: { level: "medium", note: "Студенческая виза оформляется относительно быстро при наличии подтверждения от вуза." }
    },
    italy: {
      blurb: "Для медицины вступительный экзамен решает почти всё, для остальных направлений конкурс мягче.",
      admissionChance: { level: "medium", note: "Сильно зависит от направления: медицина — высокий конкурс через централизованный тест, инженерия и гуманитарные — заметно доступнее." },
      scholarships: { level: "medium", note: "Региональные гранты DSU (Diritto allo Studio) выдаются по доходу семьи, не по академическим заслугам." },
      englishPrograms: { level: "medium", note: "Растущее число программ на английском, особенно в технических и бизнес-вузах севера страны." },
      visaBureaucracy: { level: "medium", note: "Стандартная студенческая виза ЕС (виза типа D), обычно 4–8 недель." }
    }
  };

  var COUNTRY_METHOD_DISCLAIMER =
    "Это собственная качественная оценка команды Uniora на основе изучения публичных требований вузов и типовых практик — не официальная статистика. Стоимость обучения и жизни намеренно не учитывается: команда не использует бюджет как критерий подбора.";

  // ---------------------------------------------------------------------
  // PRIORITIES — эталонная таблица приоритетов портфолио по странам
  // (из data-reference.js, сверено 18.09.2026). Собственная качественная
  // методика команды Uniora, НЕ официальная статистика вузов.
  // level: 'high' | 'medium' | 'low'
  // ---------------------------------------------------------------------
  var PRIORITIES = {
    china: {
      label: "Китай",
      rows: [
        { cat: "exams", level: "high", note: "Экзамены и академическая успеваемость — решающий фактор при отборе." },
        { cat: "research", level: "medium", note: "Проекты и исследования — заметный плюс, но не обязательное условие." },
        { cat: "olympiads", level: "medium", note: "Международные олимпиады усиливают заявку, особенно по профильному предмету." },
        { cat: "sport", level: "low", note: "Спортивные достижения почти не влияют на решение." },
        { cat: "volunteering", level: "low", note: "Волонтёрство почти не влияет на решение." }
      ]
    },
    south_korea: {
      label: "Южная Корея",
      rows: [
        { cat: "exams", level: "high", note: "Экзамены и академическая успеваемость — решающий фактор при отборе." },
        { cat: "research", level: "medium", note: "Проекты и исследования — заметный плюс." },
        { cat: "olympiads", level: "medium", note: "Международные олимпиады усиливают заявку по профильному направлению." },
        { cat: "sport", level: "low", note: "Спортивные достижения почти не влияют на решение." },
        { cat: "volunteering", level: "low", note: "Волонтёрство почти не влияет на решение." }
      ]
    },
    hungary: {
      label: "Венгрия",
      rows: [
        { cat: "exams", level: "high", note: "Экзамены и академическая успеваемость — решающий фактор при отборе." },
        { cat: "research", level: "medium", note: "Проекты и исследования — заметный плюс." },
        { cat: "olympiads", level: "medium", note: "Международные олимпиады усиливают заявку по профильному направлению." },
        { cat: "sport", level: "low", note: "Спортивные достижения почти не влияют на решение." },
        { cat: "volunteering", level: "low", note: "Волонтёрство почти не влияет на решение." }
      ]
    },
    italy: {
      label: "Италия",
      rows: [
        { cat: "exams", level: "high", note: "Для медицины вступительный экзамен решает почти всё; для искусства — отдельное творческое портфолио. В остальном — средне-высокая значимость." },
        { cat: "research", level: "medium", note: "Проекты и исследования — заметный плюс." },
        { cat: "olympiads", level: "medium", note: "Международные олимпиады усиливают заявку по профильному направлению." },
        { cat: "sport", level: "low", note: "Спортивные достижения почти не влияют на решение." },
        { cat: "volunteering", level: "low", note: "Волонтёрство почти не влияет на решение." }
      ]
    },
    turkey: {
      label: "Турция",
      rows: [
        { cat: "exams", level: "high", note: "Собственные вступительные экзамены вузов (например, YÖS) обычно решают почти всё." },
        { cat: "research", level: "medium", note: "Проекты и исследования — заметный плюс." },
        { cat: "olympiads", level: "medium", note: "Международные олимпиады усиливают заявку по профильному направлению." },
        { cat: "sport", level: "medium", note: "Спортивная активность иногда учитывается при отборе на гранты." },
        { cat: "volunteering", level: "medium", note: "Может иметь значение для стипендиальных программ вроде Türkiye Bursları." }
      ]
    },
    usa: {
      label: "США",
      rows: [
        { cat: "exams", level: "medium", note: "Экзамены — это порог, а не решающий фактор сам по себе." },
        { cat: "research", level: "high", note: "Исследования и проекты с измеримым результатом — один из самых весомых пунктов." },
        { cat: "olympiads", level: "high", note: "Международные (не региональные) олимпиады заметно усиливают заявку." },
        { cat: "sport", level: "high", note: "Серьёзные спортивные достижения делают абитуриента заметно конкурентоспособнее." },
        { cat: "volunteering", level: "medium", note: "Часть общей «истории» абитуриента, но не решает само по себе." }
      ]
    }
  };

  var PRIORITY_CATEGORY_LABELS = {
    exams: "Экзамены и академика",
    research: "Исследования и проекты",
    olympiads: "Межд. олимпиады",
    sport: "Спорт",
    volunteering: "Волонтёрство"
  };

  var PRIORITY_LEVEL_LABELS = { high: "Высокий", medium: "Средний", low: "Низкий" };

  // ---------------------------------------------------------------------
  // Мини-профориентация — 5 вопросов, привязанных к специальностям.
  // ---------------------------------------------------------------------
  var CAREER_QUIZ = [
    { id: "q1", question: "Что тебе интереснее делать в свободное время?", options: [
      { text: "Разбираться, как устроены сайты, приложения, игры", major: "it" },
      { text: "Собирать, чинить технику, что-то конструировать", major: "engineering" },
      { text: "Читать про биологию, здоровье, помогать с медпомощью", major: "medicine" },
      { text: "Придумывать, как продать идею, вести переговоры", major: "business" },
      { text: "Следить за мировыми новостями, учить языки", major: "intl_relations" },
      { text: "Рисовать, писать, снимать — создавать что-то своё", major: "arts" }
    ] },
    { id: "q2", question: "Какой школьный предмет тебе даётся легче и интереснее всего?", options: [
      { text: "Информатика / программирование", major: "it" },
      { text: "Физика / черчение / технология", major: "engineering" },
      { text: "Биология / химия", major: "medicine" },
      { text: "Экономика / обществознание", major: "business" },
      { text: "История / иностранные языки", major: "intl_relations" },
      { text: "ИЗО / литература / музыка", major: "arts" }
    ] },
    { id: "q3", question: "Какой командный проект тебе было бы интереснее делать?", options: [
      { text: "Написать приложение или сайт", major: "it" },
      { text: "Спроектировать устройство или конструкцию", major: "engineering" },
      { text: "Провести исследование о здоровье людей", major: "medicine" },
      { text: "Запустить свой мини-бизнес или стартап", major: "business" },
      { text: "Организовать модель ООН или обмен", major: "intl_relations" },
      { text: "Сделать выставку, фильм или книгу", major: "arts" }
    ] },
    { id: "q4", question: "На какую профессию ты бы хотел(а) посмотреть изнутри?", options: [
      { text: "Разработчик / дата-сайентист", major: "it" },
      { text: "Инженер / архитектор", major: "engineering" },
      { text: "Врач / учёный-биолог", major: "medicine" },
      { text: "Предприниматель / менеджер", major: "business" },
      { text: "Дипломат / сотрудник международной организации", major: "intl_relations" },
      { text: "Дизайнер / художник / писатель", major: "arts" }
    ] },
    { id: "q5", question: "Что для тебя важнее всего в будущей профессии?", options: [
      { text: "Создавать технологии, которые меняют мир", major: "it" },
      { text: "Строить и создавать что-то физическое и надёжное", major: "engineering" },
      { text: "Помогать людям и заботиться о здоровье", major: "medicine" },
      { text: "Свобода, доход и управление своим делом", major: "business" },
      { text: "Работа с разными странами и культурами", major: "intl_relations" },
      { text: "Самовыражение и творчество", major: "arts" }
    ] }
  ];

  global.Uniora = global.Uniora || {};
  global.Uniora.data = {
    DATA_NOTE: DATA_NOTE,
    MAJORS: MAJORS,
    COUNTRIES: COUNTRIES,
    SUBJECT_EXAMS_BY_MAJOR: SUBJECT_EXAMS_BY_MAJOR,
    SUBJECT_LABELS: SUBJECT_LABELS,
    subjectsForMajors: subjectsForMajors,
    UNIVERSITIES: UNIVERSITIES,
    EVENTS: EVENTS,
    ACHIEVEMENT_CATEGORIES: ACHIEVEMENT_CATEGORIES,
    CUSTOM_ACHIEVEMENT_CATEGORY: CUSTOM_ACHIEVEMENT_CATEGORY,
    DOCUMENT_ITEMS: DOCUMENT_ITEMS,
    COUNTRY_INFO: COUNTRY_INFO,
    COUNTRY_DIMENSION_LABELS: COUNTRY_DIMENSION_LABELS,
    COUNTRY_METHOD_DISCLAIMER: COUNTRY_METHOD_DISCLAIMER,
    PRIORITIES: PRIORITIES,
    PRIORITY_CATEGORY_LABELS: PRIORITY_CATEGORY_LABELS,
    PRIORITY_LEVEL_LABELS: PRIORITY_LEVEL_LABELS,
    CAREER_QUIZ: CAREER_QUIZ
  };
})(window);
