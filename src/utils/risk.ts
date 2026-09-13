import { SEVERITY_LEVELS, SEVERITY_META, Severity } from '../constants/severity';
import { Finding } from '../types';

// Overall risk for a set of findings is simply the highest-severity finding
// present, ordered CRITICAL > HIGH > MEDIUM > LOW > INFORMATIONAL - never a
// fabricated score, only a reflection of findings the user actually entered.
export function getOverallRisk(findings: Finding[]): Severity | null {
  if (findings.length === 0) return null;
  return SEVERITY_LEVELS.reduce<Severity>((highest, level) => {
    const hasLevel = findings.some((f) => f.severity === level);
    if (hasLevel && SEVERITY_META[level].weight > SEVERITY_META[highest].weight) {
      return level;
    }
    return highest;
  }, 'INFORMATIONAL');
}

export function countBySeverity(findings: Finding[]): Record<Severity, number> {
  const counts = SEVERITY_LEVELS.reduce(
    (acc, level) => ({ ...acc, [level]: 0 }),
    {} as Record<Severity, number>
  );
  findings.forEach((f) => {
    counts[f.severity] += 1;
  });
  return counts;
}
