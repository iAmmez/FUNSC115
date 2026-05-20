function w6Num(id, fallback = 0) {
  const el = document.getElementById(id);
  if (!el) return fallback;
  const value = Number(el.value);
  return Number.isFinite(value) ? value : fallback;
}
function w6Set(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
const w6MathQueue = new Set();
let w6MathTimer = null;
function w6SetMath(id, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html;
  w6MathQueue.add(el);
  if (w6MathTimer) return;
  w6MathTimer = setTimeout(() => {
    const targets = Array.from(w6MathQueue);
    w6MathQueue.clear();
    w6MathTimer = null;
    targets.forEach(target => renderMath(target));
  }, 120);
}
function w6Attr(id, attrs) { const el = document.getElementById(id); if (!el) return; Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v)); }
function w6Clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function w6RevealSteps(id) { const el = document.getElementById(id); if (el) el.hidden = !el.hidden; }
function w6ShowPreview(btn, text) { document.querySelectorAll('.preview-cards .option-btn').forEach(b => b.classList.remove('correct')); btn.classList.add('correct'); w6Set('w6PreviewFeedback', text); }

let w6GravityAnim = null;
let w6GravityProgress = 0;

function w6GravityValues() {
  return {
    m: w6Num('w6Mass', 2),
    g: w6Num('w6G', 9.8),
    yi: w6Num('w6Yi', 1.4),
    yf: w6Num('w6Yf', 0.05),
  };
}

function w6GravityYToPix(y) {
  return 350 - w6Clamp(y, 0, 5) / 5 * 270;
}

function w6StopGravityAnimation() {
  if (w6GravityAnim) cancelAnimationFrame(w6GravityAnim);
  w6GravityAnim = null;
  w6Set('w6GravityPlayBtn', 'เล่น animation');
}

function w6DrawGravityFrame(progress) {
  const { m, g, yi, yf } = w6GravityValues();
  const p = w6Clamp(progress, 0, 1);
  const yNow = yi + (yf - yi) * p;
  const yiPix = w6GravityYToPix(yi), yfPix = w6GravityYToPix(yf), yNowPix = w6GravityYToPix(yNow);
  const weight = m * g, Ugi = m * g * yi, Ugf = m * g * yf, UgNow = m * g * yNow, WNow = m * g * (yi - yNow);
  const totalEnergy = Math.max(Ugi, Ugf, 1);
  const KNow = Math.max(totalEnergy - UgNow, 0);
  const arrowLen = w6Clamp(35 + weight * 1.8, 45, 180);
  const labelOffset = yNowPix > 260 ? -96 : 0;

  w6Attr('w6YiGuide', { y1: yiPix, y2: yiPix });
  w6Attr('w6YfGuide', { y1: yfPix, y2: yfPix });
  w6Attr('w6YNowGuide', { y1: yNowPix, y2: yNowPix });
  w6Attr('w6GravityPath', { y1: yiPix, y2: yfPix });
  w6Attr('w6GravityObj', { cy: yNowPix });
  w6Attr('w6GravityObjLabel', { y: yNowPix - 8 + labelOffset });
  w6Attr('w6UgLiveLabel', { y: yNowPix + 19 + labelOffset });
  w6Attr('w6HeightLiveLabel', { y: yNowPix + 45 + labelOffset });
  w6Attr('w6KeLiveLabel', { y: yNowPix + 70 + labelOffset });
  w6Attr('w6WeightArrow', { x1: 470, y1: yNowPix, x2: 470, y2: yNowPix + arrowLen });
  w6Attr('w6WeightLabel', { y: yNowPix + 50 + labelOffset });
  w6Attr('w6DispArrow', { x1: 600, y1: yiPix, x2: 600, y2: yfPix });
  w6Attr('w6DispLabel', { y: (yiPix + yfPix) / 2 });

  w6Set('w6UgLiveLabel', `PEg = ${UgNow.toFixed(2)} J`);
  w6Set('w6HeightLiveLabel', `y = ${yNow.toFixed(2)} m`);
  w6Set('w6KeLiveLabel', `KE = ${KNow.toFixed(2)} J`);
  w6SetMath('w6GravityCurrentEnergy', `\\(PE_g=${UgNow.toFixed(2)}\\ \\mathrm{J}\\)`);
  w6SetMath('w6GravityCurrentKinetic', `\\(KE=${KNow.toFixed(2)}\\ \\mathrm{J}\\)`);
  w6SetMath('w6GravityTotalEnergy', `\\(E=${totalEnergy.toFixed(2)}\\ \\mathrm{J}\\)`);
  w6Set('w6GravityCurrentWork', `งานจากน้ำหนักถึงขณะนี้ = ${WNow.toFixed(2)} J`);
  w6Set('w6UgLiveBarText', `${UgNow.toFixed(2)} J`);
  w6Set('w6KeLiveBarText', `${KNow.toFixed(2)} J`);
  w6Set('w6TotalEnergyText', `${totalEnergy.toFixed(2)} J`);
  w6Set('w6GravityProgressVal', Math.round(p * 100).toString());

  const progressSlider = document.getElementById('w6GravityProgress');
  if (progressSlider) progressSlider.value = String(Math.round(p * 100));
  const liveBar = document.getElementById('w6UgLiveBar');
  if (liveBar) liveBar.style.height = `${w6Clamp(UgNow / totalEnergy * 100, 0, 100)}%`;
  const kineticBar = document.getElementById('w6KeLiveBar');
  if (kineticBar) kineticBar.style.height = `${w6Clamp(KNow / totalEnergy * 100, 0, 100)}%`;
  const totalBar = document.getElementById('w6TotalEnergyBar');
  if (totalBar) totalBar.style.height = '100%';
}

