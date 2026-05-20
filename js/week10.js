
function n(id){return document.getElementById(id)}
function val(id){return parseFloat(n(id)?.value || 0)}
function fixed(x,d=2){return Number(x).toFixed(d)}
function has(id){return Boolean(n(id))}
function safeRun(fn){try{fn()}catch(error){console.warn(error)}}
function sci(value,digits=3){
  if(value===0)return '0';
  const exponent=Math.floor(Math.log10(Math.abs(value)));
  const mantissa=value/10**exponent;
  return `${mantissa.toFixed(digits)}\\times10^{${exponent}}`;
}
let w10ContinuityAnimating=false;
function toggleReveal(id){
  const el=n(id);
  if(!el) return;
  const targetDisplay=el.dataset.display || 'block';
  const isHidden=getComputedStyle(el).display==='none';
  el.style.display=isHidden ? targetDisplay : 'none';
}
function svgText(x,y,t,c='w10-value'){return `<text x="${x}" y="${y}" class="${c}">${t}</text>`}
function setW10FlowMode(mode){const s=n('w10FlowModeSvg'); if(!s) return; let curves=''; if(mode==='laminar'){[58,92,126,160,194].forEach(y=>curves+=`<path class="w10-stream" marker-end="url(#w10ArrowBlue)" d="M40 ${y} C160 ${y-10}, 300 ${y+10}, 480 ${y}"/>`)}else{[58,92,126,160,194].forEach((y,i)=>curves+=`<path class="w10-stream" marker-end="url(#w10ArrowRed)" d="M40 ${y} C120 ${y+(i%2?45:-35)}, 210 ${y-45}, 300 ${y+35} S420 ${y-30}, 480 ${y}"/>`)} s.innerHTML=`<rect x="20" y="30" width="480" height="180" rx="24" fill="#eff6ff" stroke="#bfdbfe"/>${curves}<text x="260" y="228" text-anchor="middle" class="w10-bar-label">${mode==='laminar'?'เส้นกระแสเรียบ ไม่ปั่นป่วน':'เส้นทางการไหลปั่นป่วนและไม่คงตัว'}</text>`;}
function updateW10Stream(){let v1=val('w10StreamV1'),v2=val('w10StreamV2');n('w10StreamV1Val').textContent=fixed(v1,1);n('w10StreamV2Val').textContent=fixed(v2,1);n('w10StreamFeedback').innerHTML=`เมื่อบริเวณหนึ่งมีความเร็วมากกว่า ลูกศรความเร็วและความถี่ของอนุภาคจะเพิ่มขึ้น`;let lines='';[70,110,150,190,230].forEach((y,i)=>{let gap=(v2-v1)*3; lines+=`<path class="w10-stream" marker-end="url(#w10ArrowBlue)" d="M40 ${y} C180 ${y}, 250 ${y-gap}, 360 ${y-gap} S500 ${y}, 590 ${y}"/>`;});let arrows=`<line x1="105" y1="38" x2="${105+v1*18}" y2="38" stroke="#16a34a" stroke-width="5" marker-end="url(#w10ArrowGreen)"/><line x1="430" y1="38" x2="${430+v2*12}" y2="38" stroke="#dc2626" stroke-width="5" marker-end="url(#w10ArrowRed)"/>`;n('w10StreamSvg').innerHTML=`<path d="M30 55 C180 20,240 90,340 80 C445 70,485 35,600 55 L600 245 C485 265,445 230,340 220 C240 210,180 280,30 245 Z" class="w10-water"/>${lines}${arrows}${svgText(92,26,'v₁')}${svgText(420,26,'v₂')}`;}
function updateW10Continuity(){
  const A1=val('w10A1'), A2=val('w10A2'), v1=val('w10V1'), Q=A1*v1, v2=Q/A2;
  n('w10A1Val').textContent=fixed(A1,2);
  n('w10A2Val').textContent=fixed(A2,2);
  n('w10V1Val').textContent=fixed(v1,1);
  n('w10ContFeedback').innerHTML=
  `\\[Q_1=A_1v_1=${fixed(A1,2)}(${fixed(v1,1)})=${fixed(Q,2)}\\ \\mathrm{m^3/s}=Q_2=A_2v_2\\] \\[v_2=\\frac{Q}{A_2}=\\frac{${fixed(Q,2)}}{${fixed(A2,2)}}=${fixed(v2,2)}\\ \\mathrm{m/s}\\]`;
  if(typeof renderMath==='function')renderMath(n('w10ContFeedback'));

  const svg=n('w10ContSvg');
  if(!svg)return;
  const h1=58+A1/0.5*152, h2=52+A2/0.45*142;
  const y1=155-h1/2, y2=155-h2/2;
  const xL=38, xN1=258, xN2=420, xR=642;
  const leftSection=126, rightSection=506;
  const velocityScale=v=>Math.min(1,Math.sqrt(Math.max(v,0))/Math.sqrt(20));
  const s1=velocityScale(v1), s2=velocityScale(v2);
  const v1Len=36+s1*130, v2Len=36+s2*130;
  const v1Width=3+s1*7, v2Width=3+s2*7;
  const vol1=30+s1*130, vol2=30+s2*130;
  const duration=Math.max(1.2,5.8/(1+Q)).toFixed(2);
  const movingBlock=w10ContinuityAnimating?`
    <rect class="w10-cont-moving-volume" x="${leftSection}" y="${y1}" width="${vol1}" height="${h1}" rx="5">
      <animate attributeName="x" values="${leftSection};${rightSection};${rightSection}" dur="${duration}s" repeatCount="indefinite"/>
      <animate attributeName="y" values="${y1};${y2};${y2}" keyTimes="0;0.38;1" dur="${duration}s" repeatCount="indefinite"/>
      <animate attributeName="width" values="${vol1};${vol2};${vol2}" keyTimes="0;0.38;1" dur="${duration}s" repeatCount="indefinite"/>
      <animate attributeName="height" values="${h1};${h2};${h2}" keyTimes="0;0.38;1" dur="${duration}s" repeatCount="indefinite"/>
    </rect>`:'';

  svg.innerHTML=`
    <path class="w10-cont-water" d="M${xL} ${y1} L${xN1} ${y1} C335 ${y1},343 ${y2},${xN2} ${y2} L${xR} ${y2} L${xR} ${y2+h2} L${xN2} ${y2+h2} C343 ${y2+h2},335 ${y1+h1},${xN1} ${y1+h1} L${xL} ${y1+h1} Z"/>
    <path class="w10-cont-wall" d="M${xL} ${y1} L${xN1} ${y1} C335 ${y1},343 ${y2},${xN2} ${y2} L${xR} ${y2}"/>
    <path class="w10-cont-wall" d="M${xL} ${y1+h1} L${xN1} ${y1+h1} C335 ${y1+h1},343 ${y2+h2},${xN2} ${y2+h2} L${xR} ${y2+h2}"/>
    <line class="w10-cont-section" x1="${leftSection}" y1="${y1-20}" x2="${leftSection}" y2="${y1+h1+20}"/>
    <line class="w10-cont-section" x1="${rightSection}" y1="${y2-20}" x2="${rightSection}" y2="${y2+h2+20}"/>
    <rect class="w10-cont-volume left" x="${leftSection}" y="${y1}" width="${vol1}" height="${h1}" rx="5"/>
    <rect class="w10-cont-volume right" x="${rightSection}" y="${y2}" width="${vol2}" height="${h2}" rx="5"/>
    ${movingBlock}
    <line class="w10-cont-arrow v1" x1="78" y1="${y1-26}" x2="${78+v1Len}" y2="${y1-26}" stroke-width="${v1Width}" marker-end="url(#w10ArrowGreen)"/>
    <line class="w10-cont-arrow v2" x1="450" y1="${y2-26}" x2="${450+v2Len}" y2="${y2-26}" stroke-width="${v2Width}" marker-end="url(#w10ArrowRed)"/>
    <text x="70" y="34" class="w10-bar-label">A₁=${fixed(A1,2)} m²</text>
    <text x="414" y="34" class="w10-bar-label">A₂=${fixed(A2,2)} m²</text>
    <text x="${78+v1Len+14}" y="${y1-20}" class="w10-value">v₁=${fixed(v1,1)} m/s</text>
    <text x="632" y="${y2-20}" text-anchor="end" class="w10-value">v₂=${fixed(v2,2)} m/s</text>
    <text x="340" y="286" text-anchor="middle" class="w10-cont-summary">A₁v₁ = A₂v₂ = ${fixed(Q,2)} m³/s</text>`;
}
function toggleW10ContinuityAnimation(){
  w10ContinuityAnimating=!w10ContinuityAnimating;
  const btn=n('w10ContPlay');
  if(btn)btn.textContent=w10ContinuityAnimating?'หยุด animation':'เล่น animation';
  updateW10Continuity();
}
function updateW10BernoulliBar(){let P=val('w10BP'),v=val('w10BV'),y=val('w10BY'),rho=1000,g=9.81;let k=.5*rho*v*v, u=rho*g*y, total=P+k+u;n('w10BPVal').textContent=Math.round(P);n('w10BVVal').textContent=fixed(v,1);n('w10BYVal').textContent=fixed(y,1);n('w10BFeedback').innerHTML=`ผลรวม = ${Math.round(total).toLocaleString()} Pa`;let max=260000;let bars=[['P',P,'#2563eb'],['½ρv²',k,'#f59e0b'],['ρgy',u,'#16a34a']];let out='<line x1="70" y1="280" x2="570" y2="280" class="w10-axis"/>';bars.forEach((b,i)=>{let h=Math.min(220,b[1]/max*220),x=130+i*150;out+=`<rect x="${x}" y="${280-h}" width="85" height="${h}" rx="10" fill="${b[2]}" opacity=".8"/><text x="${x+42}" y="305" text-anchor="middle" class="w10-bar-label">${b[0]}</text><text x="${x+42}" y="${270-h}" text-anchor="middle" class="w10-value">${Math.round(b[1]).toLocaleString()}</text>`});n('w10BarSvg').innerHTML=out;}
function updateW10Lift(){let CL=val('w10CL'),A=val('w10LiftA'),v=val('w10LiftV'),rho=1.3,F=.5*CL*rho*A*v*v,m=F/9.81;n('w10CLVal').textContent=fixed(CL,2);n('w10LiftAVal').textContent=fixed(A,1);n('w10LiftVVal').textContent=Math.round(v);n('w10LiftFeedback').innerHTML=`F_L ≈ ${Math.round(F).toLocaleString()} N, รองรับมวลได้ ≈ ${Math.round(m).toLocaleString()} kg`;let arrow=Math.min(160,30+F/5000);n('w10LiftSvg').innerHTML=`<path d="M120 190 C230 115,420 120,560 175 C410 200,250 215,120 190 Z" fill="#e0f2fe" stroke="#2563eb" stroke-width="4"/><path d="M70 105 C190 75,360 82,600 110" class="w10-stream" marker-end="url(#w10ArrowBlue)"/><path d="M70 245 C230 250,410 242,600 220" class="w10-stream" marker-end="url(#w10ArrowBlue)"/><line x1="350" y1="180" x2="350" y2="${180-arrow}" stroke="#dc2626" stroke-width="9" marker-end="url(#w10ArrowRed)"/><text x="370" y="${180-arrow+20}" class="w10-bar-label" fill="#dc2626">Lift</text><text x="250" y="310" class="w10-value">แรงยกเพิ่มตาม v² จึงไวต่อความเร็วมาก</text>`;}
function updateW10Viscosity(){let eta=val('w10Eta'),A=val('w10VisA'),v=val('w10PlateV'),L=val('w10Gap'),F=eta*A*v/L;n('w10EtaVal').textContent=fixed(eta,2);n('w10VisAVal').textContent=fixed(A,2);n('w10PlateVVal').textContent=fixed(v,1);n('w10GapVal').textContent=fixed(L,2);n('w10VisFeedback').innerHTML=`F_d = ηAv/L = ${fixed(F,2)} N`;let gap=60+L*300,top=100,bottom=top+gap;let out=`<rect x="80" y="${top}" width="460" height="22" rx="4" fill="#64748b"/><rect x="80" y="${bottom}" width="460" height="22" rx="4" fill="#334155"/><rect x="90" y="${top+22}" width="440" height="${gap-0}" fill="#dbeafe" opacity=".75"/>`;for(let i=1;i<=5;i++){let y=top+25+i*(gap-10)/6;let len=30+v*12*(6-i)/5;out+=`<line x1="120" y1="${y}" x2="${120+len}" y2="${y}" stroke="#2563eb" stroke-width="4" marker-end="url(#w10ArrowBlue)"/>`}out+=`<line x1="365" y1="${top-20}" x2="${365+v*28}" y2="${top-20}" stroke="#dc2626" stroke-width="6" marker-end="url(#w10ArrowRed)"/>${svgText(250,318,'ชั้นของไหลเคลื่อนที่เร็วต่างกัน เกิดแรงฉุดจากความหนืด')}`;n('w10VisSvg').innerHTML=out;}
function updateW10Stokes(){
  const rmm=val('w10R'),eta=val('w10SEta'),v=val('w10SV'),r=rmm/1000,F=6*Math.PI*eta*r*v;
  n('w10RVal').textContent=fixed(rmm,1);
  n('w10SEtaVal').textContent=fixed(eta,2);
  n('w10SVVal').textContent=fixed(v,2);

  const fmtSci=value=>{
    if(value===0)return '0';
    const exponent=Math.floor(Math.log10(Math.abs(value)));
    const mantissa=value/10**exponent;
    return `${mantissa.toFixed(2)}\\times10^{${exponent}}`;
  };
  const feedback=n('w10StokesFeedback');
  feedback.innerHTML=`
    \\[
      F_{\\text{drag}}=6\\pi\\mu r v
      =6\\pi(${eta.toFixed(2)})(${r.toFixed(4)})(${v.toFixed(2)})\\]
    \\[
      F_\\text{drag}=${fmtSci(F)}\\ \\mathrm{N}
    \\]
  `;
  if(typeof renderMath==='function')renderMath(feedback);

  const maxF=6*Math.PI*5*(10/1000)*3;
  const forceRatio=Math.max(0,Math.min(1,F/maxF));
  const speedRatio=Math.max(0,Math.min(1,v/3));
  const R=Math.min(70,10+rmm*5);
  const velocityLen=34+speedRatio*112;
  const dragLen=48+forceRatio*264;
  const dragWidth=4+forceRatio*14;
  const speedWidth=4+speedRatio*5;
  const cx=320,cy=170;
  n('w10StokesSvg').innerHTML=`
    <rect x="60" y="35" width="500" height="270" rx="22" class="w10-water"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#f59e0b" stroke="#b45309" stroke-width="4"/>
    <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy+velocityLen}" stroke="#dc2626" stroke-width="${speedWidth}" marker-end="url(#w10ArrowRed)"/>
    <text x="${cx+16}" y="${cy+velocityLen-8}" class="w10-value">v=${fixed(v,2)} m/s</text>
    <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-dragLen}" stroke="#2563eb" stroke-width="${dragWidth}" marker-end="url(#w10ArrowBlue)"/>
    <text x="${cx+16}" y="${cy-dragLen+8}" class="w10-value">Fdrag=${F.toFixed(3)} N</text>
  `;
}
let w10TerminalAnimating=false;
let w10TerminalStart=0;
let w10TerminalTime=0;
let w10TerminalFrame=null;
let w10TerminalFormulaKey='';

