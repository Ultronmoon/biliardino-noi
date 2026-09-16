import { DurableObject } from "cloudflare:workers";

const HTML = "<!doctype html>\n<html lang=\"it\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover\">\n<meta name=\"theme-color\" content=\"#0d171c\">\n<title>Biliardino NOI v2</title>\n<style>\n:root{\n  --green:#c9d81e;\n  --blue:#3480d4;\n  --ink:#071016;\n  --glass:rgba(4,11,15,.42);\n  --glass-strong:rgba(4,11,15,.68);\n  --white:#f7f8f3;\n}\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml,body{width:100%;height:100%;margin:0;overflow:hidden;background:#071016;color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif}\nbutton,input{font:inherit}\nbutton{cursor:pointer}\n#app{position:fixed;inset:0;overflow:hidden;background:#071016}\n#gameCanvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;background:#176b3a}\n\n.overlay{position:absolute;inset:0;pointer-events:none}\n.glass{\n  background:var(--glass);\n  border:1px solid rgba(255,255,255,.2);\n  backdrop-filter:blur(8px);\n  -webkit-backdrop-filter:blur(8px);\n  box-shadow:0 4px 18px rgba(0,0,0,.15);\n}\n#hud{position:absolute;top:max(8px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:9px;padding:6px 10px;border-radius:14px;pointer-events:none;white-space:nowrap}\n.scoreTeam{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800}\n.scoreTeam b{font-size:22px;line-height:1}\n.dot{width:10px;height:10px;border-radius:50%}\n.dot.green{background:var(--green)} .dot.blue{background:var(--blue)}\n#modeBadge{font-size:10px;opacity:.78;padding:3px 7px;border:1px solid rgba(255,255,255,.18);border-radius:999px}\n\n#menuBtn{position:absolute;top:max(9px,env(safe-area-inset-top));left:max(9px,env(safe-area-inset-left));width:46px;height:46px;border-radius:14px;color:#fff;font-weight:900;font-size:19px;pointer-events:auto}\n#roomBadge{position:absolute;top:max(11px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));padding:8px 10px;border-radius:12px;font-size:11px;font-weight:800;pointer-events:none;max-width:34vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n\n.controls{position:absolute;bottom:max(12px,env(safe-area-inset-bottom));pointer-events:auto;display:flex;flex-direction:column;gap:10px}\n#moveControls{left:max(12px,env(safe-area-inset-left))}\n#shotControls{right:max(12px,env(safe-area-inset-right))}\n.controlBtn{\n  width:78px;height:70px;border:1px solid rgba(255,255,255,.28);border-radius:20px;\n  background:rgba(7,16,22,.34);color:#fff;font-weight:900;\n  backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);\n  box-shadow:0 4px 18px rgba(0,0,0,.12);\n  touch-action:none;user-select:none;-webkit-user-select:none;\n}\n.controlBtn:active,.controlBtn.pressed{background:rgba(255,255,255,.20);transform:scale(.97)}\n.arrowBtn{font-size:27px}\n#chargeBtn{font-size:12px;letter-spacing:.4px}\n#shootBtn{font-size:14px;background:rgba(201,216,30,.35);border-color:rgba(229,240,83,.55)}\n#powerRing{\n  position:absolute;right:calc(max(12px,env(safe-area-inset-right)) + 88px);\n  bottom:max(16px,env(safe-area-inset-bottom));width:54px;height:54px;border-radius:50%;\n  display:grid;place-items:center;font-size:11px;font-weight:900;pointer-events:none;\n  background:conic-gradient(var(--green) 0deg, rgba(7,16,22,.32) 0deg);\n  border:1px solid rgba(255,255,255,.2)\n}\n#powerRing::before{content:\"\";position:absolute;inset:6px;border-radius:50%;background:rgba(5,13,18,.72)}\n#powerText{position:relative;z-index:1}\n\n#toast{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);padding:8px 13px;border-radius:999px;background:rgba(0,0,0,.55);font-size:12px;font-weight:800;opacity:0;transition:opacity .18s;pointer-events:none}\n#toast.show{opacity:1}\n\n.screen{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 50% 42%,rgba(36,91,67,.78),rgba(4,10,14,.95));z-index:20;padding:18px}\n.panel{width:min(92vw,430px);padding:20px;border-radius:24px;background:rgba(7,16,22,.82);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 22px 70px rgba(0,0,0,.32)}\n.panel h1{font-size:30px;margin:0 0 5px;letter-spacing:-1px}.panel p{margin:0 0 17px;color:rgba(255,255,255,.7);font-size:14px;line-height:1.4}\n.menuGrid{display:grid;gap:10px}\n.bigBtn{min-height:58px;border:0;border-radius:16px;font-weight:900;font-size:16px;padding:0 16px}\n.cpuBtn{background:var(--green);color:#111}\n.onlineBtn{background:var(--blue);color:#fff}\n.subBtn{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.15);color:#fff}\n.joinRow{display:grid;grid-template-columns:1fr auto;gap:8px}\n.roomInput{min-width:0;height:52px;border-radius:14px;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.28);color:#fff;padding:0 13px;font-size:18px;font-weight:900;text-transform:uppercase;outline:none}\n.hidden{display:none!important}\n\n#rotateScreen{z-index:40;text-align:center;background:#071016}\n.rotateIcon{font-size:55px;margin-bottom:10px}\n#rotateScreen b{font-size:22px}#rotateScreen span{display:block;margin-top:7px;color:rgba(255,255,255,.65)}\n\n@media (orientation:portrait) and (max-width:900px){#rotateScreen{display:grid!important}}\n@media (orientation:landscape){#rotateScreen{display:none!important}}\n@media (max-height:430px){\n  .controlBtn{width:67px;height:57px;border-radius:17px}\n  .controls{gap:7px}\n  #powerRing{right:calc(max(9px,env(safe-area-inset-right)) + 76px);width:48px;height:48px}\n  #hud{padding:4px 8px}.scoreTeam b{font-size:18px}\n  #menuBtn{width:40px;height:40px}\n}\n@media (min-width:900px){\n  .controlBtn{width:88px;height:76px}\n}\n</style>\n</head>\n<body>\n<div id=\"app\">\n  <canvas id=\"gameCanvas\" width=\"960\" height=\"540\"></canvas>\n\n  <div class=\"overlay\" id=\"gameUI\">\n    <div id=\"hud\" class=\"glass\">\n      <span class=\"scoreTeam\"><span class=\"dot green\"></span>VERDE <b id=\"scoreGreen\">0</b></span>\n      <span id=\"modeBadge\">CPU</span>\n      <span class=\"scoreTeam\"><b id=\"scoreBlue\">0</b> BLU<span class=\"dot blue\"></span></span>\n    </div>\n\n    <button id=\"menuBtn\" class=\"glass\">\u2630</button>\n    <div id=\"roomBadge\" class=\"glass hidden\">\u2014</div>\n\n    <div id=\"moveControls\" class=\"controls\">\n      <button id=\"upBtn\" class=\"controlBtn arrowBtn\">\u25b2</button>\n      <button id=\"downBtn\" class=\"controlBtn arrowBtn\">\u25bc</button>\n    </div>\n\n    <div id=\"shotControls\" class=\"controls\">\n      <button id=\"chargeBtn\" class=\"controlBtn\">CARICA</button>\n      <button id=\"shootBtn\" class=\"controlBtn\">TIRA</button>\n    </div>\n\n    <div id=\"powerRing\"><span id=\"powerText\">0%</span></div>\n    <div id=\"toast\"></div>\n  </div>\n\n  <div id=\"mainMenu\" class=\"screen\">\n    <div class=\"panel\">\n      <h1>Biliardino NOI</h1>\n      <p>Gioca in orizzontale. Controlli tutte le stecche della tua squadra.</p>\n      <div class=\"menuGrid\">\n        <button id=\"cpuBtn\" class=\"bigBtn cpuBtn\">GIOCA VS CPU</button>\n        <button id=\"onlineBtn\" class=\"bigBtn onlineBtn\">GIOCA ONLINE</button>\n      </div>\n    </div>\n  </div>\n\n  <div id=\"onlineMenu\" class=\"screen hidden\">\n    <div class=\"panel\">\n      <h1>Partita online</h1>\n      <p>Uno crea la stanza, l'altro apre lo stesso link e inserisce il codice.</p>\n      <div class=\"menuGrid\">\n        <button id=\"createBtn\" class=\"bigBtn onlineBtn\">CREA STANZA</button>\n        <div class=\"joinRow\">\n          <input id=\"roomInput\" class=\"roomInput\" maxlength=\"5\" placeholder=\"CODICE\">\n          <button id=\"joinBtn\" class=\"bigBtn subBtn\">ENTRA</button>\n        </div>\n        <button id=\"backBtn\" class=\"bigBtn subBtn\">INDIETRO</button>\n      </div>\n    </div>\n  </div>\n\n  <div id=\"waitingMenu\" class=\"screen hidden\">\n    <div class=\"panel\" style=\"text-align:center\">\n      <h1 id=\"waitingTitle\">Stanza creata</h1>\n      <p id=\"waitingText\">Condividi questo codice con l'altro giocatore.</p>\n      <div id=\"bigCode\" style=\"font-size:42px;font-weight:1000;letter-spacing:5px;margin:10px 0 18px;color:var(--green)\">\u2014</div>\n      <button id=\"cancelWaiting\" class=\"bigBtn subBtn\" style=\"width:100%\">ANNULLA</button>\n    </div>\n  </div>\n\n  <div id=\"rotateScreen\" class=\"screen hidden\">\n    <div>\n      <div class=\"rotateIcon\">\u21bb</div>\n      <b>Ruota il telefono</b>\n      <span>Il biliardino si gioca in orizzontale.</span>\n    </div>\n  </div>\n</div>\n\n<script>\n(() => {\n\"use strict\";\n\nconst canvas=document.getElementById(\"gameCanvas\"),ctx=canvas.getContext(\"2d\");\nconst CW=960,CH=540,WALL=19,GT=198,GB=342,BALL_R=9,PLAYER_R=16;\nconst $=id=>document.getElementById(id);\nconst ui={\n  main:$(\"mainMenu\"),online:$(\"onlineMenu\"),waiting:$(\"waitingMenu\"),\n  roomBadge:$(\"roomBadge\"),mode:$(\"modeBadge\"),toast:$(\"toast\"),\n  sg:$(\"scoreGreen\"),sb:$(\"scoreBlue\"),powerRing:$(\"powerRing\"),powerText:$(\"powerText\")\n};\n\nconst bases={1:[270],2:[185,355],3:[140,270,400],5:[90,180,270,360,450]};\nconst layout=[\n {team:\"green\",x:76,count:1},{team:\"green\",x:218,count:2},\n {team:\"blue\",x:315,count:3},{team:\"green\",x:420,count:5},\n {team:\"blue\",x:540,count:5},{team:\"green\",x:645,count:3},\n {team:\"blue\",x:742,count:2},{team:\"blue\",x:884,count:1}\n];\n\nlet mode=\"menu\"; // menu | cpu | online\nlet side=\"green\", room=null, ws=null;\nlet input={up:false,down:false},charging=false,charge=0;\nlet toastTimer=0,lastFrame=performance.now();\n\nfunction makeState(){\n return {\n  score:{green:0,blue:0},\n  rods:layout.map(()=>({offset:0})),\n  ball:{x:CW/2,y:CH/2,vx:225,vy:70,angle:0,still:0},\n  message:\"\"\n };\n}\nlet localState=makeState();\nlet targetState=null,renderState=makeState();\nlet lastServerAt=0;\n\nfunction cloneState(s){return JSON.parse(JSON.stringify(s))}\nfunction clamp(v,a,b){return Math.max(a,Math.min(b,v))}\nfunction lerp(a,b,t){return a+(b-a)*t}\n\nfunction showToast(text,ms=1200){\n ui.toast.textContent=text;ui.toast.classList.add(\"show\");\n clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove(\"show\"),ms);\n}\n\nasync function enterGameDisplay(){\n try{\n  if(!document.fullscreenElement && document.documentElement.requestFullscreen){\n   await document.documentElement.requestFullscreen();\n  }\n }catch{}\n try{\n  if(screen.orientation && screen.orientation.lock){\n   await screen.orientation.lock(\"landscape\");\n  }\n }catch{}\n}\n\nfunction setPower(v){\n charge=clamp(v,0,1);\n const p=Math.round(charge*100);\n ui.powerText.textContent=p+\"%\";\n ui.powerRing.style.background=`conic-gradient(var(--green) ${p*3.6}deg, rgba(7,16,22,.32) ${p*3.6}deg)`;\n}\n\nfunction resetBall(st,dir=0){\n const b=st.ball;b.x=CW/2;b.y=CH/2+(Math.random()-.5)*42;\n const d=dir||(Math.random()>.5?1:-1);\n b.vx=d*(185+Math.random()*40);b.vy=(Math.random()-.5)*95;b.angle=0;b.still=0;\n}\n\nfunction newLocalGame(){\n localState=makeState();renderState=cloneState(localState);targetState=null;\n resetBall(localState);localState.score.green=0;localState.score.blue=0;\n ui.sg.textContent=\"0\";ui.sb.textContent=\"0\";\n}\n\nfunction score(st,team){\n st.score[team]++;\n st.message=team===\"green\"?\"GOOOL!\":\"Gol CPU\";\n if(st.score[team]>=5){\n   st.message=(team===\"green\"?\"VERDE\":\"BLU\")+\" VINCE!\";\n   st.ball.vx=0;st.ball.vy=0;\n }else resetBall(st,team===\"green\"?-1:1);\n}\n\nfunction findKick(st,team,power){\n const b=st.ball,dir=team===\"green\"?1:-1;\n let best=null,bestD=1e9;\n layout.forEach((r,i)=>{\n  if(r.team!==team)return;\n  for(const base of bases[r.count]){\n   const py=base+st.rods[i].offset;\n   const dx=(b.x-r.x)*dir,dy=Math.abs(b.y-py);\n   if(dx>=-13&&dx<=50&&dy<=31){\n    const d=Math.abs(dx)+dy;\n    if(d<bestD){bestD=d;best={py}}\n   }\n  }\n });\n if(!best)return false;\n const vert=clamp((b.y-best.py)/29,-1,1);\n const force=285+power*625;\n b.vx=dir*force;\n b.vy=b.vy*.32+vert*(100+power*185);\n return true;\n}\n\nfunction collidePlayers(st){\n const b=st.ball;\n layout.forEach((r,i)=>{\n  const off=st.rods[i].offset;\n  for(const base of bases[r.count]){\n   const py=base+off,dx=b.x-r.x,dy=b.y-py,dist=Math.hypot(dx,dy),min=BALL_R+PLAYER_R;\n   if(dist<min&&dist>.001){\n    const nx=dx/dist,ny=dy/dist;\n    b.x=r.x+nx*min;b.y=py+ny*min;\n    const dot=b.vx*nx+b.vy*ny;\n    if(dot<0){\n      const e=.61;b.vx-=(1+e)*dot*nx;b.vy-=(1+e)*dot*ny;\n    }\n   }\n  }\n });\n}\n\nfunction rollingFriction(b,dt){\n const s=Math.hypot(b.vx,b.vy);\n if(s<4){b.vx=0;b.vy=0;return}\n const decel=27+s*.011;\n const ns=Math.max(0,s-decel*dt),k=ns/s;b.vx*=k;b.vy*=k;\n}\n\nfunction physicsStep(st,dt,blueCPU=false){\n const b=st.ball;\n\n if(blueCPU){\n  // CPU: all blue rods move together, but targets a useful blue player rather than tracking perfectly.\n  let bestTarget=0,best=1e9;\n  layout.forEach((r,i)=>{\n   if(r.team!==\"blue\")return;\n   for(const base of bases[r.count]){\n    const want=clamp(b.y-base,-74,74);\n    const err=Math.abs((base+st.rods[i].offset)-b.y);\n    if(err<best){best=err;bestTarget=want}\n   }\n  });\n  const blueIndices=layout.map((r,i)=>r.team===\"blue\"?i:-1).filter(i=>i>=0);\n  const cur=st.rods[blueIndices[0]].offset;\n  const cpuSpeed=155;\n  const next=cur+clamp(bestTarget-cur,-cpuSpeed*dt,cpuSpeed*dt);\n  blueIndices.forEach(i=>st.rods[i].offset=clamp(next,-74,74));\n  if(Math.random()<dt*4.6)findKick(st,\"blue\",.3+Math.random()*.62);\n }\n\n const spd=Math.hypot(b.vx,b.vy);\n const steps=clamp(Math.ceil(spd*dt/4),1,10),sd=dt/steps;\n for(let k=0;k<steps;k++){\n  const ox=b.x,oy=b.y;b.x+=b.vx*sd;b.y+=b.vy*sd;\n  b.angle+=Math.hypot(b.x-ox,b.y-oy)/BALL_R*(b.vx>=0?1:-1);\n\n  if(b.y-BALL_R<WALL){b.y=WALL+BALL_R;b.vy=Math.abs(b.vy)*.76;b.vx*=.96}\n  if(b.y+BALL_R>CH-WALL){b.y=CH-WALL-BALL_R;b.vy=-Math.abs(b.vy)*.76;b.vx*=.96}\n  collidePlayers(st);\n\n  if(b.x<0){\n   if(b.y>GT&&b.y<GB){score(st,\"blue\");return}\n   b.x=BALL_R;b.vx=Math.abs(b.vx)*.76;b.vy*=.96;\n  }\n  if(b.x>CW){\n   if(b.y>GT&&b.y<GB){score(st,\"green\");return}\n   b.x=CW-BALL_R;b.vx=-Math.abs(b.vx)*.76;b.vy*=.96;\n  }\n }\n rollingFriction(b,dt);\n\n // 5 second dead-ball rule\n if(Math.hypot(b.vx,b.vy)<10){\n  b.still+=dt;\n  if(b.still>=5){st.message=\"Palla ferma: rimessa al centro\";resetBall(st)}\n } else b.still=0;\n}\n\nfunction updateCPU(dt){\n if(localState.score.green>=5||localState.score.blue>=5)return;\n const move=((input.down?1:0)-(input.up?1:0))*225*dt;\n layout.forEach((r,i)=>{\n  if(r.team===\"green\")localState.rods[i].offset=clamp(localState.rods[i].offset+move,-74,74);\n });\n physicsStep(localState,dt,true);\n renderState=localState;\n ui.sg.textContent=localState.score.green;ui.sb.textContent=localState.score.blue;\n if(localState.message){showToast(localState.message,850);localState.message=\"\"}\n}\n\nfunction shoot(){\n const p=Math.max(.08,charge);\n if(mode===\"cpu\"){\n  if(!findKick(localState,\"green\",p))showToast(\"Palla fuori portata\",650);\n }else if(mode===\"online\"){\n  send({type:\"shoot\",power:p});\n }\n charging=false;setPower(0);\n}\n\nfunction wsUrl(code){return (location.protocol===\"https:\"?\"wss:\":\"ws:\")+\"//\"+location.host+\"/ws/\"+encodeURIComponent(code)}\nfunction send(obj){if(ws&&ws.readyState===1)ws.send(JSON.stringify(obj))}\n\nasync function createRoom(){\n $(\"waitingTitle\").textContent=\"Creo la stanza\u2026\";$(\"bigCode\").textContent=\"\u2026\";\n ui.online.classList.add(\"hidden\");ui.waiting.classList.remove(\"hidden\");\n try{\n  const r=await fetch(\"/api/create\",{method:\"POST\"}),j=await r.json();\n  if(!r.ok)throw new Error(j.error||\"Errore\");\n  $(\"bigCode\").textContent=j.code;$(\"waitingTitle\").textContent=\"Stanza creata\";\n  $(\"waitingText\").textContent=\"Condividi il codice con l'altro giocatore.\";\n  connectOnline(j.code);\n }catch(e){ui.waiting.classList.add(\"hidden\");ui.online.classList.remove(\"hidden\");showToast(\"Errore creazione stanza\")}\n}\n\nfunction connectOnline(code){\n if(ws)try{ws.close()}catch{}\n ws=new WebSocket(wsUrl(code));\n ws.onopen=()=>{};\n ws.onerror=()=>showToast(\"Errore di connessione\",1200);\n ws.onclose=()=>{if(mode===\"online\")showToast(\"Connessione chiusa\",1200)};\n ws.onmessage=e=>{\n  const m=JSON.parse(e.data);\n  if(m.type===\"joined\"){\n   room=m.room;side=m.side;\n   ui.roomBadge.textContent=\"STANZA \"+room;ui.roomBadge.classList.remove(\"hidden\");\n   if(m.waiting){\n    $(\"bigCode\").textContent=room;\n   }else{\n    ui.waiting.classList.add(\"hidden\");ui.online.classList.add(\"hidden\");ui.main.classList.add(\"hidden\");\n    mode=\"online\";ui.mode.textContent=\"ONLINE \u00b7 \"+(side===\"green\"?\"VERDE\":\"BLU\");\n    showToast(\"Avversario connesso!\",900);\n   }\n  }else if(m.type===\"state\"){\n   targetState=m.state;lastServerAt=performance.now();\n   ui.sg.textContent=m.state.score.green;ui.sb.textContent=m.state.score.blue;\n   if(!renderState||mode!==\"online\")renderState=cloneState(m.state);\n   if(m.state.message)showToast(m.state.message,850);\n  }else if(m.type===\"error\")showToast(m.message,1200);\n };\n}\n\nfunction lerpOnline(dt){\n if(!targetState)return;\n if(!renderState)renderState=cloneState(targetState);\n // Smooth server snapshots at RAF speed.\n const t=1-Math.exp(-14*dt);\n renderState.ball.x=lerp(renderState.ball.x,targetState.ball.x,t);\n renderState.ball.y=lerp(renderState.ball.y,targetState.ball.y,t);\n renderState.ball.angle=lerp(renderState.ball.angle,targetState.ball.angle,t);\n for(let i=0;i<renderState.rods.length;i++){\n  // Local player's rods get a faster correction so controls feel responsive.\n  const local=layout[i].team===side;\n  const rt=local?1-Math.exp(-23*dt):t;\n  renderState.rods[i].offset=lerp(renderState.rods[i].offset,targetState.rods[i].offset,rt);\n }\n renderState.score=targetState.score;\n}\n\nfunction drawField(){\n ctx.clearRect(0,0,CW,CH);\n ctx.fillStyle=\"#176b3a\";ctx.fillRect(0,0,CW,CH);\n ctx.fillStyle=\"rgba(255,255,255,.025)\";\n for(let x=0;x<CW;x+=96)ctx.fillRect(x,0,48,CH);\n\n ctx.strokeStyle=\"rgba(255,255,255,.78)\";ctx.lineWidth=3;\n ctx.strokeRect(WALL,WALL,CW-WALL*2,CH-WALL*2);\n ctx.beginPath();ctx.moveTo(CW/2,WALL);ctx.lineTo(CW/2,CH-WALL);ctx.stroke();\n ctx.beginPath();ctx.arc(CW/2,CH/2,70,0,Math.PI*2);ctx.stroke();\n ctx.beginPath();ctx.arc(CW/2,CH/2,4,0,Math.PI*2);ctx.fillStyle=\"white\";ctx.fill();\n ctx.strokeRect(WALL,155,112,230);ctx.strokeRect(CW-WALL-112,155,112,230);\n ctx.strokeRect(WALL,GT,45,GB-GT);ctx.strokeRect(CW-WALL-45,GT,45,GB-GT);\n ctx.fillStyle=\"rgba(0,0,0,.28)\";ctx.fillRect(0,GT,WALL,GB-GT);ctx.fillRect(CW-WALL,GT,WALL,GB-GT);\n}\n\nfunction roundRect(x,y,w,h,r){\n ctx.beginPath();\n if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);\n else{ctx.rect(x,y,w,h)}\n}\n\nfunction drawPlayer(team,x,y,active){\n ctx.save();\n ctx.fillStyle=\"rgba(0,0,0,.15)\";roundRect(x-12+3,y-15+3,24,30,7);ctx.fill();\n ctx.fillStyle=team===\"green\"?\"#c9d81e\":\"#3480d4\";\n ctx.strokeStyle=active?\"rgba(255,255,255,.95)\":\"rgba(0,0,0,.38)\";\n ctx.lineWidth=active?2.5:1.5;roundRect(x-12,y-15,24,30,7);ctx.fill();ctx.stroke();\n ctx.fillStyle=team===\"green\"?\"#839000\":\"#174e8c\";\n ctx.beginPath();ctx.arc(x,y-5,5,0,Math.PI*2);ctx.fill();\n ctx.restore();\n}\n\nfunction drawState(st){\n drawField();\n if(!st)return;\n layout.forEach((r,i)=>{\n  const active=mode===\"cpu\"?r.team===\"green\":mode===\"online\"?r.team===side:false;\n  const off=st.rods[i].offset||0;\n  ctx.strokeStyle=active?\"rgba(255,255,255,.88)\":\"rgba(15,25,22,.42)\";\n  ctx.lineWidth=active?4:3;\n  ctx.beginPath();ctx.moveTo(r.x,WALL);ctx.lineTo(r.x,CH-WALL);ctx.stroke();\n  bases[r.count].forEach(y=>drawPlayer(r.team,r.x,y+off,active));\n });\n const b=st.ball;\n ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle||0);\n ctx.shadowColor=\"rgba(0,0,0,.34)\";ctx.shadowBlur=7;ctx.shadowOffsetY=3;\n ctx.fillStyle=\"#faf9f1\";ctx.beginPath();ctx.arc(0,0,BALL_R,0,Math.PI*2);ctx.fill();\n ctx.shadowColor=\"transparent\";ctx.fillStyle=\"#333\";\n ctx.beginPath();ctx.arc(3,-2,2.3,0,Math.PI*2);ctx.fill();\n ctx.beginPath();ctx.arc(-4,3,1.7,0,Math.PI*2);ctx.fill();\n ctx.restore();\n}\n\nfunction frame(now){\n const dt=Math.min(.033,(now-lastFrame)/1000||.016);lastFrame=now;\n if(charging)setPower(charge+dt/1.05);\n if(mode===\"cpu\")updateCPU(dt);\n if(mode===\"online\")lerpOnline(dt);\n drawState(mode===\"cpu\"?localState:renderState);\n requestAnimationFrame(frame);\n}\nrequestAnimationFrame(frame);\n\nfunction pressButton(el,key){\n const down=e=>{e.preventDefault();input[key]=true;el.classList.add(\"pressed\")};\n const up=e=>{e.preventDefault();input[key]=false;el.classList.remove(\"pressed\")};\n el.addEventListener(\"pointerdown\",down);\n [\"pointerup\",\"pointercancel\",\"pointerleave\"].forEach(ev=>el.addEventListener(ev,up));\n}\npressButton($(\"upBtn\"),\"up\");pressButton($(\"downBtn\"),\"down\");\n\n$(\"chargeBtn\").addEventListener(\"pointerdown\",e=>{e.preventDefault();charging=true;$(\"chargeBtn\").classList.add(\"pressed\")});\n[\"pointerup\",\"pointercancel\",\"pointerleave\"].forEach(ev=>$(\"chargeBtn\").addEventListener(ev,e=>{e.preventDefault();charging=false;$(\"chargeBtn\").classList.remove(\"pressed\")}));\n$(\"shootBtn\").addEventListener(\"pointerdown\",e=>{e.preventDefault();shoot()});\n\naddEventListener(\"keydown\",e=>{\n if([\"w\",\"W\",\"s\",\"S\",\"ArrowLeft\",\"ArrowRight\"].includes(e.key))e.preventDefault();\n if(e.key===\"w\"||e.key===\"W\")input.up=true;\n if(e.key===\"s\"||e.key===\"S\")input.down=true;\n if(e.key===\"ArrowLeft\")charging=true;\n if(e.key===\"ArrowRight\"&&!e.repeat)shoot();\n});\naddEventListener(\"keyup\",e=>{\n if(e.key===\"w\"||e.key===\"W\")input.up=false;\n if(e.key===\"s\"||e.key===\"S\")input.down=false;\n if(e.key===\"ArrowLeft\")charging=false;\n});\n\nsetInterval(()=>{\n if(mode===\"online\")send({type:\"input\",up:input.up,down:input.down});\n},40);\n\n$(\"cpuBtn\").onclick=async()=>{\n await enterGameDisplay();\n mode=\"cpu\";side=\"green\";room=null;\n if(ws)try{ws.close()}catch{};ws=null;\n ui.main.classList.add(\"hidden\");ui.online.classList.add(\"hidden\");ui.waiting.classList.add(\"hidden\");\n ui.roomBadge.classList.add(\"hidden\");ui.mode.textContent=\"VS CPU\";\n newLocalGame();showToast(\"VS CPU\",650);\n};\n\n$(\"onlineBtn\").onclick=async()=>{await enterGameDisplay();ui.main.classList.add(\"hidden\");ui.online.classList.remove(\"hidden\")};\n$(\"backBtn\").onclick=()=>{ui.online.classList.add(\"hidden\");ui.main.classList.remove(\"hidden\")};\n$(\"createBtn\").onclick=async()=>{await enterGameDisplay();createRoom()};\n$(\"joinBtn\").onclick=async()=>{\n await enterGameDisplay();\n const c=$(\"roomInput\").value.trim().toUpperCase();\n if(!c)return showToast(\"Inserisci il codice\",800);\n $(\"bigCode\").textContent=c;$(\"waitingTitle\").textContent=\"Connessione\u2026\";$(\"waitingText\").textContent=\"Cerco la stanza.\";\n ui.online.classList.add(\"hidden\");ui.waiting.classList.remove(\"hidden\");connectOnline(c);\n};\n$(\"cancelWaiting\").onclick=()=>{\n if(ws)try{ws.close()}catch{};ws=null;room=null;\n ui.waiting.classList.add(\"hidden\");ui.online.classList.remove(\"hidden\");\n};\n$(\"menuBtn\").onclick=()=>{\n input.up=input.down=false;charging=false;setPower(0);\n if(ws)try{ws.close()}catch{};ws=null;room=null;mode=\"menu\";\n ui.roomBadge.classList.add(\"hidden\");ui.waiting.classList.add(\"hidden\");ui.online.classList.add(\"hidden\");ui.main.classList.remove(\"hidden\");\n};\n\nnewLocalGame();\n})();\n</script>\n</body>\n</html>";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(HTML, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
          "cache-control": "no-store"
        }
      });
    }

    if (url.pathname === "/api/create" && request.method === "POST") {
      const code = makeCode();
      const id = env.ROOMS.idFromName(code);
      const stub = env.ROOMS.get(id);
      await stub.fetch("https://room/init", { method: "POST" });
      return Response.json({ code });
    }

    if (url.pathname.startsWith("/ws/")) {
      const code = url.pathname.slice(4).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
      if (!code) return new Response("Bad room", { status: 400 });
      const id = env.ROOMS.idFromName(code);
      const stub = env.ROOMS.get(id);
      return stub.fetch(new Request("https://room/ws?code=" + encodeURIComponent(code), request));
    }

    return new Response("Not found", { status: 404 });
  }
};

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i=0;i<5;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}

