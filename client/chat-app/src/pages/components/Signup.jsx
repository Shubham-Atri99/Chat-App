import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const Signup = ({ switchToLogin }) => {
  const [name, setName] = useState(''); 
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate(); 

  const submitHandler = async (e) => {
    e.preventDefault(); 

    if (!name || !password || !email) {
      toast.error("Fill all fields");
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post("/api/user", { name, email, password }, config);

      toast.success("Registration successful");
      localStorage.setItem("userInfo", JSON.stringify(data));

      navigate('/chats'); 
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
      <form className="space-y-4" onSubmit={submitHandler}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-sm text-center">
        Already have an account?{' '}
        <span
          className="text-green-600 hover:underline cursor-pointer"
          onClick={switchToLogin}
        >
          Log in
        </span>
      </p>
    </div>
  );
};

export default Signup;
