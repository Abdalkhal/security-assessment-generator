import { escapeHtml, nl2br } from './html';

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    );
  });

  it('escapes ampersands and single quotes', () => {
    expect(escapeHtml(`Tom & Jerry's`)).toBe('Tom &amp; Jerry&#39;s');
  });

  it('returns an empty string for null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('stringifies numbers', () => {
    expect(escapeHtml(7.5)).toBe('7.5');
  });
});

describe('nl2br', () => {
  it('converts newlines to <br/> after escaping', () => {
    expect(nl2br('line one\n<b>line two</b>')).toBe('line one<br/>&lt;b&gt;line two&lt;/b&gt;');
  });
});
