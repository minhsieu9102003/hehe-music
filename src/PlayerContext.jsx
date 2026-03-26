import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "cydas-playlists";
const DEFAULT_PLAYLISTS = [
    { id: 1, name: "朝のモチベーション", description: "仕事を始める前に聴くプレイリスト", colorIdx: 0, songs: [] },
    { id: 2, name: "集中タイム", description: "ディープワーク用のBGM", colorIdx: 1, songs: [] },
    { id: 3, name: "リラックス", description: "休憩時間や退勤後に", colorIdx: 2, songs: [] },
];

function loadPlaylists() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function savePlaylists(pl) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pl));
}

let _nextId = Date.now();
export function uid() { return _nextId++; }

const PlayerContext = createContext(null);
export function usePlayer() { return useContext(PlayerContext); }

// ─── Mobile detect — FORCED ON cho debug (rollback: PlayerContext_desktop_mobile_split.jsx.bak) ───
const isMobile = true;

// ═══════════════════════════════════════════════════
// Audio URL extraction: Piped + Invidious
// ═══════════════════════════════════════════════════
const SOURCES = [
    // Proxied qua Vercel rewrites → cùng origin → không bị CORS
    { type: "invidious", url: "/api/inv1" },
    { type: "invidious", url: "/api/inv2" },
    { type: "invidious", url: "/api/inv3" },
    { type: "piped", url: "/api/piped1" },
    { type: "piped", url: "/api/piped2" },
];

async function fetchWithTimeout(url, ms = 8000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);
    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        return res;
    } catch (e) {
        clearTimeout(timeout);
        throw e;
    }
}

function pickBestStream(streams) {
    if (!streams || streams.length === 0) return null;
    // Prefer mp4/m4a audio, highest bitrate
    const sorted = streams
        .filter(s => s.url && s.type?.includes("audio"))
        .sort((a, b) => {
            const aM4a = a.type?.includes("mp4") ? 1 : 0;
            const bM4a = b.type?.includes("mp4") ? 1 : 0;
            if (aM4a !== bM4a) return bM4a - aM4a;
            return (b.bitrate || 0) - (a.bitrate || 0);
        });
    return sorted[0]?.url || null;
}

function pickBestPipedStream(streams) {
    if (!streams || streams.length === 0) return null;
    const sorted = streams
        .filter(s => s.url)
        .sort((a, b) => {
            const aM4a = a.mimeType?.includes("mp4") ? 1 : 0;
            const bM4a = b.mimeType?.includes("mp4") ? 1 : 0;
            if (aM4a !== bM4a) return bM4a - aM4a;
            return (b.bitrate || 0) - (a.bitrate || 0);
        });
    return sorted[0]?.url || null;
}

async function getAudioUrl(videoId) {
    for (const src of SOURCES) {
        try {
            if (src.type === "invidious") {
                // Rewrite đã map tới /api/v1/, chỉ cần thêm /videos/
                const apiUrl = `${src.url}/videos/${videoId}`;
                console.log(`[Audio] Trying Invidious: ${apiUrl}`);
                const res = await fetchWithTimeout(apiUrl);
                if (!res.ok) { console.log(`[Audio] ${src.url} → ${res.status}`); continue; }
                const data = await res.json();
                const url = pickBestStream(data.adaptiveFormats || []);
                if (url) { console.log(`[Audio] ✓ Got from ${src.url}`); return url; }
                console.log(`[Audio] ${src.url} no audio streams`);
            } else {
                const apiUrl = `${src.url}/streams/${videoId}`;
                console.log(`[Audio] Trying Piped: ${apiUrl}`);
                const res = await fetchWithTimeout(apiUrl);
                if (!res.ok) { console.log(`[Audio] ${src.url} → ${res.status}`); continue; }
                const data = await res.json();
                const url = pickBestPipedStream(data.audioStreams || []);
                if (url) { console.log(`[Audio] ✓ Got from ${src.url}`); return url; }
                console.log(`[Audio] ${src.url} no audio streams`);
            }
        } catch (e) {
            console.log(`[Audio] ${src.url} FAIL: ${e.message}`);
        }
    }
    console.log("[Audio] ALL sources failed");
    return null;
}

// ─── Media Session ───
function updateMediaSession(title, artist, handlers) {
    if (!("mediaSession" in navigator)) return;
    try {
        navigator.mediaSession.metadata = new MediaMetadata({ title: title || "Unknown", artist: artist || "" });
        navigator.mediaSession.setActionHandler("play", handlers.play);
        navigator.mediaSession.setActionHandler("pause", handlers.pause);
        navigator.mediaSession.setActionHandler("nexttrack", handlers.next);
        navigator.mediaSession.setActionHandler("previoustrack", handlers.prev);
    } catch { }
}

