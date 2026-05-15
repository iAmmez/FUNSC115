// Week 3 interactive helpers
function w3Num(id, fallback = 0) { const el = document.getElementById(id); const n = Number(el?.value); return Number.isFinite(n) ? n : fallback; }

function w3SetText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }

function w3SetHTML(id, html) { const el = document.getElementById(id); if (el) { el.innerHTML = html; if (window.MathJax?.typesetPromise) MathJax.typesetPromise([el]).catch(() => {}); } }

function w3Attr(id, name, value) { const el = document.getElementById(id); if (el) el.setAttribute(name, value); }

function w3Rad(deg) { return deg * Math.PI / 180; }

function w3Clamp(x, min, max) { return Math.max(min, Math.min(max, x)); }

function w3Grid(groupId, cfg = {}) {
    const g = document.getElementById(groupId);
    if (!g || g.dataset.ready === 'true') return;
    const { x0 = 120, y0 = 420, sx = 80, sy = 60, xMin = -4, xMax = 9, yMin = -1, yMax = 6 } = cfg;
    for (let x = xMin; x <= xMax; x++) {
        const X = x0 + x * sx;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', X);
        line.setAttribute('x2', X);
        line.setAttribute('y1', 60);
        line.setAttribute('y2', 470);
        line.setAttribute('stroke', '#e5e7eb');
        line.setAttribute('stroke-width', '1');
        g.appendChild(line);
        if (x !== 0) {
            const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            t.setAttribute('x', X);
            t.setAttribute('y', y0 + 24);
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('font-size', '13');
            t.textContent = x;
            g.appendChild(t);
        }
    }
    for (let y = yMin; y <= yMax; y++) {
        const Y = y0 - y * sy;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', 80);
        line.setAttribute('x2', 850);
        line.setAttribute('y1', Y);
        line.setAttribute('y2', Y);
        line.setAttribute('stroke', '#e5e7eb');
        line.setAttribute('stroke-width', '1');
        g.appendChild(line);
        if (y !== 0) {
            const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            t.setAttribute('x', x0 - 15);
            t.setAttribute('y', Y + 5);
            t.setAttribute('text-anchor', 'end');
            t.setAttribute('font-size', '13');
            t.textContent = y;
            g.appendChild(t);
        }
    }
    g.dataset.ready = 'true';
}

function w3Pt(x, y, x0 = 120, y0 = 420, sx = 80, sy = 60) { return { X: x0 + x * sx, Y: y0 - y * sy }; }

function w3Path(points, x0 = 120, y0 = 420, sx = 80, sy = 60) { return points.map((p, i) => { const q = w3Pt(p.x, p.y, x0, y0, sx, sy); return `${i?'L':'M'} ${q.X.toFixed(1)} ${q.Y.toFixed(1)}` }).join(' '); }


