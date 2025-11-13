# Hacker News Analyzer Skill for Claude Code

🔍 一个强大的 Claude Code 自定义技能，用于深度分析 Hacker News 帖子和评论

## ✨ 特性

### 核心功能
- 📖 **完整内容抓取**：获取 HN 帖子的完整内容和所有评论
- 💬 **递归评论**：支持多层嵌套的评论结构
- 🎯 **自定义分析**：使用自定义提示词进行针对性分析
- 🧠 **智能解析**：自动解码 HTML、格式化内容
- 📊 **热门内容**：获取 Top/New/Best/Ask/Show/Job 故事列表
- 🔍 **智能过滤**：按关键词或类别过滤内容
- 🏷️ **自动分类**：AI/ML、编程、Web、数据库、安全等
- 🚀 **零依赖**：仅使用 Node.js 内置模块

### 🆕 NEW! Trending Posts Discovery (基于 Algolia API)
- ⏰ **时间范围过滤**：今天、最近3天、本周、本月
- 💎 **智能价值评分**：综合分数、评论数、互动比率和时效性
- 🎯 **主题精准过滤**：AI、编程、安全、区块链等12+领域
- 📈 **多维度排序**：按价值分数、日期或相关性排序
- 🔥 **热度筛选**：支持最低分数和评论数过滤
- 🔍 **全文搜索**：支持关键词搜索功能
- 📊 **统计分析**：自动生成热门域名和趋势统计

## 🚀 快速开始

### 安装

1. 克隆或复制此 skill 到你的 Claude Code 配置目录：

```bash
# 如果你还没有 skills 目录
mkdir -p ~/.claude/skills

# 复制此 skill
cp -r .claude/skills/hackernews ~/.claude/skills/
```

2. 确保 Node.js 已安装：

```bash
node --version
```

### 使用

在 Claude Code 中直接输入：

```
hackernews <HN_ID>
```

或带自定义提示：

```
hackernews <HN_ID> <你的分析需求>
```

## 📖 示例

### 单个帖子分析
```
# 基础使用
hackernews 38471822

# 技术分析
hackernews 38471822 总结这个帖子中讨论的技术方案和最佳实践

# 观点提取
hackernews 38471822 列出主要的支持和反对观点
```

### 热门故事列表
```
# 获取 top 10
hackernews top 10

# 获取今日最热的 20 条
show me top 20 HN stories

# 获取最新故事
hackernews new 15
```

### 过滤和分类
```
# 按关键词过滤
hackernews top 20 AI machine learning

# 按类别过滤
show me top security stories

# Show HN 项目
hackernews show 10 rust

# Ask HN 讨论
get ask HN posts about career
```

### 🆕 Trending Posts 发现 (NEW!)
```
# 今天最热门的帖子
trending today
帮我找到今天最热门的帖子

# 本周最有价值的 AI 帖子
show me this week's most valuable AI posts
trending this week about AI and machine learning

# 最近3天的安全讨论
trending security posts from last 3 days
最近3天关于安全的热门讨论

# 本月创业相关的高质量帖子
find valuable startup posts this month

# 多主题组合查询
trending posts about rust and programming from last week

# Show HN 项目发现
show me trending Show HN projects this week
```

更多示例请查看 [EXAMPLES.md](.claude/skills/hackernews/EXAMPLES.md)

## 📁 项目结构

```
.
├── .claude/
│   └── skills/
│       └── hackernews/
│           ├── skill.md               # Skill 配置（核心文件）
│           ├── fetch_hn.js            # HN Firebase API 抓取脚本
│           ├── fetch_hn_trending.js   # 🆕 Algolia API 趋势发现脚本
│           ├── README.md              # Skill 使用文档
│           └── EXAMPLES.md            # 详细使用示例
└── README.md                          # 项目说明（本文件）
```

## 🔧 工作原理

1. **参数解析**：从用户消息中提取 HN 帖子 ID 和分析需求
2. **内容抓取**：调用 HN API 递归获取帖子和所有评论
3. **内容存储**：将格式化的内容保存到临时文件
4. **AI 分析**：Claude 读取内容并根据提示进行分析
5. **结果展示**：以结构化的 Markdown 格式输出分析结果

## 🎯 使用场景

### 单帖深度分析
- **技术调研**：深入了解某个技术的讨论细节
- **方案对比**：分析评论中的不同观点和方案
- **最佳实践**：提取经验丰富用户的建议
- **问题解决**：查找类似问题的解决方案

### 热门内容跟踪
- **趋势发现**：了解当前技术社区的热点话题
- **新闻速览**：快速浏览 HN 今日/本周热点
- **项目发现**：从 Show HN 中找到有趣的项目
- **职位信息**：浏览最新的技术岗位

