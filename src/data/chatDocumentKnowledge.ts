type KnowledgeDocument = {
  source: string;
  title: string;
  text: string;
  terms: string[];
};

type KnowledgeChunk = KnowledgeDocument & {
  chunk: string;
  normalizedChunk: string;
};

const rawDocuments = import.meta.glob('./chatbot-knowledge/*.txt', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const ERROR_CODES_PDF_GUIDE = `
Guía de códigos de error de aire acondicionado por marca, revisada el 16/10/2026.

REGLA GENERAL: El mismo código puede significar cosas distintas según la marca, la serie y el año. Antes de intervenir, confirma el modelo exacto y consulta el manual del fabricante. Si un código reaparece después de apagar el equipo durante cinco minutos, requiere revisión técnica. Los códigos de compresor, refrigerante, módulo inverter, presión o placa electrónica deben revisarlos técnicos cualificados.

DAIKIN: Para ver el código, mantén CANCEL pulsado unos 5 segundos y pulsa CANCEL repetidamente hasta oír un pitido. A0 dispositivo de protección externo activado; A1 fallo de placa PCB interior; A3 fallo del nivel de drenaje; A4 protección anticongelación; C4/C5/C9 fallo de termistor del intercambiador; E3 protección de alta presión; E4 protección de baja presión; E7/H7 fallo de motor y circuito de control; E9 fallo de válvula de expansión; H6 sensor de posición; H8 sensor de corriente o tensión DC; H9 termistor exterior; J1 sensor de presión; J3 termistor de descarga; J6 termistor exterior; L3 temperatura de caja eléctrica; L4 temperatura del disipador; L5 sobrecorriente de salida; P4 termistor del disipador; P1 ajuste de capacidad; U0 falta de refrigerante; U2 tensión baja o alta; U4 transmisión interior-exterior; U5 transmisión interior-mando; U8 transmisión entre mandos; U9 señal entre unidades; UA unidades incompatibles; UC/UE dirección duplicada o transmisión centralizada.

MITSUBISHI ELECTRIC: En mando inalámbrico pulsa CHECK dos veces; en mando con cable pulsa CHECK dos veces. E6 comunicación interior-exterior; P1 sensor; E1 placa de control del mando; 0403 comunicación entre placas exteriores; 0900 modo de prueba; 1102 temperatura de descarga; 1301 baja presión; 1302 alta presión; 1500 sobrecarga de refrigerante; 2500 sensor de drenaje; 2502 bomba de drenaje; 2503 sensor de drenaje; 2600 fuga de agua; 4102 fase abierta; 4106 alimentación de transmisión; 4115 sincronización; 4116 revoluciones o motor; 4220/4225 tensión de bus; 4230 protección del disipador; 4240 sobrecarga; 4250 sobrecorriente.

MITSUBISHI HEAVY INDUSTRIES: Los códigos E1-E31 suelen corresponder a la unidad interior y E32-E75 a la exterior. Ejemplos: E5 comunicación, E6 sensor del intercambiador, E8 protección por sobrecarga, E9 drenaje, E16 motor del ventilador, E30 desconexión interior-exterior, E40 alta presión, E57 parada de emergencia, E84 humedad alta y E85 protección antisarcha.

LG: El código aparece como CH seguido de números. CH01/CH02 sensor de tubería; CH03/E3 refrigerante; CH05/E0/CH53 comunicación; CH07 conflicto de modos; CH10 sensor de descarga; CH34 sobretemperatura o alta presión; CH38/F4 poco refrigerante; CH61 sobretemperatura del disipador; P2/FL drenaje de portátiles; E5 depósito de agua lleno. Tras reiniciar la alimentación cinco minutos, si reaparece requiere revisión.

SAMSUNG: Los códigos parpadean en el display de la unidad interior. E101/E102 comunicación; E121 sensor de ambiente; E122 sensor del intercambiador; E154 ventilador interior; E162/E163 EEPROM.

FUJITSU GENERAL: Cuenta los parpadeos de Operation y Timer. 11 comunicación; 24 número de unidades; 32 información de modelo; 35 botón Manual/Auto; 53 drenaje; 63 inverter; 64 PFC; 6A placa indicadora; 97 motor del ventilador exterior.

PANASONIC: Consulta el display del mando o Panasonic Comfort Cloud. H00 sin memoria de fallos; H11 comunicación; H12 capacidad no coincidente; H14 sensor de aspiración; H15 sensor del compresor; H16 transformador de corriente; H19 motor interior; H23/H24 sensores del intercambiador; F11 válvula de cuatro vías; F17 congelación; F90 PFC; F91 ciclo de refrigeración; F93 revoluciones del compresor; F94 temperatura de descarga; F95 alta presión; F96 módulo IPM; F97 compresor; F98 corriente total; F99 pico de corriente DC.

HAIER: E1 sensor interior; E2 sensor de tubería; E4 EEPROM interior; E5 anticongelación; E7 comunicación; E9 sobrecarga interior en calefacción; E14 motor interior; F1 IPM; F2 sobrecorriente del compresor; F3 comunicación de potencia; F4 temperatura de descarga; F6 ambiente exterior; F7 aspiración; F8 motor DC; F9 reinicio de módulo; F11 sincronismo; F12 EEPROM; F13 refrigerante; F14 válvula de cuatro vías; F19 sobretensión o subtensión; F20 alta presión; F21 batería exterior; F22 corriente AC; F23/F24/F25/F27/F28 compresor o sensores; F35 placa; F43 compatibilidad; FE fuga.

HITACHI: 01/02 unidad interior/exterior; 03/04/0A transmisión; 05 alimentación; 06 tensión; 07/08 ciclo de refrigeración; 0B/0C unidad exterior; 11/12 sensor interior; 19 motor; 31/35/36/38 sistema; 39 compresor; 3A/3B/3D unidad exterior; 43/44/45/47/48 protección; 51 sensor; 53/54 inverter.

TOSHIBA RAV-SM/RAV-SP: F01/F02 sensor TCJ/TC2; F04 sensor TD; F06/F12 sensores TE/TS; F07 sensor TL; F08 sensor TO exterior; F10 sensor TA; F23 sensor PS; F31 EEPROM exterior; L29 IPDU; L31 placa exterior; P01/P12 ventilador interior; P07 disipador; P15 sensor TD/TS; P19 válvula de cuatro vías; P20 sensor TL; P22 ventilador exterior; P26/P29 compresor; P31 placa interior.

GREE: E1 alta presión; E2 anticongelación; E4 temperatura de descarga; E5 sobrecorriente; E6 comunicación; E7 conflicto de modos; E9 agua en drenaje; F0 refrigerante insuficiente o fuga; F1 sensor de evaporador; F3 sensor exterior; H3 sobrecarga del compresor; H4 condensación alta; H5 IPM; U1 bus DC; U9 cruce por cero exterior.

MIDEA: E0 EEPROM interior; F2 sensor del condensador exterior; F3 sensor de descarga; F4 EEPROM exterior; F6 sensor T2b; P4 accionamiento del compresor. En equipos portátiles también pueden aparecer AS, CS, ES, OS, E, FC, LE, HI y LO.

HISENSE: E1 sensor de ambiente interior; E2 sensor de tubo interior; E3 sensor de tubo exterior; E5 nivel de agua alto; E6 motor superior; E7 motor inferior; EA comunicación. Hay varias familias, por lo que se debe verificar el manual.

CARRIER: En series 38GVM/40GVM aparecen 08, 0A, F0, F3, F4, F5, F7, E1, E2, E3, E4, E6, E7, E8, E9 y P0, pero el significado exacto depende de la serie y del modelo.
`;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleFromPath(path: string): string {
  const filename = path.split('/').pop()?.replace(/\.txt$/i, '') ?? 'Documento técnico';
  return filename.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function splitIntoChunks(text: string): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const paragraph of paragraphs) {
    if ((current.length + paragraph.length) > 1800 && current) {
      chunks.push(current);
      current = '';
    }
    current = current ? `${current}\n\n${paragraph}` : paragraph;
  }

  if (current) chunks.push(current);
  return chunks;
}

