/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "npm:@supabase/supabase-js@2";
import { Storage } from "npm:megajs@1.3.10";

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

async function getMegaCredentials() {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase
    .from("app_secrets")
    .select("key, value")
    .in("key", ["MEGA_EMAIL", "MEGA_PASSWORD"]);
  if (error) throw new Error("No se pudieron leer las credenciales de la base de datos");
  const email = data.find((d) => d.key === "MEGA_EMAIL")?.value;
  const password = data.find((d) => d.key === "MEGA_PASSWORD")?.value;
  if (!email || !password) throw new Error("Credenciales de MEGA no configuradas. Pulsa Configurar e introduce tu email y contraseña.");
  if (email === "tu-email@mega.nz" || password === "tu-password-mega") {
    throw new Error("Las credenciales siguen con valores por defecto. Configura tu email y contraseña reales de MEGA.");
  }
  return { email, password };
}

// Session cache with progressive handle→node index.
// Each session stays alive for 90s. The handleMap grows as the user navigates,
// making folder lookups O(1) after the first visit.
type CachedSession = {
  storage: any;
  handleMap: Map<string, any>;
  timer: number;
};

const sessionCache = new Map<string, CachedSession>();

function closeSession(key: string) {
  const s = sessionCache.get(key);
  if (s) {
    clearTimeout(s.timer);
    try { s.storage.close(); } catch (error) { void error; }
    sessionCache.delete(key);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /EAGAIN|ECONNRESET|ETIMEDOUT|ENETUNREACH|temporary congestion|server malfunction|socket hang up/i.test(msg);
}

async function connectMega(): Promise<CachedSession> {
  const cached = sessionCache.get("mega");
  if (cached) {
    clearTimeout(cached.timer);
    cached.timer = setTimeout(() => closeSession("mega"), 90000);
    return cached;
  }

  const { email, password } = await getMegaCredentials();

  let lastErr: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) {
      await sleep(1500 * attempt);
    }
    try {
      closeSession("mega");
      const storage = new Storage({ email, password, autoload: true, keepalive: false });
      await storage.ready;

      const handleMap = new Map<string, any>();

      const root = storage.root;
      if (root) {
        await loadNodeChildren(root);
        indexChildren(root, handleMap);
      }

      const timer = setTimeout(() => closeSession("mega"), 90000);
      const session: CachedSession = { storage, handleMap, timer };
      sessionCache.set("mega", session);
      return session;
    } catch (err) {
      lastErr = err;
      if (!isRetryableError(err)) break;
    }
  }

  const msg = lastErr instanceof Error ? lastErr.message : "Error desconocido";
  if (isRetryableError(lastErr)) {
    throw new Error("MEGA está temporalmente no disponible (EAGAIN). El servidor de MEGA está saturado. Inténtalo de nuevo en unos segundos.");
  }
  throw new Error(msg);
}

// Register every child of a node in the handle map for O(1) lookup later.
function indexChildren(node: any, handleMap: Map<string, any>) {
  const children = node.children || [];
  for (const child of children) {
    const handle = getNodeHandle(child);
    if (handle && !handleMap.has(handle)) {
      handleMap.set(handle, child);
    }
  }
}

type MegaNode = {
  id: string;
  name: string;
  type: "folder" | "file";
  size: number | null;
  modifiedDate: string | null;
};

function getNodeHandle(node: any): string {
  if (!node) return "";
  // megajs File objects expose the MEGA handle via .handle
  return node.handle || node.nodeId || node.downloadId || "";
}

