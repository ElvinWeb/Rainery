import "core-js/actual";
import "regenerator-runtime/runtime";
import weather_icons from "../Images/weather_icons/*.png";
import {
  DEFAULT_LOCATION,
  FORBIDDEN_PATTERN,
  SEARCH_RES_DISPLAY_TIME,
} from "./config.js";
import {
  addEventOnElements,
  aqiText,
  fetchData,
  getDate,
  getHours,
  getTime,
  monthNames,
  mps_to_kmh,
  renderError,
  url,
  weekDayNames,
} from "./helpers.js";

const raineryApp = (function () {
  // Private variables
  const elements = {
    searchView: document.querySelector("[data-search-view]"),
    searchTogglers: document.querySelectorAll("[data-search-toggler]"),
    searchField: document.querySelector("[data-search-field]"),
    searchResult: document.querySelector("[data-search-result]"),
    container: document.querySelector("[data-container]"),
    loading: document.querySelector("[data-loading]"),
    currentLocationBtn: document.querySelector("[data-current-location-btn]"),
    errorContent: document.querySelector("[data-error-content]"),
    currentWeatherSection: document.querySelector("[data-current-weather]"),
    highlightSection: document.querySelector("[data-highlights]"),
    hourlySection: document.querySelector("[data-hourly-forecast]"),
    forecastSection: document.querySelector("[data-5-day-forecast]"),
  };

  // State management
  const state = {
    searchTimeout: null,
    airPollutionItems: [],
    searchedItems: [],
  };

  // Search Module
  const searchModule = {
    toggleSearch() {
      elements.searchView.classList.toggle("active");
    },

    clearSearch() {
      elements.searchField.value = "";
      elements.searchResult.querySelector("[data-search-list]").innerHTML = "";
    },

    searchForecast() {
      if (state.searchTimeout) clearTimeout(state.searchTimeout);

      const searchText = elements.searchField.value.trim();
      const patternMatch = FORBIDDEN_PATTERN.test(searchText);

      if (!searchText || patternMatch) {
        elements.searchResult.classList.remove("active");
        elements.searchField.classList.remove("searching");
        return renderError("Your search query is not allowed!");
      }

      elements.searchField.classList.add("searching");
      state.searchTimeout = setTimeout(() => {
        fetchData(url.geo(searchText), searchModule.searchedResults);
      }, SEARCH_RES_DISPLAY_TIME);
    },

    searchedResults(locations) {
      elements.searchField.classList.remove("searching");
      elements.searchResult.classList.add("active");
      elements.searchResult.innerHTML = `<ul class="view-list" data-search-list></ul>`;

      locations.length === 0
        ? searchModule.searchError()
        : searchModule.searchListItems(locations);

      addEventOnElements(state.searchedItems, "click", () => {
        searchModule.toggleSearch();
        searchModule.clearSearch();
        elements.searchResult.classList.remove("active");
      });
    },

    searchListItems(locations) {
      const searchList =
        elements.searchResult.querySelector("[data-search-list]");

      locations.forEach(({ name, lat, lon, country, state }) => {
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

        searchList.appendChild(searchItem);
        state.searchedItems.push(
          searchItem.querySelector("[data-search-toggler]")
        );
      });
    },

    searchError() {
      const errLi = document.createElement("li");
      errLi.classList.add("error-message");
      errLi.innerHTML = `<p class="body-1">No such place was found!</p>`;
      elements.searchResult.querySelector("[data-search-list]").append(errLi);
    },
  };

  // Weather Display Module
  const weatherModule = {
    airPollution(airPollution) {
      const [
        sunriseUnixUTC,
        sunsetUnixUTC,
        timezone,
        humidity,
        pressure,
        visibility,
        feels_like,
      ] = state.airPollutionItems;

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

      elements.highlightSection.appendChild(card);
    },

    forecast(forecast) {
      const {
        list: forecastList,
        city: { timezone },
      } = forecast;

      weatherModule.hourlyForecast(forecastList);
      weatherModule.dailyForecast(forecastList, timezone);

      elements.loading.style.display = "none";
      elements.container.style.overflowY = "overlay";
      elements.container.classList.add("fade-in");
    },

    hourlyForecast(forecastList, timezone) {
      elements.hourlySection.innerHTML = `
        <h2 class="title-2">Today at</h2>
        <div class="slider-container">
          <ul class="slider-list" data-temp></ul>
          <ul class="slider-list" data-wind></ul>
        </div>
      `;
      weatherModule.hourlyForecastCards(forecastList, timezone);
    },

    hourlyForecastCards(forecastList, timezone) {
      const tempList = elements.hourlySection.querySelector("[data-temp]");
      const windList = elements.hourlySection.querySelector("[data-wind]");

      forecastList.slice(0, 8).forEach((data) => {
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
            <img src="${
              weather_icons[icon]
            }" width="48" height="48" loading="lazy" alt="${description}"
              class="weather-icon" title="${description}">
            <p class="body-3">${parseInt(temp)}&deg;</p>
          </div>
        `;
        tempList.appendChild(tempLi);

        const windLi = document.createElement("li");
        windLi.classList.add("slider-item");
        windLi.innerHTML = `
          <div class="card card-sm slider-card">
            <p class="body-3">${getHours(dateTimeUnix, timezone)}</p>
            <img src="${
              weather_icons["direction"]
            }" width="48" height="48" loading="lazy" alt="direction"
              class="weather-icon" style="transform: rotate(${
                windDirection - 180
              }deg)">
            <p class="body-3">${parseInt(mps_to_kmh(windSpeed))} km/h</p>
          </div>
        `;
        windList.appendChild(windLi);
      });
    },

    dailyForecast(forecastList) {
      elements.forecastSection.innerHTML = `
        <h2 class="title-2" id="forecast-label">5 Days Forecast</h2>
        <div class="card card-lg forecast-card">
          <ul data-forecast-list></ul>
        </div>
      `;
      weatherModule.dailyForecastList(forecastList);
    },

    dailyForecastList(forecastList) {
      const forecastListEl = elements.forecastSection.querySelector(
        "[data-forecast-list]"
      );

      for (let i = 7; i < forecastList.length; i += 8) {
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
            <img src="${
              weather_icons[icon]
            }" width="36" height="36" alt="${description}"
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
        forecastListEl.appendChild(li);
      }
    },

    reverseGeo([{ name, country }]) {
      document.querySelector(
        "[data-location]"
      ).innerHTML = `${name}, ${country}`;
    },

    updateWeather(lat, lon) {
      elements.loading.style.display = "grid";
      elements.container.style.overflowY = "hidden";
      elements.errorContent.style.display = "none";

      elements.currentWeatherSection.innerHTML = "";
      elements.highlightSection.innerHTML = "";
      elements.hourlySection.innerHTML = "";
      elements.forecastSection.innerHTML = "";

      if (window.location.hash === "#/current-location") {
        elements.currentLocationBtn.setAttribute("disabled", "");
      } else {
        elements.currentLocationBtn.removeAttribute("disabled");
      }

      fetchData(url.currentWeather(lat, lon), function (currentWeather) {
        weatherModule.currentWeatherCard(currentWeather);
        fetchData(url.reverseGeo(lat, lon), weatherModule.reverseGeo);
        fetchData(url.airPollution(lat, lon), weatherModule.airPollution);
        fetchData(url.forecast(lat, lon), weatherModule.forecast);
      });
    },

    currentWeatherCard(currentWeather) {
      const {
        weather,
        dt: dateUnix,
        sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
        main: { temp, feels_like, pressure, humidity },
        visibility,
        timezone,
      } = currentWeather;
      const [{ description, icon }] = weather;

      state.airPollutionItems = [
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
          <img src="${
            weather_icons[icon]
          }" width="64" height="64" alt="${description}"
            class="weather-icon">
        </div>
        <p class="body-3">${description}</p>
        <ul class="meta-list">
          <li class="meta-item">
            <span class="m-icon">calendar_today</span>
            <p class="title-3 meta-text">${getDate(dateUnix, timezone)}</p>
          </li>
          <li class="meta-item">
            <span class="m-icon">location_on</span>
            <p class="title-3 meta-text" data-location></p>
          </li>
        </ul>
      `;
      elements.currentWeatherSection.appendChild(card);
    },
  };

  // Router Module
  const routerModule = {
    searchedLocation(query) {
      weatherModule.updateWeather(...query.split("&"));
    },

    currentLocation() {
      window.navigator.geolocation.getCurrentPosition(
        (res) => {
          const { latitude, longitude } = res.coords;
          weatherModule.updateWeather(`lat=${latitude}`, `lon=${longitude}`);
        },
        () => {
          window.location.hash = DEFAULT_LOCATION;
        }
      );
    },

    checkHash() {
      const requestUrl = window.location.hash.slice(1);
      const [route, query] = requestUrl.includes("?")
        ? requestUrl.split("?")
        : [requestUrl];

      routes.get(route)
        ? routes.get(route)(query)
        : routerModule.routerModule();
    },

    setupInitialRoute() {
      if (!window.location.hash) {
        window.location.hash = "#/current-location";
      } else {
        routerModule.checkHash();
      }
    },

    routerNotFound() {
      elements.errorContent.style.display = "flex";
    },
  };

  const routes = new Map([
    ["/current-location", routerModule.currentLocation],
    ["/weather", routerModule.searchedLocation],
  ]);

  // Public init method
  const init = function () {
    addEventOnElements(
      elements.searchTogglers,
      "click",
      searchModule.toggleSearch
    );
    window.addEventListener("hashchange", routerModule.checkHash);
    window.addEventListener("load", routerModule.setupInitialRoute);
    elements.searchField.addEventListener("input", searchModule.searchForecast);
  };

  return { init };
})();

raineryApp.init();
