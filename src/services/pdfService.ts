import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SEVERITY_META, SEVERITY_LEVELS } from '../constants/severity';
import { FINDING_STATUS_META } from '../constants/findingStatus';
import { getAssessment } from './assessmentService';
import { getEvidenceForFinding, getEvidenceImageDataUri } from './evidenceService';
import { getFindingsForAssessment } from './findingService';
import { createReportRecord } from './reportService';
import { getScopeItems } from './scopeService';
import { getUserProfile } from './userService';
import { countBySeverity, getOverallRisk } from '../utils/risk';
import { escapeHtml, nl2br } from '../utils/html';
import { Evidence, Finding } from '../types';

async function buildFindingHtml(finding: Finding, evidence: Evidence[]): Promise<string> {
  const statusMeta = FINDING_STATUS_META[finding.status];
  const severityMeta = SEVERITY_META[finding.severity];

  const evidenceHtml = await Promise.all(
    evidence.map(async (item) => {
      if (item.type === 'SCREENSHOT' && item.storagePath) {
        try {
          const dataUri = await getEvidenceImageDataUri(item.storagePath);
          return `
            <div class="evidence-item">
              <div class="evidence-caption">${escapeHtml(item.caption || 'Screenshot')}</div>
              <img class="evidence-image" src="${dataUri}" />
            </div>`;
        } catch {
          return `
            <div class="evidence-item">
              <div class="evidence-caption">${escapeHtml(item.caption || 'Screenshot')} (unable to load image)</div>
            </div>`;
        }
      }
      return `
        <div class="evidence-item">
          <div class="evidence-caption">${escapeHtml(item.caption || 'Note')}</div>
          <div class="evidence-text">${nl2br(item.textContent ?? '')}</div>
        </div>`;
    })
  );

  const references = (finding.references ?? '')
    .split('\n')
    .map((r) => r.trim())
    .filter(Boolean);

  return `
    <div class="finding page-break">
      <div class="finding-header">
        <span class="finding-id">${escapeHtml(finding.displayId)}</span>
        <span class="badge" style="background:${severityMeta.color}22;color:${severityMeta.color};border-color:${severityMeta.color}55">${escapeHtml(severityMeta.label)}</span>
        <span class="badge" style="background:${statusMeta.color}22;color:${statusMeta.color};border-color:${statusMeta.color}55">${escapeHtml(statusMeta.label)}</span>
      </div>
      <h3>${escapeHtml(finding.title)}</h3>
      <table class="meta-table">
        <tr><td class="meta-label">Category</td><td>${escapeHtml(finding.category)}</td></tr>
        <tr><td class="meta-label">Affected Asset</td><td>${escapeHtml(finding.affectedAssetName || 'Not specified')}</td></tr>
        ${finding.cvssScore != null ? `<tr><td class="meta-label">CVSS Score</td><td>${escapeHtml(finding.cvssScore)}</td></tr>` : ''}
        ${finding.cvssVector ? `<tr><td class="meta-label">CVSS Vector</td><td>${escapeHtml(finding.cvssVector)}</td></tr>` : ''}
        ${finding.cwe ? `<tr><td class="meta-label">CWE</td><td>${escapeHtml(finding.cwe)}</td></tr>` : ''}
        ${finding.owaspCategory ? `<tr><td class="meta-label">OWASP Category</td><td>${escapeHtml(finding.owaspCategory)}</td></tr>` : ''}
      </table>

      <h4>Description</h4>
      <p>${nl2br(finding.description)}</p>

      ${finding.technicalDetails ? `<h4>Technical Details</h4><pre>${nl2br(finding.technicalDetails)}</pre>` : ''}

      <h4>Impact</h4>
      <p>${nl2br(finding.impact)}</p>

      <h4>Recommendation</h4>
      <p>${nl2br(finding.recommendation)}</p>

      ${
        references.length > 0
          ? `<h4>References</h4><ul>${references.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>`
          : ''
      }

      ${evidenceHtml.length > 0 ? `<h4>Evidence</h4>${evidenceHtml.join('')}` : ''}
    </div>`;
}

export async function generateAssessmentReportPdf(ownerId: string, assessmentId: string): Promise<void> {
  const [assessment, findings, scopeItems, profile] = await Promise.all([
    getAssessment(assessmentId),
    getFindingsForAssessment(ownerId, assessmentId),
    getScopeItems(ownerId, assessmentId),
    getUserProfile(ownerId),
  ]);

  if (!assessment) {
    throw new Error('Assessment not found.');
  }

  const evidenceByFinding = await Promise.all(
    findings.map((f) => getEvidenceForFinding(ownerId, f.id))
  );

  const severityCounts = countBySeverity(findings);
  const overallRisk = getOverallRisk(findings);
  const importantFindings = findings.filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH');
  const inScopeItems = scopeItems.filter((s) => s.side === 'IN_SCOPE');
  const outScopeItems = scopeItems.filter((s) => s.side === 'OUT_OF_SCOPE');

  const preparedBy = profile?.name || 'Not set';
  const company = profile?.company || '';
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const findingsHtml = (
    await Promise.all(findings.map((f, i) => buildFindingHtml(f, evidenceByFinding[i])))
  ).join('');

  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, Helvetica, Arial, sans-serif;
        color: #1A2330;
        font-size: 13px;
        line-height: 1.5;
        margin: 0;
        padding: 32px;
      }
      .page-break { page-break-before: always; }
      .cover { text-align: center; padding-top: 120px; }
      .cover h1 { font-size: 26px; letter-spacing: 1px; color: #0B0F14; }
      .cover .meta { margin-top: 48px; font-size: 14px; }
      .cover .meta div { margin-bottom: 8px; }
      h2.section-title {
        font-size: 12px;
        letter-spacing: 2px;
        color: #4F8CFF;
        text-transform: uppercase;
        border-bottom: 2px solid #4F8CFF;
        padding-bottom: 6px;
        margin-top: 36px;
      }
      h3 { font-size: 16px; margin-bottom: 4px; }
      h4 { font-size: 13px; margin-bottom: 4px; margin-top: 16px; color: #333; }
      p { margin-top: 4px; }
      table.meta-table { border-collapse: collapse; margin-top: 12px; width: 100%; }
      table.meta-table td { padding: 4px 8px; border-bottom: 1px solid #eee; font-size: 12px; }
      td.meta-label { color: #667; width: 160px; }
      .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        border: 1px solid;
        font-size: 11px;
        font-weight: 700;
        margin-left: 6px;
      }
      .finding-header { margin-bottom: 8px; }
      .finding-id { color: #4F8CFF; font-weight: 700; font-size: 12px; }
      .stats-row { display: flex; gap: 16px; margin-top: 8px; }
      .stat-chip { text-align: center; min-width: 60px; }
      .stat-value { font-size: 20px; font-weight: 700; }
      .stat-label { font-size: 10px; color: #667; }
      ul { margin: 4px 0; padding-left: 20px; }
      pre { background: #f5f5f5; padding: 8px; border-radius: 4px; font-size: 11px; white-space: pre-wrap; }
      .evidence-item { margin-top: 8px; padding: 8px; background: #fafafa; border-radius: 4px; }
      .evidence-caption { font-size: 11px; font-weight: 700; margin-bottom: 4px; }
      .evidence-image { max-width: 100%; border-radius: 4px; }
      .evidence-text { font-size: 12px; color: #444; white-space: pre-wrap; }
      .disclaimer { font-size: 11px; color: #667; font-style: italic; margin-top: 16px; }
      .footer-note { font-size: 10px; color: #999; text-align: center; margin-top: 48px; }
    </style>
  </head>
  <body>
    <div class="cover">
      <h1>SECURITY ASSESSMENT REPORT</h1>
      <div class="meta">
        <div><strong>Client:</strong> ${escapeHtml(assessment.clientName)}</div>
        <div><strong>Assessment:</strong> ${escapeHtml(assessment.title)}</div>
        <div><strong>Prepared By:</strong> ${escapeHtml(preparedBy)}${company ? ` (${escapeHtml(company)})` : ''}</div>
        <div><strong>Date:</strong> ${escapeHtml(today)}</div>
      </div>
    </div>

    <div class="page-break">
      <h2 class="section-title">Executive Summary</h2>
      <h4>Objective</h4>
      <p>${nl2br(assessment.description || 'Not provided.')}</p>
      <h4>Overall Risk</h4>
      <p>${overallRisk ? `<span class="badge" style="background:${SEVERITY_META[overallRisk].color}22;color:${SEVERITY_META[overallRisk].color};border-color:${SEVERITY_META[overallRisk].color}55">${escapeHtml(SEVERITY_META[overallRisk].label)}</span>` : 'No findings recorded.'}</p>
      <h4>Finding Statistics</h4>
      <div class="stats-row">
        ${SEVERITY_LEVELS.map(
          (level) =>
            `<div class="stat-chip"><div class="stat-value" style="color:${SEVERITY_META[level].color}">${severityCounts[level]}</div><div class="stat-label">${escapeHtml(SEVERITY_META[level].label)}</div></div>`
        ).join('')}
      </div>
      <h4>Important Risks</h4>
      ${
        importantFindings.length === 0
          ? '<p>No critical or high severity findings.</p>'
          : `<ul>${importantFindings.map((f) => `<li>${escapeHtml(f.displayId)}: ${escapeHtml(f.title)}</li>`).join('')}</ul>`
      }
    </div>

    <div class="page-break">
      <h2 class="section-title">Scope</h2>
      <h4>In Scope</h4>
      ${
        inScopeItems.length === 0
          ? '<p>None recorded.</p>'
          : `<ul>${inScopeItems.map((s) => `<li>${escapeHtml(s.value)} (${escapeHtml(s.type)})</li>`).join('')}</ul>`
      }
      <h4>Out of Scope</h4>
      ${
        outScopeItems.length === 0
          ? '<p>None recorded.</p>'
          : `<ul>${outScopeItems.map((s) => `<li>${escapeHtml(s.value)} (${escapeHtml(s.type)})</li>`).join('')}</ul>`
      }
    </div>

    <div class="page-break">
      <h2 class="section-title">Methodology</h2>
      <p>${nl2br(assessment.methodology || 'Not provided.')}</p>
    </div>

    <div class="page-break">
      <h2 class="section-title">Risk Summary</h2>
      <table class="meta-table">
        ${
          findings.length === 0
            ? '<tr><td>No findings recorded yet.</td></tr>'
            : SEVERITY_LEVELS.map(
                (level) =>
                  `<tr><td class="meta-label">${escapeHtml(SEVERITY_META[level].label)}</td><td style="color:${SEVERITY_META[level].color};font-weight:700">${severityCounts[level]}</td></tr>`
              ).join('')
        }
      </table>
    </div>

    <h2 class="section-title page-break">Detailed Findings</h2>
    ${findings.length === 0 ? '<p>No findings have been recorded for this assessment yet.</p>' : findingsHtml}

    <div class="page-break">
      <h2 class="section-title">Conclusion</h2>
      <p>
        This assessment identified ${findings.length} finding${findings.length === 1 ? '' : 's'}${
          overallRisk ? ` with an overall risk rating of ${escapeHtml(SEVERITY_META[overallRisk].label)}.` : '.'
        }
        Remediation should be prioritized according to severity and business impact.
      </p>
      <p class="disclaimer">
        This report documents findings from an authorized security assessment. It is provided for the exclusive
        use of the client and should not be relied upon by any third party. Security assessments have inherent
        limitations and cannot guarantee the absence of vulnerabilities beyond what was tested. Security
        assessments must only be performed on systems for which explicit authorization has been granted.
      </p>
      <p class="footer-note">Generated with Security Assessment Generator</p>
    </div>
  </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });

  // expo-sharing can reject the raw path printToFileAsync returns with
  // "Not allowed to read file under given URL" (confirmed on-device, an
  // Expo Go FileProvider quirk) - copying to a filename we control in the
  // cache directory first reliably works around it.
  const safeName = assessment.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 60) || 'report';
  const destination = `${FileSystem.cacheDirectory}${safeName}-${Date.now()}.pdf`;
  await FileSystem.copyAsync({ from: uri, to: destination });

  await createReportRecord(ownerId, {
    assessmentId,
    assessmentTitle: assessment.title,
    clientName: assessment.clientName,
    overallRisk: overallRisk ? SEVERITY_META[overallRisk].label : 'No Findings',
    generatedAt: new Date().toISOString(),
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(destination, {
      mimeType: 'application/pdf',
      dialogTitle: `${assessment.title} - Security Assessment Report`,
    });
  }
}
