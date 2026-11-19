<script lang="ts">
	import { paare } from './saetze';
	import { sprich, stopp } from './audio';
	import Bild from './Bild.svelte';

	let { start = 0, zurueck }: { start?: number; zurueck: () => void } = $props();

	// svelte-ignore state_referenced_locally
	let index = $state(start);
	let lang = $state(false);
	let spricht = $state(false);

	const paar = $derived(paare[index]);
	const satz = $derived(lang ? paar.lang : paar.kurz);

	async function abspielen() {
		spricht = true;
		await sprich(satz.audio, satz.text);
		spricht = false;
	}

	$effect(() => {
		satz;
		abspielen();
		return stopp;
	});

	function weiter() {
		if (!lang) lang = true;
		else if (index < paare.length - 1) {
			index++;
			lang = false;
		} else zurueck();
	}

	function vorher() {
		if (lang) lang = false;
		else if (index > 0) {
			index--;
			lang = true;
		}
	}

	// Wischen: nach links = weiter, nach rechts = zurück
	let startX = 0;
	let startY = 0;
	function touchStart(e: TouchEvent) {
		startX = e.touches[0].clientX;
		startY = e.touches[0].clientY;
	}
	function touchEnde(e: TouchEvent) {
		const dx = e.changedTouches[0].clientX - startX;
		const dy = e.changedTouches[0].clientY - startY;
		if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) dx < 0 ? weiter() : vorher();
	}

	function taste(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === ' ') weiter();
		else if (e.key === 'ArrowLeft') vorher();
		else if (e.key === 'Escape') zurueck();
	}
</script>

<svelte:window onkeydown={taste} />

<div role="application" class="flex h-dvh flex-col pt-safe pb-safe px-safe" ontouchstart={touchStart} ontouchend={touchEnde}>
	<header class="flex items-center gap-3">
		<button
			class="press grid size-12 place-items-center rounded-full bg-white text-stone-600 shadow-sm"
			onclick={zurueck}
			aria-label="Zurück zur Übersicht"
		>
			<span class="material-symbols-rounded text-3xl">close</span>
		</button>
		<div class="h-3 flex-1 overflow-hidden rounded-full bg-orange-100">
			<div
				class="h-full rounded-full bg-brand transition-all duration-300"
				style="width: {((index * 2 + (lang ? 2 : 1)) / (paare.length * 2)) * 100}%"
			></div>
		</div>
		<span class="w-14 text-right text-sm font-bold text-stone-500 tabular-nums">
			{index + 1}/{paare.length}
		</span>
	</header>

	<main class="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 py-4">
		{#key satz}
			<div class="pop" style="width: min(100%, 28rem, 52dvh)">
				<div class="rounded-[2rem] bg-white p-2 shadow-lg shadow-orange-200/60">
					<Bild src={satz.bild} alt={satz.text} />
				</div>
			</div>
		{/key}

		<div class="flex items-center gap-2">
			<span
				class="rounded-full px-3 py-1 text-xs font-extrabold tracking-wide uppercase {lang
					? 'bg-sky-100 text-sky-700'
					: 'bg-orange-100 text-orange-700'}"
			>
				{lang ? 'Langer Satz' : 'Kurzer Satz'}
			</span>
		</div>

		<button
			class="press flex max-w-md items-center gap-3 rounded-2xl px-2 text-left"
			onclick={abspielen}
			aria-label="Satz nochmal anhören"
		>
			<span
				class="grid size-14 shrink-0 place-items-center rounded-full bg-sky text-white shadow-md {spricht
					? 'animate-pulse'
					: ''}"><span class="material-symbols-rounded text-3xl">volume_up</span></span
			>
			<span class="text-3xl leading-tight font-extrabold text-balance sm:text-4xl">{satz.text}</span>
		</button>
	</main>

	<footer class="flex gap-3">
		<button
			class="press grid h-16 w-20 place-items-center rounded-2xl bg-white text-stone-500 shadow-sm disabled:opacity-30"
			onclick={vorher}
			disabled={index === 0 && !lang}
			aria-label="Zurück"
		>
			<span class="material-symbols-rounded text-4xl">arrow_back</span>
		</button>
		<button
			class="press flex h-16 flex-1 items-center justify-center gap-2 rounded-2xl text-xl font-extrabold text-white shadow-md {lang
				? 'bg-brand shadow-orange-300'
				: 'bg-sky shadow-sky-200'}"
			onclick={weiter}
		>
			{#if !lang}
				Satz verlängern <span class="material-symbols-rounded text-3xl">add_circle</span>
			{:else if index < paare.length - 1}
				Nächster Satz <span class="material-symbols-rounded text-3xl">arrow_forward</span>
			{:else}
				Fertig <span class="material-symbols-rounded text-3xl">celebration</span>
			{/if}
		</button>
	</footer>
</div>
