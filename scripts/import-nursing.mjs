// 護理之家 / 居家護理所 全台（跳過產後護理之家）。只新增、依名稱去重。
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
const env={};for(const l of readFileSync(new URL("../.env.local",import.meta.url),"utf8").split(/\r?\n/)){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}
const sb=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const norm=(s)=>(s??"").replace(/臺/g,"台").replace(/\s+/g,"").trim();
const COUNTIES=["台北市","新北市","桃園市","台中市","台南市","高雄市","基隆市","新竹市","嘉義市","新竹縣","苗栗縣","彰化縣","南投縣","雲林縣","嘉義縣","屏東縣","宜蘭縣","花蓮縣","台東縣","澎湖縣","金門縣","連江縣"];
function parseCSV(text){const rows=[];let row=[],f="",q=false;text=text.replace(/^﻿/,"");for(let i=0;i<text.length;i++){const c=text[i];if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}else{if(c==='"')q=true;else if(c===","){row.push(f);f="";}else if(c==="\n"||c==="\r"){if(c==="\r"&&text[i+1]==="\n")i++;row.push(f);rows.push(row);row=[];f="";}else f+=c;}}if(f!==""||row.length){row.push(f);rows.push(row);}return rows.filter(r=>r.some(c=>(c??"").trim()!==""));}
function splitAddr(addr){let county=COUNTIES.find(c=>addr.startsWith(c))||COUNTIES.find(c=>addr.startsWith(c.replace(/台/g,"臺")));if(!county)return{county:null,district:null};const rest=addr.slice(county.length).replace(/^臺/,"台");const m=rest.match(/^(.+?(區|鄉|鎮|市))/);return{county,district:m?m[1]:null};}

const [{data:subs},{data:regions}]=await Promise.all([sb.from("subcategories").select("id, name"),sb.from("regions").select("id, name, level, parent_id")]);
const subByName={};for(const s of subs)subByName[norm(s.name)]=s.id;
const countyByName={};for(const r of regions)if(r.level==="county")countyByName[norm(r.name)]=r.id;
const distByKey={};for(const r of regions)if(r.level==="district")distByKey[`${r.parent_id}|${norm(r.name)}`]=r.id;
function resolveRegion(c,d){const cid=countyByName[norm(c||"")];if(!cid)return null;if(d){const did=distByKey[`${cid}|${norm(d)}`];if(did)return did;}return cid;}
const existingNames=new Set();
for(let from=0;;from+=1000){const{data}=await sb.from("resources").select("name").range(from,from+999);if(!data||data.length===0)break;for(const r of data)existingNames.add(norm(r.name));if(data.length<1000)break;}
console.log("既有名稱數：",existingNames.size);

const text=new TextDecoder("utf-8").decode(readFileSync(new URL("./_nursing_raw.csv",import.meta.url)));
const rows=parseCSV(text);const head=rows[0].map(h=>h.trim());const gi=(n)=>head.indexOf(n);
const iName=gi("機構名稱"),iAddr=gi("地址"),iPhone=gi("機構電話"),iKind=gi("機構類別"),iEval=gi("評鑑結果"),iBed=gi("一般護理之家-開放床數");
const sid=subByName[norm("1966 長照服務")];
const payloads=[];const seen=new Set();let skipPost=0;
for(const r of rows.slice(1)){
  const name=(r[iName]||"").trim();if(!name)continue;
  const kind=(r[iKind]||"").trim();
  if(/產後/.test(kind)||/產後/.test(name)){skipPost++;continue;}
  const addr=(r[iAddr]||"").trim();const{county,district}=splitAddr(addr);if(!county)continue;
  const key=norm(name)+"|"+norm(county);if(seen.has(key)||existingNames.has(norm(name)))continue;seen.add(key);existingNames.add(norm(name));
  const rid=resolveRegion(county,district);if(!rid)continue;
  const beds=(r[iBed]||"").trim();const ev=(r[iEval]||"").trim();
  let content=`${kind||"護理機構"}`;if(beds&&beds!=="0")content+=`，開放床數 ${beds} 床`;if(ev)content+=`，評鑑：${ev}`;content+=`。地址：${addr}`;
  payloads.push({subcategory_id:sid,scope:"local",region_id:rid,name,summary:content.slice(0,100),description:content,phone:(r[iPhone]||"").trim()||null,status:"active",approved_at:new Date().toISOString()});
}
console.log(`跳過產後護理之家 ${skipPost} 筆`);
let ins=0;for(let i=0;i<payloads.length;i+=200){const b=payloads.slice(i,i+200);const{error}=await sb.from("resources").insert(b);if(error)console.log("寫入失敗:",error.message);else ins+=b.length;}
console.log("護理之家/居家護理所 新增：",ins,"筆");
const{count}=await sb.from("resources").select("id",{count:"exact",head:true});
console.log("資料庫總筆數：",count);
