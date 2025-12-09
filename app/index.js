import clock from "clock";
import * as document from "document";
import { preferences, units } from "user-settings";
import { zeroPad, getDay3, getMonth3, toFahrenheit } from "../common/utils";
import * as newfile from "./newfile";
import { HeartRateSensor } from "heart-rate";
import { today } from "user-activity";
import { inbox } from "file-transfer";
import { readFileSync } from "fs";

// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> element
const txtHours = document.getElementById("txtHours");
const txtHoursShadow = document.getElementById("txtHoursShadow");
const txtMinutes = document.getElementById("txtMinutes");
const txtMinutesShadow = document.getElementById("txtMinutesShadow");
const txtWeather = document.getElementById("txtWeather");
const txtDate = document.getElementById("txtDate");
const txtHeart = document.getElementById("txtHeart");
const txtSteps = document.getElementById("txtSteps");

let hrm;

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

function applySettings(settings) {
  const timeColor = normalizeColor(settings.timecolor, "#cfe4ff");
  const textColor = normalizeColor(settings.textcolor, "#FFFFFF");
  
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
  if (txtHeart && txtHeart.style) {
    txtHeart.style.fill = textColor;
  }
  if (txtSteps && txtSteps.style) {
    txtSteps.style.fill = textColor;
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
  // Steps
  try {
    const steps = (today.adjusted && today.adjusted.steps) || (today.local && today.local.steps) || 0;
    if (txtSteps) txtSteps.text = `👣 ${steps.toLocaleString()} steps`;
  } catch (ex) {
    if (txtSteps) txtSteps.text = "👣 -- steps";
  }
}

// Weather initialization moved to end of file

// Initialize heart rate monitoring if available
try {
  if (HeartRateSensor) {
    hrm = new HeartRateSensor();
    hrm.addEventListener("reading", () => {
      const rate = hrm.heartRate || "--";
      txtHeart.text = `♥ ${rate}`;
    });
    hrm.start();
  } else {
    txtHeart.text = "♥ --";
  }
} catch (ex) {
  txtHeart.text = "♥ --";
}

// Initial population of steps text
updateActivity();

newfile.initialize(data => {
  try {
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

    // Refresh the clock display immediately after receiving weather
    if (typeof updateClockDisplay === "function") {
      updateClockDisplay(new Date());
    }
  } catch (e) {
    console.error("Error in weather callback: " + e);
  }
});