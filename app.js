let GAME = 12 * 60 * 1000;
let BREAK = 3 * 60 * 1000;

let phase = "idle";
let endTime = 0;
let interval;

// Ask user before starting
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

function format(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}`;
}

function play(id) {
  const audio = document.getElementById(id);
  audio.currentTime = 0;
  audio.play();
}

function startGame() {
  phase = "game";
  endTime = Date.now() + GAME;

  play("startSound");
  document.getElementById("mode").innerText = "Game";
}

function startBreak() {
  phase = "break";
  endTime = Date.now() + BREAK;

  play("endSound");
  document.getElementById("mode").innerText = "Break";
}

function update() {
  const remaining = endTime - Date.now();
  document.getElementById("timer").innerText = format(remaining);

  if (remaining <= 0) {
    if (phase === "game") startBreak();
    else startGame();
  }
}