function buildKnowledgeChunks(): KnowledgeChunk[] {
  return [...Object.entries(rawDocuments), ['./Codigos_de_error_de_aire_acondicionado_por_marca.pdf', ERROR_CODES_PDF_GUIDE] as [string, string]].flatMap(([source, text]) => {
    const title = titleFromPath(source);
    const terms = normalize(title).split(' ').filter((term) => term.length > 3);

    return splitIntoChunks(text).map((chunk) => ({
      source,
      title,
      text,
      terms,
      chunk,
      normalizedChunk: normalize(chunk),
    }));
  });
}

const knowledgeChunks = buildKnowledgeChunks();

function scoreChunk(query: string, chunk: KnowledgeChunk): number {
  const normalizedQuery = normalize(query);
  const queryTerms = normalizedQuery.split(' ').filter((term) => term.length > 3);
  const matchingTerms = queryTerms.filter((term) => chunk.normalizedChunk.includes(term));
  const titleMatches = chunk.terms.filter((term) => normalizedQuery.includes(term));

  return matchingTerms.length * 2 + titleMatches.length * 3;
}

export function findTechnicalKnowledge(query: string): { title: string; excerpt: string } | null {
  if (knowledgeChunks.length === 0) return null;

  const best = knowledgeChunks
    .map((chunk) => ({ chunk, score: scoreChunk(query, chunk) }))
    .sort((a, b) => b.score - a.score)[0];

  if (!best || best.score < 4) return null;

  return {
    title: best.chunk.title,
    excerpt: best.chunk.chunk,
  };
}
