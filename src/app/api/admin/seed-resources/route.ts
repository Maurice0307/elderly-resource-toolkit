import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const RESOURCES_BY_CAT: Record<string, Array<{
  name: string;
  scope: string;
  regionCode?: string;
  summary: string;
  phone?: string;
  address?: string;
  tags: string[];
}>> = {
  health: [
    { name: "1966 長照服務申請專線", scope: "national", summary: "免付費撥打，由衛福部統一窗口協助申請居家服務、日照、輔具租借等長照 2.0 資源。", phone: "1966", tags: ["長照1966", "長照", "居家服務", "日照"] },
    { name: "119 緊急救護", scope: "national", summary: "胸痛、跌倒、燙傷、噎到、無意識等突發緊急狀況，立即撥打。報案說清楚「人在哪裡、發生什麼事、意識清楚嗎」。", phone: "119", tags: ["急救", "緊急"] },
    { name: "中壢區衛生所", scope: "local", regionCode: "TW-TYC-ZL", summary: "免費量血壓、成人健檢、疫苗接種、慢性病衛教與癌症篩檢轉介。", phone: "03-425-2360", address: "桃園市中壢區成功路 6 號", tags: ["成人健檢", "疫苗", "量血壓", "慢性病", "癌症篩檢"] },
    { name: "1922 防疫諮詢專線", scope: "national", summary: "24 小時免費防疫專線，可詢問傳染病症狀、疫苗接種地點、流感與新冠疫苗資訊等。", phone: "1922", tags: ["疫苗", "防疫", "流感"] },
    { name: "呼叫藥師 — 慢性藥物到家", scope: "national", summary: "由藥師提供慢性病處方藥居家配送，省去往返藥局的不便，適合行動不便或獨居長者。", phone: "02-6605-0896", tags: ["送藥到家", "慢性病", "用藥諮詢"] },
    { name: "衛福部社家署 — 輔具申請專線", scope: "national", summary: "拐杖、輪椅、助行器、電動床等輔具的補助評估，可電話詢問申請資格與流程。", phone: "02-2720-8889", tags: ["輔具", "補助"] },
    { name: "桃園市復康巴士預約中心", scope: "local", regionCode: "TW-TYC", summary: "提供身障及行動不便長者就醫、復健、洽公接送，需提前預約。", phone: "03-332-6789", address: "桃園市桃園區縣府路 1 號", tags: ["復康巴士", "無障礙", "就醫接送"] },
    { name: "台灣大車隊 — 無障礙計程車", scope: "national", summary: "24 小時全國調度，輪椅可上車的無障礙計程車，適合行動不便長者就醫出行。撥通後按「3」。", phone: "0800-055-850", tags: ["無障礙計程車", "計程車"] },
    { name: "國民健康署 — 成人預防保健服務", scope: "national", summary: "40–64 歲每 3 年 1 次、65 歲以上每年 1 次免費健檢。帶健保卡至附近衛生所或健保特約院所辦理。", tags: ["成人健檢", "預防保健"] },
    { name: "國民健康署 — 四種癌症篩檢", scope: "national", summary: "子宮頸癌、乳癌、大腸癌、口腔癌四項免費篩檢，符合年齡即可至特約醫療院所或衛生所受檢。", tags: ["癌症篩檢", "預防"] },
    { name: "全國失智症關懷專線", scope: "national", summary: "「失智時，我幫您」免付費專線，由社工、護理、心理專業人員提供失智症照顧技巧、社福資源、家屬支持與就醫資訊。上班日 9:00–21:00。", phone: "0800-474-580", tags: ["失智照護", "失智", "諮詢"] },
    { name: "國民健康署 — 慢性病健康促進", scope: "national", summary: "高血壓、糖尿病、高血脂「三高」防治與健康生活資訊，可查詢社區血壓量測站與慢性病自我管理資源。", phone: "0800-367-100", tags: ["慢性病", "三高", "健康促進"] },
    { name: "中華民國紅十字會 — 急救訓練", scope: "national", summary: "開辦 CPR+AED、初級急救員訓練與高齡者安全講座，長者與家屬可報名學習救命技能。", phone: "02-2362-3079", tags: ["急救", "CPR", "訓練"] },
    { name: "各縣市 — 中低收入老人裝置假牙補助", scope: "national", summary: "符合資格的長者裝置活動假牙可申請補助（金額依縣市規定）。可撥 1957 或洽戶籍地社會局（處）。", phone: "1957", tags: ["假牙補助", "口腔保健", "補助"] },
  ],
  transport: [
    { name: "幸福小黃／幸福巴士 全國諮詢", scope: "national", summary: "公路局補助偏鄉地區預約接送服務，提供長者就醫、購物等接送，費用低廉或免費。", phone: "0800-231-035", tags: ["幸福巴士", "偏鄉", "接送"] },
    { name: "桃園市幸福巴士／幸福小黃", scope: "local", regionCode: "TW-TYC", summary: "偏遠地區與長者醫療接送專車，部分路線免費或銅板價。", phone: "03-332-2101", tags: ["幸福巴士", "公車", "接送", "偏鄉"] },
    { name: "復康巴士全國預約諮詢", scope: "national", summary: "由各縣市社會局辦理，提供身障及行動不便者就醫、復健接送，撥打可查詢各地預約方式。", phone: "0800-231-161", tags: ["復康巴士", "身障", "預約"] },
    { name: "長照 2.0 — 交通接送服務", scope: "national", summary: "失能長者就醫、復健交通接送補助，透過 1966 或長照管理中心申請評估後使用。", phone: "1966", tags: ["長照接送", "長照", "交通接送"] },
    { name: "台灣大車隊 — 無障礙計程車（交通）", scope: "national", summary: "24 小時全國調度，輪椅可上車，適合長者日常外出、就醫、訪友。", phone: "0800-055-850", tags: ["無障礙計程車", "計程車", "外出"] },
    { name: "嗶嗶共乘 — 偏鄉共乘預約", scope: "national", summary: "偏鄉地區居民預約共乘服務，透過手機定位配對乘客，適合無車長者外出就醫或購物。", phone: "0800-005-978", tags: ["偏鄉共乘", "共乘", "偏鄉"] },
    { name: "中壢監理站", scope: "local", regionCode: "TW-TYC-ZL", summary: "辦理駕照換發、體檢、75 歲以上駕照認知測驗。建議先電話預約。", phone: "03-436-1226", address: "桃園市中壢區普義路 2 號", tags: ["駕照", "監理"] },
    { name: "桃園市敬老愛心卡", scope: "local", regionCode: "TW-TYC", summary: "設籍桃園市 65 歲以上長者可申辦敬老愛心卡，每月提供公車、捷運等交通補助點數。洽各區公所或社會局。", phone: "03-332-2101", tags: ["敬老卡", "交通補助"] },
    { name: "台鐵 — 敬老愛心票訂票服務", scope: "national", summary: "65 歲以上長者可購敬老票（半價），可透過台鐵網站、App 或車站窗口訂票，劃位時出示身分證件。", phone: "02-2191-0096", tags: ["敬老卡", "火車", "訂票"] },
    { name: "公路客運 — 敬老票半價", scope: "national", summary: "65 歲以上搭乘多數公路客運可享半價優惠，部分縣市另有敬老卡乘車補助，上車刷卡或購票時出示證件。", phone: "0800-231-035", tags: ["敬老卡", "客運", "半價"] },
    { name: "台灣高鐵 — 敬老優惠票", scope: "national", summary: "65 歲以上可購高鐵敬老票（標準車廂原價 5 折），臨櫃、網路與 App 訂票皆可，劃位時出示身分證件。", phone: "4066-3000", tags: ["敬老卡", "高鐵", "優惠"] },
    { name: "大都會衛星計程車隊", scope: "national", summary: "24 小時叫車服務，含無障礙與長者友善車輛，適合長輩就醫、返鄉、訪友。", phone: "55178", tags: ["無障礙計程車", "計程車", "叫車"] },
  ],
  housing: [
    { name: "獨居長者緊急救援服務（緊急救援連線）", scope: "national", summary: "為獨居或行動不便長者安裝緊急通報設備（平安鈴連線主機），按一下即可聯繫救援中心。可透過 1957 或戶籍地社會局（處）申請評估。", phone: "1957", tags: ["緊急救援", "平安鈴", "獨居"] },
    { name: "長照 2.0 — 居家無障礙環境改善補助", scope: "national", summary: "提供扶手、防滑地墊、可調式床等居家改善補助，最高 10 萬元（需符合失能等級），透過 1966 申請評估。", phone: "1966", tags: ["防跌", "扶手", "修繕補助", "補助"] },
    { name: "長照 2.0 — 居服員到府服務", scope: "national", summary: "申請居家服務員定期到府，協助洗澡、備餐、協助行動、打掃等日常照護。", phone: "1966", tags: ["居服員", "居家照護"] },
    { name: "內政部 — 住宅修繕補助諮詢", scope: "national", summary: "低收入、中低收入、老人、身障等弱勢住宅修繕費用補助；可詢問申請資格及流程。", phone: "02-7729-8003", tags: ["修繕補助", "補助"] },
    { name: "經濟部能源署 — 用電安全服務", scope: "national", summary: "電線電器老舊安全檢測資訊，可查詢合格電器承裝檢驗維護廠商，避免家中電氣危險。", phone: "02-2755-2467", tags: ["用電安全", "老舊電線"] },
    { name: "內政部消防署 — 住宅用火災警報器", scope: "national", summary: "臥室、廚房裝設住宅用火災警報器（住警器），可在火災初期警示，保護獨居長者。部分縣市消防局提供弱勢免費安裝。", phone: "02-8195-9119", tags: ["用電安全", "火災", "居家安全"] },
    { name: "588 水電裝修網", scope: "national", summary: "全台水電師傅媒合平台，提供水管、電路、瓦斯、冷氣等修繕服務，可按縣市搜尋附近師傅。", tags: ["水電行", "水電", "修繕"] },
    { name: "內政部不動產資訊平台 — 社會住宅", scope: "national", summary: "老人、身障、低收入等弱勢族群申請社會住宅資訊，可查詢各地可申請的社宅名額與包租代管。", phone: "02-5574-0089", tags: ["社會住宅", "包租代管", "補貼"] },
    { name: "崔媽媽基金會", scope: "national", summary: "民間租屋協助機構，提供租屋資訊、看房陪同、租屋糾紛諮詢及居住政策倡議。", phone: "02-2365-8140", tags: ["租屋協助", "租屋", "糾紛"] },
    { name: "桃園市 — 中低收入老人修繕住屋補助", scope: "local", regionCode: "TW-TYC", summary: "設籍桃園、符合資格的中低收入老人，可申請住宅無障礙與安全修繕補助，洽社會局或各區公所。", phone: "03-332-2101", tags: ["修繕補助", "防跌", "在地"] },
    { name: "內政部消防署 — 防災宣導與救護", scope: "national", summary: "火災、地震、CPR 等防災避難知識與宣導，火警救護一律撥 119。可查詢住宅用火災警報器補助與居家防火須知。", phone: "119", tags: ["防災", "火災", "防火", "救護"] },
    { name: "交通部中央氣象署 — 地震與颱風資訊", scope: "national", summary: "即時地震報告、颱風警報、豪雨特報與避難資訊。可下載「生活氣象」App 接收地震速報與災害示警。", phone: "02-2349-1234", tags: ["防災", "地震", "颱風", "示警"] },
    { name: "國家災害防救科技中心 — 防災地圖", scope: "national", summary: "查詢住家附近的避難收容處所、淹水與土石流潛勢、防災地圖，事先規劃逃生與避難路線。", tags: ["防災", "地震", "避難", "地圖"] },
    { name: "1991 報平安留言平台", scope: "national", summary: "重大災害（地震、颱風）發生、電話打不通時，可撥 1991 留言報平安，家人也能查詢，避免話務壅塞。", phone: "1991", tags: ["防災", "地震", "報平安"] },
  ],
  finance: [
    { name: "165 反詐騙諮詢專線", scope: "national", summary: "懷疑被詐騙、或想查證投資／網購／中獎／假冒親友訊息真偽，立刻撥打 165 查證。", phone: "165", tags: ["防詐騙", "金融安全"] },
    { name: "110 報案專線 — 詐騙案件", scope: "national", summary: "懷疑遭到詐騙、已經匯款時，立即撥打 110 向警察局報案，把握黃金時間止付。", phone: "110", tags: ["防詐騙", "報案", "緊急"] },
    { name: "金管會 — 守護高齡者金融專區", scope: "national", summary: "提供高齡者防範金融詐騙、認識金融商品、信託與監護宣告等知識，協助保障長者財產安全。", phone: "02-8968-0899", tags: ["防詐騙", "高齡金融", "財產管理"] },
    { name: "中華民國法律諮詢協會 — 財產繼承", scope: "national", summary: "免費電話法律諮詢，協助了解遺產分配、繼承程序、遺囑效力等問題。", phone: "0800-555-355", tags: ["財產繼承", "遺產"] },
    { name: "財政部 — 遺產稅諮詢", scope: "national", summary: "遺產稅申報、免稅額、扣除額與申報期限諮詢，可洽國稅局各分局或撥打稅務諮詢，避免逾期受罰。", phone: "0800-000-321", tags: ["財產繼承", "遺產稅", "報稅"] },
    { name: "中華民國法律諮詢協會 — 預立遺囑", scope: "national", summary: "協助長者依法完成遺囑書寫（自書、公證、代筆等），確保個人意願受到法律保障。", phone: "0800-555-355", tags: ["預立遺囑", "財產規劃"] },
    { name: "信託業商業同業公會 — 安養信託", scope: "national", summary: "介紹「安養信託」制度，協助長者透過信託方式，把退休金、房產所得專款專用於晚年安養與醫療，避免被挪用。", phone: "02-2351-5299", tags: ["安養信託", "信託", "安養"] },
    { name: "公股銀行 — 以房養老（不動產逆向抵押）", scope: "national", summary: "名下有房、現金不足的長者，可將自有住宅向銀行設定抵押，按月領取生活費，仍可續住原屋。台灣銀行、合作金庫等多家公股銀行皆有承作，可臨櫃諮詢。", phone: "0800-025-168", tags: ["以房養老", "養老", "財產管理"] },
    { name: "老人福利推動聯盟 — 財務管理", scope: "national", summary: "老人福利資訊，含財務管理介紹、安養信託說明、理財與防詐課程引導。", phone: "02-2592-7999", tags: ["財產管理", "規劃"] },
    { name: "金融消費評議中心", scope: "national", summary: "與銀行、保險、證券發生金融消費爭議時，可免費申請評議協助，無須打官司。長者遇不當銷售金融商品亦可求助。", phone: "0800-789-885", tags: ["防詐騙", "金融申訴", "財產管理"] },
    { name: "行政院消費者保護 — 1950 專線", scope: "national", summary: "消費爭議申訴與諮詢專線，遇到不實廣告、購物糾紛、預付型消費（塔位、健康食品）問題可撥打求助。", phone: "1950", tags: ["防詐騙", "消費申訴", "財產管理"] },
    { name: "勞動部勞工保險局 — 勞保老年給付", scope: "national", summary: "曾參加勞保的長者退休可請領勞保老年給付（年金或一次金）。資格、金額與請領方式可洽勞保局。", phone: "02-2396-1266", tags: ["退休金", "勞保", "財產管理"] },
  ],
  subsidy: [
    { name: "1957 福利諮詢專線", scope: "national", summary: "衛福部免付費福利諮詢單一窗口，可詢問中低收入老人生活津貼、急難救助、社會救助、老人與身障福利、國民年金等補助資格與申請方式。每日 8:00–22:00，國台客語皆可。", phone: "1957", tags: ["老人津貼", "中低收入", "身障補助", "急難救助", "社福窗口"] },
    { name: "中低收入老人生活津貼", scope: "national", summary: "符合資格的中低收入長者，每月可領取生活津貼（金額依家庭收入分級）。可撥 1957 或洽戶籍地社會局（處）申請。", phone: "1957", tags: ["中低收入", "老人津貼", "津貼"] },
    { name: "中低收入老人特別照顧津貼", scope: "national", summary: "失能且未聘看護、由家人親自照顧的中低收入老人，照顧者可申請特別照顧津貼，每月定額補助。洽戶籍地社會局（處）。", phone: "1957", tags: ["中低收入", "照顧津貼", "老人津貼"] },
    { name: "國民年金 — 老年年金給付", scope: "national", summary: "65 歲以上、未領其他社會保險年金者，可請領國民年金老年年金。資格與金額可撥 1957 詢問，或洽勞動部勞工保險局國民年金組。", phone: "1957", tags: ["國民年金", "老年年金"] },
    { name: "老農津貼 — 農民健康保險", scope: "national", summary: "符合資格的高齡農民可請領老年農民福利津貼。資格、年資與請領方式可洽勞保局或各地農會。", phone: "02-2396-1266", tags: ["老人津貼", "老農津貼", "農民"] },
    { name: "健保署 — 重大傷病證明", scope: "national", summary: "罹患癌症、需長期洗腎等重大傷病者，申請重大傷病證明後就醫可免部分負擔。市話免付費 0800-030-598，或洽健保署各分區業務組。", phone: "0800-030-598", tags: ["重大傷病", "健保", "免部分負擔"] },
    { name: "身心障礙者生活補助", scope: "national", summary: "領有身心障礙證明的長者，依家庭經濟狀況可申請生活補助。可撥 1957 或洽戶籍地社會局（處）了解資格與應備文件。", phone: "1957", tags: ["身障補助", "生活補助"] },
    { name: "身心障礙者輔具費用補助", scope: "national", summary: "領有身障證明者購買輪椅、助聽器、義肢等輔具，可申請費用補助。洽戶籍地社會局（處）或社家署輔具資源入口網。", phone: "02-2720-8889", tags: ["身障補助", "輔具補助"] },
    { name: "衛福部 — 急難救助／馬上關懷", scope: "national", summary: "家庭主要收入者因死亡、失蹤、重病、失業等突遭變故導致生活陷困，可申請急難救助金，由社會局派員訪視後核發。", phone: "1957", tags: ["急難救助", "紓困"] },
    { name: "桃園市敬老愛心卡（補助）", scope: "local", regionCode: "TW-TYC", summary: "設籍桃園市 65 歲以上長者可申辦敬老愛心卡，提供搭乘公車、捷運等交通補助點數。洽各區公所或社會局。", phone: "03-332-2101", tags: ["敬老卡", "交通補助"] },
    { name: "國軍退除役官兵輔導會 — 就養給付", scope: "national", summary: "榮民（退除役官兵）符合資格者可申請就養給付與安養照顧，洽各縣市榮民服務處。", phone: "02-2596-3255", tags: ["榮民", "老人津貼", "就養"] },
    { name: "老農津貼 — 加發與資格", scope: "national", summary: "長期從事農業的高齡農民可請領老年農民福利津貼，可向農會或勞保局查詢年資與請領金額。", phone: "02-2396-1266", tags: ["老農津貼", "老人津貼", "農民"] },
    { name: "健保署 — 經濟困難保費補助", scope: "national", summary: "經濟困難無力繳納健保費者，可申請紓困貸款、分期或轉介愛心專案，避免因欠費影響就醫。", phone: "0800-030-598", tags: ["健保", "保費補助", "中低收入"] },
  ],
  social: [
    { name: "家庭照顧者關懷總會 — 照顧者喘息專線", scope: "national", summary: "「我要喘息 0800-50-72-72」免付費專線，為長期照顧家人的您提供情緒支持、照顧技巧、喘息服務與長照資源轉介。照顧者也要被照顧。", phone: "0800-507-272", tags: ["照顧者支援", "喘息服務", "情緒支持"] },
    { name: "長照 2.0 — 喘息服務", scope: "national", summary: "讓長期照顧者可以喘口氣、休息。可申請居家或機構喘息（短期代為照顧），透過 1966 長照專線評估使用。", phone: "1966", tags: ["喘息服務", "照顧者支援", "長照"] },
    { name: "桃園市獨居長者關懷服務", scope: "local", regionCode: "TW-TYC", summary: "對獨居、弱勢長者提供定期電話問安、志工到府關懷訪視與緊急通報協助。可洽社會局或撥 1957 轉介。", phone: "03-332-2101", tags: ["關懷訪視", "獨居關懷", "電話問安"] },
    { name: "全國失智症關懷專線（社會資源）", scope: "national", summary: "「失智時，我幫您」免付費專線，提供失智症照顧技巧、家屬支持、社福資源與就醫資訊諮詢。上班日 9:00–21:00。", phone: "0800-474-580", tags: ["失智諮詢", "失智", "家屬支持"] },
    { name: "1925 安心專線", scope: "national", summary: "24 小時免付費心理諮詢與自殺防治專線，由衛福部委辦。「我最近睡不好、心情低落，想找人聊聊。」", phone: "1925", tags: ["心理諮詢", "心理", "情緒"] },
    { name: "113 保護專線", scope: "national", summary: "24 小時家庭暴力、性侵害、老人保護專線，任何人可代為通報，並提供心理支持與安置資源。", phone: "113", tags: ["家暴專線", "家暴", "老人保護"] },
    { name: "男性關懷專線", scope: "national", summary: "提供男性情緒抒發管道，含壓力調適、家庭關係、自殺防治等心理諮詢，免費撥打。", phone: "0800-013-999", tags: ["心理諮詢", "情緒抒發"] },
    { name: "中華民國老人福利推動聯盟", scope: "national", summary: "老人福利資訊諮詢，協助了解各項政府補助、長照服務、社會資源的申請管道。", phone: "02-2592-7999", tags: ["福利諮詢", "資源媒合"] },
    { name: "財團法人法律扶助基金會", scope: "national", summary: "為經濟困難者提供免費或低費法律扶助，含法律諮詢、訴訟代理、調解，老人可優先申請。", phone: "02-412-8518", tags: ["法律諮詢", "法扶", "訴訟援助"] },
    { name: "中華民國法律諮詢協會（社會）", scope: "national", summary: "免費電話法律諮詢，涵蓋財產、租屋、離婚、老人保護等各類民事問題。", phone: "0800-555-355", tags: ["法律諮詢", "法律", "免費諮詢"] },
    { name: "桃園市長者送餐服務", scope: "local", regionCode: "TW-TYC", summary: "提供獨居、行動不便或弱勢長者每日午晚餐配送，依資格部分或全額補助。", phone: "03-332-2101", tags: ["送餐服務", "獨居", "補助"] },
    { name: "弘道老人福利基金會 — 志工陪伴", scope: "national", summary: "推動長者陪伴、走動式服務與「不老」圓夢計畫，可洽詢志工陪伴服務或報名成為陪伴志工。", phone: "04-2206-0698", tags: ["志工陪伴", "陪伴", "社會參與"] },
    { name: "生命線協談專線", scope: "national", summary: "24 小時心理協談與自殺防治專線，當您感到孤單、低落、想不開時，隨時有人傾聽陪伴。", phone: "1995", tags: ["心理諮詢", "情緒", "陪伴"] },
    { name: "張老師專線", scope: "national", summary: "提供心理諮商與情緒困擾協談，含家庭關係、人際與生活適應問題，免費保密。", phone: "1980", tags: ["心理諮詢", "情緒抒發"] },
    { name: "老人福利機構 / 日間照顧中心查詢", scope: "national", summary: "查詢住家附近的日間照顧中心、長照機構與住宿式機構，白天托顧讓家屬安心上班。可透過 1966 諮詢轉介。", phone: "1966", tags: ["日間照顧", "照顧者支援", "長照"] },
  ],
  leisure: [
    { name: "教育部體育署 — i 運動資訊平台", scope: "national", summary: "查詢全台運動中心、社區運動課程與銀髮運動指導資源，鼓勵長者規律運動、預防衰弱。", tags: ["運動課程", "健走", "體操"] },
    { name: "桃園市長青學苑", scope: "local", regionCode: "TW-TYC", summary: "為長者開設藝文、語言、健康、運動等多元課程的活動場所，洽社會局查詢各區開課地點與報名方式。", phone: "03-332-2101", tags: ["長青學苑", "課程", "活動場所"] },
    { name: "中壢區社區照顧關懷據點", scope: "local", regionCode: "TW-TYC-ZL", summary: "提供長者共餐、健康促進活動、健康量測與電話問安，多數據點上午開放。", phone: "03-426-4153", address: "桃園市中壢區（多個據點）", tags: ["社區據點", "共餐", "活動"] },
    { name: "桃園市政府社會局 — 社區據點查詢", scope: "local", regionCode: "TW-TYC", summary: "查詢中壢區附近的關懷據點、共餐與活動時段，了解志工參與管道。", phone: "03-332-2101", tags: ["社區據點", "志工參與", "共餐"] },
    { name: "中華民國老人福利推動聯盟 — 志工參與", scope: "national", summary: "想成為陪伴志工、了解志工培訓與在地服務機會，可電話諮詢。", phone: "02-2592-7999", tags: ["志工參與", "社會參與"] },
    { name: "弘道老人福利基金會 — 不老夢想", scope: "national", summary: "推動長者圓夢、銀髮旅遊與社會參與活動，讓長輩走出家門、結交朋友。可洽詢在地服務據點。", phone: "04-2206-0698", tags: ["銀髮旅遊", "社會參與", "圓夢"] },
    { name: "救國團 — 長青暨樂齡系列課程", scope: "national", summary: "各地救國團終身學習中心開設書法、歌唱、舞蹈、外語、3C 等銀髮課程，費用平實，可就近報名。", phone: "02-2502-5858", tags: ["長青學苑", "課程", "運動課程"] },
    { name: "桃園市銀髮族旅遊／一日遊", scope: "local", regionCode: "TW-TYC", summary: "社會局與各區關懷據點不定期辦理長者一日遊、文化參訪等活動，洽社會局或在地據點報名。", phone: "03-332-2101", tags: ["銀髮旅遊", "旅遊", "活動"] },
    { name: "各區關懷據點 — 桌遊與團康活動", scope: "local", regionCode: "TW-TYC-ZL", summary: "社區關懷據點常態舉辦桌遊、團康、健康操與手作課程，促進長者人際互動、預防失智。", phone: "03-426-4153", tags: ["桌遊團康", "團康", "社區據點"] },
    { name: "衛福部 — 社區照顧關懷據點全國查詢", scope: "national", summary: "查詢全台社區關懷據點、文化健康站與巷弄長照站的位置與活動，就近參加共餐、運動、量血壓。", phone: "1966", tags: ["社區據點", "共餐", "運動課程"] },
    { name: "中華民國老人福利推動聯盟 — 銀髮活動", scope: "national", summary: "推廣長者社會參與、藝文與健康促進活動，可詢問在地長者俱樂部與課程資訊。", phone: "02-2592-7999", tags: ["活動", "志工參與", "社會參與"] },
  ],
  education: [
    { name: "中壢樂齡學習中心", scope: "local", regionCode: "TW-TYC-ZL", summary: "針對 55 歲以上長者開設免費或低價課程，含智慧型手機教學、語言、藝文、健康促進。", phone: "03-425-7352", address: "桃園市中壢區", tags: ["樂齡學習中心", "樂齡", "課程", "3C手機教學"] },
    { name: "教育部樂齡學習網", scope: "national", summary: "全國樂齡學習中心課程資訊，55 歲以上可就近報名手機、語言、藝文、健康等免費或低費課程。", tags: ["樂齡學習中心", "樂齡", "終身學習"] },
    { name: "教育部 — 樂齡大學", scope: "national", summary: "與全國大專校院合作，提供 55 歲以上長者進入大學學習的機會，課程含通識、運動、資訊等，一學年制。", tags: ["樂齡大學", "大學", "課程"] },
    { name: "全國社區大學教育資訊網", scope: "national", summary: "全台社區大學開課資訊，可依興趣選修人文、藝術、生活技能等多元課程，費用低廉。", tags: ["社區大學", "課程"] },
    { name: "數位發展部 — 數位機會中心（DOC）", scope: "national", summary: "在偏鄉與社區設立據點，免費教長者使用智慧型手機、上網、視訊與防詐，協助縮短數位落差。", phone: "02-2380-0411", tags: ["3C手機教學", "數位", "上網"] },
    { name: "45+ 就業資源網（銀髮資源網）", scope: "national", summary: "勞動部建置，專為 45 歲以上中高齡者提供就業媒合、技能培訓、創業輔導。", tags: ["二度就業", "就業", "銀髮"] },
    { name: "勞動部 — 中高齡及高齡者就業專區", scope: "national", summary: "提供中高齡與高齡者職務再設計、繼續僱用補助、求職媒合等服務，協助長者重返或留任職場。", phone: "0800-777-888", tags: ["二度就業", "就業", "職訓"] },
    { name: "桃園市立圖書館 — 樂齡與數位學習", scope: "local", regionCode: "TW-TYC", summary: "各分館設樂齡專區、樂齡活動與免費數位學習課程，可借閱大字書、有聲書，洽鄰近分館。", phone: "03-316-2345", address: "桃園市（各區分館）", tags: ["圖書館", "樂齡", "數位學習"] },
    { name: "國立空中大學 — 樂齡學習", scope: "national", summary: "不限學歷、在家就能上課的開放大學，長者可選修生活、健康、藝術等課程，按科計費、可旁聽。", phone: "02-2282-9355", tags: ["樂齡大學", "終身學習", "線上課程"] },
    { name: "教育部 — 磨課師線上學習平台", scope: "national", summary: "免費的線上開放課程（MOOCs），含手機應用、健康、人文等主題，在家用平板或電腦就能學。", tags: ["3C手機教學", "數位", "線上課程"] },
  ],
};

