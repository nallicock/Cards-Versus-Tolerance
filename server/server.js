const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server);
const rooms = {};

const PORT = 8000;

// Serve the public folder
app.use(express.static("client"));

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

function generateRoomCode() {

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";

    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
}

io.on("connection", (socket) => {
    console.log("CLIENT CONNECTED:", socket.id);

    socket.emit("welcome", "Welcome to the server!");

    socket.on("hello", (message) => {
        console.log(message);
    });

    socket.on("set-name", (name) => {
        console.log("EVENT RECEIVED: set-name");
        socket.playerName = name;
        console.log(`${socket.id} is now ${name}`);
    });

    socket.on("disconnect", () => {
        console.log(`${socket.id} disconnected`);
    });

    socket.on("create-room", () => {

    const roomCode = generateRoomCode();

    rooms[roomCode] = {

        host: socket.id,

        players: [],

        started: false

    };

    socket.join(roomCode);

    socket.emit("room-created", roomCode);

    console.log(rooms);

});

});