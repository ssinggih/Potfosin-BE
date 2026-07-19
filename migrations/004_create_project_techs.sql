CREATE TABLE IF NOT EXISTS project_techs (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tech_id UUID REFERENCES techs(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tech_id)
);

CREATE INDEX idx_project_techs_project ON project_techs(project_id);
CREATE INDEX idx_project_techs_tech ON project_techs(tech_id);
