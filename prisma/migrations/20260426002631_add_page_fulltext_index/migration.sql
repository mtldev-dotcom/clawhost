-- This is an empty migration.
CREATE INDEX IF NOT EXISTS page_fulltext_idx
ON "Page" USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content::text, '')));