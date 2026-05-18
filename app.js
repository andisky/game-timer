let GAME = 12 * 60 * 1000;
let BREAK = 3 * 60 * 1000;

let phase = "idle";
let endTime = 0;
let interval;

// Start button
function start() {

  const gameMin = prompt("Game time (minutes)?", "12");
  const breakMin = prompt("Break time (minutes)?", "3");

  if (!gameMin || !breakMin) return;

  GAME = Number(gameMin) * 60 * 1000;
  BREAK = Number(breakMin) * 60 * 1000;

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

// Reliable iPhone audio playback
function play(file) {

  const audio = new Audio(file);

  audio.play().catch(error => {
    console.log("Audio error:", error);
  });
}

// Start game phase
function startGame() {

  phase = "game";

  // Timer starts IMMEDIATELY when sound starts
  endTime = Date.now() + GAME;

  play("startsound.mp3");

  document.getElementById("mode").innerText = "Game";
}

// Start break phase
function startBreak() {

  phase = "break";

  // Break starts IMMEDIATELY when end sound starts
  endTime = Date.now() + BREAK;

  play("endsound.mp3");

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
