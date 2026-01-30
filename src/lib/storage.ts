// Party Lions - Enhanced Storage with IndexedDB Backup
// Provides offline-first data persistence with automatic recovery

const DB_NAME = 'party-lions-db';
const DB_VERSION = 1;
const STORE_NAME = 'tournament-data';
const KEY = 'current-tournament';

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB for backup storage
 */
export async function initDatabase(): Promise<boolean> {
    return new Promise((resolve) => {
        if (!window.indexedDB) {
            console.warn('IndexedDB not supported, using localStorage only');
            resolve(false);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.warn('IndexedDB failed to open, using localStorage only');
            resolve(false);
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            console.log('IndexedDB initialized for offline backup');
            resolve(true);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            // Create object store for tournament data
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };
    });
}

/**
 * Save tournament data to IndexedDB (backup)
 */
export async function saveToIndexedDB(data: unknown): Promise<boolean> {
    if (!db) return false;

    return new Promise((resolve) => {
        try {
            const transaction = db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.put({
                key: KEY,
                data: data,
                timestamp: Date.now()
            });

            request.onsuccess = () => {
                console.log('Tournament backed up to IndexedDB');
                resolve(true);
            };

            request.onerror = () => {
                console.warn('Failed to backup to IndexedDB');
                resolve(false);
            };
        } catch (error) {
            console.warn('IndexedDB save error:', error);
            resolve(false);
        }
    });
}

/**
 * Load tournament data from IndexedDB (recovery)
 */
export async function loadFromIndexedDB<T>(): Promise<T | null> {
    if (!db) return null;

    return new Promise((resolve) => {
        try {
            const transaction = db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(KEY);

            request.onsuccess = () => {
                const result = request.result;
                if (result?.data) {
                    console.log('Tournament recovered from IndexedDB');
                    resolve(result.data as T);
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => {
                resolve(null);
            };
        } catch (error) {
            console.warn('IndexedDB load error:', error);
            resolve(null);
        }
    });
}

/**
 * Clear IndexedDB data
 */
export async function clearIndexedDB(): Promise<boolean> {
    if (!db) return false;

    return new Promise((resolve) => {
        try {
            const transaction = db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(KEY);

            request.onsuccess = () => resolve(true);
            request.onerror = () => resolve(false);
        } catch (error) {
            resolve(false);
        }
    });
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
    return navigator.onLine;
}

/**
 * Custom Zustand storage with dual persistence (localStorage + IndexedDB)
 */
export function createDualStorage() {
    return {
        getItem: (name: string): string | null => {
            try {
                // Try localStorage first
                const value = localStorage.getItem(name);
                if (value) return value;

                // Fallback handled separately via IndexedDB
                return null;
            } catch (error) {
                console.warn('Storage read error:', error);
                return null;
            }
        },

        setItem: (name: string, value: string): void => {
            try {
                // Save to localStorage
                localStorage.setItem(name, value);

                // Also backup to IndexedDB (async, non-blocking)
                const parsed = JSON.parse(value);
                saveToIndexedDB(parsed.state).catch(() => { });
            } catch (error) {
                console.warn('Storage write error:', error);
            }
        },

        removeItem: (name: string): void => {
            try {
                localStorage.removeItem(name);
                clearIndexedDB().catch(() => { });
            } catch (error) {
                console.warn('Storage remove error:', error);
            }
        }
    };
}

/**
 * Attempt recovery from IndexedDB if localStorage is empty/corrupted
 */
export async function attemptRecovery(storageKey: string): Promise<boolean> {
    try {
        // Check if localStorage has data
        const localData = localStorage.getItem(storageKey);
        if (localData) {
            // Data exists, no recovery needed
            return false;
        }

        // Initialize IndexedDB
        await initDatabase();

        // Try to recover from IndexedDB
        const recoveredData = await loadFromIndexedDB();
        if (recoveredData) {
            // Restore to localStorage
            localStorage.setItem(storageKey, JSON.stringify({ state: recoveredData }));
            console.log('✅ Tournament data recovered from backup!');
            return true;
        }

        return false;
    } catch (error) {
        console.warn('Recovery failed:', error);
        return false;
    }
}

/**
 * Export current data as downloadable JSON backup
 */
export function exportAsFile(data: unknown, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Import data from JSON file
 */
export function importFromFile(file: File): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
