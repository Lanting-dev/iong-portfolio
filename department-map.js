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
    imageClass: "is-locked"
  },
  lif: {
    label: "LIF CONTINUITY",
    restricted: true,
    subtitle: "Population monitoring",
    description:
      "Lif Continuity monitors long-term population stability through restricted forecasting systems. Access requires authorization beyond employee-level browsing.",
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
let departmentDetailCloseTimer = null;

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
  const duration = 5000;
  const completeHold = 620;
  const morphDuration = 980;
  const start = performance.now();
  markLoadingSeen();
  loadingOverlay.classList.remove("is-verified");

  function update(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const percent = Math.round(eased * 100);
    const shapeHeight = loadingOverlay.querySelector(".loading-shape-frame").getBoundingClientRect().height;

    loadingOverlay.style.setProperty("--loading-progress", percent);
    loadingOverlay.style.setProperty("--loading-shape-height", `${shapeHeight}px`);
    loadingPercent.textContent = String(percent);
    loadingOverlay.classList.toggle("is-verified", percent >= 100);

    if (progress < 1) {
      requestAnimationFrame(update);
      return;
    }

    window.setTimeout(() => {
      prepareLoadingMorph();
      page.classList.add("is-ready");
      loadingOverlay.classList.add("is-morph");
      startDepartmentReveal(700);

      window.setTimeout(() => {
        loadingOverlay.classList.add("is-done");
      }, morphDuration);
    }, completeHold);
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
  detailTitle.textContent = department.label;
  detailSubtitle.textContent = department.subtitle || "Department overview";
  detailCopy.textContent = department.description || "";
  detailMedia.className = `department-detail-media ${department.imageClass || ""}`;

  if (department.restricted) {
    detailImage.hidden = true;
    detailLock.hidden = false;
  } else {
    detailImage.hidden = false;
    detailLock.hidden = true;
    detailImage.src = department.image;
  }

  departmentDetail.classList.add("is-open");
  departmentDetail.setAttribute("aria-hidden", "false");
}

function closeDepartmentDetail() {
  window.clearTimeout(departmentDetailCloseTimer);
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
  function handleDepartmentEnter() {
    window.clearTimeout(departmentDetailCloseTimer);
    const department = departments[button.dataset.dept];
    if (!button.classList.contains("is-ready")) return;
    if (department.restricted) {
      closeDepartmentDetail();
      return;
    }
    openDepartmentDetail(department);
  }

  button.addEventListener("pointerenter", handleDepartmentEnter);
  button.addEventListener("focus", handleDepartmentEnter);
  button.addEventListener("pointerleave", scheduleDepartmentDetailClose);
  button.addEventListener("blur", closeDepartmentDetail);

  button.addEventListener("click", () => {
    const department = departments[button.dataset.dept];
    if (!button.classList.contains("is-ready")) return;

    if (department.restricted) {
      openRestricted(department);
      return;
    }

    if (department.route) {
      window.location.href = department.route;
    }
  });
});

stage.addEventListener("mousemove", (event) => {
  const rect = stage.getBoundingClientRect();
  const normX = (event.clientX - rect.left - rect.width / 2) / rect.width;
  const normY = (event.clientY - rect.top - rect.height / 2) / rect.height;
  stage.style.setProperty("--tilt-x", `${normY * 8}deg`);
  stage.style.setProperty("--tilt-y", `${normX * -12}deg`);
});

stage.addEventListener("mouseleave", () => {
  stage.style.setProperty("--tilt-x", "0deg");
  stage.style.setProperty("--tilt-y", "0deg");
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
  timers.forEach(clearTimeout);
});
