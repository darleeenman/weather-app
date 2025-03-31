// Global variables
let temperature;
const apiKey = "fda3688b1db05987dd5d07c237aecfba";

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Content Loaded");

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
    console.log("Search form event listener added");
  }

  let currentButton = document.querySelector("#current-button");
  if (currentButton) {
    currentButton.addEventListener("click", handleCurrentLocation);
    console.log("Current button event listener added");
  }

  // Initialize date
  let dateElement = document.querySelector("#date");
  if (dateElement) {
    let currentTime = new Date();
    dateElement.innerHTML = formatDate(currentTime);
    console.log("Date initialized");
  }

  // Get initial location
  if (navigator.geolocation) {
    console.log("Geolocation is supported");
    navigator.geolocation.getCurrentPosition(getLocation, showError);
  } else {
    console.error("Geolocation is not supported by this browser");
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
  console.error("Error details:", error);
  let errorMessage = "An error occurred. ";
  if (error.code === 1) {
    errorMessage += "Location access denied. Please enable location services.";
  } else if (error.code === 2) {
    errorMessage +=
      "Location unavailable. Please try searching for a city instead.";
  } else if (error.code === 3) {
    errorMessage += "Location request timed out. Please try again.";
  } else {
    errorMessage += "Please try searching for a city instead.";
  }
  alert(errorMessage);
}

// Weather Functions
function displayForecast(response) {
  let forecast = response.data.daily;
  let forecastElement = document.querySelector("#forecast");

  let forecastHTML = `<div class="row">`;
  forecast.forEach(function (forecastDay, index) {
    if (index < 7) {
      forecastHTML =
        forecastHTML +
        `
    <div class="col-2">
      <div class="weather-forecast-date">${formatDay(forecastDay.dt)}</div>
      <img src="https://openweathermap.org/img/wn/${
        forecastDay.weather[0].icon
      }@2x.png" alt="" width="42" />
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
  console.log("Getting forecast for coordinates:", coordinates);
  let apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${apiKey}&exclude=minutely,hourly,alerts`;
  axios
    .get(apiUrl)
    .then((response) => {
      console.log("Forecast API Response:", response);
      displayForecast(response);
    })
    .catch((error) => {
      console.error("Forecast API error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        if (error.response.status === 401) {
          alert("API key error. Please check your API key configuration.");
        } else {
          alert(
            `Error: ${error.response.data.message || "Unknown error occurred"}`
          );
        }
      } else {
        showError(error);
      }
    });
}

function getWeather(response) {
  console.log("Processing weather data:", response);

  if (!response.data) {
    console.error("No data in response");
    return;
  }

  try {
    temperature = Math.round(response.data.main.temp);
    let city = response.data.name;

    let h3 = document.querySelector("#city");
    let currentTemp = document.querySelector("#current-temp");

    if (!h3 || !currentTemp) {
      console.error("Required elements not found for weather display");
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
      iconElement.setAttribute(
        "src",
        `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`
      );
      iconElement.setAttribute("alt", response.data.weather[0].description);
    }

    h3.innerHTML = city;
    currentTemp.innerHTML = temperature;

    console.log("Weather data processed successfully");
    getForecast(response.data.coord);
  } catch (error) {
    console.error("Error processing weather data:", error);
    showError(error);
  }
}

function searchCity(city) {
  console.log("Searching for city:", city);
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  let apiByCity = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=imperial&appid=${apiKey}`;
  console.log("Making API request to:", apiByCity);

  axios
    .get(apiByCity)
    .then((response) => {
      console.log("API Response received:", response);
      getWeather(response);
    })
    .catch((error) => {
      console.error("City search API error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        if (error.response.status === 404) {
          alert("City not found. Please try another city name.");
        } else if (error.response.status === 401) {
          alert("API key error. Please check your API key configuration.");
        } else {
          alert(
            `Error: ${error.response.data.message || "Unknown error occurred"}`
          );
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert(
          "No response received from the server. Please check your internet connection."
        );
      } else {
        console.error("Error setting up request:", error.message);
        alert("Error setting up the request. Please try again.");
      }
    });
}

// Event Handlers
function handleSubmit(event) {
  event.preventDefault();
  let cityInputElement = document.querySelector("#city-input");
  searchCity(cityInputElement.value);
}

function handleCurrentLocation(event) {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(getLocation, showError);
}

function getLocation(position) {
  console.log("Got location:", position);
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  let apiByLatLon = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

  axios
    .get(apiByLatLon)
    .then((response) => {
      console.log("API Response:", response);
      getWeather(response);
    })
    .catch((error) => {
      console.error("Location weather API error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        if (error.response.status === 401) {
          alert("API key error. Please check your API key configuration.");
        } else {
          alert(
            `Error: ${error.response.data.message || "Unknown error occurred"}`
          );
        }
      } else {
        showError(error);
      }
    });
}

// fahrenheit temperature
function displayFahrenheitTemperature(event) {
  event.preventDefault();
  console.log(event);
  let temperatureElement = document.querySelector("#current-temp");

  // celsiusLink.classList.remove("active");
  // fahrenheitLink.classList.add("active");
  let fahrenheitTemperature = (temperature * 9) / 5 + 32;
  temperatureElement.innerHTML = Math.round(fahrenheitTemperature);
}

// // celsius temperature
// function displayCelsiusTemperature(event) {
//   event.preventDefault();
//   celsiusLink.classList.add("active");
//   fahrenheitLink.classList.remove("active");
//   let temperatureElement = document.querySelector("#current-temp");
//   temperatureElement.innerHTML = Math.round(temperature);
// }

// search
function search(event) {
  event.preventDefault();
  let cityElement = document.querySelector("#city");
  let cityInput = document.querySelector("#city-input");
  cityElement.innerHTML = cityInput.value;
}

// // click convert
// let fahrenheitLink = document.querySelector("#fahrenheit-link");
// fahrenheitLink.addEventListener("click", displayFahrenheitTemperature);

// // let celsiusLink = document.querySelector("#celsius-link");
// // celsiusLink.addEventListener("click", displayCelsiusTemperature);
