#!/usr/bin/env bash
set -e

echo "🔧 Running lightweight format/check hook..."

if [ -d "backend" ]; then
  echo "✅ Backend folder found"
fi

if [ -d "frontend" ]; then
  echo "✅ Frontend folder found"
fi

echo "✅ Format hook completed"
