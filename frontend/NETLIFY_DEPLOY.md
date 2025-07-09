# Netlify Deployment Guide for NovelForge Frontend

## Quick Deploy Steps:

### 1. Connect to Netlify
1. Go to [Netlify](https://netlify.app)
2. Click "Add new site" > "Import an existing project"
3. Connect your Git repository
4. Select the `/frontend` folder as the base directory

### 2. Build Settings
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/build`
- **Node version**: 18

### 3. Environment Variables
Add these in Netlify dashboard > Site settings > Environment variables:

```
REACT_APP_API_URL=https://your-railway-app.railway.app/api
GENERATE_SOURCEMAP=false
NODE_OPTIONS=--max_old_space_size=4096
```

### 4. Deploy Settings
- **Branch to deploy**: `main`
- **Deploy previews**: Enable for pull requests
- **Branch deploys**: Enable for development

### 5. Custom Domain (Optional)
1. Add your custom domain in Site settings > Domain management
2. Update FRONTEND_URL in Railway backend environment

## Build Commands:
- Install: `npm install --legacy-peer-deps`
- Build: `npm run build`
- Preview: `npm run start`

## Troubleshooting:
- If build fails due to peer dependencies, check that `--legacy-peer-deps` is used
- If out of memory, increase NODE_OPTIONS max_old_space_size
- For routing issues, ensure netlify.toml redirects are configured