function toggleW10TerminalAnimation(){
  w10TerminalAnimating=!w10TerminalAnimating;
  const btn=n('w10TerminalToggle');
  if(btn)btn.textContent=w10TerminalAnimating?'หยุด Animation':'เริ่ม Animation';
  if(w10TerminalAnimating){
    w10TerminalStart=performance.now()-w10TerminalTime*1000;
    w10TerminalFrame=requestAnimationFrame(stepW10TerminalAnimation);
  }else if(w10TerminalFrame){
    cancelAnimationFrame(w10TerminalFrame);
    w10TerminalFrame=null;
  }
}

function stepW10TerminalAnimation(now){
  if(!w10TerminalAnimating)return;
  w10TerminalTime=(now-w10TerminalStart)/1000;
  if(w10TerminalTime>10){
    w10TerminalTime=0;
    w10TerminalStart=now;
  }
  updateW10Terminal();
  w10TerminalFrame=requestAnimationFrame(stepW10TerminalAnimation);
}

function resetW10TerminalAnimation(){
  w10TerminalAnimating=false;
  w10TerminalTime=0;
  w10TerminalStart=0;
  if(w10TerminalFrame){
    cancelAnimationFrame(w10TerminalFrame);
    w10TerminalFrame=null;
  }
  const btn=n('w10TerminalToggle');
  if(btn)btn.textContent='เริ่ม Animation';
  updateW10Terminal();
}

