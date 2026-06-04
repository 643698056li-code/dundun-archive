async function loadPhotos() {
    const { data, error } = await supabaseClient
        .from("photos")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    const photoCount = document.getElementById("photoCount");
    if (photoCount) {
        photoCount.innerText = data.length;
    }

    const carousel = document.getElementById("carousel");
    if (!carousel) return;

    carousel.innerHTML = "";

    data.forEach((photo, index) => {
        const cardHTML = `
        <div class="showcase-card">
            <div class="card-badge">
                精选
            </div>
            <div class="card-content">
                <div class="card-info">
                    <h2>${photo.title || "墩墩"}</h2>
                    <p>Dundun Digital Museum Collection</p>
                    <div class="card-description">
                        ${photo.description || "记录每一个精彩瞬间"}
                    </div>
                </div>
                <div class="card-image">
                    <img
                        src="${photo.image_url}"
                        alt="${photo.title || "Dundun"}"
                        onerror="this.style.display='none'"
                    >
                </div>
            </div>
        </div>
        `;

        carousel.innerHTML += cardHTML;
    });

    totalSlides = data.length;
    createIndicators(data.length);

    setTimeout(() => {
        updateCarousel();
    }, 100);
}

function createIndicators(count) {
    const indicatorsContainer = document.getElementById("carouselIndicators");
    if (!indicatorsContainer) return;

    indicatorsContainer.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const indicator = document.createElement("button");
        indicator.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
        indicator.onclick = () => goToSlide(i);
        indicatorsContainer.appendChild(indicator);
    }
}

async function loadTimeline() {
    const { data, error } = await supabaseClient
        .from("timeline")
        .select("*")
        .order("event_date", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    const timelineCount = document.getElementById("timelineCount");
    if (timelineCount) {
        timelineCount.innerText = data.length;
    }

    const timeline = document.getElementById("timeline");
    if (!timeline) return;

    timeline.innerHTML = "";

    data.forEach((item) => {
        timeline.innerHTML += `
        <div class="timeline-item">
            <div class="timeline-date">
                ${item.event_date}
            </div>
            <h3>
                ${item.title}
            </h3>
            <p>
                ${item.content || ""}
            </p>
        </div>
        `;
    });
}

async function loadStats() {
    const { data, error } = await supabaseClient
        .from("stats")
        .select("*")
        .eq("id", 1)
        .single();

    if (error || !data) {
        console.log("No stats found, using defaults");
        return;
    }

    if (data.weight) {
        const weightElement = document.getElementById("heroWeight");
        if (weightElement) {
            weightElement.innerText = data.weight;
        }
    }

    if (data.age) {
        const ageElement = document.getElementById("heroAge");
        if (ageElement) {
            ageElement.innerText = data.age;
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadPhotos();
    loadTimeline();
    loadStats();
});