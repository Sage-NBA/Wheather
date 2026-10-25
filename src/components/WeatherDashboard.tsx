import { useState, useEffect, useRef } from "react";
import {
  CloudSun,
  List,
  MapPin,
  Settings,
  Search,
  Thermometer,
  Wind,
  Droplets,
  Sun,
  Gauge,
  Eye,
  Compass,
  Loader2,
} from "lucide-react";
import { WeatherIcon, SunIcon } from "./WeatherIcons";

interface CityResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface HourlyForecastItem {
  timeLabel: string;
  weatherCode: number;
  temperature: number;
}

interface DailyForecastItem {
  dayLabel: string;
  weatherCode: number;
  condition: string;
  tempMax: number;
  tempMin: number;
}

interface WeatherFullData {
  city: string;
  country: string;
  currentTemp: number;
  weatherCode: number;
  conditionText: string;
  rainChance: number;
  realFeel: number;
  windSpeed: number;
  uvIndex: number;
  humidity: number;
  pressure: number;
  elevation: number;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}

// Convert WMO code to friendly name
function getWeatherText(code: number): string {
  if (code === 0) return "Sunny";
  if (code >= 1 && code <= 3) return code === 1 ? "Mainly Clear" : "Partly Cloudy";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 67) return "Rainy";
  if (code >= 71 && code <= 77) return "Snowy";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code >= 95) return "Storm";
  return "Cloudy";
}

// Map WMO code to the 4 concise labels in the mockup: Sunny, Cloudy, Rainy, Storm
function getConciseCondition(code: number): string {
  if (code === 0) return "Sunny";
  if (code >= 1 && code <= 3) return "Sunny";
  if (code >= 45 && code <= 48) return "Cloudy";
  if (code >= 51 && code <= 82) return "Rainy";
  if (code >= 95) return "Storm";
  return "Cloudy";
}

const POPULAR_CITIES = [
  { name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038 },
  { name: "Tokyo", country: "Japan", lat: 35.6895, lon: 139.6917 },
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.006 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708 },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
];

