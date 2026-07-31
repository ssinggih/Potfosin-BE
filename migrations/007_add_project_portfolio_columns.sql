ALTER TABLE projects
  ADD COLUMN demo_url TEXT,
  ADD COLUMN key_features TEXT[],
  ADD COLUMN role VARCHAR(255),
  ADD COLUMN results TEXT,
  ADD COLUMN challenges TEXT;
