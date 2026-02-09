// =======================
// CORE GAME STATE
// =======================
let door = 1;
let health = 100;

let libraryActive = false;
let libraryCompleted = false;

// =======================
// ELEVATOR PUZZLE STATE
// =======================
let elevatorActive = false;
let elevatorRound = 0;
let elevatorPoints = 15; // start balanced
let correctConfig = [];

// =======================
// UI ELEMENTS
// =======================
const statusText = document.getElementById("status");
const doorText = document.getElementById("door");
const healthText = document.getElementById("health");
const openDoorBtn = document.getElementById("openDoorBtn");

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

  // DOOR 100 ELEVATOR
  if (door === 100 && !elevatorActive) {
    startElevatorPuzzle();
    return;
  }

  door++;
  doorText.textContent = `🚪 Door ${door}`;
  statusText.textContent = "🚶 Exploring door...";
};

// =======================
// ELEVATOR PUZZLE
// =======================
function startElevatorPuzzle() {
  elevatorActive = true;
  elevatorRound = 0;
  elevatorPoints = 15;

  alert(
    "🛗 DOOR 100 — ELEVATOR POWER SYSTEM\n\n" +
    "3 Rounds\n" +
    "+10 points per correct round\n" +
    "-5 points per mistake\n\n" +
    "Reach 30 points to win.\n" +
    "Hit 0 to die."
  );

  nextElevatorRound();
}

function nextElevatorRound() {
  if (health <= 0) return;

  if (elevatorPoints <= 0) {
    health = 0;
    updateHealth();
    alert("💀 Power failure. You died.");
    return;
  }

  if (elevatorPoints >= 30) {
    elevatorWin();
    return;
  }

  elevatorRound++;
  if (elevatorRound > 3) {
    elevatorWin();
    return;
  }

  generateElevatorConfig();
}

function generateElevatorConfig() {
  correctConfig = [];

  while (correctConfig.length < 5) {
    const num = Math.floor(Math.random() * 10) + 1;
    if (!correctConfig.includes(num)) correctConfig.push(num);
  }

  const onList = correctConfig.slice(0, 3);
  const offList = correctConfig.slice(3);

  alert(
    `🔧 ELEVATOR ROUND ${elevatorRound}\n\n` +
    `Turn ON: ${onList.join(", ")}\n` +
    `Turn OFF: ${offList.join(", ")}\n\n` +
    `Enter switches to turn ON (comma-separated)`
  );

  const input = prompt("Example: 2,5,9");
  if (!input) {
    elevatorPoints -= 5;
    alert("❌ No input. -5 points.");
    nextElevatorRound();
    return;
  }

  checkElevatorInput(input, onList);
}

function checkElevatorInput(input, onList) {
  const playerOn = input
    .split(",")
    .map(n => parseInt(n.trim()))
    .filter(n => !isNaN(n));

  const correct =
    playerOn.length === onList.length &&
    playerOn.every(n => onList.includes(n));

  if (correct) {
    elevatorPoints += 10;
    alert(`✅ Correct!\nPoints: ${elevatorPoints}`);
  } else {
    elevatorPoints -= 5;
    alert(`❌ Wrong!\nPoints: ${elevatorPoints}`);
  }

  nextElevatorRound();
}

// =======================
// ELEVATOR WIN
// =======================
function elevatorWin() {
  elevatorActive = false;

  alert(
    "🛗 POWER RESTORED\n\n" +
    "The elevator hums back to life...\n" +
    "You escaped the hotel."
  );

  statusText.textContent = "🏆 DOOR 100 COMPLETE — YOU WIN!";
  openDoorBtn.disabled = true;
}

// =======================
// INIT
// =======================
updateHealth();
doorText.textContent = `🚪 Door ${door}`;
statusText.textContent = "🚪 Exploring door...";
