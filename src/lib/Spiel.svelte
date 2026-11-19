<script lang="ts">
	import { paare, rueckmeldung, type Paar, type Satz } from './saetze';
	import { sprich, stopp, ton } from './audio';
	import Bild from './Bild.svelte';

	let { zurueck }: { zurueck: () => void } = $props();

	/**
	 * Ablauf: Alle Satzpaare kommen in zufälliger Reihenfolge. Beide Bilder (kurz und lang)
	 * stehen zufällig links/rechts, vorgelesen wird immer der lange, spezifische Satz.
	 * Das Kind tippt das passende Bild an; die Stimme sagt "Richtig!" oder "Probier's nochmal!".
	 */
	type Runde = { paar: Paar; links: Satz; rechts: Satz };

	function mischen<T>(a: T[]): T[] {
		const b = [...a];
		for (let i = b.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[b[i], b[j]] = [b[j], b[i]];
		}
		return b;
	}

	function neueRunden(): Runde[] {
		return mischen(paare).map((paar) =>
			Math.random() < 0.5
				? { paar, links: paar.kurz, rechts: paar.lang }
				: { paar, links: paar.lang, rechts: paar.kurz }
		);
	}

	let runden = $state.raw(neueRunden());
	let nr = $state(0);
	let punkte = $state(0);
	let geloest = $state(false);
	let falsch = $state<Satz | null>(null);
	let fertig = $state(false);
	let spricht = $state(false);
	let gesperrt = $state(false);
	let ersterVersuch = true;

	const runde = $derived(runden[nr]);
	const gesucht = $derived(runde.paar.lang);

	async function anhoeren() {
		spricht = true;
		await sprich(gesucht.audio, gesucht.text);
		spricht = false;
	}

	$effect(() => {
		if (!fertig) {
			gesucht;
			anhoeren();
		}
		return stopp;
	});

	async function waehle(o: Satz) {
		if (geloest || gesperrt) return;
		gesperrt = true;
		spricht = false;
		if (o.bild === gesucht.bild) {
			geloest = true;
			if (ersterVersuch) punkte++;
			ton(true);
			await sprich(rueckmeldung.richtig.audio, rueckmeldung.richtig.text);
			await new Promise((r) => setTimeout(r, 500));
			naechste();
		} else {
			ersterVersuch = false;
			falsch = o;
			ton(false);
			await sprich(rueckmeldung.nochmal.audio, rueckmeldung.nochmal.text);
			falsch = null;
			gesperrt = false;
			anhoeren();
		}
		gesperrt = false;
	}

	function naechste() {
		geloest = false;
		ersterVersuch = true;
		if (nr < runden.length - 1) nr++;
		else fertig = true;
	}

	function nochmal() {
		runden = neueRunden();
		nr = 0;
		punkte = 0;
		fertig = false;
	}
</script>

<div class="flex h-dvh flex-col pt-safe pb-safe px-safe">
	<header class="flex items-center gap-3">
		<button
			class="press grid size-12 shrink-0 place-items-center rounded-full bg-white text-stone-600 shadow-sm"
			onclick={zurueck}
			aria-label="Zurück zur Übersicht"
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
			<h2 class="text-4xl font-black">
				{punkte >= runden.length * 0.8 ? 'Super gemacht!' : 'Gut gemacht!'}
			</h2>
			<p class="text-xl font-bold text-stone-500">{punkte} von {runden.length} Sternen</p>
			<div class="flex w-full max-w-sm flex-col gap-3">
				<button
					class="press flex h-16 items-center justify-center gap-2 rounded-2xl bg-brand text-xl font-extrabold text-white shadow-md shadow-orange-300"
					onclick={nochmal}
				>
					<span class="material-symbols-rounded text-3xl">replay</span> Nochmal spielen
				</button>
				<button
					class="press h-14 rounded-2xl bg-white text-lg font-bold text-stone-600 shadow-sm"
					onclick={zurueck}
				>
					Zur Übersicht
				</button>
			</div>
		</main>
	{:else}
		<main
			class="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 py-4 landscape:flex-row landscape:gap-8"
		>
			<div class="flex flex-col items-center gap-4 landscape:w-64 landscape:shrink-0">
				<button
					class="press grid size-24 place-items-center rounded-full bg-sky text-white shadow-lg shadow-sky-200"
					onclick={anhoeren}
					aria-label="Satz nochmal anhören"
				>
					<span class="material-symbols-rounded text-6xl {spricht ? 'animate-pulse' : ''}">volume_up</span>
				</button>
				<p class="min-h-16 max-w-md text-center text-2xl leading-tight font-extrabold text-balance">
					{#if geloest}
						<span class="pop inline-flex items-center gap-2 text-green-600">
							<span class="material-symbols-rounded text-3xl">check_circle</span>{gesucht.text}
						</span>
					{:else if falsch}
						<span class="pop text-red-500">Probier's nochmal!</span>
					{/if}
				</p>
			</div>

			{#key nr}
				<div class="pop grid w-full max-w-2xl grid-cols-2 gap-3 sm:gap-5">
					{#each [runde.links, runde.rechts] as o (o.bild)}
						<button
							class="press rounded-[1.75rem] bg-white p-1.5 shadow-md transition-all duration-200
							{geloest && o.bild === gesucht.bild ? 'ring-6 ring-green-500' : ''}
							{geloest && o.bild !== gesucht.bild ? 'scale-90 opacity-30' : ''}
							{falsch?.bild === o.bild ? 'wackeln ring-6 ring-red-400' : ''}"
							onclick={() => waehle(o)}
							aria-label="Bild wählen"
						>
							<Bild src={o.bild} alt="" />
						</button>
					{/each}
				</div>
			{/key}
		</main>
	{/if}
</div>
