async function loadPhotos() {

    const { data, error } = await supabaseClient
        .from('photos')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    const gallery = document.getElementById('gallery');

    gallery.innerHTML = '';

    data.forEach(photo => {

        gallery.innerHTML += `
        <div class="card">
            <img src="${photo.image_url}">
            <h3>${photo.title || ''}</h3>
        </div>
        `;

    });

}

async function loadTimeline() {

    const { data, error } = await supabaseClient
        .from('timeline')
        .select('*')
        .order('event_date', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    const timeline = document.getElementById('timeline');

    timeline.innerHTML = '';

    data.forEach(item => {

        timeline.innerHTML += `
        <div class="timeline-item">
            <h3>${item.title}</h3>
            <p>${item.event_date || ''}</p>
            <p>${item.content || ''}</p>
        </div>
        `;

    });

}

loadPhotos();
loadTimeline();
