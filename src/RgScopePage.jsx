import React, { useState, useRef } from "react";
import Sidebar from "./Sidebar";

// ═══════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════
const EXCLUDE_PATTERNS = [/phpstan/i, /\.neon$/i, /router/i, /routes?\./i, /\.lock$/i, /vendor\//i, /node_modules\//i, /\.map$/i, /\.min\./i];

function parseRgOutput(rawOutput, sourceFile) {
    const lines = rawOutput.split("\n");
    const srcBase = sourceFile.split("/").pop().replace(/\.\w+$/, "");
    // Interface name: e.g. EmployeeSearchConditionQueryService → IEmployeeSearchConditionQueryService
    const interfaceName = "I" + srcBase;

    // Step 1: Group rg output into { filePath, contentLines[] }
    const groups = [];
    let currentFile = null;
    let currentContent = [];

    const flushGroup = () => {
        if (currentFile) {
            groups.push({ filePath: currentFile, contentLines: [...currentContent] });
        }
        currentContent = [];
    };

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        // Skip prompt lines
        if (/^[^\s]*[@%\$]\s/.test(trimmed)) continue;
        if (/^(rg|grep|find|cd|ls)\s/.test(trimmed)) continue;

        // Content line (e.g. "36:use People\Core\...")
        if (/^\d+[:]\s*/.test(trimmed)) {
            currentContent.push(trimmed.replace(/^\d+:\s*/, ""));
            continue;
        }

        // Skip non-path lines
        if (trimmed.startsWith("-") || trimmed.startsWith("#")) continue;

        // Check if it looks like a file path
        if (/\.(php|js|jsx|ts|tsx|vue|css|scss|html|twig|yaml|yml|json|xml|py|rb|go|java|kt|swift)$/i.test(trimmed)) {
            flushGroup();
            currentFile = trimmed;
        }
    }
    flushGroup();

    // Step 2: Filter groups
    const result = [];
    for (const g of groups) {
        const fp = g.filePath;
        const fpBase = fp.split("/").pop().replace(/\.\w+$/, "");

        // Skip excluded patterns (phpstan, neon, router, etc.)
        if (EXCLUDE_PATTERNS.some(p => p.test(fp))) continue;

        // Skip the source file itself
        const fpNorm = fp.replace(/^\/+/, "");
        const srcNorm = sourceFile.replace(/^\/+/, "");
        if (fpNorm === srcNorm) continue;
        if (fp.split("/").pop() === sourceFile.split("/").pop()) continue;

        // Skip interface files (basename starts with I + uppercase, e.g. IEmployeeService.php)
        if (/^I[A-Z]/.test(fpBase)) continue;

        // Skip files that only reference the interface, not the actual class
        // Check if content lines contain the interface name but NOT the actual class name alone
        if (g.contentLines.length > 0) {
            const hasDirectRef = g.contentLines.some(cl => {
                // Check if line references srcBase directly (not as part of interfaceName)
                // Remove interface references first, then check if srcBase still appears
                const withoutInterface = cl.replace(new RegExp(interfaceName, "g"), "");
                return withoutInterface.includes(srcBase);
            });
            const hasInterfaceRef = g.contentLines.some(cl => cl.includes(interfaceName));

            // If only interface references exist (no direct class reference), skip
            if (hasInterfaceRef && !hasDirectRef) continue;
        }

        result.push(fp);
    }
    return result;
}

function generateOutput(entries) {
    // Part 1: 修正対象
    let out = `h1. 修正した部分(FE)の影響範囲の確認\n\n\nh2. 修正対象（変更ファイル／変更点）\n\n\n`;
    for (const e of entries) {
        out += `* ${e.filePath}\n** 変更点（概要）：\n\n\n`;
    }
    out += `h2. 変更の主旨\n\n\nh2. 確認する方法\n\n変更ファイルを参照している箇所を確認し、改修箇所の利用有無／影響有無を判断する。\n影響があり得る場合は、さらにその参照元を辿り、影響範囲が収束するまで同様の手順を繰り返す。\n最終的に、当該画面／処理を利用している箇所に絞って影響範囲として整理する。\n\n\n`;

    // Part 2: 影響を受けるファイル
    entries.forEach((e, i) => {
        out += `h2. ${i + 1}. ${e.filePath}の変更の影響を受けるファイル\n\n`;
        if (e.affectedFiles.length === 0) {
            out += `\n* なし\n\n{{collapse(▾)\n}}\n\n`;
        } else {
            for (const af of e.affectedFiles) {
                out += `* ${af}\n\n{{collapse(▾)\n}}\n\n`;
            }
        }
    });

    return out;
}

