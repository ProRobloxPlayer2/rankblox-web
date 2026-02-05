document.addEventListener("DOMContentLoaded", () => {
  let health = 100;
  let hiding = false;
  let rushActive = false;
  let door = 1;

  const healthText = document.getElementById("health");
  const statusText = document.getElementById("status");
  const hideBtn = document.getElementById("hideBtn");
  const openDoorBtn = document.getElementById("openDoorBtn");
  const doorText = document.getElementById("doorCount");

  function updateHealth() {
    healthText.textContent = health;
    if (health <= 0) {
      statusText.textContent = "💀 You died.";
      hideBtn.disabled = true;
      openDoorBtn.disabled = true;
    }
  }

  function spawnRush() {
    rushActive = true;
    hiding = false;
    hideBtn.disabled = false;

    statusText.textContent = "⚠️ Rush is coming! Hide in 3 seconds!";

    setTimeout(() => {
      hideBtn.disabled = true;

      if (hiding) {
        statusText.textContent = "✅ You survived Rush...";
        kickOut();
      } else {
        statusText.textContent = "💀 Rush got you.";
        health = 0;
        updateHealth();
      }

      rushActive = false;
    }, 3000);
  }

  function kickOut() {
    setTimeout(() => {
      health -= 20;
      updateHealth();
      statusText.textContent = "🚪 You were kicked out of the closet (-20 HP)";
    }, 1500);
  }

  hideBtn.addEventListener("click", () => {
    if (rushActive) {
      hiding = true;
      statusText.textContent = "🫣 Hiding in the closet...";
    }
  });

  // 🔓 OPEN DOOR BUTTON (NEW)
 openDoorBtn.addEventListener("click", () => {
  if (health <= 0) return;

  door++;
  doorText.textContent = door;
  statusText.textContent = "🚪 You opened Door " + door + ". Exploring...";
});


  // Random Rush spawn every 8–15 seconds
  setInterval(() => {
    if (!rushActive && health > 0) {
      spawnRush();
    }
  }, Math.floor(Math.random() * 7000) + 8000);
});

