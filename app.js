const VIDEO = {
  featured: "70jZG8p1h1w",
  titles: {
    "70jZG8p1h1w": "WEAPONIZED TRANSPARENCY",
    "HddQkXc5mSQ": "THE F U INTERNET ENGINE",
    "LrdUNRrEufw": "THE GLITCH WAS ME",
    "mK6H0W2syKg": "AND THAT'S… (HOW)",
    "WWXGyV5xQSU": "COORDINATES"
  }
};

const START_VOLUME = 25;

const TENTS = [
  { id: "ring", x: 50, y: 28, label: "THE RING" },
  { id: "catalog", x: 18, y: 44, label: "CATALOG" },
  { id: "notebook", x: 82, y: 44, label: "NOTEBOOK" },
  { id: "engine", x: 16, y: 74, label: "L2 ENGINE" },
  { id: "connect", x: 84, y: 74, label: "BOX OFFICE" }
];

const state = {
  entered: false,
  inside: false,
  room: null,
  cinema: false,
  ready: false,
  muted: false,
  playing: false,
  currentId: VIDEO.featured,
  x: 50,
  y: 62,
  keys: {},
  near: null
};

let cinemaPlayer = null;
let dockPlayer = null;
let entropy = 0.13;

const $ = (id) => document.getElementById(id);

function setQuiet(player) {
  if (!player || !player.setVolume) return;
  player.setVolume(START_VOLUME);
  if (state.muted) player.mute();
  else player.unMute();
}

function currentTime(player) {
  try { return player && player.getCurrentTime ? player.getCurrentTime() : 0; }
  catch (e) { return 0; }
}

function sizeCinema() {
  if (!cinemaPlayer || !cinemaPlayer.setSize) return;
  cinemaPlayer.setSize(window.innerWidth, window.innerHeight);
}

function enterFullscreen() {
  const el = $("cinema");
  const req = el && (el.requestFullscreen || el.webkitRequestFullscreen);
  if (req) Promise.resolve(req.call(el)).catch(() => {});
}

function exitFullscreen() {
  const doc = document;
  if (!doc.fullscreenElement && !doc.webkitFullscreenElement) return;
  const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
  if (exit) Promise.resolve(exit.call(doc)).catch(() => {});
}

function paintArt() {
  const src = "img/ringleader.jpg";
  const idle = document.querySelector("#ringleader img.idle");
  const alt = document.querySelector("#ringleader img.alt");
  if (idle) idle.src = src;
  if (alt) alt.src = src;
}

function enterWorld() {
  state.entered = true;
  sessionStorage.setItem("lladnaros-entered", "1");
  $("gate").classList.add("hidden");
  $("world").classList.remove("hidden");
  leaveTent();
}

function nearestTent() {
  let best = null;
  let bestD = 14;
  TENTS.forEach((t) => {
    const d = Math.hypot(state.x - t.x, state.y - t.y);
    if (d < bestD) { bestD = d; best = t; }
  });
  return best;
}

function pointRingleader(tent) {
  const el = $("ringleader");
  if (!el) return;
  if (!tent) {
    el.classList.remove("pointing", "point-right");
    return;
  }
  el.classList.add("pointing");
  el.classList.toggle("point-right", tent.x >= 50);
}

function enterTent(id) {
  state.inside = true;
  state.room = id;
  $("interior").classList.remove("hidden");
  document.querySelectorAll("#interior .room").forEach((el) => {
    el.classList.toggle("hidden", el.id !== "room-" + id);
  });
  const tent = TENTS.find((t) => t.id === id);
  $("tent-label").textContent = tent ? "INSIDE · " + tent.label : "INSIDE";
  history.replaceState(null, "", "#" + id);
}

function leaveTent() {
  state.inside = false;
  state.room = null;
  $("interior").classList.add("hidden");
  history.replaceState(null, "", "#grounds");
}

function openCinema() {
  const t = currentTime(dockPlayer);
  state.cinema = true;
  $("cinema").classList.remove("hidden");
  if (dockPlayer && dockPlayer.pauseVideo) dockPlayer.pauseVideo();
  if (cinemaPlayer && cinemaPlayer.loadVideoById) {
    cinemaPlayer.loadVideoById({ videoId: state.currentId, startSeconds: t });
    setQuiet(cinemaPlayer);
    cinemaPlayer.playVideo();
  }
  requestAnimationFrame(() => { sizeCinema(); enterFullscreen(); });
}

function closeCinema() {
  if (!state.cinema) return;
  const t = currentTime(cinemaPlayer);
  state.cinema = false;
  $("cinema").classList.add("hidden");
  exitFullscreen();
  if (cinemaPlayer && cinemaPlayer.pauseVideo) cinemaPlayer.pauseVideo();
  if (dockPlayer && dockPlayer.loadVideoById) {
    dockPlayer.loadVideoById({ videoId: state.currentId, startSeconds: t });
    setQuiet(dockPlayer);
    dockPlayer.playVideo();
  }
}

