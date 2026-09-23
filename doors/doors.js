// =================================
// RANKBLOX DOORS
// =================================

// =================================
// GAME VARIABLES
// =================================

let door = 1;
let health = 100;

let dead = false;
let hiding = false;
let crouching = false;

let libraryCompleted = false;
let libraryLockActive = false;

let seekActive = false;
let seekDoors = 0;

let elevatorActive = false;
let elevatorRound = 0;
let elevatorPoints = 15;

let libraryBooks = [];
let libraryCollected = [];

let libraryTimer = 70;
let libraryTimerInterval;


// =================================
// DOM ELEMENTS
// =================================

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

const libraryStatus =
    document.getElementById("libraryStatus");

const booksDiv =
    document.getElementById("books");

const cluesDiv =
    document.getElementById("clues");

const bookBtn =
    document.getElementById("bookBtn");


// Library Lock

const libraryLockPanel =
    document.getElementById("libraryLockPanel");

const libraryTimerText =
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


// End screen

const endScreen =
    document.getElementById("endScreen");

const endTitle =
    document.getElementById("endTitle");

const endMessage =
    document.getElementById("endMessage");


// =================================
// HEALTH
// =================================

function updateHealth() {

    if (health <= 0) {

        health = 0;

        dead = true;

        healthText.textContent =
            "❤️ 0";

        statusText.textContent =
            "💀 You died.";

        openDoorBtn.disabled = true;
        hideBtn.disabled = true;
        crouchBtn.disabled = true;

        showEndScreen(
            "💀 You Died",
            "Your run has ended."
        );

        return;
    }

    healthText.textContent =
        `❤️ ${health}`;
}


function damage(amount) {

    if (dead) return;

    health -= amount;

    updateHealth();
}


// =================================
// END SCREEN
// =================================

function showEndScreen(title, message) {

    endScreen.style.display = "block";

    endTitle.textContent = title;

    endMessage.textContent = message;

    openDoorBtn.style.display = "none";
    hideBtn.style.display = "none";
    crouchBtn.style.display = "none";

    libraryPanel.style.display = "none";
    libraryLockPanel.style.display = "none";
    elevatorPanel.style.display = "none";
}


// =================================
// OPEN DOOR
// =================================

openDoorBtn.addEventListener("click", function () {

    if (dead) return;

    if (elevatorActive) {

        alert(
            "You must restore the elevator power first!"
        );

        return;
    }


    // Door 50

    if (
        door === 50 &&
        !libraryCompleted
    ) {

        startLibrary();

        return;
    }


    // Seek chase

    if (seekActive) {

        if (!crouching) {

            alert(
                "⚠️ You were caught because you were not crouching!"
            );

            damage(100);

            return;
        }
    }


    // Door 100

    if (door === 100) {

        startElevator();

        return;
    }


    // Normal door

    door++;

    doorText.textContent =
        `🚪 Door ${door}`;

    statusText.textContent =
        "🚪 Exploring...";


    // Random events

    randomEvent();


    // Possible Seek

    if (
        door >= 25 &&
        door <= 30 &&
        Math.random() < 0.20 &&
        !seekActive
    ) {

        startSeek();
    }

});


// =================================
// RANDOM EVENTS
// =================================

