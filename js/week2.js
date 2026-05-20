// Week 2 interactive helpers
function w2Clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value))); }

function w2MapX(x, min = -5, max = 5, left = 90, right = 830) {
    const v = w2Clamp(x, min, max);
    return left + ((v - min) / (max - min)) * (right - left);
}

function w2MapT(t, min = 0, max = 5, left = 100, right = 840) { return left + ((Number(t) - min) / (max - min)) * (right - left); }

function w2MapY(x, min = -4, max = 5, top = 55, bottom = 350) { return bottom - ((Number(x) - min) / (max - min)) * (bottom - top); }

function w2MapV(v, min = -4, max = 4, top = 40, bottom = 350) { return bottom - ((Number(v) - min) / (max - min)) * (bottom - top); }

function w2TypesetFormula(el) {
    if (el?.classList?.contains('formula') && window.MathJax?.typesetPromise) {
        MathJax.typesetPromise([el]).catch(() => {});
    }
}

function w2Set(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text;
        w2TypesetFormula(el);
    }
}

function w2HTML(id, html) {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = html;
        w2TypesetFormula(el);
    }
}

function w2Attr(id, name, value) { const el = document.getElementById(id); if (el) el.setAttribute(name, value); }

function initWeek2Ticks(groupId, min = -5, max = 5, left = 90, right = 830, y = 120) {
    const group = document.getElementById(groupId);
    if (!group || group.dataset.ready === 'true') return;
    for (let x = min; x <= max; x++) {
        const cx = left + ((x - min) / (max - min)) * (right - left);
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', cx);
        tick.setAttribute('x2', cx);
        tick.setAttribute('y1', y - 12);
        tick.setAttribute('y2', y + 12);
        tick.setAttribute('stroke', '#6b7280');
        tick.setAttribute('stroke-width', '2');
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', cx);
        label.setAttribute('y', y + 45);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '15');
        label.setAttribute('fill', '#374151');
        label.textContent = x;
        group.appendChild(tick);
        group.appendChild(label);
    }
    group.dataset.ready = 'true';
}

function updateNumberLine() {
    const a = Number(document.getElementById('posA')?.value ?? -2);
    const b = Number(document.getElementById('posB')?.value ?? 3);
    w2Set('posAVal', a);
    w2Set('posBVal', b);
    const ax = w2MapX(a, -5, 5, 90, 810),
        bx = w2MapX(b, -5, 5, 90, 810);
    w2Attr('pointA', 'cx', ax);
    w2Attr('pointB', 'cx', bx);
    w2Attr('labelA', 'x', ax);
    w2Attr('labelB', 'x', bx);
    const dx = b - a;
    w2HTML('numberLineFeedback', `จากแผนภาพข้างต้น \\[\\Delta x = x_f - x_i = ${b} - (${a}) = ${dx}\\ \\mathrm{m} \\ \\mathrm{และ } \\ \\mathrm{ระยะทาง} = ${Math.abs(dx)}\\ \\mathrm{m}\\]`);
}

function updateVelocityDiagram() {
    const x1 = Number(document.getElementById('vx1')?.value ?? 3);
    const x2 = Number(document.getElementById('vx2')?.value ?? -1);
    const t1 = Number(document.getElementById('vt1')?.value ?? 2);
    const t2 = Number(document.getElementById('vt2')?.value ?? 4);
    const min = Math.min(-5, x1, x2),
        max = Math.max(5, x1, x2);
    const p1 = w2MapX(x1, min, max, 90, 830),
        p2 = w2MapX(x2, min, max, 90, 830);
    w2Attr('avgPoint1', 'cx', p1);
    w2Attr('avgPoint2', 'cx', p2);
    w2Attr('avgLabel1', 'x', p1);
    w2Attr('avgLabel2', 'x', p2);
    w2Attr('avgVelArrow', 'x1', p1);
    w2Attr('avgVelArrow', 'x2', p2);
    w2Set('avgLabel1', `เริ่มต้น (${t1},${x1})`);
    w2Set('avgLabel2', `สุดท้าย (${t2},${x2})`);
}

