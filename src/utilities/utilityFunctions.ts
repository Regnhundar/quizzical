import { Question } from "./interfaces";

// API sparar informationen i "HTML Codes" för att inte få "Don&‌#039;t forget that &‌pi; = 3.14 &‌amp; doesn&‌#039;t equal 3"
// så skickas texten till en temporär-div vars innerHTML konverterar till vanlig text.
export function decodeQuestion(question: Question): Question {
    const tempDiv = document.createElement("div");

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
