import * as cbor from "cbor";
import { me as companion } from "companion";
import { outbox } from "file-transfer";
import { weather, WeatherCondition } from "weather";
import { dataFile, wakeTime } from "../common/constants";
import { findWeatherConditionName } from "../common/utils";
import "./settings";

function refreshData() {
  weather
    .getWeatherData()
    .then((data) => {
      // Defensive checks: ensure we have a valid locations array and currentWeather
      if (!data || !Array.isArray(data.locations) || data.locations.length === 0) {
        console.warn("No locations in weather data.");
        return;
      }

      const loc = data.locations[0];
      const current = loc && loc.currentWeather;
      if (!current) {
        console.warn("No currentWeather for the first location.");
        return;
      }

      const temperature = typeof current.temperature === "number" ? Math.floor(current.temperature) : null;
      const conditionName = findWeatherConditionName(WeatherCondition, current.weatherCondition) || "Unknown";
      const conditionCode = current.weatherCondition || null;
      const locationName = loc.name || "Unknown";
      const unit = data.temperatureUnit || "Celsius";

      sendData({
        temperature: temperature,
        condition: conditionName,
        conditionCode: conditionCode,
        location: locationName,
        unit: unit
      });
    })
    .catch((ex) => {
      console.error(ex);
    });
}

function sendData(data) {
  outbox.enqueue(dataFile, cbor.encode(data)).catch(error => {
    console.warn(`Failed to enqueue data. Error: ${error}`);
  });
}

if (companion.permissions.granted("access_location")) {
  // Refresh on companion launch
  refreshData();

  // Schedule a refresh every 30 minutes
  companion.wakeInterval = wakeTime;
  companion.addEventListener("wakeinterval", refreshData);

} else {
  console.error("This app requires the access_location permission.");
}