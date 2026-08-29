/* =========================
   Screenshot Support Guard + English Alert
========================= */

// 你想要的英文提示文字（可自行改）
const SCREENSHOT_UNSUPPORTED_MSG =
  "Sorry — your browser/device can’t generate screenshots here.\n\n" +
  "Please try one of the following:\n" +
  "• Use Chrome / Edge / Safari (latest)\n" +
  "• Disable strict tracking protection / ad blockers\n" +
  "• Make sure images are fully loaded\n" +
  "• Try a different device";

// 簡易彈窗（不依賴 modal，不會跟你 UI 打架）
function showScreenshotAlert(message = SCREENSHOT_UNSUPPORTED_MSG) {
  // 如果已存在就先移除（避免疊太多）
  const old = document.getElementById("screenshotAlertOverlay");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "screenshotAlertOverlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.75)";
  overlay.style.zIndex = "30000";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.padding = "24px";

  const card = document.createElement("div");
  card.style.width = "min(720px, 92vw)";
  card.style.background = "#fff";
  card.style.borderRadius = "20px";
  card.style.padding = "22px 22px 18px";
  card.style.boxSizing = "border-box";
  card.style.fontFamily = "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  card.style.color = "#2b2b2b";
  card.style.lineHeight = "1.45";

  const title = document.createElement("div");
  title.textContent = "Screenshot unavailable";
  title.style.fontSize = "20px";
  title.style.fontWeight = "700";
  title.style.marginBottom = "10px";

  const body = document.createElement("pre");
  body.textContent = message;
  body.style.whiteSpace = "pre-wrap";
  body.style.margin = "0 0 14px 0";
  body.style.fontSize = "15px";

  const btnRow = document.createElement("div");
  btnRow.style.display = "flex";
  btnRow.style.justifyContent = "flex-end";
  btnRow.style.gap = "10px";

  const okBtn = document.createElement("button");
  okBtn.textContent = "OK";
  okBtn.style.border = "none";
  okBtn.style.borderRadius = "14px";
  okBtn.style.padding = "10px 16px";
  okBtn.style.cursor = "pointer";
  okBtn.style.fontWeight = "700";

  okBtn.addEventListener("click", () => overlay.remove());

  // 點背景也能關
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  btnRow.appendChild(okBtn);
  card.appendChild(title);
  card.appendChild(body);
  card.appendChild(btnRow);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

// 基本能力檢查：不是保證成功，但能提前擋掉很舊或奇怪環境
function canAttemptScreenshot() {
  try {
    // html2canvas 是否載入
    if (typeof html2canvas !== "function") return false;

    // Canvas 是否可用
    const c = document.createElement("canvas");
    const ctx = c.getContext && c.getContext("2d");
    if (!ctx) return false;

    // toDataURL 是否存在
    if (typeof c.toDataURL !== "function") return false;

    // Promise 是否存在（你的流程大量用到）
    if (typeof Promise === "undefined") return false;

    return true;
  } catch {
    return false;
  }
}

// 包一層：統一處理「不支援/失敗」提示
async function safeScreenshot(run, contextLabel = "Screenshot") {
  if (!canAttemptScreenshot()) {
    console.warn(`[${contextLabel}] capability check failed`);
    showScreenshotAlert();
    return null;
  }

  try {
    return await run();
  } catch (err) {
    console.error(`[${contextLabel}] failed:`, err);

    // 常見錯誤：canvas 被 tainted（跨域圖片沒 CORS）
    const msg = String(err?.message || err || "");
    if (msg.toLowerCase().includes("tainted") || msg.toLowerCase().includes("security")) {
      showScreenshotAlert(
        "Sorry — the screenshot could not be generated because the canvas was blocked by browser security rules.\n\n" +
        "This usually happens when an image is loaded without proper CORS headers.\n\n" +
        "Please try:\n" +
        "• Use the official site URL (not a file:// path)\n" +
        "• Ensure all images are from the same domain, or enable CORS\n" +
        "• Try Chrome / Edge / Safari (latest)"
      );
    } else {
      showScreenshotAlert();
    }
    return null;
  }
}


const blessingsRef = database.ref("nanaharaBlessings");

/* ===== Loading 預載系統 ===== */
const loadingScreen = document.getElementById("loadingScreen");
const loadingText = document.getElementById("loadingText");

// 要預載的所有素材（包含你的 loading 圖自己）
const assets = [
  "images/loading-bg.jpg",
  "images/loading-sakura.png",
  "images/bg.jpg",
  "images/shrine.png",
  "images/characters.png",
  "images/draw-btn.png",
  "images/omikuji1.png",
  "images/omikuji2.png",
  "images/omikuji3.png",
  "images/omikuji4.png",
  "images/omikuji5.png",
  "images/omikuji6.png",
  "images/omikuji7.png",
  "images/sakura1.png",
  "images/sakura2.png",
  "images/sakura3.png",

];

let preloadLoadedCount = 0;

assets.forEach(src => {
  const img = new Image();

  let done = false;

  const finish = () => {
    if (done) return;
    done = true;
    updateLoadingProgress();
  };

  img.onload = finish;
  img.onerror = finish;

  // ✅ 保險：避免某張圖片因網路、快取或瀏覽器問題讓 loading 永遠卡住
  setTimeout(finish, 8000);

  img.src = src;
});


/* ===== Loading 預載系統 ===== */
function updateLoadingProgress() {
  preloadLoadedCount++;
  const percent = Math.floor((preloadLoadedCount / assets.length) * 100);
  loadingText.textContent = `Loading... ${percent}%`;

  if (preloadLoadedCount === assets.length) {
    setTimeout(() => {
      hideLoadingScreen();
    }, 1000);
  }
}

/* ===== 隱藏 Loading 並顯示導覽頁 ===== */
function hideLoadingScreen() {
  // Menu 一開始存在
  menuScreen.classList.remove("hidden");

  // 讓 menu-content 開始浮現
  const menuContent = document.querySelector("#menuScreen .menu-content");
  setTimeout(() => {
    menuContent.classList.add("show");
  }, 50); // 微延遲，保證 CSS transition 被觸發

  // Loading 畫面淡出
  loadingScreen.style.opacity = "0";
  loadingScreen.style.transition = "opacity 1.5s ease";

  // 完全移除 loading 畫面
  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 1500);
}




const menuScreen = document.getElementById("menuScreen");

// === 封存祝福卡片功能（暫停）===
// blessingCard.addEventListener("click", () => {
//   ...
// });
const blessingWrapper = document.getElementById("blessingWrapper");
const blessingCard = document.getElementById("blessingCard");
const introScreen = document.getElementById("introScreen");

/* ===== 顯示卡片 ===== */
function showBlessingCard() {
  // 顯示 wrapper
  blessingWrapper.style.opacity = "1";
  blessingWrapper.style.pointerEvents = "auto";
  blessingWrapper.style.transition = "opacity 1s ease";

  // 啟動浮動 + 光暈動畫
  blessingCard.classList.add("card-animate");
}

/* ===== 點擊卡片飛走 ===== */
blessingCard.addEventListener("click", () => {
  blessingCard.style.pointerEvents = "none";

  // 取得 Firebase reference
  const blessingRef = firebase.database().ref("nanaharaBlessings");
  const countRef = firebase.database().ref("nanaharaBlessingsCount");

    // 每次點擊都 push 一筆祝福
  blessingsRef.push({
    timestamp: Date.now(),
    device: navigator.userAgent
  });

  // 同步更新總數
  countRef.transaction(current => (current || 0) + 1, (error, committed, snapshot) => {
    if (error) {
      console.error("更新總數失敗：", error);
    } else if (!committed) {
      console.log("Transaction 未提交");
    } else {
      console.log("祝福總數：", snapshot.val());
    }
  });

  // 卡片動畫
  blessingCard.classList.remove("card-animate");
  blessingWrapper.classList.add("card-hide");

  // 導覽頁淡出
  introScreen.style.transition = "opacity 1.2s ease";
  introScreen.style.opacity = "0";

  setTimeout(() => {
    introScreen.style.display = "none";
    blessingWrapper.style.display = "none";
  }, 1200);
});





/* ===== 文字動畫完成後才顯示卡片 ===== */
function showIntroTextLines() {
  const lines = document.querySelectorAll("#introText div");
  const lineDelay = 1.5;
  const animDuration = 4;

  lines.forEach((line, index) => {
    line.style.animation = "none";
    void line.offsetWidth;
    line.style.animation = `fadeUpLine ${animDuration}s forwards ${index * lineDelay}s`;
  });

  const totalTime = (lines.length - 1) * lineDelay + animDuration;

  setTimeout(() => {
    showBlessingCard();
  }, totalTime * 1000);
}


const btnOmikuji = document.getElementById("btnOmikuji");
const btnMission = document.getElementById("btnMission");

const leftDoor = document.querySelector(".door.left");
const rightDoor = document.querySelector(".door.right");

const omikujiScreen = document.getElementById("omikujiScreen");
const windGameScreen = document.getElementById("windGameScreen");
const windGameBg = document.getElementById("windGameBg");
const btnWindGameMenu = document.getElementById("btnWindGameMenu");
const windPauseOverlay = document.getElementById("windPauseOverlay");

function goToScreen(fromScreen, toScreen, holdTime = 600, onClosedReady = null) {
  leftDoor.classList.remove("hide", "closed");
  rightDoor.classList.remove("hide", "closed");

  leftDoor.classList.add("show");
  rightDoor.classList.add("show");

  rightDoor.addEventListener("animationend", onDoorsClosed, { once: true });

  async function onDoorsClosed() {
    leftDoor.classList.add("closed");
    rightDoor.classList.add("closed");

    leftDoor.classList.remove("show");
    rightDoor.classList.remove("show");

    fromScreen.classList.add("hidden");
    toScreen.classList.remove("hidden");

    if (typeof onClosedReady === "function") {
      await onClosedReady();
    }

    setTimeout(() => {
      requestAnimationFrame(() => {
        leftDoor.classList.remove("closed");
        rightDoor.classList.remove("closed");
        leftDoor.classList.add("hide");
        rightDoor.classList.add("hide");
      });
    }, holdTime);
  }
}
const WIND_GAME_BG = {
  day: "images/wind-bg-day.jpg",
  night: "images/wind-bg-night.jpg"
};

function getWindGameModeByTime() {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6 ? "night" : "day";
}

function prepareWindGameBackground() {
  if (!windGameBg) return;

  const mode = getWindGameModeByTime();
  const nextSrc = WIND_GAME_BG[mode];

  if (windGameBg.getAttribute("src") !== nextSrc) {
    windGameBg.src = nextSrc;
  }
}

/* =========================
   Wind Game Player Setup
========================= */

const windPlayer = document.getElementById("windPlayer");
const windCrane = document.getElementById("windCrane");
const windChinatsu = document.getElementById("windChinatsu");
const windChifuyu = document.getElementById("windChifuyu");
const windSlash = document.getElementById("windSlash");

function resetWindPlayerVisual() {
  windPlayerY = 0;
  windPlayerVY = 0;
  windLastTime = 0;

  if (windAnimFrame) {
    cancelAnimationFrame(windAnimFrame);
    windAnimFrame = null;

    clearWindDebugHitboxes();
  }

  applyWindPlayerPosition();

  if (windChinatsu) {
    windChinatsu.src = "images/wind-chinatsu-down.png";
  }

  if (windChifuyu) {
    windChifuyu.src = "images/wind-chifuyu-idle.png";
  }

  if (windSlash) {
    windSlash.classList.add("hidden");
    windSlash.classList.remove("slash-active");
  }
}


/* =========================
   Wind Game Audio
========================= */

const shrineBgm = document.getElementById("bgm");
const windGameBgm = document.getElementById("windGameBgm");
const windSlashSound = document.getElementById("windSlashSound");

let windGameAudioMode = false;
let windGameBgmStartedThisRound = false;

if (windGameBgm) {
  windGameBgm.loop = true;
}

function playAudioSafe(audio) {
  if (!audio) return;

  const playPromise = audio.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch((err) => {
      console.warn("[Audio] play blocked or failed:", err);
    });
  }
}

function pauseAudio(audio) {
  if (!audio) return;
  audio.pause();
}

function stopAudio(audio) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

function enterWindGameAudioMode() {
  windGameAudioMode = true;
  windGameBgmStartedThisRound = false;

  // 進入小遊戲時，先停掉神社 BGM
  stopAudio(shrineBgm);

  // 小遊戲 BGM 也先保持停止，等倒數到 2 再播
  stopAudio(windGameBgm);

  // 保險：防止原本神社 BGM 淡入流程稍後復活
  setTimeout(() => {
    if (windGameAudioMode) stopAudio(shrineBgm);
  }, 100);

  setTimeout(() => {
    if (windGameAudioMode) stopAudio(shrineBgm);
  }, 500);
}

function playWindGameBgmFromStart() {
  if (!windGameAudioMode) return;
  if (!windGameBgm) return;

  // 這一局已經播放過，就不要重新從頭播
  if (windGameBgmStartedThisRound) return;

  windGameBgmStartedThisRound = true;

  windGameBgm.pause();
  windGameBgm.currentTime = 0;
  windGameBgm.volume = 0.9;
  windGameBgm.loop = true;

  playAudioSafe(windGameBgm);
}

function stopWindGameBgm() {
  stopAudio(windGameBgm);
  windGameBgmStartedThisRound = false;
}

function switchToShrineBgm() {
  windGameAudioMode = false;

  stopWindGameBgm();

  if (shrineBgm) {
    shrineBgm.volume = 1;
    playAudioSafe(shrineBgm);
  }
}

function playWindSlashSound() {
  initWindSlashSoundPool();

  if (!windSlashSoundPool.length) return;

  const audio = windSlashSoundPool[windSlashSoundPoolIndex];
  windSlashSoundPoolIndex =
    (windSlashSoundPoolIndex + 1) % windSlashSoundPool.length;

  try {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0.9;

    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }
  } catch {}
}


let windGameSavedNightMode = false;

function enterWindGamePerformanceMode() {

  // 記住進小遊戲前是不是夜晚模式
  windGameSavedNightMode = document.body.classList.contains("night-mode");

  // 小遊戲期間暫時移除夜晚模式，避免夜間圖層 / 濾鏡 / 轉場影響效能
  document.body.classList.remove("night-mode");

  // 加一個小遊戲專用 class，方便 CSS 關掉不必要效果
  document.body.classList.add("wind-game-active");

  if (typeof setSakuraWindMode === "function") {
  setSakuraWindMode("windGame");
}

}

function exitWindGamePerformanceMode() {
  document.body.classList.remove("wind-game-active");

  if (typeof setSakuraWindMode === "function") {
  setSakuraWindMode("normal");
}

  // 回主選單後，重新依照當下時間判斷日夜
  if (typeof updateDayNightMode === "function") {
    updateDayNightMode();
  } else {
    if (windGameSavedNightMode) {
      document.body.classList.add("night-mode");
    } else {
      document.body.classList.remove("night-mode");
    }
  }

  if (typeof resumeSakuraPetals === "function") {
    resumeSakuraPetals();
  }
}



/* =========================
   Wind Game Preload
========================= */

let windGameAssetsLoaded = false;
let windGameAssetsPromise = null;
let windGameDomWarmedUp = false;

const WIND_GAME_IMAGE_ASSETS = [
  "images/wind-bg-day.jpg",
  "images/wind-bg-night.jpg",

  "images/wind-crane.png",
  "images/wind-chinatsu-up.png",
  "images/wind-chinatsu-down.png",
  "images/wind-chifuyu-idle.png",
  "images/wind-chifuyu-slash.png",
  "images/wind-slash.png",

  "images/wind-sakura-pink.png",
  "images/wind-sakura-gold.png",

  "images/wind-obstacle-top.png",
  "images/wind-obstacle-bottom.png",
  "images/wind-ghost.png",

  "images/wind-btn-attack.png",
  "images/wind-btn-fly.png",
];


function preloadWindImage(src) {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = async () => {
      if (img.decode) {
        try {
          await img.decode();
        } catch {}
      }

      resolve();
    };

    img.onerror = () => {
      console.warn("[WindGame] preload image failed:", src);
      resolve();
    };

    img.src = src;
  });
}

