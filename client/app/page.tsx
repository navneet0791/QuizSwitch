"use client";
import posthog from "posthog-js";
import { useEffect, useState, useRef } from "react";

interface QuestionMetrics {
    startTime: number;
    hoverCounts: Record<string, number>;
    firstInteractionTime?: number;
}

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
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const quizStartTime = useRef(Date.now());
    const [metrics, setMetrics] = useState<QuestionMetrics[]>(
        questions.map(() => ({
            startTime: Date.now(),
            hoverCounts: {},
        }))
    );

    const handleOptionHover = (option: string) => {
        setMetrics(prevMetrics => {
            const newMetrics = [...prevMetrics];
            const questionMetrics = { ...newMetrics[currentQuestion] };
            
            // Track first interaction time if not set
            if (!questionMetrics.firstInteractionTime) {
                questionMetrics.firstInteractionTime = Date.now();
            }
            
            // Update hover counts
            questionMetrics.hoverCounts = {
                ...questionMetrics.hoverCounts,
                [option]: (questionMetrics.hoverCounts[option] || 0) + 1
            };
            
            newMetrics[currentQuestion] = questionMetrics;
            return newMetrics;
        });
    };

    const handleAnswer = (option: string) => {
        const isCorrect = option === questions[currentQuestion].answer;
        const currentQuestionMetrics = metrics[currentQuestion];
        const timeSpent = Date.now() - currentQuestionMetrics.startTime;
        const hesitationTime = currentQuestionMetrics.firstInteractionTime 
            ? currentQuestionMetrics.firstInteractionTime - currentQuestionMetrics.startTime 
            : null;

        if (isCorrect) setScore(score + 1);

        // Enhanced answer tracking
        posthog.capture("quiz_answer", {
            variant: "A",
            question_number: currentQuestion + 1,
            question: questions[currentQuestion].q,
            chosen_option: option,
            correct: isCorrect,
            time_spent_ms: timeSpent,
            hesitation_time_ms: hesitationTime,
            hover_pattern: currentQuestionMetrics.hoverCounts,
            total_hovers: Object.values(currentQuestionMetrics.hoverCounts).reduce((a, b) => a + b, 0)
        });

        if (currentQuestion + 1 < questions.length) {
            setCurrentQuestion(prev => prev + 1);
            // Update start time for next question
            setMetrics(prevMetrics => {
                const newMetrics = [...prevMetrics];
                newMetrics[currentQuestion + 1] = {
                    ...newMetrics[currentQuestion + 1],
                    startTime: Date.now()
                };
                return newMetrics;
            });
        } else {
            setFinished(true);
            const totalTime = Date.now() - quizStartTime.current;
            
            // Enhanced completion tracking
            posthog.capture("quiz_completed", {
                variant: "A",
                score: score + (isCorrect ? 1 : 0),
                total: questions.length,
                total_time_ms: totalTime,
                avg_time_per_question: totalTime / questions.length,
                question_times: metrics.map((m, i) => ({
                    question: i + 1,
                    time_spent: Date.now() - m.startTime,
                    hesitation: m.firstInteractionTime ? m.firstInteractionTime - m.startTime : null,
                    hover_patterns: m.hoverCounts
                }))
            });
        }
    };

    useEffect(() => {
        // Track detailed session start
        posthog.capture("quiz_started", {
            variant: "A",
            timestamp: quizStartTime.current,
            total_questions: questions.length
        });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
            <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8">
                {!finished ? (
                    <>
                        {/* Progress indicator */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm text-gray-600">
                                Question {currentQuestion + 1} of {questions.length}
                            </span>
                            <span className="text-sm font-medium text-indigo-600">
                                Score: {score}
                            </span>
                        </div>

                        {/* Question */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                            {questions[currentQuestion].q}
                        </h2>

                        {/* Options */}
                        <div className="space-y-3">
                            {questions[currentQuestion].options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleAnswer(option)}
                                    onMouseEnter={() => handleOptionHover(option)}
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
