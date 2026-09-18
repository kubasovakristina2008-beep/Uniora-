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
  var I = global.Uniora.i18n;
  var el = C.el;
  var qs = C.qs;
  var t = I.t;
  var tf = I.tf;

  var starRefs = {};
  var stopStarfield = null;
  var viewMode = "constellation"; // "constellation" | "list"

  var DOC_STATUS_LABEL_KEY = { not_started: "roadmap.docNotStarted", in_progress: "roadmap.docInProgress", done: "roadmap.docDone" };
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
      ? t("roadmap.journeyOtherExamsDescNeed", { list: otherKeys.map(function (k) { return SECONDARY_EXAM_LABELS[k] + " " + targetUni[k]; }).join(", ") })
      : t("roadmap.journeyOtherExamsDescNone");

    var submissionDeadlineRaw = targetUni.deadlineMain || targetUni.deadlineEarly || null;
    var submissionDeadline = submissionDeadlineRaw !== null ? tf(submissionDeadlineRaw) : null;
    var deadlineText = submissionDeadline
      ? t("roadmap.journeyDeadlineText", { deadline: submissionDeadline })
      : t("roadmap.journeyDeadlineUnknown");

    return [
      { id: "journey-anketa", icon: "📝", shortLabel: t("roadmap.journeyAnketaShort"), title: t("roadmap.journeyAnketaTitle"), description: t("roadmap.journeyAnketaDesc"), auto: "anketa" },
      {
        id: "journey-english", icon: "🗣️", shortLabel: t("roadmap.journeyEnglishShort"),
        title: typeof targetUni.ielts === "number" ? t("roadmap.journeyEnglishTitleWithScore", { score: targetUni.ielts }) : t("roadmap.journeyEnglishTitle"),
        description: typeof targetUni.ielts === "number" ? t("roadmap.journeyEnglishDescWithScore") : t("roadmap.journeyEnglishDesc"),
        auto: "english"
      },
      { id: "journey-otherexams", icon: "📚", shortLabel: t("roadmap.journeyOtherExamsShort"), title: t("roadmap.journeyOtherExamsTitle"), description: otherExamsDesc, auto: "otherExams" },
      { id: "journey-documents", icon: "📄", shortLabel: t("roadmap.journeyDocumentsShort"), title: t("roadmap.journeyDocumentsTitle"), description: t("roadmap.journeyDocumentsDesc"), auto: "documents" },
      { id: "journey-motivation", icon: "✍️", shortLabel: t("roadmap.journeyMotivationShort"), title: t("roadmap.journeyMotivationTitle"), description: t("roadmap.journeyMotivationDesc"), auto: "motivation" },
      { id: "journey-submission", icon: "📮", shortLabel: t("roadmap.journeySubmissionShort"), title: t("roadmap.journeySubmissionTitle"), description: deadlineText, deadline: submissionDeadline },
      { id: "journey-interview", icon: "🎥", shortLabel: t("roadmap.journeyInterviewShort"), title: t("roadmap.journeyInterviewTitle"), description: t("roadmap.journeyInterviewDesc") },
      { id: "journey-visa", icon: "🛂", shortLabel: t("roadmap.journeyVisaShort"), title: t("roadmap.journeyVisaTitle"), description: t("roadmap.journeyVisaDesc") },
      { id: "journey-enrollment", icon: "🎓", shortLabel: t("roadmap.journeyEnrollmentShort"), title: t("roadmap.journeyEnrollmentTitle"), description: t("roadmap.journeyEnrollmentDesc", { uni: targetUni.name }) }
    ];
  }

  // ---------------- Даты: честная приблизительная оценка срочности ----------------
  // Дедлайны в базе — данные прошлого цикла подачи (сезонный ориентир, не
  // подтверждённая дата этого года). Парсим день/месяц и проецируем на
  // ближайшее будущее — только как мягкую подсказку "скоро", а не точный факт.
  // Месяцы распознаются и в русском, и в английском варианте дедлайна.
  var MONTHS = {
    "январ": 0, "феврал": 1, "март": 2, "апрел": 3, "ма": 4, "июн": 5,
    "июл": 6, "август": 7, "сентябр": 8, "октябр": 9, "ноябр": 10, "декабр": 11,
    "january": 0, "february": 1, "march": 2, "april": 3, "may": 4, "june": 5,
    "july": 6, "august ": 7, "september": 8, "october": 9, "november": 10, "december": 11
  };
  function monthFromWord(word) {
    word = (word || "").toLowerCase();
    var keys = Object.keys(MONTHS);
    for (var i = 0; i < keys.length; i++) if (word.indexOf(keys[i]) === 0) return MONTHS[keys[i]];
    return null;
  }
  function parseApproxDeadline(text) {
    if (!text) return null;
    // Своя цель хранит дедлайн как ISO-дату из <input type="date"> — парсим
    // её напрямую, без сезонной проекции на будущее (год уже точный).
    var iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return new Date(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10));
    var m = text.match(/(\d{1,2})\s+([a-zа-яё]+)/i);
    if (m) {
      var month = monthFromWord(m[2]);
      if (month !== null) return projectToFuture(parseInt(m[1], 10), month);
    }
    var m1b = text.match(/([a-zа-яё]+)\s+(\d{1,2})/i);
    if (m1b) {
      var monthB = monthFromWord(m1b[1]);
      if (monthB !== null) return projectToFuture(parseInt(m1b[2], 10), monthB);
    }
    var m2 = text.match(/(начал[оа]|конец|середин[аеу]|early|end of|mid-?)\s*([a-zа-яё]+)/i);
    if (m2) {
      var month2 = monthFromWord(m2[2]);
      if (month2 !== null) {
        var day2 = /^(начал|early)/i.test(m2[1]) ? 5 : /^(середин|mid)/i.test(m2[1]) ? 15 : 25;
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
    var iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
      var d = new Date(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10));
      var locale = I.getLang() === "en" ? "en-US" : "ru-RU";
      return d.toLocaleDateString(locale, { day: "numeric", month: "long" });
    }
    var head = text.split("(")[0].trim();
    return head || null;
  }

  function syncJourneySteps(profile, targetUni) {
    var list = S.getRoadmap();
    list.filter(function (s) { return s.targetUniversityId && s.targetUniversityId !== targetUni.id; })
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
            el("div", { class: "next-action-card__eyebrow" }, [t("roadmap.routeCompleteEyebrow")]),
            el("div", { class: "next-action-card__title" }, [t("roadmap.routeCompleteTitle")]),
            el("p", { class: "next-action-card__desc" }, [t("roadmap.routeCompleteText")])
          ])
        ])
      );
      return;
    }
    var star = orderedStars.filter(function (s) { return s.id === nextId; })[0];
    mount.appendChild(
      el("div", { class: "next-action-card" }, [
        el("div", {}, [
          el("div", { class: "next-action-card__eyebrow" }, [t("roadmap.nextStepEyebrow")]),
          el("div", { class: "next-action-card__title" }, [(star.icon || "✦") + " " + star.title]),
          el("p", { class: "next-action-card__desc" }, [star.description || t("roadmap.nextStepFallback")])
        ]),
        el("button", { type: "button", class: "btn btn--dark", onclick: function () { toggleStar(star.id); } }, [t("roadmap.markDone")])
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
        var text = (s.shortLabel || s.title) + (dateHint ? " · " + t("roadmap.until") + " " + dateHint : "");
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
      var labelText = isNear ? (star.shortLabel || star.title) + (dateHint ? " · " + t("roadmap.until") + " " + dateHint : "") : null;
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
        title: isDone ? t("roadmap.returnToWork") : t("roadmap.markDone")
      }, [isDone ? "✓" : ""]);
      check.addEventListener("click", function () { toggleStar(star.id); });

      var urgent = isUrgent(star);
      var dateHint = shortDate(star.deadline);
      var row = el("div", { class: "checklist-row" + (isDone ? " checklist-row--done" : "") + (isNext ? " checklist-row--next" : "") + (urgent ? " checklist-row--urgent" : "") }, [
        check,
        el("div", { class: "checklist-body" }, [
          el("div", { class: "checklist-title" }, [(star.icon || "✦") + " " + star.title, dateHint ? el("span", { class: "checklist-deadline" }, [t("roadmap.until") + " " + dateHint]) : null]),
          star.description ? el("div", { class: "checklist-desc" }, [star.description]) : null
        ])
      ]);
      if (star.type === "custom") {
        var del = el("button", { type: "button", class: "icon-btn", title: t("profile.delete") }, ["✕"]);
        del.addEventListener("click", function () {
          S.removeRoadmapStar(star.id);
          rebuildMount();
          refreshUpcomingDeadlines();
        });
        row.appendChild(del);
      }
      checklist.appendChild(row);
    });
    container.appendChild(checklist);
    updateNextActionCard(list, nextId);
  }

  // ---------------- Свои цели: пользователь добавляет их сам ----------------
  function nextStarOrder() {
    var list = S.getRoadmap();
    var max = -1;
    list.forEach(function (s) { if (typeof s.order === "number" && s.order > max) max = s.order; });
    return max + 1;
  }

  function renderAddGoalForm(container, targetUni) {
    var wrap = el("div", { class: "add-goal" });
    var toggleBtn = el("button", { type: "button", class: "btn btn--secondary btn--sm" }, [t("roadmap.addGoalButton")]);
    var formBox = el("div", { class: "add-goal__form", style: "display:none;" });
    var open = false;

    var titleInput = el("input", { class: "text-input", type: "text", placeholder: t("roadmap.addGoalTitlePlaceholder") });
    var deadlineWrap = el("div", {}, [
      el("div", { class: "field-hint", style: "margin:0 0 4px;" }, [t("roadmap.addGoalDeadlineLabel")]),
      el("input", { class: "text-input", type: "date" })
    ]);
    var deadlineInput = deadlineWrap.querySelector("input");
    var descInput = el("input", { class: "text-input", type: "text", placeholder: t("roadmap.addGoalDescPlaceholder") });
    var errorMsg = el("div", { class: "field-hint", style: "color:var(--aurora-coral);display:none;" }, [t("roadmap.addGoalNeedsTitle")]);

    var submitBtn = el("button", { type: "button", class: "btn btn--primary btn--sm" }, [t("roadmap.addGoalSubmit")]);
    var cancelBtn = el("button", { type: "button", class: "btn btn--ghost btn--sm" }, [t("roadmap.addGoalCancel")]);

    function closeForm() {
      open = false;
      formBox.style.display = "none";
      titleInput.value = ""; deadlineInput.value = ""; descInput.value = "";
      errorMsg.style.display = "none";
    }

    toggleBtn.addEventListener("click", function () {
      open = !open;
      formBox.style.display = open ? "block" : "none";
      if (open) titleInput.focus();
    });
    cancelBtn.addEventListener("click", closeForm);
    submitBtn.addEventListener("click", function () {
      var title = titleInput.value.trim();
      if (!title) { errorMsg.style.display = "block"; return; }
      S.upsertRoadmapStar({
        id: C.uid("custom"),
        type: "custom",
        icon: t("roadmap.customGoalIcon"),
        title: title,
        description: descInput.value.trim() || null,
        deadline: deadlineInput.value || null,
        status: "todo",
        targetUniversityId: targetUni.id,
        order: nextStarOrder()
      });
      closeForm();
      render();
    });

    formBox.appendChild(el("div", { class: "field-label", style: "margin-bottom:8px;" }, [t("roadmap.addGoalTitle")]));
    formBox.appendChild(el("div", { class: "add-goal__row" }, [titleInput]));
    formBox.appendChild(el("div", { class: "add-goal__row" }, [deadlineWrap]));
    formBox.appendChild(el("div", { class: "add-goal__row" }, [descInput]));
    formBox.appendChild(errorMsg);
    formBox.appendChild(el("div", { class: "add-goal__actions" }, [submitBtn, cancelBtn]));

    wrap.appendChild(toggleBtn);
    wrap.appendChild(formBox);
    container.appendChild(wrap);
  }

  function renderViewToggle(container) {
    var wrap = el("div", { class: "view-toggle" });
    var tabs = [{ id: "constellation", label: t("roadmap.constellationTab") }, { id: "list", label: t("roadmap.listTab") }];
    var buttons = [];
    tabs.forEach(function (tab) {
      var btn = el("button", { type: "button", class: "view-toggle__tab" + (viewMode === tab.id ? " view-toggle__tab--active" : "") }, [tab.label]);
      btn.addEventListener("click", function () {
        if (viewMode === tab.id) return;
        viewMode = tab.id;
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
      el("span", {}, [t("roadmap.readMap")]),
      el("span", {}, ["▾"])
    ]);
    header.addEventListener("click", function () { panel.classList.toggle("priority-panel--open"); });

    body.appendChild(
      el("div", { class: "legend-row" }, [
        el("div", { class: "legend-row__item" }, [el("span", { class: "legend-dot", style: "background:rgba(244,241,255,0.3);" }), t("roadmap.legendWaiting")]),
        el("div", { class: "legend-row__item" }, [el("span", { class: "legend-dot legend-dot--ring" }), t("roadmap.legendHere")]),
        el("div", { class: "legend-row__item" }, [el("span", { class: "legend-dot", style: "background:#fff;box-shadow:0 0 8px 3px rgba(108,92,231,0.6);" }), t("roadmap.legendDone")]),
        el("div", { class: "legend-row__item" }, [el("span", { class: "legend-dot", style: "background:#fff;box-shadow:0 0 8px 3px rgba(255,138,101,0.6);" }), t("roadmap.legendUrgent")])
      ])
    );
    body.appendChild(
      el("div", { class: "legend-row", style: "margin-top:6px;" }, [
        el("div", { class: "legend-row__item" }, [t("roadmap.legendAnketa")]),
        el("div", { class: "legend-row__item" }, [t("roadmap.legendExams")]),
        el("div", { class: "legend-row__item" }, [t("roadmap.legendDocs")]),
        el("div", { class: "legend-row__item" }, [t("roadmap.legendSubmission")]),
        el("div", { class: "legend-row__item" }, [t("roadmap.legendInterview")]),
        el("div", { class: "legend-row__item" }, [t("roadmap.legendVisa")]),
        el("div", { class: "legend-row__item" }, [t("roadmap.legendGoal")])
      ])
    );
    body.appendChild(el("p", { class: "muted", style: "margin:8px 0 0;font-size:0.76rem;" }, [t("roadmap.legendFooter")]));

    panel.appendChild(header);
    panel.appendChild(body);
    container.appendChild(panel);
  }

  // Статичная витрина — не зависит от профиля/специальности/страны.
  function renderEffortPanel(container) {
    var panel = el("div", { class: "effort-panel" }, [
      el("div", { class: "effort-panel__title" }, [t("roadmap.effortTitle")]),
      el("div", { class: "effort-panel__subtitle" }, [t("roadmap.effortSubtitle")])
    ]);
    var items = tf(I.UI.roadmap.effortItems);
    var levelLabel = { high: t("roadmap.effortHigh"), medium: t("roadmap.effortMedium") };
    items.forEach(function (item) {
      panel.appendChild(
        el("div", { class: "effort-row" }, [
          el("div", { class: "effort-row__text" }, [
            el("div", { class: "effort-row__label" }, [item.title]),
            el("div", { class: "effort-row__note" }, [item.note])
          ]),
          el("div", { class: "effort-row__level" }, [
            el("span", { class: "effort-badge effort-badge--" + item.level }, [levelLabel[item.level]]),
            item.qualifier ? el("div", { class: "effort-row__qualifier" }, ["(" + item.qualifier + ")"]) : null
          ])
        ])
      );
    });
    panel.appendChild(
      el("div", { class: "effort-panel__disclaimer" }, [t("roadmap.effortDisclaimer")])
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
      el("span", { class: "upcoming-deadlines__label" }, [t("roadmap.upcomingDeadlines")])
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
        el("div", { class: "field-label", style: "color:var(--lavender);margin:0;" }, [t("roadmap.documentsForApplication", { uni: targetUni.name })]),
        el("span", { class: "badge badge--weight-medium" }, [t("roadmap.readyToSubmit", { done: doneCount, total: applicable.length })])
      ])
    );

    var list = el("div", { class: "doc-checklist", style: "margin-top:12px;" });
    applicable.forEach(function (item) {
      var current = (profile.documents || {})[item.key] || "not_started";
      var itemWrap = el("div", { class: "doc-item" });
      var row = el("div", { class: "doc-row" }, [
        el("span", { class: "doc-row__label" }, [tf(item.label)]),
        el("div", { class: "doc-status-group" })
      ]);
      var group = row.querySelector(".doc-status-group");
      DOC_STATUS_ORDER.forEach(function (statusKey) {
        var chip = el("button", {
          type: "button",
          class: "doc-status-chip" + (current === statusKey ? " doc-status-chip--active doc-status-chip--" + statusKey : "")
        }, [t(DOC_STATUS_LABEL_KEY[statusKey])]);
        chip.addEventListener("click", function () {
          var patch = { documents: {} };
          patch.documents[item.key] = statusKey;
          S.updateProfile(patch);
          render();
        });
        group.appendChild(chip);
      });
      itemWrap.appendChild(row);
      if (item.tip) C.renderTip(itemWrap, item.tip);
      list.appendChild(itemWrap);
    });
    wrap.appendChild(list);
    container.appendChild(wrap);
  }

  // ---------------- Мероприятия (информационно, без привязки к пути) ----------------
  function renderEvents(container, profile) {
    var events = D.EVENTS.filter(function (e) { return e.majors.some(function (m) { return (profile.majors || []).indexOf(m) !== -1; }); });
    if (!events.length) return;
    container.appendChild(el("h3", { style: "margin-top:var(--space-4);color:var(--lavender);" }, [t("roadmap.eventsForMajor")]));
    var grid = el("div", { class: "event-list" });
    events.forEach(function (ev) {
      grid.appendChild(
        el("div", { class: "event-card" }, [
          el("div", { class: "event-card__title" }, [ev.name]),
          el("div", { class: "event-card__meta" }, [tf(ev.type) + " · " + tf(ev.level) + " · " + tf(ev.format) + " · " + tf(ev.timing)]),
          el("p", { style: "margin:0 0 8px;color:var(--lavender-soft);" }, [tf(ev.whyBoost)]),
          ev.limitation ? el("p", { class: "muted", style: "margin:0;font-size:0.76rem;" }, [t("roadmap.limitation") + " " + tf(ev.limitation)]) : null,
          el("div", { class: "event-card__actions" }, [el("a", { class: "btn btn--secondary btn--sm", href: ev.website, target: "_blank", rel: "noopener" }, [t("roadmap.site")])])
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
    var locale = I.getLang() === "en" ? "en-US" : "ru-RU";

    mount.appendChild(el("h1", {}, [t("roadmap.printTitle")]));
    mount.appendChild(el("p", {}, [targetUni.name + " · " + C.countryLabel(targetUni.country) + " · " + C.majorsLabel(profile.majors)]));
    mount.appendChild(el("p", {}, [t("roadmap.printGeneratedOn", { date: new Date().toLocaleDateString(locale) })]));

    mount.appendChild(el("h2", {}, [t("roadmap.printOverview")]));
    var overview = el("div", { class: "print-plan__list" }, [
      el("div", { class: "print-plan__row" }, [t("roadmap.printUniversity") + " " + targetUni.name]),
      el("div", { class: "print-plan__row" }, [t("roadmap.printCountry") + " " + tf(targetUni.city) + ", " + C.countryLabel(targetUni.country)]),
      el("div", { class: "print-plan__row" }, [t("roadmap.printDeadline") + " " + tf(targetUni.deadlineMain)]),
      el("div", { class: "print-plan__row" }, [t("roadmap.printScholarship") + " " + (targetUni.scholarship ? tf(targetUni.scholarship) : t("compare.noData"))])
    ]);
    mount.appendChild(overview);

    mount.appendChild(el("h2", {}, [t("roadmap.printSteps")]));
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

    mount.appendChild(el("h2", {}, [t("roadmap.printDocuments")]));
    var docsList = el("div", { class: "print-plan__list" });
    var docs = profile.documents || {};
    D.DOCUMENT_ITEMS.forEach(function (item) {
      if (item.onlyMajor && (profile.majors || []).indexOf(item.onlyMajor) === -1) return;
      docsList.appendChild(el("div", { class: "print-plan__row" }, [tf(item.label) + " — " + t(DOC_STATUS_LABEL_KEY[docs[item.key]] || "roadmap.docNotStarted")]));
    });
    mount.appendChild(docsList);
  }

  function render() {
    var root = qs("#roadmap-root");
    root.innerHTML = "";
    C.renderDemoBadge(root);
    var profile = S.getProfile();

    if (!S.isProfileMinimal(profile)) {
      C.emptyState(root, {
        icon: "🗺️",
        title: t("roadmap.emptyTitle"),
        text: t("roadmap.emptyText"),
        actionLabel: t("common.fillProfile"),
        actionHref: "profile.html"
      });
      return;
    }

    var targetUni = profile.targetUniversityId ? D.UNIVERSITIES.filter(function (u) { return u.id === profile.targetUniversityId; })[0] : null;
    if (!targetUni) {
      C.emptyState(root, {
        icon: "🎯",
        title: t("roadmap.emptyTargetTitle"),
        text: t("roadmap.emptyTargetText"),
        actionLabel: t("compare.toRecommendations"),
        actionHref: "recommendations.html"
      });
      return;
    }

    syncJourneySteps(profile, targetUni);
    var freshProfile = S.getProfile();

    root.appendChild(
      el("div", { class: "flex items-center justify-between", style: "flex-wrap:wrap;gap:12px;" }, [
        el("div", {}, [
          el("h2", { style: "color:var(--lavender);margin-bottom:6px;" }, [t("roadmap.heading")]),
          el("p", { style: "color:var(--lavender-faint);max-width:560px;margin-bottom:0;" }, [
            t("roadmap.subtitle", { uni: targetUni.name, majors: C.majorsLabel(freshProfile.majors) })
          ])
        ]),
        (function () {
          var btn = el("button", { type: "button", class: "btn btn--secondary btn--sm" }, [t("roadmap.downloadPlan")]);
          btn.addEventListener("click", function () { buildPrintPlan(S.getProfile(), targetUni); window.print(); });
          return btn;
        })()
      ])
    );

    renderLegendPanel(root);
    renderEffortPanel(root);
    renderViewToggle(root);
    renderAddGoalForm(root, targetUni);
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
        el("a", { class: "btn btn--secondary", href: "compare.html" }, [t("roadmap.toCompareBack")]),
        el("a", { class: "btn btn--dark", href: "diagnosis.html" }, [t("roadmap.toDiagnosis")])
      ])
    );
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.roadmap = { init: render };
})(window);
