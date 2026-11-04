/* eCARE-PD timeline — story slides, stage overview, prototypes, taxonomy.
   No external libraries. Data: <script id="ecp-data"> (from data/ecarepd_timeline.json). */
(function(){
"use strict";
const ROOT = document.querySelector(".ecp");
if(!ROOT) return;
const DATA = JSON.parse(document.getElementById("ecp-data").textContent);
const CONFIG = {
  imageBase: (ROOT.dataset.imageBase || "/img/ecarepdtimeline/").replace(/\/?$/, "/"),
  // prototype screenshots live in static/img/prototypes/ (override with data-proto-base on .ecp)
  protoBase: (ROOT.dataset.protoBase || "/img/prototypes/").replace(/\/?$/, "/"),
  // figures of the Integrated_Care sheet live in static/img/integrated-care/
  careBase: (ROOT.dataset.careBase || "/img/integrated-care/").replace(/\/?$/, "/"),
  images: {
    riggare: ROOT.dataset.imgRiggare || "biggareselfcare.png",
    patient: ROOT.dataset.imgPatient || "patient-blurred.jpg",
    neurologist: ROOT.dataset.imgNeurologist || "neurologist-blurred.jpg",
    patient2: ROOT.dataset.imgPatient2 || "patient-blurred_2.png"
  }
};
const $ = s => ROOT.querySelector(s);
const $$ = s => Array.from(ROOT.querySelectorAll(s));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- dates ---------- */
function parts(s){ const m = String(s ?? "").trim().match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/); if(!m) return null; return {y:+m[1], m: m[2]?+m[2]-1:null, d: m[3]?+m[3]:null}; }
function dStart(s){ const p=parts(s); if(!p) return null; return new Date(p.y, p.m??0, p.d??1); }
function dMid(s){ const p=parts(s); if(!p) return null; return new Date(p.y, p.m??6, p.d??(p.m!=null?15:1)); }
function fmt(s){ const p=parts(s); if(!p) return ""; if(p.d!=null) return `${p.d} ${MONTHS[p.m]} ${p.y}`; if(p.m!=null) return `${MONTHS[p.m]} ${p.y}`; return String(p.y); }
function fmtRange(a,b){ if(!b || String(a)===String(b)) return fmt(a); return `${fmt(a)} – ${fmt(b)}`; }
function years(a,b){ const ya = parts(a)?.y, yb = parts(b)?.y; if(!ya) return ""; return (!yb || ya===yb) ? String(ya) : `${ya}–${yb}`; }
const perY = p => { const s = String(p ?? ""); return /^\d{4}-\d{2}/.test(s) ? s.slice(0,4) : s; };
const money = n => n==null ? "—" : new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD",maximumFractionDigits:0}).format(n);
const moneyShort = n => n>=1e6 ? `$${(n/1e6).toFixed(2).replace(/\.?0+$/,"")}M` : `$${Math.round(n/1e3)}k`;
const isPlaceholder = s => /placeholder|to complete|to confirm/i.test(String(s??""));
function splitList(s){ const out=[]; let depth=0, cur=""; for(const ch of String(s||"")){ if(ch==="("||ch==="[") depth++; if(ch===")"||ch==="]") depth=Math.max(0,depth-1); if(ch===";" && depth===0){ out.push(cur.trim()); cur=""; } else cur+=ch; } out.push(cur.trim()); return out.filter(Boolean); }

/* ---------- categories (fixed colour order) ---------- */
const CATS = [
  {id:"quote",       label:"Patient quotes", short:"Quotes",       color:"var(--c-quote)", shape:"bubble"},
  {id:"publication", label:"Publications",   short:"Publications", color:"var(--c-pub)",   shape:"diamond"},
  {id:"talk",        label:"Talks",          short:"Talks",        color:"var(--c-talk)",  shape:"triangle"},
  {id:"funding",     label:"Funding",        short:"Funding",      color:"var(--c-fund)",  shape:"circle"},
  {id:"prototype",   label:"Prototypes",     short:"Prototypes",   color:"var(--c-proto)", shape:"bar"},
  {id:"taxonomy",    label:"Taxonomy",       short:"Taxonomy",     color:"var(--c-tax)",   shape:"square"},
  {id:"care",        label:"Integrated care", short:"Integrated care", color:"var(--c-care)", shape:"hexagon"},
];
const CAT = Object.fromEntries(CATS.map(c=>[c.id,c]));
CAT.stage = {id:"stage", label:"Stage", color:"var(--ink)", shape:"bar"};
CAT.summary = {id:"summary", label:"Summary", color:"var(--ink)", shape:"lines"};
function bubblePath(cx, cy, s){
  const w=s, h=s*.78, x=cx-w/2, y=cy-h/2-s*.08, r=s*.22;
  return `M${x+r},${y} h${w-2*r} a${r},${r} 0 0 1 ${r},${r} v${h-2*r} a${r},${r} 0 0 1 -${r},${r} h-${w*.42} l-${w*.2},${s*.24} v-${s*.24} h-${w*.38-r} a${r},${r} 0 0 1 -${r},-${r} v-${h-2*r} a${r},${r} 0 0 1 ${r},-${r} z`;
}
function swatch(cat, s=12){
  const c = CAT[cat].color, h=s/2; let shape;
  switch(CAT[cat].shape){
    case "circle":  shape=`<circle cx="${h}" cy="${h}" r="${h-1}" fill="${c}"/>`; break;
    case "diamond": shape=`<rect x="${s*.18}" y="${s*.18}" width="${s*.64}" height="${s*.64}" transform="rotate(45 ${h} ${h})" fill="${c}"/>`; break;
    case "bubble":  shape=`<path d="${bubblePath(h,h,s*.9)}" fill="${c}"/>`; break;
    case "triangle": shape=`<path d="M${h} 1 L${s-1} ${s-1} L1 ${s-1} Z" fill="${c}"/>`; break;
    case "lines":   shape=`<rect x="1" y="2" width="${s-2}" height="1.6" rx=".8" fill="${c}"/><rect x="1" y="${h-.8}" width="${s-2}" height="1.6" rx=".8" fill="${c}"/><rect x="1" y="${s-3.6}" width="${s*.6}" height="1.6" rx=".8" fill="${c}"/>`; break;
    case "hexagon": shape=`<path d="M${s*.27} 1.5 L${s*.73} 1.5 L${s-1} ${h} L${s*.73} ${s-1.5} L${s*.27} ${s-1.5} L1 ${h} Z" fill="${c}"/>`; break;
    case "square":  shape=`<rect x="1" y="1" width="${s-2}" height="${s-2}" rx="2" fill="${c}"/>`; break;
    default:        shape=`<rect x="0" y="${s*.2}" width="${s}" height="${s*.6}" rx="2" fill="${c}"/>`;
  }
  return `<svg class="sw" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" aria-hidden="true">${shape}</svg>`;
}

/* ---------- images ---------- */
const IMG_ICON = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>`;
function imgSlot(file, alt, label, base){
  return `<div class="imgph">${IMG_ICON}<span>${esc(label||"Image placeholder")}</span><code>${esc(file)}</code></div><img src="${esc((base||CONFIG.imageBase) + file)}" alt="${esc(alt)}" loading="lazy" onerror="this.remove()">`;
}
/* Prototypes.image_file may list several files separated by ";" — all are shown on the prototype card */
const protoFiles = p => { const a = splitList(p.image_file); return a.length ? a : [`${p.proto_id}.png`]; };
const protoFile = p => protoFiles(p)[0];
/* a name with a folder ("integrated-care/IC02.png") is read from static/img/<folder>/ instead of static/img/prototypes/ */
const imgRoot = CONFIG.protoBase.replace(/[^/]+\/$/, "");
const protoSrcBase = file => String(file).includes("/") ? imgRoot : CONFIG.protoBase;
const protoImg = (file, alt, label) => imgSlot(file, alt, label, protoSrcBase(file));
function protoGallery(p){
  const fs = protoFiles(p);
  return `<div class="protofigs${fs.length===1?" one":""}">${fs.map((f,i)=>{ const alt = `${p.name} — screenshot${fs.length>1?` ${i+1} of ${fs.length}`:""}`;
    return `<button type="button" class="protofig zoomable" data-zoom="${esc(p.proto_id)}:${i}" aria-label="Enlarge: ${esc(alt)}">${protoImg(f, alt, "Prototype image")}</button>`; }).join("")}</div>`;
}

/* ---------- lookups ---------- */
const OV = Object.fromEntries((DATA.overview||[]).map(o=>[o.stage_id,o]));
const STAGES = DATA.stages.slice().sort((a,b)=>a.order-b.order);
const STAGE = Object.fromEntries(STAGES.map(s=>[s.stage_id,s]));
const stageShort = s => (s.short_label.split(" · ")[1] || s.short_label);
const stageNo = s => s.short_label.includes(" · ") ? s.short_label.split(" · ")[0] : `Stage ${s.order}`;

/* ---------- items ---------- */
const items = [];
STAGES.forEach(s => items.push({id:s.stage_id, cat:"stage", stage:s.stage_id, d:s, label:stageShort(s), date:dStart(s.start_date)}));
DATA.quotes.forEach(q => items.push({id:q.quote_id, cat:"quote", stage:q.stage_id, d:q, label:q.theme || (q.quote.replace(/^P\d+:\s*/,"").split(/\s+/).slice(0,5).join(" ")+"…"), date:dStart(STAGE[q.stage_id].start_date)}));
DATA.publications.forEach(p => items.push({id:p.pub_id, cat:"publication", stage:p.stage_id, d:p, label:p.citation_short, date:dMid(p.pub_date||p.year)}));
(DATA.talks||[]).forEach(t => { if(!t.title || !STAGE[t.stage_id]) return; items.push({id:t.talk_id||("T"+items.length), cat:"talk", stage:t.stage_id, d:t, label:t.title, date:dStart(t.date)}); });
DATA.funding.forEach(f => { const amt = (OV[f.stage_id] && OV[f.stage_id].funding_cad) || f.total_amount || null;
  items.push({id:f.grant_id, cat:"funding", stage:f.stage_id, d:f, amount:amt, label:`${amt?moneyShort(amt):"—"} · ${f.funder}`, date:dStart(f.competition||f.start_year)}); });
/* prototypes keep the row order of the Prototypes sheet within a stage */
DATA.prototypes.forEach((p,i) => items.push({id:p.proto_id, cat:"prototype", stage:p.stage_id, d:p, ord:i, label:p.version ? `${p.version} · ${p.name}` : p.name, date:dStart(p.start_date)}));
const protoSorted = () => DATA.prototypes.map((p,i)=>({p,i})).filter(x=>STAGE[x.p.stage_id])
  .sort((a,b)=>STAGE[a.p.stage_id].order-STAGE[b.p.stage_id].order || a.i-b.i).map(x=>x.p);
/* the iCARE-PD chapters (Integrated_Care sheet) are no longer shown: the stage summary is the content,
   their articles are in Publications and their figures are Prototypes rows (PR17–PR19) */
DATA.taxonomy_versions.forEach(t => items.push({id:t.tax_id, cat:"taxonomy", stage:t.stage_id, d:t, label:`${t.tax_id.replace("TX","v")} · ${t.label.replace(/\s*\(.*\)$/,"")}`, date:dMid(t.period)}));
const ITEM = Object.fromEntries(items.map(i=>[i.id,i]));
const orderKey = it => STAGE[it.stage].order*1e13 + (it.date?+it.date:0);

/* ==================================================================
   VIEWS (tabs + hash)
   ================================================================== */
const VIEWS = ["story","timeline","prototypes","taxonomy"];
function showView(v, push){
  if(!VIEWS.includes(v)) v = "story";
  VIEWS.forEach(n => {
    $("#ecp-view-"+n).hidden = n!==v;
    const t = $("#ecp-tab-"+n); t.setAttribute("aria-selected", n===v); t.tabIndex = n===v ? 0 : -1;
  });
  if(push) history.replaceState(null, "", "#"+v);
  if(push){ const top = ROOT.getBoundingClientRect().top + scrollY - 12; if(scrollY > top) scrollTo({top, behavior: reduceMotion?"auto":"smooth"}); }
}
$$(".tabs [role=tab]").forEach((b,i,all) => {
  b.addEventListener("click", ()=>showView(b.dataset.view, true));
  b.addEventListener("keydown", ev => { let j=null; if(ev.key==="ArrowRight") j=(i+1)%all.length; if(ev.key==="ArrowLeft") j=(i-1+all.length)%all.length; if(j!=null){ ev.preventDefault(); all[j].focus(); showView(all[j].dataset.view, true); } });
});
$$("[data-goto]").forEach(b => b.addEventListener("click", ()=>showView(b.dataset.goto, true)));
window.addEventListener("hashchange", ()=>showView(location.hash.slice(1)));

/* ==================================================================
   STORY — 4 slides
   ================================================================== */
(function story(){
  // slide 1 numbers
  const tot = k => (DATA.overview||[]).reduce((s,o)=>s+(+o[k]||0),0);
  // co-authors (Co_Authors sheet, without the two project leads): "Prénom Nom", sorted by last name
  const CO = (DATA.co_authors||[]).filter(p=>p && (p.name || p.last_name))
    .map(p=>({name: p.name || [p.first_name, p.last_name].filter(Boolean).join(" "), key: p.sort_name || `${p.last_name} ${p.first_name||""}`}))
    .sort((a,b)=>String(a.key).localeCompare(String(b.key), "fr", {sensitivity:"base"}));
  const nCo = DATA.co_authors_count ?? CO.length;
  const g = [
    ["2017 – 2026", `3 linked projects, ${STAGES.length} stages of co-design iteration in a timeline`],
    [moneyShort(tot("funding_cad")), `in research funding (${DATA.funding.length} grants)`],
    [DATA.publications.length, "publications"],
    [(DATA.talks||[]).length, "talks, posters and workshops"],
    [DATA.prototypes.length, "prototype versions"],
    [DATA.taxonomy_versions.length, "versions of the taxonomy"],
  ];
  if(CO.length) g.push([nCo, "co-authors on papers and talks"]);
  // with an odd number of boxes, the first one spans the full width so the grid has no gap
  $("#ecp-glance").innerHTML = g.map(([n,l],i)=>`<div${i===0 && g.length%2 ? ' class="span"' : ""}><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join("");
  const ca = $("#ecp-coauthors");
  if(ca && CO.length){
    ca.insertAdjacentHTML("afterbegin", `<h3 id="ecp-coauthors-h">Co-authors <span class="n">${esc(nCo)}</span></h3>
      <p class="ca-note">Researchers who co-authored the project’s papers and talks with Tiago Mestre and Sylvie Grosjean, in alphabetical order of last name.</p>`);
    ca.insertAdjacentHTML("beforeend", `<ul class="ca-list">${CO.map(p=>`<li>${esc(p.name)}</li>`).join("")}</ul>`);
  } else if(ca) ca.removeAttribute("aria-labelledby");
  // slide 2 image
  $('[data-img="riggare"]').innerHTML = imgSlot(CONFIG.images.riggare, "Sara Riggare's illustration: about 1 hour a year with a neurologist versus 8,765 hours of self-care.", "Sara Riggare illustration");
  // slide 3 voices (Q044, Q041) and slide 4 voice (Q032) — quote_id values from the Quotes sheet
  const iq = id => (DATA.intro_quotes||[]).find(q=>q.quote_id===id);
  const voice = x => `<figure class="voice"><div class="ph">${imgSlot(x.img,x.alt,x.label)}</div>
    <div><blockquote>${esc(x.q ? x.q.quote : "")}</blockquote><figcaption><b>${esc(x.who)}</b> · ${esc(x.where)}</figcaption></div></figure>`;
  const v = [
    {img:CONFIG.images.patient, alt:"Blurred portrait of a person living with Parkinson's", label:"Blurred photo", q:iq("Q044"), who:"Person living with Parkinson’s", where:"usage diary study interview, eCARE-PD (2024)"},
    {img:CONFIG.images.neurologist, alt:"Blurred portrait of a neurologist", label:"Blurred photo", q:iq("Q041"), who:"Neurologist", where:"design-scenario workshop, iCARE-PD Canada (2021)"},
  ];
  $("#ecp-voices").innerHTML = v.filter(x=>x.q).map(voice).join("");
  const vr = $("#ecp-voice-rationale"), q4 = iq("Q032");
  if(vr && q4) vr.innerHTML = voice({img:CONFIG.images.patient2, alt:"Blurred portrait of a person living with Parkinson's", label:"Blurred photo", q:q4, who:"Person living with Parkinson’s", where:"design-scenario workshop, iCARE-PD Canada (2021)"});

  // deck mechanics
  const track = $("#ecp-track"), slides = $$(".slide"), deck = $("#ecp-deck");
  const names = ["The project","The problem","Self-tracking","Rationale"];
  $("#ecp-dots").innerHTML = slides.map((_,i)=>`<button type="button" data-i="${i}" aria-label="Slide ${i+1}: ${names[i]}"><i></i><span>${names[i]}</span></button>`).join("");
  let cur = 0;
  const last = slides.length-1, next = $("#ecp-next");
  const fit = () => { track.style.height = slides[cur].offsetHeight + "px"; };
  function go(i){
    cur = Math.max(0, Math.min(last, i));
    track.style.transform = `translateX(${-100*cur}%)`;
    fit();
    slides.forEach((s,j)=>{ s.setAttribute("aria-hidden", j!==cur); s.inert = j!==cur; });
    $$("#ecp-dots button").forEach((b,j)=>b.setAttribute("aria-current", j===cur));
    $("#ecp-prev").disabled = cur===0;
    const fin = cur===last;
    $("#ecp-next-long").textContent = fin ? "Explore the timeline" : `Next: ${names[cur+1]}`;
    $("#ecp-next-short").textContent = fin ? "Timeline" : "Next";
    next.setAttribute("aria-label", fin ? "Explore the timeline" : `Next slide: ${names[cur+1]}`);
    next.classList.toggle("final", fin);
    const sk = $("#ecp-skip"); if(sk) sk.hidden = fin;
    next.classList.remove("pulse"); void next.offsetWidth; next.classList.add("pulse");
  }
  const advance = () => cur===last ? showView("timeline", true) : go(cur+1);
  $("#ecp-prev").onclick = ()=>go(cur-1);
  next.onclick = advance;
  $$("#ecp-dots button").forEach(b=>b.onclick=()=>go(+b.dataset.i));
  document.addEventListener("keydown", ev => {
    if($("#ecp-view-story").hidden) return;
    if(ev.target.closest("input,textarea,select,[role=tab]")) return;
    if(ev.key==="ArrowRight"){ advance(); } else if(ev.key==="ArrowLeft"){ go(cur-1); }
  });
  let x0=null, y0=null;
  deck.addEventListener("pointerdown", ev => { if(ev.pointerType==="mouse") return; x0=ev.clientX; y0=ev.clientY; });
  deck.addEventListener("pointerup", ev => { if(x0==null) return; const dx=ev.clientX-x0, dy=ev.clientY-y0; if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)) (dx<0 ? advance() : go(cur-1)); x0=null; });
  go(0);
  window.addEventListener("resize", fit);
  new MutationObserver(()=>{ if(!$("#ecp-view-story").hidden) fit(); }).observe($("#ecp-view-story"), {attributes:true, attributeFilter:["hidden"]});
  ROOT.querySelectorAll(".slide img").forEach(im=>im.addEventListener("load", fit));
})();

