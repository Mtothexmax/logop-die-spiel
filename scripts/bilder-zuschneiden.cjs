// Zerlegt die 2x2-Bildtafeln in Einzelbilder ohne Beschriftung.
// Aufruf: node scripts/bilder-zuschneiden.cjs <ordner-mit-tafeln>
// Ergebnis: static/bilder/<id>-kurz.webp und <id>-lang.webp (quadratisch, 768 px)
const sharp = require('sharp');
const path = require('path');

const ordner = process.argv[2];
if (!ordner) throw new Error('Ordner mit den Tafeln angeben');

// Tafel -> Satz-IDs je Zeile, und je Zelle [oben-links, oben-rechts, unten-links, unten-rechts]
// wo Text steht: 'o' = oben, 'u' = unten, 'ou' = beides. null = Zeile auslassen.
const tafeln = [
	['6540f2cd-image.jpg', ['papa-saegt', 'frosch-springt'], ['u', 'u', 'u', 'u']],
	['62bfb965-image.jpg', ['sonja-malt', 'papa-raucht'], ['o', 'o', 'u', 'u']],
	['dc270bfb-image.jpg', ['apfel-schmeckt', 'timo-faehrt'], ['u', 'u', 'u', 'u']],
	['2905a9be-image.jpg', ['hasso-frisst', 'sonja-singt'], ['u', 'u', 'u', 'u']],
	['34d75ede-image.jpg', ['fisch-stinkt', 'haus-brennt'], ['u', 'u', 'u', 'u']],
	['8c4b6268-image.jpg', ['timo-kocht', 'oma-naeht'], ['u', 'u', 'u', 'u']],
	// "Sonja spielt" gibt es zweimal; genommen wird die blonde Sonja aus der letzten Tafel
	['bf06d86d-image.jpg', ['timo-schlaeft', null], ['u', 'u', 'u', 'u']],
	['c2a70ff4-image.jpg', ['sonja-spielt', 'opa-angelt'], ['o', 'ou', 'u', 'u']]
];

const GROESSE = 768;

/** Findet die Rasterlinie: dunkelste Zeile/Spalte im mittleren Bereich. */
function rasterlinie(px, w, h, ch, vertikal) {
	const n = vertikal ? w : h;
	let best = 0, bestWert = Infinity;
	for (let i = Math.floor(n * 0.4); i < n * 0.6; i++) {
		let summe = 0;
		const m = vertikal ? h : w;
		for (let j = 0; j < m; j++) {
			const x = vertikal ? i : j, y = vertikal ? j : i;
			summe += px[(y * w + x) * ch];
		}
		if (summe < bestWert) (bestWert = summe), (best = i);
	}
	return best;
}

/** Ob eine Zeile der Zelle "Tinte" enthält. */
function zeilenTinte(px, w, ch, x0, x1, y) {
	let n = 0;
	for (let x = x0; x < x1; x++) {
		const i = (y * w + x) * ch;
		if (px[i] < 215 || px[i + 1] < 215 || px[i + 2] < 215) n++;
	}
	return n > 2;
}

/**
 * Text abschneiden: Von der Textseite her werden die Tintenblöcke (Zeilenbereiche mit Inhalt)
 * gesammelt. Textzeilen sind etwa gleich hoch wie die erste Zeile; der erste deutlich höhere
 * Block ist die Zeichnung. Geschnitten wird mitten in der Lücke davor.
 */
