document.addEventListener("DOMContentLoaded", () => {
    const galleryImages = document.querySelectorAll(".image-grid .image-item img");
    if (!galleryImages.length) {
        return;
    }
    const heroMarqueeTrack = document.querySelector(".hero-marquee-track");

    const shuffleArray = (array) => {
        const copied = [...array];
        for (let i = copied.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [copied[i], copied[j]] = [copied[j], copied[i]];
        }
        return copied;
    };

    if (heroMarqueeTrack) {
        const marqueeSources = shuffleArray(
            [...galleryImages].map((image) => ({
                src: image.src,
                alt: image.alt
            }))
        );
        const loopSources = [...marqueeSources, ...marqueeSources];
        const fragment = document.createDocumentFragment();

        loopSources.forEach((slide) => {
            const imageElement = document.createElement("img");
            imageElement.className = "hero-marquee-item";
            imageElement.src = slide.src;
            imageElement.alt = `${slide.alt} のスライド表示`;
            fragment.appendChild(imageElement);
        });

        heroMarqueeTrack.appendChild(fragment);
    }

    const modal = document.createElement("div");
    modal.className = "image-modal";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
        <div class="image-modal-content">
            <button class="image-modal-close" type="button" aria-label="モーダルを閉じる">&times;</button>
            <img src="" alt="">
        </div>
    `;

    document.body.appendChild(modal);

    const modalImage = modal.querySelector("img");
    const closeButton = modal.querySelector(".image-modal-close");

    const openModal = (src, alt) => {
        modalImage.src = src;
        modalImage.alt = alt || "拡大画像";
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        modalImage.src = "";
        modalImage.alt = "";
        document.body.style.overflow = "";
    };

    galleryImages.forEach((image) => {
        image.addEventListener("click", () => {
            openModal(image.src, image.alt);
        });
    });

    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("is-open")) {
            closeModal();
        }
    });
});
