
const $ = (id) => document.getElementById(id);

const DEMO_PIN = "2580";
const MAX_ATTEMPTS = 3;

let attempts = 0;
let unlocked = false;
let lockout = false;

function logEvent(text, type = "info") {
  const row = document.createElement("div");
  row.className = "log-item";

  const mark = document.createElement("span");
  mark.className = "log-mark";
  mark.textContent =
    type === "good" ? "✓" :
    type === "bad" ? "!" : "•";

  const content = document.createElement("div");
  const description = document.createElement("div");
  description.textContent = text;

  const time = document.createElement("span");
  time.className = "log-time";
  time.textContent = new Date().toLocaleTimeString();

  content.append(description, time);
  row.append(mark, content);

  $("eventLog").prepend(row);

  while ($("eventLog").children.length > 30) {
    $("eventLog").lastElementChild.remove();
  }
}

function showMessage(text, type = "") {
  $("systemMessage").className = "message " + type;
  $("systemMessage").textContent = text;
}

function clearPin() {
  $("pin").value = "";
  $("pin").type = "password";
  $("showPin").textContent = "Show";
}

function render() {
  $("attemptCount").textContent = `${attempts} / ${MAX_ATTEMPTS}`;

  $("attemptProgress").style.width =
    `${(attempts / MAX_ATTEMPTS) * 100}%`;

  $("attemptProgress").style.background =
    lockout ? "var(--red)" : "var(--blue)";

  $("statusBox").className =
    "status" + (unlocked ? " unlocked" : lockout ? " alert" : "");

  $("statusText").textContent =
    unlocked ? "Locker access granted" :
    lockout ? "Security lockout active" :
    "Locker is secured";

  $("lockIcon").textContent =
    unlocked ? "🔓" : lockout ? "🚨" : "🔒";

  $("doorCaption").textContent =
    unlocked ? "ACCESS GRANTED" :
    lockout ? "SYSTEM LOCKED" :
    "LOCKED VAULT";

  $("accessMetric").textContent = unlocked ? "GRANTED" : "DENIED";

  $("accessMetric").style.color =
    unlocked ? "var(--green)" : "var(--red)";

  $("modeMetric").textContent =
    lockout ? "LOCKOUT" : unlocked ? "OPEN" : "READY";

  $("modeMetric").style.color =
    lockout ? "var(--red)" :
    unlocked ? "var(--green)" : "var(--text)";

  $("submitBtn").disabled = lockout || unlocked;
  $("pin").disabled = lockout || unlocked;

  document.querySelectorAll("#keypad button").forEach((button) => {
    button.disabled = lockout || unlocked;
  });

  $("relockBtn").disabled = !unlocked;
}

function verifyPin() {
  if (lockout || unlocked) return;

  const pin = $("pin").value;

  if (!/^\d{4}$/.test(pin)) {
    $("authMessage").textContent =
      "Please enter exactly four digits.";
    return;
  }

  if (pin === DEMO_PIN) {
    unlocked = true;

    logEvent("Correct PIN. Locker access granted.", "good");

    showMessage(
      "Authentication successful. Locker is now unlocked.",
      "good"
    );

    $("authMessage").textContent =
      "Access granted. Relock the locker when finished.";
  } else {
    attempts++;

    logEvent(
      `Incorrect PIN attempt ${attempts} of ${MAX_ATTEMPTS}.`,
      "bad"
    );

    if (attempts >= MAX_ATTEMPTS) {
      lockout = true;

      logEvent(
        "Maximum failed attempts reached. Security lockout activated.",
        "bad"
      );

      showMessage(
        "SECURITY ALERT: Three incorrect attempts. Access is disabled until reset.",
        "bad"
      );

      $("authMessage").textContent =
        "Lockout active. Reset the demo to try again.";
    } else {
      const remaining = MAX_ATTEMPTS - attempts;

      showMessage(
        `Incorrect PIN. ${remaining} attempt(s) remaining.`,
        "warn"
      );

      $("authMessage").textContent = "PIN not recognized. Try again.";
    }
  }

  clearPin();
  render();
}

$("submitBtn").addEventListener("click", verifyPin);

$("pin").addEventListener("keydown", (event) => {
  if (event.key === "Enter") verifyPin();
});

$("pin").addEventListener("input", () => {
  $("pin").value = $("pin").value
    .replace(/\D/g, "")
    .slice(0, 4);
});

$("showPin").addEventListener("click", () => {
  const isVisible = $("pin").type === "text";

  $("pin").type = isVisible ? "password" : "text";
  $("showPin").textContent = isVisible ? "Show" : "Hide";
});

$("keypad").addEventListener("click", (event) => {
  const key = event.target.dataset.key;

  if (!key || lockout || unlocked) return;

  const input = $("pin");

  if (key === "clear") {
    input.value = "";
  } else if (key === "back") {
    input.value = input.value.slice(0, -1);
  } else if (input.value.length < 4) {
    input.value += key;
  }

  input.focus();
});

$("relockBtn").addEventListener("click", () => {
  unlocked = false;
  clearPin();

  logEvent("Locker relocked by user.");

  showMessage("Locker relocked. PIN verification is required.");

  $("authMessage").textContent = "Locker is secured again.";

  render();
});

$("resetBtn").addEventListener("click", () => {
  attempts = 0;
  unlocked = false;
  lockout = false;

  clearPin();

  logEvent("Demo reset. Failed-attempt counter cleared.");

  showMessage("System reset. Enter the demo PIN to request access.");

  $("authMessage").textContent =
    "Demo PIN: 2580. Educational simulation only.";

  render();
});

$("clearLogBtn").addEventListener("click", () => {
  $("eventLog").replaceChildren();
  logEvent("Event history cleared.");
});

logEvent("VaultSecure initialized. Locker is locked.");
render();
