const client = window.rankbloxClient;

const authPanel = document.getElementById("authPanel");
const profilePanel = document.getElementById("profilePanel");
const accountForm = document.getElementById("accountForm");

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const emailField = document.getElementById("emailField");
const passwordInput = document.getElementById("password");

const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const message = document.getElementById("message");

const profileUsername = document.getElementById("profileUsername");
const highscoresDiv = document.getElementById("highscores");
const profileMessage = document.getElementById("profileMessage");

const adminBadge = document.getElementById("adminBadge");
const knobsBalance = document.getElementById("knobsBalance");

let formMode = "login";
let busy = false;


// Switch between login and signup.

function setMode(mode) {
    formMode = mode;

    const signingUp = mode === "signup";

    formTitle.textContent =
        signingUp ? "Create Your Account" : "Log In";

    submitButton.textContent =
        signingUp ? "Create Account" : "Log In";

    passwordInput.autocomplete =
        signingUp ? "new-password" : "current-password";

    emailField.hidden = !signingUp;
    emailInput.required = signingUp;

    message.textContent = "";
}

document.getElementById("showLogin").addEventListener("click", () => {
    setMode("login");
});

document.getElementById("showSignup").addEventListener("click", () => {
    setMode("signup");
});


// Friendly error messages.

function explainError(error) {
    const text = String(error?.message || "").toLowerCase();

    if (
        text.includes("already registered") ||
        text.includes("already exists") ||
        text.includes("duplicate key")
    ) {
        return "That username or email may already be in use.";
    }

    if (
        text.includes("invalid login credentials") ||
        text.includes("invalid username or password")
    ) {
        return "Username or password is incorrect.";
    }

    if (text.includes("password")) {
        return "The password was rejected. Check its length.";
    }

    if (text.includes("email")) {
        return "Please enter a valid email address that you can access.";
    }

    return error?.message || "Something went wrong.";
}


// Log in with username through the secure Supabase Edge Function.

async function loginWithUsername(username, password) {
    const response = await fetch(
        window.RANKBLOX_SUPABASE_URL + "/functions/v1/rankblox-login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": window.RANKBLOX_SUPABASE_KEY
            },
            body: JSON.stringify({
                username: username.toLowerCase(),
                password: password
            })
        }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            result.error || "Invalid username or password."
        );
    }

    if (!result.access_token || !result.refresh_token) {
        throw new Error("The login service returned an invalid session.");
    }

    const { error } = await client.auth.setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token
    });

    if (error) throw error;
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
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
        if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
            throw new Error(
                "Use 3–20 letters, numbers, or underscores."
            );
        }

        if (password.length < 10 || password.length > 72) {
            throw new Error(
                "Use a password between 10 and 72 characters."
            );
        }

        if (formMode === "signup") {
            if (!email) {
                throw new Error("Please enter your email address.");
            }

            const { data, error } = await client.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: normalizedUsername
                    }
                }
            });

            if (error) throw error;

            passwordInput.value = "";

            if (!data.session) {
                message.textContent =
                    "Account created! Check your email for a confirmation link. " +
                    "After confirming, log in with your username and password.";
                return;
            }

            message.textContent = "Account created!";
            await showProfile();

        } else {
            await loginWithUsername(normalizedUsername, password);

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


// Load Knobs and admin status.

async function loadKnobs() {
    adminBadge.hidden = true;
    knobsBalance.textContent = "Loading...";

    const result = await window.getRankbloxKnobs();

    if (!result.success) {
        knobsBalance.textContent = "Unavailable";
        return;
    }

    if (result.isAdmin) {
        adminBadge.hidden = false;
        knobsBalance.textContent = "∞";
    } else {
        adminBadge.hidden = true;
        knobsBalance.textContent =
            result.knobs.toLocaleString();
    }
}


// Load the player's profile.

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

    await loadKnobs();
    await loadHighScores(user.id);
}


// Display recent high scores.

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
        date.textContent =
            new Date(item.created_at).toLocaleString();

        row.append(name, score, date);
        highscoresDiv.appendChild(row);
    });
}


// Refresh scores.

document.getElementById("refreshScores")
    .addEventListener("click", async () => {
        const {
            data: { user }
        } = await client.auth.getUser();

        if (user) {
            await loadHighScores(user.id);
        }
    });


// Log out.

document.getElementById("logoutButton")
    .addEventListener("click", async () => {
        const { error } = await client.auth.signOut();

        if (error) {
            profileMessage.textContent = explainError(error);
            return;
        }

        profilePanel.hidden = true;
        authPanel.hidden = false;

        adminBadge.hidden = true;
        knobsBalance.textContent = "0";

        usernameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";

        setMode("login");
        message.textContent = "You have logged out.";
    });


// Restore existing session.

async function initialiseAccountPage() {
    try {
        await showProfile();
    } catch (error) {
        console.error(error);

        message.textContent =
            "Couldn't connect to the account service. " +
            "Check your Supabase configuration.";
    }
}

initialiseAccountPage();