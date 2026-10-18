/*
# Add PUE (Junta de Andalucia) fields to jobs table

1. Modified Tables
- `jobs`
  - `pue_required` (boolean, default false) — whether this job needs PUE registration
  - `pue_status` (text, default 'no_registrado') — one of: no_registrado, pendiente, registrado
  - `pue_registration_number` (text) — PUE registration number once obtained
  - `pue_registered_date` (date) — date the PUE was registered
  - `equipment_brand` (text) — brand of installed equipment (Daikin, Mitsubishi, etc.)
  - `equipment_model` (text) — model of installed equipment
  - `equipment_serial` (text) — serial number of installed equipment
  - `equipment_power_kw` (numeric) — power in kW
  - `equipment_type` (text) — type: split, conductos, cassette, aerotermia, etc.

2. Security
- No changes to existing RLS policies. All new columns inherit the same authenticated-only access.

3. Notes
- These fields allow tracking which installed equipment needs to be registered in the PUE system of Junta de Andalucia.
- The PUE tab in the admin panel will filter jobs where pue_required = true and manage their registration status.
*/

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS pue_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pue_status text NOT NULL DEFAULT 'no_registrado' CHECK (pue_status IN ('no_registrado', 'pendiente', 'registrado')),
  ADD COLUMN IF NOT EXISTS pue_registration_number text,
  ADD COLUMN IF NOT EXISTS pue_registered_date date,
  ADD COLUMN IF NOT EXISTS equipment_brand text,
  ADD COLUMN IF NOT EXISTS equipment_model text,
  ADD COLUMN IF NOT EXISTS equipment_serial text,
  ADD COLUMN IF NOT EXISTS equipment_power_kw numeric(10,2),
  ADD COLUMN IF NOT EXISTS equipment_type text;

CREATE INDEX IF NOT EXISTS idx_jobs_pue_required ON jobs(pue_required) WHERE pue_required = true;
CREATE INDEX IF NOT EXISTS idx_jobs_pue_status ON jobs(pue_status);