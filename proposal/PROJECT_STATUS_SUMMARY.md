# ELDERLY TOOLKIT — 專案現況摘要

**更新時間：** 2026-05-28

## 1. 核心技術與架構
- 前端：Next.js 16（Server Components） + TailwindCSS
- 後端：Supabase (Postgres + Auth)、`@supabase/supabase-js`
- 資料庫：PostgreSQL（JSONB 支援）、已加入 pg_trgm、pgcrypto 擴充
- 權限：Postgres RLS（多張 migration 已建立 policies）

## 2. 資料模型快照
- `profiles`：`id, display_name, avatar_url, identity, role, points`
- `resources`：`id, subcategory_id, scope, region_id, name, summary, description, phone, address, latitude, longitude, website_url, identity_tags, tags, status, submitted_by, approved_by, approved_at`
- `resource_likes`, `resource_feedback`, `resource_reports` 等支援互動、檢舉
- `community_submissions`：投稿草稿以 `payload (jsonb)` 儲存
- `daily_news`、`activity_cards` 等表存在多媒體欄位

## 3. 認證與權限
- 使用 Supabase Auth（支援 OAuth）
- 三層角色：`user` / `moderator` / `admin`
- 地區 moderator 機制（region_moderator）支援區域分工

## 4. 審查與工作流程
- 投稿默認為 `pending`，需 moderator/admin 批核
- 已有 import/export API（需 `ADMIN_API_TOKEN`）
- 目前審查強烈依賴人工，缺少自動化篩選與社群投票機制

## 5. 已落實的資安措施
- RLS 覆蓋多張表
- service-role key 分離（admin client）

## 6. 主要缺口（須優先處理）
1. 審計日誌（audit logging）缺失 — 對接政府的必備項目
2. 輸入驗證不足（XSS、URL、電話、惡意標籤）
3. Rate limiting 與 API usage 控制缺失
4. 個資法（台灣）合規機制不完整（同意紀錄、資料保留、使用者請求）
5. 審查機制偏人工，需引入自動篩選 + 社群信任度

## 9. UI/UX 與使用流程（使用者面）

- 目標使用者：長者（65+）、家屬、志工、社福人員、地方政府職員。
- 設計原則：大字、簡單明瞭、快速行動（call / nav / share）、高對比與語音輔助。
- 首頁 / 入口：
	- 行動優先設計，支援 LINE LIFF 一鍵進入（方便非技術使用者）
	- 自動定位或手動輸入地址，快速定位附近資源
- 搜尋與結果：
	- 卡片式結果（名稱、距離、電話、營業時間、標籤、快速動作）
	- 適配螢幕閱讀（ARIA 標籤、鍵盤導航、可放大字體）
- 資源詳頁：
	- 一鍵撥號、導航、報錯、建議編輯
	- 顯示更新歷史與官方認證徽章（若存在）
	- 可開啟朗讀模式（TTS）或切換高對比模式
- 投稿流程：
	- Step-by-step 表單（引導使用者逐欄填寫），每步皆做即時驗證
	- 提交後進入草稿期（社群檢視）或自動篩選結果決定是否需人工審核
- 後台 Moderator 工具：
	- 優先隊列、相似比對、批次匯入/匯出、快速批准/拒絕按鈕

**可用性亮點（已或建議實作）：**
- `siteConfig.typography.minFontPx` 已設為 20（為長者優化）
- 推薦加入「閱讀/朗讀」按鈕、表單逐步提示與更明顯的回報回饋（成功/失敗皆給予清楚說明）

## 10. 針對 UI/UX 的立即建議（加入優先行動）
- 在 `立即推薦的三項行動` 中新增：
	- 實作行動優先 UI 改善（大字、高對比、一步一步投稿表單）→ 1 週
	- 在 `proposal_presentation.md` 加入使用者流程示意圖作為 demo → 2 天


## 7. 立即推薦的三項行動（優先順序）
- 建立 `audit_logs` 與變更歷史（trigger） → 使平台可供政府稽核
- 實作輸入驗證 schema（Zod / io-ts）並在 import API 與前端使用
- 建立簡易 Dashboard（數據儀表板）以供政府簡報使用

## 8. 關鍵檔案參考
- migration: `supabase/migrations/0001_init_auth_profiles.sql`
- migration: `supabase/migrations/0003_resources.sql`
- API: `src/app/api/admin/resources/import/route.ts`
- API: `src/app/api/admin/resources/export/route.ts`
- 後台：`src/app/admin/resources/page.tsx`


---

需要我把這份摘要同步到 `README.md` 或建立一個一頁式 handout 嗎？
