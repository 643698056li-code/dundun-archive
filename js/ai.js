let accessToken = null;
let tokenExpireTime = 0;

const CORS_PROXIES = [
    'https://api.allorigins.win/get?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://proxy.cors.sh/'
];

async function fetchWithProxy(url, options = {}, proxyIndex = 0) {
    if (proxyIndex >= CORS_PROXIES.length) {
        throw new Error('所有CORS代理都失败了');
    }

    const proxyUrl = CORS_PROXIES[proxyIndex] + encodeURIComponent(url);
    
    try {
        const response = await fetch(proxyUrl, {
            ...options,
            headers: {
                ...options.headers,
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (response.ok) {
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('json')) {
                return await response.json();
            } else {
                const text = await response.text();
                try {
                    return JSON.parse(text);
                } catch {
                    return { contents: text, status: { http_code: response.status } };
                }
            }
        } else {
            throw new Error(`HTTP错误: ${response.status}`);
        }
    } catch (error) {
        console.warn(`代理 ${proxyIndex + 1} 失败:`, error.message);
        return fetchWithProxy(url, options, proxyIndex + 1);
    }
}

async function getBaiduAccessToken() {
    const now = Date.now();
    if (accessToken && now < tokenExpireTime) {
        console.log('使用缓存的access token');
        return accessToken;
    }

    if (!BAIDU_AI_CONFIG.API_KEY || !BAIDU_AI_CONFIG.SECRET_KEY) {
        throw new Error('AI配置未完成');
    }

    const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_AI_CONFIG.API_KEY}&client_secret=${BAIDU_AI_CONFIG.SECRET_KEY}`;
    
    console.log('尝试获取百度云access token...');
    
    try {
        const proxyData = await fetchWithProxy(tokenUrl);
        
        if (proxyData.access_token) {
            accessToken = proxyData.access_token;
            tokenExpireTime = now + ((proxyData.expires_in || 3600) * 1000) - 60000;
            console.log('成功获取access token');
            return accessToken;
        } else if (proxyData.contents) {
            const data = typeof proxyData.contents === 'string' ? JSON.parse(proxyData.contents) : proxyData.contents;
            if (data.access_token) {
                accessToken = data.access_token;
                tokenExpireTime = now + ((data.expires_in || 3600) * 1000) - 60000;
                console.log('成功获取access token');
                return accessToken;
            } else {
                throw new Error(data.error_description || data.error || '获取token失败');
            }
        } else {
            throw new Error('代理返回格式不正确');
        }
    } catch (error) {
        console.error('获取access token失败:', error.message);
        throw new Error('CORS限制');
    }
}

async function analyzeImage(imageBase64) {
    const token = await getBaiduAccessToken();
    
    const url = `${BAIDU_AI_CONFIG.IMAGE_CAPTION_URL}?access_token=${token}&image=${encodeURIComponent(imageBase64)}`;
    
    console.log('开始分析图片...');
    
    try {
        const proxyData = await fetchWithProxy(url, { method: 'POST' });
        
        if (proxyData.result) {
            const keywords = proxyData.result.slice(0, 5).map(item => item.keyword);
            console.log('图片分析成功，关键词:', keywords);
            return keywords;
        } else if (proxyData.contents) {
            const data = typeof proxyData.contents === 'string' ? JSON.parse(proxyData.contents) : proxyData.contents;
            if (data.result) {
                const keywords = data.result.slice(0, 5).map(item => item.keyword);
                console.log('图片分析成功，关键词:', keywords);
                return keywords;
            } else {
                throw new Error(data.error_msg || data.error || '图片分析失败');
            }
        } else {
            throw new Error('图片分析API返回格式不正确');
        }
    } catch (error) {
        console.error('图片分析API调用失败:', error.message);
        throw error;
    }
}

async function generateCaption(imageBase64) {
    try {
        const keywords = await analyzeImage(imageBase64);
        const prompt = `根据以下图片内容关键词，为一只可爱的柯基犬"墩墩"生成一段温馨有趣的文案。关键词：${keywords.join('、')}。要求：语气亲切可爱，适合社交媒体分享，字数在50-100字之间。`;
        
        console.log('开始生成文案...');
        
        const token = await getBaiduAccessToken();
        const url = `${BAIDU_AI_CONFIG.TEXT_GENERATION_URL}?access_token=${token}`;
        
        const proxyData = await fetchWithProxy(url, {
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
        
        if (proxyData.result) {
            console.log('文案生成成功:', proxyData.result);
            return {
                caption: proxyData.result,
                keywords: keywords,
                source: 'baidu'
            };
        } else if (proxyData.contents) {
            const data = typeof proxyData.contents === 'string' ? JSON.parse(proxyData.contents) : proxyData.contents;
            
            if (data.result) {
                console.log('文案生成成功:', data.result);
                return {
                    caption: data.result,
                    keywords: keywords,
                    source: 'baidu'
                };
            } else {
                console.warn('文案生成API返回无结果，使用备用文案');
                return {
                    caption: generateFallbackCaption(keywords),
                    keywords: keywords,
                    source: 'fallback'
                };
            }
        } else {
            throw new Error('文案生成API返回格式不正确');
        }
    } catch (error) {
        console.error('百度云API不可用，使用本地文案生成:', error.message);
        
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