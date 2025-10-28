#!/bin/bash

# ILex Pre-Onboarding Tool Setup Script
# This script will set up the entire application for first-time use

set -e  # Exit on error

echo "🚀 ILex Pre-Onboarding Tool - Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Node.js version $NODE_VERSION detected. Version 18+ recommended.${NC}"
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"
echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
if [ ! -f ".env" ]; then
    echo "Creating server/.env from template..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit server/.env with your AWS SES credentials${NC}"
fi
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../client
if [ ! -f ".env" ]; then
    echo "Creating client/.env from template..."
    cp .env.example .env
fi
npm install --legacy-peer-deps
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

cd ..

# Create launch script
echo "📝 Creating launch scripts..."

# Create start script for Unix
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting ILex Pre-Onboarding Tool..."
echo ""
echo "Starting backend server..."
cd server
npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

echo "Waiting for backend to start..."
sleep 3

echo "Starting frontend..."
cd client
npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "✅ Both servers started!"
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x start.sh

# Create stop script
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping servers..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No process on port 3001"
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process on port 3000"
echo "✅ Servers stopped"
EOF

chmod +x stop.sh

echo -e "${GREEN}✓ Launch scripts created${NC}"
echo ""

# Summary
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "📚 Next Steps:"
echo ""
echo "1. Configure environment variables:"
echo "   - Edit server/.env (add AWS SES credentials for email tests)"
echo "   - Edit client/.env (should work with defaults)"
echo ""
echo "2. Start the application:"
echo "   Option A - Use launch script:"
echo "     ./start.sh"
echo ""
echo "   Option B - Manual start:"
echo "     Terminal 1: cd server && npm run dev"
echo "     Terminal 2: cd client && npm start"
echo ""
echo "3. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "4. Stop servers:"
echo "   Press Ctrl+C or run: ./stop.sh"
echo ""
echo "📖 Documentation:"
echo "   - README.md          - Full project documentation"
echo "   - QUICKSTART.md      - Quick start guide"
echo "   - DEPLOYMENT.md      - AWS deployment guide"
echo "   - TESTING.md         - Testing scenarios"
echo "   - TROUBLESHOOTING.md - Common issues and solutions"
echo ""
echo "🆘 Need help?"
echo "   - Read the documentation files above"
echo "   - Email: support@ilex.sg"
echo ""
echo -e "${GREEN}Happy testing! 🎉${NC}"
