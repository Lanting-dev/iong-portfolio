const scene = document.querySelector("#mete-scroll");

const product = document.querySelector('[data-animate="product"]');
const bottleClosed = document.querySelector('[data-animate="bottleClosed"]');
const bottleOpen = document.querySelector('[data-animate="bottleOpen"]');
const cap = document.querySelector('[data-animate="cap"]');
const substrate = document.querySelector('[data-animate="substrate"]');
const pageTitle = document.querySelector('[data-animate="pageTitle"]');
const productIntro = document.querySelector('[data-animate="productIntro"]');
const proteinIntroImage = document.querySelector(".protein-intro-image");
const productIntroTwo = document.querySelector('[data-animate="productIntroTwo"]');
const productIntroThree = document.querySelector('[data-animate="productIntroThree"]');

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function mix(from, to, amount) {
  return from + (to - from) * amount;
}

function transformRange(progress, input, output) {
  if (progress <= input[0]) return output[0];

  for (let index = 1; index < input.length; index += 1) {
    if (progress <= input[index]) {
      const localProgress = (progress - input[index - 1]) / (input[index] - input[index - 1]);
      return mix(output[index - 1], output[index], clamp(localProgress));
    }
  }

  return output[output.length - 1];
}

function setOpacity(element, value) {
  element.style.opacity = clamp(value).toFixed(4);
}

function setStaggerText(section, progress) {
  const title = section.querySelector('[data-stagger="title"]');
  const subtitle = section.querySelector('[data-stagger="subtitle"]');
  const bodyItems = section.querySelectorAll('[data-stagger="body"]');
  const items = [
    { element: title, start: 0, end: 0.38 },
    { element: subtitle, start: 0.18, end: 0.58 },
    ...Array.from(bodyItems).map((element, index) => ({
      element,
      start: 0.34 + index * 0.16,
      end: 1
    }))
  ];

  items.forEach(({ element, start, end }) => {
    if (!element) return;
    const localProgress = transformRange(progress, [start, end], [0, 1]);
    const y = transformRange(localProgress, [0, 1], [10, 0]);
    element.style.opacity = localProgress.toFixed(4);
    element.style.setProperty("--stagger-y", `${y}px`);
  });
}

function setIntroFigmaScale(element, scale, introX, variant = "one") {
  const frameWidth = 1920 * scale;
  const frameHeight = 1220 * scale;
  const frameLeft = (window.innerWidth - frameWidth) / 2;
  const frameTop = (window.innerHeight - frameHeight) / 2;
  const proteinYOffset = variant === "one" ? 72 * scale : 0;

  const values = {
    "--intro-left": frameLeft + 252 * scale,
    "--intro-top": frameTop + 398 * scale,
    "--intro-width": 1416 * scale,
    "--intro-height": 423 * scale,
    "--intro-copy-width": 384 * scale,
    "--intro-copy-gap": 16 * scale,
    "--intro-h2-size": 24 * scale,
    "--intro-h2-spacing": 3 * scale,
    "--intro-h3-size": 16 * scale,
    "--intro-h3-spacing": 2 * scale,
    "--intro-body-size": 16 * scale,
    "--intro-body-spacing": 2 * scale,
    "--intro-image-width": 736 * scale,
    "--intro-image-height": 423 * scale,
    "--intro-line-left": 408 * scale,
    "--intro-line-top": 211.5 * scale,
    "--intro-line-width": 300 * scale,
    "--intro-line-height": 11 * scale,
    "--intro-x": introX,
    "--protein-heading-width": 1680 * scale,
    "--protein-kicker-top": frameTop + 128.5 * scale + proteinYOffset,
    "--protein-title-top": frameTop + 190.5 * scale + proteinYOffset,
    "--protein-group-left": frameLeft + 130.5 * scale,
    "--protein-group-top": frameTop + 398.5 * scale + proteinYOffset,
    "--protein-group-width": 1659 * scale,
    "--protein-group-height": 423 * scale,
    "--protein-group-gap": 24 * scale,
    "--protein-benefits-width": 899 * scale,
    "--protein-benefits-gap": 42 * scale,
    "--protein-benefit-gap": 39 * scale,
    "--protein-icon-size": 126 * scale,
    "--protein-benefit-copy-width": 734 * scale,
    "--protein-benefit-copy-gap": 19 * scale
  };

  if (variant === "two") {
    values["--intro-image-width"] = 736 * scale;
    values["--intro-image-height"] = 432 * scale;
    values["--detail-heading-width"] = 1680 * scale;
    values["--detail-kicker-top"] = frameTop + 261 * scale;
    values["--detail-title-top"] = frameTop + 323 * scale;
    values["--detail-group-left"] = frameLeft + 130.5 * scale;
    values["--detail-group-top"] = frameTop + 526.5 * scale;
    values["--detail-group-height"] = 432 * scale;
    values["--detail-image-height"] = 432 * scale;
  }

  if (variant === "three") {
    values["--intro-image-width"] = 736 * scale;
    values["--intro-image-height"] = 423 * scale;
    values["--detail-heading-width"] = 1680 * scale;
    values["--detail-kicker-top"] = frameTop + 263 * scale;
    values["--detail-title-top"] = frameTop + 325 * scale;
    values["--detail-group-left"] = frameLeft + 130.5 * scale;
    values["--detail-group-top"] = frameTop + 533.5 * scale;
    values["--detail-group-height"] = 423 * scale;
    values["--detail-image-height"] = 423 * scale;
  }

  Object.entries(values).forEach(([property, value]) => {
    element.style.setProperty(property, `${value}px`);
  });
}

