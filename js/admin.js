async function uploadPhoto() {

    const file =
    document
    .getElementById("photoFile")
    .files[0];

    if (!file) {

        alert("请选择图片");

        return;
    }

    const title =
    document
    .getElementById("photoTitle")
    .value;

    const fileName =
    Date.now() +
    "-" +
    file.name;

    const { error } =
    await supabaseClient
    .storage
    .from(BUCKET_NAME)
    .upload(
        fileName,
        file
    );

    if (error) {

        console.error(error);

        alert(error.message);

        return;
    }

    const {
        data
    } =
    supabaseClient
    .storage
    .from(BUCKET_NAME)
    .getPublicUrl(
        fileName
    );

    await supabaseClient
    .from("photos")
    .insert([

        {

            title:
            title,

            image_url:
            data.publicUrl

        }

    ]);

    alert("上传成功");
}



async function addTimeline() {

    const title =
    document
    .getElementById(
        "eventTitle"
    )
    .value;

    const date =
    document
    .getElementById(
        "eventDate"
    )
    .value;

    const content =
    document
    .getElementById(
        "eventContent"
    )
    .value;

    const { error } =
    await supabaseClient
    .from(
        "timeline"
    )
    .insert([

        {

            title:
            title,

            event_date:
            date,

            content:
            content

        }

    ]);

    if (error) {

        console.error(error);

        alert(error.message);

        return;
    }

    alert("发布成功");
}

async function loadStatsForAdmin() {
    const { data, error } = await supabaseClient
        .from("stats")
        .select("*")
        .eq("id", 1)
        .single();

    if (error || !data) {
        console.log("No stats found");
        return;
    }

    if (data.weight) {
        document.getElementById("heroWeight").value = data.weight;
    }
    if (data.age) {
        document.getElementById("heroAge").value = data.age;
    }
    if (data.height) {
        document.getElementById("heroHeight").value = data.height;
    }
    if (data.nickname) {
        document.getElementById("heroNickname").value = data.nickname;
    }
}

async function updateStats() {
    const weight = document.getElementById("heroWeight").value;
    const age = document.getElementById("heroAge").value;
    const height = document.getElementById("heroHeight").value;
    const nickname = document.getElementById("heroNickname").value;

    const { error } = await supabaseClient
        .from("stats")
        .upsert([
            {
                id: 1,
                weight: weight,
                age: age,
                height: height,
                nickname: nickname,
                updated_at: new Date().toISOString()
            }
        ]);

    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }

    alert("保存成功");
}

window.addEventListener("DOMContentLoaded", () => {
    loadStatsForAdmin();
});
