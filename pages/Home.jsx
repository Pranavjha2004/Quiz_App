import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DropDown from "../components/DropDown";
import { useQuizContext } from "../context/QuizContext";

const Home = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionToken, setSessionToken] = useState("");
  const { difficulty, category, setDifficulty, setCategory } = useQuizContext();
  const navigate = useNavigate();

  const categoryMap = {
    general: 9,
    history: 23,
    science: 17,
    sports: 21,
  };

  const difficultyMap = {
    beginner: "easy",
    intermediate: "medium",
    expert: "hard",
  };

  const difficultyOptions = ["Beginner", "Intermediate", "Expert"];
  const categoryOptions = ["General", "History", "Science", "Sports"];

  useEffect(() => {
    const fetchSessionToken = async () => {
      try {
        const response = await axios.get(
          "https://opentdb.com/api_token.php?command=request"
        );
        if (response.data.response_code === 0) {
          setSessionToken(response.data.token);
        } else {
          throw new Error("Failed to fetch session token.");
        }
      } catch (err) {
        setError("Failed to fetch session token. Please try again.");
      }
    };
    fetchSessionToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name || !difficulty || !category) {
      setError("Please enter your name and select a difficulty and category.");
      setLoading(false);
      return;
    }

    if (!sessionToken) {
      setError("Session token not loaded. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const categoryId = categoryMap[category.toLowerCase()];
      const apiDifficulty = difficultyMap[difficulty.toLowerCase()];

      const response = await axios.get("https://opentdb.com/api.php", {
        params: {
          amount: 10,
          category: categoryId,
          difficulty: apiDifficulty,
          type: "multiple",
          token: sessionToken,
        },
      });

      if (response.data.response_code !== 0) {
        if (response.data.response_code === 4) {
          const tokenResponse = await axios.get(
            `https://opentdb.com/api_token.php?command=reset&token=${sessionToken}`
          );
          setSessionToken(tokenResponse.data.token);
          setError("Session token was exhausted. Please try again.");
          setLoading(false);
          return;
        } else if (response.data.response_code === 1) {
          setError(
            `No questions available for category "${category}" and difficulty "${difficulty}". Try a different combination.`
          );
          setLoading(false);
          return;
        }
        throw new Error(`API Error: ${response.data.response_code}`);
      }

      navigate("/quiz", {
        state: {
          name,
          difficulty,
          category,
          questions: response.data.results,
          sessionToken,
        },
      });
    } catch (err) {
      setError(err.message || "Failed to fetch questions. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-white flex flex-col items-center justify-center px-4 sm:px-6 md:px-10 lg:px-20 py-10 overflow-x-hidden font-poppins">
      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text mb-8">
        Quiz Trivia
      </h1>

      {/* Form Box */}
      <div className="w-full sm:w-11/12 md:w-3/4 lg:w-1/2 bg-zinc-800 rounded-xl shadow-2xl p-5 sm:p-8 md:p-10 transform hover:scale-105 transition-transform duration-300">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-base sm:text-lg">
          {/* Error/Loading */}
          {error && (
            <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>
          )}
          {loading && (
            <p className="text-blue-400 bg-blue-900/50 p-3 rounded-md">
              Loading questions...
            </p>
          )}

          {/* Name Input */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">Name:</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Your Name..."
              className="w-full py-2 px-3 bg-transparent border-b-2 border-gray-400 text-white placeholder-gray-400 focus:border-purple-500 outline-none transition-all"
              required
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">Difficulty:</label>
            <DropDown
              label="Difficulty"
              options={difficultyOptions}
              selectedValue={difficulty}
              setValue={setDifficulty}
              id="difficulty"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">Category:</label>
            <DropDown
              label="Category"
              options={categoryOptions}
              selectedValue={category}
              setValue={setCategory}
              id="category"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !sessionToken}
            className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-md shadow-md hover:from-purple-600 hover:to-pink-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-600"
          >
            Start Quiz
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
