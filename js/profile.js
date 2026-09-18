/* Uniora — экран «Профиль»: анкета из 6 шагов. */
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

  var TOTAL_STEPS = 6;
  var draft = null;
  var currentStep = 1;

  function GRADE_OPTIONS() {
    return [
      { id: "grade_9_10", title: t("profile.grade9_10"), icon: "📘" },
      { id: "grade_11", title: t("profile.grade11"), icon: "🎓" },
      { id: "graduated", title: t("profile.graduated"), icon: "🧑‍🎓" },
      { id: "transfer", title: t("profile.transfer"), icon: "🔄" }
    ];
  }

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
    qs("#wizard-label").textContent = t("profile.stepLabel") + " " + currentStep + " " + t("profile.of") + " " + TOTAL_STEPS;
  }

  function updateNavButtons() {
    var back = qs("#btn-back");
    var next = qs("#btn-next");
    back.textContent = currentStep === 1 ? t("profile.toHome") : t("profile.back");
    next.textContent = currentStep === TOTAL_STEPS ? t("profile.done") : t("profile.next");
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
    heading(container, t("profile.step1Eyebrow"), t("profile.step1Title"), t("profile.step1Subtitle"));
    optionGrid(
      container, GRADE_OPTIONS(),
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
        el("div", { class: "option-card__title" }, [tf(m.label)]),
        el("div", { class: "option-card__sub" }, [tf(m.sub)])
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
    mount.appendChild(el("p", { class: "muted", style: "margin-top:12px;" }, [t("profile.majorsHint")]));

    var dontKnow = el("button", { type: "button", class: "btn btn--ghost btn--sm", style: "margin-top:8px;" }, [t("profile.dontKnowQuiz")]);
    dontKnow.addEventListener("click", function () { step2Mode = "quiz"; quizIndex = 0; quizAnswers = {}; refreshStep2(); });
    mount.appendChild(dontKnow);
  }

  function renderQuizQuestion(mount) {
    var q = D.CAREER_QUIZ[quizIndex];
    mount.appendChild(el("p", { class: "muted", style: "margin-bottom:4px;" }, [t("profile.quizQuestionOf") + " " + (quizIndex + 1) + " " + t("profile.quizOf") + " " + D.CAREER_QUIZ.length]));
    mount.appendChild(el("h3", { style: "margin-bottom:16px;" }, [tf(q.question)]));
    var options = q.options.map(function (o, i) { return { idx: i, title: tf(o.text), major: o.major }; });
    optionGrid(mount, options, function () { return false; }, function (opt) {
      quizAnswers[q.id] = opt.major;
      quizIndex++;
      if (quizIndex >= D.CAREER_QUIZ.length) step2Mode = "result";
      refreshStep2();
    });
    mount.appendChild(
      el("button", { type: "button", class: "btn btn--ghost btn--sm", style: "margin-top:16px;", onclick: function () { step2Mode = "grid"; refreshStep2(); } }, [t("profile.backToMajors")])
    );
  }

  function renderQuizResult(mount) {
    var result = M.scoreCareerQuiz(quizAnswers);
    var major = C.getMajor(result.major);
    var majorLabel = major ? tf(major.label) : "—";
    mount.appendChild(el("div", { class: "card", style: "text-align:center;" }, [
      el("div", { style: "font-size:2rem;margin-bottom:8px;" }, [major ? major.icon : "🎯"]),
      el("h3", {}, [t("profile.quizResultTitle") + " " + majorLabel]),
      el("p", {}, [t("profile.quizResultText", { answers: result.chosenLabels.slice(0, 3).join("», «") })]),
      el("div", { class: "flex gap-1", style: "justify-content:center;flex-wrap:wrap;" }, [
        el("button", {
          type: "button", class: "btn btn--primary",
          onclick: function () {
            if (draft.majors.indexOf(result.major) === -1) draft.majors.push(result.major);
            draft.majorsFromQuiz = true; persist(); step2Mode = "grid"; refreshStep2();
          }
        }, [t("profile.quizAdd", { major: majorLabel })]),
        el("button", { type: "button", class: "btn btn--secondary", onclick: function () { step2Mode = "grid"; refreshStep2(); } }, [t("profile.quizManual")]),
        el("button", { type: "button", class: "btn btn--ghost", onclick: function () { quizIndex = 0; quizAnswers = {}; step2Mode = "quiz"; refreshStep2(); } }, [t("profile.quizRetry")])
      ])
    ]));
  }

  function renderStep2(container) {
    heading(container, t("profile.step2Eyebrow"), t("profile.step2Title"), t("profile.step2Subtitle"));
    var mount = el("div", { id: "step2-mount" });
    container.appendChild(mount);
    refreshStep2();
  }

  // ---------------- Step 3 — страны ----------------
  function renderStep3(container) {
    heading(container, t("profile.step3Eyebrow"), t("profile.step3Title"), t("profile.step3Subtitle"));
    var options = D.COUNTRIES.map(function (c) { return { id: c.id, title: tf(c.label) + " " + c.flag }; });
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
      el("span", {}, [t("profile.showAllCountries")]),
      el("label", { class: "switch" }, [
        el("input", { type: "checkbox", checked: draft.showAllCountries ? "checked" : null, onchange: function (e) { draft.showAllCountries = e.target.checked; persist(); renderGrid(); } }),
        el("span", { class: "switch__track" })
      ])
    ]);
    container.appendChild(toggleWrap);

    container.appendChild(
      el("a", { href: "country-guide.html", class: "btn btn--ghost btn--sm", style: "margin-top:16px;display:inline-flex;" }, [t("profile.compareCountries")])
    );
  }

  // ---------------- Step 4 — достижения (4 свободные категории) ----------------
  function sectionMeta(key) {
    if (key === "sport") {
      var sportCount = draft.achievements.sport.practices.length;
      return sportCount ? sportCount + " " + t("profile.sportKindsCount") : t("profile.notSpecified");
    }
    var n = (draft.achievements[key] || []).length;
    return n ? n + " " + t("profile.recordsCount") : t("profile.notSpecified");
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
      var del = el("button", { type: "button", class: "icon-btn", title: t("profile.delete") }, ["✕"]);
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

    var addBtn = el("button", { type: "button", class: "btn btn--secondary btn--sm" }, [t("profile.addRecord")]);
    addBtn.addEventListener("click", function () {
      var record = { topic: "", result: "" };
      opts.getList().push(record);
      addRow(record);
      persist();
      opts.onChange();
    });
    body.appendChild(addBtn);
  }

  // options: массив {id, label:{ru,en}}. getArray() хранит выбранные id.
  function chipToggleGroup(container, options, getArray, onChange) {
    var group = el("div", { class: "chip-group" });
    options.forEach(function (opt) {
      var chip = el("button", {
        type: "button",
        class: "chip" + (getArray().indexOf(opt.id) !== -1 ? " chip--selected" : "")
      }, [tf(opt.label)]);
      chip.addEventListener("click", function () {
        var arr = getArray();
        var idx = arr.indexOf(opt.id);
        if (idx >= 0) arr.splice(idx, 1); else arr.push(opt.id);
        chip.classList.toggle("chip--selected");
        onChange();
      });
      group.appendChild(chip);
    });
    container.appendChild(group);
  }

  // ---- Спорт: виды спорта чипами (мультивыбор) + уровень достижения ----
  function renderSportCategory(root, cat) {
    var body = makeAccordionSection(root, cat.key, tf(cat.label));
    if (cat.note) body.appendChild(el("div", { class: "field-hint", style: "margin-bottom:10px;" }, [tf(cat.note)]));

    body.appendChild(el("div", { class: "field-label" }, [t("profile.sportTypes")]));
    chipToggleGroup(body, D.SPORTS, function () { return draft.achievements.sport.practices; }, function () {
      persist();
      updateMeta("sport");
    });

    body.appendChild(el("div", { class: "field-label", style: "margin-top:14px;" }, [t("profile.sportLevel")]));
    var select = el("select", { class: "text-input" });
    select.appendChild(el("option", { value: "" }, [t("profile.notChosen")]));
    D.SPORT_LEVELS.forEach(function (lvl) {
      select.appendChild(el("option", { value: lvl.id, selected: draft.achievements.sport.level === lvl.id ? "selected" : null }, [tf(lvl.label)]));
    });
    select.addEventListener("change", function () { draft.achievements.sport.level = select.value || null; persist(); });
    body.appendChild(select);
  }

  // ---- Волонтёрство: список записей (где / сфера / часы / результат) ----
  // record.sphere хранит id сферы (см. D.VOLUNTEER_SPHERES), не текст метки —
  // так переключение языка не ломает уже выбранную сферу.
  function renderVolunteeringRecords(body, opts) {
    var list = el("div", { class: "record-list" });
    body.appendChild(list);
    var emptyMsg = el("p", { class: "muted", style: "margin:0 0 10px;" }, [t("profile.noEntriesYet")]);

    function refreshEmptyState() {
      if (opts.getList().length === 0) {
        if (!emptyMsg.parentNode) body.insertBefore(emptyMsg, list);
      } else if (emptyMsg.parentNode) {
        emptyMsg.parentNode.removeChild(emptyMsg);
      }
    }

    function addRow(record) {
      var card = el("div", { class: "record-card" });
      var del = el("button", { type: "button", class: "icon-btn", title: t("profile.delete") }, ["✕"]);
      card.appendChild(el("div", { class: "record-card__top" }, [
        el("span", { class: "record-card__title" }, [t("profile.volunteerPlaceTitle")]),
        del
      ]));

      var placeInput = el("input", { class: "text-input", type: "text", placeholder: t("profile.volunteerPlacePlaceholder"), value: record.place || "" });
      placeInput.addEventListener("input", function () { record.place = placeInput.value; persist(); });
      card.appendChild(el("div", { class: "record-card__row" }, [placeInput]));

      card.appendChild(el("div", { class: "record-card__label" }, [t("profile.volunteerSphere")]));
      var sphereGroup = el("div", { class: "chip-group" });
      D.VOLUNTEER_SPHERES.forEach(function (sphere) {
        var chip = el("button", { type: "button", class: "chip" + (record.sphere === sphere.id ? " chip--selected" : "") }, [tf(sphere.label)]);
        chip.addEventListener("click", function () {
          record.sphere = record.sphere === sphere.id ? null : sphere.id;
          Array.prototype.forEach.call(sphereGroup.children, function (c) { c.classList.remove("chip--selected"); });
          if (record.sphere === sphere.id) chip.classList.add("chip--selected");
          persist();
        });
        sphereGroup.appendChild(chip);
      });
      card.appendChild(sphereGroup);

      var hoursInput = el("input", { class: "text-input", type: "number", min: "0", placeholder: t("profile.volunteerHours"), value: record.hours || "" });
      hoursInput.addEventListener("input", function () { record.hours = hoursInput.value ? Number(hoursInput.value) : null; persist(); });
      var descInput = el("input", { class: "text-input", type: "text", placeholder: t("profile.volunteerResult"), value: record.description || "" });
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

    var addBtn = el("button", { type: "button", class: "btn btn--secondary btn--sm" }, [t("profile.addRecord")]);
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
      el("div", {}, [tf(tip.intro)]),
      el("ul", { style: "margin:6px 0 0;padding-left:18px;" }, tf(tip.items).map(function (item) {
        return el("li", { style: "margin-bottom:4px;" }, [item]);
      }))
    ]);
    var toggle = el("button", { type: "button", class: "btn btn--ghost btn--sm", style: "margin-top:8px;" }, ["💡 " + tf(tip.title)]);
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
      var vBody = makeAccordionSection(root, cat.key, tf(cat.label));
      if (cat.note) vBody.appendChild(el("div", { class: "field-hint", style: "margin-bottom:10px;" }, [tf(cat.note)]));
      renderVolunteeringRecords(vBody, {
        getList: function () { return draft.achievements[cat.key]; },
        onChange: function () { updateMeta(cat.key); }
      });
      if (isFirst) qs("#acc-" + cat.key).classList.add("accordion-section--open");
      return;
    }
    var body = makeAccordionSection(root, cat.key, tf(cat.label));
    if (cat.note) body.appendChild(el("div", { class: "field-hint", style: "margin-bottom:10px;" }, [tf(cat.note)]));
    renderRecordCategory(body, {
      getList: function () { return draft.achievements[cat.key]; },
      placeholderA: tf(cat.placeholderA),
      placeholderB: tf(cat.placeholderB),
      onChange: function () { updateMeta(cat.key); }
    });
    if (cat.tip) renderTip(body, cat.tip);
    if (isFirst) qs("#acc-" + cat.key).classList.add("accordion-section--open");
  }

  function renderStep4(container) {
    heading(container, t("profile.step4Eyebrow"), t("profile.step4Title"), t("profile.step4Subtitle"));
    var root = el("div", { id: "accordion-root" });
    container.appendChild(root);

    D.ACHIEVEMENT_CATEGORIES.forEach(function (cat, i) {
      renderAchievementCategory(root, cat, i === 0);
    });

    container.appendChild(el("div", { class: "field-label", style: "margin-top:20px;" }, [t("profile.additional")]));
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
      state.notTaken ? t("profile.notTaken") : formatExamValue(opts.decimals, state.value)
    ]);

    var notTakenCheckbox;
    var toggleInline = el("div", { class: "toggle-inline" }, [
      el("span", { class: "muted" }, [t("profile.notTakenYet")]),
      el("label", { class: "switch" }, [
        (notTakenCheckbox = el("input", { type: "checkbox", checked: state.notTaken ? "checked" : null })),
        el("span", { class: "switch__track" })
      ])
    ]);
    wrap.appendChild(el("div", { class: "slider-field__top" }, [el("span", { class: "field-label", style: "margin:0;" }, [opts.label]), toggleInline]));

    wrap.appendChild(el("div", { class: "slider-field__value-row" }, [valueLabel]));

    var sliderVal = state.value !== null && state.value !== undefined ? state.value : opts.min;
    var slider = el("input", {
      type: "range", min: String(opts.min), max: String(opts.max), step: String(opts.step), value: String(sliderVal),
      disabled: state.notTaken ? "disabled" : null
    });
    slider.addEventListener("input", function () {
      var v = parseFloat(slider.value);
      opts.setValue(v, false);
      valueLabel.textContent = formatExamValue(opts.decimals, v);
      valueLabel.classList.remove("slider-field__value--muted");
      notTakenCheckbox.checked = false;
      persist();
    });
    wrap.appendChild(slider);
    wrap.appendChild(el("div", { class: "field-hint" }, [t("profile.maximum") + " " + opts.maxText]));
    if (opts.info) wrap.appendChild(el("div", { class: "field-hint" }, [opts.info]));
    if (opts.extraNote) wrap.appendChild(el("div", { class: "field-hint" }, [opts.extraNote]));

    notTakenCheckbox.addEventListener("change", function () {
      var checked = notTakenCheckbox.checked;
      var current = opts.getState();
      opts.setValue(checked ? null : (current.value !== null ? current.value : opts.min), checked);
      slider.disabled = checked;
      if (checked) {
        valueLabel.textContent = t("profile.notTaken");
        valueLabel.classList.add("slider-field__value--muted");
      } else {
        var v = opts.getState().value;
        if (v === null) { v = opts.min; opts.setValue(v, false); }
        valueLabel.textContent = formatExamValue(opts.decimals, v);
        valueLabel.classList.remove("slider-field__value--muted");
      }
      persist();
    });

    container.appendChild(wrap);
  }

  function renderStep5(container) {
    heading(container, t("profile.step5Eyebrow"), t("profile.step5Title"), t("profile.step5Subtitle"));

    buildSliderField(container, {
      label: t("profile.ieltsLabel"), min: 0, max: 9, step: 0.5, decimals: 1, maxText: "9.0",
      info: t("profile.ieltsInfo"),
      getState: function () { return draft.exams.ielts; },
      setValue: function (v, notTaken) { draft.exams.ielts.value = v; draft.exams.ielts.notTaken = notTaken; }
    });

    buildSliderField(container, {
      label: t("profile.toeflLabel"), min: 0, max: 120, step: 1, decimals: 0, maxText: "120",
      info: t("profile.toeflInfo"),
      getState: function () { return draft.exams.toefl; },
      setValue: function (v, notTaken) { draft.exams.toefl.value = v; draft.exams.toefl.notTaken = notTaken; }
    });

    buildSliderField(container, {
      label: t("profile.satLabel"), min: 400, max: 1600, step: 10, decimals: 0, maxText: "1600",
      info: t("profile.satInfo"),
      getState: function () { return draft.exams.sat; },
      setValue: function (v, notTaken) { draft.exams.sat.value = v; draft.exams.sat.notTaken = notTaken; }
    });

    buildSliderField(container, {
      label: t("profile.gpaLabel"), min: 0, max: 5, step: 0.1, decimals: 1, maxText: "5.0",
      info: t("profile.gpaInfo"),
      extraNote: t("profile.gpaExtraNote"),
      getState: function () { return draft.exams.gpa; },
      setValue: function (v, notTaken) { draft.exams.gpa.value = v; draft.exams.gpa.notTaken = notTaken; }
    });
  }

  // ---------------- Step 6 — сводка ----------------
  function renderStep6(container) {
    heading(container, t("profile.step6Eyebrow"), t("profile.step6Title"), t("profile.step6Subtitle"));
    var grid = el("div", { class: "summary-grid" });

    var gradeOpt = GRADE_OPTIONS().filter(function (g) { return g.id === draft.gradeLevel; })[0];
    var achCount = C.totalAchievementCount(draft.achievements, D.ACHIEVEMENT_CATEGORIES, D.CUSTOM_ACHIEVEMENT_CATEGORY.key);
    var exSummary = M.examsTakenSummary(draft);

    var rows = [
      { step: 1, title: t("profile.gradeLevelTitle"), value: gradeOpt ? gradeOpt.title : t("profile.notSpecified") },
      { step: 2, title: t("profile.majorTitle"), value: draft.majors.length ? C.majorsLabel(draft.majors) + (draft.majorsFromQuiz ? " " + t("profile.byQuiz") : "") : t("profile.notSpecified") },
      { step: 3, title: t("profile.countriesTitle"), value: draft.showAllCountries ? t("common.allCountries") : (draft.countries.length ? draft.countries.map(C.countryLabel).join(", ") : t("profile.notSpecified")) },
      { step: 4, title: t("profile.achievementsTitle"), value: achCount ? achCount + " " + t("profile.recordsCount") : t("profile.notSpecified") },
      { step: 5, title: t("profile.examsTitle"), value: exSummary.count + " " + t("profile.examsTaken", { total: exSummary.total }) }
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
    // Защита от устаревшей формы данных в localStorage (старые версии
    // схемы) — если поле неожиданной формы, не даём странице упасть.
    if (Array.isArray(draft.achievements.sport)) draft.achievements.sport = { practices: [], level: null };
    if (!draft.achievements.sport || !Array.isArray(draft.achievements.sport.practices)) {
      draft.achievements.sport = { practices: [], level: (draft.achievements.sport && draft.achievements.sport.level) || null };
    }
    D.ACHIEVEMENT_CATEGORIES.filter(function (c) { return c.variant !== "sport"; })
      .map(function (c) { return c.key; })
      .concat([D.CUSTOM_ACHIEVEMENT_CATEGORY.key])
      .forEach(function (key) {
        if (!Array.isArray(draft.achievements[key])) draft.achievements[key] = [];
      });
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
