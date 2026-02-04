#!/bin/bash

# VideoSaaS Setup Script
echo "========================================="
echo "VideoSaaS - Setup Script"
echo "========================================="
echo ""

# Setup Backend
echo "Installing Backend Dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Setup Frontend
echo ""
echo "Installing Frontend Dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo ""
echo "To start development:"
echo "  Terminal 1: cd backend && python run.py"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Health Check: http://localhost:8000/health"
echo "========================================="
