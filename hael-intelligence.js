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
