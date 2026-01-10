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
  const [file, setFile] = useState<File | null>(null);
  const [studyGuideText, setStudyGuideText] = useState<string>('');
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'short-answer' | 'mixed'>('multiple-choice');

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setError('');
    
    try {
      const text = await uploadedFile.text();
      setStudyGuideText(text);
    } catch (err) {
      setError('Failed to read file. Please try again.');
      console.error('Error reading file:', err);
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
      // Mock API call - Replace this with actual Gemini API integration
      // To use real Gemini API, you'll need to:
      // 1. Set up a backend server or serverless function
      // 2. Store your GEMINI_API_KEY securely on the server
      // 3. Make the API call from the server side
      // 4. Pass numQuestions and difficulty as parameters
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

      // Mock quiz data based on study guide and selected options
      const allMultipleChoiceQuestions: QuizQuestion[] = [
        {
          question: "What is the main topic covered in this study guide?",
          type: 'multiple-choice',
          options: [
            "Introduction to the subject",
            "Advanced concepts",
            "Historical context",
            "Practical applications"
          ],
          correctAnswer: 0,
          explanation: "The study guide introduces fundamental concepts as the foundation for understanding."
        },
        {
          question: "Which key concept is emphasized in the material?",
          type: 'multiple-choice',
          options: [
            "Theoretical frameworks",
            "Memorization techniques",
            "Critical thinking",
            "All of the above"
          ],
          correctAnswer: 3,
          explanation: "Effective learning combines theory, memory strategies, and analytical skills."
        },
        {
          question: "What approach does the study guide recommend?",
          type: 'multiple-choice',
          options: [
            "Passive reading only",
            "Active engagement with material",
            "Last-minute cramming",
            "Group study exclusively"
          ],
          correctAnswer: 1,
          explanation: "Active engagement with material leads to better retention and understanding."
        },
        {
          question: "How should you apply the concepts learned?",
          type: 'multiple-choice',
          options: [
            "Through practice problems",
            "By teaching others",
            "In real-world scenarios",
            "All of the above"
          ],
          correctAnswer: 3,
          explanation: "Multiple application methods reinforce learning and deepen understanding."
        },
        {
          question: "What is the recommended study strategy?",
          type: 'multiple-choice',
          options: [
            "Spaced repetition",
            "Single marathon session",
            "Audio-only learning",
            "Skimming content"
          ],
          correctAnswer: 0,
          explanation: "Spaced repetition is proven to be the most effective method for long-term retention."
        },
        {
          question: "Why is active recall important for learning?",
          type: 'multiple-choice',
          options: [
            "It makes studying faster",
            "It strengthens memory pathways",
            "It's easier than reviewing",
            "It requires no preparation"
          ],
          correctAnswer: 1,
          explanation: "Active recall strengthens neural connections and improves long-term retention."
        },
        {
          question: "What role does sleep play in learning?",
          type: 'multiple-choice',
          options: [
            "It has no effect on learning",
            "It consolidates memories",
            "It only helps physical recovery",
            "It weakens what you learned"
          ],
          correctAnswer: 1,
          explanation: "During sleep, the brain consolidates and organizes information learned during the day."
        },
        {
          question: "How can you improve understanding of complex topics?",
          type: 'multiple-choice',
          options: [
            "Read faster",
            "Skip difficult sections",
            "Break into smaller parts",
            "Memorize without understanding"
          ],
          correctAnswer: 2,
          explanation: "Breaking complex topics into smaller, manageable parts makes them easier to understand."
        },
        {
          question: "What is the benefit of self-testing?",
          type: 'multiple-choice',
          options: [
            "It wastes study time",
            "It identifies knowledge gaps",
            "It's only for final exams",
            "It creates unnecessary stress"
          ],
          correctAnswer: 1,
          explanation: "Self-testing helps identify what you know and what needs more review."
        },
        {
          question: "Why should you vary your study environment?",
          type: 'multiple-choice',
          options: [
            "To avoid boredom only",
            "It has no real benefit",
            "It strengthens memory retrieval",
            "To impress others"
          ],
          correctAnswer: 2,
          explanation: "Varied environments create multiple retrieval cues, making recall easier in different contexts."
        }
      ];

      const allShortAnswerQuestions: QuizQuestion[] = [
        {
          question: "Define spaced repetition and explain why it's effective for learning.",
          type: 'short-answer',
          correctAnswer: "Spaced repetition is a learning technique where you review material at increasing intervals over time. It's effective because it strengthens long-term memory by leveraging the spacing effect, which improves retention better than cramming.",
          explanation: "Spaced repetition works by timing reviews just as you're about to forget information, which strengthens memory traces and leads to better long-term retention."
        },
        {
          question: "What is active recall and how does it differ from passive review?",
          type: 'short-answer',
          correctAnswer: "Active recall is retrieving information from memory without looking at notes. Unlike passive review (like rereading), it actively strengthens neural pathways and reveals what you actually know versus what you think you know.",
          explanation: "Active recall forces your brain to retrieve information, which strengthens memory pathways more effectively than passive methods like rereading or highlighting."
        },
        {
          question: "Explain the Feynman Technique in your own words.",
          type: 'short-answer',
          correctAnswer: "The Feynman Technique is a learning method where you explain a concept in simple terms as if teaching someone else. This reveals gaps in understanding and forces you to truly comprehend the material rather than just memorizing it.",
          explanation: "By explaining concepts simply, you identify what you truly understand and what needs more study, leading to deeper comprehension."
        },
        {
          question: "What is metacognition and why is it important for effective learning?",
          type: 'short-answer',
          correctAnswer: "Metacognition is thinking about your own thinking - being aware of how you learn and understand. It's important because it helps you identify effective study strategies, recognize knowledge gaps, and adjust your learning approach.",
          explanation: "Metacognition allows learners to monitor their understanding and regulate their learning strategies for better outcomes."
        },
        {
          question: "Describe the testing effect and its benefits.",
          type: 'short-answer',
          correctAnswer: "The testing effect shows that retrieval practice (self-testing) significantly enhances long-term learning compared to restudying. Testing strengthens memory and improves the ability to apply knowledge in different contexts.",
          explanation: "Self-testing not only assesses knowledge but actively strengthens it through the act of retrieval."
        },
        {
          question: "What is interleaved practice and how does it improve learning?",
          type: 'short-answer',
          correctAnswer: "Interleaved practice is mixing different topics or types of problems during study sessions rather than focusing on one at a time. It improves learning by forcing the brain to differentiate between concepts and strengthens long-term retention.",
          explanation: "Mixing topics requires more mental effort but leads to better discrimination between concepts and stronger retention."
        },
        {
          question: "Explain how elaboration enhances memory and understanding.",
          type: 'short-answer',
          correctAnswer: "Elaboration involves connecting new information to existing knowledge by creating meaningful associations, examples, or explanations. It enhances memory by building a richer network of connections in the brain, making information easier to recall and understand.",
          explanation: "Creating connections between new and existing knowledge creates multiple retrieval pathways and deepens understanding."
        },
        {
          question: "Why is distributed practice more effective than massed practice (cramming)?",
          type: 'short-answer',
          correctAnswer: "Distributed practice spreads learning over time, which allows for better memory consolidation and retention. Massed practice (cramming) may work for short-term recall but fails to create strong long-term memories because the brain needs time between sessions to consolidate information.",
          explanation: "The spacing between study sessions allows the brain to consolidate memories, leading to much stronger long-term retention than cramming."
        },
        {
          question: "How do concept maps support learning and understanding?",
          type: 'short-answer',
          correctAnswer: "Concept maps visually represent relationships between ideas, showing how concepts connect and relate to each other. They support learning by helping organize information, reveal patterns, and create a clear mental structure for complex topics.",
          explanation: "Visual organization of information helps learners see the big picture and understand how individual concepts fit together."
        },
        {
          question: "Why does teaching others help you learn better?",
          type: 'short-answer',
          correctAnswer: "Teaching others forces you to organize, articulate, and simplify your knowledge, which reveals gaps in understanding. It requires deep comprehension rather than surface-level memorization, and explaining concepts reinforces your own learning.",
          explanation: "The process of teaching requires true understanding and helps consolidate knowledge through active explanation and answering questions."
        }
      ];

      let mockQuiz: QuizQuestion[];
      
      if (questionType === 'multiple-choice') {
        mockQuiz = allMultipleChoiceQuestions.slice(0, Math.min(numQuestions, allMultipleChoiceQuestions.length));
      } else if (questionType === 'short-answer') {
        mockQuiz = allShortAnswerQuestions.slice(0, Math.min(numQuestions, allShortAnswerQuestions.length));
      } else {
        // Mixed: alternate between types
        const mixedQuestions: QuizQuestion[] = [];
        const mcCount = Math.ceil(numQuestions / 2);
        const saCount = Math.floor(numQuestions / 2);
        
        for (let i = 0; i < numQuestions; i++) {
          if (i % 2 === 0 && mixedQuestions.length < mcCount && i / 2 < allMultipleChoiceQuestions.length) {
            mixedQuestions.push(allMultipleChoiceQuestions[i / 2]);
          } else if (i % 2 === 1 && Math.floor(i / 2) < allShortAnswerQuestions.length) {
            mixedQuestions.push(allShortAnswerQuestions[Math.floor(i / 2)]);
          }
        }
        mockQuiz = mixedQuestions;
      }

      setQuiz(mockQuiz);
    } catch (err) {
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setFile(null);
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
            <FileUpload onFileUpload={handleFileUpload} file={file} />

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
                <p className="text-sm text-red-600">{error}</p>
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

            {/* API Integration Note */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> This demo uses mock quiz data. To integrate with the real Gemini API, 
                you'll need to set up a backend server with your API key stored securely.
              </p>
            </div>
          </div>
        ) : (
          <QuizDisplay quiz={quiz} onReset={resetQuiz} />
        )}
      </div>
    </div>
  );
}