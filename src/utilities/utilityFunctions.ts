import { gameData } from "./gameData.js";
import { HighScore, Question } from "./interfaces";

// API sparar informationen i "HTML Codes" för att inte få "Don&‌#039;t forget that &‌pi; = 3.14 &‌amp; doesn&‌#039;t equal 3"
// så skickas texten till en temporär-div vars innerHTML konverterar till vanlig text.
export function decodeQuestion(question: Question): Question {
    const tempDiv = document.createElement("div") as HTMLDivElement;

    tempDiv.innerHTML = question.question;
    question.question = tempDiv.textContent || question.question;

    tempDiv.innerHTML = question.correct_answer;
    question.correct_answer = tempDiv.textContent || question.correct_answer;

    question.incorrect_answers = question.incorrect_answers.map((answer) => {
        tempDiv.innerHTML = answer;
        return tempDiv.textContent || answer;
    });

    tempDiv.innerHTML = question.category;
    question.category = tempDiv.textContent || question.category;

    return question;
}
// Generic. Tar en array av typ "type" och returnerar en array of typ "type".
export function fisherYatesShuffle<T>(array: T[]): T[] {
    for (let i: number = array.length - 1; i > 0; i--) {
        const j: number = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}
// Ger scoremultiplier beroende på svårighetsgrad av frågor.
export function getMultiplier(difficulty: string | undefined): number {
    if (difficulty === "easy") return 1;
    if (difficulty === "medium") return 2;
    if (difficulty === "hard") return 3;
    return 1;
}

export function resetGameData(): void {
    gameData.points = 1000;
    gameData.bet = 100;
    gameData.multiplier = 1;
    gameData.countDown = null;
    gameData.correct_answer = null;
    gameData.answeredQuestion = null;
}

export function setupHighScores(): void {
    const highScores: string | null = localStorage.getItem("highScores");

    if (!highScores) {
        const dummyData: HighScore[] = [
            { name: "PaellaPulis", score: 1200 },
            { name: "BaldFraud", score: 1100 },
            { name: "SpecialOne", score: 900 },
            { name: "KloppsTeeth", score: 700 },
            { name: "ErikTenGames", score: 500 },
        ];
        localStorage.setItem("highScores", JSON.stringify(dummyData));
        return;
    }
}

export function checkForHighScore(): boolean {
    const highScores: string | null = localStorage.getItem("highScores");
    const parsedHighscores: HighScore[] = JSON.parse(highScores as string);

    const isHighScore: boolean = parsedHighscores.some((highscore) => {
        return gameData.points > highscore.score;
    });

    return isHighScore;
}
export function enterHighScore(playerScore: HighScore): void {
    const highScores: string | null = localStorage.getItem("highScores");
    const parsedHighscores: HighScore[] = JSON.parse(highScores as string);
    if (parsedHighscores) parsedHighscores.pop();
    parsedHighscores.push(playerScore);
    parsedHighscores.sort((a, b) => b.score - a.score);
    localStorage.setItem("highScores", JSON.stringify(parsedHighscores));
}
