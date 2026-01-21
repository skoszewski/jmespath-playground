#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read package.json for base version
const packagePath = './package.json';
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

let version = pkg.version;
let isRelease = false;

try {
  // Check if current commit is tagged
  const gitTag = execSync('git tag --points-at HEAD', { encoding: 'utf8' }).trim();

  if (gitTag) {
    // We're at a tagged commit - use clean version
    console.log(`✅ Building release version ${version} (tagged: ${gitTag})`);
    isRelease = true;
  } else {
    // We're not at a tagged commit - add -dev suffix
    version = `${version}-dev`;
    console.log(`📦 Building development version ${version}`);
    isRelease = false;
  }
} catch (error) {
  // Git command failed (maybe not in a git repo)
  version = `${version}-dev`;
  console.log(`⚠️  Cannot determine git status, using development version ${version}`);
  isRelease = false;
}

// Generate version.js file
const versionFile = path.join('./src', 'version.js');
const versionContent = `// Auto-generated version file - do not edit manually
// Generated at: ${new Date().toISOString()}

export const VERSION = '${version}';
export const IS_RELEASE = ${isRelease};
export const BUILD_TIME = '${new Date().toISOString()}';
`;

fs.writeFileSync(versionFile, versionContent);
console.log(`📝 Generated ${versionFile} with version ${version}`);