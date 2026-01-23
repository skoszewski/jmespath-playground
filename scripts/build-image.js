#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

function execCommand(command, description) {
    try {
        console.log(`${description}...`);
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Error: ${description} failed`);
        process.exit(1);
    }
}

function getContainerTool() {
    // Check for Docker first (primary tool)
    try {
        execSync('docker --version', { stdio: 'ignore' });
        return 'docker';
    } catch (error) {
        // Fall back to Apple's container command
        try {
            execSync('container --version', { stdio: 'ignore' });
            return 'container';
        } catch (error) {
            console.error('Error: No container tool found. Please install Docker or Apple Container Tools to build container images.');
            process.exit(1);
        }
    }
}

function getVersion() {
    try {
        // Try to get version from git tag
        const gitTag = execSync('git tag --points-at HEAD', { encoding: 'utf8' }).trim();
        if (gitTag) {
            return { version: gitTag.replace(/^v/, ''), isRelease: true };
        }
    } catch (error) {
        // Git command failed, ignore
    }

    // Development build - use package.json version with -dev suffix
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return { version: `${packageJson.version}-dev`, isRelease: false };
}

function main() {
    const containerTool = getContainerTool();
    const { version, isRelease } = getVersion();

    console.log(`Building ${isRelease ? 'release' : 'development'} version: ${version}`);

    // Build container image
    const tags = isRelease
        ? [
            `-t skoszewski/jmespath-playground:${version}`,
            `-t skoszewski/jmespath-playground:latest`
          ].join(' ')
        : [
            `-t skoszewski/jmespath-playground:dev`,
            `-t skoszewski/jmespath-playground:latest`
          ].join(' ');

    const buildCommand = `${containerTool} build --build-arg VERSION="${version}" --build-arg IS_RELEASE="${isRelease}" ${tags} .`;

    execCommand(buildCommand, 'Building container image');

    console.log('Container image build completed successfully!');

    // Show usage instructions
    if (isRelease) {
        console.log(`\nTo run the container:`);
        console.log(`  ${containerTool} run -p 3000:3000 skoszewski/jmespath-playground:${version}`);
        if (containerTool === 'docker') {
            console.log(`\nTo push to Docker Hub:`);
            console.log(`  docker push skoszewski/jmespath-playground:${version}`);
            console.log(`  docker push skoszewski/jmespath-playground:latest`);
        }
    } else {
        console.log(`\nTo run the container:`);
        console.log(`  ${containerTool} run -p 3000:3000 skoszewski/jmespath-playground:dev`);
    }
}

if (require.main === module) {
    main();
}