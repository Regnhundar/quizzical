import { Question } from "./interfaces";
export function storeInSessionStorage(storageKey: string, dataToStore: Question[] | string | number): void {
    sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
}

export function getFromSessionStorage(storageKey: string): Question[] | string {
    const item: string | null = sessionStorage.getItem(storageKey);
    return item && JSON.parse(item);
}

export function removeFromSessionStorage(storageKey: string) {
    sessionStorage.removeItem(storageKey);
}
