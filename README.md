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

## Changelog (automated fixes)

- 2025-12-07: Extracted clock update logic into `updateClockDisplay()` and removed invalid `clock.tick()` calls.
- 2025-12-07: Fixed invalid CSS arithmetic in `resources/styles.css`.
- 2025-12-07: Optimized inbox handling in `app/newfile.js` to avoid unnecessary reads.
- 2025-12-07: Added defensive validation in `companion/index.js` for weather payloads.
- 2025-12-07: Respect device temperature preference and convert Celsius→Fahrenheit when needed.
- 2025-12-07: Updated `package.json` to reference existing `resources/superman-bg.png` as the app icon to avoid missing-resource errors.