import React, { useState, useRef, useCallback, useEffect, useContext } from "react";
import { useNotes, NOTE_COLORS } from "./NoteContext";
import { NavContext } from "./NavContext";

const TEXT_COLORS = ["#333333", "#e53935", "#5d8a72", "#2e7d32", "#f57c00", "#7b1fa2", "#795548", "#999999"];

const MI = {
    X: ({ s = 14, c = "#999" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    Max: ({ s = 14, c = "#5d8a72" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>,
    Bold: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>,
    Italic: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>,
    Underline: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg>,
    Code: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    Color: ({ s = 14, c = "#333" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="18" width="18" height="3" rx="1" fill={c} /><text x="12" y="15" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="sans-serif">A</text></svg>,
    Note: ({ s = 16, c = "#7da08a" }) => <svg width={s} height={s} viewBox="0 0 32 32" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7.75 8.75C6.50736 8.75 5.5 9.75736 5.5 11V24.25C5.5 25.4926 6.50736 26.5 7.75 26.5H21C22.2426 26.5 23.25 25.4926 23.25 24.25V17.625C23.25 17.2108 23.5858 16.875 24 16.875C24.4142 16.875 24.75 17.2108 24.75 17.625V24.25C24.75 26.3211 23.0711 28 21 28H7.75C5.67893 28 4 26.3211 4 24.25V11C4 8.92893 5.67893 7.25 7.75 7.25H14.375C14.7892 7.25 15.125 7.58579 15.125 8C15.125 8.41421 14.7892 8.75 14.375 8.75H7.75Z" fill={c} /><path fillRule="evenodd" clipRule="evenodd" d="M26.3182 8.94185L23.0581 5.68178L10.122 18.618L9.57862 22.4214L13.382 21.878L26.3182 8.94185Z" fill={c} /></svg>,
};

export default function MiniNote() {
    const { page, go } = useContext(NavContext);
    const { notes, updateNote, miniNoteId, setMiniNoteId, setActiveNoteId } = useNotes();
    const note = notes.find(n => n.id === miniNoteId);

    const [pos, setPos] = useState({ x: 60, y: 60 });
    const [size, setSize] = useState({ w: 340, h: 320 });
    const editorRef = useRef(null);
    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });
    const saveTimeout = useRef(null);
    const [showColorPicker, setShowColorPicker] = useState(false);

    useEffect(() => {
        if (note && editorRef.current && editorRef.current.innerHTML !== note.content) {
            editorRef.current.innerHTML = note.content || "";
        }
    }, [miniNoteId]);

    const onMouseDown = useCallback((e) => {
        if (e.target.closest("button, input, [contenteditable]")) return;
        dragging.current = true;
        offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        const onMouseMove = (e) => {
            if (!dragging.current) return;
            setPos({
                x: Math.max(0, Math.min(window.innerWidth - size.w, e.clientX - offset.current.x)),
                y: Math.max(0, Math.min(window.innerHeight - size.h, e.clientY - offset.current.y)),
            });
        };
        const onMouseUp = () => {
            dragging.current = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }, [pos, size]);

    const exec = (cmd, val) => { document.execCommand(cmd, false, val); editorRef.current?.focus(); };
    const handleInput = () => {
        clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
            if (editorRef.current && note) updateNote(note.id, { content: editorRef.current.innerHTML });
        }, 300);
    };

    const goToNote = () => {
        setActiveNoteId(miniNoteId);
        setMiniNoteId(null);
        go("notes");
    };

    if (!note || page === "notes") return null;

    return (
        <>
            <style>{MCSS}</style>
            <div className="mn" style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }} onMouseDown={onMouseDown}>
                {/* Header */}
                <div className="mn__head" style={{ background: note.color || "#fff" }}>
                    <MI.Note s={14} c="#7da08a" />
                    <span className="mn__title">{note.title || "ç„¡é¡Œ"}</span>
                    <button className="mn__hbtn" onClick={goToNote} title="ãƒŽãƒ¼ãƒˆãƒšãƒ¼ã‚¸ã¸"><MI.Max /></button>
                    <button className="mn__hbtn" onClick={() => setMiniNoteId(null)} title="é–‰ã˜ã‚‹"><MI.X /></button>
                </div>
                {/* Mini toolbar */}
                <div className="mn__toolbar">
                    <button className="mn__tbtn" onClick={() => exec("bold")}><MI.Bold /></button>
                    <button className="mn__tbtn" onClick={() => exec("italic")}><MI.Italic /></button>
                    <button className="mn__tbtn" onClick={() => exec("underline")}><MI.Underline /></button>
                    <div className="mn__tsep" />
                    <div style={{ position: "relative" }}>
                        <button className="mn__tbtn" onClick={() => setShowColorPicker(!showColorPicker)}><MI.Color /></button>
                        {showColorPicker && (
                            <div className="mn__cpick">
                                {TEXT_COLORS.map(c => <button key={c} className="mn__cdot" style={{ background: c }} onClick={() => { exec("foreColor", c); setShowColorPicker(false); }} />)}
                            </div>
                        )}
                    </div>
                    <button className="mn__tbtn" onClick={() => exec("formatBlock", "pre")}><MI.Code /></button>
                </div>
                {/* Editor */}
                <div ref={editorRef} className="mn__editor" contentEditable onInput={handleInput} suppressContentEditableWarning style={{ background: note.color === "#ffffff" ? "#fff" : (note.color || "#fff") + "33" }} />
            </div>
        </>
    );
}

const MCSS = `
.mn{position:fixed;z-index:9998;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.15),0 1px 4px rgba(0,0,0,.1);cursor:grab;user-select:none;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif;display:flex;flex-direction:column;overflow:hidden}
.mn:active{cursor:grabbing}
.mn__head{display:flex;align-items:center;gap:6px;padding:8px 10px;flex-shrink:0;border-bottom:1px solid rgba(0,0,0,.06)}
.mn__title{flex:1;font-size:12px;font-weight:600;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mn__hbtn{width:22px;height:22px;border:none;background:none;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;flex-shrink:0}
.mn__hbtn:hover{background:rgba(0,0,0,.06)}
.mn__toolbar{display:flex;align-items:center;gap:1px;padding:3px 8px;border-bottom:1px solid #eee;flex-shrink:0}
.mn__tbtn{width:26px;height:26px;border:none;background:none;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#555;transition:background .15s}
.mn__tbtn:hover{background:#f0f2f5}
.mn__tsep{width:1px;height:16px;background:#e8e8e8;margin:0 3px}
.mn__cpick{position:absolute;top:30px;left:-10px;background:#fff;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);padding:6px;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;z-index:10}
.mn__cdot{width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer}
.mn__cdot:hover{border-color:#5d8a72}
.mn__editor{flex:1;padding:10px 12px;outline:none;font-size:13px;color:#333;line-height:1.6;overflow-y:auto;cursor:text}
.mn__editor:empty::before{content:"ãƒ¡ãƒ¢ã‚’å…¥åŠ›...";color:#ccc;pointer-events:none}
.mn__editor pre{background:#1e1e1e;color:#d4d4d4;padding:8px 12px;border-radius:6px;font-family:"Fira Code","Consolas","Monaco","Courier New",monospace;font-size:12px;line-height:1.5;overflow-x:auto;margin:6px 0;white-space:pre-wrap}
.mn__editor code{background:#f0f0f0;color:#e53935;padding:1px 4px;border-radius:3px;font-family:"Fira Code","Consolas","Monaco","Courier New",monospace;font-size:12px}
`;
