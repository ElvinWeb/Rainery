import {
  SEARCH_RES_DISPLAY_TIME,
  DEFAULT_LOC,
  FORBIDDEN_PATTERN,
} from "./config.js";
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
  renderError,
} from "./helpers.js";
import weather_icons from "../Images/weather_icons/*.png";
import "core-js/actual";
import "regenerator-runtime/runtime";

const weatherApp = (function () {
  //Private variables and functions
  const _searchView = document.querySelector("[data-search-view]");
  const _searchTogglers = document.querySelectorAll("[data-search-toggler]");
  const _searchField = document.querySelector("[data-search-field]");
  const _searchResult = document.querySelector("[data-search-result]");
  const _container = document.querySelector("[data-container]");
  const _loading = document.querySelector("[data-loading]");
  const _currentLocationBtn = document.querySelector(
    "[data-current-location-btn]"
  );
  const _errorContent = document.querySelector("[data-error-content]");
  const _currentWeatherSection = document.querySelector(
    "[data-current-weather]"
  );
  const _highlightSection = document.querySelector("[data-highlights]");
  const _hourlySection = document.querySelector("[data-hourly-forecast]");
  const _forecastSection = document.querySelector("[data-5-day-forecast]");
  const state = {};
  let _searchTimeout = null;
  let _airPollutionItems = [];
  const _searchedItems = [];

  //toggling the visibility of a searchbar
  const _toggleSearch = () => _searchView.classList.toggle("active");
  //clearing the search area
  const _clearSearch = () => {
    _searchField.value = "";
    _searchResult.querySelector("[data-search-list]").innerHTML = "";
  };
  //manages the search functionality by handling user input in the search field
  const _searchForecast = function () {
    _searchTimeout ?? clearTimeout(_searchTimeout);
    const searchText = _searchField.value.trim();
    const patternMatch = FORBIDDEN_PATTERN.test(searchText);

    if (!searchText || patternMatch) {
      _searchResult.classList.remove("active");
      _searchField.classList.remove("searching");
      renderError("You searched query is not allowed!");
    } else {
      _searchField.classList.add("searching");
      _searchTimeout = setTimeout(() => {
        fetchData(url.geo(searchText), _searchedResults);
      }, SEARCH_RES_DISPLAY_TIME);
    }
  };
  //dynamically generates and populates the HTML structure to display search results for locations
  const _searchedResults = function (locations) {
    _searchField.classList.remove("searching");
    _searchResult.classList.add("active");
    _searchResult.innerHTML = `<ul class="view-list" data-search-list></ul>`;

    if (locations.length === 0) {
      _searchError();
    } else {
      _searchListItems(locations);
    }

    addEventOnElements(_searchedItems, "click", function () {
      _toggleSearch();
      _clearSearch();
      _searchResult.classList.remove("active");
    });
  };
  //display search results with location items
  const _searchListItems = function (locations) {
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

      _searchResult.querySelector("[data-search-list]").appendChild(searchItem);
      _searchedItems.push(searchItem.querySelector("[data-search-toggler]"));
    }
  };
  // display an error message when no locations are found
  const _searchError = function () {
    const errLi = document.createElement("li");
    errLi.classList.add("error-message");
    errLi.innerHTML = `<p class="body-1">No such place was found!</p>`;
    _searchResult.querySelector("[data-search-list]").append(errLi);
  };
  //dynamically generates and populates the HTML structure to display air pollution-related highlights cards
  const _airPollution = function (airPollution) {
    const [
      sunriseUnixUTC,
      sunsetUnixUTC,
      timezone,
      humidity,
      pressure,
      visibility,
      feels_like,
    ] = _airPollutionItems;

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

    _highlightSection.appendChild(card);
  };
  //rendering of both hourly and daily forecasts based on the fetched forecast data
  const _forecast = function (forecast) {
    const {
      list: forecastList,
      city: { timezone },
    } = forecast;

    _hourlyForecast(forecastList);
    _dailyForecast(forecastList, timezone);

    _loading.style.display = "none";
    _container.style.overflowY = "overlay";
    _container.classList.add("fade-in");
  };
  //to initialize the hourly forecast section
  const _hourlyForecast = function (forecastList, timezone) {
    _hourlySection.innerHTML = `
    <h2 class="title-2">Today at</h2>

    <div class="slider-container">
      <ul class="slider-list" data-temp></ul>

      <ul class="slider-list" data-wind></ul>
    </div>
  `;
    _hourlyForecastCards(forecastList, timezone);
  };
  //to create and append hourly forecast cards
  const _hourlyForecastCards = function (forecastList, timezone) {
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

        <img src="${
          weather_icons[icon]
        }" width="48" height="48" loading="lazy" alt="${description}"
          class="weather-icon" title="${description}">

        <p class="body-3">${parseInt(temp)}&deg;</p>

      </div>
    `;
      _hourlySection.querySelector("[data-temp]").appendChild(tempLi);

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
      _hourlySection.querySelector("[data-wind]").appendChild(windLi);
    }
  };
  // to initialize the daily forecast section
  const _dailyForecast = function (forecastList) {
    _forecastSection.innerHTML = `
    <h2 class="title-2" id="forecast-label">5 Days Forecast</h2>

    <div class="card card-lg forecast-card">
      <ul data-forecast-list></ul>
    </div>
  `;
    _dailyForecastList(forecastList);
  };
  // to create and append daily forecast list items
  const _dailyForecastList = function (forecastList) {
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
        <img src="${
          weather_icons[icon]
        }" width="36" height="36" alt="${description}"
          class="weather-icon" title="${description}">

        <span class="span">
          <p class="title-2">${parseInt(temp_max)}&deg;</p>
        </span>
      </div>

      <p class="label-1">${date.getDate()} ${monthNames[date.getUTCMonth()]}</p>

      <p class="label-1">${weekDayNames[date.getUTCDay()]}</p>
    `;
      _forecastSection.querySelector("[data-forecast-list]").appendChild(li);
    }
  };
  //according to location coords, reversed to country name
  const _reverseGeo = function ([{ name, country }]) {
    document.querySelector("[data-location]").innerHTML = `${name}, ${country}`;
  };
  //designed to fetch and display current weather data on a web page
  const _updateWeather = function (lat, lon) {
    _loading.style.display = "grid";
    _container.style.overflowY = "hidden";
    _errorContent.style.display = "none";

    _currentWeatherSection.innerHTML = "";
    _highlightSection.innerHTML = "";
    _hourlySection.innerHTML = "";
    _forecastSection.innerHTML = "";

    if (window.location.hash === "#/current-location") {
      _currentLocationBtn.setAttribute("disabled", "");
    } else {
      _currentLocationBtn.removeAttribute("disabled");
    }

    fetchData(url.currentWeather(lat, lon), function (currentWeather) {
      _currentWeatherCard(currentWeather);
      fetchData(url.reverseGeo(lat, lon), _reverseGeo);
      fetchData(url.airPollution(lat, lon), _airPollution);
      fetchData(url.forecast(lat, lon), _forecast);
    });
  };
  // to create and append current weather forecast card
  const _currentWeatherCard = function (currentWeather) {
    const {
      weather,
      dt: dateUnix,
      sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
      main: { temp, feels_like, pressure, humidity },
      visibility,
      timezone,
    } = currentWeather;
    const [{ description, icon }] = weather;

    _airPollutionItems = [
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
    _currentWeatherSection.appendChild(card);
  };
  //takes a query string and then updates the weather using these parameters
  const _searchedLocation = (query) => _updateWeather(...query.split("&"));
  //updating weather UI according to current location coords(lan,lon)
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
  //parse the hash portion of the URL, extract the route and query string
  const _checkHash = function () {
    const requestUrl = window.location.hash.slice(1);
    const [rotue, query] = requestUrl.includes
      ? requestUrl.split("?")
      : [requestUrl];

    _routes.get(rotue) ? _routes.get(rotue)(query) : _error404();
  };
  //displaying error message
  const _error404 = () => (_errorContent.style.display = "flex");
  const _routes = new Map([
    ["/current-location", _currentLocation],
    ["/weather", _searchedLocation],
  ]);
  //project initialization
  const init = function () {
    addEventOnElements(_searchTogglers, "click", _toggleSearch);
    window.addEventListener("hashchange", _checkHash);
    window.addEventListener("load", () => {
      if (!window.location.hash) {
        window.location.hash = "#/current-location";
      } else {
        _checkHash();
      }
    });
    _searchField.addEventListener("input", _searchForecast);
  };

  //Public variables and functions
  return {
    init: init,
  };
})();

weatherApp.init();
