const qs=s=>document.querySelector(s);const qsa=s=>Array.from(document.querySelectorAll(s));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const norm=(x,a,b)=>clamp((x-a)/(b-a),0,1);
const denorm=(t,a,b)=>a+t*(b-a);
const TEMPO_MIN=60;const TEMPO_MAX=180;
const pitchNames=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
const RNG=mulberry32(12345);
const GENRES=["pop","rock","hip-hop","r&b","electronic","house","techno","indie","jazz","classical","latin","afrobeat","k-pop","metal","folk"];
const GENRE_PROFILES={
  "pop":{bpm:[95,130],energy:[0.5,0.8],valence:[0.4,0.8],dance:[0.5,0.85]},
  "rock":{bpm:[90,140],energy:[0.6,0.9],valence:[0.3,0.7],dance:[0.4,0.7]},
  "hip-hop":{bpm:[80,110],energy:[0.5,0.8],valence:[0.3,0.6],dance:[0.6,0.9]},
  "r&b":{bpm:[70,105],energy:[0.4,0.7],valence:[0.3,0.6],dance:[0.5,0.8]},
  "electronic":{bpm:[110,150],energy:[0.6,0.95],valence:[0.3,0.8],dance:[0.6,0.95]},
  "house":{bpm:[118,130],energy:[0.6,0.9],valence:[0.4,0.8],dance:[0.7,0.98]},
  "techno":{bpm:[120,140],energy:[0.7,1.0],valence:[0.1,0.5],dance:[0.6,0.95]},
  "indie":{bpm:[85,130],energy:[0.4,0.8],valence:[0.3,0.8],dance:[0.4,0.8]},
  "jazz":{bpm:[70,140],energy:[0.3,0.6],valence:[0.4,0.8],dance:[0.3,0.6]},
  "classical":{bpm:[60,150],energy:[0.1,0.5],valence:[0.3,0.7],dance:[0.1,0.3]},
  "latin":{bpm:[90,130],energy:[0.5,0.85],valence:[0.5,0.9],dance:[0.6,0.95]},
  "afrobeat":{bpm:[95,120],energy:[0.6,0.9],valence:[0.5,0.9],dance:[0.7,0.98]},
  "k-pop":{bpm:[95,135],energy:[0.6,0.9],valence:[0.4,0.8],dance:[0.6,0.9]},
  "metal":{bpm:[110,180],energy:[0.8,1.0],valence:[0.1,0.5],dance:[0.2,0.5]},
  "folk":{bpm:[70,110],energy:[0.2,0.6],valence:[0.4,0.8],dance:[0.3,0.6]}
};
function randRange(r){return lerp(r[0],r[1],RNG())}
function pick(arr){return arr[Math.floor(RNG()*arr.length)]}
function genTracks(n){const tracks=[];for(let i=0;i<n;i++){const g1=pick(GENRES);const g2=pick(GENRES.filter(g=>g!==g1));const p1=GENRE_PROFILES[g1];const p2=GENRE_PROFILES[g2];const mix=t=>lerp(t[0],t[1],RNG());const bpm=Math.round(lerp(randRange(p1.bpm),randRange(p2.bpm),0.5));const energy=clamp(lerp(randRange(p1.energy),randRange(p2.energy),0.5),0,1);const valence=clamp(lerp(randRange(p1.valence),randRange(p2.valence),0.5),0,1);const dance=clamp(lerp(randRange(p1.dance),randRange(p2.dance),0.5),0,1);const acoustic=clamp(1-energy*0.7+RNG()*0.2,0,1);const instr=clamp((g1==="classical"||g1==="techno"||g1==="house"||g1==="electronic")?0.4+RNG()*0.5:RNG()*0.4,0,1);const key=Math.floor(RNG()*12);const mode=RNG()<0.6?1:0;tracks.push({id:`t${i}`,name:`Track ${String.fromCharCode(65+(i%26))}${Math.floor(i/26)+1}`,artists:[`Artist ${1+(i%17)}`],genres:[g1,g2],features:{energy,valence,danceability:dance,acousticness:acoustic,instrumentalness:instr,tempo:bpm,key,mode}})}return tracks}
let DATA=[];
let LAST_SEQ=[];
let MODE="session";

function setMode(m){
  MODE=m;
  const sBtn=qs("#tabSession"), dBtn=qs("#tabDemo");
  if(sBtn&&dBtn){
    sBtn.classList.toggle("active", m==="session");
    dBtn.classList.toggle("active", m==="demo");
  }
  qsa("[data-session-only]").forEach(el=>{el.style.display=m==="session"?"":"none"});
  qsa("[data-demo-only]").forEach(el=>{el.style.display=m==="demo"?"":"none"});
}
function initGenres(){const host=qs("#genres");host.innerHTML="";const set=new Set();DATA.forEach(t=>t.genres.forEach(g=>set.add(g)));const list=Array.from(set).sort();list.forEach(g=>{const lab=document.createElement("label");lab.className="chip";const cb=document.createElement("input");cb.type="checkbox";cb.value=g;lab.appendChild(cb);const span=document.createElement("span");span.textContent=g;lab.appendChild(span);host.appendChild(lab)})}
function getSelectedGenres(){return qsa("#genres input:checked").map(i=>i.value)}
function val(id){return parseFloat(qs(`#${id}`).value)}
function updateDisplays(){qs("#energyVal").textContent=val("energy").toFixed(2);qs("#tempoVal").textContent=String(Math.round(val("tempo")));const tb=qs("#tempoBias");if(tb){qs("#tempoBiasVal").textContent=val("tempoBias").toFixed(2)}qs("#valenceVal").textContent=val("valence").toFixed(2);qs("#danceabilityVal").textContent=val("danceability").toFixed(2);qs("#acousticnessVal").textContent=val("acousticness").toFixed(2);qs("#instrumentalnessVal").textContent=val("instrumentalness").toFixed(2);if(qs("#genreWeight"))qs("#genreWeightVal").textContent=val("genreWeight").toFixed(2);qs("#lengthVal").textContent=String(Math.round(val("length")))}
function tempoScale(){return qs("#tempoBias")?val("tempoBias"):1}
function targetVector(){const e=val("energy"),v=val("valence"),d=val("danceability"),a=val("acousticness"),i=val("instrumentalness"),t=norm(val("tempo"),TEMPO_MIN,TEMPO_MAX)*tempoScale();return [e,v,d,a,i,t]}
function trackVector(tr){const f=tr.features;return [f.energy,f.valence,f.danceability,f.acousticness,f.instrumentalness,norm(f.tempo,TEMPO_MIN,TEMPO_MAX)*tempoScale()]}
function dot(a,b){let s=0;for(let i=0;i<a.length;i++)s+=a[i]*b[i];return s}
function mag(a){return Math.sqrt(dot(a,a))}
function cosine(a,b){const m=mag(a)*mag(b);return m===0?0:dot(a,b)/m}
function jaccard(a,b){const A=new Set(a),B=new Set(b);let inter=0;A.forEach(x=>{if(B.has(x))inter++});return (inter)/(A.size+B.size-inter||1)}

