# LexiTech Dictionary — Architecture & Design Notes

## Data Flow Diagram (DFD)

```mermaid
flowchart TD
    U([User]) -->|enters word| SF[SearchForm + Yup]
    SF -->|valid word| DC[DictionaryContext.search]
    DC -->|GET entries/en/word| SV[dictionary.service / Axios]
    SV -->|HTTPS| API[(Free Dictionary API)]
    API -->|JSON entries| SV
    SV -->|sanitized entries| DC
    DC -->|success| HIST[(AsyncStorage: history)]
    DC -->|track event| AN[(AsyncStorage: analytics)]
    DC -->|state| WD[Word Detail Screen]
    WD -->|audio url| AU[useAudio / expo-av]
    DC -->|ApiError| ERR[Error / Empty States]
    AN --> DSH[Dashboard Service] --> DASH[Dashboard Screen]
    HIST --> DRW[Drawer + History Screen]
```

## Application Architecture

```mermaid
flowchart TB
    subgraph Routing[Expo Router]
      RL[_layout: AppProviders + AuthGate]
      AUTH[(auth) stack]
      APP[(app) drawer]
    end
    subgraph State[Contexts]
      THEME[ThemeContext]
      AUTHC[AuthContext]
      PERM[PermissionContext]
      NOTIF[NotificationContext]
      HISTC[HistoryContext]
      DICTC[DictionaryContext]
    end
    subgraph Services[Service Layer]
      DSVC[dictionary.service]
      ASVC[auth.service - mock]
      DASHS[dashboard.service]
      ANS[analytics.service]
    end
    subgraph Lib
      HTTP[http: dictionaryClient + enterpriseClient]
      VAL[validation: Yup schemas]
    end
    RL --> State
    AUTH --> AUTHC
    APP --> DICTC
    DICTC --> DSVC --> HTTP
    AUTHC --> ASVC
    DASHS --> ANS
    PERM --> AUTHC
    State --> UI[Reusable Components + Screens]
```

## API Endpoint Mapping

| Feature | Method & Endpoint | Client | Auth |
| --- | --- | --- | --- |
| Word lookup | `GET /api/v2/entries/en/{word}` | `dictionaryClient` | None |
| Login / Register / Reset / Refresh | simulated | `enterpriseClient` (mock service) | Bearer (mock) |
| Dashboard analytics | local derivation from analytics events | n/a | mock RBAC |

## Screen List

`login`, `register`, `forgot-password`, `reset-password`, `search`, `word-detail`, `history`, `dashboard`, `settings`, `profile`, `+not-found`.

## Workflows

```mermaid
sequenceDiagram
    participant U as User
    participant A as AuthContext
    participant G as AuthGate
    U->>A: login(email, password)
    A->>A: issue mock tokens + persist (SecureStore)
    A-->>G: isAuthenticated = true
    G->>U: redirect to /search

    U->>U: search "lucid"
    U->>API: GET entries/en/lucid
    API-->>U: entries JSON
    U->>U: save history + track analytics + open detail
    U->>U: tap speaker → expo-av plays audio
```

### Role-Based Access

| Permission | student | examiner | admin |
| --- | :---: | :---: | :---: |
| dictionary.search | ✓ | ✓ | ✓ |
| dictionary.audio.play | ✓ | ✓ | ✓ |
| history.view | ✓ | ✓ | ✓ |
| history.clear | | ✓ | ✓ |
| dashboard.view | | ✓ | ✓ |
| settings.manage | | | ✓ |
