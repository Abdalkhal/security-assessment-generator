import { countBySeverity, getOverallRisk } from './risk';
import { Severity } from '../constants/severity';
import { Finding } from '../types';

function makeFinding(severity: Severity): Finding {
  return { severity } as unknown as Finding;
}

describe('getOverallRisk', () => {
  it('returns null when there are no findings', () => {
    expect(getOverallRisk([])).toBeNull();
  });

  it('returns the single severity when there is one finding', () => {
    expect(getOverallRisk([makeFinding('LOW')])).toBe('LOW');
  });

  it('returns the highest severity present, not the first or last', () => {
    const findings = [makeFinding('LOW'), makeFinding('CRITICAL'), makeFinding('MEDIUM')];
    expect(getOverallRisk(findings)).toBe('CRITICAL');
  });

  it('does not let a later lower-severity finding downgrade the result', () => {
    const findings = [makeFinding('HIGH'), makeFinding('INFORMATIONAL')];
    expect(getOverallRisk(findings)).toBe('HIGH');
  });
});

describe('countBySeverity', () => {
  it('counts every severity level, including zero counts', () => {
    const findings = [makeFinding('HIGH'), makeFinding('HIGH'), makeFinding('LOW')];
    expect(countBySeverity(findings)).toEqual({
      CRITICAL: 0,
      HIGH: 2,
      MEDIUM: 0,
      LOW: 1,
      INFORMATIONAL: 0,
    });
  });

  it('returns all zeros for an empty list', () => {
    expect(countBySeverity([])).toEqual({
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFORMATIONAL: 0,
    });
  });
});
