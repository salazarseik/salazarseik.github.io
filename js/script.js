document.addEventListener("DOMContentLoaded", () => {

	const yearEl = document.querySelector("[data-current-year]");

	if (yearEl) {
		yearEl.textContent = new Date().getFullYear();
	}

	const images = [
		"img/powerbi.jpg",
		"img/PBIAD01.jpg",
		"img/PBIAD02.jpg",
		"img/PBIAD03.jpg",
		"img/PBIRE01.jpg",
		"img/PBIRE02.jpg",
		"img/PBIRE03.jpg",
		"img/PBIVE01.jpg",
		"img/PBIVE02.jpg",
		"img/PBIVE03.jpg",
		"img/PBIVE04.jpg",
		"img/PBIVE05.jpg",
		"img/PBIVE06.jpg",
		"img/PBIVE07.jpg",
		"img/PBIVE08.jpg",
	];

	let currentImg = 0;

	const lightboxOverlay = document.getElementById("lightbox-overlay");
	const lightboxImg     = document.querySelector(".lightbox-img");
	const lightboxText    = document.querySelector(".lightbox-text");
	const btnClose        = document.querySelector(".lightbox-close");
	const btnPrev         = document.querySelector(".lightbox-prev");
	const btnNext         = document.querySelector(".lightbox-next");
	const projectCards    = document.querySelectorAll(".project-card");

	function showLightbox(index) {
		currentImg = index;

		lightboxImg.src            = images[currentImg];
		lightboxImg.style.display  = "block";
		lightboxText.textContent   = "";
		lightboxText.style.display = "none";

		btnPrev.style.display = "block";
		btnNext.style.display = "block";
		btnClose.style.display = "flex";

		lightboxOverlay.style.display  = "flex";
		document.body.style.overflow   = "hidden";
	}

	function showMessage(msg) {
		lightboxImg.style.display  = "none";
		lightboxText.textContent   = msg;
		lightboxText.style.display = "block";

		btnPrev.style.display = "none";
		btnNext.style.display = "none";
		btnClose.style.display = "flex";

		lightboxOverlay.style.display  = "flex";
		document.body.style.overflow   = "hidden";
	}

	function hideLightbox() {
		lightboxOverlay.style.display = "none";
		lightboxText.style.display = "none";
		btnClose.style.display = "none";
		document.body.style.overflow  = "auto";
	}

	function showPrev() {
		currentImg = (currentImg - 1 + images.length) % images.length;
		lightboxImg.src = images[currentImg];
	}

	function showNext() {
		currentImg = (currentImg + 1) % images.length;
		lightboxImg.src = images[currentImg];
	}

	projectCards.forEach((card, idx) => {

		card.addEventListener("click", e => {
			if (e.target.tagName.toLowerCase() === "a") return;

			idx === 0
				? showLightbox(0)
				: showMessage("Trabajando en el nuevo proyecto 🚧");
		});

		const btn = card.querySelector(".btn");

		if (btn) {
			btn.addEventListener("click", e => {
				e.preventDefault();

				idx === 0
					? showLightbox(0)
					: showMessage("Trabajando en el nuevo proyecto 🚧");
			});
		}
	});

	btnClose.addEventListener("click", hideLightbox);
	btnPrev.addEventListener("click", showPrev);
	btnNext.addEventListener("click", showNext);

	lightboxOverlay.addEventListener("click", e => {
		if (e.target === lightboxOverlay) hideLightbox();
	});

	document.addEventListener("keydown", e => {
		if (lightboxOverlay.style.display !== "flex") return;

		if (e.key === "Escape") hideLightbox();

		if (lightboxImg.style.display !== "none") {
			if (e.key === "ArrowLeft")  showPrev();
			if (e.key === "ArrowRight") showNext();
		}
	});

});