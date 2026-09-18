/* Uniora — детерминированный rule-based алгоритм подбора. Без обязательного LLM-вызова.
   Проценты совпадения/проходимости и «готовность к поступлению» — собственная
   эвристика Uniora, посчитанная из реальных данных анкеты, а не официальная
   статистика вуза. Бюджет нигде не участвует в расчётах. */
(function (global) {
  "use strict";

  var data = global.Uniora.data;
  var i18n = global.Uniora.i18n;
  var t = i18n.t;
  var tf = i18n.tf;

  function fmtNum(n) {
    return Math.round(n * 10) / 10;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function effectiveCountries(profile) {
    return profile.showAllCountries ? data.COUNTRIES.map(function (c) { return c.id; }) : (profile.countries || []);
  }

  var EXAM_KEYS = ["ielts", "toefl", "sat"];
  var EXAM_LABELS = { ielts: "IELTS", toefl: "TOEFL", sat: "SAT" };

  // Считает margin по IELTS/TOEFL/SAT — только по тем, где у вуза указан
  // реальный числовой порог. Текстовые требования ("Опционально" и т.п.)
  // идут в textFacts (факт без margin). Если порог числовой, а у абитуриента
  // нет данных (не сдавал) — это честный сигнал "нет данных", не 0 и не штраф.
  function computeExamSignals(profile, uni) {
    var numericFacts = [];
    var textFacts = [];
    var gapExams = [];
    var margins = [];

    EXAM_KEYS.forEach(function (key) {
      var required = uni[key];
      if (required === null || required === undefined) return;
      var label = EXAM_LABELS[key];
      if (typeof required === "string" || (typeof required === "object" && required !== null)) {
        textFacts.push({ exam: label, text: tf(required) });
        return;
      }
      var userExam = profile.exams[key];
      if (userExam && !userExam.notTaken && typeof userExam.value === "number") {
        var margin = (userExam.value - required) / required;
        margins.push(margin);
        numericFacts.push({ exam: label, userValue: userExam.value, required: required, margin: margin });
      } else {
        gapExams.push({ exam: label, required: required });
      }
    });

    var academicMargin = margins.length ? margins.reduce(function (a, b) { return a + b; }, 0) / margins.length : null;
    return { academicMargin: academicMargin, numericFacts: numericFacts, textFacts: textFacts, gapExams: gapExams };
  }

  // Пороги — эвристика Uniora, не официальная методология вуза.
  function categorize(acceptanceRate, margin) {
    if (acceptanceRate >= 0.35 && margin !== null && margin >= 0) return "safety";
    if (acceptanceRate < 0.15 || (margin !== null && margin < -0.05)) return "reach";
    return "match";
  }

  // Процент совпадения — детерминированная функция от margin и проходимости
  // вуза (те же входные данные, что и категория Match/Reach/Safety), НЕ
  // официальная статистика поступления.
  function matchPercent(acceptanceRate, margin) {
    var base = 50 + (margin !== null ? margin * 60 : 0) + (acceptanceRate - 0.2) * 40;
    return Math.round(clamp(base, 3, 97));
  }

  function buildReasonFacts(uni, profile, signals) {
    var facts = [];
    var countryObj = data.COUNTRIES.filter(function (c) { return c.id === uni.country; })[0];
    var countryLabel = countryObj ? tf(countryObj.label) : uni.country;
    var matchedMajors = (uni.majors || []).filter(function (m) { return (profile.majors || []).indexOf(m) !== -1; });
    var countryMatches = profile.showAllCountries || (profile.countries && profile.countries.indexOf(uni.country) !== -1);

    function majorLabelOf(id) {
      var m = data.MAJORS.filter(function (mm) { return mm.id === id; })[0];
      return m ? tf(m.label) : id;
    }

    if (matchedMajors.length && countryMatches) {
      var majorLabels = matchedMajors.map(majorLabelOf).join(", ");
      facts.push({ tone: "neutral", text: t("recommendations.majorMatchFact", { majors: majorLabels, country: countryLabel }) });
    } else {
      var uniMajorLabels = (uni.majors || []).map(majorLabelOf).join(", ");
      facts.push({ tone: "neutral", text: t("recommendations.uniOffersFact", { majors: uniMajorLabels, country: countryLabel }) });
      if (!matchedMajors.length) facts.push({ tone: "gap", text: t("recommendations.majorMismatchFact") });
      else if (!countryMatches) facts.push({ tone: "gap", text: t("recommendations.countryMismatchFact") });
    }

    signals.numericFacts.forEach(function (f) {
      var tone = f.margin >= 0 ? "positive" : "negative";
      var key = f.margin >= 0 ? "recommendations.examAboveFact" : "recommendations.examBelowFact";
      var text = t(key, { exam: f.exam, user: String(fmtNum(f.userValue)), required: String(fmtNum(f.required)) });
      facts.push({ tone: tone, text: text });
    });

    signals.textFacts.forEach(function (f) {
      facts.push({ tone: "neutral", text: f.exam + ": " + f.text + "." });
    });

    signals.gapExams.forEach(function (f) {
      facts.push({ tone: "gap", text: t("recommendations.examGapFact", { exam: f.exam, required: String(fmtNum(f.required)) }) });
    });

    facts.push({ tone: "neutral", text: t("recommendations.acceptanceRateFact", { rate: String(Math.round(uni.acceptanceRate * 100)) }) });

    return facts;
  }

  // Оценивает один вуз против профиля — независимо от текущих фильтров.
  // Не мутирует profile. Используется подбором, избранным и симулятором.
  function evaluateUniversity(uni, profile) {
    var signals = computeExamSignals(profile, uni);
    var category = categorize(uni.acceptanceRate, signals.academicMargin);
    var percent = matchPercent(uni.acceptanceRate, signals.academicMargin);
    return {
      university: uni,
      category: category,
      matchPercent: percent,
      academicMargin: signals.academicMargin,
      signals: signals,
      reasons: buildReasonFacts(uni, profile, signals)
    };
  }

  function matchUniversities(profile) {
    if (!profile.majors || profile.majors.length === 0) return [];
    var countries = profile.showAllCountries ? null : (profile.countries || []);
    if (!profile.showAllCountries && (!countries || countries.length === 0)) return [];

    var candidates = data.UNIVERSITIES.filter(function (u) {
      var majorMatch = (u.majors || []).some(function (m) { return profile.majors.indexOf(m) !== -1; });
      if (!majorMatch) return false;
      if (profile.showAllCountries) return true;
      return countries.indexOf(u.country) !== -1;
    });

    return candidates.map(function (uni) { return evaluateUniversity(uni, profile); });
  }

  // --- Готовность к поступлению: 4 категории + общий процент ---
  // Английский язык (лучшее из IELTS 0–9 / TOEFL 0–120 → 0–100 — это два
  // альтернативных теста одного и того же навыка, не суммируем их), SAT
  // (400–1600 → 0–100), Академическая успеваемость (GPA 0–5 → 0–100),
  // Документы (доля готовых пунктов чек-листа).
  function readinessCategories(profile) {
    var ielts = profile.exams.ielts;
    var ieltsScore = (ielts && !ielts.notTaken && typeof ielts.value === "number")
      ? clamp(Math.round((ielts.value / 9) * 100), 0, 100) : null;
    var toefl = profile.exams.toefl;
    var toeflScore = (toefl && !toefl.notTaken && typeof toefl.value === "number")
      ? clamp(Math.round((toefl.value / 120) * 100), 0, 100) : null;
    var englishScore = ieltsScore !== null || toeflScore !== null
      ? Math.max(ieltsScore !== null ? ieltsScore : 0, toeflScore !== null ? toeflScore : 0)
      : 0;

    var sat = profile.exams.sat;
    var satScore = (sat && !sat.notTaken && typeof sat.value === "number")
      ? clamp(Math.round(((sat.value - 400) / (1600 - 400)) * 100), 0, 100) : null;

    var gpa = profile.exams.gpa;
    var academicScore = (gpa && !gpa.notTaken && typeof gpa.value === "number")
      ? clamp(Math.round((gpa.value / 5) * 100), 0, 100) : null;

    var docs = profile.documents || {};
    var docItems = data.DOCUMENT_ITEMS.filter(function (d) { return !d.onlyMajor || (profile.majors || []).indexOf(d.onlyMajor) !== -1; });
    var docScoreRaw = docItems.length
      ? docItems.reduce(function (sum, d) {
          var st = docs[d.key];
          if (st === "done") return sum + 1;
          if (st === "in_progress") return sum + 0.5;
          return sum;
        }, 0) / docItems.length
      : 0;
    var documentsScore = Math.round(docScoreRaw * 100);

    return [
      { key: "english", score: englishScore },
      { key: "sat", score: satScore },
      { key: "academic", score: academicScore },
      { key: "documents", score: documentsScore }
    ];
  }

  function readinessOverall(categories) {
    var applicable = categories.filter(function (c) { return c.score !== null; });
    if (!applicable.length) return 0;
    return Math.round(applicable.reduce(function (sum, c) { return sum + c.score; }, 0) / applicable.length);
  }

  var STRENGTH_THRESHOLD = 70;
  var WEAKNESS_THRESHOLD = 50;

  function readinessStrengthsWeaknesses(categories) {
    var strengths = [];
    var weaknesses = [];
    categories.forEach(function (c) {
      if (c.score === null) return;
      if (c.score >= STRENGTH_THRESHOLD) strengths.push(c);
      else if (c.score < WEAKNESS_THRESHOLD) weaknesses.push(c);
    });
    return { strengths: strengths, weaknesses: weaknesses };
  }

  function examsTakenSummary(profile) {
    var keys = ["ielts", "toefl", "sat", "gpa"];
    var count = 0;
    keys.forEach(function (k) {
      var e = profile.exams[k];
      if (e && !e.notTaken && typeof e.value === "number") count++;
    });
    return { count: count, total: keys.length };
  }

  // --- Мини-профориентация ---
  function scoreCareerQuiz(answers) {
    var counts = {};
    data.MAJORS.forEach(function (m) { counts[m.id] = 0; });
    Object.keys(answers).forEach(function (q) {
      var major = answers[q];
      if (major && counts.hasOwnProperty(major)) counts[major]++;
    });
    var best = null;
    var bestCount = -1;
    Object.keys(counts).forEach(function (major) {
      if (counts[major] > bestCount) { bestCount = counts[major]; best = major; }
    });
    var chosenLabels = Object.keys(answers).map(function (q) {
      var opt = data.CAREER_QUIZ.filter(function (item) { return item.id === q; })[0];
      if (!opt) return null;
      var picked = opt.options.filter(function (o) { return o.major === answers[q]; })[0];
      return picked ? picked.text : null;
    }).filter(Boolean);
    return { major: best, counts: counts, chosenLabels: chosenLabels };
  }

  function suggestEventForMajors(majors) {
    var found = data.EVENTS.filter(function (e) { return (majors || []).some(function (m) { return e.majors.indexOf(m) !== -1; }); });
    return found.length ? found[0] : null;
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.match = {
    effectiveCountries: effectiveCountries,
    evaluateUniversity: evaluateUniversity,
    matchUniversities: matchUniversities,
    categorize: categorize,
    matchPercent: matchPercent,
    readinessCategories: readinessCategories,
    readinessOverall: readinessOverall,
    readinessStrengthsWeaknesses: readinessStrengthsWeaknesses,
    examsTakenSummary: examsTakenSummary,
    scoreCareerQuiz: scoreCareerQuiz,
    suggestEventForMajors: suggestEventForMajors
  };
})(window);
