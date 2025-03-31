// Global variables
let temperature;
const apiKey = "0d78d3d987e492a289265ccd0e1ddc36";

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Check for required elements
  const requiredElements = [
    "#search-form",
    "#current-button",
    "#date",
    "#city",
    "#current-temp",
    "#temperature-description",
    "#humidity",
    "#wind",
    "#icon",
    "#forecast",
  ];

  requiredElements.forEach((selector) => {
    const element = document.querySelector(selector);
    if (!element) {
      console.error(`Required element not found: ${selector}`);
    }
  });

  let searchForm = document.querySelector("#search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", handleSubmit);
  }

  let currentButton = document.querySelector("#current-button");
  if (currentButton) {
    currentButton.addEventListener("click", handleCurrentLocation);
  }

  // Initialize date
  let dateElement = document.querySelector("#date");
  if (dateElement) {
    let currentTime = new Date();
    dateElement.innerHTML = formatDate(currentTime);
  }

  // Get initial location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getLocation, showError);
  }
});

// Helper Functions
function formatDate(timestamp) {
  let date = new Date(timestamp);
  let hours = date.getHours();
  if (hours < 10) {
    hours = `0${hours}`;
  }
  let minutes = date.getMinutes();
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  // date
  const d = new Date();
  document.getElementById("MonthDayYear").innerHTML = d.toDateString();

  return `${hours}:${minutes}`;
}

function formatDay(timestamp) {
  let date = new Date(timestamp * 1000);
  let days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
  let day = date.getDay();
  return days[day];
}

function showError(error) {
  // Silent error handling
  console.error("Error details:", error);
}

// Weather Functions
function displayForecast(response) {
  if (!response.data || !response.data.daily) {
    return;
  }

  let forecast = response.data.daily;
  let forecastElement = document.querySelector("#forecast");
  if (!forecastElement) {
    return;
  }

  let forecastHTML = `<div class="row">`;
  forecast.forEach(function (forecastDay, index) {
    if (index < 7) {
      const iconCode = forecastDay.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

      forecastHTML =
        forecastHTML +
        `
    <div class="col-2">
      <div class="weather-forecast-date">${formatDay(forecastDay.dt)}</div>
      <img src="${iconUrl}" alt="${
          forecastDay.weather[0].description
        }" width="42" style="display: block;" />
      <div class="weather-forecast-temperatures">
        <span class="weather-forecast-temperature-max"> ${Math.round(
          forecastDay.temp.max
        )}° </span>
        <span class="weather-forecast-temperature-min"> ${Math.round(
          forecastDay.temp.min
        )}° </span>
      </div>
    </div>
    `;
    }
  });

  forecastHTML = forecastHTML + `</div>`;
  forecastElement.innerHTML = forecastHTML;
}

function getForecast(coordinates) {
  let apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${apiKey}&exclude=minutely,hourly,alerts`;
  axios
    .get(apiUrl)
    .then((response) => {
      displayForecast(response);
    })
    .catch((error) => {
      console.error("Forecast API error:", error);
    });
}

function getWeather(response) {
  if (!response.data) {
    return;
  }

  try {
    temperature = Math.round(response.data.main.temp);
    let city = response.data.name;

    let h3 = document.querySelector("#city");
    let currentTemp = document.querySelector("#current-temp");

    if (!h3 || !currentTemp) {
      return;
    }

    let description = document.querySelector("#temperature-description");
    let humidityElement = document.querySelector("#humidity");
    let windElement = document.querySelector("#wind");
    let dateElement = document.querySelector("#date");
    let iconElement = document.querySelector("#icon");

    if (description)
      description.innerHTML = response.data.weather[0].description;
    if (humidityElement)
      humidityElement.innerHTML = response.data.main.humidity;
    if (windElement)
      windElement.innerHTML = Math.round(response.data.wind.speed);
    if (dateElement)
      dateElement.innerHTML = formatDate(response.data.dt * 1000);
    if (iconElement) {
      const iconCode = response.data.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
      iconElement.setAttribute("src", iconUrl);
      iconElement.setAttribute("alt", response.data.weather[0].description);
      iconElement.style.display = "block";
    }

    h3.innerHTML = city;
    currentTemp.innerHTML = temperature;

    getForecast(response.data.coord);
  } catch (error) {
    console.error("Error processing weather data:", error);
  }
}

function searchCity(city) {
  if (!city) {
    return;
  }

  let apiByCity = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=imperial&appid=${apiKey}`;

  axios
    .get(apiByCity)
    .then((response) => {
      getWeather(response);
    })
    .catch((error) => {
      console.error("City search API error:", error);
    });
}

// Event Handlers
function handleSubmit(event) {
  event.preventDefault();
  let cityInputElement = document.querySelector("#city-input");
  if (!cityInputElement || !cityInputElement.value) {
    return;
  }
  searchCity(cityInputElement.value);
}

function handleCurrentLocation(event) {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(getLocation, showError);
}

function getLocation(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  let apiByLatLon = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

  axios
    .get(apiByLatLon)
    .then((response) => {
      getWeather(response);
    })
    .catch((error) => {
      console.error("Location weather API error:", error);
    });
}

// fahrenheit temperature
function displayFahrenheitTemperature(event) {
  event.preventDefault();
  let temperatureElement = document.querySelector("#current-temp");
  let fahrenheitTemperature = (temperature * 9) / 5 + 32;
  temperatureElement.innerHTML = Math.round(fahrenheitTemperature);
}

// search
function search(event) {
  event.preventDefault();
  let cityElement = document.querySelector("#city");
  let cityInput = document.querySelector("#city-input");
  cityElement.innerHTML = cityInput.value;
}
