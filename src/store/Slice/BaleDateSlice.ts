// src\store\orderSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

//  buildingId={data.buildings[0]?.id}
// userId={user.id}

interface BaleTypeData {
    buildingId: string
    userId: number
}

const initialState: BaleTypeData = {
    buildingId: '',
    userId: 0
}

const BaleDataSlice = createSlice({
    name: "baleData", // ✅ نام اسلایس را به cart تغییر می‌دهیم
    initialState,
    reducers: {
        // به‌روزرسانی تعداد یک محصول
        DateBaleSetAction: (state, action: PayloadAction<{ buildingId: string; userId: number }>) => {
            const { buildingId, userId } = action.payload;

            state.buildingId = buildingId
            state.userId = userId
        },


    },
});

export const {

    DateBaleSetAction,
} = BaleDataSlice.actions
export default BaleDataSlice.reducer