import React, { useState } from "react";
import { z } from "zod";
import axiosInstance from "../../axios/axios";
import cogoToast from "cogo-toast";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "password" || name === "confirmPassword") {
      if (formData.password !== formData.confirmPassword) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          confirmPassword: undefined,
        }));
      }
    }

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
        name: fieldErrors.name?._errors?.[0],
        password: fieldErrors.password?._errors?.[0],
        confirmPassword: fieldErrors.confirmPassword?._errors?.[0],
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({
        confirmPassword: "Passwords do not match",
      });
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/user",
        JSON.stringify(formData),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { message, user, token } = response.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      cogoToast.success(message);
      navigate(`/profile/${user.id}`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unknown error occurred.";
      cogoToast.error(errorMessage);
      setErrors({ form: errorMessage });
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="bg-white p-12 rounded-lg border border-gray-200 w-3/4 max-w-4xl mx-auto my-20">
      <h1 className="text-4xl font-semibold mb-8">Register</h1>
      <p className="text-gray-500 text-xl mb-8">Please enter your details</p>
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
          <label className="block text-gray-700 text-xl" htmlFor="name">
            Name
          </label>
          <input
            className="w-full px-6 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl"
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="text-red-500">{errors.name}</p>}
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
        <div>
          <label
            className="block text-gray-700 text-xl"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <input
            className="w-full px-6 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="text-red-500">{errors.confirmPassword}</p>
          )}
        </div>
        {errors.form && <p className="text-red-500">{errors.form}</p>}
        <div className="mt-12 flex flex-col gap-y-4">
          <button
            className="active:scale-[.98] active:duration-75 hover:scale-[1.01] ease-in-out transition-all py-5 rounded-xl bg-violet-500 text-white text-2xl font-bold"
            type="submit"
          >
            Register
          </button>
          <button
            className="link-btn text-blue-500 text-xl mt-4"
            onClick={handleLoginClick}
          >
            Already have an account? Login here
          </button>
        </div>
      </form>
    </div>
  );
}
