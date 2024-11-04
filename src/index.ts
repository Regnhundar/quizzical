import { renderQuestion, renderQuestions } from "./modules/rendering.js";
import { fetchQuestions, fetchSessionToken } from "./utilities/apiFunctions.js";
import { gameData } from "./utilities/gameData.js";
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
    const sixHoursInMs: number = 6 * 60 * 60 * 1000;
    const isTokenTooOld: boolean = timeOfToken ? typeof timeOfToken === "string" && Date.now() - parseInt(timeOfToken) > sixHoursInMs : true;
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

export function handleQuestion(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const index = target.dataset.index;
    const questions = sessionStorage.getItem("questions");
    if (questions && index) {
        const parsedQuestions: Question[] = JSON.parse(questions);
        const selectedQuestion = parsedQuestions[parseInt(index)];
        gameData.correct_answer = parsedQuestions[parseInt(index)].correct_answer;
        renderQuestion(selectedQuestion);
    }

    gameData.countDown = setTimeout(() => {
        finalAnswer();
        gameData.countDown = null;
    }, 10000);
}

export function finalAnswer(): void {
    const button = document.querySelector(".selected-question__button") as HTMLButtonElement;
    const dialog = document.querySelector("#question") as HTMLDialogElement;
    dialog.classList.add("no-touching");
    button.removeEventListener("click", finalAnswer);

    if (gameData.countDown) {
        clearTimeout(gameData.countDown);
        gameData.countDown = null;
    }
    const selectedRadio = document.querySelector(".selected-question__answer-selector[name=answer]:checked") as HTMLInputElement | null;

    const selectedAnswer = selectedRadio ? selectedRadio.value : null;

    if (selectedAnswer) {
        const isCorrectAnswer = selectedAnswer === gameData.correct_answer;

        console.log(isCorrectAnswer);
    } else {
        console.log(false);
    }
    const timer = document.querySelector(".selected-question__timer");
    timer?.classList.add("hide");

    setTimeout(() => {
        const dialog = document.querySelector("#question") as HTMLDialogElement;
        dialog.close();
        gameData.correct_answer = null;
    }, 3000);
}
