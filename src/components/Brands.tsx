import { useMemo } from 'react';
import { Reveal } from '@/components/Reveal';

const BRANDS = [
  { name: 'Daikin', slug: 'daikin', logo: '/brands/daikin.svg', hasPage: true },
  { name: 'Mitsubishi Electric', slug: 'mitsubishi', logo: '/brands/mitsubishi.svg', hasPage: true },
  { name: 'Fujitsu', slug: 'fujitsu', logo: '/brands/fujitsu.svg', hasPage: true },
  { name: 'Panasonic', slug: 'panasonic', logo: '/brands/panasonic.svg', hasPage: true },
  { name: 'Samsung', slug: 'samsung', logo: '/brands/samsung.svg', hasPage: true },
  { name: 'LG', slug: 'lg', logo: '/brands/lg.svg', hasPage: true },
  { name: 'Hisense', slug: 'hisense', logo: '/brands/hisense.svg', hasPage: true },
  { name: 'Hitachi', slug: 'hitachi', logo: '/brands/hitachi.svg', hasPage: true },
  { name: 'Climaver', slug: 'climaver', logo: '/brands/climaver.svg', hasPage: false },
  { name: 'Airzone', slug: 'airzone', logo: '/brands/airzone.svg', hasPage: false },
  { name: 'Koolnova', slug: 'koolnova', logo: '/brands/koolnova.svg', hasPage: false },
  { name: 'MYSAir', slug: 'mysair', logo: '/brands/mysair.svg', hasPage: false },
  { name: 'Madel', slug: 'madel', logo: '/brands/madel.svg', hasPage: false },
  { name: 'Koolair', slug: 'koolair', logo: '/brands/koolair.svg', hasPage: false },
  { name: 'Sodeca', slug: 'sodeca', logo: '/brands/sodeca.svg', hasPage: false },
  { name: 'Novovent', slug: 'novovent', logo: '/brands/novovent.svg', hasPage: false },
  { name: 'Casals', slug: 'casals', logo: '/brands/casals.svg', hasPage: false },
  { name: 'Soler & Palau', slug: 'soler-palau', logo: '/brands/soler-palau.svg', hasPage: false },
  { name: 'Siber', slug: 'siber', logo: '/brands/siber.svg', hasPage: false },
  { name: 'Haier', slug: 'haier', logo: '/brands/haier.svg', hasPage: false },
  { name: 'Giatsu', slug: 'giatsu', logo: '/brands/giatsu.svg', hasPage: false },
  { name: 'Johnson', slug: 'johnson', logo: '/brands/johnson.svg', hasPage: true },
];

const INTERIOR_IMAGE =
  'https://images.pexels.com/photos/8089170/pexels-photo-8089170.jpeg?auto=compress&cs=tinysrgb&w=1200';

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function Brands() {
  const marqueeItems = useMemo(() => {
    const shuffled = shuffle(BRANDS);
    return [...shuffled, ...shuffled];
  }, []);

  return (
    <section id="marcas" className="py-16 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Left: image */}
          <Reveal>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-ink-900/10">
                <img
                  src={INTERIOR_IMAGE}
                  alt="Aire acondicionado Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense y Hitachi instalados por Climatizaciones Montaño"
                  className="w-full h-[360px] lg:h-[440px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/30 to-transparent" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -right-2 lg:-right-6 bg-white rounded-2xl shadow-xl p-5 max-w-[240px] border border-ink-100">
                <div className="font-display text-3xl font-bold text-primary-600">A+++</div>
                <div className="text-sm text-ink-500 mt-1">
                  Máxima eficiencia energética en todas nuestras instalaciones
                </div>
              </div>
              {/* Decorative blob */}
              <div className="absolute -top-8 -left-8 w-40 h-40 bg-primary-100 rounded-full blur-2xl -z-10" />
            </div>
          </Reveal>

          {/* Right: brands content */}
          <div>
            <Reveal>
              <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Marcas que instalamos
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 mb-4">
                Instalador autorizado de las mejores marcas de climatización
              </h2>
              <p className="text-lg text-ink-500 mb-8 leading-relaxed">
                Somos distribuidores e instaladores autorizados de aire acondicionado Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense, Hitachi y Johnson en Sevilla y provincia.
                Además, trabajamos con marcas complementarias de zonificación, difusión y ventilación como Airzone, Koolnova, MYSAir, Madel, Koolair, Sodeca, Novovent, Casals, Soler & Palau, Siber, Haier y Giatsu para ofrecerte instalaciones completas de máxima calidad.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { value: '100%', label: 'Garantía oficial' },
                  { value: 'Mejor', label: 'Precio garantizado' },
                  { value: 'Stock', label: 'Disponible inmediato' },
                ].map((item) => (
                  <div key={item.label} className="text-center sm:text-left">
                    <div className="font-display text-xl font-bold text-ink-900">
                      {item.value}
                    </div>
                    <div className="text-xs text-ink-500 mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Full-width marquee slider */}
      <div className="mt-12 marquee-pause">
        <div className="relative">
          {/* Edge fade gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          {/* Top divider line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent" />

          <div className="flex animate-marquee w-max py-2">
            {marqueeItems.map((brand, index) => {
              const card = brand.hasPage ? (
                <a
                  key={`${brand.name}-${index}`}
                  href={`/marcas/${brand.slug}`}
                  className="group flex items-center justify-center mx-3 lg:mx-4 px-8 lg:px-10 h-24 lg:h-28 flex-shrink-0 rounded-2xl bg-ink-50/60 border border-ink-100/80 hover:bg-white hover:border-primary-200 hover:shadow-lg hover:shadow-primary-900/5 transition-all duration-300"
                >
                  <img
                    src={brand.logo}
                    alt={`${brand.name} — Instalador autorizado | Climatizaciones Montaño, S.L.`}
                    className="h-12 lg:h-14 w-auto opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </a>
              ) : (
                <div
                  key={`${brand.name}-${index}`}
                  className="group flex items-center justify-center mx-3 lg:mx-4 px-8 lg:px-10 h-24 lg:h-28 flex-shrink-0 rounded-2xl bg-ink-50/60 border border-ink-100/80 hover:bg-white hover:border-primary-200 hover:shadow-lg hover:shadow-primary-900/5 transition-all duration-300"
                >
                  <img
                    src={brand.logo}
                    alt={`${brand.name} — Instalador autorizado | Climatizaciones Montaño, S.L.`}
                    className="h-12 lg:h-14 w-auto opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              );
              return card;
            })}
          </div>

          {/* Bottom divider line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent" />
        </div>
      </div>
    </section>
  );
}
