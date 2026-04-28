/** @type {const} */
// Dark navy theme — single theme, no light/dark toggle
const DARK = '#0f172a';
const SURFACE = '#1e293b';
const SURFACE2 = '#0f172a';

const themeColors = {
  primary:    { light: '#0ea5e9', dark: '#0ea5e9' },
  background: { light: DARK,     dark: DARK },
  surface:    { light: SURFACE,  dark: SURFACE },
  foreground: { light: '#f1f5f9', dark: '#f1f5f9' },
  muted:      { light: '#94a3b8', dark: '#94a3b8' },
  border:     { light: '#1e3a5f', dark: '#1e3a5f' },
  success:    { light: '#22c55e', dark: '#22c55e' },
  warning:    { light: '#f59e0b', dark: '#f59e0b' },
  error:      { light: '#ef4444', dark: '#ef4444' },
  tint:       { light: '#0ea5e9', dark: '#0ea5e9' },
};

module.exports = { themeColors };
