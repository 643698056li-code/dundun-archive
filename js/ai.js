let accessToken = null;
let tokenExpireTime = 0;

async function getBaiduAccessToken() {
    const now = Date.now();
    if (accessToken && now < tokenExpireTime) {
        return accessToken;
    }

    if (!BAIDU_AI_CONFIG.API_KEY || !BAIDU_AI_CONFIG.SECRET_KEY) {
        throw new Error('AI配置未完成');
    }

    const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_AI_CONFIG.API_KEY}&client_secret=${BAIDU_AI_CONFIG.SECRET_KEY}`;
    
    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(tokenUrl)}`;
        const response = await fetch(proxyUrl);
        const proxyData = await response.json();
        
        if (proxyData.status.http_code === 200 && proxyData.contents) {
            const data = JSON.parse(proxyData.contents);
            
            if (data.access_token) {
                accessToken = data.access_token;
                tokenExpireTime = now + (data.expires_in * 1000) - 60000;
                return accessToken;
            } else {
                throw new Error(data.error_description || '获取token失败');
            }
        } else {
            throw new Error('代理请求失败');
        }
    } catch (error) {
        console.warn('CORS代理失败，尝试直接请求:', error.message);
        
        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                mode: 'no-cors'
            });
            
            throw new Error('直接请求也失败');
        } catch (directError) {
            console.warn('直接请求也失败，使用本地文案生成');
            throw new Error('CORS限制');
        }
    }
}

async function analyzeImage(imageBase64) {
    const token = await getBaiduAccessToken();
    
    const url = `${BAIDU_AI_CONFIG.IMAGE_CAPTION_URL}?access_token=${token}`;
    
    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `image=${encodeURIComponent(imageBase64)}`
        });

        const proxyData = await response.json();
        
        if (proxyData.status.http_code === 200 && proxyData.contents) {
            const data = JSON.parse(proxyData.contents);
            
            if (data.result) {
                return data.result.slice(0, 5).map(item => item.keyword);
            } else {
                throw new Error(data.error_msg || '图片分析失败');
            }
        } else {
            throw new Error('代理返回异常');
        }
    } catch (error) {
        console.warn('图片分析API调用失败:', error.message);
        throw error;
    }
}

async function generateCaption(imageBase64) {
    try {
        const keywords = await analyzeImage(imageBase64);
        const prompt = `根据以下图片内容关键词，为一只可爱的柯基犬"墩墩"生成一段温馨有趣的文案。关键词：${keywords.join('、')}。要求：语气亲切可爱，适合社交媒体分享，字数在50-100字之间。`;
        
        const token = await getBaiduAccessToken();
        const url = `${BAIDU_AI_CONFIG.TEXT_GENERATION_URL}?access_token=${token}`;
        
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                temperature: 0.8,
                max_tokens: 200
            })
        });

        const proxyData = await response.json();
        
        if (proxyData.status.http_code === 200 && proxyData.contents) {
            const data = JSON.parse(proxyData.contents);
            
            if (data.result) {
                return {
                    caption: data.result,
                    keywords: keywords,
                    source: 'baidu'
                };
            } else {
                return {
                    caption: generateFallbackCaption(keywords),
                    keywords: keywords,
                    source: 'fallback'
                };
            }
        } else {
            throw new Error('文案生成API调用失败');
        }
    } catch (error) {
        console.warn('百度云API不可用，使用本地文案生成:', error.message);
        
        const localKeywords = analyzeImageLocally(imageBase64);
        return {
            caption: generateFallbackCaption(localKeywords),
            keywords: localKeywords,
            source: 'local'
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
        '享受当下的每一刻',
        '和最爱的人一起度过美好时光 ❤️',
        '发现生活中的小美好 🌿',
        '幸福就是这么简单 🥰',
        '每一天都是独一无二的故事 📖',
        '被爱包围的感觉真好 💖',
        '奔跑吧，向着阳光 🌞',
        '生活需要一些仪式感 ✨',
        '简单的快乐最珍贵 😊'
    ];
    
    if (keywords.length > 0) {
        const suffixTemplates = [
            '——今天的我也是超可爱的！🐶',
            '——又是开心的一天！✨',
            '——记录美好瞬间 📸',
            '——柯基的幸福生活 🐾',
            '——墩墩来啦！😊',
            '——萌宠日常分享 🐕'
        ];
        const suffix = suffixTemplates[Math.floor(Math.random() * suffixTemplates.length)];
        return `${keywords.join('、')}${suffix}`;
    }
    
    return templates[Math.floor(Math.random() * templates.length)];
}

function analyzeImageLocally(imageBase64) {
    const cuteKeywords = [
        '可爱', '萌', '毛茸茸', '乖巧', '呆萌', '治愈',
        '大眼睛', '小短腿', '微笑', '开心', '快乐'
    ];
    
    const sceneKeywords = [
        '户外', '草地', '公园', '阳光', '蓝天', '花园',
        '室内', '沙发', '床上', '地毯', '窗边'
    ];
    
    const actionKeywords = [
        '奔跑', '玩耍', '睡觉', '吃饭', '散步', '摆拍',
        '歪头', '吐舌头', '摇尾巴', '趴着', '坐着'
    ];
    
    const randomPick = (arr, count) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };
    
    return [
        ...randomPick(cuteKeywords, 2),
        ...randomPick(sceneKeywords, 1),
        ...randomPick(actionKeywords, 1)
    ];
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