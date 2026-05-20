const $9 = id => document.getElementById(id);
const n9 = id => Number($9(id)?.value || 0);

function setText(id, text) {
    const el = $9(id);
    if (el) el.textContent = text;
}

function setMath(id, html) {
    const el = $9(id);
    if (!el) return;
    el.innerHTML = html;
    renderMath(el);
}

function setAttrs(id, attrs) {
    const el = $9(id);
    if (!el) return null;
    Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value));
    return el;
}

function updateW9Pressure() {
    const F = n9('w9F');
    const theta = n9('w9Theta');
    const A = n9('w9A');
    const rad = theta * Math.PI / 180;
    const Fp = F * Math.sin(rad);
    const P = Fp / A;

    setText('w9FVal', F.toFixed(0));
    setText('w9ThetaVal', theta.toFixed(0));
    setText('w9AVal', A.toFixed(2));

    const scale = Math.max(.55, Math.min(1.45, Math.sqrt(A / .10)));
    const cx = 305, cy = 190, topW = 124 * scale, topD = 50 * scale, h = 40;
    const top = [
        cx - topW / 2, cy - topD / 2,
        cx + topW / 2, cy - topD / 2,
        cx + topW / 2 + topD * .9, cy + topD / 2,
        cx - topW / 2 + topD * .9, cy + topD / 2
    ];
    const shadow = [top[0] - 126, top[1] + 61, top[2] + 40, top[3] + 61, top[4] + 80, top[5] + 78, top[6] - 86, top[7] + 78];

    setAttrs('w9SurfaceShadow', { points: shadow.join(' ') });
    setAttrs('w9AreaBlock', { points: top.join(' ') });
    setAttrs('w9PressureFace', { points: `${top[6]},${top[7]} ${top[4]},${top[5]} ${top[4]},${top[5] + h} ${top[6]},${top[7] + h}` });
    setAttrs('w9PressureSide', { points: `${top[2]},${top[3]} ${top[4]},${top[5]} ${top[4]},${top[5] + h} ${top[2]},${top[3] + h}` });

    const tipX = (top[0] + top[2] + top[4] + top[6]) / 4;
    const tipY = (top[1] + top[3] + top[5] + top[7]) / 4;
    const len = 124;
    const parallelLen = len * Math.cos(rad);
    const perpLen = len * Math.sin(rad);
    const startX = tipX - parallelLen;
    const startY = tipY - perpLen;
    const cornerX = tipX;
    const cornerY = startY;

    setAttrs('w9ForceArrow', { x1: startX, y1: startY, x2: tipX, y2: tipY });
    setAttrs('w9NormalArrow', { x1: cornerX, y1: cornerY, x2: tipX, y2: tipY })?.style.setProperty('opacity', perpLen < 3 ? '0' : '1');
    setAttrs('w9ParallelArrow', { x1: startX, y1: startY, x2: cornerX, y2: cornerY })?.style.setProperty('opacity', parallelLen < 3 ? '0' : '1');
    setAttrs('w9ForceLabel', { x: startX - 18, y: startY - 8 });
    setAttrs('w9NormalLabel', { x: tipX + 14, y: (cornerY + tipY) / 2 + 4 })?.style.setProperty('opacity', perpLen < 3 ? '0' : '1');
    setAttrs('w9ParallelLabel', { x: (startX + cornerX) / 2 - 13, y: startY - 10 })?.style.setProperty('opacity', parallelLen < 3 ? '0' : '1');

    const arc = $9('w9AngleArc');
    const thetaLabel = $9('w9ThetaLabel');
    const r = 42;
    const arcEndX = tipX - Math.cos(rad) * r;
    const arcEndY = tipY - Math.sin(rad) * r;
    if (arc) {
        arc.setAttribute('d', `M ${tipX - r} ${tipY} A ${r} ${r} 0 0 1 ${arcEndX} ${arcEndY}`);
        arc.style.opacity = theta < 3 ? '0' : '1';
    }
    if (thetaLabel) {
        thetaLabel.textContent = `θ=${theta.toFixed(0)}°`;
        thetaLabel.setAttribute('x', tipX - r * .98);
        thetaLabel.setAttribute('y', tipY - r * .28 + 30);
        thetaLabel.style.opacity = theta < 3 ? '0' : '1';
    }

    setMath('w9PressureFeedback', `
        \\[F_\\perp=F\\sin\\theta=${F.toFixed(0)}\\sin(${theta.toFixed(0)}^\\circ)=${Fp.toFixed(1)}\\ \\mathrm{N}\\]
        \\[P=\\frac{F_\\perp}{A}=\\frac{${Fp.toFixed(1)}}{${A.toFixed(2)}}=${P.toFixed(0)}\\ \\mathrm{Pa}\\]
    `);
}

