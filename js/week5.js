// Week 5: Work and Energy
function w5Num(id, fallback = 0) {
    const el = document.getElementById(id);
    return el ? Number(el.value) : fallback;
}

function w5Txt(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function w5Html(id, value) {
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = value;
    if (window.MathJax?.typesetPromise) MathJax.typesetPromise([el]).catch(() => {});
}

function w5SetAttrs(id, attrs) {
    const el = document.getElementById(id);
    if (!el) return;

    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
}

function w5Clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function w5Grid(groupId, x0, y0, width, height, xTicks = 10, yTicks = 5) {
    const group = document.getElementById(groupId);
    if (!group) return;

    const lines = [];

    for (let i = 0; i <= xTicks; i++) {
        const x = x0 + (width * i) / xTicks;
        lines.push(`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + height}" stroke="#e5e7eb" stroke-width="1"/>`);
    }

    for (let i = 0; i <= yTicks; i++) {
        const y = y0 + (height * i) / yTicks;
        lines.push(`<line x1="${x0}" y1="${y}" x2="${x0 + width}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`);
    }

    group.innerHTML = lines.join('');
}

function w5DotScale(originX, originY, scale) {
    const group = document.getElementById('w5DotScale');
    if (!group) return;

    const marks = [];

    for (let x = -10; x <= 10; x += 2) {
        const px = originX + x * scale;
        marks.push(`<line x1="${px}" y1="${originY - 7}" x2="${px}" y2="${originY + 7}" stroke="#334155" stroke-width="2"/>`);
        if (x !== 0) marks.push(`<text x="${px}" y="${originY + 28}" text-anchor="middle" font-size="14" fill="#334155">${x}</text>`);
    }

    for (let y = -5; y <= 5; y++) {
        const py = originY - y * scale;
        marks.push(`<line x1="${originX - 7}" y1="${py}" x2="${originX + 7}" y2="${py}" stroke="#334155" stroke-width="2"/>`);
        if (y !== 0) marks.push(`<text x="${originX - 16}" y="${py + 5}" text-anchor="end" font-size="14" fill="#334155">${y}</text>`);
    }

    marks.push(
        `<text x="${originX + 10}" y="${originY + 28}" font-size="14" font-weight="700" fill="#111827">0</text>`,
        `<text x="842" y="${originY - 12}" font-size="16" font-weight="800" fill="#111827">x</text>`,
        `<text x="${originX + 14}" y="76" font-size="16" font-weight="800" fill="#111827">y</text>`
    );

    group.innerHTML = marks.join('');
}

function updateW5Derivation() {
    const F = w5Num('w5DerF', 10);
    const m = w5Num('w5DerM', 5);
    const s = w5Num('w5DerS', 4);
    const vi = w5Num('w5DerVi', 2);
    const a = F / m;
    const vf = Math.sqrt(Math.max(0, vi * vi + 2 * a * s));
    const W = F * s;
    const dK = 0.5 * m * (vf * vf - vi * vi);
    const x = 160 + s * 38;

    w5Txt('w5DerFVal', F.toFixed(0));
    w5Txt('w5DerMVal', m.toFixed(0));
    w5Txt('w5DerSVal', s.toFixed(1));
    w5Txt('w5DerViVal', vi.toFixed(1));
    w5SetAttrs('w5DerBlock', { x });
    w5SetAttrs('w5DerBlockLabel', { x: x + 45 });
    w5SetAttrs('w5DerVArrow', { x1: x + 45, x2: x + 45 + Math.min(180, 20 + vf * 10) });
    w5Html('w5DerivationFeedback', `\\[a=F/m=${a.toFixed(2)}\\ \\mathrm{m/s^2},\\quad v_f=\\sqrt{v_i^2+2as}=${vf.toFixed(2)}\\ \\mathrm{m/s}\\]\\[Fs=${W.toFixed(2)}\\ \\mathrm{J},\\quad \\Delta K=${dK.toFixed(2)}\\ \\mathrm{J}\\]`);
}

function updateW5KE() {
    const m = w5Num('w5KeM', 1200);
    const v = w5Num('w5KeV', 10);
    const K = 0.5 * m * v * v;
    const maxK = 0.5 * m * 40 * 40;
    let path = '';

    w5Txt('w5KeMVal', m.toFixed(2));
    w5Txt('w5KeVVal', v.toFixed(1));

    const bar = document.getElementById('w5KeBar');
    if (bar) bar.style.width = `${w5Clamp((K / 960000) * 100, 0, 100)}%`;

    w5Grid('w5KeGrid', 90, 35, 740, 250, 8, 5);

    for (let i = 0; i <= 80; i++) {
        const speed = (40 * i) / 80;
        const energy = 0.5 * m * speed * speed;
        const x = 90 + (740 * speed) / 40;
        const y = 285 - 250 * (energy / maxK);
        path += `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    }

    w5SetAttrs('w5KeCurve', { d: path });
    w5SetAttrs('w5KePoint', { cx: 90 + (740 * v) / 40, cy: 285 - 250 * (K / maxK) });
    w5Html('w5KeFeedback', `\\[KE=\\frac{1}{2}mv^2=\\frac{1}{2}(${m.toFixed(2)})(${v.toFixed(1)})^2=${K.toFixed(0)}\\ \\mathrm{J}\\]`);
}

function updateW5Ex1() {
    const m = w5Num('w5Ex1M', 1000);
    const v1 = w5Num('w5Ex1V1', 10);
    const v2 = w5Num('w5Ex1V2', 20);
    const K1 = 0.5 * m * v1 * v1;
    const K2 = 0.5 * m * v2 * v2;

    w5Html('w5Ex1Feedback', `\\[K_1=${K1.toFixed(1)}\\ \\mathrm{J},\\quad K_2=${K2.toFixed(1)}\\ \\mathrm{J}\\]\\[\\Delta K=K_2-K_1=${(K2 - K1).toFixed(1)}\\ \\mathrm{J}\\]`);
}

function updateW5Work1D() {
    const F = w5Num('w5WorkF', 6.25);
    const s = w5Num('w5WorkS', 10);
    const x2 = 170 + s * 32;

    w5Txt('w5WorkFVal', F.toFixed(2));
    w5Txt('w5WorkSVal', s.toFixed(1));
    w5SetAttrs('w5WorkSLine', { x2 });
    w5SetAttrs('w5WorkSLabel', { x: (170 + x2) / 2 });
    w5SetAttrs('w5WorkBlock', { x: 120 + s * 16 });
    w5Html('w5WorkFeedback', `\\[W=Fs=(${F.toFixed(2)})(${s.toFixed(1)})=${(F * s).toFixed(2)}\\ \\mathrm{J}\\]`);
    updateW5WorkAreaOnly(F, s);
}

function updateW5WorkAreaOnly(F = w5Num('w5WorkF', 6.25), s = w5Num('w5WorkS', 10)) {
    const width = (720 * s) / 20;
    const y = 300 - (240 * F) / 30;

    w5Grid('w5AreaGrid', 90, 60, 720, 240, 10, 6);
    w5SetAttrs('w5AreaRect', { x: 90, y, width, height: 300 - y });
    w5SetAttrs('w5AreaLine', { x1: 90, y1: y, x2: 90 + width, y2: y });
    w5Html('w5AreaFeedback', `\\[\\text{Area}=F\\Delta x=${(F * s).toFixed(2)}\\ \\mathrm{J}\\]`);
}

function updateW5Ex2() {
    const m = w5Num('w5Ex2M', 5);
    const F = w5Num('w5Ex2F', 6.25);
    const s = w5Num('w5Ex2S', 10);
    const vi = w5Num('w5Ex2Vi', 0);
    const W = F * s;
    const Kf = 0.5 * m * vi * vi + W;
    const vf = Math.sqrt(Math.max(0, (2 * Kf) / m));

    w5Html('w5Ex2Feedback', `\\[W=Fs=${W.toFixed(2)}\\ \\mathrm{J}\\]\\[K_f=K_i+W=${Kf.toFixed(2)}\\ \\mathrm{J},\\quad v_f=\\sqrt{2K_f/m}=${vf.toFixed(2)}\\ \\mathrm{m/s}\\]`);
}

function updateW5Riemann() {
    const n = Math.round(w5Num('w5RiemannN', 8));
    const x0 = 90;
    const y0 = 330;
    const width = 720;
    const height = 280;
    const xmax = 10;
    const fmax = 42;
    let rects = '';
    let sum = 0;
    let path = '';

    w5Txt('w5RiemannNVal', n);

    for (let i = 0; i < n; i++) {
        const xl = (i * xmax) / n;
        const xm = xl + xmax / n / 2;
        const fx = 2 + 0.4 * xm * xm;
        const rx = x0 + (width * xl) / xmax;
        const rw = width / n;
        const ry = y0 - (height * fx) / fmax;

        sum += fx * (xmax / n);
        rects += `<rect x="${rx}" y="${ry}" width="${rw}" height="${y0 - ry}" fill="#dbeafe" stroke="#2563eb" opacity="0.75"/>`;
    }

    for (let i = 0; i <= 100; i++) {
        const x = (xmax * i) / 100;
        const fx = 2 + 0.4 * x * x;
        const px = x0 + (width * x) / xmax;
        const py = y0 - (height * fx) / fmax;
        path += `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`;
    }

    document.getElementById('w5RiemannRects').innerHTML = rects;
    w5SetAttrs('w5RiemannCurve', { d: path });

    const exact = 2 * xmax + (0.4 * xmax ** 3) / 3;
    w5Html('w5RiemannFeedback', `\\[W\\approx ${sum.toFixed(2)}\\ \\mathrm{J},\\quad W_{exact}=\\int_0^{10}(2+0.4x^2)dx=${exact.toFixed(2)}\\ \\mathrm{J}\\]`);
}

let w5PieceMode = 'mixed';

function setW5Piecewise(mode) {
    w5PieceMode = mode;
    updateW5Piecewise();
}

function updateW5Piecewise() {
    const x0 = 90;
    const yMid = 200;
    const scaleX = 100;
    const scaleY = 28;
    const pointSets = {
        mixed: [[0, 0], [2, 4], [4, -2], [6, -2], [7, 0]],
        positive: [[0, 0], [1, 3], [3, 3], [5, 1], [6, 0]],
        triangle: [[0, 0], [3, 5], [6, 0]]
    };
    const points = pointSets[w5PieceMode] || pointSets.mixed;
    const polyline = points.map(([x, y]) => `${x0 + x * scaleX},${yMid - y * scaleY}`).join(' ');
    let areas = '';
    let W = 0;

    points.slice(0, -1).forEach(([x1, y1], i) => {
        const [x2, y2] = points[i + 1];
        const isPositive = y1 + y2 >= 0;
        const polygon = `${x0 + x1 * scaleX},${yMid} ${x0 + x1 * scaleX},${yMid - y1 * scaleY} ${x0 + x2 * scaleX},${yMid - y2 * scaleY} ${x0 + x2 * scaleX},${yMid}`;

        W += ((y1 + y2) / 2) * (x2 - x1);
        areas += `<polygon points="${polygon}" fill="${isPositive ? '#dcfce7' : '#fee2e2'}" stroke="${isPositive ? '#16a34a' : '#dc2626'}" opacity="0.7"/>`;
    });

    document.getElementById('w5PieceAreas').innerHTML = areas;
    w5SetAttrs('w5PieceLine', { points: polyline });
    w5Html('w5PieceFeedback', `\\[W=\\sum \\text{พื้นที่แต่ละช่วง}=${W.toFixed(2)}\\ \\mathrm{J}\\]`);
}

function updateW5Dot() {
    const A = w5Num('w5DotA', 5);
    const B = w5Num('w5DotB', 4);
    const theta = w5Num('w5DotTheta', 45);
    const rad = theta * Math.PI / 180;
    const originX = 460;
    const originY = 250;
    const scale = 35;
    const ax = originX + A * scale;
    const ay = originY;
    const bx = originX + B * scale * Math.cos(rad);
    const by = originY - B * scale * Math.sin(rad);
    const projection = B * Math.cos(rad);
    const px = originX + projection * scale;
    const arcRadius = 55;
    const arcEndX = originX + arcRadius * Math.cos(rad);
    const arcEndY = originY - arcRadius * Math.sin(rad);
    const dot = A * B * Math.cos(rad);

    w5Txt('w5DotAVal', A.toFixed(1));
    w5Txt('w5DotBVal', B.toFixed(1));
    w5Txt('w5DotThetaVal', theta.toFixed(0));
    w5Grid('w5DotGrid', 75, 60, 770, 380, 8, 8);
    w5DotScale(originX, originY, scale);
    w5SetAttrs('w5DotALine', { x1: originX, y1: originY, x2: ax, y2: ay });
    w5SetAttrs('w5DotALabel', { x: ax + 15, y: ay - 5 });
    w5SetAttrs('w5DotBLine', { x1: originX, y1: originY, x2: bx, y2: by });
    w5SetAttrs('w5DotBLabel', { x: bx + 10, y: by - 20 });
    w5SetAttrs('w5DotProj', { x1: originX, y1: originY + 35, x2: px, y2: originY + 35 });
    w5SetAttrs('w5DotProjLabel', { x: px + (projection >= 0 ? 12 : -104), y: originY + 72 });
    w5SetAttrs('w5DotGuide', { x1: px, y1: originY + 35, x2: bx, y2: by });
    w5SetAttrs('w5DotArc', { d: `M ${originX + arcRadius} ${originY} A ${arcRadius} ${arcRadius} 0 ${theta > 180 ? 1 : 0} 0 ${arcEndX} ${arcEndY}` });
    w5Html('w5DotFeedback', `\\[\\vec A\\cdot\\vec B=AB\\cos\\theta=(${A.toFixed(1)})(${B.toFixed(1)})\\cos(${theta.toFixed(0)}^\\circ)=${dot.toFixed(2)}\\]`);
}

function setW5DotAngle(theta) {
    const el = document.getElementById('w5DotTheta');
    if (!el) return;

    el.value = theta;
    updateW5Dot();
}

function updateW5UnitDot() {
    const ax = w5Num('w5Uax', 3);
    const ay = w5Num('w5Uay', 4);
    const bx = w5Num('w5Ubx', 5);
    const by = w5Num('w5Uby', -2);

    w5Html('w5UnitDotFeedback', `\\[\\vec A=(${ax})\\hat{i}+(${ay})\\hat{j},\\quad \\vec B=(${bx})\\hat{i}+(${by})\\hat{j}\\]\\[\\vec A\\cdot\\vec B=A_xB_x+A_yB_y=(${ax})(${bx})+(${ay})(${by})=${(ax * bx + ay * by).toFixed(2)}\\]`);
}

function updateW5AngleWork() {
    const F = w5Num('w5AngleF', 35);
    const s = w5Num('w5AngleS', 50);
    const theta = w5Num('w5AngleTheta', 25);
    const rad = theta * Math.PI / 180;
    const originX = 465;
    const originY = 218;
    const length = Math.min(180, 40 + F * 2);
    const endX = originX + length * Math.cos(rad);
    const endY = originY - length * Math.sin(rad);
    const W = F * s * Math.cos(rad);

    w5Txt('w5AngleFVal', F.toFixed(0));
    w5Txt('w5AngleSVal', s.toFixed(0));
    w5Txt('w5AngleThetaVal', theta.toFixed(0));
    w5SetAttrs('w5AngleFLine', { x1: originX, y1: originY, x2: endX, y2: endY });
    w5SetAttrs('w5AngleFLabel', { x: endX + 8, y: endY - 8 });
    w5SetAttrs('w5AngleFxLine', { x1: originX, y1: originY, x2: originX + length * Math.cos(rad), y2: originY });
    w5Html('w5AngleFeedback', `\\[W=Fs\\cos\\theta=(${F.toFixed(0)})(${s.toFixed(0)})\\cos(${theta.toFixed(0)}^\\circ)=${W.toFixed(2)}\\ \\mathrm{J}\\]`);
    updateW5AngleGraph(F, s, theta);
}

function updateW5AngleGraph(F = w5Num('w5AngleF', 35), s = w5Num('w5AngleS', 50), theta = w5Num('w5AngleTheta', 25)) {
    const denominator = F * s || 1;
    let path = '';

    w5Grid('w5AngleGraphGrid', 90, 45, 720, 235, 9, 4);

    for (let i = 0; i <= 180; i++) {
        const W = F * s * Math.cos(i * Math.PI / 180);
        const x = 90 + (720 * i) / 180;
        const y = 162.5 - 117.5 * (W / denominator);
        path += `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    }

    const selectedW = F * s * Math.cos(theta * Math.PI / 180);
    w5SetAttrs('w5AngleGraphCurve', { d: path });
    w5SetAttrs('w5AngleGraphPoint', { cx: 90 + (720 * theta) / 180, cy: 162.5 - 117.5 * (selectedW / denominator) });
}

function updateW5NetWork() {
    const F = w5Num('w5NetF', 30);
    const fr = w5Num('w5NetFr', 5);
    const s = w5Num('w5NetS', 8);
    const m = w5Num('w5NetM', 6);
    const vi = w5Num('w5NetVi', 0);
    const WF = F * s;
    const Wfr = -fr * s;
    const Wnet = WF + Wfr;
    const Ki = 0.5 * m * vi * vi;
    const Kf = Math.max(0, Ki + Wnet);
    const vf = Math.sqrt((2 * Kf) / m);
    const maxValue = Math.max(1, Math.abs(WF), Math.abs(Wfr), Kf);
    const readouts = { F, Fr: fr, S: s, M: m, Vi: vi };

    Object.entries(readouts).forEach(([key, value]) => {
        const decimals = ['S', 'M', 'Vi'].includes(key) ? 1 : 0;
        w5Txt(`w5Net${key}Val`, value.toFixed(decimals));
    });

    [
        ['w5WFBar', WF],
        ['w5WFrBar', Math.abs(Wfr)],
        ['w5KfBar', Kf]
    ].forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.style.width = `${w5Clamp((value / maxValue) * 100, 0, 100)}%`;
    });

    w5Html('w5NetFeedback', `\\[W_F=${WF.toFixed(2)}\\ \\mathrm{J},\\quad W_f=${Wfr.toFixed(2)}\\ \\mathrm{J},\\quad W_{net}=${Wnet.toFixed(2)}\\ \\mathrm{J}\\]\\[K_f=K_i+W_{net}=${Kf.toFixed(2)}\\ \\mathrm{J},\\quad v_f=${vf.toFixed(2)}\\ \\mathrm{m/s}\\]`);
}

