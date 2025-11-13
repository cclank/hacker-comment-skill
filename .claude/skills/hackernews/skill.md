---
description: Fetches and analyzes Hacker News posts (single or lists) with filtering by keywords/categories and custom prompts. Also provides business insights and trend analysis using Algolia API.
location: user
---

# 🎯 任务目标

用户期望获取 **中文格式化的** Hacker News 内容，包含完整的链接、统计信息和分析。

## ⚡ 必须使用专用脚本的原因

用户已经准备了专门的脚本（`fetch_hn.js` 和 `fetch_hn_algolia.js`），这些脚本提供：

1. ✅ **中文输出** - 所有内容使用中文标签（评分、评论数、作者等）
2. ✅ **完整链接** - 同时提供原文链接和 HN 讨论链接
3. ✅ **格式化输出** - 使用 emoji 图标和 markdown 格式
4. ✅ **实时数据** - 使用 `--direct` 模式直接输出，无缓存
5. ✅ **商业洞察** - Algolia API 集成，提供趋势分析

**关键：** 直接调用 HN API（如使用 curl、fetch）无法提供这些功能，会导致：
- ❌ 英文输出（不符合用户需求）
- ❌ 缺少格式化和统计信息
- ❌ 需要手动处理数据

因此，**必须使用提供的 node 脚本**。

---

# 📋 执行步骤

## Step 1: 识别用户请求类型

根据用户输入，识别需要执行的命令：

| 用户请求 | 对应命令 |
|---------|---------|
| "帮我看看 HN top 10" / "top 10" / "热门" | `node .claude/skills/hackernews/fetch_hn.js --top 10 --direct` |
| "hackernews 45903404" / "分析帖子 123456" | `node .claude/skills/hackernews/fetch_hn.js <HN_ID> --direct` |
| "AI 趋势" / "AI 领域" / "latest AI" | `node .claude/skills/hackernews/fetch_hn_algolia.js ai-trends --direct` |
| "创业机会" / "startup ideas" | `node .claude/skills/hackernews/fetch_hn_algolia.js startup-ideas --direct` |
| "今日科技" / "每日摘要" / "daily summary" | `node .claude/skills/hackernews/fetch_hn_algolia.js --daily --direct` |
| "市场空白" / "market gaps" | `node .claude/skills/hackernews/fetch_hn_algolia.js market-gaps --direct` |

## Step 2: 立即执行对应的 node 命令

使用 **Bash tool** 执行上述命令（必须是 node 命令，不能使用其他方法）。

**示例：**
```bash
# 对于 "帮我看看 HN top 10"
node .claude/skills/hackernews/fetch_hn.js --top 10 --direct
```

## Step 3: 解析脚本输出

脚本会直接输出格式化的中文内容到 stdout，包含：
- 📊 评分、💬 评论数、👤 作者
- 🔗 原文链接、💭 HN 讨论链接
- 📅 发布时间、🌐 来源域名

## Step 4: 分析并展示

基于脚本输出提供分析：
- 总结关键发现
- 突出最有价值的内容
- 回答用户的具体问题

---

# ⚠️ 重要约束

## 为什么不能使用其他方法？

### ❌ 不能使用 curl/wget
**原因：** 会得到原始 JSON，缺少中文格式化和完整链接

### ❌ 不能使用 Playwright MCP
**原因：** 会抓取 HTML，缺少结构化数据和商业洞察

### ❌ 不能使用 fetch/WebFetch
**原因：** 同样只能获取原始数据，需要大量手动处理

### ❌ 不能查询 API 文档
**原因：** 浪费时间，脚本已经实现了所有必要的 API 调用

### ✅ 唯一正确的方法
使用 Bash tool 执行：`node .claude/skills/hackernews/fetch_hn.js <参数> --direct`

**这是完成任务的唯一方式**，因为只有这样才能满足用户对中文输出和完整信息的要求。

---

# 🔍 完整功能参考

## 基础功能（fetch_hn.js）

### 单个帖子分析
```bash
node .claude/skills/hackernews/fetch_hn.js <HN_ID> --direct
```

### 故事列表
```bash
# Top stories
node .claude/skills/hackernews/fetch_hn.js --top <limit> --direct

# New stories
node .claude/skills/hackernews/fetch_hn.js --new <limit> --direct

# Best stories
node .claude/skills/hackernews/fetch_hn.js --best <limit> --direct

# Ask HN
node .claude/skills/hackernews/fetch_hn.js --ask <limit> --direct

# Show HN
node .claude/skills/hackernews/fetch_hn.js --show <limit> --direct

# Jobs
node .claude/skills/hackernews/fetch_hn.js --job <limit> --direct
```

