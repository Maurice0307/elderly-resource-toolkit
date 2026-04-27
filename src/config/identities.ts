export const identities = [
  { slug: "elder", name: "長輩", icon: "elder" },
  { slug: "family", name: "家屬", icon: "family" },
  { slug: "volunteer", name: "志工", icon: "volunteer" },
] as const;

export type IdentitySlug = (typeof identities)[number]["slug"];