function updateW5Ex8() {
    const m = w5Num('w5Ex8M', 6);
    const F = w5Num('w5Ex8F', 12);
    const s = w5Num('w5Ex8S', 8);
    const W = F * s;
    const v = Math.sqrt(Math.max(0, (2 * W) / m));

    w5Html('w5Ex8Feedback', `\\[W_{net}=Fs=${W.toFixed(2)}\\ \\mathrm{J}\\]\\[W_{net}=\\Delta K=\\frac12mv_f^2\\Rightarrow v_f=\\sqrt{\\frac{2W_{net}}{m}}=${v.toFixed(2)}\\ \\mathrm{m/s}\\]`);
}
function initWeek5() {
    const demos = [
        updateW5Derivation,
        updateW5KE,
        updateW5Ex1,
        updateW5Work1D,
        updateW5Ex2,
        updateW5Riemann,
        updateW5Piecewise,
        updateW5Dot,
        updateW5UnitDot,
        updateW5AngleWork,
        updateW5NetWork,
        updateW5Ex8
    ];

    demos.forEach(fn => {
        try {
            fn();
        } catch (err) {
            console.warn('Week 5 init skipped:', err);
        }
    });
}
function initW5DotProduct() {
    if (document.getElementById('w5DotA')) updateW5Dot();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initW5DotProduct);
    document.addEventListener('DOMContentLoaded', initWeek5);
} else {
    initW5DotProduct();
    initWeek5();
}

