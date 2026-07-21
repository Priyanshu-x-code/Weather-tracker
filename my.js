   
   
    const search = document.querySelector(".search-city");
    const cityName = document.querySelector(".city");
    const searchBtn  = document.querySelector (".search-btn");
    const sky  = document.querySelector (".sky");
    const readout  = document.querySelector (".readout");
    const displayName = document.querySelector (".readout-city");
    const displayUpd = document.querySelector (".readout-updated");
    const displayTemp = document.querySelector (".readout-temp");
    const displayUnitC = document.querySelector (".unitc");
    const displayUnitF = document.querySelector (".unitf");
    const displayIcon = document.querySelector (".condition-icon");
    const displayText = document.querySelector (".condition-text");
    const displayFeels = document.querySelector (".feels-like");
    const displayHumidity = document.querySelector (".humidity");
    const displayWind = document.querySelector (".wind");
    const displayReset = document.querySelector (".next-reset");
    

    let lastData = null;
    let unit ="C";
    let refreshTimer = null ;
    let countdownTimer = null;

    const REFRESH_MS = 10 * 60 * 1000;


function describeWeatherCode(code) {
  const map = {
    0:  { text: "Clear sky",                  icon: "☀️", sky: "clear-day" },
    1:  { text: "Mainly clear",               icon: "🌤️", sky: "clear-day" },
    2:  { text: "Partly cloudy",              icon: "⛅",  sky: "cloudy" },
    3:  { text: "Overcast",                   icon: "☁️",  sky: "cloudy" },
    45: { text: "Fog",                        icon: "🌫️", sky: "cloudy" },
    48: { text: "Depositing rime fog",        icon: "🌫️", sky: "cloudy" },
    51: { text: "Light drizzle",              icon: "🌦️", sky: "rain" },
    53: { text: "Moderate drizzle",           icon: "🌦️", sky: "rain" },
    55: { text: "Dense drizzle",              icon: "🌧️", sky: "rain" },
    56: { text: "Light freezing drizzle",     icon: "🌧️", sky: "rain" },
    57: { text: "Dense freezing drizzle",     icon: "🌧️", sky: "rain" },
    61: { text: "Slight rain",                icon: "🌧️", sky: "rain" },
    63: { text: "Moderate rain",              icon: "🌧️", sky: "rain" },
    65: { text: "Heavy rain",                 icon: "🌧️", sky: "rain" },
    66: { text: "Light freezing rain",        icon: "🌧️", sky: "rain" },
    67: { text: "Heavy freezing rain",        icon: "🌧️", sky: "rain" },
    71: { text: "Slight snow fall",           icon: "🌨️", sky: "cloudy" },
    73: { text: "Moderate snow fall",         icon: "🌨️", sky: "cloudy" },
    75: { text: "Heavy snow fall",            icon: "❄️",  sky: "cloudy" },
    77: { text: "Snow grains",                icon: "❄️",  sky: "cloudy" },
    80: { text: "Slight rain showers",        icon: "🌧️", sky: "rain" },
    81: { text: "Moderate rain showers",      icon: "🌧️", sky: "rain" },
    82: { text: "Violent rain showers",       icon: "⛈️", sky: "rain" },
    85: { text: "Slight snow showers",        icon: "🌨️", sky: "cloudy" },
    86: { text: "Heavy snow showers",         icon: "❄️",  sky: "cloudy" },
    95: { text: "Thunderstorm",               icon: "⛈️", sky: "rain" },
    96: { text: "Thunderstorm, slight hail",  icon: "⛈️", sky: "rain" },
    99: { text: "Thunderstorm, heavy hail",   icon: "⛈️", sky: "rain" },
  };
  return map[code] || { text: "Unknown", icon: "❔", sky: "clear-day" };
}

function celsiusToFahrenheit(celsius){
  return (celsius * 9)/ 5 + 32;
}

