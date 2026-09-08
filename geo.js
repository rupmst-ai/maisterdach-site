/**
 * /geo  –  Stadt-Erkennung über Cloudflare-Geodaten
 *
 * Inlocuieste sistemul bazat pe loc_physical_ms, care returna
 * catune (Bernowe, Beesdau, Brusendorf) si Bezirke (Mitte).
 *
 * Logica:
 *   1. Regiunea e Berlin        -> "Berlin"
 *   2. Cel mai apropiat oras din STAEDTE
 *   3. Peste MAX_KM sau fara geo -> fara oras (site-ul pune textul de rezerva)
 *
 * Raspunde la:  https://dachjetz.de/geo
 */

// Peste distanta asta nu se mai afiseaza niciun oras.
// Exista doar ca plasa de siguranta pentru trafic din afara zonei.
const MAX_KM = 150;

const STAEDTE = [
["Berlin",52.5200,13.4050,"Berlin"],
["Potsdam",52.3960,13.0590,"Brandenburg"],
["Cottbus",51.7600,14.3340,"Brandenburg"],
["Brandenburg an der Havel",52.4120,12.5560,"Brandenburg"],
["Frankfurt (Oder)",52.3480,14.5510,"Brandenburg"],
["Oranienburg",52.7550,13.2380,"Brandenburg"],
["Falkensee",52.5600,13.0920,"Brandenburg"],
["Eberswalde",52.8340,13.8180,"Brandenburg"],
["Bernau bei Berlin",52.6790,13.5880,"Brandenburg"],
["Königs Wusterhausen",52.2970,13.6260,"Brandenburg"],
["Fürstenwalde/Spree",52.3600,14.0630,"Brandenburg"],
["Schwedt/Oder",53.0600,14.2830,"Brandenburg"],
["Neuruppin",52.9260,12.8030,"Brandenburg"],
["Strausberg",52.5780,13.8870,"Brandenburg"],
["Hennigsdorf",52.6380,13.2040,"Brandenburg"],
["Blankenfelde-Mahlow",52.3430,13.4280,"Brandenburg"],
["Rathenow",52.6060,12.3360,"Brandenburg"],
["Ludwigsfelde",52.3010,13.2530,"Brandenburg"],
["Senftenberg",51.5260,14.0010,"Brandenburg"],
["Prenzlau",53.3160,13.8630,"Brandenburg"],
["Werder (Havel)",52.3790,12.9340,"Brandenburg"],
["Luckenwalde",52.0890,13.1660,"Brandenburg"],
["Teltow",52.4020,13.2710,"Brandenburg"],
["Hohen Neuendorf",52.6770,13.2830,"Brandenburg"],
["Wittenberge",52.9940,11.7510,"Brandenburg"],
["Zossen",52.2160,13.4480,"Brandenburg"],
["Spremberg",51.5700,14.3750,"Brandenburg"],
["Forst (Lausitz)",51.7350,14.6390,"Brandenburg"],
["Guben",51.9490,14.7150,"Brandenburg"],
["Finsterwalde",51.6290,13.7080,"Brandenburg"],
["Angermünde",53.0170,13.9990,"Brandenburg"],
["Velten",52.6940,13.1760,"Brandenburg"],
["Nauen",52.6070,12.8740,"Brandenburg"],
["Wandlitz",52.7500,13.4510,"Brandenburg"],
["Panketal",52.6380,13.5000,"Brandenburg"],
["Neuenhagen bei Berlin",52.5220,13.6860,"Brandenburg"],
["Hoppegarten",52.5100,13.6470,"Brandenburg"],
["Erkner",52.4240,13.7520,"Brandenburg"],
["Schönefeld",52.3890,13.5030,"Brandenburg"],
["Wildau",52.3200,13.6390,"Brandenburg"],
["Eisenhüttenstadt",52.1500,14.6330,"Brandenburg"],
["Beeskow",52.1720,14.2460,"Brandenburg"],
["Storkow (Mark)",52.2560,13.9300,"Brandenburg"],
["Lübben (Spreewald)",51.9430,13.8920,"Brandenburg"],
["Lübbenau/Spreewald",51.8650,13.9650,"Brandenburg"],
["Calau",51.7440,13.9510,"Brandenburg"],
["Vetschau/Spreewald",51.7860,14.0770,"Brandenburg"],
["Herzberg (Elster)",51.6880,13.2300,"Brandenburg"],
["Jüterbog",51.9950,13.0750,"Brandenburg"],
["Treuenbrietzen",52.0960,12.8730,"Brandenburg"],
["Bad Belzig",52.1410,12.5940,"Brandenburg"],
["Beelitz",52.2350,12.9730,"Brandenburg"],
["Michendorf",52.3100,13.0300,"Brandenburg"],
["Kleinmachnow",52.4060,13.2210,"Brandenburg"],
["Stahnsdorf",52.3860,13.2130,"Brandenburg"],
["Bad Freienwalde (Oder)",52.7860,14.0310,"Brandenburg"],
["Wriezen",52.7190,14.1350,"Brandenburg"],
["Seelow",52.5310,14.3790,"Brandenburg"],
["Müncheberg",52.5080,14.1350,"Brandenburg"],
["Rüdersdorf bei Berlin",52.4820,13.7860,"Brandenburg"],
["Fredersdorf-Vogelsdorf",52.5310,13.7510,"Brandenburg"],
["Altlandsberg",52.5640,13.7340,"Brandenburg"],
["Werneuchen",52.6320,13.7400,"Brandenburg"],
["Biesenthal",52.7660,13.6340,"Brandenburg"],
["Zehdenick",52.9810,13.3340,"Brandenburg"],
["Gransee",53.0060,13.1580,"Brandenburg"],
["Templin",53.1210,13.5010,"Brandenburg"],
["Lychen",53.2130,13.3160,"Brandenburg"],
["Fürstenberg/Havel",53.1830,13.1460,"Brandenburg"],
["Liebenwalde",52.8740,13.3970,"Brandenburg"],
["Kremmen",52.7630,13.0280,"Brandenburg"],
["Rheinsberg",53.0990,12.8970,"Brandenburg"],
["Wittstock/Dosse",53.1620,12.4840,"Brandenburg"],
["Kyritz",52.9430,12.3960,"Brandenburg"],
["Neustadt (Dosse)",52.8500,12.4430,"Brandenburg"],
["Pritzwalk",53.1480,12.1810,"Brandenburg"],
["Perleberg",53.0730,11.8580,"Brandenburg"],
["Bad Wilsnack",52.9550,11.9470,"Brandenburg"],
["Premnitz",52.5350,12.3480,"Brandenburg"],
["Ketzin/Havel",52.4800,12.8450,"Brandenburg"],
["Trebbin",52.2160,13.2240,"Brandenburg"],
["Baruth/Mark",52.0520,13.5020,"Brandenburg"],
["Dahme/Mark",51.8680,13.4280,"Brandenburg"],
["Doberlug-Kirchhain",51.6200,13.5700,"Brandenburg"],
["Elsterwerda",51.4620,13.5200,"Brandenburg"],
["Bad Liebenwerda",51.5170,13.3970,"Brandenburg"],
["Mühlberg/Elbe",51.4340,13.2210,"Brandenburg"],
["Ortrand",51.3770,13.7590,"Brandenburg"],
["Lauchhammer",51.4990,13.7830,"Brandenburg"],
["Schwarzheide",51.4780,13.8700,"Brandenburg"],
["Großräschen",51.5880,14.0080,"Brandenburg"],
["Welzow",51.5850,14.1660,"Brandenburg"],
["Drebkau",51.6530,14.2210,"Brandenburg"],
["Peitz",51.8590,14.4080,"Brandenburg"],
["Mittenwalde",52.2640,13.5050,"Brandenburg"],
["Luckau",51.8510,13.7080,"Brandenburg"],
["Golßen",51.9760,13.5980,"Brandenburg"],
["Rangsdorf",52.2900,13.4270,"Brandenburg"],
["Zeuthen",52.3530,13.6290,"Brandenburg"],
["Eichwalde",52.3680,13.6180,"Brandenburg"],
["Schulzendorf",52.3610,13.5940,"Brandenburg"],
["Bestensee",52.2340,13.6460,"Brandenburg"],
["Teupitz",52.1280,13.6170,"Brandenburg"],
["Halbe",52.1160,13.6990,"Brandenburg"],
["Märkisch Buchholz",52.0750,13.7620,"Brandenburg"],
["Lieberose",51.9850,14.2930,"Brandenburg"],
["Friedland",52.1070,14.2640,"Brandenburg"],
["Sonnewalde",51.6880,13.6470,"Brandenburg"],
["Uebigau-Wahrenbrück",51.5940,13.3030,"Brandenburg"],
["Falkenberg/Elster",51.5850,13.2430,"Brandenburg"],
["Ziesar",52.2690,12.2860,"Brandenburg"],
["Havelsee",52.4180,12.4370,"Brandenburg"],
["Wusterhausen/Dosse",52.8880,12.4630,"Brandenburg"],
["Meyenburg",53.3110,12.2460,"Brandenburg"],
["Putlitz",53.2460,12.0410,"Brandenburg"],
["Lenzen (Elbe)",53.0980,11.4740,"Brandenburg"],
["Friesack",52.7350,12.5780,"Brandenburg"],
["Joachimsthal",52.9800,13.7440,"Brandenburg"],
["Oderberg",52.8680,14.0430,"Brandenburg"],
["Mühlenbeck",52.6640,13.3730,"Brandenburg"],
["Glienicke/Nordbahn",52.6380,13.3170,"Brandenburg"],
["Birkenwerder",52.6870,13.2830,"Brandenburg"],
["Dallgow-Döberitz",52.5350,13.0620,"Brandenburg"],
["Brieselang",52.5900,12.9960,"Brandenburg"],
["Wustermark",52.5480,12.9550,"Brandenburg"],
["Groß Kreutz (Havel)",52.4000,12.7880,"Brandenburg"],
["Schwielowsee",52.3520,12.9830,"Brandenburg"],
["Nuthetal",52.3510,13.1110,"Brandenburg"],
["Großbeeren",52.3590,13.3130,"Brandenburg"],
["Ahrensfelde",52.5770,13.5770,"Brandenburg"],
["Bad Saarow",52.2880,14.0700,"Brandenburg"],
["Grünheide (Mark)",52.4120,13.8130,"Brandenburg"],
["Woltersdorf",52.4430,13.7520,"Brandenburg"],
["Schöneiche bei Berlin",52.4700,13.6960,"Brandenburg"],
["Dresden",51.0500,13.7380,"Sachsen"],
["Leipzig",51.3400,12.3750,"Sachsen"],
["Chemnitz",50.8330,12.9210,"Sachsen"],
["Görlitz",51.1520,14.9870,"Sachsen"],
["Bautzen",51.1810,14.4240,"Sachsen"],
["Hoyerswerda",51.4350,14.2460,"Sachsen"],
["Riesa",51.3080,13.2930,"Sachsen"],
["Meißen",51.1660,13.4720,"Sachsen"],
["Freiberg",50.9110,13.3420,"Sachsen"],
["Torgau",51.5600,12.9990,"Sachsen"],
["Eilenburg",51.4620,12.6350,"Sachsen"],
["Delitzsch",51.5260,12.3430,"Sachsen"],
["Zwickau",50.7180,12.4960,"Sachsen"],
["Magdeburg",52.1210,11.6280,"Sachsen-Anhalt"],
["Halle (Saale)",51.4820,11.9700,"Sachsen-Anhalt"],
["Dessau-Roßlau",51.8340,12.2470,"Sachsen-Anhalt"],
["Lutherstadt Wittenberg",51.8670,12.6470,"Sachsen-Anhalt"],
["Stendal",52.6030,11.8580,"Sachsen-Anhalt"],
["Bitterfeld-Wolfen",51.6240,12.3170,"Sachsen-Anhalt"],
["Köthen (Anhalt)",51.7510,11.9700,"Sachsen-Anhalt"],
["Bernburg (Saale)",51.7950,11.7400,"Sachsen-Anhalt"],
["Aschersleben",51.7550,11.4620,"Sachsen-Anhalt"],
["Halberstadt",51.8950,11.0480,"Sachsen-Anhalt"],
["Wernigerode",51.8340,10.7880,"Sachsen-Anhalt"],
["Salzwedel",52.8530,11.1550,"Sachsen-Anhalt"],
["Gardelegen",52.5260,11.3900,"Sachsen-Anhalt"],
["Genthin",52.4040,12.1570,"Sachsen-Anhalt"],
["Burg",52.2720,11.8550,"Sachsen-Anhalt"],
["Schönebeck (Elbe)",52.0170,11.7340,"Sachsen-Anhalt"],
["Zerbst/Anhalt",51.9660,12.0890,"Sachsen-Anhalt"],
["Schwerin",53.6300,11.4130,"Mecklenburg-Vorpommern"],
["Rostock",54.0880,12.1400,"Mecklenburg-Vorpommern"],
["Neubrandenburg",53.5580,13.2610,"Mecklenburg-Vorpommern"],
["Neustrelitz",53.3600,13.0700,"Mecklenburg-Vorpommern"],
["Waren (Müritz)",53.5180,12.6800,"Mecklenburg-Vorpommern"],
["Greifswald",54.0930,13.3870,"Mecklenburg-Vorpommern"],
["Stralsund",54.3090,13.0820,"Mecklenburg-Vorpommern"],
["Wismar",53.8910,11.4650,"Mecklenburg-Vorpommern"],
["Güstrow",53.7950,12.1760,"Mecklenburg-Vorpommern"],
["Pasewalk",53.5050,13.9880,"Mecklenburg-Vorpommern"],
["Anklam",53.8520,13.6900,"Mecklenburg-Vorpommern"],
["Parchim",53.4270,11.8490,"Mecklenburg-Vorpommern"],
["Ludwigslust",53.3250,11.4970,"Mecklenburg-Vorpommern"],
["Hagenow",53.4280,11.1870,"Mecklenburg-Vorpommern"]
];
function distanzKm(lat1, lng1, lat2, lng2) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (lat2 - lat1) * r, dLng = (lng2 - lng1) * r;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function ermittleStadt(cf) {
  if (!cf) return null;

  // Berlin fortat: altfel cineva din Spandau primeste Falkensee,
  // care e mai aproape decat centrul Berlinului.
  if (cf.region === "Berlin" || cf.regionCode === "BE") {
    return { stadt: "Berlin", land: "Berlin", km: 0 };
  }

  const lat = parseFloat(cf.latitude);
  const lng = parseFloat(cf.longitude);
  if (isNaN(lat) || isNaN(lng)) return null;

  let best = null, bestKm = Infinity;
  for (const s of STAEDTE) {
    const km = distanzKm(lat, lng, s[1], s[2]);
    if (km < bestKm) { bestKm = km; best = s; }
  }
  if (!best || bestKm > MAX_KM) return null;
  return { stadt: best[0], land: best[3], km: Math.round(bestKm * 10) / 10 };
}

export function onRequest(context) {
  let res = null;
  try {
    res = ermittleStadt(context.request.cf);
  } catch (e) {
    res = null;
  }

  const body = res
    ? { stadt: res.stadt, region: res.land, km: res.km, erkannt: true }
    : { stadt: "", region: "", km: null, erkannt: false };

  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
