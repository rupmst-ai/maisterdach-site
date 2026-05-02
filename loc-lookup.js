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

  function applyCity(name, locId, source) {
    name = (name && isValidCityName(name)) ? name.trim() : '';

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
          applyCity(map[interestId], interestId, 'interest');
          return;
        }
        // 2. Al doilea: loc_physical_ms — unde e fizic userul
        if (physicalId && map[physicalId] && isValidCityName(map[physicalId])) {
          applyCity(map[physicalId], physicalId, 'physical');
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
