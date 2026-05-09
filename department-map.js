const departments = {
  mete: {
    label: "METE SYSTEMS",
    restricted: false,
    route: "mete-system.html",
    subtitle: "Surplus to sustenance",
    description:
      "Mete Systems collects and processes nutritional materials into daily sachets. It reduces waste and meets safety standards. The exact composition is not shared, and most processes are not visible to the public.",
    image: "assets/department-overlay-mete.png",
    imageClass: "is-mete"
  },
  wel: {
    label: "WĒL OUTREACH",
    restricted: false,
    route: "wel-outreach.html",
    subtitle: "Trust and communication",
    description:
      "Wēl Outreach connects citizens to the program. It explains the Health Credit Score, shares updates, and supports participation. It serves as the main link between citizens and the system.",
    image: "assets/department-overlay-wel-delivery.png",
    imageClass: "is-wel"
  },
  lic: {
    label: "LÍC ANALYTICS",
    restricted: true,
    subtitle: "Data processing",
    description:
      "Líc Analytics processes classified behavioral, nutritional, and biometric datasets. Public access is restricted and operational details are only visible at elevated clearance levels.",
    image: "assets/department-overlay-lic.png",
    imageClass: "is-locked"
  },
  lif: {
    label: "LIF CONTINUITY",
    restricted: true,
    subtitle: "Population monitoring",
    description:
      "Lif Continuity monitors long-term population stability through restricted forecasting systems. Access requires authorization beyond employee-level browsing.",
    image: "assets/department-overlay-lif.png",
    imageClass: "is-locked"
  },
  hael: {
    label: "HÆL INTELLIGENCE",
    restricted: false,
    route: "hael-intelligence.html",
    subtitle: "Biometric data analysis",
    description:
      "HÆL Intelligence uses biometric data to create daily nutrition plans. It collects data in real time from wearable devices and turns it into formulas. The system updates regularly to improve accuracy. Access is controlled, and personal data is not shared across departments.",
    image: "assets/department-overlay-hael.png",
    imageClass: "is-hael"
  }
};

const revealOrder = ["mete", "hael", "wel", "lif", "lic"];
const deptStagger = 220;
const postLoadingDelay = 760;
const loadingSeenKey = "iongDepartmentLoadingSeen";
const visitedDepartmentsKey = "iongVisitedDepartments";
const requiredVisitedDepartments = ["mete", "wel", "hael"];
const departmentPanelTimesKey = "iongDepartmentPanelTimes";
const assignedDepartmentKey = "iongAssignedDepartment";
const lastInteractedDepartmentKey = "iongLastInteractedDepartment";
const centerX = 450;
const centerY = 310;

const stage = document.querySelector("[data-map-stage]");
const page = document.querySelector(".department-page");
const loadingOverlay = document.querySelector("[data-loading]");
const loadingMark = document.querySelector(".loading-mark");
const loadingPercent = document.querySelector("[data-loading-percent]");
const overlay = document.querySelector("[data-restricted]");
const dismissButton = document.querySelector("[data-dismiss]");
const restrictedTitle = document.querySelector("[data-restricted-title]");
const restrictedSubtitle = document.querySelector("[data-restricted-subtitle]");
const departmentDetail = document.querySelector("[data-department-detail]");
const detailTitle = document.querySelector("[data-detail-title]");
const detailSubtitle = document.querySelector("[data-detail-subtitle]");
const detailCopy = document.querySelector("[data-detail-copy]");
const detailImage = document.querySelector("[data-detail-image]");
const detailMedia = document.querySelector("[data-detail-media]");
const detailLock = document.querySelector("[data-detail-lock]");
const detailRestrictedCopy = document.querySelector("[data-detail-restricted-copy]");
const onboardBadge = document.querySelector("[data-onboard-badge]");
let departmentDetailCloseTimer = null;
let activePanelDepartment = null;
let sharedLoadProgress = 0;
let sharedLoadLinear = 0;
let activePanelStartedAt = 0;
const departmentLabelHoverTimers = new WeakMap();
let activeHoverLabel = null;
let isOnboardHovering = false;

