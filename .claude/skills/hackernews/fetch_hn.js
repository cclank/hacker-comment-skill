#!/usr/bin/env node

/**
 * Hacker News Content Fetcher
 * Fetches a HN post and all its comments recursively
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';

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
 * Format the entire post with comments
 */
function formatPost(post, comments) {
  let output = '# Hacker News Post\n\n';
  output += `## ${post.title}\n\n`;
  output += `**Author:** ${post.by || 'unknown'}\n`;
  output += `**Score:** ${post.score || 0} points\n`;
  output += `**Time:** ${new Date(post.time * 1000).toISOString()}\n`;
  output += `**URL:** https://news.ycombinator.com/item?id=${post.id}\n\n`;

  if (post.url) {
    output += `**Link:** ${post.url}\n\n`;
  }

  if (post.text) {
    output += `## Post Content\n\n`;
    output += decodeHTML(post.text) + '\n\n';
  }

  output += `## Comments (${post.descendants || 0} total)\n\n`;

  for (const comment of comments) {
    output += formatComment(comment);
    output += '\n---\n\n';
  }

  return output;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node fetch_hn.js <HN_ID> [output_file]');
    process.exit(1);
  }

  const hnId = args[0];
  const outputFile = args[1] || `/tmp/hn_${hnId}.txt`;

  try {
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

    // Write to file
    fs.writeFileSync(outputFile, output, 'utf-8');
    console.error(`Content saved to: ${outputFile}`);

    // Output the file path to stdout for the skill to capture
    console.log(outputFile);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
