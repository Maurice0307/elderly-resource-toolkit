import { MobileSubHeader } from "@/components/layout/MobileSubHeader";
import { ELIcon } from "@/components/layout/ELIcon";
import { FaqList } from "@/components/help/FaqList";

export const metadata = { title: "常見問題與聯絡" };

const FAQS = [
  { q: "這個服務要錢嗎？", a: "完全免費。幸福好厝邊是公益平台，所有資源查找、互動學習、問答都不收費。" },
  { q: "我不會打字，可以用說的嗎？", a: "可以。首頁搜尋框旁邊有「改用語音說出需求」，按一下對著手機說話就能搜尋。" },
  { q: "資料正確嗎？多久更新一次？", a: "資源由志工查證、定期更新，每筆都會標示「上次查證」時間。若發現有誤，歡迎在該頁回報，我們會盡快修正。" },
  { q: "怎麼把資源傳給家人？", a: "進入任一資源或文章，點右上角的分享，就能直接傳到 LINE 或複製連結給家人。" },
  { q: "一定要登入嗎？", a: "不用。沒登入也能查資源、看教學。登入後可以收藏、記錄學習進度，換手機也找得回來。" },
  { q: "登入方式可以換嗎？", a: "可以。到「個人中心 → 編輯 → 登入與帳號連結」綁定 LINE、Google 或手機，之後任一種登入都是同一個帳號。" },
];

export default function FaqPage() {
  return (
    <div className="wv-fade" style={{ background: "#FAF6F2", minHeight: "100%" }}>
      <MobileSubHeader title="常見問題與聯絡" search={false} />

      <div style={{ padding: "14px 18px 28px", maxWidth: 640, margin: "0 auto" }}>
        <p style={{ margin: "0 0 14px", fontSize: 16, color: "#574E47", lineHeight: 1.6 }}>找不到答案？歡迎直接與我們聯絡，我們會盡快回覆。</p>

        <FaqList faqs={FAQS} />

        {/* 聯絡 */}
        <div style={{ marginTop: 22, fontSize: 13, fontWeight: 800, color: "#9C8E84", letterSpacing: 0.5, paddingLeft: 2, marginBottom: 8 }}>聯絡我們</div>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE", padding: "2px 16px" }}>
          <a href="mailto:itchiang2025@gmail.com" className="click" style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 0", textDecoration: "none" }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ELIcon name="send" size={21} color="#F26B43" /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: "#241F1B" }}>寫信給我們</div>
              <div style={{ fontSize: 13, color: "#6E645C", marginTop: 1 }}>itchiang2025@gmail.com</div>
            </div>
            <ELIcon name="chevron" size={20} color="#C8B8AE" />
          </a>
          <a href="tel:0968786545" className="click" style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 0", textDecoration: "none", borderTop: "1px solid #F0E6DE" }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ELIcon name="phone" size={21} color="#F26B43" /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: "#241F1B" }}>打電話給我們</div>
              <div style={{ fontSize: 13, color: "#6E645C", marginTop: 1 }}>0968-786-545（平日 9–18 時）</div>
            </div>
            <ELIcon name="chevron" size={20} color="#C8B8AE" />
          </a>
        </div>
      </div>
    </div>
  );
}
