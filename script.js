let wordsByLevel = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
let playerNames = {};
let scoresByPlayer = {};
let usedWordsByLevel = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set(), 6: new Set() };
let currentLevel = 1;
let currentWord = "";
let currentPlayer = 1;
const CLEAR_DATA_PASSWORD = "RDB";

function loadCSV() {
    fetch('words.csv')
        .then(response => response.text())
        .then(text => parseCSV(text))
        .catch(error => console.error('Error loading CSV:', error));
}

function parseCSV(text) {
    const lines = text.split("\n");
    for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(",");
        for (let j = 0; j < 6; j++) {
            let word = columns[j].trim();
            if (word) {
                wordsByLevel[j + 1].push(word);
            }
        }
        let playerNumber = columns[6].trim();
        let playerName = columns[7].trim();
        if (playerNumber && playerName) {
            playerNames[playerNumber] = playerName;
        }
    }
    getRandomWord();
}

function getRandomWord() {
    let words = wordsByLevel[currentLevel].filter(word => !usedWordsByLevel[currentLevel].has(word));
    
    if (words.length > 0) {
        currentWord = words[Math.floor(Math.random() * words.length)];
        document.getElementById("spelling-input").value = "";
        document.getElementById("feedback").innerText = "";
    } else {
        currentWord = "";
        document.getElementById("feedback").innerText = "No more words available.";
    }
}

function checkSpelling() {
    let userSpelling = document.getElementById("spelling-input").value;
    let correctSound = document.getElementById("correct-sound");
    let wrongSound = document.getElementById("wrong-sound");
    
    if (userSpelling.toLowerCase() === currentWord.toLowerCase()) {
        document.getElementById("feedback").innerText = "Correct!";
        scoresByPlayer[currentPlayer][currentLevel]++;
        correctSound.play();
        document.getElementById("score").innerText = scoresByPlayer[currentPlayer][currentLevel];
        usedWordsByLevel[currentLevel].add(currentWord); // Mark the word as used
        saveScores();
        getRandomWord();
    } else {
        document.getElementById("feedback").innerText = "Try again!";
        wrongSound.play();
    }
}

function speakWord() {
    let utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.rate = 0.6; // Set the speed to 60% of the normal speed
    window.speechSynthesis.speak(utterance);
}

function nextWord() {
    getRandomWord();
    speakWord();
}

function changeLevel() {
    currentLevel = parseInt(document.getElementById("level-select").value);
    let utterance = new SpeechSynthesisUtterance("You have selected level " + currentLevel);
    window.speechSynthesis.speak(utterance);
    document.getElementById("score").innerText = scoresByPlayer[currentPlayer][currentLevel]; // Update the displayed score
    usedWordsByLevel[currentLevel] = new Set(); // Reset used words when changing levels
    getRandomWord();
}

function changePlayer() {
    currentPlayer = parseInt(document.getElementById("player-select").value);
    if (currentPlayer === 71) { // "CLEAR DATA" option
        clearAllScores();
    } else {
        loadScores();
        document.getElementById("score").innerText = scoresByPlayer[currentPlayer][currentLevel];
        displayPlayerName(); // Display the player’s name
        greetPlayer(); // Greet the player by name
    }
}

function displayPlayerName() {
    let playerName = playerNames[currentPlayer];
    if (playerName) {
        document.getElementById("player-name").innerText = `Player: ${playerName}`;
    } else {
        document.getElementById("player-name").innerText = "Player: Not selected";
    }
}

function greetPlayer() {
    let playerName = playerNames[currentPlayer];
    if (playerName) {
        let utterance = new SpeechSynthesisUtterance(`Welcome ${playerName}. Good luck!`);
        window.speechSynthesis.speak(utterance);
    }
}

function saveScores() {
    localStorage.setItem('scoresByPlayer', JSON.stringify(scoresByPlayer));
}

function loadScores() {
    const savedScores = localStorage.getItem('scoresByPlayer');
    if (savedScores) {
        scoresByPlayer = JSON.parse(savedScores);
    }
    if (!scoresByPlayer[currentPlayer]) {
        scoresByPlayer[currentPlayer] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    }
}

function initializePlayerOptions() {
    const playerSelect = document.getElementById("player-select");
    let selectPlayerOption = document.createElement("option");
    selectPlayerOption.value = "";
    selectPlayerOption.text = "Select Player";
    playerSelect.appendChild(selectPlayerOption);
    
    for (let i = 1; i <= 70; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = `Player ${i}`;
        playerSelect.appendChild(option);
    }
    
    let clearDataOption = document.createElement("option");
    clearDataOption.value = 71;
    clearDataOption.text = "CLEAR DATA";
    playerSelect.appendChild(clearDataOption);
}

function initializeLevelOptions() {
    const levelSelect = document.getElementById("level-select");
    let chooseLevelOption = document.createElement("option");
    chooseLevelOption.value = "";
    chooseLevelOption.text = "Choose Level";
    levelSelect.appendChild(chooseLevelOption);

    for (let i = 1; i <= 6; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = `Level ${i}`;
        levelSelect.appendChild(option);
    }
}

function initialize() {
    initializePlayerOptions();
    initializeLevelOptions();
    loadScores();
    currentPlayer = parseInt(document.getElementById("player-select").value);
    document.getElementById("score").innerText = scoresByPlayer[currentPlayer][currentLevel];
}

function clearAllScores() {
    if (confirm("Warning: This will delete all scores for all players. Type 'RDB' to confirm.")) {
        let password = prompt("Enter the password to confirm:");
        if (password === CLEAR_DATA_PASSWORD) {
            localStorage.removeItem('scoresByPlayer');
            scoresByPlayer = {};
            alert("All scores have been cleared.");
            initialize(); // Reinitialize player options and scores
        } else {
            alert("Incorrect password. Scores were not cleared.");
        }
    }
}

// Automatically load CSV file when the game is opened
window.onload = function() {
    loadCSV();
    initialize();
};
