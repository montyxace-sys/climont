export const COMPANY_INFO = {
  name: 'Climatizaciones Montaño, S.L.',
  shortName: 'Climatizaciones Montaño',
  phone: 'nuestro teléfono',
  whatsapp: 'nuestro WhatsApp',
  email: 'info@climont.es',
  address: 'C/ Hacienda Guadalupe 35, Alcalá de Guadaíra, Sevilla',
  schedule: 'Lunes a viernes, de 8:00 a 14:00 y de 15:00 a 18:00',
  scheduleExtra: 'Reparaciones urgentes también fines de semana',
  founded: 2004,
  yearsExperience: 'Más de 20 años',
  clients: 'Más de 5.000 clientes',
  installations: 'Más de 5.000 instalaciones',
  certification: 'RITE-07',
  warrantyInstall: '3 años en instalaciones',
  warrantyRepair: '6 meses en reparaciones',
  responseTime: 'Menos de 24 horas',
  budget: 'Presupuesto gratis y sin compromiso',
};

export const PRICES = {
  split: 'entre 600 y 900 € ya instalado',
  conductos: 'entre 2.500 y 4.000 € según las estancias',
  aerotermia: 'entre 5.000 y 8.000 € según la potencia',
  mantenimiento: 'desde 80 a 150 € por equipo al año',
  visita: 'Gratis y sin compromiso',
  instalacionSplit: 'desde 200 €',
  instalacionConductos: 'sobre 500 €',
  instalacionCassette: 'sobre 400 €',
  instalacionSueloTecho: 'sobre 400 €',
};

export const CITIES_COVERED = [
  'Alcalá de Guadaíra', 'Dos Hermanas', 'Mairena del Aljarafe', 'Tomares',
  'Carmona', 'La Rinconada', 'Écija', 'Utrera', 'Sevilla capital',
  'Los Palacios y Villafranca', 'Mairena del Alcor', 'Coria del Río',
];

export const BRANDS_INFO: Record<string, { strengths: string; positioning: string }> = {
  daikin: {
    strengths: 'Máxima calidad y fiabilidad. Gama Perfera y Comfora de las más vendidas en Sevilla. Instalador autorizado con garantía oficial.',
    positioning: 'Marca premium, la referencia del mercado. Si buscas lo mejor, es Daikin.',
  },
  mitsubishi: {
    strengths: 'Los más silenciosos del mercado, desde 19 dB (prácticamente imperceptibles). Gama MSZ-LN ideal para dormitorios. Tecnología de control de flujo de aire.',
    positioning: 'Marca premium japonesa. Silencio y eficiencia. Ideal donde el ruido es prioritario.',
  },
  samsung: {
    strengths: 'Gama WindFree con tecnología de refrigeración sin flujo de aire directo. Conectividad WiFi de serie en la mayoría de modelos.',
    positioning: 'Excelente relación calidad-precio. Gama media-alta con WiFi de serie.',
  },
  lg: {
    strengths: 'Gama Art Cool con diseño y tecnología de purificación de aire. Equipos inverter de alta eficiencia. Instalación de máquinas de conductos LG muy demandada.',
    positioning: 'Excelente relación calidad-precio. Buenos equipos de conductos.',
  },
  panasonic: {
    strengths: 'Compresores muy fiables. Gama Etherea con tecnología nanoe-X para purificar el aire. Especialistas en aerotermia.',
    positioning: 'Marca intermedia entre premium y entrada. Fiabilidad y aerotermia.',
  },
  fujitsu: {
    strengths: 'Marca japonesa conocida por la calidad y el silencio de sus equipos. Robustos y con buena red de servicio técnico.',
    positioning: 'Marca intermedia. Solidez y durabilidad.',
  },
  hisense: {
    strengths: 'Equipos inverter de alta eficiencia con excelente relación calidad-precio. Instalación de máquinas de conductos Hisense muy solicitada.',
    positioning: 'La mejor opción para presupuestos ajustados sin renunciar a calidad.',
  },
  johnson: {
    strengths: 'Muy buena calidad a precios realmente competitivos. Equipos inverter de alta eficiencia energética, fiables y silenciosos. Ideal para viviendas, oficinas y segundas residencias cuando buscas calidad sin gastar demasiado.',
    positioning: 'La mejor opción calidad-precio del mercado. Si quieres un equipo bueno y barato, es Johnson.',
  },
  hitachi: {
    strengths: 'Marca japonesa de máxima calidad. Gama Zen con tecnología de compresor de calidad. Reparación Hitachi con técnicos especializados.',
    positioning: 'Calidad japonesa a buen precio. Muy buena para segundas residencias.',
  },
};

