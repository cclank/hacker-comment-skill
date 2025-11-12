#!/usr/bin/env node

/**
 * Hacker News Algolia API Integration
 * 高效获取商业洞察、AI趋势和科技发现
 */

const https = require('https');
const fs = require('fs');

const ALGOLIA_BASE = 'http://hn.algolia.com/api/v1';

/**
 * Fetch JSON from Algolia API
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    // Convert http to https for Algolia
    const httpsUrl = url.replace('http://', 'https://');
    https.get(httpsUrl, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * 构建 Algolia API URL
 */
function buildAlgoliaURL(config) {
  const params = new URLSearchParams();

  if (config.query) {
    params.append('query', config.query);
  }

  if (config.tags && config.tags.length > 0) {
    params.append('tags', config.tags.join(','));
  }

  if (config.numericFilters && config.numericFilters.length > 0) {
    params.append('numericFilters', config.numericFilters.join(','));
  }

  if (config.hitsPerPage) {
    params.append('hitsPerPage', config.hitsPerPage);
  }

  if (config.page) {
    params.append('page', config.page);
  }

  const endpoint = config.searchByDate ? 'search_by_date' : 'search';
  return `${ALGOLIA_BASE}/${endpoint}?${params.toString()}`;
}

/**
 * 时间范围快捷方式
 */
function getTimeFilter(range) {
  const now = Math.floor(Date.now() / 1000);
  const ranges = {
    '1h': now - 3600,
    '6h': now - 6 * 3600,
    '12h': now - 12 * 3600,
    '24h': now - 24 * 3600,
    '2d': now - 2 * 24 * 3600,
    '3d': now - 3 * 24 * 3600,
    '7d': now - 7 * 24 * 3600,
    '14d': now - 14 * 24 * 3600,
    '30d': now - 30 * 24 * 3600
  };

  return ranges[range] ? `created_at_i>${ranges[range]}` : null;
}

/**
 * 预定义的商业洞察查询
 */
const BUSINESS_INSIGHTS = {
  // AI 相关
  'ai-trends': {
    query: 'AI OR "artificial intelligence" OR "machine learning" OR GPT OR LLM OR "deep learning"',
    tags: ['story', '(show_hn,ask_hn)'],
    numericFilters: ['points>20', 'num_comments>5']
  },

  // 创业和商机
  'startup-ideas': {
    query: 'startup OR "business idea" OR "market opportunity" OR "side project" OR "building"',
    tags: ['story', '(show_hn,ask_hn)'],
    numericFilters: ['points>15']
  },

  // 融资和收购
  'funding': {
    query: 'funding OR "series A" OR "series B" OR acquisition OR "raised" OR "investment"',
    tags: ['story'],
    numericFilters: ['points>30']
  },

  // 技术趋势
  'tech-trends': {
    query: 'breakthrough OR "new technology" OR innovation OR "game changer"',
    tags: ['story'],
    numericFilters: ['points>50']
  },

  // Show HN 项目
  'show-hn': {
    query: '',
    tags: ['show_hn'],
    numericFilters: ['points>20']
  },

  // Ask HN 讨论
  'ask-hn': {
    query: '',
    tags: ['ask_hn'],
    numericFilters: ['points>30', 'num_comments>20']
  },

  // 市场空白
  'market-gaps': {
    query: '"looking for" OR "need for" OR "missing" OR "wish there was" OR "would pay for"',
    tags: ['(story,comment)'],
    numericFilters: ['points>10']
  },

  // 赚钱机会
  'monetization': {
    query: 'revenue OR "making money" OR "profitable" OR "pricing" OR "customers paying"',
    tags: ['(story,ask_hn,show_hn)'],
    numericFilters: ['points>20']
  },

  // Web3/区块链
  'web3': {
    query: 'blockchain OR crypto OR web3 OR ethereum OR bitcoin OR NFT',
    tags: ['story'],
    numericFilters: ['points>25']
  },

  // 开发者工具
  'devtools': {
    query: 'tool OR library OR framework OR API OR developer',
    tags: ['(show_hn,story)'],
    numericFilters: ['points>30']
  },

  // 安全和隐私
  'security': {
    query: 'security OR vulnerability OR breach OR privacy OR "data leak"',
    tags: ['story'],
    numericFilters: ['points>40']
  },

  // 远程工作
  'remote-work': {
    query: '"remote work" OR "work from home" OR distributed OR "digital nomad"',
    tags: ['(story,ask_hn)'],
    numericFilters: ['points>20']
  }
};

