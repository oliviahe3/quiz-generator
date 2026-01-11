# Quiz Generator Setup Guide

This guide will help you set up the Quiz Generator application with Gemini AI integration.

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- A Google Gemini API key (get one at https://makersuite.google.com/app/apikey)

## Installation

1. **Install frontend dependencies:**
```bash
npm install
```

2. **Install backend dependencies:**
```bash
cd server
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install:all
```

## Configuration

1. **Create a `.env` file in the `server` directory:**
```bash
cd server
```

Create a file named `.env` with the following content:
```env
GEMINI_API_KEY=your_api_key_here
PORT=5000
```

Replace `your_api_key_here` with your actual Gemini API key.

## Running the Application

You need to run both the frontend and backend servers:

### Option 1: Run in separate terminals

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Option 2: Use the convenience scripts

**Backend (Terminal 1):**
```bash
npm run server:dev
```

**Frontend (Terminal 2):**
```bash
npm run dev
```

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

The frontend is configured to proxy API requests to the backend automatically.

## Troubleshooting

### "Connection failed" error
- Make sure the backend server is running on port 5000
- Check that your `.env` file exists in the `server` directory
- Verify your `GEMINI_API_KEY` is set correctly

### "GEMINI_API_KEY not found" warning
- Create a `.env` file in the `server` directory
- Add your API key: `GEMINI_API_KEY=your_key_here`
- Restart the backend server

### API errors
- Verify your Gemini API key is valid
- Check that you have API quota remaining
- Review the server console for detailed error messages

## Project Structure

```
quiz-generator/
├── src/              # Frontend React application
├── server/           # Backend Express server
│   ├── index.js     # Main server file
│   ├── package.json # Backend dependencies
│   └── .env         # Environment variables (create this)
├── package.json     # Frontend dependencies
└── vite.config.ts   # Vite configuration
```

## Development

- Frontend hot-reloads automatically when you save changes
- Backend uses nodemon for auto-reload in dev mode
- Both servers need to be running for the app to work

## Production Build

Build the frontend:
```bash
npm run build
```

The built files will be in the `build/` directory.

For production, run the backend with:
```bash
cd server
npm start
```
