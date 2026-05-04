// ============================================================
// 長者資源工具包 × Google Sheets 雙向同步腳本
//
// 使用方式：
// 1. 開啟 Google Sheets，建立一個新的試算表
// 2. 點選「擴充功能」→「Apps Script」
// 3. 將此檔案的所有內容貼入編輯器，取代原有程式碼
// 4. 修改下方 CONFIG 的 TOKEN（填入平台後台的 ADMIN_API_TOKEN）
// 5. 點「儲存」後回到試算表，重新整理頁面
// 6. 上方選單會出現「🔗 資源同步」選項
// ============================================================

const CONFIG = {
  API_BASE: "https://elderly-resource-toolkit.vercel.app",
  TOKEN: "請填入你的_ADMIN_API_TOKEN", // ← 修改這裡
};

// 試算表欄位順序（請勿更動）
const HEADERS = [
  "id",             // A - 平台 ID（更新時用，新增時留空）
  "category",       // B - 分類名稱（如：醫療健康）
  "category_slug",  // C - 分類代碼（如：health）← 推送時必填
  "subcategory",    // D - 子分類名稱
  "subcategory_slug", // E - 子分類代碼（如：private-ambulance）← 推送時必填
  "scope",          // F - 全國(national) 或 在地(local)
  "region",         // G - 地區名稱（如：新北市）
  "region_code",    // H - 地區代碼（如：TW-NTP）← 在地資源必填
  "name",           // I - 資源名稱 ← 必填
  "summary",        // J - 摘要（60字以內）
  "description",    // K - 詳細說明
  "phone",          // L - 電話
  "phone_hint",     // M - 電話提示語
  "address",        // N - 地址
  "website_url",    // O - 網站連結
  "identity_tags",  // P - 適用對象（逗號分隔：elder,family,volunteer）
  "tags",           // Q - 關鍵字標籤（逗號分隔）
  "source_org",     // R - 資料來源機構
  "status",         // S - 狀態（active/pending/ended/archived）
];

// ── 選單 ─────────────────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🔗 資源同步")
    .addItem("⬇️ 從平台拉取所有資源", "pullFromPlatform")
    .addSeparator()
    .addItem("⬆️ 推送更新到平台", "pushToPlatform")
    .addSeparator()
    .addItem("❓ 使用說明", "showHelp")
    .addToUi();
}

// ── 從平台拉取資料 ────────────────────────────────────────────
function pullFromPlatform() {
  const ui = SpreadsheetApp.getUi();

  try {
    const res = UrlFetchApp.fetch(
      `${CONFIG.API_BASE}/api/admin/resources/export`,
      { headers: { "x-admin-token": CONFIG.TOKEN } }
    );

    if (res.getResponseCode() === 401) {
      ui.alert("❌ Token 錯誤，請確認 CONFIG.TOKEN 是否正確填入");
      return;
    }

    const json = JSON.parse(res.getContentText());
    if (!json.ok) throw new Error(json.error);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.clearContents();
    sheet.clearFormats();

    // 寫入欄位標題
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setValues([HEADERS]);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#1C1917");
    headerRange.setFontColor("#FDE68A");

    // 寫入資料
    const rows = json.data.map((r) => HEADERS.map((h) => r[h] ?? ""));
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
    }

    // 凍結標題列＋ID欄
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(1);

    // 調整欄寬
    sheet.autoResizeColumns(1, HEADERS.length);

    // 鎖定 id 欄（A欄，唯讀提示）
    sheet.getRange(`A2:A${rows.length + 1}`).setBackground("#F5F0E8");

    ui.alert(`✅ 成功拉取 ${json.count} 筆資源！\n\n說明：\n• A欄（id）是平台識別碼，請勿修改\n• 直接在試算表編輯資料後，點「推送更新到平台」即可同步`);
  } catch (e) {
    ui.alert("❌ 拉取失敗：" + e.message);
  }
}

// ── 推送資料到平台 ────────────────────────────────────────────
function pushToPlatform() {
  const ui = SpreadsheetApp.getUi();

  const confirm = ui.alert(
    "確認推送",
    "將把試算表資料同步到平台：\n\n• 有 id 的列 → 更新現有資源\n• 空 id 的列 → 新增資源\n\n確定繼續嗎？",
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      ui.alert("沒有資料可推送，請先執行「從平台拉取資料」");
      return;
    }

    const data = sheet
      .getRange(2, 1, lastRow - 1, HEADERS.length)
      .getValues();

    const nameIdx = HEADERS.indexOf("name");
    const rows = data
      .filter((r) => r[nameIdx] && r[nameIdx].toString().trim()) // 過濾空列
      .map((r) => {
        const obj = {};
        HEADERS.forEach((h, i) => {
          obj[h] = r[i] !== undefined ? r[i].toString().trim() : "";
        });
        return obj;
      });

    if (rows.length === 0) {
      ui.alert("沒有有效資料可推送（name 欄不得為空）");
      return;
    }

    const res = UrlFetchApp.fetch(
      `${CONFIG.API_BASE}/api/admin/resources/import`,
      {
        method: "post",
        contentType: "application/json",
        headers: { "x-admin-token": CONFIG.TOKEN },
        payload: JSON.stringify({ rows }),
      }
    );

    if (res.getResponseCode() === 401) {
      ui.alert("❌ Token 錯誤，請確認 CONFIG.TOKEN 是否正確填入");
      return;
    }

    const json = JSON.parse(res.getContentText());

    let msg = `✅ 同步完成！\n新增：${json.inserted} 筆\n更新：${json.updated} 筆`;
    if (json.errors && json.errors.length > 0) {
      msg += `\n\n⚠️ 以下列有錯誤（已跳過）：\n${json.errors.slice(0, 5).join("\n")}`;
      if (json.errors.length > 5) msg += `\n...以及 ${json.errors.length - 5} 筆其他錯誤`;
    }
    ui.alert(msg);
  } catch (e) {
    ui.alert("❌ 推送失敗：" + e.message);
  }
}

// ── 使用說明 ─────────────────────────────────────────────────
function showHelp() {
  SpreadsheetApp.getUi().alert(
    "📖 使用說明",
    "【基本流程】\n" +
    "1. 點「從平台拉取所有資源」→ 把平台資料載入到試算表\n" +
    "2. 直接在試算表編輯（修改/新增列）\n" +
    "3. 點「推送更新到平台」→ 同步回平台\n\n" +
    "【新增資源】\n" +
    "• 在最後一列新增一行，id 欄留空\n" +
    "• category_slug、subcategory_slug、name 必填\n" +
    "• 在地資源需填 region_code（如 TW-TPE）\n\n" +
    "【地區代碼參考】\n" +
    "TW=全國、TW-TPE=台北、TW-NTP=新北\n" +
    "TW-TYC=桃園、TW-TXG=台中、TW-TNN=台南\n" +
    "TW-KHH=高雄\n\n" +
    "【注意】請勿修改 id 欄的值",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
