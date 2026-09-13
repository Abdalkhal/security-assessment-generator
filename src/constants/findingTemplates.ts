import { FindingTemplate } from '../types';

// Built-in, read-only templates bundled with the app (not stored in
// Firestore) so the Finding Library works with zero setup. Custom,
// user-created templates are a P1 feature for a later stage.
export const BUILT_IN_FINDING_TEMPLATES: FindingTemplate[] = [
  {
    id: 'tpl-missing-csp',
    title: 'Missing Content-Security-Policy Header',
    category: 'Security Headers',
    defaultSeverity: 'LOW',
    description:
      'The application does not return a Content-Security-Policy (CSP) header, which is a defense-in-depth control against cross-site scripting (XSS) and data injection attacks.',
    impact:
      'Without a CSP, the browser has no additional restriction on which scripts, styles, or other resources can execute, making successful exploitation of an XSS vulnerability more impactful.',
    recommendation:
      'Implement a Content-Security-Policy header that restricts script, style, and other resource origins to trusted sources, and iteratively tighten it based on application requirements.',
    owaspCategory: 'A05:2021 - Security Misconfiguration',
    cwe: 'CWE-693',
    isBuiltIn: true,
  },
  {
    id: 'tpl-missing-hsts',
    title: 'Missing HTTP Strict Transport Security (HSTS)',
    category: 'Security Headers',
    defaultSeverity: 'LOW',
    description:
      'The application does not return a Strict-Transport-Security header, so browsers are not instructed to only communicate with the site over HTTPS.',
    impact:
      'Users may be susceptible to protocol downgrade attacks and cookie hijacking via man-in-the-middle attacks on the first HTTP request before a redirect to HTTPS occurs.',
    recommendation:
      'Return a Strict-Transport-Security header with an appropriate max-age (e.g. at least 6 months) on all HTTPS responses, and consider includeSubDomains and preload once verified safe.',
    owaspCategory: 'A05:2021 - Security Misconfiguration',
    cwe: 'CWE-319',
    isBuiltIn: true,
  },
  {
    id: 'tpl-missing-xfo',
    title: 'Missing X-Frame-Options Header',
    category: 'Security Headers',
    defaultSeverity: 'LOW',
    description:
      'The application does not return an X-Frame-Options header (or an equivalent frame-ancestors CSP directive), allowing the page to be embedded in a frame on another site.',
    impact:
      'The absence of framing protection can enable clickjacking attacks, where a malicious site tricks a user into interacting with the application through an invisible or disguised frame.',
    recommendation:
      'Return X-Frame-Options: DENY or SAMEORIGIN as appropriate, or use the Content-Security-Policy frame-ancestors directive for more granular control.',
    owaspCategory: 'A05:2021 - Security Misconfiguration',
    cwe: 'CWE-1021',
    isBuiltIn: true,
  },
  {
    id: 'tpl-insecure-cookies',
    title: 'Insecure Cookie Configuration',
    category: 'Session Management',
    defaultSeverity: 'MEDIUM',
    description:
      'One or more cookies are set without the Secure, HttpOnly, and/or SameSite attributes appropriately configured.',
    impact:
      'Missing Secure allows cookies to be sent over unencrypted connections; missing HttpOnly allows client-side scripts (including injected XSS payloads) to read the cookie; missing/weak SameSite increases exposure to cross-site request forgery.',
    recommendation:
      'Set Secure and HttpOnly on all session and sensitive cookies, and configure SameSite=Lax or Strict unless a documented cross-site use case requires None (with Secure).',
    owaspCategory: 'A05:2021 - Security Misconfiguration',
    cwe: 'CWE-614',
    isBuiltIn: true,
  },
  {
    id: 'tpl-information-disclosure',
    title: 'Information Disclosure',
    category: 'Information Disclosure',
    defaultSeverity: 'LOW',
    description:
      'The application discloses information that could assist an attacker in profiling the target, such as verbose error messages, stack traces, internal paths, or software version banners.',
    impact:
      'Disclosed information can reveal technology stack, internal structure, or software versions, helping an attacker identify and target known vulnerabilities more efficiently.',
    recommendation:
      'Return generic error messages to end users, log detailed errors server-side only, and remove or suppress version banners and internal identifiers from responses.',
    owaspCategory: 'A05:2021 - Security Misconfiguration',
    cwe: 'CWE-200',
    isBuiltIn: true,
  },
  {
    id: 'tpl-directory-listing',
    title: 'Directory Listing Enabled',
    category: 'Security Misconfiguration',
    defaultSeverity: 'LOW',
    description:
      'One or more directories on the web server do not have an index file and directory listing is enabled, exposing the file structure and contents of the directory.',
    impact:
      'An attacker can enumerate files that were not intended to be publicly accessible, potentially discovering backup files, configuration files, or other sensitive data.',
    recommendation:
      'Disable directory listing at the web server or application configuration level, and ensure sensitive files are not stored within web-accessible directories.',
    owaspCategory: 'A05:2021 - Security Misconfiguration',
    cwe: 'CWE-548',
    isBuiltIn: true,
  },
  {
    id: 'tpl-weak-tls',
    title: 'Weak TLS Configuration',
    category: 'Cryptography',
    defaultSeverity: 'MEDIUM',
    description:
      'The server supports outdated TLS/SSL protocol versions and/or weak cipher suites that do not meet current best practices.',
    impact:
      'Weak transport-layer cryptography can allow an attacker positioned on the network to downgrade, intercept, or decrypt traffic between the client and server.',
    recommendation:
      'Disable SSLv3/TLS 1.0/TLS 1.1 and weak cipher suites, enable only TLS 1.2+ with strong cipher suites, and verify configuration against current guidance (e.g. Mozilla SSL Configuration Generator).',
    owaspCategory: 'A02:2021 - Cryptographic Failures',
    cwe: 'CWE-326',
    isBuiltIn: true,
  },
  {
    id: 'tpl-weak-password-policy',
    title: 'Weak Password Policy',
    category: 'Authentication',
    defaultSeverity: 'MEDIUM',
    description:
      'The application does not enforce a sufficiently strong password policy, allowing users to set short, common, or easily guessable passwords.',
    impact:
      'Weak passwords are more susceptible to brute-force, credential-stuffing, and dictionary attacks, increasing the risk of account takeover.',
    recommendation:
      'Enforce a minimum password length (e.g. 12+ characters), check new passwords against a list of known-breached/common passwords, and consider supporting multi-factor authentication.',
    owaspCategory: 'A07:2021 - Identification and Authentication Failures',
    cwe: 'CWE-521',
    isBuiltIn: true,
  },
  {
    id: 'tpl-debug-mode',
    title: 'Debug Mode Enabled',
    category: 'Security Misconfiguration',
    defaultSeverity: 'HIGH',
    description:
      'The application is running with debug mode enabled in what appears to be a production or externally accessible environment.',
    impact:
      'Debug mode often exposes verbose stack traces, internal variable state, source code snippets, or interactive debug consoles, which can significantly aid an attacker or directly lead to remote code execution in some frameworks.',
    recommendation:
      'Disable debug mode in any environment accessible outside a trusted development network, and verify configuration management prevents this setting from being deployed to production.',
    owaspCategory: 'A05:2021 - Security Misconfiguration',
    cwe: 'CWE-489',
    isBuiltIn: true,
  },
  {
    id: 'tpl-exposed-admin-interface',
    title: 'Exposed Administrative Interface',
    category: 'Access Control',
    defaultSeverity: 'HIGH',
    description:
      'An administrative interface is reachable from an untrusted network without adequate network-level or authentication controls.',
    impact:
      'Exposure of administrative functionality increases the attack surface significantly; if paired with weak credentials or an authentication bypass, it could lead to full application or system compromise.',
    recommendation:
      'Restrict access to administrative interfaces to trusted networks (e.g. VPN, IP allowlist), enforce strong authentication (ideally multi-factor), and log/alert on access attempts.',
    owaspCategory: 'A01:2021 - Broken Access Control',
    cwe: 'CWE-284',
    isBuiltIn: true,
  },
];

export function getFindingTemplate(id: string): FindingTemplate | undefined {
  return BUILT_IN_FINDING_TEMPLATES.find((t) => t.id === id);
}
