import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import {
    CydasLogo,
    SearchIcon as IconSearch,
    IconAdvancedSearch,
    ClockInIcon,
    BellIcon as IconBell,
    DotsNineIcon as IconDotsNine,
    ArrowLeftIcon as IconArrowLeft,
    CloseIcon as IconClose,
    SpinnerIcon as IconSpinner,
} from "./icons";
import { NavContext } from "./NavContext";
import { useWeather, weatherInfo } from "./WeatherContext";

// ============================================================
// CYDAS People — GlobalHeader (React UI Clone)
// ============================================================

// ─── useClickOutside hook ────────────────────────────────────
function useClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (e) => {
            if (!ref.current || ref.current.contains(e.target)) return;
            handler();
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}

// ─── useIsMobile hook ────────────────────────────────────────
function useIsMobile(breakpoint = 767) {
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== "undefined" && window.innerWidth <= breakpoint
    );
    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
        const handler = (e) => setIsMobile(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, [breakpoint]);
    return isMobile;
}

// ─── Sub-component stubs ─────────────────────────────────────

/** NotificationItems — danh sách thông báo trong dropdown */
function NotificationItems({ notifications, onClickItem }) {
    const allItems = (notifications || []).flatMap((group) => group.items || []);
    if (allItems.length === 0) {
        return <div className="gh-notif-empty">通知はありません</div>;
    }
    return (
        <div className="gh-notif-items">
            {allItems.map((item, i) => (
                <div
                    key={item.id || i}
                    className="gh-notif-item"
                    onClick={() => onClickItem?.(item)}
                >
                    <div className="gh-notif-item__title">{item.title || "通知"}</div>
                    <div className="gh-notif-item__desc">{item.description || ""}</div>
                </div>
            ))}
        </div>
    );
}

/** ModuleMenu — 9-dot grid menu dropdown (matches CYDAS admin menu) */
function MusicNoteIcon({ size = 32, color = "#999" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <path fillRule="evenodd" clipRule="evenodd"
                d="M22.5 5C22.5 4.72386 22.2761 4.5 22 4.5C21.7239 4.5 21.5 4.72386 21.5 5V22C21.5 22 21.5 22 21.5 22C21.5 24.4853 19.4853 26.5 17 26.5C14.5147 26.5 12.5 24.4853 12.5 22C12.5 19.5147 14.5147 17.5 17 17.5C18.3062 17.5 19.4817 18.0602 20.3 18.9529V5H22.5ZM20 22C20 20.3431 18.6569 19 17 19C15.3431 19 14 20.3431 14 22C14 23.6569 15.3431 25 17 25C18.6569 25 20 23.6569 20 22Z"
                fill={color} />
            <path d="M21.5 5V11.5L27 9.5V7L21.5 5Z" fill={color} opacity="0.6" />
        </svg>
    );
}

function NotepadIcon({ size = 32, color = "#999" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M9 4C7.34315 4 6 5.34315 6 7V25C6 26.6569 7.34315 28 9 28H23C24.6569 28 26 26.6569 26 25V7C26 5.34315 24.6569 4 23 4H9ZM7.5 7C7.5 6.17157 8.17157 5.5 9 5.5H23C23.8284 5.5 24.5 6.17157 24.5 7V25C24.5 25.8284 23.8284 26.5 23 26.5H9C8.17157 26.5 7.5 25.8284 7.5 25V7Z" fill={color} />
            <path d="M10 10.75C10 10.3358 10.3358 10 10.75 10H21.25C21.6642 10 22 10.3358 22 10.75C22 11.1642 21.6642 11.5 21.25 11.5H10.75C10.3358 11.5 10 11.1642 10 10.75Z" fill={color} />
            <path d="M10 14.75C10 14.3358 10.3358 14 10.75 14H21.25C21.6642 14 22 14.3358 22 14.75C22 15.1642 21.6642 15.5 21.25 15.5H10.75C10.3358 15.5 10 15.1642 10 14.75Z" fill={color} />
            <path d="M10 18.75C10 18.3358 10.3358 18 10.75 18H17.25C17.6642 18 18 18.3358 18 18.75C18 19.1642 17.6642 19.5 17.25 19.5H10.75C10.3358 19.5 10 19.1642 10 18.75Z" fill={color} />
        </svg>
    );
}

