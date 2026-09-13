# Security Assessment Generator (SAG)

A professional Android mobile application for cybersecurity professionals, penetration
testers, security consultants, and students to organize authorized security assessment
work and generate polished, client-ready assessment reports.

> **This is a documentation and reporting tool, not an attack tool.** SAG does not scan,
> exploit, or attack anything. It helps you record what you found during an *authorized*
> assessment and turns that record into a professional PDF report. See
> [Ethical Use](#ethical-use) below.

## Problem

Security consultants and pentesters typically juggle scattered notes, screenshots, and
spreadsheets across an engagement, then spend hours manually assembling a findings
report in a word processor at the end. There's no lightweight, mobile-first tool to
capture assessment data (scope, assets, findings, evidence) as it's discovered and turn
it into a consistent, professional report.

## Solution

SAG lets you record an engagement end-to-end on your phone as you work:

```
Client -> Assessment -> Scope -> Assets -> Findings -> Evidence -> Report Preview -> PDF -> Share
```

Every report is generated strictly from data you entered — SAG never fabricates
findings, evidence, CVSS scores, or recommendations.

## Features

- Email/password authentication (Firebase Auth), with persisted sessions
- Client management (CRUD)
- Assessment management with scope, in-scope/out-of-scope items, and assets
- Findings with severity (Critical/High/Medium/Low/Informational), status, CVSS, CWE,
  OWASP category, and a built-in + custom finding template library
- Evidence attachments (screenshots via Firebase Storage, text notes)
- Dashboard with assessment/finding statistics and risk overview
- Report Preview before generating a PDF
- On-device PDF report generation with native Android share sheet
- Report history
- Per-user profile and report letterhead settings (prepared by, company, contact info)
- A dark, professional UI built around a consistent design system (see
  [Theme](#theme)) — no hacker clichés

Screens implemented so far are listed under [Project Status](#project-status).

## Screenshots

_Added as the UI is built out. See [Project Status](#project-status) for what's currently
implemented._

## Technology Stack

| Layer | Choice | Why |
|---|---|---|
| App framework | [Expo](https://expo.dev) (React Native) + TypeScript | No local Android SDK / Java 17 required for development; [EAS Build](https://docs.expo.dev/build/introduction/) builds the production APK/AAB in the cloud; Expo Go gives instant on-device testing |
| Backend | Firebase (Auth, Firestore, Storage) | Free-tier friendly, no server to run, tight mobile SDK integration |
| Navigation | React Navigation (native-stack + bottom-tabs) | De facto standard, well supported on Expo |
| PDF generation | `expo-print` | On-device generation, no backend needed |
| Sharing | `expo-sharing` | Native Android share sheet |

## Architecture

```
src/
  components/   Reusable UI building blocks (buttons, fields, cards, states)
  screens/      One folder per feature area (auth, dashboard, clients, ...)
  navigation/   React Navigation stacks/tabs and route param types
  services/     Firebase-backed data access functions, one file per domain
  firebase/     Firebase app/auth/firestore/storage initialization
  context/      React context providers (auth state, etc.)
  hooks/        Shared React hooks
  utils/        Framework-agnostic helper functions
  types/        Shared TypeScript types/interfaces
  constants/    Enums and lookup metadata (severity, status, categories, ...)
  theme/        Colors, spacing, typography tokens
```

Every user-owned Firestore document carries an `ownerId` set to the authenticated
Firebase Auth UID — never a client-supplied value — and Firestore/Storage security
rules enforce that a user can only read or write their own data (see
[Security](#security)).

## Firebase Setup

The app needs a Firebase project before authentication, Firestore, or Storage will work.

1. Create a free project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication** -> Sign-in method -> enable **Email/Password**.
3. **Firestore Database** -> create database (start in production mode; the rules in
   `firestore.rules` lock it down).
4. **Storage** -> get started (production mode; see `storage.rules`).
5. Project settings -> General -> Your apps -> add a Web app (Firebase's JS SDK is used
   even though this is a mobile app, since Expo/React Native consumes the Firebase JS
   SDK) -> copy the config values.
6. Copy `.env.example` to `.env` in the project root and fill in the
   `EXPO_PUBLIC_FIREBASE_*` values from step 5.
7. Deploy the security rules once you have the Firebase CLI logged in and linked to your
   project:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

`.env` is git-ignored; never commit it.

## Database Structure

Logical Firestore collections (see `src/types/` for the corresponding TypeScript
shapes):

- `users/{uid}` — profile + report letterhead settings
- `clients/{clientId}` — `ownerId`, company/contact info
- `assessments/{assessmentId}` — `ownerId`, `clientId`, type, dates, status
- `assessments/{assessmentId}/scope/{scopeItemId}` (planned Stage 3) — in/out of scope items
- `assets/{assetId}` — `ownerId`, `assessmentId`
- `findings/{findingId}` — `ownerId`, `assessmentId`, severity/status/CVSS/etc.
- `findings/{findingId}/evidence/{evidenceId}` (planned Stage 5) — screenshots/notes
- `reports/{reportId}` — `ownerId`, generated report metadata
- `findingTemplates/{templateId}` — built-in + custom reusable finding templates

Evidence screenshots are stored in Firebase Storage under
`users/{userId}/assessments/{assessmentId}/findings/{findingId}/evidence/`.

## Security

- Firebase Auth UID is the only source of truth for ownership — the client never sends
  a trusted `userId`.
- `firestore.rules` and `storage.rules` default-deny everything, then explicitly open
  only a signed-in user's own data.
- No secrets, API keys, or service account credentials are committed. `.env`,
  `google-services.json`, `GoogleService-Info.plist`, and `*serviceAccount*.json` are
  git-ignored.
- Evidence files are never made public and are validated for content type and size
  before upload.

## Local Development

Requirements: Node.js 20+, npm. No Android SDK or Java installation is required for
day-to-day development — Expo Go handles that.

```bash
npm install
cp .env.example .env   # then fill in your Firebase config
npm start               # opens Expo dev tools; scan the QR code with Expo Go on Android
```

Useful scripts:

```bash
npm run android   # start Metro and open on a connected device/emulator
npm run web        # run in a browser (useful for a quick UI smoke test; not the target platform)
npx tsc --noEmit   # type-check
```

## Android Build

Production Android builds are produced with [EAS Build](https://docs.expo.dev/build/introduction/)
so a local Android SDK / Java 17 installation is not required:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview   # installable APK
eas build --platform android --profile production # AAB for Play Store
```

## Limitations

- MVP targets Android only; iOS is not tested.
- No automated scanning, exploitation, or attack functionality is implemented, and none
  is planned — see [Ethical Use](#ethical-use).
- Report PDFs are regenerated on demand from Firestore data rather than stored in
  Firebase Storage, to stay within free-tier quotas.
- PDF page headers/footers and running page numbers are not implemented — `expo-print`
  renders the report HTML to PDF without a page-number injection mechanism. Major
  sections still start on their own page via CSS page breaks.
- Single-user accounts only; there is no team/organization collaboration in the MVP.

## Roadmap

Not part of the MVP, listed here for context on planned direction:

- CVSS calculator, custom report logo, advanced filters/charts, assessment duplication
- AI-assisted analysis, automated scanning/tool integrations (Nmap, Burp, ZAP, Nessus)
- Vulnerability import, continuous monitoring
- Team collaboration, client portal, organization accounts
- Paid subscription tiers, web dashboard

## Ethical Use

Security Assessment Generator is intended **only** for documenting security assessments
you are explicitly authorized to perform. It is a reporting and organization tool, not
an authorization bypass or attack platform. You are responsible for ensuring you have
written authorization for any system you assess.

## Project Status

Being built incrementally. Current stage:

- [x] **Stage 1** — Project setup, theme, navigation foundation, Firebase integration,
      email/password authentication (Splash, Login, Register, Forgot Password)
- [x] **Stage 2** — Dashboard (stats, risk overview, recent activity), Clients
      (create/edit/delete/view, search, assessment count)
- [x] **Stage 3** — Assessments (create/edit/delete/view, search, status filter),
      Assessment Details (Overview/Scope/Assets tabs), Scope items, Assets
- [x] **Stage 4** — Findings (create/edit/delete/view, severity, status),
      Finding Library with 10 built-in templates
- [x] **Stage 5** — Evidence (screenshot + text notes) with Firebase
      Storage, Report Preview
- [x] **Stage 6** — On-device PDF generation and native share sheet,
      Report History, Profile (report letterhead settings)
- [ ] **Stage 7** — Security rule hardening, testing, production build prep
