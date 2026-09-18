/* Uniora — экран «Сравнение»: до 3 вузов, таблица на десктопе / карточки на мобильном. */
(function (global) {
  "use strict";

  var C = global.Uniora.common;
  var S = global.Uniora.state;
  var M = global.Uniora.match;
  var D = global.Uniora.data;
  var el = C.el;
  var qs = C.qs;

  function reqText(v) {
    if (v === null || v === undefined) return "Не публикуется в источнике";
    if (typeof v === "string") return v;
    return String(v);
  }

  function boolText(v) { return v ? "Требуется" : "Не требуется"; }

  function rowsFor(uni, profile) {
    var evaluation = M.evaluateUniversity(uni, profile);

    return [
      { label: "Город / страна", value: uni.city + ", " + C.countryLabel(uni.country) },
      { label: "Программа", value: uni.majors.map(C.majorLabel).join(", ") },
      { label: "Проходимость (прошлый цикл, ориентировочно)", value: Math.round(uni.acceptanceRate * 100) + "%" },
      { label: "Совпадение с профилем", value: evaluation.matchPercent + "% · " + { match: "Match", reach: "Reach", safety: "Safety" }[evaluation.category] },
      { label: "Дедлайн ранний", value: uni.deadlineEarly || "Нет отдельного раунда" },
      { label: "Дедлайн основной", value: uni.deadlineMain + " · данные прошлого цикла" },
      { label: "Требование IELTS", value: reqText(uni.ielts) },
      { label: "Требование TOEFL", value: reqText(uni.toefl) },
      { label: "Требование SAT", value: reqText(uni.sat) },
      { label: "Стипендия", value: uni.scholarship || "Нет данных" },
      { label: "Общежитие", value: uni.dormitory || "Нет данных" },
      { label: "Рейтинг", value: "#" + uni.rankingCountry + " в стране / #" + uni.rankingWorld + " в мире (ориентировочно)" },
      { label: "Эссе", value: boolText(uni.essay) },
      { label: "Рекомендательные письма", value: uni.recommendationLetters },
      { label: "Сайт", value: uni.website, isLink: true }
    ];
  }

  function removeBtn(uniId) {
    var btn = el("button", { type: "button", class: "btn btn--ghost btn--sm" }, ["Убрать"]);
    btn.addEventListener("click", function () { S.removeFromCompare(uniId); render(); });
    return btn;
  }

  function targetBtn(uniId) {
    var isTarget = S.getProfile().targetUniversityId === uniId;
    var btn = el("button", { type: "button", class: "btn btn--sm " + (isTarget ? "btn--primary" : "btn--secondary") }, [isTarget ? "🎯 Цель" : "Сделать целью"]);
    btn.addEventListener("click", function () {
      S.updateProfile({ targetUniversityId: isTarget ? null : uniId });
      C.toast(isTarget ? "Цель снята" : "Эта цель теперь ведёт ваш Roadmap");
      render();
    });
    return btn;
  }

  function renderTable(root, unis, profile) {
    var table = el("table", { class: "compare-table" });
    var headRow = el("tr", {}, [el("th", {}, ["Параметр"])]);
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
        tr.appendChild(el("td", {}, [r.isLink ? el("a", { href: r.value, target: "_blank", rel: "noopener" }, ["Открыть сайт →"]) : r.value]));
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
            el("span", {}, [r.isLink ? el("a", { href: r.value, target: "_blank", rel: "noopener" }, ["Сайт →"]) : r.value])
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
        title: "Пока нечего сравнивать",
        text: "Добавьте вузы в сравнение на странице рекомендаций — кнопкой «В сравнение» на карточке.",
        actionLabel: "К рекомендациям",
        actionHref: "recommendations.html"
      });
      return;
    }

    if (unis.length === 1) {
      root.appendChild(
        el("div", { class: "card", style: "margin-bottom:20px;" }, [
          el("p", { style: "margin-bottom:12px;" }, ["Добавьте ещё хотя бы один вуз, чтобы увидеть сравнение рядом."]),
          el("a", { class: "btn btn--primary", href: "recommendations.html" }, ["Добавить ещё вуз"])
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
        el("a", { class: "btn btn--secondary", href: "recommendations.html" }, ["← К рекомендациям"]),
        el("a", { class: "btn btn--primary", href: "roadmap.html" }, ["Перейти к Roadmap"])
      ])
    );
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.compare = { init: render };
})(window);
