import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    CydasLogo,
    SearchIcon,
    BellIcon,
    UserIcon,
    ArrowLeftIcon as ChevronLeftIcon,
    GridIcon,
    ChatIcon,
    HamburgerIcon,
    CloseIcon,
} from "./icons";
import GlobalHeader from "./GlobalHeader";

// ============================================================
// CYDAS People — MainPage Layout (React UI Clone)
// ============================================================
// Đây là bản sao UI của MainPage.vue, chỉ tái tạo giao diện.
// Các component con (GlobalHeader, GlobalFooter, ShareMenu, v.v.)
// được stub lại dưới dạng placeholder để sau này thay thế dần.
// ============================================================

// --------------- Constants (mirror share/constants) ---------------
const ALLOW_DISPLAY_GLOBAL_FOOTER = [
    "/one-on-one",
    "/discovery",
    "/review",
    "/personal-profile",
    "/talent-search",
];
const ALLOW_DISPLAY_BUTTON_CHANNEL_MENU = ["/one-on-one", "/discovery"];
const ALLOW_CHANGE_GLOBAL_HEADER_DISCOVERY = ["/discovery"];
const ALLOW_CHANGE_GLOBAL_HEADER_NOTE = ["/note"];

// --------------- Stub child components ---------------
// Sau này bạn sẽ thay thế từng component bằng bản React đầy đủ.

function HeaderDiscovery({ config, onSelectUserMenu, onChangeUserMenuIsOpen }) {
    return (
        <div className="header-discovery-stub">
            <div className="header-discovery-inner">
                <span className="discovery-logo">CYDAS</span>
                <span className="discovery-label">Discovery</span>
                <div className="header-right-actions">
                    <HeaderUserMenuButton
                        onToggle={onChangeUserMenuIsOpen}
                        onSelect={onSelectUserMenu}
                    />
                </div>
            </div>
        </div>
    );
}

function HeaderHistoryVersion3({
    config,
    onChangeUserMenuIsOpen,
    onSelectUserMenu,
}) {
    return (
        <div className="header-history-v3-stub">
            <button className="back-btn" title="戻る">
                <ChevronLeftIcon />
            </button>
            <span className="history-title">1on1 履歴 (v3)</span>
            <div className="header-right-actions">
                <HeaderUserMenuButton
                    onToggle={onChangeUserMenuIsOpen}
                    onSelect={onSelectUserMenu}
                />
            </div>
        </div>
    );
}

function HeaderHistory({ config, onChangeUserMenuIsOpen, onSelectUserMenu }) {
    return (
        <div className="header-history-stub">
            <button className="back-btn" title="戻る">
                <ChevronLeftIcon />
            </button>
            <span className="history-title">1on1 履歴</span>
            <div className="header-right-actions">
                <HeaderUserMenuButton
                    onToggle={onChangeUserMenuIsOpen}
                    onSelect={onSelectUserMenu}
                />
            </div>
        </div>
    );
}

function GlobalFooter({
    config,
    menuList,
    notificationsCount,
    isOpenNotificationMenu,
    isOpenChannelMenu,
    isOpenSideMenu,
    isShowButtonChannelMenu,
    onChangeNotificationMenuIsOpen,
    onClickNotificationItem,
    onChangeChannelMenuOpen,
    onChangeSideMenuOpen,
    onToggleModuleMenu,
    onToggleGlobalMenu,
}) {
    return (
        <div className="global-footer-stub">
            <button className="footer-btn" onClick={onToggleModuleMenu}>
                <GridIcon />
                <span>メニュー</span>
            </button>
            <button
                className="footer-btn"
                onClick={() => onChangeNotificationMenuIsOpen?.(!isOpenNotificationMenu)}
            >
                <BellIcon size={20} />
                {notificationsCount > 0 && (
                    <span className="footer-badge">{notificationsCount}</span>
                )}
                <span>通知</span>
            </button>
            {isShowButtonChannelMenu && (
                <button
                    className="footer-btn"
                    onClick={() => onChangeChannelMenuOpen?.(!isOpenChannelMenu)}
                >
                    <ChatIcon />
                    <span>チャンネル</span>
                </button>
            )}
            <button className="footer-btn" onClick={onToggleGlobalMenu}>
                <HamburgerIcon />
                <span>その他</span>
            </button>
        </div>
    );
}

