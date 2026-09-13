ALTER TABLE projects
  ADD COLUMN location text NOT NULL DEFAULT '',
  ADD COLUMN year text NOT NULL DEFAULT '',
  ADD COLUMN kind text NOT NULL DEFAULT 'residence';
