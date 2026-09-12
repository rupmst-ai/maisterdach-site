(function () {
  var FALLBACK_DISPLAY = 'in Ihrer Nähe';

  // Orice ID din blocul sectoarelor Berlinului devine "Berlin".
  // Plasa de siguranta: daca Google trimite un sector care nu e in de-cities.json,
  // tot Berlin afisam, nu nimic.
  var BERLIN_VON = 9061130, BERLIN_BIS = 9061142;

  // Nume care nu sunt localitati, ci cartiere. A doua plasa de siguranta,
  // in caz ca mai scapa ceva in fisierul de orase.
  var NICHT_STADT = [
    'mitte','altstadt','neustadt','nord','süd','sud','ost','west','innenstadt',
    'zentrum','südstadt','nordstadt','weststadt','oststadt','list','vorstadt'
  ];

  function getParams() {
    var p = new URLSearchParams(window.location.search);
    return {
      physicalId: p.get('loc_physical_ms') || p.get('loc_id') || '',
      interestId: p.get('loc_interest_ms') || '',
      debug:      p.get('debug') === '1'
    };
  }

  function isValidCityName(name) {
    if (!name || name.trim() === '') return false;
    var n = name.trim();
    if (/^\d+$/.test(n)) return false;
    if (n.length < 3) return false;
    if (/^district\s*\d+$/i.test(n)) return false;
    if (/^stadtbezirk/i.test(n)) return false;
    if (NICHT_STADT.indexOf(n.toLowerCase()) !== -1) return false;
    return true;
  }

  function istBerlinId(id) {
    var n = parseInt(id, 10);
    return !isNaN(n) && n > BERLIN_VON && n < BERLIN_BIS;
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

  function zeigeDebug(info) {
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;' +
      'background:#0f172a;color:#fff;font:12px/1.5 monospace;padding:10px 12px;' +
      'white-space:pre-wrap;max-height:45vh;overflow:auto;';
    var t = '';
    for (var k in info) t += k + ': ' + (info[k] === '' ? '(gol)' : info[k]) + '\n';
    box.textContent = t;
    box.addEventListener('click', function () { box.remove(); });
    document.body.appendChild(box);
  }

  function applyCity(name, locId, source, roh) {
    name = (name && isValidCityName(name)) ? name.trim() : '';

    // Expus pentru jurnalul de apeluri din app.js
    window.__LOC_CITY__   = name;
    window.__LOC_ID__     = locId || '';
    window.__LOC_SOURCE__ = source || 'none';
    window.__LOC_RAW__    = roh || '';   // ce a returnat fisierul, chiar daca nu se afiseaza
    window.__LOC_PHYS__   = window.__LOC_PHYS__ || '';
    window.__LOC_INT__    = window.__LOC_INT__ || '';

    sendAnalyticsEvent(name, locId, source);

    if (window.__LOC_DEBUG__) {
      zeigeDebug({
        'loc_physical_ms': window.__LOC_PHYS__,
        'loc_interest_ms': window.__LOC_INT__,
        'gasit in fisier': roh || '(nimic)',
        'afisat': name || '(fallback: ' + FALLBACK_DISPLAY + ')',
        'sursa': source
      });
    }

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

    document.querySelectorAll('.city').forEach(function (el) {
      el.textContent = name ? name + ' und Region' : FALLBACK_DISPLAY;
    });

    document.querySelectorAll('.city-full').forEach(function (el) {
      if (name) {
        el.style.display = '';
        var cn = el.querySelector('.city-name');
        if (cn) cn.textContent = name + ' und Region';
      } else {
        el.style.display = 'none';
      }
    });

    document.querySelectorAll('.city-sub').forEach(function (el) {
      if (name) {
        el.textContent = 'in ' + name + ' und Region';
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    document.querySelectorAll('.city-map').forEach(function (el) {
      el.textContent = name ? name + ' und Region' : '';
    });

    document.querySelectorAll('.city-service').forEach(function (el) {
      if (name) el.textContent = name + ' und Umgebung';
    });

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

    window.__LOC_DEBUG__ = params.debug;
    window.__LOC_PHYS__  = physicalId;
    window.__LOC_INT__   = interestId;

    if (!physicalId && !interestId) {
      applyCity('', '', 'none', '');
      return;
    }

    // Berlin inainte de orice cautare: orice sector inseamna Berlin
    if (istBerlinId(interestId)) { applyCity('Berlin', interestId, 'interest+berlin', 'Berlin'); return; }
    if (istBerlinId(physicalId)) { applyCity('Berlin', physicalId, 'physical+berlin', 'Berlin'); return; }

    fetch('de-cities.json')
      .then(function (r) {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(function (map) {
        // 1. loc_interest_ms — orasul cautat de utilizator
        var ni = interestId ? map[interestId] : null;
        if (ni && isValidCityName(ni)) { applyCity(ni, interestId, 'interest', ni); return; }

        // 2. loc_physical_ms — unde se afla fizic
        var np = physicalId ? map[physicalId] : null;
        if (np && isValidCityName(np)) { applyCity(np, physicalId, 'physical', np); return; }

        // 3. Nimic utilizabil. Numele brut ajunge in jurnal, dar nu pe ecran.
        applyCity('', physicalId || interestId, 'none', ni || np || '');
      })
      .catch(function () {
        applyCity('', physicalId || interestId, 'error', '');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
