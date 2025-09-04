import React, { useState } from "react";
import "./index.css";

function App() {
  const [city, setCity] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [weather, setWeather] = useState(null);

  // Fixed city list with coordinates
  const topCities = [
    { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
    { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
    { name: "Delhi", lat: 28.6139, lon: 77.2090 },
    { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
    { name: "Pune", lat: 18.5204, lon: 73.8567 },
    { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
    { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
    { name: "Lucknow", lat: 26.8467, lon: 80.9462 }
  ];

  const fetchWeather = async (selectedCity) => {
  const targetCity = selectedCity || city;
  if (!targetCity) return;

  try {
    // Step 1: Get city coordinates dynamically
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${targetCity}&count=1&language=en&format=json`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      setWeather({ error: "City not found in our database." });
      return;
    }

    const { latitude, longitude, name } = geoData.results[0];

    // Step 2: Fetch weather using the coordinates
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData = await weatherResponse.json();

    setWeather({ ...weatherData.current_weather, city: name });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    setWeather({ error: "Failed to fetch weather data. Try again later." });
  }



    const matchedCity = topCities.find(
      (c) => c.name.trim().toLowerCase() === targetCity.trim().toLowerCase()
    );

   
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${matchedCity.lat}&longitude=${matchedCity.lon}&current_weather=true`
      );
      const data = await response.json();
      setWeather({ ...data.current_weather, city: matchedCity.name });
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  // Emoji for weather condition
  const getWeatherEmoji = (weatherCode) => {
    if (!weatherCode) return "🌈";
    if (weatherCode < 3) return "☀️"; // Clear sky
    if (weatherCode < 45) return "🌤️"; // Cloudy
    if (weatherCode < 61) return "🌧️"; // Rain
    if (weatherCode < 80) return "❄️"; // Snow
    return "🌪️"; // Storm/other
  };

  // Filter dropdown cities
  const handleCityInput = (e) => {
    const value = e.target.value;
    setCity(value);
    setFilteredCities(
      topCities.filter((c) => c.name.toLowerCase().startsWith(value.toLowerCase()))
    );
  };

  // Refresh app
  const refreshApp = () => {
    setCity("");
    setWeather(null);
    setFilteredCities([]);
  };

  return (
    <div className="container">
      <div className="weather-box">
        <h1 className="title">Weather Now</h1>

        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={handleCityInput}
          />
          <button onClick={() => fetchWeather()}>Get Weather</button>
        </div>

        {filteredCities.length > 0 && (
          <ul className="dropdown">
            {filteredCities.map((c, index) => (
              <li
                key={index}
                onClick={() => {
                  setCity(c.name);
                  fetchWeather(c.name);
                  setFilteredCities([]); // Hide dropdown
                }}
              >
                {c.name}
              </li>
            ))}
          </ul>
        )}

        {weather && (
          <div className="weather-result">
            <h2>
              {weather.city} {getWeatherEmoji(weather.weathercode)}
            </h2>
            <p>
              <strong>Temperature:</strong> {weather.temperature}°C
            </p>
            <p>
              <strong>Windspeed:</strong> {weather.windspeed} km/h
            </p>
            <button className="refresh-btn" onClick={refreshApp}>
              🔄 Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
