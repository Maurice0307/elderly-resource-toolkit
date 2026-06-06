# Elderly Resource Toolkit — Comprehensive Project Overview

**Project Root:** `c:\Users\Morris\VS Code\My Project\flagship-project\elderly-resource-toolkit`

**Last Updated:** May 27, 2026

---

## 1. Technology Stack & Architecture

### Frontend
- **Framework:** Next.js 16.2.4 (App Router)
- **Rendering:** Server-side rendering (RSC + Server Actions)
- **Styling:** Tailwind CSS 4, PostCSS
- **UI Components:** Custom React components (19.2.4)
- **Type System:** TypeScript 5
- **Linting:** ESLint 9

### Backend
- **Framework:** Next.js API Routes & Route Handlers
- **Authentication:** Supabase Auth (OAuth + Email)
- **Database:** PostgreSQL via Supabase
- **ORM/Querying:** Supabase JavaScript SDK (`@supabase/ssr`, `@supabase/supabase-js`)
- **Admin Operations:** Server Role Key (restricted to backend)

### Third-Party Integrations
- **LINE Integration:** `@line/liff` (2.28.0) for LINE Mini App embedding
- **AI:** `@anthropic-ai/sdk` (Claude for content summarization)
- **Utilities:** html-to-image (1.11.13) for card generation

### DevOps
- **Database Migrations:** Supabase migrations (SQL-based, numbered 0001-0007)
- **Deployment:** Vercel (Next.js optimized)
- **Environment:** Node.js runtime with DNS fallback mock client

---

## 2. Data Models & Schemas

### 2.1 Core Entity Models

#### **Resource** (醫療資源)
**Primary Table:** `public.resources` (migration 0003)

```sql
- id (UUID, PK)
- subcategory_id (UUID, FK → subcategories)
- scope ('national' | 'local')
- region_id (UUID, FK → regions, nullable for national)
- name, summary, description (text)
- phone, phone_hint, address (text, nullable)
- latitude, longitude (numeric)
- website_url (text, nullable)
- hours (JSONB, nullable) — operating hours
- identity_tags (text[]) — target demographics
- tags (text[]) — searchable keywords
- source_url, source_org (text, nullable)
- like_count, view_count (int)
- status ('active' | 'pending' | 'ended' | 'archived')
- submitted_by (FK → profiles)
- approved_by, approved_at (FK → profiles, timestamptz)
- created_at, updated_at (timestamptz)
```

**Related Tables:**
- `resource_likes` — User likes (many-to-many, triggers like_count update)
- `resource_feedback` — User ratings (1-5) and comments
- `resource_reports` — Service ended / wrong info reports (status: open/resolved/rejected)

**TypeScript Model** ([src/types/domain.ts](src/types/domain.ts)):
```typescript
export type Resource = {
  id, name, summary, description, scope, region_id, subcategory_id,
  phone, phone_hint, address, latitude, longitude, website_url,
  hours, identity_tags, tags, source_url, source_org,
  like_count, view_count, status, created_at, updated_at
};
```

---

#### **Activity Card** (互動圖卡)
**Primary Table:** `public.activity_cards` (migration 0004, extended in 0007)

```sql
- id (UUID, PK)
- group_slug ('move' | 'create' | 'smart' | 'health' | 'life')
- slug (text, unique)
- title, summary (text)
- cover_emoji, cover_image_url, hero_image_url (text, nullable)
- video_url, video_provider ('youtube' | 'vimeo' | 'self' | 'none')
- source_url, source_org (text, nullable)
- duration_min (int, nullable)
- identity_tags (text[]) — 'elder', 'family', 'volunteer'
- steps (JSONB) — [{order, title, description, tip?, image_url?, video_url?, video_start?}]
- tags (text[])
- like_count (int)
- status ('active' | 'draft' | 'archived')
- created_by (FK → profiles)
- created_at, updated_at (timestamptz)
```

