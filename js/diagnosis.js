/* Uniora — экран «Диагностика»: честный качественный портрет, без баллов и процентов. */
(function (global) {
  "use strict";

  var C = global.Uniora.common;
  var S = global.Uniora.state;
  var M = global.Uniora.match;
  var D = global.Uniora.data;
  var el = C.el;
  var qs = C.qs;

  var EXAM_META = {
    ielts: { label: "IELTS", max: 9, decimals: 1 },
    sat: { label: "SAT", max: 1600, decimals: 0 },
    toefl: { label: "TOEFL", max: 120, decimals: 0 },
    gpa: { label: "GPA", max: 5, decimals: 1 }
  };

  var URGENCY_LABEL = { high: "Высокая", medium: "Средняя", low: "Низкая" };

  function fmt(v, decimals) { return decimals > 0 ? v.toFixed(decimals) : String(Math.round(v)); }

  function render() {
    var root = qs("#diagnosis-root");
    root.innerHTML = "";
    var profile = S.getProfile();

    if (!S.isProfileMinimal(profile)) {
      C.emptyState(root, {
        icon: "🧭",
        title: "Пока рано ставить диагноз",
        text: "Укажите в профиле хотя бы специальность и страну — тогда диагностика станет осмысленной.",
        actionLabel: "Заполнить профиль",
        actionHref: "profile.html"
      });
      return;
    }

    var strength = M.portfolioStrength(profile);
    var examsSummary = M.examsTakenSummary(profile);
    var urgency = M.urgencyLevel(profile);
    var gapsInfo = M.computeGaps(profile);

    // Портрет человеческим языком
    var majorLabel = C.majorLabel(profile.major);
    var countriesText = profile.showAllCountries ? "по всем странам" : profile.countries.map(C.countryLabel).join(", ");
    root.appendChild(
      el("div", { class: "section-heading" }, [
        el("span", { class: "eyebrow" }, ["Ваша диагностика"]),
        el("h2", {}, ["Портрет профиля"]),
        el("p", {}, [
          "Вы рассматриваете «" + majorLabel + "» " + countriesText + ". Портфолио пока на уровне «" + strength.label.toLowerCase() +
          "», сдано " + examsSummary.count + " из " + examsSummary.total + " экзаменов. Срочность действий: " + URGENCY_LABEL[urgency].toLowerCase() + "."
        ])
      ])
    );

    var grid = el("div", { class: "diagnosis-grid" });

    // Портфолио
    var portfolioCard = el("div", { class: "card" }, [
      el("div", { class: "stat-card__label" }, ["Сила портфолио"])
    ]);
    grid.appendChild(portfolioCard);

    // Языковые/академические экзамены — реальная позиция на шкале самого экзамена
    var examLines = [];
    ["ielts", "toefl", "sat", "gpa"].forEach(function (key) {
      var e = profile.exams[key];
      var meta = EXAM_META[key];
      if (e && !e.notTaken && e.value !== null && e.value !== undefined) {
        examLines.push(el("div", { class: "fact-row fact-row--positive" }, [
          el("span", { class: "fact-row__dot" }),
          el("span", {}, [meta.label + ": " + fmt(e.value, meta.decimals) + " из " + meta.max + " (шкала самого экзамена)"])
        ]));
      }
    });
    if (!examLines.length) examLines.push(el("p", { class: "muted", style: "margin:0;" }, ["Пока ни один экзамен не отмечен как сданный."]));
    grid.appendChild(
      el("div", { class: "card" }, [
        el("div", { class: "stat-card__label" }, ["Позиции по экзаменам"]),
        el("div", { class: "flex-col gap-1", style: "margin-top:8px;" }, examLines)
      ])
    );

    // Честный счётчик
    grid.appendChild(
      el("div", { class: "card" }, [
        el("div", { class: "stat-card__label" }, ["Экзамены"]),
        el("div", { class: "stat-card__value" }, [examsSummary.count + " из " + examsSummary.total]),
        el("div", { class: "stat-card__note" }, ["Буквальный счёт сданных экзаменов из анкеты — не оценка уровня."])
      ])
    );

    // Срочность
    grid.appendChild(
      el("div", { class: "card" }, [
        el("div", { class: "stat-card__label" }, ["Срочность действий"]),
        el("div", { class: "stat-card__value" }, [
          el("span", { class: "urgency-dot urgency-dot--" + urgency }), URGENCY_LABEL[urgency]
        ]),
        el("div", { class: "stat-card__note" }, ["Качественная метка на основе числа пробелов и сданных экзаменов — не точный расчёт."])
      ])
    );

    root.appendChild(grid);
    C.portfolioBar(portfolioCard, strength);

    // Пробелы и сильные стороны
    root.appendChild(el("h3", { style: "margin-top:32px;" }, ["Что усилить"]));
    if (!profile.countries.length && !profile.showAllCountries) {
      root.appendChild(el("p", { class: "muted" }, ["Укажите страну в профиле, чтобы увидеть приоритеты именно по ней."]));
    } else if (!gapsInfo.gaps.length) {
      var wrap = el("div", { class: "card" }, [
        el("p", { style: "margin-bottom:12px;" }, ["Явных пробелов по выбранным странам не видно — можно дополнить портфолио на своё усмотрение."]),
        el("a", { class: "btn btn--secondary", href: "roadmap.html" }, ["Посмотреть Roadmap"])
      ]);
      root.appendChild(wrap);
    } else {
      var gapList = el("div", { class: "gap-list" });
      gapsInfo.gaps.forEach(function (g) {
        gapList.appendChild(
          el("div", { class: "gap-item" }, [
            el("span", { class: "gap-item__icon" }, ["✦"]),
            el("div", {}, [
              el("div", { class: "flex items-center gap-1", style: "margin-bottom:4px;" }, [
                el("strong", {}, [g.categoryLabel]),
                el("span", { class: "badge badge--weight-" + g.weight }, [g.weight === "high" ? "Высокий приоритет" : "Средний приоритет"])
              ]),
              el("p", { style: "margin:0;" }, [g.nextStep])
            ])
          ])
        );
      });
      root.appendChild(gapList);
    }

    if (gapsInfo.strengths.length) {
      root.appendChild(el("h3", { style: "margin-top:28px;" }, ["Уже сильные стороны"]));
      var strengthList = el("div", { class: "strength-list" });
      gapsInfo.strengths.forEach(function (s) {
        strengthList.appendChild(el("span", { class: "chip chip--static" }, ["✓ " + s.label]));
      });
      root.appendChild(strengthList);
    }

    root.appendChild(
      el("div", { class: "disclaimer" }, [
        "Всё на этой странице — качественная оценка заполненности профиля по собственной методике Uniora, а не официальный балл, рейтинг или гарантия результата поступления."
      ])
    );

    root.appendChild(
      el("div", { class: "step-actions", style: "margin-top:24px;" }, [
        el("a", { class: "btn btn--secondary", href: "profile.html" }, ["Дополнить профиль"]),
        el("a", { class: "btn btn--primary", href: "recommendations.html" }, ["Смотреть рекомендации"])
      ])
    );
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.diagnosis = { init: render };
})(window);
