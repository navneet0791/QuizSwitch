"use client";
import { useState } from "react";

const questions = [
  { q: "What is 2 + 2?", options: ["3", "4", "5"], answer: "4" },
  { q: "What is the capital of France?", options: ["London", "Paris", "Berlin"], answer: "Paris" },
  { q: "Which is a JavaScript framework?", options: ["React", "Laravel", "Django"], answer: "React" },
];

export default function QuizB() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (option: string) => {
    if (option === questions[current].answer) setScore(score + 1);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
    }
  };

  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8">
        {!finished ? (
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Question counter */}
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Question {current + 1} of {questions.length}</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                Score: {score}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-gray-800 text-center py-4">
              {questions[current].q}
            </h2>

            {/* Options */}
            <div className="grid gap-4">
              {questions[current].options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="w-full py-4 px-6 text-left text-gray-700 bg-white border-2 border-gray-100 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  <span className="text-lg">{option}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Quiz Complete!
            </h2>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-100 mb-6">
              <span className="text-4xl font-bold text-purple-600">
                {Math.round((score / questions.length) * 100)}%
              </span>
            </div>
            <p className="text-xl text-gray-600">
              You scored {score} out of {questions.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
