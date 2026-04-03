# QA Validation Plan - Fitbit Multi-Face Template

## Scope
This plan validates the Phase 1 runtime variant implementation:
- face registry and fallback
- settings to companion to app transfer for selected face
- per-face feature toggles (date, weather, activity)
- build compatibility for atlas and vulcan targets

## Entry Criteria
1. Node dependencies installed with npm install.
2. Fitbit build tooling available in workspace.
3. App can be installed in simulator and at least one physical device session is available.
4. Current branch contains the runtime variant changes.

## Automation Commands
1. Run full QA gate:
	- npm run qa:gate
2. Run layout checks only:
	- npm run validate:layout

The layout validator checks every face profile against all build targets for:
- required config keys
- viewport bounds (text and icon positions)
- text overlap heuristics (hours/minutes and date/weather)
- default face integrity and fallback readiness

Note: pixel-perfect visual correctness on physical hardware cannot be fully proven by static checks alone. Keep the device screenshot checklist as a required final verification step.

## Exit Criteria
1. All P0 acceptance criteria pass.
2. At least 95 percent of P1 acceptance criteria pass.
3. No open crash, freeze, or data-corruption defect.
4. Any non-blocking defect has documented workaround and owner.
5. Build succeeds for all configured targets.

## Acceptance Criteria

### P0 - Must Pass
1. Build success:
- Command: npm run build
- Expected: app, companion, and settings build complete with exit code 0.
- Evidence: terminal output attached to QA run.

2. Default startup behavior:
- Condition: no face selected or missing faceid in settings payload.
- Expected: app loads superman-classic and renders without runtime error.
- Evidence: screenshot plus logs.

3. Face selection roundtrip:
- Action: choose Superman Minimal in settings.
- Expected: companion sends faceid, app applies minimal variant at runtime.
- Evidence: before and after screenshots, settings payload/log confirmation.

4. Weather toggle behavior:
- Action: run minimal face where weather is disabled.
- Expected: weather group is hidden and weather callback does not produce visible updates.
- Evidence: screenshot and no weather UI rendered.

5. Activity toggle behavior:
- Action: run minimal face where activity is disabled.
- Expected: activity groups are hidden and activity updates do not render rings/labels.
- Evidence: screenshot and no activity groups visible.

6. Classic face behavior:
- Action: switch to superman-classic.
- Expected: date, weather, and activity all visible and updating.
- Evidence: screenshot and observed updates.

### P1 - Should Pass
1. Color override precedence:
- Action: set time color and text color from settings.
- Expected: selected colors override face defaults immediately after sync.

2. Typography/layout application:
- Action: switch between classic and minimal.
- Expected: positions and sizes differ according to face definition.

3. Invalid face value fallback:
- Action: force faceid to unknown value.
- Expected: app falls back to superman-classic without crash.

4. Weather icon mapping:
- Action: verify at least two weather condition codes.
- Expected: icon changes according to mapping logic.

## End-to-End Validation Flows

### E2E Flow 1 - Fresh Install Smoke
1. Build with npm run build.
2. Install to simulator or device.
3. Launch app without changing settings.
4. Verify clock updates every minute.
5. Verify default face renders and no crash occurs.

Pass condition: default experience works out of the box.

### E2E Flow 2 - Runtime Variant Switching
1. Open Fitbit settings page.
2. Select Superman Minimal.
3. Wait for sync.
4. Confirm weather/activity hidden.
5. Select Superman Classic.
6. Wait for sync.
7. Confirm weather/activity/date visible and active.

Pass condition: both transitions work without reinstall.

### E2E Flow 3 - Settings Overlay Precedence
1. Start with classic face.
2. Set time color to a highly visible color.
3. Set text color to a different visible color.
4. Confirm app reflects chosen colors.
5. Switch to minimal face and verify user color overrides remain applied.

Pass condition: user settings win over face defaults for configurable fields.

### E2E Flow 4 - Resilience and Fallback
1. Inject or simulate invalid faceid in settings payload.
2. Relaunch app.
3. Verify fallback to superman-classic.
4. Verify no runtime exception in logs.

Pass condition: invalid config does not break app usability.

## Test Matrix

| Area | Simulator | Physical Device |
|---|---|---|
| Build/install | Required | Required |
| Face switching | Required | Required |
| Weather visibility toggle | Required | Required |
| Activity visibility toggle | Required | Required |
| Color override sync | Required | Required |
| Fallback on invalid face | Required | Recommended |

## Evidence Checklist
1. Build log with timestamp.
2. Layout validator output log (pass or fail report).
3. Screenshot: classic default.
4. Screenshot: minimal variant.
5. Screenshot: classic after switching back.
6. Screenshot: color override applied.
7. Defect list with severity and status.
8. Final QA sign-off note.

## Defect Severity Rules
- P0 blocker: crash, startup failure, or broken face switching.
- P1 major: feature works inconsistently but workaround exists.
- P2 minor: visual defect not affecting core behavior.

## Suggested Sign-Off Template
Date: YYYY-MM-DD
Build ID: <fitbit build id>
Tester: <name>
P0 pass: Yes or No
P1 pass rate: <percent>
Open defects: <count>
Decision: Approved for done or Not approved
Notes: <short summary>
