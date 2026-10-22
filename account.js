const client = window.rankbloxClient;

const authPanel = document.getElementById("authPanel");
const profilePanel = document.getElementById("profilePanel");
const accountForm = document.getElementById("accountForm");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const message = document.getElementById("message");

const profileUsername = document.getElementById("profileUsername");
const highscoresDiv = document.getElementById("highscores");
const profileMessage = document.getElementById("profileMessage");

let formMode = "login";
let busy = false;


// Switch between login and signup.

function setMode(mode) {
    formMode = mode;

    formTitle.textContent =
        mode === "signup" ? "Create Your Account" : "Log In";

    submitButton.textContent =
        mode === "signup" ? "Create Account" : "Log In";

    passwordInput.autocomplete =
        mode === "signup" ? "new-password" : "current-password";

    message.textContent = "";
}

document.getElementById("showLogin").addEventListener("click", () => {
    setMode("login");
});

document.getElementById("showSignup").addEventListener("click", () => {
    setMode("signup");
});


// Friendly messages for common errors.

function explainError(error) {
    const text = String(error?.message || "").toLowerCase();

    if (text.includes("already registered") ||
        text.includes("already exists") ||
        text.includes("duplicate key")) {
        return "That username may already be taken. Try another one.";
    }

    if (text.includes("invalid login credentials")) {
        return "Username or password is incorrect.";
    }

    if (text.includes("password")) {
        return "The password was rejected. Check its length and try again.";
    }

    return error?.message || "Something went wrong. Please try again.";
}


// Sign up or log in.

accountForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (busy) return;

    busy = true;
    submitButton.disabled = true;
    message.textContent = "Please wait...";

    const username = usernameInput.value.trim();
    const normalizedUsername = username.toLowerCase();
    const password = passwordInput.value;

    try {
        if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
            throw new Error(
                "Use 3–20 letters, numbers, or underscores for your username."
            );
        }

        if (password.length < 10 || password.length > 72) {
            throw new Error(
                "Use a password between 10 and 72 characters."
            );
        }

        const email = window.rankbloxLoginIdentifier(normalizedUsername);

        if (formMode === "signup") {
            const { data, error } = await client.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: normalizedUsername
                    }
                }
            });

            if (error) throw error;

            if (!data.session) {
                message.textContent =
                    "Account created, but no session was returned. Check the Supabase email-confirmation settings.";
                return;
            }

            passwordInput.value = "";
            message.textContent = "Account created!";
            await showProfile();

        } else {
            const { error } = await client.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            passwordInput.value = "";
            message.textContent = "Logged in!";
            await showProfile();
        }

    } catch (error) {
        console.error(error);
        message.textContent = explainError(error);

    } finally {
        busy = false;
        submitButton.disabled = false;
    }
});


// Load the player's own profile and scores.

async function showProfile() {
    const {
        data: { user },
        error: userError
    } = await client.auth.getUser();

    if (userError || !user) {
        authPanel.hidden = false;
        profilePanel.hidden = true;
        return;
    }

    const { data: profile, error } = await client
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error(error);
        profileMessage.textContent =
            "Couldn't load your profile. Check the database setup.";
        return;
    }

    authPanel.hidden = true;
    profilePanel.hidden = false;

    profileUsername.textContent = profile.username;

    await loadHighScores(user.id);
}


// Display recent scores.

async function loadHighScores(userId) {
    highscoresDiv.textContent = "Loading scores...";

    const { data, error } = await client
        .from("highscores")
        .select("game_name, score, created_at")
        .eq("user_id", userId)
        .order("score", { ascending: false })
        .limit(20);

    if (error) {
        console.error(error);
        highscoresDiv.textContent = "Couldn't load scores.";
        return;
    }

    if (!data.length) {
        highscoresDiv.textContent =
            "No scores saved yet. Play a game while logged in!";
        return;
    }

    highscoresDiv.replaceChildren();

    data.forEach((item) => {
        const row = document.createElement("div");
        row.className = "score";

        const name = document.createElement("strong");
        name.textContent = item.game_name;

        const score = document.createElement("span");
        score.textContent = ` — ${item.score} points`;

        const date = document.createElement("div");
        date.className = "muted";
        date.textContent = new Date(item.created_at).toLocaleString();

        row.append(name, score, date);
        highscoresDiv.appendChild(row);
    });
}


// Refresh scores.

document.getElementById("refreshScores").addEventListener("click", async () => {
    const {
        data: { user }
    } = await client.auth.getUser();

    if (user) {
        await loadHighScores(user.id);
    }
});


// Log out.

document.getElementById("logoutButton").addEventListener("click", async () => {
    const { error } = await client.auth.signOut();

    if (error) {
        profileMessage.textContent = explainError(error);
        return;
    }

    profilePanel.hidden = true;
    authPanel.hidden = false;

    usernameInput.value = "";
    passwordInput.value = "";

    setMode("login");
    message.textContent = "You have logged out.";
});


// Restore the session if the player is already logged in.

async function initialiseAccountPage() {
    try {
        await showProfile();
    } catch (error) {
        console.error(error);
        message.textContent =
            "Couldn't connect to the account service. Check your Supabase configuration.";
    }
}

initialiseAccountPage();
