import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]); // State for tasks
  const [user, setUser] = useState(null); // Store logged-in user information

  // Load tasks from localStorage on mount
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (storedTasks) {
      setTasks(storedTasks);
    }
  }, []);

  // Fetch tasks from API when the user logs in
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const url =
            user.role === "Admin"
              ? "http://localhost:7000/users"
              : `http://localhost:7000/users/task/${user._id}`;
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${user.token}`, // Include token in Authorization header
            },
          });
          setTasks(response.data.data);
          localStorage.setItem("tasks", JSON.stringify(response.data.data)); // Save to localStorage
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };

      fetchData();
    }
  }, [user]);

  // Task management functions
  const addTask = (task) => {
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, task];
      localStorage.setItem("tasks", JSON.stringify(updatedTasks)); // Update localStorage
      return updatedTasks;
    });
  };

  const updateTask = (updatedTask) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );
      localStorage.setItem("tasks", JSON.stringify(updatedTasks)); // Update localStorage
      return updatedTasks;
    });
  };

  const deleteTask = (id) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((task) => task.id !== id);
      localStorage.setItem("tasks", JSON.stringify(updatedTasks)); // Update localStorage
      return updatedTasks;
    });
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        setTasks, // Ensure `setTasks` is provided here
        user,
        setUser,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using AppContext
export const useAppContext = () => useContext(AppContext);

export default AppProvider;
