#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

function showUsage() {
    console.log('Usage: node scripts/new-version.js <version>');
    console.log('');
    console.log('Creates a new version by updating package.json, committing, and tagging.');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/new-version.js 1.2.0');
    console.log('  node scripts/new-version.js 2.0.0-beta.1');
}

function main() {
    // Parse command line arguments
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
        showUsage();
        process.exit(args.length === 0 ? 1 : 0);
    }

    if (args.length !== 1) {
        console.error('Error: Exactly one version argument required');
        showUsage();
        process.exit(1);
    }

    const newVersion = args[0];
    const tagName = `v${newVersion}`;

    console.log(`🏷️  Creating new version: ${newVersion}`);

    try {
        // Check if tag already exists
        try {
            const existingTags = execSync('git tag -l', { encoding: 'utf8' });
            if (existingTags.split('\n').includes(tagName)) {
                console.error(`❌ Error: Tag '${tagName}' already exists`);
                process.exit(1);
            }
        } catch (error) {
            console.error('❌ Error: Failed to check existing tags');
            process.exit(1);
        }

        // Check if working directory is clean
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            if (status.trim()) {
                console.error('❌ Error: Working directory has uncommitted changes');
                console.error('Please commit or stash your changes first');
                process.exit(1);
            }
        } catch (error) {
            console.error('❌ Error: Failed to check git status');
            process.exit(1);
        }

        // Read and update package.json
        const packagePath = './package.json';
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const oldVersion = pkg.version;

        pkg.version = newVersion;
        fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
        console.log(`📦 Updated package.json: ${oldVersion} → ${newVersion}`);

        // Commit the package.json change
        execSync('git add package.json', { stdio: 'inherit' });
        execSync(`git commit -m "Bump version to ${newVersion}"`, { stdio: 'inherit' });
        console.log(`✅ Committed version change`);

        // Tag the commit
        execSync(`git tag ${tagName}`, { stdio: 'inherit' });
        console.log(`🏷️  Created tag: ${tagName}`);

        console.log('');
        console.log('🎉 Version created successfully!');
        console.log('');
        console.log('Next steps:');
        console.log(`  git push origin main --tags  # Push the commit and tag`);

    } catch (error) {
        console.error('❌ Error during version creation:', error.message);
        process.exit(1);
    }
}

main();