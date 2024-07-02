import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserId(storedUser.id);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 p-4 shadow-lg fixed w-full z-10 top-0 animate-slideDown">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">Gamification</div>
        <div className="flex space-x-4">
          <Link
            to="/leaderboard"
            className="text-gray-300 hover:text-white transition duration-200"
          >
            Leaderboard
          </Link>
          <Link
            to="/challenges"
            className="text-gray-300 hover:text-white transition duration-200"
          >
            Challenges
          </Link>
          {userId && (
            <Link
              to={`/profile/${userId}`}
              className="text-gray-300 hover:text-white transition duration-200"
            >
              Profile
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-gray-300 hover:text-white transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
