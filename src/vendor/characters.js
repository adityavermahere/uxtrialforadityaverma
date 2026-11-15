
/* ae-char */
(function(){
if (customElements.get('ae-char')) return;
const K='#141A3A';
const C={k:K,b:'#1D5BF5',d:'#1238B0',s:'#86A6FF',p:'#DFE7FF',w:'#FFFFFF',v:'#7558E8',l:'#BCAEF8',m:'#E8A3CF',g:'#B8BED3',G:'#ECEEF5',a:'#F2A93B',A:'#FFE2B0',t:'#33C18F',n:'#2B2290',h:'#D9DDEA'};
const PI=Math.PI, rad=d=>d*PI/180, q=n=>Math.round(n*100)/100;
let SW=3, SMALL=false;
const st=w=>`stroke="${K}" stroke-width="${q(w||SW)}" stroke-linejoin="round" stroke-linecap="round"`;
function shadow(w,op,dy){dy=dy||0;const k=Math.max(.45,1+dy/40);return `<ellipse cx="50" cy="93" rx="${q(w*k)}" ry="2.6" fill="${K}" opacity="${q((op||.12)*k)}"/>`;}
function wrap(p,inner,piv){piv=piv||80;return `<g transform="translate(0 ${q(p.dy||0)}) translate(50 ${piv}) rotate(${q(p.tilt||0)}) scale(${q(p.sx??1)} ${q(p.sy??1)}) translate(-50 -${piv})">${inner}</g>`;}
function eye(x,y,r,t,lx,ly,col,side){
  col=col||K;const rx=r*.74,lw=q(SW*.95);
  if(t==='none')return '';
  if(t==='closed')return `<path d="M${q(x-rx*1.3)} ${q(y)} Q${q(x)} ${q(y+r*.9)} ${q(x+rx*1.3)} ${q(y)}" fill="none" stroke="${col}" stroke-width="${lw}" stroke-linecap="round"/>`;
  if(t==='happy')return `<path d="M${q(x-rx*1.3)} ${q(y+r*.4)} Q${q(x)} ${q(y-r*1.1)} ${q(x+rx*1.3)} ${q(y+r*.4)}" fill="none" stroke="${col}" stroke-width="${lw}" stroke-linecap="round"/>`;
  let ry=r,cy=y,rxx=rx;
  if(t==='half'){ry=r*.55;cy=y+r*.4}
  if(t==='wide'){ry=r*1.15;rxx=rx*1.12}
  if(t==='focus'){ry=r*.7;cy=y+r*.25}
  if(t==='concern'){ry=r*.8;cy=y+r*.2}
  const ex=x+lx*rx*.6,ey=cy+ly*ry*.35;
  let s=`<ellipse cx="${q(ex)}" cy="${q(ey)}" rx="${q(rxx)}" ry="${q(ry)}" fill="${col}"/>`;
  if(col===K&&!SMALL)s+=`<circle cx="${q(ex-rxx*.25+lx*rxx*.15)}" cy="${q(ey-ry*.42)}" r="${q(rxx*.38)}" fill="#fff"/>`;
  if(t==='concern'){const ix=x-side*rx*1.1,ox=x+side*rx*1.3;s+=`<path d="M${q(ox)} ${q(y-r*1.15)} L${q(ix)} ${q(y-r*1.6)}" stroke="${col}" stroke-width="${q(SW*.8)}" stroke-linecap="round"/>`;}
  return s;
}
function eyes(cx,cy,gap,r,t,lx,ly,col){const [a,b]=(t||'open').split('|');return eye(cx-gap,cy,r,a,lx||0,ly||0,col,-1)+eye(cx+gap,cy,r,b||a,lx||0,ly||0,col,1);}
function mouth(x,y,w,t,col){
  col=col||K;const lw=q(SW*.85),L=`fill="none" stroke="${col}" stroke-width="${lw}" stroke-linecap="round" stroke-linejoin="round"`;
  if(t==='smile')return `<path d="M${q(x-w)} ${q(y)} Q${q(x)} ${q(y+w*.9)} ${q(x+w)} ${q(y)}" ${L}/>`;
  if(t==='small'){w*=.55;return `<path d="M${q(x-w)} ${q(y)} Q${q(x)} ${q(y+w*.9)} ${q(x+w)} ${q(y)}" ${L}/>`;}
  if(t==='grin')return `<path d="M${q(x-w)} ${q(y)} Q${q(x)} ${q(y+w*1.4)} ${q(x+w)} ${q(y)} Z" fill="${col}" stroke="${col}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  if(t==='o')return `<ellipse cx="${q(x)}" cy="${q(y+w*.3)}" rx="${q(w*.35)}" ry="${q(w*.45)}" fill="${col}"/>`;
  if(t==='flat')return `<path d="M${q(x-w*.5)} ${q(y+w*.25)} L${q(x+w*.5)} ${q(y+w*.25)}" ${L}/>`;
  return '';
}
function blush(x,y,gap){return SMALL?'':`<ellipse cx="${q(x-gap)}" cy="${q(y)}" rx="3.2" ry="1.9" fill="${C.m}" opacity=".6"/><ellipse cx="${q(x+gap)}" cy="${q(y)}" rx="3.2" ry="1.9" fill="${C.m}" opacity=".6"/>`;}
function star(x,y,s,c){return `<path d="M${q(x)} ${q(y-s)} Q${q(x)} ${q(y)} ${q(x+s)} ${q(y)} Q${q(x)} ${q(y)} ${q(x)} ${q(y+s)} Q${q(x)} ${q(y)} ${q(x-s)} ${q(y)} Q${q(x)} ${q(y)} ${q(x)} ${q(y-s)} Z" fill="${c}"/>`;}
function Z(x,y,s,c){return `<path d="M${q(x)} ${q(y)} h${s} l-${s} ${s} h${s}" fill="none" stroke="${c}" stroke-width="${q(SW*.8)}" stroke-linecap="round" stroke-linejoin="round"/>`;}
function ov(t,x,y,k){
  k=Math.round(k||0);if(!t)return '';
  if(t==='dots'){let s='';for(let i=0;i<3;i++){const on=i===(k%3);s+=`<circle cx="${x+i*7}" cy="${y-(on?2:0)}" r="${on?2.7:2}" fill="${on?C.b:C.s}"/>`;}return s;}
  if(t==='zz')return Z(x,y,6,C.v)+Z(x+9,y-10,4,C.l);
  if(t==='spark')return star(x,y,6.5,C.b)+star(x+12,y+9,3.8,C.v)+star(x-18,y+2,3,C.s);
  if(t==='ping')return `<circle cx="${x}" cy="${y}" r="8.5" fill="none" stroke="${C.s}" stroke-width="1.6" opacity=".8"/>`+star(x,y,5,C.b);
  if(t==='bang')return `<circle cx="${x}" cy="${y}" r="6.5" fill="${C.a}" ${st(SW*.7)}/><rect x="${x-1}" y="${y-4}" width="2" height="5" rx="1" fill="#fff"/><circle cx="${x}" cy="${y+3}" r="1.1" fill="#fff"/>`;
  if(t==='clock'){const a=rad(k*90-90);return `<circle cx="${x}" cy="${y}" r="6.5" fill="#fff" ${st(SW*.7)}/><path d="M${x} ${y} L${q(x+Math.cos(a)*4)} ${q(y+Math.sin(a)*4)}" ${st(SW*.6)}/><circle cx="${x}" cy="${y}" r="1" fill="${K}"/>`;}
  if(t==='listen')return `<path d="M${x+5} ${y-6} Q${x} ${y} ${x+5} ${y+6}" fill="none" stroke="${C.b}" stroke-width="2.2" stroke-linecap="round"/><path d="M${x-1} ${y-10} Q${x-8} ${y} ${x-1} ${y+10}" fill="none" stroke="${C.s}" stroke-width="2.2" stroke-linecap="round"/>`;
  return '';
}
function tear(cx,cy,r,tx,ty){return `M${q(cx-r)} ${q(cy)} A${q(r)} ${q(r)} 0 0 0 ${q(cx+r)} ${q(cy)} C${q(cx+r)} ${q(cy-r*.95)} ${q(tx+7)} ${q(ty+13)} ${q(tx)} ${q(ty)} C${q(tx-7)} ${q(ty+9)} ${q(cx-r*1.05)} ${q(cy-r*.8)} ${q(cx-r)} ${q(cy)} Z`;}

/* ---------- C10 KNOT ---------- */
const KA=[-135,-45,45,135],KC=['b','v','b','v'],KH=['s','l','s','l'];
function knot(p){
  const y=rad(p.yaw||0),cyw=Math.cos(y),syw=Math.sin(y),sp=p.spread??1,cr=p.cr??19;
  let s='';
  if(p.guides){s+=`<circle cx="50" cy="50" r="22" fill="none" stroke="${C.s}" stroke-width=".6" stroke-dasharray="2 2"/><circle cx="50" cy="50" r="36" fill="none" stroke="${C.s}" stroke-width=".6" stroke-dasharray="2 2"/><path d="M14 50H86M50 14V86" stroke="${C.s}" stroke-width=".6" stroke-dasharray="2 2"/>`;}
  for(let i=0;i<4;i++){
    const o=p.lobes[i],a=rad(KA[i]+(p.rot||0)+o.a),d=(22+o.d)*sp,L=o.l;
    const x=50+Math.cos(a)*d*cyw-syw*5,yy=50+Math.sin(a)*d,rx=13.5*L,ry=11.5;
    s+=`<g transform="translate(${q(x)} ${q(yy)}) scale(${q(Math.max(.2,cyw))} 1) rotate(${q(a*180/PI)})"><ellipse rx="${q(rx)}" ry="${ry}" fill="${C[KC[i]]}" ${st()}/>${SMALL?'':`<ellipse cx="${q(rx*.42)}" cy="${q(-ry*.3)}" rx="${q(rx*.3)}" ry="${q(ry*.22)}" fill="${C[KH[i]]}" opacity=".8"/>`}</g>`;
  }
  const fx=50+syw*cr*.42+(p.lx||0)*1.4,fy=49+(p.ly||0)*1.2,sc=cr/19;
  s+=`<circle cx="${q(50+syw*2)}" cy="50" r="${q(cr)}" fill="#fff"/>`;
  if(!SMALL)s+=`<ellipse cx="${q(50+syw*2)}" cy="${q(50+cr*.55)}" rx="${q(cr*.6)}" ry="${q(cr*.24)}" fill="${C.p}"/>`;
  s+=`<circle cx="${q(50+syw*2)}" cy="50" r="${q(cr)}" fill="none" ${st()}/>`;
  if(p.eye!=='none'){
    const gap=7*sc*(1-.35*Math.abs(syw));
    if(p.blush)s+=blush(fx,fy+5.5*sc,11*sc*(1-.3*Math.abs(syw)));
    s+=eyes(fx,fy,gap,4.4*sc,p.eye,p.lx,p.ly);
    s+=mouth(fx,fy+8*sc,3.4*sc,p.mouth);
  }
  return wrap(p,s,70)+ovPos(p,72,20);
}
function ovPos(p,x,y){
  if(!p.ov)return '';
  if(p.ov==='listen')return ov('listen',12,46,p.ovk);
  if(p.ov==='spark')return ov('spark',x+4,y+2,p.ovk);
  return ov(p.ov,x,y,p.ovk);
}
/* ---------- C07 QUAD ---------- */
const QP=[[35,36],[65,36],[35,66],[65,66]],QC=['b','v','p','d'];
function quad(p){
  const y=rad(p.yaw||0),cy=Math.cos(y),sy=Math.sin(y),ex=sy*7,ey=-Math.abs(sy)*4;
  let s='';
  if(p.feet)s+=`<rect x="${q(50-15*cy-6)}" y="80" width="11" height="8" rx="3" fill="${K}"/><rect x="${q(50+15*cy-5)}" y="80" width="11" height="8" rx="3" fill="${K}"/>`;
  const dark={b:'d',v:'n',p:'s',d:'n',a:'a'};
  const order=[2,3,0,1];let eyesS='';
  for(const i of order){
    const t=p.t[i],cx=50+(QP[i][0]-50)*cy+t.x,cyy=QP[i][1]+t.y,z=28*t.s,h=z/2,col=t.c||QC[i];
    s+=`<g transform="translate(${q(cx)} ${q(cyy)}) rotate(${q(t.r)}) scale(${q(Math.max(.05,t.fx)*Math.max(.3,cy))} 1)">`;
    if(Math.abs(sy)>.05)s+=`<rect x="${q(-h+ex)}" y="${q(-h+ey)}" width="${q(z)}" height="${q(z)}" rx="7" fill="${C[dark[col]]}" ${st()}/>`;
    s+=`<rect x="${q(-h)}" y="${q(-h)}" width="${q(z)}" height="${q(z)}" rx="7" fill="${C[col]}" ${st()}/>`;
    if(!SMALL)s+=`<rect x="${q(-h+4.5)}" y="${q(-h+4.5)}" width="${q(z*.3)}" height="3" rx="1.5" fill="#fff" opacity=".45"/>`;
    s+=`</g>`;
    if(i<2&&p.eye!=='none'&&t.fx>.35){
      const a=rad(t.r),ox=(i===0?4:-4)*cy,oy=2;
      const exx=cx+ox*Math.cos(a)-oy*Math.sin(a)+sy*3,eyy=cyy+ox*Math.sin(a)+oy*Math.cos(a);
      const [e0,e1]=(p.eye||'open').split('|');
      eyesS+=eye(exx,eyy,4.6*t.s,i===0?e0:(e1||e0),p.lx,p.ly,'#fff',i===0?-1:1);
    }
  }
  return wrap(p,s+eyesS,86)+ovPos(p,80,14);
}
/* ---------- C15 POD ---------- */
function pod(p){
  const k=Math.sin(rad(p.yaw||0)),oL=p.open+p.oL,oR=p.open+p.oR;
  const cx=50+k*6;let s='';
  s+=`<circle cx="${q(cx)}" cy="52" r="17" fill="${p.core==='a'?C.A:C.p}" ${st()}/>`;
  if(!SMALL)s+=`<circle cx="${q(cx-3)}" cy="48" r="9" fill="#fff" opacity=".7"/>`;
  if(p.ringOn)s+=`<circle cx="${q(cx)}" cy="52" r="13.5" fill="none" stroke="${C.b}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="18 67" transform="rotate(${q(p.ring)} ${q(cx)} 52)"/>`;
  s+=eyes(cx+k*3+p.lx*1.6,51+p.ly*1.2,6*(1-.3*Math.abs(k)),4,p.eye,p.lx,p.ly);
  s+=mouth(cx+k*3+p.lx*1.6,58.5+p.ly,3,p.mouth);
  const sL=1-.12*k,sR=1-.55*k;
  s+=`<g transform="rotate(${q(-oL)} 50 82) translate(50 0) scale(${q(sL)} 1) translate(-50 0)"><path d="M50 19 q-1 -7 6 -10" fill="none" ${st()}/><ellipse cx="57" cy="8.5" rx="4" ry="2.4" fill="${C.l}" ${st(SW*.7)} transform="rotate(-25 57 8.5)"/><path d="M50 19 A25 31 0 0 0 50 81 Z" fill="${C.b}" ${st()}/>${SMALL?'':`<path d="M42 27 Q31 40 33 62" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".38"/>`}</g>`;
  s+=`<g transform="rotate(${q(oR)} 50 82) translate(50 0) scale(${q(sR)} 1) translate(-50 0)"><path d="M50 19 A25 31 0 0 1 50 81 Z" fill="${C.d}" ${st()}/>${SMALL?'':`<path d="M60 28 Q68 40 67 58" fill="none" stroke="${C.s}" stroke-width="2.4" stroke-linecap="round" opacity=".45"/>`}</g>`;
  s+=`<circle cx="50" cy="83" r="5" fill="${C.v}" ${st()}/>`;
  return wrap(p,s,82)+ovPos(p,76,18);
}
/* ---------- C16 WISP ---------- */
function wisp(p){
  const k=Math.sin(rad(p.yaw||0)),r=p.r,cx=50,cy=60,tx=56+p.tx,ty=20+p.ty;
  const body=p.hue==='dim'?C.d:C.b,inner=p.hue==='amber'?C.A:p.hue==='dim'?C.s:C.p;
  let s='';
  const hand=(h,back)=>`<circle cx="${q(h.x)}" cy="${q(h.y)}" r="5.6" fill="${body}" ${st()} ${back?'opacity=".9"':''}/>`+(SMALL?'':`<circle cx="${q(h.x-1.6)}" cy="${q(h.y-1.8)}" r="1.6" fill="#fff" opacity=".5"/>`);
  if(k>.6)s+=hand(p.hL,1);
  s+=`<path d="${tear(cx,cy,r,tx,ty)}" fill="${body}" ${st()}/>`;
  s+=`<path d="${tear(cx+k*4,cy+3,r*.68,cx+(tx-cx)*.6+k*4,cy+(ty-cy)*.55+3)}" fill="${inner}"/>`;
  const fx=cx+k*7+p.lx*1.4,fy=cy+2+p.ly*1.1,sc=r/20;
  if(p.eye!=='none'){s+=eyes(fx,fy,6.5*sc*(1-.35*Math.abs(k)),3.8*sc,p.eye,p.lx,p.ly);s+=mouth(fx,fy+7*sc,3*sc,p.mouth);}
  if(k<=.6)s+=hand(p.hL);
  s+=hand(p.hR);
  return wrap(p,s,78)+ovPos(p,76,22);
}
/* ---------- C01 CARET (pixel) ---------- */
function caret(p){
  const g=5,ox=10,oy=10;let s='';
  const R=(x,y,w,h,c)=>{if(w<=0||h<=0)return;s+=`<rect x="${ox+x*g}" y="${oy+y*g}" width="${w*g+.04}" height="${h*g+.04}" fill="${C[c]||c}"/>`;};
  let sh='';
  const view=p.view||'front';
  if(p.form==='cursor'){
    R(5,4,6,3,'k');R(6,5,4,1,p.cap==='off'?'g':'v');R(7,7,2,8,'k');R(6,14,4,1,'k');
    sh=`<rect x="${ox+6*g}" y="${oy+16*g}" width="${4*g}" height="${g}" fill="${C.h}"/>`;
    return sh+`<g transform="translate(0 ${q((p.dy||0)*g)})">${s}</g>`;
  }
  let w=view==='side'?6:8,h=10;
  if(p.shape==='squash'){w+=2;h-=2}else if(p.shape==='stretch'){w-=2;h+=1}else if(p.shape==='breath'){h-=1}
  const x0=8-w/2,top=14-h,bot=13,ln=p.lean||0;
  const legs=p.legs;
  if(legs!=='none'){
    const L1=x0+1,L2=x0+w-3;
    if(view==='side'){R(x0+1,14,2,legs==='stepA'?1:2,'k');R(x0+3,14,2,legs==='stepB'?1:2,'k');}
    else if(legs==='stepA'){R(L1,14,2,1,'k');R(L2,14,2,2,'k');}
    else if(legs==='stepB'){R(L1,14,2,2,'k');R(L2,14,2,1,'k');}
    else if(legs==='tuck'){R(L1,14,2,1,'k');R(L2,14,2,1,'k');}
    else if(legs==='spread'){R(x0,14,2,2,'k');R(x0+w-2,14,2,2,'k');}
    else{R(L1,14,2,2,'k');R(L2,14,2,2,'k');}
  }
  const arm=(side,t)=>{
    const X=side<0?x0-1:x0+w,dx=side<0?-1:1;
    if(t==='none')return;
    if(t==='up'){R(X,top+1,1,4,'k');return;}
    if(t==='wave'){R(X,top+4,1,1,'k');R(X+dx,top+3,1,1,'k');R(X+2*dx,top+1,1,2,'k');return;}
    if(t==='point'){R(side<0?X-2:X,top+5,3,1,'k');return;}
    if(t==='point2'){R(side<0?X-3:X,top+5,4,1,'k');R(side<0?X-3:X+3,top+4,1,1,'k');return;}
    if(t==='chin'){R(X,top+5,1,2,'k');R(X-dx,top+4,1,1,'k');return;}
    if(t==='down'){R(X,top+6,1,3,'k');return;}
    if(t==='type'){R(X,top+7,1,1,'k');R(X+dx,top+7,1,1,'k');return;}
    R(X,top+5,1,2,'k');
  };
  if(view!=='side')arm(-1,p.armL);
  arm(1,p.armR);
  R(x0,top,w,h,'k');R(x0+1,top+1,w-2,h-2,'b');
  if(view==='front'){R(x0+1,top+1,1,h-2,'s');}
  if(view==='3q'){R(x0+1,top+1,1,h-2,'s');R(x0+w-3,top+1,2,h-2,'d');R(x0+w-3,top+1,1,h-2,'d');}
  if(view==='side'){R(x0+1,top+1,1,h-2,'s');R(x0+w-3,top+1,2,h-2,'d');}
  let cx0=x0-2+ln,cw=w+4;if(view==='3q'){cx0=x0-2+ln;cw=w+3}if(view==='side'){cx0=x0-2+ln;cw=w+3}
  R(cx0,top-3,cw,3,'k');
  const cap=p.cap,ck=p.capk||0,cw2=cw-2;
  const cc={plain:'v',fill:'v',dots:'n',amber:'a',mint:'t',blink:'v',off:'g',listen:'n'}[cap]||'v';
  R(cx0+1,top-2,cw2,1,cc);
  if(cap==='fill')R(cx0+1,top-2,Math.max(1,Math.round(cw2*ck)),1,'s');
  if(cap==='dots')for(let i=0;i<cw2;i++)if((i+Math.round(ck))%3===0)R(cx0+1+i,top-2,1,1,'s');
  if(cap==='listen')for(let i=0;i<cw2;i++)if(((i*7+Math.round(ck)*3)%5)<2)R(cx0+1+i,top-2,1,1,'w');
  if(cap==='blink'&&Math.round(ck)%2===0)R(cx0+1,top-2,1,1,'w');
  // eyes
  let e1,e2;if(view==='front'){e1=x0+2;e2=x0+w-3}else if(view==='3q'){e1=x0+2;e2=x0+4}else{e1=x0+1;e2=null}
  const lk=(p.look||0)+ln,ey=top+2+(p.lookY||0);
  const [ta,tb]=(p.eye||'open').split('|');
  const E=(e,t,side)=>{if(e==null)return;e+=lk;
    if(t==='none')return;
    if(t==='open')R(e,ey,1,3,'w');
    else if(t==='half')R(e,ey+1,1,2,'w');
    else if(t==='wide')R(e,ey-1,1,4,'w');
    else if(t==='closed')R(side<0?e-1:e,ey+2,2,1,'w');
    else if(t==='happy'){if(side<0){R(e-1,ey+1,1,1,'w');R(e,ey,1,1,'w');}else{R(e,ey,1,1,'w');R(e+1,ey+1,1,1,'w');}}
    else if(t==='concern'){R(e,ey+1,1,2,'w');R(e-side,ey-1,1,1,'p');}
  };
  E(e1,ta,-1);E(e2,tb||ta,1);
  const mx=view==='front'?x0+3+lk:x0+2+lk,my=top+6+(p.lookY||0);
  if(p.mouth==='smile'){R(mx,my,2,1,'w');R(mx-1,my-1,1,1,'w');R(mx+2,my-1,1,1,'w');}
  else if(p.mouth==='flat'||p.mouth==='small')R(mx,my,2,1,'w');
  else if(p.mouth==='o')R(mx,my,2,2,'w');
  // overlays (grid)
  const o=p.ov,k=Math.round(p.ovk||0);
  if(o==='dots')for(let i=0;i<3;i++)R(11+i*2,1-(i===k%3?1:0),1,1,i===k%3?'b':'s');
  if(o==='zz'){R(12,0,3,1,'v');R(13,1,1,1,'v');R(12,2,3,1,'v');R(15,3,2,1,'l');R(15,4,1,1,'l');R(15,5,2,1,'l');}
  if(o==='spark'){R(14,2,1,3,'b');R(13,3,3,1,'b');R(1,4,1,1,'v');R(0,5,3,1,'v');R(1,6,1,1,'v');}
  if(o==='bang'){R(14,0,2,3,'a');R(14,4,2,1,'a');}
  if(o==='ping'){R(14,0,1,3,'b');R(13,1,3,1,'b');R(12,3,1,1,'s');R(16,3,1,1,'s');}
  if(o==='listen'){R(1,7,1,3,'s');R(2,6,1,1,'s');R(2,10,1,1,'s');R(-1,6,1,5,'p');}
  const sw=p.dy<0?Math.max(2,w-2+p.dy):w-2;
  sh=`<rect x="${ox+(8-sw/2)*g}" y="${oy+16*g}" width="${sw*g}" height="${g}" fill="${C.h}"/>`;
  return sh+`<g transform="translate(0 ${q((p.dy||0)*g)})">${s}</g>`;
}
/* ---------- pixel grid statics ---------- */
function grid(rows,mirror){
  const g=5,ox=10,oy=10;let s='';
  rows.forEach((r,y)=>{const full=mirror?r+r.split('').reverse().join(''):r;for(let x=0;x<full.length;x++){const ch=full[x];if(ch!=='.'&&ch!==' ')s+=`<rect x="${ox+x*g}" y="${oy+y*g}" width="${g+.04}" height="${g+.04}" fill="${C[ch]}"/>`;}});
  return s;
}
const pshadow=(x,w)=>`<rect x="${10+x*5}" y="90" width="${w*5}" height="5" fill="${C.h}"/>`;
const NODLE=["........","........",".vv.....","..vv....","....kkkk","vv.kwwww","vvvkwwww","...kwkww","...kwkww","vv.kwwww","vvvkmwww","...kwwwk","....kwww",".....kgw","....kwww","....kk.k"];
const LEDGER=["................","............k.k.","............k.k.","...kkkkkkk..k.k.",".kkkkkkkkkk.k.k.",".kwwwwwwwGk.k.k.",".kwbbbbbwwkkkkk.",".kwwwwwwwwkssssk",".kwbbbbwwwkskssk",".kwwwwwwwwkssssk",".kwbbbwwwwksskk.",".kwwwwwwwwkssk..",".kkkkkkkkkksssk.","kssssssssssssssk","kkkkkkkkkkkkkkk.","................"];
const LUMO=["..k.....","...k....","....k...",".....kkk",".kkk.kww","kbbbbkkw","kbsbbkww","kbsbbbkd","kbbsbbkd",".kbbbbkd","..kkkkkd",".kvvvvkd",".kvlvvkd","..kvvkkd","......kk","........"];
const SPROUT=["........",".kkk....","kttkk...","kttttk..",".kkttkk.","......kt","......kt","..kkkkkk","..kddddd","..kkkkkk","...kbbbb","...kbwbb","...kbwbb","...kbbbw","....kbbb","....kkkk"];
/* ---------- vector statics ---------- */
const S={
C02:()=>pshadow(4,8)+grid(NODLE,1),
C03:()=>pshadow(1,14)+grid(LEDGER,0),
C04:()=>grid(LUMO,1)+`<rect x="40" y="92" width="20" height="4" fill="${C.h}"/>`,
C05:()=>pshadow(4,8)+grid(SPROUT,1),
C06:()=>shadow(26)+`<rect x="29" y="76" width="11" height="10" rx="3" fill="${K}"/><rect x="60" y="76" width="11" height="10" rx="3" fill="${K}"/><path d="M50 14 L86 80 L14 80 Z" fill="${C.b}"/><path d="M50 14 L86 80 L50 80 Z" fill="${C.s}"/><path d="M50 14 L86 80 L14 80 Z" fill="none" ${st()}/><path d="M50 17 L50 46" stroke="${K}" stroke-width="1.4" opacity=".35"/><circle cx="50" cy="59" r="11" fill="#fff" ${st()}/><circle cx="51.5" cy="60" r="5.5" fill="${K}"/><circle cx="49.5" cy="57.5" r="2" fill="#fff"/>`,
C08:()=>shadow(16,.08)+`<g transform="rotate(-16 50 52)"><ellipse cx="50" cy="52" rx="37" ry="11" fill="none" stroke="${K}" stroke-width="7"/><ellipse cx="50" cy="52" rx="37" ry="11" fill="none" stroke="${C.l}" stroke-width="3.2"/></g><circle cx="50" cy="50" r="20" fill="${C.b}" ${st()}/><ellipse cx="43" cy="41" rx="6" ry="3.5" fill="#fff" opacity=".35"/>${eyes(50,50,7,4.6,'open',0,0,'#fff')}<g transform="rotate(-16 50 52)"><path d="M13 52 A37 11 0 0 0 87 52" fill="none" stroke="${K}" stroke-width="7"/><path d="M13 52 A37 11 0 0 0 87 52" fill="none" stroke="${C.l}" stroke-width="3.2"/></g><circle cx="82" cy="48.5" r="5.5" fill="${C.v}" ${st()}/>`,
C09:()=>shadow(32)+`<rect x="16" y="67" width="68" height="17" rx="8.5" fill="${C.d}" ${st()}/><rect x="21" y="51" width="58" height="18" rx="9" fill="${C.b}" ${st()}/><circle cx="31" cy="60" r="2" fill="${C.s}"/><circle cx="38" cy="60" r="2" fill="${C.s}"/><rect x="28" y="27" width="48" height="26" rx="11" fill="#fff" ${st()}/>${eyes(52,39,8,4.2,'open')}${mouth(52,46,3.2,'small')}`,
C11:()=>shadow(22)+`<rect x="32" y="58" width="36" height="27" rx="6" fill="${C.b}" ${st()}/><rect x="36" y="66" width="28" height="3" rx="1.5" fill="${C.d}"/><rect x="36" y="74" width="28" height="3" rx="1.5" fill="${C.d}"/><path d="M45 18 A5 5 0 0 1 55 18" fill="none" ${st()}/><rect x="41" y="17" width="18" height="7" rx="3.5" fill="${C.v}" ${st()}/><path d="M32 54 L32 41 A18 18 0 0 1 68 41 L68 54 Z" fill="${C.p}" ${st()}/><path d="M37 37 Q39 30 45 27" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>${eyes(50,43,7,4.2,'open')}<rect x="27" y="52" width="46" height="8" rx="4" fill="${C.d}" ${st()}/>`,
C12:()=>shadow(30)+`<circle cx="33" cy="80" r="8.5" fill="${K}"/><circle cx="67" cy="80" r="8.5" fill="${K}"/><circle cx="33" cy="80" r="3" fill="${C.g}"/><circle cx="67" cy="80" r="3" fill="${C.g}"/><rect x="47" y="34" width="6" height="22" fill="${C.g}" ${st()}/><rect x="21" y="52" width="58" height="27" rx="7" fill="${C.b}" ${st()}/><rect x="27" y="58" width="20" height="4" rx="2" fill="${C.s}"/><rect x="36" y="22" width="28" height="12" rx="4" fill="${C.v}" ${st()}/><circle cx="41" cy="24" r="9" fill="#fff" ${st()}/><circle cx="59" cy="24" r="9" fill="#fff" ${st()}/><circle cx="42.5" cy="25" r="4" fill="${K}"/><circle cx="60.5" cy="25" r="4" fill="${K}"/><circle cx="41.3" cy="23.2" r="1.4" fill="#fff"/><circle cx="59.3" cy="23.2" r="1.4" fill="#fff"/>`,
C13:()=>shadow(14,.07)+`<path d="M32 42 L18 29 M68 42 L82 29" ${st()}/><ellipse cx="18" cy="28" rx="15" ry="3.4" fill="${C.l}" ${st()}/><ellipse cx="82" cy="28" rx="15" ry="3.4" fill="${C.l}" ${st()}/><circle cx="18" cy="28" r="2.2" fill="${K}"/><circle cx="82" cy="28" r="2.2" fill="${K}"/><path d="M50 52 L50 57" ${st()}/><ellipse cx="50" cy="44" rx="30" ry="11" fill="${C.G}" ${st()}/><rect x="36" y="42" width="28" height="3.4" rx="1.7" fill="${C.b}"/><circle cx="50" cy="68" r="13" fill="${C.b}" ${st()}/>${eyes(50,67,5.5,3.8,'open',0,0,'#fff')}`,
C14:()=>shadow(28)+`<path d="M22 84 L22 48 A28 28 0 0 1 78 48 L78 84 L60 84 L60 48 A10 10 0 0 0 40 48 L40 84 Z" fill="${C.b}" ${st()}/><rect x="22" y="71" width="18" height="13" fill="#fff" ${st()}/><rect x="60" y="71" width="18" height="13" fill="#fff" ${st()}/><path d="M27 47 A23 23 0 0 1 42 26" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" opacity=".4"/>${eyes(50,31,9.5,4,'open',0,0,'#fff')}${mouth(50,36,2.6,'small','#fff')}`,
C17:()=>shadow(14,.07)+[32,43,57,68].map((x,i)=>`<path d="M${x} 56 q${i%2?4:-4} 8 0 14 t0 14" fill="none" stroke="${K}" stroke-width="6.5" stroke-linecap="round"/><path d="M${x} 56 q${i%2?4:-4} 8 0 14 t0 14" fill="none" stroke="${C.v}" stroke-width="3" stroke-linecap="round"/>`).join('')+`<path d="M18 54 C18 28 32 18 50 18 C68 18 82 28 82 54 Q76 61 69 55 Q62 61 56 55 Q50 61 44 55 Q38 61 31 55 Q24 61 18 54 Z" fill="${C.l}" ${st()}/><ellipse cx="36" cy="31" rx="7" ry="3.6" fill="#fff" opacity=".55" transform="rotate(-25 36 31)"/>${blush(50,45,14)}${eyes(50,40,9,4.2,'open')}${mouth(50,47,3,'small')}`,
C18:()=>{const cs=[[32,55,14],[47,42,18],[66,47,15],[42,63,11],[60,63,12]];return shadow(20,.07)+[[40,80],[52,85],[64,79]].map(([x,y])=>`<path d="M${x} ${y-4} Q${x+3} ${y+1} ${x} ${y+2} Q${x-3} ${y+1} ${x} ${y-4} Z" fill="${C.b}"/>`).join('')+cs.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${K}" stroke="${K}" stroke-width="${SW*2}"/>`).join('')+cs.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`).join('')+`<ellipse cx="44" cy="34" rx="6" ry="3" fill="${C.p}"/>${blush(50,58,12)}${eyes(50,53,8,4.2,'open')}${mouth(50,60,3,'small')}`;},
C19:()=>shadow(30)+`<ellipse cx="38" cy="84" rx="6.5" ry="3.6" fill="${K}"/><ellipse cx="62" cy="84" rx="6.5" ry="3.6" fill="${K}"/><ellipse cx="20" cy="67" rx="4.5" ry="5.5" fill="#fff" ${st()}/><ellipse cx="80" cy="67" rx="4.5" ry="5.5" fill="#fff" ${st()}/><path d="M50 31 q-2 -9 7 -11" fill="none" ${st()}/><path d="M20 66 C20 41 34 31 50 31 C66 31 80 41 80 66 C80 80 68 85 50 85 C32 85 20 80 20 66 Z" fill="#fff" ${st()}/><path d="M23.5 51 C28 37 38 31 50 31 C62 31 72 37 76.5 51 C66 46 34 46 23.5 51 Z" fill="${C.b}" ${st()}/>${blush(50,67,15)}${eyes(50,61,13,3.4,'open')}${mouth(50,66,3,'small')}`,
C20:()=>shadow(12,.06)+`<path d="M50 80 Q40 88 52 92 T70 96" fill="none" ${st()}/><path d="M46 86 l-5 -3 l1 6 Z" fill="${C.l}" ${st(SW*.7)}/><path d="M60 94 l-3 -5 l-3 5 Z" fill="${C.l}" ${st(SW*.7)}/><path d="M50 12 L80 46 L50 80 L20 46 Z" fill="${C.b}"/><path d="M50 12 L80 46 L50 46 Z" fill="${C.s}"/><path d="M50 15 L50 77 M23 46 L77 46" stroke="${K}" stroke-width="1.4" opacity=".25"/><path d="M50 12 L80 46 L50 80 L20 46 Z" fill="none" ${st()}/>${eyes(50,48,8,4.2,'open',0,0,'#fff')}${mouth(50,57,3,'small','#fff')}`
};
/* ---------- states ---------- */
const L4=(a,b,c,d)=>[a||{},b||{},c||{},d||{}];
const KD={dy:0,tilt:0,sx:1,sy:1,yaw:0,rot:0,spread:1,cr:19,lobes:L4(),eye:'open',lx:0,ly:0,mouth:'small',blush:1,ov:null,ovk:0,guides:0};
KD.lobes=KD.lobes.map(()=>({a:0,d:0,l:1}));
const kdrop=L4({a:-18,d:-2},{a:18,d:-2});
const ktuck=L4({d:-3},{d:-3},{d:-3},{d:-3});
const ktap=L4({d:-3},{d:-3},{a:-24,d:-1},{d:-3});
const KS={
idle:[{d:1000,h:200},{d:1000,dy:-2,spread:1.03},{d:600,h:300,dy:-1},{d:110,eye:'closed'}],
thinking:[{d:600,h:200,lx:.7,ly:-.9,mouth:'none',tilt:-3,ov:'dots',ovk:0},{d:600,h:200,rot:12,lx:.7,ly:-.9,mouth:'none',tilt:-5,ov:'dots',ovk:1},{d:600,h:200,rot:24,lx:.5,ly:-1,mouth:'none',tilt:-5,ov:'dots',ovk:2},{d:600,h:200,rot:12,lx:.7,ly:-.9,mouth:'none',tilt:-3,ov:'dots',ovk:0}],
listening:[{d:300,h:100,lobes:L4({a:18,d:3,l:1.1},{a:-18,d:3,l:1.1}),eye:'wide',tilt:6,dy:-1,mouth:'o'},{d:300,h:500,lobes:L4({a:26,d:5,l:1.2},{a:-26,d:5,l:1.2}),eye:'wide',tilt:7,dy:-2,mouth:'o',ov:'listen'},{d:200,lobes:L4({a:26,d:5,l:1.2},{a:-34,d:7,l:1.25}),eye:'wide',tilt:8,dy:-2,mouth:'o',ov:'listen'},{d:400,h:300,lobes:L4({a:20,d:4,l:1.15},{a:-20,d:4,l:1.15}),tilt:6,dy:-1,mouth:'o'}],
helping:[{d:240,lobes:L4({},{a:10,d:-3}),tilt:-4,lx:-.3},{d:300,lobes:L4({},{a:40,d:12,l:1.4}),tilt:6,lx:1,mouth:'smile'},{d:200,h:700,lobes:L4({},{a:42,d:15,l:1.5}),tilt:7,lx:1,mouth:'smile'},{d:240,h:200,lobes:L4({},{a:42,d:10,l:1.4}),tilt:6,lx:1,mouth:'smile'}],
working:Object.assign([{d:380,rot:0,eye:'focus',ly:.8,mouth:'none'},{d:380,rot:45,eye:'focus',ly:.8,mouth:'none',dy:-1},{d:380,rot:90,eye:'focus',ly:.8,mouth:'none'},{d:380,rot:135,eye:'focus',ly:.8,mouth:'none',dy:-1}],{spin:{rot:180},lin:1}),
success:[{d:140,h:100,sy:.9,sx:1.08,dy:2,spread:.9,eye:'happy',mouth:'smile'},{d:180,dy:-12,sy:1.06,sx:.96,spread:1.18,eye:'happy',mouth:'grin'},{d:260,h:120,dy:-11,spread:1.22,rot:8,eye:'happy',mouth:'grin',ov:'spark'},{d:320,h:900,eye:'happy',mouth:'smile'}],
error:[{d:400,h:200,lx:-.5,ly:.6},{d:300,h:300,eye:'concern',mouth:'flat',dy:2,lobes:kdrop,ov:'bang'},{d:220,eye:'concern',mouth:'flat',dy:2,tilt:-4,lobes:kdrop,ov:'bang'},{d:220,h:600,eye:'concern',mouth:'flat',dy:2,tilt:3,lobes:kdrop,ov:'bang'}],
waiting:[{d:400,h:300,lobes:ktuck,lx:-.6,ly:-.4,mouth:'flat',ov:'clock',ovk:0},{d:160,lobes:ktap,lx:-.6,ly:-.4,mouth:'flat',ov:'clock',ovk:1},{d:160,lobes:ktuck,lx:-.6,ly:-.4,mouth:'flat',ov:'clock',ovk:2},{d:160,h:600,lobes:ktap,eye:'half',lx:-.6,ly:-.4,mouth:'flat',ov:'clock',ovk:3}],
attention:[{d:400,h:900},{d:160,dy:-5,sy:1.04,eye:'wide',lobes:L4({},{a:-30,d:6,l:1.25})},{d:240,h:500,dy:-3,eye:'wide',mouth:'smile',lobes:L4({},{a:-38,d:8,l:1.3}),ov:'ping'},{d:300}],
sleep:[{d:600,h:300,eye:'half',mouth:'none',dy:1},{d:700,h:200,eye:'closed',mouth:'none',dy:3,spread:.85,cr:17},{d:700,h:600,eye:'closed',mouth:'none',dy:4,spread:.82,cr:17,ov:'zz'},{d:500,h:900,eye:'none',mouth:'none',dy:4,spread:.62,cr:9,blush:0}]
};
const CD={dy:0,shape:'n',eye:'open',look:0,lookY:0,mouth:'none',armL:'rest',armR:'rest',legs:'stand',cap:'plain',capk:0,ov:null,ovk:0,lean:0,form:'body',view:'front'};
const CS={
idle:[{d:800},{d:800,shape:'breath'},{d:800},{d:140,eye:'closed'}],
thinking:[{d:320,lookY:-1,look:1,armR:'chin',cap:'dots',capk:0,ov:'dots',ovk:0},{d:320,lookY:-1,look:1,armR:'chin',cap:'dots',capk:1,ov:'dots',ovk:1},{d:320,lookY:-1,look:1,armR:'chin',cap:'dots',capk:2,ov:'dots',ovk:2,eye:'open|half'},{d:320,lookY:-1,look:1,armR:'chin',cap:'dots',capk:0,ov:'dots',ovk:0,eye:'open|half'}],
listening:[{d:400,eye:'wide',armL:'up',cap:'listen',capk:0,lean:-1},{d:300,eye:'wide',armL:'up',cap:'listen',capk:1,lean:-1,ov:'listen'},{d:300,eye:'wide',armL:'up',cap:'listen',capk:2,lean:-1,ov:'listen'},{d:300,eye:'wide',armL:'up',cap:'listen',capk:3,lean:-1,mouth:'o'}],
helping:[{d:250,lean:-1},{d:200,armR:'point',look:1,lean:1},{d:700,armR:'point2',look:1,lean:1,mouth:'small'},{d:300,armR:'point',look:1,lean:1,mouth:'small'}],
working:[{d:150,legs:'stepA',armL:'type',cap:'fill',capk:.2,eye:'half',lookY:1},{d:150,armR:'type',cap:'fill',capk:.45,eye:'half',lookY:1},{d:150,legs:'stepB',armL:'type',cap:'fill',capk:.7,eye:'half',lookY:1},{d:150,armR:'type',cap:'fill',capk:.95,eye:'half',lookY:1}],
success:[{d:110,shape:'squash',legs:'spread',eye:'happy'},{d:120,shape:'stretch',dy:-3,legs:'tuck',eye:'happy',cap:'mint',armL:'up',armR:'up'},{d:260,dy:-4,legs:'tuck',eye:'happy',cap:'mint',mouth:'smile',ov:'spark',armL:'up',armR:'up'},{d:500,eye:'happy',mouth:'smile',cap:'mint'}],
error:[{d:500,look:-1,lookY:1,cap:'amber'},{d:500,eye:'concern',cap:'amber',armR:'down',armL:'down'},{d:300,eye:'concern',cap:'amber',lean:-1,mouth:'flat',ov:'bang',armR:'down',armL:'down'},{d:900,eye:'concern',cap:'amber',mouth:'flat',ov:'bang',armR:'down',armL:'down'}],
waiting:[{d:500,cap:'blink',capk:0,look:-1},{d:500,cap:'blink',capk:1,look:-1},{d:400,legs:'stepA',cap:'blink',capk:0,look:-1},{d:400,cap:'blink',capk:1,eye:'half',look:-1}],
attention:[{d:900},{d:120,dy:-1,legs:'tuck',eye:'wide',armR:'up'},{d:500,eye:'wide',armR:'up',ov:'ping'},{d:400,armR:'wave',eye:'open',mouth:'small'}],
sleep:[{d:600,eye:'half'},{d:600,eye:'closed',shape:'squash',legs:'none',dy:2,cap:'off'},{d:800,eye:'closed',shape:'squash',legs:'none',dy:2,cap:'off',ov:'zz'},{d:1000,form:'cursor',cap:'off'}]
};
const QT=()=>({x:0,y:0,r:0,s:1,fx:1,c:null});
const QD={dy:0,tilt:0,sx:1,sy:1,yaw:0,t:[QT(),QT(),QT(),QT()],eye:'open',lx:0,ly:0,feet:1,ov:null,ovk:0};
const qerr=L4({},{},{},{y:6,x:2,r:12,c:'a'});
const QW=[{x:4,y:20,s:.75},{x:-4,y:20,s:.75},{x:-18,y:-11,s:.75},{x:18,y:-11,s:.75}];
const qw=i=>QW.map((o,j)=>j===i?{...o,y:o.y-5}:o);
const qs=(a,b)=>[{x:a,y:a+b,s:.92-0},{x:-a,y:a+b,s:.92},{x:a,y:b-a*.3,s:.92},{x:-a,y:b-a*.3,s:.92}];
const QS={
idle:[{d:900},{d:900,t:L4({y:-1.5},{y:-1.5})},{d:700},{d:110,eye:'closed'}],
thinking:[{d:300,h:200,lx:.6,ly:-.8},{d:400,h:400,lx:.6,ly:-.8,t:L4({},{r:45,y:-7,x:3,s:.9})},{d:400,h:400,lx:.6,ly:-.8,t:L4({},{r:90,y:-7,x:3,s:.9})},{d:300,lx:.6,ly:-.8,t:L4({},{r:90})}],
listening:[{d:250,t:L4({y:-4,r:-6},{y:-4,r:6}),eye:'wide'},{d:250,h:600,t:L4({y:-7,r:-10,x:-2},{y:-7,r:10,x:2}),eye:'wide',ov:'listen'},{d:200,t:L4({y:-7,r:-10,x:-2},{y:-9,r:14,x:3}),eye:'wide',lx:.4,ov:'listen'},{d:300,h:300,t:L4({y:-5,r:-7},{y:-5,r:7})}],
helping:[{d:220,t:L4({},{},{},{x:-3,y:2}),lx:-.2},{d:260,t:L4({x:2},{x:2},{},{x:20,y:-12,r:-10,s:.8}),lx:1},{d:200,h:700,t:L4({x:3},{x:3},{},{x:24,y:-15,r:-14,s:.8}),lx:1},{d:200,h:200,t:L4({x:2},{x:2},{},{x:21,y:-13,r:-10,s:.8}),lx:1}],
working:[{d:280,eye:'focus',ly:.8},{d:280,eye:'focus',ly:.8,t:L4({y:-1},{y:-1},{x:15,y:9,s:.9},{x:-15,y:-9,s:.9})},{d:280,eye:'focus',ly:.8,t:L4({},{},{x:30},{x:-30})},{d:280,eye:'focus',ly:.8,t:L4({y:-1},{y:-1},{x:15,y:-9,s:.9},{x:-15,y:9,s:.9})}],
success:[{d:120,h:80,t:L4({y:3},{y:3},{y:1},{y:1}),eye:'happy'},{d:180,dy:-10,t:L4({x:-5,y:-5,r:-8},{x:5,y:-5,r:8},{x:-5,y:4,r:8},{x:5,y:4,r:-8}),eye:'happy'},{d:240,h:150,dy:-11,t:L4({x:-6,y:-6,r:-10},{x:6,y:-6,r:10},{x:-6,y:5,r:10},{x:6,y:5,r:-10}),eye:'happy',ov:'spark'},{d:300,h:900,eye:'happy'}],
error:[{d:300,h:200,lx:.5,ly:.8},{d:300,h:400,t:qerr,eye:'concern',lx:.6,ly:.8,ov:'bang'},{d:200,t:qerr,eye:'concern',lx:.6,ly:.8,tilt:-2,ov:'bang'},{d:200,h:700,t:qerr,eye:'concern',tilt:2,ov:'bang'}],
waiting:[{d:380,h:200,t:qw(2),feet:0,ov:'clock',ovk:0},{d:380,h:200,t:qw(0),feet:0,ov:'clock',ovk:1},{d:380,h:200,t:qw(1),feet:0,ov:'clock',ovk:2},{d:380,h:200,t:qw(3),feet:0,eye:'half',ov:'clock',ovk:3}],
attention:[{d:300,h:900},{d:160,t:L4({},{fx:.05,y:-4}),eye:'wide'},{d:160,t:L4({},{fx:1,y:-5}),eye:'wide',ov:'ping'},{d:300,h:400}],
sleep:[{d:500,h:300,eye:'half'},{d:600,eye:'closed',t:qs(6,2)},{d:600,h:500,eye:'closed',t:qs(12,6),ov:'zz'},{d:500,h:900,eye:'none',t:[{x:15,y:22,s:.6},{x:-15,y:22,s:.6},{x:15,y:-8,s:.6},{x:-15,y:-8,s:.6}]}]
};
const PD={dy:0,tilt:0,sx:1,sy:1,yaw:0,open:16,oL:0,oR:0,eye:'open',lx:0,ly:0,mouth:'none',ring:0,ringOn:0,core:'p',ov:null,ovk:0};
const pk=o=>Object.assign({ov:'clock'},o);
const PS={
idle:[{d:1000,h:200,open:15},{d:1000,open:19,dy:-1.5},{d:600,h:300,open:17},{d:110,eye:'closed',open:16}],
thinking:[{d:400,h:200,open:10,lx:.6,ly:-.9,tilt:-5,ov:'dots',ovk:0},{d:400,h:200,open:9,oR:4,lx:.6,ly:-.9,tilt:-6,ov:'dots',ovk:1},{d:400,h:200,open:10,lx:.3,ly:-1,tilt:-6,ov:'dots',ovk:2},{d:400,h:200,open:9,lx:.6,ly:-.9,tilt:-5,ov:'dots',ovk:0}],
listening:[{d:260,open:28,eye:'wide',tilt:5,dy:-1,mouth:'o'},{d:300,h:600,open:36,eye:'wide',tilt:7,dy:-2,mouth:'o',ov:'listen'},{d:220,open:34,oL:4,eye:'wide',tilt:7,dy:-2,lx:-.3,mouth:'o',ov:'listen'},{d:300,h:300,open:30,tilt:5,dy:-1,mouth:'o'}],
helping:[{d:220,open:12,oR:-6,tilt:-4},{d:260,open:18,oR:48,tilt:7,lx:1,mouth:'small'},{d:200,h:700,open:18,oR:58,tilt:8,lx:1,mouth:'small'},{d:220,h:200,open:18,oR:50,tilt:7,lx:1,mouth:'small'}],
working:Object.assign([{d:320,open:20,eye:'focus',ly:.8,ring:0,ringOn:1},{d:320,open:24,eye:'focus',ly:.8,ring:90,ringOn:1},{d:320,open:20,eye:'focus',ly:.8,ring:180,ringOn:1},{d:320,open:24,eye:'focus',ly:.8,ring:270,ringOn:1}],{spin:{ring:360},lin:1}),
success:[{d:130,h:80,open:3,sy:.9,sx:1.06,dy:2},{d:170,open:44,dy:-11,sy:1.06,sx:.96,eye:'happy',mouth:'smile'},{d:240,h:150,open:48,dy:-12,eye:'happy',mouth:'smile',ov:'spark'},{d:320,h:900,open:26,eye:'happy',mouth:'smile'}],
error:[{d:300,h:200,open:14,lx:-.4,ly:.6},{d:300,h:400,open:10,eye:'concern',core:'a',ov:'bang',mouth:'flat'},{d:200,open:9,eye:'concern',core:'a',tilt:-3,ov:'bang',mouth:'flat'},{d:200,h:600,open:9,eye:'concern',core:'a',tilt:3,ov:'bang',mouth:'flat'}],
waiting:[pk({d:300,h:500,open:9,lx:-1,ovk:0}),pk({d:300,h:500,open:9,lx:1,ovk:1}),pk({d:200,h:200,open:9,ovk:2}),pk({d:200,h:500,open:8,eye:'half',ovk:3})],
attention:[{d:300,h:900,open:14},{d:150,open:32,dy:-4,eye:'wide'},{d:250,h:500,open:30,dy:-3,eye:'wide',ov:'ping',mouth:'small'},{d:300,open:16}],
sleep:[{d:600,h:300,open:10,eye:'half'},{d:700,open:5,eye:'closed',dy:2},{d:600,h:500,open:2,eye:'closed',dy:3,ov:'zz'},{d:500,h:900,open:0,eye:'closed',dy:3,sx:.92,sy:.92}]
};
const WD={dy:0,tilt:0,sx:1,sy:1,yaw:0,r:20,tx:0,ty:0,hL:{x:24,y:66},hR:{x:76,y:66},eye:'open',lx:0,ly:0,mouth:'small',hue:'blue',ov:null,ovk:0};
const wc=o=>Object.assign({ov:'clock',hL:{x:43,y:82},hR:{x:57,y:82},lx:-.5,ly:-.4,mouth:'flat'},o);
const WS={
idle:[{d:900,h:100},{d:900,dy:-2,tx:-3,ty:-1,hL:{x:24,y:63},hR:{x:76,y:63}},{d:700,h:200,tx:2},{d:110,eye:'closed'}],
thinking:[{d:500,h:200,lx:.6,ly:-.9,mouth:'none',hR:{x:66,y:72},tx:4,ov:'dots',ovk:0},{d:500,h:200,lx:.6,ly:-.9,mouth:'none',hR:{x:65,y:71},tx:7,ty:-2,ov:'dots',ovk:1},{d:500,h:200,lx:.5,ly:-1,mouth:'none',hR:{x:66,y:72},tx:3,ov:'dots',ovk:2},{d:500,h:200,lx:.6,ly:-.9,mouth:'none',hR:{x:65,y:71},tx:6,ov:'dots',ovk:0}],
listening:[{d:260,eye:'wide',tilt:5,hL:{x:23,y:54},tx:-4,mouth:'o'},{d:300,h:600,eye:'wide',tilt:7,hL:{x:22,y:49},tx:-7,ty:-1,mouth:'o',ov:'listen'},{d:200,eye:'wide',tilt:7,hL:{x:23,y:51},tx:-5,mouth:'o',ov:'listen'},{d:300,h:300,tilt:5,hL:{x:24,y:56},mouth:'o'}],
helping:[{d:200,hR:{x:70,y:70},tilt:-3},{d:260,hR:{x:92,y:52},lx:1,tilt:6,tx:6,mouth:'smile'},{d:200,h:700,hR:{x:95,y:49},lx:1,tilt:7,tx:8,mouth:'smile'},{d:200,h:200,hR:{x:91,y:53},lx:1,tilt:6,tx:7,mouth:'smile'}],
working:[{d:200,hL:{x:28,y:62},hR:{x:72,y:72},tx:-2,eye:'focus',ly:.8,mouth:'none'},{d:200,hL:{x:28,y:72},hR:{x:72,y:62},tx:3,ty:-2,eye:'focus',ly:.8,mouth:'none'},{d:200,hL:{x:28,y:62},hR:{x:72,y:72},tx:-3,eye:'focus',ly:.8,mouth:'none'},{d:200,hL:{x:28,y:72},hR:{x:72,y:62},tx:2,ty:-3,eye:'focus',ly:.8,mouth:'none'}],
success:[{d:130,h:80,sy:.9,sx:1.08,dy:2,ty:6,eye:'happy',hL:{x:28,y:72},hR:{x:72,y:72}},{d:180,dy:-11,sy:1.08,sx:.95,ty:-6,eye:'happy',mouth:'grin',hL:{x:18,y:46},hR:{x:82,y:46}},{d:240,h:150,dy:-12,ty:-8,eye:'happy',mouth:'grin',hL:{x:16,y:42},hR:{x:84,y:42},ov:'spark'},{d:320,h:900,eye:'happy',mouth:'smile'}],
error:[{d:300,h:200,lx:-.4,ly:.6},{d:300,h:400,eye:'concern',mouth:'flat',hue:'amber',ty:8,tx:-3,dy:2,hL:{x:30,y:74},hR:{x:70,y:74},ov:'bang'},{d:200,eye:'concern',mouth:'flat',hue:'amber',ty:8,tx:-4,dy:2,tilt:-3,hL:{x:30,y:74},hR:{x:70,y:74},ov:'bang'},{d:200,h:600,eye:'concern',mouth:'flat',hue:'amber',ty:8,tx:-2,dy:2,tilt:3,hL:{x:30,y:74},hR:{x:70,y:74},ov:'bang'}],
waiting:[wc({d:300,h:500,ovk:0}),wc({d:200,h:300,hR:{x:59,y:77},ovk:1}),wc({d:200,h:200,ovk:2}),wc({d:200,h:500,eye:'half',ovk:3})],
attention:[{d:300,h:900},{d:160,dy:-5,eye:'wide',ty:-6,hR:{x:80,y:42}},{d:240,h:500,dy:-3,eye:'wide',mouth:'smile',ty:-6,hR:{x:82,y:36},ov:'ping'},{d:300}],
sleep:[{d:600,h:300,eye:'half',mouth:'none',ty:6},{d:700,eye:'closed',mouth:'none',r:17,ty:16,dy:3,hL:{x:32,y:77},hR:{x:68,y:77},hue:'dim'},{d:700,h:500,eye:'closed',mouth:'none',r:16,ty:20,dy:4,hue:'dim',hL:{x:34,y:79},hR:{x:66,y:79},ov:'zz'},{d:500,h:900,eye:'none',mouth:'none',r:11,ty:34,dy:6,hue:'dim',hL:{x:45,y:80},hR:{x:55,y:80}}]
};
const REG={
C01:{draw:caret,D:CD,states:CS,pixel:1},
C07:{draw:p=>shadow(30,.12,p.dy)+quad(p),D:QD,states:QS,yaw3q:35,yawSide:80},
C10:{draw:p=>shadow(24,.1,p.dy-6)+knot(p),D:KD,states:KS,yaw3q:35,yawSide:75},
C15:{draw:p=>shadow(20,.1,p.dy-4)+pod(p),D:PD,states:PS,yaw3q:40,yawSide:85},
C16:{draw:p=>shadow(20,.1,p.dy-6)+wisp(p),D:WD,states:WS,yaw3q:40,yawSide:80}
};
for(const k in S)REG[k]={draw:S[k],D:{},pixel:['C02','C03','C04','C05'].includes(k)};
/* ---------- engine ---------- */
function merge(a,b){if(Array.isArray(a)){b=b||[];return a.map((v,i)=>merge(v,b[i]));}if(a&&typeof a==='object'){b=b||{};const o={};for(const k in a)o[k]=merge(a[k],b[k]);for(const k in b)if(!(k in a))o[k]=b[k];return o;}return b===undefined?a:b;}
function lerp(a,b,t){if(typeof a==='number'&&typeof b==='number')return a+(b-a)*t;if(Array.isArray(a))return a.map((v,i)=>lerp(v,b&&b[i],t));if(a&&typeof a==='object'&&b&&typeof b==='object'){const o={};for(const k in a)o[k]=lerp(a[k],b[k],t);return o;}return a;}
const EZ={tween:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,spring:t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);},lin:t=>t};
const MIN_KEYS=['eye','lx','ly','look','lookY','mouth','cap','capk','ov','ovk','blush','hue','core'];
function pick(fr){const o={};MIN_KEYS.forEach(k=>{if(k in fr)o[k]=fr[k]});if(fr.dy!=null)o.dy=Math.max(-2,Math.min(2,fr.dy*.25));return o;}
function animPose(R,name,t,motion){
  let fr=R.states[name];if(!fr)return merge(R.D,{});
  const minimal=motion==='minimal';
  const seg=fr.map(f=>(f.h||0)+(f.d||300)),tot=seg.reduce((a,b)=>a+b,0);
  let x=t%tot,i=0;while(x>=seg[i]){x-=seg[i];i++;}
  const F=j=>merge(R.D,minimal?pick(fr[j]):fr[j]);
  const a=F(i);
  const step=R.pixel?motion!=='tween':motion==='step';
  if(step)return a;
  const h=fr[i].h||0;if(x<h)return a;
  const u=(x-h)/(fr[i].d||300);
  const j=(i+1)%fr.length,b=F(j);
  if(j===0&&fr.spin&&!minimal)for(const k in fr.spin)b[k]+=fr.spin[k];
  const e=fr.lin&&!minimal?EZ.lin:(motion==='spring'?EZ.spring:EZ.tween);
  if(R.pixel){const o=merge(a,{});o.dy=a.dy+(b.dy-a.dy)*EZ.tween(u);return o;}
  return lerp(a,b,e(u));
}
const LOOP=new Set();let raf=0,last=0;
function tick(now){raf=requestAnimationFrame(tick);if(now-last<33)return;last=now;LOOP.forEach(el=>el.render(now));}
class AeChar extends HTMLElement{
  static get observedAttributes(){return['c','state','f','view','px','motion','play']}
  connectedCallback(){this.style.display='block';this.style.width='100%';this.style.height='100%';this._t0=performance.now();this.render();
    if(this.getAttribute('play')!=null&&!this._io){this._io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)LOOP.add(this);else LOOP.delete(this);});if(!raf&&LOOP.size)raf=requestAnimationFrame(tick);});this._io.observe(this);}}
  disconnectedCallback(){LOOP.delete(this);if(this._io){this._io.disconnect();this._io=null;}}
  attributeChangedCallback(n){if(n==='play'||n==='motion')this._t0=performance.now();if(this.isConnected){this.render();if(n==='play'&&!this._io)this.connectedCallback();}}
  render(now){
    const R=REG[this.getAttribute('c')];if(!R)return;
    const play=this.getAttribute('play'),view=this.getAttribute('view')||'front',motion=this.getAttribute('motion')||'';
    let pose;
    if(play&&R.states)pose=animPose(R,play,(now||performance.now())-this._t0,motion);
    else{const st=R.states&&R.states[this.getAttribute('state')||'idle'];pose=merge(R.D,st?st[+this.getAttribute('f')||0]:{});}
    if(R.pixel)pose.view=view;else if(view==='3q')pose.yaw=R.yaw3q;else if(view==='side')pose.yaw=R.yawSide;
    if(this.hasAttribute('guides'))pose.guides=1;
    const px=+this.getAttribute('px')||this.clientWidth||200;
    SW=Math.max(3,150/px);SMALL=px<34;
    const svg=`<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block;overflow:visible"${R.pixel?' shape-rendering="crispEdges"':''}>${R.draw(pose)}</svg>`;
    if(svg!==this._last){this.innerHTML=svg;this._last=svg;}
  }
}
customElements.define('ae-char',AeChar);
window.AE_REG=REG;
})();