let ex1AnimationId = null;
let ex1StartTime = null;
let ex1Duration = 4000;

function getExample1Values() {
  const m = Number(document.getElementById("ex1Mass").value);
  const vi = Number(document.getElementById("ex1Vi").value);
  const vf = Number(document.getElementById("ex1Vf").value);

  return { m, vi, vf };
}

function kineticEnergy(m, v) {
  return 0.5 * m * v * v;
}

function formatJ(value) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0
  });
}

function updateExample1Readout(v, progress) {
  const { m, vi, vf } = getExample1Values();

  const Ki = kineticEnergy(m, vi);
  const Kf = kineticEnergy(m, vf);
  const K = kineticEnergy(m, v);

  const xStart = 120;
  const xEnd = 690;
  const carX = xStart + (xEnd - xStart) * progress;

  const arrowLength = Math.max(35, Math.abs(v) * 5);

  const car = document.getElementById("ex1Car");
  const vVector = document.getElementById("ex1VelocityVector");
  const vLabel = document.getElementById("ex1VelocityLabel");
  const keBox = document.getElementById("ex1KEBox");
  const keLabel = document.getElementById("ex1KELabel");

  car.setAttribute("transform", `translate(${carX},165)`);

  const arrowX1 = carX + 100;
  const arrowY = 150;
  vVector.setAttribute("x1", arrowX1);
  vVector.setAttribute("y1", arrowY);
  vVector.setAttribute("x2", arrowX1 + arrowLength);
  vVector.setAttribute("y2", arrowY);

  vLabel.setAttribute("x", arrowX1 + arrowLength / 2);
  vLabel.textContent = `v = ${v.toFixed(1)} m/s`;

  const keBoxX = Math.min(610, Math.max(100, carX-40));
  keBox.setAttribute("x", keBoxX);
  keLabel.setAttribute("x", keBoxX + 130);
  keLabel.textContent = `KE = ${formatJ(K)} J`;

  const feedback = document.getElementById("ex1Feedback");
  feedback.innerHTML = `
    \\[
      KE_0 = ${formatJ(Ki)}\\ \\mathrm{J},\\qquad
      KE = ${formatJ(Kf)}\\ \\mathrm{J},\\qquad
      \\Delta KE = ${formatJ(Kf - Ki)}\\ \\mathrm{J}
    \\]
  `;

  if (window.MathJax) {
    MathJax.typesetPromise([feedback]);
  }
}

