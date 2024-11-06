var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function fetchQuestions(amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (amount > 50)
                throw new Error("Nä. Max 50 frågor får man hämta.");
            const token = sessionStorage.getItem("token");
            const parsedToken = token && JSON.parse(token);
            const response = yield fetch(`https://opentdb.com/api.php?amount=${amount}&token=${parsedToken}`);
            if (!response.ok)
                throw new Error("Nä. Nä det gick inte att hämta de där frågorna.");
            const data = yield response.json();
            return data && data.results;
        }
        catch (error) {
            console.error(error);
        }
    });
}
export function fetchSessionToken() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("https://opentdb.com/api_token.php?command=request");
            if (!response.ok)
                throw new Error("Nä. Nä det gick inte att hämta en token.");
            const data = yield response.json();
            return data && data.token;
        }
        catch (error) {
            console.error(error);
        }
    });
}
