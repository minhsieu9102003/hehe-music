import React, { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./Sidebar";
import { SearchIcon } from "./icons";

// ═══════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
        const m = url.trim().match(p);
        if (m) return m[1];
    }
    return null;
}

function parseYouTubeLinks(text) {
    return text.split(/[\s\n]+/).map(s => s.trim()).filter(Boolean)
        .map(url => ({ url, videoId: extractVideoId(url) }))
        .filter(x => x.videoId);
}

function formatTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

const STORAGE_KEY = "cydas-playlists";
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

const COLORS = ["#808CBA", "#E8927C", "#7EC8A0", "#C490D1", "#6BB8D6", "#D4A85C", "#E07B9B", "#8CABD4"];
let _nextId = Date.now();
function uid() { return _nextId++; }

// ═══════════════════════════════════════════════════
// Icons
// ═══════════════════════════════════════════════════
function MusicNoteIcon({ size = 32, color = "#808CBA" }) {
    return (<svg width={size} height={size} viewBox="0 0 32 32" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M22.5 5C22.5 4.72386 22.2761 4.5 22 4.5C21.7239 4.5 21.5 4.72386 21.5 5V22C21.5 24.4853 19.4853 26.5 17 26.5C14.5147 26.5 12.5 24.4853 12.5 22C12.5 19.5147 14.5147 17.5 17 17.5C18.3062 17.5 19.4817 18.0602 20.3 18.9529V5H22.5ZM20 22C20 20.3431 18.6569 19 17 19C15.3431 19 14 20.3431 14 22C14 23.6569 15.3431 25 17 25C18.6569 25 20 23.6569 20 22Z" fill={color} /><path d="M21.5 5V11.5L27 9.5V7L21.5 5Z" fill={color} opacity="0.6" /></svg>);
}
const Icon = {
    Plus: ({ s = 20, c = "#fff" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    Edit: ({ s = 16, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    Trash: ({ s = 16, c = "#e53935" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    X: ({ s = 18, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    Play: ({ s = 18, c = "#fff" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><polygon points="5 3 19 12 5 21" /></svg>,
    Pause: ({ s = 18, c = "#fff" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
    SkipF: ({ s = 18, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><polygon points="5 4 15 12 5 20" /><line x1="19" y1="5" x2="19" y2="19" stroke={c} strokeWidth="2" /></svg>,
    SkipB: ({ s = 18, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><polygon points="19 20 9 12 19 4" /><line x1="5" y1="5" x2="5" y2="19" stroke={c} strokeWidth="2" /></svg>,
    Songs: ({ s = 16, c = "#999" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    Link: ({ s = 16, c = "#999" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
    Vol: ({ s = 18, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>,
    Shuffle: ({ s = 18, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>,
    Loop: ({ s = 18, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>,
};

// ═══════════════════════════════════════════════════
// YouTube Player Hook
// ═══════════════════════════════════════════════════
function useYouTubePlayer() {
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

    const load = useCallback((videoId) => {
        if (!playerRef.current?.loadVideoById) return;
        playerRef.current.loadVideoById(videoId);
        setCurrentTime(0);
    }, []);

    const play = useCallback(() => playerRef.current?.playVideo?.(), []);
    const pause = useCallback(() => playerRef.current?.pauseVideo?.(), []);
    const seekTo = useCallback((t) => { playerRef.current?.seekTo?.(t, true); setCurrentTime(t); }, []);
    const setVol = useCallback((v) => { playerRef.current?.setVolume?.(v); setVolume(v); }, []);
    const onEnd = useCallback((cb) => { onEndCbRef.current = cb; }, []);

    return { containerRef, ready, playing, currentTime, duration, volume, load, play, pause, seekTo, setVol, onEnd };
}

// ═══════════════════════════════════════════════════
// Modal
// ═══════════════════════════════════════════════════
function Modal({ open, onClose, title, children, wide }) {
    if (!open) return null;
    return (
        <div className="pl-modal-overlay" onClick={onClose}>
            <div className={`pl-modal ${wide ? "pl-modal--wide" : ""}`} onClick={e => e.stopPropagation()}>
                <div className="pl-modal__head"><span>{title}</span><button className="pl-modal__close" onClick={onClose}><Icon.X /></button></div>
                <div className="pl-modal__body">{children}</div>
            </div>
        </div>
    );
}
function Confirm({ open, onClose, onOk, msg }) {
    if (!open) return null;
    return (
        <div className="pl-modal-overlay" onClick={onClose}>
            <div className="pl-modal pl-modal--sm" onClick={e => e.stopPropagation()}>
                <div className="pl-modal__body" style={{ padding: "24px 20px", textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: "#333", marginBottom: 20 }}>{msg}</p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                        <button className="pl-btn pl-btn--ghost" onClick={onClose}>キャンセル</button>
                        <button className="pl-btn pl-btn--danger" onClick={onOk}>削除</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// Fetch video title from noembed (free, no API key)
// ═══════════════════════════════════════════════════
async function fetchTitle(videoId) {
    try {
        const r = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        const d = await r.json();
        return d.title || `Video ${videoId}`;
    } catch { return `Video ${videoId}`; }
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
const DEFAULT_PLAYLISTS = [
    { id: 1, name: "朝のモチベーション", description: "仕事を始める前に聴くプレイリスト", colorIdx: 0, songs: [] },
    { id: 2, name: "集中タイム", description: "ディープワーク用のBGM", colorIdx: 1, songs: [] },
    { id: 3, name: "リラックス", description: "休憩時間や退勤後に", colorIdx: 2, songs: [] },
];

export default function PlaylistPage() {
    const [playlists, setPlaylists] = useState(() => {
        const saved = loadPlaylists();
        return saved.length > 0 ? saved : DEFAULT_PLAYLISTS;
    });
    const [search, setSearch] = useState("");
    // Modals
    const [plModal, setPlModal] = useState(false);
    const [editPl, setEditPl] = useState(null);
    const [form, setForm] = useState({ name: "", description: "" });
    const [delTarget, setDelTarget] = useState(null);
    // Song adding
    const [addSongsTo, setAddSongsTo] = useState(null); // playlist id
    const [linksText, setLinksText] = useState("");
    const [importing, setImporting] = useState(false);
    // Detail view
    const [viewPl, setViewPl] = useState(null); // playlist id
    // Player
    const yt = useYouTubePlayer();
    const [nowPlaying, setNowPlaying] = useState(null); // { playlistId, songIdx }
    const [delSong, setDelSong] = useState(null); // { plId, songId }
    const [shuffle, setShuffle] = useState(false);
    const [loop, setLoop] = useState(false);
    const [shuffleOrder, setShuffleOrder] = useState([]); // shuffled indices
    const [shufflePos, setShufflePos] = useState(0); // current position in shuffleOrder

    // Save to localStorage
    useEffect(() => { savePlaylists(playlists); }, [playlists]);

    // Handle song end → play next
    yt.onEnd(() => {
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
            } else {
                setNowPlaying(null);
            }
        } else {
            const next = nowPlaying.songIdx + 1;
            if (next < pl.songs.length) {
                playSongDirect(pl.id, next);
            } else if (loop) {
                playSongDirect(pl.id, 0);
            } else {
                setNowPlaying(null);
            }
        }
    });

    // ── Playlist CRUD ──
    const filtered = playlists.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase())
    );
    const openCreate = () => { setEditPl(null); setForm({ name: "", description: "" }); setPlModal(true); };
    const openEdit = (pl) => { setEditPl(pl); setForm({ name: pl.name, description: pl.description || "" }); setPlModal(true); };
    const handleSavePl = () => {
        const name = form.name.trim();
        if (!name) return;
        if (editPl) {
            setPlaylists(prev => prev.map(p => p.id === editPl.id ? { ...p, name, description: form.description.trim() } : p));
        } else {
            setPlaylists(prev => [...prev, { id: uid(), name, description: form.description.trim(), colorIdx: Math.floor(Math.random() * COLORS.length), songs: [] }]);
        }
        setPlModal(false);
    };
    const confirmDeletePl = () => {
        if (delTarget) {
            setPlaylists(prev => prev.filter(p => p.id !== delTarget.id));
            if (viewPl === delTarget.id) setViewPl(null);
            if (nowPlaying?.playlistId === delTarget.id) setNowPlaying(null);
            setDelTarget(null);
        }
    };

    // ── Songs ──
    const handleAddSongs = async () => {
        const parsed = parseYouTubeLinks(linksText);
        if (parsed.length === 0) return;
        setImporting(true);
        const newSongs = [];
        for (const { videoId } of parsed) {
            const title = await fetchTitle(videoId);
            newSongs.push({ id: uid(), videoId, title, addedAt: Date.now() });
        }
        setPlaylists(prev => prev.map(p => p.id === addSongsTo ? { ...p, songs: [...p.songs, ...newSongs] } : p));
        setImporting(false);
        setLinksText("");
        setAddSongsTo(null);
    };
    const removeSong = () => {
        if (!delSong) return;
        setPlaylists(prev => prev.map(p => p.id === delSong.plId ? { ...p, songs: p.songs.filter(s => s.id !== delSong.songId) } : p));
        if (nowPlaying) {
            const pl = playlists.find(p => p.id === delSong.plId);
            const song = pl?.songs[nowPlaying.songIdx];
            if (song?.id === delSong.songId) setNowPlaying(null);
        }
        setDelSong(null);
    };

    // ── Playback ──
    const playSongDirect = (plId, idx) => {
        const pl = playlists.find(p => p.id === plId);
        if (!pl || !pl.songs[idx]) return;
        yt.load(pl.songs[idx].videoId);
        setNowPlaying({ playlistId: plId, songIdx: idx });
    };
    const playSong = (plId, idx) => {
        const pl = playlists.find(p => p.id === plId);
        if (!pl || !pl.songs[idx]) return;
        if (shuffle) {
            const newOrder = fisherYatesShuffle(pl.songs.length);
            // put the clicked song first
            const pos = newOrder.indexOf(idx);
            [newOrder[0], newOrder[pos]] = [newOrder[pos], newOrder[0]];
            setShuffleOrder(newOrder);
            setShufflePos(0);
        }
        playSongDirect(plId, idx);
    };
    const skipNext = () => {
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
    };
    const skipPrev = () => {
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
    };
    const nowSong = nowPlaying ? playlists.find(p => p.id === nowPlaying.playlistId)?.songs[nowPlaying.songIdx] : null;
    const nowPl = nowPlaying ? playlists.find(p => p.id === nowPlaying.playlistId) : null;

    // ── View ──
    const activePl = viewPl ? playlists.find(p => p.id === viewPl) : null;

    return (
        <>
            <style>{CSS}</style>
            {/* Hidden YT player */}
            <div style={{ position: "fixed", top: -9999, left: -9999, width: 1, height: 1, overflow: "hidden" }}>
                <div ref={yt.containerRef} />
            </div>

            <div className="hp-lay">
                <Sidebar activeId="" />
                <div className="hp-main" style={{ paddingBottom: nowSong ? 80 : 0 }}>

                    {/* ═══ LIST VIEW ═══ */}
                    {!activePl && (
                        <div className="pl-page">
                            <div className="pl-header">
                                <div className="pl-header__left">
                                    <MusicNoteIcon size={28} color="#808CBA" />
                                    <h1 className="pl-header__title">ポジション音楽</h1>
                                </div>
                                <button className="pl-btn pl-btn--primary" onClick={openCreate}>
                                    <Icon.Plus s={18} /> <span>新規作成</span>
                                </button>
                            </div>
                            <p className="pl-intro">プレイリストを作成・管理できます。YouTubeリンクから曲を追加して、チームで音楽を楽しみましょう。</p>
                            <div className="pl-search">
                                <SearchIcon size={18} color="#999" />
                                <input type="text" placeholder="プレイリストを検索..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <div className="pl-grid">
                                {filtered.map(pl => (
                                    <div key={pl.id} className="pl-card" onClick={() => setViewPl(pl.id)}>
                                        <div className="pl-card__banner" style={{ background: `linear-gradient(135deg, ${COLORS[pl.colorIdx % COLORS.length]}, ${COLORS[pl.colorIdx % COLORS.length]}aa)` }}>
                                            <MusicNoteIcon size={40} color="rgba(255,255,255,0.3)" />
                                            {pl.songs.length > 0 && (
                                                <button className="pl-card__play" onClick={e => { e.stopPropagation(); playSong(pl.id, 0); }} title="再生">
                                                    <Icon.Play s={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="pl-card__body">
                                            <div className="pl-card__row1">
                                                <span className="pl-card__title">{pl.name}</span>
                                                <div className="pl-card__actions">
                                                    <button className="pl-card__action" onClick={e => { e.stopPropagation(); openEdit(pl); }}><Icon.Edit /></button>
                                                    <button className="pl-card__action" onClick={e => { e.stopPropagation(); setDelTarget(pl); }}><Icon.Trash /></button>
                                                </div>
                                            </div>
                                            {pl.description && <div className="pl-card__desc">{pl.description}</div>}
                                            <div className="pl-card__meta"><Icon.Songs /> <span>{pl.songs.length} 曲</span></div>
                                        </div>
                                    </div>
                                ))}
                                <div className="pl-card pl-card--add" onClick={openCreate}>
                                    <div className="pl-card--add__inner"><Icon.Plus s={32} c="#bbb" /><span>新しいプレイリスト</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ DETAIL VIEW ═══ */}
                    {activePl && (
                        <div className="pl-page">
                            <button className="pl-back" onClick={() => setViewPl(null)}>← プレイリスト一覧</button>
                            <div className="pl-detail-header">
                                <div className="pl-detail-banner" style={{ background: `linear-gradient(135deg, ${COLORS[activePl.colorIdx % COLORS.length]}, ${COLORS[activePl.colorIdx % COLORS.length]}88)` }}>
                                    <MusicNoteIcon size={48} color="rgba(255,255,255,0.4)" />
                                </div>
                                <div className="pl-detail-info">
                                    <h1>{activePl.name}</h1>
                                    {activePl.description && <p>{activePl.description}</p>}
                                    <span className="pl-detail-count">{activePl.songs.length} 曲</span>
                                    <div className="pl-detail-actions">
                                        {activePl.songs.length > 0 && (
                                            <button className="pl-btn pl-btn--primary" onClick={() => playSong(activePl.id, 0)}>
                                                <Icon.Play s={16} /> <span>すべて再生</span>
                                            </button>
                                        )}
                                        <button className="pl-btn pl-btn--accent" onClick={() => { setAddSongsTo(activePl.id); setLinksText(""); }}>
                                            <Icon.Link s={16} c="#fff" /> <span>曲を追加</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Song list */}
                            {activePl.songs.length === 0 ? (
                                <div className="pl-empty-songs">
                                    <MusicNoteIcon size={40} color="#ddd" />
                                    <p>まだ曲がありません</p>
                                    <button className="pl-btn pl-btn--accent" onClick={() => { setAddSongsTo(activePl.id); setLinksText(""); }}>
                                        <Icon.Link s={16} c="#fff" /> <span>YouTubeリンクから追加</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="pl-song-list">
                                    <div className="pl-song-list__header">
                                        <span className="pl-sh-num">#</span>
                                        <span className="pl-sh-title">タイトル</span>
                                        <span className="pl-sh-action"></span>
                                    </div>
                                    {activePl.songs.map((song, i) => {
                                        const isPlaying = nowPlaying?.playlistId === activePl.id && nowPlaying?.songIdx === i;
                                        return (
                                            <div key={song.id} className={`pl-song-row ${isPlaying ? "is-playing" : ""}`} onClick={() => playSong(activePl.id, i)}>
                                                <span className="pl-sr-num">
                                                    {isPlaying ? <span className="pl-eq"><span /><span /><span /></span> : i + 1}
                                                </span>
                                                <div className="pl-sr-info">
                                                    <span className="pl-sr-title">{song.title}</span>
                                                    <span className="pl-sr-id">youtube.com/watch?v={song.videoId}</span>
                                                </div>
                                                <button className="pl-sr-del" onClick={e => { e.stopPropagation(); setDelSong({ plId: activePl.id, songId: song.id }); }}>
                                                    <Icon.Trash s={14} c="#ccc" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ BOTTOM PLAYER BAR ═══ */}
            {nowSong && (
                <div className="pl-player">
                    <div className="pl-player__left">
                        <div className="pl-player__thumb" style={{ background: COLORS[(nowPl?.colorIdx || 0) % COLORS.length] }}>
                            <MusicNoteIcon size={20} color="rgba(255,255,255,0.6)" />
                        </div>
                        <div className="pl-player__info">
                            <span className="pl-player__song">{nowSong.title}</span>
                            <span className="pl-player__pl">{nowPl?.name}</span>
                        </div>
                    </div>
                    <div className="pl-player__center">
                        <div className="pl-player__controls">
                            <button className={`pl-player__cbtn ${shuffle ? "pl-player__cbtn--active" : ""}`} onClick={() => setShuffle(v => !v)} title={shuffle ? "シャッフル オン" : "シャッフル オフ"}>
                                <Icon.Shuffle s={16} c={shuffle ? "#007bc3" : "#666"} />
                            </button>
                            <button className="pl-player__cbtn" onClick={skipPrev}>
                                <Icon.SkipB s={16} c="#666" />
                            </button>
                            <button className="pl-player__play" onClick={() => yt.playing ? yt.pause() : yt.play()}>
                                {yt.playing ? <Icon.Pause s={18} /> : <Icon.Play s={18} />}
                            </button>
                            <button className="pl-player__cbtn" onClick={skipNext}>
                                <Icon.SkipF s={16} c="#666" />
                            </button>
                            <button className={`pl-player__cbtn ${loop ? "pl-player__cbtn--active" : ""}`} onClick={() => setLoop(v => !v)} title={loop ? "ループ オン" : "ループ オフ"}>
                                <Icon.Loop s={16} c={loop ? "#007bc3" : "#666"} />
                            </button>
                        </div>
                        <div className="pl-player__progress-row">
                            <span className="pl-player__time">{formatTime(yt.currentTime)}</span>
                            <input
                                type="range"
                                className="pl-player__progress"
                                min={0}
                                max={yt.duration || 1}
                                value={yt.currentTime}
                                onChange={e => yt.seekTo(Number(e.target.value))}
                            />
                            <span className="pl-player__time">{formatTime(yt.duration)}</span>
                        </div>
                    </div>
                    <div className="pl-player__right">
                        <Icon.Vol s={16} c="#999" />
                        <input
                            type="range"
                            className="pl-player__vol"
                            min={0} max={100}
                            value={yt.volume}
                            onChange={e => yt.setVol(Number(e.target.value))}
                        />
                    </div>
                </div>
            )}

            {/* ═══ MODALS ═══ */}
            <Modal open={plModal} onClose={() => setPlModal(false)} title={editPl ? "プレイリストを編集" : "新しいプレイリスト"}>
                <div className="pl-form">
                    <label className="pl-form__label">プレイリスト名 <span style={{ color: "#e53935" }}>*</span></label>
                    <input className="pl-form__input" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例: 朝のモチベーション" autoFocus />
                    <label className="pl-form__label">説明</label>
                    <textarea className="pl-form__textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="プレイリストの説明（任意）" rows={3} />
                    <div className="pl-form__actions">
                        <button className="pl-btn pl-btn--ghost" onClick={() => setPlModal(false)}>キャンセル</button>
                        <button className="pl-btn pl-btn--primary" onClick={handleSavePl} disabled={!form.name.trim()}>{editPl ? "保存" : "作成"}</button>
                    </div>
                </div>
            </Modal>

            <Modal open={!!addSongsTo} onClose={() => setAddSongsTo(null)} title="YouTubeリンクから曲を追加" wide>
                <div className="pl-form">
                    <label className="pl-form__label">YouTubeリンク</label>
                    <p style={{ fontSize: 12, color: "#999", margin: "-4px 0 8px" }}>複数のリンクをスペースまたは改行で区切って入力できます</p>
                    <textarea
                        className="pl-form__textarea"
                        value={linksText}
                        onChange={e => setLinksText(e.target.value)}
                        placeholder={"https://www.youtube.com/watch?v=dQw4w9WgXcQ\nhttps://youtu.be/abcdefghijk"}
                        rows={5}
                    />
                    {linksText.trim() && (
                        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                            {parseYouTubeLinks(linksText).length} 件のリンクを検出
                        </div>
                    )}
                    <div className="pl-form__actions">
                        <button className="pl-btn pl-btn--ghost" onClick={() => setAddSongsTo(null)}>キャンセル</button>
                        <button className="pl-btn pl-btn--primary" onClick={handleAddSongs} disabled={importing || parseYouTubeLinks(linksText).length === 0}>
                            {importing ? "読み込み中..." : "追加"}
                        </button>
                    </div>
                </div>
            </Modal>

            <Confirm open={!!delTarget} onClose={() => setDelTarget(null)} onOk={confirmDeletePl} msg={`「${delTarget?.name}」を削除しますか？`} />
            <Confirm open={!!delSong} onClose={() => setDelSong(null)} onOk={removeSong} msg="この曲を削除しますか？" />
        </>
    );
}

// ═══════════════════════════════════════════════════
// CSS
// ═══════════════════════════════════════════════════
const CSS = `
.hp-lay{display:flex;min-height:calc(100vh - 64px)}
.hp-main{flex:1;background:#fff;min-width:0;overflow-y:auto}
.pl-page{max-width:1200px;margin:0 auto;padding:32px 48px 64px}
@media(max-width:1023px){.pl-page{padding:24px 24px 48px}}
@media(max-width:767px){.pl-page{padding:16px 16px 32px}}
.pl-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.pl-header__left{display:flex;align-items:center;gap:10px}
.pl-header__title{font-size:20px;font-weight:700;color:#333}
.pl-intro{font-size:14px;color:#666;margin-bottom:24px;line-height:1.6}
.pl-search{display:flex;align-items:center;gap:12px;border:1px solid #dcdcdc;border-radius:8px;padding:0 16px;height:44px;max-width:400px;margin-bottom:28px;background:#fff;transition:border-color .2s,box-shadow .2s}
.pl-search:focus-within{border-color:#007bc3;box-shadow:0 0 0 2px rgba(0,123,195,.12)}
.pl-search input{border:none;outline:none;background:none;font-size:14px;color:#333;width:100%;font-family:inherit}
.pl-search input::placeholder{color:#999}
.pl-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
@media(max-width:1200px){.pl-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:900px){.pl-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:540px){.pl-grid{grid-template-columns:1fr}}
.pl-card{border:1px solid #e8e8e8;border-radius:10px;background:#fff;overflow:hidden;transition:box-shadow .2s,border-color .2s;cursor:pointer}
.pl-card:hover{box-shadow:0 2px 16px rgba(0,0,0,.08);border-color:#d0d0d0}
.pl-card__banner{height:80px;display:flex;align-items:center;justify-content:center;position:relative}
.pl-card__play{position:absolute;bottom:8px;right:8px;width:32px;height:32px;border-radius:50%;border:none;background:rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .2s}
.pl-card:hover .pl-card__play{opacity:1}
.pl-card__play:hover{background:rgba(0,0,0,.45)}
.pl-card__body{padding:14px 16px 16px}
.pl-card__row1{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px}
.pl-card__title{font-size:15px;font-weight:700;color:#333;line-height:1.4;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pl-card__actions{display:flex;gap:2px;flex-shrink:0;opacity:0;transition:opacity .15s}
.pl-card:hover .pl-card__actions{opacity:1}
.pl-card__action{width:28px;height:28px;border:none;background:none;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.pl-card__action:hover{background:#f0f2f5}
.pl-card__desc{font-size:13px;color:#666;line-height:1.5;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pl-card__meta{display:flex;align-items:center;gap:6px;font-size:12px;color:#999}
.pl-card--add{border:2px dashed #dcdcdc;display:flex;align-items:center;justify-content:center;min-height:180px;transition:border-color .2s,background .2s}
.pl-card--add:hover{border-color:#007bc3;background:#f8fbff;box-shadow:none}
.pl-card--add__inner{display:flex;flex-direction:column;align-items:center;gap:8px;color:#bbb;font-size:13px}
.pl-card--add:hover .pl-card--add__inner{color:#007bc3}

/* Detail view */
.pl-back{border:none;background:none;color:#007bc3;font-size:14px;cursor:pointer;padding:0;margin-bottom:16px;font-family:inherit;font-weight:500}
.pl-back:hover{text-decoration:underline}
.pl-detail-header{display:flex;gap:24px;margin-bottom:32px;align-items:flex-start}
.pl-detail-banner{width:160px;height:160px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
@media(max-width:767px){.pl-detail-header{flex-direction:column;gap:16px}.pl-detail-banner{width:100%;height:120px}}
.pl-detail-info{display:flex;flex-direction:column;gap:6px;min-width:0}
.pl-detail-info h1{font-size:24px;font-weight:700;color:#333;margin:0}
.pl-detail-info p{font-size:14px;color:#666;line-height:1.5;margin:0}
.pl-detail-count{font-size:13px;color:#999;margin-top:4px}
.pl-detail-actions{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}

/* Song list */
.pl-song-list{margin-top:8px}
.pl-song-list__header{display:flex;align-items:center;padding:8px 16px;border-bottom:1px solid #eee;font-size:12px;color:#999;font-weight:600}
.pl-sh-num{width:32px;flex-shrink:0}
.pl-sh-title{flex:1}
.pl-song-row{display:flex;align-items:center;padding:10px 16px;border-radius:8px;cursor:pointer;transition:background .15s;gap:0}
.pl-song-row:hover{background:#f5f7fa}
.pl-song-row.is-playing{background:#e7f1fd}
.pl-song-row.is-playing .pl-sr-title{color:#007bc3;font-weight:600}
.pl-sr-num{width:32px;flex-shrink:0;font-size:14px;color:#999;display:flex;align-items:center}
.pl-sr-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.pl-sr-title{font-size:14px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pl-sr-id{font-size:11px;color:#bbb}
.pl-sr-del{width:28px;height:28px;border:none;background:none;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .15s,background .15s;flex-shrink:0}
.pl-song-row:hover .pl-sr-del{opacity:1}
.pl-sr-del:hover{background:#fce4ec}

/* Equalizer animation */
.pl-eq{display:flex;align-items:flex-end;gap:2px;height:14px}
.pl-eq span{width:3px;background:#007bc3;border-radius:1px;animation:plEq .6s ease-in-out infinite alternate}
.pl-eq span:nth-child(1){height:6px;animation-delay:0s}
.pl-eq span:nth-child(2){height:10px;animation-delay:.2s}
.pl-eq span:nth-child(3){height:4px;animation-delay:.4s}
@keyframes plEq{to{height:14px}from{height:3px}}

.pl-empty-songs{display:flex;flex-direction:column;align-items:center;padding:48px 24px;gap:12px}
.pl-empty-songs p{font-size:14px;color:#999}

/* Player bar */
.pl-player{position:fixed;bottom:0;left:0;right:0;height:72px;background:#fff;border-top:1px solid #e8e8e8;box-shadow:0 -2px 12px rgba(0,0,0,.06);display:flex;align-items:center;padding:0 24px;gap:16px;z-index:100}
@media(max-width:767px){.pl-player{padding:0 12px;gap:8px}}
.pl-player__left{display:flex;align-items:center;gap:12px;width:240px;min-width:0;flex-shrink:0}
@media(max-width:767px){.pl-player__left{width:auto;flex:1}}
.pl-player__thumb{width:44px;height:44px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pl-player__info{display:flex;flex-direction:column;min-width:0}
.pl-player__song{font-size:13px;font-weight:600;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pl-player__pl{font-size:11px;color:#999}
.pl-player__center{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;max-width:600px;margin:0 auto}
@media(max-width:767px){.pl-player__center{display:none}}
.pl-player__controls{display:flex;align-items:center;gap:16px}
.pl-player__cbtn{width:32px;height:32px;border:none;background:none;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.pl-player__cbtn:hover{background:#f0f2f5}
.pl-player__cbtn--active{background:#e7f1fd}
.pl-player__cbtn--active:hover{background:#d4e6f9}
.pl-player__play{width:36px;height:36px;border:none;background:#007bc3;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.pl-player__play:hover{background:#0069a8}
.pl-player__progress-row{display:flex;align-items:center;gap:8px;width:100%}
.pl-player__time{font-size:11px;color:#999;min-width:36px;text-align:center}
.pl-player__progress{flex:1;height:4px;-webkit-appearance:none;appearance:none;background:#e0e0e0;border-radius:2px;outline:none;cursor:pointer}
.pl-player__progress::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;background:#007bc3;border-radius:50%;cursor:pointer}
.pl-player__right{display:flex;align-items:center;gap:8px;width:140px;justify-content:flex-end;flex-shrink:0}
@media(max-width:767px){.pl-player__right{display:none}}
.pl-player__vol{width:80px;height:4px;-webkit-appearance:none;appearance:none;background:#e0e0e0;border-radius:2px;outline:none;cursor:pointer}
.pl-player__vol::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;background:#666;border-radius:50%;cursor:pointer}

/* Buttons */
.pl-btn{display:inline-flex;align-items:center;gap:6px;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s,opacity .15s}
.pl-btn:disabled{opacity:.5;cursor:not-allowed}
.pl-btn--primary{background:#007bc3;color:#fff}
.pl-btn--primary:hover:not(:disabled){background:#0069a8}
.pl-btn--accent{background:#808CBA;color:#fff}
.pl-btn--accent:hover:not(:disabled){background:#6e7aa6}
.pl-btn--ghost{background:#f0f2f5;color:#333}
.pl-btn--ghost:hover{background:#e4e6ea}
.pl-btn--danger{background:#e53935;color:#fff}
.pl-btn--danger:hover{background:#c62828}

/* Modal */
.pl-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:2000;display:flex;align-items:center;justify-content:center}
.pl-modal{background:#fff;border-radius:12px;width:440px;max-width:92vw;box-shadow:0 8px 32px rgba(0,0,0,.15);animation:plFi .2s ease}
.pl-modal--wide{width:560px}
.pl-modal--sm{width:360px}
@keyframes plFi{from{transform:scale(.96);opacity:0}to{transform:scale(1);opacity:1}}
.pl-modal__head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #eee;font-size:16px;font-weight:700;color:#333}
.pl-modal__close{width:32px;height:32px;border:none;background:transparent;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.pl-modal__close:hover{background:#f0f2f5}
.pl-modal__body{padding:20px}
.pl-form{display:flex;flex-direction:column;gap:12px}
.pl-form__label{font-size:13px;font-weight:600;color:#333;margin-bottom:-4px}
.pl-form__input,.pl-form__textarea{border:1px solid #dcdcdc;border-radius:8px;padding:10px 14px;font-size:14px;font-family:inherit;color:#333;outline:none;transition:border-color .2s,box-shadow .2s;width:100%;box-sizing:border-box}
.pl-form__input:focus,.pl-form__textarea:focus{border-color:#007bc3;box-shadow:0 0 0 2px rgba(0,123,195,.12)}
.pl-form__input::placeholder,.pl-form__textarea::placeholder{color:#999}
.pl-form__textarea{resize:vertical}
.pl-form__actions{display:flex;justify-content:flex-end;gap:10px;margin-top:8px}
`;