/* ==================================================================
   TIMELINE — stage columns; clicking a stage opens it in place
   ================================================================== */
/* the three linked projects: colour + one-line meaning, shown on the "Project" row and on stage buttons */
const TRACKS = {
  "iCARE-PD":   {cls:"t-icare",  desc:"integrated care"},
  "eCARE-PD":   {cls:"t-ecare",  desc:""},
  "PD-TIPS.AI": {cls:"t-pdtips", desc:"AI care tips"},
};
const trk = name => TRACKS[name] || {cls:"", desc:""};
/* Project row, top to bottom: PD-TIPS.AI, then iCARE-PD and eCARE-PD below it */
const TRACK_ORDER = ["PD-TIPS.AI", "iCARE-PD", "eCARE-PD"];
const tracksOf = s => { const a = [s.main_track, ...splitList(s.other_tracks)].filter(Boolean);
  a.forEach(t => { if(!TRACK_ORDER.includes(t)) TRACK_ORDER.push(t); }); return a; };
const LANES = [
  {id:"summary",     label:"Summary"},
  {id:"quote"}, {id:"publication"}, {id:"talk"}, {id:"funding"}, {id:"prototype"}, {id:"taxonomy"},
].map(l => Object.assign({}, CAT[l.id] || {}, l));
const state = { visible: new Set(LANES.map(l=>l.id)), allMode: true, open: new Set() };   // open: any number of stages, side by side

