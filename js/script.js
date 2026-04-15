document.addEventListener("DOMContentLoaded", () => {
    const yearElement = document.querySelector("[data-current-year]");
    if (yearElement) {
        yearElement.textContent = String(new Date().getFullYear());
    }

    const heroIntro = document.querySelector(".hero-intro");
    if (heroIntro) {
        window.requestAnimationFrame(() => {
            window.setTimeout(() => {
                heroIntro.classList.add("is-visible");
            }, 120);
        });
    }

    const targets = document.querySelectorAll(".reveal-text, .reveal-image");
    if (targets.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.22,
            rootMargin: "0px 0px -8% 0px"
        });

        targets.forEach((target) => observer.observe(target));
    }
});
