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

const state = {
  entered: false,
  room: "ring",
  cinema: false,
  ready: false,
  muted: false,
  playing: false,
  currentId: VIDEO.featured
};

let cinemaPlayer = null;
let dockPlayer = null;
let entropy = 0.13;

const $ = (id) => document.getElementById(id);

function setLayerChip() {
  const room = document.getElementById("room-" + state.room);
  const layer = room ? room.dataset.layer : "1";
  $("layer-chip").textContent = layer === "2" ? "L2 · THE ENGINE" : "L1 · THE CARNIVAL";
}

function showRoom(name) {
  state.room = name;
  document.querySelectorAll(".room").forEach((el) => {
    el.classList.toggle("hidden", el.id !== "room-" + name);
  });
  document.querySelectorAll(".hud-nav button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.room === name);
  });
  setLayerChip();
  history.replaceState(null, "", "#" + name);
  $("minimap").classList.add("hidden");
}

function enterWorld() {
  state.entered = true;
  sessionStorage.setItem("lladnaros-entered", "1");
  $("gate").classList.add("hidden");
  $("world").classList.remove("hidden");
  const hash = (location.hash || "#ring").slice(1);
  showRoom(["ring", "catalog", "notebook", "engine", "connect"].includes(hash) ? hash : "ring");
}

function openCinema(videoId) {
  state.cinema = true;
  state.currentId = videoId || VIDEO.featured;
  $("cinema").classList.remove("hidden");
  if (cinemaPlayer && cinemaPlayer.loadVideoById) {
    cinemaPlayer.loadVideoById(state.currentId);
    cinemaPlayer.unMute();
    cinemaPlayer.playVideo();
  }
  updateNow();
}

function closeCinema() {
  state.cinema = false;
  $("cinema").classList.add("hidden");
  if (cinemaPlayer && cinemaPlayer.pauseVideo) cinemaPlayer.pauseVideo();
  if (dockPlayer && dockPlayer.loadVideoById) {
    const t = cinemaPlayer && cinemaPlayer.getCurrentTime ? cinemaPlayer.getCurrentTime() : 0;
    dockPlayer.loadVideoById({ videoId: state.currentId, startSeconds: t });
    dockPlayer.unMute();
    dockPlayer.playVideo();
  }
  updateNow();
}

function playInDock(videoId) {
  state.currentId = videoId;
  if (dockPlayer && dockPlayer.loadVideoById) {
    dockPlayer.loadVideoById(videoId);
    dockPlayer.unMute();
    dockPlayer.playVideo();
  }
  updateNow();
}

function updateNow() {
  const title = VIDEO.titles[state.currentId] || "LLADNAROS";
  $("now-label").textContent = "NOW · " + title;
}

function toggleMute() {
  state.muted = !state.muted;
  const players = [cinemaPlayer, dockPlayer];
  players.forEach((p) => {
    if (!p) return;
    state.muted ? p.mute() : p.unMute();
  });
  const label = state.muted ? "UNMUTE" : "MUTE";
  ["mute-cinema", "dock-mute"].forEach((id) => {
    const el = $(id);
    if (el) el.textContent = label;
  });
}

function toggleDockPlay() {
  if (!dockPlayer) return;
  if (state.playing) dockPlayer.pauseVideo();
  else dockPlayer.playVideo();
}

window.onYouTubeIframeAPIReady = function () {
  cinemaPlayer = new YT.Player("yt-cinema", {
    videoId: VIDEO.featured,
    playerVars: { autoplay: 0, controls: 1, rel: 0, modestbranding: 1, playsinline: 1 },
    events: {
      onReady: () => { state.ready = true; },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED && state.cinema) closeCinema();
      }
    }
  });

  dockPlayer = new YT.Player("yt-dock", {
    videoId: VIDEO.featured,
    playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1, playsinline: 1 },
    events: {
      onStateChange: (e) => {
        state.playing = e.data === YT.PlayerState.PLAYING;
        const btn = $("dock-play");
        if (btn) btn.textContent = state.playing ? "PAUSE" : "PLAY";
      }
    }
  });
};

$("enter-btn").addEventListener("click", () => {
  enterWorld();
  openCinema(VIDEO.featured);
});

$("skip-btn").addEventListener("click", closeCinema);
$("mute-cinema").addEventListener("click", toggleMute);
$("dock-mute").addEventListener("click", toggleMute);
$("dock-play").addEventListener("click", toggleDockPlay);
$("dock-expand").addEventListener("click", () => openCinema(state.currentId));
$("replay-featured").addEventListener("click", () => playInDock(VIDEO.featured));
$("map-toggle").addEventListener("click", () => $("minimap").classList.toggle("hidden"));

document.querySelectorAll("[data-room]").forEach((btn) => {
  btn.addEventListener("click", () => showRoom(btn.dataset.room));
});

document.querySelectorAll(".chip[data-yt]").forEach((chip) => {
  chip.addEventListener("click", () => playInDock(chip.dataset.yt));
});

document.addEventListener("keydown", (e) => {
  const map = { "1": "ring", "2": "catalog", "3": "notebook", "4": "engine", "5": "connect" };
  if (map[e.key]) showRoom(map[e.key]);
  if (e.key === "m" || e.key === "M") toggleMute();
  if (e.key === "Escape") {
    if (state.cinema) closeCinema();
    else $("minimap").classList.add("hidden");
  }
});

setInterval(() => {
  entropy += (Math.random() - 0.42) * 0.02;
  entropy = Math.max(0.01, Math.min(0.99, entropy));
  const el = $("entropy");
  if (el) el.textContent = entropy.toFixed(2);
}, 900);

if (sessionStorage.getItem("lladnaros-entered") === "1") {
  enterWorld();
}