function updateW3VectorAddition() {
    const ax = w3Num('w3AddAx', 3),
        ay = w3Num('w3AddAy', 2),
        bx = w3Num('w3AddBx', 2),
        by = w3Num('w3AddBy', -1);
    w3SetText('w3AddAxVal', ax.toFixed(1));
    w3SetText('w3AddAyVal', ay.toFixed(1));
    w3SetText('w3AddBxVal', bx.toFixed(1));
    w3SetText('w3AddByVal', by.toFixed(1));
    const ox = 460,
        oy = 260,
        scale = 20;
    const aX = ox + ax * scale,
        aY = oy - ay * scale,
        bX = ox + bx * scale,
        bY = oy - by * scale,
        rX = ox + (ax + bx) * scale,
        rY = oy - (ay + by) * scale;
    w3Attr('w3AddALine', 'x2', aX);
    w3Attr('w3AddALine', 'y2', aY);
    w3Attr('w3AddBLine', 'x2', bX);
    w3Attr('w3AddBLine', 'y2', bY);
    w3Attr('w3AddAHeadLine', 'x1', bX);
    w3Attr('w3AddAHeadLine', 'y1', bY);
    w3Attr('w3AddAHeadLine', 'x2', rX);
    w3Attr('w3AddAHeadLine', 'y2', rY);
    w3Attr('w3AddBHeadLine', 'x1', aX);
    w3Attr('w3AddBHeadLine', 'y1', aY);
    w3Attr('w3AddBHeadLine', 'x2', rX);
    w3Attr('w3AddBHeadLine', 'y2', rY);
    w3Attr('w3AddRLine', 'x2', rX);
    w3Attr('w3AddRLine', 'y2', rY);
    w3Attr('w3AddALabel', 'x', aX + 10);
    w3Attr('w3AddALabel', 'y', aY - 10);
    w3Attr('w3AddBLabel', 'x', bX + 10);
    w3Attr('w3AddBLabel', 'y', bY + 22);
    w3Attr('w3AddRLabel', 'x', rX + 10);
    w3Attr('w3AddRLabel', 'y', rY - 10);
    const rx = ax + bx,
        ry = ay + by;
    w3SetHTML('w3VectorFeedback1',
        `\\[\\vec A=${ax.toFixed(1)}\\hat{i}+${ay.toFixed(1)}\\hat{j},\\quad \\vec B=${bx.toFixed(1)}\\hat{i}+${by.toFixed(1)}\\hat{j}\\]
    \\[\\vec R=\\vec A+\\vec B=(${ax.toFixed(1)}+${bx.toFixed(1)})\\hat{i}+(${(ay).toFixed(1)}+${(by).toFixed(1)})\\hat{j}=${rx.toFixed(1)}\\hat{i}+${ry.toFixed(1)}\\hat{j}\\]`);
}

function updateW3UnitVector() {
    const ax = w3Clamp(w3Num('w3UnitAx', 3), -5, 5),
        ay = w3Clamp(w3Num('w3UnitAy', 4), -5, 5),
        mag = Math.hypot(ax, ay);
    const axInput = document.getElementById('w3UnitAx'),
        ayInput = document.getElementById('w3UnitAy');
    if (axInput && Number(axInput.value) !== ax) axInput.value = ax;
    if (ayInput && Number(ayInput.value) !== ay) ayInput.value = ay;
    const ox = 460,
        oy = 210,
        scale = 32;
    const ex = ox + ax * scale,
        ey = oy - ay * scale;
    w3Attr('w3UnitAxLine', 'x2', ex);
    w3Attr('w3UnitAxLine', 'y2', oy);
    w3Attr('w3UnitAyLine', 'x1', ex);
    w3Attr('w3UnitAyLine', 'y1', oy);
    w3Attr('w3UnitAyLine', 'x2', ex);
    w3Attr('w3UnitAyLine', 'y2', ey);
    w3Attr('w3UnitAxLabel', 'x', (ox + ex) / 2 - 10);
    w3Attr('w3UnitAxLabel', 'y', oy + 22);
    w3Attr('w3UnitAyLabel', 'x', ex + (ax >= 0 ? 10 : -28));
    w3Attr('w3UnitAyLabel', 'y', (oy + ey) / 2 + 5);
    w3Attr('w3UnitVec', 'x2', ex);
    w3Attr('w3UnitVec', 'y2', ey);
    w3Attr('w3UnitVecLabel', 'x', ex + (ax >= 0 ? 10 : -28));
    w3Attr('w3UnitVecLabel', 'y', ey + (ay >= 0 ? -10 : 24));
    if (mag < 1e-9) {
        w3Attr('w3UnitHat', 'x2', ox);
        w3Attr('w3UnitHat', 'y2', oy);
        w3Attr('w3UnitHatLabel', 'x', ox + 10);
        w3Attr('w3UnitHatLabel', 'y', oy - 10);
        w3SetHTML('w3UnitFeedback', 'เวกเตอร์ศูนย์ไม่สามารถสร้างเวกเตอร์หนึ่งหน่วยได้ เพราะมีขนาดเป็นศูนย์');
        return;
    }
    const ux = ax / mag,
        uy = ay / mag,
        ux2 = ox + ux * scale,
        uy2 = oy - uy * scale,
        uatan = Math.atan(ay / ax);
    w3Attr('w3UnitHat', 'x2', ux2);
    w3Attr('w3UnitHat', 'y2', uy2);
    w3Attr('w3UnitHatLabel', 'x', ux2 + (ux >= 0 ? 10 : -28));
    w3Attr('w3UnitHatLabel', 'y', uy2 + (uy >= 0 ? -10 : 24));
    w3SetHTML('w3UnitFeedback', `\\[\\vec A = A_x\\hat{i} + A_y\\hat{j}=${ax.toFixed(2)}\\hat{i} + ${ay.toFixed(2)}\\hat{j}\\]
  \\[|\\vec A|=\\sqrt{(${ax.toFixed(3)})^2+(${ay.toFixed(3)})^2}=${mag.toFixed(3)}\\]
  \\[\\theta = \\tan^{-1}\\left(\\frac{${ay.toFixed(3)}}{${ax.toFixed(3)}}\\right)=${uatan.toFixed(3)}\\]
  \\[\\hat A=\\frac{\\vec A}{|\\vec A|}=${ux.toFixed(3)}\\hat{i}+${uy.toFixed(3)}\\hat{j},\\quad |\\hat A|=1\\]`);
}

