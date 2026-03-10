const Palette = {
  // Primary
  Primary: '#5C7CFA',
  PrimaryHover: '#4C6EF5',
  PrimaryLight: '#DBE4FF',
  PrimaryDark: '#4263EB',

  // Text
  TextPrimary: '#1A1A1A',
  TextSecondary: '#969696',
  TextTertiary: '#A5A5A5',
  TextInverse: '#FFFFFF',

  // Background
  BodyPrimary: '#FFFFFF',
  BodySecondary: '#F8F9FA',
  BodyTertiary: '#F1F3F5',
  BodyDark: '#0A0A0F',
  BodyDarkSecondary: '#111118',
  BodyDarkTertiary: '#1A1A24',

  // Border
  Border: '#E9ECEF',
  BorderDark: '#2C2C3A',
  InputBorder: '#A5A5A5',
  InputBorderFocus: '#5C7CFA',

  // Accent (AI/Chat)
  Accent: '#7C5CFA',
  AccentHover: '#6C4CE5',
  AccentLight: '#EDE9FE',
  AccentDark: '#6D48E5',

  // Status
  Success: '#40C057',
  Error: '#FA5252',
  Warning: '#FD7E14',

  // Category
  CategoryColors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] as readonly string[],
} as const;

export default Palette;