function w6SetGravityProgress(progress) {
  w6StopGravityAnimation();
  w6GravityProgress = w6Clamp(progress, 0, 1);
  w6DrawGravityFrame(w6GravityProgress);
}

function w6ResetGravityAnimation() {
  w6SetGravityProgress(0);
}

function w6PlayGravityAnimation() {
  if (w6GravityAnim) {
    w6StopGravityAnimation();
    return;
  }
  const duration = 2600;
  const startProgress = w6GravityProgress >= 1 ? 0 : w6GravityProgress;
  const startTime = performance.now() - startProgress * duration;
  w6Set('w6GravityPlayBtn', 'หยุด');

  const step = now => {
    w6GravityProgress = w6Clamp((now - startTime) / duration, 0, 1);
    w6DrawGravityFrame(w6GravityProgress);
    if (w6GravityProgress < 1) {
      w6GravityAnim = requestAnimationFrame(step);
    } else {
      w6GravityAnim = null;
      w6Set('w6GravityPlayBtn', 'เล่นอีกครั้ง');
    }
  };
  w6GravityAnim = requestAnimationFrame(step);
}

function updateW6Gravity() {
  w6StopGravityAnimation();
  w6GravityProgress = 0;
  const m = w6Num('w6Mass',2), g = w6Num('w6G',9.8), yi = w6Num('w6Yi',1.4), yf = w6Num('w6Yf',0.05);
  w6Set('w6MassVal', m.toFixed(1)); w6Set('w6GVal', g.toFixed(1)); w6Set('w6YiVal', yi.toFixed(2)); w6Set('w6YfVal', yf.toFixed(2));
  const weight = m*g;
  const Wg = m*g*(yi-yf), Ugi = m*g*yi, Ugf = m*g*yf, dU = Ugf-Ugi;
  w6SetMath('w6GravityFeedback', `\\[ W=mg=${weight.toFixed(2)}\\,\\mathrm{N},\\quad W_g=mg(y_0-y)=${Wg.toFixed(2)}\\,\\mathrm{J},\\quad \\Delta PE_g=PE_{g}-PE_{g,0}=${dU.toFixed(2)}\\,\\mathrm{J}\\]`);
  w6DrawGravityFrame(0);
  const maxU = Math.max(Ugi, Ugf, Math.abs(Wg), 1);
  const h = v => `${w6Clamp(Math.abs(v)/maxU*100, 3, 100)}%`;
  const setBar = (id, val) => { const el=document.getElementById(id); if(el) el.style.height=h(val); };
  setBar('w6UgiBar', Ugi); setBar('w6UgfBar', Ugf); setBar('w6WgBar', Wg);
  w6Set('w6UgiText', `${Ugi.toFixed(2)} J`); w6Set('w6UgfText', `${Ugf.toFixed(2)} J`); w6Set('w6WgText', `${Wg.toFixed(2)} J`);
  renderMath(document.getElementById('gravity'));
}

