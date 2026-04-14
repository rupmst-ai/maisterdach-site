const WA = '4917688087715', PHONE = '+4917688087715';
const GTAG_ID = 'AW-17044870869';
const CITY_COOKIE = 'md_city';
const COOKIE_DAYS = 7;

function setCookie(name, value, days) {
  var d = new Date();
  d.setTime(d.getTime() + (days * 864e5));
  document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
}
function getCookie(name) {
  var v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? decodeURIComponent(v.pop()) : '';
}

function trackConversion(label) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'conversion', { 'send_to': GTAG_ID + '/' + label });
  }
}

function applyCity(city) {
  if (!city) return;

  document.querySelectorAll('.city').forEach(function(el) { el.textContent = city; });

  document.querySelectorAll('.city-full').forEach(function(el) {
    el.style.display = '';
    var cn = el.querySelector('.city-name');
    if (cn) cn.textContent = city;
  });

  document.querySelectorAll('.city-sub').forEach(function(el) {
    el.textContent = 'in ' + city + ' und Umgebung';
    el.style.display = '';
  });

  document.title = 'Dachdecker in ' + city + ' | Maisterdach – Kostenlose Besichtigung';

  var section = document.getElementById('map-section');
  if (section) section.style.display = 'block';
  document.querySelectorAll('.city-map').forEach(function(el) { el.textContent = city; });
  var mapDiv = document.getElementById('dynamic-map');
  if (mapDiv && mapDiv.children.length === 0) {
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.google.com/maps?q=' + encodeURIComponent(city + ', Germany') + '&output=embed&z=10';
    iframe.width = '100%'; iframe.height = '150';
    iframe.style.cssText = 'border:0;display:block;';
    iframe.loading = 'lazy';
    mapDiv.appendChild(iframe);
  }

  document.querySelectorAll('a[href]').forEach(function(el) {
    var href = el.getAttribute('href');
    if (href && href.endsWith('.html') && !href.startsWith('http') && !href.includes('?')) {
      el.href = href + '?loc_id=' + new URLSearchParams(window.location.search).get('loc_id');
    }
  });
}

function detectCity(callback) {
  // 1. ?city= param (manual / legacy)
  var rawCity = new URLSearchParams(window.location.search).get('city') || '';
  if (/^[a-zA-ZäöüÄÖÜß\s\-]{2,50}$/.test(rawCity)) {
    var city = rawCity.trim();
    setCookie(CITY_COOKIE, city, COOKIE_DAYS);
    return callback(city);
  }

  // 2. Daca loc_id e in URL, ignora cookie-ul — loc-lookup.js se ocupa de oras
  var hasLocId = new URLSearchParams(window.location.search).get('loc_id') || '';
  if (hasLocId) {
    return callback('');
  }

  // 3. Cookie (din vizita anterioara, doar daca nu exista loc_id in URL)
  var cached = getCookie(CITY_COOKIE);
  if (cached && /^[a-zA-ZäöüÄÖÜß\s\-]{2,50}$/.test(cached)) {
    return callback(cached);
  }

  // 4. Niciun oras gasit — titlul ramane "Ihr Dachdecker in der Nähe"
  callback('');
}

function applyLinks() {
  var waURL = 'https://wa.me/' + WA;
  document.querySelectorAll('.wa-l, .whatsapp-link').forEach(function(el) {
    el.href = waURL;
    el.addEventListener('click', function() { trackConversion('whatsapp_click'); });
  });
  document.querySelectorAll('.call-l').forEach(function(el) {
    el.href = 'tel:' + PHONE;
    el.addEventListener('click', function() { trackConversion('phone_call'); });
  });
}

function forceOpenFAQ() {
  document.querySelectorAll('.faq-item').forEach(function(el) {
    el.classList.add('open');
    var panel = el.querySelector('.faq-panel');
    var chev = el.querySelector('.faq-chev');
    if (panel) panel.style.cssText = 'display:block!important;grid-template-rows:1fr!important;';
    if (chev) chev.style.display = 'none';
  });
  document.querySelectorAll('.faq-inner').forEach(function(el) { el.style.overflow = 'visible'; });
}

document.addEventListener('DOMContentLoaded', function() {
  applyLinks();
  forceOpenFAQ();
  detectCity(function(city) { if (city) applyCity(city); });

  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var data = new FormData(form);
      fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function(response) {
          if (response.ok) {
            if (typeof gtag !== 'undefined') gtag('event', 'conversion', { 'send_to': GTAG_ID + '/form_submit', 'value': 1.0, 'currency': 'EUR' });
            var s = document.getElementById('form-success');
            if (s) s.style.display = 'block';
            form.reset();
            var overlay = document.getElementById('formPopupOverlay');
            if (overlay) overlay.style.display = 'none';
            localStorage.setItem('popupClosed', 'true');
          } else { alert('Es gab einen Fehler. Bitte versuchen Sie es erneut.'); }
        })
        .catch(function() { alert('Es gab einen Fehler. Bitte versuchen Sie es erneut.'); });
    });
  }

  var popupForm = document.getElementById('popup-form');
  if (popupForm) {
    popupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var data = new FormData(popupForm);
      fetch(popupForm.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function(r) {
          if (r.ok) {
            var s = document.getElementById('popup-success');
            if (s) s.style.display = 'block';
            popupForm.reset();
            setTimeout(function() {
              var ov = document.getElementById('formPopupOverlay');
              if (ov) ov.style.display = 'none';
              localStorage.setItem('popupClosed', 'true');
            }, 2000);
          }
        });
    });
  }
});

function toggleNav() {
  var n = document.getElementById('nav'), h = document.getElementById('hbg');
  n.classList.toggle('open'); h.classList.toggle('open');
}
document.addEventListener('click', function(e) {
  var n = document.getElementById('nav'), h = document.getElementById('hbg');
  if (n && n.classList.contains('open') && !n.contains(e.target) && !h.contains(e.target)) {
    n.classList.remove('open'); h.classList.remove('open');
  }
});

function faq(id) {
  var item = document.getElementById(id);
  if (item) item.classList.toggle('open');
}
function acc(id) {
  var item = document.getElementById(id);
  var isOpen = item.classList.contains('open');
  document.querySelectorAll('.acc-item').forEach(function(el) { el.classList.remove('open'); });
  if (!isOpen) {
    item.classList.add('open');
    setTimeout(function() { item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50);
  }
}
function openStickyForm() {
  var m = document.getElementById('stickyModal');
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeStickyForm() {
  var m = document.getElementById('stickyModal');
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}
