# Maisterdach site — Claude Code workflow

Static site (HTML/CSS/JS, no build step) deployed on Cloudflare Pages. `_headers` and `_redirects` are Cloudflare config.

## Model roles

- **Main session (`opusplan`, set in `.claude/settings.json`)**: Opus in plan mode, Sonnet when executing. For any task beyond a small edit, start in plan mode (Shift+Tab) so Opus writes the plan; Sonnet then implements it. Switch to `/model opus` for the whole task when the code itself is delicate (`app.js`, `loc-lookup.js`, tracking, structured data).
- **`explorer` / `researcher` subagents (Haiku)** do the reading: finding where things are in the pages, looking up docs. Run several in parallel when the questions are independent. Use them instead of reading many large HTML files into the main context.
- **`advisor` subagent (Opus)** is on call, not in the loop. Call it only:
  1. before executing a multi-file plan that was made without plan mode,
  2. when the same error or failed attempt happens a second time,
  3. before saying a multi-file change is done (give it the original request and a summary; it reads `git diff`).
  Never call it for routine single edits. It never writes code — apply its advice yourself.

Opus plans and reviews, Sonnet writes, Haiku reads.

## Site conventions

- Service pages (`dachreparatur.html`, `flachdach.html`, `blechdach.html`, …) share one structure: a change to a shared block usually has to be repeated on every service page and `index.html`.
- A new page also needs a `sitemap.xml` entry and, usually, a card on `index.html`.
- Images are cached for a year (`_headers`): when replacing an image, use a new file name.
