<script lang="ts">
	import { paare, bildPfad, satzAudio, sprachen, type Art } from '../lib/saetze';
	import { einstellung, setzeSprache, t } from '../lib/sprache.svelte';
	import { sprich } from '../lib/audio';
	import Bild from '../lib/Bild.svelte';
	import Spiel from '../lib/Spiel.svelte';

	let spielLaeuft = $state(false);

	$effect(() => {
		document.documentElement.lang = einstellung.sprache === 'zh' ? 'zh-CN' : 'de';
	});

	// Zurück-Geste / Zurück-Taste des Handys führt zur Übersicht statt aus der App heraus.
	function starte() {
		history.pushState({ spiel: true }, '');
		spielLaeuft = true;
	}
	function zurueck() {
		if (history.state?.spiel) history.back();
		else spielLaeuft = false;
	}

	const sprachName = { de: 'Deutsch', zh: '中文' };
	const arten: Art[] = ['kurz', 'lang'];
</script>

<svelte:window onpopstate={() => (spielLaeuft = false)} />

{#if spielLaeuft}
	<Spiel {zurueck} />
{:else}
	<div class="mx-auto flex min-h-dvh max-w-3xl flex-col gap-5 pt-safe pb-safe px-safe">
		<header class="flex items-center gap-3 pt-2">
			<span class="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-md shadow-orange-300">
				<span class="material-symbols-rounded text-4xl">record_voice_over</span>
			</span>
			<div class="min-w-0 flex-1">
				<h1 class="text-3xl leading-none font-black">{t().titel}</h1>
				<p class="text-sm font-semibold text-stone-500">{t().untertitel}</p>
			</div>
		</header>

		<div class="flex rounded-2xl bg-white p-1 shadow-sm" role="radiogroup" aria-label={t().sprache}>
			{#each sprachen as s}
				<button
					role="radio"
					aria-checked={einstellung.sprache === s}
					class="press flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-lg font-extrabold transition-colors {einstellung.sprache ===
					s
						? 'bg-sky text-white shadow-sm'
						: 'text-stone-500'}"
					onclick={() => setzeSprache(s)}
				>
					<span class="material-symbols-rounded text-2xl">translate</span>
					{sprachName[s]}
				</button>
			{/each}
		</div>

		<button
			class="press flex items-center gap-4 rounded-3xl bg-brand p-5 text-left text-white shadow-lg shadow-orange-300"
			onclick={starte}
		>
			<span class="grid size-16 shrink-0 place-items-center rounded-full bg-white/25">
				<span class="material-symbols-rounded text-5xl">play_arrow</span>
			</span>
			<span>
				<span class="block text-2xl font-black">{t().spielen}</span>
				<span class="text-base font-semibold opacity-90">{t().spielenInfo}</span>
			</span>
		</button>

		<section class="flex flex-col gap-3">
			<h2 class="px-1 text-sm font-extrabold tracking-wide text-stone-400 uppercase">{t().alleSaetze}</h2>
			<ul class="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{#each paare as p (p.id)}
					<li class="flex flex-col gap-1 rounded-2xl bg-white p-1.5 shadow-sm">
						{#each arten as art}
							{@const text = p[art][einstellung.sprache]}
							<button
								class="press flex w-full items-center gap-3 rounded-xl p-1 pr-2 text-left"
								onclick={() => sprich(satzAudio(p, art, einstellung.sprache), text, einstellung.sprache)}
								aria-label={t().anhoeren}
							>
								<div class="w-14 shrink-0"><Bild src={bildPfad(p, art)} alt="" klein /></div>
								<p class="min-w-0 flex-1 text-lg leading-tight font-extrabold">{text}</p>
								<span class="material-symbols-rounded text-3xl text-sky-500">volume_up</span>
							</button>
						{/each}
					</li>
				{/each}
			</ul>
		</section>
	</div>
{/if}