/* ae-mark */
(()=>{
if (customElements.get('ae-mark')) return;
const NAVY='#141A3A',BLUE='#1D5BF5',RED='#D6453D',GREY='#B9BECD',DIM='#DDE1EB',LIGHT='#D6E2FF',GREEN='#1E9E62';
const TAU=Math.PI*2;
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const eio=p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
const eo=p=>1-Math.pow(1-p,3);
const ph=(t,T)=>(t%T)/T;
const seg=(p,a,b)=>cl((p-a)/(b-a));
const lerp=(a,b,k)=>a+(b-a)*k;
const wave=(t,i)=>(0.5+0.5*Math.sin(t*8+i*1.7))*(0.55+0.45*Math.sin(t*3.3+i*2.1));
const blinkK=(t,T)=>{const p=ph(t,T);return p<.07?1-Math.sin(p/.07*Math.PI)*.85:1;};

// 2a Mark — four loops from the logo, no face
function A(s,t){
  let d=6,r=7.2,sw=2.6,col=[NAVY,NAVY,NAVY,NAVY],op=[1,1,1,1],rot=0,dx=0,back='',front='',dI=[0,0,0,0];
  switch(s){
    case 'idle': d=6*(1+0.03*Math.sin(TAU*t/4)); break;
    case 'thinking': rot=t*90; d=6+0.5*Math.sin(TAU*t/1.8); break;
    case 'listening': col=col.map(()=>BLUE); dI=dI.map((_,i)=>1.7*wave(t,i)); break;
    case 'helping': {const p=ph(t,2.4);const e=p<.35?eo(p/.35):1-eio(seg(p,.6,1));dI[0]=3.4*e;col[0]=BLUE;break;}
    case 'working': {const a=Math.floor(t*2.5)%4;op=op.map((_,i)=>i===a?1:.3);col[a]=BLUE;dI[a]=.8;break;}
    case 'success': {const p=ph(t,3.2);const e=eio(seg(p,0,.3))*(1-eio(seg(p,.9,1)));d=6-1.2*e;if(e>.5)col=col.map(()=>BLUE);
      const b=eo(seg(p,.25,.45))*(1-seg(p,.88,.98)),ck=seg(p,.35,.6);
      if(b>0)front=`<g transform="translate(39 39) scale(${b})"><circle r="7" fill="${GREEN}" stroke="#fff" stroke-width="2"/><path d="M-3.2 .2L-1 2.4L3.2-2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-ck}"/></g>`;break;}
    case 'error': {const p=ph(t,2.6);col[2]=RED;if(p<.25)dx=Math.sin(p*TAU*12)*1.3*(1-p/.25);break;}
    case 'waiting': {col=col.map(()=>GREY);col[Math.floor(t/.9)%4]=NAVY;break;}
    case 'attention': {col=col.map(()=>BLUE);const p=ph(t,1.8);back=`<circle cx="24" cy="24" r="${15+8*eo(p)}" fill="none" stroke="${BLUE}" stroke-width="${2*(1-p)+.3}" opacity="${.55*(1-p)}"/>`;break;}
    case 'dismissed': {const p=ph(t,3.2);const e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));d=6*(1-e);r=7.2-4*e;if(e>.9)col=col.map(()=>GREY);break;}
  }
  const angs=[-45,45,135,225];
  const rings=angs.map((a,i)=>{const rad=a*Math.PI/180,dd=d+dI[i];return `<circle cx="${24+Math.cos(rad)*dd}" cy="${24+Math.sin(rad)*dd}" r="${r}" fill="none" stroke="${col[i]}" stroke-width="${sw}" opacity="${op[i]}"/>`;}).join('');
  return back+`<g transform="translate(${dx} 0) rotate(${rot} 24 24)">${rings}</g>`+front;
}

