import React, { useState, useRef, useCallback, useContext } from "react";
import { usePlayer } from "./PlayerContext";
import { NavContext } from "./NavContext";

const COLORS = ["#7da08a", "#E8927C", "#7EC8A0", "#C490D1", "#6BB8D6", "#D4A85C", "#E07B9B", "#8CABD4"];

function formatTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function MusicNoteIcon({ size = 20, color = "#fff" }) {
    return (<svg width={size} height={size} viewBox="0 0 32 32" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M22.5 5C22.5 4.72386 22.2761 4.5 22 4.5C21.7239 4.5 21.5 4.72386 21.5 5V22C21.5 24.4853 19.4853 26.5 17 26.5C14.5147 26.5 12.5 24.4853 12.5 22C12.5 19.5147 14.5147 17.5 17 17.5C18.3062 17.5 19.4817 18.0602 20.3 18.9529V5H22.5ZM20 22C20 20.3431 18.6569 19 17 19C15.3431 19 14 20.3431 14 22C14 23.6569 15.3431 25 17 25C18.6569 25 20 23.6569 20 22Z" fill={color} /><path d="M21.5 5V11.5L27 9.5V7L21.5 5Z" fill={color} opacity="0.6" /></svg>);
}

const MiniIcon = {
    Play: ({ s = 16, c = "#fff" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><polygon points="5 3 19 12 5 21" /></svg>,
    Pause: ({ s = 16, c = "#fff" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
    SkipF: ({ s = 14, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><polygon points="5 4 15 12 5 20" /><line x1="19" y1="5" x2="19" y2="19" stroke={c} strokeWidth="2" /></svg>,
    SkipB: ({ s = 14, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><polygon points="19 20 9 12 19 4" /><line x1="5" y1="5" x2="5" y2="19" stroke={c} strokeWidth="2" /></svg>,
    Vol: ({ s = 14, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>,
    Music: ({ s = 16, c = "#5d8a72" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>,
    X: ({ s = 14, c = "#999" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
};

export default function MiniPlayer() {
    const { page, go } = useContext(NavContext);
    const player = usePlayer();
    const { nowSong, nowPl, playing, currentTime, duration, volume,
        play, pause, seekTo, setVol, skipNext, skipPrev, setNowPlaying } = player;

    const [pos, setPos] = useState({ x: 20, y: 20 });
    const dragRef = useRef(null);
    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const onMouseDown = useCallback((e) => {
        if (e.target.closest("button, input")) return;
        dragging.current = true;
        offset.current = {
            x: e.clientX - pos.x,
            y: e.clientY - pos.y,
        };
        const onMouseMove = (e) => {
            if (!dragging.current) return;
            const x = Math.max(0, Math.min(window.innerWidth - 320, e.clientX - offset.current.x));
            const y = Math.max(0, Math.min(window.innerHeight - 180, e.clientY - offset.current.y));
            setPos({ x, y });
        };
        const onMouseUp = () => {
            dragging.current = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }, [pos]);

    // Don't show if no song, or if we're on the playlist page
    if (!nowSong || page === "playlist") return null;

    const remaining = duration - currentTime;
    const color = COLORS[(nowPl?.colorIdx || 0) % COLORS.length];

    return (
        <>
            <style>{MINI_CSS}</style>
            <div
                className="mp"
                ref={dragRef}
                style={{ left: pos.x, top: pos.y }}
                onMouseDown={onMouseDown}
            >
                {/* Header / drag handle */}
                <div className="mp__header">
                    <div className="mp__thumb" style={{ background: color }}>
                        <MusicNoteIcon size={16} color="rgba(255,255,255,0.7)" />
                    </div>
                    <div className="mp__info">
                        <span className="mp__song">{nowSong.title}</span>
                        <span className="mp__pl">{nowPl?.name}</span>
                    </div>
                    <button className="mp__close" onClick={() => setNowPlaying(null)} title="é–‰ã˜ã‚‹">
                        <MiniIcon.X />
                    </button>
                </div>

                {/* Progress */}
                <div className="mp__progress-row">
                    <input
                        type="range"
                        className="mp__progress"
                        min={0}
                        max={duration || 1}
                        value={currentTime}
                        onChange={e => seekTo(Number(e.target.value))}
                    />
                </div>

                {/* Controls */}
                <div className="mp__controls">
                    <div className="mp__btns">
                        <button className="mp__cbtn" onClick={skipPrev}><MiniIcon.SkipB /></button>
                        <button className="mp__play" onClick={() => playing ? pause() : play()}>
                            {playing ? <MiniIcon.Pause s={16} /> : <MiniIcon.Play s={16} />}
                        </button>
                        <button className="mp__cbtn" onClick={skipNext}><MiniIcon.SkipF /></button>
                    </div>
                    <span className="mp__remaining">-{formatTime(remaining)}</span>
                </div>

                {/* Volume + Go to playlist */}
                <div className="mp__bottom">
                    <div className="mp__vol-row">
                        <MiniIcon.Vol />
                        <input
                            type="range"
                            className="mp__vol"
                            min={0} max={100}
                            value={volume}
                            onChange={e => setVol(Number(e.target.value))}
                        />
                    </div>
                    <button className="mp__goto" onClick={() => go("playlist")} title="ãƒ—ãƒ¬ã‚¤ãƒªã‚¹ãƒˆã¸">
                        <MiniIcon.Music s={14} />
                    </button>
                </div>
            </div>
        </>
    );
}

const MINI_CSS = `
.mp{position:fixed;z-index:9999;width:300px;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.15),0 1px 4px rgba(0,0,0,.1);cursor:grab;user-select:none;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif;overflow:hidden}
.mp:active{cursor:grabbing}
.mp__header{display:flex;align-items:center;gap:10px;padding:12px 12px 8px;min-width:0}
.mp__thumb{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.mp__info{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.mp__song{font-size:12px;font-weight:600;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mp__pl{font-size:10px;color:#999}
.mp__close{width:24px;height:24px;border:none;background:none;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background .15s}
.mp__close:hover{background:#f0f2f5}
.mp__progress-row{padding:0 12px}
.mp__progress{width:100%;height:3px;-webkit-appearance:none;appearance:none;background:#e0e0e0;border-radius:2px;outline:none;cursor:pointer}
.mp__progress::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;background:#5d8a72;border-radius:50%;cursor:pointer}
.mp__controls{display:flex;align-items:center;justify-content:space-between;padding:6px 12px}
.mp__btns{display:flex;align-items:center;gap:8px}
.mp__cbtn{width:28px;height:28px;border:none;background:none;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.mp__cbtn:hover{background:#f0f2f5}
.mp__play{width:32px;height:32px;border:none;background:#5d8a72;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.mp__play:hover{background:#4a7560}
.mp__remaining{font-size:11px;color:#999;font-variant-numeric:tabular-nums}
.mp__bottom{display:flex;align-items:center;justify-content:space-between;padding:4px 12px 10px}
.mp__vol-row{display:flex;align-items:center;gap:6px}
.mp__vol{width:70px;height:3px;-webkit-appearance:none;appearance:none;background:#e0e0e0;border-radius:2px;outline:none;cursor:pointer}
.mp__vol::-webkit-slider-thumb{-webkit-appearance:none;width:8px;height:8px;background:#666;border-radius:50%;cursor:pointer}
.mp__goto{width:28px;height:28px;border:none;background:#eaf4ee;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.mp__goto:hover{background:#d4e6d9}
`;
