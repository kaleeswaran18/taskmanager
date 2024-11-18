var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var http = require('http'); // Import HTTP module
var { Server } = require('socket.io'); // Import Socket.IO
const cron = require("node-cron");
const model = require("./model");
const axios = require("axios");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { initializeSocket,userSockets } = require('./socket');
// const { userSockets } = require("../socket");
var app = express();
var server = http.createServer(app); // Create HTTP server
var io = initializeSocket(server);
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.set('view engine', 'jade');app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public/images')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(function (req, res, next) {
  next(createError(404));
});
cron.schedule("*/2 * * * *", async () => {
  // const { io, user } = req
  try {
    const response = await axios.get("http://localhost:7000/users/getalltask");
    // console.log("Data fetched successfully:", response.data.data);
    response.data.data.forEach((element) => {
      console.log(element)
      const userId = element.assignedUser._id;

      if (userSockets[userId]) {
        io.to(userSockets[userId]).emit('newcornjob', element);
        console.log(`Emitted to user: ${userId}`, element);
      } else {
        console.warn(`No socket connection found for user: ${userId}`);
      }
    });
    // Process the data if needed
    // Example: Save it to a database, send a notification, etc.
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Start the server
server.listen(7000, () => {
  console.log("Server running on port 7000");
});