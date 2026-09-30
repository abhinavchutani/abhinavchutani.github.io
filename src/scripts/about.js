import GRAPH_DATA from '../data/graph-data.js';

/* Layout helpers — evaluated at use time so viewport changes do not stale-lock interactions */
function isTouchDevice() {
  return ('ontouchstart' in window) || ((window.navigator && window.navigator.maxTouchPoints) > 0);
}

function isMobileLayout() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function shouldUseSnapScroll() {
  return !isMobileLayout();
}

function applyResponsiveMode() {
  const pages = Array.from(document.querySelectorAll('.snap-page'));
  if (isMobileLayout()) {
    pages.forEach((page) => {
      page.classList.remove('sp-exit-fwd', 'sp-exit-back', 'sp-enter-fwd', 'sp-enter-back');
      page.classList.add('sp-visible');
    });
    document.getElementById('snap-dot-rail')?.classList.remove('visible');
    return;
  }

  pages.forEach((page, index) => {
    page.classList.remove('sp-exit-fwd', 'sp-exit-back', 'sp-enter-fwd', 'sp-enter-back');
    page.classList.toggle('sp-visible', index === 0);
  });
}

/* =================================================================
   PAGE ENTER FADE — dissolve overlay after load
================================================================= */
(function(){
  const ov=document.getElementById('page-enter-overlay');
  if(!ov)return;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    ov.style.opacity='0';
    setTimeout(()=>{ ov.style.display='none'; },520);
  }));
})();

/* =================================================================
   LOADER PARTICLES
================================================================= */
(function initLoaderParticles() {
  const canvas=document.getElementById('loader-canvas'),ctx=canvas.getContext('2d');
  const isDark=()=>document.documentElement.getAttribute('data-theme')==='dark';
  let W,H,particles,animId;
  const COUNT=55,LINK_DIST=160;
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize);
  function mkP(){return{x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45,r:Math.random()*1.6+.8,phase:Math.random()*Math.PI*2};}
  particles=Array.from({length:COUNT},mkP);
  function draw(ts){
    animId=requestAnimationFrame(draw);ctx.clearRect(0,0,W,H);
    const dark=isDark(),c=dark?'237,237,237':'17,17,17',t=(ts||0)*.001;
    for(const p of particles){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;}
    for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){
      const a=particles[i],b=particles[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<LINK_DIST){ctx.beginPath();ctx.strokeStyle=`rgba(${c},${(1-d/LINK_DIST)*.12})`;ctx.lineWidth=.6;ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    for(const p of particles){const pulse=.5+.5*Math.sin(t*1.2+p.phase);ctx.beginPath();ctx.fillStyle=`rgba(${c},${.12+.14*pulse})`;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
  }
  draw(0);
  const obs=new MutationObserver(()=>{if(document.getElementById('loader').style.display==='none'){cancelAnimationFrame(animId);obs.disconnect();}});
  obs.observe(document.getElementById('loader'),{attributes:true,attributeFilter:['style']});
})();

/* =================================================================
   LOADER EXIT + HERO ENTRANCE
================================================================= */
function heroEntrance() {
  document.querySelectorAll('.blob').forEach(b=>b.classList.add('visible'));
  setTimeout(()=>{document.getElementById('hero-line-1').classList.add('in');},80);
  setTimeout(()=>{document.getElementById('hero-line-2').classList.add('in');},240);
  const twEl=document.getElementById('hero-typewriter');
  if(twEl){
    setTimeout(()=>{
      twEl.classList.add('in');
      if (isMobileLayout()) twEl.textContent='Incoming economics student. Builder. Systems-minded.';
      else typewriter(twEl,'Incoming economics student. Builder. Systems-minded.',42);
    },480);
  }
  setTimeout(()=>{document.getElementById('hero-tags')?.classList.add('in');},680);
  initGlobe();
  setTimeout(()=>{document.getElementById('snap-dot-rail')?.classList.add('visible');},1200);
}

window.addEventListener('load',()=>{
  const loader=document.getElementById('loader'),navBar=document.getElementById('site-header');
  applyResponsiveMode();

  if (isMobileLayout()) {
    loader.style.display='none';
    navBar.classList.add('visible');
    setTimeout(()=>{
      heroEntrance();
      animateCounters();
      initMobileWorks();
      initMobileGraph();
      initObsList();
    },60);
    return;
  }

  // Skip loader if already shown this session
  if(sessionStorage.getItem('acLoaded')){
    loader.style.display='none';
    navBar.classList.add('visible');
    setTimeout(heroEntrance,60);
    return;
  }
  sessionStorage.setItem('acLoaded','1');

  const pct=document.getElementById('loader-pct'),morph=document.getElementById('loader-bar-morph');
  let current=0;const target=100,duration=3100,startTime=performance.now();
  function updatePct(now){pct.textContent=Math.round((1-Math.pow(1-Math.min((now-startTime)/duration,1),3))*target)+'%';if((now-startTime)<duration)requestAnimationFrame(updatePct);}
  requestAnimationFrame(updatePct);
  setTimeout(()=>{
    loader.classList.add('loader--hiding');
    setTimeout(()=>{
      morph.style.opacity='1';morph.classList.add('morph-active');
      setTimeout(()=>{
        loader.classList.add('loader--out');navBar.classList.add('visible');
        setTimeout(()=>{loader.style.display='none';},600);
        setTimeout(()=>heroEntrance(),200);
      },700);
    },320);
  },3200);
});

/* =================================================================
   TYPEWRITER
================================================================= */
function typewriter(el,text,speed){
  let i=0;el.textContent='';
  const cur=document.createElement('span');
  cur.style.cssText='opacity:1;animation:twBlink .8s step-end infinite;border-right:2px solid currentColor;margin-left:2px;';
  el.appendChild(cur);
  const s=document.createElement('style');s.textContent='@keyframes twBlink{0%,100%{opacity:1}50%{opacity:0}}';document.head.appendChild(s);
  function type(){if(i<text.length){el.insertBefore(document.createTextNode(text[i]),cur);i++;setTimeout(type,speed);}else{setTimeout(()=>cur.remove(),1200);}}
  type();
}

/* =================================================================
   TYPE-IN (cancellable, for chapter details)
================================================================= */
function typeIn(el,text,speed){
  el.textContent='';
  const id=Date.now();el._tid=id;let i=0;
  (function next(){if(el._tid!==id)return;if(i<text.length){el.textContent=text.slice(0,++i);setTimeout(next,speed);}})();
}

/* =================================================================
   HERO CANVAS PARTICLES
================================================================= */
(function(){
  const canvas=document.getElementById('hero-canvas'),ctx=canvas.getContext('2d');
  const isDark=()=>document.documentElement.getAttribute('data-theme')==='dark';
  let W,H,active=false;const COUNT=35,LINK_DIST=140;
  function resize(){W=canvas.width=canvas.offsetWidth;H=canvas.height=canvas.offsetHeight;}
  window.addEventListener('resize',resize);resize();
  const ps=Array.from({length:COUNT},()=>({x:Math.random()*(W||800),y:Math.random()*(H||600),vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.4+.5,phase:Math.random()*Math.PI*2}));
  function draw(ts){
    requestAnimationFrame(draw);if(!active)return;ctx.clearRect(0,0,W,H);
    const dark=isDark(),c=dark?'237,237,237':'17,17,17',t=(ts||0)*.001;
    for(const p of ps){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;}
    for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){
      const a=ps[i],b=ps[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<LINK_DIST){ctx.beginPath();ctx.strokeStyle=`rgba(${c},${(1-d/LINK_DIST)*.07})`;ctx.lineWidth=.5;ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    for(const p of ps){const pulse=.5+.5*Math.sin(t*1.1+p.phase);ctx.beginPath();ctx.fillStyle=`rgba(${c},${.07+.08*pulse})`;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
  }
  draw(0);
  setTimeout(()=>{active=true;},3800);
  new IntersectionObserver(e=>e.forEach(ev=>{active=ev.isIntersecting;}),{threshold:.1}).observe(document.getElementById('hero'));
})();

/* =================================================================
   COUNTER ANIMATION
================================================================= */
function animateCounters(){
  document.querySelectorAll('.stat-num[data-target]').forEach(el=>{
    if(el._counted)return;el._counted=true;
    const target=parseInt(el.dataset.target),pre=el.dataset.prefix||'',suf=el.dataset.suffix||'';
    const dur=1800,start=performance.now();
    function animate(now){
      const t=Math.min((now-start)/dur,1),v=Math.round((1-Math.pow(1-t,3))*target);
      el.textContent=pre+v.toLocaleString()+suf;
      if(t<1)requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  });
}

/* =================================================================
   SNAP SCROLL CONTROLLER
================================================================= */
(function initSnapScroll(){
  const rawPages=Array.from(document.querySelectorAll('.snap-page'));
  const getPages=()=>isTouchDevice() ? rawPages.filter(p=>p.id!=='sp-story') : rawPages;
  const LOCK_MS=900;
  let current=0,locked=false;

  function lock(fn){if(locked)return;locked=true;fn();setTimeout(()=>{locked=false;},LOCK_MS);}

  function navigate(next,dir){
    const pages=getPages();
    const N=pages.length;
    if(next<0||next>=N||next===current)return;
    const prev=current;current=next;
    const out=pages[prev];
    out.classList.remove('sp-visible','sp-enter-fwd','sp-enter-back');
    out.classList.add(dir>0?'sp-exit-fwd':'sp-exit-back');
    const inn=pages[next];
    inn.classList.remove('sp-visible','sp-exit-fwd','sp-exit-back');
    inn.classList.add(dir>0?'sp-enter-fwd':'sp-enter-back');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      inn.classList.remove('sp-enter-fwd','sp-enter-back');
      inn.classList.add('sp-visible');
      updateDots();updateProgress();
      if(next===0)animateCounters();
      const p=pages[next];
      if(p.id==='sp-work') isTouchDevice() ? initMobileWorks() : initWorksWeb();
      if(p.id==='sp-graph') isTouchDevice() ? initMobileGraph() : initKnowledgeGraph();
      if(p.id==='sp-story') initObsList();
    }));
  }

  function updateDots(){
    document.querySelectorAll('.snap-dot').forEach((d,i)=>d.classList.toggle('active',i===current));
  }

  function updateProgress(){
    const pages=getPages();
    const N=pages.length;
    const b=document.getElementById('scroll-progress');
    if(b)b.style.width=(current/(N-1)*100)+'%';
  }

  document.querySelectorAll('.snap-dot').forEach(dot=>{
    dot.addEventListener('click',()=>{
      const pg=parseInt(dot.dataset.page);
      lock(()=>navigate(pg,pg>current?1:-1));
    });
  });

  document.querySelectorAll('[data-snap-page]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const pg=parseInt(btn.dataset.snapPage);
      lock(()=>navigate(pg,pg>current?1:-1));
    });
  });

  function handleDir(dir){
    if(!shouldUseSnapScroll()) return;
    lock(()=>navigate(current+dir,dir));
  }

  // Accumulation-based wheel — always snap-navigate (scroll to zoom uses +/- buttons only)
  let _wa=0,_wl=false,_wr=null;
  document.addEventListener('wheel',e=>{
    if(!shouldUseSnapScroll()) return;
    e.preventDefault();
    if(_wl)return;
    _wa+=e.deltaY;
    clearTimeout(_wr);
    _wr=setTimeout(()=>{_wa=0;},300);
    if(Math.abs(_wa)>=80){
      _wl=true;const dir=_wa>0?1:-1;_wa=0;
      handleDir(dir);
      setTimeout(()=>{_wl=false;},900);
    }
  },{passive:false});
  let touchY=0;
  document.addEventListener('touchstart',e=>{touchY=e.touches[0].clientY;},{passive:true});
  document.addEventListener('touchend',e=>{
    if(!shouldUseSnapScroll()) return;
    const dy=touchY-e.changedTouches[0].clientY;
    if(Math.abs(dy)>44)handleDir(dy>0?1:-1);
  });
  document.addEventListener('keydown',e=>{
    if(!shouldUseSnapScroll()) return;
    if(e.key==='ArrowDown'||e.key==='PageDown')handleDir(1);
    if(e.key==='ArrowUp'||e.key==='PageUp')handleDir(-1);
  });

  if(shouldUseSnapScroll()){
    animateCounters();
    updateProgress();
  }
})();

