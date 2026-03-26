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

export function PlayerProvider({ children }) {
    // ─── YouTube Player ───
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const intervalRef = useRef(null);

    // Ref giữ state mới nhất cho callback YouTube (tránh stale closure)
    const stateRef = useRef({});

    useEffect(() => {
        if (window.YT && window.YT.Player) { initPlayer(); return; }
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady = initPlayer;
        return () => { clearInterval(intervalRef.current); };
    }, []);

    function initPlayer() {
        if (playerRef.current) return;
        playerRef.current = new window.YT.Player(containerRef.current, {
            height: "1", width: "1",
            playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1 },
            events: {
                onReady: () => { setReady(true); playerRef.current.setVolume(80); },
                onStateChange: (e) => {
                    setPlaying(e.data === window.YT.PlayerState.PLAYING);
                    if (e.data === window.YT.PlayerState.PLAYING) {
                        setDuration(playerRef.current.getDuration() || 0);
                        clearInterval(intervalRef.current);
                        intervalRef.current = setInterval(() => {
                            setCurrentTime(playerRef.current?.getCurrentTime?.() || 0);
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

    const loadVideo = useCallback((videoId) => {
        if (!playerRef.current?.loadVideoById) return;
        playerRef.current.loadVideoById(videoId);
        setCurrentTime(0);
    }, []);
    const play = useCallback(() => playerRef.current?.playVideo?.(), []);
    const pause = useCallback(() => playerRef.current?.pauseVideo?.(), []);
    const seekTo = useCallback((t) => { playerRef.current?.seekTo?.(t, true); setCurrentTime(t); }, []);
    const setVol = useCallback((v) => { playerRef.current?.setVolume?.(v); setVolume(v); }, []);

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

    // Sync vào ref mỗi render
    useEffect(() => {
        stateRef.current = { nowPlaying, playlists, shuffle, loop, history };
    });

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

    function loadAndPlay(plId, idx) {
        const pl = stateRef.current.playlists.find(p => p.id === plId);
        if (!pl || !pl.songs[idx]) return;
        playerRef.current?.loadVideoById?.(pl.songs[idx].videoId);
        setCurrentTime(0);
        setNowPlaying({ playlistId: plId, songIdx: idx });
        setHistory(prev => [...prev, idx]);
    }

    // ─── User bấm play 1 bài ───
    const playSong = useCallback((plId, idx) => {
        const pl = playlists.find(p => p.id === plId);
        if (!pl || !pl.songs[idx]) return;
        loadVideo(pl.songs[idx].videoId);
        setNowPlaying({ playlistId: plId, songIdx: idx });
        setHistory([idx]);
    }, [playlists, loadVideo]);

    // ─── Skip Next ───
    const skipNext = useCallback(() => {
        const result = resolveNext(stateRef.current);
        if (result) loadAndPlay(result.plId, result.idx);
    }, []);

    // ─── Skip Prev ───
    const skipPrev = useCallback(() => {
        const s = stateRef.current;
        if (!s.nowPlaying) return;
        const pl = s.playlists.find(p => p.id === s.nowPlaying.playlistId);
        if (!pl) return;
        if (s.shuffle && s.history.length > 1) {
            const newHist = s.history.slice(0, -1);
            const prevIdx = newHist[newHist.length - 1];
            setHistory(newHist);
            const song = pl.songs[prevIdx];
            if (!song) return;
            playerRef.current?.loadVideoById?.(song.videoId);
            setCurrentTime(0);
            setNowPlaying({ playlistId: pl.id, songIdx: prevIdx });
            return;
        }
        const prevIdx = Math.max(0, s.nowPlaying.songIdx - 1);
        const song = pl.songs[prevIdx];
        if (!song) return;
        playerRef.current?.loadVideoById?.(song.videoId);
        setCurrentTime(0);
        setNowPlaying({ playlistId: pl.id, songIdx: prevIdx });
        setHistory(prev => [...prev, prevIdx]);
    }, []);

    // ─── onEnd: bài hết → tự next ───
    function handleEnd() {
        const result = resolveNext(stateRef.current);
        if (result) {
            loadAndPlay(result.plId, result.idx);
        }
        // null → dừng nhưng giữ nowPlaying (mini player vẫn hiện)
    }

    const value = {
        containerRef, ready, playing, currentTime, duration, volume,
        play, pause, seekTo, setVol,
        playlists, setPlaylists,
        nowPlaying, setNowPlaying, nowPl, nowSong,
        playSong, skipNext, skipPrev,
        shuffle, setShuffle, loop, setLoop,
    };

    return (
        <PlayerContext.Provider value={value}>
            <div style={{ position: "fixed", top: -9999, left: -9999, width: 1, height: 1, overflow: "hidden" }}>
                <div ref={containerRef} />
            </div>
            {children}
        </PlayerContext.Provider>
    );
}
