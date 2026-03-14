import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { SearchIcon } from "./icons";

const STORAGE_KEY = "cydas-links";
const AVATAR_KEY = "cydas-link-avatars";
let _lid = Date.now();
function uid() { return _lid++; }

function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function save(l) { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)); }
function loadAvatars() { try { return JSON.parse(localStorage.getItem(AVATAR_KEY)) || []; } catch { return []; } }
function saveAvatars(a) { localStorage.setItem(AVATAR_KEY, JSON.stringify(a)); }
function addToGallery(dataUrl) {
    if (!dataUrl) return;
    const list = loadAvatars();
    if (list.includes(dataUrl)) return;
    list.unshift(dataUrl);
    if (list.length > 30) list.pop(); // max 30
    saveAvatars(list);
}

const DEFAULT_LINKS = [
    { id: 1, title: "GitHub", url: "https://github.com", avatar: null, color: "#333" },
    { id: 2, title: "Google", url: "https://google.com", avatar: null, color: "#4285f4" },
    { id: 3, title: "Stack Overflow", url: "https://stackoverflow.com", avatar: null, color: "#f48024" },
];

// ─── Icons ───
const LI = {
    Plus: ({ s = 16, c = "#fff" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    Edit: ({ s = 14, c = "#999" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    Trash: ({ s = 14, c = "#e53935" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    X: ({ s = 16, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    Link: ({ s = 20, c = "#7da08a" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
    External: ({ s = 12, c = "#999" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
    Image: ({ s = 16, c = "#999" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
};

const ACCENT_COLORS = ["#5d8a72", "#c9a87c", "#7ca8c6", "#b8869a", "#c4956a", "#8bb8a8", "#e07b9b", "#6BB8D6", "#333", "#f48024"];

function getDomain(url) {
    try { return new URL(url).hostname.replace("www.", ""); } catch { return ""; }
}

function getInitials(title) {
    return title.trim().slice(0, 2).toUpperCase();
}

// ─── Modal ───
function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="lk-overlay" onClick={onClose}>
            <div className="lk-modal" onClick={e => e.stopPropagation()}>
                <div className="lk-modal__head"><span>{title}</span><button className="lk-modal__close" onClick={onClose}><LI.X /></button></div>
                <div className="lk-modal__body">{children}</div>
            </div>
        </div>
    );
}

function Confirm({ open, onClose, onOk, msg }) {
    if (!open) return null;
    return (
        <div className="lk-overlay" onClick={onClose}>
            <div className="lk-modal lk-modal--sm" onClick={e => e.stopPropagation()}>
                <div className="lk-modal__body" style={{ padding: "24px 20px", textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: "#333", marginBottom: 20 }}>{msg}</p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                        <button className="lk-btn lk-btn--ghost" onClick={onClose}>キャンセル</button>
                        <button className="lk-btn lk-btn--danger" onClick={onOk}>削除</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Link Card ───
function LinkCard({ link, onEdit, onDelete }) {
    return (
        <div className="lk-card" onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}>
            <div className="lk-card__avatar" style={{ background: link.avatar ? "none" : (link.color || "#5d8a72") }}>
                {link.avatar ? (
                    <img src={link.avatar} alt="" />
                ) : (
                    <span>{getInitials(link.title)}</span>
                )}
            </div>
            <div className="lk-card__info">
                <span className="lk-card__title">{link.title}</span>
                <span className="lk-card__domain"><LI.External s={10} c="#bbb" /> {getDomain(link.url)}</span>
            </div>
            <div className="lk-card__actions">
                <button className="lk-card__btn" onClick={e => { e.stopPropagation(); onEdit(link); }} title="編集"><LI.Edit /></button>
                <button className="lk-card__btn lk-card__btn--del" onClick={e => { e.stopPropagation(); onDelete(link); }} title="削除"><LI.Trash /></button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════
export default function LinksPage() {
    const [links, setLinks] = useState(() => {
        const saved = load();
        return saved.length > 0 ? saved : DEFAULT_LINKS;
    });
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState({ title: "", url: "", color: "#5d8a72", avatar: null });
    const [delTarget, setDelTarget] = useState(null);
    const [gallery, setGallery] = useState(loadAvatars);
    const fileRef = useRef(null);

    useEffect(() => { save(links); }, [links]);

    const filtered = links.filter(l =>
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.url.toLowerCase().includes(search.toLowerCase())
    );

    const refreshGallery = () => setGallery(loadAvatars());

    const openCreate = () => {
        setEditTarget(null);
        setForm({ title: "", url: "", color: ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)], avatar: null });
        refreshGallery();
        setModalOpen(true);
    };
    const openEdit = (link) => {
        setEditTarget(link);
        setForm({ title: link.title, url: link.url, color: link.color || "#5d8a72", avatar: link.avatar });
        refreshGallery();
        setModalOpen(true);
    };
    const handleSave = () => {
        const title = form.title.trim() || getDomain(form.url) || "Untitled";
        const url = form.url.trim();
        if (!url) return;
        const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
        if (form.avatar) addToGallery(form.avatar);
        if (editTarget) {
            setLinks(prev => prev.map(l => l.id === editTarget.id ? { ...l, title, url: finalUrl, color: form.color, avatar: form.avatar } : l));
        } else {
            setLinks(prev => [...prev, { id: uid(), title, url: finalUrl, color: form.color, avatar: form.avatar }]);
        }
        setModalOpen(false);
    };
    const handleDelete = () => {
        if (delTarget) { setLinks(prev => prev.filter(l => l.id !== delTarget.id)); setDelTarget(null); }
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { setForm(f => ({ ...f, avatar: ev.target.result })); };
        reader.readAsDataURL(file);
    };
    const removeAvatar = () => { setForm(f => ({ ...f, avatar: null })); };
    const removeFromGallery = (dataUrl) => {
        const list = loadAvatars().filter(a => a !== dataUrl);
        saveAvatars(list);
        setGallery(list);
        if (form.avatar === dataUrl) setForm(f => ({ ...f, avatar: null }));
    };

    return (
        <>
            <style>{CSS}</style>
            <div className="hp-lay">
                <Sidebar activeId="" />
                <div className="hp-main">
                    <div className="lk-page">
                        <div className="lk-header">
                            <div className="lk-header__left">
                                <LI.Link s={26} />
                                <h1>リンク集</h1>
                            </div>
                            <button className="lk-btn lk-btn--primary" onClick={openCreate}>
                                <LI.Plus s={16} /> <span>追加</span>
                            </button>
                        </div>
                        <p className="lk-intro">よく使うリンクをまとめて管理。ワンクリックですぐアクセス。</p>

                        <div className="lk-search">
                            <SearchIcon size={16} color="#999" />
                            <input type="text" placeholder="検索..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>

                        {filtered.length > 0 ? (
                            <div className="lk-grid">
                                {filtered.map(l => (
                                    <LinkCard key={l.id} link={l} onEdit={openEdit} onDelete={setDelTarget} />
                                ))}
                                <div className="lk-card lk-card--add" onClick={openCreate}>
                                    <LI.Plus s={24} c="#bbb" />
                                    <span>リンクを追加</span>
                                </div>
                            </div>
                        ) : (
                            <div className="lk-empty">
                                <LI.Link s={40} c="#ddd" />
                                <p>リンクが見つかりません</p>
                                <button className="lk-btn lk-btn--primary" onClick={openCreate}>
                                    <LI.Plus s={16} /> <span>最初のリンクを追加</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create / Edit Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "リンクを編集" : "新しいリンク"}>
                <div className="lk-form">
                    {/* Avatar upload */}
                    <div className="lk-form__avatar-row">
                        <div className="lk-form__avatar" style={{ background: form.avatar ? "none" : form.color }} onClick={() => fileRef.current?.click()}>
                            {form.avatar ? <img src={form.avatar} alt="" /> : <LI.Image s={20} c="rgba(255,255,255,.6)" />}
                        </div>
                        <div className="lk-form__avatar-actions">
                            <button className="lk-btn lk-btn--ghost lk-btn--sm" onClick={() => fileRef.current?.click()}>画像を選択</button>
                            {form.avatar && <button className="lk-btn lk-btn--ghost lk-btn--sm" onClick={removeAvatar}>削除</button>}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
                    </div>

                    {/* Avatar gallery */}
                    {gallery.length > 0 && (
                        <div className="lk-form__gallery">
                            <label className="lk-form__label">使用済みアバター</label>
                            <div className="lk-form__gallery-grid">
                                {gallery.map((av, i) => (
                                    <div key={i} className={`lk-form__gallery-item ${form.avatar === av ? "is-sel" : ""}`}>
                                        <img src={av} alt="" onClick={() => setForm(f => ({ ...f, avatar: av }))} />
                                        <button className="lk-form__gallery-del" onClick={() => removeFromGallery(av)} title="ギャラリーから削除">
                                            <LI.X s={8} c="#fff" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <label className="lk-form__label">タイトル</label>
                    <input className="lk-form__input" type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="例: GitHub" />

                    <label className="lk-form__label">URL <span style={{ color: "#e53935" }}>*</span></label>
                    <input className="lk-form__input" type="text" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />

                    <label className="lk-form__label">アクセントカラー</label>
                    <div className="lk-form__colors">
                        {ACCENT_COLORS.map(c => (
                            <button key={c} className={`lk-form__color-dot ${form.color === c ? "is-sel" : ""}`} style={{ background: c }} onClick={() => setForm(f => ({ ...f, color: c }))} />
                        ))}
                    </div>

                    <div className="lk-form__actions">
                        <button className="lk-btn lk-btn--ghost" onClick={() => setModalOpen(false)}>キャンセル</button>
                        <button className="lk-btn lk-btn--primary" onClick={handleSave} disabled={!form.url.trim()}>
                            {editTarget ? "保存" : "追加"}
                        </button>
                    </div>
                </div>
            </Modal>

            <Confirm open={!!delTarget} onClose={() => setDelTarget(null)} onOk={handleDelete}
                msg={`「${delTarget?.title}」を削除しますか？`} />
        </>
    );
}

// ═══════════════════════════════════════════════════
const CSS = `
.hp-lay{display:flex;min-height:calc(100vh - 64px)}
.hp-main{flex:1;background:#fff;min-width:0;overflow-y:auto}
.lk-page{max-width:1000px;margin:0 auto;padding:32px 48px 64px}
@media(max-width:1023px){.lk-page{padding:24px 24px 48px}}
@media(max-width:767px){.lk-page{padding:16px 16px 32px}}

.lk-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.lk-header__left{display:flex;align-items:center;gap:10px}
.lk-header__left h1{font-size:20px;font-weight:700;color:#333;margin:0}
.lk-intro{font-size:13px;color:#999;margin-bottom:24px}

.lk-search{display:flex;align-items:center;gap:10px;border:1px solid #dcdcdc;border-radius:8px;padding:0 14px;height:40px;max-width:320px;margin-bottom:24px;background:#fff;transition:border-color .2s}
.lk-search:focus-within{border-color:#5d8a72;box-shadow:0 0 0 2px rgba(93,138,114,.1)}
.lk-search input{border:none;outline:none;background:none;font-size:13px;color:#333;width:100%;font-family:inherit}
.lk-search input::placeholder{color:#bbb}

/* Grid */
.lk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}

/* Card */
.lk-card{display:flex;align-items:center;gap:14px;padding:14px 16px;border:1px solid #e8e8e8;border-radius:10px;background:#fff;cursor:pointer;transition:box-shadow .2s,border-color .2s,transform .2s}
.lk-card:hover{box-shadow:0 2px 16px rgba(0,0,0,.06);border-color:#d0d0d0;transform:translateY(-1px)}

.lk-card__avatar{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
.lk-card__avatar span{color:#fff;font-size:15px;font-weight:700;letter-spacing:.5px}
.lk-card__avatar img{width:100%;height:100%;object-fit:cover}

.lk-card__info{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.lk-card__title{font-size:14px;font-weight:600;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lk-card__domain{font-size:11px;color:#bbb;display:flex;align-items:center;gap:4px}

.lk-card__actions{display:flex;gap:2px;flex-shrink:0;opacity:0;transition:opacity .15s}
.lk-card:hover .lk-card__actions{opacity:1}
.lk-card__btn{width:28px;height:28px;border:none;background:none;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.lk-card__btn:hover{background:#f0f2f5}
.lk-card__btn--del:hover{background:#fce4ec}

/* Add card */
.lk-card--add{border:2px dashed #dcdcdc;justify-content:center;gap:8px;min-height:72px;color:#bbb;font-size:13px;flex-direction:column;align-items:center}
.lk-card--add:hover{border-color:#5d8a72;background:#fafffe;color:#5d8a72;box-shadow:none;transform:none}

/* Empty */
.lk-empty{display:flex;flex-direction:column;align-items:center;padding:64px 24px;gap:14px}
.lk-empty p{font-size:14px;color:#999}

/* Buttons */
.lk-btn{display:inline-flex;align-items:center;gap:6px;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s}
.lk-btn:disabled{opacity:.4;cursor:not-allowed}
.lk-btn--sm{padding:5px 10px;font-size:12px}
.lk-btn--primary{background:#5d8a72;color:#fff}
.lk-btn--primary:hover:not(:disabled){background:#4a7560}
.lk-btn--ghost{background:#f0f2f5;color:#555}
.lk-btn--ghost:hover{background:#e4e6ea}
.lk-btn--danger{background:#e53935;color:#fff}
.lk-btn--danger:hover{background:#c62828}

/* Modal */
.lk-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:2000;display:flex;align-items:center;justify-content:center}
.lk-modal{background:#fff;border-radius:12px;width:440px;max-width:92vw;box-shadow:0 8px 32px rgba(0,0,0,.15);animation:lkFi .2s ease}
.lk-modal--sm{width:360px}
@keyframes lkFi{from{transform:scale(.96);opacity:0}to{transform:scale(1);opacity:1}}
.lk-modal__head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #eee;font-size:16px;font-weight:700;color:#333}
.lk-modal__close{width:32px;height:32px;border:none;background:transparent;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.lk-modal__close:hover{background:#f0f2f5}
.lk-modal__body{padding:20px}

/* Form */
.lk-form{display:flex;flex-direction:column;gap:12px}
.lk-form__label{font-size:12px;font-weight:600;color:#555;margin-bottom:-4px}
.lk-form__input{width:100%;border:1px solid #dcdcdc;border-radius:8px;padding:10px 14px;font-size:14px;font-family:inherit;color:#333;outline:none;transition:border-color .2s;box-sizing:border-box}
.lk-form__input:focus{border-color:#5d8a72;box-shadow:0 0 0 2px rgba(93,138,114,.1)}
.lk-form__input::placeholder{color:#bbb}

/* Avatar upload */
.lk-form__avatar-row{display:flex;align-items:center;gap:14px;margin-bottom:4px}
.lk-form__avatar{width:56px;height:56px;border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;overflow:hidden;transition:opacity .15s}
.lk-form__avatar:hover{opacity:.8}
.lk-form__avatar img{width:100%;height:100%;object-fit:cover}
.lk-form__avatar-actions{display:flex;flex-direction:column;gap:4px}

/* Gallery */
.lk-form__gallery{margin-top:-4px}
.lk-form__gallery-grid{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}
.lk-form__gallery-item{width:40px;height:40px;border-radius:8px;overflow:hidden;cursor:pointer;position:relative;border:2px solid transparent;transition:border-color .15s,transform .15s;flex-shrink:0}
.lk-form__gallery-item:hover{transform:scale(1.08)}
.lk-form__gallery-item.is-sel{border-color:#5d8a72;transform:scale(1.08)}
.lk-form__gallery-item img{width:100%;height:100%;object-fit:cover;display:block}
.lk-form__gallery-del{position:absolute;top:-2px;right:-2px;width:16px;height:16px;border:none;background:rgba(0,0,0,.5);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .15s}
.lk-form__gallery-item:hover .lk-form__gallery-del{opacity:1}
.lk-form__gallery-del:hover{background:rgba(229,57,53,.8)}

/* Color picker */
.lk-form__colors{display:flex;gap:8px;flex-wrap:wrap}
.lk-form__color-dot{width:24px;height:24px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:border-color .15s,transform .15s}
.lk-form__color-dot:hover{transform:scale(1.15)}
.lk-form__color-dot.is-sel{border-color:#333;transform:scale(1.15)}

.lk-form__actions{display:flex;justify-content:flex-end;gap:10px;margin-top:8px}
`;
