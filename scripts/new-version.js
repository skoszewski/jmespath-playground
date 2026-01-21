#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

function showUsage() {
    console.log('Usage: node scripts/new-version.js <version> [--force] [-m|--message "commit message"]');
    console.log('       node scripts/new-version.js --check <version>');
    console.log('');
    console.log('Creates a new version by tagging the current commit.');
    console.log('');
    console.log('Options:');
    console.log('  --force              Force version creation even with dirty repo or package.json mismatch');
    console.log('  --check              Analyze repository status and report what would happen for specified version');
    console.log('  -m, --message TEXT   Custom commit message (only used when commit is needed)');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/new-version.js 1.2.0');
    console.log('  node scripts/new-version.js 1.2.0 --force');
    console.log('  node scripts/new-version.js 1.2.0 -m "Add new feature XYZ"');
    console.log('  node scripts/new-version.js --check 1.3.0');
}

function performCheck(targetVersion) {
    console.log('🔍 Repository Analysis Report');
    console.log('============================');

    try {
        // Read package.json
        const packagePath = './package.json';
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const currentVersion = pkg.version;

        console.log(`📦 Package.json version: ${currentVersion}`);

        // Check repository status
        let isRepoDirty = false;
        let dirtyFiles = '';
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            isRepoDirty = status.trim() !== '';
            dirtyFiles = status.trim();
        } catch (error) {
            console.log('⚠️  Cannot determine git status');
        }

        if (isRepoDirty) {
            console.log('🔄 Repository status: DIRTY');
            console.log('   Uncommitted changes:');
            dirtyFiles.split('\n').forEach(line => {
                if (line.trim()) console.log(`   ${line}`);
            });
        } else {
            console.log('✅ Repository status: CLEAN');
        }

        // Check current commit info
        try {
            const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
            const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
            console.log(`🌟 Current commit: ${currentCommit.substring(0, 7)} (${currentBranch})`);

            // Check if current commit is tagged
            const tagsOnHead = execSync('git tag --points-at HEAD', { encoding: 'utf8' }).trim();
            if (tagsOnHead) {
                console.log(`🏷️  Current commit tags: ${tagsOnHead.split('\n').join(', ')}`);
            } else {
                console.log('🏷️  Current commit: No tags');
            }
        } catch (error) {
            console.log('⚠️  Cannot determine commit info');
        }

        // List recent tags
        try {
            const recentTags = execSync('git tag --sort=-version:refname | head -5', { encoding: 'utf8' }).trim();
            if (recentTags) {
                console.log('📋 Recent tags:');
                recentTags.split('\n').forEach(tag => {
                    if (tag.trim()) console.log(`   ${tag}`);
                });
            } else {
                console.log('📋 No tags found in repository');
            }
        } catch (error) {
            console.log('⚠️  Cannot list tags');
        }

        console.log('');

        // Analysis for target version (if provided)
        if (targetVersion) {
            const tagName = `v${targetVersion}`;
            console.log(`🎯 Analysis for version ${targetVersion}:`);
            console.log('=====================================');

            // Check if target tag exists
            try {
                const existingTags = execSync('git tag -l', { encoding: 'utf8' });
                const tagExists = existingTags.split('\n').includes(tagName);

                if (tagExists) {
                    console.log(`❌ Tag '${tagName}' already exists - CANNOT CREATE`);
                    return;
                }
                console.log(`✅ Tag '${tagName}' available`);
            } catch (error) {
                console.log('⚠️  Cannot check tag availability');
                return;
            }

            // Analyze what actions would be needed
            const packageJsonMatches = currentVersion === targetVersion;
            const needsPackageUpdate = !packageJsonMatches;
            const needsCommit = isRepoDirty || needsPackageUpdate;

            console.log(`📝 Package.json: ${packageJsonMatches ? 'MATCHES' : `NEEDS UPDATE (${currentVersion} → ${targetVersion})`}`);

            if (needsCommit) {
                console.log('⚡ Actions needed:');
                if (needsPackageUpdate) {
                    console.log('   • Update package.json');
                }
                if (isRepoDirty) {
                    console.log('   • Stage uncommitted changes');
                }
                console.log('   • Create commit');
                console.log(`   • Create tag ${tagName}`);
                console.log('');
                console.log('📋 Commands that would work:');
                if (isRepoDirty || needsPackageUpdate) {
                    console.log(`   node scripts/new-version.js ${targetVersion} --force`);
                } else {
                    console.log(`   node scripts/new-version.js ${targetVersion}`);
                    console.log(`   node scripts/new-version.js ${targetVersion} --force`);
                }
            } else {
                console.log('⚡ Actions needed:');
                console.log(`   • Create tag ${tagName} (no commit needed)`);
                console.log('');
                console.log('📋 Commands that would work:');
                console.log(`   node scripts/new-version.js ${targetVersion}`);
                console.log(`   node scripts/new-version.js ${targetVersion} --force`);
            }

            console.log('');
            console.log('🚦 Default mode requirements:');
            if (isRepoDirty) {
                console.log('   ❌ Repository must be clean (currently dirty)');
            } else {
                console.log('   ✅ Repository is clean');
            }
            if (!packageJsonMatches) {
                console.log(`   ❌ Package.json must match version (currently ${currentVersion})`);
            } else {
                console.log('   ✅ Package.json version matches');
            }

        } else {
            // This should never happen since version is now required
            console.error('Internal error: No version provided to performCheck');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Error during analysis:', error.message);
        process.exit(1);
    }
}