function libraryMeanVector(tracks){
  const sum=[0,0,0,0,0,0]; let n=0;
  tracks.forEach(t=>{const v=trackVector(t);for(let i=0;i<6;i++)sum[i]+=v[i];n++});
  if(n===0) return null;
  return sum.map(x=>x/n);
}
function aiAdjustedTarget(base){
  const hasTok=!!accessToken();
  if(!hasTok||!DATA||!DATA.length) return base;
  const lib=libraryMeanVector(DATA);
  if(!lib) return base;
  const alpha=0.5;
  const out=[];for(let i=0;i<6;i++) out[i]=(1-alpha)*base[i]+alpha*lib[i];
  return out;
}
function energyArc(n,start){const arr=[];for(let i=0;i<n;i++){const t=i/(n-1||1);let e;if(t<0.5){e=lerp(start,0.85,t/0.5)}else if(t<0.8){e=lerp(0.85,0.6,(t-0.5)/0.3)}else{e=lerp(0.6,0.95,(t-0.8)/0.2)}arr.push(clamp(e,0,1))}return arr}
function keyCost(a,b){if(a.key===b.key&&a.mode===b.mode)return 0;if(a.key===b.key&&a.mode!==b.mode)return 0.25;const diff=(b.key-a.key+12)%12;if(diff===7||diff===5)return 0.25;if(diff===2||diff===10)return 0.4;return 1}
function transCost(prev,next){const de=Math.abs(prev.energy-next.energy);const dt=Math.abs(prev.tempo-next.tempo)/60;const k=keyCost(prev,next);return clamp(0.5*de+0.3*dt+0.2*k,0,1)}
// Enhanced replay value and DJ mixing analysis
function calculateReplayValue(track) {
  const f = track.features;
  
  // Popularity factors (higher is better for replay)
  const danceabilityScore = f.danceability * 1.2; // Very important for replay
  const energyScore = f.energy * 0.8; // Moderate importance
  const valenceScore = f.valence * 1.0; // Positive mood = more replay
  const tempoStability = Math.abs(f.tempo - 120) < 20 ? 1.0 : 0.7; // Near 120 BPM is ideal
  
  // Audio quality factors
  const acousticBalance = 1 - Math.abs(f.acousticness - 0.3); // Balanced acoustic vs electronic
  const instrumentalBalance = 1 - Math.abs(f.instrumentalness - 0.2); // Some vocals preferred
  
  // Combined replay score (0-1 scale)
  const replayScore = (
    danceabilityScore * 0.3 +
    energyScore * 0.2 +
    valenceScore * 0.2 +
    tempoStability * 0.1 +
    acousticBalance * 0.1 +
    instrumentalBalance * 0.1
  );
  
  return clamp(replayScore, 0, 1);
}

// DJ mixing compatibility analysis
function calculateMixCompatibility(prevTrack, nextTrack) {
  const prev = prevTrack.features;
  const next = nextTrack.features;
  
  // Beat matching compatibility (tempo difference)
  const tempoDiff = Math.abs(prev.tempo - next.tempo);
  const tempoMatch = Math.exp(-tempoDiff / 20); // Exponential decay
  
  // Key compatibility (harmonic mixing)
  const keyComp = 1 - keyCost(prev, next);
  
  // Energy transition smoothness
  const energyDiff = Math.abs(prev.energy - next.energy);
  const energySmoothness = 1 - energyDiff * 0.8; // Allow some energy variation
  
  // Danceability continuity
  const danceContinuity = 1 - Math.abs(prev.danceability - next.danceability) * 0.5;
  
  // Overall mix score (0-1, higher = better mix)
  const mixScore = (
    tempoMatch * 0.4 +      // Most important: beat matching
    keyComp * 0.3 +        // Harmonic compatibility
    energySmoothness * 0.2 + // Energy flow
    danceContinuity * 0.1    // Dance continuity
  );
  
  return clamp(mixScore, 0, 1);
}

// Party energy curve optimization
function optimizePartyEnergyArc(length, startEnergy) {
  const arc = [];
  
  // Party energy curve: build up, peak, sustain, wind down
  for (let i = 0; i < length; i++) {
    const progress = i / (length - 1);
    let energy;
    
    if (progress < 0.3) {
      // Building up phase (0-30%)
      energy = lerp(startEnergy, 0.8, progress / 0.3);
    } else if (progress < 0.6) {
      // Peak energy phase (30-60%)
      energy = lerp(0.8, 0.9, (progress - 0.3) / 0.3);
    } else if (progress < 0.85) {
      // Sustained high energy (60-85%)
      energy = lerp(0.9, 0.85, (progress - 0.6) / 0.25);
    } else {
      // Wind down phase (85-100%)
      energy = lerp(0.85, 0.7, (progress - 0.85) / 0.15);
    }
    
    arc.push(clamp(energy, 0, 1));
  }
  
  return arc;
}

