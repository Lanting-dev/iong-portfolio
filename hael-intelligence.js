function initRecalibrationCanvas() {
  const canvas = document.querySelector(".recal-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const TAU = Math.PI * 2;
  const N = 5;
  const BRIGHTNESS = 0.55;

  // Body scan panel position as fractions of the full image (from Figma node 337:1433, 1920×1080 design)
  // left: calc(70%+22px)=1366px, top: calc(10%+78px)=186px, width:479px, height:675px
  const PX = 1366 / 1920, PY = 186 / 1080, PW = 479 / 1920, PH = 675 / 1080;

  let W = 1, H = 1, spread = 1, amp = 1, raf = 0, running = false;

  const img = canvas.parentElement.querySelector("img[data-node-id='337:1620']");

  function reposition() {
    if (!img) return;
    const ir = img.getBoundingClientRect();
    const pr = canvas.parentElement.getBoundingClientRect();
    const left = ir.left - pr.left + ir.width  * PX;
    const top  = ir.top  - pr.top  + ir.height * PY;
    const w    = ir.width  * PW;
    const h    = ir.height * PH;
    canvas.style.left   = `${left}px`;
    canvas.style.top    = `${top}px`;
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    W = canvas.width  = Math.round(w) || 1;
    H = canvas.height = Math.round(h) || 1;
    spread = Math.min(W, H);
    amp    = spread * 0.25;
  }

  new ResizeObserver(reposition).observe(canvas.parentElement);
  reposition();

  // Re-position after screen-frame transition finishes (delay 420ms + duration 860ms)
  const section = canvas.closest(".hael-section");
  if (section) {
    new MutationObserver(() => {
      if (section.classList.contains("is-visible")) setTimeout(reposition, 1300);
    }).observe(section, { attributeFilter: ["class"] });
  }

  const nodes = Array.from({ length: N }, () => ({
    ax: 0.55 + Math.random() * 0.65,  ax2: 0.15 + Math.random() * 0.25,
    ay: 0.85 + Math.random() * 0.75,  ay2: 0.25 + Math.random() * 0.35,
    az: 0.08 + Math.random() * 0.10,
    fx:  TAU / (20000 + Math.random() * 16000), fx2: TAU / (8000 + Math.random() * 8000),
    fy:  TAU / (15000 + Math.random() * 11000), fy2: TAU / (5500 + Math.random() * 6000),
    fz:  TAU / (22000 + Math.random() * 16000),
    px:  Math.random() * TAU, px2: Math.random() * TAU,
    py:  Math.random() * TAU, py2: Math.random() * TAU,
    pz:  Math.random() * TAU,
    rotFreq:  0.000008 + Math.random() * 0.000008,
    rotPhase: Math.random() * TAU,
  }));

  function getPts(t) {
    return nodes.map((n) => {
      const x0 = Math.sin(t * n.fx  + n.px)  * n.ax  * amp + Math.sin(t * n.fx2 + n.px2) * n.ax2 * amp;
      const y0 = Math.sin(t * n.fy  + n.py)  * n.ay  * amp + Math.sin(t * n.fy2 + n.py2) * n.ay2 * amp;
      const z0 = Math.sin(t * n.fz  + n.pz)  * n.az  * amp;
      const rx = Math.sin(t * n.rotFreq * 0.7 + n.rotPhase) * 0.06;
      const ry = Math.sin(t * n.rotFreq       + n.rotPhase) * 0.08;
      const cRx = Math.cos(rx), sRx = Math.sin(rx);
      const cRy = Math.cos(ry), sRy = Math.sin(ry);
      const y1 = y0 * cRx - z0 * sRx;
      const z1 = y0 * sRx + z0 * cRx;
      const x2 = x0 * cRy + z1 * sRy;
      const z2 = -x0 * sRy + z1 * cRy;
      const fov = 1800, s = fov / (z2 + fov);
      return [x2 * s + W * 0.5, y1 * s + H * 0.42, s];
    });
  }

  function tick(t) {
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = "rgba(0,0,0,0.88)";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";

    const pts = getPts(t);
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const [x1, y1, s1] = pts[i];
        const [x2, y2, s2] = pts[j];
        const fade = Math.max(0, 1 - Math.hypot(x2 - x1, y2 - y1) / (spread * 0.9));
        if (fade < 0.04) continue;
        const s = (s1 + s2) / 2;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(255,255,255,${(BRIGHTNESS * s * fade * 0.9).toFixed(3)})`;
        ctx.lineWidth = s * fade * 0.65;
        ctx.stroke();
      }
    }
    pts.forEach(([x, y, s]) => {
      ctx.beginPath(); ctx.arc(x, y, 5.5 * s, 0, TAU);
      ctx.strokeStyle = `rgba(255,255,255,${(BRIGHTNESS * s * 0.75).toFixed(3)})`;
      ctx.lineWidth = s * 0.55; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 2 * s, 0, TAU);
      ctx.fillStyle = `rgba(255,255,255,${(BRIGHTNESS * s).toFixed(3)})`; ctx.fill();
    });

    raf = requestAnimationFrame(tick);
  }

  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
  }, { threshold: 0.1 }).observe(section || canvas);
}

initRecalibrationCanvas();

const sections = document.querySelectorAll(".hael-section");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.24,
    rootMargin: "0px 0px -12% 0px"
  }
);

sections.forEach((section) => observer.observe(section));
