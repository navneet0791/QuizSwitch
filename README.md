
#QuizSwitch
Project Summary

This project is an A/B testing experiment built around an interactive online quiz application. The goal is to understand how question clarity and tracking features influence user engagement and quiz completion rates.

Two versions of the quiz interface were developed using React + Next.js:

Version A (Baseline):

Includes an End Quiz button.

Does not display progress indicators or question tracking.

Users only see one question at a time with no explicit indication of total length.

Version B (Variant):

Also includes an End Quiz button.

Adds a progress bar and question counter (e.g., “Question 3 of 10”).

Implements detailed tracking of user interactions:

Time spent per question

Hover and focus behavior on answer choices

Hesitation time before answering

Completion times and answer patterns

System Architecture

Frontend: React with Next.js

Styling: Tailwind CSS for a clean, responsive UI

Analytics & Tracking: PostHog for event capture and user behavior analysis

Data Collection: Automated event tracking per interaction (answering, hovering, focusing, quiz start/complete)

A/B Test Hypothesis

The experiment tests whether clarity about quiz progress (via question tracking + progress bar) increases:

Completion rates

Engagement levels (reduced drop-off mid-quiz)

Interaction depth (time spent, hover/focus patterns)

If the hypothesis is correct, Version B should show higher completion percentages and more consistent user engagement compared to Version A.
