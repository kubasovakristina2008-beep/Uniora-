/* Uniora — экран «Диагностика»: созвездие готовности к поступлению.
   Процент готовности — собственная эвристика Uniora, посчитанная из
   реальных данных анкеты (IELTS, профильные предметы, GPA, документы),
   не официальный балл и не гарантия результата. */
(function (global) {
  "use strict";

  var C = global.Uniora.common;
  var S = global.Uniora.state;
  var M = global.Uniora.match;
  var I = global.Uniora.i18n;
  var el = C.el;
  var qs = C.qs;
  var t = I.t;

  var CATEGORY_LABEL_KEY = {
    english: "diagnosis.englishLabel",
    sat: "diagnosis.satLabel",
    academic: "diagnosis.academicLabel",
    documents: "diagnosis.documentsLabel"
  };
  var FOCUS_TEXT_KEY = {
    english: "diagnosis.focusEnglish",
    sat: "diagnosis.focusSat",
    academic: "diagnosis.focusAcademic",
    documents: "diagnosis.focusDocuments"
  };

  function render() {
    var root = qs("#diagnosis-root");
    root.innerHTML = "";
    var profile = S.getProfile();

    if (!S.isProfileMinimal(profile)) {
      C.emptyState(root, {
        icon: "🧭",
        title: t("diagnosis.empty.title"),
        text: t("diagnosis.empty.text"),
        actionLabel: t("common.fillProfile"),
        actionHref: "profile.html"
      });
      return;
    }

    var categories = M.readinessCategories(profile);
    var overall = M.readinessOverall(categories);
    var sw = M.readinessStrengthsWeaknesses(categories);
    var exSummary = M.examsTakenSummary(profile);

    root.appendChild(
      el("div", { class: "section-heading" }, [
        el("span", { class: "eyebrow" }, [t("diagnosis.eyebrow")]),
        el("h2", {}, [t("diagnosis.title2")]),
        el("p", {}, [
          t("diagnosis.subtitle", {
            majors: C.majorsLabel(profile.majors),
            countries: profile.showAllCountries ? t("diagnosis.allCountries") : profile.countries.map(C.countryLabel).join(", ")
          })
        ])
      ])
    );

    // Общая готовность
    root.appendChild(
      el("div", { class: "card", style: "margin-bottom:var(--space-3);" }, [
        el("div", { class: "stat-card__label" }, [t("diagnosis.readinessLabel")]),
        el("div", { class: "stat-card__value", style: "font-size:2rem;" }, [overall + "%"]),
        el("div", { class: "stat-card__note" }, [t("diagnosis.readinessNote")])
      ])
    );

    // Созвездие сильных и слабых сторон
    root.appendChild(el("h3", {}, [t("diagnosis.constellationTitle")]));
    var grid = el("div", { class: "diagnosis-grid" });
    categories.forEach(function (c) {
      var isNoData = c.score === null;
      var label = t(CATEGORY_LABEL_KEY[c.key]);
      grid.appendChild(
        el("div", { class: "card" }, [
          el("div", { class: "stat-card__label" }, [label]),
          el("div", { class: "stat-card__value" }, [isNoData ? t("diagnosis.noData") : c.score + "%"]),
          el("div", { class: "portfolio-strength__track", style: "margin-top:8px;" }, [
            el("div", { class: "portfolio-strength__fill", style: "width:" + (isNoData ? 0 : c.score) + "%" })
          ])
        ])
      );
    });
    root.appendChild(grid);

    // Сильные стороны / точки роста
    root.appendChild(
      el("div", { class: "diagnosis-grid", style: "margin-top:var(--space-3);" }, [
        el("div", { class: "card" }, [
          el("h3", { style: "margin-bottom:10px;" }, [t("diagnosis.strengths")]),
          sw.strengths.length
            ? el("div", { class: "strength-list" }, sw.strengths.map(function (c) { return el("span", { class: "chip chip--static" }, ["✓ " + t(CATEGORY_LABEL_KEY[c.key]) + " — " + c.score + "%"]); }))
            : el("p", { class: "muted", style: "margin:0;" }, [t("diagnosis.strengthsEmpty")])
        ]),
        el("div", { class: "card" }, [
          el("h3", { style: "margin-bottom:10px;" }, [t("diagnosis.weaknesses")]),
          sw.weaknesses.length
            ? el("ul", { style: "margin:0;padding-left:18px;" }, sw.weaknesses.map(function (c) { return el("li", { style: "margin-bottom:6px;" }, [t(CATEGORY_LABEL_KEY[c.key]) + " — " + c.score + "%"]); }))
            : el("p", { class: "muted", style: "margin:0;" }, [t("diagnosis.weaknessesEmpty")])
        ])
      ])
    );

    // Рекомендованный фокус
    if (sw.weaknesses.length) {
      var top = sw.weaknesses[0];
      var focusText = FOCUS_TEXT_KEY[top.key] ? t(FOCUS_TEXT_KEY[top.key]) : t("diagnosis.focusFallback");
      root.appendChild(
        el("div", { class: "card", style: "margin-top:var(--space-3);border-color:var(--aurora-violet);" }, [
          el("h3", { style: "margin-bottom:6px;" }, [t("diagnosis.focusTitle")]),
          el("p", { style: "margin:0;" }, [focusText])
        ])
      );
    }

    root.appendChild(
      el("div", { class: "disclaimer", style: "margin-top:var(--space-3);" }, [
        t("diagnosis.footerNote", { count: exSummary.count, total: exSummary.total })
      ])
    );

    root.appendChild(
      el("div", { class: "step-actions", style: "margin-top:24px;" }, [
        el("a", { class: "btn btn--secondary", href: "profile.html" }, [t("diagnosis.fillProfile")]),
        el("a", { class: "btn btn--primary", href: "recommendations.html" }, [t("diagnosis.viewRecommendations")])
      ])
    );
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.diagnosis = { init: render };
})(window);
