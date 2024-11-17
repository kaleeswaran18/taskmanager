// src/pages/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";  // Import context



const Login = () => {
  const navigate = useNavigate();
  const { socketCon, setUser } = useAppContext();  // Get setUser method from context


  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      localStorage.clear();

      const response = await axios.post("http://localhost:7000/users/login", formData);
      // console.log(response.data.data, 'response');

      // Store the user data in context
      setUser(response.data.data);  // Store user data in the context

      // Optionally store the user data in localStorage for persistence across page reloads
      socketCon.emit('authenticate', {
        userId: response.data.data?._id,
        token: response.data.data?.token
      })

      localStorage.setItem("user", JSON.stringify(response.data.data));

      // Redirect to home after successful login

      navigate("/home");

      // socketCon.on('authenticated', (msg) => {
      //   console.log(msg.message); // Notify user of successful login
      // });

    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
