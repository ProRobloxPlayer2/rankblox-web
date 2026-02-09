// =======================
// CORE GAME STATE
// =======================
let door = 1;
let health = 100;

let rushing = false;
let ambushActive = false;
let screechActive = false;

let hiding = false;
let crouching = false;

let seekActive = false;
let seekEndDoor = 0;
let seekTimer = null;

let libraryActive = false;
let figureActive = false;

let hideUsedThisRush = false;

// =======================
// FIGURE PUZZLE DATA
// =======================
let bookClues = [];
let correctCode = [];
let enteredCode = [];
let subDoorUnlocked = false;

const symbols = ["★", "▲", "◆", "●", "■", "⬟"];

// =======================
// UI ELEMENTS
// =======================
const statusText = document.getElementById("status");
const doorText = document.getElementById("door");
const healthText = document.getElementById("health");

const openDoorBtn = document.getElementById("openDoorBtn");
const hideBtn = document.getElementById("hideBtn");
const crouchBtn = document.getElementById("crouchBtn");
const bookBtn = document.getElementById("bookBtn");

// =======================
// UI SAFETY (NEVER GREY)
// =======================
setInterval(() => {
  if (health > 0) {
    hideBtn.disabled = false;
    crouchBtn.disabled = false;
  }
}, 200);

// =======================
// HEALTH
// =======================
function updateHealth() {
  if (health < 0) health = 0;
  healthText.textContent = `❤️ ${health}`;

  if (health <= 0) {
    statusText.textContent = "💀 You died.";
    openDoorBtn.disabled = true;
  }
}

// =======================
// OPEN DOOR
// =======================
openDoorBtn.onclick = () => {
  if (health <= 0) return;

  // Seek rule
  if (seekActive && !crouching) {
    alert("👁 SEEK CAUGHT YOU — DID NOT CROUCH!");
    health = 0;
    updateHealth();
    return;
  }

  door++;
  doorText.textContent = `🚪 Door ${door}`;
  statusText.textContent = "🚶 Exploring door...";

  // FIGURE LIBRARY
  if (door === 50 && !libraryActive) {
    startLibrary();
    return;
  }

  // SEEK START (25–30)
  if (!seekActive && door >= 25 && door <= 30 && Math.random() < 0.3) {
    startSeek();
  }

  // SEEK END
  if (seekActive && door >= seekEndDoor) {
    endSeek();
  }

  // ENTITY ROLLS
  if (Math.random() < 0.35) spawnRush();
  if (Math.random() < 0.2) spawnScreech();
};

// =======================
// RUSH
// =======================
function spawnRush() {
  rushing = true;
  hideUsedThisRush = false;
  statusText.textContent = "💨 Rush is coming!";
  alert("💨 RUSH IS COMING — HIDE!");

  setTimeout(() => {
    if (!hiding) {
      health = 0;
      updateHealth();
    }
    rushing = false;
  }, 3000);
}

// =======================
// AMBUSH
// =======================
function spawnAmbush() {
  ambushActive = true;
  let rebounds = Math.floor(Math.random() * 10) + 3;
  let count = 0;

  function ambushPass() {
    if (health <= 0) return;

    if (!hiding) {
      health = 0;
      updateHealth();
      return;
    }

    count++;
    if (count < rebounds) {
      setTimeout(ambushPass, 1500);
    } else {
      ambushActive = false;
    }
  }

  ambushPass();
}

// =======================
// HIDE / CLOSET
// =======================
hideBtn.onclick = () => {
  if (health <= 0) return;

  if (!hiding) {
    hiding = true;
    hideBtn.textContent = "Exit Closet";
    statusText.textContent = "🛑 Hiding...";
    kickOutAfterTime();
  } else {
    hiding = false;
    hideBtn.textContent = "Hide in Closet";
    statusText.textContent = "🚪 Exited closet";
  }
};

function kickOutAfterTime() {
  if (hideUsedThisRush) return;
  hideUsedThisRush = true;

  setTimeout(() => {
    if (!hiding) return;
    hiding = false;
    hideBtn.textContent = "Hide in Closet";
    health -= 20;
    updateHealth();
    alert("😈 Hide kicked you out (-20 HP)");
  }, 10000);
}

// =======================
// SCREECH
// =======================
function spawnScreech() {
  if (screechActive) return;
  screechActive = true;

  setTimeout(() => {
    alert("👁 SCREECH — LOOK AT IT!");
    screechActive = false;
  }, 2000);
}

// =======================
// CROUCH
// =======================
crouchBtn.onclick = () => {
  crouching = !crouching;
  crouchBtn.textContent = crouching ? "Stand Up" : "Crouch";
};

// =======================
// SEEK CHASE
// =======================
function startSeek() {
  seekActive = true;
  seekEndDoor = door + 10;
  alert("👁 SEEK IS CHASING YOU!");
  statusText.textContent = "🏃 SEEK CHASE!";
  startSeekTimer();
}

function startSeekTimer() {
  seekTimer = setTimeout(() => {
    alert("👁 SEEK CAUGHT YOU (TOO SLOW)");
    health = 0;
    updateHealth();
  }, 10000);
}

function endSeek() {
  seekActive = false;
  clearTimeout(seekTimer);
  alert("✅ You escaped Seek!");
  statusText.textContent = "😮 Safe... for now";
}

// =======================
// FIGURE LIBRARY
// =======================
function startLibrary() {
  libraryActive = true;
  figureActive = true;
  bookClues = [];
  correctCode = [];
  enteredCode = [];

  alert("📚 FIGURE LIBRARY — STAY QUIET & CROUCH");
  statusText.textContent = "📚 Find books. Figure is blind.";
}

// =======================
// BOOK COLLECTION
// =======================
bookBtn.onclick = () => {
  if (!libraryActive || health <= 0) return;

  const number = Math.floor(Math.random() * 9) + 1;
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];

  bookClues.push({ number, symbol });
  alert(`📖 Book Found!\n${symbol} → ${number}`);

  if (bookClues.length === 5) {
    showNoticeBoard();
  }
};

// =======================
// NOTICE BOARD
// =======================
function showNoticeBoard() {
  let notice = "📜 NOTICE BOARD\n\n";
  bookClues.forEach(b => notice += `${b.symbol} → ${b.number}\n`);
  alert(notice);
  generateCorrectCode();
}

// =======================
// SUB-DOOR 50 PUZZLE
// =======================
function generateCorrectCode() {
  correctCode = [...bookClues]
    .sort((a, b) => a.number - b.number)
    .map(b => b.symbol);

  alert("🔐 Enter symbols in NUMBER order.");
  subDoorUnlocked = true;
}

// =======================
// SYMBOL ENTRY (PROMPT)
// =======================
function enterSymbol() {
  if (!subDoorUnlocked) return;

  const input = prompt("Enter symbol:");
  if (!input) return;

  enteredCode.push(input);

  if (enteredCode.length === correctCode.length) {
    checkCode();
  }
}

function checkCode() {
  if (enteredCode.join("") === correctCode.join("")) {
    alert("✅ LIBRARY ESCAPED!");
    libraryActive = false;
    figureActive = false;
  } else {
    alert("❌ WRONG CODE — FIGURE ATTACKS");
    health = 0;
    updateHealth();
  }
}

// =======================
// INIT
// =======================
updateHealth();
doorText.textContent = `🚪 Door ${door}`;
statusText.textContent = "🚪 Exploring door...";
