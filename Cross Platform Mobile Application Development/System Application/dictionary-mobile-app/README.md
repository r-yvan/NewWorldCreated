# LexiTech Dictionary

A cross-platform **Dictionary Mobile Application** for **LexiTech Solutions Ltd** (Kigali City), built with React Native + Expo Router. It lets users search English words, view meanings, phonetics, parts of speech and examples, play pronunciation audio, and revisit a persisted search history — wrapped in a premium, monochromatic enterprise UI with mock authentication, RBAC and an analytics dashboard.

---

## 1. Project Description

The app consumes the free [Dictionary API](https://api.dictionaryapi.dev) and presents results in a clean, accessible, production-grade interface that runs on **Android** and **iOS** (and web via Metro). It extends the core exam brief with an enterprise layer: mock authentication, role-based access control, a premium analytics dashboard, a reusable component system and a full light/dark design system.

## 2. Exam Requirement Mapping

| Exam Activity | Where it is implemented |
| --- | --- |
| **A1 – Search & API integration** | `src/components/forms/SearchForm.tsx` (Formik + Yup), `src/services/dictionary.service.ts` (Axios, dynamic & URL-encoded URL), `src/contexts/DictionaryContext.tsx` (state + loading) |
| **A2 – Display word details** | `src/app/(app)/word-detail.tsx`, `src/features/dictionary/WordHeader.tsx`, `MeaningSection.tsx` (multiple meanings, scrollable `FlatList`) |
| **A3 – Audio pronunciation** | `src/hooks/useAudio.ts` (expo-av play/pause/stop/cleanup), `src/features/dictionary/PronunciationButton.tsx`, `AudioSelector.tsx` (multiple audios) |
| **A4 – Drawer navigation & history** | `src/app/(app)/_layout.tsx` (drawer), `src/components/navigation/DrawerContent.tsx`, `src/contexts/HistoryContext.tsx` (AsyncStorage, de-dup, clear), `src/app/(app)/history.tsx` |
| **A5 – Error handling & feedback** | `src/lib/http.ts` (404 / network / timeout normalization), `src/components/feedback/*` (Alert, EmptyState, ErrorState, SuccessState, Toast) |

## 3. Technology Stack

- **Expo SDK 52** + **Expo Router v4** (file-based routing, typed routes)
- **TypeScript** (strict)
- **NativeWind v4** (Tailwind class-based styling, class dark mode)
- **Axios** (two clients: public dictionary + mock enterprise with interceptors & token refresh)
- **Formik + Yup** (all forms & validation)
- **@tabler/icons-react-native** (neutral monochrome icons)
- **react-native-svg** (custom monochromatic charts)
- **expo-av** (pronunciation audio)
- **@react-native-async-storage/async-storage** + **expo-secure-store** (history, theme, session)
- **@react-navigation/drawer** via Expo Router

## 4. Setup Instructions

```bash
# Install dependencies (Bun recommended)
bun install

# or with npm
npm install
```

> **Important version note:** This project uses `nativewind@4.1.23` and pins
> `react-native-css-interop@0.1.22` (via `overrides`/`resolutions`) because newer
> NativeWind builds require `react-native-worklets` (Reanimated 4), which is
> incompatible with the SDK 52 Reanimated 3.16 baseline. Do not bump NativeWind
> without also upgrading Reanimated.

## 5. Run with Expo CLI

```bash
bun run start        # or: npx expo start
bun run android      # open on Android
bun run ios          # open on iOS
bunx tsc --noEmit    # type-check
```

Scan the QR code with **Expo Go**, or press `a` / `i` for an emulator/simulator.

## 6. API Endpoint Used

```
GET https://api.dictionaryapi.dev/api/v2/entries/en/{word}
```

The `{word}` is trimmed, lower-cased and URL-encoded in `fetchWord()`. The dictionary client requires **no authentication**. The mock enterprise client (`enterpriseClient`) is a separate Axios instance used only for the simulated auth/dashboard layer.

## 7. Screens Implemented

1. **Login** — `(auth)/login.tsx`
2. **Register** — `(auth)/register.tsx` (multi-step)
3. **Forgot Password** — `(auth)/forgot-password.tsx`
4. **Reset Password** — `(auth)/reset-password.tsx`
5. **Home / Search** — `(app)/search.tsx`
6. **Word Detail** — `(app)/word-detail.tsx`
7. **Search History** — `(app)/history.tsx`
8. **Dashboard** — `(app)/dashboard.tsx`
9. **Settings** — `(app)/settings.tsx`
10. **Profile / Account** — `(app)/profile.tsx`
11. **Not Found** — `+not-found.tsx`

## 8. Folder Structure

```
src/
├── app/                      # Expo Router routes
│   ├── _layout.tsx           # Providers + auth gate + root stack
│   ├── index.tsx             # Entry redirect
│   ├── +not-found.tsx
│   ├── (auth)/               # Public auth stack
│   │   ├── login.tsx  register.tsx  forgot-password.tsx  reset-password.tsx
│   └── (app)/                # Protected drawer app
│       ├── _layout.tsx (Drawer)  search.tsx  word-detail.tsx
│       ├── history.tsx  dashboard.tsx  settings.tsx  profile.tsx
├── components/
│   ├── ui/                   # AppCard, Button, Badge, Modal, ConfirmDialog,
│   │                         # Dropdown, Tabs, Tooltip, StatCard, ChartCard,
│   │                         # DataTable, Timeline, Avatar, Spinner, Skeleton…
│   ├── forms/                # FormTextInput, FormPasswordInput, SearchForm,
│   │                         # Select, Stepper, FileUpload
│   ├── feedback/             # Alert, StateView (Empty/Error/Success), ToastViewport
│   ├── navigation/           # TopNavBar, DrawerContent, UserMenu, ScreenHeader, ScreenContainer
│   └── charts/               # AreaChart, LineChart, BarChart, PieChart
├── features/
│   ├── dictionary/           # WordHeader, MeaningSection, PronunciationButton, AudioSelector
│   ├── dashboard/            # ExportButton
│   └── auth/                 # AuthScaffold, RequirePermission
├── contexts/                 # Theme, Auth, Permission, Notification, History, Dictionary
├── providers/                # AppProviders (composition root)
├── hooks/                    # useAudio, useDebouncedCallback
├── services/                 # dictionary, auth (mock), dashboard, analytics
├── lib/                      # http (axios clients + interceptors), validation (Yup)
├── types/                    # All TypeScript interfaces
├── constants/                # config, theme tokens, rbac
└── utils/                    # format helpers
```

## 9. State Management

React Context + custom hooks, organized by feature and composed in `AppProviders`:

- **ThemeContext** — light/dark/system preference, persisted; drives NativeWind class dark mode and chart/SVG token colours.
- **AuthContext** — mock session, login/register/logout, password reset, token refresh, secure persistence.
- **PermissionContext** — derives RBAC permissions from the current user and exposes `can()` / `hasRole()`.
- **NotificationContext** — global toast queue rendered by `ToastViewport`.
- **HistoryContext** — search history with AsyncStorage persistence and case-insensitive de-duplication.
- **DictionaryContext** — current word/entries/loading/error, the `search()` action, retry and reset.

## 10. Error Handling

`normalizeAxiosError()` maps every failure into a typed `ApiError` (`not-found`, `network`, `timeout`, `malformed`, `unknown`). The UI then:

- shows a friendly **“Word not found”** error state on 404,
- shows a network/timeout alert with a **Retry** button,
- defensively sanitizes every API entry (`sanitizeEntry`) so missing/null fields never crash a render,
- always hides the loading indicator in a `finally` block,
- shows an **empty state** before any search.

## 11. Audio Feature

`useAudio` wraps a single `expo-av` `Audio.Sound`. It exposes `play/pause/stop`, prevents overlapping playback (unloads previous sound), reuses the loaded sound for replays, and **cleans up native resources on unmount**. The speaker button is **only rendered when audio exists and the role has `dictionary.audio.play`**. When multiple audios exist, `AudioSelector` exposes US/UK/AU choices.

## 12. Search History

Successful searches only are stored (`addToHistory`) with word, timestamp, parts of speech and an `hasAudio` flag. Duplicates are removed case-insensitively and the most recent is moved to the top. History is persisted in AsyncStorage, surfaced in the **drawer** and the **History** screen, is filterable + paginated, and can be cleared (with confirmation, gated by `history.clear`). Tapping any history item triggers a fresh API request and navigates to the detail screen.

## 13. Mock Authentication

There is no real backend, so `auth.service.ts` validates credentials locally, issues simulated access/refresh tokens (15-min TTL) and supports refresh. Sessions persist via **SecureStore** on native and **AsyncStorage** on web. Routes are protected by an **AuthGate** in the root layout; per-screen access uses `RequirePermission`. Roles: **student**, **examiner**, **admin**, each with a fixed permission set (`constants/rbac.ts`). Demo accounts (password `Password1!`): `student@lexitech.rw`, `examiner@lexitech.rw`, `admin@lexitech.rw`.

## 14. Dashboard Mock Data

`dashboard.service.ts` derives KPIs and charts from locally tracked analytics events (`analytics.service.ts`) recorded on every search/audio/not-found/export action. When live data is sparse, a deterministic seed keeps the charts populated. Includes KPI cards, area/line/bar/pie charts, an activity timeline, a recent-searches data table, pull-to-refresh, a tabbed trend filter and a simulated CSV export.

## 15. Testing Checklist

- [ ] Search a valid word → detail screen shows word, phonetics, meanings, examples.
- [ ] Empty search → inline “Please enter a word” validation, no API call.
- [ ] Search a nonsense word → “Word not found” with Retry.
- [ ] Turn off network → network error alert with Retry.
- [ ] Word with audio → speaker plays; pause works; switching words stops previous audio.
- [ ] Word without audio → no speaker shown.
- [ ] History grows on success only, no duplicates; tapping re-searches.
- [ ] Clear history (examiner/admin) works; student has no clear button.
- [ ] Dashboard visible to examiner/admin; hidden + guarded for student.
- [ ] Settings visible to admin only.
- [ ] Toggle light/dark/system; persists across restart.
- [ ] Log out → redirected to login; protected routes inaccessible.

## 16. Known Limitations

- Authentication, RBAC and dashboard data are **mocked locally** (no real backend, by design of the brief).
- File upload and data export are **simulated** (no native file system / share sheet).
- Charts are hand-built with `react-native-svg` (no external chart lib) and use lightweight tooltips suited to touch.
- App icons/splash are omitted to keep the repo asset-free; add them under `assets/` and re-reference in `app.json` for store builds.

## 17. Design Artifacts

See [`docs/design-system.md`](docs/design-system.md) for the full design system, and [`docs/architecture.md`](docs/architecture.md) for the Data Flow Diagram, architecture diagram, endpoint mapping, screen list and workflows (Mermaid).
