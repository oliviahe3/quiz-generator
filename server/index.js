const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini AI
let genAI;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Checking API key...', apiKey ? `Found key (length: ${apiKey.length})` : 'No key found');
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.warn('⚠️  Warning: GEMINI_API_KEY not found or is placeholder value');
    console.warn('   Quiz generation will not work until a valid API key is set.');
    genAI = null; // Explicitly set to null
  } else {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('✓ Gemini AI initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Gemini AI:', error);
  genAI = null;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Quiz Generator API is running' });
});

// Quiz generation endpoint
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { studyGuideText, numQuestions, difficulty, questionType } = req.body;

    // Validation
    if (!studyGuideText || studyGuideText.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Study guide text is required' 
      });
    }

    if (!genAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      console.log('genAI is null. API key check:', apiKey ? `Key exists (${apiKey.length} chars)` : 'No key');
      if (!apiKey || apiKey === 'your_api_key_here') {
        console.log('Returning API key not configured error');
        return res.status(500).json({ 
          error: 'Gemini API key is not configured',
          details: 'Please set a valid GEMINI_API_KEY in the server/.env file. Get your API key from https://makersuite.google.com/app/apikey' 
        });
      }
      return res.status(500).json({ 
        error: 'Gemini API initialization failed',
        details: 'Please check your GEMINI_API_KEY in the server/.env file' 
      });
    }

    if (!numQuestions || numQuestions < 1 || numQuestions > 20) {
      return res.status(400).json({ 
        error: 'Number of questions must be between 1 and 20' 
      });
    }

    // Truncate study guide if too long (Gemini has token limits)
    const maxTextLength = 100000; // Approximate character limit
    const truncatedText = studyGuideText.length > maxTextLength 
      ? studyGuideText.substring(0, maxTextLength) + '\n\n[Text truncated due to length...]'
      : studyGuideText;

    // Build the prompt based on question type
    let prompt = `You are an expert quiz generator. Generate ${numQuestions} quiz questions based on the following study guide material.

Study Guide Content:
${truncatedText}

Requirements:
- Generate exactly ${numQuestions} questions
- Difficulty level: ${difficulty}
- Question type: ${questionType === 'mixed' ? 'Mix of multiple-choice and short-answer questions' : questionType === 'multiple-choice' ? 'All multiple-choice questions' : 'All short-answer questions'}
- For multiple-choice questions: Provide exactly 4 options, with one correct answer
- For short-answer questions: Provide a model answer
- Each question must have a clear explanation
- Questions should test understanding of key concepts from the study guide
- Make questions relevant to the actual content provided

Please format your response as a JSON array with the following structure:
[
  {
    "question": "Question text here",
    "type": "multiple-choice" or "short-answer",
    "options": ["option1", "option2", "option3", "option4"] (only for multiple-choice),
    "correctAnswer": 0 (index for multiple-choice) or "answer text" (for short-answer),
    "explanation": "Explanation of the answer"
  },
  ...
]

Return ONLY the JSON array, no additional text or markdown formatting.`;

    // Get the model - use gemini-2.0-flash (latest available model)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    console.log(`Generating quiz: ${numQuestions} questions, ${difficulty} difficulty, ${questionType} type`);
    console.log(`Study guide length: ${studyGuideText.length} characters`);

    // Generate quiz
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log(`Received response from Gemini (${text.length} characters)`);

    // Parse the JSON response
    let quizData;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }
      
      quizData = JSON.parse(cleanedText);
      
      // Validate the structure
      if (!Array.isArray(quizData)) {
        throw new Error('Response is not an array');
      }

      // Ensure we have the right number of questions
      if (quizData.length !== numQuestions) {
        console.warn(`Expected ${numQuestions} questions, got ${quizData.length}`);
        // Take only the requested number
        quizData = quizData.slice(0, numQuestions);
      }

      // Validate each question
      quizData = quizData.map((q, index) => {
        if (!q.question || !q.type || !q.explanation) {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }
        
        if (q.type === 'multiple-choice') {
          if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
            throw new Error(`Question ${index + 1} (multiple-choice) must have exactly 4 options`);
          }
          if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= 4) {
            throw new Error(`Question ${index + 1} (multiple-choice) must have correctAnswer as a number 0-3`);
          }
        } else if (q.type === 'short-answer') {
          if (typeof q.correctAnswer !== 'string') {
            throw new Error(`Question ${index + 1} (short-answer) must have correctAnswer as a string`);
          }
        }
        
        return q;
      });

      res.json({ quiz: quizData });
    } catch (parseError) {
      console.error('Error parsing quiz response:', parseError);
      console.error('Raw response:', text);
      return res.status(500).json({ 
        error: 'Failed to parse quiz response from AI. Please try again.',
        details: parseError.message 
      });
    }

  } catch (error) {
    console.error('Error generating quiz:', error);
    console.error('Error stack:', error.stack);
    let errorMessage = 'Failed to generate quiz';
    let errorDetails = error.message || 'Unknown error';
    
    // Provide more specific error messages
    if (error.message && (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid'))) {
      errorMessage = 'Invalid Gemini API key';
      errorDetails = 'Please check your GEMINI_API_KEY in the server/.env file. Get your key from https://makersuite.google.com/app/apikey';
    } else if (error.message && (error.message.includes('quota') || error.message.includes('QUOTA') || error.message.includes('429'))) {
      errorMessage = 'API quota exceeded';
      errorDetails = 'You have exceeded your Gemini API quota. Please check your usage limits.';
    } else if (error.message && error.message.includes('safety')) {
      errorMessage = 'Content safety filter triggered';
      errorDetails = 'The content may have triggered safety filters. Please try with different content.';
    } else if (error.message && error.message.includes('model')) {
      errorMessage = 'Model error';
      errorDetails = `Gemini API model error: ${error.message}. Try using 'gemini-1.5-flash' or 'gemini-1.5-pro' instead.`;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails,
      fullError: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn('\n⚠️  WARNING: GEMINI_API_KEY not set. Quiz generation will not work.');
    console.warn('   Please create a .env file with: GEMINI_API_KEY=your_api_key_here\n');
  }
});
