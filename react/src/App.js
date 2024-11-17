import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TaskProvider from "./context/AppContext";  // Context for tasks


import Home from "./pages/Home";
import CreateTask from "./pages/CreateTask";
import EditTask from "./pages/EditTask";
import Register from "./pages/Register"; // Register Page
import Login from "./pages/Login"; // Login Page
import './App.css';
import PrivateRoute from './components/PrivateRoute';  // A private route for protected pages

const App = () => {
  return (
   
      <TaskProvider> {/* Wrap task management in the Task context */}
        <Router>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Private Routes - only accessible when logged in */}
            <Route path="/create-task" element={<CreateTask/>} />
            <Route path="/edit-task/:id" element={<PrivateRoute component={EditTask} />} />
          </Routes>
        </Router>
      </TaskProvider>
    
  );
};

export default App;
