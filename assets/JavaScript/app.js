"use strict";
import { TIMEOUT_SEC, DEFAULT_LOC } from "./config.js";
import {
  getDate,
  getHours,
  getTime,
  mps_to_kmh,
  aqiText,
  url,
  fetchData,
  addEventOnElements,
  monthNames,
  weekDayNames,
} from "./helpers.js";

const weatherApp = (function () {
  //private variables and functions
  const searchView = document.querySelector("[data-search-view]");
  const searchTogglers = document.querySelectorAll("[data-search-toggler]");
  const searchField = document.querySelector("[data-search-field]");
  const searchResult = document.querySelector("[data-search-result]");
  const container = document.querySelector("[data-container]");
  const loading = document.querySelector("[data-loading]");
  const currentLocationBtn = document.querySelector(
    "[data-current-location-btn]"
  );
  const errorContent = document.querySelector("[data-error-content]");
  const currentWeatherSection = document.querySelector(
    "[data-current-weather]"
  );
  const highlightSection = document.querySelector("[data-highlights]");
  const hourlySection = document.querySelector("[data-hourly-forecast]");
  const forecastSection = document.querySelector("[data-5-day-forecast]");
  let searchTimeout = null;
  let airPollutionItems;

  const _toggleSearch = function () {
    searchView.classList.toggle("active");
    searchField.focus();
  };
  const _searchForecast = function () {
    searchTimeout ?? clearTimeout(searchTimeout);

    if (!searchField.value) {
      searchResult.classList.remove("active");
      searchResult.innerHTML = "";
      searchField.classList.remove("searching");
    } else {
      searchField.classList.add("searching");
    }

    if (searchField.value) {
      searchTimeout = setTimeout(() => {
        fetchData(url.geo(searchField.value), function (locations) {
          console.log(locations);
          searchField.classList.remove("searching");
          searchResult.classList.add("active");
          searchResult.innerHTML = `
            <ul class="view-list" data-search-list></ul>
          `;
          const items = [];
          if (locations.length === 0) {
            const errLi = document.createElement("li");
            errLi.classList.add("error-message");
            errLi.innerHTML = `<p class="body-1">No such place was found!</p>`;
            searchResult.querySelector("[data-search-list]").append(errLi);
          } else {
            for (const { name, lat, lon, country, state } of locations) {
              const searchItem = document.createElement("li");
              searchItem.classList.add("view-item");

              searchItem.innerHTML = `
              <span class="m-icon">location_on</span>
  
              <div>
                <p class="item-title">${name}</p>
  
                <p class="label-2 item-subtitle">${state || ""} ${country}</p>
              </div>
  
              <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state" aria-label="${name} weather" data-search-toggler></a>
            `;

              searchResult
                .querySelector("[data-search-list]")
                .appendChild(searchItem);
              items.push(searchItem.querySelector("[data-search-toggler]"));
            }
          }

          addEventOnElements(items, "click", function () {
            _toggleSearch();
            searchResult.classList.remove("active");
            searchField.value = "";
            searchField.focus();
            searchResult.querySelector("[data-search-list]").innerHTML = " ";
          });
        });
      }, TIMEOUT_SEC);
    }
  };
  const _airPollution = function (airPollution) {
    const [
      sunriseUnixUTC,
      sunsetUnixUTC,
      timezone,
      humidity,
      pressure,
      visibility,
      feels_like,
    ] = airPollutionItems;

    const [
      {
        main: { aqi },
        components: { no2, o3, so2, pm2_5 },
      },
    ] = airPollution.list;
    const card = document.createElement("div");
    card.classList.add("card", "card-lg");

    card.innerHTML = `
      <h2 class="title-2" id="highlights-label">Todays Highlights</h2>

      <div class="highlight-list">

        <div class="card card-sm highlight-card one">

          <h3 class="title-3">Air Quality Index</h3>

          <div class="wrapper">

            <span class="m-icon">air</span>

            <ul class="card-list">

              <li class="card-item">
                <p class="title-1">${pm2_5.toPrecision(3)}</p>

                <p class="label-1">PM<sub>2.5</sub></p>
              </li>

              <li class="card-item">
                <p class="title-1">${so2.toPrecision(3)}</p>

                <p class="label-1">SO<sub>2</sub></p>
              </li>

              <li class="card-item">
                <p class="title-1">${no2.toPrecision(3)}</p>

                <p class="label-1">NO<sub>2</sub></p>
              </li>

              <li class="card-item">
                <p class="title-1">${o3.toPrecision(3)}</p>

                <p class="label-1">O<sub>3</sub></p>
              </li>

            </ul>

          </div>

          <span class="badge aqi-${aqi} label-${aqi}" title="${
      aqiText[aqi].message
    }">
            ${aqiText[aqi].level}
          </span>

        </div>

        <div class="card card-sm highlight-card two">

          <h3 class="title-3">Sunrise & Sunset</h3>

          <div class="card-list">

            <div class="card-item">
              <span class="m-icon">clear_day</span>

              <div>
                <p class="label-1">Sunrise</p>

                <p class="title-1">${getTime(sunriseUnixUTC, timezone)}</p>
              </div>
            </div>

            <div class="card-item">
              <span class="m-icon">clear_night</span>

              <div>
                <p class="label-1">Sunset</p>

                <p class="title-1">${getTime(sunsetUnixUTC, timezone)}</p>
              </div>
            </div>

          </div>

        </div>

        <div class="card card-sm highlight-card">

          <h3 class="title-3">Humidity</h3>

          <div class="wrapper">
            <span class="m-icon">humidity_percentage</span>

            <p class="title-1">${humidity}<sub>%</sub></p>
          </div>

        </div>

        <div class="card card-sm highlight-card">

          <h3 class="title-3">Pressure</h3>

          <div class="wrapper">
            <span class="m-icon">airwave</span>

            <p class="title-1">${pressure}<sub>hPa</sub></p>
          </div>

        </div>

        <div class="card card-sm highlight-card">

          <h3 class="title-3">Visibility</h3>

          <div class="wrapper">
            <span class="m-icon">visibility</span>

            <p class="title-1">${visibility / 1000}<sub>km</sub></p>
          </div>

        </div>

        <div class="card card-sm highlight-card">

          <h3 class="title-3">Feels Like</h3>

          <div class="wrapper">
            <span class="m-icon">thermostat</span>

            <p class="title-1">${parseInt(feels_like)}&deg;<sup>c</sup></p>
          </div>

        </div>

      </div>
    `;

    highlightSection.appendChild(card);
  };
  const _forecast = function (forecast) {
    const {
      list: forecastList,
      city: { timezone },
    } = forecast;

    hourlySection.innerHTML = `
      <h2 class="title-2">Today at</h2>

      <div class="slider-container">
        <ul class="slider-list" data-temp></ul>

        <ul class="slider-list" data-wind></ul>
      </div>
    `;

    for (const [index, data] of forecastList.entries()) {
      if (index > 7) break;

      const {
        dt: dateTimeUnix,
        main: { temp },
        weather,
        wind: { deg: windDirection, speed: windSpeed },
      } = data;
      const [{ icon, description }] = weather;

      const tempLi = document.createElement("li");
      tempLi.classList.add("slider-item");
      tempLi.innerHTML = `
        <div class="card card-sm slider-card">

          <p class="body-3">${getHours(dateTimeUnix, timezone)}</p>

          <img src="./assets/images/weather_icons/${icon}.png" width="48" height="48" loading="lazy" alt="${description}"
            class="weather-icon" title="${description}">

          <p class="body-3">${parseInt(temp)}&deg;</p>

        </div>
      `;
      hourlySection.querySelector("[data-temp]").appendChild(tempLi);

      const windLi = document.createElement("li");
      windLi.classList.add("slider-item");
      windLi.innerHTML = `
      <div class="card card-sm slider-card">

        <p class="body-3">${getHours(dateTimeUnix, timezone)}</p>

        <img src="./assets/images/weather_icons/direction.png" width="48" height="48" loading="lazy" alt="direction"
          class="weather-icon" style="transform: rotate(${
            windDirection - 180
          }deg)">

        <p class="body-3">${parseInt(mps_to_kmh(windSpeed))} km/h</p>

      </div>
      `;
      hourlySection.querySelector("[data-wind]").appendChild(windLi);
    }

    forecastSection.innerHTML = `
      <h2 class="title-2" id="forecast-label">5 Days Forecast</h2>

      <div class="card card-lg forecast-card">
        <ul data-forecast-list></ul>
      </div>
    `;

    for (let i = 7, len = forecastList.length; i < len; i += 8) {
      const {
        main: { temp_max },
        weather,
        dt_txt,
      } = forecastList[i];
      const [{ icon, description }] = weather;
      const date = new Date(dt_txt);

      const li = document.createElement("li");
      li.classList.add("card-item");

      li.innerHTML = `
        <div class="icon-wrapper">
          <img src="./assets/images/weather_icons/${icon}.png" width="36" height="36" alt="${description}"
            class="weather-icon" title="${description}">

          <span class="span">
            <p class="title-2">${parseInt(temp_max)}&deg;</p>
          </span>
        </div>

        <p class="label-1">${date.getDate()} ${
        monthNames[date.getUTCMonth()]
      }</p>

        <p class="label-1">${weekDayNames[date.getUTCDay()]}</p>
      `;
      forecastSection.querySelector("[data-forecast-list]").appendChild(li);
    }

    loading.style.display = "none";
    container.style.overflowY = "overlay";
    container.classList.add("fade-in");
  };
  const _reverseGeo = function ([{ name, country }]) {
    document.querySelector("[data-location]").innerHTML = `${name}, ${country}`;
  };
  const _updateWeather = function (lat, lon) {
    loading.style.display = "grid";
    container.style.overflowY = "hidden";
    errorContent.style.display = "none";

    currentWeatherSection.innerHTML = "";
    highlightSection.innerHTML = "";
    hourlySection.innerHTML = "";
    forecastSection.innerHTML = "";

    if (window.location.hash === "#/current-location") {
      currentLocationBtn.setAttribute("disabled", "");
    } else {
      currentLocationBtn.removeAttribute("disabled");
    }

    /**
     * CURRENT WEATHER SECTION
     */
    fetchData(url.currentWeather(lat, lon), function (currentWeather) {
      const {
        weather,
        dt: dateUnix,
        sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
        main: { temp, feels_like, pressure, humidity },
        visibility,
        timezone,
      } = currentWeather;
      const [{ description, icon }] = weather;

      airPollutionItems = [
        sunriseUnixUTC,
        sunsetUnixUTC,
        timezone,
        humidity,
        pressure,
        visibility,
        feels_like,
      ];

      const card = document.createElement("div");
      card.classList.add("card", "card-lg", "current-weather-card");

      card.innerHTML = `
        <h2 class="title-2 card-title">Now</h2>
        <div class="wrapper">
          <p class="heading">${parseInt(temp)}&deg;<sup>c</sup></p>
          <img src="./assets/images/weather_icons/${icon}.png" width="64" height="64" alt="${description}"
            class="weather-icon">
        </div>
        <p class="body-3">${description}</p>
        <ul class="meta-list">
          <li class="meta-item">
            <span class="m-icon">calendar_today</span>
            <p class="title-3 meta-text">${getDate(dateUnix, timezone)}</p>
          </li>
          <li class="mmeta-item">
            <span class="m-icon">location_on</span>
            <p class="title-3 meta-text" data-location></p>
          </li>
        </ul>
      `;

      currentWeatherSection.appendChild(card);
      fetchData(url.reverseGeo(lat, lon), _reverseGeo);
      fetchData(url.airPollution(lat, lon), _airPollution);
      fetchData(url.forecast(lat, lon), _forecast);
    });
  };
  const _searchedLocation = (query) => _updateWeather(...query.split("&"));
  const _currentLocation = function () {
    window.navigator.geolocation.getCurrentPosition(
      (res) => {
        const { latitude, longitude } = res.coords;
        _updateWeather(`lat=${latitude}`, `lon=${longitude}`);
      },
      (err) => {
        window.location.hash = DEFAULT_LOC;
      }
    );
  };
  const _checkHash = function () {
    const requestUrl = window.location.hash.slice(1);

    const [rotue, query] = requestUrl.includes
      ? requestUrl.split("?")
      : [requestUrl];

    routes.get(rotue) ? routes.get(rotue)(query) : _error404();
  };
  const _error404 = () => (errorContent.style.display = "flex");
  const routes = new Map([
    ["/current-location", _currentLocation],
    ["/weather", _searchedLocation],
  ]);
  const init = function () {
    addEventOnElements(searchTogglers, "click", _toggleSearch);
    window.addEventListener("hashchange", _checkHash);
    window.addEventListener("load", () => {
      if (!window.location.hash) {
        window.location.hash = "#/current-location";
      } else {
        _checkHash();
      }
    });
    searchField.addEventListener("input", _searchForecast);
  };
  return {
    init: init,
  };
})();

weatherApp.init();
