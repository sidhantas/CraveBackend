const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const gameRoomRequests = require("./Sockets/GameRoom");
const app = express();

const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);
app.use(express.json());

mongoose.connect("mongodb://localhost:27017", {useNewUrlParser: true}, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Connected");
});

const onConnection = (socket) => {
  gameRoomRequests(io, socket);
};

io.on("connection", onConnection);

server.listen(8080, () => {
  console.log("listening on port 8080");
});