# Creating Releases

This project includes an interactive release script that handles building, signing, notarizing, and publishing your Electron app to GitHub.

## Prerequisites

### 1. Apple Developer Account

You need an Apple Developer account to sign and notarize macOS apps.

- Sign up at https://developer.apple.com
- Enroll in the Apple Developer Program ($99/year)

### 2. Developer ID Certificate

1. Open **Xcode** → **Settings** → **Accounts**
2. Add your Apple ID
3. Select your team → **Manage Certificates**
4. Click **+** → **Developer ID Application**
5. The certificate will be added to your Keychain

### 3. App-Specific Password

1. Go to https://appleid.apple.com/account/manage
2. Sign in with your Apple ID
3. Go to **Security** → **App-Specific Passwords**
4. Click **Generate Password**
5. Give it a name like "Electron Builder"
6. Copy the generated password (save it for the next step)

### 4. Find Your Team ID

1. Go to https://developer.apple.com/account
2. Look in the **Membership** section for your Team ID (10 characters)
3. Or run this command:
   ```bash
   security find-certificate -c "Developer ID Application" -p | openssl x509 -text | grep "OU="
   ```

### 5. GitHub CLI

Install and authenticate with GitHub CLI:

```bash
brew install gh
gh auth login
```

## Setup

### 1. Create `.env` File

Copy the example and fill in your details:

```bash
cp .env.example .env
```

Edit `.env` with your information:

```bash
# App Configuration
VITE_APP_ID=com.yourcompany.yourapp
VITE_PRODUCT_NAME=Your App Name
VITE_PUBLISH_OWNER=your-github-username
VITE_PUBLISH_REPO=your-repo-name

# Apple Notarization
APPLE_ID=your.apple.id@email.com
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=XXXXXXXXXX
```

**Important:** Never commit your `.env` file! It's already in `.gitignore`.

### 2. Test Local Build

Before creating a release, test that everything works:

```bash
pnpm run build:mac
```

This will build, sign, and notarize your app. If this succeeds, you're ready to create releases!

## Creating a Release

### Quick Start

```bash
pnpm run release
```

The script will guide you through:

1. **Version bump** - Choose patch/minor/major or keep current
2. **Draft or publish** - Create as draft or publish immediately
3. **Confirmation** - Review before proceeding

Then it will:

- Update `package.json` (if version changed)
- Commit the version bump
- Create a git tag
- Build and sign the app
- Notarize with Apple (~5-10 minutes)
- Create GitHub release
- Upload artifacts
- Push tag and commits

### Example Flow

```
🚀 Electron Release Script

Running pre-flight checks...

✓ Git working directory clean
✓ Environment variables loaded
✓ GitHub CLI installed
✓ GitHub CLI authenticated
✓ Current version: 1.0.0

? What version bump? ›
  ❯ Patch (1.0.1)
    Minor (1.1.0)
    Major (2.0.0)
    Custom
    Keep current (1.0.0)

? Create release as: ›
  ❯ Draft (review before publishing)
    Published (live immediately)

📋 Release Summary:
   Version: 1.0.0 → 1.0.1
   Status: Draft
   Platform: macOS (Apple Silicon)

? Proceed with release? › (Y/n)
```

## Tips

### Draft Releases

Use draft releases when:

- Testing the build process
- You want to add/edit release notes before publishing
- You're not ready for users to download yet

You can publish draft releases later from the GitHub web interface.

### Version Bumping

- **Patch** (1.0.0 → 1.0.1): Bug fixes, small changes
- **Minor** (1.0.0 → 1.1.0): New features, backwards compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

### Release Notes

The script auto-generates release notes from your git commits. You can edit them on GitHub after the release is created.

**Pro tip:** Write good commit messages and your release notes will look great!

## Troubleshooting

### "Uncommitted changes" Error

The script requires a clean git working directory. Commit or stash your changes first:

```bash
git add .
git commit -m "Your changes"
```

### Notarization Fails

If notarization fails, check:

- `APPLE_ID` is correct
- `APPLE_APP_SPECIFIC_PASSWORD` is an app-specific password (not your main password)
- `APPLE_TEAM_ID` matches your Developer account
- Your Developer ID certificate is valid (check Keychain Access)

### Build Takes Forever

Notarization usually takes 5-10 minutes. Apple's servers can be slower during peak hours. Be patient!

### "Command not found: gh"

Install GitHub CLI:

```bash
brew install gh
gh auth login
```

## Auto-Updates

Once you publish a release, users with your app installed will automatically get notified of the update (thanks to `electron-updater`).

The app checks for updates using the `latest-mac.yml` file that's uploaded with each release.

## Platform Support

Currently, this template only supports **macOS (Apple Silicon)**.

To add support for other platforms:

- **macOS Intel**: Change `--arm64` to `--x64` in the script
- **Universal macOS**: Use `--universal`
- **Windows**: Add Windows signing setup
- **Linux**: Much simpler, no signing needed!

## Questions?

If you run into issues, check:

1. All environment variables are set correctly in `.env`
2. Your Apple Developer certificates are valid
3. You're authenticated with GitHub CLI (`gh auth status`)
4. Your git working directory is clean (`git status`)
