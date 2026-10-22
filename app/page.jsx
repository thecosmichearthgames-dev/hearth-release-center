"use client";
import {useState} from "react";
const initial=[
{id:1,game:"Magic: The Gathering",product:"Star Trek",milestones:[["Prerelease","2026-11-06"],["General release","2026-11-13"]],source:"Illustrative record — verify with publisher",status:"pending"},
{id:2,game:"Warhammer",product:"Example future miniature release",milestones:[],source:"Demonstration only — not a real announcement",status:"pending"}
];
export default function Home(){
const [items,setItems]=useState(initial),[tab,setTab]=useState("queue"),[role,setRole]=useState("staff");
const update=(id,status)=>setItems(v=>v.map(x=>x.id===id?{...x,status}:x));
const visible=items.filter(x=>tab==="queue"?x.status==="pending":x.status==="approved");
return <main style={{maxWidth:980,margin:"auto",padding:24}}>
<p style={{color:"#fbbf24",letterSpacing:2}}>COSMIC HEARTH GAMES</p><h1>Release Command Center</h1>
<p style={{color:"#cbd5e1"}}>Prototype • No live publisher discovery or authenticated approvals connected yet</p>
<div style={{display:"flex",gap:12,flexWrap:"wrap",margin:"24px 0"}}>
<button onClick={()=>setTab("queue")}>Review queue ({items.filter(x=>x.status==="pending").length})</button>
<button onClick={()=>setTab("calendar")}>Staff release list</button>
<label>Preview role <select value={role} onChange={e=>setRole(e.target.value)}><option value="staff">Staff</option><option value="manager">Manager (demo only)</option></select></label></div>
{visible.length===0?<p>No records in this view.</p>:visible.map(x=><section key={x.id} style={{background:"#1f2937",border:"1px solid #475569",borderRadius:12,padding:20,marginBottom:14}}>
<small style={{color:"#fbbf24"}}>{x.game}</small><h2>{x.product}</h2>
{x.milestones.length?x.milestones.map(([label,date])=><p key={label}>{label}: <strong>{date}</strong></p>):<p>No verified dates</p>}
<p style={{color:"#cbd5e1"}}>Source: {x.source}</p>
{tab==="queue"&&role==="manager"&&<div style={{display:"flex",gap:10}}><button onClick={()=>update(x.id,"approved")}>Approve in demo</button><button onClick={()=>update(x.id,"rejected")}>Reject in demo</button></div>}
</section>)}
<style jsx>{`button,select{background:#fbbf24;color:#111827;border:0;border-radius:7px;padding:11px 15px;font-weight:700;cursor:pointer}label{display:flex;align-items:center;gap:8px}button:focus-visible,select:focus-visible{outline:3px solid white}`}</style>
<footer style={{marginTop:32,color:"#94a3b8"}}>Demo data only. Approvals reset on refresh. Do not use this prototype as a sales authorization source.</footer>
</main>}
