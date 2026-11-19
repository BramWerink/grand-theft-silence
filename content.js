(() => {
  // Matches: GTA 6, GTA6, GTA-6, GTA VI, GTAVI, GTA six, Grand Theft Auto 6/VI/six, GTA 6's
  const PATTERN =
    /\b(?:gta|grand\s+theft\s+auto)[\s\-_.]*(?:6|vi|six)(?![a-z0-9])/i;

  // Known "card" containers on popular sites, then generic fallbacks.
  const CONTAINERS = [
    // YouTube
    "ytd-rich-item-renderer", "ytd-video-renderer", "ytd-compact-video-renderer",
    "ytd-grid-video-renderer", "ytd-reel-item-renderer", "yt-lockup-view-model",
    "ytd-rich-section-renderer", "ytd-comment-thread-renderer",
    // Reddit
    "shreddit-post", "shreddit-comment", "article",
    // X / Twitter
    '[data-testid="cellInnerDiv"]', '[data-testid="tweet"]',
    // Generic
    '[role="article"]', '[role="listitem"]', "li", "tr",
  ].join(",");

  const ATTRS = ["aria-label", "title", "alt"];
  const HIDDEN_ATTR = "data-no-gta6";

  // Matches are only tagged with an attribute. How they look (hidden or
  // blurred) is decided by CSS keyed on <html data-gts-mode="...">, so
  // switching modes is instant and fully reversible.
  const style = document.createElement("style");
  style.textContent = `
    html[data-gts-mode="hide"] [${HIDDEN_ATTR}] { display: none !important; }
    html[data-gts-mode="blur"] [${HIDDEN_ATTR}] {
      filter: blur(14px) grayscale(1) !important;
      opacity: 0.6 !important;
      transition: filter .15s ease, opacity .15s ease;
    }
    html[data-gts-mode="blur"] [${HIDDEN_ATTR}]:hover {
      filter: none !important;
      opacity: 1 !important;
    }
  `;
  document.documentElement.appendChild(style);

  function setMode(mode) {
    document.documentElement.setAttribute("data-gts-mode", mode === "blur" ? "blur" : "hide");
  }

  function hide(el) {
    if (!el || el === document.body || el === document.documentElement) return;
    el.setAttribute(HIDDEN_ATTR, "1");
  }

  function unhideAll() {
    document.querySelectorAll(`[${HIDDEN_ATTR}]`).forEach((el) => el.removeAttribute(HIDDEN_ATTR));
  }

  function containerFor(node) {
    const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    if (!el) return null;
    const card = el.closest(CONTAINERS);
    if (card && card !== document.body) return card;
    return el;
  }

  function isSkippable(el) {
    if (!el) return true;
    const tag = el.tagName;
    return (
      tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" ||
      tag === "TEXTAREA" || tag === "INPUT" || el.isContentEditable
    );
  }

  function scan(root) {
    if (!root) return;

    if (root.nodeType === Node.TEXT_NODE) {
      if (PATTERN.test(root.nodeValue) && !isSkippable(root.parentElement)) {
        hide(containerFor(root));
      }
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || isSkippable(root)) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) =>
        isSkippable(n.parentElement) || !n.nodeValue || n.nodeValue.length < 4
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT,
    });
    let n;
    while ((n = walker.nextNode())) {
      if (PATTERN.test(n.nodeValue)) hide(containerFor(n));
    }

    // Images, links and buttons that only mention it in an attribute.
    const sel = ATTRS.map((a) => `[${a}]`).join(",");
    const candidates = root.matches?.(sel) ? [root] : [];
    root.querySelectorAll?.(sel).forEach((e) => candidates.push(e));
    for (const e of candidates) {
      if (ATTRS.some((a) => PATTERN.test(e.getAttribute(a) || ""))) {
        hide(containerFor(e));
      }
    }
  }

  // Batch mutations so busy pages (infinite scroll) don't stall.
  let queue = new Set();
  let scheduled = false;
  function flush() {
    scheduled = false;
    const items = queue;
    queue = new Set();
    items.forEach(scan);
  }
  function enqueue(node) {
    queue.add(node);
    if (!scheduled) {
      scheduled = true;
      (window.requestIdleCallback || ((f) => setTimeout(f, 50)))(flush);
    }
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "characterData") enqueue(m.target);
      else if (m.type === "attributes") enqueue(m.target);
      else m.addedNodes.forEach(enqueue);
    }
  });

  function enable() {
    scan(document.body);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS,
    });
  }

  function disable() {
    observer.disconnect();
    queue.clear();
    unhideAll();
  }

  function apply(enabled) {
    if (enabled) enable();
    else disable();
  }

  // Defaults: ON, mode "hide". The popup writes `enabled` and `mode` to storage.
  chrome.storage.local.get({ enabled: true, mode: "hide" }, ({ enabled, mode }) => {
    setMode(mode);
    apply(enabled);
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.mode) setMode(changes.mode.newValue);
    if (changes.enabled) apply(changes.enabled.newValue !== false);
  });
})();
