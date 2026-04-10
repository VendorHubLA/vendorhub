-- VendorHub Initial Schema
-- Run this in your Supabase SQL editor after creating a new project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- ORGANIZATIONS
-- ─────────────────────────────────────────
CREATE TABLE organizations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  logo_url   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL CHECK (role IN ('owner','asset_manager','pm','vendor','admin')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PROPERTIES
-- ─────────────────────────────────────────
CREATE TABLE properties (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  address        TEXT NOT NULL,
  city           TEXT NOT NULL,
  state          TEXT NOT NULL,
  zip            TEXT NOT NULL,
  property_type  TEXT NOT NULL DEFAULT 'commercial',
  square_footage INTEGER,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- VENDORS
-- ─────────────────────────────────────────
CREATE TABLE vendors (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_name        TEXT NOT NULL,
  contact_name        TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT,
  trade_categories    TEXT[] DEFAULT '{}',
  service_areas       TEXT[] DEFAULT '{}',
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','vetted','suspended')),
  stripe_account_id   TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- VENDOR SCORES
-- ─────────────────────────────────────────
CREATE TABLE vendor_scores (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id               UUID UNIQUE NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  response_time_score     NUMERIC(4,1) DEFAULT 0,
  budget_adherence_score  NUMERIC(4,1) DEFAULT 0,
  quality_score           NUMERIC(4,1) DEFAULT 0,
  completion_rate_score   NUMERIC(4,1) DEFAULT 0,
  overall_score           NUMERIC(4,1) GENERATED ALWAYS AS (
    (response_time_score + budget_adherence_score + quality_score + completion_rate_score) / 4
  ) STORED,
  total_projects          INTEGER DEFAULT 0,
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────
CREATE TABLE projects (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id  UUID NOT NULL REFERENCES properties(id),
  vendor_id    UUID REFERENCES vendors(id),
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','on_hold','completed','cancelled')),
  budget       NUMERIC(12,2),
  spent        NUMERIC(12,2) DEFAULT 0,
  start_date   DATE,
  due_date     DATE,
  created_by   UUID NOT NULL REFERENCES profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- MILESTONES
-- ─────────────────────────────────────────
CREATE TABLE milestones (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','approved','disputed')),
  amount              NUMERIC(12,2),
  due_date            DATE,
  completed_at        TIMESTAMPTZ,
  payment_released_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PROJECT THREADS (messages)
-- ─────────────────────────────────────────
CREATE TABLE project_threads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES profiles(id),
  body        TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- COMPLIANCE DOCS
-- ─────────────────────────────────────────
CREATE TABLE compliance_docs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id    UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  doc_type     TEXT NOT NULL CHECK (doc_type IN ('coi','license','w9','bond','other')),
  file_name    TEXT NOT NULL,
  file_url     TEXT NOT NULL,
  expiry_date  DATE,
  status       TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid','expiring_soon','expired','missing')),
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- RFPs
-- ─────────────────────────────────────────
CREATE TABLE rfps (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  scope            TEXT NOT NULL,
  deliverables     TEXT[] DEFAULT '{}',
  timeline_estimate TEXT,
  budget_range     TEXT,
  ai_generated     BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
ALTER TABLE organizations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_scores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_threads   ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_docs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfps               ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's org_id
CREATE OR REPLACE FUNCTION auth_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: users can read their own org's profiles
CREATE POLICY "org_read_profiles" ON profiles
  FOR SELECT USING (org_id = auth_org_id());

CREATE POLICY "own_profile_write" ON profiles
  FOR ALL USING (id = auth.uid());

-- Properties: org-scoped
CREATE POLICY "org_properties" ON properties
  FOR ALL USING (org_id = auth_org_id());

-- Vendors: org-scoped
CREATE POLICY "org_vendors" ON vendors
  FOR ALL USING (org_id = auth_org_id());

-- Vendor scores: org-scoped via vendor
CREATE POLICY "org_vendor_scores" ON vendor_scores
  FOR SELECT USING (
    vendor_id IN (SELECT id FROM vendors WHERE org_id = auth_org_id())
  );

-- Projects: org-scoped
CREATE POLICY "org_projects" ON projects
  FOR ALL USING (org_id = auth_org_id());

-- Milestones: via project org
CREATE POLICY "org_milestones" ON milestones
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE org_id = auth_org_id())
  );

-- Threads: via project org
CREATE POLICY "org_threads" ON project_threads
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE org_id = auth_org_id())
  );

-- Compliance: org-scoped
CREATE POLICY "org_compliance" ON compliance_docs
  FOR ALL USING (org_id = auth_org_id());

-- RFPs: org-scoped
CREATE POLICY "org_rfps" ON rfps
  FOR ALL USING (org_id = auth_org_id());

-- ─────────────────────────────────────────
-- AUTO-CREATE PROFILE ON SIGNUP
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, org_id, email, full_name, role)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'org_id')::UUID,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'pm')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX idx_profiles_org ON profiles(org_id);
CREATE INDEX idx_properties_org ON properties(org_id);
CREATE INDEX idx_vendors_org ON vendors(org_id);
CREATE INDEX idx_projects_org ON projects(org_id);
CREATE INDEX idx_projects_property ON projects(property_id);
CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_threads_project ON project_threads(project_id);
CREATE INDEX idx_compliance_vendor ON compliance_docs(vendor_id);
CREATE INDEX idx_compliance_expiry ON compliance_docs(expiry_date);