/**
 * 格式化单个结果
 */
function formatHit(hit, index) {
  const date = new Date(hit.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const url = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;

  let output = `\n### ${index}. ${hit.title || hit.story_title || '无标题'}\n\n`;

  output += `📊 **评分：** ${hit.points || 0} 分 | `;
  output += `💬 **评论数：** ${hit.num_comments || 0} | `;
  output += `👤 **作者：** ${hit.author || 'unknown'}\n`;
  output += `📅 **时间：** ${date}\n\n`;

  // 标签
  const tags = hit._tags || [];
  const displayTags = tags.filter(t => !t.startsWith('author_') && !t.startsWith('story_'));
  if (displayTags.length > 0) {
    output += `🏷️ **类型：** ${displayTags.join(', ')}\n\n`;
  }

  // 链接
  if (hit.url) {
    output += `🔗 **原文链接：** ${hit.url}\n`;
    try {
      const domain = new URL(hit.url).hostname.replace('www.', '');
      output += `🌐 **来源：** ${domain}\n`;
    } catch (e) {}
  }

  output += `💭 **HN 讨论：** https://news.ycombinator.com/item?id=${hit.objectID}\n`;

  // 内容预览
  if (hit.story_text || hit.comment_text) {
    const text = hit.story_text || hit.comment_text;
    const preview = text.length > 200 ? text.substring(0, 200) + '...' : text;
    output += `\n📝 **内容：** ${preview}\n`;
  }

  return output;
}

/**
 * 分析商业洞察
 */
function analyzeBusinessInsights(hits, queryType) {
  let analysis = '\n## 🎯 商业洞察分析\n\n';

  // 统计
  const totalPoints = hits.reduce((sum, hit) => sum + (hit.points || 0), 0);
  const totalComments = hits.reduce((sum, hit) => sum + (hit.num_comments || 0), 0);
  const avgPoints = Math.round(totalPoints / hits.length);
  const avgComments = Math.round(totalComments / hits.length);

  analysis += `📈 **热度统计：**\n`;
  analysis += `- 平均评分：${avgPoints} 分\n`;
  analysis += `- 平均评论：${avgComments} 条\n`;
  analysis += `- 总互动量：${totalPoints + totalComments}\n\n`;

  // 热门域名
  const domains = {};
  hits.forEach(hit => {
    if (hit.url) {
      try {
        const domain = new URL(hit.url).hostname.replace('www.', '');
        domains[domain] = (domains[domain] || 0) + 1;
      } catch (e) {}
    }
  });

  const topDomains = Object.entries(domains)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topDomains.length > 0) {
    analysis += `🌐 **热门来源：**\n`;
    topDomains.forEach(([domain, count]) => {
      analysis += `- ${domain}: ${count} 篇\n`;
    });
    analysis += '\n';
  }

  // 时间分布
  const timeRanges = {
    '24小时内': 0,
    '3天内': 0,
    '7天内': 0,
    '更早': 0
  };

  const now = Date.now();
  hits.forEach(hit => {
    const age = now - new Date(hit.created_at).getTime();
    const days = age / (1000 * 60 * 60 * 24);

    if (days < 1) timeRanges['24小时内']++;
    else if (days < 3) timeRanges['3天内']++;
    else if (days < 7) timeRanges['7天内']++;
    else timeRanges['更早']++;
  });

  analysis += `⏰ **时间分布：**\n`;
  Object.entries(timeRanges).forEach(([range, count]) => {
    if (count > 0) {
      analysis += `- ${range}: ${count} 篇\n`;
    }
  });
  analysis += '\n';

  // 按类型分类
  const typeCount = {};
  hits.forEach(hit => {
    const tags = hit._tags || [];
    tags.forEach(tag => {
      if (tag === 'show_hn') typeCount['Show HN'] = (typeCount['Show HN'] || 0) + 1;
      else if (tag === 'ask_hn') typeCount['Ask HN'] = (typeCount['Ask HN'] || 0) + 1;
      else if (tag === 'story') typeCount['故事'] = (typeCount['故事'] || 0) + 1;
    });
  });

  if (Object.keys(typeCount).length > 0) {
    analysis += `📊 **内容类型：**\n`;
    Object.entries(typeCount).forEach(([type, count]) => {
      analysis += `- ${type}: ${count} 篇\n`;
    });
    analysis += '\n';
  }

  return analysis;
}

