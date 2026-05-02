// src/global.d.ts
declare module 'redux-persist/integration/react' {
    import React from 'react';

    interface PersistGateProps {
        children: React.ReactNode;
        loading: React.ReactNode | null;
        persistor: any; // یا اگر نوع persistor را می‌دانید دقیق‌تر مشخص کنید
    }

    export const PersistGate: React.FC<PersistGateProps>;
}

declare module 'redux-persist/lib/storage' {
    const storage: any;
    export default storage;
}