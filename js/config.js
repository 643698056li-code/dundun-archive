const SUPABASE_URL =
'https://bvldfdvnxrrhcesvthwx.supabase.co';

const SUPABASE_KEY =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bGRmZHZueHJyaGNlc3Z0aHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzODMwNjYsImV4cCI6MjA5NTk1OTA2Nn0.4cKf_iIC0O4n5-9OjdRY8E2ocNAZ9bqqWzSa1gCEJ58';

const BUCKET_NAME =
'dundun-images';

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const BAIDU_AI_CONFIG = {
    API_KEY: 'OlfiSi8oMYRCUYMKQwpE7RhP',
    SECRET_KEY: '4g1FhG0t9rDaqRumEqpeLM3fyciDR3Q4',
    IMAGE_CAPTION_URL: 'https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general',
    TEXT_GENERATION_URL: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/text2text/seniverse'
};
