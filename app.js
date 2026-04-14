const WA = '4917688087715', PHONE = '+4917688087715';
const GTAG_ID = 'AW-17044870869';

function trackConversion(label) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'conversion', { 'send_to': GTAG_ID + '/' + label });
  }
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
