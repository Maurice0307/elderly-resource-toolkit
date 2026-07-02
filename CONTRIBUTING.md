# Contributing to Elderly Resource Toolkit

感謝您參與本專案！為了維護專案品質與安全性，請遵循以下貢獻指南。

## 貢獻流程
1. **尋找任務**：查看 [Issues](https://github.com/Maurice0307/elderly-resource-toolkit/issues) 並尋找合適的標籤：
   - `bug`：系統異常，需要除錯。
   - `help wanted`：適合新手的入門任務。
   - `feature request`：建議新增的功能。
2. **開發規範**：
   - Fork 本專案並建立新的分支 (Branch)。
   - 確保程式碼經過本地測試。
   - 本專案已配置 **GitHub Actions** 進行自動化 CI/CD。提交 PR 前，請確認您的修改通過了所有的測試項目，以避免觸發報錯。
3. **提交 PR**：完成後提交 Pull Request，並清楚說明修改內容。
4. **代碼審核**：所有 PR 必須經過創始人（維護者）審核並合併 (Merge) 後，才會進入主程式。

## 安全性與管控守則
- **金鑰隔離 (嚴格禁止)**：絕對不要將任何 API Key、資料庫密鑰或環境變數 (Secrets) 提交到公開倉庫。請務必使用 `.env.example` 作為範本，真實密鑰請設定於 GitHub 的 `Settings` -> `Secrets and variables` 中。
- **後台權限**：本專案採用分支保護政策 (Branch Protection)，任何變更皆需經過代碼審核，確保創始人對程式碼擁有絕對的管控權。
- **敏感邏輯**：如涉及管理員後台或敏感資料處理，建議透過環境變數進行條件式掛載。

## 授權約定
本專案依循 **GNU GPLv3** 授權。所有貢獻者同意其提交之內容亦受此條款約束，禁止任何閉源或非開源的商業化應用。
