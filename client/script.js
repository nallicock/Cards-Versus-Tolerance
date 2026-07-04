let cardMessages = [];
let savedCards = [];
let language = "";

const langMenu = document.getElementById("language-menu");
const cardSection = document.getElementById("card-section");
const englishBtn = document.getElementById("english-btn");
const spanishBtn = document.getElementById("spanish-btn");
const restartGameBtn = document.getElementById("restart-game-btn");

englishBtn.addEventListener("click", () => {
    language = "en";
    console.log(language); // "en"
    langMenu.style.visibility = "hidden";
    cardSection.style.visibility = "visible";
    restartGameBtn.style.visibility = "visible";
    loadCards();
});

spanishBtn.addEventListener("click", () => {
    language = "es";
    console.log(language); // "es"
    langMenu.style.visibility = "hidden";
    cardSection.style.visibility = "visible";
    restartGameBtn.style.visibility = "visible";
    loadCards();
});

function showNextCard () {
    const randomIndex = Math.floor(Math.random() * cardMessages.length);

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