/**
 * 生成商业建议
 */
function generateRecommendations(hits, queryType) {
  let recommendations = '\n## 💡 发现和建议\n\n';

  // 找出最热门的
  const topStories = [...hits]
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 3);

  recommendations += `### 🔥 最值得关注（按热度）\n\n`;
  topStories.forEach((story, index) => {
    recommendations += `${index + 1}. **${story.title || story.story_title}** (${story.points} 分, ${story.num_comments} 评论)\n`;
    recommendations += `   💭 https://news.ycombinator.com/item?id=${story.objectID}\n\n`;
  });

  // 找出讨论最激烈的
  const mostDiscussed = [...hits]
    .sort((a, b) => (b.num_comments || 0) - (a.num_comments || 0))
    .slice(0, 3);

  recommendations += `### 💬 讨论最激烈（潜在争议或关注点）\n\n`;
  mostDiscussed.forEach((story, index) => {
    if (story.num_comments > 0) {
      recommendations += `${index + 1}. **${story.title || story.story_title}** (${story.num_comments} 评论)\n`;
      recommendations += `   💭 https://news.ycombinator.com/item?id=${story.objectID}\n\n`;
    }
  });

  // 根据查询类型给出建议
  const insights = {
    'ai-trends': '💡 **AI领域洞察：** 关注最新的AI工具和应用场景，这些是当前热点和潜在机会',
    'startup-ideas': '💡 **创业机会：** 注意用户痛点和需求，这些可能是创业切入点',
    'market-gaps': '💡 **市场空白：** 用户明确表达了需求但尚未被满足，这是创业的黄金机会',
    'funding': '💡 **融资动态：** 了解哪些领域正在获得投资，判断市场热度和方向',
    'monetization': '💡 **变现策略：** 学习成功项目的商业模式和定价策略',
    'show-hn': '💡 **新项目：** 这些是社区创建的新产品，可能有合作或学习机会',
    'devtools': '💡 **开发工具：** 关注提升效率的工具，也可能是SaaS创业方向'
  };

  if (insights[queryType]) {
    recommendations += `\n${insights[queryType]}\n`;
  }

  return recommendations;
}

/**
 * 主搜索函数
 */
async function searchHN(config) {
  console.error(`\n🔍 正在搜索 Hacker News...\n`);
  console.error(`📋 查询配置：`);
  console.error(`   - 关键词: ${config.query || '(无)'}`);
  console.error(`   - 标签: ${config.tags?.join(', ') || '(无)'}`);
  console.error(`   - 结果数: ${config.hitsPerPage || 30}`);
  if (config.numericFilters) {
    console.error(`   - 过滤条件: ${config.numericFilters.join(', ')}`);
  }
  console.error('');

  const url = buildAlgoliaURL(config);
  console.error(`🌐 API URL: ${url}\n`);

  const result = await fetchJSON(url);
  console.error(`✅ 找到 ${result.hits.length} 条结果\n`);

  return result;
}

/**
 * 格式化完整报告
 */
