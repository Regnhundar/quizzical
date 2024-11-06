import { renderGameOver, renderQuestion, renderQuestionResult, renderQuestions } from "./modules/rendering.js";
import { fetchQuestions, fetchSessionToken } from "./utilities/apiFunctions.js";
import { gameData } from "./utilities/gameData.js";
import { getFromSessionStorage, storeInSessionStorage } from "./utilities/storageFunctions.js";
import { decodeQuestion, getMultiplier } from "./utilities/utilityFunctions.js";
window.addEventListener("DOMContentLoaded", () => {
    if (document.location.pathname.endsWith("/")) {
        console.log("Hemma");
    }
    if (document.location.pathname.endsWith("game.html")) {
        setAmountOfQuestions();
        setBettingRange();
    }
});
async function handleStartGame(e, input) {
    e.preventDefault();
    resetGameData();
    const timeOfToken = getFromSessionStorage("timeOfToken");
    const sixHoursInMs = 6 * 60 * 60 * 1000;
    const isTokenTooOld = timeOfToken ? typeof timeOfToken === "string" && Date.now() - parseInt(timeOfToken) > sixHoursInMs : true;
    if (isTokenTooOld) {
        const token = await fetchSessionToken();
        if (token) {
            storeInSessionStorage("timeOfToken", Date.now());
            storeInSessionStorage("token", token);
        }
    }
    const questions = await fetchQuestions(parseInt(input));
    if (questions) {
        const decodedQuestions = [];
        questions.forEach((question) => {
            const decodedQuestion = decodeQuestion(question);
            decodedQuestions.push(decodedQuestion);
        });
        storeInSessionStorage("questions", decodedQuestions);
        const header = document.querySelector("header");
        header.classList.remove("d-none");
        gameData.numberOfQuestions = parseInt(input);
        renderQuestions();
    }
}
export function handleQuestion(event) {
    const target = event.currentTarget;
    const index = target.dataset.index;
    const difficulty = target.dataset.difficulty;
    const questions = sessionStorage.getItem("questions");
    if (questions && index) {
        const parsedQuestions = JSON.parse(questions);
        const selectedQuestion = parsedQuestions[parseInt(index)];
        gameData.correct_answer = parsedQuestions[parseInt(index)].correct_answer;
        gameData.multiplier = getMultiplier(difficulty);
        renderQuestion(selectedQuestion);
    }
    target.classList.add("question--answered");
    target.removeEventListener("click", handleQuestion);
    gameData.countDown = setTimeout(() => {
        finalAnswer();
        gameData.countDown = null;
    }, 40000);
}
export function finalAnswer() {
    const button = document.querySelector(".selected-question__button");
    button.removeEventListener("click", finalAnswer);
    if (gameData.countDown) {
        clearTimeout(gameData.countDown);
        gameData.countDown = null;
    }
    const selectedRadio = document.querySelector(".selected-question__answer-selector[name=answer]:checked");
    const selectedAnswer = selectedRadio ? selectedRadio.value : null;
    const isCorrectAnswer = selectedAnswer === gameData.correct_answer;
    if (isCorrectAnswer) {
        gameData.points = gameData.points += gameData.bet * gameData.multiplier;
        console.log("Correct!", gameData.points);
    }
    else {
        gameData.points = gameData.points - gameData.bet;
        console.log("Incorrect!", gameData.points);
    }
    const betSelector = document.querySelector("#betSelector");
    if (betSelector)
        betSelector.max = gameData.points.toString();
    const timer = document.querySelector(".selected-question__timer");
    timer?.classList.add("hide");
    renderQuestionResult(isCorrectAnswer);
    checkForValidBet();
    const totalPoints = document.querySelector("#totalPoints");
    if (totalPoints)
        totalPoints.textContent = gameData.points.toString();
    setTimeout(() => {
        checkForGameOver();
        gameData.correct_answer = null;
    }, 3000);
}
function setAmountOfQuestions() {
    const value = document.querySelector("#numberOfQuestions");
    const input = document.querySelector("#numberSelector");
    const button = document.querySelector("#optionsSubmitButton");
    value.textContent = input.value;
    input.addEventListener("input", (e) => {
        const target = e.target;
        value.textContent = target.value;
    });
    button.addEventListener("click", (e) => {
        handleStartGame(e, input.value);
    });
}
function setBettingRange() {
    const bettingSelector = document.querySelector("#betSelector");
    bettingSelector.max = gameData.points.toString();
    const betAmountDisplay = document.querySelector("#betAmount");
    betAmountDisplay.textContent = bettingSelector.value;
    bettingSelector.addEventListener("input", (e) => {
        const target = e.target;
        let value = parseInt(target.value);
        gameData.bet = value;
        betAmountDisplay.textContent = gameData.bet.toString();
    });
}
function checkForGameOver() {
    const answeredQuestions = document.querySelectorAll(".question--answered");
    if (answeredQuestions.length === gameData.numberOfQuestions || gameData.points < 1) {
        renderGameOver();
        console.error("GAME OVER!");
    }
}
function checkForValidBet() {
    const bettingSelector = document.querySelector("#betSelector");
    const betAmountDisplay = document.querySelector("#betAmount");
    if (gameData.bet > gameData.points) {
        gameData.bet = gameData.points;
        bettingSelector.value = gameData.bet.toString();
        betAmountDisplay.textContent = gameData.bet.toString();
    }
}
function resetGameData() {
    gameData.points = 1000;
    gameData.bet = 100;
    gameData.multiplier = 1;
    gameData.countDown = null;
    gameData.correct_answer = null;
    gameData.isGameOver = false;
}
