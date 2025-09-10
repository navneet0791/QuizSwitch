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
        posthog.capture("$pageview"); // still track pageview
    }, []);

    return (
        <div
            style={{ maxWidth: 500, margin: "2rem auto", textAlign: "center" }}
        >
            {!finished ? (
                <>
                    <h2>{questions[current].q}</h2>
                    <div style={{ margin: "1rem 0" }}>
                        {questions[current].options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                style={{
                                    display: "block",
                                    margin: "0.5rem auto",
                                    padding: "0.5rem 1rem",
                                }}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <h2>
                    Your score: {score}/{questions.length}
                </h2>
            )}
        </div>
    );
}
