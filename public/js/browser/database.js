export class KCCDatabase {
    constructor(name, version, stores) {
        this.name = name;
        this.version = version;
        this.stores = stores;
        this.active_db = null;
    }

    async open() {
        if (this.active_db) return this.active_db;

        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this.name, this.version);

            req.onupgradeneeded = () => {
                const loopDB = req.result;
                for (const [storeName, options] of Object.entries(this.stores)) {
                    if (loopDB.objectStoreNames.contains(storeName)) continue;

                    const store = loopDB.createObjectStore(storeName, options);
                    options.indexes?.forEach(i => store.createIndex(i.name, i.key, i.opts));
                }
            };

            req.onsuccess = () => {
                this.active_db = req.result;
                resolve(this.active_db);
            };

            req.onerror = () => reject(req.error);
        });
    }

    close() {
        if (!this.active_db) return;
        this.active_db.close();
        this.active_db = null;
    }

    find_store = async (store, mode = "readonly") => (await this.open()).transaction(store, mode).objectStore(store);

    get = async (store, key) => this.#request((await this.find_store(store)).get(key));
    getAll = async (store) => this.#request((await this.find_store(store)).getAll());

    add = async (store, value) => this.#request((await this.find_store(store, "readwrite")).add(value));
    put = async (store, value) => this.#request((await this.find_store(store, "readwrite")).put(value));

    delete = async (store, key) => this.#request((await this.find_store(store, "readwrite")).delete(key));
    clear = async (store) => this.#request((await this.find_store(store, "readwrite")).clear());

    #request(req) {
        return new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
}