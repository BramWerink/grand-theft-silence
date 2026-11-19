# Grand Theft Silence

Browser extension (Chrome / Edge / Brave, Manifest V3) that hides anything mentioning
GTA 6, GTA6, GTA-6, GTA VI, GTA six, or Grand Theft Auto 6/VI/six.

## Install (unpacked)
1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this folder.

## Use
Click the extension icon (pin it from the puzzle-piece menu) to:
- turn it on or off
- choose **Hide** (removes matches) or **Blur** (blurs matches, hover to peek)

Changes apply instantly on open tabs. No reload needed.

## How it works
`content.js` scans text (and `aria-label`/`title`/`alt` attributes), finds matches,
and hides the nearest card-like container (YouTube video, Reddit post, tweet,
article, list item). A MutationObserver handles content loaded later.

## Tweak
- Edit `PATTERN` in `content.js` to change what is matched.
- Edit `CONTAINERS` to control how much gets hidden around a match.
