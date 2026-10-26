const LK="avs_lib";
function getLib(){try{return JSON.parse(localStorage.getItem(LK)||"[]")}catch(e){return[]}}
async function generate(){
  const b=$("go");b.disabled=true;
  $("msg").textContent="Création en cours... cela peut prendre 1 à 2 minutes.";
  try{
    const r=await fetch("/.netlify/functions/chanson",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(S)});
    if(r.status===404)throw new Error("moteur");
    let d;try{d=await r.json()}catch(x){throw new Error("moteur")}
    if(!r.ok||!d.audio)throw new Error(d.error||"erreur");
    const type=d.type||"audio/mpeg";
    done("data:"+type+";base64,"+d.audio,type.includes("wav")?"wav":"mp3");
  }catch(e){
    $("msg").textContent=e.message==="moteur"?"Le moteur de chanson n'est pas encore branché. Tes choix sont gardés.":"Erreur : "+e.message;
    b.disabled=false;
  }
}
async function share(title,url,ext){
  try{
    const blob=await (await fetch(url)).blob();
    const f=new File([blob],title+"."+ext,{type:blob.type});
    if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:title,text:"Ma chanson faite avec AVS PROD"});return}
  }catch(e){}
  window.open("https://wa.me/?text="+encodeURIComponent("Écoute ma chanson « "+title+" » faite avec AVS PROD : "+location.origin),"_blank");
}
function done(url,ext){
  const title=S.titre.trim()||"Ma chanson";
  const l=getLib();
  l.unshift({id:Date.now(),title:title,style:S.style,date:new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"}),url:url,ext:ext});
  let saved=true;
  try{localStorage.setItem(LK,JSON.stringify(l))}catch(e){saved=false}
  $("app").innerHTML='<h1>Ta chanson est prête 🎉</h1><p class="sub"></p><div class="card"><b id="tt"></b><audio controls id="au"></audio>'+
    '<div class="acts"><a class="cta2" id="dl">⬇ Télécharger</a><button class="cta2 wa" id="wa">WhatsApp</button></div></div>'+
    '<button class="cta2" id="again">Créer une autre chanson</button>';
  $("tt").textContent=title+" · "+S.style;
  $("au").src=url;
  const dl=$("dl");dl.href=url;dl.download=title.replace(/[^\w-]+/g,"_")+"."+ext;
  $("wa").onclick=()=>share(title,url,ext);
  $("again").onclick=()=>{S.step=0;S.occ="";S.titre="";S.paroles="";S.voix="";S.style="";S.mood="";render()};
  document.querySelector(".sub").textContent=saved?"Elle est gardée dans ta bibliothèque.":"Mémoire pleine : télécharge-la pour ne pas la perdre.";
  $("go").style.display="none";$("msg").textContent="";
}