function calcAverageVelocity() {
    updateVelocityDiagram();
    const x1 = Number(document.getElementById('vx1').value),
        x2 = Number(document.getElementById('vx2').value);
    const t1 = Number(document.getElementById('vt1').value),
        t2 = Number(document.getElementById('vt2').value);
    const fb = document.getElementById('velocityCalcFeedback');
    if (!fb) return;
    if (t2 === t1) {
        fb.textContent = 'คำนวณไม่ได้ เพราะ Δt = 0';
        fb.className = 'bad';
        return;
    }
    const dx = x2 - x1,
        dt = t2 - t1,
        v = dx / dt;
    fb.innerHTML = `Δx = ${x2} − (${x1}) = ${dx.toFixed(2)} m<br>Δt = ${t2} − (${t1}) = ${dt.toFixed(2)} s<br>v̄ = Δx/Δt = ${v.toFixed(2)} m/s`;
    fb.className = 'good';
}

function instantVelocityCoefficients() {
    const read = (id, fallback) => {
        const value = Number(document.getElementById(id)?.value);
        return Number.isFinite(value) ? value : fallback;
    };
    return {
        a: read('xCoeffA', -0.5),
        b: read('xCoeffB', 0),
        c: read('xCoeffC', 5)
    };
}

function w2x(t) {
    const { a, b, c } = instantVelocityCoefficients();
    return a * t * t + b * t + c;
}

function w2v(t) {
    const { a, b } = instantVelocityCoefficients();
    return 2 * a * t + b;
}

function formatCoeff(value) {
    return Number(value).toFixed(2).replace(/\.?0+$/, '');
}

function formatSignedCoeff(value, variable) {
    const abs = formatCoeff(Math.abs(value));
    const sign = value < 0 ? '-' : '+';
    return `${sign}${abs}${variable}`;
}

function buildInstantGraph() {
    const curve = document.getElementById('xtCurve');
    if (!curve) return;
    let d = '';
    for (let i = 0; i <= 250; i++) {
        const t = 5 * i / 250;
        d += (i === 0 ? 'M' : 'L') + w2MapT(t).toFixed(1) + ',' + w2MapY(w2x(t)).toFixed(1) + ' ';
    }
    curve.setAttribute('d', d);
}

function updateInstantVelocity() {
    buildInstantGraph();
    const t0 = Number(document.getElementById('t0Slider')?.value ?? 2);
    let dtInput = Number(document.getElementById('dtSlider')?.value ?? 0.5);
    let dt = Math.abs(dtInput) < 1e-8 ? 0.01 : dtInput;
    const t1 = t0,
        t2 = w2Clamp(t0 + dt, 0, 5),
        actualDt = t2 - t1;
    const x1 = w2x(t1),
        x2 = w2x(t2),
        avg = (x2 - x1) / actualDt,
        inst = w2v(t0);
    w2Set('t0Val', t0.toFixed(2));
    w2Set('dtVal', dtInput.toFixed(2));
    const p1x = w2MapT(t1),
        p1y = w2MapY(x1),
        p2x = w2MapT(t2),
        p2y = w2MapY(x2);
    w2Attr('instantStart', 'cx', p1x);
    w2Attr('instantStart', 'cy', p1y);
    w2Attr('instantEnd', 'cx', p2x);
    w2Attr('instantEnd', 'cy', p2y);
    w2Attr('instantStartLabel', 'x', p1x + 12);
    w2Attr('instantStartLabel', 'y', p1y - 12);
    w2Attr('instantEndLabel', 'x', p2x - 120);
    w2Attr('instantEndLabel', 'y', p2y + 25);
    w2Set('instantStartLabel', `เริ่มต้น (${t1.toFixed(2)}, ${x1.toFixed(2)})`);
    w2Set('instantEndLabel', `สุดท้าย (${t2.toFixed(2)}, ${x2.toFixed(2)})`);
    const denom = (p2x - p1x) || 1,
        slope = (p2y - p1y) / denom,
        sx1 = Math.min(p1x, p2x) - 90,
        sx2 = Math.max(p1x, p2x) + 90,
        intercept = p1y - slope * p1x;
    w2Attr('secantLine', 'x1', sx1);
    w2Attr('secantLine', 'y1', slope * sx1 + intercept);
    w2Attr('secantLine', 'x2', sx2);
    w2Attr('secantLine', 'y2', slope * sx2 + intercept);
    const tangentSlopeGraph = (w2MapY(x1 + inst * 0.5) - p1y) / (w2MapT(t1 + 0.5) - p1x);
    w2Attr('tangentLine', 'x1', p1x - 160);
    w2Attr('tangentLine', 'y1', p1y - tangentSlopeGraph * 160);
    w2Attr('tangentLine', 'x2', p1x + 160);
    w2Attr('tangentLine', 'y2', p1y + tangentSlopeGraph * 160);
    const { a, b, c } = instantVelocityCoefficients();
    const positionFormula = `${formatCoeff(a)}t^2${formatSignedCoeff(b, 't')}${formatSignedCoeff(c, '')}`;
    const velocityFormula = `${formatCoeff(2 * a)}t${formatSignedCoeff(b, '')}`;
    w2HTML('instantVelocityFeedback', `\\[x(t)=${positionFormula} \\ \\mathrm{m}\\]\\[\\Delta x = x(${t2.toFixed(2)})-x(${t1.toFixed(2)}) = ${x2.toFixed(2)} - (${x1.toFixed(2)}) = ${(x2-x1).toFixed(2)}\\ \\mathrm{m}\\]\\[\\Delta t = ${actualDt.toFixed(2)}\\ \\mathrm{s}\\]\\[v_{avg}=\\frac{\\Delta x}{\\Delta t}=${avg.toFixed(2)}\\ \\mathrm{m/s}\\]\\[v(t)=\\frac{dx}{dt}=${velocityFormula},\\quad v(${t0.toFixed(2)})=${inst.toFixed(2)}\\ \\mathrm{m/s}\\]`);
}

