(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function markVisible(elements) {
    elements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const revealSelector = [
      ".fade-in",
      "h2",
      ".post-preview",
      ".reading-book",
      ".home-section-card",
      ".home-link-card",
      ".latest-post",
      ".stat-card"
    ].join(", ");

    const revealElements = Array.from(document.querySelectorAll(revealSelector));
    revealElements.forEach((element) => {
      element.classList.add("fade-in");
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      markVisible(revealElements);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry) => {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach((element) => {
      observer.observe(element);
    });
  });
})();