function updateW3PolarVector() {
    const mag = w3Num('w3PolarMagVisible', 4),
        deg = w3Num('w3PolarAngleVisible', 30),
        th = w3Rad(deg);
    const ax = mag * Math.cos(th),
        ay = mag * Math.sin(th);
    const ox = 460,
        oy = 210,
        scale = 32;
    const ex = ox + ax * scale,
        ey = oy - ay * scale;
    w3SetText('w3PolarMagValVisible', mag.toFixed(1));
    w3SetText('w3PolarAngleValVisible', deg.toFixed(1));
    w3Attr('w3PolarAxLineVisible', 'x2', ex);
    w3Attr('w3PolarAxLineVisible', 'y2', oy);
    w3Attr('w3PolarAyLineVisible', 'x1', ex);
    w3Attr('w3PolarAyLineVisible', 'y1', oy);
    w3Attr('w3PolarAyLineVisible', 'x2', ex);
    w3Attr('w3PolarAyLineVisible', 'y2', ey);
    w3Attr('w3PolarVecLineVisible', 'x2', ex);
    w3Attr('w3PolarVecLineVisible', 'y2', ey);
    const axVisible = Math.abs(ax) > 0.04 ? 1 : 0;
    const ayVisible = Math.abs(ay) > 0.04 ? 1 : 0;
    w3Attr('w3PolarAxLineVisible', 'opacity', axVisible);
    w3Attr('w3PolarAyLineVisible', 'opacity', ayVisible);
    w3Attr('w3PolarAxLabelVisible', 'opacity', axVisible);
    w3Attr('w3PolarAyLabelVisible', 'opacity', ayVisible);
    w3Attr('w3PolarAxLabelVisible', 'x', (ox + ex) / 2 - 10);
    w3Attr('w3PolarAxLabelVisible', 'y', oy + 22);
    w3Attr('w3PolarAyLabelVisible', 'x', ex + (ax >= 0 ? 10 : -28));
    w3Attr('w3PolarAyLabelVisible', 'y', (oy + ey) / 2 + 5);
    w3Attr('w3PolarVecLabelVisible', 'x', ex + (ax >= 0 ? 10 : -28));
    w3Attr('w3PolarVecLabelVisible', 'y', ey + (ay >= 0 ? -10 : 24));
    w3SetHTML('w3PolarFeedbackVisible', `\\[A_x=A\\cos\\theta=${mag.toFixed(1)}\\cos(${deg.toFixed(1)}^\\circ)=${ax.toFixed(1)}\\] \\[A_y=A\\sin\\theta=${mag.toFixed(1)}\\sin(${deg.toFixed(1)}^\\circ)=${ay.toFixed(1)}\\] \\[\\vec A=${ax.toFixed(1)}\\hat{i}+${ay.toFixed(1)}\\hat{j}\\]`);
}