function updateAccelerationVelocityDiagram() {
    initWeek2Ticks('accPositionTicks', -5, 5, 90, 830, 120);
    const v1 = Number(document.getElementById('av1')?.value ?? -1),
        v2 = Number(document.getElementById('av2')?.value ?? -3);
    const t1 = Number(document.getElementById('at1')?.value ?? 2),
        t2 = Number(document.getElementById('at2')?.value ?? 4);
    const x1 = Number(document.getElementById('ax1')?.value ?? 3),
        x2 = Number(document.getElementById('ax2')?.value ?? -1);
    const min = Math.min(-5, x1, x2),
        max = Math.max(5, x1, x2);
    const p1 = w2MapX(x1, min, max, 90, 830),
        p2 = w2MapX(x2, min, max, 90, 830);
    w2Attr('accVelPoint1', 'cx', p1);
    w2Attr('accVelPoint2', 'cx', p2);
    w2Attr('accVelLabel1', 'x', p1);
    w2Attr('accVelLabel2', 'x', p2);
    const scale = 46,
        minLen = 35;
    const vectorEnd = (x, v) => x + Math.sign(v || 1) * Math.max(minLen, Math.min(180, Math.abs(v) * scale));
    w2Attr('accV1Vector', 'x1', p1);
    w2Attr('accV1Vector', 'x2', vectorEnd(p1, v1));
    w2Attr('accV2Vector', 'x1', p2);
    w2Attr('accV2Vector', 'x2', vectorEnd(p2, v2));
    w2Set('accVelLabel1', `เริ่มต้น (${t1}, ${x1}, ${v1})`);
    w2Set('accVelLabel2', `สุดท้าย (${t2}, ${x2}, ${v2})`);
}

function calcAverageAcceleration() {
    updateAccelerationVelocityDiagram();
    const v1 = Number(document.getElementById('av1').value),
        v2 = Number(document.getElementById('av2').value);
    const t1 = Number(document.getElementById('at1').value),
        t2 = Number(document.getElementById('at2').value);
    const fb = document.getElementById('accCalcFeedback');
    if (t2 === t1) {
        fb.textContent = 'คำนวณไม่ได้ เพราะ Δt = 0';
        fb.className = 'bad';
        return;
    }
    const dv = v2 - v1,
        dt = t2 - t1,
        a = dv / dt;
    fb.innerHTML = `Δv = v₂ − v₁ = ${v2} − (${v1}) = ${dv.toFixed(2)} m/s<br>Δt = ${t2} − (${t1}) = ${dt.toFixed(2)} s<br>ā = Δv/Δt = ${a.toFixed(3)} m/s²`;
    fb.className = 'good';
}

