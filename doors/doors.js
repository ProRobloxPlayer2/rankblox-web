let door = 1;
const maxDoors = 100;
let alive = true;

const statusText = document.getElementById("status");
const warningText = document.getElementById("warning");
const doorBtn = document.getElementById("doorBtn");

doorBtn.onclick = () => {
  if (!alive) return;

  door++;

  // Random entity chance (20%)
  if (Math.random() < 0.2) {
    spawnEntity();
    return;
  }

  if (door >= maxDoors) {
    statusText.textContent = "🎉 You Escaped!";
    doorBtn.disabled = true;
    return;
  }

  statusText.textContent = "Door " + door;
};

function spawnEntity() {
  warningText.textContent = "⚠️ You hear something...";
  doorBtn.disabled = true;

  setTimeout(() => {
    const survived = Math.random() < 0.5;

    if (survived) {
      warningText.textContent = "😮 You survived!";
      statusText.textContent = "Door " + door;
      doorBtn.disabled = false;
    } else {
      warningText.textContent = "💀 You Died";
      alive = false;
      doorBtn.disabled = true;
    }
  }, 2000);
}
