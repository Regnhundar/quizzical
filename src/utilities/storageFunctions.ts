import { Question } from "./interfaces";
export function storeInSessionStorage(storageKey: string, dataToStore: Question[] | string | number): void {
    sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
}

export function getFromSessionStorage(storageKey: string): Question[] | string | null {
    const item = sessionStorage.getItem(storageKey);
    return item ? JSON.parse(item) : null;
}

export function removeFromSessionStorage(storageKey: string) {
    sessionStorage.removeItem(storageKey);
}