function buildPlaylist(){
  const baseT = targetVector();
  const tg = MODE === "session" ? aiAdjustedTarget(baseT) : baseT;
  const selG = getSelectedGenres();
  const gw = qs("#genreWeight") ? val("genreWeight") : 0.3;
  const mw = 1 - gw;
  
  // Score tracks with enhanced AI algorithm
  const base = DATA.map(tr => {
    const vec = trackVector(tr);
    const mood = cosine(vec, tg);
    const g = selG.length ? jaccard(tr.genres, selG) : 0.5;
    const replay = calculateReplayValue(tr);
    
    // Combined score: mood + genre + replay value
    const score = (
      mood * mw * 0.6 +      // Mood matching (60% of mood weight)
      g * gw * 0.6 +         // Genre matching (60% of genre weight)
      replay * 0.4           // Replay value (40% overall)
    );
    
    return {tr, score, replay};
  }).sort((a, b) => b.score - a.score);
  
  const length = Math.round(val("length"));
  const pool = base.slice(0, Math.min(base.length, Math.max(length * 3, 50))).map(x => x.tr);
  
  // Use party-optimized energy arc
  const arc = optimizePartyEnergyArc(length, val("energy"));
  
  let seq = [];
  let remaining = new Set(pool.map(t => t.id));
  
  // Start with high replay value track that matches initial energy
  let startCand = [...pool]
    .sort((a, b) => {
      const aReplay = calculateReplayValue(a);
      const bReplay = calculateReplayValue(b);
      const aEnergyDiff = Math.abs(a.features.energy - arc[0]);
      const bEnergyDiff = Math.abs(b.features.energy - arc[0]);
      
      // Prioritize replay value with energy matching
      return (bReplay - aReplay) || (aEnergyDiff - bEnergyDiff);
    })[0] || pool[0];
  
  seq.push(startCand);
  remaining.delete(startCand.id);
  
  // Build sequence with DJ mixing optimization
  for (let i = 1; i < length; i++) {
    let best = null;
    let bestScore = -1e9;
    const prev = seq[seq.length - 1];
    
    pool.forEach(t => {
      if (!remaining.has(t.id)) return;
      
      const vecScore = cosine(trackVector(t), tg);
      const gScore = selG.length ? jaccard(t.genres, selG) : 0.5;
      const replayScore = calculateReplayValue(t);
      const mixScore = calculateMixCompatibility(prev, t);
      const arcMatch = 1 - Math.abs(t.features.energy - arc[i]);
      
      // Comprehensive scoring with DJ mixing emphasis
      const score = (
        vecScore * mw * 0.4 +          // Mood matching
        gScore * gw * 0.3 +           // Genre matching
        replayScore * 0.2 +           // Replay value
        mixScore * 0.6 +              // DJ mixing compatibility (most important)
        arcMatch * 0.3                // Energy arc matching
      );
      
      if (score > bestScore) {
        bestScore = score;
        best = t;
      }
    });
    
    if (!best) break;
    seq.push(best);
    remaining.delete(best.id);
  }
  
  LAST_SEQ = seq;
  render(seq, arc);
  return seq;
}
function render(seq,arc){const list=qs("#playlist");list.innerHTML="";seq.forEach((t,idx)=>{const li=document.createElement("li");const left=document.createElement("div");left.textContent=`${t.artists[0]} – ${t.name}`;const right=document.createElement("div");right.className="meta";right.textContent=`${t.genres.join(", ")} | E ${t.features.energy.toFixed(2)} | ${t.features.tempo} BPM | ${pitchNames[t.features.key]} ${t.features.mode? "maj":"min"}`;li.appendChild(left);li.appendChild(right);list.appendChild(li)});const avgTempo=Math.round(seq.reduce((s,t)=>s+t.features.tempo,0)/(seq.length||1));const avgEnergy=(seq.reduce((s,t)=>s+t.features.energy,0)/(seq.length||1)).toFixed(2);qs("#summary").textContent=`${seq.length} tracks • Avg tempo ${avgTempo} BPM • Avg energy ${avgEnergy}`;drawViz(seq,arc)}
function drawViz(seq,arc){const c=qs("#viz");const ctx=c.getContext("2d");ctx.clearRect(0,0,c.width,c.height);const W=c.width,H=c.height;const pad=40;const plotW=W-pad*2,plotH=H-pad*2;ctx.strokeStyle="#1b2430";ctx.lineWidth=1;for(let i=0;i<=10;i++){const y=pad+i*(plotH/10);ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(W-pad,y);ctx.stroke()}ctx.strokeStyle="#1b2430";ctx.beginPath();ctx.moveTo(pad,H-pad);ctx.lineTo(W-pad,H-pad);ctx.stroke();if(seq.length===0)return;function x(i){return pad+i*(plotW/Math.max(seq.length-1,1))}function yEnergy(e){return pad+(1-e)*plotH}function yTempo(bpm){return pad+(1-norm(bpm,TEMPO_MIN,TEMPO_MAX))*plotH}ctx.strokeStyle="#2f855a";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x(0),yEnergy(seq[0].features.energy));for(let i=1;i<seq.length;i++){ctx.lineTo(x(i),yEnergy(seq[i].features.energy))}ctx.stroke();ctx.strokeStyle="#3182ce";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x(0),yTempo(seq[0].features.tempo));for(let i=1;i<seq.length;i++){ctx.lineTo(x(i),yTempo(seq[i].features.tempo))}ctx.stroke();ctx.strokeStyle="#9b2c2c";ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x(0),yEnergy(arc[0]||0));for(let i=1;i<arc.length;i++){ctx.lineTo(x(i),yEnergy(arc[i]))}ctx.stroke();ctx.setLineDash([]);ctx.fillStyle="#c8d1dc";ctx.font="12px Inter, sans-serif";ctx.fillText("Energy",pad+6,pad+12);ctx.fillStyle="#9aa6b2";ctx.fillText("Tempo",pad+66,pad+12)}

