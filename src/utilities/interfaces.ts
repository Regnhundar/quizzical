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
    numberOfQuestions: number;
    multiplier: number;
    countDown: ReturnType<typeof setTimeout> | null; //setTimeout är type number i de flesta javascript libraries men inte alla. Därav denna lösning.
    correct_answer: string | null;
    isGameOver: boolean;
}

export interface QuestionResponse {
    response_code: number;
    results: Question[];
}

export interface TokenResponse {
    response_code: number;
    response_message: string;
    token: string;
}
