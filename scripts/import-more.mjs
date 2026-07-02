// 擴充：長照ABC據點 → 全台所有縣市；新增 護理之家/居家護理所 清冊（全台）
// 只新增、依名稱去重，不刪除任何資料
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
const env={};for(const l of readFileSync(new URL("../.env.local",import.meta.url),"utf8").split(/\r?\n/)){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}
const sb=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const norm=(s)=>(s??"").replace(/臺/g,"台").replace(/\s+/g,"").trim();
const COUNTIES=["台北市","新北市","桃園市","台中市","台南市","高雄市","基隆市","新竹市","嘉義市","新竹縣","苗栗縣","彰化縣","南投縣","雲林縣","嘉義縣","屏東縣","宜蘭縣","花蓮縣","台東縣","澎湖縣","金門縣","連江縣"];
function parseCSV(text){const rows=[];let row=[],f="",q=false;text=text.replace(/^﻿/,"");for(let i=0;i<text.length;i++){const c=text[i];if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}else{if(c==='"')q=true;else if(c===","){row.push(f);f="";}else if(c==="\n"||c==="\r"){if(c==="\r"&&text[i+1]==="\n")i++;row.push(f);rows.push(row);row=[];f="";}else f+=c;}}if(f!==""||row.length){row.push(f);rows.push(row);}return rows.filter(r=>r.some(c=>(c??"").trim()!==""));}
function splitAddr(addr){let county=COUNTIES.find(c=>addr.startsWith(c))||COUNTIES.find(c=>addr.startsWith(c.replace(/台/g,"臺")));if(!county)return{county:null,district:null};const rest=addr.slice(county.length).replace(/^臺/,"台");const m=rest.match(/^(.+?(區|鄉|鎮|市))/);return{county,district:m?m[1]:null};}
function pickSubcatABC(services){const s=[...services].join("｜");if(/日間照顧|小規模多機能|團體家屋|家庭托顧/.test(s))return"日照中心";if(/巷弄長照站/.test(s))return"社區據點活動";if(/輔具|無障礙環境/.test(s))return"輔具申請";if(/居家服務/.test(s))return"居服員申請";if(/交通接送/.test(s))return"長照交通接送";if(/營養餐飲|送餐/.test(s))return"送餐服務";return"1966 長照服務";}

// 對映
const [{data:subs},{data:regions}]=await Promise.all([sb.from("subcategories").select("id, name"),sb.from("regions").select("id, name, level, parent_id")]);
const subByName={};for(const s of subs)subByName[norm(s.name)]=s.id;
const countyByName={};for(const r of regions)if(r.level==="county")countyByName[norm(r.name)]=r.id;
const distByKey={};for(const r of regions)if(r.level==="district")distByKey[`${r.parent_id}|${norm(r.name)}`]=r.id;
function resolveRegion(c,d){const cid=countyByName[norm(c||"")];if(!cid)return null;if(d){const did=distByKey[`${cid}|${norm(d)}`];if(did)return did;}return cid;}
// 既有名稱（分頁全量）
const existingNames=new Set();
for(let from=0;;from+=1000){const{data}=await sb.from("resources").select("name").range(from,from+999);if(!data||data.length===0)break;for(const r of data)existingNames.add(norm(r.name));if(data.length<1000)break;}
console.log("既有名稱數：",existingNames.size);

async function insertAll(label, payloads){
  let ins=0;for(let i=0;i<payloads.length;i+=200){const b=payloads.slice(i,i+200);const{error}=await sb.from("resources").insert(b);if(error)console.log(`  ✗ ${label} 寫入失敗:`,error.message);else ins+=b.length;}
  console.log(`【${label}】新增 ${ins} 筆`);return ins;
}