function updateW3Vector() {
    const A = w3Num('w3Mag', 5),
        deg = w3Num('w3Angle', 35),
        c = w3Num('w3Scalar', 1),
        th = w3Rad(deg);
    const ax = A * Math.cos(th),
        ay = A * Math.sin(th),
        s = 34,
        ox = 460,
        oy = 260;
    const ex = ox + ax * s,
        ey = oy - ay * s,
        sx = ox + c * ax * s,
        sy = oy - c * ay * s;
    w3SetText('w3MagVal', A.toFixed(1));
    w3SetText('w3AngleVal', deg.toFixed(1));
    w3SetText('w3ScalarVal', c.toFixed(1));
    w3Attr('w3VecLine', 'x2', ex);
    w3Attr('w3VecLine', 'y2', ey);
    w3Attr('w3ScaledLine', 'x2', sx);
    w3Attr('w3ScaledLine', 'y2', sy);
    w3Attr('w3ScaledLabel', 'x', sx + 10);
    w3Attr('w3ScaledLabel', 'y', sy - 10);
    w3Attr('w3VecLabel', 'x', ex + 10);
    w3Attr('w3VecLabel', 'y', ey - 10);
    w3SetHTML('w3VectorFeedback2',
        `\\[c\\vec A=(${c})(${ax.toFixed(1)}\\hat{i}+${ay.toFixed(1)}\\hat{j})\\]
    \\[c\\vec A=(${(c*ax).toFixed(1)})\\hat{i}+(${(c*ay).toFixed(1)})\\hat{j}\\]`);
}

function calcW3Magnitude() {
    const ax = w3Num('w3AxInput', 3),
        ay = w3Num('w3AyInput', 4),
        mag = Math.hypot(ax, ay);
    w3SetHTML('w3MagFeedback', `\\[A=\\sqrt{(${ax})^2+(${ay})^2}=${mag.toFixed(3)}\\]`);
}

function updateW3CoordinateFromXY(x, y) {
    const p = w3Pt(x, y, 460, 260, 76, 40);
    w3Attr('w3CoordVector', 'x2', p.X);
    w3Attr('w3CoordVector', 'y2', p.Y);
    w3Attr('w3CoordPoint', 'cx', p.X);
    w3Attr('w3CoordPoint', 'cy', p.Y);
    w3Attr('w3CoordLabel', 'x', p.X + 15);
    w3Attr('w3CoordLabel', 'y', p.Y - 15);
    w3SetText('w3CoordLabel', `(${x.toFixed(1)}, ${y.toFixed(1)})`);
    w3SetHTML('w3CoordFeedback', `\\[\\vec r=${x.toFixed(1)}\\hat{i}+${y.toFixed(1)}\\hat{j}\\ \\mathrm{m}\\]`);
}

function setupW3CoordClick() {
    const svg = document.getElementById('w3CoordSvg');
    if (!svg || svg.dataset.ready === 'true') return;
    svg.dataset.ready = 'true';
    svg.addEventListener('click', e => {
        const rect = svg.getBoundingClientRect();
        const px = (e.clientX - rect.left) * 920 / rect.width;
        const py = (e.clientY - rect.top) * 520 / rect.height;
        const x = (px - 460) / 76,
            y = (260 - py) / 40;
        updateW3CoordinateFromXY(w3Clamp(x, -5, 5), w3Clamp(y, -4, 5));
    });
}

