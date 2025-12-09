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

// Settings have been changed
settingsStorage.addEventListener("change", (evt) => {
  sendSettings();
});

function sendSettings() {
  const settings = {
    timecolor: parseColor(settingsStorage.getItem("timecolor"), "#cfe4ff"),
    textcolor: parseColor(settingsStorage.getItem("textcolor"), "#FFFFFF")
  };

  outbox.enqueue(SETTINGS_FILE, cbor.encode(settings)).catch(error => {
    console.warn(`Failed to enqueue settings. Error: ${error}`);
  });
}

// Send settings on companion launch
sendSettings();