function updateW9Density() {
    const m = n9('w9Mass');
    const V = n9('w9Vol');
    const rho = m / V;

    setText('w9MassVal', m.toFixed(1));
    setText('w9VolVal', V.toFixed(3));
    setMath('w9DensityFeedback', `\\[\\rho=\\frac{${m.toFixed(1)}}{${V.toFixed(3)}}=${rho.toFixed(0)}\\ \\mathrm{kg/m^3}\\]`);
}

function updateW9Hydro() {
    const h = n9('w9Depth');
    const rho = n9('w9Rho');
    const g = n9('w9G');
    const Pg = rho * g * h;
    const y = 90 + (h / 10) * 290;

    setText('w9DepthVal', h.toFixed(1));
    setText('w9RhoVal', rho.toFixed(0));
    setText('w9GVal', g.toFixed(2));
    setAttrs('w9DepthPoint', { cy: y });
    setAttrs('w9DepthLine', { y2: y });
    setAttrs('w9DepthLabel', { y: (90 + y) / 2 });
    setMath('w9HydroFeedback', `\\[P_g=\\rho gh=${(Pg / 1000).toFixed(2)}\\ \\mathrm{kPa}\\]`);
}

function updateW9Layered() {
    const h1 = n9('w9H1');
    const h2 = n9('w9H2');
    const h3 = n9('w9H3');
    const totalRaw = h1 + h2 + h3;
    const total = Math.max(.1, totalRaw);
    const probe = $9('w9ProbeDepth');
    let d = Math.min(n9('w9ProbeDepth'), totalRaw);

    if (probe) {
        probe.max = totalRaw.toFixed(2);
        if (Number(probe.value) > totalRaw) probe.value = totalRaw.toFixed(2);
        d = Number(probe.value);
    }

    setText('w9H1Val', h1.toFixed(1));
    setText('w9H2Val', h2.toFixed(1));
    setText('w9H3Val', h3.toFixed(2));
    setText('w9ProbeDepthVal', d.toFixed(2));

    const depths = [
        Math.min(d, h1),
        Math.min(Math.max(d - h1, 0), h2),
        Math.min(Math.max(d - h1 - h2, 0), h3)
    ];
    const Pg = 9.81 * (800 * depths[0] + 1000 * depths[1] + 13600 * depths[2]);
    setMath('w9LayerFeedback', `
        \\[P=g(800(${depths[0].toFixed(2)})+1000(${depths[1].toFixed(2)})+13600(${depths[2].toFixed(2)}))=${(Pg / 1000).toFixed(2)}\\ \\mathrm{kPa}\\]
    `);

    const H = 270;
    const base = 340;
    const top = base - H;
    const layers = [
        ['น้ำมัน', h1, '#fde68a'],
        ['น้ำ', h2, '#7dd3fc'],
        ['ปรอท', h3, '#94a3b8']
    ];
    let y = top;
    let svg = '';

    layers.forEach(([name, height, color]) => {
        const layerH = H * height / total;
        if (height > 0) {
            svg += `<rect x="152" y="${y}" width="196" height="${layerH}" fill="${color}"/>`;
            svg += `<text x="250" y="${y + layerH / 2}" text-anchor="middle" fill="#334155">${name}</text>`;
        }
        y += layerH;
    });

    const visual = $9('w9LayerVisual');
    if (visual) visual.innerHTML = svg;

    const probeY = top + H * (totalRaw ? d / totalRaw : 0);
    setAttrs('w9LayerProbeLine', { y1: probeY, y2: probeY });
    setAttrs('w9LayerProbePoint', { cy: probeY });
    const label = setAttrs('w9LayerProbeLabel', { y: probeY + 6 });
    if (label) label.textContent = `d=${d.toFixed(2)} m`;
}

