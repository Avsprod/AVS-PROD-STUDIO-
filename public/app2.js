/* sons */
function init(){
  if(ctx)return;
  ctx=new (window.AudioContext||window.webkitAudioContext)();
  master=ctx.createGain();master.gain.value=.8;master.connect(ctx.destination);
  dest=ctx.createMediaStreamDestination();master.connect(dest);
  noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);
  const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
}
function env(g,t,a,d,p){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(p,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)}
function osc(type,f,t,dur,p,f2,filt){
  const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur*.7);
  env(g,t,.004,dur,p);
  if(filt){const l=ctx.createBiquadFilter();l.type="lowpass";l.frequency.value=filt;o.connect(l).connect(g)}else o.connect(g);
  g.connect(master);o.start(t);o.stop(t+dur+.1);
}
function noise(t,dur,hp,p){
  const s=ctx.createBufferSource();s.buffer=noiseBuf;
  const f=ctx.createBiquadFilter();f.type="highpass";f.frequency.value=hp;
  const g=ctx.createGain();env(g,t,.002,dur,p);
  s.connect(f).connect(g).connect(master);s.start(t);s.stop(t+dur+.05);
}
const V={
  kick:t=>osc("sine",150,t,.35,1,42),
  snare:t=>{noise(t,.18,1200,.5);osc("triangle",190,t,.12,.4)},
  hat:t=>noise(t,.05,7000,.18),
  tam:(t,i)=>{const f=i%2?330:250;osc("sine",f,t,.2,.6,f*.6)},
  bass:(t,i)=>osc("sawtooth",roots[Math.floor(i/4)%4],t,.28,.5,null,350)
};
function mark(i){TRACKS.forEach(([k])=>cells[k].forEach((c,j)=>c.classList.toggle("now",j===i)))}
function tick(){
  while(nextT<ctx.currentTime+.12){
    const i=step%16;
    TRACKS.forEach(([k])=>{if(pat[k][i])V[k](nextT,i)});
    setTimeout(()=>mark(i),Math.max(0,(nextT-ctx.currentTime)*1000));
    nextT+=60/bpm/4;step++;
  }
}
async function play(){
  init();await ctx.resume();
  if(playing)return;
  playing=true;step=0;nextT=ctx.currentTime+.05;timer=setInterval(tick,25);
}
function stop(){
  playing=false;clearInterval(timer);timer=null;
  TRACKS.forEach(([k])=>cells[k].forEach(c=>c.classList.remove("now")));
}
$("play").onclick=play;$("stop").onclick=stop;
$("make").onclick=()=>{
  ["hat","tam"].forEach(k=>{for(let n=0;n<3;n++){const i=Math.floor(Math.random()*16);pat[k][i]=pat[k][i]?0:1}});
  bpm=Math.min(140,Math.max(70,bpm+Math.floor(Math.random()*13)-6));
  roots=roots.slice().sort(()=>Math.random()-.5);
  paint();stop();play();
  $("msg").textContent="Style "+STYLES[cur].n+". Appuie encore pour une autre version.";
};

/* enregistrement */
let rec,chunks=[],micStream=null,micSrc=null,lastBlob=null,lastExt="webm";
$("rec").onclick=async()=>{
  init();await ctx.resume();
  if(typeof MediaRecorder==="undefined"){$("msg").textContent="Ton navigateur ne peut pas enregistrer. Essaie avec Chrome.";return}
  try{
    micStream=await navigator.mediaDevices.getUserMedia({audio:true});
    micSrc=ctx.createMediaStreamSource(micStream);micSrc.connect(dest);
    $("msg").textContent="Enregistrement avec ta voix. Chante !";
  }catch(e){
    micStream=null;micSrc=null;
    $("msg").textContent="Micro refusé : seul le rythme est enregistré. Autorise le micro pour ajouter ta voix.";
  }
  chunks=[];rec=new MediaRecorder(dest.stream);
  rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  rec.onstop=()=>{
    const type=rec.mimeType||"audio/webm";
    lastExt=type.includes("mp4")?"m4a":type.includes("ogg")?"ogg":"webm";
    lastBlob=new Blob(chunks,{type});
    $("out").src=URL.createObjectURL(lastBlob);
    $("result").style.display="block";
    if(micStream)micStream.getTracks().forEach(t=>t.stop());
    if(micSrc)micSrc.disconnect();
    $("msg").textContent="";
  };
  rec.start();$("rec").disabled=true;$("recstop").disabled=false;
  if(!playing)play();
};
$("recstop").onclick=()=>{
  if(rec&&rec.state!=="inactive")rec.stop();
  $("rec").disabled=false;$("recstop").disabled=true;stop();
};
$("save").onclick=()=>{
  if(!lastBlob)return;
  const fr=new FileReader();
  fr.onload=()=>{
    const l=getLib();
    l.unshift({id:Date.now(),title:$("title").value.trim()||"Ma chanson",style:STYLES[cur].n,date:new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"}),url:fr.result,ext:lastExt});
    if(setLib(l)){$("result").style.display="none";$("title").value="";show("lib")}
    else{$("msg").textContent="Mémoire pleine : supprime une ancienne chanson ou télécharge celle-ci."}
  };
  fr.readAsDataURL(lastBlob);
};

setStyle("afrobeat");renderLib();
