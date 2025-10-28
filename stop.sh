#!/bin/bash
echo "🛑 Stopping servers..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No process on port 3001"
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process on port 3000"
echo "✅ Servers stopped"
