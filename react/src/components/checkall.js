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
  const checkAdmin = JSON.parse(localStorage.getItem("user"));
  const isAdmin = checkAdmin?.role === "Admin"; // Check if the user is an admin
  const [filterStatus, setFilterStatus] = useState(""); // Filter for status
  const [filterDueDate, setFilterDueDate] = useState(""); // Filter for due date
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

 


const filterTasks = () => {
  return tasks.filter((task) => {
    const isDueDateMatch =
      !filterDueDate || new Date(task.dueDate).toISOString().split("T")[0] === filterDueDate;
    const isStatusMatch = !filterStatus || task.status === filterStatus;
    return isDueDateMatch && isStatusMatch;
  });
};






// Toggle the Active Log popup

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



  

  const openStatusChangePopup = (task) => {
    
    setTaskToChangeStatus(task._id);
    setSelectedStatus(task.status);
    setStatusChangePopup(true);
  };



 

  // Fetch tasks from localStorage when component mounts
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (storedTasks) {
      setTasks(storedTasks);
    }
  }, [setTasks]);

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
        {tasks?.map((task) => (
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
        <div> <button
        onClick={() => openStatusChangePopup(task)}
      >
        Change Status
      </button></div>
      )}

              
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;














const filterTasks = () => {
    let filteredTasks = tasks.filter((task) => {
      const isDueDateMatch =
        !filterDueDate || new Date(task.dueDate).toISOString().split("T")[0] === filterDueDate;
      const isStatusMatch = !filterStatus || task.status === filterStatus;
      return isDueDateMatch && isStatusMatch;
    });

    // Sort tasks by dueDate (ascending), then by status (ascending)
    filteredTasks.sort((a, b) => {
      const dueDateA = new Date(a.dueDate);
      const dueDateB = new Date(b.dueDate);
      
      if (dueDateA !== dueDateB) {
        return dueDateA - dueDateB; // Sort by dueDate
      }
      
      // If dueDates are equal, sort by status (you can adjust this sorting logic based on your requirements)
      return a.status.localeCompare(b.status);
    });

    return filteredTasks;
  };



  