function preloadWindAudio(audio) {
  return new Promise((resolve) => {
    if (!audio) {
      resolve();
      return;
    }

    if (audio.readyState >= 3) {
      resolve();
      return;
    }

    const done = () => {
      audio.removeEventListener("canplaythrough", done);
      audio.removeEventListener("loadeddata", done);
      audio.removeEventListener("error", done);
      resolve();
    };

    audio.addEventListener("canplaythrough", done, { once: true });
    audio.addEventListener("loadeddata", done, { once: true });
    audio.addEventListener("error", done, { once: true });

    audio.load();

    // 避免某些瀏覽器不觸發 canplaythrough，導致拉門一直關著
    setTimeout(done, 2500);
  });
}

async function preloadWindGameAssets() {
  if (windGameAssetsLoaded) return;

  if (windGameAssetsPromise) {
    await windGameAssetsPromise;
    return;
  }



  windGameAssetsPromise = Promise.all([
    ...WIND_GAME_IMAGE_ASSETS.map(preloadWindImage),
    preloadWindAudio(windGameBgm),
    preloadWindAudio(windSlashSound),
  ]);

  await windGameAssetsPromise;

  windGameAssetsLoaded = true;


}


function warmupWindGameDom() {
  if (windGameDomWarmedUp) return;
  windGameDomWarmedUp = true;

  if (typeof initWindSlashSoundPool === "function") {
  initWindSlashSoundPool();
}

  if (typeof initWindSakuraTrail === "function") {
    initWindSakuraTrail();
  }

  if (typeof initWindGoldRoute === "function") {
    initWindGoldRoute();
  }

  if (typeof ensureWindBonusSakuraCount === "function") {
    ensureWindBonusSakuraCount(WIND_BONUS_SAKURA_POOL_SIZE);
  }

  if (typeof ensureWindBonusGoldCount === "function") {
    ensureWindBonusGoldCount(WIND_BONUS_GOLD_POOL_SIZE);
  }

  if (typeof updateWindSakuraTrail === "function") {
    updateWindSakuraTrail();
  }

  if (typeof updateWindGoldRoute === "function") {
    updateWindGoldRoute();
  }

  if (typeof updateWindSakuraBonus === "function") {
    updateWindSakuraBonus();
  }

  if (typeof updateWindBonusGold === "function") {
    updateWindBonusGold();
  }

  if (typeof updateWindGhost === "function") {
    updateWindGhost();
  }
}


function startWindGamePreloadIdle() {
  if (windGameAssetsLoaded && windGameDomWarmedUp) return;

  const run = async () => {
    await preloadWindGameAssets();

    requestAnimationFrame(() => {
      warmupWindGameDom();
    });
  };

  if ("requestIdleCallback" in window) {
    requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 1500);
  }
}




/* =========================
   Wind Game Controls
========================= */

const btnWindAttack = document.getElementById("btnWindAttack");
const btnWindFly = document.getElementById("btnWindFly");

if (windGameScreen) {
  windGameScreen.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  windGameScreen.addEventListener("dragstart", (e) => {
    e.preventDefault();
  });

  windGameScreen.addEventListener("selectstart", (e) => {
    e.preventDefault();
  });
}

document.querySelectorAll("#windGameScreen img").forEach((img) => {
  img.draggable = false;

  img.addEventListener("dragstart", (e) => {
    e.preventDefault();
  });
});

let windFlyPressed = false;

function setWindFlyPressed(pressed) {
  windFlyPressed = pressed;

  if (windGameState !== "playing" && windGameState !== "countdown") return;

  if (windChinatsu) {
    windChinatsu.src = pressed
      ? "images/wind-chinatsu-up.png"
      : "images/wind-chinatsu-down.png";
  }
}

if (btnWindFly) {
  btnWindFly.addEventListener("pointerdown", (e) => {
    e.preventDefault();

    if (btnWindFly.setPointerCapture && e.pointerId !== undefined) {
      try {
        btnWindFly.setPointerCapture(e.pointerId);
      } catch {}
    }

    setWindButtonPressed(btnWindFly, true);
    setWindFlyPressed(true);
  });

  function releaseWindFly(e) {
    if (e) e.preventDefault();

    setWindButtonPressed(btnWindFly, false);
    setWindFlyPressed(false);
  }

  btnWindFly.addEventListener("pointerup", releaseWindFly);
  btnWindFly.addEventListener("pointercancel", releaseWindFly);
  btnWindFly.addEventListener("lostpointercapture", releaseWindFly);

  // 長按時只阻止選單，不要釋放風術
  btnWindFly.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}

if (btnWindAttack) {
  btnWindAttack.addEventListener("pointerdown", (e) => {
    
    handleWindAttackInput(e);
  });

  btnWindAttack.addEventListener("touchstart", (e) => {
    
    handleWindAttackInput(e);
  }, { passive: false });

  btnWindAttack.addEventListener("click", (e) => {
    
    handleWindAttackInput(e);
  });

  btnWindAttack.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}

const WIND_SLASH_SOUND_POOL_SIZE = 4;
let windSlashSoundPool = [];
let windSlashSoundPoolIndex = 0;

function initWindSlashSoundPool() {
  if (!windSlashSound) return;
  if (windSlashSoundPool.length > 0) return;

  windSlashSoundPool = [windSlashSound];

  for (let i = 1; i < WIND_SLASH_SOUND_POOL_SIZE; i++) {
    const clone = windSlashSound.cloneNode(true);
    clone.preload = "auto";
    clone.load();
    windSlashSoundPool.push(clone);
  }
}


const windControls = document.getElementById("windControls");

if (windControls) {
  windControls.addEventListener("pointerdown", (e) => {
    const attackButton = e.target.closest("#btnWindAttack");

    if (!attackButton) return;

    
    handleWindAttackInput(e);
  });

  windControls.addEventListener("touchstart", (e) => {
    const attackButton = e.target.closest("#btnWindAttack");

    if (!attackButton) return;

   
    handleWindAttackInput(e);
  }, { passive: false });
}

function startWindAttack() {
  windAttackActive = true;




  playWindSlashSound();

  if (windAttackTimer) {
    clearTimeout(windAttackTimer);
    windAttackTimer = null;
  }

  if (windChifuyu) {
    windChifuyu.src = "images/wind-chifuyu-slash.png";
  }

  if (windSlash) {
    windSlash.classList.remove(
      "hidden",
      "slash-active",
      "slash-active-a",
      "slash-active-b"
    );

    windSlashAnimToggle = !windSlashAnimToggle;

    requestAnimationFrame(() => {
      if (!windSlash) return;
      if (!windAttackActive) return;

      windSlash.classList.add(
        windSlashAnimToggle ? "slash-active-a" : "slash-active-b"
      );
    });
  }

  windAttackTimer = setTimeout(() => {
    endWindAttack();
  }, 280);
}

function endWindAttack() {
  windAttackActive = false;
  windAttackQueued = false;

  if (windAttackTimer) {
    clearTimeout(windAttackTimer);
    windAttackTimer = null;
  }

  if (windChifuyu) {
    windChifuyu.src = "images/wind-chifuyu-idle.png";
  }

  if (windSlash) {
    windSlash.classList.remove(
      "slash-active",
      "slash-active-a",
      "slash-active-b"
    );
    windSlash.classList.add("hidden");
  }
}



let windAttackActive = false;
let windAttackTimer = null;
let windGhostRespawnTimer = null;
let windSlashAnimToggle = false;
let windAttackQueued = false;

let windAttackButtonFeedbackTimer = null;

const WIND_GHOST_DEFEAT_SCORE = 10;

function setWindButtonPressed(button, pressed) {
  if (!button) return;

  const img = button.querySelector("img");

  if (pressed) {
    button.classList.add("is-pressed");

    // 直接改圖片本體，避免某些瀏覽器對 button transform 反應不明顯
    if (img) {
      img.style.transform = "scale(0.82)";
      img.style.filter = "brightness(0.82)";
      img.style.opacity = "0.88";
    }
  } else {
    button.classList.remove("is-pressed");

    if (img) {
      img.style.transform = "";
      img.style.filter = "";
      img.style.opacity = "";
    }
  }
}

function showWindAttackButtonFeedback() {
  if (!btnWindAttack) return;

  setWindButtonPressed(btnWindAttack, true);

  if (windAttackButtonFeedbackTimer) {
    clearTimeout(windAttackButtonFeedbackTimer);
    windAttackButtonFeedbackTimer = null;
  }

  // 攻擊是點按型，所以至少保留一小段按下效果
  windAttackButtonFeedbackTimer = setTimeout(() => {
    setWindButtonPressed(btnWindAttack, false);
    windAttackButtonFeedbackTimer = null;
  }, 160);
}

function handleWindAttackInput(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  showWindAttackButtonFeedback();

if (windGameState === "countdown") {
  // 倒數中只顯示按鈕反饋，不預約攻擊
  return;
}

  // 遊戲中才真的攻擊
  if (windGameState !== "playing") return;
  if (windAttackActive) return;

  startWindAttack();
}

function releaseAllWindButtons(options = {}) {
  const forceAttack = options.forceAttack === true;

  // 飛行鍵是長按型，pointerup 時要立刻放開
  setWindButtonPressed(btnWindFly, false);
  setWindFlyPressed(false);

  // 攻擊鍵是點按型，平常不要被 pointerup 立刻清掉
  // 讓 showWindAttackButtonFeedback() 的 120ms timer 自己處理
  if (forceAttack) {
    if (windAttackButtonFeedbackTimer) {
      clearTimeout(windAttackButtonFeedbackTimer);
      windAttackButtonFeedbackTimer = null;
    }

    setWindButtonPressed(btnWindAttack, false);
  }
}



window.addEventListener("pointerup", () => {
  // 一般放開手指時，只立刻放開飛行鍵
  // 攻擊鍵反饋交給 120ms timer
  releaseAllWindButtons({ forceAttack: false });
});

window.addEventListener("blur", () => {
  // 離開視窗時才強制清掉所有按鈕
  releaseAllWindButtons({ forceAttack: true });
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // 切到背景時才強制清掉所有按鈕
    releaseAllWindButtons({ forceAttack: true });
  }
});
/* =========================
   Wind Game Physics
========================= */

let windPlayerY = 0;
let windPlayerVY = 0;
let windLastTime = 0;
let windAnimFrame = null;

// 倒數時的原地漂浮效果，只影響視覺，不影響碰撞
let windPlayerFloatY = 0;
let windPlayerFloatFrame = null;
let windPlayerFloatStartTime = 0;

const WIND_PLAYER_FLOAT_AMPLITUDE = 18; // 漂浮高度，數字越大上下幅度越明顯
const WIND_PLAYER_FLOAT_SPEED = 0.004;  // 漂浮速度，數字越大越快

// 角色飛行傾斜角度
let windPlayerTilt = 0;

const WIND_PLAYER_TILT_MAX = 8;        // 最大傾斜角度
const WIND_PLAYER_TILT_FACTOR = 0.012; // 速度轉角度的比例
const WIND_PLAYER_TILT_SMOOTH = 0.16;  // 越大越靈敏，越小越柔和

const WIND_GRAVITY = 1800;       // 下墜力量，數字越大掉越快
const WIND_FLY_FORCE = 2600;     // 按住飛行時的上升力量
const WIND_MAX_UP_SPEED = -850;  // 最大上升速度
const WIND_MAX_DOWN_SPEED = 950; // 最大下墜速度

const WIND_TOP_LIMIT = -520;     // 往上最多偏移多少，先限制不死亡
const WIND_BOTTOM_LIMIT = 720;   // 往下偏移多少後 Game Over
const WIND_PLAYER_BASE_X = 50;
const WIND_PLAYER_BASE_Y = 800;
const WIND_PLAYER_W = 440;
const WIND_PLAYER_H = 289;

function applyWindPlayerPosition() {
  if (!windPlayer) return;

  const visualY = windPlayerY + windPlayerFloatY;
  windPlayer.style.transform = `translateY(${visualY}px)`;
}

function startWindPlayerCountdownFloat() {
  stopWindPlayerCountdownFloat(false);

  windPlayerFloatStartTime = performance.now();

  function floatLoop(now) {
    if (windGameState !== "countdown") {
      stopWindPlayerCountdownFloat(true);
      return;
    }

    const t = now - windPlayerFloatStartTime;

    // 用 sin 做柔和上下漂浮
    windPlayerFloatY =
      Math.sin(t * WIND_PLAYER_FLOAT_SPEED) * WIND_PLAYER_FLOAT_AMPLITUDE;

    applyWindPlayerPosition();

    windPlayerFloatFrame = requestAnimationFrame(floatLoop);
  }

  windPlayerFloatFrame = requestAnimationFrame(floatLoop);
}

function stopWindPlayerCountdownFloat(resetPosition = true) {
  if (windPlayerFloatFrame) {
    cancelAnimationFrame(windPlayerFloatFrame);
    windPlayerFloatFrame = null;
  }

  if (resetPosition) {
    windPlayerFloatY = 0;
    applyWindPlayerPosition();
  }
}

