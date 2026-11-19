const toggle = document.getElementById("toggle");
const status = document.getElementById("status");
const modes = document.getElementById("modes");
const radios = document.querySelectorAll('input[name="mode"]');

function render({ enabled, mode }) {
  toggle.checked = enabled;
  radios.forEach((r) => {
    r.checked = r.value === mode;
    r.disabled = !enabled;
  });
  modes.classList.toggle("off", !enabled);
  status.textContent = enabled
    ? mode === "blur" ? "Active: matches are blurred." : "Active: matches are hidden."
    : "Paused. Everything is shown.";
}

let state = { enabled: true, mode: "hide" };
chrome.storage.local.get(state, (s) => render((state = s)));

toggle.addEventListener("change", () => {
  state.enabled = toggle.checked;
  chrome.storage.local.set({ enabled: state.enabled });
  render(state);
});

radios.forEach((r) =>
  r.addEventListener("change", () => {
    if (!r.checked) return;
    state.mode = r.value;
    chrome.storage.local.set({ mode: state.mode });
    render(state);
  })
);
