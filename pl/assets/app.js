/* Maisterdach PL – skrypt wspólny dla stron /pl/
   Konwersje Google Ads – te same akcje co na stronie DE (konto AW-17044870869). */
(function () {
  'use strict';

  var AW = 'AW-17044870869';
  var GA4 = 'G-E40WQHWM7V';   // Google Analytics – ta sama usługa co na stronie DE
  var LABEL = {
    whatsapp: 'oURWCJjz5PYcENWt0L8_',   // Whatsapp
    tel: 'rrY2CMqh2vYcENWt0L8_',        // Anruf
    form: 'zz_4CN-B2_YcENWt0L8_'        // formular
  };
  var FORM_URL = 'https://formspree.io/f/xvzbwbrj';
  var THANKS_URL = '/pl/dziekujemy/';
  var CONSENT_KEY = 'pl_consent_v1';

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }

  /* Zdarzenie GA4 (nazwy jak na stronie DE: click_call, click_whatsapp, generate_lead). */
  function ga(ev, el, extra) {
    var o = { send_to: GA4, page_path: location.pathname, site_lang: 'pl' };
    if (el) o.button = el.closest('.hd') ? 'header' : el.closest('.mbar') ? 'sticky' : el.closest('.hero') ? 'hero'
      : el.closest('.form-sec') ? 'formularz' : el.closest('.ft') ? 'footer' : el.closest('.cta') ? 'cta' : 'strona';
    for (var k in extra || {}) o[k] = extra[k];
    window.gtag('event', ev, o);
  }

  function conv(label, cb) {
    var o = { send_to: AW + '/' + label };
    if (cb) { o.event_callback = cb; o.event_timeout = 1500; }
    window.gtag('event', 'conversion', o);
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
    /* Tag Google ładujemy od razu na każdej stronie /pl/: odczytuje gclid z adresu
       wejścia i jest gotowy, zanim ktoś kliknie telefon lub WhatsApp. */
    loadGtag();
    if (now) return;
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
  function linkZ(e) {
    var t = e.target;
    if (t && t.nodeType !== 1) t = t.parentNode;          // tekst / stare SVG
    if (t && t.correspondingUseElement) t = t.correspondingUseElement;
    return t && t.closest ? t.closest('a[href]') : null;
  }
  function initClicks() {
    /* Telefon: powiadomienie już przy puszczeniu palca – zanim przeglądarka przejdzie do aplikacji telefonu. */
    document.addEventListener('pointerup', function (e) {   // przy przewijaniu przychodzi pointercancel, nie pointerup
      var a = linkZ(e);
      if (a && (a.getAttribute('href') || '').trim().toLowerCase().indexOf('tel:') === 0) tg('call');
    }, true);
    document.addEventListener('click', function (e) {
      var a = linkZ(e);
      if (!a) return;
      var h = (a.getAttribute('href') || '').trim().toLowerCase();
      /* Dowolny numer: +48, +49, bez prefiksu – liczy się tylko schemat tel: */
      if (h.indexOf('tel:') === 0) { tg('call'); loadGtag(); conv(LABEL.tel); ga('click_call', a); }
      else if (/^(https?:)?\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//.test(h) || h.indexOf('whatsapp://') === 0) {
        tg('whatsapp'); loadGtag(); conv(LABEL.whatsapp); ga('click_whatsapp', a);
      }
      else if (a.hasAttribute('data-cookies')) { e.preventDefault(); showBanner(true); }
    }, true);
  }

  /* ---- Formularz ---- */
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
        fd.append('gclid', CTX.gclid);
        fd.append('kampania', CTX.campaign);

        btn.disabled = true;
        var oldTxt = btn.textContent;
        btn.textContent = 'Wysyłanie…';

        fetch(FORM_URL, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
          .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            tg('form');
            /* Konwersja „formular”, potem strona podziękowania (najpóźniej po 1,5 s). */
            var poszlo = false;
            function dalej() { if (poszlo) return; poszlo = true; location.href = THANKS_URL; }
            loadGtag();
            ga('generate_lead', null, { rodzaj_pracy: fd.get('rodzaj_pracy') || '' });
            conv(LABEL.form, dalej);
            setTimeout(dalej, 1600);
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
     Domyślnie Warszawa. Nowa kampania w innym mieście: w Google Ads w sufiksie
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
    leszno:         ['Leszno', 'w Lesznie'],
    /* Cały region: trzeci element = true (bez „i okolice”). */
    dolnoslaskie:   ['Dolny Śląsk', 'na Dolnym Śląsku', true]
  };

  /* Miejscowości z fraz kluczowych (parametr kw=... z Google Ads).
     Gdy ktoś szuka „dekarz oleśnica”, strona pokazuje Oleśnicę. */
  var MIASTA = {
    /* Okolice Warszawy (do 50 km) */
    'piaseczno': ['Piaseczno', 'w Piasecznie'],
    'legionowo': ['Legionowo', 'w Legionowie'],
    'pruszkow': ['Pruszków', 'w Pruszkowie'],
    'otwock': ['Otwock', 'w Otwocku'],
    'wolomin': ['Wołomin', 'w Wołominie'],
    'grodzisk mazowiecki': ['Grodzisk Mazowiecki', 'w Grodzisku Mazowieckim'],
    'grodzisk': ['Grodzisk Mazowiecki', 'w Grodzisku Mazowieckim'],
    'minsk mazowiecki': ['Mińsk Mazowiecki', 'w Mińsku Mazowieckim'],
    'dekarz marki': ['Marki', 'w Markach'],
    'dachy marki': ['Marki', 'w Markach'],
    'zabki': ['Ząbki', 'w Ząbkach'],
    'kobylka': ['Kobyłka', 'w Kobyłce'],
    'zielonka': ['Zielonka', 'w Zielonce'],
    'jozefow': ['Józefów', 'w Józefowie'],
    'konstancin jeziorna': ['Konstancin-Jeziorna', 'w Konstancinie-Jeziornie'],
    'konstancin': ['Konstancin-Jeziorna', 'w Konstancinie-Jeziornie'],
    'gora kalwaria': ['Góra Kalwaria', 'w Górze Kalwarii'],
    'nowy dwor mazowiecki': ['Nowy Dwór Mazowiecki', 'w Nowym Dworze Mazowieckim'],
    'dekarz blonie': ['Błonie', 'w Błoniu'],
    'dachy blonie': ['Błonie', 'w Błoniu'],
    'ozarow mazowiecki': ['Ożarów Mazowiecki', 'w Ożarowie Mazowieckim'],
    'piastow': ['Piastów', 'w Piastowie'],
    'milanowek': ['Milanówek', 'w Milanówku'],
    'brwinow': ['Brwinów', 'w Brwinowie'],
    'podkowa lesna': ['Podkowa Leśna', 'w Podkowie Leśnej'],
    'lomianki': ['Łomianki', 'w Łomiankach'],
    'sulejowek': ['Sulejówek', 'w Sulejówku'],
    'halinow': ['Halinów', 'w Halinowie'],
    'radzymin': ['Radzymin', 'w Radzyminie'],
    'serock': ['Serock', 'w Serocku'],
    'tluszcz': ['Tłuszcz', 'w Tłuszczu'],
    'zyrardow': ['Żyrardów', 'w Żyrardowie'],
    'grojec': ['Grójec', 'w Grójcu'],
    'tarczyn': ['Tarczyn', 'w Tarczynie'],
    'karczew': ['Karczew', 'w Karczewie'],
    'wiazowna': ['Wiązowna', 'w Wiązownie'],
    'nadarzyn': ['Nadarzyn', 'w Nadarzynie'],
    'raszyn': ['Raszyn', 'w Raszynie'],
    'mszczonow': ['Mszczonów', 'w Mszczonowie'],
    'zakroczym': ['Zakroczym', 'w Zakroczymiu'],
    'lesznowola': ['Lesznowola', 'w Lesznowoli'],
    'izabelin': ['Izabelin', 'w Izabelinie'],
    'stare babice': ['Stare Babice', 'w Starych Babicach'],
    'wieliszew': ['Wieliszew', 'w Wieliszewie'],
    'nieporet': ['Nieporęt', 'w Nieporęcie'],
    'jablonna': ['Jabłonna', 'w Jabłonnie'],
    'celestynow': ['Celestynów', 'w Celestynowie'],
    'zalesie gorne': ['Zalesie Górne', 'w Zalesiu Górnym'],
    'komorow': ['Komorów', 'w Komorowie'],
    'michalowice': ['Michałowice', 'w Michałowicach'],
    'olesnica': ['Oleśnica', 'w Oleśnicy'],
    'olawa': ['Oława', 'w Oławie'],
    'trzebnica': ['Trzebnica', 'w Trzebnicy'],
    'sroda slaska': ['Środa Śląska', 'w Środzie Śląskiej'],
    'katy wroclawskie': ['Kąty Wrocławskie', 'w Kątach Wrocławskich'],
    'siechnice': ['Siechnice', 'w Siechnicach'],
    'kobierzyce': ['Kobierzyce', 'w Kobierzycach'],
    'dlugoleka': ['Długołęka', 'w Długołęce'],
    'oborniki slaskie': ['Oborniki Śląskie', 'w Obornikach Śląskich'],
    'jelcz laskowice': ['Jelcz-Laskowice', 'w Jelczu-Laskowicach'],
    'sobotka': ['Sobótka', 'w Sobótce'],
    'brzeg dolny': ['Brzeg Dolny', 'w Brzegu Dolnym'],
    'bielany wroclawskie': ['Bielany Wrocławskie', 'w Bielanach Wrocławskich'],
    'zorawina': ['Żórawina', 'w Żórawinie'],
    'czernica': ['Czernica', 'w Czernicy'],
    'wisznia mala': ['Wisznia Mała', 'w Wiszni Małej'],
    'miekinia': ['Miękinia', 'w Miękini'],
    'legnica': ['Legnica', 'w Legnicy'],
    'walbrzych': ['Wałbrzych', 'w Wałbrzychu'],
    'jelenia gora': ['Jelenia Góra', 'w Jeleniej Górze'],
    'lubin': ['Lubin', 'w Lubinie'],
    'glogow': ['Głogów', 'w Głogowie'],
    'swidnica': ['Świdnica', 'w Świdnicy'],
    'boleslawiec': ['Bolesławiec', 'w Bolesławcu'],
    'dzierzoniow': ['Dzierżoniów', 'w Dzierżoniowie'],
    'zgorzelec': ['Zgorzelec', 'w Zgorzelcu'],
    'bielawa': ['Bielawa', 'w Bielawie'],
    'klodzko': ['Kłodzko', 'w Kłodzku'],
    'jawor': ['Jawor', 'w Jaworze'],
    'polkowice': ['Polkowice', 'w Polkowicach'],
    'luban': ['Lubań', 'w Lubaniu'],
    'swiebodzice': ['Świebodzice', 'w Świebodzicach'],
    'nowa ruda': ['Nowa Ruda', 'w Nowej Rudzie'],
    'strzegom': ['Strzegom', 'w Strzegomiu'],
    'zlotoryja': ['Złotoryja', 'w Złotoryi'],
    'kamienna gora': ['Kamienna Góra', 'w Kamiennej Górze'],
    'boguszow gorce': ['Boguszów-Gorce', 'w Boguszowie-Gorcach'],
    'chojnow': ['Chojnów', 'w Chojnowie'],
    'strzelin': ['Strzelin', 'w Strzelinie'],
    'wolow': ['Wołów', 'w Wołowie'],
    'milicz': ['Milicz', 'w Miliczu'],
    'sycow': ['Syców', 'w Sycowie'],
    'zabkowice slaskie': ['Ząbkowice Śląskie', 'w Ząbkowicach Śląskich'],
    'bystrzyca klodzka': ['Bystrzyca Kłodzka', 'w Bystrzycy Kłodzkiej'],
    'kowary': ['Kowary', 'w Kowarach'],
    'lwowek slaski': ['Lwówek Śląski', 'w Lwówku Śląskim'],
    'bogatynia': ['Bogatynia', 'w Bogatyni'],
    'ziebice': ['Ziębice', 'w Ziębicach'],
    'twardogora': ['Twardogóra', 'w Twardogórze'],
    'zmigrod': ['Żmigród', 'w Żmigrodzie'],
    'gluszyca': ['Głuszyca', 'w Głuszycy'],
    'szklarska poreba': ['Szklarska Poręba', 'w Szklarskiej Porębie'],
    'karpacz': ['Karpacz', 'w Karpaczu'],
    'kudowa zdroj': ['Kudowa-Zdrój', 'w Kudowie-Zdroju'],
    'polanica zdroj': ['Polanica-Zdrój', 'w Polanicy-Zdroju'],
    'ladek zdroj': ['Lądek-Zdrój', 'w Lądku-Zdroju'],
    'piechowice': ['Piechowice', 'w Piechowicach'],
    'gryfow slaski': ['Gryfów Śląski', 'w Gryfowie Śląskim'],
    'lubawka': ['Lubawka', 'w Lubawce'],
    'pieszyce': ['Pieszyce', 'w Pieszycach'],
    'pilawa gorna': ['Piława Górna', 'w Piławie Górnej'],
    'jaworzyna slaska': ['Jaworzyna Śląska', 'w Jaworzynie Śląskiej'],
    'zarow': ['Żarów', 'w Żarowie'],
    'swieradow zdroj': ['Świeradów-Zdrój', 'w Świeradowie-Zdroju'],
    'nowogrodziec': ['Nowogrodziec', 'w Nowogrodźcu'],
    'chocianow': ['Chocianów', 'w Chocianowie'],
    'przemkow': ['Przemków', 'w Przemkowie'],
    'scinawa': ['Ścinawa', 'w Ścinawie'],
    'prochowice': ['Prochowice', 'w Prochowicach'],
    'bierutow': ['Bierutów', 'w Bierutowie'],
    'szczawno zdroj': ['Szczawno-Zdrój', 'w Szczawnie-Zdroju'],
    'niemcza': ['Niemcza', 'w Niemczy'],
    'zloty stok': ['Złoty Stok', 'w Złotym Stoku'],
    'dekarz gora': ['Góra', 'w Górze']
  };
  var REGION_NAZWA = 'Warszawa';
  var MIASTO_NAZWA = '';

  /* ---- Powiadomienie na Telegram (functions/notify.js), jak na stronie DE ---- */
  function sesja(n, key) {
    var v = '';
    try { v = new URLSearchParams(location.search).get(n) || ''; } catch (e) {}
    try {
      if (v) sessionStorage.setItem(key, v);
      else v = sessionStorage.getItem(key) || '';
    } catch (e) {}
    return v;
  }
  var CTX = {
    kw:       sesja('kw', 'pl_kw'),
    campaign: sesja('gad_campaignid', 'pl_camp'),
    device:   sesja('device', 'pl_dev'),
    gclid:    sesja('gclid', 'pl_gclid') || sesja('gbraid', 'pl_gbraid') || sesja('wbraid', 'pl_wbraid'),
    source:   sesja('utm_source', 'pl_src')
  };
  if (!CTX.source) {
    try {
      var rh = document.referrer ? new URL(document.referrer).hostname : '';
      if (rh && rh.indexOf('dachjetz.de') === -1) { CTX.source = rh; sessionStorage.setItem('pl_src', rh); }
    } catch (e) {}
  }
  var lastTg = {};
  function tg(type) {
    var now = Date.now();
    if (lastTg[type] && now - lastTg[type] < 10000) return;   // bez duplikatów przy podwójnym kliknięciu
    lastTg[type] = now;
    var ua = navigator.userAgent;
    var body = JSON.stringify({
      type:     type,
      town:     MIASTO_NAZWA,          // tylko prawdziwa miejscowość z frazy; inaczej decyduje IP
      kw:       CTX.kw,
      campaign: CTX.campaign,
      device:   CTX.device || (/iPad|Tablet/i.test(ua) ? 't' : /Mobi|Android|iPhone/i.test(ua) ? 'm' : 'c'),
      gclid:    CTX.gclid,
      page:     location.pathname,
      source:   CTX.source
    });
    /* sendBeacon przeżywa przejście do aplikacji telefonu / WhatsApp; fetch tylko gdy beacon niedostępny. */
    var ok = false;
    try { ok = !!(navigator.sendBeacon && navigator.sendBeacon('/notify', new Blob([body], { type: 'text/plain;charset=UTF-8' }))); } catch (e) {}
    if (!ok) {
      try {
        fetch('/notify', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: body })
          .catch(function () {});
      } catch (e2) {}
    }
  }

  function bezOgonkow(t) {
    t = String(t || '').toLowerCase();
    try { t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0142/g, 'l'); } catch (e) {}
    return t.replace(/[^a-z0-9]+/g, ' ').replace(/^ +| +$/g, '');
  }

  function zapisz(klucz, wart) {
    try {
      if (wart) sessionStorage.setItem(klucz, wart);
      else wart = sessionStorage.getItem(klucz) || '';
    } catch (e) {}
    return wart;
  }

  function regionKey() {
    var k = '';
    try { k = new URLSearchParams(location.search).get('region') || ''; } catch (e) {}
    return zapisz('pl_region', bezOgonkow(k).replace(/ /g, '-').slice(0, 40));
  }

  /* Miejscowość z frazy kluczowej: najdłuższa pasująca nazwa. */
  function miastoKey() {
    var kw = '';
    try { kw = new URLSearchParams(location.search).get('kw') || ''; } catch (e) {}
    kw = ' ' + bezOgonkow(kw) + ' ';
    if (kw.length <= 2) {
      /* Kliknięcie w reklamę bez frazy: poprzednia miejscowość nie obowiązuje. */
      var nowe = false;
      try { nowe = !!new URLSearchParams(location.search).get('region'); } catch (e) {}
      if (nowe) { try { sessionStorage.removeItem('pl_miasto'); } catch (e) {} return ''; }
      return zapisz('pl_miasto', '');
    }
    /* Nowe kliknięcie w reklamę: fraza bez miejscowości kasuje poprzednią. */
    var best = '';
    for (var m in MIASTA) {
      if (MIASTA.hasOwnProperty(m) && m.length > best.length && kw.indexOf(' ' + m + ' ') !== -1) best = m;
    }
    try {
      if (best) sessionStorage.setItem('pl_miasto', best);
      else sessionStorage.removeItem('pl_miasto');
    } catch (e) {}
    return best;
  }

  function applyRegion() {
    var k = regionKey();
    var m = miastoKey();
    var r = MIASTA[m] || null;
    if (r) MIASTO_NAZWA = r[0];
    if (!r) {
      if (!k || k === 'warszawa') return;
      r = REGIONY[k];
      if (!r) {
        /* Nieznane miasto: nazwa z parametru, bez odmiany. */
        var n = k.split('-').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
        r = [n, 'w miejscowości ' + n];
      }
    }
    REGION_NAZWA = r[0];
    var obszar = r[2] === true;
    var locU = r[1].charAt(0).toUpperCase() + r[1].slice(1);
    function zam(t) {
      if (obszar) {
        t = t.replace(/w Warszawie i okolicach \(do 50 km\)/g, r[1])
             .replace(/w Warszawie i okolicach/g, r[1])
             .replace(/W Warszawie i okolicach/g, locU)
             .replace(/w Warszawie lub w okolicy/g, r[1])
             .replace(/w Warszawie lub okolicy/g, r[1])
             .replace(/Warszawa i okolice \(do 50 km\)/g, r[0])
             .replace(/Warszawa i okolice/g, r[0])
             .replace(/do około 50 km od miasta/g, 'w całym regionie')
             .replace(/np\. Warszawa/g, 'np. Legnica');
      }
      /* Jedno przejście: wstawiony tekst nie jest ponownie zamieniany. */
      return t.replace(/[Ww] Warszawie|Warszawa/g, function (x) {
        return x === 'w Warszawie' ? r[1] : x === 'W Warszawie' ? locU : r[0];
      });
    }
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node, list = [];
    while ((node = w.nextNode())) {
      /* Adres UODO (00-193 Warszawa) zostaje bez zmian. */
      if (/Warszaw|50 km od miasta/.test(node.nodeValue) && !/00-193/.test(node.nodeValue) && !/^(SCRIPT|STYLE)$/.test(node.parentNode.nodeName)) list.push(node);
    }
    list.forEach(function (nd) { nd.nodeValue = zam(nd.nodeValue); });
    Array.prototype.forEach.call(document.querySelectorAll('[placeholder*="Warszawa"]'), function (el) {
      el.setAttribute('placeholder', zam(el.getAttribute('placeholder')));
    });
    document.title = zam(document.title);
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', zam(md.getAttribute('content') || ''));
  }

  /* ---- Strona podziękowania: konwersja tylko po prawdziwym wysłaniu ---- */
  /* Konwersja formularza jest wysyłana przy wysłaniu, nie na stronie podziękowania. */
  function thanksPage() { return false; }

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
