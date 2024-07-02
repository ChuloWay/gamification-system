import React, { useState } from "react";
import { z } from "zod";
import axiosInstance from "../../axios/axios";
import cogoToast from "cogo-toast";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    const fieldResult = schema
      .pick({ [name]: true })
      .safeParse({ [name]: value });
    if (fieldResult.success) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: fieldResult.error.format()[name]._errors[0],
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { success, error } = schema.safeParse(formData);
    if (!success) {
      const fieldErrors = error.format();
      setErrors({
        email: fieldErrors.email?._errors?.[0],
        password: fieldErrors.password?._errors?.[0],
      });
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/user/login",
        JSON.stringify(formData),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { message, user, token } = response.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      cogoToast.success(message || "Login successful!");
      navigate(`/profile/${user.id}`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unknown error occurred.";
      cogoToast.error(errorMessage);
      setErrors({ form: errorMessage });
    }
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <div className="bg-white p-12 rounded-lg border border-gray-200 w-3/4 max-w-4xl mx-auto my-20">
      <h1 className="text-4xl font-semibold mb-8">Login</h1>
      <p className="text-gray-500 text-xl mb-8">
        Please enter your login details
      </p>
      <form className="space-y-8" onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-700 text-xl" htmlFor="email">
            Email
          </label>
          <input
            className="w-full px-6 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl"
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-gray-700 text-xl" htmlFor="password">
            Password
          </label>
          <input
            className="w-full px-6 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl"
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="text-red-500">{errors.password}</p>}
        </div>
        {errors.form && <p className="text-red-500">{errors.form}</p>}
        <div className="mt-12 flex flex-col gap-y-4">
          <button
            className="active:scale-[.98] active:duration-75 hover:scale-[1.01] ease-in-out transition-all py-5 rounded-xl bg-violet-500 text-white text-2xl font-bold"
            type="submit"
          >
            Login
          </button>
          <button
            className="link-btn text-blue-500 text-xl mt-4"
            onClick={handleRegisterClick}
          >
            Don't have an account? Register here
          </button>
        </div>
      </form>
    </div>
  );
}