/* Self-repair: if the layout file is older than this script, add the pieces it expects
   and drop the ones it no longer uses, instead of failing silently. */
(function ensureTimelineMarkup(){
  const view = $("#ecp-view-timeline"); if(!view) return;
  const wrap = $("#ecp-tgwrap");
  if(!$("#ecp-stagenav")){
    const bar = $(".tl-bar") || view;
    bar.insertAdjacentHTML("beforeend", `<div class="stagenav" id="ecp-stagenav" hidden><button type="button" id="ecp-sprev" aria-label="Previous stage">←</button><span id="ecp-sopen" aria-live="polite"></span><button type="button" id="ecp-snext" aria-label="Next stage">→</button><button type="button" id="ecp-sclose" class="close">Back to overview</button></div>`);
    console.warn("eCARE-PD timeline: layouts/_default/ecarepdtimeline.html is older than assets/js/ecarepd-timeline.js — please replace the layout file.");
  }
  if(!$("#ecp-sall")) $("#ecp-sclose").insertAdjacentHTML("beforebegin", `<button type="button" id="ecp-sall" class="close">Open all</button>`);
  ["#ecp-detail", ".refs", "#ecp-tip"].forEach(sel => { const el = $(sel); if(el) el.remove(); });
  const hint = view.querySelector(".tl-bar .hint"); if(hint) hint.textContent = "Click stages to open them side by side; click again to close. Click any picture to enlarge it.";
})();

function renderFilters(){
  const n = id => id==="summary" ? STAGES.length : items.filter(i=>i.cat===id).length;
  $("#ecp-filters").innerHTML = `<button type="button" class="chip all" aria-pressed="${state.allMode}">All</button>` +
    LANES.map(c=>`<button type="button" class="chip" data-cat="${c.id}" aria-pressed="${!state.allMode && state.visible.has(c.id)}">${swatch(c.id)}${esc(c.label)} <span class="n">${n(c.id)}</span></button>`).join("");
  $$("#ecp-filters .chip").forEach(b=>b.onclick=()=>toggleCat(b.dataset.cat || "all"));
}
function toggleCat(id){
  const all = LANES.map(l=>l.id);
  if(id==="all"){ state.allMode = true; state.visible = new Set(all); }
  else if(state.allMode){ state.allMode = false; state.visible = new Set([id]); }
  else { state.visible.has(id) ? state.visible.delete(id) : state.visible.add(id);
    if(!state.visible.size || state.visible.size===all.length){ state.allMode = true; state.visible = new Set(all); } }
  renderFilters(); renderGrid();
}
/* opts.keep: open without toggling closed; opts.only: close the others */
function openStage(sid, opts={}){
  if(opts.only) state.open = new Set([sid]);
  else if(state.open.has(sid) && !opts.keep) state.open.delete(sid);
  else state.open.add(sid);
  renderGrid();
  if(state.open.has(sid)){
    const wrap = $("#ecp-tgwrap"), head = $(`#ecp-grid .stg[data-stage="${sid}"]`);
    if(head){ const hr = head.getBoundingClientRect(), wr = wrap.getBoundingClientRect(), lab = innerWidth<600?84:132;
      if(hr.left < wr.left+lab || hr.right > wr.right) wrap.scrollBy({left: hr.left - wr.left - lab - 8, behavior: reduceMotion?"auto":"smooth"}); }
    if(opts.scroll){ const top = $("#ecp-tgwrap").getBoundingClientRect().top + scrollY - 70; scrollTo({top, behavior: reduceMotion?"auto":"smooth"}); }
    if(opts.focus){ const b = $(`#ecp-grid .stgbtn[data-stage="${sid}"]`); if(b) b.focus({preventScroll:true}); }
  }
}
/* arrows move one open stage along; with several open they do nothing */
function stepStage(dir){
  if(state.open.size>1) return;
  const i = STAGES.findIndex(s=>state.open.has(s.stage_id));
  const j = i<0 ? (dir>0?0:STAGES.length-1) : Math.max(0, Math.min(STAGES.length-1, i+dir));
  openStage(STAGES[j].stage_id, {only:true, focus:true});
}

