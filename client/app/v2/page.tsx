"use client";
import posthog from "posthog-js";
import { questions } from "@/utils/array";
import { useState, useRef, useEffect } from "react";

interface QuestionMetrics {
    startTime: number;
    hoverCounts: Record<string, number>;
    firstInteractionTime?: number;
    focusTime?: number;
}

export default function QuizB() {
    const [currentQuestion, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const quizStartTime = useRef(Date.now());
    const [metrics, setMetrics] = useState<QuestionMetrics[]>(
        questions.map(() => ({
            startTime: Date.now(),
            hoverCounts: {},
        }))
    );
    const [focusedOption, setFocusedOption] = useState<string | null>(null);

    const handleOptionFocus = (option: string) => {
        setFocusedOption(option);
        setMetrics((prevMetrics) => {
            const newMetrics = [...prevMetrics];
            const questionMetrics = { ...newMetrics[currentQuestion] };

            if (!questionMetrics.firstInteractionTime) {
                questionMetrics.firstInteractionTime = Date.now();
            }

            questionMetrics.focusTime = Date.now();
            newMetrics[currentQuestion] = questionMetrics;
            return newMetrics;
        });
    };

    const handleOptionHover = (option: string) => {
        setMetrics((prevMetrics) => {
            const newMetrics = [...prevMetrics];
            const questionMetrics = { ...newMetrics[currentQuestion] };

            if (!questionMetrics.firstInteractionTime) {
                questionMetrics.firstInteractionTime = Date.now();
            }

            questionMetrics.hoverCounts = {
                ...questionMetrics.hoverCounts,
                [option]: (questionMetrics.hoverCounts[option] || 0) + 1,
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
            ? currentQuestionMetrics.firstInteractionTime -
              currentQuestionMetrics.startTime
            : null;
        const focusToClickTime = currentQuestionMetrics.focusTime
            ? Date.now() - currentQuestionMetrics.focusTime
            : null;

        if (isCorrect) setScore(score + 1);

        // Enhanced answer tracking for variant B
        posthog.capture("quiz_answer", {
            variant: "B",
            question_number: currentQuestion + 1,
            question: questions[currentQuestion].q,
            chosen_option: option,
            correct: isCorrect,
            time_spent_ms: timeSpent,
            hesitation_time_ms: hesitationTime,
            focus_to_click_time_ms: focusToClickTime,
            hover_pattern: currentQuestionMetrics.hoverCounts,
            total_hovers: Object.values(
                currentQuestionMetrics.hoverCounts
            ).reduce((a, b) => a + b, 0),
        });

        if (currentQuestion + 1 < questions.length) {
            setCurrent((prev) => prev + 1);
            setFocusedOption(null);
            setMetrics((prevMetrics) => {
                const newMetrics = [...prevMetrics];
                newMetrics[currentQuestion + 1] = {
                    ...newMetrics[currentQuestion + 1],
                    startTime: Date.now(),
                };
                return newMetrics;
            });
        } else {
            finishQuiz(isCorrect);
        }
    };

    const handleEndQuiz = () => {
        setFinished(true);
        const totalTime = Date.now() - quizStartTime.current;

        posthog.capture("quiz_ended", {
            variant: "B",
            score: score,
            total_answered: currentQuestion + 1,
            total_questions: questions.length,
            total_time_ms: totalTime,
            avg_time_per_question: totalTime / (currentQuestion + 1),
        });
    };

    const finishQuiz = (answeredCorrectly: boolean) => {
        setFinished(true);
        const totalTime = Date.now() - quizStartTime.current;

        posthog.capture("quiz_completed", {
            variant: "B",
            score: score + (answeredCorrectly ? 1 : 0),
            total: questions.length,
            total_time_ms: totalTime,
            avg_time_per_question: totalTime / questions.length,
            question_times: metrics.map((m, i) => ({
                question: i + 1,
                time_spent: Date.now() - m.startTime,
                hesitation: m.firstInteractionTime
                    ? m.firstInteractionTime - m.startTime
                    : null,
                focus_patterns: m.focusTime ? Date.now() - m.focusTime : null,
                hover_patterns: m.hoverCounts,
            })),
        });
    };

    useEffect(() => {
        // Track detailed session start for variant B
        posthog.capture("quiz_started", {
            variant: "B",
            timestamp: quizStartTime.current,
            total_questions: questions.length,
        });
    }, []);

    const progress = ((currentQuestion + 1) / questions.length) * 100;

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
                            <span>
                                Question {currentQuestion + 1} of{" "}
                                {questions.length}
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                                Score: {score}
                            </span>
                        </div>

                        {/* Question */}
                        <h2 className="text-2xl font-bold text-gray-800 text-center py-4">
                            {questions[currentQuestion].q}
                        </h2>

                        {/* Options */}
                        <div className="grid gap-4">
                            {questions[currentQuestion].options.map(
                                (option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleAnswer(option)}
                                        onMouseEnter={() =>
                                            handleOptionHover(option)
                                        }
                                        onFocus={() =>
                                            handleOptionFocus(option)
                                        }
                                        className={`w-full py-4 px-6 text-left text-gray-700 bg-white border-2 
                                        ${
                                            focusedOption === option
                                                ? "border-purple-500 bg-purple-50"
                                                : "border-gray-100"
                                        } 
                                        rounded-xl hover:border-purple-500 hover:bg-purple-50 
                                        transition-all duration-200 focus:outline-none focus:ring-2 
                                        focus:ring-purple-500 focus:ring-offset-2`}
                                    >
                                        <span className="text-lg">
                                            {option}
                                        </span>
                                    </button>
                                )
                            )}
                        </div>

                        {/* End Quiz Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleEndQuiz}
                                className="py-2 px-6 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                End Quiz
                            </button>
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
