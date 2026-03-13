import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { useWeather, weatherLabel, WeatherIcon } from "./WeatherContext";

function windDir(deg) { const d = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]; return d[Math.round(deg / 22.5) % 16]; }
function fmtH(t) { return t ? t.split("T")[1]?.slice(0, 5) : ""; }
function fmtDate(d) { const dt = new Date(d); return `${dt.getMonth() + 1}/${dt.getDate()}`; }
function dayName(d) { return ["日", "月", "火", "水", "木", "金", "土"][new Date(d).getDay()]; }
function isToday(d) { return new Date(d).toDateString() === new Date().toDateString(); }

// Small stat icons (SVG, monochrome)
function DropIcon({ s = 16, c = "#7da08a" }) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>; }
function WindIcon({ s = 16, c = "#7da08a" }) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" /></svg>; }
function GaugeIcon({ s = 16, c = "#7da08a" }) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>; }
function SunriseIcon({ s = 16, c = "#7da08a" }) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0" /><line x1="12" y1="9" x2="12" y2="2" /><line x1="4.22" y1="10.22" x2="5.64" y2="11.64" /><line x1="1" y1="18" x2="3" y2="18" /><line x1="21" y1="18" x2="23" y2="18" /><line x1="18.36" y1="11.64" x2="19.78" y2="10.22" /><line x1="23" y1="22" x2="1" y2="22" /><polyline points="8 6 12 2 16 6" /></svg>; }
function SunsetIcon({ s = 16, c = "#7da08a" }) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0" /><line x1="12" y1="2" x2="12" y2="9" /><line x1="4.22" y1="10.22" x2="5.64" y2="11.64" /><line x1="1" y1="18" x2="3" y2="18" /><line x1="21" y1="18" x2="23" y2="18" /><line x1="18.36" y1="11.64" x2="19.78" y2="10.22" /><line x1="23" y1="22" x2="1" y2="22" /><polyline points="16 6 12 10 8 6" /></svg>; }
function UVIcon({ s = 16, c = "#7da08a" }) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /></svg>; }
function CloudIcon({ s = 16, c = "#7da08a" }) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>; }
function RefreshIcon({ s = 16, c = "#666" }) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>; }
function MiniIcon({ s = 16, c = "#666" }) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" /></svg>; }
function LocIcon({ s = 16, c = "#7da08a" }) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>; }
function RainIcon({ s = 16, c = "#7da08a" }) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /><line x1="10" y1="21" x2="9" y2="23" /><line x1="14" y1="21" x2="13" y2="23" /></svg>; }

function StatCard({ icon, label, value, unit, sub }) {
    return (
        <div className="wt-stat">
            <div className="wt-stat__icon">{icon}</div>
            <div className="wt-stat__info">
                <span className="wt-stat__label">{label}</span>
                <span className="wt-stat__value">{value}<small>{unit}</small></span>
                {sub && <span className="wt-stat__sub">{sub}</span>}
            </div>
        </div>
    );
}

