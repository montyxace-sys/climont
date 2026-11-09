import csv, json, os

rows = []
with open('public/downloads-covers/mapping.csv', newline='', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        parts = line.split(';')
        if len(parts) < 3:
            continue
        pdf_name, slug, size_str = parts[0], parts[1], parts[2]
        try:
            size_bytes = int(size_str)
        except ValueError:
            size_bytes = 0
        if size_bytes >= 1024*1024:
            size = f"{size_bytes/(1024*1024):.1f} MB"
        elif size_bytes >= 1024:
            size = f"{size_bytes/1024:.0f} KB"
        else:
            size = f"{size_bytes} B"

        title = pdf_name
        if title.lower().endswith('.pdf'):
            title = title[:-4]

        thumb = f"/downloads-covers/{slug}.jpg"
        if not os.path.exists('public' + thumb):
            thumb = None

        rows.append({
            "title": title,
            "file": pdf_name,
            "description": None,
            "category": "Catálogos y tarifas",
            "size": size,
            "thumbnail": thumb,
        })

rows.sort(key=lambda r: r['title'].lower())

with open('public/documentos.json', 'w', encoding='utf-8') as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)
    f.write('\n')

print("entries:", len(rows))
print("first:", rows[0]['file'])