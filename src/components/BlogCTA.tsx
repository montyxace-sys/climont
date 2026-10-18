import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { BLOG_POSTS } from '@/data/blog';
import { navigate } from '@/lib/navigate';

const FEATURED = BLOG_POSTS.slice(0, 3);

export function BlogCTA() {
  return (
    <section id="blog-cta" className="py-16 lg:py-24 bg-gradient-to-b from-ink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intro */}
        <Reveal className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-5">
            <BookOpen className="w-4 h-4" />
            Blog de climatización
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 mb-5">
            Guías y consejos para tu aire acondicionado
          </h2>
          <p className="text-ink-500 text-lg leading-relaxed">
            Llevamos más de 25 años instalando y reparando aire acondicionado.
            Compartimos nuestra experiencia para que saques el máximo rendimiento a tus equipos,
            ahorres en tu factura y tomes las mejores decisiones de compra. Artículos prácticos,
            sin tecnicismos, pensados para ti.
          </p>
        </Reveal>

        {/* Featured articles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {FEATURED.map((post, index) => (
            <Reveal key={post.slug} delay={index * 80}>
              <button
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="group h-full text-left w-full bg-white rounded-2xl p-7 border border-ink-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-semibold rounded-full">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-ink-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="font-display font-bold text-ink-900 text-lg leading-snug mb-3 group-hover:text-primary-700 transition-colors">
                  {post.title}
                </h3>
                <p className="text-ink-500 text-sm leading-relaxed flex-grow mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <span className="inline-flex items-center gap-1.5 text-primary-600 text-sm font-medium group-hover:gap-2.5 transition-all">
                  Leer artículo
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        {/* CTA button */}
        <Reveal className="text-center">
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 px-7 py-4 bg-ink-900 hover:bg-ink-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Ver todos los artículos
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-ink-400 text-sm mt-4">
            {BLOG_POSTS.length} artículos disponibles sobre instalación, mantenimiento, aerotermia y más
          </p>
        </Reveal>
      </div>
    </section>
  );
}