const SPOTIFY_CLIENT_ID=localStorage.getItem("sp_client_id")||"YOUR_SPOTIFY_CLIENT_ID";
function redirectUri(){
  const ov=localStorage.getItem("sp_redirect");
  if(ov && /^https?:\/\//i.test(ov)) return ov.endsWith("/")?ov:ov+"/";
  const o=window.location.origin||"";
  if(/^https?:/i.test(o)) return o.endsWith("/")?o:o+"/";
  return "http://localhost:3000/";
}
function b64url(buf){let s=btoa(String.fromCharCode.apply(null,new Uint8Array(buf)));return s.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
async function sha256Buf(s){const enc=new TextEncoder().encode(s);const hash=await crypto.subtle.digest("SHA-256",enc);return new Uint8Array(hash)}
async function startLogin(){const verifier=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b=>("0"+b.toString(16)).slice(-2)).join("");const chBuf=await sha256Buf(verifier);const challenge=b64url(chBuf);localStorage.setItem("sp_verifier",verifier);const scope=[
  "user-library-read",
  "playlist-modify-public",
  "playlist-modify-private", 
  "user-read-email",
  "user-read-private",
  "streaming",                    // Required for Web Playback SDK
  "user-read-playback-state",     // Required for playback control
  "user-modify-playback-state",   // Required for play/pause
  "user-read-currently-playing",  // See what's playing
  "app-remote-control",           // Full remote control
  "user-read-recently-played",    // Access listening history
  "user-top-read"                 // Access top tracks/artists
].join(" ");const url=new URL("https://accounts.spotify.com/authorize");url.searchParams.set("response_type","code");url.searchParams.set("client_id",SPOTIFY_CLIENT_ID);url.searchParams.set("scope",scope);url.searchParams.set("redirect_uri",redirectUri());url.searchParams.set("code_challenge_method","S256");url.searchParams.set("code_challenge",challenge);window.location.href=url.toString()}
async function exchangeCode(code){const verifier=localStorage.getItem("sp_verifier")||"";const body=new URLSearchParams();body.set("client_id",SPOTIFY_CLIENT_ID);body.set("grant_type","authorization_code");body.set("code",code);body.set("redirect_uri",redirectUri());body.set("code_verifier",verifier);const res=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});if(!res.ok)return null;const tok=await res.json();const now=Math.floor(Date.now()/1000);localStorage.setItem("sp_access",tok.access_token);localStorage.setItem("sp_refresh",tok.refresh_token||"");localStorage.setItem("sp_exp",String(now+tok.expires_in-30));return tok.access_token}
function accessToken(){const exp=parseInt(localStorage.getItem("sp_exp")||"0",10);const now=Math.floor(Date.now()/1000);const t=localStorage.getItem("sp_access");if(!t||now>=exp)return null;return t}
async function handleAuthOnLoad(){
  const u=new URL(window.location.href);
  const code=u.searchParams.get("code");
  if(code){
    await exchangeCode(code);
    u.searchParams.delete("code");u.searchParams.delete("state");
    history.replaceState({},document.title,u.toString())
  }
  const t=accessToken();
  qs("#authStatus").textContent=t?"Spotify connected":"Not connected";
  // Hide server-only buttons on hosted environments
  if(location.hostname!=="localhost"&&location.hostname!=="127.0.0.1"){
    if(qs("#saveDB"))qs("#saveDB").style.display="none";
    if(qs("#loadDB"))qs("#loadDB").style.display="none";
  }
  if(t){
    if(qs("#loginSpotify"))qs("#loginSpotify").style.display="none";
    if(qs("#fetchLibrary"))qs("#fetchLibrary").style.display="none";
    setMode("session");
    // Auto-ingest and build if we don't have data yet
    if(!DATA || DATA.length===0){
      try{
        const tracks=await fetchSavedTracks();
        DATA=tracks;initGenres();updateDisplays();buildPlaylist();
      }catch(e){}
    }
  }else{
    setMode("demo");
  }
}
async function apiFetch(url){const t=accessToken();if(!t)throw new Error("no_token");const res=await fetch(url,{headers:{Authorization:`Bearer ${t}`}});if(!res.ok)throw new Error("spotify_error");return res.json()}
function metaCluster(gen){const s=gen.join(" ").toLowerCase();if(/hip hop|rap|trap/.test(s))return "hip-hop";if(/house|techno|edm|electronic|dance/.test(s))return "electronic";if(/indie|alt/.test(s))return "indie";if(/rock|punk|metal/.test(s))return "rock";if(/r&b|rnb|soul/.test(s))return "r&b";if(/ambient|chill|downtempo|new age/.test(s))return "ambient";if(/pop|k-pop/.test(s))return "pop";return "pop"}
async function fetchSavedTracks(){let items=[];let url="https://api.spotify.com/v1/me/tracks?limit=50";for(let i=0;i<6;i++){const data=await apiFetch(url);items=items.concat(data.items||[]);const next=data.next;if(!next)break;url=next}const trackIds=items.map(it=>it.track?.id).filter(Boolean);const artistIds=Array.from(new Set(items.flatMap(it=>(it.track?.artists||[]).map(a=>a.id)).filter(Boolean)));const feats=await fetchAudioFeatures(trackIds);const artists=await fetchArtists(artistIds);const mapArtistGenres=id=>artists.get(id)||[];const tracks=[];items.forEach(it=>{const tr=it.track;if(!tr)return;const f=feats.get(tr.id);if(!f)return;const aIds=tr.artists.map(a=>a.id);const gRaw=Array.from(new Set(aIds.flatMap(mapArtistGenres)));const mc=metaCluster(gRaw);const genres=[mc].concat(gRaw.slice(0,2));tracks.push({id:tr.id,name:tr.name,artists:tr.artists.map(a=>a.name),genres,features:{energy:f.energy,valence:f.valence,danceability:f.danceability,acousticness:f.acousticness,instrumentalness:f.instrumentalness,tempo:Math.round(f.tempo),key:f.key,mode:f.mode}})});return tracks}
async function fetchAudioFeatures(ids){const out=new Map();for(let i=0;i<ids.length;i+=100){const chunk=ids.slice(i,i+100);const data=await apiFetch("https://api.spotify.com/v1/audio-features?ids="+encodeURIComponent(chunk.join(",")));(data.audio_features||[]).forEach(f=>{if(f&&f.id)out.set(f.id,f)})}return out}
async function fetchArtists(ids){const out=new Map();for(let i=0;i<ids.length;i+=50){const chunk=ids.slice(i,i+50);const data=await apiFetch("https://api.spotify.com/v1/artists?ids="+encodeURIComponent(chunk.join(",")));(data.artists||[]).forEach(a=>{if(a&&a.id)out.set(a.id,a.genres||[])})}return out}
async function saveToDB(tracks){try{const res=await fetch("/api/tracks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tracks})});return await res.json()}catch(e){return null}}
async function loadFromDB(){try{const res=await fetch("/api/tracks");const j=await res.json();return j.tracks||[]}catch(e){return []}}

async function me(){return apiFetch("https://api.spotify.com/v1/me")}
async function createPlaylist(name,desc,uid){const data=await fetch(`https://api.spotify.com/v1/users/${encodeURIComponent(uid)}/playlists`,{method:"POST",headers:{Authorization:`Bearer ${accessToken()}`,"Content-Type":"application/json"},body:JSON.stringify({name,description:desc,public:false})});if(!data.ok)throw new Error("create_failed");return data.json()}
async function addTracks(pid,uris){for(let i=0;i<uris.length;i+=100){const chunk=uris.slice(i,i+100);const r=await fetch(`https://api.spotify.com/v1/playlists/${encodeURIComponent(pid)}/tracks`,{method:"POST",headers:{Authorization:`Bearer ${accessToken()}`,"Content-Type":"application/json"},body:JSON.stringify({uris:chunk})});if(!r.ok)throw new Error("add_failed")}}
function seqUris(){const re=/^[A-Za-z0-9]{22}$/;return LAST_SEQ.filter(t=>re.test(t.id)).map(t=>"spotify:track:"+t.id)}
async function exportPlaylist(){try{const t=accessToken();if(!t){qs("#authStatus").textContent="Not connected to Spotify";return}if(!LAST_SEQ.length){qs("#authStatus").textContent="No playlist built";return}const uris=seqUris();if(!uris.length){qs("#authStatus").textContent="No Spotify tracks to export";return}qs("#authStatus").textContent="Creating playlist...";const prof=await me();const name=(qs("#playlistName")&&qs("#playlistName").value)||"AI DJ Session";const desc="Generated by AI Playlist DJ";const pl=await createPlaylist(name,desc,prof.id);await addTracks(pl.id,uris);qs("#authStatus").textContent=`Exported to ${pl.name}`;}catch(e){qs("#authStatus").textContent="Export failed"}}

function setupUI(){
  ["energy","tempo","tempoBias","valence","danceability","acousticness","instrumentalness","genreWeight","length"].forEach(id=>{if(qs(`#${id}`))qs(`#${id}`).addEventListener("input",updateDisplays)});
  qs("#build").addEventListener("click",buildPlaylist);
  if(qs("#loadDemo"))qs("#loadDemo").addEventListener("click",()=>{DATA=genTracks(120);initGenres();updateDisplays();buildPlaylist()});
  if(qs("#loginSpotify"))qs("#loginSpotify").addEventListener("click",startLogin);
  if(qs("#fetchLibrary"))qs("#fetchLibrary").addEventListener("click",async()=>{const t=await fetchSavedTracks();DATA=t;initGenres();updateDisplays();buildPlaylist()});
  if(qs("#saveDB"))qs("#saveDB").addEventListener("click",async()=>{const r=await saveToDB(DATA);qs("#authStatus").textContent=r&&r.ok?`Saved ${r.count}`:"Save failed"});
  if(qs("#loadDB"))qs("#loadDB").addEventListener("click",async()=>{const t=await loadFromDB();DATA=t;initGenres();updateDisplays();buildPlaylist()});
  if(qs("#tabSession"))qs("#tabSession").addEventListener("click",()=>{setMode("session")});
  if(qs("#tabDemo"))qs("#tabDemo").addEventListener("click",()=>{setMode("demo"); if(!DATA.length){DATA=genTracks(120);initGenres();updateDisplays()} buildPlaylist()});
  
  // Add share playlist button if it doesn't exist
  if (!qs("#sharePlaylist")) {
    const shareBtn = document.createElement("button");
    shareBtn.id = "sharePlaylist";
    shareBtn.textContent = "Share Playlist";
    shareBtn.style.marginLeft = "8px";
    shareBtn.style.padding = "8px 16px";
    shareBtn.style.background = "#3182ce";
    shareBtn.style.color = "white";
    shareBtn.style.border = "none";
    shareBtn.style.borderRadius = "6px";
    shareBtn.style.cursor = "pointer";
    
    const actionsPanel = qs(".panel .actions");
    if (actionsPanel) {
      actionsPanel.appendChild(shareBtn);
    }
    
    shareBtn.addEventListener("click", generateShareLink);
  }
  
  updateDisplays()
}
// Search functionality
let SEARCH_RESULTS = [];

// Music playback functionality
let player = null;
let currentTrack = null;
let isPlaying = false;
let deviceId = null;

function showSearchModal() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Search Spotify Tracks</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="search-input">
          <input type="text" id="searchQuery" placeholder="Search for tracks, artists, or genres..." />
          <button id="searchButton">Search</button>
        </div>
        <div id="searchResults" class="search-results"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    .modal {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: #0c1117;
      border: 1px solid #1b2430;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow: hidden;
    }
    .modal-header {
      padding: 16px;
      border-bottom: 1px solid #1b2430;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 {
      margin: 0;
      color: #e6eaf0;
    }
    .modal-close {
      background: none;
      border: none;
      color: #e6eaf0;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
    }
    .modal-body {
      padding: 16px;
    }
    .search-input {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    #searchQuery {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #1b2430;
      border-radius: 6px;
      background: #1b2430;
      color: #e6eaf0;
    }
    #searchButton {
      padding: 8px 16px;
      background: #2f855a;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .search-results {
      max-height: 400px;
      overflow-y: auto;
    }
    .search-result {
      display: flex;
      align-items: center;
      padding: 12px;
      border-bottom: 1px solid #1b2430;
      cursor: pointer;
    }
    .search-result:hover {
      background: #1b2430;
    }
    .search-result img {
      width: 50px;
      height: 50px;
      border-radius: 4px;
      margin-right: 12px;
    }
    .search-result-info {
      flex: 1;
    }
    .search-result-name {
      color: #e6eaf0;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .search-result-artist {
      color: #9aa6b2;
      font-size: 14px;
    }
    .add-track-btn {
      background: #2f855a;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 12px;
    }
    .add-track-btn:disabled {
      background: #666;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);
  
  // Event listeners
  modal.querySelector(".modal-close").addEventListener("click", () => {
    document.body.removeChild(modal);
    document.head.removeChild(style);
  });
  
  modal.querySelector("#searchButton").addEventListener("click", async () => {
    const query = modal.querySelector("#searchQuery").value.trim();
    if (query) {
      await performSearch(query, modal.querySelector("#searchResults"));
    }
  });
  
  modal.querySelector("#searchQuery").addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const query = modal.querySelector("#searchQuery").value.trim();
      if (query) {
        await performSearch(query, modal.querySelector("#searchResults"));
      }
    }
  });
}

