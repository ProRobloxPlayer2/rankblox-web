// =======================
// CORE STATE
// =======================
let door = 1;
let health = 100;

// Elevator
let elevatorActive = false;
let elevatorRound = 0;
let elevatorPoints = 15;
let correctConfig = [];
let playerSwitches = Array(10).fill(false);

// =======================
// UI
// =======================
const statusText = document.getElementById("status");
const doorText = document.getElementById("door");
const healthText = document.getElementById("health");
const openDoorBtn = document.getElementById("openDoorBtn");

// Elevator UI
const panel = document.getElementById("elevatorPanel");
const instruction = document.getElementById("elevatorInstruction");
const switchesDiv = document.getElementById("switches");
const confirmBtn = document.getElementById("confirmBtn");

// =======================
// INIT
// =======================
updateHealth();
doorText.textContent = `🚪 Door ${door}`;
statusText.textContent = "🚪 Exploring...";

// =======================
// HEALTH
// =======================
function updateHealth() {
  if (health <= 0) {
    health = 0;
    statusText.textContent = "💀 You died.";
    openDoorBtn.disabled = true;
  }
  healthText.textContent = `❤️ ${health}`;
}

// =======================
// DOOR SYSTEM (FIXED)
// =======================
openDoorBtn.onclick = () => {
  if (health <= 0) return;

  // 🚫 Block during puzzle
  if (elevatorActive) {
    alert("⚠️ Restore power first!");
    return;
  }

  // 🛗 Trigger puzzle
  if (door === 100) {
    startElevator();
    return;
  }

  door++;
  doorText.textContent = `🚪 Door ${door}`;
  statusText.textContent = "🚶 Exploring...";
};

// =======================
// START PUZZLE
// =======================
function startElevator() {
  elevatorActive = true;
  elevatorRound = 0;
  elevatorPoints = 15;

  panel.style.display = "block";

  alert(
    "🛗 POWER SYSTEM FAILURE\n\n" +
    "Fix the switches.\n" +
    "+10 correct | -5 wrong\n" +
    "Reach 30 to win."
  );

  nextRound();
}

// =======================
// NEXT ROUND
// =======================
function nextRound() {
  if (health <= 0) return;

  if (elevatorPoints <= 0) {
    health = 0;
    updateHealth();
    alert("💀 Power failure.");
    return;
  }

  if (elevatorPoints >= 30) {
    winGame();
    return;
  }

  elevatorRound++;
  generateConfig();
}

// =======================
// GENERATE SWITCHES
// =======================
function generateConfig() {
  correctConfig = [];
  playerSwitches = Array(10).fill(false);

  while (correctConfig.length < 5) {
    let n = Math.floor(Math.random() * 10) + 1;
    if (!correctConfig.includes(n)) correctConfig.push(n);
  }

  const onList = correctConfig.slice(0, 3);

  instruction.textContent =
    `Round ${elevatorRound} → Turn ON: ${onList.join(", ")}`;

  renderSwitches();
}

// =======================
// RENDER BUTTONS
// =======================
function renderSwitches() {
  switchesDiv.innerHTML = "";

  for (let i = 0; i < 10; i++) {
    const btn = document.createElement("button");
    btn.textContent = `${i + 1}: OFF`;

    btn.onclick = () => {
      playerSwitches[i] = !playerSwitches[i];
      btn.textContent = `${i + 1}: ${
        playerSwitches[i] ? "ON" : "OFF"
      }`;
    };

    switchesDiv.appendChild(btn);
  }
}

// =======================
// CONFIRM
// =======================
confirmBtn.onclick = () => {
  const selected = playerSwitches
    .map((v, i) => (v ? i + 1 : null))
    .filter(v => v !== null);

  const correct =
    selected.length === 3 &&
    selected.every(n => correctConfig.slice(0, 3).includes(n));

  if (correct) {
    elevatorPoints += 10;
    alert(`✅ Correct! Points: ${elevatorPoints}`);
  } else {
    elevatorPoints -= 5;
    alert(`❌ Wrong! Points: ${elevatorPoints}`);
  }

  nextRound();
};

// =======================
// WIN
// =======================
function winGame() {
  elevatorActive = false;
  panel.style.display = "none";

  statusText.textContent = "🏆 DOOR 100 COMPLETE — YOU ESCAPED!";

  alert(
    "🛗 POWER RESTORED\n\n" +
    "The elevator slowly comes back to life...\n" +
    "You escaped the hotel."
  );
}