let _respQueued=false;
window.addEventListener('resize',()=>{
  if(_respQueued) return;
  _respQueued=true;
  requestAnimationFrame(()=>{
    _respQueued=false;
    applyResponsiveMode();
    if(isMobileLayout()){
      animateCounters();
      initMobileWorks();
      initMobileGraph();
      initObsList();
    }
  });
});


/* =================================================================
   WORKS + QUESTS REVEAL (triggered by snap navigate)
================================================================= */

/* =================================================================
   SPOTLIGHT CARD MOUSE TRACKING
================================================================= */
document.querySelectorAll('.spotlight-card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
    card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
  });
});

/* =================================================================
   CUSTOM CURSOR
================================================================= */
const ring=document.getElementById('cursor-ring'),dot=document.getElementById('cursor-dot');
if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
  let mx=window.innerWidth/2,my=window.innerHeight/2,rx=mx,ry=my;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  (function raf(){rx+=(mx-rx)*.11;ry+=(my-ry)*.11;ring.style.left=rx+'px';ring.style.top=ry+'px';dot.style.left=mx+'px';dot.style.top=my+'px';requestAnimationFrame(raf);})();
}else{ring.style.display='none';dot.style.display='none';}
document.querySelectorAll('a,button,.spotlight-card,.chapter-dot,.snap-dot').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('c-hover'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('c-hover'));
});

/* =================================================================
   THEME TOGGLE
================================================================= */
const themeToggle=document.getElementById('theme-toggle');
function setTheme(dark){
  if(dark){document.documentElement.setAttribute('data-theme','dark');themeToggle.textContent='○';try{localStorage.setItem('theme','dark');}catch(e){}}
  else{document.documentElement.removeAttribute('data-theme');themeToggle.textContent='☾';try{localStorage.setItem('theme','light');}catch(e){}}
}
if(document.documentElement.getAttribute('data-theme')==='dark')themeToggle.textContent='○';
themeToggle.addEventListener('click',()=>{setTheme(document.documentElement.getAttribute('data-theme')!=='dark');setTimeout(buildGlobe,60);});

/* =================================================================
   CURSOR PARTICLE TRAIL
================================================================= */
(function(){
  const canvas=document.getElementById('cursor-trail');
  if(!canvas||!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;
  const ctx=canvas.getContext('2d');let W,H;
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize);
  const ps=[];let lx=-999,ly=-999;
  document.addEventListener('mousemove',e=>{
    const dx=e.clientX-lx,dy=e.clientY-ly,spd=Math.sqrt(dx*dx+dy*dy);
    if(spd<4)return;
    for(let i=0;i<Math.min(Math.floor(spd/7)+1,5);i++)
      ps.push({x:e.clientX+(Math.random()-.5)*6,y:e.clientY+(Math.random()-.5)*6,vx:(Math.random()-.5)*1.1,vy:-Math.random()*1.4-.2,life:1,size:Math.random()*2.2+.8,pink:Math.random()>.62});
    lx=e.clientX;ly=e.clientY;
  });
  (function draw(){
    requestAnimationFrame(draw);ctx.clearRect(0,0,W,H);
    const dark=document.documentElement.getAttribute('data-theme')==='dark';
    for(let i=ps.length-1;i>=0;i--){
      const p=ps[i];p.x+=p.vx;p.y+=p.vy;p.vy-=.018;p.life-=.032;
      if(p.life<=0){ps.splice(i,1);continue;}
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);
      ctx.fillStyle=`rgba(${p.pink?'249,184,192':(dark?'237,237,237':'40,40,40')},${p.life*(dark?.55:.38)})`;ctx.fill();
    }
  })();
})();

