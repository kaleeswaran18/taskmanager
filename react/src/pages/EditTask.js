// src/pages/EditTask.js
import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext"; // Use the combined AppContext
import TaskForm from "../components/TaskForm";

const EditTask = () => {
  const { id } = useParams();
  const { tasks } = useContext(AppContext); // Use AppContext instead of TaskContext
  const task = tasks.find((task) => task.id === parseInt(id));

  return (
    <div>
      <h1>Edit Task</h1>
      {task ? <TaskForm existingTask={task} /> : <p>Task not found.</p>}
    </div>
  );
};

export default EditTask;
