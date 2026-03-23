// welcome區塊
document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("carouselTrack");
    const dots = document.querySelectorAll(".dot");

    if (!track || dots.length === 0) return;

    const slides = document.querySelectorAll(".carousel-slide");
    const firstClone = slides[0].cloneNode(true);
    track.appendChild(firstClone);

    let currentIndex = 0;
    let isTransitioning = false;
    const totalRealSlides = slides.length;

    function updateDots(index) {
        dots.forEach(dot => dot.classList.remove("active"));
        dots[index].classList.add("active");
    }

    function moveToSlide(index, withTransition = true) {
        if (withTransition) {
            track.style.transition = "transform 0.6s ease-in-out";
        } else {
            track.style.transition = "none";
        }

        track.style.transform = `translateX(-${index * 100}%)`;
    }

    function nextSlide() {
        if (isTransitioning) return;

        isTransitioning = true;
        currentIndex++;
        moveToSlide(currentIndex);

        if (currentIndex < totalRealSlides) {
            updateDots(currentIndex);
        } else {
            updateDots(0);
        }
    }

    track.addEventListener("transitionend", () => {
        if (currentIndex === totalRealSlides) {
            moveToSlide(0, false);
            currentIndex = 0;
        }
        isTransitioning = false;
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            if (isTransitioning) return;
            currentIndex = index;
            moveToSlide(currentIndex);
            updateDots(currentIndex);
        });
    });

    setInterval(nextSlide, 5000);
});


// 公佈欄區塊
async function loadOshaBulletin() {
    const container = document.getElementById("osha-list");

    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/osha/bulletin`);
        if (!res.ok) {
            throw new Error("載入失敗");
        }

        const data = await res.json();

        if (!data.items || data.items.length === 0) {
            container.innerHTML = "<p>目前沒有資料</p>";
            return;
        }

        let html = "<ul class='osha-items'>";
        data.items.forEach(item => {
            html += `
                <li>
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer">
                        ${item.title}
                    </a>
                </li>
            `;
        });
        html += "</ul>";

        if (data.more_url) {
            html += `
                <div class="osha-more">
                    <a href="${data.more_url}" target="_blank" rel="noopener noreferrer">
                        查看更多公布欄
                    </a>
                </div>
            `;
        }

        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = "<p>職安署公布欄載入失敗</p>";
        console.error("loadOshaBulletin error:", error);
    }
}

loadOshaBulletin();

