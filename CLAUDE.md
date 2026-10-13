# Maisterdach site — Claude Code workflow

Static site (HTML/CSS/JS, no build step) deployed on Cloudflare Pages. `_headers` and `_redirects` are Cloudflare config.

## Model roles

- **Main session (Sonnet, set in `.claude/settings.json`)** plans, decides and writes all code.
- **`explorer` / `researcher` subagents (Haiku)** do the reading: finding where things are in the pages, looking up docs. Run several in parallel when the questions are independent. Use them instead of reading many large HTML files into the main context.
- **`advisor` subagent (Opus)** is on call, not in the loop. Call it only:
  1. before executing a plan that touches more than one or two files,
  2. when the same error or failed attempt happens a second time,
  3. before saying a multi-file change is done (give it the summary; it reads `git diff`).
  Never call it for routine single edits. It never writes code — apply its advice yourself.

Plan on high effort, delegate the reading, keep Opus for decisions.

## Site conventions

- Service pages (`dachreparatur.html`, `flachdach.html`, `blechdach.html`, …) share one structure: a change to a shared block usually has to be repeated on every service page and `index.html`.
- A new page also needs a `sitemap.xml` entry and, usually, a card on `index.html`.
- Images are cached for a year (`_headers`): when replacing an image, use a new file name.