// 2b Lens — a status display with two indicator bars
function B(s,t){
  let bx=0,body=NAVY,ex=0,ey=0,ew=3.6,eh=8,eyes=true,inner='',outer='',bodyOp=1,gap=0;
  const dots=(y,T)=>[19,24,29].map((x,i)=>`<circle cx="${x}" cy="${y}" r="1.3" fill="${LIGHT}" opacity="${Math.floor(t/T)%3===i?1:.3}"/>`).join('');
  switch(s){
    case 'idle': eh*=blinkK(t,4.5); ex=.6*Math.sin(t*.6); break;
    case 'thinking': ex=2.2; ey=-2.5; eh=7*blinkK(t,5); inner=dots(32.5,.33); break;
    case 'listening': eyes=false; inner=[14,19,24,29,34].map((x,i)=>{const h=3+11*wave(t,i);return `<rect x="${x-1.3}" y="${24-h/2}" width="2.6" height="${h}" rx="1.3" fill="${LIGHT}"/>`;}).join(''); break;
    case 'helping': {ex=3;const p=ph(t,1.6),o=2*eo(seg(p,0,.5))*(1-seg(p,.7,1));outer=`<path d="M${44.5+o} 20L${48.5+o} 24L${44.5+o} 28" fill="none" stroke="${BLUE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;break;}
    case 'working': ew=5.4; eh=2.6; inner=`<rect x="9" y="${12+24*ph(t,1.6)}" width="30" height="1.2" fill="${LIGHT}" opacity=".35"/>`; break;
    case 'success': {const p=ph(t,3);const k=1-seg(p,.88,1);body=BLUE;eyes=false;const ck=eio(seg(p,.1,.45));inner=`<path d="M16.5 24.5L21.5 29.5L31.5 19" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-ck}" opacity="${k}"/>`;break;}
    case 'error': {const p=ph(t,2.6);ew=5;eh=2;ey=2;if(p<.22)bx=Math.sin(p*TAU*12)*1.2*(1-p/.22);outer=`<circle cx="${40+bx}" cy="10" r="3.6" fill="${RED}" stroke="#fff" stroke-width="1.6"/>`;break;}
    case 'waiting': eh=3.4; ey=1.5; inner=dots(32.5,.7); break;
    case 'attention': {eh=10;const p=.5+.5*Math.sin(TAU*t/1.4);outer=`<rect x="2.5" y="5.5" width="43" height="37" rx="12" fill="none" stroke="${BLUE}" stroke-width="2" opacity="${.25+.75*p}"/>`;break;}
    case 'dismissed': {const p=ph(t,3.4),rs=1-seg(p,.9,1),a=seg(p,.08,.3)*rs,b=seg(p,.3,.5)*rs,c=seg(p,.5,.72)*rs;eh=lerp(8,1.6,a);ew=lerp(3.6,1.6,b);gap=6*b;body=c>.5?'#9EA4B8':NAVY;bodyOp=lerp(1,.45,c);break;}
  }
  let e='';
  if(eyes){[18+gap,30-gap].forEach(x=>{e+=`<rect x="${x+ex-ew/2}" y="${24+ey-eh/2}" width="${ew}" height="${eh}" rx="${Math.min(ew,eh)/2}" fill="${LIGHT}"/>`;});}
  return `<g transform="translate(${bx} 0)"><rect x="6" y="9" width="36" height="30" rx="9" fill="${body}" opacity="${bodyOp}"/>${e}${inner}</g>${outer}`;
}

// 2c Signal — 3×3 node grid, states as patterns
function C(s,t){
  const I=Array(9).fill(0);let lit=BLUE,lines='',pos=null,rr=Array(9).fill(4),baseOp=1;
  const P=i=>[11+(i%3)*13,11+Math.floor(i/3)*13];
  switch(s){
    case 'idle': I[4]=.55+.45*Math.sin(TAU*t/3.5); break;
    case 'thinking': {const per=[0,1,2,5,8,7,6,3],h=(t*7)%8;per.forEach((ix,k)=>{const dd=(h-k+8)%8;I[ix]=Math.max(0,1-dd/3);});I[4]=.25;break;}
    case 'listening': for(let c=0;c<3;c++){const lv=wave(t,c)*3.2;for(let r=0;r<3;r++)I[r*3+c]=cl(lv-(2-r));} break;
    case 'helping': {const c0=Math.floor(t/.45)%3-1;[[c0,0],[c0+1,1],[c0,2]].forEach(([c,r])=>{if(c>=0&&c<3)I[r*3+c]=1;});break;}
    case 'working': {const sd=Math.floor(t/.2);const h=n=>Math.abs(Math.sin(n*12.9898)*43758.5453)%1;I[4]=1;[Math.floor(h(sd)*9),Math.floor(h(sd+.5)*9)].forEach(ix=>{if(ix===4)return;I[ix]=1;const[x,y]=P(ix);lines+=`<line x1="24" y1="24" x2="${x}" y2="${y}" stroke="${BLUE}" stroke-width="1.6" opacity=".4"/>`;});break;}
    case 'success': {lit=GREEN;const p=ph(t,3),k=1-seg(p,.88,1),pts=[3,7,2];pts.forEach((ix,j)=>{I[ix]=seg(p,j*.12,j*.12+.1)*k;});const pr=eio(seg(p,.05,.4));const[a,b,c]=pts.map(P);lines=`<polyline points="${a} ${b} ${c}" fill="none" stroke="${GREEN}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-pr}" opacity="${k}"/>`;break;}
    case 'error': {lit=RED;const v=.55+.45*Math.cos(TAU*t/1.4);[0,2,4,6,8].forEach(ix=>I[ix]=v);break;}
    case 'waiting': {lit=NAVY;const per=[0,1,2,5,8,7,6,3];I[per[Math.floor(t/.7)%8]]=.8;break;}
    case 'attention': {const p=ph(t,1.6),dist=[2,1,2,1,0,1,2,1,2];dist.forEach((d,ix)=>I[ix]=Math.max(0,1-Math.abs(p*4-d)));break;}
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));pos=Array.from({length:9},(_,i)=>{const[x,y]=P(i);return[lerp(x,24,e),lerp(y,24,e)];});rr=rr.map((v,i)=>i===4?4:lerp(4,2,e));I[4]=.6*(1-e);baseOp=lerp(1,.6,e);break;}
  }
  let out=lines;
  for(let i=0;i<9;i++){const[x,y]=pos?pos[i]:P(i);out+=`<circle cx="${x}" cy="${y}" r="${rr[i]}" fill="${DIM}" opacity="${baseOp}"/>`;if(I[i]>.01)out+=`<circle cx="${x}" cy="${y}" r="${rr[i]}" fill="${lit}" opacity="${I[i]}"/>`;}
  return out;
}

const badge=(p,x=39,y=39)=>{const b=eo(seg(p,.25,.45))*(1-seg(p,.88,.98)),ck=seg(p,.35,.6);return b>0?`<g transform="translate(${x} ${y}) scale(${b})"><circle r="7" fill="${GREEN}" stroke="#fff" stroke-width="2"/><path d="M-3.2 .2L-1 2.4L3.2-2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-ck}"/></g>`:'';};
const SLATE='#3A4370';
// 3a Cube — isometric hexagon of three faces
function D(s,t){
  const R=16,c=[24,24],v=k=>{const a=(-90+k*60)*Math.PI/180;return[24+R*Math.cos(a),24+R*Math.sin(a)];};
  const [T,UR,LR,Bt,LL,UL]=[0,1,2,3,4,5].map(v);
  let fc={top:BLUE,left:NAVY,right:SLATE},off={top:[0,0],left:[0,0],right:[0,0]},rot=0,sc=1,dx=0,back='',front='',show={top:1,left:1,right:1};
  const push=(f,k)=>{const m={top:[0,-1],left:[-.87,.5],right:[.87,.5]}[f];off[f]=[m[0]*k,m[1]*k];};
  switch(s){
    case 'idle': sc=1+.02*Math.sin(TAU*t/4); break;
    case 'thinking': push('top',2.5*(.5-.5*Math.cos(TAU*t/1.6))); break;
    case 'listening': fc={top:BLUE,left:BLUE,right:'#4C7BF7'}; ['top','left','right'].forEach((f,i)=>push(f,2.2*wave(t,i))); break;
    case 'helping': {const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eio(seg(p,.6,1));push('right',4*e);fc.right=BLUE;fc.top='#8FB0FF';break;}
    case 'working': {const p=ph(t,1.2);rot=120*(Math.floor(t/1.2)+eio(seg(p,0,.45)));break;}
    case 'success': {const p=ph(t,3.2),e=eio(seg(p,0,.3))*(1-seg(p,.9,1));sc=1-.06*e;if(e>.5)fc={top:BLUE,left:BLUE,right:'#4C7BF7'};front=badge(p);break;}
    case 'error': {const p=ph(t,2.6);fc.right=RED;if(p<.25)dx=Math.sin(p*TAU*12)*1.3*(1-p/.25);break;}
    case 'waiting': {const fs=['top','right','left'],a=Math.floor(t/.9)%3;fc={top:DIM,left:GREY,right:'#CBD0DC'};fc[fs[a]]=NAVY;break;}
    case 'attention': {const p=ph(t,1.8),r=17+8*eo(p);const pts=[0,1,2,3,4,5].map(k=>{const a=(-90+k*60)*Math.PI/180;return`${24+r*Math.cos(a)},${24+r*Math.sin(a)}`;}).join(' ');back=`<polygon points="${pts}" fill="none" stroke="${BLUE}" stroke-width="${2*(1-p)+.3}" stroke-linejoin="round" opacity="${.55*(1-p)}"/>`;break;}
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));sc=1-.65*e;show.left=show.right=1-e;if(e>.9)fc.top=GREY;break;}
  }
  const poly=(f,pts)=>{const[ox,oy]=off[f];return `<polygon points="${pts.map(p=>`${p[0]+ox},${p[1]+oy}`).join(' ')}" fill="${fc[f]}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round" opacity="${show[f]}"/>`;};
  return back+`<g transform="translate(${dx} 0) translate(24 24) scale(${sc}) rotate(${rot}) translate(-24 -24)">${poly('left',[UL,c,Bt,LL])}${poly('right',[c,UR,LR,Bt])}${poly('top',[T,UR,c,UL])}</g>`+front;
}
// 3b Orbit — core, track and satellite
const arc=(r,a0,a1)=>{const p=a=>[24+r*Math.cos(a*Math.PI/180),24+r*Math.sin(a*Math.PI/180)];const[x0,y0]=p(a0),[x1,y1]=p(a1);return `M${x0} ${y0}A${r} ${r} 0 ${a1-a0>180?1:0} 1 ${x1} ${y1}`;};
function E(s,t){
  let core=NAVY,cr=8.5,tr=17,track=`<circle cx="24" cy="24" r="${tr}" fill="none" stroke="${DIM}" stroke-width="1.8"/>`,sats=[],satCol=BLUE,extra='',front='',dx=0,coreIn='';
  const sat=(a,r=tr,col=satCol,sz=5.4)=>{const x=24+r*Math.cos(a*Math.PI/180),y=24+r*Math.sin(a*Math.PI/180);return `<rect x="${x-sz/2}" y="${y-sz/2}" width="${sz}" height="${sz}" rx="1" fill="${col}" transform="rotate(${a+45} ${x} ${y})"/>`;};
  switch(s){
    case 'idle': sats=[sat(-90+t*36)]; break;
    case 'thinking': {const a=-90+t*225;extra=`<path d="${arc(tr,a-80,a)}" fill="none" stroke="${BLUE}" stroke-width="1.8" stroke-linecap="round" opacity=".55"/>`;sats=[sat(a)];break;}
    case 'listening': core=BLUE; cr=8.5+2.2*wave(t,0); sats=[sat(-90+t*36)]; extra=`<circle cx="24" cy="24" r="${cr+2.5+1.5*wave(t,1)}" fill="none" stroke="${BLUE}" stroke-width="1.2" opacity=".35"/>`; break;
    case 'helping': {const p=ph(t,2),e=eo(seg(p,0,.4))*(1-eio(seg(p,.7,1)));const r=tr+4*e;extra=`<line x1="${24+cr}" y1="24" x2="${24+r-3}" y2="24" stroke="${BLUE}" stroke-width="1.6" opacity="${.3+.5*e}"/>`;sats=[sat(0,r)];break;}
    case 'working': {const st=Math.floor(t/.8),p=ph(t,.8),a=-90+120*(st+eio(seg(p,0,.5)));sats=[0,120,240].map(o=>sat(a+o));break;}
    case 'success': {const p=ph(t,3),k=1-seg(p,.88,1),pr=eio(seg(p,.05,.45));core=GREEN;track+=`<path d="${arc(tr,-90,-90+359.9*pr)}" fill="none" stroke="${GREEN}" stroke-width="1.8" stroke-linecap="round" opacity="${k}"/>`;coreIn=`<path d="M20.2 24.3L22.9 27L28 21.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-seg(p,.3,.55)}"/>`;break;}
    case 'error': {const p=ph(t,2.6);core=RED;if(p<.25)dx=Math.sin(p*TAU*12)*1.2*(1-p/.25);track=`<circle cx="24" cy="24" r="${tr}" fill="none" stroke="${DIM}" stroke-width="1.8" stroke-dasharray="3 3"/>`;sats=[sat(90,tr,GREY)];break;}
    case 'waiting': track=`<circle cx="24" cy="24" r="${tr}" fill="none" stroke="${GREY}" stroke-width="1.8" stroke-dasharray="2.5 4" transform="rotate(${t*20} 24 24)"/>`; sats=[sat(-90,tr,NAVY)]; core=SLATE; break;
    case 'attention': {const p=ph(t,1.8);core=BLUE;extra=`<circle cx="24" cy="24" r="${tr+7*eo(p)}" fill="none" stroke="${BLUE}" stroke-width="${2*(1-p)+.3}" opacity="${.55*(1-p)}"/>`;sats=[sat(-90)];break;}
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));const r=lerp(tr,cr*.4,e);track=`<circle cx="24" cy="24" r="${r}" fill="none" stroke="${DIM}" stroke-width="1.8" opacity="${1-e}"/>`;sats=[sat(-90,r,satCol,5.4*(1-e))];cr=lerp(8.5,4,e);if(e>.9)core=GREY;break;}
  }
  return `<g transform="translate(${dx} 0)">${track}${extra}<circle cx="24" cy="24" r="${cr}" fill="${core}"/>${coreIn}${sats.join('')}</g>${front}`;
}
// 3c Shift — one shape that morphs between primitives
const N=72;
function shape(k,R,rot){const out=[];for(let i=0;i<N;i++){const u=i/N;if(k===0){const a=(-90+rot+u*360)*Math.PI/180;out.push([24+R*Math.cos(a),24+R*Math.sin(a)]);continue;}const f=u*k,j=Math.floor(f),fr=f-j;const va=a=>{const ang=(-90+rot+a*360/k)*Math.PI/180;return[24+R*Math.cos(ang),24+R*Math.sin(ang)];};const p0=va(j),p1=va(j+1);out.push([lerp(p0[0],p1[0],fr),lerp(p0[1],p1[1],fr)]);}return out;}
function G(s,t,el){
  let k=4,R=17,rot=45,fill=NAVY,dx=0,back='',front='',sc=1;
  switch(s){
    case 'idle': sc=1+.02*Math.sin(TAU*t/4); break;
    case 'thinking': k=3; R=18; rot=t*60; fill=NAVY; break;
    case 'listening': {k=0;R=14+2*wave(t,0);fill=BLUE;back=Array.from({length:12},(_,i)=>{const a=i*30*Math.PI/180,l=1.5+4*wave(t,i);return `<line x1="${24+18*Math.cos(a)}" y1="${24+18*Math.sin(a)}" x2="${24+(18+l)*Math.cos(a)}" y2="${24+(18+l)*Math.sin(a)}" stroke="${BLUE}" stroke-width="1.8" stroke-linecap="round" opacity=".5"/>`;}).join('');break;}
    case 'helping': {k=3;R=17;rot=90;fill=BLUE;const p=ph(t,1.8);dx=3*eo(seg(p,0,.4))*(1-eio(seg(p,.6,1)));break;}
    case 'working': {k=6;R=17;const p=ph(t,.9);rot=60*(Math.floor(t/.9)+eio(seg(p,0,.5)));break;}
    case 'success': {k=0;R=15;fill=GREEN;const p=ph(t,3);front=`<path d="M17.5 24.5L22 29L30.5 19.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-eio(seg(p,.2,.5))}" opacity="${1-seg(p,.88,1)}"/>`;break;}
    case 'error': {k=4;rot=0;R=16;fill=RED;const p=ph(t,2.6);if(p<.25)dx=Math.sin(p*TAU*12)*1.3*(1-p/.25);front=`<path d="M24 16.5V25.5" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="31" r="1.8" fill="#fff"/>`;break;}
    case 'waiting': {k=4;rot=45;R=17;fill=DIM;const pr=ph(t,2.4);const pts=shape(4,17,45);front=`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${NAVY}" stroke-width="2.4" stroke-linejoin="round" pathLength="1" stroke-dasharray="${.25} ${.75}" stroke-dashoffset="${-pr}"/>`;break;}
    case 'attention': {k=4;rot=0;R=17;fill=BLUE;const p=ph(t,1.8),r=17+8*eo(p);const pts=shape(4,r,0);back=`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${BLUE}" stroke-width="${2*(1-p)+.3}" stroke-linejoin="round" opacity="${.55*(1-p)}"/>`;break;}
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));k=4;rot=45;R=lerp(17,5,e);fill=e>.9?GREY:NAVY;break;}
  }
  let target=shape(k,R,rot);
  if(el){if(el._gs!==s){el._from=el._poly||target;el._gs=s;el._mt=performance.now();}const m=eio(cl((performance.now()-el._mt)/450));if(el._from&&m<1)target=target.map((p,i)=>[lerp(el._from[i][0],p[0],m),lerp(el._from[i][1],p[1],m)]);el._poly=target;}
  if(s==='success'||s==='error')front='';
  {const cx0=24,ey=23.5,es=s==='dismissed'?R/17:1,bk=blinkK(t,4.5);let sr=3.4,pr=1.7,px=0,py=0,sy=1,mode='eye';
    switch(s){case 'idle':px=.8*Math.sin(t*.6);sy=bk;break;case 'thinking':px=1;py=-1;sy=blinkK(t,5);break;case 'listening':sr=3.9;pr=1.9;break;
      case 'helping':px=1.3;break;case 'working':sy=.5;break;case 'success':mode='happy';break;case 'error':mode='flat';break;
      case 'waiting':mode='lid';py=1;break;case 'attention':sr=4;pr=1.3;break;case 'dismissed':sy=lerp(1,.12,cl(1-R/17+.2));break;}
    const lw=2;let e='';[-5.5,5.5].forEach(o=>{const ex=cx0+o;
    if(mode==='happy')e+=`<path d="M${ex-3} ${ey+1.2}Q${ex} ${ey-3} ${ex+3} ${ey+1.2}" fill="none" stroke="#fff" stroke-width="${lw}" stroke-linecap="round"/>`;
    else if(mode==='flat')e+=`<path d="M${ex-2.8} ${ey+.5}L${ex+2.8} ${ey+.5}" stroke="#fff" stroke-width="${lw}" stroke-linecap="round"/>`;
    else e+=`<g transform="translate(${ex} ${ey}) scale(1 ${sy}) translate(${-ex} ${-ey})"><circle cx="${ex}" cy="${ey}" r="${sr}" fill="#fff"/><circle cx="${ex+px}" cy="${ey+py}" r="${pr}" fill="${NAVY}"/>${mode==='lid'?`<rect x="${ex-sr-.5}" y="${ey-sr-.5}" width="${2*sr+1}" height="${sr+.3}" fill="${fill}"/>`:''}</g>`;});
    front+=`<g transform="translate(${cx0} ${ey}) scale(${es}) translate(${-cx0} ${-ey})">${e}</g>`;}
  const pts=target.map(p=>`${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  return back+`<g transform="translate(${dx} 0) translate(24 24) scale(${sc}) translate(-24 -24)"><polygon points="${pts}" fill="${fill}" stroke="${fill}" stroke-width="2.5" stroke-linejoin="round"/>${front}</g>`;
}
// 4a Lattice — cube of 12 tiles
function H(s,t){
  const R=16,v=k=>{const a=(-90+k*60)*Math.PI/180;return[24+R*Math.cos(a),24+R*Math.sin(a)];};
  const [T,UR,LR,Bt,LL,UL]=[0,1,2,3,4,5].map(v),C0=[24,24];
  const faces=[[T,UR,UL,[0,-1],'#2B3568','#4C7BF7'],[UL,C0,LL,[-.87,.5],NAVY,BLUE],[C0,UR,Bt,[.87,.5],'#1F2750','#3D6CF0']];
  const L=Array(12).fill(0),P=Array(12).fill(0),X=Array(12).fill(null);let sc=1,dx=0,back='',front='',fade=1;
  const TOPC=[0,1,3,2],ORD=[0,1,3,2,8,9,11,10,4,5,7,6];
  switch(s){
    case 'idle': L[3]=.35+.35*Math.sin(TAU*t/3.5); break;
    case 'thinking': {const h=(t*4)%4;TOPC.forEach((ix,k)=>{const d=(h-k+4)%4;L[ix]=Math.max(0,1-d/1.6);});break;}
    case 'listening': [4,5,6,7,8,9,10,11].forEach(ix=>{const f=ix<8?0:1,col=(ix%2)+f*2;P[ix]=2.6*wave(t,col);L[ix]=wave(t,col);});break;
    case 'helping': {const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eio(seg(p,.6,1));[8,9,10,11].forEach((ix,k)=>{const ek=cl(e*1.4-k*.1);P[ix]=3.2*ek;L[ix]=ek;});break;}
    case 'working': {const n=Math.floor(t/.2)%15;ORD.forEach((ix,k)=>{if(k<n)L[ix]=1;if(k===n-1)P[ix]=1.4;});break;}
    case 'success': {const p=ph(t,3.2),k=1-seg(p,.9,1);ORD.forEach((ix,j)=>{L[ix]=eo(seg(p,j*.018,j*.018+.12))*k;});front=badge(p);break;}
    case 'error': {const p=ph(t,2.6);X[9]=RED;P[9]=2.2;if(p<.25)dx=Math.sin(p*TAU*12)*1.3*(1-p/.25);break;}
    case 'waiting': {for(let i=0;i<12;i++)X[i]=i<4?DIM:i<8?GREY:'#CBD0DC';X[ORD[Math.floor(t/.6)%12]]=NAVY;break;}
    case 'attention': {const p=ph(t,1.8);TOPC.forEach(ix=>L[ix]=1-p*.6);const r=17+8*eo(p);back=`<polygon points="${[0,1,2,3,4,5].map(k=>{const a=(-90+k*60)*Math.PI/180;return`${24+r*Math.cos(a)},${24+r*Math.sin(a)}`;}).join(' ')}" fill="none" stroke="${BLUE}" stroke-width="${2*(1-p)+.3}" stroke-linejoin="round" opacity="${.55*(1-p)}"/>`;break;}
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));sc=1-.6*e;for(let i=0;i<12;i++){P[i]=-1.2*e;if(e>.9)X[i]=GREY;}break;}
  }
  const mix=(a,b,k)=>{const h=x=>[1,3,5].map(i=>parseInt(x.substr(i,2),16));const A=h(a),B=h(b);return `rgb(${A.map((v,i)=>Math.round(lerp(v,B[i],cl(k)))).join(',')})`;};
  let out='';
  [1,2,0].forEach(fi=>{const[o,u,w,nv,base,lit]=faces[fi];const pt=(a,b)=>[o[0]+(u[0]-o[0])*a+(w[0]-o[0])*b,o[1]+(u[1]-o[1])*a+(w[1]-o[1])*b];
    for(let j=0;j<2;j++)for(let i=0;i<2;i++){const ix=fi*4+j*2+i,pp=P[ix];const q=[pt(i/2,j/2),pt((i+1)/2,j/2),pt((i+1)/2,(j+1)/2),pt(i/2,(j+1)/2)].map(p=>`${(p[0]+nv[0]*pp).toFixed(2)},${(p[1]+nv[1]*pp).toFixed(2)}`).join(' ');
      out+=`<polygon points="${q}" fill="${X[ix]||mix(base,lit,L[ix])}" stroke="#fff" stroke-width="1.1" stroke-linejoin="round"/>`;}});
  return back+`<g opacity="${fade}" transform="translate(${dx} 0) translate(24 24) scale(${sc}) translate(-24 -24)">${out}</g>`+front;
}
// 4b Gyro — core with two tilted orbits in depth
function I(s,t){
  let rings=[{R:18,k:.36,phi:-30,op:1,dash:0,col:'#C4CBE0'},{R:18,k:.36,phi:30,op:1,dash:0,col:'#C4CBE0'}],sats=[],core=NAVY,cr=7.5,dx=0,back='',front='',coreIn='';
  const pt=(rg,th)=>{const x=rg.R*Math.cos(th),y=rg.R*rg.k*Math.sin(th),a=rg.phi*Math.PI/180;return[24+x*Math.cos(a)-y*Math.sin(a),24+x*Math.sin(a)+y*Math.cos(a)];};
  switch(s){
    case 'idle': rings[1].op=.45; sats=[{r:0,th:t*.7}]; break;
    case 'thinking': sats=[0,1].flatMap(r=>[0,.22,.44].map((g,j)=>({r,th:t*3+r*Math.PI-g,op:1-j*.38,sz:1-j*.2}))); break;
    case 'listening': core=BLUE; cr=7.5+2*wave(t,0); rings.forEach((rg,i)=>{rg.R=18+1.6*wave(t,i+1);rg.col='#9DB6FA';}); sats=[{r:0,th:t*.7}]; break;
    case 'helping': {const p=ph(t,2.4),e=eo(seg(p,0,.35))*(1-eio(seg(p,.65,1)));rings.forEach(rg=>{rg.phi*=1-e;});rings[0].col=BLUE;sats=[{r:0,th:0,push:4*e}];break;}
    case 'working': {const b=TAU/3*(Math.floor(t/.8)+eio(seg(ph(t,.8),0,.5)));sats=[0,1,2].map(i=>({r:0,th:b+i*TAU/3})).concat([{r:1,th:-b}]);break;}
    case 'success': {const p=ph(t,3.2),e=eio(seg(p,0,.35))*(1-eio(seg(p,.88,1)));rings.forEach(rg=>{rg.phi*=1-e;rg.k=lerp(.36,1,e);rg.col=e>.5?GREEN:rg.col;});core=GREEN;coreIn=`<path d="M21 24.2L23.2 26.4L27.2 22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-seg(p,.3,.5)}" opacity="${1-seg(p,.88,1)}"/>`;break;}
    case 'error': {const p=ph(t,2.6);core=RED;if(p<.25)dx=Math.sin(p*TAU*12)*1.2*(1-p/.25);rings.forEach(rg=>{rg.dash=1;});sats=[{r:0,th:Math.PI/2,c:GREY}];break;}
    case 'waiting': rings.forEach((rg,i)=>{rg.dash=1;rg.phi+=t*8;rg.col=GREY;}); core=SLATE; sats=[{r:0,th:Math.PI/2,c:NAVY}]; break;
    case 'attention': {const p=ph(t,1.8);core=BLUE;rings.forEach(rg=>{rg.col='#9DB6FA';});back=`<circle cx="24" cy="24" r="${19+6*eo(p)}" fill="none" stroke="${BLUE}" stroke-width="${2*(1-p)+.3}" opacity="${.55*(1-p)}"/>`;sats=[{r:0,th:Math.PI/2}];break;}
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));rings.forEach(rg=>{rg.R=lerp(18,cr,e);rg.op=1-e;});cr=lerp(7.5,4,e);if(e>.9)core=GREY;sats=[{r:0,th:t*.7,op:1-e}];break;}
  }
  const half=(rg,a0)=>{let pts=[];for(let i=0;i<=32;i++)pts.push(pt(rg,a0+i/32*Math.PI).map(n=>n.toFixed(2)).join(','));return `<polyline points="${pts.join(' ')}" fill="none" stroke="${rg.col}" stroke-width="1.5" stroke-linecap="round" opacity="${rg.op}" ${rg.dash?'stroke-dasharray="2 3"':''}/>`;};
  const sq=(sv)=>{const rg=rings[sv.r],P0=pt({...rg,R:rg.R+(sv.push||0)},sv.th),dep=Math.sin(sv.th),z=(sv.sz||1)*(4.6+1.2*dep);return `<rect x="${P0[0]-z/2}" y="${P0[1]-z/2}" width="${z}" height="${z}" rx="1" fill="${sv.c||BLUE}" opacity="${(sv.op??1)*(dep<0?.55:1)}" transform="rotate(45 ${P0[0]} ${P0[1]})"/>`;};
  const behind=sats.filter(sv=>Math.sin(sv.th)<0),infront=sats.filter(sv=>Math.sin(sv.th)>=0);
  return back+`<g transform="translate(${dx} 0)">${rings.map(rg=>half(rg,Math.PI)).join('')}${behind.map(sq).join('')}<circle cx="24" cy="24" r="${cr}" fill="${core}"/><circle cx="24" cy="24" r="${cr*.55}" fill="none" stroke="#fff" stroke-width=".9" opacity=".22"/>${coreIn}${rings.map(rg=>half(rg,0)).join('')}${infront.map(sq).join('')}</g>`+front;
}
// 4c Nested — outline shape around a counter-moving inner shape
function J(s,t,el){
  let o={k:4,R:19,rot:45},n={k:4,R:8,rot:0},oc=NAVY,nc=BLUE,dx=0,ndx=0,back='',front='',oop=1,sw=2.2,nsc=1;
  switch(s){
    case 'idle': nsc=1+.06*Math.sin(TAU*t/4); break;
    case 'thinking': o={k:3,R:20,rot:t*40}; n={k:3,R:9,rot:180-t*80}; break;
    case 'listening': o={k:0,R:18+1.2*wave(t,1),rot:0}; n={k:0,R:6+4*wave(t,0),rot:0}; oc=BLUE; break;
    case 'helping': {o={k:3,R:19,rot:90};n={k:3,R:7,rot:90};oc=BLUE;const p=ph(t,1.8),e=eo(seg(p,0,.4))*(1-eio(seg(p,.6,1)));dx=2*e;ndx=4*e;break;}
    case 'working': {const st=Math.floor(t/.9)+eio(seg(ph(t,.9),0,.5));o={k:6,R:19,rot:60*st};n={k:6,R:9,rot:-60*st+30};break;}
    case 'success': {o={k:0,R:18,rot:0};n={k:0,R:12,rot:0};oc=nc=GREEN;const p=ph(t,3);front=`<path d="M19.2 24.3L22.6 27.7L28.8 20.8" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-eio(seg(p,.2,.5))}" opacity="${1-seg(p,.88,1)}"/>`;break;}
    case 'error': {o={k:4,R:19,rot:0};n={k:4,R:12,rot:0};oc=nc=RED;const p=ph(t,2.6);if(p<.25)dx=ndx=Math.sin(p*TAU*12)*1.3*(1-p/.25);front=`<path d="M${24+dx} 20V25" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="${24+dx}" cy="28.6" r="1.5" fill="#fff"/>`;break;}
    case 'waiting': {o={k:4,R:19,rot:45};n={k:4,R:7,rot:45};oc=DIM;nc=GREY;const pr=ph(t,2.4);front=`<polygon points="${shape(4,19,45).map(p=>p.join(',')).join(' ')}" fill="none" stroke="${NAVY}" stroke-width="2.2" stroke-linejoin="round" pathLength="1" stroke-dasharray=".22 .78" stroke-dashoffset="${-pr}"/>`;break;}
    case 'attention': {o={k:4,R:19,rot:0};n={k:0,R:6,rot:0};oc=BLUE;const p=ph(t,1.8);back=`<polygon points="${shape(4,19+7*eo(p),0).map(p=>p.join(',')).join(' ')}" fill="none" stroke="${BLUE}" stroke-width="${2*(1-p)+.3}" stroke-linejoin="round" opacity="${.55*(1-p)}"/>`;break;}
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));o={k:4,R:lerp(19,6,e),rot:45};oop=1-e;n={k:4,R:lerp(8,4,e),rot:45*e};if(e>.9)nc=GREY;break;}
  }
  const mo=(key,tg)=>{if(!el)return tg;const st=el['_'+key]||(el['_'+key]={});if(st.s!==s){st.from=st.poly||tg;st.s=s;st.t=performance.now();}const m=eio(cl((performance.now()-st.t)/450));const r=m<1?tg.map((p,i)=>[lerp(st.from[i][0],p[0],m),lerp(st.from[i][1],p[1],m)]):tg;st.poly=r;return r;};
  const op=mo('o',shape(o.k,o.R,o.rot)),np=mo('n',shape(n.k,n.R*nsc,n.rot));
  const ps=a=>a.map(p=>`${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  return back+`<g transform="translate(${dx} 0)"><polygon points="${ps(op)}" fill="none" stroke="${oc}" stroke-width="${sw}" stroke-linejoin="round" opacity="${oop}"/></g><g transform="translate(${ndx} 0)"><polygon points="${ps(np)}" fill="${nc}" stroke="${nc}" stroke-width="1.6" stroke-linejoin="round"/></g>`+front;
}
const guides=()=>{let g='';for(let i=0;i<=48;i+=4)g+=`<line x1="${i}" y1="0" x2="${i}" y2="48" stroke="#DCE3F5" stroke-width=".2"/><line x1="0" y1="${i}" x2="48" y2="${i}" stroke="#DCE3F5" stroke-width=".2"/>`;
  return g+`<circle cx="24" cy="24" r="19" fill="none" stroke="${BLUE}" stroke-width=".3" stroke-dasharray="1 1" opacity=".7"/><circle cx="24" cy="24" r="9" fill="none" stroke="${BLUE}" stroke-width=".3" stroke-dasharray="1 1" opacity=".7"/><line x1="0" y1="0" x2="48" y2="48" stroke="${BLUE}" stroke-width=".25" opacity=".45"/><line x1="48" y1="0" x2="0" y2="48" stroke="${BLUE}" stroke-width=".25" opacity=".45"/><line x1="24" y1="0" x2="24" y2="48" stroke="${BLUE}" stroke-width=".25" opacity=".45"/><line x1="0" y1="24" x2="48" y2="24" stroke="${BLUE}" stroke-width=".25" opacity=".45"/>`;};
const P2=a=>a.map(p=>`${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
let ROUND=0;
const rp=(pts,r)=>{const n=pts.length,f2=v=>v.toFixed(2);let d='';const A=[],B=[];for(let i=0;i<n;i++){const p=pts[(i-1+n)%n],c=pts[i],q=pts[(i+1)%n];const l1=Math.hypot(p[0]-c[0],p[1]-c[1])||1,l2=Math.hypot(q[0]-c[0],q[1]-c[1])||1,r1=Math.min(r,l1*.45),r2=Math.min(r,l2*.45);A.push([c[0]+(p[0]-c[0])/l1*r1,c[1]+(p[1]-c[1])/l1*r1]);B.push([c[0]+(q[0]-c[0])/l2*r2,c[1]+(q[1]-c[1])/l2*r2]);}d=`M${f2(B[n-1][0])} ${f2(B[n-1][1])}`;for(let i=0;i<n;i++)d+=`L${f2(A[i][0])} ${f2(A[i][1])}Q${f2(pts[i][0])} ${f2(pts[i][1])} ${f2(B[i][0])} ${f2(B[i][1])}`;return d+'Z';};
const poly=(pts,attrs)=>ROUND?`<path d="${rp(pts,ROUND)}" ${attrs}/>`:`<polygon points="${P2(pts)}" ${attrs}/>`;
const pg=(pts,fill,extra='')=>poly(pts,`fill="${fill}" stroke="${ROUND?'#fff':fill}" stroke-width="${ROUND?.9:.6}" stroke-linejoin="round" ${extra}`);
const shake=(t,T=2.6)=>{const p=ph(t,T);return p<.25?Math.sin(p*TAU*12)*1.3*(1-p/.25):0;};
const ringPulse=(t,k,r0,rot=0)=>{const p=ph(t,1.8);const pts=k?Array.from({length:k},(_,i)=>{const a=(-90+rot+i*360/k)*Math.PI/180;return[24+(r0+7*eo(p))*Math.cos(a),24+(r0+7*eo(p))*Math.sin(a)];}):shape(0,r0+7*eo(p),rot);return poly(pts,`fill="none" stroke="${BLUE}" stroke-width="${2*(1-p)+.3}" stroke-linejoin="round" opacity="${.55*(1-p)}"`);};
// 6a Facet — gem of four triangles around a moving light point
function K(s,t){
  let c=[24,22],top=[24,5],rt=[41,24],bt=[24,43],lf=[7,24],cols=['#4C7BF7',BLUE,NAVY,SLATE],sx=1,sy=1,dx=0,back='',front='',sep=[0,0,0,0];
  switch(s){
    case 'idle': c=[24+1.5*Math.sin(TAU*t/5),22+Math.cos(TAU*t/5)]; break;
    case 'thinking': {const a=TAU*t/2;c=[24+4*Math.cos(a),23+4*Math.sin(a)];const i=Math.floor(((a/TAU)%1)*4);cols=cols.map((v,j)=>j===(i+1)%4?'#8FB0FF':v);break;}
    case 'listening': sep=sep.map((_,i)=>1.8*wave(t,i)); cols=['#6E95FF',BLUE,'#2F4BB8','#3D5BD0']; break;
    case 'helping': {const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eio(seg(p,.6,1));c=[24+8*e,22];rt=[41+3*e,24];break;}
    case 'working': {const w=Math.cos(TAU*t/1.6);sx=Math.max(.08,Math.abs(w));if(w<0)cols=[BLUE,'#4C7BF7',SLATE,NAVY];break;}
    case 'success': {const p=ph(t,3.2),e=eio(seg(p,0,.3))*(1-seg(p,.9,1));if(e>.5)cols=['#3DBE84',GREEN,'#137048','#1A8657'];front=badge(p);break;}
    case 'error': dx=shake(t); cols[3]=RED; break;
    case 'waiting': {cols=['#DDE1EB','#CBD0DC',GREY,'#A9AFC0'];cols[Math.floor(t/.9)%4]=NAVY;break;}
    case 'attention': back=ringPulse(t,4,19); cols[0]='#8FB0FF'; break;
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));sy=1-.85*e;sx=1-.5*e;if(e>.9)cols=[GREY,GREY,'#A9AFC0','#A9AFC0'];break;}
  }
  const T=(p)=>[24+(p[0]-24)*sx+dx,24+(p[1]-24)*sy];
  const dirs=[[-1,-1],[1,-1],[-1,1],[1,1]].map(v=>[v[0]*.7,v[1]*.7]);
  const tris=[[top,lf,c],[top,rt,c],[lf,bt,c],[rt,bt,c]];
  return back+tris.map((tr,i)=>pg(tr.map(p=>T([p[0]+dirs[i][0]*sep[i],p[1]+dirs[i][1]*sep[i]])),cols[i])).join('')+front;
}
// 6b Stack — three isometric slabs
function L(s,t){
  let ys=[32,24,16],xs=[0,0,0],tops=[NAVY,SLATE,BLUE],dx=0,back='',front='',th=3.2,w=15,hh=7.5;
  const slab=(cx,y,top,i)=>{const L0=[cx-w,y],T0=[cx,y-hh],R0=[cx+w,y],B0=[cx,y+hh];
    const left=[L0,B0,[B0[0],B0[1]+th],[L0[0],L0[1]+th]],right=[B0,R0,[R0[0],R0[1]+th],[B0[0],B0[1]+th]];
    if(ROUND){const r0=ROUND;return `<path d="${rp([L0,T0,R0,[R0[0],R0[1]+th],[B0[0],B0[1]+th],[L0[0],L0[1]+th]],r0)}" fill="#1B2147"/>`+`<path d="${rp([L0,T0,R0,B0],r0)}" fill="${top}" stroke="#fff" stroke-width=".8"/>`;}return pg(left,'#0E1330')+pg(right,'#232B55')+`<polygon points="${P2([L0,T0,R0,B0])}" fill="${top}" stroke="#fff" stroke-width=".8" stroke-linejoin="round"/>`;};
  switch(s){
    case 'idle': {const k=.5*Math.sin(TAU*t/4);ys=[32,24-k,16-2*k];break;}
    case 'thinking': ys=ys.map((y,i)=>y-1.6*Math.max(0,Math.sin(TAU*t/1.6-i*.9))); break;
    case 'listening': ys=[32,24-2*wave(t,0),16-2*wave(t,0)-2*wave(t,1)]; tops=[SLATE,'#3D5BD0',BLUE]; break;
    case 'helping': {const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eio(seg(p,.6,1));xs[2]=6*e;tops[2]='#4C7BF7';break;}
    case 'working': {const a=Math.floor(t*2.5)%3;tops=[NAVY,SLATE,'#2F3A73'];tops[a]=BLUE;ys[a]-=.8;break;}
    case 'success': {const p=ph(t,3.2),e=eio(seg(p,0,.3))*(1-seg(p,.9,1));ys=[32,lerp(24,28.5,e),lerp(16,25,e)];if(e>.5)tops=[NAVY,SLATE,GREEN];front=badge(p,40,38);break;}
    case 'error': dx=shake(t); xs[1]=-3; tops[1]=RED; break;
    case 'waiting': tops=[GREY,GREY,NAVY]; ys[2]=16-.8*Math.sin(TAU*t/3); break;
    case 'attention': {const p=ph(t,1.8);ys[2]=16-3*Math.sin(Math.PI*seg(p,0,.5));back=ringPulse(t,4,20,0);break;}
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));ys=[32,lerp(24,31,e),lerp(16,30,e)];if(e>.9)tops=[GREY,GREY,GREY];break;}
  }
  return back+`<g transform="translate(${dx} 0)">${[0,1,2].map(i=>slab(24+xs[i],ys[i],tops[i],i)).join('')}</g>`+front;
}
// 6c Hinge — a circle split into two halves
function M(s,t){
  let rot=0,gap=1.4,lc=NAVY,rc=BLUE,lr=0,rr=0,ldy=0,rdy=0,rdx=0,r=16,dx=0,back='',front='',inner='';
  const half=(a0,col,ox,oy,ra)=>{if(ROUND){const sw0=Math.min(ROUND,r*.4),k0=(r-sw0)/r;ox=ox/k0+(a0>0?-1:1)*sw0;}const a=v=>(v)*Math.PI/180;const p=v=>[24+ox+r*Math.cos(a(v)),24+oy+r*Math.sin(a(v))];const[x0,y0]=p(a0),[x1,y1]=p(a0+180);const sw=ROUND?Math.min(ROUND,r*.4):0;return `<path d="M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}Z" fill="${col}" ${sw?`stroke="${col}" stroke-width="${sw*2}" stroke-linejoin="round" transform="rotate(${ra} 24 24) translate(24 24) scale(${(r-sw)/r}) translate(-24 -24)"`:`transform="rotate(${ra} 24 24)"`}/>`;};
  switch(s){
    case 'idle': rot=4*Math.sin(TAU*t/5); break;
    case 'thinking': rot=t*140; break;
    case 'listening': gap=1.4+3*wave(t,0); inner=`<rect x="${24-.9}" y="${24-3-4*wave(t,1)}" width="1.8" height="${6+8*wave(t,1)}" rx=".9" fill="${BLUE}"/>`; break;
    case 'helping': {const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eio(seg(p,.6,1));rdx=5*e;break;}
    case 'working': rot=90*(Math.floor(t/.8)+eio(seg(ph(t,.8),0,.5))); break;
    case 'success': {const p=ph(t,3.2),e=eio(seg(p,0,.3))*(1-seg(p,.9,1));gap=1.4*(1-e);if(e>.5){lc=rc=GREEN;inner=`<path d="M18.5 24.5L22.5 28.5L30 20" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-seg(p,.3,.55)}"/>`;}break;}
    case 'error': dx=shake(t); rc=RED; rdy=3; break;
    case 'waiting': lc=GREY; rc='#CBD0DC'; rot=t*25; break;
    case 'attention': {const p=ph(t,1.8);gap=1.4+2.5*Math.sin(Math.PI*seg(p,0,.4));back=`<circle cx="24" cy="24" r="${18+7*eo(p)}" fill="none" stroke="${BLUE}" stroke-width="${2*(1-p)+.3}" opacity="${.55*(1-p)}"/>`;break;}
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));r=lerp(16,4,e);gap=1.4*(1-e);if(e>.9)lc=rc=GREY;break;}
  }
  return back+`<g transform="translate(${dx} 0) rotate(${rot} 24 24)">${half(90,lc,-gap,ldy,lr)}${half(-90,rc,gap+rdx,rdy,rr)}</g>`+inner+front;
}
// 6d Aperture — six triangles that open like an iris
function N2(s,t){
  let open=Array(6).fill(.12),cols=[NAVY,SLATE,NAVY,SLATE,NAVY,SLATE],twist=0,rot=0,R=19,dx=0,push=Array(6).fill(0),back='',front='';
  switch(s){
    case 'idle': open=open.map(()=>.12+.06*Math.sin(TAU*t/4)); break;
    case 'thinking': rot=t*40; twist=12*Math.sin(TAU*t/2); open=open.map(()=>.3); break;
    case 'listening': open=open.map((_,i)=>.15+.4*wave(t,i)); cols=cols.map((c,i)=>i%2?'#3D5BD0':BLUE); break;
    case 'helping': {const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eio(seg(p,.6,1));[0,1,5].forEach(i=>{push[i]=3*e;});cols[0]=cols[5]=BLUE;break;}
    case 'working': {const a=Math.floor(t*4)%6;cols[a]=BLUE;open=open.map(()=>.2);break;}
    case 'success': {const p=ph(t,3.2),e=eio(seg(p,0,.3))*(1-seg(p,.9,1));open=open.map(()=>.12+.5*e);twist=30*e;if(e>.5)cols=cols.map((c,i)=>i%2?'#1A8657':GREEN);if(e>.6)front=`<path d="M20.6 24.3L23 26.7L27.4 21.9" fill="none" stroke="${GREEN}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-seg(p,.35,.55)}"/>`;break;}
    case 'error': dx=shake(t); cols[2]=RED; push[2]=2.5; break;
    case 'waiting': cols=cols.map((c,i)=>i%2?'#CBD0DC':GREY); cols[Math.floor(t/.8)%6]=NAVY; break;
    case 'attention': {const p=ph(t,1.8);open=open.map(()=>.12+.35*Math.sin(Math.PI*seg(p,0,.5)));back=ringPulse(t,6,20,30);break;}
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));R=lerp(19,6,e);open=open.map(()=>.12*(1-e));if(e>.9)cols=cols.map(()=>GREY);break;}
  }
  const V=k=>{const a=(-90+30+rot+k*60)*Math.PI/180;return[24+R*Math.cos(a),24+R*Math.sin(a)];};
  let out='';
  for(let k=0;k<6;k++){const a=V(k),b=V(k+1),mid=(-90+60+rot+k*60+twist)*Math.PI/180,o=open[k]*R*.9;
    const inn=[24+o*Math.cos(mid),24+o*Math.sin(mid)],pd=(-90+60+rot+k*60)*Math.PI/180,px=push[k]*Math.cos(pd),py=push[k]*Math.sin(pd);
    out+=poly([a,b,inn].map(p=>[p[0]+px,p[1]+py]),`fill="${cols[k]}" stroke="#fff" stroke-width="1" stroke-linejoin="round"`);}
  return back+`<g transform="translate(${dx} 0)">${out}</g>`+front;
}
// 8a Roll — rounded Reuleaux triangle with a core
function Rx(s,t){
  let rot=0,body=NAVY,core='#8FB0FF',cx=0,cy=0,cr=4.2,dx=0,back='',front='',sc=1;
  switch(s){
    case 'idle': rot=3*Math.sin(TAU*t/5); cr=4.2+.5*Math.sin(TAU*t/4); break;
    case 'thinking': rot=t*90; cx=1.6*Math.cos(-TAU*t/1.5); cy=1.6*Math.sin(-TAU*t/1.5); break;
    case 'listening': body=BLUE; core='#D6E2FF'; cr=3+4*wave(t,0); break;
    case 'helping': {const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eio(seg(p,.6,1));rot=90;cx=6*e;core=BLUE;body=NAVY;break;}
    case 'working': rot=120*(Math.floor(t/.9)+eio(seg(ph(t,.9),0,.5))); cr=4.2+1.2*Math.sin(Math.PI*seg(ph(t,.9),0,.5)); break;
    case 'success': {const p=ph(t,3);body=GREEN;core='none';front=`<path d="M18.8 24.8L22.6 28.4L29.6 21" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-eio(seg(p,.15,.45))}" opacity="${1-seg(p,.88,1)}"/>`;break;}
    case 'error': dx=shake(t); core=RED; break;
    case 'waiting': body=GREY; core=NAVY; cx=2.2*Math.cos(TAU*t/3); cy=2.2*Math.sin(TAU*t/3); cr=3; break;
    case 'attention': body=BLUE; core='#fff'; back=`<circle cx="24" cy="24" r="${19+6*eo(ph(t,1.8))}" fill="none" stroke="${BLUE}" stroke-width="${2*(1-ph(t,1.8))+.3}" opacity="${.55*(1-ph(t,1.8))}"/>`; break;
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));sc=1-.7*e;if(e>.9){body=GREY;core='none';}break;}
  }
  const Rr=13.5,v=[0,1,2].map(k=>{const a=(-90+k*120)*Math.PI/180;return[24+Rr*Math.cos(a),25+Rr*Math.sin(a)];}),sd=Rr*Math.sqrt(3);
  const d=`M${v[0]}A${sd} ${sd} 0 0 1 ${v[1]}A${sd} ${sd} 0 0 1 ${v[2]}A${sd} ${sd} 0 0 1 ${v[0]}Z`;
  return back+`<g transform="translate(${dx} 0) translate(24 25) scale(${sc}) rotate(${rot}) translate(-24 -25)"><path d="${d}" fill="${body}" stroke="${body}" stroke-width="5" stroke-linejoin="round"/></g>${core!=='none'?`<circle cx="${24+cx+dx}" cy="${25+cy}" r="${cr*sc}" fill="${core}"/>`:''}`+front;
}
// 8b Tiles — 2×2 soft squares
function Tl(s,t){
  const slots=[[-1,-1],[1,-1],[1,1],[-1,1]];
  let off=8,size=13,cols=[BLUE,NAVY,NAVY,SLATE],dxs=[0,0,0,0],dys=[0,0,0,0],scs=[1,1,1,1],rot=0,dx=0,back='',front='',hide=-1,mv=null;
  switch(s){
    case 'idle': scs[0]=1+.05*Math.sin(TAU*t/4); break;
    case 'thinking': rot=t*60; off=8.6; break;
    case 'listening': scs=scs.map((_,i)=>.75+.35*wave(t,i)); cols=[BLUE,'#3D6CF0','#2F4BB8',BLUE]; break;
    case 'helping': {const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eio(seg(p,.6,1));dxs[1]=dxs[2]=3.5*e;cols[1]=cols[2]=BLUE;cols[0]=NAVY;break;}
    case 'working': {const n=Math.floor(t/.7),p=eio(seg(ph(t,.7),0,.6));hide=n%4;const src=(n+1)%4;cols=[NAVY,NAVY,NAVY,NAVY];mv={from:src,to:hide,p};break;}
    case 'success': {const p=ph(t,3.2),e=eio(seg(p,0,.3))*(1-seg(p,.9,1));off=lerp(8,6.6,e);if(e>.5)cols=cols.map(()=>GREEN);front=badge(p);break;}
    case 'error': dx=shake(t); cols[2]=RED; dxs[2]=2; dys[2]=2; break;
    case 'waiting': {cols=[GREY,GREY,GREY,GREY];cols[Math.floor(t/.8)%4]=NAVY;break;}
    case 'attention': {const p=ph(t,1.8);off=8+2*Math.sin(Math.PI*seg(p,0,.5));cols=[BLUE,BLUE,'#3D6CF0','#3D6CF0'];break;}
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));off=lerp(8,2.5,e);size=lerp(13,5,e);if(e>.9)cols=cols.map(()=>GREY);break;}
  }
  let out='';
  slots.forEach(([sx,sy],i)=>{if(i===hide)return;let x=24+sx*off+dxs[i],y=24+sy*off+dys[i],col=cols[i];
    if(mv&&i===mv.from){const[tx,ty]=slots[mv.to];x=lerp(x,24+tx*off,mv.p);y=lerp(y,24+ty*off,mv.p);col=BLUE;}
    const z=size*scs[i];out+=`<rect x="${x-z/2}" y="${y-z/2}" width="${z}" height="${z}" rx="${Math.min(3.8,z*.3)}" fill="${col}"/>`;});
  return back+`<g transform="translate(${dx} 0) rotate(${rot} 24 24)">${out}</g>`+front;
}
// 8c Segments — three thick rounded arcs
function Sg(s,t){
  let rot=-90,r=14,w=[7,7,7],len=[80,80,80],cols=[BLUE,NAVY,SLATE],push=[0,0,0],dx=0,back='',front='';
  switch(s){
    case 'idle': rot=-90+t*10; break;
    case 'thinking': rot=-90+t*120; break;
    case 'listening': w=w.map((_,i)=>4.5+5*wave(t,i)); cols=[BLUE,'#3D6CF0',BLUE]; rot=-90+t*10; break;
    case 'helping': {const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eio(seg(p,.6,1));rot=-60;push[0]=3.5*e;cols=[BLUE,NAVY,SLATE];break;}
    case 'working': {rot=-90+t*200;const k=.5+.5*Math.sin(TAU*t/1.2);len=len.map(()=>30+70*k);break;}
    case 'success': {const p=ph(t,3.2),e=eio(seg(p,0,.35))*(1-seg(p,.9,1));len=len.map(()=>lerp(80,119.9,e));if(e>.5)cols=cols.map(()=>GREEN);if(e>.5)front=`<path d="M19.6 24.3L22.8 27.4L28.6 21.2" fill="none" stroke="${GREEN}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-seg(p,.35,.55)}"/>`;break;}
    case 'error': dx=shake(t); cols[1]=RED; push[1]=3; break;
    case 'waiting': {rot=-90+t*20;cols=[GREY,GREY,GREY];cols[Math.floor(t/.9)%3]=NAVY;break;}
    case 'attention': {const p=ph(t,1.8);back=`<circle cx="24" cy="24" r="${19+6*eo(p)}" fill="none" stroke="${BLUE}" stroke-width="${2*(1-p)+.3}" opacity="${.55*(1-p)}"/>`;cols=[BLUE,BLUE,'#3D6CF0'];break;}
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));r=lerp(14,3,e);w=w.map(()=>lerp(7,4,e));if(e>.9)cols=cols.map(()=>GREY);break;}
  }
  let out='';
  [0,1,2].forEach(i=>{const c0=rot+i*120,a0=c0-len[i]/2+ (len[i]>=119?0:0),a1=c0+len[i]/2;const m=c0*Math.PI/180,ox=push[i]*Math.cos(m),oy=push[i]*Math.sin(m);
    const P=a=>[24+ox+r*Math.cos(a*Math.PI/180),24+oy+r*Math.sin(a*Math.PI/180)];const[x0,y0]=P(a0),[x1,y1]=P(a1);
    out+=`<path d="M${x0} ${y0}A${r} ${r} 0 ${a1-a0>180?1:0} 1 ${x1} ${y1}" fill="none" stroke="${cols[i]}" stroke-width="${w[i]}" stroke-linecap="round"/>`;});
  return back+`<g transform="translate(${dx} 0)">${out}</g>`+front;
}
// 8d Pebbles — three circles of different sizes
function Pb(s,t){
  let P=[[19,28,10],[32,21,7],[25,10,4.5]],cols=[NAVY,BLUE,SLATE],rot=0,dx=0,back='',front='',dy=[0,0,0];
  switch(s){
    case 'idle': dy=dy.map((_,i)=>.8*Math.sin(TAU*t/4+i*1.6)); break;
    case 'thinking': rot=t*70; break;
    case 'listening': P=P.map((p,i)=>[p[0],p[1],p[2]*(.85+.3*wave(t,i))]); cols=[BLUE,'#3D6CF0','#6E95FF']; break;
    case 'helping': {const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eio(seg(p,.6,1));P[2]=[lerp(25,40,e),lerp(10,24,e),4.5];cols[2]=BLUE;break;}
    case 'working': {const a=Math.floor(t*2.4)%3,p=ph(t,1/2.4);dy[a]=-3*Math.sin(Math.PI*p);cols=[NAVY,SLATE,SLATE];cols[a]=BLUE;break;}
    case 'success': {const p=ph(t,3.2),e=eio(seg(p,0,.35))*(1-seg(p,.9,1));P=P.map(q=>[lerp(q[0],24,e),lerp(q[1],24,e),lerp(q[2],13,e)]);if(e>.5){cols=cols.map(()=>GREEN);front=`<path d="M18.8 24.5L22.6 28.2L29.4 21" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-seg(p,.35,.55)}"/>`;}break;}
    case 'error': {dx=shake(t);cols[1]=RED;P[1]=[35,25,7];break;}
    case 'waiting': {cols=[GREY,GREY,GREY];cols[Math.floor(t/.9)%3]=NAVY;break;}
    case 'attention': {const p=ph(t,1.8);cols=[BLUE,'#3D6CF0','#6E95FF'];back=`<circle cx="24" cy="22" r="${19+6*eo(p)}" fill="none" stroke="${BLUE}" stroke-width="${2*(1-p)+.3}" opacity="${.55*(1-p)}"/>`;break;}
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.55))*(1-eio(seg(p,.85,1)));P=P.map(q=>[lerp(q[0],24,e),lerp(q[1],30,e),lerp(q[2],q[2]*.35,e)]);if(e>.9)cols=cols.map(()=>GREY);break;}
  }
  const cxm=(P[0][0]+P[1][0]+P[2][0])/3,cym=(P[0][1]+P[1][1]+P[2][1])/3;
  return back+`<g transform="translate(${dx} 0) rotate(${rot} ${cxm} ${cym})">${P.map((q,i)=>`<circle cx="${q[0]}" cy="${q[1]+dy[i]}" r="${q[2]}" fill="${cols[i]}"/>`).join('')}</g>`+front;
}
const soft=(fn,r)=>(s,t,el)=>{ROUND=r*((window.__ae&&window.__ae.soft)??1);try{return fn(s,t,el);}finally{ROUND=0;}};
const PALS={blue:null,
 lavender:{'#1D5BF5':'#6C63F0','#4C7BF7':'#8A82F5','#3D6CF0':'#5E55E6','#6E95FF':'#A39DFA','#8FB0FF':'#B9B4FF','#D6E2FF':'#E3E0FF','#3D5BD0':'#5148D0','#2F4BB8':'#443CB0','#9DB6FA':'#B9B4FF','#2F3A73':'#3B3580'},
 graphite:{'#1D5BF5':'#4A5072','#4C7BF7':'#6A7090','#3D6CF0':'#5A6080','#6E95FF':'#8A90AA','#8FB0FF':'#A6ABC0','#D6E2FF':'#E3E6EE','#3D5BD0':'#525878','#2F4BB8':'#3E4466','#9DB6FA':'#A6ABC0','#2F3A73':'#2E3456'}};
