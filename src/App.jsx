import React, { useState } from "react";
import MainPage from "./MainPage";
import HomePage from "./HomePage";
import PlaylistPage from "./PlaylistPage";
import NotePage from "./NotePage";
import WeatherPage from "./WeatherPage";
import FakeLoadingPage from "./FakeLoadingPage";
import RgScopePage from "./RgScopePage";
import { NavContext } from "./NavContext";
import { PlayerProvider } from "./PlayerContext";
import { NoteProvider } from "./NoteContext";
import { WeatherProvider } from "./WeatherContext";
import MiniPlayer from "./MiniPlayer";
import MiniNote from "./MiniNote";
import MiniWeather from "./MiniWeather";

export default function App() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "playlist": return <PlaylistPage />;
      case "notes": return <NotePage />;
      case "weather": return <WeatherPage />;
      case "fake-loading": return <FakeLoadingPage />;
      case "rg-scope": return <RgScopePage />;
      default: return <HomePage />;
    }
  };

  return (
    <NavContext.Provider value={{ page, go: setPage }}>
      <PlayerProvider>
        <NoteProvider>
          <WeatherProvider>
            <MainPage
              headerConfig={{
                isShowGlobalHeader: true,
                appLogo: { source: "/logo.png" },
                searchField: { isOpen: false },
                moduleMenu: {
                  isOpen: false,
                  primaryMenuLists: { title: "メインメニュー", menuItems: [{ name: "ホーム" }, { name: "ボブ情報" }, { name: "HRレタード" }] },
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
                    title: "鈴木 大翔",
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
                fullName: "鈴木 大翔",
                avatarText: "鈴大",
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
              {renderPage()}
            </MainPage>
            <MiniPlayer />
            <MiniNote />
            <MiniWeather />
          </WeatherProvider>
        </NoteProvider>
      </PlayerProvider>
    </NavContext.Provider>
  );
}
