// src/utils/storage.ts
import type { Storage } from 'redux-persist';
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { WebStorage } from 'redux-persist';


const createNoopStorage = (): WebStorage => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, _value: string) {
      return Promise.resolve(); // ✅ fix: return void, not string
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};
// استفاده از storage فقط در محیط مرورگر (حل مشکل SSR)

// ✅ استفاده از import معمولی به جای require
const createWebStorage = (type: 'local' | 'session'): WebStorage => {
  // 👇 به TypeScript می‌فهمونیم که چی برمی‌گرده
  const storage: Storage = type === 'local' ? window.localStorage : window.sessionStorage;

  return {
    getItem(key: string) {
      return Promise.resolve(storage.getItem(key));
    },
    setItem(key: string, item: string) {
      storage.setItem(key, item);
      return Promise.resolve();
    },
    removeItem(key: string) {
      storage.removeItem(key);
      return Promise.resolve();
    },
  };
};

let storage: WebStorage;

if (typeof window !== 'undefined') {
  storage = createWebStorage('session'); // ✅ حالا مشخصه که sessionStorage هست
} else {
  storage = createNoopStorage(); // SSR
}

export default storage;