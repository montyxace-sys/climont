/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

// Reading reviews is public (the home page calls this anonymously), but
// importing them writes rows and spends Google quota, so that branch needs
// an account listed in public.admin_users. The anon key is a valid JWT and
// therefore never counts as an identity here.
async function isAdminRequest(req: Request): Promise<boolean> {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token || token === SUPABASE_ANON_KEY || token === SUPABASE_SERVICE_ROLE_KEY) return false;

  const admin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) return false;

  const { data: row } = await admin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  return Boolean(row);
}

async function getGoogleCredentials() {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase
    .from("app_secrets")
    .select("key, value")
    .in("key", ["GOOGLE_PLACES_API_KEY", "GOOGLE_PLACE_ID"]);
  if (error) throw new Error("No se pudieron leer las credenciales de Google");
  const apiKey = data.find((d) => d.key === "GOOGLE_PLACES_API_KEY")?.value;
  const placeId = data.find((d) => d.key === "GOOGLE_PLACE_ID")?.value;
  if (!apiKey || !placeId) throw new Error("Credenciales de Google no configuradas");
  return { apiKey, placeId };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const syncRequested = url.searchParams.get("sync") === "true";

  if (syncRequested && !(await isAdminRequest(req))) {
    return new Response(
      JSON.stringify({ error: "No autorizado" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const shouldSync = syncRequested;

  try {
    const { apiKey, placeId } = await getGoogleCredentials();

    const fields = [
      "id",
      "displayName",
      "rating",
      "userRatingCount",
      "formattedAddress",
      "googleMapsUri",
      "reviews.authorAttribution.displayName",
      "reviews.authorAttribution.photoUri",
      "reviews.rating",
      "reviews.text",
      "reviews.relativePublishTimeDescription",
      "reviews.publishTime",
    ].join(",");

    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": fields,
          "Accept-Language": "es",
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Google Places API error", res.status, errText);
      return new Response(
        JSON.stringify({ error: "No se pudieron obtener las reseñas de Google" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const place = await res.json();

    const rawReviews = (place.reviews || []).map((r: any, idx: number) => ({
      googleId: `${r.authorAttribution?.displayName || "anon"}-${r.publishTime || idx}`,
      author: r.authorAttribution?.displayName || "Anónimo",
      authorPhoto: r.authorAttribution?.photoUri || null,
      rating: r.rating || 0,
      text: r.text?.text || "",
      relativeDate: r.relativePublishTimeDescription || "",
      publishTime: r.publishTime || "",
    }));

    let syncedCount = 0;
    let skippedCount = 0;

    if (shouldSync && rawReviews.length > 0) {
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false },
      });

      const existing = await supabase
        .from("reviews")
        .select("google_review_id")
        .not("google_review_id", "is", null);

      const existingIds = new Set((existing.data || []).map((r: any) => r.google_review_id));

      for (const rv of rawReviews) {
        if (!rv.googleId || existingIds.has(rv.googleId)) {
          skippedCount++;
          continue;
        }

        const dateStr = rv.publishTime
          ? new Date(rv.publishTime).toLocaleDateString("es-ES", { year: "numeric", month: "long" })
          : rv.relativeDate || "";

        const initial = rv.author.charAt(0).toUpperCase();

        const { error: insertError } = await supabase.from("reviews").insert({
          author_name: rv.author,
          author_initial: initial,
          rating: rv.rating,
          review_text: rv.text,
          review_date: dateStr,
          service_label: "",
          is_visible: true,
          sort_order: 999,
          google_review_id: rv.googleId,
          auto_synced: true,
          synced_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error("Insert error for review:", rv.googleId, insertError.message);
        } else {
          syncedCount++;
        }
      }
    }

    const reviews = rawReviews.map((r) => ({
      author: r.author,
      authorPhoto: r.authorPhoto,
      rating: r.rating,
      text: r.text,
      relativeDate: r.relativeDate,
      publishTime: r.publishTime,
    }));

    const result = {
      placeId: place.id,
      name: place.displayName?.text || "",
      rating: place.rating || 0,
      totalReviews: place.userRatingCount || 0,
      address: place.formattedAddress || "",
      mapsUrl: place.googleMapsUri || "",
      reviews,
      synced: shouldSync ? { added: syncedCount, skipped: skippedCount } : null,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
