#!/usr/bin/env node

/**
 * Hacker News Content Fetcher
 * Fetches HN posts with various modes:
 * - Single post with all comments
 * - Top/New/Best/Ask/Show/Job stories lists
 * - Content filtering by keywords
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';

// Story type endpoints
const STORY_TYPES = {
  top: 'topstories',
  new: 'newstories',
  best: 'beststories',
  ask: 'askstories',
  show: 'showstories',
  job: 'jobstories'
};

/**
 * Fetch JSON from HN API
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
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
 * Fetch item by ID
 */
async function fetchItem(id) {
  return fetchJSON(`${HN_API_BASE}/item/${id}.json`);
}

/**
 * Recursively fetch all comments
 */
async function fetchComments(commentIds, depth = 0) {
  if (!commentIds || commentIds.length === 0) {
    return [];
  }

  const comments = [];

  for (const id of commentIds) {
    try {
      const item = await fetchItem(id);

      if (item && !item.deleted && !item.dead) {
        const comment = {
          id: item.id,
          author: item.by || '[deleted]',
          text: item.text || '',
          time: item.time,
          depth: depth,
          replies: []
        };

        // Recursively fetch replies
        if (item.kids && item.kids.length > 0) {
          comment.replies = await fetchComments(item.kids, depth + 1);
        }

        comments.push(comment);
      }
    } catch (e) {
      console.error(`Error fetching comment ${id}:`, e.message);
    }
  }

  return comments;
}

/**
 * Convert HTML entities to plain text
 */
function decodeHTML(html) {
  if (!html) return '';

  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/<p>/g, '\n\n')
    .replace(/<\/p>/g, '')
    .replace(/<i>/g, '')
    .replace(/<\/i>/g, '')
    .replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '$2 ($1)')
    .replace(/<[^>]+>/g, '');
}

/**
 * Format a single comment for output
 */
function formatComment(comment, includeReplies = true) {
  const indent = '  '.repeat(comment.depth);
  const date = new Date(comment.time * 1000).toISOString();
  const text = decodeHTML(comment.text);

  let output = `${indent}[Comment by ${comment.author} at ${date}]\n`;
  output += `${indent}${text.split('\n').join('\n' + indent)}\n`;

  if (includeReplies && comment.replies.length > 0) {
    output += '\n';
    for (const reply of comment.replies) {
      output += formatComment(reply, true);
    }
  }

  return output;
}

/**
 * Format the entire post with comments (Chinese output)
 */
function formatPost(post, comments) {
  let output = '# Hacker News 帖子\n\n';
  output += `## ${post.title}\n\n`;
  output += `👤 **作者：** ${post.by || 'unknown'}\n`;
  output += `📊 **评分：** ${post.score || 0} 分\n`;
  output += `📅 **时间：** ${new Date(post.time * 1000).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n`;
  output += `💭 **HN 讨论：** https://news.ycombinator.com/item?id=${post.id}\n`;

  if (post.url) {
    output += `🔗 **原文链接：** ${post.url}\n`;
  }
  output += '\n';

  if (post.text) {
    output += `## 📝 帖子内容\n\n`;
    output += decodeHTML(post.text) + '\n\n';
  }

  output += `## 💬 评论 (共 ${post.descendants || 0} 条)\n\n`;

  for (const comment of comments) {
    output += formatComment(comment);
    output += '\n---\n\n';
  }

  return output;
}

/**
 * Fetch story IDs by type
 */
async function fetchStoryIds(type) {
  const endpoint = STORY_TYPES[type];
  if (!endpoint) {
    throw new Error(`Invalid story type: ${type}`);
  }
  return fetchJSON(`${HN_API_BASE}/${endpoint}.json`);
}

/**
 * Format a story item for list view (Chinese output)
 */
function formatStoryItem(story, index) {
  const date = new Date(story.time * 1000).toISOString().split('T')[0];
  let domain = 'news.ycombinator.com';

  if (story.url) {
    try {
      domain = new URL(story.url).hostname.replace('www.', '');
    } catch (e) {
      domain = 'unknown';
    }
  }

  let output = `\n### ${index}. ${story.title}\n\n`;

  // Main info in Chinese
  output += `📊 **评分：** ${story.score || 0} 分 | `;
  output += `💬 **评论数：** ${story.descendants || 0} | `;
  output += `👤 **作者：** ${story.by || 'unknown'}\n`;
  output += `📅 **日期：** ${date}\n\n`;

  if (story.categories && story.categories.length > 0) {
    output += `🏷️ **分类：** ${story.categories.join(', ')}\n\n`;
  }

  // Links section
  if (story.url) {
    output += `🔗 **原文链接：** ${story.url}\n`;
    output += `🌐 **来源：** ${domain}\n`;
  }

  output += `💭 **HN 讨论：** https://news.ycombinator.com/item?id=${story.id}\n`;

  if (story.text) {
    const text = decodeHTML(story.text);
    const preview = text.length > 200 ? text.substring(0, 200) + '...' : text;
    output += `\n📝 **内容预览：** ${preview}\n`;
  }

  return output;
}

