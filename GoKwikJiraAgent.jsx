import { useState, useEffect, useRef } from "react";

const CLOUD_ID = "14b846a5-a9a6-423c-a169-78241b8aafc2";
const JIRA_BASE = "https://gokwik.atlassian.net";

// GoKwik brand colors
const GK = {
  navy: "#0A2463",
  navyDark: "#061840",
  navyLight: "#1a3a7a",
  gold: "#F5A623",
  goldLight: "#FFB940",
  goldDark: "#D4891A",
  white: "#FFFFFF",
  bg: "#F4F6FB",
  cardBg: "#FFFFFF",
  border: "#E2E8F4",
  text: "#0A2463",
  textMuted: "#6B7A99",
  textLight: "#9AA5BC",
  success: "#10B981",
  error: "#EF4444",
  warn: "#F5A623",
  inputBg: "#F8FAFF",
};

const PROJECTS = [
  { key:"PM",       name:"Checkout & Payments - Product" },
  { key:"CHECKOUT", name:"Shopify Checkout" },
  { key:"PAYM",     name:"Payments" },
  { key:"GKP",      name:"Gokwik Platform" },
  { key:"GQ",       name:"GK Ops" },
  { key:"CE",       name:"Customer Engineering" },
  { key:"TO",       name:"KwikChat_Ops" },
  { key:"ITSM",     name:"ITSM" },
  { key:"KP",       name:"KwikPass" },
  { key:"KWIK",     name:"KwikShip" },
  { key:"GKRP",     name:"Return_Prime" },
  { key:"DEVOPS",   name:"DEVOPS" },
  { key:"DATA",     name:"Data-Engineering" },
  { key:"MER",      name:"Dashboards" },
  { key:"GC",       name:"Gokwik Cart" },
  { key:"KE",       name:"KC_Engagement" },
  { key:"RE",       name:"RTO-Engg" },
  { key:"PLAT",     name:"Platform-Plugins" },
  { key:"KAI",      name:"KAI" },
  { key:"SA",       name:"Shopify App" },
  { key:"TL",       name:"KwikChat_Tech" },
  { key:"KCPROD",   name:"Kwikchat Product" },
  { key:"KEAC",     name:"KwikEngage - AI Chatbot" },
  { key:"IS",       name:"Information Security" },
  { key:"MKTG",     name:"Marketing" },
  { key:"CS",       name:"Customer Success" },
  { key:"DBRE",     name:"Database Reliability" },
  { key:"DES",      name:"Design" },
  { key:"AUT",      name:"Automation" },
  { key:"GLOB",     name:"GlobalCheckout" },
  { key:"PP",       name:"Payment Product" },
  { key:"RMS",      name:"RTO-Program" },
  { key:"RS",       name:"RTO Science" },
  { key:"RH",       name:"RTO Hypercare" },
  { key:"RPPROD",   name:"Return Prime- Product" },
  { key:"KA",       name:"KwikAds" },
  { key:"MSL",      name:"Merchant Success-LT" },
  { key:"KWF",      name:"KwikChat Finance" },
  { key:"LABS",     name:"KwikLabs" },
  { key:"CUST",     name:"Custom Integrations" },
  { key:"RCA",      name:"RCA" },
  { key:"BA",       name:"BeerBals - Analytics" },
];

const SEVERITY_GUIDE = `
SEVERITY:
- Highest(Sev1): Platform down, 50%+ traffic, 100+ merchants, revenue loss, checkout/payments fully broken
- High(Sev2): Major feature broken, 10%+ traffic, 20+ merchants, blocking transactions
- Medium(Sev3): <10% traffic, ≤20 merchants, single merchant issue, workaround possible
- Low(Sev4): No impact, cosmetic, isolated, suggestions

ROUTING (use BOTH summary and description to decide):

PM (Checkout & Payments - Product) — VERY COMMON, often missed:
  Abandoned cart not syncing/reflecting in Shopify, checkout bugs reported by merchants/CSMs, COD not showing, OTP validation, loyalty integration, webhook/API for orders, upsell analytics, checkout load time, meta events/pixel issues, script CORS issues, free gift validation errors, payment report requests, abandoned checkout missing from Shopify portal
  DESCRIPTION SIGNALS: "abandoned cart", "not reflecting", "Shopify dashboard", "GoKwik dashboard", "checkout bug", "MID:", "FD:"

CHECKOUT: Shopify theme integration, Buy Now button, 1.0 theme customisation, GA4 events not firing, UPI QR at checkout UI
PAYM: PSR drops, UPI/payment gateway failures across multiple merchants, prepaid % drops, payment routing analysis
GKP: Core backend/platform APIs, PP-COD API, order price display bugs, LCNC validator, backend platform issues
CE: Theme customisations go-live, PDP widget, button additions, merchant onboarding tech tasks, Shopify 1.0 integration, theme migration
TO: KwikChat ops — WhatsApp merchant issues, billing/refund for KwikChat, catalog uploads, NLP bot flows, BSP deployment, price renegotiation, channel management (HIGH VOLUME)
ITSM: Software access requests (Claude, dashboards, repos, VPN, tools), IT support tickets
DEVOPS: k8s alerts, OOM errors, AWS EC2, container issues, infra change requests, signoz alerts
GKRP: Returns, exchanges, return fee, wonder flow, domain changes for return prime merchants
KE: WhatsApp/email campaign issues, DIY bot, engagement automation
KP: KwikPass login/OTP, authentication, KwikPass mobile view
KWIK: Shipping tracking, AWB data, KwikShip issues
GC: KwikCart bugs, cart scroll, upsell errors on cart
DATA: Data model discrepancies, ETL/pipeline, Trino, data dumps
RE/RS: RTO prediction, AWB backfill, RTO ML model
MER: Merchant dashboard (non-checkout), analytics reports, metrics
`;

const ISSUE_TYPES = ["Task","Bug","Story","Epic","Production Bug","Incident","New Feature"];
const SEVERITIES = [
  { key:"Highest", label:"Sev 1", icon:"🔴", title:"Critical", criteria:"Platform down · 100+ merchants", color:"#EF4444" },
  { key:"High",    label:"Sev 2", icon:"🟠", title:"High",     criteria:"Major feature broken · 20+ merchants", color:"#F97316" },
  { key:"Medium",  label:"Sev 3", icon:"🟡", title:"Medium",   criteria:"Single merchant · workaround exists", color:"#F5A623" },
  { key:"Low",     label:"Sev 4", icon:"🔵", title:"Low",      criteria:"No impact · cosmetic · isolated", color:"#3B82F6" },
];

