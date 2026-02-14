#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const BUILDS_PATH = path.join(ROOT_DIR, 'BUILDS.txt');
const DEVLOG_PATH = path.join(ROOT_DIR, 'DEVLOG.md');
const ROOT_PACKAGE_PATH = path.join(ROOT_DIR, 'package.json');
const ROOT_LOCK_PATH = path.join(ROOT_DIR, 'package-lock.json');
const FRONTEND_PACKAGE_PATH = path.join(ROOT_DIR, 'frontend', 'package.json');
const FRONTEND_LOCK_PATH = path.join(ROOT_DIR, 'frontend', 'package-lock.json');

function runGit(args) {
  return execSync(`git ${args}`, { cwd: ROOT_DIR, encoding: 'utf-8' }).trim();
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf-8');
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function writeJson(filePath, data) {
  writeText(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function getTodayLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseBuildEntries(content) {
  const headingRegex = /^##\s+(\d+\.\d+\.\d+)\s*$/gm;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      version: match[1],
      index: match.index,
    });
  }

  return headings.map((heading, idx) => {
    const start = heading.index;
    const end = idx + 1 < headings.length ? headings[idx + 1].index : content.length;
    const section = content.slice(start, end);
    const dateMatch = section.match(/^- Date:\s*(.+)$/m);
    const statusMatch = section.match(/^- Status:\s*(.+)$/m);

    return {
      version: heading.version,
      date: dateMatch ? dateMatch[1].trim() : 'unknown',
      status: statusMatch ? statusMatch[1].trim() : 'unknown',
      section,
    };
  });
}

function parseVersion(version) {
  const parts = version.split('.');
  if (parts.length !== 3) {
    throw new Error(`Invalid version: ${version}`);
  }

  const major = parts[0];
  const minor = parts[1];
  const patchRaw = parts[2];
  const patch = Number.parseInt(patchRaw, 10);

  if (Number.isNaN(patch)) {
    throw new Error(`Invalid patch part in version: ${version}`);
  }

  return {
    major,
    minor,
    patch,
    patchWidth: patchRaw.length,
  };
}

function formatVersion(parsed) {
  const patch = String(parsed.patch).padStart(parsed.patchWidth, '0');
  return `${parsed.major}.${parsed.minor}.${patch}`;
}

function bumpPatch(version, increment) {
  const parsed = parseVersion(version);
  parsed.patch += increment;
  return formatVersion(parsed);
}

function getReleaseCommitHash(version) {
  const lines = runGit(`log --format="%H%x09%s"`).split('\n').filter(Boolean);
  const line = lines.find((item) => {
    const separatorIndex = item.indexOf('\t');
    if (separatorIndex === -1) {
      return false;
    }
    const subject = item.slice(separatorIndex + 1);
    return subject.includes(version);
  });

  if (!line) {
    return null;
  }

  return line.split('\t')[0];
}

function getCommits(range) {
  const logOutput = runGit(`log --date=short --format="%h%x09%ad%x09%s" ${range}`);
  if (!logOutput) {
    return [];
  }

  return logOutput
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash, date, ...messageParts] = line.split('\t');
      return {
        hash,
        date,
        message: messageParts.join('\t').trim(),
      };
    });
}

function getReleaseContext() {
  const buildsContent = readText(BUILDS_PATH);
  const entries = parseBuildEntries(buildsContent);
  if (entries.length === 0) {
    throw new Error('BUILDS.txt does not contain release entries');
  }

  const latestEntry = entries[0];
  const lastReleaseVersion = latestEntry.version;
  const releaseCommitHash = getReleaseCommitHash(lastReleaseVersion);

  const commitsSinceRelease = releaseCommitHash
    ? getCommits(`${releaseCommitHash}..HEAD`)
    : getCommits('HEAD');

  const recommendedVersion = bumpPatch(lastReleaseVersion, commitsSinceRelease.length);

  const rootPackage = readJson(ROOT_PACKAGE_PATH);
  const frontendPackage = readJson(FRONTEND_PACKAGE_PATH);

  return {
    buildsContent,
    latestEntry,
    lastReleaseVersion,
    releaseCommitHash,
    commitsSinceRelease,
    recommendedVersion,
    rootVersion: rootPackage.version || '-',
    frontendVersion: frontendPackage.version || '-',
  };
}

