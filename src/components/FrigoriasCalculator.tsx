import { useState, useMemo } from 'react';
import { Calculator, Snowflake, ThermometerSnowflake, House, Building2, Factory, Sun, ArrowRight, Check, Info } from 'lucide-react';
import { Header } from '@/components/Header';

import { FloatingPhoneButton } from '@/components/FloatingPhoneButton';

import { useSeo } from '@/hooks/useSeo';

type SpaceType = {
  id: string;
  label: string;
  icon: typeof House;
  wPerM2: number;
  description: string;
};

const SPACE_TYPES: SpaceType[] = [
  { id: 'vivienda', label: 'Vivienda', icon: House, wPerM2: 130, description: 'Hogar, piso o casa' },
  { id: 'oficina', label: 'Oficina', icon: Building2, wPerM2: 145, description: 'Espacio de trabajo' },
  { id: 'comercio', label: 'Comercio / Local', icon: Building2, wPerM2: 175, description: 'Tienda, restaurante, etc.' },
  { id: 'industrial', label: 'Nave industrial', icon: Factory, wPerM2: 200, description: 'Almacén, taller, nave' },
];

const ORIENTATIONS = [
  { id: 'norte', label: 'Norte', factor: 0.9 },
  { id: 'sur', label: 'Sur', factor: 1.0 },
  { id: 'este', label: 'Este', factor: 1.05 },
  { id: 'oeste', label: 'Oeste', factor: 1.1 },
];

const INSULATION_LEVELS = [
  { id: 'buena', label: 'Buena', factor: 0.85, hint: 'Aislamiento moderno, ventanas de doble cámara' },
  { id: 'normal', label: 'Normal', factor: 1.0, hint: 'Aislamiento estándar, ventanas dobles' },
  { id: 'mala', label: 'Deficiente', factor: 1.15, hint: 'Poco aislamiento, ventanas simples' },
];

function formatNumber(n: number): string {
  return n.toLocaleString('es-ES', { maximumFractionDigits: 0 });
}

