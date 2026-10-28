import { ArrowLeft } from 'lucide-react';
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
  useSeo({ title: meta.pathTitle, description: meta.description, canonicalPath: status === 'terminada' ? '/obras/terminadas' : '/obras/en-ejecucion' });
  const projects = PROJECTS.filter((p) => p.status === status);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-ink-950 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/" className="inline-flex items-center gap-1.5 text-primary-300 hover:text-white text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </a>
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
                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                    {p.gallery.map((img, i) => (
                      <img
                        key={i}
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-40 sm:h-44 object-cover rounded-xl transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                        width={1184}
                        height={896}
                      />
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
    </div>
  );
}
