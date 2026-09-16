import { DurableObject } from "cloudflare:workers";

// Biliardino NOI V4.2 - input + rolling physics
const HTML = "<!doctype html>\n<html lang=\"it\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover\">\n<meta name=\"theme-color\" content=\"#10191d\">\n<title>Biliardino NOI V4</title>\n<style>\n:root{--g:#c9d81e;--b:#3b82d0;--dark:#081116}\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml,body{margin:0;width:100%;height:100%;overflow:hidden;background:var(--dark);color:#fff;font-family:Arial,Helvetica,sans-serif}\nbutton,input{font:inherit}\n#app{position:fixed;inset:0;overflow:hidden;background:#176b3a}\n#game{position:absolute;inset:0;width:100%;height:100%;display:block;background:#176b3a;touch-action:none}\n#ui{position:absolute;inset:0;pointer-events:none}\n.glass{background:rgba(4,10,14,.50);border:1px solid rgba(255,255,255,.24)}\n#hud{position:absolute;top:6px;left:50%;transform:translateX(-50%);padding:5px 9px;border-radius:12px;display:flex;align-items:center;gap:8px;font-size:11px;font-weight:bold}\n#hud b{font-size:20px}.dot{display:inline-block;width:9px;height:9px;border-radius:50%}.green{background:var(--g)}.blue{background:var(--b)}\n#version{position:absolute;top:7px;right:55px;padding:5px 7px;border-radius:9px;font-size:9px;font-weight:bold}\n#fullBtn{position:absolute;top:7px;right:8px;width:40px;height:40px;border-radius:12px;color:#fff;font-size:18px;font-weight:bold;pointer-events:auto}\n#menu{position:absolute;top:7px;left:8px;width:40px;height:40px;border-radius:12px;color:#fff;font-size:18px;font-weight:bold;pointer-events:auto}\n.controls{position:absolute;bottom:10px;display:flex;flex-direction:column;gap:7px;pointer-events:auto}\n#move{left:10px}#shot{right:10px}\n.ctrl{width:68px;height:57px;border-radius:16px;border:1px solid rgba(255,255,255,.28);background:rgba(4,10,14,.42);color:#fff;font-weight:900;touch-action:none;user-select:none;-webkit-user-select:none}\n.ctrl.on{background:rgba(255,255,255,.20);transform:scale(.97)}\n.arrow{font-size:24px}#shootBtn{background:rgba(201,216,30,.31)}\n#powerBox{position:absolute;right:87px;bottom:13px;width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,.23);background:rgba(4,10,14,.45);display:grid;place-items:center;font-size:10px;font-weight:bold}\n#powerArc{position:absolute;inset:3px;border-radius:50%;border:4px solid rgba(255,255,255,.15);border-top-color:var(--g);transform:rotate(-45deg)}\n#powerText{position:relative}\n#toast{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);padding:7px 12px;border-radius:30px;background:rgba(0,0,0,.62);font-size:11px;font-weight:bold;opacity:0}\n#toast.show{opacity:1}\n.screen{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(4,10,14,.94)}\n.panel{width:min(430px,92vw);border:1px solid rgba(255,255,255,.18);border-radius:20px;background:#101b21;padding:18px}\n.panel h1{font-size:27px;margin:0 0 5px}.panel p{color:#aebac0;font-size:13px;margin:0 0 15px;line-height:1.4}.grid{display:grid;gap:9px}\n.big{height:54px;border:0;border-radius:14px;font-size:15px;font-weight:900}.cpu{background:var(--g);color:#111}.online{background:var(--b);color:white}.sub{background:#26343b;color:#fff;border:1px solid #43545c}\n.join{display:grid;grid-template-columns:1fr auto;gap:8px}\ninput{min-width:0;height:52px;border-radius:13px;border:1px solid #46545b;background:#091116;color:#fff;padding:0 12px;font-size:18px;font-weight:bold;text-transform:uppercase}\n.hidden{display:none!important}\n#rotate{z-index:50;text-align:center}#rotate strong{font-size:21px}#rotate span{display:block;color:#aebac0;margin-top:6px}\n#fatal{position:absolute;z-index:100;left:6px;right:6px;top:55px;background:#731f1f;color:#fff;padding:9px;border-radius:10px;font:12px monospace;display:none;pointer-events:none}\n@media (orientation:portrait) and (max-width:900px){#rotate{display:flex!important}}\n@media (orientation:landscape){#rotate{display:none!important}}\n@media(min-height:500px){.ctrl{width:78px;height:68px}#powerBox{right:98px;width:52px;height:52px}}\n</style>\n</head>\n<body>\n<div id=\"app\">\n<canvas id=\"game\" width=\"1000\" height=\"450\"></canvas>\n<div id=\"ui\">\n <div id=\"hud\" class=\"glass\"><span><i class=\"dot green\"></i> VERDE <b id=\"sg\">0</b></span><span id=\"mode\">CPU</span><span><b id=\"sb\">0</b> BLU <i class=\"dot blue\"></i></span></div>\n <div id=\"version\" class=\"glass\">V4.2 \u00b7 <span id=\"fps\">--</span> FPS</div>\n <button id=\"fullBtn\" class=\"glass\" aria-label=\"Schermo intero\">\u26f6</button>\n <button id=\"menu\" class=\"glass\">\u2630</button>\n <div id=\"move\" class=\"controls\"><button id=\"up\" class=\"ctrl arrow\">\u25b2</button><button id=\"down\" class=\"ctrl arrow\">\u25bc</button></div>\n <div id=\"shot\" class=\"controls\"><button id=\"charge\" class=\"ctrl\">CARICA</button><button id=\"shoot\" class=\"ctrl\">TIRA</button></div>\n <div id=\"powerBox\"><div id=\"powerArc\"></div><span id=\"powerText\">0%</span></div>\n <div id=\"toast\"></div>\n <div id=\"fatal\"></div>\n</div>\n\n<div id=\"main\" class=\"screen\">\n <div class=\"panel\">\n  <h1>Biliardino NOI <small style=\"font-size:11px;color:#90a0a7\">V4.2</small></h1>\n  <p>Questa versione privilegia compatibilit\u00e0 e fluidit\u00e0 mobile. Ruota il telefono in orizzontale.</p>\n  <div class=\"grid\">\n   <button id=\"cpu\" class=\"big cpu\">GIOCA VS CPU</button>\n   <button id=\"online\" class=\"big online\">GIOCA ONLINE</button>\n  </div>\n </div>\n</div>\n\n<div id=\"onlineScreen\" class=\"screen hidden\">\n <div class=\"panel\">\n  <h1>Partita online</h1>\n  <p>Uno crea la stanza; l'altro apre lo stesso link e inserisce il codice.</p>\n  <div class=\"grid\">\n   <button id=\"create\" class=\"big online\">CREA STANZA</button>\n   <div class=\"join\"><input id=\"code\" maxlength=\"5\" placeholder=\"CODICE\"><button id=\"join\" class=\"big sub\">ENTRA</button></div>\n   <button id=\"back\" class=\"big sub\">INDIETRO</button>\n  </div>\n </div>\n</div>\n\n<div id=\"wait\" class=\"screen hidden\">\n <div class=\"panel\" style=\"text-align:center\">\n  <h1 id=\"waitTitle\">Stanza creata</h1>\n  <p id=\"waitText\">Condividi il codice con l'altro giocatore.</p>\n  <div id=\"bigCode\" style=\"font-size:40px;letter-spacing:5px;font-weight:900;color:var(--g);margin:10px 0 18px\">\u2014</div>\n  <button id=\"cancel\" class=\"big sub\" style=\"width:100%\">ANNULLA</button>\n </div>\n</div>\n\n<div id=\"rotate\" class=\"screen hidden\"><div><strong>\u21bb Ruota il telefono</strong><span>Il campo usa tutto lo schermo in orizzontale.</span></div></div>\n</div>\n\n<script>\n(function(){\n\"use strict\";\n\nvar $=function(id){return document.getElementById(id)};\nvar canvas=$(\"game\");\nvar ctx=canvas.getContext(\"2d\");\nvar W=1000,H=450,WALL=18,GT=165,GB=285,BR=8,PR=14;\nvar base={1:[225],2:[145,305],3:[105,225,345],5:[65,145,225,305,385]};\nvar rods=[\n {team:\"green\",x:70,count:1},{team:\"green\",x:210,count:2},{team:\"blue\",x:315,count:3},{team:\"green\",x:420,count:5},\n {team:\"blue\",x:580,count:5},{team:\"green\",x:685,count:3},{team:\"blue\",x:790,count:2},{team:\"blue\",x:930,count:1}\n];\nvar mode=\"menu\",side=\"green\",room=\"\",ws=null;\nvar keys={up:false,down:false},charging=false,power=0;\nvar state=createState(),onlineTarget=null,renderState=createState();\nvar last=performance.now(),fpsLast=last,fpsFrames=0,toastTimer=0;\nvar frameAlive=0;\n\nfunction fatal(msg){\n var el=$(\"fatal\");el.style.display=\"block\";el.textContent=\"ERRORE V4: \"+msg;\n}\nwindow.onerror=function(message,source,line,col,error){fatal(String(message)+\" \u00b7 riga \"+line);return false};\nwindow.addEventListener(\"unhandledrejection\",function(e){\n  var reason=String(e.reason||\"\");\n  // Fullscreen/orientation denials are non-fatal for the game.\n  if(reason.indexOf(\"fullscreen\")>=0||reason.indexOf(\"orientation\")>=0||reason.indexOf(\"NotAllowedError\")>=0)return;\n  fatal(\"Promise: \"+reason);\n});\n\nfunction requestFullscreenSafe(){\n  try{\n    var el=document.documentElement;\n    var fn=el.requestFullscreen||el.webkitRequestFullscreen||el.msRequestFullscreen;\n    if(fn){\n      var p=fn.call(el);\n      if(p&&typeof p.then===\"function\"){\n        p.then(function(){\n          try{\n            if(screen.orientation&&screen.orientation.lock){\n              var q=screen.orientation.lock(\"landscape\");\n              if(q&&typeof q.catch===\"function\")q.catch(function(){});\n            }\n          }catch(e){}\n        }).catch(function(){});\n      }\n    }\n  }catch(e){}\n}\nfunction exitFullscreenSafe(){\n  try{\n    var fn=document.exitFullscreen||document.webkitExitFullscreen||document.msExitFullscreen;\n    if(fn)fn.call(document);\n  }catch(e){}\n}\n\nfunction clamp(v,a,b){return Math.max(a,Math.min(b,v))}\nfunction mix(a,b,t){return a+(b-a)*t}\nfunction createState(){\n var a=[],i;\n for(i=0;i<rods.length;i++)a.push({offset:0,vy:0,kick:0,kickPower:0,hit:false});\n return {score:{green:0,blue:0},rods:a,ball:{x:500,y:225,vx:210,vy:60,ang:0,still:0},message:\"\"};\n}\nfunction copyState(s){\n var o=createState(),i;\n o.score.green=s.score.green;o.score.blue=s.score.blue;o.message=s.message||\"\";\n for(i=0;i<o.rods.length;i++){o.rods[i].offset=s.rods[i].offset;o.rods[i].vy=s.rods[i].vy||0;o.rods[i].kick=s.rods[i].kick||0;o.rods[i].kickPower=s.rods[i].kickPower||0;o.rods[i].hit=!!s.rods[i].hit}\n o.ball.x=s.ball.x;o.ball.y=s.ball.y;o.ball.vx=s.ball.vx;o.ball.vy=s.ball.vy;o.ball.ang=s.ball.ang||0;o.ball.still=s.ball.still||0;\n return o;\n}\nfunction resetBall(s,dir){\n var d=dir||((Math.random()>.5)?1:-1);\n s.ball.x=500;s.ball.y=225+(Math.random()-.5)*30;s.ball.vx=d*(150+Math.random()*30);s.ball.vy=(Math.random()-.5)*55;s.ball.ang=0;s.ball.still=0;\n}\nfunction newGame(){\n state=createState();resetBall(state,1);renderState=copyState(state);onlineTarget=null;\n $(\"sg\").textContent=\"0\";$(\"sb\").textContent=\"0\";setPower(0);\n}\nfunction toast(t){\n $(\"toast\").textContent=t;$(\"toast\").className=\"show\";\n clearTimeout(toastTimer);toastTimer=setTimeout(function(){$(\"toast\").className=\"\"},800);\n}\nfunction setPower(p){\n power=clamp(p,0,1);$(\"powerText\").textContent=Math.round(power*100)+\"%\";\n $(\"powerArc\").style.transform=\"rotate(\"+(-45+power*270)+\"deg)\";\n}\nfunction dir(r){return r.team===\"green\"?1:-1}\nfunction bootOffset(rr,team){\n if(rr.kick<=0){\n  if(mode===\"cpu\"&&team===\"green\"&&charging)return 5-power*13;\n  return 5;\n }\n var t=rr.kick,wind=-8-rr.kickPower*7;\n if(t<.20){\n  var q=t/.20;\n  q=1-Math.pow(1-q,3);\n  return mix(wind,35,q);\n }\n if(t<.48){\n  var h=(t-.20)/.28;\n  return mix(35,27,h);\n }\n var r=(t-.48)/.52;\n r=r*r*(3-2*r);\n return mix(27,5,r);\n}\nfunction teamKicking(s,team){\n var i;\n for(i=0;i<rods.length;i++)if(rods[i].team===team&&s.rods[i].kick>0)return true;\n return false;\n}\nfunction startKick(s,team,p){\n if(teamKicking(s,team))return false;\n var i;\n for(i=0;i<rods.length;i++)if(rods[i].team===team){\n  s.rods[i].kick=.001;\n  s.rods[i].kickPower=p;\n  s.rods[i].hit=false;\n }\n return true;\n}\nfunction capBall(b,max){\n var sp=Math.sqrt(b.vx*b.vx+b.vy*b.vy);\n if(sp>max){var k=max/sp;b.vx*=k;b.vy*=k}\n}\nfunction bodyHit(s,i,py){\n var b=s.ball,r=rods[i],rr=s.rods[i];\n var dx=b.x-r.x,dy=b.y-py,dist=Math.sqrt(dx*dx+dy*dy),min=BR+PR;\n if(dist>=min||dist<.001)return;\n\n var nx=dx/dist,ny=dy/dist;\n b.x=r.x+nx*(min+.2);b.y=py+ny*(min+.2);\n\n // Collision in the reference frame of the moving foosball figure.\n var rvx=b.vx,rvy=b.vy-(rr.vy||0);\n var dot=rvx*nx+rvy*ny;\n if(dot<0){\n  var e=.20;\n  rvx-=(1+e)*dot*nx;\n  rvy-=(1+e)*dot*ny;\n  b.vx=rvx;\n  b.vy=rvy+(rr.vy||0);\n  capBall(b,820);\n }\n}\nfunction kickHit(s,i,py){\n var rr=s.rods[i],r=rods[i];\n if(rr.kick<=0||rr.hit||rr.kick>.50)return;\n\n var d=dir(r),b=s.ball;\n var reach=bootOffset(rr,r.team)+10;\n var localX=(b.x-r.x)*d;\n var localY=b.y-(py+4);\n\n // Swept contact zone: the foot cannot tunnel through the ball between frames.\n if(localX<3-BR||localX>reach+BR||Math.abs(localY)>22)return;\n\n rr.hit=true;\n var off=clamp(localY/22,-1,1);\n var angle=off*.48;\n var speed=315+rr.kickPower*445;\n\n // Keep a small amount of the ball's existing movement and transfer rod movement.\n var forward=Math.cos(angle)*speed;\n var lateral=Math.sin(angle)*speed;\n b.vx=d*forward+b.vx*.10;\n b.vy=lateral+b.vy*.12+(rr.vy||0)*.20;\n b.x=r.x+d*(reach+BR+.5);\n capBall(b,850);\n}\nfunction score(s,team){\n s.score[team]++;s.message=team===\"green\"?\"GOOOL!\":\"GOL CPU\";\n if(s.score[team]>=5){s.message=(team===\"green\"?\"VERDE\":\"BLU\")+\" VINCE!\";s.ball.vx=0;s.ball.vy=0}\n else resetBall(s,team===\"green\"?-1:1);\n}\nfunction cpuStep(s,dt){\n var blue=[],i,j,best=9999,target=0,b=s.ball;\n for(i=0;i<rods.length;i++)if(rods[i].team===\"blue\")blue.push(i);\n for(j=0;j<blue.length;j++){\n  i=blue[j];var r=rods[i],arr=base[r.count],k;\n  for(k=0;k<arr.length;k++){\n   var err=Math.abs(arr[k]+s.rods[i].offset-b.y);\n   if(err<best){best=err;target=clamp(b.y-arr[k],-68,68)}\n  }\n }\n var cur=s.rods[blue[0]].offset,speed=135,next=cur+clamp(target-cur,-speed*dt,speed*dt);\n for(j=0;j<blue.length;j++){\n  var ri=blue[j],old=s.rods[ri].offset;\n  s.rods[ri].offset=next;\n  s.rods[ri].vy=dt>0?(next-old)/dt:0;\n }\n if(Math.random()<dt*3.4){\n  var near=false;\n  for(j=0;j<blue.length&&!near;j++){\n   i=blue[j];var rr=rods[i],ys=base[rr.count],d=dir(rr),n;\n   for(n=0;n<ys.length;n++){\n    var py=ys[n]+s.rods[i].offset,dx=(b.x-rr.x)*d;\n    if(dx>-12&&dx<48&&Math.abs(b.y-py)<30){near=true;break}\n   }\n  }\n  if(near)startKick(s,\"blue\",.25+Math.random()*.55);\n }\n}\nfunction simulate(s,dt,cpu){\n if(s.score.green>=5||s.score.blue>=5)return;\n var i,j;\n\n if(cpu){\n  var mv=((keys.down?1:0)-(keys.up?1:0))*205*dt;\n  for(i=0;i<rods.length;i++){\n   if(rods[i].team===\"green\"){\n    var old=s.rods[i].offset;\n    s.rods[i].offset=clamp(old+mv,-68,68);\n    s.rods[i].vy=dt>0?(s.rods[i].offset-old)/dt:0;\n   }\n  }\n  cpuStep(s,dt);\n }\n\n for(i=0;i<s.rods.length;i++){\n  if(s.rods[i].kick>0){\n   s.rods[i].kick+=dt/.27;\n   if(s.rods[i].kick>=1){s.rods[i].kick=0;s.rods[i].hit=false}\n  }\n }\n\n var b=s.ball;\n var spd=Math.sqrt(b.vx*b.vx+b.vy*b.vy);\n var subs=Math.max(1,Math.min(8,Math.ceil(spd*dt/4)));\n var sd=dt/subs,n;\n\n for(n=0;n<subs;n++){\n  var ox=b.x,oy=b.y;\n  b.x+=b.vx*sd;b.y+=b.vy*sd;\n  b.ang+=Math.sqrt((b.x-ox)*(b.x-ox)+(b.y-oy)*(b.y-oy))/BR*(b.vx>=0?1:-1);\n\n  // Side cushions lose energy instead of behaving like air-hockey bumpers.\n  if(b.y-BR<WALL){\n   b.y=WALL+BR;b.vy=Math.abs(b.vy)*.66;b.vx*=.965;\n  }\n  if(b.y+BR>H-WALL){\n   b.y=H-WALL-BR;b.vy=-Math.abs(b.vy)*.66;b.vx*=.965;\n  }\n\n  for(i=0;i<rods.length;i++){\n   var r=rods[i],ys=base[r.count],off=s.rods[i].offset;\n   for(j=0;j<ys.length;j++){\n    var py=ys[j]+off;\n    bodyHit(s,i,py);\n    kickHit(s,i,py);\n   }\n  }\n\n  if(b.x<0){\n   if(b.y>GT&&b.y<GB){score(s,\"blue\");return}\n   b.x=BR;b.vx=Math.abs(b.vx)*.62;b.vy*=.96;\n  }\n  if(b.x>W){\n   if(b.y>GT&&b.y<GB){score(s,\"green\");return}\n   b.x=W-BR;b.vx=-Math.abs(b.vx)*.62;b.vy*=.96;\n  }\n }\n\n // Rolling resistance: strong enough to feel like a ball on a table, not a puck.\n spd=Math.sqrt(b.vx*b.vx+b.vy*b.vy);\n if(spd<6){b.vx=0;b.vy=0}\n else{\n  var decel=50+spd*.018;\n  var ns=Math.max(0,spd-decel*dt);\n  var fac=ns/spd;\n  b.vx*=fac;b.vy*=fac;\n }\n\n if(Math.sqrt(b.vx*b.vx+b.vy*b.vy)<9){\n  b.still+=dt;\n  if(b.still>=5){s.message=\"Palla ferma: rimessa\";resetBall(s,0)}\n }else b.still=0;\n}\nvar lastShootAt=0;\nfunction shoot(){\n var now=Date.now();\n if(now-lastShootAt<110)return;\n lastShootAt=now;\n\n var p=Math.max(.14,power);\n if(mode===\"cpu\")startKick(state,\"green\",p);\n else if(mode===\"online\"){\n  startKick(renderState,side,p);\n  send({type:\"shoot\",power:p});\n }\n charging=false;\n $(\"charge\").classList.remove(\"on\");\n $(\"shoot\").classList.add(\"on\");\n setTimeout(function(){$(\"shoot\").classList.remove(\"on\")},90);\n setPower(0);\n}\n\nfunction roundRect(x,y,w,h,r){\n ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();\n}\nfunction drawField(){\n ctx.fillStyle=\"#176b3a\";ctx.fillRect(0,0,W,H);\n ctx.fillStyle=\"rgba(255,255,255,.025)\";var x;for(x=0;x<W;x+=100)ctx.fillRect(x,0,50,H);\n ctx.strokeStyle=\"rgba(255,255,255,.78)\";ctx.lineWidth=3;ctx.strokeRect(WALL,WALL,W-WALL*2,H-WALL*2);\n ctx.beginPath();ctx.moveTo(W/2,WALL);ctx.lineTo(W/2,H-WALL);ctx.stroke();ctx.beginPath();ctx.arc(W/2,H/2,58,0,Math.PI*2);ctx.stroke();\n ctx.strokeRect(WALL,120,100,210);ctx.strokeRect(W-WALL-100,120,100,210);\n ctx.fillStyle=\"rgba(0,0,0,.27)\";ctx.fillRect(0,GT,WALL,GB-GT);ctx.fillRect(W-WALL,GT,WALL,GB-GT);\n}\nfunction drawPlayer(s,i,py,active){\n var r=rods[i],rr=s.rods[i],team=r.team,d=dir(r),bo=bootOffset(rr,team),cx=r.x+d*bo;\n ctx.fillStyle=team===\"green\"?\"#c9d81e\":\"#3b82d0\";ctx.strokeStyle=active?\"#fff\":\"rgba(0,0,0,.4)\";ctx.lineWidth=active?2:1;\n roundRect(r.x-11,py-13,22,26,6);ctx.fill();ctx.stroke();\n ctx.fillStyle=team===\"green\"?\"#87920a\":\"#1e5890\";ctx.beginPath();ctx.arc(r.x,py-5,4.5,0,Math.PI*2);ctx.fill();\n var edge=r.x+d*7,bootEdge=cx-d*8,left=Math.min(edge,bootEdge),ww=Math.abs(bootEdge-edge);\n ctx.fillStyle=team===\"green\"?\"#9ca80c\":\"#2869aa\";roundRect(left,py,Math.max(3,ww),7,3);ctx.fill();\n ctx.fillStyle=team===\"green\"?\"#e1eb42\":\"#62a3e3\";roundRect(cx-8,py-8,16,21,3);ctx.fill();\n}\nfunction draw(s){\n drawField();if(!s)return;\n var i,j;\n for(i=0;i<rods.length;i++){\n  var r=rods[i],active=(mode===\"cpu\"&&r.team===\"green\")||(mode===\"online\"&&r.team===side),off=s.rods[i].offset,ys=base[r.count];\n  ctx.strokeStyle=active?\"rgba(255,255,255,.90)\":\"rgba(15,25,22,.43)\";ctx.lineWidth=active?4:3;ctx.beginPath();ctx.moveTo(r.x,WALL);ctx.lineTo(r.x,H-WALL);ctx.stroke();\n  for(j=0;j<ys.length;j++)drawPlayer(s,i,ys[j]+off,active);\n }\n var b=s.ball;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.ang);ctx.fillStyle=\"#faf9f1\";ctx.beginPath();ctx.arc(0,0,BR,0,Math.PI*2);ctx.fill();ctx.fillStyle=\"#333\";ctx.beginPath();ctx.arc(2,-2,2,0,Math.PI*2);ctx.fill();ctx.restore();\n}\n\nfunction loop(now){\n frameAlive++;\n var dt=Math.min(.033,(now-last)/1000||.016);last=now;\n if(charging)setPower(power+dt/1.05);\n if(mode===\"cpu\"){simulate(state,dt,true);renderState=state;$(\"sg\").textContent=state.score.green;$(\"sb\").textContent=state.score.blue;if(state.message){toast(state.message);state.message=\"\"}}\n else if(mode===\"online\"&&onlineTarget){\n  var t=1-Math.exp(-12*dt),i;\n  renderState.ball.x=mix(renderState.ball.x,onlineTarget.ball.x,t);renderState.ball.y=mix(renderState.ball.y,onlineTarget.ball.y,t);renderState.ball.ang=mix(renderState.ball.ang,onlineTarget.ball.ang||0,t);\n  for(i=0;i<renderState.rods.length;i++)renderState.rods[i].offset=mix(renderState.rods[i].offset,onlineTarget.rods[i].offset,t);\n }\n draw(renderState);\n fpsFrames++;if(now-fpsLast>=1000){$(\"fps\").textContent=Math.round(fpsFrames*1000/(now-fpsLast));fpsFrames=0;fpsLast=now}\n requestAnimationFrame(loop);\n}\nrequestAnimationFrame(loop);\n\nfunction bindHold(el,key){\n var down=function(e){if(e){e.preventDefault();try{if(e.pointerId!==undefined&&el.setPointerCapture)el.setPointerCapture(e.pointerId)}catch(x){}}keys[key]=true;el.classList.add(\"on\")};\n var up=function(e){if(e)e.preventDefault();keys[key]=false;el.classList.remove(\"on\")};\n if(window.PointerEvent){el.addEventListener(\"pointerdown\",down);el.addEventListener(\"pointerup\",up);el.addEventListener(\"pointercancel\",up);el.addEventListener(\"pointerleave\",up)}\n else{el.addEventListener(\"touchstart\",down,{passive:false});el.addEventListener(\"touchend\",up,{passive:false});el.addEventListener(\"touchcancel\",up,{passive:false})}\n}\nbindHold($(\"up\"),\"up\");bindHold($(\"down\"),\"down\");\nvar chargeDown=function(e){if(e)e.preventDefault();charging=true;$(\"charge\").classList.add(\"on\")};\nvar chargeUp=function(e){if(e)e.preventDefault();charging=false;$(\"charge\").classList.remove(\"on\")};\nif(window.PointerEvent){$(\"charge\").addEventListener(\"pointerdown\",chargeDown);$(\"charge\").addEventListener(\"pointerup\",chargeUp);$(\"charge\").addEventListener(\"pointercancel\",chargeUp)}\nelse{$(\"charge\").addEventListener(\"touchstart\",chargeDown,{passive:false});$(\"charge\").addEventListener(\"touchend\",chargeUp,{passive:false})}\nfunction bindInstantShot(el){\n var firedAt=0;\n var fire=function(e){\n  if(e)e.preventDefault();\n  var now=Date.now();\n  if(now-firedAt<100)return;\n  firedAt=now;\n  shoot();\n };\n if(window.PointerEvent){\n  el.addEventListener(\"pointerdown\",fire,{passive:false});\n }else{\n  el.addEventListener(\"touchstart\",fire,{passive:false});\n  el.addEventListener(\"mousedown\",fire);\n }\n}\nbindInstantShot($(\"shoot\"));\n\nwindow.addEventListener(\"keydown\",function(e){if(e.key===\"w\"||e.key===\"W\")keys.up=true;if(e.key===\"s\"||e.key===\"S\")keys.down=true;if(e.key===\"ArrowLeft\")charging=true;if(e.key===\"ArrowRight\"&&!e.repeat)shoot()});\nwindow.addEventListener(\"keyup\",function(e){if(e.key===\"w\"||e.key===\"W\")keys.up=false;if(e.key===\"s\"||e.key===\"S\")keys.down=false;if(e.key===\"ArrowLeft\")charging=false});\n\nfunction wsUrl(c){return (location.protocol===\"https:\"?\"wss:\":\"ws:\")+\"//\"+location.host+\"/ws/\"+encodeURIComponent(c)}\nfunction send(o){if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))}\nfunction connect(c){\n if(ws)try{ws.close()}catch(e){}\n ws=new WebSocket(wsUrl(c));\n ws.onmessage=function(e){\n  var m=JSON.parse(e.data);\n  if(m.type===\"joined\"){\n   room=m.room;side=m.side;\n   if(m.waiting){$(\"bigCode\").textContent=room}\n   else{mode=\"online\";$(\"mode\").textContent=\"ONLINE \"+(side===\"green\"?\"VERDE\":\"BLU\");$(\"wait\").classList.add(\"hidden\");$(\"onlineScreen\").classList.add(\"hidden\");$(\"main\").classList.add(\"hidden\");toast(\"Avversario connesso\")}\n  }else if(m.type===\"state\"){onlineTarget=m.state;if(!renderState)renderState=copyState(m.state);$(\"sg\").textContent=m.state.score.green;$(\"sb\").textContent=m.state.score.blue;if(m.state.message)toast(m.state.message)}\n  else if(m.type===\"error\")toast(m.message);\n };\n ws.onerror=function(){toast(\"Errore connessione\")};\n}\nfunction createRoom(){\n $(\"onlineScreen\").classList.add(\"hidden\");$(\"wait\").classList.remove(\"hidden\");$(\"waitTitle\").textContent=\"Creo la stanza\u2026\";$(\"bigCode\").textContent=\"\u2026\";\n fetch(\"/api/create\",{method:\"POST\"}).then(function(r){return r.json()}).then(function(j){$(\"waitTitle\").textContent=\"Stanza creata\";$(\"bigCode\").textContent=j.code;connect(j.code)}).catch(function(){toast(\"Errore creazione stanza\")});\n}\nsetInterval(function(){if(mode===\"online\")send({type:\"input\",up:keys.up,down:keys.down})},40);\n\n$(\"cpu\").onclick=function(){\n requestFullscreenSafe();\n mode=\"cpu\";side=\"green\";if(ws)try{ws.close()}catch(e){}ws=null;\n $(\"main\").classList.add(\"hidden\");$(\"onlineScreen\").classList.add(\"hidden\");$(\"wait\").classList.add(\"hidden\");$(\"mode\").textContent=\"VS CPU\";\n newGame();last=performance.now();toast(\"Partita iniziata\");\n};\n$(\"online\").onclick=function(){requestFullscreenSafe();$(\"main\").classList.add(\"hidden\");$(\"onlineScreen\").classList.remove(\"hidden\")};\n$(\"back\").onclick=function(){$(\"onlineScreen\").classList.add(\"hidden\");$(\"main\").classList.remove(\"hidden\")};\n$(\"create\").onclick=function(){requestFullscreenSafe();createRoom()};\n$(\"join\").onclick=function(){requestFullscreenSafe();var c=$(\"code\").value.toUpperCase().replace(/[^A-Z0-9]/g,\"\");if(!c){toast(\"Inserisci il codice\");return}$(\"onlineScreen\").classList.add(\"hidden\");$(\"wait\").classList.remove(\"hidden\");$(\"waitTitle\").textContent=\"Connessione\u2026\";$(\"bigCode\").textContent=c;connect(c)};\n$(\"cancel\").onclick=function(){if(ws)try{ws.close()}catch(e){}ws=null;$(\"wait\").classList.add(\"hidden\");$(\"onlineScreen\").classList.remove(\"hidden\")};\n$(\"fullBtn\").onclick=function(){requestFullscreenSafe()};\n$(\"menu\").onclick=function(){mode=\"menu\";keys.up=keys.down=false;charging=false;if(ws)try{ws.close()}catch(e){}ws=null;$(\"wait\").classList.add(\"hidden\");$(\"onlineScreen\").classList.add(\"hidden\");$(\"main\").classList.remove(\"hidden\")};\n\nnewGame();\nsetTimeout(function(){if(frameAlive<5)fatal(\"requestAnimationFrame non sta girando (\"+frameAlive+\" frame)\")},1200);\n})();\n</script>\n</body>\n</html>";

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(url.pathname==="/") return new Response(HTML,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
    if(url.pathname==="/api/create"&&request.method==="POST"){
      const code=makeCode(),id=env.ROOMS.idFromName(code),stub=env.ROOMS.get(id);
      await stub.fetch("https://room/init",{method:"POST"});
      return Response.json({code});
    }
    if(url.pathname.startsWith("/ws/")){
      const code=url.pathname.slice(4).toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,5);
      if(!code)return new Response("Bad room",{status:400});
      return env.ROOMS.get(env.ROOMS.idFromName(code)).fetch(new Request("https://room/ws?code="+code,request));
    }
    return new Response("Not found",{status:404});
  }
};

