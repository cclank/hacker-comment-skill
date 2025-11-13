# Hacker News Skill 实用使用指南

## 🚨 重要提示

由于 Claude Code Skill 系统的执行约束力有限，我们发现即使在 skill.md 中使用了最强的指令语言，Claude 仍然可能选择使用 curl、Playwright 等工具而不是执行我们的脚本。

**详细分析请参考：** [SKILL_EXECUTION_ANALYSIS.md](./SKILL_EXECUTION_ANALYSIS.md)

## ✅ 推荐使用方式

为了确保功能正常工作，这里提供三种可靠的使用方式：

### 方式 1: 使用 Slash Command（最可靠） ⭐

我们创建了专门的 slash command 来绕过 skill 执行问题。

#### 可用命令：

```bash
# 获取 HN Top 10
/hn-top10
```

#### 使用示例：

```
You: /hn-top10
Claude: *执行脚本并分析结果*
```

**优势：**
- ✅ 明确的命令调用，减少 Claude 自主决策
- ✅ 直接映射到脚本执行
- ✅ 可预测的行为

**缺点：**
- ❌ 需要记住命令名称
- ❌ 失去自然语言交互的便利性

---

### 方式 2: 明确指令式请求（较可靠）⭐

如果你更喜欢自然语言交互，可以使用明确的指令式语句：

#### 推荐表达：

```
# ✅ 好的表达（明确指令）
"执行命令：node .claude/skills/hackernews/fetch_hn.js --top 10 --direct"
"使用 node 脚本获取 HN top 10"
"运行 fetch_hn.js 获取热门内容"

# ❌ 不好的表达（容易触发自主决策）
"帮我看看 HN top 10"
"HN 今天有什么热门内容？"
"查看 Hacker News"
```

#### 完整示例：

**获取 Top 10：**
```
You: 执行命令：node .claude/skills/hackernews/fetch_hn.js --top 10 --direct
Claude: *执行并分析*
```

**分析单个帖子：**
```
You: 运行：node .claude/skills/hackernews/fetch_hn.js 45903404 --direct
Claude: *获取帖子内容并分析*
```

**商业洞察：**
```
You: 执行：node .claude/skills/hackernews/fetch_hn_algolia.js ai-trends --direct
Claude: *生成 AI 趋势报告*
```

---

### 方式 3: 直接在终端执行（完全可控）⭐⭐⭐

如果你想要完全的控制和可预测性，可以直接在终端执行脚本：

#### 基础用法：

```bash
# 在项目根目录下

# 获取 Top 10
node .claude/skills/hackernews/fetch_hn.js --top 10 --direct

# 获取单个帖子
node .claude/skills/hackernews/fetch_hn.js 45903404 --direct

# AI 趋势分析
node .claude/skills/hackernews/fetch_hn_algolia.js ai-trends --direct

# 创业机会
node .claude/skills/hackernews/fetch_hn_algolia.js startup-ideas --direct

# 每日摘要
node .claude/skills/hackernews/fetch_hn_algolia.js --daily --direct
```

#### 创建便捷别名：

在 `~/.bashrc` 或 `~/.zshrc` 中添加：

```bash
# HN Skill 别名
alias hn-top='node $HOME/path/to/project/.claude/skills/hackernews/fetch_hn.js --top 10 --direct'
alias hn-ai='node $HOME/path/to/project/.claude/skills/hackernews/fetch_hn_algolia.js ai-trends --direct'
alias hn-startup='node $HOME/path/to/project/.claude/skills/hackernews/fetch_hn_algolia.js startup-ideas --direct'
alias hn-daily='node $HOME/path/to/project/.claude/skills/hackernews/fetch_hn_algolia.js --daily --direct'
```

然后在终端直接使用：

```bash
$ hn-top
# 输出中文格式化的 HN Top 10

$ hn-ai
# 输出 AI 趋势分析报告

$ hn-daily
# 输出今日科技摘要
```

