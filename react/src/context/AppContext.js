import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import io from "socket.io-client";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]); // State for tasks
  const [user, setUser] = useState(null); // Store logged-in user information
  const [socketCon, setSocketCon] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = io("http://localhost:7000");
    setSocketCon(socket);

    // Listen for new task events
    socket.on("newTask", (data) => {
      const newTask = {
        ...data,
        updateTime: new Date().toLocaleTimeString(),
        date: new Date().toISOString().split("T")[0],
      };

      setTasks((prevTasks) => {
        const updatedTasks = [...prevTasks, newTask];
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
        return updatedTasks;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch tasks from API when user logs in
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
              Authorization: `Bearer ${user.token}`,
            },
          });

          const tasksWithAdditionalFields = response.data.data.map((task) => ({
            ...task,
            updateTime: new Date().toLocaleTimeString(),
            date: new Date().toISOString().split("T")[0],
          }));

          setTasks(tasksWithAdditionalFields);
          localStorage.setItem("tasks", JSON.stringify(tasksWithAdditionalFields));
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };

      fetchData();
    }
  }, [user]);

  // Add a new task
  const addTask = (task) => {
    const newTask = {
      ...task,
      updateTime: new Date().toLocaleTimeString(),
      date: new Date().toISOString().split("T")[0],
    };

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTask];
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      return updatedTasks;
    });

    if (socketCon) {
      socketCon.emit("createTask", newTask);
    }
  };

  // Update an existing task
  const updateTask = (updatedTask) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.taskId === updatedTask.taskId ? updatedTask : task
      );
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      return updatedTasks;
    });
  };

  // Delete a task
  const deleteTask = (id) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((task) => task.taskId !== id);
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      return updatedTasks;
    });
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        setTasks,
        user,
        setUser,
        addTask,
        updateTask,
        deleteTask,
        socketCon,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

export default AppProvider;
