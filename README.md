# CampusNow

A student-facing campus operations app: report a problem, find out whether it is
already being handled, follow it, and get told when it is fixed.

This repository is the **mobile app prototype**: a real Expo / React Native
application (not a web app, not a wrapper) built with TypeScript, Expo Router and
a custom design system. It runs on Android and iOS and currently works entirely
against local mock data.

```
Student → local mock reports     (now)
Student → CampusNow API → ServiceNow   (next)
```

---

## 1. Running it

```bash
npm install
npx expo start          # scan the QR with Expo Go, or press a / i
```

### Checking the UI in a browser

The app runs on the web through `react-native-web`, which is the fastest way to
see the interface without a device:

```bash
npm run web             # starts the web target and opens http://localhost:8081
```

If it does not open a tab for you (or you are in a non-interactive shell), run it
without the browser step and open the URL yourself:

```bash
BROWSER=none npx expo start --web --port 8081
# then visit http://localhost:8081
```

Then press **F12** and switch on device emulation (Chrome → the phone icon →
*iPhone 14 Pro* or any 390-wide preset) so you see the phone layout rather than
stretched desktop columns. Leave the dev server running and the page hot-reloads
on every edit.

> Browser caveats: `BlurView` is a CSS `backdrop-filter` approximation, the
> camera / GPS / haptics paths fall back to their permission-denied UI, and
> `adjustsFontSizeToFit` is not implemented — anything that would rely on it is
> avoided. Use the web view for layout and interaction, then confirm the native
> extras on a device.

Other scripts:

| Command | What it does |
| --- | --- |
| `npm start` | Expo dev server |
| `npm run web` | Dev server on the web target, opens the browser at `localhost:8081` |
| `npm run android` | Start and open on a connected Android device / emulator |
| `npm run ios` | Start and open the iOS simulator (macOS) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run export:android` / `export:ios` | Production JS bundle, proves the app builds for the store |

Native modules used (all work inside Expo Go, all permission strings are declared
in `app.json`): **expo-camera** (QR plates), **expo-location** (nearest block),
**expo-image-picker** (evidence photos), **expo-notifications** (local nudges),
**expo-blur** (glass surfaces), **expo-haptics**, **expo-font**.

---

## 2. Structure

```
app/                        Expo Router routes
  _layout.tsx               Root stack: fonts + persisted store gate, then routes
  (tabs)/
    _layout.tsx             Bottom tabs rendered as the floating docnav
    index.tsx               Home
    report.tsx              Report something (category selection)
    campus.tsx              Campus Pulse
    reports.tsx             My reports
    profile.tsx             Profile
  report/
    location.tsx            Where is it happening?
    duplicate.tsx           Smart duplicate detection
    review.tsx              Review & submit
    details.tsx             Report details + timeline + activity
    scan.tsx                QR plate scanner
  campus/
    map.tsx                 Campus diagram explorer
    service.tsx             Single service detail
  profile/
    notifications.tsx       Notification preferences
    campus.tsx              Campus details + blocks
    help.tsx                Help & feedback
  notifications.tsx         Notification feed

components/
  navigation/FloatingDocNav.tsx   The floating dock
  layout/                         Screen shell, header, page heading
  report/                         Category tiles, filter tabs, feed items, timeline, status panel
  campus/                         Campus map, service blocks, issue rows, pulse block
  ui/                             Grid primitives, surfaces, glass, buttons, metrics, dividers

constants/    colors, spacing, typography, layout (grid + corner geometry + shadows)
data/         mock/ seed data + campusApi facade
hooks/        grid metrics, store selectors, geolocation, photo picker, app readiness,
              live-stage clock + lifecycle driver
stores/       zustand stores (persisted app data + transient report draft)
types/        domain types (User, Report, Service, CampusLocation, CampusBuilding, …)
utils/        formatting, status/timeline + live-stage logic, QR parsing, geo, haptics,
              notifications
