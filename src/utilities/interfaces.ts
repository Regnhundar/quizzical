export interface Question {
    type: "multiple" | "boolean";
    difficulty: "easy" | "medium" | "hard";
    category: string;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}

export interface GameData {
    points: number;
    bet: number;
    countDown: ReturnType<typeof setTimeout> | null; //setTimeout är type number i de flesta javascript libraries men inte alla. Därav denna lösning.
    correct_answer: string | null;
    isGameOver: boolean;
}
