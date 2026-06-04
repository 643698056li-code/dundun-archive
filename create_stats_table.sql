-- 创建 stats 表
CREATE TABLE IF NOT EXISTS public.stats (
    id INT PRIMARY KEY DEFAULT 1,
    weight NUMERIC,
    age INT,
    height NUMERIC,
    nickname TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许任何人读取
CREATE POLICY "Allow public read access"
ON public.stats
FOR SELECT
USING (true);

-- 创建策略：允许任何人写入
CREATE POLICY "Allow public write access"
ON public.stats
FOR ALL
USING (true)
WITH CHECK (true);

-- 插入默认数据（如果不存在）
INSERT INTO public.stats (id, weight, age, height, nickname)
VALUES (1, 14, 3, 35, '墩墩')
ON CONFLICT (id) DO NOTHING;
