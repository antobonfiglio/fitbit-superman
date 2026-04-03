#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const FACES_FILE = path.join(ROOT, "common", "faces.js");

// Fitbit profiles used by this project buildTargets
const TARGETS = {
  atlas: { width: 336, height: 336 },
  vulcan: { width: 336, height: 336 }
};

function loadFacesDefinition(filePath) {
  const source = fs.readFileSync(filePath, "utf8");

  const normalized = source
    .replace(/export\s+const\s+/g, "const ")
    .replace(/export\s+function\s+/g, "function ")
    .concat("\nmodule.exports = { DEFAULT_FACE_ID, FACE_DEFINITIONS };\n");

  const sandbox = {
    module: { exports: {} },
    exports: {},
    console
  };

  vm.createContext(sandbox);
  vm.runInContext(normalized, sandbox, { filename: filePath });
  return sandbox.module.exports;
}

function parseAxis(value, max, label, messages) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.endsWith("%")) {
    const parsed = Number(value.slice(0, -1));
    if (Number.isNaN(parsed)) {
      messages.errors.push(`${label}: invalid percent value ${value}`);
      return 0;
    }
    return (parsed / 100) * max;
  }

  messages.errors.push(`${label}: unsupported coordinate format (${String(value)})`);
  return 0;
}

function estimateTextWidth(fontSize, charCount) {
  return fontSize * charCount * 0.58;
}

function makeTextBox(layout, typography, viewport, anchor, sampleText, key, messages) {
  const x = parseAxis(layout.x, viewport.width, `${key}.x`, messages);
  const y = parseAxis(layout.y, viewport.height, `${key}.y`, messages);
  // Approximate Fitbit text metrics: ascender occupies most height above baseline,
  // with a smaller descender area below baseline.
  const ascender = typography * 0.78;
  const descender = typography * 0.22;
  const width = estimateTextWidth(typography, sampleText.length);

  let left = x;
  if (anchor === "middle") {
    left = x - width / 2;
  }

  return {
    key,
    left,
    right: left + width,
    top: y - ascender,
    bottom: y + descender
  };
}

function intersects(a, b) {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

function validateFaceSchema(faceId, face, messages) {
  if (!face || typeof face !== "object") {
    messages.errors.push(`${faceId}: face definition is missing or invalid`);
    return;
  }

  const requiredTopLevel = ["id", "label", "backgroundImage", "colors", "typography", "layout", "features"];
  requiredTopLevel.forEach((key) => {
    if (!(key in face)) {
      messages.errors.push(`${faceId}: missing required key '${key}'`);
    }
  });

  if (face.id !== faceId) {
    messages.warnings.push(`${faceId}: 'id' does not match map key`);
  }

  ["time", "text"].forEach((key) => {
    if (!face.colors || typeof face.colors[key] !== "string") {
      messages.errors.push(`${faceId}: colors.${key} must be a hex string`);
    }
  });

  ["timeSize", "dateSize", "weatherSize"].forEach((key) => {
    if (!face.typography || typeof face.typography[key] !== "number") {
      messages.errors.push(`${faceId}: typography.${key} must be a number`);
    }
  });

  ["hours", "minutes", "date", "weather", "weatherIcon"].forEach((key) => {
    if (!face.layout || !face.layout[key]) {
      messages.errors.push(`${faceId}: layout.${key} is required`);
    }
  });

  ["showDate", "showWeather", "showActivity"].forEach((key) => {
    if (!face.features || typeof face.features[key] !== "boolean") {
      messages.errors.push(`${faceId}: features.${key} must be boolean`);
    }
  });
}

function validateFaceLayout(faceId, face, targetName, viewport, messages) {
  const { layout, typography, features } = face;

  const hourBox = makeTextBox(layout.hours, typography.timeSize, viewport, "middle", "88", "layout.hours", messages);
  const minuteBox = makeTextBox(layout.minutes, typography.timeSize, viewport, "middle", "88", "layout.minutes", messages);
  const dateBox = makeTextBox(layout.date, typography.dateSize, viewport, "start", "Thu, 5 May", "layout.date", messages);
  const weatherBox = makeTextBox(layout.weather, typography.weatherSize, viewport, "start", "15C", "layout.weather", messages);

  [hourBox, minuteBox, dateBox, weatherBox].forEach((box) => {
    if (box.left < 0 || box.top < 0 || box.right > viewport.width || box.bottom > viewport.height) {
      messages.errors.push(`${faceId} (${targetName}): ${box.key} is out of viewport bounds`);
    }
  });

  if (intersects(hourBox, minuteBox)) {
    messages.errors.push(`${faceId} (${targetName}): hours and minutes text overlap`);
  }

  const verticalGap = minuteBox.top - hourBox.bottom;
  if (verticalGap < 0) {
    messages.errors.push(`${faceId} (${targetName}): insufficient vertical gap between hours and minutes`);
  }

  if (features.showDate && features.showWeather && intersects(dateBox, weatherBox)) {
    messages.errors.push(`${faceId} (${targetName}): date and weather overlap while both are enabled`);
  }

  const iconX = parseAxis(layout.weatherIcon.x, viewport.width, "layout.weatherIcon.x", messages);
  const iconY = parseAxis(layout.weatherIcon.y, viewport.height, "layout.weatherIcon.y", messages);
  const iconWidth = Number(layout.weatherIcon.width);
  const iconHeight = Number(layout.weatherIcon.height);

  if (Number.isNaN(iconWidth) || Number.isNaN(iconHeight)) {
    messages.errors.push(`${faceId} (${targetName}): weather icon width/height must be numbers`);
  } else {
    if (iconX < 0 || iconY < 0 || iconX + iconWidth > viewport.width || iconY + iconHeight > viewport.height) {
      messages.errors.push(`${faceId} (${targetName}): weather icon is out of viewport bounds`);
    }
  }

  if (!features.showWeather) {
    messages.warnings.push(`${faceId} (${targetName}): weather disabled; weather layout checks still performed for config hygiene`);
  }
}

function main() {
  const { DEFAULT_FACE_ID, FACE_DEFINITIONS } = loadFacesDefinition(FACES_FILE);

  const messages = {
    errors: [],
    warnings: []
  };

  if (!FACE_DEFINITIONS || typeof FACE_DEFINITIONS !== "object") {
    console.error("Layout validation failed: FACE_DEFINITIONS is missing or invalid.");
    process.exit(1);
  }

  if (!FACE_DEFINITIONS[DEFAULT_FACE_ID]) {
    messages.errors.push(`DEFAULT_FACE_ID '${DEFAULT_FACE_ID}' is not present in FACE_DEFINITIONS`);
  }

  Object.entries(FACE_DEFINITIONS).forEach(([faceId, face]) => {
    validateFaceSchema(faceId, face, messages);
    Object.entries(TARGETS).forEach(([targetName, viewport]) => {
      validateFaceLayout(faceId, face, targetName, viewport, messages);
    });
  });

  if (messages.warnings.length) {
    console.log("Layout validator warnings:");
    messages.warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (messages.errors.length) {
    console.error("Layout validator errors:");
    messages.errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log("Layout validation passed for all face variants and targets.");
}

main();
