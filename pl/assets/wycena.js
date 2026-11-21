/* Strony /pl/wycena-.../ – formularz wyceny w 3 krokach.
   Powiadomienia i konwersje: funkcje z app.js (window.DJPL). */
(function () {
  'use strict';
  var data = {}, step = 1, total = 3, sent = false, lastPartial = '', timer;
  var bar = document.getElementById('bar'), stepn = document.getElementById('stepn'), back = document.getElementById('back');
  var tel = document.getElementById('tel'), adr = document.getElementById('adr');
  var PARTIAL_WAIT = 30000;   // tyle ciszy po wpisaniu danych = zgłoszenie częściowe

  function notify(type) {
    try { if (window.DJPL) window.DJPL.tg(type, data); } catch (e) {}
  }

  function go(n) {
    step = n;
    document.querySelectorAll('.step').forEach(function (s) { s.classList.toggle('on', +s.dataset.step === n); });
    bar.style.width = (n > total ? 100 : Math.round(n / total * 100)) + '%';
    stepn.textContent = n > total ? 'Gotowe' : 'Krok ' + n + ' z ' + total;
    back.style.visibility = (n > 1 && n <= total) ? 'visible' : 'hidden';
    document.body.classList.toggle('s3', n === 3);
    if (n !== 3) document.body.classList.remove('kb');
  }

  /* Po 30.11.2026 oferta zimowa (−15%) znika: zamiast niej wycena bez rabatu. */
  if (new Date() >= new Date(2026, 11, 1)) {
    document.querySelectorAll('.offer[data-v="Oferta zimowa"]').forEach(function (b) {
      b.dataset.v = 'Standardowa wycena';
      delete b.dataset.pct;
      b.innerHTML = '<span class="ic">📋</span><span><div class="t">Standardowa wycena — bez rabatu</div><div class="d">bezpłatne oględziny i wycena</div></span>';
    });
  }

  document.querySelectorAll('.opt,.offer').forEach(function (b) {
    b.addEventListener('click', function () {
      b.parentNode.querySelectorAll('.sel').forEach(function (x) { x.classList.remove('sel'); });
      b.classList.add('sel');
      data[b.dataset.k] = b.dataset.v;
      if (b.classList.contains('offer')) {
        var li = document.getElementById('pct').closest('li');
        if (b.dataset.pct) { data.rabat = b.dataset.pct + '%'; document.getElementById('pct').textContent = b.dataset.pct; li.style.display = ''; }
        else { delete data.rabat; li.style.display = 'none'; }
      }
      setTimeout(function () { go(step + 1); }, 180);
    });
  });
  back.addEventListener('click', function () { if (step > 1) go(step - 1); });

  function valid() {
    return { tel: tel.value.replace(/\D/g, '').length >= 9, adr: adr.value.trim().length >= 5 };
  }
  function collect() {
    data.telefon = tel.value.trim();
    data.adres = adr.value.trim();
  }

  /* Zgłoszenie częściowe: jest telefon lub adres, ale nikt nie kliknął „Odbieram ofertę”.
     Wysyłane przy wyjściu ze strony albo po 30 s bez pisania – raz na dany zestaw danych. */
  function partial() {
    if (sent) return;
    var v = valid();
    if (!v.tel && !v.adr) return;
    collect();
    var key = data.telefon + '|' + data.adres;
    if (key === lastPartial) return;
    lastPartial = key;
    notify('partial');
  }
  [tel, adr].forEach(function (el) {
    el.addEventListener('focus', function () { document.body.classList.add('kb'); });
    el.addEventListener('blur', function () {
      setTimeout(function () {
        var a = document.activeElement;
        if (a !== tel && a !== adr) document.body.classList.remove('kb');
      }, 150);
    });
    el.addEventListener('input', function () {
      tel.classList.remove('err');
      clearTimeout(timer);
      timer = setTimeout(partial, PARTIAL_WAIT);
    });
  });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') partial(); });
  window.addEventListener('pagehide', partial);

  document.getElementById('f').addEventListener('submit', function (e) {
    e.preventDefault();
    if (sent) return;
    var v = valid();
    tel.classList.toggle('err', !v.tel);
    if (!v.tel) { tel.focus(); return; }
    collect();
    sent = true;
    clearTimeout(timer);
    if (document.activeElement) document.activeElement.blur();
    document.body.classList.remove('kb', 's3');
    notify('form');
    /* Konwersja Google Ads „formular” – tylko przy prawdziwym wysłaniu. */
    try { if (window.DJPL) window.DJPL.formConversion(data.problem); } catch (err) {}
    go(4);
  });
})();
