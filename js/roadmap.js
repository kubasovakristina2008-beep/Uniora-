/* Uniora — экран «Roadmap»: линейный путь к целевому вузу — 9 шагов от анкеты
   до зачисления. Цель выбирается в «Сравнении» или «Избранном» (кнопка
   «Сделать целью»). Первые 5 шагов синхронизируются автоматически с реальными
   данными профиля, последние 4 — отмечаются вручную (визу/собеседование
   нельзя определить из локальных данных). */
(function (global) {
  "use strict";

  var C = global.Uniora.common;
  var S = global.Uniora.state;
  var M = global.Uniora.match;
  var D = global.Uniora.data;
  var el = C.el;
  var qs = C.qs;

  var starRefs = {};
  var stopStarfield = null;
  var viewMode = "constellation"; // "constellation" | "list"

  var DOC_STATUS_LABEL = { not_started: "Не начато", in_progress: "В процессе", done: "Готово" };
  var DOC_STATUS_ORDER = ["not_started", "in_progress", "done"];

  // ---------------- Шаги пути к целевому вузу ----------------
  function computeAutoStatus(autoKey, profile, targetUni) {
    if (autoKey === "anketa") return S.isProfileMinimal(profile) ? "done" : "todo";
    if (autoKey === "english") {
      var e = profile.exams.ielts;
      return (e && !e.notTaken && typeof e.value === "number") ? "done" : "todo";
    }
    if (autoKey === "subjects") {
      var subs = M.relevantSubjectsForUni(targetUni, profile);
      if (!subs.length) return "done";
      return subs.every(function (s) {
        var v = profile.exams.subjects[s.key];
        return v && !v.notTaken && typeof v.value === "number";
      }) ? "done" : "todo";
    }
    if (autoKey === "documents") {
      var docs = profile.documents || {};
      return ["transcript", "recommendationLetters", "languageCertificate"].every(function (k) { return docs[k] === "done"; }) ? "done" : "todo";
    }
    if (autoKey === "motivation") {
      var docs2 = profile.documents || {};
      return docs2.motivationLetter === "done" ? "done" : "todo";
    }
    return null;
  }

  function buildJourneyDefs(profile, targetUni) {
    var subs = M.relevantSubjectsForUni(targetUni, profile);
    var subjectsDesc = subs.length
      ? "Нужны: " + subs.map(function (s) { return s.label + " от " + targetUni.subjects[s.key]; }).join(", ") + "."
      : "Для этой специальности в этом вузе профильные предметы не требуются.";

    return [
      { id: "journey-anketa", icon: "📝", title: "Анкета заполнена", description: "Специальность и страна указаны в профиле.", auto: "anketa" },
      { id: "journey-english", icon: "🗣️", title: "Английский язык — IELTS от " + targetUni.ielts, description: "Добавьте актуальный балл IELTS в анкете (шаг 5).", auto: "english" },
      { id: "journey-subjects", icon: "📚", title: "Профильные экзамены", description: subjectsDesc, auto: "subjects" },
      { id: "journey-documents", icon: "📄", title: "Сбор документов", description: "Транскрипт, рекомендательные письма и языковой сертификат — готовы (см. чек-лист ниже).", auto: "documents" },
      { id: "journey-motivation", icon: "✍️", title: "Мотивационное письмо", description: "Отметьте как готовое в чек-листе документов ниже.", auto: "motivation" },
      { id: "journey-submission", icon: "📮", title: "Подача заявки", description: "Дедлайн подачи: " + targetUni.deadlineMain + " (данные прошлого цикла, уточняйте на сайте).", deadline: targetUni.deadlineMain },
      { id: "journey-interview", icon: "🎥", title: "Собеседование", description: "Если вуз проводит собеседование — обычно вскоре после подачи заявки." },
      { id: "journey-visa", icon: "🛂", title: "Виза и разрешение на учёбу", description: "Начинайте оформление сразу после письма о зачислении от вуза." },
      { id: "journey-enrollment", icon: "🎓", title: "Зачисление", description: "Ваша цель — " + targetUni.name + "." }
    ];
  }

  function syncJourneySteps(profile, targetUni) {
    var list = S.getRoadmap();
    list.filter(function (s) { return s.type === "journey" && s.targetUniversityId !== targetUni.id; })
      .forEach(function (s) { S.removeRoadmapStar(s.id); });

    var defs = buildJourneyDefs(profile, targetUni);
    defs.forEach(function (def, i) {
      var current = S.getRoadmap().filter(function (s) { return s.id === def.id; })[0];
      var autoStatus = def.auto ? computeAutoStatus(def.auto, profile, targetUni) : null;
      if (!current) {
        S.upsertRoadmapStar({
          id: def.id, type: "journey", icon: def.icon, title: def.title, description: def.description,
          status: autoStatus || "todo", deadline: def.deadline || null, targetUniversityId: targetUni.id, order: i
        });
      } else {
        var patch = { title: def.title, description: def.description, order: i, icon: def.icon };
        S.upsertRoadmapStar(Object.assign({ id: def.id }, patch));
        if (def.auto) S.setStarStatus(def.id, autoStatus);
      }
    });
  }

  function orderStars(list) {
    return list.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  }

  function computePositions(count) {
    var positions = [];
    for (var i = 0; i < count; i++) {
      var t = count <= 1 ? 0 : i / (count - 1);
      var y = 90 - t * 80;
      var side = i % 2 === 0 ? -1 : 1;
      var amplitude = 16 + Math.random() * 12;
      var jitter = (Math.random() - 0.5) * 8;
      var x = clamp(50 + side * amplitude + jitter, 14, 86);
      positions.push({ x: x, y: y });
    }
    return positions;
  }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function findNextStarId(orderedStars) {
    for (var i = 0; i < orderedStars.length; i++) {
      if (orderedStars[i].status !== "done") return orderedStars[i].id;
    }
    return null;
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
            el("div", { class: "next-action-card__eyebrow" }, ["Маршрут пройден 🎓"]),
            el("div", { class: "next-action-card__title" }, ["Все шаги к этой цели выполнены"]),
            el("p", { class: "next-action-card__desc" }, ["Отличная работа! Можно выбрать вторую цель для сравнения (в «Сравнении») и повторить путь параллельно."])
          ])
        ])
      );
      return;
    }
    var star = orderedStars.filter(function (s) { return s.id === nextId; })[0];
    mount.appendChild(
      el("div", { class: "next-action-card" }, [
        el("div", {}, [
          el("div", { class: "next-action-card__eyebrow" }, ["Следующий шаг"]),
          el("div", { class: "next-action-card__title" }, [(star.icon || "✦") + " " + star.title]),
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
      ref.button.classList.remove("star-btn--done", "star-btn--next");
      if (s.status === "done") ref.button.classList.add("star-btn--done");
      else if (s.id === nextId) ref.button.classList.add("star-btn--next");
    });
    updateNextActionCard(ordered, nextId);
  }

  function buildConstellation(container) {
    container.innerHTML = "";
    starRefs = {};
    var list = orderStars(S.getRoadmap());
    if (!list.length) { updateNextActionCard([], null); return; }

    var wrap = el("div", { class: "constellation-wrap" });
    var canvas = el("canvas", { class: "constellation-canvas" });
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "constellation-svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    var layer = el("div", { class: "constellation-layer" });

    wrap.appendChild(canvas); wrap.appendChild(svg); wrap.appendChild(layer);
    container.appendChild(wrap);

    if (stopStarfield) stopStarfield();
    stopStarfield = C.starField(canvas, { density: 0.00012 });

    var positions = computePositions(list.length);
    var nextId = findNextStarId(list);

    for (var i = 0; i < list.length - 1; i++) {
      var a = positions[i], b = positions[i + 1];
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
      svg.appendChild(line);
    }

    list.forEach(function (star, i) {
      var pos = positions[i];
      var mark = el("span", { class: "star-btn__mark" });
      var label = el("span", { class: "star-btn__label" }, [star.title]);
      var classes = "star-btn";
      if (star.status === "done") classes += " star-btn--done";
      else if (star.id === nextId) classes += " star-btn--next";
      var btn = el("button", {
        type: "button", class: classes, style: "left:" + pos.x + "%;top:" + pos.y + "%;",
        title: star.title + (star.description ? " — " + star.description : "")
      }, [mark, label]);
      btn.addEventListener("click", function () { toggleStar(star.id); });
      layer.appendChild(btn);
      starRefs[star.id] = { button: btn, mark: mark, star: star };
    });

    updateNextActionCard(list, nextId);
  }

  function buildListView(container) {
    container.innerHTML = "";
    var list = orderStars(S.getRoadmap());
    if (!list.length) { updateNextActionCard([], null); return; }
    var nextId = findNextStarId(list);

    var checklist = el("div", { class: "checklist" });
    list.forEach(function (star) {
      var isNext = star.id === nextId;
      var isDone = star.status === "done";
      var check = el("button", {
        type: "button", class: "checklist-check" + (isDone ? " is-checked" : ""),
        title: isDone ? "Вернуть в работу" : "Отметить выполненным"
      }, [isDone ? "✓" : ""]);
      check.addEventListener("click", function () { toggleStar(star.id); });

      checklist.appendChild(
        el("div", { class: "checklist-row" + (isDone ? " checklist-row--done" : "") + (isNext ? " checklist-row--next" : "") }, [
          check,
          el("div", { class: "checklist-body" }, [
            el("div", { class: "checklist-title" }, [(star.icon || "✦") + " " + star.title]),
            star.description ? el("div", { class: "checklist-desc" }, [star.description]) : null
          ])
        ])
      );
    });
    container.appendChild(checklist);
    updateNextActionCard(list, nextId);
  }

  function renderViewToggle(container) {
    var wrap = el("div", { class: "view-toggle" });
    var tabs = [{ id: "constellation", label: "✦ Созвездие" }, { id: "list", label: "☰ Список" }];
    var buttons = [];
    tabs.forEach(function (t) {
      var btn = el("button", { type: "button", class: "view-toggle__tab" + (viewMode === t.id ? " view-toggle__tab--active" : "") }, [t.label]);
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

  function renderLegend(container) {
    container.appendChild(
      el("div", { class: "legend-row" }, [
        el("div", { class: "legend-row__item" }, [el("span", { class: "legend-dot", style: "background:rgba(244,241,255,0.35);" }), "Готово / скоро"]),
        el("div", { class: "legend-row__item" }, [el("span", { class: "legend-dot", style: "background:#fff;" }), "Сейчас"]),
        el("div", { class: "legend-row__item" }, [el("span", { class: "legend-dot", style: "background:#fff;box-shadow:0 0 6px 2px rgba(108,92,231,0.6);" }), "Выполнено"])
      ])
    );
  }

  // ---------------- Чек-лист документов (3 состояния) ----------------
  function renderDocumentsChecklist(container, profile, targetUni) {
    var wrap = el("div", { class: "card card--dark", style: "margin-top:var(--space-3);" });
    var doneCount = 0;
    var applicable = D.DOCUMENT_ITEMS.filter(function (d) { return !d.onlyMajor || (profile.majors || []).indexOf(d.onlyMajor) !== -1; });
    applicable.forEach(function (d) { if ((profile.documents || {})[d.key] === "done") doneCount++; });

    wrap.appendChild(
      el("div", { class: "flex items-center justify-between", style: "flex-wrap:wrap;gap:8px;" }, [
        el("div", { class: "field-label", style: "color:var(--lavender);margin:0;" }, ["Документы на подачу — " + targetUni.name]),
        el("span", { class: "badge badge--weight-medium" }, [doneCount + " / " + applicable.length + " готово к подаче"])
      ])
    );

    var list = el("div", { class: "doc-checklist", style: "margin-top:12px;" });
    applicable.forEach(function (item) {
      var current = (profile.documents || {})[item.key] || "not_started";
      var row = el("div", { class: "doc-row" }, [
        el("span", { class: "doc-row__label" }, [item.label]),
        el("div", { class: "doc-status-group" })
      ]);
      var group = row.querySelector(".doc-status-group");
      DOC_STATUS_ORDER.forEach(function (statusKey) {
        var chip = el("button", {
          type: "button",
          class: "doc-status-chip" + (current === statusKey ? " doc-status-chip--active doc-status-chip--" + statusKey : "")
        }, [DOC_STATUS_LABEL[statusKey]]);
        chip.addEventListener("click", function () {
          var patch = { documents: {} };
          patch.documents[item.key] = statusKey;
          S.updateProfile(patch);
          render();
        });
        group.appendChild(chip);
      });
      list.appendChild(row);
    });
    wrap.appendChild(list);
    container.appendChild(wrap);
  }

  // ---------------- Мероприятия (информационно, без привязки к пути) ----------------
  function renderEvents(container, profile) {
    var events = D.EVENTS.filter(function (e) { return e.majors.some(function (m) { return (profile.majors || []).indexOf(m) !== -1; }); });
    if (!events.length) return;
    container.appendChild(el("h3", { style: "margin-top:var(--space-4);color:var(--lavender);" }, ["Мероприятия для твоей специальности"]));
    var grid = el("div", { class: "event-list" });
    events.forEach(function (ev) {
      grid.appendChild(
        el("div", { class: "event-card" }, [
          el("div", { class: "event-card__title" }, [ev.name]),
          el("div", { class: "event-card__meta" }, [ev.type + " · " + ev.level + " · " + ev.format + " · " + ev.timing]),
          el("p", { style: "margin:0 0 8px;color:var(--lavender-soft);" }, [ev.whyBoost]),
          ev.limitation ? el("p", { class: "muted", style: "margin:0;font-size:0.76rem;" }, ["Ограничение: " + ev.limitation]) : null,
          el("div", { class: "event-card__actions" }, [el("a", { class: "btn btn--secondary btn--sm", href: ev.website, target: "_blank", rel: "noopener" }, ["Сайт"])])
        ])
      );
    });
    container.appendChild(grid);
  }

  // ---------------- Скачать план (печать) ----------------
  function buildPrintPlan(profile, targetUni) {
    var mount = qs("#print-plan");
    if (!mount) return;
    mount.innerHTML = "";
    var list = orderStars(S.getRoadmap());

    mount.appendChild(el("h1", {}, ["План поступления — Uniora"]));
    mount.appendChild(el("p", {}, [targetUni.name + " · " + C.countryLabel(targetUni.country) + " · " + C.majorsLabel(profile.majors)]));
    mount.appendChild(el("p", {}, ["Сформировано " + new Date().toLocaleDateString("ru-RU") + ". Личный план, не официальный документ и не гарантия поступления — сроки и требования вуза могут измениться, сверяйтесь с официальным сайтом приёмной комиссии."]));

    mount.appendChild(el("h2", {}, ["Обзор"]));
    var overview = el("div", { class: "print-plan__list" }, [
      el("div", { class: "print-plan__row" }, ["Университет: " + targetUni.name]),
      el("div", { class: "print-plan__row" }, ["Страна: " + targetUni.city + ", " + C.countryLabel(targetUni.country)]),
      el("div", { class: "print-plan__row" }, ["Дедлайн подачи: " + targetUni.deadlineMain + " (прошлый цикл)"]),
      el("div", { class: "print-plan__row" }, ["Стипендия: " + targetUni.scholarship])
    ]);
    mount.appendChild(overview);

    mount.appendChild(el("h2", {}, ["Шаги маршрута"]));
    var stepsList = el("div", { class: "print-plan__list" });
    list.forEach(function (star, i) {
      stepsList.appendChild(
        el("div", { class: "print-plan__row" }, [
          el("span", {}, [(i + 1) + ". " + (star.status === "done" ? "[x] " : "[ ] ")]),
          el("strong", {}, [star.title]),
          star.description ? el("div", { class: "print-plan__desc" }, [star.description]) : null
        ])
      );
    });
    mount.appendChild(stepsList);

    mount.appendChild(el("h2", {}, ["Документы на подачу"]));
    var docsList = el("div", { class: "print-plan__list" });
    var docs = profile.documents || {};
    D.DOCUMENT_ITEMS.forEach(function (item) {
      if (item.onlyMajor && (profile.majors || []).indexOf(item.onlyMajor) === -1) return;
      docsList.appendChild(el("div", { class: "print-plan__row" }, [item.label + " — " + (DOC_STATUS_LABEL[docs[item.key]] || "Не начато")]));
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

    var targetUni = profile.targetUniversityId ? D.UNIVERSITIES.filter(function (u) { return u.id === profile.targetUniversityId; })[0] : null;
    if (!targetUni) {
      C.emptyState(root, {
        icon: "🎯",
        title: "Выберите целевой вуз",
        text: "Маршрут строится вокруг одной цели. Отметьте вуз «Сделать целью» на странице «Сравнение» или «Избранное».",
        actionLabel: "К рекомендациям",
        actionHref: "recommendations.html"
      });
      return;
    }

    syncJourneySteps(profile, targetUni);
    var freshProfile = S.getProfile();

    root.appendChild(
      el("div", { class: "flex items-center justify-between", style: "flex-wrap:wrap;gap:12px;" }, [
        el("div", {}, [
          el("h2", { style: "color:var(--lavender);margin-bottom:6px;" }, ["Твой путь к цели"]),
          el("p", { style: "color:var(--lavender-faint);max-width:560px;margin-bottom:0;" }, [
            targetUni.name + " · " + C.majorsLabel(freshProfile.majors) + " · 9 шагов от анкеты до зачисления"
          ])
        ]),
        (function () {
          var btn = el("button", { type: "button", class: "btn btn--secondary btn--sm" }, ["🖨 Скачать план"]);
          btn.addEventListener("click", function () { buildPrintPlan(S.getProfile(), targetUni); window.print(); });
          return btn;
        })()
      ])
    );

    renderLegend(root);
    renderViewToggle(root);

    var constellationMount = el("div", { id: "constellation-mount" });
    root.appendChild(constellationMount);
    root.appendChild(el("div", { id: "next-action-mount" }));
    if (viewMode === "list") buildListView(constellationMount); else buildConstellation(constellationMount);

    renderDocumentsChecklist(root, freshProfile, targetUni);
    renderEvents(root, freshProfile);

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