function clampWindTilt(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function applyWindPlayerTilt() {
  const targetTilt = clampWindTilt(
    windPlayerVY * WIND_PLAYER_TILT_FACTOR,
    -WIND_PLAYER_TILT_MAX,
    WIND_PLAYER_TILT_MAX
  );

  // 平滑靠近目標角度，避免上下切換時太抖
  windPlayerTilt += (targetTilt - windPlayerTilt) * WIND_PLAYER_TILT_SMOOTH;

  const transform = `rotate(${windPlayerTilt}deg)`;

  // 只旋轉角色本體，不旋轉 slash
  if (windCrane) windCrane.style.transform = transform;
  if (windChinatsu) windChinatsu.style.transform = transform;
  if (windChifuyu) windChifuyu.style.transform = transform;
}

function resetWindPlayerTilt() {
  windPlayerTilt = 0;

  if (windCrane) windCrane.style.transform = "";
  if (windChinatsu) windChinatsu.style.transform = "";
  if (windChifuyu) windChifuyu.style.transform = "";
}

function startWindGameLoop() {
  if (windAnimFrame) {
    cancelAnimationFrame(windAnimFrame);
    windAnimFrame = null;
  }

  windLastTime = performance.now();

  function loop(now) {
    if (windGameState !== "playing") {
      windAnimFrame = null;
      return;
    }

    let dt = (now - windLastTime) / 1000;
windLastTime = now;

// 避免切到背景或超大卡頓時瞬移，但不要卡得太死
dt = Math.min(dt, 0.08);

  updateWindPlayerPhysics(dt);
  applyWindPlayerTilt();
updateWindObstacle(dt);
updateWindSakuraTrail();
updateWindGoldRoute();
updateWindBonus(dt);
updateWindBonusGold();
updateWindGhostMovement(dt);

applyWindPlayerPosition();

updateWindCollectiblesCollision();
updateWindObstacleCollision();

updateWindSlashGhostCollision();
updateWindGhostCollision();

updateWindDebugHitboxes();

windAnimFrame = requestAnimationFrame(loop);
  }

  windAnimFrame = requestAnimationFrame(loop);
}



function updateWindPlayerPhysics(dt) {
  if (windFlyPressed) {
    windPlayerVY -= WIND_FLY_FORCE * dt;

    if (windChinatsu) {
      windChinatsu.src = "images/wind-chinatsu-up.png";
    }
  } else {
    windPlayerVY += WIND_GRAVITY * dt;

    if (windChinatsu) {
      windChinatsu.src = "images/wind-chinatsu-down.png";
    }
  }

  if (windPlayerVY < WIND_MAX_UP_SPEED) {
    windPlayerVY = WIND_MAX_UP_SPEED;
  }

  if (windPlayerVY > WIND_MAX_DOWN_SPEED) {
    windPlayerVY = WIND_MAX_DOWN_SPEED;
  }

  windPlayerY += windPlayerVY * dt;

  // 上方先不死亡，只限制高度
  if (windPlayerY < WIND_TOP_LIMIT) {
    windPlayerY = WIND_TOP_LIMIT;
    windPlayerVY = 0;
  }

  // 下方摔落
  if (windPlayerY > WIND_BOTTOM_LIMIT) {
    windPlayerY = WIND_BOTTOM_LIMIT;
    applyWindPlayerPosition();
    windGameOver();
  }
}





function windGameOver() {
  if (windGameState === "gameover") return;

  setWindGameState("gameover");

  stopWindGameBgm();

  if (windAnimFrame) {
    cancelAnimationFrame(windAnimFrame);
    windAnimFrame = null;

    if (windAttackButtonFeedbackTimer) {
  clearTimeout(windAttackButtonFeedbackTimer);
  windAttackButtonFeedbackTimer = null;
}

setWindButtonPressed(btnWindAttack, false);
  }

  windFlyPressed = false;

  windAttackActive = false;

  windAttackQueued = false;

  windGhostNeedsRespawnAfterPause = false;

if (windAttackTimer) {
  clearTimeout(windAttackTimer);
  windAttackTimer = null;
}

if (windGhostRespawnTimer) {
  clearTimeout(windGhostRespawnTimer);
  windGhostRespawnTimer = null;
}

if (windSlash) {
windSlash.classList.remove(
  "slash-active",
  "slash-active-a",
  "slash-active-b"
);
windSlash.classList.add("hidden");
}

  if (windChinatsu) {
    windChinatsu.src = "images/wind-chinatsu-down.png";
  }

  clearWindCountdown();
hideWindPauseOverlay();
showWindResultPanel();

 
}






/* =========================
   Wind Game State + Countdown
========================= */

const windCountdown = document.getElementById("windCountdown");

let windGameState = "idle";
// idle      尚未開始
// countdown 倒數中
// playing   遊戲中
// gameover  結束

let windCountdownTimer = null;

function setWindGameState(nextState) {
  windGameState = nextState;

  updateWindPauseButtonIcon();
}

const WIND_PAUSE_ICON = "images/ui-btn-pause.png";
const WIND_RESUME_ICON = "images/ui-btn-resume.png";

let windGhostNeedsRespawnAfterPause = false;

function updateWindPauseButtonIcon() {
  if (!btnWindGameMenu) return;

  const img = btnWindGameMenu.querySelector("img");
  if (!img) return;

  if (windGameState === "paused") {
    img.src = WIND_RESUME_ICON;
    img.alt = "Resume";
    btnWindGameMenu.setAttribute("aria-label", "Resume");
  } else {
    img.src = WIND_PAUSE_ICON;
    img.alt = "Pause";
    btnWindGameMenu.setAttribute("aria-label", "Pause");
  }
}

function showWindPauseOverlay() {
  if (!windPauseOverlay) return;

  windPauseOverlay.classList.remove("hidden");
}

function hideWindPauseOverlay() {
  if (!windPauseOverlay) return;

  windPauseOverlay.classList.add("hidden");
}


function pauseWindGame() {
  if (windGameState !== "playing") return;

  setWindGameState("paused");
  showWindPauseOverlay();

  if (windAnimFrame) {
    cancelAnimationFrame(windAnimFrame);
    windAnimFrame = null;
  }

  // 暫停 BGM，不歸零，Resume 時接著播
  pauseAudio(windGameBgm);

  // 放開所有操作鍵，避免恢復時仍保持上升
  releaseAllWindButtons({ forceAttack: true });

  // 如果剛好正在攻擊，先收掉劍氣與攻擊差分
  if (windAttackActive || windAttackTimer) {
    endWindAttack();
  }

  // 如果怪物剛被擊倒、正在等重生，暫停期間先停掉重生 timer
  if (windGhostRespawnTimer) {
    clearTimeout(windGhostRespawnTimer);
    windGhostRespawnTimer = null;
    windGhostNeedsRespawnAfterPause = !windGhostActive;
  }
}

function resumeWindGame() {
  if (windGameState !== "paused") return;

  hideWindPauseOverlay();
  hideWindResultPanel();

  setWindGameState("playing");

  // 接著播放小遊戲 BGM，不從頭播放
  if (windGameAudioMode && windGameBgm) {
    playAudioSafe(windGameBgm);
  }

  // 避免暫停時間被算進 dt，導致 Resume 瞬移
  windLastTime = performance.now();

  startWindGameLoop();

  // 如果暫停前怪物正在等待重生，恢復後再重新安排重生
  if (windGhostNeedsRespawnAfterPause && !windGhostActive) {
    windGhostNeedsRespawnAfterPause = false;

    windGhostRespawnTimer = setTimeout(() => {
      if (windGameState !== "playing") return;
      resetWindGhost();
    }, 500);
  }
}

function toggleWindGamePause(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (windGameState === "playing") {
    pauseWindGame();
    return;
  }

  if (windGameState === "paused") {
    resumeWindGame();
  }
}

function clearWindCountdown() {
  if (windCountdownTimer) {
    clearTimeout(windCountdownTimer);
    windCountdownTimer = null;
  }

  if (windCountdown) {
    windCountdown.classList.add("hidden");
    windCountdown.classList.remove("countdown-pop");
    windCountdown.textContent = "";
  }
}

function showWindCountdownText(text) {
  if (!windCountdown) return;

  windCountdown.textContent = text;

  windCountdown.classList.remove("countdown-pop");
  windCountdown.classList.remove("hidden");

  // 重新觸發動畫
  void windCountdown.offsetWidth;

  windCountdown.classList.add("countdown-pop");
}

function startWindCountdown() {
  clearWindCountdown();
  setWindGameState("countdown");

  startWindPlayerCountdownFloat();

  const steps = ["3", "2", "1", "Start"];
  let index = 0;

  function nextStep() {
    if (index >= steps.length) {
      clearWindCountdown();
      startWindPlaying();
      return;
    }

    const currentStep = steps[index];

    showWindCountdownText(currentStep);

    if (currentStep === "2") {
      playWindGameBgmFromStart();
    }

    index += 1;

    windCountdownTimer = setTimeout(nextStep, 1000);
  }

  nextStep();
}

function startWindPlaying() {
  setWindGameState("playing");

  stopWindPlayerCountdownFloat(true);

  playWindGameBgmFromStart();

  stopWindPlayerCountdownFloat(true);

windPlayerY = 0;
windPlayerVY = 0;
windLastTime = 0;
windPlayerFloatY = 0;
applyWindPlayerPosition();

  startWindGameLoop();
}



function getRandomWindObstaclePattern() {
  const currentPattern = windCurrentObstaclePattern;

  const candidates = WIND_OBSTACLE_PATTERNS.filter((pattern) => {
    return pattern !== currentPattern;
  });

  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}


function getRandomWindBonusFormation() {
  const currentFormation = windCurrentBonusFormation;

  const candidates = WIND_BONUS_FORMATION_ORDER.filter((formation) => {
    return formation !== currentFormation;
  });

  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}



/* =========================
   Wind Game Obstacles
========================= */

const windObstacleGroup = document.getElementById("windObstacleGroup");
const windObstacleTop = document.getElementById("windObstacleTop");
const windObstacleBottom = document.getElementById("windObstacleBottom");

let windObstacleX = 1180;
let windObstaclePatternIndex = 0;

const WIND_OBSTACLE_START_X = 2600;
const WIND_OBSTACLE_RESET_X = 2600;
const WIND_OBSTACLE_END_X = -320;

/*
  速度之後一定會調。
  先用 360，讓障礙物不會太快。
*/
const WIND_OBSTACLE_SPEED = 700;

/*
  三種障礙 pattern：
  middle：中開口，上下都有障礙
  upper：上開口，只有下方障礙
  lower：下開口，只有上方障礙
*/
let windCurrentObstaclePattern = "middle";
const WIND_OBSTACLE_PATTERNS = ["middle", "upper", "lower"];

const WIND_MIDDLE_GAP_TOP = 900;
const WIND_MIDDLE_GAP_HEIGHT = 50;

const WIND_UPPER_OBSTACLE_TOP = 750;
const WIND_LOWER_OBSTACLE_BOTTOM = 1200;

function applyWindObstaclePattern(pattern) {
  if (!windObstacleTop || !windObstacleBottom) return;

  // 記住目前是哪一種障礙物組合，給粉櫻花路線使用
  windCurrentObstaclePattern = pattern;

  const obstacleH = 1200;

  // 中開口：上下都有障礙物
  const middleGapTop = WIND_MIDDLE_GAP_TOP;
  const middleGapHeight = WIND_MIDDLE_GAP_HEIGHT;
  const middleGapBottom = middleGapTop + middleGapHeight;

  // 上開口：只有下方障礙物
  const upperObstacleTop = WIND_UPPER_OBSTACLE_TOP;

  // 下開口：只有上方障礙物
  const lowerObstacleBottom = WIND_LOWER_OBSTACLE_BOTTOM;

  if (pattern === "middle") {
    windObstacleTop.style.display = "block";
    windObstacleBottom.style.display = "block";

    windObstacleTop.style.top = `${middleGapTop - obstacleH}px`;
    windObstacleBottom.style.top = `${middleGapBottom}px`;
  }

  if (pattern === "upper") {
    windObstacleTop.style.display = "none";
    windObstacleBottom.style.display = "block";

    windObstacleBottom.style.top = `${upperObstacleTop}px`;
  }

  if (pattern === "lower") {
    windObstacleTop.style.display = "block";
    windObstacleBottom.style.display = "none";

    windObstacleTop.style.top = `${lowerObstacleBottom - obstacleH}px`;
  }
}

function resetWindObstacle() {
  windObstacleX = WIND_OBSTACLE_START_X;
  windObstaclePatternIndex = 0;

  windBonusX = WIND_BONUS_START_X;
  windBonusFormationIndex = 0;

  applyWindObstaclePattern(WIND_OBSTACLE_PATTERNS[windObstaclePatternIndex]);
  applyWindObstaclePosition();

  applyWindBonusFormation(WIND_BONUS_FORMATION_ORDER[windBonusFormationIndex]);

  resetWindRouteCollection();
  resetWindBonusCollection();

  // 初始化時只更新一次位置，避免空畫面
  updateWindSakuraTrail();
  updateWindGoldRoute();
  updateWindSakuraBonus();
  updateWindBonusGold();
}



function applyWindObstaclePosition() {
  if (!windObstacleGroup) return;
  windObstacleGroup.style.transform = `translateX(${windObstacleX}px)`;
}

function updateWindObstacle(dt) {
  if (!windObstacleGroup) return;

  windObstacleX -= WIND_OBSTACLE_SPEED * dt;

  if (windObstacleX < WIND_OBSTACLE_END_X) {
    windObstacleX = WIND_OBSTACLE_RESET_X;

    const nextPattern = getRandomWindObstaclePattern();
    const nextFormation = getRandomWindBonusFormation();

    applyWindObstaclePattern(nextPattern);
    applyWindBonusFormation(nextFormation);

    windBonusX = WIND_BONUS_START_X;

    resetWindRouteCollection();
    resetWindBonusCollection();

    // 不在這裡 update 櫻花 / bonus / gold
    // 讓主 loop 後面的 updateWindSakuraTrail / updateWindBonus 統一處理
  }

  applyWindObstaclePosition();
}

/* =========================
   Wind Game Sakura Trail
========================= */

const windSakuraTrail = document.getElementById("windSakuraTrail");

const WIND_ROUTE_SAKURA_COUNT = 8;
const WIND_ROUTE_SAKURA_SRC = "images/wind-sakura-pink.png";

/*
  這些是相對於障礙物左側的 X 位置。
  負數代表在障礙物前方，讓玩家先看到引導線。
*/
const WIND_ROUTE_LOCAL_XS = [-240, -140, -40, 60, 160, 260, 360, 460];

let windRouteSakuraEls = [];

function initWindSakuraTrail() {
  if (!windSakuraTrail) return;

  if (windRouteSakuraEls.length > 0) return;

  for (let i = 0; i < WIND_ROUTE_SAKURA_COUNT; i++) {
    const img = document.createElement("img");
    img.src = WIND_ROUTE_SAKURA_SRC;
    img.className = "wind-route-sakura";
    img.alt = "";

    windSakuraTrail.appendChild(img);
    windRouteSakuraEls.push(img);
  }
}

function windRouteEase(t) {
  return t * t * (3 - 2 * t);
}

function getWindSakuraTargetY(pattern) {
  if (pattern === "middle") {
    return WIND_MIDDLE_GAP_TOP + WIND_MIDDLE_GAP_HEIGHT / 2;
  }

  if (pattern === "upper") {
    // 下方障礙物從 750 開始，所以引導玩家往上方空間
    return WIND_UPPER_OBSTACLE_TOP - 230;
  }

  if (pattern === "lower") {
    // 上方障礙物到 1200，所以引導玩家往下方空間
    return WIND_LOWER_OBSTACLE_BOTTOM + 230;
  }

  return 960;
}

function getWindSakuraY(pattern, index) {
  const t = WIND_ROUTE_SAKURA_COUNT <= 1
    ? 1
    : index / (WIND_ROUTE_SAKURA_COUNT - 1);

  const eased = windRouteEase(t);

  /*
    起點先抓接近畫面中央的高度。
    後面逐漸往該 pattern 的通過區域靠近。
  */
  const startY = 940;
  const targetY = getWindSakuraTargetY(pattern);

  return startY + (targetY - startY) * eased;
}

function updateWindSakuraTrail() {
  if (!windSakuraTrail) return;

  initWindSakuraTrail();

  const pattern = windCurrentObstaclePattern || "middle";

  for (let i = 0; i < windRouteSakuraEls.length; i++) {
    const el = windRouteSakuraEls[i];
    if (!el) continue;

    // 已經被吃掉的櫻花，維持隱藏
    if (windRouteSakuraCollected[i] === true) {
      el.style.display = "none";
      continue;
    }

    const localX = WIND_ROUTE_LOCAL_XS[i] ?? 0;
    const x = windObstacleX + localX;
    const y = getWindSakuraY(pattern, i);

    // 沒被吃掉的櫻花，重設顯示
   el.style.display = "block";
setWindElementPosition(el, x, y);
  }
}

/* =========================
   Wind Game Bonus Sakura Formations
========================= */

const windSakuraBonus = document.getElementById("windSakuraBonus");

const WIND_BONUS_SAKURA_SRC = "images/wind-sakura-pink.png";

let windBonusSakuraEls = [];
let windCurrentBonusFormation = "rectangle";
let windBonusFormationIndex = 0;

const WIND_BONUS_PHASE_OFFSET = 1000;

let windBonusX = WIND_OBSTACLE_START_X - WIND_BONUS_PHASE_OFFSET;

const WIND_BONUS_START_X = WIND_OBSTACLE_START_X - WIND_BONUS_PHASE_OFFSET;
const WIND_BONUS_END_X = WIND_OBSTACLE_END_X;
const WIND_BONUS_SPEED = WIND_OBSTACLE_SPEED;


const WIND_BONUS_FORMATIONS = {
  rectangle: [
    // 上排
    { x: 0, y: 700 },
    { x: 120, y: 700 },
    { x: 240, y: 700 },
    { x: 360, y: 700 },

    // 下排
    { x: 0, y: 1040 },
    { x: 120, y: 1040 },
    { x: 240, y: 1040 },
    { x: 360, y: 1040 },
  ],

  diamond: [
    // 較大的菱形輪廓，中心留給金櫻花
    { x: 180, y: 560 },

    { x: 60, y: 680 },
    { x: 300, y: 680 },

    { x: -60, y: 800 },
    { x: 420, y: 800 },

    { x: -60, y: 940 },
    { x: 420, y: 940 },

    { x: 60, y: 1060 },
    { x: 300, y: 1060 },

    { x: 180, y: 1180 },
  ],

  verticalLine: [
    // 名稱先沿用 verticalLine，避免其他程式碼要跟著改
    // 實際圖形改成金字塔：頂端留給金櫻花，不放粉櫻花

    // 第二層
    { x: 120, y: 800 },
    { x: 240, y: 800 },

    // 第三層
    { x: 60, y: 920 },
    { x: 180, y: 920 },
    { x: 300, y: 920 },

    // 第四層
    { x: 0, y: 1040 },
    { x: 120, y: 1040 },
    { x: 240, y: 1040 },
    { x: 360, y: 1040 },
  ],
};

const WIND_BONUS_FORMATION_ORDER = [
  "rectangle",
  "diamond",
  "verticalLine",
];

const WIND_BONUS_SAKURA_POOL_SIZE = Math.max(
  ...Object.values(WIND_BONUS_FORMATIONS).map((points) => points.length)
);

function ensureWindBonusSakuraCount(count) {
  if (!windSakuraBonus) return;

  while (windBonusSakuraEls.length < count) {
    const img = document.createElement("img");
    img.src = WIND_BONUS_SAKURA_SRC;
    img.className = "wind-bonus-sakura";
    img.alt = "";

    windSakuraBonus.appendChild(img);
    windBonusSakuraEls.push(img);
  }

  for (let i = 0; i < windBonusSakuraEls.length; i++) {
    windBonusSakuraEls[i].style.display = i < count ? "block" : "none";
  }
}


function applyWindBonusFormation(name) {
  windCurrentBonusFormation = name;

  // 一次確保 bonus 櫻花池已經建到最大數量
  // 之後切 formation 時就不會臨時 createElement
  ensureWindBonusSakuraCount(WIND_BONUS_SAKURA_POOL_SIZE);
}
function updateWindSakuraBonus() {
  if (!windSakuraBonus) return;

  const points = WIND_BONUS_FORMATIONS[windCurrentBonusFormation] || [];

  for (let i = 0; i < windBonusSakuraEls.length; i++) {
    const el = windBonusSakuraEls[i];
    const point = points[i];

    if (!el) continue;

    if (!point) {
      if (el.style.display !== "none") el.style.display = "none";
      continue;
    }

    if (windBonusSakuraCollected[i] === true) {
      if (el.style.display !== "none") el.style.display = "none";
      continue;
    }

    const x = windBonusX + point.x;
    const y = point.y;

    if (el.style.display !== "block") el.style.display = "block";
    setWindElementPosition(el, x, y);
  }
}

function updateWindBonus(dt) {
  windBonusX -= WIND_BONUS_SPEED * dt;

  updateWindSakuraBonus();
}


const WIND_OBSTACLE_MID_X =
  (WIND_OBSTACLE_START_X + WIND_OBSTACLE_END_X) / 2;



/* =========================
   Wind Game Gold Route Sakura
========================= */

const windGoldRoute = document.getElementById("windGoldRoute");

const WIND_GOLD_ROUTE_SRC = "images/wind-sakura-gold.png";

let windGoldRouteEl = null;

/*
  金櫻花比粉櫻花更靠近障礙物。
*/
const WIND_GOLD_ROUTE_LOCAL_X = 120;

/*
  中開口金櫻花的位置：
  放在開口上半部，靠近上方障礙物，但不要貼到障礙物。
*/
const WIND_GOLD_MIDDLE_Y_OFFSET = 160;


function initWindGoldRoute() {
  if (!windGoldRoute) return;
  if (windGoldRouteEl) return;

  const img = document.createElement("img");
  img.src = WIND_GOLD_ROUTE_SRC;
  img.className = "wind-route-gold";
  img.alt = "";

  windGoldRoute.appendChild(img);
  windGoldRouteEl = img;
}

function updateWindGoldRoute() {
  if (!windGoldRoute) return;

  initWindGoldRoute();

  if (!windGoldRouteEl) return;

  /*
    只在中開口出現。
    上開口、下開口直接隱藏。
  */
  if (windCurrentObstaclePattern !== "middle") {
    windGoldRouteEl.style.display = "none";
    return;
  }

if (windGoldRouteCollected) {
  windGoldRouteEl.style.display = "none";
  return;
}

  /*
    如果你有加 WIND_ROUTE_X_OFFSET，金櫻花也跟著吃同一個偏移。
    沒有的話就自動當 0。
  */
  const routeOffset =
    typeof WIND_ROUTE_X_OFFSET !== "undefined"
      ? WIND_ROUTE_X_OFFSET
      : 0;

  const x = windObstacleX + WIND_GOLD_ROUTE_LOCAL_X + routeOffset;

  /*
    目前中開口是 900～950。
    中心是 925。
    金櫻花放在上半部，也就是 y = 914 左右。
  */
  const middleCenterY =
    WIND_MIDDLE_GAP_TOP + WIND_MIDDLE_GAP_HEIGHT / 2;

  const y = middleCenterY - WIND_GOLD_MIDDLE_Y_OFFSET;

  windGoldRouteEl.style.display = "block";
setWindElementPosition(windGoldRouteEl, x, y);
}


/* =========================
   Wind Game Bonus Gold Sakura
========================= */

const windBonusGold = document.getElementById("windBonusGold");

const WIND_BONUS_GOLD_SRC = "images/wind-sakura-gold.png";

let windBonusGoldEls = [];

const WIND_BONUS_GOLD_POINTS = {
  rectangle: [
    // 兩排粉櫻花正中央
    { x: 180, y: 870 },
  ],

  diamond: [
    // 菱形正中央
    { x: 180, y: 870 },
  ],

  verticalLine: [
    // 金字塔頂端
    { x: 180, y: 680 },
  ],
};

const WIND_BONUS_GOLD_POOL_SIZE = Math.max(
  ...Object.values(WIND_BONUS_GOLD_POINTS).map((points) => points.length)
);

function ensureWindBonusGoldCount(count) {
  if (!windBonusGold) return;

  while (windBonusGoldEls.length < count) {
    const img = document.createElement("img");
    img.src = WIND_BONUS_GOLD_SRC;
    img.className = "wind-bonus-gold";
    img.alt = "";

    windBonusGold.appendChild(img);
    windBonusGoldEls.push(img);
  }

  for (let i = 0; i < windBonusGoldEls.length; i++) {
    windBonusGoldEls[i].style.display = i < count ? "block" : "none";
  }
}


function updateWindBonusGold() {
  if (!windBonusGold) return;

  const points = WIND_BONUS_GOLD_POINTS[windCurrentBonusFormation] || [];

  for (let i = 0; i < windBonusGoldEls.length; i++) {
    const el = windBonusGoldEls[i];
    const point = points[i];

    if (!el) continue;

    if (!point) {
      if (el.style.display !== "none") el.style.display = "none";
      continue;
    }

    if (windBonusGoldCollected[i] === true) {
      if (el.style.display !== "none") el.style.display = "none";
      continue;
    }

    const x = windBonusX + point.x;
    const y = point.y;

    if (el.style.display !== "block") el.style.display = "block";
    setWindElementPosition(el, x, y);
  }
}


/* =========================
   Wind Game Ghost
========================= */


function getRandomWindGhostSpeed() {
  return (
    WIND_GHOST_SPEED_MIN +
    Math.random() * (WIND_GHOST_SPEED_MAX - WIND_GHOST_SPEED_MIN)
  );
}

const windGhost = document.getElementById("windGhost");

let windGhostX = 1600;
let windGhostY = 960;
let windGhostActive = false;

const WIND_GHOST_START_X = 1500;
const WIND_GHOST_END_X = -180;
const WIND_GHOST_SPEED_MIN = 520;
const WIND_GHOST_SPEED_MAX = 820;

const WIND_GHOST_W = 300;
const WIND_GHOST_H = 300;

let windGhostSpeed = 620;

const WIND_GHOST_Y_LIST = [
  560,
  720,
  880,
  1040,
  1200,
  1360,
];


function resetWindGhost() {
  windGhostX = WIND_GHOST_START_X;
  windGhostActive = true;

  const index = Math.floor(Math.random() * WIND_GHOST_Y_LIST.length);
  windGhostY = WIND_GHOST_Y_LIST[index];

  windGhostSpeed = getRandomWindGhostSpeed();

  updateWindGhost();
}

function updateWindGhost() {
  if (!windGhost) return;

  if (!windGhostActive) {
    windGhost.classList.add("hidden");
    return;
  }

  windGhost.classList.remove("hidden");
  windGhost.classList.remove("ghost-defeated");

  // 改用 transform 移動，不再每幀寫 left/top
  setWindElementPosition(windGhost, windGhostX, windGhostY);
}


function updateWindGhostMovement(dt) {
  if (!windGhostActive) return;

  windGhostX -= windGhostSpeed * dt;

  if (windGhostX < WIND_GHOST_END_X) {
    resetWindGhost();
    return;
  }

  updateWindGhost();
}

function defeatWindGhost() {
  if (!windGhostActive) return;

  windGhostActive = false;

  if (windGhost) {
    // 原地淡出
    windGhost.classList.add("ghost-defeated");

    setTimeout(() => {
      windGhost.classList.add("hidden");

      // 注意：這裡不要 remove ghost-defeated
      // 等下一次 resetWindGhost() → updateWindGhost() 時再移除
    }, 160);
  }

  addWindScore(WIND_GHOST_DEFEAT_SCORE);

  if (windGhostRespawnTimer) {
    clearTimeout(windGhostRespawnTimer);
    windGhostRespawnTimer = null;
  }

  windGhostRespawnTimer = setTimeout(() => {
    if (windGameState !== "playing") return;

    resetWindGhost();
  }, 700);
}



/* =========================
   Wind Game Collectibles
========================= */

function setWindElementPosition(el, x, y) {
  if (!el) return;

  el.dataset.windX = String(x);
  el.dataset.windY = String(y);

  el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
}

function getWindLogicalElementRect(el, width, height) {
  if (!el) return null;

  const x = Number(el.dataset.windX);
  const y = Number(el.dataset.windY);

  if (Number.isNaN(x) || Number.isNaN(y)) return null;

  return {
    x: x - width / 2,
    y: y - height / 2,
    w: width,
    h: height,
  };
}

let windRouteSakuraCollected = [];
let windGoldRouteCollected = false;

let windBonusSakuraCollected = [];
let windBonusGoldCollected = [];

function resetWindRouteCollection() {
  windRouteSakuraCollected = new Array(WIND_ROUTE_SAKURA_COUNT).fill(false);
  windGoldRouteCollected = false;
}

function resetWindBonusCollection() {
  const bonusPoints =
    WIND_BONUS_FORMATIONS[windCurrentBonusFormation] || [];

  const bonusGoldPoints =
    typeof WIND_BONUS_GOLD_POINTS !== "undefined"
      ? (WIND_BONUS_GOLD_POINTS[windCurrentBonusFormation] || [])
      : [];

  windBonusSakuraCollected = new Array(bonusPoints.length).fill(false);
  windBonusGoldCollected = new Array(bonusGoldPoints.length).fill(false);
}


function isWindRectOverlap(a, b) {
  if (!a || !b) return false;

  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function isWindXNearPlayer(x, playerRect, margin = 240) {
  if (!playerRect) return false;

  const itemX = Number(x);

  // 如果拿不到數字，保守一點，不跳過碰撞判定
  if (Number.isNaN(itemX)) return true;

  return (
    itemX > playerRect.x - margin &&
    itemX < playerRect.x + playerRect.w + margin
  );
}

function getWindPlayerHitboxRect() {
  return insetWindRect(
    {
      x: WIND_PLAYER_BASE_X,
      y: WIND_PLAYER_BASE_Y + windPlayerY,
      w: WIND_PLAYER_W,
      h: WIND_PLAYER_H,
    },
    WIND_HITBOX_INSET.player
  );
}

function getWindSakuraHitboxRect(el) {
  return insetWindRect(
    getWindLogicalElementRect(el, 58, 58),
    WIND_HITBOX_INSET.sakura
  );
}

function getWindGoldHitboxRect(el) {
  const size = el && el.classList.contains("wind-bonus-gold")
    ? 86
    : 78;

  return insetWindRect(
    getWindLogicalElementRect(el, size, size),
    WIND_HITBOX_INSET.gold
  );
}

function getWindSlashHitboxRect() {
  if (!windAttackActive) return null;
  if (!windSlash || windSlash.classList.contains("hidden")) return null;

  return insetWindRect(
    getWindElementGameRect(windSlash),
    WIND_HITBOX_INSET.slash
  );
}

function getWindGhostHitboxRect() {
  if (!windGhostActive) return null;
  if (!windGhost || windGhost.classList.contains("hidden")) return null;

  return insetWindRect(
    {
      x: windGhostX - WIND_GHOST_W / 2,
      y: windGhostY - WIND_GHOST_H / 2,
      w: WIND_GHOST_W,
      h: WIND_GHOST_H,
    },
    WIND_HITBOX_INSET.ghost
  );
}



function getWindObstacleHitboxRects() {
  const rects = [];

  if (windObstacleTop && windObstacleTop.style.display !== "none") {
    const topRect = insetWindRect(
      getWindElementGameRect(windObstacleTop),
      WIND_HITBOX_INSET.obstacleTop
    );

    if (topRect) {
      rects.push(topRect);
    }
  }

  if (windObstacleBottom && windObstacleBottom.style.display !== "none") {
    const bottomRect = insetWindRect(
      getWindElementGameRect(windObstacleBottom),
      WIND_HITBOX_INSET.obstacleBottom
    );

    if (bottomRect) {
      rects.push(bottomRect);
    }
  }

  return rects;
}





function updateWindCollectiblesCollision() {
  if (windGameState !== "playing") return;

  const playerRect = getWindPlayerHitboxRect();
  if (!playerRect) return;

  // 路線粉櫻花：+1
  for (let i = 0; i < windRouteSakuraEls.length; i++) {
    const el = windRouteSakuraEls[i];
    if (!el) continue;

    if (windRouteSakuraCollected[i]) {
      el.style.display = "none";
      continue;
    }

    if (el.style.display === "none") continue;

    // 先用 X 座標粗略判斷，太遠就不要讀 getBoundingClientRect()
   const sakuraX = Number(el.dataset.windX || "-9999");
    if (!isWindXNearPlayer(sakuraX, playerRect, 240)) continue;

    const sakuraRect = getWindSakuraHitboxRect(el);

    if (isWindRectOverlap(playerRect, sakuraRect)) {
      windRouteSakuraCollected[i] = true;
      el.style.display = "none";
      addWindScore(1);
    }
  }

  // 中開口金櫻花：+10
  if (windGoldRouteEl) {
    if (windGoldRouteCollected) {
      windGoldRouteEl.style.display = "none";
    } else if (windGoldRouteEl.style.display !== "none") {
    const goldX = Number(windGoldRouteEl.dataset.windX || "-9999");

      if (isWindXNearPlayer(goldX, playerRect, 280)) {
        const goldRect = getWindGoldHitboxRect(windGoldRouteEl);

        if (isWindRectOverlap(playerRect, goldRect)) {
          windGoldRouteCollected = true;
          windGoldRouteEl.style.display = "none";
          addWindScore(10);
        }
      }
    }
  }

  // bonus 粉櫻花：+1
  for (let i = 0; i < windBonusSakuraEls.length; i++) {
    const el = windBonusSakuraEls[i];
    if (!el) continue;

    if (windBonusSakuraCollected[i]) {
      el.style.display = "none";
      continue;
    }

    if (el.style.display === "none") continue;

    // 先用 X 座標粗略判斷，太遠就跳過
    const sakuraX = Number(el.dataset.windX || "-9999");
    if (!isWindXNearPlayer(sakuraX, playerRect, 240)) continue;

    const sakuraRect = getWindSakuraHitboxRect(el);

    if (isWindRectOverlap(playerRect, sakuraRect)) {
      windBonusSakuraCollected[i] = true;
      el.style.display = "none";
      addWindScore(1);
    }
  }

  // bonus 金櫻花：+10
  if (typeof windBonusGoldEls !== "undefined") {
    for (let i = 0; i < windBonusGoldEls.length; i++) {
      const el = windBonusGoldEls[i];
      if (!el) continue;

      if (windBonusGoldCollected[i]) {
        el.style.display = "none";
        continue;
      }

      if (el.style.display === "none") continue;

      // 金櫻花比較大，所以 margin 稍微放寬
      const goldX = Number(el.dataset.windX || "-9999");
      if (!isWindXNearPlayer(goldX, playerRect, 280)) continue;

      const goldRect = getWindGoldHitboxRect(el);

      if (isWindRectOverlap(playerRect, goldRect)) {
        windBonusGoldCollected[i] = true;
        el.style.display = "none";
        addWindScore(10);
      }
    }
  }
}

function updateWindObstacleCollision() {
  if (windGameState !== "playing") return;

  const playerRect = getWindPlayerHitboxRect();
  if (!playerRect) return;

  if (windObstacleX > playerRect.x + playerRect.w + 160) return;
  if (windObstacleX + 260 < playerRect.x - 160) return;

  const obstacleRects = getWindObstacleHitboxRects();

  for (const obstacleRect of obstacleRects) {
    if (isWindRectOverlap(playerRect, obstacleRect)) {
      windGameOver();
      return;
    }
  }
}

function updateWindSlashGhostCollision() {
  if (windGameState !== "playing") return;
  if (!windAttackActive) return;
  if (!windGhostActive) return;

  // 怪物離玩家太遠時，不檢查斬擊
  const playerRect = getWindPlayerHitboxRect();
  if (!playerRect) return;

  if (windGhostX > playerRect.x + playerRect.w + 520) return;
  if (windGhostX < playerRect.x - 220) return;

  const slashRect = getWindSlashHitboxRect();
  const ghostRect = getWindGhostHitboxRect();

  if (!slashRect || !ghostRect) return;

  if (isWindRectOverlap(slashRect, ghostRect)) {
    defeatWindGhost();
  }
}


function updateWindGhostCollision() {
  if (windGameState !== "playing") return;
  if (!windGhostActive) return;
  if (!windGhost || windGhost.classList.contains("hidden")) return;

  const playerRect = getWindPlayerHitboxRect();
  if (!playerRect) return;

  // 太遠時先跳過，連 hitbox 都不用算
  if (windGhostX > playerRect.x + playerRect.w + 220) return;
  if (windGhostX + WIND_GHOST_W / 2 < playerRect.x - 220) return;

  const ghostRect = getWindGhostHitboxRect();
  if (!ghostRect) return;

  if (isWindRectOverlap(playerRect, ghostRect)) {
    windGameOver();
  }
}




/* =========================
   Wind Game Debug Hitboxes
========================= */

const WIND_DEBUG_HITBOX = false;
const WIND_DEBUG_GHOST_HITBOX = false;
const WIND_DEBUG_SLASH_HITBOX = false;

const windHitboxLayer = document.getElementById("windHitboxLayer");

let windDebugHitboxEls = [];



function clearWindDebugHitboxes() {
  if (!windHitboxLayer) return;

  for (const el of windDebugHitboxEls) {
    el.remove();
  }

  windDebugHitboxEls = [];
}

function drawWindDebugHitbox(rect, type) {
  if (
    !WIND_DEBUG_HITBOX &&
    !WIND_DEBUG_GHOST_HITBOX &&
    !WIND_DEBUG_SLASH_HITBOX
  ) return;

  if (!windHitboxLayer) return;
  if (!rect) return;

  const box = document.createElement("div");
  box.className = `wind-hitbox wind-hitbox-${type}`;

  box.style.left = `${rect.x}px`;
  box.style.top = `${rect.y}px`;
  box.style.width = `${rect.w}px`;
  box.style.height = `${rect.h}px`;

  windHitboxLayer.appendChild(box);
  windDebugHitboxEls.push(box);
}


function getWindElementGameRect(el) {
  if (!el || !gameRoot) return null;

  const rootRect = gameRoot.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();

  const scaleX = 1080 / rootRect.width;
  const scaleY = 1920 / rootRect.height;

  return {
    x: (elRect.left - rootRect.left) * scaleX,
    y: (elRect.top - rootRect.top) * scaleY,
    w: elRect.width * scaleX,
    h: elRect.height * scaleY,
  };
}

function insetWindRect(rect, inset) {
  if (!rect) return null;

  const left = inset.left || 0;
  const right = inset.right || 0;
  const top = inset.top || 0;
  const bottom = inset.bottom || 0;

  return {
    x: rect.x + left,
    y: rect.y + top,
    w: Math.max(0, rect.w - left - right),
    h: Math.max(0, rect.h - top - bottom),
  };
}


const WIND_HITBOX_INSET = {
  player: {
    left: 150,
    right: 160,
    top: 70,
    bottom: 50,
  },

  obstacleTop: {
    left: 5,
    right: 5,
    top: 0,
    bottom: 300,
  },

  obstacleBottom: {
    left: 5,
    right: 5,
    top: 300,
    bottom: 0,
  },

  sakura: {
    left: 12,
    right: 12,
    top: 12,
    bottom: 12,
  },

  gold: {
    left: 14,
    right: 14,
    top: 14,
    bottom: 14,
  },

ghost: {
  left: 50,
  right: 75,
  top: 60,
  bottom: 60,
},

slash: {
  left: 120,
  right: 120,
  top: 40,
  bottom: 5,
},

};


function updateWindDebugHitboxes() {
  if (
    !WIND_DEBUG_HITBOX &&
    !WIND_DEBUG_GHOST_HITBOX &&
    !WIND_DEBUG_SLASH_HITBOX
  ) return;

  clearWindDebugHitboxes();

  // 劍氣 hitbox
  if (WIND_DEBUG_SLASH_HITBOX) {
    const slashRect = getWindSlashHitboxRect();
    drawWindDebugHitbox(slashRect, "obstacle");
  }

  // 怪物 hitbox
  if (
    WIND_DEBUG_GHOST_HITBOX &&
    windGhostActive &&
    windGhost &&
    !windGhost.classList.contains("hidden")
  ) {
    const ghostRect = getWindGhostHitboxRect();
    drawWindDebugHitbox(ghostRect, "obstacle");
  }

  // 如果需要全 debug，再畫其他碰撞箱
  if (!WIND_DEBUG_HITBOX) return;

  // 玩家 hitbox
  const playerRect = insetWindRect(
    getWindElementGameRect(windPlayer),
    WIND_HITBOX_INSET.player
  );
  drawWindDebugHitbox(playerRect, "player");

  // 障礙物 hitbox
  if (windObstacleTop && windObstacleTop.style.display !== "none") {
    const topRect = insetWindRect(
      getWindElementGameRect(windObstacleTop),
      WIND_HITBOX_INSET.obstacleTop
    );
    drawWindDebugHitbox(topRect, "obstacle");
  }

  if (windObstacleBottom && windObstacleBottom.style.display !== "none") {
    const bottomRect = insetWindRect(
      getWindElementGameRect(windObstacleBottom),
      WIND_HITBOX_INSET.obstacleBottom
    );
    drawWindDebugHitbox(bottomRect, "obstacle");
  }

  // 路線粉櫻花 hitbox
  for (const el of windRouteSakuraEls) {
    if (!el || el.style.display === "none") continue;

    const rect = insetWindRect(
      getWindElementGameRect(el),
      WIND_HITBOX_INSET.sakura
    );
    drawWindDebugHitbox(rect, "sakura");
  }

  // 中開口金櫻花 hitbox
  if (windGoldRouteEl && windGoldRouteEl.style.display !== "none") {
    const rect = insetWindRect(
      getWindElementGameRect(windGoldRouteEl),
      WIND_HITBOX_INSET.gold
    );
    drawWindDebugHitbox(rect, "gold");
  }

  // bonus 粉櫻花 hitbox
  for (const el of windBonusSakuraEls) {
    if (!el || el.style.display === "none") continue;

    const rect = insetWindRect(
      getWindElementGameRect(el),
      WIND_HITBOX_INSET.sakura
    );
    drawWindDebugHitbox(rect, "sakura");
  }

  // bonus 金櫻花 hitbox
  if (typeof windBonusGoldEls !== "undefined") {
    for (const el of windBonusGoldEls) {
      if (!el || el.style.display === "none") continue;

      const rect = insetWindRect(
        getWindElementGameRect(el),
        WIND_HITBOX_INSET.gold
      );
      drawWindDebugHitbox(rect, "gold");
    }
  }
}


/* =========================
   Wind Game Score
========================= */

const windScoreEl = document.getElementById("windScore");

const windResultPanel = document.getElementById("windResultPanel");
const windResultScore = document.getElementById("windResultScore");
const windResultBest = document.getElementById("windResultBest");
const btnWindRetry = document.getElementById("btnWindRetry");
const btnWindResultMenu = document.getElementById("btnWindResultMenu");

if (btnWindRetry) {
  btnWindRetry.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    resetWindGameSession();

    setTimeout(() => {
      startWindCountdown();
    }, 300);
  });
}

