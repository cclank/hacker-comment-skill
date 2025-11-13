---
name: hackernews
description: Fetch and analyze Hacker News content in Chinese with complete links and statistics. Use when user requests HN posts, top stories, or tech trends analysis.
---

# Hacker News 内容获取与分析

您的任务是获取并分析 Hacker News 内容。用户期望获得：
- 📝 **中文格式化**的输出
- 🔗 **完整链接**（原文 + HN 讨论）
- 📊 **统计信息**（评分、评论数、作者）

## 工作流程

### 第一步：识别请求类型并执行对应脚本

根据用户请求，使用 Bash 工具执行以下命令之一：

**获取热门列表：**
```bash
node .claude/skills/hackernews/fetch_hn.js --top 10 --direct
```
适用于："帮我看看 HN top 10"、"热门内容"、"top stories"

**分析单个帖子：**
```bash
node .claude/skills/hackernews/fetch_hn.js <HN_ID> --direct
```
适用于："分析 hackernews 45903404"、"查看帖子 123456"

**AI 趋势分析：**
```bash
node .claude/skills/hackernews/fetch_hn_algolia.js ai-trends --direct
```
适用于："AI 趋势"、"AI 领域动态"、"machine learning 热点"

**创业机会发现：**
```bash
node .claude/skills/hackernews/fetch_hn_algolia.js startup-ideas --direct
```
适用于："创业机会"、"startup ideas"、"市场需求"

**每日科技摘要：**
```bash
node .claude/skills/hackernews/fetch_hn_algolia.js --daily --direct
```
适用于："今日科技"、"每日摘要"、"daily digest"

### 第二步：解析输出并分析

脚本会输出格式化的中文内容。基于输出提供：
- 🎯 关键发现总结
- ⭐ 最值得关注的内容
- 💡 洞察和建议

## 为什么必须使用这些脚本？

用户已配置专用脚本以满足特定需求：

✅ **中文输出** - 所有标签和内容本地化
✅ **完整链接** - 原文 + HN 讨论双链接
✅ **格式化显示** - Emoji 图标 + Markdown 排版
✅ **实时数据** - `--direct` 模式，无缓存
✅ **商业洞察** - Algolia API 趋势分析

直接使用 curl、fetch 或 Playwright 无法提供这些功能。

## 更多功能

需要时可以使用这些高级选项：

**其他列表类型：**
- `--new <limit>` - 最新内容
- `--best <limit>` - 最佳内容
- `--ask <limit>` - Ask HN
- `--show <limit>` - Show HN
- `--job <limit>` - 招聘信息

**过滤和筛选：**
- `--filter <keywords>` - 按关键词过滤
- `--category <type>` - 按类别过滤

**商业洞察查询：**
- `funding` - 融资动态
- `market-gaps` - 市场空白
- `monetization` - 变现策略
- `show-hn` - Show HN 项目

**时间范围（Algolia）：**
- `--time 1h|24h|7d|30d` - 时间范围
- `--limit <number>` - 结果数量

详细参考文档请查看 `EXAMPLES.md` 和 `BUSINESS_INSIGHTS.md`。

## 分析要点

**单个帖子：**
关注核心观点、有价值的评论、技术细节、争议点

**故事列表：**
识别趋势主题、推荐最值得阅读的内容、分析讨论热度

**商业洞察：**
提供热度统计、来源分析、时间趋势、商业建议

---

**开始执行：** 根据用户请求，选择并执行对应的命令。