const F={A,B,C,D,E,G,H,I,J,K,L,M,N:N2,K2:soft(K,4),L2:soft(L,3.5),M2:soft(M,3),N3:soft(N2,3.2),Rx,Tl,Sg,Pb};
class AeMark extends HTMLElement{
  static get observedAttributes(){return['d','state'];}
  set d(v){this._d=v;} get d(){return this._d||this.getAttribute('d')||'A';}
  set state(v){if(v!==this._s){this._s=v;if(this.d!=='G')this.t0=performance.now();}} get state(){return this._s||this.getAttribute('state')||'idle';}
  connectedCallback(){
    if(!this.svg){this.style.display='block';this.innerHTML='<svg viewBox="0 0 48 48" width="100%" height="100%" style="display:block;overflow:visible"></svg>';this.svg=this.firstChild;}
    this.t0=this.t0||performance.now();this.vis=true;
    this.io=new IntersectionObserver(e=>{this.vis=e[e.length-1].isIntersecting;});this.io.observe(this);
    const loop=now=>{this.raf=requestAnimationFrame(loop);if(!this.vis||now-(this.last||0)<33)return;const dt=Math.min(.1,(now-(this.last||now))/1000);this.last=now;if(this.t0!==this._t0s){this._t0s=this.t0;this.acc=0;}this.acc=(this.acc||0)+dt*((window.__ae&&window.__ae.speed)||1);this.draw(this.acc);};
    this.draw(0);this.raf=requestAnimationFrame(loop);
  }
  disconnectedCallback(){cancelAnimationFrame(this.raf);this.io&&this.io.disconnect();}
  attributeChangedCallback(n,o,v){if(n==='state')this._s=v;if(n==='d')this._d=v;this.t0=performance.now();}
  draw(t){t=Math.max(0,t);const s=this.state;const pm=PALS[(window.__ae&&window.__ae.palette)||'blue'];let html=s==='construct'?guides()+`<g opacity=".9">${(F[this.d]||A)('idle',0,null)}</g>`:(F[this.d]||A)(s,t,this);if(pm)html=html.replace(/#[0-9A-Fa-f]{6}/g,m=>pm[m.toUpperCase()]||m);this.svg.innerHTML=html;}
}
customElements.define('ae-mark',AeMark);
})();

/* ae-pix */
(()=>{
if(customElements.get('ae-pix'))return;
const OX=2,OY=3,CW=24,CH=20;
const PAL={
  byte:{b:'#1D5BF5',s:'#1546C8',h:'#7FA2FF',o:'#0E1330',e:'#0E1330'},
  hover:{b:'#2A3366',s:'#1B2147',h:'#4F5B98',o:'#0E1330',e:'#9DB6FA'},
  quad:{b:'#6C63F0',s:'#5148D0',h:'#ABA5FF',o:'#0E1330',e:'#0E1330'},
  pip:{b:'#F1F3F9',s:'#C9CFDF',h:'#FFFFFF',o:'#0E1330',e:'#0E1330'}
};
const OV={n:'#0E1330',a:'#6E95FF',g:'#1E9E62',r:'#D6453D',B:'#1D5BF5',j:'#8FB0FF'};
function R(set,x,y,w,h,c='b'){for(let i=0;i<w;i++)for(let j=0;j<h;j++)set.set((x+i)+','+(y+j),c);}
function RR(set,x,y,w,h){R(set,x,y,w,h);[[x,y],[x+w-1,y],[x,y+h-1],[x+w-1,y+h-1]].forEach(([a,b])=>set.delete(a+','+b));}
const legsH=(lg,i)=>(lg===1&&i%2===0)||(lg===2&&i%2===1)?1:2;
const CH_={
  byte:{eyes:[[6,7],[12,7]],build(S,f){const q=f.sq;RR(S,4-q,4+q,12+2*q,8-q);R(S,5,2+q-f.nub,2,2+f.nub);R(S,13,2+q-f.nub,2,2+f.nub);[5,9,13].forEach((x,i)=>R(S,x,12,2,q>1?1:legsH(f.lg,i)));}},
  hover:{eyes:[[7,6],[11,6]],build(S,f){const q=f.sq;RR(S,5-q,3+q,10+2*q,8-q);R(S,4-q,5+q-f.nub,1,3);R(S,15+q,5+q-f.nub,1,3);if(q<2){const w=f.lg===1?2:4;R(S,10-w/2,13,w,1,'J');}}},
  quad:{eyes:[[7,7],[11,7]],build(S,f){const q=f.sq;R(S,7,2+q*2-f.nub,6,11-q*2+f.nub);RR(S,4-q,5+q,12+2*q,5);R(S,8,13,2,legsH(f.lg,0)>1?1:0);R(S,11,13,2,legsH(f.lg,1)>1?1:0);}},
  pip:{eyes:[[7,6],[11,6]],build(S,f){const q=f.sq;RR(S,6-q,3+q,8+2*q,10-q);if(q<2)R(S,9,1+q-f.nub,2,2+f.nub);R(S,5-q,8-f.nub,1,2);R(S,14+q,8-f.nub,1,2);[7,11].forEach((x,i)=>R(S,x,13,2,q>1?1:legsH(f.lg,i)));}}
};
const EX=[[1,-1],[1,0],[1,1],[0,-1],[0,1],[-1,-1],[-1,0],[-1,1]];
function eyePx(type,ex,ey,side){
  switch(type){
    case 'closed':return[[ex,ey+1],[ex+1,ey+1]];
    case 'half':return[[ex,ey+1],[ex+1,ey+1],['L',ex,ey],['L',ex+1,ey]];
    case 'happy':return side?[[ex,ey],[ex+1,ey+1]]:[[ex,ey+1],[ex+1,ey]];
    case 'x':return side?[[ex+1,ey],[ex,ey+1]]:[[ex,ey],[ex+1,ey+1]];
    case 'wide':return[[ex,ey-1],[ex+1,ey-1],[ex,ey],[ex+1,ey],[ex,ey+1],[ex+1,ey+1]];
    case 'dot':return[[ex,ey+1]].map(p=>side?[ex+1,ey+1]:p);
    default:return[[ex,ey],[ex+1,ey],[ex,ey+1],[ex+1,ey+1]];
  }
}
const dots=(n,y=0)=>[16,18,20].slice(0,n).map(x=>[x,y,'n']);
const bang=(c,x=17,y=-1)=>[[x,y,c],[x,y+1,c],[x,y+2,c],[x,y+4,c]];
const check=n=>[[15,3],[16,4],[17,3],[18,2],[19,1]].slice(0,n).map(p=>[...p,'g']);
const bars=hs=>hs.flatMap((h,i)=>Array.from({length:h},(_,k)=>[-1+i*2,9-k,'a']));
const arrow=o=>[[15+o,8],[16+o,8],[17+o,8],[18+o,8],[17+o,7],[17+o,9],[16+o,6],[16+o,10]].map(p=>[...p,'B']);
const F0={sq:0,lg:0,nub:0};
const STATES={
  idle:{fps:4,frames:[0,0,0,1,1,1,0,0,0,0].map((dy,i)=>({dy,eye:i===8?'closed':'open'}))},
  thinking:{fps:4,frames:[1,2,3,0].map(n=>({eye:'open',ey:-1,ex:1,ov:dots(n)}))},
  listening:{fps:6,frames:[[2,4],[4,2],[3,5],[5,3],[2,3],[4,5]].map(h=>({eye:'open',nub:1,ov:bars(h)}))},
  helping:{fps:4,frames:[0,1,1,0].map(o=>({eye:'open',ex:1,dx:o,ov:arrow(o)}))},
  working:{fps:6,frames:[1,0,2,0].map((lg,i)=>({eye:'half',lg,dy:i%2}))},
  success:{fps:6,frames:[0,-2,-3,-2,0,0,0,0,0].map((dy,i)=>({dy,eye:i>0?'happy':'open',nub:i>0&&i<4?1:0,sq:i===0||i===4?1:0,ov:check(Math.min(5,Math.max(0,i-1)*2))}))},
  error:{fps:8,frames:[-1,1,-1,1,0,0,0,0,0,0,0,0].map(dx=>({dx,eye:'x',ov:bang('r')}))},
  waiting:{fps:2,frames:[{ex:-1,lg:1},{ex:-1},{ex:1,lg:2},{ex:1}].map(f=>({eye:'half',...f}))},
  attention:{fps:6,frames:[0,-1,0,-1,0,0].map((dy,i)=>({dy,eye:'wide',nub:dy?1:0,ov:bang('B',17,-2+dy)}))},
  dismissed:{fps:4,frames:[{sq:0},{sq:1,dy:0},{sq:2,dy:1},{sq:2,dy:1},{sq:2,dy:1},{sq:2,dy:1},{sq:1}].map(f=>({eye:f.sq?'closed':'open',...f}))}
};
function render(c,state,fi){
  const ch=CH_[c]||CH_.byte,pal=PAL[c]||PAL.byte,st=STATES[state]||STATES.idle,fr={...F0,...st.frames[fi%st.frames.length]};
  const S=new Map();ch.build(S,fr);
  const dx=fr.dx||0,dy=fr.dy||0,has=(x,y)=>{const v=S.get(x+','+y);return v==='b';};
  const px=[];
  const outline=new Set();
  S.forEach((v,k)=>{if(v!=='b')return;const[x,y]=k.split(',').map(Number);EX.forEach(([a,b])=>{const kk=(x+a)+','+(y+b);if(!S.has(kk))outline.add(kk);});});
  outline.forEach(k=>{const[x,y]=k.split(',').map(Number);px.push([x,y,pal.o]);});
  let minY=99,minX=99;S.forEach((v,k)=>{if(v!=='b')return;const[x,y]=k.split(',').map(Number);if(y<minY)minY=y;});
  S.forEach((v,k)=>{if(v==='b'){const[x,y]=k.split(',').map(Number);if(y===minY&&x<minX)minX=x;}});
  S.forEach((v,k)=>{const[x,y]=k.split(',').map(Number);let col=pal.b;if(v==='J')col=OV.j;else if(!has(x,y+1))col=pal.s;else if((y===minY+1&&(x===minX+1||x===minX+2))||(y===minY+2&&x===minX))col=pal.h;px.push([x,y,col]);});
  ch.eyes.forEach(([ex,ey],side)=>{const q=fr.sq||0;eyePx(fr.eye,ex+(fr.ex||0),ey+(fr.ey||0)+q,side).forEach(p=>{if(p[0]==='L')px.push([p[1],p[2],pal.s]);else px.push([p[0],p[1],pal.e]);});});
  let out='';
  px.forEach(([x,y,col])=>{out+=`<rect x="${x+OX+dx}" y="${y+OY+dy}" width="1.02" height="1.02" fill="${col}"/>`;});
  (fr.ov||[]).forEach(([x,y,k])=>{out+=`<rect x="${x+OX}" y="${y+OY}" width="1.02" height="1.02" fill="${OV[k]}"/>`;});
  return out;
}
class AePix extends HTMLElement{
  static get observedAttributes(){return['c','state'];}
  set c(v){this._c=v;} get c(){return this._c||this.getAttribute('c')||'byte';}
  set state(v){if(v!==this._s){this._s=v;this.t0=performance.now();}} get state(){return this._s||this.getAttribute('state')||'idle';}
  attributeChangedCallback(n,o,v){if(n==='state')this._s=v;if(n==='c')this._c=v;this.t0=performance.now();}
  connectedCallback(){
    if(!this.svg){this.style.display='block';this.innerHTML=`<svg viewBox="0 0 ${CW} ${CH}" width="100%" height="100%" shape-rendering="crispEdges" style="display:block"></svg>`;this.svg=this.firstChild;}
    this.t0=this.t0||performance.now();this.vis=true;
    this.io=new IntersectionObserver(e=>{this.vis=e[e.length-1].isIntersecting;});this.io.observe(this);
    const loop=now=>{this.raf=requestAnimationFrame(loop);if(!this.vis)return;const st=STATES[this.state]||STATES.idle;const fi=Math.floor((now-this.t0)/1000*st.fps);const key=this.c+this.state+fi;if(key===this.last)return;this.last=key;this.svg.innerHTML=render(this.c,this.state,fi);};
    this.raf=requestAnimationFrame(loop);
  }
  disconnectedCallback(){cancelAnimationFrame(this.raf);this.io&&this.io.disconnect();}
}
customElements.define('ae-pix',AePix);
})();

