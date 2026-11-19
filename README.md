# Satzspiel – Logopädie

Mobiles Spiel zur Satzerweiterung: Das Kind hört einen Satz („Sonja malt ein Haus.“) und tippt
auf das passende Bild. Zur Auswahl stehen immer das Bild zum kurzen Satz („Sonja malt“) und das
Bild zum langen Satz. Die Stimme sagt dann „Richtig!“ oder „Probier's nochmal!“.

Live: https://mtothexmax.github.io/logop-die-spiel/

## Entwicklung

```bash
npm install
npm run dev
```

## Inhalte

- Sätze: `src/lib/saetze.ts`
- Bilder: `static/bilder/<id>-kurz.webp` / `<id>-lang.webp`
  Aus 2×2-Bildtafeln erzeugen: `node scripts/bilder-zuschneiden.cjs <ordner>`
- Sprache (Fish Audio, Modell `s2.1-pro-free`): `static/audio/*.mp3`
  Neu erzeugen: `$env:FISH_API_KEY = "..."; node scripts/audio-erzeugen.mjs` (`--neu` überschreibt)

## Veröffentlichen (GitHub Pages aus `docs/`)

```powershell
.\export.ps1
git add -A; git commit -m "Export"; git push
```
