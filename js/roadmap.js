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

  // Ключи TOEFL/SAT, у которых конкретно этот вуз указывает числовой порог
  // (IELTS — отдельный шаг). Если ни одного числового требования нет —
  // шаг честно закрывается сразу, показывать пробел не по чему.
  function numericSecondaryExams(uni) {
    return ["toefl", "sat"].filter(function (k) { return typeof uni[k] === "number"; });
  }

  // ---------------- Шаги пути к целевому вузу ----------------
  function computeAutoStatus(autoKey, profile, targetUni) {
    if (autoKey === "anketa") return S.isProfileMinimal(profile) ? "done" : "todo";
    if (autoKey === "english") {
      var e = profile.exams.ielts;
      return (e && !e.notTaken && typeof e.value === "number") ? "done" : "todo";
    }
    if (autoKey === "otherExams") {
      var keys = numericSecondaryExams(targetUni);
      if (!keys.length) return "done";
      return keys.every(function (k) {
        var v = profile.exams[k];
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

  var SECONDARY_EXAM_LABELS = { toefl: "TOEFL", sat: "SAT" };

  function buildJourneyDefs(profile, targetUni) {
    var otherKeys = numericSecondaryExams(targetUni);
    var otherExamsDesc = otherKeys.length
      ? "Нужны: " + otherKeys.map(function (k) { return SECONDARY_EXAM_LABELS[k] + " от " + targetUni[k]; }).join(", ") + "."
      : "У этого вуза нет отдельных числовых порогов по TOEFL/SAT в источнике.";

    var submissionDeadline = targetUni.deadlineMain || targetUni.deadlineEarly || null;
    var deadlineText = submissionDeadline
      ? "Дедлайн подачи: " + submissionDeadline + " (данные прошлого цикла, уточняйте на сайте)."
      : "Точный дедлайн подачи не собран в источнике для этой программы — уточните на официальном сайте вуза.";

    return [
      { id: "journey-anketa", icon: "📝", shortLabel: "Анкета", title: "Анкета заполнена", description: "Специальность и страна указаны в профиле.", auto: "anketa" },
      {
        id: "journey-english", icon: "🗣️", shortLabel: "IELTS",
        title: typeof targetUni.ielts === "number" ? "Английский язык — IELTS от " + targetUni.ielts : "Английский язык — IELTS",
        description: typeof targetUni.ielts === "number"
          ? "Добавьте актуальный балл IELTS в анкете (шаг 5)."
          : "У этого вуза нет числового порога IELTS в источнике — добавьте балл в анкете на всякий случай, но ориентируйтесь на сайт вуза.",
        auto: "english"
      },
      { id: "journey-otherexams", icon: "📚", shortLabel: "TOEFL/SAT", title: "TOEFL / SAT", description: otherExamsDesc, auto: "otherExams" },
      { id: "journey-documents", icon: "📄", shortLabel: "Документы", title: "Сбор документов", description: "Транскрипт, рекомендательные письма и языковой сертификат — готовы (см. чек-лист ниже).", auto: "documents" },
      { id: "journey-motivation", icon: "✍️", shortLabel: "Письмо", title: "Мотивационное письмо", description: "Отметьте как готовое в чек-листе документов ниже.", auto: "motivation" },
      { id: "journey-submission", icon: "📮", shortLabel: "Подача", title: "Подача заявки", description: deadlineText, deadline: submissionDeadline },
      { id: "journey-interview", icon: "🎥", shortLabel: "Собеседование", title: "Собеседование", description: "Если вуз проводит собеседование — обычно вскоре после подачи заявки." },
      { id: "journey-visa", icon: "🛂", shortLabel: "Виза", title: "Виза и разрешение на учёбу", description: "Начинайте оформление сразу после письма о зачислении от вуза." },
      { id: "journey-enrollment", icon: "🎓", shortLabel: "Зачисление", title: "Зачисление", description: "Ваша цель — " + targetUni.name + "." }
    ];
  }

  // ---------------- Даты: честная приблизительная оценка срочности ----------------
  // Дедлайны в базе — данные прошлого цикла подачи (сезонный ориентир, не
  // подтверждённая дата этого года). Парсим день/месяц и проецируем на
  // ближайшее будущее — только как мягкую подсказку "скоро", а не точный факт.
  var RU_MONTHS = {
    "январ": 0, "феврал": 1, "март": 2, "апрел": 3, "ма": 4, "июн": 5,
    "июл": 6, "август": 7, "сентябр": 8, "октябр": 9, "ноябр": 10, "декабр": 11
  };
  function monthFromWord(word) {
    word = (word || "").toLowerCase();
    var keys = Object.keys(RU_MONTHS);
    for (var i = 0; i < keys.length; i++) if (word.indexOf(keys[i]) === 0) return RU_MONTHS[keys[i]];
    return null;
  }
  function parseApproxDeadline(text) {
    if (!text) return null;
    var m = text.match(/(\d{1,2})\s+([а-яё]+)/i);
    if (m) {
      var month = monthFromWord(m[2]);
      if (month !== null) return projectToFuture(parseInt(m[1], 10), month);
    }
    var m2 = text.match(/(начал[оа]|конец|середин[аеу])\s+([а-яё]+)/i);
    if (m2) {
      var month2 = monthFromWord(m2[2]);
      if (month2 !== null) {
        var day2 = /^начал/i.test(m2[1]) ? 5 : /^середин/i.test(m2[1]) ? 15 : 25;
        return projectToFuture(day2, month2);
      }
    }
    return null;
  }
  function projectToFuture(day, month) {
    var now = new Date();
    var candidate = new Date(now.getFullYear(), month, day);
    if (candidate < now) candidate = new Date(now.getFullYear() + 1, month, day);
    return candidate;
  }
  function daysUntil(date) {
    if (!date) return null;
    return Math.round((date - new Date()) / 86400000);
  }
  function shortDate(text) {
    if (!text) return null;
    var head = text.split("(")[0].trim();
    return head || null;
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
          id: def.id, type: "journey", icon: def.icon, shortLabel: def.shortLabel, title: def.title, description: def.description,
          status: autoStatus || "todo", deadline: def.deadline || null, targetUniversityId: targetUni.id, order: i
        });
      } else {
        var patch = { title: def.title, description: def.description, order: i, icon: def.icon, shortLabel: def.shortLabel, deadline: def.deadline || null };
        S.upsertRoadmapStar(Object.assign({ id: def.id }, patch));
        if (def.auto) S.setStarStatus(def.id, autoStatus);
      }
    });
  }

  function orderStars(list) {
    return list.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  }

  // Амплитуда зигзага (отклонение по X от центра, в % ширины) — ФИКСИРОВАННЫЙ
  // диапазон, намеренно не зависит от количества звёзд, чтобы карта не
  // расширялась с ростом маршрута, а только удлинялась по вертикали.
  var ZIGZAG_AMP_MIN = 12, ZIGZAG_AMP_MAX = 24;
  var ZIGZAG_X_MIN = 16, ZIGZAG_X_MAX = 84;

  function computePositions(count) {
    var yTop = 8, yBottom = 92;
    var totalSpan = yBottom - yTop;
    var positions = [];
    if (count <= 0) return positions;
    if (count === 1) { positions.push({ x: 50, y: (yTop + yBottom) / 2 }); return positions; }

    // Случайные веса длины каждого отрезка — путь удлиняется через высоту
    // контейнера (см. computeWrapHeight), а не через ширину зигзага.
    var segCount = count - 1;
    var weights = [];
    var weightSum = 0;
    for (var i = 0; i < segCount; i++) {
      var w = 0.55 + Math.random() * 0.9; // 0.55..1.45 — разная длина каждого звена
      weights.push(w);
      weightSum += w;
    }

    var side = Math.random() < 0.5 ? -1 : 1;
    var x = 50;
    var y = yBottom;
    positions.push({ x: x, y: y });
    for (var s = 0; s < segCount; s++) {
      y -= (weights[s] / weightSum) * totalSpan;
      // Обычно чередуем сторону (зигзаг), но иногда продолжаем в ту же
      // сторону — чтобы путь не выглядел ровной регулярной "лесенкой".
      if (Math.random() < 0.78) side = -side;
      var amp = ZIGZAG_AMP_MIN + Math.random() * (ZIGZAG_AMP_MAX - ZIGZAG_AMP_MIN);
      var jitter = (Math.random() - 0.5) * 7;
      x = clamp(50 + side * amp + jitter, ZIGZAG_X_MIN, ZIGZAG_X_MAX);
      positions.push({ x: x, y: y });
    }
    return positions;
  }

  // Высота карты (в px) растёт с числом звёзд, а не диапазон X — так путь
  // удлиняется вертикально вместо расширения.
  function computeWrapHeight(count) {
    return Math.max(560, 150 + count * 68);
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
    refreshUpcomingDeadlines();
  }

  function refreshUpcomingDeadlines() {
    var mount = qs("#upcoming-deadlines-mount");
    if (!mount) return;
    mount.innerHTML = "";
    renderUpcomingDeadlines(mount, orderStars(S.getRoadmap()));
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
    var nearIds = computeNearIds(ordered);
    ordered.forEach(function (s) {
      var ref = starRefs[s.id];
      if (!ref) return;
      ref.button.classList.remove("star-btn--done", "star-btn--next", "star-btn--urgent", "star-btn--near");
      if (s.status === "done") ref.button.classList.add("star-btn--done");
      else if (s.id === nextId) ref.button.classList.add("star-btn--next");
      if (isUrgent(s)) ref.button.classList.add("star-btn--urgent");

      // Метка и глиф появляются/исчезают вместе со сдвигом "ближайших" звёзд —
      // позиции звёзд при этом не трогаем, чтобы форма пути не дёргалась.
      var shouldHaveLabel = nearIds.indexOf(s.id) !== -1;
      if (shouldHaveLabel) ref.button.classList.add("star-btn--near");
      if (shouldHaveLabel && !ref.label) {
        var dateHint = shortDate(s.deadline);
        var text = (s.shortLabel || s.title) + (dateHint ? " · до " + dateHint : "");
        ref.label = el("span", { class: "star-btn__label" }, [text]);
        ref.button.appendChild(ref.label);
      } else if (!shouldHaveLabel && ref.label) {
        ref.button.removeChild(ref.label);
        ref.label = null;
      }
    });
    updateNextActionCard(ordered, nextId);
  }

  function computeNearIds(list) {
    var near = [];
    for (var i = 0; i < list.length && near.length < 3; i++) {
      if (list[i].status !== "done") near.push(list[i].id);
    }
    return near;
  }

  function isUrgent(star) {
    if (star.status === "done") return false;
    var d = daysUntil(parseApproxDeadline(star.deadline));
    return d !== null && d >= 0 && d <= 30;
  }

  function buildConstellation(container) {
    container.innerHTML = "";
    starRefs = {};
    var list = orderStars(S.getRoadmap());
    if (!list.length) { updateNextActionCard([], null); return; }

    var wrap = el("div", { class: "constellation-wrap", style: "height:" + computeWrapHeight(list.length) + "px;" });
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
    var nearIds = computeNearIds(list);

    for (var i = 0; i < list.length - 1; i++) {
      var a = positions[i], b = positions[i + 1];
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
      svg.appendChild(line);
    }

    list.forEach(function (star, i) {
      var pos = positions[i];
      var mark = el("span", { class: "star-btn__mark" }, [el("span", { class: "star-btn__glyph" }, [star.icon || "✦"])]);
      var isNear = nearIds.indexOf(star.id) !== -1;
      var dateHint = shortDate(star.deadline);
      var labelText = isNear ? (star.shortLabel || star.title) + (dateHint ? " · до " + dateHint : "") : null;
      var label = labelText ? el("span", { class: "star-btn__label" }, [labelText]) : null;
      var urgent = isUrgent(star);
      var classes = "star-btn";
      if (star.status === "done") classes += " star-btn--done";
      else if (star.id === nextId) classes += " star-btn--next";
      if (isNear) classes += " star-btn--near";
      if (urgent) classes += " star-btn--urgent";
      var btn = el("button", {
        type: "button", class: classes, style: "left:" + pos.x + "%;top:" + pos.y + "%;",
        title: star.title + (star.description ? " — " + star.description : "")
      }, [mark, label]);
      btn.addEventListener("click", function () { toggleStar(star.id); });
      layer.appendChild(btn);
      starRefs[star.id] = { button: btn, mark: mark, label: label, star: star };
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

      var urgent = isUrgent(star);
      var dateHint = shortDate(star.deadline);
      checklist.appendChild(
        el("div", { class: "checklist-row" + (isDone ? " checklist-row--done" : "") + (isNext ? " checklist-row--next" : "") + (urgent ? " checklist-row--urgent" : "") }, [
          check,
          el("div", { class: "checklist-body" }, [
            el("div", { class: "checklist-title" }, [(star.icon || "✦") + " " + star.title, dateHint ? el("span", { class: "checklist-deadline" }, ["до " + dateHint]) : null]),
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

  function renderLegendPanel(container) {
    var panel = el("div", { class: "priority-panel" });
    var body = el("div", { class: "priority-panel__body" });
    var header = el("button", { type: "button", class: "priority-panel__header" }, [
      el("span", {}, ["✦ Как читать карту"]),
      el("span", {}, ["▾"])
    ]);
    header.addEventListener("click", function () { panel.classList.toggle("priority-panel--open"); });

    body.appendChild(
      el("div", { class: "legend-row" }, [
        el("div", { class: "legend-row__item" }, [el("span", { class: "legend-dot", style: "background:rgba(244,241,255,0.3);" }), "Ожидает"]),
        el("div", { class: "legend-row__item" }, [el("span", { class: "legend-dot legend-dot--ring" }), "Вы здесь — ближайший шаг"]),
        el("div", { class: "legend-row__item" }, [el("span", { class: "legend-dot", style: "background:#fff;box-shadow:0 0 8px 3px rgba(108,92,231,0.6);" }), "Выполнено"]),
        el("div", { class: "legend-row__item" }, [el("span", { class: "legend-dot", style: "background:#fff;box-shadow:0 0 8px 3px rgba(255,138,101,0.6);" }), "Дедлайн скоро (≤30 дней)"])
      ])
    );
    body.appendChild(
      el("div", { class: "legend-row", style: "margin-top:6px;" }, [
        el("div", { class: "legend-row__item" }, ["📝 анкета"]),
        el("div", { class: "legend-row__item" }, ["🗣️📚 экзамены"]),
        el("div", { class: "legend-row__item" }, ["📄✍️ документы"]),
        el("div", { class: "legend-row__item" }, ["📮 подача"]),
        el("div", { class: "legend-row__item" }, ["🎥 собеседование"]),
        el("div", { class: "legend-row__item" }, ["🛂 виза"]),
        el("div", { class: "legend-row__item" }, ["🎓 цель"])
      ])
    );
    body.appendChild(el("p", { class: "muted", style: "margin:8px 0 0;font-size:0.76rem;" }, [
      "Подписи и даты на карте показаны только у 2–3 ближайших шагов — остальные звёзды остаются точками, чтобы карта оставалась читаемой."
    ]));

    panel.appendChild(header);
    panel.appendChild(body);
    container.appendChild(panel);
  }

  // Статичная витрина — не зависит от профиля/специальности/страны.
  var EFFORT_FOCUS_ITEMS = [
    { title: "Публикация / research с научным руководителем", note: "Сильнее всего выделяет профиль на конкурентных зарубежных программах.", level: "high" },
    { title: "Запущенный проект (продукт, стартап, open-source)", note: "Показывает инициативу и практическое применение навыков.", level: "high" },
    { title: "Профильная олимпиада (международный/республиканский уровень)", note: "Особенно ценится для STEM-направлений.", level: "high", qualifier: "особенно для STEM-специальностей" },
    { title: "Хакатоны и кейс-чемпионаты", note: "Хорошо показывает командную работу и прикладные навыки.", level: "medium" },
    { title: "Волонтёрство и социальные инициативы", note: "Важно для liberal arts и holistic-admission вузов.", level: "medium", qualifier: "зависит от типа вуза и направления" },
    { title: "Стажировка", note: "Особенно ценна для бизнес- и инженерных направлений.", level: "medium", qualifier: "зависит от направления" }
  ];
  var EFFORT_LEVEL_LABEL = { high: "Высокое", medium: "Среднее" };

  function renderEffortPanel(container) {
    var panel = el("div", { class: "effort-panel" }, [
      el("div", { class: "effort-panel__title" }, ["На что направить усилия"]),
      el("div", { class: "effort-panel__subtitle" }, ["Экспертная оценка команды Uniora: насколько активность обычно усиливает заявку."])
    ]);
    EFFORT_FOCUS_ITEMS.forEach(function (item) {
      panel.appendChild(
        el("div", { class: "effort-row" }, [
          el("div", { class: "effort-row__text" }, [
            el("div", { class: "effort-row__label" }, [item.title]),
            el("div", { class: "effort-row__note" }, [item.note])
          ]),
          el("div", { class: "effort-row__level" }, [
            el("span", { class: "effort-badge effort-badge--" + item.level }, [EFFORT_LEVEL_LABEL[item.level]]),
            item.qualifier ? el("div", { class: "effort-row__qualifier" }, ["(" + item.qualifier + ")"]) : null
          ])
        ])
      );
    });
    panel.appendChild(
      el("div", { class: "effort-panel__disclaimer" }, [
        "Это наша собственная оценка, основанная на изучении требований вузов, а не официальная статистика или гарантия результата."
      ])
    );
    container.appendChild(panel);
  }

  function renderUpcomingDeadlines(container, list) {
    var dated = list
      .filter(function (s) { return s.status !== "done"; })
      .map(function (s) { return { star: s, date: parseApproxDeadline(s.deadline) }; })
      .filter(function (d) { return d.date !== null; })
      .sort(function (a, b) { return a.date - b.date; })
      .slice(0, 3);
    if (!dated.length) return;

    var strip = el("div", { class: "upcoming-deadlines" }, [
      el("span", { class: "upcoming-deadlines__label" }, ["Ближайшие дедлайны"])
    ]);
    dated.forEach(function (d) {
      strip.appendChild(
        el("span", { class: "upcoming-deadlines__item" }, [
          (d.star.shortLabel || d.star.title), el("span", {}, [" · " + shortDate(d.star.deadline)])
        ])
      );
    });
    container.appendChild(strip);
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

    renderLegendPanel(root);
    renderEffortPanel(root);
    renderViewToggle(root);
    root.appendChild(el("div", { id: "upcoming-deadlines-mount" }));
    refreshUpcomingDeadlines();

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
