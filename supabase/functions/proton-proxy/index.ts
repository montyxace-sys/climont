/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

// Only accounts listed in public.admin_users may use this proxy.
// verify_jwt alone is not enough: the public anon key is also a valid JWT.
async function requireAdmin(req: Request): Promise<Response | null> {
  const denied = new Response(
    JSON.stringify({ error: "No autorizado" }),
    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token || token === SUPABASE_ANON_KEY || token === SUPABASE_SERVICE_ROLE_KEY) return denied;

  const admin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) return denied;

  const { data: row, error: rowError } = await admin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (rowError || !row) return denied;
  return null;
}

type ProtonService = "drive" | "mail";

function secretKeys(service: ProtonService) {
  if (service === "drive") {
    return {
      username: "PROTON_DRIVE_USERNAME",
      password: "PROTON_DRIVE_PASSWORD",
      twofa: "PROTON_DRIVE_2FA",
    };
  }
  return {
    username: "PROTON_MAIL_USERNAME",
    password: "PROTON_MAIL_PASSWORD",
    twofa: "PROTON_MAIL_2FA",
  };
}

async function getProtonCredentials(service: ProtonService) {
  const keys = secretKeys(service);
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase
    .from("app_secrets")
    .select("key, value")
    .in("key", [keys.username, keys.password, keys.twofa]);
  if (error) throw new Error("No se pudieron leer las credenciales de la base de datos");
  const username = data.find((d) => d.key === keys.username)?.value;
  const password = data.find((d) => d.key === keys.password)?.value;
  const twofa = data.find((d) => d.key === keys.twofa)?.value;
  if (!username || !password) {
    throw new Error("Credenciales de Proton no configuradas. Pulsa Configurar e introduce tu email y contraseña.");
  }
  const placeholderUser = service === "drive" ? "tu-email@proton.me" : "tu-email@proton.me";
  const placeholderPass = "tu-password-proton";
  if (username === placeholderUser || password === placeholderPass) {
    throw new Error("Las credenciales siguen con valores por defecto. Configura tu email y contraseña reales de Proton.");
  }
  return { username, password, twofa: twofa || "" };
}

async function checkProtonConnection(service: ProtonService) {
  const creds = await getProtonCredentials(service);
  // We validate that credentials exist and are not placeholders.
  // A full Proton API connection requires the Go-based Proton-API-Bridge
  // library which is not available in Deno. We verify credential presence
  // and format instead.
  if (!creds.username.includes("@")) {
    throw new Error("El email de Proton no tiene un formato válido");
  }
  if (creds.password.length < 6) {
    throw new Error("La contraseña parece demasiado corta");
  }
  // Safe to return the account name: this endpoint is now admin-only.
  return {
    connected: true,
    username: creds.username,
    has2fa: creds.twofa.length > 0,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "check";
    const service = (url.searchParams.get("service") as ProtonService) || "drive";

    if (action === "check") {
      try {
        const result = await checkProtonConnection(service);
        return new Response(
          JSON.stringify({ connected: true, ...result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ connected: false, error: e instanceof Error ? e.message : "Error desconocido" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    if (action === "update-credentials") {
      const body = await req.json();
      const username = String(body.username || "").trim();
      const password = String(body.password || "");
      const twofa = String(body.twofa || "").trim();
      const svc = (String(body.service || "drive")) as ProtonService;

      if (!username || !password) {
        return new Response(
          JSON.stringify({ error: "Email y contraseña son obligatorios" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const keys = secretKeys(svc);
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false },
      });
      const { error: err1 } = await supabase
        .from("app_secrets")
        .upsert({ key: keys.username, value: username });
      const { error: err2 } = await supabase
        .from("app_secrets")
        .upsert({ key: keys.password, value: password });
      const { error: err3 } = await supabase
        .from("app_secrets")
        .upsert({ key: keys.twofa, value: twofa });

      if (err1 || err2 || err3) {
        return new Response(
          JSON.stringify({ error: "Error guardando credenciales en la base de datos" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "Acción no válida" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
