(function () {
  var FALLBACK_DISPLAY = 'in Ihrer Region';

  function getParams() {
    var p = new URLSearchParams(window.location.search);
    return {
      locId: p.get('loc_physical_ms') || p.get('loc_id') || ''
    };
  }

  // Verifica daca valoarea din JSON e un nume de oras valid
  // (nu un numar, nu un cod scurt, nu un district generic)
  function isValidCityName(name) {
    if (!name || name.trim() === '') return false;
    var n = name.trim();
    // Respinge daca e doar cifre
    if (/^\d+$/.test(n)) return false;
    // Respinge daca e prea scurt (sub 3 caractere)
    if (n.length < 3) return false;
    // Respinge daca contine "District" sau "Stadtbezirk" sau similar
    if (/^district\s*\d+$/i.test(n)) return false;
    if (/^stadtbezirk/i.test(n)) return false;
    if (/^stadtbezirke/i.test(n)) return false;
    return true;
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
    name = (name && isValidCityName(name)) ? name.trim() : '';

    // Trimite event la Google Analytics
    sendAnalyticsEvent(name, locId);

    // Title si meta
    if (name) {
      // Insereaza orasul in titlul existent al paginii (nu il suprascrie)
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

    // .city-full — cu oras: afiseaza, fara: ascunde
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