function readDepartmentPanelTimes() {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(departmentPanelTimesKey) || "{}");
    return {
      mete: Number(stored.mete) || 0,
      hael: Number(stored.hael) || 0,
      wel: Number(stored.wel) || 0
    };
  } catch (error) {
    return { mete: 0, hael: 0, wel: 0 };
  }
}

function writeDepartmentPanelTimes(times) {
  try {
    window.sessionStorage.setItem(departmentPanelTimesKey, JSON.stringify(times));
  } catch (error) {
    // Storage can be unavailable in private contexts; the page still works.
  }
}

function startDepartmentPanelTimer(id) {
  if (!requiredVisitedDepartments.includes(id)) return;
  if (activePanelDepartment === id) return;

  stopDepartmentPanelTimer();
  activePanelDepartment = id;
  activePanelStartedAt = performance.now();

  try {
    window.sessionStorage.setItem(lastInteractedDepartmentKey, id);
  } catch (error) {
    // Storage can be unavailable in private contexts; assignment still has a fallback.
  }
}

function stopDepartmentPanelTimer() {
  if (!activePanelDepartment || !activePanelStartedAt) return;

  const elapsed = performance.now() - activePanelStartedAt;
  const times = readDepartmentPanelTimes();
  times[activePanelDepartment] += elapsed;
  writeDepartmentPanelTimes(times);

  activePanelDepartment = null;
  activePanelStartedAt = 0;
}

function assignDepartment() {
  stopDepartmentPanelTimer();
  const times = readDepartmentPanelTimes();
  const highestTime = Math.max(...requiredVisitedDepartments.map((id) => times[id]));
  const tiedDepartments = requiredVisitedDepartments.filter((id) => times[id] === highestTime);
  let assigned = tiedDepartments[0] || requiredVisitedDepartments[0];

  try {
    const lastInteracted = window.sessionStorage.getItem(lastInteractedDepartmentKey);
    if (tiedDepartments.includes(lastInteracted)) assigned = lastInteracted;
  } catch (error) {
    // Storage can be unavailable in private contexts; the fallback assignment still works.
  }

  try {
    window.sessionStorage.setItem(assignedDepartmentKey, assigned);
  } catch (error) {
    // Storage can be unavailable in private contexts; the fallback page still renders.
  }

  window.location.href = "employee-card.html";
}

function hasCompletedExploration() {
  try {
    const visited = JSON.parse(window.sessionStorage.getItem(visitedDepartmentsKey) || "{}");
    return requiredVisitedDepartments.every((id) => visited[id]);
  } catch (error) {
    return false;
  }
}

function updateOnboardedState() {
  const completed = hasCompletedExploration();
  page.classList.toggle("is-onboarded", completed);
  if (onboardBadge) {
    onboardBadge.setAttribute("aria-hidden", completed ? "false" : "true");
  }
}

function pentagonPoints(radius) {
  return Array.from({ length: 5 }, (_, index) => {
    const angle = ((index * 72 - 90) * Math.PI) / 180;
    const x = (centerX + radius * Math.cos(angle)).toFixed(1);
    const y = (centerY + radius * Math.sin(angle)).toFixed(1);
    return `${x},${y}`;
  }).join(" ");
}

document.querySelectorAll("[data-radius]").forEach((polygon) => {
  polygon.setAttribute("points", pentagonPoints(Number(polygon.dataset.radius)));
});

updateOnboardedState();

const timers = [];

function hasSeenLoading() {
  try {
    return window.sessionStorage.getItem(loadingSeenKey) === "true";
  } catch (error) {
    return false;
  }
}

function markLoadingSeen() {
  try {
    window.sessionStorage.setItem(loadingSeenKey, "true");
  } catch (error) {
    // Storage can be unavailable in private contexts; the page still works.
  }
}

function startDepartmentReveal(baseDelay = postLoadingDelay) {
  revealOrder.forEach((id, deptIndex) => {
    const button = document.querySelector(`[data-dept="${id}"]`);
    const start = baseDelay + deptIndex * deptStagger;

    timers.push(
      setTimeout(() => {
        button.classList.add("is-ready");
      }, start)
    );
  });
}

