/* Uniora — экран «Рекомендации»: вузы по категориям Match / Reach / Safety. */
(function (global) {
  "use strict";

  var C = global.Uniora.common;
  var S = global.Uniora.state;
  var M = global.Uniora.match;
  var D = global.Uniora.data;
  var I = global.Uniora.i18n;
  var el = C.el;
  var qs = C.qs;
  var t = I.t;
  var tf = I.tf;

  var CATEGORY_ORDER = ["match", "reach", "safety"];
  var CATEGORY_LABEL = { match: "Match", reach: "Reach", safety: "Safety" };
  function categoryHint(cat) {
    if (cat === "match") return t("recommendations.categoryHintMatch");
    if (cat === "reach") return t("recommendations.categoryHintReach");
    return t("recommendations.categoryHintSafety");
  }

  function renderFilterBar() {
    var mount = qs("#filter-bar");
    mount.innerHTML = "";
    var profile = S.getProfile();
    var bar = el("div", { class: "filter-bar" });

    D.MAJORS.forEach(function (m) {
      var selected = profile.majors.indexOf(m.id) !== -1;
      var chip = el("button", { type: "button", class: "chip" + (selected ? " chip--selected" : "") }, [m.icon + " " + tf(m.label)]);
      chip.addEventListener("click", function () {
        var list = profile.majors.slice();
        var idx = list.indexOf(m.id);
        if (idx >= 0) list.splice(idx, 1); else list.push(m.id);
        S.updateProfile({ majors: list, majorsFromQuiz: false });
        render();
      });
      bar.appendChild(chip);
    });

    bar.appendChild(el("span", { style: "width:1px;background:rgba(20,22,43,0.1);align-self:stretch;" }));

    D.COUNTRIES.forEach(function (c) {
      var selected = profile.countries.indexOf(c.id) !== -1;
      var chip = el("button", {
        type: "button",
        class: "chip" + (selected && !profile.showAllCountries ? " chip--selected" : ""),
        style: profile.showAllCountries ? "opacity:0.5;" : ""
      }, [C.countryFlagImg(c.id), tf(c.label)]);
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

    var allChip = el("button", { type: "button", class: "chip" + (profile.showAllCountries ? " chip--selected" : "") }, [t("recommendations.allCountriesChip")]);
    allChip.addEventListener("click", function () { S.updateProfile({ showAllCountries: !profile.showAllCountries }); render(); });
    bar.appendChild(allChip);

    bar.appendChild(el("a", { class: "btn btn--ghost btn--sm", href: "profile.html?step=5" }, [t("recommendations.changeExams")]));

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
    var isTarget = S.getProfile().targetUniversityId === uni.id;

    var factRows = match.reasons.map(function (f) {
      return el("div", { class: factRowClass(f.tone) }, [el("span", { class: "fact-row__dot" }), el("span", {}, [f.text])]);
    });

    var deadlineParts = [];
    if (uni.deadlineEarly) deadlineParts.push(t("recommendations.early") + " " + tf(uni.deadlineEarly));
    deadlineParts.push(t("recommendations.main") + " " + tf(uni.deadlineMain));

    var card = el("div", { class: "card uni-card" }, [
      el("div", { class: "uni-card__top" }, [
        el("div", {}, [
          el("div", { class: "uni-card__name" }, [uni.name, isTarget ? el("span", { class: "badge badge--target" }, [t("recommendations.target")]) : null]),
          el("div", { class: "uni-card__place" }, [C.countryFlagImg(uni.country), tf(uni.city) + ", " + C.countryLabel(uni.country)])
        ]),
        el("div", { class: "flex-col", style: "align-items:flex-end;gap:4px;" }, [
          el("span", { class: "badge badge--" + match.category }, [CATEGORY_LABEL[match.category]]),
          el("span", { class: "match-percent" }, [match.matchPercent + t("recommendations.matchPercentSuffix")])
        ])
      ]),
      el("div", { class: "uni-card__facts" }, factRows),
      el("div", { class: "uni-card__facts", style: "border-top:1px solid rgba(20,22,43,0.06);padding-top:8px;" }, [
        el("div", {}, ["📅 " + deadlineParts.join(" · ") + " " + t("recommendations.deadlineNote")]),
        el("div", {}, ["🏆 " + t("recommendations.ranking", { country: uni.rankingCountry, world: uni.rankingWorld })]),
        el("div", {}, ["🎓 " + t("recommendations.scholarship") + " " + (uni.scholarship ? tf(uni.scholarship) : t("compare.noData"))]),
        el("div", {}, ["🏠 " + t("recommendations.dormitory") + " " + tf(uni.dormitory)]),
        uni.comment ? el("div", { class: "muted" }, ["ⓘ " + tf(uni.comment)]) : null
      ]),
      el("div", { class: "uni-card__actions" }, [
        (function () {
          var btn = el("button", { type: "button", class: "btn " + (inCompare ? "btn--primary" : "btn--secondary") }, [inCompare ? t("recommendations.inCompareYes") : t("recommendations.inCompareNo")]);
          btn.addEventListener("click", function () {
            var res = S.toggleCompare(uni.id);
            if (!res.ok && res.reason === "max") { C.toast(t("recommendations.compareMax")); return; }
            C.toast(res.list.indexOf(uni.id) !== -1 ? t("recommendations.addedToCompare") : t("recommendations.removedFromCompare"));
            onChange();
          });
          return btn;
        })(),
        opts.favoritesContext
          ? (function () {
              var favBtn = el("button", { type: "button", class: "btn btn--sm btn--secondary" }, [t("recommendations.removeFromFavorites")]);
              favBtn.addEventListener("click", function () { S.toggleFavorite(uni.id); C.toast(t("recommendations.removedFromFavorites")); onChange(); });
              return favBtn;
            })()
          : (function () {
              var favBtn = el("button", { type: "button", class: "fav-btn" + (isFav ? " fav-btn--active" : ""), title: t("recommendations.addToFavorites") }, [isFav ? "♥" : "♡"]);
              favBtn.addEventListener("click", function () { S.toggleFavorite(uni.id); onChange(); });
              return favBtn;
            })(),
        el("a", { class: "btn btn--ghost", href: uni.website, target: "_blank", rel: "noopener" }, [t("recommendations.site")]),
        (function () {
          var targetBtn = el("button", { type: "button", class: "btn btn--sm " + (isTarget ? "btn--primary" : "btn--secondary") }, [isTarget ? t("recommendations.target") : t("recommendations.makeTarget")]);
          targetBtn.addEventListener("click", function () {
            S.updateProfile({ targetUniversityId: isTarget ? null : uni.id });
            C.toast(isTarget ? t("recommendations.targetRemoved") : t("recommendations.targetSet"));
            onChange();
          });
          return targetBtn;
        })()
      ])
    ]);
    return card;
  }

  // --- Симулятор «Что если»: пересчитывает matchUniversities с подменёнными
  // профильными баллами, не сохраняя их в реальный профиль ---
  var WHATIF_EXAMS = [
    { key: "ielts", label: "IELTS", min: 0, max: 9, step: 0.5, decimals: 1, fallback: 6 },
    { key: "toefl", label: "TOEFL", min: 0, max: 120, step: 1, decimals: 0, fallback: 80 },
    { key: "sat", label: "SAT", min: 400, max: 1600, step: 10, decimals: 0, fallback: 1000 }
  ];

  function renderWhatIf() {
    var mount = qs("#whatif-bar");
    if (!mount) return;
    mount.innerHTML = "";
    var profile = S.getProfile();
    if (!profile.majors.length || (!profile.showAllCountries && profile.countries.length === 0)) return;

    var simValues = {};
    WHATIF_EXAMS.forEach(function (ex) {
      var current = profile.exams[ex.key];
      simValues[ex.key] = (current && !current.notTaken && typeof current.value === "number") ? current.value : ex.fallback;
    });

    var resultBox = el("div", { class: "whatif-result" });
    var sliderRows = [];

    function recompute() {
      var clonedProfile = JSON.parse(JSON.stringify(profile));
      WHATIF_EXAMS.forEach(function (ex) {
        clonedProfile.exams[ex.key] = { value: simValues[ex.key], notTaken: false };
      });
      var before = M.matchUniversities(profile);
      var after = M.matchUniversities(clonedProfile);
      var beforeMap = {};
      before.forEach(function (m) { beforeMap[m.university.id] = m; });

      resultBox.innerHTML = "";
      if (!after.length) {
        resultBox.appendChild(el("p", { class: "muted", style: "margin:8px 0 0;" }, [t("recommendations.whatIfNoUnis")]));
        return;
      }
      var labelMap = { match: "Match", reach: "Reach", safety: "Safety" };

      var changes = [];
      after.forEach(function (m) {
        var prev = beforeMap[m.university.id];
        if (prev && prev.category !== m.category) {
          changes.push({ name: m.university.name, from: prev.category, to: m.category });
        }
      });

      if (!changes.length) {
        resultBox.appendChild(el("p", { class: "muted", style: "margin:8px 0 0;" }, [t("recommendations.whatIfNoChange")]));
        return;
      }

      var groups = {};
      var order = [];
      changes.forEach(function (c) {
        var key = c.from + "→" + c.to;
        if (!groups[key]) { groups[key] = { from: c.from, to: c.to, names: [] }; order.push(key); }
        groups[key].names.push(c.name);
      });

      var list = el("div", { class: "whatif-list" });
      order.forEach(function (key) {
        var g = groups[key];
        var n = g.names.length;
        var verb = n === 1 ? t("recommendations.moveTo") : t("recommendations.moveToPlural");
        list.appendChild(
          el("div", { class: "whatif-row-item" }, [
            el("span", { class: "whatif-row-item__change" }, [
              n + " " + I.uniWord(n) + " " + verb + " " + t("recommendations.uniFrom") + " " + labelMap[g.from] + " " + t("recommendations.uniTo") + " " + labelMap[g.to]
            ]),
            el("span", { class: "whatif-row-item__names" }, [g.names.join(", ")])
          ])
        );
      });
      resultBox.appendChild(list);
    }

    var sliders = el("div", { class: "whatif-sliders" });
    WHATIF_EXAMS.forEach(function (ex) {
      var fmt = function (v) { return ex.decimals > 0 ? v.toFixed(ex.decimals) : String(Math.round(v)); };
      var display = el("span", { class: "whatif-value" }, [ex.label + ": " + fmt(simValues[ex.key])]);
      var range = el("input", { type: "range", min: String(ex.min), max: String(ex.max), step: String(ex.step), value: String(simValues[ex.key]) });
      range.addEventListener("input", function () {
        simValues[ex.key] = parseFloat(range.value);
        display.textContent = ex.label + ": " + fmt(simValues[ex.key]);
        recompute();
      });
      sliders.appendChild(el("div", { class: "whatif-slider-row" }, [display, range]));
      sliderRows.push(range);
    });

    var card = el("div", { class: "card whatif-card" }, [
      el("div", { class: "field-label" }, [t("recommendations.whatIfTitle")]),
      el("p", { class: "muted", style: "margin-top:-6px;" }, [t("recommendations.whatIfSubtitle")]),
      sliders,
      resultBox,
      el("p", { class: "muted", style: "margin-top:10px;font-size:0.78rem;" }, [t("recommendations.whatIfDisclaimer")])
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

    if (!profile.majors.length) {
      C.emptyState(root, {
        icon: "🎯",
        title: t("recommendations.emptyMajorTitle"),
        text: t("recommendations.emptyMajorText"),
        actionLabel: t("recommendations.toProfile"),
        actionHref: "profile.html"
      });
      return;
    }
    if (!profile.showAllCountries && profile.countries.length === 0) {
      C.emptyState(root, {
        icon: "🌍",
        title: t("recommendations.emptyCountryTitle"),
        text: t("recommendations.emptyCountryText"),
        actionLabel: t("recommendations.toProfile"),
        actionHref: "profile.html"
      });
      return;
    }

    var matches = M.matchUniversities(profile);
    if (matches.length === 0) {
      var block = el("div", { class: "empty-state" }, [
        el("div", { class: "empty-state__icon" }, ["🔍"]),
        el("h3", {}, [t("recommendations.noMatchesTitle")]),
        el("p", {}, [t("recommendations.noMatchesText")]),
        el("div", { class: "flex gap-1", style: "justify-content:center;flex-wrap:wrap;" }, [
          el("a", { class: "btn btn--primary", href: "profile.html?step=3" }, [t("recommendations.changeCountries")]),
          el("a", { class: "btn btn--secondary", href: "profile.html?step=2" }, [t("recommendations.changeMajor")])
        ])
      ]);
      root.appendChild(block);
      return;
    }

    var exSummary = M.examsTakenSummary(profile);
    var achCount = C.totalAchievementCount(profile.achievements, D.ACHIEVEMENT_CATEGORIES, D.CUSTOM_ACHIEVEMENT_CATEGORY.key);
    if (achCount === 0 && exSummary.count === 0) {
      root.appendChild(
        el("div", { class: "card", style: "margin-bottom:20px;border-color:var(--aurora-violet);" }, [
          el("div", { class: "flex items-center justify-between gap-2", style: "flex-wrap:wrap;" }, [
            el("p", { style: "margin:0;" }, [t("recommendations.minimalProfileBanner")]),
            el("a", { class: "btn btn--secondary btn--sm", href: "profile.html?step=4" }, [t("recommendations.completeProfile")])
          ])
        ])
      );
    }

    var byCategory = { match: [], reach: [], safety: [] };
    matches.forEach(function (m) { byCategory[m.category].push(m); });
    CATEGORY_ORDER.forEach(function (cat) { byCategory[cat].sort(function (a, b) { return b.matchPercent - a.matchPercent; }); });

    root.appendChild(el("h3", {}, [t("recommendations.mapTitle")]));
    var countsRow = el("div", { class: "flex gap-2", style: "margin-bottom:16px;flex-wrap:wrap;" }, CATEGORY_ORDER.map(function (cat) {
      return el("span", { class: "badge badge--" + cat }, [byCategory[cat].length + " " + CATEGORY_LABEL[cat]]);
    }));
    root.appendChild(countsRow);

    CATEGORY_ORDER.forEach(function (cat) {
      var list = byCategory[cat];
      root.appendChild(
        el("div", { class: "flex items-center gap-1", style: "margin:28px 0 6px;" }, [
          el("span", { class: "badge badge--" + cat }, [CATEGORY_LABEL[cat]]),
          el("span", { class: "muted", style: "font-size:0.85rem;" }, [categoryHint(cat)])
        ])
      );
      if (list.length === 0) {
        root.appendChild(el("div", { class: "category-note" }, [t("recommendations.noneInCategory", { cat: CATEGORY_LABEL[cat] })]));
        return;
      }
      var grid = el("div", { class: "uni-grid" });
      list.forEach(function (m) { grid.appendChild(renderUniCard(m, render)); });
      root.appendChild(grid);
    });

    root.appendChild(
      el("div", { class: "step-actions", style: "margin-top:32px;" }, [
        el("a", { class: "btn btn--secondary", href: "diagnosis.html" }, [t("recommendations.toDiagnosis")]),
        el("a", { class: "btn btn--primary", href: "compare.html" }, [t("recommendations.toCompare")])
      ])
    );
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.recommendations = { init: render, renderUniCard: renderUniCard };
})(window);
