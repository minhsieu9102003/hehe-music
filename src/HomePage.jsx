import React, { useState } from "react";
import Sidebar from "./Sidebar";
import {
    SearchIcon, RightArrowIcon, BookmarkIcon,
    IconNewspaper,
    IconHRReport, IconQualified, IconYen, IconYui, IconTime2, IconFAQCard,
} from "./icons";

const RECENT_APPS = [
    { id: "hr-report", title: "HRレタード", desc: "チームの活動データをグラフで可視化。今週のハイライトをチェックしましょう。", Icon: IconHRReport },
    { id: "qualified", title: "ボブ情報", desc: "メンバーの基本情報やスキルセットを一覧で確認できます。", Icon: IconQualified },
    { id: "newsfeed", title: "ニュースリード", desc: "最新のお知らせやアップデート情報をタイムラインで確認。", Icon: () => <IconNewspaper color="#7da08a" /> },
    { id: "payslip", title: "お金明細", desc: "毎月の明細や履歴をいつでも確認できます。", Icon: IconYen },
    { id: "mochibe", title: "MochiMochi", desc: "日頃の「ありがとう」を気軽に送り合えるコミュニケーションツール。", Icon: IconYui },
];
const HR_APPS = [
    { id: "payslip2", title: "お金明細", desc: "明細や履歴をいつでもどこでも確認できます。", Icon: IconYen },
    { id: "attendance", title: "台湾状況", desc: "今日の記録をひと目で把握。バランスの取れた毎日を。", Icon: IconTime2 },
    { id: "my-attendance", title: "My 台湾", desc: "自分のペースを振り返って、より良いリズムを見つけましょう。", Icon: IconTime2 },
    { id: "hr-faq", title: "人事FAK", desc: "よくある質問から解決策を素早く見つけられます。困ったらまずここへ。", Icon: IconFAQCard },
];

function AppCard({ app, idx }) {
    const { Icon } = app;
    return (
        <div className="hp-card" style={{ animationDelay: `${idx * 60}ms` }}>
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
                        {/* Greeting */}
                        <div className="hp-greeting">
                            <h1 className="hp-greeting__title">おかえりなさい 👋</h1>
                            <p className="hp-greeting__sub">今日も一日、自分らしく過ごしましょう。</p>
                        </div>

                        <div className="hp-sr">
                            <div className="hp-si">
                                <SearchIcon size={20} color="#999" />
                                <input type="text" placeholder="アプリを探す..." value={q} onChange={e => setQ(e.target.value)} />
                            </div>
                            <button className="hp-buddy">
                                <img src="/buddy.png" alt="Buggy" width={32} height={32} style={{ borderRadius: "50%" }} />
                                <span>Buggy</span>
                                <RightArrowIcon size={20} color="#666" />
                            </button>
                        </div>

                        <section className="hp-sec">
                            <h2>よく使うアプリ</h2>
                            <div className="hp-grid">{RECENT_APPS.map((a, i) => <AppCard key={a.id} app={a} idx={i} />)}</div>
                        </section>
                        <section className="hp-sec">
                            <h2>暮らしに役立つツール</h2>
                            <div className="hp-grid">{HR_APPS.map((a, i) => <AppCard key={a.id} app={a} idx={i + RECENT_APPS.length} />)}</div>
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

/* Greeting */
.hp-greeting{margin-bottom:28px;animation:hpFadeIn .5s ease}
.hp-greeting__title{font-size:22px;font-weight:700;color:#333;margin-bottom:4px}
.hp-greeting__sub{font-size:14px;color:#999;line-height:1.6}

/* Search row */
.hp-sr{display:flex;align-items:center;gap:24px;margin-bottom:40px;animation:hpFadeIn .5s ease .1s both}
.hp-si{flex:1;display:flex;align-items:center;border:1px solid #dcdcdc;border-radius:8px;padding:0 16px;height:48px;background:#fff;gap:12px;transition:border-color .2s,box-shadow .2s}
.hp-si:focus-within{border-color:#5d8a72;box-shadow:0 0 0 2px rgba(93,138,114,.12)}
.hp-si input{border:none;outline:none;background:none;font-size:14px;color:#333;width:100%;font-family:inherit}
.hp-si input::placeholder{color:#999}
.hp-buddy{display:flex;align-items:center;gap:8px;border:none;background:none;cursor:pointer;font-size:14px;font-weight:600;color:#333;padding:8px 4px;white-space:nowrap;flex-shrink:0;font-family:inherit}
.hp-buddy:hover{opacity:.7}
@media(max-width:767px){.hp-sr{flex-direction:column;gap:12px}.hp-buddy{align-self:flex-end}}

/* Sections */
.hp-sec{margin-bottom:40px}
.hp-sec h2{font-size:16px;font-weight:700;color:#333;margin-bottom:20px;line-height:1.5;animation:hpFadeIn .4s ease}

/* Grid */
.hp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
@media(max-width:1200px){.hp-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:900px){.hp-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:540px){.hp-grid{grid-template-columns:1fr}}

/* Card with animation */
.hp-card{border:1px solid #e8e8e8;border-radius:10px;padding:16px;background:#fff;cursor:pointer;display:flex;flex-direction:column;min-height:120px;
  animation:hpCardIn .4s ease both;
  transition:box-shadow .25s,border-color .25s,transform .25s}
.hp-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.06);border-color:#d0d0d0;transform:translateY(-2px)}
.hp-card__head{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.hp-card__icon{width:32px;height:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.hp-card__title{font-size:15px;font-weight:700;color:#333;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hp-card__bm{border:none;background:none;cursor:pointer;padding:2px;display:flex;opacity:.4;transition:opacity .2s;flex-shrink:0}
.hp-card__bm:hover{opacity:1}
.hp-card__desc{font-size:13px;color:#888;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}

/* Animations */
@keyframes hpFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes hpCardIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
`;