function playInDock(videoId, startSeconds) {
  state.currentId = videoId;
  if (dockPlayer && dockPlayer.loadVideoById) {
    const opts = { videoId };
    if (startSeconds) opts.startSeconds = startSeconds;
    dockPlayer.loadVideoById(opts);
    setQuiet(dockPlayer);
    dockPlayer.playVideo();
  }
  const title = VIDEO.titles[state.currentId] || "LLADNAROS";
  $("now-label").textContent = "NOW · " + title;
}

function toggleMute() {
  state.muted = !state.muted;
  [cinemaPlayer, dockPlayer].forEach((p) => {
    if (!p) return;
    state.muted ? p.mute() : p.unMute();
  });
  const label = state.muted ? "UNMUTE" : "MUTE";
  ["mute-cinema", "dock-mute"].forEach((id) => {
    const el = $(id);
    if (el) el.textContent = label;
  });
}

function loop() {
  if (state.entered && !state.inside && !state.cinema) {
    const speed = 0.42;
    if (state.keys.w || state.keys.arrowup) state.y -= speed;
    if (state.keys.s || state.keys.arrowdown) state.y += speed;
    if (state.keys.a || state.keys.arrowleft) state.x -= speed;
    if (state.keys.d || state.keys.arrowright) state.x += speed;
    state.x = Math.max(10, Math.min(90, state.x));
    state.y = Math.max(26, Math.min(82, state.y));
    $("player").style.left = state.x + "%";
    $("player").style.top = state.y + "%";
    const near = nearestTent();
    state.near = near;
    document.querySelectorAll(".tent").forEach((btn) => {
      btn.classList.toggle("hot", !!(near && btn.dataset.room === near.id));
    });
    pointRingleader(near);
    const prompt = $("prompt");
    if (near) {
      prompt.classList.remove("hidden");
      prompt.style.left = state.x + "%";
      prompt.style.top = state.y + "%";
    } else {
      prompt.classList.add("hidden");
    }
  }
  requestAnimationFrame(loop);
}

window.onYouTubeIframeAPIReady = function () {
  cinemaPlayer = new YT.Player("yt-cinema", {
    videoId: VIDEO.featured,
    width: "100%",
    height: "100%",
    playerVars: { autoplay: 0, controls: 1, rel: 0, modestbranding: 1, playsinline: 1, fs: 0 },
    events: { onReady: (e) => { state.ready = true; setQuiet(e.target); } }
  });

  dockPlayer = new YT.Player("yt-dock", {
    videoId: VIDEO.featured,
    width: 160,
    height: 90,
    playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1, playsinline: 1 },
    events: {
      onReady: (e) => {
        setQuiet(e.target);
        if (state.entered) playInDock(state.currentId);
      },
      onStateChange: (e) => {
        state.playing = e.data === YT.PlayerState.PLAYING;
        const btn = $("dock-play");
        if (btn) btn.textContent = state.playing ? "PAUSE" : "PLAY";
      }
    }
  });
};

paintArt();

$("enter-btn").addEventListener("click", () => {
  enterWorld();
  playInDock(VIDEO.featured);
});

$("skip-btn").addEventListener("click", closeCinema);
$("mute-cinema").addEventListener("click", toggleMute);
$("dock-mute").addEventListener("click", toggleMute);
$("dock-play").addEventListener("click", () => {
  if (!dockPlayer) return;
  state.playing ? dockPlayer.pauseVideo() : dockPlayer.playVideo();
});
$("dock-expand").addEventListener("click", openCinema);
$("replay-featured").addEventListener("click", () => playInDock(VIDEO.featured));
$("leave-tent").addEventListener("click", leaveTent);
$("back-grounds").addEventListener("click", leaveTent);

document.querySelectorAll(".tent").forEach((btn) => {
  btn.addEventListener("click", () => {
    const t = TENTS.find((x) => x.id === btn.dataset.room);
    if (t) { state.x = t.x; state.y = t.y + 6; }
    enterTent(btn.dataset.room);
  });
});

document.querySelectorAll(".chip[data-yt]").forEach((chip) => {
  chip.addEventListener("click", () => playInDock(chip.dataset.yt));
});

window.addEventListener("resize", () => { if (state.cinema) sizeCinema(); });
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && state.cinema) closeCinema();
});

document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  state.keys[k] = true;
  if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
  if ((k === "e" || k === "enter") && state.near && !state.inside && !state.cinema) enterTent(state.near.id);
  if (k === "m") toggleMute();
  if (k === "escape") {
    if (state.cinema) closeCinema();
    else if (state.inside) leaveTent();
  }
});
document.addEventListener("keyup", (e) => {
  state.keys[e.key.toLowerCase()] = false;
});

setInterval(() => {
  entropy += (Math.random() - 0.42) * 0.02;
  entropy = Math.max(0.01, Math.min(0.99, entropy));
  const el = $("entropy");
  if (el) el.textContent = entropy.toFixed(2);
}, 900);

if (sessionStorage.getItem("lladnaros-entered") === "1") enterWorld();
requestAnimationFrame(loop);