function updateMeteAnimation() {
  const rect = scene.getBoundingClientRect();
  const distance = rect.height - window.innerHeight;
  const progress = distance > 0 ? clamp(-rect.top / distance) : 0;

  const productY = transformRange(progress, [0, 0.16, 1], [-420, 0, 0]);
  const productScale = transformRange(progress, [0, 0.16, 0.62, 0.78], [0.72, 1, 1, 0.74]);
  const pageTitleOpacity = transformRange(progress, [0, 0.18, 0.28], [1, 1, 0]);
  const pageTitleY = transformRange(progress, [0.18, 0.28], [0, -18]);

  const capY = transformRange(progress, [0.34, 0.46, 0.68, 0.78], [0, 145, 240, 520]);
  const capX = transformRange(progress, [0.34, 0.46, 0.68, 0.78], [0, -32, -82, 460]);
  const capRotate = transformRange(progress, [0.34, 0.46, 0.68, 0.78], [0, -18, -34, 18]);
  const capOpacity = transformRange(progress, [0, 0.339, 0.34, 0.76, 0.79], [0, 0, 1, 1, 0]);

  const closedOpacity = transformRange(progress, [0, 0.339, 0.34], [1, 1, 0]);
  const openOpacity = transformRange(progress, [0, 0.339, 0.34, 0.76, 0.79], [0, 0, 1, 1, 0]);
  const bottleRotate = transformRange(progress, [0.38, 0.64, 0.68, 0.78], [0, 9, 14, 24]);
  const bottleX = transformRange(progress, [0.38, 0.68, 0.78], [0, 36, 520]);
  const bottleY = transformRange(progress, [0.68, 0.78], [0, -360]);

  const subOpacity = transformRange(progress, [0.5, 0.62, 0.735, 0.765], [0, 1, 1, 0]);
  const subY = transformRange(progress, [0.5, 0.68, 0.765, 1], [120, 260, 70, 70]);
  const subX = transformRange(progress, [0.5, 0.68, 0.765, 1], [0, -20, -300, -300]);
  const subScale = transformRange(progress, [0.5, 0.68, 0.765, 1], [0.34, 1.08, 2.35, 2.35]);
  const subRotate = transformRange(progress, [0.5, 0.72], [-12, 0]);

  const introOpacity = transformRange(progress, [0.7, 0.76, 0.84, 0.89], [0, 1, 1, 0]);
  const proteinImageOpacity = transformRange(progress, [0, 0.758, 0.79], [0, 0, 1]);
  const introX = transformRange(progress, [0.7, 0.76, 0.84, 0.89], [-24, 0, 0, -20]);
  const introTextProgress = transformRange(progress, [0.72, 0.83], [0, 1]);
  const introTwoOpacity = transformRange(progress, [0.86, 0.91, 0.95, 0.98], [0, 1, 1, 0]);
  const introTwoX = transformRange(progress, [0.86, 0.91, 0.95, 0.98], [24, 0, 0, -20]);
  const introTwoTextProgress = transformRange(progress, [0.88, 0.96], [0, 1]);
  const introThreeOpacity = transformRange(progress, [0.96, 0.99, 1], [0, 1, 1]);
  const introThreeX = transformRange(progress, [0.96, 0.99], [0, 0]);
  const introThreeTextProgress = transformRange(progress, [0.97, 1], [0, 1]);

  product.style.transform = `translate3d(0, ${productY}px, 0) scale(${productScale})`;
  setOpacity(product, 1);
  pageTitle.style.transform = `translate3d(-50%, ${pageTitleY}px, 0)`;
  setOpacity(pageTitle, pageTitleOpacity);

  bottleClosed.style.transform = `translate3d(${bottleX}px, ${bottleY}px, 0) rotate(${bottleRotate}deg)`;
  setOpacity(bottleClosed, closedOpacity);

  bottleOpen.style.transform = `translate3d(${bottleX}px, ${bottleY}px, 0) rotate(${bottleRotate}deg)`;
  setOpacity(bottleOpen, openOpacity);

  cap.style.transform = `translate3d(${capX}px, ${capY}px, 0) rotate(${capRotate}deg)`;
  setOpacity(cap, capOpacity);

  substrate.style.transform = `translate3d(${subX}px, ${subY}px, 0) scale(${subScale}) rotate(${subRotate}deg)`;
  setOpacity(substrate, subOpacity);

  const introScale = Math.min(window.innerWidth / 1920, window.innerHeight / 1220);
  setIntroFigmaScale(productIntro, introScale, introX, "one");
  setOpacity(productIntro, introOpacity);
  setOpacity(proteinIntroImage, proteinImageOpacity);
  setStaggerText(productIntro, introTextProgress);
  setIntroFigmaScale(productIntroTwo, introScale, introTwoX, "two");
  setOpacity(productIntroTwo, introTwoOpacity);
  setStaggerText(productIntroTwo, introTwoTextProgress);
  setIntroFigmaScale(productIntroThree, introScale, introThreeX, "three");
  setOpacity(productIntroThree, introThreeOpacity);
  setStaggerText(productIntroThree, introThreeTextProgress);
}

window.addEventListener("scroll", updateMeteAnimation, { passive: true });
window.addEventListener("resize", updateMeteAnimation);
updateMeteAnimation();