function loadNodeChildren(node: any): Promise<void> {
  if (!node) return Promise.resolve();
  const children = node.children;
  // Only load if children haven't been loaded yet (undefined or null).
  // An empty array [] means the folder was already loaded and is empty.
  if (children) return Promise.resolve();
  if (!node.loadAttributes) return Promise.resolve();
  return new Promise((resolve, reject) => {
    node.loadAttributes((err: Error | null) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Fallback deep search for handles not yet in the index.
// Only used as a safety net — normal navigation goes through handleMap.
async function deepFindNode(root: any, handle: string, visited: Set<string> = new Set()): Promise<any> {
  if (!handle) return root;
  if (getNodeHandle(root) === handle) return root;
  const myHandle = getNodeHandle(root) || "root";
  if (visited.has(myHandle)) return null;
  visited.add(myHandle);

  await loadNodeChildren(root);
  const children = root.children || [];
  for (const child of children) {
    if (getNodeHandle(child) === handle) return child;
    if (child.directory) {
      const found = await deepFindNode(child, handle, visited);
      if (found) return found;
    }
  }
  return null;
}

function collectNodes(node: any): MegaNode[] {
  const nodes: MegaNode[] = [];
  const children = node.children || [];
  for (const child of children) {
    const childName = child.name || "Sin nombre";
    const handle = getNodeHandle(child);
    nodes.push({
      id: handle,
      name: childName,
      type: child.directory ? "folder" : "file",
      size: child.directory ? null : (child.size || 0),
      modifiedDate: child.timestamp ? new Date(child.timestamp * 1000).toISOString() : null,
    });
  }
  return nodes;
}

// List children of a folder identified by handle, or root if empty handle.
async function listMegaFiles(folderHandle: string): Promise<MegaNode[]> {
  const session = await connectMega();
  const { storage, handleMap } = session;
  const root = storage.root;
  if (!root) throw new Error("No se pudo cargar el árbol de archivos de MEGA");

  let targetFolder = root;
  if (folderHandle) {
    // Fast path: look up in the progressive index
    const cached = handleMap.get(folderHandle);
    if (cached) {
      targetFolder = cached;
    } else {
      // Fallback: deep search (slow, but handles edge cases)
      targetFolder = await deepFindNode(root, folderHandle);
      if (!targetFolder) {
        // List root children handles for debugging
        await loadNodeChildren(root);
        const available = (root.children || [])
          .filter((c: any) => c.directory)
          .map((c: any) => `"${c.name}" (handle: ${getNodeHandle(c)})`)
          .join(", ");
        throw new Error(`Carpeta no encontrada. Carpetas disponibles en raíz: ${available || "(ninguna)"}`);
      }
      // Register the found node so future lookups are fast
      const h = getNodeHandle(targetFolder);
      if (h) handleMap.set(h, targetFolder);
    }
  }

  await loadNodeChildren(targetFolder);
  // Index all children so the next navigation to any of them is instant
  indexChildren(targetFolder, handleMap);

  return collectNodes(targetFolder);
}

// Find a file node by its handle for download/view
async function findMegaNodeByHandle(fileHandle: string): Promise<{ node: any; session: CachedSession }> {
  const session = await connectMega();
  const { storage, handleMap } = session;
  const root = storage.root;
  if (!root) throw new Error("No se pudo cargar el árbol de archivos de MEGA");

  // Fast path
  const cached = handleMap.get(fileHandle);
  if (cached) return { node: cached, session };

  // Fallback: deep search
  const node = await deepFindNode(root, fileHandle);
  if (!node) throw new Error("Archivo no encontrado");
  const h = getNodeHandle(node);
  if (h) handleMap.set(h, node);
  return { node, session };
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const types: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    txt: 'text/plain',
    html: 'text/html',
    css: 'text/css',
    js: 'text/javascript',
    json: 'application/json',
    xml: 'application/xml',
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    csv: 'text/csv',
  };
  return types[ext] || 'application/octet-stream';
}

async function downloadMegaFileStream(fileHandle: string): Promise<{ name: string; stream: ReadableStream<Uint8Array>; size: number }> {
  const { node } = await findMegaNodeByHandle(fileHandle);
  const fileSize = node.size || 0;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Tiempo de espera agotado iniciando descarga (límite 30 s)"));
    }, 30000);

    const megaStream = node.download();

    megaStream.on("ready", () => {
      clearTimeout(timeout);
    });

    const readable = new ReadableStream({
      start(controller) {
        megaStream.on("data", (chunk: Uint8Array) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        megaStream.on("end", () => {
          controller.close();
        });
        megaStream.on("error", (err: Error) => {
          controller.error(err);
        });
      },
      cancel() {
        try { megaStream.destroy(); } catch (error) { void error; }
      },
    });

    resolve({ name: node.name, stream: readable, size: fileSize });
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";
    const handle = url.searchParams.get("handle") || "";

    if (action === "check") {
      try {
        const session = await connectMega();
        const root = session.storage.root;
        const childCount = root?.children?.length || 0;
        return new Response(
          JSON.stringify({ connected: true, rootFiles: childCount }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ connected: false, error: e instanceof Error ? e.message : "Error desconocido" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    if (action === "list") {
      const files = await listMegaFiles(handle);
      return new Response(
        JSON.stringify({ files }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "download" || action === "view") {
      const file = await downloadMegaFileStream(handle);
      const mime = getMimeType(file.name);
      const disposition = action === "download" ? "attachment" : "inline";
      const headers: Record<string, string> = {
        ...corsHeaders,
        "Content-Type": mime,
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(file.name)}"`,
      };
      if (file.size > 0) {
        headers["Content-Length"] = String(file.size);
      }
      return new Response(file.stream, { headers });
    }

    if (action === "update-credentials") {
      closeSession("mega");

      const body = await req.json();
      const email = String(body.email || "").trim();
      const password = String(body.password || "");
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: "Email y contraseña son obligatorios" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false },
      });
      const { error: err1 } = await supabase
        .from("app_secrets")
        .upsert({ key: "MEGA_EMAIL", value: email });
      const { error: err2 } = await supabase
        .from("app_secrets")
        .upsert({ key: "MEGA_PASSWORD", value: password });
      if (err1 || err2) {
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