export function FrigoriasCalculator() {
  useSeo({
    title: 'Calculadora de Frigorías y Potencia de Aire Acondicionado | Climatizaciones Montaño',
    description: 'Calcula cuántas frigorías y potencia de aire acondicionado necesita tu espacio según metros cuadrados, orientación, aislamiento y tipo de uso. Herramienta gratuita profesional.',
    canonicalPath: '/calculadora-frigorias',
    keywords: 'calculadora frigorías, calcular frigorías aire acondicionado, calcular potencia aire acondicionado, frigorías por metro cuadrado, dimensionar aire acondicionado, cuántas frigorías necesito, calcular BTU aire acondicionado, potencia climatización Sevilla',
  });

  const [spaceType, setSpaceType] = useState('vivienda');
  const [m2, setM2] = useState(25);
  const [orientation, setOrientation] = useState('sur');
  const [insulation, setInsulation] = useState('normal');
  const [people, setPeople] = useState(2);
  const [windows, setWindows] = useState(1);
  const [ceilingHeight, setCeilingHeight] = useState(2.5);

  const result = useMemo(() => {
    const space = SPACE_TYPES.find((s) => s.id === spaceType)!;
    const orient = ORIENTATIONS.find((o) => o.id === orientation)!;
    const insul = INSULATION_LEVELS.find((i) => i.id === insulation)!;

    const volume = m2 * ceilingHeight;
    const baseW = m2 * space.wPerM2;
    const orientationW = baseW * orient.factor;
    const insulationW = orientationW * insul.factor;
    const peopleW = people * 120;
    const windowsW = windows * 250;
    const totalW = insulationW + peopleW + windowsW;

    const frigorias = totalW / 1.163;
    const btu = totalW * 3.412;
    const kw = totalW / 1000;

    const recommendedFrigorias = Math.ceil(frigorias / 250) * 250;
    const recommendedKw = recommendedFrigorias * 1.163 / 1000;

    let equipmentType = '';
    if (recommendedFrigorias <= 2000) equipmentType = 'Split de pared 7000 BTU/h';
    else if (recommendedFrigorias <= 2500) equipmentType = 'Split de pared 9000 BTU/h';
    else if (recommendedFrigorias <= 3500) equipmentType = 'Split de pared 12000 BTU/h';
    else if (recommendedFrigorias <= 5000) equipmentType = 'Split de pared 18000 BTU/h';
    else if (recommendedFrigorias <= 7000) equipmentType = 'Split de pared o cassette 24000 BTU/h';
    else equipmentType = 'Sistema por conductos o multisplit';

    return {
      frigorias: formatNumber(frigorias),
      recommendedFrigorias: formatNumber(recommendedFrigorias),
      btu: formatNumber(btu),
      kw: kw.toFixed(2),
      recommendedKw: recommendedKw.toFixed(2),
      volume: formatNumber(volume),
      equipmentType,
      totalW: formatNumber(totalW),
    };
  }, [spaceType, m2, orientation, insulation, people, windows, ceilingHeight]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16 lg:pt-20">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-semibold mb-5">
              <Calculator className="w-4 h-4" />
              Herramienta gratuita
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Calculadora de Frigorías y Potencia
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Calcula cuánta potencia de aire acondicionado necesita tu espacio en segundos.
              Introduce los datos y obtén el resultado en frigorías, BTU y kilovatios.
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section className="py-12 lg:py-16 bg-ink-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
              {/* Form */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-ink-100 shadow-sm p-6 lg:p-8">
                <h2 className="font-display text-xl font-bold text-ink-900 mb-6 flex items-center gap-2">
                  <ThermometerSnowflake className="w-5 h-5 text-primary-600" />
                  Datos del espacio
                </h2>

                {/* Space type */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-ink-800 mb-3">
                    Tipo de espacio
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SPACE_TYPES.map((space) => {
                      const Icon = space.icon;
                      const active = spaceType === space.id;
                      return (
                        <button
                          key={space.id}
                          onClick={() => setSpaceType(space.id)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                            active
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-ink-100 hover:border-ink-200 text-ink-500'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-semibold text-center">{space.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Surface area */}
                <div className="mb-6">
                  <label className="flex items-center justify-between text-sm font-semibold text-ink-800 mb-2">
                    Superficie del espacio
                    <span className="text-primary-600 font-bold text-base">{m2} m²</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="1"
                    value={m2}
                    onChange={(e) => setM2(Number(e.target.value))}
                    className="w-full accent-primary-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-ink-400 mt-1">
                    <span>5 m²</span>
                    <span>200 m²</span>
                  </div>
                </div>

                {/* Ceiling height */}
                <div className="mb-6">
                  <label className="flex items-center justify-between text-sm font-semibold text-ink-800 mb-2">
                    Altura del techo
                    <span className="text-primary-600 font-bold text-base">{ceilingHeight.toFixed(1)} m</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="4.5"
                    step="0.1"
                    value={ceilingHeight}
                    onChange={(e) => setCeilingHeight(Number(e.target.value))}
                    className="w-full accent-primary-600 cursor-pointer"
                  />
                </div>

                {/* Orientation */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-ink-800 mb-3">
                    Orientación principal
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ORIENTATIONS.map((orient) => {
                      const active = orientation === orient.id;
                      return (
                        <button
                          key={orient.id}
                          onClick={() => setOrientation(orient.id)}
                          className={`px-3 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                            active
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-ink-100 hover:border-ink-200 text-ink-500'
                          }`}
                        >
                          <Sun className="w-4 h-4 mx-auto mb-0.5" />
                          {orient.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Insulation */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-ink-800 mb-3">
                    Nivel de aislamiento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {INSULATION_LEVELS.map((insul) => {
                      const active = insulation === insul.id;
                      return (
                        <button
                          key={insul.id}
                          onClick={() => setInsulation(insul.id)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            active
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-ink-100 hover:border-ink-200'
                          }`}
                        >
                          <span className={`block text-sm font-semibold ${active ? 'text-primary-700' : 'text-ink-600'}`}>
                            {insul.label}
                          </span>
                          <span className="block text-xs text-ink-400 mt-0.5">{insul.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* People & Windows */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center justify-between text-sm font-semibold text-ink-800 mb-2">
                      Personas
                      <span className="text-primary-600 font-bold text-base">{people}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={people}
                      onChange={(e) => setPeople(Number(e.target.value))}
                      className="w-full accent-primary-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-sm font-semibold text-ink-800 mb-2">
                      Ventanas
                      <span className="text-primary-600 font-bold text-base">{windows}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={windows}
                      onChange={(e) => setWindows(Number(e.target.value))}
                      className="w-full accent-primary-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 lg:p-8 text-white shadow-xl shadow-primary-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Snowflake className="w-5 h-5" />
                    <span className="text-sm font-semibold text-white/80">Frigorías necesarias</span>
                  </div>
                  <div className="font-display text-4xl lg:text-5xl font-bold mb-1">
                    {result.recommendedFrigorias}
                  </div>
                  <div className="text-sm text-white/70 mb-5">fg/h recomendadas</div>

                  <div className="space-y-3 border-t border-white/20 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/80">Frigorías exactas</span>
                      <span className="text-sm font-bold">{result.frigorias} fg/h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/80">Potencia térmica</span>
                      <span className="text-sm font-bold">{result.recommendedKw} kW</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/80">Equivalente en BTU</span>
                      <span className="text-sm font-bold">{result.btu} BTU/h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/80">Volumen del espacio</span>
                      <span className="text-sm font-bold">{result.volume} m³</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink-900 text-sm mb-1">Equipo recomendado</h3>
                      <p className="text-sm text-ink-600">{result.equipmentType}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Este cálculo es orientativo. Para un dimensionado exacto recomendamos una
                      visita técnica gratuita. Factores como cargas térmicas, sombras, equipos
                      electrónicos y materiales pueden variar el resultado.
                    </p>
                  </div>
                </div>

                <a
                  href="/#contacto"
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:-translate-y-0.5"
                >
                  Solicitar presupuesto gratuito
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Info section */}
            <div className="mt-12 lg:mt-16 max-w-3xl mx-auto">
              <h2 className="font-display text-2xl font-bold text-ink-900 mb-4 text-center">
                ¿Cómo se calculan las frigorías?
              </h2>
              <div className="space-y-4 text-ink-600 leading-relaxed">
                <p>
                  Las frigorías son la unidad que mide la capacidad de refrigeración de un equipo
                  de aire acondicionado. Una frigoría equivale aproximadamente a 1,163 vatios (W)
                  de potencia térmica, o 3,968 BTU/h.
                </p>
                <p>
                  El cálculo se basa en la superficie del espacio, el tipo de uso (vivienda,
                  oficina, comercio o nave industrial), la orientación del edificio, el nivel de
                  aislamiento, el número de personas y las ventanas. Cada factor añade o reduce
                  la carga térmica que el equipo debe compensar.
                </p>
                <p>
                  Como regla general, para una vivienda con aislamiento normal se necesitan
                  aproximadamente <strong className="text-ink-800">130 frigorías por metro
                  cuadrado</strong>. Sin embargo, un espacio con mala orientación, poco
                  aislamiento o mucha carga de personas y ventanas necesitará más potencia.
                </p>
                <p>
                  Si el resultado del cálculo está entre dos equipos estándar, siempre
                  recomendamos elegir el de mayor potencia. Un equipo ligeramente sobredimensionado
                  enfría más rápido y consume menos, ya que no tiene que trabajar al máximo.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FloatingPhoneButton />
    </div>
  );
}