function instantAccelerationCoefficients() {
    const read = (id, fallback) => {
        const value = Number(document.getElementById(id)?.value);
        return Number.isFinite(value) ? value : fallback;
    };
    return {
        a: read('vCoeffA', -1),
        b: read('vCoeffB', 0)
    };
}

function w2VelocityForAcceleration(t) {
    const { a, b } = instantAccelerationCoefficients();
    return a * t + b;
}

function w2AccelerationForVelocity() {
    return instantAccelerationCoefficients().a;
}

function buildInstantAccelerationGraph() {
    const curve = document.getElementById('vtCurve');
    if (!curve) return;
    let d = '';
    for (let i = 0; i <= 250; i++) {
        const t = 5 * i / 250;
        d += (i === 0 ? 'M' : 'L') + w2MapT(t).toFixed(1) + ',' + w2MapV(w2VelocityForAcceleration(t)).toFixed(1) + ' ';
    }
    curve.setAttribute('d', d);
}

function updateInstantAcceleration() {
    buildInstantAccelerationGraph();
    const t0 = Number(document.getElementById('accT0Slider')?.value ?? 2);
    let dtInput = Number(document.getElementById('accDtSlider')?.value ?? 0.5);
    let dt = Math.abs(dtInput) < 1e-8 ? 0.01 : dtInput;
    const t1 = t0,
        t2 = w2Clamp(t0 + dt, 0, 5),
        actualDt = t2 - t1;
    const v1 = w2VelocityForAcceleration(t1),
        v2 = w2VelocityForAcceleration(t2);
    const avgA = (v2 - v1) / actualDt,
        instA = w2AccelerationForVelocity();
    w2Set('accT0Val', t0.toFixed(2));
    w2Set('accDtVal', dtInput.toFixed(2));
    const p1x = w2MapT(t1),
        p1y = w2MapV(v1),
        p2x = w2MapT(t2),
        p2y = w2MapV(v2);
    w2Attr('instantAccStart', 'cx', p1x);
    w2Attr('instantAccStart', 'cy', p1y);
    w2Attr('instantAccEnd', 'cx', p2x);
    w2Attr('instantAccEnd', 'cy', p2y);
    w2Set('instantAccStartLabel', `เริ่มต้น (${t1.toFixed(2)}, ${v1.toFixed(2)})`);
    w2Attr('instantAccStartLabel', 'x', p1x + 12);
    w2Attr('instantAccStartLabel', 'y', p1y - 12);
    w2Set('instantAccEndLabel', `สุดท้าย (${t2.toFixed(2)}, ${v2.toFixed(2)})`);
    w2Attr('instantAccEndLabel', 'x', p2x + 12);
    w2Attr('instantAccEndLabel', 'y', p2y + 25);
    const denom = (p2x - p1x) || 1,
        slope = (p2y - p1y) / denom,
        sx1 = Math.min(p1x, p2x) - 90,
        sx2 = Math.max(p1x, p2x) + 90,
        intercept = p1y - slope * p1x;
    w2Attr('accSecantLine', 'x1', sx1);
    w2Attr('accSecantLine', 'y1', slope * sx1 + intercept);
    w2Attr('accSecantLine', 'x2', sx2);
    w2Attr('accSecantLine', 'y2', slope * sx2 + intercept);
    w2Attr('accTangentLine', 'x1', p1x - 160);
    w2Attr('accTangentLine', 'y1', p1y - slope * 160);
    w2Attr('accTangentLine', 'x2', p1x + 160);
    w2Attr('accTangentLine', 'y2', p1y + slope * 160);
    const { a, b } = instantAccelerationCoefficients();
    const velocityFormula = `${formatCoeff(a)}t${formatSignedCoeff(b, '')}`;
    w2HTML('instantAccelerationFeedback', `\\[v(t)=${velocityFormula}\\]\\[\\Delta v = ${v2.toFixed(2)} - (${v1.toFixed(2)}) = ${(v2-v1).toFixed(2)}\\ \\mathrm{m/s}\\]\\[\\Delta t = ${actualDt.toFixed(2)}\\ \\mathrm{s}\\]\\[a_{avg}=\\frac{\\Delta v}{\\Delta t}=${avgA.toFixed(2)}\\ \\mathrm{m/s^2}\\]\\[a(t)=\\frac{dv}{dt}=${formatCoeff(a)},\\quad a(${t0.toFixed(2)})=${instA.toFixed(2)}\\ \\mathrm{m/s^2}\\]`);
}

