import clock from "clock";
import * as document from "document";
import { preferences, units } from "user-settings";
import { zeroPad, getDay3, getMonth3, toFahrenheit } from "../common/utils";
import { resolveFaceConfig, DEFAULT_FACE_ID } from "../common/faces";
import * as newfile from "./newfile";
import { today, goals } from "user-activity";
import { inbox } from "file-transfer";
import { readFileSync } from "fs";

// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> element
const txtHours = document.getElementById("txtHours");
const txtHoursShadow = document.getElementById("txtHoursShadow");
const txtMinutes = document.getElementById("txtMinutes");
const txtMinutesShadow = document.getElementById("txtMinutesShadow");
const imgBackground = document.getElementById("imgBackground");
const txtWeather = document.getElementById("txtWeather");
const imgWeatherIcon = document.getElementById("imgWeatherIcon");
const txtDate = document.getElementById("txtDate");
const grpWeather = document.getElementById("grpWeather");

// Stats Elements
const arcSteps = document.getElementById("arcSteps");
const txtStepsVal = document.getElementById("txtStepsVal");
const arcDist = document.getElementById("arcDist");
const txtDistVal = document.getElementById("txtDistVal");
const arcCals = document.getElementById("arcCals");
const txtCalsVal = document.getElementById("txtCalsVal");
const grpSteps = document.getElementById("grpSteps");
const grpDist = document.getElementById("grpDist");
const grpCals = document.getElementById("grpCals");

let activeFace = resolveFaceConfig(DEFAULT_FACE_ID);

// Load settings
const SETTINGS_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";

function normalizeColor(value, fallback) {
  if (typeof value !== "string") return fallback;
  // Accept #RGB or #RRGGBB
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) return value;
  return fallback;
}

function loadSettings() {
  try {
    // Settings delivered via file-transfer reside under /private/data
    return readFileSync(`/private/data/${SETTINGS_FILE}`, SETTINGS_TYPE);
  } catch (ex) {
    return {};
  }
}

function setVisibility(element, isVisible) {
  if (!element || !element.style) return;
  element.style.display = isVisible ? "inline" : "none";
}

function applyTextPosition(element, position) {
  if (!element || !element.style || !position) return;
  if (position.x) element.style.x = position.x;
  if (position.y) element.style.y = position.y;
}

function applyFaceLayout(face) {
  const { layout, typography, features } = face;

  if (imgBackground && face.backgroundImage) {
    imgBackground.href = face.backgroundImage;
  }

  applyTextPosition(txtHours, layout.hours);
  applyTextPosition(txtHoursShadow, layout.hours);
  applyTextPosition(txtMinutes, layout.minutes);
  applyTextPosition(txtMinutesShadow, layout.minutes);
  applyTextPosition(txtDate, layout.date);
  applyTextPosition(txtWeather, layout.weather);

  if (imgWeatherIcon && imgWeatherIcon.style && layout.weatherIcon) {
    imgWeatherIcon.style.x = layout.weatherIcon.x;
    imgWeatherIcon.style.y = layout.weatherIcon.y;
    imgWeatherIcon.style.width = layout.weatherIcon.width;
    imgWeatherIcon.style.height = layout.weatherIcon.height;
  }

  if (txtHours && txtHours.style) txtHours.style.fontSize = typography.timeSize;
  if (txtMinutes && txtMinutes.style) txtMinutes.style.fontSize = typography.timeSize;
  if (txtHoursShadow && txtHoursShadow.style) txtHoursShadow.style.fontSize = typography.timeSize;
  if (txtMinutesShadow && txtMinutesShadow.style) txtMinutesShadow.style.fontSize = typography.timeSize;
  if (txtDate && txtDate.style) txtDate.style.fontSize = typography.dateSize;
  if (txtWeather && txtWeather.style) txtWeather.style.fontSize = typography.weatherSize;

  setVisibility(txtDate, features.showDate);
  setVisibility(grpWeather, features.showWeather);

  setVisibility(grpSteps, features.showActivity);
  setVisibility(grpDist, features.showActivity);
  setVisibility(grpCals, features.showActivity);
}

function applySettings(settings) {
  const selectedFaceId = settings.faceid || settings.faceId || DEFAULT_FACE_ID;
  activeFace = resolveFaceConfig(selectedFaceId);

  const timeColor = normalizeColor(settings.timecolor, activeFace.colors.time);
  const textColor = normalizeColor(settings.textcolor, activeFace.colors.text);

  applyFaceLayout(activeFace);
  
  if (txtHours && txtHours.style) {
    txtHours.style.fill = timeColor;
  }
  if (txtMinutes && txtMinutes.style) {
    txtMinutes.style.fill = timeColor;
  }
  if (txtDate && txtDate.style) {
    txtDate.style.fill = textColor;
  }
  if (txtWeather && txtWeather.style) {
    txtWeather.style.fill = textColor;
  }
}

