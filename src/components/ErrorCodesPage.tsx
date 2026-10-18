import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, BookOpen, Check, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';

import { navigate } from '@/lib/navigate';

type ErrorCode = {
  id: string;
  brand: string;
  code: string;
  category: string;
  meaning: string;
  level: 'Técnico' | 'Usuario';
  source_version: string;
  sort_order: number;
};

type GuideSection = {
  brand: string;
  instructions: string;
  examples: string;
};

const GUIDE_SECTIONS: GuideSection[] = [
  { brand: 'Daikin', instructions: 'Con el mando, mantén pulsado CANCEL unos 5 segundos; cuando aparezca 00, pulsa CANCEL repetidamente hasta oír un pitido.', examples: 'A0, A1, A3, A4, C4/C5/C9, E3, E4, U0, U2 y U4.' },
  { brand: 'Mitsubishi Electric', instructions: 'En mandos inalámbricos, pulsa CHECK dos veces. En mandos con cable, pulsa CHECK dos veces y consulta el número mostrado.', examples: 'E6, P1, E1, 0403, 0900, 1102, 1301 y 1302.' },
  { brand: 'Mitsubishi Heavy Industries', instructions: 'Los códigos dependen de la serie: E1–E31 suelen corresponder a la unidad interior y E32–E75 a la exterior.', examples: 'E5, E6, E8, E9, E16, E30, E40, E57 y E84.' },
  { brand: 'LG', instructions: 'El código aparece precedido de CH. En modelos con LED, el primer parpadeo indica el primer dígito y el segundo parpadeo el segundo.', examples: 'CH01/CH02, CH03, CH05/E0/CH53, CH07, CH10, CH34, CH38/F4 y E5.' },
  { brand: 'Samsung', instructions: 'Los códigos parpadean en el display de la unidad interior; algunos modelos muestran el equivalente numérico de dos dígitos.', examples: 'E101/E102, E121, E122, E154 y E162/E163.' },
  { brand: 'Fujitsu General', instructions: 'Cuenta los parpadeos de las luces Operation y Timer. También puedes consultar el último error con el botón Manual/Auto.', examples: '11, 24, 32, 35, 53, 63, 64, 6A y 97.' },
  { brand: 'Panasonic', instructions: 'Consulta el error en el display del mando o en Panasonic Comfort Cloud, dentro de la sección Error messages.', examples: 'H00, H11, H12, H14–H19, H23/H24 y F11/F17/F90–F99.' },
  { brand: 'Haier', instructions: 'Esta familia utiliza tablas propias del fabricante. Los códigos solo deben interpretarse junto al modelo exacto.', examples: 'E1, E2, E4, E5, E7, E9, E14, F1–F9 y F11–F28.' },
  { brand: 'Hitachi', instructions: 'Las unidades interiores muestran el código en el mando y las exteriores en un panel tras una tapa. En splits también puede aparecer como LED parpadeante.', examples: '01/02, 03/04/0A, 05, 06, 07/08, 0B/0C, 11/12, 19, 31/35/36/38 y 53/54.' },
  { brand: 'Toshiba', instructions: 'En las series RAV-SM y RAV-SP se muestran en el mando con cable mediante el historial de servicio.', examples: 'F01/F02, F04, F06/F12, F07/F08, F10, F23, F31, L29, L31 y P01/P12.' },
  { brand: 'Gree', instructions: 'Se indican con LED parpadeantes o en el display. El significado puede variar entre series.', examples: 'E1–E9, F0/F1/F3, H3–H5, U1 y U9.' },
  { brand: 'Midea', instructions: 'Los equipos de ventana y portátiles pueden usar códigos como AS, CS, ES, OS o E; el significado depende de la familia.', examples: 'E0, F2, F3, F4, F6 y P4.' },
  { brand: 'Carrier', instructions: 'La serie 38GVM/40GVM comparte códigos entre familias, pero algunos significados no se pueden confirmar sin el manual de servicio.', examples: '08, 0A, F0, F3, F4, F5, F7, E1–E9 y P0.' },
];

