import React from "react";
import HomePage from "./HomePage";

export default function FakeLoadingPage() {
    return (
        <div style={{ position: "relative" }}>
            <HomePage />
            {/* Overlay chặn mọi tương tác */}
            <div style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(255,255,255,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "default",
            }}>
                <style>{`
          @keyframes fk-spin { to { transform: rotate(360deg); } }
          @keyframes fk-pulse { 0%,100% { opacity: .6; } 50% { opacity: 1; } }
        `}</style>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <svg width="40" height="40" viewBox="0 0 40 40" style={{ animation: "fk-spin 1s linear infinite" }}>
                        <circle cx="20" cy="20" r="16" fill="none" stroke="#e0e0e0" strokeWidth="3.5" />
                        <path d="M20 4a16 16 0 0 1 16 16" fill="none" stroke="#007bc3" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: 13, color: "#999", animation: "fk-pulse 1.5s ease-in-out infinite", fontFamily: "inherit" }}>
                        読み込み中...
                    </span>
                </div>
            </div>
        </div>
    );
}
