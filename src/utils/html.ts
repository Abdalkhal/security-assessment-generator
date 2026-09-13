// Escapes user-entered text before it is embedded in generated report
// HTML. The report is rendered in a WebView to produce a PDF, so
// unescaped input could break the layout or inject markup - every
// user-supplied field (title, description, notes, etc.) is treated as
// plain text via this function before being placed in the template.
export function escapeHtml(value: string | number | null | undefined): string {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function nl2br(value: string): string {
  return escapeHtml(value).replace(/\n/g, '<br/>');
}
