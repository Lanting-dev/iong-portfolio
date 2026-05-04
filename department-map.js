const departments = {
  mete: {
    label: "METE SYSTEMS",
    restricted: false,
    route: "index.html"
  },
  wel: {
    label: "WĒL OUTREACH",
    restricted: false,
    route: "#wel"
  },
  lic: {
    label: "LÍC ANALYTICS",
    restricted: true,
    subtitle: "Data processing"
  },
  lif: {
    label: "LIF CONTINUITY",
    restricted: true,
    subtitle: "Population monitoring"
  },
  hael: {
    label: "HÆL INTELLIGENCE",
    restricted: false,
    route: "hael-intelligence.html"
  }
};

const revealOrder = ["mete", "hael", "wel", "lif", "lic"];
const deptStagger = 220;
const postLoadingDelay = 760;
const centerX = 450;
const centerY = 310;

const stage = document.querySelector("[data-map-stage]");
const page = document.querySelector(".department-page");
const loadingOverlay = document.querySelector("[data-loading]");
const loadingPercent = document.querySelector("[data-loading-percent]");
const overlay = document.querySelector("[data-restricted]");
const dismissButton = document.querySelector("[data-dismiss]");
const restrictedTitle = document.querySelector("[data-restricted-title]");
const restrictedSubtitle = document.querySelector("[data-restricted-subtitle]");

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

function startDepartmentReveal() {
  revealOrder.forEach((id, deptIndex) => {
    const button = document.querySelector(`[data-dept="${id}"]`);
    const start = postLoadingDelay + deptIndex * deptStagger;

    timers.push(
      setTimeout(() => {
        button.classList.add("is-ready");
      }, start)
    );
  });
}

function startLoading() {
  const duration = 3600;
  const completeHold = 120;
  const start = performance.now();

  function update(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const percent = Math.round(eased * 100);
    const shapeHeight = loadingOverlay.querySelector(".loading-shape-frame").getBoundingClientRect().height;

    loadingOverlay.style.setProperty("--loading-progress", percent);
    loadingOverlay.style.setProperty("--loading-shape-height", `${shapeHeight}px`);
    loadingPercent.textContent = String(percent);

    if (progress < 1) {
      requestAnimationFrame(update);
      return;
    }

    window.setTimeout(() => {
      page.classList.add("is-ready");
      loadingOverlay.classList.add("is-done");
      startDepartmentReveal();
    }, completeHold);
  }

  requestAnimationFrame(update);
}

startLoading();

function openRestricted(department) {
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
