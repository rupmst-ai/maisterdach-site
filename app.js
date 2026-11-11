const WA = '491630138072', PHONE = '+491630138072';
const GTAG_ID = 'AW-17044870869';

function trackConversion(label) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'conversion', { 'send_to': GTAG_ID + '/' + label });
  }
}

var WA_LEISTUNG = {'flachdach':'eine Flachdach-Abdichtung','sanierung-grosser-daecher':'eine Dachsanierung','dachreparatur':'eine Dachreparatur','blechdach':'ein Blechdach','solarmontage':'eine Solar-Montage','dachrinne':'eine Dachrinne','dachziegel':'neue Dachziegel','dachfenster':'ein Dachfenster','dachkasten':'einen Dachkasten','schornsteinverkleidung':'eine Schornsteinverkleidung','reinigung-beschichtung':'eine Dachreinigung','asbest':'eine Asbestdach-Sanierung','dachdaemmung':'eine Dachdämmung'};
function waText() {
  var key = (location.pathname.split('/').pop() || '').replace('.html', '');
  var was = WA_LEISTUNG[key] || 'Arbeiten an meinem Dach';
  var ort = window.__LOC_CITY__ ? ' in ' + window.__LOC_CITY__ : '';
  return 'Hallo, ich brauche ein Angebot für ' + was + ort + '. Adresse/PLZ: ';
}
function waHref() { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(waText()); }
window.waHref = waHref;

