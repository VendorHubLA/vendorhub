# VendorHub

AI-native vendor management OS for commercial real estate teams.

**Stack:** Next.js 16 (App Router) · Supabase (Auth + Postgres + Realtime + Storage) · Tailwind v4 · shadcn/ui · Recharts · Claude API · Resend · Stripe Connect

---

## Routes

### Public (Marketing)
| Route | Description |
|-------|-------------|
| `/home` | Marketing landing page — hero, features, pricing, contact form |
| `/login` | Email + password sign-in |
| `/signup` | Redirect / request access |

### Dashboard (auth-gated)
| Route | Description |
|-------|-------------|
| `/dashboard` | KPI overview + recent projects |
| `/properties` | Portfolio property grid with spend bars |
| `/properties/new` | Add a new property |
| `/properties/[id]` | Property detail + linked projects |
| `/vendors` | Vendor registry with score rings |
| `/vendors/new` | Add vendor with trade categories |
| `/vendors/[id]` | Vendor detail, scores, compliance, projects |
| `/projects` | Projects grouped by status |
| `/projects/new` | Create project with milestone rows |
| `/projects/[id]` | Project detail, thread, timeline, AI RFP |
| `/compliance` | Compliance docs grouped by status |
| `/compliance/upload` | Upload a compliance doc to Supabase Storage |
| `/portfolio` | Portfolio-wide KPIs + 4 Recharts charts (owner/AM/admin only) |
| `/settings` | Profile + organization settings |

### API
| Route | Description |
|-------|-------------|
| `POST /api/copilot` | Streaming Claude AI copilot |
| `POST /api/projects/[id]/rfp` | Generate + save AI RFP |
| `GET/POST /api/projects/[id]/threads` | Fetch/post project messages |
| `POST /api/vendors/[id]/vet` | Mark vendor as vetted |
| `POST /auth/signout` | Sign out + redirect to /login |

---

## Components (`components/vh/`)
- `VHSidebar` — role-aware nav, mobile drawer on small screens
- `VHBadge` — status chips for project/compliance/vendor/milestone statuses
- `VHScoreRing` — SVG circular score ring (gold ≥80, green ≥60, amber ≥40)
- `VHTimeline` — milestone timeline with date-fns
- `VHCommandBar` — ⌘K AI copilot overlay with streaming
- `VHComplianceRow` — compliance doc row with live expiry days
- `ProjectThread` — Supabase Realtime live chat
- `PortfolioCharts` — 4-panel Recharts dashboard

---

## Data Model (Supabase)
`organizations` → `profiles` → `properties` → `projects` → `milestones`  
`vendors` → `vendor_scores` · `compliance_docs`  
`project_threads` · `rfps`

RLS enabled on all tables. Helper functions: `auth_org_id()`, `auth_role()`.

---

## RBAC
| Role | Access |
|------|--------|
| `owner` | Full access including Portfolio, Settings org edit |
| `asset_manager` | Full access excluding admin actions |
| `pm` | Properties, Vendors, Projects, Compliance, Settings |
| `vendor` | Dashboard, Projects (assigned), Settings |
| `admin` | Full access |

---

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase, Anthropic, Resend keys
node scripts/migrate.mjs     # run DB migration
npm run dev
```

### Required .env.local keys
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

### One-time Supabase setup
1. Create `compliance-docs` storage bucket (public or signed URLs)
2. Enable Realtime on `project_threads` table

---

## Deployment

Repo: `github.com/VendorHubLA/vendorhub`  
Target: `vercel.com/vendorhubla/vendorhub` — connect GitHub repo in Vercel settings to enable auto-deploy on push.
