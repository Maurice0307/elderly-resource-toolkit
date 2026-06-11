"use client";
import { useTransition } from "react";
import { deleteResource } from "@/lib/admin/actions";
import { adBtn } from "@/components/admin/adminUi";

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
      style={{ ...adBtn("alert"), opacity: isPending ? 0.5 : 1 }}
    >
      {isPending ? "刪除中…" : "刪除"}
    </button>
  );
}
