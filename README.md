# Nutrition

A ketogenic / Epi-Paleo nutrition tracker built as an installable PWA. Log foods, drinks, and
supplements per day; see running totals against RDA/AI targets with upper-limit warnings; track a
net-carb keto status, a sodium:potassium readout, and a daily mood/energy check-in; browse history
on a calendar with weekly averages.

## Stack

- React 18 + Vite 6
- `vite-plugin-pwa` for offline install (manifest + service worker generated at build)
- No backend — all data is saved locally in the browser (`localStorage`), with manual
  Copy/Restore backup on the Stack tab.
- Design: "Clinical Calm" — teal-blue primary, calm status colors, Libre Franklin + Inter.

## Run it

```bash
npm install
npm run dev      # dev server on 0.0.0.0:5173
```

Build for production / preview:

```bash
npm run build    # outputs to dist/
npm run preview  # serves the built app on 0.0.0.0:4173
```

On Replit: import from GitHub, then Run. The dev server binds `0.0.0.0` and allows any host, so
Replit's preview proxy works out of the box.

## Where things live

- `src/data.js` — nutrient definitions (`N`), food library (`LIB`, 60 items), supplement stack (`STACK`).
- `src/logic.js` — dates, `computeTotals`, status logic, keto + sodium:potassium calculations.
- `src/store.js` — app state, persistence, and all actions (same `localStorage` key as v1, so existing logs carry over).
- `src/App.jsx` + `src/components/` — the UI: Day, Food, Stack, Week, and Calendar tabs.

## Install on your phone

Once it's deployed (e.g. Replit's published URL), open that link in Safari (iPhone) or Chrome/Edge
(desktop) and use "Add to Home Screen" / "Install" to get the app icon. Your log lives on each device
separately — use Copy backup on the Stack tab to move it between devices.

*General adult-female RDA/AI targets and standard food estimates. For personal awareness, not medical
advice — confirm anything therapeutic, and your vitamin A/D totals, with your mom's practice and your labs.*
