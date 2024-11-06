import { finalAnswer, handleQuestion } from "../index.js";
import { gameData } from "../utilities/gameData.js";
import { Question, ResultOfAnswer } from "../utilities/interfaces.js";
import { getFromSessionStorage } from "../utilities/storageFunctions.js";
import { fisherYatesShuffle } from "../utilities/utilityFunctions.js";

export function renderQuestions(): void {
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

export function renderQuestion(questionInfo: Question): void {
    const gameBoard = document.querySelector("#gameBoard") as HTMLElement;

    const existingDialog = document.querySelector("#question");
    existingDialog && existingDialog.remove();

    const wrapper = document.createElement("dialog") as HTMLDialogElement;
    wrapper.id = "question";
    wrapper.classList.add("selected-question");

    const grid = document.createElement("div") as HTMLDivElement;
    grid.classList.add("selected-question__grid");

    const category = document.createElement("h2") as HTMLHeadingElement;
    category.textContent = questionInfo.category;
    category.classList.add("selected-question__category");
    grid.appendChild(category);
    // const amount = document.createElement("h3") as HTMLHeadingElement;
    const question = document.createElement("p") as HTMLParagraphElement;
    question.textContent = questionInfo.question;
    question.classList.add("selected-question__question");
    grid.appendChild(question);

    const answerWrapper = document.createElement("div") as HTMLDivElement;
    answerWrapper.classList.add("selected-question__answers-wrapper");

    const answers = [questionInfo.correct_answer];
    questionInfo.incorrect_answers.forEach((answer) => {
        answers.push(answer);
    });

    const shuffledAnswers = fisherYatesShuffle(answers);

    shuffledAnswers.forEach((answer, i) => {
        const answerLabel = document.createElement("label") as HTMLLabelElement;
        answerLabel.setAttribute("for", `option${i}`);
        answerLabel.classList.add("selected-question__answer-label");

        const labelText = document.createElement("span") as HTMLSpanElement;
        labelText.classList.add("selected-question__answer-label--text");
        labelText.textContent = answer;

        const answerOption = document.createElement("input") as HTMLInputElement;
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

    const timer = document.createElement("figure") as HTMLElement;
    timer.classList.add("selected-question__timer");

    grid.appendChild(timer);

    const button = document.createElement("button") as HTMLButtonElement;
    button.classList.add("selected-question__button");
    button.addEventListener("click", finalAnswer);
    button.textContent = "Final answer!";

    grid.appendChild(button);
    wrapper.appendChild(grid);

    gameBoard.appendChild(wrapper);

    wrapper.showModal();
}

export function renderQuestionResult(isCorrect: boolean): void {
    const resultInfo: ResultOfAnswer = {
        correct_answer: gameData.correct_answer,
        bet: gameData.bet,
        multiplier: gameData.multiplier,
        points: gameData.points,
    };

    // const paragraphElement = document.createElement("h3") as HTMLHeadingElement;
    const dialogContentWrapper = document.querySelector(".selected-question__grid") as HTMLDivElement;
    dialogContentWrapper.innerHTML = "";
    const titleElement = document.createElement("h2") as HTMLHeadingElement;
    titleElement.classList.add("recap-title");

    const list = document.createElement("ul") as HTMLUListElement;
    list.classList.add("question-recap");
    const entries: [string, string | number][] = Object.entries(resultInfo);
    entries.forEach((entry, i) => {
        const listItem = document.createElement("li") as HTMLLIElement;
        listItem.classList.add("question-recap__list-item");
        const listItemTitle = document.createElement("h3") as HTMLHeadingElement;
        listItemTitle.id = `recapTitle${i}`;
        listItemTitle.classList.add("question-recap__title");
        const listItemParagraph = document.createElement("p") as HTMLParagraphElement;
        listItemParagraph.textContent = entry[1].toString();
        listItemParagraph.id = `recapParagraph${i}`;
        listItemParagraph.classList.add("question-recap__paragraph");

        listItem.appendChild(listItemTitle);
        listItem.appendChild(listItemParagraph);
        list.appendChild(listItem);
    });
    const button = document.createElement("button") as HTMLButtonElement;
    button.textContent = "CLOSE";
    button.classList.add("question-recap__button");
    button.addEventListener("click", () => {
        const dialog = document.querySelector("#question") as HTMLDialogElement;
        dialog.close();
    });

    dialogContentWrapper.appendChild(titleElement);
    dialogContentWrapper.appendChild(list);
    dialogContentWrapper.appendChild(button);
    const firstTitle = document.querySelector("#recapTitle0") as HTMLHeadElement;
    const secondTitle = document.querySelector("#recapTitle1") as HTMLHeadElement;
    const thirdTitle = document.querySelector("#recapTitle2") as HTMLHeadElement;
    const fourthTitle = document.querySelector("#recapTitle3") as HTMLHeadElement;
    firstTitle.textContent = "CORRECT ANSWER:";
    secondTitle.textContent = "YOU BET:";
    thirdTitle.textContent = "MULTIPLIER:";
    fourthTitle.textContent = "YOUR POINTS NOW:";
    if (isCorrect) {
        titleElement.textContent = "CORRECT!";
        titleElement.classList.add("recap-title--green");
    } else {
        titleElement.textContent = "INCORRECT!";
        titleElement.classList.add("recap-title--red");
    }
}

export function renderGameOver(): void {
    const main = document.querySelector(".main") as HTMLElement;
    main.innerHTML = "";
    const header = document.querySelector(".header") as HTMLElement;
    header.classList.add("d-none");

    const figure = document.createElement("figure") as HTMLElement;
    figure.classList.add("game-over");

    const button = document.createElement("button") as HTMLButtonElement;
    button.textContent = "PLAY AGAIN!";
    button.classList.add("game-over__button");
    button.addEventListener("click", () => {
        location.reload();
    });

    const title = document.createElement("h1") as HTMLHeadingElement;
    title.classList.add("game-over__title");

    title.textContent = "GAME OVER!";

    figure.appendChild(title);
    figure.appendChild(button);

    main.appendChild(figure);
}
