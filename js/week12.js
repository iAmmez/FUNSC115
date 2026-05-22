const w12 = id => document.getElementById(id);
const w12Num = id => Number(w12(id)?.value || 0);
const w12Set = (id, value) => { const el = w12(id); if (el) el.textContent = value; };
const w12Fmt = (value, digits = 2) => Number(value).toFixed(digits);
let w12AstroAngle = 0;
let w12AstroLastTime = 0;
let w12AstroCycleTime = 0;
let w12AstroPlaying = false;
let w12AstroFrame = null;

function w12Math(element) {
  if (typeof renderMath === 'function') renderMath(element || document.body);
}

function w12AstroProgress() {
  const holdSeconds = 2;
  const moveSeconds = 2;
  const cycleSeconds = (holdSeconds + moveSeconds) * 2;
  const t = ((w12AstroCycleTime % cycleSeconds) + cycleSeconds) % cycleSeconds;
  const smooth = p => 0.5 - 0.5 * Math.cos(Math.PI * p);

  if (t < holdSeconds) return 0;
  if (t < holdSeconds + moveSeconds) return smooth((t - holdSeconds) / moveSeconds);
  if (t < holdSeconds * 2 + moveSeconds) return 1;
  return 1 - smooth((t - (holdSeconds * 2 + moveSeconds)) / moveSeconds);
}

function w12UpdateAstronauts(renderMathDetails = true) {
  const mass = w12Num('w12AstroMass');
  const length1 = w12Num('w12AstroLength1');
  const length2Input = w12('w12AstroLength2');
  const length2 = Math.min(w12Num('w12AstroLength2'), length1);
  const v1 = w12Num('w12AstroV1');
  const r1 = length1 / 2;
  const r2 = length2 / 2;
  const I1 = 2 * mass * r1 * r1;
  const I2 = 2 * mass * r2 * r2;
  const omega1 = v1 / r1;
  const L = I1 * omega1;
  const omega2 = L / I2;
  const v2 = omega2 * r2;
  const K1 = 0.5 * I1 * omega1 * omega1;
  const K2 = 0.5 * I2 * omega2 * omega2;

  if (length2Input && Number(length2Input.value) !== length2) length2Input.value = length2;
  w12Set('w12AstroMassVal', mass.toFixed(0));
  w12Set('w12AstroLength1Val', length1.toFixed(1));
  w12Set('w12AstroLength2Val', length2.toFixed(1));
  w12Set('w12AstroV1Val', v1.toFixed(2));

  const feedback = w12('w12AstroFeedback');
  if (feedback && renderMathDetails) {
    feedback.innerHTML = `
      \\(I_i=${w12Fmt(I1, 1)}\\ \\mathrm{kg\\cdot m^2}\\), \\(I_f=${w12Fmt(I2, 1)}\\ \\mathrm{kg\\cdot m^2}\\)<br>
      \\(L_i=L_f=${w12Fmt(L, 1)}\\ \\mathrm{kg\\cdot m^2/s}\\)<br>
      \\(v_f=${w12Fmt(v2, 2)}\\ \\mathrm{m/s}\\)
    `;
    w12Math(feedback);
  }

  const steps = w12('w12AstroSteps');
  if (steps && renderMathDetails) {
    steps.innerHTML = `
      <h3>วิธีคำนวณ</h3>
      <p>เนื่องจากแรงบิดภายนอกสุทธิเป็นศูนย์ จึงใช้ \\(L_i=L_f\\)</p>
      \\[
        r_i=\\frac{d_i}{2}=\\frac{${w12Fmt(length1, 1)}}{2}=${w12Fmt(r1, 2)}\\ \\mathrm{m},
        \\quad
        r_f=\\frac{d_f}{2}=\\frac{${w12Fmt(length2, 1)}}{2}=${w12Fmt(r2, 2)}\\ \\mathrm{m}
      \\]
      \\[
        I_i=2mr_i^2=2(${w12Fmt(mass, 0)})(${w12Fmt(r1, 2)})^2=${w12Fmt(I1, 2)}\\ \\mathrm{kg\\cdot m^2}
      \\]
      \\[
        \\omega_i=\\frac{v_i}{r_i}=\\frac{${w12Fmt(v1, 2)}}{${w12Fmt(r1, 2)}}=${w12Fmt(omega1, 3)}\\ \\mathrm{rad/s}
      \\]
      \\[
        L_i=I_i\\omega_i=${w12Fmt(I1, 2)}(${w12Fmt(omega1, 3)})=${w12Fmt(L, 2)}\\ \\mathrm{kg\\cdot m^2/s}
      \\]
      \\[
        I_f=2mr_f^2=2(${w12Fmt(mass, 0)})(${w12Fmt(r2, 2)})^2=${w12Fmt(I2, 2)}\\ \\mathrm{kg\\cdot m^2}
      \\]
      \\[
        \\omega_f=\\frac{L_f}{I_f}=\\frac{${w12Fmt(L, 2)}}{${w12Fmt(I2, 2)}}=${w12Fmt(omega2, 3)}\\ \\mathrm{rad/s}
      \\]
      \\[
        \\boxed{v_f=\\omega_f r_f=${w12Fmt(omega2, 3)}(${w12Fmt(r2, 2)})=${w12Fmt(v2, 2)}\\ \\mathrm{m/s}}
      \\]
    `;
    w12Math(steps);
  }

  const svg = w12('w12AstronautSvg');
  if (!svg) return;
  const cx = 320, cy = 180;
  const scale = 17;
  const progress = w12AstroProgress();
  const liveR = r1 + (r2 - r1) * progress;
  const liveI = 2 * mass * liveR * liveR;
  const liveOmega = L / liveI;
  const R1 = r1 * scale;
  const R2 = r2 * scale;
  const R = liveR * scale;
  const x1 = cx + R * Math.cos(w12AstroAngle);
  const y1 = cy - R * Math.sin(w12AstroAngle);
  const x2 = cx + R * Math.cos(w12AstroAngle + Math.PI);
  const y2 = cy - R * Math.sin(w12AstroAngle + Math.PI);
  const tx1 = x1 - Math.sin(w12AstroAngle) * 48;
  const ty1 = y1 - Math.cos(w12AstroAngle) * 48;
  const tx2 = x2 + Math.sin(w12AstroAngle) * 48;
  const ty2 = y2 + Math.cos(w12AstroAngle) * 48;
  svg.innerHTML = `
    <line x1="80" y1="${cy}" x2="560" y2="${cy}" class="w12-axis w12-dash"/>
    <line x1="${cx}" y1="42" x2="${cx}" y2="318" class="w12-axis w12-dash"/>
    <circle cx="${cx}" cy="${cy}" r="8" fill="#111827"/>
    <circle cx="${cx}" cy="${cy}" r="${R1}" fill="none" stroke="#bfdbfe" stroke-width="4"/>
    <circle cx="${cx}" cy="${cy}" r="${R2}" fill="none" stroke="#bbf7d0" stroke-width="4"/>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="w12-rope"/>
    <circle cx="${x1}" cy="${y1}" r="19" class="w12-body-alt"/>
    <circle cx="${x2}" cy="${y2}" r="19" class="w12-body-alt"/>
    <line x1="${x1}" y1="${y1}" x2="${tx1}" y2="${ty1}" class="w12-green-vector"/>
    <line x1="${x2}" y1="${y2}" x2="${tx2}" y2="${ty2}" class="w12-green-vector"/>
    <text x="430" y="76" class="w12-text">r = ${w12Fmt(liveR, 2)} m</text>
    <text x="430" y="104" class="w12-text">ω = ${w12Fmt(liveOmega, 2)} rad/s</text>
    <text x="${cx}" y="30" text-anchor="middle" class="w12-text">ไม่มีแรงบิดภายนอก</text>
    <text x="${cx}" y="340" text-anchor="middle" class="w12-small">วงสีฟ้า = ก่อนดึงเชือก, วงสีเขียว = หลังดึงเชือก</text>
  `;
}

