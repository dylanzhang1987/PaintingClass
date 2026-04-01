# Husky Git Hooks Setup

## Overview
This project uses Husky to automatically run tests before each git commit (pre-commit hook).

## Initial Setup

Since the frontend is in a subdirectory of the main project, the Husky configuration needs special setup:

### Method 1: Automatic Setup Script (Recommended)

From the project root directory, run:

```bash
cd frontend && ./setup-husky.sh
```

This script will:
- Create the `.husky` directory in the parent project
- Copy the pre-commit hook to the parent project
- Make the hooks executable

### Method 2: Manual Setup

1. Create the `.husky` directory in the project root:

```bash
mkdir -p ../.husky/_
```

2. Copy the hook files:

```bash
cp .husky/pre-commit ../.husky/pre-commit
chmod +x ../.husky/pre-commit
```

3. Copy helper scripts (if needed):

```bash
cp -r .husky/_/* ../.husky/_/
```

## Pre-Commit Behavior

When you run `git commit`, the following happens:

1. The pre-commit hook is triggered
2. Tests are run automatically: `npm run test:run`
3. If all tests pass:
   - Commit proceeds normally
4. If any tests fail:
   - Commit is **aborted**
   - You need to fix failing tests before committing

## Skipping the Hook (Emergency Only)

If you need to commit without running tests (not recommended):

```bash
git commit --no-verify -m "Your message"
```

## Testing the Hook

To verify the hook is working:

```bash
# Make a small change to a file
echo "// test" >> src/test/helpers/renderWithRouter.js

# Try to commit
git add .
git commit -m "Test pre-commit hook"

# This should run tests and pass (or fail if you broke something)
```

## Troubleshooting

### Hook not executing

1. Verify the hook is executable:
   ```bash
   ls -l ../.husky/pre-commit
   ```

2. Check Husky is installed:
   ```bash
   cat ../.husky/pre-commit
   ```

3. Ensure you're committing from the correct directory

### Tests running from wrong directory

The pre-commit hook uses `npm run test:run` which respects the current working directory.

## Related Files

- `frontend/.husky/pre-commit` - The pre-commit hook source file
- `frontend/setup-husky.sh` - Setup automation script
- `frontend/package.json` - Test scripts configuration
