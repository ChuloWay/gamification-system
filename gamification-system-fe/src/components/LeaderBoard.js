import React, { useState, useEffect } from "react";
import cogoToast from "cogo-toast";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import axiosInstance from "../axios/axios";
import io from "socket.io-client";

const socket = io("http://localhost:2024");

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setCurrentUser(storedUser);
    }

    const fetchLeaderboard = async () => {
      try {
        const response = await axiosInstance.get("/leaderboard");
        setLeaderboard(response.data);
        setLoading(false);
      } catch (error) {
        setError(
          error.response
            ? error.response.data.message
            : "An unknown error occurred."
        );
        cogoToast.error(
          error.response
            ? error.response.data.message
            : "An unknown error occurred."
        );
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Listen for 'leaderboardUpdate' socket event
    socket.on("leaderboardUpdate", (updatedLeaderboard) => {
      setLeaderboard(updatedLeaderboard);
    });

    return () => {
      // Clean up socket.io event listener when component unmounts
      socket.off("leaderboardUpdate");
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-64 w-64"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-xl text-red-500">{error}</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="bg-white p-12 rounded-lg border border-gray-200 w-3/4 max-w-4xl mx-auto my-20 shadow-md animate-fadeIn">
        <h1 className="text-4xl font-semibold mb-8 text-center">Leaderboard</h1>
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b-2 border-gray-300 text-xl">
                Rank
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-xl">
                Name
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-xl">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr
                key={user.userId}
                className={`hover:bg-gray-100 transition-colors duration-200 ${
                  currentUser && currentUser.id === user.userId
                    ? "bg-purple-100"
                    : ""
                }`}
              >
                <td className="px-6 py-4 border-b border-gray-200 text-lg">
                  {index + 1}
                </td>
                <td className="px-6 py-4 border-b border-gray-200 text-lg">
                  <Link
                    to={`/profile/${user.userId}`}
                    className="text-blue-500 hover:underline"
                  >
                    {user.name}
                  </Link>
                </td>
                <td className="px-6 py-4 border-b border-gray-200 text-lg">
                  {user.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