function updateW10Terminal(){
  const rmm=val('w10TR'),rf=val('w10RhoF'),mu=val('w10TEta');
  const r=rmm/1000,g=9.81,V=4*Math.PI*r**3/3;
  const minMassGram=rf*V*1000;
  const massInput=n('w10Mass');
  let massGram=Math.max(val('w10Mass'),minMassGram);
  if(massInput){
    massInput.min=fixed(minMassGram,3);
    massInput.value=fixed(massGram,3);
  }
  const m=massGram/1000;
  const weight=m*g;
  const buoyancy=rf*V*g;
  const drivingForce=Math.max(0,weight-buoyancy);
  const dragCoefficient=6*Math.PI*mu*r;
  const vt=drivingForce/dragCoefficient;
  const tau=Math.max(0.25,m/dragCoefficient);
  const t=w10TerminalAnimating?w10TerminalTime:0;
  const approach=1-Math.exp(-t/tau);
  const v=vt*approach;
  const displacement=vt*(t-tau*(1-Math.exp(-t/tau)));
  const displacementMax=vt*(10-tau*(1-Math.exp(-10/tau)));
  const W=weight,FB=buoyancy,Fd=dragCoefficient*Math.abs(v);
  const net=drivingForce-dragCoefficient*v;

  n('w10TRVal').textContent=fixed(rmm,1);
  n('w10MassVal').textContent=fixed(massGram,3);
  n('w10MassMinVal').textContent=fixed(minMassGram,3);
  n('w10RhoFVal').textContent=Math.round(rf);
  n('w10TEtaVal').textContent=fixed(mu,3);
  const formulaKey=[rmm,massGram,rf,mu].join('|');
  if(formulaKey!==w10TerminalFormulaKey){
    w10TerminalFormulaKey=formulaKey;
    const feedback=n('w10TerminalFeedback');
    feedback.innerHTML=`
      \\[
        m=${sci(m)}\\ \\mathrm{kg},
        \\qquad V=\\frac{4}{3}\\pi r^3=${sci(V)}\\ \\mathrm{m^3}
      \\]
      \\[
        v_t=\\frac{mg-\\rho Vg}{6\\pi\\mu r}
        =\\frac{(${sci(m)})(9.81)-(${Math.round(rf)})(${sci(V)})(9.81)}{6\\pi(${mu.toFixed(2)})(${r.toFixed(4)})}
        =${vt.toFixed(3)}\\ \\mathrm{m/s}
      \\]
      \\[
        v(t)=v_t\\left(1-e^{-t/\\tau}\\right),\\qquad
        y(t)=-v_t\\left[t-\\tau\\left(1-e^{-t/\\tau}\\right)\\right],\\qquad
        \\tau=\\frac{m}{6\\pi\\mu r}=${tau.toFixed(2)}\\ \\mathrm{s}
      \\]
    `;
    if(typeof renderMath==='function')renderMath(feedback);
  }

  const graphMax=Math.max(Math.abs(vt),Math.abs(v),0.001);
  const x0=360,y0=560,w=280,h=430,tMax=10;
  const zeroY=y0;
  const graphY=value=>{
    const ratio=Math.max(0,Math.min(1,value/graphMax));
    return zeroY-ratio*h;
  };
  const graphX=time=>x0+(time/tMax)*w;
  const currentX=graphX(t), currentY=graphY(v), vtY=graphY(vt);
  const tankTop=35,tankHeight=540,ballStart=75,ballTravel=tankTop+tankHeight/2-ballStart;
  const displacementRatio=Math.max(0,Math.min(1,Math.abs(displacement)/Math.max(Math.abs(displacementMax),1e-9)));
  const ballY=vt>=0 ? ballStart+displacementRatio*ballTravel : ballStart+ballTravel-displacementRatio*ballTravel;
  const R=Math.max(10,Math.min(34,8+rmm*2.6));
  const forceMax=Math.max(W,FB,Fd,1e-9);
  const wLen=22+(W/forceMax)*48, bLen=22+(FB/forceMax)*48, dLen=22+(Fd/forceMax)*48;
  const dragEndY=v>=0 ? ballY-dLen : ballY+dLen;
  const dragLabelY=v>=0 ? dragEndY+6 : dragEndY;
  let pts=[];
  for(let i=0;i<=80;i++){
    const ti=tMax*i/80;
    const vi=vt*(1-Math.exp(-ti/tau));
    pts.push(`${graphX(ti).toFixed(1)},${graphY(vi).toFixed(1)}`);
  }
  n('w10TerminalSvg').innerHTML=`
    <rect x="40" y="${tankTop}" width="260" height="${tankHeight}" rx="24" class="w10-water"/>
    <line x1="70" y1="${ballY}" x2="270" y2="${ballY}" stroke="#93c5fd" stroke-width="2" stroke-dasharray="6 6"/>
    <circle cx="170" cy="${ballY}" r="${R}" fill="#f59e0b" stroke="#92400e" stroke-width="4"/>
    <line x1="170" y1="${ballY}" x2="170" y2="${ballY+wLen}" stroke="#dc2626" stroke-width="6" marker-end="url(#w10ArrowRed)"/>
    <text x="186" y="${ballY+wLen}" class="w10-value">W</text>
    <line x1="148" y1="${ballY}" x2="148" y2="${ballY-bLen}" stroke="#16a34a" stroke-width="5" marker-end="url(#w10ArrowGreen)"/>
    <text x="104" y="${ballY-bLen+6}" class="w10-value">FB</text>
    <line x1="194" y1="${ballY}" x2="194" y2="${dragEndY}" stroke="#2563eb" stroke-width="5" marker-end="url(#w10ArrowBlue)"/>
    <text x="206" y="${dragLabelY}" class="w10-value">Fdrag</text>
    <text x="78" y="600" class="w10-value">t=${t.toFixed(1)} s, v=${v.toFixed(2)} m/s, y=-${displacement.toFixed(2)} m</text>
    <text x="365" y="55" class="w10-bar-label">กราฟ v-t</text>
    <line x1="${x0}" y1="${zeroY}" x2="${x0+w}" y2="${zeroY}" class="w10-axis"/>
    <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0-h}" class="w10-axis"/>
    <text x="${x0-10}" y="${zeroY-8}" text-anchor="end" class="w10-value">v=0</text>
    <text x="${x0-10}" y="${y0-h}" text-anchor="end" class="w10-value">v</text>
    <text x="${x0+300}" y="${y0+10}" text-anchor="end" class="w10-value">t</text>
    <polyline points="${pts.join(' ')}" fill="none" stroke="#2563eb" stroke-width="5"/>
    <line x1="${x0}" y1="${vtY}" x2="${x0+w}" y2="${vtY}" stroke="#dc2626" stroke-width="3" stroke-dasharray="7 7"/>
    <line x1="${currentX}" y1="${zeroY}" x2="${currentX}" y2="${currentY}" stroke="#64748b" stroke-width="2" stroke-dasharray="5 5"/>
    <circle cx="${currentX}" cy="${currentY}" r="7" fill="#f59e0b" stroke="#92400e" stroke-width="3"/>
    <text x="${x0+w-54}" y="${vtY-8}" class="w10-value">vt</text>
    <text x="${currentX+10}" y="${currentY-10}" class="w10-value">v(t)</text>
  `;
}
function initW10(){
  if(has('flowRateSvg')) safeRun(updateFlowRate);
  if(has('w10FlowModeSvg')) safeRun(()=>setW10FlowMode('laminar'));
  if(has('w10StreamSvg')) safeRun(updateW10Stream);
  if(has('w10ContSvg')) safeRun(updateW10Continuity);
  if(has('w10BarSvg')) safeRun(updateW10BernoulliBar);
  if(has('w10LiftSvg')) safeRun(updateW10Lift);
  if(has('w10VisSvg')) safeRun(updateW10Viscosity);
  if(has('w10StokesSvg')) safeRun(updateW10Stokes);
  if(has('w10TerminalSvg')) safeRun(updateW10Terminal);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initW10);else initW10();
