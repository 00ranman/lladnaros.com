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

function setQuiet(player) {
  if (!player || !player.setVolume) return;
  player.setVolume(START_VOLUME);
  if (state.muted) player.mute();
  else player.unMute();
}

function currentTime(player) {
  try {
    return player && player.getCurrentTime ? player.getCurrentTime() : 0;
  } catch (e) {
    return 0;
  }
}

function sizeCinema() {
  if (!cinemaPlayer || !cinemaPlayer.setSize) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  cinemaPlayer.setSize(w, h);
  const frame = document.querySelector("#cinema iframe") || $("yt-cinema");
  if (frame && frame.style) {
    frame.style.position = "absolute";
    frame.style.inset = "0";
    frame.style.width = w + "px";
    frame.style.height = h + "px";
    frame.setAttribute("width", String(w));
    frame.setAttribute("height", String(h));
  }
}

function enterFullscreen() {
  const el = $("cinema");
  if (!el) return;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (req) Promise.resolve(req.call(el)).catch(() => {});
}

function exitFullscreen() {
  const doc = document;
  if (!doc.fullscreenElement && !doc.webkitFullscreenElement) return;
  const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
  if (exit) Promise.resolve(exit.call(doc)).catch(() => {});
}

function setLayerChip() {
  const room = document.getElementById("room-" + state.room);
  const layer = room ? room.dataset.layer : "1";
  $("layer-chip").textContent = layer === "2" ? "L2 · THE ENGINE" : "L1 · THE FLOOR";
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

function openCinema() {
  const t = currentTime(dockPlayer);
  state.cinema = true;
  $("cinema").classList.remove("hidden");
  $("cinema").classList.add("is-on");
  if (dockPlayer && dockPlayer.pauseVideo) dockPlayer.pauseVideo();
  if (cinemaPlayer && cinemaPlayer.loadVideoById) {
    cinemaPlayer.loadVideoById({ videoId: state.currentId, startSeconds: t });
    setQuiet(cinemaPlayer);
    cinemaPlayer.playVideo();
  }
  requestAnimationFrame(() => {
    sizeCinema();
    enterFullscreen();
  });
  updateNow();
}

function closeCinema() {
  if (!state.cinema) return;
  const t = currentTime(cinemaPlayer);
  state.cinema = false;
  $("cinema").classList.add("hidden");
  $("cinema").classList.remove("is-on");
  exitFullscreen();
  if (cinemaPlayer && cinemaPlayer.pauseVideo) cinemaPlayer.pauseVideo();
  if (dockPlayer && dockPlayer.loadVideoById) {
    dockPlayer.loadVideoById({ videoId: state.currentId, startSeconds: t });
    setQuiet(dockPlayer);
    dockPlayer.playVideo();
  }
  updateNow();
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
  updateNow();
}

function updateNow() {
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

function toggleDockPlay() {
  if (!dockPlayer) return;
  if (state.playing) dockPlayer.pauseVideo();
  else dockPlayer.playVideo();
}

window.onYouTubeIframeAPIReady = function () {
  cinemaPlayer = new YT.Player("yt-cinema", {
    videoId: VIDEO.featured,
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      fs: 0
    },
    events: {
      onReady: (e) => {
        state.ready = true;
        setQuiet(e.target);
        sizeCinema();
      }
    }
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

$("enter-btn").addEventListener("click", () => {
  enterWorld();
  playInDock(VIDEO.featured);
});

$("skip-btn").addEventListener("click", closeCinema);
$("mute-cinema").addEventListener("click", toggleMute);
$("dock-mute").addEventListener("click", toggleMute);
$("dock-play").addEventListener("click", toggleDockPlay);
$("dock-expand").addEventListener("click", openCinema);
$("replay-featured").addEventListener("click", () => playInDock(VIDEO.featured));
$("map-toggle").addEventListener("click", () => $("minimap").classList.toggle("hidden"));

window.addEventListener("resize", () => {
  if (state.cinema) sizeCinema();
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && state.cinema) closeCinema();
});

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
