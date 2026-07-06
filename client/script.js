let cardMessages = [];
let savedCards = [];

const playerNameVerbiageEnglish = [
    "Call an uber, ",
    "You're going to need a bucket, ",
    "I hope you had something to eat, ",
    "If you're religious, I suggest you pray, ",
    "I hope you didn't drive tonight, "
];

const playerNameVerbiageSpanish = [
    "Pide un Uber, ",
    "Vas a necesitar un balde, ",
    "Espero que hayas comido algo, ",
    "Si eres religioso, te sugiero que reces, ",
    "Espero que no hayas conducido esta noche, "
];

let language = "";

document.addEventListener("DOMContentLoaded", () => {
    let myId = "";
    console.log("SCRIPT LOADED");
    const langMenu = document.getElementById("language-menu");
    const nameSelect = document.getElementById("name-select");
    const cardSection = document.getElementById("card-section");
    const joinRoom = document.getElementById("join-room-section");
    const mainMenu = document.getElementById("main-menu");
    const englishBtn = document.getElementById("english-btn");
    const spanishBtn = document.getElementById("spanish-btn");
    const restartGameBtn = document.getElementById("restart-game-btn");
    const nameBtn = document.getElementById("name-btn");
    const createRoomBtn = document.getElementById("create-room-btn");
    const joinRoomBtn1 = document.getElementById("join-room-1-btn");
    const joinRoomBtn2 = document.getElementById("join-room-2-btn");
    const roomInput = document.getElementById("room-input");
    const joinStatus = document.getElementById("join-room-status");
    const lobbyScreen = document.getElementById("lobby-screen");
    const playerList = document.getElementById("player-list");
    const roomCodeDisplay = document.getElementById("room-code-display");
    const startGameBtn = document.getElementById("start-game-btn");
    const nextCardBtn = document.getElementById("nextCard");

    const socket = io();

    const nameForm = document.getElementById("name-form");
    const inputName = document.getElementById("input-name");

    let playerName = "";

    console.log("Attempting to connect...");

    socket.on("your-id", (id) => {
        myId = id;
    });

    socket.on("welcome", (message) => {
        console.log(message);
    });

    socket.on("kicked", () => {
        alert("You were kicked from the lobby.");
        lobbyScreen.style.display = "none";
        mainMenu.style.display = "block";
    });
    

    socket.on("connect", () => {
        console.log("Connected to server:", socket.id);
        socket.emit("set-name", "TEST_FROM_LOAD");
    });

    socket.on("room-created", (roomCode) => {

        console.log("Room created:", roomCode);

        document.getElementById("room-code-display").textContent =
            `Room Code: ${roomCode}`;
        mainMenu.style.display = "none";
        lobbyScreen.style.display = "block";
    });

    socket.on("lobby-update", (players) => {

        renderPlayerList(players);

    });

    socket.on("join-success", (roomCode) => {
        joinStatus.textContent = `Joined room ${roomCode}`;
        console.log("Joined room:", roomCode);
        
        roomCodeDisplay.textContent = `Room: ${roomCode}`;

        mainMenu.style.display = "none";
        lobbyScreen.style.display = "block";
    });

    socket.on("join-error", (message) => {
        joinStatus.textContent = message;
        console.log("Join error:", message);
    });

    socket.on("room-created", (roomCode) => {
        roomCodeDisplay.textContent = `Room: ${roomCode}`;
        mainMenu.style.display = "none";
        lobbyScreen.style.display = "block";
    });

    socket.on("game-started", () => {
        console.log("Game started!");
        lobbyScreen.style.display = "none";
        cardSection.style.visibility = "visible";
        restartGameBtn.style.visibility = "visible";
        loadCards();
    });

    socket.on("new-card", (card) => {

        if (language === "en") {

            document.getElementById("card-content").textContent =
                card.text_en;

        }
        else {

            document.getElementById("card-content").textContent =
                card.text_es;

        }

    });

    socket.emit("hello", "Hi server!");

    englishBtn.addEventListener("click", () => {
        language = "en";
        console.log(language); // "en"
        langMenu.style.display = "none";
        //cardSection.style.visibility = "visible";
        //restartGameBtn.style.visibility = "visible";
        nameSelect.style.display = "block";
        //loadCards();
    });

    spanishBtn.addEventListener("click", () => {
        language = "es";
        console.log(language); // "es"
        langMenu.style.display = "none";
        //cardSection.style.visibility = "visible";
        //restartGameBtn.style.visibility = "visible";
        nameSelect.style.display = "block";
        //loadCards();
    });

    nameBtn.addEventListener("click", () => {
        nameSelect.style.display = "none";
        mainMenu.style.display = "block";
    });

    createRoomBtn.addEventListener("click", () => {

        socket.emit("create-room");

    });

    joinRoomBtn1.addEventListener("click", () => {
        mainMenu.style.display = "none";
        joinRoom.style.display = "block";
    });
        
    joinRoomBtn2.addEventListener("click", () => {
        const roomCode = roomInput.value.trim().toUpperCase();
        console.log("Joining room:", roomCode);
        if (!roomCode) {
            joinStatus.textContent = "Please enter a room code.";
            return;
        }
        joinRoom.style.display = "none";
        socket.emit("join-room", roomCode);        
    });

    startGameBtn.addEventListener("click", () => {
        socket.emit("start-game");
    });

    nextCardBtn.addEventListener("click", () => {

        socket.emit("next-card");

    });

    function renderPlayerList(players) {

        playerList.innerHTML = "";

        const amIHost = players.find(player => player.id === myId)?.isHost;

        if (amIHost) {
            startGameBtn.style.display = "block";
        }
        else {
            startGameBtn.style.display = "none";
        }

        players.forEach((player) => {

            const row = document.createElement("div");

            const name = document.createElement("span");

            if (player.isHost) {
                name.textContent = `HOST - ${player.name}`;
            } else {
                name.textContent = player.name;
            }

            row.appendChild(name);

            if (amIHost && player.id !== myId) {

                const kickButton = document.createElement("button");

                kickButton.textContent = "Kick";

                kickButton.addEventListener("click", () => {

                    socket.emit("kick-player", player.id);

                });

                row.appendChild(kickButton);
            }

            playerList.appendChild(row);

        });

    }

    function getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function showNextCard () {
        const randomIndex = getRandomItem(cardMessages);

        console.log(randomIndex);

        if (language === "en")
        {
            document.getElementById("card-content").textContent =
            cardMessages[randomIndex].text_en;
        }
        else
        {
            document.getElementById("card-content").textContent =
            cardMessages[randomIndex].text_es;
        }

        if (cardMessages[randomIndex].category === "saved" || 
            cardMessages[randomIndex].category === "reverse"
        )
        {
            console.log("saved card");
            savedCards.push(cardMessages[randomIndex]);
            renderSavedCards();
            console.log("saved card array: ", cardMessages[randomIndex]);
        }
    }

    async function loadCards() {
        const response = await fetch("getDrunkMessages.json");
        cardMessages = await response.json();

        console.log(cardMessages.length); // Should be 500
        socket.emit("next-card");
    }


    function renderSavedCards() {
        const container = document.getElementById("saved-cards");
        container.innerHTML = "";
        savedCards.forEach(card => {
            const div = document.createElement("div");
            div.id = "saved-card";

            const button = document.createElement("button");
            button.id = "drawSavedCard-btn";
            button.textContent = "Use";

            button.addEventListener("click", () => {
            // Remove it from the saved cards array
                savedCards = savedCards.filter(c => c.id !== card.id);

                // Refresh the saved cards display
                renderSavedCards();
                console.log(savedCards);
            });
            
            div.textContent = card[`text_${language}`];
            div.appendChild(button);
            container.appendChild(div);
        });
    }

    function restartGame() {
        savedCards = [];
        cardMessages = [];

        document.getElementById("saved-cards").innerHTML = "";
        document.getElementById("card-content").textContent = "";

        loadCards();
        console.log("Restarted game.")
    }

    nameForm.addEventListener("submit", (event) => {

        event.preventDefault();

        playerName = inputName.value.trim();

        if (playerName === "") {
            alert("Please enter a name.");
            return;
        }

        console.log(playerName);
        console.log("Emitting set name.. ", playerName);
        socket.emit("set-name", playerName);
        let namePhrase = "";

        if (language === "en") {
            namePhrase = getRandomItem(playerNameVerbiageEnglish);
        } else {
            namePhrase = getRandomItem(playerNameVerbiageSpanish);
        }

        document.getElementById("player-name-display").textContent =
            `${namePhrase}${playerName}.`;     
        });

    /*
    TODO: 

    Implement socket.io + node.js backend to add online multiplayer
    Implement Scoreboard for how many drinks someone has had
    Add selfie option to all players in the lobby
    Add card rotation system to order players
    If you get a card with category 'pass', create dropdown window to choose name
    Add pass and reverse categories for cards with conditional buttons
    Add 'Use safe card' button
    Add 'Gift/Donate Card' button so players can donate safe cards to others
    Make the application look beautiful with nice transitions and css
    Add event box to see what special cards players have used.
    Add title for the room
    Allow hosts to create their own passwords
    Add KICK PLAYER FROM LOBBY
    Move player functionality when creating table layout - only allow host to move
    Up to 20 players in a lobby
    Concept art that matches young adult demographic
    Make some kind of public and private lobby functionality so people can see open rooms


    COMPLETED:
    Implement a restart game button - done
    Implement main menu that allows you to select English or Spanish - done
    Implement logic so that if spanish is selected, all cards appear as spanish for that player. - done
    Implement SAVED CARDS section at bottom of screen - players can draw a saved card at any time - done 
    Implement functionality to click 'OK' button on the card on screen before continuing. - done


    Deploy application
    */
});