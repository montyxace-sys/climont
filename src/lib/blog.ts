import { supabase } from '@/lib/supabase';
import type { BlogPost } from '@/data/blog';

export type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  excerpt: string;
  content: unknown;
  date: string;
  read_time: string;
  category: string;
  related_services: unknown;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function parseContent(value: unknown): BlogPost['content'] {
  if (!Array.isArray(value)) return [];
  return value.filter((block): block is { heading?: string; paragraph: string } => (
    typeof block === 'object' && block !== null && typeof (block as { paragraph?: unknown }).paragraph === 'string'
  ));
}

function parseRelatedServices(value: unknown): BlogPost['relatedServices'] {
  if (!Array.isArray(value)) return [];
  return value.filter((service): service is { label: string; href: string } => (
    typeof service === 'object' && service !== null
    && typeof (service as { label?: unknown }).label === 'string'
    && typeof (service as { href?: unknown }).href === 'string'
  ));
}

export function rowToBlogPost(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    keywords: row.keywords,
    excerpt: row.excerpt,
    content: parseContent(row.content),
    date: row.date,
    readTime: row.read_time,
    category: row.category,
    relatedServices: parseRelatedServices(row.related_services),
  };
}

export async function loadPublishedBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, meta_title, meta_description, keywords, excerpt, content, date, read_time, category, related_services, status, published_at, created_at, updated_at')
    .eq('status', 'published')
    .order('date', { ascending: false });

  if (error || !data) return [];
  return (data as BlogPostRow[]).map(rowToBlogPost);
}
