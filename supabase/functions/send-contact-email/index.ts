const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const COMPANY_EMAIL = "info@climont.es";
const COMPANY_NAME = "Climatizaciones Montaño, S.L.";

const SERVICE_LABELS: Record<string, string> = {
  instalacion: "Instalación",
  mantenimiento: "Mantenimiento",
  reparacion: "Reparación",
  ventilacion: "Ventilación y extracción",
  eficiencia: "Eficiencia energética",
  airzone: "Climatización inteligente Airzone",
  constructoras: "Instalaciones y preinstalaciones para constructoras",
};

const INSTALLATION_LABELS: Record<string, string> = {
  splits_pared: "Splits de pared",
  conductos: "Centralizado por conductos",
  cassettes: "Cassettes de techo",
  suelo_techo: "Equipos suelo/techo",
  fabricacion_conductos: "Fabricación de conductos (fibra Climaver / chapa galvanizada)",
  preinstalacion_obra: "Preinstalación en obra nueva / nueva construcción",
  instalacion_obra: "Instalación completa en obra nueva",
  ventilacion_viviendas: "Ventilación de viviendas",
  ventilacion_garajes: "Ventilación de garajes",
  airzone: "Climatización inteligente Airzone",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const city = String(body.city || "").trim();
    const serviceType = String(body.service_type || "").trim();
    const installationType = String(body.installation_type || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !phone) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const serviceLabel = SERVICE_LABELS[serviceType] || serviceType || "No especificado";
    const installationLabel = INSTALLATION_LABELS[installationType] || installationType || "No especificado";

    const subject = `Nueva solicitud de presupuesto - ${name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #0c4a6e, #075985); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">${COMPANY_NAME}</h1>
          <p style="color: #bae6fd; margin: 4px 0 0; font-size: 14px;">Nueva solicitud de presupuesto</p>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; font-weight: 600; width: 160px; color: #64748b;">Nombre:</td><td style="padding: 8px 0;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #64748b;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #0369a1;">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #64748b;">Teléfono:</td><td style="padding: 8px 0;"><a href="tel:${escapeHtml(phone)}" style="color: #0369a1;">${escapeHtml(phone)}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #64748b;">Ciudad:</td><td style="padding: 8px 0;">${escapeHtml(city) || "—"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #64748b;">Tipo de servicio:</td><td style="padding: 8px 0;">${escapeHtml(serviceLabel)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #64748b;">Tipo de instalación:</td><td style="padding: 8px 0;">${escapeHtml(installationLabel)}</td></tr>
          </table>
          ${message ? `
            <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; font-weight: 600; color: #64748b; font-size: 13px;">Mensaje del cliente:</p>
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.5;">${escapeHtml(message)}</p>
            </div>
          ` : ""}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            Este mensaje se ha enviado automáticamente desde el formulario de contacto de ${COMPANY_NAME}.
          </p>
        </div>
      </div>
    `;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Faltan variables de entorno de Supabase");
      return new Response(
        JSON.stringify({ error: "Configuración incompleta" }),
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
        from: `${COMPANY_NAME} <info@climont.es>`,
        to: [COMPANY_EMAIL],
        reply_to: email,
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
