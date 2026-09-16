import { DurableObject } from "cloudflare:workers";

const HTML = "<!doctype html>\n<html lang=\"it\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover\">\n<meta name=\"theme-color\" content=\"#0b151a\">\n<title>Biliardino NOI</title>\n<style>\n:root{\n  --green:#c9d81e;--blue:#3480d4;--ink:#071016;\n  --glass:rgba(4,11,15,.50);--glass2:rgba(4,11,15,.72);\n}\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml,body{margin:0;width:100%;height:100%;overflow:hidden;background:#071016;color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif}\nbody{overscroll-behavior:none}\nbutton,input{font:inherit}\n#app{position:fixed;inset:0;overflow:hidden;background:#071016}\n#game{position:absolute;inset:0;width:100%;height:100%;display:block;background:#176b3a;touch-action:none}\n\n.overlay{position:absolute;inset:0;pointer-events:none}\n.glass{\n  background:var(--glass);\n  border:1px solid rgba(255,255,255,.18);\n  box-shadow:0 3px 10px rgba(0,0,0,.14);\n}\n#hud{\n  position:absolute;top:max(6px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);\n  display:flex;align-items:center;gap:8px;padding:5px 9px;border-radius:13px;white-space:nowrap\n}\n.teamScore{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:900}\n.teamScore b{font-size:20px;line-height:1}\n.dot{width:9px;height:9px;border-radius:50%}.dot.g{background:var(--green)}.dot.b{background:var(--blue)}\n#mode{font-size:9px;opacity:.78;border:1px solid rgba(255,255,255,.16);border-radius:99px;padding:3px 6px}\n\n#menuBtn{\n  position:absolute;left:max(8px,env(safe-area-inset-left));top:max(7px,env(safe-area-inset-top));\n  width:42px;height:42px;border-radius:13px;color:#fff;font-size:18px;font-weight:900;pointer-events:auto\n}\n#roomBadge{\n  position:absolute;right:max(8px,env(safe-area-inset-right));top:max(8px,env(safe-area-inset-top));\n  padding:7px 9px;border-radius:11px;font-size:10px;font-weight:900\n}\n.hidden{display:none!important}\n\n.controls{\n  position:absolute;bottom:max(10px,env(safe-area-inset-bottom));\n  display:flex;flex-direction:column;gap:8px;pointer-events:auto\n}\n#moveControls{left:max(10px,env(safe-area-inset-left))}\n#shotControls{right:max(10px,env(safe-area-inset-right))}\n.touch{\n  width:72px;height:62px;border-radius:18px;border:1px solid rgba(255,255,255,.24);\n  background:rgba(3,10,14,.42);color:#fff;font-weight:950;\n  box-shadow:0 3px 9px rgba(0,0,0,.13);\n  touch-action:none;user-select:none;-webkit-user-select:none\n}\n.touch:active,.touch.on{background:rgba(255,255,255,.18);transform:scale(.97)}\n.arrow{font-size:25px}\n#chargeBtn{font-size:11px;letter-spacing:.35px}\n#shootBtn{font-size:13px;background:rgba(201,216,30,.30);border-color:rgba(226,239,73,.52)}\n#power{\n  position:absolute;right:calc(max(10px,env(safe-area-inset-right)) + 81px);\n  bottom:max(12px,env(safe-area-inset-bottom));\n  width:50px;height:50px;border-radius:50%;display:grid;place-items:center;\n  background:conic-gradient(var(--green) 0deg,rgba(3,10,14,.42) 0deg);\n  border:1px solid rgba(255,255,255,.18);font-size:10px;font-weight:950\n}\n#power:before{content:\"\";position:absolute;inset:6px;border-radius:50%;background:rgba(5,13,18,.78)}\n#powerText{position:relative}\n#toast{\n  position:absolute;left:50%;bottom:14px;transform:translateX(-50%);\n  background:rgba(0,0,0,.60);padding:7px 12px;border-radius:99px;\n  font-size:11px;font-weight:900;opacity:0;transition:opacity .12s\n}\n#toast.show{opacity:1}\n\n.screen{\n  position:absolute;inset:0;z-index:20;display:grid;place-items:center;padding:16px;\n  background:radial-gradient(circle at 50% 40%,rgba(31,78,58,.82),rgba(4,10,14,.97))\n}\n.panel{\n  width:min(92vw,430px);padding:19px;border-radius:22px;background:rgba(7,16,22,.91);\n  border:1px solid rgba(255,255,255,.15);box-shadow:0 20px 55px rgba(0,0,0,.30)\n}\n.panel h1{margin:0 0 5px;font-size:29px;letter-spacing:-1px}.panel p{margin:0 0 16px;color:rgba(255,255,255,.68);font-size:13px;line-height:1.42}\n.grid{display:grid;gap:9px}\n.big{min-height:56px;border:0;border-radius:15px;font-weight:950;font-size:15px;padding:0 15px}\n.cpu{background:var(--green);color:#111}.online{background:var(--blue);color:#fff}\n.sub{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff}\n.join{display:grid;grid-template-columns:1fr auto;gap:8px}\ninput{min-width:0;height:52px;border-radius:14px;border:1px solid rgba(255,255,255,.20);background:rgba(0,0,0,.28);color:#fff;padding:0 12px;font-size:18px;font-weight:950;text-transform:uppercase;outline:none}\n\n#rotate{z-index:50;background:#071016;text-align:center}\n#rotate .ico{font-size:52px;margin-bottom:8px}\n#rotate b{font-size:21px}#rotate span{display:block;color:rgba(255,255,255,.62);margin-top:6px;font-size:13px}\n\n@media (orientation:portrait) and (max-width:900px){#rotate{display:grid!important}}\n@media (orientation:landscape){#rotate{display:none!important}}\n@media(max-height:430px){\n  .touch{width:64px;height:53px;border-radius:15px}.controls{gap:6px}\n  #power{right:calc(max(8px,env(safe-area-inset-right)) + 71px);width:44px;height:44px}\n  #hud{padding:4px 7px}.teamScore b{font-size:17px}#menuBtn{width:38px;height:38px}\n}\n</style>\n</head>\n<body>\n<div id=\"app\">\n<canvas id=\"game\" width=\"960\" height=\"540\"></canvas>\n\n<div class=\"overlay\">\n  <div id=\"hud\" class=\"glass\">\n    <span class=\"teamScore\"><span class=\"dot g\"></span>VERDE <b id=\"sg\">0</b></span>\n    <span id=\"mode\">CPU</span>\n    <span class=\"teamScore\"><b id=\"sb\">0</b> BLU<span class=\"dot b\"></span></span>\n  </div>\n  <button id=\"menuBtn\" class=\"glass\">\u2630</button>\n  <div id=\"roomBadge\" class=\"glass hidden\">\u2014</div>\n\n  <div id=\"moveControls\" class=\"controls\">\n    <button id=\"upBtn\" class=\"touch arrow\">\u25b2</button>\n    <button id=\"downBtn\" class=\"touch arrow\">\u25bc</button>\n  </div>\n  <div id=\"shotControls\" class=\"controls\">\n    <button id=\"chargeBtn\" class=\"touch\">CARICA</button>\n    <button id=\"shootBtn\" class=\"touch\">TIRA</button>\n  </div>\n  <div id=\"power\"><span id=\"powerText\">0%</span></div>\n  <div id=\"toast\"></div>\n</div>\n\n<div id=\"mainMenu\" class=\"screen\">\n  <div class=\"panel\">\n    <h1>Biliardino NOI</h1>\n    <p>Ruota il telefono. Controlli tutte le stecche della tua squadra.</p>\n    <div class=\"grid\">\n      <button id=\"cpuBtn\" class=\"big cpu\">GIOCA VS CPU</button>\n      <button id=\"onlineBtn\" class=\"big online\">GIOCA ONLINE</button>\n    </div>\n  </div>\n</div>\n\n<div id=\"onlineMenu\" class=\"screen hidden\">\n  <div class=\"panel\">\n    <h1>Partita online</h1>\n    <p>Uno crea la stanza, l'altro apre lo stesso link e inserisce il codice.</p>\n    <div class=\"grid\">\n      <button id=\"createBtn\" class=\"big online\">CREA STANZA</button>\n      <div class=\"join\">\n        <input id=\"roomInput\" maxlength=\"5\" placeholder=\"CODICE\">\n        <button id=\"joinBtn\" class=\"big sub\">ENTRA</button>\n      </div>\n      <button id=\"backBtn\" class=\"big sub\">INDIETRO</button>\n    </div>\n  </div>\n</div>\n\n<div id=\"waiting\" class=\"screen hidden\">\n  <div class=\"panel\" style=\"text-align:center\">\n    <h1 id=\"waitTitle\">Stanza creata</h1>\n    <p id=\"waitText\">Condividi il codice con l'altro giocatore.</p>\n    <div id=\"bigCode\" style=\"font-size:42px;font-weight:1000;letter-spacing:5px;color:var(--green);margin:10px 0 18px\">\u2014</div>\n    <button id=\"cancelBtn\" class=\"big sub\" style=\"width:100%\">ANNULLA</button>\n  </div>\n</div>\n\n<div id=\"rotate\" class=\"screen hidden\">\n  <div><div class=\"ico\">\u21bb</div><b>Ruota il telefono</b><span>Il biliardino si gioca in orizzontale.</span></div>\n</div>\n</div>\n\n<script>\n(()=>{\n\"use strict\";\nconst $=id=>document.getElementById(id);\nconst canvas=$(\"game\"),ctx=canvas.getContext(\"2d\",{alpha:false,desynchronized:true});\nconst W=960,H=540,WALL=19,GT=198,GB=342,BR=9,PR=16;\nconst BASE={1:[270],2:[185,355],3:[140,270,400],5:[90,180,270,360,450]};\nconst L=[\n {team:\"green\",x:76,count:1},{team:\"green\",x:218,count:2},\n {team:\"blue\",x:315,count:3},{team:\"green\",x:420,count:5},\n {team:\"blue\",x:540,count:5},{team:\"green\",x:645,count:3},\n {team:\"blue\",x:742,count:2},{team:\"blue\",x:884,count:1}\n];\nconst ui={main:$(\"mainMenu\"),online:$(\"onlineMenu\"),wait:$(\"waiting\"),room:$(\"roomBadge\"),mode:$(\"mode\"),sg:$(\"sg\"),sb:$(\"sb\"),toast:$(\"toast\"),power:$(\"power\"),powerText:$(\"powerText\")};\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;\n\nlet mode=\"menu\",side=\"green\",room=\"\",ws=null;\nlet input={up:false,down:false},charging=false,charge=0;\nlet last=performance.now(),acc=0,toastTimer=0;\nconst STEP=1/120;\n\nfunction makeState(){\n return {\n  score:{green:0,blue:0},\n  rods:L.map(()=>({offset:0,kick:-1,kickPower:0,hit:false})),\n  ball:{x:480,y:270,vx:225,vy:70,angle:0,still:0},\n  message:\"\"\n };\n}\nlet local=makeState();\nlet render=makeState();\nlet snapshots=[];\n\nfunction clone(s){return JSON.parse(JSON.stringify(s))}\nfunction toast(t,ms=800){\n ui.toast.textContent=t;ui.toast.classList.add(\"show\");\n clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove(\"show\"),ms);\n}\nfunction setPower(v){\n charge=clamp(v,0,1);const p=Math.round(charge*100);\n ui.powerText.textContent=p+\"%\";\n ui.power.style.background=`conic-gradient(var(--green) ${p*3.6}deg,rgba(3,10,14,.42) ${p*3.6}deg)`;\n}\nasync function enterDisplay(){\n try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen()}catch{}\n try{if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock(\"landscape\")}catch{}\n}\n\nfunction resetBall(st,dir=0){\n const b=st.ball;b.x=480;b.y=270+(Math.random()-.5)*44;\n const d=dir||(Math.random()>.5?1:-1);\n b.vx=d*(180+Math.random()*45);b.vy=(Math.random()-.5)*100;b.angle=0;b.still=0;\n}\nfunction newGame(){\n local=makeState();resetBall(local);render=clone(local);snapshots=[];\n ui.sg.textContent=\"0\";ui.sb.textContent=\"0\";setPower(0);\n}\n\nfunction rodDir(r){return r.team===\"green\"?1:-1}\nfunction kickOffset(r){\n if(r.kick<0){\n   if(mode===\"cpu\"&&r.team===\"green\"&&charging) return 7-charge*18;\n   return 7;\n }\n const t=r.kick;\n // 0..0.18 wind-up, 0.18..0.38 violent forward stroke, then return.\n if(t<.18)return lerp(7,-10-r.kickPower*7,t/.18);\n if(t<.38){\n   const q=(t-.18)/.20;\n   return lerp(-10-r.kickPower*7,38,q*q*(3-2*q));\n }\n const q=clamp((t-.38)/.62,0,1);\n return lerp(38,7,q*q*(3-2*q));\n}\nfunction startKick(st,team,power){\n for(let i=0;i<L.length;i++){\n   if(L[i].team===team){\n     const r=st.rods[i];r.kick=0;r.kickPower=power;r.hit=false;\n   }\n }\n}\nfunction kickerRect(st,i,py){\n const r=L[i],rr=st.rods[i],d=rodDir(r);\n const cx=r.x+d*kickOffset(rr);\n return {cx,cy:py+5,hw:9,hh:14,d};\n}\n\nfunction strikeCollision(st,i,py){\n const rr=st.rods[i];\n if(rr.kick<0||rr.hit||rr.kick<.18||rr.kick>.46)return;\n const k=kickerRect(st,i,py),b=st.ball;\n if(Math.abs(b.x-k.cx)>k.hw+BR||Math.abs(b.y-k.cy)>k.hh+BR)return;\n rr.hit=true;\n const vertical=clamp((b.y-k.cy)/(k.hh+BR),-1,1);\n const force=275+rr.kickPower*650;\n b.vx=k.d*force;\n b.vy=b.vy*.30+vertical*(105+rr.kickPower*195);\n b.x=k.cx+k.d*(k.hw+BR+1);\n}\n\nfunction bodyCollision(st,i,py){\n const r=L[i],b=st.ball,dx=b.x-r.x,dy=b.y-py,dist=Math.hypot(dx,dy),min=BR+PR;\n if(dist>=min||dist<.001)return;\n const nx=dx/dist,ny=dy/dist;\n b.x=r.x+nx*min;b.y=py+ny*min;\n const dot=b.vx*nx+b.vy*ny;\n if(dot<0){\n   const e=.60;b.vx-=(1+e)*dot*nx;b.vy-=(1+e)*dot*ny;\n }\n}\n\nfunction advanceKicks(st,dt){\n for(const rr of st.rods){\n   if(rr.kick>=0){\n     rr.kick+=dt/.18;\n     if(rr.kick>=1){rr.kick=-1;rr.kickPower=0;rr.hit=false}\n   }\n }\n}\n\nfunction score(st,team,labelCPU=false){\n st.score[team]++;\n st.message=team===\"green\"?\"GOOOL!\":(labelCPU?\"Gol CPU\":\"GOOOL BLU!\");\n if(st.score[team]>=5){\n   st.message=(team===\"green\"?\"VERDE\":\"BLU\")+\" VINCE!\";\n   st.ball.vx=0;st.ball.vy=0;\n } else resetBall(st,team===\"green\"?-1:1);\n}\n\nfunction cpuAI(st,dt){\n // One shared blue offset, with human-like delay/limited speed.\n const blue=L.map((r,i)=>r.team===\"blue\"?i:-1).filter(i=>i>=0);\n let target=0,best=1e9;\n for(const i of blue){\n   const r=L[i];\n   for(const base of BASE[r.count]){\n     const err=Math.abs((base+st.rods[i].offset)-st.ball.y);\n     if(err<best){best=err;target=clamp(st.ball.y-base,-74,74)}\n   }\n }\n const current=st.rods[blue[0]].offset;\n const speed=150;\n const next=current+clamp(target-current,-speed*dt,speed*dt);\n blue.forEach(i=>st.rods[i].offset=clamp(next,-74,74));\n\n // Kick only when ball is plausibly reachable.\n let near=false;\n for(const i of blue){\n   const r=L[i],d=rodDir(r);\n   for(const base of BASE[r.count]){\n     const py=base+st.rods[i].offset,dx=(st.ball.x-r.x)*d;\n     if(dx>-15&&dx<52&&Math.abs(st.ball.y-py)<34){near=true;break}\n   }\n   if(near)break;\n }\n if(near&&Math.random()<dt*5.2){\n   const any=blue.some(i=>st.rods[i].kick>=0);\n   if(!any)startKick(st,\"blue\",.28+Math.random()*.58);\n }\n}\n\nfunction simulate(st,dt,cpu=false){\n if(st.score.green>=5||st.score.blue>=5)return;\n\n if(cpu){\n   const move=((input.down?1:0)-(input.up?1:0))*225*dt;\n   for(let i=0;i<L.length;i++)if(L[i].team===\"green\")st.rods[i].offset=clamp(st.rods[i].offset+move,-74,74);\n   cpuAI(st,dt);\n }\n\n advanceKicks(st,dt);\n const b=st.ball,spd=Math.hypot(b.vx,b.vy),subs=clamp(Math.ceil(spd*dt/3.5),1,8),sd=dt/subs;\n for(let s=0;s<subs;s++){\n   const ox=b.x,oy=b.y;b.x+=b.vx*sd;b.y+=b.vy*sd;\n   b.angle+=Math.hypot(b.x-ox,b.y-oy)/BR*(b.vx>=0?1:-1);\n\n   if(b.y-BR<WALL){b.y=WALL+BR;b.vy=Math.abs(b.vy)*.78;b.vx*=.97}\n   if(b.y+BR>H-WALL){b.y=H-WALL-BR;b.vy=-Math.abs(b.vy)*.78;b.vx*=.97}\n\n   for(let i=0;i<L.length;i++){\n     const r=L[i],off=st.rods[i].offset;\n     for(const base of BASE[r.count]){\n       const py=base+off;\n       bodyCollision(st,i,py);\n       strikeCollision(st,i,py);\n     }\n   }\n\n   if(b.x<0){\n     if(b.y>GT&&b.y<GB){score(st,\"blue\",cpu);return}\n     b.x=BR;b.vx=Math.abs(b.vx)*.78;b.vy*=.97;\n   }\n   if(b.x>W){\n     if(b.y>GT&&b.y<GB){score(st,\"green\",cpu);return}\n     b.x=W-BR;b.vx=-Math.abs(b.vx)*.78;b.vy*=.97;\n   }\n }\n\n const speed=Math.hypot(b.vx,b.vy);\n if(speed<4){b.vx=0;b.vy=0}\n else{\n   const decel=26+speed*.0105,ns=Math.max(0,speed-decel*dt),k=ns/speed;\n   b.vx*=k;b.vy*=k;\n }\n if(Math.hypot(b.vx,b.vy)<10){\n   b.still+=dt;\n   if(b.still>=5){st.message=\"Palla ferma: rimessa al centro\";resetBall(st)}\n }else b.still=0;\n}\n\nfunction shoot(){\n const p=Math.max(.08,charge);\n if(mode===\"cpu\")startKick(local,\"green\",p);\n else if(mode===\"online\"){\n   // Immediate local animation for responsiveness, authoritative server decides collision.\n   if(render)startKick(render,side,p);\n   send({type:\"shoot\",power:p});\n }\n charging=false;setPower(0);\n}\n\nfunction wsUrl(code){return (location.protocol===\"https:\"?\"wss:\":\"ws:\")+\"//\"+location.host+\"/ws/\"+encodeURIComponent(code)}\nfunction send(o){if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))}\nasync function createRoom(){\n ui.online.classList.add(\"hidden\");ui.wait.classList.remove(\"hidden\");\n $(\"waitTitle\").textContent=\"Creo la stanza\u2026\";$(\"bigCode\").textContent=\"\u2026\";\n try{\n   const r=await fetch(\"/api/create\",{method:\"POST\"}),j=await r.json();\n   if(!r.ok)throw Error();\n   $(\"waitTitle\").textContent=\"Stanza creata\";$(\"bigCode\").textContent=j.code;\n   $(\"waitText\").textContent=\"Condividi il codice con l'altro giocatore.\";\n   connect(j.code);\n }catch{ui.wait.classList.add(\"hidden\");ui.online.classList.remove(\"hidden\");toast(\"Errore creazione stanza\",1200)}\n}\nfunction connect(code){\n if(ws)try{ws.close()}catch{}\n ws=new WebSocket(wsUrl(code));\n ws.onerror=()=>toast(\"Errore di connessione\",1200);\n ws.onclose=()=>{if(mode===\"online\")toast(\"Connessione chiusa\",1200)};\n ws.onmessage=e=>{\n   const m=JSON.parse(e.data);\n   if(m.type===\"joined\"){\n     room=m.room;side=m.side;ui.room.textContent=\"STANZA \"+room;ui.room.classList.remove(\"hidden\");\n     if(m.waiting)$(\"bigCode\").textContent=room;\n     else{\n       mode=\"online\";ui.mode.textContent=\"ONLINE \u00b7 \"+(side===\"green\"?\"VERDE\":\"BLU\");\n       ui.wait.classList.add(\"hidden\");ui.online.classList.add(\"hidden\");ui.main.classList.add(\"hidden\");\n       toast(\"Avversario connesso!\",900);\n     }\n   }else if(m.type===\"state\"){\n     const now=performance.now();\n     snapshots.push({t:now,s:m.state});\n     if(snapshots.length>8)snapshots.shift();\n     ui.sg.textContent=m.state.score.green;ui.sb.textContent=m.state.score.blue;\n     if(m.state.message)toast(m.state.message,800);\n   }else if(m.type===\"error\")toast(m.message,1200);\n };\n}\n\nfunction sampleOnline(now){\n if(!snapshots.length)return render;\n const delay=72;\n const target=now-delay;\n let a=snapshots[0],b=snapshots[snapshots.length-1];\n for(let i=0;i<snapshots.length-1;i++){\n   if(snapshots[i].t<=target&&snapshots[i+1].t>=target){a=snapshots[i];b=snapshots[i+1];break}\n   if(target>snapshots[i+1].t)a=b=snapshots[i+1];\n }\n const out=clone(b.s);\n if(a!==b){\n   const span=Math.max(1,b.t-a.t),q=clamp((target-a.t)/span,0,1);\n   out.ball.x=lerp(a.s.ball.x,b.s.ball.x,q);\n   out.ball.y=lerp(a.s.ball.y,b.s.ball.y,q);\n   out.ball.angle=lerp(a.s.ball.angle,b.s.ball.angle,q);\n   for(let i=0;i<out.rods.length;i++){\n     out.rods[i].offset=lerp(a.s.rods[i].offset,b.s.rods[i].offset,q);\n     out.rods[i].kick=b.s.rods[i].kick;\n     out.rods[i].kickPower=b.s.rods[i].kickPower;\n   }\n }else{\n   // Short extrapolation after newest snapshot, bounded to avoid runaway prediction.\n   const ahead=clamp((target-b.t)/1000,0,.055);\n   out.ball.x+=out.ball.vx*ahead;\n   out.ball.y+=out.ball.vy*ahead;\n }\n // Local rod prediction: keyboard/touch should feel immediate, not 70ms late.\n const move=((input.down?1:0)-(input.up?1:0))*225/60;\n for(let i=0;i<L.length;i++){\n   if(L[i].team===side)out.rods[i].offset=clamp(out.rods[i].offset+move,-74,74);\n }\n return out;\n}\n\nfunction field(){\n ctx.fillStyle=\"#176b3a\";ctx.fillRect(0,0,W,H);\n ctx.fillStyle=\"rgba(255,255,255,.024)\";\n for(let x=0;x<W;x+=96)ctx.fillRect(x,0,48,H);\n ctx.strokeStyle=\"rgba(255,255,255,.76)\";ctx.lineWidth=3;\n ctx.strokeRect(WALL,WALL,W-WALL*2,H-WALL*2);\n ctx.beginPath();ctx.moveTo(W/2,WALL);ctx.lineTo(W/2,H-WALL);ctx.stroke();\n ctx.beginPath();ctx.arc(W/2,H/2,70,0,Math.PI*2);ctx.stroke();\n ctx.beginPath();ctx.arc(W/2,H/2,4,0,Math.PI*2);ctx.fillStyle=\"white\";ctx.fill();\n ctx.strokeRect(WALL,155,112,230);ctx.strokeRect(W-WALL-112,155,112,230);\n ctx.strokeRect(WALL,GT,45,GB-GT);ctx.strokeRect(W-WALL-45,GT,45,GB-GT);\n ctx.fillStyle=\"rgba(0,0,0,.27)\";ctx.fillRect(0,GT,WALL,GB-GT);ctx.fillRect(W-WALL,GT,WALL,GB-GT);\n}\nfunction rr(x,y,w,h,r){\n ctx.beginPath();\n if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);\n}\nfunction player(st,i,py,active){\n const r=L[i],rrd=st.rods[i],team=r.team,d=rodDir(r),k=kickerRect(st,i,py);\n ctx.save();\n ctx.fillStyle=\"rgba(0,0,0,.15)\";rr(r.x-12+3,py-15+3,24,30,7);ctx.fill();\n ctx.fillStyle=team===\"green\"?\"#c9d81e\":\"#3480d4\";\n ctx.strokeStyle=active?\"rgba(255,255,255,.95)\":\"rgba(0,0,0,.38)\";\n ctx.lineWidth=active?2.3:1.4;rr(r.x-12,py-15,24,30,7);ctx.fill();ctx.stroke();\n ctx.fillStyle=team===\"green\"?\"#829000\":\"#164e8a\";\n ctx.beginPath();ctx.arc(r.x,py-5,5,0,Math.PI*2);ctx.fill();\n\n // Solid kicker/boot: this is the visible shot animation, not a line.\n const bodyEdge=r.x+d*7,bootEdge=k.cx-d*k.hw;\n ctx.fillStyle=team===\"green\"?\"#9cab0d\":\"#245f9f\";\n const left=Math.min(bodyEdge,bootEdge),ww=Math.abs(bootEdge-bodyEdge);\n rr(left,py+1,Math.max(4,ww),8,4);ctx.fill();\n ctx.fillStyle=team===\"green\"?\"#dce72c\":\"#4c91dc\";\n rr(k.cx-k.hw,k.cy-k.hh,k.hw*2,k.hh*2,4);ctx.fill();\n ctx.strokeStyle=\"rgba(0,0,0,.34)\";ctx.lineWidth=1.2;ctx.stroke();\n\n if(rrd.kick>=.18&&rrd.kick<=.46){\n   ctx.fillStyle=\"rgba(255,255,255,.34)\";\n   ctx.beginPath();ctx.arc(k.cx+d*(k.hw+3),k.cy,3+rrd.kickPower*3,0,Math.PI*2);ctx.fill();\n }\n ctx.restore();\n}\nfunction draw(st){\n field();if(!st)return;\n for(let i=0;i<L.length;i++){\n   const r=L[i],active=mode===\"cpu\"?r.team===\"green\":mode===\"online\"?r.team===side:false,off=st.rods[i].offset||0;\n   ctx.strokeStyle=active?\"rgba(255,255,255,.86)\":\"rgba(14,24,21,.42)\";\n   ctx.lineWidth=active?4:3;ctx.beginPath();ctx.moveTo(r.x,WALL);ctx.lineTo(r.x,H-WALL);ctx.stroke();\n   for(const base of BASE[r.count])player(st,i,base+off,active);\n }\n const b=st.ball;\n ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle||0);\n ctx.fillStyle=\"#faf9f1\";ctx.beginPath();ctx.arc(0,0,BR,0,Math.PI*2);ctx.fill();\n ctx.fillStyle=\"#333\";ctx.beginPath();ctx.arc(3,-2,2.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(-4,3,1.6,0,Math.PI*2);ctx.fill();\n ctx.restore();\n}\n\nfunction loop(now){\n let dt=Math.min(.05,(now-last)/1000||.016);last=now;\n if(charging)setPower(charge+dt/1.05);\n\n if(mode===\"cpu\"){\n   acc+=dt;\n   let loops=0;\n   while(acc>=STEP&&loops<6){simulate(local,STEP,true);acc-=STEP;loops++}\n   if(loops===6)acc=0;\n   render=local;\n   ui.sg.textContent=local.score.green;ui.sb.textContent=local.score.blue;\n   if(local.message){toast(local.message,800);local.message=\"\"}\n }else if(mode===\"online\"){\n   render=sampleOnline(now);\n }\n draw(render);\n requestAnimationFrame(loop);\n}\nrequestAnimationFrame(loop);\n\nfunction hold(btn,key){\n const down=e=>{e.preventDefault();input[key]=true;btn.classList.add(\"on\")};\n const up=e=>{e.preventDefault();input[key]=false;btn.classList.remove(\"on\")};\n btn.addEventListener(\"pointerdown\",down,{passive:false});\n [\"pointerup\",\"pointercancel\",\"pointerleave\"].forEach(ev=>btn.addEventListener(ev,up,{passive:false}));\n}\nhold($(\"upBtn\"),\"up\");hold($(\"downBtn\"),\"down\");\n$(\"chargeBtn\").addEventListener(\"pointerdown\",e=>{e.preventDefault();charging=true;$(\"chargeBtn\").classList.add(\"on\")},{passive:false});\n[\"pointerup\",\"pointercancel\",\"pointerleave\"].forEach(ev=>$(\"chargeBtn\").addEventListener(ev,e=>{e.preventDefault();charging=false;$(\"chargeBtn\").classList.remove(\"on\")},{passive:false}));\n$(\"shootBtn\").addEventListener(\"pointerdown\",e=>{e.preventDefault();shoot()},{passive:false});\n\naddEventListener(\"keydown\",e=>{\n if([\"w\",\"W\",\"s\",\"S\",\"ArrowLeft\",\"ArrowRight\"].includes(e.key))e.preventDefault();\n if(e.key===\"w\"||e.key===\"W\")input.up=true;if(e.key===\"s\"||e.key===\"S\")input.down=true;\n if(e.key===\"ArrowLeft\")charging=true;if(e.key===\"ArrowRight\"&&!e.repeat)shoot();\n});\naddEventListener(\"keyup\",e=>{\n if(e.key===\"w\"||e.key===\"W\")input.up=false;if(e.key===\"s\"||e.key===\"S\")input.down=false;if(e.key===\"ArrowLeft\")charging=false;\n});\nsetInterval(()=>{if(mode===\"online\")send({type:\"input\",up:input.up,down:input.down})},33);\n\n$(\"cpuBtn\").onclick=async()=>{\n await enterDisplay();mode=\"cpu\";side=\"green\";room=\"\";\n if(ws)try{ws.close()}catch{};ws=null;\n ui.main.classList.add(\"hidden\");ui.online.classList.add(\"hidden\");ui.wait.classList.add(\"hidden\");ui.room.classList.add(\"hidden\");\n ui.mode.textContent=\"VS CPU\";newGame();toast(\"VS CPU\",600);\n};\n$(\"onlineBtn\").onclick=async()=>{await enterDisplay();ui.main.classList.add(\"hidden\");ui.online.classList.remove(\"hidden\")};\n$(\"backBtn\").onclick=()=>{ui.online.classList.add(\"hidden\");ui.main.classList.remove(\"hidden\")};\n$(\"createBtn\").onclick=async()=>{await enterDisplay();createRoom()};\n$(\"joinBtn\").onclick=async()=>{\n await enterDisplay();const c=$(\"roomInput\").value.trim().toUpperCase();\n if(!c)return toast(\"Inserisci il codice\",800);\n $(\"bigCode\").textContent=c;$(\"waitTitle\").textContent=\"Connessione\u2026\";$(\"waitText\").textContent=\"Cerco la stanza.\";\n ui.online.classList.add(\"hidden\");ui.wait.classList.remove(\"hidden\");connect(c);\n};\n$(\"cancelBtn\").onclick=()=>{if(ws)try{ws.close()}catch{};ws=null;room=\"\";ui.wait.classList.add(\"hidden\");ui.online.classList.remove(\"hidden\")};\n$(\"menuBtn\").onclick=()=>{\n input.up=input.down=false;charging=false;setPower(0);\n if(ws)try{ws.close()}catch{};ws=null;room=\"\";mode=\"menu\";\n ui.room.classList.add(\"hidden\");ui.wait.classList.add(\"hidden\");ui.online.classList.add(\"hidden\");ui.main.classList.remove(\"hidden\");\n};\nnewGame();\n})();\n</script>\n</body>\n</html>";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return new Response(HTML, {
        headers: {
          "content-type":"text/html;charset=UTF-8",
          "cache-control":"no-store"
        }
      });
    }
    if (url.pathname === "/api/create" && request.method === "POST") {
      const code = makeCode();
      const id = env.ROOMS.idFromName(code);
      await env.ROOMS.get(id).fetch("https://room/init", { method:"POST" });
      return Response.json({ code });
    }
    if (url.pathname.startsWith("/ws/")) {
      const code = url.pathname.slice(4).toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,5);
      if (!code) return new Response("Bad room", {status:400});
      const id = env.ROOMS.idFromName(code);
      return env.ROOMS.get(id).fetch(new Request("https://room/ws?code="+encodeURIComponent(code), request));
    }
    return new Response("Not found", {status:404});
  }
};

