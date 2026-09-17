/* Uniora — экран «Рекомендации»: вузы по категориям Match / Reach / Safety. */
(function (global) {
  "use strict";

  var C = global.Uniora.common;
  var S = global.Uniora.state;
  var M = global.Uniora.match;
  var D = global.Uniora.data;
  var el = C.el;
  var qs = C.qs;

  var CATEGORY_ORDER = ["match", "reach", "safety"];
  var CATEGORY_LABEL = { match: "Match", reach: "Reach", safety: "Safety" };
  var CATEGORY_HINT = {
    match: "Реалистичные варианты: ваши данные близки к требованиям вуза.",
    reach: "Амбициозные варианты: конкурс высокий или порог пока не достигнут.",
    safety: "Более доступные варианты: высокий приём и запас по вашим данным."
  };

  function renderFilterBar() {
    var mount = qs("#filter-bar");
    mount.innerHTML = "";
    var profile = S.getProfile();
    var bar = el("div", { class: "filter-bar" });

    D.MAJORS.forEach(function (m) {
      var chip = el("button", {
        type: "button",
        class: "chip" + (profile.major === m.id ? " chip--selected" : "")
      }, [m.icon + " " + m.label]);
      chip.addEventListener("click", function () { S.updateProfile({ major: m.id, majorFromQuiz: false }); render(); });
      bar.appendChild(chip);
    });

    bar.appendChild(el("span", { style: "width:1px;background:rgba(20,22,43,0.1);align-self:stretch;" }));

    D.COUNTRIES.forEach(function (c) {
      var selected = profile.countries.indexOf(c.id) !== -1;
      var chip = el("button", {
        type: "button",
        class: "chip" + (selected && !profile.showAllCountries ? " chip--selected" : ""),
        style: profile.showAllCountries ? "opacity:0.5;" : ""
      }, [c.flag + " " + c.label]);
      chip.addEventListener("click", function () {
        if (profile.showAllCountries) return;
        var list = profile.countries.slice();
        var idx = list.indexOf(c.id);
        if (idx >= 0) list.splice(idx, 1); else list.push(c.id);
        S.updateProfile({ countries: list });
        render();
      });
      bar.appendChild(chip);
    });

    var allChip = el("button", {
      type: "button",
      class: "chip" + (profile.showAllCountries ? " chip--selected" : "")
    }, ["🌍 Все страны"]);
    allChip.addEventListener("click", function () { S.updateProfile({ showAllCountries: !profile.showAllCountries }); render(); });
    bar.appendChild(allChip);

    bar.appendChild(el("a", { class: "btn btn--ghost btn--sm", href: "profile.html?step=5" }, ["Изменить экзамены"]));

    mount.appendChild(bar);
  }

  function factRowClass(tone) {
    if (tone === "positive") return "fact-row fact-row--positive";
    if (tone === "negative") return "fact-row fact-row--negative";
    if (tone === "gap") return "fact-row fact-row--gap";
    return "fact-row";
  }

  function renderUniCard(match, onChange, opts) {
    opts = opts || {};
    var uni = match.university;
    var compareList = S.getCompare();
    var favorites = S.getFavorites();
    var inCompare = compareList.indexOf(uni.id) !== -1;
    var isFav = favorites.indexOf(uni.id) !== -1;

    var factRows = match.reasons.map(function (f) {
      return el("div", { class: factRowClass(f.tone) }, [el("span", { class: "fact-row__dot" }), el("span", {}, [f.text])]);
    });

    var deadlineParts = [];
    if (uni.deadlineEarly) deadlineParts.push("Ранняя: " + uni.deadlineEarly);
    deadlineParts.push("Основная: " + uni.deadlineMain);

    var card = el("div", { class: "card uni-card" }, [
      el("div", { class: "uni-card__top" }, [
        el("div", {}, [
          el("div", { class: "uni-card__name" }, [uni.name]),
          el("div", { class: "uni-card__place" }, [C.countryFlag(uni.country) + " " + uni.city + ", " + C.countryLabel(uni.country)])
        ]),
        el("span", { class: "badge badge--" + match.category }, [CATEGORY_LABEL[match.category]])
      ]),
      el("div", { class: "uni-card__facts" }, factRows),
      el("div", { class: "uni-card__facts", style: "border-top:1px solid rgba(20,22,43,0.06);padding-top:8px;" }, [
        el("div", {}, ["📅 " + deadlineParts.join(" · ") + " (данные прошлого цикла подачи, уточняйте на сайте)"]),
        el("div", {}, ["🏆 Рейтинг: #" + uni.rankingCountry + " в стране, #" + uni.rankingWorld + " в мире (ориентировочно)"]),
        uni.comment ? el("div", { class: "muted" }, ["ⓘ " + uni.comment]) : null
      ]),
      el("div", { class: "uni-card__actions" }, [
        (function () {
          var btn = el("button", { type: "button", class: "btn " + (inCompare ? "btn--primary" : "btn--secondary") }, [inCompare ? "В сравнении ✓" : "В сравнение"]);
          btn.addEventListener("click", function () {
            var res = S.toggleCompare(uni.id);
            if (!res.ok && res.reason === "max") { C.toast("Можно сравнить максимум 3 вуза — уберите один, чтобы добавить другой."); return; }
            C.toast(res.list.indexOf(uni.id) !== -1 ? "Добавлено в сравнение" : "Убрано из сравнения");
            onChange();
          });
          return btn;
        })(),
        opts.favoritesContext
          ? (function () {
              var favBtn = el("button", { type: "button", class: "btn btn--sm btn--secondary" }, ["♥ Убрать из избранного"]);
              favBtn.addEventListener("click", function () { S.toggleFavorite(uni.id); C.toast("Убрано из избранного"); onChange(); });
              return favBtn;
            })()
          : (function () {
              var favBtn = el("button", { type: "button", class: "fav-btn" + (isFav ? " fav-btn--active" : ""), title: "В избранное" }, [isFav ? "♥" : "♡"]);
              favBtn.addEventListener("click", function () { S.toggleFavorite(uni.id); onChange(); });
              return favBtn;
            })(),
        el("a", { class: "btn btn--ghost", href: uni.website, target: "_blank", rel: "noopener" }, ["Сайт"])
      ])
    ]);
    return card;
  }

  // --- Мини-симулятор «Что если»: считает гипотетический IELTS через
  // matchUniversities с подменённым значением, не сохраняя его в профиль ---
  function renderWhatIf() {
    var mount = qs("#whatif-bar");
    if (!mount) return;
    mount.innerHTML = "";
    var profile = S.getProfile();
    if (!profile.major || (!profile.showAllCountries && profile.countries.length === 0)) return;

    var baseline = (!profile.exams.ielts.notTaken && typeof profile.exams.ielts.value === "number")
      ? profile.exams.ielts.value : 6.0;
    var simValue = baseline;

    var display = el("span", { class: "whatif-value" }, ["IELTS: " + simValue.toFixed(1)]);
    var resultBox = el("div", { class: "whatif-result" });

    function recompute() {
      display.textContent = "IELTS: " + simValue.toFixed(1);
      var clonedProfile = JSON.parse(JSON.stringify(profile));
      clonedProfile.exams.ielts = { value: simValue, notTaken: false };
      var before = M.matchUniversities(profile);
      var after = M.matchUniversities(clonedProfile);
      var beforeMap = {};
      before.forEach(function (m) { beforeMap[m.university.id] = m.category; });
      var changed = [];
      after.forEach(function (m) {
        var prevCat = beforeMap[m.university.id];
        if (prevCat && prevCat !== m.category) changed.push({ name: m.university.name, from: prevCat, to: m.category });
      });

      resultBox.innerHTML = "";
      var delta = Math.round((simValue - baseline) * 10) / 10;
      var deltaText = delta === 0 ? "текущий балл" : (delta > 0 ? "+" + delta.toFixed(1) : String(delta.toFixed(1))) + " к текущему баллу";
      if (!changed.length) {
        resultBox.appendChild(el("p", { class: "muted", style: "margin:8px 0 0;" }, ["При " + deltaText + " категории вузов не меняются."]));
        return;
      }
      var labelMap = { match: "Match", reach: "Reach", safety: "Safety" };
      resultBox.appendChild(el("p", { style: "margin:8px 0 4px;font-weight:600;" }, ["Если IELTS будет " + simValue.toFixed(1) + " (" + deltaText + "):"]));
      var list = el("ul", { style: "margin:0;padding-left:18px;" });
      changed.forEach(function (c) {
        list.appendChild(el("li", {}, [c.name + ": " + labelMap[c.from] + " → " + labelMap[c.to]]));
      });
      resultBox.appendChild(list);
    }

    var minus = el("button", { type: "button", class: "btn btn--secondary btn--sm" }, ["−0.5"]);
    var plus = el("button", { type: "button", class: "btn btn--secondary btn--sm" }, ["+0.5"]);
    minus.addEventListener("click", function () { simValue = Math.max(0, Math.round((simValue - 0.5) * 10) / 10); recompute(); });
    plus.addEventListener("click", function () { simValue = Math.min(9, Math.round((simValue + 0.5) * 10) / 10); recompute(); });

    var card = el("div", { class: "card whatif-card" }, [
      el("div", { class: "field-label" }, ["Мини-симулятор «Что если»"]),
      el("p", { class: "muted", style: "margin-top:-6px;" }, ["Не сохраняет значение в профиль — только показывает, как изменились бы категории вузов."]),
      el("div", { class: "whatif-row" }, [minus, display, plus]),
      resultBox
    ]);
    mount.appendChild(card);
    recompute();
  }

  function render() {
    renderFilterBar();
    renderWhatIf();
    var root = qs("#recommendations-root");
    root.innerHTML = "";
    var profile = S.getProfile();

    if (!profile.major) {
      C.emptyState(root, {
        icon: "🎯",
        title: "Сначала выберите специальность",
        text: "Рекомендации строятся от специальности и страны — вернитесь в профиль, чтобы их указать.",
        actionLabel: "К профилю",
        actionHref: "profile.html"
      });
      return;
    }
    if (!profile.showAllCountries && profile.countries.length === 0) {
      C.emptyState(root, {
        icon: "🌍",
        title: "Выберите хотя бы одну страну",
        text: "Или включите «Все страны» в фильтрах выше, чтобы увидеть вузы без ограничения по стране.",
        actionLabel: "К профилю",
        actionHref: "profile.html"
      });
      return;
    }

    var matches = M.matchUniversities(profile);
    if (matches.length === 0) {
      var block = el("div", { class: "empty-state" }, [
        el("div", { class: "empty-state__icon" }, ["🔍"]),
        el("h3", {}, ["Пока нет точных совпадений"]),
        el("p", {}, ["Попробуйте изменить страну или специальность в фильтрах выше."]),
        el("div", { class: "flex gap-1", style: "justify-content:center;flex-wrap:wrap;" }, [
          el("a", { class: "btn btn--primary", href: "profile.html?step=3" }, ["Изменить страны"]),
          el("a", { class: "btn btn--secondary", href: "profile.html?step=2" }, ["Изменить специальность"])
        ])
      ]);
      root.appendChild(block);
      return;
    }

    var strength = M.portfolioStrength(profile);
    var examsSummary = M.examsTakenSummary(profile);
    if (strength.filled === 0 && examsSummary.count === 0) {
      root.appendChild(
        el("div", { class: "card", style: "margin-bottom:20px;border-color:var(--aurora-violet);" }, [
          el("div", { class: "flex items-center justify-between gap-2", style: "flex-wrap:wrap;" }, [
            el("p", { style: "margin:0;" }, ["Профиль заполнен по минимуму — с экзаменами и достижениями объяснения «почему подходит» станут заметно точнее."]),
            el("a", { class: "btn btn--secondary btn--sm", href: "profile.html?step=4" }, ["Дополнить профиль"])
          ])
        ])
      );
    }

    var byCategory = { match: [], reach: [], safety: [] };
    matches.forEach(function (m) { byCategory[m.category].push(m); });

    CATEGORY_ORDER.forEach(function (cat) {
      var list = byCategory[cat];
      root.appendChild(
        el("div", { class: "flex items-center gap-1", style: "margin:28px 0 6px;" }, [
          el("span", { class: "badge badge--" + cat }, [CATEGORY_LABEL[cat]]),
          el("span", { class: "muted", style: "font-size:0.85rem;" }, [CATEGORY_HINT[cat]])
        ])
      );
      if (list.length === 0) {
        root.appendChild(
          el("div", { class: "category-note" }, [
            "Нет вузов в категории " + CATEGORY_LABEL[cat] + " среди выбранных стран — попробуйте добавить ещё одну страну."
          ])
        );
        return;
      }
      var grid = el("div", { class: "uni-grid" });
      list.forEach(function (m) { grid.appendChild(renderUniCard(m, render)); });
      root.appendChild(grid);
    });

    root.appendChild(
      el("div", { class: "step-actions", style: "margin-top:32px;" }, [
        el("a", { class: "btn btn--secondary", href: "diagnosis.html" }, ["← К диагностике"]),
        el("a", { class: "btn btn--primary", href: "compare.html" }, ["Перейти к сравнению"])
      ])
    );
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.recommendations = { init: render, renderUniCard: renderUniCard };
})(window);
