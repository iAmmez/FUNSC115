// Graph-analysis laboratory helpers
const graphLabData = [
    { p: 7.8, v: 35 },
    { p: 15.6, v: 65 },
    { p: 23.4, v: 78 },
    { p: 31.3, v: 126 },
    { p: 39.0, v: 142 },
    { p: 46.9, v: 171 },
    { p: 54.7, v: 194 },
    { p: 62.6, v: 226 },
    { p: 78.3, v: 245 },
    { p: 86.0, v: 258 },
    { p: 87.6, v: 259 },
    { p: 93.9, v: 271 },
    { p: 101.6, v: 277 },
    { p: 109.6, v: 284 },
    { p: 118.0, v: 290 }
];

function graphSetHTML(id, html) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = html;
    if (el.classList.contains('formula') && window.MathJax?.typesetPromise) {
        MathJax.typesetPromise([el]).catch(() => {});
    }
}

function graphSvgEl(name, attrs = {}, text = '') {
    const el = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    if (text !== '') el.textContent = text;
    return el;
}

function graphScale(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

function graphRegression(data, xKey, yKey) {
    const n = data.length;
    const sx = data.reduce((sum, d) => sum + d[xKey], 0);
    const sy = data.reduce((sum, d) => sum + d[yKey], 0);
    const sxx = data.reduce((sum, d) => sum + d[xKey] * d[xKey], 0);
    const sxy = data.reduce((sum, d) => sum + d[xKey] * d[yKey], 0);
    const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    const intercept = (sy - slope * sx) / n;
    return { slope, intercept };
}

function drawGraphFrame(svg, config) {
    const { left, right, top, bottom, xLabel, yLabel, title, xTicks, yTicks, xMap, yMap } = config;
    svg.innerHTML = '';
    for (const t of xTicks) {
        const x = xMap(t);
        svg.appendChild(graphSvgEl('line', { x1: x, y1: top, x2: x, y2: bottom, class: 'graph-grid-line' }));
        svg.appendChild(graphSvgEl('text', { x, y: bottom + 30, 'font-size': 16, 'text-anchor': 'middle', fill: '#475569' }, String(t)));
    }
    for (const t of yTicks) {
        const y = yMap(t);
        svg.appendChild(graphSvgEl('line', { x1: left, y1: y, x2: right, y2: y, class: 'graph-grid-line' }));
        svg.appendChild(graphSvgEl('text', { x: left - 12, y: y + 5, 'font-size': 16, 'text-anchor': 'end', fill: '#475569' }, String(t)));
    }
    svg.appendChild(graphSvgEl('line', { x1: left, y1: bottom, x2: right, y2: bottom, class: 'graph-axis' }));
    svg.appendChild(graphSvgEl('line', { x1: left, y1: bottom, x2: left, y2: top, class: 'graph-axis' }));
    svg.appendChild(graphSvgEl('text', { x: (left + right) / 2, y: 38, 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: '#111827' }, title));
    svg.appendChild(graphSvgEl('text', { x: (left + right) / 2, y: bottom + 68, 'font-size': 18, 'text-anchor': 'middle', fill: '#111827' }, xLabel));
    svg.appendChild(graphSvgEl('text', { x: 26, y: (top + bottom) / 2, 'font-size': 18, 'text-anchor': 'middle', fill: '#111827', transform: `rotate(-90 26 ${(top + bottom) / 2})` }, yLabel));
}

function updateGraphBuilder() {
    const svg = document.getElementById('graphBuilderSvg');
    if (!svg) return;
    const err = Number(document.getElementById('graphErr')?.value ?? 8);
    const mode = document.getElementById('graphFitMode')?.value ?? 'fit';
    const errVal = document.getElementById('graphErrVal');
    if (errVal) errVal.textContent = err;

    const left = 92, right = 850, top = 64, bottom = 450;
    const xMap = value => graphScale(value, 0, 125, left, right);
    const yMap = value => graphScale(value, 0, 320, bottom, top);
    drawGraphFrame(svg, {
        left, right, top, bottom,
        xLabel: 'ความดันต่อความยาว P (Pa/m)',
        yLabel: 'อัตราเร็วเฉลี่ย v (mm/s)',
        title: 'ความสัมพันธ์ระหว่าง P และ v',
        xTicks: [0, 25, 50, 75, 100, 125],
        yTicks: [0, 80, 160, 240, 320],
        xMap, yMap
    });

    if (mode === 'fit') {
        const fit = graphRegression(graphLabData, 'p', 'v');
        const x1 = 0, x2 = 122;
        const y1 = fit.slope * x1 + fit.intercept;
        const y2 = fit.slope * x2 + fit.intercept;
        svg.appendChild(graphSvgEl('line', { x1: xMap(x1), y1: yMap(y1), x2: xMap(x2), y2: yMap(y2), class: 'graph-fit' }));
    }

    if (mode === 'connect') {
        const points = graphLabData.map(d => `${xMap(d.p)},${yMap(d.v)}`).join(' ');
        svg.appendChild(graphSvgEl('polyline', { points, class: 'graph-guide' }));
    }

    for (const d of graphLabData) {
        const x = xMap(d.p), y = yMap(d.v);
        const yTop = yMap(d.v + err), yBottom = yMap(d.v - err);
        if (err > 0) {
            svg.appendChild(graphSvgEl('line', { x1: x, y1: yTop, x2: x, y2: yBottom, class: 'graph-error' }));
            svg.appendChild(graphSvgEl('line', { x1: x - 8, y1: yTop, x2: x + 8, y2: yTop, class: 'graph-error' }));
            svg.appendChild(graphSvgEl('line', { x1: x - 8, y1: yBottom, x2: x + 8, y2: yBottom, class: 'graph-error' }));
        }
        svg.appendChild(graphSvgEl('circle', { cx: x, cy: y, r: 7, class: 'graph-point' }));
    }

    const fit = graphRegression(graphLabData, 'p', 'v');
    graphSetHTML('graphBuilderFeedback', `เส้น best-fit จากข้อมูลทั้งหมดให้ประมาณ \\[v = ${fit.slope.toFixed(2)}P + ${fit.intercept.toFixed(1)}\\] ความชันบอกว่าเมื่อ \(P\) เพิ่มขึ้น 1 Pa/m ค่า \(v\) เพิ่มขึ้นประมาณ ${fit.slope.toFixed(2)} mm/s`);
}

function setGraphType(button) {
    const group = button.closest('.interaction');
    group?.querySelectorAll('[data-graph-type]').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    updateGraphType(button.dataset.graphType);
}

function updateGraphType(type = 'linear') {
    const svg = document.getElementById('graphTypeSvg');
    if (!svg) return;
    const left = 90, right = 850, top = 62, bottom = 420;
    const xMap = value => graphScale(value, 0, 5, left, right);
    const yMap = value => graphScale(value, 0, 11, bottom, top);
    drawGraphFrame(svg, {
        left, right, top, bottom,
        xLabel: type === 'loglog' ? 'log x' : 'x',
        yLabel: type === 'semilog' ? 'log y' : (type === 'loglog' ? 'log y' : 'y'),
        title: type === 'linear' ? 'Linear graph' : (type === 'semilog' ? 'Semi-log graph' : 'Log-log graph'),
        xTicks: [0, 1, 2, 3, 4, 5],
        yTicks: [0, 2, 4, 6, 8, 10],
        xMap, yMap
    });

    let points = [];
    let feedback = '';
    if (type === 'linear') {
        for (let x = 0; x <= 5; x += 0.1) points.push([xMap(x), yMap(1.2 * x + 2)]);
        feedback = `<b>กราฟเชิงเส้น (Linear Graph)</b><br>
        &nbsp;&nbsp;&nbsp;&nbsp;กราฟเชิงเส้นเป็นรูปแบบที่พื้นฐานที่สุดสำหรับการวิเคราะห์ความสัมพันธ์ระหว่างตัวแปร
        โดยที่ค่าของตัวแปรต้นและตัวแปรตามเพิ่มขึ้นหรือลดลงในอัตราที่คงที่เมื่อเทียบกับกันและกัน
        <br>&nbsp;
        หากตัวแปรต้น x และตัวแปรตาม y สัมพันธ์กันผ่านสมการ \\[y=mx+C\\]
        เมื่อวาดกราฟความสัมพันธ์นี้บนกราฟเชิงเส้นจะได้เส้นตรงที่มีความชัน m และจุดตัดแกน y ที่ C`;
    } else if (type === 'semilog') {
        for (let x = 0; x <= 5; x += 0.1) points.push([xMap(x), yMap(9.5 - 1.45 * x)]);
        feedback = `<b>กราฟกึ่งลอการิทึม (Semi-log Graph)</b><br>
        &nbsp;&nbsp;&nbsp;&nbsp;พิจารณาความสัมพันธ์ที่สามารถเขียนได้ในรูปสมการ \\[y=y_0 e^{-\\alpha x}\\]
        หากกำหนดให้ \\(\\alpha>0\\) เมื่อเขียนกราฟเชิงเส้นของสมการนี้จะเห็นว่า ค่า y จะการลดลงแบบเอกซ์โพเนนเชียล เมื่อค่า x เพิ่มขึ้น และเมื่อ x = 0 จะได้ y = y₀
        <br>&nbsp;&nbsp;&nbsp;&nbsp;ปรากฏการณ์ทางกายภาพหลายอย่าง เช่น การดูดกลืนแสง (light absorption), การดูดกลืนรังสี (radiation absorption) และ การสลายตัวของสารกัมมันตรังสี (radioactive decay) สามารถอธิบายได้ด้วยสมการลักษณะนี้
        <br>&nbsp;&nbsp;&nbsp;&nbsp;ถ้าเราสร้างกราฟจากสมการนี้ ลงบนกราฟกึ่งลอการิทึม (คือ กราฟที่แกนตั้งเป็นสเกลลอการิทึม และแกนนอนเป็นสเกลเชิงเส้น) จะได้กราฟเส้นตรงดังรูป เนื่องจากการใช้สเกลลอการิทึมบนแกนตั้ง สมมูลกับการพิจารณาค่า \\(\\log⁡ 𝑦\\) ดังต่อไปนี้
        \\[\\log⁡𝑦=\\log⁡(𝑦_0 𝑒^{–𝛼𝑥})\\]
        \\[\\log⁡𝑦= –𝛼𝑥(\\log⁡𝑒)+\\log⁡𝑦_0\\]
        \\[\\log⁡𝑦= –0.434 𝛼𝑥+\\log⁡𝑦_0\\]
        ดังนั้น หากเราสร้างกราฟโดยให้ \\(x\\) อยู่บนแกนนอน และ \\(\\log ⁡𝑦\\) อยู่บนแกนตั้ง
        จะได้เส้นตรงที่มีจุดตัดแกนตั้งเท่ากับ ⁡𝑦₀
`;
    } else {
        for (let x = 0; x <= 5; x += 0.1) points.push([xMap(x), yMap(1.3 + 1.65 * x)]);
        feedback = `<b>กราฟลอการิทึมคู่ (Log-log Graph)</b><br>
        &nbsp;&nbsp;&nbsp;&nbsp;ปรากฏการณ์ธรรมชาติหลายอย่างสามารถอธิบายได้ด้วยสมการ
        \\[𝑦 = 𝐴 𝑥^𝛼\\]
        &nbsp;&nbsp;&nbsp;&nbsp;โดยที่ 𝐴 เป็นค่าคงที่ และ 𝛼 เป็นจำนวนจริงใด ๆ เช่น การเคลื่อนที่ของดาวเคราะห์ตามกฎของเคปเลอร์ (Kepler’s Law) ถ้าเขียนกราฟของสมการนี้บนกราฟลอการิทึมคู่ (ทั้งสองแกนเป็นสเกลลอการิทึม) จะได้กราฟเส้นตรง ดังแสดงในรูป เนื่องจากการใช้สเกลลอการิทึมบนแกนตั้งและแกนนอน สมมูลกับการพิจารณาค่า log⁡(𝑦) ดังต่อไปนี้
        \\[\\log⁡𝑦 = 𝛼 \\log⁡𝑥 + \\log⁡𝐴\\]
        ดังนั้น เมื่อสร้างกราฟโดยให้ \\(\\log x\\) เป็นตัวแปรต้น และ \\(\\log y\\) เป็นตัวแปรตาม
        จะได้เส้นตรงที่มีจุดตัดแกนตั้งเท่ากับ 𝐴`;
    }
    svg.appendChild(graphSvgEl('polyline', { points: points.map(p => p.join(',')).join(' '), class: 'graph-fit' }));
    graphSetHTML('graphTypeFeedback', feedback);
}

function updateLinearizationLab() {
    const svg = document.getElementById('linearizationSvg');
    if (!svg) return;
    const k = Number(document.getElementById('springK')?.value ?? 20);
    const meff = Number(document.getElementById('springMeff')?.value ?? 0.05);
    const kVal = document.getElementById('springKVal');
    const meffVal = document.getElementById('springMeffVal');
    if (kVal) kVal.textContent = k.toFixed(0);
    if (meffVal) meffVal.textContent = meff.toFixed(2);

    const slope = 4 * Math.PI * Math.PI / k;
    const intercept = slope * meff;
    const masses = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50];
    const data = masses.map(m => ({ m, t2: slope * m + intercept }));
    const maxY = Math.max(...data.map(d => d.t2)) * 1.12;
    const left = 92, right = 850, top = 64, bottom = 430;
    const xMap = value => graphScale(value, 0, 0.55, left, right);
    const yMap = value => graphScale(value, 0, maxY, bottom, top);
    drawGraphFrame(svg, {
        left, right, top, bottom,
        xLabel: 'มวล m (kg)',
        yLabel: 'คาบกำลังสอง T² (s²)',
        title: 'Linearization: T² กับ m',
        xTicks: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
        yTicks: [0, +(maxY * 0.25).toFixed(2), +(maxY * 0.5).toFixed(2), +(maxY * 0.75).toFixed(2), +maxY.toFixed(2)],
        xMap, yMap
    });
    svg.appendChild(graphSvgEl('line', {
        x1: xMap(0), y1: yMap(intercept),
        x2: xMap(0.52), y2: yMap(slope * 0.52 + intercept),
        class: 'graph-fit'
    }));
    data.forEach(d => svg.appendChild(graphSvgEl('circle', { cx: xMap(d.m), cy: yMap(d.t2), r: 7, class: 'graph-point' })));
    graphSetHTML('linearizationFeedback', `จากสมการ \\[T^2=\\frac{4\\pi^2}{k}m+\\frac{4\\pi^2}{k}m_\\mathrm{eff}\\] ได้ความชัน \\(4\\pi^2/k = ${slope.toFixed(2)}\\ \\mathrm{s^2/kg}\\) และจุดตัดแกน \\(\\frac{4\\pi^2}{k}m_\\mathrm{eff}=${intercept.toFixed(2)}\\ \\mathrm{s^2}\\)`);
}

function checkGraphSlope() {
    const answer = Number(document.getElementById('slopeAnswer')?.value);
    const fb = document.getElementById('slopeFeedback');
    if (!fb) return;
    if (Math.abs(answer - 2) <= 0.02) {
        fb.textContent = 'ถูกต้อง: m = (9 - 3) / (4 - 1) = 2';
        fb.className = 'good';
    } else {
        fb.textContent = 'ยังไม่ถูก ลองใช้ m = (y₂ - y₁) / (x₂ - x₁)';
        fb.className = 'bad';
    }
}

function showGraphSlopeHint() {
    const fb = document.getElementById('slopeFeedback');
    if (!fb) return;
    fb.textContent = 'คำใบ้: ตัวเศษคือ 9 - 3 และตัวส่วนคือ 4 - 1';
    fb.className = '';
}

document.addEventListener('DOMContentLoaded', () => {
    updateGraphBuilder();
    updateGraphType('linear');
    updateLinearizationLab();
});
