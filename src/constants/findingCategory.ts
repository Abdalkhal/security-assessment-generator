export const FINDING_CATEGORIES = [
  'Authentication',
  'Authorization',
  'Access Control',
  'Injection',
  'Security Misconfiguration',
  'Information Disclosure',
  'Cryptography',
  'Session Management',
  'Security Headers',
  'Network Security',
  'Configuration',
  'Other',
] as const;
export type FindingCategory = (typeof FINDING_CATEGORIES)[number];
