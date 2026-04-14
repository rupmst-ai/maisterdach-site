(function () {
  var FALLBACK = 'in Ihrer Nähe';

  function getLocId() {
    return new URLSearchParams(window.location.search).get('loc_id') || '';
  }

  function applyCity(city) {
    var name = (city && city.trim()) ? city.trim() : '';

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

    if (name) {
      document.title = 'Dachdecker in ' + name + ' | Maisterdach – Kostenlose Besichtigung';

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

    // Propagă loc_id în toate link-urile interne
    var locId = getLocId();
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
    var locId = getLocId();

    if (!locId) {
      applyCity('');
      return;
    }

    fetch('/de-cities.json')
      .then(function (r) {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(function (map) {
        var city = map[locId] || '';
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
