const URLS_STORAGE = 'URLS_STORAGE';
const TABLE_CONTENTS_STORAGE = "TABLE_CONTENTS_STORAGE";

const LS = {
    getAllItems: () => chrome.storage.local.get(),
    getItem: async key => (await chrome.storage.local.get(key))[key],
    removeItems: keys => chrome.storage.local.remove(keys),
};

function genericOnClick(info, tab) {
    switch (info.menuItemId) {
        case 'download':
            console.log('Downloading...');
            Promise.all([downloadURLAsCSV(), downloadTableContentsAsCSV()]).then(values => {
                values.forEach(value => {
                    console.log(value);
                })
                console.log('Download done.');
            });
            break;
        case 'clear':
            console.log('Clearing...');
            LS.removeItems([URLS_STORAGE, TABLE_CONTENTS_STORAGE]);
            console.log('Clearing done.');
            break;
    }   
}

async function downloadTableContentsAsCSV() {
    const csv = [];
    let urls = await LS.getItem(TABLE_CONTENTS_STORAGE); 
    if(urls) {
        urls = JSON.parse(urls);
        csv.push("Module;Titre");
        urls.forEach(row => {
            const contents = row.contents;
            contents.forEach(content => {
                csv.push(`${row.module};${content}`);
            })
        })
    }
    return csv.join("\n");
}

async function downloadURLAsCSV() {
    const parseNumb = (moduleName) => {
        const regex = /\d+/g;
        const result = regex.exec(moduleName);
        if (!result) {
            console.log(`ERROR OCCURED ${JSON.stringify(row)}`);
            return -1;
        }
        return result;
    }
    const csv = [];
    let urls = await LS.getItem(URLS_STORAGE); 
    if(urls) {
        urls = JSON.parse(urls);
        urls.sort((a, b) => {
            return parseNumb(a.module) - parseNumb(b.module);
        });
        csv.push("Module;Titre;URL");
        urls.forEach(row => {
            csv.push(`${row.module};${row.title};${row.url}`);
        })
    }
    return csv.join("\n");
}

function downloadFromData() {
    const file = `data/cybersecurite_videos.json`;
    fetch(chrome.runtime.getURL(file))
        .then((response) => response.json())
        .then((json) => console.log(json))
        .catch(error => showText("Error lors du téléchargement du JSON"))
}


chrome.contextMenus.onClicked.addListener(genericOnClick);

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        title: 'Télécharger les données de URLs GETTER',
        id: 'download',
    });
    chrome.contextMenus.create({
        title: 'Vider la base de URLs GETTER',
        id: 'clear',
    });
});