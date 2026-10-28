import { useState, useRef, useEffect, type FormEvent } from 'react';
import {
  Sparkles, X, Send, Bot, User, AlertCircle,
  Phone, MessageCircle, Mail,
} from 'lucide-react';
import {
  COMPANY_INFO, PRICES, CITIES_COVERED, BRANDS_INFO, INSTALLATION_GUIDE,
  SERVICES_DETAIL, AYUDAS_INFO, BLOG_KNOWLEDGE, CAREERS_INFO,
  HVAC_TECHNICAL_KNOWLEDGE,
} from '@/data/chatKnowledge';
import { navigate } from '@/lib/navigate';
import { supabase } from '@/lib/supabase';
import { findTechnicalKnowledge } from '@/data/chatDocumentKnowledge';

type Message = {
  id: string;
  role: 'ai' | 'user';
  text: string;
  options?: { label: string; value: string }[];
};

const INITIAL_MESSAGE: Message = {
  id: 'init',
  role: 'ai',
  text: '¡Hola! Bienvenido a Climatizaciones Montaño. Te atiende nuestro asistente virtual.\n\nAntes de nada quiero ser sincero contigo: soy una inteligencia artificial, no una persona. Pero tranquilo, que conozco nuestra empresa al dedillo y puedo ayudarte con casi cualquier duda. Si en algún momento prefieres hablar con alguien del equipo, te pongo en contacto enseguida.\n\n¿Qué necesitas?',
  options: [
    { label: 'Quiero instalar aire acondicionado', value: 'instalacion' },
    { label: 'Necesito mantenimiento', value: 'mantenimiento' },
    { label: 'Mi aire se ha estropeado', value: 'reparacion' },
    { label: 'Me interesa la aerotermia', value: 'aerotermia' },
    { label: 'Tengo un código de error', value: 'codigo-error' },
    { label: 'Prefiero hablar con una persona', value: 'humano' },
  ],
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const FALLBACK_RESPONSE = 'Mira, no estoy seguro de haber entendido bien lo que me dices. Todavía estoy aprendiendo y a veces me lío. Pero puedo ayudarte con casi todo lo relacionado con climatización:\n\n• Instalar aire acondicionado (splits, conductos, cassettes)\n• Mantenimiento y limpieza de filtros\n• Reparaciones urgentes (todas las marcas)\n• Códigos de error de aire acondicionado (por marca)\n• Aerotermia y calefacción\n• Ventilación y extracción\n• Energía solar térmica\n• Eficiencia energética y auditorías\n• Airzone y climatización inteligente\n• Precios y presupuestos gratis\n• Calculo de potencia por metros cuadrados\n• Ayudas y subvenciones\n• Información sobre marcas (Daikin, Mitsubishi, Samsung, LG...)\n• Diagnóstico técnico: capacitor, presostato, placa inverter, golpe de líquido, vacío de línea, subenfriamiento, recalentamiento, VRF/VRV, SEER2\n• Trabajar con nosotros (enviar CV)\n• O ponerte con alguien del equipo\n\n¿Qué te interesa más?';

async function logUnansweredQuery(input: string, response: string) {
  const normalized = normalize(input);
  if (!normalized || normalized.length < 2) return;
  try {
    const { data: existing } = await supabase
      .from('chatbot_unanswered_queries')
      .select('id, times_asked')
      .eq('normalized_query', normalized)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('chatbot_unanswered_queries')
        .update({
          times_asked: (existing.times_asked || 1) + 1,
          last_asked_at: new Date().toISOString(),
          response_given: response,
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('chatbot_unanswered_queries')
        .insert({
          query: input,
          normalized_query: normalized,
          response_given: response,
        });
    }
  } catch {
    // Silently ignore – logging should never break the chat
  }
}

type ErrorCodeMatch = {
  brand: string;
  code: string;
  category: string;
  meaning: string;
  level: string;
};

const ERROR_CODE_BRANDS = [
  'mitsubishi heavy industries', 'mitsubishi electric', 'daikin', 'samsung', 'fujitsu general',
  'panasonic', 'haier', 'hitachi', 'toshiba', 'carrier', 'midea', 'hisense',
  'gree', 'lg', 'mitsubishi', 'fujitsu', 'johnson', 'bosch',
];

function formatBrandLabel(value: string): string {
  return value.split(' ').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

async function searchErrorCodes(input: string): Promise<ErrorCodeMatch[]> {
  const q = normalize(input);
  let brand: string | null = null;
  for (const b of ERROR_CODE_BRANDS) {
    if (q.includes(b)) {
      brand = formatBrandLabel(b);
      break;
    }
  }

  const codeMatch = q.match(/(?:codigo|code|error)\s*[:-]?\s*([a-z]{0,3}\d{1,4}[a-z]{0,3})/i)
    || q.match(/\b([a-z]{1,3}\d{1,4}[a-z]{0,3})\b/i);
  let code = '';
  if (codeMatch) {
    code = codeMatch[1].toUpperCase();
  }

  let query = supabase
    .from('hvac_error_codes')
    .select('brand, code, category, meaning, level')
    .eq('is_active', true);

  if (brand && code) {
    query = query.ilike('brand', `%${brand}%`).ilike('code', `%${code}%`);
  } else if (code) {
    query = query.ilike('code', `%${code}%`);
  } else if (brand) {
    query = query.ilike('brand', `%${brand}%`).limit(5);
  } else {
    return [];
  }

  const { data, error } = await query.limit(8);
  if (error || !data || data.length === 0) return [];
  return data as ErrorCodeMatch[];
}

function formatErrorCodeResponse(matches: ErrorCodeMatch[]): string {
  if (matches.length === 0) return '';

  if (matches.length === 1) {
    const m = matches[0];
    return `He encontrado ese código en nuestra base de datos:\n\n• Marca: ${m.brand}\n• Código: ${m.code}\n• Categoría: ${m.category}\n• Significado: ${m.meaning}\n• Nivel: ${m.level === 'Técnico' ? 'Requiere técnico especializado' : 'Puedes revisarlo tú mismo'}`;
  }

  const lines = matches.map((m) => `• ${m.brand} — ${m.code}: ${m.category}`);
  return `He encontrado varios códigos que coinciden con tu consulta:\n\n${lines.join('\n')}\n\n¿De qué marca es tu equipo? Si me dices la marca y el código exacto, te doy el significado preciso.`;
}

function isErrorCodeQuery(input: string): boolean {
  const q = normalize(input);
  return q.includes('codigo') || q.includes('code') || q.includes('error')
    || q.includes('averia') || q.includes('falla') || q.includes('luz parpade')
    || q.includes('led') || q.includes('display') || q.includes('pantalla')
    || ERROR_CODE_BRANDS.some((b) => q.includes(b) && /\b[a-z]?\d/.test(q));
}

async function generateResponseAsync(input: string): Promise<Message | null> {
  if (isErrorCodeQuery(input)) {
    const matches = await searchErrorCodes(input);
    if (matches.length > 0) {
      const text = formatErrorCodeResponse(matches);
      return {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text,
        options: [
          { label: 'Ver página de códigos', value: 'codigos-link' },
          { label: 'Necesito un técnico', value: 'humano' },
          { label: 'Volver al inicio', value: 'inicio' },
        ],
      };
    }
    if (matches.length === 0 && (normalize(input).includes('codigo') || normalize(input).includes('error'))) {
      const documentKnowledge = findTechnicalKnowledge(input);
      if (documentKnowledge) {
        return {
          id: `ai-${Date.now()}`,
          role: 'ai',
          text: `Según la guía «${documentKnowledge.title}»:\n\n${documentKnowledge.excerpt}\n\nEl mismo código puede variar según la serie y el modelo. Si vuelve a aparecer después de apagar el equipo cinco minutos, solicita una revisión técnica.`,
          options: [
            { label: 'Ver página de códigos', value: 'codigos-link' },
            { label: 'Hablar con un técnico', value: 'humano' },
            { label: 'Volver al inicio', value: 'inicio' },
          ],
        };
      }
      return {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: 'He buscado ese código en nuestra base de datos pero no lo encuentro. Puede que el código sea de un modelo concreto o que esté escrito de forma distinta.\n\nTe recomiendo visitar nuestra página de códigos de error, donde podrás buscar por marca y categoría. Si quieres, te pongo en contacto con un técnico que te puede ayudar.',
        options: [
          { label: 'Ver página de códigos', value: 'codigos-link' },
          { label: 'Hablar con un técnico', value: 'humano' },
          { label: 'Volver al inicio', value: 'inicio' },
        ],
      };
    }
  }

  const technicalKnowledge = findTechnicalKnowledge(input);
  if (technicalKnowledge) {
    return {
      id: `ai-${Date.now()}`,
      role: 'ai',
      text: `Según el documento técnico «${technicalKnowledge.title}»:\n\n${technicalKnowledge.excerpt}\n\nEsta información es orientativa y debe verificarse con un técnico competente antes de diseñar, calcular o ejecutar una instalación.`,
      options: [
        { label: 'Quiero hablar con un técnico', value: 'humano' },
        { label: 'Hacer otra consulta técnica', value: 'tecnico' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  return null;
}

function generateResponse(input: string): Message {
  const q = normalize(input);
  const id = `ai-${Date.now()}`;

  const has = (...words: string[]) => words.some((w) => q.includes(normalize(w)));

  if (has('hola', 'buenas', 'buenos dias', 'buenas tardes', 'hey', 'saludos', 'que tal', 'qtal')) {
    return {
      id,
      role: 'ai',
      text: '¡Hola de nuevo! Cuéntame, ¿en qué te puedo ayudar? Si me dices más o menos lo que necesitas, te oriento encantado.',
      options: [
        { label: 'Instalar aire acondicionado', value: 'instalacion' },
        { label: 'Reparar mi aire', value: 'reparacion' },
        { label: 'Mantenimiento', value: 'mantenimiento' },
        { label: 'Aerotermia', value: 'aerotermia' },
      ],
    };
  }

  if (has('vivienda completa', 'casa completa', 'casa entera', 'toda la casa', 'toda la vivienda', 'todas las habitaciones', 'varias habitaciones', 'climatizar una vivienda', 'climatizar mi casa')) {
    const guide = INSTALLATION_GUIDE.wholeHome;
    return {
      id,
      role: 'ai',
      text: `Para una ${guide.title.toLowerCase()}, normalmente te recomendamos una instalación por conductos. ${guide.response}\n\n${guide.brands}\n\n${guide.note}\n\nPara acertar con la potencia y saber si hay espacio para los conductos, necesitamos valorar la vivienda y sus estancias. La visita es gratis y sin compromiso.`,
      options: [
        { label: 'Quiero estudiar mi vivienda', value: 'humano' },
        { label: '¿Cuánto cuesta?', value: 'precio' },
        { label: '¿Qué marca me recomendáis?', value: 'marcas' },
      ],
    };
  }

  if (has('oficina', 'local comercial', 'local', 'tienda', 'restaurante', 'negocio', 'varias salas')) {
    const guide = INSTALLATION_GUIDE.business;
    return {
      id,
      role: 'ai',
      text: `${guide.response}\n\n${guide.brands}\n\nTe aconsejamos después de conocer los metros, la altura, el horario de uso y cómo están repartidas las zonas. Así no se instala más potencia de la necesaria y cada espacio funciona de forma cómoda.`,
      options: [
        { label: 'Quiero un presupuesto', value: 'humano' },
        { label: '¿Qué sistema me conviene?', value: 'instalacion' },
        { label: '¿Cuánto cuesta?', value: 'precio' },
      ],
    };
  }

  if (has('una habitacion', 'un dormitorio', 'un salon', 'una estancia', 'una sola habitacion', 'una sola estancia', 'habitacion independiente', 'salon independiente', 'para una habitacion', 'para un salon', 'para un dormitorio')) {
    const guide = INSTALLATION_GUIDE.singleRoom;
    return {
      id,
      role: 'ai',
      text: `${guide.response}\n\nPara recomendarte la potencia correcta necesito saber los metros cuadrados de la estancia. Por nuestra zona calculamos con 140 frigorías por metro cuadrado, así que si me dices los metros te calculo las frigorías y el equipo que te conviene.\n\nPor ejemplo, puedes decirme algo como "tengo un salón de 25 m²" o "la habitación son 15 metros".`,
      options: [
        { label: 'Calcular la potencia', value: 'potencia' },
        { label: '¿Cuánto cuesta?', value: 'precio' },
        { label: 'Quiero un presupuesto', value: 'humano' },
      ],
    };
  }

  if (has('precio', 'presupuesto', 'cuanto', 'cuesta', 'vale', 'tarifa', 'coste', 'caro', 'barato', 'calidad precio', 'calidad-precio', 'presupuesto ajustado')) {
    return {
      id,
      role: 'ai',
      text: `Te entiendo, el precio es lo primero que uno quiere saber. Estos precios son orientativos, ya que cada instalación es distinta. Te doy una horquilla para que te hagas una idea:\n\n• Split de pared (un equipo): ${PRICES.split}\n• Sistema por conductos: ${PRICES.conductos}\n• Aerotermia (calefacción + agua caliente): ${PRICES.aerotermia}\n• Mantenimiento anual: ${PRICES.mantenimiento}\n\nSi solo necesitas la instalación básica (sin incluir el equipo):\n\n• Instalación básica de split: ${PRICES.instalacionSplit}\n• Instalación de equipo de conductos: ${PRICES.instalacionConductos}\n• Instalación de cassette de techo: ${PRICES.instalacionCassette}\n• Instalación de equipo suelo/techo: ${PRICES.instalacionSueloTecho}\n\nEstos precios son solo una orientación. Lo mejor es consultar con el equipo técnico de Climatizaciones Montaño, que te preparará un presupuesto cerrado y sin sorpresas, adaptado a tu caso concreto. Todo queda detallado antes de empezar, sin costes ocultos. Te respondemos en menos de 24 horas.`,
      options: [
        { label: 'Vale, quiero un presupuesto', value: 'humano' },
        { label: 'Mejor por WhatsApp', value: 'whatsapp' },
        { label: 'Prefiero que me llaméis', value: 'humano' },
      ],
    };
  }

  if (has('visita gratis', 'visita gratuita', 'es gratis la visita', 'visita sin compromiso', 'cobrais por la visita', 'cuesta la visita', 'visita tecnica', 'visita es gratis', 'gratis la visita', 'teneis que cobrar', 'cobrais por venir', 'viene sin coste', 'estudio gratis', 'estudio gratuito', 'estudio sin compromiso')) {
    return {
      id,
      role: 'ai',
      text: `Sí, la visita técnica es totalmente gratis y sin compromiso. Vamos a tu vivienda o local, valoramos el espacio y te decimos honestamente qué te conviene, sin coste alguno.\n\nSi después quieres seguir adelante, te preparamos un presupuesto claro. Y si no, no pasa nada, no te cobramos nada.\n\n${COMPANY_INFO.budget}.`,
      options: [
        { label: 'Quiero que vengáis', value: 'humano' },
        { label: '¿Cuánto cuesta instalar?', value: 'precio' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('finde', 'fin de semana', 'sabado', 'domingo', 'urgente', 'urgencia', 'emergencia', 'fuera de horario', 'trabajais los sabados', 'trabajais los domingos', 'abierto los findes', 'atendis urgencias')) {
    return {
      id,
      role: 'ai',
      text: `Nuestro horario habitual es de lunes a viernes, de 8:00 a 14:00 y de 15:00 a 18:00. Pero para reparaciones urgentes también atendemos fines de semana, porque sabemos que un aire que falla un sábado en pleno verano no puede esperar.\n\nSi tienes una urgencia, llama al ${COMPANY_INFO.phone} y te atendemos enseguida.`,
      options: [
        { label: 'Llamar ahora', value: 'humano' },
        { label: 'Mejor por WhatsApp', value: 'whatsapp' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('que zonas', 'que ciudades', 'que pueblos', 'donde trabajais', 'que area', 'cobertura', 'que provincia', ' Sevilla', 'en sevilla', 'en mi ciudad', 'en mi pueblo', 'cerca de', 'llegais a', 'vais a')) {
    const cityMatch = CITIES_COVERED.find((c) => q.includes(normalize(c)));
    if (cityMatch) {
      return {
        id,
        role: 'ai',
        text: `Sí, damos servicio en ${cityMatch}. Cubrimos la capital y toda la provincia, así que no te preocupes si estás en otro pueblo, que también vamos.\n\nEstamos en ${COMPANY_INFO.address}.`,
        options: [
          { label: 'Llamar', value: 'humano' },
          { label: 'WhatsApp', value: 'whatsapp' },
          { label: 'Volver al inicio', value: 'inicio' },
        ],
      };
    }
    return {
      id,
      role: 'ai',
      text: `Cubrimos la capital y toda la provincia. Algunos de los municipios donde trabajamos habitualmente: ${CITIES_COVERED.slice(0, 6).join(', ')}... y más.\n\nSi estás en otro pueblo de la provincia, dímelo y te confirmo si llegamos sin problema.`,
      options: [
        { label: 'Llamar', value: 'humano' },
        { label: 'WhatsApp', value: 'whatsapp' },
      ],
    };
  }

  if (has('instalacion', 'instalar', 'nuevo', 'poner', 'colocar', 'split', 'conducto', 'cassette', 'aire nuevo', 'suelo techo', 'climaver', 'chapa')) {
    const d = SERVICES_DETAIL.instalacion;
    return {
      id,
      role: 'ai',
      text: `¡Genial! Instalar aire acondicionado es lo nuestro. Llevamos más de 20 años y más de 5.000 instalaciones hechas en toda la provincia.\n\nTrabajamos con todas las marcas buenas: Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense y Hitachi. Todos los equipos que instalamos ya vienen con gas R32 (más ecológico) y tecnología inverter de alta eficiencia.\n\nDependiendo de lo que necesites, te recomendaríamos una cosa u otra:\n\n${d.features.map((f) => `• ${f}`).join('\n')}\n\n${d.extra}\n\nTodas nuestras instalaciones llevan 3 años de garantía. Las piezas y reparaciones tienen 6 meses de garantía. Lo suyo es que vayamos a ver el espacio sin coste y te digamos honestamente qué te conviene. ¿Te parece bien que te preparemos una visita?`,
      options: [
        { label: 'Sí, quiero que vengáis', value: 'humano' },
        { label: '¿Qué marca me recomendáis?', value: 'marcas' },
        { label: '¿Qué potencia necesito?', value: 'potencia' },
        { label: '¿Cuánto cuesta?', value: 'precio' },
      ],
    };
  }

  if (has('mantenimiento', 'limpiar', 'limpieza', 'filtro', 'revisar', 'revision', 'mantenim', 'rite', 'obligatorio')) {
    const d = SERVICES_DETAIL.mantenimiento;
    return {
      id,
      role: 'ai',
      text: `¡Muy bien pensado! El mantenimiento es lo que hace que tu equipo dure años sin darte problemas. Esto es lo que incluimos:\n\n${d.features.map((f) => `• ${f}`).join('\n')}\n\n${d.extra}\n\nTenemos contratos anuales para hogares, empresas y comunidades que te dan prioridad en reparaciones y descuentos en recambios. ¿Te interesa?`,
      options: [
        { label: 'Sí, quiero contratarlo', value: 'humano' },
        { label: '¿Cuánto cuesta?', value: 'precio' },
        { label: 'Cómo limpiar los filtros yo mismo', value: 'limpiar-filtros' },
      ],
    };
  }

  if (has('limpiar filtros', 'limpiar filtro', 'como limpiar', 'filtro yo', 'limpiar yo')) {
    return {
      id,
      role: 'ai',
      text: BLOG_KNOWLEDGE.filtros,
      options: [
        { label: 'Quiero mantenimiento profesional', value: 'mantenimiento' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('reparacion', 'reparar', 'averia', 'roto', 'no funciona', 'no enfria', 'calienta', 'gotea', 'ruido', 'urgent', 'emergencia', 'estropeado', 'estropeada', 'falla', 'fallado', 'no calienta', 'no da calor')) {
    const d = SERVICES_DETAIL.reparacion;
    return {
      id,
      role: 'ai',
      text: `Uy, lo siento. Un aire que falla en pleno verano o en pleno invierno es una pesadilla, lo sé bien.\n\nLo bueno es que nuestro técnico va lo antes posible, incluso fines de semana. ${d.extra}\n\n${d.features.map((f) => `• ${f}`).join('\n')}\n\nSi el equipo tiene más de 10-12 años y la avería es grave, te aconsejamos honestamente si compensa reparar o cambiar.\n\nSi es urgente, te recomiendo que llames ahora mismo al ${COMPANY_INFO.phone}. Te atienden enseguida.`,
      options: [
        { label: 'Llamar ahora', value: 'humano' },
        { label: 'Mejor por WhatsApp', value: 'whatsapp' },
      ],
    };
  }

  if (has('aerotermia', 'bomba de calor', 'caldera', 'gas', 'calefaccion', 'agua caliente', 'suelo radiante', 'gasoil', 'sustituir caldera', 'fan coil', 'fancoil')) {
    const d = SERVICES_DETAIL.aerotermia;
    return {
      id,
      role: 'ai',
      text: `¡Ah, la aerotermia! Es justo lo que mucha gente está poniendo ahora para sustituir la caldera de gas. Y con razón.\n\n${d.features.map((f) => `• ${f}`).join('\n')}\n\n${d.extra}\n\nTrabajamos con Daikin, Mitsubishi, Samsung, Panasonic y LG. Y hay ayudas y bonificaciones que te pueden bajar bastante el precio. ¿Quieres que te hagamos un estudio personalizado sin coste?`,
      options: [
        { label: 'Sí, quiero un estudio', value: 'humano' },
        { label: '¿Qué ayudas hay?', value: 'ayudas' },
        { label: '¿Cuánto cuesta?', value: 'precio' },
        { label: '¿Necesito suelo radiante?', value: 'suelo-radiante' },
      ],
    };
  }

  if (has('suelo radiante', 'necesito suelo', 'suelo obligatorio')) {
    return {
      id,
      role: 'ai',
      text: BLOG_KNOWLEDGE['suelo radiante'],
      options: [
        { label: 'Quiero un estudio de aerotermia', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('ayuda', 'subvencion', 'bonificacion', 'deduccion', 'ibi', 'irpf', 'junta', 'andalucia', 'anducia', 'icio')) {
    return {
      id,
      role: 'ai',
      text: `Pues sí, hay ayudas y son bastante interesantes, la verdad:\n\n${AYUDAS_INFO.map((a) => `• ${a}`).join('\n')}\n\nPara acceder necesitas que la instalación la haga una empresa certificada (que lo somos, RITE-07) y que el equipo esté en los listados de equipos elegibles. Te ayudamos con toda la documentación.\n\nLo que pasa es que van cambiando y cada caso es distinto. Lo mejor es que nos llames y te contamos qué hay disponible ahora mismo. ¿Te interesa?`,
      options: [
        { label: 'Sí, quiero más información', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('marca', 'daikin', 'mitsubishi', 'samsung', 'lg', 'panasonic', 'fujitsu', 'hisense', 'hitachi', 'mejor', 'recomend', 'que marca', 'comparativa')) {
    const brandKey = ['daikin', 'mitsubishi', 'samsung', 'lg', 'panasonic', 'fujitsu', 'hisense', 'hitachi', 'johnson']
      .find((b) => q.includes(b));
    if (brandKey && BRANDS_INFO[brandKey]) {
      const b = BRANDS_INFO[brandKey];
      return {
        id,
        role: 'ai',
        text: `${brandKey.charAt(0).toUpperCase() + brandKey.slice(1)}: ${b.positioning}\n\nPuntos fuertes: ${b.strengths}\n\nSomos instaladores autorizados con garantía oficial del fabricante. ¿Quieres que te asesoremos sobre si es la marca adecuada para tu caso?`,
        options: [
          { label: 'Sí, asesoradme', value: 'humano' },
          { label: 'Comparar todas las marcas', value: 'marcas' },
          { label: '¿Cuánto cuesta instalar?', value: 'precio' },
        ],
      };
    }
    return {
      id,
      role: 'ai',
      text: 'Buena pregunta. Todas las marcas que instalamos son buenas, pero cada una tiene sus puntos fuertes:\n\n• Daikin: la gama premium, máxima calidad y fiabilidad. Gama Perfera y Comfora de las más vendidas\n• Mitsubishi: los más silenciosos del mercado (desde 19 dB, casi no se oyen). Gama MSZ-LN ideal para dormitorios\n• Samsung: gama WindFree con refrigeración sin flujo de aire directo y WiFi de serie\n• LG: gama Art Cool con diseño y purificación de aire. Excelente para conductos\n• Panasonic: compresores muy fiables y purificación nanoe-X. Especialistas en aerotermia\n• Fujitsu: marca japonesa robusta, con buena red de servicio técnico\n• Hisense: la mejor relación calidad-precio para presupuestos ajustados\n• Hitachi: calidad japonesa a buen precio, gama Zen con compresor de calidad\n• Johnson: muy buena calidad a precios muy competitivos. Si buscas un equipo bueno y barato, es Johnson\n\nPero te digo una cosa: la marca importa, pero la instalación importa más. Una buena marca mal instalada da problemas. Por eso lo suyo es que veamos el espacio y te recomendemos con honestidad. ¿Te parece?',
      options: [
        { label: 'Sí, asesoradme', value: 'humano' },
        { label: '¿Cuánto cuesta instalar?', value: 'precio' },
        { label: 'Hablar de Daikin', value: 'daikin' },
        { label: 'Hablar de Mitsubishi', value: 'mitsubishi' },
      ],
    };
  }

  // Cálculo de potencia: detecta metros cuadrados en el mensaje y calcula frigorías
  const metrosMatch = q.match(/(\d+)\s*(m2|mtrs?2|metros|metro)/);
  if (has('potencia', 'frigoria', 'metro', 'm2', 'tamaño', 'dimension', 'potencia necesito', 'grande', 'pequeño', 'calculo', 'calcular', 'cuantas frigorias', 'que equipo necesito') || metrosMatch) {
    if (metrosMatch) {
      const metros = parseInt(metrosMatch[1], 10);
      const frigorias = metros * 140;
      const kw = (frigorias / 860).toFixed(2).replace('.', ',');
      let recomendacion: string;
      if (metros <= 20) {
        recomendacion = 'un split de pared pequeño. Perfecto para una habitación o un salón pequeño';
      } else if (metros <= 30) {
        recomendacion = 'un split de pared de gama media. Entre 3.000 y 4.000 frigorías tienes de sobra';
      } else if (metros <= 40) {
        recomendacion = 'un split de pared de gama alta, o dos splits si son habitaciones separadas. Para una sola estancia de este tamaño, el split es la opción más sencilla y económica';
      } else if (metros <= 70) {
        recomendacion = 'valorar un sistema por conductos o dos splits bien dimensionados. Depende de si es todo un espacio abierto o varias habitaciones';
      } else {
        recomendacion = 'un sistema por conductos, que reparte el aire por todas las habitaciones y queda oculto en el falso techo. Para este tamaño es lo más cómodo y lo que mejor funciona';
      }

      return {
        id,
        role: 'ai',
        text: `¡Perfecto! Lo calculo en un momento.\n\nPara ${metros} m², calculando 140 frigorías por metro cuadrado (que es lo que usamos por el calor que hace en verano):\n\n• Frigorías necesarias: ${frigorias.toLocaleString('es-ES')}\n• Equivalente en potencia: ${kw} kW\n• Equipo recomendado: ${recomendacion}\n\nOjo, que esto es una orientación. También influyen los ventanales (si miran al sur u oeste, necesita más potencia), la altura del techo (si pasa de 2,5 m), si es planta alta con techo al sol y la calidad del aislamiento.\n\n¿Quieres que vayamos a ver el espacio y te confirmemos el cálculo? La visita es gratis y sin compromiso.`,
        options: [
          { label: 'Sí, quiero la visita gratis', value: 'humano' },
          { label: 'Calcular otra estancia', value: 'potencia' },
          { label: '¿Cuánto cuesta instalar?', value: 'precio' },
          { label: 'Volver al inicio', value: 'inicio' },
        ],
      };
    }

    return {
      id,
      role: 'ai',
      text: 'Claro, te ayudo con eso. Para habitaciones o salones independientes lo habitual es instalar un split de pared, y para calcular la potencia necesito saber los metros cuadrados de la estancia.\n\nUsamos la fórmula de 140 frigorías por metro cuadrado, porque los veranos son bastante duros. Dime cuántos metros tiene y te calculo las frigorías y el equipo que te conviene.\n\nPor ejemplo, puedes decirme algo como "tengo un salón de 25 m²" o "la habitación son 15 metros".',
      options: [
        { label: 'Tengo 20 m²', value: 'potencia-20' },
        { label: 'Tengo 30 m²', value: 'potencia-30' },
        { label: 'Tengo 40 m²', value: 'potencia-40' },
        { label: 'Tengo 50 m²', value: 'potencia-50' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('ventilacion', 'vmc', 'garaje', 'cocina', 'extraccion', 'humo', 'humedad', 'aire limpio', 'co2', 'cte')) {
    const d = SERVICES_DETAIL.ventilacion;
    return {
      id,
      role: 'ai',
      text: `Sí, también hacemos ventilación y extracción. ${d.features.map((f) => `• ${f}`).join('\n')}\n\n${d.extra}\n\nSi tienes problemas de humedad o necesitas renovar el aire de un espacio, dímelo y te cuento las opciones. ¿Quieres que te contacten?`,
      options: [
        { label: 'Sí, contactadme', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('airzone', 'zona', 'zonas', 'inteligente', 'movil', 'app', 'wifi', 'domotica', 'termostato', 'programar')) {
    const d = SERVICES_DETAIL.airzone;
    return {
      id,
      role: 'ai',
      text: `¡Airzone es genial! Imagínate: cada habitación con su temperatura, y todo desde el móvil. El salón a 22 °C, los dormitorios a 19 °C, el despacho a 24 °C... tú decides.\n\n${d.features.map((f) => `• ${f}`).join('\n')}\n\n${d.extra}\n\n¿Te interesa que te lo instalemos?`,
      options: [
        { label: 'Sí, quiero Airzone', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('solar', 'energia solar', 'acs', 'panel solar', 'placa', 'termica', 'agua caliente solar')) {
    const d = SERVICES_DETAIL['solar-termica'];
    return {
      id,
      role: 'ai',
      text: `Sí, instalamos energía solar térmica para agua caliente sanitaria. ${d.features.map((f) => `• ${f}`).join('\n')}\n\n${d.extra}\n\n¿Quieres que te hagamos un estudio?`,
      options: [
        { label: 'Sí, contactadme', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('eficiencia', 'auditoria', 'certificacion', 'ahorro', 'factura', 'consumo', 'inverter', 'gasta mucho', 'caro la luz', 'certificado energetico')) {
    const d = SERVICES_DETAIL.eficiencia;
    return {
      id,
      role: 'ai',
      text: `Si tu factura de la luz te parece alta, podemos ayudarte. ${d.features.map((f) => `• ${f}`).join('\n')}\n\n${d.extra}\n\n¿Te interesa que veamos tu caso?`,
      options: [
        { label: 'Sí, quiero una auditoría', value: 'humano' },
        { label: '¿Cuánto ahorra un inverter?', value: 'inverter' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('inverter', 'que es inverter', 'ahorra inverter', 'cuanto ahorra inverter', 'tecnologia inverter')) {
    return {
      id,
      role: 'ai',
      text: BLOG_KNOWLEDGE.inverter,
      options: [
        { label: 'Quiero una auditoría energética', value: 'eficiencia' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('r32', 'r410a', 'gas refrigerante', 'refrigerante', 'normativa gas', 'f-gas', 'prohibido gas')) {
    return {
      id,
      role: 'ai',
      text: BLOG_KNOWLEDGE['gas r32'],
      options: [
        { label: 'Quiero instalar un equipo nuevo', value: 'instalacion' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('ruido', 'decibelio', 'db', 'vecino', 'comunidad', 'ordenanza ruido', 'queja ruido')) {
    return {
      id,
      role: 'ai',
      text: BLOG_KNOWLEDGE.ruido,
      options: [
        { label: 'Quiero un equipo silencioso', value: 'instalacion' },
        { label: 'Tengo un problema de ruido', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('bomba de calor', 'frio calor', 'calor y frio', 'invierno y verano', 'split calor')) {
    return {
      id,
      role: 'ai',
      text: BLOG_KNOWLEDGE['bomba de calor'],
      options: [
        { label: 'Quiero instalar un equipo', value: 'instalacion' },
        { label: 'Hablar de aerotermia', value: 'aerotermia' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('mejor epoca', 'cuando instalar', 'que epoca', 'antes del verano', 'instalar en invierno', 'instalar en primavera')) {
    return {
      id,
      role: 'ai',
      text: BLOG_KNOWLEDGE['mejor epoca'],
      options: [
        { label: 'Quiero un presupuesto', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('sin unidad exterior', 'sin exterior', 'no puedo exterior', 'edificio protegido', 'centro historico', 'sin terraza', 'portatil', 'water cooled')) {
    return {
      id,
      role: 'ai',
      text: BLOG_KNOWLEDGE['sin unidad exterior'],
      options: [
        { label: 'Quiero una visita técnica', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('constructora', 'constructor', 'obra nueva', 'promotor', 'promotora', 'preinstalacion', 'rehabilitacion', 'proyecto', 'llave en mano')) {
    const d = SERVICES_DETAIL.constructoras;
    return {
      id,
      role: 'ai',
      text: `Trabajamos mucho con constructoras y promotoras. ${d.features.map((f) => `• ${f}`).join('\n')}\n\n${d.extra}\n\n¿Tienes un proyecto entre manos?`,
      options: [
        { label: 'Sí, tengo un proyecto', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('empleo', 'trabajo', 'trabajar', 'cv', 'curriculum', 'oferta', 'contratar', 'personal', 'equipo', 'carrera')) {
    return {
      id,
      role: 'ai',
      text: `¿Buscas trabajo? Estamos siempre abiertos a incorporar gente buena al equipo. Buscamos técnicos en climatización, aerotermia, ventilación, ayudantes, comerciales y administrativos.\n\nLo que ofrecemos:\n${CAREERS_INFO.perks.map((p) => `• ${p}`).join('\n')}\n\nEl proceso es sencillo: ${CAREERS_INFO.process}\n\nPuedes enviar tu CV desde la página de empleo de nuestra web. ¿Te interesa?`,
      options: [
        { label: 'Sí, quiero enviar mi CV', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('horario', 'hora', 'abierto', 'cerrado', 'trabajais', 'finde', 'fin de semana', 'sabado', 'domingo', 'cuando')) {
    return {
      id,
      role: 'ai',
      text: `Pues estamos de lunes a viernes, de 8:00 a 14:00 y de 15:00 a 18:00. Pero ojo, que para reparaciones urgentes también atendemos fines de semana. Si te has quedado sin aire un sábado, no te preocupes, llámanos.\n\nEstamos en Alcalá de Guadaíra, Sevilla.`,
      options: [
        { label: 'Llamar ahora', value: 'humano' },
        { label: 'Mejor por WhatsApp', value: 'whatsapp' },
      ],
    };
  }

  if (has('donde', 'direccion', 'ubicacion', 'estais', 'local', 'tienda', 'cobertura', 'zona', 'ciudad', 'pueblo')) {
    const cityMatch = CITIES_COVERED.find((c) => q.includes(normalize(c)));
    if (cityMatch) {
      return {
        id,
        role: 'ai',
        text: `Sí, damos servicio en ${cityMatch}. Cubrimos la capital y toda la provincia, así que no te preocupes si estás en otro pueblo, que también vamos.\n\nEstamos en ${COMPANY_INFO.address}.`,
        options: [
          { label: 'Llamar', value: 'humano' },
          { label: 'WhatsApp', value: 'whatsapp' },
          { label: 'Volver al inicio', value: 'inicio' },
        ],
      };
    }
    return {
      id,
      role: 'ai',
      text: `Estamos en ${COMPANY_INFO.address}. Cubrimos Sevilla capital y toda la provincia (${CITIES_COVERED.slice(0, 6).join(', ')}... y más), así que no te preocupes si estás en otro pueblo, que también vamos.`,
      options: [
        { label: 'Llamar', value: 'humano' },
        { label: 'WhatsApp', value: 'whatsapp' },
      ],
    };
  }

  if (has('whatsapp', 'wasap', 'wassap')) {
    return {
      id,
      role: 'ai',
      text: `Claro, puedes escribirnos por WhatsApp al ${COMPANY_INFO.whatsapp}. Pulsa aquí y te abre el chat directamente.`,
      options: [
        { label: 'Abrir WhatsApp', value: 'whatsapp-link' },
      ],
    };
  }

  if (has('email', 'correo', 'mail', 'escribir', 'mandar mensaje')) {
    return {
      id,
      role: 'ai',
      text: `Sin problema. Puedes escribirnos a ${COMPANY_INFO.email} y te respondemos en menos de 24 horas. Pulsa aquí y te abre el correo.`,
      options: [
        { label: 'Abrir email', value: 'email-link' },
      ],
    };
  }

  if (has('humano', 'persona', 'tecnico', 'llamar', 'telefono', 'contacto', 'contactar', 'hablar', 'alguien', 'real')) {
    return {
      id,
      role: 'ai',
      text: `¡Por supuesto! A veces es mejor hablar con alguien que conozca tu caso. Aquí tienes todas las formas de contactarnos:\n\n• Teléfono: ${COMPANY_INFO.phone}\n• WhatsApp: ${COMPANY_INFO.whatsapp}\n• Email: ${COMPANY_INFO.email}\n\nTe respondemos en menos de 24 horas. Y si es urgente, mejor llama por teléfono, que te atendemos enseguida.`,
      options: [
        { label: 'Llamar por teléfono', value: 'tel-link' },
        { label: 'Abrir WhatsApp', value: 'whatsapp-link' },
        { label: 'Enviar email', value: 'email-link' },
      ],
    };
  }

  if (has('garantia', 'garantias', 'garantia de', 'cuanto garantia', 'garantia oficial', 'garantia del fabricante', 'repuestos originales', 'piezas originales', 'instaladores autorizados', 'autorizado', 'certificados', 'certificacion', 'rite', 'sois certificados')) {
    return {
      id,
      role: 'ai',
      text: `Todas nuestras instalaciones llevan ${COMPANY_INFO.warrantyInstall}. Las reparaciones, ${COMPANY_INFO.warrantyRepair}. Si algo falla, lo arreglamos sin coste.\n\nSomos empresa certificada ${COMPANY_INFO.certification}, cumplimos toda la normativa de seguridad y eficiencia. Solo usamos repuestos originales del fabricante y somos instaladores autorizados de todas las marcas que trabajamos (Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense, Hitachi y Johnson), con garantía oficial del fabricante.`,
      options: [
        { label: 'Quiero instalar', value: 'instalacion' },
        { label: 'Necesito reparación', value: 'reparacion' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('unidad exterior no arranca', 'no arranca exterior', 'condensadora no arranca', 'no parte exterior', 'exterior no funciona', 'no enciende exterior', 'ventilador interior funciona pero', 'no parte la unidad exterior')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['unidad exterior no arranca'],
      options: [
        { label: 'Tengo un codigo de error', value: 'codigo-error' },
        { label: 'Necesito un tecnico', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('r32 vs r410a', 'diferencia r32 r410a', 'r-32 vs r-410a', 'r32 o r410a', 'que gas es mejor', 'r32 rinde mas', 'por que r32', 'comparativa gas', 'diferencia entre gases')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['r32 vs r410a'],
      options: [
        { label: 'Quiero instalar un equipo R32', value: 'instalacion' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('capacitor', 'condensador de arranque', 'condensador de marcha', 'capacitador', 'no arranca zumba', 'zumba pero no arranca', 'capacitancia', 'condensador falla')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['capacitor'],
      options: [
        { label: 'Necesito un tecnico', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('presostato', 'protector termico', 'salto presion', 'presion alta', 'presion baja', 'corta por presion', 'presostato de alta', 'presostato de baja')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['presostato'],
      options: [
        { label: 'Necesito un tecnico', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('placa inverter', 'tarjeta de control', 'placa averiada', 'placa falla', 'fallo de placa', 'placa electronica', 'fallo comunicacion placa', 'relays no parten', 'compresor no responde placa')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['placa inverter'],
      options: [
        { label: 'Necesito un tecnico', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('subenfriamiento', 'subcooling', 'subenfriamiento bajo', 'subenfriamiento alto')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['subenfriamiento'],
      options: [
        { label: 'Necesito un tecnico', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('recalentamiento', 'superheat', 'recalentamiento bajo', 'recalentamiento alto', 'golpe de liquido', 'liquido en compresor', 'compresor recibe liquido')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['recalentamiento'],
      options: [
        { label: 'Necesito un tecnico', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('golpe de liquido', 'ruido metalico al arrancar', 'golpeteo compresor', 'compresor golpe', 'liquido incompresible')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['golpe de liquido'],
      options: [
        { label: 'Necesito un tecnico urgente', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('vacio de linea', 'vaciado de linea', 'bomba de vacio', 'vacio instalacion', 'humedad en circuito', 'aire en circuito', 'no se hizo vacio', 'vacio mal hecho')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['vacio de linea'],
      options: [
        { label: 'Quiero una instalacion correcta', value: 'instalacion' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('vrf', 'vrv', 'variable refrigerant', 'sistema vrf', 'sistema vrv', 'recuperacion de calor', 'heat recovery')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['vrf vrv'],
      options: [
        { label: 'Tengo un proyecto comercial', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('manometro vacio', 'manometro en vacio', 'marca vacio pero botella llena', 'tapon en circuito', 'obstruccion circuito', 'filtro obstruido', 'expansion bloqueado', 'capilar bloqueado')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['manometro vacio'],
      options: [
        { label: 'Necesito un tecnico', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('seer2', 'seer 2', 'eficiencia seer', 'ratio eficiencia estacional', 'normativa seer2')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['seer2'],
      options: [
        { label: 'Quiero un equipo eficiente', value: 'instalacion' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('bateria congelada', 'se congela', 'escarcha', 'hielo en el aire', 'evaporador congelado', 'se hiela', 'congela el aire', 'congelacion', 'hielo en tubos', 'escarcha en split', 'bateria escarchada')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['bateria congelada'],
      options: [
        { label: 'Necesito un tecnico', value: 'humano' },
        { label: 'Como limpiar los filtros', value: 'limpiar-filtros' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('ciclos cortos', 'short cycling', 'se enciende y se apaga', 'arranca y para', 'se apaga a los pocos minutos', 'ciclo corto', 'se para y arranca', 'corta y arranca seguido', 'se enciende se apaga')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['ciclos cortos'],
      options: [
        { label: 'Necesito un tecnico', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('no enfria suficiente', 'no enfria', 'enfri poco', 'enfra poco', 'no enfria como antes', 'tarda en enfriar', 'no llega a temperatura', 'enfriamiento debil', 'no enfria bien', 'poco frio', 'aire caliente')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['no enfria suficiente'],
      options: [
        { label: 'Necesito un tecnico', value: 'humano' },
        { label: 'Como limpiar los filtros', value: 'limpiar-filtros' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('ruidos aire', 'hace ruido', 'zumbido', 'golpeteo', 'silbido', 'siseo', 'chirrido', 'rechinido', 'vibracion', 'traqueteo', 'ruido raro', 'ruido metalico', 'ruido al arrancar', 'zumba', 'silba', 'chirria', 'traquetea')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['ruidos aire'],
      options: [
        { label: 'Necesito un tecnico', value: 'humano' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('gotea agua', 'goteo', 'agua en la unidad', 'chorrea agua', 'sale agua', 'agua por delante', 'drenaje obstruido', 'agua del aire', 'gotear', 'se inunda', 'agua dentro')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['gotea agua'],
      options: [
        { label: 'Necesito un tecnico', value: 'humano' },
        { label: 'Como limpiar los filtros', value: 'limpiar-filtros' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('mal olor', 'huee mal', 'olor a humedad', 'olor a moho', 'huele a quemado', 'olor a pies', 'olor agrio', 'olor a gas', 'huele', 'olor raro', 'olor del aire')) {
    return {
      id,
      role: 'ai',
      text: HVAC_TECHNICAL_KNOWLEDGE['mal olor'],
      options: [
        { label: 'Necesito un tecnico', value: 'humano' },
        { label: 'Como limpiar los filtros', value: 'limpiar-filtros' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('quienes sois', 'quienes son', 'empresa', 'climatizaciones montano', 'montano', 'sobre vosotros', 'sobre ustedes', 'historia', 'experiencia', 'desde cuando', 'cuantos años', 'sois fiables', 'opiniones', 'resenas', 'valoraciones')) {
    return {
      id,
      role: 'ai',
      text: `Somos ${COMPANY_INFO.name}, una empresa de climatización con sede en Alcalá de Guadaíra (Sevilla). Llevamos desde ${COMPANY_INFO.founded} —${COMPANY_INFO.yearsExperience} de experiencia— y hemos hecho ${COMPANY_INFO.installations} para ${COMPANY_INFO.clients} en Sevilla y provincia.\n\nNos dedicamos a la instalación, mantenimiento y reparación de aire acondicionado, aerotermia, ventilación y energía solar térmica. Trabajamos para hogares, empresas y constructoras, con todas las marcas principales (Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense, Hitachi y Johnson).\n\nSomos empresa certificada ${COMPANY_INFO.certification} y todas nuestras instalaciones llevan ${COMPANY_INFO.warrantyInstall}. Si algo falla, lo arreglamos sin coste.\n\n¿Qué necesitas?`,
      options: [
        { label: 'Quiero instalar', value: 'instalacion' },
        { label: 'Necesito reparación', value: 'reparacion' },
        { label: 'Ver opiniones de Google', value: 'resenas-link' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('duda tecnica', 'tecnica sobre climatizacion', 'consulta tecnica', 'duda hvac', 'tecnico hvac', 'pregunta tecnica', 'soporte aire', 'ayuda con mi aire', 'problema con el aire', 'averia aire', 'falla aire', 'consulta sobre aire', 'duda sobre aire', 'duda sobre ventilacion', 'problema ventilacion', 'duda sobre calefaccion', 'problema calefaccion')) {
    return {
      id,
      role: 'ai',
      text: 'Claro, cuéntame qué te pasa. Puedo ayudarte con averías de aire acondicionado (no enfría, se congela, hace ruidos, gotea, huele mal, se enciende y se apaga solo), ventilación, calefacción, y también con dudas más técnicas como componentes (capacitor, presostato, placa inverter), conceptos de refrigeración (subenfriamiento, recalentamiento, golpe de líquido), vacío de línea, sistemas VRF/VRV, normativa SEER2, comparativa de gases R32 vs R410A, y más.\n\nPor ejemplo, puedes preguntarme algo como "mi unidad exterior no arranca" o "mi aire se congela".',
      options: [
        { label: 'Mi unidad exterior no arranca', value: 'no-arranca-exterior' },
        { label: 'Mi aire se congela', value: 'bateria-congelada' },
        { label: 'Hace ruidos extraños', value: 'ruidos-aire' },
        { label: 'No enfría suficiente', value: 'no-enfria' },
        { label: 'Gotea agua', value: 'gotea-agua' },
        { label: 'R32 vs R410A', value: 'r32-vs-r410a' },
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  if (has('inicio', 'empezar', 'menu', 'volver', 'otra cosa', 'otra duda')) {
    return {
      id,
      role: 'ai',
      text: '¡Claro! ¿En qué más te puedo ayudar?',
      options: [
        { label: 'Instalación', value: 'instalacion' },
        { label: 'Mantenimiento', value: 'mantenimiento' },
        { label: 'Reparación', value: 'reparacion' },
        { label: 'Código de error', value: 'codigo-error' },
        { label: 'Aerotermia', value: 'aerotermia' },
        { label: 'Precios', value: 'precio' },
        { label: 'Marcas', value: 'marcas' },
        { label: 'Soporte aire acondicionado y ventilación', value: 'tecnico' },
        { label: 'Hablar con una persona', value: 'humano' },
      ],
    };
  }

  if (has('gracias', 'perfecto', 'genial', 'ok', 'vale', 'bien', 'excelente', 'estupendo', 'fantastico')) {
    return {
      id,
      role: 'ai',
      text: '¡De nada, hombre! Para eso estamos. Si se te ocurre cualquier otra duda, ya sabes, aquí me tienes. Y si prefieres hablar con alguien del equipo, también, sin problema.\n\n¡Que tengas un buen día!',
      options: [
        { label: 'Volver al inicio', value: 'inicio' },
      ],
    };
  }

  return {
    id,
    role: 'ai',
    text: FALLBACK_RESPONSE,
    options: [
      { label: 'Instalación', value: 'instalacion' },
      { label: 'Mantenimiento', value: 'mantenimiento' },
      { label: 'Reparación', value: 'reparacion' },
      { label: 'Código de error', value: 'codigo-error' },
      { label: 'Aerotermia', value: 'aerotermia' },
      { label: 'Precios', value: 'precio' },
      { label: 'Hablar con una persona', value: 'humano' },
    ],
  };
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) > 4) {
        setIsScrollingDown(currentScrollY > lastScrollY && currentScrollY > 80);
        lastScrollY = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || nudgeDismissed) return;
    const timer = setTimeout(() => setShowNudge(true), 4000);
    return () => clearTimeout(timer);
  }, [isOpen, nudgeDismissed]);

  const handleOpenChat = () => {
    setShowNudge(false);
    setNudgeDismissed(true);
    setIsOpen(true);
  };

  const handleOption = (value: string) => {
    if (value === 'whatsapp-link') {
      window.open('https://wa.me/34691680706', '_blank');
      return;
    }
    if (value === 'email-link') {
      window.location.href = 'mailto:info@climont.es';
      return;
    }
    if (value === 'tel-link') {
      window.location.href = 'tel:+34676628348';
      return;
    }

    if (value === 'codigos-link') {
      navigate('/codigos-de-errores');
      return;
    }

    if (value === 'resenas-link') {
      document.getElementById('resenas')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const labelMap: Record<string, string> = {
      instalacion: 'Quiero instalar aire acondicionado',
      mantenimiento: 'Necesito mantenimiento',
      reparacion: 'Mi aire se ha estropeado',
      aerotermia: 'Me interesa la aerotermia',
      humano: 'Prefiero hablar con una persona',
      whatsapp: 'Mejor por WhatsApp',
      email: 'Prefiero enviar un email',
      precio: '¿Cuánto cuesta?',
      marcas: '¿Qué marca me recomendáis?',
      potencia: '¿Qué potencia necesito?',
      'potencia-20': 'Tengo 20 m²',
      'potencia-30': 'Tengo 30 m²',
      'potencia-40': 'Tengo 40 m²',
      'potencia-50': 'Tengo 50 m²',
      ayudas: '¿Qué ayudas hay?',
      inicio: 'Volver al inicio',
      daikin: 'Háblame de Daikin',
      mitsubishi: 'Háblame de Mitsubishi',
      johnson: 'Háblame de Johnson',
      'limpiar-filtros': 'Cómo limpiar los filtros yo mismo',
      'suelo-radiante': '¿Necesito suelo radiante para aerotermia?',
      inverter: '¿Cuánto ahorra un equipo inverter?',
      eficiencia: 'Quiero mejorar mi eficiencia energética',
      'codigo-error': 'Tengo un código de error en mi aire acondicionado',
      'tecnico': 'Soporte aire acondicionado y ventilación',
      'no-arranca-exterior': 'Mi unidad exterior no arranca',
      'r32-vs-r410a': '¿Qué diferencia hay entre R-32 y R-410A?',
      'golpe-liquido': '¿Qué es el golpe de líquido?',
      'vacio-linea': '¿Qué es el vacío de línea?',
      'bateria-congelada': 'Mi aire acondicionado se congela',
      'ruidos-aire': 'Mi aire hace ruidos extraños',
      'no-enfria': 'Mi aire no enfría suficiente',
      'gotea-agua': 'Mi aire gotea agua',
    };

    const userText = labelMap[value] || value;
    addUserMessage(userText);
  };

  const addUserMessage = (text: string) => {
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(async () => {
      const asyncResp = await generateResponseAsync(text);
      if (asyncResp) {
        setMessages((prev) => [...prev, asyncResp]);
        setIsTyping(false);
        return;
      }
      const response = generateResponse(text);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
      if (response.text === FALLBACK_RESPONSE) {
        void logUnansweredQuery(text, FALLBACK_RESPONSE);
      }
    }, 600 + Math.random() * 400);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addUserMessage(input.trim());
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => {
          setShowNudge(false);
          setNudgeDismissed(true);
          setIsOpen(!isOpen);
        }}
        className={`fixed bottom-24 right-[10.5rem] z-[80] flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:-translate-y-0.5 group ${isScrollingDown ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
        style={{ background: 'linear-gradient(135deg, #0891b2, #155e75)' }}
        aria-label="Abrir chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <Sparkles className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full border-2 border-white animate-pulse-slow" />
          </>
        )}
      </button>

      {/* Nudge bubble */}
      {showNudge && !isOpen && (
        <div className={`fixed bottom-24 right-[14.5rem] z-[79] flex items-center gap-3 transition-all duration-300 ${isScrollingDown ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
          <div
            className="relative bg-white rounded-2xl shadow-2xl border border-ink-200 px-4 py-3 max-w-[240px] cursor-pointer"
            onClick={handleOpenChat}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNudge(false);
                setNudgeDismissed(true);
              }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-ink-400 hover:bg-ink-600 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Cerrar aviso"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="text-sm font-semibold text-ink-800 leading-snug">¿Necesitas ayuda?</p>
            <p className="text-xs text-ink-500 mt-0.5 leading-snug">Nuestra IA te ayuda en segundos</p>
          </div>
          <div className="absolute right-[-6px] bottom-4 w-3 h-3 bg-white border-r border-t border-ink-200 rotate-45" />
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className={`fixed bottom-48 right-6 z-[80] w-[calc(100vw-3rem)] sm:w-[400px] max-h-[640px] bg-white rounded-2xl shadow-2xl border border-ink-200 flex flex-col overflow-hidden transition-all duration-300 ${isScrollingDown ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center gap-3 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0891b2, #155e75)' }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-display font-semibold text-sm truncate">Asistencia Virtual de climont.es</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-success-400 rounded-full" />
                <span className="text-xs text-primary-100">En línea</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors flex-shrink-0"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* AI warning banner */}
          <div className="bg-warning-50 border-b border-warning-100 px-4 py-2.5 flex items-start gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-warning-800 leading-relaxed">
              Estás hablando con una inteligencia artificial, no con una persona. Para consultas complejas, te ponemos en contacto con nuestro equipo.
            </p>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-ink-50"
            style={{ minHeight: '300px', maxHeight: '400px' }}
          >
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'ai'
                      ? 'bg-primary-600'
                      : 'bg-ink-300'
                  }`}
                >
                  {msg.role === 'ai' ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`flex-1 min-w-0 ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                  <div
                    className={`inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'ai'
                        ? 'bg-white text-ink-700 rounded-tl-sm border border-ink-100'
                        : 'bg-primary-600 text-white rounded-tr-sm'
                    }`}
                    style={{ maxWidth: '85%' }}
                  >
                    {msg.text}
                  </div>
                  {msg.options && msg.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleOption(opt.value)}
                          className="px-3 py-1.5 bg-white hover:bg-primary-50 text-primary-700 text-xs font-medium rounded-lg border border-primary-200 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-ink-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-ink-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-ink-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-ink-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick contact bar */}
          <div className="flex items-center justify-center gap-4 py-2 bg-white border-t border-ink-100 flex-shrink-0">
            <a href="tel:+34676628348" className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-primary-600 transition-colors">
              <Phone className="w-3.5 h-3.5" /> Llamar
            </a>
            <a href="https://wa.me/34691680706" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-success-600 transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <a href="mailto:info@climont.es" className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-primary-600 transition-colors">
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 bg-white border-t border-ink-100 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-700 disabled:bg-ink-300 text-white rounded-xl transition-all flex-shrink-0"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
