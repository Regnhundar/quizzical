export async function fetchQuestions(amount) {
    try {
        if (amount > 50)
            throw new Error("Nä. Max 50 frågor får man hämta.");
        const token = sessionStorage.getItem("token");
        const parsedToken = token && JSON.parse(token);
        const response = await fetch(`https://opentdb.com/api.php?amount=${amount}&token=${parsedToken}`);
        if (!response.ok)
            throw new Error("Nä. Nä det gick inte att hämta de där frågorna.");
        const data = await response.json();
        return data && data.results;
    }
    catch (error) {
        console.error(error);
    }
}
export async function fetchSessionToken() {
    try {
        const response = await fetch("https://opentdb.com/api_token.php?command=request");
        if (!response.ok)
            throw new Error("Nä. Nä det gick inte att hämta en token.");
        const data = await response.json();
        return data && data.token;
    }
    catch (error) {
        console.error(error);
    }
}
