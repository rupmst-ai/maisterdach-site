// Cloudflare Pages Function: GET /geo?i=<loc_interest_ms>&p=<loc_physical_ms>
//
// Intoarce doar numele celor doua localitati, ca vizitatorul sa nu mai
// descarce tot de-cities.json (328 KB). Fisierul ramane pe server ca sursa
// de date si este citit o singura data pe instanta.
//
// Raspuns: {"i":"Potsdam","p":"Cottbus"}  (null daca ID-ul nu e in fisier)

let cities = null;

function id(v) {
  v = String(v || '');
  return /^\d{1,12}$/.test(v) ? v : '';
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const i = id(url.searchParams.get('i'));
  const p = id(url.searchParams.get('p'));

  if (!cities) {
    const res = await env.ASSETS.fetch(new URL('/de-cities.json', url));
    if (!res.ok) {
      return new Response('{"error":"cities unavailable"}', {
        status: 502,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }
    cities = await res.json();
  }

  const body = JSON.stringify({
    i: (i && cities[i]) || null,
    p: (p && cities[p]) || null
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
