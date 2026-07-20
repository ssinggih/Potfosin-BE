ALTER TABLE projects
  ADD COLUMN start_date DATE,
  ADD COLUMN end_date DATE,
  ADD COLUMN priority INTEGER NOT NULL DEFAULT 50 CHECK (priority >= 1 AND priority <= 100);

CREATE INDEX idx_projects_priority ON projects(priority DESC);
