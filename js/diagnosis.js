/* Uniora — экран «Диагностика»: созвездие готовности к поступлению.
   Процент готовности — собственная эвристика Uniora, посчитанная из
   реальных данных анкеты (IELTS, профильные предметы, GPA, документы),
   не официальный балл и не гарантия результата. */
(function (global) {
  "use strict";

  var C = global.Uniora.common;
  var S = global.Uniora.state;
  var M = global.Uniora.match;
  var el = C.el;
  var qs = C.qs;

  function render() {
    var root = qs("#diagnosis-root");
    root.innerHTML = "";
    var profile = S.getProfile();

    if (!S.isProfileMinimal(profile)) {
      C.emptyState(root, {
        icon: "🧭",
        title: "Пока рано ставить диагноз",
        text: "Укажите в профиле хотя бы одну специальность и страну — тогда диагностика станет осмысленной.",
        actionLabel: "Заполнить профиль",
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
        el("span", { class: "eyebrow" }, ["Диагностика профиля"]),
        el("h2", {}, ["Твой портрет абитуриента"]),
        el("p", {}, [
          "Специальность: " + C.majorsLabel(profile.majors) + " · Страны: " +
          (profile.showAllCountries ? "все страны" : profile.countries.map(C.countryLabel).join(", "))
        ])
      ])
    );

    // Общая готовность
    root.appendChild(
      el("div", { class: "card", style: "margin-bottom:var(--space-3);" }, [
        el("div", { class: "stat-card__label" }, ["Готовность к поступлению"]),
        el("div", { class: "stat-card__value", style: "font-size:2rem;" }, [overall + "%"]),
        el("div", { class: "stat-card__note" }, ["Эвристика Uniora на основе заполненности анкеты — не официальный балл и не гарантия результата."])
      ])
    );

    // Созвездие сильных и слабых сторон
    root.appendChild(el("h3", {}, ["Созвездие твоих сильных и слабых сторон"]));
    var grid = el("div", { class: "diagnosis-grid" });
    categories.forEach(function (c) {
      var isNoData = c.score === null;
      grid.appendChild(
        el("div", { class: "card" }, [
          el("div", { class: "stat-card__label" }, [c.label]),
          el("div", { class: "stat-card__value" }, [isNoData ? "нет данных" : c.score + "%"]),
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
          el("h3", { style: "margin-bottom:10px;" }, ["Сильные стороны"]),
          sw.strengths.length
            ? el("div", { class: "strength-list" }, sw.strengths.map(function (c) { return el("span", { class: "chip chip--static" }, ["✓ " + c.label + " — " + c.score + "%"]); }))
            : el("p", { class: "muted", style: "margin:0;" }, ["Пока ничего не набрало высокий балл — самое время начать с малого."])
        ]),
        el("div", { class: "card" }, [
          el("h3", { style: "margin-bottom:10px;" }, ["Точки роста"]),
          sw.weaknesses.length
            ? el("ul", { style: "margin:0;padding-left:18px;" }, sw.weaknesses.map(function (c) { return el("li", { style: "margin-bottom:6px;" }, [c.label + " — " + c.score + "%"]); }))
            : el("p", { class: "muted", style: "margin:0;" }, ["Явных слабых мест не видно — можно усиливать профиль сверх минимума."])
        ])
      ])
    );

    // Рекомендованный фокус
    if (sw.weaknesses.length) {
      var top = sw.weaknesses[0];
      var focusText = {
        english: "Подтяните английский — добавьте актуальный балл IELTS в анкете, если сдавали, или запишитесь на подготовку.",
        subjects: "Уделите время профильным предметам — они сильнее всего влияют на категории Match/Reach/Safety в рекомендациях.",
        academic: "Укажите средний балл аттестата (GPA) в анкете — это часть общей академической картины.",
        documents: "Продвиньтесь по чек-листу документов на странице Roadmap — это ближайший конкретный шаг."
      }[top.key] || "Загляните в раздел с наибольшим пробелом и продвиньтесь на один шаг.";
      root.appendChild(
        el("div", { class: "card", style: "margin-top:var(--space-3);border-color:var(--aurora-violet);" }, [
          el("h3", { style: "margin-bottom:6px;" }, ["Рекомендованный фокус на этой неделе"]),
          el("p", { style: "margin:0;" }, [focusText])
        ])
      );
    }

    root.appendChild(
      el("div", { class: "disclaimer", style: "margin-top:var(--space-3);" }, [
        "Обновлено только что · на основе " + exSummary.count + " из " + exSummary.total + " экзаменов и заполненности достижений/документов. Это качественная оценка Uniora, не официальный балл и не гарантия результата поступления."
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