if (btnWindResultMenu) {
  btnWindResultMenu.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    backToMenuFromWindGame();
  });
}

let windScore = 0;

function resetWindScore() {
  windScore = 0;
  updateWindScoreDisplay();
}

function addWindScore(amount) {
  windScore += amount;
  updateWindScoreDisplay();
}

function updateWindScoreDisplay() {
  if (!windScoreEl) return;
  windScoreEl.textContent = windScore;
}

function showWindResultPanel() {
  if (!windResultPanel) return;

  const bestScore = saveWindBestScore(windScore);

  if (windResultScore) {
    windResultScore.textContent = windScore;
  }

  if (windResultBest) {
    windResultBest.textContent = bestScore;
  }

  windResultPanel.classList.remove("hidden");
}

function hideWindResultPanel() {
  if (!windResultPanel) return;

  windResultPanel.classList.add("hidden");
}

const WIND_BEST_SCORE_KEY = "nanahara-wind-best-score-v1";

function getWindBestScore() {
  const raw = localStorage.getItem(WIND_BEST_SCORE_KEY);
  const value = Number(raw);

  return Number.isFinite(value) ? value : 0;
}

function saveWindBestScore(score) {
  const best = getWindBestScore();

  if (score > best) {
    localStorage.setItem(WIND_BEST_SCORE_KEY, String(score));
    return score;
  }

  return best;
}



