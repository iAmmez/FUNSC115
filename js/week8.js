const W8 = { explosionTimer: null, explosionT: 0, explosionFormula: '' };
const $ = id => document.getElementById(id);
const num = id => Number($(id)?.value || 0);
function setText(id, text) { const el = $(id); if (el) el.textContent = text; }
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
function mapX(x){ return 460 + x*60; }
function mapY(y){ return 260 - y*50; }
function lineSet(id, x1, y1, x2, y2){ const e=$(id); if(!e) return; e.setAttribute('x1',x1); e.setAttribute('y1',y1); e.setAttribute('x2',x2); e.setAttribute('y2',y2); }
function circleSet(id, x, y, r=null){ const e=$(id); if(!e) return; e.setAttribute('cx',x); e.setAttribute('cy',y); if(r!==null)e.setAttribute('r',r); }
function textSetPos(id, x, y){ const e=$(id); if(!e) return; e.setAttribute('x',x); e.setAttribute('y',y); }
function svgGrid(groupId, x0=460, y0=260, xStep=60, yStep=50, nx=6, ny=4){
  const g=$(groupId); if(!g) return; let out='';
  for(let i=-nx;i<=nx;i++){ const x=x0+i*xStep; out+=`<line x1="${x}" y1="50" x2="${x}" y2="470" stroke="#e5e7eb" stroke-width="1"/>`; if(i!==0) out+=`<text x="${x}" y="282" text-anchor="middle" class="w8-axis-label">${i}</text>`; }
  for(let j=-ny;j<=ny;j++){ const y=y0-j*yStep; out+=`<line x1="80" y1="${y}" x2="850" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`; if(j!==0) out+=`<text x="438" y="${y+4}" text-anchor="end" class="w8-axis-label">${j}</text>`; }
  g.innerHTML=out;
}
function updateW8COM(){
  svgGrid('w8ComGrid',460,260,60,50,6,4);
  const m=[num('w8m1'),num('w8m2'),num('w8m3')], x=[num('w8x1'),num('w8x2'),num('w8x3')], y=[num('w8y1'),num('w8y2'),num('w8y3')];
  for(let i=0;i<3;i++){ setText(`w8m${i+1}Val`,m[i].toFixed(1)); setText(`w8x${i+1}Val`,x[i].toFixed(1)); setText(`w8y${i+1}Val`,y[i].toFixed(1)); circleSet(`w8p${i+1}`,mapX(x[i]),mapY(y[i]),12+2*m[i]); textSetPos(`w8p${i+1}Label`,mapX(x[i])+15,mapY(y[i])-15); }
  const M=m.reduce((a,b)=>a+b,0); const xcm=m.reduce((s,mi,i)=>s+mi*x[i],0)/M; const ycm=m.reduce((s,mi,i)=>s+mi*y[i],0)/M;
  circleSet('w8cm',mapX(xcm),mapY(ycm)); textSetPos('w8cmLabel',mapX(xcm)+18,mapY(ycm)-18);
  setText('w8ComFeedback',`\\[M=${M.toFixed(1)}\\ \\mathrm{kg} \，\\quad x_{CM}=${xcm.toFixed(2)}\\ \\mathrm{m},\\quad y_{CM}=${ycm.toFixed(2)}\\ \\mathrm{m}\\]`); renderMath($('w8ComFeedback'));
}
function toggleW8Steps(id){ const e=$(id); if(e) e.hidden=!e.hidden; }
function updateW8Continuous(){
  const N=num('w8N'); setText('w8NVal',String(N)); const g=$('w8DiscreteRod'); if(!g) return; let out='';
  const start=140, end=780, y=150, w=(end-start)/N;
  for(let i=0;i<N;i++){ const alpha=0.25+0.55*i/Math.max(1,N-1); out+=`<rect x="${start+i*w}" y="118" width="${Math.max(1,w-2)}" height="64" fill="rgba(37,99,235,${alpha})" stroke="#fff"/>`; }
  g.innerHTML=out; circleSet('w8DiscreteCM',(start+end)/2,y); setText('w8ContinuousFeedback',`\\[\\sum_{i=1}^{${N}} x_i\\Delta m_i \\;\\longrightarrow\\; \\int x\\,dm\\quad เมื่อแบ่งละเอียดขึ้น\\]`); renderMath($('w8ContinuousFeedback'));
}
function updateW8Rod(){
  const L=num('w8L'); setText('w8LVal',L.toFixed(1)); const non=$('w8NonUniform')?.checked; const left=$('w8RodLeft'), right=$('w8RodRight');
  if(left&&right){ left.setAttribute('fill', non?'#bfdbfe':'#93c5fd'); right.setAttribute('fill', non?'#2563eb':'#bfdbfe'); }
  const cm=non? (2/3)*L : L/2; const x=200 + (cm/L)*520; circleSet('w8RodCM',x,132); textSetPos('w8RodCMLabel',x,88);
  setText('w8RodFeedback', non ? `\\[x_{CM}\\approx ${cm.toFixed(2)}\\ \\mathrm{m}\\quad (ความหนาแน่นไม่สม่ำเสมอ: CM ขยับไปด้านขวา)\\]` : `\\[x_{CM}=\\frac{L}{2}=\\frac{${L.toFixed(1)}}{2}=${(L/2).toFixed(2)}\\ \\mathrm{m}\\]`); renderMath($('w8RodFeedback'));
}
function arrow1D(id, x0, y, v, scale, minLen=18){ const len=v*scale; const x2=x0+len; const el=$(id); if(!el) return; el.style.display=Math.abs(len)<1e-6?'none':''; lineSet(id,x0,y,x2,y); }
function arrow2D(id, x0, y0, vx, vy, scale){
  const el=$(id); if(!el) return;
  const len=Math.hypot(vx,vy)*scale;
  el.style.display=len<1e-6?'none':'';
  el.dataset.vectorVisible=len<1e-6?'false':'true';
  const x2=x0+vx*scale, y2=y0-vy*scale;
  lineSet(id,x0,y0,x2,y2);
  return { x: x2, y: y2, visible: len >= 1e-6 };
}
function vectorLabelSet(id, arrowEnd, dx=10, dy=-10){
  const el=$(id); if(!el || !arrowEnd) return;
  el.style.display=arrowEnd.visible?'':'none';
  el.dataset.vectorVisible=arrowEnd.visible?'true':'false';
  textSetPos(id,arrowEnd.x+dx,arrowEnd.y+dy);
}
function updateW8Velocity(){
  svgGrid('w8VelocityGrid',460,260,60,50,6,4);
  const m1=num('w8vm1'), m2=num('w8vm2');
  const x1=num('w8vx1'), y1=num('w8vy1'), x2=num('w8vx2'), y2=num('w8vy2');
  const v1x=num('w8v1x'), v1y=num('w8v1y'), v2x=num('w8v2x'), v2y=num('w8v2y');
  setText('w8vm1Val',m1.toFixed(1)); setText('w8vm2Val',m2.toFixed(1));
  setText('w8vx1Val',x1.toFixed(1)); setText('w8vy1Val',y1.toFixed(1)); setText('w8vx2Val',x2.toFixed(1)); setText('w8vy2Val',y2.toFixed(1));
  setText('w8v1xVal',v1x.toFixed(1)); setText('w8v1yVal',v1y.toFixed(1)); setText('w8v2xVal',v2x.toFixed(1)); setText('w8v2yVal',v2y.toFixed(1));
  const M=m1+m2;
  const xcm=(m1*x1+m2*x2)/M, ycm=(m1*y1+m2*y2)/M;
  const vcmx=(m1*v1x+m2*v2x)/M, vcmy=(m1*v1y+m2*v2y)/M;
  const p1x=mapX(x1), p1y=mapY(y1), p2x=mapX(x2), p2y=mapY(y2), cmx=mapX(xcm), cmy=mapY(ycm);
  circleSet('w8vP1',p1x,p1y,12+2*m1); circleSet('w8vP2',p2x,p2y,12+2*m2); circleSet('w8vCM',cmx,cmy);
  textSetPos('w8vP1Label',p1x+16,p1y-16); textSetPos('w8vP2Label',p2x+16,p2y-16);
  const v1End=arrow2D('w8v1Arrow',p1x,p1y,v1x,v1y,18);
  const v2End=arrow2D('w8v2Arrow',p2x,p2y,v2x,v2y,18);
  const vcmEnd=arrow2D('w8vcmArrow',cmx,cmy,vcmx,vcmy,24);
  vectorLabelSet('w8v1Label',v1End);
  vectorLabelSet('w8v2Label',v2End);
  vectorLabelSet('w8vcmLabel',vcmEnd,14,-14);
  setText('w8VelocityFeedback',`\\[\\vec r_{CM}=${xcm.toFixed(2)}\\hat{i}+${ycm.toFixed(2)}\\hat{j}\\ \\mathrm{m},\\quad \\vec v_{CM}=${vcmx.toFixed(2)}\\hat{i}+${vcmy.toFixed(2)}\\hat{j}\\ \\mathrm{m/s}\\]`);
  renderMath($('w8VelocityFeedback'));
}
function simMapX(x){ return 460 + x*42; }
function simMapY(y){ return 260 - y*42; }
function simState(x0,y0,vx0,vy0,fx,fy,m,t){
  const ax=fx/m, ay=fy/m;
  return { x:x0+vx0*t+0.5*ax*t*t, y:y0+vy0*t+0.5*ay*t*t, vx:vx0+ax*t, vy:vy0+ay*t, ax, ay };
}
function setDisplay(ids, show){ ids.forEach(id=>{ const e=$(id); if(e) e.style.display=(show && e.dataset.vectorVisible!=='false')?'':'none'; }); }
function pathFromPoints(points){ return points.map((p,i)=>(i?'L':'M')+simMapX(p.x)+' '+simMapY(p.y)).join(' '); }
function updateW8Explosion(){
  svgGrid('w8SystemGrid',460,260,42,42,8,5);
  const t=4*W8.explosionT;
  const m1=num('w8sM1'), m2=num('w8sM2'), M=m1+m2;
  const x1=num('w8sX1'), y1=num('w8sY1'), v1x=num('w8sV1x'), v1y=num('w8sV1y'), f1x=num('w8sF1x'), f1y=num('w8sF1y');
  const x2=num('w8sX2'), y2=num('w8sY2'), v2x=num('w8sV2x'), v2y=num('w8sV2y'), f2x=num('w8sF2x'), f2y=num('w8sF2y');
  [['w8sM1Val',m1],['w8sX1Val',x1],['w8sY1Val',y1],['w8sV1xVal',v1x],['w8sV1yVal',v1y],['w8sF1xVal',f1x],['w8sF1yVal',f1y],['w8sM2Val',m2],['w8sX2Val',x2],['w8sY2Val',y2],['w8sV2xVal',v2x],['w8sV2yVal',v2y],['w8sF2xVal',f2x],['w8sF2yVal',f2y]].forEach(([id,v])=>setText(id,v.toFixed(1)));
  const s1=simState(x1,y1,v1x,v1y,f1x,f1y,m1,t), s2=simState(x2,y2,v2x,v2y,f2x,f2y,m2,t);
  const cm={ x:(m1*s1.x+m2*s2.x)/M, y:(m1*s1.y+m2*s2.y)/M, vx:(m1*s1.vx+m2*s2.vx)/M, vy:(m1*s1.vy+m2*s2.vy)/M, ax:(f1x+f2x)/M, ay:(f1y+f2y)/M };
  const p1={x:simMapX(s1.x), y:simMapY(s1.y)}, p2={x:simMapX(s2.x), y:simMapY(s2.y)}, pcm={x:simMapX(cm.x), y:simMapY(cm.y)};
  const points1=[], points2=[], pointsCM=[];
  for(let i=0;i<=70;i++){
    const tt=4*i/70, a=simState(x1,y1,v1x,v1y,f1x,f1y,m1,tt), b=simState(x2,y2,v2x,v2y,f2x,f2y,m2,tt);
    points1.push(a); points2.push(b); pointsCM.push({x:(m1*a.x+m2*b.x)/M,y:(m1*a.y+m2*b.y)/M});
  }
  $('w8Obj1Path')?.setAttribute('d',pathFromPoints(points1)); $('w8Obj2Path')?.setAttribute('d',pathFromPoints(points2)); $('w8CMPath')?.setAttribute('d',pathFromPoints(pointsCM));
  circleSet('w8PieceA',p1.x,p1.y,7+1.1*m1); circleSet('w8PieceB',p2.x,p2.y,7+1.1*m2); circleSet('w8ExplosionCM',pcm.x,pcm.y,10);
  textSetPos('w8Obj1Label',p1.x+15,p1.y-15); textSetPos('w8Obj2Label',p2.x+15,p2.y-15); textSetPos('w8ExplosionLabel',pcm.x+16,pcm.y-14);
  const v1End=arrow2D('w8Obj1VelocityArrow',p1.x,p1.y,s1.vx,s1.vy,28), v2End=arrow2D('w8Obj2VelocityArrow',p2.x,p2.y,s2.vx,s2.vy,28);
  const f1End=arrow2D('w8Obj1ForceArrow',p1.x,p1.y,f1x,f1y,6), f2End=arrow2D('w8Obj2ForceArrow',p2.x,p2.y,f2x,f2y,6);
  const vcmEnd=arrow2D('w8CMVelocityArrow',pcm.x,pcm.y,cm.vx,cm.vy,34), acmEnd=arrow2D('w8CMAccelArrow',pcm.x,pcm.y,cm.ax,cm.ay,78);
  const fnetEnd=arrow2D('w8ResultantForceArrow',pcm.x,pcm.y,f1x+f2x,f1y+f2y,6);
  vectorLabelSet('w8Obj1VelocityLabel',v1End); vectorLabelSet('w8Obj2VelocityLabel',v2End); vectorLabelSet('w8Obj1ForceLabel',f1End); vectorLabelSet('w8Obj2ForceLabel',f2End);
  vectorLabelSet('w8CMVelocityLabel',vcmEnd,12,-12); vectorLabelSet('w8CMAccelLabel',acmEnd,12,18); vectorLabelSet('w8ResultantForceLabel',fnetEnd,12,-12);
  setDisplay(['w8PieceA','w8PieceB','w8Obj1Label','w8Obj2Label'],$('w8ShowPieces')?.checked);
  setDisplay(['w8Obj1Path','w8Obj2Path'],$('w8ShowObjectPaths')?.checked);
  setDisplay(['w8Obj1VelocityArrow','w8Obj2VelocityArrow','w8Obj1VelocityLabel','w8Obj2VelocityLabel'],$('w8ShowObjectVelocity')?.checked);
  setDisplay(['w8Obj1ForceArrow','w8Obj2ForceArrow','w8Obj1ForceLabel','w8Obj2ForceLabel'],$('w8ShowObjectForce')?.checked);
  setDisplay(['w8ExplosionCM','w8ExplosionLabel'],$('w8ShowCM')?.checked);
  setDisplay(['w8CMPath'],$('w8ShowCMPath')?.checked);
  setDisplay(['w8CMVelocityArrow','w8CMVelocityLabel'],$('w8ShowCMVelocity')?.checked);
  setDisplay(['w8CMAccelArrow','w8CMAccelLabel'],$('w8ShowCMAccel')?.checked);
  setDisplay(['w8ResultantForceArrow','w8ResultantForceLabel'],$('w8ShowResultantForce')?.checked);
  const feedback=`\\[
    t=${t.toFixed(2)}\\ \\mathrm{s},\\quad
    \\vec r_{CM}=(${cm.x.toFixed(2)})\\hat{i}+\\ (${cm.y.toFixed(2)})\\hat{j}\\ \\mathrm{m},\\quad
    \\vec v_{CM}=(${cm.vx.toFixed(2)})\\hat{i}+\\ (${cm.vy.toFixed(2)})\\hat{j}\\ \\mathrm{m/s}
  \\]
  \\[
    \\vec a_{CM}=(${cm.ax.toFixed(2)})\\hat{i}+(\\ ${cm.ay.toFixed(2)})\\hat{j}\\ \\mathrm{m/s^2},\\quad
    \\vec F_{net}=(${(f1x+f2x).toFixed(1)})\\hat{i}+\\ (${(f1y+f2y).toFixed(1)})\\hat{j}\\ \\mathrm{N},\\quad
    M=${M.toFixed(1)}\\ \\mathrm{kg}
  \\]`;
  if(feedback!==W8.explosionFormula){ W8.explosionFormula=feedback; setText('w8ExplosionFeedback',feedback); renderMath($('w8ExplosionFeedback')); }
}
function toggleW8Explosion(){
  if(W8.explosionTimer){ clearInterval(W8.explosionTimer); W8.explosionTimer=null; setText('w8ExplosionBtn','▶ Play'); return; }
  setText('w8ExplosionBtn','⏸ Pause'); W8.explosionTimer=setInterval(()=>{ W8.explosionT+=0.012; if(W8.explosionT>1){ W8.explosionT=0; } updateW8Explosion(); },30);
}
function resetW8Explosion(){
  if(W8.explosionTimer){ clearInterval(W8.explosionTimer); W8.explosionTimer=null; }
  W8.explosionT=0;
  setText('w8ExplosionBtn','▶ Play');
  updateW8Explosion();
}
function timeMapX(x){ return 120 + x*48; }
function timeMapY(y){ return 390 - y*32; }
function r1(t){ return [2*t, 8-t*t]; }
function r2(t){ return [12-t, 2*t*t]; }
function updateW8TimeSystem(){
  const t=num('w8Time'); setText('w8TimeVal',t.toFixed(2));
  const g=$('w8TimeGrid'); if(g){ let out=''; for(let i=0;i<=14;i++){ const x=timeMapX(i); out+=`<line x1="${x}" y1="60" x2="${x}" y2="420" stroke="#e5e7eb"/><text x="${x}" y="410" text-anchor="middle" class="w8-axis-label">${i}</text>`; } for(let j=0;j<=10;j+=2){ const y=timeMapY(j); out+=`<line x1="80" y1="${y}" x2="850" y2="${y}" stroke="#e5e7eb"/><text x="108" y="${y+4}" text-anchor="end" class="w8-axis-label">${j}</text>`; } g.innerHTML=out; }
  let d1='', d2=''; for(let i=0;i<=80;i++){ const tt=4*i/80, a=r1(tt), b=r2(tt); d1+=(i?'L':'M')+timeMapX(a[0])+' '+timeMapY(a[1])+' '; d2+=(i?'L':'M')+timeMapX(b[0])+' '+timeMapY(b[1])+' '; } $('w8Path1')?.setAttribute('d',d1); $('w8Path2')?.setAttribute('d',d2);
  const m1=3.5, m2=5.5, M=m1+m2, a=r1(t), b=r2(t); const cm=[(m1*a[0]+m2*b[0])/M,(m1*a[1]+m2*b[1])/M]; circleSet('w8TimeP1',timeMapX(a[0]),timeMapY(a[1])); circleSet('w8TimeP2',timeMapX(b[0]),timeMapY(b[1])); circleSet('w8TimeCM',timeMapX(cm[0]),timeMapY(cm[1]));
  setText('w8TimeFeedback',`\\[\\vec r_1=(${a[0].toFixed(2)},${a[1].toFixed(2)})\\ \\mathrm{cm},\\quad \\vec r_2=(${b[0].toFixed(2)},${b[1].toFixed(2)})\\ \\mathrm{cm},\\quad \\vec r_{CM}=(${cm[0].toFixed(2)},${cm[1].toFixed(2)})\\ \\mathrm{cm}\\]`); renderMath($('w8TimeFeedback'));
}
document.addEventListener('DOMContentLoaded',()=>{ updateW8COM(); updateW8Continuous(); updateW8Rod(); updateW8Velocity(); updateW8Explosion(); updateW8TimeSystem(); });
