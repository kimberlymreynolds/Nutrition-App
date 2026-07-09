# Nutrition Calculator — install as an app

This turns the tracker into a real app with its own icon that opens fullscreen on your iPhone and your Mac/PC.

You have **8 files** — keep them all together in one folder:
`index.html`, `manifest.json`, `service-worker.js`, `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `apple-touch-icon.png`, `favicon.png`

---

## Step 1 — Put the folder online (one time, ~2 minutes, free)

A phone can only "install" an app from a web address, so the folder needs to live at a URL. Easiest free option:

**Netlify Drop**
1. Go to **app.netlify.com/drop** on your computer.
2. Drag the whole folder onto the page.
3. It gives you a link like `https://your-name.netlify.app` — that's your app's address. Bookmark it.

(Alternatives if you prefer: GitHub Pages, Vercel, or Cloudflare Pages — any static host works. The folder just needs to be served over https.)

---

## Step 2 — Install on iPhone
1. Open your link in **Safari** (must be Safari, not Chrome).
2. Tap the **Share** button (square with an up-arrow).
3. Tap **Add to Home Screen** → **Add**.
4. You'll get a **Nutrition** icon on your home screen that opens fullscreen like an app.

## Step 3 — Install on Mac / PC
1. Open your link in **Chrome or Edge**.
2. Look for the **install icon** in the address bar (a little monitor/⊕ symbol), or menu → **Install Nutrition…**
3. It opens in its own window and lands in your Applications / Start menu.

---

## About your data (important)

- Your log is saved **on each device separately** in that device's browser storage. Installed apps keep it reliably.
- **iPhone and desktop do NOT auto-sync.** To move a log between them, use **Copy backup** on the Stack tab, paste it into a note or message to yourself, then **Restore from backup** on the other device.
- Do a **Copy backup** now and then as a safety net — it's the one guaranteed way to never lose your history.
- True cross-device sync would need a small cloud backend; happy to talk through that if you want it later.

---

*This tracker uses general adult-female RDA/AI targets and standard food estimates. It's for your own awareness, not medical advice — confirm anything therapeutic, and your vitamin A/D totals, with your mom's practice and your labs.*