function resetWindGameSession() {
  // 停止遊戲 loop
 if (windAnimFrame) {
  cancelAnimationFrame(windAnimFrame);
  windAnimFrame = null;

  if (windAttackButtonFeedbackTimer) {
  clearTimeout(windAttackButtonFeedbackTimer);
  windAttackButtonFeedbackTimer = null;
}

setWindButtonPressed(btnWindAttack, false);
}

clearWindCountdown();
clearWindDebugHitboxes();
hideWindResultPanel();
hideWindPauseOverlay();

  // 重置狀態
  setWindGameState("idle");

  // 重置操作狀態
  windFlyPressed = false;

  windAttackActive = false;

  windAttackQueued = false;

  windGhostNeedsRespawnAfterPause = false;

if (windAttackTimer) {
  clearTimeout(windAttackTimer);
  windAttackTimer = null;
}

if (windGhostRespawnTimer) {
  clearTimeout(windGhostRespawnTimer);
  windGhostRespawnTimer = null;
}

  // 重置玩家物理
  windPlayerY = 0;
  windPlayerVY = 0;
  windLastTime = 0;
  applyWindPlayerPosition();
  resetWindPlayerTilt();

  // 重置角色差分
  if (windChinatsu) {
    windChinatsu.src = "images/wind-chinatsu-down.png";
  }

  if (windChifuyu) {
    windChifuyu.src = "images/wind-chifuyu-idle.png";
  }

  if (windSlash) {
windSlash.classList.remove(
  "slash-active",
  "slash-active-a",
  "slash-active-b"
);
windSlash.classList.add("hidden");
  }

  // 重置分數
  resetWindScore();

  // 重置障礙物、櫻花、bonus、收集狀態
  resetWindObstacle();


  resetWindGhost();

  // 清除 debug hitbox
  clearWindDebugHitboxes();
}










btnOmikuji.addEventListener("click", () => {
  goToScreen(menuScreen, omikujiScreen, 600);
});

if (btnMission) {
  btnMission.addEventListener("click", () => {
    prepareWindGameBackground();
    resetWindGameSession();

    enterWindGameAudioMode();

    if (typeof goToScreen === "function" && menuScreen && windGameScreen) {
      goToScreen(menuScreen, windGameScreen, 600, async () => {
        // 拉門已經完全闔上後，才進入小遊戲效能模式
        // 這樣主畫面的夜晚版不會在玩家眼前突然變白天
        enterWindGamePerformanceMode();

        await preloadWindGameAssets();

        warmupWindGameDom();

        setTimeout(() => {
          startWindCountdown();
        }, 850);
      });
    } else {
      console.warn("[Mission] goToScreen/menuScreen/windGameScreen not ready");
    }
  });
}

// ===== Omikuji / Omamori 右上角 Menu 按鈕 =====
const btnOmikujiMenu = document.getElementById("btnOmikujiMenu");
const btnOmamoriMenu = document.getElementById("btnOmamoriMenu");

// 共用回 Menu 行為（會自動帶門動畫）
function backToMenuFrom(screenEl) {
  if (!screenEl || !menuScreen) return;

  // 如果是御守畫面，回去前保險退出 focus
  if (screenEl === omamoriScreen && typeof exitOmamoriFocusMode === "function") {
    exitOmamoriFocusMode();
  }

  if (typeof goToScreen === "function") {
    goToScreen(screenEl, menuScreen, 600);
  } else {
    // 保底：沒有門動畫就直接切
    screenEl.classList.add("hidden");
    menuScreen.classList.remove("hidden");
  }
}

if (btnOmikujiMenu) {
  btnOmikujiMenu.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    backToMenuFrom(omikujiScreen);
  });
}

if (btnOmamoriMenu) {
  btnOmamoriMenu.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    backToMenuFrom(omamoriScreen);
  });
}

function backToMenuFromWindGame() {
  resetWindGameSession();
  switchToShrineBgm();

  if (typeof goToScreen === "function" && windGameScreen && menuScreen) {
    goToScreen(windGameScreen, menuScreen, 600, async () => {
      // 拉門關上後才恢復主畫面日夜模式
      exitWindGamePerformanceMode();
    });
  } else {
    windGameScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
    exitWindGamePerformanceMode();
  }
}

if (btnWindGameMenu) {
  btnWindGameMenu.addEventListener("click", toggleWindGamePause);
}


// ===== 1) DOM：畫面與按鈕 =====
const omamoriScreen = document.getElementById("omamoriScreen");

const omamoriKnotImg = document.getElementById("omamoriKnot");
const omamoriTopImg = document.getElementById("omamoriTop");
const omamoriBottomImg = document.getElementById("omamoriBottom");

const btnKnotLeft = document.getElementById("btnKnotLeft");
const btnKnotRight = document.getElementById("btnKnotRight");
const btnTopLeft = document.getElementById("btnTopLeft");
const btnTopRight = document.getElementById("btnTopRight");
const btnBottomLeft = document.getElementById("btnBottomLeft");
const btnBottomRight = document.getElementById("btnBottomRight");

const btnOmamoriFinish = document.getElementById("btnOmamoriFinish");

// Menu 的御守按鈕
const btnOmamori = document.getElementById("btnOmamori");

// Focus UI
const omamoriFocusActions = document.getElementById("omamoriFocusActions");
const btnFocusMenu = document.getElementById("btnFocusMenu");
const btnFocusBackToEdit = document.getElementById("btnFocusBackToEdit");
const btnFocusCapture = document.getElementById("btnFocusCapture");

// 台詞 DOM（你原本 auto talk 會用到）
const omamoriLineLeft = document.getElementById("omamoriLineLeft");
const omamoriLineRight = document.getElementById("omamoriLineRight");


// ===== 2) 素材規格 =====
const OMAMORI_ASSETS = {
  knot: { count: 6, prefix: "images/omamori-knot-", pad: 2, ext: ".png" },
  top: { count: 5, prefix: "images/omamori-top-", pad: 2, ext: ".png" },
  bottom: { count: 5, prefix: "images/omamori-bottom-", pad: 2, ext: ".png" },
};

// ===== 3) 狀態 =====
let omamoriState = { knot: 0, top: 0, bottom: 0 };
const OMAMORI_STORAGE_KEY = "omamori-style-state-v1";

function clampIndex(n, count) {
  if (!Number.isFinite(n)) return 0;
  n = Math.floor(n);
  if (n < 0) return 0;
  if (n >= count) return count - 1;
  return n;
}

function loadOmamoriState() {
  try {
    const raw = localStorage.getItem(OMAMORI_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);

    if (typeof parsed?.knot === "number") omamoriState.knot = clampIndex(parsed.knot, OMAMORI_ASSETS.knot.count);
    if (typeof parsed?.top === "number") omamoriState.top = clampIndex(parsed.top, OMAMORI_ASSETS.top.count);
    if (typeof parsed?.bottom === "number") omamoriState.bottom = clampIndex(parsed.bottom, OMAMORI_ASSETS.bottom.count);
  } catch (e) {
    console.warn("Omamori state parse failed:", e);
  }
}

function saveOmamoriState() {
  try {
    localStorage.setItem(OMAMORI_STORAGE_KEY, JSON.stringify(omamoriState));
  } catch (e) {}
}

function toFilePath(part, index0) {
  const cfg = OMAMORI_ASSETS[part];
  const num = String(index0 + 1).padStart(cfg.pad, "0");
  return `${cfg.prefix}${num}${cfg.ext}`;
}

