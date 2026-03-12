import React, { useState } from "react";
import Sidebar from "./SideBar";
import {
    SearchIcon, RightArrowIcon, BookmarkIcon,
    IconNewspaper,
    IconHRReport, IconQualified, IconYen, IconYui, IconTime2, IconFAQCard,
} from "./icons";

const RECENT_APPS = [
    { id: "hr-report", title: "HRレポート", desc: "組織や人事データの可視化・分析レポートを確認できます。", Icon: IconHRReport },
    { id: "qualified", title: "社員情報", desc: "社員の様々な情報が登録されています。個人情報のため、閲覧できる範囲は限られています。", Icon: IconQualified },
    { id: "newsfeed", title: "ニュースフィード", desc: "主に会社からのお知らせが共有されます。", Icon: () => <IconNewspaper color="#808CBA" /> },
    { id: "payslip", title: "給与明細", desc: "給与明細や、賞与明細、源泉徴収票を確認できます。", Icon: IconYen },
    { id: "mochibe", title: "Mochibe", desc: "チームメンバーの活躍を見つけてメッセージを送信。部署の壁を越えて日頃の感謝を伝えましょう！", Icon: IconYui },
];
const HR_APPS = [
    { id: "payslip2", title: "給与明細", desc: "給与明細や、賞与明細、源泉徴収票を確認できます。", Icon: IconYen },
    { id: "attendance", title: "勤怠状況", desc: "自分の働いている時間をチェックしてください。働き方を意識していきましょう。", Icon: IconTime2 },
    { id: "my-attendance", title: "My 勤怠", desc: "自分の働いている時間をチェックしてください。働き方を意識していきましょう。", Icon: IconTime2 },
    { id: "hr-faq", title: "人事FAQ", desc: "人事部へのよくある問い合わせや、人事部への問い合わせ、システムマニュアルの確認ができます。", Icon: IconFAQCard },
];

function AppCard({ app }) {
    const { Icon } = app;
    return (
        <div className="hp-card">
            <div className="hp-card__head">
                <div className="hp-card__icon"><Icon /></div>
                <span className="hp-card__title">{app.title}</span>
                <button className="hp-card__bm"><BookmarkIcon /></button>
            </div>
            <div className="hp-card__desc">{app.desc}</div>
        </div>
    );
}

export default function HomePage() {
    const [q, setQ] = useState("");
    return (
        <>
            <style>{S}</style>
            <div className="hp-lay">
                <Sidebar activeId="home" />
                <div className="hp-main">
                    <div className="hp-ct">
                        <p className="hp-intro">社内向けの便利なコンテンツやアプリケーションを、すべて１か所で見つけられます。</p>
                        <div className="hp-sr">
                            <div className="hp-si">
                                <SearchIcon size={20} color="#999" />
                                <input type="text" placeholder="アプリケーションを探す" value={q} onChange={e => setQ(e.target.value)} />
                            </div>
                            <button className="hp-buddy">
                                <img src="/buddy.png" alt="Buddy" width={32} height={32} style={{ borderRadius: "50%" }} />
                                <span>Buddy</span>
                                <RightArrowIcon size={20} color="#666" />
                            </button>
                        </div>
                        <section className="hp-sec">
                            <h2>最近利用したアプリケーション</h2>
                            <div className="hp-grid">{RECENT_APPS.map(a => <AppCard key={a.id} app={a} />)}</div>
                        </section>
                        <section className="hp-sec">
                            <h2>人事申請、自己申告や給与明細、人事に関係する確認は</h2>
                            <div className="hp-grid">{HR_APPS.map(a => <AppCard key={a.id} app={a} />)}</div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}

const S = `
.hp-lay{display:flex;min-height:calc(100vh - 64px)}
.hp-main{flex:1;background:#fff;min-width:0;overflow-y:auto}
.hp-ct{max-width:1200px;margin:0 auto;padding:32px 48px 64px}
@media(max-width:1023px){.hp-ct{padding:24px 24px 48px}}
@media(max-width:767px){.hp-ct{padding:16px 16px 32px}}
.hp-intro{font-size:14px;color:#666;line-height:1.7;margin-bottom:24px}
.hp-sr{display:flex;align-items:center;gap:24px;margin-bottom:40px}
.hp-si{flex:1;display:flex;align-items:center;border:1px solid #dcdcdc;border-radius:8px;padding:0 16px;height:48px;background:#fff;gap:12px;transition:border-color .2s,box-shadow .2s}
.hp-si:focus-within{border-color:#007bc3;box-shadow:0 0 0 2px rgba(0,123,195,.12)}
.hp-si input{border:none;outline:none;background:none;font-size:14px;color:#333;width:100%;font-family:inherit}
.hp-si input::placeholder{color:#999}
.hp-buddy{display:flex;align-items:center;gap:8px;border:none;background:none;cursor:pointer;font-size:14px;font-weight:600;color:#333;padding:8px 4px;white-space:nowrap;flex-shrink:0;font-family:inherit}
.hp-buddy:hover{opacity:.7}
@media(max-width:767px){.hp-sr{flex-direction:column;gap:12px}.hp-buddy{align-self:flex-end}}
.hp-sec{margin-bottom:40px}
.hp-sec h2{font-size:16px;font-weight:700;color:#333;margin-bottom:20px;line-height:1.5}
.hp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
@media(max-width:1200px){.hp-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:900px){.hp-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:540px){.hp-grid{grid-template-columns:1fr}}
.hp-card{border:1px solid #e8e8e8;border-radius:8px;padding:16px;background:#fff;cursor:pointer;transition:box-shadow .2s,border-color .2s;display:flex;flex-direction:column;min-height:120px}
.hp-card:hover{box-shadow:0 2px 12px rgba(0,0,0,.08);border-color:#d0d0d0}
.hp-card__head{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.hp-card__icon{width:32px;height:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.hp-card__title{font-size:15px;font-weight:700;color:#333;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hp-card__bm{border:none;background:none;cursor:pointer;padding:2px;display:flex;opacity:.6;transition:opacity .15s;flex-shrink:0}
.hp-card__bm:hover{opacity:1}
.hp-card__desc{font-size:13px;color:#666;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
`;
