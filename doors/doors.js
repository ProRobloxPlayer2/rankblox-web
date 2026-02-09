document.addEventListener("DOMContentLoaded", () => {
  let health = 100;
  let hiding = false;
  let rushActive = false;
  let door = 1;
  let hideUsedThisEntity = false;

  const healthText = document.getElementById("health");
  const statusText = document.getElementById("status");
  const hideBtn = document.getElementById("hideBtn");
  const openDoorBtn = document.getElementById("openDoorBtn");
  const doorText = document.getElementById("doorCount");

  /* =========================
     UI SAFETY
  ========================= */

  function keepHideButtonActive() {
    if (health > 0) {
      hideBtn.disabled = false;
    }
  }

  setInterval(keepHideButtonActive, 200);

  /* =========================
     HEALTH
  ========================= */

  function updateHealth() {
    healthText.textContent = health;
    if (health <= 0) {
      statusText.textContent = "💀 You died.";
      hideBtn.disabled = true;
      openDoorBtn.disabled = true;
    }
  }

  /* =========================
     ENTITY SELECTOR
  ========================= */

  function spawnEntity() {
    const ambushChance = Math.min(door / 100, 0.35);
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
    keepHideButtonActive();

    rushActive = true;
    hiding = false;
    hideUsedThisEntity = false;

    hideBtn.textContent = "Hide in Closet";
    statusText.textContent = "⚠️ Rush is coming! Hide in 3 seconds!";

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
    keepHideButtonActive();

    rushActive = true;
    hiding = false;
    hideUsedThisEntity = false;

    const rebounds = Math.floor(Math.random() * 10) + 3;
    let current = 0;

    hideBtn.textContent = "Hide in Closet";
    statusText.textContent = "🟢 Ambush is coming! Hide NOW!";

    function rebound() {
      if (health <= 0) return;

      current++;
      statusText.textContent = `🟢 Ambush rebound ${current}/${rebounds}`;

      setTimeout(() => {
        if (!hiding) {
          statusText.textContent = "💀 Ambush caught you.";
          health = 0;
          updateHealth();
          return;
        }

        if (current < rebounds) {
          setTimeout(rebound, 1200);
        } else {
          statusText.textContent = "✅ You survived Ambush...";
          kickOutOnce();
          rushActive = false;
        }
      }, 1500);
    }

    setTimeout(rebound, 2500);
  }

  /* =========================
     CLOSET / HIDE
  ========================= */

  function kickOutOnce() {
    if (hideUsedThisEntity) return;
    hideUsedThisEntity = true;

    setTimeout(() => {
      if (!hiding || health <= 0) return;

      hiding = false;
      hideBtn.textContent = "Hide in Closet";

      health -= 20;
      updateHealth();
      statusText.textContent = "🚪 Hide kicked you out after 10 seconds (-20 HP)";
    }, 10000);
  }

  hideBtn.addEventListener("click", () => {
    keepHideButtonActive();
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
     SPAWN LOOP (INCREASING RATE)
  ========================= */

  function getSpawnInterval() {
    const base = 15000;
    const reduction = Math.min(door * 100, 8000);
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
