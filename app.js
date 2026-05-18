let GAME = 12 * 60 * 1000;
let BREAK = 3 * 60 * 1000;

let phase = "idle";
let endTime = 0;
let interval;

// 1. Set up the Web Audio API Context
// This is the "master engine" for all sounds
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// Variables to hold our loaded audio data
let startSoundBuffer = null;
let endSoundBuffer = null;

// 2. Fetch and decode the audio files into memory immediately
async function preloadAudio() {
  try {
    const startRes = await fetch("startsound.mp3");
    const startArrayBuffer = await startRes.arrayBuffer();
    startSoundBuffer = await audioCtx.decodeAudioData(startArrayBuffer);

    const endRes = await fetch("endsound.mp3");
    const endArrayBuffer = await endRes.arrayBuffer();
    endSoundBuffer = await audioCtx.decodeAudioData(endArrayBuffer);
    console.log("Audio files loaded and ready!");
  } catch (e) {
    console.error("Failed to load audio. Check file paths.", e);
  }
}

// Call this right away so sounds load before the user clicks Start
preloadAudio();

// 3. Function to play a buffer
function playSound(buffer) {
  if (!buffer) {
      console.log("Sound not loaded yet!");
      return; 
  }
  
  // Create a new sound source, connect it to speakers, and play
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start(0);
}

// Start button
function start() {
  const gameMin = prompt("Game time (minutes)?", "12");
  const breakMin = prompt("Break time (minutes)?", "3");

  if (!gameMin || !breakMin) return;

  GAME = Number(gameMin) * 60 * 1000;
  BREAK = Number(breakMin) * 60 * 1000;

  // 4. THE MAGIC UNLOCK: 
  // iOS starts the audio context in a 'suspended' state. 
  // We MUST resume it inside this user-click event.
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => {
        console.log("Audio Context Unlocked!");
    });
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