function prepareLoadingMorph() {
  const stageRect = stage.getBoundingClientRect();
  const markRect = loadingMark.getBoundingClientRect();
  const markShapeWidth = markRect.width * 0.951;
  const mapPentagonWidth = stageRect.width * (480 / 900);
  const finalScale = mapPentagonWidth / markShapeWidth;
  const finalX = stageRect.left + stageRect.width / 2 - (markRect.left + markRect.width / 2);
  const finalY = stageRect.top + stageRect.height / 2 - (markRect.top + markRect.height / 2);

  loadingOverlay.style.setProperty("--loading-final-x", `${finalX}px`);
  loadingOverlay.style.setProperty("--loading-final-y", `${finalY}px`);
  loadingOverlay.style.setProperty("--loading-final-scale", finalScale.toFixed(4));
}

function startLoading() {
  const duration     = 6000;
  const verifiedHold = 600;
  const start = performance.now();
  markLoadingSeen();
  loadingOverlay.classList.remove("is-verified");

  const scanElems = [
    loadingOverlay.querySelector(".loading-face-nav"),
    loadingOverlay.querySelector(".loading-scantrack"),
    loadingOverlay.querySelector(".loading-figure"),
  ].filter(Boolean);
  scanElems.forEach(el => { el.style.opacity = ""; });

  const scanrow = loadingOverlay.querySelector(".loading-scanrow");
  const SCAN_PERIOD   = 6400;
  const SCAN_RANGE    = 40;
  const SCAN_TARGET   = 25;
  const SETTLE_DUR    = 480;

  let scanPhase    = "sweeping";
  let currentScanY = 0;
  let settleStart  = null;
  let settleFrom   = 0;

  function scanTick(t) {
    if (scanPhase === "sweeping") {
      const phase = (t % SCAN_PERIOD) / SCAN_PERIOD;
      currentScanY = SCAN_RANGE * 0.5 * (1 - Math.cos(phase * Math.PI * 2));
      if (scanrow) scanrow.style.transform = `translateY(${currentScanY.toFixed(2)}vh)`;
      requestAnimationFrame(scanTick);
    } else if (scanPhase === "settling") {
      if (!settleStart) { settleFrom = currentScanY; settleStart = t; }
      const p = Math.min(1, (t - settleStart) / SETTLE_DUR);
      const ease = 1 - Math.pow(1 - p, 3);
      const y = settleFrom + (SCAN_TARGET - settleFrom) * ease;
      if (scanrow) scanrow.style.transform = `translateY(${y.toFixed(2)}vh)`;
      currentScanY = y;
      if (p < 1) requestAnimationFrame(scanTick);
      else scanPhase = "done";
    }
  }
  requestAnimationFrame(scanTick);

  function update(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const percent = Math.round(eased * 100);

    sharedLoadProgress = eased;
    sharedLoadLinear = progress;
    loadingOverlay.style.setProperty("--loading-progress", percent);
    loadingPercent.textContent = String(percent);

    if (progress < 1) {
      requestAnimationFrame(update);
      return;
    }

    scanPhase = "settling";
    loadingOverlay.classList.add("is-verified");

    window.setTimeout(() => {
      let fadeStart = null;
      const FADE_DUR = 400;

      function fadeOut(t) {
        if (!fadeStart) fadeStart = t;
        const p = Math.min(1, (t - fadeStart) / FADE_DUR);
        const opacity = Math.pow(1 - p, 2);
        scanElems.forEach(el => { el.style.opacity = opacity.toFixed(3); });

        if (p < 1) {
          requestAnimationFrame(fadeOut);
          return;
        }

        const onMorphDone = () => {
          page.classList.add("is-ready");
          loadingOverlay.classList.add("is-done");
          startDepartmentReveal(700);
        };
        const morph = initNodesCanvas();
        if (morph) morph(onMorphDone);
        else onMorphDone();
      }

      requestAnimationFrame(fadeOut);
    }, verifiedHold);
  }

  requestAnimationFrame(update);
}

if (hasSeenLoading()) {
  loadingOverlay.hidden = true;
  loadingOverlay.classList.add("is-done");
  page.classList.add("is-ready");
  startDepartmentReveal(80);
} else {
  startLoading();
}

