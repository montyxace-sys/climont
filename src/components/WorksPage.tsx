import { useEffect, useState } from 'react';
import { ArrowLeft, X, ZoomIn } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { Contact } from '@/components/Contact';
import { useSeo } from '@/hooks/useSeo';
import { PROJECTS, type ProjectStatus } from '@/data/projects';

const LABELS: Record<ProjectStatus, { title: string; subtitle: string; description: string; pathTitle: string }> = {
  'terminada': { title: 'Obras terminadas', subtitle: 'Trabajos realizados', description: 'Proyectos de climatización ejecutados por el equipo de Climatizaciones Montaño: edificios, viviendas y locales.', pathTitle: 'Obras terminadas | Climatizaciones Montaño, S.L.' },
  'en-ejecucion': { title: 'Obras en ejecución', subtitle: 'Trabajos en curso', description: 'Proyectos de climatización en curso. Se actualizarán a medida que se avance la obra.', pathTitle: 'Obras en ejecución | Climatizaciones Montaño, S.L.' },
};

export function WorksPage({ status }: { status: ProjectStatus }) {
  const meta = LABELS[status];
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useSeo({ title: meta.pathTitle, description: meta.description, canonicalPath: status === 'terminada' ? '/obras/terminadas' : '/obras/en-ejecucion' });
  const projects = PROJECTS.filter((p) => p.status === status);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-ink-950 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <a href="/" className="inline-flex items-center gap-1.5 text-primary-300 hover:text-white text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </a>
            <div className="flex items-center gap-2 ml-auto">
              <a
                href="/obras/terminadas"
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  status === 'terminada' ? 'bg-primary-500/20 text-primary-300 ring-1 ring-primary-500/40' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                Obras realizadas
              </a>
              <a
                href="/obras/en-ejecucion"
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  status === 'en-ejecucion' ? 'bg-primary-500/20 text-primary-300 ring-1 ring-primary-500/40' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                Obras en ejecución
              </a>
            </div>
          </div>
          <span className="inline-block px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-300 text-sm font-medium mb-4">{meta.subtitle}</span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">{meta.title}</h1>
          <p className="text-white/80 text-lg max-w-3xl">{meta.description}</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {projects.length === 0 ? (
          <div className="text-center py-20 text-ink-500">
            <p className="text-lg font-medium">Próximamente publicaremos aquí los detalles de nuestras obras.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((p, idx) => (
              <Reveal key={p.slug} delay={idx * 120}>
                <article className="bg-white rounded-2xl overflow-hidden border border-ink-100 shadow-lg">
                  <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {p.gallery.map((img, i) => (
                      <div key={i} role="button" tabIndex={0} className="group relative overflow-hidden rounded-2xl shadow-md ring-1 ring-ink-100 cursor-zoom-in" onClick={() => setLightbox({ src: img.src, alt: img.alt })} onKeyDown={(e) => { if (e.key === 'Enter') setLightbox({ src: img.src, alt: img.alt }); }}>
                        <img
                          src={img.src}
                          alt={img.alt}
                          className="w-full h-52 sm:h-56 object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          loading="lazy"
                          width={1184}
                          height={896}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                        {img.caption && (
                          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <span className="text-white text-xs font-semibold drop-shadow">{img.caption}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-6">
                    <span className="inline-block text-xs font-semibold text-primary-700 bg-primary-50 rounded-full px-3 py-1 mb-3">{p.category}</span>
                    <h2 className="font-display text-xl font-bold text-ink-900 mb-1">{p.title}</h2>
                    <p className="text-ink-500 text-sm">
                      <span className="font-medium text-ink-700">{p.location}</span> · {p.summary}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </main>
      <Contact />
      {lightbox && (
        <div
          className="fixed inset-0 z-[99] flex items-center justify-center bg-ink-950/90 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-w-full max-h-[88vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
