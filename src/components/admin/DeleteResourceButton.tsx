"use client";
import { useTransition } from "react";
import { deleteResource } from "@/lib/admin/actions";

export function DeleteResourceButton({ resourceId, resourceName }: { resourceId: string; resourceName: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`確定要永久刪除「${resourceName}」嗎？此操作無法復原。`)) return;
    startTransition(() => deleteResource(resourceId));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50"
      style={{ background: "#FEE2E2", color: "#DC2626", border: "1px solid #FCA5A5" }}
    >
      {isPending ? "刪除中…" : "刪除"}
    </button>
  );
}
