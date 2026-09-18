/* Uniora — переключение языка RU/EN. Простая схема без фреймворков:
   выбор языка хранится в localStorage, при смене страница перезагружается —
   каждая страница и так строит DOM заново из данных при загрузке, поэтому
   перезагрузка — самый надёжный способ гарантированно перерисовать всё,
   включая вложенные структуры (аккордеоны, карточки, карту Roadmap).
   Переводы двух видов:
   - tf(field) — для полей данных вида {ru:"...", en:"..."} в data.js;
   - t("a.b.c") — для текстов интерфейса из словаря UI ниже. */
(function (global) {
  "use strict";

  var KEY = "uniora_lang_v1";
  var DEFAULT_LANG = "ru";

  function getLang() {
    try {
      var v = window.localStorage.getItem(KEY);
      return (v === "en" || v === "ru") ? v : DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function setLang(lang) {
    if (lang !== "ru" && lang !== "en") return;
    try { window.localStorage.setItem(KEY, lang); } catch (e) {}
    window.location.reload();
  }

  // Поле данных {ru,en} → строка на текущем языке. Простую строку или
  // null/undefined пропускает как есть — не всё в данных обязано быть
  // двуязычным (например, числа, id, ссылки).
  function tf(field) {
    if (field === null || field === undefined) return field;
    if (typeof field !== "object") return field;
    var lang = getLang();
    if (field[lang] !== undefined) return field[lang];
    if (field.ru !== undefined) return field.ru;
    return field;
  }

  // -----------------------------------------------------------------------
  // Словарь интерфейса. Ключи — по модулям (nav, common, home, profile,
  // diagnosis, recommendations, compare, roadmap, favorites, countryGuide).
  // -----------------------------------------------------------------------
  var UI = {
    nav: {
      favorites: { ru: "♥ Избранное", en: "♥ Favorites" },
      langButton: { ru: "EN", en: "RU" },
      langTitle: { ru: "Switch to English", en: "Переключить на русский" },
      steps: {
        profile: { ru: "Профиль", en: "Profile" },
        diagnosis: { ru: "Диагностика", en: "Diagnosis" },
        recommendations: { ru: "Рекомендации", en: "Recommendations" },
        compare: { ru: "Сравнение", en: "Compare" },
        roadmap: { ru: "Roadmap", en: "Roadmap" }
      }
    },
    common: {
      profileEmpty: { ru: "Профиль ещё не заполнен", en: "Profile not filled in yet" },
      fillProfile: { ru: "Заполнить профиль", en: "Fill in profile" },
      change: { ru: "Изменить", en: "Change" },
      allCountries: { ru: "Все страны", en: "All countries" },
      notSpecified: { ru: "Не указано", en: "Not specified" }
    },
    home: {
      title: { ru: "Uniora — персональный маршрут поступления", en: "Uniora — your personal admission roadmap" },
      heroTitle: { ru: "Твой новый день начинается здесь", en: "Your new day starts here" },
      heroSubtitle: {
        ru: "Uniora строит персональный маршрут поступления в зарубежный вуз — на основе твоего профиля, а не общего каталога. Честные рекомендации, понятные шаги, без вымышленных гарантий.",
        en: "Uniora builds a personal roadmap to studying abroad — based on your own profile, not a generic catalog. Honest recommendations, clear steps, no invented guarantees."
      },
      buildRoute: { ru: "Построить маршрут", en: "Build my roadmap" },
      previewSteps: {
        profile: { ru: "Профиль", en: "Profile" },
        diagnosis: { ru: "Диагностика", en: "Diagnosis" },
        recommendations: { ru: "Рекомендации", en: "Recommendations" },
        compare: { ru: "Сравнение", en: "Compare" },
        roadmap: { ru: "Roadmap", en: "Roadmap" }
      },
      howEyebrow: { ru: "Как это работает", en: "How it works" },
      howTitle: { ru: "Три шага от «не знаю, куда поступать» до маршрута с дедлайнами", en: "Three steps from “I don’t know where to apply” to a roadmap with deadlines" },
      how1Title: { ru: "Расскажи о себе", en: "Tell us about yourself" },
      how1Text: { ru: "Класс, специальность (или мини-квиз, если пока не знаешь), страны, экзамены и достижения — 6 коротких шагов.", en: "Grade, major (or a mini-quiz if you're not sure yet), countries, exams and achievements — 6 short steps." },
      how2Title: { ru: "Получи честную диагностику", en: "Get an honest diagnosis" },
      how2Text: { ru: "Портрет профиля человеческим языком: что уже сильно, где пробелы — без вымышленных процентов и баллов.", en: "A plain-language portrait of your profile: what's already strong, where the gaps are — no invented percentages or scores." },
      how3Title: { ru: "Иди по маршруту", en: "Follow your roadmap" },
      how3Text: { ru: "Рекомендации вузов с объяснением «почему», сравнение вариантов и Roadmap с дедлайнами и шагами.", en: "University recommendations with a “why”, side-by-side comparison, and a Roadmap with deadlines and steps." },
      examplesEyebrow: { ru: "Как это может выглядеть", en: "What it could look like" },
      examplesTitle: { ru: "Иллюстративные примеры маршрута", en: "Illustrative roadmap examples" },
      examplesSubtitle: { ru: "Условные сценарии для понимания логики продукта — не истории реальных людей и не гарантия такого же результата.", en: "Fictional scenarios to illustrate the product's logic — not real people's stories, and no guarantee of the same outcome." },
      exampleBadge: { ru: "Иллюстративный пример", en: "Illustrative example" },
      example1Title: { ru: "11 класс · IT · США + Венгрия", en: "Grade 11 · IT · USA + Hungary" },
      example1Steps: {
        ru: [
          "Диагностика: сильные оценки, но нет олимпиад и исследовательских проектов — для США это высокий приоритет.",
          "В Roadmap появляется цель «поучаствовать в NASA Space Apps Challenge» и пробел «начать исследовательский проект».",
          "Рекомендации: BME (Safety) и MIT (Reach) — сравниваются на странице «Сравнение».",
          "К дедлайну ранней подачи собран чек-лист документов и мотивационное письмо."
        ],
        en: [
          "Diagnosis: strong grades, but no olympiads or research projects — a high priority for the US.",
          "Roadmap adds the goal “take part in NASA Space Apps Challenge” and the gap “start a research project”.",
          "Recommendations: BME (Safety) and MIT (Reach) — compared on the “Compare” page.",
          "By the early-decision deadline, the document checklist and motivation letter are ready."
        ]
      },
      example2Title: { ru: "9–10 класс · Медицина · Турция", en: "Grade 9–10 · Medicine · Turkey" },
      example2Steps: {
        ru: [
          "Профиль показывает: для Турции вступительный экзамен (YÖS) — решающий фактор.",
          "Roadmap подсвечивает пробел по экзаменам и предлагает начать подготовку заранее — времени ещё много.",
          "Рекомендации: Hacettepe University (Match) — с честной пометкой об ограниченности данных по экзаменам.",
          "Есть время подтянуть профильные предметы или попробовать международную олимпиаду по химии/биологии."
        ],
        en: [
          "Profile shows: for Turkey, the entrance exam (YÖS) is the decisive factor.",
          "Roadmap highlights the exam gap and suggests starting prep early — there's still plenty of time.",
          "Recommendations: Hacettepe University (Match) — with an honest note about limited exam data.",
          "There's time to strengthen core subjects or try an international chemistry/biology olympiad."
        ]
      },
      example3Title: { ru: "Выпускник(-ца) · Искусство · Италия", en: "Graduate · Arts · Italy" },
      example3Steps: {
        ru: [
          "В анкете указано портфолио творческих работ — в диагностике это сразу «сильная сторона».",
          "Рекомендации: Politecnico di Milano (Match) и University of Bologna (Safety).",
          "В Roadmap — задача пополнить портфолио и чек-лист документов к подаче (дедлайны — данные прошлого цикла, сверяются на сайте)."
        ],
        en: [
          "The profile includes a portfolio of creative work — diagnosis flags this as a “strength” right away.",
          "Recommendations: Politecnico di Milano (Match) and University of Bologna (Safety).",
          "Roadmap adds a task to grow the portfolio and a document checklist for submission (deadlines are from last cycle — verify on the website)."
        ]
      },
      trustTitle: { ru: "Честно про методику", en: "Being upfront about our methodology" },
      trustText: {
        ru: "Категории «Match / Reach / Safety» и приоритеты портфолио по странам — собственная качественная эвристика команды Uniora, а не официальная статистика вузов. Стоимость обучения нигде не используется как фильтр. Дедлайны — данные прошлого цикла подачи, всегда проверяйте актуальные даты на сайте вуза.",
        en: "The “Match / Reach / Safety” categories and country-by-country portfolio priorities are Uniora's own qualitative heuristic, not official university statistics. Tuition cost is never used as a filter anywhere. Deadlines are from the last application cycle — always verify current dates on the university's website."
      },
      footer: { ru: "Uniora — демо-проект для LOCUS Startup Hackathon 2026. Данные учебные, не являются официальной статистикой вузов.", en: "Uniora — a demo project for the LOCUS Startup Hackathon 2026. Data is for demonstration only and is not official university statistics." }
    },
    profile: {
      title: { ru: "Профиль — Uniora", en: "Profile — Uniora" },
      stepLabel: { ru: "Шаг", en: "Step" },
      sidebarStep1: { ru: "Этап обучения", en: "Education stage" },
      sidebarStep2: { ru: "Специальность", en: "Major" },
      sidebarStep3: { ru: "Страны", en: "Countries" },
      sidebarStep4: { ru: "Достижения", en: "Achievements" },
      sidebarStep5: { ru: "Экзамены", en: "Exams" },
      sidebarStep6: { ru: "Проверка", en: "Review" },
      sidebarDone: { ru: "Готово", en: "Done" },
      of: { ru: "из", en: "of" },
      back: { ru: "Назад", en: "Back" },
      toHome: { ru: "На главную", en: "To home" },
      next: { ru: "Далее", en: "Next" },
      done: { ru: "Готово", en: "Done" },
      step1Eyebrow: { ru: "Шаг 1 из 6", en: "Step 1 of 6" },
      step1Title: { ru: "На каком ты сейчас этапе?", en: "Where are you right now?" },
      step1Subtitle: { ru: "Это поможет понять, сколько времени есть на подготовку.", en: "This helps us understand how much time you have to prepare." },
      grade9_10: { ru: "9–10 класс", en: "Grade 9–10" },
      grade11: { ru: "11 класс", en: "Grade 11" },
      graduated: { ru: "Уже закончил(а) школу", en: "Already graduated school" },
      transfer: { ru: "Хочу перевестись", en: "Want to transfer" },
      step2Eyebrow: { ru: "Шаг 2 из 6", en: "Step 2 of 6" },
      step2Title: { ru: "Какое направление тебе ближе?", en: "Which field is closer to you?" },
      step2Subtitle: { ru: "Не уверен(а)? Пройди мини-квиз из 5 вопросов — это подсказка, а не окончательное решение.", en: "Not sure? Take a 5-question mini-quiz — it's a hint, not a final decision." },
      majorsHint: { ru: "Можно выбрать несколько — мы уточним приоритеты позже.", en: "You can pick several — we'll refine priorities later." },
      dontKnowQuiz: { ru: "❓ Ещё не знаю — пройти мини-квиз", en: "❓ Not sure yet — take the mini-quiz" },
      quizQuestionOf: { ru: "Вопрос", en: "Question" },
      quizOf: { ru: "из", en: "of" },
      backToMajors: { ru: "← Вернуться к списку специальностей", en: "← Back to the list of majors" },
      quizResultTitle: { ru: "Похоже, это направление:", en: "This looks like the right fit:" },
      quizResultText: { ru: "Судя по ответам («{answers}»…), это направление ближе всего — подсказка, а не итоговое решение.", en: "Based on your answers (“{answers}”…), this field looks closest — a hint, not a final decision." },
      quizAdd: { ru: "Добавить «{major}»", en: "Add “{major}”" },
      quizManual: { ru: "Выбрать вручную", en: "Choose manually" },
      quizRetry: { ru: "Пройти заново", en: "Retake the quiz" },
      step3Eyebrow: { ru: "Шаг 3 из 6", en: "Step 3 of 6" },
      step3Title: { ru: "В какие страны рассматриваешь поступление?", en: "Which countries are you considering?" },
      step3Subtitle: { ru: "Можно выбрать несколько — рекомендации пересчитаются под них.", en: "You can pick several — recommendations will recalculate for them." },
      showAllCountries: { ru: "Показать вузы по всем странам", en: "Show universities from all countries" },
      compareCountries: { ru: "Ещё не решили? Сравнить страны →", en: "Not sure yet? Compare countries →" },
      step4Eyebrow: { ru: "Шаг 4 из 6", en: "Step 4 of 6" },
      step4Title: { ru: "Расскажи о своих достижениях", en: "Tell us about your achievements" },
      step4Subtitle: { ru: "Это усилит эссе и поможет подобрать вузы с грантами для сильных абитуриентов. Всё опционально.", en: "This strengthens your essay and helps match you with universities that offer grants for strong applicants. Everything is optional." },
      notSpecified: { ru: "Не указано", en: "Not specified" },
      recordsCount: { ru: "запис(ей)", en: "record(s)" },
      addRecord: { ru: "+ Добавить запись", en: "+ Add entry" },
      delete: { ru: "Удалить", en: "Delete" },
      additional: { ru: "Дополнительно", en: "Additional" },
      sportTypes: { ru: "Виды спорта", en: "Types of sport" },
      sportLevel: { ru: "Уровень достижения", en: "Achievement level" },
      sportKindsCount: { ru: "вид(а)", en: "kind(s)" },
      notChosen: { ru: "Не выбрано", en: "Not chosen" },
      volunteerPlaceTitle: { ru: "Место волонтёрства", en: "Volunteering place" },
      volunteerPlacePlaceholder: { ru: "Где — например, «Приют для животных «Дружок»»", en: "Where — e.g. “Dogpatch animal shelter”" },
      volunteerSphere: { ru: "Сфера", en: "Field" },
      volunteerHours: { ru: "Часов (необязательно)", en: "Hours (optional)" },
      volunteerResult: { ru: "Результат / что делал(а) (необязательно)", en: "Result / what you did (optional)" },
      noEntriesYet: { ru: "Пока не добавлено ни одного пункта.", en: "No entries added yet." },
      step5Eyebrow: { ru: "Шаг 5 из 6", en: "Step 5 of 6" },
      step5Title: { ru: "Отметь свои баллы", en: "Enter your scores" },
      step5Subtitle: { ru: "Двигай ползунки — мы сразу покажем, для каких вузов этого достаточно, а где стоит подтянуться. Если экзамен ещё не сдавал(а) — просто отметь тумблер, он не будет учтён как 0.", en: "Move the sliders — we'll immediately show which universities this is enough for, and where you should improve. If you haven't taken an exam yet, just toggle the switch — it won't be counted as a 0." },
      notTaken: { ru: "Не сдавал(а)", en: "Not taken" },
      notTakenYet: { ru: "Ещё не сдавал(а)", en: "Not taken yet" },
      maximum: { ru: "Максимум:", en: "Maximum:" },
      ieltsLabel: { ru: "IELTS Academic", en: "IELTS Academic" },
      ieltsInfo: { ru: "Международный экзамен по английскому языку.", en: "An international English-language proficiency exam." },
      toeflLabel: { ru: "TOEFL iBT", en: "TOEFL iBT" },
      toeflInfo: { ru: "Альтернатива IELTS — тоже международный экзамен по английскому языку, шкала другая.", en: "An alternative to IELTS — also an international English exam, with a different scale." },
      satLabel: { ru: "SAT", en: "SAT" },
      satInfo: { ru: "Стандартизированный тест для поступления в вузы США (и ряда других стран).", en: "A standardized test for admission to US universities (and several other countries)." },
      gpaLabel: { ru: "Средний балл аттестата (GPA)", en: "High school GPA" },
      gpaInfo: { ru: "Средний балл школьного аттестата по 5-балльной шкале.", en: "Your school GPA on a 5-point scale." },
      gpaExtraNote: { ru: "Это ориентир, а не универсальный стандарт — разные вузы переводят GPA по-разному.", en: "This is a reference point, not a universal standard — different universities convert GPA differently." },
      step6Eyebrow: { ru: "Шаг 6 из 6", en: "Step 6 of 6" },
      step6Title: { ru: "Проверь и подтверди", en: "Review and confirm" },
      step6Subtitle: { ru: "Клик по любому пункту — сразу к нужному шагу.", en: "Click any item to jump straight to that step." },
      gradeLevelTitle: { ru: "Этап обучения", en: "Education stage" },
      majorTitle: { ru: "Специальность", en: "Major" },
      byQuiz: { ru: "(по квизу)", en: "(from quiz)" },
      countriesTitle: { ru: "Страны", en: "Countries" },
      achievementsTitle: { ru: "Достижения", en: "Achievements" },
      examsTitle: { ru: "Экзамены", en: "Exams" },
      examsTaken: { ru: "из {total} сдано", en: "of {total} taken" }
    },
    diagnosis: {
      title: { ru: "Диагностика — Uniora", en: "Diagnosis — Uniora" },
      empty: {
        title: { ru: "Пока рано ставить диагноз", en: "It's too early for a diagnosis" },
        text: { ru: "Укажите в профиле хотя бы одну специальность и страну — тогда диагностика станет осмысленной.", en: "Add at least one major and country in your profile — then the diagnosis will be meaningful." }
      },
      eyebrow: { ru: "Диагностика профиля", en: "Profile diagnosis" },
      title2: { ru: "Твой портрет абитуриента", en: "Your applicant portrait" },
      subtitle: { ru: "Специальность: {majors} · Страны: {countries}", en: "Major: {majors} · Countries: {countries}" },
      allCountries: { ru: "все страны", en: "all countries" },
      constellationTitle: { ru: "Созвездие твоих сильных и слабых сторон", en: "Your constellation of strengths and gaps" },
      noData: { ru: "нет данных", en: "no data" },
      strengths: { ru: "Сильные стороны", en: "Strengths" },
      strengthsEmpty: { ru: "Пока ничего не набрало высокий балл — самое время начать с малого.", en: "Nothing has scored high yet — a great time to start small." },
      weaknesses: { ru: "Точки роста", en: "Areas to grow" },
      weaknessesEmpty: { ru: "Явных слабых мест не видно — можно усиливать профиль сверх минимума.", en: "No clear weak spots — you can strengthen your profile beyond the minimum." },
      focusTitle: { ru: "Рекомендованный фокус на этой неделе", en: "Recommended focus this week" },
      focusFallback: { ru: "Загляните в раздел с наибольшим пробелом и продвиньтесь на один шаг.", en: "Check the section with the biggest gap and take one step forward." },
      focusEnglish: { ru: "Подтяните английский — добавьте актуальный балл IELTS или TOEFL в анкете, если сдавали, или запишитесь на подготовку.", en: "Work on your English — add a current IELTS or TOEFL score in your profile if you've taken one, or sign up for prep." },
      focusSat: { ru: "Добавьте балл SAT в анкете, если сдавали — он напрямую участвует в подборе вузов США.", en: "Add your SAT score in your profile if you've taken it — it directly affects matching with US universities." },
      focusAcademic: { ru: "Укажите средний балл аттестата (GPA) в анкете — это часть общей академической картины.", en: "Add your GPA in your profile — it's part of the overall academic picture." },
      focusDocuments: { ru: "Продвиньтесь по чек-листу документов на странице Roadmap — это ближайший конкретный шаг.", en: "Make progress on the document checklist on the Roadmap page — that's the nearest concrete step." },
      footerNote: { ru: "Обновлено только что · на основе {count} из {total} экзаменов и заполненности достижений/документов. Это качественная оценка Uniora, не официальный балл и не гарантия результата поступления.", en: "Updated just now · based on {count} of {total} exams and how complete your achievements/documents are. This is Uniora's qualitative assessment, not an official score or a guarantee of admission." },
      englishLabel: { ru: "Английский язык (IELTS/TOEFL)", en: "English (IELTS/TOEFL)" },
      satLabel: { ru: "SAT", en: "SAT" },
      academicLabel: { ru: "Академическая успеваемость (GPA)", en: "Academic performance (GPA)" },
      documentsLabel: { ru: "Документы", en: "Documents" },
      fillProfile: { ru: "Дополнить профиль", en: "Complete profile" },
      viewRecommendations: { ru: "Смотреть рекомендации", en: "View recommendations" }
    },
    recommendations: {
      title: { ru: "Рекомендации — Uniora", en: "Recommendations — Uniora" },
      eyebrow: { ru: "Рекомендации", en: "Recommendations" },
      heading: { ru: "Вузы, подобранные под ваш профиль", en: "Universities matched to your profile" },
      subheading: { ru: "Категории Match / Reach / Safety — эвристика Uniora на основе ваших данных, не гарантия поступления.", en: "The Match / Reach / Safety categories are a Uniora heuristic based on your data, not a guarantee of admission." },
      allCountriesChip: { ru: "🌍 Все страны", en: "🌍 All countries" },
      changeExams: { ru: "Изменить экзамены", en: "Change exams" },
      whatIfTitle: { ru: "Симулятор «Что если» — подвинь баллы IELTS/TOEFL/SAT", en: "“What if” simulator — move your IELTS/TOEFL/SAT scores" },
      whatIfSubtitle: { ru: "Не сохраняет значения в профиль — только показывает, как изменились бы категории вузов в вашей подборке.", en: "Doesn't save values to your profile — just shows how the categories of universities in your shortlist would change." },
      whatIfNoUnis: { ru: "Пока нет подобранных вузов для сравнения — уточните фильтры выше.", en: "No matched universities to compare yet — adjust the filters above." },
      whatIfNoChange: { ru: "При этом значении категории вузов в вашей подборке не меняются.", en: "At this value, none of the universities in your shortlist change category." },
      whatIfDisclaimer: { ru: "Это предварительный пересчёт по нашей собственной логике подбора, а не гарантия результата поступления.", en: "This is a preliminary recalculation using our own matching logic, not a guarantee of admission." },
      moveTo: { ru: "переходит", en: "moves" },
      moveToPlural: { ru: "переходят", en: "move" },
      uniFrom: { ru: "из", en: "from" },
      uniTo: { ru: "в", en: "to" },
      uniWord: { one: { ru: "вуз", en: "university" }, few: { ru: "вуза", en: "universities" }, many: { ru: "вузов", en: "universities" } },
      emptyMajorTitle: { ru: "Сначала выберите специальность", en: "First, choose a major" },
      emptyMajorText: { ru: "Рекомендации строятся от специальности и страны — вернитесь в профиль, чтобы их указать.", en: "Recommendations are built from your major and country — go back to your profile to set them." },
      toProfile: { ru: "К профилю", en: "To profile" },
      emptyCountryTitle: { ru: "Выберите хотя бы одну страну", en: "Choose at least one country" },
      emptyCountryText: { ru: "Или включите «Все страны» в фильтрах выше, чтобы увидеть вузы без ограничения по стране.", en: "Or turn on “All countries” in the filters above to see universities with no country restriction." },
      noMatchesTitle: { ru: "Пока нет точных совпадений", en: "No exact matches yet" },
      noMatchesText: { ru: "Попробуйте изменить страну или специальность в фильтрах выше.", en: "Try changing the country or major in the filters above." },
      changeCountries: { ru: "Изменить страны", en: "Change countries" },
      changeMajor: { ru: "Изменить специальность", en: "Change major" },
      minimalProfileBanner: { ru: "Профиль заполнен по минимуму — с экзаменами и достижениями объяснения «почему подходит» станут заметно точнее.", en: "Your profile is filled in minimally — adding exams and achievements will make the “why this fits” explanations noticeably more accurate." },
      completeProfile: { ru: "Дополнить профиль", en: "Complete profile" },
      mapTitle: { ru: "Твоя карта вузов", en: "Your university map" },
      categoryHintMatch: { ru: "Реалистичные варианты: ваши данные близки к требованиям вуза.", en: "Realistic options: your data is close to the university's requirements." },
      categoryHintReach: { ru: "Амбициозные варианты: конкурс высокий или порог пока не достигнут.", en: "Ambitious options: high competition, or the threshold isn't reached yet." },
      categoryHintSafety: { ru: "Более доступные варианты: высокий приём и запас по вашим данным.", en: "More accessible options: high acceptance and headroom in your data." },
      noneInCategory: { ru: "Нет вузов в категории {cat} среди выбранных стран — попробуйте добавить ещё одну страну.", en: "No universities in the {cat} category among the selected countries — try adding another country." },
      toDiagnosis: { ru: "← К диагностике", en: "← To diagnosis" },
      toCompare: { ru: "Перейти к сравнению", en: "Go to compare" },
      target: { ru: "🎯 Цель", en: "🎯 Target" },
      early: { ru: "Ранняя:", en: "Early:" },
      main: { ru: "Основная:", en: "Main:" },
      ranking: { ru: "Рейтинг: #{country} в стране, #{world} в мире", en: "Ranking: #{country} in country, #{world} worldwide" },
      scholarship: { ru: "Стипендия:", en: "Scholarship:" },
      dormitory: { ru: "Общежитие:", en: "Dormitory:" },
      inCompareYes: { ru: "В сравнении ✓", en: "In compare ✓" },
      inCompareNo: { ru: "В сравнение", en: "Compare" },
      compareMax: { ru: "Можно сравнить максимум 3 вуза — уберите один, чтобы добавить другой.", en: "You can compare up to 3 universities — remove one to add another." },
      addedToCompare: { ru: "Добавлено в сравнение", en: "Added to compare" },
      removedFromCompare: { ru: "Убрано из сравнения", en: "Removed from compare" },
      removeFromFavorites: { ru: "♥ Убрать из избранного", en: "♥ Remove from favorites" },
      removedFromFavorites: { ru: "Убрано из избранного", en: "Removed from favorites" },
      addToFavorites: { ru: "В избранное", en: "Add to favorites" },
      site: { ru: "Сайт", en: "Website" },
      makeTarget: { ru: "Сделать целью", en: "Make target" },
      targetRemoved: { ru: "Цель снята", en: "Target removed" },
      targetSet: { ru: "Roadmap теперь ведёт к этому вузу", en: "Roadmap now leads to this university" },
      majorMatchFact: { ru: "Специальность «{majors}» и страна {country} совпадают с вашим выбором в анкете.", en: "The major “{majors}” and country {country} match your profile selections." },
      uniOffersFact: { ru: "Вуз предлагает: {majors} · {country}.", en: "The university offers: {majors} · {country}." },
      majorMismatchFact: { ru: "Это не совпадает с выбранными в анкете специальностями — оценка показана справочно.", en: "This doesn't match the majors selected in your profile — shown for reference only." },
      countryMismatchFact: { ru: "Эта страна сейчас не выбрана в анкете — оценка показана справочно.", en: "This country isn't currently selected in your profile — shown for reference only." },
      examAboveFact: { ru: "{exam} {user} у вас против минимума {required} у вуза — порог пройден с запасом.", en: "{exam} {user} for you vs. a minimum of {required} at the university — comfortably above the threshold." },
      examBelowFact: { ru: "{exam} {user} у вас против минимума {required} у вуза — пока ниже порога, есть время подтянуть.", en: "{exam} {user} for you vs. a minimum of {required} at the university — currently below the threshold, there's time to improve." },
      examGapFact: { ru: "Вуз указывает порог по «{exam}» (от {required}), но в анкете нет данных — добавьте балл для более точной картины.", en: "The university states a threshold for “{exam}” (from {required}), but there's no data in your profile — add a score for a more accurate picture." },
      acceptanceRateFact: { ru: "Вуз принимает ориентировочно {rate}% абитуриентов.", en: "The university admits roughly {rate}% of applicants." }
    },
    compare: {
      title: { ru: "Сравнение — Uniora", en: "Compare — Uniora" },
      eyebrow: { ru: "Сравнение", en: "Compare" },
      heading: { ru: "До 3 вузов рядом", en: "Up to 3 universities side by side" },
      subheading: { ru: "Проходимость и совпадение с профилем — эвристика Uniora, не официальная статистика. Стоимость обучения нигде не используется как критерий подбора.", en: "Acceptance rate and profile match are a Uniora heuristic, not official statistics. Tuition cost is never used as a matching criterion." },
      emptyTitle: { ru: "Пока нечего сравнивать", en: "Nothing to compare yet" },
      emptyText: { ru: "Добавьте вузы в сравнение на странице рекомендаций — кнопкой «В сравнение» на карточке.", en: "Add universities to compare from the recommendations page — with the “Compare” button on a card." },
      toRecommendations: { ru: "К рекомендациям", en: "To recommendations" },
      addOneMore: { ru: "Добавьте ещё хотя бы один вуз, чтобы увидеть сравнение рядом.", en: "Add at least one more university to see a side-by-side comparison." },
      addAnother: { ru: "Добавить ещё вуз", en: "Add another university" },
      parameter: { ru: "Параметр", en: "Parameter" },
      cityCountry: { ru: "Город / страна", en: "City / country" },
      program: { ru: "Программа", en: "Program" },
      acceptanceRate: { ru: "Проходимость", en: "Acceptance rate" },
      profileMatch: { ru: "Совпадение с профилем", en: "Match with your profile" },
      deadlineEarly: { ru: "Дедлайн ранний", en: "Early deadline" },
      deadlineMain: { ru: "Дедлайн основной", en: "Main deadline" },
      noSeparateRound: { ru: "Нет отдельного раунда", en: "No separate round" },
      reqIelts: { ru: "Требование IELTS", en: "IELTS requirement" },
      reqToefl: { ru: "Требование TOEFL", en: "TOEFL requirement" },
      reqSat: { ru: "Требование SAT", en: "SAT requirement" },
      notPublished: { ru: "Не требуется", en: "Not required" },
      scholarship: { ru: "Стипендия", en: "Scholarship" },
      noData: { ru: "Нет данных", en: "No data" },
      dormitory: { ru: "Общежитие", en: "Dormitory" },
      ranking: { ru: "Рейтинг", en: "Ranking" },
      rankingValue: { ru: "#{country} в стране / #{world} в мире", en: "#{country} in country / #{world} worldwide" },
      essay: { ru: "Эссе", en: "Essay" },
      required: { ru: "Требуется", en: "Required" },
      notRequired: { ru: "Не требуется", en: "Not required" },
      recommendationLetters: { ru: "Рекомендательные письма", en: "Recommendation letters" },
      website: { ru: "Сайт", en: "Website" },
      openSite: { ru: "Открыть сайт →", en: "Open website →" },
      openSiteShort: { ru: "Сайт →", en: "Website →" },
      remove: { ru: "Убрать", en: "Remove" },
      makeTarget: { ru: "Сделать целью", en: "Make target" },
      isTarget: { ru: "🎯 Цель", en: "🎯 Target" },
      targetRemoved: { ru: "Цель снята", en: "Target removed" },
      targetSet: { ru: "Эта цель теперь ведёт ваш Roadmap", en: "This target now drives your Roadmap" },
      toRecommendationsBack: { ru: "← К рекомендациям", en: "← To recommendations" },
      toRoadmap: { ru: "Перейти к Roadmap", en: "Go to Roadmap" }
    },
    roadmap: {
      title: { ru: "Roadmap — Uniora", en: "Roadmap — Uniora" },
      emptyTitle: { ru: "Маршрут строится из профиля", en: "The roadmap is built from your profile" },
      emptyText: { ru: "Укажите специальность и страну в профиле — тогда появится карта шагов.", en: "Add your major and country in your profile — then the step map will appear." },
      emptyTargetTitle: { ru: "Выберите целевой вуз", en: "Choose a target university" },
      emptyTargetText: { ru: "Маршрут строится вокруг одной цели. Отметьте вуз «Сделать целью» на странице «Сравнение» или «Избранное».", en: "The roadmap is built around one target. Mark a university “Make target” on the Compare or Favorites page." },
      heading: { ru: "Твой путь к цели", en: "Your path to the goal" },
      subtitle: { ru: "{uni} · {majors} · 9 шагов от анкеты до зачисления", en: "{uni} · {majors} · 9 steps from your profile to enrollment" },
      downloadPlan: { ru: "🖨 Скачать план", en: "🖨 Download plan" },
      readMap: { ru: "✦ Как читать карту", en: "✦ How to read the map" },
      legendWaiting: { ru: "Ожидает", en: "Waiting" },
      legendHere: { ru: "Вы здесь — ближайший шаг", en: "You are here — next step" },
      legendDone: { ru: "Выполнено", en: "Done" },
      legendUrgent: { ru: "Дедлайн скоро (≤30 дней)", en: "Deadline soon (≤30 days)" },
      legendAnketa: { ru: "📝 анкета", en: "📝 profile" },
      legendExams: { ru: "🗣️📚 экзамены", en: "🗣️📚 exams" },
      legendDocs: { ru: "📄✍️ документы", en: "📄✍️ documents" },
      legendSubmission: { ru: "📮 подача", en: "📮 submission" },
      legendInterview: { ru: "🎥 собеседование", en: "🎥 interview" },
      legendVisa: { ru: "🛂 виза", en: "🛂 visa" },
      legendGoal: { ru: "🎓 цель", en: "🎓 goal" },
      legendFooter: { ru: "Подписи и даты на карте показаны только у 2–3 ближайших шагов — остальные звёзды остаются точками, чтобы карта оставалась читаемой.", en: "Labels and dates on the map are shown only for the 2–3 nearest steps — the rest stay as plain dots so the map stays readable." },
      effortTitle: { ru: "На что направить усилия", en: "Where to focus your effort" },
      effortSubtitle: { ru: "Экспертная оценка команды Uniora: насколько активность обычно усиливает заявку.", en: "The Uniora team's expert assessment of how much each activity typically strengthens an application." },
      effortHigh: { ru: "Высокое", en: "High" },
      effortMedium: { ru: "Среднее", en: "Medium" },
      effortItems: {
        ru: [
          { title: "Публикация / research с научным руководителем", note: "Сильнее всего выделяет профиль на конкурентных зарубежных программах.", level: "high" },
          { title: "Запущенный проект (продукт, стартап, open-source)", note: "Показывает инициативу и практическое применение навыков.", level: "high" },
          { title: "Профильная олимпиада (международный/республиканский уровень)", note: "Особенно ценится для STEM-направлений.", level: "high", qualifier: "особенно для STEM-специальностей" },
          { title: "Хакатоны и кейс-чемпионаты", note: "Хорошо показывает командную работу и прикладные навыки.", level: "medium" },
          { title: "Волонтёрство и социальные инициативы", note: "Важно для liberal arts и holistic-admission вузов.", level: "medium", qualifier: "зависит от типа вуза и направления" },
          { title: "Стажировка", note: "Особенно ценна для бизнес- и инженерных направлений.", level: "medium", qualifier: "зависит от направления" }
        ],
        en: [
          { title: "A publication / research with an academic advisor", note: "Stands out the most in competitive international applications.", level: "high" },
          { title: "A shipped project (product, startup, open-source)", note: "Shows initiative and practical application of skills.", level: "high" },
          { title: "A subject olympiad (international/national level)", note: "Especially valued for STEM fields.", level: "high", qualifier: "especially for STEM majors" },
          { title: "Hackathons and case competitions", note: "Shows teamwork and applied skills well.", level: "medium" },
          { title: "Volunteering and social initiatives", note: "Important for liberal arts and holistic-admission universities.", level: "medium", qualifier: "depends on the type of university and major" },
          { title: "An internship", note: "Especially valuable for business and engineering majors.", level: "medium", qualifier: "depends on the major" }
        ]
      },
      effortDisclaimer: { ru: "Это наша собственная оценка, основанная на изучении требований вузов, а не официальная статистика или гарантия результата.", en: "This is our own assessment, based on studying university requirements — not official statistics or a guarantee of the outcome." },
      constellationTab: { ru: "✦ Созвездие", en: "✦ Constellation" },
      listTab: { ru: "☰ Список", en: "☰ List" },
      routeCompleteEyebrow: { ru: "Маршрут пройден 🎓", en: "Roadmap complete 🎓" },
      routeCompleteTitle: { ru: "Все шаги к этой цели выполнены", en: "All steps toward this goal are complete" },
      routeCompleteText: { ru: "Отличная работа! Можно выбрать вторую цель для сравнения (в «Сравнении») и повторить путь параллельно.", en: "Great job! You can pick a second target to compare (on the Compare page) and follow a parallel path." },
      nextStepEyebrow: { ru: "Следующий шаг", en: "Next step" },
      nextStepFallback: { ru: "Отметьте выполненным, когда сделаете.", en: "Mark it as done once you've completed it." },
      markDone: { ru: "Отметить выполненным", en: "Mark as done" },
      returnToWork: { ru: "Вернуть в работу", en: "Return to in-progress" },
      upcomingDeadlines: { ru: "Ближайшие дедлайны", en: "Upcoming deadlines" },
      until: { ru: "до", en: "by" },
      documentsForApplication: { ru: "Документы на подачу — {uni}", en: "Documents for submission — {uni}" },
      readyToSubmit: { ru: "{done} / {total} готово к подаче", en: "{done} / {total} ready to submit" },
      docNotStarted: { ru: "Не начато", en: "Not started" },
      docInProgress: { ru: "В процессе", en: "In progress" },
      docDone: { ru: "Готово", en: "Done" },
      eventsForMajor: { ru: "Мероприятия для твоей специальности", en: "Events for your major" },
      limitation: { ru: "Ограничение:", en: "Limitation:" },
      site: { ru: "Сайт", en: "Website" },
      toCompareBack: { ru: "← К сравнению", en: "← To compare" },
      toDiagnosis: { ru: "К диагностике", en: "To diagnosis" },
      journeyAnketaTitle: { ru: "Анкета заполнена", en: "Profile filled in" },
      journeyAnketaDesc: { ru: "Специальность и страна указаны в профиле.", en: "Major and country are set in your profile." },
      journeyAnketaShort: { ru: "Анкета", en: "Profile" },
      journeyEnglishShort: { ru: "IELTS", en: "IELTS" },
      journeyEnglishTitleWithScore: { ru: "Английский язык — IELTS от {score}", en: "English — IELTS from {score}" },
      journeyEnglishTitle: { ru: "Английский язык — IELTS", en: "English — IELTS" },
      journeyEnglishDescWithScore: { ru: "Добавьте актуальный балл IELTS в анкете (шаг 5).", en: "Add your current IELTS score in your profile (step 5)." },
      journeyEnglishDesc: { ru: "У этого вуза нет числового порога IELTS в источнике — добавьте балл в анкете на всякий случай, но ориентируйтесь на сайт вуза.", en: "This university has no numeric IELTS threshold in the source — add your score in your profile just in case, but check the university's website." },
      journeyOtherExamsShort: { ru: "TOEFL/SAT", en: "TOEFL/SAT" },
      journeyOtherExamsTitle: { ru: "TOEFL / SAT", en: "TOEFL / SAT" },
      journeyOtherExamsDescNeed: { ru: "Нужны: {list}.", en: "Needed: {list}." },
      journeyOtherExamsDescNone: { ru: "У этого вуза нет отдельных числовых порогов по TOEFL/SAT в источнике.", en: "This university has no separate numeric TOEFL/SAT thresholds in the source." },
      journeyDocumentsShort: { ru: "Документы", en: "Documents" },
      journeyDocumentsTitle: { ru: "Сбор документов", en: "Gathering documents" },
      journeyDocumentsDesc: { ru: "Транскрипт, рекомендательные письма и языковой сертификат — готовы (см. чек-лист ниже).", en: "Transcript, recommendation letters, and a language certificate are ready (see the checklist below)." },
      journeyMotivationShort: { ru: "Письмо", en: "Letter" },
      journeyMotivationTitle: { ru: "Мотивационное письмо", en: "Motivation letter" },
      journeyMotivationDesc: { ru: "Отметьте как готовое в чек-листе документов ниже.", en: "Mark it as done in the document checklist below." },
      journeySubmissionShort: { ru: "Подача", en: "Submission" },
      journeySubmissionTitle: { ru: "Подача заявки", en: "Application submission" },
      journeyDeadlineText: { ru: "Дедлайн подачи: {deadline}.", en: "Submission deadline: {deadline}." },
      journeyDeadlineUnknown: { ru: "Точный дедлайн подачи не собран в источнике для этой программы — уточните на официальном сайте вуза.", en: "The exact submission deadline isn't in the source for this program — check the university's official website." },
      journeyInterviewShort: { ru: "Собеседование", en: "Interview" },
      journeyInterviewTitle: { ru: "Собеседование", en: "Interview" },
      journeyInterviewDesc: { ru: "Если вуз проводит собеседование — обычно вскоре после подачи заявки.", en: "If the university holds interviews — usually shortly after you submit your application." },
      journeyVisaShort: { ru: "Виза", en: "Visa" },
      journeyVisaTitle: { ru: "Виза и разрешение на учёбу", en: "Visa and study permit" },
      journeyVisaDesc: { ru: "Начинайте оформление сразу после письма о зачислении от вуза.", en: "Start the process right after you get your admission letter from the university." },
      journeyEnrollmentShort: { ru: "Зачисление", en: "Enrollment" },
      journeyEnrollmentTitle: { ru: "Зачисление", en: "Enrollment" },
      journeyEnrollmentDesc: { ru: "Ваша цель — {uni}.", en: "Your goal — {uni}." },
      addGoalButton: { ru: "+ Добавить свою цель", en: "+ Add your own goal" },
      addGoalTitle: { ru: "Своя цель", en: "Custom goal" },
      addGoalTitlePlaceholder: { ru: "Название цели, например «Собеседование с ментором»", en: "Goal name, e.g. “Interview with a mentor”" },
      addGoalDeadlineLabel: { ru: "Дедлайн (необязательно)", en: "Deadline (optional)" },
      addGoalDescPlaceholder: { ru: "Короткое описание (необязательно)", en: "Short description (optional)" },
      addGoalSubmit: { ru: "Добавить", en: "Add" },
      addGoalCancel: { ru: "Отмена", en: "Cancel" },
      addGoalNeedsTitle: { ru: "Укажите название цели", en: "Enter a goal name" },
      customGoalIcon: { ru: "⭐", en: "⭐" },
      printTitle: { ru: "План поступления — Uniora", en: "Admission plan — Uniora" },
      printGeneratedOn: { ru: "Сформировано {date}. Личный план, не официальный документ и не гарантия поступления — сроки и требования вуза могут измениться, сверяйтесь с официальным сайтом приёмной комиссии.", en: "Generated on {date}. A personal plan, not an official document and not a guarantee of admission — deadlines and requirements may change, verify with the university's official admissions office." },
      printOverview: { ru: "Обзор", en: "Overview" },
      printUniversity: { ru: "Университет:", en: "University:" },
      printCountry: { ru: "Страна:", en: "Country:" },
      printDeadline: { ru: "Дедлайн подачи:", en: "Submission deadline:" },
      printScholarship: { ru: "Стипендия:", en: "Scholarship:" },
      printSteps: { ru: "Шаги маршрута", en: "Roadmap steps" },
      printDocuments: { ru: "Документы на подачу", en: "Documents for submission" }
    },
    favorites: {
      title: { ru: "Избранное — Uniora", en: "Favorites — Uniora" },
      eyebrow: { ru: "Избранное", en: "Favorites" },
      heading: { ru: "Сохранённые вузы", en: "Saved universities" },
      subheading: { ru: "Оценка «почему подходит» пересчитывается по текущему профилю — если вы изменили специальность или страны в анкете, факты обновятся автоматически.", en: "The “why this fits” assessment recalculates from your current profile — if you change your major or countries, the facts update automatically." },
      emptyTitle: { ru: "Пока нет избранных вузов", en: "No favorite universities yet" },
      emptyText: { ru: "На странице рекомендаций нажмите ♡ на карточке вуза, чтобы сохранить его здесь.", en: "On the recommendations page, click ♡ on a university card to save it here." },
      toRecommendations: { ru: "К рекомендациям", en: "To recommendations" },
      missingNote: { ru: "Часть сохранённых вузов не найдена в текущей базе ({count}) — они были удалены из списка автоматически.", en: "Some saved universities ({count}) weren't found in the current database — they were removed from the list automatically." }
    },
    countryGuide: {
      title: { ru: "Выбор страны — Uniora", en: "Choose a country — Uniora" },
      eyebrow: { ru: "Ещё не решили?", en: "Not sure yet?" },
      heading: { ru: "Сравните приоритеты по странам", en: "Compare priorities across countries" },
      subheading: { ru: "Что сильнее всего влияет на отбор в каждой стране — по нашей собственной оценке, а не официальной статистике вузов.", en: "What matters most for admission in each country — based on our own assessment, not official university statistics." },
      uniCountInBase: { ru: "вуз(ов) в базе Uniora", en: "universit(ies) in the Uniora database" },
      toHome: { ru: "← На главную", en: "← To home" },
      alreadySelected: { ru: "✓ {country} уже выбрана", en: "✓ {country} already selected" },
      selectInProfile: { ru: "Выбрать {country} в анкете", en: "Select {country} in profile" },
      addedToProfile: { ru: "{country} добавлена в профиль", en: "{country} added to profile" }
    }
  };

  function t(path, vars) {
    var parts = path.split(".");
    var node = UI;
    for (var i = 0; i < parts.length; i++) {
      if (node === undefined || node === null) { return path; }
      node = node[parts[i]];
    }
    var str = tf(node);
    if (typeof str !== "string") return path;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.split("{" + k + "}").join(vars[k]);
      });
    }
    return str;
  }

  // Список слов вуз/вуза/вузов на текущем языке — для согласования числа.
  function uniWord(n) {
    var lang = getLang();
    if (lang === "en") return n === 1 ? "university" : "universities";
    var mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "вуз";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "вуза";
    return "вузов";
  }

  // Применяет data-i18n к статичным элементам HTML-страниц (index.html и т.п.)
  // Для списков (например, шагов иллюстративных примеров) используется
  // data-i18n со значением-массивом: тогда заполняется список <li> заново.
  function applyStatic(root) {
    (root || document).querySelectorAll("[data-i18n]").forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      var value = t(key);
      if (Array.isArray(value)) return; // защищаемся, t() всегда возвращает строку/путь
      node.textContent = value;
    });
    (root || document).querySelectorAll("[data-i18n-list]").forEach(function (node) {
      var key = node.getAttribute("data-i18n-list");
      var parts = key.split(".");
      var val = UI;
      for (var i = 0; i < parts.length; i++) {
        if (!val) break;
        val = val[parts[i]];
      }
      var items = tf(val);
      if (!Array.isArray(items)) return;
      node.innerHTML = "";
      items.forEach(function (item) {
        var li = document.createElement("li");
        li.textContent = item;
        node.appendChild(li);
      });
    });
  }

  function init() {
    document.documentElement.lang = getLang();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { applyStatic(document); });
    } else {
      applyStatic(document);
    }
  }

  init();

  global.Uniora = global.Uniora || {};
  global.Uniora.i18n = { getLang: getLang, setLang: setLang, tf: tf, t: t, uniWord: uniWord, applyStatic: applyStatic, UI: UI };
})(window);
