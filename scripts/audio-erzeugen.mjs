// Erzeugt die Sprachaufnahmen mit Fish Audio (Modell s2.1-pro-free, kostenlos).
// Aufruf (PowerShell):  $env:FISH_API_KEY = "sk-fish-..."; node scripts/audio-erzeugen.mjs
// Optionen: --neu  (vorhandene Dateien überschreiben)   --sprache de|zh   --nur <id>
// Der API-Key wird nur aus der Umgebung gelesen und nie ins Repo geschrieben.
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.FISH_API_KEY;
if (!KEY) throw new Error('FISH_API_KEY ist nicht gesetzt');

const MODELL = 's2.1-pro-free';
const STIMMEN = {
	de: '88b18e0d81474a0ca08e2ea6f9df5ff4', // "Christa deutsch"
	zh: '5c353fdb312f4888836a9a5680099ef0' // "女大学生"
};

const arg = (name) => {
	const i = process.argv.indexOf(name);
	return i > 0 ? process.argv[i + 1] : null;
};
const neu = process.argv.includes('--neu');
const nurSprache = arg('--sprache');
const nurId = arg('--nur');

// Texte aus src/lib/saetze.json lesen (eine Quelle für App und Audio)
const daten = JSON.parse(fs.readFileSync('src/lib/saetze.json', 'utf8'));
const eintraege = [
	...daten.paare.flatMap((p) => [
		{ id: `${p.id}-kurz`, ...p.kurz },
		{ id: `${p.id}-lang`, ...p.lang }
	]),
	...Object.entries(daten.rueckmeldungen).map(([id, t]) => ({ id, ...t }))
];

// Betonung am Satzende nach unten: Punkt wird für die Stimme zum Ausrufezeichen,
// Ausrufezeichen zum Punkt (der angezeigte Text bleibt unverändert).
// Ausnahme "richtig": soll freudig klingen, bleibt mit Ausrufezeichen.
const tausch = { '.': '!', '!': '.', '。': '！', '！': '。' };
const sprechText = (t, id) => (id === 'richtig' ? t : t.replace(/[.!。！]$/, (z) => tausch[z]));

for (const sprache of Object.keys(STIMMEN)) {
	if (nurSprache && sprache !== nurSprache) continue;
	const ordner = path.join('static/audio', sprache);
	fs.mkdirSync(ordner, { recursive: true });
	for (const e of eintraege) {
		if (nurId && e.id !== nurId) continue;
		const datei = path.join(ordner, `${e.id}.mp3`);
		if (!neu && fs.existsSync(datei)) {
			console.log('vorhanden', datei);
			continue;
		}
		const antwort = await fetch('https://api.fish.audio/v1/tts', {
			method: 'POST',
			headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', model: MODELL },
			body: JSON.stringify({
				text: sprechText(e[sprache], e.id),
				reference_id: STIMMEN[sprache],
				format: 'mp3',
				mp3_bitrate: 128,
				normalize: true,
				latency: 'normal',
				prosody: { speed: 0.9 }
			})
		});
		if (!antwort.ok) throw new Error(`${datei}: ${antwort.status} ${await antwort.text()}`);
		fs.writeFileSync(datei, Buffer.from(await antwort.arrayBuffer()));
		console.log('erzeugt  ', datei, `"${sprechText(e[sprache], e.id)}"`);
	}
}