function openDepartmentDetail(department) {
  window.clearTimeout(departmentDetailCloseTimer);
  startDepartmentPanelTimer(department.id);
  detailTitle.textContent = department.label;
  detailSubtitle.textContent = department.subtitle || "Department overview";
  detailCopy.textContent = department.description || "";
  detailMedia.className = `department-detail-media ${department.imageClass || ""}`;
  departmentDetail.classList.remove("is-from-mete", "is-from-wel", "is-from-hael", "is-from-lic", "is-from-lif");
  if (department.id) {
    departmentDetail.classList.add(`is-from-${department.id}`);
  }

  if (department.restricted) {
    detailImage.hidden = false;
    detailImage.src = department.image;
    detailLock.hidden = true;
    detailCopy.hidden = true;
    detailRestrictedCopy.hidden = false;
  } else {
    detailImage.hidden = false;
    detailLock.hidden = true;
    detailImage.src = department.image;
    detailCopy.hidden = false;
    detailRestrictedCopy.hidden = true;
  }

  departmentDetail.classList.add("is-open");
  departmentDetail.setAttribute("aria-hidden", "false");
}

function closeDepartmentDetail() {
  window.clearTimeout(departmentDetailCloseTimer);
  stopDepartmentPanelTimer();
  departmentDetail.classList.remove("is-open");
  departmentDetail.setAttribute("aria-hidden", "true");
}

function scheduleDepartmentDetailClose() {
  window.clearTimeout(departmentDetailCloseTimer);
  departmentDetailCloseTimer = window.setTimeout(closeDepartmentDetail, 140);
}

function openRestricted(department) {
  closeDepartmentDetail();
  restrictedTitle.textContent = department.label;
  restrictedSubtitle.textContent = department.subtitle || "Restricted department";
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("is-open"));
}

function closeRestricted() {
  overlay.classList.remove("is-open");
  window.setTimeout(() => {
    overlay.hidden = true;
  }, 200);
}

document.querySelectorAll("[data-dept]").forEach((button) => {
  function setDepartmentLabelHover(isHovered) {
    window.clearTimeout(departmentLabelHoverTimers.get(button));
    if (isHovered) {
      button.classList.add("is-hovered");
      return;
    }

    const timer = window.setTimeout(() => {
      button.classList.remove("is-hovered");
    }, 120);
    departmentLabelHoverTimers.set(button, timer);
  }

  function handleDepartmentEnter() {
    window.clearTimeout(departmentDetailCloseTimer);
    setDepartmentLabelHover(true);
    const id = button.dataset.dept;
    const department = departments[id];
    if (!button.classList.contains("is-ready")) return;
    openDepartmentDetail({ ...department, id });
  }

  button.addEventListener("pointerenter", handleDepartmentEnter);
  button.addEventListener("focus", handleDepartmentEnter);
  button.addEventListener("pointerleave", (event) => {
    if (getDepartmentLabelAtPoint(event.clientX, event.clientY) === button) return;
    setDepartmentLabelHover(false);
    scheduleDepartmentDetailClose();
  });
  button.addEventListener("blur", () => {
    setDepartmentLabelHover(false);
    closeDepartmentDetail();
  });

  button.addEventListener("click", () => {
    const id = button.dataset.dept;
    const department = departments[id];
    if (!button.classList.contains("is-ready")) return;

    if (department.restricted) {
      openRestricted(department);
      return;
    }

    if (department.route) {
      stopDepartmentPanelTimer();
      window.location.href = department.route;
    }
  });
});

function getDepartmentLabelAtPoint(x, y) {
  let matchedLabel = null;

  document.querySelectorAll("[data-dept].is-ready").forEach((button) => {
    const rect = button.getBoundingClientRect();
    const extraX = button.classList.contains("dept-wel") ? 96 : 54;
    const extraY = 34;
    const withinX = x >= rect.left - extraX && x <= rect.right + extraX;
    const withinY = y >= rect.top - extraY && y <= rect.bottom + extraY;
    if (withinX && withinY) matchedLabel = button;
  });

  return matchedLabel;
}

