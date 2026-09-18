/* Uniora — экран «Профиль»: анкета из 6 шагов. */
(function (global) {
  "use strict";

  var C = global.Uniora.common;
  var S = global.Uniora.state;
  var M = global.Uniora.match;
  var D = global.Uniora.data;
  var el = C.el;
  var qs = C.qs;

  var TOTAL_STEPS = 6;
  var draft = null;
  var currentStep = 1;

  var GRADE_OPTIONS = [
    { id: "grade_9_10", title: "9–10 класс", icon: "📘" },
    { id: "grade_11", title: "11 класс", icon: "🎓" },
    { id: "graduated", title: "Уже закончил(а) школу", icon: "🧑‍🎓" },
    { id: "transfer", title: "Хочу перевестись", icon: "🔄" }
  ];

  // step2 (специальность) — внутренний режим мини-квиза
  var step2Mode = "grid"; // grid | quiz | result
  var quizIndex = 0;
  var quizAnswers = {};

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function persist() { S.saveProfile(draft); }

  function heading(container, eyebrow, title, subtitle) {
    container.appendChild(
      el("div", { class: "section-heading" }, [
        eyebrow ? el("span", { class: "eyebrow" }, [eyebrow]) : null,
        el("h2", {}, [title]),
        subtitle ? el("p", {}, [subtitle]) : null
      ])
    );
  }

  function optionGrid(container, options, isSelected, onClick) {
    var grid = el("div", { class: "option-grid" });
    options.forEach(function (opt) {
      var selected = isSelected(opt);
      grid.appendChild(
        el(
          "button",
          { type: "button", class: "option-card" + (selected ? " option-card--selected" : ""), onclick: function () { onClick(opt); } },
          [
            opt.icon ? el("div", { class: "option-card__icon" }, [opt.icon]) : null,
            el("div", { class: "option-card__title" }, [opt.title]),
            opt.sub ? el("div", { class: "option-card__sub" }, [opt.sub]) : null
          ]
        )
      );
    });
    container.appendChild(grid);
  }

  // ---------------- Progress / nav ----------------
  function updateProgress() {
    qs("#wizard-fill").style.width = Math.round((currentStep / TOTAL_STEPS) * 100) + "%";
    qs("#wizard-label").textContent = "Шаг " + currentStep + " из " + TOTAL_STEPS;
  }

  function updateNavButtons() {
    var back = qs("#btn-back");
    var next = qs("#btn-next");
    back.textContent = currentStep === 1 ? "На главную" : "Назад";
    next.textContent = currentStep === TOTAL_STEPS ? "Готово" : "Далее";
  }

  function goBack() {
    persist();
    if (currentStep === 1) { window.location.href = "index.html"; return; }
    currentStep--;
    render();
  }

  function goNext() {
    persist();
    if (currentStep === TOTAL_STEPS) { window.location.href = "diagnosis.html"; return; }
    currentStep++;
    render();
  }

  function goToStep(n) { persist(); currentStep = n; render(); }

  // ---------------- Step 1 — класс ----------------
  function renderStep1(container) {
    heading(container, "Шаг 1 из 6", "На каком ты сейчас этапе?", "Это поможет понять, сколько времени есть на подготовку.");
    optionGrid(
      container, GRADE_OPTIONS,
      function (opt) { return draft.gradeLevel === opt.id; },
      function (opt) { draft.gradeLevel = opt.id; persist(); render(); }
    );
  }

  // ---------------- Step 2 — специальность (мультивыбор) ----------------
  function refreshStep2() {
    var mount = qs("#step2-mount");
    if (!mount) return;
    mount.innerHTML = "";
    if (step2Mode === "quiz") renderQuizQuestion(mount);
    else if (step2Mode === "result") renderQuizResult(mount);
    else renderMajorGrid(mount);
  }

  function renderMajorGrid(mount) {
    var grid = el("div", { class: "option-grid" });
    D.MAJORS.forEach(function (m) {
      var selected = draft.majors.indexOf(m.id) !== -1;
      var card = el("button", { type: "button", class: "option-card" + (selected ? " option-card--selected" : "") }, [
        el("div", { class: "option-card__icon" }, [m.icon]),
        el("div", { class: "option-card__title" }, [m.label]),
        el("div", { class: "option-card__sub" }, [m.sub])
      ]);
      card.addEventListener("click", function () {
        var idx = draft.majors.indexOf(m.id);
        if (idx >= 0) draft.majors.splice(idx, 1); else draft.majors.push(m.id);
        draft.majorsFromQuiz = false;
        persist();
        refreshStep2();
      });
      grid.appendChild(card);
    });
    mount.appendChild(grid);
    mount.appendChild(el("p", { class: "muted", style: "margin-top:12px;" }, ["Можно выбрать несколько — мы уточним приоритеты позже."]));

    var dontKnow = el("button", { type: "button", class: "btn btn--ghost btn--sm", style: "margin-top:8px;" }, ["❓ Ещё не знаю — пройти мини-квиз"]);
    dontKnow.addEventListener("click", function () { step2Mode = "quiz"; quizIndex = 0; quizAnswers = {}; refreshStep2(); });
    mount.appendChild(dontKnow);
  }

  function renderQuizQuestion(mount) {
    var q = D.CAREER_QUIZ[quizIndex];
    mount.appendChild(el("p", { class: "muted", style: "margin-bottom:4px;" }, ["Вопрос " + (quizIndex + 1) + " из " + D.CAREER_QUIZ.length]));
    mount.appendChild(el("h3", { style: "margin-bottom:16px;" }, [q.question]));
    var options = q.options.map(function (o, i) { return { idx: i, title: o.text, major: o.major }; });
    optionGrid(mount, options, function () { return false; }, function (opt) {
      quizAnswers[q.id] = opt.major;
      quizIndex++;
      if (quizIndex >= D.CAREER_QUIZ.length) step2Mode = "result";
      refreshStep2();
    });
    mount.appendChild(
      el("button", { type: "button", class: "btn btn--ghost btn--sm", style: "margin-top:16px;", onclick: function () { step2Mode = "grid"; refreshStep2(); } }, ["← Вернуться к списку специальностей"])
    );
  }

  function renderQuizResult(mount) {
    var result = M.scoreCareerQuiz(quizAnswers);
    var major = C.getMajor(result.major);
    mount.appendChild(el("div", { class: "card", style: "text-align:center;" }, [
      el("div", { style: "font-size:2rem;margin-bottom:8px;" }, [major ? major.icon : "🎯"]),
      el("h3", {}, ["Похоже, это направление: " + (major ? major.label : "—")]),
      el("p", {}, ["Судя по ответам («" + result.chosenLabels.slice(0, 3).join("», «") + "»…), это направление ближе всего — подсказка, а не итоговое решение."]),
      el("div", { class: "flex gap-1", style: "justify-content:center;flex-wrap:wrap;" }, [
        el("button", {
          type: "button", class: "btn btn--primary",
          onclick: function () {
            if (draft.majors.indexOf(result.major) === -1) draft.majors.push(result.major);
            draft.majorsFromQuiz = true; persist(); step2Mode = "grid"; refreshStep2();
          }
        }, ["Добавить «" + (major ? major.label : "—") + "»"]),
        el("button", { type: "button", class: "btn btn--secondary", onclick: function () { step2Mode = "grid"; refreshStep2(); } }, ["Выбрать вручную"]),
        el("button", { type: "button", class: "btn btn--ghost", onclick: function () { quizIndex = 0; quizAnswers = {}; step2Mode = "quiz"; refreshStep2(); } }, ["Пройти заново"])
      ])
    ]));
  }

  function renderStep2(container) {
    heading(container, "Шаг 2 из 6", "Какое направление тебе ближе?", "Не уверен(а)? Пройди мини-квиз из 5 вопросов — это подсказка, а не окончательное решение.");
    var mount = el("div", { id: "step2-mount" });
    container.appendChild(mount);
    refreshStep2();
  }

  // ---------------- Step 3 — страны ----------------
  function renderStep3(container) {
    heading(container, "Шаг 3 из 6", "В какие страны рассматриваешь поступление?", "Можно выбрать несколько — рекомендации пересчитаются под них.");
    var options = D.COUNTRIES.map(function (c) { return { id: c.id, title: c.flag + " " + c.label }; });
    var grid = el("div", { id: "country-grid" });
    container.appendChild(grid);

    function renderGrid() {
      grid.innerHTML = "";
      grid.style.opacity = draft.showAllCountries ? "0.5" : "1";
      grid.style.pointerEvents = draft.showAllCountries ? "none" : "auto";
      optionGrid(
        grid, options,
        function (opt) { return draft.countries.indexOf(opt.id) !== -1; },
        function (opt) {
          var idx = draft.countries.indexOf(opt.id);
          if (idx >= 0) draft.countries.splice(idx, 1); else draft.countries.push(opt.id);
          persist();
          renderGrid();
        }
      );
    }
    renderGrid();

    var toggleWrap = el("div", { class: "toggle-row", style: "margin-top:16px;" }, [
      el("span", {}, ["Показать вузы по всем странам"]),
      el("label", { class: "switch" }, [
        el("input", { type: "checkbox", checked: draft.showAllCountries ? "checked" : null, onchange: function (e) { draft.showAllCountries = e.target.checked; persist(); renderGrid(); } }),
        el("span", { class: "switch__track" })
      ])
    ]);
    container.appendChild(toggleWrap);

    container.appendChild(
      el("a", { href: "country-guide.html", class: "btn btn--ghost btn--sm", style: "margin-top:16px;display:inline-flex;" }, ["Ещё не решили? Сравнить страны →"])
    );
  }

  // ---------------- Step 4 — достижения (4 свободные категории) ----------------
  function sectionMeta(key) {
    if (key === "sport") {
      var sportCount = draft.achievements.sport.practices.length;
      return sportCount ? sportCount + " вид(а)" : "Не указано";
    }
    var n = (draft.achievements[key] || []).length;
    return n ? n + " запис(ей)" : "Не указано";
  }

  function updateMeta(key) {
    var span = qs("#meta-" + key);
    if (span) span.textContent = sectionMeta(key);
  }

  function makeAccordionSection(root, key, title) {
    var section = el("div", { class: "accordion-section", id: "acc-" + key });
    var header = el(
      "button", { type: "button", class: "accordion-header", onclick: function () { section.classList.toggle("accordion-section--open"); } },
      [
        el("span", {}, [title]),
        el("span", { class: "flex items-center gap-1" }, [
          el("span", { class: "accordion-header__meta", id: "meta-" + key }, [sectionMeta(key)]),
          el("span", { class: "accordion-chevron" }, ["▾"])
        ])
      ]
    );
    var body = el("div", { class: "accordion-body" });
    section.appendChild(header);
    section.appendChild(body);
    root.appendChild(section);
    return body;
  }

  function renderRecordCategory(body, opts) {
    var list = el("div", { class: "record-list" });
    body.appendChild(list);

    function addRow(record) {
      var row = el("div", { class: "record-row" });
      var inputA = el("input", { class: "text-input", type: "text", placeholder: opts.placeholderA, value: record.topic || "" });
      var inputB = el("input", { class: "text-input", type: "text", placeholder: opts.placeholderB, value: record.result || "" });
      inputA.addEventListener("input", function () { record.topic = inputA.value; persist(); });
      inputB.addEventListener("input", function () { record.result = inputB.value; persist(); });
      var del = el("button", { type: "button", class: "icon-btn", title: "Удалить" }, ["✕"]);
      del.addEventListener("click", function () {
        var arr = opts.getList();
        var idx = arr.indexOf(record);
        if (idx >= 0) arr.splice(idx, 1);
        list.removeChild(row);
        persist();
        opts.onChange();
      });
      row.appendChild(inputA); row.appendChild(inputB); row.appendChild(del);
      list.appendChild(row);
    }

    opts.getList().forEach(addRow);

    var addBtn = el("button", { type: "button", class: "btn btn--secondary btn--sm" }, ["+ Добавить запись"]);
    addBtn.addEventListener("click", function () {
      var record = { topic: "", result: "" };
      opts.getList().push(record);
      addRow(record);
      persist();
      opts.onChange();
    });
    body.appendChild(addBtn);
  }

  function chipToggleGroup(container, options, getArray, onChange) {
    var group = el("div", { class: "chip-group" });
    options.forEach(function (label) {
      var chip = el("button", {
        type: "button",
        class: "chip" + (getArray().indexOf(label) !== -1 ? " chip--selected" : "")
      }, [label]);
      chip.addEventListener("click", function () {
        var arr = getArray();
        var idx = arr.indexOf(label);
        if (idx >= 0) arr.splice(idx, 1); else arr.push(label);
        chip.classList.toggle("chip--selected");
        onChange();
      });
      group.appendChild(chip);
    });
    container.appendChild(group);
  }

  // ---- Спорт: виды спорта чипами (мультивыбор) + уровень достижения ----
  function renderSportCategory(root, cat) {
    var body = makeAccordionSection(root, cat.key, cat.label);
    if (cat.note) body.appendChild(el("div", { class: "field-hint", style: "margin-bottom:10px;" }, [cat.note]));

    body.appendChild(el("div", { class: "field-label" }, ["Виды спорта"]));
    chipToggleGroup(body, D.SPORTS, function () { return draft.achievements.sport.practices; }, function () {
      persist();
      updateMeta("sport");
    });

    body.appendChild(el("div", { class: "field-label", style: "margin-top:14px;" }, ["Уровень достижения"]));
    var select = el("select", { class: "text-input" });
    select.appendChild(el("option", { value: "" }, ["Не выбрано"]));
    D.SPORT_LEVELS.forEach(function (lvl) {
      select.appendChild(el("option", { value: lvl.id, selected: draft.achievements.sport.level === lvl.id ? "selected" : null }, [lvl.label]));
    });
    select.addEventListener("change", function () { draft.achievements.sport.level = select.value || null; persist(); });
    body.appendChild(select);
  }

  // ---- Волонтёрство: список записей (где / сфера / часы / результат) ----
  function renderVolunteeringRecords(body, opts) {
    var list = el("div", { class: "record-list" });
    body.appendChild(list);
    var emptyMsg = el("p", { class: "muted", style: "margin:0 0 10px;" }, ["Пока не добавлено ни одного пункта."]);

    function refreshEmptyState() {
      if (opts.getList().length === 0) {
        if (!emptyMsg.parentNode) body.insertBefore(emptyMsg, list);
      } else if (emptyMsg.parentNode) {
        emptyMsg.parentNode.removeChild(emptyMsg);
      }
    }

    function addRow(record) {
      var card = el("div", { class: "record-card" });
      var del = el("button", { type: "button", class: "icon-btn", title: "Удалить" }, ["✕"]);
      card.appendChild(el("div", { class: "record-card__top" }, [
        el("span", { class: "record-card__title" }, ["Место волонтёрства"]),
        del
      ]));

      var placeInput = el("input", { class: "text-input", type: "text", placeholder: "Где — например, «Приют для животных «Дружок»»", value: record.place || "" });
      placeInput.addEventListener("input", function () { record.place = placeInput.value; persist(); });
      card.appendChild(el("div", { class: "record-card__row" }, [placeInput]));

      card.appendChild(el("div", { class: "record-card__label" }, ["Сфера"]));
      var sphereGroup = el("div", { class: "chip-group" });
      D.VOLUNTEER_SPHERES.forEach(function (label) {
        var chip = el("button", { type: "button", class: "chip" + (record.sphere === label ? " chip--selected" : "") }, [label]);
        chip.addEventListener("click", function () {
          record.sphere = record.sphere === label ? null : label;
          Array.prototype.forEach.call(sphereGroup.children, function (c) { c.classList.remove("chip--selected"); });
          if (record.sphere === label) chip.classList.add("chip--selected");
          persist();
        });
        sphereGroup.appendChild(chip);
      });
      card.appendChild(sphereGroup);

      var hoursInput = el("input", { class: "text-input", type: "number", min: "0", placeholder: "Часов (необязательно)", value: record.hours || "" });
      hoursInput.addEventListener("input", function () { record.hours = hoursInput.value ? Number(hoursInput.value) : null; persist(); });
      var descInput = el("input", { class: "text-input", type: "text", placeholder: "Результат / что делал(а) (необязательно)", value: record.description || "" });
      descInput.addEventListener("input", function () { record.description = descInput.value; persist(); });
      card.appendChild(el("div", { class: "record-card__row", style: "margin-top:10px;" }, [hoursInput, descInput]));

      del.addEventListener("click", function () {
        var arr = opts.getList();
        var idx = arr.indexOf(record);
        if (idx >= 0) arr.splice(idx, 1);
        list.removeChild(card);
        refreshEmptyState();
        persist();
        opts.onChange();
      });

      list.appendChild(card);
    }

    opts.getList().forEach(addRow);
    refreshEmptyState();

    var addBtn = el("button", { type: "button", class: "btn btn--secondary btn--sm" }, ["+ Добавить запись"]);
    addBtn.addEventListener("click", function () {
      var record = { place: "", sphere: null, hours: null, description: "" };
      opts.getList().push(record);
      addRow(record);
      refreshEmptyState();
      persist();
      opts.onChange();
    });
    body.appendChild(addBtn);
  }

  function renderTip(body, tip) {
    var open = false;
    var content = el("div", { class: "field-hint", style: "margin-top:8px;display:none;" }, [
      el("div", {}, [tip.intro]),
      el("ul", { style: "margin:6px 0 0;padding-left:18px;" }, tip.items.map(function (item) {
        return el("li", { style: "margin-bottom:4px;" }, [item]);
      }))
    ]);
    var toggle = el("button", { type: "button", class: "btn btn--ghost btn--sm", style: "margin-top:8px;" }, ["💡 " + tip.title]);
    toggle.addEventListener("click", function () {
      open = !open;
      content.style.display = open ? "block" : "none";
    });
    body.appendChild(toggle);
    body.appendChild(content);
  }

  function renderAchievementCategory(root, cat, isFirst) {
    if (cat.variant === "sport") {
      renderSportCategory(root, cat);
      if (isFirst) qs("#acc-" + cat.key).classList.add("accordion-section--open");
      return;
    }
    if (cat.variant === "volunteering") {
      var vBody = makeAccordionSection(root, cat.key, cat.label);
      if (cat.note) vBody.appendChild(el("div", { class: "field-hint", style: "margin-bottom:10px;" }, [cat.note]));
      renderVolunteeringRecords(vBody, {
        getList: function () { return draft.achievements[cat.key]; },
        onChange: function () { updateMeta(cat.key); }
      });
      if (isFirst) qs("#acc-" + cat.key).classList.add("accordion-section--open");
      return;
    }
    var body = makeAccordionSection(root, cat.key, cat.label);
    if (cat.note) body.appendChild(el("div", { class: "field-hint", style: "margin-bottom:10px;" }, [cat.note]));
    renderRecordCategory(body, {
      getList: function () { return draft.achievements[cat.key]; },
      placeholderA: cat.placeholderA,
      placeholderB: cat.placeholderB,
      onChange: function () { updateMeta(cat.key); }
    });
    if (cat.tip) renderTip(body, cat.tip);
    if (isFirst) qs("#acc-" + cat.key).classList.add("accordion-section--open");
  }

  function renderStep4(container) {
    heading(container, "Шаг 4 из 6", "Расскажи о своих достижениях", "Это усилит эссе и поможет подобрать вузы с грантами для сильных абитуриентов. Всё опционально.");
    var root = el("div", { id: "accordion-root" });
    container.appendChild(root);

    D.ACHIEVEMENT_CATEGORIES.forEach(function (cat, i) {
      renderAchievementCategory(root, cat, i === 0);
    });

    container.appendChild(el("div", { class: "field-label", style: "margin-top:20px;" }, ["Дополнительно"]));
    renderAchievementCategory(container, D.CUSTOM_ACHIEVEMENT_CATEGORY, false);
  }

  // ---------------- Step 5 — экзамены ----------------
  function formatExamValue(decimals, value) {
    if (value === null || value === undefined) return "—";
    return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
  }

  function buildSliderField(container, opts) {
    // opts: {label, min, max, step, decimals, maxText, info, extraNote, getState, setValue}
    var state = opts.getState();
    var wrap = el("div", { class: "slider-field" });
    var valueLabel = el("span", { class: "slider-field__value" + (state.notTaken || state.value === null ? " slider-field__value--muted" : "") }, [
      state.notTaken ? "Не сдавал(а)" : formatExamValue(opts.decimals, state.value)
    ]);
    wrap.appendChild(el("div", { class: "slider-field__top" }, [el("span", { class: "field-label", style: "margin:0;" }, [opts.label]), valueLabel]));

    var sliderVal = state.value !== null && state.value !== undefined ? state.value : opts.min;
    var slider = el("input", {
      type: "range", min: String(opts.min), max: String(opts.max), step: String(opts.step), value: String(sliderVal),
      disabled: state.notTaken ? "disabled" : null
    });
    var notTakenCheckbox;
    slider.addEventListener("input", function () {
      var v = parseFloat(slider.value);
      opts.setValue(v, false);
      valueLabel.textContent = formatExamValue(opts.decimals, v);
      valueLabel.classList.remove("slider-field__value--muted");
      notTakenCheckbox.checked = false;
      persist();
    });
    wrap.appendChild(slider);
    wrap.appendChild(el("div", { class: "field-hint" }, ["Максимум: " + opts.maxText]));
    if (opts.info) wrap.appendChild(el("div", { class: "field-hint" }, [opts.info]));
    if (opts.extraNote) wrap.appendChild(el("div", { class: "field-hint" }, [opts.extraNote]));

    var toggleRow = el("div", { class: "toggle-row" }, [
      el("span", { class: "muted" }, ["Ещё не сдавал(а)"]),
      el("label", { class: "switch" }, [
        (notTakenCheckbox = el("input", { type: "checkbox", checked: state.notTaken ? "checked" : null })),
        el("span", { class: "switch__track" })
      ])
    ]);
    notTakenCheckbox.addEventListener("change", function () {
      var checked = notTakenCheckbox.checked;
      var current = opts.getState();
      opts.setValue(checked ? null : (current.value !== null ? current.value : opts.min), checked);
      slider.disabled = checked;
      if (checked) {
        valueLabel.textContent = "Не сдавал(а)";
        valueLabel.classList.add("slider-field__value--muted");
      } else {
        var v = opts.getState().value;
        if (v === null) { v = opts.min; opts.setValue(v, false); }
        valueLabel.textContent = formatExamValue(opts.decimals, v);
        valueLabel.classList.remove("slider-field__value--muted");
      }
      persist();
    });
    wrap.appendChild(toggleRow);
    container.appendChild(wrap);
  }

  function renderStep5(container) {
    heading(container, "Шаг 5 из 6", "Отметь свои баллы", "Двигай ползунки — мы сразу покажем, для каких вузов этого достаточно, а где стоит подтянуться. Если экзамен ещё не сдавал(а) — просто отметь тумблер, он не будет учтён как 0.");

    buildSliderField(container, {
      label: "IELTS Academic", min: 0, max: 9, step: 0.5, decimals: 1, maxText: "9.0",
      info: "Международный экзамен по английскому языку.",
      getState: function () { return draft.exams.ielts; },
      setValue: function (v, notTaken) { draft.exams.ielts.value = v; draft.exams.ielts.notTaken = notTaken; }
    });

    buildSliderField(container, {
      label: "TOEFL iBT", min: 0, max: 120, step: 1, decimals: 0, maxText: "120",
      info: "Альтернатива IELTS — тоже международный экзамен по английскому языку, шкала другая.",
      getState: function () { return draft.exams.toefl; },
      setValue: function (v, notTaken) { draft.exams.toefl.value = v; draft.exams.toefl.notTaken = notTaken; }
    });

    buildSliderField(container, {
      label: "SAT", min: 400, max: 1600, step: 10, decimals: 0, maxText: "1600",
      info: "Стандартизированный тест для поступления в вузы США (и ряда других стран).",
      getState: function () { return draft.exams.sat; },
      setValue: function (v, notTaken) { draft.exams.sat.value = v; draft.exams.sat.notTaken = notTaken; }
    });

    buildSliderField(container, {
      label: "Средний балл аттестата (GPA)", min: 0, max: 5, step: 0.1, decimals: 1, maxText: "5.0",
      info: "Средний балл школьного аттестата по 5-балльной шкале.",
      extraNote: "Это ориентир, а не универсальный стандарт — разные вузы переводят GPA по-разному.",
      getState: function () { return draft.exams.gpa; },
      setValue: function (v, notTaken) { draft.exams.gpa.value = v; draft.exams.gpa.notTaken = notTaken; }
    });
  }

  // ---------------- Step 6 — сводка ----------------
  function renderStep6(container) {
    heading(container, "Шаг 6 из 6", "Проверь и подтверди", "Клик по любому пункту — сразу к нужному шагу.");
    var grid = el("div", { class: "summary-grid" });

    var gradeOpt = GRADE_OPTIONS.filter(function (g) { return g.id === draft.gradeLevel; })[0];
    var achCount = C.totalAchievementCount(draft.achievements, D.ACHIEVEMENT_CATEGORIES, D.CUSTOM_ACHIEVEMENT_CATEGORY.key);
    var exSummary = M.examsTakenSummary(draft);

    var rows = [
      { step: 1, title: "Этап обучения", value: gradeOpt ? gradeOpt.title : "Не указано" },
      { step: 2, title: "Специальность", value: draft.majors.length ? C.majorsLabel(draft.majors) + (draft.majorsFromQuiz ? " (по квизу)" : "") : "Не указано" },
      { step: 3, title: "Страны", value: draft.showAllCountries ? "Все страны" : (draft.countries.length ? draft.countries.map(C.countryLabel).join(", ") : "Не указано") },
      { step: 4, title: "Достижения", value: achCount ? achCount + " запис(ей)" : "Не указано" },
      { step: 5, title: "Экзамены", value: exSummary.count + " из " + exSummary.total + " сдано" }
    ];

    rows.forEach(function (row) {
      grid.appendChild(
        el("div", { class: "summary-row", onclick: function () { goToStep(row.step); } }, [
          el("div", {}, [el("div", { class: "summary-row__title" }, [row.title]), el("div", { class: "summary-row__value" }, [row.value])]),
          el("span", { class: "muted" }, ["✎"])
        ])
      );
    });

    container.appendChild(grid);
  }

  // ---------------- Init ----------------
  function render() {
    updateProgress();
    var container = qs("#step-content");
    container.innerHTML = "";
    var renderers = [null, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6];
    renderers[currentStep](container);
    updateNavButtons();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function init() {
    draft = clone(S.getProfile());
    if (Array.isArray(draft.achievements.sport)) draft.achievements.sport = { practices: [], level: null };
    currentStep = 1;
    var params = new URLSearchParams(window.location.search);
    var stepParam = parseInt(params.get("step"), 10);
    if (stepParam >= 1 && stepParam <= TOTAL_STEPS) currentStep = stepParam;
    render();
    qs("#btn-back").addEventListener("click", goBack);
    qs("#btn-next").addEventListener("click", goNext);
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.profile = { init: init };
})(window);
