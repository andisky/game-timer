let GAME = 12 * 60 * 1000;
let BREAK = 3 * 60 * 1000;

let phase = "idle";
let endTime = 0;
let interval;

// 1. Web Audio API Setup
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

let startSoundBuffer = null;
let endSoundBuffer = null;

// 2. Preload Audio
async function preloadAudio() {
  try {
    const startRes = await fetch("startsound.mp3");
    const startArrayBuffer = await startRes.arrayBuffer();
    startSoundBuffer = await audioCtx.decodeAudioData(startArrayBuffer);

    const endRes = await fetch("endsound.mp3");
    const endArrayBuffer = await endRes.arrayBuffer();
    endSoundBuffer = await audioCtx.decodeAudioData(endArrayBuffer);
  } catch (e) {
    console.error("Failed to load audio:", e);
  }
}

preloadAudio();

// 3. Play Sound Function
function playSound(buffer) {
  if (!buffer) return; 
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start(0);
}

// Start button
function start() {
  // Read the values from the HTML inputs instead of using prompt()
  const gameMin = document.getElementById("gameInput").value;
  const breakMin = document.getElementById("breakInput").value;

  // Basic validation to make sure they didn't leave it blank
  if (!gameMin || !breakMin || gameMin <= 0 || breakMin <= 0) {
    alert("Please enter valid times!");
    return;
  }

  // Convert minutes to milliseconds
  GAME = Number(gameMin) * 60 * 1000;
  BREAK = Number(breakMin) * 60 * 1000;

  // iOS Magic Unlock (Must remain right here inside the click event)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

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
  playSound(startSoundBuffer);
  document.getElementById("mode").innerText = "Game";
}

// Start break phase
function startBreak() {
  phase = "break";
  endTime = Date.now() + BREAK;
  playSound(endSoundBuffer);
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