function updateW3Trajectory() {
    const type = document.getElementById('w3TrajType')?.value || 'line',
        t = w3Num('w3TrajT', 2);
    w3SetText('w3TrajTVal', t.toFixed(1));
    const equations = {
        line: '\\[x(t)=1.4t,\\quad y(t)=0.7t+0.5\\]',
        parabola: '\\[x(t)=1.5t,\\quad y(t)=0.9t+1.2-0.16t^2\\]',
        circle: '\\[x(t)=3+2\\cos(1.25t),\\quad y(t)=2.5+2\\sin(1.25t)\\]'
    };
    w3SetHTML('w3TrajEquation', equations[type] || equations.line);
    const pts = [];
    let x = 0,
        y = 0;
    for (let i = 0; i <= 100; i++) {
        const tt = 5 * i / 100;
        let px, py;
        if (type === 'line') {
            px = 1.4 * tt;
            py = 0.7 * tt + 0.5;
        } else if (type === 'circle') {
            px = 3 + 2 * Math.cos(tt * 1.25);
            py = 2.5 + 2 * Math.sin(tt * 1.25);
        } else {
            px = 1.5 * tt;
            py = 0.9 * tt + 1.2 - 0.16 * tt * tt;
        }
        pts.push({ x: px, y: py });
        if (Math.abs(tt - t) < 0.026) {
            x = px;
            y = py;
        }
    }
    if (type === 'line') {
        x = 1.4 * t;
        y = 0.7 * t + 0.5;
    } else if (type === 'circle') {
        x = 3 + 2 * Math.cos(t * 1.25);
        y = 2.5 + 2 * Math.sin(t * 1.25);
    } else {
        x = 1.5 * t;
        y = 0.9 * t + 1.2 - 0.16 * t * t;
    }
    const p = w3Pt(x, y);
    w3Attr('w3TrajPath', 'd', w3Path(pts));
    w3Attr('w3TrajVector', 'x2', p.X);
    w3Attr('w3TrajVector', 'y2', p.Y);
    w3Attr('w3TrajPoint', 'cx', p.X);
    w3Attr('w3TrajPoint', 'cy', p.Y);
    w3Attr('w3TrajLabel', 'x', p.X + 15);
    w3Attr('w3TrajLabel', 'y', p.Y - 12);
    w3SetText('w3TrajLabel', `t=${t.toFixed(1)}s`);
    w3SetHTML('w3TrajFeedback', `\\[\\vec r(${t.toFixed(1)})=${x.toFixed(2)}\\hat{i}+${y.toFixed(2)}\\hat{j}\\ \\mathrm{m}\\]`);
}

function updateW3Displacement() {
    const xi = w3Num('w3Dxi', 1),
        yi = w3Num('w3Dyi', 1),
        xf = w3Num('w3Dxf', 5),
        yf = w3Num('w3Dyf', 3);
    const p1 = w3Pt(xi, yi, 120, 350, 80, 60),
        p2 = w3Pt(xf, yf, 120, 350, 80, 60);
    ['w3DispArrowLine'].forEach(id => {
        w3Attr(id, 'x1', p1.X);
        w3Attr(id, 'y1', p1.Y);
        w3Attr(id, 'x2', p2.X);
        w3Attr(id, 'y2', p2.Y);
    });
    w3Attr('w3DispStart', 'cx', p1.X);
    w3Attr('w3DispStart', 'cy', p1.Y);
    w3Attr('w3DispEnd', 'cx', p2.X);
    w3Attr('w3DispEnd', 'cy', p2.Y);
    const dx = xf - xi,
        dy = yf - yi;
    w3SetHTML('w3DispFeedback', `\\[\\Delta\\vec r=(${xf}-${xi})\\hat{i}+(${yf}-${yi})\\hat{j}=${dx.toFixed(2)}\\hat{i}+${dy.toFixed(2)}\\hat{j}\\ \\mathrm{m},\\quad |\\Delta\\vec r|=${Math.hypot(dx,dy).toFixed(2)}\\ \\mathrm{m}\\]`);
    calcW3AvgVelocity();
}

