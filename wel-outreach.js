const processTrack = document.querySelector("[data-process-track]");
const processCards = Array.from(document.querySelectorAll(".process-card"));
const processNodes = Array.from(document.querySelectorAll(".process-node"));
const revealItems = Array.from(document.querySelectorAll(".page-title, .process h2, .process-node, .process-card"));
const energizedTimers = new WeakMap();

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function updateFlowCurrent() {
  if (!processTrack) return;

  const rect = processTrack.getBoundingClientRect();
  const viewportGuide = window.innerHeight * 0.48;
  const progress = clamp((viewportGuide - rect.top) / rect.height);
  const pulseOpacity = rect.top < window.innerHeight * 0.86 && rect.bottom > window.innerHeight * 0.14 ? 1 : 0;

  processTrack.style.setProperty("--flow-progress", progress.toFixed(4));
  processTrack.style.setProperty("--flow-pulse-opacity", pulseOpacity);

}

function energizeElement(element) {
  window.clearTimeout(energizedTimers.get(element));
  element.classList.remove("is-energized");

  requestAnimationFrame(() => {
    element.classList.add("is-energized");
    energizedTimers.set(
      element,
      window.setTimeout(() => {
        element.classList.remove("is-energized");
      }, 760)
    );
  });
}

function setupStepReveal() {
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    processNodes.forEach((node) => node.classList.add("is-active"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    {
      root: null,
      threshold: 0.2,
      rootMargin: "0px 0px -12% 0px"
    }
  );

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const wasActive = entry.target.classList.contains("is-active");
        entry.target.classList.toggle("is-active", entry.isIntersecting);
        if (entry.isIntersecting && !wasActive) {
          energizeElement(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.55,
      rootMargin: "-22% 0px -22% 0px"
    }
  );

  revealItems.forEach((item) => {
    revealObserver.observe(item);
  });

  processCards.forEach((card) => {
    activeObserver.observe(card);
  });

  processNodes.forEach((node) => {
    activeObserver.observe(node);
  });
}

window.addEventListener("scroll", updateFlowCurrent, { passive: true });
window.addEventListener("resize", updateFlowCurrent);
setupStepReveal();
updateFlowCurrent();
