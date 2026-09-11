ALTER TABLE projects ADD COLUMN IF NOT EXISTS publish_at timestamptz;

CREATE INDEX IF NOT EXISTS projects_scheduled_publish_idx
  ON projects (publish_at)
  WHERE status = 'scheduled';