const MERCHANT_DB = {
  "myntra":"myntra.com","nykaa":"nykaa.com","boat":"boat-lifestyle.com","mamaearth":"mamaearth.in",
  "noise":"gonoise.com","bewakoof":"bewakoof.com","myglamm":"myglamm.com","beardo":"beardo.in",
  "mcaffeine":"mcaffeine.in","wow skin":"wowskinscience.com","pilgrim":"pilgrimbeauty.com",
  "man matters":"manmatters.com","boldfit":"boldfit.in","healthkart":"healthkart.com",
  "the bear house":"thebearhouseindia.com","bearhouseindia":"thebearhouseindia.com",
  "runeoriginals":"runeoriginals.com","chumbak":"chumbak.com","bella vita":"bellavitaorganic.com",
  "sirona":"sironacare.com","moms co":"the-moms-co.com","organic harvest":"organicharvest.in",
  "nua":"nuawoman.com","plum":"plumgoodness.com","dot & key":"dotandkey.com",
  "himalaya":"himalayawellness.com","pepperfry":"pepperfry.com","wakefit":"wakefit.co",
  "lenskart":"lenskart.com","caratlane":"caratlane.com","bluestone":"bluestone.com",
  "campus":"campusshoes.com","bata":"bata.in","clovia":"clovia.com","zivame":"zivame.com",
  "jockey":"jockey.in","fabindia":"fabindia.com","biba":"biba.in","firstcry":"firstcry.com",
  "crompton":"crompton.co.in","havells":"havells.com","gnc":"gncindia.com","cureskin":"cureskin.com",
  "beyoung":"beyoung.in","hypd":"hypd.store","crocs":"crocs.com/in","drtrust":"drtrust.in",
  "culture circle":"culturecircle.in","chapter 2":"chapter2.in","louis stitch":"louisstitch.com",
  "sugar cosmetics":"sugarcosmetics.com","babyorgano":"babyorgano.com","sleepycat":"sleepycat.in",
  "technosport":"technosport.co.in","bonkers corner":"bonkerscorner.com","kaya science":"kayascience.com",
  "mars cosmetics":"marscosmetics.in","kalki fashion":"kalkifashion.com","bighaat":"bighaat.com",
  "nathabit":"nathabit.in","vilvah":"vilvah.in","myfrido":"myfrido.com","foxtale":"foxtale.in",
  "ikari homes":"ikari.in","trackx":"trackx.in","blissclub":"blissclub.com",
};
const TEAM_DB = {
  "himanshu":"himanshu","rahul":"rahul","priya":"priya","amit":"amit","ankit":"ankit",
  "ankita":"ankita","sneha":"sneha","rohit":"rohit","pooja":"pooja","vikas":"vikas",
  "neha":"neha","sachin":"sachin","divya":"divya","arjun":"arjun","karan":"karan",
  "deepak":"deepak","shruti":"shruti","nikhil":"nikhil","aditya":"aditya","saurabh":"saurabh",
  "mayank":"mayank","shubham":"shubham","ashish":"ashish","vivek":"vivek","sumit":"sumit",
  "gaurav":"gaurav","akash":"akash","harsh":"harsh","yash":"yash","naman":"naman",
  "aman":"aman","rishabh":"rishabh","pankaj":"pankaj","tarun":"tarun","kunal":"kunal",
  "robin":"robin","atul":"atul","riya":"riya","priyanka":"priyanka","tanvi":"tanvi",
};

function resolveBrandUrl(n){if(!n)return"";const k=n.trim().toLowerCase();if(MERCHANT_DB[k])return"https://"+MERCHANT_DB[k];for(const[m,v]of Object.entries(MERCHANT_DB)){if(k.includes(m)||m.includes(k))return"https://"+v;}return"https://"+k.replace(/\s+/g,"").replace(/[^a-z0-9]/g,"")+ ".myshopify.com";}
function resolveEmail(n){if(!n)return"";const parts=n.trim().toLowerCase().split(/\s+/);const f=parts[0]||"";const l=parts[1]||"";if(TEAM_DB[f])return TEAM_DB[f]+"@gokwik.co";return l?f+"."+l+"@gokwik.co":f+"@gokwik.co";}
function stopwords(){return new Set(["the","is","a","an","in","on","at","for","to","of","and","or","with","by","not","this","it","we","my","please","all","can","when","was","were","has","have","be","as","do"]);}

function buildSearchTerms(summary, description) {
  const sw = stopwords();
  const clean = function(t) {
    return (t||"").toLowerCase().replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(function(w){return w.length>2&&!sw.has(w);});
  };
  const sumKws = clean(summary).slice(0,3);
  const descKws = clean(description).filter(function(w){return w.length>3;}).slice(0,4);
  const phrase = sumKws.slice(0,2).join(" ");
  const combined = Array.from(new Set([...sumKws,...descKws])).slice(0,5).join(" ");
  return { phrase, combined, descKws };
}

