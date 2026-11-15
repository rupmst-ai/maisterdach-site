// Cloudflare Pages Function: GET /miasto
// Intoarce orasul vizitatorului, detectat de Cloudflare dupa IP (fara stocare).
// Folosit de paginile /pl/ ca sa afiseze localitatea omului, cand cuvantul
// cautat nu contine un oras.  Raspuns: {"city":"Piaseczno"}
export async function onRequestGet({ request }) {
  const cf = request.cf || {};
  const pl = cf.country === 'PL';
  const city = pl && cf.city ? String(cf.city).slice(0, 80) : '';
  return new Response(JSON.stringify({ city: city }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store' }
  });
}