function areaY(value, min = -5, max = 5, top = 45, bottom = 285) { return bottom - ((Number(value) - min) / (max - min)) * (bottom - top); }

function updateAreaVT() {
    const v = Number(document.getElementById('areaV')?.value ?? 4),
        t = Number(document.getElementById('areaTime')?.value ?? 3);
    w2Set('areaVVal', v);
    w2Set('areaTimeVal', t);
    const y0 = areaY(0),
        yv = areaY(v),
        xw = 120 * t;
    w2Attr('areaRect', 'x', 100);
    w2Attr('areaRect', 'width', xw);
    w2Attr('areaRect', 'y', Math.min(y0, yv));
    w2Attr('areaRect', 'height', Math.abs(y0 - yv));
    w2Attr('areaVLine', 'y1', yv);
    w2Attr('areaVLine', 'y2', yv);
    const dx = v * t;
    w2HTML('areaFeedback', `\\[\\Delta x = v\\Delta t = ${v}\\times ${t} = ${dx}\\ \\mathrm{m}\\]<br>${dx < 0 ? 'การกระจัดทิศลบ' : 'การกระจัดทิศบวก'}`);
}

function updateAreaAT() {
    const a = Number(document.getElementById('areaA')?.value ?? 2),
        t = Number(document.getElementById('areaATime')?.value ?? 3);
    w2Set('areaAVal', a);
    w2Set('areaATimeVal', t);
    const y0 = areaY(0, -4, 4),
        ya = areaY(a, -4, 4),
        xw = 120 * t;
    w2Attr('areaATRect', 'x', 100);
    w2Attr('areaATRect', 'width', xw);
    w2Attr('areaATRect', 'y', Math.min(y0, ya));
    w2Attr('areaATRect', 'height', Math.abs(y0 - ya));
    w2Attr('areaALine', 'y1', ya);
    w2Attr('areaALine', 'y2', ya);
    const dv = a * t;
    w2HTML('areaATFeedback', `\\[\\Delta v = at = ${a}\\times ${t} = ${dv}\\ \\mathrm{m/s}\\]${dv < 0 ? 'ความเร็วเปลี่ยนไปทางลบ' : 'ความเร็วเปลี่ยนไปทางบวก'}`);
}

function initWeek2() {
    initWeek2Ticks('numberTicks', -5, 5, 90, 810, 80);
    initWeek2Ticks('velocityNumberTicks', -5, 5, 90, 830, 120);
    initWeek2Ticks('accPositionTicks', -5, 5, 90, 830, 120);
    updateNumberLine();
    updateVelocityDiagram();
    updateInstantVelocity();
    updateAccelerationVelocityDiagram();
    updateInstantAcceleration();
    updateAreaVT();
    updateAreaAT();
    updateAreaVTFromAT();
}