/* ae-peek */
(()=>{
if(customElements.get('ae-peek'))return;
const NAVY='#141A3A',BLUE='#1D5BF5',GREEN='#1E9E62',RED='#D6453D',EDGE='#C9CDDA',TAU=Math.PI*2;
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k,ph=(t,T)=>(t%T)/T,seg=(p,a,b)=>cl((p-a)/(b-a));
const eo=p=>1-Math.pow(1-p,3),eio=p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
const blink=(t,T)=>{const p=ph(t,T);return p<.07?1-Math.sin(p/.07*Math.PI)*.9:1;};
const rpoly=(pts,r)=>{const n=pts.length,f=v=>v.toFixed(2);const A=[],B=[];for(let i=0;i<n;i++){const p=pts[(i-1+n)%n],c=pts[i],q=pts[(i+1)%n];const l1=Math.hypot(p[0]-c[0],p[1]-c[1]),l2=Math.hypot(q[0]-c[0],q[1]-c[1]);A.push([c[0]+(p[0]-c[0])/l1*r,c[1]+(p[1]-c[1])/l1*r]);B.push([c[0]+(q[0]-c[0])/l2*r,c[1]+(q[1]-c[1])/l2*r]);}let d=`M${f(B[n-1][0])} ${f(B[n-1][1])}`;for(let i=0;i<n;i++)d+=`L${f(A[i][0])} ${f(A[i][1])}Q${f(pts[i][0])} ${f(pts[i][1])} ${f(B[i][0])} ${f(B[i][1])}`;return d+'Z';};
const EDGE_Y=34;
const V={
  dome:{col:BLUE,eyeY:12,eyeX:5,eye:'oval',hands:8,max:22,body:(cx,top)=>`<path d="M${cx-13} ${top+13}A13 13 0 0 1 ${cx+13} ${top+13}V${top+44}H${cx-13}Z" fill="${BLUE}"/>`},
  pent:{col:'#2A3570',eyeY:15.5,eyeX:5.5,eye:'pupil',hands:9,max:22,body:(cx,top)=>{const c=[cx,top+16.5],pts=[0,1,2,3,4].map(k=>{const a=(-90+k*72)*Math.PI/180;return[c[0]+17*Math.cos(a),c[1]+17*Math.sin(a)];});return `<path d="${rpoly(pts,4.5)}" fill="#2A3570"/><rect x="${cx-12}" y="${top+22}" width="24" height="20" fill="#2A3570"/>`;}},
  tile:{col:'#6C63F0',eyeY:12,eyeX:5.5,eye:'pill',hands:9,max:22,body:(cx,top)=>`<rect x="${cx-14}" y="${top}" width="28" height="44" rx="10" fill="#6C63F0"/>`},
  halo:{col:NAVY,eyeY:11.5,eyeX:4.5,eye:'pupil',hands:0,max:20,ring:true,body:(cx,top)=>`<circle cx="${cx}" cy="${top+12.5}" r="12.5" fill="#232C5E"/><rect x="${cx-12.5}" y="${top+12.5}" width="25" height="30" fill="#232C5E"/>`}
};
const RISE={idle:9,thinking:15,listening:16,helping:15,working:13,success:20,error:10,waiting:7,attention:21,dismissed:-2};
let uid=0;
function render(v,s,t,el){
  const D=V[v]||V.dome;
  let rise=RISE[s]??9,dx=0,look=[0,0],eyeT='open',sy=1,es=1,hl={x:0,y:0},hr={x:0,y:0},ov='',ring=null,hs=1,body=D.col;
  switch(s){
    case 'idle': sy=blink(t,4.5); look=[.6*Math.sin(t*.6),0]; break;
    case 'thinking': look=[1,-1]; sy=blink(t,5); ring={a0:t*200,len:100,col:BLUE}; break;
    case 'listening': es=1.15; rise+=1.2*Math.abs(Math.sin(t*5))*(.6+.4*Math.sin(t*2.1)); ring={a0:0,len:360,col:'#6E95FF',w:1+1.2*Math.abs(Math.sin(t*5))}; break;
    case 'helping': {const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eio(seg(p,.6,1));look=[1.4,0];dx=2*e;hr={x:6*e,y:-4*e};ring={a0:-30,len:60,col:BLUE};break;}
    case 'working': {sy=.45;const k=Math.floor(t*5)%2;hl.y=k?-1.6:0;hr.y=k?0:-1.6;const p=.5+.5*Math.sin(TAU*t/1.2);ring={a0:t*260,len:40+120*p,col:BLUE};break;}
    case 'success': {const p=ph(t,2.4);rise+=5*Math.sin(Math.PI*seg(p,0,.3));eyeT='happy';ring={a0:0,len:360*eio(seg(p,.1,.4)),col:GREEN};break;}
    case 'error': {const p=ph(t,2.6);dx=p<.25?Math.sin(p*TAU*12)*1.2*(1-p/.25):0;eyeT='flat';ring={a0:-90,len:360,col:RED,w:1.6};break;}
    case 'waiting': {eyeT='half';look=[Math.sign(Math.sin(t*.8)),.5];ring={a0:t*30,len:40,col:'#B9BECD'};break;}
    case 'attention': {const p=ph(t,1.6);rise+=2.5*Math.abs(Math.sin(Math.PI*seg(p,0,.35)));es=1.2;hl.x=-2;hr.x=2;ring={a0:0,len:360,col:BLUE,w:1.4+1.2*(1-p)};break;}
    case 'dismissed': {eyeT='closed';hs=0;break;}
  }
  if(el){el._r=el._r==null?rise:lerp(el._r,rise,.14);el._hs=el._hs==null?hs:lerp(el._hs,hs,.1);rise=el._r;hs=el._hs;}
  const cx=32+dx,top=EDGE_Y-rise;
  const id='pk'+(el?(el._id||(el._id=++uid)):0);
  let face='';
  [-1,1].forEach(side=>{const ex=cx+side*D.eyeX,ey=top+D.eyeY;
    if(eyeT==='happy'){face+=`<path d="M${ex-2.6} ${ey+1}Q${ex} ${ey-2.6} ${ex+2.6} ${ey+1}" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`;return;}
    if(eyeT==='flat'||eyeT==='closed'){face+=`<path d="M${ex-2.4} ${ey+(eyeT==='flat'?.4:1)}H${ex+2.4}" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`;return;}
    const ys=(eyeT==='half'?.5:sy),oy=eyeT==='half'?1.2:0,lx=look[0],ly=look[1];
    let g='';
    if(D.eye==='oval')g=`<ellipse cx="${ex+lx*1.3}" cy="${ey+ly*1.3}" rx="${2.2*es}" ry="${3.2*es}" fill="#fff"/>`;
    else if(D.eye==='pill')g=`<rect x="${ex+lx*1.2-1.4*es}" y="${ey+ly*1.2-2.8*es}" width="${2.8*es}" height="${5.6*es}" rx="${1.4*es}" fill="#fff"/>`;
    else {const r=(v==='halo'?2.7:3.1)*es;g=`<circle cx="${ex}" cy="${ey}" r="${r}" fill="#fff"/><circle cx="${ex+lx*1.1}" cy="${ey+ly*1.1}" r="${r*.5}" fill="${NAVY}"/>`;}
    face+=`<g transform="translate(0 ${oy}) translate(${ex} ${ey}) scale(1 ${ys}) translate(${-ex} ${-ey})">${g}</g>`;});
  let ringS='';
  if(D.ring&&ring){const c=[cx,top+12.5],r=16.5,w=ring.w||1.4;if(ring.len>=359)ringS=`<circle cx="${c[0]}" cy="${c[1]}" r="${r}" fill="none" stroke="${ring.col}" stroke-width="${w}"/>`;else if(ring.len>0){const a0=ring.a0*Math.PI/180,a1=(ring.a0+ring.len)*Math.PI/180;ringS=`<path d="M${c[0]+r*Math.cos(a0)} ${c[1]+r*Math.sin(a0)}A${r} ${r} 0 ${ring.len>180?1:0} 1 ${c[0]+r*Math.cos(a1)} ${c[1]+r*Math.sin(a1)}" fill="none" stroke="${ring.col}" stroke-width="${w}" stroke-linecap="round"/>`;}}
  if(!D.ring){
    const ox=cx+17,oy=top-1;
    if(s==='thinking')ov=[0,1,2].map(i=>`<circle cx="${ox+i*3.2}" cy="${oy-i*1.2}" r="1.1" fill="${NAVY}" opacity="${Math.floor(t*3)%3>=i?1:.25}"/>`).join('');
    if(s==='waiting')ov=[0,1,2].map(i=>`<circle cx="${ox+i*3.2}" cy="${oy}" r="1" fill="#9EA4B8" opacity="${Math.floor(t*1.4)%3===i?1:.3}"/>`).join('');
    if(s==='success'){const p=ph(t,2.4),k=seg(p,.15,.4);ov=`<g transform="translate(${ox+2} ${oy}) scale(${eo(k)})"><circle r="4.2" fill="${GREEN}"/><path d="M-1.9 .1L-.6 1.4L1.9-1.2" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></g>`;}
    if(s==='error')ov=`<g transform="translate(${ox+2} ${oy})"><circle r="4.2" fill="${RED}"/><path d="M0-2V.4" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><circle cy="1.9" r=".8" fill="#fff"/></g>`;
    if(s==='attention'){const p=ph(t,1.6);ov=`<circle cx="${cx}" cy="${top+12}" r="${15+7*eo(p)}" fill="none" stroke="${BLUE}" stroke-width="${1.6*(1-p)+.2}" opacity="${.5*(1-p)}"/>`;}
    if(s==='listening')ov=[1,2].map(i=>{const a=.5+.5*Math.sin(t*5-i);return `<path d="M${cx+14+i*3} ${top+8}q${2} ${4} 0 ${8}" fill="none" stroke="${BLUE}" stroke-width="1.3" stroke-linecap="round" opacity="${a}"/><path d="M${cx-14-i*3} ${top+8}q${-2} ${4} 0 ${8}" fill="none" stroke="${BLUE}" stroke-width="1.3" stroke-linecap="round" opacity="${a}"/>`;}).join('');
    if(s==='helping'){const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eio(seg(p,.6,1));ov=`<path d="M${cx+22+2*e} ${EDGE_Y-9}l3 3l-3 3" fill="none" stroke="${BLUE}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="${e}"/>`;}
  }
  let hands='';
  if(D.hands){const hy=EDGE_Y-2.4+(1-hs)*6;[[-1,hl],[1,hr]].forEach(([side,h])=>{const x=cx+side*D.hands+h.x;hands+=`<rect x="${x-4}" y="${hy+h.y}" width="8" height="4.6" rx="2.3" fill="${NAVY}" opacity="${cl(hs*1.4)}"/>`;});}
  return `<defs><clipPath id="${id}"><rect x="-10" y="-20" width="84" height="${EDGE_Y+20}"/></clipPath></defs>${ov}<g clip-path="url(#${id})">${ringS}${D.body(cx,top)}${face}</g><rect x="6" y="${EDGE_Y-1.3}" width="52" height="2.6" rx="1.3" fill="${EDGE}"/>${hands}`;
}
class AePeek extends HTMLElement{
  static get observedAttributes(){return['v','state'];}
  set v(x){this._v=x;} get v(){return this._v||this.getAttribute('v')||'dome';}
  set state(x){if(x!==this._s){this._s=x;this.t0=performance.now();}} get state(){return this._s||this.getAttribute('state')||'idle';}
  attributeChangedCallback(n,o,x){if(n==='state')this._s=x;if(n==='v')this._v=x;this.t0=performance.now();}
  connectedCallback(){
    if(!this.svg){this.style.display='block';this.innerHTML='<svg viewBox="0 0 64 48" width="100%" height="100%" style="display:block;overflow:visible"></svg>';this.svg=this.firstChild;}
    this.t0=this.t0||performance.now();this.vis=true;
    this.io=new IntersectionObserver(e=>{this.vis=e[e.length-1].isIntersecting;});this.io.observe(this);
    const loop=now=>{this.raf=requestAnimationFrame(loop);if(!this.vis||now-(this.last||0)<33)return;this.last=now;this.svg.innerHTML=render(this.v,this.state,Math.max(0,(now-this.t0)/1000),this);};
    this.raf=requestAnimationFrame(loop);
  }
  disconnectedCallback(){cancelAnimationFrame(this.raf);this.io&&this.io.disconnect();}
}
customElements.define('ae-peek',AePeek);
})();

/* ae-bitsy */
(()=>{
if(customElements.get('ae-bitsy'))return;
const NAVY='#141A3A',W='#FFFFFF',LAV='#6C63F0',LAV2='#A39DFA',BLUE='#1D5BF5',GREEN='#1E9E62',RED='#D6453D',GREY='#9EA4B8';
const CW=20,CH=18;
const V={
  classic:{b:BLUE,s:'#1546C8',eyes:[[6,8],[12,8]],mouth:[9,11],node:[12,2],
    body(P,f,q){rect(P,4,6+q,12,8-q,this.b);rect(P,15,6+q,1,8-q,this.s);rect(P,4,13,12,1,this.s);},
    ant(P,f,q){const l=f.ant||0;P.push([10,5+q,NAVY],[11-l,4+q,NAVY]);return[12-l,2+q];},
    legs(P,f){[[5,0],[13,1]].forEach(([x,i])=>{const up=(f.legs===1&&i===0)||(f.legs===2&&i===1);if(!up)P.push([x,14,this.b],[x+1,14,this.b]);P.push([x,up?14:15,NAVY],[x+1,up?14:15,NAVY]);});}},
  hub:{b:LAV,s:'#5148D0',mc:'#D6E2FF',eyes:[[5,9],[13,9]],mouth:[9,12],node:[9,4],float:true,
    body(P,f,q){rect(P,3,7+q,14,7-q,this.b);rect(P,16,7+q,1,7-q,this.s);rect(P,3,13,14,1,this.s);},
    ant(P,f,q){P.push([9,6+q,NAVY],[10,6+q,NAVY],[8,3+q,NAVY],[7,2+q,NAVY],[11,3+q,NAVY],[12,2+q,NAVY]);return[9,4+q];},
    extra:[[5,0],[13,0]]},
  visor:{b:'#232C5E',s:'#1B2147',eyes:[[7,9],[11,9]],visor:true,node:[9,1],
    body(P,f,q){rect(P,4,5+q,12,10-q,this.b);rect(P,15,5+q,1,10-q,this.s);rect(P,4,14,12,1,this.s);rect(P,5,8+q,10,3,'#0E1330');},
    ant(P,f,q){P.push([9,4+q,'#3A4370'],[10,4+q,'#3A4370']);return[9,2+q];},
    legs(P,f){[[5,0],[12,1]].forEach(([x,i])=>{const up=(f.legs===1&&i===0)||(f.legs===2&&i===1);rect(P,x,up?14:15,3,1,NAVY);});}},
  pent:{b:'#3D5BD0',s:'#2F4BB8',eyes:[[6,9],[12,9]],mouth:[9,12],node:[12,1],
    body(P,f,q){const rows=[[8,4],[6,8],[4,12]];rows.forEach(([x,w],i)=>rect(P,x,5+i+q,w,1,this.b));rect(P,4,8+q,12,6-q,this.b);rect(P,15,7+q,1,7-q,this.s);rect(P,13,6+q,1,1,this.s);rect(P,5,13,10,1,this.s);P.push([4,13,null],[15,13,null]);},
    ant(P,f,q){const l=f.ant||0;P.push([10,4+q,NAVY],[11-l,3+q,NAVY]);return[12-l,1+q];},
    legs(P,f){[[6,0],[12,1]].forEach(([x,i])=>{const up=(f.legs===1&&i===0)||(f.legs===2&&i===1);if(!up)P.push([x,14,this.b],[x+1,14,this.b]);P.push([x,up?14:15,NAVY],[x+1,up?14:15,NAVY]);});}}
};
function rect(P,x,y,w,h,c){for(let i=0;i<w;i++)for(let j=0;j<h;j++)P.push([x+i,y+j,c]);}
const ST={
  idle:{fps:4,f:[0,0,0,0,1,1,0,0,0,0].map((dy,i)=>({dy,eye:i===7?'closed':'open'}))},
  thinking:{fps:3,f:[0,1,0,1].map(k=>({eye:'open',look:[1,0],node:k?LAV2:LAV,ant:k}))},
  listening:{fps:5,f:[1,2,0,1,2,0].map(r=>({eye:'wide',sig:r,node:BLUE}))},
  helping:{fps:4,f:[0,1,1,0].map(o=>({eye:'open',look:[1,1],dx:o,arrow:o}))},
  working:{fps:6,f:[1,0,2,0].map((legs,i)=>({eye:'open',look:[0,1],down:1,legs,dy:i%2,node:i%2?BLUE:LAV}))},
  success:{fps:6,f:[0,-1,-2,-1,0,0,0,0].map(dy=>({dy,eye:'happy',smile:1,node:GREEN}))},
  error:{fps:8,f:[-1,1,-1,1,0,0,0,0,0,0,0,0].map(dx=>({dx,eye:'flat',node:RED,frown:1}))},
  waiting:{fps:2,f:[{look:[0,1],legs:1},{look:[0,1]},{look:[1,1],legs:2},{look:[1,1]}].map((x,i)=>({eye:'half',node:i%2?GREY:'#C9CDDA',...x}))},
  attention:{fps:6,f:[0,-1,0,-1,0,0].map((dy,i)=>({dy,eye:'wide',node:i%2?BLUE:LAV2,sig:i%2?2:1}))},
  dismissed:{fps:4,f:[0,1,2,2,2,2,2,1].map(sq=>({sq,eye:'closed',node:GREY,hideAnt:sq>1}))}
};
function render(v,st,fi){
  const D=V[v]||V.classic,S=ST[st]||ST.idle,f=S.f[fi%S.f.length],q=f.sq||0,P=[],O=[];
  D.body(P,f,q);
  let node=null;if(!f.hideAnt){node=D.ant(P,f,q);}
  const nc=f.node||(v==='hub'?BLUE:LAV);
  if(node){rect(P,node[0],node[1],2,2,nc);if(v==='hub'){rect(P,5,1+q,2,2,nc);rect(P,13,1+q,2,2,nc);}}
  else{P.push([9,5+q,GREY],[10,5+q,GREY]);}
  D.eyes.forEach(([ex,ey],side)=>{ey+=q;const lk=f.look||[side?1:1,1];
    if(D.visor){const c='#8FB0FF';if(f.eye==='closed'||f.eye==='flat')rect(P,ex,ey+(f.eye==='flat'?0:1),2,1,c==='x'?c:'#3A4370');else if(f.eye==='happy'){P.push([ex,ey,c],[ex+1,ey-1,c]);P.push([ex+1,ey,c]);}else if(f.eye==='wide')rect(P,ex,ey-1,2,3,c);else if(f.eye==='half')rect(P,ex,ey+1,2,1,c);else rect(P,ex+(f.look?f.look[0]-0:0)-(f.look?0:0),ey,2,2,c);return;}
    switch(f.eye){
      case 'closed':rect(P,ex,ey+1,2,1,NAVY);break;
      case 'flat':rect(P,ex,ey+1,2,1,NAVY);break;
      case 'happy':P.push([ex,ey+1,NAVY],[ex+1,ey,NAVY]);if(side)P.splice(P.length-2,2,[ex,ey,NAVY],[ex+1,ey+1,NAVY]);break;
      case 'half':rect(P,ex,ey+1,2,1,W);P.push([ex+lk[0],ey+1,NAVY]);break;
      case 'wide':rect(P,ex,ey-1,2,3,W);P.push([ex+lk[0],ey,NAVY]);break;
      default:rect(P,ex,ey,2,2,W);P.push([ex+lk[0],ey+lk[1],NAVY]);
    }});
  if(D.mouth){const[mx,my0]=D.mouth,my=my0+q,LAV=D.mc||'#6C63F0';
    if(f.smile){P.push([mx-1,my-1,LAV],[mx,my,LAV],[mx+1,my,LAV],[mx+2,my-1,LAV]);}
    else if(f.frown){P.push([mx-1,my,LAV],[mx,my-1,LAV],[mx+1,my-1,LAV],[mx+2,my,LAV]);}
    else if(f.eye==='wide')rect(P,mx,my-1,2,2,LAV);
    else rect(P,mx,my,2,1,LAV);}
  if(D.legs)D.legs(P,f);
  if(D.float){const dy=f.dy||0;rect(O,6,16,8,1,'#D5D9E6');}
  if(f.sig&&node){const[nx,ny]=node;const r=f.sig;[[nx-r,ny],[nx+1+r,ny],[nx-r,ny+1],[nx+1+r,ny+1],[nx,ny-r],[nx+1,ny-r]].forEach(p=>O.push([p[0]+(f.dx||0),p[1]+(f.dy||0),'#8FB0FF']));}
  if(f.arrow!=null){const ax=17+f.arrow;[[ax,9],[ax+1,10],[ax,11]].forEach(p=>O.push([p[0],p[1],BLUE]));}
  const dx=f.dx||0,dy=f.dy||0,seen=new Map();
  P.forEach(([x,y,c])=>{const isLeg=y>=14&&!D.float&&v!=='visor'?false:false;seen.set(x+','+y,c);});
  let out='';
  seen.forEach((c,k)=>{if(!c)return;const[x,y]=k.split(',').map(Number);const leg=!D.float&&y>=(v==='visor'?15:14)&&!(v==='visor'&&y===14&&c!==NAVY);out+=`<rect x="${x+dx}" y="${y+(leg?Math.max(0,dy):dy)}" width="1.02" height="1.02" fill="${c}"/>`;});
  O.forEach(([x,y,c])=>{out+=`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${c}"/>`;});
  return out;
}
class AeBitsy extends HTMLElement{
  static get observedAttributes(){return['v','state'];}
  set v(x){this._v=x;} get v(){return this._v||this.getAttribute('v')||'classic';}
  set state(x){if(x!==this._s){this._s=x;this.t0=performance.now();}} get state(){return this._s||this.getAttribute('state')||'idle';}
  attributeChangedCallback(n,o,x){if(n==='state')this._s=x;if(n==='v')this._v=x;this.t0=performance.now();}
  connectedCallback(){
    if(!this.svg){this.style.display='block';this.innerHTML=`<svg viewBox="0 0 ${CW} ${CH}" width="100%" height="100%" shape-rendering="crispEdges" style="display:block"></svg>`;this.svg=this.firstChild;}
    this.t0=this.t0||performance.now();this.vis=true;
    this.io=new IntersectionObserver(e=>{this.vis=e[e.length-1].isIntersecting;});this.io.observe(this);
    const loop=now=>{this.raf=requestAnimationFrame(loop);if(!this.vis)return;const S=ST[this.state]||ST.idle;const fi=Math.max(0,Math.floor((now-this.t0)/1000*S.fps));const key=this.v+this.state+fi;if(key===this.last)return;this.last=key;this.svg.innerHTML=render(this.v,this.state,fi);};
    this.raf=requestAnimationFrame(loop);
  }
  disconnectedCallback(){cancelAnimationFrame(this.raf);this.io&&this.io.disconnect();}
}
customElements.define('ae-bitsy',AeBitsy);
})();

