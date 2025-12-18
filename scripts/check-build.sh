#!/bin/bash

# Quick build checking script

set -e

cd "$(dirname "$0")/.."

echo "Running build checks..."
npm run build --workspaces

echo "✓ All builds passed!"

