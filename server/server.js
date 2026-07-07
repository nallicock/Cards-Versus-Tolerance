const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const deck = require("../client/getDrunkMessages.json");
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

function shuffle(array) {

    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

    }

    return shuffled;

}

function sendGameState(roomCode) {

    const room = rooms[roomCode];

    if (!room) return;

    io.to(roomCode).emit("game-state", {

        card: room.deck[room.currentCard],

        currentPlayerId: room.players[room.currentTurn].id,

        currentPlayerName: room.players[room.currentTurn].name

    });

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

    socket.on("start-game-error", (message) => {
        alert(message);
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
            started: false,
            deck: [],
            currentCard: 0,
            currentTurn: 0
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

    socket.on("start-game", () => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;
        const room = rooms[roomCode];

        if (!room) return;

        // Only host can start game
        if (room.host !== socket.id) {
            socket.emit("start-game-error", "Only the host can start the game.");
            return;
        }
        room.started = true;
        io.to(roomCode).emit("game-started");
        console.log(`Game started in room ${roomCode}`);

        room.deck = shuffle(deck);

        room.currentCard = 0;

        io.to(roomCode).emit("game-started");

        sendGameState(roomCode);
    });

    socket.on("next-card", () => {

        const room = rooms[socket.roomCode];

        if (!room) return;

        if (room.host !== socket.id) return;

        room.currentCard++;

        if (room.currentCard >= room.deck.length) {

            room.currentCard = 0;

        }

        io.to(socket.roomCode).emit(
            "new-card",
            room.deck[room.currentCard]
        );

    });
    socket.on("end-turn", () => {

        const room = rooms[socket.roomCode];

        if (!room) return;

        // Only the current player may end the turn
        if (room.players[room.currentTurn].id !== socket.id) {
            return;
        }

        // Move to the next player
        room.currentTurn++;

        if (room.currentTurn >= room.players.length) {
            room.currentTurn = 0;
        }

        // Move to the next card
        room.currentCard++;

        if (room.currentCard >= room.deck.length) {
            room.currentCard = 0;
        }

        sendGameState(socket.roomCode);

    });
});