assets/       icons and splash
```

---

## 3. Design system

* **Grid.** A 4-column invisible grid (`constants/layout.ts` → `useGrid()`). Every
  composition is written with `Row` / `Col span={n}` / `Stack`, so blocks can be
  different sizes while sharing one set of edges. Row heights are expressed in
  reference pixels and multiplied by a scale factor derived from the window width,
  so nothing is pinned to one device.
* **No shadows.** `shadows` is intentionally empty. A pure white canvas is
  separated by a 1px grey border (`colors.line`) instead — that is what keeps a
  white-on-white interface crisp rather than puffy.
* **Corner geometry.** Every container is rounded equally on all four sides.
  `corners` (`constants/layout.ts`) is a semantic radius scale — `tiny` (10),
  `block` (13), `leaf` (16), `panel` (18), `wide` (20) for surfaces, `button`
  (14) / `chip` (12) for controls, and `pill` / `dock` for badges and the dock —
  so a tile, a card and a dock share one language.
* **Colour has meaning only.** White surfaces and grey borders everywhere; text
  is near-black, grey, blue (actions, links, the current destination) or red
  (destructive, critical). Teal and amber are reserved for service health.
* **Glass** is reserved for the dock, the home report surface, the report status
  panel, the selected-location control and the camera footer. Everything else is
  solid and readable.
* **Typography.** Poppins, loaded once in the root layout. Large headlines, quiet
  metadata, wide-tracked uppercase micro labels.
* **Colour.** Cool off-white canvas, one blue (`#287AF5`), near-black navy text,
  and three restrained status accents (teal / amber / red).
* **Motion.** `react-native-reanimated` powers the dock entrance, the active tab
  pill, the live progress bar and every press. Haptics fire on the same
  interactions.
* **App chrome.** One header on every screen: a leading mark (or back control),
  a search field that grows to fill the bar, one icon control and the account
  avatar. The dock is a white glass pill that **floats over the content**, sized
  by its icons, with the current destination marked by a blue icon — no filled
  block behind it. `Screen` reserves the dock's band so nothing is ever stuck
  underneath it.

---

## 4. Data layer — swapping mock for API

```ts
// data/campusApi.ts
await campusApi.listReports();          // → GET  /api/reports
await campusApi.createReport(input);    // → POST /api/reports
await campusApi.findDuplicate(category);// → GET  /api/reports/similar?category=
await campusApi.followIssue(id);        // → POST /api/reports/:id/follow
```

Today each function resolves from the local zustand store (`stores/appStore.ts`),
which is seeded by `data/mock/*` and persisted with AsyncStorage. Screens read
through the hooks in `hooks/useCampusData.ts` and write through `campusApi`, so
replacing the bodies of those functions with `fetch` calls is the only change
needed — no screen touches storage directly, and no screen knows the data is
mocked.

`utils/status.ts` derives the operations lifecycle (Reported → Confirmed →
Assigned → Investigating → Resolved), the activity log, the live stage and the
expected-update window from a report's status. When the real API returns a
timeline, that module is replaced by the response mapping.

### Smart duplicate detection

`campusApi.findDuplicate()` matches the draft against active reports by category,
then by affected service, and links the campus issue already tracking it — which
is what produces the "47 students affected" hero. In production this becomes a
ranking call on the backend; the screen does not change.

---

## 5. What works in the prototype

* Five destinations behind a compact icon-only glass dock; the active icon sits
  on a filled primary pill so the current screen is never ambiguous.
* Full report flow: category → location (diagram, floor/room, GPS, QR scan) →
  duplicate check → review with photo evidence and severity → submit → live
  status screen with timeline, activity and a confirm/reopen loop.
* Reports are created locally, persist across restarts, appear in My reports,
  update the profile counters and create a notification.
* **Live stage tracking.** A report filed from this device keeps moving through
  Reported → Confirmed → Assigned → Investigating → Resolved on a compressed
  clock (`LIVE_STAGE_MS`, 45s per stage). `useLiveTracking()` commits every
  transition to the store, so the report screen shows the current stage with a
  filling progress bar and a countdown, while the feed, the counters and the
  notification list move with it. Real timestamps come from the API later; only
  the driver changes.
* Notifications feed with read/unread, mark-all-as-read, deep links to the report.
* Campus Pulse with service health, major issues and the campus diagram explorer.
* Profile: identity hero, one horizontal statistics card (reports / resolved /
  active) and a grouped settings list that pushes to real sub-screens —
  notification preferences (working switches), campus details (every block and
  its open issues) and help & feedback. Sign out clears the local demo data.

## 6. Deliberately not in this milestone

Authentication, the ServiceNow integration, SQLite/offline sync, push
notifications from a server, and any AI summarisation. There is also no
replacement of the university's operational systems — reports are local until
the API exists.

## 7. Verification

* `npm run typecheck` is clean, including generated typed routes.
* `npm run export:ios` and `export:android` both produce a production Hermes
  bundle, which proves every route, import and asset resolves.
* The dev server serves the CampusNow manifest and a 13 MB dev bundle without
  errors, with the Reanimated worklets plugin applied.
* UI was not smoke-tested on a physical device in this environment — run
  `npx expo start` and scan the QR with Expo Go to walk the flows.
