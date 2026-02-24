const apiKey = "YOUR_API_KEY_HERE";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search img");

const weatherIcon = document.querySelector(".weather-icon img");
const cityName = document.querySelector(".city-name");
const temperature = document.querySelector(".tem");
const humidity = document.querySelector(".humidity");
const wind = document.querySelector(".wind");

async function checkWeather(city) {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    
    if(response.status == 404){
        alert("City not found");
        return;
    }

    const data = await response.json();

    cityName.innerHTML = data.name;
    temperature.innerHTML = Math.round(data.main.temp) + "°C";
    humidity.innerHTML = data.main.humidity + "%";
    wind.innerHTML = data.wind.speed + " km/h";

    // Change Weather Icon
    if(data.weather[0].main === "Clouds"){
        weatherIcon.src = "weather-app-img/images/clouds.png";
    }
    else if(data.weather[0].main === "Clear"){
        weatherIcon.src = "weather-app-img/images/clear.png";
    }
    else if(data.weather[0].main === "Rain"){
        weatherIcon.src = "weather-app-img/images/rain.png";
    }
    else if(data.weather[0].main === "Drizzle"){
        weatherIcon.src = "weather-app-img/images/drizzle.png";
    }
    else if(data.weather[0].main === "Mist"){
        weatherIcon.src = "weather-app-img/images/mist.png";
    }
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});
