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
