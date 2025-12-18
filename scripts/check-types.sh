#!/bin/bash

# Quick TypeScript type checking script

set -e

cd "$(dirname "$0")/.."

echo "Running TypeScript type checks..."
npm run type-check --workspaces

echo "✓ All type checks passed!"

