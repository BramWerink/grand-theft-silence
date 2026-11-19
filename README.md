# Grand Theft Silence

Browser extension (Chrome / Edge / Brave, Manifest V3) that hides or blurs
anything mentioning GTA 6, GTA6, GTA-6, GTA VI, GTA six, or Grand Theft Auto 6/VI/six.

<p align="center">
  <img src="screenshots/popup.png" alt="Grand Theft Silence popup with an on/off switch and Hide / Blur options" width="290">
</p>

## Install (unpacked)
1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this folder.
4. Pin the extension from the puzzle-piece menu to keep the popup one click away.

## Use
Click the extension icon to:
- turn the filter on or off
- choose **Hide** (removes matches) or **Blur** (blurs matches, hover to peek)

## Customise
- Edit `PATTERN` in `content.js` to change what is matched.
- Edit `CONTAINERS` in `content.js` to control how much is hidden around a match.