function w12AnimateAstronauts(time = 0) {
  if (!w12AstroPlaying) return;
  const mass = w12Num('w12AstroMass');
  const length1 = w12Num('w12AstroLength1');
  const length2 = Math.min(w12Num('w12AstroLength2'), length1);
  const v1 = w12Num('w12AstroV1');
  const r1 = length1 / 2;
  const r2 = length2 / 2;
  const dt = w12AstroLastTime ? Math.min(0.04, (time - w12AstroLastTime) / 1000) : 0.016;
  w12AstroLastTime = time;
  w12AstroCycleTime += dt;
  const progress = w12AstroProgress();
  const liveR = Math.max(0.1, r1 + (r2 - r1) * progress);
  const L = 2 * mass * r1 * v1;
  const liveOmega = L / (2 * mass * liveR * liveR);
  w12AstroAngle += liveOmega * dt;
  w12UpdateAstronauts(false);
  if (w12AstroPlaying) w12AstroFrame = requestAnimationFrame(w12AnimateAstronauts);
}

function w12ToggleAstronautAnimation() {
  w12AstroPlaying = !w12AstroPlaying;
  const button = w12('w12AstroPlayBtn');
  if (button) button.textContent = w12AstroPlaying ? 'หยุด animation' : 'เริ่ม animation';
  if (w12AstroPlaying) {
    w12AstroLastTime = 0;
    w12AstroFrame = requestAnimationFrame(w12AnimateAstronauts);
  } else if (w12AstroFrame) {
    cancelAnimationFrame(w12AstroFrame);
    w12AstroFrame = null;
  }
}

