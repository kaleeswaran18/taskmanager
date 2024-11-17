const mongoose=require("mongoose")
mongoose.connect("mongodb://0.0.0.0/taskmanager");
const db=mongoose.connection;
db.once('open',function(){console.log("db is connected")})
db.on('error',console.error.bind(console,"db is not connect"))
