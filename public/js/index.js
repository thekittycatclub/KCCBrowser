"use strict";
/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("sj-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("sj-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("sj-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("sj-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("sj-error-code");

const { ScramjetController } = $scramjetLoadController();

const scramjet = new ScramjetController({
	files: {
		wasm: '/scram/scramjet.wasm.wasm',
		all: '/scram/scramjet.all.js',
		sync: '/scram/scramjet.sync.js',
	},
	prefix: "/scramjet/",
});

scramjet.init();

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
let KCCFRAME = scramjet.createFrame(document.getElementById("sj-frame"));
form.addEventListener("submit", async (event) => {
	event.preventDefault();

	try {
		await registerSW();
	} catch (err) {
		error.textContent = "Failed to register service worker.";
		errorCode.textContent = err.toString();
		throw err;
	}

	const url = search(address.value, searchEngine.value);

	let wispUrl =
		(location.protocol === "https:" ? "wss" : "ws") +
		"://" +
		location.host +
		"/wisp/";
	if ((await connection.getTransport()) !== "/epoxy/index.mjs") {
		await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
	}
	KCCFRAME.go(url);
});

const browserUrlInput = document.querySelector('#sj-address');
browserUrlInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    address.value = browserUrlInput.value;
    form.dispatchEvent(new Event('submit'));
  }
});

KCCFRAME.addEventListener("urlchange", (e) => {
    const iframe = document.getElementById("sj-frame");
    document.querySelector('#sj-address').value = e.url;
    iframe.onload = () => {
        const doc = iframe.contentDocument;
        let title = doc?.title;
        if (!title) {
            title = new URL(iframe.src).hostname.replace(/^www\./, "");
        }
        document.getElementById("tab1-title").innerText = title;
        const icon = doc?.querySelector('link[rel="icon"]');
        if (icon && icon.href) {
            document.getElementById("tab1-favicon").setAttribute(
                "src",
                scramjet.encodeUrl(icon.href)
            );
        }
    };
});

function KCCBrowserFrameBack() {
	KCCFRAME.back();
}
function KCCBrowserFrameForward() {
	KCCFRAME.forward();
}
function KCCBrowserFrameReload() {
	KCCFRAME.reload();
}

/*
	Functions for the Browser Pages to communicate with the browser's functions
	(ex. kcc://new-tab)
*/
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;
  try {
    const iframeUrl = new URL(event.source.location.href);
    if (!iframeUrl.pathname.startsWith("/browser-pages/")) return;
  } catch {
    return;
  }

  const { type, command, data } = event.data || {};
  if (type !== "BROWSER_COMMAND") return;

  switch (command) {
    case "BACK":
      KCCBrowserFrameBack();
      break;

    case "FORWARD":
      KCCBrowserFrameForward();
      break;

    case "RELOAD":
      KCCBrowserFrameReload();
      break;

    case "SETSEARCHENGINE":
      window.localStorage.setItem("KCCBrowser/settings/SEARCH_ENGINE", data);
      document.getElementById('sj-search-engine').value = data;
      break;

    case "SETACTIVEURL":
      KCCFRAME.go(data);
      break;
  }
});


/*
const searchEngineSelect = document.getElementById('search-engine-select');
searchEngineSelect.addEventListener('change', () => {
  searchEngine.value = searchEngineSelect.value;
});
searchEngine.value = searchEngineSelect.value;
*/