async function performSearch(query, resultsContainer) {
  resultsContainer.innerHTML = "<div style='padding: 20px; text-align: center; color: #9aa6b2;'>Searching...</div>";
  
  try {
    const token = accessToken();
    if (!token) {
      resultsContainer.innerHTML = "<div style='padding: 20px; text-align: center; color: #e74c3c;'>Please connect to Spotify first</div>";
      return;
    }
    
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error("Search failed");
    
    const data = await response.json();
    SEARCH_RESULTS = data.tracks?.items || [];
    
    if (SEARCH_RESULTS.length === 0) {
      resultsContainer.innerHTML = "<div style='padding: 20px; text-align: center; color: #9aa6b2;'>No results found</div>";
      return;
    }
    
    resultsContainer.innerHTML = '';
    SEARCH_RESULTS.forEach(track => {
      const resultDiv = document.createElement("div");
      resultDiv.className = "search-result";
      resultDiv.innerHTML = `
        <img src="${track.album.images[0]?.url || ''}" alt="${track.name}" />
        <div class="search-result-info">
          <div class="search-result-name">${track.name}</div>
          <div class="search-result-artist">${track.artists.map(a => a.name).join(', ')}</div>
        </div>
        <button class="add-track-btn" data-track-id="${track.id}">Add to Library</button>
      `;
      
      const addButton = resultDiv.querySelector(".add-track-btn");
      addButton.addEventListener("click", async () => {
        addButton.disabled = true;
        addButton.textContent = "Adding...";
        
        try {
          await addTrackToLibrary(track);
          addButton.textContent = "Added ✓";
          setTimeout(() => {
            addButton.textContent = "Add to Library";
            addButton.disabled = false;
          }, 2000);
        } catch (error) {
          addButton.textContent = "Failed";
          setTimeout(() => {
            addButton.textContent = "Add to Library";
            addButton.disabled = false;
          }, 2000);
        }
      });
      
      resultsContainer.appendChild(resultDiv);
    });
    
  } catch (error) {
    resultsContainer.innerHTML = "<div style='padding: 20px; text-align: center; color: #e74c3c;'>Search failed. Please try again.</div>";
  }
}

