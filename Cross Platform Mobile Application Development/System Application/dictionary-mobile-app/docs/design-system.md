# LexiTech Dictionary — Design System

A strict **monochromatic enterprise** design language: neutral grays, black & white, with **blueviolet** as the single, sparing accent and status colours reserved for semantic feedback only.

## Theme System

- Implemented in `src/contexts/ThemeContext.tsx`.
- Three preferences: **light**, **dark**, **system** (persisted in AsyncStorage).
- Drives **NativeWind class-based dark mode** (`darkMode: "class"` in `tailwind.config.js`) and exposes token colours (`src/constants/theme.ts`) for non-NativeWind surfaces (SVG charts, status bar, navigation, icons).

## Color Palette

| Token | Light | Dark |
| --- | --- | --- |
| Background | White `#ffffff` | Gray 950 `#030712` |
| Secondary background | Gray 50 | Gray 900 |
| Card | White | Gray 900 |
| Border | Gray 200 | Gray 800 |
| Primary text | Gray 900 | White |
| Secondary text | Gray 600 | Gray 300 |
| Muted text | Gray 500 | Gray 500 |
| Icon (default) | Gray 600 | Gray 400 |

**Accent:** `blueviolet #8a2be2` — used sparingly (role badges, highlights, links via violet-600/400).

**Status colours (semantic only):** Success `emerald-500`, Warning `amber-500`, Error `red-500`, Info `blue-500`. Always paired with an icon, never colour-only (accessibility).

## Typography

Centralized in `Typography` (`src/components/ui/Typography.tsx`) with a fixed hierarchy:

| Variant | Usage |
| --- | --- |
| `display` | Word title (3xl, extrabold) |
| `title` | Screen titles (2xl, bold) |
| `heading` | Section headings (lg, semibold) |
| `subheading` | Card headings (base, semibold) |
| `body` | Paragraph / definitions |
| `label` | Buttons, field labels |
| `caption` | Meta, timestamps, hints |

Italic is used **only** semantically (example sentences).

## Components

Every reusable component is used in at least one screen:

- **Data display:** `AppCard`, `StatCard`, `ChartCard`, `DataTable`, `Timeline`, `Badge`, `Avatar`, `MeaningSection` (DefinitionCard).
- **Interaction:** `Modal`, `ConfirmDialog`, `Dropdown`, `Tabs`, `Tooltip`, `IconButton`, `Button`, drawer (`DrawerContent`).
- **Forms:** `FormTextInput`, `FormPasswordInput`, `SearchForm`, `Select`, `Stepper` (multi-step), `FileUpload`.
- **Feedback:** `Alert`, `EmptyState`, `ErrorState`, `SuccessState`, `Spinner`, `Skeleton`, `ToastViewport`.
- **Navigation:** `TopNavBar`, `ScreenHeader` (breadcrumbs), `UserMenu`, `ScreenContainer`.

## Charts

Custom `react-native-svg` charts following the monochromatic series
(`chartSeries`: gray-900 → gray-300 in light; white → gray-700 in dark):

- **AreaChart** — gradient fill trend.
- **LineChart** — baseline grid trend.
- **BarChart** — top words.
- **PieChart** — donut + legend with percentages.

Accent/status colours appear only when meaningful. No rainbow datasets.

## Spacing, Radius & Shadows

- Spacing scale: 4-point grid (`gap-2/3/4`, `p-4/5/6`).
- Radius: inputs/buttons `rounded-xl` (12–16px), cards `rounded-2xl` (20px), sheets `rounded-t-3xl` (28px), pills `rounded-full`.
- Shadows: subtle `shadow-sm` on cards, `shadow-lg` on overlays/toasts.

## Dark / Light Mode Rules

- Use NativeWind `dark:` variants for every surface, border and text colour.
- Use `useTheme().colors` for any imperative colour (icons, SVG, status bar).
- Maintain readable contrast in both modes; status feedback always icon + colour.
- Glassmorphism (`AppCard glass`) reserved for hero/dialog highlights only.

## Motion

Subtle, 150–300ms: modal fade, drawer slide, skeleton shimmer, button `active:opacity`. No flashy or excessive animation.
