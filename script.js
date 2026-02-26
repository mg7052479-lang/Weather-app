const apiKey = "5ed4382dc2a7234aa80cb4048278926e";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const weatherIcon = document.querySelector(".weather-icon img");
const searchbox = document.querySelector(".search input");
const searchbtn = document.querySelector(".search button");

async function checkWeather(city) {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

    if (!response.ok) {
        alert("City not found");
        return;
    }

    const data = await response.json();

    document.querySelector(".city-name").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

    const weatherMain = data.weather[0].main;

    if (weatherMain === "Clouds") {
        weatherIcon.src = "weather-app-img/images/clouds.png";
    } else if (weatherMain === "Clear") {
        weatherIcon.src = "weather-app-img/images/clear.png";
    } else if (weatherMain === "Rain") {
        weatherIcon.src = "weather-app-img/images/rain.png";
    } else if (weatherMain === "Drizzle") {
        weatherIcon.src = "weather-app-img/images/drizzle.png";
    } else if (weatherMain === "Mist") {
        weatherIcon.src = "weather-app-img/images/mist.png";
    }
}

searchbtn.addEventListener("click", () => {
    checkWeather(searchbox.value);
});