const FALLBACK_CODES: ErrorCode[] = [
  { id: 'aux-e0', brand: 'AUX', code: 'E0', category: 'Protección', meaning: 'Protección contra sobrecorriente de unidad interior', level: 'Técnico', source_version: 'Biblioteca HVAC multimarca V2', sort_order: 1 },
  { id: 'aux-e1', brand: 'AUX', code: 'E1', category: 'Sensor', meaning: 'Error del sensor de ambiente interior', level: 'Técnico', source_version: 'Biblioteca HVAC multimarca V2', sort_order: 2 },
  { id: 'daikin-u0', brand: 'Daikin', code: 'U0', category: 'Refrigerante', meaning: 'Falta de refrigerante', level: 'Técnico', source_version: 'Biblioteca HVAC multimarca V2', sort_order: 25 },
  { id: 'daikin-u4', brand: 'Daikin', code: 'U4', category: 'Comunicación', meaning: 'Fallo de transmisión entre unidad interior y exterior', level: 'Técnico', source_version: 'Biblioteca HVAC multimarca V2', sort_order: 27 },
  { id: 'lg-ch05', brand: 'LG', code: 'CH05', category: 'Comunicación', meaning: 'Problema de comunicación entre unidades interior y exterior', level: 'Técnico', source_version: 'Biblioteca HVAC multimarca V2', sort_order: 40 },
  { id: 'samsung-cf', brand: 'Samsung', code: 'CF', category: 'Mantenimiento', meaning: 'Recordatorio de limpieza del filtro', level: 'Usuario', source_version: 'Biblioteca HVAC multimarca V2', sort_order: 50 },
];

