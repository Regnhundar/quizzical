var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { renderQuestion, renderQuestions } from "./modules/rendering.js";
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
function handleStartGame(e, input) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        resetGameData();
        const timeOfToken = getFromSessionStorage("timeOfToken");
        const sixHoursInMs = 6 * 60 * 60 * 1000;
        const isTokenTooOld = timeOfToken ? typeof timeOfToken === "string" && Date.now() - parseInt(timeOfToken) > sixHoursInMs : true;
        if (isTokenTooOld) {
            const token = yield fetchSessionToken();
            if (token) {
                storeInSessionStorage("timeOfToken", Date.now());
                storeInSessionStorage("token", token);
            }
        }
        const questions = yield fetchQuestions(parseInt(input));
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
    });
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
    }, 10000);
}
export function finalAnswer() {
    const button = document.querySelector(".selected-question__button");
    const dialog = document.querySelector("#question");
    dialog.classList.add("no-touching");
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
    timer === null || timer === void 0 ? void 0 : timer.classList.add("hide");
    setTimeout(() => {
        const dialog = document.querySelector("#question");
        checkForGameOver();
        dialog.close();
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
        if (gameData.points < value) {
            value = gameData.points;
        }
        gameData.bet = value;
        betAmountDisplay.textContent = value.toString();
    });
}
function checkForGameOver() {
    const answeredQuestions = document.querySelectorAll(".question--answered");
    if (answeredQuestions.length === gameData.numberOfQuestions || gameData.points === 0) {
        console.error("GAME OVER!");
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