function ModuleMenu({ menuLists, onClickItem }) {
    const { go } = useContext(NavContext);
    const weather = useWeather();
    const wi = weather?.current ? weatherInfo(weather.current.weatherCode) : null;
    const temp = weather?.current ? Math.round(weather.current.temp) : null;
    return (
        <div className="gh-module-menu">
            <div className="gh-mm-header">管理者メニュー</div>
            <div className="gh-mm-subtitle">基本機能</div>
            <div className="gh-mm-grid">
                <div className="gh-mm-item" onClick={() => { go("playlist"); onClickItem?.({ name: "ポジション音楽" }); }}>
                    <div className="gh-mm-icon">
                        <MusicNoteIcon size={32} color="#999" />
                    </div>
                    <span className="gh-mm-label">ポジション音楽</span>
                </div>
                <div className="gh-mm-item" onClick={() => { go("notes"); onClickItem?.({ name: "ノート" }); }}>
                    <div className="gh-mm-icon">
                        <NotepadIcon size={32} color="#999" />
                    </div>
                    <span className="gh-mm-label">ノート</span>
                </div>
                <div className="gh-mm-item" onClick={() => { go("weather"); onClickItem?.({ name: "天気" }); }}>
                    <div className="gh-mm-icon" style={{ fontSize: 28, lineHeight: 1 }}>
                        {wi ? wi.icon : "🌤️"}
                    </div>
                    <span className="gh-mm-label">{temp !== null ? `天気 ${temp}°C` : "天気予報"}</span>
                </div>
            </div>
        </div>
    );
}

