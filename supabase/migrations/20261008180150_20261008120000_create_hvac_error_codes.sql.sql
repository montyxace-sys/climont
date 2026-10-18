/*
# Create HVAC error code library

1. New Tables
- `hvac_error_codes` stores the professional HVAC error-code reference from the supplied PDF.
- `brand` identifies the manufacturer or family.
- `code` stores the displayed error code.
- `category` stores the technical category.
- `meaning` stores the manufacturer-linked explanation.
- `level` stores the practical attention level.
- `source_version` identifies the reference edition.
- `sort_order` preserves the source order.
- `is_active` controls public visibility.
- `created_at` and `updated_at` record maintenance dates.

2. Security
- Row level security is enabled.
- Visitors and signed-in users can read active records.
- Signed-in users can create, update, and delete records for administration.
- The public page only queries active rows.

3. Important Notes
- This is a shared professional reference, not a diagnostic authorization.
- Manufacturer documentation and the exact model must always be verified before repair.
*/

CREATE TABLE IF NOT EXISTS public.hvac_error_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL CHECK (char_length(brand) BETWEEN 2 AND 80),
  code text NOT NULL CHECK (char_length(code) BETWEEN 1 AND 40),
  category text NOT NULL CHECK (char_length(category) BETWEEN 2 AND 120),
  meaning text NOT NULL CHECK (char_length(meaning) BETWEEN 3 AND 500),
  level text NOT NULL DEFAULT 'Técnico' CHECK (level IN ('Técnico', 'Usuario')),
  source_version text NOT NULL DEFAULT 'Biblioteca HVAC multimarca V2',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand, code)
);

CREATE INDEX IF NOT EXISTS hvac_error_codes_brand_idx ON public.hvac_error_codes (brand, sort_order, code);
CREATE INDEX IF NOT EXISTS hvac_error_codes_active_idx ON public.hvac_error_codes (is_active, brand);

ALTER TABLE public.hvac_error_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active HVAC error codes" ON public.hvac_error_codes;
CREATE POLICY "Public can read active HVAC error codes"
ON public.hvac_error_codes FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Signed-in users can insert HVAC error codes" ON public.hvac_error_codes;
CREATE POLICY "Signed-in users can insert HVAC error codes"
ON public.hvac_error_codes FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Signed-in users can update HVAC error codes" ON public.hvac_error_codes;
CREATE POLICY "Signed-in users can update HVAC error codes"
ON public.hvac_error_codes FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Signed-in users can delete HVAC error codes" ON public.hvac_error_codes;
CREATE POLICY "Signed-in users can delete HVAC error codes"
ON public.hvac_error_codes FOR DELETE
TO authenticated
USING (true);

