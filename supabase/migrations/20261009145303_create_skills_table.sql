/*
# Create bolt_skills table

1. New Tables
- `bolt_skills`
- `id` (uuid, primary key)
- `skill_name` (text, unique, not null) — nombre del skill en minúsculas con guiones
- `content` (text, not null) — contenido completo del SKILL.md
- `created_at` (timestamp)
- `updated_at` (timestamp)
2. Security
- Enable RLS on `bolt_skills`.
- Allow anon + authenticated CRUD because skills are project-level configuration shared across sessions.
*/

CREATE TABLE IF NOT EXISTS bolt_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name text UNIQUE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bolt_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bolt_skills" ON bolt_skills;
CREATE POLICY "anon_select_bolt_skills" ON bolt_skills FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bolt_skills" ON bolt_skills;
CREATE POLICY "anon_insert_bolt_skills" ON bolt_skills FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bolt_skills" ON bolt_skills;
CREATE POLICY "anon_update_bolt_skills" ON bolt_skills FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bolt_skills" ON bolt_skills;
CREATE POLICY "anon_delete_bolt_skills" ON bolt_skills FOR DELETE
  TO anon, authenticated USING (true);