/* ae-bitsoft */
(()=>{
if(customElements.get('ae-bitsoft'))return;
const NAVY='#141A3A',LAV='#6C63F0',LAV2='#A39DFA',BLUE='#1D5BF5',GREEN='#1E9E62',RED='#D6453D',GREY='#9EA4B8',TAU=Math.PI*2;
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k,ph=(t,T)=>(t%T)/T,seg=(p,a,b)=>cl((p-a)/(b-a));
const eo=p=>1-Math.pow(1-p,3),eio=p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
const blink=(t,T)=>{const p=ph(t,T);return p<.07?1-Math.sin(p/.07*Math.PI)*.9:1;};
const rr=(x,y,w,h,r,c,ex='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}" ${ex}/>`;
const rpoly=(pts,r)=>{const n=pts.length;const A=[],B=[];for(let i=0;i<n;i++){const p=pts[(i-1+n)%n],c=pts[i],q=pts[(i+1)%n];const l1=Math.hypot(p[0]-c[0],p[1]-c[1]),l2=Math.hypot(q[0]-c[0],q[1]-c[1]);A.push([c[0]+(p[0]-c[0])/l1*r,c[1]+(p[1]-c[1])/l1*r]);B.push([c[0]+(q[0]-c[0])/l2*r,c[1]+(q[1]-c[1])/l2*r]);}let d=`M${B[n-1][0]} ${B[n-1][1]}`;for(let i=0;i<n;i++)d+=`L${A[i][0]} ${A[i][1]}Q${pts[i][0]} ${pts[i][1]} ${B[i][0]} ${B[i][1]}`;return d+'Z';};
const V={
  classic:{b:BLUE,s:'#1546C8',mc:LAV,eyes:[[7,9],[13,9]],es:2.4,mouth:[10,11.8],bottom:14,
    body:(b,s)=>rr(4,6.6,12,7.8,2.6,s)+rr(4,6,12,7.8,2.6,b),
    ants:[{base:[10.6,6.2],tip:[13.1,3.1],node:'sq'}],feet:[[6,1],[14,1]],stub:true},
  hub:{b:LAV,s:'#5148D0',mc:'#D6E2FF',eyes:[[6.2,10],[13.8,10]],es:2.4,mouth:[10,12.4],bottom:14,float:true,
    body:(b,s)=>rr(3,7.6,14,6.6,3.3,s)+rr(3,7,14,6.6,3.3,b),
    ants:[{base:[10,7],tip:[10,4.2],node:'hub'}]},
  visor:{b:'#232C5E',s:'#1B2147',eyes:[[8,9.6],[12,9.6]],bar:true,bottom:15,
    body:(b,s)=>rr(4,5.6,12,9.6,3,s)+rr(4,5,12,9.6,3,b)+rr(5,8,10,3.2,1.6,'#0E1330'),
    ants:[{base:[10,5],tip:[10,2.6],node:'dot'}],feet:[[6.5,2],[13.5,2]]},
  pent:{b:'#3D5BD0',s:'#2F4BB8',mc:LAV,eyes:[[7.4,10.2],[12.6,10.2]],es:2.3,mouth:[10,12.8],bottom:14.6,
    body:(b,s)=>{const P=dy=>[0,1,2,3,4].map(k=>{const a=(-90+k*72)*Math.PI/180;return[10+7*Math.cos(a),10.4+dy+7*Math.sin(a)];});return `<path d="${rpoly(P(.6),1.8)}" fill="${s}"/><path d="${rpoly(P(0),1.8)}" fill="${b}"/>`;},
    ants:[{base:[10,3.6],tip:[11.6,1.8],node:'sq'}],feet:[[7.2,1],[12.8,1]]},
  bean:{b:'#4C7BF7',s:'#3D6CF0',mc:'#D6E2FF',eyes:[[8.5,8.2],[11.5,8.2]],es:2,mouth:[10,10.8],bottom:15,
    body:(b,s)=>rr(6,4.6,8,10.6,4,s)+rr(6,4,8,10.6,4,b)+rr(4.9,9,1.6,3,.8,s)+rr(13.5,9,1.6,3,.8,s),
    ants:[{base:[10,4.1],tip:[12.4,1.7],node:'dot',curve:true}],feet:[[8.6,1],[11.4,1]]},
  squat:{b:'#2A3570',s:'#1F2852',mc:'#D6E2FF',eyes:[[5.6,10.6],[14.4,10.6]],es:2.4,mouth:[10,12.4],bottom:14.2,
    body:(b,s)=>rr(2.5,8.6,15,5.8,2.9,s)+rr(2.5,8,15,5.8,2.9,b),
    ants:[{base:[6,8.1],tip:[4.4,5.4],node:'dot'},{base:[14,8.1],tip:[15.6,5.4],node:'dot'}],feet:[[5,1],[10,1],[15,1]]}
};
function render(v,s,t,el){
  const D=V[v]||V.classic;
  let dy=0,dx=0,eye='open',look=[0,0],sy=1,node=v==='hub'?BLUE:LAV,sway=0,sig=0,arrow=-1,lift=[0,0,0],sq=0,smile=0,frown=0,ring=0,wide=0,antDown=0;
  switch(s){
    case 'idle': dy=.25*Math.sin(TAU*t/3.5); sy=blink(t,4.5); look=[.3*Math.sin(t*.6),0]; break;
    case 'thinking': look=[.5,-.5]; sy=blink(t,5); sway=10*Math.sin(TAU*t/1.8); node=Math.sin(TAU*t/1.2)>0?LAV2:LAV; break;
    case 'listening': wide=1; sig=ph(t,1); node=BLUE; break;
    case 'helping': {const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eio(seg(p,.6,1));dx=.9*e;look=[.6,0];arrow=e;sway=-8*e;break;}
    case 'working': {const k=Math.floor(t*5)%2;lift=[k?1:0,k?0:1,k?1:0];dy=.3*Math.abs(Math.sin(t*5*Math.PI/1));look=[0,.5];sy=.8;node=Math.floor(t*4)%2?BLUE:LAV;break;}
    case 'success': {const p=ph(t,2.4);dy=-2*Math.sin(Math.PI*seg(p,0,.3));eye='happy';smile=1;node=GREEN;sway=6*Math.sin(Math.PI*seg(p,0,.3));break;}
    case 'error': {const p=ph(t,2.6);dx=p<.25?Math.sin(p*TAU*12)*.6*(1-p/.25):0;eye='flat';frown=1;node=RED;break;}
    case 'waiting': eye='half'; look=[Math.sign(Math.sin(t*.8))*.5,.3]; node=Math.sin(TAU*t/2.4)>0?GREY:'#C9CDDA'; break;
    case 'attention': {const p=ph(t,1.4);dy=-1*Math.abs(Math.sin(Math.PI*seg(p,0,.35)));wide=1;node=BLUE;ring=p;break;}
    case 'dismissed': {const p=ph(t,3.2),e=eio(seg(p,.1,.5))*(1-eio(seg(p,.85,1)));sq=e;eye=e>.3?'closed':'open';node=GREY;antDown=e;break;}
  }
  const B=D.bottom,syB=1-.28*sq,sxB=1+.08*sq;
  const T=`translate(${10+dx} ${B}) scale(${sxB} ${syB}) translate(-10 ${-B}) translate(0 ${dy})`;
  let out='';
  if(D.float)out+=`<ellipse cx="${10+dx}" cy="16.6" rx="${5.5+dy*.6}" ry=".7" fill="#D5D9E6"/>`;
  if(D.feet){D.feet.forEach(([x,w],i)=>{const up=lift[i%3]?.8:0;if(D.stub)out+=rr(x-1+dx,B-.4-up,2,1.6,.6,D.b);out+=rr(x-1.4+dx,B+.9-up,2.8,1.4,.7,NAVY);});}
  let g='';
  D.ants.forEach((a,i)=>{const sgn=i?-1:1,ang=(sway*sgn-antDown*40*(a.tip[0]>=a.base[0]?-1:1))*Math.PI/180;const vx=a.tip[0]-a.base[0],vy=a.tip[1]-a.base[1];const k=1-antDown*.4;
    const tx=a.base[0]+(vx*Math.cos(ang)-vy*Math.sin(ang))*k,ty=a.base[1]+(vx*Math.sin(ang)+vy*Math.cos(ang))*k;
    const sc=v==='visor'?'#3A4370':NAVY;
    g+=a.curve?`<path d="M${a.base[0]} ${a.base[1]}Q${a.base[0]} ${ty-.4} ${tx} ${ty}" fill="none" stroke="${sc}" stroke-width=".9" stroke-linecap="round"/>`:`<path d="M${a.base[0]} ${a.base[1]}L${tx} ${ty}" stroke="${sc}" stroke-width=".9" stroke-linecap="round"/>`;
    if(a.node==='hub'){[[-3.6,-2.2],[3.6,-2.2]].forEach(([ox,oy])=>{g+=`<path d="M${tx} ${ty}L${tx+ox} ${ty+oy}" stroke="${NAVY}" stroke-width=".8" stroke-linecap="round"/><circle cx="${tx+ox}" cy="${ty+oy}" r="1" fill="${node}"/>`;});g+=`<circle cx="${tx}" cy="${ty}" r="1.3" fill="${node}"/>`;}
    else if(a.node==='sq')g+=rr(tx-1.1,ty-1.1,2.2,2.2,.7,node);
    else g+=`<circle cx="${tx}" cy="${ty}" r="1.15" fill="${node}"/>`;
    if(sig)[0,.5].forEach(o=>{const p=(sig+o)%1;g+=`<circle cx="${tx}" cy="${ty}" r="${1.4+2.4*p}" fill="none" stroke="#8FB0FF" stroke-width=".45" opacity="${1-p}"/>`;});
    if(ring)g+=`<circle cx="${tx}" cy="${ty}" r="${1.4+3*eo(ring)}" fill="none" stroke="${BLUE}" stroke-width="${.7*(1-ring)+.1}" opacity="${1-ring}"/>`;});
  g+=D.body(D.b,D.s);
  D.eyes.forEach(([ex,ey],side)=>{
    if(D.bar){const c='#8FB0FF';if(eye==='closed'||eye==='flat')g+=rr(ex-1.1,ey+.1,2.2,.6,.3,eye==='flat'?c:'#3A4370');else if(eye==='happy')g+=`<path d="M${ex-1} ${ey+.5}Q${ex} ${ey-.9} ${ex+1} ${ey+.5}" fill="none" stroke="${c}" stroke-width=".7" stroke-linecap="round"/>`;else{const h=(wide?1.9:eye==='half'?.6:1.2)*(eye==='half'?1:sy);g+=rr(ex-1.1+look[0]*.5,ey+.4-h/2+(eye==='half'?.3:0),2.2,h,Math.min(.6,h/2),c);}return;}
    const es=D.es*(wide?1.15:1),r0=es*.3;
    if(eye==='happy'){g+=`<path d="M${ex-es/2} ${ey+.4}Q${ex} ${ey-es*.6} ${ex+es/2} ${ey+.4}" fill="none" stroke="#fff" stroke-width=".75" stroke-linecap="round"/>`;return;}
    if(eye==='flat'||eye==='closed'){g+=rr(ex-es/2,ey+.1,es,.7,.35,eye==='flat'?'#fff':NAVY);return;}
    const h=eye==='half'?es*.5:es*sy,yy=eye==='half'?ey:ey-h/2;
    g+=rr(ex-es/2,yy,es,h,Math.min(r0,h/2),'#fff')+`<circle cx="${ex+look[0]*es*.3}" cy="${(eye==='half'?ey+h/2:ey)+look[1]*es*.25}" r="${es*.24*(eye==='half'?.8:1)}" fill="${NAVY}" ${h<.5?'opacity="0"':''}/>`;});
  if(D.mouth){const[mx,my]=D.mouth,c=D.mc;
    if(smile)g+=`<path d="M${mx-1.4} ${my-.4}Q${mx} ${my+1.2} ${mx+1.4} ${my-.4}" fill="none" stroke="${c}" stroke-width=".8" stroke-linecap="round"/>`;
    else if(frown)g+=`<path d="M${mx-1.2} ${my+.6}Q${mx} ${my-.6} ${mx+1.2} ${my+.6}" fill="none" stroke="${c}" stroke-width=".8" stroke-linecap="round"/>`;
    else if(wide)g+=`<ellipse cx="${mx}" cy="${my}" rx=".9" ry=".8" fill="${c}"/>`;
    else g+=rr(mx-1.2,my-.45,2.4,.9,.45,c);}
  out+=`<g transform="${T}">${g}</g>`;
  if(arrow>0)out+=`<path d="M${17.6+arrow} 8.6l1.4 1.4l-1.4 1.4" fill="none" stroke="${BLUE}" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round" opacity="${arrow}"/>`;
  return out;
}
const PAL=['#141A3A','#6C63F0','#A39DFA','#1D5BF5','#1E9E62','#D6453D','#9EA4B8','#C9CDDA','#0E1330','#3A4370','#8FB0FF','#D5D9E6','#FFFFFF','#1546C8','#5148D0','#D6E2FF','#232C5E','#1B2147','#3D5BD0','#2F4BB8','#4C7BF7','#3D6CF0','#2A3570','#1F2852'].map(h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16)));
const CACHE=new Map(),PEND=new Map(),SNAP=new Map();
const LOOP={idle:9,thinking:3.6,listening:1,helping:2.2,working:2,success:2.4,error:2.6,waiting:7.8,attention:1.4,dismissed:3.2};
function raster(v,s,fi,res,cb){const key=v+'|'+s+'|'+fi+'|'+res;if(CACHE.has(key))return cb(CACHE.get(key));if(PEND.has(key)){PEND.get(key).push(cb);return;}PEND.set(key,[cb]);Q.push(()=>build(v,s,fi,res,key));pump();}
const Q=[];let busy=0;
function pump(){while(busy<2&&Q.length){busy++;Q.shift()();}}
function build(v,s,fi,res,key){
  const W=Math.round(22*res),H=Math.round(21*res);const inner=render(v,s,fi/8,null);
  const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(img,0,0,W,H);const d=x.getImageData(0,0,W,H),p=d.data;
    for(let i=0;i<p.length;i+=4){if(p[i+3]<128){p[i+3]=0;continue;}const a=p[i+3]/255,r=p[i]/a,g=p[i+1]/a,b=p[i+2]/a,sk=((r>>3)<<10)|((g>>3)<<5)|(b>>3);let best=SNAP.get(sk);if(best===undefined){let bd=1e9;best=0;for(let k=0;k<PAL.length;k++){const q=PAL[k],dd=(q[0]-r)**2+(q[1]-g)**2+(q[2]-b)**2;if(dd<bd){bd=dd;best=k;}}SNAP.set(sk,best);}p[i]=PAL[best][0];p[i+1]=PAL[best][1];p[i+2]=PAL[best][2];p[i+3]=255;}
    x.putImageData(d,0,0);if(CACHE.size>6000)CACHE.clear();CACHE.set(key,c);(PEND.get(key)||[]).forEach(fn=>fn(c));PEND.delete(key);busy--;setTimeout(pump,0);};img.onerror=()=>{PEND.delete(key);busy--;setTimeout(pump,0);};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -2 22 21" width="'+W+'" height="'+H+'" shape-rendering="geometricPrecision">'+inner+'</svg>');}
class AeBitsoft extends HTMLElement{
  static get observedAttributes(){return['v','state','res','still'];}
  set res(x){this._res=x;} get res(){return parseFloat(this._res||this.getAttribute('res')||0)||0;}
  set v(x){this._v=x;} get v(){return this._v||this.getAttribute('v')||'classic';}
  set state(x){if(x!==this._s){this._s=x;this.t0=performance.now();}} get state(){return this._s||this.getAttribute('state')||'idle';}
  attributeChangedCallback(n,o,x){if(n==='state')this._s=x;if(n==='v')this._v=x;if(n==='res')this._res=x;this.t0=performance.now();}
  connectedCallback(){
    if(!this.svg){this.style.display='block';this.innerHTML='<svg viewBox="0 0 20 18" width="100%" height="100%" style="display:block;overflow:visible"></svg>';this.svg=this.firstChild;}
    this.t0=this.t0||performance.now();this.vis=true;
    this.io=new IntersectionObserver(e=>{this.vis=e[e.length-1].isIntersecting;});this.io.observe(this);
    const loop=now=>{this.raf=requestAnimationFrame(loop);if(!this.vis)return;const t=Math.max(0,(now-this.t0)/1000);const res=this.res;
      if(res){if(!this.cv){this.innerHTML='<canvas style="display:block;width:100%;height:100%;object-fit:contain;image-rendering:pixelated"></canvas>';this.cv=this.firstChild;this.svg=null;}const P=LOOP[this.state]||4,still=this.hasAttribute('still')&&this.getAttribute('still')!=='false',fi=still?5:Math.floor(((now/1000)%P)*8),key=this.v+this.state+fi+res;if(key===this.lk)return;this.lk=key;raster(this.v,this.state,fi,res,c=>{if(this.cv.width!==c.width){this.cv.width=c.width;this.cv.height=c.height;}const x=this.cv.getContext('2d');x.clearRect(0,0,c.width,c.height);x.drawImage(c,0,0);});return;}
      if(!this.svg){this.innerHTML='<svg viewBox="0 0 20 18" width="100%" height="100%" style="display:block;overflow:visible"></svg>';this.svg=this.firstChild;this.cv=null;}
      if(now-(this.last||0)<40)return;this.last=now;this.svg.innerHTML=render(this.v,this.state,t,this);};
    this.raf=requestAnimationFrame(loop);
  }
  disconnectedCallback(){cancelAnimationFrame(this.raf);this.io&&this.io.disconnect();}
}
customElements.define('ae-bitsoft',AeBitsoft);
})();

/* ae-ion */
(()=>{
if(customElements.get('ae-ion'))return;
const OL='#0E1330',BODY='#2A3366',SH='#1B2147',HI='#4F5B98',SCR='#0E1330',GLOW='#9DB6FA',BLUE='#1D5BF5',LAV='#6C63F0',GREEN='#1E9E62',RED='#D6453D';
const CW=28,CH=26,FPS=8;
const VAR={
  ion:{body:[7,5,14,11],cut:1,screen:[8,6,12,8],fins:1,thr:[13]},
  twin:{body:[5,6,18,10],cut:1,screen:[7,7,14,7],handles:1,thr:[8,18]},
  mini:{body:[8,6,12,10],cut:2,screen:[9,7,10,8],pad:1,thr:[],big:1},
  pro:{body:[7,4,14,12],cut:1,screen:[8,6,12,7],fins:1,thr:[13],ant:1},
  orb:{body:[7,4,14,13],cut:3,screen:[9,7,10,7],fins:1,thr:[13]},
  jet:{body:[9,5,10,11],cut:1,screen:[10,6,8,8],pods:1,thr:[]}
};
const set=(M,x,y,c)=>M.set(x+','+y,c);
const rect=(M,x,y,w,h,c)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++)set(M,x+i,y+j,c);};
function eye(M,type,ax,ay,side,g){
  const P=(x,y)=>set(M,ax+x,ay+y,g);
  switch(type){
    case 'blink':P(0,2);P(1,2);break;
    case 'half':P(0,1);P(1,1);P(0,2);P(1,2);break;
    case 'focus':P(-1,1);P(0,1);P(1,1);P(2,1);break;
    case 'happy':P(-1,2);P(0,1);P(1,1);P(2,2);break;
    case 'x':P(-1,0);P(2,0);P(0,1);P(1,1);P(-1,2);P(2,2);break;
    case 'wide':for(let x=-1;x<3;x++)for(let y=-1;y<3;y++)P(x,y);break;
    case 'sad':if(side){P(-1,1);P(0,1);P(1,2);P(2,2);}else{P(-1,2);P(0,2);P(1,1);P(2,1);}break;
    case 'up':P(0,-1);P(1,-1);P(0,0);P(1,0);break;
    case 'off':break;
    default:P(0,0);P(1,0);P(0,1);P(1,1);P(0,2);P(1,2);
  }
}
const loopLen={idle:32,thinking:24,listening:16,helping:16,working:24,success:20,error:24,waiting:32,attention:16,dismissed:28};
function frame(s,fi){
  const f={dy:0,dx:0,tilt:0,eyes:'open',look:[0,0],finL:'mid',finR:'mid',flame:2+(fi%2),glow:GLOW,scr:SCR,ov:[]};
  const k=fi%(loopLen[s]||16);
  switch(s){
    case 'idle': f.dy=[0,0,0,0,1,1,1,1][Math.floor(k/4)%8]; if(k===22||k===23)f.eyes='blink'; f.look=[k>=12&&k<20?1:0,0]; break;
    case 'thinking': {f.eyes='up';f.look=[k<12?-1:1,0];f.tilt=k<12?-.12:.12;f.dots=Math.floor(k/3)%4;f.finL=k<12?'up':'mid';f.finR=k<12?'mid':'up';break;}
    case 'listening': f.eyes='off'; f.wave=k; f.finL=f.finR='up'; f.flame=2; break;
    case 'helping': {const on=k>=3&&k<13;f.look=[1,0];f.dx=on?1:0;f.tilt=on?.14:0;f.finR=on?'out':'mid';if(on)[[0,0],[1,1],[0,2]].forEach(([x,y])=>f.ov.push([24+x+(k%4<2?0:1),9+y,BLUE]));break;}
    case 'working': f.eyes='focus'; f.progress=(k%24)/23; f.finL=k%4<2?'up':'mid'; f.finR=k%4<2?'mid':'up'; f.flame=3+(k%2); f.dy=k%4<2?0:1; break;
    case 'success': {const hop=[0,-1,-2,-3,-3,-2,-1,0];f.dy=k<8?hop[k]:0;f.eyes='happy';f.finL=f.finR='up';f.flame=k<8?4:2;f.glow='#7EDBB0';if(k>=2&&k<14){const sp=k%4<2;[[4,3],[23,4],[3,13],[24,12]].forEach(([x,y],i)=>{if((i%2===0)===sp)f.ov.push([x,y,'#7EDBB0'],[x-1,y,'#7EDBB0'],[x+1,y,'#7EDBB0'],[x,y-1,'#7EDBB0'],[x,y+1,'#7EDBB0']);});}break;}
    case 'error': {f.eyes='x';f.scr='#3A1222';f.glow='#FF8A80';f.finL=f.finR='down';f.tilt=-.1;f.dy=1;f.dx=k<6?(k%2?1:-1):0;f.flame=k%3===0?1:0;if(k%8<5){[[23,1],[23,2],[23,3],[23,5]].forEach(([x,y])=>f.ov.push([x,y,RED]));}break;}
    case 'waiting': {f.eyes='half';f.look=[Math.floor(k/8)%2?1:-1,0];f.glow='#6E7FB8';f.flame=1+(k%4<2?1:0);f.dy=k<16?0:1;f.hour=Math.floor(k/8)%2;break;}
    case 'attention': {f.eyes='wide';const hop=[0,-1,-2,-1,0,0,0,0];f.dy=hop[k%8];f.finL=k%4<2?'up':'mid';f.finR=k%4<2?'mid':'up';f.flame=3;f.glow='#E3ECFF';f.bubble=1;break;}
    case 'dismissed': {const st=Math.min(5,Math.floor(k/3));f.crt=st;f.eyes='off';f.finL=f.finR='down';f.dy=Math.min(2,Math.floor(k/6));f.flame=st<3?1:0;if(k>=24){f.crt=0;f.eyes='open';f.dy=0;f.flame=2;}break;}
  }
  return f;
}
function render(v,s,fi){
  const D=VAR[v]||VAR.ion,f=frame(s,fi),M=new Map(),O=[];
  const[bx,by,bw,bh]=D.body,[sx,sy,sw,sh]=D.screen;
  rect(M,bx,by,bw,bh,BODY);
  const cuts=D.cut===3?[[0,0],[1,0],[2,0],[0,1],[0,2],[1,1]]:D.cut===2?[[0,0],[1,0],[0,1]]:[[0,0]];
  cuts.forEach(([a,b])=>{[[bx+a,by+b],[bx+bw-1-a,by+b],[bx+a,by+bh-1-b],[bx+bw-1-a,by+bh-1-b]].forEach(([x,y])=>M.delete(x+','+y));});
  M.forEach((c,k)=>{const[x,y]=k.split(',').map(Number);if(!M.has(x+','+(y+1))||x===bx+bw-1)M.set(k,SH);});
  [[bx+1+(D.cut-1),by+1],[bx+2+(D.cut-1),by+1],[bx+1,by+2+(D.cut-1)]].forEach(([x,y])=>{if(M.has(x+','+y))set(M,x,y,HI);});
  rect(M,sx,sy,sw,sh,f.scr);
  if(D.cut>=2){[[sx,sy],[sx+sw-1,sy],[sx,sy+sh-1],[sx+sw-1,sy+sh-1]].forEach(([x,y])=>set(M,x,y,BODY));}
  const fin=(side,st)=>{const x0=side<0?bx-2:bx+bw;const mid=by+Math.floor(bh/2)-1;
    if(st==='out'){rect(M,side<0?bx-3:bx+bw,mid,3,2,BODY);return;}
    const y0=st==='up'?mid-2:st==='down'?mid+2:mid;rect(M,x0,y0,2,3,BODY);set(M,x0+(side<0?0:1),y0+2,SH);};
  if(D.fins){fin(-1,f.finL);fin(1,f.finR);}
  if(D.handles){const m=by+3;const up=s=>s==='up'?-1:s==='down'?1:0;rect(M,bx-1,m+up(f.finL),1,3,BODY);rect(M,bx+bw,m+up(f.finR)-(f.finR==='out'?0:0),1,3,BODY);if(f.finR==='out')rect(M,bx+bw,m+1,2,1,BODY);}
  if(D.pods){const mid=by+2;const off=st=>st==='up'?-1:st==='down'?1:st==='out'?-1:0;[[-1,f.finL],[1,f.finR]].forEach(([side,st])=>{const x0=side<0?bx-3:bx+bw+1,y0=mid+off(st);rect(M,x0,y0,2,6,BODY);set(M,x0+1,y0,HI);rect(M,x0,y0+5,2,1,SH);rect(M,side<0?bx-1:bx+bw,y0+2,1,2,SH);f._pods=(f._pods||[]).concat([[x0,y0+6]]);});}
  if(D.ant){rect(M,13,by-2,2,2,SH);rect(M,13,by-3,2,1,f.glow);}
  D.thr.forEach(x=>rect(M,x,by+bh,2,1,SH));
  const g=f.glow,scx=sx+sw/2,scy=sy+Math.floor(sh/2)-1;
  if(f.wave!=null){const n=Math.floor(sw/2)-1;for(let i=0;i<n;i++){const x=sx+1+i*2,hh=1+Math.round(Math.abs(Math.sin(f.wave*.8+i*1.3))*(sh-3));for(let j=0;j<hh;j++)set(M,x,sy+Math.floor((sh-hh)/2)+j,g);}}
  if(f.crt!=null&&f.crt>0){const c=f.crt;if(c===1)rect(M,sx+1,scy+1,sw-2,1,g);else if(c===2)rect(M,scx-2,scy+1,4,1,g);else if(c===3)set(M,scx,scy+1,g);}
  const L=[scx-4+(D.big?0:1)+(D.slim?1:0)+f.look[0],scy+f.look[1]],R=[scx+2-(D.big?0:1)-(D.slim?1:0)+f.look[0],scy+f.look[1]];
  if(D.big&&f.eyes==='open'){[L,R].forEach(([x,y])=>rect(M,x,y-1,3,4,g));}
  else{eye(M,f.eyes,L[0],L[1],0,g);eye(M,f.eyes,R[0],R[1],1,g);}
  if(f.dots!=null)for(let i=0;i<f.dots&&i<3;i++)set(M,scx-2+i*2,sy+sh-1,g);
  if(f.progress!=null){const w=Math.round((sw-2)*f.progress);rect(M,sx+1,sy+sh-1,w,1,'#4C7BF7');}
  if(f.hour!=null){/* tiny clock on screen corner */set(M,sx+sw-2,sy+1,g);set(M,sx+sw-2,sy+2-f.hour,g);}
  const tilt=f.tilt||0,cy=by+bh/2;
  const S=new Map();M.forEach((c,k)=>{const[x,y]=k.split(',').map(Number);S.set((x+Math.round((cy-y)*tilt))+','+y,c);});
  const ol=new Set();S.forEach((c,k)=>{const[x,y]=k.split(',').map(Number);[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].forEach(([a,b])=>{const kk=(x+a)+','+(y+b);if(!S.has(kk))ol.add(kk);});});
  let out='';const dx=f.dx,dy=f.dy;
  const px=(x,y,c)=>{out+=`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${c}"/>`;};
  ol.forEach(k=>{const[x,y]=k.split(',').map(Number);px(x+dx,y+dy,OL);});
  S.forEach((c,k)=>{const[x,y]=k.split(',').map(Number);px(x+dx,y+dy,c);});
  (f._pods||[]).forEach(([x,y])=>{for(let j=0;j<f.flame;j++){const c=j===0?'#D6E2FF':j<f.flame-1?'#8FB0FF':LAV;px(x+dx,y+dy+j,c);px(x+1+dx,y+dy+j,c);}});
  const fy=by+bh+1+dy;D.thr.forEach(x=>{for(let j=0;j<f.flame;j++){const c=j===0?'#D6E2FF':j<f.flame-1?'#8FB0FF':LAV;px(x+dx,fy+j,c);px(x+1+dx,fy+j,c);}});
  if(D.pad){const y=by+bh+2+dy;for(let x=bx+1;x<bx+bw-1;x+=2){const on=((x+fi)>>1)%2===0&&s!=='dismissed';px(x+dx,y,on?'#8FB0FF':'#3A4370');}}
  if(f.bubble){const bx2=21,by2=-1+dy;for(let i=0;i<5;i++)for(let j=0;j<6;j++)px(bx2+i,by2+j,'#FFFFFF');[[2,1],[2,2],[2,4]].forEach(([x,y])=>px(bx2+x,by2+y,BLUE));px(bx2+1,by2+6,'#FFFFFF');}
  f.ov.forEach(([x,y,c])=>px(x,y+(s==='helping'?0:0),c));
  return out;
}
class AeIon extends HTMLElement{
  static get observedAttributes(){return['v','state'];}
  set v(x){this._v=x;} get v(){return this._v||this.getAttribute('v')||'ion';}
  set state(x){if(x!==this._s){this._s=x;this.t0=performance.now();}} get state(){return this._s||this.getAttribute('state')||'idle';}
  attributeChangedCallback(n,o,x){if(n==='state')this._s=x;if(n==='v')this._v=x;this.t0=performance.now();}
  connectedCallback(){
    if(!this.svg){this.style.display='block';this.innerHTML=`<svg viewBox="0 -2 ${CW} ${CH}" width="100%" height="100%" shape-rendering="crispEdges" style="display:block"></svg>`;this.svg=this.firstChild;}
    this.t0=this.t0||performance.now();this.vis=true;
    this.io=new IntersectionObserver(e=>{this.vis=e[e.length-1].isIntersecting;});this.io.observe(this);
    const loop=now=>{this.raf=requestAnimationFrame(loop);if(!this.vis)return;const fi=Math.max(0,Math.floor((now-this.t0)/1000*FPS));const key=this.v+this.state+fi;if(key===this.last)return;this.last=key;this.svg.innerHTML=render(this.v,this.state,fi);};
    this.raf=requestAnimationFrame(loop);
  }
  disconnectedCallback(){cancelAnimationFrame(this.raf);this.io&&this.io.disconnect();}
}
customElements.define('ae-ion',AeIon);
})();

/* ae-ionhd */
(()=>{
if(customElements.get('ae-ionhd'))return;
const W=40,H=38,FPS=8;
const TH={
  light:{ol:'#24185A',f:['#FFFFFF','#F3F1FF','#E0DBFB','#C9C1F2'],edge:'#B4AAEA',side:['#C8BFF3','#A99DE6','#8F82D9'],spec:'#FFFFFF',
    scr:['#9F8EF5','#8E7CF0','#7B68E6'],scrSh:'#5E4BCB',gloss:'#C3B8FB',eye:'#1A1240',eyeHi:'#FFFFFF',glowMode:0,
    ok:['#8FE3BC','#74D6A8','#5CC594'],bad:['#F6A39D','#EE8B84','#E0726B'],dim:['#B7ADF0','#A99EEA','#9C90E2'],
    leg:['#F1EFFF','#D6D0F7','#B8AEEA'],foot:['#4A3C96','#352A78','#5C4FAE']},
  dark:{ol:'#0A0E26',f:['#5A66A6','#3A4583','#2E3870','#252E62'],edge:'#1E2654',side:['#2A3366','#1F2754','#181F47'],spec:'#7F8BC8',
    scr:['#141A3A','#10152F','#0D1128'],scrSh:'#070A1C',gloss:'#273063',eye:'#9DB6FA',eyeHi:'#E3ECFF',glowMode:1,
    ok:['#123528','#0F2E22','#0C261C'],bad:['#3A1222','#33101E','#2B0D19'],dim:['#1C2347','#181E3E','#141A36'],
    okEye:'#7EDBB0',badEye:'#FF8A80',dimEye:'#9DB6FA',
    leg:['#3A4583','#2E3870','#252E62'],foot:['#0E1330','#141A3A','#3A4370']}
};
const VAR={light:{th:'light',move:'thr'},dark:{th:'dark',move:'thr'},walker:{th:'light',move:'legs'}};
const loopLen={idle:32,thinking:24,listening:16,helping:16,working:24,success:20,error:24,waiting:32,attention:16,dismissed:28};
const inRR=(x,y,X,Y,w,h,r)=>{if(x<X||x>=X+w||y<Y||y>=Y+h)return false;const cx=x<X+r?X+r:x>=X+w-r?X+w-r-1:x,cy=y<Y+r?Y+r:y>=Y+h-r?Y+h-r-1:y;return (x-cx)**2+(y-cy)**2<=r*r+.6;};
function frame(s,k){
  const f={dy:0,dx:0,tilt:0,eyes:'open',look:[0,0],flame:3+(k%2),scr:'n',ov:[],step:0};
  switch(s){
    case 'idle': f.dy=Math.floor(k/8)%2; if(k===22||k===23)f.eyes='blink'; f.look=[k>=12&&k<20?1:0,0]; break;
    case 'thinking': f.eyes='up';f.look=[k<12?-1:1,0];f.tilt=k<12?-.1:.1;f.brow='raise';f.think=Math.floor(k/3)%4;break;
    case 'listening': f.eyes='off';f.wave=k;f.flame=3;f.sound=k%4;break;
    case 'helping': {const on=k>=3&&k<13;f.look=[1,0];f.dx=on?1:0;f.tilt=on?.1:0;if(on)f.arrow=k%4<2?0:1;f.mouth=on?'smile':null;break;}
    case 'working': f.eyes='focus';f.brow='in';f.progress=(k%24)/23;f.flame=4+(k%2);f.dy=k%4<2?0:1;f.step=k%4<2?1:2;break;
    case 'success': {const hop=[0,-2,-4,-5,-5,-4,-2,0];f.dy=k<8?hop[k]:0;f.eyes='happy';f.mouth='smile';f.scr='ok';f.flame=k<8?6:3;f.spark=k>=2&&k<14?(k%4<2?1:2):0;f.step=k<8&&k>0?3:0;break;}
    case 'error': f.eyes='x';f.scr='bad';f.brow='worry';f.mouth='frown';f.tilt=-.12;f.dy=2;f.dx=k<6?(k%2?2:-2):0;f.flame=k%3===0?2:0;f.bang=k%8<5;break;
    case 'waiting': f.eyes='half';f.brow='flat';f.wait=Math.floor(k/4)%4;f.look=[Math.floor(k/8)%2?1:-1,0];f.scr='dim';f.flame=2+(k%4<2?1:0);f.dy=k<16?0:1;f.step=k%16<2?1:0;break;
    case 'attention': {const hop=[0,-2,-3,-2,0,-1,0,0];f.dy=hop[k%8];f.eyes='wide';f.brow='high';f.mouth='o';f.flame=4;f.bubble=1;break;}
    case 'dismissed': {const st=Math.min(5,Math.floor(k/3));f.crt=st;f.eyes='off';f.dy=Math.min(2,Math.floor(k/6));f.flame=st<3?2:0;f.scr=st>=3?'off':'n';if(k>=24){f.crt=0;f.eyes='open';f.dy=0;f.scr='n';f.flame=3;}break;}
  }
  return f;
}
function draw(v,s,k){
  const D=VAR[v]||VAR.light,T=TH[D.th],f=frame(s,k),M=new Map(),set=(x,y,c)=>M.set(x+','+y,c);
  const FX=13,FY=6,FW=22,FH=19,R=4,SX=9;
  for(let y=FY+1;y<FY+FH;y++)for(let x=SX;x<FX+4;x++){if(!inRR(x,y,SX,FY+1,FW,FH-1,R))continue;const t=(y-FY)/FH;set(x,y,t<.25?T.side[0]:t<.75?T.side[1]:T.side[2]);}
  for(let y=FY+4;y<FY+9;y++)set(SX+1,y,T.spec);set(SX+2,FY+3,T.spec);
  for(let y=FY;y<FY+FH;y++)for(let x=FX;x<FX+FW;x++){if(!inRR(x,y,FX,FY,FW,FH,R))continue;const t=(y-FY)/FH;let c=t<.18?T.f[0]:t<.6?T.f[1]:t<.86?T.f[2]:T.f[3];if(x>=FX+FW-2||!inRR(x+1,y,FX,FY,FW,FH,R))c=T.edge;set(x,y,c);}
  [[FX+2,FY+1],[FX+3,FY+1],[FX+4,FY+1],[FX+1,FY+2],[FX+1,FY+3]].forEach(([x,y])=>set(x,y,T.spec));
  const SCX=FX+3,SCY=FY+4,SW=16,SH=11,sr=2;
  let pal=T.scr,eyeC=T.eye;
  if(f.scr==='ok'){pal=T.ok;if(T.okEye)eyeC=T.okEye;}else if(f.scr==='bad'){pal=T.bad;if(T.badEye)eyeC=T.badEye;}else if(f.scr==='dim'){pal=T.dim;if(T.dimEye)eyeC=T.dimEye;}else if(f.scr==='off'){pal=[T.scrSh,T.scrSh,T.scrSh];}
  for(let y=SCY-1;y<SCY+SH+1;y++)for(let x=SCX-1;x<SCX+SW+1;x++){if(inRR(x,y,SCX-1,SCY-1,SW+2,SH+2,sr+1)&&!inRR(x,y,SCX,SCY,SW,SH,sr))set(x,y,T.f[2]);}
  for(let y=SCY;y<SCY+SH;y++)for(let x=SCX;x<SCX+SW;x++){if(!inRR(x,y,SCX,SCY,SW,SH,sr))continue;const t=(x-SCX)/SW+(y-SCY)/SH;let c=t<.6?pal[0]:t<1.3?pal[1]:pal[2];if(y===SCY||x===SCX)c=T.scrSh;set(x,y,c);}
  if(f.scr!=='off'){[[SCX+SW-4,SCY+1],[SCX+SW-3,SCY+1],[SCX+SW-2,SCY+2]].forEach(([x,y])=>set(x,y,T.gloss));}
  const cx=Math.floor(SCX+SW/2),ey=SCY+3+f.look[1],E=(x,y)=>set(x,y,eyeC),HI2=T.glowMode?T.eyeHi:T.eyeHi;
  const eyeAt=(ax,side)=>{const x=ax+f.look[0];const R=(x0,y0,w,h)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++)E(x0+i,y0+j);};switch(f.eyes){
    case 'blink':R(x,ey+3,3,1);break;
    case 'half':R(x,ey+2,3,2);break;
    case 'focus':R(x-1,ey+1,4,2);break;
    case 'happy':[[-1,3],[0,2],[1,1],[2,2],[3,3],[0,3],[1,2],[2,3]].forEach(([a,b])=>E(x+a,ey+b));break;
    case 'x':for(let i=0;i<4;i++){E(x-1+i,ey+i);E(x+2-i,ey+i);}break;
    case 'wide':R(x-1,ey-1,4,5);set(x-1,ey-1,HI2);set(x,ey-1,HI2);set(x-1,ey,HI2);break;
    case 'up':R(x,ey-1,3,3);set(x,ey-1,HI2);break;
    case 'off':break;
    default:R(x,ey,3,4);set(x,ey,HI2);}
    const by=ey-2,br=(pts)=>pts.forEach(([a,b])=>E(x+a,by+b));
    if(f.brow==='raise')br(side?[[0,0],[1,0],[2,0]]:[[-1,-1],[0,-1],[1,-1],[2,-1]].map(([a,b])=>[a,b-0]));
    else if(f.brow==='in')br(side?[[-1,0],[0,0],[1,-1],[2,-1]]:[[0,-1],[1,-1],[2,0],[3,0]]);
    else if(f.brow==='worry')br(side?[[0,-1],[1,-1],[2,0],[3,0]]:[[-1,0],[0,0],[1,-1],[2,-1]]);
    else if(f.brow==='flat')br([[0,1],[1,1],[2,1]]);
    else if(f.brow==='high')br([[-1,-1],[0,-1],[1,-1],[2,-1]]);};
  eyeAt(cx-5,0);eyeAt(cx+2,1);
  {const my=ey+5;if(f.mouth==='smile'){E(cx-2,my);E(cx-1,my+1);E(cx,my+1);E(cx+1,my+1);E(cx+2,my);}else if(f.mouth==='frown'){E(cx-2,my+1);E(cx-1,my);E(cx,my);E(cx+1,my);E(cx+2,my+1);}else if(f.mouth==='o'){E(cx-1,my);E(cx,my);E(cx-1,my+1);E(cx,my+1);}}
  if(f.wave!=null){for(let i=0;i<7;i++){const x=SCX+2+i*2,h=1+Math.round(Math.abs(Math.sin(f.wave*.8+i*1.3))*(SH-4));for(let j=0;j<h;j++)E(x,SCY+Math.floor((SH-h)/2)+j);}}
  if(f.crt){const c=f.crt;if(c===1)for(let x=SCX+1;x<SCX+SW-1;x++)E(x,SCY+5);else if(c===2)for(let x=cx-3;x<cx+3;x++)E(x,SCY+5);else if(c===3){E(cx,SCY+5);E(cx-1,SCY+5);}}
  
  if(f.progress!=null){const w=Math.round((SW-4)*f.progress);for(let x=0;x<w;x++)set(SCX+2+x,SCY+SH-2,T.glowMode?'#4C7BF7':'#FFFFFF');}
  const BOT=FY+FH;
  if(D.move==='legs'){const legs=[[FX+3,0],[FX+FW-8,1]];legs.forEach(([x,i])=>{const up=(f.step===1&&i===0)||(f.step===2&&i===1)?1:0,lift=f.step===3?1:0;for(let j=0;j<3-up;j++)for(let a=0;a<4;a++)set(x+a,BOT+j,a===0?T.leg[0]:a===3?T.leg[2]:T.leg[1]);const fy=BOT+3-up-lift;for(let a=-1;a<5;a++){set(x+a,fy,a<1?T.foot[2]:T.foot[0]);set(x+a,fy+1,T.foot[1]);}});}
  else{for(let a=0;a<10;a++)set(FX+6+a,BOT,a<2?T.side[1]:T.side[2]);for(let a=0;a<8;a++)set(FX+7+a,BOT+1,a===0?T.foot[2]:T.foot[1]);}
  const tilt=f.tilt,cyM=FY+FH/2;
  const S=new Map();M.forEach((c,key)=>{const[x,y]=key.split(',').map(Number);const legRow=D.move==='legs'&&y>=BOT;S.set((x+(legRow?0:Math.round((cyM-y)*tilt)))+','+y,c);});
  const ol=new Set();S.forEach((c,key)=>{const[x,y]=key.split(',').map(Number);for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const kk=(x+a)+','+(y+b);if(!S.has(kk))ol.add(kk);}});
  const P=[];const dx=f.dx,dy=f.dy;
  ol.forEach(key=>{const[x,y]=key.split(',').map(Number);const legRow=D.move==='legs'&&y>=BOT;P.push([x+dx,y+(legRow?Math.max(0,dy):dy),T.ol]);});
  S.forEach((c,key)=>{const[x,y]=key.split(',').map(Number);const legRow=D.move==='legs'&&y>=BOT;P.push([x+dx,y+(legRow?Math.max(0,dy):dy),c]);});
  if(D.move==='thr'){const fy=BOT+2+dy;const fc=['#FFFFFF','#D6E2FF','#8FB0FF','#8FB0FF','#6C63F0','#6C63F0'];for(let j=0;j<f.flame;j++){const w=j<2?6:j<4?4:2,x0=FX+11-w/2+(j>=4&&k%2?1:0);for(let a=0;a<w;a++)P.push([x0+a+dx,fy+j,fc[Math.min(j,5)]]);}}
  if(f.arrow!=null){const ax=37+f.arrow;[[0,0],[1,1],[2,2],[1,3],[0,4]].forEach(([a,b])=>P.push([ax+a-1,FY+7+b,'#1D5BF5']));}
  if(f.spark){const pts=f.spark===1?[[5,4],[36,10]]:[[4,18],[37,3]];pts.forEach(([x,y])=>{[[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>P.push([x+a,y+b,a||b?'#7EDBB0':'#FFFFFF']));});}
  
  const bub=(bx,by,w,h,fill,edge)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++){if((i===0||i===w-1)&&(j===0||j===h-1))continue;P.push([bx+i,by+j,(i===0||i===w-1||j===0||j===h-1)?edge:fill]);}};
  if(f.think!=null){P.push([35,14+dy,'#FFFFFF'],[36,12+dy,'#FFFFFF'],[37,12+dy,'#FFFFFF']);bub(29,1+dy,11,7,'#FFFFFF','#24185A');for(let i=0;i<3;i++){const c=i<f.think?'#1D5BF5':'#C9CDDA',x=31+i*3;P.push([x,4+dy,c],[x+1,4+dy,c]);}}
  if(f.wait!=null){bub(31,2+dy,9,6,'#FFFFFF','#9EA4B8');for(let i=0;i<3;i++)P.push([33+i*2,4+dy,i===f.wait%3?'#24185A':'#C9CDDA'],[33+i*2,5+dy,i===f.wait%3?'#24185A':'#C9CDDA']);}
  if(f.sound!=null){const c='#1D5BF5';[[0,0],[2,1]].forEach(([o,ph])=>{if((f.sound+ph)%4<2){for(let j=-2;j<=2;j++)P.push([37+o+(Math.abs(j)===2?-1:0),14+j+dy,c],[5-o-(Math.abs(j)===2?-1:0),14+j+dy,c]);}});}
  if(f.bang){bub(31,0,8,10,'#D6453D','#8E2A25');[2,3,4,5,7].forEach(y=>P.push([34,y,'#FFFFFF'],[35,y,'#FFFFFF']));}
  if(f.bubble){const bx=30,by=-2+dy;bub(bx,by,9,10,'#FFFFFF','#24185A');[[1],[2],[3],[4],[6]].forEach(([y])=>P.push([bx+4,by+y+1,'#1D5BF5'],[bx+5,by+y+1,'#1D5BF5']));P.push([bx+2,by+10,'#24185A'],[bx+3,by+9,'#FFFFFF']);}
  return P;
}
const CACHE=new Map();
function get(v,s,k){const key=v+'|'+s+'|'+k;let c=CACHE.get(key);if(c)return c;c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');draw(v,s,k).forEach(([px,py,col])=>{x.fillStyle=col;x.fillRect(W-1-px,py+2,1,1);});CACHE.set(key,c);return c;}
class AeIonHD extends HTMLElement{
  static get observedAttributes(){return['v','state'];}
  set v(x){this._v=x;this.paint&&this.paint(0);} get v(){return this._v||this.getAttribute('v')||'light';}
  set state(x){if(x!==this._s){this._s=x;this.paint&&this.paint(0);}} get state(){return this._s||this.getAttribute('state')||'idle';}
  attributeChangedCallback(n,o,x){if(n==='state')this._s=x;if(n==='v')this._v=x;this.paint&&this.paint(0);}
  connectedCallback(){
    if(!this.cv){this.style.display='block';this.innerHTML=`<canvas width="${W}" height="${H}" style="display:block;width:100%;height:100%;object-fit:contain;image-rendering:pixelated"></canvas>`;this.cv=this.firstChild;}
    this.vis=true;this.io=new IntersectionObserver(e=>{this.vis=e[e.length-1].isIntersecting;});this.io.observe(this);
    this.paint=k=>{try{const x=this.cv.getContext('2d');x.clearRect(0,0,W,H);x.drawImage(get(this.v,this.state,k),0,0);}catch(err){console.error('ae-ionhd',err);}};
    this.paint(0);
    const loop=now=>{this.raf=requestAnimationFrame(loop);if(!this.vis)return;const L=loopLen[this.state]||16,k=Math.floor(now/1000*FPS)%L,key=this.v+this.state+k;if(key===this.last)return;this.last=key;this.paint(k);};
    this.raf=requestAnimationFrame(loop);
  }
  disconnectedCallback(){cancelAnimationFrame(this.raf);this.io&&this.io.disconnect();}
}
customElements.define('ae-ionhd',AeIonHD);
})();

