/**
 * Google Ads loc_id → Stadtname
 * Verwendet die offizielle Google Ads Geotargets-Datenbank (nur Deutschland).
 * Quelle: developers.google.com/google-ads/api/data/geotargets
 */
(function() {
  var JSON_URL = 'de-cities.json';
  var CACHE_VER = '2026-03-31';
  var CACHE_KEY = 'md_geo_de_' + CACHE_VER;
  var CACHE_TS  = 'md_geo_ts_' + CACHE_VER;
  var CACHE_DAYS = 30;

  function getLocId() {
    return new URLSearchParams(window.location.search).get('loc_id') || '';
  }

  function isCacheValid() {
    try {
      var ts = localStorage.getItem(CACHE_TS);
      if (!ts) return false;
      return (Date.now() - parseInt(ts)) < CACHE_DAYS * 86400000;
    } catch(e) { return false; }
  }

  function applyLocId(locId, map) {
    var city = map[locId];
    if (!city || !city.trim()) return;
    city = city.trim();

    // Cookie für andere Seiten
    try {
      var d = new Date();
      d.setTime(d.getTime() + 7 * 864e5);
      document.cookie = 'md_city=' + encodeURIComponent(city) + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
    } catch(e) {}

    if (typeof applyCity === 'function') applyCity(city);
  }

  function run(locId) {
    // 1. Cache prüfen
    if (isCacheValid()) {
      try {
        var cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        if (Object.keys(cached).length > 0) {
          applyLocId(locId, cached);
          return;
        }
      } catch(e) {}
    }

    // 2. JSON laden (25KB, nur Deutschland)
    fetch(JSON_URL)
      .then(function(r) {
        if (!r.ok) throw new Error('JSON fetch failed');
        return r.json();
      })
      .then(function(map) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(map));
          localStorage.setItem(CACHE_TS, Date.now().toString());
        } catch(e) {}
        applyLocId(locId, map);
      })
      .catch(function() {
        // Kein loc_id gefunden → Titel bleibt "Ihr Dachdecker in der Nähe"
      });
  }

  var locId = getLocId();
  if (!locId) return;

  // Sterge cookie-ul vechi imediat, ca detectCity() sa nu aplice orasul din vizita anterioara
  try {
    document.cookie = 'md_city=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
  } catch(e) {}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { run(locId); });
  } else {
    run(locId);
  }
})();