**TypeScript Model:**
```typescript
export type ActivityStep = {
  order, title, description, tip?, image_url?, video_url?, video_start?
};
export type ActivityCard = {
  id, group_slug, slug, title, summary, cover_emoji, cover_image_url,
  hero_image_url, video_url, video_provider, source_url, source_org,
  duration_min, identity_tags, steps, tags, like_count, status, created_at
};
```

---

#### **Communication Script** (溝通錦囊)
**Primary Table:** `public.communication_scripts` (migration 0004)

```sql
- id (UUID, PK)
- audience ('volunteer' | 'family' | 'difficult')
- slug (text, unique)
- title, context (text)
- ok_examples, ng_examples (JSONB) — [{role, text, reason?}]
- tips (text[])
- tags (text[])
- like_count (int)
- status ('active' | 'draft' | 'archived')
- created_by (FK → profiles)
- created_at, updated_at (timestamptz)
```

---

#### **Daily News** (每日新知)
**Primary Table:** `public.daily_news` (migration 0007)

```sql
- id (UUID, PK)
- source_org, source_url (text) — e.g., "幸福熟齡"
- title, summary_md (text) — LLM-rewritten elderly-friendly bullets
- image_url (text, nullable) — og:image
- tags (text[])
- published_at, fetched_at (timestamptz)
- status ('active' | 'hidden' | 'draft')
- created_at (timestamptz)
```

---

#### **Community Submission** (社群投稿)
**Primary Table:** `public.community_submissions` (migration 0007)

```sql
- id (UUID, PK)
- type ('activity' | 'script')
- title (text)
- payload (JSONB) — full draft: {summary, steps[], tips[], ...}
- source_url, contact (text, nullable)
- submitted_by (FK → profiles)
- status ('pending' | 'approved' | 'rejected' | 'needs_more_info')
- review_notes (text, nullable)
- reviewed_by (FK → profiles)
- reviewed_at (timestamptz)
- created_at, updated_at (timestamptz)
```

---

#### **Q&A System** (社群提問)
**Tables:** `questions`, `answers`, `answer_votes` (migration 0006)

```sql
questions:
- id (UUID, PK)
- user_id (FK → profiles)
- region_id (FK → regions, nullable)
- title, body (text)
- tags (text[])
- status ('open' | 'resolved' | 'hidden')
- answer_count, view_count (int)
- accepted_answer_id (UUID, nullable)
- created_at, updated_at

answers:
- id (UUID, PK)
- question_id (FK → questions)
- user_id (FK → profiles)
- body (text)
- vote_count (int)
- is_accepted (boolean)
- created_at, updated_at

answer_votes:
- answer_id, user_id (composite PK)
- created_at
```

**Triggers:** Auto-increments question answer_count, answer vote_count; awards 2 points per upvote, 10 points for accepted answer.

---

### 2.2 User & Authentication Models

#### **Profile** (使用者檔案)
**Table:** `public.profiles` (migration 0001)

```sql
- id (UUID, PK) — references auth.users(id) with CASCADE delete
- display_name (text, nullable)
- avatar_url (text, nullable)
- identity ('elder' | 'family' | 'volunteer' | 'other')
- home_region_id (FK → regions)
- points (int, default 0) — gamification points
- role ('user' | 'moderator' | 'admin')
- created_at, updated_at (timestamptz)
```

**Triggers:** Auto-created via `handle_new_user()` trigger on `auth.users` INSERT, auto-updates `updated_at`.

**Auth Integration:**
- OAuth via Supabase (Google login assumed from codebase)
- Email/password signup supported
- Server-side auth client: [src/lib/supabase/server.ts](src/lib/supabase/server.ts)
- Browser client: [src/lib/supabase/client.ts](src/lib/supabase/client.ts)
- Admin client (service role key): [src/lib/supabase/admin.ts](src/lib/supabase/admin.ts)

---

#### **Regional Moderation**
**Tables:** `regions`, `region_moderators` (migrations 0001, 0002)

```sql
regions:
- id (UUID, PK)
- level ('national' | 'county' | 'district')
- parent_id (FK → regions, nullable)
- name, code (text) — e.g., "TW-TYC-ZL"
- latitude, longitude (numeric, nullable)
- created_at

region_moderators (many-to-many):
- region_id, user_id (composite PK)
- assigned_by (FK → profiles)
- assigned_at (timestamptz)
```

