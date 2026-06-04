async function loadPhotos() {

```
const { data, error } =
await supabaseClient
.from("photos")
.select("*")
.order("id", {
    ascending: false
});

if (error) {
    console.error(error);
    return;
}

const photoCount =
document.getElementById("photoCount");

if (photoCount) {
    photoCount.innerText = data.length;
}

const gallery =
document.getElementById("gallery");

if (!gallery) return;

gallery.innerHTML = "";

data.forEach((photo) => {

    gallery.innerHTML += `

    <div class="showcase-card">

        <div class="card-badge">
            精选
        </div>

        <div class="card-info">

            <h2>
                ${photo.title || "墩墩"}
            </h2>

            <p>
                Dundun Digital Museum Collection
            </p>

        </div>

        <div class="card-image">

            <img
                src="${photo.image_url}"
                alt="${photo.title || "Dundun"}"
            >

        </div>

    </div>

    `;
});

createDots(data.length);

setTimeout(() => {
    setupCarousel();
}, 100);
```

}

function createDots(count) {

```
const dotsContainer =
document.getElementById("galleryDots");

if (!dotsContainer) return;

dotsContainer.innerHTML = "";

for (let i = 0; i < count; i++) {

    const activeClass =
    i === 0 ? "active" : "";

    dotsContainer.innerHTML += `
    <span class="dot ${activeClass}"></span>
    `;
}
```

}

function setupCarousel() {

```
const gallery =
document.getElementById("gallery");

if (!gallery) return;

const cards =
gallery.querySelectorAll(".showcase-card");

if (!cards.length) return;

gallery.addEventListener("scroll", () => {

    const cardWidth =
    cards[0].offsetWidth;

    const gap = 28;

    const index =
    Math.round(
        gallery.scrollLeft /
        (cardWidth + gap)
    );

    const dots =
    document.querySelectorAll(".dot");

    dots.forEach(dot => {
        dot.classList.remove("active");
    });

    if (dots[index]) {
        dots[index].classList.add("active");
    }

});
```

}

async function loadTimeline() {

```
const { data, error } =
await supabaseClient
.from("timeline")
.select("*")
.order("event_date", {
    ascending: false
});

if (error) {
    console.error(error);
    return;
}

const timelineCount =
document.getElementById("timelineCount");

if (timelineCount) {
    timelineCount.innerText = data.length;
}

const timeline =
document.getElementById("timeline");

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
```

}

window.addEventListener("DOMContentLoaded", () => {

```
loadPhotos();

loadTimeline();
```

});
