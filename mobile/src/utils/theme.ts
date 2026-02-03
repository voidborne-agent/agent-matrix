// AgentMatrix Theme - Voidborne-inspired dark theme

export const colors = {
  // Primary colors
  primary: '#6366F1',      // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Background colors
  background: '#0F0F14',
  surface: '#1A1A24',
  surfaceLight: '#252533',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textMuted: '#6B6B7B',
  
  // Accent colors
  accent: '#22C55E',       // Green for online status
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Border colors
  border: '#2A2A3A',
  borderLight: '#3A3A4A',
  
  // Special
  void: '#1E1E2E',         // Voidborne special color
  glow: 'rgba(99, 102, 241, 0.3)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
  title: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
};

export const theme = {
  colors,
  spacing,
  fontSizes,
  borderRadius,
  shadows,
};

export default theme;
