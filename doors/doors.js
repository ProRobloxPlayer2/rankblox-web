// =====================================================
// RANKBLOX DOORS
// =====================================================


// =====================================================
// CORE GAME STATE
// =====================================================

let door = 1;
let health = 100;

let dead = false;

let hiding = false;
let crouching = false;

let libraryCompleted = false;

let seekActive = false;

let libraryLockActive = false;

let elevatorActive = false;


// =====================================================
// GET HTML ELEMENTS
// =====================================================

const doorText =
    document.getElementById("door");

const healthText =
    document.getElementById("health");

const statusText =
    document.getElementById("status");

const openDoorBtn =
    document.getElementById("openDoorBtn");

const hideBtn =
    document.getElementById("hideBtn");

const crouchBtn =
    document.getElementById("crouchBtn");


// Library

const libraryPanel =
    document.getElementById("libraryPanel");

const booksDiv =
    document.getElementById("books");

const cluesText =
    document.getElementById("clues");

const bookBtn =
    document.getElementById("bookBtn");


// Library lock

const libraryLockPanel =
    document.getElementById("libraryLockPanel");

const libraryTimer =
    document.getElementById("libraryTimer");

const symbolList =
    document.getElementById("symbolList");

const lockNumbers =
    document.getElementById("lockNumbers");

const unlockLibraryBtn =
    document.getElementById("unlockLibraryBtn");

const libraryLockStatus =
    document.getElementById("libraryLockStatus");


// Elevator

const elevatorPanel =
    document.getElementById("elevatorPanel");

const elevatorInstruction =
    document.getElementById("elevatorInstruction");

const elevatorPointsText =
    document.getElementById("elevatorPoints");

const switchesDiv =
    document.getElementById("switches");

const confirmBtn =
    document.getElementById("confirmBtn");


// =====================================================
// HEALTH
// =====================================================

function updateHealth() {

    if (health <= 0) {

        health = 0;

        dead = true;

        statusText.textContent =
            "💀 You died.";

        openDoorBtn.disabled = true;

        hideBtn.disabled = true;

        crouchBtn.disabled = true;
    }

    healthText.textContent =
        `❤️ ${health}`;
}


// =====================================================
// DAMAGE
// =====================================================

function damage(amount, reason) {

    if (dead) return;

    health -= amount;

    if (reason) {
        statusText.textContent = reason;
    }

    updateHealth();
}


// =====================================================
// INITIAL GAME
// =====================================================

doorText.textContent =
    `🚪 Door ${door}`;

healthText.textContent =
    `❤️ ${health}`;

statusText.textContent =
    "🚪 Exploring...";


// =====================================================
// OPEN DOOR
// =====================================================

openDoorBtn.onclick = () => {

    if (dead) return;

    if (elevatorActive) {

        alert("⚠️ Restore the elevator power first.");

        return;
    }


    // =============================================
    // LIBRARY LOCK
    // =============================================

    if (door === 50 && !libraryCompleted) {

        startLibrary();

        return;
    }


    // =============================================
    // SEEK CHASE
    // =============================================

    if (seekActive && !crouching) {

        damage(
            100,
            "💀 You were caught because you weren't crouching."
        );

        alert("💀 You were caught!");

        return;
    }


    // =============================================
    // DOOR 100
    // =============================================

    if (door === 100) {

        startElevator();

        return;
    }


    // =============================================
    // NORMAL DOOR
    // =============================================

    door++;

    doorText.textContent =
        `🚪 Door ${door}`;

    statusText.textContent =
        "🚶 Exploring...";


    // =============================================
    // RANDOM EVENTS
    // =============================================

    randomRoomEvent();


    // =============================================
    // SEEK START
    // =============================================

    if (
        door >= 25 &&
        door <= 30 &&
        Math.random() < 0.20 &&
        !seekActive
    ) {

        startSeek();
    }
};


// =====================================================
// RANDOM ROOM EVENTS
// =====================================================

function randomRoomEvent() {

    if (dead) return;

    const chance =
        Math.random();

    // Screech

    if (chance < 0.15) {

        startScreech();

        return;
    }


    // Rush

    if (chance < 0.22) {

        startRush();

        return;
    }


    // Ambush

    if (chance < 0.27) {

        startAmbush();

        return;
    }
}


// =====================================================
// CLOSET
// =====================================================

