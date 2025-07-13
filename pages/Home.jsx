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

  // Map custom categories to OpenTDB category IDs (case-insensitive)
  const categoryMap = {
    general: 9, // General Knowledge
    history: 23,
    science: 17, // Science & Nature
    sports: 21,
  };

  // Map custom difficulties to OpenTDB difficulties
  const difficultyMap = {
    beginner: "easy",
    intermediate: "medium",
    expert: "hard",
  };

  const difficultyOptions = ["Beginner", "Intermediate", "Expert"];
  const categoryOptions = ["General", "History", "Science", "Sports"];

  // Fetch session token on mount
  useEffect(() => {
    const fetchSessionToken = async () => {
      try {
        const response = await axios.get(
          "https://opentdb.com/api_token.php?command=request"
        );
        console.log("Session Token Response:", response.data);
        if (response.data.response_code === 0) {
          setSessionToken(response.data.token);
        } else {
          throw new Error("Failed to fetch session token.");
        }
      } catch (err) {
        setError("Failed to fetch session token. Please try again.");
        console.error("Token Error:", err);
      }
    };
    fetchSessionToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Debug context values
    console.log("Form submitted:", { name, difficulty, category });

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
      // Normalize category to lowercase for case-insensitive lookup
      const normalizedCategory = category.toLowerCase();
      const categoryId = categoryMap[normalizedCategory];
      const apiDifficulty = difficultyMap[difficulty.toLowerCase()];

      if (!categoryId) {
        throw new Error(`Invalid category: ${category}`);
      }
      if (!apiDifficulty) {
        throw new Error(`Invalid difficulty: ${difficulty}`);
      }

      console.log("Fetching questions with params:", {
        amount: 10,
        category: categoryId,
        difficulty: apiDifficulty,
        type: "multiple",
        token: sessionToken,
      });

      const response = await axios.get("https://opentdb.com/api.php", {
        params: {
          amount: 10,
          category: categoryId,
          difficulty: apiDifficulty,
          type: "multiple",
          token: sessionToken,
        },
      });

      console.log("API Response:", response.data);

      if (response.data.response_code !== 0) {
        if (response.data.response_code === 4) {
          // Token exhausted, reset token
          const tokenResponse = await axios.get(
            `https://opentdb.com/api_token.php?command=reset&token=${sessionToken}`
          );
          console.log("Token Reset Response:", tokenResponse.data);
          setSessionToken(tokenResponse.data.token);
          setError("Session token was exhausted. Please try again.");
          setLoading(false);
          return;
        } else if (response.data.response_code === 1) {
          setError(
            `No questions available for category "${category}" and difficulty "${difficulty}". Try a different combination or fewer questions.`
          );
          setLoading(false);
          return;
        }
        throw new Error(`API Error: ${response.data.response_code}`);
      }

      if (!response.data.results || response.data.results.length === 0) {
        setError("No questions returned from the API.");
        setLoading(false);
        return;
      }

      console.log("Navigating with questions:", response.data.results);
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
      console.error("Fetch Questions Error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center w-full min-h-screen bg-zinc-900 text-white px-4 sm:px-8 md:px-36 lg:px-52 font-poppins">
      {/* Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text mb-8 md:mb-0">
        Quiz Trivia
      </h1>

      {/* Form Container */}
      <div className="w-full sm:w-3/4 md:w-2/3 max-w-lg bg-zinc-800 rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 transform hover:scale-105 transition-transform duration-300">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-lg">
          {/* Error Message */}
          {error && (
            <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>
          )}
          {loading && (
            <p className="text-blue-400 bg-blue-900/50 p-3 rounded-md">
              Loading questions...
            </p>
          )}

          {/* Name Input */}
          <div className="flex flex-col w-full">
            <label className="flex flex-col gap-2 text-white font-medium">
              Name:
              <input
                className="outline-none py-2 px-3 bg-transparent border-b-2 border-gray-400 text-white placeholder-gray-400 focus:border-purple-500 transition-colors duration-200"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Enter Your Name..."
                required
              />
            </label>
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex flex-col w-full min-h-[60px]">
            <label className="flex flex-col gap-2 text-white font-medium">
              Difficulty:
              <DropDown
                label="Difficulty"
                options={difficultyOptions}
                selectedValue={difficulty}
                setValue={setDifficulty}
                id="difficulty"
              />
            </label>
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-col w-full min-h-[60px]">
            <label className="flex flex-col gap-2 text-white font-medium">
              Category:
              <DropDown
                label="Category"
                options={categoryOptions}
                selectedValue={category}
                setValue={setCategory}
                id="category"
              />
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !sessionToken}
            className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-md shadow-md hover:from-purple-600 hover:to-pink-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-600"
          >
            Start Quiz
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;