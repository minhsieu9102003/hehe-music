import React, { useState, useCallback, useEffect } from "react";
import Sidebar from "./Sidebar";

// ═══════════════════════════════════════════════════════════════════════
// Dữ liệu nhân viên công ty (trích từ company-people.md)
// jp: tên gốc tiếng Nhật · romaji: cách đọc romaji · deptVi: phòng ban (VN)
// ═══════════════════════════════════════════════════════════════════════
const PEOPLE = [
    // 株式会社サイダス — Ban Giám đốc
    { jp: "松田 晋", romaji: "Matsuda Susumu", deptVi: "Ban Giám đốc Cydas", role: "Đại diện pháp luật" },
    { jp: "小杉 太伸", romaji: "Kosugi Tanobu", deptVi: "Ban Giám đốc Cydas", role: "Giám sát thường trực" },
    { jp: "伊東 壮彦", romaji: "Itou Takehiko", deptVi: "Ban Giám đốc Cydas", role: "Giám đốc" },
    { jp: "髙橋 総一郎", romaji: "Takahashi Souichirou", deptVi: "Ban Giám đốc Cydas", role: "Giám đốc" },

    // CTM導入支援センター
    { jp: "小林 啓悟", romaji: "Kobayashi Keigo", deptVi: "Trung tâm Hỗ trợ Triển khai CTM", role: "Trưởng Trung tâm" },
    { jp: "塩崎 博子", romaji: "Shiozaki Hiroko", deptVi: "Trung tâm Hỗ trợ Triển khai CTM", role: "Trưởng phòng" },
    { jp: "紀伊 茜", romaji: "Kii Akane", deptVi: "Trung tâm Hỗ trợ Triển khai CTM", role: "Nhân viên" },
    { jp: "宮田 奈穂美", romaji: "Miyata Nahomi", deptVi: "Trung tâm Hỗ trợ Triển khai CTM", role: "Nhân viên" },
    { jp: "大平 奈々美", romaji: "Oohira Nanami", deptVi: "Trung tâm Hỗ trợ Triển khai CTM", role: "Nhân viên" },
    { jp: "前川 由衣", romaji: "Maekawa Yui", deptVi: "Trung tâm Hỗ trợ Triển khai CTM", role: "Nhân viên" },
    { jp: "上岡 隼也", romaji: "Kamioka Junya", deptVi: "Trung tâm Hỗ trợ Triển khai CTM", role: "Nhân viên" },
    { jp: "髙濵 さらさ", romaji: "Takahama Sarasa", deptVi: "Trung tâm Hỗ trợ Triển khai CTM", role: "Nhân viên" },

    // コーポレート本部
    { jp: "永山 雅之", romaji: "Nagayama Masayuki", deptVi: "Trụ sở Doanh nghiệp", role: "Trưởng Trụ sở" },
    { jp: "齋藤 一人", romaji: "Saitou Kazuto", deptVi: "Trụ sở Doanh nghiệp", role: "Nhân viên hợp đồng" },

    // 経営企画部
    { jp: "中島 麻人", romaji: "Nakajima Asato", deptVi: "Phòng Kế hoạch Kinh doanh", role: "Trưởng phòng" },

    // 総務チーム
    { jp: "橋本 智英子", romaji: "Hashimoto Chieko", deptVi: "Nhóm Hành chính", role: "Leader" },
    { jp: "山本 栞", romaji: "Yamamoto Shiori", deptVi: "Nhóm Hành chính", role: "Nhân viên" },

    // 業務チーム
    { jp: "西村 忍", romaji: "Nishimura Shinobu", deptVi: "Nhóm Nghiệp vụ", role: "Leader" },
    { jp: "角 有紀子", romaji: "Sumi Yukiko", deptVi: "Nhóm Nghiệp vụ", role: "Nhân viên" },

    // コンプライアンス・DXチーム
    { jp: "粟國 成起", romaji: "Aguni Naruki", deptVi: "Nhóm Tuân thủ & DX", role: "Manager" },
    { jp: "末広 学", romaji: "Suehiro Manabu", deptVi: "Nhóm Tuân thủ & DX", role: "Leader" },
    { jp: "儀保 宣尚", romaji: "Gibo Nobuhisa", deptVi: "Nhóm Tuân thủ & DX", role: "Nhân viên" },
    { jp: "山川 真季", romaji: "Yamakawa Maki", deptVi: "Nhóm Tuân thủ & DX", role: "Nhân viên" },
    { jp: "柳沼 美智子", romaji: "Yaginuma Michiko", deptVi: "Nhóm Tuân thủ & DX", role: "Nhân viên" },

    // 財務経理部 / チーム
    { jp: "村松 慶彦", romaji: "Muramatsu Yoshihiko", deptVi: "Phòng Tài chính Kế toán", role: "Trưởng phòng" },
    { jp: "宮田 龍也", romaji: "Miyata Tatsuya", deptVi: "Nhóm Tài chính Kế toán", role: "Manager" },
    { jp: "田沼 千明", romaji: "Tanuma Chiaki", deptVi: "Nhóm Tài chính Kế toán", role: "Nhân viên hợp đồng" },

    // 人事部
    { jp: "成瀬 千絵子", romaji: "Naruse Chieko", deptVi: "Phòng Nhân sự", role: "Trưởng phòng" },
    { jp: "野中 杏夏里", romaji: "Nonaka Anakari", deptVi: "Phòng Nhân sự", role: "Nhân viên" },
    { jp: "比嘉 優太", romaji: "Higa Yuuta", deptVi: "Phòng Nhân sự", role: "Nhân viên" },
    { jp: "渡部 敦揮", romaji: "Watabe Atsuki", deptVi: "Phòng Nhân sự", role: "Nhân viên" },
    { jp: "池鍋 登万", romaji: "Ikenabe Touma", deptVi: "Phòng Nhân sự", role: "Nhân viên" },
    { jp: "福田 遊", romaji: "Fukuda Yuu", deptVi: "Phòng Nhân sự", role: "Nhân viên" },
    { jp: "宮城 日菜乃", romaji: "Miyagi Hinano", deptVi: "Phòng Nhân sự", role: "Nhân viên" },

    // 人事チーム
    { jp: "垣花 実亜", romaji: "Kakihana Mia", deptVi: "Nhóm Nhân sự", role: "Nhân viên" },
    { jp: "野口 響子", romaji: "Noguchi Kyouko", deptVi: "Nhóm Nhân sự", role: "Nhân viên" },
    { jp: "竹内 萌華", romaji: "Takeuchi Moeka", deptVi: "Nhóm Nhân sự", role: "Nhân viên" },

    // 営業本部
    { jp: "西 英伸", romaji: "Nishi Hidenobu", deptVi: "Trụ sở Kinh doanh", role: "Trưởng Trụ sở" },

    // エンタープライズチーム
    { jp: "勝岡 勇輝", romaji: "Katsuoka Yuuki", deptVi: "Nhóm Enterprise", role: "Leader" },
    { jp: "土手 大輝", romaji: "Dote Daiki", deptVi: "Nhóm Enterprise", role: "Nhân viên" },
    { jp: "早野 志帆", romaji: "Hayano Shiho", deptVi: "Nhóm Enterprise", role: "Nhân viên" },

    // パートナーチーム
    { jp: "小林 美穂", romaji: "Kobayashi Miho", deptVi: "Nhóm Đối tác", role: "Nhân viên" },

    // ソリューションチーム
    { jp: "宮﨑 邦康", romaji: "Miyazaki Kuniyasu", deptVi: "Nhóm Giải pháp", role: "Manager" },
    { jp: "横島 悦子", romaji: "Yokoshima Etsuko", deptVi: "Nhóm Giải pháp", role: "Leader" },
    { jp: "金子 優佳", romaji: "Kaneko Yuka", deptVi: "Nhóm Giải pháp", role: "Nhân viên" },
    { jp: "山野 未佑", romaji: "Yamano Miyuu", deptVi: "Nhóm Giải pháp", role: "Nhân viên" },

    // コンサルティング部
    { jp: "紀 晋太郎", romaji: "Ki Shintarou", deptVi: "Phòng Tư vấn", role: "Manager" },
    { jp: "安田 和人", romaji: "Yasuda Kazuto", deptVi: "Phòng Tư vấn", role: "Manager" },
    { jp: "多田 聖夏", romaji: "Tada Seika", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "澁谷 真生", romaji: "Shibuya Mao", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "藤井 誠", romaji: "Fujii Makoto", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "青木 何奈", romaji: "Aoki Kana", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "田中 優子", romaji: "Tanaka Yuuko", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "古性 里衣", romaji: "Koshou Rie", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "小手川 哲", romaji: "Kotegawa Tetsu", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "テト ゾーラット", romaji: "Teto Zoorat", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "小岡 裕昌", romaji: "Kooka Hiromasa", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "佐藤 萌", romaji: "Satou Moe", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "西澤 大河", romaji: "Nishizawa Taiga", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "佐々木 亮", romaji: "Sasaki Ryou", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "河原崎 遥", romaji: "Kawarazaki Haruka", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "香川 義博", romaji: "Kagawa Yoshihiro", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "井上 琴乃", romaji: "Inoue Kotono", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "近藤 梨佳子", romaji: "Kondou Rikako", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "遠藤 みゆき", romaji: "Endou Miyuki", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "新井 大樹", romaji: "Arai Daiki", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "芳賀 眞結子", romaji: "Haga Mayuko", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "山口 萌", romaji: "Yamaguchi Moe", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "野原 夏音", romaji: "Nohara Kanon", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "若林 夏穂", romaji: "Wakabayashi Kaho", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "永吉 右京", romaji: "Nagayoshi Ukyou", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "北内 和也", romaji: "Kitauchi Kazuya", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "王 韜", romaji: "Ou Tao", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "野海 和貴", romaji: "Nokai Kazuki", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "澤田 寧音", romaji: "Sawada Nene", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "武田 裕", romaji: "Takeda Yutaka", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "佐野 巧", romaji: "Sano Takumi", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "井出 将貴", romaji: "Ide Masaki", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "吉島 優輔", romaji: "Yoshijima Yuusuke", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "東城 有希子", romaji: "Toujou Yukiko", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "中谷 雅美", romaji: "Nakatani Masami", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "三浦 克之", romaji: "Miura Katsuyuki", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "太田 直希", romaji: "Oota Naoki", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "泉崎 将也", romaji: "Izumizaki Masaya", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "安田 航大", romaji: "Yasuda Koudai", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "有木 颯英", romaji: "Ariki Souei", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "須貝 隼人", romaji: "Sugai Hayato", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "木下 優希", romaji: "Kinoshita Yuuki", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "鷺谷 駿", romaji: "Sagitani Shun", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "富田 健太", romaji: "Tomita Kenta", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "川嶌 萌々佳", romaji: "Kawashima Momoka", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },
    { jp: "小峯 崇嗣", romaji: "Komine Takatsugu", deptVi: "Phòng Tư vấn", role: "Nhân viên biệt phái" },

    // 大手導入チーム
    { jp: "伊福 香織", romaji: "Ifuku Kaori", deptVi: "Nhóm Triển khai Khách hàng lớn", role: "Nhân viên" },
    { jp: "野原 淳那", romaji: "Nohara Junna", deptVi: "Nhóm Triển khai Khách hàng lớn", role: "Nhân viên" },
    { jp: "當山 司幸", romaji: "Touyama Shikou", deptVi: "Nhóm Triển khai Khách hàng lớn", role: "Nhân viên" },
    { jp: "杉山 育代", romaji: "Sugiyama Ikuyo", deptVi: "Nhóm Triển khai Khách hàng lớn", role: "Nhân viên" },
    { jp: "齋藤 有沙子", romaji: "Saitou Arisako", deptVi: "Nhóm Triển khai Khách hàng lớn", role: "Nhân viên" },
    { jp: "佐藤 寿彦", romaji: "Satou Toshihiko", deptVi: "Nhóm Triển khai Khách hàng lớn", role: "Nhân viên" },
    { jp: "山本 典子", romaji: "Yamamoto Noriko", deptVi: "Nhóm Triển khai Khách hàng lớn", role: "Nhân viên hợp đồng" },
    { jp: "滝沢 裕子", romaji: "Takizawa Hiroko", deptVi: "Nhóm Triển khai Khách hàng lớn", role: "Nhân viên hợp đồng" },
    { jp: "神谷 亜希乃", romaji: "Kamiya Akino", deptVi: "Nhóm Triển khai Khách hàng lớn", role: "Nhân viên bán thời gian" },

    // カスタマーサクセス推進部 / チーム
    { jp: "日比野 光", romaji: "Hibino Hikaru", deptVi: "Phòng Thúc đẩy Customer Success", role: "Trưởng phòng" },
    { jp: "上間 秀人", romaji: "Uema Hideto", deptVi: "Nhóm Customer Success", role: "Manager" },
    { jp: "吉成 亜由美", romaji: "Yoshinari Ayumi", deptVi: "Nhóm Customer Success", role: "Nhân viên" },
    { jp: "新藤 優哉", romaji: "Shindou Yuya", deptVi: "Nhóm Customer Success", role: "Nhân viên" },
    { jp: "森 雄紀", romaji: "Mori Yuuki", deptVi: "Nhóm Customer Success", role: "Nhân viên" },
    { jp: "河口 琉歌", romaji: "Kawaguchi Ruka", deptVi: "Nhóm Customer Success", role: "Nhân viên" },
    { jp: "奥野 陽平", romaji: "Okuno Youhei", deptVi: "Nhóm Customer Success", role: "Nhân viên" },
    { jp: "古和田 将崇", romaji: "Kowada Masataka", deptVi: "Nhóm Customer Success", role: "Nhân viên" },
    { jp: "渡辺 優花", romaji: "Watanabe Yuuka", deptVi: "Nhóm Customer Success", role: "Nhân viên" },
    { jp: "奈良 和正", romaji: "Nara Kazumasa", deptVi: "Nhóm Customer Success", role: "Nhân viên biệt phái" },
    { jp: "宮澤 由佳里", romaji: "Miyazawa Yukari", deptVi: "Nhóm Customer Success", role: "Nhân viên biệt phái" },
    { jp: "清水 崇祐", romaji: "Shimizu Takahiro", deptVi: "Nhóm Customer Success", role: "Nhân viên biệt phái" },
    { jp: "嶋 美波", romaji: "Shima Minami", deptVi: "Nhóm Customer Success", role: "Nhân viên biệt phái" },
    { jp: "内田 健太", romaji: "Uchida Kenta", deptVi: "Nhóm Customer Success", role: "Nhân viên biệt phái" },
    { jp: "加納 勇二", romaji: "Kanou Yuuji", deptVi: "Nhóm Customer Success", role: "Nhân viên biệt phái" },
    { jp: "見上 周平", romaji: "Mikami Shuuhei", deptVi: "Nhóm Customer Success", role: "Nhân viên biệt phái" },
    { jp: "照井 春菜", romaji: "Terui Haruna", deptVi: "Nhóm Customer Success", role: "Nhân viên biệt phái" },
    { jp: "上別府 知生", romaji: "Kamibeppu Tomoki", deptVi: "Nhóm Customer Success", role: "Nhân viên biệt phái" },
    { jp: "酒井 美和", romaji: "Sakai Miwa", deptVi: "Nhóm Customer Success", role: "Nhân viên biệt phái" },
    { jp: "鈴木 亜由乃", romaji: "Suzuki Ayuno", deptVi: "Nhóm Customer Success", role: "Nhân viên biệt phái" },
    { jp: "鈴木 大裕", romaji: "Suzuki Daiyuu", deptVi: "Nhóm Customer Success", role: "Nhân viên biệt phái" },

    // テクニカルサポートチーム
    { jp: "柴田 絵美", romaji: "Shibata Emi", deptVi: "Nhóm Hỗ trợ Kỹ thuật", role: "Nhân viên" },
    { jp: "岸本 蘭菜", romaji: "Kishimoto Ranna", deptVi: "Nhóm Hỗ trợ Kỹ thuật", role: "Nhân viên" },
    { jp: "古謝 将", romaji: "Koja Susumu", deptVi: "Nhóm Hỗ trợ Kỹ thuật", role: "Nhân viên" },
    { jp: "上本 浩大朗", romaji: "Uemoto Koudairou", deptVi: "Nhóm Hỗ trợ Kỹ thuật", role: "Nhân viên" },
    { jp: "唐仁原 はるか", romaji: "Toujinbara Haruka", deptVi: "Nhóm Hỗ trợ Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "貝瀬 竜介", romaji: "Kaise Ryuusuke", deptVi: "Nhóm Hỗ trợ Kỹ thuật", role: "Nhân viên biệt phái" },

    // 運用QAチーム
    { jp: "祖納元 りえ", romaji: "Sonaimoto Rie", deptVi: "Nhóm QA Vận hành", role: "Nhân viên" },
    { jp: "戸松 大輔", romaji: "Tomatsu Daisuke", deptVi: "Nhóm QA Vận hành", role: "Nhân viên" },
    { jp: "グェン ティ トゥー", romaji: "Nguyen Thi Thu", deptVi: "Nhóm QA Vận hành", role: "Nhân viên" },
    { jp: "嶋田 祥子", romaji: "Shimada Shouko", deptVi: "Nhóm QA Vận hành", role: "Nhân viên" },

    // 企画チーム (Marketing)
    { jp: "萩野 心子", romaji: "Hagino Shinko", deptVi: "Nhóm Lập kế hoạch (Marketing)", role: "Leader" },
    { jp: "土屋 あかり", romaji: "Tsuchiya Akari", deptVi: "Nhóm Lập kế hoạch (Marketing)", role: "Nhân viên" },
    { jp: "加藤 咲", romaji: "Katou Saki", deptVi: "Nhóm Lập kế hoạch (Marketing)", role: "Nhân viên" },

    // クリエイティブチーム
    { jp: "小牧 美久", romaji: "Komaki Miku", deptVi: "Nhóm Sáng tạo", role: "Leader" },
    { jp: "八木 亮輔", romaji: "Yagi Ryousuke", deptVi: "Nhóm Sáng tạo", role: "Nhân viên" },
    { jp: "須永 彩乃", romaji: "Sunaga Ayano", deptVi: "Nhóm Sáng tạo", role: "Nhân viên" },

    // 技術本部
    { jp: "永島 克彦", romaji: "Nagashima Katsuhiko", deptVi: "Trụ sở Kỹ thuật", role: "Trưởng Trụ sở" },
    { jp: "浦山 和也", romaji: "Urayama Kazuya", deptVi: "Trụ sở Kỹ thuật", role: "Phó Trụ sở" },
    { jp: "横松 正樹", romaji: "Yokomatsu Masaki", deptVi: "Trụ sở Kỹ thuật", role: "Manager" },

    // プロダクト企画チーム
    { jp: "佐藤 圭", romaji: "Satou Kei", deptVi: "Nhóm Lập kế hoạch Sản phẩm", role: "Manager" },
    { jp: "松倉 マリオ", romaji: "Matsukura Mario", deptVi: "Nhóm Lập kế hoạch Sản phẩm", role: "Nhân viên" },
    { jp: "大木 みらい", romaji: "Ooki Mirai", deptVi: "Nhóm Lập kế hoạch Sản phẩm", role: "Nhân viên" },
    { jp: "川村 和束", romaji: "Kawamura Kazuka", deptVi: "Nhóm Lập kế hoạch Sản phẩm", role: "Nhân viên" },
    { jp: "岩崎 侑紀", romaji: "Iwasaki Yuuki", deptVi: "Nhóm Lập kế hoạch Sản phẩm", role: "Nhân viên" },
    { jp: "鈴木 宏幸", romaji: "Suzuki Hiroyuki", deptVi: "Nhóm Lập kế hoạch Sản phẩm", role: "Nhân viên biệt phái" },
    { jp: "大川 澪", romaji: "Ookawa Mio", deptVi: "Nhóm Lập kế hoạch Sản phẩm", role: "Nhân viên biệt phái" },
    { jp: "日月 俊輔", romaji: "Hizuki Shunsuke", deptVi: "Nhóm Lập kế hoạch Sản phẩm", role: "Nhân viên biệt phái" },

    // プロダクト開発部
    { jp: "清水 勇大", romaji: "Shimizu Yuudai", deptVi: "Phòng Phát triển Sản phẩm", role: "Trưởng phòng" },
    { jp: "加藤 文章", romaji: "Katou Fumiaki", deptVi: "Phòng Phát triển Sản phẩm", role: "Manager" },
    { jp: "肥後 牧人", romaji: "Higo Makito", deptVi: "Phòng Phát triển Sản phẩm", role: "Manager" },
    { jp: "吉田 治史", romaji: "Yoshida Harushi", deptVi: "Phòng Phát triển Sản phẩm", role: "Nhân viên biệt phái" },
    { jp: "原 伊於里", romaji: "Hara Iori", deptVi: "Phòng Phát triển Sản phẩm", role: "Nhân viên biệt phái" },

    // タレントデータベース・スキルマップ1チーム
    { jp: "ド ドゥック クエン", romaji: "Do Duc Quyen", deptVi: "Nhóm Talent DB & Skill Map 1", role: "Leader" },
    { jp: "ダン リン チー", romaji: "Dang Linh Chi", deptVi: "Nhóm Talent DB & Skill Map 1", role: "Nhân viên" },
    { jp: "レ ゴック アイン", romaji: "Le Ngoc Anh", deptVi: "Nhóm Talent DB & Skill Map 1", role: "Nhân viên" },
    { jp: "饒辺 奏樹", romaji: "Youhen Kanaki", deptVi: "Nhóm Talent DB & Skill Map 1", role: "Nhân viên" },
    { jp: "フア ヴィエット ホアン", romaji: "Hua Viet Hoang", deptVi: "Nhóm Talent DB & Skill Map 1", role: "Nhân viên" },
    { jp: "チャン ビン ミン", romaji: "Tran Binh Minh", deptVi: "Nhóm Talent DB & Skill Map 1", role: "Nhân viên" },
    { jp: "グエン レ ソン", romaji: "Nguyen Le Son", deptVi: "Nhóm Talent DB & Skill Map 1", role: "Nhân viên" },

    // タレントデータベース・スキルマップ2チーム
    { jp: "中野 将吾", romaji: "Nakano Shougo", deptVi: "Nhóm Talent DB & Skill Map 2", role: "Manager" },
    { jp: "グエン トウ チャン", romaji: "Nguyen Thu Trang", deptVi: "Nhóm Talent DB & Skill Map 2", role: "Nhân viên" },
    { jp: "ドアン ビエット ホアン", romaji: "Doan Viet Hoang", deptVi: "Nhóm Talent DB & Skill Map 2", role: "Nhân viên" },
    { jp: "レ ヴァン ロン", romaji: "Le Van Long", deptVi: "Nhóm Talent DB & Skill Map 2", role: "Nhân viên" },
    { jp: "杉山 豪", romaji: "Sugiyama Gou", deptVi: "Nhóm Talent DB & Skill Map 2", role: "Nhân viên" },
    { jp: "マック ヴァン アン", romaji: "Mac Van Anh", deptVi: "Nhóm Talent DB & Skill Map 2", role: "Nhân viên" },

    // タレントデータベース・スキルマップ3チーム
    { jp: "レー ホアン アイン チュン", romaji: "Le Hoang Anh Trung", deptVi: "Nhóm Talent DB & Skill Map 3", role: "Leader" },
    { jp: "タイ ゴック クアン", romaji: "Thai Ngoc Quan", deptVi: "Nhóm Talent DB & Skill Map 3", role: "Nhân viên" },
    { jp: "ブイ ファン ミン フン", romaji: "Bui Phan Minh Hung", deptVi: "Nhóm Talent DB & Skill Map 3", role: "Nhân viên" },
    { jp: "レー アイン トゥアン", romaji: "Le Anh Tuan", deptVi: "Nhóm Talent DB & Skill Map 3", role: "Nhân viên" },
    { jp: "ファム トゥアン バック", romaji: "Pham Tuan Bac", deptVi: "Nhóm Talent DB & Skill Map 3", role: "Nhân viên" },

    // 人事申請チーム
    { jp: "長谷川 陽介", romaji: "Hasegawa Yousuke", deptVi: "Nhóm Đơn Nhân sự", role: "Nhân viên" },
    { jp: "ヴォ クアン タイン ダット", romaji: "Vo Quang Thanh Dat", deptVi: "Nhóm Đơn Nhân sự", role: "Nhân viên" },

    // 1on1チーム
    { jp: "ギエム ラン アイン", romaji: "Nghiem Lan Anh", deptVi: "Nhóm 1on1", role: "Leader" },
    { jp: "グエン テイエン ズン", romaji: "Nguyen Tien Dung", deptVi: "Nhóm 1on1", role: "Nhân viên" },
    { jp: "ファム ティ マイ トゥエット", romaji: "Pham Thi Mai Tuyet", deptVi: "Nhóm 1on1", role: "Nhân viên" },
    { jp: "ヴァン ダン フイ", romaji: "Van Dang Huy", deptVi: "Nhóm 1on1", role: "Nhân viên" },
    { jp: "グエン ドック ティエン", romaji: "Nguyen Duc Tien", deptVi: "Nhóm 1on1", role: "Nhân viên" },

    // Bizmatch・マイページチーム
    { jp: "荻堂 芽衣", romaji: "Ogidou Mei", deptVi: "Nhóm Bizmatch & MyPage", role: "Leader" },
    { jp: "湯 世強", romaji: "You Seikyou", deptVi: "Nhóm Bizmatch & MyPage", role: "Nhân viên" },
    { jp: "黄 善裕", romaji: "Kou Zenyuu", deptVi: "Nhóm Bizmatch & MyPage", role: "Nhân viên" },

    // 目標管理チーム
    { jp: "上平 洋輔", romaji: "Kamihira Yousuke", deptVi: "Nhóm Quản lý Mục tiêu", role: "Nhân viên" },
    { jp: "浅見 那治", romaji: "Asami Naoji", deptVi: "Nhóm Quản lý Mục tiêu", role: "Nhân viên biệt phái" },
    { jp: "安仁屋 勝成", romaji: "Aniya Katsunari", deptVi: "Nhóm Quản lý Mục tiêu", role: "Nhân viên biệt phái" },
    { jp: "江澤 誠哉", romaji: "Ezawa Seiya", deptVi: "Nhóm Quản lý Mục tiêu", role: "Nhân viên biệt phái" },

    // ラーニングプラットフォームチーム
    { jp: "小笠原 流", romaji: "Ogasawara Ryuu", deptVi: "Nhóm Learning Platform", role: "Nhân viên biệt phái" },
    { jp: "高橋 香江", romaji: "Takahashi Kae", deptVi: "Nhóm Learning Platform", role: "Nhân viên biệt phái" },
    { jp: "織田 涼矢", romaji: "Oda Ryouya", deptVi: "Nhóm Learning Platform", role: "Nhân viên biệt phái" },
    { jp: "峰久 菖伍", romaji: "Minehisa Shougo", deptVi: "Nhóm Learning Platform", role: "Nhân viên biệt phái" },

    // モチベーションサーベイチーム
    { jp: "前川 誠", romaji: "Maekawa Makoto", deptVi: "Nhóm Khảo sát Động lực", role: "Leader" },
    { jp: "平山 貴紀", romaji: "Hirayama Takanori", deptVi: "Nhóm Khảo sát Động lực", role: "Nhân viên biệt phái" },
    { jp: "山口 海斗", romaji: "Yamaguchi Kaito", deptVi: "Nhóm Khảo sát Động lực", role: "Nhân viên biệt phái" },

    // 組織人員配置チーム
    { jp: "角田 知之", romaji: "Tsunoda Tomoyuki", deptVi: "Nhóm Bố trí Nhân sự Tổ chức", role: "Nhân viên biệt phái" },
    { jp: "吉見 自然", romaji: "Yoshimi Shizen", deptVi: "Nhóm Bố trí Nhân sự Tổ chức", role: "Nhân viên biệt phái" },
    { jp: "向井 太一", romaji: "Mukai Taichi", deptVi: "Nhóm Bố trí Nhân sự Tổ chức", role: "Nhân viên biệt phái" },
    { jp: "山本 裕司", romaji: "Yamamoto Yuuji", deptVi: "Nhóm Bố trí Nhân sự Tổ chức", role: "Nhân viên biệt phái" },
    { jp: "文 康新", romaji: "Bun Koushin", deptVi: "Nhóm Bố trí Nhân sự Tổ chức", role: "Nhân viên biệt phái" },
    { jp: "伊藤 怜香", romaji: "Itou Reika", deptVi: "Nhóm Bố trí Nhân sự Tổ chức", role: "Nhân viên biệt phái" },
    { jp: "王 少博", romaji: "Ou Shouhaku", deptVi: "Nhóm Bố trí Nhân sự Tổ chức", role: "Nhân viên biệt phái" },

    // ポジション管理チーム
    { jp: "永井 みなみ", romaji: "Nagai Minami", deptVi: "Nhóm Quản lý Vị trí", role: "Nhân viên phái cử" },
    { jp: "林 勇人", romaji: "Hayashi Hayato", deptVi: "Nhóm Quản lý Vị trí", role: "Nhân viên biệt phái" },
    { jp: "栗原 俊祐", romaji: "Kurihara Shunsuke", deptVi: "Nhóm Quản lý Vị trí", role: "Nhân viên biệt phái" },
    { jp: "長谷川 雄吾", romaji: "Hasegawa Yuugo", deptVi: "Nhóm Quản lý Vị trí", role: "Nhân viên biệt phái" },
    { jp: "宮内 譲也", romaji: "Miyauchi Jouya", deptVi: "Nhóm Quản lý Vị trí", role: "Nhân viên biệt phái" },
    { jp: "羽根田 海", romaji: "Haneda Kai", deptVi: "Nhóm Quản lý Vị trí", role: "Nhân viên biệt phái" },
    { jp: "鏑木 瑛司", romaji: "Kaburagi Eiji", deptVi: "Nhóm Quản lý Vị trí", role: "Nhân viên biệt phái" },
    { jp: "杉本 大斗", romaji: "Sugimoto Daito", deptVi: "Nhóm Quản lý Vị trí", role: "Nhân viên biệt phái" },

    // サクセッションプランチーム
    { jp: "吉水 智宗", romaji: "Yoshimizu Tomomune", deptVi: "Nhóm Kế hoạch Kế nhiệm", role: "Nhân viên biệt phái" },
    { jp: "溝口 紘一郎", romaji: "Mizoguchi Kouichirou", deptVi: "Nhóm Kế hoạch Kế nhiệm", role: "Nhân viên biệt phái" },
    { jp: "岡 将秀", romaji: "Oka Masahide", deptVi: "Nhóm Kế hoạch Kế nhiệm", role: "Nhân viên biệt phái" },
    { jp: "増川 敬亮", romaji: "Masukawa Keisuke", deptVi: "Nhóm Kế hoạch Kế nhiệm", role: "Nhân viên biệt phái" },
    { jp: "髙木 正志", romaji: "Takagi Masashi", deptVi: "Nhóm Kế hoạch Kế nhiệm", role: "Nhân viên biệt phái" },
    { jp: "任 柏儒", romaji: "Jin Hakujyu", deptVi: "Nhóm Kế hoạch Kế nhiệm", role: "Nhân viên biệt phái" },
    { jp: "廣岡 慶一", romaji: "Hirooka Keiichi", deptVi: "Nhóm Kế hoạch Kế nhiệm", role: "Nhân viên biệt phái" },

    // 要員計画チーム
    { jp: "福岡 正康", romaji: "Fukuoka Masayasu", deptVi: "Nhóm Kế hoạch Nhân lực", role: "Nhân viên biệt phái" },
    { jp: "古屋 智惠里", romaji: "Furuya Chieri", deptVi: "Nhóm Kế hoạch Nhân lực", role: "Nhân viên biệt phái" },
    { jp: "長谷川 晴菜", romaji: "Hasegawa Haruna", deptVi: "Nhóm Kế hoạch Nhân lực", role: "Nhân viên biệt phái" },
    { jp: "梶原 顕伍", romaji: "Kajiwara Kengo", deptVi: "Nhóm Kế hoạch Nhân lực", role: "Nhân viên biệt phái" },
    { jp: "井上 大輝", romaji: "Inoue Daiki", deptVi: "Nhóm Kế hoạch Nhân lực", role: "Nhân viên biệt phái" },
    { jp: "松井 勇人", romaji: "Matsui Hayato", deptVi: "Nhóm Kế hoạch Nhân lực", role: "Nhân viên biệt phái" },

    // HCIチーム
    { jp: "恋塚 大", romaji: "Koizuka Dai", deptVi: "Nhóm HCI", role: "Nhân viên biệt phái" },
    { jp: "黒川 真広", romaji: "Kurokawa Masahiro", deptVi: "Nhóm HCI", role: "Nhân viên biệt phái" },
    { jp: "武原 大地", romaji: "Takehara Daichi", deptVi: "Nhóm HCI", role: "Nhân viên biệt phái" },
    { jp: "持田 裕基", romaji: "Mochida Yuuki", deptVi: "Nhóm HCI", role: "Nhân viên biệt phái" },
    { jp: "五味 響気", romaji: "Gomi Hibiki", deptVi: "Nhóm HCI", role: "Nhân viên biệt phái" },
    { jp: "原口 果也", romaji: "Haraguchi Kaya", deptVi: "Nhóm HCI", role: "Nhân viên biệt phái" },
    { jp: "松原 悠人", romaji: "Matsubara Yuuto", deptVi: "Nhóm HCI", role: "Nhân viên biệt phái" },
    { jp: "吉田 幸代", romaji: "Yoshida Sachiyo", deptVi: "Nhóm HCI", role: "Nhân viên biệt phái" },
    { jp: "堀井 駿佑", romaji: "Horii Shunsuke", deptVi: "Nhóm HCI", role: "Nhân viên biệt phái" },
    { jp: "風見 亮", romaji: "Kazami Ryou", deptVi: "Nhóm HCI", role: "Nhân viên biệt phái" },
    { jp: "齋藤 康生", romaji: "Saitou Kousei", deptVi: "Nhóm HCI", role: "Nhân viên biệt phái" },

    // PM支援・技術支援チーム
    { jp: "與那嶺 正司", romaji: "Yonamine Seiji", deptVi: "Nhóm Hỗ trợ PM & Kỹ thuật", role: "Manager" },
    { jp: "ディルシャン サンディーパ", romaji: "Dilshan Sandeepa", deptVi: "Nhóm Hỗ trợ PM & Kỹ thuật", role: "Nhân viên" },
    { jp: "馬目 和宜", romaji: "Manome Kazunori", deptVi: "Nhóm Hỗ trợ PM & Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "石井 健一朗", romaji: "Ishii Kenichirou", deptVi: "Nhóm Hỗ trợ PM & Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "平野 素大", romaji: "Hirano Motohiro", deptVi: "Nhóm Hỗ trợ PM & Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "伍 緯凱", romaji: "Go Igai", deptVi: "Nhóm Hỗ trợ PM & Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "大室 英寛", romaji: "Oomuro Hidehiro", deptVi: "Nhóm Hỗ trợ PM & Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "時任 幹太", romaji: "Tokitou Kanta", deptVi: "Nhóm Hỗ trợ PM & Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "古谷 海斗", romaji: "Furuya Kaito", deptVi: "Nhóm Hỗ trợ PM & Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "工藤 雅人", romaji: "Kudou Masato", deptVi: "Nhóm Hỗ trợ PM & Kỹ thuật", role: "Nhân viên biệt phái" },

    // テクニカルQAチーム
    { jp: "内間 輝一", romaji: "Uchima Kiichi", deptVi: "Nhóm QA Kỹ thuật", role: "Leader" },
    { jp: "川井 れな", romaji: "Kawai Rena", deptVi: "Nhóm QA Kỹ thuật", role: "Nhân viên" },
    { jp: "影山 亮太", romaji: "Kageyama Ryouta", deptVi: "Nhóm QA Kỹ thuật", role: "Nhân viên" },
    { jp: "眞喜志 涼太", romaji: "Makishi Ryouta", deptVi: "Nhóm QA Kỹ thuật", role: "Nhân viên" },
    { jp: "仲間 泉", romaji: "Nakama Izumi", deptVi: "Nhóm QA Kỹ thuật", role: "Nhân viên" },
    { jp: "遠藤 佑貴", romaji: "Endou Yuuki", deptVi: "Nhóm QA Kỹ thuật", role: "Nhân viên" },
    { jp: "中村 真紀", romaji: "Nakamura Maki", deptVi: "Nhóm QA Kỹ thuật", role: "Nhân viên" },
    { jp: "小山 護", romaji: "Koyama Mamoru", deptVi: "Nhóm QA Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "廣川 由実", romaji: "Hirokawa Yumi", deptVi: "Nhóm QA Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "喜田 啓良", romaji: "Kida Hiroyoshi", deptVi: "Nhóm QA Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "上田 優理絵", romaji: "Ueda Yurie", deptVi: "Nhóm QA Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "水谷 香奈子", romaji: "Mizutani Kanako", deptVi: "Nhóm QA Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "臼井 時大", romaji: "Usui Tokihiro", deptVi: "Nhóm QA Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "岡田 知樹", romaji: "Okada Tomoki", deptVi: "Nhóm QA Kỹ thuật", role: "Nhân viên biệt phái" },
    { jp: "篠 雅和", romaji: "Shino Masakazu", deptVi: "Nhóm QA Kỹ thuật", role: "Nhân viên biệt phái" },

    // SREチーム
    { jp: "萩田 雅也", romaji: "Hagita Masaya", deptVi: "Nhóm SRE", role: "Manager" },
    { jp: "佐藤 良昭", romaji: "Satou Yoshiaki", deptVi: "Nhóm SRE", role: "Nhân viên" },
    { jp: "朴 相元", romaji: "Paku Sougen", deptVi: "Nhóm SRE", role: "Nhân viên" },
    { jp: "ヴェンカテサン サティシュ", romaji: "Venkatesan Satish", deptVi: "Nhóm SRE", role: "Nhân viên" },
    { jp: "玉木 将人", romaji: "Tamaki Masato", deptVi: "Nhóm SRE", role: "Nhân viên" },
    { jp: "小島 杏水", romaji: "Kojima Anami", deptVi: "Nhóm SRE", role: "Nhân viên biệt phái" },
    { jp: "米谷 正道", romaji: "Yoneya Masamichi", deptVi: "Nhóm SRE", role: "Nhân viên biệt phái" },
    { jp: "佐々木 浩史", romaji: "Sasaki Hiroshi", deptVi: "Nhóm SRE", role: "Nhân viên biệt phái" },
    { jp: "安藤 勝啓", romaji: "Andou Katsuhiro", deptVi: "Nhóm SRE", role: "Nhân viên biệt phái" },

    // セールスエンジニアリングチーム
    { jp: "松本 幹匡", romaji: "Matsumoto Mikimasa", deptVi: "Nhóm Sales Engineering", role: "Leader" },
    { jp: "大内 琉", romaji: "Oouchi Ryuu", deptVi: "Nhóm Sales Engineering", role: "Nhân viên" },
    { jp: "鈴木 源斗", romaji: "Suzuki Gento", deptVi: "Nhóm Sales Engineering", role: "Nhân viên" },
];

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════
function makeQuestion() {
    const correctIdx = Math.floor(Math.random() * PEOPLE.length);
    const correct = PEOPLE[correctIdx];

    const distractors = [];
    const usedRomaji = new Set([correct.romaji]);
    const usedIdx = new Set([correctIdx]);
    while (distractors.length < 3) {
        const i = Math.floor(Math.random() * PEOPLE.length);
        if (usedIdx.has(i)) continue;
        const p = PEOPLE[i];
        if (usedRomaji.has(p.romaji)) continue;
        usedIdx.add(i);
        usedRomaji.add(p.romaji);
        distractors.push(p);
    }

    const options = [correct, ...distractors]
        .map((p) => ({ p, k: Math.random() }))
        .sort((a, b) => a.k - b.k)
        .map((x) => x.p);

    return { person: correct, options };
}

// ═══════════════════════════════════════════════════════════════════════
// Avatar monogram màu từ hash
// ═══════════════════════════════════════════════════════════════════════
function hashHue(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h) % 360;
}

function getMonogram(jpName) {
    const parts = jpName.trim().split(/\s+/);
    if (parts.length >= 2) return parts[0].slice(0, 1) + parts[1].slice(0, 1);
    return jpName.slice(0, 2);
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════
export default function NameQuizPage() {
    const [q, setQ] = useState(() => makeQuestion());
    const [picked, setPicked] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const handlePick = useCallback(
        (option) => {
            if (picked) return;
            setPicked(option);
            setScore((s) => ({
                correct: s.correct + (option.romaji === q.person.romaji ? 1 : 0),
                total: s.total + 1,
            }));
        },
        [picked, q]
    );

    const handleNext = useCallback(() => {
        setQ(makeQuestion());
        setPicked(null);
    }, []);

    const handleReset = useCallback(() => {
        setScore({ correct: 0, total: 0 });
        setQ(makeQuestion());
        setPicked(null);
    }, []);

    // Keyboard shortcuts: 1-4 chọn, Enter = câu tiếp
    useEffect(() => {
        const onKey = (e) => {
            if (e.key >= "1" && e.key <= "4" && !picked) {
                const idx = parseInt(e.key, 10) - 1;
                if (q.options[idx]) handlePick(q.options[idx]);
            } else if ((e.key === "Enter" || e.key === " ") && picked) {
                e.preventDefault();
                handleNext();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [q, picked, handlePick, handleNext]);

    const isCorrect = picked && picked.romaji === q.person.romaji;
    const hue = hashHue(q.person.jp);

    const accuracy = score.total ? Math.round((score.correct / score.total) * 100) : 0;

    return (
        <>
            <style>{CSS}</style>
            <div className="hp-lay">
                <Sidebar activeId="" />
                <div className="hp-main">
                    <div className="nq-page">
                        <div className="nq-header">
                            <div className="nq-header__left">
                                <div className="nq-header__icon">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5d8a72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="8" r="7" strokeDasharray="2 3" opacity="0.35" />
                                    </svg>
                                </div>
                                <h1>名前クイズ · Đố tên nhân viên</h1>
                            </div>
                            <div className="nq-score">
                                <div className="nq-score__item">
                                    <span className="nq-score__num">{score.correct}</span>
                                    <span className="nq-score__lbl">Đúng</span>
                                </div>
                                <div className="nq-score__sep">/</div>
                                <div className="nq-score__item">
                                    <span className="nq-score__num">{score.total}</span>
                                    <span className="nq-score__lbl">Tổng</span>
                                </div>
                                <div className="nq-score__acc">{accuracy}%</div>
                                <button className="nq-btn nq-btn--ghost nq-btn--sm" onClick={handleReset} title="Reset điểm">
                                    ↻
                                </button>
                            </div>
                        </div>
                        <p className="nq-intro">
                            Đọc tên người này bằng romaji là gì? Phím tắt: <kbd>1</kbd>–<kbd>4</kbd> chọn, <kbd>Enter</kbd> câu tiếp.
                        </p>

                        {/* Card nhân viên */}
                        <div className="nq-card">
                            <div
                                className="nq-avatar"
                                style={{ background: `hsl(${hue}, 48%, 60%)` }}
                            >
                                {getMonogram(q.person.jp)}
                            </div>
                            <div className="nq-info">
                                <div className="nq-info__dept">{q.person.deptVi}</div>
                                <div className="nq-info__name" lang="ja">{q.person.jp}</div>
                                <div className="nq-info__role">{q.person.role}</div>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="nq-options">
                            {q.options.map((opt, i) => {
                                const isPicked = picked === opt;
                                const isAnsweredCorrect = picked && opt.romaji === q.person.romaji;
                                let cls = "nq-opt";
                                if (picked) {
                                    if (isAnsweredCorrect) cls += " is-correct";
                                    else if (isPicked) cls += " is-wrong";
                                    else cls += " is-dim";
                                }
                                return (
                                    <button
                                        key={i}
                                        className={cls}
                                        onClick={() => handlePick(opt)}
                                        disabled={!!picked}
                                    >
                                        <span className="nq-opt__num">{i + 1}</span>
                                        <span className="nq-opt__text">{opt.romaji}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Feedback */}
                        {picked && (
                            <div className={`nq-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
                                <div className="nq-feedback__head">
                                    {isCorrect ? "🎉 Chính xác!" : "❌ Sai rồi"}
                                </div>
                                {!isCorrect && (
                                    <div className="nq-feedback__body">
                                        Đáp án đúng: <b>{q.person.romaji}</b>
                                    </div>
                                )}
                                <button className="nq-btn nq-btn--primary" onClick={handleNext}>
                                    Câu tiếp →
                                </button>
                            </div>
                        )}

                        <div className="nq-footer">
                            Dữ liệu dựa trên danh sách nhân viên Cydas ({PEOPLE.length} người).
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════════
const CSS = `
.hp-lay{display:flex;min-height:calc(100vh - 64px)}
.hp-main{flex:1;background:#fff;min-width:0;overflow-y:auto}
.nq-page{max-width:720px;margin:0 auto;padding:32px 48px 64px}
@media(max-width:1023px){.nq-page{padding:24px 24px 48px}}
@media(max-width:767px){.nq-page{padding:16px 16px 32px}}

.nq-header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:4px}
.nq-header__left{display:flex;align-items:center;gap:10px}
.nq-header__left h1{font-size:20px;font-weight:700;color:#333;margin:0}
.nq-header__icon{display:flex}

.nq-score{display:flex;align-items:center;gap:8px;background:#f7faf8;border:1px solid #e4ede8;border-radius:10px;padding:6px 12px}
.nq-score__item{display:flex;flex-direction:column;align-items:center;min-width:34px}
.nq-score__num{font-size:16px;font-weight:700;color:#333;line-height:1}
.nq-score__lbl{font-size:10px;color:#999;margin-top:2px}
.nq-score__sep{color:#bbb;font-size:16px}
.nq-score__acc{font-size:13px;font-weight:700;color:#5d8a72;padding-left:8px;border-left:1px solid #dcdcdc;margin-left:4px}
.nq-intro{font-size:13px;color:#999;margin:6px 0 20px}
.nq-intro kbd{background:#f0f2f5;border:1px solid #dcdcdc;border-radius:4px;padding:1px 5px;font-size:11px;font-family:ui-monospace,monospace;color:#555}

/* Card nhân viên */
.nq-card{display:flex;align-items:center;gap:18px;padding:24px 24px;border:1px solid #e8e8e8;border-radius:14px;background:linear-gradient(135deg,#fafffe 0%,#f7faf8 100%);box-shadow:0 2px 10px rgba(0,0,0,.03);margin-bottom:24px}
.nq-avatar{width:72px;height:72px;border-radius:16px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:700;flex-shrink:0;letter-spacing:-1px;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.nq-info{display:flex;flex-direction:column;gap:4px;min-width:0}
.nq-info__dept{font-size:12px;color:#5d8a72;font-weight:600;text-transform:uppercase;letter-spacing:.4px}
.nq-info__name{font-size:28px;font-weight:700;color:#222;line-height:1.2;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif}
@media(max-width:767px){.nq-info__name{font-size:22px}}
.nq-info__role{font-size:12px;color:#999}

/* Options */
.nq-options{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
@media(max-width:560px){.nq-options{grid-template-columns:1fr}}
.nq-opt{display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid #e4e6ea;border-radius:10px;background:#fff;cursor:pointer;transition:all .15s;font-family:inherit;text-align:left}
.nq-opt:hover:not(:disabled){border-color:#5d8a72;background:#fafffe;transform:translateY(-1px)}
.nq-opt:disabled{cursor:default}
.nq-opt__num{width:24px;height:24px;border-radius:50%;background:#f0f2f5;color:#888;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.nq-opt__text{font-size:15px;font-weight:600;color:#333}
.nq-opt.is-correct{border-color:#5d8a72;background:#eaf7ef}
.nq-opt.is-correct .nq-opt__num{background:#5d8a72;color:#fff}
.nq-opt.is-wrong{border-color:#e53935;background:#fce4ec}
.nq-opt.is-wrong .nq-opt__num{background:#e53935;color:#fff}
.nq-opt.is-dim{opacity:.45}

/* Feedback */
.nq-feedback{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:18px 20px;border-radius:12px;animation:nqFi .2s ease}
.nq-feedback.is-correct{background:#eaf7ef;border:1px solid #b9dcc7}
.nq-feedback.is-wrong{background:#fff5f7;border:1px solid #f3c6d0}
.nq-feedback__head{font-size:15px;font-weight:700;color:#333}
.nq-feedback__body{font-size:14px;color:#555}
@keyframes nqFi{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}

/* Buttons */
.nq-btn{display:inline-flex;align-items:center;gap:6px;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s}
.nq-btn--sm{padding:4px 10px;font-size:14px;line-height:1}
.nq-btn--primary{background:#5d8a72;color:#fff}
.nq-btn--primary:hover{background:#4a7560}
.nq-btn--ghost{background:transparent;color:#888;border:1px solid #dcdcdc}
.nq-btn--ghost:hover{background:#f0f2f5}

.nq-footer{margin-top:32px;text-align:center;font-size:11px;color:#bbb}
`;