function springPath(xEnd) {
  const startX=155, y=198, amp=22, coils=10;
  const endX=xEnd;
  let d=`M${startX},${y}`;
  const len=endX-startX, step=len/(coils*2);
  for(let i=1;i<=coils*2;i++) d += ` L${startX+i*step},${y + (i%2? -amp: amp)}`;
  d += ` L${endX},${y}`;
  return d;
}

function updateW6Spring() {
  const k=w6Num('w6K',200), x=w6Num('w6X',0.1), xi=w6Num('w6Xi',0), xf=w6Num('w6Xf',0.1);
  w6Set('w6KVal', k.toFixed(0)); w6Set('w6XVal', x.toFixed(2)); w6Set('w6XiVal', xi.toFixed(2)); w6Set('w6XfVal', xf.toFixed(2));
  const scale=420, zero=460, blockCenter=zero + x*scale, blockX=blockCenter-45;
  w6Attr('w6SpringBlock', {x:blockX});
  w6Attr('w6SpringPath', {d:springPath(blockX)});
  const Fs=-k*x;
  const dir = Fs>=0 ? 1 : -1;
  const len = w6Clamp(Math.abs(Fs)*2.5, 25, 180);
  const ax1=blockCenter, ax2=blockCenter+dir*len;
  w6Attr('w6SpringForceArrow', {x1:ax1, y1:155, x2:ax2, y2:155});
  w6Attr('w6SpringForceLabel', {x:(ax1+ax2)/2-15});
  w6Attr('w6SpringXArrow', {x1:zero, y1:100, x2:blockCenter, y2:100});
  w6Attr('w6SpringXLabel', {x:(zero+blockCenter)/2});
  const Us=0.5*k*x*x;
  w6SetMath('w6SpringFeedback', `\\[F_s=-k\\Delta x=-(${k.toFixed(0)})(${x.toFixed(2)})=${Fs.toFixed(2)}\\,\\mathrm{N}\\]`);
  updateW6SpringGraph(k, xi, xf);
  const absx=Math.abs(x), UsAbs=0.5*k*absx*absx;
  const maxUs=0.5*k*0.3*0.3;
  [['w6UsBar',Us],['w6UsPlusBar',UsAbs],['w6UsMinusBar',UsAbs]].forEach(([id,val])=>{ const el=document.getElementById(id); if(el) el.style.height=`${w6Clamp(val/maxUs*100,3,100)}%`; });
  w6Set('w6UsText', `${Us.toFixed(3)} J`); w6Set('w6UsPlusText', `${UsAbs.toFixed(3)} J`); w6Set('w6UsMinusText', `${UsAbs.toFixed(3)} J`);
  renderMath(document.getElementById('spring'));
}
function updateW6SpringGraph(k, xi, xf) {
  const forceLimit = 150;
  const xPix = x => 460 + x/0.3*330;
  const fPix = F => 220 - w6Clamp(F, -forceLimit, forceLimit)/forceLimit*145;
  const yLeft=fPix(-k*(-0.3)), yRight=fPix(-k*(0.3));
  w6Attr('w6SpringGraphLine',{x1:xPix(-0.3),y1:yLeft,x2:xPix(0.3),y2:yRight});
  const p1=[xPix(xi),220], p2=[xPix(xi),fPix(-k*xi)], p3=[xPix(xf),fPix(-k*xf)], p4=[xPix(xf),220];
  w6Attr('w6SpringArea',{points:[p1,p2,p3,p4].map(p=>p.join(',')).join(' ')});
  w6Attr('w6SpringXiLine',{x1:xPix(xi),x2:xPix(xi)}); w6Attr('w6SpringXfLine',{x1:xPix(xf),x2:xPix(xf)});
  w6Attr('w6SpringXiLabel',{x:xPix(xi)-14}); w6Attr('w6SpringXfLabel',{x:xPix(xf)-14});
  w6Set('w6SpringXiLabel', `x0=${xi.toFixed(2)}`);
  w6Set('w6SpringXfLabel', `x=${xf.toFixed(2)}`);
  const Ws=0.5*k*xi*xi-0.5*k*xf*xf, dUs= -Ws;
  w6SetMath('w6SpringWorkFeedback', `\\[W_s=\\frac12kx_0^2-\\frac12kx^2=${Ws.toFixed(2)}\\,\\mathrm{J}\\]`);
}

