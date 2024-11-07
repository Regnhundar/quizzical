import { renderGameOver, renderHighScores, renderQuestion, renderQuestionResult, renderQuestions } from "./modules/rendering.js";
import { fetchQuestions, fetchSessionToken } from "./utilities/apiFunctions.js";
import { gameData } from "./utilities/gameData.js";
import { Question } from "./utilities/interfaces.js";
import { getFromSessionStorage, storeInSessionStorage } from "./utilities/storageFunctions.js";
import { decodeQuestion, getMultiplier, resetGameData, setupHighScores } from "./utilities/utilityFunctions.js";

window.addEventListener("DOMContentLoaded", () => {
    if (document.location.pathname.endsWith("/")) {
        setupHighScores();
    }
    if (document.location.pathname.endsWith("game.html")) {
        setAmountOfQuestions();
        setBettingRange();
        renderHighScores();
    }
});

async function handleStartGame(e: MouseEvent, input: string): Promise<void> {
    e.preventDefault();
    resetGameData();
    const timeOfToken = getFromSessionStorage("timeOfToken");
    const sixHoursInMs: number = 6 * 60 * 60 * 1000;
    const isTokenTooOld: boolean = timeOfToken ? typeof timeOfToken === "string" && Date.now() - parseInt(timeOfToken) > sixHoursInMs : true;
    if (isTokenTooOld) {
        const token: string | void = await fetchSessionToken();
        if (token) {
            storeInSessionStorage("timeOfToken", Date.now());
            storeInSessionStorage("token", token);
        }
    }
    const questions: Question[] | void = await fetchQuestions(parseInt(input));
    if (questions) {
        const decodedQuestions: Question[] = [];
        questions.forEach((question) => {
            const decodedQuestion = decodeQuestion(question);
            decodedQuestions.push(decodedQuestion);
        });

        storeInSessionStorage("questions", decodedQuestions);
        const header = document.querySelector("header") as HTMLElement;
        header.classList.remove("d-none");
        gameData.numberOfQuestions = parseInt(input);
        document.querySelector<HTMLOListElement>(".high-scores")?.classList.add("d-none");
        renderQuestions();
    }
}

export function handleQuestion(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const index: string | undefined = target.dataset.index;

    const difficulty: string | undefined = target.dataset.difficulty;
    const questions: string | null = sessionStorage.getItem("questions");
    if (questions && index) {
        const parsedQuestions: Question[] = JSON.parse(questions);
        const selectedQuestion: Question = parsedQuestions[parseInt(index)];
        gameData.correct_answer = parsedQuestions[parseInt(index)].correct_answer;
        gameData.multiplier = getMultiplier(difficulty);
        renderQuestion(selectedQuestion);
    }
    if (index) gameData.answeredQuestion = index;
    target.removeEventListener("click", handleQuestion);

    gameData.countDown = setTimeout(() => {
        finalAnswer();
        gameData.countDown = null;
    }, 15000);
}

export function finalAnswer(): number | void {
    const button = document.querySelector(".selected-question__button") as HTMLButtonElement;

    button.removeEventListener("click", finalAnswer);

    if (gameData.countDown) {
        clearTimeout(gameData.countDown);
        gameData.countDown = null;
    }
    const selectedRadio = document.querySelector(".selected-question__answer-selector[name=answer]:checked") as HTMLInputElement | null;

    const selectedAnswer: string | null = selectedRadio ? selectedRadio.value : null;
    const isCorrectAnswer: boolean = selectedAnswer === gameData.correct_answer;
    if (isCorrectAnswer) {
        gameData.points = gameData.points += gameData.bet * gameData.multiplier;
    } else {
        gameData.points = gameData.points - gameData.bet;
    }
    const betSelector = document.querySelector("#betSelector") as HTMLInputElement;
    if (betSelector) betSelector.max = gameData.points.toString();

    const timer = document.querySelector(".selected-question__timer") as HTMLElement;
    timer?.classList.add("hide");

    renderQuestionResult(isCorrectAnswer);
    checkForValidBet();
    const totalPoints = document.querySelector("#totalPoints") as HTMLHeadingElement;
    if (totalPoints) totalPoints.textContent = gameData.points.toString();
}

function setAmountOfQuestions() {
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
function setBettingRange() {
    const bettingSelector = document.querySelector("#betSelector") as HTMLInputElement;
    bettingSelector.max = gameData.points.toString();

    const betAmountDisplay = document.querySelector("#betAmount") as HTMLParagraphElement;
    betAmountDisplay.textContent = bettingSelector.value;

    bettingSelector.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        let value: number = parseInt(target.value);

        gameData.bet = value;
        betAmountDisplay.textContent = gameData.bet.toString();
    });
}

export function checkForGameOver() {
    const answeredQuestions: NodeListOf<HTMLElement> = document.querySelectorAll(".question--answered");

    if (answeredQuestions.length === gameData.numberOfQuestions || gameData.points < 1) {
        renderGameOver();
    }
}

function checkForValidBet() {
    const bettingSelector = document.querySelector("#betSelector") as HTMLInputElement;
    const betAmountDisplay = document.querySelector("#betAmount") as HTMLParagraphElement;
    if (gameData.bet > gameData.points) {
        gameData.bet = gameData.points;
        bettingSelector.value = gameData.bet.toString();
        betAmountDisplay.textContent = gameData.bet.toString();
    }
}
