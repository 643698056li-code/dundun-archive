let accessToken = null;
let tokenExpireTime = 0;

async function getBaiduAccessToken() {
    const now = Date.now();
    if (accessToken && now < tokenExpireTime) {
        return accessToken;
    }

    if (!BAIDU_AI_CONFIG.API_KEY || !BAIDU_AI_CONFIG.SECRET_KEY) {
        throw new Error('请先配置百度云AI的API_KEY和SECRET_KEY');
    }

    const response = await fetch(
        `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_AI_CONFIG.API_KEY}&client_secret=${BAIDU_AI_CONFIG.SECRET_KEY}`,
        { method: 'POST' }
    );

    const data = await response.json();
    
    if (data.access_token) {
        accessToken = data.access_token;
        tokenExpireTime = now + (data.expires_in * 1000) - 60000;
        return accessToken;
    } else {
        throw new Error(data.error_description || '获取token失败');
    }
}

async function analyzeImage(imageBase64) {
    const token = await getBaiduAccessToken();
    
    const response = await fetch(
        `${BAIDU_AI_CONFIG.IMAGE_CAPTION_URL}?access_token=${token}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `image=${encodeURIComponent(imageBase64)}`
        }
    );

    const data = await response.json();
    
    if (data.result) {
        return data.result.slice(0, 5).map(item => item.keyword);
    } else {
        throw new Error(data.error_msg || '图片分析失败');
    }
}

async function generateCaption(imageBase64) {
    try {
        const keywords = await analyzeImage(imageBase64);
        const prompt = `根据以下图片内容关键词，为一只可爱的柯基犬"墩墩"生成一段温馨有趣的文案。关键词：${keywords.join('、')}。要求：语气亲切可爱，适合社交媒体分享，字数在50-100字之间。`;
        
        const token = await getBaiduAccessToken();
        
        const response = await fetch(
            `${BAIDU_AI_CONFIG.TEXT_GENERATION_URL}?access_token=${token}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    temperature: 0.8,
                    max_tokens: 200
                })
            }
        );

        const data = await response.json();
        
        if (data.result) {
            return {
                caption: data.result,
                keywords: keywords
            };
        } else {
            return {
                caption: generateFallbackCaption(keywords),
                keywords: keywords
            };
        }
    } catch (error) {
        console.error('AI生成失败:', error);
        return {
            caption: generateFallbackCaption([]),
            keywords: []
        };
    }
}

function generateFallbackCaption(keywords) {
    const templates = [
        '今天也是元气满满的一天！🐾',
        '阳光正好，微风不燥~',
        '记录美好生活的点点滴滴 ✨',
        '保持微笑，每天都有小确幸',
        '生活明朗，万物可爱 💕',
        '开心最重要！😊',
        '享受当下的每一刻'
    ];
    
    if (keywords.length > 0) {
        return `${keywords.join('、')}——今天的我也是超可爱的！🐶`;
    }
    
    return templates[Math.floor(Math.random() * templates.length)];
}

async function imageToBase64(imageUrl) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}