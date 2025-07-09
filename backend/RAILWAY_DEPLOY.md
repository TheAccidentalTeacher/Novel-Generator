# Railway Deployment Configuration for NovelForge Backend

## Environment Variables Required:

### Database
MONGODB_URI=your_mongodb_connection_string_here

### OpenAI Integration
OPENAI_API_KEY=your_openai_api_key_here

### Security
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

### Application Settings
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-netlify-app-name.netlify.app

### Optional Settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info

## Deployment Notes:
1. Set up MongoDB Atlas or Railway PostgreSQL addon
2. Add OpenAI API key from your OpenAI account
3. Generate a secure JWT secret (at least 64 characters)
4. Update FRONTEND_URL after Netlify deployment
5. Run seed script after first deployment: `npm run seed`

## Commands:
- Deploy: `railway up`
- Logs: `railway logs`
- Shell: `railway shell`