export const INSTALLATION_GUIDE = {
  wholeHome: {
    title: 'Vivienda completa',
    response: 'Si quieres climatizar una vivienda completa, normalmente te recomendamos una instalación por conductos: queda integrada en el falso techo, reparte el aire de forma uniforme y evita tener varias unidades interiores a la vista. Si cada habitación se usa de forma distinta, añadimos control por zonas con MYSAir o Airzone para regular desde el móvil la temperatura y las rejillas de cada estancia, y climatizar solo lo que necesitas.',
    brands: 'Para una solución premium y muy fiable, Daikin o Mitsubishi. Si buscas una relación calidad-precio equilibrada, Samsung, LG o Panasonic. Para ajustar más el presupuesto sin renunciar a una buena solución, Hisense o Johnson.',
    note: 'La elección final depende de los metros, el aislamiento, la orientación, el falso techo disponible y el número de estancias. En un proyecto como el Edificio Europa 2 de Alcalá de Guadaíra instalamos conductos Daikin y control por zonas MYSAir con conexión WiFi.',
  },
  singleRoom: {
    title: 'Una habitación o estancia',
    response: 'Para una sola habitación o un salón independiente, lo más recomendable es un split de pared: se instala rápido, cuesta menos y permite climatizar justo el espacio que utilizas. Si buscas máximo silencio y acabados premium, Daikin o Mitsubishi son apuestas muy seguras. Para una buena relación calidad-precio, Samsung, LG, Hisense o Johnson funcionan muy bien. Para calcular la potencia que necesitas, aquí en Sevilla usamos la fórmula de 140 frigorías por metro cuadrado: si me dices los metros cuadrados de la estancia te calculo las frigorías y el equipo adecuado.',
  },
  business: {
    title: 'Local, oficina o negocio',
    response: 'En una oficina o local valoramos primero el uso del espacio y la distribución. Para una zona amplia, un cassette de techo suele repartir bien el aire; para varias salas, los conductos con control por zonas permiten que cada espacio tenga su temperatura y ayudan a no gastar energía donde no hay nadie.',
    brands: 'Daikin, Mitsubishi, Samsung y LG son opciones muy habituales en negocios. Si el presupuesto es más ajustado, Hisense y Johnson pueden ofrecer un equilibrio interesante.',
  },
};

