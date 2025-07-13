import Home from '../pages/Home';
import Quiz from '../pages/Quiz';
import './App.css'
import { Routes, Route } from 'react-router-dom';
function App() {
  return (
    <div>
      <Routes>
        <Route index element={<Home />}></Route>
        <Route path='/quiz' element={<Quiz />}></Route>
      </Routes>
    </div>
  )
}

export default App