async function addTrackToLibrary(track) {
  const token = accessToken();
  if (!token) throw new Error("No access token");
  
  // First, get audio features for the track
  const features = await fetchAudioFeatures([track.id]);
  const audioFeatures = features.get(track.id);
  
  if (!audioFeatures) throw new Error("Could not get audio features");
  
  // Get artist genres
  const artistIds = track.artists.map(a => a.id);
  const artists = await fetchArtists(artistIds);
  
  const genres = Array.from(new Set(artistIds.flatMap(id => artists.get(id) || [])));
  const meta = metaCluster(genres);
  
  const newTrack = {
    id: track.id,
    name: track.name,
    artists: track.artists.map(a => a.name),
    genres: [meta].concat(genres.slice(0, 2)),
    features: {
      energy: audioFeatures.energy,
      valence: audioFeatures.valence,
      danceability: audioFeatures.danceability,
      acousticness: audioFeatures.acousticness,
      instrumentalness: audioFeatures.instrumentalness,
      tempo: Math.round(audioFeatures.tempo),
      key: audioFeatures.key,
      mode: audioFeatures.mode
    }
  };
  
  // Add to DATA array
  DATA.push(newTrack);
  
  // Update genres and rebuild playlist
  initGenres();
  updateDisplays();
  buildPlaylist();
}

