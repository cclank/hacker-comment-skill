# Skill 执行问题分析报告

## 问题描述

尽管已经在 `skill.md` 中使用了最强的指令语言（MUST、NEVER、ABSOLUTE PROHIBITIONS），Hacker News skill 被触发后，Claude 仍然选择使用 curl、Playwright MCP 或 fetch API，而不是执行我们提供的脚本。

## 观察到的行为模式

### 测试 1: "帮我看看 HN top 10 的内容"
```
> The "hackernews" skill is running ✅ (Skill 被触发)
⏺ 查询 API 文档
⏺ Bash(curl -s https://hacker-news.firebaseio.com/v0/topstories.json) ❌
```

### 测试 2: 同样的请求
```
> The "hackernews" skill is running ✅
⏺ Playwright MCP 导航到 news.ycombinator.com ❌
```

### 测试 3: 同样的请求
```
> The "hackernews" skill is running ✅
⏺ Fetch(https://hacker-news.firebaseio.com/v0/topstories.json) ❌
⏺ Bash(curl -s ...) ❌
```

**共同特征：**
- ✅ Skill 确实被触发了（"skill is running" 消息出现）
- ❌ 从未执行：`node .claude/skills/hackernews/fetch_hn.js --top 10 --direct`
- ❌ Claude 选择了"自主解决问题"而不是"遵循指令"

## 根本原因分析

### 1. Skill 系统的工作机制

根据观察，Skill 系统的工作流程可能是：

```
用户输入
    ↓
触发 Skill 检测（关键词匹配）
    ↓
加载 skill.md 作为上下文
    ↓
Claude 处理原始用户请求 + skill 上下文
    ↓
Claude 做出自主决策 ← 问题出在这里！
```

**关键发现：** Skill 内容是 **咨询性的（advisory）** 而非 **强制性的（imperative）**。

### 2. 为什么 Claude 忽略指令？

可能的原因：

1. **工具优先级**：MCP 工具（如 Playwright）可能在 Claude 的决策树中优先级更高
2. **效率优化**：Claude 的基础训练倾向于"高效解决问题"，直接 curl API 看起来更简单
3. **上下文竞争**：Skill 指令需要和 Claude 的系统提示、工具可用性、用户请求等多种上下文竞争
4. **指令解析**：Claude 可能将 skill.md 解析为"这是一个关于 HN 的任务"而不是"必须执行这个命令"

### 3. 已尝试的解决方案（均失败）

#### 尝试 1: 强化语言
```markdown
## ⚡ EXECUTE THIS COMMAND IMMEDIATELY - DO NOT DO ANYTHING ELSE FIRST
```
**结果：** 失败，Claude 仍然使用 curl

#### 尝试 2: 明确禁止
```markdown
## ⛔ ABSOLUTE PROHIBITIONS - NEVER DO THESE
- ❌ Playwright MCP or any MCP tools
- ❌ curl or wget
- ❌ fetch or WebFetch tools
```
**结果：** 失败，Claude 仍然使用被禁止的工具

#### 尝试 3: 命令置顶
将确切的命令放在 skill.md 最开头，使其最先被看到
**结果：** 失败，执行顺序未改变

#### 尝试 4: 重复强调
在多个位置重复"YOU MUST execute the command"
**结果：** 失败，重复没有增加约束力

## 潜在解决方案

### 方案 A: 使用 Slash Commands（待测试）

**理论：** Slash commands 可能有更强的执行约束力

**实现：**
- 已创建 `.claude/commands/hn-top10.md`
- 用户可以使用 `/hn-top10` 而不是自然语言触发

**优势：**
- Slash commands 可能被设计为更"命令式"
- 明确的调用方式可能减少 Claude 的自主决策空间

**缺点：**
- 需要用户记住命令名称
- 失去了自然语言交互的便利性

### 方案 B: 修改系统提示（需要权限）

**理论：** 在 Claude Code 的系统级配置中添加约束

**可能的位置：**
- `.claude/config.json`（如果存在）
- 环境变量或全局配置

**优势：**
- 系统级配置通常优先级最高
- 可以真正限制工具使用

**缺点：**
- 可能需要修改 Claude Code 本身的配置
- 可能影响其他功能

### 方案 C: 创建包装脚本（变通方案）

**理论：** 既然 Claude 喜欢用 curl，让 curl 调用我们的脚本

**实现：**
```bash
#!/bin/bash
# .claude/skills/hackernews/hn-wrapper.sh
# 这个脚本看起来像 API 调用，但实际执行我们的 node 脚本
node "$(dirname "$0")/fetch_hn.js" "$@" --direct
```