/**
 * Format multiple stories (Chinese output)
 */
function formatStoryList(stories, type, filters) {
  // Type name mapping to Chinese
  const typeNames = {
    'top': '热门',
    'new': '最新',
    'best': '最佳',
    'ask': 'Ask HN',
    'show': 'Show HN',
    'job': '招聘'
  };

  const typeName = typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1);

  let output = `# Hacker News - ${typeName}故事\n\n`;
  output += `📊 **故事总数：** ${stories.length}\n`;
  output += `⏰ **获取时间：** ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n`;

  if (filters && filters.length > 0) {
    output += `🔍 **关键词过滤：** ${filters.join(', ')}\n`;
  }

  output += '\n---\n';

  stories.forEach((story, index) => {
    output += formatStoryItem(story, index + 1);
    output += '\n---\n';
  });

  return output;
}

/**
 * Filter stories by keywords
 */
function filterStories(stories, keywords) {
  if (!keywords || keywords.length === 0) {
    return stories;
  }

  const lowerKeywords = keywords.map(k => k.toLowerCase());

  return stories.filter(story => {
    const searchText = [
      story.title || '',
      story.text || '',
      story.url || '',
      story.by || ''
    ].join(' ').toLowerCase();

    return lowerKeywords.some(keyword => searchText.includes(keyword));
  });
}

/**
 * Categorize story by domain/content
 */
function categorizeStory(story) {
  const title = (story.title || '').toLowerCase();
  const text = (story.text || '').toLowerCase();
  const url = story.url || '';

  const categories = [];

  // Tech categories
  if (/(ai|artificial intelligence|machine learning|ml|gpt|llm|neural|deep learning)/i.test(title + text)) {
    categories.push('AI/ML');
  }
  if (/(python|javascript|rust|go|java|typescript|c\+\+|ruby)/i.test(title + text)) {
    categories.push('Programming');
  }
  if (/(web|frontend|backend|api|react|vue|angular)/i.test(title + text)) {
    categories.push('Web Dev');
  }
  if (/(database|sql|postgres|mongodb|redis)/i.test(title + text)) {
    categories.push('Database');
  }
  if (/(security|vulnerability|breach|exploit|crypto)/i.test(title + text)) {
    categories.push('Security');
  }
  if (/(startup|founder|vc|funding|acquisition)/i.test(title + text)) {
    categories.push('Startup');
  }
  if (/(devops|docker|kubernetes|k8s|aws|cloud)/i.test(title + text)) {
    categories.push('DevOps/Cloud');
  }

  // Content type
  if (title.startsWith('ask hn')) categories.push('Ask HN');
  if (title.startsWith('show hn')) categories.push('Show HN');
  if (title.includes('hiring') || title.includes('job')) categories.push('Jobs');

  return categories.length > 0 ? categories : ['General'];
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const config = {
    mode: 'single',  // single, list
    storyType: null,
    hnId: null,
    limit: 10,
    filters: [],
    categories: [],
    outputFile: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--top' || arg === '--new' || arg === '--best' ||
        arg === '--ask' || arg === '--show' || arg === '--job') {
      config.mode = 'list';
      config.storyType = arg.substring(2);  // Remove --

      // Check if next arg is a number (limit)
      if (args[i + 1] && !args[i + 1].startsWith('--') && !isNaN(args[i + 1])) {
        config.limit = parseInt(args[i + 1]);
        i++;
      }
    } else if (arg === '--filter' || arg === '-f') {
      // Collect all filter keywords
      i++;
      while (i < args.length && !args[i].startsWith('--')) {
        config.filters.push(args[i]);
        i++;
      }
      i--;
    } else if (arg === '--category' || arg === '-c') {
      // Filter by category
      i++;
      while (i < args.length && !args[i].startsWith('--')) {
        config.categories.push(args[i].toLowerCase());
        i++;
      }
      i--;
    } else if (arg === '--output' || arg === '-o') {
      config.outputFile = args[i + 1];
      i++;
    } else if (!arg.startsWith('--') && !config.hnId) {
      // First non-flag argument is the HN ID
      config.hnId = arg;
    }
  }

  return config;
}

/**
 * Print usage information
 */
