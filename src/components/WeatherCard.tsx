import { useState, useEffect } from "react";
import { CloudSun, Search, Wind, Thermometer, RefreshCw } from "lucide-react";

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
}

// Convert Open-Meteo weather codes to human readable text + emoji
function getWeatherDescription(code: number): { text: string; emoji: string } {
  if (code === 0) return { text: "Clear Sky", emoji: "☀️" };
  if (code >= 1 && code <= 3) return { text: "Partly Cloudy", emoji: "⛅" };
  if (code >= 45 && code <= 48) return { text: "Foggy", emoji: "🌫️" };
  if (code >= 51 && code <= 55) return { text: "Drizzle", emoji: "🌦️" };
  if (code >= 61 && code <= 67) return { text: "Rainy", emoji: "🌧️" };
  if (code >= 71 && code <= 77) return { text: "Snowy", emoji: "❄️" };
  if (code >= 80 && code <= 82) return { text: "Rain Showers", emoji: "🌦️" };
  if (code >= 95 && code <= 99) return { text: "Thunderstorm", emoji: "⛈️" };
  return { text: "Cloudy", emoji: "☁️" };
}

export default function WeatherCard() {
  const [query, setQuery] = useState("London");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (cityName: string) => {
    if (!cityName.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Geocoding API: Get latitude & longitude
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityName.trim()
        )}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found. Try another city!");
      }

      const place = geoData.results[0];
      const { latitude, longitude, name, country } = place;

      // 2. Weather API: Get current temperature and weather code
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      if (!weatherData.current_weather) {
        throw new Error("Unable to fetch weather details.");
      }

      setWeather({
        city: name,
        country: country || "",
        temperature: Math.round(weatherData.current_weather.temperature),
        weatherCode: weatherData.current_weather.weathercode,
        windSpeed: weatherData.current_weather.windspeed,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch weather.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather("London");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(query);
  };

  const weatherInfo = weather ? getWeatherDescription(weather.weatherCode) : null;

  const quickCities = ["London", "Tokyo", "New York", "Paris"];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CloudSun size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-slate-800 text-lg">Live Weather</h2>
              <p className="text-xs text-slate-400">Open-Meteo API</p>
            </div>
          </div>
          <button
            onClick={() => fetchWeather(weather ? weather.city : query)}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Refresh weather"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-blue-600" : ""} />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city (e.g. Madrid)..."
              className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Find
          </button>
        </form>

        {/* Quick Picks */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          <span className="text-xs text-slate-400 mr-1">Quick:</span>
          {quickCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setQuery(city);
                fetchWeather(city);
              }}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              {city}
            </button>
          ))}
        </div>

        {/* Status / Output */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm mb-2 border border-red-100">
            {error}
          </div>
        )}

        {weather && !error && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-xl p-4 border border-blue-100/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                  {weather.country ? `${weather.city}, ${weather.country}` : weather.city}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-bold text-slate-800">
                    {weather.temperature}°C
                  </span>
                  <span className="text-sm text-slate-500 font-medium">
                    / {Math.round((weather.temperature * 9) / 5 + 32)}°F
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-4xl select-none">{weatherInfo?.emoji}</span>
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  {weatherInfo?.text}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-200/50 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Wind size={14} className="text-blue-500" />
                Wind: {weather.windSpeed} km/h
              </span>
              <span className="flex items-center gap-1.5">
                <Thermometer size={14} className="text-blue-500" />
                Live metric
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
