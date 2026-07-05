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
    console.log("SCRIPT LOADED");
    const langMenu = document.getElementById("language-menu");
    const nameSelect = document.getElementById("name-select");
    const cardSection = document.getElementById("card-section");
    const mainMenu = document.getElementById("main-menu");
    const englishBtn = document.getElementById("english-btn");
    const spanishBtn = document.getElementById("spanish-btn");
    const restartGameBtn = document.getElementById("restart-game-btn");
    const nameBtn = document.getElementById("name-btn");
    const createRoomBtn = document.getElementById("create-room-btn");


    const socket = io();

    const nameForm = document.getElementById("name-form");
    const inputName = document.getElementById("input-name");

    let playerName = "";

    console.log("Attempting to connect...");

    socket.on("welcome", (message) => {
        console.log(message);
    });
    

    socket.on("connect", () => {
        console.log("Connected to server:", socket.id);
        socket.emit("set-name", "TEST_FROM_LOAD");
    });

    socket.on("room-created", (roomCode) => {

        console.log("Room created:", roomCode);

        document.getElementById("room-code-display").textContent =
            `Room Code: ${roomCode}`;

    });

    socket.emit("hello", "Hi server!");

    englishBtn.addEventListener("click", () => {
        language = "en";
        console.log(language); // "en"
        langMenu.style.visibility = "hidden";
        //cardSection.style.visibility = "visible";
        //restartGameBtn.style.visibility = "visible";
        nameSelect.style.visibility = "visible";
        //loadCards();
    });

    spanishBtn.addEventListener("click", () => {
        language = "es";
        console.log(language); // "es"
        langMenu.style.visibility = "hidden";
        //cardSection.style.visibility = "visible";
        //restartGameBtn.style.visibility = "visible";
        nameSelect.style.visibility = "visible";
        //loadCards();
    });

    nameBtn.addEventListener("click", () => {
        nameSelect.style.visibility = "hidden";
        mainMenu.style.visibility = "visible";
    });

    createRoomBtn.addEventListener("click", () => {

        socket.emit("create-room");

    });

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
        showNextCard();
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


    COMPLETED:
    Implement a restart game button - done
    Implement main menu that allows you to select English or Spanish - done
    Implement logic so that if spanish is selected, all cards appear as spanish for that player. - done
    Implement SAVED CARDS section at bottom of screen - players can draw a saved card at any time - done 
    Implement functionality to click 'OK' button on the card on screen before continuing. - done


    Deploy application
    */
});