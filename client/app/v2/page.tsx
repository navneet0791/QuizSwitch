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
    <div style={{ maxWidth: 500, margin: "2rem auto", textAlign: "center" }}>
      {!finished ? (
        <>
          {/* Progress bar */}
          <div style={{ height: "10px", background: "#ddd", borderRadius: "5px", marginBottom: "1rem" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "#4caf50",
                borderRadius: "5px",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          <h2>{questions[current].q}</h2>
          <div style={{ margin: "1rem 0" }}>
            {questions[current].options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                style={{ display: "block", margin: "0.5rem auto", padding: "0.5rem 1rem" }}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      ) : (
        <h2>Your score: {score}/{questions.length}</h2>
      )}
    </div>
  );
}