export const SERVICES_DETAIL: Record<string, { features: string[]; extra: string }> = {
  instalacion: {
    features: [
      'Splits de pared: 2-4 horas de instalación, ideal para 1-3 habitaciones',
      'Sistema por conductos: queda integrado en el falso techo, distribuye el aire por toda la casa',
      'Cassettes de techo: para oficinas y locales',
      'Equipos suelo/techo: para naves y locales grandes',
      'Conductos en fibra Climaver y chapa galvanizada',
      'Equipos inverter de alta eficiencia con gas R32',
    ],
    extra: 'Incluye mano de obra, materiales (tuberías, cableado, soportes) y el equipo. No hay costes ocultos. Todo detallado antes de empezar.',
  },
  mantenimiento: {
    features: [
      'Limpieza a fondo de filtros y baterías',
      'Revisión del refrigerante',
      'Revisión del circuito eléctrico',
      'Limpieza del drenaje',
      'Informe técnico del estado del equipo',
      'Recomendación: 1 revisión al año para casa, 2 para uso intensivo',
    ],
    extra: 'Un equipo limpio consume hasta un 25 % menos. Los filtros sucios aumentan el consumo y acumulan bacterias y ácaros. El RITE-07 exige mantenimiento periódico, obligatorio para equipos con más de 5 kg de refrigerante.',
  },
  reparacion: {
    features: [
      'Diagnóstico electrónico profesional',
      'Repuestos originales de todas las marcas',
      'Garantía de 6 meses en todas las reparaciones',
      'La mayoría de reparaciones se resuelven en la misma visita',
      'Si falta un repuesto especial, suele tardar 24-48 horas',
      'Atendemos fines de semana para urgencias',
    ],
    extra: 'Te decimos qué tiene y cuánto va a costar antes de tocar nada. Sin sorpresas ni costes ocultos. Si el equipo tiene más de 10-12 años y la avería es grave, te aconsejamos honestamente si compensa reparar o cambiar.',
  },
  ventilacion: {
    features: [
      'Ventilación mecánica controlada (VMC) para viviendas',
      'Ventilación de garajes comunitarios con detectores de CO',
      'Extracción de cocinas industriales y humos',
      'Ventilación de naves industriales',
      'Sistemas con recuperación de calor (hasta 90 % de aprovechamiento)',
      'Cumplimiento del Código Técnico de la Edificación (CTE)',
    ],
    extra: 'El CTE exige sistemas de ventilación en viviendas nuevas. La recuperación de calor aprovecha la energía del aire extraído para precalentar el aire nuevo que entra, ahorrando energía.',
  },
  eficiencia: {
    features: [
      'Auditoría energética completa con medición de consumos reales',
      'Instalación de equipos inverter (ahorro hasta 40 %)',
      'Certificación energética oficial (obligatoria para vender o alquilar)',
      'Estimación de retorno de inversión antes de invertir',
      'Ayudas y subvenciones disponibles para renovación de equipos',
    ],
    extra: 'En Sevilla, el aire puede funcionar 6-8 horas al día en verano. Cambiar a inverter ahorra 150-300 € al año en una vivienda media. El retorno de la inversión suele ser de 3-5 años.',
  },
  airzone: {
    features: [
      'Control de temperatura por zonas desde el móvil',
      'App WiFi funciona desde cualquier lugar con internet',
      'Cada habitación con su propia temperatura',
      'Ahorra hasta un 30 % climatizando solo lo que usas',
      'Compatible con sistemas por conductos de Daikin, Mitsubishi, Samsung, Panasonic, Fujitsu, Hisense',
    ],
    extra: 'Puedes encender el aire antes de llegar a casa, apagarlo si se te olvidó, o ajustar la temperatura de cada habitación estés donde estés. Si ya tienes un sistema por conductos, probablemente se pueda integrar.',
  },
  aerotermia: {
    features: [
      'Bomba de calor aerotérmica: calefacción y agua caliente en un solo equipo',
      'Ahorro hasta 70 % frente a gas o gasoil',
      'Por cada kW eléctrico consume, produce 4-5 kW de calor',
      'Funciona correctamente hasta -15/-20 °C en invierno',
      'Compatible con suelo radiante, radiadores de baja temperatura y fan-coils',
      'Sin combustibles fósiles, sin emisiones, sin almacenamiento de gas',
    ],
    extra: 'Marcas: Daikin, Mitsubishi, Samsung, Panasonic y LG. Es especialmente rentable en Sevilla por el clima suave, que permite a la bomba trabajar con alta eficiencia todo el año. El suelo radiante maximiza el ahorro porque trabaja a temperaturas más bajas.',
  },
  'solar-termica': {
    features: [
      'Paneles solares térmicos para agua caliente sanitaria (ACS)',
      'Ahorro hasta 80 % en agua caliente',
      'Sistemas para viviendas, comunidades, hoteles, gimnasios y empresas',
      'Sevilla tiene más de 3.000 horas de sol al año',
      'Bajo mantenimiento: una revisión anual basta',
      'Inversión se recupera en 5-7 años',
    ],
    extra: 'Funciona incluso en días nublados, aunque con menor rendimiento. Incluye un apoyo (caldera o resistencia) que se activa automáticamente cuando la energía solar no es suficiente. En comunidades de vecinos es una de las aplicaciones más rentables.',
  },
  constructoras: {
    features: [
      'Preinstalaciones durante la fase de construcción',
      'Instalaciones completas y proyectos llave en mano',
      'Obra nueva y rehabilitación',
      'Cumplimiento de plazos de obra, coordinación con otros gremios',
      'Documentación técnica: memoria, planos, certificado RITE, libro de mantenimiento',
      'Equipo propio de técnicos cualificados, sin subcontratas',
    ],
    extra: 'Nos adaptamos al calendario de cada obra para que la entrega de llaves no se retrase. Entregamos toda la documentación que exige la normativa, lista para la entrega de llaves.',
  },
};

export const AYUDAS_INFO = [
  'Bonificación del IBI: hasta un 50 % durante 3-5 años en muchos municipios de Sevilla',
  'Deducción en el IRPF: entre un 20 % y un 40 % por rehabilitación energética (si reduces el consumo al menos un 30 %)',
  'Ayudas de la Junta de Andalucía: entre un 30 % y un 60 % según ingresos y mejora energética',
  'Bonificación en el ICIO: exención o reducción en el impuesto de construcciones',
];

