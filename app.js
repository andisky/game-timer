let GAME = 12 * 60 * 1000;
let BREAK = 3 * 60 * 1000;

// 1. Ask for times IMMEDIATELY when the page loads
const gameMin = prompt("Game time (minutes)?", "12");
const breakMin = prompt("Break time (minutes)?", "3");

if (gameMin && breakMin) {
  GAME = Number(gameMin) * 60 * 1000;
  BREAK = Number(breakMin) * 60 * 1000;
}

let phase = "idle";
let endTime = 0;
let interval;
let heartbeatInterval; 

// Web Audio API Setup
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

let startSoundBuffer = null;
let endSoundBuffer = null;

// Preload Audio
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

// Update the initial timer text on the screen to match their input
window.onload = function() {
    document.getElementById("timer").innerText = format(GAME);
};

// Play Sound Function
function playSound(buffer) {
  if (!buffer) return; 
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start(0);
}

// The Heartbeat (Keeps iOS from muting the tab after 12 minutes)
function playSilentPing() {
  if (audioCtx.state === 'suspended') return;
  const silentBuffer = audioCtx.createBuffer(1, 1, 22050);
  const source = audioCtx.createBufferSource();
  source.buffer = silentBuffer;
  source.connect(audioCtx.destination);
  source.start(0);
}

// Start button (Triggered when they click the button)
function start() {
  // Prevent starting the timer twice if they click the button again
  if (phase !== "idle") return; 

  // iOS Magic Unlock: This MUST happen during the button click
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  startGame();

  // Start the countdown loop
  if (!interval) {
    interval = setInterval(update, 200);
  }

  // Start the heartbeat to keep iOS awake
  if (!heartbeatInterval) {
    heartbeatInterval = setInterval(playSilentPing, 30000); 
  }
  
  // Hide the start button so they don't click it again
  document.querySelector("button").style.display = "none"; 
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