let w6SpringEnergyAnim = null;
let w6SpringEnergyProgress = 0;

function w6SpringEnergyValues() {
  return {
    m: w6Num('w6SpringMass', 1),
    k: w6Num('w6SpringEnergyK', 200),
    A: w6Num('w6SpringAmp', 0.2),
  };
}

function w6StopSpringEnergyAnimation() {
  if (w6SpringEnergyAnim) cancelAnimationFrame(w6SpringEnergyAnim);
  w6SpringEnergyAnim = null;
  w6Set('w6SpringEnergyPlayBtn', 'เล่น animation');
}

function w6DrawSpringEnergyFrame(progress) {
  const { m, k, A } = w6SpringEnergyValues();
  const p = w6Clamp(progress, 0, 1);
  const theta = 2 * Math.PI * p;
  const x = A * Math.cos(theta);
  const E = 0.5 * k * A * A;
  const Us = 0.5 * k * x * x;
  const K = Math.max(E - Us, 0);
  const speed = Math.sqrt(2 * K / Math.max(m, 0.001));
  const scale = 280 / Math.max(A, 0.01);
  const zero = 460;
  const blockCenter = zero + x * scale;
  const blockX = blockCenter - 45;
  const arrowEnd = zero + x * scale;
  const xLabelX = x >= 0 ? (zero + arrowEnd) / 2 - 45 : (arrowEnd + zero) / 2 - 45;
  const energyPct = value => `${w6Clamp(value / Math.max(E, 1) * 100, 0, 100)}%`;

  w6Attr('w6SpringEnergyBlock', { x: blockX });
  w6Attr('w6SpringEnergyPath', { d: springPath(blockX) });
  w6Attr('w6SpringEnergyXArrow', { x1: zero, x2: arrowEnd });
  w6Attr('w6SpringEnergyXLabel', { x: xLabelX });
  w6Set('w6SpringEnergyXLabel', `x = ${x.toFixed(2)} m`);
  w6Set('w6SpringEnergyUsLabel', `PEs = ${Us.toFixed(2)} J`);
  w6Set('w6SpringEnergyKLabel', `KE = ${K.toFixed(2)} J`);

  const usBar = document.getElementById('w6SpringUsBar');
  if (usBar) usBar.style.height = energyPct(Us);
  const kBar = document.getElementById('w6SpringKBar');
  if (kBar) kBar.style.height = energyPct(K);
  const totalBar = document.getElementById('w6SpringTotalBar');
  if (totalBar) totalBar.style.height = '100%';

  w6Set('w6SpringUsText', `${Us.toFixed(2)} J`);
  w6Set('w6SpringKText', `${K.toFixed(2)} J`);
  w6Set('w6SpringTotalText', `${E.toFixed(2)} J`);
  w6SetMath('w6SpringEnergyCurrentUs', `\\(PE_s=\\frac12kx^2=${Us.toFixed(2)}\\ \\mathrm{J}\\)`);
  w6SetMath('w6SpringEnergyCurrentK', `\\(KE=${K.toFixed(2)}\\ \\mathrm{J}\\)`);
  w6SetMath('w6SpringEnergyTotal', `\\(E=PE_s+KE=${E.toFixed(2)}\\ \\mathrm{J}\\)`);
  w6SetMath('w6SpringEnergySpeed', `\\(v=${speed.toFixed(2)}\\ \\mathrm{m/s}\\)`);
  w6Set('w6SpringEnergyProgressVal', Math.round(p * 100).toString());
  const progressSlider = document.getElementById('w6SpringEnergyProgress');
  if (progressSlider) progressSlider.value = String(Math.round(p * 100));
}

