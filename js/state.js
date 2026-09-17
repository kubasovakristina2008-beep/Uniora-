/* Uniora — слой состояния поверх localStorage. Без бэкенда, без логина. */
(function (global) {
  "use strict";

  var KEYS = {
    profile: "uniora_profile_v1",
    roadmap: "uniora_roadmap_v1",
    compare: "uniora_compare_v1",
    favorites: "uniora_favorites_v1"
  };

  function defaultProfile() {
    return {
      gradeLevel: null,
      major: null,
      majorFromQuiz: false,
      countries: [],
      showAllCountries: false,
      achievements: {
        sport: { practices: [], level: null },
        volunteering: { active: false, spheres: [], hours: null },
        academic: {
          projects: [],
          olympiads: [],
          research: [],
          hackathons: []
        },
        internship: { active: false, sphere: null },
        creative: { works: [] }
      },
      exams: {
        ielts: { value: null, notTaken: false },
        sat: { value: null, notTaken: false },
        toefl: { value: null, notTaken: false },
        gpa: { value: null, notTaken: false }
      },
      createdAt: null,
      updatedAt: null
    };
  }

  function readJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function deepMerge(base, patch) {
    if (Array.isArray(base) || Array.isArray(patch)) return patch;
    if (typeof base !== "object" || base === null) return patch;
    if (typeof patch !== "object" || patch === null) return base;
    var out = {};
    var keys = {};
    Object.keys(base).forEach(function (k) { keys[k] = true; });
    Object.keys(patch).forEach(function (k) { keys[k] = true; });
    Object.keys(keys).forEach(function (k) {
      if (k in patch) {
        out[k] = deepMerge(base[k], patch[k]);
      } else {
        out[k] = base[k];
      }
    });
    return out;
  }

  function getProfile() {
    var stored = readJSON(KEYS.profile, null);
    if (!stored) return defaultProfile();
    return deepMerge(defaultProfile(), stored);
  }

  function saveProfile(profile) {
    profile.updatedAt = new Date().toISOString();
    if (!profile.createdAt) profile.createdAt = profile.updatedAt;
    writeJSON(KEYS.profile, profile);
    return profile;
  }

  function updateProfile(patch) {
    var current = getProfile();
    var merged = deepMerge(current, patch);
    return saveProfile(merged);
  }

  function resetProfile() {
    window.localStorage.removeItem(KEYS.profile);
    window.localStorage.removeItem(KEYS.roadmap);
    window.localStorage.removeItem(KEYS.compare);
    window.localStorage.removeItem(KEYS.favorites);
  }

  function isProfileMinimal(profile) {
    profile = profile || getProfile();
    var hasCountry = profile.showAllCountries || (profile.countries && profile.countries.length > 0);
    return !!profile.major && hasCountry;
  }

  // --- Roadmap ---
  function getRoadmap() {
    return readJSON(KEYS.roadmap, []);
  }

  function saveRoadmap(list) {
    writeJSON(KEYS.roadmap, list);
    return list;
  }

  function upsertRoadmapStar(star) {
    var list = getRoadmap();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === star.id) { idx = i; break; }
    }
    if (idx >= 0) {
      list[idx] = Object.assign({}, list[idx], star);
    } else {
      list.push(star);
    }
    saveRoadmap(list);
    return list;
  }

  function setStarStatus(id, status) {
    var list = getRoadmap();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        list[i].status = status;
        list[i].completedAt = status === "done" ? new Date().toISOString() : null;
        break;
      }
    }
    saveRoadmap(list);
    return list;
  }

  function removeRoadmapStar(id) {
    var list = getRoadmap().filter(function (s) { return s.id !== id; });
    saveRoadmap(list);
    return list;
  }

  // --- Compare ---
  function getCompare() {
    return readJSON(KEYS.compare, []);
  }

  function toggleCompare(uniId) {
    var list = getCompare();
    var idx = list.indexOf(uniId);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      if (list.length >= 3) return { ok: false, list: list, reason: "max" };
      list.push(uniId);
    }
    writeJSON(KEYS.compare, list);
    return { ok: true, list: list };
  }

  function removeFromCompare(uniId) {
    var list = getCompare().filter(function (id) { return id !== uniId; });
    writeJSON(KEYS.compare, list);
    return list;
  }

  // --- Favorites ---
  function getFavorites() {
    return readJSON(KEYS.favorites, []);
  }

  function toggleFavorite(uniId) {
    var list = getFavorites();
    var idx = list.indexOf(uniId);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(uniId);
    }
    writeJSON(KEYS.favorites, list);
    return list;
  }

  global.Uniora = global.Uniora || {};
  global.Uniora.state = {
    KEYS: KEYS,
    defaultProfile: defaultProfile,
    getProfile: getProfile,
    saveProfile: saveProfile,
    updateProfile: updateProfile,
    resetProfile: resetProfile,
    isProfileMinimal: isProfileMinimal,
    getRoadmap: getRoadmap,
    saveRoadmap: saveRoadmap,
    upsertRoadmapStar: upsertRoadmapStar,
    setStarStatus: setStarStatus,
    removeRoadmapStar: removeRoadmapStar,
    getCompare: getCompare,
    toggleCompare: toggleCompare,
    removeFromCompare: removeFromCompare,
    getFavorites: getFavorites,
    toggleFavorite: toggleFavorite
  };
})(window);
