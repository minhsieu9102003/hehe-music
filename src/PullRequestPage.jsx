import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "./Sidebar";
import { SearchIcon } from "./icons";

// ═══════════════════════════════════════════════════
// Config
// ═══════════════════════════════════════════════════
const REPO = "CYDASCOM/uranus";
const MEMBERS = [
    { name: "Nguyen Le Son", author: "nguyenleson-cydas" },
    { name: "Linh Chi", author: "danglinhchi-cydas" },
    { name: "Le Ngoc Anh", author: "Le-NgocAnh" },
];
const PAGES = 3;
const PER_PAGE = 30;

const SK = {
    token: "cydas-pr-token",
    pin: "cydas-pr-pin",
    prs: "cydas-pr-data",
    bl: "cydas-pr-blacklist",
    lastFetch: "cydas-pr-last",
};
function loadJ(k, fb) { try { return JSON.parse(localStorage.getItem(k)) || fb; } catch { return fb; } }
function saveJ(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

// ═══════════════════════════════════════════════════
// Icons
// ═══════════════════════════════════════════════════
const IC = {
    Git: ({ s = 24, c = "#7da08a" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" /></svg>,
    Refresh: ({ s = 16, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>,
    File: ({ s = 13, c = "#999" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>,
    Ban: ({ s = 13, c = "#e53935" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>,
    Undo: ({ s = 13, c = "#5d8a72" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>,
    Key: ({ s = 16, c = "#999" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>,
    Eye: ({ s = 14, c = "#999" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    EyeOff: ({ s = 14, c = "#999" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
    Down: ({ s = 12, c = "#999" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>,
    Up: ({ s = 12, c = "#999" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>,
    Ext: ({ s = 12, c = "#bbb" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
    Trash: ({ s = 14, c = "#e53935" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
};

function fmtDate(d) {
    const dt = new Date(d);
    return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, "0")}/${String(dt.getDate()).padStart(2, "0")}`;
}
function timeAgo(d) {
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "1時間以内";
    if (h < 24) return `${h}時間前`;
    const days = Math.floor(h / 24);
    if (days < 30) return `${days}日前`;
    return `${Math.floor(days / 30)}ヶ月前`;
}

// ═══════════════════════════════════════════════════
// GitHub API
// ═══════════════════════════════════════════════════
async function fetchPRsForMember(token, author) {
    const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" };
    const allPRs = [];

    for (let page = 1; page <= PAGES; page++) {
        const url = `https://api.github.com/repos/${REPO}/pulls?state=closed&per_page=${PER_PAGE}&page=${page}&sort=updated&direction=desc`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
        const data = await res.json();
        const memberPRs = data.filter(pr => pr.user?.login?.toLowerCase() === author.toLowerCase() && pr.merged_at);
        allPRs.push(...memberPRs);
        if (data.length < PER_PAGE) break;
    }
    return allPRs;
}

async function fetchPRFiles(token, prNumber) {
    const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" };
    const url = `https://api.github.com/repos/${REPO}/pulls/${prNumber}/files?per_page=100`;
    const res = await fetch(url, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(f => f.filename);
}

// ═══════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════
function PRCard({ pr, isBlacklisted, onToggleBlacklist }) {
    const [expanded, setExpanded] = useState(false);
    const fileCount = pr.files?.length || 0;

    return (
        <div className={`pr-card ${isBlacklisted ? "pr-card--bl" : ""}`}>
            <div className="pr-card__main" onClick={() => setExpanded(!expanded)}>
                <div className="pr-card__left">
                    <span className="pr-card__number">#{pr.number}</span>
                    <div className="pr-card__info">
                        <span className="pr-card__title">{pr.title}</span>
                        <div className="pr-card__meta">
                            <span className="pr-card__date">{fmtDate(pr.closed_at)}</span>
                            <span className="pr-card__ago">{timeAgo(pr.closed_at)}</span>
                            <span className="pr-card__files"><IC.File /> {fileCount} files</span>
                        </div>
                    </div>
                </div>
                <div className="pr-card__right">
                    <button className="pr-card__btn" onClick={e => { e.stopPropagation(); onToggleBlacklist(pr.number); }} title={isBlacklisted ? "復元" : "非表示"}>
                        {isBlacklisted ? <IC.Undo /> : <IC.Ban />}
                    </button>
                    <a className="pr-card__btn" href={pr.html_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} title="GitHubで開く">
                        <IC.Ext />
                    </a>
                    <span className="pr-card__expand">{expanded ? <IC.Up /> : <IC.Down />}</span>
                </div>
            </div>
            {expanded && pr.files && pr.files.length > 0 && (
                <div className="pr-card__files-list">
                    {pr.files.map((f, i) => (
                        <div key={i} className="pr-file">
                            <IC.File s={12} c="#7da08a" />
                            <span>{f}</span>
                        </div>
                    ))}
                </div>
            )}
            {expanded && (!pr.files || pr.files.length === 0) && (
                <div className="pr-card__files-list"><span className="pr-card__no-files">ファイル情報なし</span></div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════
export default function PullRequestPage() {
    const [token, setToken] = useState(() => localStorage.getItem(SK.token) || "");
    const [pin, setPin] = useState(() => localStorage.getItem(SK.pin) || "");
    const [pinInput, setPinInput] = useState("");
    const [authed, setAuthed] = useState(false);
    const [tokenInput, setTokenInput] = useState("");
    const [showToken, setShowToken] = useState(false);

    const [prs, setPrs] = useState(() => loadJ(SK.prs, []));
    const [blacklist, setBlacklist] = useState(() => loadJ(SK.bl, []));
    const [lastFetch, setLastFetch] = useState(() => localStorage.getItem(SK.lastFetch) || "");

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState("");
    const [error, setError] = useState(null);

    const [filterMember, setFilterMember] = useState("all");
    const [search, setSearch] = useState("");
    const [showBlacklisted, setShowBlacklisted] = useState(false);

    // Save to localStorage
    useEffect(() => { saveJ(SK.prs, prs); }, [prs]);
    useEffect(() => { saveJ(SK.bl, blacklist); }, [blacklist]);

    // PIN check
    const handlePinSubmit = () => {
        if (!pin) {
            // First time: set PIN
            if (pinInput.length >= 4) {
                localStorage.setItem(SK.pin, pinInput);
                setPin(pinInput);
                setAuthed(true);
            }
        } else {
            if (pinInput === pin) setAuthed(true);
            else setError("PINが正しくありません");
        }
        setPinInput("");
    };

    // Token management
    const saveToken = () => {
        const t = tokenInput.trim();
        if (!t) return;
        localStorage.setItem(SK.token, t);
        setToken(t);
        setTokenInput("");
    };
    const clearToken = () => {
        localStorage.removeItem(SK.token);
        setToken("");
    };

    // Fetch PRs
    const handleFetch = useCallback(async () => {
        if (!token) { setError("GitHubトークンを設定してください"); return; }
        setLoading(true); setError(null);
        const existingIds = new Set(prs.map(p => p.number));
        const newPrs = [];

        try {
            for (let mi = 0; mi < MEMBERS.length; mi++) {
                const m = MEMBERS[mi];
                setProgress(`${m.name} の PR を取得中... (${mi + 1}/${MEMBERS.length})`);
                const memberPRs = await fetchPRsForMember(token, m.author);

                for (const pr of memberPRs) {
                    if (existingIds.has(pr.number)) continue;
                    if (blacklist.includes(pr.number)) { existingIds.add(pr.number); continue; }
                    setProgress(`#${pr.number} のファイル一覧を取得中...`);
                    const files = await fetchPRFiles(token, pr.number);
                    newPrs.push({
                        number: pr.number,
                        title: pr.title,
                        html_url: pr.html_url,
                        closed_at: pr.closed_at || pr.merged_at,
                        author: m.author,
                        authorName: m.name,
                        files,
                    });
                    existingIds.add(pr.number);
                    // Rate limit courtesy
                    await new Promise(r => setTimeout(r, 300));
                }
            }

            if (newPrs.length > 0) {
                setPrs(prev => {
                    const merged = [...newPrs, ...prev];
                    merged.sort((a, b) => new Date(b.closed_at) - new Date(a.closed_at));
                    return merged;
                });
            }
            const now = new Date().toISOString();
            localStorage.setItem(SK.lastFetch, now);
            setLastFetch(now);
            setProgress(`完了: ${newPrs.length} 件の新しい PR を取得`);
        } catch (e) {
            setError(e.message);
        }
        setLoading(false);
    }, [token, prs, blacklist]);

    // Blacklist
    const toggleBlacklist = (num) => {
        setBlacklist(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
    };

    // Clear all data
    const clearAll = () => {
        if (!confirm("すべてのデータを削除しますか？")) return;
        setPrs([]); setBlacklist([]);
        localStorage.removeItem(SK.prs);
        localStorage.removeItem(SK.bl);
        localStorage.removeItem(SK.lastFetch);
        setLastFetch("");
    };

    // Filtered PRs
    const filtered = prs.filter(pr => {
        if (!showBlacklisted && blacklist.includes(pr.number)) return false;
        if (filterMember !== "all" && pr.author !== filterMember) return false;
        if (search) {
            const q = search.toLowerCase();
            return pr.title.toLowerCase().includes(q) ||
                String(pr.number).includes(q) ||
                (pr.files || []).some(f => f.toLowerCase().includes(q));
        }
        return true;
    });

    const blCount = prs.filter(p => blacklist.includes(p.number)).length;

    // ─── PIN screen ───
    if (!authed) {
        return (
            <>
                <style>{CSS}</style>
                <div className="hp-lay">
                    <Sidebar activeId="" />
                    <div className="hp-main">
                        <div className="pr-pin-screen">
                            <IC.Key s={40} c="#7da08a" />
                            <h2>{pin ? "PINを入力" : "PINを設定（4桁以上）"}</h2>
                            <p>{pin ? "アクセスするにはPINを入力してください" : "初回利用です。PINを設定してください"}</p>
                            <div className="pr-pin-row">
                                <input
                                    className="pr-pin-input"
                                    type="password"
                                    value={pinInput}
                                    onChange={e => setPinInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handlePinSubmit()}
                                    placeholder={pin ? "PIN" : "新しいPIN (4桁以上)"}
                                    autoFocus
                                />
                                <button className="pr-btn pr-btn--primary" onClick={handlePinSubmit}
                                    disabled={pin ? !pinInput : pinInput.length < 4}>
                                    {pin ? "ログイン" : "設定"}
                                </button>
                            </div>
                            {error && <div className="pr-error">{error}</div>}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ─── Main screen ───
    return (
        <>
            <style>{CSS}</style>
            <div className="hp-lay">
                <Sidebar activeId="" />
                <div className="hp-main">
                    <div className="pr-page">
                        {/* Header */}
                        <div className="pr-header">
                            <div className="pr-header__left">
                                <IC.Git s={28} />
                                <div>
                                    <h1>PR トラッカー</h1>
                                    <span className="pr-header__repo">{REPO}</span>
                                </div>
                            </div>
                            <button className="pr-btn pr-btn--primary" onClick={handleFetch} disabled={loading || !token}>
                                <IC.Refresh s={14} c="#fff" />
                                <span>{loading ? "取得中..." : "データ更新"}</span>
                            </button>
                        </div>

                        {/* Token config */}
                        <div className="pr-config">
                            <div className="pr-config__row">
                                <IC.Key s={14} />
                                <span className="pr-config__label">GitHub Token:</span>
                                {token ? (
                                    <>
                                        <span className="pr-config__val">{showToken ? token : "••••••••" + token.slice(-4)}</span>
                                        <button className="pr-config__toggle" onClick={() => setShowToken(!showToken)}>
                                            {showToken ? <IC.EyeOff s={12} /> : <IC.Eye s={12} />}
                                        </button>
                                        <button className="pr-btn pr-btn--ghost pr-btn--xs" onClick={clearToken}>削除</button>
                                    </>
                                ) : (
                                    <>
                                        <input className="pr-config__input" type="password" value={tokenInput} onChange={e => setTokenInput(e.target.value)} placeholder="ghp_..." onKeyDown={e => e.key === "Enter" && saveToken()} />
                                        <button className="pr-btn pr-btn--primary pr-btn--xs" onClick={saveToken} disabled={!tokenInput.trim()}>保存</button>
                                    </>
                                )}
                            </div>
                            {lastFetch && <span className="pr-config__last">最終更新: {fmtDate(lastFetch)} {new Date(lastFetch).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</span>}
                        </div>

                        {/* Progress / Error */}
                        {loading && <div className="pr-progress">{progress}</div>}
                        {error && <div className="pr-error">{error}</div>}

                        {/* Filters */}
                        <div className="pr-filters">
                            <div className="pr-search">
                                <SearchIcon size={14} color="#999" />
                                <input type="text" placeholder="PR番号, タイトル, ファイル名で検索..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <div className="pr-filter-row">
                                <select className="pr-select" value={filterMember} onChange={e => setFilterMember(e.target.value)}>
                                    <option value="all">全メンバー</option>
                                    {MEMBERS.map(m => <option key={m.author} value={m.author}>{m.name}</option>)}
                                </select>
                                <button className={`pr-btn pr-btn--ghost pr-btn--sm ${showBlacklisted ? "pr-btn--active" : ""}`} onClick={() => setShowBlacklisted(!showBlacklisted)}>
                                    <IC.Ban s={12} c={showBlacklisted ? "#e53935" : "#999"} />
                                    <span>非表示 ({blCount})</span>
                                </button>
                                <button className="pr-btn pr-btn--ghost pr-btn--sm" onClick={clearAll} title="データ全削除">
                                    <IC.Trash s={12} />
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="pr-stats">
                            {MEMBERS.map(m => {
                                const count = prs.filter(p => p.author === m.author && !blacklist.includes(p.number)).length;
                                return (
                                    <div key={m.author} className={`pr-stat ${filterMember === m.author ? "is-active" : ""}`} onClick={() => setFilterMember(filterMember === m.author ? "all" : m.author)}>
                                        <span className="pr-stat__name">{m.name}</span>
                                        <span className="pr-stat__count">{count}</span>
                                    </div>
                                );
                            })}
                            <div className="pr-stat">
                                <span className="pr-stat__name">合計</span>
                                <span className="pr-stat__count">{prs.filter(p => !blacklist.includes(p.number)).length}</span>
                            </div>
                        </div>

                        {/* PR List */}
                        {filtered.length > 0 ? (
                            <div className="pr-list">
                                {filtered.map(pr => (
                                    <PRCard key={pr.number} pr={pr} isBlacklisted={blacklist.includes(pr.number)} onToggleBlacklist={toggleBlacklist} />
                                ))}
                            </div>
                        ) : (
                            <div className="pr-empty">
                                {prs.length === 0 ? (
                                    <>
                                        <IC.Git s={40} c="#ddd" />
                                        <p>データがありません</p>
                                        <p className="pr-empty__sub">「データ更新」ボタンを押して PR を取得してください</p>
                                    </>
                                ) : (
                                    <p>検索条件に一致する PR がありません</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// ═══════════════════════════════════════════════════
const CSS = `
.hp-lay{display:flex;min-height:calc(100vh - 64px)}
.hp-main{flex:1;background:#fff;min-width:0;overflow-y:auto}
.pr-page{max-width:960px;margin:0 auto;padding:32px 48px 80px}
@media(max-width:1023px){.pr-page{padding:24px 24px 64px}}
@media(max-width:767px){.pr-page{padding:16px 16px 48px}}

/* PIN screen */
.pr-pin-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100vh - 64px);gap:12px}
.pr-pin-screen h2{font-size:18px;font-weight:700;color:#333;margin:8px 0 0}
.pr-pin-screen p{font-size:13px;color:#999;margin:0}
.pr-pin-row{display:flex;gap:8px;margin-top:8px}
.pr-pin-input{width:180px;border:1px solid #dcdcdc;border-radius:8px;padding:10px 14px;font-size:16px;font-family:inherit;text-align:center;letter-spacing:4px;outline:none}
.pr-pin-input:focus{border-color:#5d8a72;box-shadow:0 0 0 2px rgba(93,138,114,.12)}

/* Header */
.pr-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.pr-header__left{display:flex;align-items:center;gap:12px}
.pr-header__left h1{font-size:20px;font-weight:700;color:#333;margin:0}
.pr-header__repo{font-size:12px;color:#999;font-family:"Fira Code","Consolas",monospace}

/* Config */
.pr-config{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:#fafbfc;border:1px solid #e8e8e8;border-radius:10px;margin-bottom:16px;flex-wrap:wrap}
.pr-config__row{display:flex;align-items:center;gap:8px;flex:1;min-width:0}
.pr-config__label{font-size:12px;font-weight:600;color:#555;flex-shrink:0}
.pr-config__val{font-size:12px;color:#888;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px}
.pr-config__toggle{width:24px;height:24px;border:none;background:none;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer}
.pr-config__toggle:hover{background:#eee}
.pr-config__input{flex:1;min-width:120px;max-width:240px;border:1px solid #dcdcdc;border-radius:6px;padding:5px 10px;font-size:12px;font-family:monospace;color:#333;outline:none}
.pr-config__input:focus{border-color:#5d8a72}
.pr-config__last{font-size:11px;color:#bbb;flex-shrink:0}

/* Progress / Error */
.pr-progress{padding:10px 14px;background:#eaf4ee;border-radius:8px;font-size:12px;color:#5d8a72;margin-bottom:12px;animation:prPulse 1.5s ease-in-out infinite}
@keyframes prPulse{0%,100%{opacity:1}50%{opacity:.6}}
.pr-error{padding:10px 14px;background:#fce4ec;border-radius:8px;font-size:12px;color:#c62828;margin-bottom:12px}

/* Filters */
.pr-filters{margin-bottom:16px}
.pr-search{display:flex;align-items:center;gap:10px;border:1px solid #dcdcdc;border-radius:8px;padding:0 14px;height:38px;background:#fff;margin-bottom:10px;transition:border-color .2s}
.pr-search:focus-within{border-color:#5d8a72;box-shadow:0 0 0 2px rgba(93,138,114,.1)}
.pr-search input{border:none;outline:none;background:none;font-size:13px;color:#333;width:100%;font-family:inherit}
.pr-search input::placeholder{color:#bbb}
.pr-filter-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.pr-select{border:1px solid #dcdcdc;border-radius:6px;padding:5px 10px;font-size:12px;font-family:inherit;color:#333;outline:none;cursor:pointer;background:#fff}
.pr-select:focus{border-color:#5d8a72}

/* Stats */
.pr-stats{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.pr-stat{display:flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid #e8e8e8;border-radius:8px;cursor:pointer;transition:all .15s}
.pr-stat:hover{border-color:#ccc}
.pr-stat.is-active{border-color:#5d8a72;background:#eaf4ee}
.pr-stat__name{font-size:12px;color:#666}
.pr-stat__count{font-size:14px;font-weight:700;color:#333}

/* PR List */
.pr-list{display:flex;flex-direction:column;gap:6px}
.pr-card{border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;transition:border-color .15s}
.pr-card:hover{border-color:#d0d0d0}
.pr-card--bl{opacity:.5;border-style:dashed}
.pr-card__main{display:flex;align-items:center;padding:12px 16px;cursor:pointer;gap:12px;transition:background .15s}
.pr-card__main:hover{background:#fafbfc}
.pr-card__left{display:flex;align-items:center;gap:12px;flex:1;min-width:0}
.pr-card__number{font-size:13px;font-weight:700;color:#5d8a72;font-family:monospace;flex-shrink:0;min-width:52px}
.pr-card__info{flex:1;min-width:0}
.pr-card__title{font-size:14px;font-weight:600;color:#333;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pr-card__meta{display:flex;gap:12px;margin-top:3px;font-size:11px;color:#999;align-items:center}
.pr-card__files{display:flex;align-items:center;gap:3px}
.pr-card__right{display:flex;align-items:center;gap:4px;flex-shrink:0}
.pr-card__btn{width:28px;height:28px;border:none;background:none;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;text-decoration:none}
.pr-card__btn:hover{background:#f0f2f5}
.pr-card__expand{width:20px;display:flex;align-items:center;justify-content:center}

/* Files list */
.pr-card__files-list{padding:0 16px 12px;border-top:1px solid #f0f0f0;animation:prSlide .2s ease}
@keyframes prSlide{from{opacity:0;max-height:0}to{opacity:1;max-height:2000px}}
.pr-file{display:flex;align-items:center;gap:6px;padding:4px 0;font-size:12px;color:#555;font-family:"Fira Code","Consolas",monospace;word-break:break-all}
.pr-card__no-files{font-size:12px;color:#ccc;padding:8px 0}

/* Empty */
.pr-empty{display:flex;flex-direction:column;align-items:center;padding:48px 24px;gap:10px}
.pr-empty p{font-size:14px;color:#999;margin:0}
.pr-empty__sub{font-size:12px;color:#ccc}

/* Buttons */
.pr-btn{display:inline-flex;align-items:center;gap:6px;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s}
.pr-btn:disabled{opacity:.4;cursor:not-allowed}
.pr-btn--primary{background:#5d8a72;color:#fff}
.pr-btn--primary:hover:not(:disabled){background:#4a7560}
.pr-btn--ghost{background:#f0f2f5;color:#555}
.pr-btn--ghost:hover{background:#e4e6ea}
.pr-btn--active{background:#eaf4ee;color:#5d8a72}
.pr-btn--danger{background:#e53935;color:#fff}
.pr-btn--sm{padding:5px 10px;font-size:11px}
.pr-btn--xs{padding:4px 8px;font-size:11px;border-radius:6px}
`;
