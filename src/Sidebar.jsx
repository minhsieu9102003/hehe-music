import React, { useContext } from "react";
import { NavContext } from "./NavContext";
import {
    IconHome, IconNewspaper, IconUserCircle, IconAdvancedSearch,
    IconTalentSearch, IconOfficialChannel, IconTalentPool,
    IconFAQ, IconNote2, IconAgreement,
} from "./icons";

const SIDEBAR_MAIN = [
    { id: "home", Icon: IconHome, label: "ホーム", page: "home" },
    { id: "newspaper", Icon: IconNewspaper, label: "申請" },
    { id: "user-circle", Icon: IconUserCircle, label: "ボブ情報" },
    { id: "adv-search", Icon: IconAdvancedSearch, label: "詳細検索" },
    { id: "talent-search", Icon: IconTalentSearch, label: "タレント検索" },
    { id: "channel", Icon: IconOfficialChannel, label: "チャンネル" },
    { id: "talent-pool", Icon: IconTalentPool, label: "タレントプール" },
    { id: "faq", Icon: IconFAQ, label: "FAK" },
    { id: "note2", Icon: IconNote2, label: "ノート", page: "notes" },
];
const SIDEBAR_BOTTOM = [
    { id: "agreement", Icon: IconAgreement, label: "人事申請" },
];

export default function Sidebar({ activeId = "home" }) {
    const { go } = useContext(NavContext);

    const handleClick = (item) => {
        if (item.page) go(item.page);
    };

    return (
        <>
            <style>{sidebarStyles}</style>
            <nav className="hp-sb">
                <div className="hp-sb__main">
                    {SIDEBAR_MAIN.map((item) => {
                        const active = item.id === activeId;
                        return (
                            <div
                                key={item.id}
                                className={`hp-sb__item ${active ? "active" : ""}`}
                                onClick={() => handleClick(item)}
                                title={item.label}
                            >
                                <item.Icon color={active ? "#7da08a" : "#999"} size={32} />
                            </div>
                        );
                    })}
                </div>
                <div className="hp-sb__sep" />
                {SIDEBAR_BOTTOM.map((item) => {
                    const active = item.id === activeId;
                    return (
                        <div
                            key={item.id}
                            className={`hp-sb__item ${active ? "active" : ""}`}
                            onClick={() => handleClick(item)}
                            title={item.label}
                        >
                            <item.Icon color={active ? "#7da08a" : "#999"} size={32} />
                        </div>
                    );
                })}
            </nav>
        </>
    );
}

const sidebarStyles = `
.hp-sb{width:80px;min-width:80px;background:#fff;border-right:1px solid #e8e8e8;display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:2px;position:sticky;top:64px;height:calc(100vh - 64px);overflow-y:auto;z-index:5}
.hp-sb__main{display:flex;flex-direction:column;align-items:center;gap:2px}
.hp-sb__sep{width:36px;height:1px;background:#e0e0e0;margin:8px 0}
.hp-sb__item{width:64px;height:64px;border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;flex-shrink:0}
.hp-sb__item:hover{background:#f1f2f7}
.hp-sb__item.active{background:#eaf4ee}
@media(max-width:767px){.hp-sb{display:none}}
`;