// Shareable playlist link generation
function generateShareLink() {
  if (!LAST_SEQ || LAST_SEQ.length === 0) {
    alert("Please build a playlist first!");
    return;
  }
  
  // Create shareable data object
  const shareData = {
    tracks: LAST_SEQ.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists,
      genres: track.genres,
      features: track.features
    })),
    target: targetVector(),
    settings: {
      energy: val("energy"),
      tempo: val("tempo"),
      valence: val("valence"),
      danceability: val("danceability"),
      length: val("length")
    }
  };
  
  // Convert to base64 for URL sharing
  const jsonString = JSON.stringify(shareData);
  const base64Data = btoa(encodeURIComponent(jsonString));
  
  // Create shareable URL
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?playlist=${base64Data}`;
  
  // Create share modal
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h3>Share Your Playlist</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <p style="color: #e6eaf0; margin-bottom: 16px;">Copy this link to share your playlist:</p>
        <div class="share-input">
          <input type="text" id="shareUrl" value="${shareUrl}" readonly style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #1b2430; background: #1b2430; color: #e6eaf0; margin-bottom: 12px;">
          <button id="copyShareLink" style="padding: 8px 16px; background: #3182ce; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%;">Copy Link</button>
        </div>
        <div id="copyStatus" style="color: #2f855a; text-align: center; margin-top: 8px; font-size: 14px;"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listeners
  modal.querySelector(".modal-close").addEventListener("click", () => {
    document.body.removeChild(modal);
  });
  
  modal.querySelector("#copyShareLink").addEventListener("click", () => {
    const input = modal.querySelector("#shareUrl");
    input.select();
    document.execCommand("copy");
    
    const status = modal.querySelector("#copyStatus");
    status.textContent = "Link copied to clipboard!";
    
    setTimeout(() => {
      status.textContent = "";
    }, 2000);
  });
}

// Load shared playlist from URL
function loadSharedPlaylist() {
  const urlParams = new URLSearchParams(window.location.search);
  const playlistData = urlParams.get("playlist");
  
  if (playlistData) {
    try {
      const decodedData = decodeURIComponent(atob(playlistData));
      const sharedData = JSON.parse(decodedData);
      
      // Load the shared playlist
      DATA = sharedData.tracks;
      
      // Set the sliders to match the shared settings
      if (sharedData.settings) {
        const settings = sharedData.settings;
        if (qs("#energy")) qs("#energy").value = settings.energy;
        if (qs("#tempo")) qs("#tempo").value = settings.tempo;
        if (qs("#valence")) qs("#valence").value = settings.valence;
        if (qs("#danceability")) qs("#danceability").value = settings.danceability;
        if (qs("#length")) qs("#length").value = settings.length;
      }
      
      // Update UI and build playlist
      initGenres();
      updateDisplays();
      buildPlaylist();
      
      // Remove the playlist parameter from URL
      const url = new URL(window.location);
      url.searchParams.delete("playlist");
      window.history.replaceState({}, document.title, url);
      
    } catch (error) {
      console.error("Error loading shared playlist:", error);
    }
  }
}

// Update setupUI to handle search button
document.addEventListener("click", e => {
  if (e.target && e.target.id === "exportSpotify") {
    exportPlaylist();
  }
  if (e.target && e.target.id === "searchTracks") {
    showSearchModal();
  }
  if (e.target && e.target.id === "sharePlaylist") {
    generateShareLink();
  }
});

// Spotify Web Playback SDK initialization
function initializePlayer() {
  if (!accessToken()) return;
  
  // Load Spotify Web Playback SDK
  const script = document.createElement("script");
  script.src = "https://sdk.scdn.co/spotify-player.js";
  script.async = true;
  document.body.appendChild(script);
  
  window.onSpotifyWebPlaybackSDKReady = () => {
    player = new Spotify.Player({
      name: 'AI Playlist DJ',
      getOAuthToken: cb => { cb(accessToken()); },
      volume: 0.5
    });
    
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      deviceId = device_id;
    });
    
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });
    
    player.addListener('player_state_changed', (state) => {
      if (!state) return;
      
      isPlaying = !state.paused;
      currentTrack = state.track_window.current_track;
      
      // Update UI with current playback state
      updatePlaybackUI();
    });
    
    player.connect();
  };
}

// Play a track
async function playTrack(trackId) {
  if (!accessToken() || !deviceId) {
    console.error("Not connected to Spotify or device not ready");
    return;
  }
  
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({
        uris: [`spotify:track:${trackId}`]
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Playback failed');
    }
    
    currentTrack = trackId;
    isPlaying = true;
    updatePlaybackUI();
    
  } catch (error) {
    console.error('Error playing track:', error);
  }
}

// Toggle play/pause
async function togglePlayback() {
  if (!accessToken() || !deviceId) return;
  
  try {
    if (isPlaying) {
      await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken()}`
        }
      });
      isPlaying = false;
    } else {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken()}`
        }
      });
      isPlaying = true;
    }
    updatePlaybackUI();
  } catch (error) {
    console.error('Error toggling playback:', error);
  }
}

// Update playback UI
function updatePlaybackUI() {
  const playButtons = document.querySelectorAll('.play-track-btn');
  playButtons.forEach(btn => {
    const trackId = btn.getAttribute('data-track-id');
    if (trackId === currentTrack?.id) {
      btn.textContent = isPlaying ? '⏸️' : '▶️';
      btn.classList.add('playing');
    } else {
      btn.textContent = '▶️';
      btn.classList.remove('playing');
    }
  });
}

// Add playback controls to playlist items
function addPlaybackControls() {
  const playlistItems = document.querySelectorAll('#playlist li');
  playlistItems.forEach((item, index) => {
    if (!item.querySelector('.play-track-btn')) {
      const playButton = document.createElement('button');
      playButton.className = 'play-track-btn';
      playButton.setAttribute('data-track-id', LAST_SEQ[index]?.id);
      playButton.textContent = '▶️';
      playButton.style.marginLeft = '10px';
      playButton.style.padding = '4px 8px';
      playButton.style.borderRadius = '4px';
      playButton.style.border = '1px solid #2f855a';
      playButton.style.background = 'transparent';
      playButton.style.color = '#2f855a';
      playButton.style.cursor = 'pointer';
      
      playButton.addEventListener('click', () => {
        const trackId = LAST_SEQ[index]?.id;
        if (trackId) {
          playTrack(trackId);
        }
      });
      
      item.appendChild(playButton);
    }
  });
}

// Add global playback controls
function addGlobalPlaybackControls() {
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'playback-controls';
  controlsDiv.style.position = 'fixed';
  controlsDiv.style.bottom = '20px';
  controlsDiv.style.right = '20px';
  controlsDiv.style.background = '#1b2430';
  controlsDiv.style.padding = '10px';
  controlsDiv.style.borderRadius = '8px';
  controlsDiv.style.border = '1px solid #2f855a';
  controlsDiv.style.zIndex = '100';
  
  controlsDiv.innerHTML = `
    <button id="playPauseBtn" style="margin-right: 8px; padding: 6px 12px; border-radius: 4px; border: 1px solid #2f855a; background: transparent; color: #2f855a; cursor: pointer;">⏯️</button>
    <span id="nowPlaying" style="color: #e6eaf0; font-size: 14px;">Not playing</span>
  `;
  
  document.body.appendChild(controlsDiv);
  
  document.getElementById('playPauseBtn').addEventListener('click', togglePlayback);
}

// Update the render function to include playback controls
function render(seq,arc){
  const list=qs("#playlist");
  list.innerHTML="";
  seq.forEach((t,idx)=>{
    const li=document.createElement("li");
    const left=document.createElement("div");
    left.textContent=`${t.artists[0]} – ${t.name}`;
    const right=document.createElement("div");
    right.className="meta";
    right.textContent=`${t.genres.join(", ")} | E ${t.features.energy.toFixed(2)} | ${t.features.tempo} BPM | ${pitchNames[t.features.key]} ${t.features.mode? "maj":"min"}`;
    li.appendChild(left);
    li.appendChild(right);
    
    // Add play button
    const playButton = document.createElement('button');
    playButton.className = 'play-track-btn';
    playButton.setAttribute('data-track-id', t.id);
    playButton.textContent = '▶️';
    playButton.style.marginLeft = '10px';
    playButton.style.padding = '4px 8px';
    playButton.style.borderRadius = '4px';
    playButton.style.border = '1px solid #2f855a';
    playButton.style.background = 'transparent';
    playButton.style.color = '#2f855a';
    playButton.style.cursor = 'pointer';
    
    playButton.addEventListener('click', () => {
      playTrack(t.id);
    });
    
    li.appendChild(playButton);
    list.appendChild(li);
  });
  
  const avgTempo=Math.round(seq.reduce((s,t)=>s+t.features.tempo,0)/(seq.length||1));
  const avgEnergy=(seq.reduce((s,t)=>s+t.features.energy,0)/(seq.length||1)).toFixed(2);
  qs("#summary").textContent=`${seq.length} tracks • Avg tempo ${avgTempo} BPM • Avg energy ${avgEnergy}`;
  drawViz(seq,arc);
}

async function bootstrap(){
  await handleAuthOnLoad();
  
  // Check for shared playlist first
  loadSharedPlaylist();
  
  if(!accessToken()){
    if(DATA.length===0)DATA=genTracks(120);
    setMode("demo");
  } else {
    initializePlayer();
    addGlobalPlaybackControls();
  }
  
  // If no shared playlist was loaded, build with current data
  if (DATA.length === 0) {
    DATA = genTracks(120);
  }
  
  initGenres();setupUI();updateDisplays();buildPlaylist();
  DJ.init();
}

/* ═══════════════════════════════════════════════
   AI DJ — Claude integration
   ═══════════════════════════════════════════════ */
const DJ = (() => {
  let chatHistory = [];
  let busy = false;

  const feed = () => document.getElementById('djFeed');

  function clearEmpty() {
    const e = feed().querySelector('.dj-empty-state');
    if (e) e.remove();
  }

  function showTyping() {
    clearEmpty();
    const el = document.createElement('div');
    el.className = 'dj-typing'; el.id = 'djTyping';
    el.innerHTML = '<div class="dj-typing-dot"></div><div class="dj-typing-dot"></div><div class="dj-typing-dot"></div>';
    feed().appendChild(el);
    feed().scrollTop = feed().scrollHeight;
  }

  function hideTyping() { document.getElementById('djTyping')?.remove(); }

  function setBusy(b) {
    busy = b;
    ['djAnalyze','djIntro','djSend'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = b;
    });
  }

  function addMsg(type, html) {
    clearEmpty();
    const d = document.createElement('div');
    const cls = type === 'user' ? 'dj-message--user' : type === 'error' ? 'dj-message--error' : 'dj-message--dj';
    const label = type === 'user' ? 'You' : type === 'error' ? '⚠ Error' : '🎧 DJ';
    d.className = `dj-message ${cls}`;
    d.innerHTML = `<div class="dj-message-label">${label}</div><div class="dj-message-body">${html}</div>`;
    feed().appendChild(d);
    feed().scrollTop = feed().scrollHeight;
  }

  function buildContext() {
    if (!LAST_SEQ || !LAST_SEQ.length) return 'No playlist built yet.';
    const rows = LAST_SEQ.map((t, i) => {
      const f = t.features;
      return `${i+1}. "${t.name}" by ${t.artists.join(', ')} | genres:${t.genres.join('/')} | energy:${f.energy.toFixed(2)} | tempo:${f.tempo}bpm | valence:${f.valence.toFixed(2)} | key:${pitchNames[f.key]} ${f.mode?'maj':'min'}`;
    }).join('\n');
    const avgE = (LAST_SEQ.reduce((s,t)=>s+t.features.energy,0)/LAST_SEQ.length).toFixed(2);
    const avgT = Math.round(LAST_SEQ.reduce((s,t)=>s+t.features.tempo,0)/LAST_SEQ.length);
    return `${LAST_SEQ.length} tracks | avg energy ${avgE} | avg tempo ${avgT}bpm\n${rows}`;
  }

  function getTargets() {
    const ids = ['energy','tempo','valence','danceability','acousticness','instrumentalness'];
    return ids.map(id => { const el = document.getElementById(id); return el ? `${id}:${parseFloat(el.value).toFixed(2)}` : null; }).filter(Boolean).join(' ');
  }

  async function callClaude(messages) {
    const SYSTEM = `You are an expert AI DJ and music curator with deep knowledge of music theory, harmonic mixing, energy management, and DJ technique. Be enthusiastic but precise. No markdown. Use → for transitions. Keep responses tight and actionable.`;
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: SYSTEM, messages })
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error?.message || `API ${res.status} — add your Anthropic API key to a backend proxy`);
    }
    const data = await res.json();
    return data.content.map(b => b.text || '').join('');
  }

  async function analyze() {
    if (busy) return;
    if (!LAST_SEQ || !LAST_SEQ.length) { addMsg('error', 'Build a playlist first.'); return; }
    setBusy(true); showTyping();
    const prompt = `Analyze this DJ set:\n1. Overall vibe (2 sentences)\n2. Energy arc — does it build and resolve well?\n3. Best 2 transitions and why\n4. Worst transition and exact fix\n5. One structural improvement\n\nPlaylist:\n${buildContext()}\nTargets: ${getTargets()}`;
    try {
      const reply = await callClaude([{ role: 'user', content: prompt }]);
      chatHistory.push({ role: 'user', content: prompt }, { role: 'assistant', content: reply });
      hideTyping();
      addMsg('dj', reply.replace(/\n/g, '<br>'));
    } catch(e) {
      hideTyping();
      addMsg('error', e.message);
    }
    setBusy(false);
  }

  async function intros() {
    if (busy) return;
    if (!LAST_SEQ || !LAST_SEQ.length) { addMsg('error', 'Build a playlist first.'); return; }
    setBusy(true); showTyping();
    const prompt = `For each track write:\nINTRO: one punchy live DJ drop line\nMIX: one specific transition tip from previous track (track 1: "opener")\n\nFormat each line as: #N | INTRO: ... | MIX: ...\n\nPlaylist:\n${buildContext()}`;
    try {
      const reply = await callClaude([{ role: 'user', content: prompt }]);
      chatHistory.push({ role: 'user', content: prompt }, { role: 'assistant', content: reply });
      hideTyping();
      renderIntros(reply);
    } catch(e) {
      hideTyping();
      addMsg('error', e.message);
    }
    setBusy(false);
  }

  function renderIntros(raw) {
    clearEmpty();
    const wrap = document.createElement('div');
    wrap.className = 'dj-message dj-message--dj';
    wrap.innerHTML = '<div class="dj-message-label">🎧 DJ — Track Intros & Mix Tips</div>';
    const cards = document.createElement('div');
    cards.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-top:8px';

    const lines = raw.split('\n').filter(l => l.trim().match(/^#\d+/));
    lines.forEach((line, i) => {
      const t = LAST_SEQ[i]; if (!t) return;
      const introM = line.match(/INTRO:\s*([^|]+)/i);
      const mixM   = line.match(/MIX:\s*(.+)/i);
      const card = document.createElement('div');
      card.className = 'dj-track-card';
      card.innerHTML = `
        <div class="dj-track-num">${String(i+1).padStart(2,'0')}</div>
        <div class="dj-track-info">
          <div class="dj-track-name">${t.artists[0]} — ${t.name}</div>
          ${introM ? `<div class="dj-track-intro">"${introM[1].trim()}"</div>` : ''}
          ${mixM   ? `<div class="dj-mix-tip">${mixM[1].trim()}</div>` : ''}
        </div>`;
      cards.appendChild(card);
    });

    if (!cards.children.length) {
      wrap.innerHTML += raw.replace(/\n/g, '<br>');
    } else {
      wrap.appendChild(cards);
    }
    feed().appendChild(wrap);
    feed().scrollTop = feed().scrollHeight;
  }

  async function chat(userMsg) {
    if (busy || !userMsg.trim()) return;
    setBusy(true);
    addMsg('user', userMsg);
    const fullMsg = `${userMsg}\n\n[Playlist: ${buildContext()}\nTargets: ${getTargets()}]`;
    chatHistory.push({ role: 'user', content: fullMsg });
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
    showTyping();
    try {
      const reply = await callClaude(chatHistory);
      chatHistory.push({ role: 'assistant', content: reply });
      hideTyping();
      addMsg('dj', reply.replace(/\n/g, '<br>'));
    } catch(e) {
      hideTyping();
      addMsg('error', e.message);
      chatHistory.pop();
    }
    setBusy(false);
  }

  function init() {
    document.getElementById('djAnalyze').addEventListener('click', analyze);
    document.getElementById('djIntro').addEventListener('click', intros);
    const input = document.getElementById('djChatInput');
    const send  = document.getElementById('djSend');
    send.addEventListener('click', () => { const m = input.value.trim(); if (m) { chat(m); input.value = ''; } });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const m = input.value.trim(); if (m) { chat(m); input.value = ''; } }
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', bootstrap);