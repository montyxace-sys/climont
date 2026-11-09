"""Publica dist/ en la copia de respaldo de GitHub Pages (climont.es).

Se usa desde GitHub Actions (secreto PAGES_TOKEN) y también en local:

    python scripts/deploy_pages.py

En local toma el token de %TEMP%\\opencode\\gh_token.txt si no hay PAGES_TOKEN.
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
OWNER = "montyxace-sys"
REPO = "climont"
BRANCH = "gh-pages"
CANONICAL = "climont.es"
PAGES_DOMAIN = "climont.es"
EXCLUDE = {"_headers", "_redirects", "product-slugs.json"}

REDIRECT_JS = """
<script>
(function () {
  var p = location.pathname, s = location.search;
  var uuid = p.match(/^\\/productos\\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\\/?$/i);
  if (uuid) {
    var map = %s;
    var slug = map[uuid[1].toLowerCase()];
    if (slug) { location.replace("/productos/" + slug); return; }
  }
  if (/^\\/(web|eur)\\//i.test(p) || /^\\/index\\.php/i.test(p) || /^\\/tel:/i.test(p)) {
    location.replace("/catalogo"); return;
  }
  if (/main_page=|cPath=/.test(s)) { location.replace("/catalogo"); return; }
  if (p.length > 1 && p.charAt(p.length - 1) === "/") {
    location.replace(p.replace(/\\/+$/, "") + s); return;
  }
})();
</script>
"""


def token():
    for env_name in ("PAGES_TOKEN", "GITHUB_TOKEN"):
        value = os.environ.get(env_name, "").strip()
        if value:
            return value
    path = os.path.join(os.environ.get("TEMP", tempfile.gettempdir()), "opencode", "gh_token.txt")
    if os.path.exists(path):
        with open(path, encoding="ascii") as f:
            value = f.read().strip()
        if value:
            return value
    raise SystemExit("Falta PAGES_TOKEN/GITHUB_TOKEN (o %TEMP%/opencode/gh_token.txt)")


TOKEN = token()

tmp = tempfile.mkdtemp(prefix="climont-gh-")
for entry in os.listdir(DIST):
    if entry in EXCLUDE:
        continue
    src = os.path.join(DIST, entry)
    dst = os.path.join(tmp, entry)
    if os.path.isdir(src):
        shutil.copytree(src, dst)
    else:
        shutil.copy2(src, dst)

with open(os.path.join(tmp, "CNAME"), "w", encoding="utf-8") as f:
    f.write(PAGES_DOMAIN + "\n")
open(os.path.join(tmp, ".nojekyll"), "w").close()

slugs = {}
slugs_path = os.path.join(DIST, "product-slugs.json")
if os.path.exists(slugs_path):
    with open(slugs_path, encoding="utf-8") as f:
        slugs = json.load(f)
prod_dir = os.path.join(tmp, "productos")
os.makedirs(prod_dir, exist_ok=True)
for uid, slug in slugs.items():
    html = (
        '<!doctype html><html lang="es"><head><meta charset="utf-8">'
        f'<title>Redirigiendo...</title><link rel="canonical" href="https://{CANONICAL}/productos/{slug}">'
        '<meta name="robots" content="noindex,follow">'
        f'<meta http-equiv="refresh" content="0;url=/productos/{slug}">'
        f'<script>location.replace("/productos/{slug}"+location.search+location.hash)</script>'
        f'</head><body><p>La ficha se ha movido a <a href="/productos/{slug}">/productos/{slug}</a>.</p></body></html>'
    )
    with open(os.path.join(prod_dir, uid + ".html"), "w", encoding="utf-8") as f:
        f.write(html)
print("redirecciones UUID:", len(slugs))

notfound = os.path.join(tmp, "404.html")
if os.path.exists(notfound):
    with open(notfound, encoding="utf-8") as f:
        html = f.read()
    injection = REDIRECT_JS % json.dumps({k.lower(): v for k, v in slugs.items()})
    html = html.replace("</body>", injection + "\n</body>", 1) if "</body>" in html else html + injection
    with open(notfound, "w", encoding="utf-8") as f:
        f.write(html)


def run(*args):
    res = subprocess.run(args, cwd=tmp, capture_output=True, text=True)
    if res.returncode != 0:
        print("FALLO:", " ".join(args))
        print(res.stdout[-800:], res.stderr[-800:])
        sys.exit(1)


run("git", "init", "-q", "-b", "main")
run("git", "config", "user.email", "web@climont.es")
run("git", "config", "user.name", "Climont deploy")
run("git", "add", "-A")
run("git", "commit", "-q", "-m", "web compilada")
run("git", "push", "-q", "-f", f"https://x-access-token:{TOKEN}@github.com/{OWNER}/{REPO}.git", f"main:{BRANCH}")
print("push OK ->", f"{OWNER}/{REPO}", "->", PAGES_DOMAIN)