export const BLOG_KNOWLEDGE: Record<string, string> = {
  inverter:
    'Los equipos inverter ajustan la velocidad del compresor de forma continua, trabajando siempre a la potencia necesaria sin picos de consumo. Ahorran entre un 30 % y un 40 % frente a equipos convencionales. En Sevilla, con 6-8 horas de uso diario en verano, el ahorro puede ser de 150-300 € al año. El retorno de la inversión suele ser de 3-5 años. Todas las marcas que instalamos (Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense y Hitachi) tienen gamas inverter con gas R32.',
  filtros:
    'Para uso doméstico, limpia los filtros cada 2-3 meses durante la temporada de uso intensivo. Para comercios y oficinas, mensualmente. Un filtro sucio aumenta el consumo hasta un 25 % y acumula bacterias, moho y ácaros. Para limpiarlos: abre el panel frontal del split, extrae los filtros y lávalos con agua tibia y jabón neutro. Déjalos secar completamente antes de volver a colocarlos. Si están muy deteriorados, mejor sustituirlos.',
  'gas r32':
    'Desde enero de 2025 está prohibido comercializar equipos nuevos con gas R410A (PCA 2.088) por su alto impacto ambiental. El nuevo estándar es el gas R32, con un PCA de 675 (tres veces menor). El R32 además usa un 30 % menos de refrigerante para la misma potencia, lo que reduce el coste. Prácticamente todas las marcas que instalamos ya han migrado a R32. Si tienes un equipo con R410A que funciona bien, puedes seguir usándolo, pero si necesita recargas frecuentes y tiene más de 10 años, valora el cambio a R32.',
  'bomba de calor':
    'Un split con bomba de calor da frío en verano y calefacción en invierno con un solo equipo. Por cada kW eléctrico que consume, genera entre 3 y 5 kW de calor, mucho más eficiente que una resistencia eléctrica o estufa. Ideal para Sevilla por los veranos calurosos e inviernos suaves. La mayoría de los splits de Daikin, Mitsubishi, Samsung, LG, Panasonic y Fujitsu incluyen bomba de calor de serie. Para viviendas grandes o mal aisladas en zonas frías de la sierra, mejor valorar aerotermia con suelo radiante.',
  ruido:
    'La ordenanza de Sevilla establece límites de 35-40 dB durante el día (7:00-23:00) y 25-30 dB por la noche en zonas residenciales. Los splits de Daikin y Mitsubishi funcionan desde 19-21 dB, prácticamente imperceptibles. La Ley de Propiedad Horizontal exige autorización de la comunidad para instalar unidades exteriores en fachadas, pero los tribunales consideran que no se puede prohibir si no causa un perjuicio real. Si recibes quejas de ruido, muchas veces el problema es una unidad mal instalada o con desgaste. Un mantenimiento adecuado lo soluciona.',
  'mejor epoca':
    'La mejor época para instalar aire acondicionado es primavera o invierno. En temporada baja hay mejores precios, menor tiempo de espera y más disponibilidad de stock. En pleno verano (junio a septiembre) la demanda se dispara: listas de espera de 1-3 semanas y precios en su punto más alto. Si quieres aerotermia, la mejor época es el otoño, para tenerla lista antes del invierno. Si sabes que vas a necesitar aire para el verano, pide presupuesto en invierno o principios de primavera.',
  'sin unidad exterior':
    'Si tu vivienda no permite unidad exterior (centro histórico, edificio protegido, sin terraza), hay varias opciones:\n\n• Aire portátil: económico pero ruidoso y menos eficiente. Solución temporal.\n• Splits sin unidad exterior (water-cooled): condensan con agua conectada a la red de desagüe. Más caros pero sin necesidad de fachada.\n• Aerotermia con fan-coils: si ya tienes aerotermia, puedes añadir fan-coils que distribuyen aire sin unidad exterior adicional.\n• Conductos con unidad en cubierta o patio interior: en algunos edificios del centro de Sevilla se puede instalar la unidad en azoteas o patios no visibles desde la calle.',
  'suelo radiante':
    'El suelo radiante es el sistema de emisión de calor más eficiente para aerotermia, porque trabaja a temperaturas más bajas (35-40 °C) que los radiadores tradicionales (60-70 °C). Esto maximiza el rendimiento de la bomba de calor. No es obligatorio para aerotermia (también funciona con radiadores de baja temperatura y fan-coils), pero es la combinación que más ahorra. Si estás construyendo una casa nueva o haciendo una reforma integral, el suelo radiante es la opción ideal.',
};

export const CAREERS_INFO = {
  positions: [
    'Técnico en climatización', 'Técnico en aerotermia', 'Técnico en ventilación',
    'Ayudante de técnico', 'Administrativo/a', 'Comercial', 'Jefe de equipo',
  ],
  perks: [
    'Proyección real: empresa en crecimiento desde 2004',
    'Formación continua: cursos de certificación RITE, marcas y nuevas tecnologías a cargo de la empresa',
    'Buen ambiente: equipo humano cercano, estable y con valores',
    'Estabilidad: contrato fijo tras periodo de prueba, trabajo durante todo el año sin temporada baja',
  ],
  process: 'Envías tu CV → te llamamos para una primera entrevista → visitas nuestras instalaciones en Alcalá de Guadaíra → si todo va bien, empiezas cuanto antes con formación.',
};