function getFlowRateState(){
  const area=val('flowArea'), velocity=val('flowVelocity');
  return {area, velocity, volume:area*velocity, rate:area*velocity};
}
function flowPipeHeight(area){
  const min=0.001, max=0.100, ratio=Math.max(0,Math.min(1,(area-min)/(max-min)));
  return 52+Math.sqrt(ratio)*132;
}
function drawFlowRate(animate=false){
  const svg=n('flowRateSvg');
  if(!svg)return;
  const {area, velocity, volume, rate}=getFlowRateState();
  const pipeH=flowPipeHeight(area), y=170-pipeH/2, centerY=170, sectionX=250;
  const travel=Math.min(430,45+velocity*37), arrow=Math.min(260,50+velocity*22);
  const sectionEnd=sectionX+travel, bottomGuide=y+pipeH+45;
  const duration=Math.max(.8,3.1-velocity*.22).toFixed(2);
  const block=`<rect class="flow-volume ${animate?'is-animating':''}" x="${sectionX}" y="${y}" width="${travel}" height="${pipeH}" rx="6"/>`;
  svg.innerHTML=`
    <defs>
      <marker id="flowArrow" markerWidth="5" markerHeight="5" refX="0" refY="2.5" orient="auto">
        <path d="M0,0 L5,2.5 L0,5 Z" fill="#0f766e"></path>
      </marker>
    </defs>
    <rect class="flow-pipe-water" x="70" y="${y}" width="760" height="${pipeH}"/>
    <path class="flow-pipe-rim" d="M70 ${y} C42 ${y+pipeH*.16},42 ${y+pipeH*.84},70 ${y+pipeH}"/>
    <path class="flow-pipe-rim" d="M830 ${y} C858 ${y+pipeH*.16},858 ${y+pipeH*.84},830 ${y+pipeH}"/>
    <line class="flow-pipe-wall" x1="70" y1="${y}" x2="830" y2="${y}"/>
    <line class="flow-pipe-wall" x1="70" y1="${y+pipeH}" x2="830" y2="${y+pipeH}"/>
    <g class="flow-volume-wrap" style="--flow-distance:${animate?`${520-sectionX}px`:'0px'};--flow-duration:${duration}s">${block}</g>
    <line class="flow-section-line" x1="${sectionEnd}" y1="${y-28}" x2="${sectionEnd}" y2="${y+pipeH+28}"/>
    <text class="flow-svg-label" x="${sectionEnd-70}" y="${y-38}">พื้นที่หน้าตัด</text>
    <line class="flow-velocity-arrow" x1="${sectionX+34}" y1="${centerY}" x2="${sectionX+34+arrow}" y2="${centerY}" marker-end="url(#flowArrow)"/>
    <text class="flow-svg-label" x="${sectionX+42}" y="${centerY-28}">v = ${velocity.toFixed(2)} m/s</text>
    <line class="flow-distance-line" x1="${sectionX}" y1="${bottomGuide}" x2="${sectionEnd}" y2="${bottomGuide}"/>
    <text class="flow-svg-label" x="${sectionX+travel/2}" y="${bottomGuide+29}" text-anchor="middle">ระยะใน 1 s = ${velocity.toFixed(2)} m</text>
    <text class="flow-svg-total" x="450" y="390" text-anchor="middle">V = A(vΔt) = ${area.toFixed(3)} × ${velocity.toFixed(2)} × 1 = ${volume.toFixed(4)} m³</text>
    <text class="flow-svg-total" x="450" y="418" text-anchor="middle">Q = V/Δt = ${rate.toFixed(4)} m³/s</text>`;
}
function updateFlowRate(){
  if(!n('flowArea'))return;
  const {area, velocity, rate, volume}=getFlowRateState();
  n('flowAreaValue').textContent=area.toFixed(3);
  n('flowVelocityValue').textContent=velocity.toFixed(2);
  n('flowRateResult').textContent=`${rate.toFixed(4)} m³/s`;
  n('flowVolumeResult').textContent=`${volume.toFixed(4)} m³`;
  n('flowRateFormula').innerHTML=`\\[Q=Av=(${area.toFixed(3)})(${velocity.toFixed(2)})=${rate.toFixed(4)}\\ \\mathrm{m^3/s}\\]`;
  if(typeof renderMath==='function')renderMath(n('flowRateFormula'));
  drawFlowRate(false);
}
function playFlowRateAnimation(){drawFlowRate(true);}
function resetFlowRate(){
  n('flowArea').value=0.020;
  n('flowVelocity').value=3.00;
  n('flowPracticeAnswer').textContent='';
  updateFlowRate();
}
function showFlowPracticeAnswer(){n('flowPracticeAnswer').textContent='คำตอบ: Q = Av = (0.015)(4.50) = 0.0675 m³/s';}