function updateExample1Controls() {
  const { m, vi, vf } = getExample1Values();

  document.getElementById("ex1MassVal").textContent = m;
  document.getElementById("ex1ViVal").textContent = vi;
  document.getElementById("ex1VfVal").textContent = vf;

  updateExample1Readout(vi, 0);
}

function playExample1Animation() {
  cancelAnimationFrame(ex1AnimationId);
  ex1StartTime = null;

  const { vi, vf } = getExample1Values();

  function animate(timestamp) {
    if (!ex1StartTime) ex1StartTime = timestamp;

    const elapsed = timestamp - ex1StartTime;
    const progress = Math.min(elapsed / ex1Duration, 1);

    const smoothProgress = progress * progress * (3 - 2 * progress);
    const v = vi + (vf - vi) * smoothProgress;

    updateExample1Readout(v, smoothProgress);

    if (progress < 1) {
      ex1AnimationId = requestAnimationFrame(animate);
    }
  }

  ex1AnimationId = requestAnimationFrame(animate);
}

function resetExample1Animation() {
  cancelAnimationFrame(ex1AnimationId);
  ex1StartTime = null;

  const { vi } = getExample1Values();
  updateExample1Readout(vi, 0);
}

function drawExample1Ticks() {
  const ticks = document.getElementById("ex1Ticks");
  if (!ticks) return;

  ticks.innerHTML = "";

  for (let i = 0; i <= 10; i++) {
    const x = 80 + i * 76;

    ticks.innerHTML += `
      <line x1="${x}" y1="202" x2="${x}" y2="218"
        stroke="#64748b" stroke-width="2"></line>
      <text x="${x}" y="238" text-anchor="middle"
        font-size="13" fill="#64748b">${i}</text>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  drawExample1Ticks();

  ["ex1Mass", "ex1Vi", "ex1Vf"].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", updateExample1Controls);
    }
  });

  if (document.getElementById("ex1Car")) {
    updateExample1Controls();
  }
});

function updateWorkAreaDemo() {
  const F = Number(document.getElementById("workAreaF").value);
  const xi = Number(document.getElementById("workAreaXi").value);
  const xf = Number(document.getElementById("workAreaXf").value);

  const s = xf - xi;
  const W = F * s;

  document.getElementById("workAreaFVal").textContent = F.toFixed(1);
  document.getElementById("workAreaXiVal").textContent = xi.toFixed(1);
  document.getElementById("workAreaXfVal").textContent = xf.toFixed(1);

  const xMap = x => 90 + (x / 10) * 740;
  const yMap = f => 210 - (f / 10) * 140;

  const xiPx = xMap(xi);
  const xfPx = xMap(xf);
  const fYPx = yMap(F);

  const leftPx = Math.min(xiPx, xfPx);
  const widthPx = Math.abs(xfPx - xiPx);

  /* ===== motion diagram ===== */
  const blockWidth = 80;
  const objectX = xiPx - blockWidth / 2;

  document.getElementById("workObject").setAttribute("x", objectX);

  document.getElementById("workXiGuide").setAttribute("x1", xiPx);
  document.getElementById("workXiGuide").setAttribute("x2", xiPx);

  document.getElementById("workXfGuide").setAttribute("x1", xfPx);
  document.getElementById("workXfGuide").setAttribute("x2", xfPx);

  document.getElementById("workXiLabel").setAttribute("x", xiPx);
  document.getElementById("workXiLabel").textContent = `x₀ = ${xi.toFixed(1)} m`;

  document.getElementById("workXfLabel").setAttribute("x", xfPx);
  document.getElementById("workXfLabel").textContent = `x = ${xf.toFixed(1)} m`;

  const forceVector = document.getElementById("workForceVector");
  const forceLabel = document.getElementById("workForceLabel");

  const forceStartX = objectX + blockWidth/2;
  const forceLength = Math.max(35, Math.abs(F) * 14);

  forceVector.setAttribute("x1", forceStartX);
  forceVector.setAttribute("y1", 110);

  if (F >= 0) {
    forceVector.setAttribute("x2", forceStartX + forceLength);
    forceLabel.setAttribute("x", forceStartX + forceLength / 2);
  } else {
    forceVector.setAttribute("x2", forceStartX - forceLength);
    forceLabel.setAttribute("x", forceStartX - forceLength / 2);
  }

  forceVector.setAttribute("stroke-width", Math.abs(F) < 0.01 ? 0 : 6);
  forceLabel.textContent = `F = ${F.toFixed(1)} N`;

  const distanceVector = document.getElementById("workDistanceVector");
  const distanceLabel = document.getElementById("workDistanceLabel");

  distanceVector.setAttribute("x1", xiPx);
  distanceVector.setAttribute("x2", xfPx);
  distanceVector.setAttribute("stroke-width", Math.abs(s) < 0.01 ? 0 : 5);

  distanceLabel.setAttribute("x", (xiPx + xfPx) / 2);
  distanceLabel.textContent = `Δx = ${s.toFixed(1)} m`;

  /* ===== graph ===== */
  const areaRect = document.getElementById("workAreaRect");

  areaRect.setAttribute("x", leftPx+20);
  areaRect.setAttribute("width", widthPx);

  if (F >= 0) {
    areaRect.setAttribute("y", fYPx);
    areaRect.setAttribute("height", 210 - fYPx);
    areaRect.setAttribute("fill", "#dbeafe");
  } else {
    areaRect.setAttribute("y", 210);
    areaRect.setAttribute("height", fYPx - 210);
    areaRect.setAttribute("fill", "#fee2e2");
  }

  document.getElementById("workForceLine").setAttribute("y1", fYPx);
  document.getElementById("workForceLine").setAttribute("y2", fYPx);

  document.getElementById("workGraphXiLine").setAttribute("x1", xiPx+20);
  document.getElementById("workGraphXiLine").setAttribute("x2", xiPx+20);
  document.getElementById("workGraphXiLine").setAttribute("y2", fYPx);

  document.getElementById("workGraphXfLine").setAttribute("x1", xfPx+20);
  document.getElementById("workGraphXfLine").setAttribute("x2", xfPx+20);
  document.getElementById("workGraphXfLine").setAttribute("y2", fYPx);

  const graphFLabel = document.getElementById("workGraphFLabel");
  graphFLabel.setAttribute("y", fYPx - 10);
  graphFLabel.textContent = `F = ${F.toFixed(1)} N`;

  const feedback = document.getElementById("workAreaFeedback");
  feedback.innerHTML = `
    \\[
      W = F(x-x_0)
      = (${F.toFixed(1)})(${xf.toFixed(1)}-${xi.toFixed(1)})
      = ${W.toFixed(2)}\\ \\mathrm{J}
    \\]
  `;

  if (window.MathJax) {
    MathJax.typesetPromise([feedback]);
  }
}

function drawWorkAreaTicks() {
  const motionTicks = document.getElementById("workMotionTicks");
  const graphGrid = document.getElementById("workGraphGrid");

  if (motionTicks) {
    motionTicks.innerHTML = "";

    for (let i = 0; i <= 10; i++) {
      const x = 90 + (i / 10) * 740;

      motionTicks.innerHTML += `
        <line x1="${x}" y1="172" x2="${x}" y2="188"
          stroke="#64748b" stroke-width="2"></line>
        <text x="${x}" y="205" text-anchor="middle"
          font-size="13" fill="#64748b">${i}</text>
      `;
    }
  }

  if (graphGrid) {
    graphGrid.innerHTML = "";

    for (let i = 0; i <= 10; i++) {
      const x = 110 + (i / 10) * 740;

      graphGrid.innerHTML += `
        <line x1="${x}" y1="50" x2="${x}" y2="360"
          stroke="#e5e7eb" stroke-width="1"></line>
        <text x="${x}" y="382" text-anchor="middle"
          font-size="13" fill="#64748b">${i}</text>
      `;
    }

    for (let f = -10; f <= 10; f += 5) {
      const y = 210 - (f / 10) * 140;

      graphGrid.innerHTML += `
        <line x1="110" y1="${y}" x2="850" y2="${y}"
          stroke="#e5e7eb" stroke-width="1"></line>
        <text x="86" y="${y + 5}" text-anchor="middle"
          font-size="13" fill="#64748b">${f}</text>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("workAreaF")) {
    drawWorkAreaTicks();
    updateWorkAreaDemo();
  }
});