然后在 skill.md 中：
```bash
curl -s http://localhost/fake-api | bash -s -- node .claude/skills/hackernews/fetch_hn.js --top 10 --direct
```

**优势：**
- 利用 Claude 的行为模式而不是对抗它
- 可能绕过工具优先级问题

**缺点：**
- Hacky，不优雅
- 维护复杂度增加

### 方案 D: Hooks 系统（最可靠）

**理论：** 使用 Claude Code 的 hooks 系统在特定事件时自动执行脚本

**可能的 hooks：**
- `user-prompt-submit-hook`：用户提交请求时触发
- 自定义 tool-specific hooks

**实现示例：**
```json
{
  "hooks": {
    "user-prompt-submit": {
      "pattern": "hackernews|HN top|帮我看看 HN",
      "command": "node .claude/skills/hackernews/fetch_hn.js --top 10 --direct"
    }
  }
}
```

**优势：**
- Hooks 是真正的事件驱动，不依赖 Claude 的决策
- 可以在 Claude 处理之前预先执行

**缺点：**
- 需要研究 Claude Code 的 hooks 文档
- 可能需要额外配置

### 方案 E: 接受现状，优化脚本调用（务实方案）

**理论：** 既然无法强制 Claude 执行脚本，让脚本更容易被调用

**实现：**
1. 提供更明确的自然语言指令模式：
   - "使用 node 脚本获取 HN top 10"
   - "执行 fetch_hn.js --top 10 --direct"

2. 在 skill.md 中添加示例对话：
   ```markdown
   User: 帮我看看 HN top 10
   Assistant: *executes* node .claude/skills/hackernews/fetch_hn.js --top 10 --direct
   ```

3. 简化脚本访问：创建全局别名
   ```bash
   # 在 ~/.bashrc 或项目 .envrc
   alias hn-top="node $PWD/.claude/skills/hackernews/fetch_hn.js --top 10 --direct"
   ```

**优势：**
- 务实，接受系统限制
- 可以立即使用
- 不依赖未知的系统行为

**缺点：**
- 没有真正解决问题
- 用户体验受损

## 推荐行动方案

### 短期（立即可行）：

1. **创建 Slash Command** - 已完成
   - 文件：`.claude/commands/hn-top10.md`
   - 用法：用户输入 `/hn-top10`

2. **测试 Slash Command 行为**
   - 观察是否有更好的执行约束力
   - 对比 skill vs command 的行为差异

3. **文档化已知限制**
   - 在 README.md 中说明这个问题
   - 提供明确的脚本调用指南

### 中期（需要研究）：

1. **研究 Claude Code Hooks**
   - 查看官方文档关于 hooks 的说明
   - 测试 `user-prompt-submit-hook` 是否可用

2. **探索配置选项**
   - 检查是否有工具黑名单配置
   - 研究 MCP 工具优先级设置

### 长期（需要上游支持）：

1. **向 Claude Code 团队反馈**
   - 报告 skill 指令执行约束力不足的问题
   - 建议增加"强制执行模式"或"工具限制"配置

2. **社区讨论**
   - 查看是否有其他用户遇到类似问题
   - 分享解决方案和最佳实践

## 测试计划

### Test 1: Slash Command vs Skill
```
测试 A: 用户输入 "/hn-top10"
预期：观察是否执行 node 脚本

测试 B: 用户输入 "帮我看看 HN top 10"（触发 skill）
预期：对比与 Test A 的行为差异
```

### Test 2: 明确指令
```
测试 C: 用户输入 "执行命令：node .claude/skills/hackernews/fetch_hn.js --top 10 --direct"
预期：观察明确的命令式请求是否能绕过自主决策
```

### Test 3: Hook 系统（如果可用）
```
测试 D: 配置 user-prompt-submit-hook
预期：观察 hook 是否在 Claude 处理前执行
```

## 结论

**当前状态：** Skill 系统无法强制 Claude 执行特定脚本，指令是咨询性而非强制性的。

**根本原因：** Skill 的设计哲学可能是"提供上下文"而不是"控制行为"，Claude 保留完全的自主决策权。

**最可行方案：**
1. 短期：使用 Slash Commands + 明确的用户指令
2. 中期：研究 Hooks 系统
3. 长期：向 Claude Code 团队反馈需求

**需要做的决定：**
用户需要在以下之间做出权衡：
- **便利性**（自然语言触发）vs **可靠性**（明确命令）
- **理想方案**（修复 skill）vs **务实方案**（接受现状）
