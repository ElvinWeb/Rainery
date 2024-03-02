"use strict";
import { updateWeather, error404 } from "./app.js";
const defaultLocation = "#/weather?lat=40.3876&lon=49.80725";

const currentLocation = function () {
  window.navigator.geolocation.getCurrentPosition(
    (res) => {
      const { latitude, longitude } = res.coords;
      updateWeather(`lat=${latitude}`, `lon=${longitude}`);
    },
    (err) => {
      window.location.hash = defaultLocation;
    }
  );
};

const searchedLocation = (query) => updateWeather(...query.split("&"));

const routes = new Map([
  ["/current-location", currentLocation],
  ["/weather", searchedLocation],
]);

const checkHash = function () {
  const requestUrl = window.location.hash.slice(1);

  const [rotue, query] = requestUrl.includes
    ? requestUrl.split("?")
    : [requestUrl];

  routes.get(rotue) ? routes.get(rotue)(query) : error404();
};

window.addEventListener("hashchange", checkHash);
window.addEventListener("load", () => {
  if (!window.location.hash) {
    window.location.hash = "#/current-location";
  } else {
    checkHash();
  }
});