// ═══════════════════════════════════════════════════
// Provider
// ═══════════════════════════════════════════════════
export function PlayerProvider({ children }) {
    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const intervalRef = useRef(null);
    const stateRef = useRef({});

    const ytRef = useRef(null);
    const containerRef = useRef(null);
    const audioRef = useRef(null);
    const [audioLoading, setAudioLoading] = useState(false);
    const [useFallbackYT, setUseFallbackYT] = useState(false);
    const pipedFailCount = useRef(0);

    const useAudio = isMobile && !useFallbackYT;

    // ─── Init ───
    useEffect(() => {
        if (useAudio) {
            console.log("[DEBUG] INIT: Audio mode (Piped/Invidious)");
            const audio = new Audio();
            audio.volume = 0.8;
            audioRef.current = audio;

            audio.addEventListener("playing", () => { console.log("[DEBUG] EVENT: playing"); setPlaying(true); });
            audio.addEventListener("pause", () => { console.log("[DEBUG] EVENT: pause, ended?:", audio.ended); if (!audio.ended) setPlaying(false); });
            audio.addEventListener("ended", () => { console.log("[DEBUG] EVENT: ended → handleEnd"); handleEnd(); });
            audio.addEventListener("loadedmetadata", () => { console.log("[DEBUG] EVENT: metadata, dur:", audio.duration); setDuration(audio.duration || 0); });
            audio.addEventListener("error", () => { console.log("[DEBUG] EVENT: error, code:", audio.error?.code); setAudioLoading(false); });
            audio.addEventListener("waiting", () => { console.log("[DEBUG] EVENT: buffering..."); });
            audio.addEventListener("canplaythrough", () => { console.log("[DEBUG] EVENT: canplaythrough"); });

            const timer = setInterval(() => {
                if (audio && !audio.paused) setCurrentTime(audio.currentTime || 0);
            }, 500);
            intervalRef.current = timer;
            setReady(true);
            return () => { clearInterval(timer); audio.pause(); audio.src = ""; };
        } else {
            console.log("[DEBUG] INIT: YouTube iframe mode");
            if (window.YT && window.YT.Player) { initYT(); return; }
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
            window.onYouTubeIframeAPIReady = initYT;
            return () => { clearInterval(intervalRef.current); };
        }
    }, [useFallbackYT]);

    function initYT() {
        if (ytRef.current) return;
        ytRef.current = new window.YT.Player(containerRef.current, {
            height: "1", width: "1",
            playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1 },
            events: {
                onReady: () => { setReady(true); ytRef.current.setVolume(80); },
                onStateChange: (e) => {
                    setPlaying(e.data === window.YT.PlayerState.PLAYING);
                    if (e.data === window.YT.PlayerState.PLAYING) {
                        setDuration(ytRef.current.getDuration() || 0);
                        clearInterval(intervalRef.current);
                        intervalRef.current = setInterval(() => {
                            setCurrentTime(ytRef.current?.getCurrentTime?.() || 0);
                        }, 500);
                    } else { clearInterval(intervalRef.current); }
                    if (e.data === window.YT.PlayerState.ENDED) handleEnd();
                },
            },
        });
    }

    // ─── Core: load and play audio ───
    async function loadAudio(videoId) {
        const audio = audioRef.current;
        if (!audio) { console.log("[DEBUG] loadAudio: no audio element"); return false; }
        setAudioLoading(true);

        console.log("[DEBUG] Fetching URL for:", videoId);
        const url = await getAudioUrl(videoId);

        if (!url) {
            setAudioLoading(false);
            pipedFailCount.current++;
            console.log("[DEBUG] FAIL count:", pipedFailCount.current);
            if (pipedFailCount.current >= 3) {
                console.log("[DEBUG] → Fallback to YouTube iframe");
                setUseFallbackYT(true);
            }
            return false;
        }
        pipedFailCount.current = 0;

        // Stop any current playback cleanly
        audio.pause();
        audio.currentTime = 0;

        // Set new source
        console.log("[DEBUG] Setting src:", url.substring(0, 60) + "...");
        audio.src = url;
        audio.load(); // force reload

        // Wait for canplay then play
        return new Promise((resolve) => {
            const onCanPlay = () => {
                audio.removeEventListener("canplay", onCanPlay);
                audio.removeEventListener("error", onError);
                console.log("[DEBUG] canplay → calling play()");
                audio.play().then(() => {
                    console.log("[DEBUG] play() OK");
                    setAudioLoading(false);
                    resolve(true);
                }).catch((e) => {
                    console.log("[DEBUG] play() FAIL:", e.message);
                    setAudioLoading(false);
                    resolve(false);
                });
            };
            const onError = () => {
                audio.removeEventListener("canplay", onCanPlay);
                audio.removeEventListener("error", onError);
                console.log("[DEBUG] load error, code:", audio.error?.code);
                setAudioLoading(false);
                resolve(false);
            };
            audio.addEventListener("canplay", onCanPlay, { once: true });
            audio.addEventListener("error", onError, { once: true });

            // Timeout safety
            setTimeout(() => {
                audio.removeEventListener("canplay", onCanPlay);
                audio.removeEventListener("error", onError);
                // Nếu đã playing thì OK
                if (!audio.paused) { setAudioLoading(false); resolve(true); return; }
                console.log("[DEBUG] Load timeout 10s");
                setAudioLoading(false);
                resolve(false);
            }, 10000);
        });
    }

    // ─── Unified controls ───
    const play = useCallback(() => {
        if (useAudio) audioRef.current?.play?.().catch(() => { });
        else ytRef.current?.playVideo?.();
    }, [useAudio]);

    const pause = useCallback(() => {
        if (useAudio) audioRef.current?.pause?.();
        else ytRef.current?.pauseVideo?.();
    }, [useAudio]);

    const seekTo = useCallback((t) => {
        setCurrentTime(t);
        if (useAudio) { if (audioRef.current) audioRef.current.currentTime = t; }
        else ytRef.current?.seekTo?.(t, true);
    }, [useAudio]);

    const setVol = useCallback((v) => {
        setVolume(v);
        if (useAudio) { if (audioRef.current) audioRef.current.volume = v / 100; }
        else ytRef.current?.setVolume?.(v);
    }, [useAudio]);

    // ─── Playlists ───
    const [playlists, setPlaylists] = useState(() => {
        const saved = loadPlaylists();
        return saved.length > 0 ? saved : DEFAULT_PLAYLISTS;
    });
    useEffect(() => { savePlaylists(playlists); }, [playlists]);

    // ─── Playback state ───
    const [nowPlaying, setNowPlaying] = useState(null);
    const [shuffle, setShuffle] = useState(false);
    const [loop, setLoop] = useState(false);
    const [history, setHistory] = useState([]);

    const nowPl = nowPlaying ? playlists.find(p => p.id === nowPlaying.playlistId) : null;
    const nowSong = nowPl?.songs[nowPlaying?.songIdx] || null;

    useEffect(() => { stateRef.current = { nowPlaying, playlists, shuffle, loop, history }; });

    // ─── Media Session ───
    useEffect(() => {
        if (!nowSong) return;
        updateMediaSession(nowSong.title, nowPl?.name || "", {
            play: () => play(), pause: () => pause(),
            next: () => skipNext(), prev: () => skipPrev(),
        });
    }, [nowSong, nowPl]);

    // ─── Helpers ───
    function pickRandom(total, avoid) {
        if (total <= 1) return 0;
        let next, tries = 0;
        do { next = Math.floor(Math.random() * total); tries++; }
        while (next === avoid && tries < 30);
        return next;
    }

    function resolveNext(s) {
        const { nowPlaying: np, playlists: pls, shuffle: sh, loop: lp } = s;
        if (!np) return null;
        const pl = pls.find(p => p.id === np.playlistId);
        if (!pl || pl.songs.length === 0) return null;
        if (sh) return { plId: pl.id, idx: pickRandom(pl.songs.length, np.songIdx) };
        const next = np.songIdx + 1;
        if (next < pl.songs.length) return { plId: pl.id, idx: next };
        if (lp) return { plId: pl.id, idx: 0 };
        return null;
    }

    async function doPlay(plId, idx, resetHistory = true) {
        const pl = stateRef.current.playlists.find(p => p.id === plId);
        if (!pl || !pl.songs[idx]) return;
        console.log("[DEBUG] doPlay:", pl.songs[idx].title, "idx:", idx);
        setNowPlaying({ playlistId: plId, songIdx: idx });
        if (resetHistory) setHistory([idx]);
        else setHistory(prev => [...prev, idx]);
        setCurrentTime(0);

        if (useAudio) {
            await loadAudio(pl.songs[idx].videoId);
        } else {
            ytRef.current?.loadVideoById?.(pl.songs[idx].videoId);
        }
    }

    // ─── User actions ───
    const playSong = useCallback((plId, idx) => {
        console.log("[DEBUG] playSong called, plId:", plId, "idx:", idx);
        doPlay(plId, idx, true);
    }, [useAudio]);

    const skipNext = useCallback(() => {
        console.log("[DEBUG] skipNext");
        const result = resolveNext(stateRef.current);
        if (result) doPlay(result.plId, result.idx, false);
    }, [useAudio]);

    const skipPrev = useCallback(() => {
        console.log("[DEBUG] skipPrev");
        const s = stateRef.current;
        if (!s.nowPlaying) return;
        const pl = s.playlists.find(p => p.id === s.nowPlaying.playlistId);
        if (!pl) return;
        if (s.shuffle && s.history.length > 1) {
            const newHist = s.history.slice(0, -1);
            setHistory(newHist);
            doPlay(pl.id, newHist[newHist.length - 1], false);
            return;
        }
        doPlay(pl.id, Math.max(0, s.nowPlaying.songIdx - 1), false);
    }, [useAudio]);

    function handleEnd() {
        const result = resolveNext(stateRef.current);
        if (result) doPlay(result.plId, result.idx, false);
    }

    const value = {
        containerRef, ready, playing, currentTime, duration, volume,
        play, pause, seekTo, setVol,
        playlists, setPlaylists,
        nowPlaying, setNowPlaying, nowPl, nowSong,
        playSong, skipNext, skipPrev,
        shuffle, setShuffle, loop, setLoop,
        isMobile: useAudio, audioLoading,
    };

    return (
        <PlayerContext.Provider value={value}>
            {!useAudio && (
                <div style={{ position: "fixed", top: -9999, left: -9999, width: 1, height: 1, overflow: "hidden" }}>
                    <div ref={containerRef} />
                </div>
            )}
            <DebugPanel />
            {children}
        </PlayerContext.Provider>
    );
}

