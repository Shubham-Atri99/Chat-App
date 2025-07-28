import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
const Login = ({ switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Fill all fields");
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post("/api/user/login", { email, password }, config);

      toast.success("Login successful");
      localStorage.setItem("userInfo", JSON.stringify(data));

      navigate('/chats'); // ✅ Redirect after login
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      <form className="space-y-4" onSubmit={submitHandler}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Log In
        </button>
      </form>
      <p className="mt-4 text-sm text-center">
        Don’t have an account?{' '}
        <span
          className="text-blue-600 hover:underline cursor-pointer"
          onClick={switchToSignup}
        >
          Sign up
        </span>
      </p>
    </div>
  );
};

export default Login;