function updateExample3Graph() {
  const F1 = Number(document.getElementById("ex3F1").value);
  const F2 = Number(document.getElementById("ex3F2").value);
  const F3 = Number(document.getElementById("ex3F3").value);

  let x1 = Number(document.getElementById("ex3X1").value);
  let x2 = Number(document.getElementById("ex3X2").value);
  let x3 = Number(document.getElementById("ex3X3").value);

  if (x2 <= x1) x2 = x1 + 0.5;
  if (x3 <= x2) x3 = x2 + 0.5;

  document.getElementById("ex3F1Val").textContent = F1.toFixed(0);
  document.getElementById("ex3F2Val").textContent = F2.toFixed(0);
  document.getElementById("ex3F3Val").textContent = F3.toFixed(0);

  document.getElementById("ex3X1Val").textContent = x1.toFixed(1);
  document.getElementById("ex3X2Val").textContent = x2.toFixed(1);
  document.getElementById("ex3X3Val").textContent = x3.toFixed(1);

  const xMap = x => 120 + (x / 10) * 700;
  const yMap = F => 230 - (F / 10) * 150;

  const x0 = 0;
  const y0 = 0;

  const px0 = xMap(0);
  const px1 = xMap(x1);
  const px2 = xMap(x2);
  const px3 = xMap(x3);

  const py0 = yMap(0);
  const py1 = yMap(F1);
  const py2 = yMap(F2);
  const py3 = yMap(F3);

  const W1 = F1 * (x1 - x0);
  const W2 = F2 * (x2 - x1);
  const W3 = F3 * (x3 - x2);
  const Wtotal = W1 + W2 + W3;

  setAreaRect("ex3Area1", px0, px1, py1, py0, F1);
  setAreaRect("ex3Area2", px1, px2, py2, py0, F2);
  setAreaRect("ex3Area3", px2, px3, py3, py0, F3);

  const points = [
    `${px0},${py1}`,
    `${px1},${py1}`,
    `${px1},${py2}`,
    `${px2},${py2}`,
    `${px2},${py3}`,
    `${px3},${py3}`
  ].join(" ");

  document.getElementById("ex3GraphLine").setAttribute("points", points);

  drawExample3Guides([
    { x: 0, px: px0 },
    { x: x1, px: px1 },
    { x: x2, px: px2 },
    { x: x3, px: px3 }
  ]);

  drawExample3Labels([
    { text: `F₁=${F1} N`, x: (px0 + px1) / 2, y: py1 - 12 },
    { text: `F₂=${F2} N`, x: (px1 + px2) / 2, y: py2 - 12 },
    { text: `F₃=${F3} N`, x: (px2 + px3) / 2, y: py3 - 12 }
  ]);

  document.getElementById("ex3W1Text").innerHTML =
    `\\(W_1 = F_1\\Delta x_1 = ${F1}(${x1.toFixed(1)}-0) = ${W1.toFixed(2)}\\ \\mathrm{J}\\)`;

  document.getElementById("ex3W2Text").innerHTML =
    `\\(W_2 = F_2\\Delta x_2 = ${F2}(${x2.toFixed(1)}-${x1.toFixed(1)}) = ${W2.toFixed(2)}\\ \\mathrm{J}\\)`;

  document.getElementById("ex3W3Text").innerHTML =
    `\\(W_3 = F_3\\Delta x_3 = ${F3}(${x3.toFixed(1)}-${x2.toFixed(1)}) = ${W3.toFixed(2)}\\ \\mathrm{J}\\)`;

  const feedback = document.getElementById("ex3Feedback");
  feedback.innerHTML = `
    \\[
      W
      = W_1 + W_2 + W_3
      = ${W1.toFixed(2)} + ${W2.toFixed(2)} + ${W3.toFixed(2)}
      = ${Wtotal.toFixed(2)}\\ \\mathrm{J}
    \\]
  `;

  if (window.MathJax) {
    MathJax.typesetPromise([
      document.getElementById("ex3W1Text"),
      document.getElementById("ex3W2Text"),
      document.getElementById("ex3W3Text"),
      feedback
    ]);
  }
}

