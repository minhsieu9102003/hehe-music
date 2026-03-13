import React, { useState, useRef, useCallback, useContext } from "react";
import { useWeather, weatherInfo } from "./WeatherContext";
import { NavContext } from "./NavContext";

export default function MiniWeather() {
    const { page, go } = useContext(NavContext);
    const { current, hourly, location, miniOpen, setMiniOpen } = useWeather();

    const [pos, setPos] = useState({ x: 20, y: 140 });
    const [hourOffset, setHourOffset] = useState(0);
    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const onMouseDown = useCallback((e) => {
        if (e.target.closest("button")) return;
        dragging.current = true;
        offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        const onMove = (e) => {
            if (!dragging.current) return;
            setPos({
                x: Math.max(0, Math.min(window.innerWidth - 280, e.clientX - offset.current.x)),
                y: Math.max(0, Math.min(window.innerHeight - 200, e.clientY - offset.current.y)),
            });
        };
        const onUp = () => { dragging.current = false; document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    }, [pos]);

    if (!miniOpen || !current || page === "weather") return null;

    // Find current hour index in hourly
    const now = new Date();
    const nowStr = `${now.toISOString().slice(0, 10)}T${String(now.getHours()).padStart(2, "0")}:00`;
    const nowIdx = hourly.findIndex(h => h.time === nowStr);
    const viewIdx = Math.max(0, Math.min(hourly.length - 1, (nowIdx >= 0 ? nowIdx : 0) + hourOffset));
    const viewHour = hourly[viewIdx];

    // Determine if viewing current hour or offset
    const isNow = hourOffset === 0;
    const viewTime = viewHour ? new Date(viewHour.time) : now;
    const timeLabel = isNow ? "現在" : `${viewTime.getHours()}:00`;
    const dayLabel = viewTime.toDateString() === now.toDateString() ? "" : `${viewTime.getMonth() + 1}/${viewTime.getDate()} `;

    const wi = viewHour ? weatherInfo(viewHour.code) : weatherInfo(current.weatherCode);
    const temp = viewHour ? Math.round(viewHour.temp) : Math.round(current.temp);
    const humidity = viewHour ? viewHour.humidity : current.humidity;
    const wind = viewHour ? viewHour.wind : current.windSpeed;
    const rain = viewHour ? viewHour.rain : current.precipitation;
    const rainProb = viewHour ? viewHour.rainProb : null;

    const canPrev = viewIdx > 0;
    const canNext = viewIdx < hourly.length - 1;

    return (
        <>
            <style>{CSS}</style>
            <div className="mw" style={{ left: pos.x, top: pos.y }} onMouseDown={onMouseDown}>
                {/* Header */}
                <div className="mw__head">
                    <span className="mw__loc">{location.name.split(",")[0]}</span>
                    <span className="mw__time">{dayLabel}{timeLabel}</span>
                    <button className="mw__hbtn" onClick={() => go("weather")} title="詳細ページ">
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#007bc3" strokeWidth="2" strokeLinecap="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
                    </button>
                    <button className="mw__hbtn" onClick={() => setMiniOpen(false)} title="閉じる">
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {/* Main weather display */}
                <div className="mw__main">
                    <button className="mw__arrow" onClick={() => canPrev && setHourOffset(h => h - 1)} disabled={!canPrev}>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={canPrev ? "#333" : "#ddd"} strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <div className="mw__center">
                        <span className="mw__icon">{wi.icon}</span>
                        <span className="mw__temp">{temp}°C</span>
                    </div>
                    <button className="mw__arrow" onClick={() => canNext && setHourOffset(h => h + 1)} disabled={!canNext}>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={canNext ? "#333" : "#ddd"} strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                </div>

                {/* Stats row */}
                <div className="mw__stats">
                    <div className="mw__s"><span>💧</span><span>{humidity}%</span></div>
                    <div className="mw__s"><span>💨</span><span>{wind}km/h</span></div>
                    {rain > 0 && <div className="mw__s"><span>🌧️</span><span>{rain}mm</span></div>}
                    {rainProb !== null && <div className="mw__s"><span>☔</span><span>{rainProb}%</span></div>}
                </div>

                {/* Reset to now */}
                {!isNow && (
                    <button className="mw__reset" onClick={() => setHourOffset(0)}>現在に戻る</button>
                )}
            </div>
        </>
    );
}

const CSS = `
.mw{position:fixed;z-index:9997;width:260px;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.15),0 1px 4px rgba(0,0,0,.1);cursor:grab;user-select:none;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif;overflow:hidden}
.mw:active{cursor:grabbing}
.mw__head{display:flex;align-items:center;gap:6px;padding:8px 10px;background:#f5f7fa;border-bottom:1px solid #eee}
.mw__loc{font-size:12px;font-weight:600;color:#333;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mw__time{font-size:10px;color:#999;flex-shrink:0}
.mw__hbtn{width:22px;height:22px;border:none;background:none;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;flex-shrink:0}
.mw__hbtn:hover{background:rgba(0,0,0,.06)}
.mw__main{display:flex;align-items:center;justify-content:center;padding:12px 8px 8px;gap:4px}
.mw__arrow{width:28px;height:28px;border:none;background:none;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;flex-shrink:0}
.mw__arrow:hover:not(:disabled){background:#f0f2f5}
.mw__arrow:disabled{cursor:default;opacity:.4}
.mw__center{display:flex;align-items:center;gap:8px}
.mw__icon{font-size:36px;line-height:1}
.mw__temp{font-size:28px;font-weight:300;color:#333}
.mw__stats{display:flex;justify-content:center;gap:12px;padding:4px 12px 10px;flex-wrap:wrap}
.mw__s{display:flex;align-items:center;gap:3px;font-size:11px;color:#666}
.mw__s span:first-child{font-size:13px}
.mw__reset{display:block;width:100%;border:none;background:#f5f7fa;color:#007bc3;font-size:11px;font-weight:500;padding:6px 0;cursor:pointer;transition:background .15s;font-family:inherit;border-top:1px solid #eee}
.mw__reset:hover{background:#e7f1fd}
`;
