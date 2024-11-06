export interface Question {
    type: "multiple" | "boolean";
    difficulty: "easy" | "medium" | "hard";
    category: string;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}

export interface GameData extends ResultOfAnswer {
    numberOfQuestions: number;
    countDown: ReturnType<typeof setTimeout> | null; //setTimeout är type number i de flesta javascript libraries men inte alla. Därav denna lösning.
    isGameOver: boolean;
}

export interface ResultOfAnswer {
    points: number;
    bet: number;
    multiplier: number;
    correct_answer: string | null;
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