let bernoulliAnimationPaused = true;

function toggleBernoulliAnimation() {
  bernoulliAnimationPaused = !bernoulliAnimationPaused;
  const svg = document.querySelector(".bernoulli-svg");
  const btn = document.getElementById("beAnimationToggle");
  if (svg) svg.classList.toggle("is-paused", bernoulliAnimationPaused);
  if (btn) btn.textContent = bernoulliAnimationPaused ? "เริ่ม Animation" : "หยุด Animation";
}

function updateBernoulliEnergy() {
  const g = 9.81;

  const A1 = parseFloat(document.getElementById("beA1").value);
  const A2 = parseFloat(document.getElementById("beA2").value);
  const v1 = parseFloat(document.getElementById("beV1").value);
  const y1 = parseFloat(document.getElementById("beY1").value);
  const y2 = parseFloat(document.getElementById("beY2").value);
  const P1 = parseFloat(document.getElementById("beP1").value);
  const rho = parseFloat(document.getElementById("beRho").value);

  // สมการความต่อเนื่อง A1v1 = A2v2
  const v2 = (A1 * v1) / A2;

  // สมการแบร์นูลลี
  // P1 + 1/2 rho v1^2 + rho g y1 = P2 + 1/2 rho v2^2 + rho g y2
  const P2 = P1 + 0.5 * rho * (v1 * v1 - v2 * v2) + rho * g * (y1 - y2);

  const K1 = 0.5 * rho * v1 * v1;
  const K2 = 0.5 * rho * v2 * v2;
  const G1 = rho * g * y1;
  const G2 = rho * g * y2;

  const total1 = P1 + K1 + G1;
  const total2 = P2 + K2 + G2;

  document.getElementById("beA1Val").textContent = A1.toFixed(3);
  document.getElementById("beA2Val").textContent = A2.toFixed(3);
  document.getElementById("beV1Val").textContent = v1.toFixed(2);
  document.getElementById("beY1Val").textContent = y1.toFixed(2);
  document.getElementById("beY2Val").textContent = y2.toFixed(2);
  document.getElementById("beP1Val").textContent = P1.toFixed(0);
  document.getElementById("beRhoVal").textContent = rho.toFixed(0);

  document.getElementById("beV2Result").textContent = `${v2.toFixed(2)} m/s`;
  document.getElementById("beP2Result").textContent = `${P2.toFixed(0)} Pa`;

  document.getElementById("beP1Term").textContent = P1.toFixed(0);
  document.getElementById("beK1Term").textContent = K1.toFixed(0);
  document.getElementById("beG1Term").textContent = G1.toFixed(0);

  document.getElementById("beP2Term").textContent = P2.toFixed(0);
  document.getElementById("beK2Term").textContent = K2.toFixed(0);
  document.getElementById("beG2Term").textContent = G2.toFixed(0);

  document.getElementById("beTotal1").textContent = `${total1.toFixed(0)} Pa`;
  document.getElementById("beTotal2").textContent = `${total2.toFixed(0)} Pa`;

  const maxTerm = Math.max(
    Math.abs(P1),
    Math.abs(P2),
    K1,
    K2,
    G1,
    G2,
    1
  );

  setBarWidth("beP1Bar", P1, maxTerm);
  setBarWidth("beK1Bar", K1, maxTerm);
  setBarWidth("beG1Bar", G1, maxTerm);
  setBarWidth("beP2Bar", P2, maxTerm);
  setBarWidth("beK2Bar", K2, maxTerm);
  setBarWidth("beG2Bar", G2, maxTerm);

  updateBernoulliAnimation(A1, A2, v1, v2, y1, y2, P1, P2);
  updateBernoulliMessage(P2, total1, total2);
}