function printUsage() {
  console.error(`
Hacker News Content Fetcher

Usage:
  # Fetch a single post with all comments
  node fetch_hn.js <HN_ID> [--output file]

  # Fetch top/new/best stories
  node fetch_hn.js --top [limit] [--filter keyword...] [--category cat...]
  node fetch_hn.js --new [limit] [--filter keyword...] [--category cat...]
  node fetch_hn.js --best [limit] [--filter keyword...] [--category cat...]
  node fetch_hn.js --ask [limit] [--filter keyword...]
  node fetch_hn.js --show [limit] [--filter keyword...]
  node fetch_hn.js --job [limit] [--filter keyword...]

Options:
  --top, --new, --best, --ask, --show, --job
                        Fetch stories by type
  [limit]              Number of stories to fetch (default: 10)
  --filter, -f         Filter by keywords (space-separated)
  --category, -c       Filter by categories: ai/ml, programming, web, database,
                       security, startup, devops, general
  --output, -o         Output file path

Examples:
  # Get single post
  node fetch_hn.js 38471822

  # Get top 10 stories
  node fetch_hn.js --top 10

  # Get top 20 AI-related stories
  node fetch_hn.js --top 20 --filter ai machine learning gpt

  # Get Show HN posts about rust
  node fetch_hn.js --show 15 --filter rust

  # Get stories in AI/ML category
  node fetch_hn.js --top 20 --category ai/ml
`);
}

/**
 * Fetch and process single post
 */
async function fetchSinglePost(hnId, outputFile) {
  console.error(`Fetching HN post ${hnId}...`);
  const post = await fetchItem(hnId);

  if (!post) {
    console.error(`Post ${hnId} not found`);
    process.exit(1);
  }

  console.error(`Fetching comments (${post.descendants || 0} total)...`);
  const comments = await fetchComments(post.kids || []);

  console.error('Formatting output...');
  const output = formatPost(post, comments);

  return output;
}

/**
 * Fetch and process story list
 */
async function fetchStoryList(config) {
  console.error(`Fetching ${config.storyType} stories...`);

  // Fetch story IDs
  const storyIds = await fetchStoryIds(config.storyType);
  console.error(`Found ${storyIds.length} story IDs`);

  // Fetch story details (limited by config.limit but fetch more for filtering)
  const fetchLimit = Math.min(config.filters.length > 0 || config.categories.length > 0 ? config.limit * 3 : config.limit, storyIds.length);
  console.error(`Fetching details for ${fetchLimit} stories...`);

  const stories = [];
  for (let i = 0; i < fetchLimit; i++) {
    try {
      const story = await fetchItem(storyIds[i]);
      if (story && !story.deleted && !story.dead) {
        stories.push(story);
      }

      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.error(`  Fetched ${i + 1}/${fetchLimit} stories...`);
      }
    } catch (e) {
      console.error(`Error fetching story ${storyIds[i]}:`, e.message);
    }
  }

  console.error(`Successfully fetched ${stories.length} stories`);

  // Apply filters
  let filteredStories = stories;

  if (config.filters.length > 0) {
    console.error(`Applying keyword filters: ${config.filters.join(', ')}`);
    filteredStories = filterStories(filteredStories, config.filters);
    console.error(`After filtering: ${filteredStories.length} stories`);
  }

  if (config.categories.length > 0) {
    console.error(`Applying category filters: ${config.categories.join(', ')}`);
    filteredStories = filteredStories.filter(story => {
      const storyCategories = categorizeStory(story).map(c => c.toLowerCase());
      return config.categories.some(cat =>
        storyCategories.some(sc => sc.includes(cat) || cat.includes(sc))
      );
    });
    console.error(`After category filtering: ${filteredStories.length} stories`);
  }

  // Limit final results
  filteredStories = filteredStories.slice(0, config.limit);

  // Add categories to each story for display
  filteredStories.forEach(story => {
    story.categories = categorizeStory(story);
  });

  console.error('Formatting output...');
  const output = formatStoryList(filteredStories, config.storyType, config.filters);

  return output;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const config = parseArgs(args);

  try {
    let output;
    let outputFile;

    if (config.mode === 'single') {
      // Single post mode
      if (!config.hnId) {
        console.error('Error: HN_ID is required for single post mode');
        printUsage();
        process.exit(1);
      }

      // 使用时间戳确保每次都是新文件，避免读取旧缓存
      const timestamp = Date.now();
      outputFile = config.outputFile || `/tmp/hn_${config.hnId}_${timestamp}.txt`;
      output = await fetchSinglePost(config.hnId, outputFile);

    } else if (config.mode === 'list') {
      // List mode
      const timestamp = Date.now();
      const safeName = `${config.storyType}_${config.limit}`;
      outputFile = config.outputFile || `/tmp/hn_${safeName}_${timestamp}.txt`;
      output = await fetchStoryList(config);

    } else {
      console.error('Error: Invalid mode');
      printUsage();
      process.exit(1);
    }

    // Write to file
    fs.writeFileSync(outputFile, output, 'utf-8');
    console.error(`Content saved to: ${outputFile}`);

    // Output the file path to stdout for the skill to capture
    console.log(outputFile);

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
