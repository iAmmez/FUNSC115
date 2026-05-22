const w11 = id => document.getElementById(id);
const w11Val = id => parseFloat(w11(id)?.value || 0);
const w11Fixed = (x,d=2)=>Number(x).toFixed(d);
let w11RigidMode='rigid', w11WheelPlaying=false, w11WheelAngle=0, w11DeriveStep=0;
function w11Math(el){ if(typeof renderMath==='function') renderMath(el || document.body); }
function w11SvgText(x,y,t,c='w11-text',extra=''){return `<text x="${x}" y="${y}" class="${c}" ${extra}>${t}</text>`}
function w11AngularArcPath(cx,cy,r,theta){const large=Math.abs(theta)>Math.PI?1:0, sweep=theta>=0?0:1; return `M${cx+r} ${cy} A${r} ${r} 0 ${large} ${sweep} ${cx+r*Math.cos(theta)} ${cy-r*Math.sin(theta)}`;}
function w11Init(){
  w11UpdateRigid(); w11UpdateAngular(); w11UpdateWheel(); w11UpdateKinematics(); w11UpdateEx2(); w11UpdateTorque(); w11UpdateInertia(); w11UpdateParallel(); w11UpdateRotLaw(); w11UpdateEx5();
  requestAnimationFrame(w11AnimateWheel);
}
function w11ToggleRigid(){w11RigidMode=w11RigidMode==='rigid'?'flex':'rigid';w11UpdateRigid()}
function w11UpdateRigid(){const s=w11('w11RigidSvg'); if(!s)return; const flex=w11RigidMode==='flex'; let pts=[]; for(let i=0;i<8;i++){let a=i*Math.PI/4; let r=flex?(95+25*Math.sin(i*1.7)):115; pts.push([310+r*Math.cos(a),180+r*Math.sin(a)]);} let lines=''; for(let i=0;i<pts.length;i++){let [x1,y1]=pts[i],[x2,y2]=pts[(i+1)%pts.length]; lines+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#93c5fd" stroke-width="4"/>`; } s.innerHTML=`<circle cx="310" cy="180" r="8" fill="#111827"/><line x1="310" y1="40" x2="310" y2="320" class="w11-axis w11-dash"/>${lines}${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="12" class="w11-point"/>`).join('')}<path d="M390 180 A80 80 0 0 1 338 255" fill="none" stroke="#dc2626" stroke-width="5" marker-end="url(#w11ArrowRed)"/><text x="310" y="342" text-anchor="middle" class="w11-text">${flex?'ไม่แข็งเกร็ง: ระยะห่างระหว่างจุดเปลี่ยน':'วัตถุแข็งเกร็ง: ระยะห่างระหว่างจุดคงที่'}</text>`;}
function w11UpdateAngular(){const th=w11Val('w11Theta'), r=w11Val('w11Radius'); if(w11('w11ThetaVal'))w11('w11ThetaVal').textContent=w11Fixed(th,2); if(w11('w11RadiusVal'))w11('w11RadiusVal').textContent=w11Fixed(r,2); const s=w11('w11AngularSvg'); const R=55*r, cx=310, cy=180, x=cx+R*Math.cos(th), y=cy-R*Math.sin(th), sx=cx+R, sy=cy, mid=th/2, rlx=cx+R*.62*Math.cos(th)+12, rly=cy-R*.62*Math.sin(th)-8; if(s)s.innerHTML=`<line x1="70" y1="180" x2="550" y2="180" class="w11-axis"/><line x1="310" y1="320" x2="310" y2="40" class="w11-axis"/><circle cx="310" cy="180" r="${R}" class="w11-motion-path"/><line x1="310" y1="180" x2="${sx}" y2="${sy}" stroke="#94a3b8" stroke-width="3"/><path d="${w11AngularArcPath(cx,cy,R,th)}" class="w11-swept-arc" marker-end="url(#w11ArrowRed)"/><circle cx="${sx}" cy="${sy}" r="5" class="w11-arc-start"/><line x1="310" y1="180" x2="${x}" y2="${y}" class="w11-arm"/><circle cx="${x}" cy="${y}" r="12" class="w11-point"/>${w11SvgText(sx+10,sy+22,'จุดเริ่มต้น','w11-small')}${w11SvgText(cx+(R+18)*Math.cos(mid),cy-(R+18)*Math.sin(mid),'s','w11-text')}${w11SvgText(cx+44*Math.cos(mid),cy-44*Math.sin(mid),'θ','w11-text','text-anchor="middle" dominant-baseline="middle"')}${w11SvgText(rlx,rly,'r','w11-text','text-anchor="middle" dominant-baseline="middle"')}`; const fb=w11('w11AngularFeedback');
if(fb){fb.innerHTML=
  `\\(s=r\\theta=${w11Fixed(r,2)}(${w11Fixed(th,2)})=${w11Fixed(r*th,2)}\\
  \\mathrm{m}\\)<br>\\(\\theta=${w11Fixed(th*180/Math.PI,1)}^\\circ=${w11Fixed(th/(2*Math.PI),2)}\\) รอบ`; w11Math(fb)}}
function w11ToggleWheel(){w11WheelPlaying=!w11WheelPlaying; const b=w11('w11WheelPlay'); if(b)b.textContent=w11WheelPlaying?'หยุด animation':'เล่น animation'}
function w11UpdateWheel(){const om=w11Val('w11Omega'), al=w11Val('w11Alpha'); if(w11('w11OmegaVal'))w11('w11OmegaVal').textContent=w11Fixed(om,1); if(w11('w11AlphaVal'))w11('w11AlphaVal').textContent=w11Fixed(al,1); const fb=w11('w11WheelFeedback'); if(fb){const same=om*al>0?'เร็วขึ้น':om*al<0?'ช้าลง':'ความเร็วคงที่หรือกำลังเริ่มจากหยุด'; fb.innerHTML=`ทิศของ \(\omega\): ${om>=0?'ทวนเข็ม':'ตามเข็ม'}<br>ทิศของ \(\alpha\): ${al>=0?'ทวนเข็ม':'ตามเข็ม'}<br>การหมุน: ${same}`; w11Math(fb)} w11DrawWheel();}
function w11DrawWheel(){const s=w11('w11WheelSvg'); if(!s)return; const a=w11WheelAngle, cx=310,cy=180,R=95, x=cx+R*Math.cos(a), y=cy-R*Math.sin(a); s.innerHTML=`<circle cx="${cx}" cy="${cy}" r="${R}" class="w11-disc"/><line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="w11-arm"/><circle cx="${x}" cy="${y}" r="11" class="w11-point"/><circle cx="${cx}" cy="${cy}" r="8" fill="#111827"/><path d="M455 160 A55 55 0 0 1 455 250" fill="none" stroke="#2563eb" stroke-width="5" marker-end="url(#w11ArrowBlue)"/><path d="M170 250 A55 55 0 0 1 170 160" fill="none" stroke="#dc2626" stroke-width="5" marker-end="url(#w11ArrowRed)"/>${w11SvgText(430,135,'+ ทวนเข็ม')}${w11SvgText(120,135,'− ตามเข็ม')}`;}
function w11AnimateWheel(){ if(w11WheelPlaying){let om=w11Val('w11Omega'); w11WheelAngle+=om*0.025; w11DrawWheel();} requestAnimationFrame(w11AnimateWheel);}
function w11UpdateKinematics(){const om=w11Val('w11KOm'), al=w11Val('w11KAl'), t=w11Val('w11KT'); ['w11KOmVal','w11KAlVal','w11KTVal'].forEach((id,i)=>{const vals=[om,al,t]; if(w11(id))w11(id).textContent=w11Fixed(vals[i],1)}); const theta=om*t+.5*al*t*t, wf=om+al*t; const fb=w11('w11KFeedback'); if(fb){fb.innerHTML=`\(\Delta\theta=${w11Fixed(theta,2)}\ \mathrm{rad}\)<br>\(\omega=${w11Fixed(wf,2)}\ \mathrm{rad/s}\)<br>จำนวนรอบ \(=${w11Fixed(theta/(2*Math.PI),2)}\)`; w11Math(fb)} const s=w11('w11KSvg'); if(s){let bars=[['ω₀',om,120],['αt',al*t,280],['ω',wf,440]]; let out='<line x1="70" y1="260" x2="560" y2="260" class="w11-axis"/>'; bars.forEach(b=>{let h=Math.max(-150,Math.min(150,b[1]*15)); out+=`<rect x="${b[2]}" y="${h>=0?260-h:260}" width="80" height="${Math.abs(h)}" rx="8" fill="${b[1]>=0?'#2563eb':'#dc2626'}" opacity=".75"/><text x="${b[2]+40}" y="290" text-anchor="middle" class="w11-text">${b[0]}</text><text x="${b[2]+40}" y="${h>=0?245-h:245}" text-anchor="middle" class="w11-small">${w11Fixed(b[1],1)}</text>`}); s.innerHTML=out;}}
function w11UpdateEx2(){const r=w11Val('w11Ex2R'), om=w11Val('w11Ex2Om'), al=w11Val('w11Ex2Al'), t=w11Val('w11Ex2T'); [['w11Ex2RVal',r,2],['w11Ex2OmVal',om,1],['w11Ex2AlVal',al,1],['w11Ex2TVal',t,1]].forEach(a=>{if(w11(a[0]))w11(a[0]).textContent=w11Fixed(a[1],a[2])}); const at=r*al, theta=om*t+.5*al*t*t, dist=r*theta, wf=om+al*t, v=r*wf; const fb=w11('w11Ex2Feedback'); if(fb){fb.innerHTML=`\(a_t=r\alpha=${w11Fixed(at,2)}\ \mathrm{m/s^2}\)<br>\(\theta=${w11Fixed(theta,2)}\ \mathrm{rad}\), \(s=r\theta=${w11Fixed(dist,2)}\ \mathrm{m}\)<br>\(\omega=${w11Fixed(wf,2)}\ \mathrm{rad/s}\), \(v=r\omega=${w11Fixed(v,2)}\ \mathrm{m/s}\)`; w11Math(fb)} const s=w11('w11Ex2Svg'); if(s){const R=70+100*r, cx=310, cy=180, a=theta%(2*Math.PI), x=cx+R*Math.cos(a), y=cy-R*Math.sin(a); s.innerHTML=`<circle cx="${cx}" cy="${cy}" r="${R}" class="w11-disc"/><line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="w11-arm"/><circle cx="${x}" cy="${y}" r="12" class="w11-point"/><path d="M${x} ${y} q40 -60 90 -20" fill="none" class="w11-green"/><text x="${Math.min(530,x+50)}" y="${Math.max(50,y-45)}" class="w11-text">v=${w11Fixed(v,2)} m/s</text><text x="310" y="340" text-anchor="middle" class="w11-text">ระยะทางบนขอบล้อ s = ${w11Fixed(dist,2)} m</text>`;}}
function w11UpdateTorque(){
  const r=w11Val('w11TorqueR'), F=w11Val('w11TorqueF'), deg=w11Val('w11TorqueA');
  const rad=deg*Math.PI/180, tauPlane=r*F*Math.sin(rad), tauY=tauPlane, tauAbs=Math.abs(tauY);
  [['w11TorqueRVal',r,2],['w11TorqueFVal',F,1],['w11TorqueAVal',deg,0]].forEach(a=>{if(w11(a[0]))w11(a[0]).textContent=w11Fixed(a[1],a[2])});

  const fb=w11('w11TorqueFeedback');
  if(fb){
    fb.innerHTML=`\\[
      \\vec{\\tau}=\\vec r\\times\\vec F\\]
      \\[
      \\tau=rF\\sin\\theta
      =${w11Fixed(r,2)}(${w11Fixed(F,1)})\\sin ${w11Fixed(deg,0)}^\\circ
      =${w11Fixed(tauY,2)}\\ \\mathrm{N\\cdot m}
    \\]
    \\[
      \\vec{\\tau}=${w11Fixed(tauY,2)} \\ \\hat{k}\\ \\mathrm{N\\cdot m}
    \\]`;
    w11Math(fb);
  }

  const s=w11('w11TorqueSvg');
  if(!s)return;

  const O={x:130,y:245};
  const rScale=185, forceScale=4.8;
  const P={x:O.x+r*rScale,y:O.y};
  const forceLen=28+F*forceScale;
  const forceEnd={x:P.x+forceLen*Math.cos(rad),y:P.y-forceLen*Math.sin(rad)};
  const tauLen=Math.min(140, tauAbs*11);
  const yAxis={x:-0.76,y:0.55};
  const tauDir=tauY>=0?1:-1;
  const tauEnd={x:O.x+yAxis.x*tauLen*tauDir,y:O.y+yAxis.y*tauLen*tauDir};
  const arcR=34;
  const arcEnd={x:P.x+arcR*Math.cos(rad),y:P.y-arcR*Math.sin(rad)};
  const largeArc=Math.abs(deg)>180?1:0;
  const sweep=deg>=0?0:1;
  const thetaLabel={x:P.x+(arcR+14)*Math.cos(rad/2),y:P.y-(arcR+14)*Math.sin(rad/2)};
  const torqueVector=tauLen<0.5
    ? `<circle cx="${O.x}" cy="${O.y}" r="6" class="w11-torque-zero"/><text x="${O.x+12}" y="${O.y-10}" class="w11-text">τ = 0</text>`
    : `<line x1="${O.x}" y1="${O.y}" x2="${tauEnd.x}" y2="${tauEnd.y}" class="w11-torque-vector" marker-end="url(#w11ArrowGreen)"/><text x="${tauEnd.x+12}" y="${tauEnd.y+4}" class="w11-text">τ</text>`;

  s.innerHTML=`
    <ellipse cx="${O.x+150}" cy="${O.y+26}" rx="250" ry="58" class="w11-torque-plane"/>
    <line x1="${O.x-70}" y1="${O.y}" x2="${O.x+410}" y2="${O.y}" class="w11-torque-axis"/>
    <line x1="${O.x}" y1="${O.y+70}" x2="${O.x}" y2="${O.y-175}" class="w11-torque-z-axis"/>
    <line x1="${O.x}" y1="${O.y}" x2="${O.x+yAxis.x*105}" y2="${O.y+yAxis.y*105}" class="w11-torque-y-axis"/>
    <text x="${O.x+417}" y="${O.y+4}" class="w11-small">x</text>
    <text x="${O.x+8}" y="${O.y-178}" class="w11-small">y</text>
    <text x="${O.x+yAxis.x*112}" y="${O.y+yAxis.y*112+4}" class="w11-small">z</text>
    <line x1="${O.x}" y1="${O.y}" x2="${P.x}" y2="${P.y}" class="w11-arm"/>
    <circle cx="${O.x}" cy="${O.y}" r="10" fill="#111827"/>
    <text x="${O.x-24}" y="${O.y+30}" class="w11-text">O</text>
    <circle cx="${P.x}" cy="${P.y}" r="8" class="w11-point"/>
    <line x1="${P.x}" y1="${P.y}" x2="${forceEnd.x}" y2="${forceEnd.y}" class="w11-force"/>
    <path d="M${P.x+arcR} ${P.y} A${arcR} ${arcR} 0 ${largeArc} ${sweep} ${arcEnd.x} ${arcEnd.y}" class="w11-torque-angle"/>
    <text x="${thetaLabel.x+4}" y="${thetaLabel.y-4}" class="w11-text">θ</text>
    ${torqueVector}
    <text x="${(O.x+P.x)/2}" y="${O.y+28}" class="w11-text">r</text>
    <text x="${forceEnd.x+10}" y="${forceEnd.y}" class="w11-text">F</text>`;
}
function w11UpdateInertia(){const m=w11Val('w11Mass'), r=w11Val('w11InertiaR'), n=Math.round(w11Val('w11MassN')); [['w11MassVal',m,2],['w11InertiaRVal',r,2],['w11MassNVal',n,0]].forEach(a=>{if(w11(a[0]))w11(a[0]).textContent=w11Fixed(a[1],a[2])}); const I=n*m*r*r; const fb=w11('w11InertiaFeedback'); if(fb){fb.innerHTML=`\(I=\sum mr^2=${n}(${w11Fixed(m,2)})(${w11Fixed(r,2)})^2=${w11Fixed(I,2)}\ \mathrm{kg\cdot m^2}\)`; w11Math(fb)} const s=w11('w11InertiaSvg'); if(s){const cx=310, cy=180, R=45+r*80; let out=`<line x1="${cx}" y1="40" x2="${cx}" y2="320" class="w11-axis w11-dash"/><circle cx="${cx}" cy="${cy}" r="8" fill="#111827"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#bfdbfe" stroke-width="3"/>`; for(let i=0;i<n;i++){let a=2*Math.PI*i/n; let x=cx+R*Math.cos(a), y=cy+R*Math.sin(a); out+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#93c5fd" stroke-width="3"/><circle cx="${x}" cy="${y}" r="14" class="w11-mass"/>`; } out+=`<text x="310" y="340" text-anchor="middle" class="w11-text">ยิ่งมวลอยู่ไกลแกน ค่า I เพิ่มตาม r²</text>`; s.innerHTML=out;}}
function w11UpdateParallel(){const Icm=w11Val('w11ICM'), M=w11Val('w11M'), d=w11Val('w11D'), I=Icm+M*d*d; [['w11ICMVal',Icm,2],['w11MVal',M,1],['w11DVal',d,2]].forEach(a=>{if(w11(a[0]))w11(a[0]).textContent=w11Fixed(a[1],a[2])}); const fb=w11('w11ParallelFeedback'); if(fb){fb.innerHTML=`\(I=I_{CM}+Md^2=${w11Fixed(Icm,2)}+${w11Fixed(M,1)}(${w11Fixed(d,2)})^2=${w11Fixed(I,2)}\ \mathrm{kg\cdot m^2}\)`; w11Math(fb)} const s=w11('w11ParallelSvg'); if(s){const cx=260, cy=180, dx=d*120; s.innerHTML=`<circle cx="${cx}" cy="${cy}" r="80" fill="#dbeafe" stroke="#2563eb" stroke-width="4"/><line x1="${cx}" y1="60" x2="${cx}" y2="300" class="w11-cm-axis"/><line x1="${cx+dx}" y1="60" x2="${cx+dx}" y2="300" class="w11-new-axis"/><line x1="${cx}" y1="320" x2="${cx+dx}" y2="320" class="w11-orange"/><text x="${cx-45}" y="50" class="w11-text">แกนผ่าน CM</text><text x="${cx+dx-45}" y="50" class="w11-text">แกนใหม่</text><text x="${cx+dx/2}" y="345" text-anchor="middle" class="w11-text">d=${w11Fixed(d,2)} m</text>`;}}
function w11UpdateRotLaw(){const tau=w11Val('w11NetTau'), I=w11Val('w11RotI'), al=tau/I; [['w11NetTauVal',tau,1],['w11RotIVal',I,1]].forEach(a=>{if(w11(a[0]))w11(a[0]).textContent=w11Fixed(a[1],a[2])}); const fb=w11('w11RotLawFeedback'); if(fb){fb.innerHTML=`\(\alpha=\frac{\sum\tau}{I}=\frac{${w11Fixed(tau,1)}}{${w11Fixed(I,1)}}=${w11Fixed(al,2)}\ \mathrm{rad/s^2}\)`; w11Math(fb)} const s=w11('w11RotLawSvg'); if(s){let mag=Math.min(180,Math.abs(al)*45); s.innerHTML=`<circle cx="260" cy="180" r="85" class="w11-disc"/><circle cx="260" cy="180" r="10" fill="#111827"/><path d="M${tau>=0?360:160} 180 A100 100 0 0 ${tau>=0?1:0} ${tau>=0?260:260} ${tau>=0?80:80}" fill="none" stroke="${tau>=0?'#2563eb':'#dc2626'}" stroke-width="7" marker-end="url(#${tau>=0?'w11ArrowBlue':'w11ArrowRed'})"/><rect x="430" y="260" width="80" height="${mag}" transform="translate(0 ${-mag})" class="w11-meter-fill"/><rect x="430" y="80" width="80" height="180" class="w11-meter" fill="none"/><text x="470" y="292" text-anchor="middle" class="w11-text">|α|</text><text x="250" y="330" text-anchor="middle" class="w11-text">${al>=0?'ทวนเข็ม':'ตามเข็ม'}</text>`;}}
function w11UpdateEx5(){
  const F1=w11Val('w11F1'), r1=w11Val('w11R1'), F2=w11Val('w11F2'), r2=w11Val('w11R2'), I=w11Val('w11Ex5I');
  [['w11F1Val',F1,0],['w11R1Val',r1,2],['w11F2Val',F2,0],['w11R2Val',r2,2],['w11Ex5IVal',I,2]].forEach(a=>{if(w11(a[0]))w11(a[0]).textContent=w11Fixed(a[1],a[2])});
  const tau=F1*r1+F2*r2, al=tau/I;
  const fb=w11('w11Ex5Feedback');
  if(fb){
    fb.innerHTML=`\\[
      \\sum_{i=1}^2\\tau_i=F_1r_1+F_2r_2\\]
      \\[\\sum_{i=1}^2\\tau_i=(${w11Fixed(F1,0)})(${w11Fixed(r1,2)})+(${w11Fixed(F2,0)})(${w11Fixed(r2,2)})
      =${w11Fixed(tau,2)}\\ \\mathrm{N\\cdot m}
    \\]
    \\[
      \\alpha=\\frac{\\sum_{i=1}^2\\tau_i}{I}
      =\\frac{${w11Fixed(tau,2)}}{${w11Fixed(I,2)}}
      =${w11Fixed(al,2)}\\ \\mathrm{rad/s^2}
    \\]`;
    w11Math(fb);
  }

  const s=w11('w11Ex5Svg');
  if(s){
    const cx=310, cy=180, R1=70+r1*180, R2=70+r2*180;
    const outerFirst = R1 >= R2;
    const circle1 = `<circle cx="${cx}" cy="${cy}" r="${R1}" fill="#dbeafe" fill-opacity=".42" stroke="#2563eb" stroke-width="5"/>`;
    const circle2 = `<circle cx="${cx}" cy="${cy}" r="${R2}" fill="#fff7ed" fill-opacity=".42" stroke="#f59e0b" stroke-width="5"/>`;
    const r1LabelY = Math.max(18, cy - R1 - 10);
    const r2LabelY = Math.min(332, cy + R2 + 24);

    s.innerHTML=`
      <line x1="${cx}" y1="42" x2="${cx}" y2="318" class="w11-axis w11-dash"/>
      ${outerFirst ? circle1 + circle2 : circle2 + circle1}
      <circle cx="${cx}" cy="${cy}" r="8" fill="#111827"/>
      <line x1="${cx}" y1="${cy}" x2="${cx+R1}" y2="${cy}" stroke="#2563eb" stroke-width="3" stroke-dasharray="7 6"/>
      <line x1="${cx}" y1="${cy}" x2="${cx-R2}" y2="${cy}" stroke="#f59e0b" stroke-width="3" stroke-dasharray="7 6"/>
      <line x1="${cx+R1}" y1="${cy}" x2="${cx+R1}" y2="${cy-90}" class="w11-force"/>
      <line x1="${cx-R2}" y1="${cy}" x2="${cx-R2}" y2="${cy+90}" class="w11-force"/>
      <text x="${cx+R1+15}" y="${cy-70}" class="w11-text">F₁</text>
      <text x="${cx-R2-45}" y="${cy+85}" class="w11-text">F₂</text>
      <text x="${cx+R1/2}" y="${r1LabelY}" text-anchor="middle" class="w11-text">r₁</text>
      <text x="${cx-R2/2}" y="${r2LabelY}" text-anchor="middle" class="w11-text">r₂</text>`;
  }
}
function w11NextDerive(){const steps=['เริ่มจากกฎข้อที่ 2 ของนิวตันสำหรับอนุภาคแต่ละตัว','แยกแรงเป็นแรงภายนอกและแรงภายในที่อนุภาคอื่นกระทำ','คูณแบบครอสด้วยเวกเตอร์ตำแหน่งของอนุภาค: rᵢ × (สมการแรง)','รวมสมการของทุกอนุภาคในวัตถุแข็งเกร็ง','ใช้กฎข้อที่ 3 ของนิวตันและสมบัติของ cross product ทำให้ผลรวมแรงภายในหายไป','ได้นิยามแรงบิดรวมและโมเมนต์ความเฉื่อย จนนำไปสู่ Στ = Iα']; w11DeriveStep=(w11DeriveStep+1)%steps.length; const b=w11('w11DeriveBox'); if(b)b.textContent=steps[w11DeriveStep];}
document.addEventListener('DOMContentLoaded', w11Init);

const rigidAngleSlider = document.getElementById("rigidAngleSlider");
const deformSlider = document.getElementById("deformSlider");
const rigidAngleValue = document.getElementById("rigidAngleValue");
const deformValue = document.getElementById("deformValue");
const rigidObject = document.getElementById("rigidObject");
const rigidThetaText = document.getElementById("rigidThetaText");
const deformThetaText = document.getElementById("deformThetaText");
const playBtn = document.getElementById("rigidPlayBtn");

const deformShape = document.getElementById("deformShape");
const dP1 = document.getElementById("dP1");
const dP2 = document.getElementById("dP2");
const dP3 = document.getElementById("dP3");
const dP4 = document.getElementById("dP4");
const deformRadius1 = document.getElementById("deformRadius1");
const deformRadius2 = document.getElementById("deformRadius2");
const rigidActivityReady = [
  rigidAngleSlider,
  deformSlider,
  rigidAngleValue,
  deformValue,
  rigidObject,
  playBtn,
  deformShape,
  dP1,
  dP2,
  dP3,
  dP4,
  deformRadius1,
  deformRadius2
].every(Boolean);

let isPlaying = false;
let animationId = null;
let angle = 45;

const cx = 210;
const cy = 170;

function polarToCartesian(centerX, centerY, radius, angleDeg) {
  const angleRad = (angleDeg - 90) * Math.PI / 180;
  return {
    x: centerX + radius * Math.cos(angleRad),
    y: centerY + radius * Math.sin(angleRad)
  };
}

function describeArc(centerX, centerY, radius, startAngle, endAngle) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

function rotatePoint(x, y, angleDeg, centerX, centerY) {
  const rad = angleDeg * Math.PI / 180;
  const dx = x - centerX;
  const dy = y - centerY;

  return {
    x: centerX + dx * Math.cos(rad) - dy * Math.sin(rad),
    y: centerY + dx * Math.sin(rad) + dy * Math.cos(rad)
  };
}

function setCirclePosition(circle, point) {
  circle.setAttribute("cx", point.x);
  circle.setAttribute("cy", point.y);
}

function setLine(line, x1, y1, x2, y2) {
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
}

function updateRigidBody() {
  if (!rigidActivityReady) return;

  angle = Number(rigidAngleSlider.value);
  const deformAmount = Number(deformSlider.value) / 100;

  rigidAngleValue.textContent = `${angle}°`;
  deformValue.textContent = `${Math.round(deformAmount * 100)}%`;

  rigidObject.setAttribute("transform", `rotate(${angle} ${cx} ${cy})`);
  if (rigidThetaText) rigidThetaText.textContent = `${angle}°`;

  updateDeformableBody(angle, deformAmount);
}

function updateDeformableBody(baseAngle, deformAmount) {
  if (!rigidActivityReady) return;

  const a1 = baseAngle;
  const a2 = baseAngle * (1 - 0.25 * deformAmount);
  const a3 = baseAngle * (1 + 0.30 * deformAmount);
  const a4 = baseAngle * (1 - 0.15 * deformAmount);

  const r1 = 80 + 25 * deformAmount * Math.sin(baseAngle * Math.PI / 90);
  const r2 = 75 + 35 * deformAmount * Math.cos(baseAngle * Math.PI / 120);
  const r3 = 80 + 20 * deformAmount * Math.sin(baseAngle * Math.PI / 70);
  const r4 = 75 + 30 * deformAmount * Math.cos(baseAngle * Math.PI / 80);

  const p1Base = { x: cx, y: cy - r1 };
  const p2Base = { x: cx + r2, y: cy };
  const p3Base = { x: cx, y: cy + r3 };
  const p4Base = { x: cx - r4, y: cy };

  const p1 = rotatePoint(p1Base.x, p1Base.y, a1, cx, cy);
  const p2 = rotatePoint(p2Base.x, p2Base.y, a2, cx, cy);
  const p3 = rotatePoint(p3Base.x, p3Base.y, a3, cx, cy);
  const p4 = rotatePoint(p4Base.x, p4Base.y, a4, cx, cy);

  deformShape.setAttribute(
    "points",
    `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`
  );

  setCirclePosition(dP1, p1);
  setCirclePosition(dP2, p2);
  setCirclePosition(dP3, p3);
  setCirclePosition(dP4, p4);

  setLine(deformRadius1, cx, cy, p1.x, p1.y);
  setLine(deformRadius2, cx, cy, p2.x, p2.y);

  if (deformThetaText) {
    deformThetaText.textContent =
      `A ≈ ${a1.toFixed(0)}°, B ≈ ${a2.toFixed(0)}°, C ≈ ${a3.toFixed(0)}°, D ≈ ${a4.toFixed(0)}°`;
  }
}

function animateRotation() {
  if (!isPlaying) return;

  angle = (angle + 1) % 361;
  rigidAngleSlider.value = angle;
  updateRigidBody();

  animationId = requestAnimationFrame(animateRotation);
}

if (rigidActivityReady) {
  playBtn.addEventListener("click", () => {
    isPlaying = !isPlaying;

    if (isPlaying) {
      playBtn.textContent = "⏸ หยุดการหมุน";
      animateRotation();
    } else {
      playBtn.textContent = "▶ เริ่ม/หยุดการหมุน";
      cancelAnimationFrame(animationId);
    }
  });

  rigidAngleSlider.addEventListener("input", updateRigidBody);
  deformSlider.addEventListener("input", updateRigidBody);

  updateRigidBody();
}

const thetaFunctionType = document.getElementById("thetaFunctionType");
const thetaTimeSlider = document.getElementById("thetaTimeSlider");
const thetaTimeValue = document.getElementById("thetaTimeValue");
const thetaPlayBtn = document.getElementById("thetaPlayBtn");
const thetaResetBtn = document.getElementById("thetaResetBtn");

const omegaInput = document.getElementById("omegaInput");
const theta0Input = document.getElementById("theta0Input");
const omega0Input = document.getElementById("omega0Input");
const alphaInput = document.getElementById("alphaInput");
const amplitudeInput = document.getElementById("amplitudeInput");
const bigOmegaInput = document.getElementById("bigOmegaInput");

const thetaPoint = document.getElementById("thetaPoint");
const thetaRadiusLine = document.getElementById("thetaRadiusLine");
const thetaArc = document.getElementById("thetaArc");
const thetaTrail = document.getElementById("thetaTrail");
const thetaLabel = document.getElementById("thetaLabel");

const thetaEquationText = document.getElementById("thetaEquationText");
const thetaTText = document.getElementById("thetaTText");
const thetaValueText = document.getElementById("thetaValueText");
const omegaValueText = document.getElementById("omegaValueText");
const motionDescriptionText = document.getElementById("motionDescriptionText");

const thetaParamsUniform = document.querySelectorAll(".theta-param-uniform");
const thetaParamsAccelerated = document.querySelectorAll(".theta-param-accelerated");
const thetaParamsOscillating = document.querySelectorAll(".theta-param-oscillating");

let thetaPlaying = false;
let thetaAnimationId = null;

const thetaCx = 210;
const thetaCy = 210;
const thetaR = 145;

function thetaPolarToCartesian(cx, cy, r, angleRad) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy - r * Math.sin(angleRad)
  };
}

function thetaArcPath(cx, cy, r, startRad, endRad) {
  const start = thetaPolarToCartesian(cx, cy, r, startRad);
  const end = thetaPolarToCartesian(cx, cy, r, endRad);
  const delta = Math.abs(endRad - startRad);
  const largeArcFlag = delta % (2 * Math.PI) > Math.PI ? 1 : 0;
  const sweepFlag = endRad >= startRad ? 0 : 1;

  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

function calculateTheta(t) {
  const mode = thetaFunctionType.value;

  if (mode === "uniform") {
    const omega = Number(omegaInput.value);
    return {
      theta: omega * t,
      omegaInstant: omega,
      equation: "θ(t) = ωt",
      description: "หมุนด้วยความเร็วเชิงมุมคงที่"
    };
  }

  if (mode === "accelerated") {
    const theta0 = Number(theta0Input.value);
    const omega0 = Number(omega0Input.value);
    const alpha = Number(alphaInput.value);

    return {
      theta: theta0 + omega0 * t + 0.5 * alpha * t * t,
      omegaInstant: omega0 + alpha * t,
      equation: "θ(t) = θ₀ + ω₀t + ½αt²",
      description: "หมุนเร็วขึ้นหรือช้าลงตามค่าความเร่งเชิงมุม α"
    };
  }

  const A = Number(amplitudeInput.value);
  const bigOmega = Number(bigOmegaInput.value);

  return {
    theta: A * Math.sin(bigOmega * t),
    omegaInstant: A * bigOmega * Math.cos(bigOmega * t),
    equation: "θ(t) = A sin(Ωt)",
    description: "จุดตัวแทนแกว่งกลับไปกลับมารอบตำแหน่งสมดุล"
  };
}

function updateThetaParamVisibility() {
  const mode = thetaFunctionType.value;

  thetaParamsUniform.forEach(el => {
    el.style.display = mode === "uniform" ? "flex" : "none";
  });

  thetaParamsAccelerated.forEach(el => {
    el.style.display = mode === "accelerated" ? "flex" : "none";
  });

  thetaParamsOscillating.forEach(el => {
    el.style.display = mode === "oscillating" ? "flex" : "none";
  });
}

function buildTrail(tNow) {
  const steps = 60;
  let path = "";

  for (let i = 0; i <= steps; i++) {
    const t = Math.max(0, tNow - 2 + (2 * i / steps));
    const result = calculateTheta(t);
    const p = thetaPolarToCartesian(thetaCx, thetaCy, thetaR, result.theta);

    if (i === 0) {
      path += `M ${p.x} ${p.y}`;
    } else {
      path += ` L ${p.x} ${p.y}`;
    }
  }

  return path;
}

function updateThetaMotion() {
  updateThetaParamVisibility();

  const t = Number(thetaTimeSlider.value);
  const result = calculateTheta(t);
  const theta = result.theta;

  const point = thetaPolarToCartesian(thetaCx, thetaCy, thetaR, theta);

  thetaPoint.setAttribute("cx", point.x);
  thetaPoint.setAttribute("cy", point.y);

  thetaRadiusLine.setAttribute("x1", thetaCx);
  thetaRadiusLine.setAttribute("y1", thetaCy);
  thetaRadiusLine.setAttribute("x2", point.x);
  thetaRadiusLine.setAttribute("y2", point.y);

  const arcTheta = Math.max(Math.min(theta, 2 * Math.PI), -2 * Math.PI);
  thetaArc.setAttribute("d", thetaArcPath(thetaCx, thetaCy, 70, 0, arcTheta));

  thetaTrail.setAttribute("d", buildTrail(t));

  thetaLabel.textContent = `θ = ${theta.toFixed(2)} rad`;
  thetaLabel.setAttribute("x", point.x + 12);
  thetaLabel.setAttribute("y", point.y - 12);

  thetaTimeValue.textContent = `${t.toFixed(2)} s`;
  thetaTText.textContent = `t = ${t.toFixed(2)} s`;
  thetaValueText.textContent = `θ = ${theta.toFixed(2)} rad`;
  omegaValueText.textContent = `ω = ${result.omegaInstant.toFixed(2)} rad/s`;
  thetaEquationText.textContent = result.equation;
  motionDescriptionText.textContent = result.description;
}

function animateThetaMotion() {
  if (!thetaPlaying) return;

  let t = Number(thetaTimeSlider.value);
  t += 0.02;

  if (t > Number(thetaTimeSlider.max)) {
    t = 0;
  }

  thetaTimeSlider.value = t;
  updateThetaMotion();

  thetaAnimationId = requestAnimationFrame(animateThetaMotion);
}

thetaPlayBtn.addEventListener("click", () => {
  thetaPlaying = !thetaPlaying;

  if (thetaPlaying) {
    thetaPlayBtn.textContent = "⏸ หยุด";
    animateThetaMotion();
  } else {
    thetaPlayBtn.textContent = "▶ เล่น";
    cancelAnimationFrame(thetaAnimationId);
  }
});

thetaResetBtn.addEventListener("click", () => {
  thetaPlaying = false;
  cancelAnimationFrame(thetaAnimationId);
  thetaPlayBtn.textContent = "▶ เล่น";
  thetaTimeSlider.value = 0;
  updateThetaMotion();
});

[
  thetaFunctionType,
  thetaTimeSlider,
  omegaInput,
  theta0Input,
  omega0Input,
  alphaInput,
  amplitudeInput,
  bigOmegaInput
].forEach(input => {
  input.addEventListener("input", updateThetaMotion);
});

updateThetaMotion();

const crossA = document.getElementById("crossA");
const crossB = document.getElementById("crossB");
const crossTheta = document.getElementById("crossTheta");

const crossAValue = document.getElementById("crossAValue");
const crossBValue = document.getElementById("crossBValue");
const crossThetaValue = document.getElementById("crossThetaValue");

const vectorA = document.getElementById("vectorA");
const vectorB = document.getElementById("vectorB");
const parallelA = document.getElementById("parallelA");
const parallelB = document.getElementById("parallelB");
const parallelogramArea = document.getElementById("parallelogramArea");
const angleArcCross = document.getElementById("angleArcCross");
const angleTextCross = document.getElementById("angleTextCross");
const crossAxisZ = document.getElementById("crossAxisZ");
const crossAxisZLabel = document.getElementById("crossAxisZLabel");

const labelA = document.getElementById("labelA");
const labelB = document.getElementById("labelB");
const normalVector = document.getElementById("normalVector");
const normalLabel = document.getElementById("normalLabel");

const crossMagnitudeText = document.getElementById("crossMagnitudeText");
const crossDirectionText = document.getElementById("crossDirectionText");
const crossSpecialText = document.getElementById("crossSpecialText");
const swapCrossBtn = document.getElementById("swapCrossBtn");

let crossSwapped = false;

const origin = { x: 135, y: 265 };
const scale = 45;

function setSvgLine(line, p1, p2) {
  line.setAttribute("x1", p1.x);
  line.setAttribute("y1", p1.y);
  line.setAttribute("x2", p2.x);
  line.setAttribute("y2", p2.y);
}

function pointFromVector(length, angleDeg) {
  const rad = angleDeg * Math.PI / 180;
  return {
    x: origin.x + length * scale * Math.cos(rad),
    y: origin.y - length * scale * Math.sin(rad) * 0.58
  };
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const steps = Math.max(8, Math.ceil(Math.abs(endDeg - startDeg) / 8));
  let path = "";

  for (let i = 0; i <= steps; i++) {
    const deg = startDeg + (endDeg - startDeg) * (i / steps);
    const rad = deg * Math.PI / 180;
    const p = {
      x: cx + r * Math.cos(rad),
      y: cy - r * Math.sin(rad) * 0.58
    };
    path += `${i === 0 ? "M" : "L"} ${p.x} ${p.y} `;
  }

  return path.trim();
}

function updateCrossProduct() {
  const A = Number(crossA.value);
  const B = Number(crossB.value);
  const theta = Number(crossTheta.value);

  crossAValue.textContent = A.toFixed(1);
  crossBValue.textContent = B.toFixed(1);
  crossThetaValue.textContent = `${theta}°`;

  const angleA = 0;
  const angleB = theta;

  const axisZEnd = { x: origin.x, y: origin.y - 180 };
  setSvgLine(crossAxisZ, origin, axisZEnd);
  crossAxisZLabel.setAttribute("x", axisZEnd.x + 8);
  crossAxisZLabel.setAttribute("y", axisZEnd.y + 4);

  const endA = pointFromVector(A, angleA);
  const endB = pointFromVector(B, angleB);

  const translatedA = {
    x: endB.x + (endA.x - origin.x),
    y: endB.y + (endA.y - origin.y)
  };

  const translatedB = {
    x: endA.x + (endB.x - origin.x),
    y: endA.y + (endB.y - origin.y)
  };

  setSvgLine(vectorA, origin, endA);
  setSvgLine(vectorB, origin, endB);
  setSvgLine(parallelA, endB, translatedA);
  setSvgLine(parallelB, endA, translatedB);

  parallelogramArea.setAttribute(
    "points",
    `${origin.x},${origin.y} ${endA.x},${endA.y} ${translatedB.x},${translatedB.y} ${endB.x},${endB.y}`
  );

  angleArcCross.setAttribute("d", arcPath(origin.x, origin.y, 48, 0, theta));
  const thetaMid = theta * Math.PI / 360;
  angleTextCross.setAttribute("x", origin.x + 60 * Math.cos(thetaMid) + 4);
  angleTextCross.setAttribute("y", origin.y - 60 * Math.sin(thetaMid) * 0.58 - 4);

  labelA.setAttribute("x", endA.x + 8);
  labelA.setAttribute("y", endA.y - 8);
  labelB.setAttribute("x", endB.x + 8);
  labelB.setAttribute("y", endB.y - 8);

  const magnitude = A * B * Math.sin(theta * Math.PI / 180);
  const normalBase = origin;
  const normalLength = Math.min(150, Math.abs(magnitude) * 9);

  crossMagnitudeText.textContent = `${magnitude.toFixed(2)}`;

  normalVector.setAttribute("x1", normalBase.x);
  normalVector.setAttribute("y1", normalBase.y);
  normalLabel.setAttribute("x", normalBase.x + 12);

  if (normalLength < 0.5) {
    normalVector.setAttribute("x2", normalBase.x);
    normalVector.setAttribute("y2", normalBase.y);
    normalLabel.textContent = crossSwapped ? "B × A = 0" : "A × B = 0";
    normalLabel.setAttribute("y", normalBase.y - 12);
  } else if (crossSwapped) {
    normalVector.setAttribute("x2", normalBase.x);
    normalVector.setAttribute("y2", normalBase.y + normalLength);
    normalLabel.textContent = "B × A";
    crossDirectionText.textContent = "ทิศ -z";
    normalLabel.setAttribute("y", normalBase.y + normalLength + 8);
  } else {
    normalVector.setAttribute("x2", normalBase.x);
    normalVector.setAttribute("y2", normalBase.y - normalLength);
    normalLabel.textContent = "A × B";
    crossDirectionText.textContent = "ทิศ +z";
    normalLabel.setAttribute("y", normalBase.y - normalLength - 8);
  }

  if (theta === 0 || theta === 180) {
    crossSpecialText.textContent = "เวกเตอร์ขนานกัน ผลคูณแบบครอสเท่ากับศูนย์";
  } else if (theta === 90) {
    crossSpecialText.textContent = "เวกเตอร์ตั้งฉากกัน ขนาดผลคูณเท่ากับ AB";
  } else {
    crossSpecialText.textContent = "เวกเตอร์ทำมุมกัน ขนาดขึ้นกับค่า sinθ";
  }
}

swapCrossBtn.addEventListener("click", () => {
  crossSwapped = !crossSwapped;
  updateCrossProduct();

  w11Math(swapCrossBtn);
});

[crossA, crossB, crossTheta].forEach(input => {
  input.addEventListener("input", updateCrossProduct);
});

updateCrossProduct();