function setBarWidth(id, value, maxValue) {
  const bar = document.getElementById(id);
  const width = Math.min(Math.abs(value) / maxValue * 100, 100);
  bar.style.width = `${width}%`;

  if (value < 0) {
    bar.style.opacity = "0.35";
  } else {
    bar.style.opacity = "1";
  }
}

function updateBernoulliAnimation(A1, A2, v1, v2, y1, y2, P1, P2) {
  const svg = document.querySelector(".bernoulli-svg");
  const arrow1 = document.getElementById("beArrow1");
  const arrow2 = document.getElementById("beArrow2");
  const packet = document.getElementById("beFluidPacket");
  const setAttrs = (id, attrs) => {
    const el = document.getElementById(id);
    if (!el) return;
    Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value));
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const diameter = area => 40 + Math.sqrt(area / 0.12) * 58;
  const cubicPoint = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return {
      x: u ** 3 * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t ** 3 * p3.x,
      y: u ** 3 * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t ** 3 * p3.y
    };
  };
  const cubicDerivative = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return {
      x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
      y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y)
    };
  };
  const tubeBodyPath = (p0, p1, p2, p3, r1, r2) => {
    const upper = [];
    const lower = [];
    for (let i = 0; i <= 22; i++) {
      const t = i / 22;
      const point = cubicPoint(p0, p1, p2, p3, t);
      const tangent = cubicDerivative(p0, p1, p2, p3, t);
      const len = Math.hypot(tangent.x, tangent.y) || 1;
      const normal = { x: -tangent.y / len, y: tangent.x / len };
      const smoothT = t * t * (3 - 2 * t);
      const r = r1 + (r2 - r1) * smoothT;
      upper.push({ x: point.x + normal.x * r, y: point.y + normal.y * r });
      lower.push({ x: point.x - normal.x * r, y: point.y - normal.y * r });
    }
    const all = [...upper, ...lower.reverse()];
    return `M ${all.map(point => `${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" L ")} Z`;
  };
  const baseline = 370;
  const x1 = 120;
  const x2 = 700;
  const yToSvg = y => baseline - 35 - clamp(y, 0, 5) * 43;
  const cy1 = yToSvg(y1);
  const cy2 = yToSvg(y2);
  const start = { x: 60, y: cy1 };
  const control1 = { x: 250, y: cy1 };
  const control2 = { x: 530, y: cy2 };
  const end = { x: 760, y: cy2 };
  const d1 = diameter(A1);
  const d2 = diameter(A2);
  const fullPath = `M${start.x} ${start.y} C${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${end.x} ${end.y}`;
  const bodyPath = tubeBodyPath(start, control1, control2, end, d1 / 2, d2 / 2);

  setAttrs("bePipeShadow1", { d: bodyPath, fill: "#006b68", stroke: "none", opacity: 0.20 });
  setAttrs("bePipeShadow2", { opacity: 0 });
  setAttrs("bePipeLine", { d: fullPath, "stroke-width": 4, opacity: 0.55 });
  setAttrs("bePoint1", { cx: x1, cy: cy1 });
  setAttrs("bePoint2", { cx: x2, cy: cy2 });
  const pScale = p => clamp(8 + Math.abs(p) / 300000 * 12, 8, 22);
  setAttrs("bePoint1", { cx: x1, cy: cy1, r: pScale(P1) });
  setAttrs("bePoint2", { cx: x2, cy: cy2, r: pScale(P2) });
  setAttrs("bePoint1Label", { x: x1 - 32, y: baseline + 30 });
  setAttrs("bePoint2Label", { x: x2 - 32, y: baseline + 30 });
  setAttrs("beP1VisualLabel", { x: x1 - 38, y: cy1 + d1 / 2 + 18 });
  setAttrs("beP2VisualLabel", { x: x2 - 38, y: cy2 + d2 / 2 + 18 });
  const p1Label = document.getElementById("beP1VisualLabel");
  const p2Label = document.getElementById("beP2VisualLabel");
  if (p1Label) p1Label.textContent = `P1=${Math.round(P1 / 1000)} kPa`;
  if (p2Label) p2Label.textContent = `P2=${Math.round(P2 / 1000)} kPa`;
  setAttrs("beY1Guide", { x1, x2: x1, y1: cy1, y2: baseline });
  setAttrs("beY2Guide", { x1: x2, x2, y1: cy2, y2: baseline });
  setAttrs("beY1Label", { x: x1 + 12, y: (cy1 + baseline) / 2 });
  setAttrs("beY2Label", { x: x2 + 12, y: (cy2 + baseline) / 2 });

  const arrow1Length = 55 + Math.min(v1, 12) * 12;
  const arrow2Length = 55 + Math.min(v2, 12) * 12;
  const a1Y = cy1 - d1 / 2 - 32;
  const a2Y = cy2 - d2 / 2 - 32;
  setAttrs("beArrow1", { x1: x1 - 15, y1: a1Y, x2: x1 - 15 + arrow1Length, y2: a1Y, "stroke-width": 3 + Math.min(v1, 12) * 0.35 });
  setAttrs("beArrow2", { x1: x2 - 80, y1: a2Y, x2: x2 - 80 + arrow2Length, y2: a2Y, "stroke-width": 3 + Math.min(v2, 12) * 0.35 });
  setAttrs("beV1Label", { x: x1 - 18, y: a1Y - 14 });
  setAttrs("beV2Label", { x: x2 - 82, y: a2Y - 14 });

  const visualVolume = 4.2;
  const packetHeight1 = clamp(d1 * 0.68, 30, 82);
  const packetHeight2 = clamp(d2 * 0.68, 30, 82);
  const packetLength1 = clamp(visualVolume / A1, 36, 170);
  const packetLength2 = clamp(visualVolume / A2, 36, 170);
  packet.setAttribute("x", 0);
  packet.setAttribute("y", 0);
  packet.setAttribute("width", packetLength1);
  packet.setAttribute("height", packetHeight1);
  if (svg) {
    const scaleX = packetLength2 / packetLength1;
    const scaleY = packetHeight2 / packetHeight1;
    svg.style.setProperty("--be-packet-scale-x", `${scaleX}`);
    svg.style.setProperty("--be-packet-scale-y", `${scaleY}`);
    svg.style.setProperty("--be-packet-mid-scale-x", `${1 + (scaleX - 1) * 0.45}`);
    svg.style.setProperty("--be-packet-mid-scale-y", `${1 + (scaleY - 1) * 0.45}`);
    packet.style.offsetPath = `path('${fullPath}')`;
    svg.classList.toggle("is-paused", bernoulliAnimationPaused);
  }
}

function updateBernoulliMessage(P2, total1, total2) {
  const message = document.getElementById("beMessage");
  const difference = Math.abs(total1 - total2);

  if (P2 < 0) {
    message.textContent = "หมายเหตุ: ค่า P₂ ติดลบ แปลว่าชุดค่าที่กำหนดอาจไม่เหมาะกับสถานการณ์จริง แต่ยังแสดงความสัมพันธ์ทางคณิตศาสตร์ของสมการแบร์นูลลีได้";
    message.style.background = "#fff7ed";
    message.style.borderColor = "#fdba74";
    message.style.color = "#c2410c";
  } else if (difference < 1e-6) {
    message.textContent = "ผลรวมพลังงานต่อปริมาตรของทั้งสองจุดเท่ากัน ตามสมการแบร์นูลลี";
    message.style.background = "#ecfdf5";
    message.style.borderColor = "#6ee7b7";
    message.style.color = "#047857";
  } else {
    message.textContent = "ผลรวมทั้งสองจุดควรเท่ากัน หากไม่มีการสูญเสียพลังงาน";
    message.style.background = "#eff6ff";
    message.style.borderColor = "#93c5fd";
    message.style.color = "#1d4ed8";
  }
}

function resetBernoulliEnergy() {
  document.getElementById("beA1").value = 0.080;
  document.getElementById("beA2").value = 0.040;
  document.getElementById("beV1").value = 3.00;
  document.getElementById("beY1").value = 1.00;
  document.getElementById("beY2").value = 2.00;
  document.getElementById("beP1").value = 200000;
  document.getElementById("beRho").value = 1000;

  updateBernoulliEnergy();
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("beA1")) {
    updateBernoulliEnergy();
  }
});