function makeCode(){
 const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let s="";
 for(let i=0;i<5;i++)s+=chars[Math.floor(Math.random()*chars.length)];
 return s;
}

const W=1000,H=450,WALL=18,GT=165,GB=285,BR=8,PR=14;
const BASE={1:[225],2:[145,305],3:[105,225,345],5:[65,145,225,305,385]};
const R=[
 {team:"green",x:70,count:1},{team:"green",x:210,count:2},{team:"blue",x:315,count:3},{team:"green",x:420,count:5},
 {team:"blue",x:580,count:5},{team:"green",x:685,count:3},{team:"blue",x:790,count:2},{team:"blue",x:930,count:1}
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;

export class GameRoom extends DurableObject {
 constructor(ctx,env){super(ctx,env);this.ctx=ctx;this.env=env;this.clients=new Map();this.input={green:{up:false,down:false},blue:{up:false,down:false}};this.s=this.makeState();this.created=false;this.timer=null;this.sendClock=0}
 makeState(){return {score:{green:0,blue:0},rods:R.map(()=>({offset:0,vy:0,kick:0,kickPower:0,hit:false})),ball:{x:500,y:225,vx:210,vy:60,ang:0,still:0},message:""}}
 async fetch(request){
  const u=new URL(request.url);
  if(u.pathname==="/init"){this.created=true;await this.ctx.storage.put("created",true);return new Response("ok")}
  if(u.pathname==="/ws"){
   if(request.headers.get("Upgrade")!=="websocket")return new Response("Expected websocket",{status:426});
   if(!this.created)this.created=!!(await this.ctx.storage.get("created"));
   if(!this.created)return new Response("Room not found",{status:404});
   if(this.clients.size>=2)return new Response("Room full",{status:409});
   const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();
   const used=new Set([...this.clients.values()].map(v=>v.side)),side=used.has("green")?"blue":"green";
   this.clients.set(server,{side});
   server.addEventListener("message",e=>this.onMessage(server,e));
   server.addEventListener("close",()=>this.remove(server));server.addEventListener("error",()=>this.remove(server));
   const code=u.searchParams.get("code")||"";
   server.send(JSON.stringify({type:"joined",room:code,side,waiting:this.clients.size<2}));
   if(this.clients.size===2)for(const [w,m] of this.clients)try{w.send(JSON.stringify({type:"joined",room:code,side:m.side,waiting:false}))}catch{}
   if(!this.timer)this.start();
   return new Response(null,{status:101,webSocket:client});
  }
  return new Response("Not found",{status:404});
 }
 remove(w){const m=this.clients.get(w);this.clients.delete(w);if(m)this.input[m.side]={up:false,down:false};if(!this.clients.size&&this.timer){clearInterval(this.timer);this.timer=null}}
 onMessage(w,e){let m;try{m=JSON.parse(e.data)}catch{return}const meta=this.clients.get(w);if(!meta)return;if(m.type==="input")this.input[meta.side]={up:!!m.up,down:!!m.down};if(m.type==="shoot")this.startKick(meta.side,clamp(Number(m.power)||.08,.08,1))}
 start(){let last=Date.now();this.timer=setInterval(()=>{const n=Date.now(),dt=Math.min(.033,(n-last)/1000);last=n;this.step(dt);this.sendClock+=dt;if(this.sendClock>.033){this.sendClock=0;this.broadcast({type:"state",state:this.s});this.s.message=""}},16)}
 broadcast(o){const t=JSON.stringify(o);for(const w of this.clients.keys())try{w.send(t)}catch{}}
 resetBall(dir=0){const b=this.s.ball,d=dir||((Math.random()>.5)?1:-1);b.x=500;b.y=225+(Math.random()-.5)*30;b.vx=d*(150+Math.random()*30);b.vy=(Math.random()-.5)*55;b.ang=0;b.still=0}
 dir(r){return r.team==="green"?1:-1}
 boot(rr){
  if(rr.kick<=0)return 5;
  const t=rr.kick,wind=-8-rr.kickPower*7;
  if(t<.20){let q=t/.20;q=1-Math.pow(1-q,3);return mix(wind,35,q)}
  if(t<.48)return mix(35,27,(t-.20)/.28);
  let q=(t-.48)/.52;q=q*q*(3-2*q);return mix(27,5,q);
 }
 teamKicking(team){for(let i=0;i<R.length;i++)if(R[i].team===team&&this.s.rods[i].kick>0)return true;return false}
 startKick(team,p){
  if(this.teamKicking(team))return false;
  for(let i=0;i<R.length;i++)if(R[i].team===team){const rr=this.s.rods[i];rr.kick=.001;rr.kickPower=p;rr.hit=false}
  return true;
 }
 capBall(max){const b=this.s.ball,sp=Math.sqrt(b.vx*b.vx+b.vy*b.vy);if(sp>max){const k=max/sp;b.vx*=k;b.vy*=k}}
 score(team){this.s.score[team]++;this.s.message=team==="green"?"GOOOL VERDE!":"GOOOL BLU!";if(this.s.score[team]>=5){this.s.message=(team==="green"?"VERDE":"BLU")+" VINCE!";this.s.ball.vx=0;this.s.ball.vy=0}else this.resetBall(team==="green"?-1:1)}
 collide(){
  const s=this.s,b=s.ball;
  for(let i=0;i<R.length;i++){
   const r=R[i],rr=s.rods[i],off=rr.offset,ys=BASE[r.count],d=this.dir(r);
   for(let j=0;j<ys.length;j++){
    const py=ys[j]+off,dx=b.x-r.x,dy=b.y-py,dist=Math.sqrt(dx*dx+dy*dy),min=BR+PR;

    if(dist<min&&dist>.001){
     const nx=dx/dist,ny=dy/dist;
     b.x=r.x+nx*(min+.2);b.y=py+ny*(min+.2);
     let rvx=b.vx,rvy=b.vy-(rr.vy||0),dot=rvx*nx+rvy*ny;
     if(dot<0){
      const e=.20;
      rvx-=(1+e)*dot*nx;rvy-=(1+e)*dot*ny;
      b.vx=rvx;b.vy=rvy+(rr.vy||0);
      this.capBall(820);
     }
    }

    if(rr.kick>0&&rr.kick<=.50&&!rr.hit){
     const reach=this.boot(rr)+10,localX=(b.x-r.x)*d,localY=b.y-(py+4);
     if(localX>=3-BR&&localX<=reach+BR&&Math.abs(localY)<=22){
      rr.hit=true;
      const offY=clamp(localY/22,-1,1),angle=offY*.48,speed=315+rr.kickPower*445;
      b.vx=d*Math.cos(angle)*speed+b.vx*.10;
      b.vy=Math.sin(angle)*speed+b.vy*.12+(rr.vy||0)*.20;
      b.x=r.x+d*(reach+BR+.5);
      this.capBall(850);
     }
    }
   }
  }
 }
 step(dt){
  if(this.s.score.green>=5||this.s.score.blue>=5)return;

  for(const team of ["green","blue"]){
   const inp=this.input[team],mv=((inp.down?1:0)-(inp.up?1:0))*205*dt;
   for(let i=0;i<R.length;i++)if(R[i].team===team){
    const rr=this.s.rods[i],old=rr.offset;
    rr.offset=clamp(old+mv,-68,68);
    rr.vy=dt>0?(rr.offset-old)/dt:0;
   }
  }

  for(const rr of this.s.rods)if(rr.kick>0){
   rr.kick+=dt/.27;
   if(rr.kick>=1){rr.kick=0;rr.hit=false}
  }

  const b=this.s.ball,spd=Math.sqrt(b.vx*b.vx+b.vy*b.vy);
  const subs=Math.max(1,Math.min(8,Math.ceil(spd*dt/4))),sd=dt/subs;

  for(let n=0;n<subs;n++){
   const ox=b.x,oy=b.y;
   b.x+=b.vx*sd;b.y+=b.vy*sd;
   b.ang+=Math.sqrt((b.x-ox)**2+(b.y-oy)**2)/BR*(b.vx>=0?1:-1);

   if(b.y-BR<WALL){b.y=WALL+BR;b.vy=Math.abs(b.vy)*.66;b.vx*=.965}
   if(b.y+BR>H-WALL){b.y=H-WALL-BR;b.vy=-Math.abs(b.vy)*.66;b.vx*=.965}

   this.collide();

   if(b.x<0){
    if(b.y>GT&&b.y<GB){this.score("blue");return}
    b.x=BR;b.vx=Math.abs(b.vx)*.62;b.vy*=.96;
   }
   if(b.x>W){
    if(b.y>GT&&b.y<GB){this.score("green");return}
    b.x=W-BR;b.vx=-Math.abs(b.vx)*.62;b.vy*=.96;
   }
  }

  let speed=Math.sqrt(b.vx*b.vx+b.vy*b.vy);
  if(speed<6){b.vx=0;b.vy=0}
  else{
   const decel=50+speed*.018,ns=Math.max(0,speed-decel*dt),f=ns/speed;
   b.vx*=f;b.vy*=f;
  }

  if(Math.sqrt(b.vx*b.vx+b.vy*b.vy)<9){
   b.still+=dt;
   if(b.still>=5){this.s.message="Palla ferma: rimessa";this.resetBall()}
  }else b.still=0;
 }
}