function formatReport(result, queryType, config) {
  const queryName = BUSINESS_INSIGHTS[queryType] ?
    getQueryTypeName(queryType) :
    (config.query || '自定义搜索');

  let output = `# 🎯 Hacker News 商业洞察报告\n\n`;
  output += `## ${queryName}\n\n`;
  output += `📊 **结果统计：** ${result.hits.length} 条相关内容\n`;
  output += `⏰ **生成时间：** ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n`;
  output += `⚡ **搜索耗时：** ${result.processingTimeMS}ms\n\n`;

  // 添加商业洞察分析
  output += analyzeBusinessInsights(result.hits, queryType);

  // 添加建议
  output += generateRecommendations(result.hits, queryType);

  output += '\n---\n\n';
  output += `## 📰 详细内容\n`;

  // 格式化所有结果
  result.hits.forEach((hit, index) => {
    output += formatHit(hit, index + 1);
    output += '\n---\n';
  });

  // 添加搜索信息
  output += '\n\n---\n\n';
  output += `*💡 提示：点击 HN 讨论链接查看完整对话，可能有更多有价值的信息*\n`;

  return output;
}

/**
 * 获取查询类型的中文名称
 */
function getQueryTypeName(type) {
  const names = {
    'ai-trends': '🤖 AI 趋势和创新',
    'startup-ideas': '🚀 创业想法和商机',
    'funding': '💰 融资和收购动态',
    'tech-trends': '🔬 技术突破和趋势',
    'show-hn': '🎨 Show HN 新项目',
    'ask-hn': '❓ Ask HN 热门讨论',
    'market-gaps': '🎯 市场空白和需求',
    'monetization': '💵 变现策略和商业模式',
    'web3': '⛓️ Web3 和区块链',
    'devtools': '🛠️ 开发者工具',
    'security': '🔒 安全和隐私',
    'remote-work': '🌍 远程工作'
  };
  return names[type] || type;
}

/**
 * 解析命令行参数
 */
function parseArgs(args) {
  const config = {
    mode: 'preset', // preset, custom, daily
    queryType: null,
    query: null,
    tags: [],
    numericFilters: [],
    hitsPerPage: 30,
    timeRange: null,
    searchByDate: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // 预设查询
    if (BUSINESS_INSIGHTS[arg]) {
      config.queryType = arg;
      config.mode = 'preset';
    }
    // 每日摘要
    else if (arg === '--daily' || arg === '-d') {
      config.mode = 'daily';
    }
    // 自定义查询
    else if (arg === '--query' || arg === '-q') {
      config.mode = 'custom';
      config.query = args[++i];
    }
    // 标签
    else if (arg === '--tags' || arg === '-t') {
      i++;
      while (i < args.length && !args[i].startsWith('--')) {
        config.tags.push(args[i]);
        i++;
      }
      i--;
    }
    // 时间范围
    else if (arg === '--time' || arg === '-r') {
      config.timeRange = args[++i];
      const filter = getTimeFilter(config.timeRange);
      if (filter) {
        config.numericFilters.push(filter);
      }
    }
    // 最小分数
    else if (arg === '--min-points' || arg === '-p') {
      const points = args[++i];
      config.numericFilters.push(`points>${points}`);
    }
    // 最小评论数
    else if (arg === '--min-comments' || arg === '-c') {
      const comments = args[++i];
      config.numericFilters.push(`num_comments>${comments}`);
    }
    // 结果数量
    else if (arg === '--limit' || arg === '-l') {
      config.hitsPerPage = parseInt(args[++i]);
    }
    // 按日期排序
    else if (arg === '--by-date') {
      config.searchByDate = true;
    }
    // 输出文件
    else if (arg === '--output' || arg === '-o') {
      config.outputFile = args[++i];
    }
  }

  return config;
}

/**
 * 打印使用说明
 */
