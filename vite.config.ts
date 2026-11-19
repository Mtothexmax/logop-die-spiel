import tailwindcss from '@tailwindcss/vite';
import adapterAuto from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

/**
 * Static export (export.ps1 sets EXPORT_BASE_PATH, e.g. "/logop-die-spiel" for GitHub Pages):
 * adapter-static with 404.html as the SPA fallback, the app under that sub path. Without the
 * variable everything stays as in normal development (adapter-auto, no sub path).
 */
const exportBase = (globalThis as { process?: { env: Record<string, string | undefined> } }).process
	?.env.EXPORT_BASE_PATH;
const isExport = exportBase !== undefined;

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: isExport
				? adapterStatic({
						pages: 'build',
						assets: 'build',
						fallback: '404.html',
						precompress: false,
						strict: false
					})
				: adapterAuto(),
			paths: { base: (exportBase ?? '').replace(/\/$/, '') as '' | `/${string}` }
		})
	]
});
