import React from 'react';

  export default function QuizDisplay({ quizData, onRetry }) {
    if (!quizData || quizData.length === 0) {
      return (
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-xl font-bold text-red-800">Generation Failed</h3>
          <p className="mt-2 text-red-600">
            Oops! The AI couldn't generate a quiz. This can happen sometimes.
          </p>
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Your AI-Generated Quiz!</h2>
            <p className="mt-2 text-gray-600">Review the questions below. You'll be able to edit them soon.</p>
        </div>
        {quizData.map((question, index) => (
          <div key={index} className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <p className="font-semibold text-lg text-gray-800 mb-4">
              {index + 1}. {question.question}
            </p>
            <div className="space-y-2">
              {question.options.map((option, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    option === question.correct_answer
                      ? 'bg-green-100 border-green-300 text-green-800 font-semibold'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        ))}
         <div className="text-center mt-8">
            <button
                onClick={onRetry}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
                Generate Another Quiz
            </button>
        </div>
      </div>
    );
  }