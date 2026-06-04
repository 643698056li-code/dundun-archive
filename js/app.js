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
        const currentWeightElement = document.getElementById("currentWeight");
        if (currentWeightElement) {
            currentWeightElement.innerText = data.weight;
        }
    }

    if (data.age) {
        const ageElement = document.getElementById("heroAge");
        if (ageElement) {
            ageElement.innerText = data.age;
        }
    }
}

async function loadWeightHistory() {
    const { data, error } = await supabaseClient
        .from("weight_history")
        .select("*")
        .order("recorded_at", { ascending: true });

    if (error || !data || data.length === 0) {
        console.log("No weight history found, using mock data");
        drawWeightChart([
            { weight: 12.5, recorded_at: '2024-01-01' },
            { weight: 13.0, recorded_at: '2024-02-01' },
            { weight: 13.2, recorded_at: '2024-03-01' },
            { weight: 13.5, recorded_at: '2024-04-01' },
            { weight: 13.8, recorded_at: '2024-05-01' },
            { weight: 14.0, recorded_at: '2024-06-01' },
            { weight: 14.2, recorded_at: '2024-07-01' },
            { weight: 14.5, recorded_at: '2024-08-01' },
            { weight: 14.3, recorded_at: '2024-09-01' },
            { weight: 14.1, recorded_at: '2024-10-01' },
            { weight: 14.0, recorded_at: '2024-11-01' },
            { weight: 14.2, recorded_at: '2024-12-01' }
        ]);
        return;
    }

    drawWeightChart(data);
}

function drawWeightChart(data) {
    const svg = document.getElementById("weightChart");
    if (!svg) return;

    const width = 800;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 10, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const weights = data.map(d => parseFloat(d.weight));
    const minWeight = Math.floor(Math.min(...weights)) - 0.5;
    const maxWeight = Math.ceil(Math.max(...weights)) + 0.5;

    const points = data.map((d, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - ((parseFloat(d.weight) - minWeight) / (maxWeight - minWeight)) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    const areaPath = `M ${padding.left} ${height - padding.bottom} ` +
                     `L ${points} ` +
                     `L ${padding.left + chartWidth} ${height - padding.bottom} Z`;

    const gradientId = "chartGradient";
    let gradient = svg.querySelector(`#${gradientId}`);
    if (!gradient) {
        gradient = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        gradient.innerHTML = `
            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#4facfe;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#4facfe;stop-opacity:0" />
            </linearGradient>
        `;
        svg.appendChild(gradient);
    }

    svg.innerHTML = `
        <defs>
            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#4facfe;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#4facfe;stop-opacity:0" />
            </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#${gradientId})" />
        <polyline points="${points}" fill="none" stroke="#4facfe" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        ${data.map((d, i) => {
            const x = padding.left + (i / (data.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - ((parseFloat(d.weight) - minWeight) / (maxWeight - minWeight)) * chartHeight;
            return `<circle cx="${x}" cy="${y}" r="5" fill="white" stroke="#4facfe" stroke-width="2" />`;
        }).join('')}
    `;

    if (data.length >= 2) {
        const recentChange = weights[weights.length - 1] - weights[weights.length - 2];
        const changeElement = document.querySelector('.change-value');
        const changeLabel = document.querySelector('.change-label');
        if (changeElement) {
            changeElement.textContent = `${recentChange >= 0 ? '+' : ''}${recentChange.toFixed(1)}kg`;
            changeElement.className = `change-value ${recentChange >= 0 ? 'positive' : 'negative'}`;
        }
        if (changeLabel) {
            changeLabel.textContent = '上月对比';
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadPhotos();
    loadTimeline();
    loadStats();
    loadWeightHistory();
});