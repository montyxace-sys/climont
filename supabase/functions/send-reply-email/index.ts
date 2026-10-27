const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const COMPANY_EMAIL = "info@climont.es";
const COMPANY_NAME = "Climatizaciones Montaño, S.L.";

// Only accounts listed in public.admin_users may send mail through this endpoint.
// verify_jwt alone is not enough: the public anon key is also a valid JWT.
async function requireAdmin(req: Request): Promise<Response | null> {
  const denied = new Response(
    JSON.stringify({ error: "No autorizado" }),
    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return denied;

  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token || token === SUPABASE_ANON_KEY || token === SUPABASE_SERVICE_ROLE_KEY) return denied;

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` },
  });
  if (!userRes.ok) return denied;
  const user = await userRes.json();
  if (!user?.id) return denied;

  const adminRes = await fetch(
    `${SUPABASE_URL}/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`,
    { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } },
  );
  if (!adminRes.ok) return denied;
  const rows = await adminRes.json();
  if (!Array.isArray(rows) || rows.length === 0) return denied;

  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();

    const toEmail = String(body.to_email || "").trim();
    const toName = String(body.to_name || "").trim();
    const subject = String(body.subject || "").trim();
    const replyMessage = String(body.message || "").trim();
    const originalRequest = body.original_request || null;

    if (!toEmail || !subject || !replyMessage) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #0c4a6e, #075985); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">${COMPANY_NAME}</h1>
          <p style="color: #bae6fd; margin: 4px 0 0; font-size: 14px;">Respuesta a tu solicitud de presupuesto</p>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">Hola ${escapeHtml(toName)},</p>
          <div style="padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; font-size: 15px;">${escapeHtml(replyMessage)}</p>
          </div>
          ${originalRequest ? `
            <div style="margin-top: 20px; padding: 16px; background: #f1f5f9; border-radius: 8px; border-left: 4px solid #0891b2;">
              <p style="margin: 0 0 8px; font-weight: 600; color: #64748b; font-size: 13px;">Tu solicitud original:</p>
              <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
                <strong>Servicio:</strong> ${escapeHtml(originalRequest.service_type || "—")}<br/>
                ${originalRequest.message ? `<strong>Mensaje:</strong> ${escapeHtml(originalRequest.message)}` : ""}
              </p>
            </div>
          ` : ""}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 14px; color: #475569; margin: 0 0 8px;">Saludos cordiales,</p>
          <p style="font-size: 14px; color: #1e293b; margin: 0; font-weight: 600;">${COMPANY_NAME}</p>
          <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0;">
            <a href="tel:+34676628348" style="color: #0369a1;">+34 676 628 348</a> &middot;
            <a href="mailto:${COMPANY_EMAIL}" style="color: #0369a1;">${COMPANY_EMAIL}</a>
          </p>
        </div>
      </div>
    `;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Faltan variables de entorno de Supabase");
      return new Response(
        JSON.stringify({ error: "Configuracion incompleta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const secretRes = await fetch(`${SUPABASE_URL}/rest/v1/app_secrets?key=eq.RESEND_API_KEY&select=value&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    const secretData = await secretRes.json();
    const RESEND_API_KEY = secretData?.[0]?.value;

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY no encontrada en la base de datos");
      return new Response(
        JSON.stringify({ error: "Servicio de email no configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${COMPANY_NAME} <no-reply@notificaciones.climont.es>`,
        to: [toEmail],
        reply_to: COMPANY_EMAIL,
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      console.error("Error enviando email:", errText);
      return new Response(
        JSON.stringify({ error: "Error enviando email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
