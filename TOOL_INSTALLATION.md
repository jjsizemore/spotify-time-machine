# Tool Installation Notes

## Tools Managed by mise

The following tools are automatically installed and managed by `mise.toml`:

✅ **Installed via mise:**

- node (24.9.0)
- pnpm (10.18.1)
- prettier (3.6.2)
- dotenv-linter (3.3.0)
- trufflehog (3.90.8)
- snyk (1.1260.0)
- semgrep (1.139.0)
- uv (0.7.16)
- typos (1.38.1)
- shellcheck (0.11.0)
- actionlint (1.7.7)
- lefthook (1.13.6)

## Tools Not Available in mise Registry

Some tools referenced in the project are not available via mise and need alternative installation:

### trunk

**Status:** Used in project but not in mise registry  
**Current installation:** Unknown (check if installed: `trunk --version`)  
**Install via:**

```bash
# Option 1: Official installer
curl -fsSL https://get.trunk.io | bash

# Option 2: Homebrew (macOS)
brew install trunk-io

# Option 3: npm (not recommended for global tools)
npm install -g @trunkio/launcher
```

**Usage:** `trunk check`, `trunk fmt`

### oxlint

**Status:** In devDependencies (package.json)  
**Current installation:** npm package  
**Install via:**

```bash
# Already in package.json devDependencies
pnpm install

# Global install (optional)
npm install -g oxlint
```

**Usage:** `pnpm exec oxlint` or `oxlint` (if global)

## Verification

Check all tools are installed:

```bash
# mise-managed tools
mise ls --current

# trunk
trunk --version

# oxlint (via pnpm)
pnpm exec oxlint --version

# Verify all tasks work
mise task ls
```

## Recommendations

### Option 1: Keep Current Setup (Recommended)

- trunk: Use existing installation method
- oxlint: Keep in devDependencies
- Others: Managed by mise ✅

### Option 2: Standardize on mise + npm

- Add trunk to devDependencies
- Keep oxlint in devDependencies
- Use mise only for non-Node tools

### Option 3: Create Custom mise Backend

- Create custom mise plugin for trunk
- Advanced: requires plugin development

## Currently Selected: Option 1

The current `mise.toml` has trunk and oxlint commented out with installation notes.

## Post-Installation Setup

After tools are installed:

1. **Install git hooks:**

   ```bash
   # Using husky (current)
   pnpm run prepare

   # Or using lefthook (alternative)
   mise run hooks-install
   ```

2. **Run initial audit:**

   ```bash
   mise run audit
   ```

3. **Test security scans:**

   ```bash
   mise run security
   ```

4. **Verify spellcheck:**
   ```bash
   mise run spellcheck
   ```

## Troubleshooting

### Tool not found

```bash
# Reinstall mise tools
mise install

# Check installation
mise doctor
```

### trunk not found

```bash
# Install trunk
curl -fsSL https://get.trunk.io | bash

# Or use homebrew
brew install trunk-io
```

### oxlint not found

```bash
# Install dependencies
pnpm install

# Verify
pnpm exec oxlint --version
```

## CI/CD Considerations

For CI/CD pipelines, you'll need to install:

1. **mise** (one-time):

   ```bash
   curl https://mise.run | sh
   ```

2. **mise tools**:

   ```bash
   mise install
   ```

3. **npm dependencies**:

   ```bash
   pnpm install
   ```

4. **trunk** (if not using npm):
   ```bash
   curl -fsSL https://get.trunk.io | bash
   ```

Example GitHub Actions:

```yaml
- name: Setup mise
  uses: jdx/mise-action@v2

- name: Install tools
  run: mise install

- name: Install dependencies
  run: pnpm install

- name: Run audit
  run: mise run audit
```
