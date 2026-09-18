/* Uniora — экран «Сравнение»: до 3 вузов, таблица на десктопе / карточки на мобильном. */
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

  function reqText(v) {
    if (v === null || v === undefined) return t("compare.notPublished");
    var resolved = tf(v);
    return typeof resolved === "string" ? resolved : String(resolved);
  }

  function boolText(v) { return v ? t("compare.required") : t("compare.notRequired"); }

  function rowsFor(uni, profile) {
    var evaluation = M.evaluateUniversity(uni, profile);
    var categoryLabel = { match: "Match", reach: "Reach", safety: "Safety" }[evaluation.category];

    return [
      { label: t("compare.cityCountry"), value: tf(uni.city) + ", " + C.countryLabel(uni.country) },
      { label: t("compare.program"), value: uni.majors.map(C.majorLabel).join(", ") },
      { label: t("compare.acceptanceRate"), value: Math.round(uni.acceptanceRate * 100) + "%" },
      { label: t("compare.profileMatch"), value: evaluation.matchPercent + "% · " + categoryLabel },
      { label: t("compare.deadlineEarly"), value: uni.deadlineEarly ? tf(uni.deadlineEarly) : t("compare.noSeparateRound") },
      { label: t("compare.deadlineMain"), value: tf(uni.deadlineMain) + " · " + t("compare.lastCycleData") },
      { label: t("compare.reqIelts"), value: reqText(uni.ielts) },
      { label: t("compare.reqToefl"), value: reqText(uni.toefl) },
      { label: t("compare.reqSat"), value: reqText(uni.sat) },
      { label: t("compare.scholarship"), value: uni.scholarship ? tf(uni.scholarship) : t("compare.noData") },
      { label: t("compare.dormitory"), value: uni.dormitory ? tf(uni.dormitory) : t("compare.noData") },
      { label: t("compare.ranking"), value: t("compare.rankingValue", { country: uni.rankingCountry, world: uni.rankingWorld }) },
      { label: t("compare.essay"), value: boolText(uni.essay) },
      { label: t("compare.recommendationLetters"), value: tf(uni.recommendationLetters) },
      { label: t("compare.website"), value: uni.website, isLink: true }
    ];
  }

  function removeBtn(uniId) {
    var btn = el("button", { type: "button", class: "btn btn--ghost btn--sm" }, [t("compare.remove")]);
    btn.addEventListener("click", function () { S.removeFromCompare(uniId); render(); });
    return btn;
  }

  function targetBtn(uniId) {
    var isTarget = S.getProfile().targetUniversityId === uniId;
    var btn = el("button", { type: "button", class: "btn btn--sm " + (isTarget ? "btn--primary" : "btn--secondary") }, [isTarget ? t("compare.isTarget") : t("compare.makeTarget")]);
    btn.addEventListener("click", function () {
      S.updateProfile({ targetUniversityId: isTarget ? null : uniId });
      C.toast(isTarget ? t("compare.targetRemoved") : t("compare.targetSet"));
      render();
    });
    return btn;
  }

  function renderTable(root, unis, profile) {
    var table = el("table", { class: "compare-table" });
    var headRow = el("tr", {}, [el("th", {}, [t("compare.parameter")])]);
    unis.forEach(function (u) {
      headRow.appendChild(el("th", {}, [el("div", {}, [u.name]), el("div", { class: "flex gap-1", style: "margin-top:6px;" }, [targetBtn(u.id), removeBtn(u.id)])]));
    });
    var thead = el("thead", {}, [headRow]);
    table.appendChild(thead);

    var rowsPerUni = unis.map(function (u) { return rowsFor(u, profile); });
    var labelRows = rowsPerUni[0].map(function (r) { return r.label; });
    var tbody = el("tbody");
    labelRows.forEach(function (label, i) {
      var tr = el("tr", {}, [el("td", { class: "row-label" }, [label])]);
      rowsPerUni.forEach(function (rows) {
        var r = rows[i];
        tr.appendChild(el("td", {}, [r.isLink ? el("a", { href: r.value, target: "_blank", rel: "noopener" }, [t("compare.openSite")]) : r.value]));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    root.appendChild(table);
  }

  function renderCards(root, unis, profile) {
    var wrap = el("div", { class: "compare-cards" });
    unis.forEach(function (u) {
      var card = el("div", { class: "card compare-card-item" }, [
        el("div", { class: "flex items-center justify-between" }, [el("h3", { style: "margin:0;" }, [u.name]), el("div", { class: "flex gap-1" }, [targetBtn(u.id), removeBtn(u.id)])])
      ]);
      rowsFor(u, profile).forEach(function (r) {
        card.appendChild(
          el("div", { class: "compare-card-item__row" }, [
            el("span", { class: "compare-card-item__row-label" }, [r.label]),
            el("span", {}, [r.isLink ? el("a", { href: r.value, target: "_blank", rel: "noopener" }, [t("compare.openSiteShort")]) : r.value])
          ])
        );
      });
      wrap.appendChild(card);
    });
    root.appendChild(wrap);
  }

  function render() {
    var root = qs("#compare-root");
    root.innerHTML = "";
    var ids = S.getCompare();
    var unis = ids.map(function (id) { return D.UNIVERSITIES.filter(function (u) { return u.id === id; })[0]; }).filter(Boolean);
    var profile = S.getProfile();

    if (unis.length === 0) {
      C.emptyState(root, {
        icon: "⚖️",
        title: t("compare.emptyTitle"),
        text: t("compare.emptyText"),
        actionLabel: t("compare.toRecommendations"),
        actionHref: "recommendations.html"
      });
      return;
    }

    if (unis.length === 1) {
      root.appendChild(
        el("div", { class: "card", style: "margin-bottom:20px;" }, [
          el("p", { style: "margin-bottom:12px;" }, [t("compare.addOneMore")]),
          el("a", { class: "btn btn--primary", href: "recommendations.html" }, [t("compare.addAnother")])
        ])
      );
      renderCards(root, unis, profile);
      var mobileOnly = root.lastChild;
      mobileOnly.style.display = "flex";
      return;
    }

    renderTable(root, unis, profile);
    renderCards(root, unis, profile);

    root.appendChild(
      el("div", { class: "step-actions", style: "margin-top:28px;" }, [
        el("a", { class: "btn btn--secondary", href: "recommendations.html" }, [t("compare.toRecommendationsBack")]),
        el("a", { class: "btn btn--primary", href: "roadmap.html" }, [t("compare.toRoadmap")])
      ])
    );
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.compare = { init: render };
})(window);
