// src\store\orderSlice.ts
import { OptionalUserModelType } from "@/types/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

//  buildingId={data.buildings[0]?.id}
// userId={user.id}
export interface bildingType {
    managerId: any;
    chatIdGroup: number;
    _id: any
}
interface BaleTypeData {
    buildingId: string
    userId: number
    bildingsId: bildingType[]
    user: OptionalUserModelType
}

const initialState: BaleTypeData = {
    buildingId: '',
    userId: 0,
    bildingsId: [],
    user: { telegramId: 0, role: 'none', botState: 'idle', phoneNumber: '' }

}

const BaleDataSlice = createSlice({
    name: "baleData", // ✅ نام اسلایس را به cart تغییر می‌دهیم
    initialState,
    reducers: {
        // به‌روزرسانی تعداد یک محصول
        DateBaleSetAction: (state, action: PayloadAction<{ buildingId: string; userId: number, bildingsId: bildingType[] }>) => {
            const { buildingId, userId, bildingsId } = action.payload;

            state.buildingId = buildingId
            state.userId = userId
            state.bildingsId = bildingsId
        },
        UserSetAction: (state, action: PayloadAction<{ user: OptionalUserModelType }>) => {
            const { user } = action.payload
            state.user = user
        },
        UpdateUserPhone: (state, action: PayloadAction<{ phoneInput: string }>) => {
            const { phoneInput } = action.payload
            state.user.phoneNumber = phoneInput
        }


    },
});

export const {

    DateBaleSetAction, UserSetAction, UpdateUserPhone
} = BaleDataSlice.actions
export default BaleDataSlice.reducer