function w12UpdateEnergy() {
  const tau = w12Num('w12Torque');
  const angle = w12Num('w12Angle');
  const inertia = w12Num('w12Inertia');
  const omegaI = w12Num('w12OmegaI');
  const work = tau * angle;
  const kI = 0.5 * inertia * omegaI * omegaI;
  const kF = kI + work;
  const omegaF = Math.sqrt((2 * kF) / inertia);

  w12Set('w12TorqueVal', tau.toFixed(0));
  w12Set('w12AngleVal', angle.toFixed(1));
  w12Set('w12InertiaVal', inertia.toFixed(1));
  w12Set('w12OmegaIVal', omegaI.toFixed(1));

  const feedback = w12('w12EnergyFeedback');
  if (feedback) {
    feedback.innerHTML = `
      \\(W=\\tau\\Delta\\theta=${w12Fmt(work, 1)}\\ \\mathrm{J}\\)<br>
      \\(K_f=${w12Fmt(kF, 1)}\\ \\mathrm{J}\\)<br>
      \\(\\omega_f=${w12Fmt(omegaF, 2)}\\ \\mathrm{rad/s}\\)
    `;
    w12Math(feedback);
  }

  const svg = w12('w12EnergySvg');
  if (!svg) return;
  const max = Math.max(kF, work, 1);
  const h1 = Math.max(8, 180 * kI / max);
  const h2 = Math.max(8, 180 * work / max);
  const h3 = Math.max(8, 180 * kF / max);
  svg.innerHTML = `
    <circle cx="160" cy="150" r="82" class="w12-shape"/>
    <path d="M244 150 A84 84 0 0 1 160 234" fill="none" class="w12-vector"/>
    <line x1="160" y1="150" x2="226" y2="100" class="w12-force"/>
    <text x="118" y="154" class="w12-text">I</text>
    <text x="232" y="92" class="w12-text">τ</text>
    <rect x="355" y="${290 - h1}" width="58" height="${h1}" class="w12-bar-energy"/>
    <rect x="445" y="${290 - h2}" width="58" height="${h2}" class="w12-bar-work"/>
    <rect x="535" y="${290 - h3}" width="58" height="${h3}" class="w12-bar-energy"/>
    <line x1="330" y1="290" x2="610" y2="290" class="w12-axis"/>
    <text x="384" y="320" text-anchor="middle" class="w12-small">Kᵢ</text>
    <text x="474" y="320" text-anchor="middle" class="w12-small">W</text>
    <text x="564" y="320" text-anchor="middle" class="w12-small">Kᶠ</text>
    <text x="318" y="52" class="w12-text">งานของแรงบิดเพิ่มพลังงานการหมุน</text>
  `;
}

