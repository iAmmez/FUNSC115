const W7 =  {
  anim:null, collisionT:0, collisionAnim:null, collisionStart:0, collisionProgress:0, collisionPlaying:false, multiAnim:null, multiStart:0, multiProgress:0, multiPlaying:false
}
;
function w7Val(id, fallback=0) {
  const el=document.getElementById(id);
  return el?Number(el.value):fallback
}
function w7Text(id, text) {
  const el=document.getElementById(id);
  if(el) el.textContent=text
}
function w7Line(id, x1, y1, x2, y2) {
  const el=document.getElementById(id);
  if(el) {
    el.setAttribute('x1', x1);
    el.setAttribute('y1', y1);
    el.setAttribute('x2', x2);
    el.setAttribute('y2', y2)
  }
}
function w7VectorLabel(id, x, y, text, dir=1) {
  const el=document.getElementById(id);
  if(el) {
    const minX=dir<0?190:70, maxX=dir<0?850:700;
    el.textContent=text;
    el.setAttribute('x', Math.max(minX, Math.min(maxX, x)));
    el.setAttribute('y', y);
    el.setAttribute('text-anchor', dir<0?'end':'start')
  }
}
function w7Circle(id, cx, cy) {
  const el=document.getElementById(id);
  if(el) {
    el.setAttribute('cx', cx);
    el.setAttribute('cy', cy)
  }
}
function w7Rect(id, x, y, w, h) {
  const el=document.getElementById(id);
  if(el) {
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.setAttribute('width', w);
    el.setAttribute('height', h)
  }
}
function w7Fmt(n, d=2) {
  return Number.isFinite(n)?Number(n).toFixed(d):'—'
}
function w7Scale1D(v) {
  return 460+v*36
}
function updateW7MomentumCalc() {
  const m=w7Val('w7MomMass', 2), v=w7Val('w7MomVel', 4);
  w7Text('w7MomMassVal', m.toFixed(1));
  w7Text('w7MomVelVal', v.toFixed(1));
  const len=Math.max(-260, Math.min(260, v*35)), dir=len<0?-1:1, pLen=len*Math.max(.7, Math.min(2, m/2)), pDir=pLen<0?-1:1;
  w7Line('w7MomVelArrow', 460, 150, 460+len, 150);
  w7Line('w7MomPArrow', 460, 205, 460+pLen, 205);
  w7VectorLabel('w7MomVelLabel', 460+len+dir*14, 138, `v = ${w7Fmt(v,2)} m/s`, dir);
  w7VectorLabel('w7MomPLabel', 460+pLen+pDir*14, 225, `p = ${w7Fmt(m*v,2)} kg m/s`, pDir);
  w7Text('w7MomFeedback', `\\[\\vec p = m \\vec v = ${w7Fmt(m)}(${w7Fmt(v)})\\ \\hat{i} = ${w7Fmt(m*v)} \\ \\hat{i} \\ kg·m/s\\]`);
  renderMath();
}
function updateW7Conservation1D() {
  const m1=w7Val('w7C1m1', 55), m2=w7Val('w7C1m2', 0.03), v1i=w7Val('w7C1v1i', 0), v2i=w7Val('w7C1v2i', 0), v2f=w7Val('w7C1v2f', 85);
  const v1f=(m1*v1i+m2*v2i-m2*v2f)/m1;
  ['m1', 'm2', 'v1i', 'v2i', 'v2f'].forEach(k=>w7Text('w7C1'+k+'Val', w7Val('w7C1'+k).toFixed(k.includes('m')?2:1)));
  w7Text('w7C1v1f', w7Fmt(v1f, 3));
  const pi=m1*v1i+m2*v2i, pf=m1*v1f+m2*v2f;
  w7Text('w7C1Feedback', `โมเมนตัมรวมก่อน = ${w7Fmt(pi,3)} kg·m/s, หลัง = ${w7Fmt(pf,3)} kg·m/s ดังนั้นวัตถุที่หนึ่งมี v₁f = ${w7Fmt(v1f,3)} m/s`);
  w7Line('w7C1Arrow1', 460, 150, 460+Math.max(-240, Math.min(240, v1f*120)), 150);
  w7Line('w7C1Arrow2', 460, 220, 460+Math.max(-240, Math.min(240, v2f*2.2)), 220);
  renderMath();
}
function updateW7SpringExplosion() {
  const mS=w7Val('w7SpringSmall', 1), mB=w7Val('w7SpringBig', 3), vB=w7Val('w7SpringBigV', 1.5);
  const vS=-(mB*vB)/mS;
  w7Text('w7SpringSmallVal', mS.toFixed(1));
  w7Text('w7SpringBigVal', mB.toFixed(1));
  w7Text('w7SpringBigVVal', vB.toFixed(1));
  w7Line('w7SpringSmallArrow', 410, 170, 410+Math.max(-250, Math.min(0, vS*30)), 170);
  w7Line('w7SpringBigArrow', 510, 170, 510+Math.max(0, Math.min(250, vB*70)), 170);
  w7Text('w7SpringFeedback', `จาก p รวมเริ่มต้นเป็นศูนย์: mเล็ก vเล็ก + mใหญ่ vใหญ่ = 0 → vเล็ก = ${w7Fmt(vS)} m/s`);
  renderMath();
}
function updateW7Momentum2D() {
  const m1=w7Val('w7m2d1', 1500), v1=w7Val('w7v2d1', 20), m2=w7Val('w7m2d2', 2500), v2=w7Val('w7v2d2', 15);
  ['m2d1', 'v2d1', 'm2d2', 'v2d2'].forEach(k=>w7Text('w7'+k+'Val', w7Val('w7'+k).toFixed(0)));
  const vx=m1*v1/(m1+m2), vy=m2*v2/(m1+m2), speed=Math.hypot(vx, vy), ang=Math.atan2(vy, vx)*180/Math.PI;
  w7Line('w7CarVecX', 180, 310, 180+v1*9, 310);
  w7Line('w7TruckVecY', 460, 310, 460, 310-v2*10);
  w7Line('w7ResultVec', 460, 310, 460+vx*18, 310-vy*18);
  w7Text('w7Momentum2DFeedback', `หลังชนติดกัน: vx = ${w7Fmt(vx)} m/s, vy = ${w7Fmt(vy)} m/s, v = ${w7Fmt(speed)} m/s, θ = ${w7Fmt(ang)}° เหนือทิศตะวันออก`);
  renderMath();
}
function w7MultiData() {
  const m1=w7Val('w7MObj1', 2), v1=w7Val('w7VObj1', 4), m2=w7Val('w7MObj2', 3), v2=w7Val('w7VObj2', 2), m3=w7Val('w7MObj3', 5), v3=w7Val('w7VObj3', -1);
  const totalM=m1+m2+m3, totalP=m1*v1+m2*v2+m3*v3, vf=totalP/totalM;
  return  {
    m:[m1, m2, m3], v:[v1, v2, v3], totalM, totalP, vf
  }
  ;
}
function w7SetBox(id, x, y, w, label, stuck) {
  const g=document.getElementById(id);
  if(!g)return;
  const rect=g.querySelector('rect'), text=g.querySelector('text');
  g.setAttribute('transform', `translate(${x},${y})`);
  g.classList.toggle('stuck', !!stuck);
  if(rect) {
    rect.setAttribute('width', w);
    rect.setAttribute('height', 58);
  }
  if(text) {
    text.textContent=label;
    text.setAttribute('x', w/2);
    text.setAttribute('y', 29);
  }
}
function w7SetArrow(id, x, y, len, label) {
  const g=document.getElementById(id);
  if(!g)return;
  const line=g.querySelector('line'), text=g.querySelector('text');
  const visible=Math.abs(len)>8;
  g.style.display=visible?'block':'none';
  if(!visible)return;
  const x2=x+len, dir=len<0?-1:1;
  if(line) {
    line.setAttribute('x1', x);
    line.setAttribute('x2', x2);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
  }
  if(text) {
    text.textContent=label;
    text.setAttribute('x', x2+dir*10);
    text.setAttribute('y', y-12);
    text.setAttribute('text-anchor', dir<0?'end':'start');
  }
}
function w7Ease(t) {
  return t<.5?2*t*t:1-Math.pow(-2*t+2, 2)/2
}
function w7RenderMultiAnimation(progress=0) {
  const scene=document.getElementById('w7MultiAnimStatus');
  if(!scene)return;
  const  {
    m, v, vf
  }
  =w7MultiData();
  const widths=m.map(value=>46+value*5), gap=3, clusterW=widths.reduce((a, b)=>a+b, 0)+gap*2, clusterStart=460-clusterW/2, targets=[clusterStart, clusterStart+widths[0]+gap, clusterStart+widths[0]+widths[1]+gap*2];
  const pre=Math.min(1, progress/.58), post=Math.max(0, (progress-.58)/.42), e=w7Ease(pre), y=164;
  const start=targets.map((target, i)=> {
    const dir=v[i]===0?0:Math.sign(v[i]);
    const dist=125+Math.abs(v[i])*18+i*18;
    return target-dir*dist;
  }
  );
  const shift=Math.max(-220, Math.min(220, vf*58*post));
  const stuck=progress>=.58;
  const xs=targets.map((target, i)=>stuck?target+shift:start[i]+(target-start[i])*e);
  w7SetBox('w7Box1', xs[0], y, widths[0], 'm₁', stuck);
  w7SetBox('w7Box2', xs[1], y, widths[1], 'm₂', stuck);
  w7SetBox('w7Box3', xs[2], y, widths[2], 'm₃', stuck);
  if(stuck) {
    ['w7MultiArrow1', 'w7MultiArrow2', 'w7MultiArrow3'].forEach(id=> {
      const el=document.getElementById(id);
      if(el) el.style.display='none'
    }
    );
    const center=xs[0]+clusterW/2;
    w7SetArrow('w7MultiFinalArrow', center, 260, Math.max(-150, Math.min(150, vf*34)), `vf = ${w7Fmt(vf)} m/s`);
    scene.textContent=post>=.98?'หลังชน: กล่องติดกันและเคลื่อนที่ด้วยความเร็วร่วมกัน':'ขณะชน: ตัวเชื่อมทำให้กล่องติดกันเป็นก้อนเดียว';
  }
  else {
    const centers=xs.map((x, i)=>x+widths[i]/2);
    w7SetArrow('w7MultiArrow1', centers[0], 108, Math.max(-120, Math.min(120, v[0]*16)), `v₁ = ${w7Fmt(v[0],1)}`);
    w7SetArrow('w7MultiArrow2', centers[1], 126, Math.max(-120, Math.min(120, v[1]*16)), `v₂ = ${w7Fmt(v[1],1)}`);
    w7SetArrow('w7MultiArrow3', centers[2], 144, Math.max(-120, Math.min(120, v[2]*16)), `v₃ = ${w7Fmt(v[2],1)}`);
    const finalArrow=document.getElementById('w7MultiFinalArrow');
    if(finalArrow) finalArrow.style.display='none';
    scene.textContent='ก่อนชน: กล่องแต่ละใบมีโมเมนตัมของตัวเอง';
  }
}
function w7PlayMultiAnimation() {
  if(W7.multiPlaying)return;
  W7.multiPlaying=true;
  W7.multiStart=performance.now()-W7.multiProgress*5200;
  const step=now=> {
    if(!W7.multiPlaying)return;
    W7.multiProgress=Math.min(1, (now-W7.multiStart)/5200);
    w7RenderMultiAnimation(W7.multiProgress);
    if(W7.multiProgress<1) W7.multiAnim=requestAnimationFrame(step);
    else W7.multiPlaying=false;
  }
  ;
  W7.multiAnim=requestAnimationFrame(step);
}
function w7PauseMultiAnimation() {
  W7.multiPlaying=false;
  if(W7.multiAnim) cancelAnimationFrame(W7.multiAnim);
  W7.multiAnim=null;
}
function w7ResetMultiAnimation() {
  w7PauseMultiAnimation();
  W7.multiProgress=0;
  w7RenderMultiAnimation(0);
}
function updateW7MultiObject() {
  w7PauseMultiAnimation();
  W7.multiProgress=0;
  const  {
    m, v, totalM, totalP, vf
  }
  =w7MultiData();
  const p=m.map((mass, i)=>mass*v[i]), pf=totalM*vf;
  ['MObj1', 'VObj1', 'MObj2', 'VObj2', 'MObj3', 'VObj3'].forEach(k=>w7Text('w7'+k+'Val', w7Val('w7'+k).toFixed(1)));
  w7RenderMultiAnimation(0);
  w7Text('w7MultiFeedback', `\\[\\vec p_{1,i}=${w7Fmt(p[0])} \\hat{i},\\ \\vec p_{2,i}=${w7Fmt(p[1])} \\hat{i},\\ \\vec p_3=${w7Fmt(p[2])} \\hat{i}\\ \\quad \\mathrm{kg\\cdot m/s}\\]
    \\[\\vec p_{total,i}=\\vec p_{1,i}+\\vec p_{2,i}+\\vec p_{3,i}=${w7Fmt(totalP)} \\hat{i}\\ \\mathrm{kg\\cdot m/s},\\quad\\]
    \\[\\vec p_{total,f}=M_{total} \\vec v_f=${w7Fmt(pf)} \\hat{i}\\ \\mathrm{kg\\cdot m/s} \\]
    \\[M_{total}=${w7Fmt(totalM)}\\ \\mathrm{kg}\\]
    \\[\\vec v_f=\\frac{\\vec p_{total,i}}{M_{total}}=${w7Fmt(vf)} \\hat{i}\\ \\mathrm{m/s}\\]`);
  renderMath();
}
function updateW7ImpulseConst() {
  const F=w7Val('w7ImpF', 80), dt=w7Val('w7ImpDt', .15), m=w7Val('w7ImpM', 2.5), vi=w7Val('w7ImpVi', 0);
  ['ImpF', 'ImpDt', 'ImpM', 'ImpVi'].forEach(k=>w7Text('w7'+k+'Val', w7Val('w7'+k).toFixed(k==='ImpDt'?2:1)));
  const I=F*dt, vf=vi+I/m;
  w7Rect('w7ImpArea', 160, 180-Math.max(-120, Math.min(120, F*1.2)), Math.max(0, dt*520), Math.abs(F*1.2));
  w7Text('w7ImpulseFeedback', `I = FΔt = ${w7Fmt(F)}(${w7Fmt(dt)}) = ${w7Fmt(I)} N·s และ vf = vi + I/m = ${w7Fmt(vf)} m/s`);
  renderMath();
}
function updateW7ImpulseGraph() {
  const peak=w7Val('w7GPeak', 100), mu=w7Val('w7GMu', 3), sigma=w7Val('w7GSigma', .8), duration=w7Val('w7GDuration', 6);
  w7Text('w7GPeakVal', peak.toFixed(0));
  w7Text('w7GMuVal', mu.toFixed(1));
  w7Text('w7GSigmaVal', sigma.toFixed(2));
  w7Text('w7GDurationVal', duration.toFixed(1));
  const left=110, right=840, bottom=330, top=50, width=right-left, height=bottom-top, steps=180, yMax=Math.max(peak*1.12, 40);
  const force=t=>peak*Math.exp(-0.5*Math.pow((t-mu)/sigma, 2)), x=t=>left+(t/duration)*width, y=F=>bottom-(F/yMax)*height;
  const pts=[];
  let impulse=0, prevF=force(0);
  for(let i=0;
  i<=steps;
  i++) {
    const t=duration*i/steps, F=force(t);
    pts.push([x(t), y(F), t, F]);
    if(i>0) {
      const dt=duration/steps;
      impulse+=(prevF+F)*0.5*dt;
    }
    prevF=F;
  }
  const avg=impulse/duration, avgY=y(avg), curve='M '+pts.map(p=>`${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L '), area=`M ${left},${bottom} L ${pts.map(p=>`$ {
    p[0].toFixed(1)
  }
  , $ {
    p[1].toFixed(1)
  }
  `).join(' L ')} L ${right},${bottom} Z`, avgArea=`M ${left},${bottom} L ${left},${avgY.toFixed(1)} L ${right},${avgY.toFixed(1)} L ${right},${bottom} Z`, muX=Math.max(left, Math.min(right, x(mu))), peakY=y(force(Math.max(0, Math.min(duration, mu))));
  const curveEl=document.getElementById('w7NormalCurve'), areaEl=document.getElementById('w7NormalArea'), avgAreaEl=document.getElementById('w7NormalAvgArea'), avgLine=document.getElementById('w7NormalAvgLine'), muLine=document.getElementById('w7NormalMuLine'), peakLabel=document.getElementById('w7NormalPeakLabel'), avgLabel=document.getElementById('w7NormalAvgLabel'), timeLabel=document.getElementById('w7NormalTimeLabel');
  if(curveEl) curveEl.setAttribute('d', curve);
  if(areaEl) areaEl.setAttribute('d', area);
  if(avgAreaEl) avgAreaEl.setAttribute('d', avgArea);
  if(avgLine) {
    avgLine.setAttribute('x1', left);
    avgLine.setAttribute('x2', right);
    avgLine.setAttribute('y1', avgY);
    avgLine.setAttribute('y2', avgY);
  }
  if(muLine) {
    muLine.setAttribute('x1', muX);
    muLine.setAttribute('x2', muX);
  }
  if(peakLabel) {
    peakLabel.textContent=`Fmax = ${w7Fmt(peak,0)} N`;
    peakLabel.setAttribute('x', Math.min(right-150, muX+14));
    peakLabel.setAttribute('y', Math.max(top+28, peakY-14));
  }
  if(avgLabel) {
    avgLabel.textContent=`Favg = ${w7Fmt(avg)} N`;
    avgLabel.setAttribute('x', right-190);
    avgLabel.setAttribute('y', Math.max(top+24, avgY-10));
  }
  if(timeLabel) timeLabel.textContent=`0 ถึง ${duration.toFixed(1)} s`;
  w7Text('w7GraphImpulseVal', w7Fmt(impulse));
  w7Text('w7GraphAvgVal', w7Fmt(avg));
  w7Text('w7GraphRectVal', w7Fmt(avg*duration));
  w7Text('w7GraphImpulseFeedback', `พื้นที่ใต้ normal curve = I ≈ ${w7Fmt(impulse)} N·s และแรงเฉลี่ยในช่วง 0 ถึง ${duration.toFixed(1)} s คือ Favg ≈ ${w7Fmt(avg)} N`);
  renderMath();
}
function updateW7Example5() {
  const m=w7Val('w7Ex5Mass', 2.5), f1=w7Val('w7Ex5F1', 40), f2=w7Val('w7Ex5F2', 100), dt=w7Val('w7Ex5Dt', 5), vi=w7Val('w7Ex5Vi', 3);
  w7Text('w7Ex5MassVal', m.toFixed(2));
  w7Text('w7Ex5F1Val', f1.toFixed(0));
  w7Text('w7Ex5F2Val', f2.toFixed(0));
  w7Text('w7Ex5DtVal', dt.toFixed(2));
  w7Text('w7Ex5ViVal', vi.toFixed(2));
  const impulse=.5*(f1+f2)*dt, avg=impulse/dt, restVf=impulse/m, vf=vi+impulse/m;
  const left=110, right=840, bottom=310, top=50, width=right-left, height=bottom-top, yMax=Math.max(40, f1, f2, avg)*1.18, y=F=>bottom-(F/yMax)*height, y1=y(f1), y2=y(f2), yAvg=y(avg);
  const area=document.getElementById('w7Ex5Area'), topLine=document.getElementById('w7Ex5TopLine'), avgLine=document.getElementById('w7Ex5AvgLine'), f1Label=document.getElementById('w7Ex5F1Label'), f2Label=document.getElementById('w7Ex5F2Label'), avgLabel=document.getElementById('w7Ex5AvgLabel'), dtLabel=document.getElementById('w7Ex5DtLabel');
  if(area) area.setAttribute('points', `${left},${bottom} ${left},${y1.toFixed(1)} ${right},${y2.toFixed(1)} ${right},${bottom}`);
  if(topLine) topLine.setAttribute('points', `${left},${y1.toFixed(1)} ${right},${y2.toFixed(1)}`);
  if(avgLine) {
    avgLine.setAttribute('x1', left);
    avgLine.setAttribute('x2', right);
    avgLine.setAttribute('y1', yAvg);
    avgLine.setAttribute('y2', yAvg);
  }
  if(f1Label) {
    f1Label.textContent=`F1 = ${w7Fmt(f1,0)} N`;
    f1Label.setAttribute('y', Math.max(top+28, y1-12));
  }
  if(f2Label) {
    f2Label.textContent=`F2 = ${w7Fmt(f2,0)} N`;
    f2Label.setAttribute('y', Math.max(top+28, y2-12));
  }
  if(avgLabel) {
    avgLabel.textContent=`Favg = ${w7Fmt(avg)} N`;
    avgLabel.setAttribute('y', Math.max(top+28, yAvg-10));
  }
  if(dtLabel) dtLabel.textContent=`Δt = ${dt.toFixed(2)} s`;
  w7Text('w7Example5Prompt', `จากแรงที่กระทำต่ออนุภาคมวล ${m.toFixed(2)} kg เปลี่ยนแปลงตามเวลาแบบเส้นตรงดังภาพด้านล่าง โดยแรงที่เวลาเริ่มต้นเป็น ${f1.toFixed(0)} N และแรงที่เวลา ${dt.toFixed(2)} s เป็น ${f2.toFixed(0)} N จงหา (a) การดลในช่วงเวลา ${dt.toFixed(2)} s (b) ความเร็วสุดท้ายหากเริ่มต้นจากหยุดนิ่ง (c) ความเร็วสุดท้ายหากความเร็วเริ่มต้นเป็น ${vi.toFixed(2)} m/s และ (d) ค่าแรงเฉลี่ยในช่วงเวลาดังกล่าว`);
  w7Text('w7Ex5ImpulseVal', w7Fmt(impulse));
  w7Text('w7Ex5AvgVal', w7Fmt(avg));
  w7Text('w7Ex5RestVfVal', w7Fmt(restVf));
  w7Text('w7Ex5VfVal', w7Fmt(vf));
  w7Text('w7Ex5SolutionText', `กราฟเป็นสี่เหลี่ยมคางหมู จึงหาการดลจากพื้นที่ใต้กราฟ แล้วใช้ทฤษฎีบทการดล-โมเมนตัมเพื่อหาความเร็วสุดท้าย`);
  w7Text('w7Ex5SolutionMath', `\\[I=\\frac{1}{2}(F_1+F_2)\\Delta t=\\frac{1}{2}(${w7Fmt(f1,0)}+${w7Fmt(f2,0)})(${w7Fmt(dt)})=${w7Fmt(impulse)}\\ \\mathrm{N\\cdot s}\\]\\[F_{avg}=\\frac{I}{\\Delta t}=\\frac{${w7Fmt(impulse)}}{${w7Fmt(dt)}}=${w7Fmt(avg)}\\ \\mathrm{N}\\]\\[I=m(v_f-v_i)\\Rightarrow v_f=v_i+\\frac{I}{m}\\]\\[\\text{If }v_i=0:\\quad v_f=0+\\frac{${w7Fmt(impulse)}}{${w7Fmt(m)}}=${w7Fmt(restVf)}\\ \\mathrm{m/s}\\]\\[\\text{If }v_i=${w7Fmt(vi)}:\\quad v_f=${w7Fmt(vi)}+\\frac{${w7Fmt(impulse)}}{${w7Fmt(m)}}=${w7Fmt(vf)}\\ \\mathrm{m/s}\\]`);
  renderMath();
}
function updateW7Crash() {
  const m=w7Val('w7CrashM', 1500), vi=w7Val('w7CrashVi', 20), vf=w7Val('w7CrashVf', -2), dt=w7Val('w7CrashDt', .15);
  ['CrashM', 'CrashVi', 'CrashVf', 'CrashDt'].forEach(k=>w7Text('w7'+k+'Val', w7Val('w7'+k).toFixed(k==='CrashDt'?2:1)));
  const I=m*(vf-vi), F=I/dt;
  w7Text('w7CrashFeedback', `I = m(vf-vi) = ${w7Fmt(I,0)} N·s, Favg = I/Δt = ${w7Fmt(F,0)} N`);
  renderMath();
}
function updateW7Restitution() {
  const e=w7Val('w7Restitution', .5);
  w7Text('w7RestitutionVal', e.toFixed(2));
  const sep=100+e*170;
  w7Circle('w7BallA', 460-sep/2, 185);
  w7Circle('w7BallB', 460+sep/2, 185);
  let label=e===1?'การชนแบบยืดหยุ่น':(e===0?'การชนแบบไม่ยืดหยุ่นสมบูรณ์':'การชนแบบไม่ยืดหยุ่น');
  w7Text('w7RestitutionFeedback', `e = ${e.toFixed(2)} → ${label}`);
}
function w7CollisionData() {
  const m1=w7Val('w7ColM1', 2), m2=w7Val('w7ColM2', 3), v1=w7Val('w7ColV1', 5), v2=w7Val('w7ColV2', -1), v1f=w7Val('w7ColV1fInput', 1.4), v2f=(m1*v1+m2*v2-m1*v1f)/m2, relativeBefore=v1-v2, e=Math.abs(relativeBefore)>1e-9?(v2f-v1f)/relativeBefore:NaN, Ki=.5*m1*v1*v1+.5*m2*v2*v2, Kf=.5*m1*v1f*v1f+.5*m2*v2f*v2f;
  return  {
    m1, m2, v1, v2, e, v1f, v2f, Ki, Kf
  }
  ;
}
function w7SetColObject(id, x, r, label) {
  const g=document.getElementById(id);
  if(!g)return;
  const circle=g.querySelector('circle'), text=g.querySelector('text');
  if(circle) {
    circle.setAttribute('cx', x);
    circle.setAttribute('r', r);
  }
  if(text) {
    text.textContent=label;
    text.setAttribute('x', x);
    text.setAttribute('y', 180);
  }
}
function w7RenderCollisionAnimation(progress=0, data=w7CollisionData()) {
  const r1=24+Math.sqrt(data.m1)*7, r2=24+Math.sqrt(data.m2)*7, hit1=460-r1, hit2=460+r2, pre=Math.min(1, progress/.5), post=Math.max(0, (progress-.5)/.5), closing=data.v1>data.v2, maxVi=Math.max(Math.abs(data.v1), Math.abs(data.v2), 1), maxVf=Math.max(Math.abs(data.v1f), Math.abs(data.v2f), 1), preScale=Math.min(56, 250/maxVi), postScale=Math.min(56, 250/maxVf);
  let x1, x2, phase;
  if(!closing) {
    const t=progress*1.8;
    x1=300+Math.max(-250, Math.min(250, data.v1*42*t));
    x2=620+Math.max(-250, Math.min(250, data.v2*42*t));
    phase='เงื่อนไขนี้ v₁i ≤ v₂i วัตถุจึงไม่เคลื่อนเข้าหากันก่อนชน';
    w7SetArrow('w7ColArrow1', x1, 110, Math.max(-115, Math.min(115, data.v1*17)), `v₁i = ${w7Fmt(data.v1,1)}`);
    w7SetArrow('w7ColArrow2', x2, 110, Math.max(-115, Math.min(115, data.v2*17)), `v₂i = ${w7Fmt(data.v2,1)}`);
  }
  else if(progress<.5) {
    x1=hit1-data.v1*preScale*(1-pre);
    x2=hit2-data.v2*preScale*(1-pre);
    phase='ก่อนชน: ตำแหน่งเคลื่อนตาม v₁i และ v₂i เข้าสู่จุดสัมผัส';
    w7SetArrow('w7ColArrow1', x1, 110, Math.max(-115, Math.min(115, data.v1*17)), `v₁i = ${w7Fmt(data.v1,1)}`);
    w7SetArrow('w7ColArrow2', x2, 110, Math.max(-115, Math.min(115, data.v2*17)), `v₂i = ${w7Fmt(data.v2,1)}`);
  }
  else {
    x1=hit1+data.v1f*postScale*post;
    x2=hit2+data.v2f*postScale*post;
    phase=post>.96?'หลังชน: ตำแหน่งเคลื่อนตาม v₁f และ v₂f':'ขณะชน: เปลี่ยนจากความเร็วเริ่มต้นเป็นความเร็วสุดท้ายที่กำหนด';
    w7SetArrow('w7ColArrow1', x1, 110, Math.max(-115, Math.min(115, data.v1f*17)), `v₁f = ${w7Fmt(data.v1f,1)}`);
    w7SetArrow('w7ColArrow2', x2, 110, Math.max(-115, Math.min(115, data.v2f*17)), `v₂f = ${w7Fmt(data.v2f,1)}`);
  }
  w7SetColObject('w7ColObj1', x1, r1, 'm₁');
  w7SetColObject('w7ColObj2', x2, r2, 'm₂');
  w7Text('w7CollisionAnimStatus', phase);
}
function w7PauseCollisionAnimation() {
  W7.collisionPlaying=false;
  if(W7.collisionAnim) cancelAnimationFrame(W7.collisionAnim);
  W7.collisionAnim=null;
}
function w7ResetCollisionAnimation() {
  w7PauseCollisionAnimation();
  W7.collisionProgress=0;
  w7RenderCollisionAnimation(0);
}
function w7PlayCollisionAnimation() {
  if(W7.collisionPlaying)return;
  if(W7.collisionProgress>=1) W7.collisionProgress=0;
  const data=w7CollisionData();
  W7.collisionPlaying=true;
  W7.collisionStart=performance.now()-W7.collisionProgress*4200;
  const step=now=> {
    if(!W7.collisionPlaying)return;
    W7.collisionProgress=Math.min(1, (now-W7.collisionStart)/4200);
    w7RenderCollisionAnimation(W7.collisionProgress, data);
    if(W7.collisionProgress<1) W7.collisionAnim=requestAnimationFrame(step);
    else W7.collisionPlaying=false;
  }
  ;
  W7.collisionAnim=requestAnimationFrame(step);
}
function updateW7CollisionEnergy() {
  w7PauseCollisionAnimation();
  W7.collisionProgress=0;
  const  {
    m1, m2, v1, v2, e, v1f, v2f, Ki, Kf
  }
  =w7CollisionData();
  ['ColM1', 'ColM2', 'ColV1', 'ColV2'].forEach(k=>w7Text('w7'+k+'Val', w7Val('w7'+k).toFixed(1)));
  w7Text('w7ColV1fInputVal', v1f.toFixed(1));
  w7Text('w7ColV2fCalcInputVal', w7Fmt(v2f));
  const eText=Number.isFinite(e)?w7Fmt(e):'ไม่กำหนด';
  w7Text('w7ColEReadout', eText);
  w7Text('w7ColV1fVal', w7Fmt(v1f));
  w7Text('w7ColV2fVal', w7Fmt(v2f));
  w7Text('w7ColKiVal', w7Fmt(Ki));
  w7Text('w7ColKfVal', w7Fmt(Kf));
  w7RenderCollisionAnimation(0,  {
    m1, m2, v1, v2, e, v1f, v2f, Ki, Kf
  }
  );
  w7Text('w7CollisionFeedback', `จากโมเมนตัมรวม v₂f = ${w7Fmt(v2f)} m/s, e = ${eText}, KE ก่อน = ${w7Fmt(Ki)} J, KE หลัง = ${w7Fmt(Kf)} J`);
  const pct=Ki?Math.max(0, Math.min(100, Kf/Ki*100)):0;
  const fill=document.getElementById('w7EnergyAfterFill');
  if(fill) fill.style.width=pct+'%';
  renderMath();
}
function w7NextStep(boxId, dir) {
  const box=document.getElementById(boxId);
  if(!box)return;
  const steps=[...box.querySelectorAll('.w7-step')];
  let i=steps.findIndex(s=>s.classList.contains('active'));
  if(i<0)i=0;
  steps[i].classList.remove('active');
  i=Math.max(0, Math.min(steps.length-1, i+dir));
  steps[i].classList.add('active');
}
function toggleW7Solution(button, id) {
  const box=document.getElementById(id);
  if(!box)return;
  const show=box.hidden;
  box.hidden=!show;
  if(button) {
    button.setAttribute('aria-expanded', String(show));
    button.textContent=show?'ซ่อนเฉลย/วิธีทำ':'แสดงเฉลย/วิธีทำ';
  }
  if(show) renderMath(box);
}
function initW7() {
  updateW7MomentumCalc();
  updateW7Conservation1D();
  updateW7SpringExplosion();
  updateW7Momentum2D();
  updateW7MultiObject();
  updateW7ImpulseConst();
  updateW7ImpulseGraph();
  updateW7Example5();
  updateW7Crash();
  updateW7Restitution();
  updateW7CollisionEnergy();
}
document.addEventListener('DOMContentLoaded', initW7);

