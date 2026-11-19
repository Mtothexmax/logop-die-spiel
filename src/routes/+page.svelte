<script lang="ts">
	import { paare } from '../lib/saetze';
	import Bild from '../lib/Bild.svelte';
	import Ueben from '../lib/Ueben.svelte';
	import Spiel from '../lib/Spiel.svelte';

	type Ansicht = { art: 'start' } | { art: 'ueben'; start: number } | { art: 'spiel' };
	let ansicht = $state<Ansicht>({ art: 'start' });

	// Zurück-Geste / Zurück-Taste des Handys führt zur Übersicht statt aus der App heraus.
	function oeffne(a: Ansicht) {
		history.pushState({ spiel: true }, '');
		ansicht = a;
	}
	function zurueck() {
		if (history.state?.spiel) history.back();
		else ansicht = { art: 'start' };
	}
</script>

<svelte:window onpopstate={() => (ansicht = { art: 'start' })} />

{#if ansicht.art === 'ueben'}
	<Ueben start={ansicht.start} {zurueck} />
{:else if ansicht.art === 'spiel'}
	<Spiel {zurueck} />
{:else}
	<div class="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 pt-safe pb-safe px-safe">
		<header class="flex items-center gap-3 pt-2">
			<span
				class="grid size-14 place-items-center rounded-2xl bg-brand text-white shadow-md shadow-orange-300"
				><span class="material-symbols-rounded text-4xl">record_voice_over</span></span
			>
			<div>
				<h1 class="text-3xl leading-none font-black">Satzspiel</h1>
				<p class="text-sm font-semibold text-stone-500">Kurze Sätze – lange Sätze</p>
			</div>
		</header>

		<section class="flex flex-col gap-3">
			<button
				class="press flex items-center gap-4 rounded-3xl bg-brand p-5 text-left text-white shadow-lg shadow-orange-300"
				onclick={() => oeffne({ art: 'spiel' })}
			>
				<span class="grid size-16 shrink-0 place-items-center rounded-full bg-white/25">
					<span class="material-symbols-rounded text-5xl">play_arrow</span>
				</span>
				<span>
					<span class="block text-2xl font-black">Spielen</span>
					<span class="text-base font-semibold opacity-90">Hör zu – welches Bild passt?</span>
				</span>
			</button>
			<button
				class="press flex items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm"
				onclick={() => oeffne({ art: 'ueben', start: 0 })}
			>
				<span class="grid size-11 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-600">
					<span class="material-symbols-rounded text-2xl">style</span>
				</span>
				<span>
					<span class="block text-lg font-extrabold">Üben</span>
					<span class="text-sm font-semibold text-stone-500">Alle Bilder anschauen & anhören</span>
				</span>
			</button>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="px-1 text-sm font-extrabold tracking-wide text-stone-400 uppercase">Alle Sätze</h2>
			<ul class="flex flex-col gap-2">
				{#each paare as p, i (p.id)}
					<li>
						<button
							class="press flex w-full items-center gap-3 rounded-2xl bg-white p-2 pr-3 text-left shadow-sm"
							onclick={() => oeffne({ art: 'ueben', start: i })}
						>
							<div class="flex w-28 shrink-0 gap-1">
								<Bild src={p.kurz.bild} alt="" klein />
								<Bild src={p.lang.bild} alt="" klein />
							</div>
							<div class="min-w-0 flex-1">
								<p class="truncate text-lg font-extrabold">{p.kurz.text}</p>
								<p class="truncate text-sm font-semibold text-stone-500">{p.lang.text}</p>
							</div>
							<span class="material-symbols-rounded text-3xl text-stone-300">chevron_right</span>
						</button>
					</li>
				{/each}
			</ul>
		</section>
	</div>
{/if}
