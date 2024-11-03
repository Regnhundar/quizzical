import { fetchQuestions, fetchSessionToken } from "./utilities/apiFunctions.js";
import { Question } from "./utilities/interfaces.js";
import { getFromSessionStorage, storeInSessionStorage } from "./utilities/storageFunctions.js";
import { decodeQuestion, fisherYatesShuffle } from "./utilities/utilityFunctions.js";

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
        articleRef.addEventListener("click", handleQuestion);
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

function handleQuestion(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const index = target.dataset.index;
    const questions = sessionStorage.getItem("questions");
    if (questions && index) {
        const parsedQuestions: Question[] = JSON.parse(questions);
        const selectedQuestion = parsedQuestions[parseInt(index)];
        renderQuestion(selectedQuestion);
    }
}

function renderQuestion(questionInfo: Question): void {
    const gameBoard = document.querySelector("#gameBoard") as HTMLElement;

    const existingDialog = document.querySelector("#question");
    existingDialog && existingDialog.remove();

    const wrapper = document.createElement("dialog") as HTMLDialogElement;
    wrapper.id = "question";
    wrapper.classList.add("selected-question");

    const category = document.createElement("h2") as HTMLHeadingElement;
    category.textContent = questionInfo.category;
    category.classList.add("selected-question__category");
    wrapper.appendChild(category);
    // const amount = document.createElement("h3") as HTMLHeadingElement;
    const question = document.createElement("p") as HTMLParagraphElement;
    question.textContent = questionInfo.question;
    question.classList.add("selected-question__question");
    wrapper.appendChild(question);

    const answerWrapper = document.createElement("div") as HTMLDivElement;
    answerWrapper.classList.add("question__answers-wrapper");

    const answers = [questionInfo.correct_answer];
    questionInfo.incorrect_answers.forEach((answer) => {
        answers.push(answer);
    });

    const shuffledAnswers = fisherYatesShuffle(answers);

    shuffledAnswers.forEach((answer, i) => {
        const answerLabel = document.createElement("label") as HTMLLabelElement;
        answerLabel.setAttribute("for", `option${i}`);
        answerLabel.classList.add("question__answer-label");
        answerLabel.textContent = answer;

        const answerOption = document.createElement("input") as HTMLInputElement;
        answerOption.setAttribute("type", "radio");
        answerOption.setAttribute("name", "answer");
        answerOption.id = `option${i}`;
        answerOption.classList.add("selected-question__answer-selector");
        answerLabel.appendChild(answerOption);

        answerWrapper.appendChild(answerLabel);
    });

    wrapper.appendChild(answerWrapper);
    const button = document.createElement("button") as HTMLButtonElement;
    button.classList.add("selected-question__button");
    button.addEventListener("click", finalAnswer);
    button.textContent = "FINAL ANSWER!";

    wrapper.appendChild(button);

    gameBoard.appendChild(wrapper);

    wrapper.showModal();
}

function finalAnswer(): void {
    const dialog = document.querySelector("#question") as HTMLDialogElement;
    dialog.close();
}
// <dialog class="question" id="question">
//     <h2 class="question__category"></h2>
//     <h3 class="question__amount"></h3>
//     <p class="question__question"></p>
//     <div class="question__answers-wrapper">
//         <label for="option1" class="question__answer-label">
//             {" "}
//             <input type="radio" name="option1" id="option1" />{" "}
//         </label>
//         <label for="option2" class="question__answer-label">
//             {" "}
//             <input type="radio" name="option2" id="option2" />{" "}
//         </label>
//         <label for="option3" class="question__answer-label">
//             {" "}
//             <input type="radio" name="option3" id="option3" />{" "}
//         </label>
//     </div>
//     <button class="question__submit-button">FINAL ANSWER!</button>
// </dialog>;