export default function WeatherPage() {
    const { location, setLocation, current, hourly, daily, loading, error, searchCity, refresh, setMiniOpen } = useWeather();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const debRef = useRef(null);

    useEffect(() => {
        clearTimeout(debRef.current);
        if (query.length < 2) { setResults([]); return; }
        debRef.current = setTimeout(async () => { const r = await searchCity(query); setResults(r); }, 400);
    }, [query, searchCity]);

    const selectCity = (c) => { setLocation(c); setQuery(""); setResults([]); };
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayHours = hourly.filter(h => h.time.startsWith(todayStr));
    const nowHour = new Date().getHours();

    if (loading && !current) return (<div className="hp-lay"><Sidebar activeId="" /><div className="hp-main"><div className="wt-loading">読み込み中...</div></div></div>);

    return (
        <>
            <style>{CSS}</style>
            <div className="hp-lay">
                <Sidebar activeId="" />
                <div className="hp-main">
                    <div className="wt-page">
                        {/* Header */}
                        <div className="wt-header">
                            <div className="wt-header__left">
                                <WeatherIcon code={current?.weatherCode ?? 1} size={28} color="#7da08a" />
                                <h1>天気予報</h1>
                            </div>
                            <button className="wt-btn wt-btn--ghost" onClick={() => setMiniOpen(true)}>
                                <MiniIcon s={14} />
                                <span>ミニ表示</span>
                            </button>
                        </div>

                        {/* Location */}
                        <div className="wt-loc-row">
                            <div className="wt-loc-current"><LocIcon s={16} /><span>{location.name}</span></div>
                            <div className="wt-search-wrap">
                                <input className="wt-search" type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="都市名を検索..." />
                                {results.length > 0 && (<div className="wt-search-dropdown">{results.map((c, i) => (<div key={i} className="wt-search-item" onClick={() => selectCity(c)}>{c.name}</div>))}</div>)}
                            </div>
                            <button className="wt-btn wt-btn--icon" onClick={refresh} title="更新"><RefreshIcon s={16} /></button>
                        </div>

                        {error && <div className="wt-error">{error}</div>}

                        {current && (<>
                            {/* Hero */}
                            <div className="wt-hero">
                                <div className="wt-hero__main">
                                    <WeatherIcon code={current.weatherCode} size={56} color="#7da08a" />
                                    <div className="wt-hero__temp">
                                        <span className="wt-hero__deg">{Math.round(current.temp)}</span>
                                        <span className="wt-hero__unit">°C</span>
                                    </div>
                                </div>
                                <div className="wt-hero__details">
                                    <span className="wt-hero__label">{weatherLabel(current.weatherCode)}</span>
                                    <span className="wt-hero__feels">体感 {Math.round(current.feelsLike)}°C</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="wt-stats">
                                <StatCard icon={<DropIcon s={20} />} label="湿度" value={current.humidity} unit="%" />
                                <StatCard icon={<WindIcon s={20} />} label="風速" value={current.windSpeed} unit="km/h" sub={windDir(current.windDir)} />
                                <StatCard icon={<RainIcon s={20} />} label="降水量" value={current.precipitation} unit="mm" />
                                <StatCard icon={<GaugeIcon s={20} />} label="気圧" value={Math.round(current.pressure)} unit="hPa" />
                                <StatCard icon={<CloudIcon s={20} />} label="雲量" value={current.cloudCover} unit="%" />
                                <StatCard icon={<UVIcon s={20} />} label="UV指数" value={current.uvIndex} unit="" sub={current.uvIndex >= 8 ? "非常に強い" : current.uvIndex >= 6 ? "強い" : current.uvIndex >= 3 ? "中程度" : "弱い"} />
                            </div>

                            {/* Sunrise/sunset */}
                            {daily.length > 0 && (() => {
                                const today = daily.find(d => isToday(d.date)) || daily[3]; if (!today) return null; return (
                                    <div className="wt-sun-row">
                                        <div className="wt-sun"><SunriseIcon s={18} /><span>日の出</span><b>{fmtH(today.sunrise)}</b></div>
                                        <div className="wt-sun"><SunsetIcon s={18} /><span>日の入</span><b>{fmtH(today.sunset)}</b></div>
                                    </div>
                                );
                            })()}

                            {/* Hourly */}
                            <h2 className="wt-section-title">時間別予報（今日）</h2>
                            <div className="wt-hourly-scroll">
                                <div className="wt-hourly">
                                    {todayHours.map((h, i) => {
                                        const hr = parseInt(h.time.split("T")[1]); const isCur = hr === nowHour; return (
                                            <div key={i} className={`wt-hour ${isCur ? "is-now" : ""} ${hr < nowHour ? "is-past" : ""}`}>
                                                <span className="wt-hour__time">{isCur ? "今" : `${hr}時`}</span>
                                                <WeatherIcon code={h.code} size={20} color={isCur ? "#5d8a72" : "#999"} />
                                                <span className="wt-hour__temp">{Math.round(h.temp)}°</span>
                                                <span className="wt-hour__rain">{h.rainProb}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Daily */}
                            <h2 className="wt-section-title">日別予報</h2>
                            <div className="wt-daily">
                                {daily.map((d, i) => {
                                    const today = isToday(d.date); const isPast = new Date(d.date) < new Date(todayStr); return (
                                        <div key={i} className={`wt-day ${today ? "is-today" : ""} ${isPast ? "is-past" : ""}`}>
                                            <div className="wt-day__date">
                                                <span>{fmtDate(d.date)}</span>
                                                <span className="wt-day__dow">({dayName(d.date)})</span>
                                                {today && <span className="wt-day__badge">今日</span>}
                                                {isPast && <span className="wt-day__badge wt-day__badge--past">過去</span>}
                                            </div>
                                            <WeatherIcon code={d.code} size={22} color={today ? "#5d8a72" : "#999"} />
                                            <span className="wt-day__label">{weatherLabel(d.code)}</span>
                                            <div className="wt-day__temps">
                                                <span className="wt-day__max">{Math.round(d.maxTemp)}°</span>
                                                <span className="wt-day__min">{Math.round(d.minTemp)}°</span>
                                            </div>
                                            <div className="wt-day__extra">
                                                <span><DropIcon s={12} c="#999" />{d.rainProb}%</span>
                                                <span><WindIcon s={12} c="#999" />{d.wind}km/h</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>)}
                    </div>
                </div>
            </div>
        </>
    );
}

const CSS = `
.hp-lay{display:flex;min-height:calc(100vh - 64px)}
.hp-main{flex:1;background:#fff;min-width:0;overflow-y:auto}
.wt-page{max-width:900px;margin:0 auto;padding:32px 48px 64px}
@media(max-width:1023px){.wt-page{padding:24px 24px 48px}}
@media(max-width:767px){.wt-page{padding:16px 16px 32px}}
.wt-loading{display:flex;align-items:center;justify-content:center;height:60vh;color:#999;font-size:14px}
.wt-error{background:#fce4ec;color:#c62828;padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:16px}
.wt-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.wt-header__left{display:flex;align-items:center;gap:10px}
.wt-header__left h1{font-size:20px;font-weight:700;color:#333;margin:0}
.wt-loc-row{display:flex;align-items:center;gap:12px;margin-bottom:28px;flex-wrap:wrap}
.wt-loc-current{display:flex;align-items:center;gap:6px;font-size:14px;font-weight:600;color:#333}
.wt-search-wrap{position:relative;flex:1;max-width:260px}
.wt-search{width:100%;height:36px;border:1px solid #dcdcdc;border-radius:8px;padding:0 12px;font-size:13px;font-family:inherit;color:#333;outline:none;transition:border-color .2s}
.wt-search:focus{border-color:#5d8a72;box-shadow:0 0 0 2px rgba(93,138,114,.12)}
.wt-search::placeholder{color:#bbb}
.wt-search-dropdown{position:absolute;top:40px;left:0;right:0;background:#fff;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.1);z-index:100;max-height:240px;overflow-y:auto}
.wt-search-item{padding:10px 14px;font-size:13px;cursor:pointer;transition:background .15s}
.wt-search-item:hover{background:#f5f7fa}
.wt-hero{display:flex;flex-direction:column;align-items:center;padding:24px 0 20px;gap:6px}
.wt-hero__main{display:flex;align-items:center;gap:16px}
.wt-hero__temp{display:flex;align-items:flex-start}
.wt-hero__deg{font-size:48px;font-weight:200;color:#333;line-height:1}
.wt-hero__unit{font-size:20px;color:#999;margin-top:6px}
.wt-hero__details{display:flex;flex-direction:column;align-items:center;gap:2px}
.wt-hero__label{font-size:14px;color:#666;font-weight:500}
.wt-hero__feels{font-size:13px;color:#999}
.wt-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
@media(max-width:700px){.wt-stats{grid-template-columns:repeat(2,1fr)}}
.wt-stat{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid #e8e8e8;border-radius:10px}
.wt-stat__icon{flex-shrink:0}
.wt-stat__info{display:flex;flex-direction:column;min-width:0}
.wt-stat__label{font-size:11px;color:#999;font-weight:500}
.wt-stat__value{font-size:18px;font-weight:600;color:#333}
.wt-stat__value small{font-size:12px;color:#999;margin-left:2px;font-weight:400}
.wt-stat__sub{font-size:11px;color:#7da08a}
.wt-sun-row{display:flex;gap:24px;justify-content:center;margin-bottom:28px}
.wt-sun{font-size:13px;color:#666;display:flex;align-items:center;gap:6px}
.wt-sun b{color:#333;margin-left:2px}
.wt-section-title{font-size:15px;font-weight:700;color:#333;margin:0 0 14px}
.wt-hourly-scroll{overflow-x:auto;margin-bottom:28px;padding-bottom:4px}
.wt-hourly{display:flex;gap:2px;min-width:max-content}
.wt-hour{display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 12px;border-radius:8px;min-width:56px;transition:background .15s}
.wt-hour.is-now{background:#eaf4ee}
.wt-hour.is-past{opacity:.45}
.wt-hour__time{font-size:11px;color:#666}
.wt-hour__temp{font-size:14px;font-weight:600;color:#333}
.wt-hour__rain{font-size:10px;color:#7da08a}
.wt-daily{display:flex;flex-direction:column;gap:2px}
.wt-day{display:flex;align-items:center;padding:12px 16px;border-radius:8px;gap:12px;transition:background .15s}
.wt-day:hover{background:#f9fafb}
.wt-day.is-today{background:#f0f6ff}
.wt-day.is-past{opacity:.55}
.wt-day__date{display:flex;align-items:center;gap:4px;width:120px;flex-shrink:0;font-size:13px;color:#333;font-weight:500}
.wt-day__dow{font-size:12px;color:#999}
.wt-day__badge{font-size:10px;background:#5d8a72;color:#fff;padding:1px 6px;border-radius:4px;margin-left:4px}
.wt-day__badge--past{background:#ccc}
.wt-day__label{font-size:12px;color:#666;width:90px;flex-shrink:0}
.wt-day__temps{display:flex;gap:8px;width:70px;flex-shrink:0}
.wt-day__max{font-size:13px;font-weight:600;color:#e57373}
.wt-day__min{font-size:13px;color:#64b5f6}
.wt-day__extra{display:flex;gap:10px;font-size:11px;color:#999;align-items:center}
.wt-day__extra span{display:flex;align-items:center;gap:3px}
@media(max-width:700px){.wt-day{flex-wrap:wrap;gap:8px}.wt-day__date{width:auto}.wt-day__label{width:auto}}
.wt-btn{display:inline-flex;align-items:center;gap:6px;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:background .15s}
.wt-btn--ghost{background:#f0f2f5;color:#555}
.wt-btn--ghost:hover{background:#e4e6ea}
.wt-btn--icon{background:none;padding:6px;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer}
.wt-btn--icon:hover{background:#f0f2f5}
`;
