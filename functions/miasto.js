// Cloudflare Pages Function: GET /miasto
// Intoarce judetul (wojewodztwo) vizitatorului, detectat de Cloudflare dupa IP
// (fara stocare). Folosit de paginile /pl/ cand cuvantul cautat nu contine un oras.
// Raspuns: {"woj":"mazowieckie"}  ("" daca nu e in Polonia sau nu se stie)
export async function onRequestGet({ request }) {
  const cf = request.cf || {};
  const t = (String(cf.region || '') + ' ' + String(cf.regionCode || '')).toLowerCase();
  let woj = '';
  if (cf.country === 'PL') {
    if (/mazov|mazow|\b14\b|\bmz\b/.test(t) && !/warmi/.test(t)) woj = 'mazowieckie';
    else if (/lodz|\u0142\u00f3d|\b10\b|\bld\b/.test(t)) woj = 'lodzkie';
  }
  return new Response(JSON.stringify({ woj: woj }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store' }
  });
}
