// Erzeugt die Sprachaufnahmen mit Fish Audio (Modell s2.1-pro-free, kostenlos).
// Aufruf (PowerShell):  $env:FISH_API_KEY = "sk-fish-..."; node scripts/audio-erzeugen.mjs
// Optionen: --neu  (vorhandene Dateien überschreiben)   --nur <id>  (nur Dateien mit dieser ID)
// Der API-Key wird nur aus der Umgebung gelesen und nie ins Repo geschrieben.
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.FISH_API_KEY;
if (!KEY) throw new Error('FISH_API_KEY ist nicht gesetzt');

const MODELL = 's2.1-pro-free';
const STIMME = process.env.FISH_REFERENCE_ID || '88b18e0d81474a0ca08e2ea6f9df5ff4'; // "Christa deutsch"
const ZIEL = 'static/audio';

const neu = process.argv.includes('--neu');
const nurIdx = process.argv.indexOf('--nur');
const nur = nurIdx > 0 ? process.argv[nurIdx + 1] : null;

// Texte aus src/lib/saetze.ts lesen (eine Quelle für App und Audio)
const quelle = fs.readFileSync('src/lib/saetze.ts', 'utf8');
const auftraege = [];
for (const m of quelle.matchAll(/\['([a-z-]+)', '([^']+)', '([^']+)'\]/g)) {
	const [, id, kurz, lang] = m;
	auftraege.push([`${id}-kurz`, kurz.replace(/\.?$/, '.')], [`${id}-lang`, lang]);
}
auftraege.push(['richtig', 'Richtig!'], ['nochmal', "Probier's nochmal!"]);

fs.mkdirSync(ZIEL, { recursive: true });
for (const [name, text] of auftraege) {
	if (nur && !name.includes(nur)) continue;
	const datei = path.join(ZIEL, `${name}.mp3`);
	if (!neu && fs.existsSync(datei)) {
		console.log('vorhanden', datei);
		continue;
	}
	const antwort = await fetch('https://api.fish.audio/v1/tts', {
		method: 'POST',
		headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', model: MODELL },
		body: JSON.stringify({
			text,
			reference_id: STIMME,
			format: 'mp3',
			mp3_bitrate: 128,
			normalize: true,
			latency: 'normal',
			prosody: { speed: 0.9 }
		})
	});
	if (!antwort.ok) throw new Error(`${name}: ${antwort.status} ${await antwort.text()}`);
	fs.writeFileSync(datei, Buffer.from(await antwort.arrayBuffer()));
	console.log('erzeugt  ', datei, `"${text}"`);
}
