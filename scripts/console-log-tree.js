#!/usr/bin/env node

/**
 * Script to generate a directory tree formatted for console.log
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
  '.husky',
  '.swc',
];

const IGNORE_FILES = [
  'package-lock.json',
  '.DS_Store',
  'tsconfig.tsbuildinfo',
];

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
    if (item.name.startsWith('.')) return false;
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
    
    // Format the item name
    let itemName = item.name;
    if (item.isDirectory()) {
      itemName = `${itemName}/`;
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
  const tree = generateTree(rootDir);
  
  // Format for console.log
  const consoleLogTree = `console.log(\`
Afino App Directory Structure:
${tree}\`)`;
  
  console.log(consoleLogTree);
}

// Run the script
main(); 