function makeCode() {
 const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let s="";
 for(let i=0;i<5;i++)s+=chars[Math.floor(Math.random()*chars.length)];
 return s;
}

const W=960,H=540,WALL=19,GT=198,GB=342,BR=9,PR=16;
const BASE={1:[270],2:[185,355],3:[140,270,400],5:[90,180,270,360,450]};
const L=[
 {team:"green",x:76,count:1},{team:"green",x:218,count:2},
 {team:"blue",x:315,count:3},{team:"green",x:420,count:5},
 {team:"blue",x:540,count:5},{team:"green",x:645,count:3},
 {team:"blue",x:742,count:2},{team:"blue",x:884,count:1}
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;

export class GameRoom extends DurableObject {
 constructor(ctx,env) {
  super(ctx,env);this.ctx=ctx;this.env=env;
  this.clients=new Map();
  this.input={green:{up:false,down:false},blue:{up:false,down:false}};
  this.state=this.makeState();this.created=false;this.timer=null;this.sendAcc=0;
 }
 makeState() {
  return {
   score:{green:0,blue:0},
   rods:L.map(()=>({offset:0,kick:-1,kickPower:0,hit:false})),
   ball:{x:480,y:270,vx:225,vy:70,angle:0,still:0},
   message:""
  };
 }
 async fetch(request) {
  const url=new URL(request.url);
  if(url.pathname==="/init") {
   this.created=true;await this.ctx.storage.put("created",true);return new Response("ok");
  }
  if(url.pathname==="/ws") {
   if(request.headers.get("Upgrade")!=="websocket")return new Response("Expected websocket",{status:426});
   if(!this.created)this.created=!!(await this.ctx.storage.get("created"));
   if(!this.created)return new Response("Room not found",{status:404});
   if(this.clients.size>=2)return new Response("Room full",{status:409});
   const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();
   const used=new Set([...this.clients.values()].map(v=>v.side));
   const side=used.has("green")?"blue":"green";
   this.clients.set(server,{side});
   server.addEventListener("message",e=>this.onMessage(server,e));
   server.addEventListener("close",()=>this.remove(server));
   server.addEventListener("error",()=>this.remove(server));
   const code=url.searchParams.get("code")||"";
   server.send(JSON.stringify({type:"joined",room:code,side,waiting:this.clients.size<2}));
   if(this.clients.size===2)for(const [ws,m] of this.clients)try{ws.send(JSON.stringify({type:"joined",room:code,side:m.side,waiting:false}))}catch{}
   if(!this.timer)this.startLoop();
   return new Response(null,{status:101,webSocket:client});
  }
  return new Response("Not found",{status:404});
 }
 remove(ws) {
  const m=this.clients.get(ws);this.clients.delete(ws);
  if(m)this.input[m.side]={up:false,down:false};
  if(this.clients.size===0&&this.timer){clearInterval(this.timer);this.timer=null}
 }
 onMessage(ws,e) {
  let m;try{m=JSON.parse(e.data)}catch{return}
  const meta=this.clients.get(ws);if(!meta)return;
  if(m.type==="input")this.input[meta.side]={up:!!m.up,down:!!m.down};
  if(m.type==="shoot")this.startKick(meta.side,clamp(Number(m.power)||.08,.08,1));
 }
 startLoop() {
  let last=Date.now(),acc=0;
  this.timer=setInterval(()=>{
   const now=Date.now(),dt=Math.min(.04,(now-last)/1000);last=now;acc+=dt;
   let loops=0;
   while(acc>=1/120&&loops<6){this.step(1/120);acc-=1/120;loops++}
   if(loops===6)acc=0;
   this.sendAcc+=dt;
   if(this.sendAcc>=1/30){this.sendAcc=0;this.broadcast({type:"state",state:this.state});this.state.message=""}
  },16);
 }
 broadcast(o){const t=JSON.stringify(o);for(const ws of this.clients.keys())try{ws.send(t)}catch{}}
 resetBall(dir=0) {
  const b=this.state.ball;b.x=480;b.y=270+(Math.random()-.5)*44;
  const d=dir||(Math.random()>.5?1:-1);b.vx=d*(180+Math.random()*45);b.vy=(Math.random()-.5)*100;b.angle=0;b.still=0;
 }
 rodDir(r){return r.team==="green"?1:-1}
 kickOffset(rr) {
  if(rr.kick<0)return 7;
  const t=rr.kick;
  if(t<.18)return lerp(7,-10-rr.kickPower*7,t/.18);
  if(t<.38){const q=(t-.18)/.20;return lerp(-10-rr.kickPower*7,38,q*q*(3-2*q))}
  const q=clamp((t-.38)/.62,0,1);return lerp(38,7,q*q*(3-2*q));
 }
 startKick(team,power) {
  for(let i=0;i<L.length;i++)if(L[i].team===team){const rr=this.state.rods[i];rr.kick=0;rr.kickPower=power;rr.hit=false}
 }
 kickerRect(i,py) {
  const r=L[i],rr=this.state.rods[i],d=this.rodDir(r),cx=r.x+d*this.kickOffset(rr);
  return {cx,cy:py+5,hw:9,hh:14,d};
 }
 advanceKicks(dt) {
  for(const rr of this.state.rods)if(rr.kick>=0){rr.kick+=dt/.18;if(rr.kick>=1){rr.kick=-1;rr.kickPower=0;rr.hit=false}}
 }
 collisions() {
  const s=this.state,b=s.ball;
  for(let i=0;i<L.length;i++) {
   const r=L[i],rr=s.rods[i],off=rr.offset;
   for(const base of BASE[r.count]) {
    const py=base+off;
    let dx=b.x-r.x,dy=b.y-py,dist=Math.hypot(dx,dy),min=BR+PR;
    if(dist<min&&dist>.001) {
     const nx=dx/dist,ny=dy/dist;b.x=r.x+nx*min;b.y=py+ny*min;
     const dot=b.vx*nx+b.vy*ny;if(dot<0){const e=.60;b.vx-=(1+e)*dot*nx;b.vy-=(1+e)*dot*ny}
    }
    if(rr.kick>=.18&&rr.kick<=.46&&!rr.hit) {
     const k=this.kickerRect(i,py);
     if(Math.abs(b.x-k.cx)<=k.hw+BR&&Math.abs(b.y-k.cy)<=k.hh+BR) {
      rr.hit=true;const vert=clamp((b.y-k.cy)/(k.hh+BR),-1,1),force=275+rr.kickPower*650;
      b.vx=k.d*force;b.vy=b.vy*.30+vert*(105+rr.kickPower*195);b.x=k.cx+k.d*(k.hw+BR+1);
     }
    }
   }
  }
 }
 score(team) {
  const s=this.state;s.score[team]++;s.message=team==="green"?"GOOOL VERDE!":"GOOOL BLU!";
  if(s.score[team]>=5){s.message=(team==="green"?"VERDE":"BLU")+" VINCE!";s.ball.vx=0;s.ball.vy=0}
  else this.resetBall(team==="green"?-1:1);
 }
 step(dt) {
  const s=this.state;if(s.score.green>=5||s.score.blue>=5)return;
  for(const team of ["green","blue"]) {
   const inp=this.input[team],move=((inp.down?1:0)-(inp.up?1:0))*225*dt;
   for(let i=0;i<L.length;i++)if(L[i].team===team)s.rods[i].offset=clamp(s.rods[i].offset+move,-74,74);
  }
  this.advanceKicks(dt);
  const b=s.ball,spd=Math.hypot(b.vx,b.vy),subs=clamp(Math.ceil(spd*dt/3.5),1,8),sd=dt/subs;
  for(let n=0;n<subs;n++) {
   const ox=b.x,oy=b.y;b.x+=b.vx*sd;b.y+=b.vy*sd;b.angle+=Math.hypot(b.x-ox,b.y-oy)/BR*(b.vx>=0?1:-1);
   if(b.y-BR<WALL){b.y=WALL+BR;b.vy=Math.abs(b.vy)*.78;b.vx*=.97}
   if(b.y+BR>H-WALL){b.y=H-WALL-BR;b.vy=-Math.abs(b.vy)*.78;b.vx*=.97}
   this.collisions();
   if(b.x<0){if(b.y>GT&&b.y<GB){this.score("blue");return}b.x=BR;b.vx=Math.abs(b.vx)*.78;b.vy*=.97}
   if(b.x>W){if(b.y>GT&&b.y<GB){this.score("green");return}b.x=W-BR;b.vx=-Math.abs(b.vx)*.78;b.vy*=.97}
  }
  const speed=Math.hypot(b.vx,b.vy);
  if(speed<4){b.vx=0;b.vy=0}else{const decel=26+speed*.0105,ns=Math.max(0,speed-decel*dt),k=ns/speed;b.vx*=k;b.vy*=k}
  if(Math.hypot(b.vx,b.vy)<10){b.still+=dt;if(b.still>=5){s.message="Palla ferma: rimessa al centro";this.resetBall()}}else b.still=0;
 }
}