function setAreaRect(id, xA, xB, yForce, yAxis, F) {
  const rect = document.getElementById(id);
  const x = Math.min(xA, xB);
  const width = Math.abs(xB - xA);

  rect.setAttribute("x", x);
  rect.setAttribute("width", width);

  if (F >= 0) {
    rect.setAttribute("y", yForce);
    rect.setAttribute("height", yAxis - yForce);
  } else {
    rect.setAttribute("y", yAxis);
    rect.setAttribute("height", yForce - yAxis);
  }
}

function drawExample3Guides(points) {
  const g = document.getElementById("ex3Guides");
  g.innerHTML = "";

  points.forEach(p => {
    g.innerHTML += `
      <line x1="${p.px}" y1="50" x2="${p.px}" y2="390"
        stroke="#94a3b8" stroke-width="2" stroke-dasharray="8 6"></line>

      <text x="${p.px}" y="415" text-anchor="middle"
        font-size="15" fill="#475569">
        ${p.x.toFixed(1)}
      </text>
    `;
  });
}

function drawExample3Labels(labels) {
  const g = document.getElementById("ex3PointLabels");
  g.innerHTML = "";

  labels.forEach(label => {
    g.innerHTML += `
      <text x="${label.x}" y="${label.y}"
        text-anchor="middle"
        font-size="17"
        font-weight="700"
        fill="#111827">
        ${label.text}
      </text>
    `;
  });
}

