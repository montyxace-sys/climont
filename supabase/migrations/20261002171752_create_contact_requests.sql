/*
# Create contact_requests table (single-tenant, no auth)

1. New Tables
- `contact_requests`
  - `id` (uuid, primary key)
  - `name` (text, not null) — full name of the person requesting the quote
  - `email` (text, not null) — contact email
  - `phone` (text, not null) — contact phone number
  - `service_type` (text, not null) — type of service requested (instalacion, mantenimiento, reparacion, ventilacion, eficiencia, emergencia)
  - `message` (text) — optional additional details
  - `status` (text, default 'pendiente') — request status for internal tracking
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `contact_requests`.
- Allow anon + authenticated INSERT only (public can submit forms but cannot read/modify).
- No SELECT/UPDATE/DELETE policies for anon — data is private to the business owner.

3. Notes
- This is a single-tenant public contact form with no sign-in flow.
- Only INSERT is allowed for the public; all other operations are denied by default (no policy = no access under RLS).
*/

CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  service_type text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_contact_requests" ON contact_requests;
CREATE POLICY "anon_insert_contact_requests"
ON contact_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);
