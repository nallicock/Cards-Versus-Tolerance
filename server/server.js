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

function logRoom(roomCode) {
    const room = rooms[roomCode];

    console.log(`\n===== ROOM ${roomCode} =====`);
    console.table(room.players);
}

function generateRoomCode() {

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";

    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
}

function updateLobby(roomCode) {

    const room = rooms[roomCode];

    if (!room) return;

    io.to(roomCode).emit("lobby-update", room.players);

}

io.on("connection", (socket) => {
    console.log("CLIENT CONNECTED:", socket.id);

    socket.emit("welcome", "Welcome to the server!");
    socket.emit("your-id", socket.id);

    socket.on("hello", (message) => {
        console.log(message);
    });

    socket.on("set-name", (name) => {
        console.log("EVENT RECEIVED: set-name");
        socket.playerName = name;
        console.log(`${socket.id} is now ${name}`);
    });

    socket.on("disconnect", () => {
        const roomCode = socket.roomCode;

        if (!roomCode) return;

        const room = rooms[roomCode];

        if (!room) return;

        const wasHost = room.host === socket.id;

        // Remove the player
        room.players = room.players.filter(player => player.id !== socket.id);

        // Delete empty room
        if (room.players.length === 0) {
            delete rooms[roomCode];
            console.log(`Deleted room ${roomCode}`);
            return;
        }

        // Choose a new random host
        if (wasHost) {

            const randomIndex = Math.floor(Math.random() * room.players.length);

            room.players.forEach(player => {
                player.isHost = false;
            });

            room.players[randomIndex].isHost = true;
            room.host = room.players[randomIndex].id;

            console.log(`${room.players[randomIndex].name} is the new host.`);
        }

        updateLobby(roomCode);
    });

    socket.on("create-room", () => {

        const roomCode = generateRoomCode();

        rooms[roomCode] = {
            host: socket.id,
            players: [
                {
                    id: socket.id,
                    name: socket.playerName,
                    drinks: 0,
                    isHost: true
                }
            ],
            started: false
        };

        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.emit("room-created", roomCode);
        updateLobby(roomCode);

        console.log("Room created: ", rooms);

    });

    socket.on("join-room", (roomCode) => {

        const room = rooms[roomCode];

        if (!room) {
            socket.emit("join-error", "Room does not exist.");
            return;
        }

        // add player
        room.players.push({
            id: socket.id,
            name: socket.playerName || "Unknown",
            drinks: 0
        });

        socket.join(roomCode);
        socket.roomCode = roomCode;

        console.log(`${socket.id} joined room ${roomCode}`);

        socket.emit("join-success", roomCode);
        updateLobby(roomCode);
        logRoom(roomCode);
    });

    socket.on("kick-player", (playerId) => {

        const roomCode = socket.roomCode;

        if (!roomCode) return;

        const room = rooms[roomCode];

        if (!room) return;

        // Only the host can kick
        if (room.host !== socket.id) {
            return;
        }

        // Host cannot kick themselves
        if (playerId === socket.id) {
            return;
        }

        const kickedSocket = io.sockets.sockets.get(playerId);

        if (!kickedSocket) {
            return;
        }

        room.players = room.players.filter(player => player.id !== playerId);

        kickedSocket.leave(roomCode);
        kickedSocket.roomCode = null;

        kickedSocket.emit("kicked");

        updateLobby(roomCode);

        console.log(`${kickedSocket.playerName} was kicked from ${roomCode}`);
    });

    
});