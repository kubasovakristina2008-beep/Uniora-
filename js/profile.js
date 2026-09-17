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

  var EXAMS_CONFIG = [
    { key: "ielts", label: "IELTS", min: 0, max: 9, step: 0.5, decimals: 1, info: "Международный экзамен по английскому языку, шкала 0–9." },
    { key: "sat", label: "SAT", min: 400, max: 1600, step: 10, decimals: 0, info: "Стандартизированный тест для поступления в США, шкала 400–1600." },
    { key: "toefl", label: "TOEFL", min: 0, max: 120, step: 1, decimals: 0, info: "Альтернатива IELTS, тоже проверяет английский, шкала 0–120." },
    { key: "gpa", label: "GPA (средний балл аттестата)", min: 0, max: 5, step: 0.1, decimals: 1, info: "Средний балл школьного аттестата по 5-балльной шкале." }
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
          {
            type: "button",
            class: "option-card" + (selected ? " option-card--selected" : ""),
            onclick: function () { onClick(opt); }
          },
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
      container,
      GRADE_OPTIONS,
      function (opt) { return draft.gradeLevel === opt.id; },
      function (opt) { draft.gradeLevel = opt.id; persist(); render(); }
    );
  }

  // ---------------- Step 2 — специальность ----------------
  function refreshStep2() {
    var mount = qs("#step2-mount");
    if (!mount) return;
    mount.innerHTML = "";
    if (step2Mode === "quiz") renderQuizQuestion(mount);
    else if (step2Mode === "result") renderQuizResult(mount);
    else renderMajorGrid(mount);
  }

  function renderMajorGrid(mount) {
    var options = D.MAJORS.map(function (m) { return { id: m.id, title: m.label, icon: m.icon }; });
    options.push({ id: "__unknown", title: "Ещё не знаю", icon: "❓", sub: "Пройти мини-квиз" });
    optionGrid(
      mount,
      options,
      function (opt) { return opt.id !== "__unknown" && draft.major === opt.id; },
      function (opt) {
        if (opt.id === "__unknown") {
          step2Mode = "quiz"; quizIndex = 0; quizAnswers = {};
          refreshStep2();
          return;
        }
        draft.major = opt.id; draft.majorFromQuiz = false; persist();
        refreshStep2();
      }
    );
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
      el("p", {}, [
        "Судя по ответам («" + result.chosenLabels.slice(0, 3).join("», «") + "»…), это направление ближе всего — подсказка, а не итоговое решение."
      ]),
      el("div", { class: "flex gap-1", style: "justify-content:center;flex-wrap:wrap;" }, [
        el("button", {
          type: "button", class: "btn btn--primary",
          onclick: function () { draft.major = result.major; draft.majorFromQuiz = true; persist(); step2Mode = "grid"; refreshStep2(); }
        }, ["Использовать «" + (major ? major.label : "—") + "»"]),
        el("button", { type: "button", class: "btn btn--secondary", onclick: function () { step2Mode = "grid"; refreshStep2(); } }, ["Выбрать вручную"]),
        el("button", { type: "button", class: "btn btn--ghost", onclick: function () { quizIndex = 0; quizAnswers = {}; step2Mode = "quiz"; refreshStep2(); } }, ["Пройти заново"])
      ])
    ]));
  }

  function renderStep2(container) {
    heading(container, "Шаг 2 из 6", "Какая специальность интересует?", "Не уверен(а)? Пройди мини-квиз из 5 вопросов — это подсказка, а не окончательное решение.");
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
        grid,
        options,
        function (opt) { return draft.countries.indexOf(opt.id) !== -1; },
        function (opt) {
          var idx = draft.countries.indexOf(opt.id);
          if (idx >= 0) draft.countries.splice(idx, 1);
          else draft.countries.push(opt.id);
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
  }

  // ---------------- Step 4 — достижения ----------------
  function sectionMeta(key) {
    var a = draft.achievements;
    if (key === "sport") return a.sport.practices.length ? a.sport.practices.length + " вид(а)" : "Не указано";
    if (key === "volunteering") return a.volunteering.active ? "Есть опыт" : "Не указано";
    if (key === "academic") {
      var n = a.academic.projects.length + a.academic.olympiads.length + a.academic.research.length + a.academic.hackathons.length;
      return n ? n + " запис(ей)" : "Не указано";
    }
    if (key === "internship") return a.internship.active ? "Есть опыт" : "Не указано";
    if (key === "creative") return a.creative.works.length ? a.creative.works.length + " работ(ы)" : "Не указано";
    return "";
  }

  function updateMeta(key) {
    var span = qs("#meta-" + key);
    if (span) span.textContent = sectionMeta(key);
  }

  function updatePortfolioIndicator() {
    C.portfolioBar("#portfolio-indicator", M.portfolioStrength(draft));
  }

  function makeAccordionSection(root, key, title) {
    var section = el("div", { class: "accordion-section", id: "acc-" + key });
    var header = el(
      "button",
      { type: "button", class: "accordion-header", onclick: function () { section.classList.toggle("accordion-section--open"); } },
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

  function singleChipGroup(container, options, getValue, setValue, onChange) {
    var group = el("div", { class: "chip-group" });
    var chips = [];
    options.forEach(function (label) {
      var chip = el("button", { type: "button", class: "chip" + (getValue() === label ? " chip--selected" : "") }, [label]);
      chip.addEventListener("click", function () {
        setValue(label);
        chips.forEach(function (c) { c.classList.remove("chip--selected"); });
        chip.classList.add("chip--selected");
        onChange();
      });
      chips.push(chip);
      group.appendChild(chip);
    });
    container.appendChild(group);
  }

  function renderRecordCategory(body, opts) {
    // opts: { title, hint, getList, placeholderA, placeholderB, onChange }
    body.appendChild(el("div", { class: "field-label", style: "margin-top:14px;" }, [opts.title]));
    if (opts.hint) body.appendChild(el("div", { class: "field-hint", style: "margin-bottom:10px;" }, [opts.hint]));
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

  function renderStep4(container) {
    heading(container, "Шаг 4 из 6", "Достижения", "Всё опционально — заполняйте то, что реально есть. Это влияет только на честную диагностику, не на доступ к рекомендациям.");
    var root = el("div", { id: "accordion-root" });
    container.appendChild(root);

    // Спорт
    (function () {
      var body = makeAccordionSection(root, "sport", "🏅 Спорт");
      body.appendChild(el("div", { class: "field-label" }, ["Виды спорта"]));
      chipToggleGroup(body, D.SPORTS, function () { return draft.achievements.sport.practices; }, function () {
        persist(); updateMeta("sport"); updatePortfolioIndicator();
      });
      body.appendChild(el("div", { class: "field-label", style: "margin-top:14px;" }, ["Уровень"]));
      var select = el("select", { class: "text-input" });
      select.appendChild(el("option", { value: "" }, ["Не выбрано"]));
      D.SPORT_LEVELS.forEach(function (lvl) {
        select.appendChild(el("option", { value: lvl.id, selected: draft.achievements.sport.level === lvl.id ? "selected" : null }, [lvl.label]));
      });
      select.addEventListener("change", function () { draft.achievements.sport.level = select.value || null; persist(); });
      body.appendChild(select);
    })();

    // Волонтёрство
    (function () {
      var body = makeAccordionSection(root, "volunteering", "🤝 Волонтёрство");
      var spheresWrap = el("div", { style: draft.achievements.volunteering.active ? "" : "display:none;" });
      var hoursWrap = el("div", { style: draft.achievements.volunteering.active ? "margin-top:12px;" : "display:none;" });

      body.appendChild(el("div", { class: "toggle-row" }, [
        el("span", {}, ["Есть опыт волонтёрства"]),
        el("label", { class: "switch" }, [
          el("input", {
            type: "checkbox", checked: draft.achievements.volunteering.active ? "checked" : null,
            onchange: function (e) {
              draft.achievements.volunteering.active = e.target.checked;
              spheresWrap.style.display = e.target.checked ? "" : "none";
              hoursWrap.style.display = e.target.checked ? "" : "none";
              persist(); updateMeta("volunteering"); updatePortfolioIndicator();
            }
          }),
          el("span", { class: "switch__track" })
        ])
      ]));

      spheresWrap.appendChild(el("div", { class: "field-label" }, ["Сфера"]));
      chipToggleGroup(spheresWrap, D.VOLUNTEER_SPHERES, function () { return draft.achievements.volunteering.spheres; }, function () { persist(); });
      body.appendChild(spheresWrap);

      hoursWrap.appendChild(el("div", { class: "field-label" }, ["Часы волонтёрства (необязательно)"]));
      var hoursInput = el("input", { class: "text-input", type: "number", min: "0", placeholder: "Например, 40", value: draft.achievements.volunteering.hours || "" });
      hoursInput.addEventListener("input", function () {
        draft.achievements.volunteering.hours = hoursInput.value ? Number(hoursInput.value) : null;
        persist();
      });
      hoursWrap.appendChild(hoursInput);
      body.appendChild(hoursWrap);
    })();

    // Академические
    (function () {
      var body = makeAccordionSection(root, "academic", "📚 Академические достижения");
      var onChange = function () { updateMeta("academic"); updatePortfolioIndicator(); };
      renderRecordCategory(body, {
        title: "Проекты по специальности",
        getList: function () { return draft.achievements.academic.projects; },
        placeholderA: "Область / тема проекта",
        placeholderB: "Результат / достижение",
        onChange: onChange
      });
      renderRecordCategory(body, {
        title: "Олимпиады",
        hint: "Учитываются только олимпиады республиканского или международного уровня — школьные и городские почти не рассматриваются приёмными комиссиями за рубежом.",
        getList: function () { return draft.achievements.academic.olympiads; },
        placeholderA: "Название олимпиады",
        placeholderB: "Результат / достижение",
        onChange: onChange
      });
      renderRecordCategory(body, {
        title: "Исследования (с научным руководителем)",
        getList: function () { return draft.achievements.academic.research; },
        placeholderA: "Тема исследования",
        placeholderB: "Результат / достижение",
        onChange: onChange
      });
      renderRecordCategory(body, {
        title: "Хакатоны",
        getList: function () { return draft.achievements.academic.hackathons; },
        placeholderA: "Название хакатона",
        placeholderB: "Результат / достижение",
        onChange: onChange
      });
    })();

    // Стажировки
    (function () {
      var body = makeAccordionSection(root, "internship", "💼 Стажировки");
      var sphereWrap = el("div", { style: draft.achievements.internship.active ? "margin-top:12px;" : "display:none;" });
      body.appendChild(el("div", { class: "toggle-row" }, [
        el("span", {}, ["Есть опыт стажировки"]),
        el("label", { class: "switch" }, [
          el("input", {
            type: "checkbox", checked: draft.achievements.internship.active ? "checked" : null,
            onchange: function (e) {
              draft.achievements.internship.active = e.target.checked;
              sphereWrap.style.display = e.target.checked ? "margin-top:12px;" : "none";
              persist(); updateMeta("internship"); updatePortfolioIndicator();
            }
          }),
          el("span", { class: "switch__track" })
        ])
      ]));
      sphereWrap.appendChild(el("div", { class: "field-label" }, ["Сфера"]));
      singleChipGroup(
        sphereWrap, D.INTERNSHIP_SPHERES,
        function () { return draft.achievements.internship.sphere; },
        function (v) { draft.achievements.internship.sphere = v; },
        function () { persist(); }
      );
      body.appendChild(sphereWrap);
    })();

    // Творческие работы (только для «Искусство»)
    if (draft.major === "arts") {
      var body = makeAccordionSection(root, "creative", "🎨 Творческие работы");
      renderRecordCategory(body, {
        title: "Портфолио: работы / выставки / публикации",
        getList: function () { return draft.achievements.creative.works; },
        placeholderA: "Название работы / выставки",
        placeholderB: "Результат / где показано",
        onChange: function () { updateMeta("creative"); updatePortfolioIndicator(); }
      });
    }

    container.appendChild(el("div", { id: "portfolio-indicator", style: "margin-top:20px;" }));
    updatePortfolioIndicator();
  }

  // ---------------- Step 5 — экзамены ----------------
  function formatExamValue(cfg, value) {
    if (value === null || value === undefined) return "—";
    return cfg.decimals > 0 ? value.toFixed(cfg.decimals) : String(Math.round(value));
  }

  function renderStep5(container) {
    heading(container, "Шаг 5 из 6", "Экзамены", "Если ещё не сдавал(а) — просто отметь тумблер, слайдер не обязателен.");
    EXAMS_CONFIG.forEach(function (cfg) {
      var examState = draft.exams[cfg.key];
      var wrap = el("div", { class: "slider-field" });
      var valueLabel = el("span", { class: "slider-field__value" + (examState.notTaken || examState.value === null ? " slider-field__value--muted" : "") }, [
        examState.notTaken ? "Не сдавал(а)" : formatExamValue(cfg, examState.value)
      ]);
      wrap.appendChild(el("div", { class: "slider-field__top" }, [el("span", { class: "field-label", style: "margin:0;" }, [cfg.label]), valueLabel]));

      var sliderVal = examState.value !== null ? examState.value : cfg.min;
      var slider = el("input", {
        type: "range", min: String(cfg.min), max: String(cfg.max), step: String(cfg.step), value: String(sliderVal),
        disabled: examState.notTaken ? "disabled" : null
      });
      slider.addEventListener("input", function () {
        var v = parseFloat(slider.value);
        draft.exams[cfg.key].value = v;
        draft.exams[cfg.key].notTaken = false;
        valueLabel.textContent = formatExamValue(cfg, v);
        valueLabel.classList.remove("slider-field__value--muted");
        notTakenCheckbox.checked = false;
        persist();
      });
      wrap.appendChild(slider);
      wrap.appendChild(el("div", { class: "field-hint" }, [cfg.info]));

      var notTakenCheckbox;
      var toggleRow = el("div", { class: "toggle-row" }, [
        el("span", { class: "muted" }, ["Ещё не сдавал(а)"]),
        el("label", { class: "switch" }, [
          (notTakenCheckbox = el("input", { type: "checkbox", checked: examState.notTaken ? "checked" : null })),
          el("span", { class: "switch__track" })
        ])
      ]);
      notTakenCheckbox.addEventListener("change", function () {
        draft.exams[cfg.key].notTaken = notTakenCheckbox.checked;
        slider.disabled = notTakenCheckbox.checked;
        if (notTakenCheckbox.checked) {
          valueLabel.textContent = "Не сдавал(а)";
          valueLabel.classList.add("slider-field__value--muted");
        } else {
          valueLabel.textContent = formatExamValue(cfg, draft.exams[cfg.key].value !== null ? draft.exams[cfg.key].value : cfg.min);
          if (draft.exams[cfg.key].value === null) draft.exams[cfg.key].value = cfg.min;
          valueLabel.classList.remove("slider-field__value--muted");
        }
        persist();
      });
      wrap.appendChild(toggleRow);

      container.appendChild(wrap);
    });
  }

  // ---------------- Step 6 — сводка ----------------
  function renderStep6(container) {
    heading(container, "Шаг 6 из 6", "Проверь и подтверди", "Клик по любому пункту — сразу к нужному шагу.");
    var grid = el("div", { class: "summary-grid" });

    var gradeOpt = GRADE_OPTIONS.filter(function (g) { return g.id === draft.gradeLevel; })[0];
    var rows = [
      { step: 1, title: "Этап обучения", value: gradeOpt ? gradeOpt.title : "Не указано" },
      { step: 2, title: "Специальность", value: draft.major ? C.majorLabel(draft.major) + (draft.majorFromQuiz ? " (по квизу)" : "") : "Не указано" },
      {
        step: 3, title: "Страны",
        value: draft.showAllCountries ? "Все страны" : (draft.countries.length ? draft.countries.map(C.countryLabel).join(", ") : "Не указано")
      },
      { step: 4, title: "Достижения", value: M.portfolioStrength(draft).label },
      { step: 5, title: "Экзамены", value: M.examsTakenSummary(draft).count + " из " + M.examsTakenSummary(draft).total + " сдано" }
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
