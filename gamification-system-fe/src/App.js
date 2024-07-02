import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import RegisterForm from "./components/Auth/RegisterForm";
import Leaderboard from "./components/LeaderBoard";
import ProfilePage from "./components/Profile";
import Challenges from "./components/Challenges";
import LoginForm from "./components/Auth/LoginForm";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route
            path="/login"
            element={
              <div className="flex w-full h-screen">
                <div className="w-full flex justify-center items-center lg:w-1/2">
                  <LoginForm />
                </div>
                <div className="hidden relative lg:flex justify-center items-center h-full w-1/2 bg-gray-200">
                  <div className="rounded-full w-60 h-60 bg-gradient-to-tr from-violet-500 to-pink-500 animate-bounce"></div>
                </div>
              </div>
            }
          />

          <Route
            path="/register"
            element={
              <div className="flex w-full h-screen">
                <div className="w-full flex justify-center items-center lg:w-1/2">
                  <RegisterForm />
                </div>
                <div className="hidden relative lg:flex justify-center items-center h-full w-1/2 bg-gray-200">
                  <div className="rounded-full w-60 h-60 bg-gradient-to-tr from-violet-500 to-pink-500 animate-bounce"></div>
                </div>
              </div>
            }
          />

          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/profile/:id" component={ProfilePage} /> 

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