function w6SetSpringEnergyProgress(progress) {
  w6StopSpringEnergyAnimation();
  w6SpringEnergyProgress = w6Clamp(progress, 0, 1);
  w6DrawSpringEnergyFrame(w6SpringEnergyProgress);
}

function w6ResetSpringEnergyAnimation() {
  w6SetSpringEnergyProgress(0);
}

function w6PlaySpringEnergyAnimation() {
  if (w6SpringEnergyAnim) {
    w6StopSpringEnergyAnimation();
    return;
  }
  const duration = 3400;
  const startProgress = w6SpringEnergyProgress >= 1 ? 0 : w6SpringEnergyProgress;
  const startTime = performance.now() - startProgress * duration;
  w6Set('w6SpringEnergyPlayBtn', 'หยุด');

  const step = now => {
    w6SpringEnergyProgress = w6Clamp((now - startTime) / duration, 0, 1);
    w6DrawSpringEnergyFrame(w6SpringEnergyProgress);
    if (w6SpringEnergyProgress < 1) {
      w6SpringEnergyAnim = requestAnimationFrame(step);
    } else {
      w6SpringEnergyAnim = null;
      w6Set('w6SpringEnergyPlayBtn', 'เล่นอีกครั้ง');
    }
  };
  w6SpringEnergyAnim = requestAnimationFrame(step);
}

function updateW6SpringEnergy() {
  w6StopSpringEnergyAnimation();
  w6SpringEnergyProgress = 0;
  const { m, k, A } = w6SpringEnergyValues();
  w6Set('w6SpringMassVal', m.toFixed(2));
  w6Set('w6SpringEnergyKVal', k.toFixed(0));
  w6Set('w6SpringAmpVal', A.toFixed(2));
  w6DrawSpringEnergyFrame(0);
}

let w6FrictionDir=1;
function setW6FrictionDirection(dir){ w6FrictionDir=dir; updateW6FrictionDirection(); }
function updateW6FrictionDirection(){
  const motionStart = w6FrictionDir > 0 ? 520 : 420, motionEnd = w6FrictionDir > 0 ? 660 : 280;
  const fricStart = w6FrictionDir > 0 ? 420 : 520, fricEnd = w6FrictionDir > 0 ? 280 : 660;
  w6Attr('w6MotionArrow',{x1:motionStart,x2:motionEnd}); w6Attr('w6FrictionArrow',{x1:fricStart,x2:fricEnd});
  w6Attr('w6MotionText',{x:(motionStart+motionEnd)/2-40}); w6Attr('w6FrictionText',{x:(fricStart+fricEnd)/2-50});
}
function updateW6Friction(){
  const m=w6Num('w6Fm',1), mu=w6Num('w6Mu',.5), d=w6Num('w6D',8), g=9.8;
  w6Set('w6FmVal',m.toFixed(1)); w6Set('w6MuVal',mu.toFixed(2)); w6Set('w6DVal',d.toFixed(1));
  const N=m*g, fk=mu*N, W=-fk*d;
  w6SetMath('w6FrictionFeedback', `\\[N=mg=${N.toFixed(2)}\\,\\mathrm{N},\\quad f_k=\\mu_kN=${fk.toFixed(2)}\\,\\mathrm{N},\\quad W_f=-f_kd=${W.toFixed(2)}\\,\\mathrm{J}\\]`);
  renderMath(document.getElementById('friction'));
}

const w6PathData = {
  1: { name: 'เส้นทางตรง', d: 'M170,220 L760,100', length: 6.0 },
  2: { name: 'เส้นทางโค้ง', d: 'M170,220 C360,260 530,40 760,100', length: 8.5 },
  3: { name: 'เส้นทางยาวมาก', d: 'M170,220 C220,40 350,300 470,140 C580,-20 690,280 760,100', length: 14.0 },
};
let w6CurrentPath = 1;
let w6PathAnim = null;

