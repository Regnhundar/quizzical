import { fetchQuestions, fetchSessionToken } from "./utilities/apiFunctions.js";
import { Question } from "./utilities/interfaces.js";
import { getFromSessionStorage, storeInSessionStorage } from "./utilities/storageFunctions.js";
import { decodeQuestion } from "./utilities/utilityFunctions.js";

window.addEventListener("DOMContentLoaded", () => {
    if (document.location.pathname.endsWith("/")) {
        console.log("Hemma");
    }
    if (document.location.pathname.endsWith("game.html")) {
        const value = document.querySelector("#numberOfQuestions") as HTMLParagraphElement;
        const input = document.querySelector("#numberSelector") as HTMLInputElement;
        const button = document.querySelector("#optionsSubmitButton") as HTMLButtonElement;
        value.textContent = input.value;
        input.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            value.textContent = target.value;
        });
        button.addEventListener("click", (e: MouseEvent) => {
            handleStartGame(e, input.value);
        });
    }
});

async function handleStartGame(e: MouseEvent, input: string): Promise<void> {
    e.preventDefault();
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
        const decodedQuestions: Question[] = [];
        questions.forEach((question) => {
            const decodedQuestion = decodeQuestion(question);
            decodedQuestions.push(decodedQuestion);
        });

        storeInSessionStorage("questions", decodedQuestions);
        renderQuestions();
    }
}
function renderQuestions(): void {
    const questions = getFromSessionStorage("questions");

    if (!questions || !Array.isArray(questions)) {
        console.error("Questions is not an array or is null.");
        return;
    }
    const gameboardRef = document.querySelector("#gameBoard");
    if (gameboardRef) gameboardRef.innerHTML = "";
    questions?.forEach((question, i) => {
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
        } else {
            titleRef.textContent = question.category;
        }
        articleRef.appendChild(titleRef);

        const subtitleRef = document.createElement("h3");
        subtitleRef.textContent = question.difficulty;

        articleRef.appendChild(subtitleRef);

        gameboardRef?.appendChild(articleRef);
    });
}
