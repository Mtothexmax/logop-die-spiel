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

// Texte aus src/lib/saetze.ts lesen (eine Quelle für App und Audio)
const quelle = fs.readFileSync('src/lib/saetze.ts', 'utf8');
const eintraege = [...quelle.matchAll(/id: '([a-z-]+)', satz: \{ de: (['"])(.*?)\2, zh: '(.*?)' \}/g)].map(
	(m) => ({ id: m[1], de: m[3], zh: m[4] })
);
if (eintraege.length === 0) throw new Error('Keine Sätze in src/lib/saetze.ts gefunden');

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
				text: e[sprache],
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
		console.log('erzeugt  ', datei, `"${e[sprache]}"`);
	}
}
