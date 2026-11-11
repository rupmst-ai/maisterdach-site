/* Maisterdach PL – skrypt wspólny dla stron /pl/
   Konwersje Google Ads: zamień etykiety PL_* na prawdziwe po utworzeniu konwersji. */
(function () {
  'use strict';

  var AW = 'AW-17044870869';
  var LABEL = {
    whatsapp: 'PL_WHATSAPP',
    tel: 'PL_TEL',
    form: 'PL_FORM'
  };
  var FORM_URL = 'https://formspree.io/f/xvzbwbrj';
  var THANKS_URL = '/pl/dziekujemy/';
  var CONSENT_KEY = 'pl_consent_v1';

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }

  function conv(label) {
    window.gtag('event', 'conversion', { send_to: AW + '/' + label });
  }

  /* ---- gtag.js: ładowany z opóźnieniem, żeby nie spowalniać strony ---- */
  var gtagLoaded = false;
  function loadGtag() {
    if (gtagLoaded) return;
    gtagLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + AW;
    document.head.appendChild(s);
  }
  function scheduleGtag(now) {
    if (now) { loadGtag(); return; }
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, loadGtag, { once: true, passive: true });
    });
    window.addEventListener('load', function () {
      setTimeout(function () {
        if ('requestIdleCallback' in window) requestIdleCallback(loadGtag, { timeout: 2000 });
        else loadGtag();
      }, 2500);
    });
  }

  /* ---- Zgoda na cookies (Google Consent Mode v2) ---- */
  function readConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch (e) { return null; }
  }
  function applyConsent(c) {
    var ads = c.marketing ? 'granted' : 'denied';
    window.gtag('consent', 'update', {
      ad_storage: ads,
      ad_user_data: ads,
      ad_personalization: ads,
      analytics_storage: c.analytics ? 'granted' : 'denied'
    });
  }
  function saveConsent(c) {
    c.t = Date.now();
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(c)); } catch (e) {}
    applyConsent(c);
  }

  var banner;
  function buildBanner() {
    banner = document.createElement('div');
    banner.className = 'ck';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Ustawienia plików cookie');
    banner.innerHTML =
      '<h2>Szanujemy Twoją prywatność</h2>' +
      '<p>Używamy plików cookie, aby mierzyć skuteczność naszych reklam Google i ulepszać stronę. ' +
      'Możesz zaakceptować wszystkie, odrzucić je lub wybrać, na co się zgadzasz. ' +
      'Szczegóły w <a href="/pl/polityka-prywatnosci/">polityce prywatności</a>.</p>' +
      '<div class="ck-set" id="ckSet">' +
        '<label><input type="checkbox" checked disabled> <span><b>Niezbędne</b> – potrzebne do działania strony.</span></label>' +
        '<label><input type="checkbox" id="ckAn"> <span><b>Analityczne</b> – statystyki odwiedzin strony.</span></label>' +
        '<label><input type="checkbox" id="ckMk"> <span><b>Marketingowe</b> – pomiar i dopasowanie reklam Google Ads.</span></label>' +
      '</div>' +
      '<div class="ck-btns">' +
        '<button type="button" class="ck-yes" data-ck="all">Akceptuję wszystkie</button>' +
        '<button type="button" data-ck="none">Odrzucam</button>' +
        '<button type="button" data-ck="set">Ustawienia</button>' +
      '</div>';
    document.body.appendChild(banner);

    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ck]');
      if (!b) return;
      var a = b.getAttribute('data-ck');
      var set = banner.querySelector('#ckSet');
      if (a === 'all') { saveConsent({ analytics: true, marketing: true }); hideBanner(); }
      else if (a === 'none') { saveConsent({ analytics: false, marketing: false }); hideBanner(); }
      else if (a === 'set') {
        if (!set.classList.contains('on')) {
          set.classList.add('on');
          b.textContent = 'Zapisz wybór';
        } else {
          saveConsent({
            analytics: banner.querySelector('#ckAn').checked,
            marketing: banner.querySelector('#ckMk').checked
          });
          hideBanner();
        }
      }
    });
  }
  function showBanner(withSettings) {
    if (!banner) buildBanner();
    var c = readConsent();
    if (c) {
      banner.querySelector('#ckAn').checked = !!c.analytics;
      banner.querySelector('#ckMk').checked = !!c.marketing;
    }
    if (withSettings) {
      banner.querySelector('#ckSet').classList.add('on');
      banner.querySelector('[data-ck="set"]').textContent = 'Zapisz wybór';
    }
    banner.classList.add('on');
  }
  function hideBanner() { if (banner) banner.classList.remove('on'); }

  /* ---- Menu mobilne ---- */
  function initNav() {
    var btn = document.getElementById('hbg');
    var nav = document.getElementById('nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Kliknięcia WhatsApp / telefon ---- */
  function initClicks() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var h = a.getAttribute('href');
      // na stronie podziękowania lead jest już policzony (PL_FORM) – nie liczymy go drugi raz
      var thanks = document.body.getAttribute('data-page') === 'dziekujemy';
      if (h.indexOf('https://wa.me/') === 0) { if (!thanks) { loadGtag(); conv(LABEL.whatsapp); } }
      else if (h.indexOf('tel:') === 0) { if (!thanks) { loadGtag(); conv(LABEL.tel); } }
      else if (a.hasAttribute('data-cookies')) { e.preventDefault(); showBanner(true); }
    });
  }

  /* ---- Formularz ---- */
  function param(n) {
    try { return new URLSearchParams(location.search).get(n) || ''; } catch (e) { return ''; }
  }
  function initForms() {
    document.querySelectorAll('form.js-lead').forEach(function (f) {
      var err = f.querySelector('.form-err');
      var btn = f.querySelector('button[type="submit"]');
      function fail(msg) { err.textContent = msg; err.style.display = 'block'; }

      f.addEventListener('submit', function (e) {
        e.preventDefault();
        err.style.display = 'none';
        var tel = f.querySelector('[name="telefon"]');
        if (tel.value.replace(/\D/g, '').length < 9) {
          fail('Podaj proszę poprawny numer telefonu.');
          tel.focus();
          return;
        }
        if (!f.checkValidity()) { f.reportValidity(); return; }

        var fd = new FormData(f);
        fd.append('_subject', 'PL – nowe zapytanie: ' + (fd.get('rodzaj_pracy') || '') + ' – ' + (fd.get('miejscowosc') || ''));
        fd.append('wersja', 'PL (' + REGION_NAZWA + ')');
        fd.append('strona', location.pathname);
        fd.append('gclid', param('gclid') || param('gbraid') || param('wbraid'));
        fd.append('kampania', param('gad_campaignid'));

        btn.disabled = true;
        var oldTxt = btn.textContent;
        btn.textContent = 'Wysyłanie…';

        fetch(FORM_URL, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
          .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            try { sessionStorage.setItem('pl_form_sent', '1'); } catch (x) {}
            location.href = THANKS_URL;
          })
          .catch(function () {
            btn.disabled = false;
            btn.textContent = oldTxt;
            fail('Nie udało się wysłać formularza. Napisz do nas na WhatsApp lub zadzwoń: +48 518 353 704.');
          });
      });
    });
  }

  /* ---- Obszar działania wg kampanii: parametr region=... w adresie ----
     Domyślnie Wrocław. Nowa kampania w innym mieście: w Google Ads w sufiksie
     końcowego adresu URL wpisać region=nazwa (np. region=poznan). */
  var REGIONY = {
    wroclaw:        ['Wrocław', 'we Wrocławiu'],
    warszawa:       ['Warszawa', 'w Warszawie'],
    poznan:         ['Poznań', 'w Poznaniu'],
    krakow:         ['Kraków', 'w Krakowie'],
    lodz:           ['Łódź', 'w Łodzi'],
    katowice:       ['Katowice', 'w Katowicach'],
    gdansk:         ['Gdańsk', 'w Gdańsku'],
    szczecin:       ['Szczecin', 'w Szczecinie'],
    opole:          ['Opole', 'w Opolu'],
    legnica:        ['Legnica', 'w Legnicy'],
    walbrzych:      ['Wałbrzych', 'w Wałbrzychu'],
    'zielona-gora': ['Zielona Góra', 'w Zielonej Górze'],
    'jelenia-gora': ['Jelenia Góra', 'w Jeleniej Górze'],
    lublin:         ['Lublin', 'w Lublinie'],
    bydgoszcz:      ['Bydgoszcz', 'w Bydgoszczy'],
    torun:          ['Toruń', 'w Toruniu'],
    bialystok:      ['Białystok', 'w Białymstoku'],
    rzeszow:        ['Rzeszów', 'w Rzeszowie'],
    kielce:         ['Kielce', 'w Kielcach'],
    olsztyn:        ['Olsztyn', 'w Olsztynie'],
    czestochowa:    ['Częstochowa', 'w Częstochowie'],
    gliwice:        ['Gliwice', 'w Gliwicach'],
    kalisz:         ['Kalisz', 'w Kaliszu'],
    leszno:         ['Leszno', 'w Lesznie']
  };
  var REGION_NAZWA = 'Wrocław';

  function regionKey() {
    var k = '';
    try { k = (new URLSearchParams(location.search).get('region') || '').toLowerCase(); } catch (e) {}
    k = k.replace(/[^a-z0-9\- ]/g, '').replace(/\s+/g, '-').slice(0, 40);
    try {
      if (k) sessionStorage.setItem('pl_region', k);
      else k = sessionStorage.getItem('pl_region') || '';
    } catch (e) {}
    return k;
  }

  function applyRegion() {
    var k = regionKey();
    if (!k || k === 'wroclaw') return;
    var r = REGIONY[k];
    if (!r) {
      /* Nieznane miasto: nazwa z parametru, bez odmiany. */
      var n = k.split('-').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
      r = [n, 'w mieście ' + n];
    }
    REGION_NAZWA = r[0];
    var locU = r[1].charAt(0).toUpperCase() + r[1].slice(1);
    function zam(t) {
      return t.replace(/we Wrocławiu/g, r[1]).replace(/We Wrocławiu/g, locU).replace(/Wrocław/g, r[0]);
    }
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node, list = [];
    while ((node = w.nextNode())) {
      if (node.nodeValue.indexOf('Wrocław') !== -1 && !/^(SCRIPT|STYLE)$/.test(node.parentNode.nodeName)) list.push(node);
    }
    list.forEach(function (nd) { nd.nodeValue = zam(nd.nodeValue); });
    Array.prototype.forEach.call(document.querySelectorAll('[placeholder*="Wrocław"]'), function (el) {
      el.setAttribute('placeholder', zam(el.getAttribute('placeholder')));
    });
    document.title = zam(document.title);
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', zam(md.getAttribute('content') || ''));
  }

  /* ---- Strona podziękowania: konwersja tylko po prawdziwym wysłaniu ---- */
  function thanksPage() {
    if (document.body.getAttribute('data-page') !== 'dziekujemy') return false;
    var sent = false;
    try { sent = sessionStorage.getItem('pl_form_sent') === '1'; } catch (e) {}
    if (sent) {
      try { sessionStorage.removeItem('pl_form_sent'); } catch (e) {}
      conv(LABEL.form);
      return true;
    }
    return false;
  }

  function init() {
    applyRegion();
    var c = readConsent();
    if (!c) showBanner(false);
    initNav();
    initClicks();
    initForms();
    scheduleGtag(thanksPage());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