function textGrenze(px, w, ch, x0, x1, y0, y1, seite) {
	const ys = [];
	for (let y = y0; y < y1; y++) ys.push(y);
	if (seite === 'u') ys.reverse();
	const bloecke = []; // [start, ende] in Richtung vom Rand weg
	let start = -1, leer = 0;
	for (let k = 0; k < ys.length; k++) {
		const tinte = zeilenTinte(px, w, ch, x0, x1, ys[k]);
		if (tinte) {
			if (start < 0) start = k;
			leer = 0;
		} else if (start >= 0 && ++leer >= 4) {
			bloecke.push([start, k - leer]);
			start = -1;
		}
	}
	if (start >= 0) bloecke.push([start, ys.length - 1]);
	const zeilenHoehe = bloecke[0][1] - bloecke[0][0];
	let i = 1;
	while (
		i < bloecke.length &&
		bloecke[i][1] - bloecke[i][0] <= zeilenHoehe * 1.4 &&
		bloecke[i][0] < ys.length * 0.35
	)
		i++;
	const k = i < bloecke.length ? Math.round((bloecke[i - 1][1] + bloecke[i][0]) / 2) : bloecke[0][1];
	return ys[k];
}

(async () => {
	for (const [datei, ids, seiten] of tafeln) {
		const quelle = path.join(ordner, datei);
		const { data: px, info } = await sharp(quelle).removeAlpha().raw().toBuffer({ resolveWithObject: true });
		const { width: w, height: h, channels: ch } = info;
		const mx = rasterlinie(px, w, h, ch, true);
		const my = rasterlinie(px, w, h, ch, false);
		const rand = 30; // Abstand zu Rasterlinien und Außenrahmen
		const zellen = [
			[rand, mx - rand, rand, my - rand],
			[mx + rand, w - rand, rand, my - rand],
			[rand, mx - rand, my + rand, h - rand],
			[mx + rand, w - rand, my + rand, h - rand]
		];
		for (let zeile = 0; zeile < 2; zeile++) {
			const id = ids[zeile];
			if (!id) continue;
			// 1. Beide Zellen ohne Beschriftung, 2. Inhaltsrahmen je Zelle bestimmen
			const teile = [];
			for (const z of [zeile * 2, zeile * 2 + 1]) {
				const [x0, x1, y0, y1] = zellen[z];
				let top = y0, bottom = y1;
				if (seiten[z].includes('o')) top = textGrenze(px, w, ch, x0, x1, top, bottom, 'o');
				if (seiten[z].includes('u')) bottom = textGrenze(px, w, ch, x0, x1, top, bottom, 'u');
				const zelle = await sharp(quelle).extract({ left: x0, top, width: x1 - x0, height: bottom - top }).toBuffer();
				const t = await sharp(zelle).trim({ background: '#ffffff', threshold: 30 }).toBuffer({ resolveWithObject: true });
				const l = -(t.info.trimOffsetLeft ?? 0), o = -(t.info.trimOffsetTop ?? 0);
				teile.push({ zelle, b: x1 - x0, hoehe: bottom - top, box: [l, o, l + t.info.width, o + t.info.height] });
			}
			// 3. Gemeinsamer Rahmen für kurz und lang: Motive werden groß, bleiben aber vergleichbar
			const b = Math.min(...teile.map((t) => t.b)), hoehe = Math.min(...teile.map((t) => t.hoehe));
			const l = Math.min(...teile.map((t) => t.box[0])), o = Math.min(...teile.map((t) => t.box[1]));
			const r = Math.min(b, Math.max(...teile.map((t) => t.box[2])));
			const u = Math.min(hoehe, Math.max(...teile.map((t) => t.box[3])));
			for (let k = 0; k < 2; k++) {
				const ausschnitt = await sharp(teile[k].zelle).extract({ left: l, top: o, width: r - l, height: u - o }).toBuffer();
				const seiteMax = Math.max(r - l, u - o);
				const pad = Math.round(seiteMax * 0.05);
				const ziel = `static/bilder/${id}-${k === 0 ? 'kurz' : 'lang'}.webp`;
				await sharp(ausschnitt)
					.resize({ width: seiteMax, height: seiteMax, fit: 'contain', background: '#ffffff' })
					.extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#ffffff' })
					.resize(GROESSE, GROESSE)
					.webp({ quality: 82 })
					.toFile(ziel);
				console.log(ziel, `${r - l}x${u - o}`);
			}
		}
	}
})();
