CREATE TYPE team_type AS ENUM ('solo', 'team');
CREATE TYPE project_status AS ENUM ('complete', 'progress', 'paused');

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  team_type team_type NOT NULL,
  github_link TEXT,
  design_link TEXT,
  status project_status NOT NULL DEFAULT 'progress',
  experience TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner ON projects(owner_id);
