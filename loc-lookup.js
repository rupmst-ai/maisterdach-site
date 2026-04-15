(function () {
  var FALLBACK = 'Berlin und Brandenburg';

  function getParams() {
    var p = new URLSearchParams(window.location.search);
    return {
      locId: p.get('loc_physical_ms') || p.get('loc_id') || ''
    };
  }

  function applyCity(name) {
    name = (name && name.trim()) ? name.trim() : '';
    var display = name || FALLBACK;

    // Actualizeaza <title> si <meta description>
    document.title = 'Dachdecker in ' + display + ' | Maisterdach – Kostenlose Besichtigung';
    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.content = meta.content.replace('Kostenlose Besichtigung', 'in ' + display + ' – Kostenlose Besichtigung');
    }

    // .city
    document.querySelectorAll('.city').forEach(function (el) {
      el.textContent = display;
    });

    // .city-full — afiseaza intotdeauna
    document.querySelectorAll('.city-full').forEach(function (el) {
      el.style.display = '';
      var cn = el.querySelector('.city-name');
      if (cn) cn.textContent = display;
    });

    // .city-sub
    document.querySelectorAll('.city-sub').forEach(function (el) {
      el.textContent = 'in ' + display + ' und Umgebung';
      el.style.display = '';
    });

    // .city-map
    document.querySelectorAll('.city-map').forEach(function (el) {
      el.textContent = display;
    });

    // Harta — doar daca avem oras real (nu fallback generic)
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
    var locId = getParams().locId;
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
      applyCity('');
      return;
    }

    fetch('de-cities.json')
      .then(function (r) {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(function (map) {
        applyCity(map[locId] || '');
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
