// 復康巴士各縣市策展（資料來源：各縣市公運處/社會局公開資訊）。只新增、依名稱去重。
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
const env={};for(const l of readFileSync(new URL("../.env.local",import.meta.url),"utf8").split(/\r?\n/)){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}
const sb=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const norm=(s)=>(s??"").replace(/臺/g,"台").replace(/\s+/g,"").trim();

const ITEMS=[
  { county:"台北市", name:"臺北市復康巴士預約服務", phone:"0809-080650",
    desc:"身心障礙者無障礙接送。24小時客服訂車：0809-080650；語音訂車：0800-065165。線上訂車：https://0809080650.gov.taipei/", url:"https://0809080650.gov.taipei/" },
  { county:"桃園市", name:"桃園市復康巴士預約服務", phone:"03-3010208",
    desc:"身心障礙者無障礙接送。北桃園訂車：(03)301-0208；南桃園訂車：(03)301-5568。線上訂車：https://www.e-bus.com.tw/", url:"https://www.e-bus.com.tw/" },
  { county:"高雄市", name:"高雄市復康巴士預約服務", phone:"07-7407977",
    desc:"身心障礙者無障礙接送。預約專線：07-740-7977（手機直撥 55107）；臨時叫車／取消：07-740-6033。", url:"" },
  { county:"花蓮縣", name:"花蓮縣復康巴士預約服務", phone:"",
    desc:"身心障礙者無障礙接送。線上預約系統：https://rehabus.hl.gov.tw/", url:"https://rehabus.hl.gov.tw/" },
];

const [{data:subs},{data:regions}]=await Promise.all([sb.from("subcategories").select("id, name"),sb.from("regions").select("id, name, level")]);
const subByName={};for(const s of subs)subByName[norm(s.name)]=s.id;
const countyByName={};for(const r of regions)if(r.level==="county")countyByName[norm(r.name)]=r.id;
const existingNames=new Set();
for(let from=0;;from+=1000){const{data}=await sb.from("resources").select("name").range(from,from+999);if(!data||data.length===0)break;for(const r of data)existingNames.add(norm(r.name));if(data.length<1000)break;}

const sid=subByName[norm("復康巴士")];
if(!sid){console.log("找不到『復康巴士』子分類");process.exit(1);}
const payloads=[];
for(const it of ITEMS){
  if(existingNames.has(norm(it.name))){console.log("已存在，略過:",it.name);continue;}
  const rid=countyByName[norm(it.county)];if(!rid){console.log("無此縣市:",it.county);continue;}
  payloads.push({subcategory_id:sid,scope:"local",region_id:rid,name:it.name,summary:it.desc.slice(0,100),description:it.desc,phone:it.phone||null,website_url:it.url||null,status:"active",approved_at:new Date().toISOString()});
}
const{error}=payloads.length?await sb.from("resources").insert(payloads):{error:null};
if(error)console.log("寫入失敗:",error.message);else console.log("復康巴士新增：",payloads.length,"筆");
