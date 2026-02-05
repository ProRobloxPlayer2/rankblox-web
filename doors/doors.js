document.addEventListener("DOMContentLoaded", () => {
  let health = 100;
  let hiding = false;
  let rushActive = false;
  let door = 1;
  let hideUsedThisRush = false;

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
    hideUsedThisRush = false;

    hideBtn.disabled = false;
    hideBtn.textContent = "Hide in Closet";

    statusText.textContent = "⚠️ Rush is coming! Hide in 3 seconds!";

   function spawnRush() {
  rushActive = true;
  hiding = false;
  hideUsedThisRush = false;

  hideBtn.disabled = false;
  hideBtn.textContent = "Hide in Closet";

  statusText.textContent = "⚠️ Rush is coming! Hide in 3 seconds!";

  setTimeout(() => {
    if (hiding) {
      statusText.textContent = "✅ You survived Rush...";
      kickOutOnce(); // Hide timer starts
    } else {
      statusText.textContent = "💀 Rush got you.";
      health = 0;
      updateHealth();
      hideBtn.disabled = true;
    }

    rushActive = false;
  }, 3000);
}


  function kickOutOnce() {
  if (hideUsedThisRush) return;
  hideUsedThisRush = true;

  setTimeout(() => {
    if (!hiding) return;

    hiding = false;
    hideBtn.textContent = "Hide in Closet";
    hideBtn.disabled = true;

    health -= 20;
    updateHealth();
    statusText.textContent = "🚪 Hide kicked you out after 10 seconds (-20 HP)";
  }, 10000);
}

  hideBtn.addEventListener("click", () => {
    if (!rushActive) return;

    if (!hiding) {
      // ENTER CLOSET
      hiding = true;
      hideBtn.textContent = "Exit Closet";
      statusText.textContent = "🫣 Hiding in the closet...";
    } else {
      // EXIT CLOSET
      hiding = false;
      hideBtn.textContent = "Hide in Closet";
      statusText.textContent = "🚶 You exited the closet.";
    }
  });

  // OPEN DOOR (unchanged)
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

