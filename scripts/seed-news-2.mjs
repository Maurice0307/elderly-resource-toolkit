// seed-news-2.mjs — 第二批多來源文章，執行：node scripts/seed-news-2.mjs
const SUPABASE_URL = "https://iyrwxpcpgjqkqplkjiqe.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cnd4cGNwZ2pxa3FwbGtqaXFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI5NjgyOCwiZXhwIjoyMDkyODcyODI4fQ.kbk1boCJvymaAE-6fmt7vjuDWQmb9yY4CNB9FRnzVYs";

const articles = [
  // ── 健康遠見 ──────────────────────────────────────
  {
    source_org: "健康遠見",
    source_url: "https://health.gvm.com.tw/article/129715",
    title: "預防阿茲海默症、逆轉大腦退化！CNN專訪名醫：掌握5關鍵，打造無敵大腦",
    image_url: "https://imgs.gvm.com.tw/upload/gallery/20260428/230156.jpg",
    tags: ["失智", "大腦", "健康"],
    published_at: "2026-04-28T12:39:00+08:00",
    summary_md: `- **大腦不是只能走下坡路**：研究發現，60至80歲長者若改變生活方式，短短數週內海馬迴體積就能增加1至3%
- **健腦5大支柱**：運動、睡眠、營養、減壓、腦力訓練，這5項缺一不可，且效果相輔相成
- **大腦萎縮6大危險因子**：壓力、睡眠呼吸中止症、肥胖、失眠、未治療的憂鬱症、腦震盪
- **腦力訓練要對症下藥**：填字遊戲不夠，應依目標選擇訓練類型；交際舞集運動、記憶、社交於一身，是最佳選擇之一
- **阿茲海默症最早病理在症狀出現前20年就已存在**，早日開始生活介入效果更顯著
- **每天只要1小時保養大腦**，從散步20分鐘、減少垃圾食品、充足睡眠開始，就能超過90%的人`,
  },

  // ── 康健 ──────────────────────────────────────────
  {
    source_org: "康健雜誌",
    source_url: "https://www.commonhealth.com.tw/article/93947",
    title: "頻繁小睡不是單純老了？研究：早上瞇一下，死亡風險竟會增3成！4招改善白天嗜睡",
    image_url:
      "https://as.chdev.tw/web/article/8/f/4/8d31d911-fc27-4544-b116-b8a1571168961777436548.webp",
    tags: ["睡眠", "健康", "老化"],
    published_at: "2026-04-29T15:25:06+08:00",
    summary_md: `- 《美國醫學會雜誌》研究顯示：**每增加1小時小睡，死亡風險上升13%**；早上就開始小睡者死亡風險更高出近30%
- 長輩白天頻繁小睡，可能反映**潛在疾病訊號**，如憂鬱症、睡眠呼吸中止症、心血管疾病或神經退化
- 午睡**超過30分鐘**可能造成「睡眠慣性」，醒來昏沉，還會壓縮夜間睡眠時間，形成惡性循環
- **4招改善白天嗜睡**：固定起床時間多曬太陽、減少睡前刺激、鼓勵白天活動、策略性將午睡壓在下午20至30分鐘內
- 若發現長輩白天頻繁小睡，同時伴隨**警覺性下降或認知功能改變**，應視為疾病症狀儘速就醫
- 研究對象多為高加索人，台灣本土研究仍待補充，不能完全套用`,
  },

  // ── 50+ ───────────────────────────────────────────
  {
    source_org: "50+",
    source_url: "https://www.fiftyplus.com.tw/articles/36116",
    title: "吞藥丸卡住是老化的警訊？喉嚨也需要「六塊肌」，30歲起這樣練不嗆咳",
    image_url: "https://imgs.cwgv.com.tw/articles/16/36116/preview/36116.png",
    tags: ["老化", "健康", "日常"],
    published_at: "2026-04-29T00:00:00+08:00",
    summary_md: `- 台灣**65歲以上長者每10人就有1人**面臨咀嚼吞嚥障礙，喉嚨肌肉從30歲起就開始老化
- 吞嚥需要20至30條肌肉和10多條神經的精準協調；**咽部期**若反應不夠快，食物會誤入氣管引發嗆咳
- **2個自我檢測方法**：EAT-10吞嚥篩檢問卷（總分超過3分需就醫），以及30秒反覆唾液吞嚥測試（正常需3次以上）
- **2招居家訓練**：舌頭抵鐵湯匙做阻力運動，以及下巴夾球夾緊30秒強化喉部肌群
- 聲帶退化可用**「吸管喝水訓練法」**改善：水下2公分處吹泡泡搭配腹式呼吸，兼訓練肺活量
- 長輩嗆到時**不要拍背或餵水**，最正確做法是鼓勵用力咳出，避免吸入性肺炎`,
  },
  {
    source_org: "50+",
    source_url: "https://www.fiftyplus.com.tw/articles/36128",
    title: "飯後飽睏是血糖失控？醫師邱勝博解析 4 習慣逆轉危機",
    image_url: "https://imgs.cwgv.com.tw/articles/28/36128/preview/36128.png",
    tags: ["飲食", "健康", "慢性病"],
    published_at: "2026-04-27T00:00:00+08:00",
    summary_md: `- 血糖失控往往**在確診糖尿病前10年**就已悄悄開始，身體早有警訊卻被忽略
- **5大早期警訊**：飯後強烈睏意、餐後2小時又很餓、容易口渴頻尿、傷口癒合變慢、手腳麻刺痛感
- **4個穩糖好習慣**：先吃蔬菜再吃蛋白質最後才吃澱粉；飯後走路10至15分鐘；保持每天7至8小時睡眠；從天然成分著手輔助調節
- **苦瓜胜肽**具「類胰島素」作用，能幫助細胞利用葡萄糖；**肉桂萃取物**可提升胰島素敏感性
- 50歲是**修復代謝的黃金關鍵期**，身體還有相當的恢復力，及早行動效果更好
- 「血糖偏高但還沒到糖尿病就先不管」的心態最危險，往往讓問題悄悄惡化`,
  },

  // ── 銀天下（天下雜誌旗下）────────────────────────
  {
    source_org: "銀天下",
    source_url: "https://www.cw.com.tw/aging/article/5140700",
    title: "如何預防失智？日精神科權威：固執大腦老更快！養成「這習慣」比養生更重要",
    image_url:
      "https://cdn-www.cw.com.tw/article/202604/article-69e21c5912a405.07492472.jpg",
    tags: ["失智", "大腦", "健康"],
    published_at: "2026-04-24T00:00:00+08:00",
    summary_md: `- 日本精神科醫師和田秀樹指出：**思維固執的人大腦老化更快**，凡事非對即錯的態度會加速認知退化
- 預防失智的關鍵不只是飲食和運動，而是**維持心靈的彈性與好奇心**，這才是活化前額葉的核心
- 建議對AI等新科技保持開放態度——「先試試看」的精神既能延遲大腦老化，也能拓展人生選項
- **對所謂「常識」保持懷疑**：主動收集資料驗證自己的想法，能有效刺激前額葉
- 若只是被動接受媒體資訊、囫圇吞棗，反而會加速大腦退化；要試著從多種角度思考
- 年歲漸長更需要**率直的心態與寬大的度量**，不要畫地自限，保持對各種事物的關心`,
  },
  {
    source_org: "銀天下",
    source_url: "https://www.cw.com.tw/aging/article/5140676",
    title: "牙齒變長、牙縫變大，笑起來好尷尬？解析牙齦萎縮5大原因，趁早預防不怕顯老",
    image_url:
      "https://cdn-smarteditor.cw.com.tw/article_main/202604/15c962d8-b1af-4b1f-838c-9f0bd31d48fe.jpg",
    tags: ["牙齒", "健康", "日常"],
    published_at: "2026-04-20T00:00:00+08:00",
    summary_md: `- **牙齦萎縮5大警訊**：牙齒看起來變長、牙縫變大、牙齒敏感、齒頸部凹陷、牙齦紅腫刷牙流血
- 原因多元：老化是正常生理現象，但**刷牙太用力、橫向刷牙、不當使用牙線**也是常見元兇
- **口腔清潔不佳**導致牙菌斑堆積，引起牙周病，齒槽骨受損後就會造成牙齦萎縮
- 抽菸、吃檳榔、**糖尿病或胃食道逆流**等也可能引發牙齦問題，需全面管控
- 治療方式依原因而定：牙周治療、根管治療、補牙或贋復物，**重點是先找醫師評估**
- 正確使用牙線和牙間刷**不會讓牙縫變大**，關鍵是「貼著牙齒清潔」，避免搓擠牙齦`,
  },
  {
    source_org: "銀天下",
    source_url: "https://www.cw.com.tw/aging/article/5140727",
    title: "金馬號小姐70歲變名師，開課240場：退休生活從4個行動展開新價值",
    image_url:
      "https://cdn-www.cw.com.tw/article/202604/article-69e716c297b213.29993470.jpg",
    tags: ["退休", "生活", "熟齡"],
    published_at: "2026-04-21T00:00:00+08:00",
    summary_md: `- 70歲的丁惠華從金馬號車掌小姐到葉藝教師，累計開課240場、學員近2000人，證明**第二人生不必從零開始**
- 熟齡者真正的焦慮不是老化，而是失去「**被需要的位置**」——工作不確定、收入不安、價值感鬆動
- AI時代，**手感、美感、陪伴、理解力**這些人的厚度，正是最難被取代的核心價值
- **4個立即可開始的行動**：盤點長年被詢問的專長、把興趣轉成作品再整理成方法、與AI合作放大專長、帶著下一個人一起走
- 第二人生最動人的轉變：從「自己做」升級為「帶人做」，讓影響力擴展而非縮小
- 自我檢測：若你有一項做了多年的能力、願意整理分享，且願意先小規模嘗試，**你已準備好了**`,
  },
];

async function insertArticle(article) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/daily_news`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      ...article,
      status: "active",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    if (err.includes("duplicate") || err.includes("unique")) {
      console.log(`⏭  跳過（已存在）：${article.title}`);
    } else {
      console.error(`✗  失敗：${article.title}\n   ${err}`);
    }
    return;
  }

  const data = await res.json();
  console.log(`✓  已寫入：${article.title} (id: ${data[0]?.id})`);
}

console.log("開始匯入新聞（第二批）...\n");
for (const article of articles) {
  await insertArticle(article);
}
console.log("\n完成！");
