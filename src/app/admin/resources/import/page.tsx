import Link from "next/link";
import { requireRole } from "@/lib/auth/requireRole";
import { AD, AdPageHead, adBtn } from "@/components/admin/adminUi";
import { ELIcon } from "@/components/layout/ELIcon";
import { ResourceImportClient } from "@/components/admin/ResourceImportClient";

export const metadata = { title: "批量匯入" };

export default async function AdminResourcesImportPage() {
  await requireRole("moderator");
  return (
    <div>
      <AdPageHead
        title="批量匯入資源"
        desc="上傳 CSV 一次新增多筆資源"
        actions={
          <Link href="/admin/resources" style={adBtn("neutral")}>
            <ELIcon name="chevron" size={16} color={AD.sub} /> 回資源管理
          </Link>
        }
      />
      <ResourceImportClient />
    </div>
  );
}
