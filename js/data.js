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
    { id: "it", label: "Информатика и AI", sub: "CS, Data Science, Software Eng.", icon: "💻" },
    { id: "engineering", label: "Инженерия", sub: "Строительство, механика, энергетика", icon: "⚙️" },
    { id: "medicine", label: "Медицина", sub: "Стоматология, фарм., сестринское дело", icon: "⚕️" },
    { id: "business", label: "Бизнес и экономика", sub: "Финансы, менеджмент, маркетинг", icon: "💼" },
    { id: "intl_relations", label: "Межд. отношения", sub: "Право, политология, языки", icon: "🌐" },
    { id: "arts", label: "Дизайн и искусство", sub: "Архитектура, графика, мода", icon: "🎨" }
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
      country: "usa", city: "Кембридж", majors: ["it", "engineering"],
      acceptanceRate: 0.04,
      deadlineEarly: "1 ноября (прошлый цикл, Early Action)", deadlineMain: "1 января (прошлый цикл, Regular Action)",
      ielts: 7.0, subjects: { math: 85, computerScience: 80, physics: 80 },
      essay: true, recommendationLetters: "2 письма от учителей + 1 от куратора",
      scholarship: "Need-based financial aid (need-blind для граждан США, need-aware для большинства международных)",
      dormitory: "Да, кампус",
      rankingCountry: 3, rankingWorld: 1,
      website: "https://mit.edu", financialAidWebsite: "https://sfs.mit.edu",
      comment: "Отбор полностью холистический: числовые пороги — ориентир, а не гарантия."
    },
    {
      id: "upenn", name: "University of Pennsylvania", fullName: "University of Pennsylvania (Wharton)",
      country: "usa", city: "Филадельфия", majors: ["business"],
      acceptanceRate: 0.06,
      deadlineEarly: "1 ноября (прошлый цикл, Early Decision)", deadlineMain: "5 января (прошлый цикл, Regular Decision)",
      ielts: 7.0, subjects: { math: 80, economics: 75 },
      essay: true, recommendationLetters: "2 письма от учителей + школьная характеристика",
      scholarship: "Need-based financial aid (need-aware для международных студентов)",
      dormitory: "Да, кампус",
      rankingCountry: 6, rankingWorld: 12,
      website: "https://upenn.edu", financialAidWebsite: "https://sfs.upenn.edu",
      comment: null
    },
    {
      id: "washu", name: "Washington University in St. Louis", fullName: "Washington University in St. Louis",
      country: "usa", city: "Сент-Луис", majors: ["intl_relations", "business"],
      acceptanceRate: 0.12,
      deadlineEarly: "15 ноября (прошлый цикл, Early Decision I)", deadlineMain: "2 января (прошлый цикл, Regular Decision)",
      ielts: 7.0, subjects: { history: 75, secondLanguage: 70, math: 75, economics: 70 },
      essay: true, recommendationLetters: "2 письма от учителей + характеристика",
      scholarship: "Need-based financial aid (need-aware для международных студентов)",
      dormitory: "Да, кампус",
      rankingCountry: 15, rankingWorld: 65,
      website: "https://wustl.edu", financialAidWebsite: "https://students.wustl.edu/financial-aid",
      comment: null
    },
    {
      id: "koc", name: "Koç University", fullName: "Koç Üniversitesi",
      country: "turkey", city: "Стамбул", majors: ["it", "business"],
      acceptanceRate: 0.20,
      deadlineEarly: null, deadlineMain: "конец марта (прошлый цикл, международный приём)",
      ielts: 6.5, subjects: { math: 65, computerScience: 60, economics: 60 },
      essay: true, recommendationLetters: "1-2 письма (для некоторых программ)",
      scholarship: "Институциональные стипендии Koç (по конкурсу, покрытие частичное или полное)",
      dormitory: "Да, кампус",
      rankingCountry: 2, rankingWorld: 391,
      website: "https://koc.edu.tr", financialAidWebsite: "https://koc.edu.tr/en/admissions/financial-aid",
      comment: "Данные по международному приёму частично восстановлены из общих сведений вуза — уточняйте детали программы на сайте."
    },
    {
      id: "itu", name: "Istanbul Technical University", fullName: "İstanbul Teknik Üniversitesi",
      country: "turkey", city: "Стамбул", majors: ["it", "engineering"],
      acceptanceRate: 0.25,
      deadlineEarly: null, deadlineMain: "конец июня (прошлый цикл, приём по YÖS)",
      ielts: 6.5, subjects: { math: 60, computerScience: 55, physics: 55 },
      essay: false, recommendationLetters: "Не требуется для большинства программ",
      scholarship: "Türkiye Bursları (для отдельных программ и стран)",
      dormitory: "Да, ограниченно",
      rankingCountry: 4, rankingWorld: 601,
      website: "https://itu.edu.tr", financialAidWebsite: "https://www.turkiyeburslari.gov.tr",
      comment: null
    },
    {
      id: "hacettepe", name: "Hacettepe University", fullName: "Hacettepe Üniversitesi",
      country: "turkey", city: "Анкара", majors: ["medicine"],
      acceptanceRate: 0.30,
      deadlineEarly: null, deadlineMain: "конец июня (прошлый цикл, приём по YÖS)",
      ielts: 6.0, subjects: { biology: 55, chemistry: 50 },
      essay: false, recommendationLetters: "Не требуется",
      scholarship: "Türkiye Bursları",
      dormitory: "Да, ограниченно",
      rankingCountry: 5, rankingWorld: 801,
      website: "https://hacettepe.edu.tr", financialAidWebsite: "https://www.turkiyeburslari.gov.tr",
      comment: "Для медицины вступительный экзамен (YÖS) практически полностью определяет результат."
    },
    {
      id: "bocconi", name: "Università Bocconi", fullName: "Università commerciale Luigi Bocconi",
      country: "italy", city: "Милан", majors: ["business", "intl_relations"],
      acceptanceRate: 0.13,
      deadlineEarly: "начало января (прошлый цикл, 1-й раунд)", deadlineMain: "начало марта (прошлый цикл, 3-й раунд)",
      ielts: 7.0, subjects: { math: 75, economics: 70, history: 75, secondLanguage: 70 },
      essay: true, recommendationLetters: "Не обязательны, но приветствуются",
      scholarship: "Merit-based гранты Bocconi + региональные гранты DSU (по доходу семьи)",
      dormitory: "Да, ограниченно",
      rankingCountry: 1, rankingWorld: 155,
      website: "https://unibocconi.eu", financialAidWebsite: "https://unibocconi.eu/en/study/tuition-and-financial-aid",
      comment: null
    },
    {
      id: "bologna", name: "University of Bologna", fullName: "Alma Mater Studiorum – Università di Bologna",
      country: "italy", city: "Болонья", majors: ["intl_relations", "arts"],
      acceptanceRate: 0.35,
      deadlineEarly: null, deadlineMain: "конец июля (прошлый цикл, для не-ЕС абитуриентов)",
      ielts: 6.0, subjects: { history: 50, secondLanguage: 45, artHistory: 50, literature: 45 },
      essay: false, recommendationLetters: "Не требуется для большинства программ бакалавриата",
      scholarship: "Региональные гранты DSU (по доходу семьи)",
      dormitory: "Да, ограниченно",
      rankingCountry: 2, rankingWorld: 160,
      website: "https://unibo.it", financialAidWebsite: "https://unibo.it/en/services-and-opportunities/study-grants-and-subsidies",
      comment: null
    },
    {
      id: "polimi", name: "Politecnico di Milano", fullName: "Politecnico di Milano",
      country: "italy", city: "Милан", majors: ["it", "engineering", "arts"],
      acceptanceRate: 0.28,
      deadlineEarly: null, deadlineMain: "конец июля (прошлый цикл, вступительный тест TOLC/TIL)",
      ielts: 6.0, subjects: { math: 55, computerScience: 50, physics: 50, artHistory: 55, literature: 50 },
      essay: false, recommendationLetters: "Не требуется",
      scholarship: "Региональные гранты DSU + стипендии Politecnico по успеваемости",
      dormitory: "Да, ограниченно",
      rankingCountry: 1, rankingWorld: 123,
      website: "https://polimi.it", financialAidWebsite: "https://polimi.it/en/services-and-opportunities/study-grants-and-subsidies",
      comment: "Для направления «Дизайн» дополнительно оценивается творческое портфолио."
    },
    {
      id: "bme", name: "BME", fullName: "Budapest University of Technology and Economics",
      country: "hungary", city: "Будапешт", majors: ["it", "engineering"],
      acceptanceRate: 0.45,
      deadlineEarly: null, deadlineMain: "15 февраля (прошлый цикл)",
      ielts: 5.5, subjects: { math: 45, computerScience: 40, physics: 40 },
      essay: false, recommendationLetters: "Не требуется",
      scholarship: "Stipendium Hungaricum",
      dormitory: "Да, кампус",
      rankingCountry: 2, rankingWorld: 601,
      website: "https://bme.hu", financialAidWebsite: "https://stipendiumhungaricum.hu",
      comment: null
    },
    {
      id: "elte", name: "ELTE", fullName: "Eötvös Loránd University",
      country: "hungary", city: "Будапешт", majors: ["it", "intl_relations", "arts"],
      acceptanceRate: 0.50,
      deadlineEarly: null, deadlineMain: "15 февраля (прошлый цикл)",
      ielts: 5.5, subjects: { math: 45, computerScience: 40, history: 45, secondLanguage: 40, artHistory: 45, literature: 40 },
      essay: false, recommendationLetters: "Не требуется для большинства программ",
      scholarship: "Stipendium Hungaricum",
      dormitory: "Да, кампус",
      rankingCountry: 1, rankingWorld: 601,
      website: "https://elte.hu", financialAidWebsite: "https://stipendiumhungaricum.hu",
      comment: null
    },
    {
      id: "semmelweis", name: "Semmelweis University", fullName: "Semmelweis Egyetem",
      country: "hungary", city: "Будапешт", majors: ["medicine"],
      acceptanceRate: 0.25,
      deadlineEarly: "1 декабря (прошлый цикл, ранняя подача)", deadlineMain: "15 марта (прошлый цикл, вступительный экзамен)",
      ielts: 6.0, subjects: { biology: 60, chemistry: 55 },
      essay: false, recommendationLetters: "Не требуется",
      scholarship: "Stipendium Hungaricum (покрывает обучение и общежитие)",
      dormitory: "Да, кампус",
      rankingCountry: 3, rankingWorld: 601,
      website: "https://semmelweis.hu", financialAidWebsite: "https://stipendiumhungaricum.hu",
      comment: null
    },
    {
      id: "tsinghua", name: "Tsinghua University", fullName: "清华大学",
      country: "china", city: "Пекин", majors: ["it", "engineering"],
      acceptanceRate: 0.03,
      deadlineEarly: null, deadlineMain: "конец февраля (прошлый цикл, для абитуриентов-иностранцев)",
      ielts: 6.5, subjects: { math: 85, computerScience: 80, physics: 80 },
      essay: true, recommendationLetters: "2 рекомендательных письма",
      scholarship: "CSC grant (China Scholarship Council)",
      dormitory: "Да, кампус",
      rankingCountry: 1, rankingWorld: 17,
      website: "https://tsinghua.edu.cn", financialAidWebsite: "https://www.csc.edu.cn",
      comment: "Данные по конкурсу для иностранных абитуриентов ограничены — вуз не публикует детальную статистику, цифра восстановлена приблизительно."
    },
    {
      id: "peking", name: "Peking University", fullName: "北京大学",
      country: "china", city: "Пекин", majors: ["intl_relations", "business", "arts"],
      acceptanceRate: 0.04,
      deadlineEarly: null, deadlineMain: "конец февраля (прошлый цикл)",
      ielts: 6.5, subjects: { history: 85, secondLanguage: 80, math: 85, economics: 80, artHistory: 85, literature: 80 },
      essay: true, recommendationLetters: "2 рекомендательных письма",
      scholarship: "CSC grant (China Scholarship Council)",
      dormitory: "Да, ограниченно",
      rankingCountry: 2, rankingWorld: 14,
      website: "https://pku.edu.cn", financialAidWebsite: "https://www.csc.edu.cn",
      comment: "Данные по конкурсу для иностранных абитуриентов ограничены — цифра восстановлена приблизительно."
    },
    {
      id: "zhejiang", name: "Zhejiang University", fullName: "浙江大学",
      country: "china", city: "Ханчжоу", majors: ["it", "engineering", "medicine"],
      acceptanceRate: 0.18,
      deadlineEarly: null, deadlineMain: "конец марта (прошлый цикл)",
      ielts: 6.0, subjects: { math: 70, computerScience: 65, physics: 65, biology: 70, chemistry: 65 },
      essay: true, recommendationLetters: "1-2 рекомендательных письма",
      scholarship: "CSC grant (China Scholarship Council)",
      dormitory: "Да, ограниченно",
      rankingCountry: 4, rankingWorld: 44,
      website: "https://zju.edu.cn", financialAidWebsite: "https://www.csc.edu.cn",
      comment: null
    },
    {
      id: "kaist", name: "KAIST", fullName: "Korea Advanced Institute of Science and Technology",
      country: "south_korea", city: "Тэджон", majors: ["it", "engineering"],
      acceptanceRate: 0.10,
      deadlineEarly: null, deadlineMain: "9 сентября (прошлый цикл, для иностранных абитуриентов)",
      ielts: 6.5, subjects: { math: 75, computerScience: 70, physics: 70 },
      essay: true, recommendationLetters: "2 рекомендательных письма",
      scholarship: "GKS — Global Korea Scholarship + стипендии KAIST",
      dormitory: "Да, кампус",
      rankingCountry: 3, rankingWorld: 56,
      website: "https://kaist.ac.kr", financialAidWebsite: "https://admission.kaist.ac.kr",
      comment: null
    },
    {
      id: "kyunghee", name: "Kyung Hee University", fullName: "경희대학교",
      country: "south_korea", city: "Сеул", majors: ["medicine", "intl_relations"],
      acceptanceRate: 0.40,
      deadlineEarly: "начало сентября (прошлый цикл)", deadlineMain: "начало декабря (прошлый цикл)",
      ielts: 5.5, subjects: { biology: 45, chemistry: 40, history: 45, secondLanguage: 40 },
      essay: true, recommendationLetters: "1 рекомендательное письмо",
      scholarship: "GKS — Global Korea Scholarship (ограниченное число мест)",
      dormitory: "Да, кампус",
      rankingCountry: 8, rankingWorld: 601,
      website: "https://khu.ac.kr", financialAidWebsite: "https://khu.ac.kr/admission",
      comment: null
    },
    {
      id: "jeonbuk", name: "Jeonbuk National University", fullName: "전북대학교",
      country: "south_korea", city: "Чонджу", majors: ["engineering", "business"],
      acceptanceRate: 0.55,
      deadlineEarly: null, deadlineMain: "начало декабря (прошлый цикл)",
      ielts: 5.0, subjects: { math: 40, physics: 35, economics: 35 },
      essay: false, recommendationLetters: "Не требуется",
      scholarship: "GKS — Global Korea Scholarship (региональные квоты)",
      dormitory: "Да, кампус",
      rankingCountry: 15, rankingWorld: 1201,
      website: "https://jbnu.ac.kr", financialAidWebsite: "https://jbnu.ac.kr/admission",
      comment: "Региональный национальный университет — более доступный конкурс, чем у столичных вузов Кореи."
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
    { id: "genius_olympiad", name: "Genius Olympiad", majors: ["engineering"], type: "Олимпиада проектов", level: "Международный", format: "Очно (США)", timing: "Обычно июнь", website: "https://geniusolympiad.org", whyBoost: "Международная выставка научно-инженерных и экологических проектов — ценится для инженерных и научных направлений.", limitation: "Участие платное, требуется самостоятельная организация поездки." },
    { id: "ibo", name: "IBO — International Biology Olympiad", majors: ["medicine"], type: "Олимпиада", level: "Международный", format: "Очно", timing: "Обычно июль", website: "https://www.ibo-info.org", whyBoost: "Международная олимпиада по биологии — один из самых узнаваемых результатов для медицинских программ.", limitation: "Участие — через национальную сборную." },
    { id: "icho", name: "IChO — International Chemistry Olympiad", majors: ["medicine"], type: "Олимпиада", level: "Международный", format: "Очно", timing: "Обычно июль", website: "https://icho-official.org", whyBoost: "Международная олимпиада по химии — значимый предметный сигнал для медицинских и естественнонаучных программ.", limitation: "Участие — через национальную сборную." },
    { id: "hosa", name: "HOSA — Future Health Professionals", majors: ["medicine"], type: "Соревнование", level: "Международный", format: "Очно (США)", timing: "Обычно июнь", website: "https://hosa.org", whyBoost: "Международные соревнования по медицинским компетенциям — показывают раннюю вовлечённость в профессию.", limitation: "Для иностранных участников — через международный трек HOSA, доступность варьируется по регионам." },
    { id: "deca_icdc", name: "DECA ICDC", majors: ["business"], type: "Соревнование", level: "Международный", format: "Очно (США)", timing: "Обычно апрель-май", website: "https://deca.org", whyBoost: "Международное соревнование по бизнес-кейсам и маркетингу — ценится для программ бизнеса и менеджмента.", limitation: "Для международных участников — через партнёрские отделения DECA." },
    { id: "ieo", name: "IEO — International Economics Olympiad", majors: ["business"], type: "Олимпиада", level: "Международный", format: "Очно", timing: "Обычно август", website: "https://ieo-official.org", whyBoost: "Международная олимпиада по экономике — предметный результат, напрямую релевантный для бизнес-программ.", limitation: "Участие — через национальную сборную." },
    { id: "thimun", name: "THIMUN", majors: ["intl_relations"], type: "Модель ООН", level: "Международный", format: "Очно (Гаага и другие площадки)", timing: "Обычно январь (основная сессия в Гааге)", website: "https://thimun.org", whyBoost: "Одна из крупнейших моделей ООН в мире — стандартный сильный сигнал для программ международных отношений.", limitation: "Требуется делегирование от школы и подготовка позиционных документов." },
    { id: "scholastic_awards", name: "Scholastic Art & Writing Awards", majors: ["arts"], type: "Конкурс работ", level: "Международный", format: "Заочно (подача работ)", timing: "Обычно подача осенью-зимой", website: "https://www.artandwriting.org", whyBoost: "Один из самых узнаваемых конкурсов творческих работ — отмеченные работы заметно усиливают портфолио для творческих направлений.", limitation: "Исторически ориентирован на школы США; международное участие возможно через партнёрские программы, доступность варьируется — уточняйте на сайте." }
  ];

  // ---------------------------------------------------------------------
  // Достижения — 4 свободные категории записей (тема + результат).
  // ---------------------------------------------------------------------
  var ACHIEVEMENT_CATEGORIES = [
    { key: "olympiads", label: "Олимпиады и конкурсы", placeholderA: "Название олимпиады/конкурса", placeholderB: "Результат (место, год)" },
    { key: "certificates", label: "Сертификаты и курсы", placeholderA: "Название курса/сертификата", placeholderB: "Платформа, год" },
    { key: "volunteering", label: "Волонтёрство и стажировки", placeholderA: "Где и чем занимались", placeholderB: "Часы/период, год" },
    { key: "projects", label: "Публикации и проекты", placeholderA: "Название проекта/публикации", placeholderB: "Результат, год" }
  ];

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
    DOCUMENT_ITEMS: DOCUMENT_ITEMS,
    COUNTRY_INFO: COUNTRY_INFO,
    COUNTRY_DIMENSION_LABELS: COUNTRY_DIMENSION_LABELS,
    COUNTRY_METHOD_DISCLAIMER: COUNTRY_METHOD_DISCLAIMER,
    CAREER_QUIZ: CAREER_QUIZ
  };
})(window);
