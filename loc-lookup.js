(function () {
  var FALLBACK = 'Berlin und Brandenburg';

  // Citeste parametrul din URL — suporta toate variantele:
  // ?loc_physical_ms=1003853  (Google Ads direct)
  // ?loc_id=1003853           (tracking template)
  // ?city=Berlin              (fallback text direct)
  function getParams() {
    var p = new URLSearchParams(window.location.search);
    return {
      locId: p.get('loc_physical_ms') || p.get('loc_id') || ''
    };
  }

  function applyCity(city) {
    var name = (city && city.trim()) ? city.trim() : '';

    // Actualizeaza <title> si <meta description>
    if (name) {
      document.title = 'Dachdecker in ' + name + ' | Maisterdach – Kostenlose Besichtigung';
      var meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.content = meta.content.replace('Kostenlose Besichtigung', 'in ' + name + ' – Kostenlose Besichtigung');
      }
    } else {
      document.title = 'Dachdecker in Berlin und Brandenburg | Maisterdach – Kostenlose Besichtigung';
      var meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.content = meta.content.replace('Kostenlose Besichtigung', 'in Berlin und Brandenburg – Kostenlose Besichtigung');
      }
    }

    // Actualizeaza elementele .city
    document.querySelectorAll('.city').forEach(function (el) {
      el.textContent = name || FALLBACK;
    });

    document.querySelectorAll('.city-full').forEach(function (el) {
      el.style.display = name ? '' : 'none';
      var cn = el.querySelector('.city-name');
      if (cn) cn.textContent = name;
    });

    document.querySelectorAll('.city-sub').forEach(function (el) {
      if (name) {
        el.textContent = 'in ' + name + ' und Umgebung';
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Afiseaza harta daca exista oras
    if (name) {
      var section = document.getElementById('map-section');
      if (section) section.style.display = 'block';

      document.querySelectorAll('.city-map').forEach(function (el) {
        el.textContent = name;
      });

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

    // Propaga loc_id in toate link-urile interne
    var params = getParams();
    var locId = params.locId;
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

    // Daca avem loc_id sau loc_physical_ms, cauta in JSON
    if (!params.locId) {
      applyCity('');
      return;
    }

    fetch('de-cities.json')
      .then(function (r) {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(function (map) {
        var city = map[params.locId] || '';
        applyCity(city);
      })
      .catch(function () {
        applyCity('');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