/* =================================================================
   HERO CURSOR DEPTH PARALLAX
================================================================= */
(function(){
  const hi=document.querySelector('.hero-inner'),he=document.getElementById('hero');
  if(!hi||!he||!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;
  let tX=0,tY=0,cX=0,cY=0;
  document.addEventListener('mousemove',e=>{
    const r=he.getBoundingClientRect();
    if(r.bottom<0||r.top>window.innerHeight)return;
    tX=((e.clientX-window.innerWidth/2)/(window.innerWidth/2))*10;
    tY=((e.clientY-(r.top+r.height/2))/(r.height/2))*5;
  });
  (function raf(){cX+=(tX-cX)*.07;cY+=(tY-cY)*.07;hi.style.transform=`translate(${cX.toFixed(2)}px,${cY.toFixed(2)}px)`;requestAnimationFrame(raf);})();
})();

/* =================================================================
   GLOBE (COBE WebGL — Delhi, Helsinki, Detroit)
================================================================= */
let globePhi=0.18,globeRotating=false,globeInstance=null,createGlobeFn=null;
let globePointerDown=false,globePointerLastX=0;
const isDarkMode=()=>document.documentElement.getAttribute('data-theme')==='dark';

function buildGlobe(){
  const canvas=document.getElementById('globe-canvas');
  if(!createGlobeFn||!canvas)return;
  if(globeInstance){try{globeInstance.destroy();}catch(e){}globeInstance=null;}
  const dark=isDarkMode();
  globeInstance=createGlobeFn(canvas,{
    devicePixelRatio:Math.min(window.devicePixelRatio||1,2),
    width:1160,height:1160,
    phi:globePhi,theta:.26,
    dark:dark?1:0,diffuse:dark?1.4:1.9,scale:1.08,
    mapSamples:26000,mapBrightness:dark?4:11,
    baseColor:dark?[.22,.22,.22]:[.80,.80,.80],
    markerColor:[1.0,.72,.75],
    glowColor:dark?[.1,.1,.1]:[1,1,1],
    markers:[
      {location:[28.6139, 77.2090],size:.12},  // Delhi — home, largest
      {location:[60.1699, 24.9384],size:.09},  // Helsinki
      {location:[42.3314,-83.0458],size:.09}   // Detroit
    ],
    arcs:[
      {startLat:28.6139,startLng: 77.2090,endLat:60.1699,endLng: 24.9384,arcAlt:.42,color:'rgba(249,184,192,0.85)'},
      {startLat:28.6139,startLng: 77.2090,endLat:42.3314,endLng:-83.0458,arcAlt:.52,color:'rgba(252,211,77,0.80)'},
      {startLat:60.1699,startLng: 24.9384,endLat:42.3314,endLng:-83.0458,arcAlt:.38,color:'rgba(147,197,253,0.78)'}
    ],
    onRender(state){if(globeRotating)globePhi+=.0022;state.phi=globePhi;}
  });
}

function globeFlyover(){
  const s=globePhi,e=0.18,t0=performance.now(),dur=2400;
  function fly(now){
    const t=Math.min((now-t0)/dur,1),ease=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    globePhi=s+(e-s)*ease;
    if(t<1)requestAnimationFrame(fly);else globeRotating=true;
  }
  requestAnimationFrame(fly);
}

function initGlobe(){
  const canvas=document.getElementById('globe-canvas'),col=document.getElementById('hero-globe-col');
  if(!canvas)return;
  import('https://esm.sh/cobe@0.6.3').then(mod=>{
    createGlobeFn=mod.default;buildGlobe();
    canvas.classList.add('globe-visible');
    if(col)col.classList.add('globe-loaded');
    setTimeout(globeFlyover,600);
  }).catch(()=>{});

  canvas.addEventListener('pointerdown',e=>{
    globePointerDown=true;globePointerLastX=e.clientX;globeRotating=false;
  });
  window.addEventListener('pointerup',()=>{
    globePointerDown=false;globeRotating=true;
  });
  window.addEventListener('pointermove',e=>{
    if(!globePointerDown)return;
    globePhi+=(e.clientX-globePointerLastX)*.005;
    globePointerLastX=e.clientX;
  });
}

/* =================================================================
   KNOWLEDGE GRAPH (Three.js — force-directed 3D, data from graph-data.js)
================================================================= */
function initKnowledgeGraph() {
  const container = document.getElementById('graph-container');
  if (!container || container._init) return;
  container._init = true;

  // Load from graph-data.js
  const GD = GRAPH_DATA || {nodes:[],edges:[],details:{}};
  const NODES_RAW = GD.nodes;
  const EDGES = GD.edges;
  const DETAIL = GD.details || {};
  const GROUP_COLOR = {craft:0xf9b8c0, mind:0x93c5fd, build:0x86efac, people:0xfcd34d, passion:0xfb923c};

  const NODES = NODES_RAW.map(n => ({...n, x:0,y:0,z:0, vx:0,vy:0,vz:0}));
  NODES.forEach(n => {
    const phi=Math.random()*Math.PI*2, ct=Math.random()*2-1;
    const st=Math.sqrt(1-ct*ct), r=5+Math.random()*3;
    n.x=r*st*Math.cos(phi); n.y=r*st*Math.sin(phi); n.z=r*ct;
  });

  import('https://esm.sh/three@0.158.0').then(mod => {
    const {Scene,PerspectiveCamera,WebGLRenderer,SphereGeometry,
           MeshBasicMaterial,Mesh,LineSegments,LineBasicMaterial,
           BufferGeometry,BufferAttribute,Vector3,Vector2,Raycaster} = mod;

    let W=container.offsetWidth||800, H=container.offsetHeight||600;
    const scene=new Scene();
    const camera=new PerspectiveCamera(55,W/H,0.1,1000);
    const renderer=new WebGLRenderer({antialias:true,alpha:true});
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setClearColor(0,0); container.appendChild(renderer.domElement);

    const ng=new SphereGeometry(0.20,12,12);
    const meshes=NODES.map((n,i)=>{
      const m=new Mesh(ng,new MeshBasicMaterial({color:GROUP_COLOR[n.group]||0xffffff}));
      m.position.set(n.x,n.y,n.z); m._i=i; scene.add(m); return m;
    });
    const tScale=new Float32Array(NODES.length).fill(1);

    const eArr=new Float32Array(EDGES.length*6);
    const eg=new BufferGeometry();
    eg.setAttribute('position',new BufferAttribute(eArr,3));
    const em=new LineBasicMaterial({color:0x999999,transparent:true,opacity:0.45});
    scene.add(new LineSegments(eg,em));

    const ll=document.createElement('div');
    ll.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden;';
    container.appendChild(ll);
    const lbls=NODES.map(n=>{
      const d=document.createElement('div');
      d.className='graph-label'; d.textContent=n.label; ll.appendChild(d); return d;
    });

    let tick=0;
    function sim(){
      if(tick>600)return; tick++;
      const REPEL=7,SL=4.6,SK=0.022,CK=0.004;
      for(let i=0;i<NODES.length;i++) for(let j=i+1;j<NODES.length;j++){
        const a=NODES[i],b=NODES[j],dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;
        const d=Math.sqrt(dx*dx+dy*dy+dz*dz)+0.01,f=REPEL/(d*d);
        const fx=dx/d*f,fy=dy/d*f,fz=dz/d*f;
        a.vx-=fx;a.vy-=fy;a.vz-=fz; b.vx+=fx;b.vy+=fy;b.vz+=fz;
      }
      EDGES.forEach(e=>{
        const a=NODES.find(n=>n.id===e.s),b=NODES.find(n=>n.id===e.t);
        if(!a||!b)return;
        const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,d=Math.sqrt(dx*dx+dy*dy+dz*dz)+0.01;
        const f=(d-SL)*SK,fx=dx/d*f,fy=dy/d*f,fz=dz/d*f;
        a.vx+=fx;a.vy+=fy;a.vz+=fz; b.vx-=fx;b.vy-=fy;b.vz-=fz;
      });
      NODES.forEach(n=>{
        n.vx-=n.x*CK;n.vy-=n.y*CK;n.vz-=n.z*CK;
        n.vx*=0.83;n.vy*=0.83;n.vz*=0.83;
        n.x+=n.vx;n.y+=n.vy;n.z+=n.vz;
      });
    }

    let autoRot=0,isDrag=false,dLX=0,dLY=0,camT=0,camP=Math.PI*0.42,camR=20;
    container.addEventListener('pointerdown',e=>{isDrag=true;dLX=e.clientX;dLY=e.clientY;});
    window.addEventListener('pointerup',()=>{isDrag=false;});
    window.addEventListener('pointermove',e=>{
      if(!isDrag)return;
      camT+=(e.clientX-dLX)*0.008;
      camP=Math.max(0.2,Math.min(Math.PI-0.2,camP-(e.clientY-dLY)*0.008));
      dLX=e.clientX;dLY=e.clientY;
    });
    window._graphZoom=delta=>{camR=Math.max(8,Math.min(40,camR+delta*0.025));};
    document.getElementById('graph-zoom-in') ?.addEventListener('click',()=>window._graphZoom(-300));
    document.getElementById('graph-zoom-out')?.addEventListener('click',()=>window._graphZoom( 300));

    const rc=new Raycaster(),mouse=new Vector2();
    let hov=-1;
    const card     =document.getElementById('graph-card');
    const cardName =document.getElementById('graph-card-name');
    const cardOrigin=document.getElementById('graph-card-origin');
    const cardShaped=document.getElementById('graph-card-shaped');
    const cardNow  =document.getElementById('graph-card-now');

    container.addEventListener('mousemove',e=>{
      const r=container.getBoundingClientRect();
      mouse.x=((e.clientX-r.left)/W)*2-1;
      mouse.y=-((e.clientY-r.top)/H)*2+1;
    });
    container.addEventListener('mouseleave',()=>{mouse.set(9999,9999);});

    const connIdx=NODES.map((_,i)=>EDGES.reduce((acc,e)=>{
      const si=NODES.findIndex(n=>n.id===e.s),ti=NODES.findIndex(n=>n.id===e.t);
      if(si===i)acc.push(ti);if(ti===i)acc.push(si);return acc;
    },[]));

    const tv=new Vector3();
    function render(){
      requestAnimationFrame(render); sim();
      meshes.forEach((m,i)=>{
        m.position.set(NODES[i].x,NODES[i].y,NODES[i].z);
        const cs=m.scale.x,ts=tScale[i],ns=cs+(ts-cs)*0.16;
        m.scale.setScalar(ns);
      });
      EDGES.forEach((e,i)=>{
        const a=NODES.find(n=>n.id===e.s),b=NODES.find(n=>n.id===e.t);
        if(!a||!b)return;
        eArr[i*6]=a.x;eArr[i*6+1]=a.y;eArr[i*6+2]=a.z;
        eArr[i*6+3]=b.x;eArr[i*6+4]=b.y;eArr[i*6+5]=b.z;
      });
      eg.attributes.position.needsUpdate=true;

      if(!isDrag&&hov===-1)autoRot+=0.0015;
      const th=camT+autoRot;
      camera.position.set(camR*Math.sin(camP)*Math.cos(th),camR*Math.cos(camP)+1,camR*Math.sin(camP)*Math.sin(th));
      camera.lookAt(0,0,0);

      rc.setFromCamera(mouse,camera);
      const hits=rc.intersectObjects(meshes);
      const newHov=hits.length?hits[0].object._i:-1;
      if(newHov!==hov){
        hov=newHov;
        if(hov===-1){
          NODES.forEach((_,i)=>{tScale[i]=1;meshes[i].material.color.setHex(GROUP_COLOR[NODES[i].group]||0xffffff);});
          em.opacity=0.45; card?.classList.remove('active');
        } else {
          em.opacity=0.1;
          NODES.forEach((_,i)=>{
            const base=GROUP_COLOR[NODES[i].group]||0xffffff,isConn=connIdx[hov].includes(i);
            if(i===hov){meshes[i].material.color.setHex(0xffffff);tScale[i]=2.4;}
            else if(isConn){meshes[i].material.color.setHex(base);tScale[i]=1.3;}
            else{meshes[i].material.color.setHex(0x1a1a1a);tScale[i]=0.5;}
          });
          const n=NODES[hov],d=DETAIL[n.id]||{};
          if(cardName)  cardName.textContent  =n.label;
          if(cardOrigin)cardOrigin.textContent=d.origin||'—';
          if(cardShaped)cardShaped.textContent=d.shaped||'—';
          if(cardNow)   cardNow.textContent   =d.now   ||'—';
          card?.classList.add('active');
        }
      }
      if(hov!==-1&&card){
        tv.set(NODES[hov].x,NODES[hov].y,NODES[hov].z);tv.project(camera);
        const px=(tv.x*0.5+0.5)*W,py=(-tv.y*0.5+0.5)*H;
        const panelW=264,ix=(px+28+panelW<W)?px+28:px-28-panelW;
        card.style.left=ix+'px';
        card.style.top=Math.max(80,Math.min(py-40,H-240))+'px';
        card.style.right='auto';
      }
      NODES.forEach((n,i)=>{
        tv.set(n.x,n.y,n.z);tv.project(camera);
        if(tv.z>=1){lbls[i].style.opacity='0';return;}
        lbls[i].style.left=(tv.x*0.5+0.5)*W+'px';
        lbls[i].style.top=((-tv.y*0.5+0.5)*H+16)+'px';
        if(hov===-1){lbls[i].style.opacity='.48';lbls[i].style.fontWeight='400';}
        else if(i===hov){lbls[i].style.opacity='1';lbls[i].style.fontWeight='700';}
        else{
          const isConn=connIdx[hov].includes(i);
          lbls[i].style.opacity=isConn?'.9':'.08';
          lbls[i].style.fontWeight='400';
        }
      });
      renderer.render(scene,camera);
    }
    render();
    window.addEventListener('resize',()=>{
      W=container.offsetWidth;H=container.offsetHeight;
      if(!W||!H)return;
      camera.aspect=W/H;camera.updateProjectionMatrix();renderer.setSize(W,H);
    });
  }).catch(e=>console.warn('Three.js:',e));
}

/* =================================================================
   OBSERVATIONS LIST
================================================================= */
function initObsList() {
  const list   = document.getElementById('obs-list');
  const panel  = document.getElementById('obs-detail-panel');
  const panelN = document.getElementById('obs-detail-n');
  const panelT = document.getElementById('obs-detail-text');
  if (!list || list._init) return;
  list._init = true;

  const OBS = [
    {
      n:'001', t:'MarksMaxxing',
      d:'MarksMaxxing was a fast, high-pressure build: an AI-powered board-exam analysis platform put together in around 10 days after processing 1,000+ pages of past papers. It taught me how quickly a product can move from idea to something usable when the constraint is speed, not polish.'
    },
    {
      n:'002', t:'Endless Media',
      d:'Endless Media started when I cold-called local automobile businesses at 15, set up real meetings, and tried to sell marketing services before I felt fully ready. It was messy, uncomfortable, and useful. It taught me outreach, rejection tolerance, and how real selling differs from theory.'
    },
    {
      n:'003', t:'Kaizen Ace',
      d:'Kaizen Ace was a print-on-demand apparel experiment built to understand supplier coordination, fulfillment, unit economics, and why a brand idea can look better on paper than it does in operations. It was less about winning and more about learning the mechanics firsthand.'
    },
  ];

  OBS.forEach((obs, i) => {
    const li = document.createElement('li');
    li.className = 'obs-entry';
    li.innerHTML = `<span class="obs-n">${obs.n}</span><span class="obs-t">${obs.t}</span>`;
    list.appendChild(li);
    setTimeout(() => li.classList.add('in'), 60 + i * 55);
    li.addEventListener('mouseenter', () => {
      panelN.textContent = obs.n;
      panelT.textContent = obs.d;
      panel.classList.add('active');
    });
    li.addEventListener('mouseleave', () => panel.classList.remove('active'));
  });
}

/* =================================================================
   WORKS 2D DRAGGABLE WEB (Canvas2D)
================================================================= */
function initWorksWeb() {
  const canvas = document.getElementById('works-web-canvas');
  if (!canvas || canvas._init) return;
  canvas._init = true;

  const ctx    = canvas.getContext('2d');
  const card   = document.getElementById('works-web-card');
  const wwcName  = document.getElementById('wwc-name');
  const wwcSub   = document.getElementById('wwc-sub');
  const wwcDesc  = document.getElementById('wwc-desc');
  const wwcBadge = document.getElementById('wwc-badge');
  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

  const NODES = [
    {
      id:'orbital', label:'Orbital Guardian',
      sub:'Space Tech · Solo · 2024', badge:'PM STAGE', color:'#86efac',
      desc:'Computer-vision-based space debris detection with a servo-aligned net concept. Presented directly to the Prime Minister of India at Pariksha Pe Charcha 2024.',
      x:0, y:-220, r:20
    },
    {
      id:'headboy', label:'Head Boy',
      sub:'DAV Public School · 3,500 Students · 2025–26', badge:'ELECTED', color:'#c4b5fd',
      desc:'Elected Head Boy. Coordinated a 70-member council, supported major events, helped launch the Mental Health Corner, and handled the operational side of school leadership.',
      x:-220, y:-95, r:20
    },
    {
      id:'fll', label:'FLL World #8',
      sub:'Detroit · Robotics · 2019', badge:'WORLD #8', color:'#fb923c',
      desc:'FIRST Lego League World Festival, Detroit 2019. Global Rank #8 out of 110+ nations after qualifying #1 in North India. Led robot design and autonomous programming.',
      x:220, y:-95, r:20
    },
    {
      id:'terra', label:'Terra Mitra',
      sub:'AgriTech · Co-founder · 2023', badge:'TOP 24', color:'#86efac',
      desc:'AI-enabled farming device. Reached the Top 24 out of 13,000 projects at NEP Celebrations, Pragati Maidaan, and was presented to the Missions Director of AIM.',
      x:-250, y:85, r:19
    },
    {
      id:'shravan', label:'Shravan Doot',
      sub:'Assistive Tech · Co-founder · 2025', badge:'SEMIFINALIST', color:'#f9b8c0',
      desc:'Smart glasses for the hearing-impaired using Raspberry Pi. Converts speech to text on-lens in real time. Reached the national semifinals of Dassault Systèmes La Fondation.',
      x:250, y:85, r:19
    },
    {
      id:'acon', label:'ACON',
      sub:'Tech Symposium · Core Lead · 2021–25', badge:'FIELD OPS', color:'#c4b5fd',
      desc:'Helped scale ACON through operations, volunteer coordination, budgeting, and school outreach. When registrations slowed, I cold-called previous schools and brought two back into the event.',
      x:0, y:-360, r:18
    },
    {
      id:'marksmax', label:'MarksMaxxing',
      sub:'AI Product · Co-founder · 2026', badge:'10-DAY BUILD', color:'#fcd34d',
      desc:'AI-powered exam-analysis build created from 1,000+ pages of past papers to surface trends, patterns, and high-yield preparation areas for students.',
      x:0, y:230, r:18
    },
    {
      id:'blockchain', label:'Blockchain Simulator',
      sub:'Python · Systems Research', badge:'SIMULATION', color:'#93c5fd',
      desc:'Built a Python blockchain simulator to understand transaction flow, hashing, block creation, and the logic behind chain validation and distributed trust.',
      x:250, y:250, r:17
    },
    {
      id:'monte', label:'Monte Carlo Options',
      sub:'Quant Finance · Research', badge:'RESEARCH', color:'#93c5fd',
      desc:'Built a Monte Carlo simulator and compared its outputs with the Black-Scholes formula to test how close theory and simulation get in practice.',
      x:-250, y:250, r:17
    },
    {
      id:'violin6', label:'Grade 6 Violin',
      sub:'ISOM · Performance', badge:'GRADE 6', color:'#f9b8c0',
      desc:'Progressed through ISOM violin grades to Grade 6, with performances at school, Hard Rock Cafe in Connaught Place, and The Piano Man in New Delhi.',
      x:355, y:-10, r:16
    },
    {
      id:'vigyantram', label:'Vigyantram',
      sub:'IIT Bombay · Abhyuday', badge:'2ND PLACE', color:'#fb923c',
      desc:'2nd Position (Regional) at Vigyantram, Abhyuday — IIT Bombay’s annual innovation and social-impact competition.',
      x:-355, y:10, r:16
    },
    {
      id:'irc', label:'IRC 2025',
      sub:'International Robotics League', badge:'FINALIST', color:'#fb923c',
      desc:'National Finalist at the International Robotics League 2025, competing against leading robotics teams from across the country.',
      x:355, y:165, r:16
    },
    {
      id:'mun', label:'MUN Awards',
      sub:'Concordia · SHISMUN · BBI MUN', badge:'MULTIPLE', color:'#c4b5fd',
      desc:'Multiple Model United Nations awards across conferences including Concordia MUN, SHISMUN, and BBI MUN, built through committee speaking, negotiation, and defending positions under pressure.',
      x:-355, y:165, r:16
    },
    {
      id:'endless', label:'Endless Media',
      sub:'Venture · Founder · 2023', badge:'OUTREACH', color:'#86efac',
      desc:'Started through cold outreach to local automobile businesses at 15. Landed real meetings and learned sales, positioning, and follow-up through execution.',
      x:320, y:-235, r:15
    },
    {
      id:'kaizen', label:'Kaizen Ace',
      sub:'Venture · Founder · 2024', badge:'EXPERIMENT', color:'#fb923c',
      desc:'Print-on-demand apparel experiment built to understand supplier coordination, fulfillment systems, unit economics, and brand positioning.',
      x:-320, y:-235, r:15
    },
  ];
  const EDGES = [
    {s:'orbital',      t:'terra'},
    {s:'orbital',      t:'shravan'},
    {s:'orbital',      t:'fll'},
    {s:'orbital',      t:'acon'},
    {s:'orbital',      t:'marksmax'},
    {s:'orbital',      t:'blockchain'},
    {s:'terra',        t:'shravan'},
    {s:'terra',        t:'endless'},
    {s:'terra',        t:'vigyantram'},
    {s:'shravan',      t:'irc'},
    {s:'monte',        t:'marksmax'},
    {s:'monte',        t:'blockchain'},
    {s:'fll',          t:'irc'},
    {s:'headboy',      t:'acon'},
    {s:'headboy',      t:'mun'},
    {s:'headboy',      t:'endless'},
    {s:'headboy',      t:'marksmax'},
    {s:'marksmax',     t:'kaizen'},
    {s:'endless',      t:'kaizen'},
    {s:'violin6',      t:'mun'},
    {s:'violin6',      t:'headboy'},
  ];

  // ── spread nodes: scale up initial positions ──
  const SCALE = 1.72;
  NODES.forEach(n=>{ n.x*=SCALE; n.y*=SCALE; });
  // bump base radii
  const BASE_R = {orbital:26,terra:26,shravan:26,monte:24,marksmax:24,fll:26,
                  headboy:23,acon:21,vigyantram:20,irc:20,mun:20,endless:20,kaizen:20};
  NODES.forEach(n=>{
    n.r = BASE_R[n.id]||20; n._br = n.r;
    // Subtle idle drift — each node oscillates ±8–12px independently
    n._dx = 0; n._dy = 0;
    n._dph_x = Math.random() * Math.PI * 2;
    n._dph_y = Math.random() * Math.PI * 2;
    n._damp_x = 9 + Math.random() * 8;
    n._damp_y = 9 + Math.random() * 8;
  });

  let panX=0, panY=0, isDrag=false, lmx=0, lmy=0, hov=null;
  let W=0, H=0, mouse={x:-9999,y:-9999};
  let meshMX=-9999, meshMY=-9999, glowT=0;
  let hintAlpha=1;

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio||1;
    const pw = parent.offsetWidth, ph = parent.offsetHeight - 60;
    W = canvas.width  = pw * dpr;
    H = canvas.height = ph * dpr;
    canvas.style.width  = pw+'px';
    canvas.style.height = ph+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('pointerdown', e=>{
    isDrag=true; lmx=e.clientX; lmy=e.clientY;
    canvas.setPointerCapture(e.pointerId);
    hintAlpha=0; // hide hint once user drags
  });
  canvas.addEventListener('pointerup',   ()=>{ isDrag=false; });
  canvas.addEventListener('pointermove', e=>{
    if(isDrag){ panX+=e.clientX-lmx; panY+=e.clientY-lmy; lmx=e.clientX; lmy=e.clientY; }
    const r=canvas.getBoundingClientRect();
    mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top;
  });
  canvas.addEventListener('pointerleave', ()=>{ mouse.x=-9999; mouse.y=-9999; });

  // ── Torus wrap — seamless infinite loop ──
  const WORLD_W=1500, WORLD_H=1400;
  const TILES=[-1,0,1];

  const cssW=()=>canvas.offsetWidth||800, cssH=()=>canvas.offsetHeight||600;
  function ns(n,tx=0,ty=0){ return {x:cssW()/2+panX+n.x+(n._dx||0)+tx, y:cssH()/2+panY+n.y+(n._dy||0)+ty}; }

  /* ── Interactive 3-D mesh ──────────────────────────────────────────
     Grid is screen-fixed (no pan). Cursor creates a gravity-well:
     nearby grid points are pulled toward the viewer via perspective
     projection, making the mesh appear to bulge in 3D.
  ─────────────────────────────────────────────────────────────────── */
  function drawMesh(cW, cH, dark) {
    // Smooth-follow cursor (screen space)
    const tx = mouse.x<0 ? cW/2 : mouse.x;
    const ty = mouse.y<0 ? cH/2 : mouse.y;
    meshMX += (tx - meshMX) * 0.07;
    meshMY += (ty - meshMY) * 0.07;

    // Grid cell size — fixed world units, tiles infinitely with pan
    const CELL=68, RADIUS=230, DEPTH=88, FOV=900;
    const lc = dark?'rgba(237,237,237,0.072)':'rgba(17,17,17,0.072)';
    const dc = dark?'rgba(237,237,237,0.15)':'rgba(17,17,17,0.14)';

    // Pan offset — grid follows the nodes
    const ox = ((panX % CELL) + CELL) % CELL;
    const oy = ((panY % CELL) + CELL) % CELL;
    const cols = Math.ceil(cW/CELL)+2;
    const rows = Math.ceil(cH/CELL)+2;

    // Build distorted grid (perspective lens centred on cursor, screen-space)
    const pts=[];
    for(let r=0;r<rows;r++){
      pts.push([]);
      for(let c=0;c<cols;c++){
        const bx=(c-1)*CELL+ox, by=(r-1)*CELL+oy;
        const dx=meshMX-bx, dy=meshMY-by;
        const dist=Math.sqrt(dx*dx+dy*dy);
        const t=Math.max(0,1-dist/RADIUS);
        const s=t*t*(3-2*t);
        const z=-DEPTH*s;               // pull toward viewer
        const scale=FOV/(FOV+z);        // z<0 → scale>1 → outward bulge
        const cx=cW/2, cy=cH/2;
        pts[r].push({
          x: cx+(bx-cx)*scale,
          y: cy+(by-cy)*scale
        });
      }
    }

    ctx.save();
    ctx.strokeStyle=lc; ctx.lineWidth=0.75;

    for(let r=0;r<rows;r++){
      ctx.beginPath();
      for(let c=0;c<cols;c++){
        const p=pts[r][c];
        c===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
      }
      ctx.stroke();
    }
    for(let c=0;c<cols;c++){
      ctx.beginPath();
      for(let r=0;r<rows;r++){
        const p=pts[r][c];
        r===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
      }
      ctx.stroke();
    }
    ctx.fillStyle=dc;
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      const p=pts[r][c];
      ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,Math.PI*2); ctx.fill();
    }

    // Cursor glow
    if(mouse.x>=0){
      const grd=ctx.createRadialGradient(meshMX,meshMY,0,meshMX,meshMY,RADIUS*0.5);
      grd.addColorStop(0,dark?'rgba(249,184,192,0.07)':'rgba(249,184,192,0.06)');
      grd.addColorStop(1,'rgba(249,184,192,0)');
      ctx.fillStyle=grd;
      ctx.beginPath(); ctx.arc(meshMX,meshMY,RADIUS*0.5,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  (function draw(){
    requestAnimationFrame(draw);
    if(!W||!H)return;
    glowT += 0.018;
    const dark=isDark(), fg=dark?'#ededed':'#111111',
          ec=dark?'rgba(237,237,237,.10)':'rgba(17,17,17,.09)';
    const cW=cssW(), cH=cssH();
    ctx.clearRect(0,0,cW,cH);

    // ── Normalise pan for seamless torus loop ──
    panX=((panX+WORLD_W/2)%WORLD_W+WORLD_W)%WORLD_W-WORLD_W/2;
    panY=((panY+WORLD_H/2)%WORLD_H+WORLD_H)%WORLD_H-WORLD_H/2;

    // ── Idle drift — very slow, independent per node ──
    const driftT = glowT * 0.29;
    NODES.forEach(n=>{
      n._dx = Math.sin(driftT + n._dph_x) * n._damp_x;
      n._dy = Math.cos(driftT * 0.88 + n._dph_y) * n._damp_y;
    });

    // ── Interactive 3D mesh background ──
    drawMesh(cW, cH, dark);

    // ── Hover detection — check all 3×3 tiles ──
    let newHov=null, minHD=Infinity;
    for(const tx of TILES) for(const ty of TILES){
      NODES.forEach(n=>{
        const s=ns(n,tx*WORLD_W,ty*WORLD_H);
        const d=Math.hypot(mouse.x-s.x,mouse.y-s.y);
        if(d<n._br+12&&d<minHD){newHov=n;minHD=d;}
      });
    }
    if(newHov!==hov){
      hov=newHov;
      if(hov){
        // Card near the tile instance closest to screen centre
        let bestS=ns(hov), bestD=Infinity;
        for(const tx of TILES) for(const ty of TILES){
          const s=ns(hov,tx*WORLD_W,ty*WORLD_H);
          const d=Math.hypot(s.x-cW/2,s.y-cH/2);
          if(d<bestD){bestD=d;bestS=s;}
        }
        wwcName.textContent=hov.label;
        wwcSub.textContent=hov.sub;
        if(wwcDesc) wwcDesc.textContent=hov.desc;
        wwcBadge.textContent=hov.badge;
        const cx=bestS.x+50, px=cx+300>cW?bestS.x-50-300:cx;
        card.style.left=Math.max(8,px)+'px';
        card.style.top=Math.max(72,Math.min(cH-185,bestS.y-80))+'px';
        card.style.right='auto'; card.classList.add('active');
        canvas.style.cursor='pointer';
      } else {
        card.classList.remove('active');
        canvas.style.cursor=isDrag?'grabbing':'grab';
      }
    }

    // ── Edges — render per tile, cull off-screen ──
    for(const tx of TILES) for(const ty of TILES){
      const ox=tx*WORLD_W, oy=ty*WORLD_H;
      EDGES.forEach(e=>{
        const a=NODES.find(n=>n.id===e.s), b=NODES.find(n=>n.id===e.t);
        if(!a||!b)return;
        const as=ns(a,ox,oy), bs=ns(b,ox,oy), pad=80;
        if(as.x<-pad&&bs.x<-pad||as.x>cW+pad&&bs.x>cW+pad||
           as.y<-pad&&bs.y<-pad||as.y>cH+pad&&bs.y>cH+pad) return;
        const isHE=hov&&(hov.id===a.id||hov.id===b.id);
        ctx.beginPath(); ctx.moveTo(as.x,as.y); ctx.lineTo(bs.x,bs.y);
        ctx.strokeStyle=isHE?(dark?'rgba(237,237,237,.30)':'rgba(17,17,17,.24)'):ec;
        ctx.lineWidth=isHE?2:1.2; ctx.stroke();
      });
    }

    // ── Nodes — lerp radii then draw per tile ──
    NODES.forEach(n=>{ n.r+=(((hov===n)?n._br*1.55:n._br)-n.r)*0.13; });

    for(const tx of TILES) for(const ty of TILES){
      const ox=tx*WORLD_W, oy=ty*WORLD_H;
      NODES.forEach(n=>{
        const s=ns(n,ox,oy), r=n.r, isH=(hov===n), pad=r*4+10;
        if(s.x<-pad||s.x>cW+pad||s.y<-pad||s.y>cH+pad) return;
        if(isH){
          const pulse=0.85+0.15*Math.sin(glowT);
          const g=ctx.createRadialGradient(s.x,s.y,r*0.3,s.x,s.y,r*3.8*pulse);
          g.addColorStop(0,n.color+'60'); g.addColorStop(1,n.color+'00');
          ctx.beginPath(); ctx.arc(s.x,s.y,r*3.8*pulse,0,Math.PI*2);
          ctx.fillStyle=g; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(s.x,s.y,r,0,Math.PI*2);
        ctx.fillStyle=n.color+(isH?'ff':'cc'); ctx.fill();
        ctx.textAlign='center';
        ctx.font=`${isH?600:400} ${isH?14:11}px Inter,system-ui,sans-serif`;
        ctx.fillStyle=isH?fg:(dark?'rgba(237,237,237,.50)':'rgba(17,17,17,.48)');
        ctx.fillText(n.label,s.x,s.y+r+16);
      });
    }

    // ── Drag hint ──
    if(hintAlpha>0){
      ctx.save();
      ctx.globalAlpha=hintAlpha*(0.55+0.45*Math.sin(glowT*0.6));
      ctx.textAlign='center';
      ctx.font='400 9px Inter,system-ui,sans-serif';
      ctx.fillStyle=fg;
      ctx.fillText('← DRAG TO EXPLORE  ·  HOVER A NODE →',cW/2,cH-22);
      ctx.restore();
    }
  })();
}

/* =================================================================
   MOBILE WORKS — tap-to-expand card grid (touch devices only)
================================================================= */
function initMobileWorks() {
  const wrap = document.getElementById('works-mobile-grid');
  if (!wrap || wrap._init) return;
  wrap._init = true;

  const WORKS = [
    {label:'Orbital Guardian',    sub:'Space Tech · Solo · 2024',             badge:'PM STAGE',      color:'#86efac',
     desc:'Computer-vision-based debris detection with a servo-aligned net concept. Presented directly to the Prime Minister of India at Pariksha Pe Charcha 2024.'},
    {label:'Head Boy',            sub:'Leadership · DAV · 2025–26',           badge:'ELECTED',       color:'#c4b5fd',
     desc:'Elected Head Boy for a 3,500-student school, coordinating a 70-member council and taking responsibility for actual operations, events, and student representation.'},
    {label:'FLL World #8',        sub:'Robotics · Detroit · 2019',            badge:'WORLD #8',      color:'#fb923c',
     desc:'FIRST Lego League World Festival, Detroit 2019. Global Rank #8 out of 110+ nations after qualifying #1 in North India.'},
    {label:'Terra Mitra',         sub:'AgriTech · Co-founder · 2023',         badge:'TOP 24',        color:'#86efac',
     desc:'AI-enabled farming device. Reached the Top 24 out of 13,000 projects at NEP Celebrations and was presented to the Missions Director of AIM.'},
    {label:'Shravan Doot',        sub:'Assistive Tech · Co-founder · 2025',   badge:'SEMIFINALIST',  color:'#f9b8c0',
     desc:'Smart glasses for the hearing-impaired using Raspberry Pi. Converts speech to text on-lens in real time. Reached national semifinals.'},
    {label:'ACON',                sub:'Event Ops · Core Lead · 2021–25',      badge:'FIELD OPS',     color:'#c4b5fd',
     desc:'Handled logistics, volunteer coordination, outreach, and registration recovery for ACON. Brought back two schools by cold-calling when registrations slowed.'},
    {label:'MarksMaxxing',        sub:'AI Product · Co-founder · 2026',       badge:'10-DAY BUILD',  color:'#fcd34d',
     desc:'AI-powered exam-analysis build made from 1,000+ pages of past papers to surface useful patterns and high-yield preparation areas.'},
    {label:'Blockchain Simulator',sub:'Python · Systems Research',            badge:'SIMULATION',    color:'#93c5fd',
     desc:'Built a Python blockchain simulator to understand hashing, block creation, transaction flow, and the logic of chain validation.'},
    {label:'Monte Carlo Options', sub:'Quant Finance · Research',             badge:'RESEARCH',      color:'#93c5fd',
     desc:'Built a Monte Carlo simulator and compared its outputs with the Black-Scholes formula to understand how close simulation and theory get.'},
    {label:'Grade 6 Violin',      sub:'ISOM · Performance',                   badge:'GRADE 6',       color:'#f9b8c0',
     desc:'Reached Grade 6 in violin and performed at Hard Rock Cafe, school events, and The Piano Man in New Delhi.'},
    {label:'Vigyantram',          sub:'IIT Bombay · Abhyuday',                badge:'2ND PLACE',     color:'#fb923c',
     desc:'2nd Position (Regional) at Vigyantram, Abhyuday — IIT Bombay’s annual innovation competition.'},
    {label:'IRC 2025',            sub:'International Robotics League',         badge:'FINALIST',      color:'#fb923c',
     desc:'National Finalist at the International Robotics League 2025.'},
    {label:'MUN Awards',          sub:'Concordia · SHISMUN · BBI MUN',        badge:'MULTIPLE',      color:'#c4b5fd',
     desc:'Multiple Model United Nations awards across conferences including Concordia MUN, SHISMUN, and BBI MUN.'},
    {label:'Endless Media',       sub:'Venture · Founder · 2023',             badge:'OUTREACH',      color:'#86efac',
     desc:'Cold-outreach-led marketing venture that turned into real business meetings and taught me selling through execution.'},
    {label:'Kaizen Ace',          sub:'Venture · Founder · 2024',             badge:'EXPERIMENT',    color:'#fb923c',
     desc:'Print-on-demand apparel experiment used to learn supplier coordination, fulfillment, and unit economics.'},
  ];

  const grid = document.createElement('div');
  grid.className = 'wmob-grid';
  WORKS.forEach((w, idx) => {
    const card = document.createElement('div');
    card.className = 'wmob-card';
    // Staggered fade-in + offset pulse phase per card
    const inDelay   = (idx * 0.055).toFixed(2);
    const pulseDelay = (1 + idx * 0.28).toFixed(2);
    card.style.animationDelay = `${inDelay}s, ${pulseDelay}s`;
    card.innerHTML = `<span class="wmob-dot" style="background:${w.color}"></span>
      <div class="wmob-main">
        <div class="wmob-name">${w.label}</div>
        <div class="wmob-sub">${w.sub}</div>
      </div>
      <div class="wmob-detail">
        <span class="wmob-badge">${w.badge}</span>
        <div class="wmob-desc">${w.desc}</div>
      </div>
      <span class="wmob-arrow">▶</span>`;
    card.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      grid.querySelectorAll('.wmob-card.open').forEach(c=>c.classList.remove('open'));
      if (!isOpen) card.classList.add('open');
    });
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
}

/* =================================================================
   MOBILE CIRCLE GRAPH — 2D radial skill map (touch devices only)
================================================================= */
function initMobileGraph() {
  const wrap = document.getElementById('mgraph-wrap');
  if (!wrap || wrap._init) return;
  wrap._init = true;

  const canvas = document.getElementById('mgraph-canvas');
  const ctx = canvas.getContext('2d');
  const phEl = document.getElementById('mgi-placeholder');
  const dtEl = document.getElementById('mgi-detail');
  const grpEl = document.getElementById('mgi-group');
  const nmEl  = document.getElementById('mgi-name');
  const orEl  = document.getElementById('mgi-origin');

  const GD = GRAPH_DATA || {nodes:[],edges:[],details:{}};
  const GNODES = GD.nodes, GEDGES = GD.edges, GDETAIL = GD.details || {};
  const GROUP_COLOR = {craft:'#f9b8c0',mind:'#93c5fd',build:'#86efac',people:'#fcd34d',passion:'#fb923c'};
  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
  let W, H, CX, CY, R, selected = null, autoRot = 0;

  function resize() {
    const pw = Math.max(200, wrap.offsetWidth || window.innerWidth);
    // Clear inline height so flex computes the real height, then read it back
    canvas.style.height = '';
    const ph = Math.max(220, canvas.offsetHeight || (window.innerHeight - 180));
    W = canvas.width = pw; H = canvas.height = ph;
    canvas.style.width = pw+'px';
    CX = pw/2; CY = ph/2;
    R = Math.min(CX - 14, CY - 14);
  }

  // Defer first resize + start rAF loop after flex layout computes
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ resize(); draw(); }));

  const N = GNODES.length;

  // Compute positions based on current autoRot angle
  function getPos(i) {
    const a = (i/N)*Math.PI*2 - Math.PI/2 + autoRot;
    return { x: CX+R*Math.cos(a), y: CY+R*Math.sin(a) };
  }

  // Pre-build adjacency for highlight
  const adj = GNODES.map((_,i)=>GEDGES.reduce((acc,e)=>{
    const si=GNODES.findIndex(n=>n.id===e.s), ti=GNODES.findIndex(n=>n.id===e.t);
    if(si===i)acc.push(ti); if(ti===i)acc.push(si); return acc;
  },[]));

  let rafId = null;
  function draw() {
    rafId = requestAnimationFrame(draw);
    autoRot += 0.0004; // Very slow rotation
    const dark = isDark();
    const fg = dark ? '#ededed' : '#111';
    ctx.clearRect(0,0,CX*2,CY*2);

    // Faint outer ring guide
    ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2);
    ctx.strokeStyle = dark?'rgba(237,237,237,0.06)':'rgba(17,17,17,0.06)';
    ctx.lineWidth=1; ctx.stroke();

    const selIdx = selected ? GNODES.findIndex(n=>n.id===selected.id) : -1;
    const COLOR = n => GROUP_COLOR[n.group] || '#aaa';

    // Faint ring guide
    ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2);
    ctx.strokeStyle = dark?'rgba(237,237,237,0.06)':'rgba(17,17,17,0.06)';
    ctx.lineWidth=1; ctx.stroke();

    // Edges
    GEDGES.forEach(e=>{
      const ai=GNODES.findIndex(n=>n.id===e.s), bi=GNODES.findIndex(n=>n.id===e.t);
      if(ai<0||bi<0)return;
      const pa=getPos(ai), pb=getPos(bi);
      const hi=(selIdx>=0)&&(adj[selIdx].includes(ai)||ai===selIdx)&&(adj[selIdx].includes(bi)||bi===selIdx);
      ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y);
      ctx.strokeStyle = hi
        ? (dark?'rgba(237,237,237,0.50)':'rgba(17,17,17,0.42)')
        : (dark?'rgba(237,237,237,0.07)':'rgba(17,17,17,0.065)');
      ctx.lineWidth = hi ? 1.6 : 0.7; ctx.stroke();
    });

    // Nodes
    GNODES.forEach((n,i)=>{
      const p=getPos(i), isSel=(i===selIdx);
      const isConn=selIdx>=0&&(isSel||adj[selIdx].includes(i));
      const r = isSel ? 14 : 11;
      const alpha = selIdx<0 ? 1 : (isConn ? 1 : 0.18);

      ctx.save(); ctx.globalAlpha=alpha;
      if(isSel){
        // Glow ring for selected node
        const g=ctx.createRadialGradient(p.x,p.y,r,p.x,p.y,r*3);
        g.addColorStop(0,COLOR(n)+'60'); g.addColorStop(1,COLOR(n)+'00');
        ctx.beginPath(); ctx.arc(p.x,p.y,r*3,0,Math.PI*2);
        ctx.fillStyle=g; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2);
      ctx.fillStyle=COLOR(n)+(isSel?'ff':'cc'); ctx.fill();
      ctx.restore();

      // Labels for selected + connected nodes
      if(selIdx>=0&&isConn){
        ctx.save(); ctx.globalAlpha=isSel?1:0.7;
        ctx.textAlign='center';
        ctx.font=`${isSel?'700':'400'} ${isSel?11:8}px Inter,system-ui,sans-serif`;
        ctx.fillStyle=fg;
        const lx=CX+(p.x-CX)*1.22, ly=CY+(p.y-CY)*1.22+(p.y<=CY?-5:13);
        ctx.fillText(n.label,lx,ly);
        ctx.restore();
      }
    });
  }

  // Tap handler — pause rotation while reading
  canvas.addEventListener('pointerdown', e=>{
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    let tapped=null, minD=Infinity;
    GNODES.forEach((n,i)=>{
      const p=getPos(i);
      const d=Math.hypot(mx-p.x, my-p.y);
      if(d<28&&d<minD){tapped=n;minD=d;}
    });
    selected=tapped;
    if(tapped){
      const d=GDETAIL[tapped.id]||{};
      phEl.style.display='none'; dtEl.style.display='block';
      grpEl.textContent=tapped.group.toUpperCase();
      nmEl.textContent=tapped.label;
      orEl.textContent=d.origin||'—';
    } else {
      phEl.style.display='block'; dtEl.style.display='none';
    }
  });

  document.getElementById('theme-toggle')?.addEventListener('click',()=>{});
  window.addEventListener('resize',()=>{ if(rafId) cancelAnimationFrame(rafId); rafId=null; resize(); draw(); });
}
