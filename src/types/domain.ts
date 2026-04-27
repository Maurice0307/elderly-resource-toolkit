import type { CategorySlug } from "@/config/categories";
import type { IdentitySlug } from "@/config/identities";

export type Scope = "national" | "local";
export type ResourceStatus = "active" | "pending" | "ended" | "archived";
export type SubmissionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "needs_more_info";

export type Resource = {
  id: string;
  name: string;
  summary: string | null;
  description: string | null;
  scope: Scope;
  region_id: string | null;
  subcategory_id: string;
  phone: string | null;
  phone_hint: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  website_url: string | null;
  hours: Record<string, unknown> | null;
  identity_tags: IdentitySlug[] | null;
  tags: string[] | null;
  source_url: string | null;
  source_org: string | null;
  like_count: number;
  view_count: number;
  status: ResourceStatus;
  created_at: string;
  updated_at: string;
};

export type CategoryRef = { slug: CategorySlug; name: string };

// ── 互動圖卡 ────────────────────────────────────

export type ActivityGroup = "move" | "create" | "smart";

export type ActivityStep = {
  order: number;
  title: string;
  description: string;
  tip?: string;
};

export type ActivityCard = {
  id: string;
  group_slug: ActivityGroup;
  slug: string;
  title: string;
  summary: string | null;
  cover_emoji: string | null;
  identity_tags: IdentitySlug[];
  steps: ActivityStep[];
  tags: string[];
  like_count: number;
  status: string;
  created_at: string;
};

// ── 溝通錦囊 ────────────────────────────────────

export type ScriptAudience = "volunteer" | "family" | "difficult";

export type ScriptLine = { role: string; text: string; reason?: string };

export type CommunicationScript = {
  id: string;
  audience: ScriptAudience;
  slug: string;
  title: string;
  context: string | null;
  ok_examples: ScriptLine[];
  ng_examples: ScriptLine[];
  tips: string[];
  tags: string[];
  like_count: number;
  status: string;
  created_at: string;
};
