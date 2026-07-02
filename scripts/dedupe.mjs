// 去重：同名稱 + 同地區(region_id) + 同 scope 視為重複，保留資料最完整一筆，刪除其餘。
// 預設「試跑」不刪；加參數 --apply 才真的刪除。
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
const env={};for(const l of readFileSync(new URL("../.env.local",import.meta.url),"utf8").split(/\r?\n/)){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}
const sb=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const APPLY=process.argv.includes("--apply");
const norm=(s)=>(s??"").replace(/臺/g,"台").replace(/\s+/g,"").trim();

// 撈全部
const all=[];
for(let from=0;;from+=1000){
  const{data,error}=await sb.from("resources").select("id,name,region_id,scope,phone,website_url,description,created_at,like_count").range(from,from+999);
  if(error){console.log("讀取失敗:",error.message);process.exit(1);}
  if(!data||data.length===0)break;all.push(...data);if(data.length<1000)break;
}
console.log("總資源:",all.length);

// 分組
const groups=new Map();
for(const r of all){
  const key=norm(r.name)+"||"+(r.region_id??("nat:"+(r.scope??"")));
  if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);
}
// 完整度分數：有電話+2、有網址+1、有描述+描述長度權重、like_count、越早建立越優先(穩定)
function score(r){let s=0;if(r.phone)s+=1000;if(r.website_url)s+=500;if(r.description)s+=Math.min(r.description.length,300);s+=(r.like_count||0)*10;return s;}
const toDelete=[];const examples=[];
for(const [key,rows] of groups){
  if(rows.length<2)continue;
  rows.sort((a,b)=>{const d=score(b)-score(a);if(d)return d;return new Date(a.created_at)-new Date(b.created_at);}); // 分數高優先，平手取最早
  const keep=rows[0];const del=rows.slice(1);
  for(const r of del)toDelete.push(r.id);
  if(examples.length<15)examples.push({name:keep.name,keep:keep.id.slice(0,8),removes:del.length});
}
console.log(`重複群組: ${[...groups.values()].filter(g=>g.length>1).length} 組，待刪除: ${toDelete.length} 筆`);
console.log("\n範例（保留 1 筆，刪除 N 筆）:");
for(const e of examples)console.log(`  • ${e.name} → 刪 ${e.removes} 筆`);

if(!APPLY){console.log("\n[試跑] 未刪除。確認無誤後我會加 --apply 實際執行。");process.exit(0);}

let del=0;
for(let i=0;i<toDelete.length;i+=200){
  const ids=toDelete.slice(i,i+200);
  const{error}=await sb.from("resources").delete().in("id",ids);
  if(error){console.log("刪除失敗:",error.message);process.exit(1);}del+=ids.length;
}
console.log("\n✅ 已刪除重複:",del,"筆");
const{count}=await sb.from("resources").select("id",{count:"exact",head:true});
console.log("資料庫總筆數:",count);