hideBtn.onclick = () => {

    if (dead) return;

    if (!hiding) {

        hiding = true;

        hideBtn.textContent =
            "🚪 Exit Closet";

        statusText.textContent =
            "🗄️ You are hiding in the closet.";

        // Automatically leave after 10 seconds

        setTimeout(() => {

            if (!hiding || dead) return;

            hiding = false;

            hideBtn.textContent =
                "🗄️ Hide in Closet";

            damage(
                20,
                "⚠️ You stayed in the closet too long."
            );

        }, 10000);

    } else {

        hiding = false;

        hideBtn.textContent =
            "🗄️ Hide in Closet";

        statusText.textContent =
            "🚶 You left the closet.";
    }
};


// =====================================================
// RUSH
// =====================================================

function startRush() {

    if (dead) return;

    statusText.textContent =
        "⚡ Something is coming!";

    alert(
        "⚡ WARNING!\n\n" +
        "Something is rushing through the rooms!\n" +
        "Hide in the closet!"
    );

    setTimeout(() => {

        if (dead) return;

        if (hiding) {

            statusText.textContent =
                "🗄️ You survived the attack.";

        } else {

            damage(
                100,
                "💀 You were caught by the rushing entity."
            );

            alert("💀 You were caught!");
        }

    }, 3000);
}


// =====================================================
// AMBUSH
// =====================================================

function startAmbush() {

    if (dead) return;

    const rebounds =
        Math.floor(Math.random() * 8) + 3;

    statusText.textContent =
        "🔄 Something is coming back...";

    alert(
        `🔄 WARNING!\n\n` +
        `The entity may return ${rebounds} times!\n` +
        `Stay hidden.`
    );

    let currentRebound = 0;

    const attack = () => {

        if (dead) return;

        currentRebound++;

        if (!hiding) {

            damage(
                100,
                "💀 You were caught."
            );

            alert("💀 You were caught!");

            return;
        }

        statusText.textContent =
            `🗄️ Survived rebound ${currentRebound}/${rebounds}`;

        if (currentRebound < rebounds) {

            setTimeout(
                attack,
                700
            );

        } else {

            statusText.textContent =
                "🚪 The danger has passed.";
        }
    };

    setTimeout(
        attack,
        1500
    );
}


// =====================================================
// SCREECH
// =====================================================

function startScreech() {

    if (dead) return;

    let clicked = false;

    const screech =
        document.createElement("button");

    screech.textContent =
        "👁️ SCREECH! CLICK ME!";

    screech.id =
        "screechButton";

    document.getElementById("controls")
        .appendChild(screech);

    screech.onclick = () => {

        clicked = true;

        screech.remove();

        statusText.textContent =
            "👁️ You stopped the Screech.";
    };

    setTimeout(() => {

        if (clicked || dead) return;

        screech.remove();

        damage(
            40,
            "👁️ You ignored the Screech."
        );

    }, 4000);
}


// =====================================================
// CROUCH
// =====================================================

crouchBtn.onclick = () => {

    if (dead) return;

    crouching = !crouching;

    if (crouching) {

        crouchBtn.textContent =
            "🧎 Stand Up";

        statusText.textContent =
            "🧎 You are crouching.";

    } else {

        crouchBtn.textContent =
            "🧎 Crouch";

        statusText.textContent =
            "🚶 You stood up.";
    }
};


// =====================================================
// SEEK
// =====================================================

function startSeek() {

    if (seekActive || dead) return;

    seekActive = true;

    crouching = false;

    crouchBtn.style.display =
        "inline-block";

    statusText.textContent =
        "🏃 A chase has started!";

    alert(
        "🏃 CHASE!\n\n" +
        "Crouch before opening doors."
    );

    let chaseDoors = 0;

    const chaseInterval =
        setInterval(() => {

            if (dead) {

                clearInterval(chaseInterval);

                return;
            }

            if (!seekActive) {

                clearInterval(chaseInterval);

                return;
            }

            chaseDoors++;

            if (chaseDoors >= 10) {

                seekActive = false;

                crouching = false;

                crouchBtn.style.display =
                    "none";

                statusText.textContent =
                    "🏃 You escaped the chase!";

                alert(
                    "🏃 You escaped!"
                );

                clearInterval(chaseInterval);
            }

        }, 5000);
}


// =====================================================
// LIBRARY
// =====================================================

let libraryBooks = [];

let collectedBooks = [];

let libraryTimerValue = 70;

let libraryTimerInterval = null;


// Symbols

const librarySymbols = [
    "◆",
    "●",
    "▲",
    "★",
    "■"
];


// =====================================================
// START LIBRARY
// =====================================================

