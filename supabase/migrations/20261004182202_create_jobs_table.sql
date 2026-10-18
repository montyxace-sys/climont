/*
# Create jobs table for work records

1. New Tables
- `jobs`
  - `id` (uuid, primary key)
  - `title` (text, not null) — short name of the job, e.g. "Instalación split Daikin"
  - `description` (text, not null) — details of the work performed
  - `client_name` (text, not null) — customer name
  - `client_phone` (text) — customer phone
  - `client_email` (text) — customer email
  - `address` (text) — work address
  - `city` (text) — city where the work is done
  - `status` (text, not null, default 'pendiente') — one of: pendiente, en_progreso, completado, cancelado
  - `priority` (text, not null, default 'normal') — one of: baja, normal, alta, urgente
  - `scheduled_date` (date) — when the work is planned
  - `completed_date` (date) — when the work was finished
  - `price` (numeric, default 0) — amount charged
  - `notes` (text) — internal notes
  - `is_active` (boolean, default true) — soft delete / archive
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `jobs`.
- Admin-only access (authenticated role) for all CRUD operations.
- No public/anon access — jobs contain sensitive client data.

3. Constraints
- status CHECK constraint: pendiente, en_progreso, completado, cancelado
- priority CHECK constraint: baja, normal, alta, urgente
- title length 3–200 characters
- description length 10–5000 characters
- price >= 0
*/

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  description text NOT NULL CHECK (char_length(description) >= 10 AND char_length(description) <= 5000),
  client_name text NOT NULL CHECK (char_length(client_name) >= 2 AND char_length(client_name) <= 200),
  client_phone text,
  client_email text,
  address text,
  city text,
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_progreso', 'completado', 'cancelado')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('baja', 'normal', 'alta', 'urgente')),
  scheduled_date date,
  completed_date date,
  price numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_jobs" ON jobs;
CREATE POLICY "authenticated_select_jobs"
ON jobs FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_insert_jobs" ON jobs;
CREATE POLICY "authenticated_insert_jobs"
ON jobs FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_jobs" ON jobs;
CREATE POLICY "authenticated_update_jobs"
ON jobs FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_jobs" ON jobs;
CREATE POLICY "authenticated_delete_jobs"
ON jobs FOR DELETE
TO authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);