function syncDepartmentHoverFromPoint(x, y) {
  const nextLabel = getDepartmentLabelAtPoint(x, y);
  if (nextLabel === activeHoverLabel) return;

  if (activeHoverLabel) {
    window.clearTimeout(departmentLabelHoverTimers.get(activeHoverLabel));
    activeHoverLabel.classList.remove("is-hovered");
  }

  activeHoverLabel = nextLabel;

  if (activeHoverLabel) {
    activeHoverLabel.classList.add("is-hovered");
    const id = activeHoverLabel.dataset.dept;
    const department = departments[id];
    if (department) {
      window.clearTimeout(departmentDetailCloseTimer);
      openDepartmentDetail({ ...department, id });
    }
    return;
  }

  scheduleDepartmentDetailClose();
}

function isPointInsideOnboardBadge(x, y) {
  if (!onboardBadge || !page.classList.contains("is-onboarded")) return false;
  const rect = onboardBadge.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function setOnboardHover(isHovered) {
  if (!onboardBadge || isHovered === isOnboardHovering) return;
  isOnboardHovering = isHovered;
  onboardBadge.classList.toggle("is-hovered", isHovered);
  document.body.classList.toggle("cursor-glow-hovering", isHovered || Boolean(activeHoverLabel));
}

function syncOnboardHoverFromPoint(x, y) {
  setOnboardHover(isPointInsideOnboardBadge(x, y));
}

function activateOnboardBadge(event) {
  if (!hasCompletedExploration()) return;
  event.preventDefault();
  event.stopPropagation();
  assignDepartment();
}

if (onboardBadge) {
  onboardBadge.addEventListener("focus", () => {
    setOnboardHover(true);
  });

  onboardBadge.addEventListener("blur", () => {
    setOnboardHover(false);
  });

  document.addEventListener("click", (event) => {
    if (!isPointInsideOnboardBadge(event.clientX, event.clientY)) return;
    activateOnboardBadge(event);
  }, true);
}

stage.addEventListener("mousemove", (event) => {
  const rect = stage.getBoundingClientRect();
  const normX = (event.clientX - rect.left - rect.width / 2) / rect.width;
  const normY = (event.clientY - rect.top - rect.height / 2) / rect.height;
  stage.style.setProperty("--tilt-x", `${normY * 8}deg`);
  stage.style.setProperty("--tilt-y", `${normX * -12}deg`);
  syncDepartmentHoverFromPoint(event.clientX, event.clientY);
  syncOnboardHoverFromPoint(event.clientX, event.clientY);
});

stage.addEventListener("mouseleave", () => {
  stage.style.setProperty("--tilt-x", "0deg");
  stage.style.setProperty("--tilt-y", "0deg");
  if (activeHoverLabel) {
    activeHoverLabel.classList.remove("is-hovered");
    activeHoverLabel = null;
  }
  setOnboardHover(false);
  closeDepartmentDetail();
});

overlay.addEventListener("click", closeRestricted);
dismissButton.addEventListener("click", closeRestricted);

document.querySelector(".restricted-modal").addEventListener("click", (event) => {
  event.stopPropagation();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !overlay.hidden) closeRestricted();
});

window.addEventListener("beforeunload", () => {
  stopDepartmentPanelTimer();
  timers.forEach(clearTimeout);
});