/* content of one cell: compact (overview) or open (stage selected) */
function cellHTML(lane, s, open){
  const sid = s.stage_id;
  if(lane.id==="summary"){
    if(!open) return `<p class="sum clamp">${esc(s.summary)}</p>`;
    return `<p class="sum">${esc(s.summary)}</p>${s.participants?`<p class="meta"><b>Participants:</b> ${esc(s.participants)}</p>`:""}`;
  }
  // integrated-care chapters keep the order of the Excel sheet (it is a story); the rest are sorted by date
  const its = items.filter(it=>it.cat===lane.id && it.stage===sid).sort((a,b)=> lane.id==="prototype" ? a.ord-b.ord : (a.date||0)-(b.date||0));
  if(!its.length) return lane.id==="talk" && open ? `<p class="meta muted">Talks for this stage will be added.</p>` : "";
  if(!open){
    if(lane.id==="care") return its.map(it=>`<div class="it">${swatch("care",11)}<span class="t">${esc(it.d.chapter || it.d.title)}</span></div>` +
      (it.d.image_file ? `<button type="button" class="thumb zoomable cthumb" data-zoom="${esc(it.id)}:0" title="${esc(it.d.image_caption||it.d.title)}" aria-label="Enlarge: ${esc(it.d.image_caption||it.d.title)}">${imgSlot(it.d.image_file, it.d.image_caption||it.d.title, "", CONFIG.careBase)}</button>` : "")).join("");
    if(lane.id==="taxonomy") return its.map(it=>`<button type="button" class="txmini" data-zoom="${esc(it.d.tax_id)}:0" aria-label="Enlarge: ${esc(it.d.label)}"><div class="txfig">${taxFig(it.d)}</div></button><span class="txcap" title="${esc(it.d.label)}">${esc(it.label)}</span>`).join("");
    if(lane.id==="prototype") return its.map(it=>`<button type="button" class="thumb zoomable" data-zoom="${esc(it.d.proto_id)}:0" title="${esc(it.d.name)}" aria-label="Enlarge: ${esc(it.d.name)}">${protoImg(protoFile(it.d), it.d.name, "")}</button>`).join("");
    return its.map(it=>`<div class="it">${swatch(lane.id,11)}<span class="t">${esc(shortLabel(it))}</span></div>`).join("");
  }
  if(lane.id==="prototype") return `<div class="opgrid">${its.map(it=>openItem(it)).join("")}</div>`;
  return its.map(it=>openItem(it)).join("");
}
function openItem(it){
  const d = it.d;
  switch(it.cat){
    case "quote": return `<figure class="oq"><blockquote>${esc(d.quote)}</blockquote><figcaption>${esc([d.speaker_group, d.theme].filter(Boolean).join(" · "))}${d.verify_attribution==="Y"?`<span class="flag">attribution to verify</span>`:""}</figcaption></figure>`;
    case "publication": { const link = d.doi ? `https://doi.org/${d.doi}` : d.url;
      return `<div class="oi">${swatch("publication",11)}<div><b>${link?`<a href="${esc(link)}" target="_blank" rel="noopener">${esc(d.title)}</a>`:esc(d.title)}</b>${/placeholder|to complete/i.test(String(d.notes||"")+String(d.title||""))?`<span class="flag">to complete</span>`:""}<span>${esc(d.citation_short)} · ${esc(d.venue||d.pub_type)}</span></div></div>`; }
    case "talk": { const tbc = /placeholder|to confirm|to complete/i.test([d.title,d.event,d.notes].join(" "));
      return `<div class="oi">${swatch("talk",11)}<div><span class="ty">${esc([d.talk_type, parts(d.date)?.y].filter(Boolean).join(" · "))}</span><b>${d.link?`<a href="${esc(d.link)}" target="_blank" rel="noopener">${esc(d.title)}</a>`:esc(d.title)}</b>${tbc?`<span class="flag">to confirm</span>`:""}<span>${esc(String(d.presenters||"").replace(/;\s*/g,", "))}</span><span>${esc([d.event, d.location].filter(x=>x && !/^\[/.test(x)).join(" · "))}</span></div></div>`; }
    case "funding": return `<div class="oi">${swatch("funding",11)}<div><b>${esc(it.amount?money(it.amount):"—")}${isPlaceholder(d.notes)?`<span class="flag">to confirm</span>`:""}</b><span>${esc(d.funder)} · ${esc(d.start_year)}–${esc(d.end_year)}</span><span>${d.url?`<a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.title)}</a>`:esc(d.title)}</span></div></div>`;
    case "prototype": return `<div class="op">${protoGallery(d)}<b>${esc(d.name)}</b><span>Version ${esc(d.version)} · ${esc(years(d.start_date,d.end_date))}</span><button type="button" class="linkbtn small" data-go="${d.proto_id}">See details →</button></div>`;
    case "care": {
      const cap = d.image_caption || d.title;
      const fig = d.image_file ? `<figure class="cfig"><button type="button" class="zoomable cimg" data-zoom="${esc(d.icn_id)}:0" aria-label="Enlarge: ${esc(cap)}">${imgSlot(d.image_file, cap, "Figure", CONFIG.careBase)}</button>${d.image_caption?`<figcaption>${esc(d.image_caption)}</figcaption>`:""}</figure>` : "";
      const pts = String(d.key_points||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
      const li = p => { const m = p.match(/^([^:]{2,40}):\s*(.*)$/s); return m ? `<li><b>${esc(m[1])}:</b> ${esc(m[2])}</li>` : `<li>${esc(p)}</li>`; };
      return `<article class="oc"><span class="ty">${swatch("care",11)} ${esc(d.chapter||"")}${d.start_date?` · ${esc(fmtRange(d.start_date, d.end_date))}`:""}</span>
        <h4>${esc(d.title)}</h4>${fig}<p class="nar">${esc(d.narrative)}</p>
        ${pts.length?`<ul class="kp">${pts.map(li).join("")}</ul>`:""}
        ${d.participants?`<p class="meta"><b>Participants:</b> ${esc(d.participants)}</p>`:""}
        ${d.countries?`<p class="meta"><b>Countries:</b> ${esc(String(d.countries).replace(/;\s*/g,", "))}</p>`:""}
        ${d.link_to_ecarepd?`<p class="link-ec"><b>Link to eCARE-PD:</b> ${esc(d.link_to_ecarepd)}</p>`:""}
        ${sourcesHTML(d.source_id)}</article>`; }
    case "taxonomy": return `<div class="op otx"><button type="button" class="txmini" data-zoom="${esc(d.tax_id)}:0" aria-label="Enlarge: ${esc(d.label)}"><div class="txfig">${taxFig(d)}</div></button>
      <span class="ty">${swatch("taxonomy",10)} Version ${TV.indexOf(d)+1} of ${TV.length} · ${esc(perY(d.period))}</span><b>${esc(d.label)}</b>${d.change_from_previous?`<span>${esc(d.change_from_previous)}</span>`:""}
      <button type="button" class="linkbtn small" data-go="${esc(d.tax_id)}">Open in the taxonomy view →</button></div>`;
  }
  return "";
}