function startLibrary() {

    if (libraryCompleted || dead) return;

    libraryPanel.style.display =
        "block";

    openDoorBtn.style.display =
        "none";

    statusText.textContent =
        "📚 You entered the Library.";

    libraryBooks = [];

    collectedBooks = [];


    // Generate five books

    for (let i = 0; i < 5; i++) {

        const number =
            Math.floor(Math.random() * 99) + 1;

        const symbol =
            librarySymbols[i];

        libraryBooks.push({
            number: number,
            symbol: symbol
        });
    }


    renderLibraryBooks();

    cluesText.textContent =
        "📖 Collect all 5 books.";

}


// =====================================================
// RENDER BOOKS
// =====================================================

function renderLibraryBooks() {

    booksDiv.innerHTML = "";

    libraryBooks.forEach((book, index) => {

        const button =
            document.createElement("button");

        button.className =
            "book";

        button.textContent =
            `📖 Book ${index + 1}`;

        button.onclick = () => {

            collectBook(index);

        };

        booksDiv.appendChild(button);

    });
}


// =====================================================
// COLLECT BOOK
// =====================================================

function collectBook(index) {

    if (dead) return;

    if (collectedBooks.includes(index)) return;

    collectedBooks.push(index);

    const book =
        libraryBooks[index];

    cluesText.textContent +=
        `\n ${book.symbol} = ${book.number}`;

    statusText.textContent =
        `📖 Found ${book.symbol} = ${book.number}`;


    if (collectedBooks.length === 5) {

        statusText.textContent =
            "📚 All books collected!";

        setTimeout(() => {

            startLibraryLock();

        }, 500);

    }
}


// =====================================================
// LIBRARY LOCK
// =====================================================

let libraryCorrectCode = [];

let libraryPlayerCode = [];


// =====================================================
// START LOCK
// =====================================================

function startLibraryLock() {

    libraryPanel.style.display =
        "none";

    libraryLockPanel.style.display =
        "block";

    openDoorBtn.style.display =
        "none";

    libraryLockActive = true;

    libraryTimerValue = 70;

    libraryCorrectCode = [];

    libraryPlayerCode = [];


    // Sort books by number

    const sortedBooks =
        [...libraryBooks].sort(
            (a, b) => a.number - b.number
        );


    // Correct symbol order

    libraryCorrectCode =
        sortedBooks.map(
            book => book.symbol
        );


    // Show clues

    symbolList.innerHTML = "";

    libraryBooks.forEach(book => {

        const line =
            document.createElement("div");

        line.className =
            "library-clue";

        line.textContent =
            `${book.symbol} = ${book.number}`;

        symbolList.appendChild(line);

    });


    // Create lock

    createLock();


    updateLibraryTimer();


    clearInterval(
        libraryTimerInterval
    );


    libraryTimerInterval =
        setInterval(() => {

            libraryTimerValue--;

            updateLibraryTimer();

            if (libraryTimerValue <= 0) {

                clearInterval(
                    libraryTimerInterval
                );

                libraryLockActive = false;

                damage(
                    100,
                    "💀 You ran out of time."
                );

                alert(
                    "💀 The 70-second timer expired!"
                );
            }

        }, 1000);
}


// =====================================================
// CREATE LOCK
// =====================================================

function createLock() {

    lockNumbers.innerHTML = "";

    libraryPlayerCode =
        libraryCorrectCode.map(
            () => 0
        );


    for (
        let i = 0;
        i < libraryCorrectCode.length;
        i++
    ) {

        const button =
            document.createElement("button");

        button.className =
            "lock-number";

        button.textContent =
            "0";


        button.onclick = () => {

            libraryPlayerCode[i]++;

            if (
                libraryPlayerCode[i] > 9
            ) {

                libraryPlayerCode[i] = 0;
            }

            button.textContent =
                libraryPlayerCode[i];

        };


        lockNumbers.appendChild(
            button
        );
    }
}


// =====================================================
// LIBRARY TIMER
// =====================================================

function updateLibraryTimer() {

    libraryTimer.textContent =
        `⏱️ Time: ${libraryTimerValue}`;
}


// =====================================================
// UNLOCK LIBRARY
// =====================================================