function applyOmamoriImages() {
  if (omamoriKnotImg) omamoriKnotImg.src = toFilePath("knot", omamoriState.knot);
  if (omamoriTopImg) omamoriTopImg.src = toFilePath("top", omamoriState.top);
  if (omamoriBottomImg) omamoriBottomImg.src = toFilePath("bottom", omamoriState.bottom);
}


const OMAMORI_CHAR_ASSETS = {
  left:  { count: 6, prefix: "images/omamori-characters-left-",  pad: 2, ext: ".png" },
  right: { count: 6, prefix: "images/omamori-characters-right-", pad: 2, ext: ".png" },
};

function charPath(side, index0){
  const cfg = OMAMORI_CHAR_ASSETS[side];
  const num = String(index0 + 1).padStart(cfg.pad, "0");
  return `${cfg.prefix}${num}${cfg.ext}`;
}



// ===== 4) 部件切換 =====
function popOmamoriPart(part) {
  const wrapMap = { top: "wrapOmamoriTop", bottom: "wrapOmamoriBottom", knot: "wrapOmamoriKnot" };
  const id = wrapMap[part];
  if (!id) return;

  const el = document.getElementById(id);
  if (!el) return;

  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
  el.addEventListener("animationend", () => el.classList.remove("pop"), { once: true });
}

// ===== 角色差分圖片預載快取 =====
const omamoriCharCache = new Map(); // url -> HTMLImageElement

function preloadCharOne(url){
  if (!url) return Promise.resolve(null);
  if (omamoriCharCache.has(url)) return Promise.resolve(omamoriCharCache.get(url));

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      try { if (img.decode) await img.decode(); } catch {}
      omamoriCharCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// 可選：進 omamori 畫面後用 idle 預載全部差分（你本來就有 startOmamoriPreloadIdle，可把這個包進去）
async function preloadAllOmamoriCharVariantsBatch(batchSize = 2){
  if (typeof OMAMORI_CHAR_VARIANTS === "undefined") return; // ✅ 防呆
  const urls = [
    ...(OMAMORI_CHAR_VARIANTS.left || []),
    ...(OMAMORI_CHAR_VARIANTS.right || []),
  ];
  const pending = urls.filter(u => u && !omamoriCharCache.has(u));

  for (let i = 0; i < pending.length; i += batchSize){
    const batch = pending.slice(i, i + batchSize);
    await Promise.all(batch.map(preloadCharOne));
    await new Promise(r => setTimeout(r, 16));
  }
}




// =========================
// Omamori 圖片預載快取（建議放外層，不塞在 bind 裡）
// =========================
const omamoriImgCache = new Map(); // url -> HTMLImageElement
let omamoriPreloadStarted = false;

function preloadOne(url) {
  if (!url) return Promise.resolve(null);
  if (omamoriImgCache.has(url)) return Promise.resolve(omamoriImgCache.get(url));

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // 同網域無害，之後上 CDN 也安全
    img.onload = async () => {
      try {
        if (img.decode) await img.decode(); // ✅ 把 decode 提前做掉
      } catch {}
      omamoriImgCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function buildAllOmamoriUrls() {
  const urls = [];
  for (let i = 0; i < OMAMORI_ASSETS.knot.count; i++) urls.push(toFilePath("knot", i));
  for (let i = 0; i < OMAMORI_ASSETS.top.count; i++) urls.push(toFilePath("top", i));
  for (let i = 0; i < OMAMORI_ASSETS.bottom.count; i++) urls.push(toFilePath("bottom", i));
  return urls;
}

// 分批預載：避免一次塞爆造成卡頓
async function preloadOmamoriAllPartsBatch(batchSize = 4) {
  const urls = buildAllOmamoriUrls();
  const pending = urls.filter(u => !omamoriImgCache.has(u));

  for (let i = 0; i < pending.length; i += batchSize) {
    const batch = pending.slice(i, i + batchSize);
    await Promise.all(batch.map(preloadOne));

    // ✅ 讓出主執行緒（手機超重要）
    await new Promise(r => setTimeout(r, 16));
  }
}

function startOmamoriPreloadIdle() {
  if (omamoriPreloadStarted) return;
  omamoriPreloadStarted = true;

  const run = () => preloadOmamoriAllPartsBatch(4);

  // ✅ 盡量別搶動畫：等閒暇時再跑
  if ("requestIdleCallback" in window) {
    requestIdleCallback(run, { timeout: 1500 });
  } else {
    setTimeout(run, 700);
  }
}

let omamoriCycleBusy = false;
async function cycle(part, dir) {
  if (omamoriCycleBusy) return;      // ✅ 防連點
  omamoriCycleBusy = true;

  try {
    const count = OMAMORI_ASSETS[part].count;
    let next = omamoriState[part] + dir;
    if (next < 0) next = count - 1;
    if (next >= count) next = 0;

    const nextUrl = toFilePath(part, next);

    // ✅ 先確保下一張載入+decode完，再切換
    await preloadOne(nextUrl);

    omamoriState[part] = next;

    if (part === "knot" && omamoriKnotImg) omamoriKnotImg.src = nextUrl;
    if (part === "top" && omamoriTopImg) omamoriTopImg.src = nextUrl;
    if (part === "bottom" && omamoriBottomImg) omamoriBottomImg.src = nextUrl;

    saveOmamoriState();
    popOmamoriPart(part);
  } finally {
    omamoriCycleBusy = false;
  }
}




// ===== 5) Focus：顯示/隱藏 =====
function showOmamoriFocusActions() {
  if (omamoriFocusActions) omamoriFocusActions.classList.remove("hidden");
}

function hideOmamoriFocusActions() {
  if (omamoriFocusActions) omamoriFocusActions.classList.add("hidden");
}

// ✅ 全域可呼叫：退出聚焦
function exitOmamoriFocusMode() {
  if (!omamoriScreen) return;

  omamoriScreen.classList.remove("perfect-show", "focus");
  hideOmamoriFocusActions();

  const wrap = document.getElementById("omamoriPreviewWrap");
  if (wrap) wrap.classList.remove("omamori-finish-pop");
}

// ✅ 全域可呼叫：進入聚焦
function enterOmamoriFocusMode() {
  if (!omamoriScreen) return;

  omamoriScreen.classList.add("focus");
  showOmamoriFocusActions();

  // 御守完成瞬間彈跳一次（外層 wrapper）
  const wrap = document.getElementById("omamoriPreviewWrap");
  if (wrap) {
    wrap.classList.remove("omamori-finish-pop");
    void wrap.offsetWidth;
    wrap.classList.add("omamori-finish-pop");
    wrap.addEventListener("animationend", () => wrap.classList.remove("omamori-finish-pop"), { once: true });
  }

  // Perfect 延遲浮現
  omamoriScreen.classList.remove("perfect-show");
  setTimeout(() => omamoriScreen.classList.add("perfect-show"), 160);
}


// ===== 6) 綁定事件（只綁一次） =====
let omamoriBound = false;
function bindOmamoriControls() {
  if (omamoriBound) return;
  omamoriBound = true;

  // 部件切換

  if (btnKnotLeft) btnKnotLeft.addEventListener("click", async () => { await cycle("knot", -1); });
if (btnKnotRight) btnKnotRight.addEventListener("click", async () => { await cycle("knot",  1); });

if (btnTopLeft) btnTopLeft.addEventListener("click", async () => { await cycle("top", -1); });
if (btnTopRight) btnTopRight.addEventListener("click", async () => { await cycle("top",  1); });

if (btnBottomLeft) btnBottomLeft.addEventListener("click", async () => { await cycle("bottom", -1); });
if (btnBottomRight) btnBottomRight.addEventListener("click", async () => { await cycle("bottom",  1); });


  // 完成 -> focus
  if (btnOmamoriFinish) {
    btnOmamoriFinish.addEventListener("click", () => {
      console.log("[Omamori] finish clicked");
      enterOmamoriFocusMode();
    });
  } else {
    console.warn("[Omamori] btnOmamoriFinish not found");
  }


  // Menu -> Omamori（進入御守畫面）
  if (btnOmamori) {
    btnOmamori.addEventListener("click", () => {
      console.log("[Menu] btnOmamori clicked");

      applyOmamoriImages();
      exitOmamoriFocusMode();
setTimeout(() => {
  // 用 idle 更不干擾動畫
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      preloadOmamoriAllPartsBatch(4);
      preloadAllOmamoriCharVariantsBatch(2); // ✅ 新增：角色差分也預載
    }, { timeout: 1200 });
  } else {
    preloadOmamoriAllPartsBatch(4);
    preloadAllOmamoriCharVariantsBatch(2);   // ✅ 新增：角色差分也預載
  }
}, 800);


      // ⚠️ goToScreen/menuScreen 必須存在
      if (typeof goToScreen === "function" && menuScreen && omamoriScreen) {
        goToScreen(menuScreen, omamoriScreen, 600);
      } else {
        console.warn("[Menu] goToScreen/menuScreen/omamoriScreen not ready");
      }

      // 台詞：如果你已經有 startOmamoriAutoTalk 就讓它跑
      if (typeof startOmamoriAutoTalk === "function") {
        setTimeout(() => startOmamoriAutoTalk(), 650);
      }
      startOmamoriPreloadIdle();
    });
  } else {
    console.warn("[Menu] btnOmamori not found");
  }

  // Focus buttons
  if (btnFocusMenu) {
    btnFocusMenu.addEventListener("click", () => {
      exitOmamoriFocusMode();
      if (typeof goToScreen === "function" && omamoriScreen && menuScreen) {
        goToScreen(omamoriScreen, menuScreen, 600);
      }
    });
  }

  if (btnFocusBackToEdit) {
    btnFocusBackToEdit.addEventListener("click", () => {
      exitOmamoriFocusMode();
    });
  }

if (btnFocusCapture) {
  btnFocusCapture.addEventListener("click", async () => {
  console.log("[Omamori] capture clicked");
  await captureOmamoriFinal();
});

}

}


// ===== 7) 初始化 =====
window.addEventListener("load", () => {
  loadOmamoriState();
  applyOmamoriImages();
  bindOmamoriControls();
});




/* =========================
   Omamori 隨機台詞系統
========================= */





// 1️⃣ 台詞資料
const OMAMORI_LINES = {
  left: [
    "So many colors... which one should I choose?",
    "This design looks quite nice. What a keen eye.",
    "I remember when I was young, Master would sometimes sew small ornaments like these.",
    "Every stitch carries a thought, this is something worth choosing carefully.",
    "Seeking advice from others at the right moment is also part of learning.",
    "I suppose delicate handiwork isn’t really my strength. sis has always been better at it."
  ],
  right: [
  "There is no need to hurry the result. Even moments of quiet uncertainty may gently nourish a heartfelt wish as it begins to bloom.",
  "Since becoming the head of the family, I have made omamori for everyone each year. For Chifuyu? Of course—a special one just for my dear little sister.",
  "I wonder how everyone at Strega has been lately. If circumstances allow, I would like to make a few for Laura-sama and the others as well.",
  "I had hoped to invite Nao-sama too, but she appears to be quite occupied with guiding new disciples these days.",
  "If you find yourself feeling weary, perhaps a short rest with some tea might help. Sanae prepares it with a delicate fragrance.",
  "The bonds between people seem to intertwine like threads. I sincerely hope that all we hold dear may continue on, gently and for a long time.",
  "Recently, we have been blessed with many visitors to the shrine. Their earnest feelings were carried by the wind and the scent of flowers."
]

};


/* =========================
   Omamori 自動隨機（左右獨立）
   - 左右各自 10~15 秒隨機變化
   - 不連續同一句
   - 變化時：該邊差分切換 + 彈跳
========================= */

let omamoriCharLeft = null;
let omamoriCharRight = null;

function ensureOmamoriCharEls(){
  if (!omamoriCharLeft) omamoriCharLeft = document.getElementById("omamoriCharLeft");
  if (!omamoriCharRight) omamoriCharRight = document.getElementById("omamoriCharRight");
}


// 角色差分（01/02）
const OMAMORI_CHAR_VARIANTS = {
  left: [
    "images/omamori-characters-left-01.png",
    "images/omamori-characters-left-02.png",
  ],
  right: [
    "images/omamori-characters-right-01.png",
    "images/omamori-characters-right-02.png",
  ],
};

// 左右各自記錄上一句 index（避免連續同句）
let lastLineIndex = { left: -1, right: -1 };

// 左右各自記錄上一個差分 index（用 toggle 保證不連續同張）
let lastVariantIndex = { left: 0, right: 0 };

// 左右各自計時器（獨立）
let omamoriTalkTimer = { left: null, right: null };

/* 7~15 秒隨機 */
function getRandomIntervalMs() {
  return 7000 + Math.floor(Math.random() * 8000); // 
}

/* 從 list 中抽一個「不等於 lastIndex」的 index */
function pickIndexNoRepeat(listLength, lastIndex) {
  if (!Number.isFinite(listLength) || listLength <= 0) return 0;
  if (listLength === 1) return 0;

  let idx = Math.floor(Math.random() * listLength);
  if (idx === lastIndex) {
    // 這個寫法能確保不是同一個，同時仍具隨機性
    idx = (idx + 1 + Math.floor(Math.random() * (listLength - 1))) % listLength;
  }
  return idx;
}

/* 切差分：01 <-> 02（保證不連續同張） */
function toggleCharacterVariant(side) {
  const variants = OMAMORI_CHAR_VARIANTS[side];
  if (!variants || variants.length < 2) return 0;

  const next = lastVariantIndex[side] === 0 ? 1 : 0;
  lastVariantIndex[side] = next;
  return next;
}

function popCharacterByImg(imgEl) {
  if (!imgEl) return;

  imgEl.classList.remove("npc-pop");
  void imgEl.offsetWidth;
  imgEl.classList.add("npc-pop");

  imgEl.addEventListener(
    "animationend",
    () => imgEl.classList.remove("npc-pop"),
    { once: true }
  );
}


async function setCharacterVariantSafe(side, variantIndex){
  ensureOmamoriCharEls();

  const imgEl = (side === "left") ? omamoriCharLeft : omamoriCharRight;
  const variants = OMAMORI_CHAR_VARIANTS[side];

  if (!imgEl || !variants || !variants.length) return;

  const url = variants[variantIndex];
  if (!url) return;

  // 1) 先預載 + decode（避免第一次切換延遲）
  await preloadCharOne(url);

  // 2) 再換圖
  if (imgEl.src !== url) imgEl.src = url;

  // 3) 雙保險：等 DOM img decode
  try { if (imgEl.decode) await imgEl.decode(); } catch {}

  // 4) 最後才做 pop（確保不是「先跳再換」）
  popCharacterByImg(imgEl);
}



// ✅ 單邊（left / right）一次變化：換台詞 + 換差分 + 彈跳
async function omamoriChangeOneSide(side) {
  // 不在 omamori 畫面就停掉（避免背景亂跑）
  if (!omamoriScreen || omamoriScreen.classList.contains("hidden")) {
    stopOmamoriAutoTalk(side);
    return;
  }

  ensureOmamoriCharEls();

  // 1) 換台詞（不連續）
  if (side === "left" && omamoriLineLeft && OMAMORI_LINES?.left?.length) {
    const len = OMAMORI_LINES.left.length;
    const idx = pickIndexNoRepeat(len, lastLineIndex.left);
    lastLineIndex.left = idx;
    typeLine("left", omamoriLineLeft, OMAMORI_LINES.left[idx]);
  }

  if (side === "right" && omamoriLineRight && OMAMORI_LINES?.right?.length) {
    const len = OMAMORI_LINES.right.length;
    const idx = pickIndexNoRepeat(len, lastLineIndex.right);
    lastLineIndex.right = idx;
    typeLine("right", omamoriLineRight, OMAMORI_LINES.right[idx]);
  }

  // 2) 換差分：先確保圖載好，再換，再 pop
  if (side === "left") {
    const v = toggleCharacterVariant("left");
    await setCharacterVariantSafe("left", v);
  }

  if (side === "right") {
    const v = toggleCharacterVariant("right");
    await setCharacterVariantSafe("right", v);
  }

  // 3) 排程下一次
  scheduleNextOmamoriChange(side);

}

/* 排程下一次（單邊） */
function scheduleNextOmamoriChange(side) {
  stopOmamoriAutoTalk(side); // 防止同邊疊 timer
  omamoriTalkTimer[side] = setTimeout(() => omamoriChangeOneSide(side), getRandomIntervalMs());
}

