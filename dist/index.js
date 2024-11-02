var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fetchQuestions, fetchSessionToken } from "./utilities/apiFunctions.js";
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
function renderQuestions() {
    const questions = getFromSessionStorage("questions");
    if (!questions || !Array.isArray(questions)) {
        console.error("Questions is not an array or is null.");
        return;
    }
    const gameboardRef = document.querySelector("#gameBoard");
    if (gameboardRef)
        gameboardRef.innerHTML = "";
    questions === null || questions === void 0 ? void 0 : questions.forEach((question, i) => {
        const articleRef = document.createElement("article");
        articleRef.classList.add("question");
        articleRef.dataset.index = `${i}`;
        const titleRef = document.createElement("h2");
        titleRef.classList.add("question__category");
        if (question.category.includes(":")) {
            const [mainCategory, subCategory] = question.category.split(/:(.+)/);
            const mainCategorySpanRef = document.createElement("span");
            mainCategorySpanRef.classList.add("question__category--main");
            mainCategorySpanRef.textContent = mainCategory + ":";
            titleRef.appendChild(mainCategorySpanRef);
            const subCategorySpanRef = document.createElement("span");
            subCategorySpanRef.classList.add("question__category--sub");
            subCategorySpanRef.textContent = " " + subCategory.trim();
            titleRef.appendChild(subCategorySpanRef);
        }
        else {
            titleRef.textContent = question.category;
        }
        articleRef.appendChild(titleRef);
        const subtitleRef = document.createElement("h3");
        subtitleRef.textContent = question.difficulty;
        articleRef.appendChild(subtitleRef);
        gameboardRef === null || gameboardRef === void 0 ? void 0 : gameboardRef.appendChild(articleRef);
    });
}