// Apply settings on start
applySettings(loadSettings());

// Listen for settings file changes
inbox.addEventListener("newfile", () => {
  let fileName;
  while ((fileName = inbox.nextFile())) {
    if (fileName === SETTINGS_FILE) {
      applySettings(loadSettings());
    }
  }
});

// Update the <text> element every tick with the current time


function updateClockDisplay(today) {
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = zeroPad(hours);
  }
  let mins = zeroPad(today.getMinutes());
  txtHours.text = `${zeroPad(hours)}`;
  txtHoursShadow.text = txtHours.text;
  txtMinutes.text = `${mins}`;
  txtMinutesShadow.text = txtMinutes.text;
  txtDate.text = `${getDay3(today.getDay())}, ${today.getDate()} ${getMonth3(today.getMonth())}`;
}

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  updateClockDisplay(evt.date);
  updateActivity();
}

function updateActivity() {
  if (!activeFace.features.showActivity) return;

  // Steps
  const steps = (today.adjusted && today.adjusted.steps) || 0;
  const stepsGoal = (goals && goals.steps) || 10000;
  if (txtStepsVal) txtStepsVal.text = steps;
  if (arcSteps) arcSteps.sweepAngle = Math.min(360, (steps / stepsGoal) * 360);

  // Distance
  const dist = (today.adjusted && today.adjusted.distance) || 0; // meters
  const distGoal = (goals && goals.distance) || 5000;
  if (txtDistVal) txtDistVal.text = (dist / 1000).toFixed(1); // km
  if (arcDist) arcDist.sweepAngle = Math.min(360, (dist / distGoal) * 360);

  // Calories
  const cals = (today.adjusted && today.adjusted.calories) || 0;
  const calsGoal = (goals && goals.calories) || 2000;
  if (txtCalsVal) txtCalsVal.text = cals;
  if (arcCals) arcCals.sweepAngle = Math.min(360, (cals / calsGoal) * 360);
}

// Weather initialization moved to end of file

// Initialize heart rate monitoring if available
// (Heart rate UI removed for now as per request for circular stats)
// Initial population of stats
updateActivity();

newfile.initialize(data => {
  try {
    if (!activeFace.features.showWeather) {
      return;
    }

    // fresh weather file received
    // Respect user temperature preference: if the device preference is Fahrenheit
    // but the incoming data is in Celsius, convert it before display.
    let displayData = data;
    try {
      if (typeof units !== "undefined" && units.temperature === "F" && data.unit && data.unit.toLowerCase().indexOf("c") !== -1) {
        // Create a shallow copy manually to avoid Object.assign issues
        let dataCopy = JSON.parse(JSON.stringify(data));
        displayData = toFahrenheit(dataCopy);
      }
    } catch (ex) {
      console.warn(`Temperature conversion skipped: ${ex}`);
    }

    const unitSymbol = displayData.unit && displayData.unit.toLowerCase().indexOf("f") === 0 ? "F" : "C";
    if (typeof txtWeather !== "undefined" && txtWeather) {
       txtWeather.text = `${displayData.temperature}\u00B0${unitSymbol}`;
    }
    
    if (imgWeatherIcon && displayData.conditionCode !== undefined) {
      let icon = "weather-variable.png"; // Default
      const code = parseInt(displayData.conditionCode);
      
      // Mapping based on Fitbit WeatherCondition enum
      // 1: ClearSky, 2: FewClouds, 3: ScatteredClouds, 4: BrokenClouds, 
      // 5: ShowerRain, 6: Rain, 7: Thunderstorm, 8: Snow, 9: Mist
      
      if (code === 1) {
        icon = "weather-sunny.png";
      } else if (code === 2 || code === 3) {
        icon = "weather-variable.png";
      } else if (code === 4 || code === 9) {
        icon = "weather-cloudy.png";
      } else if (code === 5 || code === 6 || code === 8) {
        icon = "weather-rain.png";
      } else if (code === 7) {
        icon = "weather-thunder.png";
      }
      
      imgWeatherIcon.href = icon;
    }

    // Refresh the clock display immediately after receiving weather
    if (typeof updateClockDisplay === "function") {
      updateClockDisplay(new Date());
    }
  } catch (e) {
    console.error("Error in weather callback: " + e);
  }
});