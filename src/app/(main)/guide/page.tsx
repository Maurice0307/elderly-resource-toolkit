import Link from "next/link";
import { ELIcon } from "@/components/layout/ELIcon";
import { FontSizeCTA } from "@/components/guide/FontSizeCTA";

export const metadata = { title: "我們的理念" };

const THREE_STEPS = [
  {
    num: 1, icon: "search", title: "找資源",
    desc: "在「資源查找」打字或照分類，例如「量血壓」「復康巴士」，馬上看到附近的服務。",
  },
  {
    num: 2, icon: "phone", title: "一鍵打電話",
    desc: "看到電話號碼，按一下就直接撥打，不用記電話號碼，也不需要手動輸入。",
  },
  {
    num: 3, icon: "chat", title: "不會用就問",
    desc: "加 LINE 好友，用講的也能查詢，在地志工會協助回應，不冰冷、不孤單。",
  },
];

const STEPS = [
  { icon: "search",    title: "搜尋資源",   desc: "在首頁搜尋欄輸入需求（如「長照」、「復康巴士」），或依分類瀏覽 8 大服務類別，直接取得電話與地址。" },
  { icon: "cards",     title: "互動學習",   desc: "前往「互動學習」頁面，選擇主題（手工、植栽、運動等），用步驟式大圖卡帶領長輩一起活動。" },
  { icon: "news",      title: "今日新知",   desc: "每天更新健康補助、防詐查證、在地活動等資訊，也可依標籤篩選感興趣的類別。" },
  { icon: "qa",        title: "互助問答",   desc: "有照顧上的疑問？在問答區提問，在地志工會在 24 小時內協助解答。" },
  { icon: "heart",     title: "收藏資源",   desc: "點選資源頁的愛心圖示即可收藏，登入後在個人中心「我的收藏」查看。" },
  { icon: "send",      title: "投稿好資源", desc: "知道地方上的好服務？點選「分享好資源」提報，審核通過後發布幫助更多人。" },
];

const TRUST_ITEMS = [
  { icon: "heart",   title: "永遠免費",   desc: "所有資源與教學都不收費，也不會要求付出。" },
  { icon: "pin",     title: "在地資源",   desc: "看到最合適的縣市鄉鎮，整理身邊就能找到的服務。" },
  { icon: "social",  title: "真人協助",   desc: "社區志工協助到解答，不是冰冷的機器人。" },
  { icon: "shield",  title: "安心可靠",   desc: "資料來自政府與民間公認資源，絕不亂推廣。" },
];

export default function GuidePage() {
  return (
    <div className="wv-fade">
      {/* Hero 標題區 */}
      <div style={{
        background: "linear-gradient(135deg,#FFF1E9 0%,#FFE3D5 60%,#FFF4EF 100%)",
        borderBottom: "1px solid #FFE7DD",
        padding: "52px 0 44px",
        textAlign: "center",
      }}>
        <div className="wv-wrap">
          <div style={{ fontSize: 14, fontWeight: 800, color: "#B23F1E", letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>
            我們的理念
          </div>
          <h1 style={{ margin: "0 0 18px", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, color: "#241F1B", lineHeight: 1.25 }}>
            把社區的好資源，<br />整理成一處好找的地方
          </h1>
          <p style={{ margin: "0 auto", maxWidth: 560, fontSize: 17, color: "#574E47", lineHeight: 1.75 }}>
            政府和民間其實有很多服務，卻散在四處、不好找。幸福好厝邊把它們整理在一起，讓長輩和家人
            <strong style={{ color: "#241F1B" }}>一站就找到、一鍵就聯絡</strong>。
          </p>
        </div>
      </div>

      <div className="wv-wrap" style={{ paddingTop: 52, paddingBottom: 64 }}>

        {/* 三步驟 */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 800, color: "#241F1B" }}>三步驟・馬上會用</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
            {THREE_STEPS.map((s) => (
              <div key={s.num} style={{ background: "#fff", borderRadius: 18, border: "1px solid #F0E6DE", padding: "26px 22px" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: "#E0552E",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17, fontWeight: 900, color: "#fff", marginBottom: 16,
                }}>
                  {s.num}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <ELIcon name={s.icon} size={22} color="#F26B43" />
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B" }}>{s.title}</div>
                </div>
                <p style={{ margin: 0, fontSize: 15, color: "#574E47", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 覺得字太小？一鍵放大字級 */}
        <FontSizeCTA />

        {/* 起源 */}
        <div style={{ marginBottom: 56, background: "linear-gradient(120deg,#FFF4EF,#FFE7DD)", borderRadius: 22, padding: "32px 36px", border: "1px solid #FFE7DD" }}>
          <h2 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 800, color: "#241F1B" }}>起源</h2>
          <p style={{ margin: 0, fontSize: 16, color: "#574E47", lineHeight: 1.8 }}>
            幸福好厝邊（ELDERLINK）由堉璘團隊創立，使命是把台灣各地分散的長者資源互相連結，讓家屬與志工不必花時間搜尋，直接陪伴長輩。
          </p>
        </div>

        {/* 六步上手 */}
        <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 800, color: "#241F1B" }}>六步上手</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18, marginBottom: 56 }}>
          {STEPS.map((s, i) => (
            <div key={s.title} style={{ background: "#fff", borderRadius: 18, border: "1px solid #F0E6DE", padding: "22px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ELIcon name={s.icon} size={22} color="#F26B43" />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#B23F1E" }}>STEP {i + 1}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B" }}>{s.title}</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14.5, color: "#574E47", lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* 您可以放心的四件事（單排） */}
        <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: "#241F1B" }}>您可以放心的四件事</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 52 }}>
          {TRUST_ITEMS.map((t) => (
            <div key={t.title} style={{ background: "#fff", borderRadius: 18, border: "1px solid #F0E6DE", padding: "22px 18px", textAlign: "center" }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <ELIcon name={t.icon} size={26} color="#F26B43" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#241F1B", marginBottom: 6 }}>{t.title}</div>
              <p style={{ margin: 0, fontSize: 14, color: "#574E47", lineHeight: 1.6 }}>{t.desc}</p>
            </div>
          ))}
        </div>

        {/* LINE 好友 CTA */}
        <div style={{
          background: "#06C755", borderRadius: 22, padding: "24px 28px",
          display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", marginBottom: 24,
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" aria-hidden>
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>還是不太會用？</div>
            <div style={{ marginTop: 3, fontSize: 15, color: "rgba(255,255,255,0.88)", lineHeight: 1.5 }}>
              加 LINE 好友，用講的問就有人回，不用怕。
            </div>
          </div>
          <a
            href="https://line.me/R/ti/p/@elderlink"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#fff", color: "#06C755", borderRadius: 999, height: 46, padding: "0 22px",
              fontSize: 15, fontWeight: 800, textDecoration: "none", flexShrink: 0,
            }}
          >
            加 LINE 好友
          </a>
        </div>

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