**Helper Functions:**
- `is_admin(uid)` — checks `profiles.role = 'admin'`
- `is_region_moderator(uid, region_id)` — checks `region_moderators` table

---

### 2.3 Category Hierarchy

**Tables:** `categories`, `subcategories` (migration 0002)

```sql
categories:
- id (UUID, PK)
- slug (text, unique)
- name, icon, color (text)
- sort_order (int)

subcategories:
- id (UUID, PK)
- category_id (FK → categories)
- slug, name, description (text)
- sort_order (int)
- unique(category_id, slug)
```

**Configured Categories** ([src/config/categories.ts](src/config/categories.ts)):
1. **health** (醫療健康) — clinic, pharmacy, rehab, ambulance, health checkup, etc.
2. **transport** (交通接駁) — elderly card, rideshare, accessible taxi, license renewal
3. **housing** (居住安全) — fall prevention, solo elder alarm, home care, repairs
4. **finance** (經濟財務) — pension, anti-fraud, inheritance, trust, finance courses
5. **social** (社會資源) — welfare consult, mental health, legal aid, meal delivery

Each category contains 8-14 subcategories.

---

## 3. Authentication & User Management Implementation

### 3.1 Auth Flow

**Sign-up/Login Endpoints** ([src/lib/auth/actions.ts](src/lib/auth/actions.ts)):

```typescript
export async function signInWithGoogle()
export async function loginWithEmail(email: string, password: string)
export async function registerWithEmail(email: string, password: string)
export async function signOut()
```

**Auth Callback:** [src/app/(auth)/callback/](src/app/(auth)/callback/) — LINE LIFF OAuth callback handling

### 3.2 Role-Based Access Control

**Authorization Helper** ([src/lib/auth/requireRole.ts](src/lib/auth/requireRole.ts)):

```typescript
export async function requireRole(min: "moderator" | "admin")
  → { user, role, points, displayName }
```

Used in protected admin pages to redirect unauthorized users to `/`.

### 3.3 Session Management

- **Server-side:** Supabase SSR client with cookie-based sessions ([src/lib/supabase/server.ts](src/lib/supabase/server.ts))
- **Browser-side:** Supabase browser client ([src/lib/supabase/client.ts](src/lib/supabase/client.ts))
- **Fallback:** Mock client for offline/DNS failure modes

---

## 4. User Roles & Permission System

### 4.1 Role Hierarchy

| Role | Capabilities |
|------|--------------|
| **user** (rank 0) | View public resources, activities, news; submit resources/Q&A; like/vote |
| **moderator** (rank 1) | View/edit all resources in assigned regions; hide inappropriate Q&A/news |
| **admin** (rank 2) | Full CRUD on all content; manage users; assign region moderators |

### 4.2 Row-Level Security (RLS) Policies

**Resources (0003):**
- **Select:** Everyone can read `status='active'`; admin/moderator/submitter can see others
- **Insert:** Authenticated users (auto-set `submitted_by = auth.uid()`)
- **Update:** Admin or region moderator
- **Delete:** Admin only

**Activities/Scripts (0004):**
- **Select:** Everyone reads `status='active'`; admin sees all
- **Write:** Admin only

**Daily News (0007):**
- **Select:** `status='active'` public; admin sees all
- **Write:** Admin only

**Q&A (0006):**
- **Questions Select:** `status in ('open','resolved')`
- **Questions Insert:** Authenticated users
- **Answers:** Authenticated users can post; public can vote

**Community Submissions (0007):**
- **Select:** Submitter sees own; admin sees all
- **Insert:** Authenticated users
- **Update:** Admin only (approval/rejection)

---

## 5. Content Moderation & Approval Mechanisms

### 5.1 Resource Submission Workflow