const TX_W = 340;
function fitTx(root){
  (root||ROOT).querySelectorAll(".txmini").forEach(m => { const f = m.firstElementChild, w = m.clientWidth; if(!f || !w) return;
    const W = Math.max(TX_W, w), k = w / W;
    f.style.width = W + "px"; f.style.transform = k < 1 ? `scale(${k})` : ""; m.style.height = Math.ceil(f.offsetHeight * k) + "px"; });
}
function renderGrid(){
  const grid = $("#ecp-grid"), os = state.open, n = os.size, any = n>0, mob = innerWidth < 600, lab = mob ? 84 : 128, colW = 98;
  const isO = sid => os.has(sid);
  // one open stage: wide column; several: each still wide enough for large pictures (the grid scrolls sideways)
  const openW = mob ? Math.max(240, $("#ecp-tgwrap").clientWidth - lab - 2) : (n>1 ? 380 : 460);
  grid.style.gridTemplateColumns = `${lab}px ` + STAGES.map(s => isO(s.stage_id) ? `minmax(${openW}px,4fr)` : `minmax(${colW}px,1fr)`).join(" ");
  grid.style.minWidth = (lab + (STAGES.length-n)*colW + n*openW) + "px";
  grid.classList.toggle("has-open", any);
  const lanes = LANES.filter(c=>state.visible.has(c.id));
  const cls = (i, sid) => (i%2 ? " odd" : "") + (isO(sid) ? " open" : "") + (any && !isO(sid) ? " dim" : "");
  let h = "";
  h += `<div class="lab top" style="grid-row:1;grid-column:1">Years</div>`;
  STAGES.forEach((s,i)=>{ h += `<div class="yr${cls(i,s.stage_id)}" data-stage="${s.stage_id}" style="grid-row:1;grid-column:${i+2}">${esc(years(s.start_date, s.end_date))}</div>`; });
  // Project row: one line per project (PD-TIPS.AI on top, then iCARE-PD, then eCARE-PD); a stage sits on the line of
  // its main_track and on the lines of its other_tracks (Stages sheet), so a project can run under or over another
  const lines = TRACK_ORDER.filter(t => STAGES.some(s => tracksOf(s).includes(t)));
  const P = Math.max(1, lines.length), SR = P + 2;
  h += `<div class="lab top" style="grid-row:2/${P+2};grid-column:1">Project</div>`;
  lines.forEach((t,k)=>{ let i0 = null;
    STAGES.forEach((s,i)=>{ const on = tracksOf(s).includes(t), nxt = STAGES[i+1];
      if(on && i0==null) i0 = i;
      if(on && !(nxt && tracksOf(nxt).includes(t))){ const d = trk(t).desc;
        h += `<div class="trk ${trk(t).cls}${k===lines.length-1?" last":""}" style="grid-row:${2+k};grid-column:${i0+2}/${i+3}" title="${esc(t)}${d?`: ${esc(d)}`:""}"><b>${esc(t)}</b>${i>i0 && d?` <span>${esc(d)}</span>`:""}</div>`;
        i0 = null; } }); });
  h += `<div class="lab" style="grid-row:${SR};grid-column:1">Stages</div>`;
  STAGES.forEach((s,i)=>{ const o = isO(s.stage_id);
    h += `<div class="stg${cls(i,s.stage_id)}" data-stage="${s.stage_id}" style="grid-row:${SR};grid-column:${i+2}"><button type="button" class="stgbtn ${trk(s.main_track).cls}" data-stage="${s.stage_id}" aria-expanded="${o}" title="${o?"Close this column":"Open this column"}"><span class="no">${esc(any && !o ? stageNo(s).replace("Iteration ","It. ") : stageNo(s))}</span><span class="nm">${esc(o ? s.title.replace(/^[^—:]*[—:]\s*/,"") : stageShort(s))}</span>${o?`<span class="x" aria-hidden="true">✕ Close</span>`:""}</button></div>`; });
  lanes.forEach((c,li)=>{
    const r = li + SR + 1;
    h += `<div class="lab" style="grid-row:${r};grid-column:1">${swatch(c.id)}<span>${esc(c.label)}${c.id==="talk" && !items.some(i=>i.cat==="talk")?`<small>coming soon</small>`:""}</span></div>`;
    STAGES.forEach((s,i)=>{ const o = isO(s.stage_id);
      h += `<div class="cell ${c.id}${cls(i,s.stage_id)}" data-stage="${s.stage_id}" style="grid-row:${r};grid-column:${i+2}">${cellHTML(c, s, o)}</div>`; });
  });
  grid.innerHTML = h;
  grid.querySelectorAll(".stgbtn").forEach(b=>b.addEventListener("click", ()=>openStage(b.dataset.stage)));
  grid.querySelectorAll(".cell:not(.open), .yr:not(.open)").forEach(c=>c.addEventListener("click", ()=>openStage(c.dataset.stage, {keep:true})));
  // an open column closes from its stage button (✕ Close) or from its year at the top
  grid.querySelectorAll(".yr.open").forEach(c=>{ c.title = "Close this column"; c.addEventListener("click", ()=>openStage(c.dataset.stage)); });
  bindGo(grid);
  fitTx(grid);
  // stage bar: arrows when one stage is open; "Open all" / "Close all" otherwise
  $("#ecp-stagenav").hidden = false;
  $("#ecp-sprev").hidden = $("#ecp-snext").hidden = n!==1;
  if(n===1){ const i = STAGES.findIndex(s=>isO(s.stage_id));
    $("#ecp-sprev").disabled = i<=0; $("#ecp-snext").disabled = i>=STAGES.length-1;
    $("#ecp-sopen").textContent = STAGES[i].short_label; }
  else $("#ecp-sopen").textContent = n ? `${n} stages open` : "";
  $("#ecp-sclose").hidden = !any;
  $("#ecp-sclose").textContent = n>1 ? "Close all" : "Back to overview";
  $("#ecp-sall").hidden = n===STAGES.length;
}
/* "PUB03; F01" -> linked citations (publications open their DOI) */
function sourcesHTML(ids){
  const out = splitList(ids).map(id => {
    const p = DATA.publications.find(x=>x.pub_id===id);
    if(p){ const link = p.doi ? `https://doi.org/${p.doi}` : p.url; return link ? `<a href="${esc(link)}" target="_blank" rel="noopener">${esc(p.citation_short)}</a>` : esc(p.citation_short); }
    const f = DATA.funding.find(x=>x.grant_id===id); if(f) return esc(`${f.funder} grant`);
    return esc(id);
  });
  return out.length ? `<p class="meta src"><b>Sources:</b> ${out.join(" · ")}</p>` : "";
}
function shortLabel(it){
  if(it.cat==="publication"){ const c = it.d.citation_short||""; const a = c.split(/[ ,]/)[0]; const y = (c.match(/\d{4}[a-z]?/)||[it.d.year])[0]; return `${a} ${y}`; }
  if(it.cat==="funding") return it.amount ? moneyShort(it.amount) : it.d.funder;
  if(it.cat==="talk") return [it.d.talk_type || "Talk", parts(it.d.date)?.y].filter(Boolean).join(" ");
  return it.label;
}
if(window.ResizeObserver) new ResizeObserver(()=>fitTx($("#ecp-grid"))).observe($("#ecp-grid"));
$("#ecp-sprev").onclick = ()=>stepStage(-1);
$("#ecp-snext").onclick = ()=>stepStage(1);
$("#ecp-sclose").onclick = ()=>{ state.open = new Set(); renderGrid(); };
$("#ecp-sall").onclick = ()=>{ state.open = new Set(STAGES.map(s=>s.stage_id)); renderGrid(); };
$("#ecp-grid").addEventListener("keydown", ev => {
  if(ev.key==="ArrowRight"){ ev.preventDefault(); stepStage(1); }
  if(ev.key==="ArrowLeft"){ ev.preventDefault(); stepStage(-1); }
  if(ev.key==="Escape" && state.open.size){ const b0 = ev.target.closest(".stgbtn"); state.open = new Set(); renderGrid(); const b = b0 && $(`#ecp-grid .stgbtn[data-stage="${b0.dataset.stage}"]`); if(b) b.focus(); }
});
window.addEventListener("resize", (()=>{ let w = innerWidth; return ()=>{ if((w<600) !== (innerWidth<600)){ w = innerWidth; renderGrid(); } }; })());

