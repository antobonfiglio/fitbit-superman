import { settingsStorage } from "settings";
import * as cbor from "cbor";
import { outbox } from "file-transfer";

const SETTINGS_FILE = "settings.cbor";

function parseColor(value, fallback) {
  if (!value) return fallback;
  try {
    const obj = JSON.parse(value);
    return obj.color || obj.name || fallback;
  } catch (ex) {
    return value || fallback;
  }
}

function parseSelectValue(value, fallback) {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0].value || parsed[0].name || fallback;
    }

    if (parsed && Array.isArray(parsed.values) && parsed.values.length > 0) {
      return parsed.values[0].value || parsed.values[0].name || fallback;
    }

    return parsed.value || parsed.name || fallback;
  } catch (ex) {
    return value || fallback;
  }
}

// Settings have been changed
settingsStorage.addEventListener("change", (evt) => {
  sendSettings();
});

function sendSettings() {
  const settings = {
    faceid: parseSelectValue(settingsStorage.getItem("faceid"), "superman-classic"),
    timecolor: parseColor(settingsStorage.getItem("timecolor"), "#cfe4ff"),
    textcolor: parseColor(settingsStorage.getItem("textcolor"), "#FFFFFF")
  };

  outbox.enqueue(SETTINGS_FILE, cbor.encode(settings)).catch(error => {
    console.warn(`Failed to enqueue settings. Error: ${error}`);
  });
}

// Send settings on companion launch
sendSettings();