// ═══════════════════════════════════════════════════
// Icons
// ═══════════════════════════════════════════════════
const IC = {
    Plus: ({ s = 16, c = "#fff" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    Trash: ({ s = 14, c = "#e53935" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    Edit: ({ s = 14, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    X: ({ s = 14, c = "#999" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    Copy: ({ s = 16, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
    Check: ({ s = 16, c = "#5d8a72" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    Down: ({ s = 14, c = "#666" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>,
    Scope: ({ s = 24, c = "#7da08a" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
};

// ═══════════════════════════════════════════════════
// STEP 1: Input cards
// ═══════════════════════════════════════════════════
let _cardId = 1;

function InputCard({ card, onChange, onDelete }) {
    return (
        <div className="rg-icard">
            <div className="rg-icard__head">
                <span className="rg-icard__num">ファイル {card.idx}</span>
                <button className="rg-icon-btn rg-icon-btn--del" onClick={onDelete} title="削除"><IC.Trash s={14} /></button>
            </div>
            <label className="rg-label">ファイルパス</label>
            <input
                className="rg-input"
                type="text"
                value={card.filePath}
                onChange={e => onChange({ ...card, filePath: e.target.value })}
                placeholder="app/Lib/people/Core/..."
            />
            <label className="rg-label">ripgrep 出力</label>
            <textarea
                className="rg-textarea rg-textarea--rg"
                value={card.rgOutput}
                onChange={e => onChange({ ...card, rgOutput: e.target.value })}
                placeholder="rg コマンドの出力をここに貼り付け..."
            />
        </div>
    );
}

// ═══════════════════════════════════════════════════
// STEP 2: Processed cards with editable affected files
// ═══════════════════════════════════════════════════
function ProcessedCard({ entry, onChange, onDelete }) {
    const [addingFile, setAddingFile] = useState("");
    const [editIdx, setEditIdx] = useState(-1);
    const [editVal, setEditVal] = useState("");

    const removeAf = (idx) => {
        onChange({ ...entry, affectedFiles: entry.affectedFiles.filter((_, i) => i !== idx) });
    };
    const addAf = () => {
        const v = addingFile.trim();
        if (!v) return;
        onChange({ ...entry, affectedFiles: [...entry.affectedFiles, v] });
        setAddingFile("");
    };
    const startEdit = (idx) => {
        setEditIdx(idx);
        setEditVal(entry.affectedFiles[idx]);
    };
    const saveEdit = () => {
        if (editIdx < 0) return;
        const v = editVal.trim();
        if (v) {
            const af = [...entry.affectedFiles];
            af[editIdx] = v;
            onChange({ ...entry, affectedFiles: af });
        }
        setEditIdx(-1);
    };

    return (
        <div className="rg-pcard">
            <div className="rg-pcard__head">
                <div className="rg-pcard__file">{entry.filePath}</div>
                <button className="rg-icon-btn rg-icon-btn--del" onClick={onDelete} title="削除"><IC.Trash s={14} /></button>
            </div>
            <div className="rg-pcard__label">影響を受けるファイル ({entry.affectedFiles.length})</div>
            <div className="rg-pcard__tags">
                {entry.affectedFiles.length === 0 && <span className="rg-pcard__empty">なし</span>}
                {entry.affectedFiles.map((af, i) => (
                    <div key={i} className="rg-tag">
                        {editIdx === i ? (
                            <div className="rg-tag__edit">
                                <input className="rg-tag__input" value={editVal} onChange={e => setEditVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditIdx(-1); }} autoFocus />
                                <button className="rg-tag__save" onClick={saveEdit}><IC.Check s={12} /></button>
                            </div>
                        ) : (
                            <>
                                <span className="rg-tag__text" title={af}>{af}</span>
                                <button className="rg-tag__btn" onClick={() => startEdit(i)} title="編集"><IC.Edit s={12} c="#999" /></button>
                                <button className="rg-tag__btn" onClick={() => removeAf(i)} title="削除"><IC.X s={12} /></button>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="rg-pcard__add">
                <input className="rg-input rg-input--sm" value={addingFile} onChange={e => setAddingFile(e.target.value)} placeholder="ファイルパスを追加..." onKeyDown={e => { if (e.key === "Enter") addAf(); }} />
                <button className="rg-btn rg-btn--ghost rg-btn--sm" onClick={addAf} disabled={!addingFile.trim()}>追加</button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════
export default function RgScopePage() {
    // Step 1: raw input
    const [cards, setCards] = useState([{ id: _cardId++, idx: 1, filePath: "", rgOutput: "" }]);
    // Step 2: processed entries
    const [entries, setEntries] = useState(null);
    // Step 3: final output
    const [output, setOutput] = useState(null);
    const [copied, setCopied] = useState(false);
    const outputRef = useRef(null);

    // Card CRUD
    const addCard = () => {
        setCards(prev => [...prev, { id: _cardId++, idx: prev.length + 1, filePath: "", rgOutput: "" }]);
    };
    const updateCard = (id, updated) => {
        setCards(prev => prev.map(c => c.id === id ? { ...updated, id } : c));
    };
    const deleteCard = (id) => {
        setCards(prev => {
            const next = prev.filter(c => c.id !== id);
            return next.map((c, i) => ({ ...c, idx: i + 1 }));
        });
    };

    // Step 1 → 2: Process rg output
    const handleProcess = () => {
        const processed = cards
            .filter(c => c.filePath.trim())
            .map(c => ({
                filePath: c.filePath.trim(),
                affectedFiles: parseRgOutput(c.rgOutput, c.filePath.trim()),
            }));
        setEntries(processed);
        setOutput(null);
    };

    // Step 2 entry CRUD
    const updateEntry = (idx, updated) => {
        setEntries(prev => prev.map((e, i) => i === idx ? updated : e));
    };
    const deleteEntry = (idx) => {
        setEntries(prev => prev.filter((_, i) => i !== idx));
    };

    // Step 2 → 3: Generate output
    const handleGenerate = () => {
        if (!entries || entries.length === 0) return;
        setOutput(generateOutput(entries));
        setCopied(false);
    };

    // Copy
    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            outputRef.current?.select();
            document.execCommand("copy");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Reset
    const handleReset = () => {
        setCards([{ id: _cardId++, idx: 1, filePath: "", rgOutput: "" }]);
        setEntries(null);
        setOutput(null);
    };

    return (
        <>
            <style>{CSS}</style>
            <div className="hp-lay">
                <Sidebar activeId="" />
                <div className="hp-main">
                    <div className="rg-page">
                        {/* Header */}
                        <div className="rg-header">
                            <IC.Scope s={28} />
                            <h1>影響範囲調査ツール</h1>
                        </div>
                        <p className="rg-intro">Redmine チケットの影響範囲を ripgrep の結果から自動生成します。</p>

                        {/* ═══ STEP 1 ═══ */}
                        <div className="rg-step">
                            <div className="rg-step__head">
                                <span className="rg-step__badge">1</span>
                                <span className="rg-step__title">ファイルと ripgrep 出力を入力</span>
                            </div>
                            <div className="rg-cards">
                                {cards.map(c => (
                                    <InputCard
                                        key={c.id}
                                        card={c}
                                        onChange={updated => updateCard(c.id, updated)}
                                        onDelete={() => deleteCard(c.id)}
                                    />
                                ))}
                            </div>
                            <button className="rg-btn rg-btn--ghost rg-add-btn" onClick={addCard}>
                                <IC.Plus s={14} c="#5d8a72" /> ファイルを追加
                            </button>
                            <button className="rg-btn rg-btn--primary rg-submit-btn" onClick={handleProcess} disabled={cards.every(c => !c.filePath.trim())}>
                                解析する
                            </button>
                        </div>

                        {/* ═══ STEP 2 ═══ */}
                        {entries && (
                            <div className="rg-step">
                                <div className="rg-step__head">
                                    <span className="rg-step__badge">2</span>
                                    <span className="rg-step__title">影響ファイルの確認・編集</span>
                                </div>
                                {entries.length === 0 ? (
                                    <div className="rg-empty">対象ファイルがありません</div>
                                ) : (
                                    <>
                                        <div className="rg-pcards">
                                            {entries.map((e, i) => (
                                                <ProcessedCard
                                                    key={i}
                                                    entry={e}
                                                    onChange={updated => updateEntry(i, updated)}
                                                    onDelete={() => deleteEntry(i)}
                                                />
                                            ))}
                                        </div>
                                        <button className="rg-btn rg-btn--primary rg-submit-btn" onClick={handleGenerate}>
                                            出力を生成
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ═══ STEP 3 ═══ */}
                        {output && (
                            <div className="rg-step">
                                <div className="rg-step__head">
                                    <span className="rg-step__badge">3</span>
                                    <span className="rg-step__title">出力結果</span>
                                    <button className={`rg-btn ${copied ? "rg-btn--copied" : "rg-btn--ghost"} rg-copy-btn`} onClick={handleCopy}>
                                        {copied ? <><IC.Check s={14} /> コピー済み</> : <><IC.Copy s={14} /> コピー</>}
                                    </button>
                                </div>
                                <textarea
                                    ref={outputRef}
                                    className="rg-output"
                                    value={output}
                                    readOnly
                                    onClick={e => e.target.select()}
                                />
                            </div>
                        )}

                        {/* Reset */}
                        {(entries || output) && (
                            <button className="rg-btn rg-btn--ghost rg-reset-btn" onClick={handleReset}>
                                リセット
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// ═══════════════════════════════════════════════════
// CSS
// ═══════════════════════════════════════════════════
const CSS = `
.hp-lay{display:flex;min-height:calc(100vh - 64px)}
.hp-main{flex:1;background:#fff;min-width:0;overflow-y:auto}
.rg-page{max-width:900px;margin:0 auto;padding:32px 48px 80px}
@media(max-width:1023px){.rg-page{padding:24px 24px 64px}}
@media(max-width:767px){.rg-page{padding:16px 16px 48px}}

.rg-header{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.rg-header h1{font-size:20px;font-weight:700;color:#333;margin:0}
.rg-intro{font-size:13px;color:#999;margin-bottom:28px;line-height:1.6}

/* Steps */
.rg-step{margin-bottom:32px;animation:rgFade .3s ease}
@keyframes rgFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.rg-step__head{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.rg-step__badge{width:24px;height:24px;border-radius:50%;background:#5d8a72;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.rg-step__title{font-size:15px;font-weight:700;color:#333;flex:1}

/* Input cards */
.rg-cards{display:flex;flex-direction:column;gap:12px;margin-bottom:12px}
.rg-icard{border:1px solid #e8e8e8;border-radius:10px;padding:16px;background:#fafbfc}
.rg-icard__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.rg-icard__num{font-size:12px;font-weight:600;color:#7da08a}

/* Processed cards */
.rg-pcards{display:flex;flex-direction:column;gap:12px;margin-bottom:16px}
.rg-pcard{border:1px solid #e8e8e8;border-radius:10px;padding:16px;background:#fafbfc}
.rg-pcard__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.rg-pcard__file{font-size:13px;font-weight:600;color:#333;font-family:"Fira Code","Consolas","Monaco","Courier New",monospace;word-break:break-all;flex:1;min-width:0}
.rg-pcard__label{font-size:11px;color:#999;font-weight:500;margin-bottom:8px}
.rg-pcard__tags{display:flex;flex-direction:column;gap:4px;margin-bottom:10px}
.rg-pcard__empty{font-size:13px;color:#ccc;padding:6px 0}
.rg-pcard__add{display:flex;gap:8px;align-items:center}

/* Tags */
.rg-tag{display:flex;align-items:center;gap:4px;padding:6px 10px;background:#fff;border:1px solid #e8e8e8;border-radius:6px;transition:border-color .15s}
.rg-tag:hover{border-color:#ccc}
.rg-tag__text{font-size:12px;color:#333;font-family:"Fira Code","Consolas","Monaco","Courier New",monospace;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rg-tag__btn{width:22px;height:22px;border:none;background:none;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background .15s;opacity:.5}
.rg-tag__btn:hover{background:#f0f2f5;opacity:1}
.rg-tag__edit{display:flex;gap:4px;flex:1;align-items:center}
.rg-tag__input{flex:1;border:1px solid #dcdcdc;border-radius:4px;padding:4px 8px;font-size:12px;font-family:"Fira Code","Consolas",monospace;color:#333;outline:none}
.rg-tag__input:focus{border-color:#5d8a72}
.rg-tag__save{width:22px;height:22px;border:none;background:#eaf4ee;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer}

/* Inputs */
.rg-label{display:block;font-size:12px;font-weight:600;color:#555;margin-bottom:4px}
.rg-input{width:100%;border:1px solid #dcdcdc;border-radius:6px;padding:8px 12px;font-size:13px;font-family:"Fira Code","Consolas","Monaco","Courier New",monospace;color:#333;outline:none;transition:border-color .2s;margin-bottom:10px;box-sizing:border-box}
.rg-input:focus{border-color:#5d8a72;box-shadow:0 0 0 2px rgba(93,138,114,.1)}
.rg-input::placeholder{color:#bbb;font-family:inherit}
.rg-input--sm{margin-bottom:0;padding:6px 10px;font-size:12px}
.rg-textarea{width:100%;border:1px solid #dcdcdc;border-radius:6px;padding:8px 12px;font-size:12px;font-family:"Fira Code","Consolas","Monaco","Courier New",monospace;color:#333;outline:none;resize:vertical;transition:border-color .2s;box-sizing:border-box;line-height:1.5}
.rg-textarea:focus{border-color:#5d8a72;box-shadow:0 0 0 2px rgba(93,138,114,.1)}
.rg-textarea::placeholder{color:#bbb}
.rg-textarea--rg{height:100px}

/* Output */
.rg-output{width:100%;min-height:300px;border:1px solid #e8e8e8;border-radius:8px;padding:16px;font-size:12px;font-family:"Fira Code","Consolas","Monaco","Courier New",monospace;color:#333;background:#fafbfc;outline:none;resize:vertical;line-height:1.6;cursor:text;box-sizing:border-box}

/* Buttons */
.rg-btn{display:inline-flex;align-items:center;gap:6px;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s,color .15s}
.rg-btn:disabled{opacity:.4;cursor:not-allowed}
.rg-btn--primary{background:#5d8a72;color:#fff}
.rg-btn--primary:hover:not(:disabled){background:#4a7560}
.rg-btn--ghost{background:#f0f2f5;color:#555}
.rg-btn--ghost:hover{background:#e4e6ea}
.rg-btn--sm{padding:5px 10px;font-size:12px}
.rg-btn--copied{background:#eaf4ee;color:#5d8a72}
.rg-icon-btn{width:28px;height:28px;border:none;background:none;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.rg-icon-btn:hover{background:#f0f2f5}
.rg-icon-btn--del:hover{background:#fce4ec}
.rg-add-btn{margin-bottom:12px;color:#5d8a72}
.rg-submit-btn{width:100%}
.rg-copy-btn{margin-left:auto;flex-shrink:0}
.rg-reset-btn{margin-top:8px}
.rg-empty{padding:16px;text-align:center;color:#ccc;font-size:13px}
`;
