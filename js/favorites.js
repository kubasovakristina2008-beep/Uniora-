/* Uniora — экран «Избранное»: сохранённые вузы, переоцененные по текущему профилю. */
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
  var renderUniCard = global.Uniora.recommendations.renderUniCard;

  function render() {
    var root = qs("#favorites-root");
    root.innerHTML = "";
    C.renderDemoBadge(root);
    var ids = S.getFavorites();

    if (!ids.length) {
      C.emptyState(root, {
        icon: "♡",
        title: t("favorites.emptyTitle"),
        text: t("favorites.emptyText"),
        actionLabel: t("favorites.toRecommendations"),
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
        t("favorites.missingNote", { count: missing })
      ]));
    }
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.favorites = { init: render };
})(window);