INSERT INTO public.hvac_error_codes (brand, code, category, meaning, level, sort_order)
VALUES
('AUX','E0','Protección','Protección contra sobrecorriente de unidad interior','Técnico',1),
('AUX','E1','Sensor','Error del sensor de ambiente interior','Técnico',2),
('AUX','E2','Sensor','Error del sensor de condensador exterior','Técnico',3),
('AUX','E3','Sensor','Error del sensor del serpentín evaporador interior','Técnico',4),
('AUX','E4','Motor','Error del motor AC/DC','Técnico',5),
('AUX','E5','Comunicación','Error de comunicación unidad interior/exterior','Técnico',6),
('AUX','E8','Comunicación','Fallo entre placa de display y PCB','Técnico',7),
('AUX','F0','Ventilación','Error del motor del ventilador exterior','Técnico',8),
('AUX','F1','Inverter','Protección del módulo exterior','Técnico',9),
('AUX','F2','Inverter','Protección PFC','Técnico',10),
('AUX','F3','Compresor','Fallo de arranque o pérdida de sincronismo','Técnico',11),
('AUX','P2','Presión','Protección del interruptor de alta presión','Técnico',12),
('AUX','P3','Refrigerante','Protección por falta de refrigerante','Técnico',13),
('AUX','P4','Protección','Protección por sobrecarga del condensador','Técnico',14),
('AUX','P5','Temperatura','Protección de temperatura de descarga','Técnico',15),
('AUX','P6','Protección','Protección por sobrecarga del evaporador','Técnico',16),
('AUX','P7','Protección','Protección anticongelación interior','Técnico',17),
('AUX','P8','Eléctrico','Protección contra sobrecorriente exterior','Técnico',18),
('Bosch','E0','Electrónica','Error EEPROM interior','Técnico',19),
('Bosch','E1','Comunicación','Fallo de comunicación entre unidad interior y exterior','Técnico',20),
('Bosch','E4','Sensor','Error del sensor de temperatura ambiente','Técnico',21),
('Bosch','EC','Refrigerante','Fallo del sistema de detección de fuga','Técnico',22),
('Carrier','E0','Agua','Fallo del interruptor de flujo de agua','Técnico',23),
('Carrier','E1','Comunicación','Fallo de comunicación entre placas IDU y ODU','Técnico',24),
('Daikin','U0','Refrigerante','Falta de refrigerante','Técnico',25),
('Daikin','U2','Alimentación/electrónica','Caída de tensión o sobretensión del circuito principal','Técnico',26),
('Daikin','U4','Comunicación','Fallo de transmisión entre unidad interior y exterior','Técnico',27),
('Daikin','A1','Electrónica','Defecto de PCB interior','Técnico',28),
('Daikin','A5','Protección','Control de alta presión o protección contra congelación interior','Técnico',29),
('Daikin','A6','Ventilación','Fallo del motor del ventilador','Técnico',30),
('Fujitsu General','E:EE','Autodiagnóstico','Indica que se ha detectado un error y activa el diagnóstico','Técnico',31),
('Fujitsu General','7-3','Sensor','Sensor de temperatura del intercambiador exterior / salida de líquido','Técnico',32),
('GREE','C5','Configuración','Fallo del jumper/capuchón de configuración','Técnico',33),
('GREE','E1','Presión','Protección de alta presión del sistema','Técnico',34),
('GREE','E2','Protección','Protección contra congelación del serpentín interior','Técnico',35),
('Haier','E7','Comunicación','Fallo de comunicación entre unidades interior y exterior','Técnico',36),
('Haier','E1','Sensor','Fallo del sensor de temperatura interior','Técnico',37),
('Haier','E2','Sensor','Fallo del sensor de temperatura de tubería','Técnico',38),
('Haier','E4','Electrónica','Fallo EEPROM interior','Técnico',39),
('LG','CH05','Comunicación','Problema de comunicación entre unidades interior y exterior','Técnico',40),
('LG','CH38','Refrigerante/compresor','Indicación relacionada con bajo refrigerante o problema del compresor','Técnico',41),
('LG','CH90','Instalación','Prueba de funcionamiento incompleta o condición anómala durante la prueba','Técnico',42),
('Midea','E0','Electrónica','Error de EEPROM interior','Técnico',43),
('Midea','E1','Comunicación','Error de comunicación interior/exterior','Técnico',44),
('Midea','E4','Sensor','Error del sensor de temperatura ambiente','Técnico',45),
('Midea','E5','Sensor','Error del sensor de temperatura del evaporador','Técnico',46),
('Panasonic','H00','Estado','Sin memoria de fallo','Técnico',47),
('Panasonic','H11','Comunicación','Comunicación anómala interior/exterior','Técnico',48),
('Panasonic','H16','Eléctrico','Anomalía del transformador de corriente exterior','Técnico',49),
('Samsung','CF','Mantenimiento','Recordatorio de limpieza del filtro','Usuario',50),
('Samsung','CI','Función','Limpieza automática en curso','Usuario',51),
('Samsung','E1/21','Sensor','Fallo del sensor de temperatura','Técnico',52),
('Samsung','E5','Sensor','Cortocircuito o circuito abierto del sensor del intercambiador interior','Técnico',53),
('Trane','E1','Sensor','Fallo del sensor de temperatura ambiente interior','Técnico',54),
('Trane','E2','Sensor','Fallo del sensor del intercambiador de calor','Técnico',55),
('Trane','E7','Comunicación','Fallo de comunicación entre unidades interior y exterior','Técnico',56)
ON CONFLICT (brand, code) DO UPDATE SET
  category = EXCLUDED.category,
  meaning = EXCLUDED.meaning,
  level = EXCLUDED.level,
  source_version = EXCLUDED.source_version,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  updated_at = now();