function w12UpdateYoung() {
  const force = w12Num('w12YoungForce');
  const length = w12Num('w12YoungLength');
  const diameterMm = w12Num('w12YoungDiameter');
  const modulusGPa = w12Num('w12YoungModulus');
  const area = Math.PI * Math.pow(diameterMm / 1000, 2) / 4;
  const modulus = modulusGPa * 1e9;
  const stress = force / area;
  const delta = force * length / (area * modulus); // meters
  const strain = delta / length;

  w12Set('w12YoungForceVal', force.toFixed(0));
  w12Set('w12YoungLengthVal', length.toFixed(1));
  w12Set('w12YoungDiameterVal', diameterMm.toFixed(1));
  w12Set('w12YoungModulusVal', modulusGPa.toFixed(0));
  w12Set('w12YoungAmpVal', (w12Num('w12YoungAmp') || 1).toFixed(0));

  const feedback = w12('w12YoungFeedback');
  if (feedback) {
    feedback.innerHTML = `
      \\(A=${area.toExponential(2)}\\ \\mathrm{m^2}\\)<br>
      \\(\\Delta L=${(delta * 100).toFixed(4)}\\ \\mathrm{cm}\\)<br>
      \\(\\mathrm{strain}=${strain.toExponential(2)}\\)
    `;
    w12Math(feedback);
  }

  const svg = w12('w12YoungSvg');
  if (!svg) return;
  // map length (m) to pixels so max fits canvas
  const canvasW = 640, canvasH = 260;
  const marginLeft = 100, marginRight = 80;
  const maxDrawable = canvasW - marginLeft - marginRight;
  const lengthPx = Math.min(maxDrawable, 60 + (length / 20) * (maxDrawable - 60));
  const pxPerMeter = lengthPx / Math.max(0.0001, length);
  const startX = marginLeft;
  const baseY = 130;
  const barHeight = Math.max(8, Math.round(diameterMm * 1.6));
  const endX = startX + lengthPx;
  // exact mapping: physical ΔL (m) -> pixels, scaled by visual amplification
  const amp = Math.max(1, Number(w12('w12YoungAmp')?.value || 1));
  let stretchPx = delta * pxPerMeter * amp;
  // clamp to reasonable display bounds
  stretchPx = Math.max(0, Math.min(maxDrawable * 2, stretchPx));
  const finalX = endX + stretchPx;

  // arrow sizing based on force (0..10000 N)
  const arrowLen = Math.min(260, 24 + (force / 10000) * 220);
  const strokeW = Math.max(2, 2 + (force / 10000) * 18);

  // color intensity from modulus: higher modulus -> darker fill
  const lightness = 82 - ((modulusGPa - 50) / 200) * 48; // ~82 -> ~34
  const fillColor = `hsl(210,90% , ${Math.max(28, Math.min(82, lightness))}%)`;
  const strokeColor = `hsl(210,90% , ${Math.max(18, Math.min(60, lightness - 28))}%)`;

  // draw original bar and overlay stretched portion (ΔL) as distinct rectangle
  const stretchColor = '#fb923c'; // orange for stretched part
  svg.innerHTML = `
    <rect x="${startX - 20}" y="${baseY - 60}" width="40" height="120" fill="#cbd5e1"/>
    <!-- original (unstressed) bar -->
    <rect x="${startX}" y="${baseY - barHeight / 2}" width="${lengthPx}" height="${barHeight}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="3"/>
    <!-- stretched extra portion ΔL -->
    <rect x="${endX}" y="${baseY - barHeight / 2}" width="${stretchPx}" height="${barHeight}" fill="${stretchColor}" stroke="${strokeColor}" stroke-width="2"/>
    <!-- arrow showing applied force (tail at end of stretched portion) -->
    <line x1="${finalX}" y1="${baseY}" x2="${finalX + arrowLen}" y2="${baseY}" stroke-width="${strokeW}" class="w12-force" style="stroke:#dc2626;"/>
    <!-- baseline and ticks -->
    <line x1="${startX}" y1="${baseY + 60}" x2="${finalX}" y2="${baseY + 60}" class="w12-axis"/>
    <line x1="${endX}" y1="${baseY + 54}" x2="${endX}" y2="${baseY + 66}" class="w12-axis"/>
    <line x1="${finalX}" y1="${baseY + 54}" x2="${finalX}" y2="${baseY + 66}" class="w12-axis"/>
    <!-- labels -->
    <text x="${startX + lengthPx / 2}" y="${baseY + 84}" text-anchor="middle" class="w12-small">Lᵢ = ${w12Fmt(length,1)} m</text>
    <text x="${endX + stretchPx / 2}" y="${baseY - barHeight - 8}" text-anchor="middle" class="w12-text">ΔL = ${(delta*100).toFixed(2)} cm</text>
    <text x="${finalX + arrowLen + 6}" y="${baseY - 6}" class="w12-text">F</text>
  `;
}

function w12UpdateShearLegacy() {
  const force = w12Num('w12ShearForce');
  const area = w12Num('w12ShearArea');
  const height = w12Num('w12ShearHeight');
  const modulusGPa = w12Num('w12ShearModulus');
  const stress = force / area;
  const strain = stress / (modulusGPa * 1e9);
  const deltaX = strain * height;

  w12Set('w12ShearForceVal', force.toFixed(0));
  w12Set('w12ShearAreaVal', area.toFixed(2));
  w12Set('w12ShearHeightVal', height.toFixed(2));
  w12Set('w12ShearModulusVal', modulusGPa.toFixed(1));

  const feedback = w12('w12ShearFeedback');
  if (feedback) {
    feedback.innerHTML = `
      \\(\\mathrm{stress}=F/A=${stress.toFixed(2)}\\ \\mathrm{Pa}\\)<br>
      \\(\\Delta x=${(deltaX * 1e6).toFixed(3)}\\ \\mathrm{\\mu m}\\)<br>
      \\(\\Delta x/h=${strain.toFixed(2)}\\)
    `;
    w12Math(feedback);
  }

  const svg = w12('w12ShearSvg');
  if (!svg) return;
  const shear = Math.min(130, deltaX * 3e7 + 18);
  const p = [
    [190, 260],
    [430, 260],
    [430 + shear, 95],
    [190 + shear, 95]
  ];
  svg.innerHTML = `
    <polygon points="${p.map(point => point.join(',')).join(' ')}" class="w12-stressed"/>
    <line x1="160" y1="260" x2="470" y2="260" class="w12-axis"/>
    <line x1="${190 + shear}" y1="95" x2="${285 + shear}" y2="95" class="w12-force"/>
    <line x1="190" y1="260" x2="${190 + shear}" y2="95" class="w12-axis w12-dash"/>
    <line x1="150" y1="260" x2="150" y2="95" class="w12-axis"/>
    <text x="112" y="184" class="w12-text">h</text>
    <text x="${235 + shear / 2}" y="78" class="w12-text">Δx</text>
    <text x="${290 + shear}" y="78" class="w12-text">F</text>
  `;
}

