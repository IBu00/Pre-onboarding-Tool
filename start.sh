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
