// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import TaskBoard from './pages/TaskBoard';
import NewListPopup from './pages/TaskBoard';




function App() {
  return (
   <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/tasks" element={<TaskBoard />} />
        <Route path="/newlistpopup" element={<NewListPopup />} />

      </Routes>
    </Router>
  );
}

export default App;