function updateAreaVTFromAT() {
    const a = Number(document.getElementById('areaA')?.value ?? 2);
    const t = Number(document.getElementById('areaATime')?.value ?? 3);
    const v0 = Number(document.getElementById('areaV0')?.value ?? 1);
    const vEnd = v0 + a * t;
    w2Set('areaV0Val', v0);
    const x0 = 100,
        x1 = 100 + 120 * t;
    const yAxis = areaY(0, -10, 10);
    const yStart = areaY(v0, -10, 10);
    const yEnd = areaY(vEnd, -10, 10);
    w2Attr('areaATVTPoly', 'points', `${x0},${yStart} ${x1},${yEnd} ${x1},${yAxis} ${x0},${yAxis}`);
    w2Attr('areaATVTLine', 'x1', x0);
    w2Attr('areaATVTLine', 'y1', yStart);
    w2Attr('areaATVTLine', 'x2', x1);
    w2Attr('areaATVTLine', 'y2', yEnd);
    w2Attr('areaATVTStart', 'cx', x0);
    w2Attr('areaATVTStart', 'cy', yStart);
    w2Attr('areaATVTEnd', 'cx', x1);
    w2Attr('areaATVTEnd', 'cy', yEnd);
    w2Attr('areaATVTStartLabel', 'x', x0 + 10);
    w2Attr('areaATVTStartLabel', 'y', yStart - 10);
    w2Attr('areaATVTEndLabel', 'x', x1 + 10);
    w2Attr('areaATVTEndLabel', 'y', yEnd - 10);
    w2Set('areaATVTStartLabel', `v₀=${v0} m/s`);
    w2Set('areaATVTEndLabel', `v=${vEnd} m/s`);
    const dv = a * t;
    const dx = 0.5 * (v0 + vEnd) * t;
    w2HTML('areaATVTFeedback', `\\[\\Delta x = \\frac{1}{2}(v_0+v)\\Delta t = \\frac{1}{2}(${v0}+${vEnd})(${t}) = ${dx.toFixed(2)}\\ \\mathrm{m}\\]`);
}

const updateAreaATOriginalForVT = updateAreaAT;
updateAreaAT = function() {
    updateAreaATOriginalForVT();
    updateAreaVTFromAT();
};

// Add clear scales and grid lines to all graph components in Week 2
function w2ClearGroup(group) {
    while (group && group.firstChild) group.removeChild(group.firstChild);
}

function w2SvgEl(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
}

function w2RenderGrid(groupId, cfg) {
    const group = document.getElementById(groupId);
    if (!group) return;
    w2ClearGroup(group);
    const {
        xMin = 0, xMax = 6, xStep = 1,
            yMin = -5, yMax = 5, yStep = 1,
            left = 100, right = 820, top = 45, bottom = 285,
            xAxisY = null, yAxisX = 100,
            xLabelPrefix = '', yLabelSuffix = ''
    } = cfg;
    const mapX = x => left + ((x - xMin) / (xMax - xMin)) * (right - left);
    const mapY = y => bottom - ((y - yMin) / (yMax - yMin)) * (bottom - top);

    for (let x = xMin; x <= xMax + 1e-9; x += xStep) {
        const px = mapX(x);
        group.appendChild(w2SvgEl('line', { x1: px, y1: top, x2: px, y2: bottom, stroke: '#e5e7eb', 'stroke-width': 1 }));
        group.appendChild(w2SvgEl('line', { x1: px, y1: (xAxisY ?? mapY(0)) - 6, x2: px, y2: (xAxisY ?? mapY(0)) + 6, stroke: '#6b7280', 'stroke-width': 2 }));
        const label = w2SvgEl('text', { x: px, y: (xAxisY ?? mapY(0)) + 28, 'text-anchor': 'middle', 'font-size': 13, fill: '#374151' });
        label.textContent = `${xLabelPrefix}${Number(x.toFixed(2))}`;
        group.appendChild(label);
    }
    for (let y = yMin; y <= yMax + 1e-9; y += yStep) {
        const py = mapY(y);
        group.appendChild(w2SvgEl('line', { x1: left, y1: py, x2: right, y2: py, stroke: '#f1f5f9', 'stroke-width': 1 }));
        group.appendChild(w2SvgEl('line', { x1: yAxisX - 6, y1: py, x2: yAxisX + 6, y2: py, stroke: '#6b7280', 'stroke-width': 2 }));
        const label = w2SvgEl('text', { x: yAxisX - 12, y: py + 5, 'text-anchor': 'end', 'font-size': 13, fill: '#374151' });
        label.textContent = `${Number(y.toFixed(2))}${yLabelSuffix}`;
        group.appendChild(label);
    }
}

