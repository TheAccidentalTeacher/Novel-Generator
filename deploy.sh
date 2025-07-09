#!/bin/bash

# NovelForge Deployment Script
# This script helps deploy NovelForge to Railway (backend) and Netlify (frontend)

echo "🚀 NovelForge Deployment Helper"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: NovelForge AI Novel Writing Platform"
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo "1. ✅ Git repository initialized"
echo "2. ⚠️  Create GitHub repository and push code"
echo "3. ⚠️  Set up MongoDB Atlas database"
echo "4. ⚠️  Get OpenAI API key"
echo "5. ⚠️  Deploy backend to Railway"
echo "6. ⚠️  Deploy frontend to Netlify"

echo ""
echo "🔧 Next Steps:"
echo ""
echo "1. CREATE GITHUB REPOSITORY:"
echo "   - Go to https://github.com/new"
echo "   - Create a new repository named 'novel-generator'"
echo "   - Copy the repository URL"
echo ""
echo "2. PUSH TO GITHUB:"
echo "   git remote add origin https://github.com/yourusername/novel-generator.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. DEPLOY BACKEND TO RAILWAY:"
echo "   - Go to https://railway.app"
echo "   - Click 'New Project' > 'Deploy from GitHub'"
echo "   - Select your repository"
echo "   - Set root directory to '/backend'"
echo "   - Add environment variables from backend/RAILWAY_DEPLOY.md"
echo ""
echo "4. DEPLOY FRONTEND TO NETLIFY:"
echo "   - Go to https://netlify.com"
echo "   - Click 'Add new site' > 'Import from Git'"
echo "   - Select your repository"
echo "   - Set base directory to '/frontend'"
echo "   - Set build command to 'npm run build'"
echo "   - Set publish directory to 'frontend/build'"
echo "   - Add environment variables from frontend/NETLIFY_DEPLOY.md"
echo ""
echo "5. UPDATE CONFIGURATION:"
echo "   - Update REACT_APP_API_URL in Netlify to point to Railway backend"
echo "   - Update FRONTEND_URL in Railway to point to Netlify frontend"
echo ""
echo "📚 Documentation:"
echo "   - Backend: see backend/RAILWAY_DEPLOY.md"
echo "   - Frontend: see frontend/NETLIFY_DEPLOY.md"
echo "   - README: see README.md for full setup guide"
echo ""
echo "🎉 Happy deploying!"
