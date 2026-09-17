/* Uniora — «Выбор страны»: разворачиваем таблицу приоритетов по странам
   в отдельный экран для тех, кто ещё не определился. Привязан к профилю —
   со страницы можно сразу перейти к выбору стран в анкете. */
(function (global) {
  "use strict";

  var C = global.Uniora.common;
  var S = global.Uniora.state;
  var D = global.Uniora.data;
  var el = C.el;
  var qs = C.qs;

  var WEIGHT_LABEL = { high: "Высокий", medium: "Средний", low: "Низкий" };
  var activeCountry = D.COUNTRIES[0].id;

  function render() {
    var root = qs("#country-guide-root");
    root.innerHTML = "";
    var profile = S.getProfile();

    var wrap = el("div", { class: "priority-panel-light" });

    var tabs = el("div", { class: "priority-tabs" });
    D.COUNTRIES.forEach(function (c) {
      var tab = el("button", {
        type: "button",
        class: "priority-tab" + (c.id === activeCountry ? " priority-tab--active" : "")
      }, [c.flag + " " + c.label]);
      tab.addEventListener("click", function () { activeCountry = c.id; render(); });
      tabs.appendChild(tab);
    });
    wrap.appendChild(tabs);

    var card = el("div", { class: "card" });
    var priorities = D.PRIORITIES[activeCountry];
    Object.keys(D.CATEGORY_LABELS).forEach(function (cat) {
      var p = priorities[cat];
      card.appendChild(
        el("div", { class: "priority-row" }, [
          el("div", {}, [
            el("div", { class: "priority-row__label" }, [D.CATEGORY_LABELS[cat]]),
            el("div", { class: "priority-row__note" }, [p.note])
          ]),
          el("span", { class: "badge badge--weight-" + p.level }, [WEIGHT_LABEL[p.level]])
        ])
      );
    });
    wrap.appendChild(card);
    root.appendChild(wrap);

    root.appendChild(el("div", { class: "disclaimer", style: "margin-top:var(--space-3);" }, [D.PRIORITY_METHOD_DISCLAIMER]));

    var selected = (profile.countries || []).indexOf(activeCountry) !== -1;
    root.appendChild(
      el("div", { class: "step-actions", style: "margin-top:32px;" }, [
        el("a", { class: "btn btn--secondary", href: "index.html" }, ["← На главную"]),
        (function () {
          var btn = el("button", { type: "button", class: "btn btn--primary" }, [
            selected ? ("✓ " + C.countryLabel(activeCountry) + " уже выбрана") : ("Выбрать " + C.countryLabel(activeCountry) + " в анкете")
          ]);
          if (selected) { btn.disabled = true; return btn; }
          btn.addEventListener("click", function () {
            var list = (profile.countries || []).slice();
            list.push(activeCountry);
            S.updateProfile({ countries: list });
            C.toast(C.countryLabel(activeCountry) + " добавлена в профиль");
            render();
          });
          return btn;
        })()
      ])
    );
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.countryGuide = { init: render };
})(window);
