"use client";
import posthog from "posthog-js";
import { useEffect, useState } from "react";

const questions = [
    { q: "What is 2 + 2?", options: ["3", "4", "5"], answer: "4" },
    {
        q: "What is the capital of France?",
        options: ["London", "Paris", "Berlin"],
        answer: "Paris",
    },
    {
        q: "Which is a JavaScript framework?",
        options: ["React", "Laravel", "Django"],
        answer: "React",
    },
];

export default function QuizA() {
    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    const handleAnswer = (option: string) => {
        const isCorrect = option === questions[current].answer;

        if (isCorrect) setScore(score + 1);

        // 🔥 Track answer event
        posthog.capture("quiz_answer", {
            question: questions[current].q,
            chosen_option: option,
            correct: isCorrect,
        });

        if (current + 1 < questions.length) {
            setCurrent(current + 1);
        } else {
            setFinished(true);
            // 🔥 Track quiz completion
            posthog.capture("quiz_completed", {
                score: score + (isCorrect ? 1 : 0),
                total: questions.length,
            });
        }
    };

    useEffect(() => {
        posthog.capture("$pageview");
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
            <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8">
                {!finished ? (
                    <>
                        {/* Progress indicator */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm text-gray-600">
                                Question {current + 1} of {questions.length}
                            </span>
                            <span className="text-sm font-medium text-indigo-600">
                                Score: {score}
                            </span>
                        </div>

                        {/* Question */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                            {questions[current].q}
                        </h2>

                        {/* Options */}
                        <div className="space-y-3">
                            {questions[current].options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleAnswer(option)}
                                    className="w-full py-3 px-4 text-lg text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Quiz Complete!
                        </h2>
                        <div className="text-5xl font-bold text-indigo-600 mb-6">
                            {score}/{questions.length}
                        </div>
                        <p className="text-gray-600">
                            You got {score} out of {questions.length} questions correct
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