function w12ShearCalcValues() {
  const force = w12Num('w12ShearForce');
  const area = w12Num('w12ShearArea');
  const height = w12Num('w12ShearHeight');
  const modulusGPa = w12Num('w12ShearModulus');
  const stress = force / area;
  const strain = stress / (modulusGPa * 1e9);
  const deltaX = strain * height;

  return { force, area, height, modulusGPa, stress, strain, deltaX };
}

function w12ShearStepsHtml(values) {
  const { force, area, height, modulusGPa, stress, strain, deltaX } = values;
  return `
    <h3>วิธีคำนวณ (Shear modulus)</h3>
    <p>1. หาความเค้นเฉือนจาก \\(\\text{stress}=F/A\\)</p>
    <p>\\(\\text{stress}=\\dfrac{${force.toFixed(0)}}{${area.toFixed(2)}}=${stress.toFixed(0)}\\ \\mathrm{Pa}\\)</p>
    <p>2. ใช้ \\(S = \\frac{F/A}{Δx/h}\\) จึงได้ความเครียดเฉือน \\(\\Delta x/h=\\frac{F/A}{S}\\)</p>
    <p>\\(\\Delta x/h=\\dfrac{${stress.toFixed(0)}}{${modulusGPa.toFixed(1)}\\times10^9}=${strain.toFixed(8)}\\)</p>
    <p>3. \\(\\Delta x=${strain.toFixed(8)}\\times ${height.toFixed(2)}=${(deltaX * 1e6).toFixed(3)}\\ \\mathrm{\\mu m}\\)</p>
  `;
}

function w12UpdateShear() {
  const values = w12ShearCalcValues();
  const { force, area, height, modulusGPa, stress, strain, deltaX } = values;

  w12Set('w12ShearForceVal', force.toFixed(0));
  w12Set('w12ShearAreaVal', area.toFixed(2));
  w12Set('w12ShearHeightVal', height.toFixed(2));
  w12Set('w12ShearModulusVal', modulusGPa.toFixed(1));

  const feedback = w12('w12ShearFeedback');
  if (feedback) {
    feedback.innerHTML = `
      \\(\\mathrm{stress}=F/A=${stress.toFixed(0)}\\ \\mathrm{Pa}\\)<br>
      \\(\\Delta x=${(deltaX * 1e6).toFixed(2)}\\ \\mathrm{\\mu m}\\)<br>
      \\(\\Delta x/h=${strain.toFixed(8)}\\)
    `;
    w12Math(feedback);
  }

  const steps = w12('w12ShearSteps');
  if (steps && !steps.hasAttribute('hidden')) {
    steps.innerHTML = w12ShearStepsHtml(values);
    w12Math(steps);
  }

  const svg = w12('w12ShearSvg');
  if (!svg) return;
  const areaRatio = (area - 0.01) / 0.19;
  const heightRatio = (height - 0.10) / 0.90;
  const modulusRatio = (modulusGPa - 0.5) / 79.5;
  const forceRatio = force / 2000;
  const blockWidth = 170 + areaRatio * 150;
  const blockHeight = 105 + heightRatio * 135;
  const left = 160;
  const bottom = 292;
  const top = bottom - blockHeight;
  const maxDeltaX = (2000 / 0.01) / (0.5 * 1e9) * 1.00;
  const shear = Math.min(150, (deltaX / maxDeltaX) * 150);
  const right = left + blockWidth;
  const arrowLen = force > 0 ? 36 + forceRatio * 132 : 0;
  const forceStroke = force > 0 ? 3 + forceRatio * 8 : 0;
  const fillLightness = 88 - modulusRatio * 38;
  const fillColor = `hsl(8 82% ${fillLightness}%)`;
  const labelX = Math.min(right + shear + 16, 490);
  const p = [
    [left, bottom],
    [right, bottom],
    [right + shear, top],
    [left + shear, top]
  ];
  svg.innerHTML = `
    <rect x="${left}" y="${top}" width="${blockWidth}" height="${blockHeight}" fill="none" class="w12-axis w12-dash"/>
    <polygon points="${p.map(point => point.join(',')).join(' ')}" class="w12-stressed" style="fill:${fillColor}"/>
    <line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" class="w12-axis"/>
    <line x1="${left - 18}" y1="${bottom}" x2="${left - 18}" y2="${top}" class="w12-axis"/>
    ${force > 0 ? `<line x1="${left + shear}" y1="${top - 20}" x2="${left + shear + arrowLen}" y2="${top - 20}" class="w12-force" style="stroke-width:${forceStroke}"/>
    <line x1="${right}" y1="${bottom + 22}" x2="${Math.max(left + 18, right - arrowLen)}" y2="${bottom + 22}" class="w12-force" style="stroke-width:${forceStroke}"/>` : ''}
    <line x1="${left}" y1="${bottom}" x2="${left + shear}" y2="${top}" class="w12-axis w12-dash"/>
    <line x1="${left}" y1="${top - 42}" x2="${left + shear}" y2="${top - 42}" class="w12-vector"/>
    <text x="${left - 56}" y="${top + blockHeight / 2 + 6}" class="w12-text">h</text>
    <text x="${left + shear / 2 - 6}" y="${top - 50}" class="w12-text">Δx</text>
    <text x="${left + shear + arrowLen + 10}" y="${top - 15}" class="w12-text">F</text>
    <text x="${left + blockWidth / 2}" y="${bottom + 54}" text-anchor="middle" class="w12-small">A = ${area.toFixed(2)} m²</text>
    <text x="${labelX}" y="${top + 24}" class="w12-small">S = ${modulusGPa.toFixed(1)} GPa</text>
    <text x="${labelX}" y="${top + 46}" class="w12-small">Δx = ${(deltaX * 1e6).toFixed(3)} μm</text>
  `;
}

