import React, { useState } from "react";
import MainPage from "./MainPage";
import HomePage from "./HomePage";
import PlaylistPage from "./PlaylistPage";
import { NavContext } from "./NavContext";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <NavContext.Provider value={{ page, go: setPage }}>
      <MainPage
        headerConfig={{
          isShowGlobalHeader: true,
          appLogo: { source: "/logo.png" },
          searchField: { isOpen: false },
          moduleMenu: {
            isOpen: false,
            primaryMenuLists: { title: "メインメニュー", menuItems: [{ name: "ホーム" }, { name: "社員情報" }, { name: "HRレポート" }] },
            secondaryMenuLists: { menuItems: [] },
            tertiaryMenuLists: { menuItems: [] },
            quaternaryMenuLists: { menuItems: [] },
            quinaryMenuLists: { menuItems: [] },
            senaryMenuLists: { menuItems: [] },
          },
          userMenu: {
            isOpen: false,
            avatar: {},
            menuBlocks: [{
              title: "片山 健太",
              items: [
                { id: "mypage", label: "マイページ", isTransition: true },
                { id: "setting", label: "設定", isTransition: true },
                { id: "/api/contact", label: "お問い合わせ", isTransition: false },
                { id: "logout", label: "ログアウト", isTransition: true },
              ],
            }],
          },
          companyLogo: { source: "" },
        }}
        myaccount={{
          fullName: "片山 健太",
          avatarText: "片健",
          attendanceStatus: { attendanceStatus: "in", attendanceStatusName: "出勤" },
        }}
        simpleSearch={true}
        notification={true}
        notificationsCount={2}
        onNavigate={setPage}
        notifications={[{
          items: [
            { id: 1, title: "目標提出期限", description: "2026/03/15 までに提出してください" },
            { id: 2, title: "1on1リマインダー", description: "明日 14:00 に面談があります" },
          ],
        }]}
      >
        {page === "playlist" ? <PlaylistPage /> : <HomePage />}
      </MainPage>
    </NavContext.Provider>
  );
}