export async function POST() {
  try {
    const admin = createAdminClient();

    // 1. Get categories with slugs
    const { data: cats, error: catsError } = await admin
      .from("categories")
      .select("id, slug");
    if (catsError) throw new Error(`categories query failed: ${catsError.message}`);

    const catMap: Record<string, string> = {};
    for (const c of cats ?? []) catMap[c.slug] = c.id;

    // 2. Get region IDs for Taoyuan
    const { data: regionRows } = await admin
      .from("regions")
      .select("id, code")
      .in("code", ["TW-TYC", "TW-TYC-ZL"]);
    const regionMap: Record<string, string> = {};
    for (const r of regionRows ?? []) regionMap[r.code] = r.id;

    // 3. Get subcategories (one per category for default assignment)
    const { data: subcats, error: subcatsError } = await admin
      .from("subcategories")
      .select("id, slug, category_id")
      .order("id");
    if (subcatsError) throw new Error(`subcategories query failed: ${subcatsError.message}`);

    // Group subcategory IDs by category_id (first one = default)
    const defaultSubcat: Record<string, string> = {};
    const subcatsByCategory: Record<string, string[]> = {};
    for (const s of subcats ?? []) {
      if (!defaultSubcat[s.category_id]) defaultSubcat[s.category_id] = s.id;
      if (!subcatsByCategory[s.category_id]) subcatsByCategory[s.category_id] = [];
      subcatsByCategory[s.category_id].push(s.id);
    }

    // 3. Auto-create missing categories and their subcategories
    const MISSING_CATS: Record<string, { name: string; icon: string; color: string; sortOrder: number; subs: Array<{ slug: string; name: string; sortOrder: number }> }> = {
      subsidy: {
        name: "補助申請", icon: "coin", color: "#7C3AED", sortOrder: 5,
        subs: [
          { slug: "elder-allowance", name: "老人津貼", sortOrder: 1 },
          { slug: "low-income",      name: "中低收入", sortOrder: 2 },
          { slug: "national-pension", name: "國民年金", sortOrder: 3 },
          { slug: "disability",      name: "身障補助", sortOrder: 4 },
          { slug: "major-illness",   name: "重大傷病", sortOrder: 5 },
          { slug: "elder-card",      name: "敬老卡",   sortOrder: 6 },
          { slug: "emergency-aid",   name: "急難救助", sortOrder: 7 },
        ],
      },
    };

    const catSlugs = Object.keys(RESOURCES_BY_CAT);
    const missingCats = catSlugs.filter(slug => !catMap[slug]);

    for (const slug of missingCats) {
      const meta = MISSING_CATS[slug];
      if (!meta) {
        return NextResponse.json({ error: `Unknown missing category: ${slug}` }, { status: 422 });
      }
      // Insert category
      const { data: newCat, error: catInsertError } = await admin
        .from("categories")
        .insert({ slug, name: meta.name, icon: meta.icon, color: meta.color, sort_order: meta.sortOrder })
        .select("id")
        .single();
      if (catInsertError) throw new Error(`Failed to create category ${slug}: ${catInsertError.message}`);
      const newCatId = newCat.id;
      catMap[slug] = newCatId;
      // Insert subcategories
      for (const sub of meta.subs) {
        const { data: newSub, error: subInsertError } = await admin
          .from("subcategories")
          .insert({ category_id: newCatId, slug: sub.slug, name: sub.name, sort_order: sub.sortOrder })
          .select("id")
          .single();
        if (subInsertError) throw new Error(`Failed to create subcategory ${sub.slug}: ${subInsertError.message}`);
        if (!defaultSubcat[newCatId]) defaultSubcat[newCatId] = newSub.id;
      }
    }

    let totalInserted = 0;
    const errors: string[] = [];

    for (const [catSlug, resources] of Object.entries(RESOURCES_BY_CAT)) {
      const catId = catMap[catSlug];
      if (!catId) continue;

      const subcatId = defaultSubcat[catId];
      if (!subcatId) {
        errors.push(`No subcategory found for category: ${catSlug}`);
        continue;
      }

      const rows = resources.map(r => ({
        subcategory_id: subcatId,
        scope: r.scope,
        region_id: r.scope === "local" ? (regionMap[r.regionCode ?? ""] ?? regionMap["TW-TYC"] ?? null) : null,
        name: r.name,
        summary: r.summary ?? null,
        phone: r.phone ?? null,
        address: r.address ?? null,
        tags: r.tags,
        status: "active",
        like_count: 0,
      }));

      // Use upsert with name conflict detection (insert or skip)
      for (const row of rows) {
        const { error } = await admin
          .from("resources")
          .insert(row);
        if (error) {
          if (error.code === "23505") {
            // Duplicate — skip
          } else {
            errors.push(`Insert failed (${catSlug}/${row.name}): ${error.message}`);
          }
        } else {
          totalInserted++;
        }
      }
    }

    return NextResponse.json({ ok: true, inserted: totalInserted, errors });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to seed resources" });
}