function printUsage() {
  console.log(`
🎯 Hacker News 商业洞察工具 - Algolia API

用法：

  📚 预设查询（推荐）:
  node fetch_hn_algolia.js <preset> [options]

  可用预设：
    ai-trends        🤖 AI趋势和创新
    startup-ideas    🚀 创业想法和商机
    funding          💰 融资和收购动态
    tech-trends      🔬 技术突破和趋势
    show-hn          🎨 Show HN 新项目
    ask-hn           ❓ Ask HN 热门讨论
    market-gaps      🎯 市场空白和需求
    monetization     💵 变现策略和商业模式
    web3             ⛓️ Web3 和区块链
    devtools         🛠️ 开发者工具
    security         🔒 安全和隐私
    remote-work      🌍 远程工作

  🔍 自定义搜索:
  node fetch_hn_algolia.js --query "搜索词" [options]

  📅 每日摘要:
  node fetch_hn_algolia.js --daily

选项：
  --time, -r <range>       时间范围: 1h, 6h, 12h, 24h, 2d, 3d, 7d, 14d, 30d
  --min-points, -p <n>     最小评分
  --min-comments, -c <n>   最小评论数
  --limit, -l <n>          结果数量 (默认: 30)
  --tags, -t <tags>        标签过滤 (story, show_hn, ask_hn 等)
  --by-date                按日期排序（而非相关性）
  --output, -o <file>      输出文件路径

示例：

  # 查看 AI 领域趋势
  node fetch_hn_algolia.js ai-trends

  # 过去24小时的 AI 热门内容
  node fetch_hn_algolia.js ai-trends --time 24h

  # 寻找创业机会（高互动）
  node fetch_hn_algolia.js startup-ideas --min-points 50 --min-comments 20

  # 发现市场空白（近7天）
  node fetch_hn_algolia.js market-gaps --time 7d --limit 50

  # 自定义搜索：找寻 SaaS 相关内容
  node fetch_hn_algolia.js --query "SaaS" --tags story --min-points 30

  # 每日科技摘要
  node fetch_hn_algolia.js --daily

  # 查看最新 Show HN 项目
  node fetch_hn_algolia.js show-hn --by-date --time 3d
`);
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const config = parseArgs(args);

  try {
    let result;
    let queryType = config.queryType;

    if (config.mode === 'preset') {
      // 使用预设查询
      if (!config.queryType) {
        console.error('错误：未指定预设查询类型');
        printUsage();
        process.exit(1);
      }

      const preset = BUSINESS_INSIGHTS[config.queryType];
      config.query = preset.query;
      config.tags = preset.tags;
      if (preset.numericFilters) {
        config.numericFilters = [...config.numericFilters, ...preset.numericFilters];
      }

      result = await searchHN(config);

    } else if (config.mode === 'daily') {
      // 每日摘要：混合多个查询
      console.error('🌅 生成每日摘要...\n');
      queryType = 'daily-summary';

      // 获取多个类别的 top 内容
      const categories = ['ai-trends', 'startup-ideas', 'show-hn', 'tech-trends'];
      const allHits = [];

      for (const cat of categories) {
        const preset = BUSINESS_INSIGHTS[cat];
        const catConfig = {
          ...config,
          query: preset.query,
          tags: preset.tags,
          numericFilters: [...preset.numericFilters || [], `created_at_i>${Math.floor(Date.now() / 1000) - 24 * 3600}`],
          hitsPerPage: 10
        };

        const catResult = await searchHN(catConfig);
        allHits.push(...catResult.hits);
      }

      // 去重并按分数排序
      const uniqueHits = Array.from(
        new Map(allHits.map(hit => [hit.objectID, hit])).values()
      ).sort((a, b) => (b.points || 0) - (a.points || 0))
        .slice(0, 30);

      result = {
        hits: uniqueHits,
        processingTimeMS: 0
      };

    } else {
      // 自定义搜索
      if (!config.query && config.tags.length === 0) {
        console.error('错误：自定义搜索需要指定 --query 或 --tags');
        printUsage();
        process.exit(1);
      }

      result = await searchHN(config);
      queryType = 'custom';
    }

    // 格式化报告
    const report = formatReport(result, queryType, config);

    // 保存到文件
    const outputFile = config.outputFile || `/tmp/hn_insight_${queryType || 'custom'}_${Date.now()}.txt`;
    fs.writeFileSync(outputFile, report, 'utf-8');
    console.error(`\n✅ 报告已保存到: ${outputFile}\n`);

    // 输出文件路径供 skill 使用
    console.log(outputFile);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
