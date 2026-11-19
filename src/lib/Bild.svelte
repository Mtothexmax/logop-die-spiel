<script lang="ts">
	import { datei } from './saetze';

	let { src, alt, klein = false }: { src: string; alt: string; klein?: boolean } = $props();
	let fehlt = $state(false);

	$effect(() => {
		src;
		fehlt = false;
	});
</script>

<div
	class="relative grid aspect-square w-full place-items-center overflow-hidden bg-white {klein
		? 'rounded-2xl'
		: 'rounded-3xl'}"
>
	{#if fehlt}
		<div class="flex flex-col items-center gap-1 p-3 text-center text-orange-300">
			<span class="material-symbols-rounded {klein ? 'text-4xl' : 'text-7xl'}">image</span>
			{#if !klein}<span class="text-sm font-semibold text-stone-400">Bild folgt</span>{/if}
		</div>
	{:else}
		<img
			src={datei(src)}
			{alt}
			class="h-full w-full object-cover"
			draggable="false"
			loading={klein ? 'lazy' : 'eager'}
			onerror={() => (fehlt = true)}
		/>
	{/if}
</div>
