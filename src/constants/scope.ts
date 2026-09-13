export const SCOPE_SIDES = ['IN_SCOPE', 'OUT_OF_SCOPE'] as const;
export type ScopeSide = (typeof SCOPE_SIDES)[number];

export const SCOPE_ITEM_TYPES = [
  'Domain',
  'IP Address',
  'Application',
  'API',
  'Network',
  'Other',
] as const;
export type ScopeItemType = (typeof SCOPE_ITEM_TYPES)[number];
