import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cydas-weather-loc";
const DEFAULT_LOC = { name: "那覇市, 沖縄", lat: 26.3344, lon: 127.7457 };
function loadLoc() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_LOC; } catch { return DEFAULT_LOC; } }
function saveLoc(l) { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)); }

// Weather code → label (no emoji)
const WMO = {
    0: "快晴", 1: "晴れ", 2: "曇り時々晴れ", 3: "曇り",
    45: "霧", 48: "着氷性の霧",
    51: "小雨", 53: "雨", 55: "強い雨", 56: "着氷性の雨", 57: "強い着氷性の雨",
    61: "小雨", 63: "雨", 65: "大雨", 66: "着氷性の雨", 67: "強い着氷性の雨",
    71: "小雪", 73: "雪", 75: "大雪", 77: "霧雪",
    80: "にわか雨", 81: "にわか雨", 82: "激しいにわか雨",
    85: "にわか雪", 86: "激しいにわか雪",
    95: "雷雨", 96: "雹を伴う雷雨", 99: "激しい雹を伴う雷雨",
};
// Weather code → icon type for SVG
const WMO_TYPE = {
    0: "sun", 1: "sun-cloud", 2: "cloud-sun", 3: "cloud",
    45: "fog", 48: "fog",
    51: "drizzle", 53: "rain", 55: "rain-heavy", 56: "rain", 57: "rain-heavy",
    61: "drizzle", 63: "rain", 65: "rain-heavy", 66: "rain", 67: "rain-heavy",
    71: "snow", 73: "snow", 75: "snow-heavy", 77: "snow",
    80: "rain-light", 81: "rain", 82: "thunder",
    85: "snow", 86: "snow-heavy",
    95: "thunder", 96: "thunder", 99: "thunder",
};
export function weatherLabel(code) { return WMO[code] || "不明"; }
export function weatherType(code) { return WMO_TYPE[code] || "sun"; }

// SVG weather icon component
export function WeatherIcon({ code, size = 24, color = "#808CBA" }) {
    const type = weatherType(code);
    const s = size;
    const c = color;
    switch (type) {
        case "sun": return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>);
        case "sun-cloud": return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="1" y1="7" x2="3" y2="7" /><line x1="2.34" y1="3.34" x2="3.76" y2="4.76" /></svg>);
        case "cloud-sun": return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>);
        case "cloud": return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>);
        case "fog": return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><line x1="3" y1="10" x2="21" y2="10" /><line x1="5" y1="14" x2="19" y2="14" /><line x1="7" y1="18" x2="17" y2="18" /><path d="M18 6h-1.26A8 8 0 1 0 9 6h9" /></svg>);
        case "drizzle":
        case "rain-light": return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /><line x1="10" y1="22" x2="10" y2="24" /><line x1="14" y1="22" x2="14" y2="24" /></svg>);
        case "rain": return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /><line x1="8" y1="21" x2="7" y2="23" /><line x1="12" y1="21" x2="11" y2="23" /><line x1="16" y1="21" x2="15" y2="23" /></svg>);
        case "rain-heavy": return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /><line x1="7" y1="21" x2="5.5" y2="23.5" /><line x1="11" y1="21" x2="9.5" y2="23.5" /><line x1="15" y1="21" x2="13.5" y2="23.5" /><line x1="19" y1="21" x2="17.5" y2="23.5" /></svg>);
        case "snow": return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /><circle cx="9" cy="22" r="0.8" fill={c} /><circle cx="13" cy="23" r="0.8" fill={c} /><circle cx="17" cy="22" r="0.8" fill={c} /></svg>);
        case "snow-heavy": return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /><circle cx="8" cy="22" r="0.8" fill={c} /><circle cx="11" cy="23" r="0.8" fill={c} /><circle cx="14" cy="22" r="0.8" fill={c} /><circle cx="17" cy="23" r="0.8" fill={c} /></svg>);
        case "thunder": return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /><polyline points="13 16 11 20 15 20 12 24" /></svg>);
        default: return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="5" /></svg>);
    }
}

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

    const setLocation = useCallback((loc) => { setLocationState(loc); saveLoc(loc); }, []);

    const fetchWeather = useCallback(async (lat, lon) => {
        setLoading(true); setError(null);
        try {
            const params = [
                `latitude=${lat}`, `longitude=${lon}`,
                `current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation,pressure_msl,cloud_cover,uv_index`,
                `hourly=temperature_2m,weather_code,precipitation_probability,precipitation,relative_humidity_2m,wind_speed_10m`,
                `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,uv_index_max`,
                `timezone=Asia/Tokyo`, `past_days=3`, `forecast_days=7`,
            ].join("&");
            const r = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
            if (!r.ok) throw new Error("API error");
            const d = await r.json();
            setCurrent({ temp: d.current.temperature_2m, feelsLike: d.current.apparent_temperature, humidity: d.current.relative_humidity_2m, weatherCode: d.current.weather_code, windSpeed: d.current.wind_speed_10m, windDir: d.current.wind_direction_10m, precipitation: d.current.precipitation, pressure: d.current.pressure_msl, cloudCover: d.current.cloud_cover, uvIndex: d.current.uv_index, time: d.current.time });
            setHourly(d.hourly.time.map((t, i) => ({ time: t, temp: d.hourly.temperature_2m[i], code: d.hourly.weather_code[i], rainProb: d.hourly.precipitation_probability[i], rain: d.hourly.precipitation[i], humidity: d.hourly.relative_humidity_2m[i], wind: d.hourly.wind_speed_10m[i] })));
            setDaily(d.daily.time.map((t, i) => ({ date: t, code: d.daily.weather_code[i], maxTemp: d.daily.temperature_2m_max[i], minTemp: d.daily.temperature_2m_min[i], rain: d.daily.precipitation_sum[i], rainProb: d.daily.precipitation_probability_max[i], wind: d.daily.wind_speed_10m_max[i], sunrise: d.daily.sunrise[i], sunset: d.daily.sunset[i], uvMax: d.daily.uv_index_max[i] })));
        } catch (e) { setError(e.message); }
        setLoading(false);
    }, []);

    useEffect(() => { fetchWeather(location.lat, location.lon); }, [location, fetchWeather]);

    const searchCity = useCallback(async (query) => {
        if (!query || query.length < 2) return [];
        try {
            const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=ja`);
            const d = await r.json();
            return (d.results || []).map(c => ({ name: `${c.name}, ${c.admin1 || c.country}`, lat: c.latitude, lon: c.longitude }));
        } catch { return []; }
    }, []);

    return (
        <WeatherContext.Provider value={{ location, setLocation, current, hourly, daily, loading, error, searchCity, refresh: () => fetchWeather(location.lat, location.lon), miniOpen, setMiniOpen }}>
            {children}
        </WeatherContext.Provider>
    );
}
