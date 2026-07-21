    const geoApi =`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityInput)}&count=1`;
    const weaApi ="https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&timezone=auto";
    const search = document.querySelector(".search-city");
    const cityName = document.querySelector(".city");
    const searchBtn  = document.querySelector (".search-btn");
    const readoutCity  = document.querySelector (".readout-city");
    const readoutUpd  = document.querySelector (".readout-update");




    let lastData = null;
    let unit ="C";
    let refreshTimer = null ;
    let countdownTimer = null;


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

// step1 geocoding
async function geocodeCity(cityInput) {
    const res = await fetch (geoApi);
    if(!res.ok){
         alert ("Geocoding request failed");
         throw new Error ("Geocoding request failed") ;
    } 

    const data = await res.json();
    if (!data.results || data.results.length ===0) {
         alert (`couldm't find ${cityInput} . Try another city `);
         throw new Error(`couldm't find ${cityInput} . Try another city `);
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
    const res = await fetch (weaApi);
    if (!res.ok) throw new Error ("weather request failed");
    
    const data = await res.json();
    const c = data.current;


}


// Event Listener
 search.addEventListener("submit",(e) =>{
    e.preventDefault();
    const cityInput = cityName.value.trim();
    if(cityInput) loadCity(cityInput);
 });

 searchBtn.addEventListener("click", () => {
    return loadCity(cityInput);
 });

