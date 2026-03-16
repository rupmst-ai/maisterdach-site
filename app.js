const WA = '4917688087715', PHONE = '+4917688087715';
const GTAG_ID = 'AW-17044870869';
const FALLBACK_LOC = '';
const FALLBACK_REGION = 'in Ihrer Nähe';

const PAGE_MESSAGES = {
  'index.html':     'Hallo, ich habe ein Problem mit meinem Dach {Loc}. Bitte um kurzen Rückruf oder Angebot.',
  'flachdach.html': 'Hallo, ich brauche Hilfe mit einem Flachdach {Loc}. Bitte um kurzen Rückruf oder Angebot.',
  'blechdach.html': 'Hallo, ich brauche Hilfe mit einem Blechdach {Loc}. Bitte um kurzen Rückruf oder Angebot.',
  'klempner.html':  'Hallo, ich brauche Hilfe mit Dachrinne oder Fallrohr {Loc}. Bitte um kurzen Rückruf oder Angebot.',
};

function trackConversion(label) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'conversion', { 'send_to': GTAG_ID + '/' + label });
  }
}

function applyLinks() {
  const rawCity = (new URLSearchParams(window.location.search).get('city') || '');
  // Only accept valid city names — reject Google Ads placeholders
  const city = /^[a-zA-ZäöüÄÖÜß\s\-]{2,50}$/.test(rawCity) ? rawCity.trim() : '';

  const path = window.location.pathname.split('/').pop() || 'index.html';
  const loc  = city ? 'in ' + city : FALLBACK_LOC;

  // city-full: show only when city is valid
  document.querySelectorAll('.city-full').forEach(el => {
    if (city) {
      el.style.display = '';
      el.querySelector('.city-name') && (el.querySelector('.city-name').textContent = city);
    } else {
      el.style.display = 'none';
    }
  });

  // city-sub: show only when city is valid
  document.querySelectorAll('.city-sub').forEach(el => {
    if (city) {
      el.textContent = 'in ' + city + ' und Umgebung';
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });

  document.title = city
    ? 'Dachdecker in ' + city + ' | Maisterdach – Kostenlose Besichtigung'
    : 'Maisterdach – Ihr Dachdecker | Kostenlose Besichtigung';

  const template = PAGE_MESSAGES[path] || PAGE_MESSAGES['index.html'];
  const locStr = city ? 'in ' + city : '';
  const msg = template.replace(' {Loc}', locStr ? ' ' + locStr : '').trim();
  const waURL = 'https://wa.me/4917688087715?text=' + encodeURIComponent(msg);

  document.querySelectorAll('.wa-l, .whatsapp-link').forEach(el => {
    el.href = waURL;
    el.addEventListener('click', function() {
      trackConversion('whatsapp_click');
    });
  });

  document.querySelectorAll('.call-l').forEach(el => {
    el.href = 'tel:' + PHONE;
    el.addEventListener('click', function() {
      trackConversion('phone_call');
    });
  });

  // Propagate city to all internal links
  if (city) {
    document.querySelectorAll('a[href]').forEach(el => {
      const href = el.getAttribute('href');
      if (href && href.endsWith('.html') && !href.startsWith('http') && !href.includes('?')) {
        el.href = href + '?city=' + encodeURIComponent(city);
      }
    });
  }

  // ── Force all FAQ panels open ──
  document.querySelectorAll('.faq-item').forEach(el => {
    el.classList.add('open');
    var panel = el.querySelector('.faq-panel');
    var chev = el.querySelector('.faq-chev');
    if (panel) { panel.style.cssText = 'display:block!important;grid-template-rows:1fr!important;'; }
    if (chev) chev.style.display = 'none';
  });
  document.querySelectorAll('.faq-inner').forEach(el => {
    el.style.overflow = 'visible';
  });

}
applyLinks();

  // Popup form submission
  var popupForm = document.getElementById('popup-form');
  if (popupForm) {
    popupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var data = new FormData(popupForm);
      fetch(popupForm.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
      .then(function(r) {
        if (r.ok) {
          document.getElementById('popup-success').style.display = 'block';
          popupForm.reset();
          setTimeout(function() {
            document.getElementById('formPopupOverlay').style.display = 'none';
            localStorage.setItem('popupClosed', 'true');
          }, 2000);
        }
      });
    });
  }

// Form submission
document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var data = new FormData(form);
      fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
      .then(function(response) {
        if (response.ok) {
          if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', { 'send_to': 'AW-17044870869/REPLACE_WITH_LABEL', 'value': 1.0, 'currency': 'EUR' });
          }
          var s = document.getElementById('form-success');
          if (s) s.style.display = 'block';
          form.reset();
          // Close popup if form submitted from popup
          var overlay = document.getElementById('formPopupOverlay');
          if (overlay) overlay.style.display = 'none';
          localStorage.setItem('popupClosed', 'true');
        } else {
          alert('Es gab einen Fehler. Bitte versuchen Sie es erneut.');
        }
      })
      .catch(function() { alert('Es gab einen Fehler. Bitte versuchen Sie es erneut.'); });
    });
  }
});

function toggleNav() {
  const n = document.getElementById('nav'), h = document.getElementById('hbg');
  n.classList.toggle('open'); h.classList.toggle('open');
}
document.addEventListener('click', e => {
  const n = document.getElementById('nav'), h = document.getElementById('hbg');
  if (n && n.classList.contains('open') && !n.contains(e.target) && !h.contains(e.target)) {
    n.classList.remove('open'); h.classList.remove('open');
  }
});

function faq(id) {
  var item = document.getElementById(id);
  if (item) item.classList.toggle('open');
}

function acc(id) {
  const item = document.getElementById(id);
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.acc-item').forEach(el => el.classList.remove('open'));
  if (!isOpen) {
    item.classList.add('open');
    setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }
}
