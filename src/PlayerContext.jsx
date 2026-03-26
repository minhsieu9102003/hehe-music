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

// ─── Mobile detect: userAgent + screen width fallback ───
const isMobile = typeof navigator !== "undefined" && (
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
    || (window.innerWidth <= 768 && "ontouchstart" in window)
);

// ─── Piped API: lấy audio stream URL từ YouTube videoId ───
const PIPED_INSTANCES = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.adminforge.de",
    "https://pipedapi.in.projectsegfau.lt",
];

async function getAudioUrl(videoId) {
    for (const api of PIPED_INSTANCES) {
        try {
            const res = await fetch(`${api}/streams/${videoId}`);
            if (!res.ok) continue;
            const data = await res.json();
            // Tìm audio stream chất lượng tốt nhất
            const streams = data.audioStreams || [];
            if (streams.length === 0) continue;
            // Ưu tiên opus > m4a, bitrate cao nhất
            const sorted = streams
                .filter(s => s.url)
                .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
            if (sorted.length > 0) return sorted[0].url;
        } catch { /* try next instance */ }
    }
    return null;
}

// ─── Media Session: lock screen controls ───
function updateMediaSession(title, artist, onPlay, onPause, onNext, onPrev) {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
        title: title || "Unknown",
        artist: artist || "",
    });
    navigator.mediaSession.setActionHandler("play", onPlay);
    navigator.mediaSession.setActionHandler("pause", onPause);
    navigator.mediaSession.setActionHandler("nexttrack", onNext);
    navigator.mediaSession.setActionHandler("previoustrack", onPrev);
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

    // ─── YouTube Player (desktop only) ───
    const ytRef = useRef(null);
    const containerRef = useRef(null);

    // ─── Audio Element (mobile only) ───
    const audioRef = useRef(null);

    useEffect(() => {
        if (isMobile) {
            // Mobile: tạo audio element
            const audio = new Audio();
            audio.volume = 0.8;
            audioRef.current = audio;

            audio.addEventListener("playing", () => setPlaying(true));
            audio.addEventListener("pause", () => setPlaying(false));
            audio.addEventListener("ended", () => handleEnd());
            audio.addEventListener("loadedmetadata", () => {
                setDuration(audio.duration || 0);
            });

            // Update currentTime
            const timer = setInterval(() => {
                if (audio && !audio.paused) {
                    setCurrentTime(audio.currentTime || 0);
                }
            }, 500);
            intervalRef.current = timer;

            setReady(true);
            return () => { clearInterval(timer); audio.pause(); audio.src = ""; };
        } else {
            // Desktop: YouTube iframe
            if (window.YT && window.YT.Player) { initYT(); return; }
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
            window.onYouTubeIframeAPIReady = initYT;
            return () => { clearInterval(intervalRef.current); };
        }
    }, []);

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
                    if (e.data === window.YT.PlayerState.ENDED) {
                        handleEnd();
                    }
                },
            },
        });
    }

    // ─── Unified controls ───
    const [audioLoading, setAudioLoading] = useState(false);

    const loadVideo = useCallback(async (videoId) => {
        setCurrentTime(0);
        if (isMobile) {
            // Mobile: lấy audio URL từ Piped → phát qua <audio>
            setAudioLoading(true);
            try {
                const url = await getAudioUrl(videoId);
                if (url && audioRef.current) {
                    audioRef.current.src = url;
                    audioRef.current.play().catch(() => { });
                }
            } catch { /* silent */ }
            setAudioLoading(false);
        } else {
            // Desktop: YouTube iframe
            ytRef.current?.loadVideoById?.(videoId);
        }
    }, []);

    const play = useCallback(() => {
        if (isMobile) {
            audioRef.current?.play?.().catch(() => { });
        } else {
            ytRef.current?.playVideo?.();
        }
    }, []);

    const pause = useCallback(() => {
        if (isMobile) {
            audioRef.current?.pause?.();
        } else {
            ytRef.current?.pauseVideo?.();
        }
    }, []);

    const seekTo = useCallback((t) => {
        setCurrentTime(t);
        if (isMobile) {
            if (audioRef.current) audioRef.current.currentTime = t;
        } else {
            ytRef.current?.seekTo?.(t, true);
        }
    }, []);

    const setVol = useCallback((v) => {
        setVolume(v);
        if (isMobile) {
            if (audioRef.current) audioRef.current.volume = v / 100;
        } else {
            ytRef.current?.setVolume?.(v);
        }
    }, []);

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

    // Sync state vào ref
    useEffect(() => {
        stateRef.current = { nowPlaying, playlists, shuffle, loop, history };
    });

    // ─── Media Session (mobile lock screen) ───
    useEffect(() => {
        if (!isMobile || !nowSong) return;
        updateMediaSession(
            nowSong.title,
            nowPl?.name || "",
            () => play(),
            () => pause(),
            () => skipNext(),
            () => skipPrev()
        );
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

    async function loadAndPlay(plId, idx) {
        const pl = stateRef.current.playlists.find(p => p.id === plId);
        if (!pl || !pl.songs[idx]) return;
        setNowPlaying({ playlistId: plId, songIdx: idx });
        setHistory(prev => [...prev, idx]);
        setCurrentTime(0);

        if (isMobile) {
            setAudioLoading(true);
            try {
                const url = await getAudioUrl(pl.songs[idx].videoId);
                if (url && audioRef.current) {
                    audioRef.current.src = url;
                    audioRef.current.play().catch(() => { });
                }
            } catch { /* silent */ }
            setAudioLoading(false);
        } else {
            ytRef.current?.loadVideoById?.(pl.songs[idx].videoId);
        }
    }

    // ─── Play bài (user action) ───
    const playSong = useCallback((plId, idx) => {
        const pl = playlists.find(p => p.id === plId);
        if (!pl || !pl.songs[idx]) return;
        setHistory([idx]);
        setNowPlaying({ playlistId: plId, songIdx: idx });
        setCurrentTime(0);

        if (isMobile) {
            (async () => {
                setAudioLoading(true);
                try {
                    const url = await getAudioUrl(pl.songs[idx].videoId);
                    if (url && audioRef.current) {
                        audioRef.current.src = url;
                        audioRef.current.play().catch(() => { });
                    }
                } catch { /* silent */ }
                setAudioLoading(false);
            })();
        } else {
            ytRef.current?.loadVideoById?.(pl.songs[idx].videoId);
        }
    }, [playlists]);

    // ─── Skip ───
    const skipNext = useCallback(() => {
        const result = resolveNext(stateRef.current);
        if (result) loadAndPlay(result.plId, result.idx);
    }, []);

    const skipPrev = useCallback(() => {
        const s = stateRef.current;
        if (!s.nowPlaying) return;
        const pl = s.playlists.find(p => p.id === s.nowPlaying.playlistId);
        if (!pl) return;
        if (s.shuffle && s.history.length > 1) {
            const newHist = s.history.slice(0, -1);
            const prevIdx = newHist[newHist.length - 1];
            setHistory(newHist);
            loadAndPlay(pl.id, prevIdx);
            return;
        }
        const prevIdx = Math.max(0, s.nowPlaying.songIdx - 1);
        loadAndPlay(pl.id, prevIdx);
    }, []);

    // ─── onEnd ───
    function handleEnd() {
        const result = resolveNext(stateRef.current);
        if (result) loadAndPlay(result.plId, result.idx);
    }

    // ─── Expose ───
    const value = {
        containerRef, ready, playing, currentTime, duration, volume,
        play, pause, seekTo, setVol,
        playlists, setPlaylists,
        nowPlaying, setNowPlaying, nowPl, nowSong,
        playSong, skipNext, skipPrev,
        shuffle, setShuffle, loop, setLoop,
        isMobile, audioLoading,
    };

    return (
        <PlayerContext.Provider value={value}>
            {/* YouTube container — desktop only, hidden */}
            {!isMobile && (
                <div style={{ position: "fixed", top: -9999, left: -9999, width: 1, height: 1, overflow: "hidden" }}>
                    <div ref={containerRef} />
                </div>
            )}
            {children}
        </PlayerContext.Provider>
    );
}