/* ae-pet */
(()=>{
if(customElements.get('ae-pet'))return;
const TAU=Math.PI*2,cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k,ph=(t,T)=>(t%T)/T,seg=(p,a,b)=>cl((p-a)/(b-a));
const eo=p=>1-Math.pow(1-p,3),f=n=>(+n).toFixed(2);
const blink=(t,T)=>{const p=ph(t,T);return p<.06?1-Math.sin(p/.06*Math.PI)*.92:1;};
const P={
  tuft:{col:'#F46A45',w:52,h:58,r:9,tuft:'scallop',n:4,tw:7.6,th:8,eyeY:.36,gap:14.4,er:2.9},
  sprout:{col:'#10BE6A',w:52,h:34,r:9,tuft:'leaves',L:[[0,15,3.8,0],[-55,12,3.4,-9.7],[55,12,3.4,9.7]],eyeY:.4,gap:14.4,er:2.9},
  bulb:{col:'#1D5BF5',w:44,h:46,r:10,tuft:'antenna',al:13,ball:3.4,eyeY:.42,gap:13,er:2.8},
  ears:{col:'#FFBE2E',w:50,h:42,r:10,tuft:'ears',eyeY:.45,gap:14,er:2.8},
  crown:{col:'#8E7CF0',w:48,h:52,r:9,tuft:'leaves',L:[[-36,10,1.9,-8],[-18,11,1.9,-4],[0,12,1.9,0],[18,11,1.9,4],[36,10,1.9,8]],eyeY:.38,gap:13,er:2.8},
  flame:{col:'#FF7EB3',w:40,h:40,r:10,tuft:'leaves',L:[[8,18,5.4,0]],eyeY:.45,gap:11,er:2.6},
  mop:{col:'#141A3A',w:56,h:50,r:10,tuft:'scallop',n:6,tw:7,th:5.5,eyeY:.42,gap:15,er:3,eye:'#FFFFFF'},
  mini:{col:'#10BE6A',w:34,h:26,r:8,tuft:'leaves',L:[[-28,10,3,-2],[28,10,3,2]],eyeY:.45,gap:9.5,er:2.3}
};
function tufts(D,cx,y0,sway,perk,droop){
  const c=D.col;let o='';
  if(D.tuft==='scallop'){for(let i=0;i<D.n;i++){const k=i-(D.n-1)/2,x=cx+k*D.tw,a=sway*(1+.15*k)+droop*(Math.sign(k)||1)*.6;o+=`<ellipse transform="rotate(${f(a)} ${f(x)} ${f(y0+2)})" cx="${f(x)}" cy="${f(y0+.5)}" rx="${f(D.tw/2)}" ry="${f(D.th*perk)}" fill="${c}"/>`;}}
  if(D.tuft==='leaves'){D.L.forEach(([ang,L,W,bx])=>{const rot=ang+sway+droop*(Math.sign(ang)||1),l=L*perk;o+=`<g transform="translate(${f(cx+bx)} ${f(y0+2)}) rotate(${f(rot)})"><ellipse cx="0" cy="${f(-l/2)}" rx="${W}" ry="${f(l/2)}" fill="${c}"/></g>`;});}
  if(D.tuft==='antenna'){const L=D.al*perk,tx=cx+sway*.5+droop*.35,ty=y0-L+droop*.22;o+=`<path d="M${f(cx)} ${f(y0+2)}Q${f(cx)} ${f(y0-L*.55)} ${f(tx)} ${f(ty)}" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/><circle cx="${f(tx)}" cy="${f(ty)}" r="${D.ball}" fill="${c}"/>`;}
  if(D.tuft==='ears'){[-1,1].forEach(s=>{const x=cx+s*D.w*.27,a=s*(16+droop)+sway*.5;o+=`<ellipse transform="rotate(${f(a)} ${f(x)} ${f(y0+3)})" cx="${f(x)}" cy="${f(y0+1-3*(perk-1))}" rx="5.6" ry="${f(9*perk)}" fill="${c}"/>`;});}
  return o;
}
function body(x0,y0,w,h,r,c){
  const x1=x0+w,fy=y0+h-r,cx=x0+w/2;
  return `<path d="M${f(x0)} ${f(y0+r)}A${r} ${r} 0 0 1 ${f(x0+r)} ${f(y0)}H${f(x1-r)}A${r} ${r} 0 0 1 ${f(x1)} ${f(y0+r)}V${f(fy)}A${r} ${r} 0 0 1 ${f(x1-r-.866*r)} ${f(fy+.5*r)}Q${f(cx)} ${f(fy+.66*r)} ${f(x0+r+.866*r)} ${f(fy+.5*r)}A${r} ${r} 0 0 1 ${f(x0)} ${f(fy)}Z" fill="${c}"/>`;
}
function eyes(D,cx,ey,look,type,es,bl){
  const k=D.eye||'#111111',r=D.er*es;let o='';
  [-1,1].forEach(s=>{const ex=cx+s*D.gap/2+look[0]*1.7,y=ey+look[1]*1.5;
    if(type==='happy')o+=`<path d="M${f(ex-r)} ${f(y+r*.5)}Q${f(ex)} ${f(y-r*1.5)} ${f(ex+r)} ${f(y+r*.5)}" fill="none" stroke="${k}" stroke-width="${f(D.er*.75)}" stroke-linecap="round"/>`;
    else if(type==='x')o+=`<path d="M${f(ex-r*.9)} ${f(y-r*.9)}L${f(ex+r*.9)} ${f(y+r*.9)}M${f(ex+r*.9)} ${f(y-r*.9)}L${f(ex-r*.9)} ${f(y+r*.9)}" stroke="${k}" stroke-width="${f(D.er*.7)}" stroke-linecap="round"/>`;
    else if(type==='closed')o+=`<path d="M${f(ex-r)} ${f(y+.6)}H${f(ex+r)}" stroke="${k}" stroke-width="${f(D.er*.7)}" stroke-linecap="round"/>`;
    else if(type==='half')o+=`<path d="M${f(ex-r)} ${f(y)}A${f(r)} ${f(r)} 0 0 0 ${f(ex+r)} ${f(y)}Z" fill="${k}"/>`;
    else if(type==='focus')o+=`<rect x="${f(ex-r*1.1)}" y="${f(y-r*.42)}" width="${f(r*2.2)}" height="${f(r*.84)}" rx="${f(r*.42)}" fill="${k}"/>`;
    else o+=`<ellipse cx="${f(ex)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r*bl)}" fill="${k}"/>`;});
  return o;
}
function render(v,s,t,el){
  const D=P[v]||P.tuft,{w,h,r}=D,G=90,cx=50,INK='#141A3A';
  let dx=0,dy=0,tilt=0,sy=1,sway=0,perk=1,droop=0,look=[0,0],eye='open',es=1,bl=1,ov='';
  switch(s){
    case 'idle':{sy=1+.018*Math.sin(TAU*t/3);bl=blink(t,4.2);const g=Math.sin(t*.7);look=[g>.6?1:g<-.6?-1:0,0];sway=3*Math.sin(t*1.4);break;}
    case 'thinking':{const L=ph(t,4)<.5?-1:1;look=[L,-1];tilt=L*3;sway=L*6;bl=blink(t,5);sy=1+.01*Math.sin(t*2);break;}
    case 'listening':{perk=1.25;es=1.15;tilt=-4;sy=1+.02*Math.sin(t*6);sway=-4+2*Math.sin(t*6);break;}
    case 'helping':{const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eo(seg(p,.6,1));look=[1.2,0];tilt=6*e;dx=2.5*e;sway=8*e;break;}
    case 'working':{const q=Math.sin(TAU*t/.5);tilt=4*q;dy=-1.6*Math.abs(q);eye='focus';sway=-tilt*1.8;perk=1+.06*Math.abs(q);break;}
    case 'success':{const p=ph(t,1.7);eye='happy';perk=1.2;
      if(p<.15)sy=1-.12*Math.sin(Math.PI*p/.15);
      else if(p<.55){const k=seg(p,.15,.55);dy=-12*Math.sin(Math.PI*k);sy=1+.07*Math.sin(Math.PI*k);sway=6*Math.sin(Math.PI*k);}
      else if(p<.7)sy=1-.09*Math.sin(Math.PI*seg(p,.55,.7));
      break;}
    case 'error':{const p=ph(t,2.4);dx=p<.3?Math.sin(t*44)*1.3*(1-p/.3):0;eye='x';droop=26;perk=.92;sy=.96;break;}
    case 'waiting':{eye='half';look=[Math.sin(t*.8)>0?1:-1,-.3];tilt=1.5*Math.sin(t*1.6);sway=2*Math.sin(t*1.6);break;}
    case 'attention':{const p=ph(t,1.3);const h1=Math.sin(Math.PI*seg(p,0,.2)),h2=Math.sin(Math.PI*seg(p,.24,.42));dy=-5*h1-3.5*h2;es=1.28;perk=1.3;sy=1+.04*(h1+h2);break;}
    case 'dismissed':{const p=ph(t,3.2);const k=p<.25?eo(p/.25):p<.8?1:1-eo(seg(p,.8,.92));sy=1-.28*k;eye=k>.2?'closed':'open';droop=30*k;perk=1-.3*k;break;}
  }
  if(el){el._tl=lerp(el._tl??tilt,tilt,.22);tilt=el._tl;el._lx=lerp(el._lx??look[0],look[0],.35);el._ly=lerp(el._ly??look[1],look[1],.35);look=[el._lx,el._ly];}
  const sx=1+(1-sy)*.6,x0=cx-w/2,y0=G-h;
  const g=`<g transform="translate(${f(cx+dx)} ${f(G+dy)}) rotate(${f(tilt)}) scale(${f(sx)} ${f(sy)}) translate(${-cx} ${-G})">${tufts(D,cx,y0,sway,perk,droop)}${body(x0,y0,w,h,r,D.col)}${eyes(D,cx,y0+h*D.eyeY,look,eye,es,bl)}</g>`;
  const hy=G-h*sy+dy,rx=cx+dx+w/2*sx;
  if(s==='thinking')ov=[0,1,2].map(i=>`<circle cx="${f(rx+1+i*3.6)}" cy="${f(hy-2-i*2.2)}" r="${1.2+i*.25}" fill="${INK}" opacity="${Math.floor(t*3)%4>i?1:.2}"/>`).join('');
  if(s==='waiting')ov=[0,1,2].map(i=>`<circle cx="${f(cx-4+i*4)}" cy="${f(hy-8)}" r="1.1" fill="#9EA4B8" opacity="${Math.floor(t*1.5)%3===i?1:.3}"/>`).join('');
  if(s==='listening')ov=[1,2].map(i=>{const a=.5+.5*Math.sin(t*6-i);const x=cx+dx-w/2-2-i*3.2,y=G-h*.6;return `<path d="M${f(x)} ${f(y-4-i)}q${-2-i*.6} ${4+i} 0 ${8+i*2}" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round" opacity="${f(a)}"/>`;}).join('');
  if(s==='helping'){const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eo(seg(p,.6,1));ov=`<path d="M${f(rx+3+2*e)} ${f(G-h*.55-3)}l3 3l-3 3" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="${f(e)}"/>`;}
  if(s==='success'){const p=ph(t,1.7),k=seg(p,.3,.75);if(k>0&&k<1)ov=[[-1,-1],[1,-1],[-1.3,.1],[1.3,.1],[0,-1.4]].map(([a,b],i)=>`<circle cx="${f(cx+a*(w*.4+8*k))}" cy="${f(hy+6+b*(8+8*k))}" r="${f(1.6*(1-k)+.3)}" fill="${['#FFBE2E',D.col,'#1D5BF5','#FF7EB3','#10BE6A'][i]}"/>`).join('');}
  if(s==='error'){const p=ph(t,2.4),k=seg(p,.3,1);ov=`<path transform="translate(${f(rx+1)} ${f(hy+4+k*6)})" d="M0 -3C1.6 -.6 2 .4 2 1.2A2 2 0 0 1 -2 1.2C-2 .4 -1.6 -.6 0 -3Z" fill="#8FC8FF" opacity="${f(1-k*.8)}"/>`;}
  if(s==='attention'){const p=ph(t,1.3),e=eo(seg(p,0,.25));ov=`<g transform="translate(${f(rx+2)} ${f(hy-3)}) scale(${f(.6+.4*e)})"><rect x="-1.1" y="-8" width="2.2" height="6" rx="1.1" fill="${INK}"/><circle cy="1" r="1.2" fill="${INK}"/></g>`;}
  return `<ellipse cx="${f(cx+dx)}" cy="${G+1.2}" rx="${f(w*.42*(1+dy/40))}" ry="1.4" fill="#141A3A" opacity="${f(.08*(1+dy/30))}"/>${g}${ov}`;
}
class AePet extends HTMLElement{
  static get observedAttributes(){return['v','state'];}
  set v(x){this._v=x;} get v(){return this._v||this.getAttribute('v')||'tuft';}
  set state(x){if(x!==this._s){this._s=x;this.t0=performance.now();}} get state(){return this._s||this.getAttribute('state')||'idle';}
  attributeChangedCallback(n,o,x){if(n==='state')this._s=x;if(n==='v')this._v=x;this.t0=performance.now();}
  connectedCallback(){
    if(!this.svg){this.style.display='block';this.innerHTML='<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block;overflow:visible"></svg>';this.svg=this.firstChild;}
    this.t0=this.t0||performance.now();this.vis=true;
    this.io=new IntersectionObserver(e=>{this.vis=e[e.length-1].isIntersecting;});this.io.observe(this);
    const loop=now=>{this.raf=requestAnimationFrame(loop);if(!this.vis||now-(this.last||0)<33)return;this.last=now;this.svg.innerHTML=render(this.v,this.state,Math.max(0,(now-this.t0)/1000),this);};
    this.raf=requestAnimationFrame(loop);
  }
  disconnectedCallback(){cancelAnimationFrame(this.raf);this.io&&this.io.disconnect();}
}
customElements.define('ae-pet',AePet);
})();

