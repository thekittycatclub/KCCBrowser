import { KCCDatabase } from "./database.js";

export class KCCProxy {
    constructor(frame) {
        this.database = new KCCDatabase("$kittycatclub", 1, {
            images: { keyPath: "id", autoIncrement: true }
        });

        this.baremux = new BareMux.BareMuxConnection("/baremux/worker.js");
        this.scramjet = null, this.KCCFRAME = null, this.frame = frame;

        this.cache = {
            DOM: new Map(),
            STORAGE: new Map(),
        }
    }

    // cache function thingy for elements
    async $$(key, source = "DOM") {
        if (this.cache[source].has(key)) {
            return this.cache[source].get(key);
        }

        let value = document.querySelector(key);
        if (value !== null) {
            this.cache[source].set(key, value);
            return value;
        }

        return null;
    }

    async initialize() {
        // scramjet init
        const { ScramjetController } = $scramjetLoadController();
        this.scramjet = new ScramjetController({
            files: {
                wasm: '/scram/scramjet.wasm.wasm',
                all: '/scram/scramjet.all.js',
                sync: '/scram/scramjet.sync.js',
            },
            prefix: "/scramjet/",
        });

        this.scramjet.init();
        this.KCCFRAME = this.scramjet.createFrame(this.frame);

        const form = await this.$$("#sj-form"),
            address = await this.$$("#sj-address"),
            searchEngine = await this.$$("#sj-search-engine"),
            error = {
                message: await this.$$("#sj-error"),
                code: await this.$$("#sj-error-code")
            };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            try { await registerSW(); } catch (err) {
                error.message.innerText = "Failed to register service worker.";
                error.code.innerText = err.toString();
                throw err;
            }

            let wisp = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
            if ((await connection.getTransport()) !== "/epoxy/index.mjs")
                await connection.setTransport("/epoxy/index.mjs", [{ wisp }]);

            this.KCCFRAME.go(this.search(address.value, searchEngine.value));
        });

        address.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return;
            form.dispatchEvent(new Event('submit'));
        });

        this.KCCFRAME.addEventListener("urlchange", async (e) => {
            address.value = e.url;
            (await this.$$("#tab1-title")).textContent = this.frame.contentDocument.title;
            (await this.$$("#tab1-favicon")).src = this.frame.contentDocument.querySelector('link[rel="icon"]').href;

            this.frame.onload = async () => {
                const iframeDoc = iframe.contentDocument;
                let title = iframeDoc?.title;

                if (!title)
                    title = new URL(iframe.src).hostname.replace(/^www\./, "");

                (await this.$$("#tab1-title")).innerText = title;
                const icon = iframeDoc?.querySelector('link[rel="icon"]');
                if (icon && icon.href) {
                    document.getElementById("tab1-favicon").setAttribute("src", scramjet.encodeUrl(icon.href));
                }
            };
        });
    }

    search(query, engine) {
        try { return new URL(input).toString(); } catch (err) { }

        try {
            const url = new URL(`http://${input}`) || new URL(`https://${query}`);
            if (url.hostname.includes(".")) return url.toString();
        } catch (err) { }

        return engine.replace("%s", encodeURIComponent(input));
    }

    async browserControls(command, data = null) {
        switch (command) {
            case "BACK":
                this.KCCFRAME.forward();
                break;
            case "FORWARD":
                this.KCCFRAME.back();
                break;
            case "RELOAD":
                this.KCCFRAME.reload();
                break;
            case "SETSEARCHENGINE":
                await this.database.put("settings", { id: "SEARCH_ENGINE", value: data });
                this.$$('#sj-search-engine').value = data;
                break;
            case "SETACTIVEURL":
                this.KCCFRAME.go(data);
                break;
        }
    }
}