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

// ─── Mobile detect ───
const isMobile = typeof navigator !== "undefined" && (
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
    || (window.innerWidth <= 768 && "ontouchstart" in window)
);

// ─── Piped API: extract audio stream URL from YouTube videoId ───
const PIPED_INSTANCES = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.adminforge.de",
    "https://watchapi.whatever.social",
    "https://pipedapi.leptons.xyz",
];

async function getAudioUrl(videoId) {
    for (const api of PIPED_INSTANCES) {
        try {
            console.log(`[Audio] Trying ${api}/streams/${videoId}`);
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(`${api}/streams/${videoId}`, {
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (!res.ok) { console.log(`[Audio] ${api} returned ${res.status}`); continue; }
            const data = await res.json();
            const streams = (data.audioStreams || []).filter(s => s.url);
            if (streams.length === 0) { console.log(`[Audio] ${api} no audio streams`); continue; }
            // Sort: prefer m4a/mp4 (better mobile compat) then highest bitrate
            const sorted = streams.sort((a, b) => {
                const aM4a = a.mimeType?.includes("mp4") ? 1 : 0;
                const bM4a = b.mimeType?.includes("mp4") ? 1 : 0;
                if (aM4a !== bM4a) return bM4a - aM4a;
                return (b.bitrate || 0) - (a.bitrate || 0);
            });
            console.log(`[Audio] Got stream from ${api}:`, sorted[0].mimeType, sorted[0].bitrate);
            return sorted[0].url;
        } catch (e) {
            console.log(`[Audio] ${api} failed:`, e.message);
        }
    }
    console.log("[Audio] All Piped instances failed");
    return null;
}

// ─── Media Session: lock screen controls ───
function updateMediaSession(title, artist, handlers) {
    if (!("mediaSession" in navigator)) return;
    try {
        navigator.mediaSession.metadata = new MediaMetadata({ title: title || "Unknown", artist: artist || "" });
        navigator.mediaSession.setActionHandler("play", handlers.play);
        navigator.mediaSession.setActionHandler("pause", handlers.pause);
        navigator.mediaSession.setActionHandler("nexttrack", handlers.next);
        navigator.mediaSession.setActionHandler("previoustrack", handlers.prev);
    } catch { /* some browsers don't support all handlers */ }
}

export function PlayerProvider({ children }) {
    // ─── Shared state ───
    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const intervalRef = useRef(null);
    const stateRef = useRef({});

    // ─── YouTube (desktop) ───
    const ytRef = useRef(null);
    const containerRef = useRef(null);

    // ─── Audio (mobile) ───
    const audioRef = useRef(null);
    const audioUnlocked = useRef(false);
    const [audioLoading, setAudioLoading] = useState(false);
    // Fallback: nếu Piped fail 3 lần liên tiếp → dùng YouTube iframe trên mobile
    const pipedFailCount = useRef(0);
    const [useFallbackYT, setUseFallbackYT] = useState(false);

    // ─── Init ───
    useEffect(() => {
        if (isMobile && !useFallbackYT) {
            const audio = new Audio();
            audio.volume = 0.8;
            audio.preload = "auto";
            audioRef.current = audio;

            audio.addEventListener("playing", () => setPlaying(true));
            audio.addEventListener("pause", () => setPlaying(false));
            audio.addEventListener("ended", () => handleEnd());
            audio.addEventListener("loadedmetadata", () => setDuration(audio.duration || 0));
            audio.addEventListener("error", (e) => {
                console.log("[Audio] Playback error:", e);
                setAudioLoading(false);
            });

            const timer = setInterval(() => {
                if (audio && !audio.paused) setCurrentTime(audio.currentTime || 0);
            }, 500);
            intervalRef.current = timer;
            setReady(true);

            return () => { clearInterval(timer); audio.pause(); audio.src = ""; };
        } else {
            // Desktop or fallback
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
                    } else {
                        clearInterval(intervalRef.current);
                    }
                    if (e.data === window.YT.PlayerState.ENDED) handleEnd();
                },
            },
        });
    }

    const useAudio = isMobile && !useFallbackYT;

    // ─── Unlock audio on first user gesture (mobile) ───
    function unlockAudio() {
        if (!useAudio || audioUnlocked.current || !audioRef.current) return;
        // Phát 1 giây im lặng để "mở khóa" audio context
        const a = audioRef.current;
        const silentSrc = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
        a.src = silentSrc;
        a.play().then(() => {
            a.pause();
            a.currentTime = 0;
            audioUnlocked.current = true;
            console.log("[Audio] Unlocked");
        }).catch(() => { });
    }

    // ─── Load & Play ───
    async function loadVideoMobile(videoId) {
        const audio = audioRef.current;
        if (!audio) return false;

        unlockAudio();
        setAudioLoading(true);

        const url = await getAudioUrl(videoId);
        if (!url) {
            setAudioLoading(false);
            pipedFailCount.current++;
            console.log(`[Audio] Piped fail count: ${pipedFailCount.current}`);
            if (pipedFailCount.current >= 3) {
                console.log("[Audio] Switching to YouTube iframe fallback");
                setUseFallbackYT(true);
            }
            return false;
        }

        pipedFailCount.current = 0;
        audio.src = url;
        try {
            await audio.play();
        } catch (e) {
            console.log("[Audio] Play failed:", e.message);
            // Retry once
            try { await audio.play(); } catch { }
        }
        setAudioLoading(false);
        return true;
    }

    const loadVideo = useCallback(async (videoId) => {
        setCurrentTime(0);
        if (useAudio) {
            return loadVideoMobile(videoId);
        } else {
            ytRef.current?.loadVideoById?.(videoId);
            return true;
        }
    }, [useAudio]);

    const play = useCallback(() => {
        if (useAudio) {
            audioRef.current?.play?.().catch(() => { });
        } else {
            ytRef.current?.playVideo?.();
        }
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

    // ─── Playback State ───
    const [nowPlaying, setNowPlaying] = useState(null);
    const [shuffle, setShuffle] = useState(false);
    const [loop, setLoop] = useState(false);
    const [history, setHistory] = useState([]);

    const nowPl = nowPlaying ? playlists.find(p => p.id === nowPlaying.playlistId) : null;
    const nowSong = nowPl?.songs[nowPlaying?.songIdx] || null;

    useEffect(() => {
        stateRef.current = { nowPlaying, playlists, shuffle, loop, history };
    });

    // ─── Media Session ───
    useEffect(() => {
        if (!nowSong) return;
        updateMediaSession(nowSong.title, nowPl?.name || "", {
            play: () => play(),
            pause: () => pause(),
            next: () => skipNext(),
            prev: () => skipPrev(),
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

    async function doLoadAndPlay(plId, idx) {
        const pl = stateRef.current.playlists.find(p => p.id === plId);
        if (!pl || !pl.songs[idx]) return;
        setNowPlaying({ playlistId: plId, songIdx: idx });
        setHistory(prev => [...prev, idx]);
        setCurrentTime(0);

        if (useAudio) {
            await loadVideoMobile(pl.songs[idx].videoId);
        } else {
            ytRef.current?.loadVideoById?.(pl.songs[idx].videoId);
        }
    }

    // ─── User actions ───
    const playSong = useCallback((plId, idx) => {
        const pl = playlists.find(p => p.id === plId);
        if (!pl || !pl.songs[idx]) return;
        unlockAudio();
        setHistory([idx]);
        setNowPlaying({ playlistId: plId, songIdx: idx });
        setCurrentTime(0);

        if (useAudio) {
            loadVideoMobile(pl.songs[idx].videoId);
        } else {
            ytRef.current?.loadVideoById?.(pl.songs[idx].videoId);
        }
    }, [playlists, useAudio]);

    const skipNext = useCallback(() => {
        const result = resolveNext(stateRef.current);
        if (result) doLoadAndPlay(result.plId, result.idx);
    }, [useAudio]);

    const skipPrev = useCallback(() => {
        const s = stateRef.current;
        if (!s.nowPlaying) return;
        const pl = s.playlists.find(p => p.id === s.nowPlaying.playlistId);
        if (!pl) return;
        if (s.shuffle && s.history.length > 1) {
            const newHist = s.history.slice(0, -1);
            const prevIdx = newHist[newHist.length - 1];
            setHistory(newHist);
            doLoadAndPlay(pl.id, prevIdx);
            return;
        }
        doLoadAndPlay(pl.id, Math.max(0, s.nowPlaying.songIdx - 1));
    }, [useAudio]);

    function handleEnd() {
        const result = resolveNext(stateRef.current);
        if (result) doLoadAndPlay(result.plId, result.idx);
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
            {(!isMobile || useFallbackYT) && (
                <div style={{ position: "fixed", top: -9999, left: -9999, width: 1, height: 1, overflow: "hidden" }}>
                    <div ref={containerRef} />
                </div>
            )}
            {children}
        </PlayerContext.Provider>
    );
}