function w12UpdateBulkLegacy() {
  const pressureMPa = w12Num('w12BulkPressure');
  const volume = w12Num('w12BulkVolume');
  const modulusGPa = w12Num('w12BulkModulus');
  const deltaV = -(pressureMPa * 1e6) * volume / (modulusGPa * 1e9);
  const percent = Math.abs(deltaV / volume * 100);

  w12Set('w12BulkPressureVal', pressureMPa.toFixed(0));
  w12Set('w12BulkVolumeVal', volume.toFixed(3));
  w12Set('w12BulkModulusVal', modulusGPa.toFixed(0));

  const feedback = w12('w12BulkFeedback');
  if (feedback) {
    feedback.innerHTML = `
      \\(\\Delta V=${deltaV.toExponential(3)}\\ \\mathrm{m^3}\\)<br>
      ปริมาตรลดลงประมาณ \\(${w12Fmt(percent, 3)}\\%\\)
    `;
    w12Math(feedback);
  }

  const svg = w12('w12BulkSvg');
  if (!svg) return;
  const shrink = Math.min(70, percent * 20 + 12);
  const x = 230 + shrink / 2;
  const y = 95 + shrink / 2;
  const size = 180 - shrink;
  svg.innerHTML = `
    <rect x="230" y="95" width="180" height="180" rx="10" fill="#dbeafe" stroke="#93c5fd" stroke-width="3" stroke-dasharray="9 7"/>
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="10" class="w12-stressed"/>
    <line x1="320" y1="38" x2="320" y2="${y - 8}" class="w12-force"/>
    <line x1="320" y1="332" x2="320" y2="${y + size + 8}" class="w12-force"/>
    <line x1="160" y1="185" x2="${x - 8}" y2="185" class="w12-force"/>
    <line x1="480" y1="185" x2="${x + size + 8}" y2="185" class="w12-force"/>
    <text x="280" y="62" class="w12-text">ΔP</text>
    <text x="248" y="304" class="w12-small">เส้นประ = ปริมาตรเริ่มต้น</text>
  `;
}

function w12BulkCalcValues() {
  const pressureMPa = w12Num('w12BulkPressure');
  const volume = w12Num('w12BulkVolume');
  const modulusGPa = w12Num('w12BulkModulus');
  const deltaV = -(pressureMPa * 1e6) * volume / (modulusGPa * 1e9);
  const percent = Math.abs(deltaV / volume * 100);

  return { pressureMPa, volume, modulusGPa, deltaV, percent };
}

function w12BulkStepsHtml(values) {
  const { pressureMPa, volume, modulusGPa, deltaV, percent } = values;
  return `
    <h3>🧮 วิธีคำนวณ (Bulk modulus)</h3>
    <p>📌 1. ใช้สมการ \\(B=-\\dfrac{\\Delta P}{\\Delta V/V_i}\\)</p>
    <p>🔁 2. จัดรูปหา \\(\\Delta V\\): \\(\\Delta V=-\\dfrac{\\Delta P V_i}{B}\\)</p>
    <p>\\(\\Delta V=-\\dfrac{${pressureMPa.toFixed(0)}\\times10^6 \\times ${volume.toFixed(3)}}{${modulusGPa.toFixed(0)}\\times10^9}=${deltaV.toExponential(3)}\\ \\mathrm{m^3}\\)</p>
    <p>📉 3. อัตราส่วนปริมาตรที่ลดลง \\(\\left|\\Delta V\\right|/V_i\\times100=${w12Fmt(percent, 3)}\\%\\)</p>
    <p>✅ ปริมาตรสุดท้าย \\(V_f=V_i+\\Delta V=${(volume + deltaV).toFixed(6)}\\ \\mathrm{m^3}\\)</p>
  `;
}

