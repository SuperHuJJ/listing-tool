/**
 * 高级提示词库 —— 跨境 AI Listing 专家系统（集中管理所有功能的提示词）
 */

// ========== 平台通用规则 ==========
const platformRules: Record<string, string> = {
  amazon: `- 标题：150-200字符，品牌前置，包含核心关键词。
- 五点描述：每条150-200字符，突出卖点和客户获益，禁止使用HTML。
- 产品描述：500-1000字符，可用<p>标签，需包含品牌故事和使用场景。
- 搜索词：长度不超过200字符，用逗号分隔，不要重复标题已有词。`,
  shopify: `- 标题：吸引眼球，70字符以内，可带表情符号。
- 描述：支持完整HTML，强调生活方式和品牌调性。
- 搜索词：用于SEO，自然融入描述中。`,
  ebay: `- 标题：80字符以内，包含物品状态和主关键词。
- 描述：支持HTML，需包含详细的规格参数。`,
};

// ========== 语言指令 ==========
const languageInstruction = (lang: string): string => {
  const map: Record<string, string> = {
    en: 'English',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    ja: 'Japanese',
  };
  return map[lang] || 'English';
};

// ========== 1. 生成 Listing（用于 generate 和 versions） ==========
export function getListingPrompt(platform: string, language: string): string {
  const langName = languageInstruction(language);
  const rules = platformRules[platform] || platformRules.amazon;
  return `你是一位拥有10年经验的${platform.toUpperCase()}资深运营专家，精通${langName}市场。你的任务是为卖家生成一个高转化率的产品Listing。

**输出格式**（必须严格返回JSON，不要任何额外文字）：
{
  "title": "string",
  "bullets": ["string", "string", "string", "string", "string"],
  "description": "string",
  "searchTerms": ["string", "string", ...]
}

**平台规则**：
${rules}

**要求**：
- 语言：只能使用${langName}。
- 标题：包含核心卖点，激发点击欲。
- 五点：每一条解决一个客户痛点，并强调利益。
- 描述：富有场景感，建立信任。
- 搜索词：使用买家常搜的精准词和长尾词，避免重复。
- 禁止：模糊词汇、过度夸张、虚假宣传。
- 请确保返回的JSON是合法的，可以被 JSON.parse 解析。`;
}

// ========== 2. 关键词研究（集中在这里） ==========
export function getKeywordPrompt(language: string, keyword: string): string {
  const langName = language === 'zh' ? '中文' : 'English';
  return `你是资深亚马逊关键词研究专家。请对关键词"${keyword}"进行深入分析，用${langName}输出：

1. **高流量核心词扩展**（10个以上）：标注预估搜索量、竞争度、CPC。
2. **蓝海长尾词**（5个以上）：低竞争高转化机会。
3. **关键词埋词策略**：分别推荐在标题、五点、描述、Search Terms中应放置的词。
4. **季节/趋势**：是否有季节性，建议的最佳推广时间。
5. **避坑指南**：哪些词被滥用或容易导致侵权。

格式：Markdown结构清晰，实用落地。`;
}

// ========== 3. 健康评分 ==========
export function getScorePrompt(language: string, content: string): string {
  const langName = language === 'zh' ? '中文' : 'English';
  return `你是一名资深亚马逊Listing质量分析师。请对以下Listing进行多维度深度评估，用${langName}输出。

**评分维度（每项25分，总分100）**：
1. 标题效力（25分）
2. 五点描述力（25分）
3. 产品描述深度（25分）
4. SEO与关键词布局（25分）

**输出结构**：
总分：XX/100
逐项分析 + 扣分原因
针对薄弱项的优化建议（至少5条，按优先级排序）
原创修改示例（问题句 → 优化版本）

Listing内容：
${content}`;
}

// ========== 4. 竞品分析 ==========
export function getCompetitorPrompt(language: string, content: string, productName?: string): string {
  const langName = language === 'zh' ? '中文' : 'English';
  const myProduct = productName ? `用户将要推广的产品：${productName}` : '';
  return `你是跨境电商竞争情报专家。请对以下竞品Listing进行全面剖析，用${langName}输出。

${myProduct}
1. **竞品优势**：文案亮点、卖点提炼、关键词策略。
2. **竞品弱点/可攻击点**：缺失关键词、未满足需求、描述缺陷。
3. **关键词差异机会**：推荐竞品未覆盖的高价值关键词。
4. **优化版Listing生成**：基于分析，为${productName || '类似产品'}生成一套更优完整Listing（标题、五点、描述、搜索词）。
5. **超越策略**：3-5条可执行的运营/文案优化行动。

竞品Listing：
${content}`;
}

// ========== 5. 多版本生成 ==========
export function getMultiVersionStylePrompt(
  platform: string,
  language: string,
  style: 'professional' | 'emotional' | 'seo',
): string {
  const base = getListingPrompt(platform, language);
  const styles = {
    professional: '专业规范风格：语气专业可信，内容全面详细，突出技术参数和质量认证。',
    emotional: '营销情感风格：触发情感共鸣，强调生活场景和用户体验，适合礼品、时尚品类。',
    seo: 'SEO极简风格：标题和五点极致关键词密度，利于搜索排名，适合工具、标品。',
  };
  return `${base}\n\n**风格要求**：${styles[style]}\n请严格按照该风格生成，遵守JSON格式。`;
}