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
            { weight: 12.5, recorded_at: '2024-01-01', note: '新年' },
            { weight: 13.0, recorded_at: '2024-02-15', note: '春节' },
            { weight: 13.2, recorded_at: '2024-03-20', note: '春天' },
            { weight: 13.5, recorded_at: '2024-04-25', note: '樱花季' },
            { weight: 13.8, recorded_at: '2024-05-30', note: '劳动节' },
            { weight: 14.0, recorded_at: '2024-06-15', note: '儿童节' },
            { weight: 14.2, recorded_at: '2024-07-20', note: '暑假' },
            { weight: 14.5, recorded_at: '2024-08-15', note: '夏天' },
            { weight: 14.3, recorded_at: '2024-09-10', note: '开学' },
            { weight: 14.1, recorded_at: '2024-10-01', note: '国庆' },
            { weight: 14.0, recorded_at: '2024-11-15', note: '秋天' },
            { weight: 14.2, recorded_at: '2024-12-25', note: '圣诞' }
        ]);
        return;
    }

    drawWeightChart(data);
}

function drawWeightChart(data) {
    const svg = document.getElementById("weightChart");
    const xAxis = document.querySelector('.chart-x-axis');
    const gridContainer = document.querySelector('.chart-grid');
    
    if (!svg) return;

    const width = 800;
    const height = 200;
    const padding = { top: 25, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const MAX_DISPLAY_POINTS = 12;
    const MIN_DISPLAY_POINTS = 3;
    
    let displayData = data;
    if (data.length > MAX_DISPLAY_POINTS) {
        const step = Math.ceil(data.length / MAX_DISPLAY_POINTS);
        displayData = data.filter((_, i) => i % step === 0 || i === data.length - 1);
        if (displayData.length < MIN_DISPLAY_POINTS) {
            displayData = data.slice(-MIN_DISPLAY_POINTS);
        }
    }

    const weights = displayData.map(d => parseFloat(d.weight));
    const minWeight = Math.min(...weights) - 0.5;
    const maxWeight = Math.max(...weights) + 0.5;
    const weightRange = maxWeight - minWeight || 1;

    const points = displayData.map((d, i) => {
        const x = padding.left + (i / (displayData.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - ((parseFloat(d.weight) - minWeight) / weightRange) * chartHeight;
        return { x, y, data: d };
    });

    const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');

    const smoothPath = generateSmoothPath(points);
    const areaPath = `M ${padding.left} ${height - padding.bottom} ` +
                     `${smoothPath} ` +
                     `L ${points[points.length - 1].x} ${height - padding.bottom} Z`;

    const gradientId = "chartGradient";

    svg.innerHTML = `
        <defs>
            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#4facfe;stop-opacity:0.35" />
                <stop offset="60%" style="stop-color:#4facfe;stop-opacity:0.1" />
                <stop offset="100%" style="stop-color:#4facfe;stop-opacity:0" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <path d="${areaPath}" fill="url(#${gradientId})" />
        <path d="${smoothPath}" fill="none" stroke="#4facfe" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" />
        ${points.map((p, i) => `
            <circle cx="${p.x}" cy="${p.y}" r="6" fill="white" stroke="#4facfe" stroke-width="2.5" style="transition: all 0.3s ease"/>
            <circle cx="${p.x}" cy="${p.y}" r="2.5" fill="#4facfe"/>
        `).join('')}
    `;

    if (xAxis) {
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        };
        
        xAxis.innerHTML = displayData.map(d => `<span>${formatDate(d.recorded_at)}</span>`).join('');
    }

    if (gridContainer) {
        const gridLines = 4;
        gridContainer.innerHTML = Array.from({ length: gridLines }, (_, i) => {
            const weight = maxWeight - (i / (gridLines - 1)) * weightRange;
            return `<div class="grid-line"><span>${weight.toFixed(1)}</span></div>`;
        }).join('');
    }

    if (displayData.length >= 2) {
        const recentChange = parseFloat(displayData[displayData.length - 1].weight) - 
                            parseFloat(displayData[displayData.length - 2].weight);
        const changeElement = document.querySelector('.change-value');
        const changeLabel = document.querySelector('.change-label');
        if (changeElement) {
            changeElement.textContent = `${recentChange >= 0 ? '+' : ''}${recentChange.toFixed(1)}kg`;
            changeElement.className = `change-value ${recentChange >= 0 ? 'positive' : 'negative'}`;
        }
        if (changeLabel) {
            changeLabel.textContent = displayData.length >= 2 ? '上期对比' : '';
        }
    }
}

function generateSmoothPath(points) {
    if (points.length < 2) return `M ${points[0].x} ${points[0].y}`;
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] || points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    
    return path;
}

window.addEventListener("DOMContentLoaded", () => {
    loadPhotos();
    loadTimeline();
    loadStats();
    loadWeightHistory();
});