async function fastJQLSearch(summary, description, project) {
  const { phrase, combined, descKws } = buildSearchTerms(summary, description);
  if (!combined) return [];

  const jqls = [
    "text ~ \"" + combined + "\" ORDER BY updated DESC",
    project
      ? "project = " + project + " AND text ~ \"" + (descKws.slice(0,3).join(" ")||combined) + "\" ORDER BY updated DESC"
      : "summary ~ \"" + phrase + "\" ORDER BY updated DESC",
  ];

  const runJQL = async function(jql) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{
            role: "user",
            content: "Use searchJiraIssuesUsingJql with cloudId=\"" + CLOUD_ID + "\", jql=\"" + jql + "\", maxResults=6, fields=[\"summary\",\"status\",\"priority\",\"issuetype\",\"project\",\"assignee\",\"created\"]. Return ONLY the results as a JSON array: [{\"key\":\"X-1\",\"summary\":\"...\",\"status\":\"...\",\"priority\":\"...\",\"issueType\":\"...\",\"project\":\"...\",\"assignee\":\"...\",\"created\":\"...\"}]. No explanation."
          }],
          mcp_servers: [{ type: "url", url: "https://mcp.atlassian.com/v1/mcp", name: "atlassian" }],
        }),
      });
      const d = await res.json();
      const blocks = d.content || [];
      const toolResults = blocks.filter(function(b){ return b.type === "mcp_tool_result"; });
      if (toolResults.length > 0) {
        try {
          const raw = (toolResults[0].content||[{text:"[]"}])[0].text || "[]";
          const parsed = JSON.parse(raw);
          const issues = parsed.issues || parsed;
          if (Array.isArray(issues)) {
            return issues.map(function(i) {
              const f = i.fields || {};
              return {
                key: i.key,
                summary: f.summary || "",
                status: (f.status && f.status.name) || "",
                priority: (f.priority && f.priority.name) || "",
                issueType: (f.issuetype && f.issuetype.name) || "",
                project: (f.project && f.project.key) || "",
                assignee: (f.assignee && f.assignee.displayName) || "",
                created: f.created || "",
              };
            });
          }
        } catch(e) {}
      }
      const t = blocks.filter(function(b){return b.type==="text";}).map(function(b){return b.text;}).join("");
      const m = t.match(/\[[\s\S]*?\]/);
      try { return m ? JSON.parse(m[0]) : []; } catch { return []; }
    } catch { return []; }
  };

  const [r1, r2] = await Promise.all([runJQL(jqls[0]), runJQL(jqls[1])]);
  const seen = new Set(); const out = [];
  [...r1, ...r2].forEach(function(i) {
    if (i && i.key && !seen.has(i.key)) { seen.add(i.key); out.push(i); }
  });
  return out.slice(0, 6);
}

async function callClaude(messages,system){
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:system,messages:messages})});
  const d=await res.json();
  const blocks=d.content||[];
  return (blocks[0]&&blocks[0].text)||"";
}

async function analyzeIssue(summary,description){
  const projectList=PROJECTS.map(function(p){return p.key+": "+p.name;}).join("\n");
  const text=await callClaude([{role:"user",content:"Analyze this GoKwik JIRA ticket using BOTH summary AND description. Return ONLY valid JSON.\nSummary: \""+summary+"\"\nDescription: \""+(description||"")+"\"\n\n"+SEVERITY_GUIDE+"\n\nProjects:\n"+projectList+"\n\nReturn ONLY:\n{\"project\":\"KEY\",\"issueType\":\"Bug|Task|Story|Epic|Production Bug|Incident|New Feature\",\"priority\":\"Highest|High|Medium|Low\",\"severity\":\"Sev 1|Sev 2|Sev 3|Sev 4\",\"confidence\":90,\"reason\":\"one sentence\",\"enhancedDescription\":\"professional 3-5 sentence description\"}"}],
  "You are a GoKwik engineering JIRA assistant. Analyze BOTH summary AND description carefully. Return ONLY valid JSON.");
  try{const m=text.match(/\{[\s\S]*\}/);if(m)return JSON.parse(m[0]);}catch{}return null;
}

async function fetchBrandFromJira(brandName){
  if(!brandName||brandName.length<3)return null;
  try{
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:"Search Jira for merchant \""+brandName+"\" to find their MID and brand URL. Return ONLY JSON: {\"mid\":\"...\",\"brandUrl\":\"...\",\"brandName\":\"...\"} or null fields if not found."}],mcp_servers:[{type:"url",url:"https://mcp.atlassian.com/v1/mcp",name:"atlassian"}]})});
    const d=await res.json();
    const blocks=d.content||[];
    const t=blocks.filter(function(b){return b.type==="text";}).map(function(b){return b.text;}).join("");
    const m=t.match(/\{[\s\S]*?\}/);if(m){const r=JSON.parse(m[0]);return(r.mid||r.brandUrl)?r:null;}
  }catch{}return null;
}

async function cloneTicket(sourceKey,newMerchant,newMid,newBrandUrl,proj){
  try{
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,messages:[{role:"user",content:"Do these steps on Jira (cloudId: "+CLOUD_ID+"):\n1. Fetch issue "+sourceKey+"\n2. Create a new ticket cloning it but replacing merchant details with Brand: "+newMerchant+", MID: "+(newMid||"N/A")+", URL: "+(newBrandUrl||"N/A")+". Keep same project ("+(proj||"same")+"), issueType, priority.\n3. Link new ticket to "+sourceKey+" as \"Cloners\" (id:10001)\nReturn ONLY JSON: {\"key\":\"X-1\",\"url\":\"...\",\"cloneLinked\":true}"}],mcp_servers:[{type:"url",url:"https://mcp.atlassian.com/v1/mcp",name:"atlassian"}]})});
    const d=await res.json();
    const blocks=d.content||[];
    const t=blocks.filter(function(b){return b.type==="text";}).map(function(b){return b.text;}).join("");
    try{const m=t.match(/\{[\s\S]*?\}/);if(m)return JSON.parse(m[0]);}catch{}
    const k=t.match(/([A-Z]+-\d+)/);if(k)return{key:k[1],url:JIRA_BASE+"/browse/"+k[1],cloneLinked:false};
  }catch{}return null;
}

async function createJiraTicket(ticket){
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:"Create Jira ticket:\n- cloudId:"+CLOUD_ID+"\n- Project:"+ticket.project+"\n- Type:"+ticket.issueType+"\n- Summary:"+ticket.summary+"\n- Description:"+ticket.description+"\n- Priority:"+ticket.priority+"\nReturn ONLY JSON:{\"key\":\"X-1\",\"url\":\"...\"}"}],mcp_servers:[{type:"url",url:"https://mcp.atlassian.com/v1/mcp",name:"atlassian"}]})});
  const d=await res.json();
  const blocks=d.content||[];
  const t=blocks.filter(function(b){return b.type==="text";}).map(function(b){return b.text;}).join("");
  try{const m=t.match(/\{[\s\S]*\}/);if(m)return JSON.parse(m[0]);}catch{}
  const k=t.match(/([A-Z]+-\d+)/);return k?{key:k[1],url:JIRA_BASE+"/browse/"+k[1]}:null;
}

