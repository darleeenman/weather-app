// date
const d = new Date();
document.getElementById("MonthDayYear").innerHTML = d.toDateString();

// date + time
function formatDate(date) {
  let hours = date.getHours();
  if (hours < 10) {
    hours = `0${hours}`;
  }
  let minutes = date.getMinutes();
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  // let dayIndex = date.getDay();
  // let days = [
  //   "Sunday",
  //   "Monday",
  //   "Tuesday",
  //   "Wednesday",
  //   "Thursday",
  //   "Friday",
  //   "Saturday",
  // ];
  // let day = days[dayIndex];

  return `${hours}:${minutes}`;
}

// forecast
function displayForecast() {
  let forecastElement = document.querySelector("#forecast");

  let days = ["Wed", "Thurs", "Fri", "Sat", "Sun", "Mon"];

  let forecastHTML = `<div class="row">`;
  days.forEach(function (day) {
    forecastHTML =
      forecastHTML +
      `
    <div class="col-2">
      <div class="weather-forecast-date">${day}</div>
        <img src="http://openweathermap.org/img/wn/50d@2x.png" alt="" width="42" />
        <div class="weather-forecast-temperatures">
          <span class="weather-forecast-temperature-max"> 18° </span>
          <span class="weather-forecast-temperature-min"> 12° </span>
          </div>
        </div>
    `;
  });

  forecastHTML = forecastHTML + `</div>`;
  forecastElement.innerHTML = forecastHTML;
  console.log(forecastHTML);
}

// search
function search(event) {
  event.preventDefault();
  let cityElement = document.querySelector("#city");
  let cityInput = document.querySelector("#city-input");
  cityElement.innerHTML = cityInput.value;
}

// date
let dateElement = document.querySelector("#date");
let currentTime = new Date();
dateElement.innerHTML = formatDate(currentTime);

// search form
let searchForm = document.querySelector("#search-form");
searchForm.addEventListener("submit", handleSubmit);

let temperature;

// current button
let currentButton = document.querySelector("#current-button");
currentButton.addEventListener("click", handleCurrentLocation);

let apiKey = "c5f0e59acac64258bb92ed027d20c68f";

// lat + lon location
function getLocation(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  let apiByLatLon = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  axios.get(apiByLatLon).then(getWeather);
}

// main weather function
function getWeather(response) {
  temperature = Math.round(response.data.main.temp);
  let city = response.data.name;

  let h3 = document.querySelector("#city");
  let currentTemp = document.querySelector("#current-temp");

  let description = document.querySelector("#temperature-description");
  description.innerHTML = response.data.weather[0].description;

  let humidityElement = document.querySelector("#humidity");
  humidityElement.innerHTML = response.data.main.humidity;

  let windElement = document.querySelector("#wind");
  windElement.innerHTML = Math.round(response.data.wind.speed);

  let iconElement = document.querySelector("#icon");
  iconElement.setAttribute(
    "src",
    `http://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`
  );

  h3.innerHTML = city;
  currentTemp.innerHTML = temperature;
}
navigator.geolocation.getCurrentPosition(getLocation);

// search city
function searchCity(city) {
  let apiByCity = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  axios.get(apiByCity).then(getWeather);
}

// submit
function handleSubmit(event) {
  event.preventDefault();
  let cityInputElement = document.querySelector("#city-input");
  searchCity(cityInputElement.value);
}

// current location button
function handleCurrentLocation(event) {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(getLocation);
}

// click convert
let fahrenheitLink = document.querySelector("#fahrenheit-link");
fahrenheitLink.addEventListener("click", displayFahrenheitTemperature);

let celsiusLink = document.querySelector("#celsius-link");
celsiusLink.addEventListener("click", displayCelsiusTemperature);

// fahrenheit temperature
function displayFahrenheitTemperature(event) {
  event.preventDefault();
  console.log(event);
  let temperatureElement = document.querySelector("#current-temp");

  celsiusLink.classList.remove("active");
  fahrenheitLink.classList.add("active");
  let fahrenheitTemperature = (temperature * 9) / 5 + 32;
  temperatureElement.innerHTML = Math.round(fahrenheitTemperature);
}

// celsius temperature
function displayCelsiusTemperature(event) {
  event.preventDefault();
  celsiusLink.classList.add("active");
  fahrenheitLink.classList.remove("active");
  let temperatureElement = document.querySelector("#current-temp");
  temperatureElement.innerHTML = Math.round(temperature);
}

displayForecast();