function applyLinks() {
  // Linkurile au deja numarul corect in HTML; aici se adauga doar textul
  // pregatit pentru WhatsApp. Conversiile se trimit dintr-un singur loc,
  // din handlerul de click de la sfarsitul fisierului.
  document.querySelectorAll('.wa-l, .whatsapp-link').forEach(function(el) {
    el.href = waHref();
    el.addEventListener('click', function() { el.href = waHref(); });
  });
  var pw = document.getElementById('popupWaBtn');
  if (pw) { pw.href = waHref(); pw.addEventListener('click', function() { pw.href = waHref(); }); }
  // Campaniile din afara Berlinului (Brandenburg, Hamburg...) folosesc mobilul:
  // scriptul bbg-switch din pagina pune window.__DJ_PHONE__.
  var phone = window.__DJ_PHONE__ || PHONE;
  document.querySelectorAll('.call-l').forEach(function(el) {
    el.href = 'tel:' + phone;
    if (window.__DJ_PHONE__) {
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) n.nodeValue = n.nodeValue.replace(/\+?49 ?30 ?5445357103|030 ?5445357103/, '0163 0138072');
    }
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

document.addEventListener('DOMContentLoaded', applyLinks);

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

/* ---- Jurnal apeluri / WhatsApp -> Google Sheet ---- */
(function () {
  var LOG_URL = 'https://script.google.com/macros/s/AKfycbxKxU91jmxHQIyEyBzzcuQ7Q3zN1q9wsklPoltXMbpYjF6GybzK2o2ZqforBrD8gBLk/exec';
  var sent = {};

  function param(n) {
    try { return new URLSearchParams(window.location.search).get(n) || ''; }
    catch (e) { return ''; }
  }

  function logHit(action) {
    var key = action + '|' + Date.now().toString().slice(0, -4);
    if (sent[key]) return;
    sent[key] = 1;

    var data = {
      action:   action,
      city:     window.__LOC_CITY__ || '',
      rawCity:  window.__LOC_RAW__ || '',
      locSrc:   window.__LOC_SOURCE__ || 'none',
      locPhys:  window.__LOC_PHYS__ || param('loc_physical_ms') || param('loc_id'),
      locInt:   window.__LOC_INT__ || param('loc_interest_ms'),
      campId:   window.__LOC_CAMP__ || param('gad_campaignid'),
      locId:    window.__LOC_ID__ || param('loc_physical_ms') || param('loc_id'),
      page:     window.location.pathname,
      campaign: param('gad_campaignid'),
      keyword:  param('kw'),
      device:   /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'telefon' : 'desktop',
      referrer: document.referrer || 'direct'
    };

    try {
      var blob = new Blob([JSON.stringify(data)], { type: 'text/plain;charset=UTF-8' });
      if (navigator.sendBeacon && navigator.sendBeacon(LOG_URL, blob)) return;
    } catch (e) {}

    try {
      fetch(LOG_URL, {
        method: 'POST',
        mode: 'no-cors',
        keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(data)
      });
    } catch (e) {}
  }

  window.logCallHit = logHit;
})();

/* ---- Notificare instant pe Telegram (functions/notify.js) ---- */
(function () {
  var last = {};

  // kw / campanie / device / gclid vin doar in URL-ul paginii de intrare:
  // le pastram pe sesiune, ca sa mearga si de pe paginile urmatoare.
  function val(n, key) {
    var v = '';
    try { v = new URLSearchParams(window.location.search).get(n) || ''; } catch (e) {}
    try {
      if (v) sessionStorage.setItem(key, v);
      else v = sessionStorage.getItem(key) || '';
    } catch (e) {}
    return v;
  }
  var ctx = {
    kw:       val('kw', 'dj_kw'),
    campaign: val('gad_campaignid', 'dj_camp_n'),
    device:   val('device', 'dj_dev'),
    gclid:    val('gclid', 'dj_gclid') || val('gbraid', 'dj_gbraid') || val('wbraid', 'dj_wbraid'),
    source:   val('utm_source', 'dj_src')
  };
  if (!ctx.source) {
    try {
      var h = document.referrer ? new URL(document.referrer).hostname : '';
      if (h && h.indexOf('dachjetz.de') === -1) { ctx.source = h; sessionStorage.setItem('dj_src', h); }
    } catch (e) {}
  }

  function notify(type) {
    var now = Date.now();
    if (last[type] && now - last[type] < 10000) return;   // fara dubluri la dublu-click
    last[type] = now;

    var ua = navigator.userAgent;
    var body = JSON.stringify({
      type:     type,
      // doar un oras real; "Brandenburg" din campanie nu ajuta, atunci decide IP-ul
      town:     /^(interest|physical)/.test(window.__LOC_SOURCE__ || '') ? (window.__LOC_CITY__ || '') : '',
      kw:       ctx.kw,
      campaign: ctx.campaign || window.__LOC_CAMP__ || '',
      device:   ctx.device || (/iPad|Tablet/i.test(ua) ? 't' : /Mobi|Android|iPhone/i.test(ua) ? 'm' : 'c'),
      gclid:    ctx.gclid,
      page:     window.location.pathname,
      source:   ctx.source
    });

    // sendBeacon supravietuieste trecerii la aplicatia de telefon / WhatsApp
    // (la "Apel" fetch-ul se pierdea pe mobil); fetch doar daca beacon lipseste.
    var sent = false;
    try { sent = !!(navigator.sendBeacon && navigator.sendBeacon('/notify', new Blob([body], { type: 'text/plain;charset=UTF-8' }))); } catch (e) {}
    if (!sent) {
      try {
        fetch('/notify', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: body })
          .catch(function () {});
      } catch (e2) {}
    }
  }

  window.djNotify = notify;
})();

/* ---- Un singur handler pentru orice buton de apel / WhatsApp / formular ----
   Antet, bara fixa, Kontakt, mijlocul paginii, popup, bula, subsol.
   La fiecare click trimite o singura data: conversia Google Ads,
   evenimentul GA4, jurnalul din Sheet si notificarea Telegram. */
(function () {
  var CONV = { call: 'rrY2CMqh2vYcENWt0L8_', whatsapp: 'oURWCJjz5PYcENWt0L8_' };
  var last = {};

  function wo(el) {
    if (el.closest('#formPopupOverlay')) return 'popup';
    if (el.closest('#wab')) return 'bubble';
    if (el.closest('.sticky-bar')) return 'sticky';
    if (el.closest('header, .topbar')) return 'header';
    if (el.closest('footer')) return 'footer';
    if (el.closest('.contact-sec')) return 'kontakt';
    if (el.closest('.mid-cta')) return 'mitte';
    return 'seite';
  }

  function contact(type, el) {
    var now = Date.now();
    if (last[type] && now - last[type] < 1500) return;   // dublu-tap
    last[type] = now;

    trackConversion(CONV[type]);
    if (typeof gtag !== 'undefined') {
      gtag('event', type === 'call' ? 'click_call' : 'click_whatsapp', {
        'send_to': 'G-E40WQHWM7V',
        'button': wo(el),
        'page_path': window.location.pathname
      });
    }
    if (window.logCallHit) window.logCallHit(type === 'call' ? 'Apel' : 'WhatsApp');
    if (window.djNotify) window.djNotify(type);
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target && ev.target.closest ? ev.target : null;
    if (!t) return;
    var a = t.closest('a[href]');
    if (a) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf('tel:') === 0) contact('call', a);
      else if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp') !== -1) contact('whatsapp', a);
      return;
    }
    // Formularul rapid (.qf-unit): conversia si evenimentul GA4 le trimite
    // scriptul din pagina; aici doar Telegram, si doar la numar valid.
    var b = t.closest('.qf-btn');
    if (b && window.djNotify) {
      var u = b.closest('.qf-unit'), tel = u && u.querySelector('.qf-tel');
      if (tel && tel.value.replace(/\D/g, '').length >= 6) window.djNotify('form');
    }
  }, true);
})();
