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
import { decodeQuestion } from "./utilities/utilityFunctions.js";
window.addEventListener("DOMContentLoaded", () => {
    if (document.location.pathname.endsWith("/")) {
        console.log("Hemma");
    }
    if (document.location.pathname.endsWith("game.html")) {
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
});
function handleStartGame(e, input) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
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
            renderQuestions();
        }
    });
}
export function handleQuestion(event) {
    const target = event.currentTarget;
    const index = target.dataset.index;
    const questions = sessionStorage.getItem("questions");
    if (questions && index) {
        const parsedQuestions = JSON.parse(questions);
        const selectedQuestion = parsedQuestions[parseInt(index)];
        gameData.correct_answer = parsedQuestions[parseInt(index)].correct_answer;
        renderQuestion(selectedQuestion);
    }
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
    if (selectedAnswer) {
        const isCorrectAnswer = selectedAnswer === gameData.correct_answer;
        console.log(isCorrectAnswer);
    }
    else {
        console.log(false);
    }
    const timer = document.querySelector(".selected-question__timer");
    timer === null || timer === void 0 ? void 0 : timer.classList.add("hide");
    setTimeout(() => {
        const dialog = document.querySelector("#question");
        dialog.close();
        gameData.correct_answer = null;
    }, 3000);
}
