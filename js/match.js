/* Uniora — детерминированный rule-based алгоритм подбора. Без обязательного LLM-вызова. */
(function (global) {
  "use strict";

  var data = global.Uniora.data;

  var EXAM_LABELS = { ielts: "IELTS", toefl: "TOEFL", sat: "SAT" };

  function fmtNum(n) {
    return Math.round(n * 10) / 10;
  }

  // Считает margin по каждому числовому требованию вуза, которое реально
  // указано пользователем. Текстовые требования и "нет данных" — отдельные сигналы.
  function computeExamSignals(profile, uni) {
    var numericFacts = [];
    var textFacts = [];
    var gapExams = [];
    var margins = [];

    ["ielts", "toefl", "sat"].forEach(function (key) {
      var req = uni[key];
      if (req === null || req === undefined) return;
      if (typeof req === "string") {
        textFacts.push({ exam: EXAM_LABELS[key], text: req });
        return;
      }
      // req — число
      var userExam = profile.exams[key];
      if (!userExam || userExam.notTaken || userExam.value === null || userExam.value === undefined) {
        gapExams.push({ exam: EXAM_LABELS[key], required: req });
        return;
      }
      var margin = (userExam.value - req) / req;
      margins.push(margin);
      numericFacts.push({
        exam: EXAM_LABELS[key],
        userValue: userExam.value,
        required: req,
        margin: margin
      });
    });

    var academicMargin = margins.length
      ? margins.reduce(function (a, b) { return a + b; }, 0) / margins.length
      : null;

    return {
      academicMargin: academicMargin,
      numericFacts: numericFacts,
      textFacts: textFacts,
      gapExams: gapExams
    };
  }

  // Пороги — эвристика Uniora, не официальная методология вуза.
  function categorize(acceptanceRate, margin) {
    if (acceptanceRate >= 0.35 && margin !== null && margin >= 0) return "safety";
    if (acceptanceRate < 0.15 || (margin !== null && margin < -0.05)) return "reach";
    return "match";
  }

  function buildReasonFacts(uni, profile, signals) {
    var facts = [];
    var majorLabel = (data.MAJORS.filter(function (m) { return m.id === profile.major; })[0] || {}).label;
    var countryLabel = (data.COUNTRIES.filter(function (c) { return c.id === uni.country; })[0] || {}).label;

    facts.push({
      tone: "neutral",
      text: "Специальность «" + majorLabel + "» и страна " + countryLabel + " совпадают с вашим выбором в анкете."
    });

    signals.numericFacts.forEach(function (f) {
      var tone = f.margin >= 0 ? "positive" : "negative";
      var text = f.exam + " " + fmtNum(f.userValue) + " у вас против минимума " + fmtNum(f.required) + " у вуза";
      text += f.margin >= 0 ? " — порог пройден с запасом." : " — пока ниже порога, есть время подтянуть.";
      facts.push({ tone: tone, text: text });
    });

    signals.textFacts.forEach(function (f) {
      facts.push({ tone: "neutral", text: f.exam + ": " + f.text + "." });
    });

    signals.gapExams.forEach(function (f) {
      facts.push({
        tone: "gap",
        text: "Вуз указывает порог по " + f.exam + " (от " + fmtNum(f.required) + "), но в анкете этот экзамен не отмечен как сданный — добавьте балл для более точной картины."
      });
    });

    facts.push({
      tone: "neutral",
      text: "По данным прошлого цикла вуз принимал ориентировочно " + Math.round(uni.acceptanceRate * 100) + "% абитуриентов (демо-данные, не гарантия поступления)."
    });

    return facts;
  }

  function matchUniversities(profile) {
    if (!profile.major) return [];
    var countries = profile.showAllCountries ? null : (profile.countries || []);
    if (!profile.showAllCountries && (!countries || countries.length === 0)) return [];

    var candidates = data.UNIVERSITIES.filter(function (u) {
      if (u.majors.indexOf(profile.major) === -1) return false;
      if (profile.showAllCountries) return true;
      return countries.indexOf(u.country) !== -1;
    });

    return candidates.map(function (uni) {
      var signals = computeExamSignals(profile, uni);
      var category = categorize(uni.acceptanceRate, signals.academicMargin);
      return {
        university: uni,
        category: category,
        academicMargin: signals.academicMargin,
        signals: signals,
        reasons: buildReasonFacts(uni, profile, signals)
      };
    });
  }

  // --- Сила портфолио: качественная метка, без процентов ---
  var PORTFOLIO_CATEGORIES = ["sport", "volunteering", "projects", "research", "olympiads", "hackathons", "internship"];

  function portfolioStrength(profile) {
    var a = profile.achievements;
    var filled = 0;
    var total = 7;
    if (a.sport.practices.length > 0) filled++;
    if (a.volunteering.active) filled++;
    if (a.academic.projects.length > 0) filled++;
    if (a.academic.research.length > 0) filled++;
    if (a.academic.olympiads.length > 0) filled++;
    if (a.academic.hackathons.length > 0) filled++;
    if (a.internship.active) filled++;
    if (profile.major === "arts") {
      total = 8;
      if (a.creative.works.length > 0) filled++;
    }

    var label;
    if (filled === 0) label = "Только в начале пути";
    else if (filled <= 2) label = "Есть база, есть куда расти";
    else if (filled <= 4) label = "Портфолио заметно окрепло";
    else label = "Сильное портфолио";

    var width = Math.max(8, Math.min(85, Math.round((filled / total) * 90)));

    return { filled: filled, total: total, label: label, barWidth: width };
  }

  function examsTakenSummary(profile) {
    var keys = ["ielts", "sat", "toefl", "gpa"];
    var count = 0;
    keys.forEach(function (k) {
      var e = profile.exams[k];
      if (e && !e.notTaken && e.value !== null && e.value !== undefined) count++;
    });
    return { count: count, total: keys.length };
  }

  // --- Звёзды-пробелы: единая функция для Диагностики и Roadmap ---
  var CATEGORY_CHECK = {
    exams: function (profile) { return examsTakenSummary(profile).count > 0; },
    research: function (profile) {
      return profile.achievements.academic.research.length > 0 || profile.achievements.academic.projects.length > 0;
    },
    olympiads: function (profile) { return profile.achievements.academic.olympiads.length > 0; },
    sport: function (profile) { return profile.achievements.sport.practices.length > 0; },
    volunteering: function (profile) { return profile.achievements.volunteering.active; }
  };

  function suggestEventForMajor(major) {
    var found = data.EVENTS.filter(function (e) { return e.majors.indexOf(major) !== -1; });
    return found.length ? found[0] : null;
  }

  function nextStepText(category, country, profile) {
    var countryLabel = (data.COUNTRIES.filter(function (c) { return c.id === country; })[0] || {}).label;
    if (category === "exams") {
      return "В анкете не указан ни один сданный экзамен. Добавьте результат IELTS, TOEFL, SAT или школьный GPA — для " + countryLabel + " это часто стартовая точка отбора.";
    }
    if (category === "research") {
      return "Нет отмеченных исследований или проектов по специальности. Добавьте в анкете проект с научным руководителем или учебный проект по специальности — для " + countryLabel + " это заметно усиливает заявку.";
    }
    if (category === "olympiads") {
      var event = suggestEventForMajor(profile.major);
      var suffix = event ? " Например, «" + event.name + "» подходит вашей специальности — подробнее в разделе мероприятий Roadmap." : "";
      return "Нет отмеченных международных олимпиад (учитываются только республиканский/международный уровень)." + suffix;
    }
    if (category === "sport") {
      return "Спорт не отмечен в анкете. Для " + countryLabel + " это тоже учитывается при отборе — если занимаетесь, добавьте вид спорта и уровень.";
    }
    if (category === "volunteering") {
      return "Волонтёрский опыт не отмечен. Для " + countryLabel + " это особенно важно для стипендиальных программ — добавьте сферу в анкете, если есть опыт.";
    }
    return "";
  }

  function computeGaps(profile) {
    var effectiveCountries = profile.showAllCountries
      ? data.COUNTRIES.map(function (c) { return c.id; })
      : (profile.countries || []);
    if (effectiveCountries.length === 0) return { gaps: [], strengths: [] };
    var gaps = [];
    var strengths = [];
    var seenCategories = {};

    effectiveCountries.forEach(function (country) {
      var priorities = data.PRIORITIES[country];
      if (!priorities) return;
      Object.keys(priorities).forEach(function (category) {
        var weight = priorities[category].level;
        if (weight !== "high" && weight !== "medium") return;
        var filled = CATEGORY_CHECK[category](profile);
        var key = category; // пробел не завязан на конкретную страну — не дублируем
        if (filled) {
          if (!seenCategories["strong:" + key]) {
            seenCategories["strong:" + key] = true;
            strengths.push({ category: category, label: data.CATEGORY_LABELS[category] });
          }
          return;
        }
        if (seenCategories["gap:" + key]) return;
        seenCategories["gap:" + key] = true;
        gaps.push({
          id: "gap-" + category,
          category: category,
          categoryLabel: data.CATEGORY_LABELS[category],
          weight: weight,
          country: country,
          countryLabel: (data.COUNTRIES.filter(function (c) { return c.id === country; })[0] || {}).label,
          nextStep: nextStepText(category, country, profile)
        });
      });
    });

    return { gaps: gaps, strengths: strengths };
  }

  function urgencyLevel(profile) {
    var gapsInfo = computeGaps(profile);
    var highGaps = gapsInfo.gaps.filter(function (g) { return g.weight === "high"; }).length;
    var examsCount = examsTakenSummary(profile).count;

    if (highGaps >= 2 || examsCount === 0) return "high";
    if (highGaps === 1 || examsCount <= 2) return "medium";
    return "low";
  }

  // --- Мини-профориентация ---
  function scoreCareerQuiz(answers) {
    // answers: { q1: 'it', q2: 'business', ... }
    var counts = {};
    data.MAJORS.forEach(function (m) { counts[m.id] = 0; });
    Object.keys(answers).forEach(function (q) {
      var major = answers[q];
      if (major && counts.hasOwnProperty(major)) counts[major]++;
    });
    var best = null;
    var bestCount = -1;
    Object.keys(counts).forEach(function (major) {
      if (counts[major] > bestCount) {
        bestCount = counts[major];
        best = major;
      }
    });
    var chosenLabels = Object.keys(answers).map(function (q) {
      var opt = data.CAREER_QUIZ.filter(function (item) { return item.id === q; })[0];
      if (!opt) return null;
      var picked = opt.options.filter(function (o) { return o.major === answers[q]; })[0];
      return picked ? picked.text : null;
    }).filter(Boolean);

    return { major: best, counts: counts, chosenLabels: chosenLabels };
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.match = {
    matchUniversities: matchUniversities,
    categorize: categorize,
    portfolioStrength: portfolioStrength,
    examsTakenSummary: examsTakenSummary,
    computeGaps: computeGaps,
    urgencyLevel: urgencyLevel,
    scoreCareerQuiz: scoreCareerQuiz,
    suggestEventForMajor: suggestEventForMajor,
    EXAM_LABELS: EXAM_LABELS
  };
})(window);
