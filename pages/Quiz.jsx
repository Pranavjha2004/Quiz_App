import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import he from "he";
import ConfettiExplosion from "react-confetti-explosion";
import { motion } from "framer-motion";
import useSound from "use-sound";
import tickSound from "../src/assets/tick.wav";
import correctSfx from "../src/assets/correct.wav";
import wrongSfx from "../src/assets/wrong.mp3";

const categoryMap = {
  9: "General",
  17: "Science",
  23: "History",
  21: "Sports",
};

const QUESTION_TIME = 15;

const Quiz = () => {
  const { name, difficulty, category, questions } = useLocation().state || {};
  const navigate = useNavigate();

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [disableButtons, setDisableButtons] = useState(false);
  const [timer, setTimer] = useState(QUESTION_TIME);
  const [showConfetti, setShowConfetti] = useState(false);

  const [playTick] = useSound(tickSound, { volume: 0.3 });
  const [playCorrect] = useSound(correctSfx);
  const [playWrong] = useSound(wrongSfx);

  const currentQuestion = questions[index];
  const answers = React.useMemo(() => {
    const all = [
      ...currentQuestion.incorrect_answers.map((a) => he.decode(a)),
      he.decode(currentQuestion.correct_answer),
    ];
    return all.sort(() => Math.random() - 0.5);
  }, [currentQuestion]);

  // Timer effect
  useEffect(() => {
    if (showConfetti || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
      playTick();
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, showConfetti]);

  // Answer handler
  const handleAnswer = (answer) => {
    if (disableButtons) return;

    const correct = he.decode(currentQuestion.correct_answer);
    const isCorrect = answer === correct;

    setSelectedAnswer(answer);
    setDisableButtons(true);
    isCorrect ? playCorrect() : playWrong();

    // Vibrate on mobile
    if ("vibrate" in navigator) {
      navigator.vibrate(isCorrect ? 100 : [100, 100, 100]);
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        question: he.decode(currentQuestion.question),
        selectedAnswer: answer || "No answer",
        correctAnswer: correct,
        isCorrect,
      },
    ]);

    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex((i) => i + 1);
        setSelectedAnswer(null);
        setDisableButtons(false);
        setTimer(QUESTION_TIME);
      } else {
        setShowConfetti(true);
      }
    }, 1000);
  };

  const restart = () => {
    setShowConfetti(false);
    setIndex(0);
    setScore(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setDisableButtons(false);
    setTimer(QUESTION_TIME);
    navigate("/");
  };

  const progress = ((index + (selectedAnswer !== null || timer === 0 ? 1 : 0)) / questions.length) * 100;

  // ⌨️ Keyboard controls
  const handleKeyDown = useCallback(
    (e) => {
      if (showConfetti || disableButtons) return;

      const key = e.key;

      if (key >= "1" && key <= `${answers.length}`) {
        handleAnswer(answers[parseInt(key) - 1]);
      }

      if (key === "ArrowRight" && selectedAnswer !== null && index + 1 < questions.length) {
        setIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setDisableButtons(false);
        setTimer(QUESTION_TIME);
      }

      if (key === "ArrowLeft" && index > 0) {
        setIndex((prev) => prev - 1);
        setSelectedAnswer(null);
        setDisableButtons(false);
        setTimer(QUESTION_TIME);
      }

      if (key === "Enter" && selectedAnswer !== null) {
        handleAnswer(selectedAnswer);
      }
    },
    [answers, selectedAnswer, disableButtons, showConfetti, index]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-4 sm:px-6 md:px-10 py-8 font-poppins overflow-auto">
      <h1 className="text-3xl sm:text-4xl mb-4">
        Welcome, <br />
        <span className="font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          {name || "Guest"}
        </span>
      </h1>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Timer */}
      {!showConfetti && (
        <p className="text-base sm:text-lg mb-2">
          Time left: <span className="font-semibold">{timer}s</span>
        </p>
      )}

      {/* Confetti and Final Result */}
      {showConfetti ? (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <ConfettiExplosion
              force={0.9}
              duration={3000}
              particleCount={200}
              width={window.innerWidth}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl mb-4">🎉 All Done!</h2>
            <p className="mb-2">Difficulty: {difficulty}</p>
            <p className="mb-2">Category: {category}</p>
            <p className="mb-4">Score: {score} / {questions.length}</p>

            <ul className="space-y-3">
              {userAnswers.map((a, i) => (
                <motion.li
                  key={i}
                  className="p-3 border border-gray-700 rounded-lg bg-zinc-800 break-words"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <p><strong>Q{i + 1}:</strong> {a.question}</p>
                  <p>Your: {a.selectedAnswer}</p>
                  <p>Correct: {a.correctAnswer}</p>
                  <p>
                    Result:{" "}
                    {a.isCorrect ? (
                      <span className="text-green-400">Correct</span>
                    ) : (
                      <span className="text-red-400">Incorrect</span>
                    )}
                  </p>
                </motion.li>
              ))}
            </ul>

            <button
              onClick={restart}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-md shadow-md hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              Return to Home
            </button>
          </motion.div>
        </>
      ) : (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <p className="text-base sm:text-lg mb-2">
            Difficulty: {difficulty} | Category: {categoryMap[currentQuestion.category]}
          </p>
          <p className="text-base sm:text-lg mb-4">
            Question {index + 1} / {questions.length}
          </p>

          <div className="p-5 bg-zinc-800 border border-gray-700 rounded-xl shadow-md">
            <p className="text-lg font-medium mb-6 break-words">
              {he.decode(currentQuestion.question)}
            </p>
            <div className="grid grid-cols-1 gap-3">
              {answers.map((ans, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(ans)}
                  disabled={disableButtons}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full px-4 py-3 text-left border rounded-lg font-medium break-words transition duration-200 ${
                    selectedAnswer === ans
                      ? ans === he.decode(currentQuestion.correct_answer)
                        ? "bg-green-900/30 border-green-400"
                        : "bg-red-900/30 border-red-400"
                      : "bg-zinc-700 border-gray-600 hover:bg-indigo-600 hover:border-indigo-500"
                  } ${disableButtons ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {ans}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Quiz;
