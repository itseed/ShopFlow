#!/bin/bash

# Quick ESLint checking script

set -e

cd "$(dirname "$0")/.."

echo "Running ESLint checks..."
npm run lint --workspaces

echo "✓ All lint checks passed!"

