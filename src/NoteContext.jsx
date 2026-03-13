import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "cydas-notes";
let _nid = Date.now();
export function nuid() { return _nid++; }

const NOTE_COLORS = ["#fff9c4", "#c8e6c9", "#bbdefb", "#f8bbd0", "#d1c4e9", "#ffe0b2", "#b2dfdb", "#ffffff"];
export { NOTE_COLORS };

function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function save(n) { localStorage.setItem(STORAGE_KEY, JSON.stringify(n)); }

const DEFAULT_NOTES = [
    { id: 1, title: "会議メモ", content: "<p>次回のスプリントプランニングについて</p><ul><li>バックログの優先順位を確認</li><li>見積もりの再確認</li></ul>", color: "#bbdefb", updatedAt: Date.now() - 3600000 },
    { id: 2, title: "アイデア", content: "<p><b>新機能の提案</b></p><p>ダッシュボードにグラフを追加する</p>", color: "#fff9c4", updatedAt: Date.now() - 7200000 },
    { id: 3, title: "TODO", content: "<p>□ コードレビュー</p><p>□ テスト作成</p><p>□ ドキュメント更新</p>", color: "#c8e6c9", updatedAt: Date.now() - 86400000 },
];

const NoteContext = createContext(null);
export function useNotes() { return useContext(NoteContext); }

export function NoteProvider({ children }) {
    const [notes, setNotes] = useState(() => {
        const saved = load();
        return saved.length > 0 ? saved : DEFAULT_NOTES;
    });
    const [activeNoteId, setActiveNoteId] = useState(null);
    const [miniNoteId, setMiniNoteId] = useState(null);

    useEffect(() => { save(notes); }, [notes]);

    const createNote = () => {
        const n = { id: nuid(), title: "新しいノート", content: "", color: "#ffffff", updatedAt: Date.now() };
        setNotes(prev => [n, ...prev]);
        return n;
    };
    const updateNote = (id, updates) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
    };
    const deleteNote = (id) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        if (activeNoteId === id) setActiveNoteId(null);
        if (miniNoteId === id) setMiniNoteId(null);
    };

    return (
        <NoteContext.Provider value={{
            notes, createNote, updateNote, deleteNote,
            activeNoteId, setActiveNoteId,
            miniNoteId, setMiniNoteId,
        }}>
            {children}
        </NoteContext.Provider>
    );
}