/* ae-pet2 */
(()=>{
if(customElements.get('ae-pet2'))return;
const TAU=Math.PI*2,cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k,ph=(t,T)=>(t%T)/T,seg=(p,a,b)=>cl((p-a)/(b-a));
const eo=p=>1-Math.pow(1-p,3),f=n=>(+n).toFixed(2),INK='#141A3A';
const blink=(t,T)=>{const p=ph(t,T);return p<.06?1-Math.sin(p/.06*Math.PI)*.92:1;};
function anim(s,t){
  const a={dx:0,dy:0,tilt:0,sy:1,sway:0,perk:1,droop:0,look:[0,0],eye:'open',es:1,bl:1,arm:[8,8],hb:0,leg:[0,0]};
  switch(s){
    case 'idle':{a.sy=1+.018*Math.sin(TAU*t/3);a.bl=blink(t,4.2);const g=Math.sin(t*.7);a.look=[g>.6?1:g<-.6?-1:0,0];a.sway=3*Math.sin(t*1.4);a.arm=[8+4*Math.sin(t*1.4),8-4*Math.sin(t*1.4)];a.hb=-1.2*Math.sin(t*2);break;}
    case 'thinking':{const L=ph(t,4)<.5?-1:1;a.look=[L,-1];a.tilt=L*3;a.sway=L*6;a.bl=blink(t,5);a.arm=[8,130];a.hb=-1;break;}
    case 'listening':{a.perk=1.25;a.es=1.15;a.tilt=-4;a.sy=1+.02*Math.sin(t*6);a.sway=-4+2*Math.sin(t*6);a.arm=[150,10];a.hb=-2;break;}
    case 'helping':{const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eo(seg(p,.6,1));a.look=[1.2,0];a.tilt=6*e;a.dx=2.5*e;a.sway=8*e;a.arm=[8,8+85*e];break;}
    case 'working':{const q=Math.sin(TAU*t/.5);a.tilt=4*q;a.dy=-1.6*Math.abs(q);a.eye='focus';a.sway=-a.tilt*1.8;a.perk=1+.06*Math.abs(q);a.arm=[20+30*Math.max(0,q),20+30*Math.max(0,-q)];a.leg=[Math.max(0,q)*3,Math.max(0,-q)*3];a.hb=-Math.abs(q);break;}
    case 'success':{const p=ph(t,1.7);a.eye='happy';a.perk=1.2;let k=0;
      if(p<.15)a.sy=1-.12*Math.sin(Math.PI*p/.15);
      else if(p<.55){k=Math.sin(Math.PI*seg(p,.15,.55));a.dy=-12*k;a.sy=1+.07*k;a.sway=6*k;a.hb=-2.5*k;}
      else if(p<.7){a.sy=1-.09*Math.sin(Math.PI*seg(p,.55,.7));a.hb=1;}
      a.arm=[30+130*k,30+130*k];break;}
    case 'error':{const p=ph(t,2.4);a.dx=p<.3?Math.sin(t*44)*1.3*(1-p/.3):0;a.eye='x';a.droop=26;a.perk=.92;a.sy=.96;a.arm=[2,2];a.hb=1.5;break;}
    case 'waiting':{a.eye='half';a.look=[Math.sin(t*.8)>0?1:-1,-.3];a.tilt=1.5*Math.sin(t*1.6);a.sway=2*Math.sin(t*1.6);a.arm=[8,8+12*Math.abs(Math.sin(t*1.6))];a.hb=-.8*Math.sin(t*1.6);break;}
    case 'attention':{const p=ph(t,1.3),h1=Math.sin(Math.PI*seg(p,0,.2)),h2=Math.sin(Math.PI*seg(p,.24,.42));a.dy=-5*h1-3.5*h2;a.es=1.28;a.perk=1.3;a.sy=1+.04*(h1+h2);a.arm=[10,145+22*Math.sin(t*14)];a.hb=-2;break;}
    case 'dismissed':{const p=ph(t,3.2),k=p<.25?eo(p/.25):p<.8?1:1-eo(seg(p,.8,.92));a.sy=1-.28*k;a.eye=k>.2?'closed':'open';a.droop=30*k;a.perk=1-.3*k;a.arm=[0,0];a.hb=3*k;break;}
  }
  return a;
}
function eyes(style,pts,r,a,id,k='#111111'){
  let o='';const R=r*a.es;
  pts.forEach(([x0,y0])=>{const x=x0+a.look[0]*1.7,y=y0+a.look[1]*1.5,sw=f(r*.75);
    if(a.eye==='happy'){o+=`<path d="M${f(x-R)} ${f(y+R*.5)}Q${f(x)} ${f(y-R*1.5)} ${f(x+R)} ${f(y+R*.5)}" fill="none" stroke="${k}" stroke-width="${sw}" stroke-linecap="round"/>`;return;}
    if(a.eye==='x'){o+=`<path d="M${f(x-R*.85)} ${f(y-R*.85)}L${f(x+R*.85)} ${f(y+R*.85)}M${f(x+R*.85)} ${f(y-R*.85)}L${f(x-R*.85)} ${f(y+R*.85)}" stroke="${k}" stroke-width="${sw}" stroke-linecap="round"/>`;return;}
    if(a.eye==='closed'){o+=`<path d="M${f(x-R)} ${f(y+.6)}H${f(x+R)}" stroke="${k}" stroke-width="${sw}" stroke-linecap="round"/>`;return;}
    if(a.eye==='focus'){o+=`<rect x="${f(x-R*1.1)}" y="${f(y-R*.42)}" width="${f(R*2.2)}" height="${f(R*.84)}" rx="${f(R*.42)}" fill="${k}"/>`;return;}
    const ry=(style==='oval'?R*1.45:R)*(a.eye==='half'?1:a.bl),rx=style==='oval'?R*.95:R;
    const fill=style==='gloss'?`url(#${id}gl)`:k;
    if(a.eye==='half'){o+=`<path d="M${f(x-rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 0 0 ${f(x+rx)} ${f(y)}Z" fill="${fill}"/>`;return;}
    if(style==='gloss')o+=`<ellipse cx="${f(x)}" cy="${f(y+.9)}" rx="${f(rx)}" ry="${f(ry)}" fill="#0A0630" opacity=".22"/>`;
    o+=`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}"/>`;
    if(style==='dothi'&&a.bl>.5)o+=`<circle cx="${f(x+R*.35)}" cy="${f(y-R*.35)}" r="${f(R*.28)}" fill="#fff"/>`;
  });
  return o;
}
const leaf=(x,y,rot,L,W,fill)=>`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><ellipse cx="0" cy="${f(-L/2)}" rx="${W}" ry="${f(L/2)}" fill="${fill}"/></g>`;
const GL=id=>`<radialGradient id="${id}gl" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F3F6FF"/><stop offset="1" stop-color="#C9D4F0"/></radialGradient>`;
function bunny(a,id){
  const ears=[[40,48,-16,30,9.5,-1],[57,48,22,27,9,1]].map(([x,y,ang,L,W,s])=>leaf(x,y+3,ang+a.sway*.8+a.droop*s*1.6,(L+3)*a.perk,W,`url(#${id}be)`)).join('');
  return `${ears}<ellipse cx="48" cy="65" rx="31" ry="22" transform="rotate(-10 48 65)" fill="url(#${id}bg)"/>${eyes('gloss',[[37,70],[54,74]],4.6,a,id,'#FFFFFF')}`;
}
const bunnyDefs=id=>`<linearGradient id="${id}be" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFCB3D"/><stop offset=".45" stop-color="#EE7DB0"/><stop offset="1" stop-color="#6B3DF2"/></linearGradient><linearGradient id="${id}bg" gradientUnits="userSpaceOnUse" x1="56" y1="44" x2="42" y2="88"><stop offset="0" stop-color="#6B3DF2"/><stop offset=".5" stop-color="#5A86F5"/><stop offset="1" stop-color="#52E2FF"/></linearGradient>${GL(id)}`;
function tuftBody(x0,y0,w,h,r,c){const x1=x0+w,fy=y0+h-r,cx=x0+w/2;return `<path d="M${f(x0)} ${f(y0+r)}A${r} ${r} 0 0 1 ${f(x0+r)} ${f(y0)}H${f(x1-r)}A${r} ${r} 0 0 1 ${f(x1)} ${f(y0+r)}V${f(fy)}A${r} ${r} 0 0 1 ${f(x1-r-.866*r)} ${f(fy+.5*r)}Q${f(cx)} ${f(fy+.66*r)} ${f(x0+r+.866*r)} ${f(fy+.5*r)}A${r} ${r} 0 0 1 ${f(x0)} ${f(fy)}Z" fill="${c}"/>`;}
const P={
  bunny:{base:88,ht:16,rx:79,lx:17,shadow:1,defs:bunnyDefs,draw:bunny},
  jelly:{tile:['#FBF8FF','#A57BFF'],base:78,ht:26,rx:71,lx:29,
    defs:id=>`<radialGradient id="${id}jb" gradientUnits="userSpaceOnUse" cx="42" cy="38" r="48"><stop offset="0" stop-color="#3B2B60"/><stop offset=".55" stop-color="#0C0818"/><stop offset="1" stop-color="#050309"/></radialGradient>`,
    draw:(a,id)=>`${leaf(39,38,-14+a.sway*.9-a.droop*1.2,15*a.perk,6,`url(#${id}jb)`)}${leaf(61,38,20+a.sway*.6+a.droop*1.4,9*a.perk,5.5,`url(#${id}jb)`)}<rect x="29" y="31" width="42" height="47" rx="15" fill="url(#${id}jb)"/><ellipse cx="50" cy="74" rx="15" ry="3.6" fill="#7B5AF0" opacity=".4"/>${eyes('oval',[[44,52],[56,52]],3.9,a,id,'#FFFFFF')}`},
  bolt:{base:88,ht:12,rx:80,lx:20,shadow:1,
    draw:(a,id)=>{const c='#3DDBB0',tx=50+a.sway*.35+a.droop*.3,ty=14-(a.perk-1)*8+a.droop*.15;
      return `<rect x="38" y="${f(73-a.leg[0])}" width="8" height="15" rx="4" fill="${c}"/><rect x="54" y="${f(73-a.leg[1])}" width="8" height="15" rx="4" fill="${c}"/>
      <g transform="translate(27 55) rotate(${f(a.arm[0])})"><rect x="-4" y="0" width="8" height="20" rx="4" fill="${c}"/></g><g transform="translate(73 55) rotate(${f(-a.arm[1])})"><rect x="-4" y="0" width="8" height="20" rx="4" fill="${c}"/></g>
      <rect x="32" y="52" width="36" height="26" rx="6" fill="${c}"/>
      <g transform="translate(0 ${f(a.hb)})"><path d="M50 25Q50 19 ${f(tx)} ${f(ty)}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/><circle cx="${f(tx)}" cy="${f(ty)}" r="3" fill="${c}"/><rect x="32" y="24" width="36" height="25" rx="10" fill="${c}"/>${eyes('dot',[[42,37],[58,37]],2.8,a,id,'#0E2B24')}</g>`;}},
  puffin:{base:88,ht:18,rx:72,lx:28,shadow:1,
    draw:(a,id)=>{const N=INK,O='#FFB000';
      const crest=[[-26,7],[0,9],[26,7]].map(([g,L])=>leaf(50+g*.12,28,g+a.sway-a.droop*.0+(g?Math.sign(g)*a.droop:a.droop),L*a.perk,2.3,N)).join('');
      return `<ellipse cx="${f(30)}" cy="${f(86.5-a.leg[0])}" rx="7" ry="2.6" fill="${O}"/><ellipse cx="70" cy="${f(86.5-a.leg[1])}" rx="7" ry="2.6" fill="${O}"/>${crest}
      <g transform="translate(33 52) rotate(${f(28+a.arm[0])})"><rect x="-4" y="0" width="8" height="24" rx="4" fill="${N}"/></g><g transform="translate(67 52) rotate(${f(-28-a.arm[1])})"><rect x="-4" y="0" width="8" height="24" rx="4" fill="${N}"/></g>
      <path d="M30 47A20 20 0 0 1 70 47V82Q70 88 64 88H36Q30 88 30 82Z" fill="${N}"/>
      <path d="M37 51A13 13 0 0 1 63 51V78Q63 82 59 82H41Q37 82 37 78Z" fill="#FFFFFF"/>
      ${eyes('dothi',[[44,51],[56,51]],4.1,a,id,N)}
      <path d="M44 60H56Q57 60 56.3 61L50.8 66Q50 66.6 49.2 66L43.7 61Q43 60 44 60Z" fill="${O}"/>`;}},
  drop:{base:88,ht:24,rx:72,lx:28,shadow:1,
    defs:id=>`<linearGradient id="${id}dg" gradientUnits="userSpaceOnUse" x1="50" y1="22" x2="50" y2="88"><stop offset="0" stop-color="#FFD36E"/><stop offset=".45" stop-color="#FF8A5B"/><stop offset="1" stop-color="#F0458C"/></linearGradient>${GL(id)}`,
    draw:(a,id)=>{const tx=50+a.sway*.6+a.droop*.45,ty=26-(a.perk-1)*12+a.droop*.35;
      return `<path d="M${f(tx)} ${f(ty)}C56 38 72 50 72 66A22 22 0 0 1 28 66C28 50 44 38 ${f(tx)} ${f(ty)}Z" fill="url(#${id}dg)"/><ellipse cx="37" cy="56" rx="2.6" ry="6.5" transform="rotate(28 37 56)" fill="#FFFFFF" opacity=".45"/>${eyes('gloss',[[42,68],[58,68]],4,a,id,'#FFFFFF')}`;}},
  dome:{base:88,ht:14,rx:70,lx:30,shadow:1,
    draw:(a,id)=>{const c='#1D5BF5',tx=50+a.sway*.4+a.droop*.35,ty=16-(a.perk-1)*8+a.droop*.2;
      return `<rect x="34" y="54" width="32" height="34" rx="12" fill="${c}"/><ellipse cx="50" cy="55.5" rx="${f(12+a.hb)}" ry="1.8" fill="#0B2A80" opacity=".35"/>
      <g transform="translate(0 ${f(a.hb-1)})"><path d="M50 27Q47 21 ${f(tx)} ${f(ty)}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><circle cx="${f(tx)}" cy="${f(ty)}" r="2.8" fill="#FFBE2E"/><rect x="30" y="26" width="40" height="23" rx="11.5" fill="${c}"/><rect x="35" y="31" width="30" height="13" rx="6.5" fill="#0B1A4A"/>${eyes('dot',[[44,37.5],[56,37.5]],2.5,a,id,'#9DB6FA')}</g>`;}},
  tuftile:{tile:['#FFF6F1','#FFBCA6'],base:76,ht:32,rx:67,lx:33,
    draw:(a,id)=>{const c='#F46A45';let sc='';for(let i=0;i<4;i++){const k=i-1.5,x=50+k*5,ang=a.sway*(1+.15*k)+a.droop*(Math.sign(k)||1)*.6;sc+=`<ellipse transform="rotate(${f(ang)} ${f(x)} 42)" cx="${f(x)}" cy="40.4" rx="2.5" ry="${f(5*a.perk)}" fill="${c}"/>`;}
      return `${sc}${tuftBody(33,40,34,36,7,c)}${eyes('dot',[[45.2,53],[54.8,53]],2.2,a,id,'#111111')}`;}},
  buntile:{tile:['#4A22C4','#150A4E'],base:74,ht:26,rx:68,lx:30,
    defs:bunnyDefs,draw:(a,id)=>`<g transform="translate(20.5 22) scale(.6)">${bunny(a,id)}</g>`}
};
let uid=0;
function render(v,s,t,el){
  const D=P[v]||P.bunny,a=anim(s,t),cx=50,G=D.base;
  if(el){el._tl=lerp(el._tl??a.tilt,a.tilt,.22);a.tilt=el._tl;el._lx=lerp(el._lx??a.look[0],a.look[0],.35);el._ly=lerp(el._ly??a.look[1],a.look[1],.35);a.look=[el._lx,el._ly];
    el._a0=lerp(el._a0??a.arm[0],a.arm[0],.25);el._a1=lerp(el._a1??a.arm[1],a.arm[1],.25);a.arm=[el._a0,el._a1];}
  const id='p2'+(el?(el._id||(el._id=++uid)):0)+'_';
  const sx=1+(1-a.sy)*.6;
  let o=`<defs>${D.defs?D.defs(id):''}${D.tile?`<linearGradient id="${id}tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${D.tile[0]}"/><stop offset="1" stop-color="${D.tile[1]}"/></linearGradient>`:''}</defs>`;
  if(D.tile)o+=`<rect x="12" y="12" width="76" height="76" rx="21" fill="url(#${id}tg)"/><rect x="12.6" y="12.6" width="74.8" height="74.8" rx="20.4" fill="none" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="1.2"/><ellipse cx="${f(cx+a.dx)}" cy="${G+.8}" rx="${f(15*(1+a.dy/40))}" ry="1.6" fill="#140A3A" opacity="${f(.16*(1+a.dy/30))}"/>`;
  if(D.shadow)o+=`<ellipse cx="${f(cx+a.dx)}" cy="${G+1.2}" rx="${f(22*(1+a.dy/40))}" ry="1.5" fill="#141A3A" opacity="${f(.09*(1+a.dy/30))}"/>`;
  o+=`<g transform="translate(${f(cx+a.dx)} ${f(G+a.dy)}) rotate(${f(a.tilt)}) scale(${f(sx)} ${f(a.sy)}) translate(${-cx} ${-G})">${D.draw(a,id)}</g>`;
  const hy=G-(G-D.ht)*a.sy+a.dy,rx=D.rx+a.dx,lx=D.lx+a.dx,sc=D.tile?.75:1,ink=D.tile&&D.tile[1]==='#150A4E'?'#FFFFFF':INK;
  let ov='';
  if(s==='thinking')ov=[0,1,2].map(i=>`<circle cx="${f(rx+1+i*3.4*sc)}" cy="${f(hy-1-i*2.2*sc)}" r="${f((1.2+i*.25)*sc)}" fill="${ink}" opacity="${Math.floor(t*3)%4>i?1:.2}"/>`).join('');
  if(s==='waiting')ov=[0,1,2].map(i=>`<circle cx="${f(cx-4+i*4)}" cy="${f(hy-6)}" r="1.1" fill="${ink==='#FFFFFF'?'#C9C0FF':'#9EA4B8'}" opacity="${Math.floor(t*1.5)%3===i?1:.3}"/>`).join('');
  if(s==='listening')ov=[1,2].map(i=>{const al=.5+.5*Math.sin(t*6-i),x=lx-2-i*3*sc,y=G-(G-D.ht)*.5;return `<path d="M${f(x)} ${f(y-4-i)}q${f(-2-i*.6)} ${4+i} 0 ${8+i*2}" fill="none" stroke="${ink}" stroke-width="1.3" stroke-linecap="round" opacity="${f(al)}"/>`;}).join('');
  if(s==='helping'){const p=ph(t,2.2),e=p<.35?eo(p/.35):1-eo(seg(p,.6,1));ov=`<path d="M${f(rx+3+2*e)} ${f(G-(G-D.ht)*.5-3)}l3 3l-3 3" fill="none" stroke="${ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="${f(e)}"/>`;}
  if(s==='success'){const p=ph(t,1.7),k=seg(p,.3,.75),w=rx-lx;if(k>0&&k<1)ov=[[-1,-1],[1,-1],[-1.3,.1],[1.3,.1],[0,-1.4]].map(([q,b],i)=>`<circle cx="${f(cx+q*(w*.4+8*k*sc))}" cy="${f(hy+6+b*(8+8*k)*sc)}" r="${f(1.6*(1-k)+.3)}" fill="${['#FFBE2E','#FF7EB3','#1D5BF5','#3DDBB0','#F46A45'][i]}"/>`).join('');}
  if(s==='error'){const p=ph(t,2.4),k=seg(p,.3,1);ov=`<path transform="translate(${f(rx)} ${f(hy+4+k*6)})" d="M0 -3C1.6 -.6 2 .4 2 1.2A2 2 0 0 1 -2 1.2C-2 .4 -1.6 -.6 0 -3Z" fill="#8FC8FF" opacity="${f(1-k*.8)}"/>`;}
  if(s==='attention'){const p=ph(t,1.3),e=eo(seg(p,0,.25));ov=`<g transform="translate(${f(rx+1)} ${f(hy-2)}) scale(${f((.6+.4*e)*sc)})"><rect x="-1.1" y="-8" width="2.2" height="6" rx="1.1" fill="${ink}"/><circle cy="1" r="1.2" fill="${ink}"/></g>`;}
  return o+ov;
}
class AePet2 extends HTMLElement{
  static get observedAttributes(){return['v','state'];}
  set v(x){this._v=x;} get v(){return this._v||this.getAttribute('v')||'bunny';}
  set state(x){if(x!==this._s){this._s=x;this.t0=performance.now();}} get state(){return this._s||this.getAttribute('state')||'idle';}
  attributeChangedCallback(n,o,x){if(n==='state')this._s=x;if(n==='v')this._v=x;this.t0=performance.now();}
  connectedCallback(){
    if(!this.svg){this.style.display='block';this.innerHTML='<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block;overflow:visible"></svg>';this.svg=this.firstChild;}
    this.t0=this.t0||performance.now();this.vis=true;
    this.io=new IntersectionObserver(e=>{this.vis=e[e.length-1].isIntersecting;});this.io.observe(this);
    const loop=now=>{this.raf=requestAnimationFrame(loop);if(!this.vis||now-(this.last||0)<33)return;this.last=now;this.svg.innerHTML=render(this.v,this.state,Math.max(0,(now-this.t0)/1000),this);};
    this.raf=requestAnimationFrame(loop);
  }
  disconnectedCallback(){cancelAnimationFrame(this.raf);this.io&&this.io.disconnect();}
}
customElements.define('ae-pet2',AePet2);
})();

/* ae-cat */
(()=>{
if(customElements.get('ae-cat'))return;
const BX=343,BY=615,TAU=Math.PI*2,K=.5523;
const PTS=[[205,85,1,0],[215,68,1,0],[238,70,1,0],[245,95,1,0],[252,125,.75,0],[255,152,.35,0],[285,160,.1,0],[330,165,0,0],[400,162,0,0],[430,150,0,.12],[460,135,0,.4],[470,98,0,.8],[480,80,0,1],[490,62,0,1],[515,65,0,1],[522,85,0,1],[560,180,0,.35],[600,320,0,0],[598,440,0,0],[596,540,0,0],[570,612,0,0],[480,615,0,0],[380,618,0,0],[300,618,0,0],[200,612,0,0],[110,606,0,0],[82,540,0,0],[80,450,0,0],[78,330,0,0],[150,190,.35,0]];
const PL=[238,180],PR=[470,172];
const EYES=[[198,388,43,87,8,.9],[372,383,50,100,10,1.1]];
const SPARK=[[95,150,26],[612,70,20],[648,290,22],[40,330,16],[70,560,20],[640,540,16]];
const cl=(x,a=0,b=1)=>x<a?a:x>b?b:x, rnd=(a,b)=>a+Math.random()*(b-a), f=n=>n.toFixed(1), now=()=>performance.now()/1000;
const eo=p=>1-Math.pow(1-p,3);
const PTR={x:0,y:0,t:-9};
addEventListener('pointermove',e=>{PTR.x=e.clientX;PTR.y=e.clientY;PTR.t=now();},{passive:true});
let NOISE=null;
function noise(){
  if(NOISE)return NOISE;
  const c=document.createElement('canvas');c.width=343;c.height=344;const x=c.getContext('2d');
  for(let i=0;i<16000;i++){const a=Math.random();x.fillStyle=`rgba(64,34,128,${(.15+a*a*.8).toFixed(2)})`;x.fillRect(Math.floor(Math.random()*343),Math.floor(Math.random()*344),1,1);}
  return NOISE=c.toDataURL();
}
const SPR={dx:[170,21],dy:[170,21],q:[300,13],tilt:[150,17],sh:[240,11],earL:[170,9.5],earR:[170,9.5],perkL:[210,11],perkR:[210,11],lookX:[480,40],lookY:[480,40],lid:[220,26],happy:[220,24],es:[280,19],worry:[200,24],close:[300,32],blink:[1600,64]};
const LAYERS=['breath','bob','shake','sway','nod'],OVS=['think','listen','help','wait','attn','sweat','spark'];
LAYERS.forEach(l=>SPR['A_'+l]=[60,15.5]);
OVS.forEach(o=>SPR['o_'+o]=o==='attn'?[320,12]:[150,18]);
const BASE={dx:0,dy:0,q:0,tilt:0,sh:0,earL:0,earR:0,perkL:1,perkR:1,lookX:0,lookY:0,lid:0,happy:0,es:1,worry:0,close:0,blink:0};
const STATES={
  idle:{layers:['breath'],rand:1,pose(T,u,e,t){e.look(T,t);T.tilt+=T.lookX*.07;}},
  thinking:{L:4.6,layers:['breath'],ov:['think'],twitch:1,pose(T,u){const a=u%4.6<2.3;T.lookX=a?32:-26;T.lookY=-36;T.tilt=a?8:-6;T.dx=a?8:-8;T.earR=a?14:-4;T.earL=a?-6:12;T.perkR=a?.92:1.05;T.perkL=a?1.05:.92;T.lid=.32;T.q=.02;}},
  listening:{L:1.6,layers:['breath','nod'],ov:['listen'],ev:[[.35,e=>e.imp('earL',-170)],[1.15,e=>e.imp('earR',-170)]],pose(T){T.lookX=-12;T.lookY=-4;T.es=1.2;T.perkL=T.perkR=1.2;T.earL=T.earR=-10;T.q=.045;T.tilt=-6;T.dx=-12;}},
  helping:{L:1.8,layers:['breath'],ov:['help'],ev:[[.2,e=>e.imp('dx',120)]],pose(T){T.lookX=38;T.lookY=8;T.tilt=8;T.dx=18;T.earL=-4;T.earR=10;T.happy=.4;}},
  working:{L:1.3,layers:['bob'],pose(T,u){const p=u%1.3;T.lookX=p<1.05?-22+44*(p/1.05):-22;T.lookY=16;T.lid=.48;T.earL=T.earR=-3;}},
  success:{L:2.1,layers:['breath'],ov:['spark'],ev:[[.24,e=>e.jump(480)]],pose(T,u){const p=u%2.1;T.happy=1;T.lookY=-6;T.perkL=T.perkR=1.08;T.earL=T.earR=5;if(p<.24)T.q=-.13;}},
  error:{L:2.8,layers:['shake'],ov:['sweat'],pose(T){T.es=.74;T.worry=15;T.lookY=18;T.lookX=-4;T.earL=T.earR=46;T.perkL=T.perkR=.8;T.q=-.06;T.dy=8;T.lid=.15;}},
  waiting:{L:3.2,layers:['breath','sway'],ov:['wait'],ev:[[.9,e=>e.imp('earR',240)],[2.5,e=>e.imp('earL',240)]],pose(T,u){const a=u%3.2<1.6;T.lid=.6;T.lookX=a?-28:28;T.lookY=6;T.tilt=a?-4:4;T.earL=a?8:-2;T.earR=a?-2:8;T.q=-.02;}},
  attention:{L:2.3,layers:['breath'],ov:['attn'],ev:[[.12,e=>e.jump(340)],[.46,e=>e.jump(340)]],pose(T,u){const p=u%2.3;T.es=1.3;T.perkL=T.perkR=1.2;T.earL=T.earR=-9;T.lookX=-10;T.lookY=-6;if(p<.12)T.q=-.09;}},
  dismissed:{L:3.8,layers:['breath'],ev:[[2.17,e=>e.jump(320)]],pose(T,u){const p=u%3.8;if(p<2.05){T.dy=55;T.q=-.1;T.close=1;T.earL=T.earR=50;T.perkL=T.perkR=.8;T.tilt=-2;T.lookY=10;}else if(p<2.17){T.q=-.12;T.happy=.25;}else T.happy=.25;}}
};
const els=new Set();let running=false,last=0;
function loop(ts){const t=ts/1000,dt=Math.min(.05,Math.max(0,t-(last||t)));last=t;els.forEach(e=>{e.tick(dt,t);});requestAnimationFrame(loop);}
const io=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(es=>es.forEach(en=>{en.target._vis=en.isIntersecting;}),{rootMargin:'120px'}):null;
let uid=0;
class AeCat extends HTMLElement{
  static get observedAttributes(){return['state','tile'];}
  constructor(){super();this._st='idle';this._t0=now();this._lt={breath:0};this._built=false;this._cyc=-1;this._fired=new Set();
    this.S={};for(const k in SPR)this.S[k]={x:k.startsWith('o_')||(k.startsWith('A_')&&k!=='A_breath')?0:(k==='A_breath'?1:BASE[k]),v:0,k:SPR[k][0],c:SPR[k][1]};
    this.ay=0;this.av=0;this.vdx=0;this.vdy=0;this.vtl=0;this.pdx=null;this._ns=0;this._sx=0;this._sy=0;this._nb=now()+rnd(1,3);this._bk=-9;this._ntw=now()+rnd(2,5);this._boop=-9;}
  get state(){return this._st;} set state(v){this.setAttribute('state',v);}
  get tile(){return this.getAttribute('tile');} set tile(v){this.setAttribute('tile',v);}
  connectedCallback(){if(!this._built)this.build();els.add(this);io&&io.observe(this);if(!running){running=true;requestAnimationFrame(loop);}}
  disconnectedCallback(){els.delete(this);io&&io.unobserve(this);}
  attributeChangedCallback(n,o,v){
    if(n==='state'){const s=STATES[v]?v:'idle';if(s!==this._st){this._st=s;this._t0=now();this._cyc=-1;(STATES[s].layers||[]).forEach(l=>{if(this.S['A_'+l].x<.05)this._lt[l]=now();});}}
    if(n==='tile'&&this._built)this.applyTile();
  }
  build(){
    this._built=true;const id='aec'+(++uid);
    if(!this.style.display)this.style.display='block';
    const circ=(r,n)=>Array.from({length:n},(_,i)=>`<circle data-r="${r}${i}" r="0" fill="#000"/>`).join('');
    this.innerHTML=`<svg viewBox="0 0 686 688" width="100%" height="100%" style="display:block;overflow:visible;cursor:pointer;-webkit-tap-highlight-color:transparent">
<defs><linearGradient id="${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EADFFD"/><stop offset=".55" stop-color="#C4A9F6"/><stop offset="1" stop-color="#9F7AF0"/></linearGradient>
<radialGradient id="${id}gm" cx="1" cy="1" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="${id}mk"><rect width="686" height="688" fill="url(#${id}gm)"/></mask>
<clipPath id="${id}cp"><rect data-r="crect" width="686" height="688"/></clipPath></defs>
<g data-r="tile"><rect data-r="tbg" width="686" height="688" fill="url(#${id}bg)"/><image href="${noise()}" width="686" height="688" preserveAspectRatio="none" mask="url(#${id}mk)" style="image-rendering:pixelated"/></g>
<g data-r="cg"><ellipse data-r="sh" cx="343" cy="632" rx="230" ry="14" fill="#3A1D8C" opacity="0"/>
<g data-r="body"><path data-r="head" fill="#000"/><path data-r="e0" fill="#fff"/><path data-r="e1" fill="#fff"/></g>
<g data-r="ov">${circ('th',3)}${[0,1,2].map(i=>`<path data-r="ls${i}" fill="none" stroke="#000" stroke-width="16" stroke-linecap="round" opacity="0"/>`).join('')}
<g data-r="hp" opacity="0"><path d="M-12 -22L10 0L-12 22" fill="none" stroke="#000" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 -22L36 0L14 22" fill="none" stroke="#000" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".4"/></g>
${circ('wt',3)}<g data-r="at" opacity="0"><rect x="-10" y="-50" width="20" height="62" rx="10" fill="#000"/><circle cy="34" r="11" fill="#000"/></g>
<path data-r="sw" d="M0 -24C9 -9 15 0 15 9A15 15 0 1 1 -15 9C-15 0 -9 -9 0 -24Z" fill="#fff" opacity="0"/>
${SPARK.map((_,i)=>`<path data-r="sp${i}" d="M0 -1C.13 -.13 .13 -.13 1 0C.13 .13 .13 .13 0 1C-.13 .13 -.13 .13 -1 0C-.13 -.13 -.13 -.13 0 -1Z" opacity="0"/>`).join('')}</g></g></svg>`;
    this.r={};this.querySelectorAll('[data-r]').forEach(n=>this.r[n.dataset.r]=n);
    this.r.cg.setAttribute('clip-path',`url(#${id}cp)`);this._cid=id;
    const L=[50,82,114];L.forEach((r,i)=>{const a0=195*Math.PI/180,a1=255*Math.PI/180,cx=160,cy=118;this.r['ls'+i].setAttribute('d',`M${f(cx+r*Math.cos(a0))} ${f(cy+r*Math.sin(a0))}A${r} ${r} 0 0 1 ${f(cx+r*Math.cos(a1))} ${f(cy+r*Math.sin(a1))}`);});
    this.addEventListener('pointerdown',()=>this.boop());
    this.applyTile();this.tick(0,now());
  }
  applyTile(){
    const t=this.getAttribute('tile')||'square',none=t==='none',rx=t==='rounded'?150:0;
    this.r.tile.style.display=none?'none':'';this.querySelector('svg').setAttribute('viewBox',none?'-70 -90 826 826':'0 0 686 688');this.r.tbg.setAttribute('rx',rx);this.r.crect.setAttribute('rx',rx);
    if(none)this.r.cg.removeAttribute('clip-path');else this.r.cg.setAttribute('clip-path',`url(#${this._cid}cp)`);
    this._none=none;SPARK.forEach((_,i)=>this.r['sp'+i].setAttribute('fill',i%2?'#FFD84D':(none?'#9F7AF0':'#FFFFFF')));
    this.r.sw.setAttribute('fill',none?'#9F7AF0':'#FFFFFF');
  }
  imp(k,v){this.S[k].v+=v;}
  jump(v0){this.av=-v0;this.ay=-.01;this.S.q.v+=v0*.003;this.S.perkL.v-=v0*.002;this.S.perkR.v-=v0*.002;}
  land(v){this.S.q.v-=v*.0034;this.S.perkL.v-=v*.0028;this.S.perkR.v-=v*.0028;this.S.es.v-=v*.001;}
  boop(){const t=now();this._boop=t;this.S.q.v-=2.8;this.imp('earL',280);this.imp('earR',280);this.S.es.v+=2;}
  look(T,t){
    if(this.hasAttribute('follow')&&PTR.t>t-2.5){
      const r=this.getBoundingClientRect();if(r.width>0){const cx=r.left+r.width*.42,cy=r.top+r.height*.56,vx=(PTR.x-cx)/(r.width*1.1),vy=(PTR.y-cy)/(r.height*1.1),m=Math.hypot(vx,vy),s=m>1?1/m:1;
      T.lookX=vx*s*40;T.lookY=vy*s*30;T.dx=T.lookX*.3;T.dy=T.lookY*.12;return;}
    }
    if(t>this._ns){const back=Math.random()<.3;this._sx=back?rnd(-4,4):rnd(-24,24);this._sy=back?rnd(-3,3):rnd(-12,9);this._ns=t+rnd(1.3,3.6);}
    T.lookX=this._sx;T.lookY=this._sy;
  }
  tick(dt,t){
    const S=this.S,D=STATES[this._st],u=t-this._t0,T=Object.assign({},BASE);
    if(D.L&&D.ev){const c=Math.floor(u/D.L),lu=u-c*D.L;if(c!==this._cyc){this._cyc=c;this._fired=new Set();}D.ev.forEach(([et,fn],i)=>{if(lu>=et&&!this._fired.has(i)){this._fired.add(i);fn(this);}});}
    if(t>this._nb){this._bk=t;this._nb=t+(Math.random()<.18?.24:rnd(2.2,5.5));}
    if((D.rand||D.twitch)&&t>this._ntw){this.imp(Math.random()<.5?'earL':'earR',rnd(200,320)*(Math.random()<.75?1:-1));this._ntw=t+rnd(2.6,6.5);}
    D.pose(T,u,this,t);
    T.blink=t-this._bk<.075?1:0;
    if(t-this._boop<.65){T.happy=Math.max(T.happy,1);T.close=0;}
    const vx=cl(this.vdx,-900,900),vy=cl(this.vdy,-900,900),vt=cl(this.vtl,-160,160);
    T.earL+=vx*.018+vt*.08;T.earR+=-vx*.018-vt*.08;T.perkL+=vy*.0003;T.perkR+=vy*.0003;T.sh=-vx*.00011-vt*.0004;T.lookY+=-vy*.01;
    const A={},on=new Set(D.layers||[]),ov=new Set(D.ov||[]);
    LAYERS.forEach(l=>T['A_'+l]=on.has(l)?1:0);OVS.forEach(o=>T['o_'+o]=ov.has(o)?1:0);
    if(dt>0){const n=Math.max(1,Math.ceil(dt*240)),h=dt/n;
      for(let s=0;s<n;s++){for(const k in S){const p=S[k];p.v+=(p.k*(T[k]-p.x)-p.c*p.v)*h;p.x+=p.v*h;}
        if(this.ay<0||this.av<0){this.av+=2600*h;this.ay+=this.av*h;if(this.ay>=0&&this.av>0){this.land(this.av);this.ay=0;this.av=0;}}}}
    const a=l=>S['A_'+l].x,lt=l=>t-(this._lt[l]??0);
    let dx=S.dx.x,dy=S.dy.x+this.ay,q=S.q.x,tl=S.tilt.x;
    if(a('breath')>.001)q+=.016*Math.sin(TAU*t/3.4)*a('breath');
    if(a('bob')>.001){const ph=lt('bob')/.5,A0=a('bob');dy+=-7*(.5-.5*Math.cos(TAU*ph))*A0;q+=-.028*Math.cos(TAU*ph)*A0;tl+=2.4*Math.sin(Math.PI*ph)*A0;}
    if(a('shake')>.001){const ts=lt('shake')%2.8,e=ts<.8?Math.pow(1-ts/.8,2):0,A0=a('shake');dx+=26*e*Math.sin(TAU*7.5*ts)*A0;tl+=3.5*e*Math.sin(TAU*7.5*ts+.7)*A0;}
    if(a('sway')>.001){const ts=lt('sway'),A0=a('sway');tl+=4.5*Math.sin(TAU*ts/3.2)*A0;dx+=10*Math.sin(TAU*ts/3.2)*A0;}
    if(a('nod')>.001){dy+=9*(.5-.5*Math.cos(TAU*lt('nod')/1.6))*a('nod');}
    if(dt>0&&this.pdx!==null){const m=.4;this.vdx+=((dx-this.pdx)/dt-this.vdx)*m;this.vdy+=((dy-this.pdy)/dt-this.vdy)*m;this.vtl+=((tl-this.ptl)/dt-this.vtl)*m;}
    this.pdx=dx;this.pdy=dy;this.ptl=tl;
    this.draw(dx,dy,q,tl,t);
  }
  draw(dx,dy,q,tl,t){
    const S=this.S,r=this.r,aL=-S.earL.x*Math.PI/180,aR=S.earR.x*Math.PI/180,pL=S.perkL.x,pR=S.perkR.x,sh=S.sh.x;
    const P=PTS.map(([x,y,wl,wr])=>{
      if(wl){const ang=aL*wl,c=Math.cos(ang),s=Math.sin(ang),sc=1+(pL-1)*wl,vx=(x-PL[0])*sc,vy=(y-PL[1])*sc;x=PL[0]+vx*c-vy*s;y=PL[1]+vx*s+vy*c;}
      if(wr){const ang=aR*wr,c=Math.cos(ang),s=Math.sin(ang),sc=1+(pR-1)*wr,vx=(x-PR[0])*sc,vy=(y-PR[1])*sc;x=PR[0]+vx*c-vy*s;y=PR[1]+vx*s+vy*c;}
      x+=sh*(BY-y);return f(x)+' '+f(y);});
    let d='M'+P[0];for(let i=1;i<30;i+=3)d+='C'+P[i]+' '+P[i+1]+' '+P[(i+2)%30];
    r.head.setAttribute('d',d+'Z');
    const sy=1+q,sx=1-q*.75;
    r.body.setAttribute('transform',`translate(${f(dx+BX)} ${f(dy+BY)}) rotate(${tl.toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-BX} ${-BY})`);
    const lx=S.lookX.x,ly=S.lookY.x,es=S.es.x,lid=cl(S.lid.x,-.3,1),hp=S.happy.x,c=cl(S.close.x+S.blink.x,0,1),wo=S.worry.x;
    EYES.forEach(([cx,cy,rx,ry,rot,par],i)=>{
      const RX=rx*es*(1+hp*.06)*(1-Math.abs(lx)*.0015),RY=ry*es,ryT=RY*(1-c*.93)*(1-lid*.5);
      let ryB=RY*(1-c*.82)*(1-hp*1.45);ryB=Math.max(ryB,-ryT*.62);
      const yo=c*RY*.42-hp*RY*.12+lid*RY*.18,kx=K*RX,kt=K*ryT,kb=K*ryB;
      r['e'+i].setAttribute('transform',`translate(${f(cx+lx*par)} ${f(cy+ly+yo)}) rotate(${(rot+(i?-wo:wo)).toFixed(2)})`);
      r['e'+i].setAttribute('d',`M${f(-RX)} 0C${f(-RX)} ${f(-kt)} ${f(-kx)} ${f(-ryT)} 0 ${f(-ryT)}C${f(kx)} ${f(-ryT)} ${f(RX)} ${f(-kt)} ${f(RX)} 0C${f(RX)} ${f(kb)} ${f(kx)} ${f(ryB)} 0 ${f(ryB)}C${f(-kx)} ${f(ryB)} ${f(-RX)} ${f(kb)} ${f(-RX)} 0Z`);
    });
    const lift=Math.max(0,-dy);
    if(this._none){r.sh.setAttribute('opacity',f(Math.max(.05,.16-lift*.002)*10/10));r.sh.setAttribute('rx',f(240*(1-lift*.0022)));r.sh.setAttribute('fill','#141A3A');}
    else{r.sh.setAttribute('opacity',Math.min(.28,lift*.007).toFixed(3));r.sh.setAttribute('rx',f(230*(1-lift*.0025)));}
    r.ov.setAttribute('transform',`translate(${f(dx*.85)} ${f(dy*.85)})`);
    const o=k=>S['o_'+k].x;
    let A=o('think');[[632,150,15],[680,96,21],[724,34,28]].forEach(([x,y,R],i)=>{const ph=t/1.5-i*.2,v=cl(A*1.6-i*.3);const n=r['th'+i];n.setAttribute('cx',x);n.setAttribute('cy',f(y-8*Math.sin(TAU*ph)));n.setAttribute('r',f(R*v*(.84+.16*Math.sin(TAU*ph))));n.setAttribute('opacity',(v*(.8+.2*(.5+.5*Math.sin(TAU*ph)))).toFixed(3));});
    A=cl(o('listen'));for(let i=0;i<3;i++){const p=((t/1.2-i*.16)%1+1)%1;r['ls'+i].setAttribute('opacity',(A*(.35+.65*Math.max(0,Math.sin(Math.PI*p)))).toFixed(3));}
    A=o('help');r.hp.setAttribute('opacity',cl(A).toFixed(3));r.hp.setAttribute('transform',`translate(${f(676+9*(.5-.5*Math.cos(TAU*t/.9)))} 420) scale(${cl(A,0,1.2).toFixed(3)})`);
    A=o('wait');[292,346,400].forEach((x,i)=>{const p=((t/1.2-i*.18)%1+1)%1,lf=p<.4?Math.sin(Math.PI*p/.4):0,v=cl(A*1.6-i*.3),n=r['wt'+i];n.setAttribute('cx',x);n.setAttribute('cy',f(36-18*lf));n.setAttribute('r',f(16*v*(1+.12*lf)));n.setAttribute('opacity',(v*(.7+.3*lf)).toFixed(3));});
    A=o('attn');r.at.setAttribute('opacity',cl(A*1.5).toFixed(3));r.at.setAttribute('transform',`translate(655 128) rotate(${(7*Math.sin(TAU*t/.8)).toFixed(2)}) scale(${Math.max(0,A).toFixed(3)})`);
    A=cl(o('sweat'));{const ps=(t%1.5)/1.5,op=ps<.15?ps/.15:1-(ps-.15)/.85;r.sw.setAttribute('opacity',(A*op).toFixed(3));r.sw.setAttribute('transform',`translate(600 ${f(205+70*eo(ps))}) scale(${(A*(1-ps*.3)).toFixed(3)})`);}
    A=cl(o('spark'));SPARK.forEach(([x,y,R],i)=>{const p=((t/1.3+i/6)%1),s=Math.sin(Math.PI*p);const n=r['sp'+i];n.setAttribute('opacity',(A*s).toFixed(3));n.setAttribute('transform',`translate(${x} ${y}) rotate(${f(p*90)}) scale(${f(Math.max(.001,R*s*A))})`);});
  }
}
customElements.define('ae-cat',AeCat);
})();
