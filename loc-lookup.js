(function () {
  var FALLBACK_DISPLAY = 'in Ihrer Region';

  function getParams() {
    var p = new URLSearchParams(window.location.search);
    return {
      locId: p.get('loc_physical_ms') || p.get('loc_id') || ''
    };
  }

  function sendAnalyticsEvent(city, locId) {
    if (typeof gtag !== 'function') return;
    gtag('event', 'location_detected', {
      'event_category': 'Dynamic Location',
      'event_label': city || 'fallback',
      'loc_id': locId || 'none',
      'city_name': city || 'fallback'
    });
  }

  function applyCity(name, locId) {
    name = (name && name.trim()) ? name.trim() : '';

    // Trimite event la Google Analytics
    sendAnalyticsEvent(name, locId);

    // Title si meta
    if (name) {
      document.title = 'Dachdecker in ' + name + ' und Region | Maisterdach – Kostenlose Besichtigung';
      var meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.content = meta.content.replace('Kostenlose Besichtigung', 'in ' + name + ' und Region – Kostenlose Besichtigung');
      }
    } else {
      document.title = 'Dachdecker | Maisterdach – Kostenlose Besichtigung';
    }

    // .city
    document.querySelectorAll('.city').forEach(function (el) {
      el.textContent = name ? name + ' und Region' : FALLBACK_DISPLAY;
    });

    // .city-full — cu oras: "in Potsdam und Region", fara: ascuns
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

    // Harta — doar cu oras real
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

    // Propaga loc_id in link-urile interne
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
    var locId = getParams().locId;

    if (!locId) {
      applyCity('', '');
      return;
    }

    fetch('de-cities.json')
      .then(function (r) {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(function (map) {
        applyCity(map[locId] || '', locId);
      })
      .catch(function () {
        applyCity('', locId);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