function w6StopPathAnimation() {
  if (w6PathAnim) cancelAnimationFrame(w6PathAnim);
  w6PathAnim = null;
  w6Set('w6PathPlayBtn', 'เล่น animation');
}

function w6PathSvgPoint(pathEl, distance) {
  const p = pathEl.getPointAtLength(distance);
  return { x: p.x, y: p.y };
}

function w6DrawPathFrame(progress) {
  const pathEl = document.getElementById('w6PathCurve');
  if (!pathEl || !pathEl.getTotalLength) return;
  const pathProgress = w6Clamp(progress, 0, 1);
  const total = pathEl.getTotalLength();
  const d = pathProgress * total;
  const p = w6PathSvgPoint(pathEl, d);
  const ahead = w6PathSvgPoint(pathEl, Math.min(d + 8, total));
  const back = w6PathSvgPoint(pathEl, Math.max(d - 8, 0));
  const tx = ahead.x - back.x;
  const ty = ahead.y - back.y;
  const len = Math.hypot(tx, ty) || 1;
  const ux = tx / len, uy = ty / len;
  const motionLen = 58;
  const frictionLen = 58;
  const weightLen = 62;

  w6Attr('w6PathObject', { cx: p.x, cy: p.y });
  w6Attr('w6PathWeightArrow', { x1: p.x, y1: p.y, x2: p.x, y2: p.y + weightLen });
  w6Attr('w6PathMotionArrow', { x1: p.x, y1: p.y - 20, x2: p.x + ux * motionLen, y2: p.y - 20 + uy * motionLen });
  w6Attr('w6PathFrictionArrow', { x1: p.x, y1: p.y + 22, x2: p.x - ux * frictionLen, y2: p.y + 22 - uy * frictionLen });
  w6Attr('w6PathWeightText', { x: p.x + 12, y: p.y + weightLen + 4 });
  w6Attr('w6PathMotionText', { x: p.x + ux * motionLen + 8, y: p.y - 25 + uy * motionLen });
  w6Attr('w6PathFrictionText', { x: p.x - ux * frictionLen - 92, y: p.y + 30 - uy * frictionLen });
  w6UpdatePathBars(pathProgress);
}

function w6SetSignedBar(id, value, maxValue) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.width = `${w6Clamp(Math.abs(value) / Math.max(maxValue, 1) * 50, 0, 50)}%`;
}

function w6SetPositiveBar(id, value, maxValue) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.width = `${w6Clamp(value / Math.max(maxValue, 1) * 100, 0, 100)}%`;
}

function w6PathWorkValues(progress = 1) {
  const data = w6PathData[w6CurrentPath];
  const m = w6Num('w6PathMass', 1);
  const mu = w6Num('w6PathMu', 0.3);
  const g = 9.8;
  const dh = 2.0;
  const p = w6Clamp(progress, 0, 1);
  const normal = m * g;
  const fk = mu * normal;
  const Wg = -m * g * dh * p;
  const Wf = -fk * data.length * p;
  const Wnet = Wg + Wf;
  const Ug = m * g * dh * p;
  const WgFinal = -m * g * dh;
  const WfFinal = -fk * data.length;
  const WnetFinal = WgFinal + WfFinal;
  const UgFinal = m * g * dh;
  const E0 = Math.max(UgFinal + Math.abs(WfFinal), 1);
  const mechanicalE = Math.max(E0 + Wf, 0);
  const K = Math.max(mechanicalE - Ug, 0);
  const v0 = Math.sqrt(2 * E0 / Math.max(m, 0.001));
  const barMax = Math.max(Math.abs(WgFinal), Math.abs(WfFinal), Math.abs(WnetFinal), -WgFinal, Math.abs(WfFinal), 1);

  return { data, m, mu, g, dh, Wg, Wf, Wnet, Ug, UgFinal, K, v0, E0, mechanicalE, WgFinal, WfFinal, WnetFinal, barMax };
}

