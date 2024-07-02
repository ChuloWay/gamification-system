import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import cogoToast from "cogo-toast";
import Navbar from "../components/Navbar";
import axiosInstance from "../axios/axios";

export default function ProfilePage() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/user/${id}`);
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        cogoToast.error("Error fetching user data");
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-64 w-64"></div>
      </div>
    );
  }

  if (!userData) {
    return <p className="text-center text-xl">User not found</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center p-8">
        <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <div className="flex-shrink-0">
              <img
                className="h-20 w-20 rounded-full ring-4 ring-violet-500"
                src={`https://i.pravatar.cc/150?u=${userData._id}`}
                alt="User avatar"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold text-gray-900">{userData.name}</h1>
              <p className="text-xl text-gray-500">{userData.email}</p>
            </div>
          </div>
          <div className="mt-8 animate-slideIn">
            <h2 className="text-3xl font-semibold text-gray-800">Profile Information</h2>
            <p className="text-xl mt-4">
              <span className="font-medium">Points:</span> {userData.points}
            </p>
            <div className="mt-6">
              <h3 className="text-2xl font-medium text-gray-700">Achievements</h3>
              {userData.achievements.length > 0 ? (
                <ul className="mt-2 list-disc list-inside">
                  {userData.achievements.map((achievement) => (
                    <li key={achievement._id} className="text-lg text-gray-600">
                      {achievement.name}: {achievement.description} ({achievement.points} points)
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-lg text-gray-500">No achievements yet</p>
              )}
            </div>
            <div className="mt-6">
              <h3 className="text-2xl font-medium text-gray-700">Badges</h3>
              {userData.badges.length > 0 ? (
                <ul className="mt-2 list-disc list-inside">
                  {userData.badges.map((badge, index) => (
                    <li key={index} className="text-lg text-gray-600">
                      {badge.name} ({badge.description})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-lg text-gray-500">No badges yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
