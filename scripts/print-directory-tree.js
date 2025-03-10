#!/usr/bin/env node

/**
 * Script to generate and log a formatted directory tree
 */

const fs = require('fs');
const path = require('path');

// Configuration
const IGNORE_DIRS = [
  'node_modules',
  '.git',
  '.next',
  '.vercel',
  'coverage',
  'dist',
  '.turbo',
];

const IGNORE_FILES = [
  'package-lock.json',
  '.DS_Store',
  'tsconfig.tsbuildinfo',
];

// ANSI color codes for prettier output
const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  DIM: '\x1b[2m',
  BLUE: '\x1b[34m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m',
  MAGENTA: '\x1b[35m',
};

/**
 * Generate a directory tree
 * @param {string} dir - Directory to start from
 * @param {number} depth - Current depth
 * @param {string[]} lastAtDepth - Array tracking if we're at the last item at each depth
 * @returns {string} - Formatted directory tree
 */
function generateTree(dir, depth = 0, lastAtDepth = []) {
  let output = '';
  
  // Get all files and directories
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  // Filter out ignored items
  const filteredItems = items.filter(item => {
    if (item.isDirectory() && IGNORE_DIRS.includes(item.name)) return false;
    if (!item.isDirectory() && IGNORE_FILES.includes(item.name)) return false;
    return true;
  });
  
  // Process each item
  filteredItems.forEach((item, index) => {
    const isLast = index === filteredItems.length - 1;
    
    // Create the prefix based on depth and whether this is the last item
    let prefix = '';
    for (let i = 0; i < depth; i++) {
      prefix += lastAtDepth[i] ? '    ' : '│   ';
    }
    prefix += isLast ? '└── ' : '├── ';
    
    // Format the item name based on type
    let itemName = item.name;
    if (item.isDirectory()) {
      itemName = `${COLORS.BRIGHT}${COLORS.BLUE}${itemName}/${COLORS.RESET}`;
    } else {
      // Color code by file extension
      const ext = path.extname(itemName).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        itemName = `${COLORS.YELLOW}${itemName}${COLORS.RESET}`;
      } else if (['.json', '.prisma', '.md'].includes(ext)) {
        itemName = `${COLORS.CYAN}${itemName}${COLORS.RESET}`;
      } else if (['.css', '.scss', '.sass'].includes(ext)) {
        itemName = `${COLORS.MAGENTA}${itemName}${COLORS.RESET}`;
      } else if (['.svg', '.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
        itemName = `${COLORS.GREEN}${itemName}${COLORS.RESET}`;
      }
    }
    
    // Add this item to the output
    output += `${prefix}${itemName}\n`;
    
    // If it's a directory, recursively process its contents
    if (item.isDirectory()) {
      const newLastAtDepth = [...lastAtDepth, isLast];
      const fullPath = path.join(dir, item.name);
      output += generateTree(fullPath, depth + 1, newLastAtDepth);
    }
  });
  
  return output;
}

// Main function
function main() {
  const rootDir = process.cwd();
  console.log(`\n${COLORS.BRIGHT}Project Directory Tree for: ${COLORS.BLUE}${rootDir}${COLORS.RESET}\n`);
  
  const tree = generateTree(rootDir);
  console.log(tree);
  
  console.log(`\n${COLORS.DIM}Note: Some directories and files are excluded for clarity${COLORS.RESET}\n`);
}

// Run the script
main(); 