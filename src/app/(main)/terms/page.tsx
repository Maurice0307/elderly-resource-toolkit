import { MobileSubHeader } from "@/components/layout/MobileSubHeader";
import { ELIcon } from "@/components/layout/ELIcon";

export const metadata = { title: "服務條款" };

const SECTIONS: { icon: string; t: string; d: string }[] = [
  {
    icon: "heart",
    t: "關於本服務",
    d: "「幸福好厝邊 ElderLink」是一個免費的高齡照顧資源導航平台，運用政府開放資料，協助長者與家屬查找在地長照、醫療、交通、補助等資源，並提供互助問答、活動與智慧客服等功能。使用本服務即表示您同意以下條款。",
  },
  {
    icon: "search",
    t: "資料來源與正確性",
    d: "平台資源資料整合自政府開放資料平台（data.gov.tw）及衛生福利部、各縣市政府等公開資訊，僅供參考。實際服務內容、申請資格、補助金額與聯絡方式，請以各主管機關最新公告為準；使用前建議先電話確認。",
  },
  {
    icon: "shield",
    t: "非專業建議・緊急狀況",
    d: "本平台提供的是資訊導引，不構成醫療、法律或財務等專業建議。身體不適請就醫，緊急狀況請撥 119（救護）、110（報案）；長照諮詢 1966、福利諮詢 1957、反詐騙 165、安心專線 1925。",
  },
  {
    icon: "chat",
    t: "使用者內容（互助問答）",
    d: "於互助問答等功能張貼內容時，請遵守法令、尊重他人，勿張貼不實、廣告、攻擊或侵權內容。本平台有權移除不當內容或暫停違規帳號。您張貼的內容授權本平台於服務範圍內顯示與利用。",
  },
  {
    icon: "star",
    t: "智慧財產與授權",
    d: "本平台之原創內容（介面、文字整理等）採用「創用 CC 姓名標示 4.0（CC BY 4.0）」授權，歡迎於標示來源下分享運用。所引用之政府開放資料，依其原始授權條款（多為政府資料開放授權條款）辦理。",
  },
  {
    icon: "lock",
    t: "隱私保護",
    d: "您的登入資訊與收藏紀錄僅用於提供服務，不會販售或外流。詳見「隱私與帳號安全」頁面，您可隨時一鍵刪除帳號與所有資料。",
  },
  {
    icon: "megaphone",
    t: "免責聲明",
    d: "本平台盡力維護資料正確與即時，但不保證完全無誤或持續可用，對於因使用本服務所生之損失不負賠償責任。使用者應自行查證後審慎使用。",
  },
];

export default function TermsPage() {
  return (
    <div className="wv-fade" style={{ background: "#FAF6F2", minHeight: "100%" }}>
      <MobileSubHeader title="服務條款" search={false} />

      <div style={{ padding: "14px 18px 28px", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#9C8E84", letterSpacing: 0.5, paddingLeft: 2, marginBottom: 8 }}>
          使用本平台前，請先了解
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SECTIONS.map((p) => (
            <div key={p.t} style={{ display: "flex", gap: 13, background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE", padding: "15px 16px" }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ELIcon name={p.icon} size={21} color="#F26B43" />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#241F1B" }}>{p.t}</div>
                <div style={{ fontSize: 14, color: "#574E47", lineHeight: 1.6, marginTop: 2 }}>{p.d}</div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ margin: "18px 2px 0", fontSize: 12.5, color: "#9C8E84", lineHeight: 1.7 }}>
          意見回饋與條款相關問題，歡迎來信 itchiang2025@gmail.com。幸福好厝邊 ElderLink v1.0
        </p>
      </div>
    </div>
  );
}