### 领域过滤
- **AI/ML 追踪**：专注跟踪 AI 相关的讨论和项目
- **安全资讯**：获取最新的安全漏洞和防护措施
- **编程语言**：关注特定语言（Rust、Go 等）的动态
- **创业信息**：了解创业公司的故事和融资消息

### 🆕 趋势发现（Trending Discovery）
- **每日精选**：每天最有价值的讨论和项目
- **周度总结**：一周内最热门的技术话题
- **领域追踪**：特定领域（AI、安全、区块链等）的趋势
- **智能排序**：基于价值评分找到真正值得阅读的内容
- **高质量过滤**：通过分数和评论数阈值筛选优质内容

## 🌟 默认分析维度

### 单帖分析（有评论）
1. 📝 **帖子摘要** - 主题和核心观点
2. 💡 **关键洞察** - 最有价值的评论
3. 👥 **多元视角** - 不同观点和立场
4. ⚙️ **技术细节** - 实现方法和工具
5. 📚 **资源汇总** - 链接、文档、书籍
6. ⚔️ **争议话题** - 辩论和分歧点

### 故事列表分析
1. 🔥 **趋势概览** - 当前热点主题
2. 📊 **分类统计** - 各类别的分布情况
3. ⭐ **精选推荐** - 最值得关注的故事
4. 🌐 **来源分析** - 热门域名统计
5. 💬 **讨论热度** - 评论数和分数排序

## 🛠️ 技术栈

- **语言**：Node.js (JavaScript)
- **API**：
  - Hacker News Firebase API（单帖分析和基础列表）
  - HN Algolia Search API（趋势发现和高级搜索）
- **依赖**：无（仅使用内置模块：https, http, fs, path）

## 📊 API 说明

### Hacker News Firebase API
使用官方 Hacker News API：
- 基础 URL：`https://hacker-news.firebaseio.com/v0/`
- 文档：https://github.com/HackerNews/API
- 支持的端点：
  - `/item/<id>.json` - 获取帖子或评论详情
  - `/topstories.json` - Top 故事
  - `/newstories.json` - 最新故事
  - `/beststories.json` - Best 故事

### 🆕 HN Algolia Search API
用于趋势发现和高级搜索：
- 基础 URL：`http://hn.algolia.com/api/v1/`
- 文档：https://hn.algolia.com/api
- 支持的功能：
  - 按日期范围过滤
  - 按分数和评论数过滤
  - 全文搜索
  - 多维度排序

## ⚙️ 配置选项

目前脚本会将内容保存到 `/tmp/hn_<ID>.txt`，你可以根据需要修改 `fetch_hn.js` 中的输出路径。

## 🐛 故障排查

### 问题：HN_ID 无效
**解决**：确保提供的是有效的数字 ID，可以在 HN URL 中找到
```
https://news.ycombinator.com/item?id=38471822
                                    ^^^^^^^^ 这就是 HN_ID
```

### 问题：抓取失败
**解决**：
1. 检查网络连接
2. 确认 HN API 可访问
3. 检查 Node.js 是否正确安装

### 问题：内容不完整
**原因**：某些评论可能已被删除或标记为 dead
**说明**：这是正常现象，脚本会自动跳过这些评论

## 🔮 功能路线图

### ✅ 已完成
- [x] 支持获取热门故事列表（Top/New/Best等）
- [x] 添加关键词过滤功能
- [x] 支持分类过滤（AI/ML、Security等）
- [x] 自动内容分类
- [x] 🆕 基于 Algolia API 的趋势发现
- [x] 🆕 时间范围过滤（今日/本周/本月）
- [x] 🆕 智能价值评分算法
- [x] 🆕 多主题组合过滤
- [x] 🆕 全文搜索支持

### 🚧 进行中
- [ ] 添加评论排序（按分数、时间等）
- [ ] 支持导出为 JSON/PDF 格式
- [ ] 添加缓存机制避免重复抓取

### 💡 计划中
- [ ] 添加情感分析功能
- [ ] 用户关注列表（跟踪特定作者）
- [ ] 多语言内容翻译
- [ ] 邮件订阅每日/周报
- [ ] 自定义价值评分权重
- [ ] 话题趋势可视化
- [ ] 评论质量评分

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License

## 🙏 致谢

- Hacker News 提供的优秀 API
- Claude Code 提供的强大 AI 能力
- 开源社区的支持

## 📞 联系方式

如有问题或建议，欢迎：
- 提交 Issue
- 发起 Discussion
- 贡献代码

---

**Happy Hacking! 🚀**
