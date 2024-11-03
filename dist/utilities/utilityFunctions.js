// API sparar informationen i "HTML Codes" för att inte få "Don&‌#039;t forget that &‌pi; = 3.14 &‌amp; doesn&‌#039;t equal 3"
// så skickas texten till en temporär-div vars innerHTML konverterar till vanlig text.
export function decodeQuestion(question) {
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
// Generic. Tar en array av typ "type" och returnerar en array of typ "type".
export function fisherYatesShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
