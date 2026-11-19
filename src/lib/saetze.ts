import { asset } from '$app/paths';

/**
 * Satzpaare: ein kurzer Satz (Subjekt + Verb) und seine Erweiterung.
 * Zu jedem Satz gehören ein Bild (static/bilder/<id>-kurz.webp / -lang.webp)
 * und eine Sprachaufnahme (static/audio/<id>-kurz.mp3 / -lang.mp3).
 */
export type Satz = { text: string; bild: string; audio: string };
export type Paar = { id: string; kurz: Satz; lang: Satz };

const rohdaten: [id: string, kurz: string, lang: string][] = [
	['sonja-malt', 'Sonja malt', 'Sonja malt ein Haus.'],
	['papa-raucht', 'Papa raucht', 'Es raucht.'],
	['papa-saegt', 'Papa sägt', 'Papa sägt in der Garage.'],
	['frosch-springt', 'Der Frosch springt', 'Der Frosch springt hoch.'],
	['timo-kocht', 'Timo kocht', 'Timo kocht Fisch.'],
	['oma-naeht', 'Oma näht', 'Oma näht eine Hose.'],
	['fisch-stinkt', 'Der Fisch stinkt', 'Es stinkt.'],
	['haus-brennt', 'Das Haus brennt', 'Es brennt.'],
	['timo-schlaeft', 'Timo schläft', 'Timo schläft im Bett.'],
	['sonja-spielt', 'Sonja spielt', 'Sonja spielt hinter dem Haus.'],
	['opa-angelt', 'Opa angelt', 'Opa angelt im See.'],
	['hasso-frisst', 'Hasso frisst', 'Hasso frisst vor dem Haus.'],
	['sonja-singt', 'Sonja singt', 'Sonja singt laut.'],
	['apfel-schmeckt', 'Der Apfel schmeckt', 'Der Apfel schmeckt sauer.'],
	['timo-faehrt', 'Timo fährt', 'Timo fährt schnell.']
];

export const paare: Paar[] = rohdaten.map(([id, kurz, lang]) => ({
	id,
	kurz: { text: kurz, bild: `bilder/${id}-kurz.webp`, audio: `audio/${id}-kurz.mp3` },
	lang: { text: lang, bild: `bilder/${id}-lang.webp`, audio: `audio/${id}-lang.mp3` }
}));

/** Pfad zu einer Datei in static/, auch unter dem GitHub-Pages-Unterpfad. */
export const datei = (pfad: string) => asset(pfad as Parameters<typeof asset>[0]);

/** Rückmeldungen der Stimme im Spiel. */
export const rueckmeldung = {
	richtig: { text: 'Richtig!', audio: 'audio/richtig.mp3' },
	nochmal: { text: "Probier's nochmal!", audio: 'audio/nochmal.mp3' }
};
