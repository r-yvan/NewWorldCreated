/**
 * Design tokens consumed by non-NativeWind APIs (charts, navigation theming,
 * status bar, SVG fills). Mirrors the Tailwind monochromatic palette.
 */

export const palette = {
  white: "#ffffff",
  black: "#000000",
  gray50: "#fafafa",
  gray100: "#f5f5f5",
  gray200: "#e5e5e5",
  gray300: "#d4d4d4",
  gray400: "#a3a3a3",
  gray500: "#737373",
  gray600: "#525252",
  gray700: "#404040",
  gray800: "#262626",
  gray900: "#171717",
  gray950: "#0a0a0a",
  accent: "#8a2be2",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
} as const;

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  icon: string;
  accent: string;
  /** Ordered monochromatic series for charts. */
  chartSeries: string[];
}

export const lightColors: ThemeColors = {
  background: palette.white,
  surface: palette.gray50,
  card: palette.white,
  border: palette.gray200,
  text: palette.gray900,
  textSecondary: palette.gray600,
  textMuted: palette.gray500,
  icon: palette.gray600,
  accent: palette.accent,
  chartSeries: [
    palette.gray900,
    palette.gray700,
    palette.gray500,
    palette.gray300,
  ],
};

export const darkColors: ThemeColors = {
  background: palette.gray950,
  surface: palette.gray900,
  card: palette.gray900,
  border: palette.gray800,
  text: palette.white,
  textSecondary: palette.gray300,
  textMuted: palette.gray500,
  icon: palette.gray400,
  accent: palette.accent,
  chartSeries: [
    palette.white,
    palette.gray300,
    palette.gray500,
    palette.gray700,
  ],
};

export const statusColors = {
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  info: palette.info,
} as const;
