import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!/^[a-z0-9_]{3,20}$/.test(username) || password.length < 10 || password.length > 72) {
      return jsonResponse({ error: "Invalid username or password." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("Missing Supabase Edge Function environment variables.");
      return jsonResponse({ error: "Login service is not configured." }, 500);
    }

    // The service-role client is kept on the server and never sent to the browser.
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Find the account ID using its public Rankblox username.
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (profileError) {
      console.error("Username lookup failed:", profileError.message);
      return jsonResponse({ error: "Login service could not check that account." }, 500);
    }

    if (!profile) {
      return jsonResponse({ error: "Invalid username or password." }, 401);
    }

    // Get the real email privately on the server, then authenticate normally.
    const { data: userResult, error: userError } =
      await adminClient.auth.admin.getUserById(profile.id);

    const email = userResult?.user?.email;

    if (userError || !email) {
      return jsonResponse({ error: "Invalid username or password." }, 401);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: authData, error: authError } =
      await authClient.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.session) {
      return jsonResponse({ error: "Invalid username or password." }, 401);
    }

    return jsonResponse({
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
    });
  } catch (error) {
    console.error("Unexpected login function error:", error);
    return jsonResponse({ error: "Login service encountered an error." }, 500);
  }
});