function calcW3AvgVelocity() {
    const xi = w3Num('w3Dxi', 1),
        yi = w3Num('w3Dyi', 1),
        xf = w3Num('w3Dxf', 5),
        yf = w3Num('w3Dyf', 3),
        ti = w3Num('w3Vti', 0),
        tf = w3Num('w3Vtf', 2);
    const dt = tf - ti,
        fb = document.getElementById('w3AvgVFeedback');
    if (!fb) return;
    if (Math.abs(dt) < 1e-9) { w3SetHTML('w3AvgVFeedback', 'ช่วงเวลาต้องไม่เป็นศูนย์'); return; }
    const vx = (xf - xi) / dt,
        vy = (yf - yi) / dt;
    w3SetHTML('w3AvgVFeedback', `\\[\\vec v_{avg}=\\frac{\\Delta\\vec r}{\\Delta t}=${vx.toFixed(2)}\\hat{i}+${vy.toFixed(2)}\\hat{j}\\ \\mathrm{m/s},\\quad |\\vec v_{avg}|=${Math.hypot(vx,vy).toFixed(2)}\\ \\mathrm{m/s}\\]`);
}

function updateW3Tangent() {
    const t = w3Num('w3TanT', 2);
    w3SetText('w3TanTVal', t.toFixed(2));
    const pts = [];
    for (let i = 0; i <= 100; i++) {
        const tt = 5 * i / 100;
        pts.push({ x: 1.5 * tt, y: 0.9 * tt + 1.2 - 0.16 * tt * tt });
    }
    const x = 1.5 * t,
        y = 0.9 * t + 1.2 - 0.16 * t * t,
        vx = 1.5,
        vy = 0.9 - 0.32 * t;
    const p = w3Pt(x, y, 120, 350, 80, 60);
    w3Attr('w3TanPath', 'd', w3Path(pts, 120, 350, 80, 60));
    w3Attr('w3TanPoint', 'cx', p.X);
    w3Attr('w3TanPoint', 'cy', p.Y);
    w3Attr('w3TanVel', 'x1', p.X);
    w3Attr('w3TanVel', 'y1', p.Y);
    w3Attr('w3TanVel', 'x2', p.X + vx * 55);
    w3Attr('w3TanVel', 'y2', p.Y - vy * 55);
    w3SetHTML('w3TanFeedback', `\\[\\vec v(t)=${vx.toFixed(2)}\\hat{i}+${vy.toFixed(2)}\\hat{j}\\ \\mathrm{m/s},\\quad v=${Math.hypot(vx,vy).toFixed(2)}\\ \\mathrm{m/s}\\]`);
}

function calcW3AvgAcceleration() {
    const vxi = w3Num('w3Vxi', 2),
        vyi = w3Num('w3Vyi', 1),
        vxf = w3Num('w3Vxf', 5),
        vyf = w3Num('w3Vyf', -1),
        dt = w3Num('w3Adt', 2);
    if (Math.abs(dt) < 1e-9) { w3SetHTML('w3AvgAFeedback', 'ช่วงเวลาต้องไม่เป็นศูนย์'); return; }
    const ax = (vxf - vxi) / dt,
        ay = (vyf - vyi) / dt;
    w3SetHTML('w3AvgAFeedback', `\\[\\vec a_{avg}=\\frac{\\Delta\\vec v}{\\Delta t}=${ax.toFixed(2)}\\hat{i}+${ay.toFixed(2)}\\hat{j}\\ \\mathrm{m/s^2},\\quad |\\vec a_{avg}|=${Math.hypot(ax,ay).toFixed(2)}\\ \\mathrm{m/s^2}\\]`);
}

