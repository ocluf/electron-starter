#!/usr/bin/env node
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { execSync } from 'child_process'
import { loadEnvFile } from 'node:process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import prompts from 'prompts'
import chalk from 'chalk'

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Helper to run shell commands
 * @param {string} cmd - Command to execute
 * @param {object} options - Execution options
 * @returns {string} Command output
 */
function run(cmd, options = {}) {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    })
  } catch (error) {
    if (!options.ignoreError) {
      console.error(chalk.red(`\n❌ Command failed: ${cmd}`))
      console.error(error.message)
      process.exit(1)
    }
    throw error
  }
}

/**
 * Check if a command exists in PATH
 * @param {string} cmd - Command to check
 * @returns {boolean} True if command exists
 */
function commandExists(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

/**
 * Load and validate environment variables from .env file
 * @returns {void}
 */
function validateEnv() {
  const envPath = path.join(__dirname, '..', '.env')

  if (!fs.existsSync(envPath)) {
    console.error(chalk.red('❌ Error: .env file not found'))
    console.log(chalk.yellow('\nPlease create a .env file with the required variables.'))
    console.log(chalk.yellow('See .env.example for reference.\n'))
    process.exit(1)
  }

  // Load .env using Node's built-in support
  loadEnvFile(envPath)

  const required = [
    'APPLE_ID',
    'APPLE_APP_SPECIFIC_PASSWORD',
    'APPLE_TEAM_ID',
    'VITE_APP_ID',
    'VITE_PRODUCT_NAME',
    'VITE_PUBLISH_OWNER',
    'VITE_PUBLISH_REPO'
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error(chalk.red('❌ Error: Missing required environment variables:'))
    missing.forEach((key) => console.log(chalk.yellow(`  - ${key}`)))
    console.log(chalk.yellow('\nPlease add these to your .env file.\n'))
    process.exit(1)
  }
}

/**
 * Get package.json data
 * @returns {object} Parsed package.json
 */
function getPackageJson() {
  const pkgPath = path.join(__dirname, '..', 'package.json')
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
}

/**
 * Get current version from package.json
 * @returns {string} Current version
 */
function getCurrentVersion() {
  return getPackageJson().version
}

/**
 * Get package name from package.json
 * @returns {string} Package name
 */
function getPackageName() {
  return getPackageJson().name
}

/**
 * Update package.json version
 * @param {string} newVersion - New version to set
 * @returns {void}
 */
function updateVersion(newVersion) {
  const pkgPath = path.join(__dirname, '..', 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkg.version = newVersion
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

/**
 * Bump version number based on type
 * @param {string} current - Current version (e.g., "1.0.0")
 * @param {string} type - Bump type: "patch", "minor", or "major"
 * @returns {string} New version
 */
function bumpVersion(current, type) {
  const parts = current.split('.').map(Number)

  switch (type) {
    case 'patch':
      parts[2]++
      break
    case 'minor':
      parts[1]++
      parts[2] = 0
      break
    case 'major':
      parts[0]++
      parts[1] = 0
      parts[2] = 0
      break
  }

  return parts.join('.')
}

/**
 * Check git status for uncommitted changes
 * @returns {void}
 */
function checkGitStatus() {
  try {
    const status = run('git status --porcelain', { silent: true })
    if (status.trim()) {
      console.error(chalk.red('❌ Error: You have uncommitted changes'))
      console.log(
        chalk.yellow('\nPlease commit or stash your changes before creating a release.\n')
      )
      process.exit(1)
    }
  } catch {
    console.error(chalk.red('❌ Error: Not a git repository'))
    process.exit(1)
  }
}

/**
 * Check if a git tag exists locally
 * @param {string} tag - Tag name to check
 * @returns {boolean} True if tag exists
 */
function tagExists(tag) {
  try {
    run(`git rev-parse ${tag}`, { silent: true, ignoreError: true })
    return true
  } catch {
    return false
  }
}

/**
 * Main release flow
 * @returns {Promise<void>}
 */
async function main() {
  console.log(chalk.green.bold('\n🚀 Electron Release Script\n'))

  // Pre-flight checks
  console.log(chalk.cyan('Running pre-flight checks...\n'))

  // Check git status
  checkGitStatus()
  console.log(chalk.green('✓ Git working directory clean'))

  // Check .env
  validateEnv()
  console.log(chalk.green('✓ Environment variables loaded'))

  // Check gh CLI
  if (!commandExists('gh')) {
    console.error(chalk.red('❌ Error: GitHub CLI (gh) is not installed'))
    console.log(chalk.yellow('\nInstall it with: brew install gh'))
    console.log(chalk.yellow('Then authenticate with: gh auth login\n'))
    process.exit(1)
  }
  console.log(chalk.green('✓ GitHub CLI installed'))

  // Check gh auth
  try {
    run('gh auth status', { silent: true })
    console.log(chalk.green('✓ GitHub CLI authenticated'))
  } catch {
    console.error(chalk.red('❌ Error: Not authenticated with GitHub CLI'))
    console.log(chalk.yellow('\nRun: gh auth login\n'))
    process.exit(1)
  }

  const currentVersion = getCurrentVersion()
  console.log(chalk.green(`✓ Current version: ${currentVersion}\n`))

  // Prompt for version bump
  const versionChoices = [
    { title: `Patch (${bumpVersion(currentVersion, 'patch')})`, value: 'patch' },
    { title: `Minor (${bumpVersion(currentVersion, 'minor')})`, value: 'minor' },
    { title: `Major (${bumpVersion(currentVersion, 'major')})`, value: 'major' },
    { title: 'Custom', value: 'custom' },
    { title: `Keep current (${currentVersion})`, value: 'keep' }
  ]

  const versionAnswer = await prompts({
    type: 'select',
    name: 'bump',
    message: 'What version bump?',
    choices: versionChoices,
    initial: 0
  })

  if (!versionAnswer.bump) {
    console.log(chalk.yellow('\nCancelled.'))
    process.exit(0)
  }

  let newVersion = currentVersion

  if (versionAnswer.bump === 'custom') {
    const customAnswer = await prompts({
      type: 'text',
      name: 'version',
      message: 'Enter custom version:',
      initial: currentVersion,
      validate: (v) => /^\d+\.\d+\.\d+$/.test(v) || 'Invalid version format (use x.y.z)'
    })

    if (!customAnswer.version) {
      console.log(chalk.yellow('\nCancelled.'))
      process.exit(0)
    }

    newVersion = customAnswer.version
  } else if (versionAnswer.bump !== 'keep') {
    newVersion = bumpVersion(currentVersion, versionAnswer.bump)
  }

  // Prompt for draft or publish
  const releaseAnswer = await prompts({
    type: 'select',
    name: 'draft',
    message: 'Create release as:',
    choices: [
      { title: 'Draft (review before publishing)', value: true },
      { title: 'Published (live immediately)', value: false }
    ],
    initial: 0
  })

  if (releaseAnswer.draft === undefined) {
    console.log(chalk.yellow('\nCancelled.'))
    process.exit(0)
  }

  // Confirmation
  console.log(chalk.cyan('\n📋 Release Summary:'))
  console.log(chalk.white(`   Version: ${currentVersion} → ${chalk.bold(newVersion)}`))
  console.log(
    chalk.white(
      `   Status: ${releaseAnswer.draft ? chalk.yellow('Draft') : chalk.green('Published')}`
    )
  )
  console.log(chalk.white(`   Platform: macOS (Apple Silicon)`))

  const confirmAnswer = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: 'Proceed with release?',
    initial: true
  })

  if (!confirmAnswer.proceed) {
    console.log(chalk.yellow('\nCancelled.'))
    process.exit(0)
  }

  console.log('')

  // Update version if changed
  if (newVersion !== currentVersion) {
    console.log(chalk.cyan(`📝 Updating version to ${newVersion}...`))
    updateVersion(newVersion)

    console.log(chalk.cyan('💾 Committing version bump...'))
    run('git add package.json')
    run(`git commit -m "Bump version to ${newVersion}"`)
  }

  // Build BEFORE creating tag (so we can fail early)
  console.log(chalk.cyan('\n🔨 Building app...\n'))
  run('pnpm run build')

  console.log(chalk.cyan('\n🔐 Building, signing, and notarizing...\n'))
  console.log(chalk.yellow('⏳ This can take several minutes (signing and notarization is slow)\n'))

  // Build with electron-builder
  run('pnpm exec dotenv -e .env -- pnpm exec electron-builder --mac --arm64 --publish never')

  // Verify build artifacts
  const distPath = path.join(__dirname, '..', 'dist')
  const packageName = getPackageName()
  const dmgFile = `${packageName}-${newVersion}-arm64.dmg`
  const dmgPath = path.join(distPath, dmgFile)

  if (!fs.existsSync(dmgPath)) {
    console.error(chalk.red(`\n❌ Build failed - ${dmgFile} not found`))
    process.exit(1)
  }

  console.log(chalk.green('\n✅ Build completed successfully!\n'))

  // Now that build succeeded, push commits and create tag
  const tag = `v${newVersion}`

  if (newVersion !== currentVersion) {
    console.log(chalk.cyan('📌 Pushing version bump to GitHub...'))
    run('git push origin main')
  }

  // Delete existing release if it exists (before creating tag)
  try {
    run(`gh release view ${tag}`, { silent: true })
    console.log(chalk.yellow(`⚠️  Deleting existing release ${tag}...`))
    run(`gh release delete ${tag} -y --cleanup-tag`)
  } catch {
    // Release doesn't exist, that's fine
  }

  // Create and push tag (force push in case it exists remotely)
  if (tagExists(tag)) {
    console.log(chalk.yellow(`⚠️  Tag ${tag} already exists locally, deleting...`))
    run(`git tag -d ${tag}`)
  }

  console.log(chalk.cyan(`🏷️  Creating and pushing tag ${tag}...`))
  run(`git tag ${tag}`)
  run(`git push origin ${tag} --force`)

  // Create GitHub release (tag now exists on remote)
  console.log(chalk.cyan('\n📤 Creating GitHub release...\n'))

  const draftFlag = releaseAnswer.draft ? '--draft' : ''

  // Create release without assets first
  const createReleaseCmd =
    `gh release create ${tag} ${draftFlag} --title "${tag}" --generate-notes ` +
    `--repo "${process.env.VITE_PUBLISH_OWNER}/${process.env.VITE_PUBLISH_REPO}"`

  run(createReleaseCmd)

  // Upload assets one at a time to avoid timeout issues with large files
  console.log(chalk.cyan('📦 Uploading release assets...\n'))

  const assets = [
    `"dist/latest-mac.yml"`,
    `"dist/${packageName}-${newVersion}-arm64.dmg.blockmap"`,
    `"dist/${packageName}-${newVersion}-arm64-mac.zip.blockmap"`,
    `"dist/${packageName}-${newVersion}-arm64-mac.zip"`,
    `"dist/${packageName}-${newVersion}-arm64.dmg"` // Upload largest file last
  ]

  for (const asset of assets) {
    console.log(chalk.cyan(`  Uploading ${asset}...`))
    run(
      `gh release upload ${tag} ${asset} --clobber ` +
        `--repo "${process.env.VITE_PUBLISH_OWNER}/${process.env.VITE_PUBLISH_REPO}"`
    )
  }

  // Success!
  console.log(chalk.green.bold('\n🎉 Release created successfully!\n'))
  console.log(chalk.white(`   Version: ${chalk.bold(newVersion)}`))
  console.log(
    chalk.white(
      `   Status: ${releaseAnswer.draft ? chalk.yellow('Draft') : chalk.green('Published')}`
    )
  )

  if (releaseAnswer.draft) {
    const draftsUrl = `https://github.com/${process.env.VITE_PUBLISH_OWNER}/${process.env.VITE_PUBLISH_REPO}/releases`
    console.log(chalk.white(`   View draft: ${chalk.blue(draftsUrl)}\n`))
    console.log(
      chalk.yellow('💡 Your draft is ready! Edit and publish it from the releases page.\n')
    )
  } else {
    const releaseUrl = `https://github.com/${process.env.VITE_PUBLISH_OWNER}/${process.env.VITE_PUBLISH_REPO}/releases/tag/${tag}`
    console.log(chalk.white(`   URL: ${chalk.blue(releaseUrl)}\n`))
  }
}

// Run with proper error handling
main().catch((error) => {
  console.error(chalk.red('\n❌ Unexpected error:'), error)
  process.exit(1)
})
