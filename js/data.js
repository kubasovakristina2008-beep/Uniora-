/* Uniora — статический демо-датасет. Курировано вручную для хакатона LOCUS 2026.
   Все проценты поступления/совпадения, рейтинги и дедлайны — ориентировочные данные
   прошлого цикла подачи и собственная эвристика команды Uniora, НЕ официальная
   статистика вуза и не гарантия результата. Стоимость обучения и жизни нигде
   не используется как фильтр и не отображается в продукте (решение команды).
   Все пользовательские строки — двуязычные объекты {ru, en}, читаются через
   Uniora.i18n.tf(). Значения без перевода (id, числа, ссылки, иконки) — как есть. */
(function (global) {
  "use strict";

  var DATA_NOTE = {
    ru: "Демо-данные для хакатона. Часть цифр — из открытых источников, часть (где источник не публикует точное значение) — оценка команды Uniora по аналогии со сравнимыми вузами. Это не официальная статистика вузов и не гарантия результата — перед подачей документов проверяйте актуальную информацию на официальном сайте вуза.",
    en: "Demo data for the hackathon. Some figures come from public sources; where a source didn't publish an exact figure, the team estimated it based on comparable universities. This is not official university statistics and not a guarantee of the outcome — before submitting documents, verify current information on the university's official website."
  };

  var MAJORS = [
    { id: "it", label: { ru: "IT", en: "IT" }, sub: { ru: "CS, Data Science, Software Eng.", en: "CS, Data Science, Software Eng." }, icon: "💻" },
    { id: "engineering", label: { ru: "Инженерия", en: "Engineering" }, sub: { ru: "Строительство, механика, энергетика", en: "Civil, mechanical, energy engineering" }, icon: "⚙️" },
    { id: "medicine", label: { ru: "Медицина", en: "Medicine" }, sub: { ru: "Стоматология, фарм., сестринское дело", en: "Dentistry, pharmacy, nursing" }, icon: "⚕️" },
    { id: "business", label: { ru: "Бизнес", en: "Business" }, sub: { ru: "Финансы, менеджмент, маркетинг", en: "Finance, management, marketing" }, icon: "💼" },
    { id: "intl_relations", label: { ru: "Международные отношения", en: "International Relations" }, sub: { ru: "Право, политология, языки", en: "Law, political science, languages" }, icon: "🌐" },
    { id: "arts", label: { ru: "Искусство", en: "Arts" }, sub: { ru: "Архитектура, графика, мода", en: "Architecture, design, fashion" }, icon: "🎨" }
  ];

  // flagCode — ISO 3166-1 alpha-2, используется для картинки флага
  // (flagcdn.com). Emoji-флаги на Windows часто рендерятся как голые буквы
  // (нет составных глифов в системном шрифте), поэтому картинка надёжнее.
  var COUNTRIES = [
    { id: "china", label: { ru: "Китай", en: "China" }, flagCode: "cn" },
    { id: "hungary", label: { ru: "Венгрия", en: "Hungary" }, flagCode: "hu" },
    { id: "south_korea", label: { ru: "Южная Корея", en: "South Korea" }, flagCode: "kr" },
    { id: "usa", label: { ru: "США", en: "USA" }, flagCode: "us" },
    { id: "turkey", label: { ru: "Турция", en: "Turkey" }, flagCode: "tr" },
    { id: "italy", label: { ru: "Италия", en: "Italy" }, flagCode: "it" }
  ];

  // ---------------------------------------------------------------------
  // Университеты. Требования по экзаменам — ielts/toefl/sat: число (порог,
  // включая оценки команды там, где источник не публиковал точную цифру),
  // или null (этот конкретный тест не требуется — обычно потому что вуз
  // принимает альтернативный тест, указанный в другом поле). Все даты и
  // пробелы в изначальных данных заполнены оценкой команды Uniora по
  // аналогии со сравнимыми вузами — это не официальные цифры вуза, общая
  // пометка об этом — на страницах с подбором вузов. Стоимость обучения/
  // жизни намеренно нигде не хранится и не показывается.
  // ---------------------------------------------------------------------
  var UNIVERSITIES = [
    {
      id: "mit", name: "MIT", fullName: "Massachusetts Institute of Technology",
      country: "usa", city: { ru: "Кембридж", en: "Cambridge" }, majors: ["it"],
      acceptanceRate: 0.073,
      deadlineEarly: null, deadlineMain: { ru: "5 января, Regular Action", en: "January 5, Regular Action" },
      ielts: 7.5, toefl: 100, sat: 1520,
      essay: true, recommendationLetters: { ru: "2 письма от учителей + 1 от куратора", en: "2 letters from teachers + 1 from a counselor" },
      scholarship: { ru: "Need-based financial aid (need-blind для граждан США, need-aware для большинства международных)", en: "Need-based financial aid (need-blind for US citizens, need-aware for most international students)" },
      dormitory: { ru: "Да, кампус", en: "Yes, on campus" },
      rankingCountry: 1, rankingWorld: 2,
      website: "https://mitadmissions.org/", financialAidWebsite: "https://sfs.mit.edu/undergraduate-students/apply-for-aid/international/",
      comment: { ru: "Обязательно сверьте баллы и дедлайн на официальном сайте перед подачей.", en: "Be sure to verify the scores and deadline on the official website before applying." }
    },
    {
      id: "upenn", name: "University of Pennsylvania", fullName: "University of Pennsylvania (Wharton)",
      country: "usa", city: { ru: "Филадельфия", en: "Philadelphia" }, majors: ["business"],
      acceptanceRate: 0.09,
      deadlineEarly: { ru: "1 ноября, Early Decision", en: "November 1, Early Decision" }, deadlineMain: { ru: "5 января, Regular Decision", en: "January 5, Regular Decision" },
      ielts: 7.0, toefl: 100, sat: 1480,
      essay: true, recommendationLetters: { ru: "2 письма от учителей + школьная характеристика", en: "2 letters from teachers + a school report" },
      scholarship: { ru: "Need-based financial aid (need-aware для международных студентов)", en: "Need-based financial aid (need-aware for international students)" },
      dormitory: { ru: "Да, кампус", en: "Yes, on campus" },
      rankingCountry: 10, rankingWorld: 13,
      website: "https://admissions.upenn.edu/", financialAidWebsite: "https://srfs.upenn.edu/financial-aid/international",
      comment: { ru: "SAT формально необязателен, но команда указала типичный балл поступивших — сверьте актуальную политику на сайте.", en: "SAT is formally optional, but the team listed a typical admitted score — verify the current policy on the website." }
    },
    {
      id: "washu", name: "Washington University in St. Louis", fullName: "Washington University in St. Louis",
      country: "usa", city: { ru: "Сент-Луис", en: "St. Louis" }, majors: ["intl_relations"],
      acceptanceRate: 0.16,
      deadlineEarly: { ru: "1 ноября, Early Decision I", en: "November 1, Early Decision I" }, deadlineMain: { ru: "4 января, Regular Decision", en: "January 4, Regular Decision" },
      ielts: 6.5, toefl: 100, sat: 1460,
      essay: true, recommendationLetters: { ru: "1 от учителя, 1 от консультанта", en: "1 from a teacher, 1 from a counselor" },
      scholarship: { ru: "Need-based financial aid (need-aware для международных студентов)", en: "Need-based financial aid (need-aware for international students)" },
      dormitory: { ru: "Да, кампус", en: "Yes, on campus" },
      rankingCountry: 28, rankingWorld: 105,
      website: "https://admissions.wustl.edu/", financialAidWebsite: "https://admissions.wustl.edu/cost-aid/scholarships/",
      comment: { ru: "SAT формально необязателен, но команда указала типичный балл поступивших — сверьте актуальную политику на сайте.", en: "SAT is formally optional, but the team listed a typical admitted score — verify the current policy on the website." }
    },
    {
      id: "koc", name: "Koç University", fullName: "Koç Üniversitesi",
      country: "turkey", city: { ru: "Стамбул", en: "Istanbul" }, majors: ["business"],
      acceptanceRate: 0.15,
      deadlineEarly: { ru: "7 сентября", en: "September 7" }, deadlineMain: { ru: "23 сентября, международный приём", en: "September 23, international admissions" },
      ielts: 6.5, toefl: 80, sat: 1180,
      essay: true, recommendationLetters: { ru: "1 письмо", en: "1 letter" },
      scholarship: { ru: "Институциональные стипендии Koç (по конкурсу, покрытие частичное или полное)", en: "Koç institutional scholarships (competitive, partial or full coverage)" },
      dormitory: { ru: "Да, кампус", en: "Yes, on campus" },
      rankingCountry: 5, rankingWorld: 539,
      website: "https://www.ku.edu.tr/en/", financialAidWebsite: "https://international.ku.edu.tr/undergraduate-programs/tuition-and-scholarships/",
      comment: { ru: "SAT для инженерных программ обычно выше (около 1200) — уточните по конкретному направлению.", en: "The SAT for engineering programs is usually higher (around 1200) — check the specific program." }
    },
    {
      id: "itu", name: "Istanbul Technical University", fullName: "İstanbul Teknik Üniversitesi",
      country: "turkey", city: { ru: "Стамбул", en: "Istanbul" }, majors: ["arts"],
      acceptanceRate: 0.32,
      deadlineEarly: { ru: "1 июня", en: "June 1" }, deadlineMain: { ru: "26 июня, приём по YÖS", en: "June 26, YÖS admissions" },
      ielts: 6.0, toefl: 65, sat: 600,
      essay: true, recommendationLetters: { ru: "Не требуются", en: "Not required" },
      scholarship: { ru: "Türkiye Bursları (для отдельных программ и стран)", en: "Türkiye Bursları (for select programs and countries)" },
      dormitory: { ru: "Да, ограниченно", en: "Yes, limited" },
      rankingCountry: 6, rankingWorld: 606,
      website: "https://www.itu.edu.tr/en", financialAidWebsite: "https://ins.itu.edu.tr/en/students/scholarship",
      comment: { ru: "⚠ В источнике указана как «Искусство», но ITU — технический университет (инженерия/архитектура). Уточните программу перед показом. SAT-балл — минимум по математике (из 800), не общий.", en: "⚠ Listed as “Arts” in the source, but ITU is a technical university (engineering/architecture). Verify the program before presenting this. The SAT score is a math-section minimum (out of 800), not a composite score." }
    },
    {
      id: "hacettepe", name: "Hacettepe University", fullName: "Hacettepe Üniversitesi",
      country: "turkey", city: { ru: "Анкара", en: "Ankara" }, majors: ["medicine"],
      acceptanceRate: 0.95,
      deadlineEarly: { ru: "22 сентября", en: "September 22" }, deadlineMain: { ru: "25 сентября, приём по YÖS", en: "September 25, YÖS admissions" },
      ielts: 5.5, toefl: 61, sat: 1000,
      essay: false, recommendationLetters: { ru: "Не требуются", en: "Not required" },
      scholarship: { ru: "Ограниченные стипендии по успеваемости для иностранных студентов — уточняйте условия в приёмной комиссии", en: "Limited merit-based scholarships for international students — check terms with admissions" },
      dormitory: { ru: "Да, ограниченно", en: "Yes, limited" },
      rankingCountry: 8, rankingWorld: 691,
      website: "http://www.hacettepe.edu.tr/english", financialAidWebsite: null,
      comment: { ru: "SAT 1000 суммарно, минимум 500 по каждой секции.", en: "SAT 1000 composite, minimum 500 per section." }
    },
    {
      id: "bocconi", name: "Università Bocconi", fullName: "Università commerciale Luigi Bocconi",
      country: "italy", city: { ru: "Милан", en: "Milan" }, majors: ["business"],
      acceptanceRate: 0.38,
      deadlineEarly: { ru: "1 мая, 1-й раунд", en: "May 1, round 1" }, deadlineMain: { ru: "15 июля, финальный раунд", en: "July 15, final round" },
      ielts: 7.0, toefl: null, sat: 1040,
      essay: true, recommendationLetters: { ru: "Не менее 2 писем", en: "At least 2 letters" },
      scholarship: { ru: "Merit-based гранты Bocconi + региональные гранты DSU (по доходу семьи)", en: "Merit-based Bocconi grants + regional DSU grants (based on family income)" },
      dormitory: { ru: "Да, ограниченно", en: "Yes, limited" },
      rankingCountry: 3, rankingWorld: 400,
      website: "https://www.unibocconi.eu/", financialAidWebsite: "https://www.unibocconi.eu/wps/wcm/connect/bocconi/sitopubblico_en/navigation+tree/home/programs/bachelor+of+science/funding",
      comment: { ru: "Реалистичный конкурентный уровень IELTS — от 7.0, финальный раунд — оценка команды. Сверьте с официальным сайтом.", en: "A realistically competitive IELTS level starts around 7.0; the final round date is the team's estimate. Verify against the official website." }
    },
    {
      id: "bologna", name: "University of Bologna", fullName: "Alma Mater Studiorum – Università di Bologna",
      country: "italy", city: { ru: "Болонья", en: "Bologna" }, majors: ["intl_relations"],
      acceptanceRate: 0.55,
      deadlineEarly: { ru: "15 марта", en: "March 15" }, deadlineMain: { ru: "31 июля", en: "July 31" },
      ielts: 6.5, toefl: 90, sat: null,
      essay: true, recommendationLetters: { ru: "Не менее 2 писем", en: "At least 2 letters" },
      scholarship: { ru: "Региональные гранты DSU (по доходу семьи)", en: "Regional DSU grants (based on family income)" },
      dormitory: { ru: "Да, ограниченно", en: "Yes, limited" },
      rankingCountry: 1, rankingWorld: 167,
      website: "https://www.unibo.it/en", financialAidWebsite: "https://www.unibo.it/en/services-and-opportunities/study-grants-and-subsidies",
      comment: { ru: "Финальный дедлайн — оценка команды по аналогии с похожими программами. Сверьте с официальным сайтом.", en: "The final deadline is the team's estimate based on comparable programs. Verify against the official website." }
    },
    {
      id: "polimi", name: "Politecnico di Milano", fullName: "Politecnico di Milano",
      country: "italy", city: { ru: "Милан", en: "Milan" }, majors: ["engineering", "arts"],
      acceptanceRate: 0.5,
      deadlineEarly: { ru: "26 марта", en: "March 26" }, deadlineMain: { ru: "31 июля", en: "July 31" },
      ielts: 6.0, toefl: 78, sat: null,
      essay: true, recommendationLetters: { ru: "Не менее 2 писем", en: "At least 2 letters" },
      scholarship: { ru: "Региональные гранты DSU + стипендии Politecnico по успеваемости", en: "Regional DSU grants + merit-based Politecnico scholarships" },
      dormitory: { ru: "Да, ограниченно", en: "Yes, limited" },
      rankingCountry: 16, rankingWorld: 301,
      website: "https://www.polimi.it/en", financialAidWebsite: "https://www.polimi.it/en/current-students/tuition-fees-scholarships-and-financial-aid/",
      comment: { ru: "⚠ Изначально указаны инженерная и дизайн-специальности — это реалистично для Politecnico, но сверьте по конкретной программе. Финальный дедлайн — оценка команды.", en: "⚠ Both engineering and design majors are listed originally — that's realistic for Politecnico, but verify for the specific program. The final deadline is the team's estimate." }
    },
    {
      id: "bme", name: "BME", fullName: "Budapest University of Technology and Economics",
      country: "hungary", city: { ru: "Будапешт", en: "Budapest" }, majors: ["engineering"],
      acceptanceRate: 0.27,
      deadlineEarly: { ru: "15 июня", en: "June 15" }, deadlineMain: { ru: "15 июля", en: "July 15" },
      ielts: 5.5, toefl: 72, sat: null,
      essay: false, recommendationLetters: { ru: "Требуется рекомендательное письмо", en: "A recommendation letter is required" },
      scholarship: { ru: "Стипендии по академической успеваемости для иностранных студентов (включая программы вроде Stipendium Hungaricum)", en: "Merit-based scholarships for international students (including programs like Stipendium Hungaricum)" },
      dormitory: { ru: "Да, кампус", en: "Yes, on campus" },
      rankingCountry: 5, rankingWorld: "801–1000",
      website: "https://xplore.bme.hu/admission/", financialAidWebsite: null,
      comment: { ru: "Финальный дедлайн и стипендиальная программа — оценка команды по аналогии с похожими вузами Венгрии.", en: "The final deadline and scholarship program are the team's estimate based on comparable Hungarian universities." }
    },
    {
      id: "elte", name: "ELTE", fullName: "Eötvös Loránd University",
      country: "hungary", city: { ru: "Будапешт", en: "Budapest" }, majors: ["intl_relations"],
      acceptanceRate: 0.35,
      deadlineEarly: { ru: "15 марта", en: "March 15" }, deadlineMain: { ru: "15 июня", en: "June 15" },
      ielts: 5.5, toefl: 72, sat: null,
      essay: true, recommendationLetters: { ru: "Требуется рекомендательное письмо", en: "A recommendation letter is required" },
      scholarship: { ru: "Институциональные и государственные стипендии (включая программы вроде Stipendium Hungaricum), по конкурсу", en: "Institutional and government scholarships (including programs like Stipendium Hungaricum), competitive" },
      dormitory: { ru: "Да, кампус", en: "Yes, on campus" },
      rankingCountry: 3, rankingWorld: "601–650",
      website: "https://www.elte.hu/en/", financialAidWebsite: null,
      comment: { ru: "Финальный дедлайн и стипендиальная программа — оценка команды по аналогии с похожими вузами Венгрии.", en: "The final deadline and scholarship program are the team's estimate based on comparable Hungarian universities." }
    },
    {
      id: "semmelweis", name: "Semmelweis University", fullName: "Semmelweis Egyetem",
      country: "hungary", city: { ru: "Будапешт", en: "Budapest" }, majors: ["medicine"],
      acceptanceRate: 0.25,
      deadlineEarly: { ru: "31 мая", en: "May 31" }, deadlineMain: { ru: "30 июня", en: "June 30" },
      ielts: 6.0, toefl: 80, sat: null,
      essay: true, recommendationLetters: { ru: "Требуется рекомендательное письмо", en: "A recommendation letter is required" },
      scholarship: { ru: "Ограниченные стипендии для иностранных студентов на медицинские программы", en: "Limited scholarships for international students in medical programs" },
      dormitory: { ru: "Да, кампус", en: "Yes, on campus" },
      rankingCountry: 4, rankingWorld: "1001–1200",
      website: "https://semmelweis.hu/english/", financialAidWebsite: null,
      comment: { ru: "Экзамены, дедлайн, стипендия и рейтинг не были опубликованы в источнике напрямую — команда оценила их по аналогии с похожими медицинскими программами Венгрии.", en: "Exams, deadline, scholarship, and ranking weren't published directly in the source — the team estimated them based on comparable Hungarian medical programs." }
    },
    {
      id: "tsinghua", name: "Tsinghua University", fullName: "清华大学",
      country: "china", city: { ru: "Пекин", en: "Beijing" }, majors: ["it"],
      acceptanceRate: 0.25,
      deadlineEarly: null, deadlineMain: { ru: "25 августа, для абитуриентов-иностранцев", en: "August 25, for international applicants" },
      ielts: 6.5, toefl: 100, sat: 1450,
      essay: true, recommendationLetters: { ru: "Требуется", en: "Required" },
      scholarship: { ru: "CSC grant (China Scholarship Council)", en: "CSC grant (China Scholarship Council)" },
      dormitory: { ru: "Да, кампус", en: "Yes, on campus" },
      rankingCountry: 1, rankingWorld: 13,
      website: "https://www.tsinghua.edu.cn/en/", financialAidWebsite: "https://www.tsinghua.edu.cn/en/Admissions/International_Students1/Financial_Aid.htm",
      comment: { ru: "Процент поступления указан для иностранных студентов, не общий конкурс.", en: "The acceptance rate is for international students, not the overall competition." }
    },
    {
      id: "peking", name: "Peking University", fullName: "北京大学",
      country: "china", city: { ru: "Пекин", en: "Beijing" }, majors: ["medicine"],
      acceptanceRate: 0.15,
      deadlineEarly: null, deadlineMain: { ru: "30 августа", en: "August 30" },
      ielts: 6.5, toefl: 75, sat: 1400,
      essay: true, recommendationLetters: { ru: "Требуются 2 письма", en: "2 letters required" },
      scholarship: { ru: "Стипендии китайского правительства (CSC) и стипендии Пекинского университета, по конкурсу", en: "Chinese Government Scholarship (CSC) and Peking University scholarships, competitive" },
      dormitory: { ru: "Да, ограниченно", en: "Yes, limited" },
      rankingCountry: 2, rankingWorld: 14,
      website: "https://english.pku.edu.cn", financialAidWebsite: null,
      comment: { ru: "Процент поступления — для иностранных студентов.", en: "The acceptance rate is for international students." }
    },
    {
      id: "zhejiang", name: "Zhejiang University", fullName: "浙江大学",
      country: "china", city: { ru: "Ханчжоу", en: "Hangzhou" }, majors: ["engineering"],
      acceptanceRate: 0.3,
      deadlineEarly: null, deadlineMain: { ru: "10 марта", en: "March 10" },
      ielts: 6.0, toefl: 90, sat: 1350,
      essay: true, recommendationLetters: { ru: "Требуются 2 письма", en: "2 letters required" },
      scholarship: { ru: "Стипендии китайского правительства (CSC) и региональные стипендии провинции Чжэцзян", en: "Chinese Government Scholarship (CSC) and Zhejiang provincial scholarships" },
      dormitory: { ru: "Да, ограниченно", en: "Yes, limited" },
      rankingCountry: 4, rankingWorld: 42,
      website: "https://www.zju.edu.cn/english/main.htm", financialAidWebsite: null,
      comment: { ru: "Процент поступления указан для иностранных студентов.", en: "The acceptance rate is for international students." }
    },
    {
      id: "kaist", name: "KAIST", fullName: "Korea Advanced Institute of Science and Technology",
      country: "south_korea", city: { ru: "Тэджон", en: "Daejeon" }, majors: ["engineering"],
      acceptanceRate: 0.18,
      deadlineEarly: { ru: "21 октября", en: "October 21" }, deadlineMain: { ru: "13 января, для иностранных абитуриентов", en: "January 13, for international applicants" },
      ielts: 6.5, toefl: 83, sat: 1450,
      essay: false, recommendationLetters: { ru: "Только 1 письмо", en: "Only 1 letter" },
      scholarship: { ru: "GKS — Global Korea Scholarship + стипендии KAIST", en: "GKS — Global Korea Scholarship + KAIST scholarships" },
      dormitory: { ru: "Да, кампус", en: "Yes, on campus" },
      rankingCountry: 1, rankingWorld: 96,
      website: "https://admission.kaist.ac.kr/intl-undergraduate/", financialAidWebsite: "https://admission.kaist.ac.kr/intl-undergraduate/scholarships/",
      comment: { ru: "Проверьте актуальный порядок дедлайнов на официальном сайте перед подачей.", en: "Verify the current order of deadlines on the official website before applying." }
    },
    {
      id: "kyunghee", name: "Kyung Hee University", fullName: "경희대학교",
      country: "south_korea", city: { ru: "Сеул", en: "Seoul" }, majors: ["arts"],
      acceptanceRate: 0.45,
      deadlineEarly: { ru: "19 марта", en: "March 19" }, deadlineMain: { ru: "15 мая", en: "May 15" },
      ielts: 5.5, toefl: 80, sat: 1150,
      essay: true, recommendationLetters: { ru: "Не требуются", en: "Not required" },
      scholarship: { ru: "Стипендии по академической успеваемости для иностранных студентов (частичное покрытие)", en: "Merit-based scholarships for international students (partial coverage)" },
      dormitory: { ru: "Да, кампус", en: "Yes, on campus" },
      rankingCountry: 8, rankingWorld: "251–300",
      website: "https://www.khu.ac.kr/eng/", financialAidWebsite: null,
      comment: { ru: "Финальный дедлайн и стипендия — оценка команды. Уточняйте на khu.ac.kr перед подачей.", en: "The final deadline and scholarship are the team's estimate. Check khu.ac.kr before applying." }
    },
    {
      id: "jeonbuk", name: "Jeonbuk National University", fullName: "전북대학교",
      country: "south_korea", city: { ru: "Чонджу", en: "Jeonju" }, majors: ["it"],
      acceptanceRate: 0.2,
      deadlineEarly: { ru: "1 апреля", en: "April 1" }, deadlineMain: { ru: "1 октября", en: "October 1" },
      ielts: 5.5, toefl: 80, sat: 1050,
      essay: true, recommendationLetters: { ru: "Не требуется", en: "Not required" },
      scholarship: { ru: "Стипендии GKS и внутренние стипендии университета по успеваемости", en: "GKS scholarships and university merit-based scholarships" },
      dormitory: { ru: "Да, кампус", en: "Yes, on campus" },
      rankingCountry: 18, rankingWorld: "591–600",
      website: "https://www.jbnu.ac.kr/eng/", financialAidWebsite: null,
      comment: { ru: "⚠ Город исправлен на Jeonju (в источнике ошибочно указан Seoul) — перепроверьте.", en: "⚠ The city was corrected to Jeonju (the source mistakenly listed Seoul) — double-check this." }
    }
  ];

  // ---------------------------------------------------------------------
  // Олимпиады / хакатоны — реальные международные площадки.
  // ---------------------------------------------------------------------
  var EVENTS = [
    { id: "ioi", name: "IOI — International Olympiad in Informatics", majors: ["it"], type: { ru: "Олимпиада", en: "Olympiad" }, level: { ru: "Международный", en: "International" }, format: { ru: "Очно", en: "In-person" }, timing: { ru: "Обычно июль-август, отбор через национальную сборную заранее", en: "Usually July–August, selection via the national team in advance" }, website: "https://ioinformatics.org", whyBoost: { ru: "Одна из самых престижных международных олимпиад по программированию — сильный предметный сигнал для технических программ.", en: "One of the most prestigious international programming olympiads — a strong subject signal for technical programs." }, limitation: { ru: "Участие — через национальный отборочный этап.", en: "Participation is via a national qualifying round." } },
    { id: "nasa_space_apps", name: "NASA International Space Apps Challenge", majors: ["it", "engineering"], type: { ru: "Хакатон", en: "Hackathon" }, level: { ru: "Международный", en: "International" }, format: { ru: "Очно/онлайн", en: "In-person/online" }, timing: { ru: "Обычно октябрь, ежегодно", en: "Usually October, annually" }, website: "https://spaceappschallenge.org", whyBoost: { ru: "Международный хакатон NASA — показывает проектные и командные навыки в IT и инженерии на практике.", en: "NASA's international hackathon — demonstrates practical project and teamwork skills in IT and engineering." }, limitation: null },
    { id: "technovation", name: "Technovation Girls", majors: ["it"], type: { ru: "Конкурс проектов", en: "Project competition" }, level: { ru: "Международный", en: "International" }, format: { ru: "Очно/онлайн", en: "In-person/online" }, timing: { ru: "Регистрация обычно зимой, финал — летом", en: "Registration is usually in winter, the final is in summer" }, website: "https://technovationchallenge.org", whyBoost: { ru: "Международная программа разработки технологических решений — отдельно ценится для портфолио в IT.", en: "An international tech-solutions development program — especially valued for an IT portfolio." }, limitation: { ru: "Участие ориентировано на девушек и представительниц гендерных меньшинств школьного возраста.", en: "Participation is aimed at school-age girls and gender minorities." } },
    { id: "first_global", name: "FIRST Global Challenge", majors: ["engineering"], type: { ru: "Соревнование", en: "Competition" }, level: { ru: "Международный", en: "International" }, format: { ru: "Очно", en: "In-person" }, timing: { ru: "Обычно сентябрь-октябрь", en: "Usually September–October" }, website: "https://first.global", whyBoost: { ru: "Международное соревнование по робототехнике между сборными стран — заметный сигнал для инженерных программ.", en: "An international robotics competition between national teams — a notable signal for engineering programs." }, limitation: { ru: "Отбор в сборную страны обычно идёт через национального партнёра FIRST Global.", en: "Selection to the national team is usually via FIRST Global's national partner." } },
    { id: "genius_olympiad", name: "Genius Olympiad", majors: ["engineering", "it", "business"], type: { ru: "Олимпиада проектов", en: "Project olympiad" }, level: { ru: "Международный", en: "International" }, format: { ru: "Очно (США)", en: "In-person (USA)" }, timing: { ru: "Обычно июнь", en: "Usually June" }, website: "https://geniusolympiad.org", whyBoost: { ru: "Международная выставка научно-инженерных и экологических проектов — ценится для инженерных и научных направлений.", en: "An international exhibition of scientific, engineering and environmental projects — valued for engineering and science fields." }, limitation: { ru: "Участие платное, требуется самостоятельная организация поездки.", en: "Participation is paid, and travel must be arranged independently." } },
    { id: "ibo", name: "IBO — International Biology Olympiad", majors: ["medicine"], type: { ru: "Олимпиада", en: "Olympiad" }, level: { ru: "Международный", en: "International" }, format: { ru: "Очно", en: "In-person" }, timing: { ru: "Обычно июль", en: "Usually July" }, website: "https://www.ibo-info.org", whyBoost: { ru: "Международная олимпиада по биологии — один из самых узнаваемых результатов для медицинских программ.", en: "An international biology olympiad — one of the most recognizable results for medical programs." }, limitation: { ru: "Участие — через национальную сборную.", en: "Participation is via the national team." } },
    { id: "icho", name: "IChO — International Chemistry Olympiad", majors: ["medicine"], type: { ru: "Олимпиада", en: "Olympiad" }, level: { ru: "Международный", en: "International" }, format: { ru: "Очно", en: "In-person" }, timing: { ru: "Обычно июль", en: "Usually July" }, website: "https://icho-official.org", whyBoost: { ru: "Международная олимпиада по химии — значимый предметный сигнал для медицинских и естественнонаучных программ.", en: "An international chemistry olympiad — a meaningful subject signal for medical and natural science programs." }, limitation: { ru: "Участие — через национальную сборную.", en: "Participation is via the national team." } },
    { id: "hosa", name: "HOSA — Future Health Professionals", majors: ["medicine"], type: { ru: "Соревнование", en: "Competition" }, level: { ru: "Международный", en: "International" }, format: { ru: "Очно (США)", en: "In-person (USA)" }, timing: { ru: "Обычно июнь", en: "Usually June" }, website: "https://hosa.org", whyBoost: { ru: "Международные соревнования по медицинским компетенциям — показывают раннюю вовлечённость в профессию.", en: "International competitions in medical competencies — demonstrate early engagement with the profession." }, limitation: { ru: "Для иностранных участников — через международный трек HOSA, доступность варьируется по регионам.", en: "For international participants — via the HOSA international track; availability varies by region." } },
    { id: "deca_icdc", name: "DECA ICDC", majors: ["business"], type: { ru: "Соревнование", en: "Competition" }, level: { ru: "Международный", en: "International" }, format: { ru: "Очно (США)", en: "In-person (USA)" }, timing: { ru: "Обычно апрель-май", en: "Usually April–May" }, website: "https://deca.org", whyBoost: { ru: "Международное соревнование по бизнес-кейсам и маркетингу — ценится для программ бизнеса и менеджмента.", en: "An international business-case and marketing competition — valued for business and management programs." }, limitation: { ru: "Для международных участников — через партнёрские отделения DECA.", en: "For international participants — via DECA partner chapters." } },
    { id: "ieo", name: "IEO — International Economics Olympiad", majors: ["business"], type: { ru: "Олимпиада", en: "Olympiad" }, level: { ru: "Международный", en: "International" }, format: { ru: "Очно", en: "In-person" }, timing: { ru: "Обычно август", en: "Usually August" }, website: "https://ieo-official.org", whyBoost: { ru: "Международная олимпиада по экономике — предметный результат, напрямую релевантный для бизнес-программ.", en: "An international economics olympiad — a subject result directly relevant to business programs." }, limitation: { ru: "Участие — через национальную сборную.", en: "Participation is via the national team." } },
    { id: "thimun", name: "THIMUN", majors: ["intl_relations"], type: { ru: "Модель ООН", en: "Model UN" }, level: { ru: "Международный", en: "International" }, format: { ru: "Очно (Гаага и другие площадки)", en: "In-person (The Hague and other venues)" }, timing: { ru: "Обычно январь (основная сессия в Гааге)", en: "Usually January (main session in The Hague)" }, website: "https://thimun.org", whyBoost: { ru: "Одна из крупнейших моделей ООН в мире — стандартный сильный сигнал для программ международных отношений.", en: "One of the largest Model UN conferences in the world — a standard strong signal for international relations programs." }, limitation: { ru: "Требуется делегирование от школы и подготовка позиционных документов.", en: "Requires delegation through your school and preparation of position papers." } },
    { id: "scholastic_awards", name: "Scholastic Art & Writing Awards", majors: ["arts"], type: { ru: "Конкурс работ", en: "Portfolio competition" }, level: { ru: "Международный", en: "International" }, format: { ru: "Заочно (подача работ)", en: "Remote (submission of works)" }, timing: { ru: "Обычно подача осенью-зимой", en: "Submissions are usually in fall–winter" }, website: "https://www.artandwriting.org", whyBoost: { ru: "Один из самых узнаваемых конкурсов творческих работ — отмеченные работы заметно усиливают портфолио для творческих направлений.", en: "One of the most recognizable creative-work competitions — award-winning pieces noticeably strengthen a portfolio for creative fields." }, limitation: { ru: "Исторически ориентирован на школы США; международное участие возможно через партнёрские программы, доступность варьируется — уточняйте на сайте.", en: "Historically aimed at US schools; international participation is possible via partner programs, availability varies — check the website." } }
  ];

  // ---------------------------------------------------------------------
  // Достижения — свободные категории записей (тема/область + результат).
  // Порядок — по значимости для поступления (обсуждено отдельно от кейса,
  // это внутреннее решение команды, не научный факт).
  // ---------------------------------------------------------------------
  var ACHIEVEMENT_CATEGORIES = [
    { key: "projects", label: { ru: "Проектные работы по специальности", en: "Projects in your field" }, placeholderA: { ru: "Тема проекта", en: "Project topic" }, placeholderB: { ru: "Результат / где показано", en: "Result / where it was shown" } },
    { key: "hackathons", label: { ru: "Хакатоны", en: "Hackathons" }, placeholderA: { ru: "Название хакатона", en: "Hackathon name" }, placeholderB: { ru: "Результат (место, номинация)", en: "Result (placement, category)" } },
    {
      key: "research", label: { ru: "Исследования (научные работы)", en: "Research (academic work)" },
      placeholderA: { ru: "Тема исследования", en: "Research topic" }, placeholderB: { ru: "Результат / где опубликовано", en: "Result / where it was published" },
      note: { ru: "Засчитывается исследование, результат которого где-то опубликован или оформлен как отчёт/статья — а не просто личный проект «для себя».", en: "Only research whose result is published somewhere or written up as a report/paper counts — not just a personal project “for yourself”." },
      tip: {
        title: { ru: "Как найти научного руководителя", en: "How to find a research advisor" },
        intro: { ru: "Это наш совет, а не гарантированный рецепт — но с чего-то стоит начать:", en: "This is our advice, not a guaranteed recipe — but it's a place to start:" },
        items: {
          ru: [
            "Искать преподавателей профильных кафедр местных вузов напрямую по теме, которая интересует.",
            "Использовать LinkedIn: искать по названию кафедры/университета + ключевым словам темы, писать короткое вежливое сообщение с конкретным вопросом или предложением, а не общее «хочу с вами поработать».",
            "Спрашивать школьных учителей профильных предметов — они часто знают преподавателей вузов лично.",
            "Смотреть программы научного менторства для школьников (летние школы, олимпиадные лагеря, локальные научные кружки) как альтернативный вход в тему без прямого поиска научного руководителя."
          ],
          en: [
            "Look for faculty at relevant departments of local universities directly, based on your topic of interest.",
            "Use LinkedIn: search by department/university name plus topic keywords, and send a short, polite message with a concrete question or proposal — not a generic “I want to work with you”.",
            "Ask your school subject teachers — they often know university faculty personally.",
            "Look into research mentorship programs for high schoolers (summer schools, olympiad camps, local science clubs) as an alternative way into a topic without directly searching for an advisor."
          ]
        }
      }
    },
    {
      key: "olympiads", label: { ru: "Олимпиады", en: "Olympiads" }, placeholderA: { ru: "Название олимпиады", en: "Olympiad name" }, placeholderB: { ru: "Результат (место, год)", en: "Result (placement, year)" },
      note: { ru: "Учитываются только олимпиады республиканского или международного уровня — школьные и городские почти не рассматриваются приёмными комиссиями за рубежом.", en: "Only national or international-level olympiads count — school and city-level ones are rarely considered by admissions committees abroad." }
    },
    { key: "volunteering", label: { ru: "Волонтёрство", en: "Volunteering" }, variant: "volunteering" },
    { key: "internships", label: { ru: "Стажировки", en: "Internships" }, placeholderA: { ru: "Где стажировались", en: "Where you interned" }, placeholderB: { ru: "Чем занимались / результат", en: "What you did / result" } },
    {
      key: "sport", label: { ru: "Спортивные достижения", en: "Sports achievements" }, variant: "sport",
      note: { ru: "Наша позиция (не научный факт): спортивные достижения ценятся почти всегда, независимо от специальности и страны.", en: "Our own view (not a scientific fact): sports achievements are valued almost everywhere, regardless of major or country." }
    }
  ];

  // Виды спорта (чипы) и уровни достижения — для категории "Спорт". У видов
  // спорта есть стабильный id (используется как хранимое значение), метка —
  // двуязычная, чтобы переключение языка не ломало уже выбранные чипы.
  var SPORTS = [
    { id: "football", label: { ru: "Футбол", en: "Football" } },
    { id: "basketball", label: { ru: "Баскетбол", en: "Basketball" } },
    { id: "swimming", label: { ru: "Плавание", en: "Swimming" } },
    { id: "athletics", label: { ru: "Лёгкая атлетика", en: "Track and field" } },
    { id: "martial_arts", label: { ru: "Единоборства", en: "Martial arts" } },
    { id: "tennis", label: { ru: "Теннис", en: "Tennis" } },
    { id: "chess", label: { ru: "Шахматы", en: "Chess" } },
    { id: "volleyball", label: { ru: "Волейбол", en: "Volleyball" } },
    { id: "other", label: { ru: "Другое", en: "Other" } }
  ];
  var SPORT_LEVELS = [
    { id: "school", label: { ru: "Школьный", en: "School" } },
    { id: "city", label: { ru: "Городской", en: "City" } },
    { id: "regional", label: { ru: "Областной", en: "Regional" } },
    { id: "republican", label: { ru: "Республиканский", en: "National" } },
    { id: "international", label: { ru: "Международный", en: "International" } }
  ];

  // Сферы волонтёрства (чипы) — выбираются на уровне отдельной записи.
  // Тот же принцип стабильного id + двуязычной метки, что и у SPORTS.
  var VOLUNTEER_SPHERES = [
    { id: "ecology", label: { ru: "Экология", en: "Ecology" } },
    { id: "social_aid", label: { ru: "Соц. помощь", en: "Social aid" } },
    { id: "medical", label: { ru: "Мед. волонтёрство", en: "Medical volunteering" } },
    { id: "education", label: { ru: "Образование", en: "Education" } },
    { id: "culture", label: { ru: "Культура", en: "Culture" } },
    { id: "other", label: { ru: "Другое", en: "Other" } }
  ];

  var CUSTOM_ACHIEVEMENT_CATEGORY = {
    key: "custom", label: { ru: "Своё достижение", en: "Other achievement" },
    placeholderA: { ru: "Что это было", en: "What it was" }, placeholderB: { ru: "Что сделано / результат", en: "What you did / result" },
    note: { ru: "Сюда впишите то, что не попадает в другие категории — лидерский опыт, свои проекты вне учёбы, руководство чем-либо. Это пригодится и для портфолио, и позже при написании мотивационного письма.", en: "Add anything that doesn't fit other categories — leadership experience, projects outside school, running something. This is useful both for your portfolio and later when writing your motivation letter." }
  };

  // ---------------------------------------------------------------------
  // Документы на подачу — общий чек-лист + условный пункт для творческих
  // специальностей. Статус трёхпозиционный: не начато / в процессе / готово.
  // ---------------------------------------------------------------------
  var DOCUMENT_ITEMS = [
    {
      key: "motivationLetter", label: { ru: "Мотивационное письмо", en: "Motivation letter" },
      tip: {
        title: { ru: "Как писать мотивационное письмо", en: "How to write a motivation letter" },
        intro: { ru: "Это наш совет, а не готовый шаблон — но с чего-то стоит начать:", en: "This is our advice, not a ready-made template — but it's a place to start:" },
        items: {
          ru: [
            "Начните с конкретной истории или момента, который привёл вас к выбранной специальности — не с общих фраз вроде «я всегда любил(а) науку».",
            "Свяжите свой реальный опыт (проекты, достижения, эксперименты) с тем, почему именно эта программа и вуз вам подходят — покажите, что вы изучили программу, а не отправляете одно письмо во все вузы.",
            "Расскажите не только что вуз даст вам, но и что вы дадите вузу/сообществу.",
            "Избегайте клише вроде «этот вуз изменит мою жизнь» без конкретного пояснения, как именно.",
            "Дайте письму «отлежаться» день-два и попросите прочитать его учителя или консультанта перед подачей."
          ],
          en: [
            "Start with a specific story or moment that led you to your chosen major — not a general phrase like “I've always loved science”.",
            "Connect your real experience (projects, achievements, experiments) to why this specific program and university fit you — show that you researched the program, not that you're sending the same letter everywhere.",
            "Explain not just what the university would give you, but what you'd bring to it.",
            "Avoid clichés like “this university will change my life” without a concrete explanation of how.",
            "Let the letter sit for a day or two, and have a teacher or counselor read it before you submit."
          ]
        }
      }
    },
    { key: "essay", label: { ru: "Эссе о выборе специальности", en: "Essay on choice of major" } },
    {
      key: "recommendationLetters", label: { ru: "Рекомендательные письма", en: "Recommendation letters" },
      tip: {
        title: { ru: "Где брать рекомендательные письма", en: "Where to get recommendation letters" },
        intro: { ru: "Это наш совет, а не гарантированный рецепт — но с чего-то стоит начать:", en: "This is our advice, not a guaranteed recipe — but it's a place to start:" },
        items: {
          ru: [
            "В первую очередь — учителя профильных предметов, которые хорошо знают вашу работу не один семестр, а лучше 1–2 года.",
            "Руководители кружков, секций, волонтёрских или исследовательских проектов — они могут рассказать о конкретных качествах, а не только об оценках.",
            "Если у вас есть научный руководитель или ментор — это часто одна из самых сильных рекомендаций, показывающая реальный опыт исследовательской или проектной работы.",
            "Если научного руководителя пока нет, но исследование в планах — поищите его в LinkedIn: по названию кафедры/университета + ключевым словам темы, с коротким вежливым сообщением и конкретным вопросом, а не общим «хочу с вами поработать».",
            "Просите письмо заранее (за 3–4 недели до дедлайна) и дайте рекомендателю материалы о себе — список достижений, тему проекта, почему вы выбрали эту программу."
          ],
          en: [
            "First and foremost — teachers of relevant subjects who know your work well over more than one semester, ideally 1–2 years.",
            "Leaders of clubs, sports sections, volunteering, or research projects — they can speak to specific qualities, not just grades.",
            "If you have a research advisor or mentor — that's often one of the strongest recommendations, showing real research or project experience.",
            "If you don't have a research advisor yet but are planning to do research — try LinkedIn: search by department/university name plus topic keywords, and send a short, polite message with a concrete question, not a generic “I want to work with you”.",
            "Ask for the letter early (3–4 weeks before the deadline) and give the recommender material about yourself — a list of achievements, your project topic, why you chose this program."
          ]
        }
      }
    },
    { key: "transcript", label: { ru: "Переведённый и заверенный транскрипт", en: "Translated and certified transcript" } },
    { key: "languageCertificate", label: { ru: "Языковой сертификат (IELTS и т.п.)", en: "Language certificate (IELTS etc.)" } },
    { key: "portfolio", label: { ru: "Портфолио работ", en: "Portfolio of work" }, onlyMajor: "arts" }
  ];

  // ---------------------------------------------------------------------
  // Выбор страны — качественная оценка Uniora по практическим факторам
  // (без стоимости обучения/жизни — команда сознательно не использует
  // бюджет как критерий подбора).
  // ---------------------------------------------------------------------
  var COUNTRY_DIMENSION_LABELS = {
    admissionChance: { ru: "Шанс поступления", en: "Chance of admission" },
    scholarships: { ru: "Стипендии для иностранцев", en: "Scholarships for international students" },
    englishPrograms: { ru: "Программы на английском", en: "English-taught programs" },
    visaBureaucracy: { ru: "Виза и бюрократия", en: "Visa and paperwork" }
  };

  var COUNTRY_INFO = {
    china: {
      blurb: { ru: "Топовые технические и гуманитарные вузы мирового уровня, но конкурс на лучшие программы очень высокий.", en: "World-class top technical and humanities universities, but competition for the best programs is very high." },
      admissionChance: { level: "low", note: { ru: "Ведущие университеты (Tsinghua, Peking) — одни из самых конкурентных в мире даже для иностранцев.", en: "Leading universities (Tsinghua, Peking) are among the most competitive in the world, even for international students." } },
      scholarships: { level: "high", note: { ru: "CSC grant (China Scholarship Council) — одна из самых доступных крупных грантовых программ для иностранных студентов.", en: "The CSC grant (China Scholarship Council) is one of the most accessible large grant programs for international students." } },
      englishPrograms: { level: "medium", note: { ru: "Англоязычные треки есть у топовых вузов, но не на всех программах и не во всех городах.", en: "English-taught tracks exist at top universities, but not for every program or in every city." } },
      visaBureaucracy: { level: "medium", note: { ru: "Студенческая виза X1/X2 — процесс стандартный, но требует приглашения от вуза и медицинских документов.", en: "The X1/X2 student visa process is standard, but requires an invitation from the university and medical documents." } }
    },
    hungary: {
      blurb: { ru: "Популярное направление для медицины: доступный конкурс и сильная стипендиальная программа для СНГ.", en: "A popular choice for medicine: accessible competition and a strong scholarship program for CIS applicants." },
      admissionChance: { level: "high", note: { ru: "Проходимость выше, чем в Китае, США или Южной Корее — вузы активно набирают международных студентов.", en: "Acceptance rates are higher than in China, the US, or South Korea — universities actively recruit international students." } },
      scholarships: { level: "high", note: { ru: "Stipendium Hungaricum — одна из самых известных программ для студентов из СНГ, покрывает обучение и часто общежитие.", en: "Stipendium Hungaricum is one of the best-known programs for CIS students, covering tuition and often housing." } },
      englishPrograms: { level: "high", note: { ru: "Медицина, IT и бизнес почти полностью доступны на английском языке.", en: "Medicine, IT, and business are almost entirely available in English." } },
      visaBureaucracy: { level: "medium", note: { ru: "Стандартная студенческая виза ЕС, обычно 4–6 недель обработки.", en: "A standard EU student visa, usually 4–6 weeks of processing." } }
    },
    south_korea: {
      blurb: { ru: "Сильные технические программы (особенно в KAIST) и растущее число англоязычных треков.", en: "Strong technical programs (especially at KAIST) and a growing number of English-taught tracks." },
      admissionChance: { level: "medium", note: { ru: "Конкурс средний: топовые технические вузы избирательны, региональные университеты — заметно доступнее.", en: "Competition is moderate: top technical universities are selective, regional universities are noticeably more accessible." } },
      scholarships: { level: "medium", note: { ru: "GKS (Global Korea Scholarship) существует, но мест ограниченное количество и конкурс на неё отдельный.", en: "GKS (Global Korea Scholarship) exists, but spots are limited and competition for it is separate." } },
      englishPrograms: { level: "medium", note: { ru: "Треки на английском есть, но во многих вузах соседствуют с обязательными предметами на корейском.", en: "English-taught tracks exist, but at many universities they coexist with mandatory Korean-language courses." } },
      visaBureaucracy: { level: "medium", note: { ru: "Виза D-2 — процесс стандартный, но список документов длиннее, чем в ЕС.", en: "The D-2 visa process is standard, but the document list is longer than in the EU." } }
    },
    usa: {
      blurb: { ru: "Мировые лидеры почти во всех направлениях, но самый высокий конкурс и самый холистический отбор.", en: "World leaders in almost every field, but the highest competition and the most holistic admissions process." },
      admissionChance: { level: "low", note: { ru: "Топовые университеты принимают единицы процентов заявок — конкурс один из самых высоких в мире.", en: "Top universities accept only a few percent of applications — one of the highest levels of competition in the world." } },
      scholarships: { level: "low", note: { ru: "Большинство вузов need-aware для иностранных студентов — финансовая помощь ограничена и учитывается при отборе.", en: "Most universities are need-aware for international students — financial aid is limited and factored into admissions." } },
      englishPrograms: { level: "high", note: { ru: "Английский — язык обучения по умолчанию во всех программах.", en: "English is the default language of instruction across all programs." } },
      visaBureaucracy: { level: "high", note: { ru: "Виза F-1 требует очного собеседования в посольстве и обычно самый долгий процесс среди этих 6 стран.", en: "The F-1 visa requires an in-person embassy interview and is usually the longest process among these 6 countries." } }
    },
    turkey: {
      blurb: { ru: "Собственные вступительные экзамены (YÖS) и одна из самых доступных по проходимости стран из шести.", en: "Its own entrance exams (YÖS), and one of the most accessible countries by acceptance rate among the six." },
      admissionChance: { level: "high", note: { ru: "Приёмная кампания через YÖS ориентирована на массовый набор — проходимость выше, чем в Китае, США и Корее.", en: "The YÖS admissions process is geared toward large-scale intake — acceptance rates are higher than in China, the US, and Korea." } },
      scholarships: { level: "high", note: { ru: "Türkiye Bursları покрывает обучение, проживание и стипендию для большого числа программ и стран.", en: "Türkiye Bursları covers tuition, housing, and a stipend for a large number of programs and countries." } },
      englishPrograms: { level: "medium", note: { ru: "Программы на английском есть у ведущих вузов, но не повсеместно.", en: "English-taught programs exist at leading universities, but not everywhere." } },
      visaBureaucracy: { level: "medium", note: { ru: "Студенческая виза оформляется относительно быстро при наличии подтверждения от вуза.", en: "The student visa is processed relatively quickly once you have confirmation from the university." } }
    },
    italy: {
      blurb: { ru: "Для медицины вступительный экзамен решает почти всё, для остальных направлений конкурс мягче.", en: "For medicine, the entrance exam decides almost everything; for other fields, competition is softer." },
      admissionChance: { level: "medium", note: { ru: "Сильно зависит от направления: медицина — высокий конкурс через централизованный тест, инженерия и гуманитарные — заметно доступнее.", en: "Strongly depends on the field: medicine has high competition via a centralized test, while engineering and humanities are noticeably more accessible." } },
      scholarships: { level: "medium", note: { ru: "Региональные гранты DSU (Diritto allo Studio) выдаются по доходу семьи, не по академическим заслугам.", en: "Regional DSU (Diritto allo Studio) grants are awarded based on family income, not academic merit." } },
      englishPrograms: { level: "medium", note: { ru: "Растущее число программ на английском, особенно в технических и бизнес-вузах севера страны.", en: "A growing number of English-taught programs, especially at technical and business universities in the north." } },
      visaBureaucracy: { level: "medium", note: { ru: "Стандартная студенческая виза ЕС (виза типа D), обычно 4–8 недель.", en: "A standard EU student visa (type D), usually 4–8 weeks." } }
    }
  };

  var COUNTRY_METHOD_DISCLAIMER = {
    ru: "Это собственная качественная оценка команды Uniora на основе изучения публичных требований вузов и типовых практик — не официальная статистика. Стоимость обучения и жизни намеренно не учитывается: команда не использует бюджет как критерий подбора.",
    en: "This is the Uniora team's own qualitative assessment, based on studying universities' public requirements and typical practices — not official statistics. Tuition and living costs are deliberately not factored in: the team doesn't use budget as a matching criterion."
  };

  // ---------------------------------------------------------------------
  // PRIORITIES — эталонная таблица приоритетов портфолио по странам
  // (из data-reference.js, сверено 18.09.2026). Собственная качественная
  // методика команды Uniora, НЕ официальная статистика вузов.
  // level: 'high' | 'medium' | 'low'
  // ---------------------------------------------------------------------
  var PRIORITIES = {
    china: {
      label: { ru: "Китай", en: "China" },
      rows: [
        { cat: "exams", level: "high", note: { ru: "Экзамены и академическая успеваемость — решающий фактор при отборе.", en: "Exams and academic performance are the decisive factor in admissions." } },
        { cat: "research", level: "medium", note: { ru: "Проекты и исследования — заметный плюс, но не обязательное условие.", en: "Projects and research are a notable plus, but not a requirement." } },
        { cat: "olympiads", level: "medium", note: { ru: "Международные олимпиады усиливают заявку, особенно по профильному предмету.", en: "International olympiads strengthen an application, especially in a relevant subject." } },
        { cat: "sport", level: "low", note: { ru: "Спортивные достижения почти не влияют на решение.", en: "Sports achievements have almost no effect on the decision." } },
        { cat: "volunteering", level: "low", note: { ru: "Волонтёрство почти не влияет на решение.", en: "Volunteering has almost no effect on the decision." } }
      ]
    },
    south_korea: {
      label: { ru: "Южная Корея", en: "South Korea" },
      rows: [
        { cat: "exams", level: "high", note: { ru: "Экзамены и академическая успеваемость — решающий фактор при отборе.", en: "Exams and academic performance are the decisive factor in admissions." } },
        { cat: "research", level: "medium", note: { ru: "Проекты и исследования — заметный плюс.", en: "Projects and research are a notable plus." } },
        { cat: "olympiads", level: "medium", note: { ru: "Международные олимпиады усиливают заявку по профильному направлению.", en: "International olympiads strengthen an application in a relevant field." } },
        { cat: "sport", level: "low", note: { ru: "Спортивные достижения почти не влияют на решение.", en: "Sports achievements have almost no effect on the decision." } },
        { cat: "volunteering", level: "low", note: { ru: "Волонтёрство почти не влияет на решение.", en: "Volunteering has almost no effect on the decision." } }
      ]
    },
    hungary: {
      label: { ru: "Венгрия", en: "Hungary" },
      rows: [
        { cat: "exams", level: "high", note: { ru: "Экзамены и академическая успеваемость — решающий фактор при отборе.", en: "Exams and academic performance are the decisive factor in admissions." } },
        { cat: "research", level: "medium", note: { ru: "Проекты и исследования — заметный плюс.", en: "Projects and research are a notable plus." } },
        { cat: "olympiads", level: "medium", note: { ru: "Международные олимпиады усиливают заявку по профильному направлению.", en: "International olympiads strengthen an application in a relevant field." } },
        { cat: "sport", level: "low", note: { ru: "Спортивные достижения почти не влияют на решение.", en: "Sports achievements have almost no effect on the decision." } },
        { cat: "volunteering", level: "low", note: { ru: "Волонтёрство почти не влияет на решение.", en: "Volunteering has almost no effect on the decision." } }
      ]
    },
    italy: {
      label: { ru: "Италия", en: "Italy" },
      rows: [
        { cat: "exams", level: "high", note: { ru: "Для медицины вступительный экзамен решает почти всё; для искусства — отдельное творческое портфолио. В остальном — средне-высокая значимость.", en: "For medicine, the entrance exam decides almost everything; for arts, a separate creative portfolio is required. Otherwise, medium-to-high importance." } },
        { cat: "research", level: "medium", note: { ru: "Проекты и исследования — заметный плюс.", en: "Projects and research are a notable plus." } },
        { cat: "olympiads", level: "medium", note: { ru: "Международные олимпиады усиливают заявку по профильному направлению.", en: "International olympiads strengthen an application in a relevant field." } },
        { cat: "sport", level: "low", note: { ru: "Спортивные достижения почти не влияют на решение.", en: "Sports achievements have almost no effect on the decision." } },
        { cat: "volunteering", level: "low", note: { ru: "Волонтёрство почти не влияет на решение.", en: "Volunteering has almost no effect on the decision." } }
      ]
    },
    turkey: {
      label: { ru: "Турция", en: "Turkey" },
      rows: [
        { cat: "exams", level: "high", note: { ru: "Собственные вступительные экзамены вузов (например, YÖS) обычно решают почти всё.", en: "Universities' own entrance exams (e.g. YÖS) usually decide almost everything." } },
        { cat: "research", level: "medium", note: { ru: "Проекты и исследования — заметный плюс.", en: "Projects and research are a notable plus." } },
        { cat: "olympiads", level: "medium", note: { ru: "Международные олимпиады усиливают заявку по профильному направлению.", en: "International olympiads strengthen an application in a relevant field." } },
        { cat: "sport", level: "medium", note: { ru: "Спортивная активность иногда учитывается при отборе на гранты.", en: "Sports activity is sometimes considered for grant selection." } },
        { cat: "volunteering", level: "medium", note: { ru: "Может иметь значение для стипендиальных программ вроде Türkiye Bursları.", en: "Can matter for scholarship programs like Türkiye Bursları." } }
      ]
    },
    usa: {
      label: { ru: "США", en: "USA" },
      rows: [
        { cat: "exams", level: "medium", note: { ru: "Экзамены — это порог, а не решающий фактор сам по себе.", en: "Exams are a threshold, not a decisive factor on their own." } },
        { cat: "research", level: "high", note: { ru: "Исследования и проекты с измеримым результатом — один из самых весомых пунктов.", en: "Research and projects with a measurable outcome are one of the most heavily weighted items." } },
        { cat: "olympiads", level: "high", note: { ru: "Международные (не региональные) олимпиады заметно усиливают заявку.", en: "International (not regional) olympiads noticeably strengthen an application." } },
        { cat: "sport", level: "high", note: { ru: "Серьёзные спортивные достижения делают абитуриента заметно конкурентоспособнее.", en: "Serious sports achievements make an applicant noticeably more competitive." } },
        { cat: "volunteering", level: "medium", note: { ru: "Часть общей «истории» абитуриента, но не решает само по себе.", en: "Part of the applicant's overall “story”, but not decisive on its own." } }
      ]
    }
  };

  var PRIORITY_CATEGORY_LABELS = {
    exams: { ru: "Экзамены и академика", en: "Exams and academics" },
    research: { ru: "Исследования и проекты", en: "Research and projects" },
    olympiads: { ru: "Межд. олимпиады", en: "Int'l olympiads" },
    sport: { ru: "Спорт", en: "Sport" },
    volunteering: { ru: "Волонтёрство", en: "Volunteering" }
  };

  var PRIORITY_LEVEL_LABELS = {
    high: { ru: "Высокий", en: "High" },
    medium: { ru: "Средний", en: "Medium" },
    low: { ru: "Низкий", en: "Low" }
  };

  // ---------------------------------------------------------------------
  // Мини-профориентация — 5 вопросов, привязанных к специальностям.
  // ---------------------------------------------------------------------
  var CAREER_QUIZ = [
    { id: "q1", question: { ru: "Что тебе интереснее делать в свободное время?", en: "What do you enjoy doing most in your free time?" }, options: [
      { text: { ru: "Разбираться, как устроены сайты, приложения, игры", en: "Figuring out how websites, apps, and games work" }, major: "it" },
      { text: { ru: "Собирать, чинить технику, что-то конструировать", en: "Building, fixing gadgets, constructing things" }, major: "engineering" },
      { text: { ru: "Читать про биологию, здоровье, помогать с медпомощью", en: "Reading about biology and health, helping with first aid" }, major: "medicine" },
      { text: { ru: "Придумывать, как продать идею, вести переговоры", en: "Figuring out how to pitch an idea, negotiating" }, major: "business" },
      { text: { ru: "Следить за мировыми новостями, учить языки", en: "Following world news, learning languages" }, major: "intl_relations" },
      { text: { ru: "Рисовать, писать, снимать — создавать что-то своё", en: "Drawing, writing, filming — creating something of your own" }, major: "arts" }
    ] },
    { id: "q2", question: { ru: "Какой школьный предмет тебе даётся легче и интереснее всего?", en: "Which school subject comes easiest and feels most interesting to you?" }, options: [
      { text: { ru: "Информатика / программирование", en: "Computer science / programming" }, major: "it" },
      { text: { ru: "Физика / черчение / технология", en: "Physics / drafting / shop class" }, major: "engineering" },
      { text: { ru: "Биология / химия", en: "Biology / chemistry" }, major: "medicine" },
      { text: { ru: "Экономика / обществознание", en: "Economics / social studies" }, major: "business" },
      { text: { ru: "История / иностранные языки", en: "History / foreign languages" }, major: "intl_relations" },
      { text: { ru: "ИЗО / литература / музыка", en: "Art / literature / music" }, major: "arts" }
    ] },
    { id: "q3", question: { ru: "Какой командный проект тебе было бы интереснее делать?", en: "Which team project would you find more interesting to work on?" }, options: [
      { text: { ru: "Написать приложение или сайт", en: "Build an app or website" }, major: "it" },
      { text: { ru: "Спроектировать устройство или конструкцию", en: "Design a device or structure" }, major: "engineering" },
      { text: { ru: "Провести исследование о здоровье людей", en: "Run a study on people's health" }, major: "medicine" },
      { text: { ru: "Запустить свой мини-бизнес или стартап", en: "Launch a mini-business or startup" }, major: "business" },
      { text: { ru: "Организовать модель ООН или обмен", en: "Organize a Model UN or an exchange" }, major: "intl_relations" },
      { text: { ru: "Сделать выставку, фильм или книгу", en: "Put together an exhibition, film, or book" }, major: "arts" }
    ] },
    { id: "q4", question: { ru: "На какую профессию ты бы хотел(а) посмотреть изнутри?", en: "Which profession would you like to see from the inside?" }, options: [
      { text: { ru: "Разработчик / дата-сайентист", en: "Developer / data scientist" }, major: "it" },
      { text: { ru: "Инженер / архитектор", en: "Engineer / architect" }, major: "engineering" },
      { text: { ru: "Врач / учёный-биолог", en: "Doctor / biologist" }, major: "medicine" },
      { text: { ru: "Предприниматель / менеджер", en: "Entrepreneur / manager" }, major: "business" },
      { text: { ru: "Дипломат / сотрудник международной организации", en: "Diplomat / international organization staffer" }, major: "intl_relations" },
      { text: { ru: "Дизайнер / художник / писатель", en: "Designer / artist / writer" }, major: "arts" }
    ] },
    { id: "q5", question: { ru: "Что для тебя важнее всего в будущей профессии?", en: "What matters most to you in a future career?" }, options: [
      { text: { ru: "Создавать технологии, которые меняют мир", en: "Creating technology that changes the world" }, major: "it" },
      { text: { ru: "Строить и создавать что-то физическое и надёжное", en: "Building and creating something physical and reliable" }, major: "engineering" },
      { text: { ru: "Помогать людям и заботиться о здоровье", en: "Helping people and caring for their health" }, major: "medicine" },
      { text: { ru: "Свобода, доход и управление своим делом", en: "Freedom, income, and running your own thing" }, major: "business" },
      { text: { ru: "Работа с разными странами и культурами", en: "Working with different countries and cultures" }, major: "intl_relations" },
      { text: { ru: "Самовыражение и творчество", en: "Self-expression and creativity" }, major: "arts" }
    ] }
  ];

  global.Uniora = global.Uniora || {};
  global.Uniora.data = {
    DATA_NOTE: DATA_NOTE,
    MAJORS: MAJORS,
    COUNTRIES: COUNTRIES,
    UNIVERSITIES: UNIVERSITIES,
    EVENTS: EVENTS,
    ACHIEVEMENT_CATEGORIES: ACHIEVEMENT_CATEGORIES,
    CUSTOM_ACHIEVEMENT_CATEGORY: CUSTOM_ACHIEVEMENT_CATEGORY,
    SPORTS: SPORTS,
    SPORT_LEVELS: SPORT_LEVELS,
    VOLUNTEER_SPHERES: VOLUNTEER_SPHERES,
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
