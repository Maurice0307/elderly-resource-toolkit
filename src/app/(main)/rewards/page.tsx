import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobileSubHeader } from "@/components/layout/MobileSubHeader";
import { RewardsClient } from "@/components/rewards/RewardsClient";

export const metadata = { title: "點數兌換商店" };

export default async function RewardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/rewards");

  const { data: prof } = await supabase.from("profiles").select("points").eq("id", user.id).maybeSingle();
  const points = (prof?.points as number | undefined) ?? 0;

  return (
    <div className="wv-fade" style={{ background: "#FAF6F2", minHeight: "100%" }}>
      <MobileSubHeader title="點數兌換商店" search={false} />
      <RewardsClient points={points} />
    </div>
  );
}
