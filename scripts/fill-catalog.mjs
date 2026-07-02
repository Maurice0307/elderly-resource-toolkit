// 用 data.gov.tw 全平台清單(_catalog.csv) 離線過濾各縣市名冊 → 下載 CSV → 解析 → 匯入
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
const env={};for(const l of readFileSync(new URL("../.env.local",import.meta.url),"utf8").split(/\r?\n/)){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}
const sb=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const norm=(s)=>(s??"").replace(/臺/g,"台").replace(/\s+/g,"").trim();
const COUNTIES=["台北市","新北市","桃園市","台中市","台南市","高雄市","基隆市","新竹市","嘉義市","新竹縣","苗栗縣","彰化縣","南投縣","雲林縣","嘉義縣","屏東縣","宜蘭縣","花蓮縣","台東縣","澎湖縣","金門縣","連江縣"];
function titleCounty(t){const n=norm(t);for(const c of COUNTIES){if(n.includes(c)||n.includes(c.replace("台","臺")))return c;}return null;}
function parseCSV(t){const rows=[];let row=[],f="",q=false;t=t.replace(/^﻿/,"");for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}else{if(c==='"')q=true;else if(c===","){row.push(f);f="";}else if(c==="\n"||c==="\r"){if(c==="\r"&&t[i+1]==="\n")i++;row.push(f);rows.push(row);row=[];f="";}else f+=c;}}if(f!==""||row.length){row.push(f);rows.push(row);}return rows.filter(r=>r.some(c=>(c??"").trim()!==""));}
function splitDist(a){const rest=a.replace(/^.*?[縣市]/,"");const m=rest.match(/^(.+?(區|鄉|鎮|市))/);return m?m[1]:null;}
const findCol=(head,kw)=>head.findIndex(h=>kw.some(k=>h.includes(k)));
async function dl(url,enc){const buf=new Uint8Array(await(await fetch(url)).arrayBuffer());const e=(enc||"").toUpperCase();let t;if(e.includes("BIG5")||e.includes("950"))t=new TextDecoder("big5").decode(buf);else{t=new TextDecoder("utf-8").decode(buf);if((t.match(/�/g)||[]).length>5)t=new TextDecoder("big5").decode(buf);}return t;}

const[{data:subs},{data:regions}]=await Promise.all([sb.from("subcategories").select("id,name"),sb.from("regions").select("id,name,level,parent_id")]);
const subByName={};for(const s of subs)subByName[norm(s.name)]=s.id;
const countyByName={};for(const r of regions)if(r.level==="county")countyByName[norm(r.name)]=r.id;
const distByKey={};for(const r of regions)if(r.level==="district")distByKey[`${r.parent_id}|${norm(r.name)}`]=r.id;
function resolveRegion(c,d){const cid=countyByName[norm(c||"")];if(!cid)return null;if(d){const did=distByKey[`${cid}|${norm(d)}`];if(did)return did;}return cid;}
const existing=new Set();
for(let from=0;;from+=1000){const{data}=await sb.from("resources").select("name").range(from,from+999);if(!data||data.length===0)break;for(const r of data)existing.add(norm(r.name));if(data.length<1000)break;}
const seen=new Set();
async function importRows(rows,subName,county,src,topicDesc){
  const sid=subByName[norm(subName)];if(!sid)return 0;
  const head=rows[0].map(h=>h.trim());
  const iN=findCol(head,["名稱","單位","院所","機構","診所","中心","所在"]);if(iN<0)return 0;
  const iA=findCol(head,["地址","住址","地點"]);const iP=findCol(head,["電話","話"]);const iDcol=findCol(head,["區別","行政區","鄉鎮","區域","所在區","區"]);
  const cid=countyByName[norm(county)];if(!cid)return 0;
  const payloads=[];
  for(const r of rows.slice(1)){
    const name=(r[iN]||"").trim();if(!name||name.length<2||/^[0-9]+$/.test(name))continue;
    const addr=iA>=0?(r[iA]||"").trim():"";
    let dist=iDcol>=0?(r[iDcol]||"").trim():"";if(!dist&&addr)dist=splitDist(addr)||"";
    const key=norm(name)+"|"+norm(county);if(seen.has(key)||existing.has(norm(name)))continue;seen.add(key);existing.add(norm(name));
    const rid=resolveRegion(county,dist);if(!rid)continue;
    const phone=iP>=0?(r[iP]||"").trim():"";
    const full=addr?(/[縣市]/.test(addr)?addr:county+dist+addr):(dist?county+dist:county);
    const content=`${topicDesc}。地址：${full}`;
    payloads.push({subcategory_id:sid,scope:"local",region_id:rid,name,summary:content.slice(0,100),description:content,phone:phone||null,source_org:src,status:"active",approved_at:new Date().toISOString()});
  }
  let ins=0;for(let i=0;i<payloads.length;i+=200){const b=payloads.slice(i,i+200);const{error}=await sb.from("resources").insert(b);if(error){console.log("    寫入失敗",error.message);}else ins+=b.length;}
  return ins;
}

