Plan: Improve Clockface Readability for Fitbit Superman

Goal: Stop text overlap (date/weather vs large time). Adjust layout, sizing, and weather string length.

Steps
1) Time styling (resources/styles.css)
   - Reduce time font sizes (e.g., hours ~110, minutes ~100).
   - Shift minutes upward (y ~82–84%).
   - Optionally nudge hours up (y ~56–58%).

2) Positions (resources/index.view)
   - Move txtHours y to ~56–58%.
   - Move txtDate y to ~24–26% for spacing above weather.

3) Weather wrapping (resources/styles.css)
   - Set width ~80–84% and left padding x ~8–10%.
   - Enable wrapping via line-increment so long strings break onto a new line.

4) Weather string (app/index.js)
   - Shorten to “<temp>° <unit> · <condition>”.
   - Optionally place location on a second line or omit to avoid collisions.

5) Verify in simulator (Sense/Versa targets)
   - Build and run; adjust offsets/sizes if any overlap remains.

Open question
- Preference for location: hidden, on second line, or truncated/ellipsis?
