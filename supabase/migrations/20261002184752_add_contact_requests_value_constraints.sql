/*
  # Validate service_type and installation_type server-side

  1. Security
  - Restrict `service_type` to the seven options the contact form offers and
    `installation_type` to the ten options it offers (or NULL, since it is optional).
  - These value lists previously existed only as the browser's dropdown options, which
    constrain the UI but not the public insert endpoint.

  2. Notes
  - Values mirror src/components/Contact.tsx SERVICE_OPTIONS and INSTALLATION_TYPES exactly.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'contact_requests_service_type_check'
      AND conrelid = 'public.contact_requests'::regclass
  ) THEN
    ALTER TABLE public.contact_requests
      ADD CONSTRAINT contact_requests_service_type_check
      CHECK (service_type IN (
        'instalacion', 'mantenimiento', 'reparacion', 'ventilacion',
        'eficiencia', 'airzone', 'constructoras', 'emergencia', 'aerotermia', 'solar'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'contact_requests_installation_type_check'
      AND conrelid = 'public.contact_requests'::regclass
  ) THEN
    ALTER TABLE public.contact_requests
      ADD CONSTRAINT contact_requests_installation_type_check
      CHECK (installation_type IS NULL OR installation_type IN (
        'splits_pared', 'conductos', 'cassettes', 'suelo_techo',
        'fabricacion_conductos', 'preinstalacion_obra', 'instalacion_obra',
        'ventilacion_viviendas', 'ventilacion_garajes', 'airzone'
      ));
  END IF;
END $$;
