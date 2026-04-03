# Superman Clock

Superman Clockface for Fitbit Sense Smartwatches

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v14+ recommended)
- [Fitbit OS Simulator](https://dev.fitbit.com/getting-started/) (for testing on computer)
- A Fitbit device (Sense, Versa 3, etc.) with Developer Bridge enabled.

### Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running on Simulator
1. Open the Fitbit OS Simulator.
2. Run the build and install command:
   ```bash
   npx fitbit-build
   npx fitbit
   ```
3. In the Fitbit shell, type:
   ```
   install
   ```

### Running on Physical Device
1. Enable **Developer Bridge** on your watch (Settings > Developer Bridge).
2. Connect your phone to the same Wi-Fi network as your computer (or use the simulator bridge).
3. Run the Fitbit shell:
   ```bash
   npx fitbit
   ```
4. Type `connect phone` and follow the instructions to connect to your device.
5. Type `install` to sideload the app.

## Features
- Time and Date
- Real-time Heart Rate
- Steps Counter
- Weather (Temperature in C/F based on user settings)
- Customizable Colors (via Fitbit App Settings)

## Template Variant System (Phase 1)

This project now includes a reusable face template registry so one app can host multiple clockface variants.

### What is implemented
- Face registry in `common/faces.js`.
- Runtime face selection from settings (`faceid`) via companion transfer in `settings.cbor`.
- Per-face controls for:
   - Colors (time/text defaults)
   - Typography sizes
   - Layout positions for time/date/weather
   - Feature toggles (date, weather, activity)

### Existing variants
- `superman-classic`
- `superman-minimal`

### How to switch variants
1. Open the Fitbit settings page for the app.
2. Select a value in **Clock Face Variant**.
3. The companion sends the selected `faceid` to the device.
4. The app applies that face at runtime (with fallback to `superman-classic`).

### How to add a new variant
1. Add a new entry under `FACE_DEFINITIONS` in `common/faces.js`.
2. Include `id`, `label`, `colors`, `typography`, `layout`, and `features`.
3. Add the variant to `faceOptions` in `settings/index.js`.
4. Rebuild and install.

## QA, Acceptance Criteria, and End-to-End Validation

Use the formal QA checklist and sign-off template in:
- [docs/QA_VALIDATION.md](docs/QA_VALIDATION.md)

Recommended release gate before marking work as done:
1. All P0 criteria pass.
2. P1 pass rate is at least 95 percent.
3. Build and runtime evidence is attached.

Automation commands:
- `npm run validate:layout` validates variant layout rules across target device profiles.
- `npm run qa:gate` runs build + layout validation as a single acceptance gate.

## Changelog (automated fixes)

- 2025-12-07: Extracted clock update logic into `updateClockDisplay()` and removed invalid `clock.tick()` calls.
- 2025-12-07: Fixed invalid CSS arithmetic in `resources/styles.css`.
- 2025-12-07: Optimized inbox handling in `app/newfile.js` to avoid unnecessary reads.
- 2025-12-07: Added defensive validation in `companion/index.js` for weather payloads.
- 2025-12-07: Respect device temperature preference and convert Celsius→Fahrenheit when needed.
- 2025-12-07: Updated `package.json` to reference existing `resources/superman-bg.png` as the app icon to avoid missing-resource errors.