# Juoksukoulu – Running School

A small web app that takes you from walking to running in one year, with progress tracking.

- **Weeks 1–11** are the original *Juoksuohjelma* (City of Pori sports unit, source KuntoPlus 4/02), copied word for word:
  walk/run intervals that build up to 5 km (week 6) and 10 km (week 11).
- **Weeks 12–52** continue with the same gradual build-up:

| Phase | Weeks | Focus | Peak |
|---|---|---|---|
| 1 | 1–11 | From walking to running | 10 km |
| 2 | 12–16 | Making running a habit (4 runs + strength) | 60 min long run |
| 3 | 17–20 | Speed and hills | 5 km test (wk 20) |
| 4 | 21–24 | 10 km time trial | 10 km time trial (wk 24) |
| 5 | 25–28 | Recovery and variety | – |
| 6 | 29–42 | Half marathon (long run 12 → 19 km) | 21.1 km (wk 42) |
| 7 | 43–44 | Recovery | – |
| 8 | 45–52 | Speed block and 5 km best | 5 km time trial + 10 km year-end run |

Every 4th week is a lighter (cut-back) week, and the long run grows by no more than about 10 % a week.

The program doesn't depend on season, weather or a race calendar. You can start it on any day: day 1 is the start
date and every program week runs day 1–7 from there. Every session works on a treadmill or outside. In weeks 1–11 the
original wording is kept; only "turn around … home" is shortened to "back" (e.g. "Juokse 5 km ja vielä 5 min.
Kävele takaisin."). The goals are time trials you run yourself, not races on fixed dates.
`tools/check-program.js` fails if season-, weather-, route- or race-specific wording slips back in.
The whole year as a printable table is in [`PROGRAM.md`](PROGRAM.md), in Finnish.

## The app

- **Today:** today's workout, buttons for done or skipped, a note field (distance, time, how it felt), and the rest of the week.
- **Plan:** all 52 weeks laid out like the original table. The colored stripe on each day shows the workout type.
  Tap the circle to mark a day done (it turns green with a ✓). Tap the text to see details, mark the day skipped, or add a note.
  Past days that were never marked get a dashed amber circle.
- **Progress:** workouts done, how much of the plan is done so far, streak of full weeks, week heatmap, milestones and phases.
- **Settings:** start date (any day), or "I am currently on week N"; a button to mark all earlier days as done (useful if you
  already followed the paper version); JSON backup export and import; Finnish/English.

Data is stored in the browser's `localStorage`. The app has no backend, no build step and no dependencies. It works
offline and can be installed on a phone's home screen (PWA).

## Running it

Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000   # http://localhost:8000
```

### GitHub Pages

`.github/workflows/pages.yml` checks the program data and publishes the app on every push to the default branch
(pushes to other branches only run the checks). One-time setup: **Settings → Pages → Build and deployment →
Source: GitHub Actions**. Then re-run the workflow (Actions → *Deploy to GitHub Pages* → *Run workflow*).
The app will be at `https://embedeon.github.io/running-academy/`.

Pages for a private repository needs a paid GitHub plan, and the published site is public either way.
Your training log is not affected: it stays in each visitor's own browser.

## Editing the program

The program lives in [`js/program.js`](js/program.js). Each day has a type (`rest | walk | run | speed | long | cross | goal`)
and Finnish and English text. After editing:

```sh
node tools/check-program.js      # checks for 52 weeks × 7 days, valid types and phases
node tools/build-program-md.js   # rebuilds PROGRAM.md
```
