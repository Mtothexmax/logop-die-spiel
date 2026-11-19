# Satzspiel – Logopädie

Mobiles Spiel zur Satzerweiterung: Das Kind hört zufällig den kurzen („Sonja malt.“) oder den
spezifischen Satz („Sonja malt ein Haus.“) und tippt auf das passende der beiden Bilder
(Reihenfolge zufällig). Die Stimme sagt dann „Richtig!“ oder „Probier's nochmal!“.
Sprachen: Deutsch und Chinesisch (umschaltbar auf der Startseite).

Live: https://mtothexmax.github.io/logop-die-spiel/

## Entwicklung

```bash
npm install
npm run dev
```

## Inhalte

- Sätze: `src/lib/saetze.json` (Typen und Pfade in `src/lib/saetze.ts`)
- Bilder: `static/bilder/<id>-kurz.webp` / `<id>-lang.webp`
  Aus 2×2-Bildtafeln erzeugen: `node scripts/bilder-zuschneiden.cjs <ordner>`
- Sprache (Fish Audio, Modell `s2.1-pro-free`): `static/audio/<de|zh>/<id>-kurz.mp3` / `-lang.mp3`, Rückmeldungen `richtig.mp3` / `nochmal.mp3`.
  Für die fallende Betonung am Satzende tauscht das Skript beim Vorlesen Punkt und Ausrufezeichen.
  Erzeugen: `$env:FISH_API_KEY = "..."; node scripts/audio-erzeugen.mjs` (`--neu` überschreibt, `--sprache zh`, `--nur <id>`)

## Veröffentlichen (GitHub Pages aus `docs/`)

```powershell
.\export.ps1
git add -A; git commit -m "Export"; git push
```