// 讀清單
console.log("載入清單…");
const cat=parseCSV(readFileSync(new URL("./_catalog.csv",import.meta.url),"utf-8"));
const H=cat[0].map(h=>h.trim());
const ci={id:H.indexOf("資料集識別碼"),name:H.indexOf("資料集名稱"),fmt:H.indexOf("檔案格式"),url:H.indexOf("資料下載網址"),enc:H.indexOf("編碼格式"),org:H.indexOf("提供機關")};
console.log("清單欄位 index:",ci,"總列",cat.length-1);

const TOPICS=[
  {key:"假牙",subcat:"老花眼鏡、助聽器、假牙補助",must:/假牙/,roster:/(院所|名冊|名單|合約|特約|牙醫|醫療)/,desc:"長者假牙補助合約院所"},
  {key:"文康",subcat:"長青中心",must:/(文康|長青)/,roster:/(中心|據點|服務|名冊|名單|一覽|據點)/,desc:"老人文康／長青活動中心"},
  {key:"心理",subcat:"心理諮詢專線",must:/(心理諮商|心理治療|諮商所|治療所)/,roster:/(機構|所|名冊|名單|一覽|據點)/,desc:"心理諮商／治療所"},
];
const EXCLUDE=/(統計|成果|人數|家數|金額|比率|分布|趨勢|預算|決算|滿意度|代碼|清單|數量|核定|申請數|服務量)/;

function pickCsvUrl(fmtField,urlField){
  const fmts=(fmtField||"").split(/[;,、\s]+/).filter(Boolean);
  const urls=(urlField||"").split(/[\s;]+/).map(s=>s.trim()).filter(s=>/^https?:/.test(s));
  // 優先：副檔名/字串含 csv
  let u=urls.find(x=>/csv/i.test(x));if(u)return u;
  // 對齊格式陣列
  const idx=fmts.findIndex(f=>/csv/i.test(f));if(idx>=0&&urls[idx])return urls[idx];
  // 只有一個 URL 且格式含 CSV
  if(urls.length===1&&/csv/i.test(fmtField||""))return urls[0];
  return urls.find(x=>/download|opendata|resource/i.test(x))||null;
}

for(const T of TOPICS){
  console.log(`\n========== ${T.key} ==========`);
  const byCounty=new Map();
  for(const r of cat.slice(1)){
    const name=(r[ci.name]||"").trim();
    if(!T.must.test(name)||EXCLUDE.test(name)||(T.roster&&!T.roster.test(name)))continue;
    if(!/csv/i.test(r[ci.fmt]||""))continue;
    const county=titleCounty(name);if(!county)continue;
    if(!byCounty.has(county))byCounty.set(county,{name,url:r[ci.url],fmt:r[ci.fmt],enc:r[ci.enc],org:(r[ci.org]||"").trim()});
  }
  console.log(`符合縣市 ${byCounty.size}：`,[...byCounty.keys()].join(" "));
  let topicIns=0,cov=0;
  for(const[county,d] of byCounty){
    const url=pickCsvUrl(d.fmt,d.url);
    if(!url){console.log(`  ${county} 無CSV連結`);continue;}
    let text;try{text=await dl(url,d.enc);}catch(e){console.log(`  ${county} 下載失敗`,e.message);continue;}
    const rows=parseCSV(text);if(rows.length<2){console.log(`  ${county} 空檔`);continue;}
    const n=await importRows(rows,T.subcat,county,`${d.name}（${d.org||"data.gov.tw"}）`,T.desc);
    if(n>0){topicIns+=n;cov++;console.log(`  ✓ ${county}｜${d.name} → ${n}`);}else console.log(`  - ${county}｜${d.name} 解析0`);
  }
  console.log(`【${T.key}】新增 ${topicIns}，涵蓋 ${cov} 縣市`);
}
const{count}=await sb.from("resources").select("id",{count:"exact",head:true});
console.log("\nDB 總筆數:",count);
