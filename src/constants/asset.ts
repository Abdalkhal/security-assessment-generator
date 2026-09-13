export const ASSET_TYPES = [
  'Web Application',
  'API',
  'Server',
  'Network Device',
  'Domain',
  'IP Address',
  'Other',
] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const ASSET_ENVIRONMENTS = ['Production', 'Staging', 'Development', 'Testing', 'Other'] as const;
export type AssetEnvironment = (typeof ASSET_ENVIRONMENTS)[number];