function updateW3Const2D() {
    const vx = w3Num('w3Cvx', 2),
        vy = w3Num('w3Cvy', 4),
        ax = w3Num('w3Cax', 1),
        ay = w3Num('w3Cay', 0),
        t = w3Num('w3Ct', 2);
    w3SetText('w3CtVal', t.toFixed(1));
    const pts = [];
    for (let i = 0; i <= 100; i++) {
        const tt = 5 * i / 100;
        pts.push({ x: vx * tt + 0.5 * ax * tt * tt, y: vy * tt + 0.5 * ay * tt * tt });
    }
    const x = vx * t + 0.5 * ax * t * t,
        y = vy * t + 0.5 * ay * t * t,
        vxt = vx + ax * t,
        vyt = vy + ay * t,
        p = w3Pt(x, y, 120, 420, 50, 35);
    w3Attr('w3ConstPath', 'd', w3Path(pts, 120, 420, 50, 35));
    w3Attr('w3ConstPoint', 'cx', p.X);
    w3Attr('w3ConstPoint', 'cy', p.Y);
    const origin = { X: 120, Y: 420 },
        vScale = 18,
        aScale = 28;
    w3Attr('w3ConstPosVec', 'x1', origin.X);
    w3Attr('w3ConstPosVec', 'y1', origin.Y);
    w3Attr('w3ConstPosVec', 'x2', p.X);
    w3Attr('w3ConstPosVec', 'y2', p.Y);
    w3Attr('w3ConstVelVec', 'x1', p.X);
    w3Attr('w3ConstVelVec', 'y1', p.Y);
    w3Attr('w3ConstVelVec', 'x2', p.X + vxt * vScale);
    w3Attr('w3ConstVelVec', 'y2', p.Y - vyt * vScale);
    w3Attr('w3ConstAccVec', 'x1', p.X);
    w3Attr('w3ConstAccVec', 'y1', p.Y);
    w3Attr('w3ConstAccVec', 'x2', p.X + ax * aScale);
    w3Attr('w3ConstAccVec', 'y2', p.Y - ay * aScale);
    w3Attr('w3ConstPosLabel', 'x', (origin.X + p.X) / 2 + 10);
    w3Attr('w3ConstPosLabel', 'y', (origin.Y + p.Y) / 2 - 10);
    w3Attr('w3ConstVelLabel', 'x', p.X + vxt * vScale + 10);
    w3Attr('w3ConstVelLabel', 'y', p.Y - vyt * vScale - 10);
    w3Attr('w3ConstAccLabel', 'x', p.X + ax * aScale + 10);
    w3Attr('w3ConstAccLabel', 'y', p.Y - ay * aScale + 22);
    w3SetHTML('w3ConstFeedback',
        `\\[\\vec r(${t.toFixed(1)})=(${x.toFixed(2)})\\hat{i}+(${y.toFixed(2)})\\hat{j}\\ \\mathrm{m}\\]
     \\[\\vec v(${t.toFixed(1)})=(${vxt.toFixed(2)})\\hat{i}+(${vyt.toFixed(2)})\\hat{j}\\ \\mathrm{m/s},\\]
     \\[\\vec a=(${ax.toFixed(2)})\\hat{i}+(${ay.toFixed(2)})\\hat{j}\\ \\mathrm{m/s^2}\\]`);
}