function updateW9Hydraulic() {
    const F1 = n9('w9F1');
    const d1 = n9('w9D1');
    const d2 = n9('w9D2');
    const ratio = (d2 / d1) ** 2;
    const F2 = F1 * ratio;
    const A1 = Math.PI * (d1 / 100) ** 2 / 4;
    const A2 = Math.PI * (d2 / 100) ** 2 / 4;
    const fmtF = value => value >= 1e6 ? `${(value / 1e6).toFixed(2)} MN` : value >= 1e4 ? `${(value / 1000).toFixed(1)} kN` : `${value.toFixed(0)} N`;

    setText('w9F1Val', F1.toFixed(0));
    setText('w9D1Val', d1.toFixed(1));
    setText('w9D2Val', d2.toFixed(1));

    const sX = 130, lX = 410, baseY = 305, pistonH = 20;
    const smallW = 55 + d1 / 20 * 95;
    const largeW = 70 + d2 / 80 * 180;
    const smallX = sX - smallW / 2;
    const largeX = lX - largeW / 2;
    const smallPistonY = 135 - pistonH;
    const bigPistonY = 95 - pistonH - Math.min(70, Math.log10(Math.max(1, ratio)) * 28);

    setAttrs('w9SmallCylinder', { x: smallX, y: smallPistonY + pistonH, width: smallW, height: 305 - (smallPistonY + pistonH), rx: 18 });
    setAttrs('w9LargeCylinder', { x: largeX, y: bigPistonY + pistonH, width: largeW, height: 305 - (bigPistonY + pistonH), rx: 18 });
    setAttrs('w9SmallPiston', { x: smallX, y: smallPistonY, width: smallW, height: pistonH, rx: 4 });
    setAttrs('w9BigPiston', { x: largeX, y: bigPistonY, width: largeW, height: pistonH, rx: 4 });
    setAttrs('w9HydraulicPipe', { d: `M ${smallX + smallW} 275 H ${largeX}` });

    const forceScale = 140 / Math.max(F1, F2, 1);
    const f1Len = Math.max(6, F1 * forceScale);
    const f2Len = Math.max(6, F2 * forceScale);
    setAttrs('w9F1Arrow', { x1: sX, x2: sX, y1: smallPistonY - f1Len - 8, y2: smallPistonY });
    setAttrs('w9F2Arrow', { x1: lX, x2: lX, y1: bigPistonY + pistonH + f2Len, y2: bigPistonY + pistonH });
    setAttrs('w9D1Line', { x1: smallX, x2: smallX + smallW, y1: baseY + 21, y2: baseY + 21 });
    setAttrs('w9D2Line', { x1: largeX, x2: largeX + largeW, y1: baseY + 21, y2: baseY + 21 });

    setText('w9F1Label', `F₁=${fmtF(F1)}`);
    setAttrs('w9F1Label', { x: sX, y: Math.max(18, smallPistonY - f1Len - 16) });
    setText('w9F2Label', `F₂=${fmtF(F2)}`);
    setAttrs('w9F2Label', { x: lX, y: Math.min(365, bigPistonY + pistonH + f2Len + 22) });
    setText('w9D1Label', `d₁=${d1.toFixed(1)} cm`);
    setAttrs('w9D1Label', { x: sX });
    setText('w9D2Label', `d₂=${d2.toFixed(1)} cm`);
    setAttrs('w9D2Label', { x: lX });

    setMath('w9HydraulicFeedback', `
        \\[A_1=${A1.toFixed(5)}\\ \\mathrm{m^2},\\quad A_2=${A2.toFixed(4)}\\ \\mathrm{m^2}\\]
        \\[\\frac{A_2}{A_1}=\\left(\\frac{d_2}{d_1}\\right)^2=${ratio.toFixed(1)},\\quad F_2=F_1\\frac{A_2}{A_1}=${F2.toFixed(0)}\\ \\mathrm{N}\\]
    `);
}