function ShareMenu({ isOpenGlobalMenu, isOpenModuleMenu, menuList, onClose }) {
    return (
        <div className="share-menu-overlay" onClick={onClose}>
            <div className="share-menu-panel" onClick={(e) => e.stopPropagation()}>
                <div className="share-menu-header">
                    <span>{isOpenGlobalMenu ? "メインメニュー" : "モジュールメニュー"}</span>
                    <button className="close-btn" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="share-menu-body">
                    {(menuList || []).map((item, i) => (
                        <div key={i} className="menu-item">
                            <span>{item.label || item.name || `メニュー ${i + 1}`}</span>
                        </div>
                    ))}
                    {(!menuList || menuList.length === 0) && (
                        <div className="menu-empty">メニュー項目なし</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ModalContact({ onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-contact-panel" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span>お問い合わせ</span>
                    <button className="close-btn" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    <p>お問い合わせフォーム (stub)</p>
                </div>
            </div>
        </div>
    );
}

function ModalDeleteContact() {
    return (
        <div className="modal-overlay">
            <div className="modal-delete-panel">
                <p>連絡先を削除しますか？ (stub)</p>
            </div>
        </div>
    );
}


function HeaderUserMenuButton({ onToggle, onSelect }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="user-menu-wrapper">
            <button
                className="action-btn user-btn"
                onClick={() => {
                    setOpen(!open);
                    onToggle?.(!open);
                }}
            >
                <UserIcon />
            </button>
            {open && (
                <div className="user-dropdown">
                    {[
                        { id: "mypage", label: "マイページ", isTransition: true },
                        { id: "setting", label: "設定", isTransition: true },
                        { id: "/api/contact", label: "お問い合わせ", isTransition: false },
                        { id: "logout", label: "ログアウト", isTransition: true },
                    ].map((item) => (
                        <div
                            key={item.id}
                            className="user-dropdown-item"
                            onClick={() => {
                                onSelect?.(item);
                                setOpen(false);
                                onToggle?.(false);
                            }}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --------------- useMediaQuery hook ---------------
function useMediaQuery(query) {
    const [matches, setMatches] = useState(() =>
        typeof window !== "undefined" ? window.matchMedia(query).matches : false
    );
    useEffect(() => {
        const mql = window.matchMedia(query);
        const handler = (e) => setMatches(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, [query]);
    return matches;
}

// ============================================================
// MainPage — chính
// ============================================================
export default function MainPage({
    // Props giả lập — trong thực tế sẽ đến từ store / context
    currentRoute = { name: "Home", meta: { basePathUrl: "" } },
    headerConfig = { isShowGlobalHeader: true, appLogo: { source: "" } },
    employees = [],
    notifications = [],
    notificationsCount = 0,
    menuList = [],
    pocket = false,
    simpleSearch = true,
    alertData = null,
    isLoadingSearch = false,
    modalContactOpen: externalModalContactOpen,
    modalDeleteOpen = false,
    myaccount = {},
    meta = { enableCreateChannel: false, enableChannelEntry: false },
    children,
}) {
    // --- state ---
    const [isOpenChannelMenu, setIsOpenChannelMenu] = useState(false);
    const [isOpenSideMenu, setIsOpenSideMenu] = useState(false);
    const [isOpenModuleMenu, setIsOpenModuleMenu] = useState(false);
    const [isOpenGlobalMenu, setIsOpenGlobalMenu] = useState(false);
    const [isOpenNotificationMenu, setIsOpenNotificationMenu] = useState(false);
    const [modalContactOpen, setModalContactOpen] = useState(
        externalModalContactOpen ?? false
    );

    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const isMobile = useMediaQuery("(max-width: 767px)");

    // --- derived (mirrors Vue computed) ---
    const currentBasePathUrl = currentRoute?.meta?.basePathUrl || "";

    const isShowHeaderDiscovery =
        ALLOW_CHANGE_GLOBAL_HEADER_DISCOVERY.includes(currentBasePathUrl);

    const isShowGlobalHeader = headerConfig?.isShowGlobalHeader ?? true;

    const isShowGlobalFooter =
        ALLOW_DISPLAY_GLOBAL_FOOTER.includes(currentBasePathUrl) && !isDesktop;

    const isShowButtonChannelMenu =
        ALLOW_DISPLAY_BUTTON_CHANNEL_MENU.includes(currentBasePathUrl) &&
        (meta.enableCreateChannel || meta.enableChannelEntry);

    const isHistoryPage = [
        "ReviewHistory",
        "ReviewHistoryMember",
        "ReviewMyHistory",
        "ReviewHistoryAdmin",
        "RoomMeet",
        "SummaryUserOneOnOneTalk",
        "RoomMeetAdmin",
        "ReferencePage",
        "ReferencePageAdmin",
        "RoomMeetTalkContent",
        "RoomMeetTalkContentVer1",
    ].includes(currentRoute?.name);

    const isHistoryPageVer3 = [
        "ReviewHistory",
        "ReviewHistoryMember",
        "ReviewMyHistory",
        "RoomMeet",
        "ReferencePage",
    ].includes(currentRoute?.name);

    const isVersion3 =
        typeof window !== "undefined" && localStorage.getItem("version") === "v3.0";

    // --- handlers ---
    const handleToggleModuleMenu = useCallback(() => {
        setIsOpenModuleMenu((prev) => !prev);
        setIsOpenGlobalMenu(false);
    }, []);

    const handleToggleGlobalMenu = useCallback(() => {
        setIsOpenGlobalMenu((prev) => !prev);
        setIsOpenModuleMenu(false);
    }, []);

    const handleCloseShareMenu = useCallback(() => {
        setIsOpenModuleMenu(false);
        setIsOpenGlobalMenu(false);
    }, []);

    // --- body scroll lock khi modal mở ---
    useEffect(() => {
        if (modalContactOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [modalContactOpen]);

    // --- render header nội bộ ---
    const renderHeader = () => {
        if (isShowHeaderDiscovery) {
            return (
                <div className="header-inner-discovery">
                    <HeaderDiscovery
                        config={headerConfig}
                        onSelectUserMenu={() => { }}
                        onChangeUserMenuIsOpen={() => { }}
                    />
                </div>
            );
        }

        if (isHistoryPageVer3 && isVersion3) {
            return (
                <div className="header-inner">
                    <HeaderHistoryVersion3
                        config={headerConfig}
                        onChangeUserMenuIsOpen={() => { }}
                        onSelectUserMenu={() => { }}
                    />
                </div>
            );
        }

        if (isHistoryPage) {
            return (
                <div className="header-inner">
                    <HeaderHistory
                        config={headerConfig}
                        onChangeUserMenuIsOpen={() => { }}
                        onSelectUserMenu={() => { }}
                    />
                </div>
            );
        }

        // Default: GlobalHeader
        return (
            <div className="header-inner">
                <GlobalHeader
                    className={!isShowGlobalFooter ? "non-footer" : ""}
                    config={headerConfig}
                    searchResultEmployees={employees}
                    notifications={notifications}
                    notificationsCount={notificationsCount}
                    isOpenNotificationMenu={isOpenNotificationMenu}
                    pocket={pocket}
                    simpleSearch={simpleSearch}
                    alertData={alertData}
                    isLoading={isLoadingSearch}
                    myaccount={myaccount}
                    onClickSearchResultEmployee={(id) =>
                        window.open(`/personal-profile/${id}`, "_blank")
                    }
                    onChangeModuleMenuIsOpen={() => { }}
                    onChangeUserMenuIsOpen={() => { }}
                    onChangeNotificationMenuIsOpen={setIsOpenNotificationMenu}
                    onChangeEmployeeSearchIsOpen={() => { }}
                    onSearchAdvanced={() => { }}
                    onSelectModuleMenu={() => { }}
                    onSelectUserMenu={(menu) => {
                        if (!menu.isTransition && menu.id.toLowerCase().includes("/api/contact")) {
                            setModalContactOpen(true);
                        }
                    }}
                    onSearchInput={() => { }}
                    onClickLogo={() => { }}
                    onClickNotificationItem={() => { }}
                />
            </div>
        );
    };

    return (
        <>
            <style>{`
        /* ==================== Reset & Base ==================== */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ==================== Layout: .main ==================== */
        .cydas-main {
          min-height: 100vh;
          font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
          color: #333;
          background: #f5f6f8;
        }

        /* ==================== Header (fixed 64px) ==================== */
        .cydas-header {
          width: 100%;
          position: fixed;
          top: 0;
          left: 0;
          height: 64px;
          background: #fff;
          border-bottom: 1px solid #dcdcdc;
          box-shadow: 0 0 8px rgba(102, 102, 102, 0.24);
          z-index: 10;
          display: flex;
          align-items: center;
        }
        .header-inner,
        .header-inner-discovery {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
        }
        .header-inner-discovery {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ==================== Content ==================== */
        .cydas-content {
          position: relative;
          z-index: 0;
          padding-top: 64px;
          min-height: calc(100vh - 64px);
        }
        .cydas-content.has-footer {
          padding-bottom: 52px;
        }

        /* ==================== Footer (mobile only) ==================== */
        .cydas-footer {
          display: none;
        }
        @media (max-width: 767px) {
          .cydas-footer {
            height: 52px;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #fff;
            z-index: 10;
            display: block;
            border-top: 1px solid #e0e0e0;
          }
        }

        /* ==================== GlobalHeader stub ==================== */
        .global-header-stub {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 16px;
        }
        .gh-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .logo-text {
          font-size: 16px;
          font-weight: 700;
          color: #0066CC;
          white-space: nowrap;
        }
        @media (max-width: 767px) {
          .logo-text { display: none; }
        }

        /* Search */
        .gh-search {
          flex: 1;
          max-width: 400px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f0f2f5;
          border-radius: 8px;
          padding: 6px 12px;
          position: relative;
          color: #888;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .gh-search.is-open {
          background: #fff;
          box-shadow: 0 0 0 2px #0066CC33;
        }
        .gh-search input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          width: 100%;
          color: #333;
          font-family: inherit;
        }
        .gh-search input::placeholder { color: #aaa; }
        .search-spinner {
          width: 16px; height: 16px;
          border: 2px solid #ddd;
          border-top-color: #0066CC;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .search-results-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0; right: 0;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          max-height: 320px;
          overflow-y: auto;
          z-index: 100;
        }
        .search-result-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .search-result-item:hover { background: #f5f7fa; }
        .emp-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: #e8ecf0;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          color: #999;
        }
        .emp-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .emp-info { display: flex; flex-direction: column; }
        .emp-name { font-size: 14px; font-weight: 500; color: #333; }
        .emp-dept { font-size: 12px; color: #888; }

        /* Actions */
        .gh-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: auto;
          flex-shrink: 0;
        }
        .action-btn {
          width: 40px; height: 40px;
          border: none;
          background: transparent;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #555;
          transition: background 0.15s, color 0.15s;
          position: relative;
        }
        .action-btn:hover { background: #f0f2f5; color: #333; }
        .action-btn.is-active { background: #e8f0fe; color: #0066CC; }
        .notification-badge {
          position: absolute;
          top: 4px; right: 4px;
          min-width: 18px; height: 18px;
          background: #e53935;
          color: #fff;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
          line-height: 1;
        }

        /* User dropdown */
        .user-menu-wrapper { position: relative; }
        .user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          min-width: 160px;
          z-index: 200;
          overflow: hidden;
        }
        .user-dropdown-item {
          padding: 10px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .user-dropdown-item:hover { background: #f5f7fa; }

        /* ==================== Header History stubs ==================== */
        .header-history-stub,
        .header-history-v3-stub {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
        }
        .back-btn {
          width: 36px; height: 36px;
          border: none;
          background: transparent;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #555;
          transition: background 0.15s;
        }
        .back-btn:hover { background: #f0f2f5; }
        .history-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        .header-right-actions { margin-left: auto; }

        /* Header Discovery stub */
        .header-discovery-stub {
          width: 100%;
          height: 100%;
        }
        .header-discovery-inner {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
        }
        .discovery-logo {
          font-size: 18px;
          font-weight: 800;
          color: #0066CC;
        }
        .discovery-label {
          font-size: 14px;
          color: #888;
          font-weight: 500;
        }

        /* ==================== Footer stub ==================== */
        .global-footer-stub {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0 8px;
        }
        .footer-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          border: none;
          background: none;
          color: #777;
          font-size: 10px;
          cursor: pointer;
          padding: 4px 8px;
          position: relative;
          font-family: inherit;
          transition: color 0.15s;
        }
        .footer-btn:hover { color: #0066CC; }
        .footer-badge {
          position: absolute;
          top: 0; right: 0;
          min-width: 16px; height: 16px;
          background: #e53935;
          color: #fff;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          padding: 0 3px;
        }

        /* ==================== ShareMenu ==================== */
        .share-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          z-index: 100;
          display: flex;
          justify-content: flex-end;
        }
        .share-menu-panel {
          width: 280px;
          max-width: 90vw;
          background: #fff;
          height: 100%;
          box-shadow: -4px 0 20px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s ease;
        }
        @keyframes slideInRight {
          from { transform: translateX(80px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .share-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid #eee;
          font-weight: 600;
          font-size: 15px;
        }
        .share-menu-body {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }
        .menu-item {
          padding: 12px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.15s;
        }
        .menu-item:hover { background: #f5f7fa; }
        .menu-empty {
          padding: 24px 16px;
          color: #aaa;
          text-align: center;
          font-size: 14px;
        }
        .close-btn {
          width: 32px; height: 32px;
          border: none;
          background: transparent;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #888;
          transition: background 0.15s;
        }
        .close-btn:hover { background: #f0f2f5; }

        /* ==================== Modals ==================== */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-contact-panel,
        .modal-delete-panel {
          background: #fff;
          border-radius: 12px;
          width: 480px;
          max-width: 90vw;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          animation: fadeScaleIn 0.25s ease;
        }
        @keyframes fadeScaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          font-weight: 600;
          font-size: 16px;
        }
        .modal-body {
          padding: 24px 20px;
          font-size: 14px;
          color: #555;
        }
        .modal-delete-panel {
          padding: 24px;
          text-align: center;
          font-size: 14px;
          color: #555;
        }

        /* ==================== Content placeholder ==================== */
        .content-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 64px - 52px);
          color: #bbb;
          font-size: 15px;
        }
      `}</style>

            <div className="cydas-main">
                {/* ---- Header ---- */}
                {isShowGlobalHeader && (
                    <header className="cydas-header">{renderHeader()}</header>
                )}

                {/* ---- Portal target for back button (placeholder) ---- */}
                <div id="portal-button-back" />

                {/* ---- Content (router-view equivalent) ---- */}
                <main
                    className={`cydas-content ${isShowGlobalFooter ? "has-footer" : ""}`}
                >
                    {children || (
                        <div className="content-placeholder">
                            &lt;router-view /&gt; — ここに各ページのコンポーネントが表示されます
                        </div>
                    )}
                </main>

                {/* ---- Share Menu ---- */}
                {(isOpenGlobalMenu || isOpenModuleMenu) && (
                    <ShareMenu
                        isOpenGlobalMenu={isOpenGlobalMenu}
                        isOpenModuleMenu={isOpenModuleMenu}
                        menuList={menuList}
                        onClose={handleCloseShareMenu}
                    />
                )}

                {/* ---- Footer (mobile) ---- */}
                {isShowGlobalFooter && (
                    <footer className="cydas-footer">
                        <GlobalFooter
                            config={headerConfig}
                            menuList={menuList}
                            notificationsCount={notificationsCount}
                            isOpenNotificationMenu={isOpenNotificationMenu}
                            isOpenChannelMenu={isOpenChannelMenu}
                            isOpenSideMenu={isOpenSideMenu}
                            isShowButtonChannelMenu={isShowButtonChannelMenu}
                            onChangeNotificationMenuIsOpen={setIsOpenNotificationMenu}
                            onClickNotificationItem={() => { }}
                            onChangeChannelMenuOpen={setIsOpenChannelMenu}
                            onChangeSideMenuOpen={setIsOpenSideMenu}
                            onToggleModuleMenu={handleToggleModuleMenu}
                            onToggleGlobalMenu={handleToggleGlobalMenu}
                        />
                    </footer>
                )}

                {/* ---- Modals ---- */}
                {modalContactOpen && (
                    <ModalContact onClose={() => setModalContactOpen(false)} />
                )}
                {modalDeleteOpen && <ModalDeleteContact />}
            </div>
        </>
    );
}
