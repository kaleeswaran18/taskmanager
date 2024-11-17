import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const TaskForm = ({ existingTask }) => {
  const [formData, setFormData] = useState(
    existingTask || {
      title: "",
      description: "",
      dueDate: "",
      status: "To Do",
      assignedUser: "",
    }
  );

  const { addTask, updateTask } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (existingTask) {
      updateTask(formData);
    } else {
      addTask(formData);
    }

    navigate("/");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Title:</label>
      <input type="text" name="title" value={formData.title} onChange={handleChange} required />

      <label>Description:</label>
      <textarea name="description" value={formData.description} onChange={handleChange} required />

      <label>Due Date:</label>
      <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />

      <label>Status:</label>
      <select name="status" value={formData.status} onChange={handleChange} required>
        <option>To Do</option>
        <option>In Progress</option>
        <option>Done</option>
      </select>

      <label>Assigned User:</label>
      <input type="text" name="assignedUser" value={formData.assignedUser} onChange={handleChange} required />

      <button type="submit">{existingTask ? "Update Task" : "Create Task"}</button>
    </form>
  );
};

export default TaskForm;
