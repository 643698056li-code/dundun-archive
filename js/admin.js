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

async function addWeightRecord() {
    const weight = document.getElementById("weightInput").value;
    const date = document.getElementById("weightDate").value;
    const note = document.getElementById("weightNote").value;

    if (!weight) {
        alert("请输入体重");
        return;
    }

    const { error } = await supabaseClient
        .from("weight_history")
        .insert([
            {
                weight: weight,
                recorded_at: date || new Date().toISOString().split('T')[0],
                note: note || null
            }
        ]);

    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }

    alert("记录成功");
    document.getElementById("weightInput").value = "";
    document.getElementById("weightDate").value = "";
    document.getElementById("weightNote").value = "";
}

async function generateCaptionWithAI() {
    const fileInput = document.getElementById("photoFile");
    const file = fileInput.files ? fileInput.files[0] : null;
    
    if (!file) {
        alert("请先选择一张图片");
        return;
    }

    const aiResultDiv = document.getElementById("aiResult");
    const generatedCaptionSpan = document.getElementById("generatedCaption");
    
    aiResultDiv.style.display = "block";
    generatedCaptionSpan.innerHTML = "🤖 AI正在分析图片...";

    try {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const base64 = e.target.result.split(',')[1];
            const result = await generateCaption(base64);
            
            generatedCaptionSpan.innerHTML = `<p><strong>关键词：</strong>${result.keywords.join('、')}</p><p><strong>文案：</strong>${result.caption}</p>`;
            
            const descriptionInput = document.getElementById("photoDescription");
            if (descriptionInput && !descriptionInput.value) {
                descriptionInput.value = result.caption;
            }
        };
        
        reader.onerror = () => {
            generatedCaptionSpan.innerHTML = "图片读取失败，请重试";
        };
        
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('AI生成失败:', error);
        generatedCaptionSpan.innerHTML = `生成失败：${error.message}`;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadStatsForAdmin();
});
