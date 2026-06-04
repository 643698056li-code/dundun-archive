-- 创建体重历史记录表
CREATE TABLE IF NOT EXISTS public.weight_history (
    id SERIAL PRIMARY KEY,
    weight NUMERIC NOT NULL,
    recorded_at DATE DEFAULT CURRENT_DATE,
    note TEXT
);

-- 启用 RLS
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许任何人读取
CREATE POLICY "Allow public read access on weight_history"
ON public.weight_history
FOR SELECT
USING (true);

-- 创建策略：允许任何人写入
CREATE POLICY "Allow public write access on weight_history"
ON public.weight_history
FOR ALL
USING (true)
WITH CHECK (true);

-- 插入示例数据
INSERT INTO public.weight_history (weight, recorded_at, note) VALUES
(12.5, '2024-01-01', '新年初始体重'),
(13.0, '2024-02-01', '春节后'),
(13.2, '2024-03-01', '春天开始'),
(13.5, '2024-04-01', '樱花季'),
(13.8, '2024-05-01', '劳动节'),
(14.0, '2024-06-01', '儿童节'),
(14.2, '2024-07-01', '暑假开始'),
(14.5, '2024-08-01', '夏天'),
(14.3, '2024-09-01', '开学季'),
(14.1, '2024-10-01', '国庆'),
(14.0, '2024-11-01', '秋天'),
(14.2, '2024-12-01', '圣诞节')
ON CONFLICT DO NOTHING;