const BASES={1:[270],2:[185,355],3:[140,270,400],5:[90,180,270,360,450]};
const LAYOUT=[
  {team:"green",x:76,count:1},{team:"green",x:218,count:2},
  {team:"blue",x:315,count:3},{team:"green",x:420,count:5},
  {team:"blue",x:540,count:5},{team:"green",x:645,count:3},
  {team:"blue",x:742,count:2},{team:"blue",x:884,count:1}
];
const CW=960,CH=540,WALL=19,GT=198,GB=342,BALL_R=9,PLAYER_R=16;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export class GameRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx=ctx;this.env=env;
    this.clients=new Map();
    this.input={green:{up:false,down:false},blue:{up:false,down:false}};
    this.state=this.makeState();
    this.created=false;
    this.timer=null;
    this.broadcastAccumulator=0;
  }

  makeState() {
    return {
      score:{green:0,blue:0},
      rods:LAYOUT.map(()=>({offset:0})),
      ball:{x:CW/2,y:CH/2,vx:225,vy:70,angle:0,still:0},
      message:""
    };
  }

  async fetch(request) {
    const url=new URL(request.url);

    if(url.pathname==="/init") {
      this.created=true;
      await this.ctx.storage.put("created",true);
      return new Response("ok");
    }

    if(url.pathname==="/ws") {
      if(request.headers.get("Upgrade")!=="websocket") return new Response("Expected websocket",{status:426});
      if(!this.created)this.created=!!(await this.ctx.storage.get("created"));
      if(!this.created)return new Response("Room not found",{status:404});
      if(this.clients.size>=2)return new Response("Room full",{status:409});

      const pair=new WebSocketPair();
      const client=pair[0],server=pair[1];
      server.accept();

      const used=new Set([...this.clients.values()].map(v=>v.side));
      const side=used.has("green")?"blue":"green";
      this.clients.set(server,{side});

      server.addEventListener("message",e=>this.onMessage(server,e));
      server.addEventListener("close",()=>this.remove(server));
      server.addEventListener("error",()=>this.remove(server));

      const code=url.searchParams.get("code")||"";
      server.send(JSON.stringify({type:"joined",room:code,side,waiting:this.clients.size<2}));

      if(this.clients.size===2) {
        for(const [ws,meta] of this.clients) {
          try{ws.send(JSON.stringify({type:"joined",room:code,side:meta.side,waiting:false}))}catch{}
        }
      }

      if(!this.timer)this.startLoop();
      return new Response(null,{status:101,webSocket:client});
    }

    return new Response("Not found",{status:404});
  }

  remove(ws) {
    const meta=this.clients.get(ws);
    this.clients.delete(ws);
    if(meta)this.input[meta.side]={up:false,down:false};
    if(this.clients.size===0&&this.timer) {
      clearInterval(this.timer);this.timer=null;
    }
  }

  onMessage(ws,event) {
    let m;try{m=JSON.parse(event.data)}catch{return}
    const meta=this.clients.get(ws);if(!meta)return;
    const side=meta.side;
    if(m.type==="input") {
      this.input[side]={up:!!m.up,down:!!m.down};
    }
    if(m.type==="shoot") {
      this.shoot(side,clamp(Number(m.power)||.08,.08,1));
    }
  }

  startLoop() {
    let last=Date.now();
    // Physics at ~60Hz; snapshots at ~30Hz. Clients interpolate at display refresh rate.
    this.timer=setInterval(()=>{
      const now=Date.now(),dt=Math.min(.032,(now-last)/1000);last=now;
      this.step(dt);
      this.broadcastAccumulator+=dt;
      if(this.broadcastAccumulator>=1/30) {
        this.broadcastAccumulator=0;
        this.broadcast({type:"state",state:this.state});
        this.state.message="";
      }
    },16);
  }

  broadcast(obj) {
    const text=JSON.stringify(obj);
    for(const ws of this.clients.keys())try{ws.send(text)}catch{}
  }

  resetBall(dir=0) {
    const b=this.state.ball;
    b.x=CW/2;b.y=CH/2+(Math.random()-.5)*42;
    const d=dir||(Math.random()>.5?1:-1);
    b.vx=d*(185+Math.random()*40);b.vy=(Math.random()-.5)*95;b.angle=0;b.still=0;
  }

  shoot(team,power) {
    const b=this.state.ball,dir=team==="green"?1:-1;
    let best=null,bestD=1e9;
    LAYOUT.forEach((r,i)=>{
      if(r.team!==team)return;
      for(const base of BASES[r.count]) {
        const py=base+this.state.rods[i].offset;
        const dx=(b.x-r.x)*dir,dy=Math.abs(b.y-py);
        if(dx>=-13&&dx<=50&&dy<=31) {
          const d=Math.abs(dx)+dy;
          if(d<bestD){bestD=d;best={py}}
        }
      }
    });
    if(!best)return;
    const vert=clamp((b.y-best.py)/29,-1,1);
    const force=285+power*625;
    b.vx=dir*force;
    b.vy=b.vy*.32+vert*(100+power*185);
  }

  collidePlayers() {
    const b=this.state.ball;
    LAYOUT.forEach((r,i)=>{
      const off=this.state.rods[i].offset;
      for(const base of BASES[r.count]) {
        const py=base+off,dx=b.x-r.x,dy=b.y-py,dist=Math.hypot(dx,dy),min=BALL_R+PLAYER_R;
        if(dist<min&&dist>.001) {
          const nx=dx/dist,ny=dy/dist;
          b.x=r.x+nx*min;b.y=py+ny*min;
          const dot=b.vx*nx+b.vy*ny;
          if(dot<0) {
            const e=.61;
            b.vx-=(1+e)*dot*nx;b.vy-=(1+e)*dot*ny;
          }
        }
      }
    });
  }

  rollingFriction(dt) {
    const b=this.state.ball,s=Math.hypot(b.vx,b.vy);
    if(s<4){b.vx=0;b.vy=0;return}
    const decel=27+s*.011,ns=Math.max(0,s-decel*dt),k=ns/s;
    b.vx*=k;b.vy*=k;
  }

  goal(team) {
    const s=this.state;
    s.score[team]++;
    s.message=team==="green"?"GOOOL VERDE!":"GOOOL BLU!";
    if(s.score[team]>=5) {
      s.message=(team==="green"?"VERDE":"BLU")+" VINCE!";
      s.ball.vx=0;s.ball.vy=0;return;
    }
    this.resetBall(team==="green"?-1:1);
  }

  step(dt) {
    const s=this.state;
    if(s.score.green>=5||s.score.blue>=5)return;

    for(const team of ["green","blue"]) {
      const inp=this.input[team],move=((inp.down?1:0)-(inp.up?1:0))*225*dt;
      LAYOUT.forEach((r,i)=>{
        if(r.team===team)s.rods[i].offset=clamp(s.rods[i].offset+move,-74,74);
      });
    }

    const b=s.ball,spd=Math.hypot(b.vx,b.vy),steps=clamp(Math.ceil(spd*dt/4),1,10),sd=dt/steps;
    for(let k=0;k<steps;k++) {
      const ox=b.x,oy=b.y;
      b.x+=b.vx*sd;b.y+=b.vy*sd;
      b.angle+=Math.hypot(b.x-ox,b.y-oy)/BALL_R*(b.vx>=0?1:-1);

      if(b.y-BALL_R<WALL){b.y=WALL+BALL_R;b.vy=Math.abs(b.vy)*.76;b.vx*=.96}
      if(b.y+BALL_R>CH-WALL){b.y=CH-WALL-BALL_R;b.vy=-Math.abs(b.vy)*.76;b.vx*=.96}
      this.collidePlayers();

      if(b.x<0) {
        if(b.y>GT&&b.y<GB){this.goal("blue");return}
        b.x=BALL_R;b.vx=Math.abs(b.vx)*.76;b.vy*=.96;
      }
      if(b.x>CW) {
        if(b.y>GT&&b.y<GB){this.goal("green");return}
        b.x=CW-BALL_R;b.vx=-Math.abs(b.vx)*.76;b.vy*=.96;
      }
    }

    this.rollingFriction(dt);

    // If the ball is practically still for 5 consecutive seconds, reset it.
    if(Math.hypot(b.vx,b.vy)<10) {
      b.still+=dt;
      if(b.still>=5) {
        s.message="Palla ferma: rimessa al centro";
        this.resetBall();
      }
    } else b.still=0;
  }
}
