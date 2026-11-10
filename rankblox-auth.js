
const rankbloxClient = window.supabase.createClient(
    window.RANKBLOX_SUPABASE_URL,
    window.RANKBLOX_SUPABASE_KEY
);

window.rankbloxClient = rankbloxClient;


// Convert username into internal login identifier.

window.rankbloxLoginIdentifier = function (username) {
    return username.trim().toLowerCase() + "@rankblox.invalid";
};


// Get the authenticated player's Knobs.

window.getRankbloxKnobs = async function () {
    const {
        data: { user },
        error: userError
    } = await rankbloxClient.auth.getUser();

    if (userError || !user) {
        return {
            success: false,
            message: "Log in to view your Knobs."
        };
    }

    const { data, error } = await rankbloxClient.rpc(
        "rankblox_get_knobs_balance"
    );

    if (error) {
        console.error(error);

        return {
            success: false,
            message: "Could not load Knobs."
        };
    }

    const isAdmin = Number(data) === -1;

    return {
        success: true,
        isAdmin: isAdmin,
        knobs: isAdmin ? null : Number(data)
    };
};


// Spend Knobs.
// The database verifies the balance and admin privileges.

window.spendRankbloxKnobs = async function (amount) {
    const safeAmount = Number(amount);

    if (
        !Number.isSafeInteger(safeAmount) ||
        safeAmount <= 0
    ) {
        return {
            success: false,
            message: "Invalid Knobs amount."
        };
    }

    const { data, error } = await rankbloxClient.rpc(
        "rankblox_spend_knobs",
        {
            p_amount: safeAmount
        }
    );

    if (error) {
        console.error(error);

        return {
            success: false,
            message: "Could not spend Knobs."
        };
    }

    return {
        success: data === true,
        message: data
            ? "Purchase payment approved!"
            : "Not enough Knobs."
    };
};


// Save a high score for the currently logged-in player.

window.saveRankbloxHighScore = async function (gameName, score) {
    const {
        data: { user },
        error: userError
    } = await rankbloxClient.auth.getUser();

    if (userError || !user) {
        return {
            success: false,
            message: "Log in to save your score."
        };
    }

    const safeScore = Number(score);

    if (
        !Number.isSafeInteger(safeScore) ||
        safeScore < 0 ||
        typeof gameName !== "string" ||
        gameName.trim().length < 1 ||
        gameName.trim().length > 60
    ) {
        return {
            success: false,
            message: "Invalid score."
        };
    }

    const { error } = await rankbloxClient
        .from("highscores")
        .insert({
            user_id: user.id,
            game_name: gameName.trim(),
            score: safeScore
        });

    if (error) {
        console.error(error);

        return {
            success: false,
            message: "Could not save the score."
        };
    }

    return {
        success: true,
        message: "Score saved!"
    };
};
