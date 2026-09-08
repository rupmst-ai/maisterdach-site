(function () {
  var FALLBACK_DISPLAY = 'in Ihrer Nähe';

  function getParams() {
    var p = new URLSearchParams(window.location.search);
    return {
      physicalId: p.get('loc_physical_ms') || p.get('loc_id') || '',
      interestId: p.get('loc_interest_ms') || ''
    };
  }

  function isValidCityName(name) {
    if (!name || name.trim() === '') return false;
    var n = name.trim();
    if (/^\d+$/.test(n)) return false;
    if (n.length < 3) return false;
    if (/^district\s*\d+$/i.test(n)) return false;
    if (/^stadtbezirk/i.test(n)) return false;
    if (/^stadtbezirke/i.test(n)) return false;
    return true;
  }

  function sendAnalyticsEvent(city, locId, source) {
    if (typeof gtag !== 'function') return;
    gtag('event', 'location_detected', {
      'event_category': 'Dynamic Location',
      'event_label': city || 'fallback',
      'loc_id': locId || 'none',
      'city_name': city || 'fallback',
      'loc_source': source || 'none'
    });
  }


  // Orase ancora din zona deservita (nume, lat, lon)
  var ANCHORS = [
    ['Berlin',52.520,13.405],['Potsdam',52.396,13.059],['Oranienburg',52.755,13.238],
    ['Cottbus',51.757,14.329],['Frankfurt (Oder)',52.348,14.551],
    ['Brandenburg an der Havel',52.412,12.556],['Bernau bei Berlin',52.677,13.587],
    ['Eberswalde',52.834,13.818],['Falkensee',52.560,13.092],
    ['Koenigs Wusterhausen',52.294,13.626],['Strausberg',52.578,13.887],
    ['Neuruppin',52.925,12.803],['Rathenow',52.606,12.336],['Schwedt',53.060,14.283],
    ['Prenzlau',53.316,13.863],['Fuerstenwalde',52.360,14.063],['Luckenwalde',52.089,13.170],
    ['Jueterbog',51.994,13.075],['Senftenberg',51.524,14.001],['Finsterwalde',51.632,13.708],
    ['Luebben',51.941,13.892],['Wittenberge',52.995,11.752],['Perleberg',53.073,11.858],
    ['Pritzwalk',53.150,12.176],['Templin',53.121,13.502],['Angermuende',53.017,13.999],
    ['Zehdenick',52.981,13.334],['Hennigsdorf',52.638,13.203],['Velten',52.692,13.177],
    ['Hohen Neuendorf',52.674,13.278],['Teltow',52.401,13.271],['Ludwigsfelde',52.302,13.256],
    ['Zossen',52.216,13.446],['Nauen',52.607,12.874],['Guben',51.951,14.715],
    ['Magdeburg',52.131,11.639],['Halle (Saale)',51.482,11.970],['Dessau',51.834,12.247],
    ['Stendal',52.606,11.858],['Dresden',51.050,13.738],['Leipzig',51.340,12.375],
    ['Chemnitz',50.833,12.921],['Goerlitz',51.155,14.987],['Bautzen',51.181,14.424],
    ['Riesa',51.308,13.292],['Schwerin',53.629,11.413],['Rostock',54.092,12.099],
    ['Neubrandenburg',53.558,13.261],['Stralsund',54.309,13.082],['Greifswald',54.096,13.382],
    ['Wismar',53.891,11.465],['Guestrow',53.796,12.174],['Waren',53.518,12.681],
    ['Parchim',53.427,11.849]
  ];

  var MAX_KM = 30;

  function isAnchor(name) {
    if (!name) return false;
    for (var i = 0; i < ANCHORS.length; i++) {
      if (ANCHORS[i][0].toLowerCase() === name.toLowerCase()) return true;
    }
    return false;
  }

  function distKm(a1, o1, a2, o2) {
    var R = 6371, dLat = (a2 - a1) * Math.PI / 180, dLon = (o2 - o1) * Math.PI / 180;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(a1 * Math.PI / 180) * Math.cos(a2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function nearestAnchor(lat, lon) {
    var best = null, bestD = Infinity;
    for (var i = 0; i < ANCHORS.length; i++) {
      var d = distKm(lat, lon, ANCHORS[i][1], ANCHORS[i][2]);
      if (d < bestD) { bestD = d; best = ANCHORS[i][0]; }
    }
    return (bestD <= MAX_KM) ? best : '';
  }

  // Satul detectat de Google nu e oras cunoscut -> cere coordonate de la Cloudflare
  function resolveViaCloudflare(rawName, locId, source) {
    fetch('/geo')
      .then(function (r) { return r.json(); })
      .then(function (g) {
        if (g.city && isAnchor(g.city)) { applyCity(g.city, locId, source + '+cf'); return; }
        if (g.lat && g.lon) {
          var near = nearestAnchor(g.lat, g.lon);
          if (near) { applyCity(near, locId, source + '+radius'); return; }
        }
        applyCity(rawName, locId, source);
      })
      .catch(function () { applyCity(rawName, locId, source); });
  }

  function applyCity(name, locId, source) {
    name = (name && isValidCityName(name)) ? name.trim() : '';

    // expus pentru jurnalul de apeluri
    window.__LOC_CITY__   = name;
    window.__LOC_ID__     = locId || '';
    window.__LOC_SOURCE__ = source || 'none';

    sendAnalyticsEvent(name, locId, source);

    // Title si meta
    if (name) {
      var currentTitle = document.title;
      if (currentTitle.indexOf(' | ') !== -1) {
        document.title = currentTitle.replace(' | ', ' in ' + name + ' | ');
      } else {
        document.title = currentTitle + ' in ' + name;
      }
      var meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.content = meta.content.replace('Kostenlose Besichtigung', 'in ' + name + ' – Kostenlose Besichtigung');
      }
    }

    // .city
    document.querySelectorAll('.city').forEach(function (el) {
      el.textContent = name ? name + ' und Region' : FALLBACK_DISPLAY;
    });

    // .city-full
    document.querySelectorAll('.city-full').forEach(function (el) {
      if (name) {
        el.style.display = '';
        var cn = el.querySelector('.city-name');
        if (cn) cn.textContent = name + ' und Region';
      } else {
        el.style.display = 'none';
      }
    });

    // .city-sub
    document.querySelectorAll('.city-sub').forEach(function (el) {
      if (name) {
        el.textContent = 'in ' + name + ' und Region';
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // .city-map
    document.querySelectorAll('.city-map').forEach(function (el) {
      el.textContent = name ? name + ' und Region' : '';
    });

    // .city-service (Impressum Servicegebiet)
    document.querySelectorAll('.city-service').forEach(function (el) {
      if (name) {
        el.textContent = name + ' und Umgebung';
      }
      // Daca nu e oras, lasa textul default din HTML (Berlin, Brandenburg etc.)
    });

    // Harta
    if (name) {
      var section = document.getElementById('map-section');
      if (section) section.style.display = 'block';

      var mapDiv = document.getElementById('dynamic-map');
      if (mapDiv && mapDiv.children.length === 0) {
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.google.com/maps?q=' + encodeURIComponent(name + ', Germany') + '&output=embed&z=10';
        iframe.width = '100%';
        iframe.height = '150';
        iframe.style.cssText = 'border:0;display:block;';
        iframe.loading = 'lazy';
        mapDiv.appendChild(iframe);
      }
    }

    // Propaga loc_id in linkuri interne
    if (locId) {
      document.querySelectorAll('a[href]').forEach(function (el) {
        var href = el.getAttribute('href');
        if (href && href.endsWith('.html') && !href.startsWith('http') && !href.includes('?')) {
          el.href = href + '?loc_id=' + locId;
        }
      });
    }
  }

  function run() {
    var params = getParams();
    var physicalId = params.physicalId;
    var interestId = params.interestId;

    if (!physicalId && !interestId) {
      applyCity('', '', 'none');
      return;
    }

    fetch('de-cities.json')
      .then(function (r) {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(function (map) {
        // 1. Primul: loc_interest_ms — orasul cautat de user
        if (interestId && map[interestId] && isValidCityName(map[interestId])) {
          var ni = map[interestId];
          if (isAnchor(ni)) { applyCity(ni, interestId, 'interest'); }
          else { resolveViaCloudflare(ni, interestId, 'interest'); }
          return;
        }
        // 2. Al doilea: loc_physical_ms — unde e fizic userul
        if (physicalId && map[physicalId] && isValidCityName(map[physicalId])) {
          var np = map[physicalId];
          if (isAnchor(np)) { applyCity(np, physicalId, 'physical'); }
          else { resolveViaCloudflare(np, physicalId, 'physical'); }
          return;
        }
        // 3. Fallback generic
        applyCity('', physicalId || interestId, 'none');
      })
      .catch(function () {
        applyCity('', physicalId || interestId, 'error');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
