# Hacker News Analyzer Skill for Claude Code

🔍 一个强大的 Claude Code 自定义技能，用于深度分析 Hacker News 帖子和评论

## ✨ 特性

- 📖 **完整内容抓取**：获取 HN 帖子的完整内容和所有评论
- 💬 **递归评论**：支持多层嵌套的评论结构
- 🎯 **自定义分析**：使用自定义提示词进行针对性分析
- 🧠 **智能解析**：自动解码 HTML、格式化内容
- 🚀 **零依赖**：仅使用 Node.js 内置模块

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

### 基础使用
```
hackernews 38471822
```

### 技术分析
```
hackernews 38471822 总结这个帖子中讨论的技术方案和最佳实践
```

### 观点提取
```
hackernews 38471822 列出主要的支持和反对观点
```

### 资源汇总
```
hackernews 38471822 提取所有提到的工具、库和学习资源
```

更多示例请查看 [EXAMPLES.md](.claude/skills/hackernews/EXAMPLES.md)

## 📁 项目结构

```
.
├── .claude/
│   └── skills/
│       └── hackernews/
│           ├── skill.md          # Skill 配置（核心文件）
│           ├── fetch_hn.js       # HN API 抓取脚本
│           ├── README.md         # Skill 使用文档
│           └── EXAMPLES.md       # 详细使用示例
└── README.md                     # 项目说明（本文件）
```

## 🔧 工作原理

1. **参数解析**：从用户消息中提取 HN 帖子 ID 和分析需求
2. **内容抓取**：调用 HN API 递归获取帖子和所有评论
3. **内容存储**：将格式化的内容保存到临时文件
4. **AI 分析**：Claude 读取内容并根据提示进行分析
5. **结果展示**：以结构化的 Markdown 格式输出分析结果

## 🎯 使用场景

- **技术调研**：快速了解某个技术的社区讨论
- **方案对比**：对比不同技术方案的优劣
- **最佳实践**：学习行业最佳实践和经验
- **趋势分析**：了解技术趋势和社区态度
- **资源收集**：汇总学习资源和工具推荐
- **问题解决**：查找类似问题的解决方案

## 🌟 默认分析维度

如果不提供自定义提示，skill 会自动从以下角度分析：

1. 📝 **帖子摘要** - 主题和核心观点
2. 💡 **关键洞察** - 最有价值的评论
3. 👥 **多元视角** - 不同观点和立场
4. ⚙️ **技术细节** - 实现方法和工具
5. 📚 **资源汇总** - 链接、文档、书籍
6. ⚔️ **争议话题** - 辩论和分歧点

## 🛠️ 技术栈

- **语言**：Node.js (JavaScript)
- **API**：Hacker News Firebase API
- **依赖**：无（仅使用内置模块：https, fs, path）

## 📊 API 说明

使用官方 Hacker News API：
- 基础 URL：`https://hacker-news.firebaseio.com/v0/`
- 文档：https://github.com/HackerNews/API

支持的 API 端点：
- `/item/<id>.json` - 获取帖子或评论详情

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

## 🔮 未来计划

- [ ] 支持批量分析多个帖子
- [ ] 添加评论排序（按分数、时间等）
- [ ] 支持导出为 JSON/PDF 格式
- [ ] 添加缓存机制避免重复抓取
- [ ] 支持 HN 搜索集成
- [ ] 添加情感分析功能
- [ ] 支持关键词高亮

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
