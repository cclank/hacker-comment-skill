#!/usr/bin/env node

/**
 * Hacker News Trending Posts Fetcher (Algolia API)
 *
 * Finds the most valuable and trending posts from Hacker News
 * Supports:
 * - Time range filtering (today, this week, custom)
 * - Topic/domain filtering (AI, programming, security, etc.)
 * - Sorting by points, comments, or relevance
 * - Smart scoring to find most valuable posts
 */

const https = require('https');
const fs = require('fs');

const ALGOLIA_API_BASE = 'http://hn.algolia.com/api/v1';

// Topic keywords for filtering
const TOPIC_KEYWORDS = {
  'ai': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'gpt', 'llm', 'neural', 'deep learning', 'openai', 'chatgpt', 'claude'],
  'programming': ['programming', 'code', 'developer', 'software', 'engineering', 'python', 'javascript', 'rust', 'go', 'java', 'typescript'],
  'web': ['web', 'frontend', 'backend', 'fullstack', 'react', 'vue', 'angular', 'nodejs', 'html', 'css'],
  'database': ['database', 'sql', 'postgres', 'mongodb', 'redis', 'mysql', 'nosql'],
  'security': ['security', 'vulnerability', 'breach', 'exploit', 'hack', 'cybersecurity', 'privacy', 'encryption'],
  'startup': ['startup', 'founder', 'vc', 'funding', 'acquisition', 'entrepreneur', 'business'],
  'devops': ['devops', 'docker', 'kubernetes', 'k8s', 'aws', 'cloud', 'infrastructure', 'deployment'],
  'blockchain': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3', 'defi', 'nft'],
  'hardware': ['hardware', 'cpu', 'gpu', 'chip', 'semiconductor', 'electronics'],
  'science': ['science', 'research', 'physics', 'biology', 'chemistry', 'math', 'mathematics'],
  'career': ['career', 'job', 'hiring', 'interview', 'resume', 'salary', 'remote work'],
  'design': ['design', 'ui', 'ux', 'interface', 'graphic', 'typography', 'figma']
};

/**
 * Fetch JSON from Algolia API
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'HN-Trending-Fetcher/1.0'
      }
    };

    const protocol = urlObj.protocol === 'https:' ? https : require('http');

    protocol.get(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Calculate timestamp for time ranges
 */
function getTimestamp(range) {
  const now = Date.now() / 1000; // Convert to Unix timestamp

  switch (range) {
    case 'today':
      return now - (24 * 60 * 60); // Last 24 hours
    case 'week':
      return now - (7 * 24 * 60 * 60); // Last 7 days
    case '3days':
      return now - (3 * 24 * 60 * 60); // Last 3 days
    case 'month':
      return now - (30 * 24 * 60 * 60); // Last 30 days
    default:
      return null;
  }
}

/**
 * Build Algolia API URL with filters
 */
function buildSearchURL(config) {
  const params = new URLSearchParams();

  // Query
  if (config.query) {
    params.append('query', config.query);
  }

  // Tags (story type)
  const tags = [];
  if (config.storyType) {
    tags.push(config.storyType); // story, ask_hn, show_hn, poll
  } else {
    tags.push('story'); // Default to stories
  }
  params.append('tags', tags.join(','));

  // Numeric filters
  const numericFilters = [];

  // Time range filter
  if (config.timeRange) {
    const timestamp = getTimestamp(config.timeRange);
    if (timestamp) {
      numericFilters.push(`created_at_i>${Math.floor(timestamp)}`);
    }
  }

  // Minimum points filter
  if (config.minPoints) {
    numericFilters.push(`points>=${config.minPoints}`);
  }

  // Minimum comments filter
  if (config.minComments) {
    numericFilters.push(`num_comments>=${config.minComments}`);
  }

  if (numericFilters.length > 0) {
    params.append('numericFilters', numericFilters.join(','));
  }

  // Results per page
  params.append('hitsPerPage', config.limit || 30);

  // Page number
  if (config.page) {
    params.append('page', config.page);
  }

  // Use search_by_date for chronological, or search for relevance
  const endpoint = config.sortBy === 'date' ? 'search_by_date' : 'search';

  return `${ALGOLIA_API_BASE}/${endpoint}?${params.toString()}`;
}

