/* Uniora — общие UI-хелперы: навигация, пустые состояния, тосты, звёздный фон. */
(function (global) {
  "use strict";

  var data = global.Uniora.data;
  var i18n = global.Uniora.i18n;
  var t = i18n.t;
  var tf = i18n.tf;

  function STEPS() {
    return [
      { key: "profile", href: "profile.html", label: t("nav.steps.profile") },
      { key: "diagnosis", href: "diagnosis.html", label: t("nav.steps.diagnosis") },
      { key: "recommendations", href: "recommendations.html", label: t("nav.steps.recommendations") },
      { key: "compare", href: "compare.html", label: t("nav.steps.compare") },
      { key: "roadmap", href: "roadmap.html", label: t("nav.steps.roadmap") }
    ];
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (key) {
      var value = attrs[key];
      if (value === null || value === undefined) return;
      if (key === "class") node.className = value;
      else if (key === "html") node.innerHTML = value;
      else if (key.indexOf("on") === 0 && typeof value === "function") {
        node.addEventListener(key.slice(2), value);
      } else {
        node.setAttribute(key, value);
      }
    });
    (children || []).forEach(function (child) {
      if (child === null || child === undefined) return;
      if (typeof child === "string") node.appendChild(document.createTextNode(child));
      else node.appendChild(child);
    });
    return node;
  }

  function getMajor(id) { return data.MAJORS.filter(function (m) { return m.id === id; })[0] || null; }
  function getCountry(id) { return data.COUNTRIES.filter(function (c) { return c.id === id; })[0] || null; }
  function majorLabel(id) { var m = getMajor(id); return m ? tf(m.label) : "—"; }
  function majorsLabel(ids) { return (ids && ids.length) ? ids.map(majorLabel).join(", ") : t("common.notSpecified"); }
  function countryLabel(id) { var c = getCountry(id); return c ? tf(c.label) : id; }
  // Флаг как картинка (не emoji) — на Windows составные emoji-флаги часто
  // рендерятся как голые буквы кода страны из-за отсутствия глифа в шрифте.
  function countryFlagImg(id) {
    var c = getCountry(id);
    if (!c || !c.flagCode) return null;
    return el("img", {
      src: "https://flagcdn.com/24x18/" + c.flagCode + ".png",
      srcset: "https://flagcdn.com/48x36/" + c.flagCode + ".png 2x",
      width: "24", height: "18",
      alt: "", class: "flag-icon"
    });
  }

  function renderLangSwitch() {
    var current = i18n.getLang();
    var next = current === "ru" ? "en" : "ru";
    var btn = el("button", { type: "button", class: "lang-switch", title: t("nav.langTitle") }, [t("nav.langButton")]);
    btn.addEventListener("click", function () { i18n.setLang(next); });
    return btn;
  }

  function renderNav(activeKey) {
    var mount = qs("#uniora-nav");
    if (!mount) return;
    var isDark = mount.getAttribute("data-theme") === "dark";
    mount.innerHTML = "";
    mount.className = "site-nav" + (isDark ? " site-nav--dark" : "");

    var inner = el("div", { class: "site-nav__inner" });
    var logo = el("a", { class: "site-nav__logo", href: "index.html" }, ["Uniora"]);
    inner.appendChild(logo);

    var steps = el("div", { class: "site-nav__steps" });
    STEPS().forEach(function (step, i) {
      var isActive = step.key === activeKey;
      var link = el(
        "a",
        {
          class: "step-pill" + (isActive ? " step-pill--active" : ""),
          href: step.href
        },
        [el("span", { class: "step-pill__num" }, [String(i + 1)]), el("span", {}, [step.label])]
      );
      steps.appendChild(link);
    });
    inner.appendChild(steps);

    var rightGroup = el("div", { class: "site-nav__right" });
    var favLink = el(
      "a",
      {
        class: "site-nav__fav-link" + (activeKey === "favorites" ? " site-nav__fav-link--active" : ""),
        href: "favorites.html",
        title: t("nav.favorites")
      },
      [t("nav.favorites")]
    );
    rightGroup.appendChild(favLink);
    rightGroup.appendChild(renderLangSwitch());
    inner.appendChild(rightGroup);

    mount.appendChild(inner);
  }

  function renderContextBar(targetSelector) {
    var mount = qs(targetSelector || "#uniora-context");
    if (!mount) return;
    var profile = global.Uniora.state.getProfile();
    mount.innerHTML = "";

    if ((!profile.majors || !profile.majors.length) && (!profile.countries || profile.countries.length === 0)) {
      mount.appendChild(
        el("div", { class: "context-bar context-bar--empty" }, [
          el("span", {}, [t("common.profileEmpty")]),
          el("a", { class: "btn btn--ghost btn--sm", href: "profile.html" }, [t("common.fillProfile")])
        ])
      );
      return;
    }

    var chips = el("div", { class: "context-bar__chips" });
    (profile.majors || []).forEach(function (m) {
      chips.appendChild(el("span", { class: "chip chip--static" }, [majorLabel(m)]));
    });
    if (profile.showAllCountries) {
      chips.appendChild(el("span", { class: "chip chip--static" }, [t("common.allCountries")]));
    } else if (profile.countries && profile.countries.length) {
      profile.countries.forEach(function (c) {
        chips.appendChild(el("span", { class: "chip chip--static" }, [countryFlagImg(c), countryLabel(c)]));
      });
    }

    mount.appendChild(
      el("div", { class: "context-bar" }, [chips, el("a", { class: "btn btn--ghost btn--sm", href: "profile.html" }, [t("common.change")])])
    );
  }

  function emptyState(container, opts) {
    if (typeof container === "string") container = qs(container);
    if (!container) return;
    container.innerHTML = "";
    var node = el("div", { class: "empty-state" }, [
      opts.icon ? el("div", { class: "empty-state__icon" }, [opts.icon]) : null,
      el("h3", {}, [opts.title]),
      el("p", {}, [opts.text]),
      opts.actionLabel && opts.actionHref
        ? el("a", { class: "btn btn--primary", href: opts.actionHref }, [opts.actionLabel])
        : opts.actionLabel && opts.onAction
        ? el("button", { class: "btn btn--primary", onclick: opts.onAction }, [opts.actionLabel])
        : null
    ]);
    container.appendChild(node);
  }

  var toastTimer = null;
  function toast(message) {
    var existing = qs("#uniora-toast");
    if (!existing) {
      existing = el("div", { id: "uniora-toast", class: "toast" });
      document.body.appendChild(existing);
    }
    existing.textContent = message;
    existing.classList.add("toast--visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      existing.classList.remove("toast--visible");
    }, 2400);
  }

  function portfolioBar(container, strength) {
    if (typeof container === "string") container = qs(container);
    if (!container) return;
    container.innerHTML = "";
    container.appendChild(
      el("div", { class: "portfolio-strength" }, [
        el("div", { class: "portfolio-strength__label" }, [strength.label]),
        el("div", { class: "portfolio-strength__track" }, [
          el("div", { class: "portfolio-strength__fill", style: "width:" + strength.barWidth + "%" })
        ])
      ])
    );
  }

  // Тихое звёздное поле на canvas для тёмных экранов (hero, roadmap).
  function starField(canvas, opts) {
    if (!canvas) return;
    opts = opts || {};
    var density = opts.density || 0.00018;
    var ctx = canvas.getContext("2d");
    var stars = [];
    var raf = null;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(rect.width, rect.height);
    }

    function seed(w, h) {
      var count = Math.max(40, Math.floor(w * h * density));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.1 + 0.3,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.6
        });
      }
    }

    function draw(t) {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      stars.forEach(function (s) {
        var twinkle = 0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase);
        ctx.globalAlpha = 0.25 + twinkle * 0.55;
        ctx.fillStyle = "#F4F1FF";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return function stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      var args = arguments;
      var ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  function uid(prefix) {
    return (prefix || "id") + "-" + Math.random().toString(36).slice(2, 9);
  }

  // Кол-во записей в одной категории достижений — работает и для обычных
  // категорий (массив записей), и для "Спорта" ({ practices: [], level }).
  function achievementCount(achievements, key) {
    var v = achievements[key];
    if (Array.isArray(v)) return v.length;
    if (v && Array.isArray(v.practices)) return v.practices.length;
    return 0;
  }

  function totalAchievementCount(achievements, categories, customKey) {
    var sum = categories.reduce(function (s, c) { return s + achievementCount(achievements, c.key); }, 0);
    if (customKey) sum += achievementCount(achievements, customKey);
    return sum;
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.common = {
    STEPS: STEPS(),
    qs: qs,
    qsa: qsa,
    el: el,
    getMajor: getMajor,
    getCountry: getCountry,
    majorLabel: majorLabel,
    majorsLabel: majorsLabel,
    countryLabel: countryLabel,
    countryFlagImg: countryFlagImg,
    renderNav: renderNav,
    renderContextBar: renderContextBar,
    emptyState: emptyState,
    toast: toast,
    portfolioBar: portfolioBar,
    starField: starField,
    debounce: debounce,
    uid: uid,
    achievementCount: achievementCount,
    totalAchievementCount: totalAchievementCount
  };
})(window);
