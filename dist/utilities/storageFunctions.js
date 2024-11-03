export function storeInSessionStorage(storageKey, dataToStore) {
    sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
}
export function getFromSessionStorage(storageKey) {
    const item = sessionStorage.getItem(storageKey);
    return item && JSON.parse(item);
}
export function removeFromSessionStorage(storageKey) {
    sessionStorage.removeItem(storageKey);
}