1. **User submits** → `resources.status = 'pending'`, `submitted_by = user_id`
2. **Admin reviews** via [src/app/admin/page.tsx](src/app/admin/) dashboard
3. **Approve** → `status = 'active'`, `approved_by`, `approved_at` set
4. **Reject** → `status = 'archived'`
5. **Publish** automatically visible to public (RLS: status='active')

**Admin Actions** ([src/lib/admin/actions.ts](src/lib/admin/actions.ts)):
```typescript
export async function updateAndApproveResource(resourceId, fields)
export async function approveResource(resourceId)
export async function rejectResource(resourceId)
export async function markResourceEnded(resourceId)
```

### 5.2 Community Submission Review

**Table:** `community_submissions` (migration 0007)

Workflow:
1. Authenticated user submits activity/script → `status = 'pending'`
2. Admin reviews `payload` (full JSON draft)
3. Admin: approve → becomes official card, OR request more info, OR reject
4. Stored: `review_notes`, `reviewed_by`, `reviewed_at`, `status`

### 5.3 Q&A Moderation

- **Hide inappropriate questions:** `questions.status = 'hidden'` ([src/lib/admin/actions.ts](src/lib/admin/actions.ts) `hideQuestion()`)
- **Delete answers:** `answers.delete()` with vote/point reversal
- **Accept answer:** Sets `is_accepted = true` → awards 10 points

**Triggers auto-manage:**
- `trg_bump_answer_count` — increments question `answer_count`
- `trg_bump_answer_vote` — increments answer `vote_count`, awards +2 points per vote
- `trg_award_accepted_points` — +10 for accepted, -10 if revoked

### 5.4 Feedback & Reporting

**Table:** `resource_reports` (migration 0003)

Report types: `ended`, `wrong_info`, `duplicate`, `other`
Status: `open` → admin reviews → `resolved` (fixed) or `rejected`

---

## 6. API Design & Data Export

### 6.1 Export API

**Endpoint:** `GET /api/admin/resources/export`
**Auth:** Token-based (`x-admin-token` header or URL param)
**Format:** JSON with flattened category/region hierarchy

**Response:**
```json
{
  "ok": true,
  "count": 523,
  "data": [
    {
      "id", "category", "category_slug", "subcategory", "subcategory_slug",
      "scope", "region", "region_code", "name", "summary", "description",
      "phone", "phone_hint", "address", "website_url", "identity_tags", "tags",
      "source_org", "status"
    },
    ...
  ]
}
```

**File:** [src/app/api/admin/resources/export/route.ts](src/app/api/admin/resources/export/route.ts) (lines 1-100)

### 6.2 Import API

**Endpoint:** `POST /api/admin/resources/import`
**Auth:** Token-based (`x-admin-token` header)
**Input:**
```json
{
  "rows": [
    {
      "id": "optional-uuid",
      "subcategory_slug": "string",
      "category_slug": "string",
      "scope": "national|local",
      "region_code": "optional",
      "name": "string",
      "summary": "string",
      ...
    }
  ]
}
```

**Response:**
```json
{
  "inserted": 45,
  "updated": 12,
  "errors": ["string", ...]
}
```

**Logic:**
- Validates subcategory/region codes against database
- Splits CSV-formatted identity_tags/tags
- Upsert logic (update if ID matches, else insert)

**File:** [src/app/api/admin/resources/import/route.ts](src/app/api/admin/resources/import/route.ts) (lines 1-100+)

### 6.3 Other API Routes

**Admin:**
- [src/app/api/admin/ai-clean/](src/app/api/admin/ai-clean/) — Claude API integration for content cleaning
- [src/app/api/admin/fetch-news/](src/app/api/admin/fetch-news/) — Crawler for daily news aggregation

**Public/User:**
- [src/app/api/geo/](src/app/api/geo/) — Geolocation services
- [src/app/api/line/](src/app/api/line/) — LINE LIFF integration
- [src/app/api/search/](src/app/api/search/) — Full-text search (via keyword intent parser)
- [src/app/api/share-card/](src/app/api/share-card/) — Generate shareable cards (html-to-image)
- [src/app/api/tts/](src/app/api/tts/) — Text-to-speech

---

## 7. Security Measures

### 7.1 Authentication