### 过滤选项
```bash
# 按关键词过滤
node .claude/skills/hackernews/fetch_hn.js --top 20 --filter ai machine learning --direct

# 按类别过滤
node .claude/skills/hackernews/fetch_hn.js --show 15 --category security --direct
```

## 商业洞察功能（fetch_hn_algolia.js）

### 预设查询
```bash
# AI 趋势
node .claude/skills/hackernews/fetch_hn_algolia.js ai-trends --direct

# 创业机会
node .claude/skills/hackernews/fetch_hn_algolia.js startup-ideas --direct

# 融资动态
node .claude/skills/hackernews/fetch_hn_algolia.js funding --direct

# 市场空白
node .claude/skills/hackernews/fetch_hn_algolia.js market-gaps --direct

# 变现策略
node .claude/skills/hackernews/fetch_hn_algolia.js monetization --direct

# Show HN 项目
node .claude/skills/hackernews/fetch_hn_algolia.js show-hn --direct

# 每日摘要
node .claude/skills/hackernews/fetch_hn_algolia.js --daily --direct
```

### 高级选项
```bash
# 时间范围（1h, 24h, 7d, 30d）
node .claude/skills/hackernews/fetch_hn_algolia.js ai-trends --time 7d --direct

# 数量限制
node .claude/skills/hackernews/fetch_hn_algolia.js startup-ideas --limit 50 --direct

# 自定义搜索
node .claude/skills/hackernews/fetch_hn_algolia.js --query "SaaS pricing" --min-points 20 --time 30d --direct
```

---

# 📊 分析指南

## 单个帖子分析要点
1. 📝 帖子主题和核心观点
2. 💡 最有价值的评论
3. 👥 不同的观点和视角
4. ⚙️ 技术细节和实现
5. 📚 有用的资源和链接
6. ⚔️ 争议和辩论点

## 故事列表分析要点
1. 🔥 当前趋势主题
2. ⭐ 最值得关注的故事
3. 📈 各类别分布
4. 🌐 热门来源域名
5. 💬 讨论热度排序

## 商业洞察分析要点
1. 📈 热度统计（平均评分、评论数）
2. 🌐 热门来源分布
3. ⏰ 时间分布趋势
4. 📊 内容类型分析
5. 🔥 最值得关注的发现
6. 💬 讨论最激烈的话题
7. 💡 商业建议和机会

---

# ✅ 执行检查清单

在开始执行前，确认：

- [ ] 已识别用户请求的类型（top 10 / 单帖 / AI趋势 / 等）
- [ ] 已确定要执行的 **完整的 node 命令**
- [ ] 命令包含 `--direct` 标志
- [ ] 准备使用 **Bash tool** 执行（不是其他工具）
- [ ] 理解输出将是中文格式化的内容
- [ ] 准备基于输出提供分析

**现在执行第一步：使用 Bash tool 执行对应的 node 命令。**

---

# 🎓 示例执行流程

## 示例 1: Top 10 请求

**用户输入：** "帮我看看 HN top 10 的内容"

**执行步骤：**

1. ✅ 识别：这是 top stories 请求
2. ✅ 命令：`node .claude/skills/hackernews/fetch_hn.js --top 10 --direct`
3. ✅ 执行：使用 Bash tool 运行命令
4. ✅ 解析：读取中文格式化的输出
5. ✅ 分析：总结热点趋势，推荐值得关注的内容

## 示例 2: AI 趋势请求

**用户输入：** "最近 AI 领域有什么新趋势？"

**执行步骤：**

1. ✅ 识别：这是 AI 趋势查询
2. ✅ 命令：`node .claude/skills/hackernews/fetch_hn_algolia.js ai-trends --direct`
3. ✅ 执行：使用 Bash tool 运行命令
4. ✅ 解析：读取 AI 趋势报告（包含热度统计、来源分析等）
5. ✅ 分析：总结关键 AI 趋势，提供战略建议

## 示例 3: 单帖分析请求

**用户输入：** "分析 hackernews 45903404"

**执行步骤：**

1. ✅ 识别：这是单帖分析请求，ID = 45903404
2. ✅ 命令：`node .claude/skills/hackernews/fetch_hn.js 45903404 --direct`
3. ✅ 执行：使用 Bash tool 运行命令
4. ✅ 解析：读取帖子内容和所有评论
5. ✅ 分析：总结主要观点、关键评论、技术细节

---

# 🚀 开始执行

**记住核心原则：**
- 用户准备了专门的脚本来满足他们的需求（中文输出、完整链接、格式化）
- 使用其他方法（curl、Playwright、fetch）无法满足这些需求
- 唯一正确的方法是执行 node 脚本
- 立即执行，不要查询文档或尝试其他方法

**现在，根据用户的请求，执行对应的 node 命令。**