unlockLibraryBtn.onclick = () => {

    if (!libraryLockActive) return;

    const buttons =
        document.querySelectorAll(
            ".lock-number"
        );


    const playerNumbers =
        Array.from(buttons).map(
            button =>
                Number(button.textContent)
        );


    // Convert correct symbols into numbers

    const correctNumbers =
        [...libraryCorrectCode].map(
            symbol => {

                const book =
                    libraryBooks.find(
                        b => b.symbol === symbol
                    );

                return book.number;
            }
        );


    const correct =
        playerNumbers.length ===
            correctNumbers.length &&

        playerNumbers.every(
            (number, index) =>
                number === correctNumbers[index]
        );


    if (correct) {

        clearInterval(
            libraryTimerInterval
        );

        libraryLockActive = false;

        libraryCompleted = true;


        libraryLockPanel.style.display =
            "none";

        openDoorBtn.style.display =
            "inline-block";


        door = 51;

        doorText.textContent =
            "🚪 Door 51";

        statusText.textContent =
            "🔓 Library lock opened!";


        alert(
            "🔓 Correct!\n\n" +
            "The Library lock has opened.\n" +
            "You may continue to Door 51."
        );

    } else {

        libraryLockStatus.textContent =
            "❌ Incorrect combination!";

        damage(
            100,
            "💀 The lock rejected your code."
        );

        alert(
            "❌ Wrong combination!"
        );
    }
};


// =====================================================
// ELEVATOR
// =====================================================

let elevatorRound = 0;

let elevatorPoints = 15;

let elevatorCorrect = [];

let elevatorPlayer = [];


// =====================================================
// START ELEVATOR
// =====================================================

function startElevator() {

    elevatorActive = true;

    elevatorRound = 0;

    elevatorPoints = 15;

    elevatorPanel.style.display =
        "block";

    openDoorBtn.style.display =
        "none";

    alert(
        "🛗 POWER FAILURE\n\n" +
        "Complete the switch puzzles.\n" +
        "Correct: +10 points\n" +
        "Wrong: -5 points"
    );

    nextElevatorRound();
}


// =====================================================
// NEXT ELEVATOR ROUND
// =====================================================

function nextElevatorRound() {

    if (dead) return;


    if (elevatorPoints <= 0) {

        damage(
            100,
            "💀 The elevator power failed."
        );

        return;
    }


    if (elevatorRound >= 3) {

        winGame();

        return;
    }


    elevatorRound++;

    generateElevatorPuzzle();
}


// =====================================================
// GENERATE ELEVATOR PUZZLE
// =====================================================

function generateElevatorPuzzle() {

    elevatorCorrect = [];

    elevatorPlayer =
        Array(10).fill(false);


    for (let i = 0; i < 10; i++) {

        elevatorCorrect[i] =
            Math.random() < 0.5;
    }


    elevatorInstruction.textContent =
        `Round ${elevatorRound}/3 — Set each switch as instructed.`;


    elevatorPointsText.textContent =
        `Points: ${elevatorPoints}`;


    renderElevatorSwitches();
}


// =====================================================
// RENDER ELEVATOR SWITCHES
// =====================================================

function renderElevatorSwitches() {

    switchesDiv.innerHTML = "";


    for (let i = 0; i < 10; i++) {

        const button =
            document.createElement("button");

        button.className =
            "switch";


        button.textContent =
            `${i + 1}: OFF`;


        button.onclick = () => {

            elevatorPlayer[i] =
                !elevatorPlayer[i];


            button.textContent =
                `${i + 1}: ${
                    elevatorPlayer[i]
                        ? "ON"
                        : "OFF"
                }`;

        };


        switchesDiv.appendChild(
            button
        );
    }
}


// =====================================================
// ELEVATOR CONFIRM
// =====================================================

confirmBtn.onclick = () => {

    if (!elevatorActive) return;


    const correct =
        elevatorPlayer.every(
            (value, index) =>
                value ===
                elevatorCorrect[index]
        );


    if (correct) {

        elevatorPoints += 10;

        alert(
            `✅ Correct!\n\nPoints: ${elevatorPoints}`
        );

    } else {

        elevatorPoints -= 5;

        alert(
            `❌ Wrong!\n\nPoints: ${elevatorPoints}`
        );
    }


    elevatorPointsText.textContent =
        `Points: ${elevatorPoints}`;


    if (elevatorPoints <= 0) {

        damage(
            100,
            "💀 You ran out of power points."
        );

        return;
    }


    nextElevatorRound();
};


// =====================================================
// WIN
// =====================================================

function winGame() {

    elevatorActive = false;

    elevatorPanel.style.display =
        "none";


    statusText.textContent =
        "🏆 YOU ESCAPED!";


    alert(
        "🏆 CONGRATULATIONS!\n\n" +
        "You restored the elevator power.\n\n" +
        "You escaped the hotel!"
    );


    openDoorBtn.style.display =
        "none";
}
