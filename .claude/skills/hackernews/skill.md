---
description: Fetches and analyzes Hacker News posts with Chinese output, complete links, and statistics. Use when user requests HN content, top stories, or tech trends.
location: user
---

# 立即执行以下命令

根据用户请求，立即使用 Bash 工具执行对应的命令：

## "帮我看看 HN top 10" / "top 10" / "热门"
```bash
node .claude/skills/hackernews/fetch_hn.js --top 10 --direct
```

## "hackernews 45903404" / "分析帖子 <ID>"
```bash
node .claude/skills/hackernews/fetch_hn.js <HN_ID> --direct
```

## "AI 趋势" / "AI 领域动态"
```bash
node .claude/skills/hackernews/fetch_hn_algolia.js ai-trends --direct
```

## "创业机会" / "startup ideas"
```bash
node .claude/skills/hackernews/fetch_hn_algolia.js startup-ideas --direct
```

## "今日科技" / "每日摘要"
```bash
node .claude/skills/hackernews/fetch_hn_algolia.js --daily --direct
```

---

# 脚本说明

这些脚本提供：
- ✅ 中文格式化输出（emoji 图标 + markdown）
- ✅ 完整链接（原文链接 + HN 讨论链接）
- ✅ 统计信息（评分、评论数、作者、时间）
- ✅ 实时数据（--direct 模式，无缓存）

脚本输出后，提供分析和总结。

---

# 其他可用命令

## 基础功能
- `--new <limit>` - 最新内容
- `--best <limit>` - 最佳内容
- `--ask <limit>` - Ask HN
- `--show <limit>` - Show HN
- `--job <limit>` - 招聘信息
- `--filter <keywords>` - 关键词过滤
- `--category <type>` - 类别过滤

## 商业洞察（Algolia API）
- `ai-trends` - AI 趋势
- `startup-ideas` - 创业机会
- `funding` - 融资动态
- `market-gaps` - 市场空白
- `monetization` - 变现策略
- `show-hn` - Show HN 项目

## 高级选项
- `--time 1h|24h|7d|30d` - 时间范围
- `--limit <number>` - 结果数量
- `--min-points <number>` - 最低分数
- `--query "<text>"` - 自定义搜索