function w6UpdatePathBars(progress = 1) {
  const { data, dh, Wf, Ug, UgFinal, K, mechanicalE, E0, WfFinal, barMax } = w6PathWorkValues(progress);
  const pct = Math.round(w6Clamp(progress, 0, 1) * 100);

  w6SetSignedBar('w6PathWfBar', Wf, barMax);
  w6SetPositiveBar('w6PathKineticBar', K, E0);
  w6SetPositiveBar('w6PathUgBar', Ug, E0);
  w6SetPositiveBar('w6PathMechanicalBar', mechanicalE, E0);
  w6Set('w6PathWfText', `${Wf.toFixed(2)} / ${WfFinal.toFixed(2)} J`);
  w6Set('w6PathKineticText', `${K.toFixed(2)} / 0 J`);
  w6Set('w6PathUgText', `${Ug.toFixed(2)} / ${UgFinal.toFixed(2)} J`);
  w6Set('w6PathMechanicalText', `${mechanicalE.toFixed(2)} / ${E0.toFixed(2)} J`);
  w6Set('w6PathInfo', `${data.name}: ℓ ≈ ${data.length.toFixed(1)} m, Δy = ${dh.toFixed(1)} m`);
}

function updateW6Path() {
  const { data, m, mu, dh, WfFinal, WnetFinal, UgFinal, v0 } = w6PathWorkValues(1);
  const deltaUg = UgFinal;
  const deltaE = WfFinal;
  const deltaK = deltaE - deltaUg;
  w6Set('w6PathMassVal', m.toFixed(1));
  w6Set('w6PathMuVal', mu.toFixed(2));
  w6Set('w6PathInfo', `${data.name}: d ≈ ${data.length.toFixed(1)} m, Δh = ${dh.toFixed(1)} m, v0 ≈ ${v0.toFixed(2)} m/s`);
  w6UpdatePathBars(0);
  w6SetMath('w6PathGravityWork', `\\(\\Delta PE_g=${deltaUg.toFixed(2)}\\ \\mathrm{J}\\)<br>\\(\\Delta KE=${deltaK.toFixed(2)}\\ \\mathrm{J}\\)<br>\\(\\Delta E=${deltaE.toFixed(2)}\\ \\mathrm{J}\\)`);
  w6SetMath('w6PathFrictionWork', `\\(W_f=${WfFinal.toFixed(2)}\\ \\mathrm{J}\\)`);
  w6SetMath('w6PathFeedback', `\\[v_0\\approx ${v0.toFixed(2)}\\,\\mathrm{m/s},\\quad W_{net}=W_g+W_f=${WnetFinal.toFixed(2)}\\,\\mathrm{J}\\quad\\text{และ }E=PE_g+KE\\text{ ลดลงตามงานของแรงเสียดทาน}\\]`);
}

function setW6Path(n){
  w6StopPathAnimation();
  w6CurrentPath = n;
  const data = w6PathData[n];
  w6Attr('w6PathCurve',{d:data.d});
  document.querySelectorAll('[id^="w6PathBtn"]').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`w6PathBtn${n}`);
  if (activeBtn) activeBtn.classList.add('active');
  updateW6Path();
  w6DrawPathFrame(0);
}

function w6PlayPathAnimation() {
  if (w6PathAnim) {
    w6StopPathAnimation();
    return;
  }
  const duration = 3200;
  const start = performance.now();
  w6Set('w6PathPlayBtn', 'หยุด');
  const step = now => {
    const p = w6Clamp((now - start) / duration, 0, 1);
    w6DrawPathFrame(p);
    if (p < 1) {
      w6PathAnim = requestAnimationFrame(step);
    } else {
      w6PathAnim = null;
      w6Set('w6PathPlayBtn', 'เล่นอีกครั้ง');
    }
  };
  w6PathAnim = requestAnimationFrame(step);
}

