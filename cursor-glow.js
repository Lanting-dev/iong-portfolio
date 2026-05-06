(function () {
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!finePointer) return;

  const style = document.createElement("style");
  style.textContent = `
    html.cursor-glow-ready,
    html.cursor-glow-ready *,
    html.cursor-glow-ready *::before,
    html.cursor-glow-ready *::after {
      cursor: none !important;
    }

    .cursor-glow,
    .cursor-glow-dot {
      position: fixed;
      left: 0;
      top: 0;
      pointer-events: none;
      z-index: 2147483647;
      opacity: 0;
      transition: opacity 180ms ease;
      will-change: transform, opacity;
    }

    .cursor-glow {
      width: 220px;
      height: 220px;
      margin-left: -110px;
      margin-top: -110px;
      border-radius: 50%;
      background:
        radial-gradient(circle,
          rgba(232, 234, 235, 0.08) 0%,
          rgba(42, 138, 122, 0.1) 20%,
          rgba(42, 138, 122, 0.04) 48%,
          rgba(42, 138, 122, 0) 76%);
      mix-blend-mode: screen;
      filter: blur(2px);
    }

    .cursor-glow-dot {
      width: 28px;
      height: 28px;
      margin-left: -14px;
      margin-top: -14px;
      border-radius: 50%;
      background: transparent;
    }

    .cursor-glow-dot::before,
    .cursor-glow-dot::after {
      content: "";
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      transition:
        inset 160ms cubic-bezier(0.22, 1, 0.36, 1),
        border-color 160ms ease,
        background 160ms ease,
        box-shadow 160ms ease,
        opacity 160ms ease,
        scale 160ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .cursor-glow-dot::before {
      inset: 9px;
      background: rgba(232, 234, 235, 0.46);
      box-shadow:
        0 0 6px rgba(232, 234, 235, 0.22),
        0 0 16px rgba(42, 138, 122, 0.22);
      opacity: 1;
    }

    .cursor-glow-dot::after {
      inset: 4px;
      border: 1px solid rgba(232, 234, 235, 0.34);
      opacity: 0.45;
    }

    body.cursor-glow-active .cursor-glow,
    body.cursor-glow-active .cursor-glow-dot {
      opacity: 1;
    }

    body.cursor-glow-hovering .cursor-glow {
      opacity: 0.42;
    }

    body.cursor-glow-hovering .cursor-glow-dot {
      opacity: 1;
    }

    body.cursor-glow-hovering .cursor-glow-dot::before {
      inset: 7px;
      opacity: 1;
      border: 1px solid rgba(232, 234, 235, 0.86);
      background: transparent;
      box-shadow:
        0 0 8px rgba(232, 234, 235, 0.22),
        inset 0 0 7px rgba(232, 234, 235, 0.1);
    }

    body.cursor-glow-hovering .cursor-glow-dot::after {
      inset: 3px;
      opacity: 0.22;
    }

    body.cursor-glow-pressed .cursor-glow-dot::before,
    body.cursor-glow-pressed .cursor-glow-dot::after {
      scale: 0.76;
    }

  `;
  document.head.appendChild(style);
  document.documentElement.classList.add("cursor-glow-ready");

  const glow = document.createElement("div");
  const dot = document.createElement("div");
  glow.className = "cursor-glow";
  dot.className = "cursor-glow-dot";
  document.body.append(glow, dot);

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let glowX = targetX;
  let glowY = targetY;
  let dotX = targetX;
  let dotY = targetY;

  function isInteractiveTarget(target) {
    if (!(target instanceof Element)) return false;

    return Boolean(target.closest([
      "a",
      "button",
      "input",
      "textarea",
      "select",
      "summary",
      "[role='button']",
      "[tabindex]:not([tabindex='-1'])",
      ".dept-label"
    ].join(",")));
  }

  function render() {
    const glowEase = reducedMotion ? 1 : 0.1;
    const dotEase = reducedMotion ? 1 : 0.32;

    glowX += (targetX - glowX) * glowEase;
    glowY += (targetY - glowY) * glowEase;
    dotX += (targetX - dotX) * dotEase;
    dotY += (targetY - dotY) * dotEase;

    glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;

    requestAnimationFrame(render);
  }

  window.addEventListener("pointermove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    document.body.classList.add("cursor-glow-active");
    document.body.classList.toggle("cursor-glow-hovering", isInteractiveTarget(event.target));
  }, { passive: true });

  window.addEventListener("pointerleave", () => {
    document.body.classList.remove("cursor-glow-active");
    document.body.classList.remove("cursor-glow-hovering");
    document.body.classList.remove("cursor-glow-pressed");
  });

  window.addEventListener("pointerdown", () => {
    document.body.classList.add("cursor-glow-pressed");
  }, { passive: true });

  window.addEventListener("pointerup", () => {
    document.body.classList.remove("cursor-glow-pressed");
  }, { passive: true });

  requestAnimationFrame(render);
})();