/* 停止（單邊或全部） */
function stopOmamoriAutoTalk(side = "both") {
  if (side === "left" || side === "both") {
    if (omamoriTalkTimer.left) {
      clearTimeout(omamoriTalkTimer.left);
      omamoriTalkTimer.left = null;
    }
  }
  if (side === "right" || side === "both") {
    if (omamoriTalkTimer.right) {
      clearTimeout(omamoriTalkTimer.right);
      omamoriTalkTimer.right = null;
    }
  }
}

/* 開始（左右獨立） */
function startOmamoriAutoTalk() {
  if (omamoriLineLeft && OMAMORI_LINES?.left?.length) {
    const idx = pickIndexNoRepeat(OMAMORI_LINES.left.length, lastLineIndex.left);
    lastLineIndex.left = idx;
    typeLine("left", omamoriLineLeft, OMAMORI_LINES.left[idx]); // ✅ 逐字
  }

  if (omamoriLineRight && OMAMORI_LINES?.right?.length) {
    const idx = pickIndexNoRepeat(OMAMORI_LINES.right.length, lastLineIndex.right);
    lastLineIndex.right = idx;
    typeLine("right", omamoriLineRight, OMAMORI_LINES.right[idx]); // ✅ 逐字
  }

  scheduleNextOmamoriChange("left");
  scheduleNextOmamoriChange("right");
}


/* =========================
   Typewriter（逐字顯示）
========================= */

// 每一邊各自一個控制器（用來中止上一句）
const typewriterState = {
  left:  { timer: null, token: 0, fullText: "" },
  right: { timer: null, token: 0, fullText: "" },
};

// 你可以調這個：越小越快（ms/字）
const TYPE_SPEED_BASE = 20; // 建議 22~35
const TYPE_SPEED_JITTER = 18; // 隨機抖動，讓節奏更像人在說話

// 標點停頓（很像遊戲）
function getPunctuationDelay(ch) {
  if (ch === "…" ) return 140;
  if (ch === "." || ch === "!" || ch === "?") return 220;
  if (ch === "," ) return 120;
  if (ch === "，" ) return 140;
  if (ch === "。" || ch === "！" || ch === "？") return 260;
  if (ch === "、" ) return 140;
  if (ch === "—" ) return 120;
  if (ch === "：" || ch === ":" || ch === ";" || ch === "；") return 160;
  if (ch === "）" || ch === ")" ) return 80;
  return 0;
}

// 中止某一邊正在打的字
function stopTyping(side) {
  const st = typewriterState[side];
  if (!st) return;
  st.token += 1;
  if (st.timer) {
    clearTimeout(st.timer);
    st.timer = null;
  }
}

// 立即顯示完整句（可做成「點一下跳過逐字」）
function revealFullLine(side, el) {
  const st = typewriterState[side];
  if (!st || !el) return;
  stopTyping(side);
  el.textContent = st.fullText || "";
}

// 逐字輸出
function typeLine(side, el, text, opts = {}) {
  if (!el) return;

  const st = typewriterState[side];
  if (!st) return;

  // 先中止同側上一句
  stopTyping(side);

  st.fullText = text;
  const myToken = st.token; // 用 token 防止異步串台

  // 是否先清空
  if (opts.clear !== false) el.textContent = "";



let i = 0;
 const chars = Array.from(text); // 支援 emoji/特殊字元，不會切壞
const step = () => {
  if (typewriterState[side].token !== myToken) return;

  if (i > chars.length) {
    st.timer = null;
    return;
  }

  el.textContent = text.slice(0, i);
  const ch = chars[i - 1];

  const base = opts.speedBase ?? TYPE_SPEED_BASE;
  const jitter = opts.speedJitter ?? TYPE_SPEED_JITTER;

  let delay = base + Math.random() * jitter;
  if (ch) delay += getPunctuationDelay(ch);

  i += 1; // ✅ 這行必須有：推進到下一個字

  st.timer = setTimeout(step, delay);
};


  step();
}


const omamoriCaptureStage = document.getElementById("omamoriCaptureStage");
const capTop = document.getElementById("capTop");
const capBottom = document.getElementById("capBottom");
const capKnot = document.getElementById("capKnot");

function buildOmamoriCaptureComposition() {
  if (!capTop || !capBottom || !capKnot) return false;
  if (!omamoriTopImg || !omamoriBottomImg || !omamoriKnotImg) return false;

  capTop.src = omamoriTopImg.src;
  capBottom.src = omamoriBottomImg.src;
  capKnot.src = omamoriKnotImg.src;

  return true;
}

function waitForImage(img) {
  return new Promise((resolve) => {
    if (!img) return resolve();
    if (img.complete && img.naturalWidth > 0) return resolve();
    img.addEventListener("load", resolve, { once: true });
    img.addEventListener("error", resolve, { once: true }); // error 也不要卡死
  });
}

/* =========================================================
   Omamori Capture (Canvas Composition + OUTLINE Glow)
   - Build omamori into offscreen canvas
   - Apply ONE glow around combined silhouette
   - Output: 976x1814 PNG
========================================================= */

(function initOmamoriCaptureModule() {
  const $ = (id) => document.getElementById(id);

  const omamoriTopImg = $("omamoriTop");
  const omamoriBottomImg = $("omamoriBottom");
  const omamoriKnotImg = $("omamoriKnot");

  const btnFocusCapture = $("btnFocusCapture");

  const resultModal = $("resultModal");
  const resultImage = $("resultImage");

  if (!btnFocusCapture) {
    console.warn("[OmamoriCapture] #btnFocusCapture not found");
    return;
  }
  if (!resultModal || !resultImage) {
    console.warn("[OmamoriCapture] resultModal/resultImage not found");
    return;
  }
  if (!omamoriTopImg || !omamoriBottomImg || !omamoriKnotImg) {
    console.warn("[OmamoriCapture] omamoriTop/Bottom/Knot img not found");
    return;
  }

  // =========================
  // 1) Screenshot unsupported alert (English)
  // =========================

  const SCREENSHOT_UNSUPPORTED_MSG =
    "Sorry — your browser/device can’t generate screenshots here.\n\n" +
    "Please try one of the following:\n" +
    "• Use Chrome / Edge / Safari (latest)\n" +
    "• Disable strict tracking protection / ad blockers\n" +
    "• Make sure images are fully loaded\n" +
    "• Try a different device";

  function showScreenshotAlert(message = SCREENSHOT_UNSUPPORTED_MSG) {
    const old = document.getElementById("screenshotAlertOverlay");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.id = "screenshotAlertOverlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.75)";
    overlay.style.zIndex = "30000";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "24px";

    const card = document.createElement("div");
    card.style.width = "min(720px, 92vw)";
    card.style.background = "#fff";
    card.style.borderRadius = "20px";
    card.style.padding = "22px 22px 18px";
    card.style.boxSizing = "border-box";
    card.style.fontFamily =
      "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    card.style.color = "#2b2b2b";
    card.style.lineHeight = "1.45";

    const title = document.createElement("div");
    title.textContent = "Screenshot unavailable";
    title.style.fontSize = "20px";
    title.style.fontWeight = "700";
    title.style.marginBottom = "10px";

    const body = document.createElement("pre");
    body.textContent = message;
    body.style.whiteSpace = "pre-wrap";
    body.style.margin = "0 0 14px 0";
    body.style.fontSize = "15px";

    const btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.justifyContent = "flex-end";

    const okBtn = document.createElement("button");
    okBtn.textContent = "OK";
    okBtn.style.border = "none";
    okBtn.style.borderRadius = "14px";
    okBtn.style.padding = "10px 16px";
    okBtn.style.cursor = "pointer";
    okBtn.style.fontWeight = "700";

    okBtn.addEventListener("click", () => overlay.remove());

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });

    btnRow.appendChild(okBtn);
    card.appendChild(title);
    card.appendChild(body);
    card.appendChild(btnRow);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }

  function canAttemptCanvasCapture() {
    try {
      const c = document.createElement("canvas");
      const ctx = c.getContext && c.getContext("2d");
      if (!ctx) return false;
      if (typeof c.toDataURL !== "function") return false;
      return true;
    } catch {
      return false;
    }
  }

  function notifyCaptureUnsupported(err) {
    const raw = String(err?.message || err || "");
    const low = raw.toLowerCase();

    if (low.includes("tainted") || low.includes("security")) {
      showScreenshotAlert(
        "Sorry — the screenshot could not be generated because browser security rules blocked the canvas.\n\n" +
          "This usually happens when images are loaded without proper CORS headers.\n\n" +
          "Please try:\n" +
          "• Open the site via https (not file://)\n" +
          "• Ensure all images are from the same domain\n" +
          "• Try Chrome / Edge / Safari (latest)"
      );
      return;
    }

    if (low.includes("memory") || low.includes("out of memory")) {
      showScreenshotAlert(
        "Sorry — your device ran out of memory while generating the screenshot.\n\n" +
          "Please try:\n" +
          "• Close other tabs/apps\n" +
          "• Try again\n" +
          "• Use a newer device/browser"
      );
      return;
    }

    showScreenshotAlert();
  }

  // =========================
  // 2) Your helpers
  // =========================

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image load failed: " + url));
      img.src = url;
    });
  }

  function drawCombinedWithOutlineGlow(ctx, combinedCanvas, x, y, w, h, opts = {}) {
    const {
      layers = [
        { color: "rgba(255,255,255,0.14)", blur: 70, strength: 1 },
        { color: "rgba(255,215,120,0.45)", blur: 44, strength: 3 },
        { color: "rgba(255,230,180,0.70)", blur: 26, strength: 6 },
      ],
      alpha = 1,
    } = opts;

    ctx.save();
    ctx.globalAlpha = alpha;

    for (const L of layers) {
      ctx.save();
      ctx.shadowColor = L.color;
      ctx.shadowBlur = L.blur;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      const times = Math.max(1, Math.floor(L.strength));
      for (let i = 0; i < times; i++) {
        ctx.drawImage(combinedCanvas, x, y, w, h);
      }
      ctx.restore();
    }

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.drawImage(combinedCanvas, x, y, w, h);

    ctx.restore();
  }

  let captureBusy = false;

  // =========================
  // 3) Main capture
  // =========================
  async function captureOmamoriFinal() {
    if (captureBusy) return;

    // ✅ 新增：不支援 → 英文提示
    if (!canAttemptCanvasCapture()) {
      notifyCaptureUnsupported(new Error("Canvas not available"));
      return;
    }

    captureBusy = true;

    try {
      const topSrc = omamoriTopImg.src;
      const bottomSrc = omamoriBottomImg.src;
      const knotSrc = omamoriKnotImg.src;

      if (!topSrc || !bottomSrc || !knotSrc) {
        notifyCaptureUnsupported(new Error("Missing image sources"));
        return;
      }

      const BG_SRC = "images/omamori-final.jpg";

      const [bg, top, bottom, knot] = await Promise.all([
        loadImage(BG_SRC),
        loadImage(topSrc),
        loadImage(bottomSrc),
        loadImage(knotSrc),
      ]);

      const OUT_W = 976;
      const OUT_H = 1814;

      // 主輸出 canvas
      const out = document.createElement("canvas");
      out.width = OUT_W;
      out.height = OUT_H;

      const ctx = out.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context not available");
      ctx.imageSmoothingEnabled = true;

      ctx.clearRect(0, 0, OUT_W, OUT_H);
      ctx.drawImage(bg, 0, 0, OUT_W, OUT_H);

      // 御守尺寸/位置（可調）
const BASE_W = 600;           // 你原本的設計寬
const BASE_TOP_H = 453;
const BASE_BOTTOM_H = 342;
const BASE_KNOT_H = 197;
const BASE_KNOT_Y_OFFSET = 10;

const scale = 1.05;            // ✅ 只調這個：0.95、1.05、1.12...

const omW = Math.round(BASE_W * scale);
const TOP_H = Math.round(BASE_TOP_H * scale);
const BOTTOM_H = Math.round(BASE_BOTTOM_H * scale);
const KNOT_H = Math.round(BASE_KNOT_H * scale);
const KNOT_Y_OFFSET = Math.round(BASE_KNOT_Y_OFFSET * scale);

const omH = TOP_H + BOTTOM_H;

const omX = Math.round((OUT_W - omW) / 2);
const omY = 165;              // ✅ 位置照樣可以再調


      // 合成 offscreen
      const combined = document.createElement("canvas");
      combined.width = omW;
      combined.height = omH;

      const cctx = combined.getContext("2d");
      if (!cctx) throw new Error("Offscreen canvas context not available");
      cctx.imageSmoothingEnabled = true;

      cctx.clearRect(0, 0, omW, omH);
      cctx.drawImage(bottom, 0, TOP_H, omW, BOTTOM_H);
      cctx.drawImage(top, 0, 0, omW, TOP_H);
      cctx.drawImage(knot, 0, KNOT_Y_OFFSET, omW, KNOT_H);

      // 外輪廓發光 + 本體
drawCombinedWithOutlineGlow(ctx, combined, omX, omY, omW, omH, {
  layers: [
    { color: "rgb(255, 217, 238)", blur: 78, strength: 1 },
    { color: "rgb(255, 220, 155)", blur: 30, strength: 3 },
  ],
});



      // 顯示 modal
      resultModal.style.display = "none";
      resultImage.src = out.toDataURL("image/png");
      resultModal.style.display = "flex";

    } catch (err) {
      console.error("[OmamoriCapture] failed:", err);
      notifyCaptureUnsupported(err);
    } finally {
      captureBusy = false;
    }
  }

  // ✅ 綁一次就好：先 remove 再 add，避免你其它地方也綁過造成疊加
  btnFocusCapture.onclick = null;
  btnFocusCapture.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      captureOmamoriFinal();
    },
    { passive: false }
  );

  // debug
  window.captureOmamoriFinal = captureOmamoriFinal;

  console.log("[OmamoriCapture] module ready (with unsupported alert)");
})();












const omikuji = document.getElementById("omikuji");
const drawBtn = document.getElementById("drawBtn");

let bgm, drawSound;
let shuffleInterval;
let drawn = false;
let currentIndex = 0; // ⭐ 記住目前顯示的是哪一張籤

const images = [
  "images/omikuji1.png",
  "images/omikuji2.png",
  "images/omikuji3.png",
  "images/omikuji4.png",
  "images/omikuji5.png",
  "images/omikuji6.png",
  "images/omikuji7.png"
];

const weights = [16, 35, 12, 10, 8, 5, 2];
const STORAGE_KEY = "omikuji-last-date"; // 抽籤時間
const RESULT_KEY = "omikuji-result";      // 抽籤結果

/* ===== 手機縮放 ===== */
const DESIGN_W = 1080;
const DESIGN_H = 1920;

function getViewportSize() {
  // DevTools / 手機瀏覽器有時候 visualViewport 會更準，但也可能回傳怪值，所以做保底
  const vv = window.visualViewport;

  const w = vv?.width ?? window.innerWidth;
  const h = vv?.height ?? window.innerHeight;

  return {
    w: Math.max(1, w),
    h: Math.max(1, h),
  };
}

function scaleGameRoot() {
  const root = document.getElementById("gameRoot");
  if (!root) return;

  const { w, h } = getViewportSize();
  const scale = Math.min(w / DESIGN_W, h / DESIGN_H);

  // ✅ 用 CSS 變數，不要改 transform，避免覆蓋掉 translate(-50%, -50%)
  root.style.setProperty("--scale", scale.toString());
}

// ✅ resize / orientationchange / visualViewport resize 都綁上去
let resizeTimer;
function requestScale() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(scaleGameRoot, 50);
}

window.addEventListener("resize", requestScale);
window.addEventListener("orientationchange", requestScale);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", requestScale);
}

window.addEventListener("load", () => {
  initAudio();
  bindAudioUnlock();

  scaleGameRoot();
  // ⚠️ 這裡不要直接 playBGMWithFadeIn()，讓 unlockAudioOnce 來觸發
  checkIfDrawnToday();
});








/* ===== 計算今天早上 6 點時間戳 ===== */
function getToday6AMString() {
  const now = new Date();
  let day = now.getDate();
  let month = now.getMonth();
  let year = now.getFullYear();

  // 0:00~5:59 → 前一天
  if (now.getHours() < 6) {
    const yesterday = new Date(year, month, day - 1);
    day = yesterday.getDate();
    month = yesterday.getMonth();
    year = yesterday.getFullYear();
  }

  return `${year}-${month + 1}-${day}`; // 字串比較安全
}


