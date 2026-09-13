import { TextStyle } from 'react-native';
import { colors } from './colors';

type TypeScale =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'mono';

export const typography: Record<TypeScale, TextStyle> = {
  h1: { fontSize: 28, fontWeight: '700', color: colors.text, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700', color: colors.text, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', color: colors.text, lineHeight: 24 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text, lineHeight: 22 },
  body: { fontSize: 14, fontWeight: '400', color: colors.text, lineHeight: 20 },
  bodyStrong: { fontSize: 14, fontWeight: '600', color: colors.text, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', color: colors.textSecondary, lineHeight: 16 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, lineHeight: 16, letterSpacing: 0.4 },
  mono: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
};