function w2RenderNumberScale(groupId, min = -5, max = 5, left = 90, right = 830, y = 120, top = 35, bottom = 185) {
    const group = document.getElementById(groupId);
    if (!group) return;
    w2ClearGroup(group);
    for (let x = min; x <= max; x++) {
        const px = left + ((x - min) / (max - min)) * (right - left);
        group.appendChild(w2SvgEl('line', { x1: px, y1: top, x2: px, y2: bottom, stroke: '#f1f5f9', 'stroke-width': 1 }));
        group.appendChild(w2SvgEl('line', { x1: px, y1: y - 12, x2: px, y2: y + 12, stroke: '#6b7280', 'stroke-width': 2 }));
        const label = w2SvgEl('text', { x: px, y: y + 43, 'text-anchor': 'middle', 'font-size': 14, fill: '#374151' });
        label.textContent = x;
        group.appendChild(label);
    }
}

let positionSummaryAnimationId = null;

function initPositionSummaryAnimation() {
    const demo = document.getElementById('positionSummary');
    const ticks = document.getElementById('positionMotionTicks');
    const point = document.getElementById('positionMotionPoint');
    const vector = document.getElementById('positionMotionVector');
    const label = document.getElementById('positionMotionLabel');
    const timeText = document.getElementById('positionMotionTime');
    const valueText = document.getElementById('positionMotionValue');
    if (!demo || !ticks || !point || !vector || !label || !timeText || !valueText) return;

    if (positionSummaryAnimationId) cancelAnimationFrame(positionSummaryAnimationId);
    w2ClearGroup(ticks);

    const minX = -5,
        maxX = 5,
        left = 90,
        right = 830,
        axisY = 96;
    const mapPosition = x => left + ((x - minX) / (maxX - minX)) * (right - left);

    for (let x = minX; x <= maxX; x++) {
        const px = mapPosition(x);
        ticks.appendChild(w2SvgEl('line', { x1: px, y1: axisY - 12, x2: px, y2: axisY + 12, stroke: '#64748b', 'stroke-width': 2 }));
        if (x !== 0) {
            const tickLabel = w2SvgEl('text', { x: px, y: 145, 'text-anchor': 'middle', 'font-size': 15, fill: '#334155' });
            tickLabel.textContent = x;
            ticks.appendChild(tickLabel);
        }
    }

    const startTime = performance.now();
    const animate = now => {
        const cycleTime = ((now - startTime) / 1000) % 5;
        const position = -4 + 1.6 * cycleTime;
        const px = mapPosition(position);
        const labelX = Math.min(Math.max(px, left + 52), right - 52);
        const formattedTime = cycleTime.toFixed(2);
        const formattedPosition = position.toFixed(2);

        point.setAttribute('cx', px);
        vector.setAttribute('x2', px);
        label.setAttribute('x', labelX);
        label.textContent = `x = ${formattedPosition} m`;
        timeText.textContent = `t = ${formattedTime} s`;
        valueText.textContent = `x = ${formattedPosition} m`;

        positionSummaryAnimationId = requestAnimationFrame(animate);
    };

    positionSummaryAnimationId = requestAnimationFrame(animate);
}

let velocitySummaryAnimationId = null;

