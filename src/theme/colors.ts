export const colors = {
  background: '#0B0F14',
  surface: '#111820',
  card: '#151D26',
  border: '#25303C',

  primary: '#4F8CFF',
  primaryMuted: '#1E2A3D',

  text: '#F4F7FA',
  textSecondary: '#9AA7B5',

  success: '#2FBF71',
  warning: '#F0B429',
  danger: '#E55353',
  critical: '#B83232',

  overlay: 'rgba(4, 8, 12, 0.72)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorName = keyof typeof colors;
