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

function buildWhatsAppMsg(formEl) {
  var name      = (formEl.querySelector('[name="name"]') || {}).value || '';
  var telefon   = (formEl.querySelector('[name="telefon"]') || {}).value || '';
  var plz       = (formEl.querySelector('[name="plz"]') || {}).value || '';
  var nachricht = (formEl.querySelector('[name="nachricht"]') || {}).value || '';
  var page      = document.title || '';

  return '🏠 *Neue Anfrage – Maisterdach*\n\n'
    + '👤 Name: ' + name + '\n'
    + '📞 Telefon: ' + telefon + '\n'
    + '📍 PLZ: ' + plz + '\n'
    + (nachricht ? '💬 Nachricht: ' + nachricht + '\n' : '')
    + '\n📄 Seite: ' + page;
}

function submitToFormspreeAndWhatsApp(formEl, onSuccess) {
  if (!formEl.checkValidity()) { formEl.reportValidity(); return; }

  var data = new FormData(formEl);

  // 1. Trimite la Formspree
  fetch(formEl.action, {
    method: 'POST',
    body: data,
    headers: { 'Accept': 'application/json' }
  })
  .then(function(r) {
    // 2. Indiferent de raspuns, deschide WhatsApp
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(buildWhatsAppMsg(formEl));
    window.open(url, '_blank');

    trackConversion('form_submit');
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submit_whatsapp', { 'event_category': 'Lead', 'event_label': document.title });
    }

    formEl.reset();
    if (onSuccess) onSuccess();
  })
  .catch(function() {
    // Chiar daca Formspree esueaza, deschidem WhatsApp — lead-ul nu se pierde
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(buildWhatsAppMsg(formEl));
    window.open(url, '_blank');
    formEl.reset();
    if (onSuccess) onSuccess();
  });
}

document.addEventListener('DOMContentLoaded', function() {
  applyLinks();
  forceOpenFAQ();

  // 1. Formularul principal
  var mainForm = document.getElementById('contact-form');
  if (mainForm) {
    mainForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitToFormspreeAndWhatsApp(mainForm, function() {
        var s = document.getElementById('form-success');
        if (s) s.style.display = 'block';
      });
    });
  }

  // 2. Popup exit-intent
  var popupForm = document.querySelector('#formPopupOverlay form');
  if (popupForm) {
    popupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitToFormspreeAndWhatsApp(popupForm, function() {
        setTimeout(function() {
          var ov = document.getElementById('formPopupOverlay');
          if (ov) ov.style.display = 'none';
          localStorage.setItem('popupClosed', 'true');
          localStorage.setItem('popupSubmitted', 'true');
        }, 1500);
      });
    });
  }

  // 3. Sticky modal form
  var stickyForm = document.getElementById('stickyForm');
  if (stickyForm) {
    stickyForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitToFormspreeAndWhatsApp(stickyForm, function() {
        var s = document.getElementById('stickySuccess');
        if (s) { s.style.display = 'block'; stickyForm.style.display = 'none'; }
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
