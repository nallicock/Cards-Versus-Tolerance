let cardMessages = [];
let language = "";

const langMenu = document.getElementById("language-menu");
const cardSection = document.getElementById("card-section");
const englishBtn = document.getElementById("english-btn");
const spanishBtn = document.getElementById("spanish-btn");

englishBtn.addEventListener("click", () => {
    language = "en";
    console.log(language); // "en"
    langMenu.style.visibility = "hidden";
    cardSection.style.visibility = "visible";
    loadCards();
});

spanishBtn.addEventListener("click", () => {
    language = "es";
    console.log(language); // "es"
    langMenu.style.visibility = "hidden";
    cardSection.style.visibility = "visible";
    loadCards();
});

async function loadCards() {
    const response = await fetch("getDrunkMessages.json");
    cardMessages = await response.json();

    console.log(cardMessages.length); // Should be 500

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
}

/*
TODO: 

Implement a SKIP CARD button (for host only)
Implement SAVED CARDS section at bottom of screen - players can draw a saved card at any time
Implement multiplayer via Socket.io
Implement a restart game button
Implement main menu that allows you to select English or Spanish - done
Implement logic so that if spanish is selected, all cards appear as spanish for that player.
Implement REACT frontend, and some kind of backend. Look into this more.
Implement functionality for host to click 'OK' button on the card on screen before continuing.

Deploy application
*/