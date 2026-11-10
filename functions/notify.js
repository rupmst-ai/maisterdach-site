// Cloudflare Pages Function: POST /notify
// Trimite pe Telegram un mesaj cand un vizitator apasa Apel / WhatsApp sau
// trimite formularul. Secretele TG_TOKEN si TG_CHAT_ID se pun DOAR in
// Cloudflare Pages -> Settings -> Variables and Secrets. Nu se scriu in cod.

const ALLOWED_ORIGINS = ['https://dachjetz.de', 'https://www.dachjetz.de'];

// Adauga aici fiecare campanie noua: ID -> nume.
const CAMPAIGNS = {
  '24288722376': 'Neues Dach – Brandenburg',
  '24455198059': 'Neues Dach – Sachsen'
};

const TYPES = {
  call: '📞 APEL',
  whatsapp: '💬 WHATSAPP',
  form: '📝 FORMULAR'
};

const DEVICES = { m: 'mobil', c: 'PC', t: 'tabletă' };

function clean(v, max) {
  if (v === undefined || v === null) return '';
  return String(v).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max || 120);
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

export async function onRequestPost({ request, env }) {
  if (ALLOWED_ORIGINS.indexOf(request.headers.get('Origin') || '') === -1) {
    return json({ ok: false, error: 'forbidden' }, 403);
  }
  if (!env.TG_TOKEN || !env.TG_CHAT_ID) {
    return json({ ok: false, error: 'not configured' }, 500);
  }

  let d;
  try {
    const raw = await request.text();
    if (raw.length > 4000) return json({ ok: false, error: 'too large' }, 413);
    d = JSON.parse(raw);
  } catch (e) {
    return json({ ok: false, error: 'bad json' }, 400);
  }
  if (!d || typeof d !== 'object') return json({ ok: false, error: 'bad json' }, 400);

  const type = clean(d.type, 20).toLowerCase();
  if (!TYPES[type]) return json({ ok: false, error: 'bad type' }, 400);

  const cf = request.cf || {};
  const town = clean(d.town, 80);
  const kw = clean(d.kw, 120);
  const campaign = clean(d.campaign, 40);
  const device = clean(d.device, 20).toLowerCase();
  const gclid = clean(d.gclid, 200);
  const page = clean(d.page, 200);
  const source = clean(d.source, 120);

  // Oras: cel trimis de site; daca lipseste, cel detectat de Cloudflare dupa IP.
  const ipCity = [clean(cf.city, 80), clean(cf.region, 80)].filter(Boolean).join(', ');
  const plz = clean(cf.postalCode, 12);
  let where = town || ipCity || 'necunoscut';
  if (town && ipCity && ipCity.toLowerCase().indexOf(town.toLowerCase()) === -1) {
    where += ' (după IP: ' + ipCity + ')';
  }
  if (plz) where += ' · PLZ ' + plz;

  let src;
  if (campaign) src = 'Google Ads – ' + (CAMPAIGNS[campaign] || campaign);
  else if (gclid) src = 'Google Ads';
  else src = 'direct / organic' + (source ? ' (' + source + ')' : '');

  const lines = [
    TYPES[type] + ' – dachjetz.de',
    '📍 ' + where,
    '🔎 Cuvânt: ' + (kw || '–'),
    '📣 Sursă: ' + src,
    '📱 Dispozitiv: ' + (DEVICES[device] || device || '–'),
    '📄 Pagină: ' + (page || '–')
  ];

  let res;
  try {
    res = await fetch('https://api.telegram.org/bot' + env.TG_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TG_CHAT_ID,
        text: lines.join('\n'),
        disable_web_page_preview: true
      })
    });
  } catch (e) {
    return json({ ok: false, error: 'telegram unreachable' }, 502);
  }
  if (!res.ok) return json({ ok: false, error: 'telegram ' + res.status }, 502);
  return json({ ok: true }, 200);
}
