import { useState } from 'react';
import { Upload, FileText, Brain, Loader2 } from 'lucide-react';
import { QuizDisplay } from './components/QuizDisplay';
import { FileUpload } from './components/FileUpload';

interface QuizQuestion {
  question: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
}

export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [studyGuideText, setStudyGuideText] = useState<string>('');
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const [error, setError] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'short-answer' | 'mixed'>('multiple-choice');

  // Initialize PDF.js worker once - set globally
  const initializePdfJs = async () => {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      const version = pdfjsLib.version || '5.4.530';
      
      // Set worker source globally - must be set before any PDF operations
      // Try .mjs first (newer format), fallback to .js if needed
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
      }
      
      console.log('PDF.js initialized, version:', version);
      console.log('PDF.js worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
      
      return pdfjsLib;
    } catch (err) {
      console.error('Failed to load PDF.js:', err);
      throw new Error('Failed to initialize PDF.js. Please check your internet connection and refresh the page.');
    }
  };

  const extractTextFromPdf = async (file: File, pdfjsLib: any): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0, // Suppress warnings
        useSystemFonts: true
      });
      
      const pdf = await loadingTask.promise;
      
      // Extract text from all pages
      const textParts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Extract text items and join them
          const pageText = textContent.items
            .map((item: any) => {
              // Handle both string and text items
              if (typeof item === 'string') {
                return item;
              }
              return item.str || '';
            })
            .filter((text: string) => text.trim().length > 0)
            .join(' ');
          
          if (pageText.trim()) {
            textParts.push(pageText);
          }
        } catch (pageErr) {
          console.warn(`Error reading page ${i} of ${file.name}:`, pageErr);
          // Continue with other pages
        }
      }
      
      if (textParts.length === 0) {
        throw new Error(`No text could be extracted from ${file.name}. The PDF might be image-based or encrypted.`);
      }
      
      return textParts.join('\n\n');
    } catch (err: any) {
      console.error(`Error extracting text from PDF ${file.name}:`, err);
      const errorMessage = err.message || 'Unknown error';
      throw new Error(`Failed to read PDF ${file.name}: ${errorMessage}`);
    }
  };

  const handleFileUpload = async (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    setError('');
    setProcessingFile(true);
    
    try {
      const textParts: string[] = [];
      let pdfjsLib: any = null;

      // Process all files
      for (const file of uploadedFiles) {
        try {
          let fileText = '';
          
          // Check if it's a PDF file
          if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            // Initialize PDF.js if not already done
            if (!pdfjsLib) {
              console.log('Initializing PDF.js...');
              pdfjsLib = await initializePdfJs();
              console.log('PDF.js initialized, worker:', pdfjsLib.GlobalWorkerOptions.workerSrc);
            }
            
            console.log(`Extracting text from PDF: ${file.name}`);
            // Extract text from PDF
            fileText = await extractTextFromPdf(file, pdfjsLib);
            console.log(`Extracted ${fileText.length} characters from ${file.name}`);
          } else {
            // Handle text files (.txt, .md)
            fileText = await file.text();
          }
          
          if (fileText.trim()) {
            textParts.push(`=== ${file.name} ===\n\n${fileText}`);
          } else {
            console.warn(`No text extracted from ${file.name}`);
          }
        } catch (fileErr: any) {
          console.error(`Error processing file ${file.name}:`, fileErr);
          // Continue with other files even if one fails
          const errorMsg = fileErr.message || 'Unknown error';
          textParts.push(`=== ${file.name} ===\n\n[Error: ${errorMsg}]`);
        }
      }
      
      if (textParts.length === 0) {
        throw new Error('No text could be extracted from any of the uploaded files.');
      }
      
      const combinedText = textParts.join('\n\n---\n\n');
      setStudyGuideText(combinedText);
      console.log(`Successfully processed ${textParts.length} file(s), total text length: ${combinedText.length}`);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to read files. Please try again.';
      setError(errorMsg);
      console.error('Error reading files:', err);
    } finally {
      setProcessingFile(false);
    }
  };

  const handleTextInput = (text: string) => {
    setStudyGuideText(text);
    setError('');
  };

  const generateQuiz = async () => {
    if (!studyGuideText) {
      setError('Please upload a study guide first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call the backend API to generate quiz using Gemini AI
      // Use Vite proxy (relative path) which routes /api/* to http://localhost:5000
      const apiEndpoint = '/api/generate-quiz';
      
      console.log('Calling API endpoint:', apiEndpoint);
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studyGuideText,
          numQuestions,
          difficulty,
          questionType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMsg = errorData.error || `Server error: ${response.status}`;
        const details = errorData.details ? ` (${errorData.details})` : '';
        throw new Error(errorMsg + details);
      }

      const data = await response.json();
      
      if (!data.quiz || !Array.isArray(data.quiz)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      console.log(`Successfully generated ${data.quiz.length} quiz questions`);
      setQuiz(data.quiz);
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      let errorMessage = err.message || 'Failed to generate quiz.';
      
      // Provide more specific error messages
      if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = 'Cannot connect to the server. Please make sure the backend server is running on port 5000. Check the backend terminal window for any errors.';
      } else if (errorMessage.includes('GEMINI_API_KEY') || errorMessage.includes('API key') || errorMessage.includes('not configured')) {
        errorMessage = 'Gemini API key is not configured. Please set a valid GEMINI_API_KEY in the server/.env file.';
      } else if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid API key')) {
        errorMessage = 'Invalid Gemini API key. Please check your API key in server/.env file.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setFiles([]);
    setStudyGuideText('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl mb-2 text-gray-900">AI Quiz Generator</h1>
          <p className="text-gray-600">Upload your study guide and get an AI-generated practice quiz</p>
        </div>

        {!quiz ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* File Upload Section */}
            {processingFile ? (
              <div className="border-2 border-indigo-200 bg-indigo-50 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  <p className="text-gray-700">Processing {files.length} file{files.length > 1 ? 's' : ''}...</p>
                </div>
              </div>
            ) : (
              <FileUpload onFileUpload={handleFileUpload} files={files} />
            )}

            {/* Study Guide Preview */}
            {studyGuideText && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Study Guide Preview</h3>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{studyGuideText}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {studyGuideText.length} characters
                </p>
              </div>
            )}

            {/* Quiz Options */}
            {studyGuideText && (
              <div className="mt-6 space-y-6">
                {/* Number of Questions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        onClick={() => setNumQuestions(num)}
                        className={`py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                          numQuestions === num
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'easy', label: 'Easy', desc: 'Basic concepts' },
                      { value: 'medium', label: 'Medium', desc: 'Moderate challenge' },
                      { value: 'hard', label: 'Hard', desc: 'Advanced thinking' }
                    ].map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setDifficulty(level.value as 'easy' | 'medium' | 'hard')}
                        className={`py-3 px-4 rounded-lg border-2 text-left transition-all ${
                          difficulty === level.value
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-indigo-300'
                        }`}
                      >
                        <div className={`font-medium ${
                          difficulty === level.value ? 'text-indigo-700' : 'text-gray-900'
                        }`}>
                          {level.label}
                        </div>
                        <div className={`text-xs mt-0.5 ${
                          difficulty === level.value ? 'text-indigo-600' : 'text-gray-500'
                        }`}>
                          {level.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'multiple-choice', label: 'Multiple Choice' },
                      { value: 'short-answer', label: 'Short Answer' },
                      { value: 'mixed', label: 'Mixed' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setQuestionType(type.value as 'multiple-choice' | 'short-answer' | 'mixed')}
                        className={`py-3 px-4 rounded-lg border-2 text-left transition-all ${
                          questionType === type.value
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-indigo-300'
                        }`}
                      >
                        <div className={`font-medium ${
                          questionType === type.value ? 'text-indigo-700' : 'text-gray-900'
                        }`}>
                          {type.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium mb-2">{error}</p>
                {error.includes('GEMINI_API_KEY') && (
                  <div className="mt-2 text-xs text-red-700">
                    <p className="mb-1">To fix this:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">https://makersuite.google.com/app/apikey</a></li>
                      <li>Open <code className="bg-red-100 px-1 rounded">server/.env</code> file</li>
                      <li>Replace <code className="bg-red-100 px-1 rounded">your_api_key_here</code> with your actual API key</li>
                      <li>Restart the backend server</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateQuiz}
              disabled={!studyGuideText || loading}
              className="w-full mt-6 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Generate Quiz with AI
                </>
              )}
            </button>

          </div>
        ) : (
          <QuizDisplay quiz={quiz} onReset={resetQuiz} />
        )}
      </div>
    </div>
  );
}