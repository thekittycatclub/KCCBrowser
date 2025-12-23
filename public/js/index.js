"use strict";

import { KCCProxy } from "./browser/proxy.js";

const proxy = new KCCProxy();
console.log(KCCProxy.database)

proxy.initialize(document.getElementById("sj-frame"));

/*
  Functions for the Browser Pages to communicate with the browser's functions
  (ex. kcc://new-tab)
*/

window.addEventListener("message", (event) => {
	if (event.origin !== window.location.origin) return;

	try {
		const iframeUrl = new URL(event.source.location.href);
		if (!iframeUrl.pathname.startsWith("/browser-pages/")) return;
	} catch { return; }

	const { type, command, data } = event.data || {};
	if (type !== "BROWSER_COMMAND") return;

	command ? KCCProxy.browserControls(command, data) : (() => undefined);
});


/*
const searchEngineSelect = document.getElementById('search-engine-select');
searchEngineSelect.addEventListener('change', () => {
  searchEngine.value = searchEngineSelect.value;
});
searchEngine.value = searchEngineSelect.value;
*/