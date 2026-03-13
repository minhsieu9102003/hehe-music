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

function fisherYatesShuffle(length) {
    const order = Array.from({ length }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
}

let _nextId = Date.now();
export function uid() { return _nextId++; }

const PlayerContext = createContext(null);
export function usePlayer() { return useContext(PlayerContext); }

export function PlayerProvider({ children }) {
    // YouTube player
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const intervalRef = useRef(null);
    const onEndCbRef = useRef(null);

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
                        onEndCbRef.current?.();
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

    // Playlists
    const [playlists, setPlaylists] = useState(() => {
        const saved = loadPlaylists();
        return saved.length > 0 ? saved : DEFAULT_PLAYLISTS;
    });
    useEffect(() => { savePlaylists(playlists); }, [playlists]);

    // Playback state
    const [nowPlaying, setNowPlaying] = useState(null);
    const [shuffle, setShuffle] = useState(false);
    const [loop, setLoop] = useState(false);
    const [shuffleOrder, setShuffleOrder] = useState([]);
    const [shufflePos, setShufflePos] = useState(0);

    const nowPl = nowPlaying ? playlists.find(p => p.id === nowPlaying.playlistId) : null;
    const nowSong = nowPl?.songs[nowPlaying?.songIdx] || null;

    const playSongDirect = useCallback((plId, idx) => {
        const pl = playlists.find(p => p.id === plId);
        if (!pl || !pl.songs[idx]) return;
        loadVideo(pl.songs[idx].videoId);
        setNowPlaying({ playlistId: plId, songIdx: idx });
    }, [playlists, loadVideo]);

    const playSong = useCallback((plId, idx) => {
        const pl = playlists.find(p => p.id === plId);
        if (!pl || !pl.songs[idx]) return;
        if (shuffle) {
            const newOrder = fisherYatesShuffle(pl.songs.length);
            const pos = newOrder.indexOf(idx);
            [newOrder[0], newOrder[pos]] = [newOrder[pos], newOrder[0]];
            setShuffleOrder(newOrder);
            setShufflePos(0);
        }
        playSongDirect(plId, idx);
    }, [playlists, shuffle, playSongDirect]);

    const skipNext = useCallback(() => {
        if (!nowPlaying || !nowPl) return;
        if (shuffle) {
            const nextPos = shufflePos + 1;
            if (nextPos < shuffleOrder.length) {
                setShufflePos(nextPos);
                playSongDirect(nowPl.id, shuffleOrder[nextPos]);
            } else if (loop) {
                const newOrder = fisherYatesShuffle(nowPl.songs.length);
                setShuffleOrder(newOrder);
                setShufflePos(0);
                playSongDirect(nowPl.id, newOrder[0]);
            }
        } else {
            const next = nowPlaying.songIdx + 1;
            if (next < nowPl.songs.length) {
                playSongDirect(nowPl.id, next);
            } else if (loop) {
                playSongDirect(nowPl.id, 0);
            }
        }
    }, [nowPlaying, nowPl, shuffle, loop, shuffleOrder, shufflePos, playSongDirect]);

    const skipPrev = useCallback(() => {
        if (!nowPlaying || !nowPl) return;
        if (shuffle) {
            const prevPos = shufflePos - 1;
            if (prevPos >= 0) {
                setShufflePos(prevPos);
                playSongDirect(nowPl.id, shuffleOrder[prevPos]);
            }
        } else {
            playSongDirect(nowPl.id, Math.max(0, nowPlaying.songIdx - 1));
        }
    }, [nowPlaying, nowPl, shuffle, shuffleOrder, shufflePos, playSongDirect]);

    // onEnd handler — keep nowPlaying so mini player stays visible
    onEndCbRef.current = () => {
        if (!nowPlaying) return;
        const pl = playlists.find(p => p.id === nowPlaying.playlistId);
        if (!pl || pl.songs.length === 0) return;
        if (shuffle) {
            const nextPos = shufflePos + 1;
            if (nextPos < shuffleOrder.length) {
                setShufflePos(nextPos);
                playSongDirect(pl.id, shuffleOrder[nextPos]);
            } else if (loop) {
                const newOrder = fisherYatesShuffle(pl.songs.length);
                setShuffleOrder(newOrder);
                setShufflePos(0);
                playSongDirect(pl.id, newOrder[0]);
            }
            // no setNowPlaying(null) — keep mini player visible
        } else {
            const next = nowPlaying.songIdx + 1;
            if (next < pl.songs.length) {
                playSongDirect(pl.id, next);
            } else if (loop) {
                playSongDirect(pl.id, 0);
            }
            // no setNowPlaying(null) — keep mini player visible
        }
    };

    const value = {
        // YT player
        containerRef, ready, playing, currentTime, duration, volume,
        play, pause, seekTo, setVol,
        // Playlists
        playlists, setPlaylists,
        // Playback
        nowPlaying, setNowPlaying, nowPl, nowSong,
        playSong, playSongDirect, skipNext, skipPrev,
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
