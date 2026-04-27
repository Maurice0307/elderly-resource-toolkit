import type { ScriptLine } from "@/types/domain";

type Props = {
  okExamples: ScriptLine[];
  ngExamples: ScriptLine[];
  tips: string[];
};

export function ScriptDialog({ okExamples, ngExamples, tips }: Props) {
  return (
    <div className="mt-6 space-y-8">

      {/* NG 先講：讓讀者先有共鳴，再看正確做法 */}
      <section>
        <div
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xl font-bold"
          style={{ background: "#FEE2E2", color: "#991B1B" }}
        >
          ❌ 這樣說效果不好
        </div>
        <div className="mt-4 space-y-3">
          {ngExamples.map((line, i) => (
            <div key={i}>
              <BubbleRow line={line} type="ng" />
              {line.reason ? (
                <div
                  className="ml-4 mt-1 flex gap-2 rounded-xl px-4 py-2 text-base"
                  style={{ background: "#FFF1F2", color: "#9F1239" }}
                >
                  <span>⚠️</span>
                  <span>{line.reason}</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* OK 示範 */}
      <section>
        <div
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xl font-bold"
          style={{ background: "#DCFCE7", color: "#14532D" }}
        >
          ✅ 這樣說更有效
        </div>
        <div className="mt-4 space-y-3">
          {okExamples.map((line, i) => (
            <BubbleRow key={i} line={line} type="ok" />
          ))}
        </div>
      </section>

      {/* 小技巧 */}
      {tips.length > 0 ? (
        <section>
          <div
            className="mb-4 text-2xl font-bold"
            style={{ color: "#1C1917" }}
          >
            💡 使用小技巧
          </div>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-2xl px-5 py-4 text-lg leading-relaxed"
                style={{ background: "#FEF3C7", color: "#1C1917" }}
              >
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: "#B45309" }}
                >
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function BubbleRow({ line, type }: { line: ScriptLine; type: "ok" | "ng" }) {
  const isLongBei =
    line.role === "長輩" ||
    line.role === "長者" ||
    line.role.includes("長");

  return (
    <div className={`flex gap-3 ${isLongBei ? "" : "flex-row-reverse"}`}>
      {/* 角色頭像 */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
        style={{
          background: isLongBei
            ? "#78716C"
            : type === "ok"
            ? "#B45309"
            : "#DC2626",
        }}
      >
        {line.role.slice(0, 1)}
      </div>

      {/* 對話框 */}
      <div
        className="max-w-xs rounded-2xl px-5 py-4 text-xl leading-relaxed sm:max-w-sm"
        style={
          isLongBei
            ? { background: "#F5F0E8", color: "#1C1917" }
            : type === "ok"
            ? { background: "#FEF3C7", color: "#1C1917" }
            : { background: "#FEE2E2", color: "#1C1917" }
        }
      >
        <span
          className="mb-1 block text-sm font-semibold"
          style={{ color: "#78716C" }}
        >
          {line.role}
        </span>
        {line.text}
      </div>
    </div>
  );
}