- **Supabase Auth:** Managed OAuth + email/password
- **Session Storage:** HTTP-only cookies (enforced by Supabase SSR)
- **Service Role Key:** Stored in `SUPABASE_SERVICE_ROLE_KEY` environment variable (backend only, never client-side)

### 7.2 Authorization

- **Row-Level Security (RLS):** All tables have RLS enabled
- **Policy-Based:** Helper functions `is_admin()`, `is_region_moderator()` used in policies
- **Attribute-Based:** Check `role` and regional assignments before data access

### 7.3 Input Validation

**Import API** ([src/app/api/admin/resources/import/route.ts](src/app/api/admin/resources/import/route.ts)):
- Validates JSON structure
- Checks subcategory/region codes against database
- Trims and filters empty strings
- Splits CSV-formatted arrays with `.trim().filter(Boolean)`
- Enforces `scope='local'` requires valid region_id

**Export API** ([src/app/api/admin/resources/export/route.ts](src/app/api/admin/resources/export/route.ts)):
- Token verification before data access

### 7.4 Rate Limiting

**Not explicitly implemented** in core — relies on:
- Vercel deployment's built-in rate limiting
- Could be enhanced via middleware or API routes

### 7.5 CSRF & XSS Protection

- **CSRF:** Supabase SSR handles token refresh via middleware
- **XSS:** React/Next.js auto-escapes JSX content by default; sanitization needed for user-generated content (comments, Q&A)
- **No explicit sanitization library** observed — potential improvement area

### 7.6 Data Privacy

- **User Deletion:** Cascade delete via `references auth.users(id) on delete cascade`
- **Regional Moderation:** Moderators only see their assigned regions
- **Feedback Anonymous:** Can be posted without login (user_id nullable)

---

## 8. Database Schema Structure (Supabase Migrations)

### Migration Overview

| File | Purpose |
|------|---------|
| **0001_init_auth_profiles.sql** | Create `pgcrypto`, `pg_trgm` extensions; profiles table; auto-profile trigger; RLS policies |
| **0002_regions_categories.sql** | Regions hierarchy, categories, subcategories, region_moderators; admin/moderator helper functions |
| **0003_resources.sql** | Resources CRUD, likes, feedback, reports; constraint enforcing local resources have region_id |
| **0004_activities_scripts.sql** | Activity cards, communication scripts; status = active/draft/archived |
| **0005_like_unlike_trigger.sql** | Decrement trigger for resource_likes (complement to 0003) |
| **0006_community_admin.sql** | Q&A system (questions, answers, votes); point gamification; moderator RLS |
| **0007_activity_media_news_submissions.sql** | Add media columns to activities; daily_news table; community_submissions table |

### Key Design Patterns

**Denormalized Counters:**
```sql
-- Resources: like_count, view_count
-- Questions: answer_count, view_count
-- Answers: vote_count
-- Trigger updates on INSERT/DELETE
```

**JSONB Storage:**
```sql
-- resources.hours (operating hours)
-- activity_cards.steps (structured steps with media)
-- communication_scripts.ok_examples, ng_examples
-- community_submissions.payload (full draft)
```

**Immutable Timestamps:**
- `created_at DEFAULT now()` — immutable
- `updated_at` — auto-updated via `set_updated_at()` trigger

**Unique Slugs:**
- `activity_cards.slug` UNIQUE
- `communication_scripts.slug` UNIQUE
- Category slugs for URL-friendly URLs

**Composite PKs (Many-to-Many):**
- `resource_likes(resource_id, user_id)`
- `region_moderators(region_id, user_id)`
- `answer_votes(answer_id, user_id)`

**Constraints:**
```sql
-- Resources: local scope requires region_id
CHECK (scope = 'national' OR region_id IS NOT NULL)

-- Identity tags enum (no CHECK, validated in app)
identity_tags TEXT[] DEFAULT '{}'

-- Status enums via CHECK
CHECK (status IN ('active', 'pending', 'ended', 'archived'))
```

### Indexes

