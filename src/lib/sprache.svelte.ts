import type { Sprache } from './saetze';

const SCHLUESSEL = 'satzspiel-sprache';

function gespeichert(): Sprache {
	try {
		const s = localStorage.getItem(SCHLUESSEL);
		if (s === 'de' || s === 'zh') return s;
	} catch {
		/* kein Speicher verfügbar */
	}
	return 'de';
}

/** Aktuelle Sprache (wird im Browser gemerkt). */
export const einstellung = $state({ sprache: gespeichert() });

export function setzeSprache(s: Sprache) {
	einstellung.sprache = s;
	document.documentElement.lang = s === 'zh' ? 'zh-CN' : 'de';
	try {
		localStorage.setItem(SCHLUESSEL, s);
	} catch {
		/* egal */
	}
}

const texte = {
	de: {
		titel: 'Satzspiel',
		untertitel: 'Hör genau hin!',
		spielen: 'Spielen',
		spielenInfo: 'Hör zu – welches Bild passt?',
		alleSaetze: 'Alle Sätze',
		anhoeren: 'Satz anhören',
		zurueck: 'Zurück zur Übersicht',
		bildWaehlen: 'Bild wählen',
		super: 'Super gemacht!',
		gut: 'Gut gemacht!',
		sterne: (p: number, n: number) => `${p} von ${n} Sternen`,
		nochmalSpielen: 'Nochmal spielen',
		uebersicht: 'Zur Übersicht',
		sprache: 'Sprache'
	},
	zh: {
		titel: '句子游戏',
		untertitel: '仔细听！',
		spielen: '开始游戏',
		spielenInfo: '听一听——哪张图对？',
		alleSaetze: '所有句子',
		anhoeren: '听句子',
		zurueck: '返回',
		bildWaehlen: '选择图片',
		super: '太棒了！',
		gut: '做得好！',
		sterne: (p: number, n: number) => `${n} 颗星中得到 ${p} 颗`,
		nochmalSpielen: '再玩一次',
		uebersicht: '返回首页',
		sprache: '语言'
	}
};

export const t = () => texte[einstellung.sprache];
