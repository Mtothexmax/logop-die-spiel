import { asset } from '$app/paths';
import daten from './saetze.json';

/**
 * Satzpaare: ein kurzer Satz (Sonja malt.) und ein spezifischer Satz (Sonja malt ein Haus.),
 * jeweils mit eigenem Bild. Im Spiel wird zufällig einer der beiden vorgelesen.
 * Die Texte stehen in saetze.json (auch vom Audio-Skript gelesen).
 *
 * Bilder: static/bilder/<id>-kurz.webp / -lang.webp
 * Audio:  static/audio/<sprache>/<id>-kurz.mp3 / -lang.mp3, Rückmeldungen <sprache>/richtig.mp3 …
 */
export type Sprache = 'de' | 'zh';
export const sprachen: Sprache[] = ['de', 'zh'];

export type Text = Record<Sprache, string>;
export type Art = 'kurz' | 'lang';
export type Paar = { id: string; kurz: Text; lang: Text };

export const paare: Paar[] = daten.paare;
export const rueckmeldungen: Record<'richtig' | 'nochmal', Text> = daten.rueckmeldungen;

export const bildPfad = (p: Paar, art: Art) => `bilder/${p.id}-${art}.webp`;
export const satzAudio = (p: Paar, art: Art, sprache: Sprache) => `audio/${sprache}/${p.id}-${art}.mp3`;
export const audioPfad = (id: string, sprache: Sprache) => `audio/${sprache}/${id}.mp3`;

/** Pfad zu einer Datei in static/, auch unter dem GitHub-Pages-Unterpfad. */
export const datei = (pfad: string) => asset(pfad as Parameters<typeof asset>[0]);
