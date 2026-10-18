/*
# Create chatbot_unanswered_queries table

1. Purpose
- The chatbot is a rule-based assistant. When a visitor asks something it
  cannot match against its known patterns, it falls back to a generic
  "I didn't understand" message. To let the bot "learn" from real
  conversations, we store every unanswered question here so the team can
  review them later and add new response patterns.
- The admin panel will show these queries in a dedicated tab so the team
  can see exactly what visitors are asking and which questions keep going
  unanswered.

2. New Tables
- `chatbot_unanswered_queries`
  - `id` (uuid, primary key)
  - `query` (text, not null) – the visitor's exact message
  - `normalized_query` (text, not null) – lowercased, accent-stripped version
    used for grouping/deduplication
  - `response_given` (text, nullable) – the fallback text the bot replied with
  - `times_asked` (int, default 1) – how many times this exact normalized
    question has been asked (incremented on duplicates)
  - `resolved` (boolean, default false) – lets the team mark a query as
    "handled" once they have added a new pattern for it
  - `created_at` (timestamptz, default now())
  - `last_asked_at` (timestamptz, default now()) – updated on each repeat

3. Security
- Enable RLS on `chatbot_unanswered_queries`.
- INSERT: TO anon, authenticated – the chatbot runs on the public site with
  the anon key, so visitors (unauthenticated) must be able to insert their
  unanswered questions.
- SELECT/UPDATE/DELETE: TO authenticated only – only logged-in admin users
  can review, mark resolved, or delete queries.
*/

CREATE TABLE IF NOT EXISTS chatbot_unanswered_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  normalized_query text NOT NULL,
  response_given text,
  times_asked int NOT NULL DEFAULT 1,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_asked_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chatbot_unanswered_queries ENABLE ROW LEVEL SECURITY;

-- Index for fast grouping by normalized text
CREATE INDEX IF NOT EXISTS idx_chatbot_unanswered_normalized
  ON chatbot_unanswered_queries (normalized_query);

-- Index for admin sorting by most recent
CREATE INDEX IF NOT EXISTS idx_chatbot_unanswered_last_asked
  ON chatbot_unanswered_queries (last_asked_at DESC);

DROP POLICY IF EXISTS "anon_insert_unanswered_queries" ON chatbot_unanswered_queries;
CREATE POLICY "anon_insert_unanswered_queries"
ON chatbot_unanswered_queries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_unanswered_queries" ON chatbot_unanswered_queries;
CREATE POLICY "auth_select_unanswered_queries"
ON chatbot_unanswered_queries FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "auth_update_unanswered_queries" ON chatbot_unanswered_queries;
CREATE POLICY "auth_update_unanswered_queries"
ON chatbot_unanswered_queries FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_unanswered_queries" ON chatbot_unanswered_queries;
CREATE POLICY "auth_delete_unanswered_queries"
ON chatbot_unanswered_queries FOR DELETE
TO authenticated
USING (true);
