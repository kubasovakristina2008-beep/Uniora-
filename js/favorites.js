/* Uniora — экран «Избранное»: сохранённые вузы, переоцененные по текущему профилю. */
(function (global) {
  "use strict";

  var C = global.Uniora.common;
  var S = global.Uniora.state;
  var M = global.Uniora.match;
  var D = global.Uniora.data;
  var el = C.el;
  var qs = C.qs;
  var renderUniCard = global.Uniora.recommendations.renderUniCard;

  function render() {
    var root = qs("#favorites-root");
    root.innerHTML = "";
    var ids = S.getFavorites();

    if (!ids.length) {
      C.emptyState(root, {
        icon: "♡",
        title: "Пока нет избранных вузов",
        text: "На странице рекомендаций нажмите ♡ на карточке вуза, чтобы сохранить его здесь.",
        actionLabel: "К рекомендациям",
        actionHref: "recommendations.html"
      });
      return;
    }

    var profile = S.getProfile();
    var grid = el("div", { class: "uni-grid" });
    var missing = 0;

    ids.forEach(function (id) {
      var uni = D.UNIVERSITIES.filter(function (u) { return u.id === id; })[0];
      if (!uni) { S.toggleFavorite(id); missing++; return; }
      var evaluation = M.evaluateUniversity(uni, profile);
      grid.appendChild(renderUniCard(evaluation, render, { favoritesContext: true }));
    });

    root.appendChild(grid);
    if (missing) {
      root.appendChild(el("p", { class: "muted", style: "margin-top:var(--space-2);" }, [
        "Часть сохранённых вузов не найдена в текущей базе (" + missing + ") — они были удалены из списка автоматически."
      ]));
    }
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.favorites = { init: render };
})(window);