export default function WeatherDashboard() {
  const [activeNav, setActiveNav] = useState<"weather" | "cities" | "map" | "settings">("weather");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CityResult[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherFullData | null>(null);
  const [showMoreConditions, setShowMoreConditions] = useState(false);

  // Settings
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const [windUnit, setWindUnit] = useState<"kmh" | "mph">("kmh");

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Weather for Coordinates
  const fetchWeatherForLocation = async (
    lat: number,
    lon: number,
    cityName: string,
    countryName: string
  ) => {
    setLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();

      // Parse 6 Hourly slots: 6:00 AM, 9:00 AM, 12:00 PM, 3:00 PM, 6:00 PM, 9:00 PM
      const targetHours = [6, 9, 12, 15, 18, 21];
      const todayHourly: HourlyForecastItem[] = [];

      // Find today's date prefix
      const todayDateStr = data.daily?.time?.[0] || new Date().toISOString().split("T")[0];

      targetHours.forEach((hour) => {
        const hourStr = hour < 10 ? `0${hour}:00` : `${hour}:00`;
        const timeTarget = `${todayDateStr}T${hourStr}`;
        const idx = data.hourly?.time?.indexOf(timeTarget);

        let temp = 25;
        let wCode = 0;

        if (idx !== -1 && idx !== undefined) {
          temp = Math.round(data.hourly.temperature_2m[idx]);
          wCode = data.hourly.weather_code[idx];
        } else {
          // Fallback approximate index
          temp = Math.round(data.hourly?.temperature_2m?.[hour] ?? 25);
          wCode = data.hourly?.weather_code?.[hour] ?? 0;
        }

        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;

        todayHourly.push({
          timeLabel: `${displayHour}:00 ${period}`,
          weatherCode: wCode,
          temperature: temp,
        });
      });

      // Parse 7 Days Forecast
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dailyList: DailyForecastItem[] = [];

      if (data.daily?.time) {
        for (let i = 0; i < Math.min(7, data.daily.time.length); i++) {
          const date = new Date(data.daily.time[i] + "T00:00:00");
          const dayName = i === 0 ? "Today" : daysOfWeek[date.getDay()];
          const code = data.daily.weather_code[i];

          dailyList.push({
            dayLabel: dayName,
            weatherCode: code,
            condition: getConciseCondition(code),
            tempMax: Math.round(data.daily.temperature_2m_max[i]),
            tempMin: Math.round(data.daily.temperature_2m_min[i]),
          });
        }
      }

      setWeatherData({
        city: cityName,
        country: countryName,
        currentTemp: Math.round(data.current?.temperature_2m ?? 31),
        weatherCode: data.current?.weather_code ?? 0,
        conditionText: getWeatherText(data.current?.weather_code ?? 0),
        rainChance: data.daily?.precipitation_probability_max?.[0] ?? 0,
        realFeel: Math.round(data.current?.apparent_temperature ?? 30),
        windSpeed: Number((data.current?.wind_speed_10m ?? 0.2).toFixed(1)),
        uvIndex: Math.round(data.daily?.uv_index_max?.[0] ?? 3),
        humidity: Math.round(data.current?.relative_humidity_2m ?? 45),
        pressure: Math.round(data.current?.surface_pressure ?? 1013),
        elevation: Math.round(data.elevation ?? 660),
        hourly: todayHourly,
        daily: dailyList,
      });
    } catch (err) {
      console.error("Error loading weather data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load: Madrid (as in the UI screenshot)
  useEffect(() => {
    fetchWeatherForLocation(40.4168, -3.7038, "Madrid", "Spain");
  }, []);

  // Search geocoding debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            searchQuery.trim()
          )}&count=5&language=en&format=json`
        );
        const data = await res.json();
        if (data.results) {
          setSearchResults(data.results);
          setShowSearchDropdown(true);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCity = (result: CityResult) => {
    fetchWeatherForLocation(result.latitude, result.longitude, result.name, result.country);
    setSearchQuery("");
    setShowSearchDropdown(false);
    setActiveNav("weather");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectCity(searchResults[0]);
    }
  };

  // Unit conversion helpers
  const formatTemp = (celsius: number) => {
    if (tempUnit === "F") {
      return `${Math.round((celsius * 9) / 5 + 32)}°`;
    }
    return `${celsius}°`;
  };

  const formatWind = (kmh: number) => {
    if (windUnit === "mph") {
      return `${(kmh * 0.621371).toFixed(1)} mph`;
    }
    return `${kmh} km/h`;
  };

  return (
    <div className="min-h-screen bg-[#0b131e] text-white flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans selection:bg-[#0095ff]/30">
      {/* Outer Dashboard Window Container */}
      <div className="w-full max-w-[1200px] bg-[#141d2b] border border-[#1f2d42] rounded-[32px] shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6 relative overflow-hidden">
        {/* =========================================
            LEFT VERTICAL SIDEBAR
        ========================================= */}
        <aside className="w-full md:w-20 bg-[#202b3b] rounded-2xl md:rounded-[24px] py-4 px-3 flex md:flex-col items-center justify-between md:justify-start gap-4 md:gap-7 shrink-0">
          {/* Logo Wind Icon */}
          <div className="w-12 h-12 rounded-2xl bg-[#2a384e] flex items-center justify-center text-[#38bdf8] shadow-inner">
            <Wind size={24} strokeWidth={2.2} />
          </div>

          {/* Navigation Items */}
          <nav className="flex md:flex-col items-center gap-3 sm:gap-4 md:gap-6 w-full justify-around md:justify-start">
            <button
              onClick={() => setActiveNav("weather")}
              className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                activeNav === "weather"
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-colors ${
                  activeNav === "weather" ? "text-white" : ""
                }`}
              >
                <CloudSun size={22} />
              </div>
              <span className="text-[11px] font-medium tracking-tight">Weather</span>
            </button>

            <button
              onClick={() => setActiveNav("cities")}
              className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                activeNav === "cities"
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="p-2 rounded-xl transition-colors">
                <List size={22} />
              </div>
              <span className="text-[11px] font-medium tracking-tight">Cities</span>
            </button>

            <button
              onClick={() => setActiveNav("map")}
              className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                activeNav === "map"
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="p-2 rounded-xl transition-colors">
                <MapPin size={22} />
              </div>
              <span className="text-[11px] font-medium tracking-tight">Map</span>
            </button>

            <button
              onClick={() => setActiveNav("settings")}
              className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                activeNav === "settings"
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="p-2 rounded-xl transition-colors">
                <Settings size={22} />
              </div>
              <span className="text-[11px] font-medium tracking-tight">Settings</span>
            </button>
          </nav>
        </aside>

        {/* =========================================
            CENTER & MAIN WEATHER CONTENT
        ========================================= */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Top Search Bar */}
          <div ref={searchContainerRef} className="relative w-full">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowSearchDropdown(true);
                  }}
                  placeholder="Search for cities"
                  className="w-full bg-[#202b3b] hover:bg-[#253246] focus:bg-[#253246] text-white text-sm placeholder:text-slate-400 px-4 py-3.5 rounded-2xl outline-none border border-transparent focus:border-[#2f3f56] transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-white"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin text-[#0095ff]" />
                  ) : (
                    <Search size={18} />
                  )}
                </button>
              </div>
            </form>

            {/* Autocomplete Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1b2535] border border-[#2a384e] rounded-2xl shadow-2xl overflow-hidden z-30 divide-y divide-[#2a384e]/60">
                {searchResults.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelectCity(city)}
                    className="w-full text-left px-5 py-3 hover:bg-[#243247] transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <span className="font-medium text-white group-hover:text-[#38bdf8] transition-colors">
                        {city.name}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        {city.admin1 ? `${city.admin1}, ` : ""}
                        {city.country}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conditional Views Based on Active Nav */}
          {activeNav === "cities" ? (
            /* POPULAR CITIES VIEW */
            <div className="bg-[#202b3b] rounded-3xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                Popular Cities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      fetchWeatherForLocation(c.lat, c.lon, c.name, c.country);
                      setActiveNav("weather");
                    }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-[#1b2535] hover:bg-[#263449] border border-transparent hover:border-[#38bdf8]/30 transition-all text-left cursor-pointer group"
                  >
                    <div>
                      <p className="font-semibold text-white group-hover:text-[#38bdf8] transition-colors">
                        {c.name}
                      </p>
                      <p className="text-xs text-slate-400">{c.country}</p>
                    </div>
                    <MapPin size={16} className="text-slate-500 group-hover:text-[#38bdf8]" />
                  </button>
                ))}
              </div>
            </div>
          ) : activeNav === "settings" ? (
            /* SETTINGS VIEW */
            <div className="bg-[#202b3b] rounded-3xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-5">
                Preferences & Units
              </h3>
              <div className="space-y-5 max-w-md">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-medium">
                    Temperature Unit
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTempUnit("C")}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        tempUnit === "C"
                          ? "bg-[#0095ff] text-white shadow-lg shadow-[#0095ff]/20"
                          : "bg-[#1b2535] text-slate-400 hover:text-white"
                      }`}
                    >
                      Celsius (°C)
                    </button>
                    <button
                      onClick={() => setTempUnit("F")}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        tempUnit === "F"
                          ? "bg-[#0095ff] text-white shadow-lg shadow-[#0095ff]/20"
                          : "bg-[#1b2535] text-slate-400 hover:text-white"
                      }`}
                    >
                      Fahrenheit (°F)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-medium">
                    Wind Speed Unit
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWindUnit("kmh")}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        windUnit === "kmh"
                          ? "bg-[#0095ff] text-white shadow-lg shadow-[#0095ff]/20"
                          : "bg-[#1b2535] text-slate-400 hover:text-white"
                      }`}
                    >
                      km/h
                    </button>
                    <button
                      onClick={() => setWindUnit("mph")}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        windUnit === "mph"
                          ? "bg-[#0095ff] text-white shadow-lg shadow-[#0095ff]/20"
                          : "bg-[#1b2535] text-slate-400 hover:text-white"
                      }`}
                    >
                      mph
                    </button>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => setActiveNav("weather")}
                    className="w-full bg-[#0095ff] hover:bg-[#0084e3] text-white py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer"
                  >
                    Done & Return to Weather
                  </button>
                </div>
              </div>
            </div>
          ) : activeNav === "map" ? (
            /* MAP / COORDINATES VIEW */
            <div className="bg-[#202b3b] rounded-3xl p-6 text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1b2535] flex items-center justify-center text-[#38bdf8]">
                <Compass size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {weatherData?.city}, {weatherData?.country}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
                Elevation: {weatherData?.elevation}m • Surface pressure: {weatherData?.pressure} hPa
              </p>
              <button
                onClick={() => setActiveNav("weather")}
                className="bg-[#0095ff] hover:bg-[#0084e3] text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            /* MAIN WEATHER VIEW (HERO + TODAY'S FORECAST + AIR CONDITIONS) */
            <>
              {/* Hero Weather Section */}
              <div className="px-3 sm:px-4 flex items-center justify-between min-h-[160px]">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    {weatherData?.city || "Madrid"}
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">
                    Chance of rain: {weatherData?.rainChance ?? 0}%
                  </p>

                  <div className="text-5xl sm:text-6xl font-bold tracking-tight text-white mt-6 sm:mt-8">
                    {weatherData ? formatTemp(weatherData.currentTemp) : "31°"}
                  </div>
                </div>

                {/* 3D Sun / Weather Icon Hero */}
                <div className="shrink-0 relative flex items-center justify-center pr-2 sm:pr-8">
                  {weatherData?.weatherCode === 0 ? (
                    <SunIcon size={140} className="drop-shadow-2xl animate-pulse" />
                  ) : (
                    <WeatherIcon
                      code={weatherData?.weatherCode ?? 0}
                      size={140}
                      className="drop-shadow-2xl"
                    />
                  )}
                </div>
              </div>

              {/* TODAY'S FORECAST Card */}
              <div className="bg-[#202b3b] rounded-3xl p-5 sm:p-6 shadow-sm">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-5">
                  Today's Forecast
                </h3>

                <div className="grid grid-cols-3 sm:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-700/50">
                  {weatherData?.hourly.map((h, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-between py-3 sm:py-0 px-2 gap-3"
                    >
                      <span className="text-xs text-slate-400 font-medium">
                        {h.timeLabel}
                      </span>
                      <div className="my-1 flex items-center justify-center h-10">
                        <WeatherIcon code={h.weatherCode} size={36} />
                      </div>
                      <span className="text-base sm:text-lg font-bold text-white">
                        {formatTemp(h.temperature)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AIR CONDITIONS Card */}
              <div className="bg-[#202b3b] rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Air Conditions
                  </h3>
                  <button
                    onClick={() => setShowMoreConditions(!showMoreConditions)}
                    className="bg-[#0095ff] hover:bg-[#0084e3] active:scale-95 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer shadow-sm shadow-[#0095ff]/20"
                  >
                    {showMoreConditions ? "Show less" : "See more"}
                  </button>
                </div>

                {/* 2x2 Grid matching mockup */}
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  {/* Real Feel */}
                  <div className="flex items-start gap-2.5">
                    <Thermometer size={20} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">
                        Real Feel
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-white block mt-0.5">
                        {weatherData ? formatTemp(weatherData.realFeel) : "30°"}
                      </span>
                    </div>
                  </div>

                  {/* Wind */}
                  <div className="flex items-start gap-2.5">
                    <Wind size={20} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">
                        Wind
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-white block mt-0.5">
                        {weatherData ? formatWind(weatherData.windSpeed) : "0.2 km/h"}
                      </span>
                    </div>
                  </div>

                  {/* Chance of rain */}
                  <div className="flex items-start gap-2.5">
                    <Droplets size={20} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">
                        Chance of rain
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-white block mt-0.5">
                        {weatherData?.rainChance ?? 0}%
                      </span>
                    </div>
                  </div>

                  {/* UV Index */}
                  <div className="flex items-start gap-2.5">
                    <Sun size={20} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">
                        UV Index
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-white block mt-0.5">
                        {weatherData?.uvIndex ?? 3}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Extended "See more" Drawer */}
                {showMoreConditions && (
                  <div className="mt-5 pt-4 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fade-in text-xs">
                    <div className="bg-[#1b2535] p-3 rounded-xl flex items-center gap-2.5">
                      <Droplets size={16} className="text-[#38bdf8]" />
                      <div>
                        <span className="text-slate-400 block">Humidity</span>
                        <span className="text-sm font-bold text-white">
                          {weatherData?.humidity}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#1b2535] p-3 rounded-xl flex items-center gap-2.5">
                      <Gauge size={16} className="text-[#38bdf8]" />
                      <div>
                        <span className="text-slate-400 block">Pressure</span>
                        <span className="text-sm font-bold text-white">
                          {weatherData?.pressure} hPa
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#1b2535] p-3 rounded-xl flex items-center gap-2.5 col-span-2 sm:col-span-1">
                      <Eye size={16} className="text-[#38bdf8]" />
                      <div>
                        <span className="text-slate-400 block">Elevation</span>
                        <span className="text-sm font-bold text-white">
                          {weatherData?.elevation} m
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* =========================================
            RIGHT SIDEBAR: 7-DAY FORECAST
        ========================================= */}
        <div className="w-full lg:w-[320px] shrink-0 bg-[#202b3b] rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
              7-Day Forecast
            </h3>

            {/* List of 7 Days */}
            <div className="divide-y divide-slate-700/50">
              {weatherData?.daily.map((d, index) => (
                <div
                  key={index}
                  className="py-3.5 flex items-center justify-between first:pt-1 last:pb-1"
                >
                  {/* Day label */}
                  <span className="w-14 text-sm font-medium text-slate-300">
                    {d.dayLabel}
                  </span>

                  {/* Icon + Condition */}
                  <div className="flex items-center gap-2.5 flex-1 justify-start pl-2">
                    <WeatherIcon code={d.weatherCode} size={28} />
                    <span className="text-sm font-semibold text-white">
                      {d.condition}
                    </span>
                  </div>

                  {/* Max / Min temp */}
                  <div className="text-sm tracking-tight text-right shrink-0">
                    <span className="font-bold text-white">
                      {tempUnit === "F"
                        ? Math.round((d.tempMax * 9) / 5 + 32)
                        : d.tempMax}
                    </span>
                    <span className="text-slate-500 font-medium">
                      /
                      {tempUnit === "F"
                        ? Math.round((d.tempMin * 9) / 5 + 32)
                        : d.tempMin}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/40 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Open-Meteo API Feed
          </div>
        </div>
      </div>
    </div>
  );
}