/* ===== 檢查是否抽過並控制輪播 ===== */
function checkIfDrawnToday() {
  const lastDrawDay = localStorage.getItem(STORAGE_KEY);
  const today6AMString = getToday6AMString();

  if (lastDrawDay === today6AMString) {
    // 已抽過，顯示結果
    drawn = true;
    const savedResult = localStorage.getItem(RESULT_KEY);
    if (savedResult !== null) {
      omikuji.src = images[Number(savedResult)];
      omikuji.classList.add("glow");
    }
    drawBtn.style.animation = "none";
    drawBtn.style.filter = "grayscale(100%)";
    drawBtn.style.pointerEvents = "none";
    stopShuffle();
  } else {
    drawn = false;
    drawBtn.style.pointerEvents = "auto";
    drawBtn.style.filter = "none";
    drawBtn.style.animation = "pulse 1.6s ease-in-out infinite";
    startShuffle();
  }
}


/* ===== 輪播動畫 ===== */
function startShuffle() {
  if (shuffleInterval) clearInterval(shuffleInterval);

  shuffleInterval = setInterval(() => {
    let rand;
    do {
      rand = Math.floor(Math.random() * images.length);
    } while (rand === currentIndex);
    currentIndex = rand;
    omikuji.src = images[rand];
  }, 120);
}

function stopShuffle() {
  if (shuffleInterval) {
    clearInterval(shuffleInterval);
    shuffleInterval = null;
  }
}

/* ===== 加權隨機 ===== */
function getWeightedResult() {
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    if (rand < weights[i]) return i;
    rand -= weights[i];
  }
  return 0;
}

/* ===== BGM 淡入 ===== */
// ✅ 音訊初始化：抓到 HTML 的 audio 元素
function initAudio() {
  bgm = document.getElementById("bgm");
  drawSound = document.getElementById("drawSound");

  if (!bgm || !drawSound) {
    console.warn("找不到 bgm 或 drawSound audio 元素");
    return;
  }

  // 保險：iOS / 部分瀏覽器需要先 load 一下
  bgm.load();
  drawSound.load();
}

// ✅ 第一次使用者互動時解鎖音訊（解決 Autoplay 被擋）
let audioUnlocked = false;
function unlockAudioOnce() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  // 先試著播放一下再立刻暫停，讓瀏覽器允許後續播放
  // （不會真的有聲音，因為 volume=0）
  try {
    bgm.volume = 0;
    const p = bgm.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        bgm.pause();
        bgm.currentTime = 0;
        bgm.volume = 1;

        // ✅ 現在才正式淡入播放
        playBGMWithFadeIn();
      }).catch(() => {
        // 如果還是被擋，就等下一次互動再試
        audioUnlocked = false;
      });
    }
  } catch (e) {
    audioUnlocked = false;
  }
}

// ✅ 綁定多種互動事件，確保桌機/手機都能解鎖
function bindAudioUnlock() {
  const events = ["pointerdown", "touchstart", "mousedown", "keydown"];
  events.forEach(evt => {
    document.addEventListener(evt, unlockAudioOnce, { once: true, passive: true });
  });
}

// ===== 全站按鈕點擊音效：一次套用全部 button =====
function playUISound(opts = {}) {
  if (!drawSound) return;

  const {
    duck = false,
    volume = 0.9,
    duckVolume = 0.35,
    duckMs = 220,
  } = opts;

  const prevBgmVol = bgm ? bgm.volume : 1;

  if (duck && bgm) bgm.volume = duckVolume;

  // 重新播放（避免連點時沒聲音）
  try {
    drawSound.pause();
    drawSound.currentTime = 0;
    drawSound.volume = volume;

    const p = drawSound.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {}

  if (duck && bgm) {
    setTimeout(() => {
      bgm.volume = prevBgmVol;
    }, duckMs);
  }
}
(function bindGlobalButtonSFX() {
  // 這些情況我們不想播 UI click：例如分享/儲存（會觸發系統面板）、關閉 modal 等
  // 你可依自己喜好增減
const EXCLUDE_IDS = new Set([
  "shareBtn",
  "saveBtn",
  "closeModal",

  // Wind Game：不要使用通用按鈕音效
  "btnWindFly",
  "btnWindAttack",
]);

  // 有些按鈕（例如抽籤 drawBtn）你可能想保留它自己那套 playDrawSound()
  // 所以也把它排除，避免「按一下播兩次」
  EXCLUDE_IDS.add("drawBtn");

  // 你新增的「返回 Menu」按鈕如果希望也有音效，就不要加在排除名單
  // 如果你不希望它播（例如會太吵），就把它加進去：
  // EXCLUDE_IDS.add("btnOmikujiMenu");
  // EXCLUDE_IDS.add("btnOmamoriMenu");

  function shouldPlayForTarget(el) {
    if (!el) return false;
    if (el.id && EXCLUDE_IDS.has(el.id)) return false;

    // disabled / pointer-events none 的按鈕不播
    if (el.disabled) return false;

    // 有些時候按鈕被隱藏也不用播
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;

    return true;
  }

  document.addEventListener(
    "pointerdown",
    (e) => {
      // 找到最近的 button
      const btn = e.target.closest("button");
      if (!btn) return;

      if (!shouldPlayForTarget(btn)) return;

      // ✅ 播 UI click（預設不 duck）
      playUISound({ duck: false, volume: 0.9 });

      // 如果你希望「特定按鈕」會 duck，可以用 data 屬性控制：
      // <button ... data-duck="1">
      // 然後：
      // if (btn.dataset.duck === "1") playUISound({ duck: true });
    },
    { passive: true }
  );
})();



function playBGMWithFadeIn() {
  if (!bgm) return;

  // 如果正在小遊戲音訊模式，不准神社 BGM 自動復活
  if (typeof windGameAudioMode !== "undefined" && windGameAudioMode) {
    bgm.pause();
    bgm.currentTime = 0;
    return;
  }

  bgm.volume = 0;

  bgm.play().catch(() => {
    document.addEventListener("click", () => {
      if (typeof windGameAudioMode !== "undefined" && windGameAudioMode) return;
      bgm.play();
    }, { once: true });
  });

  let volume = 0;
  const fade = setInterval(() => {
    if (typeof windGameAudioMode !== "undefined" && windGameAudioMode) {
      clearInterval(fade);
      bgm.pause();
      bgm.currentTime = 0;
      return;
    }

    volume += 0.05;
    if (volume >= 1) {
      volume = 1;
      clearInterval(fade);
    }
    bgm.volume = volume;
  }, 200);
}

/* ===== 抽籤音效 ===== */
function playDrawSound() {
  if (!drawSound) return;

  if (bgm) bgm.volume = 0.3;

  drawSound.pause();
  drawSound.currentTime = 0;
  drawSound.volume = 1;
  drawSound.play().catch(() => {});

  setTimeout(() => {
    if (bgm) bgm.volume = 1;
  }, 400);
}

/* ===== 點擊抽籤 ===== */
drawBtn.addEventListener("click", () => {
  if (drawn) return;
  drawn = true;

  stopShuffle();
  playDrawSound();
// ===== 通用按鈕點擊音效（共用 drawSound）=====
// opts.duck: 是否壓低 BGM（預設 false，避免每按一下都壓）
// opts.volume: 點擊音量（預設 0.9，比抽籤小一點比較耐聽）
// opts.duckVolume: BGM 被壓到的音量（預設 0.35）
// opts.duckMs: 壓多久（預設 220ms，UI click 通常更短）


  

  const resultIndex = getWeightedResult();
  currentIndex = resultIndex;
  omikuji.src = images[resultIndex];
  omikuji.classList.add("glow");

  // 改存字串而非 timestamp
  localStorage.setItem(STORAGE_KEY, getToday6AMString());
  localStorage.setItem(RESULT_KEY, resultIndex);

  drawBtn.style.animation = "none";
  drawBtn.style.filter = "grayscale(100%)";
  drawBtn.style.pointerEvents = "none";
  afterDrawCapture(); // ⭐ 抽籤完成後自動截圖
});






let sakuraCanvas;
let sakuraCtx;

window.addEventListener("load", () => {
  // ===== 先抓 DOM =====
  sakuraCanvas = document.getElementById("sakura");
  sakuraCtx = sakuraCanvas.getContext("2d");

  // 設定寬高
  sakuraCanvas.width = 1080;
  sakuraCanvas.height = 1920;

  // 初始化櫻花
  initSakuraPetals();
});

/* ===== 櫻花粒子系統 ===== */
let windTime = 0;

// normal：主介面原本飄落
// windGame：小遊戲強風吹拂
let sakuraWindMode = "normal";

let sakuraWindPower = 1;
let sakuraWindTargetPower = 1;

const SAKURA_WIND_NORMAL = 1;
const SAKURA_WIND_GAME = 3.2;

const sakuraImages = [
  "images/sakura1.png",
  "images/sakura2.png",
  "images/sakura3.png"
];

const loadedPetals = [];
let petals = [];
const PETAL_COUNT = 25; // 可調

function initSakuraPetals() {
  let sakuraLoadedCount = 0;
  sakuraImages.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      sakuraLoadedCount++;
      if (sakuraLoadedCount === sakuraImages.length) startPetals();
    };
    loadedPetals.push(img);
  });
}

function startPetals() {
  for (let i = 0; i < PETAL_COUNT; i++) {
    petals.push(createPetal(true));
  }
  requestAnimationFrame(updatePetals);
}

function createPetal(randomY = false) {
  const size = 20 + Math.random() * 40;
  return {
    img: loadedPetals[Math.floor(Math.random() * loadedPetals.length)],
    x: Math.random() * sakuraCanvas.width,
    y: randomY ? Math.random() * sakuraCanvas.height : -50,
    size: size,
    speedY: 1.5 + size / 40,
    speedX: -1.2 - Math.random() * 0.8,
    rotation: Math.random() * 360,
    rotationSpeed: -1 + Math.random() * 2,
    baseAlpha: 0.8 + Math.random() * 0.2
  };
}

function setSakuraWindMode(mode) {
  if (mode === "windGame") {
    sakuraWindMode = "windGame";
    sakuraWindTargetPower = SAKURA_WIND_GAME;
  } else {
    sakuraWindMode = "normal";
    sakuraWindTargetPower = SAKURA_WIND_NORMAL;
  }
}

function updatePetals() {
  const isWindGame = sakuraWindMode === "windGame";

  // 風力平滑變化，避免進出小遊戲時突然跳變
  sakuraWindPower += (sakuraWindTargetPower - sakuraWindPower) * 0.035;

  let wind = 0;

  if (isWindGame) {
    // 小遊戲：穩定往左吹，偶爾更強
    windTime += 0.012;

    const steadyWind = sakuraWindPower * 1.8;
    const gustWave = Math.max(0, Math.sin(windTime * 1.6));
    const gustWind = gustWave * sakuraWindPower * 0.8;

    wind = steadyWind + gustWind;
  } else {
    // 主介面：保留原本的自然快慢節奏
    windTime += 0.01;

    const windBase = Math.sin(windTime) * 1.2;
    const windGust = Math.sin(windTime * 3) * 0.5;

    wind = windBase + windGust;
  }

  sakuraCtx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);

  petals.forEach(p => {
    sakuraCtx.save();

    const fadeStart = sakuraCanvas.height * 0.75;
    const fadeEnd = sakuraCanvas.height * 0.95;

    let alpha = p.baseAlpha;

    if (p.y > fadeStart) {
      alpha = p.baseAlpha * (1 - (p.y - fadeStart) / (fadeEnd - fadeStart));
    }

    sakuraCtx.globalAlpha = Math.max(alpha, 0);

    sakuraCtx.translate(p.x, p.y);
    sakuraCtx.rotate((p.rotation * Math.PI) / 180);
    sakuraCtx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size);
    sakuraCtx.restore();

    if (isWindGame) {
      // 小遊戲：強風往左吹
      const fallBoost = 1 + (sakuraWindPower - 1) * 0.12;
      const sideWindBoost = 1 + (sakuraWindPower - 1) * 0.65;
      const rotateBoost = 1 + (sakuraWindPower - 1) * 0.35;

      p.y += p.speedY * fallBoost;
      p.x += p.speedX * sideWindBoost - wind;
      p.rotation += p.rotationSpeed * rotateBoost;
    } else {
      // 主介面：原本的飄落感
      p.y += p.speedY;
      p.x += p.speedX + wind * 0.3;
      p.rotation += p.rotationSpeed;
    }

    if (p.y > sakuraCanvas.height + 60) {
      Object.assign(p, createPetal(false));
    }

    if (p.x > sakuraCanvas.width + 60) {
      p.x = -60;
    }

    if (p.x < -60) {
      p.x = sakuraCanvas.width + 60;
    }
  });

  requestAnimationFrame(updatePetals);
}


/* ===== 先抓 DOM 元素 ===== */
const resultModal = document.getElementById("resultModal");
const resultImage = document.getElementById("resultImage");
const shareBtn = document.getElementById("shareBtn");
const saveBtn = document.getElementById("saveBtn");
const closeModal = document.getElementById("closeModal");

/* 📸 截圖目前舞台 */
async function captureResult() {
  const root = document.getElementById("gameRoot");
  if (!root) return;

  // 用 safeScreenshot 統一處理不支援/失敗提示
  await safeScreenshot(async () => {
    // 保險：截圖前先把 modal 關掉
    
    const modal = document.getElementById("resultModal");
    const modalPrevDisplay = modal ? modal.style.display : "";
    if (modal) modal.style.display = "none";

    const canvas = await html2canvas(root, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      scale: 2,
      scrollX: 0,
      scrollY: 0,

      onclone: (clonedDoc) => {
        const clonedRoot = clonedDoc.getElementById("gameRoot");
        if (!clonedRoot) return;

        clonedRoot.style.transform = "none";
        clonedRoot.style.left = "0";
        clonedRoot.style.top = "0";
        clonedRoot.style.position = "relative";
        clonedRoot.style.margin = "0";
        clonedRoot.style.transformOrigin = "top left";

        const clonedModal = clonedDoc.getElementById("resultModal");
        if (clonedModal) clonedModal.style.display = "none";

        // ✅ 你之前加的：不要截到 Omikuji 右上角返回 Menu
        const clonedOmikujiMenuBtn = clonedDoc.getElementById("btnOmikujiMenu");
        if (clonedOmikujiMenuBtn) clonedOmikujiMenuBtn.style.display = "none";
      }
    });

    resultImage.src = canvas.toDataURL("image/png");
    if (modal) modal.style.display = "flex";
    else resultModal.style.display = "flex";

    return true;
  }, "Omikuji Screenshot");
}




/* 🎴 抽籤後觸發截圖 */
function afterDrawCapture() {
  setTimeout(() => {
    captureResult();
  }, 600); // 等 glow 動畫出現
}

/* 分享按鈕 */
shareBtn.addEventListener("click", async () => {
  if (!resultImage.src) return;

  const response = await fetch(resultImage.src);
  const blob = await response.blob();
  const file = new File([blob], "omikuji.png", { type: "image/png" });

  if (navigator.share) {
    navigator.share({
      title: "My Omikuji Result!",
      text: "I drew a fortune at Nanahara Shrine!",
      files: [file]
    });
  } else {
    alert("此裝置不支援直接分享，請先儲存圖片");
  }
});

/* 儲存按鈕 */
saveBtn.addEventListener("click", () => {
  if (!resultImage.src) return;
  const link = document.createElement("a");
  link.href = resultImage.src;
  link.download = "nanahara-omikuji.png";
  link.click();
});

/* 關閉彈窗 */
closeModal.addEventListener("click", () => {
  resultModal.style.display = "none";
  console.log("[Modal] close resultModal", new Error().stack);

});


function updateDayNightMode() {
  const hour = new Date().getHours();

  if (hour >= 18 || hour < 6) {
    document.body.classList.add("night-mode");
  } else {
    document.body.classList.remove("night-mode");
  }
}

// 進站時先判斷一次
updateDayNightMode();

// 每 5 分鐘檢查一次時間（避免剛好跨 6 點沒刷新）
setInterval(updateDayNightMode, 5 * 60 * 1000);