function w12UpdateBulk() {
  const values = w12BulkCalcValues();
  const { pressureMPa, volume, modulusGPa, deltaV, percent } = values;

  w12Set('w12BulkPressureVal', pressureMPa.toFixed(0));
  w12Set('w12BulkVolumeVal', volume.toFixed(3));
  w12Set('w12BulkModulusVal', modulusGPa.toFixed(0));

  const feedback = w12('w12BulkFeedback');
  if (feedback) {
    feedback.innerHTML = `
      📉 \\(\\Delta V=${deltaV.toExponential(3)}\\ \\mathrm{m^3}\\)<br>
      🧊 ปริมาตรลดลงประมาณ \\(${w12Fmt(percent, 3)}\\%\\)<br>
      ✅ \\(V_f=${(volume + deltaV).toFixed(6)}\\ \\mathrm{m^3}\\)
    `;
    w12Math(feedback);
  }

  const steps = w12('w12BulkSteps');
  if (steps && !steps.hasAttribute('hidden')) {
    steps.innerHTML = w12BulkStepsHtml(values);
    w12Math(steps);
  }

  const svg = w12('w12BulkSvg');
  if (!svg) return;
  const maxPercent = Math.abs((80 * 1e6) / (20 * 1e9) * 100);
  const shrinkRatio = Math.min(1, percent / maxPercent);
  const pressureRatio = pressureMPa / 80;
  const volumeRatio = (volume - 0.001) / 0.019;
  const modulusRatio = (modulusGPa - 20) / 160;
  const originalSize = 130 + volumeRatio * 95;
  const shrink = shrinkRatio * 76;
  const size = originalSize - shrink;
  const cx = 320;
  const cy = 185;
  const x0 = cx - originalSize / 2;
  const y0 = cy - originalSize / 2;
  const x = cx - size / 2;
  const y = cy - size / 2;
  const arrowLen = pressureMPa > 0 ? 44 + pressureRatio * 96 : 0;
  const forceStroke = pressureMPa > 0 ? 3 + pressureRatio * 8 : 0;
  const fillLightness = 88 - modulusRatio * 38;
  const fillColor = `hsl(211 80% ${fillLightness}%)`;
  svg.innerHTML = `
    <rect x="${x0}" y="${y0}" width="${originalSize}" height="${originalSize}" rx="8" fill="none" stroke="#93c5fd" stroke-width="3" stroke-dasharray="9 7"/>
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="8" class="w12-stressed" style="fill:${fillColor}"/>
    <line x1="${cx}" y1="${y - arrowLen - 10}" x2="${cx}" y2="${y - 8}" class="w12-force" style="stroke-width:${forceStroke}"/>
    <line x1="${cx}" y1="${y + size + arrowLen + 10}" x2="${cx}" y2="${y + size + 8}" class="w12-force" style="stroke-width:${forceStroke}"/>
    <line x1="${x - arrowLen - 10}" y1="${cy}" x2="${x - 8}" y2="${cy}" class="w12-force" style="stroke-width:${forceStroke}"/>
    <line x1="${x + size + arrowLen + 10}" y1="${cy}" x2="${x + size + 8}" y2="${cy}" class="w12-force" style="stroke-width:${forceStroke}"/>
    <text x="${cx - 24}" y="${Math.max(42, y - arrowLen - 20)}" class="w12-text">ΔP</text>
    <text x="${x0}" y="${y0 + originalSize + 30}" class="w12-small">📦 กรอบเส้นประ = Vᵢ</text>
    <text x="438" y="106" class="w12-small">B = ${modulusGPa.toFixed(0)} GPa</text>
    <text x="438" y="128" class="w12-small">Vᵢ = ${volume.toFixed(3)} m³</text>
    <text x="438" y="150" class="w12-small">ลดลง ${w12Fmt(percent, 3)}%</text>
  `;
}

function w12InitElasticTypes() {
  const labels = {
    young: 'ใช้เมื่อแรงดึงหรืออัดทำให้ความยาวเปลี่ยน: \\(Y=(F/A)/(\\Delta L/L_i)\\)',
    shear: 'ใช้เมื่อแรงขนานผิวทำให้รูปร่างเลื่อน: \\(S=(F/A)/(\\Delta x/h)\\)',
    bulk: 'ใช้เมื่อความดันรอบด้านทำให้ปริมาตรเปลี่ยน: \\(B=-\\Delta P/(\\Delta V/V_i)\\)'
  };
  const feedback = w12('w12ElasticTypeFeedback');
  document.querySelectorAll('[data-w12-elastic-types] .w12-type-card').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-w12-elastic-types] .w12-type-card').forEach(item => item.classList.remove('selected'));
      button.classList.add('selected');
      if (feedback) {
        feedback.innerHTML = labels[button.dataset.type] || '';
        w12Math(feedback);
      }
    });
  });
  if (feedback) {
    feedback.innerHTML = labels.young;
    w12Math(feedback);
  }
}