function updateW3Projectile() {
    const v = w3Num('w3PVel', 20),
        deg = w3Num('w3PAngle', 45),
        t = w3Num('w3PT', 1),
        g = 9.8,
        th = w3Rad(deg);
    w3SetText('w3PVelVal', v.toFixed(0));
    w3SetText('w3PAngleVal', deg.toFixed(0));
    const R = v * v * Math.sin(2 * th) / g,
        H = v * v * Math.sin(th) ** 2 / (2 * g),
        T = 2 * v * Math.sin(th) / g;
    document.getElementById('w3PT').max = Math.max(1, T).toFixed(2);
    const tt = Math.min(t, T);
    w3SetText('w3PTVal', tt.toFixed(2));
    const pts = [];
    for (let i = 0; i <= 120; i++) {
        const u = T * i / 120;
        pts.push({ x: v * Math.cos(th) * u, y: v * Math.sin(th) * u - 0.5 * g * u * u });
    }
    const x = v * Math.cos(th) * tt,
        y = Math.max(0, v * Math.sin(th) * tt - 0.5 * g * tt * tt),
        sx = Math.min(700 / Math.max(R, 1), 55),
        sy = sx,
        p = w3Pt(x, y, 120, 420, sx, sy);
    w3Attr('w3ProjPath', 'd', w3Path(pts, 120, 420, sx, sy));
    w3Attr('w3ProjPoint', 'cx', p.X);
    w3Attr('w3ProjPoint', 'cy', p.Y);
    w3Attr('w3ProjVel', 'x1', p.X);
    w3Attr('w3ProjVel', 'y1', p.Y);
    w3Attr('w3ProjVel', 'x2', p.X + v * Math.cos(th) * 2);
    w3Attr('w3ProjVel', 'y2', p.Y - (v * Math.sin(th) - g * tt) * 2);
    w3Attr('w3ProjG', 'x1', p.X);
    w3Attr('w3ProjG', 'y1', p.Y);
    w3Attr('w3ProjG', 'x2', p.X);
    w3Attr('w3ProjG', 'y2', p.Y + 55);
    w3Attr('w3ProjLabel', 'x', p.X + 15);
    w3Attr('w3ProjLabel', 'y', p.Y - 15);
    w3SetHTML('w3ProjFeedback', `\\[v_{0x}=${(v*Math.cos(th)).toFixed(2)}\\ \\mathrm{m/s},\\quad v_{0y}=${(v*Math.sin(th)).toFixed(2)}\\ \\mathrm{m/s},\\quad R=${R.toFixed(2)}\\ \\mathrm{m},\\quad H=${H.toFixed(2)}\\ \\mathrm{m}\\]`);
}

function calcW3LongJump() {
    const v = w3Num('w3LongV', 9),
        deg = w3Num('w3LongTheta', 35),
        g = 9.8,
        th = w3Rad(deg),
        R = v * v * Math.sin(2 * th) / g,
        H = v * v * Math.sin(th) ** 2 / (2 * g);
    w3SetHTML('w3LongFeedback', `\\[R=\\frac{${v.toFixed(1)}^2\\sin(${2*deg}^\\circ)}{9.8}=${R.toFixed(2)}\\ \\mathrm{m},\\quad H=\\frac{${v.toFixed(1)}^2\\sin^2(${deg}^\\circ)}{2(9.8)}=${H.toFixed(2)}\\ \\mathrm{m}\\]`);
}

function initWeek3() {
    w3Grid('w3VectorGrid', { x0: 460, y0: 260, sx: 34, sy: 34, xMin: -11, xMax: 11, yMin: -6, yMax: 5 });
    w3Grid('w3TrajGrid');
    w3Grid('w3AddGrid', { x0: 460, y0: 260, sx: 20, sy: 20, xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
    w3Grid('w3UnitGrid', { x0: 460, y0: 210, sx: 32, sy: 32, xMin: -5, xMax: 5, yMin: -5, yMax: 5 });
    w3Grid('w3PolarGridVisible', { x0: 460, y0: 210, sx: 32, sy: 32, xMin: -5, xMax: 5, yMin: -5, yMax: 5 });
    w3Grid('w3DispGrid', { x0: 120, y0: 350, sx: 80, sy: 60, xMin: 0, xMax: 8, yMin: 0, yMax: 5 });
    w3Grid('w3CoordGrid', { x0: 460, y0: 260, sx: 76, sy: 40, xMin: -5, xMax: 5, yMin: -5, yMax: 5 });
    setupW3CoordClick();
    updateW3VectorAddition();
    updateW3UnitVector();
    updateW3PolarVector();
    updateW3Vector();
    calcW3Magnitude();
    updateW3CoordinateFromXY(2.5, 2.0);
    updateW3Trajectory();
    updateW3Displacement();
    updateW3Tangent();
    calcW3AvgAcceleration();
    updateW3Const2D();
    updateW3Projectile();
    calcW3LongJump();
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof initWeek3 === 'function') initWeek3();
});

