import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cydas-weather-loc";
const DEFAULT_LOC = { name: "那覇市, 沖縄", lat: 26.3344, lon: 127.7457 };

function loadLoc() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_LOC; } catch { return DEFAULT_LOC; } }
function saveLoc(l) { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)); }

// Weather code → { icon emoji, label }
const WMO = {
    0: { icon: "☀️", label: "快晴" }, 1: { icon: "🌤️", label: "晴れ" }, 2: { icon: "⛅", label: "曇り時々晴れ" }, 3: { icon: "☁️", label: "曇り" },
    45: { icon: "🌫️", label: "霧" }, 48: { icon: "🌫️", label: "着氷性の霧" },
    51: { icon: "🌦️", label: "小雨" }, 53: { icon: "🌧️", label: "雨" }, 55: { icon: "🌧️", label: "強い雨" },
    56: { icon: "🌧️", label: "着氷性の雨" }, 57: { icon: "🌧️", label: "強い着氷性の雨" },
    61: { icon: "🌧️", label: "小雨" }, 63: { icon: "🌧️", label: "雨" }, 65: { icon: "🌧️", label: "大雨" },
    66: { icon: "🌧️", label: "着氷性の雨" }, 67: { icon: "🌧️", label: "強い着氷性の雨" },
    71: { icon: "🌨️", label: "小雪" }, 73: { icon: "🌨️", label: "雪" }, 75: { icon: "❄️", label: "大雪" },
    77: { icon: "🌨️", label: "霧雪" },
    80: { icon: "🌦️", label: "にわか雨" }, 81: { icon: "🌧️", label: "にわか雨" }, 82: { icon: "⛈️", label: "激しいにわか雨" },
    85: { icon: "🌨️", label: "にわか雪" }, 86: { icon: "❄️", label: "激しいにわか雪" },
    95: { icon: "⛈️", label: "雷雨" }, 96: { icon: "⛈️", label: "雹を伴う雷雨" }, 99: { icon: "⛈️", label: "激しい雹を伴う雷雨" },
};
export function weatherInfo(code) { return WMO[code] || { icon: "🌡️", label: "不明" }; }

const WeatherContext = createContext(null);
export function useWeather() { return useContext(WeatherContext); }

export function WeatherProvider({ children }) {
    const [location, setLocationState] = useState(loadLoc);
    const [current, setCurrent] = useState(null);
    const [hourly, setHourly] = useState([]);
    const [daily, setDaily] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [miniOpen, setMiniOpen] = useState(false);

    const setLocation = useCallback((loc) => {
        setLocationState(loc);
        saveLoc(loc);
    }, []);

    const fetchWeather = useCallback(async (lat, lon) => {
        setLoading(true);
        setError(null);
        try {
            const params = [
                `latitude=${lat}`, `longitude=${lon}`,
                `current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation,pressure_msl,cloud_cover,uv_index`,
                `hourly=temperature_2m,weather_code,precipitation_probability,precipitation,relative_humidity_2m,wind_speed_10m`,
                `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,uv_index_max`,
                `timezone=Asia/Tokyo`,
                `past_days=3`,
                `forecast_days=7`,
            ].join("&");
            const r = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
            if (!r.ok) throw new Error("API error");
            const d = await r.json();
            setCurrent({
                temp: d.current.temperature_2m,
                feelsLike: d.current.apparent_temperature,
                humidity: d.current.relative_humidity_2m,
                weatherCode: d.current.weather_code,
                windSpeed: d.current.wind_speed_10m,
                windDir: d.current.wind_direction_10m,
                precipitation: d.current.precipitation,
                pressure: d.current.pressure_msl,
                cloudCover: d.current.cloud_cover,
                uvIndex: d.current.uv_index,
                time: d.current.time,
            });
            // Hourly
            const hrs = d.hourly.time.map((t, i) => ({
                time: t, temp: d.hourly.temperature_2m[i], code: d.hourly.weather_code[i],
                rainProb: d.hourly.precipitation_probability[i], rain: d.hourly.precipitation[i],
                humidity: d.hourly.relative_humidity_2m[i], wind: d.hourly.wind_speed_10m[i],
            }));
            setHourly(hrs);
            // Daily
            const days = d.daily.time.map((t, i) => ({
                date: t, code: d.daily.weather_code[i],
                maxTemp: d.daily.temperature_2m_max[i], minTemp: d.daily.temperature_2m_min[i],
                rain: d.daily.precipitation_sum[i], rainProb: d.daily.precipitation_probability_max[i],
                wind: d.daily.wind_speed_10m_max[i], sunrise: d.daily.sunrise[i], sunset: d.daily.sunset[i],
                uvMax: d.daily.uv_index_max[i],
            }));
            setDaily(days);
        } catch (e) { setError(e.message); }
        setLoading(false);
    }, []);

    useEffect(() => { fetchWeather(location.lat, location.lon); }, [location, fetchWeather]);

    // Search cities via Open-Meteo geocoding
    const searchCity = useCallback(async (query) => {
        if (!query || query.length < 2) return [];
        try {
            const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=ja`);
            const d = await r.json();
            return (d.results || []).map(c => ({
                name: `${c.name}, ${c.admin1 || c.country}`,
                lat: c.latitude, lon: c.longitude,
            }));
        } catch { return []; }
    }, []);

    return (
        <WeatherContext.Provider value={{
            location, setLocation, current, hourly, daily, loading, error,
            searchCity, refresh: () => fetchWeather(location.lat, location.lon),
            miniOpen, setMiniOpen, weatherInfo,
        }}>
            {children}
        </WeatherContext.Provider>
    );
}
