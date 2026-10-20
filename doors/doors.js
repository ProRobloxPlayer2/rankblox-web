from pathlib import Path

content = r'''// ===============================================
// RANKBLOX DOORS — complete replacement doors.js
// Works with the current doors.html and doors.css.
// ===============================================

"use strict";

// -------------------- Game state --------------------

let door = 1;
let health = 100;
let dead = false;
let gameEnded = false;

let hiding = false;
let crouching = false;

let closetTimer = null;
let rushTimer = null;
let screechTimer = null;
let ambushTimer = null;
let seekTimer = null;
let libraryTimerInterval = null;

let libraryCompleted = false;
let libraryLockActive = false;
let libraryBooks = [];
let libraryCollected = [];
let libraryTimer = 70;

let seekActive = false;
let seekDoors = 0;

let elevatorActive = false;
let elevatorRound = 0;
let elevatorPoints = 15;
let elevatorCorrect = [];

// -------------------- Find page elements --------------------

const $ = (id) => document.getElementById(id);

const doorText = $("door");
const healthText = $("health");
const statusText = $("status");

const openDoorBtn = $("openDoorBtn");
const hideBtn = $("hideBtn");
const crouchBtn = $("crouchBtn");

const libraryPanel = $("libraryPanel");
const libraryStatus = $("libraryStatus");
const booksDiv = $("books");
const cluesDiv = $("clues");

const libraryLockPanel = $("libraryLockPanel");
const libraryTimerText = $("libraryTimer");
const symbolList = $("symbolList");
const lockNumbers = $("lockNumbers");
const unlockLibraryBtn = $("unlockLibraryBtn");
const libraryLockStatus = $("libraryLockStatus");

const elevatorPanel = $("elevatorPanel");
const elevatorInstruction = $("elevatorInstruction");
const elevatorPointsText = $("elevatorPoints");
const switchesDiv = $("switches");
const confirmBtn = $("confirmBtn");

const endScreen = $("endScreen");
const endTitle = $("endTitle");
const endMessage = $("endMessage");

// -------------------- Small helpers --------------------

function setStatus(message) {
    if (statusText) statusText.textContent = message;
}

function updateDoorText() {
    if (doorText) doorText.textContent = `🚪 Door ${door}`;
}

function updateHealth() {
    health = Math.max(0, Math.min(100, health));

    if (healthText) healthText.textContent = `❤️ ${health}`;

    if (health <= 0 && !dead) {
        endGame(false);
    }
}

function damage(amount) {
    if (dead || gameEnded) return;
    health -= amount;
    updateHealth();
}

function clearGameTimers() {
    clearTimeout(closetTimer);
    clearTimeout(rushTimer);
    clearTimeout(screechTimer);
    clearInterval(ambushTimer);
    clearInterval(seekTimer);
    clearInterval(libraryTimerInterval);

    closetTimer = null;
    rushTimer = null;
    screechTimer = null;
    ambushTimer = null;
    seekTimer = null;
    libraryTimerInterval = null;
}

function setControlsDisabled(disabled) {
    if (openDoorBtn) openDoorBtn.disabled = disabled;
    if (hideBtn) hideBtn.disabled = disabled;
    if (crouchBtn) crouchBtn.disabled = disabled;
    if (unlockLibraryBtn) unlockLibraryBtn.disabled = disabled;
    if (confirmBtn) confirmBtn.disabled = disabled;
}

function hideAllPanels() {
    if (libraryPanel) libraryPanel.style.display = "none";
    if (libraryLockPanel) libraryLockPanel.style.display = "none";
    if (elevatorPanel) elevatorPanel.style.display = "none";
}

function showEndScreen(title, message) {
    if (endScreen && endTitle && endMessage) {
        endScreen.style.display = "block";
        endTitle.textContent = title;
        endMessage.textContent = message;
    } else {
        // Fallback if the end-screen HTML has not been added yet.
        alert(`${title}\n\n${message}`);
    }

    if (openDoorBtn) openDoorBtn.style.display = "none";
    if (hideBtn) hideBtn.style.display = "none";
    if (crouchBtn) crouchBtn.style.display = "none";

    hideAllPanels();
}

function saveScore(score) {
    // The game still works when the player is not logged in.
    if (typeof window.saveRankbloxHighScore !== "function") return;

    window.saveRankbloxHighScore("Rankblox Doors", score)
        .then((result) => {
            if (result && !result.success) {
                console.info("Rankblox score was not saved:", result.message);
            }
        })
        .catch((error) => {
            console.warn("Could not save Rankblox Doors score:", error);
        });
}

function endGame(won) {
    if (gameEnded) return;

    gameEnded = true;
    dead = !won;

    clearGameTimers();

    hiding = false;
    crouching = false;
    seekActive = false;
    elevatorActive = false;
    libraryLockActive = false;

    if (hideBtn) hideBtn.textContent = "🗄️ Hide in Closet";
    if (crouchBtn) crouchBtn.textContent = "🧎 Crouch";

    setControlsDisabled(true);

    if (healthText) healthText.textContent = `❤️ ${health}`;

    if (won) {
        setStatus("🏆 YOU ESCAPED!");
        saveScore(100);
        showEndScreen(
            "🏆 HOTEL COMPLETE!",
            "You restored the elevator and escaped the hotel!"
        );
    } else {
        setStatus("💀 You died.");
        saveScore(Math.max(0, door - 1));
        showEndScreen(
            "💀 You Died",
            `Your run ended at Door ${door}.`
        );
    }
}

// -------------------- Doors and room events --------------------

function openNextDoor() {
    if (dead || gameEnded) return;

    if (elevatorActive) {
        setStatus("🛗 Finish the elevator puzzle first!");
        return;
    }

    if (libraryLockActive) {
        setStatus("🔐 Finish the Door 50 lock first!");
        return;
    }

    // The Library blocks progress until its puzzle is solved.
    if (door === 50 && !libraryCompleted) {
        startLibrary();
        return;
    }

    // During the chase, each opened door counts as one of ten.
    if (seekActive) {
        if (!crouching) {
            setStatus("⚠️ You were caught because you were not crouching!");
            damage(100);
            return;
        }

        door += 1;
        seekDoors += 1;
        updateDoorText();

        if (seekDoors >= 10) {
            finishSeek();
        } else {
            setStatus(`🏃 Chase! Door ${seekDoors}/10 — stay crouched!`);
        }

        // Do not trigger other random events during the chase.
        if (door === 100) startElevator();
        return;
    }

    // Reaching Door 100 starts the elevator puzzle.
    if (door === 100) {
        startElevator();
        return;
    }

    door += 1;
    updateDoorText();
    setStatus("🚪 Exploring...");

    randomEvent();

    // Seek may begin between Doors 25 and 30.
    if (
        door >= 25 &&
        door <= 30 &&
        !seekActive &&
        Math.random() < 0.20
    ) {
        startSeek();
    }
}

function randomEvent() {
    if (dead || gameEnded || seekActive) return;

    const chance = Math.random();

    if (chance < 0.15) {
        startScreech();
    } else if (chance < 0.22) {
        startRush();
    } else if (chance < 0.27) {
        startAmbush();
    }
}

if (openDoorBtn) {
    openDoorBtn.addEventListener("click", openNextDoor);
}

// -------------------- Closet --------------------

function toggleCloset() {
    if (dead || gameEnded) return;

    if (!hiding) {
        hiding = true;

        if (hideBtn) hideBtn.textContent = "🚪 Exit Closet";
        setStatus("🗄️ You are hiding in the closet.");

        // Important: each closet visit gets a fresh, independent timer.
        clearTimeout(closetTimer);

        closetTimer = setTimeout(() => {
            closetTimer = null;

            if (!hiding || dead || gameEnded) return;

            hiding = false;

            if (hideBtn) hideBtn.textContent = "🗄️ Hide in Closet";

            setStatus("⚠️ Hide forced you out! You lost 20 health.");
            damage(20);
        }, 10000);
    } else {
        hiding = false;

        clearTimeout(closetTimer);
        closetTimer = null;

        if (hideBtn) hideBtn.textContent = "🗄️ Hide in Closet";
        setStatus("🚪 You left the closet.");
    }
}

if (hideBtn) hideBtn.addEventListener("click", toggleCloset);

// -------------------- Rush --------------------

function startRush() {
    if (dead || gameEnded) return;

    setStatus("⚠️ Something is approaching! Hide within 3 seconds!");
    alert("⚠️ RUSH IS COMING!\nYou have 3 seconds to hide!");

    clearTimeout(rushTimer);

    rushTimer = setTimeout(() => {
        rushTimer = null;

        if (dead || gameEnded) return;

        if (hiding) {
            setStatus("✅ You survived the attack by hiding!");
        } else {
            setStatus("💀 You didn't hide in time!");
            damage(100);
        }
    }, 3000);
}

// -------------------- Ambush --------------------

function startAmbush() {
    if (dead || gameEnded) return;

    const rebounds = Math.floor(Math.random() * 10) + 3; // 3–12
    let attack = 0;

    setStatus(`⚠️ Ambush is coming! ${rebounds} passes!`);
    alert(`⚠️ AMBUSH!\nIt will pass ${rebounds} times. Hide!`);

    clearInterval(ambushTimer);

    ambushTimer = setInterval(() => {
        if (dead || gameEnded) {
            clearInterval(ambushTimer);
            ambushTimer = null;
            return;
        }

        attack += 1;
        setStatus(`⚠️ Ambush pass ${attack}/${rebounds}...`);

        if (!hiding) {
            clearInterval(ambushTimer);
            ambushTimer = null;
            damage(100);
            return;
        }

        if (attack >= rebounds) {
            clearInterval(ambushTimer);
            ambushTimer = null;
            setStatus("✅ You survived Ambush!");
        }
    }, 1000);
}

// -------------------- Screech --------------------

function startScreech() {
    if (dead || gameEnded) return;

    const controls = $("controls");
    if (!controls) return;

    setStatus("👁️ Something is watching you! Click LOOK within 4 seconds.");

    const screechButton = document.createElement("button");
    screechButton.type = "button";
    screechButton.textContent = "👁️ LOOK!";
    screechButton.id = "screechButton";
    controls.appendChild(screechButton);

    let handled = false;

    const removeButton = () => {
        if (screechButton.isConnected) screechButton.remove();
    };

    screechButton.addEventListener("click", () => {
        if (handled || dead || gameEnded) return;

        handled = true;
        clearTimeout(screechTimer);
        screechTimer = null;
        removeButton();
        setStatus("✅ You noticed Screech in time!");
    });

    clearTimeout(screechTimer);
    screechTimer = setTimeout(() => {
        screechTimer = null;

        if (handled || dead || gameEnded) return;

        handled = true;
        removeButton();
        setStatus("⚠️ You didn't look in time! -40 health.");
        damage(40);
    }, 4000);
}

// -------------------- Seek chase --------------------

function startSeek() {
    if (dead || gameEnded || seekActive) return;

    seekActive = true;
    seekDoors = 0;
    crouching = false;

    if (crouchBtn) {
        crouchBtn.style.display = "inline-block";
        crouchBtn.textContent = "🧎 Crouch";
    }

    setStatus("⚠️ CHASE! Crouch before opening each door!");
    alert("⚠️ THE CHASE HAS STARTED!\nClick Crouch, then open doors. Stay crouched for 10 doors.");
}

function toggleCrouch() {
    if (dead || gameEnded || !seekActive) return;

    crouching = !crouching;

    if (crouchBtn) {
        crouchBtn.textContent = crouching ? "🧍 Stand Up" : "🧎 Crouch";
    }

    setStatus(crouching ? "🧎 You're crouching. Keep opening doors!" : "⚠️ You're standing. Crouch before opening the next door!");
}

function finishSeek() {
    seekActive = false;
    crouching = false;

    if (crouchBtn) {
        crouchBtn.style.display = "none";
        crouchBtn.textContent = "🧎 Crouch";
    }

    setStatus("✅ You escaped the chase!");
}

if (crouchBtn) crouchBtn.addEventListener("click", toggleCrouch);

// -------------------- Door 50 Library --------------------

function startLibrary() {
    if (dead || gameEnded || libraryCompleted) return;

    if (libraryPanel) libraryPanel.style.display = "block";
    if (openDoorBtn) openDoorBtn.style.display = "none";

    if (libraryStatus) {
        libraryStatus.textContent = "Find all 5 books. Each book reveals a symbol and number.";
    }

    if (booksDiv) booksDiv.replaceChildren();
    if (cluesDiv) cluesDiv.textContent = "No clues collected yet.";

    libraryBooks = [];
    libraryCollected = [];

    const symbols = ["◆", "●", "▲", "★", "■"];

    for (let i = 0; i < 5; i++) {
        libraryBooks.push({
            number: Math.floor(Math.random() * 9) + 1,
            symbol: symbols[i],
            collected: false
        });
    }

    libraryBooks.forEach((book, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "book";
        button.textContent = `📖 Book ${index + 1}`;

        button.addEventListener("click", () => collectBook(index, button));

        if (booksDiv) booksDiv.appendChild(button);
    });
}

function collectBook(index, button) {
    const book = libraryBooks[index];

    if (!book || book.collected || dead || gameEnded) return;

    book.collected = true;
    libraryCollected.push(book);

    button.disabled = true;
    button.textContent = `✅ ${book.symbol} = ${book.number}`;

    if (cluesDiv) {
        const clue = document.createElement("div");
        clue.className = "library-clue";
        clue.textContent = `${book.symbol} = ${book.number}`;
        cluesDiv.appendChild(clue);
    }

    if (libraryCollected.length === 5) {
        startLibraryLock();
    }
}

function startLibraryLock() {
    libraryLockActive = true;

    if (libraryPanel) libraryPanel.style.display = "none";
    if (libraryLockPanel) libraryLockPanel.style.display = "block";
    if (libraryLockStatus) libraryLockStatus.textContent = "";

    const sortedBooks = [...libraryBooks].sort((a, b) => a.number - b.number);

    if (symbolList) {
        symbolList.replaceChildren();

        sortedBooks.forEach((book, index) => {
            const clue = document.createElement("div");
            clue.className = "library-clue";
            clue.textContent = `${index + 1}. ${book.symbol} = ${book.number}`;
            symbolList.appendChild(clue);
        });
    }

    if (lockNumbers) lockNumbers.replaceChildren();

    // Each dial is one digit (1–9), and the books' numbers are single digits.
    sortedBooks.forEach(() => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "lock-number";
        button.dataset.value = "1";
        button.textContent = "1";

        button.addEventListener("click", () => {
            let value = Number(button.dataset.value) + 1;
            if (value > 9) value = 1;
            button.dataset.value = String(value);
            button.textContent = String(value);
        });

        if (lockNumbers) lockNumbers.appendChild(button);
    });

    libraryTimer = 70;
    updateLibraryTimer();

    clearInterval(libraryTimerInterval);

    libraryTimerInterval = setInterval(() => {
        if (dead || gameEnded || !libraryLockActive) {
            clearInterval(libraryTimerInterval);
            libraryTimerInterval = null;
            return;
        }

        libraryTimer -= 1;
        updateLibraryTimer();

        if (libraryTimer <= 0) {
            clearInterval(libraryTimerInterval);
            libraryTimerInterval = null;

            if (libraryLockStatus) {
                libraryLockStatus.textContent = "⏰ Time's up!";
            }

            damage(100);
        }
    }, 1000);
}

function updateLibraryTimer() {
    if (libraryTimerText) {
        libraryTimerText.textContent = `⏱️ Time: ${libraryTimer}`;
    }
}

function checkLibraryLock() {
    if (dead || gameEnded || !libraryLockActive) return;

    const sortedBooks = [...libraryBooks].sort((a, b) => a.number - b.number);
    const dials = lockNumbers ? lockNumbers.querySelectorAll(".lock-number") : [];

    const correct = sortedBooks.every((book, index) => {
        return Number(dials[index]?.dataset.value) === book.number;
    });

    if (!correct) {
        if (libraryLockStatus) libraryLockStatus.textContent = "❌ Wrong combination!";
        damage(100);
        return;
    }

    clearInterval(libraryTimerInterval);
    libraryTimerInterval = null;
    libraryLockActive = false;
    libraryCompleted = true;

    if (libraryLockPanel) libraryLockPanel.style.display = "none";
    if (openDoorBtn) openDoorBtn.style.display = "inline-block";

    door = 51;
    updateDoorText();
    setStatus("🔓 Door 50 unlocked! Continue to Door 51.");
}

if (unlockLibraryBtn) {
    unlockLibraryBtn.addEventListener("click", checkLibraryLock);
}

// -------------------- Door 100 Elevator puzzle --------------------

function startElevator() {
    if (dead || gameEnded || elevatorActive) return;

    elevatorActive = true;
    elevatorRound = 0;
    elevatorPoints = 15;

    if (openDoorBtn) openDoorBtn.style.display = "none";
    if (elevatorPanel) elevatorPanel.style.display = "block";

    updateElevatorPoints();
    nextElevatorRound();
}

function nextElevatorRound() {
    if (dead || gameEnded) return;

    elevatorRound += 1;

    if (elevatorRound > 3) {
        if (elevatorPoints >= 30) {
            winGame();
        } else {
            setStatus("⚠️ The elevator power wasn't restored. Try again on a new run.");
            damage(100);
        }
        return;
    }

    if (switchesDiv) switchesDiv.replaceChildren();

    elevatorCorrect = Array.from({ length: 10 }, () => Math.random() < 0.5);

    const onSwitches = [];
    const offSwitches = [];

    elevatorCorrect.forEach((isOn, index) => {
        (isOn ? onSwitches : offSwitches).push(index + 1);
    });

    if (elevatorInstruction) {
        elevatorInstruction.innerHTML =
            `Round ${elevatorRound}/3<br><br>` +
            `🟢 ON: ${onSwitches.join(", ")}<br>` +
            `⚫ OFF: ${offSwitches.join(", ")}`;
    }

    for (let i = 0; i < 10; i++) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "switch";
        button.dataset.on = "false";
        button.textContent = `Switch ${i + 1}: OFF`;

        button.addEventListener("click", () => {
            const isOn = button.dataset.on === "true";
            button.dataset.on = String(!isOn);
            button.textContent = `Switch ${i + 1}: ${isOn ? "OFF" : "ON"}`;
        });

        if (switchesDiv) switchesDiv.appendChild(button);
    }
}

function updateElevatorPoints() {
    if (elevatorPointsText) {
        elevatorPointsText.textContent = `Points: ${elevatorPoints}`;
    }
}

function checkElevator() {
    if (dead || gameEnded || !elevatorActive) return;

    const switches = switchesDiv
        ? switchesDiv.querySelectorAll(".switch")
        : [];

    let allCorrect = switches.length === 10;

    switches.forEach((button, index) => {
        const playerState = button.dataset.on === "true";
        if (playerState !== elevatorCorrect[index]) allCorrect = false;
    });

    if (allCorrect) {
        elevatorPoints += 10;
        alert("✅ All switches are correct! +10 points.");
    } else {
        elevatorPoints -= 5;
        alert("❌ Some switches are wrong. -5 points.");
    }

    updateElevatorPoints();

    if (elevatorPoints <= 0) {
        damage(100);
        return;
    }

    if (elevatorPoints >= 30) {
        winGame();
        return;
    }

    if (elevatorRound < 3) {
        nextElevatorRound();
    } else {
        // The player has completed all three rounds without reaching 30.
        setStatus("⚠️ The elevator still needs more power.");
        damage(100);
    }
}

if (confirmBtn) confirmBtn.addEventListener("click", checkElevator);

function winGame() {
    if (gameEnded) return;
    endGame(true);
}

// -------------------- Start game --------------------

if (endScreen) endScreen.style.display = "none";
if (libraryPanel) libraryPanel.style.display = "none";
if (libraryLockPanel) libraryLockPanel.style.display = "none";
if (elevatorPanel) elevatorPanel.style.display = "none";

if (hideBtn) hideBtn.textContent = "🗄️ Hide in Closet";
if (crouchBtn) {
    crouchBtn.style.display = "none";
    crouchBtn.textContent = "🧎 Crouch";
}

updateDoorText();
updateHealth();
setStatus("🚪 Exploring...");
'''
path = Path("/mnt/data/doors.js")
path.write_text(content, encoding="utf-8")
print(f"Created {path} ({len(content.splitlines())} lines)")