**优势：**
- ✅ 100% 可控和可预测
- ✅ 可以集成到其他脚本和工具
- ✅ 不依赖 Claude 的决策
- ✅ 可以创建快捷别名

**缺点：**
- ❌ 需要手动复制输出给 Claude 分析（如果需要 AI 分析）

---

## 🔄 组合使用：终端 + Claude 分析

最佳实践是结合终端执行和 Claude 分析：

### 工作流程：

```bash
# 1. 在终端执行脚本（可靠、快速）
$ node .claude/skills/hackernews/fetch_hn_algolia.js ai-trends --direct > /tmp/hn-ai.txt

# 2. 在 Claude Code 中请求分析
You: 分析文件 /tmp/hn-ai.txt 中的 AI 趋势，给出三个最值得关注的方向
Claude: *读取文件并提供深度分析*
```

### 一键脚本：

创建 `analyze-hn.sh`：

```bash
#!/bin/bash
# analyze-hn.sh - 获取 HN 数据并请求 Claude 分析

OUTPUT_FILE="/tmp/hn-analysis-$(date +%s).txt"

# 根据参数执行不同的查询
case "$1" in
  "top")
    node .claude/skills/hackernews/fetch_hn.js --top 10 --direct > "$OUTPUT_FILE"
    ;;
  "ai")
    node .claude/skills/hackernews/fetch_hn_algolia.js ai-trends --direct > "$OUTPUT_FILE"
    ;;
  "startup")
    node .claude/skills/hackernews/fetch_hn_algolia.js startup-ideas --direct > "$OUTPUT_FILE"
    ;;
  *)
    echo "Usage: $0 {top|ai|startup}"
    exit 1
    ;;
esac

echo "✅ 数据已保存到: $OUTPUT_FILE"
echo ""
echo "💡 下一步："
echo "   在 Claude Code 中输入："
echo "   分析文件 $OUTPUT_FILE"
```

使用：

```bash
$ chmod +x analyze-hn.sh
$ ./analyze-hn.sh ai
✅ 数据已保存到: /tmp/hn-analysis-1699999999.txt

💡 下一步：
   在 Claude Code 中输入：
   分析文件 /tmp/hn-analysis-1699999999.txt
```

---

## 📊 功能对照表

| 功能 | Slash Command | 明确指令 | 直接终端 |
|------|--------------|---------|---------|
| 可靠性 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 便利性 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| 自然交互 | ⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| AI 自动分析 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 可集成性 | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎯 使用场景推荐

### 场景 1: 日常快速查看
**推荐：** Slash Command 或明确指令
```
/hn-top10
或
执行：node .claude/skills/hackernews/fetch_hn.js --top 10 --direct
```

### 场景 2: 深度分析和研究
**推荐：** 直接终端 + Claude 分析
```bash
# 终端
$ node .claude/skills/hackernews/fetch_hn_algolia.js ai-trends --time 7d --limit 50 --direct > ai-report.txt

# Claude
You: 基于 ai-report.txt，分析最有潜力的三个 AI 应用方向，并给出商业化建议
```

### 场景 3: 自动化和集成
**推荐：** 直接终端 + 脚本自动化
```bash
# crontab 定时任务
0 9 * * * /path/to/analyze-hn.sh daily | mail -s "每日 HN 摘要" your@email.com
```

### 场景 4: 探索性对话
**推荐：** 明确指令 + 自然语言跟进
```
You: 执行：node .claude/skills/hackernews/fetch_hn_algolia.js market-gaps --direct
Claude: *生成市场空白报告*
You: 从这些市场空白中，哪些适合独立开发者作为 side project？
Claude: *基于已获取的数据进行分析*
```

---

## 🔧 故障排查

### 问题：Claude 还是用了 curl/Playwright

**原因：** Skill 系统的执行约束力有限

