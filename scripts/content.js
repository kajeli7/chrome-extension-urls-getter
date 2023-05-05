/**
 * Whenever you change this file, you need to reload the extension throught: chrome://extensions/
 */

const URLS_STORAGE = 'URLS_STORAGE';
const TABLE_CONTENTS_STORAGE = "TABLE_CONTENTS_STORAGE";

console.log(`YOUR ARE SAVING URLS at ${new Date()}`);

document.addEventListener("DOMContentLoaded", () => {

    function getInterestingData() {
        
        if (document.querySelectorAll(".video-js").length == 0) {
            showText("No videos found");
            return;
        }
        document.querySelectorAll(".video-js").forEach(elem => {
            var parse = JSON.parse(elem.getAttribute("data-setup-lazy"));
            if (parse && parse["sources"] && parse["sources"].length == 1) {
                const urlSrc =  parse["sources"][0]["src"];
                const regex  = /^.*?(?=&)/i;
                if(!regex) {
                    const txt = `Error parsing the URL ${urlSrc}`;
                    showText(txt);
                } else {
                    // INFO: Saving all data
                    const title = document.querySelector("h2").innerText;
                    const moduleName = getModuleName();
                    saveURLS({url: regex.exec(urlSrc)[0], title: title, module: moduleName})
                }
            } else {
                showText("No urls found");
            }
        });
    }

    function getModuleName() {
        const navBar = document.querySelector("#page-navbar");
        const listContainer = document.querySelector("ol");
        let moduleName = "";
        listContainer.querySelectorAll("li").forEach(li => {
            const span = li.querySelector("a span");
            if(span) {
                const text = span.textContent;
                if(text && text.toLocaleLowerCase().includes("module")) moduleName = text;
                if(text && text.toLocaleLowerCase().includes("introduction")) moduleName = "Module 0";
            }
        });
        return moduleName;
    }

    function saveURLS(data) {
        let urls = JSON.parse(localStorage.getItem(URLS_STORAGE));
        if (urls) {
            if(urls.filter(row => row.url === data.url).length == 0) {
                urls.push(data);
            }
        } else {
            urls = [data]
        }
        localStorage.setItem(URLS_STORAGE, JSON.stringify(urls));
    }

    function showText(message) {
        console.log(message);
        const header = document.querySelector("#header1");
        if (header) {
            const badge = document.createElement("p");
            badge.style.backgroundColor = "white";
            badge.style.fontSize = "25px";
            badge.style.color = "red";
            badge.style.fontWeight = "bold";
            badge.textContent = `URL GETTERS: ${message}`;
            header.insertAdjacentElement("afterend", badge);
        }
    }

    function getModuleTableOfContents() {
        const h2Title = document.querySelector("h2.sectionname");
        if(h2Title && h2Title.textContent.toLocaleLowerCase().includes("module")) {
            const sectionName = h2Title.textContent;
            if(sectionName && sectionName.toLocaleLowerCase().includes("module")) {
                let moduleName = sectionName;
                let contents = [];
                document.querySelectorAll(".content span.instancename").forEach(contentName => {
                    if(contentName.textContent.toLocaleLowerCase().includes("annonces") == false) {
                        contents.push(contentName.textContent);
                    }
                });
                saveTableContents({contents: contents, module: moduleName});
            }
        }
        
    }

    function saveTableContents(data) {
        let urls = JSON.parse(localStorage.getItem(TABLE_CONTENTS_STORAGE));
        if (urls) {
            if(urls.filter(row => row.module === data.module).length == 0) {
                urls.push(data);
            }
        } else {
            urls = [data]
        }
        localStorage.setItem(TABLE_CONTENTS_STORAGE, JSON.stringify(urls));
    }

    function transFormToCSV(data) {
        
    }

    function downloadLocalStorage() {
        const file = `data/cybersecurite_videos.json`;
        fetch(chrome.runtime.getURL(file))
        .then((response) => response.json())
        .then((json) => console.log(json))
        .catch(error => showText("Error lors du téléchargement du JSON"))
    }

    getInterestingData();
    getModuleTableOfContents();
    downloadLocalStorage();
})