export function ErrorCodesPage() {
  const [codes, setCodes] = useState<ErrorCode[]>([]);
  const [search, setSearch] = useState('');
  const [activeBrand, setActiveBrand] = useState('Todas');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCodes() {
      const { data, error: queryError } = await supabase
        .from('hvac_error_codes')
        .select('id, brand, code, category, meaning, level, source_version, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('brand', { ascending: true });

      if (cancelled) return;
      if (queryError) {
        setError('No se pudo conectar con la biblioteca. Mostramos una referencia básica mientras lo intentas de nuevo.');
        setCodes(FALLBACK_CODES);
      } else {
        setCodes(data || []);
      }
      setLoading(false);
    }

    loadCodes();
    return () => { cancelled = true; };
  }, []);

  const brands = useMemo(() => ['Todas', ...Array.from(new Set(codes.map((item) => item.brand)))], [codes]);
  const categories = useMemo(() => ['Todas', ...Array.from(new Set(codes.map((item) => item.category)))], [codes]);

  const filteredCodes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return codes.filter((item) => {
      const matchesBrand = activeBrand === 'Todas' || item.brand === activeBrand;
      const matchesCategory = activeCategory === 'Todas' || item.category === activeCategory;
      const matchesSearch = !normalizedSearch || [item.brand, item.code, item.category, item.meaning]
        .some((value) => value.toLowerCase().includes(normalizedSearch));
      return matchesBrand && matchesCategory && matchesSearch;
    });
  }, [activeBrand, activeCategory, codes, search]);

  return (
    <div className="min-h-screen bg-ink-50">
      <Header />
      <main className="pt-16 lg:pt-20">
        <section className="relative overflow-hidden bg-ink-950 text-white py-14 lg:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(6,182,212,0.22),transparent_34%),radial-gradient(circle_at_12%_90%,rgba(14,116,144,0.22),transparent_36%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-white/65 hover:text-white text-sm mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </button>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/15 rounded-full text-primary-200 text-sm font-semibold mb-5">
                <BookOpen className="w-4 h-4" /> Biblioteca técnica
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
                Códigos de errores de aire acondicionado
              </h1>
              <p className="text-white/70 text-base lg:text-lg leading-relaxed max-w-2xl">
                Guía de referencia elaborada el 16/10/2026 a partir de documentación de fabricantes y fuentes técnicas. Consulta los códigos por marca y confirma siempre la serie y el modelo exactos antes de diagnosticar o pedir un repuesto.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-10 max-w-2xl">
              <div className="rounded-2xl bg-white/8 border border-white/10 p-4"><div className="text-2xl font-display font-bold">{codes.length}</div><div className="text-xs text-white/55 mt-1">Referencias cargadas</div></div>
              <div className="rounded-2xl bg-white/8 border border-white/10 p-4"><div className="text-2xl font-display font-bold">{Math.max(brands.length - 1, 0)}</div><div className="text-xs text-white/55 mt-1">Marcas y familias</div></div>
              <div className="rounded-2xl bg-white/8 border border-white/10 p-4"><div className="text-2xl font-display font-bold">13</div><div className="text-xs text-white/55 mt-1">Familias documentadas</div></div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex items-start gap-3 rounded-2xl border border-warning-200 bg-warning-50 px-5 py-4 text-warning-900 mb-8">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-warning-700 mt-0.5" />
            <p className="text-sm leading-relaxed"><strong>Regla profesional:</strong> el mismo código puede variar según la familia y el modelo. Las operaciones eléctricas, frigoríficas y la sustitución de componentes deben realizarlas profesionales cualificados.</p>
          </div>

          <section className="bg-white rounded-3xl border border-ink-100 shadow-sm p-5 sm:p-7 mb-8" aria-labelledby="guide-title">
            <div className="flex items-start gap-3 mb-5">
              <BookOpen className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" aria-hidden="true" />
              <div>
                <h2 id="guide-title" className="font-display text-xl font-bold text-ink-900">Cómo usar esta guía</h2>
                <p className="text-sm text-ink-600 mt-1 leading-relaxed">El mismo código puede tener significados distintos según la marca, la serie y el año. Si el código reaparece después de apagar el equipo durante cinco minutos, solicita una revisión técnica.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {GUIDE_SECTIONS.map((section) => (
                <article key={section.brand} className="rounded-2xl border border-ink-100 bg-ink-50/70 p-4">
                  <h3 className="font-display font-bold text-ink-900">{section.brand}</h3>
                  <p className="text-sm text-ink-600 leading-relaxed mt-2">{section.instructions}</p>
                  <p className="text-xs text-ink-500 leading-relaxed mt-3"><span className="font-semibold text-ink-700">Ejemplos:</span> {section.examples}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="bg-white rounded-3xl border border-ink-100 shadow-sm p-4 sm:p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar marca, código o significado..." className="w-full pl-12 pr-4 py-3.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500" />
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-500"><SlidersHorizontal className="w-4 h-4" /> Filtros</div>
              <select value={activeBrand} onChange={(event) => setActiveBrand(event.target.value)} className="px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary-300">
                {brands.map((brand) => <option key={brand}>{brand}</option>)}
              </select>
              <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)} className="px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary-300">
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
          </div>

          {error && <div className="flex items-center gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-warning-800 text-sm mb-6"><AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}</div>}
          {loading ? (
            <div className="py-24 flex justify-center"><div className="w-9 h-9 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
          ) : filteredCodes.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-3xl border border-ink-100"><Search className="w-10 h-10 text-ink-300 mx-auto mb-4" /><p className="text-ink-500">No encontramos códigos con esos criterios.</p></div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm">
              <div className="hidden md:grid grid-cols-[1fr_1fr_1.3fr_3fr_1fr] gap-4 px-6 py-4 bg-ink-900 text-white text-xs font-semibold uppercase tracking-wider"><span>Marca</span><span>Código</span><span>Categoría</span><span>Significado</span><span>Nivel</span></div>
              <div className="divide-y divide-ink-100">
                {filteredCodes.map((item) => (
                  <article key={item.id} className="grid md:grid-cols-[1fr_1fr_1.3fr_3fr_1fr] gap-2 md:gap-4 px-5 sm:px-6 py-5 hover:bg-primary-50/40 transition-colors">
                    <div><span className="md:hidden text-[11px] uppercase tracking-wide text-ink-400">Marca</span><p className="font-display font-bold text-ink-900">{item.brand}</p></div>
                    <div><span className="md:hidden text-[11px] uppercase tracking-wide text-ink-400">Código</span><p className="font-mono font-bold text-primary-700">{item.code}</p></div>
                    <div><span className="md:hidden text-[11px] uppercase tracking-wide text-ink-400">Categoría</span><p className="text-ink-600 text-sm">{item.category}</p></div>
                    <div><span className="md:hidden text-[11px] uppercase tracking-wide text-ink-400">Significado</span><p className="text-ink-700 text-sm leading-relaxed">{item.meaning}</p></div>
                    <div><span className="md:hidden text-[11px] uppercase tracking-wide text-ink-400">Nivel</span><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${item.level === 'Usuario' ? 'bg-success-100 text-success-800' : 'bg-primary-100 text-primary-800'}`}><Check className="w-3 h-3" />{item.level}</span></div>
                  </article>
                ))}
              </div>
            </div>
          )}
          <p className="text-center text-xs text-ink-400 mt-8">Fuente: guía «Códigos de error de aire acondicionado por marca», revisada el 16/10/2026. Los significados son orientativos y pueden cambiar según el modelo. Consulta siempre el manual oficial y deja las operaciones eléctricas o frigoríficas en manos de un técnico cualificado.</p>
        </section>
      </main>
    </div>
  );
}
