import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import "./Tasklist.css"; // Add your CSS file for styling
import axios from "axios";
import { io } from "socket.io-client"; // Import socket.io-client

const TaskList = () => {
  const { tasks, setTasks } = useContext(AppContext); // Get tasks and setTasks from context
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for task form popup visibility
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "To Do",
    assignedUser: "",
  }); // Form data state
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null); // State for socket connection
  const [editId, setEditId] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false); // State for delete confirmation popup
  const [taskToDelete, setTaskToDelete] = useState(null); // Store task ID to delete
  const [statusChangePopup, setStatusChangePopup] = useState(false); // State for change status popup
  const [selectedStatus, setSelectedStatus] = useState(""); // Store selected status for update
  const [taskToChangeStatus, setTaskToChangeStatus] = useState(null); // Store task ID to change status
  const [activeLogPopup, setActiveLogPopup] = useState(false); // State for showing active log popup
  const [activeLogs, setActiveLogs] = useState([]);
  const [filterStatus, setFilterStatus] = useState(""); // Filter for status
  const [filterDueDate, setFilterDueDate] = useState(""); // Filter for due date

  const checkAdmin = JSON.parse(localStorage.getItem("user"));
  const isAdmin = checkAdmin?.role === "Admin"; // Check if the user is an admin

  // Format the date to YYYY-MM-DD for input fields
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const isValidDate = (date) => {
    const selectedDate = new Date(date).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!newTask.title || !newTask.description || !newTask.dueDate || !newTask.assignedUser) {
      setError("All fields are required.");
      return;
    }

    if (!isValidDate(newTask.dueDate)) {
      setError("Due date must be today or a future date.");
      return;
    }

    const taskData = {
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      status: newTask.status,
      assignedUser: newTask.assignedUser,
    };

    try {
      if (editId) {
        // Update task
        taskData.id = editId;
        await axios.put("http://localhost:7000/users", taskData, {
          headers: { Authorization: `Bearer ${checkAdmin.token}` },
        });

        // After updating the task, re-fetch all tasks from the server to ensure the UI is updated
        const updatedTasksResponse = await axios.get("http://localhost:7000/users", {
          headers: { Authorization: `Bearer ${checkAdmin.token}` },
        });

        // Update the tasks state and localStorage with the updated tasks
        setTasks(updatedTasksResponse.data.data);
        localStorage.setItem("tasks", JSON.stringify(updatedTasksResponse.data.data));
      } else {
        // Create new task
        const response = await axios.post("http://localhost:7000/users", taskData, {
          headers: { Authorization: `Bearer ${checkAdmin.token}` },
        });

        // Add new task to state and localStorage
        setTasks((prevTasks) => [...prevTasks, response.data.data]);
        localStorage.setItem("tasks", JSON.stringify([...tasks, response.data.data]));
      }

      // Reset the form
      setNewTask({ title: "", description: "", dueDate: "", status: "To Do", assignedUser: "" });
      setIsPopupOpen(false);
      setEditId("");
    } catch (error) {
      console.error("Failed to create/update task:", error);
      setError("Failed to save task. Please try again.");
    }
  };

  // Filter tasks based on selected status and due date
  const filterTasks = () => {
    return tasks.filter((task) => {
      const isDueDateMatch =
        !filterDueDate || new Date(task.dueDate).toISOString().split("T")[0] === filterDueDate;
      const isStatusMatch = !filterStatus || task.status === filterStatus;
      return isDueDateMatch && isStatusMatch;
    });
  };

  useEffect(() => {
    // Fetch tasks from the server on component mount
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:7000/users", {
          headers: { Authorization: `Bearer ${checkAdmin.token}` },
        });
        setTasks(response.data.data);
        localStorage.setItem("tasks", JSON.stringify(response.data.data)); // Store the tasks in localStorage
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [setTasks]);

  const editTask = (task) => {
    setNewTask({
      ...task,
      dueDate: formatDate(task.dueDate), // Format dueDate for input field
      assignedUser: task.assignedUser?._id || "", // Store assignedUser's ID (not username)
    });
    setEditId(task._id);
    setIsPopupOpen(true);
  };

  const openDeleteConfirmation = (taskId) => {
    setTaskToDelete(taskId);
    setDeleteConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete the task
      await axios.delete(`http://localhost:7000/users/${taskToDelete}`, {
        headers: { Authorization: `Bearer ${checkAdmin.token}` },
      });

      // Remove the task from state and localStorage after successful deletion
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskToDelete));
      localStorage.setItem("tasks", JSON.stringify(tasks.filter((task) => task._id !== taskToDelete)));
      setNewTask({ title: "", description: "", dueDate: "", status: "To Do", assignedUser: "" });
      setEditId("");
      setDeleteConfirmationOpen(false);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const cancelDelete = () => {
    setNewTask({ title: "", description: "", dueDate: "", status: "To Do", assignedUser: "" });
    setEditId("");
    setDeleteConfirmationOpen(false); // Close the confirmation popup without deleting
    setTaskToDelete(null); // Reset task to delete
  };

  // Optionally, if you are using socket.io for live updates:
  useEffect(() => {
    const socketConnection = io("http://localhost:7000");
    setSocket(socketConnection);

    // Listen for new tasks or updates from other users
    socketConnection.on("taskAdded", (newTask) => {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  return (
    <div className="task-list">
      <h2>Tasks</h2>

      {isAdmin && (
        <button className="add-task-btn" onClick={() => setIsPopupOpen((prev) => !prev)}>
          {isPopupOpen ? "Close" : "Add New Task"}
        </button>
      )}

      {/* Filter Section */}
      <div className="filters">
        <label>
          Filter by Status:
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </label>

        <label>
          Filter by Due Date:
          <input
            type="date"
            value={filterDueDate}
            onChange={(e) => setFilterDueDate(e.target.value)}
          />
        </label>
      </div>

      <ul className="task-list-items">
        {filterTasks().map((task) => (
          <li key={task._id}>
            <div className="task-item">
              <div>
                <p>Title: {task.title}</p>
                <p>Assigned User: {task.assignedUser?.username || "Not Assigned"}</p>
                <p>Description: {task.description}</p>
                <p>Status: {task.status}</p>
                <p>Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
              </div>

              {isAdmin && (
                <div className="task-actions">
                  <button onClick={() => editTask(task)}>Edit</button>
                  <button onClick={() => openDeleteConfirmation(task._id)}>Delete</button>
                </div>
              )}

              {!isAdmin && (
                <div>
                  <button onClick={() => openStatusChangePopup(task)}>
                    Change Status
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Add/Edit Popup */}
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <span
              className="close-icon"
              onClick={() => {
                setNewTask({ title: "", description: "", dueDate: "", status: "To Do", assignedUser: "" });
                setEditId("");
                setIsPopupOpen(false);
              }}
            >
              &times;
            </span>

            <h3>{editId ? "Update Task" : "Add New Task"}</h3>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>
                  Title:
                  <input type="text" name="title" value={newTask.title} onChange={handleInputChange} />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Description:
                  <textarea
                    name="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Due Date:
                  <input
                    type="date"
                    name="dueDate"
                    value={newTask.dueDate}
                    onChange={handleInputChange}
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Status:
                  <select name="status" value={newTask.status} onChange={handleInputChange}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </label>
              </div>
              <div className="form-group">
                <label>
                  Assigned User:
                  <select
                    name="assignedUser"
                    value={newTask.assignedUser}
                    onChange={handleInputChange}
                  >
                    <option value="">Select User</option>
                    {tasks
                      .map((task) => task.assignedUser)
                      .filter(
                        (user, index, self) =>
                          user &&
                          self.findIndex((u) => u?._id === user?._id) === index // Unique users
                      )
                      .map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.username}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <div className="form-buttons">
                <button type="submit">{editId ? "Update Task" : "Create Task"}</button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTask({ title: "", description: "", dueDate: "", status: "To Do", assignedUser: "" });
                    setEditId("");
                    setIsPopupOpen(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteConfirmationOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <span className="close-icon" onClick={cancelDelete}>
              &times;
            </span>
            <h3>Are you sure you want to delete this task?</h3>
            <div className="form-buttons">
              <button onClick={confirmDelete}>Yes</button>
              <button onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
