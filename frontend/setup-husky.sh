#!/bin/bash

# Setup Husky Git Hooks
# This script should be run from the project root after cloning the repository

echo "Setting up Husky Git Hooks..."

# Check if we're in a git repository
if [ ! -d "../.git" ]; then
    echo "Error: Not in a git repository. Please run this script from within the project's git directory."
    exit 1
fi

# Create .husky directory if it doesn't exist
mkdir -p .husky

# Copy the pre-commit hook to the parent .husky directory
if [ -f ".husky/pre-commit" ]; then
    cp .husky/pre-commit ../.husky/pre-commit
    chmod +x ../.husky/pre-commit
    echo "✓ pre-commit hook installed"
else
    echo "✗ pre-commit hook not found"
    exit 1
fi

# Copy the _/husky.sh helper if it exists
if [ -d ".husky/_" ]; then
    mkdir -p ../.husky/_
    cp -r .husky/_/* ../.husky/_/
    echo "✓ husky helper scripts installed"
fi

echo ""
echo "Husky Git Hooks setup complete!"
echo ""
echo "Git hooks are now configured to run tests before each commit."
echo "If tests fail, the commit will be aborted."
