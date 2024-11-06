import { finalAnswer, handleQuestion } from "../index.js";
import { getFromSessionStorage } from "../utilities/storageFunctions.js";
import { fisherYatesShuffle } from "../utilities/utilityFunctions.js";
export function renderQuestions() {
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
        articleRef.addEventListener("click", handleQuestion);
        articleRef.classList.add("question");
        articleRef.dataset.index = `${i}`;
        articleRef.dataset.difficulty = question.difficulty;
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
// export function renderBettingHud(): void {
//     const wrapper = document.querySelector(".wrapper") as HTMLElement;
//     const header = document.createElement("header") as HTMLElement;
//     const form = document.createElement("form") as HTMLFormElement;
//     form.classList.add("betting-hud");
//     const label = document.createElement("label") as HTMLLabelElement;
//     label.classList.add("betting-hud__input-wrapper");
//     const input = document.createElement("input") as HTMLInputElement;
//     input.type = "range";
//     const p = document.createElement("p") as HTMLParagraphElement;
//     const button = document.createElement("button") as HTMLButtonElement;
// }
export function renderQuestion(questionInfo) {
    const gameBoard = document.querySelector("#gameBoard");
    const existingDialog = document.querySelector("#question");
    existingDialog && existingDialog.remove();
    const wrapper = document.createElement("dialog");
    wrapper.id = "question";
    wrapper.classList.add("selected-question");
    const grid = document.createElement("div");
    grid.classList.add("selected-question__grid");
    const category = document.createElement("h2");
    category.textContent = questionInfo.category;
    category.classList.add("selected-question__category");
    grid.appendChild(category);
    // const amount = document.createElement("h3") as HTMLHeadingElement;
    const question = document.createElement("p");
    question.textContent = questionInfo.question;
    question.classList.add("selected-question__question");
    grid.appendChild(question);
    const answerWrapper = document.createElement("div");
    answerWrapper.classList.add("selected-question__answers-wrapper");
    const answers = [questionInfo.correct_answer];
    questionInfo.incorrect_answers.forEach((answer) => {
        answers.push(answer);
    });
    const shuffledAnswers = fisherYatesShuffle(answers);
    shuffledAnswers.forEach((answer, i) => {
        const answerLabel = document.createElement("label");
        answerLabel.setAttribute("for", `option${i}`);
        answerLabel.classList.add("selected-question__answer-label");
        const labelText = document.createElement("span");
        labelText.classList.add("selected-question__answer-label--text");
        labelText.textContent = answer;
        const answerOption = document.createElement("input");
        answerOption.setAttribute("type", "radio");
        answerOption.setAttribute("name", "answer");
        answerOption.id = `option${i}`;
        answerOption.value = answer;
        answerOption.classList.add("selected-question__answer-selector");
        answerLabel.appendChild(answerOption);
        answerLabel.appendChild(labelText);
        answerWrapper.appendChild(answerLabel);
    });
    grid.appendChild(answerWrapper);
    const timer = document.createElement("figure");
    timer.classList.add("selected-question__timer");
    grid.appendChild(timer);
    const button = document.createElement("button");
    button.classList.add("selected-question__button");
    button.addEventListener("click", finalAnswer);
    button.textContent = "Final answer!";
    grid.appendChild(button);
    wrapper.appendChild(grid);
    gameBoard.appendChild(wrapper);
    wrapper.showModal();
}