function updateW9Buoyancy() {
    const V = n9('w9Vdisp');
    const rho = n9('w9FluidRho');
    const m = n9('w9ObjMass');
    const g = 9.81;
    const rhoObj = m / V;
    const W = m * g;
    const FBmax = rho * g * V;
    const floats = rhoObj <= rho;
    const Vsub = floats ? m / rho : V;
    const frac = Math.max(0, Math.min(1, Vsub / V));
    const FB = floats ? W : FBmax;

    setText('w9VdispVal', V.toFixed(3));
    setText('w9FluidRhoVal', rho.toFixed(0));
    setText('w9ObjMassVal', m.toFixed(1));

    const waterY = 170;
    const baseX = 250;
    const blockW = Math.max(54, Math.min(130, 58 + V / 0.02 * 72));
    const blockH = Math.max(48, Math.min(145, 48 + V / 0.02 * 97));
    const x = baseX - blockW / 2;
    const bottom = floats ? waterY + frac * blockH : 330;
    const finalY = bottom - blockH;
    const drawY = 230 - blockH / 2;
    const drawBottom = drawY + blockH;
    const subY = Math.max(drawY, waterY);
    const subH = Math.max(0, drawBottom - subY);

    const block = setAttrs('w9FloatBlock', { x, y: drawY, width: blockW, height: blockH });
    if (block) block.dataset.finalY = finalY;
    const submerged = setAttrs('w9SubmergedPart', { x, y: subY, width: blockW, height: subH });
    if (submerged) {
        submerged.dataset.finalY = Math.max(finalY, waterY);
        submerged.dataset.finalH = Math.max(0, bottom - Math.max(finalY, waterY));
    }

    const forceScale = 78 / Math.max(W, FB, 1);
    const buoyLen = Math.max(8, FB * forceScale);
    const weightLen = Math.max(8, W * forceScale);
    const centerY = drawY + blockH / 2;
    const buoyX = 268;

    const buoyArrow = setAttrs('w9BuoyArrow', { x1: buoyX, x2: buoyX, y1: drawBottom + buoyLen, y2: drawBottom });
    if (buoyArrow) {
        buoyArrow.dataset.finalY1 = bottom + buoyLen;
        buoyArrow.dataset.finalY2 = bottom;
    }

    const weightArrow = setAttrs('w9WeightArrow', { x1: baseX, x2: baseX, y1: centerY, y2: centerY + weightLen });
    if (weightArrow) {
        weightArrow.dataset.finalY1 = finalY + blockH / 2;
        weightArrow.dataset.finalY2 = finalY + blockH / 2 + weightLen;
    }

    const buoyLabel = setAttrs('w9BuoyLabel', { x: buoyX + blockW / 2 - 6, y: drawBottom + 14 });
    if (buoyLabel) {
        buoyLabel.textContent = `F_B=${FB.toFixed(1)} N`;
        buoyLabel.dataset.finalY = bottom + 14;
    }

    const weightLabel = setAttrs('w9WeightLabel', { x: baseX + blockW / 2 + 12, y: centerY + weightLen + 14 });
    if (weightLabel) {
        weightLabel.textContent = `W=${W.toFixed(1)} N`;
        weightLabel.dataset.finalY = finalY + blockH / 2 + weightLen + 14;
    }

    const floatLabel = $9('w9FloatFractionLabel');
    if (floatLabel) {
        floatLabel.textContent = floats
            ? `ลอย: ρวัตถุ=${rhoObj.toFixed(0)} kg/m³, จม ${(frac * 100).toFixed(0)}%, โผล่ ${((1 - frac) * 100).toFixed(0)}%`
            : `จม: ρวัตถุ=${rhoObj.toFixed(0)} kg/m³ มากกว่า ρของไหล=${rho.toFixed(0)} kg/m³`;
    }

    const equilibriumLine = floats
        ? `\\[F_{B,eq}=\\rho_{fluid}gV_{sub}=${rho.toFixed(0)}(9.81)(${Vsub.toFixed(4)})=${FB.toFixed(1)}\\,\\mathrm{N}=W\\]`
        : `\\[F_{B,max}=${FBmax.toFixed(1)}\\,\\mathrm{N}\\lt W=${W.toFixed(1)}\\,\\mathrm{N}\\]<span>ไม่เกิดสมดุลการลอยในของไหล วัตถุอยู่นิ่งที่ก้นภาชนะเพราะมีแรงปฏิกิริยาจากพื้นดันไว้</span>`;
    const status = floats
        ? 'วัตถุลอยหรือสมดุล เพราะความหนาแน่นวัตถุไม่มากกว่าของไหล'
        : 'วัตถุจม เพราะความหนาแน่นวัตถุมากกว่าของไหล';

    setMath('w9BuoyancyFeedback', `
        \\[\\rho_{object}=\\frac{m}{V}=\\frac{${m.toFixed(1)}}{${V.toFixed(3)}}=${rhoObj.toFixed(0)}\\ \\mathrm{kg/m^3}\\]
        \\[W=mg=${W.toFixed(1)}\\,\\mathrm{N},\\quad F_{B,max}=\\rho_{fluid}gV=${FBmax.toFixed(1)}\\,\\mathrm{N}\\]
        ${equilibriumLine}
        \\[V_{sub}=${Vsub.toFixed(4)}\\,\\mathrm{m^3},\\quad \\frac{V_{sub}}{V}=${frac.toFixed(2)}\\]
        ${status}
    `);
}

