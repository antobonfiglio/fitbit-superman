import clock from "clock";
import * as document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import * as newfile from "./newfile";

// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> element
const txtHours = document.getElementById("txtHours");
const txtMinutes = document.getElementById("txtMinutes");
const txtWeather = document.getElementById("txtWeather");
const txtDate = document.getElementById("txtDate");

// Update the <text> element every tick with the current time


clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  txtHours.text = `${util.zeroPad(hours)}`;
  txtMinutes.text = `${mins}`;
  txtDate.text = `${util.getDay3(today.getDay())}, ${today.getDate()} ${util.getMonth3(today.getMonth())}`;
}

newfile.initialize(data => {
  // fresh weather file received

  // If the user-settings temperature == F and the result data.unit == Celsius then we convert to Fahrenheit
  // Use this only if you use getWeatherData() function without the optional parameter.
  // data = units.temperature === "F" ? toFahrenheit(data): data;

  txtWeather.text = `${data.temperature}\u00B0 ${data.unit} and ${data.condition} (${data.conditionCode}) in ${data.location}`;

  clock.tick();
});