// ===== 1) 長照ABC 全台 =====
{
  const text=new TextDecoder("utf-8").decode(new Uint8Array(await(await fetch("https://ltcpap.mohw.gov.tw/publish/abc.csv")).arrayBuffer()));
  const rows=parseCSV(text);const head=rows[0].map(h=>h.trim());const gi=(n)=>head.indexOf(n);
  const iName=gi("機構名稱"),iCode=gi("機構代碼"),iAddr=gi("地址全址"),iSvc=gi("特約服務項目"),iPhone=gi("機構電話");
  const byCode=new Map();
  for(const r of rows.slice(1)){const addr=(r[iAddr]||"").trim();const{county,district}=splitAddr(addr);if(!county)continue;const code=(r[iCode]||"").trim()||(r[iName]||"").trim();if(!byCode.has(code))byCode.set(code,{name:(r[iName]||"").trim(),county,district,addr,phone:(r[iPhone]||"").trim(),services:new Set()});const sv=(r[iSvc]||"").trim();if(sv)byCode.get(code).services.add(sv);}
  const payloads=[];const seen=new Set();const byCat={};
  for(const g of byCode.values()){const key=norm(g.name)+"|"+norm(g.county);if(seen.has(key)||existingNames.has(norm(g.name)))continue;seen.add(key);existingNames.add(norm(g.name));const subName=pickSubcatABC(g.services);const sid=subByName[norm(subName)];if(!sid)continue;const rid=resolveRegion(g.county,g.district);if(!rid)continue;byCat[subName]=(byCat[subName]||0)+1;const content=`長照2.0特約服務單位。服務項目：${[...g.services].slice(0,8).join("、")}。地址：${g.addr}`;payloads.push({subcategory_id:sid,scope:"local",region_id:rid,name:g.name,summary:content.slice(0,100),description:content,phone:g.phone||null,status:"active",approved_at:new Date().toISOString()});}
  console.log("長照ABC 全台新增分佈：",byCat);
  await insertAll("長照ABC據點(全台補齊)",payloads);
}

// ===== 2) 護理之家 / 居家護理所 全台 =====
{
  const text=new TextDecoder("utf-8").decode(new Uint8Array(await(await fetch("https://nhplatform.mohw.gov.tw/dl-3820-74883655f255416abc752bef29cbd7aa.html")).arrayBuffer()));
  const rows=parseCSV(text);const head=rows[0].map(h=>h.trim());const gi=(n)=>head.indexOf(n);
  const iName=gi("機構名稱"),iAddr=gi("地址"),iPhone=gi("機構電話"),iKind=gi("機構類別"),iEval=gi("評鑑結果"),iBed=gi("一般護理之家-開放床數");
  const payloads=[];const seen=new Set();let skipPost=0;
  for(const r of rows.slice(1)){
    const name=(r[iName]||"").trim();if(!name)continue;
    const kind=(r[iKind]||"").trim();
    if(/產後/.test(kind)||/產後/.test(name)){skipPost++;continue;} // 跳過產後護理之家
    const addr=(r[iAddr]||"").trim();const{county,district}=splitAddr(addr);if(!county)continue;
    const key=norm(name)+"|"+norm(county);if(seen.has(key)||existingNames.has(norm(name)))continue;seen.add(key);existingNames.add(norm(name));
    const rid=resolveRegion(county,district);if(!rid)continue;
    const sid=subByName[norm("1966 長照服務")];
    const beds=(r[iBed]||"").trim();const ev=(r[iEval]||"").trim();
    let content=`${kind||"護理機構"}`;if(beds&&beds!=="0")content+=`，開放床數 ${beds} 床`;if(ev)content+=`，評鑑：${ev}`;content+=`。地址：${addr}`;
    payloads.push({subcategory_id:sid,scope:"local",region_id:rid,name,summary:content.slice(0,100),description:content,phone:(r[iPhone]||"").trim()||null,status:"active",approved_at:new Date().toISOString()});
  }
  console.log(`護理之家：跳過產後 ${skipPost} 筆`);
  await insertAll("護理之家/居家護理所(全台)",payloads);
}

const{count}=await sb.from("resources").select("id",{count:"exact",head:true});
console.log("\n資料庫總筆數：",count);