function initNodesCanvas() {
  const canvas = document.querySelector("[data-nodes-canvas]");
  if (!canvas) return null;

  const ctx = canvas.getContext("2d");
  const TAU = Math.PI * 2;
  const N = 5;
  let W, H;

  function resize() {
    W = canvas.width = canvas.offsetWidth || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const spread = Math.min(window.innerWidth, window.innerHeight);
  const amp = spread * 0.28;
  const r1  = spread * 0.36;
  const CY  = 0.45;
  const B   = 0.80;

  function eo3(t) { return 1 - Math.pow(1 - t, 3); }
  function lp(a, b, t) { return a + (b - a) * t; }

  function makeNode(a) {
    return {
      ax: a * (0.6 + Math.random() * 0.8), ax2: a * (0.2 + Math.random() * 0.3),
      ay: a * (0.6 + Math.random() * 0.8), ay2: a * (0.2 + Math.random() * 0.3),
      az: a * (0.5 + Math.random() * 0.7),
      fx: TAU / (18000 + Math.random() * 16000), fx2: TAU / (7000 + Math.random() * 8000),
      fy: TAU / (18000 + Math.random() * 16000), fy2: TAU / (7000 + Math.random() * 8000),
      fz: TAU / (14000 + Math.random() * 12000),
      px: Math.random() * TAU, px2: Math.random() * TAU,
      py: Math.random() * TAU, py2: Math.random() * TAU,
      pz: Math.random() * TAU,
      rotFreq: 0.000022 + Math.random() * 0.000020,
      rotPhase: Math.random() * TAU,
    };
  }

  const mainNodes = Array.from({ length: N }, () => makeNode(amp));

  function nodePos(node, t) {
    return [
      Math.sin(t * node.fx  + node.px)  * node.ax  + Math.sin(t * node.fx2 + node.px2) * node.ax2,
      Math.sin(t * node.fy  + node.py)  * node.ay  + Math.sin(t * node.fy2 + node.py2) * node.ay2,
      Math.sin(t * node.fz  + node.pz)  * node.az,
    ];
  }

  function rotXY(pts, rx, ry) {
    return pts
      .map(([x, y, z]) => [x, y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)])
      .map(([x, y, z]) => [x * Math.cos(ry) + z * Math.sin(ry), y, -x * Math.sin(ry) + z * Math.cos(ry)]);
  }

  function proj([x, y, z]) {
    const fov = 900, s = fov / (z + fov);
    return [x * s + W / 2, y * s + H * CY, s];
  }

  function getNodePts(t) {
    return mainNodes.map((n) => {
      const rx = Math.sin(t * n.rotFreq * 0.7 + n.rotPhase) * 0.22;
      const ry = Math.sin(t * n.rotFreq       + n.rotPhase) * 0.30;
      return rotXY([nodePos(n, t)], rx, ry).map(proj)[0];
    });
  }

  function drawGenNodes(pts, b) {
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const [x1, y1, s1] = pts[i];
        const [x2, y2, s2] = pts[j];
        const dist = Math.hypot(x2 - x1, y2 - y1);
        const fade = Math.max(0, 1 - dist / (spread * 0.90));
        if (fade < 0.04) continue;
        const s = (s1 + s2) / 2;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(255,255,255,${(b * s * fade * 0.9).toFixed(3)})`;
        ctx.lineWidth = s * fade * 0.65;
        ctx.stroke();
      }
    }
    pts.forEach(([x, y, s]) => {
      ctx.beginPath(); ctx.arc(x, y, 5.5 * s, 0, TAU);
      ctx.strokeStyle = `rgba(255,255,255,${(b * s * 0.75).toFixed(3)})`;
      ctx.lineWidth = s * 0.55; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 2 * s, 0, TAU);
      ctx.fillStyle = `rgba(255,255,255,${(b * s).toFixed(3)})`; ctx.fill();
    });
  }

  // Canvas stays dark during Phase 1 (scan). morph() starts Phase 2.
  return function morph(done) {
    const cy = H * CY;

    const svgEl = document.querySelector(".pentagon-map");
    let mapR  = r1 * 0.28;
    let mapCY = cy;
    if (svgEl) {
      const svgRect = svgEl.getBoundingClientRect();
      mapR  = 140 * (svgRect.width / 900);
      mapCY = svgRect.top + (310 / 620) * svgRect.height;
    }

    // Pentagon vertex 2D positions for convergence target
    const pentPts2D = Array.from({ length: N }, (_, i) => {
      const a = (i / N) * TAU - TAU / 4;
      return [W / 2 + Math.cos(a) * r1, cy + Math.sin(a) * r1];
    });

    const FADE_IN_DUR = 1200;
    const DRIFT_DUR   = 5500;
    const CONV_DUR    = 900;
    const MOVE_DUR    = 600;
    const CONV_START  = FADE_IN_DUR + DRIFT_DUR;
    const MOVE_START  = CONV_START + CONV_DUR;

    let morphStart    = null;
    let convSnap      = null;
    let callbackFired = false;

    function morphTick(t) {
      if (!morphStart) morphStart = t;
      const elapsed = t - morphStart;

      const fadeAlpha = eo3(Math.min(1, elapsed / FADE_IN_DUR));
      const convT     = Math.min(1, Math.max(0, (elapsed - CONV_START) / CONV_DUR));
      const convEase  = eo3(convT);
      const moveT     = Math.min(1, Math.max(0, (elapsed - MOVE_START) / MOVE_DUR));
      const moveEase  = eo3(moveT);

      if (moveT > 0) {
        // MOVE: clean pentagon scales down to map position at full brightness;
        // the overlay's is-done CSS fade handles the final exit
        ctx.clearRect(0, 0, W, H);
        const curR  = lp(r1, mapR, moveEase);
        const curCY = lp(cy, mapCY, moveEase);
        const b     = B;

        if (b > 0.01) {
          for (let i = 0; i < N; i++) {
            const j  = (i + 1) % N;
            const ai = (i / N) * TAU - TAU / 4;
            const aj = (j / N) * TAU - TAU / 4;
            ctx.beginPath();
            ctx.moveTo(W / 2 + Math.cos(ai) * curR, curCY + Math.sin(ai) * curR);
            ctx.lineTo(W / 2 + Math.cos(aj) * curR, curCY + Math.sin(aj) * curR);
            ctx.strokeStyle = `rgba(255,255,255,${(b * 0.9).toFixed(3)})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
          for (let i = 0; i < N; i++) {
            const a = (i / N) * TAU - TAU / 4;
            ctx.beginPath();
            ctx.arc(W / 2 + Math.cos(a) * curR, curCY + Math.sin(a) * curR, 2.5, 0, TAU);
            ctx.fillStyle = `rgba(255,255,255,${b.toFixed(3)})`;
            ctx.fill();
          }
        }

        if (moveT >= 1) {
          if (!callbackFired) { callbackFired = true; if (done) done(); }
          return;
        }
      } else if (convT > 0) {
        // CONV: continue trail fade (no clearRect flash), lerp toward pentagon vertices,
        // fade diagonals + rings so CONV end already looks like clean pentagon
        if (!convSnap) {
          convSnap = getNodePts(t);
        }

        const trailKeep = lp(0.75, 0.52, convEase);
        ctx.globalCompositeOperation = "destination-in";
        ctx.fillStyle = `rgba(0,0,0,${trailKeep.toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "source-over";

        const b        = B * fadeAlpha;
        const starFade = 1 - convEase;
        const ringFade = 1 - convEase;

        for (let i = 0; i < N; i++) {
          for (let j = i + 1; j < N; j++) {
            const diff    = j - i;
            const isEdge  = diff === 1 || diff === N - 1;
            const connAlpha = isEdge ? 1.0 : starFade;
            if (connAlpha < 0.01) continue;
            const x1 = lp(convSnap[i][0], pentPts2D[i][0], convEase);
            const y1 = lp(convSnap[i][1], pentPts2D[i][1], convEase);
            const x2 = lp(convSnap[j][0], pentPts2D[j][0], convEase);
            const y2 = lp(convSnap[j][1], pentPts2D[j][1], convEase);
            const dist = Math.hypot(x2 - x1, y2 - y1);
            const fade = Math.max(0, 1 - dist / (spread * 0.90)) * connAlpha;
            if (fade < 0.04) continue;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(255,255,255,${(b * fade * 0.9).toFixed(3)})`;
            ctx.lineWidth = fade * 0.65;
            ctx.stroke();
          }
        }
        for (let i = 0; i < N; i++) {
          const x = lp(convSnap[i][0], pentPts2D[i][0], convEase);
          const y = lp(convSnap[i][1], pentPts2D[i][1], convEase);
          if (ringFade > 0.02) {
            ctx.beginPath(); ctx.arc(x, y, 5.5, 0, TAU);
            ctx.strokeStyle = `rgba(255,255,255,${(b * 0.75 * ringFade).toFixed(3)})`;
            ctx.lineWidth = 0.55; ctx.stroke();
          }
          ctx.beginPath(); ctx.arc(x, y, 2, 0, TAU);
          ctx.fillStyle = `rgba(255,255,255,${b.toFixed(3)})`; ctx.fill();
        }
      } else {
        // FADE_IN + DRIFT: generative node motion with trail
        ctx.globalCompositeOperation = "destination-in";
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "source-over";
        drawGenNodes(getNodePts(t), B * fadeAlpha);
      }

      requestAnimationFrame(morphTick);
    }

    requestAnimationFrame(morphTick);
  };
}

