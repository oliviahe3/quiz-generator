# Quiz Generator Backend Server

This is the backend server for the Quiz Generator application, which integrates with Google's Gemini AI to generate quiz questions from uploaded PDFs.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `server` directory:
```env
GEMINI_API_KEY=your_api_key_here
PORT=5000
```

3. Get your Gemini API key:
   - Visit https://makersuite.google.com/app/apikey
   - Create a new API key
   - Copy it to your `.env` file

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Health Check
- `GET /health` - Check if the server is running

### Generate Quiz
- `POST /api/generate-quiz` - Generate quiz questions from study guide text

**Request Body:**
```json
{
  "studyGuideText": "Your study guide content here...",
  "numQuestions": 5,
  "difficulty": "medium",
  "questionType": "multiple-choice"
}
```

**Response:**
```json
{
  "quiz": [
    {
      "question": "Question text",
      "type": "multiple-choice",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0,
      "explanation": "Explanation text"
    }
  ]
}
```
