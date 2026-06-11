import Link from "next/link";
import { MobileSubHeader } from "@/components/layout/MobileSubHeader";
import { ELIcon } from "@/components/layout/ELIcon";
import { DeleteAccountButton } from "@/components/profile/DeleteAccountButton";

export const metadata = { title: "隱私與帳號安全" };

const POINTS = [
  { icon: "lock", t: "資料只用於提供服務", d: "您的登入資訊與收藏紀錄僅用於本平台功能，不會販售或外流給第三方。" },
  { icon: "shield", t: "登入安全", d: "採用 LINE／Google／手機驗證碼登入，我們不會保存您的密碼。" },
  { icon: "heart", t: "您可以隨時刪除", d: "在下方「刪除此帳號」就能一鍵永久刪除帳號與所有資料，立即生效、無法復原。" },
];

export default function PrivacyPage() {
  return (
    <div className="wv-fade" style={{ background: "#FAF6F2", minHeight: "100%" }}>
      <MobileSubHeader title="隱私與帳號安全" search={false} />

      <div style={{ padding: "14px 18px 28px", maxWidth: 640, margin: "0 auto" }}>
        {/* 隱私重點 */}
        <div style={{ fontSize: 13, fontWeight: 800, color: "#9C8E84", letterSpacing: 0.5, paddingLeft: 2, marginBottom: 8 }}>我們怎麼保護您的資料</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {POINTS.map((p) => (
            <div key={p.t} style={{ display: "flex", gap: 13, background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE", padding: "15px 16px" }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ELIcon name={p.icon} size={21} color="#F26B43" /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#241F1B" }}>{p.t}</div>
                <div style={{ fontSize: 14, color: "#574E47", lineHeight: 1.6, marginTop: 2 }}>{p.d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 帳號安全操作 */}
        <div style={{ fontSize: 13, fontWeight: 800, color: "#9C8E84", letterSpacing: 0.5, paddingLeft: 2, margin: "22px 0 8px" }}>帳號安全</div>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE", padding: "2px 16px" }}>
          <Link href="/profile/edit" className="click" style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 0", textDecoration: "none" }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ELIcon name="link" size={21} color="#F26B43" /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: "#241F1B" }}>管理登入方式</div>
              <div style={{ fontSize: 13, color: "#6E645C", marginTop: 1 }}>綁定／檢視 LINE、Google、手機</div>
            </div>
            <ELIcon name="chevron" size={20} color="#C8B8AE" />
          </Link>
          <Link href="/auth/signout" className="click" style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 0", textDecoration: "none", borderTop: "1px solid #F0E6DE" }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ELIcon name="logout" size={21} color="#F26B43" /></span>
            <span style={{ flex: 1, fontSize: 16.5, fontWeight: 700, color: "#241F1B" }}>登出這個裝置</span>
            <ELIcon name="chevron" size={20} color="#C8B8AE" />
          </Link>
          <DeleteAccountButton />
        </div>

        <p style={{ margin: "18px 2px 0", fontSize: 12.5, color: "#9C8E84", lineHeight: 1.7 }}>
          完整隱私權政策與服務條款，請來信 itchiang2025@gmail.com 索取。幸福好厝邊 v1.0
        </p>
      </div>
    </div>
  );
}
