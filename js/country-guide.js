/* Uniora — «Выбор страны»: качественная оценка по практическим факторам
   (без стоимости обучения/жизни — бюджет нигде не используется как критерий).
   Привязан к профилю: со страницы можно сразу добавить страну в анкету. */
(function (global) {
  "use strict";

  var C = global.Uniora.common;
  var S = global.Uniora.state;
  var D = global.Uniora.data;
  var I = global.Uniora.i18n;
  var el = C.el;
  var qs = C.qs;
  var t = I.t;
  var tf = I.tf;

  var activeCountry = D.COUNTRIES[0].id;

  function render() {
    var root = qs("#country-guide-root");
    root.innerHTML = "";
    var profile = S.getProfile();

    var wrap = el("div", { class: "priority-panel-light" });

    var tabs = el("div", { class: "priority-tabs" });
    D.COUNTRIES.forEach(function (c) {
      var tab = el("button", { type: "button", class: "priority-tab" + (c.id === activeCountry ? " priority-tab--active" : "") }, [tf(c.label) + " " + c.flag]);
      tab.addEventListener("click", function () { activeCountry = c.id; render(); });
      tabs.appendChild(tab);
    });
    wrap.appendChild(tabs);

    var info = D.COUNTRY_INFO[activeCountry];
    var uniCount = D.UNIVERSITIES.filter(function (u) { return u.country === activeCountry; }).length;

    wrap.appendChild(
      el("div", { class: "card", style: "margin-bottom:16px;" }, [
        el("p", { style: "margin:0 0 8px;" }, [tf(info.blurb)]),
        el("span", { class: "chip chip--static" }, [uniCount + " " + t("countryGuide.uniCountInBase")])
      ])
    );

    var card = el("div", { class: "card" });
    Object.keys(D.COUNTRY_DIMENSION_LABELS).forEach(function (dim) {
      var d = info[dim];
      card.appendChild(
        el("div", { class: "priority-row" }, [
          el("div", {}, [
            el("div", { class: "priority-row__label" }, [tf(D.COUNTRY_DIMENSION_LABELS[dim])]),
            el("div", { class: "priority-row__note" }, [tf(d.note)])
          ]),
          el("span", { class: "badge badge--weight-" + d.level }, [tf(D.PRIORITY_LEVEL_LABELS[d.level])])
        ])
      );
    });
    wrap.appendChild(card);
    root.appendChild(wrap);

    root.appendChild(el("div", { class: "disclaimer", style: "margin-top:var(--space-3);" }, [tf(D.COUNTRY_METHOD_DISCLAIMER)]));

    var selected = (profile.countries || []).indexOf(activeCountry) !== -1;
    root.appendChild(
      el("div", { class: "step-actions", style: "margin-top:32px;" }, [
        el("a", { class: "btn btn--secondary", href: "index.html" }, [t("countryGuide.toHome")]),
        (function () {
          var countryLabel = C.countryLabel(activeCountry);
          var btn = el("button", { type: "button", class: "btn btn--primary" }, [
            selected ? t("countryGuide.alreadySelected", { country: countryLabel }) : t("countryGuide.selectInProfile", { country: countryLabel })
          ]);
          if (selected) { btn.disabled = true; return btn; }
          btn.addEventListener("click", function () {
            var list = (profile.countries || []).slice();
            list.push(activeCountry);
            S.updateProfile({ countries: list });
            C.toast(t("countryGuide.addedToProfile", { country: countryLabel }));
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
