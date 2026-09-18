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
  // Порядок категорий в readinessCategories() фиксирован (english, sat,
  // academic, documents) — сопоставляем его с 4 сторонами ромба на диаграмме.
  var AXIS_POSITION = ["top", "right", "bottom", "left"];

  // Радар-диаграмма на 4 категории. Подписи — обычный HTML вокруг SVG (не
  // текст внутри svg), чтобы длинные русские названия переносились нормально.
  function buildRadarChart(categories) {
    var size = 200, center = size / 2, radius = 78;
    var svgNS = "http://www.w3.org/2000/svg";

    function pointAt(index, r) {
      var angle = index * (360 / categories.length) - 90;
      var rad = angle * Math.PI / 180;
      return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
    }

    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + size + " " + size);
    svg.setAttribute("class", "radar-chart");

    [0.25, 0.5, 0.75, 1].forEach(function (frac) {
      var pts = categories.map(function (c, i) { var p = pointAt(i, radius * frac); return p.x + "," + p.y; });
      var poly = document.createElementNS(svgNS, "polygon");
      poly.setAttribute("points", pts.join(" "));
      poly.setAttribute("class", "radar-chart__grid");
      svg.appendChild(poly);
    });

    categories.forEach(function (c, i) {
      var p = pointAt(i, radius);
      var line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", center); line.setAttribute("y1", center);
      line.setAttribute("x2", p.x); line.setAttribute("y2", p.y);
      line.setAttribute("class", "radar-chart__axis");
      svg.appendChild(line);
    });

    var scorePts = categories.map(function (c, i) {
      var val = c.score === null ? 0 : c.score;
      var p = pointAt(i, radius * (val / 100));
      return p.x + "," + p.y;
    });
    var scorePoly = document.createElementNS(svgNS, "polygon");
    scorePoly.setAttribute("points", scorePts.join(" "));
    scorePoly.setAttribute("class", "radar-chart__score");
    svg.appendChild(scorePoly);

    categories.forEach(function (c, i) {
      var val = c.score === null ? 0 : c.score;
      var p = pointAt(i, radius * (val / 100));
      var dot = document.createElementNS(svgNS, "circle");
      dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y); dot.setAttribute("r", 4);
      dot.setAttribute("class", "radar-chart__dot" + (c.score === null ? " radar-chart__dot--empty" : ""));
      svg.appendChild(dot);
    });

    return svg;
  }

  function buildRadarCard(categories) {
    var wrap = el("div", { class: "radar-card" });
    categories.forEach(function (c, i) {
      var isNoData = c.score === null;
      var pos = AXIS_POSITION[i];
      wrap.appendChild(
        el("div", { class: "radar-label radar-label--" + pos }, [
          el("div", { class: "radar-label__name" }, [t(CATEGORY_LABEL_KEY[c.key])]),
          el("div", { class: "radar-label__value" }, [isNoData ? t("diagnosis.noData") : c.score + "%"])
        ])
      );
    });
    var chartWrap = el("div", { class: "radar-chart-wrap" });
    chartWrap.appendChild(buildRadarChart(categories));
    wrap.appendChild(chartWrap);
    return wrap;
  }

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

    var layout = el("div", { class: "diagnosis-layout" });

    var leftCard = el("div", { class: "card diagnosis-radar-panel" }, [
      el("h3", { style: "margin-bottom:2px;" }, [t("diagnosis.constellationTitle")])
    ]);
    leftCard.appendChild(buildRadarCard(categories));
    layout.appendChild(leftCard);

    var rightCol = el("div", { class: "diagnosis-side-col" });

    rightCol.appendChild(
      el("div", { class: "card diagnosis-side-card diagnosis-side-card--strengths" }, [
        el("div", { class: "diagnosis-side-card__icon" }, ["✓"]),
        el("div", {}, [
          el("h3", { style: "margin-bottom:8px;" }, [t("diagnosis.strengths")]),
          sw.strengths.length
            ? el("div", { class: "strength-list" }, sw.strengths.map(function (c) { return el("span", { class: "chip chip--static" }, ["✓ " + t(CATEGORY_LABEL_KEY[c.key]) + " — " + c.score + "%"]); }))
            : el("p", { class: "muted", style: "margin:0;" }, [t("diagnosis.strengthsEmpty")])
        ])
      ])
    );

    rightCol.appendChild(
      el("div", { class: "card diagnosis-side-card diagnosis-side-card--weaknesses" }, [
        el("div", { class: "diagnosis-side-card__icon" }, ["!"]),
        el("div", {}, [
          el("h3", { style: "margin-bottom:8px;" }, [t("diagnosis.weaknesses")]),
          sw.weaknesses.length
            ? el("ul", { style: "margin:0;padding-left:18px;" }, sw.weaknesses.map(function (c) { return el("li", { style: "margin-bottom:6px;" }, [t(CATEGORY_LABEL_KEY[c.key]) + " — " + c.score + "%"]); }))
            : el("p", { class: "muted", style: "margin:0;" }, [t("diagnosis.weaknessesEmpty")])
        ])
      ])
    );

    if (sw.weaknesses.length) {
      var top = sw.weaknesses[0];
      var focusText = FOCUS_TEXT_KEY[top.key] ? t(FOCUS_TEXT_KEY[top.key]) : t("diagnosis.focusFallback");
      rightCol.appendChild(
        el("div", { class: "card diagnosis-side-card diagnosis-side-card--focus" }, [
          el("div", { class: "diagnosis-side-card__icon" }, ["✦"]),
          el("div", {}, [
            el("h3", { style: "margin-bottom:6px;" }, [t("diagnosis.focusTitle")]),
            el("p", { style: "margin:0;" }, [focusText])
          ])
        ])
      );
    }

    layout.appendChild(rightCol);
    root.appendChild(layout);

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
