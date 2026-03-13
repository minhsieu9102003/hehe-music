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
                background: "rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "default",
            }}>
                <style>{`@keyframes fk-spin { to { transform: rotate(360deg); } }`}</style>
                <svg width="56" height="56" viewBox="0 0 56 56" style={{ animation: "fk-spin 1s linear infinite" }}>
                    <circle cx="28" cy="28" r="22" fill="none" stroke="#e0e0e0" strokeWidth="4" />
                    <path d="M28 6a22 22 0 0 1 22 22" fill="none" stroke="#007bc3" strokeWidth="4" strokeLinecap="round" />
                </svg>
            </div>
        </div>
    );
}