// ═══════════════════════════════════════════════════
// Debug Panel (xóa khi production)
// ═══════════════════════════════════════════════════
const _debugLogs = [];
const _debugListeners = new Set();
const _origLog = console.log;
console.log = (...args) => {
    _origLog(...args);
    const msg = args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ");
    if (msg.startsWith("[DEBUG]") || msg.startsWith("[Audio]")) {
        _debugLogs.push({ t: new Date().toLocaleTimeString(), msg });
        if (_debugLogs.length > 80) _debugLogs.shift();
        _debugListeners.forEach(fn => fn([..._debugLogs]));
    }
};

function DebugPanel() {
    const [logs, setLogs] = useState([..._debugLogs]);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => { _debugListeners.add(setLogs); return () => { _debugListeners.delete(setLogs); }; }, []);
    useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [logs, open]);

    return (
        <>
            <button onClick={() => setOpen(!open)} style={{
                position: "fixed", bottom: 8, right: 8, zIndex: 99999,
                width: 36, height: 36, borderRadius: "50%", border: "none",
                background: logs.some(l => l.msg.includes("FAIL") || l.msg.includes("error")) ? "#e53935" : "#5d8a72",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,.3)",
            }}>
                {open ? "×" : "🐛"}
            </button>
            {open && (
                <div ref={ref} style={{
                    position: "fixed", bottom: 52, right: 8, zIndex: 99999,
                    width: 380, maxWidth: "calc(100vw - 16px)", maxHeight: "50vh",
                    background: "#111", color: "#0f0", fontSize: 11, fontFamily: "monospace",
                    borderRadius: 8, padding: 8, overflowY: "auto",
                    boxShadow: "0 4px 24px rgba(0,0,0,.5)", whiteSpace: "pre-wrap", wordBreak: "break-all",
                }}>
                    {logs.length === 0 ? <div style={{ color: "#666" }}>Play a song to see logs.</div> :
                        logs.map((l, i) => (
                            <div key={i} style={{ borderBottom: "1px solid #222", padding: "2px 0" }}>
                                <span style={{ color: "#666" }}>{l.t} </span>
                                <span style={{ color: l.msg.includes("FAIL") || l.msg.includes("error") ? "#f44" : l.msg.includes("OK") || l.msg.includes("✓") || l.msg.includes("SUCCESS") ? "#4f4" : "#0f0" }}>
                                    {l.msg.replace("[DEBUG] ", "").replace("[Audio] ", "")}
                                </span>
                            </div>
                        ))
                    }
                </div>
            )}
        </>
    );
}
