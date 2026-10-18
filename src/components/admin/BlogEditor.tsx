import { useEffect, useMemo, useState } from 'react';
import { Check, FilePlus2, Import, Pencil, Save, Send, X } from 'lucide-react';
import { BLOG_POSTS, type BlogPost } from '@/data/blog';
import { supabase } from '@/lib/supabase';
import type { BlogPostRow } from '@/lib/blog';

const EMPTY_FORM = {
  slug: '',
  title: '',
  meta_title: '',
  meta_description: '',
  keywords: '',
  excerpt: '',
  date: new Date().toISOString().slice(0, 10),
  read_time: '5 min',
  category: 'General',
  status: 'draft' as 'draft' | 'published',
  content: '',
  related_services: '',
};

type BlogForm = typeof EMPTY_FORM;

type EditorPost = BlogPostRow;

function postToForm(post: EditorPost): BlogForm {
  const blocks = Array.isArray(post.content) ? post.content as { heading?: string; paragraph?: string }[] : [];
  const content = blocks.map((block) => `${block.heading ? `## ${block.heading}\n` : ''}${block.paragraph || ''}`).join('\n\n');
  const services = Array.isArray(post.related_services) ? post.related_services as { label?: string; href?: string }[] : [];
  return {
    slug: post.slug,
    title: post.title,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
    keywords: post.keywords,
    excerpt: post.excerpt,
    date: post.date,
    read_time: post.read_time,
    category: post.category,
    status: post.status,
    content,
    related_services: services.map((service) => `${service.label || ''} | ${service.href || ''}`).join('\n'),
  };
}

function formToRow(form: BlogForm) {
  const content = form.content
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const headingMatch = part.match(/^##\s+(.+)\n([\s\S]+)$/);
      return headingMatch ? { heading: headingMatch[1].trim(), paragraph: headingMatch[2].trim() } : { paragraph: part };
    });
  const relatedServices = form.related_services
    .split('\n')
    .map((line) => line.split('|').map((value) => value.trim()))
    .filter(([label, href]) => Boolean(label && href))
    .map(([label, href]) => ({ label, href }));

  return {
    slug: form.slug.trim().toLowerCase(),
    title: form.title.trim(),
    meta_title: form.meta_title.trim() || form.title.trim(),
    meta_description: form.meta_description.trim() || form.excerpt.trim(),
    keywords: form.keywords.trim(),
    excerpt: form.excerpt.trim(),
    content,
    date: form.date,
    read_time: form.read_time.trim() || '5 min',
    category: form.category.trim() || 'General',
    related_services: relatedServices,
    status: form.status,
    published_at: form.status === 'published' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

function staticPostToRow(post: BlogPost) {
  return {
    slug: post.slug,
    title: post.title,
    meta_title: post.metaTitle,
    meta_description: post.metaDescription,
    keywords: post.keywords,
    excerpt: post.excerpt,
    content: post.content,
    date: post.date,
    read_time: post.readTime,
    category: post.category,
    related_services: post.relatedServices || [],
    status: 'published' as const,
    published_at: new Date(`${post.date}T09:00:00`).toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function BlogEditor() {
  const [posts, setPosts] = useState<EditorPost[]>([]);
  const [form, setForm] = useState<BlogForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publishedCount = useMemo(() => posts.filter((post) => post.status === 'published').length, [posts]);

  async function loadPosts() {
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('blog_posts')
      .select('id, slug, title, meta_title, meta_description, keywords, excerpt, content, date, read_time, category, related_services, status, published_at, created_at, updated_at')
      .order('updated_at', { ascending: false });
    if (queryError) {
      setError('No se han podido cargar los artículos.');
    } else {
      setPosts((data || []) as EditorPost[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  function startNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage(null);
    setError(null);
  }

  function editPost(post: EditorPost) {
    setEditingId(post.id);
    setForm(postToForm(post));
    setMessage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function savePost(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    const row = formToRow(form);
    if (!row.slug || !row.title || !row.excerpt || row.content.length === 0) {
      setError('Completa el título, slug, extracto y contenido antes de guardar.');
      setBusy(false);
      return;
    }

    const result = editingId
      ? await supabase.from('blog_posts').update(row).eq('id', editingId)
      : await supabase.from('blog_posts').insert(row);
    if (result.error) {
      setError('No se ha podido guardar el artículo. Revisa que el slug no esté repetido.');
    } else {
      setMessage(row.status === 'published' ? 'Artículo publicado correctamente.' : 'Borrador guardado correctamente.');
      await loadPosts();
    }
    setBusy(false);
  }

  async function importExistingPosts() {
    setBusy(true);
    setMessage(null);
    setError(null);
    const { error: importError } = await supabase
      .from('blog_posts')
      .upsert(BLOG_POSTS.map(staticPostToRow), { onConflict: 'slug' });
    if (importError) {
      setError('No se ha podido importar el catálogo actual.');
    } else {
      setMessage(`${BLOG_POSTS.length} artículos disponibles para editar.`);
      await loadPosts();
    }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary-600 text-sm font-semibold">Contenido</p>
          <h1 className="font-display text-3xl font-bold text-ink-900">Editar y publicar blog</h1>
          <p className="text-ink-500 mt-2">{publishedCount} publicados · {posts.length - publishedCount} borradores</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={importExistingPosts} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 hover:border-primary-300 hover:text-primary-700 disabled:opacity-50">
            <Import className="w-4 h-4" /> Importar artículos actuales
          </button>
          <button type="button" onClick={startNew} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
            <FilePlus2 className="w-4 h-4" /> Nuevo artículo
          </button>
        </div>
      </div>

      {message && <div className="rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800"><Check className="inline w-4 h-4 mr-2" />{message}</div>}
      {error && <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-800">{error}</div>}

      <form onSubmit={savePost} className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-ink-900">{editingId ? 'Editar artículo' : 'Nuevo artículo'}</h2>
          {editingId && <button type="button" onClick={startNew} className="inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-900"><X className="w-4 h-4" /> Cancelar</button>}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-ink-700">Título<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1.5 w-full rounded-xl border border-ink-200 px-3.5 py-3 text-ink-900" /></label>
          <label className="text-sm font-medium text-ink-700">Slug<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="mi-nuevo-articulo" className="mt-1.5 w-full rounded-xl border border-ink-200 px-3.5 py-3 text-ink-900" /></label>
          <label className="text-sm font-medium text-ink-700">Categoría<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1.5 w-full rounded-xl border border-ink-200 px-3.5 py-3 text-ink-900" /></label>
          <label className="text-sm font-medium text-ink-700">Fecha<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="mt-1.5 w-full rounded-xl border border-ink-200 px-3.5 py-3 text-ink-900" /></label>
          <label className="text-sm font-medium text-ink-700 md:col-span-2">Extracto<textarea value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} rows={2} className="mt-1.5 w-full rounded-xl border border-ink-200 px-3.5 py-3 text-ink-900" /></label>
          <label className="text-sm font-medium text-ink-700 md:col-span-2">Contenido<textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} rows={12} placeholder="Escribe cada párrafo separado por una línea en blanco. Usa ## Título para crear un encabezado." className="mt-1.5 w-full rounded-xl border border-ink-200 px-3.5 py-3 text-ink-900 font-sans" /></label>
          <label className="text-sm font-medium text-ink-700">Título SEO<input value={form.meta_title} onChange={(event) => setForm({ ...form, meta_title: event.target.value })} className="mt-1.5 w-full rounded-xl border border-ink-200 px-3.5 py-3 text-ink-900" /></label>
          <label className="text-sm font-medium text-ink-700">Descripción SEO<textarea value={form.meta_description} onChange={(event) => setForm({ ...form, meta_description: event.target.value })} rows={2} className="mt-1.5 w-full rounded-xl border border-ink-200 px-3.5 py-3 text-ink-900" /></label>
          <label className="text-sm font-medium text-ink-700">Palabras clave<input value={form.keywords} onChange={(event) => setForm({ ...form, keywords: event.target.value })} className="mt-1.5 w-full rounded-xl border border-ink-200 px-3.5 py-3 text-ink-900" /></label>
          <label className="text-sm font-medium text-ink-700">Tiempo de lectura<input value={form.read_time} onChange={(event) => setForm({ ...form, read_time: event.target.value })} className="mt-1.5 w-full rounded-xl border border-ink-200 px-3.5 py-3 text-ink-900" /></label>
          <label className="text-sm font-medium text-ink-700 md:col-span-2">Servicios relacionados <span className="font-normal text-ink-400">(una línea por servicio: texto | /ruta)</span><textarea value={form.related_services} onChange={(event) => setForm({ ...form, related_services: event.target.value })} rows={3} className="mt-1.5 w-full rounded-xl border border-ink-200 px-3.5 py-3 text-ink-900" /></label>
          <label className="text-sm font-medium text-ink-700">Estado<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as BlogForm['status'] })} className="mt-1.5 w-full rounded-xl border border-ink-200 px-3.5 py-3 text-ink-900"><option value="draft">Borrador</option><option value="published">Publicado</option></select></label>
        </div>
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
          {form.status === 'published' ? <Send className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {busy ? 'Guardando…' : form.status === 'published' ? 'Guardar y publicar' : 'Guardar borrador'}
        </button>
      </form>

      <section className="rounded-2xl border border-ink-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 sm:px-7 py-5 border-b border-ink-100"><h2 className="font-display text-xl font-bold text-ink-900">Artículos guardados</h2></div>
        {loading ? <div className="p-8 text-ink-500">Cargando artículos…</div> : posts.length === 0 ? <div className="p-8 text-ink-500">Importa los artículos actuales o crea uno nuevo.</div> : <div className="divide-y divide-ink-100">{posts.map((post) => <div key={post.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 sm:px-7 py-4"><div><p className="font-semibold text-ink-900">{post.title}</p><p className="text-sm text-ink-500">/blog/{post.slug} · {post.status === 'published' ? 'Publicado' : 'Borrador'}</p></div><button type="button" onClick={() => editPost(post)} className="inline-flex items-center gap-2 self-start rounded-lg border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 hover:border-primary-300 hover:text-primary-700"><Pencil className="w-4 h-4" /> Editar</button></div>)}</div>}
      </section>
    </div>
  );
}
