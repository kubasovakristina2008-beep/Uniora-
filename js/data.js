/* Uniora — статический демо-датасет. Курировано вручную для хакатона LOCUS 2026.
   Все проценты поступления, рейтинги и дедлайны — ориентировочные данные прошлого
   цикла подачи, собранные из открытых источников. НЕ являются официальной статистикой
   вуза и не гарантируют результат поступления. Стоимость обучения не используется как
   фильтр нигде в продукте. */
(function (global) {
  "use strict";

  var DATA_NOTE =
    "Демо-данные для хакатона, ориентировочные, по открытым источникам. Дедлайны — прошлый цикл подачи. Перед подачей документов проверяйте актуальную информацию на официальном сайте вуза.";

  var MAJORS = [
    { id: "it", label: "IT", icon: "💻" },
    { id: "engineering", label: "Инженерия", icon: "⚙️" },
    { id: "medicine", label: "Медицина", icon: "⚕️" },
    { id: "business", label: "Бизнес", icon: "💼" },
    { id: "intl_relations", label: "Международные отношения", icon: "🌐" },
    { id: "arts", label: "Искусство", icon: "🎨" }
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
  // Университеты
  // requirement fields: number (числовой порог) | string (текст, если порог
  // не публикуется или экзамен не требуется) | null (нет данных в источнике)
  // ---------------------------------------------------------------------
  var UNIVERSITIES = [
    {
      id: "mit",
      name: "MIT",
      fullName: "Massachusetts Institute of Technology",
      country: "usa",
      city: "Кембридж",
      majors: ["it", "engineering"],
      acceptanceRate: 0.04,
      deadlineEarly: "1 ноября (прошлый цикл, Early Action)",
      deadlineMain: "1 января (прошлый цикл, Regular Action)",
      ielts: 7.0,
      toefl: 90,
      sat: "Требуется, но точный порог не публикуется — оценка комплексная",
      essay: true,
      recommendationLetters: "2 письма от учителей + 1 от куратора",
      rankingCountry: 3,
      rankingWorld: 1,
      website: "https://mit.edu",
      financialAidWebsite: "https://sfs.mit.edu",
      tuition: null,
      comment: "Отбор полностью холистический: числовые пороги — ориентир, а не гарантия."
    },
    {
      id: "upenn",
      name: "University of Pennsylvania",
      fullName: "University of Pennsylvania (Wharton)",
      country: "usa",
      city: "Филадельфия",
      majors: ["business"],
      acceptanceRate: 0.06,
      deadlineEarly: "1 ноября (прошлый цикл, Early Decision)",
      deadlineMain: "5 января (прошлый цикл, Regular Decision)",
      ielts: 7.0,
      toefl: 100,
      sat: "Учитывается при комплексной оценке, официальный минимум не публикуется",
      essay: true,
      recommendationLetters: "2 письма от учителей + школьная характеристика",
      rankingCountry: 6,
      rankingWorld: 12,
      website: "https://upenn.edu",
      financialAidWebsite: "https://sfs.upenn.edu",
      tuition: null,
      comment: null
    },
    {
      id: "washu",
      name: "Washington University in St. Louis",
      fullName: "Washington University in St. Louis",
      country: "usa",
      city: "Сент-Луис",
      majors: ["intl_relations", "business"],
      acceptanceRate: 0.12,
      deadlineEarly: "15 ноября (прошлый цикл, Early Decision I)",
      deadlineMain: "2 января (прошлый цикл, Regular Decision)",
      ielts: 7.0,
      toefl: 100,
      sat: "Test-optional в прошлом цикле — точный порог не публикуется",
      essay: true,
      recommendationLetters: "2 письма от учителей + характеристика",
      rankingCountry: 15,
      rankingWorld: 65,
      website: "https://wustl.edu",
      financialAidWebsite: "https://students.wustl.edu/financial-aid",
      tuition: null,
      comment: null
    },
    {
      id: "koc",
      name: "Koç University",
      fullName: "Koç Üniversitesi",
      country: "turkey",
      city: "Стамбул",
      majors: ["it", "business"],
      acceptanceRate: 0.20,
      deadlineEarly: null,
      deadlineMain: "конец марта (прошлый цикл, международный приём)",
      ielts: 6.5,
      toefl: 80,
      sat: "Альтернатива собственному вступительному экзамену, порог не публикуется",
      essay: true,
      recommendationLetters: "1-2 письма (для некоторых программ)",
      rankingCountry: 2,
      rankingWorld: 391,
      website: "https://koc.edu.tr",
      financialAidWebsite: "https://koc.edu.tr/en/admissions/financial-aid",
      tuition: null,
      comment: "Данные по международному приёму частично восстановлены из общих сведений вуза — уточняйте детали программы на сайте."
    },
    {
      id: "itu",
      name: "Istanbul Technical University",
      fullName: "İstanbul Teknik Üniversitesi",
      country: "turkey",
      city: "Стамбул",
      majors: ["it", "engineering"],
      acceptanceRate: 0.25,
      deadlineEarly: null,
      deadlineMain: "конец июня (прошлый цикл, приём по YÖS)",
      ielts: 6.5,
      toefl: 80,
      sat: "Не требуется — используется собственный вступительный экзамен YÖS",
      essay: false,
      recommendationLetters: "Не требуется для большинства программ",
      rankingCountry: 4,
      rankingWorld: 601,
      website: "https://itu.edu.tr",
      financialAidWebsite: "https://www.turkiyeburslari.gov.tr",
      tuition: null,
      comment: null
    },
    {
      id: "hacettepe",
      name: "Hacettepe University",
      fullName: "Hacettepe Üniversitesi",
      country: "turkey",
      city: "Анкара",
      majors: ["medicine"],
      acceptanceRate: 0.30,
      deadlineEarly: null,
      deadlineMain: "конец июня (прошлый цикл, приём по YÖS)",
      ielts: 6.0,
      toefl: 70,
      sat: "Не требуется — используется собственный вступительный экзамен YÖS",
      essay: false,
      recommendationLetters: "Не требуется",
      rankingCountry: 5,
      rankingWorld: 801,
      website: "https://hacettepe.edu.tr",
      financialAidWebsite: "https://www.turkiyeburslari.gov.tr",
      tuition: null,
      comment: "Для медицины вступительный экзамен (YÖS) практически полностью определяет результат."
    },
    {
      id: "bocconi",
      name: "Università Bocconi",
      fullName: "Università commerciale Luigi Bocconi",
      country: "italy",
      city: "Милан",
      majors: ["business", "intl_relations"],
      acceptanceRate: 0.13,
      deadlineEarly: "начало января (прошлый цикл, 1-й раунд)",
      deadlineMain: "начало марта (прошлый цикл, 3-й раунд)",
      ielts: 7.0,
      toefl: 100,
      sat: "Один из вариантов вступительного теста (наряду с Bocconi Test), минимум не публикуется",
      essay: true,
      recommendationLetters: "Не обязательны, но приветствуются",
      rankingCountry: 1,
      rankingWorld: 155,
      website: "https://unibocconi.eu",
      financialAidWebsite: "https://unibocconi.eu/en/study/tuition-and-financial-aid",
      tuition: null,
      comment: null
    },
    {
      id: "bologna",
      name: "University of Bologna",
      fullName: "Alma Mater Studiorum – Università di Bologna",
      country: "italy",
      city: "Болонья",
      majors: ["intl_relations", "arts"],
      acceptanceRate: 0.35,
      deadlineEarly: null,
      deadlineMain: "конец июля (прошлый цикл, для не-ЕС абитуриентов)",
      ielts: 6.0,
      toefl: 78,
      sat: "Не требуется",
      essay: false,
      recommendationLetters: "Не требуется для большинства программ бакалавриата",
      rankingCountry: 2,
      rankingWorld: 160,
      website: "https://unibo.it",
      financialAidWebsite: "https://unibo.it/en/teaching/enrolment-transfer-and-final-exam/fees-and-financial-support",
      tuition: null,
      comment: null
    },
    {
      id: "polimi",
      name: "Politecnico di Milano",
      fullName: "Politecnico di Milano",
      country: "italy",
      city: "Милан",
      majors: ["it", "engineering", "arts"],
      acceptanceRate: 0.28,
      deadlineEarly: null,
      deadlineMain: "конец июля (прошлый цикл, вступительный тест TOLC/TIL)",
      ielts: 6.0,
      toefl: 78,
      sat: "Не требуется — собственный вступительный тест (TOLC/TIL)",
      essay: false,
      recommendationLetters: "Не требуется",
      rankingCountry: 1,
      rankingWorld: 123,
      website: "https://polimi.it",
      financialAidWebsite: "https://polimi.it/en/services-and-opportunities/study-grants-and-subsidies",
      tuition: null,
      comment: "Для направления «Дизайн» дополнительно оценивается творческое портфолио."
    },
    {
      id: "bme",
      name: "BME",
      fullName: "Budapest University of Technology and Economics",
      country: "hungary",
      city: "Будапешт",
      majors: ["it", "engineering"],
      acceptanceRate: 0.45,
      deadlineEarly: null,
      deadlineMain: "15 февраля (прошлый цикл)",
      ielts: 5.5,
      toefl: 72,
      sat: "Не требуется",
      essay: false,
      recommendationLetters: "Не требуется",
      rankingCountry: 2,
      rankingWorld: 601,
      website: "https://bme.hu",
      financialAidWebsite: "https://stipendiumhungaricum.hu",
      tuition: null,
      comment: null
    },
    {
      id: "elte",
      name: "ELTE",
      fullName: "Eötvös Loránd University",
      country: "hungary",
      city: "Будапешт",
      majors: ["it", "intl_relations", "arts"],
      acceptanceRate: 0.50,
      deadlineEarly: null,
      deadlineMain: "15 февраля (прошлый цикл)",
      ielts: 5.5,
      toefl: 70,
      sat: "Не требуется",
      essay: false,
      recommendationLetters: "Не требуется для большинства программ",
      rankingCountry: 1,
      rankingWorld: 601,
      website: "https://elte.hu",
      financialAidWebsite: "https://stipendiumhungaricum.hu",
      tuition: null,
      comment: null
    },
    {
      id: "semmelweis",
      name: "Semmelweis University",
      fullName: "Semmelweis Egyetem",
      country: "hungary",
      city: "Будапешт",
      majors: ["medicine"],
      acceptanceRate: 0.25,
      deadlineEarly: "1 декабря (прошлый цикл, ранняя подача)",
      deadlineMain: "15 марта (прошлый цикл, вступительный экзамен)",
      ielts: 6.0,
      toefl: 80,
      sat: "Не требуется — собственный вступительный экзамен по биологии/химии",
      essay: false,
      recommendationLetters: "Не требуется",
      rankingCountry: 3,
      rankingWorld: 601,
      website: "https://semmelweis.hu",
      financialAidWebsite: "https://stipendiumhungaricum.hu",
      tuition: null,
      comment: null
    },
    {
      id: "tsinghua",
      name: "Tsinghua University",
      fullName: "清华大学",
      country: "china",
      city: "Пекин",
      majors: ["it", "engineering"],
      acceptanceRate: 0.03,
      deadlineEarly: null,
      deadlineMain: "конец февраля (прошлый цикл, для абитуриентов-иностранцев)",
      ielts: 6.5,
      toefl: 85,
      sat: "Не требуется — оценивается через собственный конкурс документов и экзамен HSK",
      essay: true,
      recommendationLetters: "2 рекомендательных письма",
      rankingCountry: 1,
      rankingWorld: 17,
      website: "https://tsinghua.edu.cn",
      financialAidWebsite: "https://www.csc.edu.cn",
      tuition: null,
      comment: "Данные по конкурсу для иностранных абитуриентов ограничены — вуз не публикует детальную статистику, цифра восстановлена приблизительно."
    },
    {
      id: "peking",
      name: "Peking University",
      fullName: "北京大学",
      country: "china",
      city: "Пекин",
      majors: ["intl_relations", "business", "arts"],
      acceptanceRate: 0.04,
      deadlineEarly: null,
      deadlineMain: "конец февраля (прошлый цикл)",
      ielts: 6.5,
      toefl: 85,
      sat: "Не требуется",
      essay: true,
      recommendationLetters: "2 рекомендательных письма",
      rankingCountry: 2,
      rankingWorld: 14,
      website: "https://pku.edu.cn",
      financialAidWebsite: "https://www.csc.edu.cn",
      tuition: null,
      comment: "Данные по конкурсу для иностранных абитуриентов ограничены — цифра восстановлена приблизительно."
    },
    {
      id: "zhejiang",
      name: "Zhejiang University",
      fullName: "浙江大学",
      country: "china",
      city: "Ханчжоу",
      majors: ["it", "engineering", "medicine"],
      acceptanceRate: 0.18,
      deadlineEarly: null,
      deadlineMain: "конец марта (прошлый цикл)",
      ielts: 6.0,
      toefl: 80,
      sat: "Не требуется",
      essay: true,
      recommendationLetters: "1-2 рекомендательных письма",
      rankingCountry: 4,
      rankingWorld: 44,
      website: "https://zju.edu.cn",
      financialAidWebsite: "https://www.csc.edu.cn",
      tuition: null,
      comment: null
    },
    {
      id: "kaist",
      name: "KAIST",
      fullName: "Korea Advanced Institute of Science and Technology",
      country: "south_korea",
      city: "Тэджон",
      majors: ["it", "engineering"],
      acceptanceRate: 0.10,
      deadlineEarly: null,
      deadlineMain: "9 сентября (прошлый цикл, для иностранных абитуриентов)",
      ielts: 6.5,
      toefl: 83,
      sat: "Не требуется",
      essay: true,
      recommendationLetters: "2 рекомендательных письма",
      rankingCountry: 3,
      rankingWorld: 56,
      website: "https://kaist.ac.kr",
      financialAidWebsite: "https://admission.kaist.ac.kr",
      tuition: null,
      comment: null
    },
    {
      id: "kyunghee",
      name: "Kyung Hee University",
      fullName: "경희대학교",
      country: "south_korea",
      city: "Сеул",
      majors: ["medicine", "intl_relations"],
      acceptanceRate: 0.40,
      deadlineEarly: "начало сентября (прошлый цикл)",
      deadlineMain: "начало декабря (прошлый цикл)",
      ielts: 5.5,
      toefl: 80,
      sat: "Не требуется",
      essay: true,
      recommendationLetters: "1 рекомендательное письмо",
      rankingCountry: 8,
      rankingWorld: 601,
      website: "https://khu.ac.kr",
      financialAidWebsite: "https://khu.ac.kr/admission",
      tuition: null,
      comment: null
    },
    {
      id: "jeonbuk",
      name: "Jeonbuk National University",
      fullName: "전북대학교",
      country: "south_korea",
      city: "Чонджу",
      majors: ["engineering", "business"],
      acceptanceRate: 0.55,
      deadlineEarly: null,
      deadlineMain: "начало декабря (прошлый цикл)",
      ielts: 5.0,
      toefl: 65,
      sat: "Не требуется",
      essay: false,
      recommendationLetters: "Не требуется",
      rankingCountry: 15,
      rankingWorld: 1201,
      website: "https://jbnu.ac.kr",
      financialAidWebsite: "https://jbnu.ac.kr/admission",
      tuition: null,
      comment: "Региональный национальный университет — более доступный конкурс, чем у столичных вузов Кореи."
    }
  ];

  // ---------------------------------------------------------------------
  // Олимпиады / хакатоны — реальные международные площадки.
  // timing указан текстом (ориентировочный период), не точной датой.
  // ---------------------------------------------------------------------
  var EVENTS = [
    {
      id: "ioi",
      name: "IOI — International Olympiad in Informatics",
      majors: ["it"],
      type: "Олимпиада",
      level: "Международный",
      format: "Очно",
      timing: "Обычно июль-август, отбор через национальную сборную заранее",
      website: "https://ioinformatics.org",
      whyBoost: "Одна из самых престижных международных олимпиад по программированию — сильный предметный сигнал для технических программ.",
      limitation: "Участие — через национальный отборочный этап."
    },
    {
      id: "nasa_space_apps",
      name: "NASA International Space Apps Challenge",
      majors: ["it", "engineering"],
      type: "Хакатон",
      level: "Международный",
      format: "Очно/онлайн",
      timing: "Обычно октябрь, ежегодно",
      website: "https://spaceappschallenge.org",
      whyBoost: "Международный хакатон NASA — показывает проектные и командные навыки в IT и инженерии на практике.",
      limitation: null
    },
    {
      id: "technovation",
      name: "Technovation Girls",
      majors: ["it"],
      type: "Конкурс проектов",
      level: "Международный",
      format: "Очно/онлайн",
      timing: "Регистрация обычно зимой, финал — летом",
      website: "https://technovationchallenge.org",
      whyBoost: "Международная программа разработки технологических решений — отдельно ценится для портфолио в IT.",
      limitation: "Участие ориентировано на девушек и представительниц гендерных меньшинств школьного возраста."
    },
    {
      id: "first_global",
      name: "FIRST Global Challenge",
      majors: ["engineering"],
      type: "Соревнование",
      level: "Международный",
      format: "Очно",
      timing: "Обычно сентябрь-октябрь",
      website: "https://first.global",
      whyBoost: "Международное соревнование по робототехнике между сборными стран — заметный сигнал для инженерных программ.",
      limitation: "Отбор в сборную страны обычно идёт через национального партнёра FIRST Global."
    },
    {
      id: "genius_olympiad",
      name: "Genius Olympiad",
      majors: ["engineering"],
      type: "Олимпиада проектов",
      level: "Международный",
      format: "Очно (США)",
      timing: "Обычно июнь",
      website: "https://geniusolympiad.org",
      whyBoost: "Международная выставка научно-инженерных и экологических проектов — ценится для инженерных и научных направлений.",
      limitation: "Участие платное, требуется самостоятельная организация поездки."
    },
    {
      id: "ibo",
      name: "IBO — International Biology Olympiad",
      majors: ["medicine"],
      type: "Олимпиада",
      level: "Международный",
      format: "Очно",
      timing: "Обычно июль",
      website: "https://www.ibo-info.org",
      whyBoost: "Международная олимпиада по биологии — один из самых узнаваемых результатов для медицинских программ.",
      limitation: "Участие — через национальную сборную."
    },
    {
      id: "icho",
      name: "IChO — International Chemistry Olympiad",
      majors: ["medicine"],
      type: "Олимпиада",
      level: "Международный",
      format: "Очно",
      timing: "Обычно июль",
      website: "https://icho-official.org",
      whyBoost: "Международная олимпиада по химии — значимый предметный сигнал для медицинских и естественнонаучных программ.",
      limitation: "Участие — через национальную сборную."
    },
    {
      id: "hosa",
      name: "HOSA — Future Health Professionals",
      majors: ["medicine"],
      type: "Соревнование",
      level: "Международный",
      format: "Очно (США)",
      timing: "Обычно июнь",
      website: "https://hosa.org",
      whyBoost: "Международные соревнования по медицинским компетенциям — показывают раннюю вовлечённость в профессию.",
      limitation: "Для иностранных участников — через международный трек HOSA, доступность варьируется по регионам."
    },
    {
      id: "deca_icdc",
      name: "DECA ICDC",
      majors: ["business"],
      type: "Соревнование",
      level: "Международный",
      format: "Очно (США)",
      timing: "Обычно апрель-май",
      website: "https://deca.org",
      whyBoost: "Международное соревнование по бизнес-кейсам и маркетингу — ценится для программ бизнеса и менеджмента.",
      limitation: "Для международных участников — через партнёрские отделения DECA."
    },
    {
      id: "ieo",
      name: "IEO — International Economics Olympiad",
      majors: ["business"],
      type: "Олимпиада",
      level: "Международный",
      format: "Очно",
      timing: "Обычно август",
      website: "https://ieo-official.org",
      whyBoost: "Международная олимпиада по экономике — предметный результат, напрямую релевантный для бизнес-программ.",
      limitation: "Участие — через национальную сборную."
    },
    {
      id: "thimun",
      name: "THIMUN",
      majors: ["intl_relations"],
      type: "Модель ООН",
      level: "Международный",
      format: "Очно (Гаага и другие площадки)",
      timing: "Обычно январь (основная сессия в Гааге)",
      website: "https://thimun.org",
      whyBoost: "Одна из крупнейших моделей ООН в мире — стандартный сильный сигнал для программ международных отношений.",
      limitation: "Требуется делегирование от школы и подготовка позиционных документов."
    },
    {
      id: "scholastic_awards",
      name: "Scholastic Art & Writing Awards",
      majors: ["arts"],
      type: "Конкурс работ",
      level: "Международный",
      format: "Заочно (подача работ)",
      timing: "Обычно подача осенью-зимой",
      website: "https://www.artandwriting.org",
      whyBoost: "Один из самых узнаваемых конкурсов творческих работ — отмеченные работы заметно усиливают портфолио для творческих направлений.",
      limitation: "Исторически ориентирован на школы США; международное участие возможно через партнёрские программы, доступность варьируется — уточняйте на сайте."
    }
  ];

  // ---------------------------------------------------------------------
  // Таблица приоритетов портфолио по странам — собственная качественная
  // методика команды Uniora. НЕ официальная статистика или методология вузов.
  // ---------------------------------------------------------------------
  var CATEGORY_LABELS = {
    exams: "Экзамены / академическая успеваемость",
    research: "Исследования и проекты",
    olympiads: "Международные олимпиады",
    sport: "Спорт",
    volunteering: "Волонтёрство"
  };

  var PRIORITIES = {
    china: {
      exams: { level: "high", note: "Экзамены и академическая успеваемость почти всегда решающий фактор при приёме." },
      research: { level: "medium", note: "Исследовательский опыт — плюс, но не заменяет сильные оценки." },
      olympiads: { level: "medium", note: "Международные олимпиады учитываются как дополнительное усиление заявки." },
      sport: { level: "low", note: "Спортивные достижения почти не влияют на решение приёмной комиссии." },
      volunteering: { level: "low", note: "Волонтёрство — необязательный, второстепенный штрих в заявке." }
    },
    south_korea: {
      exams: { level: "high", note: "Экзамены и академическая успеваемость почти всегда решающий фактор при приёме." },
      research: { level: "medium", note: "Исследовательский опыт — плюс, но не заменяет сильные оценки." },
      olympiads: { level: "medium", note: "Международные олимпиады учитываются как дополнительное усиление заявки." },
      sport: { level: "low", note: "Спортивные достижения почти не влияют на решение приёмной комиссии." },
      volunteering: { level: "low", note: "Волонтёрство — необязательный, второстепенный штрих в заявке." }
    },
    hungary: {
      exams: { level: "high", note: "Экзамены и академическая успеваемость почти всегда решающий фактор при приёме." },
      research: { level: "medium", note: "Исследовательский опыт — плюс, но не заменяет сильные оценки." },
      olympiads: { level: "medium", note: "Международные олимпиады учитываются как дополнительное усиление заявки." },
      sport: { level: "low", note: "Спортивные достижения почти не влияют на решение приёмной комиссии." },
      volunteering: { level: "low", note: "Волонтёрство — необязательный, второстепенный штрих в заявке." }
    },
    italy: {
      exams: { level: "high", note: "Вступительный экзамен — ключевой фактор; для медицины он почти полностью определяет результат, для творческих направлений — отдельное творческое портфолио." },
      research: { level: "medium", note: "Исследовательский опыт — плюс, но не заменяет результат вступительного экзамена." },
      olympiads: { level: "medium", note: "Международные олимпиады учитываются как дополнительное усиление заявки." },
      sport: { level: "low", note: "Спортивные достижения почти не влияют на решение приёмной комиссии." },
      volunteering: { level: "low", note: "Волонтёрство — необязательный, второстепенный штрих в заявке." }
    },
    turkey: {
      exams: { level: "high", note: "Собственный вступительный экзамен (например, YÖS) — ключевой фактор приёма." },
      research: { level: "medium", note: "Исследовательский опыт — дополнительный плюс к результату экзамена." },
      olympiads: { level: "medium", note: "Международные олимпиады усиливают заявку, особенно для грантовых программ." },
      sport: { level: "medium", note: "Спортивные достижения заметны при отборе на стипендиальные программы." },
      volunteering: { level: "medium", note: "Волонтёрство важно для стипендий вроде Türkiye Bursları." }
    },
    usa: {
      exams: { level: "medium", note: "Экзамены — это порог, а не решающий фактор: многие вузы оценивают заявку комплексно." },
      research: { level: "high", note: "Исследовательский опыт — один из самых весомых пунктов в холистическом отборе." },
      olympiads: { level: "high", note: "Международные олимпиады — сильный предметный сигнал в комплексной оценке." },
      sport: { level: "high", note: "Спортивные достижения (особенно с лидерской ролью) заметно усиливают заявку." },
      volunteering: { level: "medium", note: "Волонтёрство показывает вовлечённость в сообщество, но не заменяет академику." }
    }
  };

  var PRIORITY_METHOD_DISCLAIMER =
    "Это собственная качественная методика команды Uniora, основанная на изучении публичных требований вузов и типовых практик отбора — не официальная статистика или методология самих университетов.";

  // ---------------------------------------------------------------------
  // Мини-профориентация — 5 вопросов, привязанных к специальностям.
  // ---------------------------------------------------------------------
  var CAREER_QUIZ = [
    {
      id: "q1",
      question: "Что тебе интереснее делать в свободное время?",
      options: [
        { text: "Разбираться, как устроены сайты, приложения, игры", major: "it" },
        { text: "Собирать, чинить технику, что-то конструировать", major: "engineering" },
        { text: "Читать про биологию, здоровье, помогать с медпомощью", major: "medicine" },
        { text: "Придумывать, как продать идею, вести переговоры", major: "business" },
        { text: "Следить за мировыми новостями, учить языки", major: "intl_relations" },
        { text: "Рисовать, писать, снимать — создавать что-то своё", major: "arts" }
      ]
    },
    {
      id: "q2",
      question: "Какой школьный предмет тебе даётся легче и интереснее всего?",
      options: [
        { text: "Информатика / программирование", major: "it" },
        { text: "Физика / черчение / технология", major: "engineering" },
        { text: "Биология / химия", major: "medicine" },
        { text: "Экономика / обществознание", major: "business" },
        { text: "История / иностранные языки", major: "intl_relations" },
        { text: "ИЗО / литература / музыка", major: "arts" }
      ]
    },
    {
      id: "q3",
      question: "Какой командный проект тебе было бы интереснее делать?",
      options: [
        { text: "Написать приложение или сайт", major: "it" },
        { text: "Спроектировать устройство или конструкцию", major: "engineering" },
        { text: "Провести исследование о здоровье людей", major: "medicine" },
        { text: "Запустить свой мини-бизнес или стартап", major: "business" },
        { text: "Организовать модель ООН или обмен", major: "intl_relations" },
        { text: "Сделать выставку, фильм или книгу", major: "arts" }
      ]
    },
    {
      id: "q4",
      question: "На какую профессию ты бы хотел(а) посмотреть изнутри?",
      options: [
        { text: "Разработчик / дата-сайентист", major: "it" },
        { text: "Инженер / архитектор", major: "engineering" },
        { text: "Врач / учёный-биолог", major: "medicine" },
        { text: "Предприниматель / менеджер", major: "business" },
        { text: "Дипломат / сотрудник международной организации", major: "intl_relations" },
        { text: "Дизайнер / художник / писатель", major: "arts" }
      ]
    },
    {
      id: "q5",
      question: "Что для тебя важнее всего в будущей профессии?",
      options: [
        { text: "Создавать технологии, которые меняют мир", major: "it" },
        { text: "Строить и создавать что-то физическое и надёжное", major: "engineering" },
        { text: "Помогать людям и заботиться о здоровье", major: "medicine" },
        { text: "Свобода, доход и управление своим делом", major: "business" },
        { text: "Работа с разными странами и культурами", major: "intl_relations" },
        { text: "Самовыражение и творчество", major: "arts" }
      ]
    }
  ];

  var SPORTS = ["Футбол", "Баскетбол", "Плавание", "Лёгкая атлетика", "Единоборства", "Теннис", "Шахматы", "Волейбол", "Другое"];
  var SPORT_LEVELS = [
    { id: "school", label: "Школьный" },
    { id: "city", label: "Городской" },
    { id: "regional", label: "Областной" },
    { id: "republican", label: "Республиканский" },
    { id: "international", label: "Международный" }
  ];
  var VOLUNTEER_SPHERES = ["Экология", "Соц. помощь", "Мед. волонтёрство", "Образование", "Культура", "Другое"];
  var INTERNSHIP_SPHERES = MAJORS.map(function (m) { return m.label; }).concat(["Другое"]);

  global.Uniora = global.Uniora || {};
  global.Uniora.data = {
    DATA_NOTE: DATA_NOTE,
    MAJORS: MAJORS,
    COUNTRIES: COUNTRIES,
    UNIVERSITIES: UNIVERSITIES,
    EVENTS: EVENTS,
    PRIORITIES: PRIORITIES,
    CATEGORY_LABELS: CATEGORY_LABELS,
    PRIORITY_METHOD_DISCLAIMER: PRIORITY_METHOD_DISCLAIMER,
    CAREER_QUIZ: CAREER_QUIZ,
    SPORTS: SPORTS,
    SPORT_LEVELS: SPORT_LEVELS,
    VOLUNTEER_SPHERES: VOLUNTEER_SPHERES,
    INTERNSHIP_SPHERES: INTERNSHIP_SPHERES
  };
})(window);
