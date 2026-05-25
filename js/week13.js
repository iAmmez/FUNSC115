(() => {
  const $ = (id) => document.getElementById(id);
  const fmt = (x, n = 2) => Number(x).toFixed(n);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function htmlReadout(el, items) {
    if (!el) return;
    el.innerHTML = items
      .filter(([k]) => !(String(k).startsWith("E ") && !String(k).includes("\\(")))
      .map(([k, v]) => `<div class="w13-pill">${k}: ${v}</div>`)
      .join("");
  }
  function drawGrid(ctx, w, h) {
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, h - 30);
      ctx.stroke();
    }
    for (let y = 40; y < h; y += 50) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
    }
  }
  function drawArrow(ctx, x1, y1, x2, y2, color) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 12 * Math.cos(ang - 0.45), y2 - 12 * Math.sin(ang - 0.45));
    ctx.lineTo(x2 - 12 * Math.cos(ang + 0.45), y2 - 12 * Math.sin(ang + 0.45));
    ctx.closePath();
    ctx.fill();
  }
  function roundedRect(ctx, x, y, w, h, r) {
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(x, y, w, h, r);
      return;
    }
    const radius = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
  function springPath(x1, y, x2, coils = 12, amp = 18) {
    let d = `M ${x1} ${y}`;
    const L = x2 - x1;
    for (let i = 1; i <= coils * 2; i++) {
      const x = x1 + (L * i) / (coils * 2 + 1);
      const yy = y + (i % 2 ? -amp : amp);
      d += ` L ${x} ${yy}`;
    }
    d += ` L ${x2} ${y}`;
    return d;
  }
  function initReveal() {
    document.querySelectorAll("[data-reveal]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const box = $(btn.dataset.reveal);
        if (box) {
          box.hidden = !box.hidden;
          btn.textContent = box.hidden ? "แสดงแนวคิดคำตอบ" : "ซ่อนคำตอบ";
          if (window.renderMath) window.renderMath(box);
        }
      }),
    );
  }
  function initWave() {
    const c = $("waveCanvas");
    if (!c) return;
    const ctx = c.getContext("2d"),
      toggle = $("waveToggle"),
      reset = $("waveReset"),
      timeOut = $("waveTime");
    let t = 0,
      last = 0,
      playing = false,
      dirty = true,
      lastReadoutAt = 0;
    const xScale = 50,
      yScale = 10,
      originX = 50,
      mid = 130,
      plotRight = c.width - 25,
      plotTop = 25,
      plotBottom = c.height - 35;
    function drawWaveGrid() {
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let xm = 0; originX + xm * xScale <= plotRight; xm++) {
        const x = originX + xm * xScale;
        ctx.moveTo(x, plotTop);
        ctx.lineTo(x, plotBottom);
      }
      for (let ym = -10; ym <= 10; ym++) {
        const y = mid - ym * yScale;
        if (y >= plotTop && y <= plotBottom) {
          ctx.moveTo(originX, y);
          ctx.lineTo(plotRight, y);
        }
      }
      ctx.stroke();
      ctx.strokeStyle = "#bfdbfe";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let xm = 0; originX + xm * xScale <= plotRight; xm += 2) {
        const x = originX + xm * xScale;
        ctx.moveTo(x, plotTop);
        ctx.lineTo(x, plotBottom);
      }
      for (let ym = -6; ym <= 6; ym += 3) {
        const y = mid - ym * yScale;
        ctx.moveTo(originX, y);
        ctx.lineTo(plotRight, y);
      }
      ctx.stroke();
    }
    function drawAxes() {
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(originX, mid);
      ctx.lineTo(plotRight, mid);
      ctx.moveTo(originX, plotTop);
      ctx.lineTo(originX, plotBottom);
      ctx.stroke();
      ctx.fillStyle = "#111827";
      ctx.font = "16px sans-serif";
      ctx.fillText("x (m)", c.width - 68, mid + 48);
      ctx.save();
      ctx.translate(22, 78);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("y (m)", 30, 0);
      ctx.restore();
      ctx.fillStyle = "#64748b";
      ctx.font = "13px sans-serif";
      for (let xm = 0; xm <= 16; xm += 2) {
        const x = originX + xm * xScale;
        ctx.beginPath();
        ctx.moveTo(x, mid - 5);
        ctx.lineTo(x, mid + 5);
        ctx.stroke();
        ctx.fillText(String(xm), x - 5, mid + 22);
      }
      for (let ym = -6; ym <= 6; ym += 3) {
        const y = mid - ym * yScale;
        ctx.beginPath();
        ctx.moveTo(originX - 5, y);
        ctx.lineTo(originX + 5, y);
        ctx.stroke();
        if (ym !== 0) ctx.fillText(String(ym), originX - 30, y + 4);
      }
    }
    function render(updateReadout = false) {
      const A = +$("waveAmp").value,
        f = +$("waveFreq").value,
        lam = +$("waveLambda").value,
        ph = +$("wavePhase").value;
      $("waveAmpOut").textContent = ` ${fmt(A, 1)} m`;
      $("waveFreqOut").textContent = ` ${fmt(f, 1)} Hz`;
      $("waveLambdaOut").textContent = ` ${fmt(lam, 1)} m`;
      $("wavePhaseOut").textContent = ` ${fmt(ph, 2)} rad`;
      if (timeOut) timeOut.textContent = `เวลา t = ${fmt(t)} s`;
      ctx.clearRect(0, 0, c.width, c.height);
      drawWaveGrid();
      drawAxes();
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let px = originX; px < plotRight; px++) {
        const x = (px - originX) / xScale,
          y =
            mid -
            A *
              yScale *
              Math.sin((2 * Math.PI * x) / lam - 2 * Math.PI * f * t + ph);
        if (px === originX) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();
      if (updateReadout) {
        htmlReadout($("waveReadout"), [
          ["สมการ", "<br>y = A sin(kx − ωt + φ)"],
          ["k", `${fmt((2 * Math.PI) / lam, 3)} rad/m`],
          ["ω", `${fmt(2 * Math.PI * f, 2)} rad/s`],
          ["v = fλ", `${fmt(f * lam, 2)} m/s`],
        ]);
      }
    }
    function loop(ts) {
      if (!last) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      if (playing) t += dt;
      if (playing || dirty) {
        const updateReadout = dirty || ts - lastReadoutAt > 180;
        render(updateReadout);
        if (updateReadout) lastReadoutAt = ts;
        dirty = false;
      }
      requestAnimationFrame(loop);
    }
    if (toggle)
      toggle.addEventListener("click", () => {
        playing = !playing;
        toggle.textContent = playing ? "หยุด animation" : "เริ่ม animation";
      });
    if (reset)
      reset.addEventListener("click", () => {
        t = 0;
        last = 0;
        dirty = true;
      });
    ["waveAmp", "waveFreq", "waveLambda", "wavePhase"].forEach((id) =>
      $(id)?.addEventListener("input", () => {
        dirty = true;
      }),
    );
    requestAnimationFrame(loop);
  }
  function initRestore() {
    const svg = $("restoreSvg");
    if (!svg) return;
    function update() {
      const x = +$("restoreX").value,
        k = 5;
      $("restoreXOut").textContent = ` ${fmt(x)} m`;
      const cx = 450 + x * 260,
        y = 110,
        f = -k * x;
      svg.innerHTML = `<line x1="80" y1="170" x2="820" y2="170" stroke="#111827" stroke-width="3"/><line x1="450" y1="45" x2="450" y2="185" stroke="#94a3b8" stroke-dasharray="8 8"/><text x="430" y="38" font-size="18">สมดุล</text><rect x="${cx - 42}" y="82" width="84" height="60" rx="14" fill="#dbeafe" stroke="#2563eb" stroke-width="3"/><path d="${springPath(90, 112, cx - 42)}" fill="none" stroke="#64748b" stroke-width="4"/><circle cx="90" cy="112" r="8" fill="#111827"/><line x1="${cx}" y1="70" x2="${cx + Math.sign(x || 1) * 90}" y2="70" stroke="#2563eb" stroke-width="5" marker-end="url(#arrowBlue13)"/><line x1="${cx}" y1="154" x2="${cx + clamp(f * 38, -170, 170)}" y2="154" stroke="#dc2626" stroke-width="5" marker-end="url(#arrowRed13)"/><text x="${cx - 20}" y="64" font-size="16" fill="#2563eb">x</text><text x="${cx - 20}" y="205" font-size="16" fill="#dc2626">F=-kx</text>`;
      htmlReadout($("restoreReadout"), [
        ["ตำแหน่ง x", `${fmt(x)} m`],
        ["แรงคืนกลับ", `${fmt(f)} N`],
        ["ข้อสังเกต", "แรงมีทิศตรงข้ามกับการกระจัด"],
      ]);
    }
    $("restoreX").addEventListener("input", update);
    svg.insertAdjacentHTML("afterbegin", "");
    update();
  }
  function initSpring() {
    const svg = $("springSvg");
    if (!svg) return;
    const toggle = $("springToggle"),
      reset = $("springReset"),
      timeOut = $("springTime");
    let t = 0,
      last = 0,
      playing = false,
      dirty = true,
      lastReadoutAt = 0;
    function render(updateReadout = false) {
      const m = +$("springM").value,
        k = +$("springK").value,
        A = +$("springA").value;
      const w = Math.sqrt(k / m),
        T = (2 * Math.PI) / w,
        x = A * Math.cos(w * t);
      $("springMOut").textContent = ` ${fmt(m)} kg`;
      $("springKOut").textContent = ` ${fmt(k, 1)} N/m`;
      $("springAOut").textContent = ` ${fmt(A)} m`;
      if (timeOut) timeOut.textContent = `เวลา t = ${fmt(t)} s`;
      const cx = 450 + x * 310,
        y = 120;
      svg.innerHTML = `<defs><marker id="arrowRed13" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z" fill="#dc2626"/></marker><marker id="arrowBlue13" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z" fill="#2563eb"/></marker></defs><line x1="70" y1="190" x2="830" y2="190" stroke="#111827" stroke-width="3"/><line x1="450" y1="55" x2="450" y2="200" stroke="#94a3b8" stroke-dasharray="8 8"/><path d="${springPath(80, y, cx - 54, 14, 17)}" fill="none" stroke="#64748b" stroke-width="4"/><rect x="${cx - 54}" y="80" width="108" height="80" rx="18" fill="#dbeafe" stroke="#2563eb" stroke-width="4"/><text x="${cx - 20}" y="128" font-size="22" fill="#1e40af">m</text><line x1="${cx}" y1="68" x2="${cx + clamp(-k * x * 24, -160, 160)}" y2="68" stroke="#dc2626" stroke-width="5" marker-end="url(#arrowRed13)"/>`;
      if (updateReadout) {
        htmlReadout($("springReadout"), [
          ["x(t)", `${fmt(x)} m`],
          ["T", `${fmt(T)} s`],
          ["ω", `${fmt(w)} rad/s`],
          ["f", `${fmt(1 / T)} Hz`],
        ]);
      }
    }
    function loop(ts) {
      if (!last) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      if (playing) t += dt;
      if (playing || dirty) {
        const updateReadout = dirty || ts - lastReadoutAt > 180;
        render(updateReadout);
        if (updateReadout) lastReadoutAt = ts;
        dirty = false;
      }
      requestAnimationFrame(loop);
    }
    if (toggle)
      toggle.addEventListener("click", () => {
        playing = !playing;
        toggle.textContent = playing ? "หยุด animation" : "เริ่ม animation";
      });
    if (reset)
      reset.addEventListener("click", () => {
        t = 0;
        last = 0;
        playing = false;
        if (toggle) toggle.textContent = "เริ่ม animation";
        dirty = true;
      });
    ["springM", "springK", "springA"].forEach((id) =>
      $(id)?.addEventListener("input", () => {
        dirty = true;
      }),
    );
    requestAnimationFrame(loop);
  }
  function initCircle() {
    const c = $("circleCanvas");
    if (!c) return;
    const ctx = c.getContext("2d"),
      toggle = $("circleToggle");
    let t = 0,
      last = 0,
      playing = false,
      dirty = true,
      lastReadoutAt = 0;
    function drawCircleGrid(discX, discY, axisY, springY, R) {
      ctx.strokeStyle = "#eff6ff";
      ctx.lineWidth = 1;
      for (let x = discX - 4 * R; x <= discX + 4 * R; x += R / 2) {
        ctx.beginPath();
        ctx.moveTo(x, 42);
        ctx.lineTo(x, c.height - 24);
        ctx.stroke();
      }
      for (let y = discY - 1.5 * R; y <= springY + R; y += R / 2) {
        ctx.beginPath();
        ctx.moveTo(36, y);
        ctx.lineTo(c.width - 36, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "#bfdbfe";
      ctx.lineWidth = 1.5;
      [discX - 2 * R, discX - R, discX, discX + R, discX + 2 * R].forEach(
        (x) => {
          ctx.beginPath();
          ctx.moveTo(x, 42);
          ctx.lineTo(x, c.height - 24);
          ctx.stroke();
        },
      );
      [discY, axisY, springY].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(36, y);
        ctx.lineTo(c.width - 36, y);
        ctx.stroke();
      });
    }
    function loop(ts) {
      if (!last) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      if (!playing && !dirty) {
        requestAnimationFrame(loop);
        return;
      }
      const omega = +$("circleOmega").value,
        showDisc = $("circleShowDisc")?.checked !== false,
        showSpring = $("circleShowSpring")?.checked !== false;
      $("circleOmegaOut").textContent = ` ${fmt(omega)} rad/s`;
      const R = 108,
        discX = 450,
        discY = 184,
        axisY = 336,
        phase = omega * t,
        pinX = discX + R * Math.cos(phase),
        pinY = discY - R * Math.sin(phase),
        shadowX = pinX,
        springWall = 190,
        springY = 444,
        blockW = 76,
        blockH = 56;
      const A = R,
        x = shadowX - discX;
      ctx.clearRect(0, 0, c.width, c.height);
      drawCircleGrid(discX, discY, axisY, springY, R);
      ctx.fillStyle = "#111827";
      ctx.font = "18px sans-serif";
      if (showDisc) {
        ctx.fillText("จานหมุนแนวดิ่งและหมุดไม้", 350, 24);
      }
      if (showDisc) {
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(discX, discY, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#94a3b8";
        ctx.setLineDash([7, 7]);
        ctx.beginPath();
        ctx.moveTo(discX, discY - R - 16);
        ctx.lineTo(discX, axisY + 18);
        ctx.moveTo(discX - R - 20, discY);
        ctx.lineTo(discX + R + 20, discY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "#eb2525";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(discX, discY);
        ctx.lineTo(pinX, pinY);
        ctx.stroke();
        ctx.fillStyle = "#eb2525";
        ctx.beginPath();
        ctx.arc(pinX, pinY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#856e6e";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pinX, pinY);
        ctx.lineTo(shadowX, axisY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(discX - R - 38, axisY);
        ctx.lineTo(discX + R + 38, axisY);
        ctx.stroke();
        ctx.strokeStyle = "#94a3b8";
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(discX, axisY - 18);
        ctx.lineTo(discX, axisY + 18);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#856e6e";
        ctx.beginPath();
        ctx.ellipse(shadowX, axisY, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#111827";
        ctx.font = "14px sans-serif";
        ctx.fillText("x = 0", discX - 16, axisY + 38);
        ctx.fillText("-A", discX - R - 10, axisY + 38);
        ctx.fillText("+A", discX + R - 10, axisY + 38);
        ctx.fillStyle = "#856e6e";
        ctx.fillText("เงาหมุด", shadowX - 25, axisY - 16);
      }
      if (showSpring) {
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(springWall, springY - 72);
        ctx.lineTo(springWall, springY + 42);
        ctx.stroke();
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 4;
        ctx.beginPath();
        const springEnd = discX + x;
        const d = springPath(
          springWall,
          springY,
          springEnd - blockW / 2,
          13,
          14,
        );
        const path = new Path2D(d);
        ctx.stroke(path);
        ctx.fillStyle = "#dbeafe";
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 4;
        ctx.beginPath();
        roundedRect(
          ctx,
          springEnd - blockW / 2,
          springY - blockH / 2,
          blockW,
          blockH,
          10,
        );
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#1e40af";
        ctx.font = "18px sans-serif";
        ctx.fillText("m", springEnd - 6, springY + 6);
        if (showDisc) {
          ctx.strokeStyle = "#856e6e";
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(shadowX, axisY + 8);
          ctx.lineTo(springEnd, springY - blockH / 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.fillStyle = "#64748b";
        ctx.font = "14px sans-serif";
        ctx.fillText("ตำแหน่งเดียวกัน: x = A cos(ωt)", 334, 506);
      }
      if (playing) t += dt;
      if (dirty || ts - lastReadoutAt > 180) {
        htmlReadout($("circleReadout"), [
          ["รัศมีจาน A", `${fmt(A, 0)} px`],
          ["x = A cos(ωt)", `${fmt(x, 1)} px`],
          ["phase", `${fmt(phase % (2 * Math.PI), 2)} rad`],
          ["ความหมาย", "เงาแกว่งระหว่าง x = +A และ x = -A"],
        ]);
        lastReadoutAt = ts;
        dirty = false;
      }
      requestAnimationFrame(loop);
    }
    if (toggle)
      toggle.addEventListener("click", () => {
        playing = !playing;
        toggle.textContent = playing ? "หยุด animation" : "เล่น animation";
      });
    ["circleOmega", "circleShowDisc", "circleShowSpring"].forEach((id) =>
      $(id)?.addEventListener("input", () => {
        dirty = true;
      }),
    );
    ["circleShowDisc", "circleShowSpring"].forEach((id) =>
      $(id)?.addEventListener("change", () => {
        dirty = true;
      }),
    );
    requestAnimationFrame(loop);
  }
  function initTriple() {
    const c = $("tripleGraphCanvas");
    if (!c) return;
    const ctx = c.getContext("2d");
    const A = 1,
      w = 1,
      period = 4 * Math.PI;
    function miniArrow(x1, y1, val, scale, color, label, offset = 0) {
      const len = val * scale;
      if (Math.abs(len) < 3) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x1, y1 + offset, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "15px sans-serif";
        ctx.fillText(`${label} ≈ 0`, x1 + 12, y1 + offset + 5);
        return;
      }
      drawArrow(ctx, x1, y1 + offset, x1 + len, y1 + offset, color);
      ctx.fillStyle = color;
      ctx.font = "15px sans-serif";
      ctx.fillText(label, x1 + len + (len > 0 ? 8 : -34), y1 + offset - 7);
    }
    function drawSpringSystem(x, v, a) {
      const wall = 105,
        eq = 450,
        scale = 170,
        y = 100,
        blockW = 78,
        blockH = 54,
        massX = eq + x * scale;
      ctx.fillStyle = "#111827";
      ctx.font = "18px sans-serif";
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(wall, y - 70);
      ctx.lineTo(wall, y + 52);
      ctx.stroke();
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.stroke(new Path2D(springPath(wall, y, massX - blockW / 2, 13, 13)));
      ctx.strokeStyle = "#94a3b8";
      ctx.setLineDash([7, 7]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(eq, y - 70);
      ctx.lineTo(eq, y + 78);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#64748b";
      ctx.font = "14px sans-serif";
      ctx.fillText("x = 0", eq - 18, y + 96);
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(eq - scale, y + 66);
      ctx.lineTo(eq + scale, y + 66);
      ctx.stroke();
      ctx.fillStyle = "#64748b";
      ctx.fillText("-A", eq - scale - 10, y + 88);
      ctx.fillText("+A", eq + scale - 10, y + 88);
      ctx.fillStyle = "#dbeafe";
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 4;
      ctx.beginPath();
      roundedRect(ctx, massX - blockW / 2, y - blockH / 2, blockW, blockH, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1e40af";
      ctx.font = "20px sans-serif";
      ctx.fillText("m", massX - 7, y + 7);
      miniArrow(eq, y - 58, x, 120, "#2563eb", "x (m)");
      miniArrow(massX, y - 6, v, 92, "#16a34a", "v (m/s)");
      miniArrow(massX, y + 28, a, 92, "#dc2626", "a (m/s²)");
    }
    function curve(y0, label, func, color, t0) {
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y0);
      ctx.lineTo(c.width, y0);
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < c.width; i++) {
        const t = (i / c.width) * period;
        const y = y0 - 45 * func(t);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = "18px sans-serif";
      ctx.fillText(label, 20, y0 - 55);
      const x = (t0 / period) * c.width;
      const y = y0 - 45 * func(t0);
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y0 - 58);
      ctx.lineTo(x, y0 + 58);
      ctx.stroke();
    }
    function drawTripleGrid(rows) {
      ctx.strokeStyle = "#eff6ff";
      ctx.lineWidth = 1;
      for (let n = 0; n <= 8; n++) {
        const px = (n * c.width) / 8;
        ctx.beginPath();
        ctx.moveTo(px, 190);
        ctx.lineTo(px, 540);
        ctx.stroke();
      }
      ctx.strokeStyle = "#bfdbfe";
      ctx.lineWidth = 1.5;
      for (let n = 0; n <= 4; n++) {
        const px = (n * c.width) / 4;
        ctx.beginPath();
        ctx.moveTo(px, 190);
        ctx.lineTo(px, 540);
        ctx.stroke();
      }
      rows.forEach((y0) => {
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        [-1, 1].forEach((level) => {
          ctx.beginPath();
          ctx.moveTo(0, y0 - level * 45);
          ctx.lineTo(c.width, y0 - level * 45);
          ctx.stroke();
        });
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y0);
        ctx.lineTo(c.width, y0);
        ctx.stroke();
        ctx.fillStyle = "#64748b";
        ctx.font = "12px sans-serif";
        ctx.fillText("+1", 6, y0 - 48);
        ctx.fillText("0", 6, y0 - 4);
        ctx.fillText("-1", 6, y0 + 49);
      });
    }
    function drawPeriodAxis(y) {
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(c.width, y);
      ctx.stroke();
      ctx.fillStyle = "#111827";
      ctx.font = "14px sans-serif";
      for (let n = 0; n <= 4; n++) {
        const px = (n * c.width) / 4;
        ctx.beginPath();
        ctx.moveTo(px, y - 7);
        ctx.lineTo(px, y + 7);
        ctx.stroke();
        const label = n === 0 ? "0" : `${fmt(n * 0.5, 1).replace(".0", "")}T`;
        ctx.fillText(label, Math.max(4, px - 14), y + 24);
      }
      ctx.fillText("เวลา (หน่วยคาบ T)", c.width - 132, y + 44);
    }
    function update() {
      const t = +$("graphTime").value,
        x = A * Math.cos(t),
        v = -A * w * Math.sin(t),
        a = -A * w * w * Math.cos(t),
        rows = [245, 365, 485],
        ts = fmt(t, 2);
      $("graphTimeOut").textContent = ` ${fmt(t)} s`;
      ctx.clearRect(0, 0, c.width, c.height);
      drawSpringSystem(x, v, a);
      drawTripleGrid(rows);
      [
        [rows[0], "x(t) [m]", (tt) => Math.cos(tt), "#2563eb"],
        [rows[1], "v(t) [m/s]", (tt) => -Math.sin(tt), "#16a34a"],
        [rows[2], "a(t) [m/s²]", (tt) => -Math.cos(tt), "#dc2626"],
      ].forEach((item) => curve(...item, t));
      drawPeriodAxis(540);
      htmlReadout($("tripleGraphReadout"), [
        [
          "x(t)",
          `A cos(ωt)<br>= ${fmt(A, 0)} cos(${fmt(w, 0)}×${ts})<br>= ${fmt(x)} m`,
        ],
        [
          "v(t)",
          `-Aω sin(ωt)<br>= -${fmt(A, 0)}×${fmt(w, 0)} sin(${fmt(w, 0)}×${ts})<br>= ${fmt(v)} m/s`,
        ],
        [
          "a(t)",
          `-Aω² cos(ωt)<br>= -${fmt(A, 0)}×${fmt(w, 0)}² cos(${fmt(w, 0)}×${ts})<br>= ${fmt(a)} m/s²`,
        ],
      ]);
    }
    $("graphTime").addEventListener("input", update);
    update();
  }
  function initFreq() {
    if (!$("freqLab")) return;
    function update() {
      const m = +$("freqM").value,
        k = +$("freqK").value,
        w = Math.sqrt(k / m),
        T = (2 * Math.PI) / w,
        f = 1 / T;
      $("freqMOut").textContent = ` ${fmt(m)} kg`;
      $("freqKOut").textContent = ` ${fmt(k, 1)} N/m`;
      $("freqCards").innerHTML = [
        ["ω", `${fmt(w)} rad/s`],
        ["T", `${fmt(T)} s`],
        ["f", `${fmt(f)} Hz`],
        ["ความหมาย", k / m > 10 ? "สั่นค่อนข้างเร็ว" : "สั่นค่อนข้างช้า"],
      ]
        .map(
          ([a, b]) => `<div class="w13-meter"><strong>${b}</strong>${a}</div>`,
        )
        .join("");
    }
    ["freqM", "freqK"].forEach((id) => $(id).addEventListener("input", update));
    update();
  }
  function initEnergy() {
    const svg = $("energySvg");
    if (!svg) return;
    const timeSlider = $("energyTimeSlider"),
      timeOut = $("energyTimeOut");
    let mathTimer = 0;
    function scheduleEnergyMath() {
      clearTimeout(mathTimer);
      mathTimer = setTimeout(() => {
        if (typeof renderMath === "function") renderMath($("energyReadout"));
      }, 80);
    }
    function update() {
      const m = +$("energyM").value,
        k = +$("energyK").value,
        A = +$("energyA").value,
        w = Math.sqrt(k / m),
        T = (2 * Math.PI) / w;
      if (timeSlider) {
        const previousMax = +timeSlider.max || 2 * T,
          phase = previousMax ? +timeSlider.value / previousMax : 0;
        timeSlider.max = fmt(2 * T, 2);
        timeSlider.step = fmt(T / 100, 3);
        if (document.activeElement !== timeSlider) {
          timeSlider.value = fmt(clamp(phase, 0, 1) * 2 * T, 3);
        }
      }
      const t = timeSlider ? +timeSlider.value : 0,
        x = A * Math.cos(w * t),
        v = -A * w * Math.sin(w * t),
        K = 0.5 * m * v * v,
        U = 0.5 * k * x * x,
        E = 0.5 * k * A * A;
      $("energyMOut").textContent = ` ${fmt(m, 1)} kg`;
      $("energyKOut").textContent = ` ${fmt(k, 0)} N/m`;
      $("energyAOut").textContent = ` ${fmt(A, 2)} m`;
      if (timeOut) timeOut.textContent = `เวลา t = ${fmt(t, 2)} s (${fmt(t / T, 2)}T)`;
      const wall = 70,
        eq = 320,
        scale = 210 / A,
        massX = eq + x * scale,
        y = 170,
        barX = 650,
        barW = 56,
        baseY = 330,
        maxH = 230,
        barH = (val) => (E ? (val / E) * maxH : 0),
        bar = (x0, val, color, label) =>
          `
        <rect x="${x0}" y="${baseY - maxH}" width="${barW}" height="${maxH}" rx="8" fill="#f1f5f9"/>
        <rect x="${x0}" y="${baseY - barH(val)}" width="${barW}" height="${barH(val)}" rx="8" fill="${color}"/>
        <text x="${x0 + barW / 2}" y="${baseY + 24}" font-size="18" text-anchor="middle" fill="#111827">${label}</text>
        <text x="${x0 + barW / 2}" y="${baseY - barH(val) - 10}" font-size="14" text-anchor="middle" fill="${color}">${fmt(val, 2)} J</text>`;
        
        svg.innerHTML =
        `<line x1="48" y1="358" x2="598" y2="358" stroke="#e2e8f0" stroke-width="2"/>
        <line x1="${wall}" y1="${y - 78}" x2="${wall}" y2="${y + 58}" stroke="#111827" stroke-width="5"/>
        <line x1="${eq - A * scale}" y1="${y + 84}" x2="${eq + A * scale}" y2="${y + 84}" stroke="#111827" stroke-width="3"/>
        <line x1="${eq}" y1="${y - 80}" x2="${eq}" y2="${y + 96}" stroke="#94a3b8" stroke-dasharray="8 8" stroke-width="2"/>
        <text x="${eq - 18}" y="${y + 116}" font-size="14" fill="#64748b">x=0</text>
        <text x="${eq - A * scale - 12}" y="${y + 116}" font-size="14" fill="#64748b">-A</text><text x="${eq + A * scale - 12}" y="${y + 116}" font-size="14" fill="#64748b">+A</text><path d="${springPath(wall, y, massX - 46, 14, 16)}" fill="none" stroke="#64748b" stroke-width="4"/><rect x="${massX - 46}" y="${y - 32}" width="92" height="64" rx="12" fill="#dbeafe" stroke="#2563eb" stroke-width="4"/><text x="${massX}" y="${y + 8}" font-size="22" text-anchor="middle" fill="#1e40af">m</text><line x1="${massX}" y1="${y - 48}" x2="${massX + clamp(v * 30, -130, 130)}" y2="${y - 48}" stroke="#16a34a" stroke-width="5" marker-end="url(#arrowGreen13)"/><text x="${massX + clamp(v * 30, -130, 130) + 8}" y="${y - 56}" font-size="15" fill="#16a34a">v</text>${bar(barX, K, "#16a34a", "KE")}${bar(barX + 88, U, "#f59e0b", "PE")}${bar(barX + 176, E, "#7c3aed", "E")}`;
      const ts = fmt(t, 2);
      htmlReadout($("energyReadout"), [
        ["ตำแหน่ง",
            `\\(x(t)=A\\cos(\\omega t)\\)<br>\\(= ${fmt(A, 2)}\\cos(${fmt(w, 2)}\\times ${ts})\\)<br>\\(= ${fmt(x, 3)}\\ \\mathrm{m}\\)`],
        ["ความเร็ว", `\\(v(t)=-A\\omega\\sin(\\omega t)\\)<br>\\(= -${fmt(A, 2)}\\times ${fmt(w, 2)}\\sin(${fmt(w, 2)}\\times ${ts})\\)<br>\\(= ${fmt(v, 3)}\\ \\mathrm{m/s}\\)`],
        ["พลังงานจลน์", `\\(KE=\\frac{1}{2}mv^2\\)<br>\\(=\\frac{1}{2}(${fmt(m, 1)})(${fmt(v, 3)})^2\\)<br>\\(= ${fmt(K, 2)}\\ \\mathrm{J}\\)`],
        ["พลังงานศักย์", `\\(PE=\\frac{1}{2}kx^2\\)<br>\\(=\\frac{1}{2}(${fmt(k, 0)})(${fmt(x, 3)})^2\\)<br>\\(= ${fmt(U, 2)}\\ \\mathrm{J}\\)`],
        ["พลังงานเริ่มต้น", `\\(E=\\frac{1}{2}kA^2\\)<br>\\(=\\frac{1}{2}(${fmt(k, 0)})(${fmt(A, 2)})^2\\)<br>\\(= ${fmt(E, 2)}\\ \\mathrm{J}\\)`],
        ["คาบ", `\\(T=2\\pi\\sqrt{\\frac{m}{k}}\\)<br>\\(=2\\pi\\sqrt{\\frac{${fmt(m, 1)}}{${fmt(k, 0)}}}\\)<br>\\(= ${fmt(T, 2)}\\ \\mathrm{s}\\)`],
      ]);
      scheduleEnergyMath();
    }
    ["energyM", "energyK", "energyA", "energyTimeSlider"].forEach((id) =>
      $(id)?.addEventListener("input", update),
    );
    update();
  }
  function initPend() {
    const c = $("pendCanvas");
    if (!c) return;
    const ctx = c.getContext("2d");
    let t = 0,
      last = 0,
      lastReadoutAt = 0;
    function loop(ts) {
      if (!last) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      const L = +$("pendL").value,
        thetaMax = (+$("pendTheta").value * Math.PI) / 180,
        g = +$("pendG").value,
        w = Math.sqrt(g / L),
        theta = thetaMax * Math.cos(w * t),
        origin = [450, 60],
        scale = 105,
        bx = origin[0] + Math.sin(theta) * L * scale,
        by = origin[1] + Math.cos(theta) * L * scale;
      $("pendLOut").textContent = ` ${fmt(L)} m`;
      $("pendThetaOut").textContent = ` ${fmt((thetaMax * 180) / Math.PI, 0)}°`;
      $("pendGOut").textContent = ` ${fmt(g)} m/s²`;
      ctx.clearRect(0, 0, c.width, c.height);
      drawGrid(ctx, c.width, c.height);
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(origin[0] - 90, origin[1]);
      ctx.lineTo(origin[0] + 90, origin[1]);
      ctx.stroke();
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(origin[0], origin[1]);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      ctx.arc(bx, by, 28, 0, Math.PI * 2);
      ctx.fill();
      drawArrow(ctx, bx, by, bx, by + 70, "#dc2626");
      ctx.fillStyle = "#111827";
      ctx.font = "16px sans-serif";
      ctx.fillText("mg", bx + 10, by + 62);
      if (ts - lastReadoutAt > 180) {
        htmlReadout($("pendReadout"), [
          ["θ(t)", `${fmt((theta * 180) / Math.PI)}°`],
          ["ω", `${fmt(w)} rad/s`],
          ["T", `${fmt((2 * Math.PI) / w)} s`],
          ["f", `${fmt(w / (2 * Math.PI))} Hz`],
        ]);
        lastReadoutAt = ts;
      }
      t += dt;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
  function initPhys() {
    const svg = $("physSvg");
    if (!svg) return;
    function update() {
      const shape = $("physShape").value,
        m = +$("physM").value,
        d = +$("physD").value,
        g = 9.81;
      let factor = { rod: 3, disk: 2, block: 2.4 }[shape];
      const I = factor * m * d * d,
        w = Math.sqrt((m * g * d) / I),
        T = (2 * Math.PI) / w;
      $("physMOut").textContent = ` ${fmt(m)} kg`;
      $("physDOut").textContent = ` ${fmt(d)} m`;
      const px = 450,
        py = 55,
        cmx = 450 + Math.sin(0.32) * d * 130,
        cmy = 55 + Math.cos(0.32) * d * 130;
      const obj =
        shape === "disk"
          ? `<circle cx="${cmx}" cy="${cmy}" r="48" fill="#dbeafe" stroke="#2563eb" stroke-width="4"/>`
          : shape === "block"
            ? `<rect x="${cmx - 55}" y="${cmy - 35}" width="110" height="70" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="4" transform="rotate(18 ${cmx} ${cmy})"/>`
            : `<rect x="${px - 18}" y="${py}" width="36" height="${d * 260}" rx="12" fill="#dbeafe" stroke="#2563eb" stroke-width="4" transform="rotate(-18 ${px} ${py})"/>`;
      svg.innerHTML = `<line x1="320" y1="55" x2="580" y2="55" stroke="#111827" stroke-width="5"/><circle cx="${px}" cy="${py}" r="9" fill="#111827"/>${obj}<circle cx="${cmx}" cy="${cmy}" r="7" fill="#dc2626"/><text x="${cmx + 12}" y="${cmy + 5}" font-size="18">CM</text><line x1="${px}" y1="${py}" x2="${cmx}" y2="${cmy}" stroke="#64748b" stroke-dasharray="8 8" stroke-width="3"/><text x="610" y="90" font-size="20">T = ${fmt(T)} s</text><text x="610" y="125" font-size="20">ω = ${fmt(w)} rad/s</text><text x="610" y="160" font-size="20">I ≈ ${fmt(I)} kg·m²</text>`;
      htmlReadout($("physReadout"), [
        ["I", `${fmt(I)} kg·m²`],
        ["ω", `${fmt(w)} rad/s`],
        ["T", `${fmt(T)} s`],
        ["แนวคิด", "รูปร่างเปลี่ยน I จึงเปลี่ยนคาบ"],
      ]);
    }
    ["physShape", "physM", "physD"].forEach((id) =>
      $(id).addEventListener("input", update),
    );
    update();
  }
  function ensureMarkers() {
    if (document.getElementById("w13Markers")) return;
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<svg id="w13Markers" width="0" height="0" aria-hidden="true"><defs><marker id="arrowRed13" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z" fill="#dc2626"/></marker><marker id="arrowBlue13" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z" fill="#2563eb"/></marker><marker id="arrowGreen13" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z" fill="#16a34a"/></marker></defs></svg>`,
    );
  }
  document.addEventListener("DOMContentLoaded", () => {
    ensureMarkers();
    initReveal();
    initWave();
    initRestore();
    initSpring();
    initCircle();
    initTriple();
    initFreq();
    initEnergy();
    initPend();
    initPhys();
  });
})();
