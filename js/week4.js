// Week 4 interactive helpers
let w4CircularTimer = null;

function w4Num(id, fallback = 0) {
    const value = Number(document.getElementById(id)?.value);
    return Number.isFinite(value) ? value : fallback;
}

function w4SetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function w4SetHTML(id, html) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = html;
    renderMath(el);
}

function w4Attr(id, name, value) {
    const el = document.getElementById(id);
    if (el) el.setAttribute(name, value);
}

function w4Rad(deg) { return Number(deg) * Math.PI / 180; }

function w4Point(cx, cy, x, y, scale = 60) { return { X: cx + x * scale, Y: cy - y * scale }; }

function w4Arrow(id, x1, y1, x2, y2, visible = true) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('x1', x1);
    el.setAttribute('y1', y1);
    el.setAttribute('x2', x2);
    el.setAttribute('y2', y2);
    el.style.display = visible ? '' : 'none';
}

function w4FormatVec(x, y, unit = '') {
    const sx = Number(x).toFixed(2);
    const sy = Number(y).toFixed(2);
    return `${sx}\\hat{i}${y >= 0 ? '+' : ''}${sy}\\hat{j}${unit ? `\\ ${unit}` : ''}`;
}

function updateW4Circular() {
  const R = w4Num('w4R', 2), omega = w4Num('w4Omega', 1.5), t = w4Num('w4Time', 0);
  w4SetText('w4RVal', R.toFixed(1));
  w4SetText('w4OmegaVal', omega.toFixed(1));
  w4SetText('w4TimeVal', t.toFixed(1));
  const cx = 460, cy = 280, scale = 60, theta = omega * t;
  const x = R * Math.cos(theta), y = R * Math.sin(theta);
  const vx = -R * omega * Math.sin(theta), vy = R * omega * Math.cos(theta);
  const ax = -R * omega * omega * Math.cos(theta), ay = -R * omega * omega * Math.sin(theta);
  const p = w4Point(cx, cy, x, y, scale);
  w4Attr('w4CirclePath', 'r', R * scale);
  w4Attr('w4Particle', 'cx', p.X); w4Attr('w4Particle', 'cy', p.Y);
  w4Attr('w4CircularLabel', 'x', p.X + 18); w4Attr('w4CircularLabel', 'y', p.Y - 18);
  const showR = document.getElementById('w4ShowR')?.checked ?? true;
  const showV = document.getElementById('w4ShowV')?.checked ?? true;
  const showA = document.getElementById('w4ShowA')?.checked ?? true;
  w4Arrow('w4RLine', cx, cy, p.X, p.Y, showR);
  w4Arrow('w4VLine', p.X, p.Y, p.X + vx * 35, p.Y - vy * 35, showV);
  w4Arrow('w4ALine', p.X, p.Y, p.X + ax * 12, p.Y - ay * 12, showA);
  w4SetHTML('w4CircularFeedback', `\\[\\theta=\\omega t=${omega.toFixed(2)}(${t.toFixed(2)})=${theta.toFixed(2)}\\ \\mathrm{rad}\\]
  \\[v=R\\omega=${R.toFixed(2)}(${omega.toFixed(2)})=${(R*omega).toFixed(2)}\\ \\mathrm{m/s},\\quad a_c=R\\omega^2=${(R*omega*omega).toFixed(2)}\\ \\mathrm{m/s^2}\\]
  \\[\\vec r=${w4FormatVec(x,y,'\\mathrm{m}')},\\quad \\vec v=${w4FormatVec(vx,vy,'\\mathrm{m/s}')},\\quad \\vec a=${w4FormatVec(ax,ay,'\\mathrm{m/s^2}')}\\]`);
}
function toggleW4CircularPlay() {
  const btn = document.getElementById('w4PlayBtn');
  if (w4CircularTimer) {
    clearInterval(w4CircularTimer); w4CircularTimer = null;
    if (btn) btn.textContent = '▶ Play';
    return;
  }
  if (btn) btn.textContent = '⏸ Pause';
  w4CircularTimer = setInterval(() => {
    const slider = document.getElementById('w4Time');
    if (!slider) return;
    let t = Number(slider.value) + 0.05;
    if (t > Number(slider.max)) t = 0;
    slider.value = t;
    updateW4Circular();
  }, 40);
}
function setW4Angle(deg) {
  const input = document.getElementById('w4AngleDeg');
  if (input) input.value = deg;
  updateW4Angle();
}
function updateW4Angle() {
  const deg = w4Num('w4AngleDeg', 90);
  const rad = w4Rad(deg), rev = deg / 360;
  const cx = 260, cy = 170, r = 72;
  const endX = cx + 100*Math.cos(rad), endY = cy - 100*Math.sin(rad);
  w4Attr('w4AngleRay', 'x2', endX); w4Attr('w4AngleRay', 'y2', endY);
  const steps = Math.max(4, Math.ceil(Math.abs(deg) / 8));
  let d = '';
  for (let i=0; i<=steps; i++) {
    const a = rad * i / steps;
    const x = cx + r*Math.cos(a), y = cy - r*Math.sin(a);
    d += `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  w4Attr('w4AngleArc', 'd', d);
  w4SetHTML('w4AngleFeedback', `\\[${deg.toFixed(1)}^\\circ=${rad.toFixed(3)}\\ \\mathrm{rad}=${rev.toFixed(3)}\\ \\mathrm{รอบ}\\]`);
}

function showW4Force(type) {
  const data = {
    weight: ['น้ำหนัก', 'แรงที่ดาวเคราะห์กระทำต่อวัตถุ มีทิศเข้าหาศูนย์กลางของดาวเคราะห์ ใกล้ผิวดาวเคราะห์น้ำหนักจะชี้ลง', '\\vec W=-mg\\hat{j}'],
    normal: ['แรงเชิงฉาก', 'แรงจากผิวสัมผัส ตั้งฉากกับพื้นผิวเสมอ และไม่จำเป็นต้องเท่ากับน้ำหนักทุกกรณี', '\\vec N=N\\hat{n}'],
    tension: ['แรงตึง', 'แรงดึงตามแนวเชือกหรือสายเคเบิล สำหรับเชือกเบาแรงตึงมีขนาดเท่ากันตลอดเส้น', '\\vec T'],
    friction: ['แรงเสียดทาน', 'แรงที่ต้านแนวโน้มการเคลื่อนที่หรือการเคลื่อนที่สัมพัทธ์ระหว่างผิวสัมผัส', 'f_s\\le\\mu_s N,\\quad f_k=\\mu_k N'],
    spring: ['แรงสปริง', 'แรงคืนรูปของสปริง มีทิศตรงข้ามกับการกระจัดจากตำแหน่งสมดุล', '\\vec F_s=-k\\Delta x\\hat{i}'],
    drag: ['แรงต้าน', 'แรงจากของไหลที่ต้านการเคลื่อนที่ มีทิศตรงข้ามกับความเร็ว', '\\vec F_d=-k\\vec v']
  };
  const [name, desc, eq] = data[type] || data.weight;
  w4SetHTML('w4ForceInfo', `<strong>${name}</strong><br>${desc}\\[${eq}\\]`);
}

function initWeek4() {
  updateW4Circular();
  updateW4Angle();
  showW4Force('weight');
  initSpringDemo();
  renderMath(document.body);
}

function drawSpring(startX, endX, y) {
  const coil = document.getElementById('springCoil');
  if (!coil) return;

  const amp = 22;
  const turns = 10;
  const points = [`${startX},${y}`];

  for (let i = 0; i <= turns * 2; i++) {
    const px = startX + ((endX - startX) * i) / (turns * 2);
    const py = i % 2 === 0 ? y - amp : y + amp;
    points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }

  points.push(`${endX},${y}`);
  coil.setAttribute('points', points.join(' '));
}

function updateSpringDemo() {
  const k = w4Num('springK');
  const x = w4Num('springX');
  const equilibriumX = 560;
  const blockX = equilibriumX + x * 180;
  const blockCenterX = blockX + 45;
  const Fs = -k * x;

  w4SetText('springKVal', k.toFixed(0));
  w4SetText('springXVal', x.toFixed(2));
  w4Attr('springBlock', 'x', blockX);
  w4Attr('springBlockLabel', 'x', blockCenterX);
  drawSpring(190, blockX, 130);

  const xVector = document.getElementById('springXVector');
  const xLabel = document.getElementById('springXLabel');
  if (xVector && xLabel) {
    xVector.setAttribute('x1', equilibriumX);
    xVector.setAttribute('x2', blockCenterX);
    xVector.setAttribute('stroke-width', Math.abs(x) < 0.01 ? '0' : '5');
    xLabel.setAttribute('x', (equilibriumX + blockCenterX) / 2);
    xLabel.textContent = x > 0 ? 'Delta x > 0' : x < 0 ? 'Delta x < 0' : 'Delta x = 0';
  }

  const fVector = document.getElementById('springFVector');
  const fLabel = document.getElementById('springFLabel');
  if (fVector && fLabel) {
    fVector.setAttribute('x1', blockCenterX);
    fVector.setAttribute('y1', 75);
    fVector.setAttribute('stroke-width', Math.abs(Fs) < 0.01 ? '0' : '6');
    if (Math.abs(Fs) >= 0.01) {
      const forceLength = Math.min(150, Math.max(35, Math.abs(Fs) * 3));
      fVector.setAttribute('x2', Fs > 0 ? blockCenterX + forceLength : blockCenterX - forceLength);
      fVector.setAttribute('y2', 75);
    }
    fLabel.setAttribute('x', blockCenterX + (Fs > 0 ? 70 : -70));
  }

  w4SetHTML('springDemoFeedback', `\\[\\vec{F_s}=-k \\Delta x=-( ${k.toFixed(0)} )( ${x.toFixed(2)} ) \\hat{i} = ${Fs.toFixed(2)}\\ \\hat{i} \\quad \\mathrm{N}\\]`);
}

function initSpringDemo() {
  const inputs = [document.getElementById('springK'), document.getElementById('springX')].filter(Boolean);
  inputs.forEach(input => input.addEventListener('input', updateSpringDemo));
  if (inputs.length) updateSpringDemo();
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initWeek4 === 'function') initWeek4();
});

function showNewtonOpeningPollExplanation(button) {
  const box = button.nextElementSibling;
  if (!box) return;

  const isHidden = box.style.display === "none" || box.style.display === "";
  box.style.display = isHidden ? "block" : "none";

  button.textContent = isHidden ? "ซ่อนคำอธิบาย" : "💡 อธิบายแนวคิด";

  if (typeof renderMath === "function") {
    renderMath(box);
  }
}

function showEarthOrbitExplanation(button) {
  const box = button.nextElementSibling;
  if (!box) return;

  const isHidden = box.style.display === "none" || box.style.display === "";
  box.style.display = isHidden ? "block" : "none";
  button.textContent = isHidden ? "ซ่อนวิธีทำ" : "💡 แสดงวิธีทำ";

  if (typeof renderMath === "function") {
    renderMath(box);
  } else if (window.MathJax) {
    MathJax.typesetPromise([box]);
  }
}

