const Task = require("../model/task");
const ActiveLog=require("../model/activelog")
const moment = require('moment'); // Import moment
// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, status, assignedUser } = req.body;
    
    const task = new Task({ title, description, dueDate, status, assignedUser });
    await task.save();
    
    const currentDate = new Date();
    const date = currentDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format
    
    const currentTime = moment().format('HH:mm:ss');
    var value=await ActiveLog.create({
      action:'create a task',
      userId:task.assignedUser,
      taskId:task._id,
      date:date,
      updateTime:currentTime
    })
    console.log(value,'value')
    // const task1 = new ActiveLog({ title, description, dueDate, status, assignedUser });
    // await task1.save();
    res.status(201).json({ message: "Task created successfully", data: task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read all tasks
const getTasks = async (req, res) => {
  try {
    console.log("check")
    const tasks = await Task.find().populate("assignedUser", "username role");
    res.status(200).json({ data: tasks });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const logdetails=async(req,res)=>{
  if(req.query.role=='Admin'){
    const details=await ActiveLog.find().populate("userId", "username").populate("taskId","title")
    res.status(200).json({ data: details });
  }
  else{
    const details=await ActiveLog.find({userId:req.query.role}).populate("userId", "username").populate("taskId","title")
    res.status(200).json({ data: details });
  }
}
// Read a single task by ID
const getTaskById = async (req, res) => {
  try {
    console.log("getTaskById",req.params.id)
    const task = await Task.find({assignedUser:req.params.id});
    console.log(task,"673781e880523123811c41f8")
    if (!task) return res.status(200).json({ message: "Task not found" });

    res.status(200).json({ data: task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, status, assignedUser,id,changestatus } = req.body;
    if(changestatus==true){
      console.log("checkfindyaa")
      let check=await Task.find({_id:id})
      console.log(check)
      const currentDate = new Date();
    const date = currentDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format
    
    const currentTime = moment().format('HH:mm:ss');
    var value=await ActiveLog.create({
      action:'status change',
      userId:check[0].assignedUser,
      taskId:id,
      date:date,
      updateTime:currentTime,
      details:status
    })
    const task = await Task.findByIdAndUpdate(
      id,
      {  status },
      { new: true, runValidators: true }
    );
    res.status(200).json({ message: "Task updated successfully", data: task });
    }
    else{
      const task = await Task.findByIdAndUpdate(
        id,
        { title, description, dueDate, status, assignedUser },
        { new: true, runValidators: true }
      );
  
      if (!task) return res.status(404).json({ message: "Task not found" });
      const currentDate = new Date();
      const date = currentDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      
      const currentTime = moment().format('HH:mm:ss');
      var value=await ActiveLog.create({
        action:'update a task',
        userId:assignedUser,
        taskId:id,
        date:date,
        updateTime:currentTime,
        details:status
      })
      res.status(200).json({ message: "Task updated successfully", data: task });
    }
    
   
   
  } catch (error) {
    console.log("errpor",error)
    res.status(400).json({ error: error.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    console.log(task,'task')
    if (!task) return res.status(404).json({ message: "Task not found" });
    const currentDate = new Date();
    const date = currentDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format
    
    const currentTime = moment().format('HH:mm:ss');
    var value=await ActiveLog.create({
      action:'delete  a task',
      userId:task.assignedUser,
      taskId:task._id,
      date:date,
      updateTime:currentTime
    })
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  logdetails
};