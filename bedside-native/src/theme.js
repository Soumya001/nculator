// Design tokens — matches the web app exactly

export const DARK = {
  bg:     '#0a0a0d',
  s1:     '#10121a',
  s2:     '#161824',
  s3:     '#1c1f2e',
  text:   '#eceef5',
  muted:  '#8891a4',
  border: 'rgba(255,255,255,0.08)',
  navBg:  '#0d0f18',
  primary:'#94a3b8',
  danger: '#f87171',
  warn:   '#fbbf24',
  dangerSoft: 'rgba(248,113,113,0.12)',
  warnSoft:   'rgba(251,191,36,0.12)',
  primarySoft:'rgba(148,163,184,0.12)',
  shadow: 'rgba(0,0,0,0.5)',
};

export const LIGHT = {
  bg:     '#dce1ec',
  s1:     '#e8ecf5',
  s2:     '#f0f3fa',
  s3:     '#f8f9fd',
  text:   '#0d1017',
  muted:  '#57606f',
  border: 'rgba(0,0,0,0.08)',
  navBg:  '#e4e9f2',
  primary:'#475569',
  danger: '#dc2626',
  warn:   '#d97706',
  dangerSoft: 'rgba(220,38,38,0.10)',
  warnSoft:   'rgba(217,119,6,0.10)',
  primarySoft:'rgba(71,85,105,0.10)',
  shadow: 'rgba(0,0,0,0.12)',
};

export const ACCENTS = {
  Slate:  { dark: '#94a3b8', light: '#475569' },
  Orange: { dark: '#fb923c', light: '#ea580c' },
  Cyan:   { dark: '#2fd4d4', light: '#0a8c8c' },
  Violet: { dark: '#a98bff', light: '#6a47d0' },
  Green:  { dark: '#4cd47e', light: '#1f8a4c' },
};

export function getTheme(isDark, accentName = 'Slate') {
  const base = isDark ? DARK : LIGHT;
  const accentColor = (ACCENTS[accentName] || ACCENTS.Slate)[isDark ? 'dark' : 'light'];
  return { ...base, accent: accentColor, isDark };
}

export const FONTS = {
  mono: 'Courier',  // fallback until custom font loaded
  regular: 'System',
};

export const RADIUS = {
  sm: 12, md: 16, lg: 20, xl: 24,
};

export const SPACING = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
};
