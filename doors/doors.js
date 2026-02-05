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

  /* =========================
     ENTITY SPAWNING
  ========================= */

  function spawnEntity() {
    const ambushChance = Math.min(door / 100, 0.35); // up to 35% chance
    if (Math.random() < ambushChance) {
      spawnAmbush();
    } else {
      spawnRush();
    }
  }

  /* =========================
     RUSH
  ========================= */

  function spawnRush() {
    rushActive = true;
    hiding = false;
    hideUsedThisRush = false;

    statusText.textContent = "⚠️ Rush is coming! Hide in 3 seconds!";
    hideBtn.textContent = "Hide in Closet";

    setTimeout(() => {
      if (hiding) {
        statusText.textContent = "✅ You survived Rush...";
        kickOutOnce();
      } else {
        statusText.textContent = "💀 Rush got you.";
        health = 0;
        updateHealth();
      }
      rushActive = false;
    }, 3000);
  }

  /* =========================
     AMBUSH
  ========================= */

  function spawnAmbush() {
    rushActive = true;
    hiding = false;
    hideUsedThisRush = false;

    const rebounds = Math.floor(Math.random() * 10) + 3; // 3–12
    let currentRebound = 0;

    statusText.textContent = "🟢 Ambush is coming! Hide now!";
    hideBtn.textContent = "Hide in Closet";

    function ambushAttack() {
      if (health <= 0) return;

      currentRebound++;
      statusText.textContent = `🟢 Ambush rebound ${currentRebound}/${rebounds}`;

      setTimeout(() => {
        if (!hiding) {
          statusText.textContent = "💀 Ambush caught you.";
          health = 0;
          updateHealth();
          return;
        }

        if (currentRebound < rebounds) {
          setTimeout(ambushAttack, 1200);
        } else {
          statusText.textContent = "✅ You survived Ambush...";
          kickOutOnce();
          rushActive = false;
        }
      }, 1500);
    }

    setTimeout(ambushAttack, 2500);
  }

  /* =========================
     HIDE / CLOSET
  ========================= */

  function kickOutOnce() {
    if (hideUsedThisRush) return;
    hideUsedThisRush = true;

    setTimeout(() => {
      if (!hiding || health <= 0) return;

      hiding = false;
      hideBtn.textContent = "Hide in Closet";

      health -= 20;
      updateHealth();
      statusText.textContent = "🚪 Hide kicked you out (-20 HP)";
    }, 10000);
  }

  hideBtn.addEventListener("click", () => {
    if (!rushActive || health <= 0) return;

    if (!hiding) {
      hiding = true;
      hideBtn.textContent = "Exit Closet";
      statusText.textContent = "🫣 Hiding in the closet...";
    } else {
      hiding = false;
      hideBtn.textContent = "Hide in Closet";
      statusText.textContent = "🚶 You exited the closet.";
    }
  });

  /* =========================
     OPEN DOOR
  ========================= */

  openDoorBtn.addEventListener("click", () => {
    if (health <= 0) return;

    door++;
    doorText.textContent = door;
    statusText.textContent = "🚪 You opened Door " + door + ". Exploring...";
  });

  /* =========================
     SPAWN TIMER (INCREASING RATE)
  ========================= */

  function getSpawnInterval() {
    const base = 15000; // 15s early game
    const reduction = Math.min(door * 100, 8000); // faster later
    return base - reduction;
  }

  function spawnLoop() {
    if (health > 0 && !rushActive) {
      spawnEntity();
    }
    setTimeout(spawnLoop, getSpawnInterval());
  }

  spawnLoop();
});
