import React, { createContext, useContext, useState } from 'react';

const QuizContext = createContext();

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuizContext must be used within a QuizProvider');
  }
  return context;
};

export const QuizProvider = ({ children }) => {
  const [difficulty, setDifficulty] = useState('beginner');
  const [category, setCategory] = useState('General'); // Added category state

  const value = {
    difficulty,
    setDifficulty,
    category,
    setCategory,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};