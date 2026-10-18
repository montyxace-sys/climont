-- The contact form sends 'venta_instalacion' and 'solar-termica' which were
-- not in the CHECK constraint, causing inserts to fail.
-- Drop and recreate the constraint to match the form's SERVICE_OPTIONS exactly.

ALTER TABLE public.contact_requests
  DROP CONSTRAINT IF EXISTS contact_requests_service_type_check;

ALTER TABLE public.contact_requests
  ADD CONSTRAINT contact_requests_service_type_check
  CHECK (service_type IN (
    'instalacion', 'venta_instalacion', 'mantenimiento', 'reparacion',
    'ventilacion', 'eficiencia', 'airzone', 'aerotermia',
    'solar-termica', 'constructoras', 'emergencia', 'solar'
  ));