function initVelocitySummaryAnimation() {
    const demo = document.getElementById('velocitySummary');
    const ticks = document.getElementById('velocityMotionTicks');
    const point = document.getElementById('velocityMotionPoint');
    const arrow = document.getElementById('velocityMotionArrow');
    const label = document.getElementById('velocityMotionLabel');
    const timeText = document.getElementById('velocityMotionTime');
    const valueText = document.getElementById('velocityMotionValue');
    if (!demo || !ticks || !point || !arrow || !label || !timeText || !valueText) return;

    if (velocitySummaryAnimationId) cancelAnimationFrame(velocitySummaryAnimationId);
    w2ClearGroup(ticks);

    const minX = -5,
        maxX = 5,
        left = 90,
        right = 830,
        axisY = 116;
    const mapPosition = x => left + ((x - minX) / (maxX - minX)) * (right - left);

    for (let x = minX; x <= maxX; x++) {
        const px = mapPosition(x);
        ticks.appendChild(w2SvgEl('line', { x1: px, y1: axisY - 12, x2: px, y2: axisY + 12, stroke: '#64748b', 'stroke-width': 2 }));
        if (x !== 0) {
            const tickLabel = w2SvgEl('text', { x: px, y: 165, 'text-anchor': 'middle', 'font-size': 15, fill: '#334155' });
            tickLabel.textContent = x;
            ticks.appendChild(tickLabel);
        }
    }

    const startTime = performance.now();
    const animate = now => {
        const t = ((now - startTime) / 1000) % (Math.PI * 2);
        const position = 3 * Math.sin(t);
        const velocity = 3 * Math.cos(t);
        const px = mapPosition(position);
        const arrowLength = Math.abs(velocity) * 45;
        const arrowEnd = px + Math.sign(velocity || 1) * arrowLength;
        const labelX = Math.min(Math.max(px, left + 62), right - 62);
        const formattedTime = t.toFixed(2);
        const formattedVelocity = velocity.toFixed(2);

        point.setAttribute('cx', px);
        arrow.setAttribute('x1', px);
        arrow.setAttribute('x2', arrowEnd);
        arrow.setAttribute('opacity', Math.abs(velocity) < 0.08 ? 0.25 : 1);
        label.setAttribute('x', labelX);
        label.textContent = `v = ${formattedVelocity} m/s`;
        timeText.textContent = `t = ${formattedTime} s`;
        valueText.textContent = `v = ${formattedVelocity} m/s`;

        velocitySummaryAnimationId = requestAnimationFrame(animate);
    };

    velocitySummaryAnimationId = requestAnimationFrame(animate);
}

function w2RenderAllScales() {
    // 1D position/velocity axes
    w2RenderNumberScale('numberTicks', -5, 5, 90, 810, 80, 50, 120);
    w2RenderNumberScale('velocityNumberTicks', -5, 5, 90, 830, 120, 55, 165);
    w2RenderNumberScale('accPositionTicks', -5, 5, 90, 830, 120, 55, 165);

    // x-t and v-t graphs for instantaneous velocity/acceleration
    w2RenderGrid('instantGrid', { xMin: 0, xMax: 5, xStep: 1, yMin: -4, yMax: 5, yStep: 1, left: 100, right: 850, top: 40, bottom: 350, xAxisY: 212, yAxisX: 100 });
    w2RenderGrid('instantAccGrid', { xMin: 0, xMax: 5, xStep: 1, yMin: -4, yMax: 4, yStep: 1, left: 100, right: 850, top: 40, bottom: 350, xAxisY: 195, yAxisX: 100 });

    // Section 6 area-under-graph components
    w2RenderGrid('areaVTGrid', { xMin: 0, xMax: 6, xStep: 1, yMin: -5, yMax: 5, yStep: 1, left: 100, right: 820, top: 45, bottom: 285, xAxisY: 165, yAxisX: 100 });
    w2RenderGrid('areaATGrid', { xMin: 0, xMax: 6, xStep: 1, yMin: -4, yMax: 4, yStep: 1, left: 100, right: 820, top: 45, bottom: 285, xAxisY: 165, yAxisX: 100 });
    w2RenderGrid('areaATVTGrid', { xMin: 0, xMax: 6, xStep: 1, yMin: -10, yMax: 10, yStep: 2, left: 100, right: 820, top: 45, bottom: 285, xAxisY: 165, yAxisX: 100 });
}

if (typeof initWeek2 === 'function') {
    const w2OriginalInitWeek2 = initWeek2;
    initWeek2 = function() {
        w2OriginalInitWeek2();
        w2RenderAllScales();
        updateNumberLine();
        updateVelocityDiagram();
        updateAccelerationVelocityDiagram();
        updateInstantVelocity();
        updateInstantAcceleration();
        updateAreaVT();
        updateAreaAT();
        updateAreaVTFromAT();
        initPositionSummaryAnimation();
        initVelocitySummaryAnimation();
    };
}

function showDisplacementExplanation(btn) {
    const container = btn.parentElement;
    const exp = container.querySelector('.explanation');
    exp.style.display = 'block';
}

function showVelocityQuizExplanation(btn) {
    const container = btn.parentElement;
    const exp = container.querySelector('.explanation');
    exp.style.display = 'block';
}

function showAccelerationQuizExplanation(btn) {
    const container = btn.parentElement;
    const exp = container.querySelector('.explanation');
    exp.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof initWeek2 === 'function') initWeek2();
});

