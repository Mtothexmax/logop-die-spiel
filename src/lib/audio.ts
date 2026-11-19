import { datei } from './saetze';

let aktuell: HTMLAudioElement | null = null;
/** Beendet das laufende sprich()-Versprechen, damit wartender Code nie hängen bleibt. */
let abbrechen: (() => void) | null = null;

/** Spielt die Aufnahme eines Satzes ab; fehlt sie, liest der Browser den Text vor. */
export function sprich(audioPfad: string, text: string): Promise<void> {
	stopp();
	return new Promise((aufloesen) => {
		const fertig = () => {
			if (abbrechen === fertig) abbrechen = null;
			aufloesen();
		};
		abbrechen = fertig;
		const el = new Audio(datei(audioPfad));
		aktuell = el;
		let ersatz = false;
		// Datei fehlt: Browserstimme als Ersatz (nur einmal, auch wenn error und play() beide melden)
		const fehler = () => {
			if (ersatz || aktuell !== el) return fertig();
			ersatz = true;
			vorlesen(text).then(fertig);
		};
		el.onended = () => fertig();
		el.onerror = fehler;
		el.play().catch((e: DOMException) => {
			// NotAllowedError = Autoplay blockiert: dann still bleiben, der Lautsprecher-Knopf hilft
			if (e?.name === 'NotAllowedError') fertig();
			else fehler();
		});
	});
}

export function stopp() {
	if (aktuell) {
		aktuell.onended = aktuell.onerror = null;
		aktuell.pause();
		aktuell = null;
	}
	if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
	abbrechen?.();
}

function vorlesen(text: string): Promise<void> {
	return new Promise((fertig) => {
		if (typeof speechSynthesis === 'undefined') return fertig();
		const u = new SpeechSynthesisUtterance(text);
		u.lang = 'de-DE';
		u.rate = 0.85;
		u.onend = u.onerror = () => fertig();
		speechSynthesis.speak(u);
	});
}

/** Kurzes Feedback-Geräusch ohne Audiodatei. */
export function ton(richtig: boolean) {
	try {
		const ctx = new AudioContext();
		const noten = richtig ? [660, 880] : [300, 220];
		noten.forEach((f, i) => {
			const o = ctx.createOscillator();
			const g = ctx.createGain();
			o.type = 'sine';
			o.frequency.value = f;
			const t = ctx.currentTime + i * 0.12;
			g.gain.setValueAtTime(0.0001, t);
			g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
			g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
			o.connect(g).connect(ctx.destination);
			o.start(t);
			o.stop(t + 0.2);
		});
		setTimeout(() => ctx.close(), 600);
	} catch {
		/* kein Web Audio */
	}
	if (navigator.vibrate) navigator.vibrate(richtig ? 30 : [40, 60, 40]);
}
