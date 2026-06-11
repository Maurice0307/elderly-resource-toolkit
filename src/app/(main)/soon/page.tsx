import { ELIcon } from "@/components/layout/ELIcon";
import { MobileSubHeader } from "@/components/layout/MobileSubHeader";

export const metadata = { title: "功能開發中" };

export default function SoonPage() {
  return (
    <div className="wv-fade" style={{ background: "#fff", minHeight: "100%" }}>
      <MobileSubHeader title="" search={false} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 28px" }}>
        <div style={{ width: 92, height: 92, borderRadius: "50%", background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
          <ELIcon name="sparkle" size={42} color="#F26B43" />
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#241F1B" }}>這個功能正在開發中</h1>
        <p style={{ margin: "12px 0 0", fontSize: 16, color: "#574E47", lineHeight: 1.7, maxWidth: 300 }}>
          我們正在努力把它做好，敬請期待。先逛逛其他功能吧！
        </p>
      </div>
    </div>
  );
}