function main() {
    // Parse command line arguments
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
        showUsage();
        process.exit(args.length === 0 ? 1 : 0);
    }

    const isCheck = args.includes('--check');
    const isForce = args.includes('--force');

    // Parse custom commit message
    let customMessage = null;
    const messageIndex = args.findIndex(arg => arg === '-m' || arg === '--message');
    if (messageIndex !== -1 && messageIndex + 1 < args.length) {
        customMessage = args[messageIndex + 1];
    }
    
    let newVersion;
    if (isCheck) {
        // For --check, version is required
        newVersion = args.find(arg => !arg.startsWith('--') && arg !== '-m' && arg !== customMessage);
        if (!newVersion) {
            console.error('Error: Version argument required for --check');
            showUsage();
            process.exit(1);
        }
    } else {
        // For normal operation, version is required
        newVersion = args.find(arg => !arg.startsWith('--') && arg !== '-m' && arg !== customMessage);
        if (!newVersion) {
        }
    }

    if (isCheck) {
        performCheck(newVersion);
        return;
    }

    const tagName = `v${newVersion}`;

    console.log(`🏷️  Creating new version: ${newVersion}${isForce ? ' (forced)' : ''}`);

    try {
        // 1. Check if tag already exists - Always ERROR
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

        // 2. Check repository status
        let isRepoDirty = false;
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            isRepoDirty = status.trim() !== '';
        } catch (error) {
            console.error('❌ Error: Failed to check git status');
            process.exit(1);
        }

        // 3. Check package.json version
        const packagePath = './package.json';
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const currentVersion = pkg.version;
        const packageJsonMatches = currentVersion === newVersion;

        // 4. Determine what action is needed
        const needsPackageUpdate = !packageJsonMatches;
        const needsCommit = isRepoDirty || needsPackageUpdate;

        // 5. Check if force is required
        if (!isForce) {
            if (isRepoDirty) {
                console.error('❌ Error: Working directory has uncommitted changes');
                console.error('Please commit your changes first or use --force');
                process.exit(1);
            }
            if (needsPackageUpdate) {
                console.error(`❌ Error: Package.json version is ${currentVersion}, requested ${newVersion}`);
                console.error('Use --force to update package.json');
                process.exit(1);
            }
        }

        // 6. Execute the versioning
        if (needsCommit) {
            console.log(`📦 Needs commit: ${needsPackageUpdate ? 'package.json update' : ''}${needsPackageUpdate && isRepoDirty ? ' + ' : ''}${isRepoDirty ? 'uncommitted changes' : ''}`);

            // Update package.json if needed
            if (needsPackageUpdate) {
                pkg.version = newVersion;
                fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
                console.log(`📝 Updated package.json: ${currentVersion} → ${newVersion}`);
            }

            // Stage all changes
            execSync('git add .', { stdio: 'inherit' });

            // Commit
            const commitMessage = customMessage || (needsPackageUpdate ? `Version ${newVersion}` : `Prepare for version ${newVersion}`);
            execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
            console.log(`✅ Committed changes`);
        } else {
            console.log(`✅ Repository clean, package.json matches - tagging current commit`);
        }

        // 7. Tag the commit
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