function drawExample3Grid() {
  const grid = document.getElementById("ex3Grid");
  if (!grid) return;

  grid.innerHTML = "";

  for (let x = 0; x <= 10; x += 1) {
    const px = 120 + (x / 10) * 700;

    grid.innerHTML += `
      <line x1="${px}" y1="50" x2="${px}" y2="390"
        stroke="#e5e7eb" stroke-width="1"></line>

      <text x="${px}" y="250" text-anchor="middle"
        font-size="12" fill="#94a3b8">
        ${x}
      </text>
    `;
  }

  for (let f = -10; f <= 10; f += 5) {
    const py = 230 - (f / 10) * 150;

    grid.innerHTML += `
      <line x1="120" y1="${py}" x2="820" y2="${py}"
        stroke="#e5e7eb" stroke-width="1"></line>

      <text x="92" y="${py + 5}" text-anchor="middle"
        font-size="13" fill="#64748b">
        ${f}
      </text>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("ex3F1")) {
    drawExample3Grid();
    updateExample3Graph();
  }
});

let forceAngleAnimId = null;
let forceAngleStartTime = null;
const forceAngleDuration = 4200;

function getForceAngleValues() {
  return {
    F: Number(document.getElementById("angleForce").value),
    theta: Number(document.getElementById("angleTheta").value),
    s: Number(document.getElementById("angleDistance").value)
  };
}

function updateForceAngleDemo(progress = 0) {
  const { F, theta, s } = getForceAngleValues();

  document.getElementById("angleForceVal").textContent = F.toFixed(0);
  document.getElementById("angleThetaVal").textContent = theta.toFixed(0);
  document.getElementById("angleDistanceVal").textContent = s.toFixed(0);

  const rad = theta * Math.PI / 180;
  const Fx = F * Math.cos(rad);
  const Wtotal = F * s * Math.cos(rad);
  const Wnow = Wtotal * progress;

  const startX = 130;
  const maxMovePx = 570;
  const distanceStartX = 150;
    const distanceEndX = 150 + (s / 80) * 570;
    const allowedMovePx = distanceEndX - distanceStartX;

    const movePx = allowedMovePx * progress;

  const cartX = startX + movePx;
  const anchorX = cartX + 90;
  const anchorY = 190;

  const forceLength = F * 3.1;
  const fxLength = forceLength * Math.cos(rad);
  const fyLength = forceLength * Math.sin(rad);

  document.getElementById("faCart").setAttribute("transform", `translate(${cartX},205)`);

  const forceVector = document.getElementById("faForceVector");
  forceVector.setAttribute("x1", anchorX);
  forceVector.setAttribute("y1", anchorY);
  forceVector.setAttribute("x2", anchorX + fxLength);
  forceVector.setAttribute("y2", anchorY - fyLength);
  forceVector.setAttribute("stroke-width", F === 0 ? 0 : 7);

  const fxVector = document.getElementById("faFxVector");
  fxVector.setAttribute("x1", anchorX);
  fxVector.setAttribute("y1", anchorY);
  fxVector.setAttribute("x2", anchorX + fxLength);
  fxVector.setAttribute("y2", anchorY);
  fxVector.setAttribute("stroke-width", Math.abs(Fx) < 0.001 ? 0 : 6);

  const fyGuide = document.getElementById("faFyGuide");
  fyGuide.setAttribute("x1", anchorX + fxLength);
  fyGuide.setAttribute("y1", anchorY);
  fyGuide.setAttribute("x2", anchorX + fxLength);
  fyGuide.setAttribute("y2", anchorY - fyLength);

  document.getElementById("faForceLabel").setAttribute("x", anchorX + fxLength + 8);
  document.getElementById("faForceLabel").setAttribute("y", anchorY - fyLength - 8);
  document.getElementById("faForceLabel").textContent = `F = ${F.toFixed(0)} N`;

  document.getElementById("faFxLabel").setAttribute("x", anchorX + fxLength / 2+40);
  document.getElementById("faFxLabel").setAttribute("y", anchorY + 24);
  document.getElementById("faFxLabel").textContent = `Fcosθ = ${Fx.toFixed(1)} N`;

  document.getElementById("faThetaLabel").setAttribute("x", anchorX + 42);
  document.getElementById("faThetaLabel").setAttribute("y", anchorY - 16);
  document.getElementById("faThetaLabel").textContent = `θ = ${theta.toFixed(0)}°`;

  const arcR = 38;
  const arcEndX = anchorX + arcR * Math.cos(rad);
  const arcEndY = anchorY - arcR * Math.sin(rad);
  const largeArc = theta > 180 ? 1 : 0;

  document.getElementById("faAngleArc").setAttribute(
    "d",
    `M ${anchorX + arcR} ${anchorY} A ${arcR} ${arcR} 0 ${largeArc} 0 ${arcEndX} ${arcEndY}`
  );

  document.getElementById("faDistanceVector").setAttribute("x1", distanceStartX+70);
  document.getElementById("faDistanceVector").setAttribute("x2", distanceEndX+70);

  document.getElementById("faDistanceLabel").setAttribute("x", (distanceStartX + distanceEndX) / 2);
  document.getElementById("faDistanceLabel").textContent = `Δx = ${s.toFixed(0)} m`;

  const feedback = document.getElementById("forceAngleFeedback");
  feedback.innerHTML = `
    \\[
      W = F\\Delta x\\cos\\theta
      = (${F.toFixed(0)})(${s.toFixed(0)})\\cos(${theta.toFixed(0)}^\\circ)
      = ${Wtotal.toFixed(2)}\\ \\mathrm{J}
    \\]
    \\[
      W = ${Wnow.toFixed(2)}\\ \\mathrm{J}
    \\]
  `;

  if (window.MathJax) {
    MathJax.typesetPromise([feedback]);
  }
}

function playForceAngleAnimation() {
  cancelAnimationFrame(forceAngleAnimId);
  forceAngleStartTime = null;

  function animate(timestamp) {
    if (!forceAngleStartTime) forceAngleStartTime = timestamp;

    const elapsed = timestamp - forceAngleStartTime;
    const rawProgress = Math.min(elapsed / forceAngleDuration, 1);

    const smoothProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);

    updateForceAngleDemo(smoothProgress);

    if (rawProgress < 1) {
      forceAngleAnimId = requestAnimationFrame(animate);
    }
  }

  forceAngleAnimId = requestAnimationFrame(animate);
}

function resetForceAngleAnimation() {
  cancelAnimationFrame(forceAngleAnimId);
  forceAngleStartTime = null;
  updateForceAngleDemo(0);
}

function drawForceAngleTicks() {
  const ticks = document.getElementById("faTicks");
  if (!ticks) return;

  ticks.innerHTML = "";

  for (let i = 0; i <= 8; i++) {
    const x = 80 + i * 95;

    ticks.innerHTML += `
      <line x1="${x}" y1="252" x2="${x}" y2="268"
        stroke="#64748b" stroke-width="2"></line>
      <text x="${x}" y="287" text-anchor="middle"
        font-size="13" fill="#64748b">${i * 10}</text>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("angleForce")) {
    drawForceAngleTicks();
    updateForceAngleDemo(0);
  }
});