function animateW9Buoyancy() {
    const svg = $9('w9BuoyancySvg');
    const block = $9('w9FloatBlock');
    if (!svg || !block?.dataset.finalY) return;

    const floats = n9('w9ObjMass') / n9('w9Vdisp') <= n9('w9FluidRho');
    const dy = Number(block.getAttribute('y')) - Number(block.dataset.finalY);
    const parts = ['w9FloatBlock', 'w9SubmergedPart', 'w9BuoyArrow', 'w9WeightArrow', 'w9BuoyLabel', 'w9WeightLabel']
        .map($9)
        .filter(Boolean);

    svg.style.setProperty('--w9-buoy-dy', `${dy}px`);
    parts.forEach(el => {
        el.classList.remove('w9BuoyMove');
        el.style.transition = 'none';
        el.style.transform = `translateY(${dy}px)`;
    });

    const submerged = $9('w9SubmergedPart');
    if (submerged?.dataset.finalY) {
        submerged.setAttribute('y', submerged.dataset.finalY);
        submerged.setAttribute('height', submerged.dataset.finalH || 0);
    }
    block.setAttribute('y', block.dataset.finalY);
    ['w9BuoyArrow', 'w9WeightArrow'].map($9).filter(Boolean).forEach(el => {
        el.setAttribute('y1', el.dataset.finalY1);
        el.setAttribute('y2', el.dataset.finalY2);
    });
    ['w9BuoyLabel', 'w9WeightLabel'].map($9).filter(Boolean).forEach(el => el.setAttribute('y', el.dataset.finalY));

    svg.classList.remove('w9BuoyFloatAnim', 'w9BuoySinkAnim');
    void svg.getBoundingClientRect();
    parts.forEach(el => {
        el.style.transition = '';
        el.classList.add('w9BuoyMove');
    });
    svg.classList.add(floats ? 'w9BuoyFloatAnim' : 'w9BuoySinkAnim');
}

function resetW9BuoyancyAnimation() {
    const svg = $9('w9BuoyancySvg');
    const parts = ['w9FloatBlock', 'w9SubmergedPart', 'w9BuoyArrow', 'w9WeightArrow', 'w9BuoyLabel', 'w9WeightLabel']
        .map($9)
        .filter(Boolean);

    if (svg) svg.classList.remove('w9BuoyFloatAnim', 'w9BuoySinkAnim');
    parts.forEach(el => {
        el.classList.remove('w9BuoyMove');
        el.style.transition = 'none';
        el.style.transform = '';
    });
    updateW9Buoyancy();
    void svg?.getBoundingClientRect();
    parts.forEach(el => { el.style.transition = ''; });
}

document.addEventListener('DOMContentLoaded', () => {
    updateW9Pressure();
    updateW9Density();
    updateW9Hydro();
    updateW9Layered();
    updateW9Hydraulic();
    updateW9Buoyancy();
});
