import {
  API_KEY,
  API_URL,
  GEO_LOC_API_URL,
  ERROR_DISPLAY_TIME,
} from "./config.js";

const weekDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getDate = (dateUnix, timeZone) => {
  const date = new Date((dateUnix + timeZone) * 1000);
  const weekDayName = weekDayNames[date.getUTCDay()];
  const monthName = monthNames[date.getUTCMonth()];
  return `${weekDayName} ${date.getUTCDate()}, ${monthName}`;
};

const getTime = (timeUnix, timezone) => {
  const date = new Date((timeUnix + timezone) * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${minutes} ${period}`;
};

const getHours = (timeUnix, timezone) => {
  const date = new Date((timeUnix + timezone) * 1000);
  const hours = date.getUTCHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12} ${period}`;
};

const mps_to_kmh = (mps) => (mps * 3600) / 1000;

const aqiText = {
  1: {
    level: 'Good',
    message: 'Air quality is considered satisfactory, and air pollution poses little or no risk'
  },
  2: {
    level: 'Fair',
    message: 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.'
  },
  3: {
    level: 'Moderate', 
    message: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.'
  },
  4: {
    level: 'Poor',
    message: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects'
  },
  5: {
    level: 'Very Poor',
    message: 'Health warnings of emergency conditions. The entire population is more likely to be affected.'
  }
};

const renderError = (message) => {
  const errorEl = document.querySelector('.error');
  const errorTextEl = document.querySelector('.error-text');
  
  errorTextEl.textContent = message;
  errorEl.classList.add('error--visible');
  
  setTimeout(() => {
    errorEl.classList.remove('error--visible');
  }, ERROR_DISPLAY_TIME);
};

const addEventOnElements = (elements, eventType, callback) => {
  elements.forEach(element => element.addEventListener(eventType, callback));
};

const fetchData = async (URL, callback) => {
  try {
    const response = await fetch(`${URL}&appid=${API_KEY}`);
    const data = await response.json();
    callback(data);
  } catch (err) {
    renderError('Some problem encountered while fetching data');
    console.error(err);
  }
};

const url = {
  currentWeather: (lat, lon) => `${API_URL}/weather?${lat}&${lon}&units=metric`,
  forecast: (lat, lon) => `${API_URL}/forecast?${lat}&${lon}&units=metric`,
  airPollution: (lat, lon) => `${API_URL}/air_pollution?${lat}&${lon}&units=metric`,
  reverseGeo: (lat, lon) => `${GEO_LOC_API_URL}/reverse?${lat}&${lon}&limit=5`,
  geo: (city_name) => `${GEO_LOC_API_URL}/direct?q=${city_name}&limit=5`
};

export {
  weekDayNames,
  monthNames,
  url,
  aqiText,
  getDate,
  getTime,
  getHours,
  mps_to_kmh,
  addEventOnElements,
  fetchData,
  renderError,
};