function w12Init() {
  [
    'w12AstroMass', 'w12AstroLength1', 'w12AstroLength2', 'w12AstroV1',
    'w12Torque', 'w12Angle', 'w12Inertia', 'w12OmegaI',
    'w12YoungForce', 'w12YoungLength', 'w12YoungDiameter', 'w12YoungModulus', 'w12YoungAmp',
    'w12ShearForce', 'w12ShearArea', 'w12ShearHeight', 'w12ShearModulus',
    'w12BulkPressure', 'w12BulkVolume', 'w12BulkModulus'
  ].forEach(id => {
    const el = w12(id);
    if (el) el.addEventListener('input', () => {
      w12UpdateAstronauts();
      w12UpdateEnergy();
      w12UpdateYoung();
      w12UpdateShear();
      w12UpdateBulk();
    });
  });

  w12InitElasticTypes();
  const astroPlayBtn = w12('w12AstroPlayBtn');
  if (astroPlayBtn) astroPlayBtn.addEventListener('click', w12ToggleAstronautAnimation);
  const youngToggle = w12('w12YoungToggleCalc');
  if (youngToggle) youngToggle.addEventListener('click', () => {
    const steps = w12('w12YoungSteps');
    if (!steps) return;
    const isHidden = steps.hasAttribute('hidden');
    if (isHidden) {
      steps.removeAttribute('hidden');
      youngToggle.textContent = 'ซ่อนวิธีคำนวณ';
      // populate steps
      const force = w12Num('w12YoungForce');
      const length = w12Num('w12YoungLength');
      const diameterMm = w12Num('w12YoungDiameter');
      const modulusGPa = w12Num('w12YoungModulus');
      const area = Math.PI * Math.pow(diameterMm / 1000, 2) / 4;
      const modulus = modulusGPa * 1e9;
      const delta = force * length / (area * modulus);
      steps.innerHTML = `
        <h3>วิธีคำนวณ (Young's modulus)</h3>
        <p>พื้นที่หน้าตัด \\(A=\\pi d^2/4=${area.toFixed(7)}\\ \\mathrm{m^2}\\)</p>
        <p>การยืด \\(\\Delta L=\\dfrac{F L_i}{A Y} = \\dfrac{${force} \\times ${length}}{${area.toFixed(7)} \\times ${modulusGPa}\\times10^9} = ${ (delta*100).toFixed(4)}\\ \\mathrm{cm}\\)</p>
        <p>ความเครียด \\(=\\Delta L/L_i=${(delta/length).toFixed(5)}\\)</p>
      `;
      w12Math(steps);
    } else {
      steps.setAttribute('hidden', '');
      youngToggle.textContent = 'แสดงวิธีคำนวณ';
    }
  });
  const shearToggle = w12('w12ShearToggleCalc');
  if (shearToggle) shearToggle.addEventListener('click', () => {
    const steps = w12('w12ShearSteps');
    if (!steps) return;
    const isHidden = steps.hasAttribute('hidden');
    if (isHidden) {
      steps.removeAttribute('hidden');
      steps.innerHTML = w12ShearStepsHtml(w12ShearCalcValues());
      shearToggle.textContent = 'ซ่อนวิธีคำนวณ';
      w12Math(steps);
    } else {
      steps.setAttribute('hidden', '');
      shearToggle.textContent = 'แสดงวิธีคำนวณ';
    }
  });
  const bulkToggle = w12('w12BulkToggleCalc');
  if (bulkToggle) bulkToggle.addEventListener('click', () => {
    const steps = w12('w12BulkSteps');
    if (!steps) return;
    const isHidden = steps.hasAttribute('hidden');
    if (isHidden) {
      steps.removeAttribute('hidden');
      steps.innerHTML = w12BulkStepsHtml(w12BulkCalcValues());
      bulkToggle.textContent = '🙈 ซ่อนวิธีคำนวณ';
      w12Math(steps);
    } else {
      steps.setAttribute('hidden', '');
      bulkToggle.textContent = '🧮 แสดงวิธีคำนวณ';
    }
  });
  w12UpdateAstronauts();
  w12UpdateEnergy();
  w12UpdateYoung();
  w12UpdateShear();
  w12UpdateBulk();
  if (w12AstroPlaying) w12AstroFrame = requestAnimationFrame(w12AnimateAstronauts);
}

document.addEventListener('DOMContentLoaded', w12Init);