const statusColor=s=>{const l=(s||"").toLowerCase();if(l.includes("progress")||l.includes("development"))return{bg:"#FEF3C7",color:"#D97706",border:"#FDE68A"};if(l.includes("done")||l.includes("resolved")||l.includes("closed")||l.includes("launched"))return{bg:"#D1FAE5",color:"#059669",border:"#A7F3D0"};return{bg:"#DBEAFE",color:"#2563EB",border:"#BFDBFE"};};
const typeIcon=t=>({Bug:"🐛","Production Bug":"🚨",Incident:"⚡",Story:"📖",Task:"✅",Epic:"🗂️","New Feature":"✨"}[t]||"📌");
const priIcon=p=>({Highest:"🔴",High:"🟠",Medium:"🟡",Low:"🔵"}[p]||"⚪");

const AutoField=({label,value,auto,onEdit,type="text",placeholder})=>{
  const[ed,setEd]=useState(false);const[loc,setLoc]=useState(value);
  useEffect(()=>setLoc(value),[value]);
  const save=()=>{onEdit(loc);setEd(false);};
  return(
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <label style={{fontSize:11,fontWeight:700,color:GK.textMuted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>
        {auto&&!ed&&<span style={{fontSize:10,background:"#E8F5E9",color:GK.success,border:`1px solid #A5D6A7`,borderRadius:20,padding:"1px 8px",fontWeight:700}}>✦ AUTO</span>}
      </div>
      {ed?(
        <div style={{display:"flex",gap:8}}>
          <input style={{flex:1,background:GK.inputBg,border:`1.5px solid ${GK.navy}`,borderRadius:8,padding:"9px 12px",color:GK.text,fontSize:14,outline:"none"}}
            type={type} value={loc} onChange={e=>setLoc(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()} autoFocus/>
          <button onClick={save} style={{background:GK.success,border:"none",borderRadius:8,color:"#fff",cursor:"pointer",padding:"0 12px",fontWeight:700}}>✓</button>
          <button onClick={()=>setEd(false)} style={{background:GK.border,border:"none",borderRadius:8,color:GK.textMuted,cursor:"pointer",padding:"0 10px"}}>✕</button>
        </div>
      ):(
        <div style={{background:auto?`#F0F7FF`:GK.inputBg,border:`1.5px solid ${auto?"#BFDBFE":GK.border}`,borderRadius:8,padding:"9px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:value?GK.text:GK.textLight,fontSize:14}}>{value||<em style={{color:GK.textLight}}>{placeholder}</em>}</span>
          <button onClick={()=>setEd(true)} style={{background:"transparent",border:"none",color:GK.textMuted,cursor:"pointer",fontSize:13}}>✏️</button>
        </div>
      )}
    </div>
  );
};

const CloneModal=({ticket,onClose,onCloned,proj})=>{
  const[merchant,setMerchant]=useState("");const[mid,setMid]=useState("");
  const[url,setUrl]=useState("");const[loading,setLoading]=useState(false);const[done,setDone]=useState(null);
  const doClone=async()=>{if(!merchant)return;setLoading(true);const r=await cloneTicket(ticket.key,merchant,mid,url||resolveBrandUrl(merchant),proj);if(r?.key){setDone(r);onCloned&&onCloned(r);}setLoading(false);};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(10,36,99,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
      <div style={{background:GK.cardBg,borderRadius:16,padding:28,width:"100%",maxWidth:440,boxShadow:"0 20px 60px rgba(10,36,99,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:GK.navy}}>🔁 Clone for Another Merchant</div>
            <div style={{fontSize:12,color:GK.textMuted,marginTop:2}}>Cloning from <span style={{color:GK.gold,fontWeight:800}}>{ticket.key}</span></div>
          </div>
          <button onClick={onClose} style={{background:GK.border,border:"none",borderRadius:50,width:32,height:32,cursor:"pointer",color:GK.textMuted,fontWeight:700,fontSize:16}}>×</button>
        </div>
        {!done?(
          <>
            <div style={{background:GK.inputBg,border:`1px solid ${GK.border}`,borderRadius:10,padding:"10px 14px",marginBottom:16}}>
              <div style={{color:GK.navy,fontWeight:700,fontSize:13,marginBottom:2}}>{ticket.summary}</div>
              <div style={{fontSize:11,color:GK.textMuted}}>{ticket.status} · {ticket.priority} · {ticket.project}</div>
            </div>
            {[["New Brand / Merchant Name *",merchant,setMerchant,"e.g. Nykaa, Noise, Boat…"],["MID (optional)",mid,setMid,"Merchant ID"],["Brand URL",url,e=>{setUrl(e);},resolveBrandUrl(merchant)||"Auto-filled from name…"]].map(([lbl,val,setter,ph],i)=>(
              <div key={i} style={{marginBottom:14}}>
                <label style={{fontSize:11,fontWeight:700,color:GK.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:5}}>{lbl}</label>
                <input style={{width:"100%",background:GK.inputBg,border:`1.5px solid ${GK.border}`,borderRadius:8,padding:"9px 12px",color:GK.text,fontSize:14,outline:"none",boxSizing:"border-box"}}
                  placeholder={ph} value={val} onChange={e=>{setter(e.target.value);if(i===0)setUrl(resolveBrandUrl(e.target.value));}}/>
              </div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:6}}>
              <button onClick={onClose} style={{padding:"10px 18px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",border:`1.5px solid ${GK.border}`,background:"#fff",color:GK.textMuted}}>Cancel</button>
              <button onClick={doClone} disabled={!merchant||loading}
                style={{flex:1,padding:"10px 18px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",border:"none",background:`linear-gradient(135deg,${GK.navy},${GK.navyLight})`,color:"#fff",opacity:!merchant||loading?0.6:1}}>
                {loading?"⏳ Cloning…":"🔁 Clone & Link Ticket"}
              </button>
            </div>
          </>
        ):(
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:36,marginBottom:8}}>✅</div>
            <div style={{fontSize:16,fontWeight:800,color:GK.success,marginBottom:4}}>Cloned Successfully!</div>
            <div style={{fontSize:24,fontWeight:900,color:GK.navy,marginBottom:4}}>{done.key}</div>
            <div style={{fontSize:12,color:GK.textMuted,marginBottom:16}}>Linked to {ticket.key}</div>
            <a href={done.url||`${JIRA_BASE}/browse/${done.key}`} target="_blank" rel="noreferrer">
              <button style={{padding:"10px 24px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",border:"none",background:`linear-gradient(135deg,${GK.navy},${GK.navyLight})`,color:"#fff"}}>🔗 Open in JIRA</button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App(){
  const[step,setStep]=useState(0);
  const[form,setForm]=useState({project:"",issueType:"Bug",summary:"",description:"",priority:"Medium",midBrandName:"",midBrandUrl:"",reporterName:"",reporterEmail:""});
  const[auto,setAuto]=useState({project:false,issueType:false,priority:false,brandUrl:false,email:false});
  const[aiSug,setAiSug]=useState(null);const[analyzing,setAnalyzing]=useState(false);
  const[similar,setSimilar]=useState([]);const[simLoading,setSimLoading]=useState(false);
  const[brandFetching,setBrandFetching]=useState(false);const[brandFetched,setBrandFetched]=useState(null);
  const[cloneTarget,setCloneTarget]=useState(null);
  const[created,setCreated]=useState(null);const[creating,setCreating]=useState(false);
  const[error,setError]=useState("");
  const aRef=useRef(null);const sRef=useRef(null);const bRef=useRef(null);

  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));

  useEffect(()=>{if(!form.reporterName)return;setForm(f=>({...f,reporterEmail:resolveEmail(f.reporterName)}));setAuto(a=>({...a,email:true}));},[form.reporterName]);

  useEffect(()=>{
    if(!form.midBrandName){setBrandFetched(null);return;}
    setForm(f=>({...f,midBrandUrl:resolveBrandUrl(f.midBrandName)}));setAuto(a=>({...a,brandUrl:true}));
    clearTimeout(bRef.current);
    bRef.current=setTimeout(async()=>{setBrandFetching(true);const r=await fetchBrandFromJira(form.midBrandName);if(r){setBrandFetched(r);if(r.brandUrl)setForm(f=>({...f,midBrandUrl:r.brandUrl}));}setBrandFetching(false);},1500);
  },[form.midBrandName]);

  useEffect(()=>{
    clearTimeout(aRef.current);if(form.summary.length<8){setAiSug(null);return;}
    aRef.current=setTimeout(async()=>{
      setAnalyzing(true);const r=await analyzeIssue(form.summary,form.description);
      if(r){setAiSug(r);setForm(f=>({...f,project:r.project||f.project,issueType:r.issueType||f.issueType,priority:r.priority||f.priority,description:f.description||r.enhancedDescription||f.description}));setAuto(a=>({...a,project:true,issueType:true,priority:true}));}
      setAnalyzing(false);},800);
  },[form.summary,form.description]);

  useEffect(()=>{
    clearTimeout(sRef.current);if(form.summary.length<8){setSimilar([]);return;}
    sRef.current=setTimeout(async()=>{setSimLoading(true);const r=await fastJQLSearch(form.summary,form.description,form.project||null);setSimilar(r);setSimLoading(false);},600);
  },[form.summary,form.description,form.project]);

  const buildDesc=()=>{
    let d=form.description;
    d+=`\n\n---\n**Brand / MID Details**\n- Brand Name: ${form.midBrandName}`;
    if(brandFetched?.mid)d+=`\n- MID: ${brandFetched.mid}`;
    if(form.midBrandUrl)d+=`\n- Brand URL: ${form.midBrandUrl}`;
    if(aiSug?.severity)d+=`\n\n**Severity:** ${aiSug.severity}`;
    if(form.reporterName)d+=`\n\n**Reported By:** ${form.reporterName}`;
    if(form.reporterEmail)d+=` (${form.reporterEmail})`;
    return d;
  };

  const handleCreate=async()=>{setCreating(true);setError("");try{const r=await createJiraTicket({...form,description:buildDesc()});if(r?.key){setCreated(r);setStep(3);}else setError("Ticket creation failed. Please try again.");}catch(e){setError("Error: "+e.message);}setCreating(false);};
  const reset=()=>{setStep(0);setForm({project:"",issueType:"Bug",summary:"",description:"",priority:"Medium",midBrandName:"",midBrandUrl:"",reporterName:"",reporterEmail:""});setAuto({project:false,issueType:false,priority:false,brandUrl:false,email:false});setSimilar([]);setCreated(null);setError("");setAiSug(null);setBrandFetched(null);setCloneTarget(null);};

  const activeSev=SEVERITIES.find(sv=>sv.key===form.priority)||SEVERITIES[2];
  const confColor=c=>c>=80?GK.success:c>=60?GK.warn:"#EF4444";
  const canNext0=form.project&&form.summary&&form.description;
  const canNext1=form.midBrandName;

  const inp={width:"100%",background:GK.inputBg,border:`1.5px solid ${GK.border}`,borderRadius:8,padding:"10px 13px",color:GK.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  const sel=(hi)=>({...inp,border:`1.5px solid ${hi?"#93C5FD":GK.border}`,background:hi?"#F0F7FF":GK.inputBg});
  const lbl={fontSize:11,fontWeight:700,color:GK.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:5};
  const field={marginBottom:16};
  const btn=(v)=>({padding:"10px 22px",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",border:"none",
    background:v==="primary"?`linear-gradient(135deg,${GK.navy} 0%,${GK.navyLight} 100%)`:
               v==="gold"?`linear-gradient(135deg,${GK.goldDark},${GK.gold})`:
               v==="ghost"?"transparent":"#fff",
    color:v==="ghost"?GK.textMuted:"#fff",
    boxShadow:v==="primary"?"0 4px 14px rgba(10,36,99,0.25)":v==="gold"?"0 4px 14px rgba(245,166,35,0.35)":"none"});
  const ab={fontSize:10,background:"#E8F5E9",color:GK.success,border:"1px solid #A5D6A7",borderRadius:20,padding:"1px 8px",fontWeight:700,marginLeft:6};
  const stepLabels=["1. Describe","2. Brand / MID","3. Review","✓ Done"];

  return(
    <div style={{fontFamily:"'Inter','Segoe UI',Arial,sans-serif",background:GK.bg,minHeight:"100vh",padding:"20px 12px"}}>
      {cloneTarget&&<CloneModal ticket={cloneTarget} proj={form.project} onClose={()=>setCloneTarget(null)} onCloned={()=>{setTimeout(()=>setCloneTarget(null),3000);}}/>}

      <div style={{maxWidth:700,margin:"0 auto"}}>

        {/* Header */}
        <div style={{background:`linear-gradient(135deg,${GK.navyDark} 0%,${GK.navy} 60%,${GK.navyLight} 100%)`,borderRadius:"16px 16px 0 0",padding:"22px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{marginBottom:10}}>
              <div style={{background:"white",borderRadius:10,padding:"6px 14px",display:"inline-flex",alignItems:"center"}}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/GoKwik_logo.svg/2560px-GoKwik_logo.svg.png"
                  alt="GoKwik"
                  style={{height:32,objectFit:"contain"}}
                  onError={function(e){e.target.style.display="none";e.target.nextSibling.style.display="flex";}}
                />
                <span style={{display:"none",fontFamily:"'Arial Black',Arial,sans-serif",fontWeight:900,fontSize:22,color:"#0A2463",letterSpacing:"-0.5px"}}>GoKwik</span>
              </div>
            </div>
            <div style={{color:"rgba(255,255,255,0.95)",fontSize:18,fontWeight:800,letterSpacing:"-0.3px"}}>JIRA Ticket Agent</div>
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginTop:3}}>AI-powered · Smart routing · Duplicate detection · Clone support</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{background:"rgba(245,166,35,0.15)",border:"1px solid rgba(245,166,35,0.4)",borderRadius:10,padding:"8px 14px"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:2}}>WORKSPACE</div>
              <div style={{fontSize:13,fontWeight:700,color:GK.gold}}>gokwik.atlassian.net</div>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div style={{background:"#fff",display:"flex",borderBottom:`2px solid ${GK.bg}`}}>
          {stepLabels.map((l,i)=>(
            <div key={i} style={{flex:1,padding:"12px 6px",textAlign:"center",fontSize:11,fontWeight:700,
              background:step===i?`linear-gradient(180deg,#EEF4FF,#fff)`:step>i?"#F8FFF8":"#fff",
              color:step>i?GK.success:step===i?GK.navy:GK.textLight,
              borderBottom:step===i?`3px solid ${GK.navy}`:step>i?`3px solid ${GK.success}`:"3px solid transparent",
              transition:"all .2s"}}>
              {step>i&&i<3?"✓ ":""}{l}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{background:GK.cardBg,borderRadius:"0 0 16px 16px",padding:"24px 28px",boxShadow:"0 8px 30px rgba(10,36,99,0.08)"}}>

          {/* STEP 0 */}
          {step===0&&<>
            <div style={field}>
              <label style={lbl}>Describe your issue *</label>
              <input style={inp} placeholder="e.g. Abandoned cart data not reflecting on Shopify for IKari Homes…"
                value={form.summary} onChange={e=>upd("summary",e.target.value)}/>
            </div>

            <div style={field}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <label style={{...lbl,margin:0}}>Detailed Description</label>
                {aiSug?.enhancedDescription&&<button onClick={()=>upd("description",aiSug.enhancedDescription)}
                  style={{background:`${GK.navy}12`,border:`1px solid ${GK.navy}30`,borderRadius:6,padding:"3px 10px",color:GK.navy,fontSize:11,cursor:"pointer",fontWeight:700}}>✨ AI version</button>}
              </div>
              <textarea style={{...inp,resize:"vertical",minHeight:90,lineHeight:1.6}} rows={4}
                placeholder="Steps to reproduce, error messages, impacted merchants, MID details…"
                value={form.description} onChange={e=>upd("description",e.target.value)}/>
            </div>

            {(analyzing||aiSug)&&(
              <div style={{background:`linear-gradient(135deg,${GK.navy}08,${GK.navy}04)`,border:`1.5px solid ${GK.navy}20`,borderRadius:12,padding:16,marginBottom:18}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:analyzing?0:12}}>
                  <span style={{fontSize:13,fontWeight:800,color:GK.navy}}>🤖 AI Project Analysis</span>
                  {analyzing&&<span style={{fontSize:12,color:GK.textMuted}}>Analysing summary & description…</span>}
                  {!analyzing&&<span style={{fontSize:11,color:GK.success,fontWeight:700}}>✦ Auto-applied</span>}
                </div>
                {!analyzing&&aiSug&&<>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                    {[{v:`📁 ${aiSug.project} – ${PROJECTS.find(p=>p.key===aiSug.project)?.name||""}`,c:GK.navy},
                      {v:`🏷️ ${aiSug.issueType}`,c:"#7C3AED"},
                      {v:`${activeSev.icon} ${aiSug.severity||aiSug.priority}`,c:activeSev.color}]
                      .map(({v,c},i)=><span key={i} style={{background:c+"15",color:c,border:`1px solid ${c}30`,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:700}}>{v}</span>)}
                  </div>
                  <div style={{fontSize:12,color:GK.textMuted,marginBottom:10,lineHeight:1.5}}>{aiSug.reason}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,color:GK.textLight,fontWeight:600}}>Confidence</span>
                    <div style={{flex:1,height:5,background:GK.border,borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:(aiSug.confidence||0)+"%",background:confColor(aiSug.confidence),borderRadius:3,transition:"width .6s"}}/>
                    </div>
                    <span style={{fontSize:12,fontWeight:800,color:confColor(aiSug.confidence)}}>{aiSug.confidence}%</span>
                  </div>
                </>}
              </div>
            )}

            {(simLoading||similar.length>0)&&(
              <div style={{background:"#FFFBEB",border:`1.5px solid #FDE68A`,borderRadius:12,padding:16,marginBottom:18}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:simLoading?0:10}}>
                  <span style={{fontSize:13,fontWeight:800,color:"#92400E"}}>
                    {simLoading?"🔍 Searching existing tickets…":`⚠️ ${similar.length} similar ticket(s) found`}
                  </span>
                  {!simLoading&&similar.length>0&&<span style={{fontSize:10,color:"#92400E",opacity:0.7}}>Click to view · 🔁 to clone</span>}
                </div>
                {simLoading&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[1,2,3].map(i=><div key={i} style={{height:52,background:"#FEF3C7",borderRadius:8,opacity:0.5}}/>)}
                </div>}
                {!simLoading&&similar.map((t,i)=>{
                  const sc=statusColor(t.status);
                  return(
                    <div key={i} style={{background:"#fff",border:`1.5px solid ${GK.border}`,borderRadius:10,padding:"10px 12px",marginBottom:i<similar.length-1?8:0,display:"flex",alignItems:"center",gap:8,boxShadow:"0 1px 4px rgba(10,36,99,0.06)"}}>
                      <a href={`${JIRA_BASE}/browse/${t.key}`} target="_blank" rel="noreferrer" style={{flex:1,textDecoration:"none",minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                          <span style={{background:`${GK.navy}15`,color:GK.navy,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:800,whiteSpace:"nowrap"}}>{t.key}</span>
                          <span style={{fontSize:13}}>{typeIcon(t.issueType)}</span>
                          <span style={{fontSize:13,color:GK.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.summary}</span>
                        </div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          <span style={{background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,borderRadius:20,padding:"1px 8px",fontSize:11,fontWeight:600}}>{t.status||"—"}</span>
                          {t.priority&&<span style={{fontSize:11,color:GK.textMuted}}>{priIcon(t.priority)} {t.priority}</span>}
                          {t.project&&<span style={{fontSize:11,color:GK.textLight}}>📁 {t.project}</span>}
                          {t.assignee&&t.assignee!=="Unassigned"&&<span style={{fontSize:11,color:GK.textLight}}>👤 {t.assignee}</span>}
                        </div>
                      </a>
                      <button onClick={()=>setCloneTarget(t)}
                        style={{background:`${GK.gold}15`,border:`1.5px solid ${GK.gold}50`,borderRadius:8,padding:"7px 10px",color:GK.goldDark,fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                        🔁 Clone
                      </button>
                    </div>
                  );
                })}
                {!simLoading&&similar.length>0&&(
                  <div style={{marginTop:10,padding:"8px 12px",background:`${GK.navy}08`,border:`1px solid ${GK.navy}15`,borderRadius:8,fontSize:12,color:GK.navy}}>
                    💡 Same issue for a different merchant? Click <strong>🔁 Clone</strong> to copy the ticket with new merchant details.
                  </div>
                )}
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={field}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <label style={{...lbl,margin:0}}>Project *</label>
                  {auto.project&&<span style={ab}>✦ AUTO</span>}
                </div>
                <select style={sel(auto.project)} value={form.project} onChange={e=>{upd("project",e.target.value);setAuto(a=>({...a,project:false}));}}>
                  <option value="">Select project…</option>
                  {PROJECTS.map(p=><option key={p.key} value={p.key}>{p.key} – {p.name}</option>)}
                </select>
              </div>
              <div style={field}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <label style={{...lbl,margin:0}}>Issue Type</label>
                  {auto.issueType&&<span style={ab}>✦ AUTO</span>}
                </div>
                <select style={sel(auto.issueType)} value={form.issueType} onChange={e=>{upd("issueType",e.target.value);setAuto(a=>({...a,issueType:false}));}}>
                  {ISSUE_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={field}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <label style={{...lbl,margin:0}}>Severity / Priority</label>
                {auto.priority&&<span style={ab}>✦ AUTO</span>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {SEVERITIES.map(sv=>{
                  const ac=form.priority===sv.key;
                  return(<button key={sv.key} onClick={()=>{upd("priority",sv.key);setAuto(a=>({...a,priority:false}));}}
                    style={{padding:"10px 6px",borderRadius:10,border:`2px solid ${ac?sv.color:GK.border}`,background:ac?sv.color+"12":"#fff",cursor:"pointer",textAlign:"center",boxShadow:ac?`0 2px 8px ${sv.color}30`:"none",transition:"all .15s"}}>
                    <div style={{fontSize:16,marginBottom:2}}>{sv.icon}</div>
                    <div style={{fontSize:12,fontWeight:800,color:ac?sv.color:GK.textMuted}}>{sv.label}</div>
                    <div style={{fontSize:10,fontWeight:600,color:ac?sv.color:GK.textLight,marginBottom:2}}>{sv.title}</div>
                    <div style={{fontSize:9,color:ac?sv.color+"cc":GK.textLight,lineHeight:1.4}}>{sv.criteria}</div>
                  </button>);
                })}
              </div>
              <div style={{marginTop:10,background:activeSev.color+"0D",border:`1px solid ${activeSev.color}30`,borderRadius:8,padding:"8px 12px",display:"flex",gap:8}}>
                <span style={{fontSize:16}}>{activeSev.icon}</span>
                <div><span style={{fontSize:12,fontWeight:700,color:activeSev.color}}>{activeSev.label} – {activeSev.title}: </span>
                <span style={{fontSize:12,color:GK.textMuted}}>{activeSev.criteria}</span></div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div/>
              <div style={field}>
                <label style={lbl}>Your Name</label>
                <input style={inp} placeholder="First Last" value={form.reporterName} onChange={e=>upd("reporterName",e.target.value)}/>
              </div>
            </div>

            <div style={{display:"flex",justifyContent:"flex-end",marginTop:4}}>
              <button style={btn("primary")} disabled={!canNext0} onClick={()=>setStep(1)}>
                Next: Brand / MID →
              </button>
            </div>
          </>}

          {/* STEP 1 */}
          {step===1&&<>
            <div style={{background:`${GK.navy}08`,border:`1px solid ${GK.navy}20`,borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13,color:GK.navy,fontWeight:500}}>
              📌 Brand info auto-filled from name & Jira history. Click ✏️ to edit any field.
            </div>
            <div style={field}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <label style={{...lbl,margin:0}}>Brand / Merchant Name *</label>
                {brandFetching&&<span style={{fontSize:11,color:GK.textMuted}}>🔍 Looking up in Jira…</span>}
                {brandFetched&&!brandFetching&&<span style={{fontSize:10,background:"#E8F5E9",color:GK.success,border:"1px solid #A5D6A7",borderRadius:20,padding:"1px 8px",fontWeight:700}}>✦ FOUND IN JIRA</span>}
              </div>
              <input style={inp} placeholder="e.g. Myntra, Nykaa, Noise…" value={form.midBrandName} onChange={e=>upd("midBrandName",e.target.value)}/>
              {brandFetched?.mid&&(
                <div style={{marginTop:8,background:"#F0FFF4",border:"1px solid #A5D6A7",borderRadius:8,padding:"8px 14px",fontSize:13,display:"flex",gap:12,flexWrap:"wrap"}}>
                  <span style={{color:GK.textMuted}}>MID:</span>
                  <span style={{color:GK.success,fontWeight:800,fontFamily:"monospace"}}>{brandFetched.mid}</span>
                  {brandFetched.brandUrl&&<><span style={{color:GK.textMuted}}>URL:</span><span style={{color:"#2563EB",fontSize:12}}>{brandFetched.brandUrl}</span></>}
                </div>
              )}
            </div>
            <AutoField label="Brand URL / MID URL" value={form.midBrandUrl} auto={auto.brandUrl} placeholder="Auto-filled from name…" onEdit={v=>{upd("midBrandUrl",v);setAuto(a=>({...a,brandUrl:false}));}}/>
            <AutoField label="Reporter Email" value={form.reporterEmail} auto={auto.email} type="email" placeholder="Auto-filled from your name…" onEdit={v=>{upd("reporterEmail",v);setAuto(a=>({...a,email:false}));}}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
              <button style={btn("ghost")} onClick={()=>setStep(0)}>← Back</button>
              <button style={btn("primary")} disabled={!canNext1} onClick={()=>setStep(2)}>Review →</button>
            </div>
          </>}

          {/* STEP 2 */}
          {step===2&&<>
            <div style={{fontSize:15,fontWeight:800,color:GK.navy,marginBottom:16}}>Review Before Submitting</div>
            {[
              ["Project",`${PROJECTS.find(p=>p.key===form.project)?.name||""} (${form.project})`,auto.project],
              ["Issue Type",form.issueType,auto.issueType],
              ["Severity",`${activeSev.label} – ${activeSev.title} (${form.priority})`,auto.priority],
              ["Summary",form.summary,false],
              ["Brand / MID",`${form.midBrandName}${brandFetched?.mid?" · MID: "+brandFetched.mid:""}`,false],
              ["Brand URL",form.midBrandUrl||"—",auto.brandUrl],
              ["Reporter Email",form.reporterEmail||"—",auto.email],
            ].map(([k,v,a])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:`1px solid ${GK.border}`,fontSize:14}}>
                <span style={{color:GK.textMuted,fontWeight:600}}>{k}{a&&<span style={ab}>✦ AUTO</span>}</span>
                <span style={{color:GK.text,fontWeight:600,textAlign:"right",maxWidth:"60%",wordBreak:"break-word"}}>{v}</span>
              </div>
            ))}
            <div style={{marginTop:16}}>
              <div style={{color:GK.textMuted,fontWeight:600,fontSize:13,marginBottom:8}}>Description Preview</div>
              <div style={{background:GK.inputBg,border:`1.5px solid ${GK.border}`,borderRadius:8,padding:"12px 14px",fontSize:13,color:GK.textMuted,lineHeight:1.6,whiteSpace:"pre-wrap",maxHeight:150,overflow:"auto"}}>{buildDesc()}</div>
            </div>
            {error&&<div style={{background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:8,padding:"10px 14px",color:"#991B1B",fontSize:13,marginTop:16}}>{error}</div>}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
              <button style={btn("ghost")} onClick={()=>setStep(1)}>← Back</button>
              <button style={btn("primary")} onClick={handleCreate} disabled={creating}>
                {creating?"⏳ Creating…":"🚀 Create Ticket"}
              </button>
            </div>
          </>}

          {/* STEP 3 */}
          {step===3&&created&&(
            <div style={{textAlign:"center",padding:"24px 0"}}>
              <div style={{width:72,height:72,background:`linear-gradient(135deg,${GK.success},#34D399)`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:30,boxShadow:`0 8px 24px ${GK.success}40`}}>✓</div>
              <div style={{fontSize:20,fontWeight:800,color:GK.success,marginBottom:8}}>Ticket Created Successfully!</div>
              <div style={{fontSize:30,fontWeight:900,color:GK.navy,marginBottom:4}}>{created.key}</div>
              <div style={{fontSize:13,color:GK.textMuted,marginBottom:8}}>{form.summary}</div>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:activeSev.color+"12",border:`1.5px solid ${activeSev.color}30`,borderRadius:20,padding:"4px 14px",marginBottom:24}}>
                <span>{activeSev.icon}</span><span style={{fontSize:12,fontWeight:700,color:activeSev.color}}>{activeSev.label} – {activeSev.title}</span>
              </div>
              <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
                <a href={created.url||`${JIRA_BASE}/browse/${created.key}`} target="_blank" rel="noreferrer">
                  <button style={btn("primary")}>🔗 Open in JIRA</button>
                </a>
                <button style={{...btn("ghost"),border:`1.5px solid ${GK.border}`,color:GK.text}} onClick={reset}>+ New Ticket</button>
              </div>
              {similar.length>0&&(
                <div style={{background:GK.inputBg,border:`1.5px solid ${GK.border}`,borderRadius:12,padding:16,marginTop:24,textAlign:"left"}}>
                  <div style={{fontSize:12,fontWeight:700,color:GK.textMuted,marginBottom:10}}>Related tickets — clone for another merchant:</div>
                  {similar.map((t,i)=>{const sc=statusColor(t.status);return(
                    <div key={i} style={{background:"#fff",border:`1px solid ${GK.border}`,borderRadius:8,padding:"8px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
                      <a href={`${JIRA_BASE}/browse/${t.key}`} target="_blank" rel="noreferrer" style={{textDecoration:"none",flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{background:`${GK.navy}15`,color:GK.navy,borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:800}}>{t.key}</span>
                          <span style={{fontSize:13,color:GK.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.summary}</span>
                        </div>
                        <span style={{background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,borderRadius:20,padding:"1px 8px",fontSize:10,fontWeight:600,marginTop:4,display:"inline-block"}}>{t.status}</span>
                      </a>
                      <button onClick={()=>setCloneTarget(t)} style={{background:`${GK.gold}15`,border:`1.5px solid ${GK.gold}50`,borderRadius:8,padding:"6px 10px",color:GK.goldDark,fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>🔁 Clone</button>
                    </div>);
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{textAlign:"center",marginTop:12,fontSize:11,color:GK.textLight,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <svg width="18" height="18" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="22" height="22" rx="6" fill="#F5A623"/>
            <rect x="2" y="28" width="22" height="22" rx="6" fill="#F5A623"/>
            <rect x="12" y="5" width="28" height="44" rx="8" fill="#0A2463"/>
            <polyline points="18,20 26,29 18,38" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="26,20 34,29 26,38" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          GoKwik JIRA Agent · Powered by Claude AI
        </div>
      </div>
    </div>
  );
}
