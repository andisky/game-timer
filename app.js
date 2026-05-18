let GAME = 12 * 60 * 1000;
let BREAK = 3 * 60 * 1000;

let phase = "idle";
let endTime = 0;
let interval;

// 1. Create Audio objects globally so they are not destroyed/recreated
const startAudio = new Audio("startsound.mp3");
const endAudio = new Audio("endsound.mp3");

// Start button
function start() {
  const gameMin = prompt("Game time (minutes)?", "12");
  const breakMin = prompt("Break time (minutes)?", "3");

  if (!gameMin || !breakMin) return;

  GAME = Number(gameMin) * 60 * 1000;
  BREAK = Number(breakMin) * 60 * 1000;

  // 2. THE FIX: "Unlock" the break sound during the user's initial tap.
  // We play and immediately pause it. This registers the audio as user-approved.
  endAudio.play().then(() => {
    endAudio.pause();
    endAudio.currentTime = 0;
  }).catch(err => console.log("Unlock skipped:", err));

  startGame();

  if (!interval) {
    interval = setInterval(update, 200);
  }
}

// Format timer
function format(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;

  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

// Start game phase
function startGame() {
  phase = "game";
  endTime = Date.now() + GAME;

  // 3. Play the pre-loaded global audio object
  startAudio.currentTime = 0; // Reset to beginning in case it's played multiple times
  startAudio.play().catch(error => console.log("Audio error:", error));

  document.getElementById("mode").innerText = "Game";
}

// Start break phase
function startBreak() {
  phase = "break";
  endTime = Date.now() + BREAK;

  // 4. Play the pre-loaded (and now unlocked) global audio object
  endAudio.currentTime = 0; 
  endAudio.play().catch(error => console.log("Audio error:", error));

  document.getElementById("mode").innerText = "Break";
}

// Main timer loop
function update() {
  const remaining = endTime - Date.now();

  document.getElementById("timer").innerText = format(remaining);

  if (remaining <= 0) {
    if (phase === "game") {
      startBreak();
    } else {
      startGame();
    }
  }
}
