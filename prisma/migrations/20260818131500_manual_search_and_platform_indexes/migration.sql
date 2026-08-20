CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS applications_company_trgm_idx
  ON applications USING gin (company_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS applications_title_trgm_idx
  ON applications USING gin (job_title gin_trgm_ops);

CREATE UNIQUE INDEX IF NOT EXISTS platforms_global_slug_key
  ON platforms (slug) WHERE user_id IS NULL;