/* shared helpers */
function dlRows(rows){ return `<dl class="dl">${rows.filter(r=>r[1]).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${v}</dd>`).join("")}</dl>`; }
function bulletList(s){ const a = splitList(s); return a.length>1 ? `<ul>${a.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>` : esc(s); }
/* data-go: prototypes → Prototypes view; taxonomy → Taxonomy view; anything else → open its stage */
function goTo(id){
  const it = ITEM[id] || (STAGE[id] && {cat:"stage", stage:id});
  if(!it) return;
  if(it.cat==="prototype"){ showView("prototypes", true); const card = $(`#ecp-pc-${id}`); if(card){ card.classList.add("flash"); setTimeout(()=>card.classList.remove("flash"), 1600); card.scrollIntoView({behavior: reduceMotion?"auto":"smooth", block:"center"}); } return; }
  if(it.cat==="taxonomy"){ showView("taxonomy", true); showTax(id, true); return; }
  showView("timeline", true); openStage(it.stage, {keep:true, scroll:true});
}
function bindGo(el){ el.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click", ev=>{ ev.preventDefault(); ev.stopPropagation(); goTo(b.dataset.go); })); }
function bindStage(el){ el.querySelectorAll("[data-stage-go]").forEach(b=>b.addEventListener("click", ev=>{ ev.preventDefault(); showView("timeline", true); openStage(b.dataset.stageGo, {keep:true, scroll:true}); })); }

/* ==================================================================
   PROTOTYPES VIEW
   ================================================================== */
function renderProtos(){
  const ps = protoSorted();
  $("#ecp-protos").innerHTML = `<div class="pgrid">` + ps.map(p=>{ const s = STAGE[p.stage_id];
    return `<article class="pcard" id="ecp-pc-${p.proto_id}">${protoGallery(p)}
      <div class="pb"><div class="pv"><span>${esc(stageNo(s))} · ${esc(stageShort(s))}</span><span>${esc(years(p.start_date,p.end_date))}</span></div><h4>${esc(p.name)}</h4>
      ${dlRows([["Features",bulletList(p.features)],["Tested with",esc(p.tested_with)],["Key findings",esc(p.key_findings)]])}
      <button type="button" class="btnlink" data-stage-go="${p.stage_id}">Open ${esc(stageNo(s))} on the timeline →</button></div></article>`; }).join("") + `</div>`;
  bindStage($("#ecp-protos"));
}

/* ==================================================================
   TAXONOMY VIEW
   ================================================================== */
const TV = DATA.taxonomy_versions, TERMS = DATA.taxonomy_terms;
const termsOf = (tx, type) => TERMS.filter(t=>t.tax_id===tx && (!type || t.term_type===type));
const DEPTH = {TX0:1,TX1:1,TX2:1,TX3:1,TX4:2,TX5:2,TX6:3,TX7:5};
/* split "A · B · C" or "A, B, C" into items */
const splitTop = s => String(s||"").split(/\s*·\s*|\s*,\s*/).map(x=>x.trim()).filter(Boolean);
/* the picture at the top of each taxonomy card, drawn from that version's own data */
function taxFig(t){
  const tx = t.tax_id;
  const model = termsOf(tx,"Data model level"), ints = termsOf(tx,"Intention"), doms = termsOf(tx,"Domain"), cats = termsOf(tx,"Category");
  if(model.length){ const ct = termsOf(tx,"Care tip type");
    return `<p class="tx-cap">Data model of the recommender</p><div class="chain mini">${model.map((n,i)=>`${i?'<span class="ar" aria-hidden="true">→</span>':""}<span class="node">${esc(n.term)}</span>`).join("")}</div>
      ${ct.length?`<p class="tx-cap">${ct.length} care-tip functions</p><div class="pills mini">${ct.map(c=>`<span class="pill">${esc(c.term.replace(/ Care Tips?$/,""))}</span>`).join("")}</div>`:""}`; }
  if(ints.length){ const tags = termsOf(tx,"Tag");
    return `<p class="tx-cap">Level 1 · ${ints.length} first-person intentions</p><div class="ints">${ints.map(i=>`<span class="intent">${esc(i.phrasing_or_definition || i.term)}</span>`).join("")}</div>
      ${tags.length?`<p class="tx-cap">Level 3 · cross-cutting tags</p><div class="pills mini">${tags.map(g=>`<span class="pill">${esc(g.term)}</span>`).join("")}</div>`:""}`; }
  if(doms.length){
    return `<p class="tx-cap">${doms.length} intention-domains · sub-domains</p><div class="mcols" style="--n:${Math.min(doms.length,3)}">${doms.map(dm=>{ const subs = TERMS.filter(s=>s.parent_code===dm.code && s.tax_id===tx);
      return `<div class="mcard"><b>${esc(dm.term)}</b><span>${subs.length} sub-domain${subs.length>1?"s":""}</span></div>`; }).join("")}</div>`; }
  // a list of categories: from Taxonomy_Terms, or from "top_level" (A · B · C, or "…: A, B, C, D")
  let names = cats.map(c=>c.term);
  if(!names.length){ const tl = String(t.top_level||""); names = tl.includes(":") ? splitTop(tl.split(":").slice(1).join(":")) : (tl.includes("·") ? splitTop(tl) : []); }
  if(names.length){ const hier = (DEPTH[tx]||1) > 1;
    const lim = /no structural change|limits/i.test(String(t.change_from_previous||"")) ? splitList(t.evidence_rationale) : [];
    return `<p class="tx-cap">${names.length} ${hier?"categories → domains → sub-domains":"categories"}</p><div class="mcols" style="--n:${Math.min(names.length,4)}">${names.map(n=>`<div class="mcard${/create your own/i.test(n)?" open":""}"><b>${esc(n)}</b>${hier?`<i class="skel"></i><i class="skel s2"></i><i class="skel s3"></i>`:`<i class="skel"></i><i class="skel s2"></i>`}</div>`).join("")}</div>
      ${lim.length?`<div class="mlimits">${lim.map(x=>`<span>${esc(x)}</span>`).join("")}</div>`:""}`; }
  // an open, flat list (first version)
  const ex = (String(t.top_level||"").match(/e\.g\.\s*([^()]+)/)||[])[1]; const picks = ex ? splitTop(ex) : [];
  const w = [56,80,46,96,64,84,52,70,104,60,78,48];
  return `<p class="tx-cap">An open, flat list · users pick about 3–4</p><div class="pills mini">${picks.map(p=>`<span class="pill pick">${esc(p)}</span>`).join("")}${w.map(x=>`<span class="pill ghost" style="width:${x}px" aria-hidden="true">·</span>`).join("")}</div>`;
}
function renderTaxSteps(){
  const n = TV.length, el = $("#ecp-txsteps");
  el.style.setProperty("--n", n);
  el.removeAttribute("role");
  el.innerHTML = TV.map((t,i)=>`<button type="button" class="step" data-tx="${t.tax_id}" aria-controls="ecp-tx-${t.tax_id}" aria-current="false" title="${esc(t.label)}"><span class="dot">${i+1}</span><span class="sl">${esc(t.label.replace(/\s*\(.*\)$/,"").replace(/\s*-\s*prototype.*$/i,""))}</span><span class="sp">${esc(perY(t.period))} · ${esc(stageNo(STAGE[t.stage_id]).replace("Iteration ","It. "))}</span></button>`).join("");
  $$("#ecp-txsteps .step").forEach(b=>{ b.onclick=()=>showTax(b.dataset.tx, true); });
  // all versions as cards, like the prototype cards
  const box = $("#ecp-taxcards") || $("#ecp-taxpanel");
  box.id = "ecp-taxcards"; box.className = "pgrid txgrid"; box.removeAttribute("role"); box.removeAttribute("aria-labelledby");
  box.innerHTML = TV.map((t,i)=>{ const s = STAGE[t.stage_id];
    const extra = [];
    const ren = termsOf(t.tax_id,"Rename");
    if(ren.length) extra.push(["Renamed by participants", `<ul>${ren.map(r=>`<li>${esc(r.term)}</li>`).join("")}</ul>`]);
    return `<article class="pcard tx" id="ecp-tx-${t.tax_id}">
      <div class="txfig">${taxFig(t)}</div>
      <div class="pb"><div class="pv"><span>${swatch("taxonomy",9)} Version ${i+1} of ${TV.length} · ${esc(stageNo(s))}</span><span>${esc(perY(t.period))}</span></div>
      <h4>${esc(t.label)}</h4>
      ${t.structure?`<div class="small muted tx-struct">${esc(t.structure)}</div>`:""}
      ${dlRows([["Top level",esc(t.top_level)],["Change from previous",esc(t.change_from_previous)],["Rationale",esc(t.evidence_rationale)], ...extra])}</div></article>`; }).join("");
  bindStage(box);
}
/* highlight one version: its step on the line, and its card (scrolled into view) */
function showTax(tx, scroll){
  if(!TV.some(v=>v.tax_id===tx)) return;
  $$("#ecp-txsteps .step").forEach(b=>b.setAttribute("aria-current", b.dataset.tx===tx));
  const card = $(`#ecp-tx-${tx}`); if(!card || !scroll) return;
  card.classList.add("flash"); setTimeout(()=>card.classList.remove("flash"), 1600);
  card.scrollIntoView({behavior: reduceMotion?"auto":"smooth", block:"center"});
}

/* ==================================================================
   IMAGE VIEWER — hover preview on small thumbnails, click any prototype picture or figure to enlarge
   ================================================================== */
/* one gallery: every prototype picture (including the iCARE-PD figures), in timeline order */
const GALLERY = {
  proto: protoSorted()
    .flatMap(p => protoFiles(p).map((f,i,all)=>({key:`${p.proto_id}:${i}`, base:protoSrcBase(f), file:f, i, n:all.length,
      name:p.name, stage:p.stage_id, when:years(p.start_date,p.end_date), go:p.proto_id, more:"See details →"}))),
};
/* taxonomy pictures are drawn (HTML), not image files: the viewer shows them enlarged */
GALLERY.tax = TV.filter(t=>STAGE[t.stage_id]).map(t=>({key:`${t.tax_id}:0`, html:true, tx:t, i:0, n:1,
  name:t.label, stage:t.stage_id, when:perY(t.period), go:t.tax_id, more:"Open in the taxonomy view →"}));
const ZI = {};
Object.entries(GALLERY).forEach(([g,list]) => list.forEach((z,i)=>{ ZI[z.key] = {g, i}; }));
const zget = key => ZI[key] && GALLERY[ZI[key].g][ZI[key].i];
ROOT.insertAdjacentHTML("beforeend", `
  <div class="lb" id="ecp-lb" hidden role="dialog" aria-modal="true" aria-labelledby="ecp-lb-name">
    <div class="lb-back" data-lb="close"></div>
    <figure class="lb-fig">
      <div class="lb-img"><img id="ecp-lb-img" alt=""><div class="lb-html" id="ecp-lb-html" hidden></div><p class="lb-missing" hidden>Image not found: <code></code></p></div>
      <figcaption><span class="lb-k" id="ecp-lb-k"></span><b id="ecp-lb-name"></b><span class="lb-n" id="ecp-lb-n"></span><span class="lb-hint">Click the picture or scroll to zoom · drag to move · 0 to fit</span><button type="button" class="lb-more" data-lb="more">See details →</button></figcaption>
    </figure>
    <div class="lb-tools" role="group" aria-label="Zoom">
      <button type="button" data-lb="zout" aria-label="Zoom out">−</button>
      <button type="button" data-lb="fit" class="lb-pct" id="ecp-lb-pct" aria-label="Fit to screen">100%</button>
      <button type="button" data-lb="zin" aria-label="Zoom in">+</button>
    </div>
    <button type="button" class="lb-btn lb-prev" data-lb="prev" aria-label="Previous picture">‹</button>
    <button type="button" class="lb-btn lb-next" data-lb="next" aria-label="Next picture">›</button>
    <button type="button" class="lb-btn lb-x" data-lb="close" aria-label="Close">✕</button>
  </div>
  <div class="peek" id="ecp-peek" hidden aria-hidden="true"><img alt=""><div class="peek-html" hidden></div><span class="peek-cap"></span></div>`);
const LB = $("#ecp-lb"), LBI = $("#ecp-lb-img"), LBH = $("#ecp-lb-html");
let ZT = LBI;   // what the viewer zooms: the picture, or a drawn taxonomy figure
let lbAt = 0, lbG = "proto", lbReturn = null;

/* zoom & pan inside the viewer: s = scale (1 = fit to screen), x/y = offset in px */
const Z = {s:1, x:0, y:0, drag:null, pts:new Map(), pinch:null, last:0};
const ZMAX = 8;
function zApply(anim){
  ZT.style.transition = anim ? "" : "none";
  ZT.style.transform = (Z.s===1 && !Z.x && !Z.y) ? "" : `translate(${Z.x}px,${Z.y}px) scale(${Z.s})`;
  LB.classList.toggle("zoomed", Z.s > 1.001);
  $("#ecp-lb-pct").textContent = Math.round(Z.s*100) + "%";
}
function zClamp(){
  if(Z.s <= 1){ Z.s = 1; Z.x = 0; Z.y = 0; return; }
  const mx = Math.max(0, (ZT.offsetWidth*Z.s - innerWidth)/2 + 40), my = Math.max(0, (ZT.offsetHeight*Z.s - innerHeight)/2 + 40);
  Z.x = Math.max(-mx, Math.min(mx, Z.x)); Z.y = Math.max(-my, Math.min(my, Z.y));
}
/* zoom to scale s2, keeping the screen point (cx, cy) still */
function zoomTo(s2, cx, cy, anim=true){
  s2 = Math.max(1, Math.min(ZMAX, s2));
  const r = ZT.getBoundingClientRect(), c0x = r.left + r.width/2 - Z.x, c0y = r.top + r.height/2 - Z.y;
  if(cx==null){ cx = c0x; cy = c0y; }
  const px = cx - c0x, py = cy - c0y, k = s2 / Z.s;
  Z.x = px - k*(px - Z.x); Z.y = py - k*(py - Z.y); Z.s = s2;
  zClamp(); zApply(anim);
}
function zReset(){ Z.s = 1; Z.x = 0; Z.y = 0; Z.drag = null; Z.pinch = null; Z.pts.clear(); zApply(false); }
/* one click = the picture at its real size (at least 2.5×), so small text becomes readable */
const zFull = () => ZT===LBH ? 2 : Math.max(2.5, Math.min(ZMAX, (LBI.naturalWidth||0) / (LBI.offsetWidth||1)));
function zToggle(cx, cy){
  const now = Date.now(); if(now - Z.last < 350) return;   // a double-click zooms in once, not in-then-out
  Z.last = now;
  Z.s > 1.001 ? zoomTo(1) : zoomTo(zFull(), cx, cy);
}
function zEnd(ev){
  if(!Z.pts.has(ev.pointerId)) return;
  Z.pts.delete(ev.pointerId);
  if(Z.pinch){ if(Z.pts.size < 2) Z.pinch = null; Z.drag = null; return; }
  const d = Z.drag; Z.drag = null; if(!d || ev.type==="pointercancel") return;
  const dx = ev.clientX - d.x0;
  if(!d.moved) zToggle(ev.clientX, ev.clientY);
  else if(Z.s === 1 && d.touch && Math.abs(dx) > 50) lbShow(lbAt + (dx<0 ? 1 : -1));   // swipe to the next picture
}
[LBI, LBH].forEach(el => {
el.addEventListener("dragstart", ev => ev.preventDefault());
el.addEventListener("pointerdown", ev => {
  ev.stopPropagation(); ev.preventDefault();
  el.setPointerCapture(ev.pointerId);
  Z.pts.set(ev.pointerId, {x:ev.clientX, y:ev.clientY});
  if(Z.pts.size === 2){ const [a,b] = [...Z.pts.values()]; Z.pinch = {d: Math.hypot(a.x-b.x, a.y-b.y) || 1, s: Z.s}; Z.drag = null; return; }
  Z.drag = {x0:ev.clientX, y0:ev.clientY, tx:Z.x, ty:Z.y, moved:false, touch: ev.pointerType!=="mouse"};
});
el.addEventListener("pointermove", ev => {
  if(!Z.pts.has(ev.pointerId)) return;
  Z.pts.set(ev.pointerId, {x:ev.clientX, y:ev.clientY});
  if(Z.pinch && Z.pts.size === 2){ const [a,b] = [...Z.pts.values()];
    zoomTo(Z.pinch.s * Math.hypot(a.x-b.x, a.y-b.y) / Z.pinch.d, (a.x+b.x)/2, (a.y+b.y)/2, false); return; }
  const d = Z.drag; if(!d) return;
  const dx = ev.clientX - d.x0, dy = ev.clientY - d.y0;
  if(Math.abs(dx) + Math.abs(dy) > 5) d.moved = true;
  if(Z.s > 1){ Z.x = d.tx + dx; Z.y = d.ty + dy; zClamp(); zApply(false); }
});
el.addEventListener("pointerup", zEnd);
el.addEventListener("pointercancel", zEnd);
});
LB.addEventListener("wheel", ev => { if(LB.hidden || ZT.hidden) return; ev.preventDefault();
  zoomTo(Z.s * Math.exp(-ev.deltaY * (ev.ctrlKey ? 0.01 : 0.0015)), ev.clientX, ev.clientY, false); }, {passive:false});
LBI.addEventListener("load", () => zReset());

function lbShow(i){
  const list = GALLERY[lbG];
  lbAt = (i + list.length) % list.length;
  const z = list[lbAt], s = STAGE[z.stage], miss = LB.querySelector(".lb-missing");
  zReset();
  if(z.html){   // a drawn taxonomy figure, enlarged to fit the screen
    ZT = LBH; LBI.hidden = true; miss.hidden = true; LBI.removeAttribute("src"); LBH.hidden = false;
    LBH.innerHTML = `<div class="txfig">${taxFig(z.tx)}</div>`;
    const f = LBH.firstElementChild; f.style.width = TX_W + "px";
    const k = Math.max(1, Math.min((innerWidth - (innerWidth<600?24:180)) / TX_W, (innerHeight - 260) / (f.offsetHeight||1), 3));
    f.style.zoom = k;
  } else { ZT = LBI; LBH.hidden = true; LBH.innerHTML = "";
  miss.hidden = true; LBI.hidden = false;
  LBI.onerror = ()=>{ LBI.hidden = true; miss.hidden = false; miss.querySelector("code").textContent = z.base + z.file; };
  LBI.src = z.base + z.file;
  LBI.alt = `${z.name}${z.n>1?` — picture ${z.i+1} of ${z.n}`:""}`; }
  $("#ecp-lb-k").textContent = `${stageNo(s)} · ${stageShort(s)}${z.when?` · ${z.when}`:""}`;
  $("#ecp-lb-name").textContent = z.name;
  $("#ecp-lb-n").textContent = (z.n>1 ? `Picture ${z.i+1} of ${z.n} · ` : "") + `${lbAt+1} / ${list.length}`;
  LB.querySelector(".lb-more").textContent = z.more;
  LB.querySelectorAll(".lb-prev,.lb-next").forEach(b=>b.hidden = list.length<2);
}
function lbOpen(key, from){
  if(!(key in ZI)) return;
  peekHide(); lbReturn = from || document.activeElement;
  LB.hidden = false; document.documentElement.style.overflow = "hidden";
  lbG = ZI[key].g; lbShow(ZI[key].i); LB.querySelector(".lb-x").focus();
}
function lbClose(){
  zReset();
  LB.hidden = true; document.documentElement.style.overflow = ""; LBI.removeAttribute("src"); LBH.innerHTML = "";
  if(lbReturn && document.contains(lbReturn)) lbReturn.focus({preventScroll:true});
}
LB.addEventListener("click", ev => { const a = ev.target.closest("[data-lb]"); if(!a) return;
  const k = a.dataset.lb;
  if(k==="close") lbClose(); else if(k==="prev") lbShow(lbAt-1); else if(k==="next") lbShow(lbAt+1);
  else if(k==="zin") zoomTo(Z.s*1.5); else if(k==="zout") zoomTo(Z.s/1.5); else if(k==="fit") zoomTo(1);
  else if(k==="more"){ const id = GALLERY[lbG][lbAt].go; lbReturn = null; lbClose(); goTo(id); } });
document.addEventListener("keydown", ev => {
  if(LB.hidden) return;
  const pan = {ArrowLeft:[90,0], ArrowRight:[-90,0], ArrowUp:[0,90], ArrowDown:[0,-90]}[ev.key];
  if(ev.key==="Escape"){ Z.s > 1.001 ? zoomTo(1) : lbClose(); }
  else if(pan && Z.s > 1.001){ Z.x += pan[0]; Z.y += pan[1]; zClamp(); zApply(true); }   // zoomed: arrows move the picture
  else if(ev.key==="ArrowLeft"){ lbShow(lbAt-1); } else if(ev.key==="ArrowRight"){ lbShow(lbAt+1); }
  else if(ev.key==="+" || ev.key==="="){ zoomTo(Z.s*1.5); } else if(ev.key==="-"){ zoomTo(Z.s/1.5); } else if(ev.key==="0"){ zoomTo(1); }
  else if(ev.key==="Tab"){ const f = $$("#ecp-lb button:not([hidden])"); const i = f.indexOf(document.activeElement);
    ev.preventDefault(); f[(i + (ev.shiftKey?-1:1) + f.length) % f.length].focus(); return; }
  else return;
  ev.preventDefault(); ev.stopPropagation();
}, true);
let lbX = null;
LB.addEventListener("pointerdown", ev => { if(ev.pointerType!=="mouse" && Z.s===1) lbX = ev.clientX; });
LB.addEventListener("pointerup", ev => { if(lbX==null) return; const dx = ev.clientX-lbX; lbX = null; if(Math.abs(dx)>50 && Z.s===1) lbShow(lbAt + (dx<0?1:-1)); });
// capture phase, so a click on a picture enlarges it instead of opening/closing its stage
ROOT.addEventListener("click", ev => { const z = ev.target.closest("[data-zoom]"); if(!z || !ROOT.contains(z)) return;
  ev.preventDefault(); ev.stopPropagation(); lbOpen(z.dataset.zoom, z); }, true);

/* hover preview: only for the small thumbnails in the overview, on devices with a mouse */
const PEEKABLE = ".thumb[data-zoom], .cell:not(.open) .txmini[data-zoom]";
const PEEK = $("#ecp-peek"), canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
let peekT = null;
function peekHide(){ clearTimeout(peekT); PEEK.hidden = true; }
function peekShow(el){
  const z = zget(el.dataset.zoom); if(!z) return;
  const img = PEEK.querySelector("img"), ph = PEEK.querySelector(".peek-html");
  if(z.html){ img.hidden = true; ph.hidden = false; ph.innerHTML = `<div class="txfig">${taxFig(z.tx)}</div>`; }
  else { ph.hidden = true; ph.innerHTML = ""; img.hidden = false; const url = z.base + z.file; if(img.getAttribute("src")!==url) img.src = url; }
  PEEK.querySelector(".peek-cap").textContent = z.name + " · click to enlarge";
  PEEK.hidden = false;
  const r = el.getBoundingClientRect(), w = Math.min(520, innerWidth*.45), gap = 12;
  PEEK.style.width = w + "px";
  if(z.html){ const f = PEEK.querySelector(".peek-html .txfig"); f.style.width = TX_W + "px"; f.style.zoom = (w - 12) / TX_W; }
  const left = (r.right + gap + w < innerWidth) ? r.right + gap : Math.max(8, r.left - gap - w);
  const h = PEEK.offsetHeight || w*.7;
  PEEK.style.left = left + "px";
  PEEK.style.top = Math.max(8, Math.min(innerHeight - h - 8, r.top + r.height/2 - h/2)) + "px";
}
ROOT.addEventListener("mouseover", ev => { if(!canHover.matches) return; const t = ev.target.closest(PEEKABLE); if(!t) return;
  clearTimeout(peekT); peekT = setTimeout(()=>peekShow(t), 120); });
ROOT.addEventListener("mouseout", ev => { const t = ev.target.closest(PEEKABLE); if(t && !t.contains(ev.relatedTarget)) peekHide(); });
PEEK.querySelector("img").addEventListener("load", ()=>{ if(!PEEK.hidden){ const t = ROOT.querySelector(".thumb[data-zoom]:hover"); if(t) peekShow(t); } });
window.addEventListener("scroll", peekHide, {passive:true});
$("#ecp-tgwrap").addEventListener("scroll", peekHide, {passive:true});

/* ==================================================================
   INIT
   ================================================================== */
renderFilters(); renderGrid(); renderProtos(); renderTaxSteps();
showView(location.hash.slice(1) || "story");
})();