/**
 * Calculate value score for a post
 * Higher score = more valuable
 */
function calculateValueScore(post) {
  const points = post.points || 0;
  const comments = post.num_comments || 0;
  const ageHours = (Date.now() / 1000 - post.created_at_i) / 3600;

  // Adjust for age - newer posts get bonus
  const ageFactor = Math.max(0.5, 1 - (ageHours / 168)); // Decay over 7 days

  // Engagement ratio (comments per point)
  const engagementRatio = points > 0 ? comments / points : 0;

  // Value score formula
  // - Base: points * 1.0
  // - Engagement bonus: comments * 0.5
  // - Discussion quality: engagement ratio * 10
  // - Age factor: multiply by age factor
  const baseScore = (points * 1.0) + (comments * 0.5) + (engagementRatio * 10);

  return Math.round(baseScore * ageFactor);
}

/**
 * Check if post matches topic
 */
function matchesTopic(post, topics) {
  if (!topics || topics.length === 0) return true;

  const searchText = [
    post.title || '',
    post.story_text || '',
    post.url || '',
    post.author || ''
  ].join(' ').toLowerCase();

  for (const topic of topics) {
    const keywords = TOPIC_KEYWORDS[topic.toLowerCase()] || [topic.toLowerCase()];
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return true;
    }
  }

  return false;
}

/**
 * Categorize post
 */
function categorizePost(post) {
  const searchText = [
    post.title || '',
    post.story_text || ''
  ].join(' ').toLowerCase();

  const categories = [];

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      categories.push(topic);
    }
  }

  // Check tags
  if (post._tags) {
    if (post._tags.includes('ask_hn')) categories.push('Ask HN');
    if (post._tags.includes('show_hn')) categories.push('Show HN');
    if (post._tags.includes('poll')) categories.push('Poll');
  }

  return categories.length > 0 ? categories : ['general'];
}

/**
 * Format a single post
 */
