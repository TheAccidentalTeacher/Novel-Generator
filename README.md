# NovelForge - AI-Powered Novel Writing Platform

[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/new/template)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

**🚀 Live Demo**: [NovelForge App](https://your-app.netlify.app) | **📚 Documentation**: [View Docs](./docs/)

An intelligent AI-powered platform for writing, editing, and publishing novels with specialized genre support and advanced AI assistance.

## ✨ Features

- **🤖 AI-Powered Writing**: GPT-4 integration for premise, outline, and chapter generation
- **📖 Genre Expertise**: Specialized support for Christian Fiction, Mystery, Cozy Mystery, and more
- **✏️ Smart Editor**: Rich text editor with AI suggestions and real-time feedback
- **📊 Progress Tracking**: Word count goals, chapter progress, and writing analytics
- **🎨 Cover Generation**: DALL-E integration for professional book covers
- **📱 Responsive Design**: Beautiful interface that works on all devices

## Project Structure

```
NovelForge/
├── backend/                 # Node.js Express API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic (AI service)
│   ├── data/               # Seed data
│   └── logs/               # Application logs
├── frontend/               # React application
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
└── docs/                   # Documentation
```

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   - Set your OpenAI API key
   - Configure MongoDB URI
   - Set other required variables

5. Seed the database with genres:
   ```bash
   node data/seedGenres.js
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=mongodb://localhost:27017/novelforge

# Optional
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
```

## Development

### Running the Full Stack

1. Start MongoDB (if running locally)
2. Start the backend server: `npm run dev` in the backend directory
3. Start the frontend server: `npm start` in the frontend directory
4. Access the application at `http://localhost:3000`

### API Documentation

The backend provides RESTful APIs for:

- **Novels** (`/api/novels`) - Novel CRUD operations and generation
- **Chapters** (`/api/chapters`) - Chapter management and generation
- **Genres** (`/api/genres`) - Genre definitions and templates
- **AI** (`/api/ai`) - Direct AI service interactions
- **Covers** (`/api/covers`) - Book cover generation and management

### Database Models

- **Novel** - Main novel document with metadata, settings, and progress
- **Chapter** - Individual chapters with content and quality metrics
- **Character** - Character profiles and development arcs
- **Genre** - Genre definitions and AI prompting strategies
- **Cover** - Book cover designs and generation metadata

## Architecture

### Backend (Node.js/Express)

- **AI Service** - Handles OpenAI API interactions with specialized prompting
- **Quality Control** - Text analysis and validation
- **Genre System** - Comprehensive genre definitions and templates
- **Progress Tracking** - Novel and chapter completion monitoring

### Frontend (React)

- **Component-based** - Modular UI components with Chakra UI
- **State Management** - React Query for server state, Context for local state
- **Responsive Design** - Mobile-friendly interface
- **Real-time Updates** - Progress tracking and generation status

### AI Integration

- **GPT-4.1** for planning (premise, outline, characters)
- **GPT-4.0** for drafting (chapter generation)
- **GPT-4.1** for reviewing (quality analysis)
- **DALL-E 3** for cover generation

## Deployment

### Backend (Railway)

1. Connect your repository to Railway
2. Set environment variables
3. Deploy with automatic builds

### Frontend (Netlify)

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy with automatic builds

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions or support, please open an issue on the GitHub repository.