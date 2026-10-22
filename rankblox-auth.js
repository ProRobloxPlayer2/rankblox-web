const rankbloxClient = window.supabase.createClient(
    window.RANKBLOX_SUPABASE_URL,
    window.RANKBLOX_SUPABASE_KEY
);

window.rankbloxClient = rankbloxClient;

// Convert a username into the internal login identifier.
// Players never need to type this identifier.
window.rankbloxLoginIdentifier = function (username) {
    return username.trim().toLowerCase() + "@rankblox.invalid";
};

// Save a score for the currently logged-in player.
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
