import React, { useState, useContext } from "react";
import { NavContext } from "./NavContext";
import { SearchIcon, RightArrowIcon, BookmarkIcon } from "./icons";

// ─── Palette ────
const c1 = "#c9a87c"; // warm gold
const c2 = "#8bb8a8"; // sage
const c3 = "#b8869a"; // muted rose
const c4 = "#7ca8c6"; // soft blue
const c5 = "#c4956a"; // terracotta
const ci = "#555";     // inactive sidebar

// ═══════════════════════════════════════════════════
// Sidebar icons — all new, unrelated
// ═══════════════════════════════════════════════════
function SbHome({ color = ci, size = 32 }) {
    return (<svg width={size} height={size} viewBox="0 0 32 32" fill="none"><path d="M6 16l10-10 10 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 14v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V14" stroke={color} strokeWidth="1.5" /><path d="M13 26v-6h6v6" stroke={color} strokeWidth="1.5" /></svg>);
}
function SbCompass({ color = ci, size = 32 }) {
    return (<svg width={size} height={size} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="10" stroke={color} strokeWidth="1.5" /><polygon points="12,20 14,14 20,12 18,18" stroke={color} strokeWidth="1.3" fill="none" /><circle cx="16" cy="16" r="1" fill={color} /></svg>);
}
function SbStar({ color = ci, size = 32 }) {
    return (<svg width={size} height={size} viewBox="0 0 32 32" fill="none"><path d="M16 6l2.9 6.3 6.6.5-5 4.5 1.5 6.5L16 20.5l-6 3.3 1.5-6.5-5-4.5 6.6-.5z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></svg>);
}
function SbGlobe({ color = ci, size = 32 }) {
    return (<svg width={size} height={size} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="10" stroke={color} strokeWidth="1.5" /><ellipse cx="16" cy="16" rx="4" ry="10" stroke={color} strokeWidth="1.2" /><line x1="6" y1="16" x2="26" y2="16" stroke={color} strokeWidth="1" /><path d="M7.5 11h17M7.5 21h17" stroke={color} strokeWidth=".8" opacity=".5" /></svg>);
}
function SbHeart({ color = ci, size = 32 }) {
    return (<svg width={size} height={size} viewBox="0 0 32 32" fill="none"><path d="M16 26s-9-5.5-9-12a5.5 5.5 0 0 1 9-4.24A5.5 5.5 0 0 1 25 14c0 6.5-9 12-9 12z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></svg>);
}
function SbCamera({ color = ci, size = 32 }) {
    return (<svg width={size} height={size} viewBox="0 0 32 32" fill="none"><rect x="5" y="12" width="22" height="14" rx="3" stroke={color} strokeWidth="1.5" /><circle cx="16" cy="19" r="4" stroke={color} strokeWidth="1.5" /><path d="M11 12l1.5-3h7l1.5 3" stroke={color} strokeWidth="1.5" /></svg>);
}
function SbMountain({ color = ci, size = 32 }) {
    return (<svg width={size} height={size} viewBox="0 0 32 32" fill="none"><path d="M4 26l8-14 4 5 4-8 8 17H4z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><circle cx="22" cy="9" r="3" stroke={color} strokeWidth="1.2" /></svg>);
}
function SbMusic({ color = ci, size = 32 }) {
    return (<svg width={size} height={size} viewBox="0 0 32 32" fill="none"><circle cx="11" cy="22" r="3" stroke={color} strokeWidth="1.5" /><circle cx="23" cy="20" r="3" stroke={color} strokeWidth="1.5" /><line x1="14" y1="22" x2="14" y2="8" stroke={color} strokeWidth="1.5" /><line x1="26" y1="20" x2="26" y2="6" stroke={color} strokeWidth="1.5" /><path d="M14 8l12-2" stroke={color} strokeWidth="1.5" /></svg>);
}
function SbFlask({ color = ci, size = 32 }) {
    return (<svg width={size} height={size} viewBox="0 0 32 32" fill="none"><path d="M12 6v8l-5 10a2 2 0 0 0 1.8 3h14.4a2 2 0 0 0 1.8-3l-5-10V6" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><line x1="12" y1="6" x2="20" y2="6" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><path d="M10 21h12" stroke={color} strokeWidth="1" opacity=".4" /></svg>);
}
function SbFeather({ color = ci, size = 32 }) {
    return (<svg width={size} height={size} viewBox="0 0 32 32" fill="none"><path d="M24 6c-4 0-10 4-14 12l-2 8 8-2c8-4 12-10 12-14 0-2-2-4-4-4z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M18 12l-8 12" stroke={color} strokeWidth="1" opacity=".4" /><line x1="6" y1="26" x2="10" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>);
}

// ─── Card icons ────
function RamenIcon() {
    return (<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><ellipse cx="16" cy="14" rx="11" ry="4" stroke={c1} strokeWidth="1.5" /><path d="M5 14c0 6 4.9 11 11 11s11-5 11-11" stroke={c1} strokeWidth="1.5" strokeLinecap="round" /><path d="M10 10c1-3 3-5 6-5" stroke={c1} strokeWidth="1.3" strokeLinecap="round" opacity=".5" /><path d="M14 10c.5-2.5 2-4 4.5-4" stroke={c1} strokeWidth="1.3" strokeLinecap="round" opacity=".35" /></svg>);
}
function CatIcon() {
    return (<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M8 24c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={c3} strokeWidth="1.5" strokeLinecap="round" /><circle cx="13" cy="20" r="1.2" fill={c3} /><circle cx="19" cy="20" r="1.2" fill={c3} /><path d="M15 22.5a1.5 1.5 0 0 0 2 0" stroke={c3} strokeWidth="1.2" strokeLinecap="round" /><path d="M10 13l-2-5" stroke={c3} strokeWidth="1.5" strokeLinecap="round" /><path d="M22 13l2-5" stroke={c3} strokeWidth="1.5" strokeLinecap="round" /><path d="M10 13c0-2 2.7-4 6-4s6 2 6 4" stroke={c3} strokeWidth="1.5" /></svg>);
}
function RocketIcon() {
    return (<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 6c-2 4-3 8-3 12h6c0-4-1-8-3-12z" stroke={c4} strokeWidth="1.5" strokeLinejoin="round" /><path d="M13 18l-3 4h12l-3-4" stroke={c4} strokeWidth="1.5" strokeLinejoin="round" /><circle cx="16" cy="14" r="2" stroke={c4} strokeWidth="1.2" /><line x1="14" y1="24" x2="14" y2="26" stroke={c4} strokeWidth="1.3" strokeLinecap="round" /><line x1="18" y1="24" x2="18" y2="26" stroke={c4} strokeWidth="1.3" strokeLinecap="round" /></svg>);
}
function CoffeeIcon() {
    return (<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="7" y="14" width="14" height="11" rx="2" stroke={c5} strokeWidth="1.5" /><path d="M21 17h2.5a2.5 2.5 0 0 1 0 5H21" stroke={c5} strokeWidth="1.5" /><line x1="7" y1="27" x2="21" y2="27" stroke={c5} strokeWidth="1.5" strokeLinecap="round" /><path d="M12 11c0-2 1-3 1-3" stroke={c5} strokeWidth="1.2" strokeLinecap="round" opacity=".5" /><path d="M16 10c0-2.5 1-3.5 1-3.5" stroke={c5} strokeWidth="1.2" strokeLinecap="round" opacity=".35" /></svg>);
}
function DiceIcon() {
    return (<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="6" y="6" width="20" height="20" rx="4" stroke={c2} strokeWidth="1.5" /><circle cx="12" cy="12" r="1.5" fill={c2} /><circle cx="20" cy="12" r="1.5" fill={c2} /><circle cx="16" cy="16" r="1.5" fill={c2} /><circle cx="12" cy="20" r="1.5" fill={c2} /><circle cx="20" cy="20" r="1.5" fill={c2} /></svg>);
}
function LeafIcon() {
    return (<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M8 26c2-8 8-16 18-18-2 10-8 16-18 18z" stroke={c2} strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 26C12 22 18 16 26 8" stroke={c2} strokeWidth="1" opacity=".4" /><path d="M14 22c-2-2-2-6 0-10" stroke={c2} strokeWidth="1.2" strokeLinecap="round" opacity=".5" /></svg>);
}
function ShoeIcon() {
    return (<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M6 22h20c1.1 0 2-.9 2-2v-1c0-1.1-.9-2-2-2h-6l-3-5H9c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2z" stroke={c4} strokeWidth="1.5" strokeLinejoin="round" /><line x1="6" y1="25" x2="28" y2="25" stroke={c4} strokeWidth="1.5" strokeLinecap="round" /></svg>);
}
function UtensilIcon() {
    return (<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M10 6v8c0 2.2 1.8 4 4 4v10" stroke={c5} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18 6v8c0 2.2-1.8 4-4 4" stroke={c5} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><line x1="14" y1="6" x2="14" y2="14" stroke={c5} strokeWidth="1.3" strokeLinecap="round" /><path d="M22 6c0 4-.5 7-2 8v14" stroke={c5} strokeWidth="1.5" strokeLinecap="round" /></svg>);
}
function BulbIcon() {
    return (<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 6a8 8 0 0 0-5 14.3V23h10v-2.7A8 8 0 0 0 16 6z" stroke={c1} strokeWidth="1.5" strokeLinejoin="round" /><line x1="11" y1="26" x2="21" y2="26" stroke={c1} strokeWidth="1.5" strokeLinecap="round" /><circle cx="16" cy="13" r="2.5" stroke={c1} strokeWidth="1" opacity=".4" /></svg>);
}

// ═══════════════════════════════════════════════════
// Data
// ═══════════════════════════════════════════════════
const RECENT_APPS = [
    { id: "ramen", title: "ラーメン図鑑", desc: "全国のご当地ラーメンを制覇しよう。味噌、塩、豚骨、醤油…あなたの推しは？", Icon: RamenIcon },
    { id: "neko", title: "猫カフェMAP", desc: "近くの猫カフェを検索。もふもふタイムで癒されよう。推し猫を登録できます。", Icon: CatIcon },
    { id: "space", title: "宇宙ニュース", desc: "NASAの最新ミッションから深海の新種発見まで。知的好奇心を刺激する毎日。", Icon: RocketIcon },
    { id: "coffee", title: "コーヒー手帳", desc: "今日のコーヒー、何にする？淹れ方、豆の種類、カフェ巡りの記録を残そう。", Icon: CoffeeIcon },
    { id: "game", title: "ボードゲーム部", desc: "カタンからアズールまで。積みゲーリストを管理して、次の対戦相手を見つけよう。", Icon: DiceIcon },
];
const HR_APPS = [
    { id: "plant", title: "観葉植物メモ", desc: "水やりスケジュールと成長記録。枯らさないための備忘録アプリ。", Icon: LeafIcon },
    { id: "run", title: "ランニングログ", desc: "今月の走行距離と目標達成率をチェック。雨の日はストレッチでもOK。", Icon: ShoeIcon },
    { id: "recipe", title: "今日のレシピ", desc: "冷蔵庫の残り物から献立提案。めんどくさい日は「卵かけごはん」でいいんです。", Icon: UtensilIcon },
    { id: "trivia", title: "雑学クイズ", desc: "知ってるようで知らない豆知識。友達に自慢できるネタを毎日1つ。", Icon: BulbIcon },
];

const SIDEBAR_ITEMS = [
    { id: "home", Icon: SbHome, label: "ホーム", page: "home" },
    { id: "compass", Icon: SbCompass, label: "探索" },
    { id: "star", Icon: SbStar, label: "お気に入り" },
    { id: "globe", Icon: SbGlobe, label: "ワールド" },
    { id: "heart", Icon: SbHeart, label: "いいね" },
    { id: "camera", Icon: SbCamera, label: "アルバム" },
    { id: "mountain", Icon: SbMountain, label: "ギャラリー" },
    { id: "music", Icon: SbMusic, label: "ミュージック" },
    { id: "flask", Icon: SbFlask, label: "ラボ" },
];
const SIDEBAR_BOTTOM = [
    { id: "feather", Icon: SbFeather, label: "メモ" },
];

// ═══════════════════════════════════════════════════
// Dark Sidebar (self-contained)
// ═══════════════════════════════════════════════════
function DarkSidebar() {
    const { go } = useContext(NavContext);
    return (
        <nav className="hd-sb">
            <div className="hd-sb__main">
                {SIDEBAR_ITEMS.map(item => (
                    <div key={item.id} className={`hd-sb__item ${item.id === "home" ? "active" : ""}`} onClick={() => item.page && go(item.page)} title={item.label}>
                        <item.Icon color={item.id === "home" ? c1 : ci} size={32} />
                    </div>
                ))}
            </div>
            <div className="hd-sb__sep" />
            {SIDEBAR_BOTTOM.map(item => (
                <div key={item.id} className="hd-sb__item" title={item.label}>
                    <item.Icon color={ci} size={32} />
                </div>
            ))}
        </nav>
    );
}

function AppCard({ app, idx }) {
    const { Icon } = app;
    return (
        <div className="hd-card" style={{ animationDelay: `${idx * 60}ms` }}>
            <div className="hd-card__head">
                <div className="hd-card__icon"><Icon /></div>
                <span className="hd-card__title">{app.title}</span>
                <button className="hd-card__bm"><BookmarkIcon /></button>
            </div>
            <div className="hd-card__desc">{app.desc}</div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════
export default function HomePage() {
    const [q, setQ] = useState("");
    return (
        <>
            <style>{S}</style>
            <div className="hd-lay">
                <DarkSidebar />
                <div className="hd-main">
                    <div className="hd-ct">
                        <div className="hd-greeting">
                            <h1 className="hd-greeting__title">おかえりなさい 👋</h1>
                            <p className="hd-greeting__sub">今日も一日、自分らしく過ごしましょう。</p>
                        </div>
                        <div className="hd-sr">
                            <div className="hd-si">
                                <SearchIcon size={20} color="#666" />
                                <input type="text" placeholder="アプリを探す..." value={q} onChange={e => setQ(e.target.value)} />
                            </div>
                            <button className="hd-buddy">
                                <img src="/buddy.png" alt="Buggy" width={32} height={32} style={{ borderRadius: "50%" }} />
                                <span>Buggy</span>
                                <RightArrowIcon size={20} color="#666" />
                            </button>
                        </div>
                        <section className="hd-sec">
                            <h2>お気に入り</h2>
                            <div className="hd-grid">{RECENT_APPS.map((a, i) => <AppCard key={a.id} app={a} idx={i} />)}</div>
                        </section>
                        <section className="hd-sec">
                            <h2>日常のおとも</h2>
                            <div className="hd-grid">{HR_APPS.map((a, i) => <AppCard key={a.id} app={a} idx={i + RECENT_APPS.length} />)}</div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}

// ═══════════════════════════════════════════════════
// CSS — includes header dark override (only active when HomePage mounted)
// ═══════════════════════════════════════════════════
const S = `
/* ─── Header dark override (global, active only when this page is mounted) ─── */
.cydas-header{background:#141416 !important;border-bottom:1px solid #2a2a2e !important;box-shadow:none !important}
.gh{background-color:#141416 !important;border-bottom-color:#2a2a2e !important}
.gh-logo__img{filter:brightness(0) invert(1) opacity(.85)}
.gh-top-search{background:#222225 !important;border-color:#3a3a3e !important}
.gh-top-search:hover{border-color:#555 !important}
.gh-top-search__input{color:#888 !important}
.gh-icon-btn{background:#222225 !important;color:#888 !important}
.gh-icon-btn:hover{background:#2a2a30 !important;color:#ccc !important}
.gh-user-fullname{color:#ddd !important}
.gh-user-status__name{color:#888 !important}
.gh-user-status__dot{background:#c9a87c !important}
.gh-avatar__monogram{background:#4a6358 !important}
.gh-user-container{border-left-color:#2a2a2e !important}
.gh-badge{background:#c9a87c !important}
.gh-badge span{color:#141416 !important}
.gh-notification-menu__inner{background:#1e1e22 !important;color:#ccc !important}
.gh-notification-menu__title{color:#ddd !important}
.gh-notif-item{border-bottom-color:#2a2a2e !important}
.gh-notif-item:hover{background:#252528 !important}
.gh-notif-item__title{color:#ddd !important}
.gh-notif-item__desc{color:#888 !important}
.gh-module-menu{background:#1e1e22 !important;box-shadow:0 4px 24px rgba(0,0,0,.5) !important}
.gh-mm-header{color:#ddd !important}
.gh-mm-subtitle{color:#888 !important}
.gh-mm-item:hover{background:#2a2a30 !important}
.gh-mm-label{color:#ccc !important}
.gh-user-menu{background:#1e1e22 !important}
.gh-user-menu-block{border-bottom-color:#2a2a2e !important}
.gh-user-menu-block__title{color:#888 !important}
.gh-user-menu-item{color:#ccc !important}
.gh-user-menu-item:hover{background:#252528 !important}
.gh-search-container{background:#1e1e22 !important;border-color:#2a2a2e !important;box-shadow:0 4px 24px rgba(0,0,0,.5) !important}
.gh-search-box{background:#222225 !important}
.gh-search-box__input{color:#ddd !important}
.gh-search-header__back{color:#888 !important}
.gh-search-header__back:hover{background:#2a2a30 !important}
.gh-result-employee:hover{background:#2a2a30 !important}
.gh-result-employee__name{color:#ddd !important}
.gh-tooltip{background:#333 !important}

/* ─── Layout ─── */
.hd-lay{display:flex;min-height:calc(100vh - 64px)}
.hd-main{flex:1;background:#1a1a1e;min-width:0;overflow-y:auto}
.hd-ct{max-width:1200px;margin:0 auto;padding:32px 48px 64px}
@media(max-width:1023px){.hd-ct{padding:24px 24px 48px}}
@media(max-width:767px){.hd-ct{padding:16px 16px 32px}}

/* ─── Sidebar ─── */
.hd-sb{width:88px;min-width:88px;background:#141416;border-right:1px solid #2a2a2e;display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:2px;position:sticky;top:64px;height:calc(100vh - 64px);overflow-y:auto;z-index:5}
.hd-sb__main{display:flex;flex-direction:column;align-items:center;gap:2px}
.hd-sb__sep{width:44px;height:1px;background:#2a2a2e;margin:8px 0}
.hd-sb__item{width:64px;height:64px;border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;flex-shrink:0}
.hd-sb__item:hover{background:#252528}
.hd-sb__item.active{background:#2a2520}
@media(max-width:767px){.hd-sb{display:none}}

/* ─── Greeting ─── */
.hd-greeting{margin-bottom:28px;animation:hdFade .5s ease}
.hd-greeting__title{font-size:22px;font-weight:700;color:#e8e4df;margin-bottom:4px}
.hd-greeting__sub{font-size:14px;color:#777;line-height:1.6}

/* ─── Search ─── */
.hd-sr{display:flex;align-items:center;gap:24px;margin-bottom:40px;animation:hdFade .5s ease .1s both}
.hd-si{flex:1;display:flex;align-items:center;border:1px solid #333;border-radius:8px;padding:0 16px;height:48px;background:#222225;gap:12px;transition:border-color .2s,box-shadow .2s}
.hd-si:focus-within{border-color:#c9a87c;box-shadow:0 0 0 2px rgba(201,168,124,.15)}
.hd-si input{border:none;outline:none;background:none;font-size:14px;color:#ddd;width:100%;font-family:inherit}
.hd-si input::placeholder{color:#666}
.hd-buddy{display:flex;align-items:center;gap:8px;border:none;background:none;cursor:pointer;font-size:14px;font-weight:600;color:#bbb;padding:8px 4px;white-space:nowrap;flex-shrink:0;font-family:inherit}
.hd-buddy:hover{opacity:.7}
@media(max-width:767px){.hd-sr{flex-direction:column;gap:12px}.hd-buddy{align-self:flex-end}}

/* ─── Sections ─── */
.hd-sec{margin-bottom:40px}
.hd-sec h2{font-size:16px;font-weight:700;color:#ccc;margin-bottom:20px;line-height:1.5;animation:hdFade .4s ease}

/* ─── Grid ─── */
.hd-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
@media(max-width:1200px){.hd-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:900px){.hd-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:540px){.hd-grid{grid-template-columns:1fr}}

/* ─── Cards ─── */
.hd-card{border:1px solid #2a2a2e;border-radius:10px;padding:16px;background:#222225;cursor:pointer;display:flex;flex-direction:column;min-height:120px;
  animation:hdCardIn .4s ease both;
  transition:box-shadow .25s,border-color .25s,transform .25s}
.hd-card:hover{box-shadow:0 4px 24px rgba(0,0,0,.3);border-color:#3a3a3e;transform:translateY(-2px)}
.hd-card__head{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.hd-card__icon{width:32px;height:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.hd-card__title{font-size:15px;font-weight:700;color:#e0dcd6;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hd-card__bm{border:none;background:none;cursor:pointer;padding:2px;display:flex;opacity:.3;transition:opacity .2s;flex-shrink:0}
.hd-card__bm:hover{opacity:.7}
.hd-card__bm svg{stroke:#888}
.hd-card__desc{font-size:13px;color:#888;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}

/* ─── Animations ─── */
@keyframes hdFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes hdCardIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
`;
