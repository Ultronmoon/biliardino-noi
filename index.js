const HTML = "<!doctype html>\n<html lang=\"it\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover\">\n<title>Biliardino NOI</title>\n<style>\n:root{--bg:#101820;--panel:#17232d;--muted:#9fb0bc;--green:#c9d81e;--blue:#3480d4;--line:#ffffffd8}\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml,body{margin:0;background:var(--bg);color:white;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}\nbody{overscroll-behavior:none}\n.wrap{max-width:980px;margin:auto;padding:10px}\nh1{font-size:20px;margin:0}.sub{color:var(--muted);font-size:13px;margin-top:3px}\n.lobby{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}\nbutton,input{font:inherit;min-height:48px;border-radius:11px}\nbutton{border:0;font-weight:800;padding:0 14px}\n.primary{background:var(--green);color:#101820}.secondary{background:#263845;color:white;border:1px solid #415260}\n.join{display:grid;grid-template-columns:1fr auto;gap:8px}\ninput{background:#0f171e;color:white;border:1px solid #415260;padding:0 12px;text-transform:uppercase;font-size:16px;min-width:0}\n.status{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:9px}.pill{font-size:12px;border:1px solid #3a4a57;background:#182630;border-radius:999px;padding:6px 9px}\n.score{display:grid;grid-template-columns:1fr auto 1fr;gap:7px;margin-bottom:8px}\n.score div{background:var(--panel);border:1px solid #31414d;border-radius:10px;text-align:center;padding:6px}.score b{display:block;font-size:24px}\n.game{border-radius:13px;overflow:hidden;border:1px solid #334651;background:#176b3a}\ncanvas{display:block;width:100%;height:auto;touch-action:none}\n.powerHead{display:flex;justify-content:space-between;font-size:13px;margin-top:8px}.power{height:11px;border-radius:99px;background:#263845;overflow:hidden}.fill{height:100%;width:0;background:var(--green)}\n.controls{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-top:10px}\n.controls button{min-height:62px;font-size:16px;touch-action:none}\n.msg{text-align:center;min-height:25px;margin-top:7px;font-weight:700;font-size:14px}\n.help{color:var(--muted);font-size:12px;text-align:center;margin-top:6px}\n@media(max-width:620px){\n .wrap{padding:7px}.lobby{grid-template-columns:1fr}.controls{position:relative}.controls button{min-height:68px;padding:0 6px}\n h1{font-size:18px}.score b{font-size:20px}.help.desktop{display:none}\n}\n@media(max-width:380px){.controls{gap:5px}.controls button{font-size:14px}}\n</style>\n</head>\n<body>\n<div class=\"wrap\">\n  <h1>Biliardino NOI</h1>\n  <div class=\"sub\">1 vs 1 online \u00b7 aprite entrambi questo stesso link</div>\n\n  <div class=\"lobby\">\n    <button id=\"create\" class=\"primary\">CREA PARTITA</button>\n    <div class=\"join\"><input id=\"code\" maxlength=\"6\" placeholder=\"CODICE\"><button id=\"join\" class=\"secondary\">ENTRA</button></div>\n  </div>\n\n  <div class=\"status\">\n    <span class=\"pill\" id=\"net\">Non connesso</span>\n    <span class=\"pill\" id=\"room\">Stanza: \u2014</span>\n    <span class=\"pill\" id=\"team\">Squadra: \u2014</span>\n  </div>\n\n  <div class=\"score\">\n    <div>VERDE<b id=\"sg\">0</b></div>\n    <div>VS</div>\n    <div>BLU<b id=\"sb\">0</b></div>\n  </div>\n\n  <div class=\"game\"><canvas id=\"c\" width=\"900\" height=\"500\"></canvas></div>\n\n  <div class=\"powerHead\"><span>Potenza tiro</span><span id=\"pl\">0%</span></div>\n  <div class=\"power\"><div id=\"pf\" class=\"fill\"></div></div>\n\n  <div class=\"controls\">\n    <button id=\"up\" class=\"secondary\">\u25b2 SU</button>\n    <button id=\"down\" class=\"secondary\">\u25bc GI\u00d9</button>\n    <button id=\"charge\" class=\"secondary\">CARICA</button>\n    <button id=\"shoot\" class=\"primary\">TIRA</button>\n  </div>\n  <div id=\"msg\" class=\"msg\">Crea una partita o inserisci un codice.</div>\n  <div class=\"help desktop\">PC: W/S per muovere \u00b7 tieni \u2190 per caricare \u00b7 \u2192 per tirare</div>\n</div>\n<script>\nconst $=s=>document.querySelector(s), c=$('#c'),ctx=c.getContext('2d');\nconst W=900,H=500,GT=183,GB=317;\nlet ws=null,side=null,room=null,state=null,charge=0,charging=false;\nconst input={up:false,down:false};\nconst bases={1:[250],2:[175,325],3:[130,250,370],5:[80,165,250,335,420]};\nconst layout=[['green',72,1],['green',205,2],['blue',292,3],['green',392,5],['blue',508,5],['green',608,3],['blue',695,2],['blue',828,1]];\n\nfunction msg(t){$('#msg').textContent=t}\nfunction power(){let p=Math.round(charge*100);$('#pf').style.width=p+'%';$('#pl').textContent=p+'%'}\nfunction socketUrl(code){return (location.protocol==='https:'?'wss:':'ws:')+'//'+location.host+'/ws/'+encodeURIComponent(code)}\nasync function createRoom(){\n  msg('Creo la stanza\u2026');\n  const r=await fetch('/api/create',{method:'POST'}); const j=await r.json();\n  if(!r.ok){msg(j.error||'Errore');return}\n  $('#code').value=j.code; connect(j.code);\n}\nfunction connect(code){\n  if(ws)try{ws.close()}catch{}\n  ws=new WebSocket(socketUrl(code));\n  $('#net').textContent='Connessione\u2026';\n  ws.onopen=()=>{$('#net').textContent='Online'};\n  ws.onclose=()=>{$('#net').textContent='Disconnesso'};\n  ws.onerror=()=>msg('Errore di connessione.');\n  ws.onmessage=e=>{\n    const m=JSON.parse(e.data);\n    if(m.type==='joined'){\n      room=m.room;side=m.side;\n      $('#room').textContent='Stanza: '+room;\n      $('#team').textContent='Squadra: '+(side==='green'?'VERDE':'BLU');\n      msg(m.waiting?'Condividi il codice '+room+' e attendi il secondo giocatore.':'Avversario connesso!');\n    } else if(m.type==='state'){\n      state=m.state;$('#sg').textContent=state.score.green;$('#sb').textContent=state.score.blue;\n      if(state.message)msg(state.message);\n    } else if(m.type==='error'){msg(m.message)}\n  };\n}\n$('#create').onclick=()=>createRoom().catch(()=>msg('Errore durante la creazione.'));\n$('#join').onclick=()=>{const x=$('#code').value.trim().toUpperCase();if(!x)return msg('Inserisci il codice stanza.');connect(x)};\n\nfunction send(o){if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))}\nsetInterval(()=>send({type:'input',up:input.up,down:input.down}),50);\nsetInterval(()=>{if(charging){charge=Math.min(1,charge+.045);power()}},50);\nfunction shoot(){send({type:'shoot',power:Math.max(.08,charge)});charge=0;charging=false;power()}\n\naddEventListener('keydown',e=>{\n if(['w','W','s','S','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();\n if(e.key==='w'||e.key==='W')input.up=true;if(e.key==='s'||e.key==='S')input.down=true;\n if(e.key==='ArrowLeft')charging=true;if(e.key==='ArrowRight'&&!e.repeat)shoot();\n});\naddEventListener('keyup',e=>{\n if(e.key==='w'||e.key==='W')input.up=false;if(e.key==='s'||e.key==='S')input.down=false;if(e.key==='ArrowLeft')charging=false;\n});\nfunction hold(id,key){const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();input[key]=true});['pointerup','pointercancel','pointerleave'].forEach(n=>b.addEventListener(n,e=>{e.preventDefault();input[key]=false}))}\nhold('#up','up');hold('#down','down');\n$('#charge').addEventListener('pointerdown',e=>{e.preventDefault();charging=true});\n['pointerup','pointercancel','pointerleave'].forEach(n=>$('#charge').addEventListener(n,e=>{e.preventDefault();charging=false}));\n$('#shoot').onclick=shoot;\n\nfunction field(){\n ctx.clearRect(0,0,W,H);ctx.fillStyle='#176b3a';ctx.fillRect(0,0,W,H);\n ctx.fillStyle='rgba(255,255,255,.025)';for(let x=0;x<W;x+=100)ctx.fillRect(x,0,50,H);\n ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=3;ctx.strokeRect(18,18,W-36,H-36);\n ctx.beginPath();ctx.moveTo(450,18);ctx.lineTo(450,482);ctx.stroke();ctx.beginPath();ctx.arc(450,250,66,0,Math.PI*2);ctx.stroke();\n ctx.strokeRect(18,145,105,210);ctx.strokeRect(777,145,105,210);\n ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(0,GT,18,GB-GT);ctx.fillRect(882,GT,18,GB-GT);\n}\nfunction player(team,x,y,on){\n ctx.fillStyle=team==='green'?'#c9d81e':'#3480d4';ctx.strokeStyle=on?'white':'rgba(0,0,0,.4)';ctx.lineWidth=on?2.5:1.5;\n ctx.beginPath();ctx.roundRect(x-12,y-14,24,28,7);ctx.fill();ctx.stroke();\n ctx.fillStyle=team==='green'?'#879000':'#174f8e';ctx.beginPath();ctx.arc(x,y-5,5,0,Math.PI*2);ctx.fill();\n}\nfunction draw(){\n field();\n if(state){\n  layout.forEach((r,i)=>{const [team,x,n]=r,off=state.rods[i].offset||0,on=side===team;\n   ctx.strokeStyle=on?'rgba(255,255,255,.9)':'rgba(20,30,25,.45)';ctx.lineWidth=on?4:3;ctx.beginPath();ctx.moveTo(x,18);ctx.lineTo(x,482);ctx.stroke();\n   bases[n].forEach(y=>player(team,x,y+off,on));\n  });\n  ctx.save();ctx.translate(state.ball.x,state.ball.y);ctx.rotate(state.ball.angle||0);ctx.fillStyle='#faf9f1';ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.fill();\n  ctx.fillStyle='#333';ctx.beginPath();ctx.arc(3,-2,2.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(-4,3,1.7,0,Math.PI*2);ctx.fill();ctx.restore();\n } else {ctx.fillStyle='rgba(255,255,255,.8)';ctx.font='bold 23px system-ui';ctx.textAlign='center';ctx.fillText('Crea o entra in una stanza',450,250)}\n requestAnimationFrame(draw);\n}\ndraw();\n</script>\n</body></html>";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(HTML, { headers: { "content-type": "text/html;charset=UTF-8" } });
    }

    if (url.pathname === "/api/create" && request.method === "POST") {
      const code = makeCode();
      const id = env.ROOMS.idFromName(code);
      const room = env.ROOMS.get(id);
      await room.fetch("https://room/init", { method: "POST" });
      return Response.json({ code });
    }

    if (url.pathname.startsWith("/ws/")) {
      const code = url.pathname.slice(4).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
      if (!code) return new Response("Bad room", { status: 400 });
      const id = env.ROOMS.idFromName(code);
      return env.ROOMS.get(id).fetch(new Request("https://room/ws?code=" + code, request));
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

const BASES={1:[250],2:[175,325],3:[130,250,370],5:[80,165,250,335,420]};
const LAYOUT=[
  {team:"green",x:72,count:1},{team:"green",x:205,count:2},
  {team:"blue",x:292,count:3},{team:"green",x:392,count:5},
  {team:"blue",x:508,count:5},{team:"green",x:608,count:3},
  {team:"blue",x:695,count:2},{team:"blue",x:828,count:1}
];

export class GameRoom {
  constructor(ctx, env) {
    this.ctx=ctx; this.env=env;
    this.clients=new Map();
    this.input={green:{up:false,down:false},blue:{up:false,down:false}};
    this.state=this.makeState();
    this.timer=null;
    this.created=false;
  }

  makeState() {
    return {
      score:{green:0,blue:0},
      rods:LAYOUT.map(()=>({offset:0})),
      ball:{x:450,y:250,vx:220,vy:70,angle:0,still:0},
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
      if(!this.created) this.created=!!(await this.ctx.storage.get("created"));
      if(!this.created) return new Response("Room not found",{status:404});
      if(this.clients.size>=2) return new Response("Room full",{status:409});

      const pair=new WebSocketPair();
      const client=pair[0], server=pair[1];
      server.accept();

      const used=new Set([...this.clients.values()].map(v=>v.side));
      const side=used.has("green")?"blue":"green";
      this.clients.set(server,{side});

      server.addEventListener("message",e=>this.onMessage(server,e));
      server.addEventListener("close",()=>this.remove(server));
      server.addEventListener("error",()=>this.remove(server));

      const code=url.searchParams.get("code")||"";
      server.send(JSON.stringify({type:"joined",room:code,side,waiting:this.clients.size<2}));
      for(const [ws,meta] of this.clients) {
        if(ws!==server && this.clients.size===2) ws.send(JSON.stringify({type:"joined",room:code,side:meta.side,waiting:false}));
      }

      if(!this.timer) this.startLoop();
      return new Response(null,{status:101,webSocket:client});
    }

    return new Response("Not found",{status:404});
  }

  remove(ws) {
    const meta=this.clients.get(ws);
    this.clients.delete(ws);
    if(meta) this.input[meta.side]={up:false,down:false};
    if(this.clients.size===0 && this.timer) { clearInterval(this.timer); this.timer=null; }
  }

  onMessage(ws,e) {
    let m; try{m=JSON.parse(e.data)}catch{return}
    const meta=this.clients.get(ws); if(!meta)return;
    const side=meta.side;
    if(m.type==="input") this.input[side]={up:!!m.up,down:!!m.down};
    if(m.type==="shoot") this.shoot(side,Math.max(.08,Math.min(1,Number(m.power)||.08)));
  }

  startLoop() {
    let last=Date.now();
    this.timer=setInterval(()=>{
      const now=Date.now(),dt=Math.min(.034,(now-last)/1000);last=now;
      this.step(dt); this.broadcast({type:"state",state:this.state});
    },33);
  }

  broadcast(obj) {
    const txt=JSON.stringify(obj);
    for(const ws of this.clients.keys()) try{ws.send(txt)}catch{}
  }

  resetBall(dir=0) {
    const b=this.state.ball;
    b.x=450;b.y=250+(Math.random()-.5)*40;
    const d=dir||(Math.random()>.5?1:-1);
    b.vx=d*(185+Math.random()*35);b.vy=(Math.random()-.5)*90;b.angle=0;b.still=0;
  }

  shoot(team,power) {
    const b=this.state.ball,dir=team==="green"?1:-1;
    let best=null,bestD=Infinity;
    LAYOUT.forEach((r,i)=>{
      if(r.team!==team)return;
      for(const base of BASES[r.count]) {
        const py=base+this.state.rods[i].offset;
        const dx=(b.x-r.x)*dir,dy=Math.abs(b.y-py);
        if(dx>=-14&&dx<=48&&dy<=30) {
          const d=Math.abs(dx)+dy;
          if(d<bestD){bestD=d;best={py}}
        }
      }
    });
    if(!best)return;
    const v=Math.max(-1,Math.min(1,(b.y-best.py)/28));
    const force=270+power*630;
    b.vx=dir*force;b.vy=b.vy*.35+v*(110+power*190);
  }

  collide() {
    const b=this.state.ball;
    LAYOUT.forEach((r,i)=>{
      const off=this.state.rods[i].offset;
      for(const base of BASES[r.count]) {
        const py=base+off,dx=b.x-r.x,dy=b.y-py,dist=Math.hypot(dx,dy),min=24;
        if(dist<min&&dist>.001) {
          const nx=dx/dist,ny=dy/dist;
          b.x=r.x+nx*min;b.y=py+ny*min;
          const dot=b.vx*nx+b.vy*ny;
          if(dot<0){const e=.64;b.vx-=(1+e)*dot*nx;b.vy-=(1+e)*dot*ny}
        }
      }
    });
  }

  goal(team) {
    const s=this.state;s.score[team]++;
    s.message=(team==="green"?"GOOOL VERDE!":"GOOOL BLU!");
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
      const inp=this.input[team],move=((inp.down?1:0)-(inp.up?1:0))*220*dt;
      LAYOUT.forEach((r,i)=>{if(r.team===team)s.rods[i].offset=Math.max(-72,Math.min(72,s.rods[i].offset+move))});
    }

    const b=s.ball,spd=Math.hypot(b.vx,b.vy),steps=Math.max(1,Math.min(10,Math.ceil(spd*dt/4))),sd=dt/steps;
    for(let k=0;k<steps;k++) {
      const ox=b.x,oy=b.y;b.x+=b.vx*sd;b.y+=b.vy*sd;
      b.angle+=Math.hypot(b.x-ox,b.y-oy)/9*(b.vx>=0?1:-1);

      if(b.y-9<18){b.y=27;b.vy=Math.abs(b.vy)*.78;b.vx*=.96}
      if(b.y+9>482){b.y=473;b.vy=-Math.abs(b.vy)*.78;b.vx*=.96}
      this.collide();

      if(b.x<0) {
        if(b.y>183&&b.y<317){this.goal("blue");return}
        b.x=9;b.vx=Math.abs(b.vx)*.78;b.vy*=.96;
      }
      if(b.x>900) {
        if(b.y>183&&b.y<317){this.goal("green");return}
        b.x=891;b.vx=-Math.abs(b.vx)*.78;b.vy*=.96;
      }
    }

    const speed=Math.hypot(b.vx,b.vy);
    if(speed>0) {
      const decel=28+speed*.012,ns=Math.max(0,speed-decel*dt),f=ns/speed;
      b.vx*=f;b.vy*=f;
    }

    // Regola richiesta: quasi ferma per 5 secondi consecutivi -> rimessa al centro.
    if(Math.hypot(b.vx,b.vy)<12) {
      b.still+=dt;
      if(b.still>=5) {
        s.message="Palla ferma 5 secondi — rimessa al centro";
        this.resetBall();
      }
    } else {
      b.still=0;
      if(s.message.startsWith("Palla ferma"))s.message="";
    }
  }
}