function formatTemp(celsius){
  const value = unit === "C" ? celsius : celsiusToFahrenheit (celsius);
  return `${Math.round(value)}°`;
}

function refreshTempDisplay(){
    if (!lastData) return;
    displayTemp.textContent= formatTemp(lastData.temperature);
    displayFeels.textContent = formatTemp(lastData.feelsLike);
}

// step1 geocoding
async function geocodeCity(cityInput) {
    const geoApi =`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityInput)}&count=1`;
    const res = await fetch (geoApi);
    if(!res.ok){
         alert ("Geocoding request failed");
         throw new Error ("Geocoding request failed") ;
    } 

    const data = await res.json();
    if (!data.results || data.results.length ===0) {
         alert (`couldn't find ${cityInput} . Try another city `);
         throw new Error(`couldn't find ${cityInput} . Try another city `);
    }
    const place = data.results[0];
    return {
        lat: place.latitude,
        lon: place.longitude,
        label: [place.name , place.admin1, place.country].filter(Boolean).join(","),
    };
}

// step-2 Fetch live weather for given coordinates
async function fetchWeather (lat, lon, label ) {
    const weaApi = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&timezone=auto`;

    const res = await fetch (weaApi);
    if (!res.ok) throw new Error ("weather request failed");
    
    const data = await res.json();
    const c = data.current;
    const weatherInfo = describeWeatherCode (c.weather_code);

    lastData = {
        label,
        temperature: c.temperature_2m,
        feelsLike: c.apparent_temperature,
        humidity : c.relative_humidity_2m,
        windSpeed : c.wind_speed_10m,
        weatherText : weatherInfo.text,
        weatherIcon : weatherInfo.icon,
        skyTheme : c.is_day===0 ? "night" : weatherInfo.sky,
    };

    renderWeather();
    startAutoRefresh(lat, lon , label);

}

// render - push lastData into the DOM
function renderWeather () {
   if (!lastData) return ;
    
   displayName.textContent = lastData.label;
   displayIcon.textContent = lastData.weatherIcon;
   displayText.textContent = lastData.weatherText;
   displayHumidity.textContent = `${lastData.humidity}%`;
   displayWind.textContent = `${Math.round(lastData.windSpeed)} km/h`;
   displayUpd.textContent = `updated ${new Date ().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"} )}`;

   refreshTempDisplay ();
   sky.className =`sky ${lastData.skyTheme}`;
   readout.classList.remove("hidden");
}

// main lookup flow (used by both search and geolocation)
  async function loadCity (cityInput) {
     readout.classList.add("hidden");
     const place = await geocodeCity(cityInput);
     await fetchWeather(place.lat, place.lon , place.label);

  }
  async function loadcoords(lat, lon ){
    readout.classList.add("hidden");
    await fetchWeather(lat , lon , "Your Location");
  }

//   auto refresh

function  startAutoRefresh(lat , lon , label ){
    clearInterval(refreshTimer);
    clearInterval(countdownTimer);

    refreshTimer = setInterval(() => fetchWeather(lat, lon , label), REFRESH_MS);
    let remaning = REFRESH_MS;
    countdownTimer = setInterval(() => {
        remaning -= 1000;
        if(remaning <= 0) remaning = REFRESH_MS;
        const mins = Math.floor(remaning / 60000);
        const secs = Math.floor((remaning % 60000)/ 1000);
        displayReset.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
    },1000);
}

// Event Listener
 search.addEventListener("submit",(e) =>{
    e.preventDefault();
    const cityInput = cityName.value.trim();
    if(cityInput) loadCity(cityInput);
 });

 searchBtn.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      loadcoords(pos.coords.latitude, pos.coords.longitude);
    });
 });

 displayUnitC.addEventListener("click", () =>{
    unit ="C";
    refreshTempDisplay();
 });
 displayUnitF.addEventListener("click", () => {
    unit ="F"
    refreshTempDisplay();
 });

