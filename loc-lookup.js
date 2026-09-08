(function () {
  var FALLBACK_DISPLAY = 'in Ihrer Nähe';

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

  function sendAnalyticsEvent(city, km, source) {
    if (typeof gtag !== 'function') return;
    gtag('event', 'location_detected', {
      'event_category': 'Dynamic Location',
      'event_label': city || 'fallback',
      'city_name': city || 'fallback',
      'distance_km': (km === null || km === undefined) ? -1 : km,
      'loc_source': source || 'none'
    });
  }

  function applyCity(name, km, source) {
    name = (name && isValidCityName(name)) ? name.trim() : '';

    sendAnalyticsEvent(name, km, source);

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
  }

  function run() {
    fetch('/geo', { credentials: 'omit' })
      .then(function (r) {
        if (!r.ok) throw new Error('geo failed');
        return r.json();
      })
      .then(function (geo) {
        if (geo && geo.erkannt && isValidCityName(geo.stadt)) {
          applyCity(geo.stadt, geo.km, 'cloudflare');
        } else {
          applyCity('', null, 'none');
        }
      })
      .catch(function () {
        applyCity('', null, 'error');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
