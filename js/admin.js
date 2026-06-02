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
