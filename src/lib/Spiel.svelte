<script lang="ts">
	import { paare, rueckmeldungen, bildKurz, bildLang, audioPfad, type Paar } from './saetze';
	import { einstellung, t } from './sprache.svelte';
	import { sprich, stopp, ton } from './audio';
	import Bild from './Bild.svelte';

	let { zurueck }: { zurueck: () => void } = $props();

	/**
	 * Ablauf: Alle Satzpaare kommen in zufälliger Reihenfolge. Beide Bilder stehen zufällig
	 * oben/unten (Querformat: links/rechts). Vorgelesen wird nur der spezifische Satz; das Kind
	 * tippt das passende Bild an. Die Stimme sagt "Richtig!" oder "Probier's nochmal!".
	 */
	type Option = { bild: string; richtig: boolean };
	type Runde = { paar: Paar; optionen: Option[] };

	function mischen<T>(a: T[]): T[] {
		const b = [...a];
		for (let i = b.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[b[i], b[j]] = [b[j], b[i]];
		}
		return b;
	}

	function neueRunden(): Runde[] {
		return mischen(paare).map((paar) => ({
			paar,
			optionen: mischen([
				{ bild: bildLang(paar), richtig: true },
				{ bild: bildKurz(paar), richtig: false }
			])
		}));
	}

	let runden = $state.raw(neueRunden());
	let nr = $state(0);
	let punkte = $state(0);
	let geloest = $state(false);
	let falsch = $state<string | null>(null);
	let fertig = $state(false);
	let spricht = $state(false);
	let gesperrt = false;
	let ersterVersuch = true;

	const runde = $derived(runden[nr]);
	const sprache = $derived(einstellung.sprache);
	const satz = $derived(runde.paar.satz[sprache]);

	function sage(id: string, text: string) {
		return sprich(audioPfad(id, sprache), text, sprache);
	}

	async function anhoeren() {
		spricht = true;
		await sage(runde.paar.id, satz);
		spricht = false;
	}

	$effect(() => {
		if (!fertig) {
			runde;
			anhoeren();
		}
		return stopp;
	});

	const [richtig, nochmal] = rueckmeldungen;

	async function waehle(o: Option) {
		if (geloest || gesperrt) return;
		gesperrt = true;
		spricht = false;
		if (o.richtig) {
			geloest = true;
			if (ersterVersuch) punkte++;
			ton(true);
			await sage(richtig.id, richtig.satz[sprache]);
			await new Promise((r) => setTimeout(r, 900));
			gesperrt = false;
			naechste();
		} else {
			ersterVersuch = false;
			falsch = o.bild;
			ton(false);
			await sage(nochmal.id, nochmal.satz[sprache]);
			falsch = null;
			gesperrt = false;
			anhoeren();
		}
	}

	function naechste() {
		geloest = false;
		ersterVersuch = true;
		if (nr < runden.length - 1) nr++;
		else fertig = true;
	}

	function nochmalSpielen() {
		runden = neueRunden();
		nr = 0;
		punkte = 0;
		fertig = false;
	}
</script>

<div class="flex h-dvh flex-col gap-3 pt-safe pb-safe px-safe">
	<header class="flex shrink-0 items-center gap-3">
		<button
			class="press grid size-12 shrink-0 place-items-center rounded-full bg-white text-stone-600 shadow-sm"
			onclick={zurueck}
			aria-label={t().zurueck}
		>
			<span class="material-symbols-rounded text-3xl">close</span>
		</button>
		<div class="h-3 flex-1 overflow-hidden rounded-full bg-orange-100">
			<div
				class="h-full rounded-full bg-brand transition-all duration-500"
				style="width: {((nr + (geloest || fertig ? 1 : 0)) / runden.length) * 100}%"
			></div>
		</div>
		<span class="flex w-14 items-center justify-end gap-0.5 text-lg font-extrabold text-amber-500 tabular-nums">
			<span class="material-symbols-rounded text-2xl">star</span>{punkte}
		</span>
	</header>

	{#if fertig}
		<main class="pop flex flex-1 flex-col items-center justify-center gap-6 text-center">
			<span class="material-symbols-rounded text-9xl text-amber-400">
				{punkte >= runden.length * 0.8 ? 'emoji_events' : 'thumb_up'}
			</span>
			<h2 class="text-4xl font-black">{punkte >= runden.length * 0.8 ? t().super : t().gut}</h2>
			<p class="text-xl font-bold text-stone-500">{t().sterne(punkte, runden.length)}</p>
			<div class="flex w-full max-w-sm flex-col gap-3">
				<button
					class="press flex h-16 items-center justify-center gap-2 rounded-2xl bg-brand text-xl font-extrabold text-white shadow-md shadow-orange-300"
					onclick={nochmalSpielen}
				>
					<span class="material-symbols-rounded text-3xl">replay</span>
					{t().nochmalSpielen}
				</button>
				<button class="press h-14 rounded-2xl bg-white text-lg font-bold text-stone-600 shadow-sm" onclick={zurueck}>
					{t().uebersicht}
				</button>
			</div>
		</main>
	{:else}
		<!-- Lautsprecher + Rückmeldung -->
		<div class="flex shrink-0 items-center justify-center gap-4">
			<button
				class="press grid size-16 shrink-0 place-items-center rounded-full bg-sky text-white shadow-lg shadow-sky-200"
				onclick={anhoeren}
				aria-label={t().anhoeren}
			>
				<span class="material-symbols-rounded text-5xl {spricht ? 'animate-pulse' : ''}">volume_up</span>
			</button>
			{#if geloest}
				<span class="pop flex min-w-0 items-center gap-1.5 text-xl leading-tight font-extrabold text-green-600">
					<span class="material-symbols-rounded shrink-0 text-3xl">check_circle</span>{satz}
				</span>
			{:else if falsch}
				<span class="pop text-xl font-extrabold text-red-500">{nochmal.satz[sprache]}</span>
			{/if}
		</div>

		<!-- Bilder: hochkant oben/unten, quer nebeneinander; jedes so groß wie möglich -->
		{#key nr}
			<main class="pop flex min-h-0 flex-1 flex-col gap-3 landscape:flex-row">
				{#each runde.optionen as o (o.bild)}
					<div class="flex min-h-0 min-w-0 flex-1 items-center justify-center" style="container-type: size">
						<button
							class="press rounded-[1.75rem] bg-white p-1.5 shadow-md transition-all duration-200
							{geloest && o.richtig ? 'ring-6 ring-green-500' : ''}
							{geloest && !o.richtig ? 'scale-90 opacity-30' : ''}
							{falsch === o.bild ? 'wackeln ring-6 ring-red-400' : ''}"
							style="width: min(100cqw, 100cqh); height: min(100cqw, 100cqh)"
							onclick={() => waehle(o)}
							aria-label={t().bildWaehlen}
						>
							<Bild src={o.bild} alt="" />
						</button>
					</div>
				{/each}
			</main>
		{/key}
	{/if}
</div>
