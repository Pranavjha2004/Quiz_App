import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import he from "he";

const categoryMap = {
  9: "General",
  17: "Science",
  23: "History",
  21: "Sports",
};

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, difficulty, category, questions, sessionToken } = location.state || {};
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [disableButtons, setDisableButtons] = useState(false);

  console.log("Quiz.jsx location.state:", location.state);

  // Shuffle answers
  const getShuffledAnswers = (question) => {
    const answers = [
      ...question.incorrect_answers.map((ans) => he.decode(ans)),
      he.decode(question.correct_answer),
    ];
    return answers.sort(() => Math.random() - 0.5);
  };

  // Handle answer selection
  const handleAnswer = (answer) => {
    if (disableButtons) return;

    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = he.decode(currentQuestion.correct_answer);
    const answerIsCorrect = answer === correctAnswer;

    setSelectedAnswer(answer);
    setIsCorrect(answerIsCorrect);
    setDisableButtons(true);

    setUserAnswers([
      ...userAnswers,
      {
        question: he.decode(currentQuestion.question),
        selectedAnswer: answer,
        correctAnswer,
        isCorrect: answerIsCorrect,
      },
    ]);

    if (answerIsCorrect) {
      setScore(score + 1);
    }

    // Move to next question or complete quiz after 1-second delay
    setTimeout(() => {
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setDisableButtons(false);
      } else {
        setQuizCompleted(true);
      }
    }, 1000);
  };

  // Restart quiz
  const restartQuiz = () => {
    navigate("/");
  };

  // Handle empty questions
  if (!questions || questions.length === 0) {
    return (
      <div className="w-full min-h-screen bg-zinc-900 text-white font-poppins">
        <h1 className="text-3xl sm:text-4xl p-10">
          Welcome,
          <br />
          <span className="font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
            {name || "Guest"}
          </span>
        </h1>
        <p className="px-10 text-lg">No questions available. Please try a different category or difficulty.</p>
        <button
          onClick={restartQuiz}
          className="mx-10 mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-md shadow-md hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Display results
  if (quizCompleted) {
    return (
      <div className="w-full min-h-screen bg-zinc-900 text-white font-poppins">
        <h1 className="text-3xl sm:text-4xl p-10">
          Quiz Results,
          <br />
          <span className="font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
            {name || "Guest"}
          </span>
        </h1>
        <div className="px-10 max-w-2xl mx-auto">
          <p className="mb-2 text-lg">
            <strong>Difficulty:</strong> {difficulty || "Not selected"}
          </p>
          <p className="mb-2 text-lg">
            <strong>Category:</strong> {category || "Not selected"}
          </p>
          <p className="mb-6 text-lg">
            <strong>Score:</strong> {score} / {questions.length}
          </p>
          <h2 className="text-2xl font-semibold mb-4">Your Answers</h2>
          <ul className="space-y-4">
            {userAnswers.map((answer, index) => (
              <li
                key={index}
                className="p-4 border border-gray-700 rounded-md bg-zinc-800"
              >
                <p className="mb-2">
                  <strong>Question {index + 1}:</strong> {answer.question}
                </p>
                <p className="mb-2">
                  <strong>Your Answer:</strong> {answer.selectedAnswer}
                </p>
                <p className="mb-2">
                  <strong>Correct Answer:</strong> {answer.correctAnswer}
                </p>
                <p>
                  <strong>Result:</strong>{" "}
                  {answer.isCorrect ? (
                    <span className="text-green-400">Correct</span>
                  ) : (
                    <span className="text-red-400">Incorrect</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
          <button
            onClick={restartQuiz}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-md shadow-md hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Start New Quiz
          </button>
        </div>
      </div>
    );
  }

  // Display current question
  const currentQuestion = questions[currentQuestionIndex];
  const answers = getShuffledAnswers(currentQuestion);
  const correctAnswer = he.decode(currentQuestion.correct_answer);

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white font-poppins">
      <h1 className="text-3xl sm:text-4xl p-10">
        Welcome,
        <br />
        <span className="font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
          {name || "Guest"}
        </span>
      </h1>
      <div className="px-4 sm:px-8 md:px-10 max-w-2xl mx-auto">
        <div className="mb-6">
          <p className="mb-2 text-lg">
            <strong>Difficulty:</strong> {difficulty || "Not selected"}
          </p>
          <p className="mb-2 text-lg">
            <strong>Category:</strong> {category || "Not selected"}
          </p>
          <p className="mb-2 text-lg">
            <strong>Question {currentQuestionIndex + 1} of {questions.length}</strong>
          </p>
          <p className="mb-2 text-lg">
            <strong>Score:</strong> {score}
          </p>
        </div>
        <div className="p-6 border border-gray-700 rounded-xl bg-zinc-800 shadow-lg animate-fade-in">
          <p className="mb-2 text-base sm:text-lg">
            <strong>Category:</strong>{" "}
            {categoryMap[currentQuestion.category] || currentQuestion.category}
          </p>
          <p className="mb-6 text-lg sm:text-xl font-medium">
            {he.decode(currentQuestion.question)}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(answer)}
                disabled={disableButtons}
                className={`w-full px-4 py-3 text-left border rounded-lg bg-zinc-700 text-white font-medium hover:bg-indigo-600 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                  selectedAnswer === answer
                    ? answer === correctAnswer
                      ? "border-green-400 bg-green-900/30"
                      : "border-red-400 bg-red-900/30"
                    : "border-gray-600"
                } ${disableButtons ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {answer}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Fade-in animation for questions
const styles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
`;

export default Quiz;