# README Badge Management

## Overview

The project uses dynamic shields.io badges in the README to display current package versions. These badges are automatically updated during package lifecycle events to ensure they always reflect the actual installed versions.

## How It Works

### Badge Generation

The `scripts/update-readme-badges.js` script:

1. Reads `package.json` to get current package versions
2. Generates shields.io badge URLs for key dependencies
3. Updates the README.md file with the new badge URLs

### Key Dependencies Tracked

- **@tanstack/react-query** - Data fetching and caching
- **zod** - Schema validation
- **next** - Next.js framework
- **react** - React library

### Badge Format

Badges use the shields.io npm version endpoint:

```
https://img.shields.io/npm/v/{package}?label={label}&logo=npm
```

For scoped packages like `@tanstack/react-query`, the package name is URL-encoded.

## Lifecycle Integration

The badge updater runs automatically during:

### 1. `postinstall` Hook

- Runs after every `pnpm install`
- Ensures badges are up-to-date when dependencies change

### 2. `version` Hook

- Runs when bumping the package version with `pnpm version`
- Automatically stages README.md changes with the version commit

### 3. Manual Trigger

Run the badge updater manually:

```bash
pnpm run badges:update
```

## Benefits

### ✅ Always Accurate

Badges reflect the actual installed versions from package.json

### ✅ No Manual Updates

No need to manually edit version numbers in the README

### ✅ CI/CD Friendly

Works seamlessly in automated workflows

### ✅ Git-Aware

Version hook ensures README changes are committed with version bumps

## Customization

### Adding More Badges

Edit `scripts/update-readme-badges.js` and add to the `keyPackages` array:

```javascript
const keyPackages = [
  { name: 'package-name', label: 'Display Label' },
  { name: '@scoped/package', label: 'Scoped Package' },
  // ... add more
];
```

### Changing Badge Styles

Modify the `generateBadge()` function to add style parameters:

```javascript
function generateBadge(packageName, label) {
  const encodedName = encodeURIComponent(packageName);
  const badgeLabel = label || packageName;

  // Add &style=flat-square or other shields.io parameters
  return `![${badgeLabel}](https://img.shields.io/npm/v/${encodedName}?label=${encodeURIComponent(badgeLabel)}&logo=npm&style=flat-square)`;
}
```

### Available Shields.io Styles

- `flat` (default)
- `flat-square`
- `plastic`
- `for-the-badge`
- `social`

## Troubleshooting

### Badges Not Updating

1. Ensure the script has execute permissions
2. Check that Node.js can read/write files
3. Verify package.json contains the tracked dependencies

### Script Fails

Run with error details:

```bash
node scripts/update-readme-badges.js
```

Check for:

- Valid package.json format
- README.md file exists and is writable
- Correct regex patterns in the script

### Badges Show Wrong Versions

The badges show the **published npm version**, not your local version. This is expected behavior - shields.io fetches data from the npm registry.

## Development Notes

### Why Use shields.io?

- **Live Data**: Badges fetch current versions from npm
- **CDN Cached**: Fast loading with global CDN
- **Standardized**: Consistent appearance across projects
- **Maintained**: Service is actively maintained by the community

### Alternative: Version Placeholders

If you prefer static version strings, you can modify the script to inject actual version numbers from package.json instead of shields.io URLs.

## References

- [Shields.io Documentation](https://shields.io/)
- [npm badge endpoint](https://shields.io/badges/npm-version)
- [npm Lifecycle Scripts](https://docs.npmjs.com/cli/v10/using-npm/scripts#life-cycle-scripts)
