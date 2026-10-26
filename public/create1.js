const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const OCC=[["🎂","Anniversaire"],["💒","Mariage"],["💕","Déclaration"],["🎓","Réussite"],["🎉","Fête"],["🕯️","Hommage"],["💪","Encouragement"],["😎","Juste le fun"]];
const VOI=[["👨","Homme"],["👩","Femme"],["👫","Mixte (duo)"]];
const ACC=["Automatique","Accent africain","Accent français"];
const STY=[["🥁","Afrobeat"],["💃","Coupé-Décalé"],["🙏","Gospel"],["🎹","Amapiano"],["🌺","Zouk"],["🪘","Zouglou"],["🌍","Afro"],["🎤","R&B"],["🎧","Rap / Hip-Hop"],["🎸","Acoustique"],["🌴","Reggae"],["🔊","Dancehall"],["🏝️","Kompa"],["🎺","Highlife"],["🇳🇬","Nigerian Music"],["🇸🇳","Mbalax"]];
const MOOD=[["😄","Joyeux"],["🎉","Festif"],["❤️","Romantique"],["🥲","Mélancolique"],["⚡","Énergique"],["😎","Chill"],["🌅","Nostalgique"],["🔥","Épique"]];
const SPD=[["🐢","Lente"],["🎵","Normale"],["⚡","Rapide"]];
const LMAIN=["Français","Anglais","Français + Anglais","Nouchi"];
const LGRP=[["Bénin",["Fon","Yoruba","Bariba","Adja"]],["Togo",["Éwé","Kabyè","Tem","Moba"]],["Côte d'Ivoire",["Dioula","Baoulé","Sénoufo","Abbey"]],["Sénégal",["Wolof","Pulaar","Sérère"]]];
const STEPS=[
 {k:"occ",t:"On célèbre quoi aujourd'hui ? 🎉",s:"Chaque grand moment mérite SA chanson."},
 {k:"par",t:"Tes paroles ✍️",s:"Colle ton texte : il sera chanté mot pour mot."},
 {k:"voi",t:"Qui chante tes mots ? 🎤",s:"Une voix d'homme ou de femme pour ton message."},
 {k:"sty",t:"Quel style ? 🥁",s:"Le genre de ta chanson."},
 {k:"amb",t:"Quelle ambiance ? 🎭",s:"L'émotion de ta chanson."},
 {k:"lan",t:"Dans quelle langue ? 🗣️",s:"C'est ton texte qui donne la langue. Ce choix sert au chant."},
 {k:"vit",t:"Quelle vitesse ? 🎚️",s:"Normale garde le rythme naturel du style."},
 {k:"fin",t:"Prêt à créer ✨",s:"Vérifie tes choix, puis lance la chanson."}
];
const S={step:0,occ:"",titre:"",paroles:"",voix:"",accent:"Automatique",style:"",mood:"",langue:"Français",vitesse:"Normale"};

function opts(list,key){
  return '<div class="grid">'+list.map(([e,n])=>'<button class="opt'+(S[key]===n?' on':'')+'" data-k="'+key+'" data-v="'+esc(n)+'"><i>'+e+'</i>'+esc(n)+'</button>').join("")+'</div>';
}
function chip(n,key){
  const beta=key==="langue"&&!LMAIN.includes(n)?" <em>BÊTA</em>":"";
  return '<button class="chip'+(S[key]===n?' on':'')+'" data-k="'+key+'" data-v="'+esc(n)+'">'+esc(n)+beta+'</button>';
}
function body(k){
  if(k==="occ")return opts(OCC,"occ");
  if(k==="par")return '<div class="note"><b>✍️ J\'ai déjà mes paroles</b><br>Elles seront chantées mot pour mot.</div>'+
    '<div class="note soon">✨ L\'IA écrit mes paroles : bientôt</div>'+
    '<input id="titre" class="in" maxlength="60" placeholder="🎵 Titre de ta chanson">'+
    '<textarea id="par" class="in" maxlength="5000" placeholder="[Couplet 1]&#10;...&#10;&#10;[Refrain]&#10;..."></textarea><div class="cnt" id="cnt"></div>';
  if(k==="voi")return opts(VOI,"voix")+'<p class="lab">Accent de la voix</p><div class="chips">'+ACC.map(a=>chip(a,"accent")).join("")+'</div>';
  if(k==="sty")return opts(STY,"style");
  if(k==="amb")return opts(MOOD,"mood");
  if(k==="lan")return '<div class="chips">'+LMAIN.map(n=>chip(n,"langue")).join("")+'</div>'+
    LGRP.map(g=>'<h3>'+g[0]+'</h3><div class="chips">'+g[1].map(n=>chip(n,"langue")).join("")+'</div>').join("");
  if(k==="vit")return opts(SPD,"vitesse");
  const rows=[["Occasion",S.occ],["Titre",S.titre],["Voix",S.voix+" · "+S.accent],["Style",S.style],["Ambiance",S.mood],["Langue",S.langue],["Vitesse",S.vitesse]];
  const loc=!LMAIN.includes(S.langue);
  return '<div class="card">'+rows.map(r=>'<div class="row"><span>'+r[0]+'</span><b>'+esc(r[1])+'</b></div>').join("")+'</div>'+
    (loc?'<p class="warn">Langue locale (BÊTA) : le résultat peut être moins précis. Teste d\'abord avec un court texte.</p>':"");
}
function ok(k){
  if(k==="occ")return !!S.occ;
  if(k==="par")return S.paroles.trim().length>=10&&S.titre.trim().length>0;
  if(k==="voi")return !!S.voix;
  if(k==="sty")return !!S.style;
  if(k==="amb")return !!S.mood;
  return true;
}
function upd(){$("go").disabled=!ok(STEPS[S.step].k)}
function render(){
  const st=STEPS[S.step];
  $("dots").innerHTML=STEPS.map((_,i)=>'<span class="dot'+(i===S.step?" cur":i<S.step?" done":"")+'"></span>').join("");
  $("app").innerHTML='<h1>'+st.t+'</h1><p class="sub">'+st.s+'</p>'+body(st.k);
  if(st.k==="par"){
    const t=$("titre"),p=$("par");t.value=S.titre;p.value=S.paroles;
    const c=()=>{S.titre=t.value;S.paroles=p.value;$("cnt").textContent=p.value.length+" / 5000 caractères";upd()};
    t.oninput=c;p.oninput=c;c();
  }
  $("go").textContent=st.k==="fin"?"Créer ma chanson 🎶":"Continuer ›";
  $("go").style.display="";
  $("msg").textContent="";
  upd();window.scrollTo(0,0);
}
$("app").addEventListener("click",e=>{
  const b=e.target.closest("[data-k]");if(!b)return;
  S[b.dataset.k]=b.dataset.v;
  document.querySelectorAll('[data-k="'+b.dataset.k+'"]').forEach(x=>x.classList.toggle("on",x===b));
  upd();
});
$("go").onclick=()=>{if(STEPS[S.step].k==="fin")return generate();S.step++;render()};
$("back").onclick=()=>{if(S.step>0){S.step--;render()}else location.href="studio.html"};
render();
