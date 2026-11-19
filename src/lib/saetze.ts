import { asset } from '$app/paths';

/**
 * Satzpaare: Zu jedem Satz gibt es zwei Bilder. Das "kurz"-Bild zeigt nur die Handlung
 * (Sonja malt), das "lang"-Bild die spezifische Situation (Sonja malt ein Haus).
 * Vorgelesen wird immer nur der spezifische Satz; das Kind sucht das passende Bild.
 *
 * Bilder: static/bilder/<id>-kurz.webp / -lang.webp
 * Audio:  static/audio/<sprache>/<id>.mp3 (erzeugt mit scripts/audio-erzeugen.mjs)
 */
export type Sprache = 'de' | 'zh';
export const sprachen: Sprache[] = ['de', 'zh'];

export type Paar = { id: string; satz: Record<Sprache, string> };

export const paare: Paar[] = [
	{ id: 'sonja-malt', satz: { de: 'Sonja malt ein Haus.', zh: '索尼娅在画一座房子。' } },
	{ id: 'papa-raucht', satz: { de: 'Es raucht.', zh: '冒烟了。' } },
	{ id: 'papa-saegt', satz: { de: 'Papa sägt in der Garage.', zh: '爸爸在车库里锯木头。' } },
	{ id: 'frosch-springt', satz: { de: 'Der Frosch springt hoch.', zh: '青蛙跳得很高。' } },
	{ id: 'timo-kocht', satz: { de: 'Timo kocht Fisch.', zh: '蒂莫在煮鱼。' } },
	{ id: 'oma-naeht', satz: { de: 'Oma näht eine Hose.', zh: '奶奶在缝裤子。' } },
	{ id: 'fisch-stinkt', satz: { de: 'Es stinkt.', zh: '好臭啊。' } },
	{ id: 'haus-brennt', satz: { de: 'Es brennt.', zh: '着火了。' } },
	{ id: 'timo-schlaeft', satz: { de: 'Timo schläft im Bett.', zh: '蒂莫在床上睡觉。' } },
	{ id: 'sonja-spielt', satz: { de: 'Sonja spielt hinter dem Haus.', zh: '索尼娅在房子后面玩。' } },
	{ id: 'opa-angelt', satz: { de: 'Opa angelt im See.', zh: '爷爷在湖里钓鱼。' } },
	{ id: 'hasso-frisst', satz: { de: 'Hasso frisst vor dem Haus.', zh: '哈索在房子前面吃饭。' } },
	{ id: 'sonja-singt', satz: { de: 'Sonja singt laut.', zh: '索尼娅大声唱歌。' } },
	{ id: 'apfel-schmeckt', satz: { de: 'Der Apfel schmeckt sauer.', zh: '苹果很酸。' } },
	{ id: 'timo-faehrt', satz: { de: 'Timo fährt schnell.', zh: '蒂莫骑车骑得很快。' } }
];

/** Rückmeldungen der Stimme; gleiche Struktur wie ein Satz, damit das Audio-Skript sie mitnimmt. */
export const rueckmeldungen: Paar[] = [
	{ id: 'richtig', satz: { de: 'Richtig!', zh: '答对了！' } },
	{ id: 'nochmal', satz: { de: "Probier's nochmal!", zh: '再试一次！' } }
];

export const bildKurz = (p: Paar) => `bilder/${p.id}-kurz.webp`;
export const bildLang = (p: Paar) => `bilder/${p.id}-lang.webp`;
export const audioPfad = (id: string, sprache: Sprache) => `audio/${sprache}/${id}.mp3`;

/** Pfad zu einer Datei in static/, auch unter dem GitHub-Pages-Unterpfad. */
export const datei = (pfad: string) => asset(pfad as Parameters<typeof asset>[0]);