function randomEvent() {

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


// =================================
// CLOSET
// =================================

hideBtn.addEventListener(
    "click",
    toggleCloset
);


function toggleCloset() {

    if (dead) return;


    if (!hiding) {

        hiding = true;

        hideBtn.textContent =
            "🚪 Exit Closet";

        statusText.textContent =
            "🗄️ You are hiding in the closet.";


        // Automatically kick player out

        setTimeout(function () {

            if (!hiding || dead) return;

            hiding = false;

            hideBtn.textContent =
                "🗄️ Hide in Closet";

            damage(20);

            if (!dead) {

                statusText.textContent =
                    "⚠️ The closet forced you out!";
            }

        }, 10000);

    }

    else {

        hiding = false;

        hideBtn.textContent =
            "🗄️ Hide in Closet";

        statusText.textContent =
            "🚪 You left the closet.";
    }
}


// =================================
// RUSH
// =================================

function startRush() {

    if (dead) return;

    statusText.textContent =
        "⚠️ Something is coming! HIDE!";

    alert(
        "⚠️ RUSH IS COMING!\nYou have 3 seconds to hide!"
    );


    setTimeout(function () {

        if (dead) return;


        if (hiding) {

            statusText.textContent =
                "🗄️ You survived the attack!";

        }

        else {

            damage(100);

        }

    }, 3000);
}


// =================================
// AMBUSH
// =================================

function startAmbush() {

    if (dead) return;

    const rebounds =
        Math.floor(Math.random() * 8) + 3;

    statusText.textContent =
        `⚠️ AMBUSH! ${rebounds} attacks incoming!`;

    alert(
        `⚠️ AMBUSH!\nIt will rebound ${rebounds} times!`
    );


    let attack = 0;


    const interval =
        setInterval(function () {

            if (dead) {

                clearInterval(interval);

                return;
            }


            attack++;


            if (!hiding) {

                damage(100);

                clearInterval(interval);

                return;
            }


            if (attack >= rebounds) {

                clearInterval(interval);

                statusText.textContent =
                    "🗄️ You survived Ambush!";
            }

        }, 1000);
}


// =================================
// SCREECH
// =================================

function startScreech() {

    if (dead) return;


    statusText.textContent =
        "⚠️ Something is watching you...";


    const screechBtn =
        document.createElement("button");


    screechBtn.textContent =
        "👁️ LOOK AT IT!";


    screechBtn.style.background =
        "#500";


    document
        .getElementById("controls")
        .appendChild(screechBtn);


    let clicked = false;


    screechBtn.addEventListener(
        "click",
        function () {

            clicked = true;

            screechBtn.remove();

            statusText.textContent =
                "👁️ You stopped it!";
        }
    );


    setTimeout(function () {

        if (clicked || dead) return;

        screechBtn.remove();

        statusText.textContent =
            "⚠️ You ignored it!";

        damage(40);

    }, 4000);
}


// =================================
// CROUCH
// =================================

crouchBtn.addEventListener(
    "click",
    function () {

        if (dead || !seekActive) return;


        crouching =
            !crouching;


        if (crouching) {

            crouchBtn.textContent =
                "🧍 Stand Up";

            statusText.textContent =
                "🧎 You are crouching.";

        }

        else {

            crouchBtn.textContent =
                "🧎 Crouch";

            statusText.textContent =
                "🧍 You stood up.";
        }
    }
);


// =================================
// SEEK
// =================================

function startSeek() {

    if (dead || seekActive) return;


    seekActive = true;

    seekDoors = 0;

    crouching = false;


    crouchBtn.style.display =
        "inline-block";


    statusText.textContent =
        "⚠️ CHASE! CROUCH AND KEEP MOVING!";


    alert(
        "⚠️ CHASE STARTED!\nStay crouched!"
    );


    const chaseInterval =
        setInterval(function () {

            if (dead) {

                clearInterval(chaseInterval);

                return;
            }


            seekDoors++;


            if (!crouching) {

                alert(
                    "⚠️ You were caught!"
                );

                damage(100);

                clearInterval(chaseInterval);

                return;
            }


            statusText.textContent =
                `🏃 Chase: ${seekDoors}/10 doors`;


            if (seekDoors >= 10) {

                seekActive = false;

                crouching = false;

                crouchBtn.style.display =
                    "none";

                statusText.textContent =
                    "✅ You escaped the chase!";

                clearInterval(chaseInterval);
            }

        }, 5000);
}


// =================================
// LIBRARY
// =================================

function startLibrary() {

    libraryPanel.style.display =
        "block";

    openDoorBtn.style.display =
        "none";

    libraryCompleted = false;

    libraryBooks = [];

    libraryCollected = [];


    libraryStatus.textContent =
        "📚 Find all 5 books and collect their clues.";


    booksDiv.innerHTML = "";

    cluesDiv.textContent =
        "No clues collected yet.";


    const symbols = [
        "◆",
        "●",
        "▲",
        "★",
        "■"
    ];


    // Generate books

    for (let i = 0; i < 5; i++) {

        const book = {

            number:
                Math.floor(
                    Math.random() * 99
                ) + 1,

            symbol:
                symbols[i],

            collected: false

        };


        libraryBooks.push(book);
    }


    // Display books

    libraryBooks.forEach(
        function (book, index) {

            const button =
                document.createElement("button");


            button.className =
                "book";


            button.textContent =
                `📖 Book ${index + 1}`;


            button.addEventListener(
                "click",
                function () {

                    collectBook(index);

                }
            );


            booksDiv.appendChild(button);
        }
    );
}


// =================================
// COLLECT BOOK
// =================================

function collectBook(index) {

    const book =
        libraryBooks[index];


    if (book.collected) return;


    book.collected = true;

    libraryCollected.push(book);


    const buttons =
        document.querySelectorAll(
            ".book"
        );


    buttons[index].disabled =
        true;


    buttons[index].textContent =
        `✅ ${book.number} ${book.symbol}`;


    updateClues();


    if (
        libraryCollected.length === 5
    ) {

        startLibraryLock();
    }
}


// =================================
// UPDATE CLUES
// =================================

function updateClues() {

    cluesDiv.innerHTML = "";


    libraryCollected.forEach(
        function (book) {

            const clue =
                document.createElement("div");


            clue.className =
                "library-clue";


            clue.textContent =
                `${book.symbol} = ${book.number}`;


            cluesDiv.appendChild(clue);
        }
    );
}


// =================================
// LIBRARY LOCK
// =================================

function startLibraryLock() {

    libraryLockActive = true;

    libraryPanel.style.display =
        "none";

    libraryLockPanel.style.display =
        "block";


    libraryLockStatus.textContent =
        "";


    // Sort books by number

    const sortedBooks =
        [...libraryBooks].sort(
            function (a, b) {
                return a.number - b.number;
            }
        );


    // Show correct symbol order

    symbolList.innerHTML = "";


    sortedBooks.forEach(
        function (book, index) {

            const clue =
                document.createElement("div");


            clue.className =
                "library-clue";


            clue.textContent =
                `${index + 1}. ${book.symbol} = ${book.number}`;


            symbolList.appendChild(clue);
        }
    );


    // Create number locks

    lockNumbers.innerHTML = "";


    sortedBooks.forEach(
        function () {

            const button =
                document.createElement("button");


            button.className =
                "lock-number";


            button.textContent =
                "0";


            button.dataset.value =
                "0";


            button.addEventListener(
                "click",
                function () {

                    let value =
                        Number(
                            button.dataset.value
                        );


                    value++;


                    if (value > 9) {
                        value = 0;
                    }


                    button.dataset.value =
                        value;


                    button.textContent =
                        value;
                }
            );


            lockNumbers.appendChild(
                button
            );
        }
    );


    // Start timer

    libraryTimer = 70;

    libraryTimerText.textContent =
        `⏱️ Time: ${libraryTimer}`;


    clearInterval(
        libraryTimerInterval
    );


    libraryTimerInterval =
        setInterval(
            function () {

                libraryTimer--;


                libraryTimerText.textContent =
                    `⏱️ Time: ${libraryTimer}`;


                if (libraryTimer <= 0) {

                    clearInterval(
                        libraryTimerInterval
                    );


                    libraryLockStatus.textContent =
                        "⏰ TIME'S UP!";


                    damage(100);
                }

            },
            1000
        );
}


// =================================
// UNLOCK LIBRARY
// =================================

unlockLibraryBtn.addEventListener(
    "click",
    checkLibraryLock
);


function checkLibraryLock() {

    if (dead || !libraryLockActive) return;


    const sortedBooks =
        [...libraryBooks].sort(
            function (a, b) {
                return a.number - b.number;
            }
        );


    const lockButtons =
        document.querySelectorAll(
            ".lock-number"
        );


    let correct = true;


    for (
        let i = 0;
        i < sortedBooks.length;
        i++
    ) {

        const entered =
            Number(
                lockButtons[i].dataset.value
            );


        if (
            entered !==
            sortedBooks[i].number % 10
        ) {

            correct = false;

            break;
        }
    }


    if (!correct) {

        libraryLockStatus.textContent =
            "❌ WRONG COMBINATION!";


        damage(100);

        return;
    }


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
        "🔓 Library unlocked!";


    alert(
        "🔓 The Library door has been unlocked!"
    );
}


// =================================
// ELEVATOR
// =================================

function startElevator() {

    elevatorActive = true;

    elevatorRound = 0;

    elevatorPoints = 15;


    openDoorBtn.style.display =
        "none";


    elevatorPanel.style.display =
        "block";


    updateElevatorPoints();


    nextElevatorRound();
}


// =================================
// ELEVATOR ROUND
// =================================

let elevatorCorrect = [];


function nextElevatorRound() {

    elevatorRound++;


    if (elevatorRound > 3) {

        winGame();

        return;
    }


    switchesDiv.innerHTML = "";


    elevatorCorrect = [];


    // Generate 10 random ON/OFF states

    for (let i = 0; i < 10; i++) {

        elevatorCorrect.push(
            Math.random() < 0.5
        );
    }


    // Tell player what to do

    const onSwitches = [];

    const offSwitches = [];


    elevatorCorrect.forEach(
        function (state, index) {

            if (state) {

                onSwitches.push(
                    index + 1
                );

            }

            else {

                offSwitches.push(
                    index + 1
                );
            }
        }
    );


    elevatorInstruction.innerHTML =
        `Round ${elevatorRound}/3<br><br>
        🟢 ON: ${onSwitches.join(", ")}<br>
        ⚫ OFF: ${offSwitches.join(", ")}`;


    // Create switches

    for (let i = 0; i < 10; i++) {

        const button =
            document.createElement("button");


        button.className =
            "switch";


        button.dataset.on =
            "false";


        button.textContent =
            `Switch ${i + 1}: OFF`;


        button.addEventListener(
            "click",
            function () {

                const isOn =
                    button.dataset.on ===
                    "true";


                button.dataset.on =
                    (!isOn).toString();


                button.textContent =
                    isOn
                        ? `Switch ${i + 1}: OFF`
                        : `Switch ${i + 1}: ON`;
            }
        );


        switchesDiv.appendChild(
            button
        );
    }
}


// =================================
// ELEVATOR CONFIRM
// =================================

confirmBtn.addEventListener(
    "click",
    checkElevator
);


function checkElevator() {

    if (dead || !elevatorActive) return;


    const switches =
        document.querySelectorAll(
            ".switch"
        );


    let correctCount = 0;


    switches.forEach(
        function (button, index) {

            const playerState =
                button.dataset.on ===
                "true";


            if (
                playerState ===
                elevatorCorrect[index]
            ) {

                correctCount++;

            }

        }
    );


    if (correctCount === 10) {

        elevatorPoints += 10;

        alert(
            "✅ Correct! +10 points!"
        );

    }

    else {

        elevatorPoints -= 5;

        alert(
            `❌ Wrong! You got ${correctCount}/10 correct.\n-5 points.`
        );
    }


    updateElevatorPoints();


    // Death

    if (elevatorPoints <= 0) {

        damage(100);

        return;
    }


    // Win immediately at 30

    if (elevatorPoints >= 30) {

        winGame();

        return;
    }


    // Continue rounds

    if (elevatorRound < 3) {

        nextElevatorRound();

    }

    else {

        winGame();
    }
}


// =================================
// ELEVATOR POINTS
// =================================

function updateElevatorPoints() {

    elevatorPointsText.textContent =
        `Points: ${elevatorPoints}`;
}


// =================================
// WIN GAME
// =================================

function winGame() {

    elevatorActive = false;


    elevatorPanel.style.display =
        "none";


    statusText.textContent =
        "🏆 YOU ESCAPED!";


    showEndScreen(
        "🏆 HOTEL COMPLETE!",
        "You restored the elevator and escaped the hotel!"
    );
}


// =================================
// INITIAL GAME STATE
// =================================

updateHealth();

doorText.textContent =
    "🚪 Door 1";

statusText.textContent =
    "🚪 Exploring...";

hideBtn.textContent =
    "🗄️ Hide in Closet";

crouchBtn.style.display =
    "none";