function formatPost(post, index, showValueScore = false) {
  const date = new Date(post.created_at_i * 1000);
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toISOString().split('T')[1].split('.')[0];

  let domain = 'news.ycombinator.com';
  if (post.url) {
    try {
      domain = new URL(post.url).hostname.replace('www.', '');
    } catch (e) {
      domain = 'self';
    }
  }

  const categories = categorizePost(post);
  const valueScore = showValueScore ? calculateValueScore(post) : 0;

  let output = `\n### ${index}. ${post.title}\n\n`;

  if (showValueScore) {
    output += `**💎 Value Score:** ${valueScore} | `;
  }

  output += `**⬆️ Points:** ${post.points || 0} | `;
  output += `**💬 Comments:** ${post.num_comments || 0} | `;
  output += `**📅 Date:** ${dateStr} ${timeStr}\n\n`;

  output += `**👤 Author:** ${post.author || 'unknown'} | `;
  output += `**🏷️ Categories:** ${categories.join(', ')}\n\n`;

  if (post.url) {
    output += `**🔗 Link:** ${post.url}\n`;
    output += `**📦 Domain:** ${domain}\n`;
  }

  output += `**🗨️ HN Discussion:** https://news.ycombinator.com/item?id=${post.objectID}\n`;
  output += `**🆔 Post ID:** ${post.objectID}\n`;

  if (post.story_text) {
    const text = decodeHTML(post.story_text);
    const preview = text.length > 300 ? text.substring(0, 300) + '...' : text;
    output += `\n**📝 Preview:**\n${preview}\n`;
  }

  return output;
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
 * Format the results
 */
function formatResults(posts, config) {
  let output = '# 🔥 Hacker News Trending Posts\n\n';

  // Header info
  output += `**📊 Total Results:** ${posts.length}\n`;
  output += `**🕐 Fetched at:** ${new Date().toISOString()}\n`;

  if (config.timeRange) {
    const rangeNames = {
      'today': 'Last 24 Hours',
      '3days': 'Last 3 Days',
      'week': 'Last 7 Days',
      'month': 'Last 30 Days'
    };
    output += `**⏰ Time Range:** ${rangeNames[config.timeRange] || config.timeRange}\n`;
  }

  if (config.topics && config.topics.length > 0) {
    output += `**🏷️ Topics:** ${config.topics.join(', ')}\n`;
  }

  if (config.minPoints) {
    output += `**⬆️ Min Points:** ${config.minPoints}\n`;
  }

  if (config.minComments) {
    output += `**💬 Min Comments:** ${config.minComments}\n`;
  }

  output += `**🔍 Sort By:** ${config.sortBy === 'date' ? 'Most Recent' : config.sortBy === 'value' ? 'Value Score' : 'Relevance'}\n`;

  output += '\n---\n';

  // Posts
  posts.forEach((post, index) => {
    output += formatPost(post, index + 1, config.sortBy === 'value');
    output += '\n---\n';
  });

  // Summary statistics
  if (posts.length > 0) {
    const avgPoints = Math.round(posts.reduce((sum, p) => sum + (p.points || 0), 0) / posts.length);
    const avgComments = Math.round(posts.reduce((sum, p) => sum + (p.num_comments || 0), 0) / posts.length);
    const topDomains = {};

    posts.forEach(post => {
      if (post.url) {
        try {
          const domain = new URL(post.url).hostname.replace('www.', '');
          topDomains[domain] = (topDomains[domain] || 0) + 1;
        } catch (e) {}
      }
    });

    const sortedDomains = Object.entries(topDomains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    output += '\n## 📈 Summary Statistics\n\n';
    output += `**Average Points:** ${avgPoints}\n`;
    output += `**Average Comments:** ${avgComments}\n`;

    if (sortedDomains.length > 0) {
      output += `\n**Top Domains:**\n`;
      sortedDomains.forEach(([domain, count]) => {
        output += `- ${domain}: ${count} posts\n`;
      });
    }
  }

  return output;
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const config = {
    timeRange: 'today',      // today, 3days, week, month
    topics: [],              // Filter by topics
    minPoints: 10,           // Minimum points
    minComments: 0,          // Minimum comments
    limit: 30,               // Number of results
    sortBy: 'value',         // value, date, relevance
    storyType: 'story',      // story, ask_hn, show_hn
    query: '',               // Search query
    outputFile: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--today') {
      config.timeRange = 'today';
    } else if (arg === '--week') {
      config.timeRange = 'week';
    } else if (arg === '--3days') {
      config.timeRange = '3days';
    } else if (arg === '--month') {
      config.timeRange = 'month';
    } else if (arg === '--topic' || arg === '-t') {
      i++;
      while (i < args.length && !args[i].startsWith('--')) {
        config.topics.push(args[i].toLowerCase());
        i++;
      }
      i--;
    } else if (arg === '--min-points') {
      config.minPoints = parseInt(args[i + 1]) || 10;
      i++;
    } else if (arg === '--min-comments') {
      config.minComments = parseInt(args[i + 1]) || 0;
      i++;
    } else if (arg === '--limit' || arg === '-n') {
      config.limit = parseInt(args[i + 1]) || 30;
      i++;
    } else if (arg === '--sort') {
      config.sortBy = args[i + 1] || 'value'; // value, date, relevance
      i++;
    } else if (arg === '--ask') {
      config.storyType = 'ask_hn';
    } else if (arg === '--show') {
      config.storyType = 'show_hn';
    } else if (arg === '--query' || arg === '-q') {
      config.query = args[i + 1] || '';
      i++;
    } else if (arg === '--output' || arg === '-o') {
      config.outputFile = args[i + 1];
      i++;
    }
  }

  return config;
}

/**
 * Print usage
 */
function printUsage() {
  console.error(`
🔥 Hacker News Trending Posts Fetcher

Usage: node fetch_hn_trending.js [options]

Time Range Options:
  --today              Posts from last 24 hours (default)
  --3days              Posts from last 3 days
  --week               Posts from last 7 days
  --month              Posts from last 30 days

Filter Options:
  --topic, -t <topics>     Filter by topics (space-separated)
                           Available: ai, programming, web, database, security,
                           startup, devops, blockchain, hardware, science,
                           career, design
  --min-points <n>         Minimum points (default: 10)
  --min-comments <n>       Minimum comments (default: 0)
  --query, -q <text>       Search query

Type Options:
  --ask                Ask HN posts
  --show               Show HN posts
  (default: regular stories)

Output Options:
  --limit, -n <n>      Number of results (default: 30)
  --sort <type>        Sort by: value, date, relevance (default: value)
  --output, -o <file>  Output file path

Examples:
  # Today's most valuable posts
  node fetch_hn_trending.js --today --limit 20

  # This week's AI posts
  node fetch_hn_trending.js --week --topic ai ml --min-points 50

  # Show HN projects from last 3 days
  node fetch_hn_trending.js --3days --show --limit 15

  # Security discussions with high engagement
  node fetch_hn_trending.js --week --topic security --min-comments 20

  # Search for specific topic
  node fetch_hn_trending.js --today --query "rust programming" --limit 10

  # Multiple topics
  node fetch_hn_trending.js --week --topic ai security blockchain --limit 25
`);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const config = parseArgs(args);

  try {
    console.error('🔍 Fetching trending posts from Algolia API...\n');
    console.error(`⏰ Time Range: ${config.timeRange}`);
    if (config.topics.length > 0) {
      console.error(`🏷️  Topics: ${config.topics.join(', ')}`);
    }
    console.error(`📊 Fetching up to ${config.limit} posts...\n`);

    // Build and fetch from API
    const url = buildSearchURL(config);
    console.error(`🌐 API URL: ${url}\n`);

    const response = await fetchJSON(url);

    if (!response.hits || response.hits.length === 0) {
      console.error('❌ No posts found matching criteria');
      process.exit(0);
    }

    console.error(`✅ Found ${response.hits.length} posts\n`);

    // Filter by topics if specified
    let posts = response.hits;
    if (config.topics.length > 0) {
      const beforeFilter = posts.length;
      posts = posts.filter(post => matchesTopic(post, config.topics));
      console.error(`🔍 After topic filtering: ${posts.length}/${beforeFilter} posts\n`);
    }

    // Sort posts
    if (config.sortBy === 'value') {
      console.error('💎 Calculating value scores...\n');
      posts.forEach(post => {
        post._valueScore = calculateValueScore(post);
      });
      posts.sort((a, b) => b._valueScore - a._valueScore);
    } else if (config.sortBy === 'date') {
      posts.sort((a, b) => b.created_at_i - a.created_at_i);
    }
    // relevance is default order from API

    // Limit results
    posts = posts.slice(0, config.limit);

    // Format output
    console.error('📝 Formatting results...\n');
    const output = formatResults(posts, config);

    // Write to file
    const timestamp = new Date().toISOString().split('T')[0];
    const topicStr = config.topics.length > 0 ? '_' + config.topics.join('-') : '';
    const outputFile = config.outputFile || `/tmp/hn_trending_${config.timeRange}${topicStr}_${timestamp}.txt`;

    fs.writeFileSync(outputFile, output, 'utf-8');
    console.error(`✅ Content saved to: ${outputFile}\n`);

    // Output file path to stdout for skill to capture
    console.log(outputFile);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