function updateW6EnergyBars(){
  const y=w6Num('w6EnergyY',3), H=w6Num('w6EnergyH',5), g=9.8, m=1;
  const yy=w6Clamp(y,0,H); w6Set('w6EnergyYVal', y.toFixed(1)); w6Set('w6EnergyHVal', H.toFixed(1));
  const E=m*g*H, U=m*g*yy, K=E-U;
  [['w6EgBar',U],['w6KBar',K],['w6EBar',E]].forEach(([id,val])=>{ const el=document.getElementById(id); if(el) el.style.height=`${w6Clamp(val/E*100,3,100)}%`; });
  w6Set('w6EgText',`${U.toFixed(1)} J`); w6Set('w6KText',`${K.toFixed(1)} J`); w6Set('w6EText',`${E.toFixed(1)} J`);
}
function setW6External(type){
  const txt={none:'\\[W_{ext}=0 \\Rightarrow \\Delta E=0 \\Rightarrow E_i=E_f\\]',friction:'\\[W_{ext}<0 \\Rightarrow \\Delta E<0 \\quad \\text{พลังงานกลรวมลดลง}\\]',push:'\\[W_{ext}>0 \\Rightarrow \\Delta E>0 \\quad \\text{พลังงานกลรวมเพิ่มขึ้น}\\]'};
  w6Set('w6ExternalFeedback',txt[type]); renderMath(document.getElementById('work-energy-system'));
}
function updateW6Accounting(){
  const Ki=w6Num('w6AccKi',20), Ui=w6Num('w6AccUi',15), W=w6Num('w6AccW',-5), Ef=Ki+Ui+W;
  w6SetMath('w6AccountingFeedback',`\\[E_f=K_f+U_f=K_i+U_i+W_{ext}=${Ki.toFixed(1)}+${Ui.toFixed(1)}+(${W.toFixed(1)})=${Ef.toFixed(1)}\\,\\mathrm{J}\\]`);
  renderMath(document.getElementById('work-energy-system'));
}
function updateW6FallingBall(){
  const hi=w6Num('w6BallHi',5), hf=w6Num('w6BallHf',2), m=w6Num('w6BallMass',1), g=9.8;
  w6Set('w6BallHiVal',hi.toFixed(1)); w6Set('w6BallHfVal',hf.toFixed(1)); w6Set('w6BallMassVal',m.toFixed(1));
  const dh=Math.max(0,hi-hf), v=Math.sqrt(2*g*dh);
  w6SetMath('w6FallingBallFeedback',`\\[mgh_i=\\frac12mv_f^2+mgh_f \\Rightarrow v_f=\\sqrt{2g(h_i-h_f)}=${v.toFixed(2)}\\,\\mathrm{m/s}\\]`);
  renderMath(document.getElementById('examples'));
}
function setW6BoxMu(mu){ const el=document.getElementById('w6BoxMu'); if(el) el.value=mu; updateW6BlockSpring(); }
function updateW6BlockSpring(){
  const m=w6Num('w6BoxM',.8), v=w6Num('w6BoxV',1.2), k=w6Num('w6BoxK',50), mu=w6Num('w6BoxMu',0), g=9.8;
  w6Set('w6BoxMVal',m.toFixed(2)); w6Set('w6BoxVVal',v.toFixed(2)); w6Set('w6BoxKVal',k.toFixed(0)); w6Set('w6BoxMuVal',mu.toFixed(2));
  let x;
  if(mu===0){ x=v*Math.sqrt(m/k); }
  else { const a=.5*k, b=mu*m*g, c=-.5*m*v*v; x=(-b+Math.sqrt(b*b-4*a*c))/(2*a); }
  const compression=w6Clamp(x,0,.8), blockX=690-compression*380;
  w6Attr('w6BoxBlock',{x:blockX});
  w6Attr('w6BoxSpring',{d:springPath(blockX+80).replaceAll('198','192')});
  const noFric=v*Math.sqrt(m/k);
  w6SetMath('w6BlockSpringFeedback',`\\[x_{max}=${x.toFixed(3)}\\,\\mathrm{m}\\quad (\\mu_k=${mu.toFixed(2)})\\qquad \\text{ถ้าไม่มีเสียดทาน }x=${noFric.toFixed(3)}\\,\\mathrm{m}\\]`);
  renderMath(document.getElementById('examples'));
}

function w6Init(){ updateW6Gravity(); updateW6Spring(); updateW6SpringEnergy(); updateW6FrictionDirection(); updateW6Friction(); setW6Path(1); updateW6EnergyBars(); setW6External('none'); updateW6Accounting(); updateW6FallingBall(); updateW6BlockSpring(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', w6Init); else w6Init();
