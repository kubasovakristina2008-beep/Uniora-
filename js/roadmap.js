/* Uniora — экран «Roadmap»: карта-созвездие с пробелами, мероприятиями и своими пунктами. */
(function (global) {
  "use strict";

  var C = global.Uniora.common;
  var S = global.Uniora.state;
  var M = global.Uniora.match;
  var D = global.Uniora.data;
  var el = C.el;
  var qs = C.qs;

  var WEIGHT_LABEL = { high: "Высокий", medium: "Средний", low: "Низкий" };
  var activePriorityCountry = null;
  var starRefs = {}; // id -> { button, mark, star }
  var stopStarfield = null;
  var viewMode = "constellation"; // "constellation" | "list" — не персистится между сессиями

  var DOCUMENT_ITEMS = [
    { key: "motivationLetter", label: "Мотивационное письмо" },
    { key: "essay", label: "Эссе" },
    { key: "recommendationLetters", label: "Рекомендательные письма" },
    { key: "transcript", label: "Переведённый и заверенный транскрипт" },
    { key: "languageCertificate", label: "Языковой сертификат (IELTS/TOEFL и т.п.)" },
    { key: "portfolio", label: "Портфолио работ", onlyMajor: "arts" }
  ];

  // ---------------- Синхронизация звёзд-пробелов ----------------
  function syncGapStars(profile) {
    var gapsInfo = M.computeGaps(profile);
    var currentGapIds = gapsInfo.gaps.map(function (g) { return g.id; });
    var strengthCategories = gapsInfo.strengths.map(function (s) { return s.category; });
    var list = S.getRoadmap();

    gapsInfo.gaps.forEach(function (g) {
      var exists = list.some(function (s) { return s.id === g.id; });
      if (!exists) {
        S.upsertRoadmapStar({
          id: g.id, type: "gap", title: g.categoryLabel, description: g.nextStep,
          category: g.category, weight: g.weight, status: "todo", deadline: null
        });
      }
    });

    list = S.getRoadmap();
    list.filter(function (s) { return s.type === "gap"; }).forEach(function (s) {
      if (s.status === "done") return;
      if (strengthCategories.indexOf(s.category) !== -1) {
        S.setStarStatus(s.id, "done");
      } else if (currentGapIds.indexOf(s.id) === -1) {
        S.removeRoadmapStar(s.id);
      }
    });
  }

  // ---------------- Приоритеты по странам ----------------
  function renderPriorityPanel(container, profile) {
    var countries = profile.showAllCountries ? D.COUNTRIES.map(function (c) { return c.id; }) : profile.countries;
    if (!countries.length) return;
    activePriorityCountry = activePriorityCountry && countries.indexOf(activePriorityCountry) !== -1 ? activePriorityCountry : countries[0];

    var panel = el("div", { class: "priority-panel" });
    var body = el("div", { class: "priority-panel__body" });
    var header = el("button", { type: "button", class: "priority-panel__header" }, [
      el("span", {}, ["🧭 Что ценится при поступлении"]),
      el("span", {}, ["▾"])
    ]);
    header.addEventListener("click", function () { panel.classList.toggle("priority-panel--open"); });

    function renderBody() {
      body.innerHTML = "";
      var tabs = el("div", { class: "priority-tabs" });
      countries.forEach(function (cid) {
        var tab = el("button", {
          type: "button",
          class: "priority-tab" + (cid === activePriorityCountry ? " priority-tab--active" : "")
        }, [C.countryFlag(cid) + " " + C.countryLabel(cid)]);
        tab.addEventListener("click", function () { activePriorityCountry = cid; renderBody(); });
        tabs.appendChild(tab);
      });
      body.appendChild(tabs);

      var priorities = D.PRIORITIES[activePriorityCountry];
      Object.keys(D.CATEGORY_LABELS).forEach(function (cat) {
        var p = priorities[cat];
        body.appendChild(
          el("div", { class: "priority-row" }, [
            el("div", {}, [
              el("div", { class: "priority-row__label" }, [D.CATEGORY_LABELS[cat]]),
              el("div", { class: "priority-row__note" }, [p.note])
            ]),
            el("span", { class: "badge badge--weight-" + p.level }, [WEIGHT_LABEL[p.level]])
          ])
        );
      });
      body.appendChild(el("div", { class: "disclaimer", style: "margin-top:12px;" }, [D.PRIORITY_METHOD_DISCLAIMER]));
    }
    renderBody();

    panel.appendChild(header);
    panel.appendChild(body);
    container.appendChild(panel);
  }

  // ---------------- Расположение звёзд (созвездие) ----------------
  function orderStars(list) {
    var weightRank = { high: 0, medium: 1, low: 2 };
    var gaps = list.filter(function (s) { return s.type === "gap"; })
      .sort(function (a, b) { return (weightRank[a.weight] || 3) - (weightRank[b.weight] || 3); });
    var events = list.filter(function (s) { return s.type === "event"; });
    var customs = list.filter(function (s) { return s.type === "custom"; });
    return gaps.concat(events, customs);
  }

  function computePositions(count) {
    var positions = [];
    for (var i = 0; i < count; i++) {
      var t = count <= 1 ? 0 : i / (count - 1);
      var y = 90 - t * 80;
      var side = i % 2 === 0 ? -1 : 1;
      var amplitude = 16 + Math.random() * 12;
      var jitter = (Math.random() - 0.5) * 8;
      var x = 50 + side * amplitude + jitter;
      x = Math.max(14, Math.min(86, x));
      positions.push({ x: x, y: y });
    }
    return positions;
  }

  function findNextStarId(orderedStars) {
    for (var i = 0; i < orderedStars.length; i++) {
      if (orderedStars[i].status !== "done") return orderedStars[i].id;
    }
    return null;
  }

  function starIcon(star) {
    if (star.type === "event") return "🏆";
    if (star.type === "custom") return "✎";
    return "✦";
  }

  function updateNextActionCard(orderedStars, nextId) {
    var mount = qs("#next-action-mount");
    if (!mount) return;
    mount.innerHTML = "";
    if (!orderedStars.length) return;
    if (!nextId) {
      mount.appendChild(
        el("div", { class: "next-action-card" }, [
          el("div", {}, [
            el("div", { class: "next-action-card__eyebrow" }, ["Все текущие шаги выполнены"]),
            el("div", { class: "next-action-card__title" }, ["Отличная работа — маршрут пройден"]),
            el("p", { class: "next-action-card__desc" }, ["Загляните в панель приоритетов ещё раз — возможно, стоит усилить что-то сверх минимума."])
          ])
        ])
      );
      return;
    }
    var star = orderedStars.filter(function (s) { return s.id === nextId; })[0];
    mount.appendChild(
      el("div", { class: "next-action-card" }, [
        el("div", {}, [
          el("div", { class: "next-action-card__eyebrow" }, ["Следующее действие"]),
          el("div", { class: "next-action-card__title" }, [starIcon(star) + " " + star.title]),
          el("p", { class: "next-action-card__desc" }, [star.description || "Отметьте выполненным, когда сделаете."])
        ]),
        el("button", { type: "button", class: "btn btn--dark", onclick: function () { toggleStar(star.id); } }, ["Отметить выполненным"])
      ])
    );
  }

  function toggleStar(id) {
    var list = S.getRoadmap();
    var star = list.filter(function (s) { return s.id === id; })[0];
    if (!star) return;
    var newStatus = star.status === "done" ? "todo" : "done";
    S.setStarStatus(id, newStatus);
    if (viewMode === "list") buildListView(qs("#constellation-mount"));
    else refreshStarVisuals();
  }

  function rebuildMount() {
    var mount = qs("#constellation-mount");
    if (!mount) return;
    if (viewMode === "list") buildListView(mount);
    else buildConstellation(mount);
  }

  function refreshStarVisuals() {
    var list = S.getRoadmap();
    var ordered = orderStars(list);
    var nextId = findNextStarId(ordered);
    ordered.forEach(function (s) {
      var ref = starRefs[s.id];
      if (!ref) return;
      var fresh = list.filter(function (x) { return x.id === s.id; })[0];
      ref.button.classList.remove("star-btn--done", "star-btn--next");
      if (fresh.status === "done") ref.button.classList.add("star-btn--done");
      else if (fresh.id === nextId) ref.button.classList.add("star-btn--next");
    });
    updateNextActionCard(ordered.map(function (s) { return list.filter(function (x) { return x.id === s.id; })[0]; }), nextId);
  }

  function buildConstellation(container) {
    container.innerHTML = "";
    starRefs = {};
    var list = S.getRoadmap();
    var ordered = orderStars(list);

    if (ordered.length === 0) {
      container.appendChild(
        el("div", { class: "constellation-wrap", style: "display:flex;align-items:center;justify-content:center;min-height:280px;" }, [
          el("p", { class: "muted", style: "max-width:360px;text-align:center;color:var(--lavender-faint);" }, [
            "Явных пробелов пока не видно. Добавьте своё мероприятие или пункт ниже, чтобы маршрут начал заполняться."
          ])
        ])
      );
      updateNextActionCard([], null);
      return;
    }

    var wrap = el("div", { class: "constellation-wrap" });
    var canvas = el("canvas", { class: "constellation-canvas" });
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "constellation-svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    var layer = el("div", { class: "constellation-layer" });

    wrap.appendChild(canvas);
    wrap.appendChild(svg);
    wrap.appendChild(layer);
    container.appendChild(wrap);

    if (stopStarfield) stopStarfield();
    stopStarfield = C.starField(canvas, { density: 0.00012 });

    var positions = computePositions(ordered.length);
    var nextId = findNextStarId(ordered);

    for (var i = 0; i < ordered.length - 1; i++) {
      var a = positions[i], b = positions[i + 1];
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
      svg.appendChild(line);
    }

    ordered.forEach(function (star, i) {
      var pos = positions[i];
      var mark = el("span", { class: "star-btn__mark" });
      var label = el("span", { class: "star-btn__label" }, [star.title]);
      var classes = "star-btn" + (star.type === "custom" ? " star-btn--custom" : "");
      if (star.status === "done") classes += " star-btn--done";
      else if (star.id === nextId) classes += " star-btn--next";
      var btn = el("button", {
        type: "button", class: classes,
        style: "left:" + pos.x + "%;top:" + pos.y + "%;",
        title: star.title + (star.description ? " — " + star.description : "")
      }, [mark, label]);
      btn.addEventListener("click", function () { toggleStar(star.id); });
      layer.appendChild(btn);
      starRefs[star.id] = { button: btn, mark: mark, star: star };
    });

    updateNextActionCard(ordered, nextId);
  }

  // ---------------- Вид «Список» ----------------
  function deadlineTime(star) {
    if (!star.deadline) return Infinity;
    var t = Date.parse(star.deadline);
    return isNaN(t) ? Infinity : t;
  }

  function orderForList(list) {
    var weightRank = { high: 0, medium: 1, low: 2 };
    return list.slice().sort(function (a, b) {
      if ((a.status === "done") !== (b.status === "done")) return a.status === "done" ? 1 : -1;
      var wa = weightRank[a.weight] !== undefined ? weightRank[a.weight] : 1.5;
      var wb = weightRank[b.weight] !== undefined ? weightRank[b.weight] : 1.5;
      if (wa !== wb) return wa - wb;
      return deadlineTime(a) - deadlineTime(b);
    });
  }

  function buildListView(container) {
    container.innerHTML = "";
    var list = S.getRoadmap();
    var ordered = orderStars(list); // порядок пути — источник истины для "ближайшего действия"
    var nextId = findNextStarId(ordered);

    if (!list.length) {
      container.appendChild(el("p", { class: "muted", style: "color:var(--lavender-faint);" }, [
        "Список пуст. Явных пробелов пока не видно — добавьте своё мероприятие или пункт ниже."
      ]));
      updateNextActionCard([], null);
      return;
    }

    var sorted = orderForList(list);
    var checklist = el("div", { class: "checklist" });
    sorted.forEach(function (star) {
      var isNext = star.id === nextId;
      var isDone = star.status === "done";
      var check = el("button", {
        type: "button",
        class: "checklist-check" + (isDone ? " is-checked" : ""),
        title: isDone ? "Вернуть в работу" : "Отметить выполненным"
      }, [isDone ? "✓" : ""]);
      check.addEventListener("click", function () { toggleStar(star.id); });

      var titleRow = el("div", { class: "checklist-title" }, [
        starIcon(star) + " " + star.title,
        star.weight ? el("span", { class: "badge badge--weight-" + star.weight }, [WEIGHT_LABEL[star.weight]]) : null
      ]);

      var sourceEvent = star.sourceId ? D.EVENTS.filter(function (e) { return e.id === star.sourceId; })[0] : null;

      checklist.appendChild(
        el("div", { class: "checklist-row" + (isDone ? " checklist-row--done" : "") + (isNext ? " checklist-row--next" : "") }, [
          check,
          el("div", { class: "checklist-body" }, [
            titleRow,
            star.description ? el("div", { class: "checklist-desc" }, [star.description]) : null,
            star.deadline ? el("div", { class: "checklist-deadline" }, ["Срок: " + star.deadline]) : null
          ]),
          sourceEvent ? el("a", { class: "btn btn--ghost btn--sm", href: sourceEvent.website, target: "_blank", rel: "noopener" }, ["Источник"]) : null
        ])
      );
    });
    container.appendChild(checklist);
    updateNextActionCard(ordered, nextId);
  }

  function renderViewToggle(container) {
    var wrap = el("div", { class: "view-toggle" });
    var tabs = [
      { id: "constellation", label: "✨ Созвездие" },
      { id: "list", label: "📋 Список" }
    ];
    var buttons = [];
    tabs.forEach(function (t) {
      var btn = el("button", {
        type: "button",
        class: "view-toggle__tab" + (viewMode === t.id ? " view-toggle__tab--active" : "")
      }, [t.label]);
      btn.addEventListener("click", function () {
        if (viewMode === t.id) return;
        viewMode = t.id;
        buttons.forEach(function (b, i) { b.classList.toggle("view-toggle__tab--active", tabs[i].id === viewMode); });
        rebuildMount();
      });
      buttons.push(btn);
      wrap.appendChild(btn);
    });
    container.appendChild(wrap);
  }

  // ---------------- Легенда ----------------
  function renderLegend(container) {
    container.appendChild(
      el("div", { class: "legend-row" }, [
        el("div", { class: "legend-row__item" }, [el("span", { class: "legend-dot", style: "background:rgba(244,241,255,0.35);" }), "Неактуальна / ожидает"]),
        el("div", { class: "legend-row__item" }, [el("span", { class: "legend-dot", style: "background:#fff;" }), "Ближайшее действие"]),
        el("div", { class: "legend-row__item" }, [el("span", { class: "legend-dot", style: "background:#fff;box-shadow:0 0 6px 2px rgba(108,92,231,0.6);" }), "Выполнено"]),
        el("div", { class: "legend-row__item" }, ["✎ — ваш собственный пункт"])
      ])
    );
  }

  // ---------------- Добавить свой пункт ----------------
  function renderAddCustomForm(container) {
    var form = el("div", { class: "card--dark card", style: "margin-bottom:var(--space-3);" }, [
      el("div", { class: "field-label", style: "color:var(--lavender);" }, ["Добавить свой пункт в маршрут"])
    ]);
    var row = el("div", { class: "add-custom-form" });
    var titleInput = el("input", { class: "text-input", type: "text", placeholder: "Например, собрать документы для визы" });
    var deadlineInput = el("input", { class: "text-input", type: "text", placeholder: "Срок (необязательно)", style: "max-width:200px;" });
    var addBtn = el("button", { type: "button", class: "btn btn--dark" }, ["Добавить"]);
    addBtn.addEventListener("click", function () {
      if (!titleInput.value.trim()) return;
      S.upsertRoadmapStar({
        id: C.uid("custom"), type: "custom", title: titleInput.value.trim(),
        description: deadlineInput.value.trim() ? "Срок: " + deadlineInput.value.trim() : "",
        status: "todo", deadline: deadlineInput.value.trim() || null
      });
      titleInput.value = ""; deadlineInput.value = "";
      rebuildMount();
      C.toast("Пункт добавлен в маршрут");
    });
    row.appendChild(titleInput); row.appendChild(deadlineInput); row.appendChild(addBtn);
    form.appendChild(row);
    container.appendChild(form);
  }

  // ---------------- Мероприятия ----------------
  function renderEvents(container, profile) {
    var events = D.EVENTS.filter(function (e) { return e.majors.indexOf(profile.major) !== -1; });
    if (!events.length) return;
    container.appendChild(el("h3", { style: "margin-top:var(--space-4);color:var(--lavender);" }, ["Мероприятия для вашей специальности"]));
    var grid = el("div", { class: "event-list" });
    var roadmapList = S.getRoadmap();

    events.forEach(function (ev) {
      var already = roadmapList.some(function (s) { return s.sourceId === ev.id; });
      var card = el("div", { class: "event-card" }, [
        el("div", { class: "event-card__title" }, [ev.name]),
        el("div", { class: "event-card__meta" }, [ev.type + " · " + ev.level + " · " + ev.format + " · " + ev.timing]),
        el("p", { style: "margin:0 0 8px;color:var(--lavender-soft);" }, [ev.whyBoost]),
        ev.limitation ? el("p", { class: "muted", style: "margin:0;font-size:0.76rem;" }, ["Ограничение: " + ev.limitation]) : null,
        el("div", { class: "event-card__actions" }, [
          el("a", { class: "btn btn--secondary btn--sm", href: ev.website, target: "_blank", rel: "noopener" }, ["Сайт"]),
          (function () {
            var btn = el("button", { type: "button", class: "btn btn--sm " + (already ? "btn--secondary" : "btn--dark") }, [already ? "Добавлено ✓" : "Добавить в мой маршрут"]);
            if (already) { btn.disabled = true; return btn; }
            btn.addEventListener("click", function () {
              window.open(ev.website, "_blank", "noopener");
              S.upsertRoadmapStar({
                id: C.uid("event"), type: "event", title: ev.name, description: "Запланировано: " + ev.whyBoost,
                status: "todo", deadline: null, sourceId: ev.id
              });
              rebuildMount();
              C.toast("Добавлено в маршрут как «Запланировано»");
              btn.disabled = true;
              btn.textContent = "Добавлено ✓";
              btn.classList.remove("btn--dark"); btn.classList.add("btn--secondary");
            });
            return btn;
          })()
        ])
      ]);
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  // ---------------- Чек-лист документов на подачу ----------------
  function renderDocumentsChecklist(container, profile) {
    var wrap = el("div", { class: "card card--dark", style: "margin-top:var(--space-3);" }, [
      el("div", { class: "field-label", style: "color:var(--lavender);" }, ["Чек-лист документов на подачу"]),
      el("p", { class: "muted", style: "color:var(--lavender-faint);margin-top:-4px;" }, [
        "Ваш личный список для сбора документов — не требование конкретного вуза, у каждого могут быть свои нюансы."
      ])
    ]);
    var list = el("div", { class: "doc-checklist" });
    DOCUMENT_ITEMS.forEach(function (item) {
      if (item.onlyMajor && profile.major !== item.onlyMajor) return;
      var checked = !!(profile.documents && profile.documents[item.key]);
      var cb = el("input", { type: "checkbox", checked: checked ? "checked" : null });
      cb.addEventListener("change", function () {
        var patch = { documents: {} };
        patch.documents[item.key] = cb.checked;
        S.updateProfile(patch);
      });
      var row = el("label", { class: "doc-checklist__row" }, [cb, el("span", {}, [item.label])]);
      list.appendChild(row);
    });
    wrap.appendChild(list);
    container.appendChild(wrap);
  }

  // ---------------- Скачать план (печать) ----------------
  function buildPrintPlan(profile) {
    var mount = qs("#print-plan");
    if (!mount) return;
    mount.innerHTML = "";
    var list = S.getRoadmap();
    var ordered = orderForList(list);
    var nextId = findNextStarId(orderStars(list));

    mount.appendChild(el("h1", {}, ["Мой маршрут поступления — Uniora"]));
    var countriesText = profile.showAllCountries ? "все страны" : (profile.countries || []).map(C.countryLabel).join(", ");
    mount.appendChild(el("p", {}, ["Специальность: " + C.majorLabel(profile.major) + " · Страны: " + countriesText]));
    mount.appendChild(el("p", {}, ["Сформировано: " + new Date().toLocaleDateString("ru-RU") + ". Это личный план, не официальный документ и не гарантия поступления."]));

    if (nextId) {
      var nextStar = list.filter(function (s) { return s.id === nextId; })[0];
      mount.appendChild(el("h2", {}, ["Следующее действие"]));
      mount.appendChild(el("p", {}, [starIcon(nextStar) + " " + nextStar.title + (nextStar.description ? " — " + nextStar.description : "")]));
    }

    mount.appendChild(el("h2", {}, ["Все шаги маршрута"]));
    var stepsList = el("div", { class: "print-plan__list" });
    if (!ordered.length) {
      stepsList.appendChild(el("p", {}, ["Пока нет ни одного шага в маршруте."]));
    }
    ordered.forEach(function (star) {
      stepsList.appendChild(
        el("div", { class: "print-plan__row" }, [
          el("span", {}, [star.status === "done" ? "[x] " : "[ ] "]),
          el("strong", {}, [star.title]),
          star.deadline ? el("span", {}, [" — срок: " + star.deadline]) : null,
          star.description ? el("div", { class: "print-plan__desc" }, [star.description]) : null
        ])
      );
    });
    mount.appendChild(stepsList);

    mount.appendChild(el("h2", {}, ["Чек-лист документов"]));
    var docsList = el("div", { class: "print-plan__list" });
    var docs = profile.documents || {};
    DOCUMENT_ITEMS.forEach(function (item) {
      if (item.onlyMajor && profile.major !== item.onlyMajor) return;
      docsList.appendChild(
        el("div", { class: "print-plan__row" }, [el("span", {}, [docs[item.key] ? "[x] " : "[ ] "]), item.label])
      );
    });
    mount.appendChild(docsList);
  }

  function render() {
    var root = qs("#roadmap-root");
    root.innerHTML = "";
    var profile = S.getProfile();

    if (!S.isProfileMinimal(profile)) {
      C.emptyState(root, {
        icon: "🗺️",
        title: "Маршрут строится из профиля",
        text: "Укажите специальность и страну в профиле — тогда появится карта шагов.",
        actionLabel: "Заполнить профиль",
        actionHref: "profile.html"
      });
      return;
    }

    syncGapStars(profile);

    root.appendChild(
      el("div", { class: "flex items-center justify-between", style: "flex-wrap:wrap;gap:12px;" }, [
        el("div", {}, [
          el("h2", { style: "color:var(--lavender);margin-bottom:6px;" }, ["Ваш маршрут"]),
          el("p", { style: "color:var(--lavender-faint);max-width:560px;margin-bottom:0;" }, [
            "Каждая звезда — шаг: пробел в портфолио, мероприятие или ваш собственный пункт. Кликните на любую невыполненную звезду, чтобы отметить её сделанной."
          ])
        ]),
        (function () {
          var btn = el("button", { type: "button", class: "btn btn--secondary btn--sm" }, ["🖨 Скачать план"]);
          btn.addEventListener("click", function () { buildPrintPlan(S.getProfile()); window.print(); });
          return btn;
        })()
      ])
    );

    renderPriorityPanel(root, profile);
    renderLegend(root);
    renderViewToggle(root);

    var constellationMount = el("div", { id: "constellation-mount" });
    root.appendChild(constellationMount);
    root.appendChild(el("div", { id: "next-action-mount" }));
    if (viewMode === "list") buildListView(constellationMount);
    else buildConstellation(constellationMount);

    renderAddCustomForm(root);
    renderDocumentsChecklist(root, profile);
    renderEvents(root, profile);

    root.appendChild(
      el("div", { class: "step-actions", style: "margin-top:32px;" }, [
        el("a", { class: "btn btn--secondary", href: "compare.html" }, ["← К сравнению"]),
        el("a", { class: "btn btn--dark", href: "diagnosis.html" }, ["К диагностике"])
      ])
    );
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.roadmap = { init: render };
})(window);
