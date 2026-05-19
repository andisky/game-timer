let GAME = 12 * 60 * 1000;
let BREAK = 3 * 60 * 1000;

let phase = "idle";
let endTime = 0;
let interval;
let heartbeatInterval; 

// Audio-Elemente aus dem HTML holen
const startAudio = document.getElementById("startSound");
const endAudio = document.getElementById("endSound");

// Web Audio API (nur für den stummen Heartbeat!)
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// Der unsichtbare Heartbeat, der iOS wach hält
function playSilentPing() {
  if (audioCtx.state === 'suspended') return;
  const silentBuffer = audioCtx.createBuffer(1, 1, 22050);
  const source = audioCtx.createBufferSource();
  source.buffer = silentBuffer;
  source.connect(audioCtx.destination);
  source.start(0);
}

// Start-Button Logik
// Start-Button Logik
function start() {
  const gameMin = document.getElementById("gameInput").value;
  const breakMin = document.getElementById("breakInput").value;

  if (!gameMin || !breakMin) return;

  GAME = Number(gameMin) * 60 * 1000;
  BREAK = Number(breakMin) * 60 * 1000;

  // --- iOS UNLOCK MAGIC ---
  // HIER IST DER FIX: Wir schalten nur noch den endSound stumm frei. 
  // Der startSound wird unten in startGame() sowieso direkt echt abgespielt.
  endAudio.play().then(() => endAudio.pause()).catch(e => console.log(e));

  // Den Heartbeat-Motor freischalten
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  // ------------------------

  // Ansicht wechseln (Setup verstecken, Timer zeigen)
  document.getElementById("setup-view").style.display = "none";
  document.getElementById("timer-view").style.display = "flex";

  startGame(); // Hier wird startAudio normal und fehlerfrei gestartet

  // Timer Loop starten
  if (!interval) {
    interval = setInterval(update, 200);
  }

  // Heartbeat alle 30 Sekunden abspielen
  if (!heartbeatInterval) {
    heartbeatInterval = setInterval(playSilentPing, 30000); 
  }
}

// Zeit-Formatierung
function format(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

// Game starten
function startGame() {
  phase = "game";
  endTime = Date.now() + GAME;
  
  startAudio.currentTime = 0;
  startAudio.play().catch(e => console.log(e));
  
  document.getElementById("mode").innerText = "Game";
}

// Break starten
function startBreak() {
  phase = "break";
  endTime = Date.now() + BREAK;
  
  endAudio.currentTime = 0;
  endAudio.play().catch(e => console.log(e));
  
  document.getElementById("mode").innerText = "Break";
}

// Timer Update
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