**解决：**
1. 改用 Slash Command：`/hn-top10`
2. 使用明确指令："执行命令：node .claude/skills/hackernews/fetch_hn.js --top 10 --direct"
3. 直接在终端运行脚本

### 问题：输出是英文的

**原因：** 脚本没有正确执行，Claude 自己调用了 API

**解决：** 确认 Claude 执行了我们的 node 脚本，而不是 curl

**验证方法：**
- 检查输出是否有 emoji 图标（📊 💬 👤）
- 检查是否有中文标签（评分、评论数、作者）
- 检查输出格式是否匹配 `fetch_hn.js` 的格式

### 问题：数据是旧的/缓存的

**原因：** 读取了 /tmp 下的旧文件

**解决：** 使用 `--direct` 模式（已默认）
```bash
# ✅ 使用 --direct（实时输出）
node .claude/skills/hackernews/fetch_hn.js --top 10 --direct

# ❌ 不使用（可能读取旧文件）
node .claude/skills/hackernews/fetch_hn.js --top 10
```

---

## 📚 完整命令参考

### fetch_hn.js（基础功能）

```bash
# 单个帖子
node .claude/skills/hackernews/fetch_hn.js <HN_ID> --direct

# 故事列表
node .claude/skills/hackernews/fetch_hn.js --<type> <limit> --direct

# Type 选项：top, new, best, ask, show, job
# Limit：数量（默认 10）

# 示例
node .claude/skills/hackernews/fetch_hn.js --top 20 --direct
node .claude/skills/hackernews/fetch_hn.js --show 15 --direct
node .claude/skills/hackernews/fetch_hn.js --ask 10 --direct

# 过滤
node .claude/skills/hackernews/fetch_hn.js --top 30 --filter ai machine learning --direct
node .claude/skills/hackernews/fetch_hn.js --show 20 --category security --direct
```

### fetch_hn_algolia.js（商业洞察）

```bash
# 预设查询
node .claude/skills/hackernews/fetch_hn_algolia.js <preset> --direct

# Preset 选项：
# - ai-trends: AI 趋势
# - startup-ideas: 创业机会
# - funding: 融资动态
# - market-gaps: 市场空白
# - monetization: 变现策略
# - show-hn: Show HN 项目

# 时间范围（可选）
--time <range>  # 1h, 24h, 7d, 30d

# 数量限制（可选）
--limit <number>  # 默认 30

# 示例
node .claude/skills/hackernews/fetch_hn_algolia.js ai-trends --time 7d --direct
node .claude/skills/hackernews/fetch_hn_algolia.js startup-ideas --limit 50 --direct

# 每日摘要
node .claude/skills/hackernews/fetch_hn_algolia.js --daily --direct

# 自定义搜索
node .claude/skills/hackernews/fetch_hn_algolia.js --query "SaaS pricing" --min-points 20 --time 30d --direct
```

---

## 💡 最佳实践总结

1. **日常使用：** 优先使用 Slash Commands (`/hn-top10`)
2. **明确指令：** 使用"执行命令："前缀确保脚本执行
3. **终端执行：** 对于自动化和集成场景，直接使用 node 命令
4. **组合使用：** 终端获取数据 + Claude 深度分析 = 最佳体验
5. **创建别名：** 为常用命令创建 shell 别名提高效率
6. **使用 --direct：** 始终使用 `--direct` 标志获取实时数据

---

## 📞 获取帮助

如遇到问题：
1. 查看 [SKILL_EXECUTION_ANALYSIS.md](./SKILL_EXECUTION_ANALYSIS.md) 了解技术细节
2. 查看 [EXAMPLES.md](./EXAMPLES.md) 获取更多使用示例
3. 查看 [BUSINESS_INSIGHTS.md](./BUSINESS_INSIGHTS.md) 了解商业洞察功能

---

**记住：** 当前 Skill 系统无法强制执行特定脚本，使用本指南中的方法可以绕过这个限制，获得可靠的功能体验。🚀
