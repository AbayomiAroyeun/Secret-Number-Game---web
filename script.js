
const userInputElement = document.getElementById("userInputText");
const outputTextElement = document.getElementById("outputText");
const trackerTextElement = document.getElementById("trackerText");
const roundsCountElement = document.getElementById("roundsCount");
const startBttn = document.getElementById("start");
const resetBtn = document.getElementById("resetBtn");
const responseContainer = document.getElementById("responseContainer");

//Game state 
let possibleNumbers = [];
let currentQuestionIndex = 0;
let originalPayerName = "";
let roundsWon = 0;

//Load persistent high score: pull record from local storage memory instattly on boot
if (localStorage.getItem("secretGameHighScore")) {
    roundsWon = perseInt(localStorage.getItem("secretGameHighScore"), 10);
    roundsCountElement.textContent = roundsWon;
}
//Logic scale rules handle 20 items
const gameQuestions = [
    {
        text: "is your secret number greater than 10?",
        filter: (num, isYes) => isYes ? num > 10 : num <= 10
    },
    {
        text: "Is the number an EVEN number (divisible by 2)?",
        filter: (num, isYes) => isYes ? num % 2 === 0 : num % 2 !== 0
    },
    {
        text: "Is the number perfectly divisible by 3?",
        filter: (num, isYes) => isYes ? num % 3 === 0 : num % 3 !== 0
    },
    {
        text: "is the number perfectly divisible by 5?",
        filter: (num, isYes) => isYes ? num % 5 === 0 : num % 5 !== 0
    },
    {
        text: "is the last digit of your secret number greater than 5?",
        filter: (num, isYes) => isYes ? (num % 10 > 5) : (num % 10 <= 5)
    },
    {
        text: "if you divide your number by 4, is the remainder 0 or 1? yes or no?",
        filter: (num, isYes) => isYes ? (num % 4 === 0 || num % 4 === 1) : (num % 4 !== 0 && num % 4 !== 0)
    }
];
// Generates chimes instantly without needing raw files
function playChime(isWinSound) {
    const audioctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioctx.createOscillator();
    const gainNode = audioctx.createGain();

    oscillator.type = 'sine';
    // success victory pitch vs pitch transition
    oscillator.frequency.setValueAtTime(isWinSound ? 587.33 : 329.63, audioctx.currentTime);
    if (isWinSound) {
        oscillator.frequency.setValueAtTime(880, audioctx.currentTime + 0.1);

    }

    gainNode.gain.setValueAtTime(0.1, audioctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioctx.currentTime + 0.4);

    oscillator.connect(gainNode);
    gainNode.connect(audioctx.destination);

    oscillator.start();
    oscillator.stop(audioctx.currentTime + 0.4);
}


//listen to start button click
startBttn.addEventListener('click', () => {
    //get and trimmed value from the user
    const playerName = userInputElement.value.trim();
    // Validate input and print input
    if (playerName === "") {
        triggerTextupdate(outputTextElement, "Please type your name");
        outputTextElement.classList.remove("hidden");
    } else {
        originalPayerName = playerName;
        outputTextElement.classList.remove("hidden");
        //print the name of the user/player
        triggerTextUpdate(outputTextElement, `Welcome, ${playerName}!`);

        // hide or disable user input element
        userInputElement.disable = true;
        userInputElement.value = `👤player: ${playerName}`;
        userInputElement.classList.add("player-badge");

        /* hide the start button and name box after 1.5 seconds*/
        setTimeout(() => {
            startBttn.style.display = "none";
            startGame();
        }, 1500);
    }
});
function startGame() {
    // Generate aaray from 1 to 20 automatically
    possibleNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
    currentQuestionIndex = 0;
    trackerTextElement.classList.remove("hidden");
    showQuestion();
}

function showQuestion() {
    triggerTextUpdate(trackerTextElement, `filtering.....(${possibleNumbers.length} possibilities left`);
    triggerTextUpdate(outputTextElement, gameQuestions[currentQuestionIndex].text);
    showGameButtons();
}

function handleAnswer(answer) {
    playChime(false); // Triggers quick feedback tone on button click

    const currentQuestion = gameQuestions[currentQuestionIndex];
    possibleNumbers = possibleNumbers.filter(num => currentQuestion.filter(num, answer));

    //win condition check
    if (possibleNumbers.length <= 1) {
        const finalGuess = possibleNumbers.length === 1 ? possibleNumbers[0] : "undertemined (check your answers)";
        revealSecretNumbers(finalGuess);
        return;
    }
    currentQuestionIndex++;
    // safely cycle or fallback if deplete unpredictably
    if (currentQuestionIndex >= gameQuestions.length) {
        revealSecretNumbers(possibleNumbers[0]);
        return;
    }

    showQuestion();
}

function triggerTextUpdate(element, newText) {
    element.textContent = newText;
    element.classList.remove("slide-in");
    void element.offsetwidth; // magic browser reset switch to replay css transition animation
    element.classList.add("slide-in");
}

function showGameButtons() {
    responseContainer.innerHTML = "";

    //create a yes button
    const yesButton = document.createElement("button");
    yesButton.textContent = "Yes";
    yesButton.className = "game-btn yes-btn";
    yesButton.addEventListener("click", () => handleAnswer(true));

    //create "No" button
    const noButton = document.createElement("button");
    noButton.textContent = "No";
    noButton.className = "game-btn no-btn";
    noButton.addEventListener("click", () => handleAnswer(false));

    //Put buttons in the container and reveal it 
    responseContainer.appendChild(yesButton);
    responseContainer.appendChild(noButton);
    responseContainer.classList.remove("hidden");

}
function revealSecretNumber(number) {
    playChime(true); // Triggers celebratory victory sound layout sequence
    responseContainer.classList.add("didden");
    trackerTextElement.classList.add("hidden");

    triggerTextUpdate(outputTextElement, `🎉  Your secre number is ${number}!`);

    roundsWon++;
    roundsCountElement.textContent = roundsWon;

    // save local storage permanently: value is retained even across devices reboots
    localStorage.setItem("secretGameHighScore", roundsWon);

    resetBtn.classList.remove("hidden");
}

resetBtn.addEventListener('click', () => {
    resetBtn.classList.add("Hidden");
    outputTextElement.classList.add('hidden');


    userInputElement.disabled = false;
    userInputElement.value = originalPayerName;
    userInputElement.classList.remove("player-badge");

    startBttn.style.display = "inline-block";

});




