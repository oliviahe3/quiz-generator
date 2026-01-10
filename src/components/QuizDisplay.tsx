import { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react';

interface QuizQuestion {
  question: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
}

interface QuizDisplayProps {
  quiz: QuizQuestion[];
  onReset: () => void;
}

export function QuizDisplay({ quiz, onReset }: QuizDisplayProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | string | null)[]>(
    Array(quiz.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [shortAnswerText, setShortAnswerText] = useState('');

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResults || showFeedback) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleShortAnswerSubmit = () => {
    if (showResults || showFeedback || !shortAnswerText.trim()) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = shortAnswerText.trim();
    setSelectedAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowFeedback(false);
      // Load the answer for the next question if it's a short answer
      const nextQ = quiz[currentQuestion + 1];
      if (nextQ.type === 'short-answer' && typeof selectedAnswers[currentQuestion + 1] === 'string') {
        setShortAnswerText(selectedAnswers[currentQuestion + 1] as string);
      } else {
        setShortAnswerText('');
      }
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowFeedback(selectedAnswers[currentQuestion - 1] !== null);
      // Load the answer for the previous question if it's a short answer
      const prevQ = quiz[currentQuestion - 1];
      if (prevQ.type === 'short-answer' && typeof selectedAnswers[currentQuestion - 1] === 'string') {
        setShortAnswerText(selectedAnswers[currentQuestion - 1] as string);
      } else {
        setShortAnswerText('');
      }
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quiz[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const currentQ = quiz[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion];
  const allAnswered = selectedAnswers.every(answer => answer !== null);

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / quiz.length) * 100);

    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl mb-2 text-gray-900">Quiz Complete!</h2>
          <p className="text-gray-600">Here's how you did</p>
        </div>

        <div className="bg-indigo-50 rounded-lg p-6 mb-8 text-center">
          <div className="text-5xl mb-2 text-indigo-600">{percentage}%</div>
          <p className="text-gray-700">
            You got <span className="font-semibold">{score}</span> out of{' '}
            <span className="font-semibold">{quiz.length}</span> questions correct
          </p>
        </div>

        <div className="space-y-6">
          {quiz.map((question, qIndex) => {
            const userAnswer = selectedAnswers[qIndex];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <div
                key={qIndex}
                className={`border-2 rounded-lg p-4 ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">
                      {qIndex + 1}. {question.question}
                    </p>
                    
                    {question.type === 'multiple-choice' && question.options ? (
                      <>
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Your answer:</span>{' '}
                          {question.options[userAnswer as number]}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-gray-700 mb-2">
                            <span className="font-medium">Correct answer:</span>{' '}
                            {question.options[question.correctAnswer as number]}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="mb-2">
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Your answer:</span>
                          </p>
                          <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                            {userAnswer as string}
                          </p>
                        </div>
                        {!isCorrect && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-700 mb-1">
                              <span className="font-medium">Model answer:</span>
                            </p>
                            <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                              {question.correctAnswer as string}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    
                    <p className="text-sm text-gray-600 italic">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onReset}
          className="w-full mt-8 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Create New Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Question {currentQuestion + 1} of {quiz.length}
          </span>
          <span>{Math.round(((currentQuestion + 1) / quiz.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-2xl mb-6 text-gray-900">{currentQ.question}</h2>

        {currentQ.type === 'multiple-choice' && currentQ.options ? (
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQ.correctAnswer;
              const showCorrectAnswer = showFeedback && isCorrect;
              const showIncorrectAnswer = showFeedback && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showCorrectAnswer
                      ? 'border-green-600 bg-green-50'
                      : showIncorrectAnswer
                      ? 'border-red-600 bg-red-50'
                      : isSelected
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 bg-white'
                  } ${showFeedback ? 'cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        showCorrectAnswer
                          ? 'border-green-600 bg-green-600'
                          : showIncorrectAnswer
                          ? 'border-red-600 bg-red-600'
                          : isSelected
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {showCorrectAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      )}
                      {showIncorrectAnswer && (
                        <XCircle className="w-5 h-5 text-white" />
                      )}
                      {!showFeedback && isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <textarea
              value={shortAnswerText}
              onChange={(e) => setShortAnswerText(e.target.value)}
              disabled={showFeedback}
              placeholder="Type your answer here..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg min-h-32 resize-y focus:border-indigo-600 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900"
            />
            {!showFeedback && (
              <button
                onClick={handleShortAnswerSubmit}
                disabled={!shortAnswerText.trim()}
                className="mt-3 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Submit Answer
              </button>
            )}
          </div>
        )}

        {/* Instant Feedback */}
        {showFeedback && selectedAnswer !== null && (
          <div
            className={`mt-4 p-4 rounded-lg border-2 ${
              selectedAnswer === currentQ.correctAnswer
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-start gap-3">
              {selectedAnswer === currentQ.correctAnswer ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-1">
                  {selectedAnswer === currentQ.correctAnswer ? 'Correct!' : 'Incorrect'}
                </p>
                {currentQ.type === 'short-answer' && selectedAnswer !== currentQ.correctAnswer && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">Model answer:</span>
                    </p>
                    <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                      {currentQ.correctAnswer}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-700">{currentQ.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {currentQuestion < quiz.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="flex-1 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="flex-1 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Submit Quiz
          </button>
        )}
      </div>

      {/* Answer Status */}
      <div className="mt-6 flex gap-2 flex-wrap">
        {quiz.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestion(index)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              selectedAnswers[index] !== null
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-600'
            } ${currentQuestion === index ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}