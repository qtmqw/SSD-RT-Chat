const express = require("express");
const { json, urlencoded } = express;
const cors = require("cors");
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require("socket.io");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(cors());
app.set("view engine", "ejs");
app.use(bodyParser.json());

const db = require("./DB/db");

// Create server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
});

// Pass io to routes
const User_R = require('./routes/User_R');
app.use('/u', User_R);

const createChatRouter = require('./routes/Chat_R');
const Chat_R = createChatRouter(io);
app.use('/m', Chat_R);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  // Listening for chat messages
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg); // Broadcast the message to all clients
  });
});

// port
const port = process.env.PORT || 8080;

// listener
server.listen(port, () => {
  console.log("Server started!");
});
