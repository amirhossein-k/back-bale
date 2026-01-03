// src\store\index.ts


import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist';
import {

  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import { encryptTransform } from 'redux-persist-transform-encrypt';
import storage from './storage';
import cartPlanReducer from '@/store/Slice/planeSlice'

const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY ?? 'secretkey2338wfef@h';
import BaleDataReducer from '@/store/Slice/BaleDateSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['baleData', 'cartPlan'],
  transforms: [
    encryptTransform({
      secretKey: secretKey, // حتماً این مقدار را از منبع امن بگیر
      onError: (err) => {
        console.error('Encryption error:', err);
      },
    }),
  ],
};


// ترکیب همه ریدوسرها
const rootReducer = combineReducers({
  dataBale: BaleDataReducer,
  cartPlan: cartPlanReducer


});
// اضافه کردن persist به ریدوسر اصلی
const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(persistConfig, rootReducer);

// ساختن store با ریدوسر پِرسیست‌شده
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});


export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch