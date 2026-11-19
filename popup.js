const toggle = document.getElementById("toggle");
const status = document.getElementById("status");
const modeButtons = document.querySelectorAll("button[data-mode]");

let state = { enabled: true, mode: "hide" };

function render() {
  document.body.dataset.on = String(state.enabled);
  document.body.dataset.mode = state.mode;
  toggle.setAttribute("aria-checked", String(state.enabled));
  modeButtons.forEach((b) =>
    b.setAttribute("aria-pressed", String(state.enabled && b.dataset.mode === state.mode))
  );
  status.textContent = !state.enabled
    ? "Paused. Everything is shown."
    : state.mode === "hide"
      ? "Active. GTA 6 posts are hidden."
      : "Active. GTA 6 posts are blurred; hover to peek.";
}

chrome.storage.local.get(state, (saved) => {
  state = saved;
  render();
});

toggle.addEventListener("click", () => {
  state.enabled = !state.enabled;
  chrome.storage.local.set({ enabled: state.enabled });
  render();
});

// Picking a mode also turns the filter on.
modeButtons.forEach((b) =>
  b.addEventListener("click", () => {
    state.mode = b.dataset.mode;
    state.enabled = true;
    chrome.storage.local.set({ mode: state.mode, enabled: true });
    render();
  })
);