export const COMPANY_PROCESS = [
  'Contacto: nos llamas o rellenas el formulario y te escuchamos',
  'Visita técnica: un técnico visita tu espacio y te aconseja la mejor opción',
  'Presupuesto: te mandamos un presupuesto claro y sin compromiso',
  'Ejecución: hacemos la instalación o reparación con garantía y dejamos todo limpio',
];

export const HVAC_TECHNICAL_KNOWLEDGE: Record<string, string> = {
  'unidad exterior no arranca':
    'Si la unidad interior ventilador funciona pero la condensadora exterior no arranca, los sospechosos habituales son:\n\n1. Capacitador de arranque o marcha defectuoso: Es muy comun. Si el condensador falla, el compresor o el motor del ventilador exterior simplemente no pueden arrancar.\n2. Salto del protector termico o presostato: Si el equipo detecto sobrepresion o sobrecalentamiento previo, corta la maniobra para no quemar el compresor.\n3. Falta de senal de control o fallo en placa: La consola interior no le esta enviando los 220V (o la senal de datos en inverter) a la unidad exterior.\n\nQue puedes revisar tu rapido: Comprueba que el automatico o breaker dedicado a la unidad exterior no se haya disparado en el cuadro electrico.\n\nPara lo demas: Medir capacitancia con multimetro o verificar presiones de trabajo del refrigerante requiere un tecnico equipado. Si me dices la marca o si la consola parpadea con algun codigo de error, puedo afinar mas el diagnostico.',

  'r32 vs r410a':
    'La diferencia clave entre el R-410A y el R-32 esta en la eficiencia energetica y la carga de refrigerante necesaria.\n\nEl R-32 es un gas puro, a diferencia del R-410A que es una mezcla zeotropica (50% R-32 y 50% R-125). Al ser puro, el R-32 es mas facil de reciclar y reutilizar.\n\nPor que rinde mejor el R-32?\n• Mayor capacidad volumetrica de refrigeracion: Tiene mejor conductividad termica y menor viscosidad. Esto permite que el compresor trabaje con menor esfuerzo y menor masa de gas para transferir el mismo calor.\n• Menor carga: Un equipo R-32 necesita aproximadamente un 30% menos de cantidad de refrigerante que uno equivalente de R-410A.\n• Impacto ambiental (PCA/GWP): El R-32 tiene un Potencial de Calentamiento Atmosferico de 675, frente a los 2.088 del R-410A (casi un 67% menos).\n\nEso si, como dato tecnico para la instalacion: el R-32 se clasifica como A2L (ligeramente inflamable), por lo que requiere herramientas de vaciado y manipulacion homologadas sin chispas.',

  'capacitor':
    'El capacitor (o condensador) es uno de los componentes que mas fallan en los aires acondicionados. Hay dos tipos:\n\n• Capacitor de arranque: da el pulso inicial de energia para que el compresor o el ventilador giren. Si falla, el motor zumba pero no arranca.\n• Capacitor de marcha: mantiene el giro una vez en marcha. Si se degrada, el motor consume mas, se calienta y puede quemarse.\n\nSintomas tipicos de capacitor defectuoso: el equipo hace un zumbido pero no arranca, el ventilador exterior gira lentamente a mano pero no solo, o el compresor no parte.\n\nEsto requiere un tecnico con multimetro para medir la capacitancia (en microfaradios) y comparar con el valor nominal del capacitor. Es una reparacion barata y rapida si se detecta a tiempo. Si se ignora, puede quemar el compresor, que si es caro.',

  'presostato':
    'Los presostatos son interruptores de seguridad que protegen al compresor. Hay dos tipos principales:\n\n• Presostato de alta: corta el equipo si la presion de condensacion sube demasiado. Causas habituales: ventilador exterior parado, baterias sucias, refrigerante en exceso, o tuberia bloqueada.\n• Presostato de baja: corta si la presion de evaporacion baja de un limite. Causas: falta de refrigerante por fuga, filtro de linea obstruido, o evaporador congelado.\n\nCuando el presostato salta, el equipo se para para proteger el compresor. A veces se resetea solo al bajar la presion, otras veces hay que resetearlo manualmente. Si salta con frecuencia, hay un problema de fondo que hay que diagnosticar: no se puede simplemente resetear y seguir como si nada.',

  'placa inverter':
    'La placa inverter (o tarjeta de control) es el cerebro del equipo. Convierte la corriente continua en alterna con frecuencia variable para ajustar la velocidad del compresor. Si falla, los sintomas pueden ser:\n\n• El equipo no arranca o arranca y se para a los pocos segundos.\n• El compresor no responde o lo hace de forma erratica.\n• La consola muestra un codigo de error de fallo de comunicacion o de placa.\n• Se escuchan clicks repetidos de los relés pero el compresor no parte.\n\nEl diagnostico de placa requiere un tecnico especializado con equipo de medida. En muchos casos la placa se reemplaza, no se repara. Si el equipo tiene mas de 8-10 anos y falla la placa, a veces compensa mas cambiar el equipo que comprar una placa nueva.',

  'subenfriamiento':
    'El subenfriamiento es la diferencia de temperatura entre el refrigerante liquido a la salida del condensador y su temperatura de saturacion. Es decir, cuanto le baja la temperatura por debajo del punto donde estaria en equilibrio.\n\nUn subenfriamiento correcto (normalmente 5-10 grados) asegura que el refrigerante llega al expansion en estado 100% liquido, sin burbujas. Si el subenfriamiento es bajo, hay gas mezclado con liquido en la linea de liquido, el expansion no funciona bien y la capacidad de refrigeracion baja.\n\nCausas de subenfriamiento bajo: falta de refrigerante, tuberia de liquido demasiado larga sin aislar, o condensador ineficiente. Se mide con sondas de temperatura en la linea de liquido junto al manometro de alta.',

  'recalentamiento':
    'El recalentamiento (superheat) es la diferencia entre la temperatura real del gas a la salida del evaporador y su temperatura de saturacion. Indica cuanto calor ha absorbido el gas despues de evaporarse completamente.\n\nUn recalentamiento correcto (normalmente 5-8 grados en expansion fija, variable en electronico) asegura que el compresor recibe gas vapor, no liquido. Si el recalentamiento es muy bajo, hay riesgo de golpe de liquido: el compresor recibe refrigerante liquido que no se puede comprimir y puede romper las valvulas o el propio compresor.\n\nSi el recalentamiento es muy alto, el evaporador no aprovecha toda su superficie y la capacidad baja. Se mide con sondas en la linea de aspiracion junto al manometro de baja.',

  'golpe de liquido':
    'El golpe de liquido ocurre cuando refrigerante en estado liquido llega al compresor. El compresor esta disenado para comprimir gas, no liquido. El liquido es incompresible, asi que cuando entra en el cilindro, la presion sube instantaneamente y puede romper valvulas, bielas o el propio bloque del compresor.\n\nCausas habituales: recalentamiento muy bajo, expansion defectuoso que deja pasar demasiado refrigerante, o arranques con liquido acumulado en la linea de aspiracion (tipico tras un periodo parado en frio).\n\nSintomas: ruido metalico fuerte al arrancar, vibracion excesiva, o el compresor se bloquea. Si escuchas un golpeteo fuerte al arrancar el equipo, apagalo y llama a un tecnico: seguir intentando arrancarlo puede destruir el compresor.',

  'vacio de linea':
    'El vaciado de linea (o vacio) es un paso critico en la instalacion. Antes de cargar refrigerante, hay que extraer el aire y la humedad del circuito con una bomba de vacio. Si no se hace:\n\n• El aire residual aumenta la presion de condensacion, el equipo consume mas y pierde capacidad.\n• La humedad reacciona con el refrigerante y el aceite lubricante, formando acidos que corroen el compresor y las bobinas del motor.\n• Se pueden crear tapones de hielo en el expansion que bloquean el circuito.\n\nUn vacio correcto debe llegar al menos a 200-500 micrones y mantenerse estable. Si el instalador no usa bomba de vacio o hace el vacio en 5 minutos, desconfia: es una instalacion de mala calidad que dara problemas a corto plazo.',

  'vrf vrv':
    'Los sistemas VRF (Variable Refrigerant Flow) y VRV (Variable Refrigerant Volume, marca Daikin) son sistemas de refrigerante variable que permiten conectar multiples unidades interiores a una sola unidad exterior, cada una con su propia temperatura. Son la evolucion del sistema inverter para edificios grandes.\n\nVentajas: cada unidad interior puede ir encendida o apagada independientemente, con su propia consigna. El compresor ajusta su velocidad segun la demanda real total, no por zonas individuales. Permite recuperar calor (heat recovery): una unidad que esta enfriando cede el calor a otra que esta calentando, con un rendimiento altisimo.\n\nSon sistemas complejos que requieren instaladores certificados por la marca. En Sevilla los usamos sobre todo en oficinas, hoteles y edificios de varias plantas. No tiene sentido para viviendas individuales, donde un split o un sistema por conductos normal es mas que suficiente.',

  'manometro vacio':
    'Si el manometro de baja te marca vacio (esta en cero o negativo) pero la botella de refrigerante tiene gas, lo que esta pasando es que hay un tapon o una obstruccion en el circuito antes del punto donde estas midiendo. El compresor esta intentando aspirar pero no hay flujo de gas.\n\nCausas habituales: filtro de linea obstruido, tubo capilar bloqueado, expansion electronico cerrado por fallo, o la linea de liquido esta taponada por humedad congelada (si el vacio de instalacion fue deficiente).\n\nNo intentes cargar mas gas: no va a entrar y solo empeoras el problema. Hay que localizar la obstruccion, normalmente entre el condensador y el evaporador. Requiere un tecnico con manometros de alta y baja y sonda de temperatura para diagnosticar donde esta el tapon.',

  'seer2':
    'El SEER2 (Seasonal Energy Efficiency Ratio 2) es la nueva normativa de eficiencia para equipos de aire acondicionado, que sustituye al SEER anterior. Mide la eficiencia energetica anual del equipo en modo refrigeracion, considerando temperaturas variables reales (no solo una condicion nominal).\n\nUn SEER2 mas alto significa menor consumo. Los equipos inverter modernos con R32 suelen tener SEER2 entre 18 y 30. La diferencia entre un SEER2 de 20 y uno de 25 puede suponer un ahorro de 100-200 euros al ano en una vivienda media en Sevilla.\n\nDesde 2025, los equipos nuevos deben cumplir con unos minimos de SEER2 que varian segun la potencia. Si vas a comprar un equipo nuevo, pregunta por el SEER2: no te quedes solo con la etiqueta energetica, que es mas generica.',

  'bateria congelada':
    'Si tu aire acondicionado se congela (escarcha o hielo en la unidad interior o en los tubos), las causas mas habituales, segun datos verificados de Carrier y Trane, son:\n\n1. Filtros sucios o flujo de aire restringido: Es la causa numero uno. Si el aire no circula bien por la bateria, la temperatura del evaporador baja de 0 grados y el condensado se congela. Solucion: limpia los filtros y asegurate de que no hay muebles o cortinas bloqueando las rejillas.\n2. Falta de refrigerante por fuga: Con poco gas, la presion del evaporador baja y la temperatura desciende por debajo de cero. Se forma hielo. Requiere un tecnico para localizar la fuga, repararla y recargar al peso exacto.\n3. Baterias del evaporador sucias: La grasa y el polvo acumulado actuan como aislante y reducen el intercambio termico, bajando la temperatura de la bateria.\n4. Motor del ventilador interior fallando: Si gira lento o no gira, no hay aire suficiente sobre la bateria y se congela.\n5. Termostato descalibrado: Si el termostato no corta y el equipo funciona sin parar a temperatura muy baja, puede congelar.\n\nQue hacer: Apaga el equipo y deja que se descongele completamente (3-4 horas). Si la causa son los filtros, limpiandolos se soluciona. Si despues de limpiar los filtros se vuelve a congelar, lo mas probable es que haya una fuga de refrigerante o un problema de ventilador, y eso requiere un tecnico.',

  'ciclos cortos':
    'Si tu aire acondicionado se enciende y se apaga cada pocos minutos (short cycling), no es normal. Un equipo bien dimensionado tarda 10-15 minutos en alcanzar la temperatura y luego mantiene. Las causas verificadas mas frecuentes son:\n\n1. Bajo nivel de refrigerante por fuga: Es la causa mas comun. El presostato de baja detecta que la presion cae y corta el compresor. Cuando la presion sube, arranca de nuevo. Ciclo repetido. Hay que localizar la fuga, repararla, hacer vacio y recargar al peso exacto.\n2. Equipo sobrecargado de refrigerante: Si se ha cargado mas gas del necesario, la presion de alta sube demasiado y el presostato de alta corta. Se mide el subenfriamiento: si esta por encima de 15-20 grados del especificado, hay sobrecarga.\n3. Presostato o interruptor de presion defectuoso: Si el sensor falla, corta el equipo sin motivo. Se diagnostica puenteando el presostato temporalmente para ver si el equipo mantiene el ciclo.\n4. Problema electrico: Contactor con contactos carbonizados, cable suelto, o breaker que se dispara por consumo excesivo.\n5. Equipo mal dimensionado: Si el aire es demasiado potente para la estancia, enfría demasiado rapido y se apaga. Un equipo sobredimensionado hace ciclos cortos toda su vida y nunca llega a deshumectar.\n\nEl short cycling gasta mas energia, desgasta el compresor y no llega a climatizar bien. Si tu equipo hace esto, lo mejor es que venga un tecnico a medir presiones y diagnosticar.',

  'no enfria suficiente':
    'Si tu aire acondicionado funciona pero no enfria como antes o tarda mucho en alcanzar la temperatura, las causas mas frecuentes (fuente: Trane, Carrier, ServiceTitan) son:\n\n1. Filtros sucios: Causa numero uno. Un filtro sucio puede reducir el rendimiento hasta un 25%. Limpi los filtros o cambialos.\n2. Falta de refrigerante por fuga: El gas se escapa lentamente por poros en soldaduras o vibraciones. Con menos gas, el equipo no puede enfriar. Un tecnico debe localizar la fuga, repararla y recargar al peso exacto.\n3. Baterias del condensador sucias: Si la unidad exterior esta sucia de polvo, hojas o tierra, no puede disipar el calor. Limpia la zona alrededor y si esta muy sucia, un tecnico la limpia con productos especificos.\n4. Equipo viejo o desgastado: Un compresor con perdida de eficiencia o un motor de ventilador que gira lento no generan suficiente refrigeracion.\n5. Calor excesivo en la estancia: Ventanas mal selladas, falta de aislamiento o muchas personas/aparatos electronicos pueden superar la capacidad del equipo.\n\nQue puedes revisar tu: filtros, obstrucciones en la unidad exterior, ventanas y persianas cerradas. Si despues de eso sigue sin enfriar bien, necesita un tecnico con manometros para medir presiones y diagnosticar.',

  'ruidos aire':
    'Los ruidos del aire acondicionado son la forma en que el equipo te avisa de que algo va mal. Cada sonido indica un problema distinto:\n\n• Zumbido electrico: Lo mas habitual es un capacitor de arranque defectuoso o un contactor con los contactos sucios. El motor intenta arrancar pero no tiene el pulso de energia suficiente. Si se ignora, puede quemar el motor.\n• Golpeteo o chasquido al arrancar: Puede ser golpe de liquido en el compresor (refrigerante liquido entrando donde no debe), biela o ciguenal suelto dentro del compresor, o una pala del ventilador rota o desequilibrada. Si el golpeteo es fuerte, apaga el equipo: puede ser fatal para el compresor.\n• Silbido o siseo continuo: Fuga de refrigerante. El gas se escapa por una porosidad o soldadura defectuosa. El silbido es el gas saliendo a presion. No intentar sellar nada con cinta o silicona: no funciona y empeora. Requiere un tecnico con detector de fugas.\n• Chirrido o rechinido: Rodamiento de motor desgastado (cojinete seco o dañado). Si no se cambia el motor, puede bloquearse y dejar el equipo sin servicio.\n• Vibracion o traqueteo: Normalmente tornillos sueltos en soportes o base de la unidad exterior, o el equipo mal nivelado. A veces es el compresor con amortiguadores internos gastados.\n• Crepitar o crujir dentro de la unidad interior: Suele ser hielo formandose en la bateria (evaporador congelandose) y el hielo rompiendose al descongelar.\n\nMi consejo: si escuchas algo raro, no lo ignores. Un ruido pequeño hoy puede ser una reparacion cara mañana. Si me dices que tipo de ruido hace, te puedo afinar mas el diagnostico.',

  'gotea agua':
    'Si tu aire acondicionado gotea agua por la unidad interior, lo mas probable es que el drenaje este obstruido. El condensado que se genera al enfriar el aire tiene que salir por un tubo de desague. Si ese tubo se bloquea con polvo, moho o insectos, el agua se acumula y sale por delante.\n\nPasos que puedes hacer tu:\n1. Comprueba si el tubo de desague tiene alguna obstruccion visible. A veces se puede soplar o usar un alambre fino para destaparlo.\n2. Si tienes acceso, vierte un poco de agua con vinagre por el drenaje para disolver el moho.\n3. Limpia los filtros: un filtro sucio hace que la bateria se congele y al descongelar genera mas agua de la que el drenaje puede evacuar.\n\nSi despues de eso sigue goteando, puede ser que la bomba de condensados (si la tiene) este averiada, o que la bateria este congelada por falta de gas. En esos casos, hace falta un tecnico.',

  'mal olor':
    'Si tu aire acondicionado huele mal al encenderlo, las causas mas habituales son:\n\n• Olor a humedad o moho: Bacterias y moho acumulados en los filtros y en la bandeja de condensados. El ambiente humedo y oscuro del interior de la unidad es perfecto para que crezcan. Solucion: limpieza a fondo de filtros y bandeja, y si esta muy acumulado, un tecnico debe limpiar la bateria con productos biocidas.\n• Olor a quemado: Problema electrico. Un cable sobrecalentado, un motor con las bobinas quemandose, o un capacitor que se ha deformado. Apaga el equipo inmediatamente y llama a un tecnico. No lo enciendas hasta que lo revisen.\n• Olor a pies o agrio: Bacterias en el evaporador. Se elimina con una limpieza profesional con spray antibacteriano especifico para climatizacion.\n• Olor a gas: Si hueles algo quimico o a refrigerante, puede haber una fuga. Ventila la estancia y llama a un tecnico.\n\nLa mejor prevencion: limpia los filtros cada 2-3 meses y haz una revision anual. Un equipo limpio no huele mal.',
};
