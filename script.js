const scene = document.querySelector("#mete-scroll");

const product = document.querySelector('[data-animate="product"]');
const bottleClosed = document.querySelector('[data-animate="bottleClosed"]');
const bottleOpen = document.querySelector('[data-animate="bottleOpen"]');
const cap = document.querySelector('[data-animate="cap"]');
const substrate = document.querySelector('[data-animate="substrate"]');
const productIntro = document.querySelector('[data-animate="productIntro"]');
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
  const body = section.querySelector('[data-stagger="body"]');
  const items = [
    { element: title, start: 0, end: 0.38 },
    { element: subtitle, start: 0.18, end: 0.58 },
    { element: body, start: 0.34, end: 1 }
  ];

  items.forEach(({ element, start, end }) => {
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
    "--intro-x": introX
  };

  if (variant === "two") {
    values["--intro-image-width"] = 736 * scale;
    values["--intro-image-height"] = 432 * scale;
    values["--intro-two-image-width"] = 736 * scale;
    values["--intro-two-image-height"] = 432 * scale;
    values["--intro-two-line-left"] = 599 * scale;
    values["--intro-two-line-top"] = 212 * scale;
    values["--intro-two-line-width"] = 409 * scale;
    values["--intro-two-line-height"] = 11 * scale;
  }

  if (variant === "three") {
    values["--intro-three-left"] = frameLeft;
    values["--intro-three-top"] = frameTop;
    values["--intro-three-width"] = 1920 * scale;
    values["--intro-three-height"] = 1220 * scale;
    values["--intro-three-copy-top"] = 246 * scale;
    values["--intro-three-image-top"] = 637 * scale;
    values["--intro-three-line-top"] = 440 * scale;
    values["--intro-three-line-width"] = 194 * scale;
    values["--intro-three-line-height"] = 11 * scale;
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
  const productOpacity = transformRange(progress, [0, 0.58, 0.65], [1, 1, 0]);

  const capY = transformRange(progress, [0.34, 0.46, 0.68], [0, 145, 240]);
  const capX = transformRange(progress, [0.34, 0.46, 0.68], [0, -32, -82]);
  const capRotate = transformRange(progress, [0.34, 0.46, 0.68], [0, -18, -34]);
  const capOpacity = transformRange(progress, [0, 0.339, 0.34, 0.7, 0.86], [0, 0, 1, 1, 0]);

  const closedOpacity = transformRange(progress, [0, 0.339, 0.34], [1, 1, 0]);
  const openOpacity = transformRange(progress, [0, 0.339, 0.34, 0.8], [0, 0, 1, 1]);
  const bottleRotate = transformRange(progress, [0.38, 0.64, 0.78], [0, 9, 14]);
  const bottleX = transformRange(progress, [0.38, 0.7], [0, 36]);

  const subOpacity = transformRange(progress, [0.5, 0.62], [0, 1]);
  const subY = transformRange(progress, [0.5, 0.72, 1], [120, 260, 260]);
  const subX = transformRange(progress, [0.5, 0.72, 1], [0, -20, -20]);
  const subScale = transformRange(progress, [0.5, 0.72, 1], [0.34, 0.86, 1.08]);
  const subRotate = transformRange(progress, [0.5, 0.72], [-12, 0]);

  const introOpacity = transformRange(progress, [0.62, 0.7, 0.8, 0.86], [0, 1, 1, 0]);
  const introX = transformRange(progress, [0.62, 0.7], [-24, 0]);
  const introTextProgress = transformRange(progress, [0.64, 0.74], [0, 1]);
  const introTwoOpacity = transformRange(progress, [0.78, 0.86, 0.91, 0.95], [0, 1, 1, 0]);
  const introTwoX = transformRange(progress, [0.78, 0.86, 0.91, 0.95], [24, 0, 0, -20]);
  const introTwoTextProgress = transformRange(progress, [0.8, 0.9], [0, 1]);
  const introThreeOpacity = transformRange(progress, [0.92, 0.98, 1], [0, 1, 1]);
  const introThreeX = transformRange(progress, [0.92, 0.98], [0, 0]);
  const introThreeTextProgress = transformRange(progress, [0.93, 1], [0, 1]);

  product.style.transform = `translate3d(0, ${productY}px, 0) scale(${productScale})`;
  setOpacity(product, productOpacity);

  bottleClosed.style.transform = `translate3d(${bottleX}px, 0, 0) rotate(${bottleRotate}deg)`;
  setOpacity(bottleClosed, closedOpacity);

  bottleOpen.style.transform = `translate3d(${bottleX}px, 0, 0) rotate(${bottleRotate}deg)`;
  setOpacity(bottleOpen, openOpacity);

  cap.style.transform = `translate3d(${capX}px, ${capY}px, 0) rotate(${capRotate}deg)`;
  setOpacity(cap, capOpacity);

  substrate.style.transform = `translate3d(${subX}px, ${subY}px, 0) scale(${subScale}) rotate(${subRotate}deg)`;
  setOpacity(substrate, subOpacity);

  const introScale = Math.min(window.innerWidth / 1920, window.innerHeight / 1220);
  setIntroFigmaScale(productIntro, introScale, introX, "one");
  setOpacity(productIntro, introOpacity);
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