/** MyMenu — user dropdown menu */
function MyMenu({ menuBlocks, onClickItem }) {
    return (
        <div className="gh-user-menu">
            {(menuBlocks || []).map((block, bi) => (
                <div key={bi} className="gh-user-menu-block">
                    {block.title && (
                        <div className="gh-user-menu-block__title">{block.title}</div>
                    )}
                    {(block.items || []).map((item, ii) => (
                        <div
                            key={ii}
                            className="gh-user-menu-item"
                            onClick={() => onClickItem?.(item)}
                        >
                            {item.icon && <span className="gh-user-menu-item__icon">{item.icon}</span>}
                            <span>{item.label || item.name || item.id}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

// ─── MAIN: GlobalHeader ──────────────────────────────────────
export default function GlobalHeader({
    // props mirror Vue props
    config = {},
    searchResultEmployees = [],
    isOpenNotificationMenu = false,
    notifications = [],
    deleteNotificationFlag = false,
    notificationsCount = 0,
    needResetNotificationsInfiniteLoading = false,
    pocket = false,
    notification = true,
    simpleSearch = true,
    alertData = null,
    isLoading = false,
    // myaccount (from store in Vue, passed as prop here)
    myaccount = {},
    myAccountMeta = { appVersion: {} },
    avatarMap = new Map(),
    globalVersionClassName = "",
    appVersionClassName = "",
    // className forwarded from parent
    className = "",
    // event callbacks
    onClickSearchResultEmployee,
    onChangeModuleMenuIsOpen,
    onChangeUserMenuIsOpen,
    onChangeNotificationMenuIsOpen,
    onChangeEmployeeSearchIsOpen,
    onSearchAdvanced,
    onSelectModuleMenu,
    onSelectUserMenu,
    onSearchInput,
    onClickLogo,
    onClickNotificationItem,
    onNavigate,
}) {
    const isMobile = useIsMobile();

    // ── local state ──
    const [searchIsOpen, setSearchIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [moduleMenuOpen, setModuleMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifMenuOpen, setNotifMenuOpen] = useState(isOpenNotificationMenu);
    const [isShowTooltip, setIsShowTooltip] = useState(false);

    // sync controlled prop
    useEffect(() => {
        setNotifMenuOpen(isOpenNotificationMenu);
    }, [isOpenNotificationMenu]);

    // ── refs for click-outside ──
    const searchContainerRef = useRef(null);
    const notifRef = useRef(null);
    const moduleRef = useRef(null);
    const userRef = useRef(null);
    const searchInputRef = useRef(null);

    useClickOutside(searchContainerRef, () => closeSearch());
    useClickOutside(notifRef, () => {
        if (notifMenuOpen) {
            setNotifMenuOpen(false);
            onChangeNotificationMenuIsOpen?.(false);
        }
    });
    useClickOutside(moduleRef, () => {
        if (moduleMenuOpen) {
            setModuleMenuOpen(false);
            onChangeModuleMenuIsOpen?.(false);
        }
    });
    useClickOutside(userRef, () => {
        if (userMenuOpen) {
            setUserMenuOpen(false);
            onChangeUserMenuIsOpen?.(false);
        }
    });

    // ── derived ──
    const appLogo = config?.appLogo?.source || null;
    const hasCompanyLogo = !!(config?.companyLogo?.source);
    const moduleMenu = config?.moduleMenu || {};
    const hasModuleMenu = !!(
        moduleMenu.primaryMenuLists?.menuItems?.length ||
        moduleMenu.secondaryMenuLists?.menuItems?.length ||
        moduleMenu.tertiaryMenuLists?.menuItems?.length ||
        moduleMenu.quaternaryMenuLists?.menuItems?.length ||
        moduleMenu.quinaryMenuLists?.menuItems?.length ||
        moduleMenu.senaryMenuLists?.menuItems?.length
    );
    const userMenu = config?.userMenu || {};
    const notificationsCountHeader =
        notificationsCount >= 100 ? "99+" : notificationsCount;
    const lengthOfSearchEmployee = searchResultEmployees.length;

    // ── handlers ──
    const openSearch = useCallback(() => {
        setSearchIsOpen(true);
        onChangeEmployeeSearchIsOpen?.(true);
        setTimeout(() => searchInputRef.current?.focus(), 150);
    }, [onChangeEmployeeSearchIsOpen]);

    const closeSearch = useCallback(() => {
        if (searchIsOpen) {
            setSearchIsOpen(false);
            onChangeEmployeeSearchIsOpen?.(false);
        }
    }, [searchIsOpen, onChangeEmployeeSearchIsOpen]);

    const handleSearchInputChange = useCallback(
        (value) => {
            // regex from original: skip trailing whitespace chars
            const regex =
                /[\s\u200B\u3000\uFEFF\u202F\u2009\u200A\u2007\u2008\u205F\u2000-\u2006]$/;
            setSearchValue(value);
            if (!regex.test(value)) {
                onSearchInput?.(value);
            }
        },
        [onSearchInput]
    );

    const handleSearchEnter = useCallback(() => {
        const regex =
            /[\s\u200B\u3000\uFEFF\u202F\u2009\u200A\u2007\u2008\u205F\u2000-\u2006]$/;
        if (!regex.test(searchValue)) {
            onSearchInput?.(searchValue);
        }
    }, [searchValue, onSearchInput]);

    const toggleNotifMenu = useCallback(() => {
        if (notificationsCount) {
            const next = !notifMenuOpen;
            setNotifMenuOpen(next);
            onChangeNotificationMenuIsOpen?.(next);
        }
    }, [notificationsCount, notifMenuOpen, onChangeNotificationMenuIsOpen]);

    const toggleModuleMenu = useCallback(() => {
        const next = !moduleMenuOpen;
        setModuleMenuOpen(next);
        onChangeModuleMenuIsOpen?.(next);
    }, [moduleMenuOpen, onChangeModuleMenuIsOpen]);

    const toggleUserMenu = useCallback(() => {
        const next = !userMenuOpen;
        setUserMenuOpen(next);
        onChangeUserMenuIsOpen?.(next);
    }, [userMenuOpen, onChangeUserMenuIsOpen]);

    const handleModuleMenuClick = useCallback(
        (item) => {
            setModuleMenuOpen(false);
            onChangeModuleMenuIsOpen?.(false);
            onSelectModuleMenu?.(item);
        },
        [onChangeModuleMenuIsOpen, onSelectModuleMenu]
    );

    const handleUserMenuClick = useCallback(
        (item) => {
            setUserMenuOpen(false);
            onChangeUserMenuIsOpen?.(false);
            onSelectUserMenu?.(item);
        },
        [onChangeUserMenuIsOpen, onSelectUserMenu]
    );

    // ── helper: employee avatar ──
    const getEmployeeAvatar = (employee) => {
        const avatarUrl = avatarMap.get?.(employee.id) || null;
        return avatarUrl;
    };

    // ────────────────────── RENDER ──────────────────────────────
    return (
        <>
            <style>{globalHeaderStyles}</style>
            <div className="gh-wrapper">
                <header className={`gh ${globalVersionClassName} ${className}`}>
                    {/* ─── Logo ─── */}
                    <div className="gh-logo" onClick={onClickLogo}>
                        {appLogo ? (
                            <img src={appLogo} alt="CYDAS" className="gh-logo__img" />
                        ) : (
                            <div className="gh-logo__fallback">
                                <CydasLogo size={40} />
                            </div>
                        )}
                    </div>

                    {/* ─── Center: Search ─── */}
                    <div className="gh-center">
                        {simpleSearch && (
                            <div className="gh-center-inner" ref={searchContainerRef}>
                                {/* Top search trigger (visible khi chưa mở) */}
                                <div
                                    className="gh-top-search"
                                    onClick={openSearch}
                                    style={{ display: searchIsOpen ? "none" : undefined }}
                                >
                                    <span className="gh-top-search__icon">
                                        <IconAdvancedSearch color="#666" size={32} />
                                    </span>
                                    <input
                                        type="text"
                                        className="gh-top-search__input"
                                        placeholder="ボブを検索"
                                        readOnly
                                    />
                                </div>

                                {/* Expanded search container */}
                                {searchIsOpen && (
                                    <div
                                        className={`gh-search-container ${lengthOfSearchEmployee ? "gh-search-container--shadow" : ""}`}
                                    >
                                        {/* Search header */}
                                        <div className="gh-search-header">
                                            {/* Logo chỉ hiện trên mobile */}
                                            {isMobile && appLogo && (
                                                <img src={appLogo} alt="" className="gh-search-header__logo" />
                                            )}
                                            {/* Back arrow chỉ hiện trên desktop (d-sm-none) */}
                                            {!isMobile && (
                                                <div className="gh-search-header__back" onClick={closeSearch}>
                                                    <IconArrowLeft />
                                                </div>
                                            )}
                                            <div className="gh-search-box">
                                                <span className="gh-search-box__icon">
                                                    <IconAdvancedSearch color="#666" size={32} />
                                                </span>
                                                <input
                                                    ref={searchInputRef}
                                                    id="gh-search-input"
                                                    type="text"
                                                    className="gh-search-box__input"
                                                    placeholder="ボブを検索"
                                                    autoComplete="off"
                                                    value={searchValue}
                                                    onChange={(e) => handleSearchInputChange(e.target.value)}
                                                    onKeyUp={(e) => {
                                                        if (e.key === "Enter") handleSearchEnter();
                                                    }}
                                                />
                                                {isLoading && (
                                                    <div className="gh-search-box__spinner">
                                                        <IconSpinner />
                                                    </div>
                                                )}
                                                {/* Close button on mobile */}
                                                {isMobile && (
                                                    <button className="gh-search-box__close" onClick={closeSearch}>
                                                        <IconClose />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Search results */}
                                        {lengthOfSearchEmployee > 0 && (
                                            <div className="gh-search-results">
                                                <div className="gh-search-results__total">
                                                    {lengthOfSearchEmployee}件
                                                </div>
                                                {searchResultEmployees.map((emp) => (
                                                    <div
                                                        key={emp.id}
                                                        className="gh-result-employee"
                                                        onClick={() => onClickSearchResultEmployee?.(emp.id)}
                                                    >
                                                        <div className="gh-result-employee__avatar">
                                                            {getEmployeeAvatar(emp) ? (
                                                                <img src={getEmployeeAvatar(emp)} alt="" />
                                                            ) : (
                                                                <div className="gh-avatar-monogram" style={{ backgroundColor: `hsl(${(parseInt(emp.id, 16) || 0) % 360}, 45%, 60%)` }}>
                                                                    {emp.name_face_image || emp.name?.charAt(0) || "?"}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="gh-result-employee__data">
                                                            <div className="gh-result-employee__name" title={emp.name}>
                                                                {emp.name}
                                                            </div>
                                                            <div className="gh-result-employee__other">
                                                                {emp.unit_name && (
                                                                    <span className="gh-emp-unit" title={emp.unit_name}>
                                                                        {emp.unit_name}
                                                                    </span>
                                                                )}
                                                                {emp.job_pos && (
                                                                    <span className="gh-emp-jobpos" title={emp.job_pos}>
                                                                        {emp.job_pos}
                                                                    </span>
                                                                )}
                                                                {emp.enroll_class && (
                                                                    <span className="gh-emp-enroll" title={emp.enroll_class}>
                                                                        {emp.enroll_class}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Alert data */}
                                        {alertData && (
                                            <div className="gh-alert-data">
                                                <div className="gh-alert-data__total">
                                                    {alertData.count}件
                                                </div>
                                                <div className="gh-alert-data__message">
                                                    {alertData.message}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ─── Right: menu-container ─── */}
                    <div className="gh-menu-container">
                        {/* Notification */}
                        {!isMobile && notification && (
                            <div className="gh-notification" ref={notifRef}>
                                <div
                                    className={`gh-icon-btn ${notifMenuOpen ? "active" : ""}`}
                                    onClick={toggleNotifMenu}
                                >
                                    <IconBell size={24} />
                                </div>
                                {notificationsCount > 0 && (
                                    <div className="gh-badge">
                                        <span>{notificationsCountHeader}</span>
                                    </div>
                                )}
                                {notifMenuOpen && (
                                    <div className="gh-notification-menu">
                                        <div className="gh-notification-menu__inner">
                                            <div className="gh-notification-menu__title">お知らせ</div>
                                            <NotificationItems
                                                notifications={notifications}
                                                onClickItem={onClickNotificationItem}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Module menu (9-dot) */}
                        {hasModuleMenu && (
                            <div className="gh-module-container" ref={moduleRef}>
                                <div
                                    className={`gh-icon-btn ${moduleMenuOpen ? "is-active" : ""}`}
                                    onClick={toggleModuleMenu}
                                >
                                    <IconDotsNine />
                                </div>
                                {moduleMenuOpen && (
                                    <ModuleMenu
                                        menuLists={{
                                            primary: moduleMenu.primaryMenuLists,
                                            secondary: moduleMenu.secondaryMenuLists,
                                            tertiary: moduleMenu.tertiaryMenuLists,
                                            quaternary: moduleMenu.quaternaryMenuLists,
                                            quinary: moduleMenu.quinaryMenuLists,
                                            senary: moduleMenu.senaryMenuLists,
                                        }}
                                        onClickItem={handleModuleMenuClick}
                                        onNavigate={onNavigate}
                                    />
                                )}
                            </div>
                        )}

                        {/* Company logo */}
                        {hasCompanyLogo && !isMobile && (
                            <div className="gh-company-logo">
                                <img src={config.companyLogo.source} alt="company-logo" />
                            </div>
                        )}

                        {/* User menu */}
                        <div className="gh-user-container" ref={userRef}>
                            <div className="gh-user-info">
                                {!isMobile && (
                                    <div className="gh-user-info__left">
                                        <div className="gh-user-fullname">
                                            {myaccount?.fullName || ""}
                                        </div>
                                        {myaccount?.attendanceStatus && (
                                            <div className="gh-user-status">
                                                <span
                                                    className="gh-user-status__dot"
                                                    style={{ backgroundColor: "#007bc3" }}
                                                />
                                                <span className="gh-user-status__name">
                                                    {myaccount.attendanceStatus.attendanceStatusName}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div
                                    className="gh-avatar-wrapper"
                                    onMouseEnter={() => setIsShowTooltip(true)}
                                    onMouseLeave={() => setIsShowTooltip(false)}
                                >
                                    <div
                                        className="gh-avatar"
                                        onClick={toggleUserMenu}
                                    >
                                        {userMenu?.avatar?.src ? (
                                            <img src={userMenu.avatar.src} alt="" />
                                        ) : (
                                            <div className="gh-avatar__monogram" style={{ background: "#45d1d1" }}>
                                                {myaccount?.avatarText || "鈴大"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {!isMobile &&
                                    myAccountMeta?.appVersion?.appVersion &&
                                    appVersionClassName !== "v1-0" && (
                                        <span className="gh-version">
                                            {myAccountMeta.appVersion.appVersion}
                                        </span>
                                    )}
                            </div>

                            {/* Tooltip */}
                            {!isMobile &&
                                isShowTooltip &&
                                globalVersionClassName !== "v1-0" && (
                                    <div
                                        className={`gh-tooltip ${!appVersionClassName ? "no-version" : ""}`}
                                    >
                                        {userMenu?.menuBlocks?.[0]?.title || ""}
                                    </div>
                                )}

                            {/* User dropdown */}
                            {userMenuOpen && (
                                <MyMenu
                                    menuBlocks={userMenu?.menuBlocks || []}
                                    onClickItem={handleUserMenuClick}
                                />
                            )}
                        </div>
                    </div>
                </header>
            </div>
        </>
    );
}

// ════════════════════════════════════════════════════════════════
// STYLES — mirrors GlobalHeader.vue <style scoped>
// ════════════════════════════════════════════════════════════════
const globalHeaderStyles = `
/* ─── Header shell ─── */
.gh-wrapper {
  width: 100%;
  height: 100%;
}
.gh {
  width: 100%;
  height: 64px;
  box-sizing: border-box;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #dcdcdc;
  margin: 0;
  background-color: #fff;
  position: relative;
  font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
  font-size: 14px;
  color: #333;
}
@media (max-width: 767px) {
  .gh {
    padding: 8px;
    border-bottom: none;
    box-shadow: 0px 0px 8px rgba(102, 102, 102, 0.24);
  }
}
/* v2.0 variant */
.gh.v2-0 {
  padding: 0 24px 0 16px;
  border-bottom: 0;
  box-shadow: 0px 0px 16px 0px rgba(102, 102, 102, 0.1);
}
@media (max-width: 767px) {
  .gh.v2-0 {
    padding: 8px;
    border-bottom: none;
    box-shadow: 0px 0px 8px rgba(102, 102, 102, 0.24);
  }
}

/* ─── Logo ─── */
.gh-logo {
  width: auto;
  height: 40px;
  margin-right: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.gh-logo__img {
  height: 40px;
  width: auto;
  object-fit: contain;
}
.gh-logo__fallback {
  display: flex;
  align-items: center;
}
@media (max-width: 767px) {
  .gh-logo {
    margin-right: 8px;
    height: 32px;
  }
  .gh-logo__img {
    height: 32px;
  }
}

/* ─── Center: Search ─── */
.gh-center {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}
@media (max-width: 767px) {
  .gh-center {
    width: calc(100% - 84px);
  }
}
.gh-center-inner {
  position: relative;
  display: inline-block;
}
@media (max-width: 767px) {
  .gh-center-inner { width: 100%; }
}

/* Top search (trigger) */
.gh-top-search {
  width: 320px;
  height: 40px;
  display: flex;
  align-items: center;
  background: #f4f7fb;
  border: 2px solid #bfbfbf;
  border-radius: 27px;
  padding: 0 16px 0 12px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.gh-top-search:hover {
  border-color: #999;
}
.gh-top-search__icon {
  color: #666;
  display: flex;
  align-items: center;
  margin-right: 8px;
  flex-shrink: 0;
}
.gh-top-search__input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #999;
  width: 100%;
  cursor: pointer;
  pointer-events: none;
  font-family: inherit;
}
@media (max-width: 768px) {
  .gh-top-search { width: 260px; }
}
@media (max-width: 767px) {
  .gh-top-search { width: 100%; }
}
@media (max-width: 320px) {
  .gh-top-search { width: 228px; }
}

/* ─── Expanded search container ─── */
.gh-search-container {
  position: absolute;
  display: inline-block;
  top: -8px;
  left: -61px;
  width: auto;
  min-width: 420px;
  padding: 12px 0;
  background: #fff;
  border: 1px solid #dcdcdc;
  border-radius: 2px;
  box-shadow: 0px 2px 12px rgba(102, 102, 102, 0.3);
  z-index: 991;
}
@media (max-width: 767px) {
  .gh-search-container {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    min-width: unset;
    z-index: 100;
    border: 0;
    padding: 16px 0;
    border-radius: 0;
  }
}

/* Search header */
.gh-search-header {
  display: flex;
  padding: 0 16px 0 12px;
  align-items: center;
}
@media (max-width: 767px) {
  .gh-search-header {
    padding-left: 8px;
    padding-right: 12px;
  }
}
.gh-search-header__logo {
  height: 32px;
  width: auto;
  margin-right: 8px;
}
.gh-search-header__back {
  display: inline-flex;
  height: 32px;
  width: 32px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  cursor: pointer;
  color: #666;
  flex-shrink: 0;
}
.gh-search-header__back:hover {
  background-color: #e7f1fd;
}

/* Search box */
.gh-search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 320px;
  height: 40px;
  background: #f4f7fb;
  border-radius: 27px;
  padding: 0 12px;
}
@media (max-width: 767px) {
  .gh-search-box { width: 100%; }
}
.gh-search-box__icon {
  color: #666;
  display: flex;
  align-items: center;
  margin-right: 8px;
  flex-shrink: 0;
}
.gh-search-box__input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #333;
  width: 100%;
  font-family: inherit;
}
.gh-search-box__input::placeholder {
  font-size: 14px;
  color: #999;
}
.gh-search-box__spinner {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
}
.gh-spinner-svg,
.cydas-spinner {
  animation: gh-spin 0.8s linear infinite;
}
@keyframes gh-spin {
  to { transform: rotate(360deg); }
}
.gh-search-box__close {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
  display: flex;
  align-items: center;
}

/* ─── Search results ─── */
.gh-search-results {
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  margin-top: 8px;
}
.gh-search-results__total {
  padding: 8px 16px;
  font-size: 14px;
  line-height: 20px;
  color: #666;
}
.gh-result-employee {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px 0;
  min-height: 42px;
  cursor: pointer;
  transition: background 0.15s;
}
.gh-result-employee:hover {
  background: #e7f1fd;
}
.gh-result-employee__avatar {
  width: 56px;
  padding-left: 16px;
  flex-shrink: 0;
}
.gh-result-employee__avatar img,
.gh-avatar-monogram {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.gh-avatar-monogram {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
.gh-result-employee__data {
  padding-left: 16px;
  min-height: 42px;
  min-width: 0;
}
.gh-result-employee__name {
  font-weight: bold;
  line-height: 20px;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gh-result-employee__other {
  display: flex;
}
.gh-result-employee__other span {
  line-height: 20px;
  padding: 0 8px 0 10px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  border-left: 1px solid #dcdcdc;
  font-size: 13px;
  color: #555;
}
.gh-result-employee__other span:first-child {
  border: none;
  padding-left: 0;
}
.gh-emp-unit { width: 120px; }
.gh-emp-jobpos,
.gh-emp-enroll { width: 80px; }

/* Alert data */
.gh-alert-data {
  padding: 16px 16px 0;
}
.gh-alert-data__total {
  font-size: 14px;
  line-height: 20px;
  color: #666;
  padding-bottom: 16px;
}
.gh-alert-data__message {
  font-size: 12px;
  line-height: 20px;
  color: #e53935;
}

/* ─── Right: menu-container ─── */
.gh-menu-container {
  display: flex;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;
}
@media (max-width: 767px) {
  .gh-menu-container { gap: 0; }
}

/* Shared icon button */
.gh-icon-btn {
  display: inline-flex;
  height: 40px;
  width: 40px;
  border-radius: 50%;
  background: #f8f8f8;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  color: #666;
  transition: background 0.15s, color 0.15s;
}
.gh-icon-btn:hover {
  background-color: #f1f2f7;
  color: #007bc3;
}
.gh-icon-btn.active,
.gh-icon-btn.is-active {
  background-color: #f1f2f7;
  color: #007bc3;
}

/* ─── Notification ─── */
.gh-notification {
  position: relative;
  margin-right: 16px;
}
@media (max-width: 767px) {
  .gh-notification { display: none; }
}
.gh-badge {
  position: absolute;
  top: -6px;
  right: -7px;
  background: #ed5d5d;
  height: 16px;
  line-height: 16px;
  border-radius: 50%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.gh-badge span {
  color: #fff;
  font-size: 10px;
  padding: 2px;
  font-weight: bold;
  min-width: 16px;
}
.gh-notification-menu {
  position: absolute;
  top: 20px;
  left: -176px;
  max-height: 85vh;
  z-index: 991;
}
.gh-notification-menu__inner {
  font-size: 14px;
  background: #fff;
  border-radius: 2px;
  margin-top: 24px;
  box-shadow: 0px 2px 12px rgba(102, 102, 102, 0.3);
  color: #666;
  width: 325px;
}
.gh-notification-menu__title {
  padding: 16px;
  font-weight: bold;
  color: #333;
}
.gh-notif-items {
  max-height: 400px;
  overflow-y: auto;
}
.gh-notif-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
}
.gh-notif-item:hover { background: #f5f7fa; }
.gh-notif-item__title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}
.gh-notif-item__desc {
  font-size: 12px;
  color: #888;
  line-height: 1.4;
}
.gh-notif-empty {
  padding: 24px 16px;
  text-align: center;
  color: #aaa;
  font-size: 13px;
}

/* ─── Module menu (9-dot) ─── */
.gh-module-container {
  position: relative;
  display: flex;
  z-index: 1000;
  margin-right: 8px;
}
@media (max-width: 767px) {
  .gh-module-container .gh-icon-btn { display: none; }
}
.gh-module-menu {
  position: absolute;
  top: 44px;
  right: -48px;
  background: #fff;
  border-radius: 4px;
  max-height: calc(100vh - 58px);
  overflow-y: auto;
  box-shadow: 0px 2px 12px rgba(102, 102, 102, 0.3);
  width: 340px;
  z-index: 1000;
  padding-bottom: 16px;
}
@media (max-width: 767px) {
  .gh-module-menu {
    position: fixed;
    top: 64px;
    left: 0;
    width: 100%;
    margin: 0;
    right: auto;
    border-radius: 0;
  }
}
.gh-mm-header {
  padding: 20px 20px 4px;
  font-size: 14px;
  font-weight: 700;
  color: #333;
}
.gh-mm-subtitle {
  padding: 8px 20px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #333;
}
.gh-mm-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  padding: 0 8px;
}
.gh-mm-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 4px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s;
}
.gh-mm-item:hover {
  background: #f5f7fa;
}
.gh-mm-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gh-mm-label {
  font-size: 11px;
  color: #333;
  text-align: center;
  line-height: 1.3;
  word-break: keep-all;
  max-width: 90px;
}

/* ─── Company logo ─── */
.gh-company-logo {
  width: auto;
  height: 32px;
  line-height: 8px;
  margin-left: 16px;
}
.gh-company-logo img {
  height: 32px;
  width: auto;
  cursor: default;
  vertical-align: middle;
  object-fit: contain;
}
@media (max-width: 767px) {
  .gh-company-logo { display: none; }
}

/* ─── User container ─── */
.gh-user-container {
  cursor: pointer;
  position: relative;
  display: flex;
  margin-left: 24px;
  border-left: 1px solid #dcdcdc;
  padding-left: 0;
}
@media (max-width: 767px) {
  .gh-user-container { border-left: none; margin-left: 8px; }
}

.gh-user-info {
  display: flex;
  align-items: center;
  margin-left: 24px;
}
@media (max-width: 767px) {
  .gh-user-info { margin-left: 0; }
}
.gh-user-info__left {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 8px;
}
.gh-user-fullname {
  font-weight: bold;
  color: #333;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 176px;
  font-size: 14px;
  line-height: 1.3;
}
.gh-user-status {
  display: flex;
  align-items: center;
  gap: 5px;
}
.gh-user-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.gh-user-status__name {
  font-size: 12px;
  font-weight: 400;
  color: #666;
}

/* Avatar */
.gh-avatar-wrapper { position: relative; }
.gh-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.15s;
}
.gh.v2-0 .gh-avatar:hover {
  border-color: #007bc3;
}
.gh-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.gh-avatar__monogram {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #45d1d1;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
}
@media (max-width: 767px) {
  .gh-avatar {
    width: 40px;
    height: 40px;
  }
}

/* Version */
.gh-version {
  margin-left: 8px;
  font-size: 12px;
  color: #999;
  cursor: default;
}

/* Tooltip */
.gh-tooltip {
  position: absolute;
  bottom: -28px;
  background: #333;
  color: #fff;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 4px;
  right: 30px;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
}
.gh-tooltip.no-version {
  right: 0;
}

/* ─── User dropdown menu ─── */
.gh-user-menu {
  position: absolute;
  cursor: default;
  top: 52px;
  right: 0;
  z-index: 1000;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0px 2px 12px rgba(102, 102, 102, 0.3);
  min-width: 200px;
  overflow: hidden;
}
@media (max-width: 767px) {
  .gh-user-menu {
    position: fixed;
    width: 100%;
    left: 0;
    top: 64px;
    height: calc(100% - 52px - 64px);
    overflow: auto;
    border-radius: 0;
  }
}
.gh-user-menu-block {
  border-bottom: 1px solid #f0f0f0;
  padding: 8px 0;
}
.gh-user-menu-block:last-child { border-bottom: none; }
.gh-user-menu-block__title {
  padding: 8px 16px 4px;
  font-size: 12px;
  font-weight: 700;
  color: #999;
}
.gh-user-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background 0.15s;
}
.gh-user-menu-item:hover { background: #f5f7fa; }
.gh-user-menu-item__icon {
  width: 20px;
  text-align: center;
  color: #666;
}
`;
