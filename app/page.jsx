"use client";
import {useEffect,useState} from "react";
import {createClient} from "@supabase/supabase-js";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase=url&&key?createClient(url,key):null;
export default function Home(){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true),[releases,setReleases]=useState([]),[error,setError]=useState("");
 const [role,setRole]=useState(null),[discoveries,setDiscoveries]=useState([]),[filter,setFilter]=useState("all");
 useEffect(()=>{
  if(!supabase){setLoading(false);return;}
  supabase.auth.getUser().then(({data,error})=>{if(error && error.name!=="AuthSessionMissingError" && error.message!=="Auth session missing!")setError(error.message);setUser(data?.user||null);setLoading(false)});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{setUser(session?.user||null);setLoading(false)});
  return ()=>subscription.unsubscribe();
 },[]);
 useEffect(()=>{
  if(!supabase||!user){setReleases([]);setRole(null);setDiscoveries([]);return;}
  supabase.from("staff_roles").select("role").eq("user_id",user.id).maybeSingle().then(({data})=>setRole(data?.role||null));
  supabase.from("milestones").select("id,kind,starts_on,ends_on,notes,evidence_url,products(name,game,publisher)").not("approved_proposal_id","is",null).order("starts_on",{ascending:true}).limit(100).then(({data,error})=>{if(error)setError(error.message);else setReleases(data||[])});
 },[user]);
 useEffect(()=>{if(!supabase||role!=="owner")return;supabase.from("proposals").select("id,proposed_product,proposed_milestones,evidence_url,evidence_excerpt,change_reason,status,discovered_at").order("discovered_at",{ascending:false}).limit(250).then(({data,error})=>{if(error)setError(error.message);else setDiscoveries(data||[])})},[role]);
 async function signIn(){setError("");if(!supabase)return;const {error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin}});if(error)setError(error.message)}
 async function signOut(){await supabase?.auth.signOut();setReleases([])}
 return <main className="app-shell">
  <header className="brand-header"><div className="brand-mark">✦</div><div><p className="brand-eyebrow">COSMIC HEARTH GAMES</p><h1>Release Command Center</h1><p className="brand-motto">Gather. Play. Unwind.</p></div></header>
  {!supabase?<section style={panel}><h2>Connection setup needed</h2><p>Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to Vercel environment variables and redeploy.</p></section>
  :loading?<p>Checking your sign-in…</p>
  :!user?<section style={panel}><h2>Staff sign-in</h2><p>Sign in with your authorized Cosmic Hearth Google account to view approved release dates.</p><button onClick={signIn}>Continue with Google</button></section>
  :<><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><p>Signed in as <strong>{user.email}</strong></p><button onClick={signOut}>Sign out</button></div>
   {role==="owner"&&<section style={panel}><div className="section-heading" style={{marginTop:0}}><span className="section-icon">✦</span><h2>Owner discovery inbox</h2></div><p>Publisher and distributor discoveries are private and unapproved until reviewed. Dates here are not automatically cleared for staff or customers.</p><div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}><strong>{discoveries.filter(d=>d.status==="pending").length} pending discoveries</strong><select aria-label="Filter discoveries" value={filter} onChange={e=>setFilter(e.target.value)} style={{background:"#19191c",color:"#f6efe3",border:"1px solid #756044",padding:9,borderRadius:8}}><option value="all">All categories</option>{[...new Set(discoveries.map(d=>d.proposed_product?.category).filter(Boolean))].sort().map(x=><option key={x} value={x}>{x}</option>)}</select></div>{discoveries.filter(d=>filter==="all"||d.proposed_product?.category===filter).map(d=><article key={d.id} style={{borderTop:"1px solid #594633",padding:"18px 0"}}><div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}><strong>{d.proposed_product?.name||"Unnamed discovery"}</strong><small style={{color:"#efb948"}}>{d.status.toUpperCase()}</small></div><p style={{margin:"6px 0",color:"#c5b9a8"}}>{d.proposed_product?.game} · {d.proposed_product?.category} · {d.proposed_product?.publisher}</p>{(d.proposed_milestones||[]).map((m,i)=><p key={i} style={{margin:"5px 0"}}><b>{(m.kind||"milestone").replaceAll("_"," ")}:</b> {m.date_precision==="month"?String(m.starts_on).slice(0,7):m.starts_on||"TBD"} {m.notes&&<span style={{color:"#d2b6a2"}}>— {m.notes}</span>}</p>)}<p style={{fontSize:13,color:"#c5b9a8"}}>{d.evidence_excerpt}</p><a href={d.evidence_url} target="_blank" rel="noreferrer">Review original evidence ↗</a></article>)}{discoveries.length===0&&<p>No discoveries imported yet.</p>}<p style={{fontSize:13,color:"#c5b9a8"}}>Approval actions are being developed; all imported candidates remain private and pending.</p></section>}
   <div className="section-heading"><span className="section-icon">✧</span><h2>Approved release calendar</h2></div><p style={{color:"#cbd5e1"}}>Only approved milestones appear here. Prerelease and street dates are displayed separately. Dates do not by themselves authorize early sales.</p>
   {releases.length===0?<section style={panel}><p>No approved releases yet.</p><p>New announcements will appear after evidence review and approval. The approval workflow is not enabled yet.</p></section>:releases.map(r=><section key={r.id} style={panel}><small style={{color:"#fbbf24"}}>{r.products?.game} · {r.products?.publisher}</small><h3>{r.products?.name}</h3><p><strong>{r.kind.replaceAll("_"," ")}</strong>: {r.starts_on||"Date pending"}</p>{r.notes&&<p>{r.notes}</p>}<a href={r.evidence_url} target="_blank" rel="noreferrer" style={{color:"#fbbf24"}}>Official source</a></section>)}
   <p style={{color:"#94a3b8"}}>Release approvals and management tools are coming soon.</p>
  </>}
  {error&&<p role="alert" style={{color:"#fca5a5"}}>{error}</p>}
  
 </main>
}
const panel={background:"linear-gradient(145deg,#262322,#1d1c1d)",border:"1px solid #534438",borderRadius:16,padding:24,marginBottom:20};
