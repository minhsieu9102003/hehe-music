import React, { useState, useRef, useCallback, useEffect } from "react";
import Sidebar from "./Sidebar";
import { SearchIcon } from "./icons";
import { useNotes, NOTE_COLORS, nuid } from "./NoteContext";

// ─── Icons ───────────────────────────────
const NIcon = {
    Note: ({ s = 28, c = "#808CBA" }) => <svg width={s} height={s} viewBox="0 0 32 32" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7.75 8.75C6.50736 8.75 5.5 9.75736 5.5 11V24.25C5.5 25.4926 6.50736 26.5 7.75 26.5H21C22.2426 26.5 23.25 25.4926 23.25 24.25V17.625C23.25 17.2108 23.5858 16.875 24 16.875C24.4142 16.875 24.75 17.2108 24.75 17.625V24.25C24.75 26.3211 23.0711 28 21 28H7.75C5.67893 28 4 26.3211 4 24.25V11C4 8.92893 5.67893 7.25 7.75 7.25H14.375C14.7892 7.25 15.125 7.58579 15.125 8C15.125 8.41421 14.7892 8.75 14.375 8.75H7.75Z" fill={c} /><path fillRule="evenodd" clipRule="evenodd" d="M26.3182 8.94185L23.0581 5.68178L10.122 18.618L9.57862 22.4214L13.382 21.878L26.3182 8.94185ZM27.6892 9.6922C28.1036 9.27779 28.1036 8.60591 27.6892 8.19151L23.8085 4.3108C23.3941 3.8964 22.7222 3.8964 22.3078 4.3108L8.95787 17.6607C8.79552 17.8231 8.6902 18.0337 8.65773 18.261L8.01095 22.7885C7.9109 23.4888 8.51118 24.0891 9.2115 23.9891L13.739 23.3423C13.9663 23.3098 14.1769 23.2045 14.3393 23.0421L27.6892 9.6922Z" fill={c} /></svg>,
    Plus: ({ s = 20, c = "#fff" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    Edit: ({ s = 16, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    Trash: ({ s = 16, c = "#e53935" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    X: ({ s = 18, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    Bold: ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>,
    Italic: ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>,
    Underline: ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg>,
    Code: ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    Color: ({ s = 16, c = "#333" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="18" width="18" height="3" rx="1" fill={c} /><text x="12" y="15" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="sans-serif">A</text></svg>,
    Mini: ({ s = 16, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" /></svg>,
    Back: ({ s = 16, c = "#007bc3" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
};

// ─── Toolbar ─────────────────────────────
const TEXT_COLORS = ["#333333", "#e53935", "#007bc3", "#2e7d32", "#f57c00", "#7b1fa2", "#795548", "#999999"];

function RichToolbar({ editorRef }) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const exec = (cmd, val) => { document.execCommand(cmd, false, val); editorRef.current?.focus(); };

    return (
        <div className="nt-toolbar">
            <button className="nt-tb-btn" onClick={() => exec("bold")} title="太字"><NIcon.Bold /></button>
            <button className="nt-tb-btn" onClick={() => exec("italic")} title="斜体"><NIcon.Italic /></button>
            <button className="nt-tb-btn" onClick={() => exec("underline")} title="下線"><NIcon.Underline /></button>
            <div className="nt-tb-sep" />
            <div className="nt-tb-color-wrap">
                <button className="nt-tb-btn" onClick={() => setShowColorPicker(!showColorPicker)} title="文字色"><NIcon.Color /></button>
                {showColorPicker && (
                    <div className="nt-color-picker">
                        {TEXT_COLORS.map(c => (
                            <button key={c} className="nt-color-dot" style={{ background: c }} onClick={() => { exec("foreColor", c); setShowColorPicker(false); }} />
                        ))}
                    </div>
                )}
            </div>
            <div className="nt-tb-sep" />
            <button className="nt-tb-btn" onClick={() => {
                const sel = window.getSelection();
                if (!sel.rangeCount) return;
                const range = sel.getRangeAt(0);
                const code = document.createElement("code");
                code.className = "nt-code-inline";
                range.surroundContents(code);
                editorRef.current?.focus();
            }} title="インラインコード" style={{ fontFamily: "monospace", fontWeight: 700 }}>{"<>"}</button>
            <button className="nt-tb-btn" onClick={() => {
                exec("formatBlock", "pre");
                editorRef.current?.focus();
            }} title="コードブロック"><NIcon.Code /></button>
        </div>
    );
}

// ─── Note Card ───────────────────────────
function NoteCard({ note, isActive, onClick, onDelete }) {
    const preview = note.content?.replace(/<[^>]+>/g, "")?.slice(0, 80) || "空のノート";
    const date = new Date(note.updatedAt);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    return (
        <div className={`nt-card ${isActive ? "is-active" : ""}`} onClick={onClick}>
            <div className="nt-card__color" style={{ background: note.color || "#fff" }} />
            <div className="nt-card__body">
                <div className="nt-card__title">{note.title || "無題"}</div>
                <div className="nt-card__preview">{preview}</div>
                <div className="nt-card__meta">{dateStr}</div>
            </div>
            <button className="nt-card__del" onClick={e => { e.stopPropagation(); onDelete(note); }}>
                <NIcon.Trash s={14} c="#ccc" />
            </button>
        </div>
    );
}

// ─── Editor ──────────────────────────────
function NoteEditor({ note, onUpdate, onMini }) {
    const editorRef = useRef(null);
    const [title, setTitle] = useState(note.title);
    const [showBgPicker, setShowBgPicker] = useState(false);
    const titleTimeout = useRef(null);
    const contentTimeout = useRef(null);

    useEffect(() => {
        setTitle(note.title);
        if (editorRef.current && editorRef.current.innerHTML !== note.content) {
            editorRef.current.innerHTML = note.content || "";
        }
    }, [note.id]);

    const handleTitleChange = (val) => {
        setTitle(val);
        clearTimeout(titleTimeout.current);
        titleTimeout.current = setTimeout(() => onUpdate(note.id, { title: val }), 300);
    };

    const handleContentChange = () => {
        clearTimeout(contentTimeout.current);
        contentTimeout.current = setTimeout(() => {
            if (editorRef.current) onUpdate(note.id, { content: editorRef.current.innerHTML });
        }, 300);
    };

    return (
        <div className="nt-editor">
            <div className="nt-editor__head">
                <input
                    className="nt-editor__title"
                    value={title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="タイトル"
                />
                <div className="nt-editor__actions">
                    <div className="nt-bg-wrap">
                        <button className="nt-editor__btn" onClick={() => setShowBgPicker(!showBgPicker)} title="ノートの色">
                            <div className="nt-bg-preview" style={{ background: note.color || "#fff" }} />
                        </button>
                        {showBgPicker && (
                            <div className="nt-bg-picker">
                                {NOTE_COLORS.map(c => (
                                    <button key={c} className={`nt-bg-dot ${note.color === c ? "is-sel" : ""}`} style={{ background: c }} onClick={() => { onUpdate(note.id, { color: c }); setShowBgPicker(false); }} />
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="nt-editor__btn" onClick={() => onMini(note.id)} title="ミニウィンドウ">
                        <NIcon.Mini />
                    </button>
                </div>
            </div>
            <RichToolbar editorRef={editorRef} />
            <div
                ref={editorRef}
                className="nt-editor__content"
                contentEditable
                onInput={handleContentChange}
                suppressContentEditableWarning
            />
        </div>
    );
}

// ─── Confirm ─────────────────────────────
function Confirm({ open, onClose, onOk, msg }) {
    if (!open) return null;
    return (
        <div className="nt-modal-overlay" onClick={onClose}>
            <div className="nt-modal nt-modal--sm" onClick={e => e.stopPropagation()}>
                <div className="nt-modal__body">
                    <p>{msg}</p>
                    <div className="nt-modal__btns">
                        <button className="nt-btn nt-btn--ghost" onClick={onClose}>キャンセル</button>
                        <button className="nt-btn nt-btn--danger" onClick={onOk}>削除</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════
export default function NotePage() {
    const { notes, createNote, updateNote, deleteNote, activeNoteId, setActiveNoteId, setMiniNoteId } = useNotes();
    const [search, setSearch] = useState("");
    const [delTarget, setDelTarget] = useState(null);

    const filtered = notes.filter(n =>
        (n.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (n.content || "").replace(/<[^>]+>/g, "").toLowerCase().includes(search.toLowerCase())
    );

    const activeNote = notes.find(n => n.id === activeNoteId);

    const handleCreate = () => {
        const n = createNote();
        setActiveNoteId(n.id);
    };

    const handleDelete = () => {
        if (delTarget) { deleteNote(delTarget.id); setDelTarget(null); }
    };

    return (
        <>
            <style>{CSS}</style>
            <div className="hp-lay">
                <Sidebar activeId="note2" />
                <div className="hp-main">
                    <div className="nt-layout">
                        {/* Sidebar list */}
                        <div className="nt-sidebar">
                            <div className="nt-sidebar__head">
                                <NIcon.Note s={24} c="#808CBA" />
                                <h2>ノート</h2>
                                <button className="nt-btn nt-btn--primary nt-btn--sm" onClick={handleCreate}>
                                    <NIcon.Plus s={16} />
                                </button>
                            </div>
                            <div className="nt-sidebar__search">
                                <SearchIcon size={14} color="#999" />
                                <input type="text" placeholder="検索..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <div className="nt-sidebar__list">
                                {filtered.sort((a, b) => b.updatedAt - a.updatedAt).map(n => (
                                    <NoteCard
                                        key={n.id}
                                        note={n}
                                        isActive={n.id === activeNoteId}
                                        onClick={() => setActiveNoteId(n.id)}
                                        onDelete={setDelTarget}
                                    />
                                ))}
                                {filtered.length === 0 && (
                                    <div className="nt-sidebar__empty">ノートがありません</div>
                                )}
                            </div>
                        </div>
                        {/* Editor */}
                        <div className="nt-content">
                            {activeNote ? (
                                <NoteEditor
                                    key={activeNote.id}
                                    note={activeNote}
                                    onUpdate={updateNote}
                                    onMini={setMiniNoteId}
                                />
                            ) : (
                                <div className="nt-empty">
                                    <NIcon.Note s={48} c="#ddd" />
                                    <p>ノートを選択または作成してください</p>
                                    <button className="nt-btn nt-btn--primary" onClick={handleCreate}>
                                        <NIcon.Plus s={16} /> <span>新しいノート</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Confirm open={!!delTarget} onClose={() => setDelTarget(null)} onOk={handleDelete}
                msg={`「${delTarget?.title || "無題"}」を削除しますか？`} />
        </>
    );
}

// ═════════════════════════════════════════
// CSS
// ═════════════════════════════════════════
const CSS = `
.hp-lay{display:flex;min-height:calc(100vh - 64px)}
.hp-main{flex:1;background:#fff;min-width:0;overflow-y:auto}
.nt-layout{display:flex;height:calc(100vh - 64px)}
.nt-sidebar{width:300px;min-width:260px;border-right:1px solid #e8e8e8;display:flex;flex-direction:column;background:#fafbfc}
@media(max-width:900px){.nt-sidebar{width:240px;min-width:200px}}
@media(max-width:600px){.nt-layout{flex-direction:column}.nt-sidebar{width:100%;height:auto;max-height:40vh;border-right:none;border-bottom:1px solid #e8e8e8}}
.nt-sidebar__head{display:flex;align-items:center;gap:8px;padding:16px 16px 12px;flex-shrink:0}
.nt-sidebar__head h2{font-size:16px;font-weight:700;color:#333;flex:1;margin:0}
.nt-sidebar__search{display:flex;align-items:center;gap:8px;margin:0 12px 12px;padding:0 10px;height:32px;border:1px solid #e0e0e0;border-radius:6px;background:#fff}
.nt-sidebar__search input{border:none;outline:none;background:none;font-size:12px;color:#333;width:100%;font-family:inherit}
.nt-sidebar__search input::placeholder{color:#bbb}
.nt-sidebar__list{flex:1;overflow-y:auto;padding:0 8px 8px}
.nt-sidebar__empty{padding:24px;text-align:center;color:#bbb;font-size:13px}

/* Note card */
.nt-card{display:flex;align-items:stretch;border-radius:8px;cursor:pointer;transition:background .15s;margin-bottom:2px;position:relative}
.nt-card:hover{background:#f0f2f5}
.nt-card.is-active{background:#e7f1fd}
.nt-card__color{width:4px;border-radius:4px 0 0 4px;flex-shrink:0}
.nt-card__body{flex:1;padding:10px 12px;min-width:0}
.nt-card__title{font-size:13px;font-weight:600;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nt-card__preview{font-size:11px;color:#999;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px}
.nt-card__meta{font-size:10px;color:#bbb;margin-top:4px}
.nt-card__del{position:absolute;top:8px;right:6px;width:24px;height:24px;border:none;background:none;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .15s}
.nt-card:hover .nt-card__del{opacity:1}
.nt-card__del:hover{background:#fce4ec}

/* Editor */
.nt-content{flex:1;display:flex;flex-direction:column;min-width:0}
.nt-editor{display:flex;flex-direction:column;height:100%}
.nt-editor__head{display:flex;align-items:center;gap:8px;padding:16px 20px 8px}
.nt-editor__title{flex:1;border:none;outline:none;font-size:20px;font-weight:700;color:#333;font-family:inherit;background:none}
.nt-editor__title::placeholder{color:#ccc}
.nt-editor__actions{display:flex;gap:4px;flex-shrink:0}
.nt-editor__btn{width:32px;height:32px;border:none;background:none;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.nt-editor__btn:hover{background:#f0f2f5}
.nt-bg-wrap{position:relative}
.nt-bg-preview{width:18px;height:18px;border-radius:4px;border:1px solid #ddd}
.nt-bg-picker{position:absolute;top:36px;right:0;background:#fff;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.12);padding:8px;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;z-index:10}
.nt-bg-dot{width:28px;height:28px;border-radius:6px;border:2px solid transparent;cursor:pointer;transition:border-color .15s}
.nt-bg-dot:hover{border-color:#007bc3}
.nt-bg-dot.is-sel{border-color:#007bc3}

/* Toolbar */
.nt-toolbar{display:flex;align-items:center;gap:2px;padding:4px 16px;border-bottom:1px solid #eee;flex-shrink:0}
.nt-tb-btn{width:32px;height:32px;border:none;background:none;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#555;font-size:14px;transition:background .15s,color .15s}
.nt-tb-btn:hover{background:#f0f2f5;color:#333}
.nt-tb-sep{width:1px;height:20px;background:#e8e8e8;margin:0 4px}
.nt-tb-color-wrap{position:relative}
.nt-color-picker{position:absolute;top:36px;left:-20px;background:#fff;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.12);padding:8px;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;z-index:10}
.nt-color-dot{width:24px;height:24px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:border-color .15s}
.nt-color-dot:hover{border-color:#007bc3}

/* Content editable */
.nt-editor__content{flex:1;padding:16px 20px;outline:none;font-size:14px;color:#333;line-height:1.7;overflow-y:auto}
.nt-editor__content:empty::before{content:"ここに入力...";color:#ccc;pointer-events:none}
.nt-editor__content pre{background:#1e1e1e;color:#d4d4d4;padding:12px 16px;border-radius:8px;font-family:"Fira Code","Consolas","Monaco","Courier New",monospace;font-size:13px;line-height:1.6;overflow-x:auto;margin:8px 0;white-space:pre-wrap}
.nt-editor__content code.nt-code-inline{background:#f0f0f0;color:#e53935;padding:1px 6px;border-radius:4px;font-family:"Fira Code","Consolas","Monaco","Courier New",monospace;font-size:13px}
.nt-editor__content ul,.nt-editor__content ol{padding-left:24px}
.nt-editor__content blockquote{border-left:3px solid #007bc3;padding-left:12px;color:#666;margin:8px 0}

/* Empty state */
.nt-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px}
.nt-empty p{font-size:14px;color:#999}

/* Buttons */
.nt-btn{display:inline-flex;align-items:center;gap:6px;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s}
.nt-btn--sm{padding:6px 10px}
.nt-btn--primary{background:#007bc3;color:#fff}
.nt-btn--primary:hover{background:#0069a8}
.nt-btn--ghost{background:#f0f2f5;color:#333}
.nt-btn--ghost:hover{background:#e4e6ea}
.nt-btn--danger{background:#e53935;color:#fff}
.nt-btn--danger:hover{background:#c62828}

/* Modal */
.nt-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:2000;display:flex;align-items:center;justify-content:center}
.nt-modal{background:#fff;border-radius:12px;width:440px;max-width:92vw;box-shadow:0 8px 32px rgba(0,0,0,.15);animation:ntFi .2s ease}
.nt-modal--sm{width:360px}
@keyframes ntFi{from{transform:scale(.96);opacity:0}to{transform:scale(1);opacity:1}}
.nt-modal__body{padding:24px 20px;text-align:center}
.nt-modal__body p{font-size:14px;color:#333;margin-bottom:20px}
.nt-modal__btns{display:flex;gap:12px;justify-content:center}
`;
