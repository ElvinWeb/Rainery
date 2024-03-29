"use strict";
const api_key = "8cd3a8f26b71a6884a13e057a302da71";
export const fetchData = function (URL, callback) {
  fetch(`${URL}&appid=${api_key}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("error");
      }
      return res.json();
    })
    .then((data) => callback(data))
    .catch((err) => console.log(err));
};
export const url = {
  currentWeather(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}&units=metric`;
  },
  forecast(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/forecast?${lat}&${lon}&units=metric`;
  },
  airPollution(lat, lon) {
    return `http://api.openweathermap.org/data/2.5/air_pollution?${lat}&${lon}&units=metric`;
  },
  reverseGeo(lat, lon) {
    return `http://api.openweathermap.org/geo/1.0/reverse?${lat}&${lon}&limit=5`;
  },
  geo(city_name) {
    return `http://api.openweathermap.org/geo/1.0/direct?q=${city_name}&limit=5`;
  },
};
