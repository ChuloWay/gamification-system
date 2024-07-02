import React, { useState, useEffect } from "react";
import cogoToast from "cogo-toast";
import Modal from "react-modal";
import Navbar from "./Navbar";
import axiosInstance from "../axios/axios";

Modal.setAppElement("#root");

const Challenges = () => {
  const [userId, setUserId] = useState(null);
  const [points, setPoints] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserId(storedUser.id);
      fetchUserProfile(storedUser.id);
    }

    const fetchAchievements = async () => {
      try {
        const response = await axiosInstance.get("/achievement");
        setAchievements(response.data);
      } catch (error) {
        cogoToast.error("Failed to fetch achievements");
      }
    };

    fetchAchievements();
  }, []);

  const fetchUserProfile = async (id) => {
    try {
      const response = await axiosInstance.get(`/user/${id}`);
      setUserAchievements(response.data.achievements);
      setPoints(response.data.points);
    } catch (error) {
      cogoToast.error("Failed to fetch user profile");
    }
  };

  const handleAddPoints = async (amount) => {
    try {
      const response = await axiosInstance.put(`/user/${userId}`, {
        points: amount,
      });
      setPoints(response.data.points);
      cogoToast.success(`You have earned ${amount} points!`);
    } catch (error) {
      cogoToast.error("Failed to add points");
    }
  };

  const handleAddAchievement = async (achievementId) => {
    try {
      const response = await axiosInstance.post(
        "/achievement/achievementToUser",
        {
          userId,
          achievementId,
        }
      );
      cogoToast.success("Achievement unlocked!");
      fetchUserProfile(userId);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        cogoToast.error(error.response.data.error);
      } else {
        cogoToast.error("Failed to unlock achievement");
      }
    }
  };

  const handleOpenModal = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setQuizAnswers({ q1: "", q2: "", q3: "", q4: "" });
  };

  const handleSubmitQuiz = () => {
    const correctAnswers = currentTask.quiz.answers;
    const userAnswers = [
      quizAnswers.q1,
      quizAnswers.q2,
      quizAnswers.q3,
      quizAnswers.q4,
    ];
    const isCorrect = correctAnswers.every(
      (answer, index) => answer === userAnswers[index]
    );

    if (isCorrect) {
      if (currentTask.type === "points") {
        handleAddPoints(currentTask.amount);
      } else if (currentTask.type === "achievement") {
        handleAddAchievement(currentTask.id);
      }
    } else {
      cogoToast.error("Incorrect answers. Try again!");
    }
    handleCloseModal();
  };

  const handleInputChange = (e) => {
    setQuizAnswers({ ...quizAnswers, [e.target.name]: e.target.value });
  };

  const isAchievementUnlocked = (achievementId) => {
    return userAchievements.some((ach) => ach._id === achievementId);
  };

  return (
    <div>
      <Navbar />

      <div className="pt-16 bg-gray-100 min-h-screen flex flex-col items-center">
        <h1 className="text-4xl font-semibold mb-8">Challenges</h1>
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">Available Tasks</h2>
          <div className="space-y-4">
            <button
              className="w-full py-3 px-4 bg-violet-500 text-white rounded-lg shadow-md hover:bg-violet-700 transition duration-200"
              onClick={() =>
                handleOpenModal({
                  type: "points",
                  amount: 10,
                  quiz: {
                    questions: [
                      "Question 1: What is 2 + 2?",
                      "Question 2: What is the capital of France?",
                    ],
                    answers: ["4", "Paris"],
                  },
                })
              }
            >
              Complete Task A (Earn 10 Points)
            </button>
            <button
              className="w-full py-3 px-4 bg-violet-500 text-white rounded-lg shadow-md hover:bg-violet-700 transition duration-200"
              onClick={() =>
                handleOpenModal({
                  type: "points",
                  amount: 20,
                  quiz: {
                    questions: [
                      "Question 1: What is 5 + 5?",
                      "Question 2: What is the capital of Spain?",
                    ],
                    answers: ["10", "Madrid"],
                  },
                })
              }
            >
              Complete Task B (Earn 20 Points)
            </button>

            <button
              className="w-full py-3 px-4 bg-violet-500 text-white rounded-lg shadow-md hover:bg-violet-700 transition duration-200"
              onClick={() =>
                handleOpenModal({
                  type: "points",
                  amount: 30,
                  quiz: {
                    questions: [
                      "Question 1: What is 7 + 3?",
                      "Question 2: What is the capital of Italy?",
                    ],
                    answers: ["10", "Rome"],
                  },
                })
              }
            >
              Complete Task C(Earn 30 Points)
            </button>
            <button
              className="w-full py-3 px-4 bg-violet-500 text-white rounded-lg shadow-md hover:bg-violet-700 transition duration-200"
              onClick={() =>
                handleOpenModal({
                  type: "points",
                  amount: 50,
                  quiz: {
                    questions: [
                      "Question 1: What is 25 + 25?",
                      "Question 2: What is the capital of the United Kingdom?",
                    ],
                    answers: ["50", "London"],
                  },
                })
              }
            >
              Complete Task D (Earn 50 Points)
            </button>
            <button
              className={`w-full py-3 px-4 relative rounded-lg shadow-md transition duration-200 ${
                isAchievementUnlocked("6686b404242224f0c6d9e432")
                  ? "cursor-not-allowed"
                  : "hover:bg-violet-700"
              }`}
              onClick={() =>
                !isAchievementUnlocked("6686b404242224f0c6d9e432") &&
                handleOpenModal({
                  type: "achievement",
                  id: "6686b404242224f0c6d9e432",
                  quiz: {
                    questions: [
                      "Question 1: What is 3 + 3?",
                      "Question 2: What is the capital of Germany?",
                    ],
                    answers: ["6", "Berlin"],
                  },
                })
              }
              disabled={isAchievementUnlocked("6686b404242224f0c6d9e432")}
            >
              {isAchievementUnlocked("6686b404242224f0c6d9e432") && (
                <div className="absolute inset-0 bg-gray-500 opacity-50 rounded-lg"></div>
              )}
              <span className="relative">
                Complete Task E (Unlock Achievement: Consistency King)
              </span>
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Mini-Game Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h2 className="text-2xl font-semibold mb-4">Mini-Game Quiz</h2>
        <div className="space-y-4">
          {currentTask?.quiz.questions.map((question, index) => (
            <div key={index}>
              <label className="block text-lg">{question}</label>
              <input
                type="text"
                name={`q${index + 1}`}
                value={quizAnswers[`q${index + 1}`]}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitQuiz}
            className="px-4 py-2 bg-violet-500 text-white rounded hover:bg-violet-700 transition duration-200"
          >
            Submit
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Challenges;
