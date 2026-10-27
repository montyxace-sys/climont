import { Snowflake, ArrowLeft, ArrowRight, MessageCircle, Phone, Clock, Calendar, ClipboardList, Link2 } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { useSeo } from '@/hooks/useSeo';
import type { BlogPost } from '@/data/blog';

function BlogPostingJsonLd({ post }: { post: BlogPost }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'Climatizaciones Montaño, S.L.', url: 'https://climont.es/' },
    publisher: { '@id': 'https://climont.es/#business' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://climont.es/blog/${post.slug}` },
    inLanguage: 'es-ES',
  };
  const breadcrumbJson = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://climont.es/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://climont.es/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://climont.es/blog/${post.slug}` },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }} />
    </>
  );
}

export function BlogPage({ post }: { post: BlogPost }) {
  useSeo({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    canonicalPath: `/blog/${post.slug}`,
    keywords: post.keywords,
  });

  return (
    <div className="min-h-screen bg-white">
      <BlogPostingJsonLd post={post} />
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
              <Snowflake className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-ink-900 hidden sm:inline">
              Climatizaciones <span className="text-primary-700">Montaño</span>, S.L.
            </span>
          </a>
          <a href="/blog" className="flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Ver todos los artículos
          </a>
        </div>
      </div>

      <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950 pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="absolute inset-0">
          <img src="/office-cassette-ac.webp" alt="Equipo de aire acondicionado tipo cassette instalado" className="w-full h-full object-cover opacity-15"  width={1184} height={896} />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-900/50" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-300 text-sm font-medium mb-6">
            {post.category}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] mb-6">
            {post.title}
          </h1>
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readTime} de lectura
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {post.content.map((block, index) => (
            <div key={index} className={index > 0 ? 'mt-8' : ''}>
              {block.heading && (
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-4">
                  {block.heading}
                </h2>
              )}
              <p className="text-lg text-ink-600 leading-relaxed">
                {block.paragraph}
              </p>
            </div>
          ))}

          {/* Related services */}
          {post.relatedServices && post.relatedServices.length > 0 && (
            <div className="mt-12 p-6 bg-ink-50 rounded-2xl border border-ink-100">
              <h3 className="font-display text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary-600" />
                Servicios relacionados
              </h3>
              <div className="flex flex-col gap-3">
                {post.relatedServices.map((svc) => (
                  <a key={svc.href} href={svc.href} className="group inline-flex items-center gap-2 text-ink-700 hover:text-primary-700 font-medium transition-colors">
                    <ArrowRight className="w-4 h-4 text-primary-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    {svc.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-900" />
            <div className="relative px-6 py-10 lg:px-12 lg:py-12 text-center">
              <h2 className="font-display text-2xl font-bold text-white mb-3">
                ¿Necesitas aire acondicionado?
              </h2>
              <p className="text-primary-100 mb-6">
                Solicita tu presupuesto gratis y sin compromiso. Te respondemos en menos de 24 horas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="https://wa.me/34691680706" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-success-600 hover:bg-success-700 text-white font-semibold rounded-xl transition-all shadow-xl hover:-translate-y-0.5">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
                <a href="tel:+34676628348" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-xl hover:-translate-y-0.5">
                  <Phone className="w-5 h-5" />
                  Llamar
                </a>
                <a href="/#contacto" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-xl hover:-translate-y-0.5">
                  <ClipboardList className="w-5 h-5" />
                  Solicitar presupuesto
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>

      </main>

      <footer className="bg-ink-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-primary-400" />
            <span className="text-white/70 text-sm font-medium">Climatizaciones Montaño, S.L. — Blog de climatización</span>
          </div>
          <div className="flex gap-4 text-sm text-white/50">
            <a href="/" className="hover:text-primary-400 transition-colors">Inicio</a>
            <a href="/#servicios" className="hover:text-primary-400 transition-colors">Servicios</a>
            <a href="/#contacto" className="hover:text-primary-400 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function BlogList({ posts }: { posts: BlogPost[] }) {
  useSeo({
    title: 'Blog de Climatización en Sevilla | Climatizaciones Montaño, S.L.',
    description: 'Consejos, guías y novedades sobre aire acondicionado, aerotermia, eficiencia energética y mantenimiento.',
    canonicalPath: '/blog',
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
              <Snowflake className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-ink-900 hidden sm:inline">
              Climatizaciones <span className="text-primary-700">Montaño</span>, S.L.
            </span>
          </a>
          <a href="/" className="flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </a>
        </div>
      </div>

      <main>
      <section className="relative overflow-hidden bg-ink-950 pt-16 pb-20">
        <div className="absolute inset-0">
          <img src="/office-cassette-ac.webp" alt="Blog de climatización" className="w-full h-full object-cover opacity-15"  width={1184} height={896} />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-900/50" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
            Blog de climatización
          </h1>
          <p className="text-lg lg:text-xl text-white/80 leading-relaxed">
            Consejos, guías y novedades sobre aire acondicionado, aerotermia, eficiencia energética y mantenimiento.
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {posts.map((post, index) => (
              <Reveal key={post.slug} delay={index * 80}>
                <a href={`/blog/${post.slug}`} className="group block h-full bg-white rounded-2xl p-7 border border-ink-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300">
                  <div className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full mb-4">
                    {post.category}
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink-900 mb-3 group-hover:text-primary-700 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-ink-500 text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-ink-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-primary-600 text-sm font-medium">
                    Leer artículo
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      </main>

      <footer className="bg-ink-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-primary-400" />
            <span className="text-white/70 text-sm font-medium">Climatizaciones Montaño, S.L. — Blog de climatización</span>
          </div>
          <div className="flex gap-4 text-sm text-white/50">
            <a href="/" className="hover:text-primary-400 transition-colors">Inicio</a>
            <a href="/#servicios" className="hover:text-primary-400 transition-colors">Servicios</a>
            <a href="/#contacto" className="hover:text-primary-400 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
