const $=id=>document.getElementById(id);
const TRACKS=[["kick","Grosse caisse"],["snare","Caisse claire"],["hat","Charley"],["tam","Tam-tam"],["bass","Basse"]];
const STYLES={
  afrobeat:{n:"Afrobeat",bpm:104,roots:[55,55,65.41,49],p:{kick:"x..x..x...x..x..",snare:"....x.......x...",hat:"x.x.x.x.x.x.x.x.",tam:"..x..x..x..x.x..",bass:"x..x..x...x..x.."}},
  zouk:{n:"Zouk",bpm:96,roots:[58.27,65.41,49,55],p:{kick:"x...x...x...x...",snare:"....x.......x..x",hat:"x.xxx.xxx.xxx.xx",tam:"..x...x...x...x.",bass:"x.....x.x.....x."}},
  amapiano:{n:"Amapiano",bpm:112,roots:[55,55,49,61.74],p:{kick:"x...x...x...x...",snare:"........x.......",hat:"..x...x...x...x.",tam:"x..x..x.x..x..x.",bass:"x..x...x..x...x."}},
  hiphop:{n:"Hip-hop",bpm:90,roots:[49,49,55,43.65],p:{kick:"x..x......x.x...",snare:"....x.......x...",hat:"x.x.x.x.x.x.x.x.",tam:"......x.......x.",bass:"x..x......x.x..."}}
};
let pat={},bpm=104,roots=[55,55,65.41,49],cur="afrobeat";
let ctx,master,dest,noiseBuf,timer=null,step=0,nextT=0,playing=false;
const cells={};

/* navigation */
function show(v){
  document.querySelectorAll(".view").forEach(s=>s.classList.toggle("on",s.id==="v-"+v));
  document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.go===v));
  if(v==="home"||v==="lib")renderLib();
  window.scrollTo(0,0);
}
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>show(b.dataset.go));
const h=new Date().getHours();
$("hello").textContent=(h>=18||h<4?"Bonsoir":"Bonjour")+" 👋";

/* bibliothèque (enregistrée sur le téléphone) */
function getLib(){try{return JSON.parse(localStorage.getItem("avs_lib")||"[]")}catch(e){return[]}}
function setLib(l){try{localStorage.setItem("avs_lib",JSON.stringify(l));return true}catch(e){return false}}
function card(s){
  const d=document.createElement("div");d.className="card";
  d.innerHTML='<div class="song"><div class="cover">♫</div><div><b></b><small></small></div></div>'+
    '<div class="acts"><button class="ic pl" aria-label="Jouer">▶</button>'+
    '<a class="ic" aria-label="Télécharger">⬇</a>'+
    '<button class="ic wa" aria-label="Partager sur WhatsApp">WA</button></div><audio></audio>';
  d.querySelector("b").textContent=s.title;
  d.querySelector("small").textContent=s.style+" · "+s.date;
  const a=d.querySelector("audio");a.src=s.url;
  const pl=d.querySelector(".pl");
  pl.onclick=()=>{if(a.paused){document.querySelectorAll("audio").forEach(x=>x.pause());a.play();pl.textContent="❚❚"}else{a.pause();pl.textContent="▶"}};
  a.onended=()=>pl.textContent="▶";
  const dl=d.querySelector("a");dl.href=s.url;dl.download=s.title.replace(/[^\w-]+/g,"_")+"."+s.ext;
  d.querySelector(".wa").onclick=()=>share(s);
  return d;
}
async function share(s){
  try{
    const blob=await (await fetch(s.url)).blob();
    const f=new File([blob],s.title+"."+s.ext,{type:blob.type});
    if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:s.title,text:"Ma chanson faite avec AVS PROD"});return}
  }catch(e){}
  window.open("https://wa.me/?text="+encodeURIComponent("Écoute ma chanson « "+s.title+" » faite avec AVS PROD : "+location.origin),"_blank");
}
function renderLib(){
  const l=getLib();
  const fill=(el,items,txt)=>{el.innerHTML="";if(!items.length){el.innerHTML='<div class="card empty">'+txt+'</div>';return}items.forEach(s=>el.appendChild(card(s)))};
  fill($("recent"),l.slice(0,2),"Ta première chanson t'attend. Appuie sur Créer.");
  fill($("lib"),l,"Aucune chanson pour l'instant. Crée et enregistre ta première chanson.");
}

/* rythme */
const grid=$("grid");
TRACKS.forEach(([k,label])=>{
  const w=document.createElement("div");w.className="track";
  w.innerHTML='<div class="tname">'+label+'</div>';
  const s=document.createElement("div");s.className="steps";cells[k]=[];
  for(let i=0;i<16;i++){
    const b=document.createElement("button");b.className="cell";
    b.setAttribute("aria-label",label+" temps "+(i+1));
    b.onclick=()=>{pat[k][i]=pat[k][i]?0:1;paint()};
    s.appendChild(b);cells[k].push(b);
  }
  w.appendChild(s);grid.appendChild(w);
});
Object.keys(STYLES).forEach(k=>{
  const b=document.createElement("button");b.className="chip";b.textContent=STYLES[k].n;b.dataset.k=k;
  b.onclick=()=>setStyle(k);$("styles").appendChild(b);
});
function paint(){
  TRACKS.forEach(([k])=>cells[k].forEach((c,i)=>c.classList.toggle("on",!!pat[k][i])));
  document.querySelectorAll(".chip").forEach(b=>b.classList.toggle("on",b.dataset.k===cur));
  $("bpm").value=bpm;$("bpmv").textContent=bpm;
}
function setStyle(k){
  cur=k;const s=STYLES[k];bpm=s.bpm;roots=s.roots.slice();
  TRACKS.forEach(([t])=>{pat[t]=[...s.p[t]].map(c=>c==="x"?1:0)});paint();
}
$("bpm").oninput=e=>{bpm=+e.target.value;$("bpmv").textContent=bpm};
