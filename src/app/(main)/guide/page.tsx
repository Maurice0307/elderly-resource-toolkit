import Link from "next/link";
import { ELIcon } from "@/components/layout/ELIcon";

export const metadata = { title: "我們的理念" };

const STEPS = [
  { icon: "search",    title: "搜尋資源",   desc: "在首頁搜尋欄輸入需求（如「長照」、「復康巴士」），或依分類瀏覽 8 大服務類別，直接取得電話與地址。" },
  { icon: "cards",     title: "互動學習",   desc: "前往「互動學習」頁面，選擇主題（手工、植栽、運動等），用步驟式大圖卡帶領長輩一起活動。" },
  { icon: "news",      title: "今日新知",   desc: "每天更新健康補助、防詐查證、在地活動等資訊，也可依標籤篩選感興趣的類別。" },
  { icon: "qa",        title: "互助問答",   desc: "有照顧上的疑問？在問答區提問，在地志工會在 24 小時內協助解答。" },
  { icon: "heart",     title: "收藏資源",   desc: "點選資源頁的愛心圖示即可收藏，登入後在個人中心「我的收藏」查看。" },
  { icon: "send",      title: "投稿好資源", desc: "知道地方上的好服務？點選「分享好資源」提報，審核通過後發布幫助更多人。" },
];

const TRUST_ITEMS = [
  { icon: "heart",   title: "永遠免費",   desc: "所有資源與教學都不收費，也不會要您付款。" },
  { icon: "pin",     title: "在地資源",   desc: "依您所在的縣市鄉鎮，整理身邊就用得到的服務。" },
  { icon: "social",  title: "真人協助",   desc: "社區志工協助校對與解答，不是冷冰冰的機器。" },
  { icon: "shield",  title: "安心可靠",   desc: "資料來自政府與民間公開資源，絕不要您匯款。" },
];

/* 區塊標題（珊瑚直條 + 標題，對齊設計稿 SectionLabel） */
function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <span style={{ width: 5, height: 22, borderRadius: 3, background: "#F26B43" }} />
      <h2 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: "#241F1B" }}>{children}</h2>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="wv-fade">
      {/* Hero 標題區 */}
      <div style={{
        background: "linear-gradient(135deg,#FFF1E9 0%,#FFE7DD 60%,#FFF4EF 100%)",
        borderBottom: "1px solid #FFE7DD",
        padding: "40px 0 36px",
      }}>
        <div className="wv-wrap">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: "#B23F1E", fontSize: 14, fontWeight: 700, padding: "6px 14px", borderRadius: 999, marginBottom: 16 }}>
            <ELIcon name="like" size={15} color="#F26B43" /> 我們的理念
          </span>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 800, color: "#241F1B", lineHeight: 1.3 }}>
            把社區的好資源，<br />整理成一處好找的地方
          </h1>
          <p style={{ margin: 0, maxWidth: 620, fontSize: 17, color: "#574E47", lineHeight: 1.75 }}>
            政府和民間其實有很多服務，卻散在四處、不好找。幸福好厝邊把它們整理在一起，讓長輩和家人
            <strong style={{ color: "#B23F1E" }}>一站就找到、一鍵就聯絡</strong>。
          </p>
        </div>
      </div>

      <div className="wv-wrap" style={{ paddingTop: 40, paddingBottom: 56, display: "flex", flexDirection: "column", gap: 44 }}>

        {/* 起源 */}
        <section style={{ background: "linear-gradient(120deg,#FFF4EF,#FFE7DD)", borderRadius: 22, padding: "28px 28px", border: "1px solid #FFE7DD" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: 23, fontWeight: 800, color: "#241F1B" }}>起源</h2>
          <p style={{ margin: 0, fontSize: 16.5, color: "#574E47", lineHeight: 1.85 }}>
            幸福好厝邊（ELDERLINK）由堉璘團隊創立，使命是把台灣各地分散的長者資源互相連結，讓家屬與志工不必花時間搜尋，直接陪伴長輩。
          </p>
        </section>

        {/* 六步上手 */}
        <section>
          <SectionHead>六步上手</SectionHead>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {STEPS.map((s, i) => (
              <div key={s.title} style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "#fff", borderRadius: 18, border: "1px solid #F0E6DE", padding: "18px 18px", boxShadow: "0 2px 8px rgba(40,30,20,0.04)" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <span style={{ width: 50, height: 50, borderRadius: 14, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ELIcon name={s.icon} size={26} color="#F26B43" />
                  </span>
                  <span style={{ position: "absolute", top: -7, left: -7, width: 26, height: 26, borderRadius: "50%", background: "#E0552E", color: "#fff", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B" }}>{s.title}</div>
                  <p style={{ margin: "5px 0 0", fontSize: 15, color: "#574E47", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 您可以放心的四件事（自適應 2 欄，手機不再擠成 4 欄） */}
        <section>
          <SectionHead>您可以放心的四件事</SectionHead>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
            {TRUST_ITEMS.map((t) => (
              <div key={t.title} style={{ background: "#fff", borderRadius: 18, border: "1px solid #F0E6DE", padding: "22px 18px" }}>
                <span style={{ width: 48, height: 48, borderRadius: 14, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 13 }}>
                  <ELIcon name={t.icon} size={25} color="#F26B43" />
                </span>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B", marginBottom: 5 }}>{t.title}</div>
                <p style={{ margin: 0, fontSize: 14.5, color: "#574E47", lineHeight: 1.65 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 仍不會用 → LINE 好友（對齊設計稿珊瑚漸層） */}
        <section style={{
          background: "linear-gradient(120deg,#E0552E,#F26B43)", borderRadius: 22, padding: "22px 26px",
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", boxShadow: "0 8px 20px rgba(224,85,46,0.26)",
        }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ELIcon name="chat" size={26} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>還是不太會用？</div>
            <div style={{ marginTop: 3, fontSize: 15, color: "rgba(255,255,255,0.92)", lineHeight: 1.5 }}>
              加 LINE 好友，用講的問就有人回，不用怕。
            </div>
          </div>
          <a
            href="https://line.me/R/ti/p/@elderlink"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#fff", color: "#B23F1E", borderRadius: 999, height: 46, padding: "0 22px",
              fontSize: 15, fontWeight: 800, textDecoration: "none", flexShrink: 0,
            }}
          >
            加 LINE 好友
          </a>
        </section>

        {/* 開始找資源 CTA */}
        <div style={{ textAlign: "center" }}>
          <Link
            href="/resources"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "linear-gradient(135deg,#F2764F,#E0552E)", color: "#fff",
              borderRadius: 999, height: 56, padding: "0 36px",
              fontSize: 18, fontWeight: 800, textDecoration: "none",
              boxShadow: "0 8px 22px rgba(224,85,46,0.3)",
            }}
          >
            <ELIcon name="check" size={20} color="#fff" />
            我學會了，開始找資源
          </Link>
        </div>

      </div>
    </div>
  );
}
