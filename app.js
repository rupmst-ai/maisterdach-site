const WA = '4917688087715', PHONE = '+4917688087715';
const GTAG_ID = 'AW-17044870869';

const FALLBACK_LOC = 'in Brandenburg';
const FALLBACK_REGION = 'im Raum Brandenburg';

const PAGE_MESSAGES = {
  'index.html':     'Hallo, ich habe ein Problem mit meinem Dach {Loc}. Bitte um kurzen Rückruf oder Angebot.',
  'flachdach.html': 'Hallo, ich brauche Hilfe mit einem Flachdach {Loc}. Bitte um kurzen Rückruf oder Angebot.',
  'blechdach.html': 'Hallo, ich brauche Hilfe mit einem Blechdach {Loc}. Bitte um kurzen Rückruf oder Angebot.',
  'klempner.html':  'Hallo, ich brauche Hilfe mit Dachrinne oder Fallrohr {Loc}. Bitte um kurzen Rückruf oder Angebot.',
};

const FALLBACK_LOC2 = 'in Brandenburg';

// ── Conversion tracking ──
function trackConversion(label) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'conversion', {
      'send_to': GTAG_ID + '/' + label,
    });
  }
}

function applyLinks() {
  const city = (new URLSearchParams(window.location.search).get('city') || '')
    .replace(/[^a-zA-ZäöüÄÖÜß\s\-]/g, '').trim();

  const path = window.location.pathname.split('/').pop() || 'index.html';
  const loc  = city ? 'in ' + city : FALLBACK_LOC;

  // ── H1 city span ──
  document.querySelectorAll('.city-full').forEach(el => {
    el.style.display = '';
    el.textContent = city ? ' in ' + city + ' und Umgebung' : ' ' + FALLBACK_REGION;
  });
  document.querySelectorAll('.city-sub').forEach(el => {
    el.textContent = city ? 'in ' + city + ' und Umgebung' : FALLBACK_REGION;
  });
  document.querySelectorAll('.city-name').forEach(el => {
    el.textContent = city || 'Brandenburg';
    el.style.display = '';
  });

  // ── Title tag ──
  document.title = city
    ? 'Dachdecker in ' + city + ' | Dachreparatur & Flachdach'
    : 'Dachdecker Brandenburg | Dachreparatur & Flachdach';

  // ── WhatsApp message ──
  const template = PAGE_MESSAGES[path] || PAGE_MESSAGES['index.html'];
  const msg = template.replace('{Loc}', loc);
  const waURL = 'https://wa.me/4917688087715?text=' + encodeURIComponent(msg);

  // ── Apply links + conversion tracking ──
  document.querySelectorAll('.wa-l, .whatsapp-link').forEach(el => {
    el.href = waURL;
    el.addEventListener('click', function() {
      trackConversion('whatsapp_click');
      // Also fire standard event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'click', { event_category: 'WhatsApp', event_label: path });
      }
    });
  });

  document.querySelectorAll('.call-l').forEach(el => {
    el.href = 'tel:' + PHONE;
    el.addEventListener('click', function() {
      trackConversion('phone_call');
      if (typeof gtag !== 'undefined') {
        gtag('event', 'click', { event_category: 'Phone', event_label: path });
      }
    });
  });
}
applyLinks();

// ── Form conversion tracking — fires ONLY after Formspree success ──
document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var data = new FormData(form);
      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
      .then(function(response) {
        if (response.ok) {
          // ✅ Only fires after confirmed Formspree success
          if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
              'send_to': 'AW-17044870869/REPLACE_WITH_LABEL', // ← înlocuiește REPLACE_WITH_LABEL cu labelul din Google Ads
              'value': 1.0,
              'currency': 'EUR'
            });
            gtag('event', 'form_submit', {
              event_category: 'Contact',
              event_label: 'Besichtigung'
            });
          }
          // Show success message
          var s = document.getElementById('form-success');
          if (s) s.style.display = 'block';
          form.reset();
        } else {
          alert('Es gab einen Fehler. Bitte versuchen Sie es erneut.');
        }
      })
      .catch(function() {
        alert('Es gab einen Fehler. Bitte versuchen Sie es erneut.');
      });
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
  const item = document.getElementById(id);
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
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
