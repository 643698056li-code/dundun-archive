async function loadPhotos() {

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
    .innerText=data.length;

    const gallery =
    document.getElementById("gallery");

    gallery.innerHTML="";

    data.forEach(photo=>{

        gallery.innerHTML += `
        <div class="card">

            <img src="${photo.image_url}">

            <div class="card-content">

                <h3>
                    ${photo.title || ""}
                </h3>

            </div>

        </div>
        `;

    });

}


async function loadTimeline() {

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
    .innerText=data.length;

    const timeline =
    document.getElementById("timeline");

    timeline.innerHTML="";

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

}

loadPhotos();

loadTimeline();