function syncDevlog() {
  const commits = getCommits('HEAD');
  const today = getTodayLocal();
  const lines = [
    '# Devlog',
    '',
    'Автогенерируемый журнал изменений из `git log`.',
    '',
    `Обновлено: ${today}`,
    '',
    '| Date | Commit | Message |',
    '|---|---|---|',
  ];

  commits.forEach((commit) => {
    const safeMessage = commit.message.replace(/\|/g, '\\|');
    lines.push(`| ${commit.date} | \`${commit.hash}\` | ${safeMessage} |`);
  });

  lines.push('');
  writeText(DEVLOG_PATH, `${lines.join('\n')}`);
  return commits.length;
}

function upsertVersion(filePath, version) {
  const content = readJson(filePath);
  if (typeof content.version === 'string') {
    content.version = version;
    writeJson(filePath, content);
  }
}

function upsertFrontendLockVersion(version) {
  const lock = readJson(FRONTEND_LOCK_PATH);
  let changed = false;

  if (typeof lock.version === 'string') {
    lock.version = version;
    changed = true;
  }

  if (lock.packages && lock.packages[''] && typeof lock.packages[''].version === 'string') {
    lock.packages[''].version = version;
    changed = true;
  }

  if (changed) {
    writeJson(FRONTEND_LOCK_PATH, lock);
  }
}

function prependBuildEntry(version, date, changes, currentContent) {
  const releaseHeadingRegex = /^##\s+\d+\.\d+\.\d+\s*$/m;
  const firstReleaseMatch = currentContent.match(releaseHeadingRegex);
  if (!firstReleaseMatch || firstReleaseMatch.index === undefined) {
    throw new Error('Cannot find release section in BUILDS.txt');
  }

  const changesBlock = changes
    .map((item, idx) => `  ${idx + 1}. ${item}`)
    .join('\n');

  const entry = [
    `## ${version}`,
    `- Date: ${date}`,
    '- Status: released',
    '- Changes:',
    changesBlock,
    '',
  ].join('\n');

  const insertAt = firstReleaseMatch.index;
  return `${currentContent.slice(0, insertAt)}${entry}${currentContent.slice(insertAt)}`;
}

function printStatus() {
  const context = getReleaseContext();
  console.log(`BUILDS latest: ${context.lastReleaseVersion} (${context.latestEntry.date})`);
  console.log(`package.json: ${context.rootVersion}`);
  console.log(`frontend/package.json: ${context.frontendVersion}`);
  if (context.releaseCommitHash) {
    console.log(`release commit: ${context.releaseCommitHash}`);
  } else {
    console.log('release commit: not found (will use entire history)');
  }
  console.log(`commits since release: ${context.commitsSinceRelease.length}`);
  console.log(`recommended next version: ${context.recommendedVersion}`);
  if (context.commitsSinceRelease.length > 0) {
    console.log('changes since release:');
    context.commitsSinceRelease
      .slice()
      .reverse()
      .forEach((commit) => console.log(`- ${commit.message} (${commit.hash})`));
  }
}

function prepareRelease() {
  const context = getReleaseContext();
  if (context.commitsSinceRelease.length === 0) {
    console.log('No new commits since latest release. Nothing to prepare.');
    return;
  }

  const nextVersion = context.recommendedVersion;
  const today = getTodayLocal();
  const changes = context.commitsSinceRelease
    .slice()
    .reverse()
    .map((commit) => commit.message);

  upsertVersion(ROOT_PACKAGE_PATH, nextVersion);
  upsertVersion(FRONTEND_PACKAGE_PATH, nextVersion);
  upsertVersion(ROOT_LOCK_PATH, nextVersion);
  upsertFrontendLockVersion(nextVersion);

  const updatedBuilds = prependBuildEntry(nextVersion, today, changes, context.buildsContent);
  writeText(BUILDS_PATH, updatedBuilds);

  const commitCount = syncDevlog();

  console.log(`Prepared release ${nextVersion}`);
  console.log(`- commits included: ${context.commitsSinceRelease.length}`);
  console.log(`- DEVLOG entries synced: ${commitCount}`);
  console.log('- updated files:');
  console.log('  - BUILDS.txt');
  console.log('  - DEVLOG.md');
  console.log('  - package.json');
  console.log('  - package-lock.json (if version field exists)');
  console.log('  - frontend/package.json');
  console.log('  - frontend/package-lock.json');
}

function main() {
  const command = process.argv[2] || 'status';

  if (command === 'status') {
    printStatus();
    return;
  }

  if (command === 'sync-devlog') {
    const count = syncDevlog();
    console.log(`DEVLOG.md synced (${count} commits).`);
    return;
  }

  if (command === 'prepare-release') {
    prepareRelease();
    return;
  }

  console.error(`Unknown command: ${command}`);
  console.error('Usage: node scripts/release-tools.js [status|sync-devlog|prepare-release]');
  process.exit(1);
}

main();