**Full-Text Search (GIN):**
```sql
resources_identity_tags_idx — USING GIN (identity_tags)
resources_tags_idx — USING GIN (tags)
resources_name_trgm_idx — USING GIN (name gin_trgm_ops)
```

**Lookups:**
```sql
profiles_role_idx, profiles_identity_idx
regions_level_idx, regions_parent_idx
categories_id_idx, subcategories_category_idx
resource_feedback_resource_idx, resource_reports_resource_idx
...
```

---

## 9. File Structure Summary

### Key Directories

```
src/
  app/
    (auth)/
      login/, signup/, callback/  — Auth pages
    (main)/
      about/, activities/, news/, resources/, qa/, ...  — Public pages
    admin/
      page.tsx  — Admin dashboard
    api/
      admin/
        resources/export/, import/  — CSV import/export
        ai-clean/, fetch-news/  — Content processing
      geo/, line/, search/, share-card/, tts/
  lib/
    supabase/
      server.ts  — Server-side client
      client.ts  — Browser client
      admin.ts  — Admin (service role) client
    auth/
      requireRole.ts  — Authorization helper
      actions.ts  — Sign up/login
    admin/
      actions.ts  — Resource/Q&A/news moderation
    resources/
      queries.ts  — Data fetching
      submitAction.ts  — User submission
    location/
      regions.ts  — Region geo queries
      cookies.ts  — User region persistence
    search/
      keywordIntent.ts  — Search intent parser
    qa/, ai/, crawler/, line/, speech/, etc.
  config/
    categories.ts  — Category hierarchy
    identities.ts  — User identity types
    siteConfig.ts  — Site metadata
  types/
    domain.ts  — TypeScript models
  components/
    activities/, admin/, auth/, community/, qa/, resources/, search/, etc.

supabase/
  migrations/
    0001_init_auth_profiles.sql
    0002_regions_categories.sql
    0003_resources.sql
    0004_activities_scripts.sql
    0005_like_unlike_trigger.sql
    0006_community_admin.sql
    0007_activity_media_news_submissions.sql
  seed/
    (category, region, resource seed data)
```

---

## 10. Summary Table

| Aspect | Implementation |
|--------|-----------------|
| **Frontend Framework** | Next.js 16.2.4 (App Router, RSC, Server Actions) |
| **Backend** | Supabase PostgreSQL + Auth |
| **Database Tables** | 20+ (resources, activities, scripts, news, Q&A, profiles, regions, categories, etc.) |
| **User Roles** | user, moderator, admin (with regional scoping) |
| **Auth Methods** | OAuth (Google), Email/password |
| **Content Approval** | Pending → Active workflow with admin review |
| **Q&A System** | Community questions, answers, voting, point gamification |
| **Moderation Tools** | Hide/delete content, flag reports, assign regional moderators |
| **Data Export** | Token-gated CSV export API with category/region resolution |
| **Data Import** | Token-gated CSV import with upsert logic |
| **Search** | Full-text GIN indexes + keyword intent parser |
| **Security** | RLS policies, service role key isolation, input validation |
| **Accessibility** | Elderly-friendly design (min font 20px), identity-based tagging |
| **Third-party** | LINE LIFF, Claude AI, Anthropic SDK, html-to-image |

---

## 11. Known Tech Debt & Improvement Areas

1. **Rate Limiting:** Not implemented; consider middleware-based limits
2. **Input Sanitization:** No explicit HTML/XSS sanitization for user comments/Q&A
3. **Error Handling:** Mock client fallback; could enhance error reporting
4. **Testing:** No test files observed; add Jest/Vitest coverage
5. **API Documentation:** OpenAPI/Swagger docs would help external integrations
6. **Audit Logging:** No audit trail for admin actions
7. **Image Optimization:** Media files stored as URLs; consider CDN caching strategy
8. **Internationalization:** UI text hardcoded in Traditional Chinese; i18n not yet integrated

---

## 12. Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Admin API
ADMIN_API_TOKEN

# Site
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_DEFAULT_REGION_CODE

# LINE (optional)
NEXT_PUBLIC_LINE_LIFF_ID
```

