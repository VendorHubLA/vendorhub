export type UserRole = 'owner' | 'asset_manager' | 'pm' | 'vendor' | 'admin'

export type ProjectStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled'

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'approved' | 'disputed'

export type ComplianceDocType = 'coi' | 'license' | 'w9' | 'bond' | 'other'

export type ComplianceStatus = 'valid' | 'expiring_soon' | 'expired' | 'missing'

export type VendorStatus = 'pending' | 'vetted' | 'suspended'

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string
  created_at: string
}

export interface Profile {
  id: string
  org_id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface Property {
  id: string
  org_id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  property_type: string
  square_footage?: number
  created_at: string
}

export interface Vendor {
  id: string
  org_id: string
  company_name: string
  contact_name: string
  email: string
  phone?: string
  trade_categories: string[]
  service_areas: string[]
  status: VendorStatus
  score?: number
  stripe_account_id?: string
  created_at: string
}

export interface VendorScore {
  id: string
  vendor_id: string
  response_time_score: number
  budget_adherence_score: number
  quality_score: number
  completion_rate_score: number
  overall_score: number
  total_projects: number
  updated_at: string
}

export interface Project {
  id: string
  org_id: string
  property_id: string
  vendor_id?: string
  title: string
  description: string
  status: ProjectStatus
  budget?: number
  spent?: number
  start_date?: string
  due_date?: string
  created_by: string
  created_at: string
  property?: Property
  vendor?: Vendor
}

export interface Milestone {
  id: string
  project_id: string
  title: string
  description?: string
  status: MilestoneStatus
  amount?: number
  due_date?: string
  completed_at?: string
  payment_released_at?: string
  created_at: string
}

export interface ProjectThread {
  id: string
  project_id: string
  author_id: string
  body: string
  attachments?: ThreadAttachment[]
  created_at: string
  author?: Profile
}

export interface ThreadAttachment {
  name: string
  url: string
  type: string
  size: number
}

export interface ComplianceDoc {
  id: string
  vendor_id: string
  org_id: string
  doc_type: ComplianceDocType
  file_name: string
  file_url: string
  expiry_date?: string
  status: ComplianceStatus
  uploaded_at: string
}

export interface RFP {
  id: string
  project_id: string
  org_id: string
  scope: string
  deliverables: string[]
  timeline_estimate: string
  budget_range?: string
  ai_generated: boolean
  created_at: string
}
