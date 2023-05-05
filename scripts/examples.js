/* USE LOCALSTORAGE IN SERVICE WORKER */
const LS = {
    getAllItems: () => chrome.storage.local.get(),
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({
        [key]: val
    }),
    removeItems: keys => chrome.storage.local.remove(keys),
};

async function pruneStorage() {
    const remover = Date.now() - 2500000000;
    const key = lastchecked[0];
    if (await LS.getItem(key) < remover) {
        await LS.setItem(key, Date.now());
    } else {
        const toRemove = Object.entries(await LS.getAllItems())
            .map(([k, v]) => v < remover && k)
            .filter(Boolean);
        if (toRemove.length) {
            await LS.removeItems(toRemove);
        }
    }
}