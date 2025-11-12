# Hacker News Skill 完整使用示例

## 目录

- [单帖分析](#单帖分析)
- [热门故事列表](#热门故事列表)
- [关键词过滤](#关键词过滤)
- [分类过滤](#分类过滤)
- [组合使用](#组合使用)
- [高级用法](#高级用法)

---

## 单帖分析

### 示例 1: 基础使用
抓取并分析一个帖子及其所有评论。

**输入：**
```
hackernews 38471822
```

**效果：**
- 获取帖子完整内容
- 获取所有评论（递归）
- 使用默认分析框架进行综合分析

---

### 示例 2: 技术深度分析
**输入：**
```
hackernews 38471822 分析这个帖子中讨论的技术架构和性能优化方案
```

**分析重点：**
- 技术架构设计
- 性能优化策略
- 实施细节和代码示例
- 潜在问题和解决方案

---

### 示例 3: 观点对比
**输入：**
```
hackernews 38471822 总结支持和反对的观点，并分析各自的论据强度
```

**分析重点：**
- 正方观点及论据
- 反方观点及论据
- 中立观点
- 论据质量评估

---

### 示例 4: 资源提取
**输入：**
```
hackernews 38471822 提取所有提到的工具、库、文档和学习资源
```

**分析重点：**
- 开源项目和工具
- 文档和教程链接
- 书籍和论文推荐
- 在线资源

---

## 热门故事列表

### 示例 5: Top 10 故事
获取当前最热门的 10 条故事。

**输入：**
```
hackernews top 10
```

或

```
show me top 10 HN stories
```

**效果：**
- 获取热度最高的 10 条
- 显示标题、分数、评论数
- 包含来源域名和分类
- 提供 HN 讨论链接

---

### 示例 6: New Stories
获取最新发布的故事。

**输入：**
```
hackernews new 15
```

或

```
what are the latest 15 stories on HN?
```

**效果：**
- 按时间排序的新故事
- 可能包含尚未热门但有潜力的内容

---

### 示例 7: Best Stories
获取综合评分最高的故事。

**输入：**
```
hackernews best 20
```

**效果：**
- 算法评分最高的故事
- 通常是经过时间验证的优质内容

---

### 示例 8: Ask HN
获取 Ask HN 类型的讨论。

**输入：**
```
hackernews ask 10
```

或

```
show me recent Ask HN posts
```

**效果：**
- 社区提问和讨论
- 通常包含经验分享和建议

---

### 示例 9: Show HN
获取 Show HN 项目展示。

**输入：**
```
hackernews show 15
```

或

```
what are the latest Show HN projects?
```

**效果：**
- 社区成员分享的项目
- 新工具、网站、应用展示

---

### 示例 10: Job Stories
获取招聘信息。

**输入：**
```
hackernews job 10
```

**效果：**
- 技术岗位招聘
- 远程工作机会
- 创业公司招聘

---

## 关键词过滤

### 示例 11: AI/ML 相关故事
**输入：**
```
hackernews top 20 AI machine learning GPT
```

或

```
show me top 20 stories about AI and machine learning
```

**效果：**
- 标题或内容包含 AI、machine learning、GPT 的故事
- 自动过滤相关内容
- 返回最多 20 条匹配结果

---

### 示例 12: 特定编程语言
**输入：**
```
hackernews top 15 rust
```

或

```
get top stories about Rust programming
```

**效果：**
- Rust 相关的讨论和项目
- 包含 Rust 工具、库、教程

---

### 示例 13: 框架和工具
**输入：**
```
hackernews show 20 react vue angular
```

**效果：**
- 关于 React、Vue、Angular 的项目
- 前端框架相关的 Show HN

---

### 示例 14: 多关键词组合
**输入：**
```
hackernews top 30 kubernetes docker devops cloud
```

**效果：**
- DevOps 和云相关的全面覆盖
- 包含容器化、编排、云服务等主题

---

## 分类过滤

### 示例 15: AI/ML 类别
**输入：**
```
hackernews top 20 category:ai/ml
```

或

```
show me top AI/ML stories from HN
```

**效果：**
- 自动识别 AI/ML 相关内容
- 包含：GPT、神经网络、机器学习、LLM 等

---

### 示例 16: 安全类别
**输入：**
```
hackernews top 15 category:security
```

或

```
get top security posts from HN
```

**效果：**
- 安全漏洞报告
- 安全工具和最佳实践
- 加密和隐私讨论

---

### 示例 17: 创业类别
**输入：**
```
hackernews top 20 category:startup
```

**效果：**
- 创业公司故事
- 融资消息
- 创始人经验分享
- VC 观点

---

### 示例 18: 编程类别
**输入：**
```
hackernews best 25 category:programming
```

**效果：**
- 编程语言讨论
- 代码质量和最佳实践
- 编程工具和技巧

---

## 组合使用

### 示例 19: 类别 + 关键词
**输入：**
```
hackernews top 30 category:security filter:vulnerability exploit
```

或更自然的表达：

```
show me top 30 security stories about vulnerabilities and exploits
```

**效果：**
- 首先按安全类别过滤
- 然后在安全故事中找包含 vulnerability 或 exploit 的
- 双重过滤保证精准度

---

### 示例 20: Ask HN + 特定主题
**输入：**
```
hackernews ask 20 career interview job
```

或

```
show me Ask HN posts about career and interviews
```

**效果：**
- Ask HN 类型的帖子
- 关于职业发展、面试的讨论
- 通常包含经验分享和建议

---

### 示例 21: Show HN + 技术栈
**输入：**
```
hackernews show 15 python django flask
```

**效果：**
- Python web 框架相关的项目
- 社区成员用 Django/Flask 构建的应用

---

### 示例 22: New Stories + AI 过滤
**输入：**
```
hackernews new 25 gpt llm ai chatbot
```

**效果：**
- 最新的 AI 相关故事
- 可能包含尚未热门的新项目
- 适合追踪前沿动态

---

## 高级用法

### 示例 23: 深度分析热门故事
**输入：**
```
hackernews top 10

[看完列表后]
hackernews 38471822 深入分析这个最热门的帖子
```

**工作流：**
1. 先获取 top 10 概览
2. 选择感兴趣的帖子
3. 深入分析该帖子的评论

---

### 示例 24: 领域趋势分析
**输入：**
```
hackernews top 50 category:ai/ml

请分析：
1. 当前 AI 领域的主要讨论话题
2. 最受关注的技术方向
3. 社区对各种 AI 工具的态度
4. 值得关注的新项目和论文
```

**效果：**
- 宏观的领域趋势分析
- 从多个故事中提取共同主题
- 识别技术方向和社区态度

---

### 示例 25: 技术栈调研
**输入：**
```
第一步：hackernews top 30 nextjs vercel
第二步：hackernews show 20 nextjs

请对比分析：
1. 社区对 Next.js 的讨论焦点
2. 实际项目中的使用情况
3. 常见问题和解决方案
4. 与其他框架的对比
```

**效果：**
- 综合的技术栈调研
- 结合讨论和实际项目
- 全面了解技术的优劣

---

### 示例 26: 竞品分析
**输入：**
```
hackernews top 40 anthropic openai claude gpt

分析：
1. Claude 和 GPT 的讨论对比
2. 用户更关注哪些特性
3. 各自的优势和劣势
4. 未来发展方向的预测
```

**效果：**
- 基于社区讨论的竞品分析
- 真实用户的反馈和意见
- 市场趋势洞察

---

### 示例 27: 问题诊断
**输入：**
```
hackernews top 50 postgres performance optimization

我遇到 Postgres 性能问题，请：
1. 总结社区推荐的优化方法
2. 提取具体的配置建议
3. 列出常见的性能陷阱
4. 推荐性能分析工具
```

**效果：**
- 针对性的问题解决方案
- 经验丰富用户的建议
- 实战中验证的方法

---

### 示例 28: 学习路径规划
**输入：**
```
hackernews top 50 learn rust programming beginner

我想学习 Rust，请：
1. 整理推荐的学习资源
2. 建议学习路径和顺序
3. 列出常见的学习陷阱
4. 推荐入门项目
```

**效果：**
- 社区验证的学习资源
- 经验者的学习建议
- 实践项目推荐

---

### 示例 29: 工具选型
**输入：**
```
hackernews top 40 monitoring prometheus grafana datadog

我需要选择监控方案，请：
1. 对比各个工具的优劣
2. 分析适用场景
3. 总结部署和维护成本
4. 提取实际使用经验
```

**效果：**
- 基于真实使用经验的对比
- 避免营销宣传的偏见
- 实际部署中的坑点

---

### 示例 30: 行业洞察
**输入：**
```
hackernews top 100 category:startup

分析本周创业领域的趋势：
1. 哪些赛道最受关注
2. 融资环境如何
3. 技术创新的方向
4. 创始人关心的问题
```

**效果：**
- 宏观的行业趋势
- 投资者和创始人的视角
- 技术和商业的结合点

---

## 提示词技巧

### 技巧 1: 明确分析角度
```
hackernews [ID/type] 从 [角色] 的角度分析 [方面]
```

例子：
- "从初学者的角度总结学习要点"
- "从架构师的角度评估技术方案"
- "从产品经理的角度分析用户需求"

---

### 技巧 2: 指定输出格式
```
hackernews [ID/type] [分析需求]，以 [格式] 输出
```

例子：
- "以列表形式总结要点"
- "用表格对比不同方案"
- "画出思维导图"
- "提供 markdown checklist"

---

### 技巧 3: 限定范围
```
hackernews [ID/type] 只关注 [特定方面]
```

例子：
- "只提取代码示例和实现细节"
- "只分析性能相关的讨论"
- "只关注安全方面的评论"

---

### 技巧 4: 优先级排序
```
hackernews [ID/type] 按 [标准] 排序后分析
```

例子：
- "按评论分数排序，分析最有价值的 5 条"
- "按时间顺序，展示讨论的演变"
- "按相关度，找出最相关的讨论"

---

### 技巧 5: 对比分析
```
先获取多个故事，然后进行对比
```

例子：
```
1. hackernews top 20 react
2. hackernews top 20 vue
3. 对比这两个框架在 HN 上的讨论热度和关注点
```

---

## 常见问题

### Q1: 如何获取最相关的结果？
**A:** 使用更具体的关键词，或者结合分类过滤。

例如：
- ❌ `hackernews top 10 web`（太宽泛）
- ✅ `hackernews top 20 nextjs react server-side-rendering`（具体）

---

### Q2: 过滤后没有结果怎么办？
**A:**
1. 增加数量限制（如 top 50 而不是 top 10）
2. 使用更宽泛的关键词
3. 使用分类而不是具体关键词

---

### Q3: 如何找到最有价值的讨论？
**A:**
1. 使用 `best` 而不是 `top`（best 考虑了时间因素）
2. 关注 Ask HN（通常有深度讨论）
3. 查看评论数多的帖子

---

### Q4: 如何跟踪特定领域的动态？
**A:** 定期运行相同的过滤命令：

```bash
# 每天早上运行
hackernews top 20 category:ai/ml

# 每周总结
hackernews best 50 category:startup
```

---

### Q5: 如何发现新项目？
**A:**
```
hackernews show 30  # Show HN 专门展示项目
hackernews new 20   # 新故事中可能有未热门的好项目
```

---

## 快捷命令模板

### 日常浏览
```
hackernews top 10                    # 快速看今日热点
hackernews new 15                    # 发现新鲜内容
hackernews ask 10                    # 看看大家在讨论什么
hackernews show 10                   # 发现新项目
```

### 技术调研
```
hackernews top 30 [技术名]          # 了解社区讨论
hackernews show 20 [技术名]         # 看实际项目
hackernews ask 15 [技术名]          # 看问题和经验
```

### 领域跟踪
```
hackernews top 50 category:ai/ml    # AI 领域
hackernews top 30 category:security # 安全领域
hackernews top 40 category:startup  # 创业领域
```

### 深度分析
```
hackernews [ID] 总结技术要点       # 技术分析
hackernews [ID] 提取学习资源       # 资源整理
hackernews [ID] 分析不同观点       # 观点对比
hackernews [ID] 列出最佳实践       # 实践总结
```

---

**Happy Hacking! 🚀**

探索更多用法，发现 HN 的价值！
