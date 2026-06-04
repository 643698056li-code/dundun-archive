async function loadPhotos() {

```
const { data, error } =
await supabaseClient
.from("photos")
.select("*")
.order("id", {
    ascending:false
});

if(error){

    console.error(error);
    return;
}

document
.getElementById("photoCount")
.innerText = data.length;

const gallery =
document.getElementById("gallery");

gallery.innerHTML = "";

data.forEach((photo,index)=>{

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
                alt="${photo.title || ""}"
            >

        </div>

    </div>

    `;

});

createDots(data.length);

setupCarousel();
```

}

function createDots(count){

```
const dots =
document.getElementById("galleryDots");

if(!dots) return;

dots.innerHTML = "";

for(let i=0;i<count;i++){

    dots.innerHTML += `
    <span class="dot ${i===0 ? "active" : ""}"></span>
    `;
}
```

}

function setupCarousel(){

```
const gallery =
document.getElementById("gallery");

const dots =
document.querySelectorAll(".dot");

if(!gallery || !dots.length) return;

gallery.addEventListener("scroll",()=>{

    const cardWidth =
    gallery.querySelector(".showcase-card")
    ?.offsetWidth || 1;

    const index =
    Math.round(
        gallery.scrollLeft /
        (cardWidth + 28)
    );

    dots.forEach(dot=>{

        dot.classList.remove("active");

    });

    if(dots[index]){

        dots[index]
        .classList
        .add("active");

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
.order("event_date",{
    ascending:false
});

if(error){

    console.error(error);
    return;
}

document
.getElementById("timelineCount")
.innerText = data.length;

const timeline =
document.getElementById("timeline");

timeline.innerHTML = "";

data.forEach(item=>{

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

loadPhotos();
loadTimeline();
