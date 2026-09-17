/* Uniora — детерминированный rule-based алгоритм подбора. Без обязательного LLM-вызова.
   Проценты совпадения/проходимости и «готовность к поступлению» — собственная
   эвристика Uniora, посчитанная из реальных данных анкеты, а не официальная
   статистика вуза. Бюджет нигде не участвует в расчётах. */
(function (global) {
  "use strict";

  var data = global.Uniora.data;

  function fmtNum(n) {
    return Math.round(n * 10) / 10;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function effectiveCountries(profile) {
    return profile.showAllCountries ? data.COUNTRIES.map(function (c) { return c.id; }) : (profile.countries || []);
  }

  function relevantSubjectsForUni(uni, profile) {
    // Пересечение специальностей, выбранных в анкете, со специальностями вуза —
    // именно по ним показываем профильные предметы, а не по всем сразу.
    var majors = (uni.majors || []).filter(function (m) { return (profile.majors || []).indexOf(m) !== -1; });
    return data.subjectsForMajors(majors).filter(function (s) { return uni.subjects && (s.key in uni.subjects); });
  }

  // Считает margin по IELTS и по релевантным профильным предметам, которые
  // реально указаны у вуза и есть выбор специальности, пересекающийся с ним.
  function computeExamSignals(profile, uni) {
    var numericFacts = [];
    var gapExams = [];
    var margins = [];

    var ielts = profile.exams.ielts;
    if (typeof uni.ielts === "number") {
      if (ielts && !ielts.notTaken && typeof ielts.value === "number") {
        var ieltsMargin = (ielts.value - uni.ielts) / uni.ielts;
        margins.push(ieltsMargin);
        numericFacts.push({ exam: "IELTS", userValue: ielts.value, required: uni.ielts, margin: ieltsMargin });
      } else {
        gapExams.push({ exam: "IELTS", required: uni.ielts });
      }
    }

    relevantSubjectsForUni(uni, profile).forEach(function (subj) {
      var required = uni.subjects[subj.key];
      var userSubj = profile.exams.subjects[subj.key];
      if (userSubj && !userSubj.notTaken && typeof userSubj.value === "number") {
        var margin = (userSubj.value - required) / required;
        margins.push(margin);
        numericFacts.push({ exam: subj.label, userValue: userSubj.value, required: required, margin: margin });
      } else {
        gapExams.push({ exam: subj.label, required: required });
      }
    });

    var academicMargin = margins.length ? margins.reduce(function (a, b) { return a + b; }, 0) / margins.length : null;
    return { academicMargin: academicMargin, numericFacts: numericFacts, gapExams: gapExams };
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
    var countryLabel = (data.COUNTRIES.filter(function (c) { return c.id === uni.country; })[0] || {}).label;
    var matchedMajors = (uni.majors || []).filter(function (m) { return (profile.majors || []).indexOf(m) !== -1; });
    var countryMatches = profile.showAllCountries || (profile.countries && profile.countries.indexOf(uni.country) !== -1);

    if (matchedMajors.length && countryMatches) {
      var majorLabels = matchedMajors.map(function (id) {
        return (data.MAJORS.filter(function (m) { return m.id === id; })[0] || {}).label;
      }).join(", ");
      facts.push({ tone: "neutral", text: "Специальность «" + majorLabels + "» и страна " + countryLabel + " совпадают с вашим выбором в анкете." });
    } else {
      var uniMajorLabels = (uni.majors || []).map(function (id) {
        return (data.MAJORS.filter(function (m) { return m.id === id; })[0] || {}).label;
      }).join(", ");
      facts.push({ tone: "neutral", text: "Вуз предлагает: " + uniMajorLabels + " · " + countryLabel + "." });
      if (!matchedMajors.length) facts.push({ tone: "gap", text: "Это не совпадает с выбранными в анкете специальностями — оценка показана справочно." });
      else if (!countryMatches) facts.push({ tone: "gap", text: "Эта страна сейчас не выбрана в анкете — оценка показана справочно." });
    }

    signals.numericFacts.forEach(function (f) {
      var tone = f.margin >= 0 ? "positive" : "negative";
      var text = f.exam + " " + fmtNum(f.userValue) + " у вас против минимума " + fmtNum(f.required) + " у вуза";
      text += f.margin >= 0 ? " — порог пройден с запасом." : " — пока ниже порога, есть время подтянуть.";
      facts.push({ tone: tone, text: text });
    });

    signals.gapExams.forEach(function (f) {
      facts.push({ tone: "gap", text: "Вуз указывает порог по «" + f.exam + "» (от " + fmtNum(f.required) + "), но в анкете нет данных — добавьте балл для более точной картины." });
    });

    facts.push({ tone: "neutral", text: "По данным прошлого цикла вуз принимал ориентировочно " + Math.round(uni.acceptanceRate * 100) + "% абитуриентов (демо-данные, не гарантия поступления)." });

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
  // Английский язык (IELTS 0–9 → 0–100), Профильные предметы (среднее по
  // введённым предметным экзаменам, уже 0–100), Академическая успеваемость
  // (GPA 0–5 → 0–100), Документы (доля готовых пунктов чек-листа).
  function readinessCategories(profile) {
    var ielts = profile.exams.ielts;
    var englishScore = (ielts && !ielts.notTaken && typeof ielts.value === "number")
      ? clamp(Math.round((ielts.value / 9) * 100), 0, 100) : 0;

    var subjectDefs = data.subjectsForMajors(profile.majors || []);
    var subjectValues = subjectDefs
      .map(function (s) { return profile.exams.subjects[s.key]; })
      .filter(function (v) { return v && !v.notTaken && typeof v.value === "number"; })
      .map(function (v) { return v.value; });
    var subjectsScore = subjectValues.length
      ? Math.round(subjectValues.reduce(function (a, b) { return a + b; }, 0) / subjectValues.length)
      : 0;

    var gpa = profile.exams.gpa;
    var academicScore = (gpa && !gpa.notTaken && typeof gpa.value === "number")
      ? clamp(Math.round((gpa.value / 5) * 100), 0, 100) : 0;

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
      { key: "english", label: "Английский язык", score: englishScore },
      { key: "subjects", label: "Профильные предметы", score: subjectDefs.length ? subjectsScore : null },
      { key: "academic", label: "Академическая успеваемость (GPA)", score: academicScore },
      { key: "documents", label: "Документы", score: documentsScore }
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
    var subjectDefs = data.subjectsForMajors(profile.majors || []);
    var total = 2 + subjectDefs.length; // IELTS + GPA + профильные
    var count = 0;
    var ielts = profile.exams.ielts;
    if (ielts && !ielts.notTaken && typeof ielts.value === "number") count++;
    var gpa = profile.exams.gpa;
    if (gpa && !gpa.notTaken && typeof gpa.value === "number") count++;
    subjectDefs.forEach(function (s) {
      var v = profile.exams.subjects[s.key];
      if (v && !v.notTaken && typeof v.value === "number") count++;
    });
    return { count: count, total: total };
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
    relevantSubjectsForUni: relevantSubjectsForUni,
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
